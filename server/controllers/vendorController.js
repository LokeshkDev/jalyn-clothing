import pool from '../config/db.js';

const INDIAN_PHONE_REGEX = /^[+]?[0-9]{10,13}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
const PINCODE_REGEX = /^[0-9]{6}$/;

const normalizePhone = (phone) => {
  if (!phone) return '';
  return String(phone).replace(/[\s-]/g, '');
};

// ─── GET /vendors ───
export const getVendors = async (req, res) => {
  const { search, status, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (name LIKE ? OR company_name LIKE ? OR email LIKE ? OR phone LIKE ? OR gst_number LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s);
    }
    if (status && status !== 'all') {
      where += ' AND status = ?';
      params.push(status);
    }

    const countQuery = `SELECT COUNT(*) as total FROM vendors ${where}`;
    const [countRows] = await pool.query(countQuery, params);

    const [rows] = await pool.query(
      `SELECT *, (SELECT COUNT(*) FROM products WHERE products.vendor_id = vendors.id) as product_count
       FROM vendors ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    return res.json({
      success: true,
      vendors: rows || [],
      pagination: {
        total: countRows[0]?.total || 0,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vendors', error: error.message });
  }
};

// ─── GET /vendors/:id ───
export const getVendorById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT v.*, 
        (SELECT COUNT(*) FROM products WHERE products.vendor_id = v.id) as product_count
       FROM vendors v WHERE v.id = ?`,
      [id]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    return res.json({ success: true, vendor: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /vendors/:id/products ───
// Products assigned to a vendor, shown in a table on the Vendor Management page.
export const getVendorProducts = async (req, res) => {
  const { id } = req.params;
  const { search, status, page = 1, limit = 25 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [vendorRows] = await pool.query('SELECT id, name FROM vendors WHERE id = ?', [id]);
    if (!vendorRows || vendorRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    const params = [id];
    let where = 'WHERE p.vendor_id = ?';
    if (search) {
      where += ' AND (p.title LIKE ? OR p.base_sku LIKE ? OR p.product_code LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (status && status !== 'all') {
      where += ' AND p.is_active = ?';
      params.push(status === 'active' ? 1 : 0);
    }

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM products p ${where}`,
      params
    );

    const [rows] = await pool.query(
      `SELECT p.id, p.title, p.slug, p.base_sku, p.product_code, p.primary_image,
              p.category_slug, p.price, p.original_price, p.stock, p.low_stock_threshold,
              p.is_active, p.is_online, p.is_offline, p.created_at, p.variants,
              (SELECT COALESCE(SUM(stock), 0) FROM product_godown_stock WHERE product_id = p.id) as godown_total,
              (SELECT COUNT(*) FROM product_godown_stock WHERE product_id = p.id) as godown_count
       FROM products p ${where}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    // Dynamic stock: godown distribution sum > variants sum > stored stock
    const products = (rows || []).map((p) => {
      let effectiveStock = parseInt(p.stock, 10) || 0;
      const godownTotal = parseInt(p.godown_total, 10) || 0;
      if (godownTotal > 0) {
        effectiveStock = godownTotal;
      } else {
        let variants = p.variants;
        if (typeof variants === 'string') {
          try { variants = JSON.parse(variants); } catch (e) { variants = []; }
        }
        if (Array.isArray(variants) && variants.length > 0) {
          const variantTotal = variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
          if (variantTotal > 0) effectiveStock = variantTotal;
        }
      }
      return { ...p, variants: undefined, stock: effectiveStock };
    });

    return res.json({
      success: true,
      vendor: vendorRows[0],
      products,
      pagination: {
        total: countRows[0]?.total || 0,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch vendor products', error: error.message });
  }
};

// ─── POST /vendors ───
export const createVendor = async (req, res) => {
  const {
    name, company_name, phone, email, address, city, state, pincode, gst_number, notes, status,
  } = req.body;

  if (!name || !String(name).trim()) {
    return res.status(400).json({ success: false, message: 'Vendor name is required.' });
  }

  const errors = [];

  if (phone) {
    const cleanPhone = normalizePhone(phone);
    if (!INDIAN_PHONE_REGEX.test(cleanPhone)) {
      errors.push('Phone number must be a valid 10-digit number (with optional country code).');
    }
  }
  if (email) {
    if (!EMAIL_REGEX.test(String(email).trim())) {
      errors.push('Please enter a valid email address.');
    }
  }
  if (gst_number) {
    const cleanGst = String(gst_number).trim().toUpperCase();
    if (!GST_REGEX.test(cleanGst)) {
      errors.push('GST number must be a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5).');
    }
  }
  if (pincode && !PINCODE_REGEX.test(String(pincode).trim())) {
    errors.push('Pincode must be a valid 6-digit PIN code.');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors.join(' ') });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO vendors (name, company_name, phone, email, address, city, state, pincode, gst_number, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(name).trim(),
        company_name ? String(company_name).trim() : null,
        phone ? normalizePhone(phone) : null,
        email ? String(email).trim().toLowerCase() : null,
        address ? String(address).trim() : null,
        city ? String(city).trim() : null,
        state ? String(state).trim() : null,
        pincode ? String(pincode).trim() : null,
        gst_number ? String(gst_number).trim().toUpperCase() : null,
        notes ? String(notes).trim() : null,
        status === 'inactive' ? 'inactive' : 'active',
      ]
    );
    return res.status(201).json({
      success: true,
      message: 'Vendor created successfully!',
      vendor: { id: result.insertId },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create vendor', error: error.message });
  }
};

// ─── PUT /vendors/:id ───
export const updateVendor = async (req, res) => {
  const { id } = req.params;
  const {
    name, company_name, phone, email, address, city, state, pincode, gst_number, notes, status,
  } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM vendors WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }

    if (name !== undefined && !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Vendor name is required.' });
    }

    const errors = [];
    const cleanPhone = phone !== undefined && phone ? normalizePhone(phone) : undefined;
    if (cleanPhone && !INDIAN_PHONE_REGEX.test(cleanPhone)) {
      errors.push('Phone number must be a valid 10-digit number (with optional country code).');
    }
    const cleanEmail = email !== undefined && email ? String(email).trim().toLowerCase() : undefined;
    if (cleanEmail && !EMAIL_REGEX.test(cleanEmail)) {
      errors.push('Please enter a valid email address.');
    }
    const cleanGst = gst_number !== undefined && gst_number ? String(gst_number).trim().toUpperCase() : undefined;
    if (cleanGst && !GST_REGEX.test(cleanGst)) {
      errors.push('GST number must be a valid 15-character GSTIN (e.g. 22AAAAA0000A1Z5).');
    }
    const cleanPincode = pincode !== undefined && pincode ? String(pincode).trim() : undefined;
    if (cleanPincode && !PINCODE_REGEX.test(cleanPincode)) {
      errors.push('Pincode must be a valid 6-digit PIN code.');
    }
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: errors.join(' ') });
    }

    const sets = [];
    const params = [];

    if (name !== undefined) { sets.push('name = ?'); params.push(String(name).trim()); }
    if (company_name !== undefined) { sets.push('company_name = ?'); params.push(company_name ? String(company_name).trim() : null); }
    if (phone !== undefined) { sets.push('phone = ?'); params.push(cleanPhone || null); }
    if (email !== undefined) { sets.push('email = ?'); params.push(cleanEmail || null); }
    if (address !== undefined) { sets.push('address = ?'); params.push(address ? String(address).trim() : null); }
    if (city !== undefined) { sets.push('city = ?'); params.push(city ? String(city).trim() : null); }
    if (state !== undefined) { sets.push('state = ?'); params.push(state ? String(state).trim() : null); }
    if (pincode !== undefined) { sets.push('pincode = ?'); params.push(cleanPincode || null); }
    if (gst_number !== undefined) { sets.push('gst_number = ?'); params.push(cleanGst || null); }
    if (notes !== undefined) { sets.push('notes = ?'); params.push(notes ? String(notes).trim() : null); }
    if (status !== undefined) { sets.push('status = ?'); params.push(status === 'inactive' ? 'inactive' : 'active'); }

    if (sets.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    params.push(id);
    await pool.query(`UPDATE vendors SET ${sets.join(', ')} WHERE id = ?`, params);

    const [updated] = await pool.query('SELECT * FROM vendors WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Vendor updated successfully!', vendor: updated[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update vendor', error: error.message });
  }
};

// ─── PATCH /vendors/:id/status ───
export const updateVendorStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be active or inactive.' });
  }

  try {
    const [result] = await pool.query('UPDATE vendors SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    return res.json({
      success: true,
      message: status === 'active' ? 'Vendor activated.' : 'Vendor deactivated.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /vendors/:id ───
export const deleteVendor = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM vendors WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Vendor not found' });
    }
    return res.json({ success: true, message: 'Vendor deleted successfully.' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        success: false,
        message: 'Vendor is assigned to products. Deactivate the vendor instead of deleting.',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};
