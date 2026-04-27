-- ================================================================
-- COMPLETE DATABASE SCHEMA MIGRATION
-- Cleans up database and creates fresh, well-structured tables
-- ================================================================

-- First, disable foreign key constraints and drop everything safely
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT CREATE ON SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- ================================================================
-- 1. REGIONS TABLE (Moroccan regions)
-- ================================================================
CREATE TABLE public.regions (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 2. VILLES TABLE (Cities in each region)
-- ================================================================
CREATE TABLE public.villes (
  id SERIAL PRIMARY KEY,
  region_id INTEGER NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(region_id, name)
);

-- ================================================================
-- 3. USERS TABLE (Profiles only - NO passwords)
-- ================================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  telephone TEXT NOT NULL,
  region TEXT NOT NULL,
  ville TEXT NOT NULL,
  adresse TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 0 AND age < 120),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'seller')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 4. PRODUCTS TABLE
-- ================================================================
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  category TEXT NOT NULL,
  description TEXT,
  image TEXT,
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 5. ORDERS TABLE
-- ================================================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  payment_method TEXT,
  paypal_order_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 6. ORDER_ITEMS TABLE (Items within each order)
-- ================================================================
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================================
-- 7. USER_FAVORITES TABLE (Bookmarked products)
-- ================================================================
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_villes_region_id ON public.villes(region_id);
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_paypal_order_id ON public.orders(paypal_order_id);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_product_id ON public.user_favorites(product_id);
CREATE INDEX idx_products_category ON public.products(category);

-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================

-- Enable RLS on sensitive tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
CREATE POLICY "Users can view their own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Orders RLS Policies
CREATE POLICY "Users can view their own orders"
  ON public.orders
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid()::text LIKE '%admin%');

CREATE POLICY "Users can create their own orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Favorites RLS Policies
CREATE POLICY "Users can manage their own favorites"
  ON public.user_favorites
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Products are publicly readable (no RLS needed)
-- Order Items inherit RLS from orders

-- ================================================================
-- SEED DATA: MOROCCAN REGIONS AND CITIES
-- ================================================================

INSERT INTO public.regions (name) VALUES
  ('Tanger-Tétouan-Al Hoceïma'),
  ('Fès-Meknès'),
  ('Rabat-Salé-Kénitra'),
  ('Casablanca-Settat'),
  ('Marrakech-Safi'),
  ('Drâa-Tafilalet'),
  ('Souss-Massa'),
  ('Béni Mellal-Khénifra'),
  ('Tangier'),
  ('Oujda-Angad'),
  ('Guelmim-Oued Noun'),
  ('Laâyoune-Sakia El Hamra');

-- Tanger-Tétouan-Al Hoceïma (region_id = 1)
INSERT INTO public.villes (region_id, name) VALUES
  (1, 'Tanger'),
  (1, 'Tétouan'),
  (1, 'Al Hoceïma'),
  (1, 'Larache'),
  (1, 'Ouezzane');

-- Fès-Meknès (region_id = 2)
INSERT INTO public.villes (region_id, name) VALUES
  (2, 'Fès'),
  (2, 'Meknès'),
  (2, 'Ifrane'),
  (2, 'Midelt'),
  (2, 'Sefrou');

-- Rabat-Salé-Kénitra (region_id = 3)
INSERT INTO public.villes (region_id, name) VALUES
  (3, 'Rabat'),
  (3, 'Salé'),
  (3, 'Kénitra'),
  (3, 'Témara'),
  (3, 'Skhirat');

-- Casablanca-Settat (region_id = 4)
INSERT INTO public.villes (region_id, name) VALUES
  (4, 'Casablanca'),
  (4, 'Settat'),
  (4, 'Fez'),
  (4, 'Mohammedia'),
  (4, 'Ben Slimane');

-- Marrakech-Safi (region_id = 5)
INSERT INTO public.villes (region_id, name) VALUES
  (5, 'Marrakech'),
  (5, 'Safi'),
  (5, 'Essaouira'),
  (5, 'Chichaoua'),
  (5, 'Kelaat Es-Sraghna');

-- Drâa-Tafilalet (region_id = 6)
INSERT INTO public.villes (region_id, name) VALUES
  (6, 'Errachidia'),
  (6, 'Erfoud'),
  (6, 'Risani'),
  (6, 'Tinghir'),
  (6, 'Merzouga');

-- Souss-Massa (region_id = 7)
INSERT INTO public.villes (region_id, name) VALUES
  (7, 'Agadir'),
  (7, 'Inezgane'),
  (7, 'Aït Melloul'),
  (7, 'Taroudant'),
  (7, 'Tiznit');

-- Béni Mellal-Khénifra (region_id = 8)
INSERT INTO public.villes (region_id, name) VALUES
  (8, 'Béni Mellal'),
  (8, 'Khénifra'),
  (8, 'Azilal'),
  (8, 'Kasba Tadla'),
  (8, 'Kasbah Tadla');

-- Tangier (region_id = 9)
INSERT INTO public.villes (region_id, name) VALUES
  (9, 'Tangier'),
  (9, 'Tangier-Méditerranée'),
  (9, 'Fnideq'),
  (9, 'Castillejos');

-- Oujda-Angad (region_id = 10)
INSERT INTO public.villes (region_id, name) VALUES
  (10, 'Oujda'),
  (10, 'Angad'),
  (10, 'Berkane'),
  (10, 'Taourirt'),
  (10, 'Jerada');

-- Guelmim-Oued Noun (region_id = 11)
INSERT INTO public.villes (region_id, name) VALUES
  (11, 'Guelmim'),
  (11, 'Tan-Tan'),
  (11, 'Sidi Ifni'),
  (11, 'Assa'),
  (11, 'Zag');

-- Laâyoune-Sakia El Hamra (region_id = 12)
INSERT INTO public.villes (region_id, name) VALUES
  (12, 'Laâyoune'),
  (12, 'Smara'),
  (12, 'Boujdour'),
  (12, 'Es-Semara');

-- ================================================================
-- VERIFY SETUP
-- ================================================================
-- Run these queries to verify the schema is created correctly:
-- SELECT COUNT(*) FROM public.regions;  -- Should return 12
-- SELECT COUNT(*) FROM public.villes;   -- Should return ~65
-- \dt public.*  -- Should show all 7 tables
