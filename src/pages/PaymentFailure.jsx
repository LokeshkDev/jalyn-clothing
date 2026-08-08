import { Link, useNavigate } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react'
import { useCartStore } from '@/store'
import { formatINR } from '@/lib/utils'

export default function PaymentFailure() {
  const navigate = useNavigate()
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const subtotal = getSubtotal()

  return (
    <div className="bg-surface min-h-screen py-16 px-4 sm:px-6 lg:px-12 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl border border-primary/10 bg-white p-8 sm:p-10 shadow-lift text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-600 ring-4 ring-amber-50">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <span className="font-label text-xs font-bold uppercase tracking-wider text-amber-600">
          Transaction Declined
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-1">
          Payment Failed
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
          Your payment could not be processed by your bank. Don't worry, no funds were deducted from your account.
        </p>

        <div className="mt-6 rounded-2xl bg-surface p-4 border border-primary/10 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-ink-muted">Attempted Amount:</span>
            <span className="font-bold text-ink">{formatINR(subtotal || 1899)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Transaction Ref:</span>
            <span className="font-mono text-ink">TXN_{Math.floor(10000000 + Math.random() * 90000000)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Payment Method:</span>
            <span className="font-bold text-ink">Online (UPI / Card)</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-label text-xs font-bold uppercase tracking-wider text-white shadow-soft hover:bg-primary-deep transition"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry Payment</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-6 py-3 font-label text-xs font-bold uppercase tracking-wider text-primary hover:bg-rose-light/30 transition"
          >
            <CreditCard className="h-4 w-4" />
            <span>Change Payment Method / COD</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
