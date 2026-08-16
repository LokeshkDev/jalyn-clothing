import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import api from '../services/api';
import {
  Search, Filter, Clock, Package, ArrowDown, ArrowUp, Loader2,
  ChevronLeft, ChevronRight, Barcode, User, FileText, RefreshCw
} from 'lucide-react';
import { PRODUCT_PLACEHOLDER } from '../utils/placeholder';

export default function StockHistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all', 'barcode_scan', 'Offline Sale', 'Stock Added', 'Adjustment'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sourceFilter !== 'all') params.append('source', sourceFilter);
      params.append('page', page);
      params.append('limit', 25);
      
      const response = await api.get(`/barcodes/stock-history?${params.toString()}`);
      setTransactions(response.data.data || []);
      setTotalPages(response.data.pagination?.total ? Math.ceil(response.data.pagination.total / 25) : 1);
    } catch (err) {
      console.error('Failed to load stock history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [page, sourceFilter]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + 
      ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getSourceBadge = (source) => {
    const s = source || '';
    if (s === 'barcode_scan' || s === 'stock_deduction') {
      return <span className="px-2.5 py-1 bg-purple-100 text-purple-800 text-[10px] font-bold rounded uppercase tracking-wider">{s.replace('_', ' ')}</span>;
    }
    if (s === 'Offline Sale') {
      return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded uppercase tracking-wider">{s}</span>;
    }
    if (s === 'Stock Added') {
      return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase tracking-wider">{s}</span>;
    }
    if (s === 'Adjustment') {
      return <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold rounded uppercase tracking-wider">{s}</span>;
    }
    return <span className="px-2.5 py-1 bg-gray-100 text-gray-800 text-[10px] font-bold rounded uppercase tracking-wider">{s || 'Unknown'}</span>;
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/30">
      <Header
        title="Stock History"
        subtitle="Audit trail of all inventory transactions and barcode scans."
      />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex flex-1 w-full items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={sourceFilter}
                onChange={e => {
                  setSourceFilter(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white"
              >
                <option value="all">All Sources</option>
                <option value="barcode_scan">Barcode Scan</option>
                <option value="Offline Sale">Offline Sale</option>
                <option value="Stock Added">Stock Added</option>
                <option value="Adjustment">Adjustment</option>
              </select>
            </div>
            
            <button
              onClick={loadHistory}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition shadow-sm cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200/80">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date / Time</th>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Variant</th>
                  <th className="px-4 py-3 font-semibold">Barcode</th>
                  <th className="px-4 py-3 font-semibold text-right">Before</th>
                  <th className="px-4 py-3 font-semibold text-center">Change</th>
                  <th className="px-4 py-3 font-semibold text-right">After</th>
                  <th className="px-4 py-3 font-semibold">Source</th>
                  <th className="px-4 py-3 font-semibold">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-12 text-center text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-600 mb-3" />
                      Loading history...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-4 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Clock className="w-8 h-8 text-gray-300" />
                        <p>No transactions found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  transactions.map((t, idx) => {
                    const change = t.stock_after - t.stock_before;
                    return (
                      <tr key={t.id || idx} className="hover:bg-gray-50/50 transition">
                        <td className="px-4 py-3 text-gray-500 text-xs font-medium">
                          {formatDate(t.created_at || t.timestamp)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={t.primary_image || PRODUCT_PLACEHOLDER}
                              alt=""
                              className="w-10 h-10 rounded-xl object-cover border border-gray-200 bg-white"
                            />
                            <span className="font-medium text-gray-900 truncate max-w-[150px]">
                              {t.product_title || t.product_name || 'Unknown Product'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs font-medium">
                          {t.variant_sku || (t.color ? `${t.color} / ${t.size}` : '-')}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded-lg text-xs">{t.barcode || '-'}</span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600 font-medium">
                          {t.stock_before}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`font-bold inline-flex items-center gap-1 ${change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-600' : 'text-gray-400'}`}>
                            {change > 0 ? <ArrowUp className="w-3 h-3" /> : change < 0 ? <ArrowDown className="w-3 h-3" /> : null}
                            {change > 0 ? `+${change}` : change}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-medium ${t.stock_after <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                            {t.stock_after}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {getSourceBadge(t.source)}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs font-medium flex items-center gap-1.5 mt-1">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {t.staff_name || t.staff_id || 'System'}
                        </td>
                      </tr>
                    );
                  })
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
    </div>
  );
}
