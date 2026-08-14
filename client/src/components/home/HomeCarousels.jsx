import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import api from '@/services/api'
import ProductCard from '@/components/ui/ProductCard'
import QuickViewModal from '@/components/shop/QuickViewModal'
import SectionHeader from '@/components/ui/SectionHeader'
import { normalizeProduct } from '@/hooks/useProductsApi'

import 'swiper/css'

const ease = [0.22, 1, 0.36, 1]

export function NewArrivalsCarousel() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get('/products', { params: { new_arrivals: '1' } })
        if (res.data?.success && Array.isArray(res.data.products)) {
          setProducts(res.data.products.map(normalizeProduct))
        }
      } catch (err) {
        console.error('Failed to load new arrivals:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

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
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [quickViewProduct, setQuickViewProduct] = useState(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get('/products', { params: { on_sale: '1' } })
        if (res.data?.success && Array.isArray(res.data.products)) {
          setProducts(res.data.products.map(normalizeProduct))
        }
      } catch (err) {
        console.error('Failed to load sale products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

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
