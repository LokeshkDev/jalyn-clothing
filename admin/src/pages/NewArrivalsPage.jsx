import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import ImageUploader from '../components/ImageUploader';
import api from '../services/api';
import {
  Search, RefreshCw, Loader2, Check, AlertCircle, ShoppingBag, Eye, Save
} from 'lucide-react';

export default function NewArrivalsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Search & Filters state
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterArrivalStatus, setFilterArrivalStatus] = useState('all'); // all, new_arrival, not_new_arrival
  const [filterStockStatus, setFilterStockStatus] = useState('all'); // all, in_stock, out_of_stock

  // Bulk actions state
  const [selectedIds, setSelectedIds] = useState([]);

  // Toast notifications state
  const [toast, setToast] = useState(null);

  // Page Header CMS Settings
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [pageData, setPageData] = useState({
    title: 'New Arrivals',
    description: 'Discover the latest styles handpicked for you. From effortless everyday looks to statement pieces, our new arrivals are designed to keep you ahead in fashion.',
    bg_image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1920&q=80',
    slug: 'new-arrivals',
    meta_title: 'New Arrivals | JALYN Store',
    meta_description: 'Discover the latest women\'s fashion arrivals at JALYN. Shop new dresses, co-ord sets, ethnic wear, tops and more.'
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load products, categories and CMS info
  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, cmsRes] = await Promise.all([
        api.get('/products?include_offline=true'),
        api.get('/categories'),
        api.get('/cms/homepage')
      ]);

      if (prodRes.data?.success && Array.isArray(prodRes.data.products)) {
        setProducts(prodRes.data.products);
      }
      if (catRes.data?.success && Array.isArray(catRes.data.categories)) {
        setCategories(catRes.data.categories);
      }
      if (cmsRes.data?.success && cmsRes.data.data?.page_new_arrivals) {
        setPageData(cmsRes.data.data.page_new_arrivals);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load catalog data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter products list
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.base_sku || '').toLowerCase().includes(q) ||
        (p.product_code || '').toLowerCase().includes(q);

      const matchesCategory = filterCat === 'all' || p.category_slug === filterCat || p.category === filterCat;

      let matchesArrival = true;
      if (filterArrivalStatus === 'new_arrival') {
        matchesArrival = p.is_new_arrival === 1;
      } else if (filterArrivalStatus === 'not_new_arrival') {
        matchesArrival = p.is_new_arrival === 0 || !p.is_new_arrival;
      }

      let matchesStock = true;
      if (filterStockStatus === 'in_stock') {
        matchesStock = (p.stock ?? 0) > 0;
      } else if (filterStockStatus === 'out_of_stock') {
        matchesStock = (p.stock ?? 0) <= 0;
      }

      return matchesSearch && matchesCategory && matchesArrival && matchesStock;
    });
  }, [products, search, filterCat, filterArrivalStatus, filterStockStatus]);

  // Handle single toggle of new arrivals status
  const handleToggleArrival = async (product) => {
    const nextStatus = product.is_new_arrival === 1 ? 0 : 1;
    try {
      const res = await api.patch(`/products/${product.id}/new-arrival`, {
        is_new_arrival: nextStatus,
        new_arrival_published: product.new_arrival_published ?? 1
      });
      if (res.data?.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, is_new_arrival: nextStatus } : p))
        );
        showToast(
          nextStatus === 1
            ? `Added "${product.title}" to New Arrivals.`
            : `Removed "${product.title}" from New Arrivals.`
        );
      }
    } catch (err) {
      showToast('Unable to update new arrival status.', 'error');
    }
  };

  // Handle toggle of new arrivals publish status
  const handleTogglePublish = async (product) => {
    const nextPublish = product.new_arrival_published === 1 ? 0 : 1;
    try {
      const res = await api.patch(`/products/${product.id}/new-arrival`, {
        new_arrival_published: nextPublish
      });
      if (res.data?.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, new_arrival_published: nextPublish } : p))
        );
        showToast(
          nextPublish === 1
            ? `Published "${product.title}" in New Arrivals.`
            : `Unpublished "${product.title}" in New Arrivals.`
        );
      }
    } catch (err) {
      showToast('Unable to update publish status.', 'error');
    }
  };

  // Handle inline change of display order number
  const handleOrderChange = (productId, val) => {
    const numeric = parseInt(val, 10);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, new_arrival_order: isNaN(numeric) ? 0 : numeric } : p))
    );
  };

  // Bulk actions: Add selected to New Arrivals
  const handleBulkAdd = async () => {
    if (selectedIds.length === 0) return;
    setBusy(true);
    try {
      const res = await api.patch('/products/new-arrivals/bulk', {
        productIds: selectedIds,
        isNewArrival: true
      });
      if (res.data?.success) {
        setProducts((prev) =>
          prev.map((p) => (selectedIds.includes(p.id) ? { ...p, is_new_arrival: 1 } : p))
        );
        showToast(`Bulk added ${selectedIds.length} products to New Arrivals.`);
        setSelectedIds([]);
      }
    } catch (err) {
      showToast('Bulk update failed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  // Bulk actions: Remove selected from New Arrivals
  const handleBulkRemove = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to remove ${selectedIds.length} products from New Arrivals?`)) return;
    
    setBusy(true);
    try {
      const res = await api.patch('/products/new-arrivals/bulk', {
        productIds: selectedIds,
        isNewArrival: false
      });
      if (res.data?.success) {
        setProducts((prev) =>
          prev.map((p) => (selectedIds.includes(p.id) ? { ...p, is_new_arrival: 0 } : p))
        );
        showToast(`Bulk removed ${selectedIds.length} products from New Arrivals.`);
        setSelectedIds([]);
      }
    } catch (err) {
      showToast('Bulk remove failed.', 'error');
    } finally {
      setBusy(false);
    }
  };

  // Save all updated display orders in bulk
  const handleSaveDisplayOrders = async () => {
    setBusy(true);
    try {
      const orderPayload = products
        .filter((p) => p.is_new_arrival === 1)
        .map((p) => ({
          id: p.id,
          new_arrival_order: p.new_arrival_order ?? 0
        }));

      const res = await api.patch('/products/new-arrivals/reorder', { orders: orderPayload });
      if (res.data?.success) {
        showToast('New arrivals display order saved successfully.');
      }
    } catch (err) {
      showToast('Failed to save display orders.', 'error');
    } finally {
      setBusy(false);
    }
  };

  // Save the page header CMS settings
  const handleSavePageSettings = async () => {
    setBusy(true);
    try {
      const res = await api.put('/cms/homepage/page_new_arrivals', pageData);
      if (res.data?.success) {
        showToast('Page configuration saved successfully.');
        setShowPageSettings(false);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save page settings.', 'error');
    } finally {
      setBusy(false);
    }
  };

  // Toggle selection checkbox for single item
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Toggle selection for all filtered products
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map((p) => p.id));
    }
  };

  // Clear search and filter states
  const clearFilters = () => {
    setSearch('');
    setFilterCat('all');
    setFilterArrivalStatus('all');
    setFilterStockStatus('all');
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="New Arrivals Catalog Manager"
        subtitle="Configure the storefront header details and SEO info, and choose which items show inside the collection."
      />

      {/* Toast Alert popup */}
      {toast && (
        <div className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-xl shadow-xl font-medium text-xs flex items-center gap-2 ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Page & SEO Settings Collapsible Panel */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <button
            onClick={() => setShowPageSettings(!showPageSettings)}
            className="w-full px-5 py-4 flex items-center justify-between text-left font-bold text-sm text-gray-900 bg-gray-50/50 hover:bg-gray-50 transition cursor-pointer select-none"
          >
            <span className="flex items-center gap-2 text-ink">
             <span>New Arrivals Page Header &amp; SEO Configuration</span>
            </span>
            <span className="text-xs text-brand-600 underline font-semibold">
              {showPageSettings ? 'Hide Panel' : 'Edit Page Details & SEO'}
            </span>
          </button>
          
          {showPageSettings && (
            <div className="p-5 border-t border-gray-100 space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Header Title</label>
                    <input
                      type="text"
                      value={pageData.title}
                      onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-semibold bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Header Description</label>
                    <textarea
                      rows={3}
                      value={pageData.description}
                      onChange={(e) => setPageData({ ...pageData, description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-medium bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">URL Slug (SEO Friendly)</label>
                    <input
                      type="text"
                      value={pageData.slug}
                      onChange={(e) => setPageData({ ...pageData, slug: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-mono text-[11px] text-gray-400 bg-gray-100/50"
                      disabled
                    />
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={pageData.show_in_menu !== false}
                        onChange={(e) => setPageData({ ...pageData, show_in_menu: e.target.checked })}
                        className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 accent-brand-600"
                      />
                      <span className="font-semibold text-gray-700">Show in storefront navigation menu</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Meta Title (SEO)</label>
                    <input
                      type="text"
                      value={pageData.meta_title}
                      onChange={(e) => setPageData({ ...pageData, meta_title: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-semibold text-brand-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Meta Description (SEO)</label>
                    <textarea
                      rows={3}
                      value={pageData.meta_description}
                      onChange={(e) => setPageData({ ...pageData, meta_description: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 font-medium bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <ImageUploader
                  label="Hero Banner Background Image"
                  value={pageData.bg_image}
                  onChange={(url) => setPageData({ ...pageData, bg_image: url })}
                  aspectRatio="aspect-[19/6]"
                  recommendedSize="1920 × 600 px (Recommended)"
                  placeholderText="Click to upload hero background image"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setShowPageSettings(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-500 rounded-xl hover:bg-gray-50 font-bold transition cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePageSettings}
                  disabled={busy}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Page Settings</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by title, SKU, or SKU code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-gray-50/40 outline-none"
              />
            </div>

            {/* Quick Actions (Preview, Reorder Save) */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`${import.meta.env.VITE_CLIENT_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5173' : 'https://jalyn.in')}/new-arrivals`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs cursor-pointer"
              >
                <Eye className="w-4 h-4 text-gray-500" />
                <span>Preview Store Page</span>
              </a>

              <button
                onClick={handleSaveDisplayOrders}
                disabled={busy}
                className="inline-flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Display Order</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Filter Category */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Category</label>
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold bg-white cursor-pointer"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Filter Arrival Status */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">New Arrival Status</label>
              <select
                value={filterArrivalStatus}
                onChange={(e) => setFilterArrivalStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold bg-white cursor-pointer"
              >
                <option value="all">All Products</option>
                <option value="new_arrival">New Arrivals only</option>
                <option value="not_new_arrival">Standard catalog only</option>
              </select>
            </div>

            {/* Filter Stock */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Stock Status</label>
              <select
                value={filterStockStatus}
                onChange={(e) => setFilterStockStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold bg-white cursor-pointer"
              >
                <option value="all">All Stock Statuses</option>
                <option value="in_stock">In Stock (&gt; 0)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
              </select>
            </div>

            {/* Reset Filters button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full text-center py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-500 hover:text-brand-600 bg-gray-50 hover:bg-pink-50 transition cursor-pointer"
              >
                Reset Search Filters
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Panel */}
        {selectedIds.length > 0 && (
          <div className="bg-brand-50 border border-brand-100 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <span className="text-xs font-bold text-brand-900">
              Selected {selectedIds.length} product{selectedIds.length !== 1 ? 's' : ''} for bulk actions
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkAdd}
                disabled={busy}
                className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                Add Selected to New Arrivals
              </button>
              <button
                onClick={handleBulkRemove}
                disabled={busy}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                Remove Selected
              </button>
            </div>
          </div>
        )}

        {/* Products Table container */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" /> Loading catalog list...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-xs">
              No products found matching filters. Make sure catalog seeds are complete.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4 w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredProducts.length}
                      onChange={toggleSelectAll}
                      className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 accent-brand-600"
                    />
                  </th>
                  <th className="py-3.5 px-4 w-16">Image</th>
                  <th className="py-3.5 px-4">Product Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4 w-36">New Arrival</th>
                  <th className="py-3.5 px-4 w-28">Display Order</th>
                  <th className="py-3.5 px-4 w-28">Published</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {filteredProducts.map((product) => {
                  const isArr = product.is_new_arrival === 1;
                  const isPub = product.new_arrival_published === 1;
                  const hasStock = product.stock > 0;
                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-pink-50/20 transition ${isArr ? 'bg-pink-50/10' : ''}`}
                    >
                      {/* Checkbox select */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(product.id)}
                          onChange={() => toggleSelect(product.id)}
                          className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 accent-brand-600"
                        />
                      </td>

                      {/* Product Image */}
                      <td className="py-3.5 px-4">
                        <img
                          src={product.primary_image || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=200&q=80'}
                          alt={product.title}
                          className="w-10 h-12 rounded-lg object-cover border border-gray-100 shadow-xs"
                        />
                      </td>

                      {/* Product details */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-gray-900">{product.title}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">SKU: {product.base_sku || 'N/A'}</p>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 capitalize text-gray-600">{product.category_slug || product.category}</td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        ₹{(product.price || 0).toLocaleString('en-IN')}
                      </td>

                      {/* Stock status indicator */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          hasStock ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {product.stock} Units
                        </span>
                      </td>

                      {/* New Arrival status toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleArrival(product)}
                          className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition cursor-pointer select-none ${
                            isArr
                              ? 'bg-brand-600 border-brand-600 text-white'
                              : 'bg-white hover:bg-gray-50 text-gray-400 border-gray-200'
                          }`}
                        >
                          {isArr ? 'NEW ARRIVAL' : 'STANDARD'}
                        </button>
                      </td>

                      {/* Display Order input */}
                      <td className="py-3.5 px-4">
                        <input
                          type="number"
                          disabled={!isArr}
                          value={product.new_arrival_order ?? 0}
                          onChange={(e) => handleOrderChange(product.id, e.target.value)}
                          className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center font-bold text-xs focus:border-brand-500 focus:ring-1 focus:ring-brand-500 disabled:bg-gray-100 disabled:text-gray-300 outline-none bg-white"
                          min={0}
                        />
                      </td>

                      {/* New Arrival Published toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleTogglePublish(product)}
                          disabled={!isArr}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition cursor-pointer select-none disabled:opacity-30 disabled:pointer-events-none ${
                            isPub
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white text-gray-400 border-gray-200'
                          }`}
                        >
                          {isPub ? 'PUBLISHED' : 'DRAFT'}
                        </button>
                      </td>

                      {/* Action toggle switch */}
                      <td className="py-3.5 px-4 text-right">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isArr}
                            onChange={() => handleToggleArrival(product)}
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
