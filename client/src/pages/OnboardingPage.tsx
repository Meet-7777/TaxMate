import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { TaxMateWordmark } from '@/components/TaxMateLogo'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/FieldError'
import { FormError } from '@/components/FormError'
import { useAuth } from '@/hooks/useAuth'
import {
  profileStep1Schema,
  profileStep2Schema,
  workTypes,
  type ProfileStep1Values,
  type ProfileStep2Values,
  defaultNeedsBAS,
} from '@/lib/schemas'
import type { WorkType } from '@/api/auth'

// ── stepper meta ──────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: 'Your details' },
  { n: 2, label: 'Your work' },
  { n: 3, label: 'Review' },
]

// ── step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((step, i) => {
        const done   = current > step.n
        const active = current === step.n
        return (
          <div key={step.n} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center text-xs font-semibold transition-colors ${
                  done
                    ? 'bg-[#2C5F4E] text-white'
                    : active
                    ? 'border-2 border-[#2C5F4E] text-[#2C5F4E]'
                    : 'border border-[#E5E5E5] text-[#9B9B9B]'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : step.n}
              </div>
              <span
                className={`text-[11px] font-medium whitespace-nowrap ${
                  active ? 'text-[#1A1A1A]' : 'text-[#9B9B9B]'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-12 sm:w-20 mx-2 mb-5 transition-colors ${
                  done ? 'bg-[#2C5F4E]' : 'bg-[#E5E5E5]'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── animation variants ────────────────────────────────────────────────────────

const slide = {
  enter:  (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit:   (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { state, completeProfile } = useAuth()
  const navigate = useNavigate()
  const user = state.status === 'authenticated' ? state.user : null

  const [step, setStep]         = useState(1)
  const [dir, setDir]           = useState(1)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [step1Data, setStep1Data] = useState<ProfileStep1Values>({
    first_name: '',
    last_name: '',
    phone: '',
  })
  const [step2Data, setStep2Data] = useState<ProfileStep2Values>({
    abn: '',
    work_type: 'uber',
    needs_bas: true,
  })

  const form1 = useForm<ProfileStep1Values>({
    resolver: zodResolver(profileStep1Schema),
    defaultValues: step1Data,
  })
  const form2 = useForm<ProfileStep2Values>({
    resolver: zodResolver(profileStep2Schema),
    defaultValues: step2Data,
  })

  function goTo(n: number) {
    setDir(n > step ? 1 : -1)
    setStep(n)
  }

  const onStep1 = form1.handleSubmit((data) => { 
    setStep1Data(data); goTo(2) 
  })
  
  const onStep2 = form2.handleSubmit((data) => { 
    setStep2Data(data); goTo(3) 
  })

  async function onSubmit() {
    setFormError('')
    setSubmitting(true)
    try {
      await completeProfile({
        first_name: step1Data.first_name,
        last_name:  step1Data.last_name,
        phone:      step1Data.phone ?? '',
        abn:        step2Data.abn,
        work_type:  step2Data.work_type as WorkType,
        needs_bas:  step2Data.needs_bas,
      })
      navigate('/dashboard', { replace: true })
    } catch {
      setFormError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Auto-update needs_bas when work_type changes
  const currentWorkType = form2.watch('work_type')
  const shouldUpdateBAS = currentWorkType && form2.getValues('needs_bas') !== defaultNeedsBAS(currentWorkType)
  if (shouldUpdateBAS) {
    form2.setValue('needs_bas', defaultNeedsBAS(currentWorkType))
  }

  return (
    <div className="min-h-screen bg-[#F9F9F6] flex flex-col">

      {/* Nav */}
      <header className="border-b border-[#E5E5E5] bg-[#F9F9F6]">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center">
          <TaxMateWordmark size={26} />
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <p className="label-caps mb-2">Welcome to TaxMate</p>
            <h1 className="text-2xl font-semibold tracking-[-0.02em]">
              Let's set up your profile
            </h1>
            <p className="mt-1.5 text-sm text-[#6B6B6B]">
              Takes about 2 minutes. We need this to lodge your tax on your behalf.
            </p>
          </motion.div>

          {/* Stepper */}
          <div className="mb-8">
            <StepIndicator current={step} />
          </div>

          {/* Panels */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={dir}>

              {/* ── Step 1: Personal details ── */}
              {step === 1 && (
                <motion.div
                  key="s1"
                  custom={dir}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <form onSubmit={onStep1} className="border border-[#E5E5E5] bg-white p-8 space-y-5">

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="first_name">First name</Label>
                        <Input id="first_name" placeholder="Alex" autoFocus {...form1.register('first_name')} />
                        <FieldError message={form1.formState.errors.first_name?.message} />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="last_name">Last name</Label>
                        <Input id="last_name" placeholder="Smith" {...form1.register('last_name')} />
                        <FieldError message={form1.formState.errors.last_name?.message} />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone">
                        Phone{' '}
                        <span className="text-[#9B9B9B] font-normal">(optional)</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="04xx xxx xxx"
                        {...form1.register('phone')}
                      />
                    </div>

                    <Button type="submit" className="w-full gap-2">
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* ── Step 2: Work details ── */}
              {step === 2 && (
                <motion.div
                  key="s2"
                  custom={dir}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <form onSubmit={onStep2} className="border border-[#E5E5E5] bg-white p-8 space-y-6">

                    <div className="space-y-1.5">
                      <Label htmlFor="abn">ABN</Label>
                      <Input
                        id="abn"
                        placeholder="51824753556"
                        autoFocus
                        {...form2.register('abn')}
                      />
                      <FieldError message={form2.formState.errors.abn?.message} />
                      <p className="text-xs text-[#9B9B9B]">
                        11 digits, no spaces. Need one?{' '}
                        <a
                          href="https://www.abr.gov.au/business-super-funds-charities/applying-for-an-abn"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline underline-offset-2 hover:text-[#1A1A1A]"
                        >
                          Apply free at ABR
                        </a>
                        .
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>How do you earn on ABN?</Label>
                      <div className="grid grid-cols-1 gap-1.5">
                        {workTypes.map((wt) => {
                          const selected = form2.watch('work_type') === wt.value
                          return (
                            <button
                              key={wt.value}
                              type="button"
                              onClick={() =>
                                form2.setValue('work_type', wt.value, { shouldValidate: true })
                              }
                              className={`flex items-center justify-between px-4 py-3 text-sm border transition-colors ${
                                selected
                                  ? 'border-[#2C5F4E] bg-[#2C5F4E]/5'
                                  : 'border-[#E5E5E5] hover:border-[#1A1A1A]/25'
                              }`}
                            >
                              <span className={`font-medium ${selected ? 'text-[#2C5F4E]' : 'text-[#1A1A1A]'}`}>
                                {wt.label}
                              </span>
                              <span className="text-xs text-[#9B9B9B]">{wt.desc}</span>
                            </button>
                          )
                        })}
                      </div>
                      <FieldError message={form2.formState.errors.work_type?.message} />
                    </div>

                    {/* BAS question — only show if not rideshare */}
                    {currentWorkType && !defaultNeedsBAS(currentWorkType) && (
                      <div className="space-y-2 border border-[#E5E5E5] p-4 bg-[#F9F9F6]">
                        <Label>Do you need quarterly BAS lodgements?</Label>
                        <p className="text-xs text-[#6B6B6B] mb-3">
                          You only need BAS if you're registered for GST (turnover over $75K) or choose to register voluntarily.
                        </p>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => form2.setValue('needs_bas', true)}
                            className={`flex-1 px-3 py-2 text-sm border transition-colors ${
                              form2.watch('needs_bas')
                                ? 'border-[#2C5F4E] bg-[#2C5F4E]/5 text-[#2C5F4E] font-medium'
                                : 'border-[#E5E5E5] text-[#6B6B6B]'
                            }`}
                          >
                            Yes, I'm GST registered
                          </button>
                          <button
                            type="button"
                            onClick={() => form2.setValue('needs_bas', false)}
                            className={`flex-1 px-3 py-2 text-sm border transition-colors ${
                              !form2.watch('needs_bas')
                                ? 'border-[#2C5F4E] bg-[#2C5F4E]/5 text-[#2C5F4E] font-medium'
                                : 'border-[#E5E5E5] text-[#6B6B6B]'
                            }`}
                          >
                            No, just tax return
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button type="button" variant="outline" className="flex-1" onClick={() => goTo(1)}>
                        Back
                      </Button>
                      <Button type="submit" className="flex-1 gap-2">
                        Continue <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ── Step 3: Review ── */}
              {step === 3 && (
                <motion.div
                  key="s3"
                  custom={dir}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="border border-[#E5E5E5] bg-white p-8 space-y-6">
                    <div>
                      <p className="label-caps mb-4">Review your details</p>
                      <dl className="border border-[#E5E5E5]">
                        {[
                          { label: 'Name',      value: `${step1Data.first_name} ${step1Data.last_name}` },
                          { label: 'Email',     value: user?.email ?? '—' },
                          { label: 'Phone',     value: step1Data.phone || '—' },
                          { label: 'ABN',       value: step2Data.abn },
                          { label: 'Work type', value: workTypes.find(p => p.value === step2Data.work_type)?.label ?? step2Data.work_type },
                          { label: 'BAS lodgements', value: step2Data.needs_bas ? 'Yes (quarterly)' : 'No (tax return only)' },
                        ].map((row, i, arr) => (
                          <div
                            key={row.label}
                            className={`flex items-center justify-between px-4 py-3 ${
                              i < arr.length - 1 ? 'border-b border-[#E5E5E5]' : ''
                            }`}
                          >
                            <dt className="text-xs text-[#9B9B9B] uppercase tracking-wider font-medium w-24 shrink-0">
                              {row.label}
                            </dt>
                            <dd className="text-sm font-medium text-[#1A1A1A] text-right">
                              {row.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    {formError && <FormError message={formError} />}

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => goTo(2)}
                        disabled={submitting}
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        className="flex-1 gap-2"
                        onClick={onSubmit}
                        disabled={submitting}
                      >
                        {submitting ? 'Saving…' : 'Complete setup'}
                        {!submitting && <ArrowRight className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          <p className="mt-4 text-center text-xs text-[#9B9B9B]">
            Step {step} of {STEPS.length}
          </p>

        </div>
      </main>
    </div>
  )
}