import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import api from '../services/api';
import {
  Mail, Search, Trash2, Loader2, Copy, Check, Users, RefreshCw, AlertCircle, CheckCircle2
} from 'lucide-react';

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/newsletter/subscribers');
      setSubscribers(res.data.subscribers || []);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to load subscribers', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
      ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleCopyAll = async () => {
    const emails = filtered.map((s) => s.email).join(', ');
    try {
      await navigator.clipboard.writeText(emails);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast('Emails copied to clipboard');
    } catch (err) {
      showToast('Could not copy emails', 'error');
    }
  };

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Remove ${email} from subscribers?`)) return;
    try {
      await api.delete(`/newsletter/subscribers/${id}`);
      setSubscribers(subscribers.filter((s) => s.id !== id));
      showToast('Subscriber removed.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove subscriber', 'error');
    }
  };

  const filtered = subscribers.filter((s) =>
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Newsletter Subscribers"
        subtitle="Emails collected from the Be the first to know signup on the website."
      />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl font-medium text-xs flex items-center gap-2 animate-bounce ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-pink-50 rounded-xl text-brand-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Subscribers</p>
              <p className="text-xl font-bold text-gray-900">{subscribers.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Matching Search</p>
              <p className="text-xl font-bold text-gray-900">{filtered.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Newsletter Enabled</p>
              <p className="text-xl font-bold text-gray-900">Live</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by email…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 bg-white shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadSubscribers}
                className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
              <button
                onClick={handleCopyAll}
                disabled={filtered.length === 0}
                className="px-3 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy All Emails
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 animate-spin text-brand-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Mail className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">
                {subscribers.length === 0 ? 'No subscribers yet' : 'No matching subscribers'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {subscribers.length === 0
                  ? 'Emails submitted from the website newsletter form will appear here.'
                  : 'Try a different search.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-[10px] uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3 font-bold">#</th>
                    <th className="px-4 py-3 font-bold">Email</th>
                    <th className="px-4 py-3 font-bold">Source</th>
                    <th className="px-4 py-3 font-bold">Subscribed At</th>
                    <th className="px-4 py-3 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, idx) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-pink-50/40 transition">
                      <td className="px-4 py-3 text-gray-400 font-mono">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono font-bold text-gray-800">{s.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 bg-pink-100 text-pink-800 text-[10px] font-bold rounded uppercase tracking-wider">
                          {s.source || 'homepage'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{formatDate(s.subscribed_at)}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(s.id, s.email)}
                          title="Remove subscriber"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
