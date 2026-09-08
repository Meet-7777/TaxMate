import { z } from 'zod'

export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// device_type removed — detected automatically via detectDeviceType()
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })
  .refine((d) => d.oldPassword !== d.newPassword, {
    message: 'New password must be different from your current password',
    path: ['newPassword'],
  })

// ── Onboarding profile ────────────────────────────────────────────────────────

export const workTypes = [
  { value: 'uber',            label: 'Uber',             desc: 'Rideshare driver',                  bas: true  },
  { value: 'didi',            label: 'DiDi',             desc: 'Rideshare driver',                  bas: true  },
  { value: 'ubereats',        label: 'Uber Eats',        desc: 'Delivery driver',                   bas: false },
  { value: 'doordash',        label: 'DoorDash',         desc: 'Delivery driver',                   bas: false },
  { value: 'menulog',         label: 'Menulog',          desc: 'Delivery driver',                   bas: false },
  { value: 'casual_employee', label: 'Casual / ABN job', desc: 'Supermarket, hospitality, retail…', bas: false },
  { value: 'freelancer',      label: 'Freelancer',       desc: 'Design, dev, writing, consulting…', bas: false },
  { value: 'tradie',          label: 'Tradie',           desc: 'Electrician, plumber, builder…',    bas: false },
  { value: 'other',           label: 'Other',            desc: 'Multiple or something else',        bas: false },
] as const

// Rideshare drivers must register for GST from dollar one — BAS is mandatory.
// Delivery and everyone else only needs BAS if turnover exceeds $75K.
export function defaultNeedsBAS(workType: string): boolean {
  return workType === 'uber' || workType === 'didi'
}

export const profileStep1Schema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name:  z.string().min(1, 'Last name is required'),
  phone:      z.string().optional(),
})

export const profileStep2Schema = z.object({
  abn: z
    .string()
    .min(1, 'ABN is required')
    .regex(/^\d{11}$/, 'ABN must be 11 digits (no spaces)'),
  work_type: z.enum(
    ['uber', 'didi', 'ubereats', 'doordash', 'menulog', 'casual_employee', 'freelancer', 'tradie', 'other'],
    { message: 'Select your work type' },
  ),
  needs_bas: z.boolean(),
})

export type ProfileStep1Values = z.infer<typeof profileStep1Schema>
export type ProfileStep2Values = z.infer<typeof profileStep2Schema>

export type SignupFormValues = z.infer<typeof signupSchema>
export type LoginFormValues = z.infer<typeof loginSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
