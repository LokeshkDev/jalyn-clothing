import pool from '../config/db.js';

// ─── GET /godowns ───
export const getGodowns = async (req, res) => {
  const { search, status, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (name LIKE ? OR code LIKE ? OR city LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (status && status !== 'all') {
      where += ' AND status = ?';
      params.push(status);
    }

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM godowns ${where}`, params);

    const [rows] = await pool.query(
      `SELECT g.*,
        (SELECT COUNT(DISTINCT product_id) FROM product_godown_stock WHERE godown_id = g.id) as product_count,
        (SELECT COALESCE(SUM(stock), 0) FROM product_godown_stock WHERE godown_id = g.id) as total_stock
       FROM godowns g ${where} ORDER BY is_default DESC, created_at ASC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    return res.json({
      success: true,
      godowns: rows || [],
      pagination: {
        total: countRows[0]?.total || 0,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch godowns', error: error.message });
  }
};

// ─── GET /godowns/:id ───
export const getGodownById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM godowns WHERE id = ?', [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Godown not found' });
    }
    return res.json({ success: true, godown: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /godowns ───
export const createGodown = async (req, res) => {
  const { name, code, address, city, contact_person, phone, notes, is_default, status } = req.body;

  if (!name || !String(name).trim()) {
    return res.status(400).json({ success: false, message: 'Godown name is required.' });
  }

  try {
    if (code) {
      const [dup] = await pool.query('SELECT id FROM godowns WHERE code = ?', [String(code).trim()]);
      if (dup.length > 0) {
        return res.status(400).json({ success: false, message: `Godown code "${code}" already exists.` });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO godowns (name, code, address, city, contact_person, phone, notes, is_default, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(name).trim(),
        code ? String(code).trim().toUpperCase() : null,
        address ? String(address).trim() : null,
        city ? String(city).trim() : null,
        contact_person ? String(contact_person).trim() : null,
        phone ? String(phone).trim() : null,
        notes ? String(notes).trim() : null,
        is_default ? 1 : 0,
        status === 'inactive' ? 'inactive' : 'active',
      ]
    );
    return res.status(201).json({
      success: true,
      message: 'Godown created successfully!',
      godown: { id: result.insertId },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create godown', error: error.message });
  }
};

// ─── PUT /godowns/:id ───
export const updateGodown = async (req, res) => {
  const { id } = req.params;
  const { name, code, address, city, contact_person, phone, notes, is_default, status } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM godowns WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Godown not found' });
    }

    if (name !== undefined && !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Godown name is required.' });
    }

    if (code) {
      const [dup] = await pool.query('SELECT id FROM godowns WHERE code = ? AND id != ?', [String(code).trim(), id]);
      if (dup.length > 0) {
        return res.status(400).json({ success: false, message: `Godown code "${code}" already exists.` });
      }
    }

    const sets = [];
    const params = [];

    if (name !== undefined) { sets.push('name = ?'); params.push(String(name).trim()); }
    if (code !== undefined) { sets.push('code = ?'); params.push(code ? String(code).trim().toUpperCase() : null); }
    if (address !== undefined) { sets.push('address = ?'); params.push(address ? String(address).trim() : null); }
    if (city !== undefined) { sets.push('city = ?'); params.push(city ? String(city).trim() : null); }
    if (contact_person !== undefined) { sets.push('contact_person = ?'); params.push(contact_person ? String(contact_person).trim() : null); }
    if (phone !== undefined) { sets.push('phone = ?'); params.push(phone ? String(phone).trim() : null); }
    if (notes !== undefined) { sets.push('notes = ?'); params.push(notes ? String(notes).trim() : null); }
    if (is_default !== undefined) { sets.push('is_default = ?'); params.push(is_default ? 1 : 0); }
    if (status !== undefined) { sets.push('status = ?'); params.push(status === 'inactive' ? 'inactive' : 'active'); }

    if (sets.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    params.push(id);
    await pool.query(`UPDATE godowns SET ${sets.join(', ')} WHERE id = ?`, params);

    const [updated] = await pool.query('SELECT * FROM godowns WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Godown updated successfully!', godown: updated[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update godown', error: error.message });
  }
};

// ─── PATCH /godowns/:id/status ───
export const updateGodownStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be active or inactive.' });
  }

  try {
    const [result] = await pool.query('UPDATE godowns SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Godown not found' });
    }
    return res.json({
      success: true,
      message: status === 'active' ? 'Godown activated.' : 'Godown deactivated.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /godowns/:id ───
export const deleteGodown = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM godowns WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Godown not found' });
    }
    return res.json({ success: true, message: 'Godown deleted successfully.' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        success: false,
        message: 'Godown has stock records. Deactivate the godown instead of deleting.',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /godowns/stock ───
// Consolidated stock view: every product with per-godown quantities + total.
export const getGodownStock = async (req, res) => {
  const { search, godown_id, page = 1, limit = 25 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const params = [];
    let where = 'WHERE 1=1';

    if (search) {
      where += ' AND (p.title LIKE ? OR p.base_sku LIKE ? OR p.product_code LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (godown_id) {
      where += ' AND EXISTS (SELECT 1 FROM product_godown_stock gs WHERE gs.product_id = p.id AND gs.godown_id = ?)';
      params.push(godown_id);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(DISTINCT p.id) as total FROM products p ${where}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT
         p.id, p.title, p.slug, p.base_sku, p.product_code, p.primary_image, p.category_slug,
         p.stock as total_stock, p.low_stock_threshold, p.is_active, p.created_at,
         (SELECT COALESCE(SUM(stock), 0) FROM product_godown_stock WHERE product_id = p.id) as godown_total,
         (SELECT COUNT(*) FROM product_godown_stock WHERE product_id = p.id) as godown_count
       FROM products p
       ${where}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    const [godowns] = await pool.query('SELECT id, name, code, status FROM godowns ORDER BY is_default DESC, id ASC');

    // Per-godown quantities for the page's products
    const productIds = (rows || []).map((r) => r.id);
    let stockMap = {};
    if (productIds.length > 0) {
      const [stockRows] = await pool.query(
        `SELECT product_id, godown_id, stock FROM product_godown_stock WHERE product_id IN (?)`,
        [productIds]
      );
      stockMap = (stockRows || []).reduce((acc, s) => {
        if (!acc[s.product_id]) acc[s.product_id] = {};
        acc[s.product_id][s.godown_id] = s.stock;
        return acc;
      }, {});
    }

    const products = (rows || []).map((r) => ({
      ...r,
      stock_by_godown: godowns.map((g) => ({
        godown_id: g.id,
        godown_name: g.name,
        godown_code: g.code,
        stock: stockMap[r.id]?.[g.id] || 0,
      })),
    }));

    return res.json({
      success: true,
      products,
      godowns,
      pagination: {
        total: countRows[0]?.total || 0,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch godown stock', error: error.message });
  }
};

// ─── GET /godowns/:id/stock ───
// Stock for a single godown (products with non-zero stock in that godown by default).
export const getGodownStockById = async (req, res) => {
  const { id } = req.params;
  const { search, page = 1, limit = 25 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [godownRows] = await pool.query('SELECT * FROM godowns WHERE id = ?', [id]);
    if (!godownRows || godownRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Godown not found' });
    }

    const params = [id];
    let where = 'WHERE gs.godown_id = ?';
    if (search) {
      where += ' AND (p.title LIKE ? OR p.base_sku LIKE ? OR p.product_code LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM product_godown_stock gs JOIN products p ON p.id = gs.product_id ${where}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT gs.stock, gs.updated_at as stock_updated_at,
         p.id, p.title, p.slug, p.base_sku, p.product_code, p.primary_image, p.category_slug,
         p.stock as total_stock, p.low_stock_threshold
       FROM product_godown_stock gs
       JOIN products p ON p.id = gs.product_id
       ${where}
       ORDER BY gs.updated_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    return res.json({
      success: true,
      godown: godownRows[0],
      products: rows || [],
      pagination: {
        total: countRows[0]?.total || 0,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch godown stock', error: error.message });
  }
};

// ─── POST /godowns/stock/adjust ───
// Adjust stock for a product in a specific godown.
// { godown_id, product_id, change_qty, reason, reference }
// change_qty > 0 adds stock; change_qty < 0 reduces stock.
export const adjustGodownStock = async (req, res) => {
  const { godown_id, product_id, change_qty, reason, reference } = req.body;
  const qty = parseInt(change_qty, 10);

  if (!godown_id || !product_id || !qty || qty === 0) {
    return res.status(400).json({
      success: false,
      message: 'godown_id, product_id and a non-zero change_qty are required.',
    });
  }

  const connection = await pool.getConnection();
  await connection.beginTransaction();

  try {
    const [godownRows] = await connection.query('SELECT * FROM godowns WHERE id = ?', [godown_id]);
    if (!godownRows || godownRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Godown not found' });
    }

    const [productRows] = await connection.query('SELECT * FROM products WHERE id = ?', [product_id]);
    if (!productRows || productRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const product = productRows[0];

    // Current godown stock (FOR UPDATE to prevent race conditions)
    const [stockRows] = await connection.query(
      'SELECT * FROM product_godown_stock WHERE product_id = ? AND godown_id = ? FOR UPDATE',
      [product_id, godown_id]
    );

    const currentStock = stockRows.length > 0 ? parseInt(stockRows[0].stock, 10) || 0 : 0;
    const newStock = currentStock + qty;

    if (newStock < 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Insufficient stock in this godown. Available: ${currentStock}. Cannot reduce by ${Math.abs(qty)}.`,
        availableStock: currentStock,
      });
    }

    if (stockRows.length > 0) {
      await connection.query(
        'UPDATE product_godown_stock SET stock = ? WHERE id = ?',
        [newStock, stockRows[0].id]
      );
    } else {
      await connection.query(
        'INSERT INTO product_godown_stock (product_id, godown_id, stock) VALUES (?, ?, ?)',
        [product_id, godown_id, newStock]
      );
    }

    // Recompute product total stock from all godowns
    const [totals] = await connection.query(
      'SELECT COALESCE(SUM(stock), 0) as total FROM product_godown_stock WHERE product_id = ?',
      [product_id]
    );
    const newTotal = parseInt(totals[0]?.total, 10) || 0;
    await connection.query('UPDATE products SET stock = ? WHERE id = ?', [newTotal, product_id]);

    // Log to inventory audit trail
    const type = qty > 0 ? 'Stock Added' : 'Stock Reduced';
    await connection.query(
      `INSERT INTO inventory_transactions
       (product_id, variant_sku, type, change_qty, balance_after, reference, notes, source, godown_id, reference_id, quantity_before, user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_id,
        product.base_sku || 'PRIMARY',
        type,
        qty,
        newStock,
        reference || `GDN-${Date.now()}`,
        reason || `Godown stock ${qty > 0 ? 'addition' : 'reduction'} (${godownRows[0].name})`,
        'godown_stock',
        godown_id,
        `${product_id}:${godown_id}`,
        currentStock,
        req.user?.id || null,
      ]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: `${godownRows[0].name} stock for "${product.title}": ${currentStock} → ${newStock}`,
      data: {
        godown_id,
        product_id,
        currentStock,
        changeQty: qty,
        newStock,
        totalStock: newTotal,
      },
    });
  } catch (error) {
    await connection.rollback();
    console.error('adjustGodownStock error:', error);
    return res.status(500).json({ success: false, message: 'Failed to adjust godown stock', error: error.message });
  } finally {
    connection.release();
  }
};

// ─── GET /godowns/stock/product/:productId ───
// Per-godown stock for a single product (used by the product add/edit form).
export const getProductGodownStock = async (req, res) => {
  const { productId } = req.params;

  try {
    const [rows] = await pool.query(
      `SELECT gs.stock, g.*
       FROM product_godown_stock gs
       JOIN godowns g ON g.id = gs.godown_id
       WHERE gs.product_id = ?
       ORDER BY g.is_default DESC, g.id ASC`,
      [productId]
    );

    return res.json({ success: true, stock: rows || [] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch product godown stock', error: error.message });
  }
};