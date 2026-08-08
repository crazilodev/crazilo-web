import { cn } from '@/lib/utils/imageHelpers'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'red' | 'gold' | 'green' | 'gray' | 'dark' | 'organic'
  size?: 'sm' | 'md'
  className?: string
}

export default function Badge({
  children,
  variant = 'red',
  size = 'sm',
  className,
}: BadgeProps) {
  const variants = {
    red: 'bg-brand-red text-white',
    gold: 'bg-brand-gold text-white',
    green: 'bg-emerald-600 text-white',
    gray: 'bg-gray-100 text-gray-700',
    dark: 'bg-brand-dark text-white',
    organic: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  }

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 font-semibold',
    md: 'text-xs px-2.5 py-1 font-semibold',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full uppercase tracking-wide',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
}
