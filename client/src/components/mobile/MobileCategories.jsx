import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Briefcase, Shirt, Sparkles, Moon, PartyPopper, Flower2 } from 'lucide-react'
import { COLLECTIONS } from '@/constants/data'
import { useProductsApi } from '@/hooks/useProductsApi'

const BADGE_ICONS = {
  workwear: Briefcase,
  casual: Shirt,
  ethnic: Sparkles,
  lounge: Moon,
  party: PartyPopper,
  new: Flower2,
}

export default function MobileCategories() {
  const { categories } = useProductsApi()
  const items = categories && categories.length > 0 ? categories : COLLECTIONS

  return (
    <motion.section
      className="pt-5 mb-[15px] lg:mb-5"
      aria-label="Shop by category"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="flex gap-4 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.map((cat, i) => {
          const BadgeIcon = BADGE_ICONS[cat.id || cat.slug] || Shirt
          const title = cat.title || cat.name
          const image = cat.image || cat.image_url
          const link = cat.href || `/collections/${cat.slug}`
          return (
            <Link
              key={cat.id || i}
              to={link}
              className="flex w-[72px] shrink-0 flex-col items-center gap-2 sm:w-[80px]"
            >
              <div className="relative">
                <div className="h-[72px] w-[72px] overflow-hidden rounded-full ring-2 ring-rose-light sm:h-20 sm:w-20">
                  <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src =
                        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
                    }}
                  />
                </div>
                <span className="absolute -bottom-1 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full bg-white text-primary shadow-soft ring-1 ring-primary/10">
                  <BadgeIcon className="h-3 w-3" strokeWidth={1.75} />
                </span>
              </div>
              <span className="text-center font-label text-[10px] font-semibold leading-tight text-[#4A2F3C] sm:text-[11px] line-clamp-1">
                {title}
              </span>
            </Link>
          )
        })}
      </div>
    </motion.section>
  )
}
