import "dotenv/config";
import express from "express";
import cors from "cors";
import { authenticate, requireAuth } from "./middleware/auth";
import { handleDemo } from "./routes/demo";
import { handleOrder } from "./routes/order";
import { handlePayPalOrder, verifyPayPalOrder, diagnosePayPal } from "./routes/paypal";
import { handleDonation } from "./routes/donation";
import {
  getProductImages,
  getProductReviews,
  searchProducts,
  getProductVariants,
} from "./routes/products";
import { handleRegister, handleLogin, handleLogout } from "./routes/auth";
import { getRegions, getVillesByRegion } from "./routes/regions";
import { getAllProducts, getProductById } from "./routes/get-products";
import { getCurrentUser, updateCurrentUser, getUserById } from "./routes/users";
import { getFavorites, addFavorite, removeFavorite } from "./routes/favorites";
import { createOrder, getOrderById, getUserOrders } from "./routes/orders";

export function createServer() {
  const app = express();

  // Middleware
  app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "https://76bf0f6a3e83486c91000ccc0a90f600-polar-continent-cqxvmtbu.builderio.xyz",
        "https://shm-marketplace.vercel.app",
      ],
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(authenticate); // Apply auth middleware globally

  // ==================== HEALTH CHECK ====================
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // ==================== AUTHENTICATION ====================
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/logout", handleLogout);

  // ==================== REGIONS & LOCATIONS ====================
  app.get("/api/regions", getRegions); // Get all Moroccan regions
  app.get("/api/regions/:regionId/villes", getVillesByRegion); // Get cities for a region

  // ==================== PRODUCTS ====================
  app.get("/api/products", getAllProducts); // Get all products (optionally filtered by category)
  app.get("/api/products/:id", getProductById); // Get single product
  // Legacy product routes
  app.get("/api/products/search", searchProducts);
  app.get("/api/products/:id/images", getProductImages);
  app.get("/api/products/:id/reviews", getProductReviews);
  app.get("/api/products/:id/variants", getProductVariants);

  // ==================== USERS ====================
  app.get("/api/users/me", requireAuth, getCurrentUser); // Get current user profile
  app.put("/api/users/me", requireAuth, updateCurrentUser); // Update current user
  app.get("/api/users/:id", getUserById); // Get user by ID (public)

  // ==================== FAVORITES ====================
  app.get("/api/favorites", requireAuth, getFavorites); // Get user favorites
  app.post("/api/favorites", requireAuth, addFavorite); // Add to favorites
  app.delete("/api/favorites/:productId", requireAuth, removeFavorite); // Remove from favorites

  // ==================== ORDERS ====================
  app.post("/api/orders", createOrder); // Create order (optionally authenticated)
  app.get("/api/orders/:id", getOrderById); // Get single order
  app.get("/api/orders", requireAuth, getUserOrders); // Get user's orders
  // Legacy route
  app.post("/api/order", handleOrder);

  // ==================== PAYPAL ====================
  app.get("/api/paypal/diagnose", diagnosePayPal); // Diagnose PayPal configuration
  app.post("/api/paypal/order", handlePayPalOrder); // Create PayPal order
  app.post("/api/paypal/verify", verifyPayPalOrder); // Verify PayPal order

  // ==================== DONATIONS ====================
  app.post("/api/donation", handleDonation);

  return app;
}
