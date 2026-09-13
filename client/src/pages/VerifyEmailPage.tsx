import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, RefreshCw, Loader2 } from 'lucide-react'

import { TaxMateWordmark } from '@/components/TaxMateLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import api from '@/api/client'

type Status = 'loading' | 'success' | 'error'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setError('No verification token provided')
      return
    }

    verifyEmail(token)
  }, [token])

  async function verifyEmail(token: string) {
    try {
      await api.post('/api/auth/verify-email', null, {
        params: { token }
      })
      setStatus('success')
    } catch (err: any) {
      setStatus('error')
      const message = err?.response?.data || err?.message || 'Verification failed'
      setError(message)
    }
  }

  async function handleResend() {
    setResending(true)
    setError('')
    
    try {
      // We don't have the email from the token, so user needs to go to login page
      // where they can request a new verification email
      navigate('/login?verification_needed=true')
    } catch (err: any) {
      setError('Failed to redirect. Please go to login page.')
    } finally {
      setResending(false)
    }
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
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {status === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-[#E5E5E5] bg-white">
                  <CardContent className="pt-12 pb-12 text-center">
                    <Loader2 className="h-12 w-12 text-[#2C5F4E] animate-spin mx-auto mb-4" />
                    <h1 className="text-2xl font-semibold tracking-[-0.02em] mb-2">
                      Verifying your email
                    </h1>
                    <p className="text-[#6B6B6B]">Please wait a moment...</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-[#E5E5E5] bg-white">
                  <CardContent className="pt-12 pb-12 text-center">
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2C5F4E]/10 mb-4">
                        <CheckCircle2 className="h-8 w-8 text-[#2C5F4E]" />
                      </div>
                    </div>
                    
                    <h1 className="text-2xl font-semibold tracking-[-0.02em] mb-2">
                      Email verified!
                    </h1>
                    <p className="text-[#6B6B6B] mb-8">
                      Your email has been successfully verified. You can now log in to your account.
                    </p>
                    
                    <Button
                      onClick={() => navigate('/login')}
                      className="w-full"
                      size="lg"
                    >
                      Continue to login
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="border-[#E5E5E5] bg-white">
                  <CardContent className="pt-12 pb-12 text-center">
                    <div className="mb-4">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
                        <XCircle className="h-8 w-8 text-red-600" />
                      </div>
                    </div>
                    
                    <h1 className="text-2xl font-semibold tracking-[-0.02em] mb-2">
                      Verification failed
                    </h1>
                    <p className="text-[#6B6B6B] mb-2">
                      {error.includes('expired') || error.includes('invalid')
                        ? 'Your verification link has expired or is invalid.'
                        : error}
                    </p>
                    <p className="text-sm text-[#9B9B9B] mb-8">
                      Don't worry, you can request a new verification email from the login page.
                    </p>
                    
                    <div className="space-y-3">
                      <Button
                        onClick={handleResend}
                        disabled={resending}
                        className="w-full"
                        size="lg"
                      >
                        {resending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Redirecting...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Request new verification email
                          </>
                        )}
                      </Button>
                      
                      <Button
                        onClick={() => navigate('/login')}
                        variant="outline"
                        className="w-full"
                        size="lg"
                      >
                        Go to login
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
