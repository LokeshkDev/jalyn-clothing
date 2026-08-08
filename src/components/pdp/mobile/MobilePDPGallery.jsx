import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProductBadge from '@/components/shop/ProductBadge'
import WishlistButton from '@/components/shop/WishlistButton'
import { cn } from '@/lib/utils'

export default function MobilePDPGallery({ product, images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const containerRef = useRef(null)

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? e.clientX
  }, [])

  const handleTouchMove = useCallback((e) => {
    touchEndX.current = e.touches?.[0]?.clientX ?? e.clientX
  }, [])

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchEndX.current
    const threshold = 50

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < images.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1)
      }
    }
  }, [currentIndex, images.length])

  const primaryBadge = product.badges?.includes('new')
    ? 'new'
    : product.badges?.includes('sale')
      ? 'sale'
      : product.badges?.includes('limited')
        ? 'limited'
        : null

  const badgeLabel = primaryBadge?.toUpperCase()

  return (
    <div className="px-4 pt-2">
      <div
        ref={containerRef}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-[18px] bg-[#F7F1F2]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
      >
        {/* Product Image with crossfade */}
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex] || product.images.primary}
            alt={`${product.title} — view ${currentIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full w-full object-cover object-top select-none"
            draggable={false}
          />
        </AnimatePresence>

        {/* Top-Left Badge */}
        {primaryBadge && (
          <div className="absolute left-3.5 top-3.5 z-10">
            <ProductBadge
              type={primaryBadge}
              className="!rounded-lg !px-3 !py-1 !text-[11px] !font-bold shadow-sm"
            >
              {badgeLabel}
            </ProductBadge>
          </div>
        )}

        {/* Top-Right Wishlist */}
        <div className="absolute right-3.5 top-3.5 z-10">
          <WishlistButton
            id={product.id}
            className="!h-11 !w-11 !bg-white/95 shadow-md backdrop-blur-sm"
          />
        </div>

        {/* Bottom Dot Pagination */}
        <div className="absolute inset-x-0 bottom-4 z-10 flex items-center justify-center gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to image ${idx + 1}`}
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'h-2 rounded-full transition-all duration-300',
                currentIndex === idx
                  ? 'w-5 bg-primary'
                  : 'w-2 bg-[#EFD7E3]',
              )}
            />
          ))}
        </div>

        {/* Bottom-Right Image Counter */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center justify-center rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
          <span className="text-[11px] font-semibold text-white">
            {currentIndex + 1} / {images.length}
          </span>
        </div>
      </div>
    </div>
  )
}
