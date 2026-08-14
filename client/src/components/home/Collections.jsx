import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { COLLECTIONS } from '@/constants/data'
import SectionHeader from '@/components/ui/SectionHeader'
import { useProductsApi } from '@/hooks/useProductsApi'

import 'swiper/css'

export default function Collections() {
  const { categories } = useProductsApi()
  const items = categories && categories.length > 0 ? categories : COLLECTIONS

  return (
    <motion.section
      className="relative overflow-hidden bg-[#FAF6F8]/60 pt-16 md:pt-20 mb-[15px] lg:mb-5"
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
                        className="img-zoom h-full w-full object-cover duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src =
                            'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
                        }}
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2a0f1c]/70 via-primary/20 to-transparent transition-opacity group-hover:from-[#AD4A85]/75" />
                    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                      <h3 className="font-display text-base font-medium text-white sm:text-lg">
                        {collection.title || collection.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-white/80">
                        {collection.subtitle || `${collection.item_count || 10}+ Items`}
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
