import { motion } from 'framer-motion'
import { LogOut, User, FileText, TrendingUp, Receipt } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const stats = [
  { label: 'Total Filed', value: '—', icon: FileText, description: 'Tax returns filed' },
  { label: 'Savings Found', value: '—', icon: TrendingUp, description: 'Deductions identified' },
  { label: 'Pending Items', value: '—', icon: Receipt, description: 'Awaiting review' },
]

export default function DashboardPage() {
  const { state, logout } = useAuth()
  const user = state.status === 'authenticated' ? state.user : null

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Nav */}
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
              <span className="text-[hsl(var(--primary-foreground))] text-xs font-bold">T</span>
            </div>
            <span className="font-semibold tracking-tight">TaxMate</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[hsl(var(--border))] px-3 py-1.5 text-sm">
              <User className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
              <span className="text-[hsl(var(--muted-foreground))]">
                {user?.email || user?.id || 'Account'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="gap-1.5 text-[hsl(var(--muted-foreground))]"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}
            </h1>
            <p className="mt-1 text-[hsl(var(--muted-foreground))]">
              Here's an overview of your tax activity.
            </p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3 mb-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.07 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardDescription>{stat.label}</CardDescription>
                        <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">
                        {stat.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Placeholder content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <CardDescription>Your latest tax events will appear here.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-[hsl(var(--muted))] p-4 mb-4">
                  <FileText className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
                </div>
                <p className="font-medium text-sm">No activity yet</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                  Start by adding your first tax document.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
