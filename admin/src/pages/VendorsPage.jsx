import React, { useEffect, useState, useMemo } from 'react';
import {
  Plus, Trash2, Loader2, Edit2, X, Search, Check, AlertCircle, Handshake,
  Eye, Power, Mail, Phone, MapPin, FileText, ShoppingBag, Package, Globe,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import Header from '../components/Header';
import api from '../services/api';
import { PRODUCT_PLACEHOLDER } from '../utils/placeholder';

const EMPTY_FORM = {
  name: '',
  company_name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  gst_number: '',
  notes: '',
  status: 'active',
};

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // View details
  const [viewVendor, setViewVendor] = useState(null);

  // Vendor products modal
  const [productsModal, setProductsModal] = useState({
    open: false, vendor: null, products: [], loading: false,
    search: '', status: 'all', page: 1, totalPages: 1, total: 0,
  });

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadVendors = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('limit', 100);

      const res = await api.get(`/vendors?${params.toString()}`);
      setVendors(res.data.vendors || []);
    } catch (err) {
      showToast('Failed to load vendors', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => loadVendors(), 250);
    return () => clearTimeout(timer);
  }, [search, statusFilter]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setModalOpen(true);
  };

  const openEdit = (v) => {
    setEditingId(v.id);
    setForm({
      name: v.name || '',
      company_name: v.company_name || '',
      phone: v.phone || '',
      email: v.email || '',
      address: v.address || '',
      city: v.city || '',
      state: v.state || '',
      pincode: v.pincode || '',
      gst_number: v.gst_number || '',
      notes: v.notes || '',
      status: v.status || 'active',
    });
    setFieldErrors({});
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFieldErrors({});

    try {
      if (editingId) {
        await api.put(`/vendors/${editingId}`, form);
        showToast('Vendor updated successfully!');
      } else {
        await api.post('/vendors', form);
        showToast('Vendor created successfully!');
      }
      setModalOpen(false);
      loadVendors();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save vendor';
      if (err.response?.status === 400) {
        setFieldErrors({ general: msg });
      }
      showToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (v) => {
    const next = v.status === 'active' ? 'inactive' : 'active';
    try {
      await api.patch(`/vendors/${v.id}/status`, { status: next });
      showToast(next === 'active' ? 'Vendor activated.' : 'Vendor deactivated.');
      loadVendors();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const handleDelete = async (v) => {
    if (!confirm(`Delete vendor "${v.name}"? Products assigned to this vendor will keep their data.`)) return;
    try {
      await api.delete(`/vendors/${v.id}`);
      showToast('Vendor deleted.');
      if (viewVendor?.id === v.id) setViewVendor(null);
      loadVendors();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete vendor', 'error');
    }
  };

  const openVendorProducts = (v) => {
    setProductsModal({
      open: true, vendor: v, products: [], loading: true,
      search: '', status: 'all', page: 1, totalPages: 1, total: 0,
    });
  };

  const loadVendorProducts = async (v, filters = {}) => {
    setProductsModal((m) => ({ ...m, ...filters, loading: true }));
    try {
      const params = new URLSearchParams();
      const searchVal = filters.search !== undefined ? filters.search : productsModal.search;
      const statusVal = filters.status !== undefined ? filters.status : productsModal.status;
      const pageVal = filters.page !== undefined ? filters.page : productsModal.page;
      if (searchVal) params.append('search', searchVal);
      if (statusVal !== 'all') params.append('status', statusVal);
      params.append('page', pageVal);
      params.append('limit', 25);

      const res = await api.get(`/vendors/${v.id}/products?${params.toString()}`);
      setProductsModal((m) => ({
        ...m,
        products: res.data.products || [],
        loading: false,
        total: res.data.pagination?.total || 0,
        totalPages: Math.ceil((res.data.pagination?.total || 0) / 25),
        search: searchVal,
        status: statusVal,
        page: pageVal,
      }));
    } catch (err) {
      setProductsModal((m) => ({ ...m, loading: false }));
      showToast('Failed to load vendor products', 'error');
    }
  };

  useEffect(() => {
    if (productsModal.open && productsModal.vendor) {
      const timer = setTimeout(() => loadVendorProducts(productsModal.vendor), 250);
      return () => clearTimeout(timer);
    }
  }, [productsModal.open, productsModal.vendor, productsModal.search, productsModal.status, productsModal.page]);

  const activeCount = vendors.filter((v) => v.status === 'active').length;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/30">
      <Header
        title="Vendor Management"
        subtitle="Manage suppliers, businesses and vendor relationships for the Jalyn catalog."
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
            <Handshake className="w-4 h-4 text-gray-400" /> Vendors: {vendors.length}
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
                placeholder="Search by name, company, email, phone, GST..."
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
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" /> Loading vendors...
            </div>
          ) : vendors.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-xs">
              <Handshake className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No vendors found. Click "Add Vendor" to create one.
            </div>
          ) : (
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200/80">
                <tr>
                  <th className="px-4 py-3 font-semibold">Vendor</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">GST Number</th>
                  <th className="px-4 py-3 font-semibold">Products</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vendors.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{v.name}</p>
                      <p className="text-[10px] text-gray-400">{v.company_name || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-gray-600">
                          <Mail className="w-3 h-3 text-gray-400" /> {v.email || '—'}
                        </span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <Phone className="w-3 h-3 text-gray-400" /> {v.phone || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {[v.city, v.state].filter(Boolean).join(', ') || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-gray-700">{v.gst_number || '—'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openVendorProducts(v)}
                        className="bg-blue-50 text-blue-700 border border-blue-100 font-semibold px-2 py-0.5 rounded text-[11px] hover:bg-blue-100 transition flex items-center gap-1 cursor-pointer"
                        title={`View ${v.product_count || 0} product(s) supplied by this vendor`}
                      >
                        <Package className="w-3 h-3" /> {v.product_count || 0} Products
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(v)}
                        className={`px-2 py-1 text-[10px] font-bold uppercase rounded tracking-wider flex items-center gap-1 cursor-pointer ${
                          v.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                        title={v.status === 'active' ? 'Click to deactivate' : 'Click to activate'}
                      >
                        <Power className="w-3 h-3" /> {v.status}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(v.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewVendor(v)}
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEdit(v)}
                          className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition cursor-pointer"
                          title="Edit Vendor"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(v)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete Vendor"
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

      {/* ─── ADD / EDIT VENDOR MODAL ─── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-brand-400" />
                  {editingId ? 'Edit Vendor' : 'Add New Vendor'}
                </h3>
                <p className="text-[11px] text-gray-400">Vendor information used across the Jalyn catalog.</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {fieldErrors.general && (
                <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-700 font-semibold text-[11px]">
                  {fieldErrors.general}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Company / Business Name</label>
                  <input
                    type="text"
                    value={form.company_name}
                    onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                    placeholder="e.g. Rajesh Textiles Pvt Ltd"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="e.g. vendor@example.com"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Address</label>
                <textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, area, landmark..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="e.g. Surat"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="e.g. Gujarat"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '') })}
                    placeholder="e.g. 395006"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">GST Number</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={form.gst_number}
                    onChange={(e) => setForm({ ...form, gst_number: e.target.value.toUpperCase() })}
                    placeholder="e.g. 24AAAAA0000A1Z5"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-medium focus:ring-2 focus:ring-brand-500 uppercase"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Valid GSTIN format: 22AAAAA0000A1Z5</p>
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
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Payment terms, lead times, special instructions..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                />
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
                  {editingId ? 'Update Vendor' : 'Create Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── VENDOR DETAILS MODAL ─── */}
      {viewVendor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setViewVendor(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-400" /> Vendor Details
              </h3>
              <button onClick={() => setViewVendor(null)} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-bold text-gray-900">{viewVendor.name}</p>
                  <p className="text-[11px] text-gray-500">{viewVendor.company_name || 'No company'}</p>
                </div>
                <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${
                  viewVendor.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}>
                  {viewVendor.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
                  <p className="font-semibold text-gray-800 mt-1 break-all">{viewVendor.email || '—'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Phone className="w-3 h-3" /> Phone</p>
                  <p className="font-semibold text-gray-800 mt-1">{viewVendor.phone || '—'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 sm:col-span-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><MapPin className="w-3 h-3" /> Address</p>
                  <p className="font-semibold text-gray-800 mt-1">
                    {[viewVendor.address, viewVendor.city, viewVendor.state, viewVendor.pincode].filter(Boolean).join(', ') || '—'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><FileText className="w-3 h-3" /> GST Number</p>
                  <p className="font-mono font-semibold text-gray-800 mt-1">{viewVendor.gst_number || '—'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1"><Handshake className="w-3 h-3" /> Products</p>
                  <p className="font-semibold text-gray-800 mt-1">{viewVendor.product_count || 0} assigned</p>
                </div>
                {viewVendor.notes && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 sm:col-span-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Notes</p>
                    <p className="font-medium text-gray-800 mt-1">{viewVendor.notes}</p>
                  </div>
                )}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Created</p>
                  <p className="font-semibold text-gray-800 mt-1">{new Date(viewVendor.created_at).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Last Updated</p>
                  <p className="font-semibold text-gray-800 mt-1">{new Date(viewVendor.updated_at).toLocaleString()}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setViewVendor(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 font-semibold text-gray-600 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => { openEdit(viewVendor); setViewVendor(null); }}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold cursor-pointer"
                >
                  Edit Vendor
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── VENDOR PRODUCTS TABLE MODAL ─── */}
      {productsModal.open && productsModal.vendor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setProductsModal((m) => ({ ...m, open: false }))}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-brand-400" />
                  Products — {productsModal.vendor.name}
                </h3>
                <p className="text-[11px] text-gray-400">
                  {productsModal.vendor.company_name || 'Vendor'} · {productsModal.total} product(s) supplied
                </p>
              </div>
              <button
                onClick={() => setProductsModal((m) => ({ ...m, open: false }))}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search product, SKU, code..."
                  value={productsModal.search}
                  onChange={(e) => setProductsModal((m) => ({ ...m, search: e.target.value, page: 1 }))}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                />
              </div>
              <select
                value={productsModal.status}
                onChange={(e) => setProductsModal((m) => ({ ...m, status: e.target.value, page: 1 }))}
                className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex-1 overflow-y-auto">
              {productsModal.loading ? (
                <div className="p-12 text-center text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" /> Loading products...
                </div>
              ) : productsModal.products.length === 0 ? (
                <div className="p-12 text-center text-gray-500 text-xs">
                  <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  No products assigned to this vendor yet. Assign products from the product add/edit form (Vendor dropdown).
                </div>
              ) : (
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-gray-50 text-gray-600 border-b border-gray-200/80">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Product / SKU</th>
                      <th className="px-4 py-3 font-semibold">Category</th>
                      <th className="px-4 py-3 font-semibold">Price</th>
                      <th className="px-4 py-3 font-semibold">Stock</th>
                      <th className="px-4 py-3 font-semibold">Channels</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {productsModal.products.map((p) => {
                      const isLow = (p.stock || 0) <= (p.low_stock_threshold || 5);
                      const isCritical = (p.stock || 0) < 3;
                      return (
                        <tr key={p.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.primary_image || PRODUCT_PLACEHOLDER}
                                alt=""
                                className="w-10 h-10 rounded-xl object-cover border border-gray-200 bg-white shrink-0"
                              />
                              <div>
                                <p className="font-semibold text-gray-900">{p.title}</p>
                                <p className="text-[10px] text-gray-400 font-mono">SKU: {p.base_sku || 'N/A'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[10px] font-medium capitalize">
                              {p.category_slug}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            ₹{p.price}
                            {p.original_price > p.price && (
                              <span className="text-[10px] text-gray-400 line-through ml-1.5 font-normal">₹{p.original_price}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isCritical
                                ? 'bg-red-100 text-red-700'
                                : isLow
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {p.stock || 0} in stock
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {p.is_online !== 0 && (
                                <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5">
                                  <Globe className="w-2.5 h-2.5" /> Online
                                </span>
                              )}
                              {p.is_offline !== 0 && (
                                <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-bold">
                                  Store
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                              p.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {p.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-500 text-xs">
                            {new Date(p.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {productsModal.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50/50">
                <span className="text-[11px] font-medium text-gray-500">
                  Page {productsModal.page} of {productsModal.totalPages} · {productsModal.total} products
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={productsModal.page === 1}
                    onClick={() => setProductsModal((m) => ({ ...m, page: m.page - 1 }))}
                    className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={productsModal.page === productsModal.totalPages}
                    onClick={() => setProductsModal((m) => ({ ...m, page: m.page + 1 }))}
                    className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
