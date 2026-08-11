import { SlidersHorizontal, ArrowUpDown } from 'lucide-react'

export default function MobileShopToolbar({
  from,
  to,
  total,
  onOpenFilter,
  onOpenSort,
}) {
  return (
    <div className="mx-4 mb-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        {/* Filter Pill Button */}
        <button
          type="button"
          onClick={onOpenFilter}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[18px] border border-primary/15 bg-white px-4 font-label text-sm font-medium text-ink shadow-sm transition active:scale-[0.98]"
        >
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span>Filters</span>
        </button>

        {/* Sort Pill Button */}
        <button
          type="button"
          onClick={onOpenSort}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[18px] border border-primary/15 bg-white px-4 font-label text-sm font-medium text-ink shadow-sm transition active:scale-[0.98]"
        >
          <span>Sort</span>
          <ArrowUpDown className="h-4 w-4 text-primary" />
        </button>
      </div>

      {/* Product Count Row */}
      <div className="text-center">
        <p className="font-label text-xs text-ink-muted">
          Showing{' '}
          <span className="font-semibold text-ink">
            {total === 0 ? 0 : from}–{to}
          </span>{' '}
          of <span className="font-semibold text-ink">{total}</span> Products
        </p>
      </div>
    </div>
  )
}
