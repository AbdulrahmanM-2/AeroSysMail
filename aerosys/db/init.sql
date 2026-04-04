-- =====================================================
-- AeroSysMail Database Schema & Seed Data
-- Run automatically on first MySQL container start
-- =====================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- ─────────────────────────────────────────
--  USERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)     NOT NULL PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(200) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar_url    VARCHAR(500) DEFAULT NULL,
  created_at    DATETIME     NOT NULL DEFAULT NOW(),
  updated_at    DATETIME     NOT NULL DEFAULT NOW() ON UPDATE NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  EMAILS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS emails (
  id               CHAR(36)      NOT NULL PRIMARY KEY,
  user_id          CHAR(36)      NOT NULL,
  from_address     VARCHAR(200)  NOT NULL,
  to_address       VARCHAR(500)  NOT NULL,
  subject          VARCHAR(500)  NOT NULL DEFAULT '(no subject)',
  body             LONGTEXT,
  preview          VARCHAR(200)  DEFAULT '',
  folder           VARCHAR(50)   NOT NULL DEFAULT 'inbox',
  is_read          TINYINT(1)    NOT NULL DEFAULT 0,
  is_starred       TINYINT(1)    NOT NULL DEFAULT 0,
  is_important     TINYINT(1)    NOT NULL DEFAULT 0,
  attachment_keys  JSON,
  sent_at          DATETIME      NOT NULL DEFAULT NOW(),
  INDEX idx_user_folder (user_id, folder),
  INDEX idx_sent_at     (sent_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  DEALS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS deals (
  id            CHAR(36)      NOT NULL PRIMARY KEY,
  user_id       CHAR(36)      NOT NULL,
  name          VARCHAR(200)  NOT NULL,
  company       VARCHAR(200)  DEFAULT '',
  amount        DECIMAL(12,2) DEFAULT 0.00,
  stage         VARCHAR(50)   NOT NULL DEFAULT 'new_lead'
                  COMMENT 'new_lead|in_negotiation|awaiting_signature|closed_won|closed_lost',
  contact_email VARCHAR(200)  DEFAULT '',
  notes         TEXT,
  created_at    DATETIME NOT NULL DEFAULT NOW(),
  updated_at    DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  INDEX idx_user_stage (user_id, stage),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  CLIENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id         CHAR(36)     NOT NULL PRIMARY KEY,
  user_id    CHAR(36)     NOT NULL,
  name       VARCHAR(120) NOT NULL,
  email      VARCHAR(200) NOT NULL,
  company    VARCHAR(200) DEFAULT '',
  phone      VARCHAR(50)  DEFAULT '',
  address    TEXT,
  notes      TEXT,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NOT NULL DEFAULT NOW() ON UPDATE NOW(),
  UNIQUE KEY uq_user_email (user_id, email),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  INVOICES
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id          CHAR(36)      NOT NULL PRIMARY KEY,
  user_id     CHAR(36)      NOT NULL,
  inv_number  VARCHAR(50)   NOT NULL UNIQUE,
  client_id   CHAR(36)      DEFAULT NULL,
  client_name VARCHAR(200)  DEFAULT '',
  amount      DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status      VARCHAR(30)   NOT NULL DEFAULT 'pending'
                COMMENT 'pending|paid|overdue|cancelled',
  due_date    DATE          NOT NULL,
  paid_at     DATETIME      DEFAULT NULL,
  line_items  JSON,
  notes       TEXT,
  created_at  DATETIME NOT NULL DEFAULT NOW(),
  INDEX idx_user_status  (user_id, status),
  INDEX idx_due_date     (due_date),
  FOREIGN KEY (user_id)   REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id)  ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  TASKS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
  id           CHAR(36)    NOT NULL PRIMARY KEY,
  user_id      CHAR(36)    NOT NULL,
  title        VARCHAR(300) NOT NULL,
  description  TEXT,
  due_date     DATE         DEFAULT NULL,
  priority     VARCHAR(20)  NOT NULL DEFAULT 'medium'
                 COMMENT 'low|medium|high|urgent',
  status       VARCHAR(30)  NOT NULL DEFAULT 'pending'
                 COMMENT 'pending|in_progress|done|cancelled',
  deal_id      CHAR(36)     DEFAULT NULL,
  invoice_id   CHAR(36)     DEFAULT NULL,
  completed_at DATETIME     DEFAULT NULL,
  created_at   DATETIME     NOT NULL DEFAULT NOW(),
  INDEX idx_user_status (user_id, status),
  INDEX idx_due_date    (due_date),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (deal_id)    REFERENCES deals(id)    ON DELETE SET NULL,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
--  SEED DEMO DATA
-- ─────────────────────────────────────────
-- Demo user: alex@aerosys.aero / password: demo1234
INSERT IGNORE INTO users (id, name, email, password_hash) VALUES
  ('00000000-0000-0000-0000-000000000001',
   'Alex Aerosys',
   'alex@aerosys.aero',
   '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewJyT.X.wnVGkIiS');

-- Seed clients
INSERT IGNORE INTO clients (id, user_id, name, email, company, phone) VALUES
  ('cl-acme-001',      '00000000-0000-0000-0000-000000000001', 'John Maxwell',      'john.maxwell@acme.com',        'Acme Ltd',         '+1-555-0101'),
  ('cl-bright-002',    '00000000-0000-0000-0000-000000000001', 'BrightWave Contact','contact@brightwave.com',       'BrightWave Ltd',   '+1-555-0102'),
  ('cl-salvo-003',     '00000000-0000-0000-0000-000000000001', 'Salvo Enterprises', 'billing@salvo.com',            'Salvo Enterprises','+1-555-0103'),
  ('cl-tecorp-004',    '00000000-0000-0000-0000-000000000001', 'Sarah Thompson',    'sarah@techcorp.com',           'Tech Corp',        '+1-555-0104'),
  ('cl-delta-005',     '00000000-0000-0000-0000-000000000001', 'Mike Delta',        'mike@deltasolutions.com',      'Delta Solutions',  '+1-555-0105');

-- Seed deals
INSERT IGNORE INTO deals (id, user_id, name, company, amount, stage, contact_email) VALUES
  ('deal-001', '00000000-0000-0000-0000-000000000001', 'Tech Corp — Platform Build',     'Tech Corp',        45000.00, 'new_lead',           'sarah@techcorp.com'),
  ('deal-002', '00000000-0000-0000-0000-000000000001', 'Delta Solutions — CRM Setup',    'Delta Solutions',  28000.00, 'new_lead',           'mike@deltasolutions.com'),
  ('deal-003', '00000000-0000-0000-0000-000000000001', 'Acme Ltd — Contract Renewal',    'Acme Ltd',         12500.00, 'in_negotiation',     'john.maxwell@acme.com'),
  ('deal-004', '00000000-0000-0000-0000-000000000001', 'GreenPath Co — Analytics',       'GreenPath Co',     18000.00, 'in_negotiation',     'ops@greenpath.com'),
  ('deal-005', '00000000-0000-0000-0000-000000000001', 'Global Media — Campaign Suite',  'Global Media',     65000.00, 'awaiting_signature', 'deals@globalmedia.com'),
  ('deal-006', '00000000-0000-0000-0000-000000000001', 'Skyline Inc — Cloud Migration',  'Skyline Inc',      32000.00, 'awaiting_signature', 'it@skyline.com'),
  ('deal-007', '00000000-0000-0000-0000-000000000001', 'Salvo Enterprises — ERP',        'Salvo Enterprises',15000.00, 'closed_won',         'billing@salvo.com'),
  ('deal-008', '00000000-0000-0000-0000-000000000001', 'BrightWave Ltd — Full Suite',    'BrightWave Ltd',   22500.00, 'closed_won',         'contact@brightwave.com');

-- Seed invoices
INSERT IGNORE INTO invoices (id, user_id, inv_number, client_name, amount, status, due_date, paid_at) VALUES
  ('inv-001', '00000000-0000-0000-0000-000000000001', 'INV-2024001', 'BrightWave Ltd',   15000.00, 'pending',  '2024-04-18', NULL),
  ('inv-002', '00000000-0000-0000-0000-000000000001', 'INV-2024002', 'Acme Ltd',          3200.00, 'pending',  '2024-04-20', NULL),
  ('inv-003', '00000000-0000-0000-0000-000000000001', 'INV-2024003', 'Salvo Enterprises', 4800.00, 'pending',  '2024-04-22', NULL),
  ('inv-004', '00000000-0000-0000-0000-000000000001', 'INV-2024004', 'Tech Corp',         2500.00, 'pending',  '2024-04-25', NULL),
  ('inv-005', '00000000-0000-0000-0000-000000000001', 'INV-2024005', 'Delta Solutions',   2300.00, 'pending',  '2024-04-28', NULL),
  ('inv-p01', '00000000-0000-0000-0000-000000000001', 'INV-2024P01', 'BrightWave Ltd',   22500.00, 'paid', '2024-03-01', '2024-03-10'),
  ('inv-p02', '00000000-0000-0000-0000-000000000001', 'INV-2024P02', 'Salvo Enterprises',15000.00, 'paid', '2024-03-15', '2024-03-14'),
  ('inv-p03', '00000000-0000-0000-0000-000000000001', 'INV-2024P03', 'Acme Ltd',         12500.00, 'paid', '2024-04-01', '2024-03-28'),
  ('inv-p04', '00000000-0000-0000-0000-000000000001', 'INV-2024P04', 'Tech Corp',        45000.00, 'paid', '2024-04-10', '2024-04-08'),
  ('inv-p05', '00000000-0000-0000-0000-000000000001', 'INV-2024P05', 'Global Media',     29500.00, 'paid', '2024-04-15', '2024-04-12');

-- Seed tasks
INSERT IGNORE INTO tasks (id, user_id, title, due_date, priority, status, deal_id) VALUES
  ('task-001', '00000000-0000-0000-0000-000000000001', 'Follow up with BrightWave on invoice INV-2024001', '2024-04-18', 'high',   'pending', 'deal-008'),
  ('task-002', '00000000-0000-0000-0000-000000000001', 'Review feature proposal for Acme Ltd',             '2024-04-19', 'medium', 'pending', 'deal-003'),
  ('task-003', '00000000-0000-0000-0000-000000000001', 'Prepare contract for Global Media signature',      '2024-04-20', 'urgent', 'pending', 'deal-005'),
  ('task-004', '00000000-0000-0000-0000-000000000001', 'Schedule onboarding call — Delta Solutions',       '2024-04-21', 'medium', 'pending', 'deal-002'),
  ('task-005', '00000000-0000-0000-0000-000000000001', 'Send monthly analytics report to all clients',     '2024-04-30', 'low',    'pending', NULL);

-- Seed emails
INSERT IGNORE INTO emails (id, user_id, from_address, to_address, subject, body, preview, folder, is_read, is_starred, sent_at) VALUES
  ('email-001', '00000000-0000-0000-0000-000000000001',
   'john.maxwell@example.com', 'alex@aerosys.aero',
   'Meeting Proposal for Next Week',
   '<p>Hi Alex,</p><p>I hope you\'re doing well. I\'d like to propose a meeting to discuss the project timeline and milestones for next week. Are you available on Wednesday at 2 PM?</p><p>Let me know what works for you.</p><p>Best,<br/>John Maxwell</p>',
   'Arrange meeting; available at IST', 'inbox', 0, 0, DATE_SUB(NOW(), INTERVAL 3 HOUR)),

  ('email-002', '00000000-0000-0000-0000-000000000001',
   'sales@acme.com', 'alex@aerosys.aero',
   'Project Finalization — Action Required',
   '<p>Hi Team,</p><p>We need to finalize the project scope for the Acme contract. Please review attached documents and provide feedback by EOD Friday.</p>',
   'Take the project finalization.', 'inbox', 1, 0, DATE_SUB(NOW(), INTERVAL 5 HOUR)),

  ('email-003', '00000000-0000-0000-0000-000000000001',
   'sarah.thompson@techcorp.com', 'alex@aerosys.aero',
   'Re: Update on the Campaign',
   '<p>Hi Alex,</p><p>Engagement is up 18% from last quarter. The team prepared a detailed report. Shall we sync this week?</p>',
   'Fmalling irewe, ant done calk...', 'inbox', 0, 1, DATE_SUB(NOW(), INTERVAL 8 HOUR)),

  ('email-004', '00000000-0000-0000-0000-000000000001',
   'michael@webnex.io', 'alex@aerosys.aero',
   'Request for Quote — Web Development',
   '<p>Hello,</p><p>I am inquiring about web development services for our company. We need a complete redesign of our corporate portal. Could you provide a quote?</p>',
   'Inquiring about a quote for your e...', 'inbox', 0, 0, DATE_SUB(NOW(), INTERVAL 12 HOUR)),

  ('email-005', '00000000-0000-0000-0000-000000000001',
   'clientservices@brightwave.com', 'alex@aerosys.aero',
   'Onboarding Confirmation Needed',
   '<p>Hi Alex,</p><p>Please confirm the client onboarding for BrightWave. We need the signed NDA and initial payment before proceeding to step 2.</p>',
   'Confirm onboarding: send it a no...', 'inbox', 1, 0, DATE_SUB(NOW(), INTERVAL 14 HOUR));
