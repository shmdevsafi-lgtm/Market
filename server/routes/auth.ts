/**
 * Authentication Routes
 * Handles user registration and login with Supabase Auth + bcrypt
 * Includes full validation for new user fields (region, ville, adresse, age)
 * Includes rate limiting for login attempts to prevent brute force attacks
 */

import { RequestHandler } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { supabaseAdmin } from "../lib/supabase";
import { RegisterRequest, LoginRequest } from "@shared/api";

// ================================================================
// RATE LIMITING - Login Attempt Tracking
// ================================================================

interface LoginAttempt {
  count: number;
  lastAttempt: number;
  blockedUntil?: number;
}

const loginAttempts = new Map<string, LoginAttempt>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Check if email is locked due to too many failed attempts
 */
function isLoginLocked(email: string): { locked: boolean; minutesRemaining?: number } {
  const attempt = loginAttempts.get(email);
  if (!attempt || !attempt.blockedUntil) {
    return { locked: false };
  }

  const now = Date.now();
  if (now < attempt.blockedUntil) {
    const minutesRemaining = Math.ceil((attempt.blockedUntil - now) / 60000);
    return { locked: true, minutesRemaining };
  }

  // Lockout period has expired, clear the record
  loginAttempts.delete(email);
  return { locked: false };
}

/**
 * Record a failed login attempt
 */
function recordFailedLoginAttempt(email: string): { blocked: boolean; minutesRemaining?: number } {
  const attempt = loginAttempts.get(email) || { count: 0, lastAttempt: Date.now() };

  attempt.count += 1;
  attempt.lastAttempt = Date.now();

  if (attempt.count >= MAX_LOGIN_ATTEMPTS) {
    attempt.blockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    const minutesRemaining = Math.ceil((attempt.blockedUntil - Date.now()) / 60000);
    console.warn(`🔒 User ${email} locked after ${MAX_LOGIN_ATTEMPTS} failed attempts for ${minutesRemaining} minutes`);
    loginAttempts.set(email, attempt);
    return { blocked: true, minutesRemaining };
  }

  loginAttempts.set(email, attempt);
  return { blocked: false };
}

/**
 * Clear login attempts on successful login
 */
function clearLoginAttempts(email: string): void {
  loginAttempts.delete(email);
  console.log(`✅ Cleared login attempts for ${email}`);
}

// ================================================================
// VALIDATION SCHEMAS
// ================================================================

const RegisterSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  telephone: z.string().min(10, "Le téléphone doit contenir au moins 10 chiffres"),
  region: z.string().min(1, "La région est requise"),
  ville: z.string().min(1, "La ville est requise"),
  adresse: z.string().min(1, "L'adresse est requise"),
  age: z
    .number()
    .int()
    .min(12, "Vous devez avoir au moins 12 ans")
    .max(120, "L'âge ne peut pas dépasser 120 ans"),
});

const LoginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

// Type for register request
export type RegisterRequestBody = z.infer<typeof RegisterSchema>;
export type LoginRequestBody = z.infer<typeof LoginSchema>;

// ================================================================
// HELPER FUNCTIONS
// ================================================================

/**
 * Hash password with bcrypt
 */
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify password against hash
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ================================================================
// ROUTE HANDLERS
// ================================================================

/**
 * Register a new user
 * POST /api/auth/register
 *
 * Body:
 *   - email: string (email format)
 *   - password: string (min 8 chars)
 *   - nom: string
 *   - prenom: string
 *   - telephone: string (Moroccan format preferred)
 *   - region: string (Moroccan region name)
 *   - ville: string (City name)
 *   - adresse: string (Street address)
 *   - age: number (must be < 12)
 *
 * Response:
 *   {
 *     success: boolean,
 *     user?: { id, email, nom, prenom },
 *     token?: string,
 *     error?: string
 *   }
 *
 * Rate Limiting:
 *   - Max 5 failed registration attempts
 *   - 30 minute lockout after 5 failures
 */
export const handleRegister: RequestHandler = async (req, res) => {
  try {
    console.log("📝 Processing user registration...");

    // Validate input
    const data = RegisterSchema.parse(req.body);

    // CHECK: Is this email locked due to too many failed attempts?
    const lockStatus = isLoginLocked(data.email);
    if (lockStatus.locked) {
      console.warn(`🔒 Registration attempt for locked account ${data.email}. Blocked for ${lockStatus.minutesRemaining} more minutes`);
      return res.status(429).json({
        success: false,
        error: `Compte temporairement bloqué. Réessayez dans ${lockStatus.minutesRemaining} minute(s)`,
        lockedUntil: lockStatus.minutesRemaining,
      });
    }

    // Check if email already exists in auth
    try {
      const { data: existingAuthUser } = await (supabaseAdmin.auth as any).admin.getUserByEmail(data.email);
      if (existingAuthUser?.user) {
        const failureResult = recordFailedLoginAttempt(data.email);

        if (failureResult.blocked) {
          return res.status(429).json({
            success: false,
            error: `Compte bloqué après ${MAX_LOGIN_ATTEMPTS} tentatives. Réessayez dans 30 minutes`,
            lockedUntil: failureResult.minutesRemaining,
          });
        }

        return res.status(400).json({
          success: false,
          error: "Cet email est déjà utilisé",
        });
      }
    } catch (err) {
      // User doesn't exist, continue with registration
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      console.error("❌ Auth error:", authError);
      const failureResult = recordFailedLoginAttempt(data.email);

      if (failureResult.blocked) {
        return res.status(429).json({
          success: false,
          error: `Compte bloqué après ${MAX_LOGIN_ATTEMPTS} tentatives. Réessayez dans 30 minutes`,
          lockedUntil: failureResult.minutesRemaining,
        });
      }

      return res.status(400).json({
        success: false,
        error: authError?.message || "Impossible de créer l'utilisateur",
      });
    }

    const userId = authData.user.id;
    console.log("✅ User created in Auth:", userId);

    // Create user profile in public.profiles
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert([
        {
          id: userId,
          nom: data.nom,
          prenom: data.prenom,
          telephone: data.telephone,
          region: data.region,
          ville: data.ville,
          adresse: data.adresse,
          age: data.age,
        },
      ]);

    if (profileError) {
      console.error("❌ Profile creation error:", profileError);
      // Clean up auth user if profile creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      const failureResult = recordFailedLoginAttempt(data.email);

      if (failureResult.blocked) {
        return res.status(429).json({
          success: false,
          error: `Compte bloqué après ${MAX_LOGIN_ATTEMPTS} tentatives. Réessayez dans 30 minutes`,
          lockedUntil: failureResult.minutesRemaining,
        });
      }

      return res.status(500).json({
        success: false,
        error: "Impossible de créer le profil utilisateur",
      });
    }

    console.log("✅ User profile created");

    // SUCCESS: Clear failed login attempts
    clearLoginAttempts(data.email);
    console.log("✅ User registered successfully:", userId);

    // Generate JWT token for immediate login
    const { data: sessionData, error: sessionError } = await (supabaseAdmin.auth as any).admin.generateLink({
      type: 'signup',
      email: data.email,
    });

    if (sessionError || !sessionData?.properties?.hashed_token) {
      console.error("⚠️ Error generating link:", sessionError);
      // Return success anyway - user can login normally
      return res.status(201).json({
        success: true,
        user: {
          id: userId,
          email: data.email,
          nom: data.nom,
          prenom: data.prenom,
        },
        message: "Inscription réussie. Vous pouvez maintenant vous connecter.",
      });
    }

    return res.status(201).json({
      success: true,
      user: {
        id: userId,
        email: data.email,
        nom: data.nom,
        prenom: data.prenom,
      },
      token: sessionData?.properties?.hashed_token || undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      // Extract email from request body if available for rate limiting
      const email = req.body?.email;
      if (email) {
        recordFailedLoginAttempt(email);
      }
      return res.status(400).json({
        success: false,
        error: firstError.message || "Données d'enregistrement invalides",
      });
    }

    console.error("❌ Registration error:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de l'enregistrement",
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 *
 * Body:
 *   - email: string
 *   - password: string
 *
 * Response:
 *   {
 *     success: boolean,
 *     user?: { id, email, nom, prenom, region, ville },
 *     token?: string,
 *     error?: string
 *   }
 *
 * Rate Limiting:
 *   - Max 5 failed login attempts
 *   - 30 minute lockout after 5 failures
 */
export const handleLogin: RequestHandler = async (req, res) => {
  try {
    console.log("🔐 Processing user login...");

    const { email, password } = LoginSchema.parse(req.body);

    // CHECK: Is this email locked due to too many failed attempts?
    const lockStatus = isLoginLocked(email);
    if (lockStatus.locked) {
      console.warn(`🔒 Login attempt for locked account ${email}. Blocked for ${lockStatus.minutesRemaining} more minutes`);
      return res.status(429).json({
        success: false,
        error: `Compte temporairement bloqué. Réessayez dans ${lockStatus.minutesRemaining} minute(s)`,
        lockedUntil: lockStatus.minutesRemaining,
      });
    }

    // Authenticate with Supabase Auth
    const { data, error } = await (supabaseAdmin.auth as any).signInWithPassword({
      email,
      password,
    });

    if (error || !data.session || !data.user) {
      console.error("❌ Login error:", error);
      const failureResult = recordFailedLoginAttempt(email);

      if (failureResult.blocked) {
        return res.status(429).json({
          success: false,
          error: `Compte bloqué après ${MAX_LOGIN_ATTEMPTS} tentatives. Réessayez dans 30 minutes`,
          lockedUntil: failureResult.minutesRemaining,
        });
      }

      return res.status(401).json({
        success: false,
        error: "Email ou mot de passe incorrect",
      });
    }

    // Get user profile from profiles table
    const { data: user, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("id, nom, prenom, region, ville, age")
      .eq("id", data.user.id)
      .single();

    // SUCCESS: Clear failed login attempts
    clearLoginAttempts(email);
    console.log("✅ User authenticated:", data.user.id);

    return res.json({
      success: true,
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        region: user.region,
        ville: user.ville,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return res.status(400).json({
        success: false,
        error: firstError.message || "Données de connexion invalides",
      });
    }

    console.error("❌ Login error:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de la connexion",
    });
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 *
 * Response: { success: boolean }
 */
export const handleLogout: RequestHandler = async (req, res) => {
  try {
    // Logout is primarily client-side (clear token)
    // Server can invalidate the session if needed
    return res.json({
      success: true,
      message: "Déconnexion réussie",
    });
  } catch (error) {
    console.error("❌ Logout error:", error);
    return res.status(500).json({
      success: false,
      error: "Erreur lors de la déconnexion",
    });
  }
};
