-- RSVP storage for the Kevin & Arlei invitation (same shape as the wedding-invitation project).
-- Run once, e.g. in phpMyAdmin or: mysql -u root < database/rsvp_schema.sql

CREATE DATABASE IF NOT EXISTS kevinarlei_rsvp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kevinarlei_rsvp;

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
