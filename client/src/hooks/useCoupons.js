import { useState, useEffect } from 'react'
import api from '../services/api'

// Fallback presets shown only until the API responds (kept minimal),
// so the coupon UI never blocks on network failures.
const FALLBACK_COUPONS = []

export function normalizeCoupon(c) {
  if (!c) return c
  const type = c.discount_type || 'percent'
  const value = Number(c.discount_value) || 0
  const minAmount = Number(c.min_amount) || 0
  const maxDiscount =
    c.max_discount != null && c.max_discount !== '' ? Number(c.max_discount) : null
  const expiry = c.expires_at
    ? new Date(String(c.expires_at).slice(0, 10)).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'No expiry'

  return {
    id: c.id,
    code: c.code,
    title: c.title || `${type === 'flat' ? `Flat ₹${value} OFF` : `${value}% OFF`} Coupon`,
    description: c.description || 'Valid on eligible orders',
    discountType: type,
    discount: type === 'percent' ? value : value, // kept for legacy rendering
    discountValue: value,
    maxDiscount: maxDiscount,
    discountLabel: type === 'flat' ? `₹${value} OFF` : `${value}% OFF`,
    minAmount,
    minAmountLabel: `₹${minAmount.toLocaleString('en-IN')}`,
    expiry,
    expiresAt: c.expires_at || null,
    usageLimit: Number(c.usage_limit) || 0,
    usedCount: Number(c.used_count) || 0,
    isActive: c.is_active !== 0 && c.is_active !== false,
  }
}

export function useCoupons() {
  const [coupons, setCoupons] = useState(FALLBACK_COUPONS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchCoupons() {
      try {
        const res = await api.get('/coupons')
        if (isMounted && Array.isArray(res.data?.coupons)) {
          setCoupons(res.data.coupons.map(normalizeCoupon))
        }
      } catch (err) {
        console.warn('Coupons unavailable, showing none:', err.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchCoupons()

    return () => {
      isMounted = false
    }
  }, [])

  return { coupons, loading }
}

// Percentage-based discount capped by max_discount, or flat value.
export function calcCouponDiscount(coupon, subtotal) {
  if (!coupon) return 0
  const base = subtotal || 0
  if (coupon.discountType === 'flat') {
    return Math.min(coupon.discountValue, base)
  }
  const pct = Math.round((base * coupon.discountValue) / 100)
  return coupon.maxDiscount ? Math.min(pct, coupon.maxDiscount) : pct
}