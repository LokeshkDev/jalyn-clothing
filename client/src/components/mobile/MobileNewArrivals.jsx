import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Heart, Star } from 'lucide-react'
import { PRODUCTS } from '@/constants/data'
import { cn, formatINR } from '@/lib/utils'
import { useWishlistStore } from '@/store'
import { useProductsApi } from '@/hooks/useProductsApi'

export default function MobileNewArrivals() {
  const { products } = useProductsApi()
  const items = products && products.length > 0 ? products : PRODUCTS

  return (
    <motion.section
      className="mt-6 container-luxury mb-[15px] lg:mb-5"
      aria-labelledby="mobile-arrivals-heading"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-4 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h2
            id="mobile-arrivals-heading"
            className="font-label text-lg lg:text-2xl font-bold text-[#4A2F3C]"
          >
            New Arrivals
          </h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            Fresh Collection
          </span>
        </div>
        <Link
          to="/new-arrivals"
          className="flex items-center gap-0.5 font-label text-[13px] lg:text-[15px] font-semibold text-primary hover:underline"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto lg:grid lg:grid-cols-5 lg:gap-6 px-4 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.slice(0, 5).map((product) => (
          <MobileProductCard key={product.id || product.slug} product={product} />
        ))}
      </div>
    </motion.section>
  )
}

function MobileProductCard({ product }) {
  const toggleWish = useWishlistStore((s) => s.toggle)
  const wished = useWishlistStore((s) => s.ids.includes(product.id))

  const title = product.title || product.name || 'Jalyn Product'
  const img =
    product.image ||
    product.primary_image ||
    product.images?.primary ||
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'

  return (
    <article className="w-[158px] shrink-0 sm:w-[176px] lg:w-full">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-rose-light/40">
        <Link to={product.href || `/products/${product.slug || product.id}`} className="block h-full w-full">
          <img
            src={img}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
            }}
          />
        </Link>
        <span className="absolute left-2 top-2 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow-xs">
          New Arrival
        </span>
        <button
          type="button"
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={() => toggleWish(product.id)}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-primary shadow-sm active:scale-95 transition"
        >
          <Heart className={cn('h-3.5 w-3.5', wished && 'fill-primary')} strokeWidth={1.75} />
        </button>
      </div>
      <div className="mt-2.5 px-0.5">
        <Link
          to={product.href || `/products/${product.slug || product.id}`}
          className="line-clamp-1 font-label text-[13px] font-semibold text-[#4A2F3C]"
        >
          {title}
        </Link>
        <p className="mt-0.5 font-label text-[14px] font-bold text-primary">
          {formatINR(product.price)}
        </p>
        <div className="mt-1 flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                'h-3 w-3',
                i < Math.round(product.rating || 4.8)
                  ? 'fill-primary text-primary'
                  : 'fill-rose-light text-rose-light',
              )}
            />
          ))}
          <span className="ml-1 text-[10px] text-[#9A7A88]">({product.reviews || 12})</span>
        </div>
      </div>
    </article>
  )
}
