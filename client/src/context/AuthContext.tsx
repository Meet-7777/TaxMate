import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getMe, login as apiLogin, signup as apiSignup } from '@/api/auth'
import type { DeviceType, User } from '@/api/auth'

type AuthState =
  | { status: 'loading' }
  | { status: 'authenticated'; user: User }
  | { status: 'unauthenticated' }

type AuthContextValue = {
  state: AuthState
  login: (email: string, password: string, device_type: DeviceType) => Promise<void>
  signup: (email: string, password: string, device_type: DeviceType) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading' })

  // On mount, try to restore the session via /me.
  // The access_token cookie does the work — no localStorage involved.
  const restoreSession = useCallback(async () => {
    try {
      const me = await getMe()
      // /me only returns { id }, we persist email from login/signup context
      const stored = sessionStorage.getItem('taxmate_email')
      setState({
        status: 'authenticated',
        user: { id: me.id, email: stored ?? '' },
      })
    } catch {
      setState({ status: 'unauthenticated' })
    }
  }, [])

  useEffect(() => {
    restoreSession()
  }, [restoreSession])

  // Listen for forced logouts triggered by the Axios interceptor.
  useEffect(() => {
    const handler = () => {
      sessionStorage.removeItem('taxmate_email')
      setState({ status: 'unauthenticated' })
    }
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [])

  const login = useCallback(
    async (email: string, password: string, device_type: DeviceType) => {
      const user = await apiLogin(email, password, device_type)
      sessionStorage.setItem('taxmate_email', user.email)
      setState({ status: 'authenticated', user })
    },
    [],
  )

  const signup = useCallback(
    async (email: string, password: string, device_type: DeviceType) => {
      // Signup returns {id, email} but sets no cookies.
      // Immediately log in to establish a session.
      await apiSignup(email, password)
      const user = await apiLogin(email, password, device_type)
      sessionStorage.setItem('taxmate_email', user.email)
      setState({ status: 'authenticated', user })
    },
    [],
  )

  const logout = useCallback(() => {
    sessionStorage.removeItem('taxmate_email')
    setState({ status: 'unauthenticated' })
    // No logout endpoint yet on the server — clear local state only.
  }, [])

  return (
    <AuthContext.Provider value={{ state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
