import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

type Props = {
  children: React.ReactNode
  /** Set to true for routes that should only be accessible during onboarding */
  onboardingOnly?: boolean
}

function Loader() {
  return (
    <div className="flex h-screen items-center justify-center bg-[hsl(var(--background))]">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-1.5 w-1.5 bg-[hsl(var(--primary))] animate-pulse"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

export function ProtectedRoute({ children, onboardingOnly = false }: Props) {
  const { state } = useAuth()

  if (state.status === 'loading') return <Loader />

  if (state.status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  // onboardingOnly routes (like /onboarding) — only accessible if profile incomplete
  if (onboardingOnly && state.user.profile_completed) {
    return <Navigate to="/dashboard" replace />
  }

  // All other protected routes — accessible regardless of profile status
  return <>{children}</>
}
