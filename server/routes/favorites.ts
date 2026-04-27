/**
 * Favorites Routes
 * Handle user favorite products
 */

import { RequestHandler } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase";
import { AuthRequest, requireAuth } from "../middleware/auth";

const AddFavoriteSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

const RemoveFavoriteSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

/**
 * GET /api/favorites
 * Get user's favorite products (requires auth)
 */
export const getFavorites: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    console.log("❤️  Fetching favorites for user:", userId);

    const { data, error } = await supabaseAdmin
      .from("user_favorites")
      .select("product_id")
      .eq("user_id", userId);

    if (error) {
      console.error("❌ Error fetching favorites:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch favorites",
      });
    }

    const favoriteIds = data?.map((fav) => fav.product_id) || [];
    console.log(`✅ Fetched ${favoriteIds.length} favorites`);

    return res.json({
      success: true,
      data: favoriteIds,
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
 * POST /api/favorites
 * Add product to favorites (requires auth)
 */
export const addFavorite: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    console.log("❤️  Adding favorite for user:", userId);

    const { productId } = AddFavoriteSchema.parse(req.body);

    // Check if product exists
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("id", productId)
      .single();

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Add to favorites (will fail silently if already exists due to UNIQUE constraint)
    const { error } = await supabaseAdmin.from("user_favorites").insert([
      {
        user_id: userId,
        product_id: productId,
      },
    ]);

    if (error && !error.message.includes("duplicate")) {
      console.error("❌ Error adding favorite:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to add favorite",
      });
    }

    console.log("✅ Favorite added");

    return res.json({
      success: true,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid request data",
        details: error.errors,
      });
    }

    console.error("❌ Server error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * DELETE /api/favorites/:productId
 * Remove product from favorites (requires auth)
 */
export const removeFavorite: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const { productId } = req.params;
    console.log("💔 Removing favorite for user:", userId);

    const { error } = await supabaseAdmin
      .from("user_favorites")
      .delete()
      .eq("user_id", userId)
      .eq("product_id", productId);

    if (error) {
      console.error("❌ Error removing favorite:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to remove favorite",
      });
    }

    console.log("✅ Favorite removed");

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error("❌ Server error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
