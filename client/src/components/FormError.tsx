import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

type Props = {
  message?: string
}

// DESIGN.md: status error = muted terracotta (#B5482F), 10% tint bg, 1px border, sharp corners.
export function FormError({ message }: Props) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="flex items-start gap-2.5 border border-[hsl(var(--destructive))]/30 bg-[hsl(var(--destructive))]/8 px-3 py-2.5 text-sm text-[hsl(var(--destructive))]"
          role="alert"
          style={{ backgroundColor: 'rgba(181,72,47,0.08)' }}
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
