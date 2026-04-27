-- ============================================================================
-- MIGRATION: PRODUITS STATIQUES ET PERSONNALISABLES
-- Tables Supabase pour stocker les produits
-- ============================================================================

-- ============================================================================
-- TABLE: static_products
-- Produits avec configuration fixe (exemples: Ateliers de Poterie)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.static_products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL DEFAULT 'projects' CHECK (category IN ('projects', 'babysmile', 'donations')),
  subcategory text NOT NULL,
  price decimal(10, 2) NOT NULL CHECK (price > 0),
  discount_price decimal(10, 2),
  description text,
  detailed_description text,
  image_url text,
  gallery_urls text[] DEFAULT ARRAY[]::text[],
  availability boolean DEFAULT true,
  rating decimal(2, 1),
  review_count integer DEFAULT 0,
  is_fragile boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Indexes for static_products
CREATE INDEX IF NOT EXISTS idx_static_products_slug ON public.static_products(slug);
CREATE INDEX IF NOT EXISTS idx_static_products_category ON public.static_products(category);
CREATE INDEX IF NOT EXISTS idx_static_products_is_active ON public.static_products(is_active);
CREATE INDEX IF NOT EXISTS idx_static_products_created_at ON public.static_products(created_at);

-- RLS for static_products
ALTER TABLE public.static_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active static products" ON public.static_products FOR SELECT USING (is_active = true);

-- ============================================================================
-- TABLE: customizable_products
-- Produits personnalisables (exemples: Services d'Impression)
-- Permet de stocker les options de customisation
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.customizable_products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL DEFAULT 'projects' CHECK (category IN ('projects', 'babysmile', 'donations')),
  subcategory text NOT NULL,
  base_price decimal(10, 2) NOT NULL CHECK (base_price > 0),
  discount_price decimal(10, 2),
  description text,
  detailed_description text,
  image_url text,
  gallery_urls text[] DEFAULT ARRAY[]::text[],
  availability boolean DEFAULT true,
  rating decimal(2, 1),
  review_count integer DEFAULT 0,
  is_fragile boolean DEFAULT false,
  customization_options jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Indexes for customizable_products
CREATE INDEX IF NOT EXISTS idx_customizable_products_slug ON public.customizable_products(slug);
CREATE INDEX IF NOT EXISTS idx_customizable_products_category ON public.customizable_products(category);
CREATE INDEX IF NOT EXISTS idx_customizable_products_is_active ON public.customizable_products(is_active);
CREATE INDEX IF NOT EXISTS idx_customizable_products_created_at ON public.customizable_products(created_at);

-- RLS for customizable_products
ALTER TABLE public.customizable_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view active customizable products" ON public.customizable_products FOR SELECT USING (is_active = true);

-- ============================================================================
-- TRIGGER: Update updated_at for static_products
-- ============================================================================
CREATE OR REPLACE FUNCTION update_static_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS static_products_updated_at_trigger ON public.static_products;
CREATE TRIGGER static_products_updated_at_trigger
BEFORE UPDATE ON public.static_products
FOR EACH ROW
EXECUTE FUNCTION update_static_products_updated_at();

-- ============================================================================
-- TRIGGER: Update updated_at for customizable_products
-- ============================================================================
CREATE OR REPLACE FUNCTION update_customizable_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS customizable_products_updated_at_trigger ON public.customizable_products;
CREATE TRIGGER customizable_products_updated_at_trigger
BEFORE UPDATE ON public.customizable_products
FOR EACH ROW
EXECUTE FUNCTION update_customizable_products_updated_at();

-- ============================================================================
-- INSERT INITIAL DATA: STATIC PRODUCTS
-- ============================================================================
INSERT INTO public.static_products (
  name, slug, category, subcategory, price, description, 
  detailed_description, image_url, availability, rating, review_count
) VALUES
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
  22
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- INSERT INITIAL DATA: CUSTOMIZABLE PRODUCTS
-- ============================================================================
INSERT INTO public.customizable_products (
  name, slug, category, subcategory, base_price, description, 
  detailed_description, image_url, availability, rating, review_count,
  customization_options
) VALUES
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
  '[
    {
      "name": "format",
      "label": "Format",
      "type": "select",
      "options": ["A4", "A5", "A3", "Personnalisé"]
    },
    {
      "name": "quantity",
      "label": "Quantité",
      "type": "number",
      "min": 1,
      "max": 1000
    },
    {
      "name": "finish",
      "label": "Finition",
      "type": "select",
      "options": ["Mat", "Brillant", "Satiné"]
    }
  ]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- CREATE FUNCTION: Get all active static products
-- ============================================================================
CREATE OR REPLACE FUNCTION get_static_products(
  p_category text DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  category text,
  price decimal,
  discount_price decimal,
  image_url text,
  rating decimal,
  review_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.id,
    sp.name,
    sp.slug,
    sp.category,
    sp.price,
    sp.discount_price,
    sp.image_url,
    sp.rating,
    sp.review_count
  FROM public.static_products sp
  WHERE sp.is_active = true
  AND (p_category IS NULL OR sp.category = p_category)
  ORDER BY sp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE FUNCTION: Get all active customizable products
-- ============================================================================
CREATE OR REPLACE FUNCTION get_customizable_products(
  p_category text DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  category text,
  base_price decimal,
  discount_price decimal,
  image_url text,
  rating decimal,
  review_count integer,
  customization_options jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    cp.id,
    cp.name,
    cp.slug,
    cp.category,
    cp.base_price,
    cp.discount_price,
    cp.image_url,
    cp.rating,
    cp.review_count,
    cp.customization_options
  FROM public.customizable_products cp
  WHERE cp.is_active = true
  AND (p_category IS NULL OR cp.category = p_category)
  ORDER BY cp.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CREATE FUNCTION: Get all products (combined view)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_all_products(
  p_category text DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  category text,
  price decimal,
  image_url text,
  rating decimal,
  review_count integer,
  product_type text
) AS $$
BEGIN
  RETURN QUERY
  (
    SELECT
      sp.id,
      sp.name,
      sp.slug,
      sp.category,
      sp.price,
      sp.image_url,
      sp.rating,
      sp.review_count,
      'static'::text as product_type
    FROM public.static_products sp
    WHERE sp.is_active = true
    AND (p_category IS NULL OR sp.category = p_category)
  )
  UNION ALL
  (
    SELECT
      cp.id,
      cp.name,
      cp.slug,
      cp.category,
      cp.base_price,
      cp.image_url,
      cp.rating,
      cp.review_count,
      'customizable'::text as product_type
    FROM public.customizable_products cp
    WHERE cp.is_active = true
    AND (p_category IS NULL OR cp.category = p_category)
  )
  ORDER BY category, name
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
