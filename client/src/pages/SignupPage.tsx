import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { signupSchema, type SignupFormValues } from '@/lib/schemas'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormError } from '@/components/FormError'
import { FieldError } from '@/components/FieldError'
import axios from 'axios'

export default function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  })

  async function onSubmit(values: SignupFormValues) {
    setServerError('')
    try {
      await signup(values.email, values.password)
      navigate('/dashboard')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data
        setServerError(typeof msg === 'string' ? msg.trim() : 'Failed to create account. Please try again.')
      } else {
        setServerError('Something unexpected happened.')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Brand mark */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-3">
            <div
              className="h-8 w-8 flex items-center justify-center"
              style={{ backgroundColor: '#2C5F4E' }}
            >
              <span className="text-white text-sm font-bold tracking-wide">T</span>
            </div>
            <span className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))]">
              TaxMate
            </span>
          </div>
          <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[hsl(var(--foreground))]">
            Create account
          </h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Get started with TaxMate. Free to join.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <FormError message={serverError} />

          <div className="space-y-1.5">
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
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                className="pr-10"
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError message={errors.password?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repeat your password"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                className="pr-10"
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <FieldError message={errors.confirmPassword?.message} />
          </div>

          <Button type="submit" className="w-full h-11" loading={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-[hsl(var(--muted-foreground))]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-[hsl(var(--foreground))] font-medium underline underline-offset-4 hover:text-[hsl(var(--primary))] transition-colors"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
