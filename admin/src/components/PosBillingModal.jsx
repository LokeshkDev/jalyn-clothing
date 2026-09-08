import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import api from '../services/api';
import {
  X, Search, Plus, Trash2, Loader2, Printer, FileText, Check,
  ShoppingBag, CreditCard, Banknote, Smartphone, Store, Truck,
  User, Phone, Mail, MapPin, Tag, Sparkles, AlertCircle, IndianRupee,
  Minus, Scan, Camera, Send, QrCode, Star, Instagram, Globe, RefreshCw, Settings, Percent
} from 'lucide-react';
import { printThermalReceipt, printTaxInvoice, sendLuxuryWhatsAppInvoice } from '../utils/invoiceThermalUtils';
import { playSuccessBeep, playErrorBeep } from '../utils/audioFeedback';
import useScannerInput from '../hooks/useScannerInput';
import ThermalSettingsModal from './ThermalSettingsModal';
import { getThermalSettings } from '../utils/thermalSettings';
import { calculateOrderTax, getApparelGstRate, calculateItemTax } from '../utils/taxUtils';

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
  const [barcodesList, setBarcodesList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchInputRef = useRef(null);
  const scanInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const lastScannedRef = useRef({ code: '', timestamp: 0 });

  // Thermal format settings modal
  const [showThermalSettingsModal, setShowThermalSettingsModal] = useState(false);

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

  // GST Calculation Configuration (Default 5% Apparel Slab, Inclusive by Default)
  const [gstRate, setGstRate] = useState(5);
  const [isGstInclusive, setIsGstInclusive] = useState(true);

  // Cash Received & Change Calculation
  const [amountReceived, setAmountReceived] = useState('');

  // WhatsApp Review & Social Links Options
  const [includeReviewLinks, setIncludeReviewLinks] = useState(true);

  // Discounts & Additional Charges
  const [discountType, setDiscountType] = useState('flat'); // 'flat' or 'percent'
  const [discountValue, setDiscountValue] = useState('');
  const [shippingFee, setShippingFee] = useState(0);

  // Scan / Enter Product Price Entry Selection: 'selling' (Discounted Price) or 'mrp' (Tag MRP)
  const [defaultPriceType, setDefaultPriceType] = useState('selling');

  // Processing state
  const [submitting, setSubmitting] = useState(false);

  // JCoins Loyalty State
  const [jcoinsData, setJcoinsData] = useState(null);
  const [loadingJcoins, setLoadingJcoins] = useState(false);
  const [selectedJcoinsRedeem, setSelectedJcoinsRedeem] = useState(0);

  // Auto Lookup Customer & JCoins Balance by Phone
  useEffect(() => {
    const cleanPhone = (customerPhone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length >= 10) {
      setLoadingJcoins(true);
      api.get('/jcoins/lookup', { params: { phone: cleanPhone } })
        .then((res) => {
          if (res.data?.success && res.data?.found) {
            setJcoinsData(res.data);
            if (res.data.customer?.name && (customerName === 'Walk-in Customer' || !customerName)) {
              setCustomerName(res.data.customer.name);
            }
            if (res.data.customer?.email && !customerEmail) {
              setCustomerEmail(res.data.customer.email);
            }
          } else {
            setJcoinsData(null);
            setSelectedJcoinsRedeem(0);
          }
        })
        .catch((err) => {
          console.warn('JCoins customer lookup error:', err);
          setJcoinsData(null);
          setSelectedJcoinsRedeem(0);
        })
        .finally(() => setLoadingJcoins(false));
    } else {
      setJcoinsData(null);
      setSelectedJcoinsRedeem(0);
    }
  }, [customerPhone]);

  // Load product catalog and thermal default settings on open
  useEffect(() => {
    if (isOpen) {
      const currentSettings = getThermalSettings();
      if (currentSettings?.defaultGstRate !== undefined) {
        setGstRate(Number(currentSettings.defaultGstRate));
      }
      if (currentSettings?.isGstInclusive !== undefined) {
        setIsGstInclusive(!!currentSettings.isGstInclusive);
      }
      loadProductCatalog();
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const loadProductCatalog = async () => {
    setLoadingProducts(true);
    try {
      const [pRes, bRes] = await Promise.all([
        api.get('/products', { params: { include_offline: '1' } }),
        api.get('/barcodes', { params: { status: 'active', limit: 2000 } }).catch(() => ({ data: { data: [] } }))
      ]);
      const raw = pRes.data?.products || (Array.isArray(pRes.data) ? pRes.data : []);
      const barcodes = bRes.data?.data || (Array.isArray(bRes.data) ? bRes.data : []);
      setProducts(raw);
      setBarcodesList(barcodes);
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
    const rawColor = selectedColor || (Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : (product.color || ''));
    const defaultColor = typeof rawColor === 'object' ? (rawColor?.name || rawColor?.label || '') : String(rawColor || '');
    
    const mrp = Number(product.original_price) || Number(product.compare_price) || Number(product.price) || 0;
    const sellingPrice = Number(product.price) > 0 ? Number(product.price) : mrp;
    const appliedPrice = (defaultPriceType === 'mrp' && mrp > 0) ? mrp : sellingPrice;

    const imageUrl = product.primary_image || product.image || product.image_url || (Array.isArray(product.images) && product.images[0]) || '';
    const sku = product.base_sku || product.sku || (product.id ? `SKU-${product.id}` : '');
    const hsnCode = product.hsn_code || '6204';
    const itemGstRate = getApparelGstRate(appliedPrice);

    setBillItems((prev) => {
      const existingIndex = prev.findIndex(
        (it) => (it.product_id === product.id || (it.sku && it.sku === sku)) && it.size === defaultSize
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        const prevQty = Number(updated[existingIndex].quantity) || 1;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: prevQty + 1,
        };
        return updated;
      }

      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.title || product.name || 'Untitled Item',
          barcode_short_name: product.barcode_short_name || product.short_name || '',
          sku: sku,
          hsn_code: hsnCode,
          price: appliedPrice,
          mrp: mrp,
          selling_price: sellingPrice,
          original_price: mrp,
          price_type: defaultPriceType,
          base_price: product.base_price
            ? Number(product.base_price)
            : (appliedPrice > 0
              ? Math.round((appliedPrice / (1 + itemGstRate / 100)) * 100) / 100
              : ''),
          gst_rate: itemGstRate,
          quantity: 1,
          size: defaultSize,
          color: defaultColor,
          image_url: imageUrl,
          available_sizes: Array.isArray(product.sizes) ? product.sizes : [],
          available_colors: Array.isArray(product.colors) ? product.colors : [],
        },
      ];
    });

    setSearchQuery('');
    setSearchFocused(false);
  };

  // Handle barcode / QR scan or manual barcode/SKU/Short Name typing
  const handleBarcodeOrQrScanned = useCallback(
    async (code) => {
      if (!code || !isOpen) return false;
      const clean = String(code).trim().toLowerCase();
      if (!clean) return false;

      // Prevent duplicate scan within 600ms for exact same barcode
      const now = Date.now();
      if (lastScannedRef.current.code === clean && (now - lastScannedRef.current.timestamp < 600)) {
        return true;
      }
      lastScannedRef.current = { code: clean, timestamp: now };

      // 1. Check in barcodesList (exact barcode match e.g. JN-12345 or 12345, or barcode_short_name match)
      const matchedBarcode = barcodesList.find((b) => {
        const bCode = (b.barcode || '').toLowerCase();
        const bShort = (b.barcode_short_name || '').toLowerCase();
        return bCode === clean || bCode.replace('jn-', '') === clean || bCode.replace(/^0+/, '') === clean || bShort === clean;
      });

      let matchedProduct = null;
      let selectedSize = null;
      let selectedColor = null;

      if (matchedBarcode) {
        matchedProduct = products.find((p) => p.id === matchedBarcode.product_id);
        selectedSize = matchedBarcode.size || null;
        selectedColor = matchedBarcode.color || null;
      }

      // 2. Check in products array by barcode, SKU, barcode_short_name, product_code, title, or ID
      if (!matchedProduct) {
        matchedProduct = products.find((p) => {
          const b = (p.barcode || '').toLowerCase();
          const s = (p.base_sku || p.sku || '').toLowerCase();
          const sn = (p.barcode_short_name || p.short_name || '').toLowerCase();
          const c = (p.product_code || '').toLowerCase();
          const t = (p.title || p.name || '').toLowerCase();
          const idMatch = String(p.id) === clean;
          return b === clean || s === clean || sn === clean || c === clean || t === clean || idMatch;
        });
      }

      // 3. Fallback: Query backend API for barcode if not in initial list
      if (!matchedProduct) {
        try {
          const lookupRes = await api.get('/barcodes', { params: { search: code.trim(), limit: 5 } });
          const foundBarcodes = lookupRes.data?.data || [];
          if (foundBarcodes.length > 0) {
            const exact = foundBarcodes.find((b) => {
              const bCode = (b.barcode || '').toLowerCase();
              return bCode === clean || bCode.replace('jn-', '') === clean;
            }) || foundBarcodes[0];

            selectedSize = exact.size || null;
            selectedColor = exact.color || null;
            matchedProduct = products.find((p) => p.id === exact.product_id);
            if (!matchedProduct) {
              const pRes = await api.get(`/products/${exact.product_id}`);
              matchedProduct = pRes.data?.product || pRes.data;
            }
          }
        } catch (err) {
          console.warn('Barcode remote lookup error:', err);
        }
      }

      if (matchedProduct) {
        playSuccessBeep();
        handleAddProduct(matchedProduct, selectedSize, selectedColor);
        const feedbackMsg = `✓ Scanned: "${matchedProduct.title || matchedProduct.name}" ${selectedSize ? `(${selectedSize}${selectedColor ? ` / ${selectedColor}` : ''})` : ''} added to bill`;
        setScanFeedback({
          type: 'success',
          text: feedbackMsg
        });
        showToast?.(feedbackMsg);
        setSearchQuery('');
        setScanInputText('');
        setTimeout(() => setScanFeedback(null), 3500);
        return true;
      } else {
        playErrorBeep();
        const errFeedback = `✕ No product found matching barcode "${code.trim().toUpperCase()}"`;
        setScanFeedback({ type: 'error', text: errFeedback });
        showToast?.(errFeedback, 'error');
        setTimeout(() => setScanFeedback(null), 4000);
        return false;
      }
    },
    [products, barcodesList, isOpen]
  );

  // Hook hardware scanner listener
  useScannerInput((scannedCode) => {
    if (isOpen) {
      handleBarcodeOrQrScanned(scannedCode);
    }
  });

  // Filtered Products for Live Search & SKU/Barcode/Short-Name Auto-populate
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    // Find product IDs matching barcodes or barcode short names
    const matchingBarcodeProductIds = new Set(
      barcodesList
        .filter((b) => (b.barcode || '').toLowerCase().includes(q) || (b.barcode_short_name || '').toLowerCase().includes(q))
        .map((b) => b.product_id)
    );

    return products
      .filter((p) => {
        const titleMatch = (p.title || p.name || '').toLowerCase().includes(q);
        const shortNameMatch = (p.barcode_short_name || p.short_name || '').toLowerCase().includes(q);
        const skuMatch = (p.base_sku || p.sku || '').toLowerCase().includes(q);
        const prodCodeMatch = (p.product_code || '').toLowerCase().includes(q);
        const barcodeMatch = (p.barcode || '').toLowerCase().includes(q) || matchingBarcodeProductIds.has(p.id);
        const catMatch = (p.category || p.category_name || p.category_slug || '').toLowerCase().includes(q);
        return titleMatch || shortNameMatch || skuMatch || prodCodeMatch || barcodeMatch || catMatch;
      })
      .slice(0, 10); // Top 10 matches
  }, [searchQuery, products, barcodesList]);

  // Add empty custom item
  const handleAddCustomItem = () => {
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    setBillItems([
      ...billItems,
      {
        product_id: null,
        product_name: '',
        barcode_short_name: '',
        sku: `SKU-${randomHex}`,
        hsn_code: '6204',
        price: '',
        original_price: '',
        base_price: '',
        gst_rate: 5,
        quantity: 1,
        size: 'Free Size',
        color: '',
        image_url: '',
        available_sizes: ['Free Size', 'S', 'M', 'L', 'XL', 'XXL'],
        available_colors: [],
      },
    ]);
  };

  // Update line item details (rate edits dynamically update item's GST rate slab + base price, and auto-populates product by SKU/Short Name)
  const handleUpdateItem = (index, field, value) => {
    const updated = [...billItems];
    updated[index][field] = value;

    // AUTO-POPULATE when user types or edits SKU or Barcode Short Name
    if ((field === 'sku' || field === 'barcode_short_name') && value && value.trim().length >= 2) {
      const cleanVal = value.trim().toLowerCase();
      const matched = products.find((p) => {
        const pSku = (p.base_sku || p.sku || '').toLowerCase();
        const pShort = (p.barcode_short_name || p.short_name || '').toLowerCase();
        const pBarcode = (p.barcode || '').toLowerCase();
        const pCode = (p.product_code || '').toLowerCase();
        return pSku === cleanVal || pShort === cleanVal || pBarcode === cleanVal || pCode === cleanVal;
      });

      if (matched) {
        const mrp = Number(matched.original_price) || Number(matched.compare_price) || Number(matched.price) || 0;
        const itemGstRate = getApparelGstRate(mrp);
        const defaultSize = Array.isArray(matched.sizes) && matched.sizes.length > 0 ? matched.sizes[0] : (matched.size || 'Free Size');
        const defaultColor = Array.isArray(matched.colors) && matched.colors.length > 0 ? matched.colors[0] : (matched.color || '');

        updated[index].product_id = matched.id;
        updated[index].product_name = matched.title || matched.name || 'Untitled Item';
        updated[index].barcode_short_name = matched.barcode_short_name || matched.short_name || '';
        updated[index].sku = matched.base_sku || matched.sku || updated[index].sku;
        updated[index].hsn_code = matched.hsn_code || '6204';
        updated[index].price = mrp;
        updated[index].original_price = mrp;
        updated[index].gst_rate = itemGstRate;
        if (isGstInclusive) {
          updated[index].base_price = mrp > 0 ? Math.round((mrp / (1 + itemGstRate / 100)) * 100) / 100 : '';
        } else {
          updated[index].base_price = mrp;
        }
        updated[index].size = updated[index].size || defaultSize;
        updated[index].color = updated[index].color || defaultColor;
        updated[index].image_url = matched.primary_image || matched.image || matched.image_url || '';
        updated[index].available_sizes = Array.isArray(matched.sizes) ? matched.sizes : [];
        updated[index].available_colors = Array.isArray(matched.colors) ? matched.colors : [];
      }
    }

    if (field === 'price') {
      // RATE (MRP) changed → recalculate base_price from MRP
      const p = Number(value) || 0;
      const rate = p <= 2500 ? 5 : 18;
      updated[index].gst_rate = rate;
      if (isGstInclusive) {
        updated[index].base_price = Math.round((p / (1 + rate / 100)) * 100) / 100;
      } else {
        updated[index].base_price = p;
      }
    } else if (field === 'base_price') {
      // BASE PRICE changed → recalculate MRP (rate) from base price
      const base = Number(value) || 0;
      const rate = base <= 2500 ? 5 : 18;
      updated[index].gst_rate = rate;
      const mrp = Math.round(base * (1 + rate / 100));
      updated[index].price = mrp;
    }

    setBillItems(updated);
  };

  // Toggle item unit price between Selling Price (SP) and Tag MRP
  const handleSelectPriceType = (index, type) => {
    const updated = [...billItems];
    const item = updated[index];
    const targetPrice = type === 'mrp'
      ? (Number(item.mrp) || Number(item.original_price) || Number(item.price))
      : (Number(item.selling_price) || Number(item.price));

    updated[index].price = targetPrice;
    updated[index].price_type = type;
    const rate = getApparelGstRate(targetPrice);
    updated[index].gst_rate = rate;
    if (isGstInclusive) {
      updated[index].base_price = targetPrice > 0 ? Math.round((targetPrice / (1 + rate / 100)) * 100) / 100 : '';
    } else {
      updated[index].base_price = targetPrice;
    }
    setBillItems(updated);
  };

  // Remove line item
  const handleRemoveItem = (index) => {
    setBillItems(billItems.filter((_, i) => i !== index));
  };

  // Calculations
  const discountAmount = useMemo(() => {
    const rawSubtotal = billItems.reduce((sum, item) => {
      const p = Number(item.price) || 0;
      const q = Number(item.quantity) || 1;
      return sum + p * q;
    }, 0);
    const val = Number(discountValue) || 0;
    if (val <= 0) return 0;
    if (discountType === 'percent') {
      return Math.min(Math.round((rawSubtotal * val) / 100), rawSubtotal);
    }
    return Math.min(val, rawSubtotal);
  }, [billItems, discountType, discountValue]);

  // JCoins Instant Redemption Discount Calculation
  const jcoinsDiscountAmount = useMemo(() => {
    if (!selectedJcoinsRedeem || !jcoinsData?.customer?.jcoins_balance) return 0;
    const avail = Number(jcoinsData.customer.jcoins_balance || 0);
    if (avail < selectedJcoinsRedeem) return 0;
    const rawSubtotal = billItems.reduce((sum, item) => {
      const p = Number(item.price) || 0;
      const q = Number(item.quantity) || 1;
      return sum + p * q;
    }, 0);
    const afterManualDiscount = Math.max(0, rawSubtotal - discountAmount);
    const discountRs = Math.round(Number(selectedJcoinsRedeem) * 0.25 * 100) / 100;
    return Math.min(discountRs, afterManualDiscount);
  }, [selectedJcoinsRedeem, jcoinsData, billItems, discountAmount]);

  // Unified Multi-Item Dynamic GST Calculation
  const orderTax = useMemo(() => {
    return calculateOrderTax({
      items: billItems,
      discountAmount: discountAmount + jcoinsDiscountAmount,
      shippingAmount: Number(shippingFee) || 0,
      isGstInclusive,
      shippingState: shippingAddress,
    });
  }, [billItems, discountAmount, jcoinsDiscountAmount, shippingFee, isGstInclusive, shippingAddress]);

  const {
    subtotal,
    totalMrp,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTax,
    grandTotal,
    isInterState: isOrderInterstate,
    slab5,
    slab18,
  } = orderTax;

  const receivedNum = amountReceived !== '' ? Number(amountReceived) : grandTotal;
  const balanceAmount = receivedNum > grandTotal ? Math.round((receivedNum - grandTotal) * 100) / 100 : 0;

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
    const cleanPhone = (customerPhone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      showToast?.('Customer Phone Number is mandatory (minimum 10 digits required for billing).', 'error');
      if (phoneInputRef.current) {
        phoneInputRef.current.focus();
        phoneInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    const cleanEmail = (customerEmail || '').trim() || `${cleanPhone}@jalyn.in`;
    const cleanAddress = (shippingAddress || 'In-Store Counter Pickup').trim();

    const dominantGstRate =
      slab18.itemCount > 0 && slab5.itemCount === 0
        ? 18
        : (slab5.itemCount > 0 && slab18.itemCount === 0 ? 5 : null);

    const payload = {
      customer_name: cleanName,
      customer_email: cleanEmail,
      customer_phone: cleanPhone,
      shipping_address: cleanAddress,
      total_amount: grandTotal,
      discount_amount: discountAmount,
      jcoins_redeemed: selectedJcoinsRedeem,
      jcoins_discount: jcoinsDiscountAmount,
      shipping_amount: Number(shippingFee) || 0,
      gst_rate: dominantGstRate,
      is_gst_inclusive: isGstInclusive ? 1 : 0,
      taxable_amount: taxableAmount,
      cgst_amount: cgstAmount,
      sgst_amount: sgstAmount,
      igst_amount: igstAmount,
      received_amount: receivedNum,
      balance_amount: balanceAmount,
      total_mrp: totalMrp,
      order_type: billingMode === 'counter' ? 'pos' : 'online',
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      order_status: orderStatus,
      items: orderTax.items.map((i) => ({
        product_id: i.product_id || null,
        product_name: i.product_name.trim(),
        sku: i.sku || null,
        hsn_code: i.hsnCode || '6204',
        price: Number(i.price) || 0,
        original_price: Number(i.original_price) || Number(i.price) || 0,
        quantity: Number(i.quantity) || 1,
        gst_rate: Number(i.gstRate) || 5,
        taxable_amount: Number(i.taxableAmount) || 0,
        cgst_amount: Number(i.cgstAmount) || 0,
        sgst_amount: Number(i.sgstAmount) || 0,
        igst_amount: Number(i.igstAmount) || 0,
        total_tax: Number(i.totalTax) || 0,
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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-2 md:p-3 overflow-hidden">
      <div className="bg-white rounded-none sm:rounded-2xl w-full max-w-[98vw] 2xl:max-w-[1850px] h-full sm:h-[97vh] overflow-hidden shadow-2xl flex flex-col border border-gray-200 animate-in fade-in zoom-in-95 duration-200">
        
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
                  Full Workstation
                </span>
              </h3>
              <p className="text-[11px] text-gray-300">Auto-populate by SKU/name, scan QR/barcode, and print thermal receipt instantly.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Receipt Settings & Mode Switcher */}
            <button
              type="button"
              onClick={() => setShowThermalSettingsModal(true)}
              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-xl transition flex items-center gap-1.5 text-xs font-bold border border-white/10 cursor-pointer"
              title="Configure Thermal Receipt Format"
            >
              <Settings className="w-3.5 h-3.5 text-pink-300" />
              <span className="hidden sm:inline">Receipt Settings</span>
            </button>

            {/* Default Scan Price Entry Switcher (Selling Price vs Tag MRP) */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-xs font-semibold" title="Default price to apply when scanning or adding products">
              <button
                type="button"
                onClick={() => setDefaultPriceType('selling')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  defaultPriceType === 'selling' ? 'bg-[#AD4A85] text-white shadow-sm font-bold' : 'text-white/80 hover:text-white'
                }`}
              >
                <Tag className="w-3 h-3 text-pink-200" /> Selling Price
              </button>
              <button
                type="button"
                onClick={() => setDefaultPriceType('mrp')}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer ${
                  defaultPriceType === 'mrp' ? 'bg-[#2A1A22] text-white shadow-sm font-bold' : 'text-white/80 hover:text-white'
                }`}
              >
                <IndianRupee className="w-3 h-3 text-amber-300" /> Tag MRP
              </button>
            </div>

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
          
          {/* Left Column: Product Search & Bill Items Table (8 Cols on xl) */}
          <div className="lg:col-span-7 xl:col-span-8 p-4 sm:p-6 flex flex-col gap-4 overflow-y-auto">
            
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
                      <Scan className="w-4 h-4" /> Barcode &amp; QR Entry
                    </span>
                    <span className="text-[10px] text-gray-400">Type/scan barcode e.g. JN-12345 or 12345</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      ref={scanInputRef}
                      type="text"
                      autoFocus
                      id="pos-barcode-scanner-input"
                      data-scan-capture="true"
                      value={scanInputText}
                      onChange={(e) => {
                        setScanInputText(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && scanInputText.trim()) {
                          e.preventDefault();
                          handleBarcodeOrQrScanned(scanInputText.trim());
                          setScanInputText('');
                        }
                      }}
                      placeholder="Enter barcode number (e.g. JN-12345) & hit Enter to auto-populate..."
                      className="flex-1 px-3 py-2 rounded-lg bg-gray-800 text-white text-xs font-mono border border-gray-600 focus:border-pink-400 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (scanInputText.trim()) {
                          handleBarcodeOrQrScanned(scanInputText.trim());
                          setScanInputText('');
                        }
                      }}
                      className="px-3.5 py-2 bg-[#AD4A85] hover:bg-[#963c71] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" /> Auto-Add
                    </button>
                  </div>
                </div>
              )}

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  id="pos-main-search-input"
                  data-scan-capture="true"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      e.preventDefault();
                      const success = await handleBarcodeOrQrScanned(searchQuery.trim());
                      if (success) {
                        setSearchQuery('');
                        setSearchFocused(false);
                      } else if (searchResults.length === 1) {
                        handleAddProduct(searchResults[0]);
                        setSearchQuery('');
                        setSearchFocused(false);
                      }
                    }
                  }}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Scan barcode gun or type product name, SKU # (e.g. SKU-0U02) or barcode (JN-00000)..."
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
                      const mrp = Number(prod.original_price) || Number(prod.compare_price) || Number(prod.price) || 0;
                      const matchedBarcode = barcodesList.find(
                        (b) => b.product_id === prod.id && (b.barcode || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
                      );

                      return (
                        <div
                          key={prod.id || prod.sku}
                          className="p-2.5 hover:bg-[#FAF0E6] transition flex items-center justify-between gap-3 cursor-pointer group"
                          onClick={() => handleAddProduct(prod, matchedBarcode?.size || null, matchedBarcode?.color || null)}
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
                                {prod.barcode_short_name && (
                                  <span className="font-bold px-1.5 py-0.5 bg-pink-50 text-[#AD4A85] rounded border border-pink-200 text-[10px]">
                                    🏷️ {prod.barcode_short_name}
                                  </span>
                                )}
                                {matchedBarcode && (
                                  <span className="font-mono px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded font-bold border border-purple-200">
                                    🏷️ {matchedBarcode.barcode} {matchedBarcode.size ? `(${matchedBarcode.size})` : ''}
                                  </span>
                                )}
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
                              <div className="font-bold text-xs text-[#AD4A85]">{money(mrp)}</div>
                              {mrp > Number(prod.price) && (
                                <div className="text-[10px] text-gray-400 line-through">{money(prod.price)}</div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddProduct(prod, matchedBarcode?.size || null, matchedBarcode?.color || null);
                              }}
                              className="px-2.5 py-1.5 bg-[#2A1A22] hover:bg-[#3D2631] text-white text-[11px] font-bold rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Add
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
                    Search product title, Barcode Short Name, or SKU above, or scan barcode to automatically add products.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddCustomItem}
                    className="mt-3 px-3.5 py-1.5 bg-[#2A1A22] text-white hover:bg-[#3D2631] font-bold text-xs rounded-xl transition cursor-pointer"
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
                      {/* Top Row: Thumbnail + Product Name (Full Width) + Short Name + SKU + Size */}
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
                            {/* Barcode Short Name (On Barcode) */}
                            <div className="flex items-center gap-1 bg-pink-50/80 px-2 py-0.5 rounded border border-pink-200" title="Barcode Short Name (printed on barcode label) — typing auto-populates product">
                              <span className="text-[9px] text-[#AD4A85] font-extrabold uppercase tracking-wider">Short:</span>
                              <input
                                type="text"
                                value={item.barcode_short_name || ''}
                                onChange={(e) => handleUpdateItem(idx, 'barcode_short_name', e.target.value.toUpperCase())}
                                placeholder="SHORT NAME"
                                className="font-bold text-[10px] text-pink-950 bg-transparent w-24 outline-none uppercase placeholder:text-pink-300"
                              />
                            </div>

                            {/* SKU Code */}
                            <div className="flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded border border-gray-200" title="SKU Code — typing auto-populates product">
                              <Tag className="w-3 h-3 text-gray-400" />
                              <input
                                type="text"
                                value={item.sku || ''}
                                onChange={(e) => handleUpdateItem(idx, 'sku', e.target.value.toUpperCase())}
                                placeholder="SKU-0U02"
                                className="font-mono text-[10px] font-bold text-gray-700 bg-transparent w-20 outline-none uppercase placeholder:text-gray-400"
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
                                {typeof item.color === 'object' ? (item.color.name || item.color.label || '') : String(item.color)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Clear separated Rate (₹), Live GST Slab Badge, Qty Stepper, Line Total & Delete */}
                      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-100 gap-2">
                        {/* Rate / Unit Input + Dynamic Per-Item GST Slab Badge */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase text-gray-500">Rate:</span>
                          <div className="relative">
                            <span className="absolute left-2 top-1.5 text-xs text-gray-400 font-bold">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={item.price}
                              onChange={(e) => handleUpdateItem(idx, 'price', e.target.value)}
                              placeholder="0"
                              className="w-24 pl-5 pr-2 py-1 text-xs font-bold text-gray-900 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#AD4A85] outline-none bg-white"
                            />
                          </div>

                          {/* Quick Price Selector Pill: Selling Price vs Tag MRP */}
                          {(item.selling_price || item.mrp || item.original_price) && (
                            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200" title="Select which price to apply on this bill item">
                              <button
                                type="button"
                                onClick={() => handleSelectPriceType(idx, 'selling')}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                                  Number(item.price) === Number(item.selling_price || item.price) && item.price_type !== 'mrp'
                                    ? 'bg-[#AD4A85] text-white shadow-xs'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                SP: ₹{Number(item.selling_price || item.price).toLocaleString('en-IN')}
                              </button>
                              {(item.mrp || item.original_price) > 0 && Number(item.mrp || item.original_price) !== Number(item.selling_price) && (
                                <button
                                  type="button"
                                  onClick={() => handleSelectPriceType(idx, 'mrp')}
                                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition cursor-pointer ${
                                    Number(item.price) === Number(item.mrp || item.original_price)
                                      ? 'bg-[#2A1A22] text-white shadow-xs'
                                      : 'text-gray-600 hover:text-gray-900'
                                  }`}
                                >
                                  MRP: ₹{Number(item.mrp || item.original_price).toLocaleString('en-IN')}
                                </button>
                              )}
                            </div>
                          )}

                          {/* Dynamic Per-Item GST Slab Badge */}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition ${
                              (Number(item.price) || 0) <= 2500
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : 'bg-amber-50 text-amber-800 border-amber-300'
                            }`}
                            title={`Per unit rate: ₹${item.price || 0}. ${
                              (Number(item.price) || 0) <= 2500
                                ? '≤ ₹2,500 applies 5% GST'
                                : '> ₹2,500 applies 18% GST'
                            }`}
                          >
                            {(Number(item.price) || 0) <= 2500 ? '5% GST' : '18% GST'}
                          </span>

                          <span className="text-[10px] text-gray-400 font-mono">
                            HSN: {item.hsn_code || '6204'}
                          </span>

                          {/* Editable Base Price (Taxable Unit Rate before GST) */}
                          <div
                            className="flex items-center gap-1.5 bg-blue-50/80 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-lg text-[10px] font-semibold"
                            title="Taxable Unit Base Price (excl. GST) — editable, auto-syncs MRP"
                          >
                            <span className="text-blue-700 font-bold uppercase tracking-wider text-[9px]">Base Price:</span>
                            <span className="text-blue-950 font-bold">₹</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.base_price !== '' && item.base_price !== undefined
                                ? item.base_price
                                : (() => {
                                    const unitRate = Number(item.price) || 0;
                                    const rate = unitRate <= 2500 ? 5 : 18;
                                    return isGstInclusive
                                      ? Math.round((unitRate / (1 + rate / 100)) * 100) / 100
                                      : unitRate;
                                  })()
                              }
                              onChange={(e) => handleUpdateItem(idx, 'base_price', e.target.value)}
                              className="w-20 px-1 py-0.5 text-[11px] font-bold font-mono text-blue-950 bg-white border border-blue-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
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
                              className="px-2.5 py-1 hover:bg-gray-200 text-gray-600 transition cursor-pointer"
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
                              className="px-2.5 py-1 hover:bg-gray-200 text-gray-600 transition cursor-pointer"
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
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
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

          {/* Right Column: Customer Info, Payment & Fulfillment, Bill Actions (4 Cols on xl) */}
          <div className="lg:col-span-5 xl:col-span-4 p-4 sm:p-6 flex flex-col gap-4 bg-white overflow-y-auto">
            
            {/* Customer Details */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#AD4A85]" /> Customer Details
                </label>
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                  Phone * Required
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-[#AD4A85] outline-none"
                  />
                </div>
                <div>
                  <div className="relative flex items-center">
                    <input
                      ref={phoneInputRef}
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Mobile No. * (Mandatory)"
                      className={`w-full px-3 py-2 rounded-xl text-xs font-bold outline-none transition ${
                        customerPhone && customerPhone.replace(/[^0-9]/g, '').length >= 10
                          ? 'border border-emerald-400 focus:ring-2 focus:ring-emerald-500 bg-white'
                          : 'border-2 border-red-300 focus:ring-2 focus:ring-red-400 bg-red-50/20'
                      }`}
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

              {/* JCoins Loyalty Badge & Instant Redemption Selector */}
              {customerPhone && customerPhone.replace(/[^0-9]/g, '').length >= 10 && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Customer JCoins Loyalty
                    </span>
                    {loadingJcoins ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                    ) : (
                      <span className="text-xs font-extrabold text-amber-900 bg-amber-200/80 px-2.5 py-0.5 rounded-full border border-amber-300">
                        🪙 {jcoinsData?.customer?.jcoins_balance || 0} JCoins
                      </span>
                    )}
                  </div>

                  {jcoinsData?.customer?.jcoins_balance >= 10 ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] text-amber-800 font-semibold flex items-center justify-between">
                        <span>Redeem JCoins (1 Pt = ₹0.25 discount):</span>
                        <span>Avail: {jcoinsData.customer.jcoins_balance} Pts</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 text-[10px] font-bold">
                        <button
                          type="button"
                          onClick={() => setSelectedJcoinsRedeem(0)}
                          className={`py-1 px-1.5 rounded-lg border transition cursor-pointer text-center ${
                            selectedJcoinsRedeem === 0
                              ? 'bg-amber-900 text-white border-amber-900 shadow-xs'
                              : 'bg-white text-gray-700 border-amber-200 hover:bg-amber-100/50'
                          }`}
                        >
                          None (₹0)
                        </button>
                        <button
                          type="button"
                          disabled={jcoinsData.customer.jcoins_balance < 100}
                          onClick={() => setSelectedJcoinsRedeem(100)}
                          className={`py-1 px-1.5 rounded-lg border transition text-center ${
                            selectedJcoinsRedeem === 100
                              ? 'bg-amber-900 text-white border-amber-900 shadow-xs cursor-pointer'
                              : jcoinsData.customer.jcoins_balance >= 100
                                ? 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100/50 cursor-pointer'
                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          }`}
                        >
                          100 Pts (₹25)
                        </button>
                        <button
                          type="button"
                          disabled={jcoinsData.customer.jcoins_balance < 200}
                          onClick={() => setSelectedJcoinsRedeem(200)}
                          className={`py-1 px-1.5 rounded-lg border transition text-center ${
                            selectedJcoinsRedeem === 200
                              ? 'bg-amber-900 text-white border-amber-900 shadow-xs cursor-pointer'
                              : jcoinsData.customer.jcoins_balance >= 200
                                ? 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100/50 cursor-pointer'
                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          }`}
                        >
                          200 Pts (₹50)
                        </button>
                        <button
                          type="button"
                          disabled={jcoinsData.customer.jcoins_balance < 400}
                          onClick={() => setSelectedJcoinsRedeem(400)}
                          className={`py-1 px-1.5 rounded-lg border transition text-center ${
                            selectedJcoinsRedeem === 400
                              ? 'bg-amber-900 text-white border-amber-900 shadow-xs cursor-pointer'
                              : jcoinsData.customer.jcoins_balance >= 400
                                ? 'bg-white text-amber-900 border-amber-200 hover:bg-amber-100/50 cursor-pointer'
                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          }`}
                        >
                          400 Pts (₹100)
                        </button>
                      </div>
                      {jcoinsDiscountAmount > 0 && (
                        <div className="text-[10px] font-bold text-emerald-800 flex items-center justify-between bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          <span>JCoins Reward ({selectedJcoinsRedeem} Pts):</span>
                          <span>−₹{jcoinsDiscountAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-amber-700 italic">
                      {jcoinsData?.customer
                        ? `Customer has ${jcoinsData.customer.jcoins_balance || 0} JCoins balance.`
                        : 'Enter 10-digit customer mobile no. to check JCoins reward balance.'}
                    </div>
                  )}
                </div>
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

            {/* GST Configuration (Rate & Inclusive Mode) */}
            <div className="p-3 bg-pink-50/50 rounded-xl border border-pink-200/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-[#AD4A85]" /> Apparel GST Configuration
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  slab18.itemCount > 0 && slab5.itemCount > 0
                    ? 'bg-purple-50 text-purple-900 border-purple-300'
                    : slab18.itemCount > 0
                      ? 'bg-amber-50 text-amber-900 border-amber-300'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                }`}>
                  {slab18.itemCount > 0 && slab5.itemCount > 0
                    ? 'Mixed Slabs (5% & 18%)'
                    : slab18.itemCount > 0
                      ? '18% GST (> ₹2,500 pcs)'
                      : '5% GST (≤ ₹2,500 pcs)'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-gray-600">Tax Pricing Mode:</span>
                <select
                  value={isGstInclusive ? 'inclusive' : 'exclusive'}
                  onChange={(e) => setIsGstInclusive(e.target.value === 'inclusive')}
                  className="px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-bold bg-white text-gray-900 focus:ring-1 focus:ring-[#AD4A85] outline-none"
                >
                  <option value="inclusive">MRP Includes GST (Standard)</option>
                  <option value="exclusive">Add GST on top of MRP</option>
                </select>
              </div>
            </div>

            {/* Discount, Taxes & Totals Breakdown */}
            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/90 space-y-2 text-xs">
              <div className="flex items-center justify-between text-gray-600">
                <span>Items MRP Subtotal:</span>
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

              {jcoinsDiscountAmount > 0 && (
                <div className="flex items-center justify-between text-amber-900 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 font-semibold text-[11px]">
                  <span className="flex items-center gap-1">🪙 JCoins ({selectedJcoinsRedeem} Coins):</span>
                  <span className="font-bold text-amber-800">−{money(jcoinsDiscountAmount)}</span>
                </div>
              )}

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

              {/* GST Tax Breakdown */}
              <div className="pt-1.5 border-t border-gray-200 space-y-1 text-[11px] text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Taxable Amount ({isGstInclusive ? 'Back-calculated' : 'Base'}):</span>
                  <span className="font-mono font-medium text-gray-800">{money(taxableAmount)}</span>
                </div>

                {slab5.itemCount > 0 && (
                  <div className="flex items-center justify-between text-[10px] text-emerald-800 bg-emerald-50/50 px-1.5 py-0.5 rounded">
                    <span>5% Slab ({slab5.itemCount} pcs ≤ ₹2.5k, Taxable {money(slab5.taxableAmount)}):</span>
                    <span className="font-mono font-semibold">{money(slab5.totalTax)}</span>
                  </div>
                )}

                {slab18.itemCount > 0 && (
                  <div className="flex items-center justify-between text-[10px] text-amber-800 bg-amber-50/50 px-1.5 py-0.5 rounded">
                    <span>18% Slab ({slab18.itemCount} pcs &gt; ₹2.5k, Taxable {money(slab18.taxableAmount)}):</span>
                    <span className="font-mono font-semibold">{money(slab18.totalTax)}</span>
                  </div>
                )}

                {isOrderInterstate ? (
                  <div className="flex items-center justify-between">
                    <span>IGST (Interstate):</span>
                    <span className="font-mono font-medium text-gray-800">{money(igstAmount)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span>CGST (Intrastate):</span>
                      <span className="font-mono font-medium text-gray-800">{money(cgstAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>SGST (Intrastate):</span>
                      <span className="font-mono font-medium text-gray-800">{money(sgstAmount)}</span>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between font-bold text-gray-700 pt-0.5 border-t border-gray-200/50">
                  <span>Total Tax Included:</span>
                  <span className="font-mono">{money(totalTax)}</span>
                </div>
              </div>

              {/* Grand Total */}
              <div className="pt-2 border-t border-gray-300 flex items-center justify-between">
                <span className="font-extrabold text-sm text-gray-900">Grand Total:</span>
                <span className="font-extrabold text-base text-[#AD4A85]">{money(grandTotal)}</span>
              </div>

              {/* Cash Paid / Received & Change Due */}
              <div className="pt-2 border-t border-dashed border-gray-300 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-700 font-bold">Received (₹):</span>
                  <input
                    type="number"
                    min="0"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    placeholder={String(grandTotal)}
                    className="w-28 px-2.5 py-1 rounded-lg border border-gray-300 text-xs font-bold text-right bg-white focus:ring-1 focus:ring-[#AD4A85] outline-none"
                  />
                </div>

                {amountReceived && Number(amountReceived) >= grandTotal && (
                  <div className="flex items-center justify-between text-emerald-800 font-bold bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                    <span>Change / Balance:</span>
                    <span>{money(balanceAmount)}</span>
                  </div>
                )}
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
                Save &amp; Print Thermal Bill ({getThermalSettings().paperWidth || '80mm'})
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

      {/* Thermal Receipt Settings Modal */}
      <ThermalSettingsModal
        isOpen={showThermalSettingsModal}
        onClose={() => setShowThermalSettingsModal(false)}
        onSaved={(updated) => {
          if (updated?.defaultGstRate !== undefined) setGstRate(Number(updated.defaultGstRate));
          if (updated?.isGstInclusive !== undefined) setIsGstInclusive(!!updated.isGstInclusive);
        }}
      />
    </div>
  );
}
