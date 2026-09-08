import pool from '../config/db.js';
import { calculateOrderTax, calculateItemTax, getApparelGstRate } from '../utils/taxCalculator.js';
import {
  awardJCoinsForOrder,
  processOrderJCoinsRedemption,
  reverseJCoinsForOrder,
  getUserJCoinsBalance,
  findOrCreateCustomerByPhone,
} from '../services/jcoinService.js';

let mockOrders = [];

// Ensure all tax & financial columns exist in MySQL orders and order_items tables
export const ensureOrderColumns = async () => {
  try {
    const ensureCol = async (tableName, colName, colSql) => {
      const [cols] = await pool.query(
        `SELECT COUNT(*) as count FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
        [tableName, colName]
      );
      if (cols[0].count === 0) {
        try { await pool.query(colSql); } catch (_) {}
      }
    };

    // Orders columns
    await ensureCol('orders', 'discount_amount', 'ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0');
    await ensureCol('orders', 'shipping_amount', 'ALTER TABLE orders ADD COLUMN shipping_amount DECIMAL(10,2) DEFAULT 0');
    await ensureCol('orders', 'received_amount', 'ALTER TABLE orders ADD COLUMN received_amount DECIMAL(10,2) NULL');
    await ensureCol('orders', 'balance_amount', 'ALTER TABLE orders ADD COLUMN balance_amount DECIMAL(10,2) NULL');
    await ensureCol('orders', 'gst_rate', 'ALTER TABLE orders ADD COLUMN gst_rate DECIMAL(5,2) NULL');
    await ensureCol('orders', 'is_gst_inclusive', 'ALTER TABLE orders ADD COLUMN is_gst_inclusive TINYINT(1) DEFAULT 1');
    await ensureCol('orders', 'taxable_amount', 'ALTER TABLE orders ADD COLUMN taxable_amount DECIMAL(10,2) NULL');
    await ensureCol('orders', 'cgst_amount', 'ALTER TABLE orders ADD COLUMN cgst_amount DECIMAL(10,2) NULL');
    await ensureCol('orders', 'sgst_amount', 'ALTER TABLE orders ADD COLUMN sgst_amount DECIMAL(10,2) NULL');
    await ensureCol('orders', 'igst_amount', 'ALTER TABLE orders ADD COLUMN igst_amount DECIMAL(10,2) NULL');
    await ensureCol('orders', 'total_mrp', 'ALTER TABLE orders ADD COLUMN total_mrp DECIMAL(10,2) NULL');
    await ensureCol('orders', 'order_type', "ALTER TABLE orders ADD COLUMN order_type VARCHAR(20) DEFAULT 'online'");

    // Order Items columns
    await ensureCol('order_items', 'sku', 'ALTER TABLE order_items ADD COLUMN sku VARCHAR(100) NULL');
    await ensureCol('order_items', 'hsn_code', "ALTER TABLE order_items ADD COLUMN hsn_code VARCHAR(50) DEFAULT '6204'");
    await ensureCol('order_items', 'gst_rate', 'ALTER TABLE order_items ADD COLUMN gst_rate DECIMAL(5,2) NULL');
    await ensureCol('order_items', 'taxable_amount', 'ALTER TABLE order_items ADD COLUMN taxable_amount DECIMAL(10,2) NULL');
    await ensureCol('order_items', 'cgst_amount', 'ALTER TABLE order_items ADD COLUMN cgst_amount DECIMAL(10,2) NULL');
    await ensureCol('order_items', 'sgst_amount', 'ALTER TABLE order_items ADD COLUMN sgst_amount DECIMAL(10,2) NULL');
    await ensureCol('order_items', 'igst_amount', 'ALTER TABLE order_items ADD COLUMN igst_amount DECIMAL(10,2) NULL');
    await ensureCol('order_items', 'total_tax', 'ALTER TABLE order_items ADD COLUMN total_tax DECIMAL(10,2) NULL');
  } catch (err) {
    console.log('ℹ️ MySQL database order columns check:', err.message);
  }
};

ensureOrderColumns();

const normalizeRow = (row) => ({
  ...row,
  payment_status: row.payment_status || 'paid',
  order_status: row.order_status || 'pending',
});

const readOrdersWithItems = async () => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY COALESCE(created_at, "1970-01-01") DESC, id DESC');
    const orders = rows.map(normalizeRow);
    if (orders.length === 0) return orders;

    const ids = orders.map((o) => o.id);
    const placeholders = ids.map(() => '?').join(',');
    const [items] = await pool.query(
      `SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
      ids
    );

    return orders.map((o) => ({
      ...o,
      items: items.filter((it) => it.order_id === o.id),
    }));
  } catch (error) {
    console.warn('⚠️ Database query failed in readOrdersWithItems:', error.message);
    // Return empty array to trigger fallback to mockOrders
    return [];
  }
};

const createOrderNumber = (id) => {
  const now = new Date();
  const y = now.getFullYear();
  const yy = String(y % 100).padStart(2, '0');
  return `ORD-${y}-${String(id).padStart(4, '0')}${yy}`;
};

export const getOrders = async (req, res) => {
  let { email } = req.query;
  let userId = null;

  // Security: non-admins can only see their own orders
  if (req.user && !['superadmin', 'admin'].includes(req.user.role)) {
    email = req.user.email;
    userId = req.user.id;
  }

  try {
    let orders = await readOrdersWithItems();
    if (!orders || orders.length === 0) {
      orders = mockOrders;
    }
    if (email) {
      orders = orders.filter((o) =>
        (userId && String(o.user_id) === String(userId)) ||
        o.customer_email?.toLowerCase() === email.toLowerCase()
      );
    }
    // Always sort newest orders first
    orders.sort((a, b) => {
      const timeA = new Date(a.created_at || a.date || 0).getTime();
      const timeB = new Date(b.created_at || b.date || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });
    return res.json({ success: true, orders });
  } catch (error) {
    let orders = [...mockOrders];
    if (email) {
      orders = orders.filter((o) =>
        (userId && String(o.user_id) === String(userId)) ||
        o.customer_email?.toLowerCase() === email.toLowerCase()
      );
    }
    orders.sort((a, b) => {
      const timeA = new Date(a.created_at || a.date || 0).getTime();
      const timeB = new Date(b.created_at || b.date || 0).getTime();
      if (timeB !== timeA) return timeB - timeA;
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });
    return res.json({ success: true, orders, isFallback: true });
  }
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE id = ? OR order_number = ?',
      [id, id]
    );
    const found = rows.length > 0 ? normalizeRow(rows[0]) : null;

    if (found) {
      // Security check: Customer can only view their own order
      if (
        req.user &&
        !['superadmin', 'admin'].includes(req.user.role) &&
        String(found.user_id || '') !== String(req.user.id) &&
        found.customer_email?.toLowerCase() !== req.user.email?.toLowerCase()
      ) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [found.id]);
      return res.json({ success: true, order: { ...found, items } });
    }

    const mockOrder = mockOrders.find((o) => String(o.id) === String(id) || o.order_number === id);
    if (mockOrder) {
      // Security check: Customer can only view their own order
      if (
        req.user &&
        !['superadmin', 'admin'].includes(req.user.role) &&
        String(mockOrder.user_id || '') !== String(req.user.id) &&
        mockOrder.customer_email?.toLowerCase() !== req.user.email?.toLowerCase()
      ) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      return res.json({ success: true, order: mockOrder, isFallback: true });
    }
    return res.status(404).json({ success: false, message: 'Order not found' });
  } catch (error) {
    const mockOrder = mockOrders.find((o) => String(o.id) === String(id) || o.order_number === id);
    if (mockOrder) {
      // Security check: Customer can only view their own order
      if (
        req.user &&
        !['superadmin', 'admin'].includes(req.user.role) &&
        String(mockOrder.user_id || '') !== String(req.user.id) &&
        mockOrder.customer_email?.toLowerCase() !== req.user.email?.toLowerCase()
      ) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
      return res.json({ success: true, order: mockOrder, isFallback: true });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrder = async (req, res) => {
  const {
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    total_amount,
    discount_amount = 0,
    shipping_amount = 0,
    received_amount = null,
    balance_amount = null,
    gst_rate = null,
    is_gst_inclusive = 1,
    taxable_amount = null,
    cgst_amount = null,
    sgst_amount = null,
    igst_amount = null,
    total_mrp = null,
    order_type,
    payment_status = 'pending',
    order_status = 'pending',
    payment_method = 'Online Payment',
    jcoins_redeemed = 0,
    jcoins_discount = 0,
    items = [],
  } = req.body;

  const isAdminUser = ['superadmin', 'admin'].includes(req.user?.role);
  let orderUserId = isAdminUser ? (req.body.user_id || null) : (req.user?.id || null);
  const orderCustomerEmail = isAdminUser ? customer_email : (req.user?.email || customer_email);

  if (!customer_name || !orderCustomerEmail || !shipping_address) {
    return res.status(400).json({ success: false, message: 'Customer name, email and shipping address are required.' });
  }

  // Auto-resolve customer user_id by phone/email if null
  if (!orderUserId) {
    try {
      const customerUser = await findOrCreateCustomerByPhone({
        phone: customer_phone,
        name: customer_name,
        email: orderCustomerEmail,
      });
      if (customerUser) orderUserId = customerUser.id;
    } catch (_) {}
  }

  // Server-side validation of JCoins redemption
  const numJcoinsRedeemed = Math.max(0, parseInt(jcoins_redeemed, 10) || 0);
  const numJcoinsDiscount = numJcoinsRedeemed > 0 ? (Number(jcoins_discount) || numJcoinsRedeemed) : 0;

  if (numJcoinsRedeemed > 0 && orderUserId) {
    const userBalance = await getUserJCoinsBalance(orderUserId);
    if (userBalance < numJcoinsRedeemed) {
      return res.status(400).json({
        success: false,
        message: `Insufficient JCoins balance. Available: ${userBalance}, Requested: ${numJcoinsRedeemed}`,
      });
    }
  }

  // Determine order_type ('pos' / 'walkin' or 'online')
  const inferredOrderType =
    order_type ||
    (String(shipping_address).toLowerCase().includes('counter') ||
    String(shipping_address).toLowerCase().includes('in-store') ||
    String(customer_name).toLowerCase().includes('walk-in')
      ? 'pos'
      : 'online');

  // Unified tax calculation
  const isInclusive = is_gst_inclusive !== undefined ? Boolean(is_gst_inclusive) : true;
  const orderTax = calculateOrderTax({
    items,
    discountAmount: (Number(discount_amount) || 0) + numJcoinsDiscount,
    shippingAmount: Number(shipping_amount) || 0,
    isGstInclusive: isInclusive,
    shippingState: shipping_address,
  });

  const finalTotal = total_amount !== undefined && total_amount !== null && total_amount !== ''
    ? Number(total_amount)
    : orderTax.grandTotal;
  const finalTaxable = taxable_amount !== null && taxable_amount !== undefined && taxable_amount !== ''
    ? Number(taxable_amount)
    : orderTax.taxableAmount;
  const finalCgst = cgst_amount !== null && cgst_amount !== undefined && cgst_amount !== ''
    ? Number(cgst_amount)
    : orderTax.cgstAmount;
  const finalSgst = sgst_amount !== null && sgst_amount !== undefined && sgst_amount !== ''
    ? Number(sgst_amount)
    : orderTax.sgstAmount;
  const finalIgst = igst_amount !== null && igst_amount !== undefined && igst_amount !== ''
    ? Number(igst_amount)
    : orderTax.igstAmount;

  // Derive composite or single gst_rate
  const dominantGstRate = gst_rate !== null && gst_rate !== undefined && gst_rate !== ''
    ? Number(gst_rate)
    : (orderTax.slab18.itemCount > 0 && orderTax.slab5.itemCount === 0 ? 18 : (orderTax.slab5.itemCount > 0 && orderTax.slab18.itemCount === 0 ? 5 : null));

  const generatedOrderNum = createOrderNumber(Date.now() % 100000);
  const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const createdOrderObject = {
    id: Date.now(),
    order_number: generatedOrderNum,
    user_id: orderUserId,
    customer_name,
    customer_email: orderCustomerEmail,
    customer_phone: customer_phone || null,
    shipping_address,
    total_amount: finalTotal,
    discount_amount: Number(discount_amount) || 0,
    shipping_amount: Number(shipping_amount) || 0,
    received_amount: received_amount !== null && received_amount !== undefined && received_amount !== '' ? Number(received_amount) : null,
    balance_amount: balance_amount !== null && balance_amount !== undefined && balance_amount !== '' ? Number(balance_amount) : null,
    gst_rate: dominantGstRate,
    is_gst_inclusive: isInclusive ? 1 : 0,
    taxable_amount: finalTaxable,
    cgst_amount: finalCgst,
    sgst_amount: finalSgst,
    igst_amount: finalIgst,
    total_mrp: total_mrp !== null && total_mrp !== undefined && total_mrp !== '' ? Number(total_mrp) : null,
    order_type: inferredOrderType,
    payment_status,
    order_status,
    payment_method: payment_method || null,
    jcoins_redeemed: numJcoinsRedeemed,
    jcoins_discount: numJcoinsDiscount,
    created_at: nowStr,
    items: orderTax.items.map((i) => ({
      product_id: i.product_id || null,
      product_name: i.product_name || i.name || 'Untitled Item',
      sku: i.sku || null,
      hsn_code: i.hsnCode || '6204',
      price: Number(i.price) || 0,
      quantity: Number(i.quantity || i.qty) || 1,
      gst_rate: Number(i.gstRate) || 5,
      taxable_amount: Number(i.taxableAmount) || 0,
      cgst_amount: Number(i.cgstAmount) || 0,
      sgst_amount: Number(i.sgstAmount) || 0,
      igst_amount: Number(i.igstAmount) || 0,
      total_tax: Number(i.totalTax) || 0,
      size: i.size || null,
      color: i.color || null,
      image_url: i.image_url || i.image || null,
    })),
  };

  try {
    let orderId;
    try {
      const [result] = await pool.query(
        `INSERT INTO orders
         (order_number, user_id, customer_name, customer_email, customer_phone, shipping_address, total_amount, discount_amount, shipping_amount, received_amount, balance_amount, gst_rate, is_gst_inclusive, taxable_amount, cgst_amount, sgst_amount, igst_amount, total_mrp, order_type, payment_method, payment_status, order_status, jcoins_redeemed, jcoins_discount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generatedOrderNum,
          orderUserId,
          customer_name,
          orderCustomerEmail,
          customer_phone || null,
          shipping_address,
          finalTotal,
          Number(discount_amount) || 0,
          Number(shipping_amount) || 0,
          createdOrderObject.received_amount,
          createdOrderObject.balance_amount,
          dominantGstRate,
          isInclusive ? 1 : 0,
          finalTaxable,
          finalCgst,
          finalSgst,
          finalIgst,
          createdOrderObject.total_mrp,
          inferredOrderType,
          payment_method || null,
          payment_status,
          order_status,
          numJcoinsRedeemed,
          numJcoinsDiscount,
        ]
      );
      orderId = result.insertId;
    } catch (colErr) {
      // Fallback in case columns differ
      const [result] = await pool.query(
        `INSERT INTO orders
         (order_number, user_id, customer_name, customer_email, customer_phone, shipping_address, total_amount, payment_method, payment_status, order_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generatedOrderNum,
          orderUserId,
          customer_name,
          orderCustomerEmail,
          customer_phone || null,
          shipping_address,
          finalTotal,
          payment_method || null,
          payment_status,
          order_status,
        ]
      );
      orderId = result.insertId;
    }

    createdOrderObject.id = orderId;

    for (const item of createdOrderObject.items) {
      try {
        await pool.query(
          `INSERT INTO order_items (order_id, product_id, product_name, sku, hsn_code, price, quantity, gst_rate, taxable_amount, cgst_amount, sgst_amount, igst_amount, total_tax, size, color, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_id,
            item.product_name,
            item.sku,
            item.hsn_code,
            item.price,
            item.quantity,
            item.gst_rate,
            item.taxable_amount,
            item.cgst_amount,
            item.sgst_amount,
            item.igst_amount,
            item.total_tax,
            item.size,
            item.color,
            item.image_url,
          ]
        );
      } catch (itemColErr) {
        await pool.query(
          `INSERT INTO order_items (order_id, product_name, sku, price, quantity, size, color, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_name,
            item.sku,
            item.price,
            item.quantity,
            item.size,
            item.color,
            item.image_url,
          ]
        );
      }
    }

    // Deduct redeemed JCoins from customer's account balance
    if (numJcoinsRedeemed > 0 && orderUserId) {
      await processOrderJCoinsRedemption(orderId, orderUserId, numJcoinsRedeemed);
    }

    // Award JCoins if order is immediately completed (e.g. POS Billing or delivered)
    if (order_status === 'delivered' || (inferredOrderType === 'pos' && payment_status === 'paid')) {
      await awardJCoinsForOrder(createdOrderObject);
    }
  } catch (error) {
    console.warn('DB insert in createOrder fallback:', error.message);
  }

  // Push to in-memory orders store so GET /api/orders returns it immediately
  mockOrders = [createdOrderObject, ...mockOrders];

  return res.status(201).json({
    success: true,
    message: 'Order created successfully.',
    order: createdOrderObject,
  });
};

export const updateOrder = async (req, res) => {
  const { id } = req.params;
  const {
    order_status,
    payment_status,
    customer_name,
    customer_email,
    customer_phone,
    shipping_address,
    total_amount,
    payment_method,
    courier,
    tracking_id,
    expected_delivery,
    items,
  } = req.body;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE id = ? OR order_number = ?',
      [id, id]
    );
    const row = rows[0];

    const runUpdate = async (sql) => {
      await pool.query(
        sql,
        [
          order_status || null,
          payment_status || null,
          customer_name || null,
          customer_email || null,
          customer_phone || null,
          shipping_address || null,
          total_amount ?? null,
          payment_method || null,
          courier || null,
          tracking_id || null,
          expected_delivery || null,
          id,
          id,
        ]
      );
    };

    try {
      await runUpdate(
        `UPDATE orders
         SET order_status = COALESCE(?, order_status),
             payment_status = COALESCE(?, payment_status),
             customer_name = COALESCE(?, customer_name),
             customer_email = COALESCE(?, customer_email),
             customer_phone = COALESCE(?, customer_phone),
             shipping_address = COALESCE(?, shipping_address),
             total_amount = COALESCE(?, total_amount),
             payment_method = COALESCE(?, payment_method),
             courier = COALESCE(?, courier),
             tracking_id = COALESCE(?, tracking_id),
             expected_delivery = COALESCE(?, expected_delivery),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ? OR order_number = ?`
      );
    } catch (err) {
      await pool.query(
        `UPDATE orders
         SET order_status = COALESCE(?, order_status),
             payment_status = COALESCE(?, payment_status),
             customer_name = COALESCE(?, customer_name),
             customer_email = COALESCE(?, customer_email),
             customer_phone = COALESCE(?, customer_phone),
             shipping_address = COALESCE(?, shipping_address),
             total_amount = COALESCE(?, total_amount),
             courier = COALESCE(?, courier),
             tracking_id = COALESCE(?, tracking_id),
             expected_delivery = COALESCE(?, expected_delivery),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ? OR order_number = ?`,
        [
          order_status || null,
          payment_status || null,
          customer_name || null,
          customer_email || null,
          customer_phone || null,
          shipping_address || null,
          total_amount ?? null,
          courier || null,
          tracking_id || null,
          expected_delivery || null,
          id,
          id,
        ]
      );
    }

    if (Array.isArray(items)) {
      await pool.query('DELETE FROM order_items WHERE order_id = ?', [row?.id || id]);
      for (const item of items) {
        await pool.query(
          `INSERT INTO order_items (order_id, product_name, price, quantity, size, color, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            row?.id || id,
            item.product_name || 'Untitled Item',
            item.price || 0,
            item.quantity || 1,
            item.size || null,
            item.color || null,
            item.image_url || null,
          ]
        );
      }
    }

    // Fetch updated order object to evaluate JCoins lifecycle triggers
    const [updatedRows] = await pool.query('SELECT * FROM orders WHERE id = ? OR order_number = ?', [id, id]);
    const updatedOrder = updatedRows.length > 0 ? updatedRows[0] : row;

    if (updatedOrder) {
      const finalOrderStatus = order_status || updatedOrder.order_status;
      const finalPaymentStatus = payment_status || updatedOrder.payment_status;

      if (finalOrderStatus === 'delivered' || (updatedOrder.order_type === 'pos' && finalPaymentStatus === 'paid')) {
        await awardJCoinsForOrder(updatedOrder);
      } else if (finalOrderStatus === 'cancelled' || finalPaymentStatus === 'refunded') {
        await reverseJCoinsForOrder(updatedOrder.id);
      }
    }

    return res.json({ success: true, message: 'Order updated successfully.' });
  } catch (error) {
    const idx = mockOrders.findIndex((o) => String(o.id) === String(id) || o.order_number === id);
    if (idx !== -1) {
      const updated = {
        ...mockOrders[idx],
        order_status: order_status || mockOrders[idx].order_status,
        payment_status: payment_status || mockOrders[idx].payment_status,
        customer_name: customer_name || mockOrders[idx].customer_name,
        customer_email: customer_email || mockOrders[idx].customer_email,
        customer_phone: customer_phone ?? mockOrders[idx].customer_phone,
        shipping_address: shipping_address || mockOrders[idx].shipping_address,
        total_amount: total_amount ?? mockOrders[idx].total_amount,
        payment_method: payment_method || mockOrders[idx].payment_method,
        items: Array.isArray(items) ? items : mockOrders[idx].items,
      };
      mockOrders[idx] = updated;

      if (order_status === 'delivered' || (updated.order_type === 'pos' && payment_status === 'paid')) {
        await awardJCoinsForOrder(updated);
      } else if (order_status === 'cancelled' || payment_status === 'refunded') {
        await reverseJCoinsForOrder(updated.id);
      }

      return res.json({ success: true, message: 'Order updated successfully.', isFallback: true });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM orders WHERE id = ? OR order_number = ?', [id, id]);
    return res.json({ success: true, message: 'Order deleted successfully.' });
  } catch (error) {
    const before = mockOrders.length;
    mockOrders = mockOrders.filter((o) => String(o.id) !== String(id) && o.order_number !== id);
    if (mockOrders.length < before) {
      return res.json({ success: true, message: 'Order deleted successfully. (Demo mode — not persisted)', isFallback: true });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};
