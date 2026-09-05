-- ==========================================================================
-- PCS Eco-System — Supabase Schema & RLS Policies
-- ==========================================================================
-- Run this SQL in the Supabase Dashboard → SQL Editor (or via supabase CLI).
-- All tables reference auth.users(id) with ON DELETE CASCADE so that deleting
-- a user account automatically removes ALL their associated data.
--
-- RLS is ENABLED on every table. Users can only read/write their own rows
-- (id = auth.uid() or user_id = auth.uid()).
-- ==========================================================================

-- --------------------------------------------------------------------------
-- 1. profiles
--    Mirrors pcs-profile-storage (name, phone, email, avatar_url).
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  name        TEXT,
  phone       TEXT,
  email       TEXT,
  avatar_url  TEXT,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: select own"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles: insert own"
  ON profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles: update own"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- --------------------------------------------------------------------------
-- 2. wallets
--    Stores the derived points total for quick reads.
--    Updates are ONLY allowed via the increment_points / decrement_points
--    RPC functions (defined below) to prevent race conditions.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wallets (
  id          UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  points      INTEGER NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "wallets: select own"
  ON wallets FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "wallets: insert own"
  ON wallets FOR INSERT
  WITH CHECK (id = auth.uid());

-- NOTE: UPDATE is intentionally NOT granted to users directly.
-- All point mutations go through the RPC functions below.

-- Atomic increment (used by ADD_POINTS sync action)
CREATE OR REPLACE FUNCTION increment_points(user_uuid UUID, delta INTEGER)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE wallets SET points = points + delta, updated_at = NOW()
  WHERE id = user_uuid;
END;
$$;

-- Atomic decrement — prevents points going below 0
CREATE OR REPLACE FUNCTION decrement_points(user_uuid UUID, delta INTEGER)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE wallets SET points = GREATEST(0, points - delta), updated_at = NOW()
  WHERE id = user_uuid;
END;
$$;

-- --------------------------------------------------------------------------
-- 3. transactions  (APPEND-ONLY — no UPDATE, no DELETE)
--    Every earn/redeem event is a new row. Points balance is derived from
--    this log. This is the single source of truth for wallet history.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('earn', 'redeem')),
  amount      INTEGER NOT NULL CHECK (amount > 0),
  date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT
);

CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions (user_id);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transactions: select own"
  ON transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "transactions: insert own"
  ON transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- No UPDATE or DELETE policies — this table is immutable by design.

-- --------------------------------------------------------------------------
-- 4. user_likes  (NORMALIZED — replaces jsonb array; idempotent INSERT)
--    Primary key (user_id, post_id) makes duplicates impossible.
--    A LIKE is an INSERT; an UNLIKE is a DELETE. No race conditions.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_likes (
  user_id   UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  post_id   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, post_id)
);

ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_likes: select own"
  ON user_likes FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_likes: insert own"
  ON user_likes FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_likes: delete own"
  ON user_likes FOR DELETE
  USING (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- 5. user_saved_vouchers  (NORMALIZED — replaces jsonb array)
--    Primary key (user_id, voucher_id) guarantees idempotency.
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_saved_vouchers (
  user_id     UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  voucher_id  TEXT NOT NULL,
  saved_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, voucher_id)
);

ALTER TABLE user_saved_vouchers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_saved_vouchers: select own"
  ON user_saved_vouchers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_saved_vouchers: insert own"
  ON user_saved_vouchers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_saved_vouchers: delete own"
  ON user_saved_vouchers FOR DELETE
  USING (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- 6. user_viewed_stories  (BEST-EFFORT — low-value, no retry on fail)
-- --------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_viewed_stories (
  user_id    UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  story_id   TEXT NOT NULL,
  viewed_at  TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, story_id)
);

ALTER TABLE user_viewed_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_viewed_stories: select own"
  ON user_viewed_stories FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "user_viewed_stories: insert own"
  ON user_viewed_stories FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- --------------------------------------------------------------------------
-- 7. Auto-create profile row on new user sign-up
--    Trigger fires AFTER INSERT on auth.users so there's always a profiles row.
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO wallets (id, points)
  VALUES (NEW.id, 0)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
