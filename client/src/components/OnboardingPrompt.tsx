import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, X, User } from 'lucide-react'

type Props = {
  /** User's first name if available */
  firstName?: string | null
}

export function OnboardingPrompt({ firstName }: Props) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="border-2 border-[#2C5F4E] bg-[#2C5F4E]/5 p-6 mb-8"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center bg-[#2C5F4E] text-white shrink-0">
            <User className="h-5 w-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-1">
              {firstName ? `Hi ${firstName}! ` : 'Hi! '}Complete your profile
            </h3>
            <p className="text-sm text-[#6B6B6B] mb-4">
              We need a few details to lodge your tax returns. Takes 2 minutes — you can do it now or later.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/onboarding"
                className="group inline-flex items-center gap-2 bg-[#2C5F4E] text-white text-sm font-medium px-4 py-2 hover:bg-[#234d3e] transition-colors"
              >
                Complete profile
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              
              <button
                onClick={() => setDismissed(true)}
                className="inline-flex items-center justify-center text-sm text-[#6B6B6B] hover:text-[#1A1A1A] transition-colors"
              >
                I'll do this later
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-[#9B9B9B] hover:text-[#1A1A1A] transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}