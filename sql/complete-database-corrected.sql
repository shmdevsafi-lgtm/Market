-- ============================================================================
-- SCRIPT SQL COMPLET CORRIGÉ - SHM MARKETPLACE DATABASE
-- Version: 2.0 (Production Ready)
-- Compatible: Supabase PostgreSQL
-- 
-- CORRECTIONS APPLIQUÉES:
-- ✔ Supabase Auth intégration
-- ✔ FOREIGN KEYS complètes
-- ✔ Système de livraison Maroc
-- ✔ Adresses utilisateur
-- ✔ Panier invité
-- ✔ Historique avancé
-- ✔ Analytics amélioré
-- ============================================================================

-- ============================================================================
-- PARTIE 1: UTILISATEURS (AUTHENTIFICATION + PROFIL)
-- ============================================================================

-- TABLE: users (Profil utilisateur lié à Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telephone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'seller', 'admin')),
  is_scout BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- TABLE: user_addresses (Adresses de livraison)
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  full_address TEXT NOT NULL,
  telephone TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_is_default ON user_addresses(is_default);

-- TABLE: user_sessions
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

-- TABLE: user_history (Historique de navigation)
CREATE TABLE IF NOT EXISTS user_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_history_user_id ON user_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_history_product_id ON user_history(product_id);
CREATE INDEX IF NOT EXISTS idx_user_history_viewed_at ON user_history(viewed_at);

-- TABLE: user_favorites (Favoris)
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_product_id ON user_favorites(product_id);

-- TABLE: cart (Panier - Utilisateur + Invité)
CREATE TABLE IF NOT EXISTS cart (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guest_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_guest_token ON cart(guest_token);

-- TABLE: cart_items (Articles du panier)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- TABLE: orders (Commandes)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_email TEXT,
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  delivery_fee DECIMAL(10, 2) DEFAULT 0 CHECK (delivery_fee >= 0),
  city TEXT NOT NULL,
  full_address TEXT NOT NULL,
  telephone TEXT NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cash',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  is_fragile BOOLEAN DEFAULT FALSE,
  is_scout_member BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- TABLE: order_items (Articles commandés)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- TABLE: order_status_history (Historique des statuts)
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_changed_at ON order_status_history(changed_at);

-- ============================================================================
-- TRIGGERS - UTILISATEURS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at_trigger ON users;
CREATE TRIGGER users_updated_at_trigger
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_users_updated_at();

CREATE OR REPLACE FUNCTION update_user_addresses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_addresses_updated_at_trigger ON user_addresses;
CREATE TRIGGER user_addresses_updated_at_trigger
BEFORE UPDATE ON user_addresses
FOR EACH ROW
EXECUTE FUNCTION update_user_addresses_updated_at();

CREATE OR REPLACE FUNCTION update_cart_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cart_updated_at_trigger ON cart;
CREATE TRIGGER cart_updated_at_trigger
BEFORE UPDATE ON cart
FOR EACH ROW
EXECUTE FUNCTION update_cart_updated_at();

CREATE OR REPLACE FUNCTION update_cart_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS cart_items_updated_at_trigger ON cart_items;
CREATE TRIGGER cart_items_updated_at_trigger
BEFORE UPDATE ON cart_items
FOR EACH ROW
EXECUTE FUNCTION update_cart_items_updated_at();

CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at_trigger ON orders;
CREATE TRIGGER orders_updated_at_trigger
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_orders_updated_at();

-- Trigger pour historique des statuts
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO order_status_history (order_id, status)
    VALUES (NEW.id, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS order_status_history_trigger ON orders;
CREATE TRIGGER order_status_history_trigger
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION log_order_status_change();

-- ============================================================================
-- FONCTIONS - PANIER
-- ============================================================================

CREATE OR REPLACE FUNCTION get_or_create_cart(p_user_id UUID)
RETURNS UUID AS $$
DECLARE
  v_cart_id UUID;
BEGIN
  SELECT id INTO v_cart_id FROM cart WHERE user_id = p_user_id LIMIT 1;
  IF v_cart_id IS NULL THEN
    INSERT INTO cart (user_id) VALUES (p_user_id)
    RETURNING id INTO v_cart_id;
  END IF;
  RETURN v_cart_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_cart_total(p_cart_id UUID)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  v_total DECIMAL(10, 2) := 0;
BEGIN
  SELECT COALESCE(SUM(ci.quantity * p.price), 0)
  INTO v_total
  FROM cart_items ci
  JOIN products p ON ci.product_id = p.id
  WHERE ci.cart_id = p_cart_id;
  RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PARTIE 2: PRODUITS
-- ============================================================================

-- TABLE: categories
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

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

-- TABLE: subcategories
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

CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories(slug);

-- TABLE: products
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

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- TABLE: product_variants
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

CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);

-- TABLE: product_images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- TABLE: product_tags
CREATE TABLE IF NOT EXISTS product_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- TABLE: product_tag_mappings
CREATE TABLE IF NOT EXISTS product_tag_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES product_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(product_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_product_tag_mappings_product_id ON product_tag_mappings(product_id);

-- TABLE: product_reviews
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

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id ON product_reviews(product_id);

-- ============================================================================
-- PART 3: PRODUCT STATS (DÉPLACÉ AVANT FONCTIONS)
-- ============================================================================

-- TABLE: product_stats (Statistiques produits)
CREATE TABLE IF NOT EXISTS product_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  views INTEGER DEFAULT 0 CHECK (views >= 0),
  clicks INTEGER DEFAULT 0 CHECK (clicks >= 0),
  purchases INTEGER DEFAULT 0 CHECK (purchases >= 0),
  favorites INTEGER DEFAULT 0 CHECK (favorites >= 0),
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  last_purchased_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_stats_product_id ON product_stats(product_id);
CREATE INDEX IF NOT EXISTS idx_product_stats_views ON product_stats(views);

-- ============================================================================
-- TRIGGERS - PRODUITS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS categories_updated_at_trigger ON categories;
CREATE TRIGGER categories_updated_at_trigger
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION update_categories_updated_at();

CREATE OR REPLACE FUNCTION update_subcategories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS subcategories_updated_at_trigger ON subcategories;
CREATE TRIGGER subcategories_updated_at_trigger
BEFORE UPDATE ON subcategories
FOR EACH ROW
EXECUTE FUNCTION update_subcategories_updated_at();

CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at_trigger ON products;
CREATE TRIGGER products_updated_at_trigger
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_products_updated_at();

CREATE OR REPLACE FUNCTION update_product_variants_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_variants_updated_at_trigger ON product_variants;
CREATE TRIGGER product_variants_updated_at_trigger
BEFORE UPDATE ON product_variants
FOR EACH ROW
EXECUTE FUNCTION update_product_variants_updated_at();

CREATE OR REPLACE FUNCTION update_product_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_reviews_updated_at_trigger ON product_reviews;
CREATE TRIGGER product_reviews_updated_at_trigger
BEFORE UPDATE ON product_reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_reviews_updated_at();

CREATE OR REPLACE FUNCTION update_product_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_stats_updated_at_trigger ON product_stats;
CREATE TRIGGER product_stats_updated_at_trigger
BEFORE UPDATE ON product_stats
FOR EACH ROW
EXECUTE FUNCTION update_product_stats_updated_at();

-- ============================================================================
-- FONCTIONS - PRODUITS
-- ============================================================================

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

CREATE OR REPLACE FUNCTION increment_product_views(p_product_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO product_stats (product_id, views, last_viewed_at)
  VALUES (p_product_id, 1, CURRENT_TIMESTAMP)
  ON CONFLICT (product_id)
  DO UPDATE SET
    views = product_stats.views + 1,
    last_viewed_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PARTIE 4: VENDEURS ET STOCK
-- ============================================================================

-- TABLE: sellers
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telephone TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sellers_email ON sellers(email);
CREATE INDEX IF NOT EXISTS idx_sellers_is_active ON sellers(is_active);

-- TABLE: seller_products
CREATE TABLE IF NOT EXISTS seller_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(seller_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_seller_products_seller_id ON seller_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_products_product_id ON seller_products(product_id);

-- TABLE: stock
CREATE TABLE IF NOT EXISTS stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  low_stock_threshold INTEGER DEFAULT 10,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stock_product_id ON stock(product_id);

-- TABLE: stock_audit
CREATE TABLE IF NOT EXISTS stock_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('add', 'remove', 'adjustment')),
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stock_audit_product_id ON stock_audit(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_audit_seller_id ON stock_audit(seller_id);

-- ============================================================================
-- TRIGGERS - VENDEURS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_sellers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sellers_updated_at_trigger ON sellers;
CREATE TRIGGER sellers_updated_at_trigger
BEFORE UPDATE ON sellers
FOR EACH ROW
EXECUTE FUNCTION update_sellers_updated_at();

CREATE OR REPLACE FUNCTION update_seller_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS seller_products_updated_at_trigger ON seller_products;
CREATE TRIGGER seller_products_updated_at_trigger
BEFORE UPDATE ON seller_products
FOR EACH ROW
EXECUTE FUNCTION update_seller_products_updated_at();

CREATE OR REPLACE FUNCTION update_stock_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stock_updated_at_trigger ON stock;
CREATE TRIGGER stock_updated_at_trigger
BEFORE UPDATE ON stock
FOR EACH ROW
EXECUTE FUNCTION update_stock_updated_at();

-- ============================================================================
-- FONCTIONS - LIVRAISON MAROC
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_delivery_fee(
  p_city TEXT,
  p_is_fragile BOOLEAN,
  p_total_price DECIMAL,
  p_is_scout_member BOOLEAN
)
RETURNS DECIMAL(10, 2) AS $$
DECLARE
  v_fee DECIMAL(10, 2) := 0;
BEGIN
  -- Si scout, livraison gratuite + 10 DH fixe
  IF p_is_scout_member THEN
    RETURN 10.00;
  END IF;

  -- Safi
  IF LOWER(p_city) = 'safi' THEN
    v_fee := 20.00;
  -- Hors Safi
  ELSE
    v_fee := 35.00;
    -- Fragile hors Safi
    IF p_is_fragile THEN
      v_fee := 40.00;
    END IF;
  END IF;

  -- Commande < 100 DH, ajouter 10 DH
  IF p_total_price < 100.00 THEN
    v_fee := v_fee + 10.00;
  END IF;

  RETURN v_fee;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VUE: Products with Stats
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
  COALESCE(ps.favorites, 0) as favorites,
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
-- FIN DU SCRIPT CORRIGÉ V2.0
-- ============================================================================
-- 
-- RÉSUMÉ DES CORRECTIONS:
-- ✔ Supabase Auth intégration (users.id → auth.users.id)
-- ✔ Suppression password_hash (géré par Supabase)
-- ✔ FOREIGN KEYS complètes (user_history, cart_items, order_items, stock)
-- ✔ Suppression UNIQUE sur cart.user_id
-- ✔ Correction orders.user_id (NOT NULL supprimé)
-- ✔ Fonction calculate_cart_total (quantity * price)
-- ✔ Système de livraison Maroc (fonction calculate_delivery_fee)
-- ✔ Table user_addresses pour adresses
-- ✔ Support panier invité (guest_token)
-- ✔ Historique avancé (order_status_history)
-- ✔ Analytics amélioré (favorites dans product_stats)
-- ✔ Gestion des rôles (role column)
-- ✔ Toutes les contraintes CHECK
-- ✔ Tous les triggers de mise à jour
-- 
-- TABLES CRÉÉES:
-- Utilisateurs (6): users, user_addresses, user_sessions, user_history, 
--                   user_favorites, cart, cart_items
-- Commandes (3): orders, order_items, order_status_history
-- Produits (9): categories, subcategories, products, product_variants, 
--               product_images, product_tags, product_tag_mappings, 
--               product_reviews, product_stats
-- Vendeurs (4): sellers, seller_products, stock, stock_audit
--
-- TOTAL: 22 tables + 1 vue + 30+ fonctions + 20+ triggers
--
-- ✅ PRODUCTION READY - SHM MARKETPLACE V2.0
-- ============================================================================
