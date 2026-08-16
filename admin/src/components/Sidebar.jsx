import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  Sliders,
  ShoppingBasket,
  LogOut,
  Sparkles,
  BadgePercent,
  Users,
  Tag,
  Scan,
  Barcode,
  History,
  Key,
  Lock,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';

export default function Sidebar({ currentUser, onLogout }) {
  const role = currentUser?.role || 'staff';

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(null);

  const allNavItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['superadmin', 'admin', 'manager', 'staff'] },
    
    // Catalog Management — Super Admin, Admin, Manager
    { label: 'Products', path: '/products', icon: ShoppingBag, roles: ['superadmin', 'admin', 'manager'] },
    { label: 'Categories', path: '/categories', icon: FolderTree, roles: ['superadmin', 'admin', 'manager'] },
    
    // Operations, Orders, POS Inventory — All Staff & Managers
    { label: 'Orders', path: '/orders', icon: ShoppingBasket, roles: ['superadmin', 'admin', 'manager', 'staff'] },
    
    // CMS & Marketing — Super Admin & Admin
    { label: 'New Arrivals', path: '/new-arrivals', icon: Sparkles, roles: ['superadmin', 'admin'] },
    { label: 'Sale Catalog', path: '/sale', icon: Tag, roles: ['superadmin', 'admin'] },
    { label: 'Coupons', path: '/coupons', icon: BadgePercent, roles: ['superadmin', 'admin'] },
    { label: 'CMS Homepage Settings', path: '/cms', icon: Sliders, badge: 'CMS', roles: ['superadmin', 'admin'] },
    
    // Super Admin Exclusive
    { label: 'Auth & User Manager', path: '/auth-users', icon: Users, badge: 'SUPER', roles: ['superadmin'] },
    
    { separator: 'Inventory & Barcodes', roles: ['superadmin', 'admin', 'manager', 'staff'] },
    { label: 'Scanner', path: '/scanner', icon: Scan, badge: 'SCAN', roles: ['superadmin', 'admin', 'manager', 'staff'] },
    { label: 'Barcodes', path: '/barcodes', icon: Barcode, roles: ['superadmin', 'admin', 'manager', 'staff'] },
    { label: 'Stock History', path: '/stock-history', icon: History, roles: ['superadmin', 'admin', 'manager', 'staff'] },
  ];

  // Filter navigation items by active user role
  const visibleNavItems = allNavItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(role);
  });

  const getRoleBadge = (r) => {
    switch (r) {
      case 'superadmin':
        return <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded font-bold border border-purple-500/30">SUPER ADMIN</span>;
      case 'admin':
        return <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-bold border border-indigo-500/30">ADMIN</span>;
      case 'manager':
        return <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-bold border border-blue-500/30">STORE MANAGER</span>;
      case 'staff':
        return <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold border border-amber-500/30">STAFF POS</span>;
      default:
        return <span className="text-[9px] bg-gray-500/20 text-gray-300 px-1.5 py-0.5 rounded font-bold">{r}</span>;
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setModalFeedback(null);

    if (newPassword.length < 6) {
      setModalFeedback({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setModalFeedback({ type: 'error', text: 'New passwords do not match. Please re-type.' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      if (res.data?.success) {
        setModalFeedback({ type: 'success', text: res.data.message });
        setTimeout(() => {
          setPasswordModalOpen(false);
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setModalFeedback(null);
        }, 1800);
      } else {
        throw new Error(res.data?.message || 'Password change failed.');
      }
    } catch (err) {
      setModalFeedback({
        type: 'error',
        text: err.response?.data?.message || err.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <aside className="w-64 bg-[#1E1119] text-white flex flex-col h-full shrink-0 border-r border-rose-950/40 font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Brand Header */}
        <div className="p-5 border-b border-rose-950/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center font-bold text-white shadow-lg">
            J
          </div>
          <div>
            <h1 className="font-bold text-base tracking-wide flex items-center gap-1.5 text-white">
              JALYN <span className="text-[10px] bg-brand-600/80 px-1.5 py-0.5 rounded text-white font-normal uppercase">CMS</span>
            </h1>
            <p className="text-[11px] text-rose-200/60 font-medium">E-Commerce Admin</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold text-rose-300/40 uppercase tracking-wider">
            Management
          </div>
          {visibleNavItems.map((item, idx) => {
            if (item.separator) {
              return (
                <div key={idx} className="pt-3 pb-1">
                  <div className="border-t border-rose-950/50 mb-2" />
                  <div className="px-3 pb-1 text-[10px] font-bold text-rose-300/40 uppercase tracking-wider">
                    {item.separator}
                  </div>
                </div>
              );
            }
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-900/50 font-semibold'
                      : 'text-rose-100/70 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    item.badge === 'SUPER' ? 'bg-purple-400/20 text-purple-300' : 'bg-amber-400/20 text-amber-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer with Role Badge & Actions */}
        <div className="p-4 border-t border-rose-950/50 bg-[#170D13]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/40 text-brand-300 font-bold flex items-center justify-center text-xs">
                {currentUser?.name?.[0] || 'U'}
              </div>
              <div className="truncate max-w-[100px]">
                <p className="text-xs font-semibold text-white truncate">{currentUser?.name || 'User'}</p>
                <div className="mt-0.5">
                  {getRoleBadge(role)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setModalFeedback(null);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setPasswordModalOpen(true);
                }}
                title="Change Password"
                className="p-1.5 rounded-lg text-rose-300/60 hover:text-amber-300 hover:bg-white/5 transition cursor-pointer"
              >
                <Key className="w-4 h-4" />
              </button>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-1.5 rounded-lg text-rose-300/60 hover:text-red-400 hover:bg-white/5 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* SELF-SERVICE CHANGE PASSWORD MODAL */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-brand-600" /> Change Your Password
              </h3>
              <button
                onClick={() => setPasswordModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Update password for <span className="font-bold text-gray-800">{currentUser?.email}</span>.
            </p>

            {modalFeedback && (
              <div
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  modalFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-red-50 text-red-800 border-red-200'
                }`}
              >
                {modalFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{modalFeedback.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Current Password *</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 font-medium outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">New Password *</label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 font-medium outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Confirm New Password *</label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 font-medium outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 font-semibold text-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
