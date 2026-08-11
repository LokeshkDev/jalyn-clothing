import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react'
import { cn, formatINR } from '@/lib/utils'
import { useCartStore, useWishlistStore } from '@/store'

import WishlistButton from '@/components/shop/WishlistButton'

export default function ProductCard({ product, onQuickView }) {
  const [hovered, setHovered] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  if (!product) return null

  const title = product.name || product.title || 'Jalyn Essential Item'
  const primaryImg =
    product.image ||
    product.primary_image ||
    product.images?.primary ||
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
  const hoverImg =
    product.hoverImage ||
    product.hover_image ||
    product.images?.hover ||
    primaryImg
  const price = Number(product.price) || 0
  const compareAt = product.compareAt || product.originalPrice || product.original_price
  const rating = product.rating || 4.8
  const reviewsCount = product.reviews ?? product.reviews_count ?? 12
  const href = product.href || `/products/${product.slug || product.id}`

  return (
    <article
      className="group relative transition-transform duration-300 hover:-translate-y-1.5"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-rose-light/40 ring-1 ring-primary/5">
        <Link to={href} className="block h-full w-full">
          <img
            src={hovered && hoverImg ? hoverImg : primaryImg}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
            }}
          />
        </Link>

        {(product.isNew || product.discount > 0) && (
          <span className="absolute left-3 top-3 rounded bg-gradient-to-br from-primary to-primary-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-soft z-10">
            {product.discount ? `${product.discount}% Off` : 'New'}
          </span>
        )}

        <WishlistButton id={product.id} className="absolute right-3 top-3 z-10" />

        <div
          className={cn(
            'absolute inset-x-3 bottom-3 flex items-center gap-2 transition-all duration-300 ease-luxury z-10',
            hovered
              ? 'translate-y-0 opacity-100'
              : 'translate-y-3 opacity-0 pointer-events-none',
          )}
        >
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (onQuickView) onQuickView(product)
            }}
            className="group/qb flex flex-1 items-center justify-center gap-2 rounded-xl bg-white hover:bg-primary text-ink hover:text-white py-2.5 px-3 text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-sm transition-all duration-200 cursor-pointer"
            aria-label={`Quick view ${title}`}
          >
            <Eye className="h-4 w-4 text-primary group-hover/qb:text-white transition-colors" />
            <span className="text-ink group-hover/qb:text-white transition-colors">Quick View</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              addItem({
                id: product.id,
                name: title,
                price: price,
                image: primaryImg,
                href: href,
              })
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary hover:bg-primary-deep text-white shadow-md transition-all duration-200 active:scale-90 cursor-pointer"
            aria-label={`Add ${title} to bag`}
          >
            <ShoppingBag className="h-4 w-4 text-white" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mt-3.5 space-y-1 px-0.5">
        <Link
          to={href}
          className="block font-heading text-[15px] font-medium text-ink transition-colors hover:text-primary line-clamp-1"
        >
          {title}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-[15px] font-semibold text-primary">
            {formatINR(price)}
          </span>
          {compareAt && compareAt > price && (
            <span className="text-sm text-ink-muted line-through">
              {formatINR(compareAt)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 pt-0.5 text-xs text-ink-muted">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="font-medium text-ink">{rating}</span>
          <span>({reviewsCount})</span>
        </div>
      </div>
    </article>
  )
}
