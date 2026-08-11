import { memo } from 'react'
import { Link } from 'react-router-dom'
import { Star } from 'lucide-react'
import ProductBadge from '@/components/shop/ProductBadge'
import WishlistButton from '@/components/shop/WishlistButton'
import { SHOP_COLORS } from '@/constants/shopProducts'
import { cn, formatINR } from '@/lib/utils'

function MobileShopProductCard({ product }) {
  const colorMap = Object.fromEntries(SHOP_COLORS.map((c) => [c.id, c]))

  return (
    <article className="flex flex-col rounded-[16px] border border-primary/5 bg-white overflow-hidden shadow-none transition-shadow">
      {/* Product Image Area */}
      <div className="relative aspect-[4/5] w-full bg-[#F7F1F2] overflow-hidden rounded-t-[16px]">
        <Link to={`/products/${product.slug}`} className="block h-full w-full">
          <img
            src={product.images.primary}
            alt={product.title}
            loading="lazy"
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
      <div className="flex flex-1 flex-col p-3 pt-2.5">
        {/* Title */}
        <Link
          to={`/products/${product.slug}`}
          className="line-clamp-1 font-label text-[14px] font-semibold text-[#222222] transition hover:text-primary"
        >
          {product.title}
        </Link>

        {/* Price Row */}
        <div className="mt-1 flex flex-wrap items-baseline gap-1.5 text-xs">
          <span className="font-heading text-[15px] font-bold text-[#222222]">
            {formatINR(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <>
              <span className="text-[11px] text-ink-muted line-through">
                {formatINR(product.originalPrice)}
              </span>
              <span className="text-[11px] font-bold text-primary">
                {product.discount}% OFF
              </span>
            </>
          )}
        </div>

        {/* Rating Row */}
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-ink-muted">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  'h-3 w-3',
                  i < Math.round(product.rating)
                    ? 'fill-primary text-primary'
                    : 'fill-rose-light/50 text-rose-light',
                )}
              />
            ))}
          </div>
          <span className="text-[11px] font-medium text-ink-muted">
            ({product.reviews})
          </span>
        </div>

        {/* Color Swatches Row */}
        <div className="mt-2 flex items-center gap-1.5">
          {product.colors?.slice(0, 3).map((colorId, idx) => (
            <span
              key={colorId}
              className={cn(
                'h-3.5 w-3.5 rounded-full border border-black/10',
                idx === 0 && 'ring-1 ring-primary ring-offset-1',
              )}
              style={{ backgroundColor: colorMap[colorId]?.hex || '#ccc' }}
            />
          ))}
          {product.colors?.length > 3 && (
            <span className="text-[10px] font-semibold text-ink-muted">
              +{product.colors.length - 3}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

export default memo(MobileShopProductCard)
