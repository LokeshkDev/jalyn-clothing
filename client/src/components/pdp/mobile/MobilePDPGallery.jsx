import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Check } from 'lucide-react'
import ProductBadge from '@/components/shop/ProductBadge'
import WishlistButton from '@/components/shop/WishlistButton'
import { cn } from '@/lib/utils'

export default function MobilePDPGallery({ product, images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)
  const containerRef = useRef(null)

  const imageList = images.length > 0 ? images : [product.images?.primary || product.image]

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
      if (diff > 0 && currentIndex < imageList.length - 1) {
        setCurrentIndex((prev) => prev + 1)
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1)
      }
    }
  }, [currentIndex, imageList.length])

  const handleShare = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title: product.title,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const primaryBadge = product.badges?.includes('new')
    ? 'new'
    : product.badges?.includes('sale')
      ? 'sale'
      : product.badges?.includes('limited')
        ? 'limited'
        : null

  const badgeLabel = primaryBadge?.toUpperCase()

  return (
    <div className="px-4 pt-2 space-y-3">
      {/* Main Image Container */}
      <div
        ref={containerRef}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-[18px] bg-[#FAF6F8]"
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
            src={imageList[currentIndex]}
            alt={`${product.title} — view ${currentIndex + 1}`}
            fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
            loading={currentIndex === 0 ? 'eager' : 'lazy'}
            decoding="async"
            width="480"
            height="600"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full w-full object-cover object-top select-none"
            draggable={false}
            onError={(e) => {
              e.currentTarget.src = '/images/products/floral-midi-dress.webp'
            }}
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

        {/* Top-Right Action Buttons: Share next to Favourite */}
        <div className="absolute right-3.5 top-3.5 z-10 flex items-center gap-2">
          <button
            type="button"
            aria-label="Share product"
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-primary shadow-md backdrop-blur-sm transition-all active:scale-90"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4 text-primary" />}
          </button>
          <WishlistButton
            id={product.id}
            className="!h-10 !w-10 !bg-white/95 shadow-md backdrop-blur-sm"
          />
        </div>

        {/* Bottom-Right Image Counter */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center justify-center rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
          <span className="text-[11px] font-semibold text-white">
            {currentIndex + 1} / {imageList.length}
          </span>
        </div>
      </div>

      {/* Multiple Image Thumbnails Strip Next to Main Image */}
      {imageList.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none theme-scrollbar">
          {imageList.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={cn(
                'relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-xl bg-[#FAF6F8] transition-all',
                currentIndex === idx
                  ? 'border-2 border-primary ring-2 ring-primary/20 scale-105'
                  : 'border border-primary/10 opacity-70 hover:opacity-100',
              )}
            >
              <img
                src={imgUrl}
                alt={`${product.title} thumb ${idx + 1}`}
                loading="lazy"
                decoding="async"
                width="64"
                height="80"
                className="h-full w-full object-cover object-top"
                onError={(e) => {
                  e.currentTarget.src = '/images/products/floral-midi-dress.webp'
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
