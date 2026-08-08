import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Eye, ShoppingBag, Star } from 'lucide-react'
import { cn, formatINR } from '@/lib/utils'
import { useCartStore, useWishlistStore } from '@/store'

export default function ProductCard({ product }) {
  const [hovered, setHovered] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const toggleWish = useWishlistStore((s) => s.toggle)
  const wished = useWishlistStore((s) => s.ids.includes(product.id))

  return (
    <motion.article
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-rose-light/40 ring-1 ring-primary/5">
        <Link to={product.href} className="block h-full w-full">
          <img
            src={hovered && product.hoverImage ? product.hoverImage : product.image}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-luxury group-hover:scale-110"
          />
        </Link>

        {product.isNew && (
          <span className="absolute left-3 top-3 rounded bg-gradient-to-br from-primary to-primary-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-soft">
            New
          </span>
        )}

        <button
          type="button"
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={() => toggleWish(product.id)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur-sm transition-all hover:scale-110 hover:bg-primary hover:text-white"
        >
          <Heart
            className={cn('h-4 w-4', wished && 'fill-primary text-primary')}
          />
        </button>

        <div
          className={cn(
            'absolute inset-x-3 bottom-3 flex items-center gap-2 transition-all duration-500 ease-luxury',
            hovered ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0 pointer-events-none',
          )}
        >
          <button
            type="button"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-white/95 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-primary backdrop-blur-sm transition hover:bg-primary hover:text-white"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye className="h-3.5 w-3.5" />
            Quick View
          </button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => addItem(product)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary-soft text-white shadow-soft transition hover:brightness-110"
            aria-label={`Add ${product.name} to bag`}
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={2} />
          </motion.button>
        </div>
      </div>

      <div className="mt-3.5 space-y-1 px-0.5">
        <Link
          to={product.href}
          className="block font-heading text-[15px] font-medium text-ink transition-colors hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-[15px] font-semibold text-primary">
            {formatINR(product.price)}
          </span>
          {product.compareAt && (
            <span className="text-sm text-ink-muted line-through">
              {formatINR(product.compareAt)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 pt-0.5 text-xs text-ink-muted">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="font-medium text-ink">{product.rating}</span>
          <span>({product.reviews})</span>
        </div>
      </div>
    </motion.article>
  )
}
