import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
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
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
