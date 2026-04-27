/**
 * PayPal Order Creation Endpoint
 * REAL IMPLEMENTATION: Creates real PayPal orders via PayPal API
 */

import { RequestHandler } from 'express';

const PAYPAL_CLIENT_ID = process.env.VITE_PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_MODE = process.env.VITE_PAYPAL_MODE || 'sandbox';

// Determine API base URL based on mode
const PAYPAL_API_BASE = PAYPAL_MODE === 'production'
  ? 'https://api.paypal.com/v2'
  : 'https://api.sandbox.paypal.com/v2';

/**
 * Get PayPal access token (required for all API calls)
 * REAL: Calls PayPal API to get authentication token
 */
async function getPayPalAccessToken(): Promise<string | null> {
  try {
    console.log('🔑 Requesting PayPal access token...');

    const response = await fetch(`${PAYPAL_API_BASE.replace('/v2', '')}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      console.error('❌ PayPal token error:', response.statusText);
      return null;
    }

    const data = (await response.json()) as { access_token: string };
    console.log('✅ PayPal access token obtained');
    return data.access_token;
  } catch (error) {
    console.error('❌ Error getting PayPal access token:', error);
    return null;
  }
}

/**
 * Create a real PayPal order
 * CRITICAL: This is a REAL PayPal API call, returns actual orderID
 */
export const createPayPalOrder: RequestHandler = async (req, res) => {
  try {
    const { amount, description, currency = 'MAD' } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }

    console.log(`💳 Creating PayPal order: ${amount} ${currency}`);

    // Get access token
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      res.status(500).json({ error: 'Failed to authenticate with PayPal' });
      return;
    }

    // REAL API CALL to PayPal
    const response = await fetch(`${PAYPAL_API_BASE}/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
            description: description || 'Purchase',
          },
        ],
        payer: {
          email_address: 'buyer@paypal.com',
        },
      }),
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      console.error('❌ PayPal API error:', data);
      res.status(400).json({
        error: data.message || 'Failed to create PayPal order',
        details: data,
      });
      return;
    }

    const paypalOrderId = data.id;
    console.log('✅ PayPal order created successfully!');
    console.log('PayPal Order ID:', paypalOrderId);
    console.log('Full PayPal Response:', JSON.stringify(data, null, 2));

    // VERIFICATION: Ensure we have a real orderID
    if (!paypalOrderId) {
      console.error('❌ No orderID returned from PayPal!');
      res.status(500).json({ error: 'No orderID from PayPal' });
      return;
    }

    res.json({
      success: true,
      paypalOrderId,
      orderDetails: data,
      // Include approval link if available
      approvalLink: data.links?.find((link: any) => link.rel === 'approve')?.href,
    });
  } catch (error) {
    console.error('❌ PayPal order creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Capture a PayPal order (after user approves)
 * REAL: Completes the PayPal transaction
 */
export const capturePayPalOrder: RequestHandler = async (req, res) => {
  try {
    const { paypalOrderId } = req.body;

    if (!paypalOrderId) {
      res.status(400).json({ error: 'Missing PayPal Order ID' });
      return;
    }

    console.log(`📦 Capturing PayPal order: ${paypalOrderId}`);

    // Get access token
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      res.status(500).json({ error: 'Failed to authenticate with PayPal' });
      return;
    }

    // REAL API CALL to PayPal
    const response = await fetch(`${PAYPAL_API_BASE}/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      console.error('❌ PayPal capture error:', data);
      res.status(400).json({
        error: data.message || 'Failed to capture PayPal order',
        details: data,
      });
      return;
    }

    const captureId = data.purchase_units?.[0]?.payments?.captures?.[0]?.id;
    console.log('✅ PayPal order captured successfully!');
    console.log('Capture ID:', captureId);
    console.log('Full Capture Response:', JSON.stringify(data, null, 2));

    res.json({
      success: true,
      paypalOrderId,
      captureId,
      status: data.status,
      captureDetails: data.purchase_units?.[0]?.payments?.captures?.[0],
    });
  } catch (error) {
    console.error('❌ PayPal capture error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Verify PayPal order details
 */
export const verifyPayPalOrder: RequestHandler = async (req, res) => {
  try {
    const { paypalOrderId } = req.body;

    if (!paypalOrderId) {
      res.status(400).json({ error: 'Missing PayPal Order ID' });
      return;
    }

    console.log(`✔️ Verifying PayPal order: ${paypalOrderId}`);

    // Get access token
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      res.status(500).json({ error: 'Failed to authenticate with PayPal' });
      return;
    }

    // REAL API CALL to PayPal
    const response = await fetch(`${PAYPAL_API_BASE}/checkout/orders/${paypalOrderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = (await response.json()) as any;

    if (!response.ok) {
      console.error('❌ PayPal verification error:', data);
      res.status(400).json({
        error: data.message || 'Failed to verify PayPal order',
      });
      return;
    }

    console.log('✅ PayPal order verified!');
    console.log('Order Status:', data.status);

    res.json({
      success: true,
      paypalOrderId,
      status: data.status,
      amount: data.purchase_units?.[0]?.amount?.value,
      currency: data.purchase_units?.[0]?.amount?.currency_code,
    });
  } catch (error) {
    console.error('❌ PayPal verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Health check for PayPal integration
 */
export const paypalHealthCheck: RequestHandler = async (req, res) => {
  const hasClientId = !!PAYPAL_CLIENT_ID;
  const hasSecret = !!PAYPAL_CLIENT_SECRET;

  res.json({
    paypalConfigured: hasClientId && hasSecret,
    mode: PAYPAL_MODE,
    apiBase: PAYPAL_API_BASE,
    hasClientId,
    hasSecret,
  });
};
