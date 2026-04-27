-- ============================================================================
-- MIGRATION: Ajouter les colonnes manquantes pour PayPal et personnalisation
-- Date: 2024
-- ============================================================================

-- Vérifier et ajouter la colonne paypal_order_id à la table orders si elle n'existe pas
ALTER TABLE IF EXISTS orders
ADD COLUMN IF NOT EXISTS paypal_order_id TEXT;

-- Créer un index sur paypal_order_id pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_orders_paypal_order_id ON orders(paypal_order_id);

-- Ajouter les colonnes manquantes à la table orders pour les données de livraison
ALTER TABLE IF EXISTS orders
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_email TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT,
ADD COLUMN IF NOT EXISTS customer_address TEXT,
ADD COLUMN IF NOT EXISTS customer_city TEXT,
ADD COLUMN IF NOT EXISTS customer_postal_code TEXT;

-- Créer les colonnes pour le stockage de la configuration textile si elles n'existent pas
ALTER TABLE IF EXISTS order_items
ADD COLUMN IF NOT EXISTS textile_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS textile_material VARCHAR(50),
ADD COLUMN IF NOT EXISTS textile_size VARCHAR(10),
ADD COLUMN IF NOT EXISTS textile_color VARCHAR(50),
ADD COLUMN IF NOT EXISTS user_image_url TEXT;

-- ============================================================================
-- VÉRIFICATION: Afficher la structure actuelle de la table orders
-- ============================================================================
-- Décommentez la ligne suivante pour vérifier la structure:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'orders';

-- ============================================================================
-- Notes:
-- - Ces colonnes sont essentielles pour le flux PayPal complet
-- - paypal_order_id: ID de la commande PayPal pour le suivi
-- - customer_*: Données clients pour la livraison
-- - textile_*: Configuration personnalisée du produit textile
-- - user_image_url: Image téléchargée par l'utilisateur
-- ============================================================================
