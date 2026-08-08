import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import MobileShopProductCard from '@/components/shop/MobileShopProductCard'
import { SHOP_PRODUCTS } from '@/constants/shopProducts'

export default function MobileRecentlyViewed() {
  const recentlyViewed = SHOP_PRODUCTS.slice(0, 6)

  return (
    <section className="mt-8 mb-6 px-4" aria-labelledby="mobile-recently-viewed">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="mobile-recently-viewed"
          className="font-display text-2xl font-medium tracking-tight text-ink"
        >
          Recently Viewed
        </h2>
        <Link
          to="/shop"
          className="flex items-center gap-1 font-label text-xs font-semibold text-primary hover:underline"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="flex gap-3.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {recentlyViewed.map((product) => (
          <div key={product.id} className="w-[160px] shrink-0 sm:w-[180px]">
            <MobileShopProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
