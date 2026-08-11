import pool from '../config/db.js';

let mockOrders = [
  {
    id: 101,
    order_number: 'ORD-2026-8801',
    customer_name: 'Priya Sharma',
    customer_email: 'priya@example.com',
    customer_phone: '+91 9876543210',
    total_amount: 3198.00,
    payment_status: 'paid',
    order_status: 'processing',
    payment_method: 'Online Payment (UPI)',
    shipping_address: '102 Rosewood Heights, Bandra West, Mumbai, Maharashtra 400050',
    created_at: '2026-08-10 10:15:00',
    items: [
      { product_name: 'Floral Midi Dress', quantity: 1, price: 1899.00, size: 'M', color: 'rose', image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=200&q=80' },
      { product_name: 'Satin Wrap Blouse', quantity: 1, price: 1299.00, size: 'S', color: 'cream', image_url: 'https://images.unsplash.com/photo-1551163943-3f6fa0d40dc1?auto=format&fit=crop&w=200&q=80' }
    ]
  },
  {
    id: 102,
    order_number: 'ORD-2026-8802',
    customer_name: 'Ananya Verma',
    customer_email: 'ananya@example.com',
    customer_phone: '+91 9812345678',
    total_amount: 1899.00,
    payment_status: 'paid',
    order_status: 'shipped',
    payment_method: 'Cash on Delivery',
    shipping_address: '45 Park Street, Indiranagar, Bengaluru, Karnataka 560038',
    created_at: '2026-08-09 14:30:00',
    items: [
      { product_name: 'Floral Midi Dress', quantity: 1, price: 1899.00, size: 'L', color: 'black', image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=200&q=80' }
    ]
  },
  {
    id: 103,
    order_number: 'ORD-2026-8799',
    customer_name: 'Riya Kulkarni',
    customer_email: 'riya@example.com',
    customer_phone: '+91 9988776655',
    total_amount: 4298.00,
    payment_status: 'pending',
    order_status: 'pending',
    payment_method: 'Cash on Delivery',
    shipping_address: '88 Lakeview Residency, Shivaji Nagar, Pune, Maharashtra 411005',
    created_at: '2026-08-08 18:45:00',
    items: [
      { product_name: 'Pleated Mauve Dress', quantity: 1, price: 2499.00, size: 'M', color: 'mauve', image_url: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=200&q=80' },
      { product_name: 'Linen Wrap Top', quantity: 1, price: 1799.00, size: 'S', color: 'cream', image_url: 'https://images.unsplash.com/photo-1551163943-3f6fa0d40dc1?auto=format&fit=crop&w=200&q=80' }
    ]
  }
];

const normalizeRow = (row) => ({
  ...row,
  payment_status: row.payment_status || 'paid',
  order_status: row.order_status || 'pending',
});

const readOrdersWithItems = async () => {
  const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
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
};

const createOrderNumber = (id) => {
  const now = new Date();
  const y = now.getFullYear();
  const yy = String(y % 100).padStart(2, '0');
  return `ORD-${y}-${String(id).padStart(4, '0')}${yy}`;
};

export const getOrders = async (req, res) => {
  try {
    const orders = await readOrdersWithItems();
    if (!orders || orders.length === 0) {
      return res.json({ success: true, orders: mockOrders, isFallback: true });
    }
    return res.json({ success: true, orders });
  } catch (error) {
    return res.json({ success: true, orders: mockOrders, isFallback: true });
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
      const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [found.id]);
      return res.json({ success: true, order: { ...found, items } });
    }

    const mockOrder = mockOrders.find((o) => String(o.id) === String(id) || o.order_number === id);
    if (mockOrder) {
      return res.json({ success: true, order: mockOrder, isFallback: true });
    }
    return res.status(404).json({ success: false, message: 'Order not found' });
  } catch (error) {
    const mockOrder = mockOrders.find((o) => String(o.id) === String(id) || o.order_number === id);
    if (mockOrder) {
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
    payment_status = 'pending',
    order_status = 'pending',
    payment_method = 'Online Payment',
    items = [],
  } = req.body;

  if (!customer_name || !customer_email || !shipping_address) {
    return res.status(400).json({ success: false, message: 'Customer name, email and shipping address are required.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO orders
       (order_number, customer_name, customer_email, customer_phone, shipping_address, total_amount, payment_status, order_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        createOrderNumber(Date.now() % 100000),
        customer_name,
        customer_email,
        customer_phone || null,
        shipping_address,
        total_amount || 0,
        payment_status,
        order_status,
      ]
    );
    const orderId = result.insertId;

    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_name, price, quantity, size, color, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_name || 'Untitled Item',
          item.price || 0,
          item.quantity || 1,
          item.size || null,
          item.color || null,
          item.image_url || null,
        ]
      );
    }

    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const [orderItems] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [orderId]);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully.',
      order: { ...normalizeRow(rows[0]), items: orderItems },
    });
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
      const mockId = Math.max(...mockOrders.map((o) => o.id), 1000) + 1;
      const order = {
        id: mockId,
        order_number: createOrderNumber(mockId),
        customer_name,
        customer_email,
        customer_phone: customer_phone || null,
        shipping_address,
        total_amount: total_amount || items.reduce((s, i) => s + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0),
        payment_status,
        order_status,
        payment_method: payment_method || null,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        items: items.map((i) => ({ ...i, quantity: Number(i.quantity) || 1 })),
      };
      mockOrders = [order, ...mockOrders];
      return res.status(201).json({
        success: true,
        message: 'Order created successfully. (Demo mode — not persisted)',
        order,
        isFallback: true,
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
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
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ? OR order_number = ?`
      );
    } catch (err) {
      if (err.sqlMessage && err.sqlMessage.includes("Unknown column 'payment_method'")) {
        await pool.query(
          `UPDATE orders
           SET order_status = COALESCE(?, order_status),
               payment_status = COALESCE(?, payment_status),
               customer_name = COALESCE(?, customer_name),
               customer_email = COALESCE(?, customer_email),
               customer_phone = COALESCE(?, customer_phone),
               shipping_address = COALESCE(?, shipping_address),
               total_amount = COALESCE(?, total_amount),
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
            id,
            id,
          ]
        );
      } else {
        throw err;
      }
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