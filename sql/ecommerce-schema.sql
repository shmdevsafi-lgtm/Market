-- ============================================================
-- E-COMMERCE DATABASE SCHEMA FOR SUPABASE
-- ============================================================
-- This script creates the complete database structure for the
-- SHM Marketplace e-commerce platform.
--
-- IMPORTANT: Run this AFTER Supabase Auth is configured
-- Supabase will automatically create an 'auth.users' table
-- ============================================================

-- ============================================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT NOT NULL UNIQUE,
  nom TEXT,
  prenom TEXT,
  telephone TEXT,
  ville TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Authenticated users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 2. PRODUCTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL CHECK (base_price > 0),
  image_url TEXT,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index for category
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Anyone can view active products"
  ON public.products FOR SELECT
  USING (is_active = true);

-- ============================================================
-- 3. VARIANTS TABLE (Sizes)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  dimensions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, size)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_variants_product_id ON public.variants(product_id);

-- Enable RLS
ALTER TABLE public.variants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for variants
CREATE POLICY "Anyone can view variants of active products"
  ON public.variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = variants.product_id AND products.is_active = true
    )
  );

-- ============================================================
-- 4. PATTERNS TABLE (Colors/Motifs)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  primary_color TEXT NOT NULL,
  secondary_color TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for patterns
CREATE POLICY "Anyone can view patterns"
  ON public.patterns FOR SELECT
  USING (true);

-- ============================================================
-- 5. ORDERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  total DECIMAL(10, 2) NOT NULL CHECK (total > 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  paypal_order_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_paypal_order_id ON public.orders(paypal_order_id);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Authenticated users can create orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================
-- 6. ORDER_ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  variant_id UUID REFERENCES public.variants(id),
  pattern_id UUID REFERENCES public.patterns(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_items
CREATE POLICY "Users can view items in own orders"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND (auth.uid() = orders.user_id OR orders.user_id IS NULL)
    )
  );

-- ============================================================
-- 7. USER_FAVORITES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_product_id ON public.user_favorites(product_id);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_favorites
CREATE POLICY "Users can manage own favorites"
  ON public.user_favorites FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- 8. DONATIONS TABLE (for tracking donations)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  donation_type TEXT NOT NULL,
  paypal_order_id TEXT,
  status TEXT DEFAULT 'completed',
  donor_email TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at);
CREATE INDEX IF NOT EXISTS idx_donations_donation_type ON public.donations(donation_type);

-- Enable RLS
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for donations
CREATE POLICY "Anyone can create donations"
  ON public.donations FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- 9. TRIGGER FUNCTIONS FOR TIMESTAMPS
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for timestamp updates
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_variants_updated_at
  BEFORE UPDATE ON public.variants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patterns_updated_at
  BEFORE UPDATE ON public.patterns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 10. SAMPLE DATA (Optional)
-- ============================================================

-- Insert sample patterns
INSERT INTO public.patterns (name, primary_color, secondary_color) VALUES
  ('Rouge SHM', '#8b0000', '#ffffff'),
  ('Bleu Scout', '#000080', '#ffffff'),
  ('Vert Naturel', '#228B22', '#ffffff'),
  ('Blanc Pur', '#ffffff', '#000000'),
  ('Noir Classique', '#000000', '#ffffff')
ON CONFLICT (name) DO NOTHING;

-- Insert sample products
INSERT INTO public.products (name, description, base_price, image_url, category) VALUES
  ('Uniforme SHM Complet', 'Uniforme officiel SHM avec tous les accessoires', 299.99, 'https://via.placeholder.com/400x400?text=Uniforme+SHM', 'shm'),
  ('Tente Scout 2 Personnes', 'Tente légère et durable pour camping', 249.99, 'https://via.placeholder.com/400x400?text=Tente+Scout', 'scout'),
  ('Sac à Dos 60L', 'Sac à dos ergonomique avec hydratation', 189.99, 'https://via.placeholder.com/400x400?text=Sac+a+Dos', 'scout'),
  ('Kit Medical Complet', 'Kit médical d''urgence avec essentiels', 79.99, 'https://via.placeholder.com/400x400?text=Kit+Medical', 'medical')
ON CONFLICT DO NOTHING;

-- Insert sample variants (sizes)
INSERT INTO public.variants (product_id, size, price) VALUES
  ((SELECT id FROM public.products WHERE name = 'Uniforme SHM Complet' LIMIT 1), 'XS', 299.99),
  ((SELECT id FROM public.products WHERE name = 'Uniforme SHM Complet' LIMIT 1), 'S', 299.99),
  ((SELECT id FROM public.products WHERE name = 'Uniforme SHM Complet' LIMIT 1), 'M', 299.99),
  ((SELECT id FROM public.products WHERE name = 'Uniforme SHM Complet' LIMIT 1), 'L', 299.99),
  ((SELECT id FROM public.products WHERE name = 'Sac à Dos 60L' LIMIT 1), 'Unique', 189.99)
ON CONFLICT (product_id, size) DO NOTHING;

-- ============================================================
-- IMPORTANT NOTES
-- ============================================================
-- 1. This schema assumes Supabase Auth is already configured
-- 2. The 'users' table extends auth.users
-- 3. All tables have RLS enabled with appropriate policies
-- 4. Indexes are created for common queries
-- 5. Triggers automatically update 'updated_at' timestamps
-- 6. Foreign keys use ON DELETE CASCADE where appropriate
-- ============================================================
