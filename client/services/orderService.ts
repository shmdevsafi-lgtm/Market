/**
 * Order Service - Handles all order-related operations with Supabase
 */

import { supabase } from '@/lib/supabase';
import type { Order, OrderItem } from '@/types';

/**
 * Create a new order with items
 */
export async function createOrder(order: Order): Promise<{ id: string | null; error: Error | null }> {
  try {
    const { data: createdOrder, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          user_id: order.userId || null,
          total: order.total,
          status: order.status || 'pending',
          customer_name: order.customerName,
          customer_email: order.customerEmail,
          customer_phone: order.customerPhone,
          customer_address: order.customerAddress,
          paypal_order_id: order.paypalOrderId || null,
        },
      ])
      .select('id')
      .single();

    if (orderError || !createdOrder) {
      console.error('Error creating order:', orderError);
      return { id: null, error: orderError as Error };
    }

    // Create order items
    const orderItems = order.items.map((item) => ({
      order_id: createdOrder.id,
      product_id: item.productId,
      variant_id: item.variantId || null,
      pattern_id: item.patternId || null,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      return { id: createdOrder.id, error: itemsError as Error };
    }

    return { id: createdOrder.id, error: null };
  } catch (error) {
    console.error('Error creating order:', error);
    return { id: null, error: error as Error };
  }
}

/**
 * Get orders for a specific user
 */
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }

    return orders || [];
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
}

/**
 * Get a single order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', orderId)
      .single();

    if (error || !order) {
      console.error('Error fetching order:', error);
      return null;
    }

    return order as Order;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: Order['status']
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error as Error };
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, error: error as Error };
  }
}

/**
 * Find order by PayPal order ID
 */
export async function getOrderByPayPalId(paypalOrderId: string): Promise<Order | null> {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('paypal_order_id', paypalOrderId)
      .single();

    if (error || !order) {
      console.error('Error fetching order by PayPal ID:', error);
      return null;
    }

    return order as Order;
  } catch (error) {
    console.error('Error fetching order by PayPal ID:', error);
    return null;
  }
}

/**
 * Get recent orders (admin view)
 */
export async function getRecentOrders(limit: number = 10): Promise<Order[]> {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent orders:', error);
      return [];
    }

    return orders || [];
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return [];
  }
}
