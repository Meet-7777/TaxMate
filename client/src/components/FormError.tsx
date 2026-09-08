import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle } from 'lucide-react'

type Props = {
  message?: string
}

export function FormError({ message }: Props) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
