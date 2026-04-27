/**
 * Order-related TypeScript types for the e-commerce platform
 */

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  productName?: string;
  variantId?: string;
  variantSize?: string;
  patternId?: string;
  patternName?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id?: string;
  userId?: string;
  items: OrderItem[];
  total: number;
  status?: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  paypalOrderId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderFormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerCity?: string;
  customerPostalCode?: string;
}

export interface OrderResponse {
  success: boolean;
  orderId?: string;
  message: string;
}

export interface Donation {
  id?: string;
  userId?: string;
  amount: number;
  donationType: string;
  paypalOrderId?: string;
  status?: 'pending' | 'completed' | 'failed';
  donorEmail: string;
  createdAt?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
