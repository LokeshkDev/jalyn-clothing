import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function FilterSection({
  title,
  open,
  onToggle,
  children,
  className,
}) {
  return (
    <div className={cn('border-b border-primary/10 py-4', className)}>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left"
        aria-expanded={open}
      >
        <span className="font-label text-sm font-semibold text-ink">{title}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-primary transition-transform duration-300',
            open && 'rotate-180',
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-[grid-template-rows,opacity,visibility] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0 invisible',
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-3">{children}</div>
        </div>
      </div>
    </div>
  )
}