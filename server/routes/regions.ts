/**
 * Regions & Villes Routes
 * Provides data for location selection (Moroccan regions and cities)
 */

import { RequestHandler } from "express";
import { supabaseAdmin } from "../lib/supabase";

/**
 * Get all Moroccan regions
 * GET /api/regions
 *
 * Response:
 *   {
 *     success: boolean,
 *     regions?: Array<{ id: number, name: string }>,
 *     error?: string
 *   }
 */
export const getRegions: RequestHandler = async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("regions")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("❌ Error fetching regions:", error);
      return res.status(500).json({
        success: false,
        error: "Impossible de récupérer les régions",
      });
    }

    return res.json({
      success: true,
      regions: data || [],
    });
  } catch (error) {
    console.error("❌ Regions error:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des régions",
    });
  }
};

/**
 * Get villes (cities) for a specific region
 * GET /api/regions/:regionId/villes
 *
 * Params:
 *   - regionId: number (region ID)
 *
 * Response:
 *   {
 *     success: boolean,
 *     villes?: Array<{ id: number, name: string, region_id: number }>,
 *     error?: string
 *   }
 */
export const getVillesByRegion: RequestHandler = async (req, res) => {
  try {
    const { regionId } = req.params;

    // Validate regionId is a number
    const id = parseInt(regionId, 10);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "ID de région invalide",
      });
    }

    const { data, error } = await supabaseAdmin
      .from("villes")
      .select("id, name, region_id")
      .eq("region_id", id)
      .order("name", { ascending: true });

    if (error) {
      console.error("❌ Error fetching villes:", error);
      return res.status(500).json({
        success: false,
        error: "Impossible de récupérer les villes",
      });
    }

    return res.json({
      success: true,
      villes: data || [],
    });
  } catch (error) {
    console.error("❌ Villes error:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de la récupération des villes",
    });
  }
};
