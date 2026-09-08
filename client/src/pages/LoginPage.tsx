import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, Navigate } from 'react-router-dom'
import { motion, type Variants } from 'framer-motion'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { loginSchema, type LoginFormValues } from '@/lib/schemas'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormError } from '@/components/FormError'
import { FieldError } from '@/components/FieldError'
import { TaxMateMark } from '@/components/TaxMateLogo'
import axios from 'axios'

// Stagger container — children animate in sequence
const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

export default function LoginPage() {
  const { login, state } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) })

  if (state.status === 'authenticated') {
    return <Navigate to="/dashboard" replace />
  }

  async function onSubmit(values: LoginFormValues) {
    setServerError('')
    try {
      await login(values.email, values.password)
      navigate('/dashboard')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data
        setServerError(typeof msg === 'string' ? msg.trim() : 'Failed to sign in. Please try again.')
      } else {
        setServerError('Something unexpected happened.')
      }
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* ── LEFT PANEL ─────────────────────────────────────────────────── */}
      <motion.aside
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-[#2C5F4E] text-white p-12 relative overflow-hidden"
      >
        {/* Faint grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Top: logo */}
        <Link to="/" className="relative z-10 flex items-center gap-2.5 group w-fit">
          <div className="[&_circle]:stroke-white [&_line]:stroke-white [&_path]:fill-white">
            <TaxMateMark size={30} />
          </div>
          <span className="text-base font-semibold tracking-tight text-white">TaxMate</span>
        </Link>

        {/* Middle: copy */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <p className="text-[2rem] font-semibold leading-[1.15] tracking-[-0.025em]">
            Your tax docs,<br />sorted for you.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Upload your documents. We organise everything and hand you a clean summary — ready to lodge.
          </p>

          <div className="mt-8 space-y-3">
            {['Upload your documents', 'We do the organisation', 'You get a ready-to-lodge sheet'].map((s, i) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
                className="flex items-center gap-2.5 text-sm text-white/80"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white/40 shrink-0" />
                {s}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom: tagline */}
        <p className="relative z-10 text-xs text-white/40">No lock-in · Free to sign up</p>
      </motion.aside>

      {/* ── RIGHT PANEL ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-[#F9F9F6]">

        {/* Mobile-only logo */}
        <Link to="/" className="mb-10 flex items-center gap-2 lg:hidden">
          <TaxMateMark size={28} />
          <span className="text-base font-semibold tracking-tight">TaxMate</span>
        </Link>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-sm"
        >
          <motion.div variants={item} className="mb-8">
            <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.02em] text-[#1A1A1A]">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-[#6B6B6B]">Sign in to your account.</p>
          </motion.div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <motion.div variants={item}>
              <FormError message={serverError} />
            </motion.div>

            <motion.div variants={item} className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                autoFocus
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              <FieldError message={errors.email?.message} />
            </motion.div>

            <motion.div variants={item} className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  className="pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <FieldError message={errors.password?.message} />
            </motion.div>

            <motion.div variants={item}>
              <Button type="submit" className="w-full h-11 group" loading={isSubmitting}>
                {isSubmitting ? 'Signing in…' : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          <motion.p variants={item} className="mt-6 text-sm text-[#6B6B6B]">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-[#1A1A1A] font-medium underline underline-offset-4 hover:text-[#2C5F4E] transition-colors"
            >
              Create one
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
