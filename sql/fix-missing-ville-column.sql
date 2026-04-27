-- ============================================================================
-- SCRIPT DE CORRECTION - AJOUTER COLONNE VILLE MANQUANTE
-- ============================================================================

-- Ajouter la colonne 'ville' à la table users si elle n'existe pas
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS ville TEXT;

-- Créer un index sur ville pour les performances
CREATE INDEX IF NOT EXISTS idx_users_ville ON users(ville);

-- ============================================================================
-- FIN DU SCRIPT DE CORRECTION
-- ============================================================================
