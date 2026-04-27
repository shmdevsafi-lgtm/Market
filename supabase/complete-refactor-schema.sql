-- ============================================================================
-- COMPLETE SHM MARKETPLACE SCHEMA - UNIFIED & PRODUCTION-READY
-- Execute once in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. USERS & PROFILES (Extended Supabase Auth)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'normal' CHECK (role IN ('normal', 'scout', 'admin')),
  nom text,
  prenom text,
  telephone text,
  region text,
  ville text,
  adresse text,
  age integer CHECK (age >= 0 AND age <= 150),
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 2. PRODUCTS (Unified single source of truth)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL CHECK (category IN ('shm', 'scout', 'medical', 'projects', 'packs')),
  subcategory text,
  description text,
  detailed_description text,
  base_price numeric(10, 2) NOT NULL CHECK (base_price > 0),
  discount_price numeric(10, 2),
  image_url text,
  is_customizable boolean DEFAULT false,
  customization_options jsonb DEFAULT 'null'::jsonb,
  stock integer DEFAULT 0,
  rating numeric(2, 1),
  review_count integer DEFAULT 0,
  is_fragile boolean DEFAULT false,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON public.products(created_by);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone views active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Scouts create products" ON public.products FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'scout')
);
CREATE POLICY "Scouts update own products" ON public.products FOR UPDATE USING (
  created_by = auth.uid() AND (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  ) = 'scout'
);

-- ============================================================================
-- 3. PRODUCT IMAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  display_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone views images" ON public.product_images FOR SELECT USING (true);

-- ============================================================================
-- 4. PRODUCT VARIANTS (Sizes, colors, types)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type text NOT NULL,
  value text NOT NULL,
  price_modifier numeric(10, 2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone views variants" ON public.product_variants FOR SELECT USING (true);

-- ============================================================================
-- 5. REVIEWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_verified_purchase boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone views active reviews" ON public.reviews FOR SELECT USING (is_active = true);
CREATE POLICY "Users create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 6. FAVORITES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_product_id ON public.user_favorites(product_id);

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own favorites" ON public.user_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users add to favorites" ON public.user_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users remove from favorites" ON public.user_favorites FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 7. ORDERS (Unified order schema)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  subtotal numeric(10, 2) NOT NULL DEFAULT 0,
  small_order_fee numeric(10, 2) DEFAULT 0,
  shipping_fee numeric(10, 2) DEFAULT 0,
  scout_bonus numeric(10, 2) DEFAULT 0,
  total numeric(10, 2) NOT NULL,
  role_at_order text,
  city text,
  address text,
  customer_name text,
  customer_email text,
  customer_phone text,
  paypal_order_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  payment_method text DEFAULT 'paypal',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================================
-- 8. ORDER ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  product_name text NOT NULL,
  variant_id uuid,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(10, 2) NOT NULL,
  total_price numeric(10, 2) NOT NULL,
  custom_image_url text,
  custom_notes text,
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);

-- ============================================================================
-- 9. DONATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  amount numeric(10, 2) NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'MAD',
  donor_name text,
  donor_email text,
  donation_type text,
  paypal_order_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON public.donations(created_at);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can insert donations" ON public.donations FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 10. GEOGRAPHIC DATA
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  region_id uuid NOT NULL REFERENCES public.regions(id) ON DELETE CASCADE,
  shipping_cost numeric(10, 2) DEFAULT 40,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(name, region_id)
);

CREATE INDEX IF NOT EXISTS idx_cities_region_id ON public.cities(region_id);

ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone views regions" ON public.regions FOR SELECT USING (true);
CREATE POLICY "Everyone views cities" ON public.cities FOR SELECT USING (true);

-- ============================================================================
-- TRIGGERS - Auto update updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA - Moroccan Regions & Cities (Safi special case)
-- ============================================================================

INSERT INTO public.regions (name, slug) VALUES
  ('Casablanca-Settat', 'casablanca-settat'),
  ('Fès-Meknès', 'fes-meknes'),
  ('Marrakech-Safi', 'marrakech-safi'),
  ('Rabat-Salé-Kénitra', 'rabat-sale-kenitra'),
  ('Tanger-Tétouan-Al Hoceïma', 'tanger-tetouan-al-hoceima'),
  ('Drâa-Tafilalet', 'draa-tafilalet'),
  ('Souss-Massa', 'souss-massa'),
  ('Béni Mellal-Khénifra', 'beni-mellal-khenifra')
ON CONFLICT DO NOTHING;

-- Safi (special case: 15 MAD)
INSERT INTO public.cities (name, region_id, shipping_cost)
SELECT 'Safi', id, 15
FROM public.regions WHERE slug = 'marrakech-safi'
ON CONFLICT DO NOTHING;

-- Other major cities (40 MAD default)
INSERT INTO public.cities (name, region_id, shipping_cost)
SELECT city, region_id, 40 FROM (
  VALUES
    ('Casablanca', 'casablanca-settat'),
    ('Fès', 'fes-meknes'),
    ('Marrakech', 'marrakech-safi'),
    ('Rabat', 'rabat-sale-kenitra'),
    ('Tanger', 'tanger-tetouan-al-hoceima'),
    ('Meknès', 'fes-meknes')
) AS t(city, slug)
JOIN public.regions r ON r.slug = t.slug
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SCHEMA COMPLETE
-- ============================================================================
