import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { FavoritesProvider } from "@/context/FavoritesContext";
import FloatingCartButton from "@/components/FloatingCartButton";

// Pages
import Home from "./pages/Home";

// Projects Pages
import Projects from "./pages/Projects";
import ProjectsPrinting from "./pages/ProjectsPrinting";
import ProjectsPottery from "./pages/ProjectsPottery";

// Catalog Page (Hybrid Static + Dynamic)
import Catalog from "./pages/Catalog";

// Category Pages
import SHMCategory from "./pages/SHMCategory";
import ScoutCampingCategory from "./pages/ScoutCampingCategory";
import MedicalCategory from "./pages/MedicalCategory";
import PacksCategory from "./pages/PacksCategory";

// Order and Cart Pages
import Cart from "./pages/Cart";
import OrderForm from "./pages/OrderForm";

// Product Detail Pages
import ProjectsPrintingPage from "./pages/products/ProjectsPrinting";
import ProjectsPotteryPage from "./pages/products/ProjectsPottery";

// Donation Page
import Donation from "./pages/Donation";

// Auth Pages
import Auth from "./pages/Auth";

// Generic Product Detail Page
import ProductDetail from "./pages/ProductDetail";
import ProductDetailPage from "./pages/ProductDetailPage";

// Information Pages
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Security from "./pages/Security";

// Favorites Page
import Favorites from "./pages/Favorites";

// 404 Page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <FloatingCartButton />
            <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Catalog Route (Hybrid Catalog) */}
          <Route path="/catalog" element={<Catalog />} />

          {/* Category Routes */}
          <Route path="/shm" element={<SHMCategory />} />
          <Route path="/scout-camping" element={<ScoutCampingCategory />} />
          <Route path="/medical" element={<MedicalCategory />} />
          <Route path="/packs" element={<PacksCategory />} />

          {/* Projects Routes */}
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/printing" element={<ProjectsPrinting />} />
          <Route path="/projects/pottery" element={<ProjectsPottery />} />

          {/* Projects Product Pages */}
          <Route path="/products/projects-printing-001" element={<ProjectsPrintingPage />} />
          <Route path="/products/projects-pottery-001" element={<ProjectsPotteryPage />} />

              {/* Auth Routes */}
              <Route path="/auth" element={<Auth />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/register" element={<Auth />} />

              {/* Product Detail Route (Generic - Old) */}
              <Route path="/product/:id" element={<ProductDetail />} />

              {/* Product Detail Route (New - Modern UI) */}
              <Route path="/product-detail/:id" element={<ProductDetailPage />} />

              {/* Information Routes */}
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/security" element={<Security />} />

              {/* Favorites Route */}
              <Route path="/favorites" element={<Favorites />} />

              {/* Cart Route */}
              <Route path="/cart" element={<Cart />} />

              {/* Order Route */}
              <Route path="/order" element={<OrderForm />} />

              {/* Donation Route */}
              <Route path="/donation" element={<Donation />} />

              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
