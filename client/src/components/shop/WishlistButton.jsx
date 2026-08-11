import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useWishlistStore } from '@/store'

export default function WishlistButton({ id, className }) {
  const toggle = useWishlistStore((s) => s.toggle)
  const wished = useWishlistStore((s) => s.ids.includes(id))

  return (
    <motion.button
      type="button"
      aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggle(id)
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group/hb flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm border border-primary/10 transition-colors duration-200 hover:bg-primary cursor-pointer',
        className,
      )}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors duration-200',
          wished
            ? 'fill-primary text-primary group-hover/hb:fill-white group-hover/hb:text-white'
            : 'text-ink group-hover/hb:text-white',
        )}
        strokeWidth={1.8}
      />
    </motion.button>
  )
}
