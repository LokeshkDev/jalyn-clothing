import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShoppingBag, Truck, RotateCcw, ArrowRight } from 'lucide-react'
import { useOrderStore, useCartStore, useUserStore } from '@/store'
import { formatINR, cn } from '@/lib/utils'

export default function MyOrders() {
  const user = useUserStore((s) => s.user)
  const allOrders = useOrderStore((s) => s.orders)
  const fetchOrders = useOrderStore((s) => s.fetchOrders)

  useEffect(() => {
    if (user?.email) {
      fetchOrders(user.email)
    }
  }, [user?.email, fetchOrders])

  const userEmail = user?.email?.toLowerCase()
  const orders = allOrders.filter((o) => {
    const orderEmail = (o.customer_email || o.address?.email || '').toLowerCase()
    return (user?.id && String(o.user_id) === String(user.id)) || orderEmail === userEmail
  })
  const addItem = useCartStore((s) => s.addItem)
  const openCart = useCartStore((s) => s.openCart)

  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const tabs = ['All', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesTab = activeTab === 'All' || order.status === activeTab
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.items.some((item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      return matchesTab && matchesSearch
    })
  }, [orders, activeTab, searchQuery])

  const handleBuyAgain = (items) => {
    items.forEach((item) => addItem(item))
    openCart()
  }

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
      {/* Title & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-ink">My Orders</h2>
          <p className="text-sm text-ink-muted">View order history and track shipments</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order ID or Product..."
            className="w-full rounded-xl border border-primary/15 pl-9 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Filter Tabs (Swipeable, scrollbar hidden) */}
      <div className="flex items-center gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-2.5 touch-pan-x border-b border-primary/10">
        {tabs.map((tab) => {
          const isSelected = activeTab === tab
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                'rounded-xl px-4 py-2 text-sm font-bold transition whitespace-nowrap',
                isSelected
                  ? 'bg-primary text-white shadow-soft'
                  : 'bg-white text-ink-muted hover:bg-rose-light/40 hover:text-primary border border-primary/10',
              )}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Order Cards List */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-primary/10 bg-white p-12 text-center text-ink-muted text-sm">
          <ShoppingBag className="mx-auto h-12 w-12 text-primary/30 mb-3" />
          <h4 className="font-heading text-lg font-bold text-ink mb-1">No Orders Found</h4>
          <p className="text-sm mb-4">
            {searchQuery ? `No orders matching "${searchQuery}"` : `You have no ${activeTab.toLowerCase()} orders.`}
          </p>
          <Link
            to="/shop"
            className="inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-soft hover:bg-primary-deep"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-primary/10 bg-white p-3 shadow-soft transition hover:shadow-lift"
            >
              {/* Order Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 pb-2 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-ink text-base">#{order.id}</span>
                  <span className="text-sm text-ink-muted">Placed on {order.date}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-bold',
                      getStatusBadge(order.status),
                    )}
                  >
                    {order.status}
                  </span>
                  <span className="font-bold text-primary text-base">{formatINR(order.total)}</span>
                </div>
              </div>

              {/* Items Preview */}
              <div className="py-2.5 space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-16 w-14 rounded-lg object-cover object-top border border-primary/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0 text-sm">
                      <p className="font-semibold text-ink text-base truncate">{item.name}</p>
                      <p className="text-ink-muted text-xs mt-0.5">
                        Size: <strong>{item.size || 'M'}</strong> | Qty: <strong>{item.qty}</strong>
                      </p>
                      <p className="font-bold text-ink mt-1 text-sm">{formatINR(item.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-primary/10 pt-2 text-sm">
                <div className="flex items-center gap-2 text-ink-muted text-xs">
                  <Truck className="h-3.5 w-3.5 text-primary" />
                  <span>
                    Courier: <strong>{order.courier}</strong> ({order.trackingId})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleBuyAgain(order.items)}
                    className="rounded-xl border border-primary/20 bg-white px-4 py-2 text-sm font-bold text-primary hover:bg-rose-light/30 transition"
                  >
                    Buy Again
                  </button>

                  <Link
                    to={`/profile/orders/${order.id}`}
                    className="flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white shadow-soft hover:bg-primary-deep transition"
                  >
                    <span>View Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
