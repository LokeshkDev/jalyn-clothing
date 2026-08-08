import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Truck,
  CreditCard,
  Banknote,
  Lock,
  ArrowLeft,
  Tag,
  AlertCircle,
  ChevronDown,
  MapPin,
  Check,
} from 'lucide-react'
import { useCartStore, useUserStore, useOrderStore } from '@/store'
import { formatINR, cn } from '@/lib/utils'
import AddressModal from '@/components/profile/AddressModal'
import MobileAddressSheet from '@/components/checkout/MobileAddressSheet'
import MobileCouponSheet from '@/components/checkout/MobileCouponSheet'

export default function Checkout() {
  const navigate = useNavigate()
  const cartItems = useCartStore((s) => s.items)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const clearCart = useCartStore((s) => s.clearCart)

  const user = useUserStore((s) => s.user)
  const addresses = useUserStore((s) => s.addresses)
  const addAddress = useUserStore((s) => s.addAddress)
  const updateAddress = useUserStore((s) => s.updateAddress)
  const deleteAddress = useUserStore((s) => s.deleteAddress)
  const coupons = useUserStore((s) => s.coupons)
  const addOrder = useOrderStore((s) => s.addOrder)

  const [selectedAddrId, setSelectedAddrId] = useState(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || '',
  )
  const [shippingMethod, setShippingMethod] = useState('standard') // 'standard' | 'express'
  const [paymentMethod, setPaymentMethod] = useState('online') // 'online' | 'cod'
  const [orderNotes, setOrderNotes] = useState('')

  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false)
  const [isAddressSheetOpen, setIsAddressSheetOpen] = useState(false)
  const [isCouponSheetOpen, setIsCouponSheetOpen] = useState(false)

  const [addressToEdit, setAddressToEdit] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  const [orderSummaryExpanded, setOrderSummaryExpanded] = useState(false)

  const subtotal = getSubtotal()
  const shippingCost = shippingMethod === 'express' ? 99 : subtotal >= 1999 ? 0 : 99

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0
    return Math.round((subtotal * appliedCoupon.discount) / 100)
  }, [subtotal, appliedCoupon])

  const taxAmount = Math.round((subtotal - discountAmount) * 0.05)
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost + taxAmount)

  const selectedAddressObj = useMemo(() => {
    return addresses.find((a) => a.id === selectedAddrId) || addresses[0]
  }, [addresses, selectedAddrId])

  const handleApplyCoupon = (e) => {
    if (e) e.preventDefault()
    setCouponError('')
    const match = coupons.find(
      (c) => c.code.toUpperCase() === couponCode.trim().toUpperCase(),
    )
    if (!match) {
      setCouponError('Invalid coupon code. Try JALYN10 or WELCOME10')
      return
    }
    if (subtotal < match.minAmount) {
      setCouponError(`Minimum order amount for ${match.code} is ${formatINR(match.minAmount)}`)
      return
    }
    setAppliedCoupon(match)
    setToastMessage(`Coupon ${match.code} applied successfully!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handlePlaceOrder = () => {
    if (!selectedAddressObj) {
      setToastMessage('Please select or add a delivery address.')
      setTimeout(() => setToastMessage(null), 3000)
      return
    }

    if (cartItems.length === 0) {
      setToastMessage('Your cart is empty.')
      setTimeout(() => setToastMessage(null), 3000)
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      const newOrder = addOrder({
        address: selectedAddressObj,
        shippingMethod,
        shippingCost,
        paymentMethod,
        orderNotes,
        items: cartItems,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: grandTotal,
      })

      clearCart()
      setIsSubmitting(false)
      navigate('/order-success', { state: { orderId: newOrder.id } })
    }, 1200)
  }

  const steps = [
    { label: 'Address', status: 'completed' },
    { label: 'Delivery', status: 'completed' },
    { label: 'Payment', status: 'active' },
    { label: 'Review', status: 'upcoming' },
  ]

  return (
    <div className="bg-surface min-h-screen">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 right-6 z-[100] flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-semibold text-white shadow-lift"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================
          MOBILE CHECKOUT VIEW (< 1024px / lg)
         ========================================= */}
      <div className="block lg:hidden pb-[140px]">
        {/* Mobile Sub-Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-primary/10">
          <div className="flex items-center gap-2.5">
            <Link
              to="/shop"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF8F8] text-[#222222]"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-[16px] font-bold text-[#222222]">Secure Checkout</h1>
              <p className="text-[10px] text-[#666666]">Complete your fashion order</p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="h-3 w-3" />
            <span>SSL Secured</span>
          </span>
        </div>

        {/* Mobile Progress Bar */}
        <div className="bg-white px-4 py-2.5 border-b border-primary/10">
          <div className="flex items-center justify-between text-[11px] font-bold text-[#666666]">
            {steps.map((step, idx) => (
              <div key={step.label} className="flex items-center gap-1">
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-[10px]',
                    idx === 2
                      ? 'bg-primary text-white'
                      : idx < 2
                        ? 'bg-primary/20 text-primary font-bold'
                        : 'bg-[#FAF8F8] text-[#666666]/60 border border-[#E5D8DE]',
                  )}
                >
                  {idx < 2 ? '✓' : idx + 1}
                </span>
                <span className={idx === 2 ? 'text-primary font-bold' : ''}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* 1. Delivery Address Card */}
          <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-[#222222] flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Delivery Address</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressSheetOpen(true)}
                className="text-[12px] font-bold text-primary active:scale-95"
              >
                Change
              </button>
            </div>

            {selectedAddressObj ? (
              <div className="rounded-xl bg-[#FAF8F8] p-3 text-[12px] space-y-0.5 border border-primary/5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#222222]">{selectedAddressObj.name}</span>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                    {selectedAddressObj.type}
                  </span>
                </div>
                <p className="text-[#666666]">{selectedAddressObj.addressLine1}</p>
                <p className="text-[#666666]">
                  {selectedAddressObj.city}, {selectedAddressObj.state} — {selectedAddressObj.pincode}
                </p>
                <p className="text-[#222222] font-semibold pt-1">Phone: {selectedAddressObj.phone}</p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/40 p-3 text-xs font-bold text-primary"
              >
                <Plus className="h-4 w-4" />
                <span>Add Delivery Address</span>
              </button>
            )}
          </div>

          {/* 2. Delivery Options */}
          <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm space-y-2.5">
            <h3 className="text-[13px] font-bold text-[#222222]">Delivery Options</h3>

            <div className="grid grid-cols-1 gap-2.5">
              <div
                onClick={() => setShippingMethod('standard')}
                className={cn(
                  'flex items-center gap-3 rounded-xl p-3 border transition-all text-[12px]',
                  shippingMethod === 'standard'
                    ? 'border-primary bg-[#EFD7E3]/20 shadow-xs'
                    : 'border-[#E5D8DE] bg-white',
                )}
                style={{ minHeight: '52px' }}
              >
                <input
                  type="radio"
                  name="mobileShipping"
                  checked={shippingMethod === 'standard'}
                  onChange={() => setShippingMethod('standard')}
                  className="h-4 w-4 text-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#222222]">Standard Delivery</span>
                    <span className="font-bold text-emerald-700">
                      {subtotal >= 1999 ? 'FREE' : '₹99'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#666666]">Delivery in 3–5 business days</p>
                </div>
              </div>

              <div
                onClick={() => setShippingMethod('express')}
                className={cn(
                  'flex items-center gap-3 rounded-xl p-3 border transition-all text-[12px]',
                  shippingMethod === 'express'
                    ? 'border-primary bg-[#EFD7E3]/20 shadow-xs'
                    : 'border-[#E5D8DE] bg-white',
                )}
                style={{ minHeight: '52px' }}
              >
                <input
                  type="radio"
                  name="mobileShipping"
                  checked={shippingMethod === 'express'}
                  onChange={() => setShippingMethod('express')}
                  className="h-4 w-4 text-primary"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#222222]">Express Delivery</span>
                    <span className="font-bold text-primary">₹99</span>
                  </div>
                  <p className="text-[11px] text-[#666666]">Fast delivery in 1–2 business days</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Payment Method */}
          <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm space-y-2.5">
            <h3 className="text-[13px] font-bold text-[#222222]">Payment Method</h3>

            <div className="space-y-2.5">
              {/* Online Payment Card */}
              <div
                onClick={() => setPaymentMethod('online')}
                className={cn(
                  'rounded-xl p-3.5 border transition-all text-[12px]',
                  paymentMethod === 'online'
                    ? 'border-primary bg-[#EFD7E3]/20 shadow-xs'
                    : 'border-[#E5D8DE] bg-white',
                )}
                style={{ minHeight: '56px' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="mobilePayment"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                      className="h-4 w-4 text-primary"
                    />
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <span className="font-bold text-[#222222]">Online Payment</span>
                      <p className="text-[11px] text-[#666666]">UPI, Cards, Net Banking</p>
                    </div>
                  </div>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                    Instant
                  </span>
                </div>
              </div>

              {/* Cash on Delivery Card */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={cn(
                  'rounded-xl p-3.5 border transition-all text-[12px]',
                  paymentMethod === 'cod'
                    ? 'border-primary bg-[#EFD7E3]/20 shadow-xs'
                    : 'border-[#E5D8DE] bg-white',
                )}
                style={{ minHeight: '56px' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="mobilePayment"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="h-4 w-4 text-primary"
                    />
                    <Banknote className="h-5 w-5 text-emerald-700" />
                    <div>
                      <span className="font-bold text-[#222222]">Cash on Delivery</span>
                      <p className="text-[11px] text-[#666666]">Pay cash when order arrives</p>
                    </div>
                  </div>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                    ✓ COD Available
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Expandable Order Summary */}
          <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
            <button
              type="button"
              onClick={() => setOrderSummaryExpanded((prev) => !prev)}
              className="flex w-full items-center justify-between text-[13px] font-bold text-[#222222]"
            >
              <span>Order Summary ({cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'})</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-[#666666] transition-transform duration-300',
                  orderSummaryExpanded && 'rotate-180',
                )}
              />
            </button>

            {orderSummaryExpanded && (
              <div className="mt-3 pt-3 border-t border-primary/10 space-y-3">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-[12px]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-14 w-12 rounded-lg object-cover object-top border border-primary/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#222222] truncate">{item.name}</p>
                      <p className="text-[11px] text-[#666666]">
                        Size: {item.size || 'M'} | Qty: {item.qty}
                      </p>
                      <p className="font-bold text-primary">{formatINR(item.price * item.qty)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 5. Apply Coupon Card */}
          <div
            onClick={() => setIsCouponSheetOpen(true)}
            className="flex items-center justify-between rounded-2xl border border-primary/10 bg-white p-4 shadow-sm cursor-pointer active:bg-[#FAF8F8]"
          >
            <div className="flex items-center gap-2.5">
              <Tag className="h-4 w-4 text-primary" />
              <span className="text-[13px] font-bold text-[#222222]">
                {appliedCoupon ? `Coupon ${appliedCoupon.code} Applied` : 'Apply Coupon'}
              </span>
            </div>
            <span className="text-[12px] font-bold text-primary">
              {appliedCoupon ? `-${appliedCoupon.discount}% OFF` : 'Select >'}
            </span>
          </div>

          {/* 6. Price Breakdown */}
          <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm space-y-2 text-[12px]">
            <h4 className="font-bold text-[#222222] pb-1 border-b border-primary/10">Price Details</h4>
            <div className="flex justify-between text-[#666666]">
              <span>Subtotal</span>
              <span className="font-semibold text-[#222222]">{formatINR(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon Discount</span>
                <span>-{formatINR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#666666]">
              <span>Shipping</span>
              <span className="font-semibold text-[#222222]">
                {shippingCost === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : formatINR(shippingCost)}
              </span>
            </div>
            <div className="flex justify-between text-[#666666]">
              <span>Estimated Tax (5%)</span>
              <span className="font-semibold text-[#222222]">{formatINR(taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-primary/10 pt-2 text-[14px] font-bold text-[#222222]">
              <span>Total Amount</span>
              <span className="text-primary font-display text-[16px]">{formatINR(grandTotal)}</span>
            </div>
          </div>

          {/* 7. Security Card */}
          <div className="rounded-2xl bg-white border border-primary/10 p-3 text-center text-[11px] text-[#666666] flex items-center justify-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-emerald-600" />
            <span>🔒 Your payment & address details are 256-bit SSL encrypted.</span>
          </div>
        </div>

        {/* Fixed Mobile Bottom Checkout Bar */}
        <div
          className="fixed inset-x-0 z-40 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-primary/10 lg:hidden"
          style={{
            bottom: '60px',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          }}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <span className="text-[10px] text-[#666666] block">Total Amount</span>
              <span className="font-display text-[18px] font-bold text-primary">
                {formatINR(grandTotal)}
              </span>
            </div>

            <motion.button
              type="button"
              disabled={isSubmitting || cartItems.length === 0}
              onClick={handlePlaceOrder}
              whileTap={{ scale: 0.97 }}
              className="flex h-12 flex-1 max-w-[220px] items-center justify-center gap-2 rounded-xl bg-primary text-[12px] font-bold uppercase tracking-wider text-white shadow-soft active:bg-primary-deep"
            >
              <Lock className="h-4 w-4" />
              <span>
                {isSubmitting
                  ? 'Processing...'
                  : paymentMethod === 'cod'
                    ? 'PLACE ORDER'
                    : 'PAY NOW'}
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* =========================================
          DESKTOP CHECKOUT VIEW (>= 1024px / lg)
         ========================================= */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-12">
          {/* Checkout Header Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-primary/10 pb-4">
            <div className="flex items-center gap-3">
              <Link
                to="/shop"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink-muted shadow-sm transition hover:bg-rose-light hover:text-primary"
                aria-label="Back to shop"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  Checkout
                </h1>
                <p className="text-xs text-ink-muted">Complete your order securely</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Secure SSL Checkout</span>
            </div>
          </div>

          {/* Checkout Steps Progress Bar */}
          <div className="mb-8 rounded-2xl bg-white p-4 shadow-soft ring-1 ring-primary/5">
            <div className="flex items-center justify-between max-w-2xl mx-auto relative">
              {steps.map((step, idx) => (
                <div key={step.label} className="flex flex-col items-center z-10">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                      idx === 2
                        ? 'bg-primary text-white ring-4 ring-rose-light/50 scale-110'
                        : idx < 2
                          ? 'bg-primary/20 text-primary font-bold'
                          : 'bg-surface text-ink-muted border border-primary/10',
                    )}
                  >
                    {idx < 2 ? '✓' : idx + 1}
                  </div>
                  <span
                    className={cn(
                      'mt-1.5 text-[11px] font-label font-bold uppercase tracking-wider',
                      idx === 2 ? 'text-primary' : 'text-ink-muted',
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-primary/10 -z-0">
                <div className="h-full bg-primary w-2/3 transition-all duration-500" />
              </div>
            </div>
          </div>

          {/* Main 2-Column Split */}
          <div className="grid grid-cols-12 gap-10 items-start">
            {/* LEFT COLUMN: Customer info, Address, Shipping, Payment */}
            <div className="col-span-7 space-y-6">
              {/* Customer Information */}
              <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-soft">
                <h3 className="font-heading text-base font-bold text-ink mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-light text-xs text-primary font-bold">
                    1
                  </span>
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs bg-surface p-3.5 rounded-xl border border-primary/5">
                  <div>
                    <span className="text-ink-muted block">Name:</span>
                    <span className="font-bold text-ink">{user.firstName} {user.lastName}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block">Email:</span>
                    <span className="font-bold text-ink">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-ink-muted block">Phone:</span>
                    <span className="font-bold text-ink">{user.phone}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-soft">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading text-base font-bold text-ink flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-light text-xs text-primary font-bold">
                      2
                    </span>
                    Delivery Address
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setAddressToEdit(null)
                      setIsAddressModalOpen(true)
                    }}
                    className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddrId === addr.id
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddrId(addr.id)}
                        className={cn(
                          'relative cursor-pointer rounded-xl p-4 transition-all duration-200 border text-xs',
                          isSelected
                            ? 'border-primary bg-rose-light/20 shadow-soft ring-1 ring-primary/20'
                            : 'border-primary/10 bg-white hover:border-primary/40',
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="desktopDeliveryAddress"
                              checked={isSelected}
                              onChange={() => setSelectedAddrId(addr.id)}
                              className="h-4 w-4 text-primary"
                            />
                            <span className="font-bold text-ink">{addr.type}</span>
                            {addr.isDefault && (
                              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                                Default
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => {
                                setAddressToEdit(addr)
                                setIsAddressModalOpen(true)
                              }}
                              className="p-1 text-ink-muted hover:text-primary"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            {addresses.length > 1 && (
                              <button
                                type="button"
                                onClick={() => deleteAddress(addr.id)}
                                className="p-1 text-ink-muted hover:text-red-500"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="mt-2.5 space-y-0.5 text-ink-muted leading-relaxed pl-6">
                          <p className="font-semibold text-ink">{addr.name}</p>
                          <p>{addr.addressLine1}</p>
                          {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                          <p>
                            {addr.city}, {addr.state} — <strong>{addr.pincode}</strong>
                          </p>
                          <p className="pt-1 text-ink">Phone: {addr.phone}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Shipping Method */}
              <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-soft">
                <h3 className="font-heading text-base font-bold text-ink mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-light text-xs text-primary font-bold">
                    3
                  </span>
                  Shipping Method
                </h3>

                <div className="grid grid-cols-2 gap-3.5">
                  <div
                    onClick={() => setShippingMethod('standard')}
                    className={cn(
                      'cursor-pointer rounded-xl p-4 border transition-all text-xs flex items-start gap-3',
                      shippingMethod === 'standard'
                        ? 'border-primary bg-rose-light/20 shadow-soft'
                        : 'border-primary/10 bg-white hover:border-primary/30',
                    )}
                  >
                    <input
                      type="radio"
                      name="desktopShippingMethod"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="mt-0.5 h-4 w-4 text-primary"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary" />
                        <span className="font-bold text-ink">Standard Delivery</span>
                      </div>
                      <p className="mt-1 text-ink-muted">Delivery in 3 to 5 business days</p>
                      <span className="mt-1.5 inline-block font-bold text-emerald-700">
                        {subtotal >= 1999 ? 'FREE Shipping' : '₹99'}
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => setShippingMethod('express')}
                    className={cn(
                      'cursor-pointer rounded-xl p-4 border transition-all text-xs flex items-start gap-3',
                      shippingMethod === 'express'
                        ? 'border-primary bg-rose-light/20 shadow-soft'
                        : 'border-primary/10 bg-white hover:border-primary/30',
                    )}
                  >
                    <input
                      type="radio"
                      name="desktopShippingMethod"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="mt-0.5 h-4 w-4 text-primary"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-primary" />
                        <span className="font-bold text-ink">Express Delivery</span>
                      </div>
                      <p className="mt-1 text-ink-muted">Fast delivery in 1 to 2 business days</p>
                      <span className="mt-1.5 inline-block font-bold text-primary">₹99</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-soft">
                <h3 className="font-heading text-base font-bold text-ink mb-4 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-light text-xs text-primary font-bold">
                    4
                  </span>
                  Payment Method
                </h3>

                <div className="space-y-3">
                  <div
                    onClick={() => setPaymentMethod('online')}
                    className={cn(
                      'cursor-pointer rounded-xl p-4 border transition-all text-xs',
                      paymentMethod === 'online'
                        ? 'border-primary bg-rose-light/20 shadow-soft'
                        : 'border-primary/10 bg-white hover:border-primary/30',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="desktopPaymentMethod"
                          checked={paymentMethod === 'online'}
                          onChange={() => setPaymentMethod('online')}
                          className="h-4 w-4 text-primary"
                        />
                        <CreditCard className="h-5 w-5 text-primary" />
                        <div>
                          <span className="font-bold text-ink text-sm">Online Payment</span>
                          <p className="text-ink-muted">UPI, Cards, Net Banking & Wallets</p>
                        </div>
                      </div>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        Instant Confirmation
                      </span>
                    </div>
                  </div>

                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={cn(
                      'cursor-pointer rounded-xl p-4 border transition-all text-xs',
                      paymentMethod === 'cod'
                        ? 'border-primary bg-rose-light/20 shadow-soft'
                        : 'border-primary/10 bg-white hover:border-primary/30',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="desktopPaymentMethod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                          className="h-4 w-4 text-primary"
                        />
                        <Banknote className="h-5 w-5 text-emerald-700" />
                        <div>
                          <span className="font-bold text-ink text-sm">Cash on Delivery</span>
                          <p className="text-ink-muted">Pay cash when your order arrives</p>
                        </div>
                      </div>
                      <span className="rounded bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        ✓ COD Available
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary */}
            <div className="col-span-5 sticky top-24 space-y-6">
              <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-lift">
                <h3 className="font-heading text-lg font-bold text-ink mb-4 pb-3 border-b border-primary/10 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-semibold text-ink-muted">
                    {cartItems.length} Items
                  </span>
                </h3>

                <div className="space-y-3.5 max-h-[260px] overflow-y-auto pr-1">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-14 rounded-lg object-cover object-top border border-primary/10 shrink-0"
                      />
                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-semibold text-ink truncate">{item.name}</p>
                        <p className="text-ink-muted text-[11px] mt-0.5">
                          Size: <strong>{item.size || 'M'}</strong> | Qty: <strong>{item.qty}</strong>
                        </p>
                        <p className="font-bold text-primary mt-1">{formatINR(item.price * item.qty)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 border-t border-primary/10 pt-4">
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-3 h-4 w-4 text-ink-muted" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Coupon Code (e.g. JALYN10)"
                        className="w-full rounded-xl border border-primary/15 pl-9 pr-3 py-2 text-xs uppercase outline-none focus:border-primary"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white uppercase tracking-wider shadow-soft hover:bg-primary-deep"
                    >
                      Apply
                    </button>
                  </form>
                </div>

                <div className="mt-5 space-y-2 border-t border-primary/10 pt-4 text-xs">
                  <div className="flex justify-between text-ink-muted">
                    <span>Subtotal</span>
                    <span className="font-semibold text-ink">{formatINR(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Coupon Discount</span>
                      <span>-{formatINR(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-ink-muted">
                    <span>Shipping Fee</span>
                    <span className="font-semibold text-ink">
                      {shippingCost === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : formatINR(shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-ink-muted">
                    <span>Estimated Tax (5%)</span>
                    <span className="font-semibold text-ink">{formatINR(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-primary/10 pt-3 text-base font-bold text-ink">
                    <span>Total Amount</span>
                    <span className="text-primary font-display text-xl">{formatINR(grandTotal)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSubmitting || cartItems.length === 0}
                  onClick={handlePlaceOrder}
                  className={cn(
                    'mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary font-label text-xs font-bold uppercase tracking-[0.14em] text-white shadow-soft transition-all duration-300 hover:bg-primary-deep hover:shadow-lift active:scale-[0.99]',
                    isSubmitting && 'opacity-70 cursor-not-allowed',
                  )}
                >
                  <Lock className="h-4 w-4" />
                  <span>
                    {isSubmitting
                      ? 'Processing Order...'
                      : paymentMethod === 'cod'
                        ? 'PLACE ORDER (COD)'
                        : 'PROCEED TO PAYMENT'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Address Edit/Add Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        addressToEdit={addressToEdit}
        onSave={(addrData) => {
          if (addressToEdit) {
            updateAddress(addressToEdit.id, addrData)
            setToastMessage('Address updated successfully!')
          } else {
            addAddress(addrData)
            setToastMessage('New address added!')
          }
          setTimeout(() => setToastMessage(null), 3000)
        }}
      />

      {/* Mobile Address Bottom Sheet */}
      <MobileAddressSheet
        isOpen={isAddressSheetOpen}
        onClose={() => setIsAddressSheetOpen(false)}
        selectedAddrId={selectedAddrId}
        onSelectAddress={(id) => setSelectedAddrId(id)}
        onAddNewAddress={() => {
          setAddressToEdit(null)
          setIsAddressModalOpen(true)
        }}
        onEditAddress={(addr) => {
          setAddressToEdit(addr)
          setIsAddressModalOpen(true)
        }}
      />

      {/* Mobile Coupon Bottom Sheet */}
      <MobileCouponSheet
        isOpen={isCouponSheetOpen}
        onClose={() => setIsCouponSheetOpen(false)}
        subtotal={subtotal}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={(coupon) => {
          setAppliedCoupon(coupon)
          setToastMessage(`Coupon ${coupon.code} applied!`)
          setTimeout(() => setToastMessage(null), 3000)
        }}
      />
    </div>
  )
}
