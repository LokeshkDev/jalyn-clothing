import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ShieldCheck,
  Settings,
  FileText,
  BarChart3,
  Save,
  RefreshCw,
  CheckCircle2,
  Lock,
  Cookie,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

export default function CookieConsentPage() {
  const [activeTab, setActiveTab] = useState('settings'); // 'settings' | 'stats' | 'logs'
  const [settings, setSettings] = useState({
    banner_title: 'We Value Your Privacy & Shopping Experience',
    banner_description:
      'We use essential cookies to keep your cart and checkout secure. With your permission, we also use functional and analytics cookies to personalize your style recommendations.',
    policy_url: '/privacy-policy',
    current_version: '1.0.0',
    is_enabled: 1,
  });

  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchStats();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/consent/settings');
      if (res.data?.success && res.data.data?.settings) {
        setSettings(res.data.data.settings);
      }
    } catch (err) {
      console.error('Failed to load consent settings', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/consent/admin/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load consent stats', err);
    }
  };

  const fetchLogs = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/consent/admin/logs?page=${page}&limit=25`);
      if (res.data?.success) {
        setLogs(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Failed to load consent logs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/consent/admin/settings', settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save settings: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 p-6 sm:p-8 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center border border-brand-100 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Cookie Consent &amp; Privacy CMP
              </h1>
              <p className="text-xs sm:text-sm text-gray-500">
                Self-hosted GDPR Article 7 audit logs, customizable banner copy, and consent metrics.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 p-1 bg-gray-200/70 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === 'settings'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="w-3.5 h-3.5" /> Banner Setup
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('stats');
                fetchStats();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === 'stats'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> Opt-In Analytics
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('logs');
                fetchLogs(1);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === 'logs'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Audit Trail Logs
            </button>
          </div>
        </div>

        {/* 1. Banner Settings Tab */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <form
              onSubmit={handleSaveSettings}
              className="lg:col-span-2 bg-white p-6 sm:p-7 rounded-2xl border border-gray-200/80 shadow-sm space-y-5"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                  Storefront Banner Configuration
                </h2>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <span>Display Banner:</span>
                  <input
                    type="checkbox"
                    checked={Boolean(settings.is_enabled)}
                    onChange={(e) => setSettings({ ...settings, is_enabled: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                </label>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                  Banner Headline
                </label>
                <input
                  type="text"
                  value={settings.banner_title}
                  onChange={(e) => setSettings({ ...settings, banner_title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-gray-50 focus:bg-white text-gray-900 focus:ring-2 focus:ring-brand-500 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                  Banner Description Message
                </label>
                <textarea
                  rows={4}
                  value={settings.banner_description}
                  onChange={(e) => setSettings({ ...settings, banner_description: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-gray-50 focus:bg-white text-gray-900 focus:ring-2 focus:ring-brand-500 transition leading-relaxed"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                    Privacy Policy URL
                  </label>
                  <input
                    type="text"
                    value={settings.policy_url}
                    onChange={(e) => setSettings({ ...settings, policy_url: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-gray-50 focus:bg-white text-gray-900 focus:ring-2 focus:ring-brand-500 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-600 mb-1.5">
                    Policy Version (Bumping forces re-consent)
                  </label>
                  <input
                    type="text"
                    value={settings.current_version}
                    onChange={(e) => setSettings({ ...settings, current_version: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-gray-300 bg-gray-50 focus:bg-white text-gray-900 focus:ring-2 focus:ring-brand-500 transition font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-gray-100">
                {saveSuccess ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="w-4 h-4" /> Configuration Saved Successfully!
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Settings update across storefront immediately.</span>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </form>

            {/* Live Banner Preview Card */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" /> Live Store Preview
                </h3>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3 shadow-inner">
                  <div className="flex items-center gap-2 text-brand-700">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-xs font-bold font-serif">{settings.banner_title || 'Banner Title'}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                    {settings.banner_description || 'Your notice message will render here.'}
                  </p>
                  <div className="flex gap-1.5 pt-2">
                    <span className="px-2 py-1 bg-white border border-gray-200 text-[10px] font-semibold rounded">
                      Customize
                    </span>
                    <span className="px-2 py-1 bg-gray-200 text-[10px] font-semibold rounded">
                      Reject
                    </span>
                    <span className="px-2.5 py-1 bg-brand-600 text-white text-[10px] font-semibold rounded ml-auto">
                      Accept All
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 space-y-1 leading-relaxed">
                <p className="font-bold flex items-center gap-1">
                  💡 Compliance Tip:
                </p>
                <p>
                  Whenever you add or change tracking tags (e.g. adding Meta Pixel or Google Analytics), bump the version (e.g. from <code>1.0.0</code> to <code>1.1.0</code>) so previous visitors re-affirm consent.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. Analytics Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total User Consents</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{stats?.total_logs || 0}</p>
                <p className="text-[11px] text-gray-400 mt-1">Recorded audit events</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Accept All Rate</p>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
                  {stats?.total_logs ? Math.round((stats.accepted_all / stats.total_logs) * 100) : 0}%
                </p>
                <p className="text-[11px] text-gray-400 mt-1">{stats?.accepted_all || 0} full opt-ins</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Analytics Opt-In</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600 mt-1">
                  {stats?.total_logs ? Math.round((stats.analytics_count / stats.total_logs) * 100) : 0}%
                </p>
                <p className="text-[11px] text-gray-400 mt-1">{stats?.analytics_count || 0} shoppers enabled</p>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Marketing Opt-In</p>
                <p className="text-2xl sm:text-3xl font-bold text-purple-600 mt-1">
                  {stats?.total_logs ? Math.round((stats.marketing_count / stats.total_logs) * 100) : 0}%
                </p>
                <p className="text-[11px] text-gray-400 mt-1">{stats?.marketing_count || 0} shoppers enabled</p>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Category Consent Breakdown</h3>
              <p className="text-xs text-gray-500 mb-4">
                Overview of category approval status among shoppers who interacted with the banner.
              </p>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>Strictly Necessary (Required)</span>
                    <span>100%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>Functional &amp; Preferences</span>
                    <span>{stats?.total_logs ? Math.round((stats.preferences_count / stats.total_logs) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${stats?.total_logs ? (stats.preferences_count / stats.total_logs) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>Analytics &amp; Performance</span>
                    <span>{stats?.total_logs ? Math.round((stats.analytics_count / stats.total_logs) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${stats?.total_logs ? (stats.analytics_count / stats.total_logs) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                    <span>Marketing &amp; Advertising</span>
                    <span>{stats?.total_logs ? Math.round((stats.marketing_count / stats.total_logs) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${stats?.total_logs ? (stats.marketing_count / stats.total_logs) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Audit Logs Explorer Tab */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden space-y-0">
            <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-600" /> GDPR Article 7 Proof of Consent Audit Log
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Demonstrable compliance record storing salted SHA-256 hashed IPs, versions, and timestamped category choices.
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchLogs(pagination.page)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-white rounded-lg border border-gray-200 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100/70 text-gray-600 uppercase font-semibold border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4">UUID &amp; Date</th>
                    <th className="py-3 px-4">Hashed IP &amp; Version</th>
                    <th className="py-3 px-4 text-center">Necessary</th>
                    <th className="py-3 px-4 text-center">Preferences</th>
                    <th className="py-3 px-4 text-center">Analytics</th>
                    <th className="py-3 px-4 text-center">Marketing</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-mono text-[11px]">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400 font-sans">
                        {loading ? 'Loading audit records...' : 'No consent transactions recorded yet.'}
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/70 transition">
                        <td className="py-3 px-4 font-sans">
                          <div className="font-semibold text-gray-900 font-mono">{log.consent_uuid}</div>
                          <div className="text-[10px] text-gray-500">
                            {new Date(log.created_at).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <div title={log.ip_hash}>{log.ip_hash.substring(0, 16)}...</div>
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-gray-100 text-[10px] rounded font-sans text-gray-500">
                            Policy v{log.policy_version}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px]">
                            ACTIVE
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {log.preferences ? (
                            <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px]">
                              YES
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-400 font-bold rounded text-[10px]">
                              NO
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {log.analytics ? (
                            <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded text-[10px]">
                              YES
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-400 font-bold rounded text-[10px]">
                              NO
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {log.marketing ? (
                            <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-700 font-bold rounded text-[10px]">
                              YES
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-400 font-bold rounded text-[10px]">
                              NO
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between text-xs text-gray-600">
                <span>
                  Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total logs)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchLogs(pagination.page - 1)}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchLogs(pagination.page + 1)}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

