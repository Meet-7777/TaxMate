import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { changePasswordSchema, type ChangePasswordFormValues } from '@/lib/schemas'
import { changePassword } from '@/api/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { FormError } from '@/components/FormError'
import { FieldError } from '@/components/FieldError'
import axios from 'axios'

type Vis = { old: boolean; new: boolean; confirm: boolean }

export default function ChangePasswordPage() {
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)
  const [vis, setVis] = useState<Vis>({ old: false, new: false, confirm: false })
  const toggle = (f: keyof Vis) => setVis((v) => ({ ...v, [f]: !v[f] }))

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema) })

  async function onSubmit(values: ChangePasswordFormValues) {
    setServerError('')
    setSuccess(false)
    try {
      await changePassword(values.oldPassword, values.newPassword)
      setSuccess(true)
      reset()
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = err.response?.data
        setServerError(typeof msg === 'string' ? msg.trim() : 'Failed to change password.')
      } else {
        setServerError('Something unexpected happened.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {/* Minimal nav */}
      <header className="border-b border-[hsl(var(--border))] bg-[hsl(var(--card))]">
        <div className="mx-auto flex max-w-5xl items-center px-6 h-14">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 flex items-center justify-center" style={{ backgroundColor: '#2C5F4E' }}>
              <span className="text-white text-xs font-bold">T</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">TaxMate</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="max-w-sm"
        >
          <div className="mb-8">
            <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.01em]">
              Change password
            </h1>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Enter your current password and choose a new one.
            </p>
          </div>

          <Card>
            <CardHeader className="border-b border-[hsl(var(--border))] pb-4">
              <p className="label-caps">Security</p>
            </CardHeader>
            <CardContent className="pt-6">
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 border px-3 py-2.5 text-sm mb-5"
                  style={{
                    borderColor: 'rgba(143,166,142,0.5)',
                    backgroundColor: 'rgba(143,166,142,0.1)',
                    color: '#4a7a49',
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Password changed successfully.
                </motion.div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                <FormError message={serverError} />

                <div className="space-y-1.5">
                  <Label htmlFor="oldPassword">Current password</Label>
                  <div className="relative">
                    <Input
                      id="oldPassword"
                      type={vis.old ? 'text' : 'password'}
                      placeholder="Your current password"
                      autoComplete="current-password"
                      aria-invalid={!!errors.oldPassword}
                      className="pr-10"
                      {...register('oldPassword')}
                    />
                    <button type="button" onClick={() => toggle('old')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                      aria-label={vis.old ? 'Hide' : 'Show'}>
                      {vis.old ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FieldError message={errors.oldPassword?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="newPassword">New password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={vis.new ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      aria-invalid={!!errors.newPassword}
                      className="pr-10"
                      {...register('newPassword')}
                    />
                    <button type="button" onClick={() => toggle('new')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                      aria-label={vis.new ? 'Hide' : 'Show'}>
                      {vis.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FieldError message={errors.newPassword?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={vis.confirm ? 'text' : 'password'}
                      placeholder="Repeat your new password"
                      autoComplete="new-password"
                      aria-invalid={!!errors.confirmPassword}
                      className="pr-10"
                      {...register('confirmPassword')}
                    />
                    <button type="button" onClick={() => toggle('confirm')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                      aria-label={vis.confirm ? 'Hide' : 'Show'}>
                      {vis.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <FieldError message={errors.confirmPassword?.message} />
                </div>

                <Button type="submit" className="w-full h-11" loading={isSubmitting}>
                  {isSubmitting ? 'Updating…' : 'Update password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
