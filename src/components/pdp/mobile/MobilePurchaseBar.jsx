import { ShoppingBag, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCartStore, useWishlistStore } from '@/store'
import { cn } from '@/lib/utils'

export default function MobilePurchaseBar({ product, selectedSize, selectedColor }) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const wishStore = useWishlistStore()
  const isWishlisted = wishStore.has(product.id)

  const handleAddBag = () => {
    addItem({
      id: product.id,
      name: product.title,
      price: product.price,
      image: product.images.primary,
      size: selectedSize,
      color: selectedColor,
      href: `/products/${product.slug}`,
    })
  }

  const handleBuyNow = () => {
    handleAddBag()
    openCart()
  }

  return (
    <div
      className="fixed inset-x-0 z-40 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden"
      style={{
        bottom: '60px',
        borderRadius: '16px 16px 0 0',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center gap-2.5 px-4 py-3">
        {/* Wishlist Button */}
        <motion.button
          type="button"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={() => wishStore.toggle(product.id)}
          whileTap={{ scale: 0.9 }}
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 transition-all',
            isWishlisted
              ? 'border-primary bg-primary/5'
              : 'border-[#E5D8DE] bg-white',
          )}
        >
          <Heart
            className={cn(
              'h-5 w-5 transition-colors',
              isWishlisted ? 'fill-primary text-primary' : 'text-[#222222]',
            )}
          />
        </motion.button>

        {/* ADD TO BAG */}
        <motion.button
          type="button"
          onClick={handleAddBag}
          whileTap={{ scale: 0.97 }}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-[13px] font-bold uppercase tracking-wider text-white shadow-sm transition-all active:bg-primary/90"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>ADD TO BAG</span>
        </motion.button>

        {/* BUY NOW */}
        <motion.button
          type="button"
          onClick={handleBuyNow}
          whileTap={{ scale: 0.97 }}
          className="flex h-12 flex-1 items-center justify-center rounded-xl border-2 border-primary bg-white text-[13px] font-bold uppercase tracking-wider text-primary transition-all active:bg-primary/5"
        >
          <span>BUY NOW</span>
        </motion.button>
      </div>
    </div>
  )
}
