import pool from '../config/db.js';

let mockOrders = [];

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
    order_type,
    payment_status = 'pending',
    order_status = 'pending',
    payment_method = 'Online Payment',
    items = [],
  } = req.body;

  const isAdminUser = ['superadmin', 'admin'].includes(req.user?.role);
  const orderUserId = isAdminUser ? (req.body.user_id || null) : (req.user?.id || null);
  const orderCustomerEmail = isAdminUser ? customer_email : (req.user?.email || customer_email);

  if (!customer_name || !orderCustomerEmail || !shipping_address) {
    return res.status(400).json({ success: false, message: 'Customer name, email and shipping address are required.' });
  }

  // Determine order_type ('pos' / 'walkin' or 'online')
  const inferredOrderType =
    order_type ||
    (String(shipping_address).toLowerCase().includes('counter') ||
    String(shipping_address).toLowerCase().includes('in-store') ||
    String(customer_name).toLowerCase().includes('walk-in')
      ? 'pos'
      : 'online');

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
    total_amount: Number(total_amount) || 0,
    discount_amount: Number(discount_amount) || 0,
    shipping_amount: Number(shipping_amount) || 0,
    order_type: inferredOrderType,
    payment_status,
    order_status,
    payment_method: payment_method || null,
    created_at: nowStr,
    items: items.map((i) => ({
      product_name: i.product_name || i.name || 'Untitled Item',
      sku: i.sku || null,
      price: Number(i.price) || 0,
      quantity: Number(i.quantity || i.qty) || 1,
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
         (order_number, user_id, customer_name, customer_email, customer_phone, shipping_address, total_amount, discount_amount, shipping_amount, order_type, payment_method, payment_status, order_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          generatedOrderNum,
          orderUserId,
          customer_name,
          orderCustomerEmail,
          customer_phone || null,
          shipping_address,
          Number(total_amount) || 0,
          Number(discount_amount) || 0,
          Number(shipping_amount) || 0,
          inferredOrderType,
          payment_method || null,
          payment_status,
          order_status,
        ]
      );
      orderId = result.insertId;
    } catch (colErr) {
      // Fallback in case optional columns are pending ALTER TABLE
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
          Number(total_amount) || 0,
          payment_method || null,
          payment_status,
          order_status,
        ]
      );
      orderId = result.insertId;
    }

    createdOrderObject.id = orderId;

    for (const item of items) {
      try {
        await pool.query(
          `INSERT INTO order_items (order_id, product_name, sku, price, quantity, size, color, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_name || item.name || 'Untitled Item',
            item.sku || null,
            Number(item.price) || 0,
            Number(item.quantity || item.qty) || 1,
            item.size || null,
            item.color || null,
            item.image_url || item.image || null,
          ]
        );
      } catch (itemColErr) {
        await pool.query(
          `INSERT INTO order_items (order_id, product_name, price, quantity, size, color, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_name || item.name || 'Untitled Item',
            Number(item.price) || 0,
            Number(item.quantity || item.qty) || 1,
            item.size || null,
            item.color || null,
            item.image_url || item.image || null,
          ]
        );
      }
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
      'SELECT id, order_number FROM orders WHERE id = ? OR order_number = ?',
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
      return res.json({ success: true, message: 'Order updated successfully. (Demo mode — not persisted)', isFallback: true });
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
