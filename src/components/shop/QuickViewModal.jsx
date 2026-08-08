import * as Dialog from '@radix-ui/react-dialog'
import { X, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatINR } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/store'

export default function QuickViewModal({ product, open, onClose }) {
  const addItem = useCartStore((s) => s.addItem)
  if (!product) return null

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-[#2A1A22]/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] max-h-[90vh] w-[min(920px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-4 shadow-lift outline-none sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <Dialog.Title className="font-display text-2xl font-medium text-ink">
              {product.title}
            </Dialog.Title>
            <Dialog.Close
              aria-label="Close quick view"
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-rose-light/60"
            >
              <X className="h-5 w-5 text-primary" />
            </Dialog.Close>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="aspect-[4/5] overflow-hidden rounded-[18px] bg-rose-light/30">
              <img
                src={product.images.primary}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {product.category}
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading text-2xl font-semibold text-primary">
                  {formatINR(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-ink-muted line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm text-ink-muted">
                <Star className="h-4 w-4 fill-primary text-primary" />
                {product.rating} ({product.reviews} reviews)
              </div>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                {product.description}
              </p>
              <p className="mt-3 text-xs text-ink-muted">
                Sizes: {product.sizes.join(' · ')}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  type="button"
                  onClick={() => {
                    addItem({
                      id: product.id,
                      name: product.title,
                      price: product.price,
                      image: product.images.primary,
                      href: `/products/${product.slug}`,
                    })
                    onClose()
                  }}
                >
                  Add to Bag
                </Button>
                <Link
                  to={`/products/${product.slug}`}
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-md border border-primary px-7 py-3.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-primary transition hover:bg-primary hover:text-white"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
