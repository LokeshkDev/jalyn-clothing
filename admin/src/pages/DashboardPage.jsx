import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Sliders,
  FolderTree,
  ShoppingBasket,
  ArrowUpRight,
  Database,
  Upload,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import Header from '../components/Header';
import api from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    productsCount: 0,
    categoriesCount: 0,
    ordersCount: 0,
    serverStatus: 'checking',
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const [prodRes, catRes, orderRes] = await Promise.allSettled([
          api.get('/products'),
          api.get('/categories'),
          api.get('/orders'),
        ]);

        setStats({
          productsCount: prodRes.status === 'fulfilled' ? prodRes.value.data?.products?.length || 0 : 0,
          categoriesCount: catRes.status === 'fulfilled' ? catRes.value.data?.categories?.length || 0 : 0,
          ordersCount: orderRes.status === 'fulfilled' ? orderRes.value.data?.orders?.length || 0 : 0,
          serverStatus: 'online',
        });
      } catch (err) {
        setStats((prev) => ({ ...prev, serverStatus: 'error' }));
      }
    }
    loadStats();
  }, []);

  const statCards = [
    { title: 'Total Products', value: stats.productsCount, icon: ShoppingBag, color: 'from-pink-500 to-rose-600', link: '/products' },
    { title: 'Categories', value: stats.categoriesCount, icon: FolderTree, color: 'from-purple-500 to-indigo-600', link: '/categories' },
    { title: 'Orders Placed', value: stats.ordersCount, icon: ShoppingBasket, color: 'from-amber-500 to-orange-600', link: '/orders' },
    { title: 'CMS Sections', value: '4 Managed', icon: Sliders, color: 'from-emerald-500 to-teal-600', link: '/cms' },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Dashboard Overview" subtitle="Welcome back! Manage your store content and inventory." />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <Link
                key={i}
                to={card.link}
                className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition group"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center shadow-md`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-brand-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                </div>
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CMS Quick Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CMS Section Quick Access */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-brand-600" />
                CMS Homepage Sections
              </h3>
              <Link to="/cms" className="text-xs font-semibold text-brand-600 hover:underline">
                Edit All Sections &rarr;
              </Link>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Hero Banner</p>
                  <p className="text-[11px] text-gray-500">Main headline, CTA button & Multer hero image</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">Active</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Category Showcase</p>
                  <p className="text-[11px] text-gray-500">Custom category grid cards with image uploads</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">Active</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Promo & Sale Banner</p>
                  <p className="text-[11px] text-gray-500">Discount promo text & background image uploader</p>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">Active</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
