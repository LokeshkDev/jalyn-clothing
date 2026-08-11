import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Printer,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  CreditCard,
  Copy,
  Package,
} from 'lucide-react'
import { useOrderStore } from '@/store'
import { formatINR, cn } from '@/lib/utils'

export default function OrderDetails() {
  const { id } = useParams()
  const orders = useOrderStore((s) => s.orders)

  const order = useMemo(() => {
    return orders.find((o) => o.id === id) || orders[0]
  }, [orders, id])

  if (!order) {
    return (
      <div className="rounded-2xl border border-primary/10 bg-white p-12 text-center text-ink-muted">
        <h3 className="font-heading text-lg font-bold text-ink">Order Not Found</h3>
        <Link to="/profile/orders" className="mt-4 inline-block font-bold text-primary hover:underline">
          Return to My Orders
        </Link>
      </div>
    )
  }

  const handlePrintInvoice = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-primary/10 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/profile/orders"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink-muted shadow-sm transition hover:bg-rose-light hover:text-primary border border-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading text-xl font-bold text-ink">Order #{order.id}</h2>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-ink-muted">Placed on {order.date}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrintInvoice}
          className="flex items-center gap-1.5 rounded-xl border border-primary/20 bg-white px-4 py-2 text-xs font-bold text-primary shadow-sm hover:bg-rose-light/40 transition"
        >
          <Printer className="h-4 w-4" />
          <span>Download Invoice</span>
        </button>
      </div>

      {/* Interactive Order Timeline */}
      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-soft">
        <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-ink-muted mb-6">
          Order Status & Timeline
        </h4>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-6 relative">
          {order.timeline.map((step, idx) => (
            <div key={step.title} className="flex flex-col items-center text-center z-10">
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all',
                  step.completed
                    ? 'bg-primary text-white shadow-soft'
                    : 'bg-surface text-ink-muted border border-primary/10',
                )}
              >
                {step.completed ? '✓' : idx + 1}
              </div>
              <p className="mt-2 text-xs font-bold text-ink">{step.title}</p>
              <p className="mt-0.5 text-[10px] text-ink-muted">{step.time}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Courier & Shipping Info Card */}
      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-light/50 text-primary">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-ink">Shipping Partner: {order.courier}</p>
              <p className="text-xs text-ink-muted">Tracking ID: <strong>{order.trackingId}</strong></p>
            </div>
          </div>

          <div className="text-right text-xs">
            <p className="text-ink-muted">Expected Delivery</p>
            <p className="font-bold text-emerald-700 text-sm">{order.expectedDelivery}</p>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Items list & Summary cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-soft">
            <h4 className="font-heading text-sm font-bold text-ink mb-4 pb-3 border-b border-primary/10">
              Ordered Items ({order.items.length})
            </h4>

            <div className="space-y-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 border-b border-primary/5 pb-4 last:border-0 last:pb-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-20 w-16 rounded-xl object-cover object-top border border-primary/10 shrink-0"
                  />
                  <div className="flex-1 min-w-0 text-xs space-y-1">
                    <p className="font-bold text-ink text-sm">{item.name}</p>
                    <p className="text-ink-muted">
                      Size: <strong className="text-ink">{item.size || 'M'}</strong> | Color:{' '}
                      <strong className="text-ink">{item.color || 'Rose'}</strong>
                    </p>
                    <p className="text-ink-muted">
                      Qty: <strong className="text-ink">{item.qty}</strong> × {formatINR(item.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-sm">{formatINR(item.price * item.qty)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Address & Price Breakdown Side Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Delivery Address */}
          <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-soft text-xs space-y-2">
            <h4 className="font-heading font-bold text-ink flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Delivery Address</span>
            </h4>
            <p className="font-bold text-ink">{order.address?.name}</p>
            <p className="text-ink-muted">{order.address?.addressLine1}</p>
            <p className="text-ink-muted">
              {order.address?.city}, {order.address?.state} — {order.address?.pincode}
            </p>
            <p className="text-ink font-medium pt-1">Phone: {order.address?.phone}</p>
          </div>

          {/* Payment Method Info */}
          <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-soft text-xs space-y-2">
            <h4 className="font-heading font-bold text-ink flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>Payment Details</span>
            </h4>
            <p className="text-ink-muted">Method: <strong className="text-ink">{order.paymentMethod}</strong></p>
            <p className="text-ink-muted">Status: <strong className="text-emerald-700">{order.paymentStatus}</strong></p>
          </div>

          {/* Price Breakdown */}
          <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-soft text-xs space-y-2.5">
            <h4 className="font-heading font-bold text-ink pb-2 border-b border-primary/10">
              Price Breakdown
            </h4>
            <div className="flex justify-between text-ink-muted">
              <span>Subtotal</span>
              <span className="font-semibold text-ink">{formatINR(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount</span>
                <span>-{formatINR(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-ink-muted">
              <span>Shipping Fee</span>
              <span className="font-semibold text-ink">
                {order.shippingCost === 0 ? 'FREE' : formatINR(order.shippingCost)}
              </span>
            </div>
            <div className="flex justify-between text-ink-muted">
              <span>Tax (5%)</span>
              <span className="font-semibold text-ink">{formatINR(order.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-primary/10 pt-2 text-sm font-bold text-ink">
              <span>Total Paid</span>
              <span className="text-primary font-display text-base">{formatINR(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
