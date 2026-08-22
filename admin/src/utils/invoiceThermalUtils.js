import jalynLogoUrl from '../assets/jalyn-logo-login.png';
import jalynLogoSmallUrl from '../assets/jalyn-logo-small.jpg';
import { getThermalSettings } from './thermalSettings';

const escapeHtml = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const formatDate = (val) => {
  if (!val) return '—';
  const d = new Date(String(val).includes(' ') ? String(val).replace(' ', 'T') : val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const formatTime = (val) => {
  const d = val ? new Date(String(val).includes(' ') ? String(val).replace(' ', 'T') : val) : new Date();
  if (isNaN(d)) return '';
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
};

const money = (v) => '₹' + Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const itemTotal = (items) =>
  (items || []).reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity || i.qty) || 1), 0);

/**
 * Redesigned Luxury Tax Invoice (A4 Format)
 * Matches JALYN Brand Theme (#2A1A22, #AD4A85, #FAF0E6, #D4A373)
 */
export const buildInvoiceHtml = (order) => {
  const items = order.items || [];
  const subtotal = itemTotal(items);
  const discount = Number(order.discount_amount) || 0;
  const shipping = Number(order.shipping_amount) || 0;
  const total = Number(order.total_amount) || Math.max(subtotal + shipping - discount, 0);
  const paymentStatus = (order.payment_status || 'paid').toLowerCase();
  const paymentMethod = order.payment_method || 'Cash / Counter';

  const rows = items
    .map((it, i) => {
      const qty = Number(it.quantity || it.qty) || 1;
      const price = Number(it.price) || 0;
      const variantParts = [
        it.sku && `SKU: ${it.sku}`,
        it.size && `Size: ${it.size}`,
        it.color && `Color: ${it.color}`,
      ].filter(Boolean);
      const variantText = variantParts.join(' · ');

      return `
      <tr>
        <td style="text-align: center; color: #8C7B83; font-weight: 600;">${i + 1}</td>
        <td>
          <div style="font-weight: 700; color: #1E1218; font-size: 13px;">${escapeHtml(it.product_name || it.name || 'Item')}</div>
          ${variantText ? `<div style="font-size: 11px; color: #7A626E; margin-top: 2px;">${escapeHtml(variantText)}</div>` : ''}
        </td>
        <td style="text-align: center; font-weight: 700; color: #1E1218;">${qty}</td>
        <td style="text-align: right; color: #4A3B43;">${money(price)}</td>
        <td style="text-align: right; font-weight: 700; color: #AD4A85;">${money(price * qty)}</td>
      </tr>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Tax Invoice — ${escapeHtml(order.order_number || order.id)}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #2A1A22;
    background: #F4EBEF;
    padding: 24px 12px;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .invoice-container {
    max-width: 820px;
    margin: 0 auto;
    background: #FFFFFF;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 12px 36px rgba(42, 26, 34, 0.08);
    border: 1px solid #EEDCE5;
  }
  .inv-header {
    background: linear-gradient(135deg, #2A1A22 0%, #4A223B 60%, #AD4A85 100%);
    color: #FFFFFF;
    padding: 32px 36px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .logo-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .logo-img {
    height: 52px;
    width: auto;
    object-fit: contain;
    filter: drop-shadow(0 2px 8px rgba(0,0,0,0.25));
  }
  .brand-tagline {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 2.5px;
    color: #F3D5E3;
    font-weight: 500;
  }
  .inv-title-box {
    text-align: right;
  }
  .inv-title {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #FFFFFF;
  }
  .inv-badge {
    display: inline-block;
    background: rgba(255, 255, 255, 0.18);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #FFFFFF;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 3px 10px;
    border-radius: 20px;
    margin-top: 6px;
  }
  .inv-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding: 24px 36px;
    background: #FFF9FB;
    border-bottom: 1px solid #F1E2EB;
  }
  .meta-card {
    font-size: 12px;
    line-height: 1.65;
    color: #55444D;
  }
  .meta-card-title {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: #AD4A85;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .meta-card strong {
    color: #1E1218;
    font-weight: 700;
  }
  .items-table-wrapper {
    padding: 16px 36px 0;
  }
  .items-table {
    width: 100%;
    border-collapse: collapse;
  }
  .items-table th {
    background: #F8EDF3;
    color: #7A2859;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    padding: 12px 14px;
    border-bottom: 2px solid #E6CDDC;
  }
  .items-table td {
    padding: 14px;
    font-size: 12.5px;
    border-bottom: 1px solid #F3E5ED;
    vertical-align: top;
  }
  .summary-section {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 24px 36px;
    gap: 24px;
  }
  .summary-notes {
    flex: 1;
    font-size: 11.5px;
    color: #6E5C66;
    line-height: 1.7;
    background: #FAEFF4;
    padding: 16px;
    border-radius: 12px;
    border: 1px solid #EEDCE5;
  }
  .summary-notes strong {
    color: #2A1A22;
  }
  .summary-box {
    min-width: 260px;
    font-size: 12.5px;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    color: #55444D;
  }
  .summary-row span:last-child {
    font-weight: 600;
    color: #2A1A22;
  }
  .summary-grand {
    display: flex;
    justify-content: space-between;
    padding: 10px 0 0;
    margin-top: 8px;
    border-top: 2px solid #AD4A85;
    font-size: 16px;
    font-weight: 800;
    color: #2A1A22;
  }
  .summary-grand span:last-child {
    color: #AD4A85;
    font-size: 18px;
  }
  .inv-footer {
    background: #2A1A22;
    color: #F3D5E3;
    padding: 16px 36px;
    text-align: center;
    font-size: 11px;
    line-height: 1.6;
    border-top: 1px solid rgba(255,255,255,0.1);
  }
  .inv-footer strong {
    color: #FFFFFF;
  }
  @media print {
    body {
      background: #FFFFFF !important;
      padding: 0 !important;
    }
    .invoice-container {
      box-shadow: none !important;
      border: none !important;
      border-radius: 0 !important;
      max-width: 100% !important;
    }
  }
</style>
</head>
<body>
  <div class="invoice-container">
    <!-- Header -->
    <header class="inv-header">
      <div class="logo-wrapper">
        <img src="${jalynLogoUrl}" alt="JALYN" class="logo-img" />
        <div class="brand-tagline">Style Meets Comfort &middot; Luxury Wear</div>
      </div>
      <div class="inv-title-box">
        <div class="inv-title">Tax Invoice</div>
        <div style="font-size: 12px; color: #F3D5E3; margin-top: 2px;"># ${escapeHtml(order.order_number || order.id)}</div>
        <div class="inv-badge">${paymentStatus === 'paid' ? '✓ PAID' : 'PENDING'}</div>
      </div>
    </header>

    <!-- Metadata / Parties -->
    <div class="inv-meta-grid">
      <div class="meta-card">
        <div class="meta-card-title">Sold &amp; Dispatched By</div>
        <strong>JALYN Apparels India Pvt. Ltd.</strong><br />
        Fashion District, 42 Luxury Boulevard<br />
        Mumbai, Maharashtra — 400001<br />
        GSTIN: <strong>27AABCJ9876Q1Z2</strong> &middot; State: 27<br />
        Support: care@jalyn.in &middot; +91 98765 43210
      </div>
      <div class="meta-card">
        <div class="meta-card-title">Billed / Delivered To</div>
        <strong>${escapeHtml(order.customer_name || 'Walk-in Customer')}</strong><br />
        ${order.customer_phone ? `Phone: <strong>${escapeHtml(order.customer_phone)}</strong><br />` : ''}
        ${order.customer_email ? `Email: ${escapeHtml(order.customer_email)}<br />` : ''}
        Address: ${escapeHtml(order.shipping_address || 'In-Store Counter Pickup')}<br />
        Invoice Date: <strong>${formatDate(order.created_at || new Date())}</strong>
      </div>
    </div>

    <!-- Items Table -->
    <div class="items-table-wrapper">
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th>Item &amp; Description</th>
            <th style="width: 70px; text-align: center;">Qty</th>
            <th style="width: 120px; text-align: right;">Unit Price</th>
            <th style="width: 130px; text-align: right;">Total Amount</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>

    <!-- Summary & Payment details -->
    <div class="summary-section">
      <div class="summary-notes">
        <div style="font-weight: 700; color: #AD4A85; margin-bottom: 4px; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Payment &amp; Order Information</div>
        <div>Payment Method: <strong>${escapeHtml(paymentMethod)}</strong></div>
        <div>Payment Status: <strong>${paymentStatus.toUpperCase()}</strong></div>
        <div>Order Status: <strong>${escapeHtml((order.order_status || 'delivered').toUpperCase())}</strong></div>
        ${order.tracking_id ? `<div>Courier AWB: <strong>${escapeHtml(order.tracking_id)}</strong></div>` : ''}
        <div style="margin-top: 6px; font-size: 10.5px; color: #88747F;">* All prices are inclusive of applicable GST. Items eligible for exchange within 7 days with original invoice &amp; tags intact.</div>
      </div>

      <div class="summary-box">
        <div class="summary-row">
          <span>Items Subtotal</span>
          <span>${money(subtotal)}</span>
        </div>
        ${discount > 0 ? `
        <div class="summary-row" style="color: #059669;">
          <span>Discount Applied</span>
          <span>− ${money(discount)}</span>
        </div>` : ''}
        ${shipping > 0 ? `
        <div class="summary-row">
          <span>Shipping &amp; Handling</span>
          <span>${money(shipping)}</span>
        </div>` : `
        <div class="summary-row">
          <span>Shipping</span>
          <span style="color: #059669; font-weight: 700;">FREE</span>
        </div>`}
        <div class="summary-grand">
          <span>Grand Total</span>
          <span>${money(total)}</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="inv-footer">
      Thank you for shopping at <strong>JALYN Apparels</strong> &middot; Where Style Meets Comfort<br />
      This is a digitally certified, computer-generated Tax Invoice.
    </footer>
  </div>
</body>
</html>`;
};

const formatReceiptDate = (val) => {
  if (!val) {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  }
  const dObj = new Date(String(val).includes(' ') ? String(val).replace(' ', 'T') : val);
  if (isNaN(dObj)) return String(val);
  return `${String(dObj.getDate()).padStart(2, '0')}/${String(dObj.getMonth() + 1).padStart(2, '0')}/${dObj.getFullYear()}`;
};

/**
 * Thermal POS Receipt Format (Screenshot 1 Indian Tax Invoice Layout)
 * Supports 80mm / 58mm roll widths with full CRUD customization toggles
 */
export const buildThermalHtml = (order, customSettings = {}) => {
  const cfg = { ...getThermalSettings(), ...customSettings };
  const items = order.items || [];
  const totalQty = items.reduce((sum, it) => sum + (Number(it.quantity || it.qty) || 1), 0);
  const subtotal = itemTotal(items);
  const discount = Number(order.discount_amount) || 0;
  const shipping = Number(order.shipping_amount) || 0;
  const total = Number(order.total_amount) || Math.max(subtotal + shipping - discount, 0);
  const gstRate = Number(order.gst_rate !== undefined ? order.gst_rate : (cfg.defaultGstRate !== undefined ? cfg.defaultGstRate : 5));
  const isGstInclusive = order.is_gst_inclusive !== undefined ? !!order.is_gst_inclusive : cfg.isGstInclusive !== false;

  let taxableAmount = 0;
  let totalGst = 0;

  if (isGstInclusive) {
    taxableAmount = Math.round((total / (1 + gstRate / 100)) * 100) / 100;
    totalGst = Math.round((total - taxableAmount) * 100) / 100;
  } else {
    taxableAmount = Math.round((subtotal - discount) * 100) / 100;
    totalGst = Math.round((taxableAmount * (gstRate / 100)) * 100) / 100;
  }

  const halfGstRate = (gstRate / 2).toFixed(1).replace(/\.0$/, '');
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = Math.round((totalGst / 2) * 100) / 100;

  const orderNum = order.order_number || order.id || '1833';
  const orderDate = formatReceiptDate(order.created_at || new Date());
  const customerName = order.customer_name || 'Cash Sale';
  const customerPhone = order.customer_phone || cfg.phone || '';
  const placeOfSupply = order.place_of_supply || cfg.placeOfSupply || 'Tamil Nadu';
  const shipTo = order.shipping_address && order.shipping_address !== 'In-Store Counter Pickup'
    ? order.shipping_address
    : (cfg.defaultShipTo || 'Business Name');

  let youSaved = discount;
  if (order.total_mrp && order.total_mrp > total) {
    youSaved = order.total_mrp - total;
  }

  const receivedAmount = order.received_amount !== undefined && order.received_amount !== ''
    ? Number(order.received_amount)
    : total;
  const balanceAmount = order.balance_amount !== undefined && order.balance_amount !== ''
    ? Number(order.balance_amount)
    : Math.max(0, receivedAmount - total);

  const rows = items
    .map((it, idx) => {
      const qty = Number(it.quantity || it.qty) || 1;
      const price = Number(it.price) || 0;
      const itemGst = Number(it.gst_rate !== undefined ? it.gst_rate : gstRate);
      const itemTaxableRate = (price / (1 + itemGst / 100)).toFixed(2);

      const variantParts = [it.sku, it.size, it.color].filter(Boolean);
      const variantText = variantParts.join(', ');

      return `
      <div class="item-line">
        <div class="col-num">${idx + 1}</div>
        <div class="col-desc">
          <div class="item-title">${escapeHtml(it.product_name || it.name || 'Item')}</div>
          ${variantText ? `<div class="item-sub">${escapeHtml(variantText)}</div>` : ''}
          ${cfg.showItemGstRate ? `<div class="item-sub">GST: ${itemGst}%</div>` : ''}
        </div>
        <div class="col-qty">${qty} ${escapeHtml(it.unit || 'Qty')}</div>
        ${cfg.showItemRate ? `<div class="col-rate">${itemTaxableRate}</div>` : ''}
        <div class="col-amt">${price * qty}</div>
      </div>`;
    })
    .join('');

  const paperWidth = cfg.paperWidth || '80mm';
  const logoSource = cfg.logoUrl || jalynLogoSmallUrl;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Tax Invoice - ${escapeHtml(orderNum)}</title>
<style>
  @page {
    size: ${paperWidth} auto;
    margin: 0;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    width: ${paperWidth};
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.4;
    font-weight: 800;
    color: #000000;
    background: #FFFFFF;
    padding: 3mm 3.5mm 5mm;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .center { text-align: center; }
  .right { text-align: right; }
  .bold { font-weight: 900; }

  /* Store Header */
  .store-header {
    text-align: center;
    margin-bottom: 2.5mm;
  }
  .store-logo {
    max-height: 46px;
    width: auto;
    object-fit: contain;
    margin: 0 auto 2mm;
    display: block;
    filter: contrast(150%);
  }
  .store-title {
    font-size: 16px;
    font-weight: 900;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    color: #000000;
  }
  .store-sub {
    font-size: 11px;
    font-weight: 800;
    line-height: 1.35;
    color: #000000;
  }
  .inv-heading {
    font-size: 13.5px;
    font-weight: 900;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    text-align: center;
    margin: 2mm 0 1.5mm;
    color: #000000;
  }

  /* Divider */
  .divider {
    border: none;
    border-top: 1.5px dashed #000000;
    margin: 2mm 0;
  }
  .solid-divider {
    border: none;
    border-top: 1.5px solid #000000;
    margin: 1.5mm 0;
  }

  /* Meta Section */
  .meta-grid {
    font-size: 11.5px;
    line-height: 1.5;
    font-weight: 800;
    color: #000000;
  }
  .meta-row {
    display: flex;
    justify-content: space-between;
  }
  .meta-label {
    font-weight: 800;
    color: #000000;
  }
  .meta-val {
    font-weight: 900;
    color: #000000;
  }

  /* Items Table */
  .items-table {
    margin: 1.5mm 0;
  }
  .table-header {
    display: flex;
    font-weight: 900;
    font-size: 11.5px;
    padding-bottom: 1mm;
    border-bottom: 1.5px solid #000000;
    color: #000000;
  }
  .item-line {
    display: flex;
    font-size: 11.5px;
    font-weight: 800;
    padding: 1.5mm 0;
    border-bottom: 1px dashed #888888;
    align-items: flex-start;
    color: #000000;
  }
  .col-num { width: 16px; font-weight: 900; }
  .col-desc { flex: 1; padding: 0 4px; }
  .item-title { font-weight: 900; text-transform: uppercase; font-size: 11.5px; color: #000000; }
  .item-sub { font-size: 10px; font-weight: 800; color: #111111; margin-top: 1px; }
  .col-qty { width: 44px; text-align: center; font-weight: 800; font-size: 11px; }
  .col-rate { width: 52px; text-align: right; font-weight: 800; font-size: 11px; }
  .col-amt { width: 48px; text-align: right; font-weight: 900; font-size: 11.5px; }

  /* Calculations & Totals */
  .totals-section {
    font-size: 11.5px;
    line-height: 1.55;
    font-weight: 800;
    color: #000000;
  }
  .calc-row {
    display: flex;
    justify-content: space-between;
    font-weight: 800;
    color: #000000;
  }
  .grand-row {
    display: flex;
    justify-content: space-between;
    font-size: 15px;
    font-weight: 900;
    padding: 1.5mm 0;
    border-top: 1.5px solid #000000;
    border-bottom: 1.5px solid #000000;
    margin: 1.5mm 0;
    color: #000000;
  }

  /* Footer */
  .footer-box {
    text-align: center;
    font-size: 11px;
    font-weight: 800;
    margin-top: 3mm;
    line-height: 1.4;
    color: #000000;
  }

  @media print {
    body {
      width: ${paperWidth};
      padding: 1mm 2mm;
    }
  }
</style>
</head>
<body>
  ${cfg.showStoreHeader ? `
  <div class="store-header">
    ${cfg.showLogo && logoSource ? `<img src="${logoSource}" alt="JALYN" class="store-logo" />` : ''}
    <div class="store-title">${escapeHtml(cfg.storeName)}</div>
    ${cfg.showAddress ? `
      ${cfg.shopNo ? `<div class="store-sub">${escapeHtml(cfg.shopNo)}</div>` : ''}
      ${cfg.addressLine2 ? `<div class="store-sub">${escapeHtml(cfg.addressLine2)}</div>` : ''}
      ${cfg.cityStatePin ? `<div class="store-sub">${escapeHtml(cfg.cityStatePin)}</div>` : ''}
    ` : ''}
    ${cfg.showPhone && cfg.phone ? `<div class="store-sub">Phone No : ${escapeHtml(cfg.phone)}</div>` : ''}
    ${cfg.showGstin && cfg.gstin ? `<div class="store-sub" style="font-weight: 900;">GST : ${escapeHtml(cfg.gstin)}</div>` : ''}
    ${cfg.showEmail && cfg.email ? `<div class="store-sub">Email : ${escapeHtml(cfg.email)}</div>` : ''}
  </div>` : ''}

  ${cfg.showInvoiceTitle ? `<div class="inv-heading">${escapeHtml(cfg.invoiceTitle)}</div>` : ''}

  ${cfg.showCustomerInfo ? `
  <div class="meta-grid">
    <div class="meta-row">
      <span class="meta-label">Invoice No :</span>
      <span class="meta-val">${escapeHtml(orderNum)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Date :</span>
      <span class="meta-val">${escapeHtml(orderDate)}</span>
    </div>
    <div class="meta-row">
      <span class="meta-label">Bill To :</span>
      <span class="meta-val">${escapeHtml(customerName)}</span>
    </div>
    ${cfg.showCustomerPhone && customerPhone ? `
    <div class="meta-row">
      <span class="meta-label">Ph. :</span>
      <span class="meta-val">${escapeHtml(customerPhone)}</span>
    </div>` : ''}
    ${cfg.showPlaceOfSupply && placeOfSupply ? `
    <div class="meta-row">
      <span class="meta-label">Place of Supply :</span>
      <span class="meta-val">${escapeHtml(placeOfSupply)}</span>
    </div>` : ''}
    ${cfg.showShipTo && shipTo ? `
    <div class="meta-row">
      <span class="meta-label">Ship To :</span>
      <span class="meta-val">${escapeHtml(shipTo)}</span>
    </div>` : ''}
  </div>` : ''}

  <hr class="divider" />

  <!-- Items Table -->
  <div class="items-table">
    <div class="table-header">
      <span class="col-num">#</span>
      <span class="col-desc">Item</span>
      <span class="col-qty">Qty</span>
      ${cfg.showItemRate ? '<span class="col-rate">Rate</span>' : ''}
      <span class="col-amt">Amt</span>
    </div>
    ${rows}
  </div>

  <hr class="divider" />

  <!-- Totals Section -->
  <div class="totals-section">
    <div class="calc-row bold">
      <span>Sub Total</span>
      <span>${totalQty}</span>
      <span>₹ ${subtotal.toLocaleString('en-IN')}</span>
    </div>

    ${cfg.showTaxBreakdown ? `
    <div class="calc-row">
      <span>Taxable Amount</span>
      <span>₹ ${taxableAmount.toFixed(2)}</span>
    </div>
    <div class="calc-row">
      <span>CGST @${halfGstRate}%</span>
      <span>₹ ${cgst.toFixed(1)}</span>
    </div>
    <div class="calc-row">
      <span>SGST @${halfGstRate}%</span>
      <span>₹ ${sgst.toFixed(1)}</span>
    </div>` : ''}

    <div class="grand-row">
      <span>Total</span>
      <span>₹ ${total.toLocaleString('en-IN')}</span>
    </div>

    ${cfg.showYouSaved && youSaved > 0 ? `
    <div class="calc-row bold" style="color: #000;">
      <span>You Saved</span>
      <span>- ₹ ${youSaved.toLocaleString('en-IN')}</span>
    </div>` : ''}

    ${cfg.showReceivedBalance ? `
    <div class="calc-row bold">
      <span>Received</span>
      <span>₹ ${receivedAmount.toLocaleString('en-IN')}</span>
    </div>
    <div class="calc-row bold">
      <span>Balance Amount</span>
      <span>₹ ${balanceAmount.toLocaleString('en-IN')}</span>
    </div>` : ''}
  </div>

  ${cfg.showFooterMessage ? `
  <div class="footer-box">
    <div class="bold">${escapeHtml(cfg.footerMessage)}</div>
    ${cfg.termsNote ? `<div style="font-size: 8.5px; color: #444; margin-top: 1mm;">${escapeHtml(cfg.termsNote)}</div>` : ''}
  </div>` : ''}
</body>
</html>`;
};

/**
 * Trigger Instant Thermal Bill Print
 */
export const printThermalReceipt = (order, customSettings = {}) => {
  const win = window.open('', '_blank', 'width=440,height=720');
  if (!win) {
    alert('Popup blocked. Please allow popups to print the thermal bill.');
    return;
  }
  win.document.write(buildThermalHtml(order, customSettings));
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 250);
};

/**
 * Trigger Instant Luxury Tax Invoice Print
 */
export const printTaxInvoice = (order) => {
  const win = window.open('', '_blank', 'width=880,height=960');
  if (!win) {
    alert('Popup blocked. Please allow popups to print the Tax Invoice.');
    return;
  }
  win.document.write(buildInvoiceHtml(order));
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 250);
};

/**
 * Format & Send Complete Luxury Tax Invoice over WhatsApp
 */
export const formatLuxuryWhatsAppInvoice = (order, options = {}) => {
  const items = order.items || [];
  const subtotal = itemTotal(items);
  const discount = Number(order.discount_amount) || 0;
  const shipping = Number(order.shipping_amount) || 0;
  const total = Number(order.total_amount) || Math.max(subtotal + shipping - discount, 0);
  const taxable = Math.round((total / 1.05) * 100) / 100;
  const totalGst = Math.round((total - taxable) * 100) / 100;
  const cgst = Math.round((totalGst / 2) * 100) / 100;
  const sgst = Math.round((totalGst / 2) * 100) / 100;

  const lines = [
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `✨ *JALYN APPARELS* ✨`,
    `*OFFICIAL TAX & RETAIL INVOICE*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `*Invoice No:* ${order.order_number || order.id}`,
    `*Date & Time:* ${formatDate(order.created_at)}`,
    `*GSTIN:* 27AABCJ9876Q1Z2`,
    `*State / POS:* Maharashtra (27)`,
    ``,
    `*Billed To:* ${order.customer_name || 'Walk-in Customer'}`,
    ...(order.customer_phone ? [`*Phone:* ${order.customer_phone}`] : []),
    ...(order.shipping_address && order.shipping_address !== 'In-Store Counter Pickup' ? [`*Delivery Address:* ${order.shipping_address}`] : []),
    ``,
    `🛍️ *ITEMIZED PARTICULARS:*`,
    `──────────────────────`,
    ...items.map((it, idx) => {
      const qty = Number(it.quantity || it.qty) || 1;
      const price = Number(it.price) || 0;
      const lineTotal = price * qty;
      const variantParts = [it.sku && `SKU: ${it.sku}`, it.size && `Size: ${it.size}`, it.color && `Color: ${it.color}`].filter(Boolean);
      const vText = variantParts.length > 0 ? ` (${variantParts.join(', ')})` : '';
      return `${idx + 1}. *${it.product_name || 'Item'}*${vText}\n   └ ${qty} pcs × ₹${price.toLocaleString('en-IN')} = *₹${lineTotal.toLocaleString('en-IN')}*`;
    }),
    `──────────────────────`,
    `*Subtotal:* ₹${subtotal.toLocaleString('en-IN')}`,
    ...(discount > 0 ? [`*Special Discount:* −₹${discount.toLocaleString('en-IN')}`] : []),
    ...(shipping > 0 ? [`*Shipping Charges:* +₹${shipping.toLocaleString('en-IN')}`] : []),
    `*Taxable Value:* ₹${taxable.toLocaleString('en-IN')}`,
    `*CGST (2.5%):* ₹${cgst.toLocaleString('en-IN')}`,
    `*SGST (2.5%):* ₹${sgst.toLocaleString('en-IN')}`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `💰 *NET PAYABLE:* *₹${total.toLocaleString('en-IN')}*`,
    `━━━━━━━━━━━━━━━━━━━━━━`,
    `*Payment Mode:* ${order.payment_method || 'Cash'} · ${(order.payment_status || 'PAID').toUpperCase()}`,
    `*Fulfillment:* ${(order.order_status || 'DELIVERED').toUpperCase()}`,
    ``,
    `*Thank you for choosing JALYN Apparels!*`,
    `_This is a computer-generated luxury tax invoice._`,
  ];

  if (options.includeSocial !== false) {
    lines.push(
      ``,
      `⭐ *Rate our Store on Google:* https://g.page/r/jalyn/review`,
      `📸 *Instagram:* https://instagram.com/jalyn.in`,
      `🌐 *Website:* https://jalyn.in`
    );
  }

  return lines.join('\n');
};

export const sendLuxuryWhatsAppInvoice = (order, options = {}) => {
  const rawPhone = String(order.customer_phone || '').replace(/\D/g, '');
  if (!rawPhone) return false;
  const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;
  const message = formatLuxuryWhatsAppInvoice(order, options);
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  return true;
};

