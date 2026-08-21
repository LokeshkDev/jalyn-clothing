import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import BarcodePrintModal from '../components/BarcodePrintModal';
import BarcodeLabel from '../components/BarcodeLabel';
import api from '../services/api';
import { generateBarcodeSVG } from '../utils/barcodeEncoder';
import { BARCODE_LABEL_CONFIG } from '../utils/barcodeLabelConfig';
import { PRODUCT_PLACEHOLDER } from '../utils/placeholder';
import {
  Search, Filter, Printer, Download, RefreshCw, Loader2, Check, AlertCircle,
  Eye, RotateCcw, X, ChevronLeft, ChevronRight, Package, Tag, Barcode
} from 'lucide-react';

export default function BarcodesPage() {
  const [barcodes, setBarcodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Preview modal
  const [previewBarcode, setPreviewBarcode] = useState(null);

  // Print modal
  const [printModal, setPrintModal] = useState({ open: false, barcodes: [] });

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Generate modal
  const [generateModal, setGenerateModal] = useState({ open: false, productId: null, loading: false });

  const loadBarcodes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', page);
      params.append('limit', 20);
      
      const response = await api.get(`/barcodes?${params.toString()}`);
      setBarcodes(response.data.data || []);
      setTotalPages(response.data.pagination?.total ? Math.ceil(response.data.pagination.total / 20) : 1);
      setTotalCount(response.data.pagination?.total || 0);
    } catch (err) {
      showToast('Failed to load barcodes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBarcodes();
  }, [page, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page !== 1) {
        setPage(1);
      } else {
        loadBarcodes();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRegenerate = async (barcodeId) => {
    if (!window.confirm('Regenerate this barcode? The old barcode will be deactivated.')) return;
    try {
      await api.post(`/barcodes/regenerate/${barcodeId}`);
      showToast('Barcode regenerated successfully');
      loadBarcodes();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to regenerate', 'error');
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Are you sure you want to permanently delete ${ids.length} selected barcode(s)?`)) return;
    try {
      await api.post('/barcodes/bulk-delete', { ids });
      showToast(`Successfully deleted ${ids.length} barcode(s)`);
      setSelectedIds(new Set());
      loadBarcodes();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete barcodes', 'error');
    }
  };

  const handleSingleDelete = async (barcodeId) => {
    if (!window.confirm('Are you sure you want to delete this barcode?')) return;
    try {
      await api.delete(`/barcodes/${barcodeId}`);
      showToast('Barcode deleted successfully');
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.delete(barcodeId);
        return next;
      });
      loadBarcodes();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete barcode', 'error');
    }
  };

  const handleBulkPrint = () => {
    const selected = barcodes.filter(b => selectedIds.has(b.id));
    if (selected.length === 0) {
      showToast('Select at least one barcode to print', 'error');
      return;
    }
    setPrintModal({
      open: true,
      barcodes: selected.map(b => ({
        barcode: b.barcode,
        productName: b.product_title || b.productName || 'Product',
        color: b.color,
        size: b.size,
        price: b.product_price || null,
        productImage: b.primary_image || null
      }))
    });
  };

  const handleSinglePrint = (b) => {
    setPrintModal({
      open: true,
      barcodes: [{
        barcode: b.barcode,
        productName: b.product_title || 'Product',
        color: b.color,
        size: b.size,
        price: b.product_price || null,
        productImage: b.primary_image || null
      }]
    });
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === barcodes.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(barcodes.map(b => b.id)));
  };

  const activeCount = barcodes.filter(b => b.status === 'active').length;
  const inactiveCount = barcodes.filter(b => b.status === 'inactive').length;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/30">
      <Header
        title="Barcode Management"
        subtitle="Manage inventory barcodes, regenerate codes, and print physical labels."
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex flex-1 w-full items-center gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by barcode, product name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <button
              onClick={loadBarcodes}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={handleBulkPrint}
                  className="px-3.5 py-2 bg-[#2A1A22] hover:bg-[#3D2631] text-white rounded-xl shadow-xs flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-pink-300" />
                  Print Selected ({selectedIds.size})
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 text-xs font-bold transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Bulk Delete ({selectedIds.size})
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <span className="px-3 py-1 bg-white border border-gray-200 rounded-full font-medium text-gray-700 shadow-sm flex items-center gap-2">
            <Barcode className="w-4 h-4 text-gray-400"/>
            Total: {totalCount}
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200/80">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={barcodes.length > 0 && selectedIds.size === barcodes.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Variant</th>
                  <th className="px-4 py-3 font-semibold">Barcode</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-600 mb-3" />
                      Loading barcodes...
                    </td>
                  </tr>
                ) : barcodes.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Barcode className="w-8 h-8 text-gray-300" />
                        <p>No barcodes found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  barcodes.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(b.id)}
                          onChange={() => toggleSelect(b.id)}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500 w-4 h-4 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.primary_image || PRODUCT_PLACEHOLDER}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-gray-200 bg-white"
                          />
                          <span className="font-medium text-gray-900 truncate max-w-[200px]">
                            {b.product_title || 'Unknown Product'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          {b.is_primary ? (
                            <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase rounded w-max">
                              Primary
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-gray-700">
                              <span
                                className="w-3 h-3 rounded-full border border-gray-300 shadow-sm"
                                style={{ backgroundColor: b.color?.toLowerCase() || '#ccc' }}
                                title={b.color}
                              />
                              <span className="font-medium">{b.size}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Barcode className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-gray-900 font-medium bg-gray-100 px-2 py-1 rounded-lg text-xs">{b.barcode}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">
                          CODE128
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded tracking-wider ${
                          b.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {b.status || 'inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreviewBarcode(b)}
                            className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition cursor-pointer"
                            title="Preview Label"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSinglePrint(b)}
                            className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition cursor-pointer"
                            title="Print Label"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRegenerate(b.id)}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                            title="Regenerate Barcode"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSingleDelete(b.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete Barcode"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <span className="text-sm font-medium text-gray-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {previewBarcode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-heading font-bold text-gray-900 text-lg flex items-center gap-2">
                <Barcode className="w-5 h-5 text-brand-600" /> Label Preview
              </h3>
              <button onClick={() => setPreviewBarcode(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 flex justify-center items-center bg-gray-100/50">
              <div className="bg-white shadow-md border border-gray-200" style={{ width: '50mm', height: '25mm' }}>
                <BarcodeLabel
                  barcode={previewBarcode.barcode}
                  productName={previewBarcode.product_title || 'Product'}
                  color={previewBarcode.color}
                  size={previewBarcode.size}
                  price={previewBarcode.product_price || null}
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
              <button
                onClick={() => setPreviewBarcode(null)}
                className="px-4 py-2 font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleSinglePrint(previewBarcode);
                  setPreviewBarcode(null);
                }}
                className="px-4 py-2 font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Label
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {printModal.open && (
        <BarcodePrintModal
          isOpen={printModal.open}
          barcodes={printModal.barcodes}
          onClose={() => setPrintModal({ open: false, barcodes: [] })}
        />
      )}
    </div>
  );
}
