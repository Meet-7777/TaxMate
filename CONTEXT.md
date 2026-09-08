# TaxMate Server — Backend Context

Update this file whenever you add a route, migration, or meaningful package.
This is the first file to read before touching any backend code.

---

## Architecture Overview

```
cmd/api/main.go          wire deps → start HTTP server
config/config.go         env vars → typed Config struct
internal/
  auth/
    handler.go           HTTP decode/encode only
    service.go           all business logic + validation
  email/
    mailer.go            Mailer interface
    stub.go              StubMailer — logs to stdout, used in dev
  health/handler.go      GET /health — postgres + redis ping
  middleware/auth.go     JWT cookie → userID in context
  password_reset/
    repository.go        DB CRUD for password_reset_tokens table
  server/server.go       chi router — all routes registered here
  session/
    repository.go        DB CRUD for sessions table
    refresh_coordinator.go  in-memory mutex to deduplicate concurrent refreshes
    session.go           Session model + DeviceType
  user/repository.go     DB CRUD for users table
pkg/
  crypto/
    password.go          argon2id hash + verify
    token.go             GenerateToken (32 random bytes, base64url) + HashToken (SHA-256)
  token/
    access.go            CreateAccessToken (HS256 JWT, 15min)
    jwt.go               VerifyAccessToken
migrations/              numbered SQL files, up + down
```

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| email | TEXT UNIQUE NOT NULL | |
| password_hash | TEXT | argon2id encoded |
| phone_number | TEXT UNIQUE | nullable |
| email_verified | BOOLEAN | default false |
| phone_verified | BOOLEAN | default false |
| created_at | TIMESTAMPTZ | default NOW() |
| updated_at | TIMESTAMPTZ | default NOW() |

### `sessions`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | also initial family_id |
| user_id | UUID FK → users | |
| refresh_token_hash | TEXT NOT NULL | SHA-256 of raw token |
| family_id | UUID NOT NULL | links all rotated sessions |
| replaced_by | UUID | nullable, points to next session |
| device_type | TEXT | `mobile` or `laptop` |
| expires_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| rotated_at | TIMESTAMPTZ | nullable |
| revoked_at | TIMESTAMPTZ | null = active |

Unique partial index: `(user_id, device_type) WHERE revoked_at IS NULL` — max 1 active session per device type per user.

### `email_verification_tokens`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users CASCADE | |
| token_hash | TEXT UNIQUE NOT NULL | |
| expires_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | default NOW() |
| used_at | TIMESTAMPTZ | null = unused |

### `password_reset_tokens` ✅ added migration 006
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users CASCADE | |
| token_hash | TEXT UNIQUE NOT NULL | SHA-256 of raw token |
| expires_at | TIMESTAMPTZ | 1 hour from creation |
| created_at | TIMESTAMPTZ | default NOW() |
| used_at | TIMESTAMPTZ | null = unused |

---

## Migrations

| # | File | What it does |
|---|---|---|
| 001 | create_users | users table |
| 002 | create_sessions | sessions table |
| 003 | add_refresh_token_rotation | replaced_by, rotated_at columns on sessions |
| 004 | add_device_type_to_sessions | device_type column + check constraint + unique partial index |
| 005 | create_email_verification_tokens | email_verification_tokens table |
| 006 | create_password_reset_tokens | password_reset_tokens table ✅ |

---

## API Endpoints

### Public

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Postgres + Redis ping |
| POST | `/auth/signup` | Create account. Returns `{id, email}`. No cookies set. |
| POST | `/auth/login` | Authenticate. Sets `access_token` + `refresh_token` cookies. `device_type` required: `mobile` or `laptop`. |
| POST | `/auth/refresh` | Rotate tokens using `refresh_token` cookie. No body. |
| POST | `/auth/forgot-password` | Request a password reset. Accepts `{email}`. Always 200 (no email enumeration). |
| POST | `/auth/reset-password` | Reset password. Accepts `{token, password}`. Token from email link. |

### Protected (requires `access_token` cookie)

| Method | Path | Description |
|---|---|---|
| GET | `/me` | Returns `{id}` of the authenticated user. |

---

## Auth Flow

### Tokens
- **Access token**: HS256 JWT, 15 min lifetime, stored in `access_token` HttpOnly cookie (path `/`).
- **Refresh token**: 32 random bytes base64url, 7 day lifetime, stored SHA-256 hashed in DB, `refresh_token` HttpOnly cookie (path `/auth`).
- **Password reset token**: 32 random bytes base64url, 1 hour lifetime, stored SHA-256 hashed in DB, sent via email as a URL query param.

### Refresh / Token Rotation
1. Read `refresh_token` cookie.
2. Lock per-token-hash mutex (prevents concurrent rotation races).
3. Check in-memory grace cache (5s window handles mobile duplicate requests).
4. Lookup session by hash in DB.
5. Reject if `revoked_at IS NOT NULL` or expired.
6. In a transaction: mark old session revoked + `replaced_by`, insert new session.
7. If old session already has `replaced_by` set → reuse detection → reject 401.
8. Set new cookies.

### Password Reset Flow
1. `POST /auth/forgot-password {email}` — look up user, generate token, store SHA-256 hash in DB, send email with reset link `<frontendURL>/reset-password?token=<raw>`. Always respond 200.
2. `POST /auth/reset-password {token, password}` — hash token, look up in DB, validate not used + not expired, update user's password_hash, mark token used_at. Respond 200.

---

## Package Notes

### `pkg/crypto`
- `GenerateToken()` → 32 random bytes, base64url. Use for refresh tokens, password reset tokens, email verification tokens.
- `HashToken(t)` → SHA-256, base64url. Always store this, never the raw token.
- `HashPassword(p)` → argon2id encoded string.
- `VerifyPassword(p, hash)` → constant-time compare.

### `pkg/token`
- `CreateAccessToken(userID)` → signed HS256 JWT, 15 min exp.
- `VerifyAccessToken(tokenString)` → returns UUID or error.

### `internal/email`
- `Mailer` interface: `SendPasswordReset(ctx, toEmail, resetURL string) error`
- `StubMailer`: logs the reset URL to stdout. Used unless `SMTP_HOST` is set.
- Real SMTP implementation: **not yet built** — see Remaining section below.

---

## Config (env vars)

| Var | Required | Notes |
|---|---|---|
| PORT | yes | e.g. `8080` |
| DATABASE_URL | yes | postgres connection string |
| REDIS_URL | yes | redis connection string |
| FRONTEND_URL | yes | used to build password reset links, e.g. `http://localhost:5173` |
| SMTP_HOST | no | if absent, StubMailer is used |
| SMTP_PORT | no | default 587 |
| SMTP_USER | no | |
| SMTP_PASS | no | |
| SMTP_FROM | no | from address in emails |
| JWT_SECRET | no | if absent, falls back to hardcoded dev secret (change in prod!) |

---

## What Is Built ✅

- [x] Postgres + Redis connection + health check
- [x] User signup (argon2id password hash)
- [x] User login (device_type enforced, HttpOnly cookies)
- [x] Token rotation (refresh with reuse detection, family revocation ready)
- [x] JWT auth middleware
- [x] GET /me (protected)
- [x] Forgot password — POST /auth/forgot-password
- [x] Reset password — POST /auth/reset-password
- [x] password_reset_tokens migration (006)
- [x] email.Mailer interface + StubMailer
- [x] FRONTEND_URL config for building reset links
- [x] CLAUDE.md — backend coding principles
- [x] CONTEXT.md — this file

---

## What Is Remaining ❌

- [ ] **Real SMTP mailer** — `internal/email/smtp.go`. StubMailer logs to stdout for now.
- [ ] **Email verification** — table exists (migration 005), no handler/service written yet. Needed before gating login on `email_verified`.
- [ ] **Logout endpoint** — `RevokeFamily` exists in session repo but no route. Needed for "sign out all devices".
- [ ] **MPIN** — `internal/mpin/` empty. Planned second factor for mobile.
- [ ] **Passkey / WebAuthn** — `internal/passkey/` empty.
- [ ] **Phone number verification** — field exists on user, no flow built.
- [ ] **Rate limiting** — no rate limiting on auth endpoints. Add chi middleware before go-live.
- [ ] **CORS** — no CORS headers. Add before deploying frontend to a different origin.
- [ ] **JWT secret from env** — currently hardcoded in `pkg/token/access.go`. Must be moved to config before production.
