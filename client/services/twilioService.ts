/**
 * Twilio Service - Real WhatsApp/SMS notifications
 * REAL IMPLEMENTATION: Sends actual WhatsApp/SMS messages via Twilio API
 */

import type { Order } from '@/types';

const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_FROM = import.meta.env.VITE_TWILIO_WHATSAPP_FROM;
const TWILIO_WHATSAPP_TO = import.meta.env.VITE_TWILIO_WHATSAPP_TO;

/**
 * Send real WhatsApp notification to admin after order creation
 * CRITICAL: This is a REAL API call to Twilio, not a mock
 */
export async function sendOrderNotificationWhatsApp(order: Order): Promise<boolean> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error('❌ Twilio credentials are not configured');
    return false;
  }

  try {
    // Build message content
    const itemsSummary = order.items
      .map((item) => `- ${item.productName || 'Product'} (Qty: ${item.quantity}) - ${item.price}د.م.`)
      .join('\n');

    const message = `
🛍️ *NEW ORDER RECEIVED*
━━━━━━━━━━━━━━━━━━
Order ID: ${order.id}
Customer: ${order.customerName}
Email: ${order.customerEmail}
Phone: ${order.customerPhone}
Address: ${order.customerAddress}

📦 Items:
${itemsSummary}

💰 Total: ${order.total}د.م.
━━━━━━━━━━━━━━━━━━
    `.trim();

    console.log('📤 Sending WhatsApp notification to admin...');
    console.log('Message preview:', message);

    // REAL API CALL to Twilio
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: TWILIO_WHATSAPP_FROM,
        To: TWILIO_WHATSAPP_TO,
        Body: message,
      }).toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Twilio API Error:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('✅ WhatsApp message sent successfully!');
    console.log('Twilio Message SID:', data.sid);
    
    // VERIFICATION: Log the real response
    console.log('Twilio Response:', JSON.stringify(data, null, 2));

    return true;
  } catch (error) {
    console.error('❌ Error sending WhatsApp notification:', error);
    return false;
  }
}

/**
 * Send customer WhatsApp confirmation
 */
export async function sendOrderConfirmationWhatsApp(order: Order): Promise<boolean> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error('❌ Twilio credentials are not configured');
    return false;
  }

  try {
    const message = `
✅ *Order Confirmed!*
━━━━━━━━━━━━━━━━━━
Thank you for your order!

Order ID: ${order.id}
Total: ${order.total}د.م.

We'll notify you when your order ships.
Track your order status anytime.
━━━━━━━━━━━━━━━━━━
    `.trim();

    console.log('📤 Sending customer confirmation WhatsApp...');

    // REAL API CALL to Twilio
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: TWILIO_WHATSAPP_FROM,
        To: `whatsapp:${order.customerPhone}`,
        Body: message,
      }).toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Twilio API Error:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('✅ Customer confirmation sent successfully!');
    console.log('Twilio Message SID:', data.sid);

    return true;
  } catch (error) {
    console.error('❌ Error sending customer confirmation:', error);
    return false;
  }
}

/**
 * Send SMS notification (fallback)
 */
export async function sendOrderNotificationSMS(
  phoneNumber: string,
  message: string,
  isToAdmin: boolean = false
): Promise<boolean> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.error('❌ Twilio credentials are not configured');
    return false;
  }

  try {
    const targetNumber = isToAdmin ? TWILIO_WHATSAPP_TO : phoneNumber;

    console.log(`📤 Sending SMS to ${targetNumber}...`);

    // REAL API CALL to Twilio
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: '+14155238886', // Twilio default SMS number
        To: targetNumber,
        Body: message,
      }).toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Twilio SMS Error:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('✅ SMS sent successfully!');
    console.log('Twilio Message SID:', data.sid);

    return true;
  } catch (error) {
    console.error('❌ Error sending SMS:', error);
    return false;
  }
}

/**
 * Check if Twilio is configured
 */
export function isTwilioConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_WHATSAPP_FROM && TWILIO_WHATSAPP_TO);
}

/**
 * Get Twilio configuration status
 */
export function getTwilioStatus() {
  return {
    configured: isTwilioConfigured(),
    hasAccountSid: !!TWILIO_ACCOUNT_SID,
    hasAuthToken: !!TWILIO_AUTH_TOKEN,
    hasWhatsAppFrom: !!TWILIO_WHATSAPP_FROM,
    hasWhatsAppTo: !!TWILIO_WHATSAPP_TO,
    targetNumber: TWILIO_WHATSAPP_TO || 'NOT SET',
  };
}
