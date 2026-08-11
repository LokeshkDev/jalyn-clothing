import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  Sliders,
  ShoppingBasket,
  LogOut,
  Sparkles,
  BadgePercent,
} from 'lucide-react';

export default function Sidebar({ currentUser, onLogout }) {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'CMS Homepage Settings', path: '/cms', icon: Sliders, badge: 'CMS' },
    { label: 'Products', path: '/products', icon: ShoppingBag },
    { label: 'Categories', path: '/categories', icon: FolderTree },
    { label: 'Orders', path: '/orders', icon: ShoppingBasket },
    { label: 'Coupons', path: '/coupons', icon: BadgePercent },
  ];

  return (
    <aside className="w-64 bg-[#1E1119] text-white flex flex-col h-screen sticky top-0 border-r border-rose-950/40">
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
        {navItems.map((item) => {
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
                <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-rose-950/50 bg-[#170D13]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/40 text-brand-300 font-bold flex items-center justify-center text-xs">
              {currentUser?.name?.[0] || 'A'}
            </div>
            <div className="truncate max-w-[110px]">
              <p className="text-xs font-semibold text-white truncate">{currentUser?.name || 'Admin User'}</p>
              <p className="text-[10px] text-rose-200/50 truncate">{currentUser?.email || 'admin@jalyn.com'}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-rose-300/60 hover:text-red-400 hover:bg-white/5 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
