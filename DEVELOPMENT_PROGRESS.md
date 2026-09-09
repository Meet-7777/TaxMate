# TAXMATE — 30 DAY DEVELOPMENT CHECKLIST

## 🟢 DAY 1 — FOUNDATION & SERVER SETUP
☑ Create TaxMate repository  
☑ Initialize Go module  
☑ Set up project structure  
☑ Install Chi  
☑ Install pgx  
☑ Install Redis  
☑ Install Zerolog  
☑ Install UUID  
☑ Install godotenv  
☑ Set up PostgreSQL  
☑ Create taxmate database  
☑ Create PostgreSQL user  
☑ Understand PostgreSQL roles  
☑ Set up Redis  
☑ Create .env  
☑ Build configuration loader  
☑ Understand os.Getenv  
☑ Understand config package  
☑ Set up Chi router  
☑ Create HTTP server  
☑ Create /health endpoint  
☑ Set up Zerolog  
☑ Connect PostgreSQL  
☑ Connect Redis  
☑ Verify server with curl  
**STATUS: 🟢 COMPLETE**

---

## 🟢 DAY 2 — DATABASE FOUNDATION
☑ Understand PostgreSQL connection pools  
☑ Implement pgxpool  
☑ Implement Redis client  
☑ Pass DB/Redis dependencies into server  
☑ Health check PostgreSQL  
☑ Health check Redis  
☑ Install migration system  
☑ Create first migration  
☑ Create users table  
☑ Add UUID primary key  
☑ Add email  
☑ Add password hash  
☑ Add email verification status  
☑ Add phone number  
☑ Add phone verification status  
☑ Add timestamps  
☑ Run migration  
☑ Understand constraints  
☑ Understand nullable database fields  
☑ Understand Go pointers for nullable values  
☑ Understand password hash storage  
☑ Understand salts  
☑ Understand B-tree indexes  
☑ Understand why PostgreSQL automatically created indexes for PK/UNIQUE constraints  
☑ Inspect indexes with \d users  
☑ Learn transactions practically (used in session Create/Rotate)  
☑ Clean up remaining database errors  
**STATUS: 🟢 COMPLETE**

---

## 🟢 DAY 3 — GO INTERFACES & ARCHITECTURE
☑ Learn Go interfaces  
☑ Understand implicit interface implementation  
☑ Create repository interface  
☑ Understand dependency injection  
☑ Understand pointer receivers  
☑ Understand value vs pointer  
☑ Understand Handler → Service → Repository  
☑ Understand why Service depends on interfaces  
☑ Keep architecture KISS  
☑ Avoid unnecessary abstractions  
☑ Finish practical interface exercises  
☑ Repository interface used (UserRepository, Session Repository)  
**STATUS: 🟢 COMPLETE**

---

## 🟢 DAY 4 — USER REGISTRATION
☑ Create User model  
☑ Create User repository  
☑ Create User service  
☑ Create signup handler  
☑ Create POST /auth/signup  
☑ Validate password length  
☑ Hash password  
☑ Store password hash  
☑ Store user in PostgreSQL  
☑ Return safe response  
☑ Never return password hash  
☑ Handle nullable phone number  
☑ Handle duplicate email  
☑ Understand errors.Is  
☑ Understand errors.As  
☑ Handle PostgreSQL error 23505  
☑ Return HTTP 409 for duplicate email  
☐ Better email validation (regex, disposable email checks)  
☐ Signup tests  
**STATUS: 🟢 95% COMPLETE**

---

## 🟢 DAY 5 — PASSWORD SECURITY
☑ Learn password hashing  
☑ Understand Argon2id  
☑ Implement Argon2id  
☑ Generate random salt  
☑ Store salt inside encoded password hash  
☑ Understand why separate salt column isn't necessary  
☑ Implement password verification  
☑ Understand constant-time comparison  
☑ Understand brute-force attacks  
☐ Password security tests  
☐ Login rate limiting (CRITICAL - see PRODUCTION_AUDIT.md)  
☐ Account abuse protection  
**STATUS: 🟢 90% COMPLETE**

---

## 🟢 DAY 6 — LOGIN
☑ Create POST /auth/login  
☑ Find user by email  
☑ Verify password  
☑ Handle invalid credentials  
☑ Return safe user response  
☑ Generate refresh token  
☑ Generate access token  
☑ Understand access vs refresh tokens  
☑ Create LoginResult  
☑ Return access token from service  
☑ Return refresh token from service  
☑ Set refresh token as HttpOnly cookie  
☑ Set access token as HttpOnly cookie  
☑ Understand cookie Path  
☑ Understand cookie MaxAge  
☑ Understand SameSite  
☑ Understand how http.SetCookie() creates Set-Cookie response headers  
☑ Test login cookies with curl  
☑ Fixed cookie path to /api/auth for refresh token  
☑ Device type defaulting (laptop for web)  
☐ Validate login request (email format)  
☐ Prevent account enumeration properly  
☐ Add Secure flag to cookies (CRITICAL for production)  
**STATUS: 🟢 95% COMPLETE**

---

## 🟢 DAY 7 — SESSIONS & REFRESH TOKENS
☑ Design session model  
☑ Create sessions migration  
☑ Create Session struct  
☑ Create Session repository  
☑ Create Create() repository method  
☑ Generate random refresh token  
☑ Hash refresh token before database storage  
☑ Store refresh-token hash instead of raw token  
☑ Generate session UUID  
☑ Link session → user using user_id  
☑ Store session expiration  
☑ Store session creation time  
☑ Store optional revoked_at  
☑ Create session during login  
☑ Understand that login creates a database session  
☑ Understand refresh-token cookie vs database hash  
☑ Implement FindByRefreshTokenHash  
☑ Implement refresh-token lookup  
☑ Check revoked sessions  
☑ Check expired sessions  
☑ Create POST /auth/refresh  
☑ Read refresh token from HttpOnly cookie  
☑ Validate refresh token against session  
☑ Generate a NEW access token during refresh  
☑ Set NEW access-token cookie during refresh  
☑ Refresh-token rotation (implemented in Rotate method)  
☑ Detect refresh-token reuse (via ErrSessionAlreadyRotated)  
☑ Logout (POST /auth/logout implemented)  
☑ Revoke session (logout clears cookies)  
☑ Multiple-device session handling (device_type column + revoke on new login)  
☑ Session family tracking (family_id for rotation chains)  
☑ RefreshCoordinator for concurrent refresh protection  
☐ Redis session support (optional, alternative to PostgreSQL-only)  
☐ Fix RefreshCoordinator memory leak (CRITICAL - see PRODUCTION_AUDIT.md)  
**STATUS: 🟢 95% COMPLETE**

---

## 🟢 DAY 8 — AUTHENTICATION MIDDLEWARE
☑ Extract access token from cookie  
☑ Validate access token  
☑ Check JWT signature  
☑ Check JWT expiration  
☑ Extract user ID from token claims  
☑ Add user ID to request context  
☑ Build authentication middleware  
☑ Create protected routes  
☑ Create GET /me  
☑ Understand context.Context practically  
☑ Test authenticated requests  
☑ Test expired access-token behavior  
☑ **ENHANCED:** Added session ID to JWT claims  
☑ **ENHANCED:** Middleware checks if session is still active in database  
☑ **ENHANCED:** Immediate logout when session revoked (no polling needed)  
☑ Create PATCH /me/profile for profile updates  
☑ Create POST /auth/change-password  
☐ Add database indexes for session queries (CRITICAL - see PRODUCTION_AUDIT.md)  
☐ Add Redis caching for IsSessionActive (recommended for scale)  

**Authentication Flow Now:**
```
Request  
   ↓  
Access Token (contains session_id)  
   ↓  
Valid JWT?  
 ┌─┴───────────────┐  
 │                 │  
YES               NO  
 │                 │  
 ↓                 ↓  
Check DB:       401 Unauthorized
Is session      
still active?   
 │  
 ├─ YES → Continue  
 └─ NO  → 401 (session revoked)  

On 401 → Frontend tries refresh  
         → If refresh token also revoked → logout toast
```

**STATUS: 🟢 COMPLETE**

---

## 🟢 DAY 8.5 — USER PROFILE & ONBOARDING *(NEW)*
☑ Add profile fields to users table (migration 006)  
☑ first_name, last_name, abn, work_type, needs_bas, profile_completed_at  
☑ Work type validation (uber, didi, freelancer, tradie, etc.)  
☑ UpdateProfile service method  
☑ PATCH /me/profile endpoint  
☑ Auto-set needs_bas based on work type  
☑ Frontend onboarding page (3-step stepper)  
☑ Frontend profile page (view/edit)  
☑ Protected routes allow incomplete profiles  
☑ OnboardingPrompt component (dismissible banner)  
☑ Dashboard greeting with first name  
☑ Time-aware greeting (Good morning/afternoon/evening)  
☑ Landing page positioning (widened from Uber-only to all ABN workers)  
☑ Landing page pricing (two tiers: $59 tax-only, $69 tax+BAS)  
☑ Documents list generalized (not Uber-specific)  
☑ Toast notification for "Logged in from another device"  
☑ Cross-tab sync via localStorage storage event  
**STATUS: 🟢 COMPLETE**

---

## 🟡 DAY 9 — EMAIL VERIFICATION
☐ Design verification flow  
☐ Generate secure verification token  
☐ Store token safely  
☐ Token expiration  
☐ One-time use  
☐ Verification endpoint  
☐ Mark email verified  
☐ Design email architecture  
**STATUS: 🔵 NOT STARTED**

---

## 🟡 DAY 10 — AWS EMAIL
☐ Learn AWS SES  
☐ Configure SES  
☐ Verify domain  
☐ Send verification email  
☐ Send password-reset email  
☐ Email templates  
☐ Handle email failures  
☐ Avoid blocking API requests unnecessarily  
**STATUS: 🔵 NOT STARTED**

---

## 🟡 DAY 11 — FORGOT / RESET PASSWORD
☐ Forgot-password endpoint  
☐ Secure reset token  
☐ Token expiration  
☐ One-time reset  
☐ Reset password  
☐ Invalidate existing sessions  
☐ Prevent account enumeration  
**STATUS: 🔵 NOT STARTED**

---

## 🟡 DAY 12 — PHONE VERIFICATION
☐ Australian phone-number normalization  
☐ Generate OTP  
☐ Store OTP safely in Redis  
☐ OTP expiration  
☐ Maximum attempts  
☐ Resend limits  
☐ Phone verification endpoint  
☐ Prevent OTP abuse  
**STATUS: 🔵 NOT STARTED**

---

## 🟡 DAY 13 — RATE LIMITING & ABUSE PROTECTION
☐ Redis rate limiter  
☐ Signup rate limit  
☐ Login rate limit  
☐ OTP rate limit  
☐ Password-reset rate limit  
☐ IP-based limits  
☐ Phone-based limits  
☐ Distributed rate-limiting concepts  
**⚠️ CRITICAL PRIORITY - See PRODUCTION_AUDIT.md**  
**STATUS: 🔵 NOT STARTED**

---

## 🟡 DAY 14 — PASSKEYS / WEBAUTHN
☐ Learn WebAuthn  
☐ Public/private key authentication  
☐ Challenges  
☐ Registration ceremony  
☐ Authentication ceremony  
☐ Store WebAuthn credentials  
☐ Passkey login  
☐ Phishing resistance  
**STATUS: 🔵 NOT STARTED**

---

## 🔵 DAY 15 — GO CONCURRENCY
☑ Goroutines (used in background processes)  
☑ Channels (conceptually understood)  
☐ Buffered channels  
☐ Unbuffered channels  
☐ select  
☑ Mutex (used in RefreshCoordinator)  
☐ RWMutex  
☑ Race conditions (understood, RefreshCoordinator protects against)  
☐ sync.WaitGroup  
☐ Worker pools  
☐ Context cancellation  
**STATUS: 🟡 40% COMPLETE**

---

## 🔵 DAY 16 — KAFKA / MESSAGING
☐ Understand why Kafka exists  
☐ Topics  
☐ Partitions  
☐ Producers  
☐ Consumers  
☐ Consumer groups  
☐ Offsets  
☐ Ordering  
☐ At-least-once delivery  
☐ Idempotency  
☐ Kafka partition rebalancing  
**STATUS: 🔵 NOT STARTED**

---

## 🔵 DAY 17 — BACKGROUND WORKERS
☐ Build Go worker  
☐ Graceful shutdown  
☐ Context cancellation  
☐ Worker pool  
☐ Retry logic  
☐ Dead-letter strategy  
☐ Idempotent jobs  
☐ Background email worker  
**STATUS: 🔵 NOT STARTED**

---

## 🔵 DAY 18 — DOCUMENT STORAGE
☐ Validate file type  
☐ Validate file size  
☐ Generate object key  
☐ AWS S3 integration  
☐ Private buckets  
☐ Pre-signed URLs  
☐ Document metadata in PostgreSQL  
☐ Never expose S3 bucket publicly  
**STATUS: 🔵 NOT STARTED**

---

## 🔵 DAY 19 — TAX DOCUMENTS
☐ Income documents  
☐ Expense receipts  
☐ Vehicle-related records  
☐ Work-related expenses  
☐ Bank statements  
☐ ABN information  
☐ GST information  
☐ Previous tax returns  
☐ Other supporting documents  
AI processing remains OFF for MVP.  
**STATUS: 🔵 NOT STARTED**

---

## 🔵 DAY 20 — AUSTRALIAN ABN / GST WORKFLOW
☐ Understand ABN verification  
☐ Understand GST registration  
☐ Understand individual sole traders  
☐ Design manual onboarding  
☐ Upload ABN evidence  
☐ Store business/tax information  
☐ Verification workflow  
☐ Accountant review state  
**STATUS: 🔵 NOT STARTED**

---

## 🔵 DAY 21 — EXPENSES & TAX DATA
☐ Expense model  
☐ Income model  
☐ Financial year  
☐ Expense categories  
☐ Business-use percentage  
☐ Supporting documents  
☐ Accountant review  
☐ Audit trail  
**STATUS: 🔵 NOT STARTED**

---

## 🟣 DAY 22 — ACCOUNTANT WORKFLOW
☐ Accountant users  
☐ Roles  
☐ Permissions  
☐ Client assignment  
☐ Review queue  
☐ Document review  
☐ Expense approval  
☐ Comments  
☐ Status tracking  
**STATUS: 🔵 NOT STARTED**

---

## 🟣 DAY 23 — AUDIT & SECURITY
☐ Audit log  
☐ Login history  
☐ Session history  
☐ Document access logging  
☐ Accountant actions  
☐ Sensitive-data handling  
☐ Encryption strategy  
☐ Secrets management  
☐ AWS IAM basics  
**STATUS: 🔵 NOT STARTED**

---

## 🟣 DAY 24 — TAX RETURN WORKFLOW
☐ Tax-return status  
☐ Review status  
☐ Accountant approval  
☐ Lodgement status  
☐ Supporting documents  
☐ Audit trail  
**STATUS: 🔵 NOT STARTED**

---

## 🟣 DAY 25 — RELIABILITY
☐ Graceful shutdown  
☐ Request timeouts (CRITICAL - see PRODUCTION_AUDIT.md)  
☐ DB timeouts  
☐ Redis timeouts  
☐ Retry strategies  
☐ Idempotency  
☑ Health checks (/health endpoint exists)  
☐ Readiness checks  
☐ Liveness checks  
☐ Connection-failure handling  
**STATUS: 🟡 15% COMPLETE**

---

## 🟣 DAY 26 — TESTING
☐ Unit tests  
☐ Repository tests  
☐ Service tests  
☐ Handler tests  
☐ Integration tests  
☐ PostgreSQL test database  
☐ Redis tests  
☐ Authentication tests  
☐ Race detector  
☐ Load-testing basics  
**STATUS: 🔵 NOT STARTED**

---

## 🟣 DAY 27 — OBSERVABILITY
☑ Structured logging (Zerolog setup exists)  
☐ Request IDs  
☑ Error logging (debug statements removed, needs full structured logging)  
☐ Metrics  
☐ Latency tracking  
☐ Database metrics  
☐ Redis metrics  
☐ Kafka metrics  
☐ Monitoring strategy  
☐ Distributed-tracing concepts  
**STATUS: 🟡 25% COMPLETE**

---

## 🔴 DAY 28 — DATABASE SCALABILITY
☑ Understand database bottlenecks  
☑ Indexing strategy (conceptual, needs implementation)  
☐ Composite indexes (CRITICAL - see PRODUCTION_AUDIT.md)  
☐ Query planning  
☐ EXPLAIN / EXPLAIN ANALYZE  
☑ Connection pooling (pgxpool implemented)  
☐ Read replicas  
☐ Primary vs replica  
☐ Replication basics  
☐ Replication lag  
☐ Failover concepts  
☐ Database partitioning  
☐ Range partitioning  
☐ List partitioning  
☐ Hash partitioning  
☐ When partitioning actually helps  
☐ Vertical scaling  
☐ Horizontal scaling  
☐ Database sharding  
☐ Shard keys  
☐ Hash-based sharding  
☐ Consistent hashing  
☐ Virtual nodes  
☐ Node failure  
☐ Adding nodes  
☐ Data rebalancing  
☐ Hot partitions / hot shards  
☐ Cross-shard queries  
☐ Distributed transactions  
**STATUS: 🟡 25% COMPLETE**

---

## 🔴 DAY 29 — PRODUCTION INFRASTRUCTURE & DISTRIBUTED SYSTEMS
☐ Docker  
☐ Docker Compose  
☐ AWS architecture  
☐ RDS PostgreSQL  
☐ ElastiCache Redis  
☐ S3  
☐ SES  
☐ Secrets Manager  
☐ IAM  
☐ Load balancer  
☐ Nginx  
☐ Envoy  
☐ Reverse proxy concepts  
☑ Stateless API (architecture is stateless)  
☐ Horizontal API scaling  
☐ Load balancing algorithms  
☐ Health-based routing  
☐ Redis caching (RECOMMENDED - see PRODUCTION_AUDIT.md)  
☐ Queue-based processing  
☐ Kafka scaling  
☐ Kafka partitioning  
☐ Kafka consumer groups  
☐ Service discovery concepts  
☐ Distributed-system failure modes  
**STATUS: 🟡 10% COMPLETE**

---

## 🔴 DAY 30 — FULL END-TO-END TEST
☑ Signup  
☐ Email verification  
☐ Phone verification  
☑ Login  
☑ Access token  
☑ Refresh token  
☑ Session  
☑ Access-token expiration  
☑ Automatic refresh  
☑ Logout  
☑ Protected route  
☐ Upload document  
☐ S3 storage  
☐ Database metadata  
☐ Background processing  
☐ Accountant review  
☐ Tax-data preparation  
☐ Accountant/CPA approval  
☐ Lodgement workflow  
☐ Security review (PRODUCTION_AUDIT.md created)  
☑ Database review (schema designed, needs indexes)  
☑ Concurrency review (RefreshCoordinator, needs fixes)  
☐ Scalability review  
☐ Partitioning review  
☐ Sharding review  
☐ Load-balancing review  
☐ Nginx/Envoy review  
☑ Error-handling review (mostly complete)  
☑ Logging review (Zerolog setup, needs consistency)  
☐ Deployment review  
**STATUS: 🟡 40% COMPLETE**

---

## 📌 CURRENT STATUS SUMMARY

### 🎨 UI/UX Features Complete:

**🔐 Authentication Flow:**
- Clean login form with email/password validation
- Signup with password confirmation and terms checkbox  
- Change password with current/new validation
- "Remember me" functionality with persistent sessions
- Automatic logout with toast notification on token expiry

**👤 User Profile & Onboarding:**
- 3-step onboarding wizard (Personal Info → Work Details → Preferences)
- Profile view/edit page with ABN validation
- Work type selection (Uber, DiDi, Freelancer, Tradie, Student, etc.)
- BAS requirement auto-detection based on work type
- Dismissible onboarding banner on dashboard

**🏠 Dashboard & Navigation:**
- Time-aware personalized greeting ("Good morning, John!")
- Clean dashboard layout with onboarding prompt
- Protected route system with automatic redirects
- Responsive navigation suitable for mobile/desktop

**🎯 Landing & Marketing:**
- Professional hero section with value proposition
- Clear pricing tiers: $59 (tax-only) vs $69 (tax+BAS)
- Generalized copy for all ABN workers (not just Uber)
- Mobile-responsive marketing layout

**⚡ Technical UI Features:**
- Real-time form validation with Zod schemas
- Loading states with button spinners
- Toast notifications for success/error states
- Cross-tab authentication sync via localStorage
- Automatic token refresh with Axios interceptors
- Error boundaries with user-friendly fallbacks
- Consistent TaxMate branding and color scheme

---

### Completed Sections:
- **DAY 1** — 🟢 100% COMPLETE (Foundation)
- **DAY 2** — 🟢 100% COMPLETE (Database)
- **DAY 3** — 🟢 100% COMPLETE (Interfaces)
- **DAY 4** — 🟢 95% COMPLETE (Signup)
- **DAY 5** — 🟢 90% COMPLETE (Password Security)
- **DAY 6** — 🟢 95% COMPLETE (Login)
- **DAY 7** — 🟢 95% COMPLETE (Sessions & Refresh)
- **DAY 8** — 🟢 100% COMPLETE (Auth Middleware - ENHANCED)
- **DAY 8.5** — 🟢 100% COMPLETE (Profile & Onboarding)

### Frontend Complete:
☑ **React + TypeScript + Vite** setup with hot reload  
☑ **TailwindCSS + shadcn/ui** components (Button, Card, Input, Label)  
☑ **Authentication context** with cross-tab sync via localStorage  
☑ **Login page** - Email/password with validation + "Remember me" checkbox  
☑ **Signup page** - Email/password with confirmation + terms acceptance  
☑ **Change Password page** - Current/new password validation  
☑ **Onboarding flow** - 3-step stepper (Personal → Work → Preferences)  
☑ **Profile page** - View/edit with first name, last name, ABN, work type  
☑ **Protected routes** - Automatic redirect to login if unauthenticated  
☑ **Dashboard** - Personalized greeting with time awareness + onboarding prompt  
☑ **Landing page** - Marketing copy, pricing tiers ($59/$69), hero section  
☑ **Toast notifications** (Sonner) - Error handling + "Logged in from another device"  
☑ **Axios interceptor** - Automatic token refresh on 401 responses  
☑ **Form validation** - React Hook Form + Zod schemas with inline errors  
☑ **Responsive design** - Mobile-friendly layout across all pages  
☑ **TaxMate branding** - Custom logo component + consistent color scheme  
☑ **Loading states** - Button spinners and form submission feedback  
☑ **Error boundaries** - Graceful error handling with user-friendly messages  

---

## 🚨 CRITICAL ISSUES TO FIX (Before Production)

From `PRODUCTION_AUDIT.md`:

1. **🔴 CRITICAL: No rate limiting** → Add httprate middleware
2. **🔴 CRITICAL: RefreshCoordinator memory leak** → Add cleanup goroutine
3. **🔴 CRITICAL: Missing Secure flag on cookies** → Set `Secure: true` in production
4. **🔴 CRITICAL: Missing database indexes** → Add indexes on sessions table
5. **🟡 HIGH: No Redis caching for session checks** → Reduce DB load at scale
6. **🟡 HIGH: No CORS configuration** → Add cors middleware
7. **🟡 HIGH: No request timeouts** → Add to http.Server
8. ~~**🟢 LOW: Debug print statement in production**~~ → ✅ FIXED (removed fmt.Printf)

---

## 🚀 IMMEDIATE NEXT STEPS

### Production Hardening (1-2 days):
1. Fix RefreshCoordinator memory leak
2. Add rate limiting middleware
3. Add database indexes
4. Set Secure cookie flag for production
5. Add CORS configuration
6. Add HTTP server timeouts

### Optional Performance (can deploy without):
7. Add Redis caching for IsSessionActive
8. Add cleanup job for expired sessions

### Future Features:
- Email verification (DAY 9-10)
- Phone verification (DAY 12)
- Document upload (DAY 18-19)
- Accountant workflow (DAY 22-24)

---

## 📊 Overall Progress: **~35% Complete**

**Core Authentication:** ✅ Complete  
**User Profiles:** ✅ Complete  
**Frontend:** ✅ Complete  
**Production Ready:** ❌ Needs hardening (see PRODUCTION_AUDIT.md)  
**Document Management:** 🔵 Not started  
**Tax Workflow:** 🔵 Not started  
**Scalability:** 🟡 Partially understood, needs implementation  

---

## 📝 Notes

- **Session tracking is production-grade** - Enhanced beyond initial spec with session ID in JWT
- **Frontend-backend integration complete** - Full auth flow working
- **Cross-device logout works** - Session revocation implemented correctly
- **Security audit complete** - Critical issues identified and documented
- **Code cleanup done** - Debug statements removed, error handling improved
- **Project restructured** - Clean separation: client/ (React) + server/ (Go) + root docs
- **Ready for beta testing** - After fixing 4 remaining critical production issues (down from 5)

**Next milestone:** Production hardening → Beta launch → Document upload → Tax workflow
