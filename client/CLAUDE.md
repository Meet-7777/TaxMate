# TaxMate Frontend — Coding Principles

## Stack
- Vite + React 18 + TypeScript
- Tailwind CSS v4 (no dark mode)
- shadcn/ui components
- React Hook Form + Zod for all forms
- TanStack Query for server state
- Axios for HTTP (with interceptors for 401 refresh)
- React Router v6 for routing
- Framer Motion for animations

## Code Rules

### General
- No `any`. Use proper types everywhere.
- No inline styles. Tailwind only.
- Every component in its own file. No mega-files.
- Keep components small and focused — one concern per component.
- No commented-out code in commits.
- Delete dead code instead of commenting it out.

### TypeScript
- Prefer `type` over `interface` unless you need extension/declaration merging.
- Always type API response shapes explicitly.
- Never use non-null assertion (`!`) unless you've proven it's safe and added a comment.

### Forms
- Every form uses React Hook Form + Zod schema. No ad-hoc validation logic.
- Zod schemas live next to their form file or in `@/lib/schemas.ts`.
- Show field-level errors inline under each input.
- Disable submit button while submitting. Show a spinner.
- Show server errors (non-field errors) in a top-level `<FormError>` inside the form.

### API
- All API calls go through `@/api/client.ts` (the Axios instance).
- The Axios interceptor handles 401 → silent refresh → retry once.
- Never call `axios` directly from a component or page. Use the typed functions in `@/api/`.
- API functions return typed data, not raw `AxiosResponse`.

### Auth
- Auth state lives in `AuthContext`. Never reach into localStorage for user state.
- User object stored in context: `{ id: string; email: string } | null`.
- On signup success, automatically call login.
- Protected routes use `<ProtectedRoute>` wrapper — redirect to `/login` if no user.

### UI & Animations
- Use Framer Motion `AnimatePresence` for page transitions.
- Form error messages animate in with a fade+slide.
- Buttons use loading state from React Hook Form `formState.isSubmitting`.
- Keep animations short: 150–300ms. No bouncy or distracting effects.
- Use shadcn/ui primitives (Button, Input, Label, Card) — don't rebuild what's already there.

### File Structure
```
src/
  api/           # axios client + typed endpoint functions
  components/
    ui/          # shadcn primitives (auto-generated or manual)
    FormError.tsx
    ProtectedRoute.tsx
  context/
    AuthContext.tsx
  hooks/
    useAuth.ts
  lib/
    utils.ts     # cn() helper
    schemas.ts   # zod schemas
  pages/
    LoginPage.tsx
    SignupPage.tsx
    DashboardPage.tsx
  App.tsx
  main.tsx
```

### What "no AI slop" means here
- No unnecessary wrapper divs.
- No placeholder "TODO: implement" functions left in.
- No copy-pasted boilerplate that isn't wired up.
- Every piece of UI is reachable and functional.
- Real error messages from the server surfaced to the user, not "Something went wrong."
