import { useState, useEffect } from 'react'
import { Star, Ruler, Sparkles, Check, MapPin, CheckCircle2, AlertCircle, Lock, Edit2 } from 'lucide-react'
import { SHOP_COLORS } from '@/constants/shopProducts'
import { cn, formatINR } from '@/lib/utils'
import { useDeliveryStore } from '@/store'

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

  const deliveryStore = useDeliveryStore()
  const [inputPincode, setInputPincode] = useState(deliveryStore.pincode || '')
  const [pincodeError, setPincodeError] = useState('')
  const [isEditingPincode, setIsEditingPincode] = useState(false)

  useEffect(() => {
    if (deliveryStore.pincode) {
      setInputPincode(deliveryStore.pincode)
    }
  }, [deliveryStore.pincode])

  const handleCheckDelivery = (e) => {
    e.preventDefault()
    setPincodeError('')
    const res = deliveryStore.verifyPincode(inputPincode)
    if (!res.success) {
      setPincodeError(res.message)
    } else {
      setIsEditingPincode(false)
    }
  }

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

      {/* Pincode Delivery Estimate Option for Mobile (Collapsible when verified) */}
      <div className={cn(
        'rounded-2xl border p-3.5 shadow-sm space-y-2.5 transition-all',
        deliveryStore.isVerified
          ? 'border-emerald-300 bg-emerald-50/40'
          : 'border-amber-300 bg-amber-50/30'
      )}>
        <div className="flex items-center justify-between font-label text-xs font-bold uppercase tracking-wider text-[#222222]">
          <div className="flex items-center gap-2">
            <MapPin className={cn('h-4 w-4', deliveryStore.isVerified ? 'text-emerald-600' : 'text-amber-600')} />
            <span>Check Estimated Delivery</span>
          </div>
          {deliveryStore.isVerified && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Verified
            </span>
          )}
        </div>

        {/* Collapsed Verified Bar vs Expandable Edit Form */}
        {deliveryStore.isVerified && !isEditingPincode ? (
          <div className="flex items-center justify-between p-2.5 bg-white/90 rounded-xl border border-emerald-200 text-xs text-emerald-900 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <p className="font-semibold text-emerald-800 text-[11.5px] leading-tight">
                Delivery available to <strong>{deliveryStore.deliveryInfo?.pincode || deliveryStore.pincode}</strong> · Ships in 3-5 days
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingPincode(true)}
              className="text-xs font-bold text-primary hover:underline uppercase tracking-wider shrink-0 ml-2 flex items-center gap-1"
            >
              <Edit2 className="h-3 w-3" />
              <span>Change</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleCheckDelivery} className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={inputPincode}
              onChange={(e) => setInputPincode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit Pincode (e.g. 400050)"
              className="flex-1 rounded-xl border border-primary/20 bg-white px-3.5 py-2 text-xs font-mono font-medium outline-none focus:border-primary transition"
            />
            <button
              type="submit"
              className="rounded-xl bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-primary-deep transition shrink-0"
            >
              {deliveryStore.isVerified ? 'Update' : 'Check'}
            </button>
          </form>
        )}

        {pincodeError && (
          <p className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
            <AlertCircle className="h-3.5 w-3.5" />
            {pincodeError}
          </p>
        )}

        {!deliveryStore.isVerified && (
          <p className="flex items-center gap-1.5 text-[11px] text-amber-800 font-medium">
            <Lock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span>Verify your delivery pincode to enable Add to Bag.</span>
          </p>
        )}
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
