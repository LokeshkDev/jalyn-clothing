import { useLocation, useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Calendar, ShoppingBag, ArrowRight, PackageCheck, ShieldCheck } from 'lucide-react'
import { useOrderStore } from '@/store'
import { formatINR } from '@/lib/utils'
import ShopProductCard from '@/components/shop/ShopProductCard'
import MobileShopProductCard from '@/components/shop/MobileShopProductCard'
import { SHOP_PRODUCTS } from '@/constants/shopProducts'

export default function OrderSuccess() {
  const location = useLocation()
  const { id: paramId, orderId: paramOrderId } = useParams()
  const orders = useOrderStore((s) => s.orders)
  const activeOrder = useOrderStore((s) => s.activeOrder)

  const targetId = paramId || paramOrderId || location.state?.orderId || activeOrder?.id || orders[0]?.id || 'JALYN10245'
  const order = orders.find((o) => o.id === targetId || o.order_number === targetId) || activeOrder || orders[0]

  const isCOD = ['cod', 'cash on delivery'].some((m) =>
    order?.paymentMethod?.toLowerCase().includes(m),
  )

  const recommendations = SHOP_PRODUCTS.slice(0, 6)

  return (
    <div className="bg-surface min-h-screen py-6 sm:py-12 px-4 sm:px-6 lg:px-12 pb-24 lg:pb-16">
      <div className="mx-auto max-w-3xl space-y-6 sm:space-y-8">
        {/* Main Success Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-primary/10 bg-white p-6 sm:p-10 shadow-lift text-center relative overflow-hidden"
        >
          {/* Decorative Glow */}
          <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-rose-light/40 blur-3xl pointer-events-none" />
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

          {/* Animated Checkmark Circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.15 }}
            className="mx-auto mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-soft text-white shadow-soft"
          >
            <Check className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={3} />
          </motion.div>

          <span className="font-label text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary">
            🎉 Confirmation Sent
          </span>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#222222] sm:text-4xl mt-1">
            Order Confirmed!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-[#666666] max-w-md mx-auto leading-relaxed">
            Thank you for shopping with JALYN. We’ve received your order and are getting it ready with care.
          </p>

          {/* Order Brief Box */}
          <div className="mt-6 rounded-2xl bg-[#FAF8F8] p-4 sm:p-6 border border-primary/10 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left text-xs">
            <div>
              <span className="text-[#666666] block text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold">
                Order Number
              </span>
              <span className="font-heading text-base sm:text-lg font-bold text-[#222222]">
                #{order.id}
              </span>
            </div>

            <div>
              <span className="text-[#666666] block text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold">
                Estimated Delivery
              </span>
              <span className="font-heading text-xs sm:text-base font-bold text-emerald-700 flex items-center gap-1 mt-0.5">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                {order.expectedDelivery}
              </span>
            </div>

            <div>
              <span className="text-[#666666] block text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold">
                Payment Method
              </span>
              <span className="font-bold text-[#222222] mt-0.5 block">{order.paymentMethod}</span>
              {isCOD && (
                <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                  Please keep {formatINR(order.total)} cash ready at delivery
                </span>
              )}
            </div>

            <div>
              <span className="text-[#666666] block text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold">
                {isCOD ? 'Amount Payable' : 'Amount Paid'}
              </span>
              <span className="font-display text-lg sm:text-xl font-bold text-primary">
                {formatINR(order.total)}
              </span>
            </div>
          </div>

          {/* Full-width Touch Actions on Mobile */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              to={`/profile/orders/${order.id}`}
              className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-primary px-6 font-label text-xs font-bold uppercase tracking-wider text-white shadow-soft active:scale-95 transition"
            >
              <PackageCheck className="h-4 w-4" />
              <span>Track Order</span>
            </Link>

            <Link
              to="/shop"
              className="flex h-12 w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-primary/20 bg-white px-6 font-label text-xs font-bold uppercase tracking-wider text-primary active:scale-95 transition"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Continue Shopping</span>
            </Link>
          </div>

          <p className="mt-5 text-[11px] text-[#666666] flex items-center justify-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Order updates sent to your registered email & mobile.</span>
          </p>
        </motion.div>

        {/* Recommended Products Carousel / Grid */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg sm:text-xl font-medium text-[#222222]">
              You May Also Like
            </h3>
            <Link
              to="/shop"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Mobile Carousel (< 768px) */}
          <div className="flex sm:hidden gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recommendations.map((product) => (
              <div key={product.id} className="w-[160px] shrink-0">
                <MobileShopProductCard product={product} />
              </div>
            ))}
          </div>

          {/* Desktop Grid (>= 768px) */}
          <div className="hidden sm:grid sm:grid-cols-4 gap-4">
            {recommendations.slice(0, 4).map((product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
