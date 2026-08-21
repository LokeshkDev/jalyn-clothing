import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ImageUploader from '../components/ImageUploader';
import BarcodeLabel from '../components/BarcodeLabel';
import BarcodePrintModal from '../components/BarcodePrintModal';
import api from '../services/api';
import { generateBarcodeSVG } from '../utils/barcodeEncoder';
import {
  Plus, Edit, Trash2, Search, Sparkles, RefreshCw, Loader2, X, Globe, Store,
  Layers, Palette, Ruler, ShieldAlert, History, Zap, Check, AlertCircle, ShoppingBag,
  Barcode, Printer, Download, RotateCcw, Eye, Handshake, Boxes, Warehouse, MapPin, Phone
} from 'lucide-react';

const SIZE_PRESETS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

// Filter attribute options - must match client FilterSidebar SHOP_FILTER_OPTIONS
const FILTER_ATTRIBUTES = {
  fabric: ['Cotton', 'Linen', 'Satin', 'Georgette', 'Rayon', 'Silk Blend', 'Organza', 'Velvet'],
  sleeve: ['Sleeveless', 'Short Sleeve', '3/4 Sleeve', 'Full Sleeve'],
  occasion: ['Casual', 'Work', 'Party', 'Festive', 'Lounge'],
  fit: ['Regular', 'Relaxed', 'Slim', 'Oversized'],
  pattern: ['Solid', 'Floral', 'Printed', 'Embroidered', 'Striped'],
  season: ['Summer', 'Monsoon', 'Winter', 'All Season'],
};

const ATTR_LABELS = {
  fabric: 'Fabric',
  sleeve: 'Sleeve',
  occasion: 'Occasion',
  fit: 'Fit',
  pattern: 'Pattern',
  season: 'Season',
};

// Ensure a saved/loaded size_guide always has a valid shape (prevents empty-table crashes)
const DEFAULT_SIZE_GUIDE = {
  enabled: true,
  unit: 'inches',
  image: '',
  columns: ['Bust', 'Waist', 'Hips', 'Length'],
  rows: [
    { size: 'S', Bust: '34', Waist: '28', Hips: '38', Length: '44.5' },
    { size: 'M', Bust: '36', Waist: '30', Hips: '40', Length: '45' },
    { size: 'L', Bust: '38', Waist: '32', Hips: '42', Length: '45.5' },
  ],
};

const normalizeSizeGuide = (sg) => {
  if (!sg || typeof sg !== 'object') return { ...DEFAULT_SIZE_GUIDE };
  return {
    enabled: sg.enabled !== undefined ? !!sg.enabled : true,
    unit: sg.unit || 'inches',
    image: sg.image || '',
    columns: Array.isArray(sg.columns) && sg.columns.length > 0 ? sg.columns : [...DEFAULT_SIZE_GUIDE.columns],
    rows: Array.isArray(sg.rows) ? sg.rows : [],
  };
};

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

  // Barcode State
  const [productBarcodes, setProductBarcodes] = useState([]);
  const [barcodesLoading, setBarcodesLoading] = useState(false);
  const [barcodePrintModal, setBarcodePrintModal] = useState({ open: false, barcodes: [] });
  const [barcodePreview, setBarcodePreview] = useState(null);

  // Custom Filter Options (stored in DB, shared with website filters)
  const [customOptions, setCustomOptions] = useState({});
  const [addingAttr, setAddingAttr] = useState(null);
  const [customValue, setCustomValue] = useState('');

  // Vendor / Rack / Godown references
  const [vendors, setVendors] = useState([]);
  const [racks, setRacks] = useState([]);
  const [godowns, setGodowns] = useState([]);

  // Quick-create modals (Vendor & Rack from the product workflow)
  const [quickVendorModal, setQuickVendorModal] = useState({ open: false, submitting: false, name: '', company_name: '', phone: '', email: '' });
  const [quickRackModal, setQuickRackModal] = useState({ open: false, submitting: false, name: '', code: '' });

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
    fabric: '',
    sleeve: '',
    occasion: '',
    fit: '',
    pattern: '',
    season: '',
    vendor_id: '',
    rack_id: '',
    godown_stock: [],
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes, fRes, vRes, rRes, gRes] = await Promise.all([
        api.get('/products', { params: { include_offline: '1' } }),
        api.get('/categories').catch(() => ({ data: { categories: [] } })),
        api.get('/filter-options').catch(() => ({ data: { options: {} } })),
        api.get('/vendors').catch(() => ({ data: { vendors: [] } })),
        api.get('/racks').catch(() => ({ data: { racks: [] } })),
        api.get('/godowns').catch(() => ({ data: { godowns: [] } })),
      ]);
      setProducts(pRes.data.products || []);
      setCategories(cRes.data.categories || []);
      setCustomOptions(fRes.data.options || {});
      setVendors(vRes.data.vendors || []);
      setRacks(rRes.data.racks || []);
      setGodowns(gRes.data.godowns || []);
    } catch (err) {
      showToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const generateAlphanumericSku = () => {
    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `SKU-${rand}`;
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setProductBarcodes([]);
    setActiveTab('basic');
    setFormData({
      title: '',
      slug: '',
      product_code: 'JAL-' + Math.floor(1000 + Math.random() * 9000),
      base_sku: generateAlphanumericSku(),
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
      size_guide: normalizeSizeGuide(undefined),
      fabric: '',
      sleeve: '',
      occasion: '',
      fit: '',
      pattern: '',
      season: '',
      vendor_id: '',
      rack_id: '',
      godown_stock: (godowns || []).map((g) => ({ godown_id: g.id, stock: 0 })),
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
      size_guide: normalizeSizeGuide(p.size_guide),
      fabric: p.fabric || '',
      sleeve: p.sleeve || '',
      occasion: p.occasion || '',
      fit: p.fit || '',
      pattern: p.pattern || '',
      season: p.season || '',
      vendor_id: p.vendor_id ? String(p.vendor_id) : '',
      rack_id: p.rack_id ? String(p.rack_id) : '',
      godown_stock: (godowns || []).map((g) => ({ godown_id: g.id, stock: 0 })),
    });
    setIsModalOpen(true);

    // Load barcodes for this product
    setProductBarcodes([]);
    setBarcodesLoading(true);
    api.get(`/barcodes/product/${p.id}`)
      .then(res => setProductBarcodes(res.data.data || []))
      .catch(() => setProductBarcodes([]))
      .finally(() => setBarcodesLoading(false));

    // Load per-godown stock for this product
    api.get(`/godowns/stock/product/${p.id}`)
      .then((res) => {
        const stock = res.data.stock || [];
        setFormData((prev) => ({
          ...prev,
          godown_stock: (godowns || []).map((g) => {
            const found = stock.find((s) => s.id === g.id);
            return { godown_id: g.id, stock: found ? found.stock : 0 };
          }),
        }));
      })
      .catch(() => {});
  };

  // Custom Filter Option Helpers
  const getAttributeOptions = (attr) => {
    const defaults = FILTER_ATTRIBUTES[attr] || [];
    const customs = customOptions[attr] || [];
    return [...new Set([...defaults, ...customs])];
  };

  const getBrandOptions = () => {
    const fromProducts = [...new Set((products || []).map((p) => p.brand).filter(Boolean))];
    return [...new Set(['JALYN', ...fromProducts, ...(customOptions.brand || [])])];
  };

  const handleAttributeSelect = (attr, value) => {
    if (value === '__custom__') {
      setAddingAttr(attr);
      setCustomValue('');
      return;
    }
    setAddingAttr(null);
    setCustomValue('');
    setFormData({ ...formData, [attr]: value });
  };

  const handleAddCustomOption = async () => {
    const val = customValue.trim();
    if (!val) return;
    try {
      await api.post('/filter-options', { attribute: addingAttr, value: val });
      const fRes = await api.get('/filter-options');
      setCustomOptions(fRes.data.options || {});
      setFormData({ ...formData, [addingAttr]: val });
      setAddingAttr(null);
      setCustomValue('');
      showToast(`Added "${val}" to ${ATTR_LABELS[addingAttr] || addingAttr} options`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add option', 'error');
    }
  };

  const handleDeleteCustomOption = async (attr, value) => {
    if (!window.confirm(`Remove "${value}" from ${ATTR_LABELS[attr] || attr} options?`)) return;
    try {
      await api.delete('/filter-options/0', { params: { attribute: attr, value } });
      const fRes = await api.get('/filter-options');
      setCustomOptions(fRes.data.options || {});
      showToast('Option removed.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to remove option', 'error');
    }
  };

  // ─── Quick-Create: Vendor & Rack from the product workflow ───
  const handleQuickCreateVendor = async (e) => {
    e.preventDefault();
    setQuickVendorModal((m) => ({ ...m, submitting: true }));
    try {
      const res = await api.post('/vendors', {
        name: quickVendorModal.name.trim(),
        company_name: quickVendorModal.company_name.trim(),
        phone: quickVendorModal.phone.trim(),
        email: quickVendorModal.email.trim(),
        status: 'active',
      });
      const createdId = res.data.vendor?.id;
      const vRes = await api.get('/vendors');
      setVendors(vRes.data.vendors || []);
      if (createdId) {
        setFormData((prev) => ({ ...prev, vendor_id: String(createdId) }));
      }
      setQuickVendorModal({ open: false, submitting: false, name: '', company_name: '', phone: '', email: '' });
      showToast(`Vendor "${quickVendorModal.name.trim()}" created & assigned!`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create vendor', 'error');
      setQuickVendorModal((m) => ({ ...m, submitting: false }));
    }
  };

  const handleQuickCreateRack = async (e) => {
    e.preventDefault();
    setQuickRackModal((m) => ({ ...m, submitting: true }));
    try {
      const res = await api.post('/racks', {
        name: quickRackModal.name.trim(),
        code: quickRackModal.code.trim(),
        status: 'active',
      });
      const createdId = res.data.rack?.id;
      const rRes = await api.get('/racks');
      setRacks(rRes.data.racks || []);
      if (createdId) {
        setFormData((prev) => ({ ...prev, rack_id: String(createdId) }));
      }
      setQuickRackModal({ open: false, submitting: false, name: '', code: '' });
      showToast(`Rack "${quickRackModal.name.trim()}" created & assigned!`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create rack', 'error');
      setQuickRackModal((m) => ({ ...m, submitting: false }));
    }
  };

  const handleUpdateGodownStock = (godownId, value) => {
    const stock = parseInt(value, 10);
    setFormData((prev) => ({
      ...prev,
      godown_stock: (prev.godown_stock || []).map((s) =>
        s.godown_id === godownId ? { ...s, stock: isNaN(stock) ? 0 : stock } : s
      ),
    }));
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

  // ─── Size Guide Editor Helpers ───
  const updateSizeGuide = (patch) =>
    setFormData((prev) => ({
      ...prev,
      size_guide: { ...(normalizeSizeGuide(prev.size_guide)), ...patch },
    }));

  const handleSizeGuideCellChange = (rIdx, col, value) => {
    const sg = normalizeSizeGuide(formData.size_guide);
    const newRows = sg.rows.map((row, i) => (i === rIdx ? { ...row, [col]: value } : row));
    updateSizeGuide({ rows: newRows });
  };

  const handleSizeGuideRowSizeChange = (rIdx, value) => {
    const sg = normalizeSizeGuide(formData.size_guide);
    const newRows = sg.rows.map((row, i) => (i === rIdx ? { ...row, size: value } : row));
    updateSizeGuide({ rows: newRows });
  };

  const handleAddSizeGuideRow = () => {
    const sg = normalizeSizeGuide(formData.size_guide);
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const used = new Set(sg.rows.map((r) => r.size));
    const nextSize = sizes.find((s) => !used.has(s)) || `Size ${sg.rows.length + 1}`;
    const newRow = { size: nextSize };
    sg.columns.forEach((col) => { newRow[col] = ''; });
    updateSizeGuide({ rows: [...sg.rows, newRow] });
  };

  const handleDeleteSizeGuideRow = (rIdx) => {
    const sg = normalizeSizeGuide(formData.size_guide);
    updateSizeGuide({ rows: sg.rows.filter((_, i) => i !== rIdx) });
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
        vendor_id: formData.vendor_id || null,
        rack_id: formData.rack_id || null,
        godown_stock: (formData.godown_stock || [])
          .filter((s) => s.godown_id)
          .map((s) => ({ godown_id: s.godown_id, stock: parseInt(s.stock, 10) || 0 })),
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
    <div className="flex-1 overflow-y-auto">
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
                <p className="text-[10px] font-semibold text-red-600">
                  {products.filter((p) => (p.stock || 0) < 3).length} critical (&lt; 3 qty)
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
                  <th className="py-3.5 px-4">Vendor / Rack</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock Balance</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredProducts.map((p) => {
                  const effectiveStock = p.effective_stock ?? p.stock ?? 0;
                  const hasLowStock = effectiveStock <= (p.low_stock_threshold || 5);
                  const isCritical = effectiveStock < 3;
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

                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${
                              p.vendor_id
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-gray-50 text-gray-400 border border-gray-200'
                            }`}
                            title="Assigned Vendor"
                          >
                            <Handshake className="w-3 h-3" />
                            {p.vendor_id
                              ? (vendors.find((v) => String(v.id) === String(p.vendor_id))?.name || `Vendor #${p.vendor_id}`)
                              : 'No Vendor'}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${
                              p.rack_id
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-gray-50 text-gray-400 border border-gray-200'
                            }`}
                            title="Assigned Rack"
                          >
                            <Boxes className="w-3 h-3" />
                            {p.rack_id
                              ? (racks.find((r) => String(r.id) === String(p.rack_id))?.name || `Rack #${p.rack_id}`)
                              : 'No Rack'}
                          </span>
                        </div>
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
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                              isCritical
                                ? 'bg-red-100 text-red-700 border border-red-200 animate-pulse'
                                : hasLowStock
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                                  : 'bg-emerald-100 text-emerald-800'
                            }`}
                            title={(() => {
                              const parts = [];
                              if (p.godown_count > 0) parts.push(`Godown distribution: ${p.godown_total || 0} units across ${p.godown_count} godown(s)`);
                              const vTotal = Array.isArray(p.variants) ? p.variants.reduce((s, v) => s + (parseInt(v.stock, 10) || 0), 0) : 0;
                              if (p.variants && p.variants.length > 0) parts.push(`Variant stock total: ${vTotal} units`);
                              parts.push(`Stored balance: ${p.stock ?? 0} units`);
                              return `Dynamic stock (${p.effective_stock ?? p.stock}): ${parts.join(' | ')}`;
                            })()}
                          >
                            {p.effective_stock ?? p.stock ?? 0} in stock {isCritical ? ' (Critical)' : hasLowStock ? ' (Low)' : ''}
                          </span>
                        </div>
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

            {/* Tab Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 text-xs">
              {/* SECTION 1: BASIC INFO */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-700">
                  <Layers className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase tracking-wider">1. Basic Info</span>
                </div>
                <div className="h-[1.5px] bg-brand-600/20 my-2" />
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Silk Satin Midi Dress"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Slug (URL identifier)</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="e.g. silk-satin-midi-dress"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-semibold text-gray-700">SKU Code (SKU-0U02 format) *</label>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, base_sku: generateAlphanumericSku() })}
                          className="text-[10px] text-[#AD4A85] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-2.5 h-2.5" /> Auto-Generate
                        </button>
                      </div>
                      <input
                        type="text"
                        value={formData.base_sku}
                        onChange={(e) => setFormData({ ...formData, base_sku: e.target.value.toUpperCase() })}
                        placeholder="e.g. SKU-0U02"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-bold uppercase focus:ring-2 focus:ring-brand-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Product Code</label>
                      <input
                        type="text"
                        value={formData.product_code}
                        onChange={(e) => setFormData({ ...formData, product_code: e.target.value.toUpperCase() })}
                        placeholder="e.g. JAL-1001"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono focus:ring-2 focus:ring-brand-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Selling Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        placeholder="1899"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Original Price (₹)</label>
                      <input
                        type="number"
                        value={formData.original_price}
                        onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })}
                        placeholder="2499"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Discount (%)</label>
                      <input
                        type="number"
                        value={formData.discount}
                        onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                        placeholder="24"
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Brand</label>
                      <select
                        value={formData.brand}
                        onChange={(e) => handleAttributeSelect('brand', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 bg-white"
                      >
                        <option value="">Select Brand</option>
                        {getBrandOptions().map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="__custom__">＋ Add Custom Brand…</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Category Collections *</label>
                      <select
                        required
                        value={formData.category_slug}
                        onChange={(e) => {
                          const selectedOpt = e.target.selectedOptions[0];
                          setFormData({
                            ...formData,
                            category_slug: e.target.value,
                            category: selectedOpt ? selectedOpt.text : '',
                          });
                        }}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 bg-white"
                      >
                        <option value="" disabled>Select Category</option>
                        {categories.map((c) => (
                          <option key={c.slug} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Fabric</label>
                      <select
                        value={formData.fabric}
                        onChange={(e) => handleAttributeSelect('fabric', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 bg-white"
                      >
                        <option value="">Select Fabric</option>
                        {getAttributeOptions('fabric').map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="__custom__">＋ Add Custom Fabric…</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Fit / Silhouette</label>
                      <select
                        value={formData.fit}
                        onChange={(e) => handleAttributeSelect('fit', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 bg-white"
                      >
                        <option value="">Select Fit</option>
                        {getAttributeOptions('fit').map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="__custom__">＋ Add Custom Fit…</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Sleeve Type</label>
                      <select
                        value={formData.sleeve}
                        onChange={(e) => handleAttributeSelect('sleeve', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 bg-white"
                      >
                        <option value="">Select Sleeve</option>
                        {getAttributeOptions('sleeve').map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="__custom__">＋ Add Custom Sleeve…</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Occasion</label>
                      <select
                        value={formData.occasion}
                        onChange={(e) => handleAttributeSelect('occasion', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 bg-white"
                      >
                        <option value="">Select Occasion</option>
                        {getAttributeOptions('occasion').map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="__custom__">＋ Add Custom Occasion…</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Pattern</label>
                      <select
                        value={formData.pattern}
                        onChange={(e) => handleAttributeSelect('pattern', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 bg-white"
                      >
                        <option value="">Select Pattern</option>
                        {getAttributeOptions('pattern').map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="__custom__">＋ Add Custom Pattern…</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Season</label>
                      <select
                        value={formData.season}
                        onChange={(e) => handleAttributeSelect('season', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 bg-white"
                      >
                        <option value="">Select Season</option>
                        {getAttributeOptions('season').map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="__custom__">＋ Add Custom Season…</option>
                      </select>
                    </div>
                  </div>

                  {addingAttr && (
                    <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3">
                      <span className="shrink-0 text-xs font-bold text-brand-700">
                        New {ATTR_LABELS[addingAttr] || addingAttr} option:
                      </span>
                      <input
                        autoFocus
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomOption(); } }}
                        placeholder="Type option value…"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddCustomOption}
                        disabled={!customValue.trim()}
                        className="bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingAttr(null)}
                        className="text-gray-500 hover:text-gray-700 text-xs font-semibold px-2 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {Object.keys(customOptions).filter((attr) => (customOptions[attr] || []).length > 0).length > 0 && (
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1.5">
                        Custom Options (shared with website filters)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(customOptions).map(([attr, vals]) =>
                          (vals || []).map((val) => (
                            <span
                              key={`${attr}-${val}`}
                              className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700"
                            >
                              <span className="uppercase text-[9px] text-brand-400">{attr}</span>
                              {val}
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomOption(attr, val)}
                                title={`Remove ${val}`}
                                className="text-brand-400 hover:text-red-500 cursor-pointer"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Product Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Crafted with 100% premium crepe, hand wash recommended..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div className="h-[1.5px] bg-brand-600/20 my-6" />

              {/* SECTION 2: CHANNELS & BADGES */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-700">
                  <Globe className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase tracking-wider">2. Channels & Badges</span>
                </div>
                <div className="h-[1.5px] bg-brand-600/20 my-2" />
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
              </div>

              <div className="h-[1.5px] bg-brand-600/20 my-6" />

              {/* SECTION 3: MAIN IMAGES */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-700">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase tracking-wider">3. Main Images</span>
                </div>
                <div className="h-[1.5px] bg-brand-600/20 my-2" />
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
                      recommendedSize="1200 × 1500 px (4:5 Ratio)"
                      placeholderText="Upload Primary Cover Image (1200 × 1500 px)"
                    />
                    <ImageUploader
                      label="Hover / Second Image"
                      value={formData.hover_image}
                      onChange={(url) => setFormData({ ...formData, hover_image: url })}
                      aspectRatio="aspect-[4/5]"
                      recommendedSize="1200 × 1500 px (4:5 Ratio)"
                      placeholderText="Upload Hover / Second Angle (1200 × 1500 px)"
                    />
                  </div>
                </div>
              </div>

              <div className="h-[1.5px] bg-brand-600/20 my-6" />

              {/* SECTION 4: COLOR GALLERIES */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-700">
                  <Palette className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase tracking-wider">4. Color Galleries</span>
                </div>
                <div className="h-[1.5px] bg-brand-600/20 my-2" />
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
                      className="bg-brand-50 text-brand-700 hover:bg-brand-100 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
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
                              className="px-3 py-1.5 rounded-lg border border-gray-300 font-semibold text-xs flex-1 bg-white"
                            />
                          </div>
                          {formData.colors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveColor(idx)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
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
                            aspectRatio="aspect-[4/5]"
                            recommendedSize="1200 × 1500 px (4:5 Ratio)"
                            placeholderText={`Upload ${col.name} Product Photo (1200 × 1500 px)`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="h-[1.5px] bg-brand-600/20 my-6" />

              {/* SECTION 5: SIZES */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-700">
                  <Ruler className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase tracking-wider">5. Sizes</span>
                </div>
                <div className="h-[1.5px] bg-brand-600/20 my-2" />
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
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
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
                      className="bg-gray-900 hover:bg-black text-white px-3 py-2 rounded-xl font-bold text-xs cursor-pointer"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="h-[1.5px] bg-brand-600/20 my-6" />

              {/* SECTION 6: VARIANT MATRIX GENERATOR & STOCK */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-700">
                  <Zap className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase tracking-wider">6. Variant Matrix</span>
                </div>
                <div className="h-[1.5px] bg-brand-600/20 my-2" />
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
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer text-xs"
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
                                  className="px-2 py-1 border border-gray-300 rounded text-[11px] font-medium bg-white"
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
                                  onChange={(e) => updateVariant(idx, 'price', Number(e.target.value))}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-[11px] font-medium"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  value={v.stock}
                                  onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-[11px] font-medium"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVariant(idx)}
                                  className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              <div className="h-[1.5px] bg-brand-600/20 my-6" />

              {/* SECTION 7: SIZE GUIDE EDITOR */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-brand-700">
                  <Ruler className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase tracking-wider">7. Size Guide Editor</span>
                </div>
                <div className="h-[1.5px] bg-brand-600/20 my-2" />
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
                          onChange={(e) => updateSizeGuide({ enabled: e.target.checked })}
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
                            onChange={(e) => updateSizeGuide({ unit: e.target.value })}
                            className="px-3 py-1.5 rounded-lg border border-gray-300 font-medium bg-white text-xs"
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
                                <th className="py-2 px-3 w-10"></th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {formData.size_guide.rows.length === 0 && (
                                <tr>
                                  <td colSpan={formData.size_guide.columns.length + 2} className="py-6 text-center text-gray-400 text-[11px]">
                                    No size rows yet. Click "Add Size Row" below to start entering measurements.
                                  </td>
                                </tr>
                              )}
                              {formData.size_guide.rows.map((r, rIdx) => (
                                <tr key={rIdx}>
                                  <td className="py-2 px-3">
                                    <input
                                      type="text"
                                      value={r.size || ''}
                                      onChange={(e) => handleSizeGuideRowSizeChange(rIdx, e.target.value)}
                                      className="w-16 px-2 py-1 border border-gray-300 rounded font-bold text-xs"
                                    />
                                  </td>
                                  {formData.size_guide.columns.map((col, cIdx) => (
                                    <td key={cIdx} className="py-2 px-3">
                                      <input
                                        type="text"
                                        value={r[col] || ''}
                                        onChange={(e) => handleSizeGuideCellChange(rIdx, col, e.target.value)}
                                        className="w-16 px-2 py-1 border border-gray-300 rounded font-medium text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                                      />
                                    </td>
                                  ))}
                                  <td className="py-2 px-3">
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSizeGuideRow(rIdx)}
                                      className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                                      title="Delete row"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-200">
                            <button
                              type="button"
                              onClick={handleAddSizeGuideRow}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-[11px] rounded-lg shadow-sm transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Size Row
                            </button>
                            <span className="text-[10px] text-gray-400">
                              {formData.size_guide.rows.length} size row{formData.size_guide.rows.length === 1 ? '' : 's'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 8: BARCODES (only shown when editing an existing product) */}
              {editingId && (
                <div>
                  <div className="h-[1.5px] bg-brand-600/20 my-6" />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-brand-700">
                        <Barcode className="w-4 h-4" />
                        <span className="font-bold text-xs uppercase tracking-wider">8. Barcode Management</span>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          setBarcodesLoading(true);
                          try {
                            await api.post(`/barcodes/generate/${editingId}`);
                            showToast('Barcodes generated successfully!');
                            const res = await api.get(`/barcodes/product/${editingId}`);
                            setProductBarcodes(res.data.data || []);
                          } catch (err) {
                            showToast(err.response?.data?.message || 'Failed to generate barcodes', 'error');
                          } finally {
                            setBarcodesLoading(false);
                          }
                        }}
                        disabled={barcodesLoading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-[11px] rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50"
                      >
                        {barcodesLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Generate Barcodes
                      </button>
                    </div>
                    <div className="h-[1.5px] bg-brand-600/20 my-2" />

                    {barcodesLoading ? (
                      <div className="p-6 text-center text-gray-400 text-xs">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-brand-600" />
                        Loading barcodes...
                      </div>
                    ) : productBarcodes.length === 0 ? (
                      <div className="p-6 text-center text-gray-400 text-xs">
                        <Barcode className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No barcodes generated yet. Click "Generate Barcodes" to create them.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Primary Barcode */}
                        {productBarcodes.filter(b => b.is_primary).map(b => (
                          <div key={b.id} className="p-3 bg-brand-50/50 rounded-xl border border-brand-200/50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-brand-600 text-white px-2 py-0.5 rounded font-bold">PRIMARY</span>
                                <span className="font-mono text-xs font-bold text-gray-900">{b.barcode}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${b.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                  {b.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button type="button" onClick={() => setBarcodePreview(b)} className="p-1 text-gray-400 hover:text-brand-600 rounded hover:bg-brand-50" title="Preview">
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button type="button" onClick={() => setBarcodePrintModal({ open: true, barcodes: [{ barcode: b.barcode, productName: formData.title, color: b.color, size: b.size, price: formData.price }] })} className="p-1 text-gray-400 hover:text-brand-600 rounded hover:bg-brand-50" title="Print">
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                                <button type="button" onClick={async () => {
                                  if (!confirm('Regenerate this barcode? The old one will be deactivated.')) return;
                                  try {
                                    await api.post(`/barcodes/regenerate/${b.id}`);
                                    showToast('Barcode regenerated!');
                                    const res = await api.get(`/barcodes/product/${editingId}`);
                                    setProductBarcodes(res.data.data || []);
                                  } catch (err) {
                                    showToast('Failed to regenerate', 'error');
                                  }
                                }} className="p-1 text-gray-400 hover:text-amber-600 rounded hover:bg-amber-50" title="Regenerate">
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <div dangerouslySetInnerHTML={{ __html: generateBarcodeSVG(b.barcode, { height: 35, moduleWidth: 1.5 }) }} className="flex justify-center" />
                          </div>
                        ))}

                        {/* Variant Barcodes Table */}
                        {productBarcodes.filter(b => !b.is_primary).length > 0 && (
                          <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-gray-100 text-gray-600 font-bold text-[10px] uppercase">
                                <tr>
                                  <th className="py-2 px-3">Color</th>
                                  <th className="py-2 px-3">Size</th>
                                  <th className="py-2 px-3">Barcode</th>
                                  <th className="py-2 px-3">Status</th>
                                  <th className="py-2 px-3 text-center">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 font-medium">
                                {productBarcodes.filter(b => !b.is_primary).map(b => (
                                  <tr key={b.id} className="hover:bg-gray-50">
                                    <td className="py-2 px-3">{b.color || '-'}</td>
                                    <td className="py-2 px-3">{b.size || '-'}</td>
                                    <td className="py-2 px-3 font-mono font-semibold">{b.barcode}</td>
                                    <td className="py-2 px-3">
                                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${b.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                        {b.status}
                                      </span>
                                    </td>
                                    <td className="py-2 px-3 text-center">
                                      <div className="flex items-center justify-center gap-1">
                                        <button type="button" onClick={() => setBarcodePreview(b)} className="p-1 text-gray-400 hover:text-brand-600 rounded hover:bg-brand-50" title="Preview">
                                          <Eye className="w-3.5 h-3.5" />
                                        </button>
                                        <button type="button" onClick={() => setBarcodePrintModal({ open: true, barcodes: [{ barcode: b.barcode, productName: formData.title, color: b.color, size: b.size, price: formData.price }] })} className="p-1 text-gray-400 hover:text-brand-600 rounded hover:bg-brand-50" title="Print">
                                          <Printer className="w-3.5 h-3.5" />
                                        </button>
                                        <button type="button" onClick={async () => {
                                          if (!confirm('Regenerate this barcode?')) return;
                                          try {
                                            await api.post(`/barcodes/regenerate/${b.id}`);
                                            showToast('Barcode regenerated!');
                                            const res = await api.get(`/barcodes/product/${editingId}`);
                                            setProductBarcodes(res.data.data || []);
                                          } catch (err) {
                                            showToast('Failed to regenerate', 'error');
                                          }
                                        }} className="p-1 text-gray-400 hover:text-amber-600 rounded hover:bg-amber-50" title="Regenerate">
                                          <RotateCcw className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Bulk Print Button */}
                        <button
                          type="button"
                          onClick={() => setBarcodePrintModal({
                            open: true,
                            barcodes: productBarcodes.filter(b => b.status === 'active').map(b => ({
                              barcode: b.barcode,
                              productName: formData.title,
                              color: b.color,
                              size: b.size,
                              price: formData.price
                            }))
                          })}
                          className="w-full py-2 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print All Active Barcodes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SECTION 9: VENDOR, RACK & GODOWN STOCK */}
              <div className="space-y-4">
                <div className="h-[1.5px] bg-brand-600/20 my-6" />
                <div className="flex items-center gap-2 text-brand-700">
                  <Handshake className="w-4 h-4" />
                  <span className="font-bold text-xs uppercase tracking-wider">9. Vendor, Rack &amp; Godown Stock</span>
                </div>
                <div className="h-[1.5px] bg-brand-600/20 my-2" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Vendor */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Assigned Vendor</label>
                    <div className="flex gap-2">
                      <select
                        value={formData.vendor_id}
                        onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 bg-white"
                      >
                        <option value="">No Vendor</option>
                        {vendors
                          .filter((v) => v.status === 'active')
                          .map((v) => (
                            <option key={v.id} value={String(v.id)}>
                              {v.name}{v.company_name ? ` — ${v.company_name}` : ''}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setQuickVendorModal({ ...quickVendorModal, open: true })}
                        className="px-3 py-2 rounded-xl border border-dashed border-brand-400 bg-brand-50 text-brand-700 font-bold text-[11px] hover:bg-brand-100 transition whitespace-nowrap cursor-pointer"
                        title="Quick-create a vendor"
                      >
                        + Add Vendor
                      </button>
                    </div>
                  </div>

                  {/* Rack */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Assigned Rack (Store Placement)</label>
                    <div className="flex gap-2">
                      <select
                        value={formData.rack_id}
                        onChange={(e) => setFormData({ ...formData, rack_id: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500 bg-white"
                      >
                        <option value="">No Rack</option>
                        {racks
                          .filter((r) => r.status === 'active')
                          .map((r) => (
                            <option key={r.id} value={String(r.id)}>
                              {r.name}{r.code ? ` (${r.code})` : ''}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setQuickRackModal({ ...quickRackModal, open: true })}
                        className="px-3 py-2 rounded-xl border border-dashed border-brand-400 bg-brand-50 text-brand-700 font-bold text-[11px] hover:bg-brand-100 transition whitespace-nowrap cursor-pointer"
                        title="Quick-create a rack"
                      >
                        + Add Rack
                      </button>
                    </div>
                  </div>
                </div>

                {/* Godown Stock Distribution */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-gray-700">Godown / Branch Stock Distribution</label>
                    <span className="text-[10px] text-gray-400">
                      Total: <strong className="text-gray-700">{((formData.godown_stock || []).reduce((s, g) => s + (parseInt(g.stock, 10) || 0), 0))} units</strong>
                    </span>
                  </div>
                  {godowns.length === 0 ? (
                    <div className="p-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-400 text-[11px]">
                      No godowns configured yet. Visit Godown Management to add one.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {(formData.godown_stock || []).map((g) => {
                        const godown = godowns.find((gd) => gd.id === g.godown_id);
                        if (!godown) return null;
                        return (
                          <div key={g.godown_id} className="p-3 rounded-xl border border-gray-200 bg-gray-50/50">
                            <div className="flex items-center gap-2 mb-2">
                              <Warehouse className="w-3.5 h-3.5 text-brand-600" />
                              <span className="font-bold text-gray-800 text-[11px]">{godown.name}</span>
                              {!!godown.is_default && (
                                <span className="text-[8px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">DEFAULT</span>
                              )}
                            </div>
                            <input
                              type="number"
                              min="0"
                              value={g.stock}
                              onChange={(e) => handleUpdateGodownStock(g.godown_id, e.target.value)}
                              placeholder="0"
                              className="w-full px-3 py-2 rounded-xl border border-gray-300 font-bold text-base focus:ring-2 focus:ring-brand-500"
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 mt-1">
                    Stock entered here is added to the selected godowns. Product total stock auto-calculates from the sum of all godown stock.
                  </p>
                </div>
              </div>

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

      {/* Barcode Print Modal */}
      <BarcodePrintModal
        isOpen={barcodePrintModal.open}
        onClose={() => setBarcodePrintModal({ open: false, barcodes: [] })}
        barcodes={barcodePrintModal.barcodes}
      />

      {/* Barcode Preview Modal */}
      {barcodePreview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setBarcodePreview(null)}>
          <div className="bg-white rounded-2xl p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-600" /> Barcode Preview
              </h3>
              <button onClick={() => setBarcodePreview(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex justify-center">
              <BarcodeLabel
                barcode={barcodePreview.barcode}
                productName={formData.title}
                color={barcodePreview.color}
                size={barcodePreview.size}
                price={formData.price}
              />
            </div>
            <p className="text-center text-[10px] text-gray-400 mt-3">
              Exact preview at 50mm × 25mm — prints 2 stickers per row
            </p>
          </div>
        </div>
      )}

      {/* ─── QUICK-CREATE VENDOR MODAL ─── */}
      {quickVendorModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Handshake className="w-4 h-4 text-brand-400" /> Quick Create Vendor
                </h3>
                <p className="text-[11px] text-gray-400">Creates the vendor and assigns it to this product.</p>
              </div>
              <button
                onClick={() => setQuickVendorModal({ ...quickVendorModal, open: false })}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickCreateVendor} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Vendor Name *</label>
                  <input
                    type="text"
                    required
                    value={quickVendorModal.name}
                    onChange={(e) => setQuickVendorModal({ ...quickVendorModal, name: e.target.value })}
                    placeholder="e.g. Meera Fabrics"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={quickVendorModal.company_name}
                    onChange={(e) => setQuickVendorModal({ ...quickVendorModal, company_name: e.target.value })}
                    placeholder="e.g. Meera Textiles Pvt. Ltd."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={quickVendorModal.phone}
                    onChange={(e) => setQuickVendorModal({ ...quickVendorModal, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={quickVendorModal.email}
                    onChange={(e) => setQuickVendorModal({ ...quickVendorModal, email: e.target.value })}
                    placeholder="e.g. contact@meerafabrics.com"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickVendorModal({ ...quickVendorModal, open: false })}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 font-semibold text-gray-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickVendorModal.submitting}
                  className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {quickVendorModal.submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── QUICK-CREATE RACK MODAL ─── */}
      {quickRackModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <div>
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-brand-400" /> Quick Create Rack
                </h3>
                <p className="text-[11px] text-gray-400">Creates the rack and assigns it to this product.</p>
              </div>
              <button
                onClick={() => setQuickRackModal({ ...quickRackModal, open: false })}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickCreateRack} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Rack Name *</label>
                <input
                  type="text"
                  required
                  value={quickRackModal.name}
                  onChange={(e) => setQuickRackModal({ ...quickRackModal, name: e.target.value })}
                  placeholder="e.g. Rack A"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-medium focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Rack Code</label>
                <input
                  type="text"
                  value={quickRackModal.code}
                  onChange={(e) => setQuickRackModal({ ...quickRackModal, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. RACK-A"
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 font-mono font-medium focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickRackModal({ ...quickRackModal, open: false })}
                  className="px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-100 font-semibold text-gray-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickRackModal.submitting}
                  className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {quickRackModal.submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Rack
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
