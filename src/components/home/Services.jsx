import { motion } from 'framer-motion'
import { Sparkles, RefreshCw, ShieldCheck, Truck, Flower2 } from 'lucide-react'
import { SERVICES } from '@/constants/data'
import { FloatingPetals } from '@/components/ui/BlossomDecor'

const icons = {
  sparkles: Sparkles,
  refresh: RefreshCw,
  shield: ShieldCheck,
  truck: Truck,
}

export default function Services() {
  return (
    <section
      className="relative overflow-hidden border-y border-primary/5 bg-gradient-to-b from-rose-light/50 to-surface-muted py-12 md:py-14"
      aria-label="Our services"
    >
      <FloatingPetals className="opacity-30" />
      <div className="container-luxury relative z-[1] grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
        {SERVICES.map((service, i) => {
          const Icon = icons[service.icon]
          return (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-soft ring-1 ring-primary/10"
                whileHover={{ rotate: [0, -8, 8, 0], scale: 1.06 }}
                transition={{ duration: 0.5 }}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </motion.div>
              <h3 className="font-display text-base font-medium text-ink md:text-lg">
                {service.title}
              </h3>
              <p className="mt-1 text-xs text-ink-muted md:text-sm">
                {service.description}
              </p>
              <Flower2 className="mt-2 h-3.5 w-3.5 text-primary/35" aria-hidden />
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
