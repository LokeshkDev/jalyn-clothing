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
      whileHover={{ rotate: 8, scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-primary shadow-sm backdrop-blur-sm transition hover:bg-primary hover:text-white',
        className,
      )}
    >
      <Heart className={cn('h-4 w-4', wished && 'fill-primary text-primary')} strokeWidth={1.75} />
    </motion.button>
  )
}
