import pool from '../config/db.js';
import {
  getUserJCoinsBalance,
  getJCoinsHistory,
  findOrCreateCustomerByPhone,
  adminAdjustJCoins,
  JCOIN_CONFIG,
} from '../services/jcoinService.js';

/**
 * Get JCoins Balance & Available Redemption Options for Logged-In Customer
 */
export const getMyJCoinsBalance = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const balance = await getUserJCoinsBalance(userId);
    return res.json({
      success: true,
      balance,
      config: JCOIN_CONFIG,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Get JCoins Ledger History for Logged-In Customer
 */
export const getMyJCoinsHistory = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const history = await getJCoinsHistory(userId);
    return res.json({
      success: true,
      history,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Lookup Customer Account by Phone Number for Online Checkout & POS Billing
 */
export const lookupCustomerByPhone = async (req, res) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone number parameter is required' });
  }

  const cleanPhone = String(phone).replace(/[^0-9]/g, '');
  if (!cleanPhone || cleanPhone.length < 10) {
    return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit phone number' });
  }

  try {
    const customer = await findOrCreateCustomerByPhone({ phone: cleanPhone });
    if (!customer) {
      return res.json({ success: true, found: false });
    }

    const balance = Number(customer.jcoins_balance || 0);

    return res.json({
      success: true,
      found: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        jcoins_balance: balance,
      },
      redemptionOptions: JCOIN_CONFIG.REDEMPTION_OPTIONS,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Admin: Get JCoins Transaction History for a Specific User
 */
export const getAdminUserJCoinsHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const history = await getJCoinsHistory(id);
    const balance = await getUserJCoinsBalance(id);
    return res.json({
      success: true,
      balance,
      history,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * Admin: Manual Adjustment of User JCoins (+/-)
 */
export const adminAdjustUserJCoins = async (req, res) => {
  const { id } = req.params;
  const { points, description } = req.body;

  const pts = parseInt(points, 10);
  if (isNaN(pts) || pts === 0) {
    return res.status(400).json({ success: false, message: 'Please enter a non-zero integer for JCoins adjustment' });
  }

  try {
    const result = await adminAdjustJCoins(id, pts, description);
    if (!result.success) {
      return res.status(400).json({ success: false, message: result.reason || result.error });
    }

    return res.json({
      success: true,
      message: `JCoins balance updated successfully. New balance: ${result.newBalance}`,
      newBalance: result.newBalance,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

