import pool from '../config/db.js';

// ─── GET /racks ───
export const getRacks = async (req, res) => {
  const { search, status, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let where = 'WHERE 1=1';
    const params = [];

    if (search) {
      where += ' AND (name LIKE ? OR code LIKE ? OR description LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (status && status !== 'all') {
      where += ' AND status = ?';
      params.push(status);
    }

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM racks ${where}`, params);

    const [rows] = await pool.query(
      `SELECT *, (SELECT COUNT(*) FROM products WHERE products.rack_id = racks.id) as product_count
       FROM racks ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );

    return res.json({
      success: true,
      racks: rows || [],
      pagination: {
        total: countRows[0]?.total || 0,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch racks', error: error.message });
  }
};

// ─── GET /racks/:id ───
export const getRackById = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT r.*,
        (SELECT COUNT(*) FROM products WHERE products.rack_id = r.id) as product_count
       FROM racks r WHERE r.id = ?`,
      [id]
    );
    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Rack not found' });
    }
    return res.json({ success: true, rack: rows[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /racks ───
export const createRack = async (req, res) => {
  const { name, code, description, status } = req.body;

  if (!name || !String(name).trim()) {
    return res.status(400).json({ success: false, message: 'Rack name is required.' });
  }

  try {
    if (code) {
      const [dup] = await pool.query('SELECT id FROM racks WHERE code = ?', [String(code).trim()]);
      if (dup.length > 0) {
        return res.status(400).json({ success: false, message: `Rack code "${code}" already exists.` });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO racks (name, code, description, status) VALUES (?, ?, ?, ?)`,
      [
        String(name).trim(),
        code ? String(code).trim().toUpperCase() : null,
        description ? String(description).trim() : null,
        status === 'inactive' ? 'inactive' : 'active',
      ]
    );
    return res.status(201).json({
      success: true,
      message: 'Rack created successfully!',
      rack: { id: result.insertId },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create rack', error: error.message });
  }
};

// ─── PUT /racks/:id ───
export const updateRack = async (req, res) => {
  const { id } = req.params;
  const { name, code, description, status } = req.body;

  try {
    const [existing] = await pool.query('SELECT * FROM racks WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Rack not found' });
    }

    if (name !== undefined && !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Rack name is required.' });
    }

    if (code) {
      const [dup] = await pool.query('SELECT id FROM racks WHERE code = ? AND id != ?', [String(code).trim(), id]);
      if (dup.length > 0) {
        return res.status(400).json({ success: false, message: `Rack code "${code}" already exists.` });
      }
    }

    const sets = [];
    const params = [];

    if (name !== undefined) { sets.push('name = ?'); params.push(String(name).trim()); }
    if (code !== undefined) { sets.push('code = ?'); params.push(code ? String(code).trim().toUpperCase() : null); }
    if (description !== undefined) { sets.push('description = ?'); params.push(description ? String(description).trim() : null); }
    if (status !== undefined) { sets.push('status = ?'); params.push(status === 'inactive' ? 'inactive' : 'active'); }

    if (sets.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update.' });
    }

    params.push(id);
    await pool.query(`UPDATE racks SET ${sets.join(', ')} WHERE id = ?`, params);

    const [updated] = await pool.query('SELECT * FROM racks WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Rack updated successfully!', rack: updated[0] });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update rack', error: error.message });
  }
};

// ─── PATCH /racks/:id/status ───
export const updateRackStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be active or inactive.' });
  }

  try {
    const [result] = await pool.query('UPDATE racks SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Rack not found' });
    }
    return res.json({
      success: true,
      message: status === 'active' ? 'Rack activated.' : 'Rack deactivated.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /racks/:id ───
export const deleteRack = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM racks WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Rack not found' });
    }
    return res.json({ success: true, message: 'Rack deleted successfully.' });
  } catch (error) {
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        success: false,
        message: 'Rack is assigned to products. Deactivate the rack instead of deleting.',
      });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};