import { motion } from 'framer-motion'
import { Sparkles, RefreshCw, ShieldCheck, Truck } from 'lucide-react'
import { SERVICES } from '@/constants/data'

const icons = {
  sparkles: Sparkles,
  refresh: RefreshCw,
  shield: ShieldCheck,
  truck: Truck,
}

export default function Services() {
  return (
    <motion.section
      className="relative overflow-hidden border-y border-primary/5 bg-gradient-to-b from-rose-light/50 to-surface-muted py-8 md:py-10 mb-6"
      aria-label="Our services"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container-luxury max-w-7xl px-4 sm:px-6 relative z-[1] grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-8 items-center text-center">
        {SERVICES.map((service, i) => {
          const Icon = icons[service.icon] || Sparkles
          return (
            <motion.div
              key={service.title || i}
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center text-center px-1"
            >
              <motion.div
                className="mb-2.5 flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white text-primary shadow-soft ring-1 ring-primary/10"
                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.06 }}
                transition={{ duration: 0.5 }}
              >
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.5} />
              </motion.div>
              <h3 className="font-display text-[11px] font-bold text-ink sm:text-base md:text-lg leading-tight">
                {service.title}
              </h3>
              <p className="mt-0.5 text-[9px] text-ink-muted sm:text-xs md:text-sm leading-tight line-clamp-2 sm:line-clamp-none">
                {service.description}
              </p>
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}
