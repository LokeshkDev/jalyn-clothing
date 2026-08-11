import { useState } from 'react'
import { ChevronUp, ChevronDown, ZoomIn, Share2, Check } from 'lucide-react'
import ProductBadge from '@/components/shop/ProductBadge'
import WishlistButton from '@/components/shop/WishlistButton'
import { cn } from '@/lib/utils'

export default function ProductGallery({ product, images = [] }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 })
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentImage = images[selectedIndex] || product.images?.primary || product.image

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width) * 100
    const y = ((e.clientY - top) / height) * 100
    setZoomPos({ x, y })
  }

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

  return (
    <div className="flex gap-4 sm:gap-6">
      {/* Left Thumbnail Column (Scrollable horizontally/vertically without scrollbar clutter) */}
      <div className="flex flex-col items-center gap-2">
        {images.length > 4 && (
          <button
            type="button"
            aria-label="Scroll thumbnails up"
            onClick={() => setSelectedIndex((prev) => Math.max(0, prev - 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink-muted shadow-sm hover:text-primary border border-primary/10 transition"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
        )}

        <div className="flex flex-col gap-3 overflow-auto max-h-[560px] max-w-[100px] theme-scrollbar p-1">
          {images.map((imgUrl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                'relative aspect-[4/5] w-16 sm:w-20 shrink-0 overflow-hidden rounded-xl bg-[#F7F1F2] transition-all',
                selectedIndex === idx
                  ? 'border-2 border-primary shadow-soft scale-105'
                  : 'border border-primary/10 opacity-70 hover:opacity-100',
              )}
            >
              <img
                src={imgUrl}
                alt={`${product.title} view ${idx + 1}`}
                className="h-full w-full object-cover object-top"
              />
            </button>
          ))}
        </div>

        {images.length > 4 && (
          <button
            type="button"
            aria-label="Scroll thumbnails down"
            onClick={() => setSelectedIndex((prev) => Math.min(images.length - 1, prev + 1))}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink-muted shadow-sm hover:text-primary border border-primary/10 transition"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Center Main Product Image */}
      <div className="relative flex-1">
        <div
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setLightboxOpen(true)}
          className="group relative aspect-[4/5] w-full overflow-hidden rounded-[16px] bg-[#F7F1F2] border border-primary/5 cursor-zoom-in"
        >
          <img
            src={currentImage}
            alt={product.title}
            className={cn(
              'h-full w-full object-cover object-top transition-transform duration-300',
              isZoomed ? 'scale-125' : 'scale-100',
            )}
            style={
              isZoomed
                ? {
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }
                : undefined
            }
          />

          {/* Top-Left Badge */}
          <div className="absolute left-4 top-4 z-10 flex flex-col gap-1.5">
            {product.badges?.includes('new') && (
              <ProductBadge type="new" className="!rounded-md !px-3 !py-1 !text-xs !font-bold">
                NEW
              </ProductBadge>
            )}
            {product.badges?.includes('sale') && !product.badges?.includes('new') && (
              <ProductBadge type="sale" className="!rounded-md !px-3 !py-1 !text-xs !font-bold">
                SALE
              </ProductBadge>
            )}
            {product.badges?.includes('limited') && !product.badges?.includes('new') && !product.badges?.includes('sale') && (
              <ProductBadge type="limited" className="!rounded-md !px-3 !py-1 !text-xs !font-bold">
                LIMITED
              </ProductBadge>
            )}
          </div>

          {/* Top-Right Action Buttons: Right-Aligned Parallel Share & Favourite Icons */}
          <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
            <button
              type="button"
              aria-label="Share product"
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-primary shadow-soft backdrop-blur-sm transition-all hover:scale-110 hover:bg-white"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4 text-primary" />}
            </button>
            <WishlistButton
              id={product.id}
              className="!h-10 !w-10 !bg-white/90 shadow-soft backdrop-blur-sm hover:!bg-white"
            />
          </div>

          {/* Bottom-Right Zoom Indicator Icon */}
          <div className="absolute right-4 bottom-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-ink-muted shadow-sm backdrop-blur-sm opacity-80 group-hover:opacity-100 transition">
            <ZoomIn className="h-4 w-4 text-primary" />
          </div>
        </div>

        {/* Fullscreen Lightbox Overlay Modal */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md"
            onClick={() => setLightboxOpen(false)}
          >
            <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl">
              <img
                src={currentImage}
                alt={product.title}
                className="max-h-[90vh] w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink font-bold shadow-lift"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
