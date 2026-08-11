import { Link } from 'react-router-dom'
import { ShoppingBag, Clock, CheckCircle2, Heart, ArrowRight } from 'lucide-react'
import { useOrderStore, useWishlistStore } from '@/store'
import { formatINR, cn } from '@/lib/utils'

export default function Profile() {
  const orders = useOrderStore((s) => s.orders)
  const wishCount = useWishlistStore((s) => s.count())

  const totalOrders = orders.length
  const pendingOrders = orders.filter((o) => o.status === 'Processing' || o.status === 'Shipped').length
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length

  const stats = [
    { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'text-primary bg-rose-light/50' },
    { label: 'Pending Orders', value: pendingOrders, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Delivered', value: deliveredOrders, icon: CheckCircle2, color: 'text-emerald-700 bg-emerald-50' },
    { label: 'Wishlist Items', value: wishCount, icon: Heart, color: 'text-rose-500 bg-pink-50' },
  ]

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'Shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'Processing':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'Cancelled':
        return 'bg-red-50 text-red-700 border-red-200'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((st) => {
          const Icon = st.icon
          return (
            <div
              key={st.label}
              className="rounded-2xl border border-primary/10 bg-white p-5 shadow-soft transition hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading text-2xl font-bold text-ink">{st.value}</span>
                <div className={cn('flex h-10 w-10 items-center justify-center rounded-full', st.color)}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-2 text-xs font-semibold text-ink-muted">{st.label}</p>
            </div>
          )
        })}
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-2xl border border-primary/10 bg-white p-6 shadow-soft">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-heading text-lg font-bold text-ink">Recent Orders</h3>
            <p className="text-xs text-ink-muted">Track and manage your recent JALYN orders</p>
          </div>
          <Link
            to="/profile/orders"
            className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <span>View All Orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="py-12 text-center text-ink-muted">
            <p className="text-sm">You haven't placed any orders yet.</p>
            <Link
              to="/shop"
              className="mt-3 inline-block rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-soft"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-primary/10 bg-surface font-label font-bold uppercase text-ink-muted">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Products</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-surface/50 transition">
                    <td className="p-3 font-bold text-ink">#{order.id}</td>
                    <td className="p-3 text-ink-muted">{order.date}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {order.items.slice(0, 2).map((it, idx) => (
                          <img
                            key={idx}
                            src={it.image}
                            alt={it.name}
                            className="h-9 w-8 rounded object-cover object-top border border-primary/10"
                          />
                        ))}
                        <span className="font-medium text-ink truncate max-w-[140px]">
                          {order.items[0]?.name}
                          {order.items.length > 1 && ` +${order.items.length - 1}`}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 font-bold text-primary">{formatINR(order.total)}</td>
                    <td className="p-3">
                      <span
                        className={cn(
                          'inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold',
                          getStatusBadge(order.status),
                        )}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/profile/orders/${order.id}`}
                        className="rounded-lg border border-primary/20 px-3 py-1.5 text-[11px] font-bold text-primary hover:bg-primary hover:text-white transition"
                      >
                        View Order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
