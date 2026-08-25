import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { motion } from 'framer-motion'
import { HERO_SLIDES } from '@/constants/data'
import { useCmsData } from '@/hooks/useCmsData'
import 'swiper/css'
import 'swiper/css/pagination'

function getMobileHeroSrcSet(imgUrl) {
  if (!imgUrl || typeof imgUrl !== 'string') return undefined;
  if (imgUrl.includes('/images/home/hero/hero-slide-1')) {
    return '/images/home/hero/hero-slide-1-480.webp 480w, /images/home/hero/hero-slide-1-768.webp 768w';
  }
  if (imgUrl.includes('/images/home/hero/hero-slide-2')) {
    return '/images/home/hero/hero-slide-2-480.webp 480w, /images/home/hero/hero-slide-2-768.webp 768w';
  }
  if (imgUrl.includes('/images/home/hero/hero-slide-3')) {
    return '/images/home/hero/hero-slide-3-480.webp 480w, /images/home/hero/hero-slide-3-768.webp 768w';
  }
  return undefined;
}

export default function MobileHero() {
  const { heroSlides } = useCmsData()
  const slides = heroSlides?.length ? heroSlides : HERO_SLIDES

  // Inject dynamic preload for the first hero image to reduce mobile LCP Resource Load Delay
  useEffect(() => {
    if (slides?.[0]) {
      const rawImgUrl = slides[0].image || slides[0].banner_image || slides[0].image_url
      const imgUrl = rawImgUrl?.includes('/images/home/hero/hero-slide-') ? rawImgUrl.replace('.webp', '-768.webp') : rawImgUrl
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
      className="w-full mb-4 overflow-hidden"
      aria-label="Featured collection"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="mobile-hero-swiper w-full overflow-hidden"
      >
        {slides.map((slide, index) => {
          const hasEyebrow = Boolean(slide.eyebrow && String(slide.eyebrow).trim())
          const hasTitle = Boolean(slide.title && String(slide.title).trim())
          const hasHighlight = Boolean(slide.highlight && String(slide.highlight).trim())
          const hasSubtitle = Boolean(slide.subtitle && String(slide.subtitle).trim())
          const hasCta = Boolean(slide.cta && String(slide.cta).trim())
          const hasContent = hasEyebrow || hasTitle || hasHighlight || hasSubtitle || hasCta
          const slideLink = slide.href || slide.cta_link || '/shop'

          const rawSlideImg = slide.image || slide.banner_image || slide.image_url || '/images/home/hero/hero-slide-1.webp'
          const slideImg = rawSlideImg.includes('/images/home/hero/hero-slide-') && !rawSlideImg.includes('-768.webp') && !rawSlideImg.includes('-480.webp')
            ? rawSlideImg.replace('.webp', '-768.webp')
            : rawSlideImg
          const mobileSrcSet = getMobileHeroSrcSet(rawSlideImg)

          if (!hasContent) {
            return (
              <SwiperSlide key={slide.id || index}>
                <Link
                  to={slideLink}
                  className="relative block w-full aspect-[2/1] sm:aspect-[21/9] min-h-[200px] overflow-hidden bg-[#EFE6E0]"
                  aria-label={slide.alt || 'Hero banner'}
                >
                  <img
                    src={slideImg}
                    srcSet={mobileSrcSet}
                    sizes="(max-width: 480px) 480px, 768px"
                    alt={slide.alt || slide.title || 'Featured Banner'}
                    className="h-full w-full object-cover object-center"
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    width="768"
                    height="384"
                    onError={(e) => {
                      e.currentTarget.src = '/images/home/hero/hero-slide-1-768.webp'
                    }}
                  />
                </Link>
              </SwiperSlide>
            )
          }

          return (
            <SwiperSlide key={slide.id || index}>
              <div className="relative w-full aspect-[2/1] sm:aspect-[21/9] min-h-[220px] overflow-hidden bg-[#EFE6E0]">
                {/* Full-bleed background image */}
                <img
                  src={slideImg}
                  srcSet={mobileSrcSet}
                  sizes="(max-width: 480px) 480px, 768px"
                  alt={slide.alt || slide.title || 'Featured collection'}
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  width="768"
                  height="384"
                  onError={(e) => {
                    e.currentTarget.src = '/images/home/hero/hero-slide-1-768.webp'
                  }}
                />

                {/* Soft gradient overlay for text readability */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#EFE6E0]/95 via-[#EFE6E0]/60 to-transparent z-[2]" />

                {/* Content Overlay */}
                <div className="relative z-10 flex h-full w-[65%] flex-col justify-center py-4 pl-4 pr-2 sm:pl-6">
                  {hasEyebrow && (
                    <p className="font-label text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                      {slide.eyebrow}
                    </p>
                  )}
                  {(hasTitle || hasHighlight) && (
                    <h1 className="mt-1 font-label text-[20px] sm:text-[24px] font-bold leading-[1.15] tracking-tight text-[#4A2F3C]">
                      {slide.title}{' '}
                      {hasHighlight && <span className="font-semibold text-primary">{slide.highlight}</span>}
                    </h1>
                  )}
                  {hasSubtitle && (
                    <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-[#7A5A6A] sm:text-xs">
                      {slide.subtitle}
                    </p>
                  )}
                  {hasCta && (
                    <Link
                      to={slideLink}
                      className="mt-2.5 inline-flex w-fit items-center justify-center rounded-lg bg-primary px-3.5 py-1.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-white shadow-sm hover:bg-primary-deep"
                    >
                      {slide.cta || 'Shop Now'}
                    </Link>
                  )}
                </div>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>

      <style>{`
        .mobile-hero-swiper .swiper-pagination {
          bottom: 8px !important;
        }
        .mobile-hero-swiper .swiper-pagination-bullet {
          width: 6px !important;
          height: 6px !important;
          background: #dfafc7 !important;
          opacity: 0.9 !important;
        }
        .mobile-hero-swiper .swiper-pagination-bullet-active {
          background: #ad4a85 !important;
          width: 16px !important;
          border-radius: 999px !important;
        }
      `}</style>
    </motion.section>
  )
}
