import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

type Props = {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: Props) {
  const { state } = useAuth()

  if (state.status === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-[hsl(var(--background))]">
        {/* Simple pulse instead of a rounded spinner — matches the flat design language */}
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

  if (state.status === 'unauthenticated') {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
