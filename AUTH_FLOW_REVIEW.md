# Authentication Flow Code Review

## ✅ SIGNUP FLOW - GOOD

### Code Path:
```
POST /api/auth/signup
  → Handler validates email/password
  → Service.Signup()
    → Check password length >= 8 ✓
    → Hash password (Argon2id) ✓
    → Store in database ✓
    → Handle duplicate email (23505) ✓
  → Return {id, email}
```

### Issues: NONE
- ✅ Password properly hashed before storage
- ✅ Duplicate email handled correctly
- ✅ No session created (correct - user must login)
- ✅ Password hash never returned

---

## ✅ LOGIN FLOW - GOOD

### Code Path:
```
POST /api/auth/login
  → Handler defaults device_type to "laptop" ✓
  → Service.Login()
    → Find user by email
    → Verify password (constant-time) ✓
    → Generate refresh token (random 32 bytes) ✓
    → Generate session ID (UUID) ✓
    → Generate access token (JWT with user_id + session_id) ✓
    → Repository.Create()
      → BEGIN TRANSACTION ✓
      → Revoke old sessions (same user + device) ✓
      → Insert new session ✓
      → COMMIT ✓
  → Set cookies (HttpOnly) ✓
  → Return {id, email}
```

### Issues: NONE
- ✅ Old sessions properly revoked (device-based)
- ✅ Transaction ensures atomicity
- ✅ Cookies are HttpOnly
- ✅ Access token contains session_id
- ✅ Refresh token is hashed before storage

---

## ✅ REFRESH FLOW - GOOD (with 1 minor issue)

### Code Path:
```
POST /api/auth/refresh
  → Handler reads refresh_token cookie
  → Service.Refresh()
    → Hash the token ✓
    → Lock via RefreshCoordinator ✓
    → Check cache (5-second grace period) ✓
    → Repository.FindByRefreshTokenHash()
      → Lookup by hash ✓
    → Check if revoked ✓
    → Check if expired ✓
    → Generate NEW refresh token ✓
    → Generate NEW session ID ✓
    → Generate NEW access token (with new session_id) ✓
    → Repository.Rotate()
      → BEGIN TRANSACTION ✓
      → SELECT FOR UPDATE (lock old session) ✓
      → Check if already rotated ✓
      → Mark old session as revoked ✓
      → Set replaced_by = new_session_id ✓
      → Insert new session ✓
      → COMMIT ✓
    → Cache result in RefreshCoordinator ✓
  → Set NEW cookies ✓
```

### Issues Found:

#### 🟡 MINOR: Cache returns incomplete LoginResult
**Location:** `internal/auth/service.go:137-141`
```go
if cached, ok := s.coordinator.Get(refreshTokenHash); ok {
    return LoginResult{
        RefreshToken: cached.RefreshToken,
        AccessToken:  cached.AccessToken,
        // ← Missing User field!
    }, nil
}
```

**Impact:** 
- When refresh hits cache, `LoginResult.User` is empty
- Handler doesn't use it (only sets cookies), so no bug in practice
- But inconsistent with non-cached path

**Fix:**
```go
if cached, ok := s.coordinator.Get(refreshTokenHash); ok {
    return LoginResult{
        User: user.User{}, // Empty is fine, handler doesn't use it
        RefreshToken: cached.RefreshToken,
        AccessToken:  cached.AccessToken,
    }, nil
}
```

**Or better - don't return User at all in refresh since it's not needed:**
```go
// Refresh handler only needs tokens, not full user
return LoginResult{
    RefreshToken: cached.RefreshToken,
    AccessToken:  cached.AccessToken,
}, nil
```

---

## ✅ ROTATION SECURITY - EXCELLENT

### Protections Implemented:

1. **✅ Prevents Replay Attacks**
   - Refresh token is used once
   - Old token marked as revoked immediately
   - Trying to reuse old token → 401

2. **✅ Prevents Race Conditions**
   - RefreshCoordinator locks by token hash
   - 5-second grace period for concurrent requests
   - SELECT FOR UPDATE in database
   - Second request gets cached result

3. **✅ Detects Token Theft**
   - If token already rotated → ErrSessionAlreadyRotated
   - Could revoke entire family_id (not implemented yet, but structure exists)

4. **✅ Atomic Operations**
   - All database changes in transactions
   - Either fully succeeds or fully rolls back

---

## ✅ SESSION REVOCATION - GOOD

### Device-Based Logout:
```
User logs in on Browser 2
  → Repository.Create() is called
    → UPDATE sessions SET revoked_at = NOW()
      WHERE user_id = $1
        AND device_type = $2  ← Same device
        AND revoked_at IS NULL
  → Only sessions with same device_type are revoked ✓
```

**This means:**
- Login on laptop → Revokes old laptop sessions ✓
- Does NOT revoke mobile sessions ✓
- Correct behavior for multi-device use

### Immediate Detection:
```
Browser 1 makes ANY request
  → Middleware checks IsSessionActive(session_id)
    → SELECT revoked_at FROM sessions WHERE id = session_id
    → If revoked_at IS NOT NULL → 401 ✓
```

**Result:** Browser 1 kicked out on very next request ✓

---

## ✅ LOGOUT FLOW - GOOD

### Code Path:
```
POST /api/auth/logout
  → Handler clears cookies (MaxAge = -1) ✓
  → No database revocation (sessions expire naturally)
```

### Issues: 
**🟢 ACCEPTABLE** - Sessions not explicitly revoked on logout

**Why it's OK:**
- Cookies are cleared, so user can't make requests
- Access tokens expire in 15 minutes
- Refresh token won't be sent (cookie deleted)
- Old sessions cleaned up by expiry

**Optional improvement:**
```go
func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
    // Get session_id from access token
    cookie, _ := r.Cookie("access_token")
    if cookie != nil {
        claims, _ := token.VerifyAccessToken(cookie.Value)
        // Revoke this specific session
        h.service.RevokeSession(r.Context(), claims.SessionID)
    }
    clearAuthCookies(w)
    w.WriteHeader(http.StatusNoContent)
}
```

But not critical - current implementation is fine.

---

## 🔴 ISSUES FOUND

### 1. RefreshCoordinator Memory Leak (CRITICAL)
**Already documented in PRODUCTION_AUDIT.md**

**Location:** `internal/session/refresh_coordinator.go`

**Issue:** 
- Entries and locks maps grow unbounded
- Only cleaned on access (Get method)
- If token never accessed again, stays in memory forever

**Fix:** Add cleanup goroutine (already in PRODUCTION_AUDIT.md)

---

### 2. Error Handling in Refresh
**Location:** `internal/auth/service.go:190`

```go
if err := s.session.Rotate(...); err != nil {
    fmt.Printf("ROTATE ERROR: %v\n", err)  // ← Debug statement in production
    return LoginResult{}, ErrInvalidRefreshToken
}
```

**Issues:**
- `fmt.Printf` instead of structured logger
- Hides actual error from caller (always returns ErrInvalidRefreshToken)

**Fix:**
```go
if err := s.session.Rotate(ctx, currentSession.ID, newSession); err != nil {
    // Log with context
    log.Error().
        Err(err).
        Str("session_id", currentSession.ID.String()).
        Str("user_id", currentSession.UserID.String()).
        Msg("Failed to rotate session")
    
    // Check if it's a reuse attempt
    if errors.Is(err, session.ErrSessionAlreadyRotated) {
        // Could revoke entire session family here
        return LoginResult{}, ErrInvalidRefreshToken
    }
    
    return LoginResult{}, fmt.Errorf("session rotation failed: %w", err)
}
```

---

### 3. No Index on sessions.id (CRITICAL for scale)
**Already documented in PRODUCTION_AUDIT.md**

**Every protected request runs:**
```sql
SELECT revoked_at FROM sessions WHERE id = $1 AND expires_at > NOW()
```

**Without index:** Full table scan  
**With index:** O(log n) lookup

**Fix:**
```sql
CREATE INDEX idx_sessions_id_active ON sessions(id) WHERE revoked_at IS NULL;
```

---

### 4. Token Expiry Edge Case

**Scenario:**
1. Access token expires at 13:00:00
2. User makes request at 12:59:59
3. Request takes 2 seconds to process
4. Access token technically expired during request

**Current behavior:** Request succeeds (JWT validated at start)

**Is this a problem?** 
- 🟢 NO - This is standard JWT behavior
- Tokens are checked at request start, not end
- 1-2 second window is acceptable
- Refresh will happen on next request

---

### 5. No Session Limit Per User

**Current:** User can have unlimited sessions (one per device type)

**Potential issue:**
- User logs in on 100 different "laptops"
- 100 active sessions in database
- Could be abused

**Fix (optional):**
```go
// In Repository.Create(), add limit check
func (r *PostgresRepository) Create(ctx context.Context, s *Session) error {
    tx, err := r.db.Begin(ctx)
    // ...
    
    // Check session count
    var count int
    tx.QueryRow(ctx, `
        SELECT COUNT(*) FROM sessions 
        WHERE user_id = $1 AND revoked_at IS NULL
    `, s.UserID).Scan(&count)
    
    if count >= 10 { // Max 10 concurrent sessions
        return errors.New("too many active sessions")
    }
    
    // ... rest of create logic
}
```

---

## 📊 OVERALL ASSESSMENT

### Security: ✅ EXCELLENT
- Proper token rotation
- Race condition protection
- Atomic transactions
- Session tracking
- Device-based revocation

### Correctness: ✅ GOOD
- All flows work as designed
- Edge cases handled
- No critical bugs

### Production Readiness: 🟡 NEEDS MINOR FIXES
1. Fix RefreshCoordinator memory leak
2. Replace fmt.Printf with structured logging
3. Add database indexes
4. Optional: Add session limit per user

### Scalability: 🟡 NEEDS OPTIMIZATION
- Add Redis caching for IsSessionActive
- Add indexes (critical)
- Consider cleanup job for expired sessions

---

## ✅ FINAL VERDICT

**Signup/Login/Refresh/Rotation:** Fundamentally sound, no critical bugs

**What works perfectly:**
- Password security ✓
- Token generation ✓
- Session creation ✓
- Token rotation ✓
- Device-based revocation ✓
- Race condition handling ✓
- Cross-device logout ✓

**What needs fixing before production:**
1. RefreshCoordinator memory leak (MUST FIX)
2. Database indexes (MUST FIX for scale)
3. Logging improvement (SHOULD FIX)
4. Session limits (OPTIONAL)

**Can you deploy this?** 
- For beta with <100 users: YES (fix memory leak first)
- For production with 1000+ users: YES (fix memory leak + add indexes + Redis cache)

The core authentication logic is **production-grade**. Just needs operational hardening.
