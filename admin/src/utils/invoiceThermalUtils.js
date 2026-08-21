import jalynLogoUrl from '../assets/jalyn-logo-login.png';
import jalynLogoSmallUrl from '../assets/jalyn-logo-small.jpg';

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

/**
 * High-Contrast Thermal POS Receipt (80mm / 58mm Roll Format)
 * Designed specifically for POS Thermal Printers (Epson, TVS, Star, Xprinter, etc.)
 */
export const buildThermalHtml = (order) => {
  const items = order.items || [];
  const subtotal = itemTotal(items);
  const discount = Number(order.discount_amount) || 0;
  const shipping = Number(order.shipping_amount) || 0;
  const total = Number(order.total_amount) || Math.max(subtotal + shipping - discount, 0);
  const paymentStatus = (order.payment_status || 'paid').toUpperCase();
  const paymentMethod = (order.payment_method || 'CASH').toUpperCase();
  const orderNum = order.order_number || order.id || 'POS-BILL';
  const orderDate = formatDate(order.created_at || new Date());
  const orderTime = formatTime(order.created_at || new Date());

  const rows = items
    .map((it) => {
      const qty = Number(it.quantity || it.qty) || 1;
      const price = Number(it.price) || 0;
      const variantParts = [it.sku && `SKU:${it.sku}`, it.size && `S:${it.size}`, it.color && `C:${it.color}`].filter(Boolean);
      const varStr = variantParts.join(' ');

      return `
      <div class="item-row">
        <div class="item-name">${escapeHtml(it.product_name || it.name || 'Item')}</div>
        ${varStr ? `<div class="item-sku">${escapeHtml(varStr)}</div>` : ''}
        <div class="item-calc">
          <span>${qty} × ${money(price)}</span>
          <span class="bold">${money(price * qty)}</span>
        </div>
      </div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>POS Receipt - ${escapeHtml(orderNum)}</title>
<style>
  @page {
    size: 80mm auto;
    margin: 0;
  }
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    width: 80mm;
    margin: 0 auto;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Courier New', monospace;
    font-size: 11.5px;
    line-height: 1.35;
    color: #000000;
    background: #FFFFFF;
    padding: 4mm 4mm 6mm;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .center { text-align: center; }
  .right { text-align: right; }
  .bold { font-weight: 700; }
  
  .store-logo {
    width: 38mm;
    display: block;
    margin: 0 auto 2mm;
    filter: grayscale(100%) contrast(150%);
  }
  .store-name {
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 2px;
    text-transform: uppercase;
  }
  .store-tag {
    font-size: 9.5px;
    letter-spacing: 1px;
    text-transform: uppercase;
    color: #333;
    margin-top: 1px;
  }
  .store-info {
    font-size: 9.5px;
    color: #222;
    margin-top: 1px;
  }
  .divider {
    border: none;
    border-top: 1px dashed #000000;
    margin: 2.5mm 0;
  }
  .double-divider {
    border: none;
    border-top: 2px solid #000000;
    margin: 2.5mm 0;
  }
  .receipt-meta {
    font-size: 10.5px;
  }
  .meta-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.5px;
  }
  .cust-box {
    font-size: 10.5px;
    margin-top: 1mm;
  }
  .item-row {
    margin-bottom: 2.5mm;
  }
  .item-name {
    font-weight: 700;
    font-size: 11px;
    word-break: break-word;
  }
  .item-sku {
    font-size: 9px;
    color: #444;
    font-family: monospace;
  }
  .item-calc {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    margin-top: 1px;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    margin-bottom: 1.5px;
  }
  .grand-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    font-weight: 800;
    padding-top: 2px;
  }
  .pay-badge {
    display: inline-block;
    border: 1.5px solid #000;
    font-weight: 800;
    padding: 1.5px 6px;
    font-size: 10.5px;
    text-transform: uppercase;
    margin: 2mm 0;
  }
  .barcode-box {
    font-family: 'Courier New', monospace;
    letter-spacing: 4px;
    font-weight: 800;
    font-size: 13px;
    margin: 2mm 0 1mm;
  }
  .footer-msg {
    font-size: 9.5px;
    color: #333;
    line-height: 1.4;
    margin-top: 2mm;
  }
  @media print {
    body {
      width: 80mm;
      padding: 2mm;
    }
  }
</style>
</head>
<body>
  <div class="center">
    <img src="${jalynLogoUrl}" alt="JALYN" class="store-logo" />
    <div class="store-name">JALYN APPARELS</div>
    <div class="store-tag">Style Meets Comfort</div>
    <div class="store-info">42 Luxury Blvd, Mumbai - 400001</div>
    <div class="store-info">GSTIN: 27AABCJ9876Q1Z2 &middot; Tel: +91 98765 43210</div>
  </div>

  <hr class="divider" />

  <div class="receipt-meta">
    <div class="meta-row">
      <span>Bill No:</span>
      <span class="bold">${escapeHtml(orderNum)}</span>
    </div>
    <div class="meta-row">
      <span>Date / Time:</span>
      <span>${escapeHtml(orderDate)}</span>
    </div>
    <div class="meta-row">
      <span>Payment Method:</span>
      <span class="bold">${escapeHtml(paymentMethod)}</span>
    </div>
    <div class="meta-row">
      <span>Payment Status:</span>
      <span class="bold">${escapeHtml(paymentStatus)}</span>
    </div>
  </div>

  <div class="cust-box">
    <div>Customer: <b>${escapeHtml(order.customer_name || 'Walk-in Customer')}</b></div>
    ${order.customer_phone ? `<div>Phone: <b>${escapeHtml(order.customer_phone)}</b></div>` : ''}
  </div>

  <hr class="divider" />

  <!-- Items -->
  <div style="margin-bottom: 2mm;">
    <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 10px; margin-bottom: 2mm; border-bottom: 1px solid #000; padding-bottom: 1mm;">
      <span>ITEM / SKU</span>
      <span>QTY &times; RATE / AMT</span>
    </div>
    ${rows}
  </div>

  <hr class="divider" />

  <!-- Summary Totals -->
  <div>
    <div class="summary-row">
      <span>Subtotal (${items.length} items):</span>
      <span>${money(subtotal)}</span>
    </div>
    ${discount > 0 ? `
    <div class="summary-row">
      <span>Discount:</span>
      <span>− ${money(discount)}</span>
    </div>` : ''}
    ${shipping > 0 ? `
    <div class="summary-row">
      <span>Shipping:</span>
      <span>${money(shipping)}</span>
    </div>` : ''}
    <div class="summary-row" style="font-size: 9.5px; color: #444;">
      <span>(Inclusive of all GST &amp; Taxes)</span>
      <span>5% GST</span>
    </div>

    <hr class="double-divider" />

    <div class="grand-row">
      <span>NET AMOUNT:</span>
      <span>${money(total)}</span>
    </div>
  </div>

  <div class="center" style="margin-top: 3mm;">
    <div class="pay-badge">PAID VIA ${escapeHtml(paymentMethod)}</div>
    <div class="barcode-box">*${escapeHtml(String(orderNum).replace(/[^a-zA-Z0-9]/g, ''))}*</div>
    <div class="footer-msg">
      <b>Thank you for shopping with JALYN!</b><br />
      Exchanges accepted within 7 days with original receipt &amp; tags.<br />
      www.jalyn.in &middot; Follow us @jalyn.official
    </div>
  </div>
</body>
</html>`;
};

/**
 * Trigger Instant Thermal Bill Print
 */
export const printThermalReceipt = (order) => {
  const win = window.open('', '_blank', 'width=420,height=680');
  if (!win) {
    alert('Popup blocked. Please allow popups to print the thermal bill.');
    return;
  }
  win.document.write(buildThermalHtml(order));
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

