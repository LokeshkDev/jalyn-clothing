import { Truck, RotateCcw, ShieldCheck } from 'lucide-react'

const services = [
  {
    icon: Truck,
    title: 'Free Delivery',
    desc: 'On orders above ₹1999',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    desc: 'Hassle-free returns within 7 days',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payments',
    desc: '100% secure payment options',
  },
]

export default function MobileServiceCard() {
  return (
    <div className="mx-4 rounded-2xl border border-primary/10 bg-white p-4 shadow-[0_2px_12px_rgba(173,74,133,0.06)]">
      <div className="space-y-3">
        {services.map((svc, idx) => {
          const Icon = svc.icon
          return (
            <div
              key={idx}
              className={`flex items-center gap-3 ${idx > 0 ? 'border-t border-primary/5 pt-3' : ''}`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EFD7E3]/50 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[13px] font-bold text-[#222222]">{svc.title}</p>
                <p className="text-[11px] text-[#666666]">{svc.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
