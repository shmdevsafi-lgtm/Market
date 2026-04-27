/**
 * Product-related TypeScript types for the e-commerce platform
 */

export interface Variant {
  id: string;
  productId: string;
  size: string;
  price: number;
  dimensions?: string;
}

export interface Pattern {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor?: string;
}

// New: Product variants with textile customization
export interface ProductVariant {
  id: string;
  product_id: string;
  name: string;
  type: 'tshirt' | 'hoodie' | 'sweater' | 'polo';
  material: 'cotton' | 'silk' | 'crepe' | 'polyester';
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  color: string;
  sku?: string;
  stock: number;
  price_adjustment?: number;
  image_url?: string;
  is_active: boolean;
}

// New: Product images
export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
}

// New: Product reviews
export interface ProductReview {
  id: string;
  product_id: string;
  user_id?: string;
  rating: number; // 1-5
  comment?: string;
  is_verified_purchase: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  detailed_description?: string;
  basePrice: number;
  price: number;
  discount_price?: number;
  imageUrl?: string;
  image_url?: string;
  gallery_urls?: string[];
  category: string;
  isActive?: boolean;
  is_active?: boolean;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface ProductDetail extends Product {
  variants?: Variant[] | ProductVariant[];
  patterns?: Pattern[];
  images?: ProductImage[];
  reviews?: ProductReview[];
}

export interface TextileConfiguration {
  type: 'tshirt' | 'hoodie' | 'sweater' | 'polo';
  material: 'cotton' | 'silk' | 'crepe' | 'polyester';
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
  color: string;
  userImageUrl?: string; // User uploaded image
}

export interface CartItemDetails {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantSize: string;
  patternId: string;
  patternName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  textileConfig?: TextileConfiguration;
  userImageUrl?: string;
}

export interface ProductGridItem {
  id: string;
  name: string;
  basePrice: number;
  imageUrl?: string;
  category: string;
}
