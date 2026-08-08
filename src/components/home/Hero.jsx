import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import { motion } from 'framer-motion'
import { HERO_SLIDES } from '@/constants/data'
import { Button } from '@/components/ui/Button'
import { FloatingPetals, BlossomBadge } from '@/components/ui/BlossomDecor'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary" aria-label="Hero">
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
            <div className="relative min-h-[min(88vh,820px)] w-full overflow-hidden">
              {/* Full-bleed background image */}
              <motion.img
                src={slide.image}
                alt={slide.alt}
                className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
                fetchPriority={index === 0 ? 'high' : 'auto'}
                initial={{ scale: 1.12 }}
                animate={{ scale: 1 }}
                transition={{ duration: 6.5, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Pink editorial wash — no blue */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#2a0f1c]/72 via-[#AD4A85]/45 to-[#AD4A85]/15" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a0a12]/50 via-transparent to-[#AD4A85]/20" />

              <FloatingPetals className="z-[1] opacity-80" />

              <div className="relative z-10 flex min-h-[min(88vh,820px)] items-center">
                <div className="container-luxury w-full py-20 sm:py-24">
                  <motion.div
                    initial={{ opacity: 0, y: 36 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="max-w-xl"
                  >
                    <div className="mb-4 flex items-center gap-3">
                      <BlossomBadge />
                      <p className="section-label !text-rose-light">{slide.eyebrow}</p>
                    </div>
                    <h1 className="font-display text-4xl font-medium leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-[4rem]">
                      {slide.title}{' '}
                      <span className="italic text-rose-light">{slide.highlight}</span>
                    </h1>
                    <p className="mt-5 max-w-md text-base leading-relaxed text-white/85 sm:text-lg">
                      {slide.subtitle}
                    </p>
                    <motion.div
                      className="mt-9"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.7 }}
                    >
                      <Link to={slide.href}>
                        <Button className="shadow-[0_12px_40px_rgba(173,74,133,0.35)]">
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
          background: #efd7e3 !important;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background: #fff !important;
        }
      `}</style>
    </section>
  )
}
