import { Award, RefreshCw, ShieldCheck, Truck } from 'lucide-react'
import { motion } from 'framer-motion'
import { SERVICES } from '@/constants/data'

const icons = {
  truck: Truck,
  refresh: RefreshCw,
  shield: ShieldCheck,
  sparkles: Award,
}

export default function MobileServices() {
  return (
    <motion.section
      className="mx-3 mt-4 overflow-hidden rounded-2xl border border-[#EFD7E3] bg-[#FFF6F9]/75 shadow-xs mb-4"
      aria-label="Our promises"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid grid-cols-2 divide-x divide-y divide-[#EFD7E3]">
        {SERVICES.map((service) => {
          const Icon = icons[service.icon] || Award
          return (
            <div
              key={service.title}
              className="flex flex-col items-center justify-center p-3.5 sm:p-4 text-center bg-white/40"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-white text-primary shadow-xs ring-1 ring-primary/15">
                <Icon className="h-4 w-4 text-primary" strokeWidth={1.8} />
              </div>
              <h3 className="font-label text-xs font-bold leading-tight text-[#4A2F3C] sm:text-sm">
                {service.title}
              </h3>
              <p className="mt-1 text-[10.5px] leading-snug text-[#7A5A6A] sm:text-xs">
                {service.description}
              </p>
            </div>
          )
        })}
      </div>
    </motion.section>
  )
}
