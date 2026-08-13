import { useState } from 'react'
import { Star, Ruler, Sparkles, Heart, Check } from 'lucide-react'
import { SHOP_COLORS } from '@/constants/shopProducts'
import { cn, formatINR } from '@/lib/utils'

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

export default function ProductInfoPanel({
  product,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  onOpenSizeGuide,
  onScrollToReviews,
}) {
  const colorMap = Object.fromEntries(SHOP_COLORS.map((c) => [c.id, c]))
  const currentCategoryColors = product.colors || ['rose', 'cream', 'black']
  const colorName = colorMap[selectedColor]?.label || (typeof selectedColor === 'string' ? selectedColor.toUpperCase() : 'Pink Floral')

  const highlights = [
    { icon: Sparkles, text: 'Premium breathable fabric' },
    { icon: Check, text: 'Soft & comfortable to wear' },
    { icon: Sparkles, text: 'Flattering fit for all body types' },
    { icon: Check, text: 'Perfect for casual & special occasions' },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Product Title */}
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink sm:text-[34px] leading-tight">
          {product.title}
        </h1>

        {/* Rating & Review Row */}
        <div className="mt-2.5 flex items-center gap-3 text-xs sm:text-sm text-ink-muted">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-4 w-4',
                  i < Math.floor(product.rating)
                    ? 'fill-primary text-primary'
                    : 'fill-rose-light text-rose-light',
                )}
              />
            ))}
            <span className="ml-1 font-semibold text-ink">{product.rating}</span>
          </div>

          <button
            type="button"
            onClick={onScrollToReviews}
            className="hover:text-primary underline decoration-primary/30 transition-colors"
          >
            ({product.reviews} reviews)
          </button>

          <span className="text-primary/30" aria-hidden>
            |
          </span>

          <span className="text-ink-muted">
            Sold <span className="font-semibold text-ink">372</span>
          </span>
        </div>
      </div>

      {/* Price Block */}
      <div className="border-y border-primary/10 py-3.5">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <span className="font-display text-3xl font-bold text-primary">
            {formatINR(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <>
              <span className="text-base text-ink-muted line-through">
                {formatINR(product.originalPrice)}
              </span>
              <span className="font-label text-xs font-bold uppercase tracking-wider text-primary">
                {product.discount}% OFF
              </span>
            </>
          )}
        </div>
        <p className="mt-1 text-xs text-ink-muted">Inclusive of all taxes</p>
      </div>

      {/* Color Selector */}
      <div>
        <div className="mb-2.5 flex items-center justify-between text-xs sm:text-sm font-label">
          <span className="font-medium text-ink-muted">
            Color: <span className="font-bold text-ink">{colorName}</span>
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          {currentCategoryColors.map((colorId) => {
            const colorObj = colorMap[colorId]
            const isSelected = selectedColor === colorId
            return (
              <button
                key={colorId}
                type="button"
                title={colorObj?.label || colorId}
                onClick={() => setSelectedColor(colorId)}
                className={cn(
                  'h-8 w-8 rounded-full border border-black/10 transition-all active:scale-95 cursor-pointer',
                  isSelected && 'ring-2 ring-primary ring-offset-2 scale-110',
                )}
                style={{ backgroundColor: colorObj?.hex || '#ccc' }}
              />
            )
          })}
        </div>
      </div>

      {/* Size Selector */}
      <div>
        <div className="mb-2.5 flex items-center justify-between font-label text-xs sm:text-sm">
          <span className="font-medium text-ink-muted">
            Size: <span className="font-bold text-ink">{selectedSize}</span>
          </span>
          <button
            type="button"
            onClick={onOpenSizeGuide}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            <Ruler className="h-3.5 w-3.5" />
            <span>Size Guide</span>
          </button>
        </div>

        <div className="grid grid-cols-6 gap-2">
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
                  'flex h-11 items-center justify-center rounded-xl font-label text-xs font-bold transition-all active:scale-95 cursor-pointer',
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

      {/* Stock Status */}
      <div className="flex items-center gap-2 text-xs font-label">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-emerald-700">In Stock</span>
        <span className="text-ink-muted">| Ships within 24 hours</span>
      </div>

      {/* Product Highlights */}
      <div className="rounded-2xl border border-primary/10 bg-surface/60 p-4">
        <h4 className="font-label text-xs font-bold uppercase tracking-wider text-ink mb-2.5">
          Product Highlights
        </h4>
        <ul className="space-y-2 text-xs text-ink-muted">
          {highlights.map((h, idx) => {
            const Icon = h.icon
            return (
              <li key={idx} className="flex items-center gap-2">
                <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span>{h.text}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
