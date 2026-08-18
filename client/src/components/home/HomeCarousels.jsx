import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import ProductCard from '@/components/ui/ProductCard'
import QuickViewModal from '@/components/shop/QuickViewModal'
import SectionHeader from '@/components/ui/SectionHeader'
import { normalizeProduct } from '@/hooks/useProductsApi'

import 'swiper/css'

const ease = [0.22, 1, 0.36, 1]

async function fetchNewArrivals() {
  try {
    const res = await api.get('/products', { params: { new_arrivals: '1' } })
    if (res.data?.success && Array.isArray(res.data.products)) {
      return res.data.products.map(normalizeProduct)
    }
  } catch (err) {
    console.warn('Failed to load new arrivals:', err)
  }
  return []
}

async function fetchSaleProducts() {
  try {
    const res = await api.get('/products', { params: { on_sale: '1' } })
    if (res.data?.success && Array.isArray(res.data.products)) {
      return res.data.products.map(normalizeProduct)
    }
  } catch (err) {
    console.warn('Failed to load sale products:', err)
  }
  return []
}

export function NewArrivalsCarousel() {
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ['products', 'new_arrivals'],
    queryFn: fetchNewArrivals,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  if (loading || products.length === 0) return null

  return (
    <motion.section
      className="relative overflow-hidden bg-white pt-12 md:pt-16 mb-[15px] lg:mb-5"
      aria-labelledby="new-arrivals-heading"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease }}
    >
      <div className="container-luxury relative">
        <SectionHeader
          label="Fresh Collection"
          title="New Arrivals"
          id="new-arrivals-heading"
        />

        <div className="trending-swiper-container relative px-1">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop={products.length >= 5}
            pagination={false}
            spaceBetween={20}
            breakpoints={{
              320: { slidesPerView: 2, spaceBetween: 12 },
              640: { slidesPerView: 3, spaceBetween: 16 },
              1024: { slidesPerView: 5, spaceBetween: 20 },
            }}
            className="pb-4 pt-2 text-primary"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id || product.slug} className="h-auto">
                <ProductCard
                  product={product}
                  onQuickView={() => setQuickViewProduct(product)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </motion.section>
  )
}

export function SaleCarousel() {
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ['products', 'on_sale'],
    queryFn: fetchSaleProducts,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })

  if (loading || products.length === 0) return null

  return (
    <motion.section
      className="relative overflow-hidden bg-white pt-12 md:pt-16 mb-[15px] lg:mb-5"
      aria-labelledby="sale-heading"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease }}
    >
      <div className="container-luxury relative">
        <SectionHeader
          label="Limited Time Offer"
          title="Exclusive Sale"
          id="sale-heading"
        />

        <div className="trending-swiper-container relative px-1">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop={products.length >= 5}
            pagination={false}
            spaceBetween={20}
            breakpoints={{
              320: { slidesPerView: 2, spaceBetween: 12 },
              640: { slidesPerView: 3, spaceBetween: 16 },
              1024: { slidesPerView: 5, spaceBetween: 20 },
            }}
            className="pb-4 pt-2 text-primary"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id || product.slug} className="h-auto">
                <ProductCard
                  product={product}
                  onQuickView={() => setQuickViewProduct(product)}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </motion.section>
  )
}
