import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import api from '../services/api';
import {
  X, Search, Plus, Trash2, Loader2, Printer, FileText, Check,
  ShoppingBag, CreditCard, Banknote, Smartphone, Store, Truck,
  User, Phone, Mail, MapPin, Tag, Sparkles, AlertCircle, IndianRupee,
  Minus, Scan, Camera, Send, QrCode, Star, Instagram, Globe, RefreshCw
} from 'lucide-react';
import { printThermalReceipt, printTaxInvoice, sendLuxuryWhatsAppInvoice } from '../utils/invoiceThermalUtils';
import { playSuccessBeep, playErrorBeep } from '../utils/audioFeedback';
import useScannerInput from '../hooks/useScannerInput';

const money = (v) => '₹' + Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const PAYMENT_METHODS = [
  { id: 'Cash', label: 'Cash', icon: Banknote, color: 'text-emerald-700 bg-emerald-50 border-emerald-300' },
  { id: 'UPI', label: 'UPI / QR', icon: Smartphone, color: 'text-indigo-700 bg-indigo-50 border-indigo-300' },
  { id: 'Card', label: 'Card / POS', icon: CreditCard, color: 'text-blue-700 bg-blue-50 border-blue-300' },
  { id: 'Cash on Delivery', label: 'COD', icon: Truck, color: 'text-amber-700 bg-amber-50 border-amber-300' },
  { id: 'Bank Transfer', label: 'Bank Transfer', icon: IndianRupee, color: 'text-purple-700 bg-purple-50 border-purple-300' },
];

export default function PosBillingModal({ isOpen, onClose, onOrderCreated, showToast }) {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef(null);

  // Scanner modal state
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scanInputText, setScanInputText] = useState('');
  const [scanFeedback, setScanFeedback] = useState(null);

  // Billing Mode: 'counter' (In-Store POS) or 'delivery' (Courier Order)
  const [billingMode, setBillingMode] = useState('counter');

  // Customer State (Both Optional)
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState('In-Store Counter Pickup');

  // Items in the current bill
  const [billItems, setBillItems] = useState([]);

  // Payment & Fulfillment
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [orderStatus, setOrderStatus] = useState('delivered');

  // WhatsApp Review & Social Links Options
  const [includeReviewLinks, setIncludeReviewLinks] = useState(true);

  // Discounts & Additional Charges
  const [discountType, setDiscountType] = useState('flat'); // 'flat' or 'percent'
  const [discountValue, setDiscountValue] = useState('');
  const [shippingFee, setShippingFee] = useState(0);

  // Processing state
  const [submitting, setSubmitting] = useState(false);

  // Load product catalog for SKU, barcode & name search
  useEffect(() => {
    if (isOpen) {
      loadProductCatalog();
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const loadProductCatalog = async () => {
    setLoadingProducts(true);
    try {
      const res = await api.get('/products', { params: { include_offline: '1' } });
      const raw = res.data?.products || (Array.isArray(res.data) ? res.data : []);
      setProducts(raw);
    } catch (err) {
      console.warn('Failed to load products for POS billing:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Switch Billing Mode
  const handleModeChange = (mode) => {
    setBillingMode(mode);
    if (mode === 'counter') {
      setShippingAddress('In-Store Counter Pickup');
      setPaymentStatus('paid');
      setOrderStatus('delivered');
      setShippingFee(0);
    } else {
      if (shippingAddress === 'In-Store Counter Pickup') {
        setShippingAddress('');
      }
      setPaymentStatus(paymentMethod === 'Cash on Delivery' ? 'pending' : 'paid');
      setOrderStatus('processing');
    }
  };

  // Add a product to the billing cart
  const handleAddProduct = (product, selectedSize = null, selectedColor = null) => {
    const defaultSize = selectedSize || (Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes[0] : (product.size || 'Free Size'));
    const defaultColor = selectedColor || (Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : (product.color || ''));
    const price = Number(product.price) || 0;
    const imageUrl = product.primary_image || product.image || product.image_url || (Array.isArray(product.images) && product.images[0]) || '';
    const sku = product.base_sku || product.sku || (product.id ? `SKU-${product.id}` : '');

    // Check if item with same SKU & Size is already in cart
    const existingIndex = billItems.findIndex(
      (it) => (it.product_id === product.id || (it.sku && it.sku === sku)) && it.size === defaultSize
    );

    if (existingIndex >= 0) {
      // Increment quantity
      const updated = [...billItems];
      updated[existingIndex].quantity = (Number(updated[existingIndex].quantity) || 1) + 1;
      setBillItems(updated);
    } else {
      // Add new line item
      setBillItems((prev) => [
        ...prev,
        {
          product_id: product.id,
          product_name: product.title || product.name || 'Untitled Item',
          sku: sku,
          price: price,
          quantity: 1,
          size: defaultSize,
          color: defaultColor,
          image_url: imageUrl,
          available_sizes: Array.isArray(product.sizes) ? product.sizes : [],
          available_colors: Array.isArray(product.colors) ? product.colors : [],
        },
      ]);
    }

    setSearchQuery('');
    setSearchFocused(false);
  };

  // Handle barcode / QR scan from hardware wedge or camera popup
  const handleBarcodeOrQrScanned = useCallback(
    (code) => {
      if (!code || !isOpen) return;
      const clean = String(code).trim().toLowerCase();

      // Find by barcode, SKU, ID, or title
      const found = products.find((p) => {
        const b = (p.barcode || '').toLowerCase();
        const s = (p.base_sku || p.sku || '').toLowerCase();
        const t = (p.title || p.name || '').toLowerCase();
        const idMatch = String(p.id) === clean;
        return b === clean || s === clean || idMatch || t.includes(clean);
      });

      if (found) {
        playSuccessBeep();
        handleAddProduct(found);
        setScanFeedback({ type: 'success', text: `✓ Added "${found.title}" (${found.base_sku || found.sku || code})` });
        setTimeout(() => setScanFeedback(null), 3000);
      } else {
        playErrorBeep();
        setScanFeedback({ type: 'error', text: `✕ No product found for barcode "${code}"` });
        setTimeout(() => setScanFeedback(null), 3500);
      }
    },
    [products, isOpen, billItems]
  );

  // Hook hardware scanner listener
  useScannerInput((scannedCode) => {
    if (isOpen) {
      handleBarcodeOrQrScanned(scannedCode);
    }
  });

  // Filtered Products for Live Search & SKU Auto-populate
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return products
      .filter((p) => {
        const titleMatch = (p.title || p.name || '').toLowerCase().includes(q);
        const skuMatch = (p.base_sku || p.sku || '').toLowerCase().includes(q);
        const barcodeMatch = (p.barcode || '').toLowerCase().includes(q);
        const catMatch = (p.category || p.category_name || p.category_slug || '').toLowerCase().includes(q);
        return titleMatch || skuMatch || barcodeMatch || catMatch;
      })
      .slice(0, 8); // Top 8 matches
  }, [searchQuery, products]);

  // Add empty custom item
  const handleAddCustomItem = () => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    setBillItems([
      ...billItems,
      {
        product_id: null,
        product_name: '',
        sku: `SKU-${randomHex}`,
        price: '',
        quantity: 1,
        size: 'Free Size',
        color: '',
        image_url: '',
        available_sizes: ['Free Size', 'S', 'M', 'L', 'XL', 'XXL'],
        available_colors: [],
      },
    ]);
  };

  // Update line item details
  const handleUpdateItem = (index, field, value) => {
    const updated = [...billItems];
    updated[index][field] = value;
    setBillItems(updated);
  };

  // Remove line item
  const handleRemoveItem = (index) => {
    setBillItems(billItems.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = useMemo(() => {
    return billItems.reduce((sum, item) => {
      const p = Number(item.price) || 0;
      const q = Number(item.quantity) || 1;
      return sum + p * q;
    }, 0);
  }, [billItems]);

  const discountAmount = useMemo(() => {
    const val = Number(discountValue) || 0;
    if (val <= 0) return 0;
    if (discountType === 'percent') {
      return Math.min(Math.round((subtotal * val) / 100), subtotal);
    }
    return Math.min(val, subtotal);
  }, [subtotal, discountType, discountValue]);

  const grandTotal = useMemo(() => {
    const net = subtotal - discountAmount + Number(shippingFee || 0);
    return Math.max(net, 0);
  }, [subtotal, discountAmount, shippingFee]);

  // Submit Order to Backend API and Auto-Save to DB
  const handleCreateOrder = async (printAction = null, triggerWhatsApp = false) => {
    if (billItems.length === 0) {
      showToast?.('Please add at least one product to the bill.', 'error');
      return;
    }

    const validItems = billItems.filter((i) => (i.product_name || '').trim());
    if (validItems.length === 0) {
      showToast?.('Please specify a product name for the bill items.', 'error');
      return;
    }

    const cleanName = (customerName || 'Walk-in Customer').trim();
    const cleanPhone = (customerPhone || '').replace(/[^0-9+]/g, '');
    const cleanEmail = (customerEmail || '').trim() || (cleanPhone ? `${cleanPhone.replace('+', '')}@jalyn.in` : 'pos-counter@jalyn.in');
    const cleanAddress = (shippingAddress || 'In-Store Counter Pickup').trim();

    const payload = {
      customer_name: cleanName,
      customer_email: cleanEmail,
      customer_phone: cleanPhone || null,
      shipping_address: cleanAddress,
      total_amount: grandTotal,
      discount_amount: discountAmount,
      shipping_amount: Number(shippingFee) || 0,
      order_type: billingMode === 'counter' ? 'pos' : 'online',
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      order_status: orderStatus,
      items: validItems.map((i) => ({
        product_id: i.product_id || null,
        product_name: i.product_name.trim(),
        sku: i.sku || null,
        price: Number(i.price) || 0,
        quantity: Number(i.quantity) || 1,
        size: i.size || null,
        color: i.color || null,
        image_url: i.image_url || null,
      })),
    };

    setSubmitting(true);
    try {
      // 1. Always Auto-Save to MySQL Database first
      const res = await api.post('/orders', payload);
      const createdOrder = res.data?.order || {
        ...payload,
        id: Date.now(),
        order_number: `ORD-${Date.now().toString().slice(-6)}`,
        created_at: new Date().toISOString(),
      };

      showToast?.(res.data?.message || 'Order & Bill saved to database successfully!');

      // 2. Handle Thermal Receipt or Tax Invoice print using saved DB order
      if (printAction === 'thermal') {
        printThermalReceipt(createdOrder);
      } else if (printAction === 'invoice') {
        printTaxInvoice(createdOrder);
      }

      // 3. Handle WhatsApp sharing if requested
      if (triggerWhatsApp && cleanPhone) {
        sendPosWhatsAppInvoice(createdOrder, includeReviewLinks);
      }

      onOrderCreated?.();
      onClose();
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Failed to create order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for sending POS Luxury Tax Invoice over WhatsApp
  const sendPosWhatsAppInvoice = (order, includeSocial = true) => {
    const success = sendLuxuryWhatsAppInvoice(order, { includeSocial });
    if (!success) {
      showToast?.('No WhatsApp phone number provided.', 'error');
      return;
    }
    showToast?.('Opening WhatsApp with luxury tax invoice.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[96vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Bar (Solid Theme Color) */}
        <div className="px-5 py-3.5 bg-[#2A1A22] text-white flex items-center justify-between border-b border-[#3D2631] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/15">
              <Store className="w-5 h-5 text-pink-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base tracking-wide flex items-center gap-2">
                JALYN POS &amp; Billing Counter
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-white/15 rounded-full text-pink-200 tracking-wider border border-white/10">
                  Live Counter
                </span>
              </h3>
              <p className="text-[11px] text-gray-300">Auto-populate by SKU/name, scan QR/barcode, and print thermal receipt instantly.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleModeChange('counter')}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  billingMode === 'counter' ? 'bg-white text-[#2A1A22] shadow-sm font-bold' : 'text-white/80 hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" /> In-Store (Counter)
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('delivery')}
                className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer ${
                  billingMode === 'delivery' ? 'bg-white text-[#2A1A22] shadow-sm font-bold' : 'text-white/80 hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" /> Courier Order
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/15 transition cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - 2 Columns on Desktop */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-gray-200 bg-[#FDFBFD]">
          
          {/* Left Column: Product Search & Bill Items Table (7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto">
            
            {/* Live Product / SKU Auto-Populate Search Bar with Scanner Trigger */}
            <div className="relative space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-[#AD4A85]" /> Search Product or SKU (Auto-Populate)
                </label>
                <button
                  type="button"
                  onClick={() => setShowScannerModal(!showScannerModal)}
                  className="px-2.5 py-1 bg-[#2A1A22] hover:bg-[#3D2631] text-white text-[11px] font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Scan className="w-3.5 h-3.5 text-pink-300" />
                  <span>Scan Barcode / QR</span>
                </button>
              </div>

              {/* Scan Feedback Banner */}
              {scanFeedback && (
                <div className={`p-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150 ${
                  scanFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {scanFeedback.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                  <span>{scanFeedback.text}</span>
                </div>
              )}

              {/* Camera / Manual Quick Scanner Input Box */}
              {showScannerModal && (
                <div className="p-3 bg-gray-900 text-white rounded-xl border border-gray-700 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-1.5 text-pink-300">
                      <Scan className="w-4 h-4" /> Live Barcode &amp; QR Scanner Ready
                    </span>
                    <span className="text-[10px] text-gray-400">Scan or type JN-00000 / SKU-0U02</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      autoFocus
                      value={scanInputText}
                      onChange={(e) => setScanInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && scanInputText.trim()) {
                          e.preventDefault();
                          handleBarcodeOrQrScanned(scanInputText.trim());
                          setScanInputText('');
                        }
                      }}
                      placeholder="Point scanner here or type code & hit Enter..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-gray-800 text-white text-xs font-mono border border-gray-600 focus:border-pink-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (scanInputText.trim()) {
                          handleBarcodeOrQrScanned(scanInputText.trim());
                          setScanInputText('');
                        }
                      }}
                      className="px-3 py-1.5 bg-[#AD4A85] hover:bg-[#963c71] text-white text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Lookup &amp; Add
                    </button>
                  </div>
                </div>
              )}

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Type product name, SKU # (e.g. SKU-0U02) or barcode (JN-00000)..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-[#AD4A85] focus:border-[#AD4A85] bg-white shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown */}
              {searchFocused && searchQuery.trim() && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-200 z-30 max-h-72 overflow-y-auto divide-y divide-gray-100">
                  {loadingProducts ? (
                    <div className="p-4 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#AD4A85]" /> Searching catalog...
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="p-4 text-center text-xs text-gray-500">
                      No products found matching "<strong>{searchQuery}</strong>".
                      <button
                        type="button"
                        onClick={() => {
                          handleAddCustomItem();
                          setSearchQuery('');
                          setSearchFocused(false);
                        }}
                        className="block mx-auto mt-2 text-xs font-bold text-[#AD4A85] hover:underline"
                      >
                        + Add as Custom Item
                      </button>
                    </div>
                  ) : (
                    searchResults.map((prod) => {
                      const img = prod.primary_image || prod.image || prod.image_url || (Array.isArray(prod.images) && prod.images[0]);
                      const inStock = Number(prod.stock || prod.total_stock) > 0 || prod.in_stock !== false;
                      const displaySku = prod.base_sku || prod.sku || `SKU-${prod.id}`;

                      return (
                        <div
                          key={prod.id || prod.sku}
                          className="p-2.5 hover:bg-[#FAF0E6] transition flex items-center justify-between gap-3 cursor-pointer group"
                          onClick={() => handleAddProduct(prod)}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {img ? (
                              <img
                                src={img}
                                alt=""
                                className="w-11 h-11 object-cover rounded-lg border border-gray-200 shrink-0 bg-white"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-pink-50 border border-pink-200 flex items-center justify-center text-[#AD4A85] shrink-0">
                                <ShoppingBag className="w-5 h-5" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="font-bold text-xs text-gray-900 truncate group-hover:text-[#AD4A85] transition">
                                {prod.title || prod.name}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[10px]">
                                <span className="font-mono px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded font-bold border border-gray-200">
                                  {displaySku}
                                </span>
                                {prod.category_slug && (
                                  <span className="text-gray-500 uppercase text-[9px]">{prod.category_slug}</span>
                                )}
                                <span className={`px-1.5 py-0.5 rounded font-bold text-[9px] ${
                                  inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                                }`}>
                                  {inStock ? `Stock: ${prod.stock || prod.total_stock || '✓'}` : 'Out of Stock'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <div className="font-bold text-xs text-[#AD4A85]">{money(prod.price)}</div>
                              {prod.compare_price > prod.price && (
                                <div className="text-[10px] text-gray-400 line-through">{money(prod.compare_price)}</div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddProduct(prod);
                              }}
                              className="px-2.5 py-1.5 bg-[#2A1A22] hover:bg-[#3D2631] text-white text-[11px] font-bold rounded-lg transition shadow-xs flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5 text-pink-300" /> Add
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Bill Line Items Table (Spacious Redesigned Card Layout with Zero Overlap) */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#AD4A85]" /> Bill Items ({billItems.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="text-[11px] font-bold text-[#AD4A85] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> + Custom Line Item
                </button>
              </div>

              {billItems.length === 0 ? (
                <div className="flex-1 min-h-[220px] rounded-xl border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-pink-50 text-[#AD4A85] flex items-center justify-center mb-2">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-xs text-gray-800">No items added to the bill yet</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 max-w-xs">
                    Search product title or SKU above, or scan barcode to automatically add products.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    className="mt-3 px-3.5 py-1.5 bg-[#2A1A22] text-white hover:bg-[#3D2631] font-bold text-xs rounded-xl transition"
                  >
                    + Add Custom Item
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {billItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-white rounded-xl border border-gray-200/90 shadow-xs flex flex-col gap-2.5 hover:border-pink-200 transition"
                    >
                      {/* Top Row: Thumbnail + Product Name (Full Width) + SKU + Size */}
                      <div className="flex items-start gap-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt=""
                            className="w-11 h-11 object-cover rounded-lg border border-gray-200 bg-white shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-lg bg-pink-50 border border-pink-100 flex items-center justify-center text-[#AD4A85] shrink-0 font-bold text-xs">
                            {idx + 1}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={item.product_name}
                            onChange={(e) => handleUpdateItem(idx, 'product_name', e.target.value)}
                            placeholder="Product Title *"
                            className="w-full text-xs font-bold text-gray-900 border-b border-transparent hover:border-gray-300 focus:border-[#AD4A85] outline-none bg-transparent"
                          />

                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                              <Tag className="w-3 h-3 text-gray-400" />
                              <input
                                type="text"
                                value={item.sku || ''}
                                onChange={(e) => handleUpdateItem(idx, 'sku', e.target.value.toUpperCase())}
                                placeholder="SKU-0U02"
                                className="font-mono text-[10px] font-bold text-gray-700 bg-transparent w-20 outline-none uppercase"
                              />
                            </div>

                            {item.available_sizes?.length > 0 ? (
                              <select
                                value={item.size || ''}
                                onChange={(e) => handleUpdateItem(idx, 'size', e.target.value)}
                                className="text-[10px] font-bold bg-gray-50 px-2 py-1 rounded border border-gray-200 outline-none text-gray-700"
                              >
                                {item.available_sizes.map((s) => (
                                  <option key={s} value={s}>Size: {s}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={item.size || ''}
                                onChange={(e) => handleUpdateItem(idx, 'size', e.target.value)}
                                placeholder="Size"
                                className="text-[10px] font-bold bg-gray-50 px-2 py-1 rounded border border-gray-200 w-16 outline-none text-gray-700"
                              />
                            )}

                            {item.color && (
                              <span className="text-[10px] font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                                {item.color}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Clear separated Rate (₹), Qty Stepper, Line Total & Delete */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
                        {/* Rate Input */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase text-gray-500">Rate:</span>
                          <div className="relative">
                            <span className="absolute left-2 top-1.5 text-xs text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={item.price}
                              onChange={(e) => handleUpdateItem(idx, 'price', e.target.value)}
                              placeholder="0"
                              className="w-24 pl-5 pr-2 py-1 text-xs font-bold text-gray-900 border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#AD4A85] outline-none bg-white"
                            />
                          </div>
                        </div>

                        {/* Qty Stepper */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold uppercase text-gray-500">Qty:</span>
                          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                            <button
                              type="button"
                              onClick={() => {
                                const q = Math.max((Number(item.quantity) || 1) - 1, 1);
                                handleUpdateItem(idx, 'quantity', q);
                              }}
                              className="px-2.5 py-1 hover:bg-gray-200 text-gray-600 transition"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 py-1 text-xs font-bold text-gray-900 bg-white min-w-[24px] text-center border-x border-gray-200">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const q = (Number(item.quantity) || 1) + 1;
                                handleUpdateItem(idx, 'quantity', q);
                              }}
                              className="px-2.5 py-1 hover:bg-gray-200 text-gray-600 transition"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Amount & Trash */}
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="text-[9px] font-bold uppercase text-gray-400">Total</div>
                            <div className="font-extrabold text-xs text-[#AD4A85]">
                              {money((Number(item.price) || 0) * (Number(item.quantity) || 1))}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remove Line Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Customer Info, Payment & Fulfillment, Bill Actions (5 Cols) */}
          <div className="lg:col-span-5 p-4 sm:p-5 flex flex-col gap-4 bg-white overflow-y-auto">
            
            {/* Customer Details (All Optional) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#AD4A85]" /> Customer Details (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerName('Walk-in Customer');
                    setCustomerPhone('');
                  }}
                  className="text-[10px] font-bold text-[#AD4A85] hover:underline"
                >
                  Quick Walk-in
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name (Optional)"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#AD4A85] outline-none"
                  />
                </div>
                <div>
                  <div className="relative flex items-center">
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Mobile / WhatsApp (Optional)"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#AD4A85] outline-none"
                    />
                  </div>
                </div>
              </div>

              {billingMode === 'delivery' && (
                <>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="Customer Email Address"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#AD4A85] outline-none"
                  />
                  <textarea
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Delivery Address (House #, Street, City, Pincode)..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#AD4A85] outline-none"
                  />
                </>
              )}
            </div>

            {/* Payment Method Selection (Cash, UPI, Card) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#AD4A85]" /> Payment Method
              </label>

              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.slice(0, 3).map((pm) => {
                  const Icon = pm.icon;
                  const active = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => {
                        setPaymentMethod(pm.id);
                        if (paymentStatus === 'pending') setPaymentStatus('paid');
                      }}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center gap-1 cursor-pointer ${
                        active
                          ? 'border-[#2A1A22] bg-gray-900 text-white font-bold shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600 bg-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-pink-300' : 'text-gray-400'}`} />
                      <span className="text-[11px]">{pm.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Extra Payment options dropdown */}
              <div className="mt-2 flex items-center justify-between text-[11px]">
                <span className="text-gray-500 font-medium">Other methods:</span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
                >
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Card">Card (POS Terminal)</option>
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                </select>
              </div>
            </div>

            {/* Payment & Fulfillment Status */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 font-semibold bg-white"
                >
                  <option value="paid">✓ Paid</option>
                  <option value="pending">⏳ Payment Pending</option>
                  <option value="failed">✕ Payment Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Fulfillment Status</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-gray-200 font-semibold bg-white"
                >
                  <option value="delivered">✓ Delivered (Immediate)</option>
                  <option value="processing">📦 Processing</option>
                  <option value="shipped">🚚 Shipped</option>
                  <option value="pending">🕒 Pending</option>
                </select>
              </div>
            </div>

            {/* Discount & Calculations */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/90 space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-600">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-gray-900">{money(subtotal)}</span>
              </div>

              {/* Discount Row */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-gray-600">Discount:</span>
                <div className="flex items-center gap-1.5">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    className="px-1.5 py-0.5 rounded border border-gray-200 text-[10px] bg-white font-bold"
                  >
                    <option value="flat">₹ Flat</option>
                    <option value="percent">% Off</option>
                  </select>
                  <input
                    type="number"
                    min="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    placeholder="0"
                    className="w-16 px-1.5 py-0.5 rounded border border-gray-200 text-xs font-bold text-right bg-white"
                  />
                  {discountAmount > 0 && (
                    <span className="text-emerald-700 font-bold text-[11px]">−{money(discountAmount)}</span>
                  )}
                </div>
              </div>

              {billingMode === 'delivery' && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Shipping Charge:</span>
                  <input
                    type="number"
                    min="0"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(e.target.value)}
                    placeholder="0"
                    className="w-20 px-1.5 py-0.5 rounded border border-gray-200 text-xs font-bold text-right bg-white"
                  />
                </div>
              )}

              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                <span className="font-extrabold text-sm text-gray-900">Grand Total:</span>
                <span className="font-extrabold text-base text-[#AD4A85]">{money(grandTotal)}</span>
              </div>
            </div>

            {/* Optional WhatsApp Review & Social Links Toggle */}
            <label className="flex items-center gap-2 text-[11px] text-gray-600 cursor-pointer bg-gray-50 p-2 rounded-xl border border-gray-200">
              <input
                type="checkbox"
                checked={includeReviewLinks}
                onChange={(e) => setIncludeReviewLinks(e.target.checked)}
                className="rounded border-gray-300 text-[#AD4A85] focus:ring-[#AD4A85]"
              />
              <span>Include Google Review &amp; Social Links on WhatsApp Bill</span>
            </label>

            {/* Action Buttons: Thermal Print, Invoice Print, Create Order (All Auto-Save to DB) */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                disabled={submitting || billItems.length === 0}
                onClick={() => handleCreateOrder('thermal')}
                className="w-full py-2.5 px-4 bg-[#2A1A22] hover:bg-[#3D2631] text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4 text-pink-300" />}
                Save &amp; Print Thermal Bill (80mm)
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={submitting || billItems.length === 0}
                  onClick={() => handleCreateOrder('invoice')}
                  className="py-2 px-3 bg-white hover:bg-gray-50 text-[#2A1A22] border border-gray-300 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-[#AD4A85]" /> Print Tax Invoice
                </button>

                <button
                  type="button"
                  disabled={submitting || billItems.length === 0}
                  onClick={() => handleCreateOrder(null, !!customerPhone)}
                  className="py-2 px-3 bg-[#AD4A85] hover:bg-[#963c71] text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {customerPhone ? <Send className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                  {customerPhone ? 'Save & WhatsApp' : 'Save Order Only'}
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
