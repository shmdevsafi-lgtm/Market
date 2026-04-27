/**
 * Authentication Middleware
 * Verifies JWT tokens from Authorization header
 */

import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../lib/supabase";

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

/**
 * Middleware to verify JWT token
 * Expects: Authorization: Bearer <token>
 */
export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      // Token not required, continue
      return next();
    }

    console.log("🔐 Verifying JWT token...");

    // Verify token with Supabase
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      console.error("❌ Token verification failed:", error);
      return next();
    }

    // Attach user ID to request
    req.userId = user.id;
    req.user = user;
    console.log("✅ Token verified for user:", user.id);

    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    next();
  }
};

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 */
export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
    });
    return;
  }

  next();
};
