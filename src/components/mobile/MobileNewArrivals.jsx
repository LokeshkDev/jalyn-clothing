import { Link } from 'react-router-dom'
import { ChevronRight, Heart, Star } from 'lucide-react'
import { PRODUCTS } from '@/constants/data'
import { cn, formatINR } from '@/lib/utils'
import { useWishlistStore } from '@/store'

export default function MobileNewArrivals() {
  return (
    <section className="mt-6" aria-labelledby="mobile-arrivals-heading">
      <div className="mb-3 flex items-center justify-between px-4">
        <h2
          id="mobile-arrivals-heading"
          className="font-label text-lg font-bold text-[#4A2F3C]"
        >
          New Arrivals
        </h2>
        <Link
          to="/collections/new-arrivals"
          className="flex items-center gap-0.5 font-label text-[13px] font-semibold text-primary"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {PRODUCTS.map((product) => (
          <MobileProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}

function MobileProductCard({ product }) {
  const toggleWish = useWishlistStore((s) => s.toggle)
  const wished = useWishlistStore((s) => s.ids.includes(product.id))

  return (
    <article className="w-[158px] shrink-0 sm:w-[176px]">
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-rose-light/40">
        <Link to={product.href} className="block h-full w-full">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </Link>
        {product.isNew && (
          <span className="absolute left-2 top-2 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">
            New
          </span>
        )}
        <button
          type="button"
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={() => toggleWish(product.id)}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-primary shadow-sm"
        >
          <Heart className={cn('h-3.5 w-3.5', wished && 'fill-primary')} strokeWidth={1.75} />
        </button>
      </div>
      <div className="mt-2.5 px-0.5">
        <Link
          to={product.href}
          className="line-clamp-1 font-label text-[13px] font-semibold text-[#4A2F3C]"
        >
          {product.name}
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
                i < Math.round(product.rating)
                  ? 'fill-primary text-primary'
                  : 'fill-rose-light text-rose-light',
              )}
            />
          ))}
          <span className="ml-1 text-[10px] text-[#9A7A88]">({product.reviews})</span>
        </div>
      </div>
    </article>
  )
}
