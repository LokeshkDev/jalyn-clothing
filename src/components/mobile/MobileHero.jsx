import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { HERO_SLIDES } from '@/constants/data'
import 'swiper/css'
import 'swiper/css/pagination'

export default function MobileHero() {
  return (
    <section className="px-4 pt-1" aria-label="Featured collection">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="mobile-hero-swiper overflow-hidden rounded-2xl"
      >
        {HERO_SLIDES.map((slide, index) => (
          <SwiperSlide key={slide.id}>
            <div className="relative flex min-h-[210px] overflow-hidden rounded-2xl bg-[#EFE6E0] sm:min-h-[240px]">
              <div className="relative z-10 flex w-[52%] flex-col justify-center py-5 pl-4 pr-2 sm:pl-5">
                <p className="font-label text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                  {slide.eyebrow}
                </p>
                <h1 className="mt-1.5 font-label text-[22px] font-bold leading-[1.15] tracking-tight text-[#4A2F3C] sm:text-[26px]">
                  {slide.title}{' '}
                  <span className="font-semibold text-primary">{slide.highlight}</span>
                </h1>
                <p className="mt-2 line-clamp-2 text-[11px] leading-snug text-[#7A5A6A] sm:text-xs">
                  {slide.subtitle}
                </p>
                <Link
                  to={slide.href}
                  className="mt-3 inline-flex w-fit items-center justify-center rounded-lg bg-primary px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white"
                >
                  Shop Now
                </Link>
              </div>

              <div className="absolute inset-y-0 right-0 w-[55%]">
                <img
                  src={slide.image}
                  alt={slide.alt}
                  className="h-full w-full object-cover object-top"
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#EFE6E0] to-transparent" />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .mobile-hero-swiper .swiper-pagination {
          bottom: 10px !important;
        }
        .mobile-hero-swiper .swiper-pagination-bullet {
          width: 7px !important;
          height: 7px !important;
          background: #dfafc7 !important;
          opacity: 1 !important;
        }
        .mobile-hero-swiper .swiper-pagination-bullet-active {
          background: #ad4a85 !important;
          width: 18px !important;
          border-radius: 999px !important;
        }
      `}</style>
    </section>
  )
}
