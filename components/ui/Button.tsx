'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils/imageHelpers'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const base =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed btn-premium'

    const variants = {
      primary:
        'bg-brand-red hover:bg-brand-red-dark text-white shadow-md hover:shadow-lg focus:ring-brand-red',
      secondary:
        'bg-brand-dark hover:bg-gray-800 text-white shadow-md hover:shadow-lg focus:ring-gray-800',
      outline:
        'border-2 border-brand-red text-brand-red hover:bg-brand-red hover:text-white focus:ring-brand-red',
      ghost:
        'text-brand-red hover:bg-brand-red/10 focus:ring-brand-red',
      danger:
        'bg-red-600 hover:bg-red-700 text-white shadow-md focus:ring-red-500',
      gold:
        'bg-brand-gold hover:bg-amber-600 text-white shadow-md hover:shadow-glow-gold focus:ring-brand-gold',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-7 py-3 text-base gap-2',
      xl: 'px-9 py-4 text-lg gap-2.5',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          base,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
