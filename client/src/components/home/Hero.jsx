import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import { motion } from 'framer-motion'
import { HERO_SLIDES } from '@/constants/data'
import { useCmsData } from '@/hooks/useCmsData'
import { Button } from '@/components/ui/Button'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

export default function Hero() {
  const { heroSlides } = useCmsData()
  const slides = heroSlides?.length ? heroSlides : HERO_SLIDES

  // Inject dynamic preload for the first hero image to reduce LCP Resource Load Delay
  useEffect(() => {
    if (slides?.[0]) {
      const imgUrl = slides[0].image || slides[0].banner_image || slides[0].image_url
      if (imgUrl && !document.querySelector(`link[rel="preload"][href="${CSS.escape(imgUrl)}"]`)) {
        const link = document.createElement('link')
        link.rel = 'preload'
        link.as = 'image'
        link.href = imgUrl
        link.fetchPriority = 'high'
        document.head.appendChild(link)
      }
    }
  }, [slides])

  return (
    <motion.section
      className="relative overflow-hidden bg-[#EFE6E0]"
      aria-label="Hero"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 5500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="hero-swiper"
      >
        {slides.map((slide, index) => {
          const hasEyebrow = Boolean(slide.eyebrow && String(slide.eyebrow).trim())
          const hasTitle = Boolean(slide.title && String(slide.title).trim())
          const hasHighlight = Boolean(slide.highlight && String(slide.highlight).trim())
          const hasSubtitle = Boolean(slide.subtitle && String(slide.subtitle).trim())
          const hasCta = Boolean(slide.cta && String(slide.cta).trim())

          const hasContent = hasEyebrow || hasTitle || hasHighlight || hasSubtitle || hasCta
          const slideLink = slide.href || slide.cta_link || '/shop'
          const slideImg = slide.image || slide.banner_image || slide.image_url || '/images/home/hero/hero-slide-1.webp'

          const imageElement = (
            <img
              src={slideImg}
              alt={slide.alt || slide.title || 'Hero Banner'}
              className="h-full w-full object-cover object-center"
              fetchPriority={index === 0 ? 'high' : 'auto'}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
              width="1440"
              height="720"
              onError={(e) => {
                e.currentTarget.src = '/images/home/hero/hero-slide-1.webp'
              }}
            />
          )

          return (
            <SwiperSlide key={slide.id || index}>
              <div className="relative min-h-[380px] sm:min-h-[420px] lg:min-h-[460px] xl:min-h-[480px] w-full overflow-hidden bg-[#EFE6E0]">
                {!hasContent ? (
                  /* When NO text/button fields: Show pure original image colors without ANY overlay */
                  <Link
                    to={slideLink}
                    className="relative block h-[380px] sm:h-[420px] lg:h-[460px] xl:h-[480px] w-full cursor-pointer overflow-hidden"
                    aria-label={slide.alt || 'Hero banner'}
                  >
                    <img
                      src={slideImg}
                      alt={slide.alt || slide.title || 'Hero Banner'}
                      className="h-full w-full object-cover object-center"
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      width="1440"
                      height="720"
                      onError={(e) => {
                        e.currentTarget.src = '/images/home/hero/hero-slide-1.webp'
                      }}
                    />
                  </Link>
                ) : (
                  /* When text/buttons exist: Show full-bleed background image with mild translucent overlay and readable typography */
                  <div className="relative min-h-[380px] sm:min-h-[420px] lg:min-h-[460px] xl:min-h-[480px] w-full">
                    <img
                      src={slideImg}
                      alt={slide.alt || slide.title || 'Hero Banner'}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      width="1440"
                      height="720"
                      onError={(e) => {
                        e.currentTarget.src = '/images/home/hero/hero-slide-1.webp'
                      }}
                    />

                    {/* Mild soft gradient overlay for text legibility */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#EFE6E0]/85 via-[#EFE6E0]/45 to-transparent z-[2]" />

                    <div className="relative z-10 flex min-h-[380px] sm:min-h-[420px] lg:min-h-[460px] xl:min-h-[480px] items-center">
                      <div className="container-luxury w-full py-10 sm:py-12 lg:py-14">
                        <motion.div
                          initial={{ opacity: 0, y: 36 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                          className="max-w-xl"
                        >
                          {hasEyebrow && (
                            <div className="mb-2 sm:mb-2.5 flex items-center gap-3">
                              <p className="font-label text-xs font-bold uppercase tracking-[0.18em] text-primary">
                                {slide.eyebrow}
                              </p>
                            </div>
                          )}
                          {(hasTitle || hasHighlight) && (
                            <h1 className="font-label text-3xl sm:text-4xl lg:text-[42px] xl:text-5xl font-bold leading-[1.14] tracking-tight text-[#4A2F3C]">
                              {slide.title}{' '}
                              {hasHighlight && <span className="font-semibold text-primary">{slide.highlight}</span>}
                            </h1>
                          )}
                          {hasSubtitle && (
                            <p className="mt-3 max-w-md text-sm sm:text-base leading-relaxed text-[#7A5A6A]">
                              {slide.subtitle}
                            </p>
                          )}
                          {hasCta && (
                            <motion.div
                              className="mt-6 sm:mt-7"
                              initial={{ opacity: 0, y: 16 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.35, duration: 0.7 }}
                            >
                              <Link to={slideLink}>
                                <Button className="bg-primary text-white hover:bg-primary-deep shadow-[0_12px_40px_rgba(173,74,133,0.35)]">
                                  {slide.cta}
                                </Button>
                              </Link>
                            </motion.div>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>

      <style>{`
        .hero-swiper .swiper-pagination {
          bottom: 16px !important;
          z-index: 20 !important;
        }
        .hero-swiper .swiper-pagination-bullet {
          background: #dfafc7 !important;
          opacity: 0.85 !important;
          width: 8px !important;
          height: 8px !important;
          transition: all 0.3s ease !important;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background: #ad4a85 !important;
          width: 24px !important;
          border-radius: 999px !important;
          opacity: 1 !important;
        }
      `}</style>
    </motion.section>
  )
}
