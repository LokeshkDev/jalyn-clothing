import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  Loader2,
  Users,
  UserPlus,
  UserCheck,
  Star,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import Header from '../components/Header';
import ImageUploader from '../components/ImageUploader';
import api from '../services/api';

export default function AuthUsersPage() {
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState(false);
  const [message, setMessage] = useState(null);

  // Auth Editorial CMS Data
  const [authData, setAuthData] = useState({
    badge: 'JALYN EXCLUSIVE CLUB',
    title: 'Timeless Grace,',
    title_highlight: 'Crafted for You.',
    subtitle: 'Sign in to manage your orders, access member-only private sales, save favorite couture pieces, and enjoy personalized tailoring assistance.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1400&q=80',
    reviews: [
      {
        id: 1,
        rating: 5,
        text: '“The fit and fabric quality from Jalyn are unmatched. Shopping here feels like stepping into a personal luxury studio.”',
        name: 'Ananya Kapoor',
        role: 'Verified Jalyn Collector',
        initials: 'AK',
      },
      {
        id: 2,
        rating: 5,
        text: '“Exquisite hand craftsmanship and incredible attention to detail. Delivery was prompt and packaging felt truly regal.”',
        name: 'Riddhi Sen',
        role: 'Luxury Fashion Enthusiast',
        initials: 'RS',
      },
      {
        id: 3,
        rating: 5,
        text: '“The custom fit assistance helped me get the perfect size co-ord set. I receive compliments every time I wear it!”',
        name: 'Meera Rajput',
        role: 'Loyal Jalyn Client',
        initials: 'MR',
      },
    ],
  });

  // User Management State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'customer',
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [userList, setUserList] = useState([]);

  // Fetch CMS & User List on mount
  useEffect(() => {
    fetchCmsData();
    fetchUsers();
  }, []);

  const fetchCmsData = async () => {
    try {
      const res = await api.get('/cms');
      if (res.data?.data?.auth_page) {
        setAuthData(res.data.data.auth_page);
      }
    } catch (err) {
      console.warn('Using default auth_page data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/auth/users');
      if (res.data?.data) {
        setUserList(res.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch users list:', err.message);
    }
  };

  const handleSaveAuthEditorial = async () => {
    setSavingSection(true);
    setMessage(null);
    try {
      await api.put('/cms/auth_page', authData);
      setMessage({ type: 'success', text: 'Auth Page Editorial & 3-Slide Reviews saved successfully!' });
    } catch (err) {
      console.error('Failed to save auth editorial:', err);
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save Auth Editorial to backend server.',
      });
    } finally {
      setSavingSection(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email || !newUserForm.password) return;
    setCreatingUser(true);
    setMessage(null);
    try {
      const res = await api.post('/auth/users', newUserForm);
      if (res.data?.success) {
        setMessage({ type: 'success', text: res.data.message });
        setNewUserForm({ name: '', email: '', phone: '', password: '', role: 'customer' });
        fetchUsers();
      } else {
        throw new Error(res.data?.message || 'User creation failed');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setCreatingUser(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Auth Editorial & User Management"
        subtitle="Manage website login page editorial banner, 3-slide review carousel, and role-based user accounts."
      />

      <main className="p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Top Feedback Banner */}
        {message && (
          <div
            className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-xs ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* SECTION 1: AUTH EDITORIAL LEFT COLUMN SETTINGS */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                Auth Left Editorial Column Settings
              </h3>
              <p className="text-xs text-gray-500">Edit the left editorial image, badge, headline, and subtitle on the Login &amp; Registration pages.</p>
            </div>
            <button
              onClick={handleSaveAuthEditorial}
              disabled={savingSection}
              className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition cursor-pointer"
            >
              {savingSection ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Auth Editorial</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={authData.badge || ''}
                  onChange={(e) => setAuthData({ ...authData, badge: e.target.value })}
                  placeholder="JALYN EXCLUSIVE CLUB"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-medium outline-none focus:border-brand-600 transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Headline Title</label>
                <input
                  type="text"
                  value={authData.title || ''}
                  onChange={(e) => setAuthData({ ...authData, title: e.target.value })}
                  placeholder="Timeless Grace,"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-medium outline-none focus:border-brand-600 transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Headline Highlight (Italic Accent)</label>
                <input
                  type="text"
                  value={authData.title_highlight || ''}
                  onChange={(e) => setAuthData({ ...authData, title_highlight: e.target.value })}
                  placeholder="Crafted for You."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-medium outline-none focus:border-brand-600 transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Subtitle Text</label>
                <textarea
                  rows={3}
                  value={authData.subtitle || ''}
                  onChange={(e) => setAuthData({ ...authData, subtitle: e.target.value })}
                  placeholder="Sign in to manage your orders..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-medium outline-none focus:border-brand-600 transition"
                />
              </div>
            </div>

            <div>
              <ImageUploader
                label="Editorial Auth Backdrop Image"
                recommendedSize="Recommended: 1400 × 1600 px (Auth Editorial Banner)"
                value={authData.image || ''}
                onChange={(url) => setAuthData({ ...authData, image: url })}
                aspectRatio="portrait"
              />
            </div>
          </div>

          {/* 3-SLIDE REVIEWS CAROUSEL EDITOR */}
          <div className="border-t border-gray-100 pt-6 space-y-4">
            <div>
              <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> 3-Slide Customer Reviews Carousel
              </h4>
              <p className="text-xs text-gray-500">Edit the 3 customer review slides displayed on the left column.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(authData.reviews || [
                { rating: 5, text: 'The fit and fabric quality from Jalyn are unmatched.', name: 'Ananya Kapoor', role: 'Verified Jalyn Collector', initials: 'AK' },
                { rating: 5, text: 'Exquisite hand craftsmanship and incredible attention to detail.', name: 'Riddhi Sen', role: 'Luxury Fashion Enthusiast', initials: 'RS' },
                { rating: 5, text: 'The custom fit assistance helped me get the perfect size co-ord set.', name: 'Meera Rajput', role: 'Loyal Jalyn Client', initials: 'MR' },
              ]).map((rev, rIdx) => (
                <div key={rIdx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-600">Review Slide #{rIdx + 1}</span>
                    <div className="flex items-center gap-1">
                      <label className="text-[10px] text-gray-500 font-semibold">Rating:</label>
                      <select
                        value={rev.rating || 5}
                        onChange={(e) => {
                          const nextRevs = [...(authData.reviews || [])];
                          if (!nextRevs[rIdx]) nextRevs[rIdx] = { ...rev };
                          nextRevs[rIdx].rating = Number(e.target.value);
                          setAuthData({ ...authData, reviews: nextRevs });
                        }}
                        className="px-1 py-0.5 rounded border border-gray-300 font-bold bg-white text-[11px]"
                      >
                        <option value={5}>5 Stars ★★★★★</option>
                        <option value={4}>4 Stars ★★★★</option>
                        <option value={3}>3 Stars ★★★</option>
                      </select>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={rev.text || ''}
                    onChange={(e) => {
                      const nextRevs = [...(authData.reviews || [])];
                      if (!nextRevs[rIdx]) nextRevs[rIdx] = { ...rev };
                      nextRevs[rIdx].text = e.target.value;
                      setAuthData({ ...authData, reviews: nextRevs });
                    }}
                    placeholder="Review quote text..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium bg-white"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={rev.name || ''}
                      onChange={(e) => {
                        const nextRevs = [...(authData.reviews || [])];
                        if (!nextRevs[rIdx]) nextRevs[rIdx] = { ...rev };
                        nextRevs[rIdx].name = e.target.value;
                        setAuthData({ ...authData, reviews: nextRevs });
                      }}
                      placeholder="Author Name"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-300 font-medium bg-white"
                    />

                    <input
                      type="text"
                      value={rev.initials || ''}
                      onChange={(e) => {
                        const nextRevs = [...(authData.reviews || [])];
                        if (!nextRevs[rIdx]) nextRevs[rIdx] = { ...rev };
                        nextRevs[rIdx].initials = e.target.value;
                        setAuthData({ ...authData, reviews: nextRevs });
                      }}
                      placeholder="Initials (AK)"
                      className="px-2.5 py-1.5 rounded-lg border border-gray-300 font-medium bg-white"
                    />
                  </div>

                  <input
                    type="text"
                    value={rev.role || ''}
                    onChange={(e) => {
                      const nextRevs = [...(authData.reviews || [])];
                      if (!nextRevs[rIdx]) nextRevs[rIdx] = { ...rev };
                      nextRevs[rIdx].role = e.target.value;
                      setAuthData({ ...authData, reviews: nextRevs });
                    }}
                    placeholder="Role / Tagline (e.g. Verified Client)"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-gray-300 font-medium bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: ROLE-BASED USER CREATION & SYSTEM USER MANAGEMENT */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-600" /> Role-Based User Creation &amp; System Users
              </h3>
              <p className="text-xs text-gray-500">Create new user accounts directly in MySQL DB and assign system roles (Customer, Admin, Store Manager, Staff).</p>
            </div>
            <button
              onClick={fetchUsers}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-200 hover:bg-brand-50 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Users</span>
            </button>
          </div>

          {/* Add User Form */}
          <form onSubmit={handleCreateUser} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 text-xs">
            <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-brand-600" /> Create New User Account
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="e.g. Rahul Verma"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                  placeholder="user@jalyn.in"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assigned Role *</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold bg-white"
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Store Manager</option>
                  <option value="staff">Support Staff</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {creatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  <span>Create Account</span>
                </button>
              </div>
            </div>
          </form>

          {/* User List Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider">Existing System Users ({userList.length})</h4>
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 font-bold text-gray-700 uppercase">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Saved Addresses</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {userList.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition border-b border-gray-100">
                      <td className="p-3 font-mono font-bold text-gray-500">#{u.id}</td>
                      <td className="p-3 font-bold text-gray-900">{u.name}</td>
                      <td className="p-3 text-gray-600">{u.email}</td>
                      <td className="p-3 text-gray-600">{u.phone || '—'}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : u.role === 'manager'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : u.role === 'staff'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600 max-w-xs">
                        {u.addresses && u.addresses.length > 0 ? (
                          <div className="space-y-1">
                            {u.addresses.map((addr, aIdx) => (
                              <div key={addr.id || aIdx} className="text-[10px] bg-pink-50/50 border border-pink-100 px-2 py-1 rounded-lg text-gray-800">
                                <span className="font-bold text-brand-600">{addr.type || 'Home'}</span>: {addr.addressLine1 || addr.address_line1}, {addr.city} ({addr.pincode})
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No saved addresses</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
