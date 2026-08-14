import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Cashfree API Configuration from environment variables
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const CASHFREE_ENV = (process.env.CASHFREE_ENV || 'TEST').toUpperCase(); // 'TEST' (Sandbox) or 'PRODUCTION'
const CASHFREE_API_VERSION = process.env.CASHFREE_API_VERSION || '2023-08-01';

const getCashfreeBaseUrl = () => {
  return CASHFREE_ENV === 'PRODUCTION'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
};

/**
 * Create a Cashfree Order & Payment Session ID
 */
export const createCashfreeOrder = async (req, res) => {
  try {
    const {
      order_id,
      order_amount,
      order_currency = 'INR',
      customer_details = {},
      order_meta = {},
    } = req.body;

    if (!order_amount || order_amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order amount.',
      });
    }

    const generatedOrderId = order_id || `JALYN_CF_${Date.now()}`;
    const baseUrl = getCashfreeBaseUrl();

    // Prepare Cashfree API payload
    const payload = {
      order_id: generatedOrderId,
      order_amount: parseFloat(order_amount),
      order_currency: order_currency,
      customer_details: {
        customer_id: customer_details.customer_id || `CUST_${Date.now()}`,
        customer_name: customer_details.customer_name || 'Valued Customer',
        customer_email: customer_details.customer_email || 'customer@example.com',
        customer_phone: customer_details.customer_phone || '9999999999',
      },
      order_meta: {
        return_url: order_meta.return_url || `${req.protocol}://${req.get('host')}/order-success/${generatedOrderId}`,
        notify_url: order_meta.notify_url || '',
      },
    };

    // If Cashfree credentials are not configured in environment variables, provide sandbox fallback payload
    if (!CASHFREE_APP_ID || !CASHFREE_SECRET_KEY || CASHFREE_APP_ID.includes('TEST100000')) {
      console.log('ℹ️ Cashfree: Using simulated sandbox mode (credentials start with TEST100000 or not configured)');
      return res.status(200).json({
        success: true,
        isSimulated: true,
        message: 'Cashfree API session created (Simulated mode)',
        payment_session_id: `session_simulated_${generatedOrderId}_${Date.now()}`,
        order_id: generatedOrderId,
        order_amount: payload.order_amount,
        environment: 'sandbox',
      });
    }

    // Call official Cashfree PG Orders API (for real credentials)
    console.log('🔄 Cashfree: Calling production API with real credentials...');
    const response = await axios.post(`${baseUrl}/orders`, payload, {
      headers: {
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'x-api-version': CASHFREE_API_VERSION,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Cashfree: Production API response received');
    return res.status(200).json({
      success: true,
      isSimulated: false,
      message: 'Cashfree order session created successfully.',
      payment_session_id: response.data.payment_session_id,
      order_id: response.data.order_id,
      order_amount: response.data.order_amount,
      environment: CASHFREE_ENV,
    });
  } catch (error) {
    console.error('Cashfree Create Order Error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to create Cashfree payment session: ' + error.message,
    });
  }
};

/**
 * Verify Cashfree Order / Payment Status
 */
export const verifyCashfreePayment = async (req, res) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required to verify Cashfree payment.',
      });
    }

    // Simulated payment verification
    if (order_id.includes('session_simulated') || !CASHFREE_APP_ID || !CASHFREE_SECRET_KEY || CASHFREE_APP_ID.includes('TEST100000')) {
      console.log('ℹ️ Cashfree: Simulated payment verification for order:', order_id);
      return res.status(200).json({
        success: true,
        isSimulated: true,
        order_id,
        order_status: 'PAID',
        payment_status: 'SUCCESS',
        message: 'Cashfree payment verified (Simulated mode)',
      });
    }

    // Real Cashfree API verification
    console.log('🔍 Cashfree: Verifying real payment for order:', order_id);
    const baseUrl = getCashfreeBaseUrl();
    const response = await axios.get(`${baseUrl}/orders/${order_id}`, {
      headers: {
        'x-client-id': CASHFREE_APP_ID,
        'x-client-secret': CASHFREE_SECRET_KEY,
        'x-api-version': CASHFREE_API_VERSION,
      },
    });

    const isPaid = response.data.order_status === 'PAID';
    console.log('✅ Cashfree: Verification response -', response.data.order_status);

    return res.status(200).json({
      success: true,
      isSimulated: false,
      order_id: response.data.order_id,
      order_status: response.data.order_status,
      payment_status: isPaid ? 'SUCCESS' : 'PENDING',
      order_amount: response.data.order_amount,
    });
  } catch (error) {
    console.error('Cashfree Verify Error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      success: false,
      message: error.response?.data?.message || 'Failed to verify Cashfree payment: ' + error.message,
    });
  }
};
