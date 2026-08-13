import { useState, useEffect, useMemo } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatINR, cn } from '@/lib/utils'
import { SHOP_COLORS } from '@/constants/shopProducts'
import ProductPurchaseCard from '@/components/pdp/ProductPurchaseCard'
import PdpCoupons from '@/components/pdp/PdpCoupons'

function getColorImage(product, colorId) {
  if (!colorId || !product) return null
  const normalizedId = typeof colorId === 'string' ? colorId.toLowerCase() : colorId
  if (product.color_images?.[colorId]) {
    const val = product.color_images[colorId]
    return Array.isArray(val) ? val[0] : val
  }
  if (product.color_images?.[normalizedId]) {
    const val = product.color_images[normalizedId]
    return Array.isArray(val) ? val[0] : val
  }
  if (product.colorImages?.[colorId]) {
    const val = product.colorImages[colorId]
    return Array.isArray(val) ? val[0] : val
  }
  if (Array.isArray(product.colors)) {
    const colObj = product.colors.find(c => typeof c === 'object' && (c.id === colorId || c.name?.toLowerCase() === normalizedId))
    if (colObj && colObj.images?.length) {
      return colObj.images[0]
    }
  }
  return null
}

function isSizeAvailable(product, selectedColor, sz) {
  if (!product) return false
  const colorStr = typeof selectedColor === 'object' ? selectedColor?.name || selectedColor?.id : selectedColor

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    const variant = product.variants.find((v) => {
      const matchColor =
        !colorStr ||
        v.color?.toLowerCase() === String(colorStr).toLowerCase() ||
        v.colorHex === colorStr
      const matchSize = String(v.size).toUpperCase() === String(sz).toUpperCase()
      return matchColor && matchSize
    })
    if (variant) {
      const stock = parseInt(variant.stock, 10)
      return !isNaN(stock) && stock > 0 && variant.inStock !== false
    }
  }

  const hasSize = Array.isArray(product.sizes)
    ? product.sizes.some((s) => String(s).toUpperCase() === String(sz).toUpperCase())
    : true

  return hasSize
}

export default function QuickViewModal({ product, open, onClose }) {
  const colorMap = useMemo(() => Object.fromEntries(SHOP_COLORS.map((c) => [c.id, c])), [])

  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)

  useEffect(() => {
    if (product) {
      const initialColor = Array.isArray(product.colors) && product.colors[0]
        ? (typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0].id || product.colors[0].name)
        : 'rose'
      const initialSize = Array.isArray(product.sizes) && product.sizes[0]
        ? product.sizes[0]
        : 'M'
      setSelectedColor(initialColor)
      setSelectedSize(initialSize)
    }
  }, [product])

  if (!product) return null

  const title = product.title || product.name || 'Jalyn Essential Item'
  const primaryImg =
    product.image ||
    product.primary_image ||
    product.images?.primary ||
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
  
  const activeColorImg = getColorImage(product, selectedColor)
  const displayImg = activeColorImg || primaryImg

  const price = Number(product.price) || 0
  const originalPrice = product.originalPrice || product.original_price || product.compareAt
  const rating = product.rating || 4.8
  const reviewsCount = product.reviews ?? product.reviews_count ?? 12
  const category = product.category || product.category_slug || 'dresses'
  const description = product.description || 'Thoughtfully designed for elegance and comfort.'
  const href = product.href || `/products/${product.slug || product.id}`
  const productColors = Array.isArray(product.colors) ? product.colors : ['rose', 'cream', 'black']
  const colorName = colorMap[selectedColor]?.label || (typeof selectedColor === 'string' ? selectedColor.toUpperCase() : 'Pink Floral')

  // Calculate variant-aware stock for displayProduct
  const displayProduct = (() => {
    const variants = product.variants || []
    const variant = variants.find(
      (v) => (v.color?.toLowerCase() === String(selectedColor).toLowerCase()) && String(v.size).toUpperCase() === String(selectedSize).toUpperCase(),
    )
    if (!variant) return product
    const stockQty = parseInt(variant.stock, 10) || 0
    return {
      ...product,
      price: Number(variant.price) || product.price,
      stock: stockQty,
      inStock: stockQty > 0,
      activeVariant: variant,
    }
  })()

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-[#2A1A22]/50 backdrop-blur-sm transition-opacity" />
        
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[90] flex flex-col md:flex-row max-h-[88vh] w-[min(960px,calc(100%-1.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl outline-none border border-primary/10">
          
          {/* Left Column: Fixed Product Gallery Image */}
          <div className="relative w-full md:w-1/2 bg-rose-light/20 aspect-[4/5] md:aspect-auto flex-shrink-0 overflow-hidden">
            <img
              src={displayImg}
              alt={title}
              className="h-full w-full object-cover object-top transition-all duration-300"
              onError={(e) => {
                e.currentTarget.src =
                  'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
              }}
            />

            {/* Top Close Button inside mobile image header */}
            <Dialog.Close
              aria-label="Close quick view"
              className="absolute top-3 right-3 md:hidden flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-primary shadow-soft backdrop-blur-sm hover:bg-white"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Right Column: Scrollable Details & Actions Container */}
          <div className="relative w-full md:w-1/2 flex flex-col max-h-[85vh] md:max-h-[88vh] overflow-y-auto p-5 sm:p-6 space-y-4 theme-scrollbar min-w-0 bg-white">
            
            {/* Desktop Top Header Bar */}
            <div className="flex items-start justify-between gap-3 border-b border-primary/10 pb-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-primary">
                  {category}
                </p>
                <Dialog.Title className="font-display text-xl sm:text-2xl font-medium text-ink leading-tight">
                  {title}
                </Dialog.Title>
              </div>

              <Dialog.Close
                aria-label="Close quick view"
                className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface hover:bg-rose-light/60 transition"
              >
                <X className="h-4 w-4 text-primary" />
              </Dialog.Close>
            </div>

            {/* Price & Rating */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-heading text-2xl font-bold text-primary">
                  {formatINR(displayProduct.price)}
                </span>
                {originalPrice > displayProduct.price && (
                  <span className="text-ink-muted line-through text-xs sm:text-sm">
                    {formatINR(originalPrice)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-ink-muted bg-surface px-2.5 py-1 rounded-full border border-primary/10">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="font-bold text-ink">{rating}</span>
                <span>({reviewsCount})</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-ink-muted leading-relaxed line-clamp-2">
              {description}
            </p>

            {/* Interactive Color Selector */}
            <div className="border-t border-primary/10 pt-3">
              <div className="mb-2 text-xs font-label">
                <span className="font-medium text-ink-muted">
                  Color: <span className="font-bold text-ink">{colorName}</span>
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                {productColors.map((colorId) => {
                  const id = typeof colorId === 'string' ? colorId : colorId.id || colorId.name
                  const colorObj = colorMap[id]
                  const isSelected = selectedColor === id
                  const hex = typeof colorId === 'object' && colorId.hex ? colorId.hex : colorObj?.hex || '#AD4A85'
                  return (
                    <button
                      key={id}
                      type="button"
                      title={colorObj?.label || id}
                      onClick={() => setSelectedColor(id)}
                      className={cn(
                        'h-7 w-7 rounded-full border border-black/10 transition-all active:scale-95 cursor-pointer',
                        isSelected && 'ring-2 ring-primary ring-offset-2 scale-110',
                      )}
                      style={{ backgroundColor: hex }}
                    />
                  )
                })}
              </div>
            </div>

            {/* Interactive Size Selector with Strikethrough for Out-of-Stock Variants */}
            <div>
              <div className="mb-2 flex items-center justify-between text-xs font-label">
                <span className="font-medium text-ink-muted">
                  Size: <span className="font-bold text-ink">{selectedSize}</span>
                </span>
                <Link to={href} onClick={onClose} className="text-[11px] font-semibold text-primary hover:underline">
                  Full Details &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-6 gap-1.5">
                {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
                  const available = isSizeAvailable(product, selectedColor, sz)
                  const isSelected = selectedSize === sz
                  return (
                    <button
                      key={sz}
                      type="button"
                      disabled={!available}
                      onClick={() => setSelectedSize(sz)}
                      className={cn(
                        'flex h-9 items-center justify-center rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer',
                        isSelected && available
                          ? 'bg-primary text-white shadow-soft'
                          : isSelected && !available
                          ? 'bg-primary/50 text-white line-through cursor-not-allowed'
                          : available
                          ? 'border border-primary/20 bg-white text-ink hover:border-primary/50'
                          : 'border border-primary/10 bg-surface text-ink-muted/40 cursor-not-allowed line-through',
                      )}
                    >
                      {sz}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Coupons Carousel */}
            <div className="pt-2">
              <PdpCoupons />
            </div>

            {/* Delivery Checker & CTA Buttons */}
            <div className="pt-1">
              <ProductPurchaseCard
                product={displayProduct}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
              />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
