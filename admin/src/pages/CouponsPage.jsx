import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import api from '../services/api';
import {
  BadgePercent, Plus, Search, RefreshCw, Loader2, Edit, Trash2,
  Check, AlertCircle, Sparkles, Wallet, Clock, Archive, X, Copy, Zap,
  CheckCircle2,
} from 'lucide-react';

const DISCOUNT_TYPES = { percent: 'Percentage', flat: 'Flat (₹)' };

const fmtDate = (val) => {
  if (!val) return '—';
  const d = new Date(String(val).slice(0, 10));
  if (isNaN(d)) return val;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const fmtINR = (v) => '₹' + Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const offerLabel = (c) => {
  if (c.discount_type === 'flat') return `${fmtINR(c.discount_value)} OFF`;
  return `${c.discount_value}% OFF`;
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const [showForm, setShowForm] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const emptyForm = {
    code: '',
    title: '',
    description: '',
    discount_type: 'percent',
    discount_value: '',
    min_amount: '',
    max_discount: '',
    expires_at: '',
    usage_limit: '',
    is_active: true,
  };
  const [form, setForm] = useState(emptyForm);

  const emptyGen = {
    prefix: 'JALYN',
    count: 5,
    title: '',
    description: '',
    discount_type: 'percent',
    discount_value: '',
    min_amount: '',
    max_discount: '',
    expires_at: '',
    usage_limit: '',
    is_active: true,
  };
  const [genForm, setGenForm] = useState(emptyGen);
  const [generatedCodes, setGeneratedCodes] = useState([]);
  const [copiedCode, setCopiedCode] = useState(null);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons/all');
      setCoupons(res.data?.coupons || []);
    } catch (err) {
      showToast('Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      code: c.code || '',
      title: c.title || '',
      description: c.description || '',
      discount_type: c.discount_type || 'percent',
      discount_value: c.discount_value ?? '',
      min_amount: c.min_amount ?? '',
      max_discount: c.max_discount ?? '',
      expires_at: c.expires_at || '',
      usage_limit: c.usage_limit ?? '',
      is_active: !!c.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        discount_value: Number(form.discount_value) || 0,
        min_amount: Number(form.min_amount) || 0,
        max_discount: form.max_discount === '' ? null : Number(form.max_discount),
        usage_limit: Number(form.usage_limit) || 0,
      };
      if (editingId) {
        const res = await api.put(`/coupons/${editingId}`, payload);
        showToast(res.data?.message || 'Coupon updated successfully.');
      } else {
        const res = await api.post('/coupons', payload);
        showToast(res.data?.message || 'Coupon created successfully.');
      }
      setShowForm(false);
      loadCoupons();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save coupon', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setBusy(true);
    setGeneratedCodes([]);
    try {
      const res = await api.post('/coupons/generate', {
        ...genForm,
        discount_value: Number(genForm.discount_value) || 0,
        min_amount: Number(genForm.min_amount) || 0,
        max_discount: genForm.max_discount === '' ? null : Number(genForm.max_discount),
        usage_limit: Number(genForm.usage_limit) || 0,
      });
      const codes = res.data?.codes || [];
      setGeneratedCodes(codes);
      showToast(res.data?.message || 'Coupons generated successfully.');
      loadCoupons();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate coupons', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = async (c) => {
    try {
      await api.put(`/coupons/${c.id}`, { is_active: !c.is_active });
      setCoupons((prev) => prev.map((x) => (x.id === c.id ? { ...x, is_active: !x.is_active } : x)));
      showToast(c.is_active ? 'Coupon deactivated.' : 'Coupon activated.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update coupon', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon permanently?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      setCoupons((prev) => prev.filter((c) => String(c.id) !== String(id)));
      showToast('Coupon deleted.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete coupon', 'error');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (c) => c.expires_at && new Date(c.expires_at + 'T23:59:59') < new Date();
  const isExhausted = (c) => c.usage_limit > 0 && c.used_count >= c.usage_limit;

  const kpis = useMemo(() => {
    const active = coupons.filter((c) => c.is_active && !isExpired(c) && !isExhausted(c)).length;
    const inactive = coupons.filter((c) => !c.is_active).length;
    const expired = coupons.filter((c) => c.is_active && (isExpired(c) || isExhausted(c))).length;
    const used = coupons.reduce((s, c) => s + (c.used_count || 0), 0);
    return { active, inactive, expired, used };
  }, [coupons]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return coupons.filter((c) => {
      const matchesSearch =
        !q ||
        (c.code || '').toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q);
      let matchesFilter = true;
      if (filter === 'active') matchesFilter = c.is_active && !isExpired(c) && !isExhausted(c);
      if (filter === 'inactive') matchesFilter = !c.is_active;
      if (filter === 'expired') matchesFilter = c.is_active && (isExpired(c) || isExhausted(c));
      return matchesSearch && matchesFilter;
    });
  }, [coupons, search, filter]);

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Coupon Code Manager" subtitle="Generate, create, and manage promo codes that reflect live on checkout and PDP offers." />

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-pink-50 rounded-xl text-brand-600"><BadgePercent className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Coupons</p>
              <p className="text-xl font-bold text-gray-900">{coupons.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Check className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Live & Active</p>
              <p className="text-xl font-bold text-emerald-600">{kpis.active}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600"><Clock className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Expired / Exhausted</p>
              <p className="text-xl font-bold text-amber-600">{kpis.expired}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Wallet className="w-5 h-5" /></div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Used</p>
              <p className="text-xl font-bold text-purple-600">{kpis.used}</p>
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
                placeholder="Search code, title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 bg-white shadow-sm"
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-brand-500 shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Live & Active</option>
              <option value="inactive">Disabled</option>
              <option value="expired">Expired / Exhausted</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadCoupons}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 transition shadow-sm"
              title="Refresh Coupons"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setShowGenerate(true); }}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4" /> Generate Codes
            </button>
            <button
              onClick={openAdd}
              className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Coupon
            </button>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" /> Loading coupons...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-xs">
              {coupons.length === 0 ? 'No coupons yet. Generate or add your first promo code.' : 'No coupons match your current search / filter.'}
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Offer</th>
                  <th className="py-3.5 px-4">Requirements</th>
                  <th className="py-3.5 px-4">Expiry</th>
                  <th className="py-3.5 px-4">Usage</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filtered.map((c) => {
                  const expired = isExpired(c);
                  const exhausted = isExhausted(c);
                  return (
                    <tr key={c.id} className="hover:bg-pink-50/40 transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-brand-700 bg-brand-50 border border-brand-100 px-2 py-1 rounded-lg">{c.code}</span>
                          <button
                            onClick={() => copyCode(c.code)}
                            className="p-1 rounded-md text-gray-400 hover:text-brand-600"
                            title="Copy code"
                          >
                            {copiedCode === c.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-900">{c.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1 max-w-[220px]">{c.description}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.discount_type === 'flat' ? 'bg-pink-100 text-pink-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {offerLabel(c)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p>Min order: <span className="font-bold text-gray-900">{fmtINR(c.min_amount)}</span></p>
                        {c.max_discount != null && (
                          <p className="text-[11px] text-gray-400">Cap: {fmtINR(c.max_discount)}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={expired ? 'text-red-600 font-bold' : 'text-gray-700'}>
                          {fmtDate(c.expires_at)}
                        </span>
                        {expired && <p className="text-[10px] text-red-500 font-bold">Expired</p>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={exhausted ? 'text-amber-600 font-bold' : 'text-gray-700'}>
                          {c.used_count} / {c.usage_limit > 0 ? c.usage_limit : '∞'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggle(c)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1.5 cursor-pointer transition ${
                            c.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                          }`}
                          title={c.is_active ? 'Click to disable' : 'Click to enable'}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${c.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {c.is_active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(c)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-brand-600 hover:bg-pink-100 transition"
                            title="Edit Coupon"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete Coupon"
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

      {/* ─── ADD / EDIT COUPON MODAL ─── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <BadgePercent className="w-4 h-4 text-brand-400" />
                  {editingId ? 'Edit Coupon' : 'Add New Coupon'}
                </h3>
                <p className="text-[10px] text-gray-400">Configure the promo code that appears on checkout & PDP offers.</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. JALYN20"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold uppercase focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Offer Title *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Festive 20% OFF"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="e.g. Instant 20% OFF on orders above ₹1999"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Discount Type</label>
                  <select
                    value={form.discount_type}
                    onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  >
                    {Object.entries(DISCOUNT_TYPES).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    {form.discount_type === 'flat' ? 'Flat Value (₹) *' : 'Discount % *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={form.discount_value}
                    onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                    placeholder={form.discount_type === 'flat' ? '200' : '10'}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.min_amount}
                    onChange={(e) => setForm({ ...form, min_amount: e.target.value })}
                    placeholder="999"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Max Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.max_discount}
                    onChange={(e) => setForm({ ...form, max_discount: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="0"
                    value={form.usage_limit}
                    onChange={(e) => setForm({ ...form, usage_limit: e.target.value })}
                    placeholder="0 = Unlimited"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Status</label>
                  <label className="flex items-center justify-between px-3 py-2 rounded-xl border border-gray-300 bg-white cursor-pointer">
                    <span className="font-semibold text-gray-700">Active Now</span>
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="h-4 w-4 text-brand-600 rounded"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
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
                  {editingId ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── GENERATE COUPONS MODAL ─── */}
      {showGenerate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" /> Generate Coupon Codes
                </h3>
                <p className="text-[10px] text-gray-400">Bulk-generate unique promo codes with shared offer settings.</p>
              </div>
              <button
                onClick={() => { setShowGenerate(false); setGeneratedCodes([]); }}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {generatedCodes.length > 0 ? (
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-800">Generated {generatedCodes.length} unique coupon code(s)!</p>
                    <p className="text-[11px] text-emerald-700">They are now live and will appear on the website.</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {generatedCodes.map((code) => (
                    <button
                      key={code}
                      onClick={() => copyCode(code)}
                      className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 hover:border-brand-300 hover:bg-pink-50 transition font-mono font-bold text-[11px] text-brand-700"
                      title="Click to copy"
                    >
                      {code}
                      {copiedCode === code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={() => { setShowGenerate(false); setGeneratedCodes([]); }}
                    className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerate} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <h4 className="font-bold text-purple-900 text-xs flex items-center gap-1.5 mb-1">
                    <Zap className="w-4 h-4 text-purple-600" /> Bulk Code Generator
                  </h4>
                  <p className="text-[11px] text-purple-700">
                    Generates N unique codes like <span className="font-mono font-bold">JALYN-XXXX-XXXX</span> with identical discount settings.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Prefix</label>
                    <input
                      type="text"
                      value={genForm.prefix}
                      onChange={(e) => setGenForm({ ...genForm, prefix: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                      placeholder="JALYN"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">How Many? *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="100"
                      value={genForm.count}
                      onChange={(e) => setGenForm({ ...genForm, count: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Discount Type</label>
                    <select
                      value={genForm.discount_type}
                      onChange={(e) => setGenForm({ ...genForm, discount_type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                    >
                      {Object.entries(DISCOUNT_TYPES).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      {genForm.discount_type === 'flat' ? 'Flat Value (₹) *' : 'Discount % *'}
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={genForm.discount_value}
                      onChange={(e) => setGenForm({ ...genForm, discount_value: e.target.value })}
                      placeholder={genForm.discount_type === 'flat' ? '200' : '10'}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Offer Title (optional)</label>
                  <input
                    type="text"
                    value={genForm.title}
                    onChange={(e) => setGenForm({ ...genForm, title: e.target.value })}
                    placeholder="Auto-generated if left empty"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Description (optional)</label>
                  <input
                    type="text"
                    value={genForm.description}
                    onChange={(e) => setGenForm({ ...genForm, description: e.target.value })}
                    placeholder="Auto-generated if left empty"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Min Order (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={genForm.min_amount}
                      onChange={(e) => setGenForm({ ...genForm, min_amount: e.target.value })}
                      placeholder="999"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Max Discount (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={genForm.max_discount}
                      onChange={(e) => setGenForm({ ...genForm, max_discount: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={genForm.expires_at}
                      onChange={(e) => setGenForm({ ...genForm, expires_at: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Usage Limit</label>
                    <input
                      type="number"
                      min="0"
                      value={genForm.usage_limit}
                      onChange={(e) => setGenForm({ ...genForm, usage_limit: e.target.value })}
                      placeholder="0 = Unlimited"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Status</label>
                    <label className="flex items-center justify-between px-3 py-2 rounded-xl border border-gray-300 bg-white cursor-pointer">
                      <span className="font-semibold text-gray-700">Active</span>
                      <input
                        type="checkbox"
                        checked={genForm.is_active}
                        onChange={(e) => setGenForm({ ...genForm, is_active: e.target.checked })}
                        className="h-4 w-4 text-brand-600 rounded"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGenerate(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition"
                  >
                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    Generate Codes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}