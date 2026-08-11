import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag, Check } from 'lucide-react'
import { formatINR } from '@/lib/utils'

export default function MobileCouponSheet({
  isOpen,
  onClose,
  onApplyCoupon,
  appliedCoupon,
  subtotal,
  coupons = [],
}) {

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/35 backdrop-blur-xs"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-[91] max-h-[80vh] overflow-y-auto rounded-t-[24px] bg-white shadow-xl pb-6"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-primary/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-primary/10">
              <div>
                <h3 className="text-base font-bold text-[#222222]">Available Coupons</h3>
                <p className="text-[11px] text-[#666666]">Select a coupon to apply discounts to your order</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close coupon sheet"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FAF8F8] text-[#222222] active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Coupons List */}
            <div className="p-5 space-y-3.5">
              {coupons.map((c) => {
                const isApplied = appliedCoupon?.code === c.code
                const isEligible = subtotal >= c.minAmount

                return (
                  <div
                    key={c.code}
                    className={`rounded-2xl border p-4 text-xs space-y-2 transition ${
                      isApplied
                        ? 'border-emerald-500 bg-emerald-50/50'
                        : 'border-primary/10 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EFD7E3]/60 text-primary">
                          <Tag className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-bold text-primary text-sm tracking-wider">
                          {c.code}
                        </span>
                      </div>

                      {isApplied ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                          <Check className="h-3.5 w-3.5" />
                          Applied
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={!isEligible}
                          onClick={() => {
                            onApplyCoupon(c)
                            onClose()
                          }}
                          className={`rounded-xl px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                            isEligible
                              ? 'bg-primary text-white shadow-sm active:scale-95'
                              : 'bg-[#FAF8F8] text-[#666666]/40 cursor-not-allowed border border-[#E5D8DE]'
                          }`}
                        >
                          Apply
                        </button>
                      )}
                    </div>

                    <p className="font-semibold text-[#222222]">{c.description}</p>

                    <div className="flex items-center justify-between text-[11px] text-[#666666] border-t border-primary/5 pt-2">
                      <span className="font-bold text-primary">
                        {c.discountLabel || `${c.discount}% OFF`}
                      </span>
                      <span>
                        Min order: <strong>{formatINR(c.minAmount)}</strong>
                      </span>
                      <span>Valid till: {c.expiry}</span>
                    </div>

                    {!isEligible && (
                      <p className="text-[10px] text-amber-600 font-semibold pt-0.5">
                        Add {formatINR(c.minAmount - subtotal)} more to unlock this coupon.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
