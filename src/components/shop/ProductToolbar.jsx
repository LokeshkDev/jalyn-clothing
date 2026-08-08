import { LayoutGrid, LayoutList, Rows3, Grid2x2 } from 'lucide-react'
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
  sticky,
}) {
  return (
    <div
      className={cn(
        'z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/95 px-4 py-3 shadow-soft ring-1 ring-primary/8 backdrop-blur-md',
        sticky && 'sticky top-[4.5rem] lg:top-[5.5rem]',
      )}
    >
      <p className="font-label text-sm text-ink-muted">
        Showing{' '}
        <span className="font-semibold text-ink">
          {total === 0 ? 0 : from}–{to}
        </span>{' '}
        of <span className="font-semibold text-ink">{total}</span> products
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 font-label text-sm text-ink-muted">
          Sort by:
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-lg border border-primary/15 bg-white px-3 py-2 text-sm font-medium text-ink outline-none transition focus:border-primary"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <div
          className="hidden items-center gap-1 rounded-lg border border-primary/10 p-1 sm:flex"
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
                'flex h-8 w-8 items-center justify-center rounded-md transition',
                view === id
                  ? 'bg-primary text-white'
                  : 'text-ink-muted hover:bg-rose-light/60 hover:text-primary',
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
