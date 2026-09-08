import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// DESIGN.md: sharp corners, no shadows, three button types:
// default  = solid #2C5F4E bg, white text
// outline  = transparent bg, 1px #2C5F4E border, green text
// ghost    = no border, dark text, underline on hover
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 rounded-none',
  {
    variants: {
      variant: {
        default:
          'bg-[hsl(var(--primary))] text-white hover:bg-[#1b4f3f] active:bg-[#104737]',
        outline:
          'border border-[hsl(var(--primary))] bg-transparent text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))]/5',
        ghost:
          'bg-transparent text-[hsl(var(--foreground))] hover:underline underline-offset-4',
        destructive:
          'bg-[hsl(var(--destructive))] text-white hover:bg-[hsl(var(--destructive))]/90',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-11 px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean
  }

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  ),
)
Button.displayName = 'Button'

export { Button, buttonVariants }
