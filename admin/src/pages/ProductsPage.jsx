import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ImageUploader from '../components/ImageUploader';
import api from '../services/api';
import {
  Plus, Edit, Trash2, Search, Sparkles, RefreshCw, Loader2, X, Globe, Store,
  Layers, Palette, Ruler, ShieldAlert, History, Zap, Check, AlertCircle, ShoppingBag
} from 'lucide-react';

const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  // Modal & Tab State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [submitting, setSubmitting] = useState(false);

  // Toast System
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Offline Sale & Stock Action Modal
  const [offlineSaleModal, setOfflineSaleModal] = useState({ open: false, product: null, variant: null, qty: 1, reference: '' });
  const [adjustStockModal, setAdjustStockModal] = useState({ open: false, product: null, variant: null, newQty: 0, reason: '' });
  const [auditTrailModal, setAuditTrailModal] = useState({ open: false, transactions: [], loading: false });

  // Form State for Product Add/Edit
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    product_code: '',
    base_sku: '',
    category_slug: 'dresses',
    brand: 'JALYN',
    price: '',
    original_price: '',
    description: '',
    short_description: '',
    stock: 10,
    low_stock_threshold: 5,
    is_featured: false,
    is_new_arrival: true,
    is_online: true,
    is_offline: true,
    primary_image: '',
    hover_image: '',
    sizes: ['S', 'M', 'L'],
    custom_size_input: '',
    colors: [
      { name: 'Rose', hex: '#AD4A85', images: [] },
      { name: 'Cream', hex: '#FFF6F9', images: [] },
    ],
    color_images: {},
    variants: [],
    size_guide: {
      enabled: true,
      unit: 'inches',
      image: '',
      columns: ['Bust', 'Waist', 'Hips', 'Length'],
      rows: [
        { size: 'S', Bust: '34', Waist: '28', Hips: '38', Length: '44.5' },
        { size: 'M', Bust: '36', Waist: '30', Hips: '40', Length: '45' },
        { size: 'L', Bust: '38', Waist: '32', Hips: '42', Length: '45.5' },
      ],
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/products', { params: { include_offline: '1' } }),
        api.get('/categories').catch(() => ({ data: { categories: [] } })),
      ]);
      setProducts(pRes.data.products || []);
      setCategories(cRes.data.categories || []);
    } catch (err) {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setActiveTab('basic');
    setFormData({
      title: '',
      slug: '',
      product_code: 'JAL-' + Math.floor(1000 + Math.random() * 9000),
      base_sku: 'JLN-' + Math.floor(100 + Math.random() * 900),
      category_slug: 'dresses',
      brand: 'JALYN',
      price: '',
      original_price: '',
      description: '',
      short_description: '',
      stock: 15,
      low_stock_threshold: 5,
      is_featured: false,
      is_new_arrival: true,
      is_online: true,
      is_offline: true,
      primary_image: '',
      hover_image: '',
      sizes: ['S', 'M', 'L'],
      custom_size_input: '',
      colors: [
        { name: 'Rose', hex: '#AD4A85', images: [] },
        { name: 'Cream', hex: '#FFF6F9', images: [] },
      ],
      color_images: {},
      variants: [],
      size_guide: {
        enabled: true,
        unit: 'inches',
        image: '',
        columns: ['Bust', 'Waist', 'Hips', 'Length'],
        rows: [
          { size: 'S', Bust: '34', Waist: '28', Hips: '38', Length: '44.5' },
          { size: 'M', Bust: '36', Waist: '30', Hips: '40', Length: '45' },
          { size: 'L', Bust: '38', Waist: '32', Hips: '42', Length: '45.5' },
        ],
      },
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p) => {
    setEditingId(p.id);
    setActiveTab('basic');
    const colorObjs = Array.isArray(p.colors)
      ? p.colors.map((c) => (typeof c === 'string' ? { name: c, hex: '#AD4A85', images: p.color_images?.[c] || [] } : c))
      : [];

    setFormData({
      title: p.title || '',
      slug: p.slug || '',
      product_code: p.product_code || 'JAL-' + p.id,
      base_sku: p.base_sku || 'JLN-' + p.id,
      category_slug: p.category_slug || 'dresses',
      brand: p.brand || 'JALYN',
      price: p.price || '',
      original_price: p.original_price || '',
      description: p.description || '',
      short_description: p.short_description || '',
      stock: p.stock || 0,
      low_stock_threshold: p.low_stock_threshold || 5,
      is_featured: !!p.is_featured,
      is_new_arrival: !!p.is_new_arrival,
      is_online: p.is_online !== undefined ? !!p.is_online : true,
      is_offline: p.is_offline !== undefined ? !!p.is_offline : true,
      primary_image: p.primary_image || '',
      hover_image: p.hover_image || '',
      sizes: Array.isArray(p.sizes) ? p.sizes : ['S', 'M', 'L'],
      custom_size_input: '',
      colors: colorObjs.length > 0 ? colorObjs : [{ name: 'Rose', hex: '#AD4A85', images: [] }],
      color_images: p.color_images || {},
      variants: Array.isArray(p.variants) ? p.variants : [],
      size_guide: p.size_guide || {
        enabled: true,
        unit: 'inches',
        image: '',
        columns: ['Bust', 'Waist', 'Hips', 'Length'],
        rows: [],
      },
    });
    setIsModalOpen(true);
  };

  // Automated Variant Matrix Generation
  const handleGenerateVariants = () => {
    const newVariants = [];
    const baseSku = formData.base_sku || 'JLN-' + Math.floor(100 + Math.random() * 900);

    formData.colors.forEach((col) => {
      formData.sizes.forEach((sz) => {
        const colCode = col.name.toUpperCase().slice(0, 3);
        const sku = `${baseSku}-${colCode}-${sz}`;
        const existing = formData.variants.find((v) => v.sku === sku || (v.color === col.name && v.size === sz));
        newVariants.push({
          sku,
          color: col.name,
          colorHex: col.hex,
          size: sz,
          price: formData.price || 0,
          stock: existing ? existing.stock : 10,
          low_stock_threshold: formData.low_stock_threshold || 5,
        });
      });
    });

    const totalStock = newVariants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
    setFormData((prev) => ({
      ...prev,
      variants: newVariants,
      stock: totalStock,
    }));
    showToast(`Generated ${newVariants.length} variants! Total stock: ${totalStock}`, 'success');
  };

  // ─── Variant Matrix CRUD ───
  const recalcTotalStock = (variants) =>
    variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);

  const buildVariantSku = (baseSku, colorName, size) => {
    const colCode = (colorName || 'COL').toUpperCase().slice(0, 3);
    return `${baseSku}-${colCode}-${size}`;
  };

  const handleAddVariant = () => {
    const baseSku = formData.base_sku || 'JLN-' + Math.floor(100 + Math.random() * 900);
    const colorObj = formData.colors[0] || { name: 'Rose', hex: '#AD4A85', images: [] };
    const size = formData.sizes[0] || 'S';

    const baseSkuForRow = buildVariantSku(baseSku, colorObj.name, size);
    const used = new Set(formData.variants.map((v) => v.sku));
    let sku = baseSkuForRow;
    let n = 1;
    while (used.has(sku)) {
      sku = `${baseSkuForRow}-${n++}`;
    }

    const newVariants = [
      ...formData.variants,
      {
        sku,
        color: colorObj.name,
        colorHex: colorObj.hex,
        size,
        price: formData.price || 0,
        stock: 10,
        low_stock_threshold: formData.low_stock_threshold || 5,
      },
    ];

    setFormData((prev) => ({
      ...prev,
      variants: newVariants,
      stock: recalcTotalStock(newVariants),
    }));
    showToast('Variant added to matrix. Click Save to sync it live on the website.', 'success');
  };

  const handleDeleteVariant = (idx) => {
    const newVariants = formData.variants.filter((_, i) => i !== idx);
    setFormData((prev) => ({
      ...prev,
      variants: newVariants,
      stock: recalcTotalStock(newVariants),
    }));
    showToast('Variant removed from matrix. Click Save to sync it live on the website.', 'success');
  };

  const updateVariant = (idx, field, value) => {
    const next = [...formData.variants];
    next[idx] = { ...next[idx], [field]: field === 'stock' || field === 'price' ? Number(value) : value };

    if (field === 'color' || field === 'size') {
      const baseSku = formData.base_sku || 'JLN-' + Math.floor(100 + Math.random() * 900);
      next[idx].sku = buildVariantSku(baseSku, next[idx].color, next[idx].size);
      if (field === 'color') {
        const col = formData.colors.find((c) => c.name === value);
        next[idx].colorHex = col?.hex || next[idx].colorHex;
      }
    }

    setFormData((prev) => ({
      ...prev,
      variants: next,
      stock: recalcTotalStock(next),
    }));
  };

  // Color Management Helpers
  const handleAddColor = () => {
    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, { name: 'New Color', hex: '#AD4A85', images: [] }],
    }));
  };

  const handleRemoveColor = (idx) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== idx),
    }));
  };

  // Size Selection Helpers
  const toggleSize = (sizeStr) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(sizeStr);
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter((s) => s !== sizeStr) : [...prev.sizes, sizeStr],
      };
    });
  };

  const handleAddCustomSize = () => {
    if (!formData.custom_size_input.trim()) return;
    const val = formData.custom_size_input.trim().toUpperCase();
    if (!formData.sizes.includes(val)) {
      setFormData((prev) => ({
        ...prev,
        sizes: [...prev.sizes, val],
        custom_size_input: '',
      }));
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        colors: formData.colors.map((c) => c.name),
        color_images: formData.colors.reduce((acc, c) => {
          if (c.images && c.images.length > 0) acc[c.name] = c.images;
          return acc;
        }, {}),
      };

      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        showToast('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        showToast('Product created successfully!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
      showToast('Product deleted.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete product', 'error');
    }
  };

  // Load Inventory Audit Log
  const handleOpenAuditTrail = async (productId = null) => {
    setAuditTrailModal({ open: true, transactions: [], loading: true });
    try {
      const res = await api.get('/products/inventory/transactions', {
        params: productId ? { product_id: productId } : {},
      });
      setAuditTrailModal({ open: true, transactions: res.data.transactions || [], loading: false });
    } catch (err) {
      setAuditTrailModal({ open: true, transactions: [], loading: false });
      showToast('Could not load audit trail', 'error');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || p.base_sku?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = filterCat === 'all' || p.category_slug === filterCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 min-h-screen">
      <Header title="Unified Product & Inventory Lifecycle" subtitle="Manage catalog, color-wise galleries, automated variant matrix, size guides, and single-source stock." />

      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl font-medium text-xs flex items-center gap-2 animate-bounce ${
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* KPI & Quick Inventory Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-pink-50 rounded-xl text-brand-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total Products</p>
              <p className="text-xl font-bold text-gray-900">{products.length}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Online Available</p>
              <p className="text-xl font-bold text-gray-900">{products.filter((p) => p.is_online !== 0).length}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center gap-3">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Offline Store Active</p>
              <p className="text-xl font-bold text-gray-900">{products.filter((p) => p.is_offline !== 0).length}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Low Stock Alerts</p>
                <p className="text-xl font-bold text-amber-600">
                  {products.filter((p) => (p.stock || 0) <= (p.low_stock_threshold || 5)).length}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenAuditTrail()}
              className="text-[11px] text-brand-600 font-bold hover:underline flex items-center gap-1"
            >
              <History className="w-3.5 h-3.5" /> Audit Log
            </button>
          </div>
        </div>

        {/* Top Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search product name, SKU, or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-500 bg-white shadow-sm"
              />
            </div>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-brand-500 shadow-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id || c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={loadData}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-100 text-gray-600 transition shadow-sm"
              title="Refresh Catalog"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleOpenAddModal}
              className="w-full sm:w-auto bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Product &amp; Variants
            </button>
          </div>
        </div>

        {/* Master Products Table */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" /> Loading product inventory catalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-500 text-xs">No products match your current search/filter.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Product / SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Channel Availability</th>
                  <th className="py-3.5 px-4">Variants</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Balance</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredProducts.map((p) => {
                  const hasLowStock = (p.stock || 0) <= (p.low_stock_threshold || 5);
                  const variantCount = Array.isArray(p.variants) ? p.variants.length : 0;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={p.primary_image || 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80'}
                          alt={p.title}
                          className="w-11 h-11 rounded-lg object-cover border border-gray-200 shrink-0 shadow-sm"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{p.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono mt-0.5">
                            <span>SKU: {p.base_sku || 'N/A'}</span>
                            {p.is_new_arrival ? (
                              <span className="bg-pink-100 text-pink-700 font-bold px-1.5 py-0.2 rounded text-[9px]">New Arrival</span>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-[11px] font-medium capitalize">
                          {p.category_slug}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                              p.is_online !== 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-400'
                            }`}
                            title="Online Store Availability"
                          >
                            <Globe className="w-3 h-3" /> Online
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                              p.is_offline !== 0 ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-gray-100 text-gray-400'
                            }`}
                            title="Offline Retail Store Availability"
                          >
                            <Store className="w-3 h-3" /> Store
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="bg-blue-50 text-blue-700 border border-blue-100 font-semibold px-2 py-0.5 rounded text-[11px]">
                          {variantCount} Variants
                        </span>
                      </td>

                      <td className="py-3 px-4 font-semibold text-gray-900">
                        ₹{p.price}
                        {p.original_price > p.price && (
                          <span className="text-[10px] text-gray-400 line-through ml-1.5 font-normal">
                            ₹{p.original_price}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            hasLowStock ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.stock || 0} in stock {hasLowStock && ' (Low)'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 rounded-lg text-gray-600 hover:text-brand-600 hover:bg-pink-50 transition"
                            title="Full Product Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* ─── MASTER PRODUCT ADD / EDIT MODAL (10 SECTIONS) ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Top Navigation Header */}
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  {editingId ? 'Edit Product & Lifecycle Engine' : 'Add New Product & Unified Inventory'}
                </h3>
                <p className="text-[11px] text-gray-400">
                  Configure basic details, online/offline switches, color-wise galleries, automated matrix &amp; size guides.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section Tab Buttons Bar */}
            <div className="bg-gray-100 border-b border-gray-200 flex items-center px-4 overflow-x-auto text-xs font-semibold no-scrollbar scrollbar-none">
              {[
                { id: 'basic', label: '1. Basic Info', icon: Layers },
                { id: 'availability', label: '2. Channels & Badges', icon: Globe },
                { id: 'images', label: '3. Main Images', icon: Sparkles },
                { id: 'colors', label: '4. Color Galleries', icon: Palette },
                { id: 'sizes', label: '5. Sizes', icon: Ruler },
                { id: 'matrix', label: '6. Variant Matrix', icon: Zap },
                { id: 'sizeguide', label: '7. Size Guide Editor', icon: Ruler },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition cursor-pointer ${
                      active ? 'border-brand-600 text-brand-600 bg-white font-bold' : 'border-transparent text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
              {/* TAB 1: BASIC INFO */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Satin Tiered Midi Dress"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Category *</label>
                      <select
                        value={formData.category_slug}
                        onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                      >
                        {categories.map((c) => (
                          <option key={c.id || c.slug} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Product Code</label>
                      <input
                        type="text"
                        value={formData.product_code}
                        onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                        placeholder="JAL-1002"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Base SKU Prefix *</label>
                      <input
                        type="text"
                        required
                        value={formData.base_sku}
                        onChange={(e) => setFormData({ ...formData, base_sku: e.target.value })}
                        placeholder="JLN-DRS-01"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Brand Name</label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        placeholder="JALYN"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="1899"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Original MRP Price (₹)</label>
                      <input
                        type="number"
                        value={formData.original_price}
                        onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                        placeholder="2499"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Low Stock Threshold</label>
                      <input
                        type="number"
                        value={formData.low_stock_threshold}
                        onChange={(e) => setFormData({ ...formData, low_stock_threshold: Number(e.target.value) })}
                        placeholder="5"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Short Description (PDP Summary)</label>
                    <input
                      type="text"
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      placeholder="Brief bullet summary for instant customer preview..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Full Description &amp; Fabric Care</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Crafted with 100% premium crepe, hand wash recommended..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: CHANNELS & BADGES */}
              {activeTab === 'availability' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <h4 className="font-bold text-gray-900 text-xs">Unified Sales Channel Availability</h4>
                    <p className="text-[11px] text-gray-500">
                      Toggle whether this product should be accessible on the online website store or available in physical offline stores. Both channels read from the single centralized inventory.
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-emerald-300 transition">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-emerald-600" />
                          <div>
                            <span className="font-bold text-gray-900 block">Show on Online Website</span>
                            <span className="text-[10px] text-gray-400">Visible on storefront PDP &amp; catalogs</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.is_online}
                          onChange={(e) => setFormData({ ...formData, is_online: e.target.checked })}
                          className="h-4 w-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 cursor-pointer hover:border-purple-300 transition">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-purple-600" />
                          <div>
                            <span className="font-bold text-gray-900 block">Available in Offline Store</span>
                            <span className="text-[10px] text-gray-400">Available for POS retail store checkouts</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.is_offline}
                          onChange={(e) => setFormData({ ...formData, is_offline: e.target.checked })}
                          className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-pink-50/50 rounded-xl border border-pink-200 space-y-3">
                    <h4 className="font-bold text-pink-900 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-pink-600" /> Promotional Badges
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-pink-100 cursor-pointer">
                        <div>
                          <span className="font-bold text-gray-900 block">New Arrival Product</span>
                          <span className="text-[10px] text-gray-400">Highlights in Homepage New Arrivals Carousel</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.is_new_arrival}
                          onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                          className="h-4 w-4 text-pink-600 rounded focus:ring-pink-500 cursor-pointer"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-white rounded-xl border border-pink-100 cursor-pointer">
                        <div>
                          <span className="font-bold text-gray-900 block">Featured Product</span>
                          <span className="text-[10px] text-gray-400">Shows in Featured Collections grid</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                          className="h-4 w-4 text-pink-600 rounded focus:ring-pink-500 cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: MAIN IMAGES */}
              {activeTab === 'images' && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-[11px] font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>
                      <strong>Image Dimension Guidance:</strong> Recommended: 1200 × 1500 px (4:5 Aspect Ratio) | Max file size: 2 MB.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <ImageUploader
                      label="Primary Cover Image"
                      value={formData.primary_image}
                      onChange={(url) => setFormData({ ...formData, primary_image: url })}
                      aspectRatio="aspect-[4/5]"
                    />
                    <ImageUploader
                      label="Hover / Second Image"
                      value={formData.hover_image}
                      onChange={(url) => setFormData({ ...formData, hover_image: url })}
                      aspectRatio="aspect-[4/5]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: COLOR GALLERIES */}
              {activeTab === 'colors' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 text-xs">Color Swatches &amp; Color-Specific Image Galleries</h4>
                      <p className="text-[10px] text-gray-500">
                        Selecting a color swatch on the customer PDP will switch the entire product gallery to that color's specific photos.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="bg-brand-50 text-brand-700 hover:bg-brand-100 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Color
                    </button>
                  </div>

                  <div className="space-y-4">
                    {formData.colors.map((col, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <input
                              type="color"
                              value={col.hex || '#AD4A85'}
                              onChange={(e) => {
                                const newCols = [...formData.colors];
                                newCols[idx].hex = e.target.value;
                                setFormData({ ...formData, colors: newCols });
                              }}
                              className="w-8 h-8 rounded-lg border-0 cursor-pointer shrink-0"
                            />
                            <input
                              type="text"
                              value={col.name}
                              onChange={(e) => {
                                const newCols = [...formData.colors];
                                newCols[idx].name = e.target.value;
                                setFormData({ ...formData, colors: newCols });
                              }}
                              placeholder="Color Name (e.g. Dusty Rose)"
                              className="px-3 py-1.5 rounded-lg border border-gray-300 font-semibold text-xs flex-1"
                            />
                          </div>
                          {formData.colors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(idx)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Color-wise Image Upload */}
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                            Images for {col.name || 'this color'} (Paste URLs or Upload)
                          </label>
                          <ImageUploader
                            label={`Upload Main Image for ${col.name}`}
                            value={col.images?.[0] || ''}
                            onChange={(url) => {
                              const newCols = [...formData.colors];
                              const imgs = newCols[idx].images || [];
                              imgs[0] = url;
                              newCols[idx].images = imgs;
                              setFormData({ ...formData, colors: newCols });
                            }}
                            aspectRatio="aspect-[4/3]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: SIZES */}
              {activeTab === 'sizes' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-xs">Standard &amp; Custom Sizes</h4>
                    <p className="text-[10px] text-gray-500">
                      Select all sizes available for this product. These will feed directly into the Variant Matrix Generator.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {SIZE_PRESETS.map((sz) => {
                      const selected = formData.sizes.includes(sz);
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => toggleSize(sz)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                            selected
                              ? 'bg-brand-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {sz} {selected && '✓'}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex items-center gap-2 max-w-sm">
                    <input
                      type="text"
                      value={formData.custom_size_input}
                      onChange={(e) => setFormData({ ...formData, custom_size_input: e.target.value })}
                      placeholder="Add custom size (e.g. 40, Free Size)..."
                      className="px-3 py-2 rounded-xl border border-gray-300 flex-1 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomSize}
                      className="bg-gray-900 hover:bg-black text-white px-3 py-2 rounded-xl font-bold text-xs"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 6: VARIANT MATRIX GENERATOR & STOCK */}
              {activeTab === 'matrix' && (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                       <Zap className="w-4 h-4 text-purple-600" /> Automated Variant Matrix Generator
                      </h4>
                      <p className="text-[10px] text-purple-700">
                        Multiplies {formData.colors.length} Colors × {formData.sizes.length} Sizes to generate SKUs, Prices &amp; Stock.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer text-xs"
                      >
                        <Plus className="w-4 h-4" /> Add Variant
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateVariants}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                      > <Zap className="w-4 h-4" /> Generate Matrix
                      </button>
                    </div>
                  </div>

                  {formData.variants.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      No variants yet. Click <strong>"Add Variant"</strong> to manually create a color-size SKU or{" "}
                      <strong>"Generate Matrix"</strong> to auto-create all combinations. Everything syncs live to the website on save.
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-100 font-bold text-gray-600 text-[10px] uppercase">
                          <tr>
                            <th className="py-2.5 px-3">Variant SKU</th>
                            <th className="py-2.5 px-3">Color</th>
                            <th className="py-2.5 px-3">Size</th>
                            <th className="py-2.5 px-3">Price (₹)</th>
                            <th className="py-2.5 px-3">Stock Quantity</th>
                            <th className="py-2.5 px-3 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {formData.variants.map((v, idx) => (
                            <tr key={v.sku || idx} className="hover:bg-gray-50">
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={v.sku}
                                  onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                                  className="w-32 px-2 py-1 border border-gray-300 rounded font-mono text-[11px] text-gray-700"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-3 h-3 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: v.colorHex }} />
                                  <select
                                    value={formData.colors.some((c) => c.name === v.color) ? v.color : ''}
                                    onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                                    className="px-2 py-1 border border-gray-300 rounded text-[11px] font-medium bg-white"
                                  >
                                    {!formData.colors.some((c) => c.name === v.color) && (
                                      <option value="" disabled>{v.color}</option>
                                    )}
                                    {formData.colors.map((c) => (
                                      <option key={c.name} value={c.name}>{c.name}</option>
                                    ))}
                                  </select>
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                <select
                                  value={formData.sizes.includes(v.size) ? v.size : ''}
                                  onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded font-bold text-xs bg-white"
                                >
                                  {!formData.sizes.includes(v.size) && (
                                    <option value="" disabled>{v.size}</option>
                                  )}
                                  {formData.sizes.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  value={v.price}
                                  onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded font-semibold text-xs"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  value={v.stock}
                                  onChange={(e) => updateVariant(idx, 'stock', e.target.value)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded font-bold text-xs"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVariant(idx)}
                                  title="Delete variant"
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-[11px] font-bold text-gray-600">
                        <span>{formData.variants.length} variants configured</span>
                        <span>Total stock across variants: <span className="text-brand-700">{formData.stock}</span></span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: SIZE GUIDE EDITOR */}
              {activeTab === 'sizeguide' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs">Product-Specific Size Measurement Guide</h4>
                        <p className="text-[10px] text-gray-500">
                          Build a custom measurement table that appears in the PDP Size Guide drawer on the customer website.
                        </p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-brand-700">
                        Enable Size Guide
                        <input
                          type="checkbox"
                          checked={formData.size_guide.enabled}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              size_guide: { ...formData.size_guide, enabled: e.target.checked },
                            })
                          }
                          className="h-4 w-4 text-brand-600 rounded"
                        />
                      </label>
                    </div>

                    {formData.size_guide.enabled && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-4">
                          <label className="font-semibold text-gray-700">Measurement Unit:</label>
                          <select
                            value={formData.size_guide.unit}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                size_guide: { ...formData.size_guide, unit: e.target.value },
                              })
                            }
                            className="px-3 py-1.5 rounded-lg border border-gray-300 font-medium"
                          >
                            <option value="inches">Inches (in)</option>
                            <option value="cm">Centimeters (cm)</option>
                          </select>
                        </div>

                        {/* Size Guide Table Matrix */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-gray-100 text-gray-700 font-bold">
                              <tr>
                                <th className="py-2 px-3">Size</th>
                                {formData.size_guide.columns.map((col, idx) => (
                                  <th key={idx} className="py-2 px-3">
                                    {col} ({formData.size_guide.unit})
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {formData.size_guide.rows.map((r, rIdx) => (
                                <tr key={rIdx}>
                                  <td className="py-2 px-3 font-bold text-gray-900">{r.size}</td>
                                  {formData.size_guide.columns.map((col, cIdx) => (
                                    <td key={cIdx} className="py-2 px-3">
                                      <input
                                        type="text"
                                        value={r[col] || ''}
                                        onChange={(e) => {
                                          const newRows = [...formData.size_guide.rows];
                                          newRows[rIdx][col] = e.target.value;
                                          setFormData({
                                            ...formData,
                                            size_guide: { ...formData.size_guide, rows: newRows },
                                          });
                                        }}
                                        className="w-16 px-2 py-1 border border-gray-300 rounded font-medium text-xs"
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bottom Actions Bar */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-[11px] text-gray-400 font-medium">
                  Centralized inventory updates in real-time across Website &amp; Retail Store.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 font-semibold text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Product &amp; Sync Inventory
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── INVENTORY AUDIT TRAIL LOG MODAL ─── */}
      {auditTrailModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <History className="w-4 h-4 text-brand-600" /> Centralized Inventory Audit Trail
              </h3>
              <button
                onClick={() => setAuditTrailModal({ open: false, transactions: [], loading: false })}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {auditTrailModal.loading ? (
              <div className="p-8 text-center text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" /> Fetching audit log...
              </div>
            ) : auditTrailModal.transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs">
                No inventory transaction logs recorded yet. Offline sales and manual adjustments will appear here.
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto border border-gray-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-600 font-bold text-[10px] uppercase sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Variant SKU</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Change</th>
                      <th className="py-2.5 px-3">Balance</th>
                      <th className="py-2.5 px-3">Reference / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {auditTrailModal.transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 text-[10px] text-gray-400 font-mono">
                          {new Date(t.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-3 font-mono font-semibold">{t.variant_sku}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.type === 'Offline Sale' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className={`py-2 px-3 font-bold ${t.change_qty < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {t.change_qty > 0 ? `+${t.change_qty}` : t.change_qty}
                        </td>
                        <td className="py-2 px-3 font-bold text-gray-900">{t.balance_after}</td>
                        <td className="py-2 px-3 text-gray-500 text-[11px]">
                          {t.reference} - {t.notes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
