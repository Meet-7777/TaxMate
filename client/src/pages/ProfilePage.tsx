import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FieldError } from '@/components/FieldError'
import { FormError } from '@/components/FormError'
import { workTypes, defaultNeedsBAS } from '@/lib/schemas'
import type { WorkType, UpdateProfilePayload } from '@/api/auth'

export default function ProfilePage() {
  const { state, completeProfile } = useAuth()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState<UpdateProfilePayload>({
    first_name: '',
    last_name: '',
    phone: '',
    abn: '',
    work_type: 'uber',
    needs_bas: false,
  })

  const [errors, setErrors] = useState<Partial<Record<keyof UpdateProfilePayload, string>>>({})

  
  useEffect(() => {
    if (state.status === 'authenticated' && state.user) {
      setFormData({
        first_name: state.user.first_name || '',
        last_name: state.user.last_name || '',
        phone: state.user.phone || '',
        abn: state.user.abn || '',
        work_type: state.user.work_type || 'uber',
        needs_bas: state.user.needs_bas,
      })
    }
  }, [state])

  const handleWorkTypeChange = (workType: WorkType) => {
    setFormData((prev) => ({
      ...prev,
      work_type: workType,
      needs_bas: defaultNeedsBAS(workType),
    }))
    setErrors((prev) => ({ ...prev, work_type: undefined }))
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UpdateProfilePayload, string>> = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }
    if (!formData.abn.trim()) {
      newErrors.abn = 'ABN is required'
    } else if (!/^\d{11}$/.test(formData.abn.replace(/\s/g, ''))) {
      newErrors.abn = 'ABN must be 11 digits'
    }
    if (!formData.work_type) {
      newErrors.work_type = 'Please select your work type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    setError('')

    try {
      await completeProfile({
        ...formData,
        abn: formData.abn.replace(/\s/g, ''), 
      })
      setIsEditing(false)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  if (state.status !== 'authenticated' || !state.user) {
    return null
  }

  const { user } = state

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account information</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  {user.profile_completed
                    ? 'Your profile is complete'
                    : 'Complete your profile to continue'}
                </CardDescription>
              </div>
              {user.profile_completed && !isEditing && (
                <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!isEditing && user.profile_completed ? (
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">First Name</p>
                    <p className="mt-1 text-base text-gray-900">{user.first_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Name</p>
                    <p className="mt-1 text-base text-gray-900">{user.last_name}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-base text-gray-900">{user.email}</p>
                </div>

                {user.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Phone</p>
                    <p className="mt-1 text-base text-gray-900">{user.phone}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-gray-500">ABN</p>
                  <p className="mt-1 text-base text-gray-900 font-mono">{user.abn}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Work Type</p>
                  <p className="mt-1 text-base text-gray-900 capitalize">
                    {workTypes.find((wt) => wt.value === user.work_type)?.label || user.work_type}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">BAS Registration</p>
                  <p className="mt-1 text-base text-gray-900">
                    {user.needs_bas ? 'GST registered - needs BAS' : 'Not GST registered'}
                  </p>
                </div>
              </div>
            ) : (
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <FormError message={error} />}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      value={formData.first_name}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, first_name: e.target.value }))
                        setErrors((prev) => ({ ...prev, first_name: undefined }))
                      }}
                      placeholder="John"
                      disabled={isSubmitting}
                    />
                    {errors.first_name && <FieldError message={errors.first_name} />}
                  </div>

                  <div>
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      value={formData.last_name}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, last_name: e.target.value }))
                        setErrors((prev) => ({ ...prev, last_name: undefined }))
                      }}
                      placeholder="Doe"
                      disabled={isSubmitting}
                    />
                    {errors.last_name && <FieldError message={errors.last_name} />}
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="+61 412 345 678"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="abn">Australian Business Number (ABN) *</Label>
                  <Input
                    id="abn"
                    value={formData.abn}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, abn: e.target.value }))
                      setErrors((prev) => ({ ...prev, abn: undefined }))
                    }}
                    placeholder="12 345 678 901"
                    disabled={isSubmitting}
                  />
                  {errors.abn && <FieldError message={errors.abn} />}
                </div>

                <div>
                  <Label>Work Type *</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {workTypes.map((wt) => (
                      <button
                        key={wt.value}
                        type="button"
                        onClick={() => handleWorkTypeChange(wt.value)}
                        disabled={isSubmitting}
                        className={`p-3 border rounded-lg text-left transition-colors ${
                          formData.work_type === wt.value
                            ? 'border-[#2C5F4E] bg-[#2C5F4E]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium text-sm">{wt.label}</div>
                      </button>
                    ))}
                  </div>
                  {errors.work_type && <FieldError message={errors.work_type} />}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm font-medium text-gray-700">BAS Requirement</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.needs_bas
                      ? '✓ You need quarterly BAS lodgements (GST registered)'
                      : '✗ You only need annual tax return (not GST registered)'}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                  {user.profile_completed && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false)
                        setError('')
                        setErrors({})
                        
                        setFormData({
                          first_name: user.first_name || '',
                          last_name: user.last_name || '',
                          phone: user.phone || '',
                          abn: user.abn || '',
                          work_type: user.work_type || 'uber',
                          needs_bas: user.needs_bas,
                        })
                      }}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
