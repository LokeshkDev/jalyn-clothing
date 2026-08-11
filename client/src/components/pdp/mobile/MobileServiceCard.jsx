import { Truck, RotateCcw, ShieldCheck } from 'lucide-react'

const services = [
  {
    icon: Truck,
    title: 'Free Delivery',
    desc: 'Orders above ₹1999',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    desc: '7-Day Hassle Free',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    desc: '100% Encrypted',
  },
]

export default function MobileServiceCard() {
  return (
    <div className="mx-4 rounded-2xl border border-primary/10 bg-white p-3 shadow-sm text-center">
      <div className="grid grid-cols-3 gap-2">
        {services.map((svc, idx) => {
          const Icon = svc.icon
          return (
            <div
              key={idx}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-rose-light/20"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary shadow-xs">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-[11px] font-bold text-[#222222] leading-tight">{svc.title}</p>
              <p className="text-[9.5px] text-[#666666] leading-tight">{svc.desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
