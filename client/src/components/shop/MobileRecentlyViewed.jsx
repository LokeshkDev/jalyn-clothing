import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import MobileShopProductCard from '@/components/shop/MobileShopProductCard'
import { SHOP_PRODUCTS } from '@/constants/shopProducts'
import { useProductsApi } from '@/hooks/useProductsApi'

import 'swiper/css'
import 'swiper/css/navigation'

export default function MobileRecentlyViewed() {
  const { products } = useProductsApi()
  const list = products && products.length > 0 ? products : SHOP_PRODUCTS
  const recentlyViewed = list.slice(0, 8)

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

      <Swiper
        modules={[Navigation]}
        spaceBetween={14}
        slidesPerView={2.2}
        breakpoints={{
          480: { slidesPerView: 2.5, spaceBetween: 16 },
          640: { slidesPerView: 3.2, spaceBetween: 16 },
        }}
        className="pb-2 text-primary"
      >
        {recentlyViewed.map((product) => (
          <SwiperSlide key={product.id || product.slug} className="h-auto">
            <MobileShopProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
