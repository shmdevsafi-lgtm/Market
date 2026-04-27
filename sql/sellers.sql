-- ============================================================================
-- SCRIPT 2: VENDEURS (SELLERS)
-- Gestion des vendeurs, produits vendus, stock et statistiques
-- Compatible Supabase PostgreSQL
-- ============================================================================

-- ============================================================================
-- TABLE: sellers
-- Données principales des vendeurs/administrateurs
-- ============================================================================
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  prenom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telephone TEXT,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes sur sellers
CREATE INDEX IF NOT EXISTS idx_sellers_email ON sellers(email);
CREATE INDEX IF NOT EXISTS idx_sellers_created_at ON sellers(created_at);
CREATE INDEX IF NOT EXISTS idx_sellers_is_active ON sellers(is_active);


-- ============================================================================
-- TABLE: seller_products
-- Relation entre vendeurs et produits (quel vendeur vend quel produit)
-- ============================================================================
CREATE TABLE IF NOT EXISTS seller_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(seller_id, product_id)
);

-- Indexes sur seller_products
CREATE INDEX IF NOT EXISTS idx_seller_products_seller_id ON seller_products(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_products_product_id ON seller_products(product_id);
CREATE INDEX IF NOT EXISTS idx_seller_products_is_active ON seller_products(is_active);


-- ============================================================================
-- TABLE: stock
-- Gestion du stock par produit
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL UNIQUE,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  low_stock_threshold INTEGER DEFAULT 10,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes sur stock
CREATE INDEX IF NOT EXISTS idx_stock_product_id ON stock(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_quantity ON stock(quantity);


-- ============================================================================
-- TABLE: product_stats
-- Statistiques de suivi des produits (vues, clics, achats)
-- ============================================================================
CREATE TABLE IF NOT EXISTS product_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL UNIQUE,
  views INTEGER DEFAULT 0 CHECK (views >= 0),
  clicks INTEGER DEFAULT 0 CHECK (clicks >= 0),
  purchases INTEGER DEFAULT 0 CHECK (purchases >= 0),
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  last_purchased_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes sur product_stats
CREATE INDEX IF NOT EXISTS idx_product_stats_product_id ON product_stats(product_id);
CREATE INDEX IF NOT EXISTS idx_product_stats_views ON product_stats(views);
CREATE INDEX IF NOT EXISTS idx_product_stats_purchases ON product_stats(purchases);


-- ============================================================================
-- AUDIT TABLE
-- Suivi des modifications de stock
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL,
  seller_id UUID REFERENCES sellers(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('add', 'remove', 'adjustment')),
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes sur stock_audit
CREATE INDEX IF NOT EXISTS idx_stock_audit_product_id ON stock_audit(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_audit_seller_id ON stock_audit(seller_id);
CREATE INDEX IF NOT EXISTS idx_stock_audit_created_at ON stock_audit(created_at);


-- ============================================================================
-- TRIGGERS et FONCTIONS UTILITAIRES
-- ============================================================================

-- Fonction pour mettre à jour le updated_at des sellers
CREATE OR REPLACE FUNCTION update_sellers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur sellers
DROP TRIGGER IF EXISTS sellers_updated_at_trigger ON sellers;
CREATE TRIGGER sellers_updated_at_trigger
BEFORE UPDATE ON sellers
FOR EACH ROW
EXECUTE FUNCTION update_sellers_updated_at();


-- Fonction pour mettre à jour le updated_at de seller_products
CREATE OR REPLACE FUNCTION update_seller_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur seller_products
DROP TRIGGER IF EXISTS seller_products_updated_at_trigger ON seller_products;
CREATE TRIGGER seller_products_updated_at_trigger
BEFORE UPDATE ON seller_products
FOR EACH ROW
EXECUTE FUNCTION update_seller_products_updated_at();


-- Fonction pour mettre à jour le updated_at du stock
CREATE OR REPLACE FUNCTION update_stock_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur stock
DROP TRIGGER IF EXISTS stock_updated_at_trigger ON stock;
CREATE TRIGGER stock_updated_at_trigger
BEFORE UPDATE ON stock
FOR EACH ROW
EXECUTE FUNCTION update_stock_updated_at();


-- Fonction pour mettre à jour le updated_at de product_stats
CREATE OR REPLACE FUNCTION update_product_stats_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger sur product_stats
DROP TRIGGER IF EXISTS product_stats_updated_at_trigger ON product_stats;
CREATE TRIGGER product_stats_updated_at_trigger
BEFORE UPDATE ON product_stats
FOR EACH ROW
EXECUTE FUNCTION update_product_stats_updated_at();


-- Fonction pour enregistrer l'audit du stock
CREATE OR REPLACE FUNCTION log_stock_change()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO stock_audit (
    product_id,
    action,
    quantity_change,
    previous_quantity,
    new_quantity,
    reason
  ) VALUES (
    NEW.product_id,
    'adjustment',
    NEW.quantity - OLD.quantity,
    OLD.quantity,
    NEW.quantity,
    'Stock adjustment'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour enregistrer les changements de stock
DROP TRIGGER IF EXISTS stock_audit_trigger ON stock;
CREATE TRIGGER stock_audit_trigger
AFTER UPDATE ON stock
FOR EACH ROW
WHEN (OLD.quantity IS DISTINCT FROM NEW.quantity)
EXECUTE FUNCTION log_stock_change();


-- ============================================================================
-- FONCTIONS UTILES POUR L'APPLICATION
-- ============================================================================

-- Fonction pour incrémenter les vues d'un produit
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


-- Fonction pour incrémenter les clics d'un produit
CREATE OR REPLACE FUNCTION increment_product_clicks(p_product_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO product_stats (product_id, clicks)
  VALUES (p_product_id, 1)
  ON CONFLICT (product_id)
  DO UPDATE SET clicks = product_stats.clicks + 1;
END;
$$ LANGUAGE plpgsql;


-- Fonction pour enregistrer un achat et mettre à jour les stats
CREATE OR REPLACE FUNCTION record_product_purchase(p_product_id UUID, p_seller_id UUID, p_quantity INTEGER)
RETURNS VOID AS $$
BEGIN
  -- Mettre à jour les stats du produit
  INSERT INTO product_stats (product_id, purchases, last_purchased_at)
  VALUES (p_product_id, p_quantity, CURRENT_TIMESTAMP)
  ON CONFLICT (product_id)
  DO UPDATE SET
    purchases = product_stats.purchases + p_quantity,
    last_purchased_at = CURRENT_TIMESTAMP;
  
  -- Réduire le stock
  UPDATE stock
  SET quantity = quantity - p_quantity
  WHERE product_id = p_product_id
  AND quantity >= p_quantity;
  
  -- Enregistrer l'audit
  INSERT INTO stock_audit (
    product_id,
    seller_id,
    action,
    quantity_change,
    previous_quantity,
    new_quantity,
    reason
  ) 
  SELECT
    p_product_id,
    p_seller_id,
    'remove',
    -p_quantity,
    quantity + p_quantity,
    quantity,
    'Purchase'
  FROM stock
  WHERE product_id = p_product_id;
END;
$$ LANGUAGE plpgsql;


-- Fonction pour obtenir les produits en rupture de stock
CREATE OR REPLACE FUNCTION get_low_stock_products(p_seller_id UUID)
RETURNS TABLE(product_id UUID, quantity INTEGER, threshold INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT s.product_id, s.quantity, s.low_stock_threshold
  FROM stock s
  JOIN seller_products sp ON s.product_id = sp.product_id
  WHERE sp.seller_id = p_seller_id
  AND s.quantity <= s.low_stock_threshold
  ORDER BY s.quantity ASC;
END;
$$ LANGUAGE plpgsql;


-- Fonction pour obtenir les statistiques d'un vendeur
CREATE OR REPLACE FUNCTION get_seller_stats(p_seller_id UUID)
RETURNS TABLE(
  total_products INTEGER,
  active_products INTEGER,
  total_views INTEGER,
  total_purchases INTEGER,
  total_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT sp.product_id)::INTEGER as total_products,
    COUNT(DISTINCT CASE WHEN sp.is_active THEN sp.product_id END)::INTEGER as active_products,
    COALESCE(SUM(ps.views), 0)::INTEGER as total_views,
    COALESCE(SUM(ps.purchases), 0)::INTEGER as total_purchases,
    COALESCE(SUM(oi.price * oi.quantity), 0)::DECIMAL as total_revenue
  FROM seller_products sp
  LEFT JOIN product_stats ps ON sp.product_id = ps.product_id
  LEFT JOIN order_items oi ON sp.product_id = oi.product_id
  WHERE sp.seller_id = p_seller_id;
END;
$$ LANGUAGE plpgsql;


-- ============================================================================
-- FIN DU SCRIPT 2 - VENDEURS
-- ============================================================================
