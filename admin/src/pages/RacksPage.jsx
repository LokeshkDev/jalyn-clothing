import React, { useEffect, useState } from 'react';
import {
  Plus, Trash2, Loader2, Edit2, X, Search, Check, AlertCircle, Warehouse,
  Eye, Power, FileText
} from 'lucide-react';
import Header from '../components/Header';
import api from '../services/api';

const EMPTY_FORM = {
  name: '',
  code: '',
  description: '',
  status: 'active',
};

export default function RacksPage() {
  const [racks, setRacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  // View details
  const [viewRack, setViewRack] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadRacks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', 100);

      const res = await api.get(`/racks?${params.toString()}`);
      setRacks(res.data.racks || []);
    } catch (err) {
      showToast('Failed to load racks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadRacks(), 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (r) => {
    setEditingId(r.id);
    setForm({
      name: r.name || '',
      code: r.code || '',
      description: r.description || '',
      status: r.status || 'active',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/racks/${editingId}`, form);
        showToast('Rack updated successfully!');
      } else {
        await api.post('/racks', form);
        showToast('Rack created successfully!');
      }
      setModalOpen(false);
      loadRacks();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save rack', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (r) => {
    const next = r.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/racks/${r.id}/status`, { status: next });
      showToast(next === 'active' ? 'Rack activated.' : 'Rack deactivated.');
      loadRacks();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (r) => {
    if (!confirm(`Delete rack "${r.name}"?`)) return;
    try {
      await api.delete(`/racks/${r.id}`);
      showToast('Rack deleted.');
      if (viewRack?.id === r.id) setViewRack(null);
      loadRacks();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete rack', 'error');
    }
  };

  const activeCount = racks.filter((r) => r.status === 'active').length;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/30">
      <Header
        title="Rack Management"
        subtitle="Organize store racks, assign products and track rack-based storage."
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
        <div className="flex items-center gap-3 text-sm">
          <span className="px-3 py-1 bg-white border border-gray-200 rounded-full font-medium text-gray-700 shadow-sm flex items-center gap-2">
            <Warehouse className="w-4 h-4 text-gray-400" /> Racks: {racks.length}
          </span>
          <span className="px-3 py-1 bg-white border border-emerald-200 rounded-full font-medium text-emerald-700 shadow-sm">
            {activeCount} Active
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex flex-1 w-full items-center gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by rack name, code, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button
            onClick={openAdd}
            className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Rack
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" /> Loading racks...
            </div>
          ) : racks.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-xs">
              <Warehouse className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No racks found. Click "Add Rack" to create one.
            </div>
          ) : (
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200/80">
                <tr>
                  <th className="px-4 py-3 font-semibold">Rack</th>
                  <th className="px-4 py-3 font-semibold">Rack Code</th>
                  <th className="px-4 py-3 font-semibold">Description</th>
                  <th className="px-4 py-3 font-semibold">Products</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {racks.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3 font-semibold text-gray-900">{r.name}</td>
                    <td className="px-4 py-3">
                      {r.code ? (
                        <span className="font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded-lg text-[11px]">{r.code}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[280px] truncate">{r.description || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 text-blue-700 border border-blue-100 font-semibold px-2 py-0.5 rounded text-[11px]">
                        {r.product_count || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(r)}
                        className={`px-2 py-1 text-[10px] font-bold uppercase rounded tracking-wider flex items-center gap-1 cursor-pointer ${
                          r.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                        title={r.status === 'active' ? 'Click to deactivate' : 'Click to activate'}
                      >
                        <Power className="w-3 h-3" /> {r.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewRack(r)}
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition cursor-pointer"
                          title="Edit Rack"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete Rack"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ─── ADD / EDIT RACK MODAL ─── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-brand-400" />
                  {editingId ? 'Edit Rack' : 'Add New Rack'}
                </h3>
                <p className="text-[11px] text-gray-400">Rack details for store storage organization.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Rack Name / Number *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Rack A-1"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Rack Code</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. RACK-A1"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Location notes, capacity, assigned section..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 font-semibold text-gray-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Update Rack' : 'Create Rack'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── RACK DETAILS MODAL ─── */}
      {viewRack && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewRack(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-400" /> Rack Details
              </h3>
              <button onClick={() => setViewRack(null)} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-gray-900">{viewRack.name}</p>
                  <p className="font-mono text-[11px] text-gray-500">{viewRack.code || 'No code'}</p>
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${
                  viewRack.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {viewRack.status}
                </span>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1">
                  <FileText className="w-3 h-3" /> Description
                </p>
                <p className="font-medium text-gray-800 mt-1">{viewRack.description || '—'}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Products</p>
                  <p className="font-semibold text-gray-800 mt-1">{viewRack.product_count || 0} assigned</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Created</p>
                  <p className="font-semibold text-gray-800 mt-1">{new Date(viewRack.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setViewRack(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 font-semibold text-gray-600 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => { openEdit(viewRack); setViewRack(null); }}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold cursor-pointer"
                >
                  Edit Rack
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
