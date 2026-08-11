import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Button = forwardRef(function Button(
  { className, variant = 'primary', size = 'md', children, ...props },
  ref,
) {
  const variants = {
    primary:
      'bg-gradient-to-br from-primary to-primary-soft text-white hover:-translate-y-0.5 hover:shadow-soft',
    outline:
      'border border-primary text-primary bg-transparent hover:bg-primary hover:text-white',
    ghost: 'bg-transparent text-ink hover:bg-rose-light/50',
    dark: 'bg-ink text-white hover:bg-primary',
  }
  const sizes = {
    sm: 'px-4 py-2 text-[11px]',
    md: 'px-7 py-3.5 text-[13px]',
    lg: 'px-9 py-4 text-sm',
  }

  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-semibold uppercase tracking-[0.14em] transition-all duration-500 ease-luxury disabled:opacity-50',
        'font-button',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
})
