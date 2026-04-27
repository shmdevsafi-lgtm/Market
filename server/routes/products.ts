/**
 * Products Endpoints
 * RÉEL: Récupère les données des produits depuis Supabase
 */

import { RequestHandler } from "express";
import { supabaseAdmin } from "../lib/supabase";

/**
 * GET /api/products/:id/images
 * Récupère toutes les images d'un produit
 */
export const getProductImages: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("📸 Chargement des images du produit:", id);

    const { data: images, error } = await supabaseAdmin
      .from("product_images")
      .select("*")
      .eq("product_id", id)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("❌ Erreur lors du chargement des images:", error);
      return res.status(500).json({
        success: false,
        error: "Erreur lors du chargement des images",
      });
    }

    console.log(`✅ ${images?.length || 0} images chargées`);

    return res.json({
      success: true,
      data: images || [],
    });
  } catch (error) {
    console.error("❌ Erreur serveur:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
};

/**
 * GET /api/products/:id/reviews
 * Récupère tous les avis d'un produit
 */
export const getProductReviews: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("⭐ Chargement des avis du produit:", id);

    const { data: reviews, error } = await supabaseAdmin
      .from("product_reviews")
      .select("*")
      .eq("product_id", id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Erreur lors du chargement des avis:", error);
      return res.status(500).json({
        success: false,
        error: "Erreur lors du chargement des avis",
      });
    }

    console.log(`✅ ${reviews?.length || 0} avis chargés`);

    // Calculate average rating
    const averageRating =
      reviews && reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length)
        : 0;

    return res.json({
      success: true,
      data: reviews || [],
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews?.length || 0,
    });
  } catch (error) {
    console.error("❌ Erreur serveur:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
};

/**
 * GET /api/products/search
 * Recherche des produits
 */
export const searchProducts: RequestHandler = async (req, res) => {
  try {
    const { q, category, limit = 20, offset = 0 } = req.query;

    console.log("🔍 Recherche de produits:", { q, category });

    let query = supabaseAdmin
      .from("products")
      .select("*")
      .eq("is_active", true);

    if (q) {
      query = query.or(
        `name.ilike.%${q}%,description.ilike.%${q}%,detailed_description.ilike.%${q}%`
      );
    }

    if (category) {
      query = query.eq("category_id", category);
    }

    const { data: products, error } = await query
      .range(Number(offset), Number(offset) + Number(limit) - 1)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Erreur de recherche:", error);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la recherche",
      });
    }

    console.log(`✅ ${products?.length || 0} produits trouvés`);

    return res.json({
      success: true,
      data: products || [],
      count: products?.length || 0,
    });
  } catch (error) {
    console.error("❌ Erreur serveur:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
};

/**
 * GET /api/products/:id/variants
 * Récupère toutes les variantes d'un produit
 */
export const getProductVariants: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🎨 Chargement des variantes du produit:", id);

    const { data: variants, error } = await supabaseAdmin
      .from("product_variants")
      .select("*")
      .eq("product_id", id)
      .eq("is_active", true);

    if (error) {
      console.error("❌ Erreur lors du chargement des variantes:", error);
      return res.status(500).json({
        success: false,
        error: "Erreur lors du chargement des variantes",
      });
    }

    console.log(`✅ ${variants?.length || 0} variantes chargées`);

    return res.json({
      success: true,
      data: variants || [],
    });
  } catch (error) {
    console.error("❌ Erreur serveur:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur serveur",
    });
  }
};
