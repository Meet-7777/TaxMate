import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getMe, login as apiLogin, logout as apiLogout, signup as apiSignup } from '@/api/auth'
import type { User } from '@/api/auth'
import { detectDeviceType } from '@/lib/device'

// localStorage key — shared across all tabs of the same origin.
// We store the email here (not the token — cookies handle that).
// This lets other tabs pick up login/logout events via the `storage` event.
const AUTH_EMAIL_KEY = 'taxmate_email'

function writeAuthEmail(email: string) {
  localStorage.setItem(AUTH_EMAIL_KEY, email)
}

function readAuthEmail(): string {
  return localStorage.getItem(AUTH_EMAIL_KEY) ?? ''
}

function clearAuthEmail() {
  localStorage.removeItem(AUTH_EMAIL_KEY)
}

type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated' }

type AuthContextValue = {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  // On mount (and when called from the storage listener), verify the session
  // by hitting /me. The access_token cookie does the actual auth work.
  // If the cookie is missing or expired, /me returns 401 → unauthenticated.
  const restoreSession = useCallback(async () => {
    try {
      const me = await getMe()
      const email = readAuthEmail()
      setState({ status: 'authenticated', user: { id: me.id, email } })
    } catch {
      // /me failed — no valid cookie. Clear any stale email too.
      clearAuthEmail()
      setState({ status: 'unauthenticated' })
    }
  }, [])

  // Initial session restore on mount.
  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  // Cross-tab sync via localStorage `storage` event.
  //
  // Scenario A — Tab A logs in, Tab B is on the login page idle:
  //   Tab A writes AUTH_EMAIL_KEY → Tab B receives `storage` event →
  //   Tab B calls restoreSession() → /me succeeds (shared cookie) →
  //   Tab B becomes authenticated.
  //
  // Scenario B — Tab A logs out, Tab B is on dashboard:
  //   Tab A removes AUTH_EMAIL_KEY → Tab B receives `storage` event →
  //   Tab B calls restoreSession() → /me returns 401 (cookie cleared) →
  //   Tab B becomes unauthenticated.
  //
  // Scenario C — Tab A signs up as user1, Tab B is signed up as user2 concurrently:
  //   Last write wins on the cookie (server overwrites it). The tab whose
  //   cookies were overwritten will call restoreSession and discover their
  //   /me now returns the other user's id — they get re-synced to the current
  //   cookie owner. This is the correct browser behavior: one origin = one
  //   active session per device_type.
  //
  // Note: the `storage` event does NOT fire in the tab that made the change —
  // only in other tabs. That's intentional browser behavior and is what we want.
  useEffect(() => {
    function onStorageChange(e: StorageEvent) {
      if (e.key !== AUTH_EMAIL_KEY) return
      // Key was set (login/signup in another tab) or removed (logout in another tab).
      restoreSession()
    }
    window.addEventListener('storage', onStorageChange)
    return () => window.removeEventListener('storage', onStorageChange)
  }, [restoreSession])

  // Forced logout triggered by the Axios interceptor when refresh fails.
  useEffect(() => {
    function onForcedLogout() {
      clearAuthEmail()
      setState({ status: 'unauthenticated' })
    }
    window.addEventListener('auth:logout', onForcedLogout)
    return () => window.removeEventListener('auth:logout', onForcedLogout)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const device_type = detectDeviceType()
    const user = await apiLogin(email, password, device_type)
    // Write to localStorage *after* the server sets the cookie — other tabs
    // will pick this up via the `storage` event and call restoreSession.
    writeAuthEmail(user.email)
    setState({ status: 'authenticated', user })
  }, [])

  const signup = useCallback(async (email: string, password: string) => {
    const device_type = detectDeviceType()
    // Signup creates the account but sets no cookies.
    // Login immediately after to establish the session.
    await apiSignup(email, password)
    const user = await apiLogin(email, password, device_type)
    writeAuthEmail(user.email)
    setState({ status: 'authenticated', user })
  }, [])

  const logout = useCallback(async () => {
    try {
      // Expire cookies on the server first.
      await apiLogout()
    } catch {
      // Server failure shouldn't block local cleanup.
    } finally {
      // Removing the key triggers the `storage` event in other tabs,
      // causing them to call restoreSession → /me → 401 → unauthenticated.
      clearAuthEmail()
      setState({ status: 'unauthenticated' })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
