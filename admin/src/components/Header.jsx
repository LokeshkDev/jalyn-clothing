import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Bell, ShoppingBag, AlertTriangle, CheckCheck, Inbox } from 'lucide-react';
import api from '../services/api';

const SEEN_KEY = 'jalyn_notif_seen_at';

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

export default function Header({ title, subtitle }) {
  const [notifications, setNotifications] = useState({ newOrders: [], lowStock: [] });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data?.data || { newOrders: [], lowStock: [] });
      setError(false);
    } catch (err) {
      setError(true);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const items = useMemo(() => {
    const orders = notifications.newOrders.map((o) => ({
      id: `order-${o.id}`,
      type: 'order',
      title: `New order ${o.order_number}`,
      subtitle: `${o.customer_name || 'Customer'} • ₹${o.total_amount}`,
      time: o.created_at,
      to: '/orders',
    }));
    const stock = notifications.lowStock.map((p) => ({
      id: `stock-${p.id}`,
      type: 'stock',
      title: p.title,
      subtitle: `Low stock: only ${p.stock} left`,
      time: new Date().toISOString(),
      to: '/products',
    }));
    return [...orders, ...stock];
  }, [notifications]);

  const unreadCount = useMemo(() => {
    const lastSeen = parseInt(localStorage.getItem(SEEN_KEY) || '0', 10);
    return items.filter((n) => new Date(n.time).getTime() > lastSeen).length;
  }, [items]);

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      localStorage.setItem(SEEN_KEY, String(Date.now()));
    }
  };

  const handleGo = (to) => {
    setOpen(false);
    navigate(to);
  };

  return (
    <header className="bg-white border-b border-gray-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-gray-500 font-medium mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Links & Status Badges */}
        <a
          href={import.meta.env.VITE_CLIENT_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5173' : 'https://jalyn.in')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Live Website
        </a>

        {/* Notification Bell */}
        <div className="relative" ref={wrapperRef}>
          <button
            onClick={handleOpen}
            className="relative p-2 rounded-xl text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/60">
                <span className="text-sm font-bold text-gray-900">Notifications</span>
                {items.length > 0 && (
                  <button
                    onClick={() => {
                      localStorage.setItem(SEEN_KEY, String(Date.now()));
                    }}
                    className="text-[11px] font-semibold text-brand-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-100">
                {items.length === 0 ? (
                  <div className="p-8 text-center">
                    <Inbox className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                    <p className="text-xs text-gray-400 font-medium">No notifications yet</p>
                  </div>
                ) : (
                  items.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => handleGo(n.to)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-start gap-3 cursor-pointer"
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          n.type === 'order' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {n.type === 'order' ? <ShoppingBag className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{n.title}</p>
                        <p className="text-[11px] text-gray-500 truncate">{n.subtitle}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(n.time)}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}