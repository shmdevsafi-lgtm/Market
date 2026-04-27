/**
 * Shared types between client and server
 * All API request/response types defined here
 */

// ==================== DEMO ====================
export interface DemoResponse {
  message: string;
}

// ==================== AUTHENTICATION ====================
export interface RegisterRequest {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone?: string;
  ville?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
  };
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    nom: string;
    prenom: string;
  };
  error?: string;
}

// ==================== PRODUCTS ====================
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  image?: string;
  stock?: number;
}

export interface GetProductsResponse {
  success: boolean;
  data?: Product[];
  error?: string;
}

export interface GetProductResponse {
  success: boolean;
  data?: Product;
  error?: string;
}

// ==================== ORDERS ====================
export interface OrderProduct {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  items: OrderProduct[];
  total: number;
  city: string;
  address: string;
  paymentMethod: 'paypal' | 'cash';
  paypalOrderId?: string;
}

export interface Order {
  id: string;
  userId?: string;
  totalPrice: number;
  city: string;
  address: string;
  paymentMethod: string;
  paypalOrderId?: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  items?: OrderProduct[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId?: string;
  order?: Order;
  error?: string;
}

export interface GetOrderResponse {
  success: boolean;
  data?: Order;
  error?: string;
}

export interface GetOrdersResponse {
  success: boolean;
  data?: Order[];
  error?: string;
}

// ==================== PAYPAL ====================
export interface CreatePayPalOrderRequest {
  amount: number;
  currency: string;
  description: string;
}

export interface CreatePayPalOrderResponse {
  success: boolean;
  paypalOrderId?: string;
  approvalUrl?: string;
  error?: string;
}

export interface CapturePayPalOrderRequest {
  paypalOrderId: string;
}

export interface CapturePayPalOrderResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export interface VerifyPayPalOrderResponse {
  success: boolean;
  status?: string;
  amount?: number;
  currency?: string;
  error?: string;
}

// ==================== USERS ====================
export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone?: string;
  ville?: string;
  role: 'normal' | 'scout' | 'admin';
  createdAt?: string;
}

export interface UpdateUserRequest {
  nom?: string;
  prenom?: string;
  telephone?: string;
  ville?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// ==================== FAVORITES ====================
export interface AddFavoriteRequest {
  productId: string;
}

export interface RemoveFavoriteRequest {
  productId: string;
}

export interface FavoriteResponse {
  success: boolean;
  error?: string;
}

export interface GetFavoritesResponse {
  success: boolean;
  data?: string[];
  error?: string;
}
