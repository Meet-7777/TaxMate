import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Laptop, Smartphone } from 'lucide-react'
import { loginSchema, type LoginFormValues } from '@/lib/schemas'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormError } from '@/components/FormError'
import { FieldError } from '@/components/FieldError'
import { cn } from '@/lib/utils'
import axios from 'axios'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { device_type: 'laptop' },
  })

  const deviceType = watch('device_type')

  async function onSubmit(values: LoginFormValues) {
    setServerError('')
    try {
      await login(values.email, values.password, values.device_type)
      navigate('/dashboard')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data
        if (typeof msg === 'string') {
          setServerError(msg.trim())
        } else {
          setServerError('Failed to sign in. Please try again.')
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
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
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
                    placeholder="Your password"
                    autoComplete="current-password"
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

              {/* Device Type */}
              <div className="space-y-1.5">
                <Label>Device type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(['laptop', 'mobile'] as const).map((type) => {
                    const Icon = type === 'laptop' ? Laptop : Smartphone
                    const label = type === 'laptop' ? 'Laptop / Desktop' : 'Mobile'
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setValue('device_type', type, { shouldValidate: true })}
                        className={cn(
                          'flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm transition-colors',
                          deviceType === type
                            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/5 font-medium text-[hsl(var(--foreground))]'
                            : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]/50',
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {label}
                      </button>
                    )
                  })}
                </div>
                {/* hidden input to register with RHF */}
                <input type="hidden" {...register('device_type')} />
                <FieldError message={errors.device_type?.message} />
              </div>

              <Button type="submit" className="w-full mt-2" loading={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-[hsl(var(--muted-foreground))]">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-[hsl(var(--foreground))] underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
