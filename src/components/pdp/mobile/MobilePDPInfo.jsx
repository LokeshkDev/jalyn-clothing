import { useState } from 'react'
import { Star, Ruler, Sparkles, Check } from 'lucide-react'
import { SHOP_COLORS } from '@/constants/shopProducts'
import { cn, formatINR } from '@/lib/utils'

export default function MobilePDPInfo({
  product,
  selectedColor,
  setSelectedColor,
  selectedSize,
  setSelectedSize,
  onOpenSizeGuide,
  onScrollToReviews,
}) {
  const colorMap = Object.fromEntries(SHOP_COLORS.map((c) => [c.id, c]))
  const productColors = product.colors || ['rose', 'cream', 'black']
  const colorName = colorMap[selectedColor]?.label || 'Pink Floral'

  const highlights = [
    { icon: Sparkles, text: 'Premium breathable fabric' },
    { icon: Check, text: 'Soft & comfortable to wear' },
    { icon: Sparkles, text: 'Flattering fit for all body types' },
    { icon: Check, text: 'Perfect for casual & special occasions' },
  ]

  return (
    <div className="space-y-5 px-4">
      {/* Product Title */}
      <div>
        <h1 className="font-display text-[22px] font-semibold leading-tight tracking-tight text-[#222222] sm:text-[24px]">
          {product.title}
        </h1>

        {/* Rating & Sold */}
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-[#666666]">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3.5 w-3.5',
                  i < Math.floor(product.rating)
                    ? 'fill-primary text-primary'
                    : 'fill-[#EFD7E3] text-[#EFD7E3]',
                )}
              />
            ))}
          </div>
          <span className="font-semibold text-[#222222]">{product.rating}</span>
          <button
            type="button"
            onClick={onScrollToReviews}
            className="underline decoration-primary/30 transition-colors hover:text-primary"
          >
            ({product.reviews} reviews)
          </button>
          <span className="text-primary/30" aria-hidden>|</span>
          <span>
            Sold <span className="font-semibold text-[#222222]">372</span>
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="border-y border-primary/10 py-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-display text-[22px] font-bold text-primary">
            {formatINR(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <>
              <span className="text-[13px] text-[#666666] line-through">
                {formatINR(product.originalPrice)}
              </span>
              <span className="text-[12px] font-bold text-primary">
                {product.discount}% OFF
              </span>
            </>
          )}
        </div>
        <p className="mt-0.5 text-[11px] text-[#666666]">Inclusive of all taxes</p>
      </div>

      {/* Color Selector */}
      <div>
        <div className="mb-2.5 text-[13px]">
          <span className="font-medium text-[#666666]">
            Color: <span className="font-bold text-[#222222]">{colorName}</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {productColors.map((colorId) => {
            const colorObj = colorMap[colorId]
            const isSelected = selectedColor === colorId
            return (
              <button
                key={colorId}
                type="button"
                title={colorObj?.label || colorId}
                onClick={() => setSelectedColor(colorId)}
                aria-label={`Select color ${colorObj?.label || colorId}`}
                className={cn(
                  'h-10 w-10 rounded-full border border-black/10 transition-all active:scale-95',
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
        <div className="mb-2.5 flex items-center justify-between text-[13px]">
          <span className="font-medium text-[#666666]">
            Size: <span className="font-bold text-[#222222]">{selectedSize}</span>
          </span>
          <button
            type="button"
            onClick={onOpenSizeGuide}
            className="flex items-center gap-1 text-[12px] font-semibold text-primary active:scale-95"
          >
            <Ruler className="h-3.5 w-3.5" />
            <span>Size Guide</span>
          </button>
        </div>

        <div className="grid grid-cols-6 gap-2">
          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => {
            const available = product.sizes?.includes(sz)
            const isSelected = selectedSize === sz
            return (
              <button
                key={sz}
                type="button"
                disabled={!available}
                onClick={() => setSelectedSize(sz)}
                aria-label={`Size ${sz}${!available ? ' unavailable' : ''}`}
                className={cn(
                  'flex h-11 items-center justify-center rounded-[10px] text-[13px] font-bold transition-all active:scale-95',
                  isSelected
                    ? 'bg-primary text-white shadow-sm'
                    : available
                      ? 'border border-[#E5D8DE] bg-white text-[#222222]'
                      : 'border border-[#E5D8DE]/50 bg-[#FAF8F8] text-[#666666]/40 cursor-not-allowed line-through',
                )}
              >
                {sz}
              </button>
            )
          })}
        </div>
      </div>

      {/* Stock Status */}
      <div className="flex items-center gap-2 text-[12px]">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-semibold text-emerald-700">In Stock</span>
        <span className="text-[#666666]">| Ships within 24 hours</span>
      </div>

      {/* Product Highlights */}
      <div className="rounded-2xl border border-primary/10 bg-[#FAF8F8]/60 p-4">
        <h4 className="mb-2.5 text-[13px] font-bold uppercase tracking-wider text-[#222222]">
          Product Highlights
        </h4>
        <ul className="space-y-2.5 text-[12px] text-[#666666]">
          {highlights.map((h, idx) => {
            const Icon = h.icon
            return (
              <li key={idx} className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 shrink-0 text-primary" />
                <span>{h.text}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
