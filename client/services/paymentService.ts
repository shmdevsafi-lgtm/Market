/**
 * Payment Service - Handles PayPal payment integration
 */

import type { Order, Donation } from '@/types';

/**
 * PayPal API Configuration
 */
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const PAYPAL_API_BASE = 'https://api.paypal.com/v2';

/**
 * Create a PayPal order for a transaction
 * This calls the backend to generate a PayPal order
 */
export async function createPayPalOrder(amount: number, description: string): Promise<string | null> {
  try {
    const response = await fetch('/api/paypal/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        description,
      }),
    });

    if (!response.ok) {
      console.error('Error creating PayPal order:', response.statusText);
      return null;
    }

    const data = await response.json();
    return data.paypalOrderId || null;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return null;
  }
}

/**
 * Generate a PayPal payment link for checkout
 * To be used with PayPal Smart Buttons
 */
export function generatePayPalCheckoutLink(
  amount: number,
  currency: string = 'MAD'
): string {
  if (!PAYPAL_CLIENT_ID) {
    console.warn('PayPal Client ID not configured');
    return '';
  }

  const params = new URLSearchParams({
    client_id: PAYPAL_CLIENT_ID,
    amount: amount.toFixed(2),
    currency,
  });

  return `https://www.paypal.com/checkoutnow?token=${params}`;
}

/**
 * Verify a PayPal payment
 * This should be called after PayPal approval
 */
export async function verifyPayPalPayment(paypalOrderId: string): Promise<boolean> {
  try {
    // Verify with backend
    const response = await fetch('/api/paypal/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paypalOrderId }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error verifying PayPal payment:', error);
    return false;
  }
}

/**
 * Calculate total price for cart
 */
export function calculateCartTotal(items: any[]): number {
  return items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);
}

/**
 * Format price for PayPal (2 decimal places)
 */
export function formatPriceForPayPal(price: number): string {
  return price.toFixed(2);
}

/**
 * Generate a unique order reference
 */
export function generateOrderReference(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

/**
 * Create a PayPal donation link
 */
export function createDonationPayPalLink(donation: Partial<Donation>): string {
  if (!PAYPAL_CLIENT_ID) {
    console.warn('PayPal Client ID not configured');
    return '';
  }

  const amount = donation.amount || 0;
  const description = `Donation - ${donation.donationType || 'General'}`;

  return `https://www.paypal.com/donate?businessID=${PAYPAL_CLIENT_ID}&amount=${amount}&item_name=${encodeURIComponent(
    description
  )}&currency_code=MAD`;
}

/**
 * PayPal Smart Button Configuration
 */
export const PAYPAL_BUTTON_CONFIG = {
  style: {
    layout: 'vertical' as const,
    color: 'blue' as const,
    shape: 'rect' as const,
    label: 'paypal' as const,
    height: 45,
  },
  funding: {
    disallowed: [] as string[],
  },
};

/**
 * Get PayPal environment
 */
export function getPayPalEnvironment(): 'sandbox' | 'production' {
  const clientId = PAYPAL_CLIENT_ID || '';
  // Sandbox IDs typically start with "Ac", production IDs are longer
  return clientId.length > 80 ? 'production' : 'sandbox';
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'MAD'): string {
  return new Intl.NumberFormat('ar-MA', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Check if PayPal is configured
 */
export function isPayPalConfigured(): boolean {
  return !!PAYPAL_CLIENT_ID;
}
