import { SlidersHorizontal, ArrowUpDown, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store'

export default function MobileFloatingBar({ onOpenFilter, onOpenSort }) {
  const cartCount = useCartStore((s) => s.getCount())
  const openCart = useCartStore((s) => s.openCart)

  return (
    <>
      {/* Centered Floating Filter | Sort Pill */}
      <div className="fixed inset-x-0 bottom-[4.25rem] z-40 flex justify-center pointer-events-none lg:hidden">
        <div className="pointer-events-auto flex items-center rounded-full bg-white px-5 py-2.5 shadow-lift ring-1 ring-primary/10 transition-transform active:scale-95">
          <button
            type="button"
            onClick={onOpenFilter}
            className="flex items-center gap-1.5 font-label text-xs font-semibold text-ink hover:text-primary transition-colors pr-3"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
            <span>Filter</span>
          </button>

          <div className="h-4 w-[1px] bg-primary/20" aria-hidden />

          <button
            type="button"
            onClick={onOpenSort}
            className="flex items-center gap-1.5 font-label text-xs font-semibold text-ink hover:text-primary transition-colors pl-3"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-primary" />
            <span>Sort</span>
          </button>
        </div>
      </div>

      {/* Bottom-Right Floating Cart Button */}
      <div className="fixed bottom-[4.25rem] right-4 z-40 lg:hidden">
        <button
          type="button"
          aria-label="Open cart"
          onClick={openCart}
          className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lift transition-transform active:scale-90"
        >
          <ShoppingBag className="h-5 w-5 text-white" strokeWidth={2} />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 font-label text-[10px] font-bold text-primary shadow-sm border border-primary/20">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </>
  )
}
