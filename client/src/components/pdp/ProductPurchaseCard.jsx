import { useState, useEffect } from 'react'
import { ShoppingBag, Truck, RotateCcw, ShieldCheck, MapPin, CheckCircle2, AlertCircle, Lock, Edit2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore, useDeliveryStore } from '@/store'
import { cn } from '@/lib/utils'

export default function ProductPurchaseCard({ product, selectedSize, selectedColor }) {
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)
  const deliveryStore = useDeliveryStore()

  const [inputPincode, setInputPincode] = useState(deliveryStore.pincode || '')
  const [pincodeError, setPincodeError] = useState('')
  const [showToast, setShowToast] = useState(false)
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
      setShowToast(false)
      setIsEditingPincode(false)
    }
  }

  const handleDisabledClick = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3500)

    setIsEditingPincode(true)
    setTimeout(() => {
      const pincodeInput = document.querySelector('input[placeholder*="Pincode"]')
      if (pincodeInput) {
        pincodeInput.scrollIntoView({ behavior: 'smooth', block: 'center' })
        pincodeInput.focus()
      }
    }, 100)
  }

  const isOutOfStock = product.inStock === false

  const handleAddBag = () => {
    if (isOutOfStock) {
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3500)
      return
    }

    if (!deliveryStore.isVerified) {
      handleDisabledClick()
      return
    }

    const primaryImg =
      product.image ||
      product.primary_image ||
      product.images?.primary ||
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'

    addItem({
      id: product.id,
      name: product.title || product.name,
      price: product.price,
      image: primaryImg,
      size: selectedSize,
      color: selectedColor,
      href: `/products/${product.slug || product.id}`,
    })

    openCart()
  }

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Toast Alert Popover Message */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'rounded-xl text-white p-3.5 shadow-2xl backdrop-blur-md flex items-center gap-3 border',
              isOutOfStock
                ? 'bg-red-900/95 border-red-500/30'
                : 'bg-amber-900/95 border-amber-500/30',
            )}
          >
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 animate-bounce" />
            <div className="flex-1 text-xs">
              {isOutOfStock ? (
                <p className="font-bold text-red-200">This variant is out of stock</p>
              ) : (
                <>
                  <p className="font-bold text-amber-200">Pincode Verification Required</p>
                  <p className="text-[11px] text-amber-100">
                    Please enter and check your delivery pincode above for delivery estimation first!
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estimated Delivery Pincode Checker (Collapsible when verified) */}
      <div className={cn(
        'rounded-2xl border p-3.5 shadow-sm space-y-2.5 transition-all',
        deliveryStore.isVerified
          ? 'border-emerald-300 bg-emerald-50/40'
          : 'border-amber-300 bg-amber-50/30'
      )}>
        <div className="flex items-center justify-between font-label text-xs font-bold uppercase tracking-wider text-ink">
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

        {/* Collapsed Verified State vs Expandable Edit Form */}
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
            <span>Enter &amp; verify your delivery pincode above to enable <strong>Add to Bag</strong>.</span>
          </p>
        )}
      </div>

      {/* SINGLE ROW Badges */}
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-primary/10 bg-white p-3 shadow-sm text-center">
        <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-rose-light/20">
          <Truck className="h-4 w-4 text-primary" />
          <span className="font-label text-[11px] font-bold text-ink">Free Shipping</span>
          <span className="text-[10px] text-ink-muted leading-tight">Orders over ₹1999</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-rose-light/20">
          <RotateCcw className="h-4 w-4 text-primary" />
          <span className="font-label text-[11px] font-bold text-ink">Easy Return</span>
          <span className="text-[10px] text-ink-muted leading-tight">7-Day Hassle Free</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-rose-light/20">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="font-label text-[11px] font-bold text-ink">Secure Payment</span>
          <span className="text-[10px] text-ink-muted leading-tight">100% Encrypted</span>
        </div>
      </div>

      {/* Primary CTA: ADD TO BAG */}
      <button
        type="button"
        onClick={handleAddBag}
        className={cn(
          'flex h-14 w-full items-center justify-center gap-2 rounded-xl font-label text-xs font-bold uppercase tracking-[0.14em] transition-all duration-300',
          isOutOfStock
            ? 'bg-red-100 text-red-500 border border-red-300 cursor-not-allowed'
            : deliveryStore.isVerified
            ? 'bg-primary text-white hover:bg-primary-deep hover:shadow-lift cursor-pointer active:scale-[0.99]'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 border border-gray-300 cursor-pointer'
        )}
      >
        {isOutOfStock ? (
          <>
            <AlertCircle className="h-4 w-4" />
            <span>OUT OF STOCK</span>
          </>
        ) : deliveryStore.isVerified ? (
          <>
            <ShoppingBag className="h-4 w-4" />
            <span>ADD TO BAG</span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4 text-gray-600" />
            <span>ENTER PINCODE TO ADD TO BAG</span>
          </>
        )}
      </button>

      {/* Secondary CTA: BUY NOW */}
      <button
        type="button"
        onClick={handleAddBag}
        className={cn(
          'flex h-14 w-full items-center justify-center rounded-xl border-2 font-label text-xs font-bold uppercase tracking-[0.14em] transition-all duration-300 cursor-pointer',
          isOutOfStock
            ? 'border-red-200 bg-red-50 text-red-400 cursor-not-allowed'
            : deliveryStore.isVerified
            ? 'border-primary bg-white text-primary hover:bg-rose-light/30 active:scale-[0.99]'
            : 'border-gray-200 bg-gray-100 text-gray-500'
        )}
      >
        <span>{isOutOfStock ? 'OUT OF STOCK' : 'BUY NOW & PROCEED TO CART'}</span>
      </button>
    </div>
  )
}
