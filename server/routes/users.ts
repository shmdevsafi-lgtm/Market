/**
 * User Routes
 * Handles user profile operations
 */

import { RequestHandler } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../lib/supabase";
import { AuthRequest } from "../middleware/auth";

// Validation schema for user updates
const UpdateUserSchema = z.object({
  nom: z.string().optional(),
  prenom: z.string().optional(),
  telephone: z.string().optional(),
  ville: z.string().optional(),
});

/**
 * GET /api/users/me
 * Get current user profile (requires authentication)
 */
export const getCurrentUser: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    console.log("👤 Fetching user profile:", userId);

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("❌ Error fetching user:", error);
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    console.log("✅ User profile fetched");

    return res.json({
      success: true,
      user: data,
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
 * PUT /api/users/me
 * Update current user profile (requires authentication)
 */
export const updateCurrentUser: RequestHandler = async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
    }

    console.log("📝 Updating user profile:", userId);

    const data = UpdateUserSchema.parse(req.body);

    // Build update object with only provided fields
    const updateData: Record<string, any> = {};
    if (data.nom !== undefined) updateData.nom = data.nom;
    if (data.prenom !== undefined) updateData.prenom = data.prenom;
    if (data.telephone !== undefined) updateData.telephone = data.telephone;
    if (data.ville !== undefined) updateData.ville = data.ville;

    const { data: updatedUser, error } = await supabaseAdmin
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      console.error("❌ Error updating user:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update user",
      });
    }

    console.log("✅ User profile updated");

    return res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Invalid update data",
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
 * GET /api/users/:id
 * Get user profile by ID (public, limited info)
 */
export const getUserById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("👤 Fetching user by ID:", id);

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, nom, prenom, ville")
      .eq("id", id)
      .single();

    if (error) {
      console.error("❌ Error fetching user:", error);
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    console.log("✅ User fetched");

    return res.json({
      success: true,
      user: data,
    });
  } catch (error) {
    console.error("❌ Server error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
