import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { TaxMateWordmark } from '@/components/TaxMateLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function CheckEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const email = searchParams.get('email') || 'your email'

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="border-[#E5E5E5] bg-white">
              <CardContent className="pt-12 pb-12 text-center">
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#2C5F4E]/10 mb-4">
                    <Mail className="h-8 w-8 text-[#2C5F4E]" />
                  </div>
                </div>

                <h1 className="text-2xl font-semibold tracking-[-0.02em] mb-2">
                  Check your email
                </h1>
                <p className="text-[#6B6B6B] mb-2">
                  We've sent a verification link to
                </p>
                <p className="font-medium text-[#1A1A1A] mb-6">
                  {email}
                </p>
                <p className="text-sm text-[#9B9B9B] mb-8">
                  Click the link in the email to verify your account and get started. The link expires in 24 hours.
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/login')}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    Go to login
                  </Button>
                </div>

                <p className="mt-8 text-xs text-[#9B9B9B]">
                  Didn't receive the email? Check your spam folder or try logging in to request a new verification email.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
