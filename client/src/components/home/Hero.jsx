import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import { motion } from 'framer-motion'
import { HERO_SLIDES } from '@/constants/data'
import { Button } from '@/components/ui/Button'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

export default function Hero() {
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
        {HERO_SLIDES.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative min-h-[min(88vh,820px)] w-full overflow-hidden bg-[#EFE6E0]">
              {/* Full-bleed background image */}
              {index === 0 ? (
                <picture className="absolute inset-0 h-full w-full">
                  <source
                    type="image/avif"
                    srcSet="/images/home/hero/hero-slide-1-480.avif 480w, /images/home/hero/hero-slide-1-768.avif 768w, /images/home/hero/hero-slide-1-1080.avif 1080w, /images/home/hero/hero-slide-1-1440.avif 1440w"
                    sizes="100vw"
                  />
                  <source
                    type="image/webp"
                    srcSet="/images/home/hero/hero-slide-1-480.webp 480w, /images/home/hero/hero-slide-1-768.webp 768w, /images/home/hero/hero-slide-1-1080.webp 1080w, /images/home/hero/hero-slide-1-1440.webp 1440w"
                    sizes="100vw"
                  />
                  <img
                    src="/images/home/hero/hero-slide-1-1080.webp"
                    alt={slide.alt}
                    className="h-full w-full object-cover object-center"
                    fetchPriority="high"
                    loading="eager"
                    decoding="sync"
                    width="1080"
                    height="720"
                  />
                </picture>
              ) : (
                <picture className="absolute inset-0 h-full w-full">
                  <source
                    type="image/avif"
                    srcSet={`/images/home/hero/hero-slide-${index + 1}-480.avif 480w, /images/home/hero/hero-slide-${index + 1}-768.avif 768w, /images/home/hero/hero-slide-${index + 1}-1080.avif 1080w`}
                    sizes="100vw"
                  />
                  <source
                    type="image/webp"
                    srcSet={`/images/home/hero/hero-slide-${index + 1}-480.webp 480w, /images/home/hero/hero-slide-${index + 1}-768.webp 768w, /images/home/hero/hero-slide-${index + 1}-1080.webp 1080w`}
                    sizes="100vw"
                  />
                  <motion.img
                    src={slide.image}
                    alt={slide.alt}
                    className="h-full w-full scale-105 object-cover object-center"
                    loading="lazy"
                    decoding="async"
                    width="1080"
                    height="720"
                    initial={{ scale: 1.12 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 6.5, ease: [0.22, 1, 0.36, 1] }}
                  />
                </picture>
              )}

              {/* Light gradient overlay matching mobile hero palette */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#EFE6E0]/95 via-[#EFE6E0]/70 to-transparent" />

              <div className="relative z-10 flex min-h-[min(88vh,820px)] items-center">
                <div className="container-luxury w-full py-20 sm:py-24">
                  <motion.div
                    initial={{ opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-xl"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <p className="font-label text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        {slide.eyebrow}
                      </p>
                    </div>
                    <h1 className="font-label text-4xl font-bold leading-[1.12] tracking-tight text-[#4A2F3C] sm:text-5xl lg:text-6xl xl:text-[4rem]">
                      {slide.title}{' '}
                      <span className="font-semibold text-primary">{slide.highlight}</span>
                    </h1>
                    <p className="mt-5 max-w-md text-base leading-relaxed text-[#7A5A6A] sm:text-lg">
                      {slide.subtitle}
                    </p>
                    <motion.div
                      className="mt-9"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.7 }}
                    >
                      <Link to={slide.href}>
                        <Button className="bg-primary text-white hover:bg-primary-deep shadow-[0_12px_40px_rgba(173,74,133,0.35)]">
                          {slide.cta}
                        </Button>
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .hero-swiper .swiper-pagination {
          bottom: 28px !important;
        }
        .hero-swiper .swiper-pagination-bullet {
          background: #dfafc7 !important;
          opacity: 1 !important;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background: #ad4a85 !important;
          width: 24px !important;
          border-radius: 999px !important;
        }
      `}</style>
    </motion.section>
  )
}
