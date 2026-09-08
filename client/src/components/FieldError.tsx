import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  message?: string
}

export function FieldError({ message }: Props) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="text-xs text-red-600 mt-1"
          role="alert"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}
