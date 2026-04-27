/**
 * Order Creation Endpoint
 * REAL IMPLEMENTATION: Creates orders in Supabase database, sends real notifications
 */

import { RequestHandler } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase";
import { capturePayPalOrder } from "./paypal";

// Order item schema
const OrderItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  variantId: z.string().optional(),
  variantSize: z.string().optional(),
  patternId: z.string().optional(),
  patternName: z.string().optional(),
  quantity: z.number().int().positive(),
  price: z.number().positive(),
});

// Validation schema for order creation
const CreateOrderSchema = z.object({
  userId: z.string().optional(),
  items: z.array(OrderItemSchema).min(1, "At least one item is required"),
  total: z.number().positive("Total must be positive"),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Invalid email"),
  customerPhone: z.string().min(1, "Phone is required"),
  customerAddress: z.string().min(1, "Address is required"),
  customerCity: z.string().optional(),
  customerPostalCode: z.string().optional(),
  paypalOrderId: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateOrderData = z.infer<typeof CreateOrderSchema>;

/**
 * Create a new order
 * CRITICAL: REAL database insertion into Supabase
 */
export const handleOrder: RequestHandler = async (req, res) => {
  try {
    console.log("📝 Processing order creation...");
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    // Validate request body
    const orderData = CreateOrderSchema.parse(req.body);

    console.log("✅ Order data validation passed");

    // REAL: Create order in Supabase database
    const { data: createdOrder, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          user_id: orderData.userId || null,
          total: orderData.total,
          status: "pending",
          customer_name: orderData.customerName,
          customer_email: orderData.customerEmail,
          customer_phone: orderData.customerPhone,
          customer_address: orderData.customerAddress,
          customer_city: orderData.customerCity || null,
          customer_postal_code: orderData.customerPostalCode || null,
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
    console.log("✅ Order created in database:", orderId);
    console.log("Supabase Response:", JSON.stringify(createdOrder, null, 2));

    // VERIFICATION: Verify order exists in database
    const { data: verifyOrder } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (!verifyOrder) {
      console.error("❌ CRITICAL: Order not found in verification query!");
      return res.status(500).json({
        success: false,
        error: "Order created but verification failed",
      });
    }

    console.log("✅ Order verified in database");

    // REAL: Create order items in Supabase
    const orderItems = orderData.items.map((item) => ({
      order_id: orderId,
      product_id: item.productId,
      variant_id: item.variantId || null,
      pattern_id: item.patternId || null,
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

    console.log("✅ Order items created in database");

    // REAL: If PayPal order ID provided, capture the payment
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

      console.log("✅ PayPal payment captured and order confirmed");
    }

    // REAL: Send WhatsApp notification to admin
    await sendAdminNotification(orderId, orderData);

    // REAL: Send confirmation to customer
    await sendCustomerNotification(orderId, orderData);

    // Return success with order ID
    return res.json({
      success: true,
      message: "Order created successfully",
      orderId,
      orderData: createdOrder,
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
 * Send WhatsApp notification to admin
 */
async function sendAdminNotification(orderId: string, orderData: CreateOrderData) {
  try {
    const TWILIO_ACCOUNT_SID = process.env.VITE_TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.VITE_TWILIO_AUTH_TOKEN;
    const TWILIO_FROM = process.env.VITE_TWILIO_WHATSAPP_FROM;
    const ADMIN_WHATSAPP = process.env.VITE_TWILIO_WHATSAPP_TO;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      console.warn("⚠️  Twilio not configured, skipping notification");
      return;
    }

    const itemsSummary = orderData.items
      .map((item) => `- ${item.productName} (Qty: ${item.quantity}) - ${item.price}د.م.`)
      .join("\n");

    const message = `
🛍️ *NEW ORDER*
Order ID: ${orderId}
Customer: ${orderData.customerName}
Phone: ${orderData.customerPhone}
Items:
${itemsSummary}
Total: ${orderData.total}د.م.
    `.trim();

    console.log("📤 Sending admin WhatsApp notification...");

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: TWILIO_FROM || "whatsapp:+14155238886",
          To: ADMIN_WHATSAPP || "whatsapp:+212612989463",
          Body: message,
        }).toString(),
      }
    );

    if (response.ok) {
      const data = (await response.json()) as any;
      console.log("✅ Admin notification sent! SID:", data.sid);
    } else {
      console.warn("⚠️  Failed to send admin notification");
    }
  } catch (error) {
    console.error("⚠️  Error sending notification:", error);
    // Don't fail the order if notification fails
  }
}

/**
 * Send confirmation WhatsApp to customer
 */
async function sendCustomerNotification(orderId: string, orderData: CreateOrderData) {
  try {
    const TWILIO_ACCOUNT_SID = process.env.VITE_TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.VITE_TWILIO_AUTH_TOKEN;
    const TWILIO_FROM = process.env.VITE_TWILIO_WHATSAPP_FROM;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      return;
    }

    const message = `
✅ *Order Confirmed!*
Thank you for your order!
Order ID: ${orderId}
Total: ${orderData.total}د.م.
We'll contact you soon.
    `.trim();

    console.log("📤 Sending customer confirmation...");

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: TWILIO_FROM || "whatsapp:+14155238886",
          To: `whatsapp:${orderData.customerPhone}`,
          Body: message,
        }).toString(),
      }
    );

    if (response.ok) {
      console.log("✅ Customer confirmation sent!");
    }
  } catch (error) {
    console.warn("⚠️  Could not send customer notification");
  }
}
