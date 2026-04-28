/**
 * PRICING ENGINE - SHM Marketplace
 * 
 * This is the source of truth for all pricing calculations.
 * Frontend NEVER calculates prices - always calls backend endpoint.
 * 
 * Rules:
 * - CUSTOMER: Small order fee (< 100 MAD) + shipping based on city
 * - SCOUT: Always +5% commission + 10 MAD fixed fee
 * - Shipping: Safi = 15 MAD, Others = 40 MAD
 */

export type UserRole = 'customer' | 'scout' | 'manager' | 'admin';

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;  // Unit price from database
  attributes?: Record<string, unknown>;
}

export interface PricingResult {
  subtotal: number;          // Sum of (quantity × price) for all items
  fees: number;              // Small order fee or scout commission
  shipping: number;          // Based on delivery city
  total: number;             // subtotal + fees + shipping
  breakdown: PricingBreakdown;
  currency: 'MAD';
}

export interface PricingBreakdown {
  subtotal: number;
  smallOrderFee?: number;    // If subtotal < 100 for customers
  scoutCommission?: number;  // If scout: subtotal * 0.05
  scoutFixed?: number;       // If scout: always 10 MAD
  shipping: number;
  shippingCity: string;
}

/**
 * Main pricing calculation function
 * 
 * @param items - Cart items with prices
 * @param role - User role (customer/scout/manager/admin)
 * @param deliveryCity - Delivery city (determines shipping)
 * @returns Detailed pricing breakdown
 */
export function calculatePrice(
  items: CartItem[],
  role: UserRole,
  deliveryCity: string
): PricingResult {
  // Calculate subtotal
  let subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  subtotal = Math.round(subtotal * 100) / 100; // 2 decimals

  // Get shipping cost (depends on subtotal)
  const shipping = getShippingCost(deliveryCity, subtotal);

  // Initialize breakdown
  const breakdown: PricingBreakdown = {
    subtotal,
    shipping,
    shippingCity: deliveryCity,
  };

  let fees = 0;

  // ============================================================
  // PRICING RULES BY ROLE
  // ============================================================

  if (role === 'customer' || role === 'manager' || role === 'admin') {
    // CUSTOMER RULES
    if (subtotal < 100) {
      // Small order fee
      fees = 10;
      breakdown.smallOrderFee = 10;
    } else if (subtotal >= 500) {
      // Special rule: >= 500 has commission + fixed fee (like scout)
      // This creates parity between high-value orders
      const commission = Math.round(subtotal * 0.05 * 100) / 100;
      fees = commission + 10;
      breakdown.scoutCommission = commission;
      breakdown.scoutFixed = 10;
    }
    // For 100-499: no fees, just shipping

  } else if (role === 'scout') {
    // SCOUT RULE: Always +5% + 10 MAD
    const commission = Math.round(subtotal * 0.05 * 100) / 100;
    fees = commission + 10;
    breakdown.scoutCommission = commission;
    breakdown.scoutFixed = 10;
  }

  const total = Math.round((subtotal + fees + shipping) * 100) / 100;

  return {
    subtotal,
    fees,
    shipping,
    total,
    breakdown,
    currency: 'MAD',
  };
}

/**
 * Determine shipping cost based on Moroccan city AND subtotal
 *
 * Shipping varies by order amount:
 * - < 100 OR 100-299: Safi=15, Others=40
 * - 300-499: Safi=FREE, Others=5
 * - >= 500: Included in commission calculation (frontend shouldn't call this directly)
 *
 * @param city - Delivery city name
 * @param subtotal - Order subtotal (for bracket determination)
 * @returns Shipping cost in MAD
 */
export function getShippingCost(city: string, subtotal: number): number {
  const cityLower = city.toLowerCase().trim();
  const isSafi = cityLower === 'safi' || cityLower === 'صفاقس';

  // >= 500 has special commission handling (not regular shipping)
  if (subtotal >= 500) {
    return 0; // Shipping is included in commission calculation
  }

  // 300-499 range
  if (subtotal >= 300 && subtotal < 500) {
    return isSafi ? 0 : 5;
  }

  // < 300 (including < 100)
  return isSafi ? 15 : 40;
}

/**
 * Validate pricing result (sanity checks)
 * 
 * @param result - Calculated pricing result
 * @returns true if valid, false otherwise
 */
export function validatePricing(result: PricingResult): boolean {
  // All amounts must be non-negative
  if (result.subtotal < 0 || result.fees < 0 || result.shipping < 0) {
    return false;
  }

  // Total must be sum of components
  const calculatedTotal =
    result.subtotal + result.fees + result.shipping;
  if (Math.abs(result.total - calculatedTotal) > 0.01) {
    return false;
  }

  // Shipping must be valid
  if (result.shipping !== 15 && result.shipping !== 40) {
    return false;
  }

  return true;
}

/**
 * Format price for display
 * 
 * @param amount - Numeric amount
 * @returns Formatted string with currency
 */
export function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} MAD`;
}

// ============================================================
// TEST CASES (Unit Tests)
// ============================================================

export const TEST_CASES = {
  // CUSTOMER - Small order (< 100)
  'CUSTOMER_SMALL_SAFI': {
    items: [{ productId: 'p1', quantity: 1, price: 80 }],
    role: 'customer' as UserRole,
    city: 'Safi',
    expected: {
      subtotal: 80,
      fees: 10,
      shipping: 15,
      total: 105,
    },
  },

  // CUSTOMER - Small order (< 100), other city
  'CUSTOMER_SMALL_MARRAKECH': {
    items: [{ productId: 'p1', quantity: 1, price: 80 }],
    role: 'customer' as UserRole,
    city: 'Marrakech',
    expected: {
      subtotal: 80,
      fees: 10,
      shipping: 40,
      total: 130,
    },
  },

  // CUSTOMER - Medium order (100-299)
  'CUSTOMER_MEDIUM_SAFI': {
    items: [{ productId: 'p1', quantity: 1, price: 150 }],
    role: 'customer' as UserRole,
    city: 'Safi',
    expected: {
      subtotal: 150,
      fees: 0,
      shipping: 15,
      total: 165,
    },
  },

  // CUSTOMER - Medium order (100-299), other city
  'CUSTOMER_MEDIUM_OTHER': {
    items: [{ productId: 'p1', quantity: 2, price: 75 }],
    role: 'customer' as UserRole,
    city: 'Casablanca',
    expected: {
      subtotal: 150,
      fees: 0,
      shipping: 40,
      total: 190,
    },
  },

  // CUSTOMER - Large order (300-499)
  'CUSTOMER_LARGE_SAFI': {
    items: [{ productId: 'p1', quantity: 1, price: 350 }],
    role: 'customer' as UserRole,
    city: 'Safi',
    expected: {
      subtotal: 350,
      fees: 0,
      shipping: 0,  // Free shipping for Safi on large orders (300-499)
      total: 350,
    },
  },

  // CUSTOMER - Large order (300-499), other city
  'CUSTOMER_LARGE_OTHER': {
    items: [{ productId: 'p1', quantity: 1, price: 400 }],
    role: 'customer' as UserRole,
    city: 'Marrakech',
    expected: {
      subtotal: 400,
      fees: 0,
      shipping: 5,  // 5 MAD for large orders (300-499) in other cities
      total: 405,
    },
  },

  // CUSTOMER - Very large order (>= 500): commission + fixed fee applied
  'CUSTOMER_XLARGE': {
    items: [{ productId: 'p1', quantity: 1, price: 500 }],
    role: 'customer' as UserRole,
    city: 'Safi',
    expected: {
      subtotal: 500,
      fees: 35,  // 500 * 0.05 = 25 commission + 10 fixed
      shipping: 0,  // Free shipping for >= 500
      total: 535,
    },
  },

  // CUSTOMER - Very large order (>= 500), other city
  'CUSTOMER_XLARGE_OTHER': {
    items: [{ productId: 'p1', quantity: 1, price: 600 }],
    role: 'customer' as UserRole,
    city: 'Marrakech',
    expected: {
      subtotal: 600,
      fees: 40,  // 600 * 0.05 = 30 commission + 10 fixed
      shipping: 0,  // Free shipping for >= 500
      total: 640,
    },
  },

  // SCOUT - Small order
  'SCOUT_SMALL': {
    items: [{ productId: 'p1', quantity: 1, price: 50 }],
    role: 'scout' as UserRole,
    city: 'Safi',
    expected: {
      subtotal: 50,
      fees: 12.5,  // 50 * 0.05 = 2.5, + 10 fixed
      shipping: 15,
      total: 77.5,
    },
  },

  // SCOUT - Large order
  'SCOUT_LARGE': {
    items: [{ productId: 'p1', quantity: 1, price: 100 }],
    role: 'scout' as UserRole,
    city: 'Marrakech',
    expected: {
      subtotal: 100,
      fees: 15,  // 100 * 0.05 = 5, + 10 fixed
      shipping: 40,
      total: 155,
    },
  },

  // SCOUT - Multiple items
  'SCOUT_MULTI': {
    items: [
      { productId: 'p1', quantity: 2, price: 50 },
      { productId: 'p2', quantity: 1, price: 100 },
    ],
    role: 'scout' as UserRole,
    city: 'Safi',
    expected: {
      subtotal: 200,
      fees: 20,  // 200 * 0.05 = 10, + 10 fixed
      shipping: 15,
      total: 235,
    },
  },

  // MANAGER - Treated as customer
  'MANAGER_NORMAL': {
    items: [{ productId: 'p1', quantity: 1, price: 80 }],
    role: 'manager' as UserRole,
    city: 'Safi',
    expected: {
      subtotal: 80,
      fees: 10,
      shipping: 15,
      total: 105,
    },
  },

  // ADMIN - Treated as customer
  'ADMIN_NORMAL': {
    items: [{ productId: 'p1', quantity: 1, price: 200 }],
    role: 'admin' as UserRole,
    city: 'Casablanca',
    expected: {
      subtotal: 200,
      fees: 0,
      shipping: 40,
      total: 240,
    },
  },
};

/**
 * Run all test cases to verify pricing engine
 */
export function runTests(): { passed: number; failed: number; errors: string[] } {
  const errors: string[] = [];
  let passed = 0;
  let failed = 0;

  Object.entries(TEST_CASES).forEach(([testName, testCase]) => {
    const result = calculatePrice(testCase.items, testCase.role, testCase.city);

    if (
      result.subtotal !== testCase.expected.subtotal ||
      Math.abs(result.fees - testCase.expected.fees) > 0.01 ||
      Math.abs(result.shipping - testCase.expected.shipping) > 0.01 ||
      Math.abs(result.total - testCase.expected.total) > 0.01
    ) {
      failed++;
      errors.push(
        `${testName}: Expected total=${testCase.expected.total}, got=${result.total}`
      );
    } else if (!validatePricing(result)) {
      failed++;
      errors.push(`${testName}: Validation failed`);
    } else {
      passed++;
    }
  });

  return { passed, failed, errors };
}
