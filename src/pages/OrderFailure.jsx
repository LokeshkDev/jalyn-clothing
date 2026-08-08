import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, ShoppingBag, HelpCircle, ArrowLeft } from 'lucide-react'

export default function OrderFailure() {
  const navigate = useNavigate()

  return (
    <div className="bg-surface min-h-screen py-16 px-4 sm:px-6 lg:px-12 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl border border-primary/10 bg-white p-8 sm:p-10 shadow-lift text-center"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-500 ring-4 ring-red-50">
          <AlertTriangle className="h-8 w-8" />
        </div>

        <span className="font-label text-xs font-bold uppercase tracking-wider text-red-500">
          Order Unsuccessful
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl mt-1">
          Order Could Not Be Completed
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-ink-muted leading-relaxed">
          We couldn't process your order at this time. Your cart items remain saved so you can try again anytime.
        </p>

        <div className="mt-6 rounded-2xl bg-surface p-4 border border-primary/5 text-left text-xs space-y-1.5 text-ink-muted">
          <p className="font-bold text-ink mb-1">Possible Reasons:</p>
          <p>• Payment authorization failed or was cancelled</p>
          <p>• Session timeout during checkout</p>
          <p>• Temporary bank network connectivity issue</p>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-label text-xs font-bold uppercase tracking-wider text-white shadow-soft hover:bg-primary-deep transition"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>

          <Link
            to="/shop"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white px-6 py-3 font-label text-xs font-bold uppercase tracking-wider text-primary hover:bg-rose-light/30 transition"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Return to Cart / Shop</span>
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-primary/10">
          <Link
            to="/profile/help"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-muted hover:text-primary transition"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Need Help? Contact JALYN Support</span>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
