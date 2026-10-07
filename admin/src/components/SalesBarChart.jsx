import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Store, Globe, RefreshCw, Calendar } from 'lucide-react';
import api from '../services/api';

export default function SalesBarChart({ orders = [] }) {
  const [period, setPeriod] = useState('daily'); // 'daily', 'weekly', 'monthly', 'yearly'
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);

  const fetchAnalytics = async (selectedPeriod) => {
    setLoading(true);
    try {
      const res = await api.get(`/orders/analytics/sales?period=${selectedPeriod}`);
      if (res.data && res.data.success) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.warn('Fallback analytics from props:', err.message);
      // Fallback calculation directly from orders prop
      calculateLocalAnalytics(selectedPeriod);
    } finally {
      setLoading(false);
    }
  };

  const calculateLocalAnalytics = (p) => {
    const now = new Date();
    const validOrders = (orders || []).filter((o) => o.order_status !== 'cancelled' && o.payment_status !== 'failed');
    let chartData = [];

    if (p === 'daily') {
      const dayMap = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayStr = d.toLocaleDateString('en-IN', { weekday: 'short' });
        const key = d.toISOString().slice(0, 10);
        dayMap[key] = { label: dayStr, pos: 0, online: 0, total: 0, orders: 0 };
      }
      validOrders.forEach((o) => {
        const dStr = new Date(o.created_at || o.date || now).toISOString().slice(0, 10);
        if (dayMap[dStr]) {
          const amt = Number(o.total_amount) || 0;
          const isPos = o.order_type === 'pos' || o.order_type === 'walkin' || String(o.shipping_address || '').toLowerCase().includes('in-store');
          if (isPos) dayMap[dStr].pos += amt;
          else dayMap[dStr].online += amt;
          dayMap[dStr].total += amt;
          dayMap[dStr].orders += 1;
        }
      });
      chartData = Object.values(dayMap);
    } else if (p === 'weekly') {
      const weekMap = [
        { label: 'Week 1', pos: 0, online: 0, total: 0, orders: 0 },
        { label: 'Week 2', pos: 0, online: 0, total: 0, orders: 0 },
        { label: 'Week 3', pos: 0, online: 0, total: 0, orders: 0 },
        { label: 'Week 4', pos: 0, online: 0, total: 0, orders: 0 },
      ];
      validOrders.forEach((o) => {
        const createdDate = new Date(o.created_at || o.date || now);
        const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        const weekIdx = Math.floor(diffDays / 7);
        if (weekIdx >= 0 && weekIdx < 4) {
          const key = 3 - weekIdx;
          const amt = Number(o.total_amount) || 0;
          const isPos = o.order_type === 'pos' || o.order_type === 'walkin' || String(o.shipping_address || '').toLowerCase().includes('in-store');
          if (isPos) weekMap[key].pos += amt;
          else weekMap[key].online += amt;
          weekMap[key].total += amt;
          weekMap[key].orders += 1;
        }
      });
      chartData = weekMap;
    } else if (p === 'monthly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      chartData = months.map((m) => ({ label: m, pos: 0, online: 0, total: 0, orders: 0 }));
      validOrders.forEach((o) => {
        const createdDate = new Date(o.created_at || o.date || now);
        if (createdDate.getFullYear() === now.getFullYear()) {
          const mIdx = createdDate.getMonth();
          const amt = Number(o.total_amount) || 0;
          const isPos = o.order_type === 'pos' || o.order_type === 'walkin' || String(o.shipping_address || '').toLowerCase().includes('in-store');
          if (isPos) chartData[mIdx].pos += amt;
          else chartData[mIdx].online += amt;
          chartData[mIdx].total += amt;
          chartData[mIdx].orders += 1;
        }
      });
    } else {
      const currentYear = now.getFullYear();
      const years = [currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
      chartData = years.map((y) => ({ label: String(y), pos: 0, online: 0, total: 0, orders: 0 }));
      validOrders.forEach((o) => {
        const createdDate = new Date(o.created_at || o.date || now);
        const y = createdDate.getFullYear();
        const idx = years.indexOf(y);
        if (idx !== -1) {
          const amt = Number(o.total_amount) || 0;
          const isPos = o.order_type === 'pos' || o.order_type === 'walkin' || String(o.shipping_address || '').toLowerCase().includes('in-store');
          if (isPos) chartData[idx].pos += amt;
          else chartData[idx].online += amt;
          chartData[idx].total += amt;
          chartData[idx].orders += 1;
        }
      });
    }

    const totalRevenue = chartData.reduce((s, b) => s + b.total, 0);
    const posRevenue = chartData.reduce((s, b) => s + b.pos, 0);
    const onlineRevenue = chartData.reduce((s, b) => s + b.online, 0);
    const totalOrders = chartData.reduce((s, b) => s + b.orders, 0);

    setAnalytics({
      success: true,
      period: p,
      chartData,
      totals: { totalRevenue, posRevenue, onlineRevenue, totalOrders },
    });
  };

  useEffect(() => {
    fetchAnalytics(period);
  }, [period, orders]);

  const chartData = analytics?.chartData || [];
  const maxTotal = Math.max(1000, ...chartData.map((d) => d.total));
  const totals = analytics?.totals || { totalRevenue: 0, posRevenue: 0, onlineRevenue: 0, totalOrders: 0 };

  const money = (v) => '₹' + Number(v || 0).toLocaleString('en-IN');

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-5">
      {/* Header & Period Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#AD4A85]" />
            Sales Performance & Analytics
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Combined revenue graph comparing <strong className="text-[#AD4A85]">Walk-in / POS Bills</strong> and <strong className="text-[#2A1A22]">Online Orders</strong>.
          </p>
        </div>

        {/* Period Selector Buttons */}
        <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-xl border border-gray-200 self-stretch sm:self-auto">
          {[
            { id: 'daily', label: 'Daily' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'yearly', label: 'Yearly' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPeriod(item.id)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                period === item.id
                  ? 'bg-white text-[#AD4A85] shadow-xs border border-gray-200/80'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
        <div>
          <p className="text-[11px] font-semibold text-gray-500">Total Period Revenue</p>
          <p className="text-lg font-extrabold text-gray-900 mt-0.5">{money(totals.totalRevenue)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-[#AD4A85] flex items-center gap-1">
            <Store className="w-3 h-3" /> Walk-in POS Sales
          </p>
          <p className="text-lg font-extrabold text-[#AD4A85] mt-0.5">{money(totals.posRevenue)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-[#2A1A22] flex items-center gap-1">
            <Globe className="w-3 h-3" /> Online Orders
          </p>
          <p className="text-lg font-extrabold text-[#2A1A22] mt-0.5">{money(totals.onlineRevenue)}</p>
        </div>
        <div>
          <p className="text-[11px] font-semibold text-gray-500">Completed Orders</p>
          <p className="text-lg font-extrabold text-gray-900 mt-0.5">{totals.totalOrders} Bills</p>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="relative pt-4">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
            <RefreshCw className="w-6 h-6 text-[#AD4A85] animate-spin" />
          </div>
        )}

        <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-gray-200">
          {chartData.map((d, idx) => {
            const posPct = maxTotal > 0 ? (d.pos / maxTotal) * 100 : 0;
            const onlinePct = maxTotal > 0 ? (d.online / maxTotal) * 100 : 0;

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                onMouseEnter={() => setHoveredBar(d)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Tooltip on Hover */}
                {hoveredBar === d && (
                  <div className="absolute -top-14 z-20 bg-gray-900 text-white text-[11px] py-1.5 px-3 rounded-lg shadow-xl whitespace-nowrap pointer-events-none transition-all animate-fadeIn">
                    <p className="font-bold border-b border-gray-700 pb-1 mb-1">{d.label} Summary</p>
                    <p className="text-pink-300 font-semibold">Walk-in: {money(d.pos)}</p>
                    <p className="text-blue-200 font-semibold">Online: {money(d.online)}</p>
                    <p className="text-emerald-400 font-bold border-t border-gray-700 pt-1 mt-1">Total: {money(d.total)} ({d.orders} bills)</p>
                  </div>
                )}

                {/* Bars Wrapper (Stacked) */}
                <div className="w-full max-w-[42px] flex flex-col justify-end gap-0.5 h-full relative rounded-t-lg overflow-hidden bg-gray-100/70 group-hover:bg-gray-200/50 transition">
                  {/* Online Bar */}
                  {onlinePct > 0 && (
                    <div
                      style={{ height: `${onlinePct}%` }}
                      className="w-full bg-[#2A1A22] group-hover:bg-[#3D2631] transition-all duration-500 rounded-t-xs"
                      title={`Online: ${money(d.online)}`}
                    />
                  )}
                  {/* POS Walk-in Bar */}
                  {posPct > 0 && (
                    <div
                      style={{ height: `${posPct}%` }}
                      className="w-full bg-[#AD4A85] group-hover:bg-[#8E3466] transition-all duration-500 rounded-t-xs"
                      title={`Walk-in POS: ${money(d.pos)}`}
                    />
                  )}
                </div>

                {/* X Axis Label */}
                <span className="text-[11px] font-semibold text-gray-600 mt-2 truncate max-w-full">
                  {d.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Legend Indicator */}
        <div className="flex items-center justify-center gap-6 mt-3 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-[#AD4A85] shadow-xs"></span>
            <span className="text-gray-700">Walk-in / POS Bills</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-[#2A1A22] shadow-xs"></span>
            <span className="text-gray-700">Online Store Orders</span>
          </div>
        </div>
      </div>
    </div>
  );
}

