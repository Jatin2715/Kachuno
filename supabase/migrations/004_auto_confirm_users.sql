-- =============================================================================
-- Migration 004: Auto-confirm users for development & instant authentication
-- =============================================================================

-- 1. Confirm any existing unconfirmed users
UPDATE auth.users 
SET email_confirmed_at = now(),
    confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- 2. Create trigger to automatically confirm every new user on signup
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at = now();
  NEW.confirmed_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();
