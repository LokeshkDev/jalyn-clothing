import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popularity', label: 'Popular' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'alpha', label: 'Top Rated / A–Z' },
]

export default function MobileSortSheet({ isOpen, onClose, sort, onSortChange }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close sort overlay"
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[70] flex flex-col rounded-t-[24px] bg-white p-4 pb-8 shadow-lift lg:hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            {/* Header */}
            <div className="mb-3 flex items-center justify-between border-b border-primary/10 pb-3">
              <h3 className="font-label text-base font-bold text-ink">Sort Products By</h3>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-rose-light/60 text-ink"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Options List */}
            <div className="space-y-1 py-1">
              {SORT_OPTIONS.map((option) => {
                const active = sort === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onSortChange(option.value)
                      onClose()
                    }}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left font-label text-sm transition',
                      active
                        ? 'bg-rose-light/40 font-bold text-primary'
                        : 'text-ink hover:bg-rose-light/20',
                    )}
                  >
                    <span>{option.label}</span>
                    {active && <Check className="h-4 w-4 text-primary" strokeWidth={2.5} />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
