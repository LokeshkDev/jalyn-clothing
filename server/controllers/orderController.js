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
    await ensureCol('order_items', 'returned_quantity', 'ALTER TABLE order_items ADD COLUMN returned_quantity INT DEFAULT 0');

    // Order Returns audit table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_returns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        order_number VARCHAR(100) NOT NULL,
        return_type VARCHAR(20) NOT NULL DEFAULT 'return',
        returned_items JSON NOT NULL,
        replacement_items JSON NULL,
        total_refund_amount DECIMAL(10,2) DEFAULT 0.00,
        balance_collected DECIMAL(10,2) DEFAULT 0.00,
        reason VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
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

    let returns = [];
    try {
      const [retRows] = await pool.query(
        `SELECT * FROM order_returns WHERE order_id IN (${placeholders}) ORDER BY id DESC`,
        ids
      );
      returns = retRows.map((r) => ({
        ...r,
        returned_items: typeof r.returned_items === 'string' ? JSON.parse(r.returned_items || '[]') : (r.returned_items || []),
        replacement_items: typeof r.replacement_items === 'string' ? JSON.parse(r.replacement_items || '[]') : (r.replacement_items || []),
      }));
    } catch (_) {}

    return orders.map((o) => ({
      ...o,
      items: items.filter((it) => it.order_id === o.id),
      returns: returns.filter((ret) => ret.order_id === o.id),
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

      let returns = [];
      try {
        const [retRows] = await pool.query('SELECT * FROM order_returns WHERE order_id = ? ORDER BY id DESC', [found.id]);
        returns = retRows.map((r) => ({
          ...r,
          returned_items: typeof r.returned_items === 'string' ? JSON.parse(r.returned_items || '[]') : (r.returned_items || []),
          replacement_items: typeof r.replacement_items === 'string' ? JSON.parse(r.replacement_items || '[]') : (r.replacement_items || []),
        }));
      } catch (_) {}

      return res.json({ success: true, order: { ...found, items, returns } });
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

    // Deduct inventory stock for billed items (POS Billing & Online Orders)
    await deductInventoryForOrder(createdOrderObject.items, generatedOrderNum);

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
        try {
          const [orderItems] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [updatedOrder.id]);
          await restoreInventoryForOrder(orderItems && orderItems.length > 0 ? orderItems : updatedOrder.items || [], updatedOrder.order_number);
        } catch (restockErr) {
          console.warn('Restock on cancel error:', restockErr.message);
        }
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

/**
 * Process Return & Replace with Mandatory Reason and Inventory Restocking
 */
export const returnReplaceOrder = async (req, res) => {
  const { id } = req.params;
  const {
    return_type = 'return',
    returned_items = [],
    replacement_items = [],
    total_refund_amount = 0,
    balance_collected = 0,
    general_reason = '',
  } = req.body;

  if (!Array.isArray(returned_items) || returned_items.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one item must be selected for return.' });
  }

  // MANDATORY REQUIREMENT: Verify every returned item has a non-empty reason!
  for (const item of returned_items) {
    const qty = parseInt(item.quantity, 10) || 0;
    if (qty > 0 && (!item.reason || !String(item.reason).trim())) {
      return res.status(400).json({
        success: false,
        message: `Please select or provide a return reason for item: "${item.product_name || 'Item'}" before proceeding.`,
      });
    }
  }

  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? OR order_number = ?', [id, id]);
    const order = rows[0];

    const orderId = order ? order.id : id;
    const orderNumber = order ? order.order_number : id;

    // 1. Restock returned items to product & variant stock inventory
    await restoreInventoryForOrder(returned_items, `RET-${orderNumber}`);

    for (const retItem of returned_items) {
      const qty = parseInt(retItem.quantity, 10) || 0;
      if (qty <= 0) continue;
      try {
        await pool.query(
          `UPDATE order_items
           SET returned_quantity = COALESCE(returned_quantity, 0) + ?
           WHERE order_id = ? AND (product_id = ? OR product_name = ?)`,
          [qty, orderId, retItem.product_id || null, retItem.product_name || '']
        );
      } catch (_) {}
    }

    // 2. If replacement items picked, deduct inventory stock for replacement items
    if (return_type === 'replace' && Array.isArray(replacement_items) && replacement_items.length > 0) {
      await deductInventoryForOrder(replacement_items, `REP-${orderNumber}`);
    }

    // 3. Record entry in order_returns table
    try {
      await pool.query(
        `INSERT INTO order_returns (order_id, order_number, return_type, returned_items, replacement_items, total_refund_amount, balance_collected, reason)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          orderNumber,
          return_type,
          JSON.stringify(returned_items),
          JSON.stringify(replacement_items),
          Number(total_refund_amount) || 0,
          Number(balance_collected) || 0,
          general_reason || returned_items.map((i) => `${i.product_name}: ${i.reason}`).join('; '),
        ]
      );
    } catch (retTableErr) {
      console.warn('Could not record order_returns entry:', retTableErr.message);
    }

    // 4. Update parent order status
    const newOrderStatus = return_type === 'replace' ? 'replaced' : 'returned';
    try {
      await pool.query(
        `UPDATE orders
         SET order_status = ?,
             payment_status = CASE WHEN ? > 0 THEN 'refunded' ELSE payment_status END,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [newOrderStatus, Number(total_refund_amount) || 0, orderId]
      );
    } catch (_) {}

    return res.json({
      success: true,
      message: return_type === 'replace'
        ? 'Item replacement completed. Restocked returned item and updated stock inventory.'
        : 'Item return completed successfully. Stock inventory has been restocked.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get Sales Analytics for Admin Dashboard Bar Chart (Daily, Weekly, Monthly, Yearly)
 */
export const getSalesAnalytics = async (req, res) => {
  const { period = 'daily' } = req.query;

  try {
    let orders = await readOrdersWithItems();
    if (!orders || orders.length === 0) {
      orders = mockOrders;
    }

    const validOrders = orders.filter((o) => o.order_status !== 'cancelled' && o.payment_status !== 'failed');

    const now = new Date();
    let labels = [];
    let buckets = {};

    if (period === 'daily') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const dayStr = d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
        const dateKey = d.toISOString().slice(0, 10);
        labels.push(dayStr);
        buckets[dateKey] = { label: dayStr, pos: 0, online: 0, total: 0, orders: 0 };
      }

      validOrders.forEach((o) => {
        const createdDate = new Date(o.created_at || o.date || now);
        const key = createdDate.toISOString().slice(0, 10);
        if (buckets[key]) {
          const amt = Number(o.total_amount) || 0;
          const isPos = o.order_type === 'pos' || o.order_type === 'walkin' || String(o.shipping_address).toLowerCase().includes('in-store');
          if (isPos) buckets[key].pos += amt;
          else buckets[key].online += amt;
          buckets[key].total += amt;
          buckets[key].orders += 1;
        }
      });
    } else if (period === 'weekly') {
      for (let i = 3; i >= 0; i--) {
        const weekLabel = `Week ${4 - i}`;
        labels.push(weekLabel);
        buckets[i] = { label: weekLabel, pos: 0, online: 0, total: 0, orders: 0 };
      }

      validOrders.forEach((o) => {
        const createdDate = new Date(o.created_at || o.date || now);
        const diffDays = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        const weekIdx = Math.floor(diffDays / 7);
        if (weekIdx >= 0 && weekIdx < 4) {
          const key = 3 - weekIdx;
          if (buckets[key]) {
            const amt = Number(o.total_amount) || 0;
            const isPos = o.order_type === 'pos' || o.order_type === 'walkin' || String(o.shipping_address).toLowerCase().includes('in-store');
            if (isPos) buckets[key].pos += amt;
            else buckets[key].online += amt;
            buckets[key].total += amt;
            buckets[key].orders += 1;
          }
        }
      });
    } else if (period === 'monthly') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months.forEach((m, idx) => {
        labels.push(m);
        buckets[idx] = { label: m, pos: 0, online: 0, total: 0, orders: 0 };
      });

      validOrders.forEach((o) => {
        const createdDate = new Date(o.created_at || o.date || now);
        if (createdDate.getFullYear() === now.getFullYear()) {
          const mIdx = createdDate.getMonth();
          if (buckets[mIdx]) {
            const amt = Number(o.total_amount) || 0;
            const isPos = o.order_type === 'pos' || o.order_type === 'walkin' || String(o.shipping_address).toLowerCase().includes('in-store');
            if (isPos) buckets[mIdx].pos += amt;
            else buckets[mIdx].online += amt;
            buckets[mIdx].total += amt;
            buckets[mIdx].orders += 1;
          }
        }
      });
    } else {
      const currentYear = now.getFullYear();
      for (let y = currentYear - 4; y <= currentYear; y++) {
        labels.push(String(y));
        buckets[y] = { label: String(y), pos: 0, online: 0, total: 0, orders: 0 };
      }

      validOrders.forEach((o) => {
        const createdDate = new Date(o.created_at || o.date || now);
        const y = createdDate.getFullYear();
        if (buckets[y]) {
          const amt = Number(o.total_amount) || 0;
          const isPos = o.order_type === 'pos' || o.order_type === 'walkin' || String(o.shipping_address).toLowerCase().includes('in-store');
          if (isPos) buckets[y].pos += amt;
          else buckets[y].online += amt;
          buckets[y].total += amt;
          buckets[y].orders += 1;
        }
      });
    }

    const chartData = Object.values(buckets);
    const totalRevenue = chartData.reduce((s, b) => s + b.total, 0);
    const posRevenue = chartData.reduce((s, b) => s + b.pos, 0);
    const onlineRevenue = chartData.reduce((s, b) => s + b.online, 0);
    const totalOrders = chartData.reduce((s, b) => s + b.orders, 0);

    return res.json({
      success: true,
      period,
      chartData,
      totals: {
        totalRevenue,
        posRevenue,
        onlineRevenue,
        totalOrders,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Generate Printable PDF / HTML Invoice for WhatsApp and Direct Download
 */
export const getOrderPdf = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? OR order_number = ?', [id, id]);
    let order = rows[0];
    if (!order) {
      order = mockOrders.find((o) => String(o.id) === String(id) || o.order_number === id);
    }
    if (!order) {
      return res.status(404).send('<h2>Invoice Not Found</h2>');
    }

    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    const orderItems = items.length > 0 ? items : (order.items || []);

    const dateStr = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Tax Invoice - ${order.order_number || order.id}</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f1419; margin: 0; padding: 24px; background: #fff; }
    .invoice-card { max-width: 800px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 32px; border-radius: 12px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #ad4a85; padding-bottom: 16px; }
    .brand { font-size: 24px; font-weight: 800; color: #ad4a85; letter-spacing: 2px; }
    .title { font-size: 14px; color: #6b7280; text-transform: uppercase; font-weight: 700; margin-top: 4px; }
    .meta { text-align: right; font-size: 12px; color: #374151; }
    .details { display: flex; justify-content: space-between; margin: 24px 0; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th { background: #faf8f8; text-align: left; padding: 10px; border-bottom: 2px solid #e5e7eb; font-weight: 700; color: #374151; }
    td { padding: 10px; border-bottom: 1px solid #f3f4f6; }
    .totals { margin-top: 24px; width: 280px; margin-left: auto; font-size: 13px; }
    .row { display: flex; justify-content: space-between; padding: 4px 0; }
    .grand-total { font-weight: 800; font-size: 16px; color: #ad4a85; border-top: 2px solid #ad4a85; padding-top: 8px; margin-top: 8px; }
    .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
    @media print { body { padding: 0; } .invoice-card { border: none; padding: 0; } }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="brand">JALYN APPARELS</div>
        <div class="title">Official Tax Invoice</div>
      </div>
      <div class="meta">
        <div><strong>Invoice #:</strong> ${order.order_number || order.id}</div>
        <div><strong>Date:</strong> ${dateStr}</div>
        <div><strong>GSTIN:</strong> 33BPCPA4714D1ZP</div>
      </div>
    </div>

    <div class="details">
      <div>
        <strong>Billed To:</strong><br>
        ${order.customer_name || 'Walk-in Customer'}<br>
        ${order.customer_phone ? 'Phone: +91 ' + order.customer_phone + '<br>' : ''}
        ${order.customer_email || ''}
      </div>
      <div style="text-align: right;">
        <strong>Store Address:</strong><br>
        Jalyn Apparel Studio<br>
        Chennai, Tamil Nadu 600073<br>
        Phone: +91 9790904504
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Item Particulars</th>
          <th>Qty</th>
          <th>Price</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${orderItems.map((item, idx) => `
          <tr>
            <td>${idx + 1}</td>
            <td>${item.product_name || 'Item'} ${item.size ? '(' + item.size + ')' : ''}</td>
            <td>${item.quantity || 1}</td>
            <td>₹${Number(item.price || 0).toLocaleString('en-IN')}</td>
            <td style="text-align: right;">₹${((Number(item.price || 0)) * (Number(item.quantity || 1))).toLocaleString('en-IN')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="row"><span>Subtotal:</span><span>₹${Number(order.total_amount || 0).toLocaleString('en-IN')}</span></div>
      ${Number(order.discount_amount) > 0 ? `<div class="row"><span>Discount:</span><span>−₹${Number(order.discount_amount).toLocaleString('en-IN')}</span></div>` : ''}
      <div class="row grand-total"><span>Grand Total:</span><span>₹${Number(order.total_amount || 0).toLocaleString('en-IN')}</span></div>
    </div>

    <div class="footer">
      <p>Thank you for shopping with Jalyn Apparels! This is a computer generated invoice.</p>
    </div>
  </div>
  <script>window.onload = function() { if (window.location.search.includes('print=true')) window.print(); }</script>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    return res.status(500).send('Error generating invoice: ' + err.message);
  }
};

/**
 * Deduct inventory stock for billed items in an order (POS or Online)
 */
export const deductInventoryForOrder = async (items, reference = '') => {
  if (!Array.isArray(items) || items.length === 0) return;

  for (const item of items) {
    const qty = Math.max(1, parseInt(item.quantity || item.qty, 10) || 1);
    const productId = item.product_id || item.id || null;
    const sku = item.sku || null;
    const productName = (item.product_name || item.name || '').trim();
    const size = item.size || null;
    const color = item.color || null;

    try {
      let targetProduct = null;

      if (productId) {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
        if (rows.length > 0) targetProduct = rows[0];
      }
      if (!targetProduct && sku) {
        const [rows] = await pool.query('SELECT * FROM products WHERE base_sku = ? OR product_code = ?', [sku, sku]);
        if (rows.length > 0) targetProduct = rows[0];
      }
      if (!targetProduct && productName) {
        const [rows] = await pool.query('SELECT * FROM products WHERE title = ? OR barcode_short_name = ?', [productName, productName]);
        if (rows.length > 0) targetProduct = rows[0];
      }

      if (!targetProduct) {
        console.warn(`ℹ️ Inventory check: product "${productName}" (ID: ${productId}, SKU: ${sku}) not in DB catalog.`);
        continue;
      }

      const pId = targetProduct.id;

      let variants = [];
      try {
        variants = typeof targetProduct.variants === 'string' ? JSON.parse(targetProduct.variants || '[]') : (targetProduct.variants || []);
      } catch (_) {}

      let variantUpdated = false;
      let newVariantStock = null;

      if (Array.isArray(variants) && variants.length > 0) {
        const vIdx = variants.findIndex((v) => {
          if (sku && v.sku === sku) return true;
          if (size && color && String(v.size).toLowerCase() === String(size).toLowerCase() && String(v.color).toLowerCase() === String(color).toLowerCase()) return true;
          if (size && String(v.size).toLowerCase() === String(size).toLowerCase() && !color) return true;
          return false;
        });

        if (vIdx !== -1) {
          const currentVStock = parseInt(variants[vIdx].stock, 10) || 0;
          variants[vIdx].stock = Math.max(0, currentVStock - qty);
          newVariantStock = variants[vIdx].stock;
          variantUpdated = true;
        }
      }

      let newTotalStock;
      if (variantUpdated) {
        newTotalStock = variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
        await pool.query('UPDATE products SET variants = ?, stock = ? WHERE id = ?', [
          JSON.stringify(variants),
          newTotalStock,
          pId,
        ]);
      } else {
        const currentStock = parseInt(targetProduct.stock, 10) || 0;
        newTotalStock = Math.max(0, currentStock - qty);
        await pool.query('UPDATE products SET stock = ? WHERE id = ?', [newTotalStock, pId]);
      }

      // Deduct godown stock if product_godown_stock table entry exists
      try {
        await pool.query(
          'UPDATE product_godown_stock SET stock = GREATEST(0, stock - ?) WHERE product_id = ? ORDER BY stock DESC LIMIT 1',
          [qty, pId]
        );
      } catch (_) {}

      // Record in inventory_transactions audit log if present
      try {
        await pool.query(
          `INSERT INTO inventory_transactions (product_id, variant_sku, type, change_qty, balance_after, reference, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            pId,
            sku || (size && color ? `${size}-${color}` : 'DEFAULT'),
            'Order Sale',
            -qty,
            newVariantStock !== null ? newVariantStock : newTotalStock,
            reference || 'ORDER-SALE',
            `Deducted ${qty} units for order ${reference}`,
          ]
        );
      } catch (_) {}

      console.log(`📦 Inventory auto-deducted for "${targetProduct.title}" (ID: ${pId}): -${qty} units. New stock: ${newTotalStock}`);
    } catch (err) {
      console.warn(`⚠️ Inventory reduction failed for "${productName}":`, err.message);
    }
  }
};

/**
 * Restore inventory stock for cancelled / refunded orders
 */
export const restoreInventoryForOrder = async (items, reference = '') => {
  if (!Array.isArray(items) || items.length === 0) return;

  for (const item of items) {
    const qty = Math.max(1, parseInt(item.quantity || item.qty, 10) || 1);
    const productId = item.product_id || item.id || null;
    const sku = item.sku || null;
    const productName = (item.product_name || item.name || '').trim();
    const size = item.size || null;
    const color = item.color || null;

    try {
      let targetProduct = null;

      if (productId) {
        const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
        if (rows.length > 0) targetProduct = rows[0];
      }
      if (!targetProduct && sku) {
        const [rows] = await pool.query('SELECT * FROM products WHERE base_sku = ? OR product_code = ?', [sku, sku]);
        if (rows.length > 0) targetProduct = rows[0];
      }
      if (!targetProduct && productName) {
        const [rows] = await pool.query('SELECT * FROM products WHERE title = ? OR barcode_short_name = ?', [productName, productName]);
        if (rows.length > 0) targetProduct = rows[0];
      }
      if (!targetProduct && productName) {
        const cleanTitle = productName.split('(')[0].split('-')[0].trim();
        if (cleanTitle.length > 1) {
          const [rows] = await pool.query('SELECT * FROM products WHERE title LIKE ? OR ? LIKE CONCAT("%", title, "%") LIMIT 1', [`%${cleanTitle}%`, productName]);
          if (rows.length > 0) targetProduct = rows[0];
        }
      }

      if (!targetProduct) continue;

      const pId = targetProduct.id;

      let variants = [];
      try {
        variants = typeof targetProduct.variants === 'string' ? JSON.parse(targetProduct.variants || '[]') : (targetProduct.variants || []);
      } catch (_) {}

      let variantUpdated = false;
      let newVariantStock = null;

      if (Array.isArray(variants) && variants.length > 0) {
        let vIdx = variants.findIndex((v) => {
          if (sku && v.sku === sku) return true;
          if (size && color && String(v.size).toLowerCase() === String(size).toLowerCase() && String(v.color).toLowerCase() === String(color).toLowerCase()) return true;
          if (size && String(v.size).toLowerCase() === String(size).toLowerCase()) return true;
          return false;
        });

        // Fallback: if no variant matched directly, update first variant so variants JSON total increases
        if (vIdx === -1) vIdx = 0;

        const currentVStock = parseInt(variants[vIdx].stock, 10) || 0;
        variants[vIdx].stock = currentVStock + qty;
        newVariantStock = variants[vIdx].stock;
        variantUpdated = true;
      }

      let newTotalStock;
      if (variantUpdated) {
        newTotalStock = variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
        await pool.query('UPDATE products SET variants = ?, stock = ? WHERE id = ?', [
          JSON.stringify(variants),
          newTotalStock,
          pId,
        ]);
      } else {
        const currentStock = parseInt(targetProduct.stock, 10) || 0;
        newTotalStock = currentStock + qty;
        await pool.query('UPDATE products SET stock = ? WHERE id = ?', [newTotalStock, pId]);
      }

      try {
        await pool.query(
          'UPDATE product_godown_stock SET stock = stock + ? WHERE product_id = ? ORDER BY godown_id ASC LIMIT 1',
          [qty, pId]
        );
      } catch (_) {}

      try {
        await pool.query(
          `INSERT INTO inventory_transactions (product_id, variant_sku, type, change_qty, balance_after, reference, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            pId,
            sku || (size && color ? `${size}-${color}` : 'DEFAULT'),
            'Order Cancel Restock',
            qty,
            newVariantStock !== null ? newVariantStock : newTotalStock,
            reference || 'CANCEL-RESTOCK',
            `Restocked ${qty} units for cancelled order ${reference}`,
          ]
        );
      } catch (_) {}

      console.log(`📦 Inventory restocked for "${targetProduct.title}" (ID: ${pId}): +${qty} units. New stock: ${newTotalStock}`);
    } catch (err) {
      console.warn(`⚠️ Inventory restock failed for "${productName}":`, err.message);
    }
  }
};

