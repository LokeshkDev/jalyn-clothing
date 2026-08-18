import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import FilterSidebar from '@/components/shop/FilterSidebar'

export default function MobileFilterSheet({
  isOpen,
  onClose,
  filters,
  onChange,
  onClear,
  totalResults,
}) {
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
            aria-label="Close filter overlay"
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-[70] flex max-h-[88vh] flex-col rounded-t-[24px] bg-white shadow-lift lg:hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          >
            {/* Sticky Top Header */}
            <div className="flex items-center justify-between border-b border-primary/10 px-5 py-4">
              <h3 className="font-label text-base font-bold text-ink">Filters</h3>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClear}
                  className="font-label text-xs font-semibold text-primary hover:underline"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink hover:bg-rose-light/60"
                >
                  <X className="h-5 w-5 text-ink" />
                </button>
              </div>
            </div>

            {/* Scrollable Filter Content */}
            <div data-lenis-prevent className="flex-1 overflow-y-auto p-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <FilterSidebar
                filters={filters}
                onChange={onChange}
                onClear={onClear}
                className="!shadow-none !ring-0 !p-0"
              />
            </div>

            {/* Sticky Bottom Footer */}
            <div className="flex items-center gap-3 border-t border-primary/10 bg-white p-4 pb-6">
              <button
                type="button"
                onClick={onClear}
                className="flex-1 rounded-xl border border-primary/20 bg-white py-3.5 font-label text-xs font-bold uppercase tracking-wider text-ink active:scale-95 transition"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-[2] rounded-xl bg-primary py-3.5 font-label text-xs font-bold uppercase tracking-wider text-white shadow-soft active:scale-95 transition"
              >
                Apply ({totalResults} Results)
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
