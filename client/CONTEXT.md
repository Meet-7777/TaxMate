# TaxMate Client — Context & Architecture

This document explains what is built, what is remaining, and how everything connects.
Update it whenever something meaningful is added or changed.

---

## Stack

| Tool | Purpose |
|---|---|
| Vite 8 + React 18 + TypeScript | Build toolchain |
| Tailwind CSS v4 (`@tailwindcss/vite`) | Styling — light mode only, CSS vars via shadcn design tokens |
| shadcn/ui (manual, no CLI) | UI primitives — Button, Input, Label, Card |
| React Hook Form + Zod | All form state and validation |
| TanStack Query | Server state (wired up, not yet used for queries beyond session restore) |
| Axios | HTTP client with cookie credentials |
| React Router v6 | Client-side routing |
| Framer Motion | Page entry animations, form error animations |
| Lucide React | Icons |

---

## File Map

```
client/src/
│
├── api/
│   ├── client.ts        — Axios instance (withCredentials: true)
│   │                      401 interceptor: auto-refreshes tokens, retries once,
│   │                      dispatches auth:logout event if refresh also fails
│   └── auth.ts          — Typed API functions:
│                            signup(email, password) → User
│                            login(email, password, device_type) → User
│                            refresh() → void
│                            getMe() → { id }
│
├── context/
│   └── AuthContext.tsx  — Global auth state: loading | authenticated | unauthenticated
│                          Restores session via GET /me on mount (cookie-based, no localStorage)
│                          Stores email in sessionStorage (since /me only returns id)
│                          Exposes: login, signup (signup → auto-login), logout
│
├── hooks/
│   └── useAuth.ts       — Typed hook. Throws if used outside AuthProvider.
│
├── lib/
│   ├── utils.ts         — cn() = clsx + tailwind-merge
│   └── schemas.ts       — Zod schemas:
│                            signupSchema: email, password (min 8), confirmPassword (must match)
│                            loginSchema: email, password, device_type (mobile | laptop)
│
├── components/
│   ├── ui/
│   │   ├── button.tsx   — Button with loading spinner prop, CVA variants (default/outline/ghost/destructive)
│   │   ├── input.tsx    — Styled input, focus ring, transition
│   │   ├── label.tsx    — Form label
│   │   └── card.tsx     — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
│   ├── FormError.tsx    — Animated server error banner (fade+slide, AlertCircle icon)
│   ├── FieldError.tsx   — Animated inline field error (fade+slide, small red text)
│   └── ProtectedRoute.tsx — Redirects to /login if unauthenticated, spinner while loading
│
├── pages/
│   ├── LoginPage.tsx    — Email + password (show/hide toggle) + device type selector
│   │                      (laptop/mobile toggle buttons with icons)
│   │                      Zod validation, server errors surfaced, loading state on submit
│   ├── SignupPage.tsx   — Email + password + confirm password (show/hide toggles)
│   │                      Zod validation, auto-login after signup, server errors surfaced
│   └── DashboardPage.tsx — Nav with user email display + sign out
│                           3 stat cards (placeholder values), recent activity placeholder
│
├── App.tsx              — Providers (QueryClient, AuthProvider, BrowserRouter)
│                          Routes: / → /dashboard, /login, /signup, /dashboard (protected)
│                          AnimatePresence for page transitions
└── main.tsx             — React root mount
```

---

## API Contract (what the backend actually does)

| Endpoint | Method | Auth | Notes |
|---|---|---|---|
| `/auth/signup` | POST | No | Returns `{id, email}`. No cookies set. |
| `/auth/login` | POST | No | Sets `access_token` (15min) + `refresh_token` (7d) as HttpOnly cookies. `device_type` required: `mobile` or `laptop`. |
| `/auth/refresh` | POST | Cookie | Rotates both cookies. No body. |
| `/me` | GET | Cookie | Returns `{id}` only — no email. |
| `/health` | GET | No | Postgres + Redis ping. |

**Key facts:**
- All auth is HttpOnly cookie-based. No Bearer headers. No localStorage for tokens.
- `device_type` is enforced server-side. One active session per device type per user.
- Signup does NOT return tokens. The frontend auto-calls login after signup.
- No logout endpoint exists yet on the server (`RevokeFamily` is in the repo but not wired).

---

## What Is Built ✅

- [x] Vite + React + TS project scaffolded
- [x] Tailwind v4 + shadcn design tokens (light mode)
- [x] Path alias `@/*` → `src/*` (vite + tsconfig)
- [x] Vite dev proxy → Go server at `:8080`
- [x] Axios client with 401 silent refresh + retry
- [x] Auth context with session restore on mount
- [x] Signup page (full validation, auto-login, animated errors)
- [x] Login page (full validation, device type selector, animated errors)
- [x] Dashboard page (nav, stat cards, activity placeholder)
- [x] Protected route with loading spinner
- [x] CLAUDE.md — coding principles
- [x] CONTEXT.md — this file

---

## What Is Remaining / Not Started ❌

These are either blocked on backend endpoints not yet existing, or not yet implemented on the frontend:

- [ ] **Logout** — no `/auth/logout` endpoint on the server yet. Currently clears local state only. When the backend adds `RevokeFamily`, wire it up here.
- [ ] **Email verification** — backend schema exists (`email_verification_tokens` table) but no handler written. Frontend flow (send email → verify token page) is not built.
- [ ] **Real dashboard data** — stat cards show `—`. Needs actual tax/document APIs from the backend.
- [ ] **MPIN** — `internal/mpin/` is empty on the server. No frontend work started.
- [ ] **Passkey** — `internal/passkey/` is empty on the server. No frontend work started.
- [ ] **Phone number** — user model has `phone_number` field. No UI to set or verify it.
- [ ] **Account/profile page** — no page to update email, password, or phone.
- [ ] **"Forgot password" flow** — not implemented on server or client.
- [ ] **Code splitting** — currently one JS chunk (~590kb). Add `React.lazy()` + `Suspense` per route when the app grows.

---

## Dev Workflow

```bash
# Start Go server (from repo root)
go run ./cmd/api

# Start frontend dev server (proxies to :8080)
cd client
npm run dev

# Type-check + build
npm run build
```
