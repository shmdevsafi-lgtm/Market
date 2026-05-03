-- ============================================================
-- SHM MARKETPLACE - SUPABASE SCHEMA
-- Version: 1.0 (PHASE 0)
-- ============================================================

-- ============================================================
-- 1. ROLES (Custom Role Management)
-- ============================================================

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,  -- 'customer', 'scout', 'manager', 'admin'
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now()
);

INSERT INTO roles (name, description, permissions) VALUES
  ('customer', 'Regular customer', '{"browse": true, "checkout": true, "manage_addresses": true}'),
  ('scout', 'Scout with product submission rights', '{"browse": true, "checkout": true, "add_products": true, "manage_own_products": true}'),
  ('manager', 'Manager with moderation rights', '{"all_customer": true, "all_scout": true, "moderate": true, "analytics": true}'),
  ('admin', 'Full system access', '{"all": true}');

-- ============================================================
-- 2. PROFILES (User Data - Extends Supabase Auth)
-- ============================================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  nom VARCHAR(100),
  prenom VARCHAR(100),
  telephone VARCHAR(20),
  region VARCHAR(100),  -- Moroccan region (Fès, Marrakech, etc.)
  ville VARCHAR(100),   -- City
  adresse TEXT,
  role_id UUID REFERENCES roles(id),
  avatar_url VARCHAR(500),
  verified_email BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role_id ON profiles(role_id);

-- ============================================================
-- 3. PRODUCTS (Catalog)
-- ============================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  description_long TEXT,
  category VARCHAR(100) NOT NULL,  -- 'textile', 'camping', 'medical', 'accessory', 'printing'
  subcategory VARCHAR(100),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  price_discount DECIMAL(10, 2) CHECK (price_discount IS NULL OR price_discount >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  status VARCHAR(50) DEFAULT 'draft',  -- 'draft', 'published', 'archived'
  featured BOOLEAN DEFAULT FALSE,
  is_new BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status) WHERE status = 'published';
CREATE INDEX idx_products_created_by ON products(created_by);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- ============================================================
-- 4. PRODUCT IMAGES (Gallery)
-- ============================================================

CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(product_id, is_primary);

-- ============================================================
-- 5. PRODUCT ATTRIBUTES (Dynamic, EAV Model)
-- ============================================================

CREATE TABLE product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,           -- 'size', 'color', 'weight', 'material', etc.
  value VARCHAR(500) NOT NULL,
  unit VARCHAR(20),                    -- 'kg', 'cm', 'h' for autonomy, etc.
  is_selectable BOOLEAN DEFAULT FALSE, -- TRUE for user-choosable (size, color)
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(product_id, key)
);

CREATE INDEX idx_product_attributes_product_id ON product_attributes(product_id);

-- ============================================================
-- 6. CARTS (Shopping Sessions)
-- ============================================================

CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(255) UNIQUE,  -- For guest carts
  status VARCHAR(50) DEFAULT 'active',  -- 'active', 'checked_out', 'abandoned'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_carts_user_id ON carts(user_id);
CREATE INDEX idx_carts_session_id ON carts(session_id);
CREATE INDEX idx_carts_status ON carts(status);

-- ============================================================
-- 7. CART ITEMS
-- ============================================================

CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  attributes JSONB,  -- {"size": "L", "color": "noir", "upload_url": "..."}
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);

-- ============================================================
-- 8. ADDRESSES (Multi-address Support)
-- ============================================================

CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label VARCHAR(100),  -- 'Domicile', 'Bureau', etc.
  full_address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  postal_code VARCHAR(10),
  phone VARCHAR(20),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_addresses_user_id ON addresses(user_id);
CREATE INDEX idx_addresses_default ON addresses(user_id, is_default) WHERE is_default = TRUE;

-- Constraint: only one default address per user
CREATE UNIQUE INDEX idx_addresses_one_default 
  ON addresses(user_id) 
  WHERE is_default = TRUE;

-- ============================================================
-- 9. ORDERS (Order Records)
-- ============================================================

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,  -- Human-readable: ORD-2026-001
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  fees DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (fees >= 0),
  shipping DECIMAL(10, 2) NOT NULL DEFAULT 0 CHECK (shipping >= 0),
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  
  -- Delivery Info
  delivery_address_id UUID REFERENCES addresses(id),
  delivery_address_snapshot JSONB,  -- Snapshot at order time
  
  -- User Info Snapshot (at order time)
  user_email VARCHAR(255),
  user_phone VARCHAR(20),
  user_role_snapshot VARCHAR(50),  -- 'customer', 'scout' (for analytics)
  
  -- Payment
  payment_method VARCHAR(50),  -- 'paypal', 'card', 'cash', etc.
  payment_status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'completed', 'failed', 'refunded'
  paypal_order_id VARCHAR(255),
  
  -- Order Status
  status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- ============================================================
-- 10. ORDER ITEMS (Line Items)
-- ============================================================

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
  attributes JSONB,  -- User-selected options at order time
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================================
-- 11. REVIEWS (Product Reviews)
-- ============================================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_id UUID REFERENCES orders(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT,
  verified_purchase BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_reviews_product_id ON reviews(product_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);

-- ============================================================
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can view/update own profile, admins can view all
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- PRODUCTS: Public read, scout/admin can create/edit own
CREATE POLICY "products_select_all" ON products
  FOR SELECT USING (status = 'published' OR created_by = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "products_insert_scout_admin" ON products
  FOR INSERT WITH CHECK (
    auth.uid() = created_by AND 
    (auth.jwt() ->> 'role' = 'scout' OR auth.jwt() ->> 'role' = 'admin')
  );

CREATE POLICY "products_update_own" ON products
  FOR UPDATE USING (created_by = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "products_delete_own" ON products
  FOR DELETE USING (created_by = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- CARTS: Users see own carts
CREATE POLICY "carts_select_own" ON carts
  FOR SELECT USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "carts_insert_own" ON carts
  FOR INSERT WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "carts_update_own" ON carts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "carts_delete_own" ON carts
  FOR DELETE USING (auth.uid() = user_id);

-- CART_ITEMS: Through cart ownership
CREATE POLICY "cart_items_select_via_cart" ON cart_items
  FOR SELECT USING (
    cart_id IN (SELECT id FROM carts WHERE auth.uid() = user_id OR session_id IS NOT NULL)
  );

-- ADDRESSES: Users manage own addresses
CREATE POLICY "addresses_select_own" ON addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "addresses_insert_own" ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "addresses_update_own" ON addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "addresses_delete_own" ON addresses
  FOR DELETE USING (auth.uid() = user_id);

-- ORDERS: Users see own orders, managers+ see all
CREATE POLICY "orders_select_own_or_manager" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.jwt() ->> 'role' IN ('manager', 'admin')
  );

CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ORDER_ITEMS: Through order access
CREATE POLICY "order_items_select_via_order" ON order_items
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders 
      WHERE auth.uid() = user_id OR auth.jwt() ->> 'role' IN ('manager', 'admin')
    )
  );

-- REVIEWS: Users can see approved reviews, create own, edit own
CREATE POLICY "reviews_select_published" ON reviews
  FOR SELECT USING (status = 'approved' OR user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "reviews_insert_own" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reviews_update_own" ON reviews
  FOR UPDATE USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- ============================================================
-- 13. HELPERS / FUNCTIONS
-- ============================================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR AS $$
DECLARE
  year VARCHAR(4);
  seq_num INTEGER;
BEGIN
  year := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 9) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM orders
  WHERE order_number LIKE 'ORD-' || year || '-%';
  
  RETURN 'ORD-' || year || '-' || LPAD(seq_num::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
  RETURN LOWER(
    TRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(title, '[^a-zA-Z0-9\s]', '', 'g'),
        '\s+',
        '-',
        'g'
      )
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-set updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_carts_updated_at BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_addresses_updated_at BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 14. INITIAL DATA
-- ============================================================

-- Sample region/city data (Moroccan)
CREATE TABLE moroccan_regions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  code VARCHAR(10)
);

INSERT INTO moroccan_regions (name, code) VALUES
  ('Fès', 'FEZ'),
  ('Safi', 'SAF'),
  ('Marrakech', 'MRK'),
  ('Casablanca', 'CAS'),
  ('Rabat', 'RBA'),
  ('Tangier', 'TNG'),
  ('Agadir', 'AGA'),
  ('Meknes', 'MKN');

-- ============================================================
-- END SCHEMA
-- ============================================================
