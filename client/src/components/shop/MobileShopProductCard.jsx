import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductBadge from '@/components/shop/ProductBadge'
import WishlistButton from '@/components/shop/WishlistButton'
import { SHOP_COLORS } from '@/constants/shopProducts'
import { cn, formatINR } from '@/lib/utils'

function getColorImage(product, colorId, idx) {
  if (!colorId) return null
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
  if (idx === 1 && (product.hoverImage || product.hover_image || product.images?.hover)) {
    return product.hoverImage || product.hover_image || product.images?.hover
  }
  if (Array.isArray(product.images?.gallery) && product.images.gallery[idx]) {
    return product.images.gallery[idx]
  }
  return null
}

function MobileShopProductCard({ product }) {
  const [selectedColor, setSelectedColor] = useState(null)
  const colorMap = Object.fromEntries(SHOP_COLORS.map((c) => [c.id, c]))

  const primaryImg =
    product.images?.primary ||
    product.primary_image ||
    product.image ||
    '/images/products/floral-midi-dress.webp'

  const colorsList = Array.isArray(product.colors) ? product.colors : []
  const activeColorIdx = colorsList.findIndex((c) => {
    const id = typeof c === 'string' ? c : c.id || c.name
    return id === selectedColor
  })
  const colorImg = selectedColor ? getColorImage(product, selectedColor, activeColorIdx >= 0 ? activeColorIdx : 0) : null
  const displayImg = colorImg || primaryImg

  return (
    <article className="flex flex-col rounded-[16px] border border-primary/5 bg-white overflow-hidden shadow-none transition-shadow">
      {/* Product Image Area */}
      <div className="relative aspect-[4/5] w-full bg-[#F7F1F2] overflow-hidden rounded-t-[16px]">
        <Link to={product.href || `/products/${product.slug || product.id}`} className="block h-full w-full">
          <img
            src={displayImg}
            alt={product.title}
            loading="lazy"
            decoding="async"
            width="240"
            height="300"
            className="h-full w-full object-cover object-top"
          />
        </Link>

        {/* Top-Left Badge */}
        <div className="absolute left-2.5 top-2.5 flex flex-col gap-1 z-10">
          {product.badges?.includes('new') && (
            <ProductBadge type="new" className="!rounded-md !px-2 !py-0.5 !text-[10px] !font-bold">
              NEW
            </ProductBadge>
          )}
          {product.badges?.includes('sale') && !product.badges?.includes('new') && (
            <ProductBadge type="sale" className="!rounded-md !px-2 !py-0.5 !text-[10px] !font-bold">
              SALE
            </ProductBadge>
          )}
          {product.badges?.includes('limited') && !product.badges?.includes('new') && !product.badges?.includes('sale') && (
            <ProductBadge type="limited" className="!rounded-md !px-2 !py-0.5 !text-[10px] !font-bold">
              LIMITED
            </ProductBadge>
          )}
          {product.discount >= 20 && !product.badges?.includes('sale') && (
            <ProductBadge type="discount" className="!rounded-md !px-2 !py-0.5 !text-[10px] !font-bold">
              -{product.discount}%
            </ProductBadge>
          )}
        </div>

        {/* Top-Right Wishlist Button */}
        <div className="absolute right-2.5 top-2.5 z-10">
          <WishlistButton
            id={product.id}
            className="!h-8 !w-8 !bg-white/90 shadow-sm backdrop-blur-sm hover:!bg-white"
          />
        </div>
      </div>

      {/* Product Details Area */}
      <div className="flex flex-1 flex-col p-3 pt-2">
        {/* Category */}
        {product.category && (
          <p className="font-label text-[10px] font-bold uppercase tracking-[0.16em] text-primary/85 mb-0.5">
            {product.category}
          </p>
        )}

        {/* Title */}
        <Link
          to={product.href || `/products/${product.slug || product.id}`}
          className="line-clamp-1 font-heading text-[15px] sm:text-[16px] font-semibold text-[#2A1A22] transition hover:text-primary leading-snug tracking-tight"
        >
          {product.title}
        </Link>

        {/* Price Row */}
        <div className="mt-1 flex flex-wrap items-baseline gap-1.5 text-xs">
          <span className="font-heading text-[15px] sm:text-[16px] font-bold text-[#222222]">
            {formatINR(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <>
              <span className="font-sans text-[11px] text-ink-muted line-through font-normal">
                {formatINR(product.originalPrice)}
              </span>
              <span className="font-label text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                {product.discount}% OFF
              </span>
            </>
          )}
        </div>

        {/* Color Swatches Row */}
        <div className="mt-2 flex items-center gap-1.5 z-10" role="group" aria-label="Color options">
          {colorsList.slice(0, 3).map((cObj, idx) => {
            const colorId = typeof cObj === 'string' ? cObj : cObj.id || cObj.name
            const hex = typeof cObj === 'object' && cObj.hex ? cObj.hex : colorMap[colorId]?.hex || '#AD4A85'
            const isSelected = selectedColor === colorId || (!selectedColor && idx === 0)
            const colorLabel = typeof cObj === 'object' ? cObj.name : colorMap[colorId]?.label || colorId
            return (
              <button
                key={colorId + idx}
                type="button"
                role="button"
                aria-label={`Select color ${colorLabel}`}
                aria-pressed={isSelected}
                title={colorLabel}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setSelectedColor(colorId)
                }}
                className={cn(
                  'h-3.5 w-3.5 rounded-full border border-black/10 transition-transform active:scale-90 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary',
                  isSelected && 'ring-1 ring-primary ring-offset-1 scale-110',
                )}
                style={{ backgroundColor: hex }}
              />
            )
          })}
          {colorsList.length > 3 && (
            <span className="text-[10px] font-semibold text-ink-muted">
              +{colorsList.length - 3}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export default memo(MobileShopProductCard)
