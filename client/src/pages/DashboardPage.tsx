import { motion } from 'framer-motion'
import { LogOut, FileText, TrendingUp, Receipt, KeyRound, ChevronDown, User } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import { TaxMateWordmark } from '@/components/TaxMateLogo'
import { OnboardingPrompt } from '@/components/OnboardingPrompt'

const stats = [
  { label: 'Tax Returns Filed', value: '—', icon: FileText, sub: 'This financial year' },
  { label: 'Deductions Found', value: '—', icon: TrendingUp, sub: 'Across all categories' },
  { label: 'Pending Items', value: '—', icon: Receipt, sub: 'Awaiting your review' },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default function DashboardPage() {
  const { state, logout } = useAuth()
  const user = state.status === 'authenticated' ? state.user : null
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">

      {/* ── Top navigation ── */}
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-0 h-14">
          {/* Logo */}
          <Link to="/">
            <TaxMateWordmark size={26} />
          </Link>

          {/* Account menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors h-14 px-1"
            >
              <span className="max-w-[180px] truncate">
                {user?.first_name ? `${user.first_name} ${user.last_name ?? ''}`.trim() : user?.email ?? 'Account'}
              </span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0" />
            </button>

            {menuOpen && (
              <>
                {/* backdrop */}
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full z-20 w-44 border border-[hsl(var(--border))] bg-[hsl(var(--card))] py-1">
                  
                  {!user?.profile_completed && (
                    <>
                      <Link
                        to="/onboarding"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[#2C5F4E] hover:bg-[hsl(var(--muted))] transition-colors font-medium"
                      >
                        <User className="h-4 w-4" />
                        Complete profile
                      </Link>
                      <div className="my-1 border-t border-[hsl(var(--border))]" />
                    </>
                  )}
                  
                  <Link
                    to="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                  >
                    <User className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    View profile
                  </Link>
                  
                  <Link
                    to="/change-password"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                  >
                    <KeyRound className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    Change password
                  </Link>
                  <div className="my-1 border-t border-[hsl(var(--border))]" />
                  <button
                    onClick={() => { setMenuOpen(false); logout() }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
                  >
                    <LogOut className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="mx-auto max-w-5xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {/* Onboarding prompt — only show if profile incomplete */}
          {!user?.profile_completed && (
            <OnboardingPrompt firstName={user?.first_name} />
          )}

          {/* Page heading */}
          <div className="mb-10">
            <h1 className="text-[30px] font-semibold leading-[38px] tracking-[-0.01em] text-[hsl(var(--foreground))]">
              {user?.first_name ? `${getGreeting()}, ${user.first_name}` : 'Dashboard'}
            </h1>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Overview of your tax activity for the current financial year.
            </p>
          </div>

          {/* Stat cards */}
          <div className="grid gap-px sm:grid-cols-3 mb-10 border border-[hsl(var(--border))]">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: i * 0.06 }}
                  className="bg-[hsl(var(--card))] p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="label-caps">{stat.label}</p>
                    <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))] mt-0.5" />
                  </div>
                  <p className="mono-data text-[28px] font-semibold text-[hsl(var(--foreground))]">
                    {stat.value}
                  </p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1">{stat.sub}</p>
                </motion.div>
              )
            })}
          </div>

          {/* Recent activity */}
          <Card>
            <CardHeader className="border-b border-[hsl(var(--border))] pb-4">
              <p className="label-caps">Recent Activity</p>
              <CardDescription>Your latest tax events will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div
                  className="flex h-12 w-12 items-center justify-center mb-4"
                  style={{ backgroundColor: 'hsl(var(--muted))' }}
                >
                  <FileText className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                </div>
                <p className="text-sm font-medium text-[hsl(var(--foreground))]">No activity yet</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 max-w-xs">
                  Your transactions, receipts, and filed returns will appear here once you start adding documents.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
