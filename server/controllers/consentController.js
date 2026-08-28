import pool from '../config/db.js';
import { hashIpAddress } from '../utils/privacyHash.js';

/**
 * 1. Log User Consent (Public endpoint, non-blocking)
 */
export const logConsent = async (req, res, next) => {
  try {
    const { consentUuid, version = '1.0.0', categories = {} } = req.body;
    if (!consentUuid) {
      return res.status(400).json({ success: false, message: 'consentUuid is required' });
    }

    const rawIp = req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || '';
    const ipHash = hashIpAddress(rawIp);
    const userAgent = (req.headers['user-agent'] || '').substring(0, 255);
    const userId = req.user?.id || null;

    const query = `
      INSERT INTO cookie_consents_log 
        (consent_uuid, user_id, ip_hash, user_agent, policy_version, necessary, preferences, analytics, marketing)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await pool.query(query, [
      String(consentUuid).substring(0, 64),
      userId,
      ipHash,
      userAgent,
      String(version).substring(0, 20),
      1, // Necessary is always true
      categories.preferences ? 1 : 0,
      categories.analytics ? 1 : 0,
      categories.marketing ? 1 : 0,
    ]);

    res.status(201).json({ success: true, message: 'Consent recorded successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * 2. Get Public Banner Settings
 */
export const getPublicSettings = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM cookie_consent_settings WHERE id = 1 LIMIT 1');
    const defaultSettings = {
      id: 1,
      banner_title: 'We Value Your Privacy & Shopping Experience',
      banner_description: 'We use essential cookies to keep your cart and checkout secure. With your permission, we also use functional and analytics cookies to personalize your style recommendations.',
      policy_url: '/privacy-policy',
      current_version: '1.0.0',
      is_enabled: 1,
    };

    res.json({
      success: true,
      data: {
        settings: rows[0] || defaultSettings,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 3. Update Banner Settings (Admin authorized)
 */
export const updateSettings = async (req, res, next) => {
  try {
    const { banner_title, banner_description, policy_url, current_version, is_enabled } = req.body;

    await pool.query(
      `INSERT INTO cookie_consent_settings 
        (id, banner_title, banner_description, policy_url, current_version, is_enabled)
       VALUES (1, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
        banner_title = VALUES(banner_title),
        banner_description = VALUES(banner_description),
        policy_url = VALUES(policy_url),
        current_version = VALUES(current_version),
        is_enabled = VALUES(is_enabled)`,
      [
        banner_title || 'We Value Your Privacy & Shopping Experience',
        banner_description || '',
        policy_url || '/privacy-policy',
        current_version || '1.0.0',
        is_enabled ? 1 : 0,
      ]
    );

    res.json({ success: true, message: 'Consent settings saved successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * 4. Get Audit Logs for Compliance (Admin authorized)
 */
export const getAuditLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 25);
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT id, consent_uuid, user_id, ip_hash, user_agent, policy_version, necessary, preferences, analytics, marketing, created_at 
       FROM cookie_consents_log 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM cookie_consents_log');
    const total = countResult[0]?.total || 0;

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * 5. Get Consent Analytics (Admin authorized)
 */
export const getConsentStats = async (req, res, next) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_logs,
        COALESCE(SUM(CASE WHEN analytics = 1 AND marketing = 1 AND preferences = 1 THEN 1 ELSE 0 END), 0) as accepted_all,
        COALESCE(SUM(CASE WHEN analytics = 0 AND marketing = 0 AND preferences = 0 THEN 1 ELSE 0 END), 0) as rejected_optional,
        COALESCE(SUM(analytics), 0) as analytics_count,
        COALESCE(SUM(marketing), 0) as marketing_count,
        COALESCE(SUM(preferences), 0) as preferences_count
      FROM cookie_consents_log
    `);

    res.json({
      success: true,
      data: stats[0] || {
        total_logs: 0,
        accepted_all: 0,
        rejected_optional: 0,
        analytics_count: 0,
        marketing_count: 0,
        preferences_count: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

