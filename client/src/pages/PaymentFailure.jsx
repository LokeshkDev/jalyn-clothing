import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CreditCard, RefreshCw, ArrowLeft, ShieldAlert, AlertCircle, ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/store'
import { formatINR } from '@/lib/utils'

export default function PaymentFailure() {
  const navigate = useNavigate()
  const location = useLocation()
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const cartSubtotal = getSubtotal()

  const state = location.state || {}
  const orderNumber = state.orderNumber || `FAILED-${Math.floor(100000 + Math.random() * 900000)}`
  const amount = state.amount || cartSubtotal || 0
  const reason = state.reason || 'Payment was cancelled or could not be authorized by your bank / UPI app.'

  return (
    <div className="bg-surface min-h-screen py-16 px-4 sm:px-6 lg:px-12 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl border border-primary/10 bg-white p-8 sm:p-10 shadow-lift text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600 ring-4 ring-red-50">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <span className="font-label text-xs font-bold uppercase tracking-wider text-red-600">
          Payment Cancelled / Declined
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-1">
          Payment Not Completed
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
          Your transaction could not be completed. No money was deducted. Your cart items are saved so you can try again anytime.
        </p>

        <div className="mt-6 rounded-2xl bg-surface p-4 border border-primary/10 text-left text-xs space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-ink-muted font-medium">Reference Code:</span>
            <span className="font-mono font-bold text-ink">{orderNumber}</span>
          </div>
          {amount > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-ink-muted font-medium">Attempted Amount:</span>
              <span className="font-bold text-primary">{formatINR(amount)}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-ink-muted font-medium">Payment Channel:</span>
            <span className="font-semibold text-ink">Online Gateway (UPI / Cards / NetBanking)</span>
          </div>
          <div className="pt-2 border-t border-primary/10 flex items-start gap-2 text-[11px] text-amber-700 bg-amber-50/70 p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span><strong>Status Note:</strong> {reason}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-label text-xs font-bold uppercase tracking-wider text-white shadow-soft hover:bg-primary-deep transition cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry Payment</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-6 py-3 font-label text-xs font-bold uppercase tracking-wider text-primary hover:bg-rose-light/30 transition cursor-pointer"
          >
            <CreditCard className="h-4 w-4" />
            <span>Choose Another Method</span>
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-primary/10">
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-primary transition"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
