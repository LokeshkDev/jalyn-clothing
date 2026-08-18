import { LayoutGrid, LayoutList, Rows3, Grid2x2, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'alpha', label: 'Alphabetical' },
]

const VIEW_OPTIONS = [
  { id: 2, icon: Grid2x2, label: '2 columns' },
  { id: 3, icon: Rows3, label: '3 columns' },
  { id: 4, icon: LayoutGrid, label: '4 columns' },
  { id: 'list', icon: LayoutList, label: 'List view' },
]

export default function ProductToolbar({
  from,
  to,
  total,
  sort,
  onSortChange,
  view,
  onViewChange,
  onOpenFilter,
  activeFilterCount = 0,
}) {
  return (
    <div className="z-10 flex flex-wrap items-center justify-between gap-3 rounded-[6px] bg-white px-4 py-3 shadow-sm border border-primary/10">
      {/* Left Group: Filter Button (Mobile Only) + Products Count */}
      <div className="flex items-center gap-3">
        {/* Filter Popover Button with Icon - Hidden on desktop lg:hidden */}
        <button
          type="button"
          onClick={onOpenFilter}
          className="flex lg:hidden items-center gap-2 rounded-[6px] bg-primary/10 hover:bg-primary/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary transition shadow-xs cursor-pointer"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        <p className="font-label text-xs sm:text-sm text-ink-muted">
          Showing{' '}
          <span className="font-semibold text-ink">
            {total === 0 ? 0 : from}–{to}
          </span>{' '}
          of <span className="font-semibold text-ink">{total}</span> products
        </p>
      </div>

      {/* Right Group: Sort Dropdown + Grid View Switcher */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <label className="flex items-center gap-2 font-label text-xs sm:text-sm text-ink-muted">
          <span>Sort:</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-[6px] border border-primary/15 bg-white px-2.5 py-1.5 text-xs sm:text-sm font-medium text-ink outline-none transition focus:border-primary cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <div
          className="hidden items-center gap-1 rounded-[6px] border border-primary/10 p-1 sm:flex"
          role="group"
          aria-label="Grid layout"
        >
          {VIEW_OPTIONS.map(({ id, icon: Icon, label }) => (
            <button
              key={String(id)}
              type="button"
              aria-label={label}
              aria-pressed={view === id}
              onClick={() => onViewChange(id)}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-[4px] transition cursor-pointer',
                view === id
                  ? 'bg-primary text-white'
                  : 'text-ink-muted hover:bg-rose-light/60 hover:text-primary',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
