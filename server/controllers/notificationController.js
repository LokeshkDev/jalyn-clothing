import pool from '../config/db.js';

export const getNotifications = async (req, res) => {
  try {
    const [orderRows] = await pool.query(
      `SELECT id, order_number, customer_name, total_amount, order_status, created_at
       FROM orders
       WHERE order_status IN ('pending', 'processing')
       ORDER BY created_at DESC
       LIMIT 10`
    );

    const [stockRows] = await pool.query(
      `SELECT id, title, stock, primary_image, low_stock_threshold
       FROM products
       WHERE stock < 3
       ORDER BY stock ASC
       LIMIT 20`
    );

    return res.json({
      success: true,
      data: {
        newOrders: orderRows || [],
        lowStock: stockRows || [],
      },
    });
  } catch (error) {
    console.error('getNotifications error:', error.message);
    return res.json({
      success: true,
      data: { newOrders: [], lowStock: [] },
      isFallback: true,
    });
  }
};