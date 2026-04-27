/**
 * PayPal Integration Routes
 * REAL IMPLEMENTATION: All calls to PayPal API are REAL, not mocked
 */

import { RequestHandler } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase";

const PAYPAL_CLIENT_ID = process.env.VITE_PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const PAYPAL_MODE = process.env.VITE_PAYPAL_MODE || "sandbox";

console.log("🔧 PayPal Configuration:");
console.log("  Mode:", PAYPAL_MODE);
console.log("  Client ID configured:", !!PAYPAL_CLIENT_ID);
console.log("  Client Secret configured:", !!PAYPAL_CLIENT_SECRET);

// Determine API base URL
const PAYPAL_API_BASE =
  PAYPAL_MODE === "production"
    ? "https://api.paypal.com/v2"
    : "https://api.sandbox.paypal.com/v2";

// Validation schemas
const CreatePayPalOrderSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  currency: z.string().default("MAD"),
});

const CapturePayPalOrderSchema = z.object({
  paypalOrderId: z.string().min(1, "PayPal Order ID is required"),
});

/**
 * Get PayPal access token
 * REAL: Calls PayPal OAuth API
 */
async function getPayPalAccessToken(): Promise<string | null> {
  try {
    console.log("🔑 Requesting PayPal access token...");
    console.log("Client ID:", PAYPAL_CLIENT_ID?.substring(0, 10) + "...");

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      console.error("❌ PayPal credentials missing!");
      console.error("Has CLIENT_ID:", !!PAYPAL_CLIENT_ID);
      console.error("Has CLIENT_SECRET:", !!PAYPAL_CLIENT_SECRET);
      return null;
    }

    const authString = Buffer.from(
      `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`
    ).toString("base64");

    console.log("🔐 Sending auth request to PayPal...");

    // Use a simpler fetch approach
    const tokenUrl = `${PAYPAL_API_BASE.replace("/v2", "")}/oauth2/token`;
    console.log("Token URL:", tokenUrl);

    // For Node.js compatibility, use node-fetch or built-in fetch
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${authString}`,
      },
      body: "grant_type=client_credentials",
    });

    console.log("📡 PayPal response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ PayPal auth error:", response.status, response.statusText);
      console.error("Error body:", errorText);
      return null;
    }

    const data = (await response.json()) as { access_token: string };
    console.log("✅ PayPal access token obtained");
    return data.access_token;
  } catch (error) {
    console.error("❌ Error getting PayPal access token:", error);
    return null;
  }
}

/**
 * Create a PayPal order
 * CRITICAL: REAL API call to PayPal - returns actual orderID
 */
export const handlePayPalOrder: RequestHandler = async (req, res) => {
  try {
    const { amount, description, currency } = CreatePayPalOrderSchema.parse(
      req.body
    );

    console.log(`💳 Creating PayPal order: ${amount} ${currency}`);
    console.log(`Mode: ${PAYPAL_MODE}`);

    // Check if credentials are configured
    if (!PAYPAL_CLIENT_ID) {
      console.error("❌ PAYPAL_CLIENT_ID not configured");
      console.error("Environment variable VITE_PAYPAL_CLIENT_ID is missing");
      return res.status(500).json({
        success: false,
        error: "PayPal Client ID not configured on server",
        details: "Add VITE_PAYPAL_CLIENT_ID to .env file",
      });
    }

    if (!PAYPAL_CLIENT_SECRET) {
      console.error("❌ PAYPAL_CLIENT_SECRET not configured");
      console.error("Environment variable PAYPAL_CLIENT_SECRET is missing");
      return res.status(500).json({
        success: false,
        error: "PayPal Client Secret not configured on server",
        details: "Add PAYPAL_CLIENT_SECRET to .env file",
      });
    }

    console.log("✅ PayPal credentials found");

    // Get access token
    console.log("🔑 Getting PayPal access token...");
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      console.error("❌ Failed to get access token from PayPal");
      return res.status(500).json({
        success: false,
        error: "Failed to authenticate with PayPal",
        details: "Could not get access token. Check credentials and PayPal is accessible.",
      });
    }

    console.log("✅ Access token obtained");

    // REAL API CALL to PayPal - Creates actual order
    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
          description: description || "E-Commerce Purchase",
        },
      ],
    };

    console.log("📤 Sending order to PayPal...");
    console.log("Request URL:", `${PAYPAL_API_BASE}/checkout/orders`);
    console.log("Request payload:", JSON.stringify(orderPayload, null, 2));

    const response = await fetch(`${PAYPAL_API_BASE}/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderPayload),
    });

    console.log("📬 PayPal response status:", response.status, response.statusText);

    // Try to parse response - handle both JSON and text errors
    let data: any;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error("❌ PayPal returned non-JSON response:", text);
      return res.status(500).json({
        success: false,
        error: "PayPal API returned invalid response",
        details: `Expected JSON but got ${contentType}: ${text.substring(0, 200)}`,
      });
    }

    if (!response.ok) {
      console.error("❌ PayPal API error:", JSON.stringify(data, null, 2));
      return res.status(400).json({
        success: false,
        error: data.message || "Failed to create PayPal order",
        details: data.details || data,
      });
    }

    const paypalOrderId = data.id;
    console.log("✅ PayPal order created successfully!");
    console.log("PayPal Order ID:", paypalOrderId);

    // VERIFICATION: Ensure we have a real orderID from PayPal
    if (!paypalOrderId) {
      console.error("❌ CRITICAL: No orderID from PayPal!");
      console.error("Full response:", JSON.stringify(data, null, 2));
      return res.status(500).json({
        success: false,
        error: "No orderID returned from PayPal",
        details: data,
      });
    }

    console.log("✅ Returning order to client");
    return res.json({
      success: true,
      paypalOrderId,
      orderDetails: data,
      approvalUrl: data.links?.find((l: any) => l.rel === "approve")?.href,
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

    console.error("❌ PayPal order error:", error);
    console.error("Error stack:", (error as any)?.stack);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
      details: String(error),
    });
  }
};

/**
 * Capture PayPal order (complete the payment)
 * CRITICAL: REAL API call - confirms the transaction
 */
export async function capturePayPalOrder(
  paypalOrderId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`📦 Capturing PayPal order: ${paypalOrderId}`);

    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      return { success: false, error: "Failed to authenticate with PayPal" };
    }

    // REAL API CALL to PayPal
    const response = await fetch(
      `${PAYPAL_API_BASE}/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = (await response.json()) as any;

    if (!response.ok) {
      console.error("❌ PayPal capture error:", data);
      return {
        success: false,
        error: data.message || "Failed to capture PayPal order",
      };
    }

    console.log("✅ PayPal order captured successfully!");
    console.log("Capture Status:", data.status);
    console.log("Full Response:", JSON.stringify(data, null, 2));

    return { success: true, data };
  } catch (error) {
    console.error("❌ PayPal capture error:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * PayPal Configuration Diagnostic
 * GET /api/paypal/diagnose - Check if PayPal is configured
 */
export const diagnosePayPal: RequestHandler = async (_req, res) => {
  try {
    console.log("🔍 Diagnosing PayPal configuration...");

    const diagnosis: any = {
      mode: PAYPAL_MODE,
      clientIdConfigured: !!PAYPAL_CLIENT_ID,
      clientIdLength: PAYPAL_CLIENT_ID?.length || 0,
      clientSecretConfigured: !!PAYPAL_CLIENT_SECRET,
      clientSecretLength: PAYPAL_CLIENT_SECRET?.length || 0,
      apiBase: PAYPAL_API_BASE,
      timestamp: new Date().toISOString(),
    };

    console.log("Diagnosis result:", diagnosis);

    // Try to get access token to verify credentials
    if (PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET) {
      console.log("Attempting to get access token...");
      const token = await getPayPalAccessToken();
      diagnosis.tokenObtained = !!token;
      if (token) {
        console.log("✅ Successfully obtained access token!");
      } else {
        console.error("❌ Failed to obtain access token");
      }
    }

    return res.json(diagnosis);
  } catch (error) {
    console.error("Error during diagnosis:", error);
    return res.status(500).json({
      error: "Diagnosis failed",
      details: String(error),
    });
  }
};

/**
 * Verify PayPal order
 */
export const verifyPayPalOrder: RequestHandler = async (req, res) => {
  try {
    const { paypalOrderId } = CapturePayPalOrderSchema.parse(req.body);

    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      return res.status(500).json({
        success: false,
        error: "Failed to authenticate with PayPal",
      });
    }

    // REAL API CALL to PayPal
    const response = await fetch(
      `${PAYPAL_API_BASE}/checkout/orders/${paypalOrderId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const data = (await response.json()) as any;

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        error: data.message || "Failed to verify PayPal order",
      });
    }

    console.log("✅ PayPal order verified!");

    return res.json({
      success: true,
      paypalOrderId,
      status: data.status,
      amount: data.purchase_units?.[0]?.amount?.value,
      currency: data.purchase_units?.[0]?.amount?.currency_code,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid request",
        details: error.errors,
      });
    }

    console.error("❌ PayPal verification error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
