-- ================================================================
-- AeroSysMail Full-Stack Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  company       TEXT DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('admin','client')),
  avatar_initials TEXT DEFAULT '',
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','pending')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── HOSTING PLANS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plans (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  slug           TEXT UNIQUE NOT NULL,
  price_monthly  NUMERIC(8,2) NOT NULL,
  price_yearly   NUMERIC(8,2) NOT NULL,
  storage_gb     INT NOT NULL DEFAULT 5,
  email_accounts INT NOT NULL DEFAULT 5,
  domains        INT NOT NULL DEFAULT 1,
  bandwidth_gb   INT NOT NULL DEFAULT 100,
  features       JSONB DEFAULT '[]',
  stripe_price_monthly TEXT DEFAULT '',
  stripe_price_yearly  TEXT DEFAULT '',
  is_active      BOOLEAN DEFAULT true,
  sort_order     INT DEFAULT 0,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── DOMAINS (admin-managed inventory) ─────────────────────────
CREATE TABLE IF NOT EXISTS domains (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT UNIQUE NOT NULL,
  registrar       TEXT DEFAULT 'Cloudflare',
  nameservers     JSONB DEFAULT '[]',
  cloudflare_zone_id TEXT DEFAULT '',
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','pending','suspended','expired')),
  assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,
  added_by        UUID REFERENCES users(id),
  expiry_date     DATE,
  auto_renew      BOOLEAN DEFAULT true,
  ssl_status      TEXT DEFAULT 'active' CHECK (ssl_status IN ('active','pending','expired','none')),
  notes           TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── DNS RECORDS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dns_records (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain_id       UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  cf_record_id    TEXT DEFAULT '',  -- Cloudflare record ID for live sync
  type            TEXT NOT NULL CHECK (type IN ('A','AAAA','CNAME','MX','TXT','NS','SRV','CAA')),
  name            TEXT NOT NULL,
  value           TEXT NOT NULL,
  ttl             INT DEFAULT 3600,
  priority        INT DEFAULT 0,    -- for MX records
  proxied         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── SUBSCRIPTIONS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id               UUID NOT NULL REFERENCES plans(id),
  domain_id             UUID REFERENCES domains(id) ON DELETE SET NULL,
  status                TEXT DEFAULT 'active' CHECK (status IN ('active','cancelled','past_due','trialing','pending')),
  billing_cycle         TEXT DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly','yearly')),
  stripe_subscription_id TEXT DEFAULT '',
  stripe_customer_id    TEXT DEFAULT '',
  current_period_start  TIMESTAMPTZ DEFAULT NOW(),
  current_period_end    TIMESTAMPTZ DEFAULT NOW() + INTERVAL '1 month',
  cancelled_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── HOSTING ASSIGNMENTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hosting_assignments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain_id   UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id     UUID NOT NULL REFERENCES plans(id),
  server_ip   TEXT DEFAULT '',
  server_host TEXT DEFAULT '',
  ftp_user    TEXT DEFAULT '',
  ftp_pass    TEXT DEFAULT '',  -- encrypted in prod
  status      TEXT DEFAULT 'active' CHECK (status IN ('active','suspended','pending')),
  storage_used_mb INT DEFAULT 0,
  email_count INT DEFAULT 0,
  assigned_by UUID REFERENCES users(id),
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── EMAIL MAILBOXES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS mailboxes (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain_id     UUID NOT NULL REFERENCES domains(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  address       TEXT UNIQUE NOT NULL,
  display_name  TEXT DEFAULT '',
  quota_mb      INT DEFAULT 1024,
  used_mb       INT DEFAULT 0,
  status        TEXT DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── INVOICES ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  inv_number      TEXT UNIQUE NOT NULL,
  amount          NUMERIC(10,2) NOT NULL,
  currency        TEXT DEFAULT 'USD',
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','cancelled')),
  due_date        DATE NOT NULL,
  paid_at         TIMESTAMPTZ,
  stripe_invoice_id TEXT DEFAULT '',
  line_items      JSONB DEFAULT '[]',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── SUPPORT TICKETS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  priority    TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── UPDATED_AT TRIGGERS ────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated    BEFORE UPDATE ON users    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_domains_updated  BEFORE UPDATE ON domains  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_dns_updated      BEFORE UPDATE ON dns_records FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_subs_updated     BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_host_updated     BEFORE UPDATE ON hosting_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── INDEXES ───────────────────────────────────────────────────
CREATE INDEX idx_domains_assigned   ON domains(assigned_to);
CREATE INDEX idx_dns_domain         ON dns_records(domain_id);
CREATE INDEX idx_subs_user          ON subscriptions(user_id);
CREATE INDEX idx_subs_domain        ON subscriptions(domain_id);
CREATE INDEX idx_hosting_user       ON hosting_assignments(user_id);
CREATE INDEX idx_hosting_domain     ON hosting_assignments(domain_id);
CREATE INDEX idx_invoices_user      ON invoices(user_id);
CREATE INDEX idx_mailboxes_domain   ON mailboxes(domain_id);
CREATE INDEX idx_mailboxes_user     ON mailboxes(user_id);

-- ── SEED: PLANS ───────────────────────────────────────────────
INSERT INTO plans (name, slug, price_monthly, price_yearly, storage_gb, email_accounts, domains, bandwidth_gb, features, sort_order) VALUES
  ('Starter',    'starter',    9.00,  90.00,  5,  5,   1,  100,
   '["1 Domain","5 Email Accounts","5GB Storage","SSL Certificate","DNS Management","Basic Support"]', 1),
  ('Business',   'business',  29.00, 290.00, 25, 25,   3,  500,
   '["3 Domains","25 Email Accounts","25GB Storage","SSL Certificate","Advanced DNS","Priority Support","MX Records","DKIM/SPF/DMARC"]', 2),
  ('Pro',        'pro',       49.00, 490.00, 100,100, 10, 2000,
   '["10 Domains","Unlimited Email Accounts","100GB Storage","Wildcard SSL","Full DNS Suite","24/7 Support","Custom Nameservers","API Access","White-label"]', 3),
  ('Enterprise', 'enterprise',99.00, 990.00, 500,999, 50,10000,
   '["Unlimited Domains","Unlimited Email","500GB Storage","Dedicated IP","Full DNS Control","Dedicated Support","SLA 99.9%","Custom Integration","On-premise Option"]', 4)
ON CONFLICT (slug) DO NOTHING;

-- ── SEED: ADMIN USER (password: Admin@2024!) ──────────────────
-- Hash generated with bcrypt rounds=12
-- Change this password immediately after first login
INSERT INTO users (email, password_hash, name, company, role, avatar_initials) VALUES
  ('admin@aerosys.aero',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdummyhashXXXXX',
   'AeroSys Admin', 'AeroSys Technologies', 'admin', 'AS')
ON CONFLICT (email) DO NOTHING;
-- NOTE: The hash above is a placeholder. Run this after inserting to set real password:
-- UPDATE users SET password_hash = crypt('Admin@2024!', gen_salt('bf',12)) WHERE email = 'admin@aerosys.aero';

-- ── ROW LEVEL SECURITY ─────────────────────────────────────────
-- Disable RLS (using service role key from server-side only — safe)
-- Enable if you add client-side Supabase direct queries
ALTER TABLE users             DISABLE ROW LEVEL SECURITY;
ALTER TABLE plans             DISABLE ROW LEVEL SECURITY;
ALTER TABLE domains           DISABLE ROW LEVEL SECURITY;
ALTER TABLE dns_records       DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions     DISABLE ROW LEVEL SECURITY;
ALTER TABLE hosting_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE mailboxes         DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices          DISABLE ROW LEVEL SECURITY;
ALTER TABLE tickets           DISABLE ROW LEVEL SECURITY;
