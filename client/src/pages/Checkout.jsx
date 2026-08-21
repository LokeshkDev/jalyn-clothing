import { useState, useEffect, useMemo } from 'react'
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
  Home,
  Briefcase,
  Building,
  Copy,
} from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'

import { useCartStore, useUserStore, useOrderStore } from '@/store'
import { useCoupons, calcCouponDiscount } from '@/hooks/useCoupons'
import { useCmsData } from '@/hooks/useCmsData'
import api from '@/services/api'
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
  const userToken = useUserStore((s) => s.token)
  const addresses = useUserStore((s) => s.addresses)
  const fetchAddresses = useUserStore((s) => s.fetchAddresses)
  const addAddress = useUserStore((s) => s.addAddress)
  const updateAddress = useUserStore((s) => s.updateAddress)
  const deleteAddress = useUserStore((s) => s.deleteAddress)
  const addOrder = useOrderStore((s) => s.addOrder)
  const { coupons: availableCoupons } = useCoupons()

  useEffect(() => {
    if (!user || !userToken) {
      navigate('/login', { state: { from: '/checkout' } })
    } else {
      fetchAddresses()
    }
  }, [user, userToken, navigate, fetchAddresses])

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

  const { codSettings, deliverySettings, taxSettings, shippingMethods } = useCmsData()
  const isCodEnabled = codSettings?.enabled ?? true
  const codFee = paymentMethod === 'cod' && isCodEnabled ? (codSettings?.cod_fee || 0) : 0

  const [addressToEdit, setAddressToEdit] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)

  // User contact phone state (mandatory for Google Sign-In users)
  const [userPhoneInput, setUserPhoneInput] = useState(user?.phone || '')
  const [isEditingUserPhone, setIsEditingUserPhone] = useState(false)

  const updateUserStore = useUserStore((s) => s.login)
  const handleSaveUserPhone = () => {
    if (!userPhoneInput || userPhoneInput.replace(/\D/g, '').length < 10) {
      setToastMessage('Please enter a valid 10-digit phone number.')
      return
    }
    const updatedUser = { ...user, phone: userPhoneInput }
    updateUserStore(updatedUser, userToken)
    setIsEditingUserPhone(false)
    setToastMessage('Phone number saved successfully!')
  }

  const subtotal = getSubtotal()

  // DYNAMIC SHIPPING CONFIGURATION FROM ADMIN CMS
  const isStandardShippingEnabled = shippingMethods?.standard?.enabled ?? true
  const isExpressShippingEnabled = shippingMethods?.express?.enabled ?? true

  const standardTitle = shippingMethods?.standard?.title || 'Standard Delivery'
  const standardSubtitle = shippingMethods?.standard?.subtitle || 'Delivery in 3 to 5 business days'
  const standardRate = shippingMethods?.standard?.price ?? 99
  const standardFreeThreshold = shippingMethods?.standard?.free_threshold ?? 1999

  const expressTitle = shippingMethods?.express?.title || 'Express Delivery'
  const expressSubtitle = shippingMethods?.express?.subtitle || 'Fast delivery in 1 to 2 business days'
  const expressRate = shippingMethods?.express?.price ?? 199

  // Auto-switch shipping method if active selected option is disabled by Admin
  useEffect(() => {
    if (shippingMethod === 'standard' && !isStandardShippingEnabled && isExpressShippingEnabled) {
      setShippingMethod('express')
    } else if (shippingMethod === 'express' && !isExpressShippingEnabled && isStandardShippingEnabled) {
      setShippingMethod('standard')
    }
  }, [isStandardShippingEnabled, isExpressShippingEnabled, shippingMethod])

  const shippingCost = useMemo(() => {
    if (shippingMethod === 'express' && isExpressShippingEnabled) {
      return expressRate
    }
    if (isStandardShippingEnabled) {
      return subtotal >= standardFreeThreshold ? 0 : standardRate
    }
    return 0
  }, [shippingMethod, isExpressShippingEnabled, isStandardShippingEnabled, expressRate, standardFreeThreshold, standardRate, subtotal])

  const discountAmount = useMemo(() => {
    return calcCouponDiscount(appliedCoupon, subtotal)
  }, [subtotal, appliedCoupon])

  // DYNAMIC TAX ESTIMATION FROM ADMIN CMS
  const isTaxEnabled = taxSettings?.enabled ?? true
  const taxPercent = taxSettings?.tax_percent ?? 18
  const taxLabel = taxSettings?.tax_label || `GST (${taxPercent}%)`

  const taxAmount = useMemo(() => {
    if (!isTaxEnabled) return 0
    const taxableAmount = Math.max(0, subtotal - discountAmount)
    return Math.round(taxableAmount * (taxPercent / 100))
  }, [isTaxEnabled, subtotal, discountAmount, taxPercent])

  const grandTotal = Math.max(0, subtotal - discountAmount + shippingCost + taxAmount + codFee)

  const selectedAddressObj = useMemo(() => {
    return addresses.find((a) => a.id === selectedAddrId) || addresses[0]
  }, [addresses, selectedAddrId])

  const effectivePhone = useMemo(() => {
    return (
      user?.phone ||
      selectedAddressObj?.phone ||
      selectedAddressObj?.mobile ||
      selectedAddressObj?.mobile_number ||
      ''
    )
  }, [user?.phone, selectedAddressObj])

  // Automatically synchronize phone to user profile if user.phone was missing
  useEffect(() => {
    if (user && !user.phone && effectivePhone && effectivePhone.replace(/\D/g, '').length >= 10) {
      const updatedUser = { ...user, phone: effectivePhone }
      updateUserStore(updatedUser, userToken)
    }
  }, [user, effectivePhone, updateUserStore, userToken])

  const handleApplyCoupon = (codeToApply) => {
    const code = (typeof codeToApply === 'string' ? codeToApply : couponCode).trim().toUpperCase()
    setCouponError('')
    const match = availableCoupons.find((c) => c.code.toUpperCase() === code)

    if (!match) {
      setCouponError('Invalid coupon code. Please check the code and try again.')
      return
    }
    if (subtotal < match.minAmount) {
      setCouponError(`Minimum order amount for ${match.code} is ${formatINR(match.minAmount)}`)
      return
    }
    setCouponCode(match.code)
    setAppliedCoupon(match)
    setToastMessage(`Coupon ${match.code} applied successfully!`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Load Cashfree JS SDK v3 dynamically and return a checkout instance.
  const loadCashfreeSdk = (mode = 'sandbox') => {
    return new Promise((resolve, reject) => {
      const createCashfreeInstance = () => {
        if (typeof window.Cashfree !== 'function') {
          reject(new Error('Cashfree SDK loaded, but checkout is unavailable.'))
          return
        }

        const cashfree = window.Cashfree({ mode })
        if (!cashfree || typeof cashfree.checkout !== 'function') {
          reject(new Error('Cashfree checkout could not be initialized.'))
          return
        }

        resolve(cashfree)
      }

      if (window.Cashfree) {
        createCashfreeInstance()
        return
      }
      const script = document.createElement('script')
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js'
      script.async = true
      script.onload = createCashfreeInstance
      script.onerror = () => reject(new Error('Failed to load Cashfree SDK'))
      document.body.appendChild(script)
    })
  }

  const handlePlaceOrder = async () => {
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

    const cleanPhone = (effectivePhone || '').replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 10) {
      setIsEditingUserPhone(true)
      setToastMessage('Please enter a valid 10-digit mobile number for order delivery & OTP updates.')
      setTimeout(() => setToastMessage(null), 3500)
      return
    }

    if (paymentMethod === 'cod' && !isCodEnabled) {
      setToastMessage('Cash on Delivery is currently disabled by store admin. Please pay online via Cashfree.')
      setPaymentMethod('online')
      setTimeout(() => setToastMessage(null), 4000)
      return
    }

    setIsSubmitting(true)

    // Option 1: Cashfree Online Payment
    if (paymentMethod === 'online') {
      try {
        const orderId = `JALYN_CF_${Date.now()}`
        const res = await api.post('/payment/cashfree/create-order', {
          order_id: orderId,
          order_amount: grandTotal,
          customer_details: {
            customer_name: selectedAddressObj.name || user?.firstName || 'Valued Customer',
            customer_email: user?.email || 'customer@jalyn.in',
            customer_phone: cleanPhone,
          },
        })

        if (res.data?.payment_session_id) {
          if (res.data?.isSimulated) {
            const newOrder = addOrder({
              customer_email: user?.email,
              address: { ...selectedAddressObj, phone: cleanPhone },
              shippingMethod,
              shippingCost,
              paymentMethod: 'Online Payment (Cashfree)',
              paymentStatus: 'paid',
              orderNotes,
              items: cartItems,
              subtotal,
              discount: discountAmount,
              tax: taxAmount,
              total: grandTotal,
            })

            await api.post('/orders', {
              order_number: newOrder.id,
              customer_name: selectedAddressObj.name || user?.firstName || 'Valued Customer',
              customer_email: user?.email || 'customer@jalyn.in',
              customer_phone: cleanPhone,
              shipping_address: `${selectedAddressObj.addressLine1 || ''}, ${selectedAddressObj.city || ''}, ${selectedAddressObj.state || ''} ${selectedAddressObj.pincode || ''}`,
              total_amount: grandTotal,
              payment_status: 'paid',
              order_status: 'Processing',
              payment_method: 'Online Payment (Cashfree Simulated)',
              items: cartItems.map((i) => ({
                product_name: i.name || i.title || 'Jalyn Product',
                price: i.price,
                quantity: i.qty || 1,
                size: i.size || 'M',
                color: i.color || 'Default',
                image_url: i.image || i.primary_image || '',
              })),
            })

            clearCart()
            setIsSubmitting(false)
            navigate(`/order-success/${newOrder.id}`)
            return
          }

          const cashfreeMode = String(res.data.environment || '').toUpperCase() === 'PRODUCTION' ? 'production' : 'sandbox'
          const cashfree = await loadCashfreeSdk(cashfreeMode)
          const checkoutOptions = {
            paymentSessionId: res.data.payment_session_id,
            redirectTarget: '_modal',
          }

          const result = await cashfree.checkout(checkoutOptions)

          if (result.error) {
            console.error('Cashfree Modal Payment error:', result.error)
            const failedOrderNum = `ORD-FAIL-${Date.now().toString().slice(-6)}`
            const failedPayload = {
              order_number: failedOrderNum,
              customer_name: selectedAddressObj.name || user?.firstName || 'Valued Customer',
              customer_email: user?.email || 'customer@jalyn.in',
              customer_phone: cleanPhone,
              shipping_address: `${selectedAddressObj.addressLine1 || ''}, ${selectedAddressObj.city || ''}, ${selectedAddressObj.state || ''} ${selectedAddressObj.pincode || ''}`,
              total_amount: grandTotal,
              discount_amount: discountAmount,
              shipping_amount: shippingCost,
              order_type: 'online',
              payment_status: 'failed',
              order_status: 'cancelled',
              payment_method: 'Online Payment (Cashfree Cancelled)',
              items: cartItems.map((i) => ({
                product_name: i.name || i.title || 'Jalyn Product',
                price: i.price,
                quantity: i.qty || 1,
                size: i.size || 'M',
                color: i.color || 'Default',
                image_url: i.image || i.primary_image || '',
              })),
            }

            try {
              await api.post('/orders', failedPayload)
            } catch (dbErr) {
              console.warn('Failed order DB sync:', dbErr)
            }

            setIsSubmitting(false)
            navigate('/payment-failure', {
              state: {
                orderNumber: failedOrderNum,
                amount: grandTotal,
                reason: result.error.message || 'Payment was cancelled in gateway or authorization was declined.',
              },
            })
            return
          }

          // Verify order status on backend
          const verifyRes = await api.post('/payment/cashfree/verify', { order_id: orderId })
          const isSuccess = verifyRes.data?.payment_status === 'SUCCESS'

          if (!isSuccess) {
            const failedOrderNum = `ORD-FAIL-${Date.now().toString().slice(-6)}`
            const failedPayload = {
              order_number: failedOrderNum,
              customer_name: selectedAddressObj.name || user?.firstName || 'Valued Customer',
              customer_email: user?.email || 'customer@jalyn.in',
              customer_phone: cleanPhone,
              shipping_address: `${selectedAddressObj.addressLine1 || ''}, ${selectedAddressObj.city || ''}, ${selectedAddressObj.state || ''} ${selectedAddressObj.pincode || ''}`,
              total_amount: grandTotal,
              discount_amount: discountAmount,
              shipping_amount: shippingCost,
              order_type: 'online',
              payment_status: 'failed',
              order_status: 'cancelled',
              payment_method: 'Online Payment (Bank Declined)',
              items: cartItems.map((i) => ({
                product_name: i.name || i.title || 'Jalyn Product',
                price: i.price,
                quantity: i.qty || 1,
                size: i.size || 'M',
                color: i.color || 'Default',
                image_url: i.image || i.primary_image || '',
              })),
            }

            try {
              await api.post('/orders', failedPayload)
            } catch (dbErr) {
              console.warn('Failed order DB sync:', dbErr)
            }

            setIsSubmitting(false)
            navigate('/payment-failure', {
              state: {
                orderNumber: failedOrderNum,
                amount: grandTotal,
                reason: verifyRes.data?.payment_message || 'Payment was declined by the bank.',
              },
            })
            return
          }

          const newOrder = addOrder({
            customer_email: user?.email,
            address: { ...selectedAddressObj, phone: cleanPhone },
            shippingMethod,
            shippingCost,
            paymentMethod: 'Online Payment (Cashfree)',
            paymentStatus: 'paid',
            orderNotes,
            items: cartItems,
            subtotal,
            discount: discountAmount,
            tax: taxAmount,
            total: grandTotal,
          })

          const orderPayload = {
            order_number: newOrder.id,
            customer_name: selectedAddressObj.name || user?.firstName || 'Valued Customer',
            customer_email: user?.email || 'customer@jalyn.in',
            customer_phone: cleanPhone,
            shipping_address: `${selectedAddressObj.addressLine1 || ''}, ${selectedAddressObj.city || ''}, ${selectedAddressObj.state || ''} ${selectedAddressObj.pincode || ''}`,
            total_amount: grandTotal,
            discount_amount: discountAmount,
            shipping_amount: shippingCost,
            order_type: 'online',
            payment_status: 'paid',
            order_status: 'processing',
            payment_method: 'Online Payment (Cashfree)',
            items: cartItems.map((i) => ({
              product_name: i.name || i.title || 'Jalyn Product',
              price: i.price,
              quantity: i.qty || 1,
              size: i.size || 'M',
              color: i.color || 'Default',
              image_url: i.image || i.primary_image || '',
            })),
          }

          try {
            await api.post('/orders', orderPayload)
          } catch (dbErr) {
            console.warn('Backend order DB sync notice:', dbErr)
          }

          clearCart()
          setIsSubmitting(false)
          navigate(`/order-success/${newOrder.id}`)
        } else {
          throw new Error(res.data?.message || 'Cashfree payment session creation failed.')
        }
      } catch (err) {
        console.error('Cashfree Checkout Error:', err)
        const failedOrderNum = `ORD-FAIL-${Date.now().toString().slice(-6)}`
        const failedPayload = {
          order_number: failedOrderNum,
          customer_name: selectedAddressObj?.name || user?.firstName || 'Valued Customer',
          customer_email: user?.email || 'customer@jalyn.in',
          customer_phone: cleanPhone,
          shipping_address: selectedAddressObj ? `${selectedAddressObj.addressLine1 || ''}, ${selectedAddressObj.city || ''}, ${selectedAddressObj.state || ''} ${selectedAddressObj.pincode || ''}` : 'Online Checkout',
          total_amount: grandTotal,
          discount_amount: discountAmount,
          shipping_amount: shippingCost,
          order_type: 'online',
          payment_status: 'failed',
          order_status: 'cancelled',
          payment_method: 'Online Payment (Error)',
          items: cartItems.map((i) => ({
            product_name: i.name || i.title || 'Jalyn Product',
            price: i.price,
            quantity: i.qty || 1,
            size: i.size || 'M',
            color: i.color || 'Default',
            image_url: i.image || i.primary_image || '',
          })),
        }

        try {
          await api.post('/orders', failedPayload)
        } catch (dbErr) {}

        setIsSubmitting(false)
        navigate('/payment-failure', {
          state: {
            orderNumber: failedOrderNum,
            amount: grandTotal,
            reason: err.response?.data?.message || err.message || 'Payment gateway connection interrupted or cancelled.',
          },
        })
      }
    } else {
      // Option 2: Cash on Delivery (COD)
      const newOrder = addOrder({
        customer_email: user?.email,
        address: { ...selectedAddressObj, phone: cleanPhone },
        shippingMethod,
        shippingCost,
        paymentMethod: 'Cash on Delivery (COD)',
        paymentStatus: 'pending',
        orderNotes,
        items: cartItems,
        subtotal,
        discount: discountAmount,
        tax: taxAmount,
        total: grandTotal,
      })

      const orderPayload = {
        order_number: newOrder.id,
        customer_name: selectedAddressObj.name || user?.firstName || 'Valued Customer',
        customer_email: user?.email || 'customer@jalyn.in',
        customer_phone: cleanPhone,
        shipping_address: `${selectedAddressObj.addressLine1 || ''}, ${selectedAddressObj.city || ''}, ${selectedAddressObj.state || ''} ${selectedAddressObj.pincode || ''}`,
        total_amount: grandTotal,
        payment_status: 'pending',
        order_status: 'Processing',
        payment_method: 'Cash on Delivery (COD)',
        items: cartItems.map((i) => ({
          product_name: i.name || i.title || 'Jalyn Product',
          price: i.price,
          quantity: i.qty || 1,
          size: i.size || 'M',
          color: i.color || 'Default',
          image_url: i.image || i.primary_image || '',
        })),
      }

      try {
        await api.post('/orders', orderPayload)
      } catch (dbErr) {
        console.warn('Backend COD order DB sync notice:', dbErr)
      }

      clearCart()
      setIsSubmitting(false)
      navigate(`/order-success/${newOrder.id}`)
    }
  }

  const getAddressIcon = (type) => {
    const lower = type?.toLowerCase() || ''
    if (lower.includes('home')) return Home
    if (lower.includes('office') || lower.includes('work')) return Briefcase
    return MapPin
  }

  return (
    <div className="min-h-screen bg-[#FAF6F8]">
      {/* Global Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-ink/90 px-4 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur-md flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================
          MOBILE CHECKOUT VIEW (< 1024px / lg)
         ========================================= */}
      <div className="block lg:hidden pb-[80px]">
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

        <div className="p-4 space-y-4">
          {/* 1. Combined Contact & Delivery Address Card */}
          <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-[13px] font-bold text-[#222222] flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                <span>1. Contact &amp; Shipping Address</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressSheetOpen(true)}
                className="text-[12px] font-bold text-primary active:scale-95"
              >
                Change
              </button>
            </div>

            {/* Customer Contact Snippet */}
            {user ? (
              <div className="p-2.5 bg-rose-light/20 rounded-xl text-xs flex justify-between items-center text-ink border border-primary/10">
                <div>
                  <p className="font-bold">{user.firstName || user.name || selectedAddressObj?.name || 'Valued Customer'} {user.lastName || ''}</p>
                  <p className="text-[11px] text-ink-muted">{user.email} {effectivePhone ? `· 📞 ${effectivePhone}` : ''}</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl text-xs flex items-center justify-between border border-amber-200">
                <div>
                  <p className="font-bold text-amber-900">Already have an account?</p>
                  <p className="text-[11px] text-amber-700">Sign in for saved addresses & fast checkout</p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/login', { state: { from: '/checkout' } })}
                  className="rounded-lg bg-amber-800 px-3 py-1 text-[11px] font-bold text-white shadow-xs cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}

            {selectedAddressObj ? (
              <div className="rounded-xl bg-[#FAF8F8] p-3 text-[12px] space-y-1 border border-primary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const Icon = getAddressIcon(selectedAddressObj.type)
                      return <Icon className="h-3.5 w-3.5 text-primary" />
                    })()}
                    <span className="font-bold text-[#222222]">{selectedAddressObj.type || 'Home'} Address</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAddressToEdit(selectedAddressObj)
                        setIsAddressModalOpen(true)
                      }}
                      className="p-1 text-ink-muted hover:text-primary"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {addresses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteAddress(selectedAddressObj.id)}
                        className="p-1 text-ink-muted hover:text-red-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-[#666666]">{selectedAddressObj.addressLine1}</p>
                <p className="text-[#666666]">
                  {selectedAddressObj.city}, {selectedAddressObj.state} — <strong>{selectedAddressObj.pincode}</strong>
                </p>
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

          {/* 2. Shipping Method (Standard & Express, same as desktop) */}
          {(isStandardShippingEnabled || isExpressShippingEnabled) && (
            <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm space-y-2.5">
              <h3 className="text-[13px] font-bold text-[#222222] flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-primary" />
                <span>2. Shipping Method</span>
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                {isStandardShippingEnabled && (
                  <div
                    onClick={() => setShippingMethod('standard')}
                    className={cn(
                      'flex items-start gap-3 rounded-xl p-3 border transition-all text-[12px] cursor-pointer',
                      shippingMethod === 'standard'
                        ? 'border-primary bg-[#EFD7E3]/20 shadow-xs'
                        : 'border-[#E5D8DE] bg-white',
                    )}
                  >
                    <input
                      type="radio"
                      name="mobileShipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="mt-0.5 h-4 w-4 text-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#222222]">{standardTitle}</span>
                        <span className="font-bold text-emerald-700">
                          {subtotal >= standardFreeThreshold ? 'FREE' : formatINR(standardRate)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666666]">{standardSubtitle}</p>
                    </div>
                  </div>
                )}

                {isExpressShippingEnabled && (
                  <div
                    onClick={() => setShippingMethod('express')}
                    className={cn(
                      'flex items-start gap-3 rounded-xl p-3 border transition-all text-[12px] cursor-pointer',
                      shippingMethod === 'express'
                        ? 'border-primary bg-[#EFD7E3]/20 shadow-xs'
                        : 'border-[#E5D8DE] bg-white',
                    )}
                  >
                    <input
                      type="radio"
                      name="mobileShipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="mt-0.5 h-4 w-4 text-primary"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-[#222222]">{expressTitle}</span>
                        <span className="font-bold text-primary">{formatINR(expressRate)}</span>
                      </div>
                      <p className="text-[11px] text-[#666666]">{expressSubtitle}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. Mobile Payment Method (2 Options Only: Cashfree & COD) */}
          <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm space-y-2.5">
            <h3 className="text-[13px] font-bold text-[#222222]">3. Payment Method</h3>

            <div className="space-y-2.5">
              {/* Cashfree Online Payment */}
              <div
                onClick={() => setPaymentMethod('online')}
                className={cn(
                  'flex items-center justify-between rounded-xl p-3 border transition-all text-[12px] cursor-pointer',
                  paymentMethod === 'online'
                    ? 'border-primary bg-[#EFD7E3]/20 shadow-xs'
                    : 'border-[#E5D8DE] bg-white',
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="mobilePayment"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                    className="h-4 w-4 text-primary"
                  />
                  <div>
                    <span className="font-bold text-[#222222] block">Online Payment (Cashfree)</span>
                    <span className="text-[10px] text-[#666666]">Cards, UPI (GPay, PhonePe), Netbanking</span>
                  </div>
                </div>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                  Secured
                </span>
              </div>

              {/* Cash on Delivery (COD) */}
              <div
                onClick={() => isCodEnabled && setPaymentMethod('cod')}
                className={cn(
                  'flex items-center justify-between rounded-xl p-3 border transition-all text-[12px]',
                  !isCodEnabled
                    ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                    : paymentMethod === 'cod'
                      ? 'border-primary bg-[#EFD7E3]/20 shadow-xs cursor-pointer'
                      : 'border-[#E5D8DE] bg-white cursor-pointer',
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="mobilePayment"
                    disabled={!isCodEnabled}
                    checked={paymentMethod === 'cod' && isCodEnabled}
                    onChange={() => isCodEnabled && setPaymentMethod('cod')}
                    className="h-4 w-4 text-primary"
                  />
                  <div>
                    <span className="font-bold text-[#222222] block">Cash on Delivery (COD)</span>
                    <span className="text-[10px] text-[#666666]">
                      {isCodEnabled ? 'Pay cash on delivery' : 'Disabled by store admin'}
                    </span>
                  </div>
                </div>
                {isCodEnabled ? (
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700 border border-emerald-200">
                    ✓ Available
                  </span>
                ) : (
                  <span className="rounded bg-red-100 px-2 py-0.5 text-[9px] font-bold text-red-700 border border-red-200">
                    ✕ Disabled
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ticket-Style Coupon Carousel on Mobile (MANUAL DRAG/SWIPE ONLY, NO AUTOPLAY) */}
          {availableCoupons.length > 0 && (
            <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-bold text-[#222222] flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-red-500" />
                  <span>Available Offers &amp; Coupons (Swipe)</span>
                </h3>
              </div>

              <Swiper
                grabCursor={true}
                simulateTouch={true}
                spaceBetween={12}
                slidesPerView={1.15}
                className="py-1"
              >
                {availableCoupons.map((cp) => (
                  <SwiperSlide key={cp.code}>
                    <div className="relative overflow-hidden rounded-xl border border-red-200 bg-red-50/40 p-3 text-xs shadow-xs flex flex-col justify-between h-full">
                      {/* Perforated Side Notches */}
                      <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white border-r border-red-200" />
                      <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white border-l border-red-200" />

                      <div>
                        <div className="flex items-center gap-1.5 text-red-600 font-bold text-[11px]">
                          <Tag className="h-3.5 w-3.5 fill-red-500 text-red-500 shrink-0" />
                          <span>Get <span className="text-red-700 font-extrabold">{cp.code}: {cp.discountLabel} OFF</span></span>
                        </div>
                        <p className="mt-1 text-[10px] text-gray-600 line-clamp-1">{cp.description}</p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-dashed border-red-200 flex items-center justify-between">
                        <span className="rounded bg-red-100 px-2 py-0.5 font-mono text-[10px] font-bold text-red-700 flex items-center gap-1">
                          {cp.code} <Copy className="h-2.5 w-2.5" />
                        </span>
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon(cp.code)}
                          className="rounded-lg bg-red-600 px-3 py-1 text-[10px] font-bold uppercase text-white hover:bg-red-700 transition"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {/* Price Summary Breakdown Card */}
          <div className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm space-y-2 text-xs">
            <div className="flex justify-between text-[#666666]">
              <span>Subtotal</span>
              <span className="font-semibold text-[#222222]">{formatINR(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Coupon Discount ({appliedCoupon?.code})</span>
                <span>-{formatINR(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#666666]">
              <span>Shipping Fee</span>
              <span className="font-semibold text-[#222222]">
                {shippingCost === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : formatINR(shippingCost)}
              </span>
            </div>
            <div className="flex justify-between text-[#666666]">
              <span>Estimated Tax (5%)</span>
              <span className="font-semibold text-[#222222]">{formatINR(taxAmount)}</span>
            </div>
            {paymentMethod === 'cod' && codFee > 0 && (
              <div className="flex justify-between text-[#666666]">
                <span>COD Handling Fee</span>
                <span className="font-semibold text-[#222222]">{formatINR(codFee)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-primary/10 pt-2 text-[14px] font-bold text-[#222222]">
              <span>Total Amount</span>
              <span className="text-primary font-display text-[16px]">{formatINR(grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Fixed Mobile Bottom Checkout Bar (Connected without white space gap) */}
        <div
          className="fixed inset-x-0 z-40 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-primary/10 lg:hidden"
          style={{
            bottom: '0px',
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
              className="flex h-12 flex-1 max-w-[220px] items-center justify-center gap-2 rounded-xl bg-primary text-[12px] font-bold uppercase tracking-wider text-white shadow-soft active:bg-primary-deep cursor-pointer"
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

          {/* Main 2-Column Split */}
          <div className="grid grid-cols-12 gap-10 items-start">
            {/* LEFT COLUMN: Combined Customer Info & Address, Shipping, Payment */}
            <div className="col-span-7 space-y-6">

              {/* 1. Combined Customer Information & Shipping Address */}
              <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-soft space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-primary/10">
                  <h3 className="font-heading text-base font-bold text-ink flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5 text-primary" />
                    <span>Customer &amp; Shipping Address</span>
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

                {/* Customer Contact Snippet & Mandatory Phone Prompt */}
                {user ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-3 text-xs bg-rose-light/20 p-3 rounded-xl border border-primary/10">
                      <div>
                        <span className="text-ink-muted text-[11px] block">Name</span>
                        <span className="font-bold text-ink">{user.name || selectedAddressObj?.name || 'Valued Customer'}</span>
                      </div>
                      <div>
                        <span className="text-ink-muted text-[11px] block">Email</span>
                        <span className="font-bold text-ink truncate block">{user.email}</span>
                      </div>
                      <div>
                        <span className="text-ink-muted text-[11px] block">Phone</span>
                        <span className="font-bold text-ink">
                          {effectivePhone ? (
                            <span className="text-emerald-700 font-bold">📞 {effectivePhone}</span>
                          ) : (
                            <span className="text-amber-600 font-bold">⚠️ Phone Missing</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {(!effectivePhone || isEditingUserPhone) && (
                      <div className="p-3 bg-amber-50 rounded-xl text-xs space-y-2 border border-amber-200">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-amber-900 flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                            <span>Mandatory Contact Phone Number</span>
                          </p>
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded uppercase">
                            Required
                          </span>
                        </div>
                        <p className="text-[11px] text-amber-800">
                          Please enter your 10-digit mobile number for order delivery &amp; OTP updates:
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="tel"
                            maxLength={10}
                            value={userPhoneInput}
                            onChange={(e) => setUserPhoneInput(e.target.value.replace(/\D/g, ''))}
                            placeholder="Enter 10-digit Phone Number"
                            className="flex-1 rounded-lg border border-amber-300 bg-white px-3 py-1.5 font-mono text-xs font-bold outline-none focus:border-amber-600"
                          />
                          <button
                            type="button"
                            onClick={handleSaveUserPhone}
                            className="rounded-lg bg-primary px-4 py-1.5 font-bold text-white text-xs hover:bg-primary-deep transition cursor-pointer"
                          >
                            Save Phone
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl text-xs flex items-center justify-between border border-amber-200">
                    <div>
                      <p className="font-bold text-amber-900">Already have an account?</p>
                      <p className="text-[11px] text-amber-700">Sign in to use your saved addresses &amp; enjoy 1-click checkout</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/login', { state: { from: '/checkout' } })}
                      className="rounded-xl bg-[#2C1C24] px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer hover:bg-[#3D2832] transition"
                    >
                      Sign In to Account
                    </button>
                  </div>
                )}

                {/* Saved Address Cards Grid with Badges & Edit/Delete Controls */}
                <div className="grid grid-cols-2 gap-3.5">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddrId === addr.id
                    const AddrIcon = getAddressIcon(addr.type)
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddrId(addr.id)}
                        className={cn(
                          'relative cursor-pointer rounded-xl p-4 transition-all duration-200 border text-xs flex flex-col justify-between',
                          isSelected
                            ? 'border-primary bg-rose-light/20 shadow-soft ring-1 ring-primary/20'
                            : 'border-primary/10 bg-white hover:border-primary/40',
                        )}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="desktopDeliveryAddress"
                                checked={isSelected}
                                onChange={() => setSelectedAddrId(addr.id)}
                                className="h-4 w-4 text-primary"
                              />
                              <span className="font-bold text-ink flex items-center gap-1">
                                <AddrIcon className="h-3.5 w-3.5 text-primary" />
                                {addr.type || 'Home'}
                              </span>
                              {addr.isDefault && (
                                <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                                  Default
                                </span>
                              )}
                            </div>

                            {/* Inline Edit / Delete Action Icons */}
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                title="Edit address"
                                onClick={() => {
                                  setAddressToEdit(addr)
                                  setIsAddressModalOpen(true)
                                }}
                                className="p-1 text-ink-muted hover:text-primary transition"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              {addresses.length > 1 && (
                                <button
                                  type="button"
                                  title="Delete address"
                                  onClick={() => deleteAddress(addr.id)}
                                  className="p-1 text-ink-muted hover:text-red-500 transition"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="space-y-0.5 text-ink-muted leading-relaxed pl-6">
                            <p className="font-semibold text-ink">{addr.name}</p>
                            <p>{addr.addressLine1}</p>
                            {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                            <p>
                              {addr.city}, {addr.state} — <strong>{addr.pincode}</strong>
                            </p>
                            {(addr.phone || addr.mobile || addr.mobile_number) && (
                              <p className="text-[11px] font-medium text-emerald-800 pt-0.5">
                                📞 Phone: {addr.phone || addr.mobile || addr.mobile_number}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Shipping Method (Shown ONLY if at least one shipping method is enabled in Admin CMS) */}
              {(isStandardShippingEnabled || isExpressShippingEnabled) && (
                <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-soft">
                  <h3 className="font-heading text-base font-bold text-ink mb-4 flex items-center gap-2">
                    <Truck className="h-4.5 w-4.5 text-primary" />
                    <span>Shipping Method</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {isStandardShippingEnabled && (
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
                            <span className="font-bold text-ink">{standardTitle}</span>
                          </div>
                          <p className="mt-1 text-ink-muted">{standardSubtitle}</p>
                          <span className="mt-1.5 inline-block font-bold text-emerald-700">
                            {subtotal >= standardFreeThreshold ? 'FREE Shipping' : formatINR(standardRate)}
                          </span>
                        </div>
                      </div>
                    )}

                    {isExpressShippingEnabled && (
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
                            <span className="font-bold text-ink">{expressTitle}</span>
                          </div>
                          <p className="mt-1 text-ink-muted">{expressSubtitle}</p>
                          <span className="mt-1.5 inline-block font-bold text-primary">{formatINR(expressRate)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Method (2 Options Only: Cashfree & COD) */}
              <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-soft">
                <h3 className="font-heading text-base font-bold text-ink mb-4 flex items-center gap-2">
                  <CreditCard className="h-4.5 w-4.5 text-primary" />
                  <span>Payment Method</span>
                </h3>

                <div className="space-y-3">
                  {/* Option 1: Cashfree Online Payment */}
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
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-ink text-sm">Online Payment (Cashfree)</span>
                            <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-800">
                              Cards / UPI / Netbanking
                            </span>
                          </div>
                          <p className="text-ink-muted mt-0.5">Pay securely via Cashfree Gateway (Google Pay, PhonePe, Paytm, Cards)</p>
                        </div>
                      </div>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        Cashfree Secured
                      </span>
                    </div>
                  </div>

                  {/* Option 2: Cash on Delivery (COD) */}
                  <div
                    onClick={() => {
                      if (isCodEnabled) {
                        setPaymentMethod('cod')
                      }
                    }}
                    className={cn(
                      'rounded-xl p-4 border transition-all text-xs',
                      !isCodEnabled
                        ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                        : paymentMethod === 'cod'
                          ? 'border-primary bg-rose-light/20 shadow-soft cursor-pointer'
                          : 'border-primary/10 bg-white hover:border-primary/30 cursor-pointer',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="desktopPaymentMethod"
                          disabled={!isCodEnabled}
                          checked={paymentMethod === 'cod' && isCodEnabled}
                          onChange={() => isCodEnabled && setPaymentMethod('cod')}
                          className="h-4 w-4 text-primary"
                        />
                        <Banknote className={`h-5 w-5 ${isCodEnabled ? 'text-emerald-700' : 'text-gray-400'}`} />
                        <div>
                          <span className="font-bold text-ink text-sm">Cash on Delivery (COD)</span>
                          <p className="text-ink-muted">
                            {isCodEnabled
                              ? (codSettings?.notice || 'Pay cash when your order arrives at your doorstep')
                              : 'Cash on Delivery is currently disabled by store admin.'}
                          </p>
                          {codFee > 0 && isCodEnabled && (
                            <span className="text-[11px] font-semibold text-amber-700 mt-0.5 block">
                              + {formatINR(codFee)} COD Handling Fee
                            </span>
                          )}
                        </div>
                      </div>
                      {isCodEnabled ? (
                        <span className="rounded bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          ✓ COD Available
                        </span>
                      ) : (
                        <span className="rounded bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-700 border border-red-200">
                          ✕ Disabled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Order Summary & Ticket-Style Coupon Swiper Carousel (MANUAL DRAG/SWIPE ONLY) */}
            <div className="col-span-5 sticky top-24 space-y-6">
              <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-lift space-y-5">
                <h3 className="font-heading text-lg font-bold text-ink pb-3 border-b border-primary/10 flex items-center justify-between">
                  <span>Order Summary</span>
                  <span className="text-xs font-semibold text-ink-muted">
                    {cartItems.length} Items
                  </span>
                </h3>

                {/* Items List */}
                <div className="space-y-3.5 max-h-[240px] overflow-y-auto pr-1 theme-scrollbar">
                  {cartItems.map((item, idx) => {
                    const title = item.name || item.title || 'Jalyn Essential Item'
                    const img =
                      item.image ||
                      item.primary_image ||
                      item.images?.primary ||
                      '/images/products/floral-midi-dress.webp'

                    return (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50/60 rounded-xl border border-gray-100">
                        <img
                          src={img}
                          alt={title}
                          loading="lazy"
                          decoding="async"
                          width="56"
                          height="64"
                          className="h-16 w-14 rounded-lg object-cover object-top border border-primary/10 shrink-0 bg-rose-light/20"
                          onError={(e) => {
                            e.currentTarget.src = '/images/products/floral-midi-dress.webp'
                          }}
                        />
                        <div className="flex-1 min-w-0 text-xs">
                          <p className="font-semibold text-ink truncate">{title}</p>
                          <p className="text-ink-muted text-[11px] mt-0.5">
                            Size: <strong>{item.size || 'M'}</strong> | Qty: <strong>{item.qty}</strong>
                          </p>
                          <p className="font-bold text-primary mt-1">{formatINR(item.price * item.qty)}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Coupon Code Input */}
                <div className="pt-2">
                  <form onSubmit={(e) => { e.preventDefault(); handleApplyCoupon(); }} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-3 h-4 w-4 text-ink-muted" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="w-full rounded-xl border border-primary/15 pl-9 pr-3 py-2 text-xs uppercase outline-none focus:border-primary"
                      />
                    </div>
                    <button
                      type="submit"
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white uppercase tracking-wider shadow-soft hover:bg-primary-deep transition"
                    >
                      Apply
                    </button>
                  </form>
                  {couponError && (
                    <p className="mt-1.5 text-[11px] text-red-500 font-medium">{couponError}</p>
                  )}
                </div>

                {/* Ticket-Style Coupon Swiper Carousel (MANUAL DRAG/SWIPE ONLY) */}
                {availableCoupons.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-ink">
                      <span className="flex items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 text-red-500" />
                        Available Offers &amp; Coupons (Swipe)
                      </span>
                    </div>

                    <Swiper
                      grabCursor={true}
                      simulateTouch={true}
                      spaceBetween={10}
                      slidesPerView={1.2}
                      className="py-1"
                    >
                      {availableCoupons.map((cp) => (
                        <SwiperSlide key={cp.code}>
                          <div className="relative overflow-hidden rounded-xl border border-red-200 bg-red-50/40 p-3 text-xs shadow-xs flex flex-col justify-between h-[105px]">
                            {/* Perforated Side Notches */}
                            <div className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white border-r border-red-200" />
                            <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-white border-l border-red-200" />

                            <div>
                              <div className="flex items-center gap-1.5 text-red-600 font-bold text-[11px]">
                                <Tag className="h-3.5 w-3.5 fill-red-500 text-red-500 shrink-0" />
                                <span>Get <span className="text-red-700 font-extrabold">{cp.code}: {cp.discountLabel} off</span></span>
                              </div>
                              <p className="mt-1 text-[10px] text-gray-600 line-clamp-1">{cp.description}</p>
                            </div>

                            <div className="pt-1.5 border-t border-dashed border-red-200 flex items-center justify-between">
                              <span className="rounded bg-red-100 px-2 py-0.5 font-mono text-[10px] font-bold text-red-700 flex items-center gap-1">
                                {cp.code} <Copy className="h-2.5 w-2.5" />
                              </span>
                              <button
                                type="button"
                                onClick={() => handleApplyCoupon(cp.code)}
                                className="rounded-lg bg-red-600 px-3 py-1 text-[10px] font-bold uppercase text-white hover:bg-red-700 transition cursor-pointer"
                              >
                                Apply
                              </button>
                            </div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-2 border-t border-primary/10 pt-4 text-xs">
                  <div className="flex justify-between text-ink-muted">
                    <span>Subtotal</span>
                    <span className="font-semibold text-ink">{formatINR(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Coupon Discount ({appliedCoupon?.code})</span>
                      <span>-{formatINR(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-ink-muted">
                    <span>Shipping Fee</span>
                    <span className="font-semibold text-ink">
                      {shippingCost === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : formatINR(shippingCost)}
                    </span>
                  </div>
                  {isTaxEnabled && (
                    <div className="flex justify-between text-ink-muted">
                      <span>{taxLabel}</span>
                      <span className="font-semibold text-ink">{formatINR(taxAmount)}</span>
                    </div>
                  )}
                  {paymentMethod === 'cod' && codFee > 0 && (
                    <div className="flex justify-between text-ink-muted">
                      <span>COD Handling Fee</span>
                      <span className="font-semibold text-ink">{formatINR(codFee)}</span>
                    </div>
                  )}
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
                    'flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary font-label text-xs font-bold uppercase tracking-[0.14em] text-white shadow-soft transition-all duration-300 hover:bg-primary-deep hover:shadow-lift active:scale-[0.99] cursor-pointer',
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
        coupons={availableCoupons}
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
