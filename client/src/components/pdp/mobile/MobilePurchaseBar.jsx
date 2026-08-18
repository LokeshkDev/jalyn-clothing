import { useState } from 'react'
import { ShoppingBag, Heart, AlertCircle, Lock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore, useWishlistStore, useDeliveryStore } from '@/store'
import { cn } from '@/lib/utils'

export default function MobilePurchaseBar({ product, selectedSize, selectedColor }) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const wishStore = useWishlistStore()
  const deliveryStore = useDeliveryStore()
  const isWishlisted = wishStore.has(product?.id)

  const [showToast, setShowToast] = useState(false)
  const isOutOfStock = product.inStock === false

  const handleDisabledClick = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3500)

    // Smoothly scroll to the pincode input field
    const pincodeInput = document.querySelector('input[placeholder*="Pincode"]')
    if (pincodeInput) {
      pincodeInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
      pincodeInput.focus()
    }
  }

  const handleAddBag = () => {
    if (isOutOfStock) {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3500)
      return
    }

    if (!deliveryStore.isVerified) {
      handleDisabledClick()
      return
    }

    const primaryImg =
      product.image ||
      product.primary_image ||
      product.images?.primary ||
      '/images/products/floral-midi-dress.webp'

    addItem({
      id: product.id,
      name: product.title || product.name,
      price: product.price,
      image: primaryImg,
      size: selectedSize,
      color: selectedColor,
      href: `/products/${product.slug || product.id}`,
    })

    openCart()
  }

  return (
    <>
      {/* Toast Alert Popover Message */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-[125px] left-4 right-4 z-50 rounded-xl bg-amber-900/95 text-white p-3.5 shadow-2xl backdrop-blur-md flex items-center gap-3 border border-amber-500/30"
          >
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 animate-bounce" />
            <div className="flex-1 text-xs">
              <p className="font-bold text-amber-200">Pincode Required</p>
              <p className="text-[11px] text-amber-100">
                Please enter and check your pincode for delivery estimation first!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="fixed inset-x-0 z-40 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden"
        style={{
          bottom: '60px',
          borderRadius: '16px 16px 0 0',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center gap-2 px-3 py-3">
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

          {/* ENTER PINCODE / ADD TO BAG */}
          <motion.button
            type="button"
            onClick={handleAddBag}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all',
              isOutOfStock
                ? 'bg-red-100 text-red-500 border border-red-300'
                : deliveryStore.isVerified
                ? 'bg-primary text-white active:bg-primary/90 shadow-sm'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300'
            )}
          >
            {isOutOfStock ? (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>OUT OF STOCK</span>
              </>
            ) : deliveryStore.isVerified ? (
              <>
                <ShoppingBag className="h-4 w-4" />
                <span>ADD TO BAG</span>
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 text-gray-600" />
                <span>ENTER PINCODE</span>
              </>
            )}
          </motion.button>

          {/* BUY NOW */}
          <motion.button
            type="button"
            onClick={handleAddBag}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'flex h-12 flex-1 items-center justify-center rounded-xl border-2 text-[11px] font-bold uppercase tracking-wider transition-all',
              isOutOfStock
                ? 'border-red-200 bg-red-50 text-red-400'
                : deliveryStore.isVerified
                ? 'border-primary bg-white text-primary active:bg-primary/5'
                : 'border-gray-200 bg-gray-100 text-gray-400'
            )}
          >
            <span>{isOutOfStock ? 'OUT OF STOCK' : 'BUY NOW'}</span>
          </motion.button>
        </div>
      </div>
    </>
  )
}
