import { Award, RefreshCw, ShieldCheck, Truck } from 'lucide-react'
import { SERVICES } from '@/constants/data'

const icons = {
  sparkles: Award,
  refresh: RefreshCw,
  shield: ShieldCheck,
  truck: Truck,
}

export default function MobileServices() {
  return (
    <section
      className="mx-4 mt-5 overflow-hidden rounded-2xl border border-primary/8 bg-white"
      aria-label="Our promises"
    >
      <div className="grid grid-cols-4 divide-x divide-primary/10">
        {SERVICES.map((service) => {
          const Icon = icons[service.icon] || Award
          return (
            <div
              key={service.title}
              className="flex flex-col items-center px-1.5 py-3.5 text-center"
            >
              <Icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <h3 className="mt-2 font-label text-[10px] font-bold leading-tight text-[#4A2F3C] sm:text-[11px]">
                {service.title}
              </h3>
              <p className="mt-0.5 line-clamp-2 text-[9px] leading-tight text-[#9A7A88] sm:text-[10px]">
                {service.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
