import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, ShoppingBag, Loader2, Check } from 'lucide-react'
import ProductBadge from '@/components/shop/ProductBadge'
import WishlistButton from '@/components/shop/WishlistButton'
import { SHOP_COLORS } from '@/constants/shopProducts'
import { cn, formatINR } from '@/lib/utils'
import { useAddToBag } from '@/hooks/useAddToBag'

function toCartProduct(product) {
  const primaryImg =
    product.image ||
    product.primary_image ||
    product.images?.primary ||
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'

  return {
    id: product.id,
    name: product.title || product.name || 'Jalyn Essential Item',
    price: product.price,
    image: primaryImg,
    href: `/products/${product.slug || product.id}`,
  }
}

function getColorImage(product, colorId, idx) {
  if (!colorId || !product) return null
  const normalizedId = typeof colorId === 'string' ? colorId.toLowerCase().trim() : String(colorId).toLowerCase()

  // 1. Check color_images / colorImages object
  let colorImgs = product.color_images || product.colorImages
  if (typeof colorImgs === 'string') {
    try { colorImgs = JSON.parse(colorImgs) } catch (e) { colorImgs = null }
  }
  if (colorImgs && typeof colorImgs === 'object') {
    if (colorImgs[colorId]) {
      const val = colorImgs[colorId]
      return Array.isArray(val) ? val[0] : val
    }
    const key = Object.keys(colorImgs).find(k => k.toLowerCase().trim() === normalizedId)
    if (key && colorImgs[key]) {
      const val = colorImgs[key]
      return Array.isArray(val) ? val[0] : val
    }
  }

  // 2. Check colors list for objects with image property
  const colorsList = product.rawColors || product.colors
  if (Array.isArray(colorsList)) {
    const colObj = colorsList.find(c => typeof c === 'object' && (c.id === colorId || c.name?.toLowerCase().trim() === normalizedId))
    if (colObj) {
      if (colObj.image) return colObj.image
      if (colObj.primary_image) return colObj.primary_image
      if (Array.isArray(colObj.images) && colObj.images.length > 0) return colObj.images[0]
    }
  }

  // 3. Check variants array for variant image matching selected color
  if (Array.isArray(product.variants)) {
    const vMatch = product.variants.find(v => v.color && String(v.color).toLowerCase().trim() === normalizedId && (v.image || v.primary_image || v.colorImage))
    if (vMatch) {
      return vMatch.image || vMatch.primary_image || vMatch.colorImage
    }
  }

  // 4. Fallback to hoverImage if index 1
  if (idx === 1 && (product.hoverImage || product.hover_image || product.images?.hover)) {
    return product.hoverImage || product.hover_image || product.images?.hover
  }
  if (Array.isArray(product.images?.gallery) && product.images.gallery[idx]) {
    return product.images.gallery[idx]
  }

  return null
}

function ShopProductCard({ product, listView = false, onQuickView }) {
  const [hovered, setHovered] = useState(false)
  const [selectedColor, setSelectedColor] = useState(null)
  const { adding, added, addToBag } = useAddToBag()
  const colorMap = Object.fromEntries(SHOP_COLORS.map((c) => [c.id, c]))

  if (!product) return null

  const title = product.title || product.name || 'Jalyn Essential Item'
  const primaryImg =
    product.image ||
    product.primary_image ||
    product.images?.primary ||
    'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'
  const hoverImg =
    product.hoverImage ||
    product.hover_image ||
    product.images?.hover ||
    primaryImg
  const category = product.category || product.category_slug || 'dresses'
  const rating = product.rating || 4.8
  const reviewsCount = product.reviews ?? product.reviews_count ?? 12
  const originalPrice = product.originalPrice || product.original_price || product.compareAt

  const colorsList = Array.isArray(product.colors) ? product.colors : []
  const activeColorIdx = colorsList.findIndex((c) => {
    const id = typeof c === 'string' ? c : c.id || c.name
    return id === selectedColor
  })
  const colorImg = selectedColor ? getColorImage(product, selectedColor, activeColorIdx >= 0 ? activeColorIdx : 0) : null
  const displayImg = hovered && hoverImg ? hoverImg : (colorImg || primaryImg)

  if (listView) {
    return (
      <article
        className="flex gap-4 rounded-[6px] bg-white p-3 shadow-soft ring-1 ring-primary/5 sm:gap-5 sm:p-4 transition-all duration-300"
      >
        <Link
          to={`/products/${product.slug || product.id}`}
          className="relative aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-[6px] sm:w-36"
        >
          <img
            src={displayImg}
            alt={title}
            loading="lazy"
            decoding="async"
            width="144"
            height="180"
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/images/products/floral-midi-dress.webp'
            }}
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col py-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
                {category}
              </p>
              <Link
                to={`/products/${product.slug || product.id}`}
                className="font-display text-base font-medium text-ink transition hover:text-primary sm:text-lg line-clamp-1"
              >
                {title}
              </Link>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-sans text-sm font-semibold text-primary sm:text-base">
                  {formatINR(product.price)}
                </span>
                {originalPrice > product.price && (
                  <span className="text-xs text-ink-muted line-through">
                    {formatINR(originalPrice)}
                  </span>
                )}
                {product.discount > 0 && (
                  <span className="rounded bg-rose-light px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    {product.discount}% OFF
                  </span>
                )}
              </div>
            </div>
            <WishlistButton id={product.id} className="relative top-0 right-0 shrink-0" />
          </div>

          <p className="mt-2 text-xs text-ink-muted line-clamp-2 sm:text-sm">
            {product.description || 'Thoughtfully crafted with premium quality materials.'}
          </p>

          <div className="mt-auto flex items-center justify-end pt-3 border-t border-primary/5">
            <button
              onClick={() => onQuickView?.(product)}
              className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Quick View</span>
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <article
      className="group relative transition-transform duration-300 hover:-translate-y-1.5 hover:scale-[1.01]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] bg-rose-light/30 shadow-soft ring-1 ring-primary/5 transition duration-300 group-hover:shadow-lift">
        <Link to={`/products/${product.slug || product.id}`} className="block h-full w-full">
          <img
            src={displayImg}
            alt={title}
            loading="lazy"
            decoding="async"
            width="320"
            height="400"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            onError={(e) => {
              e.currentTarget.src = '/images/products/floral-midi-dress.webp'
            }}
          />
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.badges?.includes('new') && (
            <ProductBadge type="new">New</ProductBadge>
          )}
          {product.badges?.includes('sale') && (
            <ProductBadge type="sale">Sale</ProductBadge>
          )}
          {product.badges?.includes('limited') && (
            <ProductBadge type="limited">Limited</ProductBadge>
          )}
          {product.discount >= 20 && !product.badges?.includes('sale') && (
            <ProductBadge type="discount">-{product.discount}%</ProductBadge>
          )}
        </div>

        <WishlistButton id={product.id} className="absolute right-3 top-3 z-10" />

        <div
          className={cn(
            'absolute inset-x-3 bottom-3 flex items-center gap-2 transition duration-300 z-10',
            hovered
              ? 'translate-y-0 opacity-100'
              : 'pointer-events-none translate-y-3 opacity-0',
          )}
        >
          <button
            type="button"
            onClick={() => onQuickView?.(product)}
            className="group/qb flex flex-1 items-center justify-center gap-2 rounded-[6px] bg-white hover:bg-primary text-ink hover:text-white py-2.5 px-3 text-xs font-bold uppercase tracking-wider shadow-md backdrop-blur-sm transition-all duration-200 cursor-pointer"
            aria-label={`Quick view ${title}`}
          >
            <Eye className="h-4 w-4 text-primary group-hover/qb:text-white transition-colors" />
            <span className="text-ink group-hover/qb:text-white transition-colors">Quick View</span>
          </button>
          <button
            type="button"
            onClick={() => addToBag(toCartProduct(product))}
            disabled={adding}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] text-white shadow-md transition-all duration-200 active:scale-90 cursor-pointer disabled:cursor-wait disabled:opacity-90',
              added ? 'bg-emerald-600 hover:bg-emerald-600' : 'bg-primary hover:bg-primary-deep',
            )}
            aria-label={`Add ${title} to bag`}
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
            ) : added ? (
              <Check className="h-4 w-4" strokeWidth={2.5} />
            ) : (
              <ShoppingBag className="h-4 w-4 text-white" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 px-0.5">
        <div className="flex items-center justify-between">
          <p className="font-label text-[10px] font-bold uppercase tracking-[0.18em] text-primary/85">
            {category}
          </p>

          {/* Interactive Color Swatches */}
          {colorsList.length > 0 && (
            <div className="flex items-center gap-1.5 z-10" role="group" aria-label="Color options">
              {colorsList.slice(0, 5).map((cObj, idx) => {
                const colorId = typeof cObj === 'string' ? cObj : cObj.id || cObj.name
                const colorLabel = typeof cObj === 'object' ? cObj.name || cObj.id : colorMap[colorId]?.label || colorId
                const hex = (typeof cObj === 'object' && cObj.hex)
                  ? cObj.hex
                  : product.colorHexMap?.[colorLabel] || product.colorHexMap?.[colorId] || colorMap[colorId]?.hex || '#AD4A85'
                const isSelected = selectedColor === colorId || (!selectedColor && idx === 0)
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
                    onMouseEnter={() => setSelectedColor(colorId)}
                    className={cn(
                      'h-3.5 w-3.5 rounded-full border border-black/10 transition-transform active:scale-90 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary',
                      isSelected && 'ring-2 ring-primary ring-offset-1 scale-110'
                    )}
                    style={{ backgroundColor: hex }}
                  />
                )
              })}
            </div>
          )}
        </div>

        <Link
          to={`/products/${product.slug || product.id}`}
          className="block font-heading text-[16px] sm:text-[17px] font-semibold text-[#2A1A22] transition-colors hover:text-primary line-clamp-1 leading-snug tracking-tight"
        >
          {title}
        </Link>
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="font-heading text-[16px] sm:text-[18px] font-bold text-[#2A1A22]">
            {formatINR(product.price)}
          </span>
          {originalPrice > product.price && (
            <>
              <span className="font-sans text-[12px] text-ink-muted line-through font-normal">
                {formatINR(originalPrice)}
              </span>
              {product.discount > 0 && (
                <span className="font-label text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  {product.discount}% OFF
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </article>
  )
}

export default memo(ShopProductCard)
