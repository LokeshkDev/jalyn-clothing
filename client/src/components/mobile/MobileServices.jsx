import { Award, RefreshCw, ShieldCheck, Truck } from 'lucide-react'
import { SERVICES } from '@/constants/data'

const icons = {
  truck: Truck,
  refresh: RefreshCw,
  shield: ShieldCheck,
  sparkles: Award,
}

export default function MobileServices() {
  return (
    <section
      className="mx-3 my-4 overflow-hidden rounded-2xl border border-[#EFD7E3] bg-[#FFF6F9]/60 shadow-sm"
      aria-label="Our promises"
    >
      <div className="grid grid-cols-4 divide-x divide-[#EFD7E3]">
        {SERVICES.map((service) => {
          const Icon = icons[service.icon] || Award
          return (
            <div
              key={service.title}
              className="flex flex-col items-center justify-start px-1 py-3 text-center"
            >
              <div className="mb-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary shadow-xs ring-1 ring-primary/10">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <h3 className="font-label text-[10px] font-bold leading-tight text-[#4A2F3C] sm:text-[11px]">
                {service.title}
              </h3>
              <p className="mt-0.5 text-[8.5px] leading-tight text-[#7A5A6A] sm:text-[10px]">
                {service.description}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
