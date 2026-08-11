import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, ShoppingBag, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import ProductBadge from '@/components/shop/ProductBadge'
import WishlistButton from '@/components/shop/WishlistButton'
import { SHOP_COLORS } from '@/constants/shopProducts'
import { cn, formatINR } from '@/lib/utils'
import { useCartStore } from '@/store'

function toCartProduct(product) {
  const primaryImg =
    product.image ||
    product.primary_image ||
    product.images?.primary ||
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'

  return {
    id: product.id,
    name: product.title || product.name || 'Jalyn Essential Item',
    price: product.price,
    image: primaryImg,
    href: `/products/${product.slug || product.id}`,
  }
}

function ShopProductCard({ product, listView = false, onQuickView }) {
  const [hovered, setHovered] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const colorMap = Object.fromEntries(SHOP_COLORS.map((c) => [c.id, c]))

  if (!product) return null

  const title = product.title || product.name || 'Jalyn Essential Item'
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
  const category = product.category || product.category_slug || 'dresses'
  const rating = product.rating || 4.8
  const reviewsCount = product.reviews ?? product.reviews_count ?? 12
  const originalPrice = product.originalPrice || product.original_price || product.compareAt

  if (listView) {
    return (
      <motion.article
        layout
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex gap-4 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-primary/5 sm:gap-5 sm:p-4"
      >
        <Link
          to={`/products/${product.slug || product.id}`}
          className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-[18px] sm:w-36"
        >
          <img
            src={primaryImg}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
            }}
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col py-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                {category}
              </p>
              <Link
                to={`/products/${product.slug || product.id}`}
                className="font-heading text-lg font-medium text-ink hover:text-primary"
              >
                {title}
              </Link>
            </div>
            <WishlistButton id={product.id} />
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-ink-muted">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="font-semibold text-ink">{rating}</span>
            <span>({reviewsCount} reviews)</span>
          </div>

          <p className="mt-2 line-clamp-2 text-xs text-ink-muted">
            {product.description}
          </p>

          <div className="mt-auto flex items-center justify-between pt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-heading text-lg font-semibold text-primary">
                {formatINR(product.price)}
              </span>
              {originalPrice > product.price && (
                <span className="text-xs text-ink-muted line-through">
                  {formatINR(originalPrice)}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => addItem(toCartProduct(product))}
              className="ml-auto rounded-lg bg-primary px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white"
            >
              Add to Bag
            </button>
          </div>
        </div>
      </motion.article>
    )
  }

  return (
    <article
      className="group relative transition-transform duration-300 hover:-translate-y-1.5 hover:scale-[1.01]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-rose-light/30 shadow-soft ring-1 ring-primary/5 transition duration-300 group-hover:shadow-lift">
        <Link to={`/products/${product.slug || product.id}`} className="block h-full w-full">
          <img
            src={hovered && hoverImg ? hoverImg : primaryImg}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
            }}
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badges?.includes('new') && (
            <ProductBadge type="new">New</ProductBadge>
          )}
          {product.badges?.includes('sale') && (
            <ProductBadge type="sale">Sale</ProductBadge>
          )}
          {product.badges?.includes('limited') && (
            <ProductBadge type="limited">Limited</ProductBadge>
          )}
          {product.discount >= 20 && !product.badges?.includes('sale') && (
            <ProductBadge type="discount">-{product.discount}%</ProductBadge>
          )}
        </div>

        <WishlistButton id={product.id} className="absolute right-3 top-3 z-10" />

        <div
          className={cn(
            'absolute inset-x-3 bottom-3 flex items-center gap-2 transition duration-300 z-10',
            hovered
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-3 opacity-0',
          )}
        >
          <button
            type="button"
            onClick={() => onQuickView?.(product)}
            className="group/qb flex flex-1 items-center justify-center gap-2 rounded-xl bg-white hover:bg-primary text-ink hover:text-white py-2.5 px-3 text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-sm transition-all duration-200 cursor-pointer"
            aria-label={`Quick view ${title}`}
          >
            <Eye className="h-4 w-4 text-primary group-hover/qb:text-white transition-colors" />
            <span className="text-ink group-hover/qb:text-white transition-colors">Quick View</span>
          </button>
          <button
            type="button"
            onClick={() => addItem(toCartProduct(product))}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary hover:bg-primary-deep text-white shadow-md transition-all duration-200 active:scale-90 cursor-pointer"
            aria-label={`Add ${title} to bag`}
          >
            <ShoppingBag className="h-4 w-4 text-white" strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-1 px-0.5">
        <p className="text-[11px] font-medium capitalize text-ink-muted">
          {category}
        </p>
        <Link
          to={`/products/${product.slug || product.id}`}
          className="block font-heading text-base font-medium text-ink transition hover:text-primary line-clamp-1"
        >
          {title}
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-base font-semibold text-primary">
            {formatINR(product.price)}
          </span>
          {originalPrice > product.price && (
            <span className="text-xs text-ink-muted line-through">
              {formatINR(originalPrice)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-xs text-ink-muted">
          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
          <span className="font-semibold text-ink">{rating}</span>
          <span>({reviewsCount})</span>
        </div>
      </div>
    </article>
  )
}

export default memo(ShopProductCard)
