import { useState } from 'react'
import { ShoppingBag, Truck, RotateCcw, Heart, Share2, ShieldCheck } from 'lucide-react'
import { useCartStore, useWishlistStore } from '@/store'
import { cn } from '@/lib/utils'

export default function ProductPurchaseCard({ product, selectedSize, selectedColor }) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const wishStore = useWishlistStore()
  const isWishlisted = wishStore.has(product.id)
  const [copied, setCopied] = useState(false)

  const handleAddBag = () => {
    addItem({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.images.primary,
      size: selectedSize,
      color: selectedColor,
      href: `/products/${product.slug}`,
    })
  }

  const handleBuyNow = () => {
    handleAddBag()
    openCart()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Upper Support / Delivery Card */}
      <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-light/50 text-primary">
            <Truck className="h-4 w-4" />
          </div>
          <div>
            <p className="font-label text-xs font-bold text-ink">Free Delivery</p>
            <p className="text-xs text-ink-muted">On orders above ₹1999</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-primary/5 pt-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-light/50 text-primary">
            <RotateCcw className="h-4 w-4" />
          </div>
          <div>
            <p className="font-label text-xs font-bold text-ink">Easy Returns</p>
            <p className="text-xs text-ink-muted">Hassle-free returns within 7 days</p>
          </div>
        </div>
      </div>

      {/* Primary CTA: ADD TO BAG */}
      <button
        type="button"
        onClick={handleAddBag}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary font-label text-xs font-bold uppercase tracking-[0.14em] text-white shadow-soft transition-all duration-300 hover:bg-primary-deep hover:shadow-lift active:scale-[0.99]"
      >
        <ShoppingBag className="h-4 w-4" />
        <span>ADD TO BAG</span>
      </button>

      {/* Secondary CTA: BUY NOW */}
      <button
        type="button"
        onClick={handleBuyNow}
        className="flex h-14 w-full items-center justify-center rounded-xl border-2 border-primary bg-white font-label text-xs font-bold uppercase tracking-[0.14em] text-primary transition-all duration-300 hover:bg-rose-light/30 active:scale-[0.99]"
      >
        <span>BUY NOW</span>
      </button>

      {/* Wishlist + Share Links */}
      <div className="flex items-center justify-around border-t border-primary/10 pt-3 text-xs font-label">
        <button
          type="button"
          onClick={() => wishStore.toggle(product.id)}
          className={cn(
            'flex items-center gap-1.5 transition-colors',
            isWishlisted ? 'font-bold text-primary' : 'text-ink-muted hover:text-primary',
          )}
        >
          <Heart className={cn('h-4 w-4', isWishlisted && 'fill-primary text-primary')} />
          <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
        </button>

        <span className="text-primary/20" aria-hidden>
          |
        </span>

        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-1.5 text-ink-muted hover:text-primary transition-colors"
        >
          <Share2 className="h-4 w-4" />
          <span>{copied ? 'Copied Link!' : 'Share'}</span>
        </button>
      </div>

      {/* Secure Payment Card */}
      <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-label text-xs font-bold text-ink">Secure Payments</p>
            <p className="text-[11px] text-ink-muted">100% secure payment options</p>
          </div>
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
        </div>

        <div className="mt-3 flex items-center gap-2 pt-2 border-t border-primary/5">
          <span className="rounded border border-gray-200 px-2 py-1 text-[10px] font-bold text-blue-900 bg-gray-50">
            VISA
          </span>
          <span className="rounded border border-gray-200 px-2 py-1 text-[10px] font-bold text-red-600 bg-gray-50">
            Mastercard
          </span>
          <span className="rounded border border-gray-200 px-2 py-1 text-[10px] font-bold text-orange-600 bg-gray-50">
            UPI
          </span>
          <span className="rounded border border-gray-200 px-2 py-1 text-[10px] font-bold text-emerald-700 bg-gray-50">
            RuPay
          </span>
          <span className="rounded border border-gray-200 px-2 py-1 text-[10px] font-bold text-sky-600 bg-gray-50">
            Paytm
          </span>
        </div>
      </div>
    </div>
  )
}
