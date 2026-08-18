import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, SlidersHorizontal, RotateCcw } from 'lucide-react'
import FilterSidebar from '@/components/shop/FilterSidebar'
import { Button } from '@/components/ui/Button'

export default function FilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  onClear,
  activeFilterCount = 0,
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex justify-start pointer-events-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#2A1A22]/50 backdrop-blur-sm transition-opacity pointer-events-auto"
          />

          {/* Slide-Over Drawer Panel from LEFT side */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl pointer-events-auto overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-primary/10 px-6 py-4 bg-white z-20">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-light text-primary">
                  <SlidersHorizontal className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-semibold text-ink">
                    Filters
                  </h2>
                  {activeFilterCount > 0 && (
                    <span className="text-xs text-primary font-medium">
                      {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={onClear}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-rose-light/60 hover:text-primary transition"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body - Guaranteed Direct Scroll Containment */}
            <div
              data-lenis-prevent
              onWheel={(e) => e.stopPropagation()}
              className="flex-1 overflow-y-auto p-6 theme-scrollbar min-h-0 overscroll-contain touch-pan-y pointer-events-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <FilterSidebar
                filters={filters}
                onChange={onChange}
                onClear={onClear}
                className="shadow-none ring-0 p-0 border-none bg-transparent"
              />
            </div>

            {/* Drawer Footer */}
            <div className="shrink-0 border-t border-primary/10 px-6 py-4 bg-rose-light/10 flex items-center gap-3 z-20">
              <button
                type="button"
                onClick={onClear}
                className="flex-1 rounded-xl border border-primary/20 py-3 text-xs font-semibold uppercase tracking-wider text-primary hover:bg-rose-light/40 transition"
              >
                Clear All
              </button>
              <Button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-xs uppercase tracking-wider"
              >
                Apply Filters
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
