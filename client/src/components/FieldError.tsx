import { motion, AnimatePresence } from 'framer-motion'

type Props = {
  message?: string
}

export function FieldError({ message }: Props) {
  return (
    <AnimatePresence>
      {message && (
        <motion.p
          initial={{ opacity: 0, y: -3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.13 }}
          className="text-xs text-[hsl(var(--destructive))] mt-1 font-medium"
          role="alert"
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  )
}
