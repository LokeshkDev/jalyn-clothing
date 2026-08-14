import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCmsData } from '@/hooks/useCmsData'

export default function MobilePromo() {
  const { promoBanner } = useCmsData()
  const title = promoBanner?.title || 'UP TO 30% OFF'
  const subtitle = promoBanner?.subtitle || 'On Selected Styles'
  const ctaText = promoBanner?.cta_text || 'Shop Now'
  const ctaLink = promoBanner?.cta_link || '/collections/sale'
  const bgImage = promoBanner?.bg_image || 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80'

  return (
    <motion.section
      className="mt-6 px-4 mb-[15px] lg:mb-5"
      aria-label="Sale promotion"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="relative flex min-h-[150px] overflow-hidden rounded-2xl bg-[#EDE4DC] sm:min-h-[170px]">
        <div className="relative z-10 flex w-[48%] flex-col justify-center py-5 pl-4 pr-2">
          <p className="font-label text-[18px] font-bold leading-tight text-[#4A2F3C] sm:text-[22px] break-words">
            {title}
          </p>
          <p className="mt-1 font-label text-[12px] font-medium text-[#4A2F3C]/80">
            {subtitle}
          </p>
          <Link
            to={ctaLink}
            className="mt-3 inline-flex w-fit items-center justify-center rounded-lg bg-primary px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white"
          >
            {ctaText}
          </Link>
        </div>
        <div className="absolute inset-y-0 right-0 w-[58%]">
          <img
            src={bgImage}
            alt="Selected styles on sale"
            className="h-full w-full object-cover object-top"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-[#EDE4DC] to-transparent" />
        </div>
      </div>
    </motion.section>
  )
}
