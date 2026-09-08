import pool from '../config/db.js';

// Centralized Configurable Business Rules
export const JCOIN_CONFIG = {
  // Earning Rate: 4 JCoins per ₹100 eligible purchase amount without GST (0.04 rate)
  EARNING_RATE_PER_RS_EXCL_GST: 0.04,
  // Redemption Rate: 1 JCoin = ₹0.25 (25 Paise discount)
  COIN_VALUE_RS: 0.25,
  // Minimum purchase amount eligible for earning points
  MIN_PURCHASE_FOR_EARN: 1,
  // Redemption Options: Points required -> Discount in ₹
  REDEMPTION_OPTIONS: [
    { coins: 100, discount: 25, label: 'Redeem 100 JCoins (Save ₹25)' },
    { coins: 200, discount: 50, label: 'Redeem 200 JCoins (Save ₹50)' },
    { coins: 400, discount: 100, label: 'Redeem 400 JCoins (Save ₹100)' },
    { coins: 1000, discount: 250, label: 'Redeem 1000 JCoins (Save ₹250)' },
  ],
};

/**
 * Calculate earnable JCoins for a purchase order or amount (rounded down)
 * Rule: ₹100 bill WITHOUT GST earns 4 pts
 */
export const calculateEarnableJCoins = (orderOrAmount) => {
  let billWithoutGst = 0;
  if (typeof orderOrAmount === 'object' && orderOrAmount !== null) {
    const tax = Number(orderOrAmount.tax_amount || 0);
    const total = Number(orderOrAmount.total_amount || orderOrAmount.subtotal || 0);
    billWithoutGst = tax > 0 ? Math.max(0, total - tax) : Math.round((total / 1.05) * 100) / 100;
  } else {
    const num = Number(orderOrAmount) || 0;
    billWithoutGst = Math.round((num / 1.05) * 100) / 100;
  }

  if (billWithoutGst < JCOIN_CONFIG.MIN_PURCHASE_FOR_EARN) return 0;
  return Math.floor((billWithoutGst / 100) * 4);
};

/**
 * Lookup or auto-create a user account by phone/email to unify Online & POS Offline billing
 */
export const findOrCreateCustomerByPhone = async ({ phone, name, email }, clientConn = null) => {
  const conn = clientConn || pool;
  const cleanPhone = String(phone || '').replace(/[^0-9]/g, '');
  const cleanEmail = String(email || '').trim().toLowerCase() || (cleanPhone ? `${cleanPhone}@jalyn.in` : null);
  const cleanName = String(name || 'Customer').trim();

  if (!cleanPhone && !cleanEmail) return null;

  // 1. Try to find by phone
  if (cleanPhone) {
    const [byPhone] = await conn.query('SELECT * FROM users WHERE phone = ? LIMIT 1', [cleanPhone]);
    if (byPhone.length > 0) return byPhone[0];
  }

  // 2. Try to find by email
  if (cleanEmail) {
    const [byEmail] = await conn.query('SELECT * FROM users WHERE LOWER(email) = ? LIMIT 1', [cleanEmail]);
    if (byEmail.length > 0) return byEmail[0];
  }

  // 3. Auto-create customer user if not found
  try {
    const defaultPass = '$2a$10$VjcdeZGOavcnOmZNxCRVu.0iTnc7GXUl2qiiT0ROvObI3pWYI3pRy'; // admin123 bcrypt hash
    const targetEmail = cleanEmail || `${cleanPhone}@jalyn.in`;
    const [result] = await conn.query(
      'INSERT INTO users (name, email, phone, password, role, jcoins_balance) VALUES (?, ?, ?, ?, ?, 0)',
      [cleanName, targetEmail, cleanPhone || null, defaultPass, 'customer']
    );
    const [newUser] = await conn.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
    return newUser[0] || null;
  } catch (err) {
    console.warn('Customer auto-creation warning in jcoinService:', err.message);
    return null;
  }
};

/**
 * Retrieve current JCoins balance for a user
 */
export const getUserJCoinsBalance = async (userId) => {
  if (!userId) return 0;
  try {
    const [rows] = await pool.query('SELECT jcoins_balance FROM users WHERE id = ?', [userId]);
    return rows.length > 0 ? Number(rows[0].jcoins_balance || 0) : 0;
  } catch (err) {
    console.warn('Error fetching JCoins balance:', err.message);
    return 0;
  }
};

/**
 * Award JCoins for a successfully completed order (Idempotent!)
 */
export const awardJCoinsForOrder = async (order, clientConn = null) => {
  if (!order || !order.id) return { success: false, reason: 'Invalid order' };

  // Calculate eligible amount for earning JCoins (final total paid)
  const paidAmount = Math.max(0, Number(order.total_amount || 0));
  const earnableCoins = calculateEarnableJCoins(paidAmount);
  if (earnableCoins <= 0) return { success: true, pointsAwarded: 0 };

  const conn = clientConn || pool;

  // Resolve customer user account
  let userId = order.user_id;
  if (!userId) {
    const user = await findOrCreateCustomerByPhone(
      { phone: order.customer_phone, name: order.customer_name, email: order.customer_email },
      conn
    );
    if (user) userId = user.id;
  }
  if (!userId) return { success: false, reason: 'No customer user account associated' };

  try {
    // Idempotency check: verify if EARN transaction already exists for this order
    const [existingTx] = await conn.query(
      'SELECT id FROM jcoin_transactions WHERE user_id = ? AND order_id = ? AND type = "EARN"',
      [userId, order.id]
    );
    if (existingTx.length > 0) {
      return { success: true, pointsAwarded: 0, duplicate: true };
    }

    // Lock user row and compute new balance
    const [userRows] = await conn.query('SELECT jcoins_balance FROM users WHERE id = ? FOR UPDATE', [userId]);
    const currentBalance = userRows.length > 0 ? Number(userRows[0].jcoins_balance || 0) : 0;
    const newBalance = currentBalance + earnableCoins;

    // Update user balance
    await conn.query('UPDATE users SET jcoins_balance = ? WHERE id = ?', [newBalance, userId]);

    // Insert EARN transaction record
    await conn.query(
      `INSERT INTO jcoin_transactions (user_id, order_id, type, points, balance_after, description)
       VALUES (?, ?, 'EARN', ?, ?, ?)`,
      [userId, order.id, earnableCoins, newBalance, `Earned ${earnableCoins} JCoins for Order #${order.order_number || order.id}`]
    );

    console.log(`🪙 [JCoins] Credited ${earnableCoins} JCoins to Customer #${userId} for Order #${order.order_number || order.id}. New Balance: ${newBalance}`);
    return { success: true, pointsAwarded: earnableCoins, newBalance };
  } catch (err) {
    console.error('❌ Error awarding JCoins for order:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Process JCoins Redemption during Order Creation (Idempotent!)
 */
export const processOrderJCoinsRedemption = async (orderId, userId, coinsToRedeem, clientConn = null) => {
  const coins = Number(coinsToRedeem) || 0;
  if (!orderId || !userId || coins <= 0) return { success: true, coinsRedeemed: 0 };

  const conn = clientConn || pool;

  try {
    // Check if REDEEM transaction already processed for this order
    const [existingTx] = await conn.query(
      'SELECT id FROM jcoin_transactions WHERE user_id = ? AND order_id = ? AND type = "REDEEM"',
      [userId, orderId]
    );
    if (existingTx.length > 0) {
      return { success: true, coinsRedeemed: 0, duplicate: true };
    }

    // Lock user row & verify sufficient balance
    const [userRows] = await conn.query('SELECT jcoins_balance FROM users WHERE id = ? FOR UPDATE', [userId]);
    const currentBalance = userRows.length > 0 ? Number(userRows[0].jcoins_balance || 0) : 0;

    if (currentBalance < coins) {
      throw new Error(`Insufficient JCoins balance. Available: ${currentBalance}, Requested: ${coins}`);
    }

    const newBalance = currentBalance - coins;
    await conn.query('UPDATE users SET jcoins_balance = ? WHERE id = ?', [newBalance, userId]);

    await conn.query(
      `INSERT INTO jcoin_transactions (user_id, order_id, type, points, balance_after, description)
       VALUES (?, ?, 'REDEEM', ?, ?, ?)`,
      [userId, orderId, -coins, newBalance, `Redeemed ${coins} JCoins discount on Order #${orderId}`]
    );

    console.log(`🪙 [JCoins] Redeemed ${coins} JCoins from Customer #${userId} for Order #${orderId}. New Balance: ${newBalance}`);
    return { success: true, coinsRedeemed: coins, newBalance };
  } catch (err) {
    console.error('❌ Error executing JCoins redemption:', err.message);
    throw err;
  }
};

/**
 * Revert JCoins for cancelled or refunded orders (Idempotent!)
 */
export const reverseJCoinsForOrder = async (orderId, clientConn = null) => {
  if (!orderId) return { success: false, reason: 'Invalid orderId' };
  const conn = clientConn || pool;

  try {
    // 1. Revert Earned JCoins if EARN tx exists and has not been reversed
    const [earnTxs] = await conn.query(
      'SELECT * FROM jcoin_transactions WHERE order_id = ? AND type = "EARN"',
      [orderId]
    );
    const [alreadyReversed] = await conn.query(
      'SELECT id FROM jcoin_transactions WHERE order_id = ? AND type = "REFUND_REVERSAL"',
      [orderId]
    );

    if (earnTxs.length > 0 && alreadyReversed.length === 0) {
      const earnTx = earnTxs[0];
      const userId = earnTx.user_id;
      const pointsToDeduct = Number(earnTx.points) || 0;

      const [userRows] = await conn.query('SELECT jcoins_balance FROM users WHERE id = ? FOR UPDATE', [userId]);
      const currentBalance = userRows.length > 0 ? Number(userRows[0].jcoins_balance || 0) : 0;
      const newBalance = Math.max(0, currentBalance - pointsToDeduct);

      await conn.query('UPDATE users SET jcoins_balance = ? WHERE id = ?', [newBalance, userId]);
      await conn.query(
        `INSERT INTO jcoin_transactions (user_id, order_id, type, points, balance_after, description)
         VALUES (?, ?, 'REFUND_REVERSAL', ?, ?, ?)`,
        [userId, orderId, -pointsToDeduct, newBalance, `Reversed ${pointsToDeduct} JCoins due to Order cancellation/refund #${orderId}`]
      );
    }

    // 2. Refund Redeemed JCoins back to customer if REDEEM tx exists
    const [redeemTxs] = await conn.query(
      'SELECT * FROM jcoin_transactions WHERE order_id = ? AND type = "REDEEM"',
      [orderId]
    );

    if (redeemTxs.length > 0) {
      const redeemTx = redeemTxs[0];
      const userId = redeemTx.user_id;
      const coinsToRefund = Math.abs(Number(redeemTx.points) || 0);

      // Check if refund transaction already issued
      const [alreadyRefunded] = await conn.query(
        'SELECT id FROM jcoin_transactions WHERE order_id = ? AND type = "ADMIN_ADJUSTMENT" AND description LIKE "%Refunded redeemed JCoins%"',
        [orderId]
      );

      if (alreadyRefunded.length === 0 && coinsToRefund > 0) {
        const [userRows] = await conn.query('SELECT jcoins_balance FROM users WHERE id = ? FOR UPDATE', [userId]);
        const currentBalance = userRows.length > 0 ? Number(userRows[0].jcoins_balance || 0) : 0;
        const newBalance = currentBalance + coinsToRefund;

        await conn.query('UPDATE users SET jcoins_balance = ? WHERE id = ?', [newBalance, userId]);
        await conn.query(
          `INSERT INTO jcoin_transactions (user_id, order_id, type, points, balance_after, description)
           VALUES (?, ?, 'ADMIN_ADJUSTMENT', ?, ?, ?)`,
          [userId, orderId, coinsToRefund, newBalance, `Refunded redeemed ${coinsToRefund} JCoins for cancelled Order #${orderId}`]
        );
      }
    }

    return { success: true };
  } catch (err) {
    console.error('❌ Error reversing JCoins for order:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Admin Manual JCoins Balance Adjustment
 */
export const adminAdjustJCoins = async (userId, points, description) => {
  const pts = Number(points) || 0;
  if (!userId || pts === 0) return { success: false, reason: 'Invalid parameters' };

  try {
    const [userRows] = await pool.query('SELECT jcoins_balance FROM users WHERE id = ? FOR UPDATE', [userId]);
    if (userRows.length === 0) return { success: false, reason: 'User not found' };

    const currentBalance = Number(userRows[0].jcoins_balance || 0);
    const newBalance = Math.max(0, currentBalance + pts);

    await pool.query('UPDATE users SET jcoins_balance = ? WHERE id = ?', [newBalance, userId]);
    await pool.query(
      `INSERT INTO jcoin_transactions (user_id, type, points, balance_after, description)
       VALUES (?, 'ADMIN_ADJUSTMENT', ?, ?, ?)`,
      [userId, pts, newBalance, description || `Admin adjustment of ${pts > 0 ? `+${pts}` : pts} JCoins`]
    );

    return { success: true, newBalance };
  } catch (err) {
    console.error('Error in adminAdjustJCoins:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Fetch JCoins transaction history for a user
 */
export const getJCoinsHistory = async (userId) => {
  if (!userId) return [];
  try {
    const [rows] = await pool.query(
      `SELECT t.*, o.order_number
       FROM jcoin_transactions t
       LEFT JOIN orders o ON t.order_id = o.id
       WHERE t.user_id = ?
       ORDER BY t.created_at DESC, t.id DESC`,
      [userId]
    );
    return rows;
  } catch (err) {
    console.warn('Error fetching JCoins history:', err.message);
    return [];
  }
};

