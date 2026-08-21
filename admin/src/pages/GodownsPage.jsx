import React, { useEffect, useState } from 'react';
import {
  Plus, Loader2, Edit2, X, Search, Check, AlertCircle, Warehouse,
  Power, Trash2, Package, ArrowDownToLine, ArrowUpFromLine, ChevronLeft, ChevronRight,
  MapPin, Phone, User as UserIcon, Star, RefreshCw
} from 'lucide-react';
import Header from '../components/Header';
import api from '../services/api';
import { PRODUCT_PLACEHOLDER } from '../utils/placeholder';

const EMPTY_GODOWN = {
  name: '',
  code: '',
  address: '',
  city: '',
  contact_person: '',
  phone: '',
  notes: '',
  is_default: false,
  status: 'active',
};

const PAGE_SIZE = 25;

export default function GodownsPage() {
  const [godowns, setGodowns] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGodown, setSelectedGodown] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Godown CRUD modal
  const [godownModal, setGodownModal] = useState({ open: false, editingId: null, form: EMPTY_GODOWN });
  const [godownSubmitting, setGodownSubmitting] = useState(false);

  // Stock adjust modal
  const [adjustModal, setAdjustModal] = useState({
    open: false, product: null, godownId: null, mode: 'add', qty: 1, reason: '',
  });
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [gRes, sRes] = await Promise.all([
        api.get('/godowns').catch(() => ({ data: { godowns: [] } })),
        api.get('/godowns/stock', {
          params: {
            search: search || undefined,
            godown_id: selectedGodown !== 'all' ? selectedGodown : undefined,
            page,
            limit: PAGE_SIZE,
          },
        }),
      ]);
      setGodowns(gRes.data.godowns || []);
      setProducts(sRes.data.products || []);
      setTotalPages(sRes.data.pagination?.total ? Math.ceil(sRes.data.pagination.total / PAGE_SIZE) : 1);
      setTotalCount(sRes.data.pagination?.total || 0);
    } catch (err) {
      showToast('Failed to load godown stock', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) setPage(1);
      else loadData();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedGodown]);

  useEffect(() => {
    loadData();
  }, [page]);

  // ─── Godown CRUD ───
  const openAddGodown = () => {
    setGodownModal({ open: true, editingId: null, form: EMPTY_GODOWN });
  };

  const openEditGodown = (g) => {
    setGodownModal({
      open: true,
      editingId: g.id,
      form: {
        name: g.name || '',
        code: g.code || '',
        address: g.address || '',
        city: g.city || '',
        contact_person: g.contact_person || '',
        phone: g.phone || '',
        notes: g.notes || '',
        is_default: !!g.is_default,
        status: g.status || 'active',
      },
    });
  };

  const handleGodownSubmit = async (e) => {
    e.preventDefault();
    setGodownSubmitting(true);
    const form = godownModal.form;
    try {
      if (godownModal.editingId) {
        await api.put(`/godowns/${godownModal.editingId}`, form);
        showToast('Godown updated successfully!');
      } else {
        await api.post('/godowns', form);
        showToast('Godown created successfully!');
      }
      setGodownModal({ open: false, editingId: null, form: EMPTY_GODOWN });
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save godown', 'error');
    } finally {
      setGodownSubmitting(false);
    }
  };

  const handleToggleGodownStatus = async (g) => {
    const next = g.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/godowns/${g.id}/status`, { status: next });
      showToast(next === 'active' ? 'Godown activated.' : 'Godown deactivated.');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDeleteGodown = async (g) => {
    if (!confirm(`Delete godown "${g.name}"? Its stock records will be removed.`)) return;
    try {
      await api.delete(`/godowns/${g.id}`);
      showToast('Godown deleted.');
      if (selectedGodown === g.id) setSelectedGodown('all');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete godown', 'error');
    }
  };

  // ─── Stock Adjust ───
  const openAdjust = (p, mode) => {
    setAdjustModal({
      open: true,
      product: p,
      godownId: selectedGodown !== 'all' ? selectedGodown : (godowns[0]?.id || null),
      mode,
      qty: 1,
      reason: '',
    });
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setAdjustSubmitting(true);
    const { product, godownId, mode, qty, reason } = adjustModal;

    if (!godownId) {
      showToast('Please select a godown.', 'error');
      setAdjustSubmitting(false);
      return;
    }
    if (!qty || qty <= 0) {
      showToast('Quantity must be a positive number.', 'error');
      setAdjustSubmitting(false);
      return;
    }

    try {
      const changeQty = mode === 'reduce' ? -qty : qty;
      await api.post('/godowns/stock/adjust', {
        godown_id: godownId,
        product_id: product.id,
        change_qty: changeQty,
        reason: reason || null,
      });
      showToast(`Stock ${mode === 'reduce' ? 'reduced' : 'added'} successfully!`);
      setAdjustModal({ ...adjustModal, open: false });
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to adjust stock', 'error');
    } finally {
      setAdjustSubmitting(false);
    }
  };

  const getStockFor = (p, godownId) => {
    const entry = (p.stock_by_godown || []).find((s) => s.godown_id === godownId);
    return entry ? entry.stock : 0;
  };

  const getTotalStock = (p) => {
    if (p.godown_count > 0) return p.godown_total;
    return p.total_stock || 0;
  };

  const getStockStatus = (p) => {
    const total = getTotalStock(p);
    const threshold = p.low_stock_threshold || 5;
    if (total <= 0) return { label: 'Out of Stock', cls: 'bg-red-100 text-red-700 border-red-200' };
    if (total < 3) return { label: 'Critical', cls: 'bg-red-100 text-red-700 border-red-200 animate-pulse' };
    if (total <= threshold) return { label: 'Low', cls: 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse' };
    return { label: 'In Stock', cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/30">
      <Header
        title="Godown Management"
        subtitle="Manage branch-level stock, distribute inventory across godowns and track totals."
      />

      {toast && (
        <div
          className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl shadow-xl font-medium text-xs flex items-center gap-2 ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* ─── GODOWN CARDS ─── */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-brand-600" /> Godowns / Branches
          </h2>
          <button
            onClick={openAddGodown}
            className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Godown
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {godowns.length === 0 && !loading && (
            <div className="sm:col-span-2 xl:col-span-4 p-8 text-center text-gray-400 text-xs bg-white rounded-2xl border border-dashed border-gray-300">
              No godowns configured yet. Add one to start managing branch stock.
            </div>
          )}
          {godowns.map((g) => (
            <div
              key={g.id}
              className={`bg-white p-4 rounded-2xl border shadow-sm relative ${
                selectedGodown === g.id ? 'border-brand-500 ring-2 ring-brand-100' : 'border-gray-200/80'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-pink-50 rounded-xl text-brand-600">
                    <Warehouse className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      {g.name}
                      {!!g.is_default && (
                        <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5" /> DEFAULT
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-400 font-mono">{g.code || '—'}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                  g.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {g.status}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-gray-50 rounded-xl">
                  <p className="text-base font-bold text-gray-900">{g.total_stock || 0}</p>
                  <p className="text-[9px] font-semibold text-gray-400 uppercase">Units</p>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl">
                  <p className="text-base font-bold text-gray-900">{g.product_count || 0}</p>
                  <p className="text-[9px] font-semibold text-gray-400 uppercase">Products</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedGodown(selectedGodown === g.id ? 'all' : g.id)}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer transition ${
                      selectedGodown === g.id
                        ? 'bg-brand-600 text-white'
                        : 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                    }`}
                  >
                    View Stock
                  </button>
                  <button
                    onClick={() => openEditGodown(g)}
                    className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition cursor-pointer"
                    title="Edit Godown"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleGodownStatus(g)}
                    className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                    title={g.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteGodown(g)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Delete Godown"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ─── STOCK TABLE ─── */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-brand-600" /> Product Stock by Godown
              </h3>
              <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {totalCount} products
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search product, SKU, code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
              <select
                value={selectedGodown}
                onChange={(e) => setSelectedGodown(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
              >
                <option value="all">All Godowns</option>
                {godowns.map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
              <button
                onClick={loadData}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" /> Loading godown stock...
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-xs">
              <Warehouse className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No stock records found{selectedGodown !== 'all' ? ' for this godown' : ''}. Use "Add Stock" to distribute inventory.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200/80">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    {godowns.map((g) => (
                      <th key={g.id} className="px-4 py-3 font-semibold text-center">{g.name}</th>
                    ))}
                    <th className="px-4 py-3 font-semibold text-center">Total Stock</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => {
                    const status = getStockStatus(p);
                    return (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.primary_image || PRODUCT_PLACEHOLDER}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-gray-200 bg-white"
                            />
                            <div>
                              <p className="font-semibold text-gray-900">{p.title}</p>
                              <p className="text-[10px] text-gray-400 font-mono">SKU: {p.base_sku || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        {godowns.map((g) => (
                          <td key={g.id} className="px-4 py-3 text-center font-semibold text-gray-900">
                            {getStockFor(p, g.id)}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-center font-bold text-gray-900">{getTotalStock(p)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${status.cls}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openAdjust(p, 'add')}
                              className="px-2 py-1 text-[10px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition flex items-center gap-1 cursor-pointer"
                              title="Add stock to a godown"
                            >
                              <ArrowDownToLine className="w-3 h-3" /> Add Stock
                            </button>
                            <button
                              onClick={() => openAdjust(p, 'reduce')}
                              className="px-2 py-1 text-[10px] font-bold rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition flex items-center gap-1 cursor-pointer"
                              title="Reduce stock from a godown"
                            >
                              <ArrowUpFromLine className="w-3 h-3" /> Reduce
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <span className="text-sm font-medium text-gray-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── ADD / EDIT GODOWN MODAL ─── */}
      {godownModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-brand-400" />
                  {godownModal.editingId ? 'Edit Godown / Branch' : 'Add New Godown / Branch'}
                </h3>
                <p className="text-[11px] text-gray-400">Additional branches can be added anytime — the system scales.</p>
              </div>
              <button
                onClick={() => setGodownModal({ open: false, editingId: null, form: EMPTY_GODOWN })}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGodownSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Godown Name *</label>
                  <input
                    type="text"
                    required
                    value={godownModal.form.name}
                    onChange={(e) => setGodownModal({ ...godownModal, form: { ...godownModal.form, name: e.target.value } })}
                    placeholder="e.g. Godown 1"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Godown Code</label>
                  <input
                    type="text"
                    value={godownModal.form.code}
                    onChange={(e) => setGodownModal({ ...godownModal, form: { ...godownModal.form, code: e.target.value.toUpperCase() } })}
                    placeholder="e.g. GDN-3"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Address</label>
                <textarea
                  rows={2}
                  value={godownModal.form.address}
                  onChange={(e) => setGodownModal({ ...godownModal, form: { ...godownModal.form, address: e.target.value } })}
                  placeholder="Godown address..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={godownModal.form.city}
                    onChange={(e) => setGodownModal({ ...godownModal, form: { ...godownModal.form, city: e.target.value } })}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={godownModal.form.contact_person}
                    onChange={(e) => setGodownModal({ ...godownModal, form: { ...godownModal.form, contact_person: e.target.value } })}
                    placeholder="e.g. Store Manager"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={godownModal.form.phone}
                    onChange={(e) => setGodownModal({ ...godownModal, form: { ...godownModal.form, phone: e.target.value } })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <select
                    value={godownModal.form.status}
                    onChange={(e) => setGodownModal({ ...godownModal, form: { ...godownModal.form, status: e.target.value } })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={godownModal.form.is_default}
                  onChange={(e) => setGodownModal({ ...godownModal, form: { ...godownModal.form, is_default: e.target.checked } })}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                Default Godown / Branch
              </label>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={godownModal.form.notes}
                  onChange={(e) => setGodownModal({ ...godownModal, form: { ...godownModal.form, notes: e.target.value } })}
                  placeholder="Internal notes..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGodownModal({ open: false, editingId: null, form: EMPTY_GODOWN })}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 font-semibold text-gray-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={godownSubmitting}
                  className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {godownSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {godownModal.editingId ? 'Update Godown' : 'Create Godown'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── STOCK ADJUST MODAL ─── */}
      {adjustModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  {adjustModal.mode === 'add' ? (
                    <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ArrowUpFromLine className="w-4 h-4 text-red-400" />
                  )}
                  {adjustModal.mode === 'add' ? 'Add Stock to Godown' : 'Reduce Stock from Godown'}
                </h3>
                <p className="text-[11px] text-gray-400">
                  {adjustModal.product?.title} — SKU: {adjustModal.product?.base_sku || 'N/A'}
                </p>
              </div>
              <button
                onClick={() => setAdjustModal({ ...adjustModal, open: false })}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Select Godown / Branch *</label>
                <select
                  value={adjustModal.godownId || ''}
                  onChange={(e) => setAdjustModal({ ...adjustModal, godownId: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  {godowns.filter((g) => g.status === 'active').length === 0 && (
                    <option value="" disabled>No active godowns</option>
                  )}
                  {godowns.filter((g) => g.status === 'active').map((g) => (
                    <option key={g.id} value={g.id}>{g.name} ({g.code || '—'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustModal.qty}
                  onChange={(e) => setAdjustModal({ ...adjustModal, qty: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold text-base focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  {adjustModal.mode === 'reduce'
                    ? 'Reduction is blocked if it would make the godown stock negative.'
                    : 'Adds stock to the selected godown only. Total stock updates automatically.'}
                </p>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Reason / Reference (optional)</label>
                <input
                  type="text"
                  value={adjustModal.reason}
                  onChange={(e) => setAdjustModal({ ...adjustModal, reason: e.target.value })}
                  placeholder="e.g. New purchase order received"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModal({ ...adjustModal, open: false })}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 font-semibold text-gray-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustSubmitting}
                  className={`px-6 py-2 rounded-xl text-white font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50 ${
                    adjustModal.mode === 'add' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {adjustSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {adjustModal.mode === 'add' ? 'Add Stock' : 'Reduce Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
