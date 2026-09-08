# TaxMate Server — Backend Coding Principles

## Language & Runtime
- Go 1.26+. Standard library first — add a dependency only when the stdlib genuinely cannot do the job.
- All new packages go under `internal/` (not exported) or `pkg/` (shared utilities with no business logic).
- Module path: `github.com/Meet-7777/taxmate-server`

---

## Project Layout

```
cmd/api/          — main.go only. Wire dependencies, start server. No logic here.
config/           — Load env vars into a typed Config struct. No defaults that hide mistakes.
internal/
  auth/           — handler.go (HTTP), service.go (business logic)
  database/       — postgres.go, redis.go connection setup
  email/          — Mailer interface + implementations (SMTP, stub)
  health/         — GET /health handler
  middleware/     — HTTP middleware (auth JWT check)
  server/         — chi router wiring
  session/        — session model, repository, refresh coordinator
  user/           — user model, repository
pkg/
  crypto/         — password hashing (argon2id), token generation + hashing (SHA-256)
  token/          — JWT create + verify
migrations/       — numbered SQL files (up + down)
```

---

## Code Rules

### General
- Every exported function and type gets a one-line comment. No walls of text.
- Errors are values. Wrap with `fmt.Errorf("...: %w", err)` so callers can use `errors.Is`.
- Define sentinel errors as package-level `var Err... = errors.New(...)` — never return raw strings.
- No `panic` in production paths. Only in `main` for unrecoverable startup failures.
- No global mutable state outside of `main`. Pass dependencies explicitly.

### HTTP Handlers
- Handlers only: decode request → call service → encode response. No business logic.
- Use `http.Error(w, msg, code)` for error responses. Keep messages lowercase, no trailing period.
- Always set `Content-Type: application/json` before writing a JSON body.
- Validate request fields in the handler (empty check) before calling the service.
- Return the right status codes: 201 for resource creation, 200 for success, 400 bad input, 401 unauth, 409 conflict, 500 internal.

### Services
- Services own all business logic and validation (e.g., password length).
- Services never touch `http.ResponseWriter` or `*http.Request`.
- Services depend on repository interfaces, not concrete types — testable without a real DB.

### Repositories
- Repositories only do DB I/O. No business logic.
- Always use parameterized queries. Never interpolate user input into SQL strings.
- Use transactions for multi-step writes. Always `defer tx.Rollback(ctx)` and call `tx.Commit(ctx)` explicitly on success.
- Scan all columns you SELECT. If the query changes, update the Scan call to match.

### Security
- Passwords: argon2id via `pkg/crypto.HashPassword`. Never store plaintext or use bcrypt/MD5.
- Tokens (refresh, password reset, email verification): 32 random bytes, base64url encoded via `pkg/crypto.GenerateToken`. Always store the SHA-256 hash via `pkg/crypto.HashToken`, never the raw token.
- JWTs: HS256 only. Verify signing method in the key function — reject anything else.
- Cookies: HttpOnly, SameSite=Lax. Scope sensitive cookies to the narrowest path possible.
- Never log raw tokens, passwords, or PII. Log user IDs only.
- All token expiry checks use `time.Now().After(expiresAt)` — no clock skew shortcuts.

### Migrations
- Numbered: `000006_...up.sql` / `000006_...down.sql`. Never edit an existing migration.
- Every `up` migration has a matching `down` that fully reverses it.
- Use `TIMESTAMPTZ` not `TIMESTAMP`. Use `UUID` for all primary keys.
- Add indexes for every foreign key and any column used in a `WHERE` clause on hot paths.

### Email
- Email sending is behind the `email.Mailer` interface. The service depends on the interface, not a concrete SMTP client.
- In development, use `email.StubMailer` which logs to stdout instead of sending.
- Never block a request waiting for an email — fire-and-forget in a goroutine, log failures.

### Config
- All config comes from environment variables loaded via `config.Load()`.
- If a required env var is missing, panic at startup — fail fast, fail loud.
- Never hardcode secrets (JWT secret, DB password, SMTP credentials) in source.

### Logging
- Use `zerolog` via `github.com/rs/zerolog/log`. Structured fields only — no `fmt.Printf` in production paths.
- Log at `Info` for normal events, `Warn` for recoverable anomalies, `Error` for failures, `Fatal` only in `main`.

---

## What "no slop" means here
- No TODO comments left in merged code.
- No unused imports (`goimports` cleans these).
- No handler that returns 200 without doing anything.
- Every new route is documented in `CONTEXT.md`.
- Every new migration updates `CONTEXT.md`.
