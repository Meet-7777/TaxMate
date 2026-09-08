import { forwardRef, type LabelHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>

// DESIGN.md: label-caps — 12px, 700, 0.05em letter-spacing, uppercase, muted color.
const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('label-caps block', className)}
      {...props}
    />
  ),
)
Label.displayName = 'Label'

export { Label }
