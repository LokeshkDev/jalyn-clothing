import { useMemo, useState, useEffect } from 'react'
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
  AlertCircle,
} from 'lucide-react'
import { useOrderStore } from '@/store'
import { formatINR, cn } from '@/lib/utils'
import api from '@/services/api'
import logo from '@/assets/jalyn-logo.png'

export default function OrderDetails() {
  const { id } = useParams()
  const [dbOrder, setDbOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`)
        if (res.data?.success) {
          setDbOrder(res.data.order)
        }
      } catch (err) {
        console.warn('Failed to fetch latest order status:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id])

  const storeOrders = useOrderStore((s) => s.orders)

  const order = useMemo(() => {
    const storeOrder = storeOrders.find((o) => o.id === id || o.order_number === id)
    const baseOrder = dbOrder || storeOrder;
    if (!baseOrder) return null;
    
    const rawItems = dbOrder?.items || storeOrder?.items || [];
    const normalizedItems = rawItems.map((it) => ({
      name: it.product_name || it.name || 'Jalyn Product',
      price: Number(it.price) || 0,
      qty: Number(it.quantity || it.qty || 1),
      size: it.size || 'M',
      color: it.color || 'Default',
      image: it.image_url || it.image || '',
    }));

    return {
      ...storeOrder,
      ...dbOrder,
      items: normalizedItems,
      status: dbOrder?.order_status || dbOrder?.status || storeOrder?.status || 'Processing',
      paymentStatus: dbOrder?.payment_status || dbOrder?.paymentStatus || storeOrder?.paymentStatus || 'pending',
      courier: dbOrder?.courier || storeOrder?.courier || 'BlueDart Express',
      trackingId: dbOrder?.tracking_id || dbOrder?.trackingId || storeOrder?.trackingId || 'Pending',
      expectedDelivery: dbOrder?.expected_delivery || dbOrder?.expectedDelivery || storeOrder?.expectedDelivery || '3 to 5 business days',
    }
  }, [storeOrders, dbOrder, id])

  const timelineSteps = useMemo(() => {
    if (!order) return []
    const status = (order.status || 'pending').toLowerCase()
    const dateStr = order.date || (order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }))

    if (status === 'cancelled') {
      return [
        { title: 'Order Placed', time: dateStr, completed: true },
        { title: 'Cancelled', time: 'Cancelled by customer/system', completed: true, isError: true },
      ]
    }

    if (status === 'failed') {
      return [
        { title: 'Order Placed', time: dateStr, completed: true },
        { title: 'Payment Failed', time: 'Transaction unauthorized', completed: true, isError: true },
      ]
    }

    const isConfirmed = ['processing', 'shipped', 'delivered', 'confirmed'].includes(status)
    const isShipped = ['shipped', 'delivered'].includes(status)
    const isDelivered = status === 'delivered'

    return [
      { title: 'Order Placed', time: dateStr, completed: true },
      { title: 'Confirmed', time: isConfirmed ? 'Confirmed' : 'Pending', completed: isConfirmed },
      { title: 'Quality Inspection', time: isConfirmed ? 'Completed' : 'Pending', completed: isConfirmed },
      { title: 'Shipped', time: isShipped ? 'In Transit' : 'Pending', completed: isShipped },
      { title: 'Delivered', time: isDelivered ? 'Delivered' : 'Expected 3-5 days', completed: isDelivered },
    ]
  }, [order])

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'processing':
      case 'confirmed':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'cancelled':
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  if (loading && !order) {
    return (
      <div className="rounded-2xl border border-primary/10 bg-white p-12 text-center text-ink-muted animate-pulse space-y-4">
        <div className="h-4 w-1/4 bg-rose-light/50 mx-auto rounded" />
        <div className="h-8 w-2/4 bg-rose-light mx-auto rounded" />
      </div>
    )
  }

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
    <>
      {/* Normal View Container (hidden when printing) */}
      <div className="space-y-6 print:hidden">
        {/* Failed / Pending Payment Banner */}
        {(order.status?.toLowerCase() === 'failed' || order.paymentStatus?.toLowerCase() === 'failed') && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800 text-xs flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-red-900">Payment Failed</p>
              <p className="text-red-700">The online payment transaction for this order failed or was cancelled. Sourcing is on hold. Please check your bank or contact support.</p>
            </div>
          </div>
        )}

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
                <h2 className="font-heading text-xl font-bold text-ink">Order #{order.order_number || order.id}</h2>
                <span className={cn("rounded-full border px-2.5 py-0.5 text-[10px] font-bold", getStatusBadge(order.status))}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-ink-muted">Placed on {order.date || (order.created_at ? new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '')}</p>
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

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 relative">
            {timelineSteps.map((step, idx) => (
              <div key={step.title} className="flex flex-col items-center text-center z-10">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all',
                    step.isError
                      ? 'bg-red-500 text-white shadow-soft'
                      : step.completed
                        ? 'bg-primary text-white shadow-soft'
                        : 'bg-surface text-ink-muted border border-primary/10',
                  )}
                >
                  {step.isError ? '✕' : step.completed ? '✓' : idx + 1}
                </div>
                <p className="mt-2 text-xs font-bold text-ink">{step.title}</p>
                <p className="mt-0.5 text-[10px] text-ink-muted">{step.time}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Courier & Shipping Info Card - Only show when status is Shipped or Delivered */}
        {['shipped', 'delivered'].includes((order.status || '').toLowerCase()) && (
          <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-light/50 text-primary">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">
                    Shipping Partner: {order.courier || 'BlueDart Express'}
                  </p>
                  <p className="text-xs text-ink-muted">
                    Tracking ID: <strong>{order.trackingId || 'Pending'}</strong>
                  </p>
                </div>
              </div>

              <div className="text-right text-xs">
                <p className="text-ink-muted">Expected Delivery</p>
                <p className="font-bold text-emerald-700 text-sm">
                  {order.status?.toLowerCase() === 'delivered' ? 'Delivered successfully' : (order.expectedDelivery || '3 to 5 business days')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 1. Ordered Items - Full Width */}
        <div className="w-full">
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

        {/* 2. Address, Payment & Price Breakdown - 3 Columns Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Delivery Address */}
          <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-soft text-xs space-y-2">
            <h4 className="font-heading font-bold text-ink flex items-center gap-1.5 pb-2 border-b border-primary/5">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Delivery Address</span>
            </h4>
            <p className="font-bold text-ink mt-2">{order.address?.name || order.customer_name}</p>
            <p className="text-ink-muted">{order.address?.addressLine1 || order.shipping_address}</p>
            <p className="text-ink-muted">
              {order.address?.city || ''}, {order.address?.state || ''} — {order.address?.pincode || ''}
            </p>
            <p className="text-ink font-medium pt-1">Phone: {order.address?.phone || order.customer_phone}</p>
          </div>

          {/* Payment Method Info */}
          <div className="rounded-2xl border border-primary/10 bg-white p-5 shadow-soft text-xs space-y-2">
            <h4 className="font-heading font-bold text-ink flex items-center gap-1.5 pb-2 border-b border-primary/5">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>Payment Details</span>
            </h4>
            <p className="text-ink-muted mt-2">Method: <strong className="text-ink">{order.paymentMethod || 'Online Payment'}</strong></p>
            <p className="text-ink-muted">Status: <strong className="text-emerald-700 font-bold uppercase">{order.paymentStatus}</strong></p>
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
              <span className="text-primary font-display text-base font-bold">{formatINR(order.total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Invoice Container (only visible when printing) */}
      <div className="hidden print:block bg-white p-8 text-black text-xs font-sans space-y-6">
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-gray-300 pb-6">
          <div>
            <img src={logo} alt="Jalyn Logo" className="h-10 object-contain mb-2" />
            <p className="font-bold text-lg text-[#AD4A85] font-display">JALYN</p>
            <p className="text-gray-500">Style Meets Comfort</p>
            <p className="text-gray-500">support@jalyn.in | www.jalyn.in</p>
          </div>
          <div className="text-right space-y-1">
            <h1 className="text-2xl font-bold text-gray-800 tracking-wider">INVOICE</h1>
            <p className="text-gray-600">Invoice No: <strong className="text-black">INV-{(order.order_number || order.id).replace('JALYN', '').replace('_CF_', '')}</strong></p>
            <p className="text-gray-600">Date: <strong className="text-black">{order.date || new Date().toLocaleDateString('en-GB')}</strong></p>
            <p className="text-gray-600">Order ID: <strong className="text-black">#{order.order_number || order.id}</strong></p>
          </div>
        </div>

        {/* Billing Setup */}
        <div className="grid grid-cols-2 gap-8 py-4 border-b border-gray-100">
          <div>
            <h5 className="font-bold text-gray-500 uppercase tracking-wider mb-2">Billed To:</h5>
            <p className="font-bold text-sm text-gray-800">{order.address?.name || order.customer_name}</p>
            <p className="text-gray-600 mt-1">{order.address?.addressLine1 || order.shipping_address}</p>
            <p className="text-gray-600">
              {order.address?.city || ''}, {order.address?.state || ''} — {order.address?.pincode || ''}
            </p>
            <p className="text-gray-600 mt-1">Phone: {order.address?.phone || order.customer_phone}</p>
            <p className="text-gray-600">Email: {order.customer_email || order.address?.email}</p>
          </div>
          <div>
            <h5 className="font-bold text-gray-500 uppercase tracking-wider mb-2">Shipped By:</h5>
            <p className="font-bold text-gray-800">JALYN Retail Private Limited</p>
            <p className="text-gray-600 mt-1">102, Couture Fashion Plaza,</p>
            <p className="text-gray-600">Bandra West, Mumbai — 400050</p>
            <p className="text-gray-600 mt-1">GSTIN: 27AAACJ8273K1Z9</p>
            <p className="text-gray-600 mt-1">Courier Partner: {order.courier || 'BlueDart Express'}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-50 text-gray-700 font-bold uppercase">
                <th className="p-3">#</th>
                <th className="p-3">Item Description</th>
                <th className="p-3">Attributes</th>
                <th className="p-3 text-right">Price</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <tr key={idx} className="text-gray-800 font-medium">
                  <td className="p-3 font-medium">{idx + 1}</td>
                  <td className="p-3">
                    <p className="font-bold">{item.name}</p>
                  </td>
                  <td className="p-3 text-gray-600">
                    Size: {item.size || 'M'} | Color: {item.color || 'Default'}
                  </td>
                  <td className="p-3 text-right">{formatINR(item.price)}</td>
                  <td className="p-3 text-center">{item.qty}</td>
                  <td className="p-3 text-right font-bold">{formatINR(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Details */}
        <div className="grid grid-cols-12 gap-4 pt-6">
          <div className="col-span-7 space-y-2 text-gray-600">
            <h5 className="font-bold text-gray-800">Payment Information</h5>
            <p>Payment Method: <strong>{order.paymentMethod}</strong></p>
            <p>Payment Status: <strong className="text-emerald-700 font-bold">{order.paymentStatus?.toUpperCase()}</strong></p>
            <div className="border border-dashed border-gray-200 rounded-xl p-3 bg-gray-50/50 mt-4 text-[10px] leading-relaxed">
              <p className="font-bold text-gray-700 mb-1">Terms & Conditions:</p>
              <p>1. Goods once sold cannot be returned but only exchanged within 7 days.</p>
              <p>2. This is a computer generated invoice and requires no signature.</p>
            </div>
          </div>
          <div className="col-span-5 space-y-2.5 text-right font-medium">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span className="text-gray-900">{formatINR(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discount:</span>
                <span>-{formatINR(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Shipping Fee:</span>
              <span className="text-gray-900">{order.shippingCost === 0 ? 'FREE' : formatINR(order.shippingCost)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (5%):</span>
              <span className="text-gray-900">{formatINR(order.tax)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-300 pt-2 text-sm font-bold text-gray-900">
              <span>Total Amount:</span>
              <span className="text-[#AD4A85] text-base font-bold">{formatINR(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
