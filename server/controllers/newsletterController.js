import pool from '../config/db.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ensureNewsletterTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(50) NULL,
        email VARCHAR(150) NULL,
        source VARCHAR(50) DEFAULT 'homepage',
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // In case table existed with old schema, ensure phone column and nullable email
    try {
      await pool.query(`ALTER TABLE newsletter_subscribers ADD COLUMN phone VARCHAR(50) NULL AFTER id`);
    } catch (e) {}
    try {
      await pool.query(`ALTER TABLE newsletter_subscribers MODIFY COLUMN email VARCHAR(150) NULL`);
    } catch (e) {}
  } catch (err) {
    console.log('ℹ️ newsletter_subscribers table check:', err.message);
  }
};

ensureNewsletterTable();

export const subscribeNewsletter = async (req, res) => {
  const phone = String(req.body?.phone || req.body?.whatsapp || req.body?.whatsapp_number || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const source = req.body?.source || 'homepage';

  if (phone) {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ success: false, message: 'Please enter a valid 10-digit WhatsApp number.' });
    }

    try {
      await pool.query(
        'INSERT INTO newsletter_subscribers (phone, email, source) VALUES (?, ?, ?)',
        [cleanPhone, email || null, source]
      );
      return res.json({
        success: true,
        message: 'Welcome to the JALYN WhatsApp VIP Club!',
      });
    } catch (error) {
      return res.json({
        success: true,
        message: 'You are already subscribed to JALYN WhatsApp VIP updates!',
      });
    }
  }

  if (email) {
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    try {
      await pool.query(
        'INSERT INTO newsletter_subscribers (phone, email, source) VALUES (?, ?, ?)',
        [null, email, source]
      );
      return res.json({
        success: true,
        message: 'You are in! Welcome to the JALYN inner circle.',
      });
    } catch (error) {
      return res.json({
        success: true,
        message: 'You are already subscribed!',
      });
    }
  }

  return res.status(400).json({ success: false, message: 'Please enter your WhatsApp number.' });
};

export const getNewsletterSubscribers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, phone, email, source, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC'
    );
    return res.json({ success: true, subscribers: rows });
  } catch (error) {
    return res.json({ success: true, subscribers: [] });
  }
};

export const deleteNewsletterSubscriber = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM newsletter_subscribers WHERE id = ?', [id]);
    return res.json({ success: true, message: 'Subscriber removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to remove subscriber.' });
  }
};