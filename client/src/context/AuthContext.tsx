import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'
import {
  getMe,
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
  updateProfile as apiUpdateProfile,
} from '@/api/auth'
import type { User, UpdateProfilePayload } from '@/api/auth'

// localStorage key — shared across all tabs of the same origin.
// We store the email here (not the token — cookies handle that).
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
  refreshUser: () => Promise<void>
  completeProfile: (payload: UpdateProfilePayload) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  // Verify the session by hitting /me and build a full User from the response.
  const restoreSession = useCallback(async () => {
    try {
      const me = await getMe()
      // /me now returns the full profile; email is also in localStorage as
      // a cross-tab signal, but we trust the server response as source of truth.
      const email = me.email || readAuthEmail()
      setState({
        status: 'authenticated',
        user: { ...me, email },
      })
    } catch {
      clearAuthEmail()
      setState({ status: 'unauthenticated' })
    }
  }, [])

  // Re-fetch the user from the server and update context in place.
  // Called after completing onboarding so the profile_completed flag updates.
  const refreshUser = useCallback(async () => {
    try {
      const me = await getMe()
      const email = me.email || readAuthEmail()
      setState((prev) => {
        if (prev.status !== 'authenticated') return prev
        return { status: 'authenticated', user: { ...me, email } }
      })
    } catch {
      // If the cookie expired mid-onboarding, fall through gracefully.
      clearAuthEmail()
      setState({ status: 'unauthenticated' })
    }
  }, [])

  // Initial session restore on mount.
  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  // Cross-tab sync via localStorage `storage` event.
  useEffect(() => {
    function onStorageChange(e: StorageEvent) {
      if (e.key !== AUTH_EMAIL_KEY) return
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
      // Show toast when logged out due to token refresh failure (likely another device login)
      toast.info('Logged in from another device', {
        description: 'Your session here was closed. Sign in again if needed.',
        duration: 6000,
      })
    }
    window.addEventListener('auth:logout', onForcedLogout)
    return () => window.removeEventListener('auth:logout', onForcedLogout)
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    await apiLogin(email, password)
    // After login, fetch the full profile (including profile_completed flag).
    writeAuthEmail(email)
    await restoreSession()
  }, [restoreSession])

  const signup = useCallback(async (email: string, password: string) => {
    await apiSignup(email, password)
    // Don't auto-login after signup - let user login manually
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // Server failure shouldn't block local cleanup.
    } finally {
      clearAuthEmail()
      setState({ status: 'unauthenticated' })
    }
  }, [])

  // Save profile data then refresh user in context so profile_completed flips.
  const completeProfile = useCallback(async (payload: UpdateProfilePayload) => {
    await apiUpdateProfile(payload)
    await refreshUser()
  }, [refreshUser])

  return (
    <AuthContext.Provider value={{ state, login, signup, logout, refreshUser, completeProfile }}>
      {children}
    </AuthContext.Provider>
  )
}
