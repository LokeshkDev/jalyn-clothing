import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { PRODUCTS } from '@/constants/data'
import ProductCard from '@/components/ui/ProductCard'
import QuickViewModal from '@/components/shop/QuickViewModal'
import { Button } from '@/components/ui/Button'
import SectionHeader from '@/components/ui/SectionHeader'
import { useProductsApi } from '@/hooks/useProductsApi'

import 'swiper/css'

export default function TrendingProducts() {
  const { products } = useProductsApi()
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const items = products && products.length > 0 ? products : PRODUCTS

  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-20" aria-labelledby="trending-heading">
      <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-rose-light/60 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-10 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />

      <div className="container-luxury relative">
        <SectionHeader
          label="Trending Now"
          title="Most Loved Styles"
          id="trending-heading"
        />

        {/* Auto Carousel Swiper (Clean without bullets or arrows) */}
        <div className="trending-swiper-container relative px-1">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            loop={true}
            pagination={false}
            spaceBetween={20}
            breakpoints={{
              320: { slidesPerView: 2, spaceBetween: 12 },
              640: { slidesPerView: 3, spaceBetween: 16 },
              1024: { slidesPerView: 5, spaceBetween: 20 },
            }}
            className="pb-4 pt-2 text-primary"
          >
            {items.map((product) => (
              <SwiperSlide key={product.id || product.slug} className="h-auto">
                <ProductCard
                  product={product}
                  onQuickView={setQuickViewProduct}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <motion.div
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link to="/shop">
            <Button size="lg" className="px-8 py-3 text-xs tracking-[0.18em]">
              VIEW ALL PRODUCTS
            </Button>
          </Link>
        </motion.div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        open={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </section>
  )
}
