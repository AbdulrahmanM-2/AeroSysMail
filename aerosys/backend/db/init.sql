-- ═══════════════════════════════════════════════
-- AeroSysMail — Database Schema
-- ═══════════════════════════════════════════════

CREATE DATABASE IF NOT EXISTS aerosys CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aerosys;

-- ── Users ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(120)  NOT NULL,
  email       VARCHAR(255)  NOT NULL UNIQUE,
  password    VARCHAR(255)  NOT NULL,
  avatar_url  VARCHAR(512)  DEFAULT NULL,
  role        ENUM('admin','user') DEFAULT 'user',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ── Emails ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS emails (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  message_id   VARCHAR(255) DEFAULT NULL,
  folder       ENUM('inbox','sent','drafts','starred','trash','spam') DEFAULT 'inbox',
  from_email   VARCHAR(255) NOT NULL,
  from_name    VARCHAR(120) DEFAULT '',
  to_email     TEXT         NOT NULL,        -- comma-separated
  cc_email     TEXT         DEFAULT NULL,
  bcc_email    TEXT         DEFAULT NULL,
  subject      VARCHAR(512) DEFAULT '(no subject)',
  body_text    LONGTEXT     DEFAULT NULL,
  body_html    LONGTEXT     DEFAULT NULL,
  is_read      TINYINT(1)   DEFAULT 0,
  is_starred   TINYINT(1)   DEFAULT 0,
  is_important TINYINT(1)   DEFAULT 0,
  has_attachment TINYINT(1) DEFAULT 0,
  ai_summary   TEXT         DEFAULT NULL,
  ai_priority  ENUM('high','medium','low') DEFAULT 'medium',
  sent_at      TIMESTAMP    DEFAULT NULL,
  created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_folder (user_id, folder),
  INDEX idx_user_read   (user_id, is_read)
);

-- ── Email Attachments ───────────────────────────
CREATE TABLE IF NOT EXISTS attachments (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email_id    INT UNSIGNED NOT NULL,
  filename    VARCHAR(255) NOT NULL,
  content_type VARCHAR(120) DEFAULT 'application/octet-stream',
  size_bytes  INT UNSIGNED DEFAULT 0,
  minio_key   VARCHAR(512) NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
);

-- ── Clients ────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) DEFAULT NULL,
  phone       VARCHAR(50)  DEFAULT NULL,
  company     VARCHAR(255) DEFAULT NULL,
  website     VARCHAR(255) DEFAULT NULL,
  address     TEXT         DEFAULT NULL,
  notes       TEXT         DEFAULT NULL,
  status      ENUM('active','inactive','prospect') DEFAULT 'prospect',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── Deals ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  client_id   INT UNSIGNED DEFAULT NULL,
  title       VARCHAR(255) NOT NULL,
  amount      DECIMAL(12,2) DEFAULT 0.00,
  stage       ENUM('new_lead','in_negotiation','awaiting_signature','closed_won','closed_lost') DEFAULT 'new_lead',
  probability INT UNSIGNED DEFAULT 50,    -- 0-100 %
  expected_close DATE DEFAULT NULL,
  notes       TEXT DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
  INDEX idx_user_stage (user_id, stage)
);

-- ── Invoices ───────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id         INT UNSIGNED NOT NULL,
  client_id       INT UNSIGNED DEFAULT NULL,
  deal_id         INT UNSIGNED DEFAULT NULL,
  invoice_number  VARCHAR(50)  NOT NULL,
  amount          DECIMAL(12,2) DEFAULT 0.00,
  tax             DECIMAL(12,2) DEFAULT 0.00,
  total           DECIMAL(12,2) DEFAULT 0.00,
  status          ENUM('draft','pending','paid','overdue','cancelled') DEFAULT 'pending',
  due_date        DATE DEFAULT NULL,
  paid_at         TIMESTAMP DEFAULT NULL,
  notes           TEXT DEFAULT NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
  FOREIGN KEY (deal_id)   REFERENCES deals(id)   ON DELETE SET NULL
);

-- ── Tasks ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  deal_id     INT UNSIGNED DEFAULT NULL,
  client_id   INT UNSIGNED DEFAULT NULL,
  email_id    INT UNSIGNED DEFAULT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT         DEFAULT NULL,
  status      ENUM('pending','in_progress','done','cancelled') DEFAULT 'pending',
  priority    ENUM('high','medium','low') DEFAULT 'medium',
  due_date    TIMESTAMP    DEFAULT NULL,
  completed_at TIMESTAMP   DEFAULT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)   REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (deal_id)   REFERENCES deals(id)   ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL,
  FOREIGN KEY (email_id)  REFERENCES emails(id)  ON DELETE SET NULL
);

-- ── AI Actions Log ─────────────────────────────
CREATE TABLE IF NOT EXISTS ai_actions (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  action_type VARCHAR(100) NOT NULL,   -- e.g. 'smart_reply','schedule_meeting','follow_up'
  description TEXT         DEFAULT NULL,
  entity_type VARCHAR(50)  DEFAULT NULL,  -- 'email','deal','task'
  entity_id   INT UNSIGNED DEFAULT NULL,
  status      ENUM('pending','done','failed') DEFAULT 'done',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, created_at)
);

-- ── Sessions (Redis-backed, but table for audit) ─
CREATE TABLE IF NOT EXISTS sessions (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT UNSIGNED NOT NULL,
  token_hash  VARCHAR(255) NOT NULL UNIQUE,
  ip_address  VARCHAR(45)  DEFAULT NULL,
  user_agent  TEXT         DEFAULT NULL,
  expires_at  TIMESTAMP    NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ═══════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════

INSERT IGNORE INTO users (id, name, email, password, role) VALUES
(1, 'Alex Aerosys', 'alex@aerosys.aero',
 '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWq', -- 'password123'
 'admin');

INSERT IGNORE INTO clients (id, user_id, name, email, company, status) VALUES
(1, 1, 'John Maxwell',    'john.maxwell@example.com', 'Maxwell Inc',    'active'),
(2, 1, 'Acme Ltd',        'sales@acme.com',           'Acme Ltd',       'active'),
(3, 1, 'Sarah Thompson',  'sarah@brightwave.com',     'BrightWave Ltd', 'active'),
(4, 1, 'Tech Corp',       'contact@techcorp.io',      'Tech Corp',      'prospect'),
(5, 1, 'Delta Solutions', 'hello@deltasolutions.com', 'Delta Solutions','prospect'),
(6, 1, 'GreenPath Co',    'info@greenpath.co',        'GreenPath Co',   'active'),
(7, 1, 'Global Media',    'gm@globalmedia.net',       'Global Media',   'active'),
(8, 1, 'Skyline Inc',     'office@skylineinc.com',    'Skyline Inc',    'active'),
(9, 1, 'Salvo Enterprises','billing@salvo.com',       'Salvo Enterprises','active');

INSERT IGNORE INTO deals (id, user_id, client_id, title, amount, stage, probability) VALUES
(1, 1, 4, 'Tech Corp Platform Deal',       25000.00, 'new_lead',            40),
(2, 1, 5, 'Delta Solutions Integration',   18000.00, 'new_lead',            35),
(3, 1, 2, 'Acme Ltd Contract',             12500.00, 'in_negotiation',      65),
(4, 1, 6, 'GreenPath Co Service Package',  9800.00,  'in_negotiation',      70),
(5, 1, 7, 'Global Media Annual License',   32000.00, 'awaiting_signature',  85),
(6, 1, 8, 'Skyline Inc Cloud Migration',   47500.00, 'awaiting_signature',  90),
(7, 1, 9, 'Salvo Enterprises Suite',       15000.00, 'closed_won',         100),
(8, 1, 3, 'BrightWave Ltd Expansion',      22500.00, 'closed_won',         100);

INSERT IGNORE INTO invoices (id, user_id, client_id, deal_id, invoice_number, amount, tax, total, status, due_date) VALUES
(1, 1, 9, 7, 'INV-2024-001', 15000.00, 2700.00, 17700.00, 'paid',    '2024-03-15'),
(2, 1, 3, 8, 'INV-2024-002', 22500.00, 4050.00, 26550.00, 'paid',    '2024-04-01'),
(3, 1, 2, 3, 'INV-2024-003', 12500.00, 2250.00, 14750.00, 'pending', '2024-04-18'),
(4, 1, 4, 1, 'INV-2024-004',  8000.00, 1440.00,  9440.00, 'pending', '2024-04-20'),
(5, 1, 6, 4, 'INV-2024-005',  4800.00,  864.00,  5664.00, 'pending', '2024-04-22'),
(6, 1, 7, 5, 'INV-2024-006',  2500.00,  450.00,  2950.00, 'overdue', '2024-04-10'),
(7, 1, 8, 6, 'INV-2024-007',  2000.00,  360.00,  2360.00, 'pending', '2024-04-25');

INSERT IGNORE INTO tasks (id, user_id, deal_id, client_id, title, status, priority, due_date) VALUES
(1, 1, 3, 2, 'Finalize Acme Ltd contract',          'in_progress', 'high',   '2024-04-18 17:00:00'),
(2, 1, 5, 7, 'Send Global Media license agreement', 'pending',     'high',   '2024-04-15 12:00:00'),
(3, 1, 8, 3, 'BrightWave follow-up call',           'pending',     'medium', '2024-04-18 10:00:00'),
(4, 1, 1, 4, 'Tech Corp demo presentation',         'pending',     'medium', '2024-04-19 14:00:00'),
(5, 1, 6, 8, 'Skyline Inc migration plan review',   'in_progress', 'high',   '2024-04-16 09:00:00');

INSERT IGNORE INTO emails (id, user_id, folder, from_email, from_name, to_email, subject, body_html, is_read, ai_priority, sent_at) VALUES
(1, 1, 'inbox', 'john.maxwell@example.com', 'John Maxwell',
 'alex@aerosys.aero', 'Meeting Proposal for Next Week',
 '<p>Hi Alex,</p><p>I hope you\'re doing well. I\'d like to propose a meeting to discuss the project timeline and milestones for next week. Are you available on Wednesday at 2 PM?</p><p>Best,<br/>John Maxwell</p>',
 0, 'high', NOW()),
(2, 1, 'inbox', 'sales@acme.com', 'Acme Sales',
 'alex@aerosys.aero', 'Project Finalization — Action Required',
 '<p>Hi Team,</p><p>We need to finalize the project scope and deliverables for the Acme contract. Please review the attached documents.</p>',
 1, 'high', NOW()),
(3, 1, 'inbox', 'sarah@brightwave.com', 'Sarah Thompson',
 'alex@aerosys.aero', 'Re: Update on the Campaign',
 '<p>Hi Alex,</p><p>Engagement is up 18% from last quarter. Preliminary data looks very promising.</p>',
 1, 'medium', NOW()),
(4, 1, 'inbox', 'michael@webnex.io', 'Michael Web',
 'alex@aerosys.aero', 'Request for Quote — Web Development',
 '<p>Hello,</p><p>Inquiring about web development services. Could you provide a quote for a corporate portal redesign?</p>',
 1, 'low', NOW()),
(5, 1, 'inbox', 'clientservices@brightwave.com', 'BrightWave Services',
 'alex@aerosys.aero', 'Onboarding Confirmation Needed',
 '<p>Please confirm client onboarding. We need the signed NDA and initial payment before we proceed.</p>',
 1, 'high', NOW());

INSERT IGNORE INTO ai_actions (user_id, action_type, description, entity_type, entity_id) VALUES
(1, 'smart_reply',     'Suggested meeting confirmation reply',     'email', 1),
(1, 'schedule_meeting','Booked Wednesday 2PM in calendar',         'email', 1),
(1, 'follow_up',       'Scheduled Acme follow-up for Apr 18',      'deal',  3),
(1, 'smart_reply',     'Drafted BrightWave onboarding response',   'email', 5),
(1, 'lead_score',      'Scored Tech Corp lead: 78/100',            'deal',  1),
(1, 'invoice_reminder','Sent overdue reminder to Global Media',    'invoice',6);
