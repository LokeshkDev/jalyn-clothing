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
  ShieldAlert,
  Edit2,
  Trash2,
  Key,
  X,
  Lock,
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
    role: 'staff',
  });
  const [creatingUser, setCreatingUser] = useState(false);
  const [userList, setUserList] = useState([]);
  const [roleFilter, setRoleFilter] = useState('all');

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [updatingUser, setUpdatingUser] = useState(false);

  // Quick Password Reset Modal State
  const [resetModal, setResetModal] = useState({ open: false, user: null, newPassword: '', loading: false });

  // Current logged in user from localStorage
  const currentAdmin = (() => {
    try {
      return JSON.parse(localStorage.getItem('admin_user')) || {};
    } catch {
      return {};
    }
  })();

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
        setNewUserForm({ name: '', email: '', phone: '', password: '', role: 'staff' });
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

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setUpdatingUser(true);
    setMessage(null);

    try {
      const payload = {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        role: editingUser.role,
      };
      if (editingUser.password && editingUser.password.trim()) {
        payload.password = editingUser.password.trim();
      }

      const res = await api.put(`/auth/users/${editingUser.id}`, payload);
      if (res.data?.success) {
        setMessage({ type: 'success', text: res.data.message });
        setEditingUser(null);
        fetchUsers();
      } else {
        throw new Error(res.data?.message || 'Failed to update user');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message });
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentAdmin.id || user.email === currentAdmin.email) {
      setMessage({ type: 'error', text: 'You cannot delete your own active logged-in account.' });
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete user "${user.name}" (${user.email})?`)) {
      return;
    }

    setMessage(null);
    try {
      const res = await api.delete(`/auth/users/${user.id}`);
      if (res.data?.success) {
        setMessage({ type: 'success', text: res.data.message });
        fetchUsers();
      } else {
        throw new Error(res.data?.message || 'Failed to delete user');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message });
    }
  };

  const handleQuickResetPassword = async (e) => {
    e.preventDefault();
    if (!resetModal.user || !resetModal.newPassword || resetModal.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setResetModal((prev) => ({ ...prev, loading: true }));
    setMessage(null);
    try {
      const res = await api.post(`/auth/users/${resetModal.user.id}/reset-password`, {
        newPassword: resetModal.newPassword,
      });
      if (res.data?.success) {
        setMessage({ type: 'success', text: res.data.message });
        setResetModal({ open: false, user: null, newPassword: '', loading: false });
      } else {
        throw new Error(res.data?.message || 'Failed to reset password');
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || err.message });
      setResetModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'superadmin':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200">SUPER ADMIN</span>;
      case 'admin':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">ADMIN</span>;
      case 'manager':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">STORE MANAGER</span>;
      case 'staff':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">STAFF POS</span>;
      case 'customer':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">CUSTOMER</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 text-gray-800">{role}</span>;
    }
  };

  const filteredUsers = userList.filter((u) => {
    if (roleFilter === 'all') return true;
    return u.role === roleFilter;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <Header
        title="Auth Editorial & User Management"
        subtitle="Manage website login page editorial banner and Super-Admin role-based user accounts."
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

        {/* SUPER ADMIN EXCLUSIVE ACCESS BADGE */}
        <div className="p-4 bg-gradient-to-r from-purple-900/10 via-brand-600/10 to-rose-400/10 border border-purple-200/80 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                Super Admin Security &amp; Role Control
                <span className="text-[10px] bg-purple-600 text-white px-2 py-0.5 rounded font-bold uppercase">SUPERADMIN ONLY</span>
              </h4>
              <p className="text-xs text-gray-600">
                You have exclusive authority to create accounts, adjust system roles, reset passwords, and manage permissions.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 1: ROLE-BASED USER CREATION & SYSTEM USER MANAGEMENT */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-600" /> Role-Based User Creation
              </h3>
              <p className="text-xs text-gray-500">Create new user accounts directly in assign system roles.</p>
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
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium bg-white outline-none focus:border-brand-600"
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
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium bg-white outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newUserForm.phone}
                  onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium bg-white outline-none focus:border-brand-600"
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
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium bg-white outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assigned Role *</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold bg-white outline-none focus:border-brand-600"
                >
                  <option value="superadmin">Super Admin (Full Access &amp; User Management)</option>
                  <option value="admin">Admin (CMS, Products, Coupons, Orders)</option>
                  <option value="manager">Store Manager (Products, Categories, Orders, Inventory)</option>
                  <option value="staff">Staff (Scanner, Barcodes, Stock History, Orders)</option>
                  <option value="customer">Customer (Storefront Only)</option>
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

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 pb-3 flex-wrap">
            <span className="text-xs font-bold text-gray-500 mr-2">Filter by Role:</span>
            {[
              { label: 'All Users', val: 'all' },
              { label: 'Super Admin', val: 'superadmin' },
              { label: 'Admin', val: 'admin' },
              { label: 'Store Manager', val: 'manager' },
              { label: 'Staff POS', val: 'staff' },
              { label: 'Customer', val: 'customer' },
            ].map((f) => (
              <button
                key={f.val}
                onClick={() => setRoleFilter(f.val)}
                className={`text-xs px-3 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  roleFilter === f.val
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* User List Table */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider">
              System Users ({filteredUsers.length})
            </h4>
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
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400">
                        No users found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition border-b border-gray-100">
                        <td className="p-3 font-mono font-bold text-gray-500">#{u.id}</td>
                        <td className="p-3 font-bold text-gray-900">{u.name}</td>
                        <td className="p-3 text-gray-600">{u.email}</td>
                        <td className="p-3 text-gray-600">{u.phone || '—'}</td>
                        <td className="p-3">
                          {getRoleBadge(u.role)}
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
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setResetModal({ open: true, user: u, newPassword: '', loading: false })}
                              className="p-1.5 text-gray-400 hover:text-amber-600 rounded-lg hover:bg-amber-50 transition cursor-pointer"
                              title="Direct Password Reset"
                            >
                              <Key className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingUser({ ...u, password: '' })}
                              className="p-1.5 text-gray-400 hover:text-brand-600 rounded-lg hover:bg-brand-50 transition cursor-pointer"
                              title="Edit User & Role"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              disabled={u.id === currentAdmin.id || u.email === currentAdmin.email}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              title={u.id === currentAdmin.id ? 'Cannot delete logged-in account' : 'Delete User'}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 2: AUTH EDITORIAL LEFT COLUMN SETTINGS (WEBSITE LOGIN PAGE) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                Website Login Page Editorial Settings
              </h3>
              <p className="text-xs text-gray-500">Edit the left editorial banner, badge, headline, and subtitle on the storefront Login &amp; Registration pages.</p>
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
        </div>
      </main>

      {/* EDIT USER & ROLE MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-600" /> Edit User &amp; Assign Role
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingUser.email || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editingUser.phone || ''}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Assigned Role</label>
                <select
                  value={editingUser.role || 'staff'}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold bg-white"
                >
                  <option value="superadmin">Super Admin (Full Access &amp; User Management)</option>
                  <option value="admin">Admin (CMS, Products, Coupons, Orders)</option>
                  <option value="manager">Store Manager (Products, Categories, Orders, Inventory)</option>
                  <option value="staff">Staff (Scanner, Barcodes, Stock History, Orders)</option>
                  <option value="customer">Customer (Storefront Only)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Reset Password</span>
                  <span className="text-[10px] text-gray-400 font-normal">Leave blank to keep unchanged</span>
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="password"
                    value={editingUser.password || ''}
                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                    placeholder="New password (optional)"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingUser}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  {updatingUser && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK RESET PASSWORD MODAL */}
      {resetModal.open && resetModal.user && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600" /> Direct Password Reset
              </h3>
              <button
                onClick={() => setResetModal({ open: false, user: null, newPassword: '', loading: false })}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900">
              Resetting password for <span className="font-bold">{resetModal.user.name}</span> ({resetModal.user.email}).
            </div>

            <form onSubmit={handleQuickResetPassword} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">New Password *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={resetModal.newPassword}
                    onChange={(e) => setResetModal({ ...resetModal, newPassword: e.target.value })}
                    placeholder="Enter new password (min. 6 chars)"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 font-medium outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResetModal({ open: false, user: null, newPassword: '', loading: false })}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetModal.loading}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-2 shadow-md cursor-pointer"
                >
                  {resetModal.loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Reset Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
