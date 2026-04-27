/**
 * Product Service - Handles all product-related operations with Supabase
 * Uses new static_products and customizable_products tables
 */

import { supabase } from '@/lib/supabase';
import type { Product } from '@/types';

export interface StaticProduct {
  id: string;
  name: string;
  slug: string;
  category: 'projects' | 'babysmile' | 'donations';
  subcategory: string;
  price: number;
  discount_price?: number;
  description: string;
  detailed_description: string;
  image_url?: string;
  availability: boolean;
  rating?: number;
  review_count?: number;
  is_fragile?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomizableProduct {
  id: string;
  name: string;
  slug: string;
  category: 'projects' | 'babysmile' | 'donations';
  subcategory: string;
  base_price: number;
  discount_price?: number;
  description: string;
  detailed_description: string;
  image_url?: string;
  availability: boolean;
  rating?: number;
  review_count?: number;
  is_fragile?: boolean;
  customization_options?: any[];
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all active static products
 */
export async function getStaticProducts(category?: string): Promise<StaticProduct[]> {
  try {
    let query = supabase
      .from('static_products')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching static products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching static products:', error);
    return [];
  }
}

/**
 * Fetch all active customizable products
 */
export async function getCustomizableProducts(category?: string): Promise<CustomizableProduct[]> {
  try {
    let query = supabase
      .from('customizable_products')
      .select('*')
      .eq('is_active', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching customizable products:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching customizable products:', error);
    return [];
  }
}

/**
 * Fetch all active products (both static and customizable)
 */
export async function getProducts(category?: string): Promise<(StaticProduct | CustomizableProduct)[]> {
  try {
    const [staticProducts, customizableProducts] = await Promise.all([
      getStaticProducts(category),
      getCustomizableProducts(category),
    ]);

    // Combine and sort by creation date (newest first)
    return [...staticProducts, ...customizableProducts].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Fetch a single static product by ID
 */
export async function getStaticProductById(productId: string): Promise<StaticProduct | null> {
  try {
    const { data, error } = await supabase
      .from('static_products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching static product:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching static product:', error);
    return null;
  }
}

/**
 * Fetch a single customizable product by ID
 */
export async function getCustomizableProductById(productId: string): Promise<CustomizableProduct | null> {
  try {
    const { data, error } = await supabase
      .from('customizable_products')
      .select('*')
      .eq('id', productId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching customizable product:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching customizable product:', error);
    return null;
  }
}

/**
 * Fetch a product by slug (can be either static or customizable)
 */
export async function getProductBySlug(slug: string): Promise<(StaticProduct | CustomizableProduct) | null> {
  try {
    // Try to fetch from static products first
    const { data: staticData, error: staticError } = await supabase
      .from('static_products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (staticData) {
      return staticData;
    }

    // If not found in static, try customizable products
    const { data: customizableData, error: customizableError } = await supabase
      .from('customizable_products')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();

    if (customizableData) {
      return customizableData;
    }

    if (staticError && customizableError) {
      console.error('Product not found:', { staticError, customizableError });
    }

    return null;
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
}

/**
 * Search products by name or description
 */
export async function searchProducts(query: string): Promise<(StaticProduct | CustomizableProduct)[]> {
  try {
    const searchPattern = `%${query}%`;

    const [staticResults, customizableResults] = await Promise.all([
      supabase
        .from('static_products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`),
      supabase
        .from('customizable_products')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`),
    ]);

    const results = [
      ...(staticResults.data || []),
      ...(customizableResults.data || []),
    ];

    return results;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

/**
 * Get products by category with pagination
 */
export async function getProductsByCategory(
  category: string,
  limit: number = 20,
  offset: number = 0
): Promise<(StaticProduct | CustomizableProduct)[]> {
  try {
    const [staticProducts, customizableProducts] = await Promise.all([
      supabase
        .from('static_products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .range(offset, offset + limit - 1),
      supabase
        .from('customizable_products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .range(offset, offset + limit - 1),
    ]);

    const results = [
      ...(staticProducts.data || []),
      ...(customizableProducts.data || []),
    ];

    return results.slice(0, limit);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

/**
 * Get top-rated products
 */
export async function getTopRatedProducts(limit: number = 10): Promise<(StaticProduct | CustomizableProduct)[]> {
  try {
    const [staticProducts, customizableProducts] = await Promise.all([
      supabase
        .from('static_products')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit),
      supabase
        .from('customizable_products')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false })
        .limit(limit),
    ]);

    const results = [...(staticProducts.data || []), ...(customizableProducts.data || [])].sort(
      (a, b) => (b.rating || 0) - (a.rating || 0)
    );

    return results.slice(0, limit);
  } catch (error) {
    console.error('Error fetching top-rated products:', error);
    return [];
  }
}

/**
 * Get a product by ID (tries both static and customizable)
 * For backward compatibility with ProductDetail pages
 */
export async function getProductById(productId: string): Promise<(StaticProduct | CustomizableProduct) | null> {
  try {
    // Try to fetch from static products first
    const staticProduct = await getStaticProductById(productId);
    if (staticProduct) {
      return staticProduct;
    }

    // If not found, try customizable products
    const customizableProduct = await getCustomizableProductById(productId);
    if (customizableProduct) {
      return customizableProduct;
    }

    console.warn('Product not found by ID:', productId);
    return null;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
}
