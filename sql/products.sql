-- ============================================================================
-- SCRIPT 3: PRODUITS
-- Gestion des produits, catégories, sous-catégories et variantes
-- Compatible Supabase PostgreSQL
-- ============================================================================

-- ============================================================================
-- TABLE: categories
-- Catégories principales (SHM, Scout, Médical, Projets, Packs)
-- ============================================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes sur categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON categories(display_order);


-- ============================================================================
-- TABLE: subcategories
-- Sous-catégories (Uniforme, Accessoires, Équipement, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category_id, slug)
);

-- Indexes sur subcategories
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_is_active ON subcategories(is_active);
CREATE INDEX IF NOT EXISTS idx_subcategories_display_order ON subcategories(display_order);


-- ============================================================================
-- TABLE: products
-- Produits principaux
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  detailed_description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  discount_price DECIMAL(10, 2),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  image_url TEXT,
  gallery_urls TEXT[],
  is_fragile BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes sur products
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory_id ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);


-- ============================================================================
-- TABLE: product_variants
-- Variantes de produits (tailles, couleurs, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size TEXT,
  color TEXT,
  sku TEXT UNIQUE,
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, size, color)
);

-- Indexes sur product_variants
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON product_variants(stock);
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active ON product_variants(is_active);


-- ============================================================================
-- TABLE: product_images
-- Gestion avancée des images produit
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes sur product_images
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_is_primary ON product_images(is_primary);


-- ============================================================================
-- TABLE: product_tags
-- Tags pour filtrage avancé et recherche
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes sur product_tags
CREATE INDEX IF NOT EXISTS idx_product_tags_slug ON product_tags(slug);


-- ============================================================================
-- TABLE: product_tag_mappings
-- Relation many-to-many entre produits et tags
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_tag_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES product_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, tag_id)
);

-- Indexes sur product_tag_mappings
CREATE INDEX IF NOT EXISTS idx_product_tag_mappings_product_id ON product_tag_mappings(product_id);
CREATE INDEX IF NOT EXISTS idx_product_tag_mappings_tag_id ON product_tag_mappings(tag_id);


-- ============================================================================
-- TABLE: product_reviews
-- Avis clients sur les produits
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes sur product_reviews
CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_rating ON product_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_product_reviews_is_active ON product_reviews(is_active);


-- ============================================================================
-- TRIGGERS et FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction pour mettre à jour le updated_at des categories
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur categories
DROP TRIGGER IF EXISTS categories_updated_at_trigger ON categories;
CREATE TRIGGER categories_updated_at_trigger
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_categories_updated_at();


-- Fonction pour mettre à jour le updated_at des subcategories
CREATE OR REPLACE FUNCTION update_subcategories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur subcategories
DROP TRIGGER IF EXISTS subcategories_updated_at_trigger ON subcategories;
CREATE TRIGGER subcategories_updated_at_trigger
BEFORE UPDATE ON subcategories
FOR EACH ROW
EXECUTE FUNCTION update_subcategories_updated_at();


-- Fonction pour mettre à jour le updated_at des products
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur products
DROP TRIGGER IF EXISTS products_updated_at_trigger ON products;
CREATE TRIGGER products_updated_at_trigger
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_products_updated_at();


-- Fonction pour mettre à jour le updated_at des product_variants
CREATE OR REPLACE FUNCTION update_product_variants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur product_variants
DROP TRIGGER IF EXISTS product_variants_updated_at_trigger ON product_variants;
CREATE TRIGGER product_variants_updated_at_trigger
BEFORE UPDATE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION update_product_variants_updated_at();


-- Fonction pour mettre à jour le updated_at des product_reviews
CREATE OR REPLACE FUNCTION update_product_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur product_reviews
DROP TRIGGER IF EXISTS product_reviews_updated_at_trigger ON product_reviews;
CREATE TRIGGER product_reviews_updated_at_trigger
BEFORE UPDATE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_reviews_updated_at();


-- ============================================================================
-- FONCTIONS UTILES POUR L'APPLICATION
-- ============================================================================

-- Fonction pour obtenir le prix effectif d'un produit (avec remise)
CREATE OR REPLACE FUNCTION get_product_price(p_product_id UUID)
RETURNS TABLE(
  price DECIMAL,
  discount_price DECIMAL,
  final_price DECIMAL,
  discount_percent NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.price,
    p.discount_price,
    COALESCE(p.discount_price, p.price) as final_price,
    CASE
      WHEN p.discount_price IS NOT NULL
      THEN ROUND(((p.price - p.discount_price) / p.price * 100)::NUMERIC, 2)
      ELSE 0
    END as discount_percent
  FROM products p
  WHERE p.id = p_product_id;
END;
$$ LANGUAGE plpgsql;


-- Fonction pour rechercher des produits par texte
CREATE OR REPLACE FUNCTION search_products(p_search_text TEXT, p_category_id UUID DEFAULT NULL)
RETURNS TABLE(
  id UUID,
  name TEXT,
  price DECIMAL,
  discount_price DECIMAL,
  image_url TEXT,
  category_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.price,
    p.discount_price,
    p.image_url,
    p.category_id
  FROM products p
  WHERE p.is_active = TRUE
  AND (
    p.name ILIKE '%' || p_search_text || '%'
    OR p.description ILIKE '%' || p_search_text || '%'
  )
  AND (p_category_id IS NULL OR p.category_id = p_category_id)
  ORDER BY p.name ASC;
END;
$$ LANGUAGE plpgsql;


-- Fonction pour obtenir les produits par catégorie avec pagination
CREATE OR REPLACE FUNCTION get_products_by_category(
  p_category_id UUID,
  p_limit INTEGER DEFAULT 20,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  price DECIMAL,
  discount_price DECIMAL,
  image_url TEXT,
  total_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.price,
    p.discount_price,
    p.image_url,
    COUNT(*)::INTEGER OVER () as total_count
  FROM products p
  WHERE p.category_id = p_category_id
  AND p.is_active = TRUE
  ORDER BY p.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;


-- Fonction pour obtenir les produits tendances (les plus vus)
CREATE OR REPLACE FUNCTION get_trending_products(p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  name TEXT,
  price DECIMAL,
  discount_price DECIMAL,
  image_url TEXT,
  views INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.price,
    p.discount_price,
    p.image_url,
    COALESCE(ps.views, 0)::INTEGER
  FROM products p
  LEFT JOIN product_stats ps ON p.id = ps.product_id
  WHERE p.is_active = TRUE
  ORDER BY COALESCE(ps.views, 0) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;


-- Fonction pour obtenir la moyenne des notes d'un produit
CREATE OR REPLACE FUNCTION get_product_rating(p_product_id UUID)
RETURNS TABLE(
  average_rating NUMERIC,
  review_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(pr.rating)::NUMERIC, 2) as average_rating,
    COUNT(pr.id)::INTEGER as review_count
  FROM product_reviews pr
  WHERE pr.product_id = p_product_id
  AND pr.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;


-- Fonction pour vérifier la disponibilité du stock d'une variante
CREATE OR REPLACE FUNCTION check_variant_stock(p_variant_id UUID, p_quantity INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  v_stock INTEGER;
BEGIN
  SELECT stock INTO v_stock FROM product_variants WHERE id = p_variant_id;
  RETURN COALESCE(v_stock >= p_quantity, FALSE);
END;
$$ LANGUAGE plpgsql;


-- Fonction pour obtenir les produits avec les meilleures remises
CREATE OR REPLACE FUNCTION get_discounted_products(p_limit INTEGER DEFAULT 10)
RETURNS TABLE(
  id UUID,
  name TEXT,
  price DECIMAL,
  discount_price DECIMAL,
  discount_percent NUMERIC,
  image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.price,
    p.discount_price,
    ROUND(((p.price - p.discount_price) / p.price * 100)::NUMERIC, 2) as discount_percent,
    p.image_url
  FROM products p
  WHERE p.is_active = TRUE
  AND p.discount_price IS NOT NULL
  AND p.discount_price < p.price
  ORDER BY ((p.price - p.discount_price) / p.price) DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- VUE: Produits avec infos complètes
-- ============================================================================
CREATE OR REPLACE VIEW products_with_stats AS
SELECT
  p.id,
  p.name,
  p.slug,
  p.price,
  p.discount_price,
  p.image_url,
  c.name as category_name,
  sc.name as subcategory_name,
  COALESCE(ps.views, 0) as views,
  COALESCE(ps.purchases, 0) as purchases,
  COALESCE(pr_stats.average_rating, 0) as average_rating,
  COALESCE(pr_stats.review_count, 0) as review_count,
  p.is_active
FROM products p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
LEFT JOIN product_stats ps ON p.id = ps.product_id
LEFT JOIN LATERAL (
  SELECT
    ROUND(AVG(rating)::NUMERIC, 2) as average_rating,
    COUNT(id)::INTEGER as review_count
  FROM product_reviews
  WHERE product_id = p.id AND is_active = TRUE
) pr_stats ON TRUE;


-- ============================================================================
-- FIN DU SCRIPT 3 - PRODUITS
-- ============================================================================
