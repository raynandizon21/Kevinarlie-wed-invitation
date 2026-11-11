-- RSVP storage for the Kevin & Arlei invitation (same shape as the wedding-invitation project).
-- Run once, e.g. in phpMyAdmin or: mysql -u root < database/rsvp_schema.sql

CREATE DATABASE IF NOT EXISTS rsvp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rsvp;

CREATE TABLE IF NOT EXISTS rsvps (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(160) NOT NULL,
  contact VARCHAR(40) NULL DEFAULT NULL,
  isAttending ENUM('yes', 'no') NOT NULL,
  `timestamp` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `source` ENUM('web', 'qr') NOT NULL DEFAULT 'web'
    COMMENT 'web=guest via invite, qr=principal sponsor via QR ?view=rsvp',
  brings_guest ENUM('yes', 'no') NULL DEFAULT NULL
    COMMENT 'QR sponsors only: bringing one guest',
  guest_names JSON NULL DEFAULT NULL
    COMMENT 'JSON array with at most one name, e.g. ["Jane Doe"]',
  active TINYINT(1) NOT NULL DEFAULT 1
    COMMENT '1=active, 0=soft deleted'
);

-- Existing table (e.g. the shared `rsvp` database): add the soft-delete flag once
-- ALTER TABLE rsvps ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=active, 0=soft deleted' AFTER guest_names;

-- ---- RSVP admin login ----
-- Admin accounts. Passwords are scrypt hashes ("scrypt$N$r$p$salt$hash"), never plain text.
-- Add/change one with: npm run admin:set -- <username>
CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(60) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1=can sign in, 0=disabled',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL DEFAULT NULL,
  UNIQUE KEY uq_admins_username (username)
);

-- Signed-in sessions. The cookie holds a random token; only its SHA-256 is stored here.
CREATE TABLE IF NOT EXISTS admin_sessions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admin_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  ip VARCHAR(64) NULL DEFAULT NULL,
  user_agent VARCHAR(255) NULL DEFAULT NULL,
  UNIQUE KEY uq_admin_sessions_token (token_hash),
  KEY idx_admin_sessions_expires (expires_at),
  CONSTRAINT fk_admin_sessions_admin FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE
);
