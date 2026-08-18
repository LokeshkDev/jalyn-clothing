import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Button } from '@/components/ui/Button'

import { useCmsData } from '@/hooks/useCmsData'

export default function Lookbook() {
  const { promoBanner } = useCmsData()
  const badge = promoBanner?.badge || 'Lookbook'
  const title = promoBanner?.title || 'Timeless Elegance, Every Moment'
  const subtitle = promoBanner?.subtitle || 'Explore our seasonal lookbook — quiet luxury silhouettes styled for mornings, evenings, and everything in between.'
  const ctaText = promoBanner?.cta_text || 'Explore Lookbook'
  const ctaLink = promoBanner?.cta_link || '/lookbook'
  const bgImage = promoBanner?.bg_image || '/images/home/banners/lookbook-promo.webp'

  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])

  return (
    <motion.section
      ref={ref}
      className="overflow-hidden mb-[15px] lg:mb-5"
      aria-labelledby="lookbook-heading"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid lg:grid-cols-5">
        <div className="relative flex items-center overflow-hidden bg-gradient-to-br from-rose-light via-[#F6E4EC] to-rose px-8 py-16 sm:px-12 lg:col-span-2 lg:px-14 lg:py-24">
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-[1]"
          >
            <div className="mb-3 flex items-center gap-2">
              <p className="section-label">{badge}</p>
            </div>
            <h2
              id="lookbook-heading"
              className="mt-2 font-display text-3xl font-medium leading-tight tracking-tight text-ink md:text-4xl lg:text-[2.75rem]"
            >
              {title}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted md:text-base">
              {subtitle}
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Link to={ctaLink}>
                <Button>{ctaText}</Button>
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="relative min-h-[380px] overflow-hidden lg:col-span-3 lg:min-h-[520px]">
          <motion.img
            style={{ y }}
            src={bgImage}
            alt="Promo banner collection"
            className="absolute inset-0 h-[120%] w-full object-cover object-center"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent to-primary/10" />
        </div>
      </div>
    </motion.section>
  )
}
