import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import PosBillingModal from '../components/PosBillingModal';
import api from '../services/api';
import {
  ShoppingBasket, Search, RefreshCw, Plus, Loader2, Eye, Trash2, X,
  Clock, Package, PackageCheck, Truck, CheckCircle2, XCircle,
  Check, AlertCircle, Pencil, MapPin, Phone, Mail, User,
  CreditCard, IndianRupee, ChevronRight, Save, Ban, Undo2, Send, ReceiptText, Printer,
  Store, Globe, Tag
} from 'lucide-react';
import jalynLogoUrl from '../assets/jalyn-logo-login.png';
import {
  buildInvoiceHtml,
  buildThermalHtml,
  printThermalReceipt,
  printTaxInvoice,
  sendLuxuryWhatsAppInvoice,
} from '../utils/invoiceThermalUtils';

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

const escapeHtml = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Helper to check if order is Walk-in / In-Store POS or Online Order
export const isWalkinOrder = (order) => {
  if (!order) return false;
  if (order.order_type === 'pos' || order.order_type === 'walkin') return true;
  const addr = String(order.shipping_address || '').toLowerCase();
  const name = String(order.customer_name || '').toLowerCase();
  return (
    addr.includes('counter') ||
    addr.includes('in-store') ||
    addr.includes('walk-in') ||
    addr.includes('pos') ||
    name.includes('walk-in')
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'online', 'pos'
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Modal state
  const [detailOrder, setDetailOrder] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState(false);

  // Detail edit state
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});

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

  const sendInvoiceWhatsApp = (order) => {
    const success = sendLuxuryWhatsAppInvoice(order, { includeSocial: true });
    if (!success) {
      showToast('No phone/WhatsApp number found on this order.', 'error');
      return;
    }
    showToast('Opening WhatsApp with luxury tax invoice.');
  };

  const printThermalBill = (order) => {
    printThermalReceipt(order);
  };

  const handlePrintTaxInvoice = (order) => {
    printTaxInvoice(order);
  };

  const handleStatusChange = async (id, payload) => {
    // If changing order status to shipped, prompt for tracking number
    if (payload.order_status === 'shipped') {
      const orderObj = orders.find((o) => o.id === id);
      const defaultTracking = orderObj?.tracking_id || '';
      const tracking = window.prompt('Please enter the AWB Tracking ID (Courier Tracking Number):', defaultTracking);
      if (tracking === null) {
        // Cancel update
        return false;
      }
      payload.tracking_id = tracking;
    }

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

  // Tab count badges
  const tabCounts = useMemo(() => {
    const online = orders.filter((o) => !isWalkinOrder(o) && o.order_status !== 'cancelled' && o.payment_status !== 'failed').length;
    const pos = orders.filter((o) => isWalkinOrder(o) && o.order_status !== 'cancelled' && o.payment_status !== 'failed').length;
    const failed = orders.filter((o) => o.order_status === 'cancelled' || o.payment_status === 'failed').length;
    return { all: orders.length, online, pos, failed };
  }, [orders]);

  const kpis = useMemo(() => {
    const currentTabOrders = orders.filter((o) => {
      if (activeTab === 'online') return !isWalkinOrder(o) && o.order_status !== 'cancelled' && o.payment_status !== 'failed';
      if (activeTab === 'pos') return isWalkinOrder(o) && o.order_status !== 'cancelled' && o.payment_status !== 'failed';
      if (activeTab === 'failed') return o.order_status === 'cancelled' || o.payment_status === 'failed';
      return true;
    });

    const pending = currentTabOrders.filter((o) => o.order_status === 'pending').length;
    const inTransit = currentTabOrders.filter((o) => ['processing', 'shipped'].includes(o.order_status)).length;
    const delivered = currentTabOrders.filter((o) => o.order_status === 'delivered').length;
    const revenue = currentTabOrders
      .filter((o) => o.order_status !== 'cancelled' && o.payment_status === 'paid')
      .reduce((s, o) => s + (Number(o.total_amount) || itemTotal(o.items)), 0);
    return { pending, inTransit, delivered, revenue };
  }, [orders, activeTab]);

  const [dateSort, setDateSort] = useState('newest');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = orders.filter((o) => {
      // Tab filter: Online vs Walkin/POS vs Failed/Cancelled
      if (activeTab === 'online') {
        if (isWalkinOrder(o) || o.order_status === 'cancelled' || o.payment_status === 'failed') return false;
      }
      if (activeTab === 'pos') {
        if (!isWalkinOrder(o) || o.order_status === 'cancelled' || o.payment_status === 'failed') return false;
      }
      if (activeTab === 'failed') {
        if (o.order_status !== 'cancelled' && o.payment_status !== 'failed') return false;
      }

      const matchesSearch =
        !q ||
        (o.order_number || '').toLowerCase().includes(q) ||
        (o.customer_name || '').toLowerCase().includes(q) ||
        (o.customer_email || '').toLowerCase().includes(q) ||
        (o.customer_phone || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || o.order_status === statusFilter;
      const matchesPayment = paymentFilter === 'all' || o.payment_status === paymentFilter;
      return matchesSearch && matchesStatus && matchesPayment;
    });

    return [...list].sort((a, b) => {
      if (dateSort === 'oldest') {
        const timeA = new Date(a.created_at || a.date || 0).getTime();
        const timeB = new Date(b.created_at || b.date || 0).getTime();
        if (timeA !== timeB) return timeA - timeB;
        return (Number(a.id) || 0) - (Number(b.id) || 0);
      }
      if (dateSort === 'amount_high') {
        return (Number(b.total_amount) || 0) - (Number(a.total_amount) || 0);
      }
      if (dateSort === 'amount_low') {
        return (Number(a.total_amount) || 0) - (Number(b.total_amount) || 0);
      }
      // Default: 'newest'
      const timeA = new Date(a.created_at || a.date || 0).getTime();
      const timeB = new Date(b.created_at || b.date || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });
  }, [orders, activeTab, search, statusFilter, paymentFilter, dateSort]);

  return (
    <div className="flex-1 overflow-y-auto">
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

        {/* Primary Order Tabs: All / Online / Walk-in POS */}
        <div className="flex items-center gap-2 border-b border-gray-200/80 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#2A1A22] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <ShoppingBasket className="w-4 h-4" /> All Orders
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
              {tabCounts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('online')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'online'
                ? 'bg-[#AD4A85] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Globe className="w-4 h-4" /> 🛒 Online Customer Orders
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'online' ? 'bg-white/20 text-white' : 'bg-pink-50 text-[#AD4A85]'}`}>
              {tabCounts.online}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Store className="w-4 h-4" /> 🏪 Walk-in / POS Billing
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'pos' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-800'}`}>
              {tabCounts.pos}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('failed')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'failed'
                ? 'bg-red-700 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <XCircle className="w-4 h-4 text-red-500" /> ⚠️ Failed / Cancelled
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${activeTab === 'failed' ? 'bg-white/20 text-white' : 'bg-red-50 text-red-700'}`}>
              {tabCounts.failed}
            </span>
          </button>
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
            <select
              value={dateSort}
              onChange={(e) => setDateSort(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white font-semibold text-brand-700 focus:ring-2 focus:ring-brand-500 shadow-sm"
            >
              <option value="newest">🕒 Newest Orders First</option>
              <option value="oldest">⏳ Oldest Orders First</option>
              <option value="amount_high">💰 Highest Amount First</option>
              <option value="amount_low">🏷️ Lowest Amount First</option>
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
              className="w-full sm:w-auto bg-[#2A1A22] hover:bg-[#3D2631] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-pink-300" /> POS Billing / Add Order
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
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-gray-900 font-mono">{order.order_number}</p>
                          {isWalkinOrder(order) ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Store className="w-2.5 h-2.5" /> Walk-in POS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-pink-50 text-[#AD4A85] border border-pink-200">
                              <Globe className="w-2.5 h-2.5" /> Online
                            </span>
                          )}
                        </div>
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
                            onClick={(e) => { e.stopPropagation(); handlePrintTaxInvoice(order); }}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-[#AD4A85] hover:bg-pink-50 transition"
                            title="Print Luxury Tax Invoice (A4)"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); printThermalBill(order); }}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Print Thermal Bill (80mm)"
                          >
                            <ReceiptText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); sendInvoiceWhatsApp(order); }}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition"
                            title="Send Invoice on WhatsApp"
                          >
                            <Send className="w-4 h-4" />
                          </button>
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
                {isWalkinOrder(detailOrder) ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-700/50">
                    <Store className="w-3 h-3" /> Walk-in POS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-950/80 text-pink-300 border border-pink-700/50">
                    <Globe className="w-3 h-3" /> Online Order
                  </span>
                )}
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
                    <button
                      onClick={() => handlePrintTaxInvoice(detailOrder)}
                      className="text-[11px] font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Tax Invoice
                    </button>
                    <button
                      onClick={() => printThermalBill(detailOrder)}
                      className="text-[11px] font-semibold bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5"
                    >
                      <ReceiptText className="w-3.5 h-3.5" /> Thermal Bill
                    </button>
                    <button
                      onClick={() => sendInvoiceWhatsApp(detailOrder)}
                      className="text-[11px] font-semibold bg-emerald-500/90 hover:bg-emerald-500 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> WhatsApp Invoice
                    </button>
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
                            courier: detailOrder.courier || '',
                            tracking_id: detailOrder.tracking_id || '',
                            expected_delivery: detailOrder.expected_delivery || '',
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
                      <div className="pt-2 border-t border-gray-100 grid grid-cols-3 gap-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Courier Partner</p>
                          <p className="font-bold text-gray-900">{detailOrder.courier || 'BlueDart Express'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tracking ID</p>
                          <p className="font-bold text-gray-900">{detailOrder.tracking_id || 'Pending'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Expected Delivery</p>
                          <p className="font-bold text-emerald-700">{detailOrder.expected_delivery || '3 to 5 business days'}</p>
                        </div>
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
                          rows={2}
                          value={draft.shipping_address || ''}
                          onChange={(e) => setDraft({ ...draft, shipping_address: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-lg border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-brand-500"
                        />
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <label className="block">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Courier Partner</span>
                          <input
                            type="text"
                            value={draft.courier || ''}
                            onChange={(e) => setDraft({ ...draft, courier: e.target.value })}
                            placeholder="e.g. BlueDart Express"
                            className="w-full px-2.5 py-2 rounded-lg border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-brand-500"
                          />
                        </label>
                        <label className="block">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Tracking ID</span>
                          <input
                            type="text"
                            value={draft.tracking_id || ''}
                            onChange={(e) => setDraft({ ...draft, tracking_id: e.target.value })}
                            placeholder="e.g. BD234760271IN"
                            className="w-full px-2.5 py-2 rounded-lg border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-brand-500"
                          />
                        </label>
                        <label className="block">
                          <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Expected Delivery</span>
                          <input
                            type="text"
                            value={draft.expected_delivery || ''}
                            onChange={(e) => setDraft({ ...draft, expected_delivery: e.target.value })}
                            placeholder="e.g. 3 to 5 business days"
                            className="w-full px-2.5 py-2 rounded-lg border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-brand-500"
                          />
                        </label>
                      </div>
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

      {/* ─── POS BILLING & CREATE ORDER MODAL ─── */}
      <PosBillingModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onOrderCreated={loadOrders}
        showToast={showToast}
      />
    </div>
  );
}
