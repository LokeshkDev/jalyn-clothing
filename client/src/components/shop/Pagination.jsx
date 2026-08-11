import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-2"
      aria-label="Pagination"
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/15 text-primary transition hover:bg-primary hover:text-white disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          aria-label={`Page ${p}`}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onChange(p)}
          className={cn(
            'flex h-10 min-w-10 items-center justify-center rounded-full px-3 font-label text-sm font-semibold transition',
            p === page
              ? 'bg-primary text-white shadow-soft'
              : 'border border-primary/15 text-ink hover:border-primary hover:text-primary',
          )}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/15 text-primary transition hover:bg-primary hover:text-white disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
