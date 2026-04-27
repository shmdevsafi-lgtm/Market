-- ============================================================================
-- SCRIPT DE MIGRATION - AUTHENTIFICATION DIRECTE BD SANS SUPABASE AUTH
-- ============================================================================

-- Ajouter colonne password_hash si elle n'existe pas
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Ajouter colonne is_verified pour vérification manuelle d'email
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_email_verified BOOLEAN DEFAULT FALSE;

-- Ajouter colonne for verification token
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS verification_token TEXT UNIQUE;

-- Créer table pour les codes OTP Twilio
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL,
  code TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_number ON otp_codes(phone_number);
CREATE INDEX IF NOT EXISTS idx_otp_codes_code ON otp_codes(code);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- Créer table pour les sessions utilisateur (tokens locaux)
CREATE TABLE IF NOT EXISTS user_auth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_auth_tokens_user_id ON user_auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_auth_tokens_token ON user_auth_tokens(token);

-- ============================================================================
-- FONCTION - VÉRIFIER IDENTIFIANTS (LOGIN DIRECT)
-- ============================================================================

CREATE OR REPLACE FUNCTION verify_user_credentials(p_email TEXT, p_password TEXT)
RETURNS TABLE(user_id UUID, email TEXT, nom TEXT, prenom TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.nom, u.prenom
  FROM users u
  WHERE u.email = p_email
  AND u.password_hash = p_password
  AND u.is_email_verified = TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION - VÉRIFIER CODE OTP
-- ============================================================================

CREATE OR REPLACE FUNCTION verify_otp_code(p_phone TEXT, p_code TEXT)
RETURNS TABLE(is_valid BOOLEAN, expires_in_minutes INTEGER) AS $$
DECLARE
  v_record RECORD;
  v_expires_in_minutes INTEGER;
BEGIN
  SELECT * INTO v_record FROM otp_codes 
  WHERE phone_number = p_phone 
  AND code = p_code 
  AND expires_at > CURRENT_TIMESTAMP
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_record IS NULL THEN
    RETURN QUERY SELECT false::BOOLEAN, 0::INTEGER;
  ELSE
    v_expires_in_minutes := EXTRACT(EPOCH FROM (v_record.expires_at - CURRENT_TIMESTAMP))::INTEGER / 60;
    RETURN QUERY SELECT true::BOOLEAN, v_expires_in_minutes::INTEGER;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION - GÉNÉRER OTP (TWILIO)
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_otp_code(p_phone_number TEXT, p_expiry_minutes INTEGER DEFAULT 10)
RETURNS TABLE(code TEXT, expires_at TIMESTAMP WITH TIME ZONE) AS $$
DECLARE
  v_code TEXT;
  v_expires TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Générer un code 6 chiffres aléatoire
  v_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
  v_expires := CURRENT_TIMESTAMP + (p_expiry_minutes || ' minutes')::INTERVAL;

  -- Insérer dans la table OTP
  INSERT INTO otp_codes (phone_number, code, expires_at)
  VALUES (p_phone_number, v_code, v_expires);

  RETURN QUERY SELECT v_code, v_expires;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FIN DU SCRIPT DE MIGRATION
-- ============================================================================
