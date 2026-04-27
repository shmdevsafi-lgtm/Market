-- ============================================================================
-- SIMPLE PRODUCTS SCHEMA - Prêt pour Supabase SQL Editor
-- Exécute ceci d'abord pour créer les tables manquantes
-- ============================================================================

-- ============================================================================
-- STATIC PRODUCTS (Produits avec configuration fixe)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.static_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL,
  subcategory text,
  price numeric(10, 2) NOT NULL CHECK (price > 0),
  discount_price numeric(10, 2),
  description text,
  detailed_description text,
  image_url text,
  gallery_urls text[] DEFAULT ARRAY[]::text[],
  availability boolean DEFAULT true,
  rating numeric(2, 1),
  review_count integer DEFAULT 0,
  is_fragile boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_static_products_slug ON public.static_products(slug);
CREATE INDEX IF NOT EXISTS idx_static_products_category ON public.static_products(category);
CREATE INDEX IF NOT EXISTS idx_static_products_is_active ON public.static_products(is_active);

ALTER TABLE public.static_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active static products" ON public.static_products FOR SELECT USING (is_active = true);

-- ============================================================================
-- CUSTOMIZABLE PRODUCTS (Produits personnalisables)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.customizable_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL,
  subcategory text,
  base_price numeric(10, 2) NOT NULL CHECK (base_price > 0),
  discount_price numeric(10, 2),
  description text,
  detailed_description text,
  image_url text,
  gallery_urls text[] DEFAULT ARRAY[]::text[],
  availability boolean DEFAULT true,
  rating numeric(2, 1),
  review_count integer DEFAULT 0,
  is_fragile boolean DEFAULT false,
  customization_options jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_customizable_products_slug ON public.customizable_products(slug);
CREATE INDEX IF NOT EXISTS idx_customizable_products_category ON public.customizable_products(category);
CREATE INDEX IF NOT EXISTS idx_customizable_products_is_active ON public.customizable_products(is_active);

ALTER TABLE public.customizable_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active customizable products" ON public.customizable_products FOR SELECT USING (is_active = true);

-- ============================================================================
-- INSERT INITIAL PRODUCTS FOR TESTING
-- ============================================================================

-- Insert Static Products
INSERT INTO public.static_products (name, slug, category, subcategory, price, description, detailed_description, image_url, availability, rating, review_count, is_active)
VALUES
  (
    'Ateliers de Poterie',
    'ateliers-poterie',
    'projects',
    'pottery',
    49.99,
    'Cours de poterie et céramique',
    'Ateliers créatifs de poterie pour tous les niveaux. Apprenez les techniques traditionnelles de céramique.',
    'https://images.unsplash.com/photo-1565193566173-7ceb3ee3c82b?w=800&h=800&fit=crop',
    true,
    4.6,
    22,
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- Insert Customizable Products
INSERT INTO public.customizable_products (name, slug, category, subcategory, base_price, description, detailed_description, image_url, availability, rating, review_count, is_active)
VALUES
  (
    'Services d''Impression Personnalisée',
    'impression-personnalisee',
    'projects',
    'printing',
    0.99,
    'Impression de documents personnalisés',
    'Services d''impression professionnels pour tous vos besoins de personnalisation. Flyers, affiches, cartes de visite, etc.',
    'https://images.unsplash.com/photo-1633356713697-85b57294b26a?w=800&h=800&fit=crop',
    true,
    4.4,
    16,
    true
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
