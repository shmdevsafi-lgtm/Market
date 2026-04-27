/**
 * Orders Routes
 * Complete CRUD operations for orders
 */

import { RequestHandler } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { capturePayPalOrder } from "./paypal";

// Validation schemas
const OrderItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1, "At least one item is required"),
  total: z.number().positive("Total must be positive"),
  city: z.string().min(1, "City is required"),
  address: z.string().min(1, "Address is required"),
  paymentMethod: z.enum(["paypal", "cash"]),
  paypalOrderId: z.string().optional(),
});

export type CreateOrderData = z.infer<typeof CreateOrderSchema>;

/**
 * POST /api/orders
 * Create a new order (requires auth)
 */
export const createOrder: RequestHandler = async (req: AuthRequest, res) => {
  try {
    console.log("📝 Creating order...");

    const orderData = CreateOrderSchema.parse(req.body);
    const userId = req.userId || null;

    // REAL: Create order in Supabase database
    const { data: createdOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          user_id: userId,
          total_price: orderData.total,
          status: "pending",
          city: orderData.city,
          address: orderData.address,
          payment_method: orderData.paymentMethod,
          paypal_order_id: orderData.paypalOrderId || null,
        },
      ])
      .select("id")
      .single();

    if (orderError || !createdOrder) {
      console.error("❌ Database error creating order:", orderError);
      return res.status(500).json({
        success: false,
        error: "Failed to create order in database",
        details: orderError?.message,
      });
    }

    const orderId = createdOrder.id;
    console.log("✅ Order created:", orderId);

    // REAL: Create order items in Supabase
    const orderItems = orderData.items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("❌ Error creating order items:", itemsError);
      return res.status(500).json({
        success: false,
        error: "Failed to create order items",
        details: itemsError.message,
      });
    }

    console.log("✅ Order items created");

    // If PayPal order ID provided, capture the payment
    if (orderData.paypalOrderId) {
      console.log("💳 Capturing PayPal payment...");
      const captureResult = await capturePayPalOrder(orderData.paypalOrderId);

      if (!captureResult.success) {
        console.error("❌ PayPal capture failed:", captureResult.error);
        // Update order status to failed
        await supabaseAdmin
          .from("orders")
          .update({ status: "cancelled" })
          .eq("id", orderId);

        return res.status(500).json({
          success: false,
          error: "Payment capture failed",
          details: captureResult.error,
        });
      }

      // Update order status to confirmed
      await supabaseAdmin
        .from("orders")
        .update({ status: "confirmed" })
        .eq("id", orderId);

      console.log("✅ Payment captured and order confirmed");
    }

    // Return success with order ID
    return res.json({
      success: true,
      orderId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Validation error:", error.errors);
      return res.status(400).json({
        success: false,
        error: "Invalid order data",
        details: error.errors,
      });
    }

    console.error("❌ Order creation error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to process order",
      details: String(error),
    });
  }
};

/**
 * GET /api/orders/:id
 * Get a single order by ID (requires auth)
 */
export const getOrderById: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log("📦 Fetching order:", id);

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        user_id,
        total_price,
        city,
        address,
        payment_method,
        paypal_order_id,
        status,
        created_at,
        updated_at,
        order_items(product_id, quantity, price)
      `
      )
      .eq("id", id)
      .single();

    if (error || !order) {
      console.error("❌ Error fetching order:", error);
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check authorization: user can only see their own orders
    if (userId && order.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: "Unauthorized",
      });
    }

    console.log("✅ Order fetched");

    return res.json({
      success: true,
      data: {
        id: order.id,
        userId: order.user_id,
        totalPrice: order.total_price,
        city: order.city,
        address: order.address,
        paymentMethod: order.payment_method,
        paypalOrderId: order.paypal_order_id,
        status: order.status,
        items: order.order_items,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      },
    });
  } catch (error) {
    console.error("❌ Server error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * GET /api/orders
 * Get all orders for current user (requires auth)
 */
export const getUserOrders: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    console.log("📦 Fetching orders for user:", userId);

    const { data: orders, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        user_id,
        total_price,
        city,
        address,
        payment_method,
        paypal_order_id,
        status,
        created_at,
        updated_at
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching orders:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch orders",
      });
    }

    console.log(`✅ Fetched ${orders?.length || 0} orders`);

    return res.json({
      success: true,
      data: orders || [],
    });
  } catch (error) {
    console.error("❌ Server error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
