import React, { useState, useMemo } from 'react';
import {
  Calendar, Download, Printer, Search, IndianRupee, FileSpreadsheet,
  TrendingUp, ArrowDownRight, ArrowUpRight, CheckCircle2, Clock,
  Filter, RefreshCw, Layers, CreditCard, Banknote, QrCode, Store,
  Globe, ShieldCheck, ChevronDown, Copy, Check
} from 'lucide-react';
import { isWalkinOrder } from '../pages/OrdersPage';

const GST_RATE_PERCENT = 5; // Standard 5% GST for Apparels

const money = (val) => '₹' + Number(val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
const moneyClean = (val) => Number(val || 0).toFixed(2);

const formatDate = (val) => {
  if (!val) return '—';
  const d = new Date(String(val).includes(' ') ? String(val).replace(' ', 'T') : val);
  if (isNaN(d)) return val;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Date Presets Calculation
const getDateRangeForPreset = (preset) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  switch (preset) {
    case 'today':
      return { start: todayStart, end: todayEnd };
    case 'yesterday': {
      const yStart = new Date(todayStart);
      yStart.setDate(yStart.getDate() - 1);
      const yEnd = new Date(todayEnd);
      yEnd.setDate(yEnd.getDate() - 1);
      return { start: yStart, end: yEnd };
    }
    case 'this_week': {
      const day = todayStart.getDay(); // 0 is Sun
      const diff = todayStart.getDate() - day + (day === 0 ? -6 : 1); // Monday
      const wStart = new Date(todayStart.setDate(diff));
      return { start: wStart, end: todayEnd };
    }
    case 'this_month': {
      const mStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: mStart, end: todayEnd };
    }
    case 'last_month': {
      const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lmEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start: lmStart, end: lmEnd };
    }
    case 'q1': // Apr - Jun (Indian FY)
      return {
        start: new Date(now.getFullYear(), 3, 1),
        end: new Date(now.getFullYear(), 5, 30, 23, 59, 59, 999),
      };
    case 'q2': // Jul - Sep
      return {
        start: new Date(now.getFullYear(), 6, 1),
        end: new Date(now.getFullYear(), 8, 30, 23, 59, 59, 999),
      };
    case 'q3': // Oct - Dec
      return {
        start: new Date(now.getFullYear(), 9, 1),
        end: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
      };
    case 'q4': // Jan - Mar
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear(), 2, 31, 23, 59, 59, 999),
      };
    case 'fy': {
      const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      return {
        start: new Date(currentYear, 3, 1),
        end: new Date(currentYear + 1, 2, 31, 23, 59, 59, 999),
      };
    }
    default:
      return { start: null, end: null };
  }
};

export default function BiTaxReport({ orders = [], onRefresh }) {
  const [preset, setPreset] = useState('this_month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [channelFilter, setChannelFilter] = useState('all'); // 'all', 'online', 'pos'
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all'); // 'all', 'paid', 'pending'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReportTab, setActiveReportTab] = useState('gstr1'); // 'gstr1', 'hsn', 'payments'
  const [copied, setCopied] = useState(false);

  // Filter orders by Date range, Channel, Payment Status & Search
  const filteredOrders = useMemo(() => {
    let { start, end } = getDateRangeForPreset(preset);
    if (preset === 'custom') {
      start = customStart ? new Date(customStart + 'T00:00:00') : null;
      end = customEnd ? new Date(customEnd + 'T23:59:59') : null;
    }

    const q = searchQuery.trim().toLowerCase();

    return orders.filter((o) => {
      // Date filter
      if (start || end) {
        const oDate = new Date(o.created_at || o.date || 0);
        if (start && oDate < start) return false;
        if (end && oDate > end) return false;
      }

      // Channel filter
      if (channelFilter === 'online' && isWalkinOrder(o)) return false;
      if (channelFilter === 'pos' && !isWalkinOrder(o)) return false;

      // Payment status filter
      if (paymentStatusFilter === 'paid' && o.payment_status !== 'paid') return false;
      if (paymentStatusFilter === 'pending' && o.payment_status === 'paid') return false;

      // Search query
      if (q) {
        const orderNum = (o.order_number || '').toLowerCase();
        const custName = (o.customer_name || '').toLowerCase();
        const custPhone = (o.customer_phone || '').toLowerCase();
        const payMethod = (o.payment_method || '').toLowerCase();
        if (!orderNum.includes(q) && !custName.includes(q) && !custPhone.includes(q) && !payMethod.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, preset, customStart, customEnd, channelFilter, paymentStatusFilter, searchQuery]);

  // Aggregate Tax & Financial Computation
  const stats = useMemo(() => {
    let grossTurnover = 0;
    let netDiscounts = 0;
    let totalShipping = 0;
    let paidAmount = 0;
    let pendingAmount = 0;

    let cashTotal = 0;
    let upiTotal = 0;
    let cardTotal = 0;
    let codTotal = 0;
    let bankTotal = 0;
    let otherPayTotal = 0;

    filteredOrders.forEach((o) => {
      const amount = Number(o.total_amount) || 0;
      const discount = Number(o.discount_amount) || 0;
      const shipping = Number(o.shipping_amount) || 0;

      grossTurnover += amount;
      netDiscounts += discount;
      totalShipping += shipping;

      if (o.payment_status === 'paid') {
        paidAmount += amount;
      } else {
        pendingAmount += amount;
      }

      const method = (o.payment_method || '').toLowerCase();
      if (method.includes('cash')) {
        cashTotal += amount;
      } else if (method.includes('upi') || method.includes('gpay') || method.includes('phonepe') || method.includes('qr')) {
        upiTotal += amount;
      } else if (method.includes('card') || method.includes('pos') || method.includes('swipe')) {
        cardTotal += amount;
      } else if (method.includes('cod') || method.includes('delivery')) {
        codTotal += amount;
      } else if (method.includes('bank') || method.includes('neft') || method.includes('rtgs')) {
        bankTotal += amount;
      } else {
        otherPayTotal += amount;
      }
    });

    // GST Breakdown (assuming inclusive 5% GST on gross apparel sales)
    // Formula: Taxable Value = Gross Turnover / (1 + GST Rate)
    // CGST = 2.5%, SGST = 2.5%
    const taxableValue = Math.round((grossTurnover / (1 + GST_RATE_PERCENT / 100)) * 100) / 100;
    const totalGst = Math.round((grossTurnover - taxableValue) * 100) / 100;
    const cgst = Math.round((totalGst / 2) * 100) / 100;
    const sgst = Math.round((totalGst - cgst) * 100) / 100;

    return {
      orderCount: filteredOrders.length,
      grossTurnover,
      taxableValue,
      totalGst,
      cgst,
      sgst,
      netDiscounts,
      totalShipping,
      paidAmount,
      pendingAmount,
      payments: {
        cash: cashTotal,
        upi: upiTotal,
        card: cardTotal,
        cod: codTotal,
        bank: bankTotal,
        other: otherPayTotal,
      },
    };
  }, [filteredOrders]);

  // HSN / Product Level Summary Aggregation
  const hsnSummary = useMemo(() => {
    const map = {};
    filteredOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const sku = item.sku || 'JAL-APP-DEFAULT';
        const title = item.product_name || 'Apparel Item';
        const qty = Number(item.quantity || item.qty) || 1;
        const price = Number(item.price) || 0;
        const itemGross = price * qty;

        if (!map[sku]) {
          map[sku] = {
            sku,
            title,
            qty: 0,
            grossTotal: 0,
            hsnCode: '6204', // Women's suits, dresses, skirts HSN code
          };
        }
        map[sku].qty += qty;
        map[sku].grossTotal += itemGross;
      });
    });

    return Object.values(map).map((item) => {
      const taxable = Math.round((item.grossTotal / 1.05) * 100) / 100;
      const gst = Math.round((item.grossTotal - taxable) * 100) / 100;
      return {
        ...item,
        taxableValue: taxable,
        cgst: Math.round((gst / 2) * 100) / 100,
        sgst: Math.round((gst / 2) * 100) / 100,
        totalGst: gst,
      };
    });
  }, [filteredOrders]);

  // CSV Export for GSTR-1 / Sales Register (Tally / GST Portal Ready)
  const handleExportGstr1Csv = () => {
    const headers = [
      'Invoice Date',
      'Invoice Number',
      'Channel',
      'Customer Name',
      'Customer Phone',
      'Place of Supply',
      'Payment Method',
      'Payment Status',
      'Taxable Value (INR)',
      'GST Rate (%)',
      'CGST (INR)',
      'SGST (INR)',
      'Total GST (INR)',
      'Total Invoice Amount (INR)',
    ];

    const rows = filteredOrders.map((o) => {
      const gross = Number(o.total_amount) || 0;
      const taxable = Math.round((gross / 1.05) * 100) / 100;
      const gst = Math.round((gross - taxable) * 100) / 100;
      const cgst = Math.round((gst / 2) * 100) / 100;
      const sgst = Math.round((gst - cgst) * 100) / 100;
      const channel = isWalkinOrder(o) ? 'POS Counter' : 'Online Website';

      return [
        `"${formatDate(o.created_at)}"`,
        `"${o.order_number || o.id}"`,
        `"${channel}"`,
        `"${(o.customer_name || 'Walk-in Customer').replace(/"/g, '""')}"`,
        `"${o.customer_phone || ''}"`,
        `"Maharashtra (27)"`,
        `"${o.payment_method || 'Cash'}"`,
        `"${(o.payment_status || 'paid').toUpperCase()}"`,
        moneyClean(taxable),
        '5%',
        moneyClean(cgst),
        moneyClean(sgst),
        moneyClean(gst),
        moneyClean(gross),
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `JALYN-GSTR1-Sales-Register-${preset}-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // CSV Export for HSN Summary (GSTR-1 Section 12)
  const handleExportHsnCsv = () => {
    const headers = [
      'HSN Code',
      'Product Description',
      'SKU Code',
      'UQC',
      'Total Quantity',
      'Taxable Value (INR)',
      'Central Tax (CGST 2.5%)',
      'State Tax (SGST 2.5%)',
      'Total Tax Amount',
      'Gross Total (INR)',
    ];

    const rows = hsnSummary.map((h) => [
      `"${h.hsnCode}"`,
      `"${h.title.replace(/"/g, '""')}"`,
      `"${h.sku}"`,
      `"PCS"`,
      h.qty,
      moneyClean(h.taxableValue),
      moneyClean(h.cgst),
      moneyClean(h.sgst),
      moneyClean(h.totalGst),
      moneyClean(h.grossTotal),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `JALYN-HSN-Summary-${preset}-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Printable Financial Audit Statement (A4)
  const handlePrintAuditSheet = () => {
    const periodLabel =
      preset === 'custom'
        ? `${customStart || 'Start'} to ${customEnd || 'End'}`
        : preset.toUpperCase().replace('_', ' ');

    const rowsHtml = filteredOrders
      .map((o) => {
        const gross = Number(o.total_amount) || 0;
        const taxable = Math.round((gross / 1.05) * 100) / 100;
        const gst = Math.round((gross - taxable) * 100) / 100;
        const cgst = Math.round((gst / 2) * 100) / 100;
        const sgst = Math.round((gst - cgst) * 100) / 100;
        const channel = isWalkinOrder(o) ? 'POS' : 'Online';

        return `
        <tr>
          <td>${formatDate(o.created_at)}</td>
          <td style="font-weight:bold; font-family:monospace;">${o.order_number || o.id}</td>
          <td>${channel}</td>
          <td>${o.customer_name || 'Customer'}</td>
          <td>${o.payment_method || 'Cash'}</td>
          <td style="text-align:right;">₹${moneyClean(taxable)}</td>
          <td style="text-align:right;">₹${moneyClean(cgst)}</td>
          <td style="text-align:right;">₹${moneyClean(sgst)}</td>
          <td style="text-align:right; font-weight:bold;">₹${moneyClean(gross)}</td>
        </tr>
      `;
      })
      .join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>JALYN - Financial & Tax Audit Sheet</title>
  <style>
    @page { size: A4; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #2A1A22; font-size: 11px; margin: 0; padding: 0; }
    .header { border-bottom: 2px solid #2A1A22; padding-bottom: 12px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: flex-start; }
    .brand { font-size: 20px; font-weight: 800; color: #2A1A22; letter-spacing: 1px; }
    .sub { font-size: 11px; color: #666; margin-top: 2px; }
    .title-box { text-align: right; }
    .title { font-size: 16px; font-weight: bold; color: #AD4A85; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 15px; }
    .card { background: #FAF0E6; border: 1px solid #E8D8CC; border-radius: 6px; padding: 8px; }
    .card-label { font-size: 9px; text-transform: uppercase; color: #777; font-weight: bold; }
    .card-val { font-size: 14px; font-weight: bold; color: #2A1A22; margin-top: 3px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 10px; }
    th { background: #2A1A22; color: #fff; padding: 6px 8px; text-align: left; font-size: 9px; text-transform: uppercase; }
    td { padding: 5px 8px; border-bottom: 1px solid #eee; }
    tr:nth-child(even) { background: #fafafa; }
    .footer { margin-top: 25px; padding-top: 15px; border-top: 1px solid #ccc; display: flex; justify-content: space-between; font-size: 10px; color: #555; }
    .sign-box { border-top: 1px dashed #777; width: 180px; text-align: center; padding-top: 5px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">JALYN APPARELS</div>
      <div class="sub">Luxury Ethnic & Occasion Wear · GSTIN: 27AABCJ9876Q1Z2</div>
      <div class="sub">support@jalyn.in | +91 98765 43210</div>
    </div>
    <div class="title-box">
      <div class="title">GST & Financial Statement</div>
      <div class="sub">Period: ${periodLabel}</div>
      <div class="sub">Generated: ${new Date().toLocaleString('en-IN')}</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-label">Total Invoices</div>
      <div class="card-val">${stats.orderCount}</div>
    </div>
    <div class="card">
      <div class="card-label">Gross Revenue</div>
      <div class="card-val">₹${moneyClean(stats.grossTurnover)}</div>
    </div>
    <div class="card">
      <div class="card-label">Taxable Turnover</div>
      <div class="card-val">₹${moneyClean(stats.taxableValue)}</div>
    </div>
    <div class="card">
      <div class="card-label">Total GST (5%)</div>
      <div class="card-val">₹${moneyClean(stats.totalGst)}</div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-label">CGST (2.5%)</div>
      <div class="card-val">₹${moneyClean(stats.cgst)}</div>
    </div>
    <div class="card">
      <div class="card-label">SGST (2.5%)</div>
      <div class="card-val">₹${moneyClean(stats.sgst)}</div>
    </div>
    <div class="card">
      <div class="card-label">Cash Collected</div>
      <div class="card-val">₹${moneyClean(stats.payments.cash)}</div>
    </div>
    <div class="card">
      <div class="card-label">Digital (UPI/Card)</div>
      <div class="card-val">₹${moneyClean(stats.payments.upi + stats.payments.card)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Invoice #</th>
        <th>Type</th>
        <th>Customer</th>
        <th>Payment</th>
        <th style="text-align:right;">Taxable (₹)</th>
        <th style="text-align:right;">CGST (₹)</th>
        <th style="text-align:right;">SGST (₹)</th>
        <th style="text-align:right;">Total (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="footer">
    <div>
      <p>Certified that the particulars given above are true and correct as per books of account.</p>
      <p style="font-size:9px; color:#888;">Prepared for Tally ERP / GST Portal filing purposes.</p>
    </div>
    <div class="sign-box">
      Authorized Signatory / Auditor
    </div>
  </div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=750');
    if (!win) {
      alert('Please allow popups to print the statement.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    setTimeout(() => {
      win.focus();
      win.print();
    }, 300);
  };

  // Copy JSON data for Tally integration
  const handleCopyTallyJson = () => {
    const exportData = {
      company: 'JALYN APPARELS',
      gstin: '27AABCJ9876Q1Z2',
      period: preset,
      generatedAt: new Date().toISOString(),
      summary: stats,
      invoices: filteredOrders.map((o) => {
        const gross = Number(o.total_amount) || 0;
        const taxable = Math.round((gross / 1.05) * 100) / 100;
        const gst = Math.round((gross - taxable) * 100) / 100;
        return {
          invoice_no: o.order_number || o.id,
          date: o.created_at,
          customer: o.customer_name,
          phone: o.customer_phone,
          channel: isWalkinOrder(o) ? 'pos' : 'online',
          payment_method: o.payment_method,
          payment_status: o.payment_status,
          taxable_value: taxable,
          cgst: Math.round((gst / 2) * 100) / 100,
          sgst: Math.round((gst / 2) * 100) / 100,
          total_gst: gst,
          gross_amount: gross,
          items: (o.items || []).map((i) => ({
            name: i.product_name,
            sku: i.sku,
            qty: i.quantity,
            price: i.price,
          })),
        };
      }),
    };

    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* ─── TOP CONTROLS & DATE PRESETS ─── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#AD4A85]" />
              BI Financial & Tally Tax/GST Reporting Center
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Comprehensive GSTR-1, GSTR-3B, HSN summary & financial ledger for tax filing and accountant audits.
            </p>
          </div>

          {/* Action Export Buttons (Single Theme Color) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportGstr1Csv}
              className="bg-[#2A1A22] hover:bg-[#3D2631] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Download GSTR-1 Sales Register CSV"
            >
              <FileSpreadsheet className="w-4 h-4 text-pink-300" />
              <span>Export GSTR-1 (CSV)</span>
            </button>

            <button
              type="button"
              onClick={handleExportHsnCsv}
              className="bg-[#2A1A22] hover:bg-[#3D2631] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Download HSN Summary CSV"
            >
              <Download className="w-4 h-4 text-pink-300" />
              <span>HSN Summary</span>
            </button>

            <button
              type="button"
              onClick={handlePrintAuditSheet}
              className="bg-[#AD4A85] hover:bg-[#963c71] text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Print Official Financial Statement"
            >
              <Printer className="w-4 h-4" />
              <span>Print Audit Sheet</span>
            </button>

            <button
              type="button"
              onClick={handleCopyTallyJson}
              className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
              title="Copy Tally JSON"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Tally JSON'}</span>
            </button>
          </div>
        </div>

        {/* Date Presets Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-gray-100">
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'this_week', label: 'This Week' },
            { id: 'this_month', label: 'This Month' },
            { id: 'last_month', label: 'Last Month' },
            { id: 'q1', label: 'Q1 (Apr-Jun)' },
            { id: 'q2', label: 'Q2 (Jul-Sep)' },
            { id: 'q3', label: 'Q3 (Oct-Dec)' },
            { id: 'q4', label: 'Q4 (Jan-Mar)' },
            { id: 'fy', label: 'FY 2025-26' },
            { id: 'custom', label: 'Custom Range' },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 cursor-pointer ${
                preset === p.id
                  ? 'bg-[#2A1A22] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom Date Inputs if selected */}
        {preset === 'custom' && (
          <div className="flex items-center gap-3 pt-2 bg-gray-50 p-3 rounded-xl border border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">From:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-3 py-1.5 bg-white rounded-lg border border-gray-300 text-xs font-semibold text-gray-800"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700">To:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 bg-white rounded-lg border border-gray-300 text-xs font-semibold text-gray-800"
              />
            </div>
          </div>
        )}

        {/* Secondary Filters Bar: Channel & Payment Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setChannelFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  channelFilter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All Channels
              </button>
              <button
                type="button"
                onClick={() => setChannelFilter('online')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  channelFilter === 'online' ? 'bg-white text-[#AD4A85] shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Globe className="w-3 h-3" /> Online Orders
              </button>
              <button
                type="button"
                onClick={() => setChannelFilter('pos')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                  channelFilter === 'pos' ? 'bg-white text-emerald-800 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Store className="w-3 h-3" /> Walk-in POS
              </button>
            </div>

            <select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 shadow-sm"
            >
              <option value="all">All Payment Status</option>
              <option value="paid">Paid Invoices Only</option>
              <option value="pending">Pending Invoices</option>
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Invoice #, customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-[#AD4A85] shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* ─── EXECUTIVE FINANCIAL & TAX SUMMARY CARDS ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Gross Turnover</span>
            <span className="p-1.5 bg-pink-50 rounded-lg text-[#AD4A85]"><IndianRupee className="w-4 h-4" /></span>
          </div>
          <p className="text-xl font-extrabold text-gray-900 mt-2">{money(stats.grossTurnover)}</p>
          <p className="text-[10px] text-gray-400 mt-1">{stats.orderCount} Total Invoices</p>
        </div>

        {/* Taxable Value */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Taxable Value</span>
            <span className="p-1.5 bg-blue-50 rounded-lg text-blue-600"><TrendingUp className="w-4 h-4" /></span>
          </div>
          <p className="text-xl font-extrabold text-blue-700 mt-2">{money(stats.taxableValue)}</p>
          <p className="text-[10px] text-gray-400 mt-1">Excluding GST</p>
        </div>

        {/* Total GST (5%) */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Output GST (5%)</span>
            <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600"><ShieldCheck className="w-4 h-4" /></span>
          </div>
          <p className="text-xl font-extrabold text-emerald-700 mt-2">{money(stats.totalGst)}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">CGST: {money(stats.cgst)} | SGST: {money(stats.sgst)}</p>
        </div>

        {/* Realized Cash/Digital vs Pending */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Paid vs Pending</span>
            <span className="p-1.5 bg-purple-50 rounded-lg text-purple-600"><CreditCard className="w-4 h-4" /></span>
          </div>
          <p className="text-xl font-extrabold text-gray-900 mt-2">{money(stats.paidAmount)}</p>
          <p className="text-[10px] text-amber-600 font-semibold mt-1">Pending: {money(stats.pendingAmount)}</p>
        </div>
      </div>

      {/* ─── PAYMENT SPLIT LEDGER ─── */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-sm">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
          Payment Mode Breakdown & Cash Ledger
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
              <Banknote className="w-4 h-4" /> Cash Ledger
            </div>
            <p className="text-base font-extrabold text-gray-900 mt-1.5">{money(stats.payments.cash)}</p>
            <p className="text-[10px] text-emerald-700 mt-0.5">
              {stats.grossTurnover > 0 ? ((stats.payments.cash / stats.grossTurnover) * 100).toFixed(1) : 0}% of turnover
            </p>
          </div>

          <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-800">
              <QrCode className="w-4 h-4" /> UPI & QR
            </div>
            <p className="text-base font-extrabold text-gray-900 mt-1.5">{money(stats.payments.upi)}</p>
            <p className="text-[10px] text-blue-700 mt-0.5">
              {stats.grossTurnover > 0 ? ((stats.payments.upi / stats.grossTurnover) * 100).toFixed(1) : 0}% of turnover
            </p>
          </div>

          <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-800">
              <CreditCard className="w-4 h-4" /> POS Cards
            </div>
            <p className="text-base font-extrabold text-gray-900 mt-1.5">{money(stats.payments.card)}</p>
            <p className="text-[10px] text-purple-700 mt-0.5">
              {stats.grossTurnover > 0 ? ((stats.payments.card / stats.grossTurnover) * 100).toFixed(1) : 0}% of turnover
            </p>
          </div>

          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <Clock className="w-4 h-4" /> COD Orders
            </div>
            <p className="text-base font-extrabold text-gray-900 mt-1.5">{money(stats.payments.cod)}</p>
            <p className="text-[10px] text-amber-700 mt-0.5">
              {stats.grossTurnover > 0 ? ((stats.payments.cod / stats.grossTurnover) * 100).toFixed(1) : 0}% of turnover
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <Layers className="w-4 h-4" /> Bank / Other
            </div>
            <p className="text-base font-extrabold text-gray-900 mt-1.5">{money(stats.payments.bank + stats.payments.other)}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {stats.grossTurnover > 0 ? (((stats.payments.bank + stats.payments.other) / stats.grossTurnover) * 100).toFixed(1) : 0}% of turnover
            </p>
          </div>
        </div>
      </div>

      {/* ─── TAB SWITCHER: GSTR-1 SALES REGISTER VS HSN SUMMARY ─── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveReportTab('gstr1')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeReportTab === 'gstr1'
                ? 'bg-[#2A1A22] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Tally GSTR-1 Sales Register ({filteredOrders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveReportTab('hsn')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeReportTab === 'hsn'
                ? 'bg-[#AD4A85] text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Layers className="w-4 h-4" /> HSN Summary (Section 12) ({hsnSummary.length})
          </button>
        </div>

        {/* GSTR-1 TABLE */}
        {activeReportTab === 'gstr1' && (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-xs font-medium">
                No invoices match the selected date range and filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Channel</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Payment</th>
                      <th className="py-3 px-4 text-right">Taxable Value</th>
                      <th className="py-3 px-4 text-right">CGST (2.5%)</th>
                      <th className="py-3 px-4 text-right">SGST (2.5%)</th>
                      <th className="py-3 px-4 text-right">Total Invoice</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {filteredOrders.map((o) => {
                      const gross = Number(o.total_amount) || 0;
                      const taxable = Math.round((gross / 1.05) * 100) / 100;
                      const gst = Math.round((gross - taxable) * 100) / 100;
                      const cgst = Math.round((gst / 2) * 100) / 100;
                      const sgst = Math.round((gst - cgst) * 100) / 100;
                      const isWalkin = isWalkinOrder(o);

                      return (
                        <tr key={o.id} className="hover:bg-gray-50/80 transition">
                          <td className="py-2.5 px-4 text-gray-500 whitespace-nowrap">{formatDate(o.created_at)}</td>
                          <td className="py-2.5 px-4 font-bold text-gray-900 font-mono whitespace-nowrap">{o.order_number || o.id}</td>
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            {isWalkin ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Store className="w-2.5 h-2.5" /> Walk-in POS
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-pink-50 text-[#AD4A85] border border-pink-200">
                                <Globe className="w-2.5 h-2.5" /> Online
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-4">
                            <p className="font-semibold text-gray-800 truncate max-w-[150px]">{o.customer_name || 'Walk-in Customer'}</p>
                            <p className="text-[10px] text-gray-400">{o.customer_phone || '—'}</p>
                          </td>
                          <td className="py-2.5 px-4 text-gray-700 whitespace-nowrap font-medium">
                            {o.payment_method || 'Cash'}
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono text-gray-800">{money(taxable)}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-gray-600">{money(cgst)}</td>
                          <td className="py-2.5 px-4 text-right font-mono text-gray-600">{money(sgst)}</td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-gray-900">{money(gross)}</td>
                          <td className="py-2.5 px-4 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                o.payment_status === 'paid'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              {(o.payment_status || 'paid').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-gray-50 border-t border-gray-200 font-bold text-xs text-gray-900">
                    <tr>
                      <td colSpan={5} className="py-3 px-4 uppercase tracking-wider text-[10px] text-gray-500">
                        Total Summary ({filteredOrders.length} Invoices)
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-blue-700">{money(stats.taxableValue)}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">{money(stats.cgst)}</td>
                      <td className="py-3 px-4 text-right font-mono text-emerald-700">{money(stats.sgst)}</td>
                      <td className="py-3 px-4 text-right font-mono text-gray-900 text-sm">{money(stats.grossTurnover)}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* HSN SUMMARY TABLE */}
        {activeReportTab === 'hsn' && (
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
            {hsnSummary.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-xs font-medium">
                No items sold in the selected period.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">HSN Code</th>
                      <th className="py-3 px-4">Product Description</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4 text-center">UQC</th>
                      <th className="py-3 px-4 text-center">Units Sold</th>
                      <th className="py-3 px-4 text-right">Taxable Value</th>
                      <th className="py-3 px-4 text-right">CGST (2.5%)</th>
                      <th className="py-3 px-4 text-right">SGST (2.5%)</th>
                      <th className="py-3 px-4 text-right">Gross Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {hsnSummary.map((h, i) => (
                      <tr key={i} className="hover:bg-gray-50/80 transition">
                        <td className="py-2.5 px-4 font-mono font-bold text-gray-700">{h.hsnCode}</td>
                        <td className="py-2.5 px-4 font-semibold text-gray-800">{h.title}</td>
                        <td className="py-2.5 px-4 font-mono text-gray-500">{h.sku}</td>
                        <td className="py-2.5 px-4 text-center text-gray-500">PCS</td>
                        <td className="py-2.5 px-4 text-center font-bold text-gray-900">{h.qty}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-gray-800">{money(h.taxableValue)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-gray-600">{money(h.cgst)}</td>
                        <td className="py-2.5 px-4 text-right font-mono text-gray-600">{money(h.sgst)}</td>
                        <td className="py-2.5 px-4 text-right font-mono font-bold text-gray-900">{money(h.grossTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
