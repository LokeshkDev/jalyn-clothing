import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { COLLECTIONS } from '@/constants/data'
import SectionHeader from '@/components/ui/SectionHeader'
import { useProductsApi } from '@/hooks/useProductsApi'

import 'swiper/css'

export default function Collections() {
  const { categories, products } = useProductsApi()

  // Calculate live dynamic product count per category
  const productCountBySlug = useMemo(() => {
    const counts = {}
    if (Array.isArray(products) && products.length > 0) {
      products.forEach((p) => {
        const catSlug = String(p.category_slug || p.category || '').toLowerCase().trim()
        if (catSlug) {
          counts[catSlug] = (counts[catSlug] || 0) + 1
        }
      })
    }
    return counts
  }, [products])

  const items = useMemo(() => {
    const rawItems = categories && categories.length > 0 ? categories : COLLECTIONS
    return rawItems.map((col) => {
      const slug = String(col.slug || col.id || '').toLowerCase().trim()
      let count = 0

      if (productCountBySlug[slug] !== undefined) {
        count = productCountBySlug[slug]
      } else if (col.item_count !== undefined && col.item_count !== null && !isNaN(Number(col.item_count))) {
        count = Number(col.item_count)
      }

      const countText = count === 1 ? '1 Item' : `${count} Items`

      return {
        ...col,
        dynamicCount: count,
        countText,
      }
    })
  }, [categories, productCountBySlug])

  return (
    <motion.section
      className="relative overflow-hidden bg-[#FAF6F8]/60 pt-8 md:pt-12 mb-[15px] lg:mb-5"
      aria-labelledby="collections-heading"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container-luxury">
        <SectionHeader
          label="Categories"
          title="Curated for Every You"
          id="collections-heading"
        />

        {/* Auto Carousel Swiper (Without arrows or bullets) */}
        <div className="collections-swiper-container relative px-1">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop={true}
            pagination={false}
            spaceBetween={16}
            breakpoints={{
              320: { slidesPerView: 2, spaceBetween: 12 },
              640: { slidesPerView: 3, spaceBetween: 16 },
              1024: { slidesPerView: 6, spaceBetween: 20 },
            }}
            className="pb-4 pt-2 text-primary"
          >
            {items.map((collection, i) => (
              <SwiperSlide key={collection.id || i} className="h-auto">
                <motion.div
                  whileHover={{ y: -6 }}
                  className="h-full"
                >
                  <Link
                    to={collection.href || `/shop?category=${collection.slug}`}
                    className="group relative block overflow-hidden rounded-xl shadow-soft ring-1 ring-primary/5 h-full"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-rose-light/40">
                      <img
                        src={collection.image || collection.image_url}
                        alt={collection.title || collection.name}
                        loading="lazy"
                        decoding="async"
                        width="320"
                        height="426"
                        className="img-zoom h-full w-full object-cover duration-700 group-hover:scale-110 will-change-transform"
                        onError={(e) => {
                          e.currentTarget.src = '/images/home/categories/dresses.webp'
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2a0f1c]/70 via-primary/20 to-transparent transition-opacity group-hover:from-[#AD4A85]/75" />
                    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                      <h3 className="font-display text-base font-medium text-white sm:text-lg">
                        {collection.title || collection.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-white/80 font-medium">
                        {collection.countText}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </motion.section>
  )
}
