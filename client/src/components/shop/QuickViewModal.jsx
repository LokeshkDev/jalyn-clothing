import { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Star, MapPin, CheckCircle2, Lock, AlertCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatINR, cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { useCartStore, useDeliveryStore } from '@/store'

export default function QuickViewModal({ product, open, onClose }) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const deliveryStore = useDeliveryStore()

  const [inputPincode, setInputPincode] = useState(deliveryStore.pincode || '')
  const [pincodeError, setPincodeError] = useState('')

  useEffect(() => {
    if (deliveryStore.pincode) {
      setInputPincode(deliveryStore.pincode)
    }
  }, [deliveryStore.pincode])

  if (!product) return null

  const title = product.title || product.name || 'Jalyn Essential Item'
  const primaryImg =
    product.image ||
    product.primary_image ||
    product.images?.primary ||
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
  const price = Number(product.price) || 0
  const originalPrice = product.originalPrice || product.original_price || product.compareAt
  const rating = product.rating || 4.8
  const reviewsCount = product.reviews ?? product.reviews_count ?? 12
  const category = product.category || product.category_slug || 'dresses'
  const description = product.description || 'Thoughtfully designed for elegance and comfort.'
  const sizes = Array.isArray(product.sizes)
    ? product.sizes
    : typeof product.sizes === 'string'
    ? JSON.parse(product.sizes)
    : ['S', 'M', 'L']
  const href = product.href || `/products/${product.slug || product.id}`

  const handleCheckDelivery = (e) => {
    e.preventDefault()
    setPincodeError('')
    const res = deliveryStore.verifyPincode(inputPincode)
    if (!res.success) {
      setPincodeError(res.message)
    }
  }

  const handleAddBag = () => {
    if (!deliveryStore.isVerified) return
    addItem({
      id: product.id,
      name: title,
      price: price,
      image: primaryImg,
      href: href,
    })
    onClose()
    openCart()
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-[#2A1A22]/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] max-h-[90vh] w-[min(920px,calc(100%-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white p-4 shadow-lift outline-none sm:p-6 theme-scrollbar">
          <div className="mb-4 flex items-start justify-between gap-3">
            <Dialog.Title className="font-display text-2xl font-medium text-ink">
              {title}
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
                src={primaryImg}
                alt={title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
                }}
              />
            </div>
            <div className="flex flex-col">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {category}
              </p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-heading text-2xl font-semibold text-primary">
                  {formatINR(price)}
                </span>
                {originalPrice > price && (
                  <span className="text-ink-muted line-through text-sm">
                    {formatINR(originalPrice)}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-1 text-sm text-ink-muted">
                <Star className="h-4 w-4 fill-primary text-primary" />
                {rating} ({reviewsCount} reviews)
              </div>
              <p className="mt-4 text-xs leading-relaxed text-ink-muted">
                {description}
              </p>
              <p className="mt-3 text-xs text-ink-muted font-medium">
                Sizes: {sizes.join(' · ')}
              </p>

              {/* Delivery Pincode Checker Widget in Quick View */}
              <div className={cn(
                'mt-4 rounded-xl border p-3 text-xs space-y-2 transition',
                deliveryStore.isVerified
                  ? 'border-emerald-300 bg-emerald-50/50'
                  : 'border-amber-300 bg-amber-50/40'
              )}>
                <div className="flex items-center justify-between font-label text-xs font-bold text-ink">
                  <div className="flex items-center gap-1.5">
                    <MapPin className={cn('h-3.5 w-3.5', deliveryStore.isVerified ? 'text-emerald-600' : 'text-amber-600')} />
                    <span>Check Delivery Pincode</span>
                  </div>
                  {deliveryStore.isVerified && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Verified ({deliveryStore.pincode})
                    </span>
                  )}
                </div>

                <form onSubmit={handleCheckDelivery} className="flex gap-2 pt-0.5">
                  <input
                    type="text"
                    maxLength={6}
                    value={inputPincode}
                    onChange={(e) => setInputPincode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter Pincode (e.g. 400050)"
                    className="flex-1 rounded-lg border border-primary/20 bg-white px-3 py-1.5 text-xs font-mono font-medium outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white uppercase hover:bg-primary-deep transition shrink-0"
                  >
                    {deliveryStore.isVerified ? 'Change' : 'Check'}
                  </button>
                </form>

                {pincodeError && (
                  <p className="flex items-center gap-1 text-[11px] text-red-500 font-medium">
                    <AlertCircle className="h-3 w-3" /> {pincodeError}
                  </p>
                )}

                {!deliveryStore.isVerified && (
                  <p className="text-[11px] text-amber-800 flex items-center gap-1">
                    <Lock className="h-3 w-3 text-amber-600 shrink-0" />
                    <span>Check pincode above to enable <strong>Add to Bag</strong>.</span>
                  </p>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleAddBag}
                  disabled={!deliveryStore.isVerified}
                  className={cn(
                    'rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider transition',
                    deliveryStore.isVerified
                      ? 'bg-primary text-white hover:bg-primary-deep shadow-soft'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  )}
                >
                  {deliveryStore.isVerified ? 'Add to Bag' : 'Verify Pincode to Add'}
                </button>
                <Link
                  to={href}
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-xl border border-primary px-6 py-3 text-xs font-bold uppercase tracking-wider text-primary transition hover:bg-primary hover:text-white"
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
