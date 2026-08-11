import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import api from '../services/api';
import {
  ShoppingBasket, Search, RefreshCw, Plus, Loader2, Eye, Trash2, X,
  Clock, Package, PackageCheck, Truck, CheckCircle2, XCircle,
  Check, AlertCircle, Pencil, MapPin, Phone, Mail, User,
  CreditCard, IndianRupee, ChevronRight, Save, Ban, Undo2,
} from 'lucide-react';

const ORDER_STATUS = {
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  processing: { label: 'Processing', cls: 'bg-blue-100 text-blue-700 border-blue-200', icon: Package },
  shipped: { label: 'Shipped', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Truck },
  delivered: { label: 'Delivered', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

const PAYMENT_STATUS = {
  pending: { label: 'Payment Pending', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  paid: { label: 'Paid', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  failed: { label: 'Payment Failed', cls: 'bg-red-50 text-red-700 border-red-200' },
  refunded: { label: 'Refunded', cls: 'bg-purple-50 text-purple-700 border-purple-200' },
};

const ORDER_FLOW = ['pending', 'processing', 'shipped', 'delivered'];

const formatDate = (val) => {
  if (!val) return '—';
  const d = new Date(String(val).includes(' ') ? String(val).replace(' ', 'T') : val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const money = (v) => '₹' + Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const itemTotal = (items) => (items || []).reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Modal state
  const [detailOrder, setDetailOrder] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState(false);

  // Detail edit state
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});

  // Create form state
  const [createForm, setCreateForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    shipping_address: '',
    payment_method: 'Online Payment (UPI)',
    payment_status: 'paid',
    order_status: 'pending',
    items: [{ product_name: '', price: '', quantity: 1, size: '', color: '' }],
  });

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/orders');
      setOrders(res.data?.orders || []);
    } catch (err) {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const fetchDetail = async (order) => {
    try {
      const res = await api.get(`/orders/${order.id}`);
      setDetailOrder(res.data?.order || order);
    } catch (err) {
      setDetailOrder(order);
    }
  };

  const openDetail = (order) => {
    setEditing(false);
    setDetailOrder(order);
    fetchDetail(order);
  };

  const updateLocalOrder = (updated) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
    setDetailOrder((prev) => (prev && (prev.id === updated.id || prev.order_number === updated.order_number) ? { ...prev, ...updated } : prev));
  };

  const handleStatusChange = async (id, payload) => {
    try {
      const res = await api.put(`/orders/${id}`, payload);
      updateLocalOrder({ id, ...payload });
      showToast(res.data?.message || 'Order updated successfully.');
      return true;
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update order', 'error');
      return false;
    }
  };

  const handleSaveDetail = async () => {
    setBusy(true);
    const ok = await handleStatusChange(detailOrder.id, draft);
    setBusy(false);
    if (ok) {
      setEditing(false);
      setDetailOrder((prev) => ({ ...prev, ...draft }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this order? This cannot be undone.')) return;
    try {
      await api.delete(`/orders/${id}`);
      setOrders((prev) => prev.filter((o) => String(o.id) !== String(id)));
      setDetailOrder(null);
      showToast('Order deleted.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete order', 'error');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...createForm,
        items: createForm.items
          .filter((i) => i.product_name?.trim())
          .map((i) => ({
            product_name: i.product_name.trim(),
            price: Number(i.price) || 0,
            quantity: Number(i.quantity) || 1,
            size: i.size || null,
            color: i.color || null,
          })),
        total_amount: itemTotal(createForm.items),
      };
      const res = await api.post('/orders', payload);
      showToast(res.data?.message || 'Order created successfully.');
      setShowCreate(false);
      loadOrders();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create order', 'error');
    } finally {
      setBusy(false);
    }
  };

  const kpis = useMemo(() => {
    const pending = orders.filter((o) => o.order_status === 'pending').length;
    const inTransit = orders.filter((o) => ['processing', 'shipped'].includes(o.order_status)).length;
    const delivered = orders.filter((o) => o.order_status === 'delivered').length;
    const revenue = orders
      .filter((o) => o.order_status !== 'cancelled' && o.payment_status === 'paid')
      .reduce((s, o) => s + (Number(o.total_amount) || itemTotal(o.items)), 0);
    return { pending, inTransit, delivered, revenue };
  }, [orders]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchesSearch =
        !q ||
        (o.order_number || '').toLowerCase().includes(q) ||
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.customer_email || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || o.order_status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || o.payment_status === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, search, statusFilter, paymentFilter]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 min-h-screen">
      <Header title="Order Management Center" subtitle="Review, fulfil, and manage customer orders — status, payments, and full CRUD workflows." />

      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl shadow-xl font-medium text-xs flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-pink-50 rounded-xl text-brand-600"><ShoppingBasket className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Orders</p>
              <p className="text-xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><Clock className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pending</p>
              <p className="text-xl font-bold text-amber-600">{kpis.pending}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Truck className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">In Transit</p>
              <p className="text-xl font-bold text-blue-600">{kpis.inTransit}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Delivered</p>
              <p className="text-xl font-bold text-emerald-600">{kpis.delivered}</p>
            </div>
          </div>
          <div className="col-span-2 lg:col-span-1 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><IndianRupee className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Paid Revenue</p>
              <p className="text-xl font-bold text-gray-900">{money(kpis.revenue)}</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search order #, customer name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 bg-white shadow-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-brand-500 shadow-sm"
            >
              <option value="all">All Order Status</option>
              {Object.entries(ORDER_STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-brand-500 shadow-sm"
            >
              <option value="all">All Payments</option>
              {Object.entries(PAYMENT_STATUS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadOrders}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 transition shadow-sm"
              title="Refresh Orders"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Order
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" /> Loading orders...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-xs">
              {orders.length === 0 ? 'No orders recorded yet. Create your first order.' : 'No orders match your current search / filters.'}
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Items</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filtered.map((order) => {
                  const st = ORDER_STATUS[order.order_status] || ORDER_STATUS.pending;
                  const pay = PAYMENT_STATUS[order.payment_status] || PAYMENT_STATUS.pending;
                  const itemCount = (order.items || []).reduce((s, i) => s + (Number(i.quantity) || 1), 0);
                  return (
                    <tr
                      key={order.id}
                      onClick={() => openDetail(order)}
                      className="hover:bg-pink-50/40 transition cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900 font-mono">{order.order_number}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{formatDate(order.created_at)}</p>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900">{order.customer_name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{order.customer_email}</p>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            {(order.items || []).slice(0, 3).map((item, idx) => (
                              <img
                                key={idx}
                                src={item.image_url || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=200&q=80'}
                                alt={item.product_name}
                                className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                            ))}
                          </div>
                          <span className="text-[11px] text-gray-500">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-bold text-gray-900">{money(order.total_amount)}</td>

                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${pay.cls}`}>
                          {pay.label}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${st.cls}`}>
                            {React.createElement(st.icon, { className: 'w-3 h-3' })}
                            {st.label}
                          </span>
                          <select
                            value={order.order_status || 'pending'}
                            onChange={(e) => handleStatusChange(order.id, { order_status: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] font-semibold px-1.5 py-1 rounded-lg border border-gray-300 bg-white cursor-pointer"
                            title="Quick change order status"
                          >
                            {Object.entries(ORDER_STATUS).map(([k, v]) => (
                              <option key={k} value={k}>{v.label}</option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); openDetail(order); }}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-brand-600 hover:bg-pink-100 transition"
                            title="View Order Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ─── FULL WIDTH ORDER DETAIL MODAL ─── */}
      {detailOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-7xl max-h-[96vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <ShoppingBasket className="w-4 h-4 text-brand-400" />
                  Order <span className="font-mono">{detailOrder.order_number}</span>
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${ORDER_STATUS[detailOrder.order_status]?.cls}`}>
                  {ORDER_STATUS[detailOrder.order_status]?.label || detailOrder.order_status}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${PAYMENT_STATUS[detailOrder.payment_status]?.cls}`}>
                  {PAYMENT_STATUS[detailOrder.payment_status]?.label || detailOrder.payment_status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!editing && (
                  <>
                    <a
                      href={`mailto:${detailOrder.customer_email}`}
                      className="text-[11px] font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5"
                    >
                      <Mail className="w-3.5 h-3.5" /> Email Customer
                    </a>
                    {ORDER_STATUS[detailOrder.order_status] !== 'cancelled' && (
                      <button
                        onClick={() => handleStatusChange(detailOrder.id, { order_status: 'cancelled' })}
                        className="text-[11px] font-semibold bg-red-500/20 hover:bg-red-500/30 text-red-200 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" /> Cancel Order
                      </button>
                    )}
                  </>
                )}
                <button onClick={() => setDetailOrder(null)} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
              {/* Left: Items & Totals */}
              <div className="flex-1 p-5 sm:p-6 space-y-6">
                {/* Fulfillment Progress */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <h4 className="font-bold text-xs text-gray-900 mb-3">Fulfillment Progress</h4>
                  <div className="flex items-center gap-0">
                    {ORDER_FLOW.map((st, idx) => {
                      const currentIdx = ORDER_FLOW.indexOf(detailOrder.order_status);
                      const done = idx <= currentIdx || detailOrder.order_status === 'cancelled';
                      const cancelled = detailOrder.order_status === 'cancelled';
                      const StatusIcon = ORDER_STATUS[st].icon;
                      return (
                        <React.Fragment key={st}>
                          {idx > 0 && (
                            <div className={`flex-1 h-0.5 rounded ${idx <= currentIdx && !cancelled ? 'bg-brand-500' : 'bg-gray-200'}`} />
                          )}
                          <div className="flex flex-col items-center gap-1 min-w-[70px]">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition ${
                              cancelled
                                ? 'bg-red-100 border-red-300 text-red-500'
                                : done
                                  ? 'bg-brand-600 border-brand-600 text-white'
                                  : 'bg-white border-gray-300 text-gray-400'
                            }`}>
                              {cancelled && idx === 0 ? <XCircle className="w-3.5 h-3.5" /> : <StatusIcon className="w-3.5 h-3.5" />}
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wide ${done && !cancelled ? 'text-brand-700' : 'text-gray-400'}`}>
                              {ORDER_STATUS[st].label}
                            </span>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <h4 className="font-bold text-xs text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-brand-600" /> Order Items ({itemTotal(detailOrder.items)} units)
                  </h4>
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-100 font-bold text-gray-600 text-[10px] uppercase">
                        <tr>
                          <th className="py-2.5 px-3">Product</th>
                          <th className="py-2.5 px-3">Variant</th>
                          <th className="py-2.5 px-3 text-center">Qty</th>
                          <th className="py-2.5 px-3 text-right">Unit Price</th>
                          <th className="py-2.5 px-3 text-right">Line Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {(detailOrder.items || []).length === 0 ? (
                          <tr><td colSpan={5} className="py-8 text-center text-gray-400">No items found for this order.</td></tr>
                        ) : (detailOrder.items || []).map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50/70">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={item.image_url || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=200&q=80'}
                                  alt={item.product_name}
                                  className="w-10 h-12 rounded-lg object-cover border border-gray-200 shadow-sm"
                                />
                                <span className="font-semibold text-gray-900">{item.product_name || 'Untitled Item'}</span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-gray-500">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {item.size && <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] font-semibold">Size {item.size}</span>}
                                {item.color && <span className="bg-pink-50 px-1.5 py-0.5 rounded text-[10px] font-semibold capitalize text-brand-700">{item.color}</span>}
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold">{item.quantity}</td>
                            <td className="py-2.5 px-3 text-right">{money(item.price)}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-gray-900">{money((Number(item.price) || 0) * (Number(item.quantity) || 1))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Payment & Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-xs text-gray-900 mb-2 flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-brand-600" /> Payment Details
                    </h4>
                    <div className="space-y-1.5 text-[11px] text-gray-600">
                      <p className="flex justify-between"><span className="text-gray-400">Method</span><span className="font-semibold text-gray-800">{detailOrder.payment_method || '—'}</span></p>
                      <p className="flex justify-between"><span className="text-gray-400">Status</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${PAYMENT_STATUS[detailOrder.payment_status]?.cls}`}>
                          {PAYMENT_STATUS[detailOrder.payment_status]?.label || detailOrder.payment_status}
                        </span>
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5 text-[11px]">
                      <p className="flex justify-between text-gray-500"><span>Subtotal (Items)</span><span className="font-semibold text-gray-800">{money(itemTotal(detailOrder.items))}</span></p>
                      <p className="flex justify-between text-gray-500"><span>Order Total</span><span className="font-bold text-gray-900 text-xs">{money(detailOrder.total_amount)}</span></p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <h4 className="font-bold text-xs text-gray-900 mb-3 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-brand-600" /> Order Timeline
                    </h4>
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-brand-600 mt-1 shrink-0" />
                        <div>
                          <p className="text-[11px] font-semibold text-gray-800">Order Placed</p>
                          <p className="text-[10px] text-gray-400">{formatDate(detailOrder.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-brand-600 mt-1 shrink-0" />
                        <div>
                          <p className="text-[11px] font-semibold text-gray-800">Status: {ORDER_STATUS[detailOrder.order_status]?.label || detailOrder.order_status}</p>
                          <p className="text-[10px] text-gray-400">Last updated {formatDate(detailOrder.updated_at || detailOrder.created_at)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="lg:w-[22rem] border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-50/60 p-5 sm:p-6 space-y-5">
                {/* Status Management */}
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                    <ChevronRight className="w-4 h-4 text-brand-600" /> Status Management
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Order Status</span>
                      <select
                        value={detailOrder.order_status || 'pending'}
                        onChange={(e) => handleStatusChange(detailOrder.id, { order_status: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-lg border border-gray-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-brand-500"
                      >
                        {Object.entries(ORDER_STATUS).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Payment Status</span>
                      <select
                        value={detailOrder.payment_status || 'pending'}
                        onChange={(e) => handleStatusChange(detailOrder.id, { payment_status: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-lg border border-gray-300 text-xs font-semibold bg-white focus:ring-2 focus:ring-brand-500"
                      >
                        {Object.entries(PAYMENT_STATUS).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Quick Actions</p>
                    <div className="flex flex-wrap gap-2">
                      {detailOrder.order_status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(detailOrder.id, { order_status: 'processing' })}
                          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          <PackageCheck className="w-3.5 h-3.5" /> Confirm & Process
                        </button>
                      )}
                      {['pending', 'processing'].includes(detailOrder.order_status) && (
                        <button
                          onClick={() => handleStatusChange(detailOrder.id, { order_status: 'shipped' })}
                          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          <Truck className="w-3.5 h-3.5" /> Mark Shipped
                        </button>
                      )}
                      {['shipped', 'processing'].includes(detailOrder.order_status) && (
                        <button
                          onClick={() => handleStatusChange(detailOrder.id, { order_status: 'delivered' })}
                          className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mark Delivered
                        </button>
                      )}
                      {detailOrder.order_status !== 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange(detailOrder.id, { order_status: 'cancelled' })}
                          className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancel Order
                        </button>
                      )}
                      {detailOrder.order_status === 'cancelled' && (
                        <button
                          onClick={() => handleStatusChange(detailOrder.id, { order_status: 'pending' })}
                          className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          <Undo2 className="w-3.5 h-3.5" /> Reinstate Order
                        </button>
                      )}
                      {detailOrder.order_status === 'cancelled' && detailOrder.payment_status === 'paid' && (
                        <button
                          onClick={() => handleStatusChange(detailOrder.id, { payment_status: 'refunded' })}
                          className="inline-flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          <Undo2 className="w-3.5 h-3.5" /> Mark Refunded
                        </button>
                      )}
                      {detailOrder.payment_status === 'failed' && (
                        <button
                          onClick={() => handleStatusChange(detailOrder.id, { payment_status: 'paid' })}
                          className="inline-flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark Payment Received
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer & Shipping (View / Edit) */}
                <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-brand-600" /> Customer & Delivery
                    </h4>
                    <button
                      onClick={() => {
                        if (editing) {
                          setDraft({});
                          setEditing(false);
                        } else {
                          setDraft({
                            customer_name: detailOrder.customer_name || '',
                            customer_email: detailOrder.customer_email || '',
                            customer_phone: detailOrder.customer_phone || '',
                            shipping_address: detailOrder.shipping_address || '',
                            total_amount: detailOrder.total_amount,
                          });
                          setEditing(true);
                        }
                      }}
                      className="text-[10px] font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                    >
                      {editing ? <X className="w-3 h-3" /> : <Pencil className="w-3 h-3" />}
                      {editing ? 'Cancel' : 'Edit Details'}
                    </button>
                  </div>

                  {!editing ? (
                    <div className="space-y-3 text-[11px]">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Customer</p>
                        <p className="font-bold text-gray-900 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-gray-300" /> {detailOrder.customer_name}</p>
                        <p className="text-gray-500 flex items-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5 text-gray-300" /> {detailOrder.customer_email}</p>
                        {detailOrder.customer_phone && (
                          <p className="text-gray-500 flex items-center gap-1.5 mt-1"><Phone className="w-3.5 h-3.5 text-gray-300" /> {detailOrder.customer_phone}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Shipping Address</p>
                        <p className="text-gray-700 leading-relaxed flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-300 mt-0.5 shrink-0" />
                          {detailOrder.shipping_address}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <label className="block">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Customer Name</span>
                          <input
                            type="text"
                            value={draft.customer_name || ''}
                            onChange={(e) => setDraft({ ...draft, customer_name: e.target.value })}
                            className="w-full px-2.5 py-2 rounded-lg border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-brand-500"
                          />
                        </label>
                        <label className="block">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Phone</span>
                          <input
                            type="text"
                            value={draft.customer_phone || ''}
                            onChange={(e) => setDraft({ ...draft, customer_phone: e.target.value })}
                            className="w-full px-2.5 py-2 rounded-lg border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-brand-500"
                          />
                        </label>
                      </div>
                      <label className="block">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Email</span>
                        <input
                          type="email"
                          value={draft.customer_email || ''}
                          onChange={(e) => setDraft({ ...draft, customer_email: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-lg border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-brand-500"
                        />
                      </label>
                      <label className="block">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Shipping Address</span>
                        <textarea
                          rows={3}
                          value={draft.shipping_address || ''}
                          onChange={(e) => setDraft({ ...draft, shipping_address: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-lg border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-brand-500"
                        />
                      </label>
                      <button
                        onClick={handleSaveDetail}
                        disabled={busy}
                        className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-xs font-bold py-2 rounded-lg transition inline-flex items-center justify-center gap-1.5"
                      >
                        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Save Changes
                      </button>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                    <span>Order ID: <span className="font-mono">{detailOrder.id}</span></span>
                    <span>Created {formatDate(detailOrder.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-xs font-bold text-gray-900">
                <span>Invoice Total:</span>
                <span className="text-base">{money(detailOrder.total_amount)}</span>
                <span className="text-[10px] font-medium text-gray-400">({itemTotal(detailOrder.items)} units)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDelete(detailOrder.id)}
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold px-3.5 py-2 rounded-lg transition disabled:opacity-60"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Order
                </button>
                <button
                  onClick={() => setDetailOrder(null)}
                  className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-lg transition"
                >
                  <X className="w-3.5 h-3.5" /> Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CREATE ORDER MODAL ─── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[94vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4 text-brand-400" /> Create New Order
                </h3>
                <p className="text-[10px] text-gray-400">Manually create an order entry with customer, items, and status.</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              <div>
                <h4 className="font-bold text-gray-900 text-xs mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-brand-600" /> Customer Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={createForm.customer_name}
                      onChange={(e) => setCreateForm({ ...createForm, customer_name: e.target.value })}
                      placeholder="e.g. Meera Patel"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={createForm.customer_phone}
                      onChange={(e) => setCreateForm({ ...createForm, customer_phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <label className="block font-semibold text-gray-700 mb-1">Customer Email *</label>
                  <input
                    type="email"
                    required
                    value={createForm.customer_email}
                    onChange={(e) => setCreateForm({ ...createForm, customer_email: e.target.value })}
                    placeholder="customer@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="mt-3">
                  <label className="block font-semibold text-gray-700 mb-1">Shipping Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={createForm.shipping_address}
                    onChange={(e) => setCreateForm({ ...createForm, shipping_address: e.target.value })}
                    placeholder="House, Street, Area, City, State, PIN"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-brand-600" /> Order Items
                  </h4>
                  <button
                    type="button"
                    onClick={() => setCreateForm({ ...createForm, items: [...createForm.items, { product_name: '', price: '', quantity: 1, size: '', color: '' }] })}
                    className="bg-brand-50 text-brand-700 hover:bg-brand-100 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {createForm.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-12 gap-2.5 items-end">
                      <div className="col-span-2 sm:col-span-4">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Product Name</label>
                        <input
                          type="text"
                          value={item.product_name}
                          onChange={(e) => {
                            const items = [...createForm.items];
                            items[idx].product_name = e.target.value;
                            setCreateForm({ ...createForm, items });
                          }}
                          placeholder="e.g. Floral Midi Dress"
                          className="w-full px-2.5 py-2 rounded-lg border border-gray-300 font-medium"
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Price (₹)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) => {
                            const items = [...createForm.items];
                            items[idx].price = e.target.value;
                            setCreateForm({ ...createForm, items });
                          }}
                          placeholder="1899"
                          className="w-full px-2.5 py-2 rounded-lg border border-gray-300 font-medium"
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const items = [...createForm.items];
                            items[idx].quantity = e.target.value;
                            setCreateForm({ ...createForm, items });
                          }}
                          className="w-full px-2.5 py-2 rounded-lg border border-gray-300 font-medium"
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Size</label>
                        <input
                          type="text"
                          value={item.size}
                          onChange={(e) => {
                            const items = [...createForm.items];
                            items[idx].size = e.target.value;
                            setCreateForm({ ...createForm, items });
                          }}
                          placeholder="M"
                          className="w-full px-2.5 py-2 rounded-lg border border-gray-300 font-medium"
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (createForm.items.length === 1) return;
                            setCreateForm({ ...createForm, items: createForm.items.filter((_, i) => i !== idx) });
                          }}
                          disabled={createForm.items.length === 1}
                          className="w-full p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-end text-xs font-bold text-gray-900">
                  <span className="bg-gray-100 px-3 py-1.5 rounded-lg">
                    Total: {money(itemTotal(createForm.items))}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 text-xs mb-3 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-brand-600" /> Payment & Fulfillment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Payment Method</label>
                    <select
                      value={createForm.payment_method}
                      onChange={(e) => setCreateForm({ ...createForm, payment_method: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                    >
                      <option>Online Payment (UPI)</option>
                      <option>Online Payment (Card)</option>
                      <option>Cash on Delivery</option>
                      <option>Bank Transfer</option>
                      <option>Wallet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Payment Status</label>
                    <select
                      value={createForm.payment_status}
                      onChange={(e) => setCreateForm({ ...createForm, payment_status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                    >
                      {Object.entries(PAYMENT_STATUS).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Order Status</label>
                    <select
                      value={createForm.order_status}
                      onChange={(e) => setCreateForm({ ...createForm, order_status: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                    >
                      {Object.entries(ORDER_STATUS).map(([k, v]) => (
                        <option key={k} value={k}>{v.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}