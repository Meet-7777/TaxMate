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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
      // device_type defaults to 'laptop' for web — the backend requires it on login
      await signup(values.email, values.password, 'laptop')
      navigate('/dashboard')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data
        if (typeof msg === 'string') {
          setServerError(msg.trim())
        } else {
          setServerError('Failed to create account. Please try again.')
        }
      } else {
        setServerError('Something unexpected happened.')
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[hsl(var(--background))] px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="h-8 w-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
              <span className="text-[hsl(var(--primary-foreground))] text-sm font-bold">T</span>
            </div>
            <span className="text-xl font-bold tracking-tight">TaxMate</span>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Smart tax management</p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Enter your details to get started</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              <FormError message={serverError} />

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
                <FieldError message={errors.email?.message} />
              </div>

              {/* Password */}
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

              {/* Confirm Password */}
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

              <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-[hsl(var(--foreground))] underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
