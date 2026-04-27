/**
 * Products Routes
 * Fetch products from Supabase (static and customizable products)
 */

import { RequestHandler } from "express";
import { supabaseAdmin } from "../lib/supabase";

/**
 * GET /api/products
 * Get all products (both static and customizable), optionally filtered by category
 */
export const getAllProducts: RequestHandler = async (req, res) => {
  try {
    const { category } = req.query;
    
    console.log("📦 Fetching products...", { category });

    // Build queries for both table types
    let staticQuery = supabaseAdmin
      .from("static_products")
      .select("*")
      .eq("is_active", true);

    let customizableQuery = supabaseAdmin
      .from("customizable_products")
      .select("*")
      .eq("is_active", true);

    // Filter by category if provided
    if (category && typeof category === "string") {
      staticQuery = staticQuery.eq("category", category);
      customizableQuery = customizableQuery.eq("category", category);
    }

    const [staticResult, customizableResult] = await Promise.all([
      staticQuery,
      customizableQuery,
    ]);

    if (staticResult.error && customizableResult.error) {
      console.error("❌ Error fetching products:", {
        static: staticResult.error,
        customizable: customizableResult.error,
      });
      return res.status(500).json({
        success: false,
        error: "Failed to fetch products",
      });
    }

    const allProducts = [
      ...(staticResult.data || []),
      ...(customizableResult.data || []),
    ]
      // Sort by creation date (newest first)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    console.log(`✅ Fetched ${allProducts.length} products`);

    return res.json({
      success: true,
      data: allProducts,
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
 * GET /api/products/:id
 * Get a single product by ID (from either static or customizable)
 */
export const getProductById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log("📦 Fetching product:", id);

    // Try to fetch from static products first
    const staticResult = await supabaseAdmin
      .from("static_products")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (staticResult.data) {
      console.log("✅ Static product fetched");
      return res.json({
        success: true,
        data: staticResult.data,
        type: "static",
      });
    }

    // If not found in static, try customizable products
    const customizableResult = await supabaseAdmin
      .from("customizable_products")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (customizableResult.data) {
      console.log("✅ Customizable product fetched");
      return res.json({
        success: true,
        data: customizableResult.data,
        type: "customizable",
      });
    }

    // Product not found in either table
    console.error("❌ Product not found:", id);
    return res.status(404).json({
      success: false,
      error: "Product not found",
    });
  } catch (error) {
    console.error("❌ Server error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
