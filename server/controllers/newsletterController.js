import pool from '../config/db.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ensureNewsletterTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(150) NOT NULL UNIQUE,
        source VARCHAR(50) DEFAULT 'homepage',
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } catch (err) {
    console.log('ℹ️ newsletter_subscribers table check:', err.message);
  }
};

ensureNewsletterTable();

export const subscribeNewsletter = async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }

  try {
    await pool.query(
      'INSERT IGNORE INTO newsletter_subscribers (email, source) VALUES (?, ?)',
      [email, req.body?.source || 'homepage']
    );
    return res.json({
      success: true,
      message: 'You are in! Welcome to the JALYN inner circle.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
};

export const getNewsletterSubscribers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, email, source, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC'
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