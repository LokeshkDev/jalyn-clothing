import { Link } from 'react-router-dom'
import { Briefcase, Shirt, Sparkles, Moon, PartyPopper, Flower2 } from 'lucide-react'
import { COLLECTIONS } from '@/constants/data'

const BADGE_ICONS = {
  workwear: Briefcase,
  casual: Shirt,
  ethnic: Sparkles,
  lounge: Moon,
  party: PartyPopper,
  new: Flower2,
}

export default function MobileCategories() {
  return (
    <section className="pt-5" aria-label="Shop by category">
      <div className="flex gap-4 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {COLLECTIONS.map((cat) => {
          const BadgeIcon = BADGE_ICONS[cat.id] || Shirt
          return (
            <Link
              key={cat.id}
              to={cat.href}
              className="flex w-[72px] shrink-0 flex-col items-center gap-2 sm:w-[80px]"
            >
              <div className="relative">
                <div className="h-[72px] w-[72px] overflow-hidden rounded-full ring-2 ring-rose-light sm:h-20 sm:w-20">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <span className="absolute -bottom-1 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-white text-primary shadow-soft ring-1 ring-primary/10">
                  <BadgeIcon className="h-3 w-3" strokeWidth={1.75} />
                </span>
              </div>
              <span className="text-center font-label text-[10px] font-semibold leading-tight text-[#4A2F3C] sm:text-[11px]">
                {cat.title}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
