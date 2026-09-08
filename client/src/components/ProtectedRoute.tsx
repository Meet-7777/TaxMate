import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

type Props = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const { state } = useAuth()

  if (state.status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
      </div>
    )
  }

  if (state.status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
