import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { Flower2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BlossomBadge, FloatingPetals } from '@/components/ui/BlossomDecor'

export default function Lookbook() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '12%'])

  return (
    <section
      ref={ref}
      className="overflow-hidden"
      aria-labelledby="lookbook-heading"
    >
      <div className="grid lg:grid-cols-5">
        <div className="relative flex items-center overflow-hidden bg-gradient-to-br from-rose-light via-[#F6E4EC] to-rose px-8 py-16 sm:px-12 lg:col-span-2 lg:px-14 lg:py-24">
          <FloatingPetals className="opacity-40" />
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-[1]"
          >
            <div className="mb-3 flex items-center gap-2">
              <BlossomBadge className="!h-6 !w-6" />
              <p className="section-label">Lookbook</p>
            </div>
            <h2
              id="lookbook-heading"
              className="mt-2 font-display text-3xl font-medium leading-tight tracking-tight text-ink md:text-4xl lg:text-[2.75rem]"
            >
              Timeless Elegance,
              <br />
              <span className="italic text-primary">Every Moment</span>
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted md:text-base">
              Explore our seasonal lookbook — quiet luxury silhouettes styled
              for mornings, evenings, and everything in between.
            </p>
            <div className="mt-8 flex items-center gap-3">
              <Link to="/lookbook">
                <Button>Explore Lookbook</Button>
              </Link>
              <Flower2 className="h-5 w-5 text-primary/50" aria-hidden />
            </div>
          </motion.div>
        </div>

        <div className="relative min-h-[380px] overflow-hidden lg:col-span-3 lg:min-h-[520px]">
          <motion.img
            style={{ y }}
            src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80"
            alt="JALYN lookbook — woman in floral dress among soft blooms"
            className="absolute inset-0 h-[120%] w-full object-cover object-center"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-transparent to-primary/10" />
        </div>
      </div>
    </section>
  )
}
