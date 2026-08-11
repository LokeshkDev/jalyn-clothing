import { Flower2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-rose-light/30 px-6 py-20 text-center ring-1 ring-primary/8">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white text-primary shadow-soft">
        <Flower2 className="h-7 w-7" strokeWidth={1.4} />
      </div>
      <h3 className="font-display text-2xl font-medium text-ink">No products found</h3>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        We couldn&apos;t find pieces matching your filters. Try adjusting your
        selection for a wider edit.
      </p>
      <Button type="button" className="mt-6" onClick={onReset}>
        Reset Filters
      </Button>
    </div>
  )
}
