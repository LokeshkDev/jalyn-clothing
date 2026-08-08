import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, ShoppingBag, Star } from 'lucide-react'
import ProductBadge from '@/components/shop/ProductBadge'
import WishlistButton from '@/components/shop/WishlistButton'
import { SHOP_COLORS } from '@/constants/shopProducts'
import { cn, formatINR } from '@/lib/utils'
import { useCartStore } from '@/store'

function toCartProduct(product) {
  return {
    id: product.id,
    name: product.title,
    price: product.price,
    image: product.images.primary,
    href: `/products/${product.slug}`,
  }
}

function ShopProductCard({ product, listView = false, onQuickView }) {
  const [hovered, setHovered] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const colorMap = Object.fromEntries(SHOP_COLORS.map((c) => [c.id, c]))

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
          to={`/products/${product.slug}`}
          className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-[18px] sm:w-36"
        >
          <img
            src={product.images.primary}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col py-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                {product.category}
              </p>
              <Link
                to={`/products/${product.slug}`}
                className="font-heading text-lg font-medium text-ink hover:text-primary"
              >
                {product.title}
              </Link>
            </div>
            <WishlistButton id={product.id} />
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{product.description}</p>
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
            <span className="font-heading text-lg font-semibold text-primary">
              {formatINR(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-sm text-ink-muted line-through">
                {formatINR(product.originalPrice)}
              </span>
            )}
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
    <motion.article
      layout
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, scale: 1.01 }}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-rose-light/30 shadow-soft ring-1 ring-primary/5 transition duration-300 group-hover:shadow-lift">
        <Link to={`/products/${product.slug}`} className="block h-full w-full">
          <img
            src={
              hovered && product.images.hover
                ? product.images.hover
                : product.images.primary
            }
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
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

        <WishlistButton id={product.id} className="absolute right-3 top-3" />

        <div
          className={cn(
            'absolute inset-x-3 bottom-3 flex items-center gap-2 transition duration-300',
            hovered
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-3 opacity-0',
          )}
        >
          <button
            type="button"
            onClick={() => onQuickView?.(product)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-white/95 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-primary backdrop-blur-sm transition hover:bg-primary hover:text-white"
            aria-label={`Quick view ${product.title}`}
          >
            <Eye className="h-3.5 w-3.5" />
            Quick View
          </button>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={() => addItem(toCartProduct(product))}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-primary-soft text-white shadow-soft"
            aria-label={`Add ${product.title} to bag`}
          >
            <ShoppingBag className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      <div className="mt-3 space-y-1 px-0.5">
        <p className="text-[11px] font-medium capitalize text-ink-muted">
          {product.category}
        </p>
        <Link
          to={`/products/${product.slug}`}
          className="block font-heading text-[15px] font-medium text-ink transition hover:text-primary"
        >
          {product.title}
        </Link>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-heading text-[15px] font-semibold text-primary">
            {formatINR(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <>
              <span className="text-sm text-ink-muted line-through">
                {formatINR(product.originalPrice)}
              </span>
              <span className="text-xs font-semibold text-primary-deep">
                {product.discount}% off
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1 pt-0.5 text-xs text-ink-muted">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-3 w-3',
                i < Math.round(product.rating)
                  ? 'fill-primary text-primary'
                  : 'fill-rose-light text-rose-light',
              )}
            />
          ))}
          <span className="ml-1">({product.reviews})</span>
        </div>
        <div className="flex items-center gap-1.5 pt-1">
          {product.colors.slice(0, 4).map((id) => (
            <span
              key={id}
              title={colorMap[id]?.label}
              className="h-3.5 w-3.5 rounded-full ring-1 ring-primary/15"
              style={{ backgroundColor: colorMap[id]?.hex || '#ccc' }}
            />
          ))}
          {product.stock < 10 && (
            <span className="ml-1 text-[10px] font-medium text-primary-deep">
              Low stock
            </span>
          )}
        </div>
      </div>
    </motion.article>
  )
}

export default memo(ShopProductCard)
