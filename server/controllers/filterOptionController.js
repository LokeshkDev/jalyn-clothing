import pool from '../config/db.js';

const VALID_ATTRIBUTES = ['fabric', 'sleeve', 'occasion', 'fit', 'pattern', 'season', 'brand'];

export const ensureFilterOptionsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS filter_options (
        id INT AUTO_INCREMENT PRIMARY KEY,
        attribute VARCHAR(50) NOT NULL,
        value VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_attr_value (attribute, value)
      )
    `);
  } catch (err) {
    console.log('ℹ️ filter_options table check:', err.message);
  }
};

ensureFilterOptionsTable();

export const getFilterOptions = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT attribute, value FROM filter_options ORDER BY created_at ASC');
    const options = {};
    for (const row of rows) {
      if (!options[row.attribute]) options[row.attribute] = [];
      options[row.attribute].push(row.value);
    }
    return res.json({ success: true, options });
  } catch (error) {
    return res.json({ success: true, options: {} });
  }
};

export const createFilterOption = async (req, res) => {
  const { attribute, value } = req.body || {};
  const attr = String(attribute || '').trim().toLowerCase();
  const val = String(value || '').trim();

  if (!VALID_ATTRIBUTES.includes(attr)) {
    return res.status(400).json({ success: false, message: 'Invalid filter attribute.' });
  }
  if (!val) {
    return res.status(400).json({ success: false, message: 'Option value is required.' });
  }
  if (val.length > 100) {
    return res.status(400).json({ success: false, message: 'Option value must be 100 characters or less.' });
  }

  try {
    await pool.query(
      'INSERT IGNORE INTO filter_options (attribute, value) VALUES (?, ?)',
      [attr, val]
    );
    const [rows] = await pool.query(
      'SELECT * FROM filter_options WHERE attribute = ? AND value = ? LIMIT 1',
      [attr, val]
    );
    return res.json({ success: true, option: rows[0] || { attribute: attr, value: val } });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to save filter option.' });
  }
};

export const deleteFilterOption = async (req, res) => {
  const { id } = req.params;
  const { attribute, value } = req.query;
  try {
    if (attribute && value) {
      await pool.query(
        'DELETE FROM filter_options WHERE attribute = ? AND value = ?',
        [String(attribute).toLowerCase(), String(value)]
      );
    } else {
      await pool.query('DELETE FROM filter_options WHERE id = ?', [id]);
    }
    return res.json({ success: true, message: 'Filter option removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove filter option.' });
  }
};
