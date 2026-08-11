import pool from '../config/db.js';

let mockCoupons = [
  { id: 1, code: 'WELCOME10', title: 'Welcome Special 10% OFF', description: 'Special 10% OFF for new Jalyn customers', discount_type: 'percent', discount_value: 10, min_amount: 999, max_discount: null, expires_at: '2026-12-31', usage_limit: 0, used_count: 0, is_active: 1, created_at: '2026-08-01 09:00:00', updated_at: '2026-08-01 09:00:00' },
  { id: 2, code: 'JALYN10', title: 'Festive Offer 10% OFF', description: 'Instant 10% OFF on orders above ₹1499', discount_type: 'percent', discount_value: 10, min_amount: 1499, max_discount: null, expires_at: '2026-12-31', usage_limit: 0, used_count: 0, is_active: 1, created_at: '2026-08-01 09:00:00', updated_at: '2026-08-01 09:00:00' },
  { id: 3, code: 'LUXE15', title: 'Luxury Edit 15% OFF', description: '15% OFF on orders above ₹3999', discount_type: 'percent', discount_value: 15, min_amount: 3999, max_discount: 500, expires_at: '2026-12-31', usage_limit: 0, used_count: 0, is_active: 1, created_at: '2026-08-01 09:00:00', updated_at: '2026-08-01 09:00:00' },
  { id: 4, code: 'FLAT200', title: 'Flat ₹200 OFF', description: 'Flat ₹200 off on orders above ₹1499', discount_type: 'flat', discount_value: 200, min_amount: 1499, max_discount: null, expires_at: '2026-12-31', usage_limit: 0, used_count: 0, is_active: 1, created_at: '2026-08-01 09:00:00', updated_at: '2026-08-01 09:00:00' },
];

const rowToCoupon = (row) => ({
  id: row.id,
  code: row.code,
  title: row.title,
  description: row.description || '',
  discount_type: row.discount_type || 'percent',
  discount_value: Number(row.discount_value) || 0,
  min_amount: Number(row.min_amount) || 0,
  max_discount: row.max_discount != null ? Number(row.max_discount) : null,
  expires_at: row.expires_at ? new Date(row.expires_at).toISOString().slice(0, 10) : null,
  usage_limit: Number(row.usage_limit) || 0,
  used_count: Number(row.used_count) || 0,
  is_active: Number(row.is_active) !== 0,
  created_at: row.created_at,
  updated_at: row.updated_at,
});

const isCouponUsable = (c) => {
  if (!c.is_active) return false;
  if (c.expires_at && new Date(c.expires_at + 'T23:59:59') < new Date()) return false;
  if (c.usage_limit > 0 && c.used_count >= c.usage_limit) return false;
  return true;
};

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const randomCode = (length = 8) => {
  let code = '';
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
};

const uniqueCode = async (prefix, length) => {
  let attempts = 0;
  while (attempts < 30) {
    const code = `${prefix}${prefix ? '-' : ''}${randomCode(length)}`.toUpperCase();
    try {
      const [rows] = await pool.query('SELECT id FROM coupons WHERE code = ?', [code]);
      if (rows.length === 0) return code;
    } catch {
      if (!mockCoupons.some((c) => c.code === code)) return code;
    }
    attempts += 1;
  }
  return `${prefix}${prefix ? '-' : ''}${randomCode(length)}${Date.now() % 100}`.toUpperCase();
};

// ─── PUBLIC ───
export const getActiveCoupons = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT * FROM coupons WHERE is_active = 1
       AND (expires_at IS NULL OR expires_at >= CURDATE())
       AND (usage_limit = 0 OR used_count < usage_limit)
       ORDER BY min_amount ASC`
    );
    const coupons = rows.map(rowToCoupon);
    if (coupons.length === 0) {
      return res.json({ success: true, coupons: mockCoupons.filter(isCouponUsable) });
    }
    return res.json({ success: true, coupons });
  } catch (error) {
    return res.json({ success: true, coupons: mockCoupons.filter(isCouponUsable) });
  }
};

// ─── ADMIN ───
export const getAllCoupons = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM coupons ORDER BY created_at DESC');
    return res.json({ success: true, coupons: rows.map(rowToCoupon) });
  } catch (error) {
    return res.json({ success: true, coupons: mockCoupons });
  }
};

export const createCoupon = async (req, res) => {
  const { code, title, description, discount_type, discount_value, min_amount, max_discount, expires_at, usage_limit, is_active } = req.body;

  if (!code || !title || !discount_type || discount_value === undefined || discount_value === '') {
    return res.status(400).json({ success: false, message: 'Code, title, discount type and discount value are required.' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO coupons (code, title, description, discount_type, discount_value, min_amount, max_discount, expires_at, usage_limit, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(code).trim().toUpperCase(),
        title,
        description || null,
        discount_type,
        Number(discount_value) || 0,
        Number(min_amount) || 0,
        max_discount != null && max_discount !== '' ? Number(max_discount) : null,
        expires_at || null,
        Number(usage_limit) || 0,
        is_active === undefined || is_active === true || is_active === 1 ? 1 : 0,
      ]
    );
    const [rows] = await pool.query('SELECT * FROM coupons WHERE id = ?', [result.insertId]);
    return res.status(201).json({ success: true, message: 'Coupon created successfully.', coupon: rowToCoupon(rows[0]) });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A coupon with this code already exists.' });
    }
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
      const coupon = {
        id: Math.max(...mockCoupons.map((c) => c.id), 1000) + 1,
        code: String(code).trim().toUpperCase(),
        title,
        description: description || '',
        discount_type,
        discount_value: Number(discount_value) || 0,
        min_amount: Number(min_amount) || 0,
        max_discount: max_discount != null && max_discount !== '' ? Number(max_discount) : null,
        expires_at: expires_at || null,
        usage_limit: Number(usage_limit) || 0,
        used_count: 0,
        is_active: is_active === undefined || is_active === true || is_active === 1 ? true : false,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };
      mockCoupons = [coupon, ...mockCoupons];
      return res.status(201).json({ success: true, message: 'Coupon created successfully. (Demo mode — not persisted)', coupon });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const generateCoupons = async (req, res) => {
  const { count = 5, prefix = 'JALYN', title, description, discount_type, discount_value, min_amount, max_discount, expires_at, usage_limit, is_active } = req.body;

  const qty = Math.min(Math.max(parseInt(count, 10) || 5, 1), 100);

  try {
    const generated = [];
    for (let i = 0; i < qty; i++) {
      const code = await uniqueCode(prefix, 8);
      const [result] = await pool.query(
        `INSERT INTO coupons (code, title, description, discount_type, discount_value, min_amount, max_discount, expires_at, usage_limit, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          code,
          title || `${discount_type === 'flat' ? 'Flat ₹' + discount_value + ' OFF' : discount_value + '% OFF'} Coupon`,
          description || 'Auto-generated offer coupon',
          discount_type,
          Number(discount_value) || 0,
          Number(min_amount) || 0,
          max_discount != null && max_discount !== '' ? Number(max_discount) : null,
          expires_at || null,
          Number(usage_limit) || 0,
          is_active === undefined || is_active === true || is_active === 1 ? 1 : 0,
        ]
      );
      generated.push(code);
    }
    return res.status(201).json({ success: true, message: `${generated.length} coupon(s) generated successfully.`, codes: generated });
  } catch (error) {
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_DB_ERROR') {
      const generated = [];
      for (let i = 0; i < qty; i++) {
        const code = await uniqueCode(prefix, 8);
        const coupon = {
          id: Math.max(...mockCoupons.map((c) => c.id), 1000) + 1,
          code,
          title: title || `${discount_type === 'flat' ? 'Flat ₹' + discount_value + ' OFF' : discount_value + '% OFF'} Coupon`,
          description: description || 'Auto-generated offer coupon',
          discount_type,
          discount_value: Number(discount_value) || 0,
          min_amount: Number(min_amount) || 0,
          max_discount: max_discount != null && max_discount !== '' ? Number(max_discount) : null,
          expires_at: expires_at || null,
          usage_limit: Number(usage_limit) || 0,
          used_count: 0,
          is_active: is_active === undefined || is_active === true || is_active === 1 ? true : false,
          created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
        };
        mockCoupons = [coupon, ...mockCoupons];
        generated.push(code);
      }
      return res.status(201).json({ success: true, message: `${generated.length} coupon(s) generated successfully. (Demo mode — not persisted)`, codes: generated });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCoupon = async (req, res) => {
  const { id } = req.params;
  const { code, title, description, discount_type, discount_value, min_amount, max_discount, expires_at, usage_limit, is_active } = req.body;

  const fields = {
    code: code != null ? String(code).trim().toUpperCase() : undefined,
    title: title != null ? title : undefined,
    description: description != null ? (description === '' ? null : description) : undefined,
    discount_type: discount_type || undefined,
    discount_value: discount_value !== undefined && discount_value !== '' ? Number(discount_value) : undefined,
    min_amount: min_amount !== undefined && min_amount !== '' ? Number(min_amount) : undefined,
    max_discount: max_discount !== undefined ? (max_discount === '' ? null : Number(max_discount)) : undefined,
    expires_at: expires_at !== undefined ? (expires_at === '' ? null : expires_at) : undefined,
    usage_limit: usage_limit !== undefined && usage_limit !== '' ? Number(usage_limit) : undefined,
    is_active: is_active !== undefined ? (is_active === true || is_active === 1 ? 1 : 0) : undefined,
  };

  try {
    await pool.query(
      `UPDATE coupons SET
         code = COALESCE(?, code),
         title = COALESCE(?, title),
         description = COALESCE(?, description),
         discount_type = COALESCE(?, discount_type),
         discount_value = COALESCE(?, discount_value),
         min_amount = COALESCE(?, min_amount),
         max_discount = COALESCE(?, max_discount),
         expires_at = COALESCE(?, expires_at),
         usage_limit = COALESCE(?, usage_limit),
         is_active = COALESCE(?, is_active),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        fields.code ?? null,
        fields.title ?? null,
        fields.description ?? null,
        fields.discount_type ?? null,
        fields.discount_value ?? null,
        fields.min_amount ?? null,
        fields.max_discount ?? null,
        fields.expires_at ?? null,
        fields.usage_limit ?? null,
        fields.is_active ?? null,
        id,
      ]
    );
    const [rows] = await pool.query('SELECT * FROM coupons WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Coupon updated successfully.', coupon: rows.length > 0 ? rowToCoupon(rows[0]) : undefined });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'A coupon with this code already exists.' });
    }
    const idx = mockCoupons.findIndex((c) => String(c.id) === String(id));
    if (idx !== -1) {
      mockCoupons[idx] = {
        ...mockCoupons[idx],
        code: fields.code || mockCoupons[idx].code,
        title: fields.title || mockCoupons[idx].title,
        description: fields.description !== undefined ? fields.description : mockCoupons[idx].description,
        discount_type: fields.discount_type || mockCoupons[idx].discount_type,
        discount_value: fields.discount_value ?? mockCoupons[idx].discount_value,
        min_amount: fields.min_amount ?? mockCoupons[idx].min_amount,
        max_discount: fields.max_discount !== undefined ? fields.max_discount : mockCoupons[idx].max_discount,
        expires_at: fields.expires_at !== undefined ? fields.expires_at : mockCoupons[idx].expires_at,
        usage_limit: fields.usage_limit ?? mockCoupons[idx].usage_limit,
        is_active: fields.is_active !== undefined ? fields.is_active === 1 : mockCoupons[idx].is_active,
      };
      return res.json({ success: true, message: 'Coupon updated successfully. (Demo mode — not persisted)', coupon: mockCoupons[idx] });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCoupon = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Coupon deleted successfully.' });
  } catch (error) {
    const before = mockCoupons.length;
    mockCoupons = mockCoupons.filter((c) => String(c.id) !== String(id));
    if (mockCoupons.length < before) {
      return res.json({ success: true, message: 'Coupon deleted successfully. (Demo mode — not persisted)' });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};