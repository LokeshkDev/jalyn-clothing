/**
 * JALYN Apparel GST Tax Calculation Engine (Admin)
 * 
 * Rules:
 * - Unit price <= ₹2,500: 5% GST (Intra-state: 2.5% CGST + 2.5% SGST | Inter-state: 5% IGST)
 * - Unit price > ₹2,500: 18% GST (Intra-state: 9.0% CGST + 9.0% SGST | Inter-state: 18% IGST)
 * - GST slab is determined per individual unit selling / base price, NOT by total cart value or quantity.
 * - Pricing is tax-inclusive by default in Indian retail, with tax-exclusive calculation support.
 */

export const APPAREL_GST_THRESHOLD = 2500;
export const GST_RATE_LOW = 5;
export const GST_RATE_HIGH = 18;
export const DEFAULT_HSN_CODE = '6204';
export const DEFAULT_STORE_STATE = 'Tamil Nadu';

/**
 * Determine GST rate for an apparel item based on per-unit price
 * @param {number} unitPrice 
 * @returns {number} 5 or 18
 */
export function getApparelGstRate(unitPrice) {
  const price = Number(unitPrice) || 0;
  return price <= APPAREL_GST_THRESHOLD ? GST_RATE_LOW : GST_RATE_HIGH;
}

/**
 * Normalize Indian state name for comparison
 */
export function normalizeStateName(stateStr) {
  if (!stateStr) return '';
  const s = String(stateStr).trim().toLowerCase();
  if (s.includes('tamil') || s === 'tn' || s === '33') return 'tamil nadu';
  if (s.includes('kerala') || s === 'kl' || s === '32') return 'kerala';
  if (s.includes('karnataka') || s === 'ka' || s === '29') return 'karnataka';
  if (s.includes('andhra') || s === 'ap' || s === '37') return 'andhra pradesh';
  if (s.includes('telangana') || s === 'ts' || s === '36') return 'telangana';
  if (s.includes('maharashtra') || s === 'mh' || s === '27') return 'maharashtra';
  if (s.includes('delhi') || s === 'dl' || s === '07') return 'delhi';
  return s;
}

/**
 * Check if the transaction is inter-state (IGST) or intra-state (CGST + SGST)
 */
export function isInterState(shippingState, storeState = DEFAULT_STORE_STATE) {
  if (!shippingState) return false;
  const cleanShip = normalizeStateName(shippingState);
  const cleanStore = normalizeStateName(storeState);
  return cleanShip !== '' && cleanStore !== '' && cleanShip !== cleanStore;
}

/**
 * Calculate tax for a single line item
 */
export function calculateItemTax({
  price = 0,
  quantity = 1,
  discount = 0,
  isGstInclusive = true,
  isInterState: interState = false,
  hsnCode = DEFAULT_HSN_CODE,
  customGstRate = null,
} = {}) {
  const unitPrice = Number(price) || 0;
  const qty = Math.max(1, Number(quantity) || 1);
  const gstRate = customGstRate !== null && customGstRate !== undefined
    ? Number(customGstRate)
    : getApparelGstRate(unitPrice);

  const rawTotal = Math.round(unitPrice * qty * 100) / 100;
  const itemDiscount = Math.min(Number(discount) || 0, rawTotal);
  const discountedTotal = Math.max(0, Math.round((rawTotal - itemDiscount) * 100) / 100);

  let taxableAmount = 0;
  let totalTax = 0;
  let lineTotal = 0;

  if (isGstInclusive) {
    taxableAmount = Math.round((discountedTotal / (1 + gstRate / 100)) * 100) / 100;
    totalTax = Math.round((discountedTotal - taxableAmount) * 100) / 100;
    lineTotal = discountedTotal;
  } else {
    taxableAmount = discountedTotal;
    totalTax = Math.round((taxableAmount * (gstRate / 100)) * 100) / 100;
    lineTotal = Math.round((taxableAmount + totalTax) * 100) / 100;
  }

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (interState) {
    igstAmount = totalTax;
  } else {
    cgstAmount = Math.round((totalTax / 2) * 100) / 100;
    sgstAmount = Math.round((totalTax - cgstAmount) * 100) / 100;
  }

  return {
    unitPrice,
    quantity: qty,
    hsnCode: hsnCode || DEFAULT_HSN_CODE,
    gstRate,
    rawTotal,
    discount: itemDiscount,
    discountedTotal,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTax,
    lineTotal,
  };
}

/**
 * Calculate complete order tax & financials with pro-rated discounts & mixed cart support
 */
export function calculateOrderTax({
  items = [],
  discountAmount = 0,
  shippingAmount = 0,
  isGstInclusive = true,
  shippingState = DEFAULT_STORE_STATE,
  storeState = DEFAULT_STORE_STATE,
} = {}) {
  const interState = isInterState(shippingState, storeState);
  const totalDiscount = Math.max(0, Number(discountAmount) || 0);
  const shipping = Math.max(0, Number(shippingAmount) || 0);

  const rawSubtotal = items.reduce((sum, it) => {
    const p = Number(it.price) || 0;
    const q = Number(it.quantity || it.qty) || 1;
    return sum + p * q;
  }, 0);

  // Pro-rate total discount across items based on their gross share
  let remainingDiscount = totalDiscount;
  const itemsWithTax = items.map((it, idx) => {
    const p = Number(it.price) || 0;
    const q = Number(it.quantity || it.qty) || 1;
    const itemGross = p * q;

    let itemDiscount = 0;
    if (totalDiscount > 0 && rawSubtotal > 0) {
      if (idx === items.length - 1) {
        itemDiscount = Math.max(0, Math.round(remainingDiscount * 100) / 100);
      } else {
        itemDiscount = Math.round(((itemGross / rawSubtotal) * totalDiscount) * 100) / 100;
        remainingDiscount = Math.max(0, remainingDiscount - itemDiscount);
      }
    }

    const customRate = it.gst_rate !== undefined && it.gst_rate !== null && it.gst_rate !== ''
      ? Number(it.gst_rate)
      : null;

    const calc = calculateItemTax({
      price: p,
      quantity: q,
      discount: itemDiscount,
      isGstInclusive,
      isInterState: interState,
      hsnCode: it.hsn_code || it.hsnCode || DEFAULT_HSN_CODE,
      customGstRate: customRate,
    });

    return {
      ...it,
      product_id: it.product_id || it.id || null,
      product_name: it.product_name || it.name || it.title || 'Apparel Item',
      sku: it.sku || null,
      size: it.size || null,
      color: it.color || null,
      image_url: it.image_url || it.image || null,
      ...calc,
    };
  });

  const totalTaxable = Math.round(itemsWithTax.reduce((s, i) => s + i.taxableAmount, 0) * 100) / 100;
  const totalCgst = Math.round(itemsWithTax.reduce((s, i) => s + i.cgstAmount, 0) * 100) / 100;
  const totalSgst = Math.round(itemsWithTax.reduce((s, i) => s + i.sgstAmount, 0) * 100) / 100;
  const totalIgst = Math.round(itemsWithTax.reduce((s, i) => s + i.igstAmount, 0) * 100) / 100;
  const totalTax = Math.round((totalCgst + totalSgst + totalIgst) * 100) / 100;

  const grandTotal = isGstInclusive
    ? Math.max(0, Math.round((rawSubtotal - totalDiscount + shipping) * 100) / 100)
    : Math.max(0, Math.round((totalTaxable + totalTax + shipping) * 100) / 100);

  // Slabs summary for reporting
  const slab5Items = itemsWithTax.filter((i) => i.gstRate === 5);
  const slab18Items = itemsWithTax.filter((i) => i.gstRate === 18);

  const slab5 = {
    itemCount: slab5Items.length,
    taxableAmount: Math.round(slab5Items.reduce((s, i) => s + i.taxableAmount, 0) * 100) / 100,
    cgstAmount: Math.round(slab5Items.reduce((s, i) => s + i.cgstAmount, 0) * 100) / 100,
    sgstAmount: Math.round(slab5Items.reduce((s, i) => s + i.sgstAmount, 0) * 100) / 100,
    igstAmount: Math.round(slab5Items.reduce((s, i) => s + i.igstAmount, 0) * 100) / 100,
    totalTax: Math.round(slab5Items.reduce((s, i) => s + i.totalTax, 0) * 100) / 100,
  };

  const slab18 = {
    itemCount: slab18Items.length,
    taxableAmount: Math.round(slab18Items.reduce((s, i) => s + i.taxableAmount, 0) * 100) / 100,
    cgstAmount: Math.round(slab18Items.reduce((s, i) => s + i.cgstAmount, 0) * 100) / 100,
    sgstAmount: Math.round(slab18Items.reduce((s, i) => s + i.sgstAmount, 0) * 100) / 100,
    igstAmount: Math.round(slab18Items.reduce((s, i) => s + i.igstAmount, 0) * 100) / 100,
    totalTax: Math.round(slab18Items.reduce((s, i) => s + i.totalTax, 0) * 100) / 100,
  };

  return {
    items: itemsWithTax,
    subtotal: rawSubtotal,
    discountAmount: totalDiscount,
    shippingAmount: shipping,
    isGstInclusive,
    isInterState: interState,
    taxableAmount: totalTaxable,
    cgstAmount: totalCgst,
    sgstAmount: totalSgst,
    igstAmount: totalIgst,
    totalTax,
    grandTotal,
    slab5,
    slab18,
  };
}
