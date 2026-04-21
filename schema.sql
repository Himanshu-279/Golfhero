-- ================================================================
-- GolfHero — Full Supabase SQL Schema
-- Run this in Supabase SQL Editor (Project → SQL Editor → New Query)
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── Users ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email               TEXT UNIQUE NOT NULL,
  password_hash       TEXT NOT NULL,
  name                TEXT NOT NULL,
  role                TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  subscription_status TEXT NOT NULL DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'lapsed')),
  charity_id          UUID,
  charity_percentage  INTEGER NOT NULL DEFAULT 10 CHECK (charity_percentage >= 10 AND charity_percentage <= 100),
  stripe_customer_id  TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── Charities ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS charities (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name             TEXT NOT NULL,
  description      TEXT,
  image_url        TEXT,
  website          TEXT,
  featured         BOOLEAN DEFAULT FALSE,
  upcoming_events  TEXT,
  active           BOOLEAN DEFAULT TRUE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- FK after both tables exist
ALTER TABLE users ADD CONSTRAINT fk_users_charity
  FOREIGN KEY (charity_id) REFERENCES charities(id) ON DELETE SET NULL;

-- ── Subscriptions ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id  TEXT UNIQUE,
  stripe_customer_id      TEXT,
  plan                    TEXT CHECK (plan IN ('monthly', 'yearly')),
  status                  TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'cancelled')),
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW(),
  updated_at              TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id)
);

-- ── Scores ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scores (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score       INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  score_date  DATE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, score_date)   -- one score per date per user
);

-- ── Draws ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS draws (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month_year        TEXT NOT NULL,         -- e.g. "2024-04"
  draw_type         TEXT DEFAULT 'random' CHECK (draw_type IN ('random', 'algorithmic')),
  draw_numbers      INTEGER[] NOT NULL,    -- array of 5 numbers
  total_pool        INTEGER DEFAULT 0,
  jackpot_pool      INTEGER DEFAULT 0,
  match4_pool       INTEGER DEFAULT 0,
  match3_pool       INTEGER DEFAULT 0,
  jackpot_rollover  INTEGER DEFAULT 0,     -- amount carried to next month
  status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  subscriber_count  INTEGER DEFAULT 0,
  published_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── Draw Winners ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS draw_winners (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id               UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  match_count           INTEGER NOT NULL CHECK (match_count IN (3, 4, 5)),
  prize_amount          INTEGER DEFAULT 0,
  verification_status   TEXT CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  proof_url             TEXT,
  payment_status        TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  verified_at           TIMESTAMPTZ,
  paid_at               TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── Charity Contributions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS charity_contributions (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  charity_id               UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  amount                   INTEGER NOT NULL,  -- in paise/cents
  subscription_invoice_id  TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
CREATE INDEX IF NOT EXISTS idx_scores_date ON scores(score_date);
CREATE INDEX IF NOT EXISTS idx_draw_winners_draw_id ON draw_winners(draw_id);
CREATE INDEX IF NOT EXISTS idx_draw_winners_user_id ON draw_winners(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_charity_contributions_charity ON charity_contributions(charity_id);

-- ── Updated At trigger ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Seed: Sample Charities ────────────────────────────────────────
INSERT INTO charities (name, description, image_url, website, featured) VALUES
  ('Smile Foundation India',
   'Smile Foundation works for education, healthcare and livelihood of underprivileged children and families across India. Your contribution makes a direct impact.',
   'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800',
   'https://smilefoundationindia.org', TRUE),

  ('CRY - Child Rights and You',
   'CRY ensures every child has the right to a happy and healthy childhood. From education to protection, CRY fights for children across India.',
   'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800',
   'https://www.cry.org', TRUE),

  ('Akshaya Patra Foundation',
   'The Akshaya Patra Foundation runs the worlds largest school meal programme, providing nutritious mid-day meals to children across India.',
   'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800',
   'https://www.akshayapatra.org', FALSE),

  ('GiveIndia',
   'GiveIndia is Indias largest and most trusted giving platform, enabling donations to 600+ credible NGOs across the country.',
   'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
   'https://www.giveindia.org', TRUE),

  ('Robin Hood Army',
   'A zero-funds volunteer organisation that collects surplus food from restaurants and distributes it to the less fortunate.',
   'https://images.unsplash.com/photo-1547499417-0dfc18f8f35e?w=800',
   'https://robinhoodarmy.com', FALSE);

-- ── Seed: Admin User ──────────────────────────────────────────────
-- Default admin: admin@golfhero.com / Admin@123456
-- Password hash generated with bcrypt rounds=12
INSERT INTO users (email, password_hash, name, role, subscription_status) VALUES
  ('admin@golfhero.com',
   '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK3BxvmWi',
   'GolfHero Admin', 'admin', 'active')
ON CONFLICT (email) DO NOTHING;
