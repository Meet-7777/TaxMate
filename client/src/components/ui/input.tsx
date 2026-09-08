import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type InputProps = InputHTMLAttributes<HTMLInputElement>

// DESIGN.md: 1px #E5E5E5 border, white bg, sharp corners.
// Focus: border changes to primary green (#2C5F4E), no ring offset glow.
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-10 w-full border border-[hsl(var(--input))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--foreground))]',
        'placeholder:text-[hsl(var(--muted-foreground))]',
        'focus:outline-none focus:border-[hsl(var(--primary))]',
        'disabled:cursor-not-allowed disabled:bg-[hsl(var(--muted))] disabled:opacity-60',
        'transition-colors duration-150',
        'rounded-none',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export { Input }
