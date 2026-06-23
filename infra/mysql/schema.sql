-- Run via: npm run sync:init
-- Migrate existing: npm run sync:migrate

CREATE TABLE IF NOT EXISTS elephants (
  id VARCHAR(32) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sex ENUM('male', 'female', 'unknown') NOT NULL DEFAULT 'unknown',
  status ENUM('living', 'deceased') NOT NULL DEFAULT 'living',
  species VARCHAR(32) NOT NULL DEFAULT 'asian',
  subspecies VARCHAR(32) NOT NULL DEFAULT 'unknown',
  birth_date VARCHAR(32) NULL,
  birth_place VARCHAR(512) NULL,
  death_date VARCHAR(32) NULL,
  death_reason VARCHAR(512) NULL,
  age_years INT NULL,
  origin ENUM('wild-caught', 'captive-born', 'unknown') NOT NULL DEFAULT 'unknown',
  location_id VARCHAR(32) NULL,
  location_name VARCHAR(512) NOT NULL,
  country VARCHAR(128) NOT NULL,
  category VARCHAR(32) NOT NULL DEFAULT 'other',
  chip_id VARCHAR(64) NULL,
  local_id VARCHAR(64) NULL,
  regional_ids JSON NULL,
  father_name VARCHAR(255) NULL,
  mother_name VARCHAR(255) NULL,
  father_id VARCHAR(32) NULL,
  mother_id VARCHAR(32) NULL,
  arrival_date VARCHAR(32) NULL,
  management VARCHAR(255) NULL,
  transfers JSON NULL,
  photos JSON NULL,
  sources JSON NULL,
  source_url VARCHAR(512) NOT NULL,
  synced_at DATETIME NOT NULL,
  INDEX idx_country (country),
  INDEX idx_status (status),
  INDEX idx_sex (sex),
  INDEX idx_category (category),
  INDEX idx_subspecies (subspecies),
  INDEX idx_location_id (location_id),
  INDEX idx_father_id (father_id),
  INDEX idx_mother_id (mother_id),
  INDEX idx_location_name (location_name(191)),
  FULLTEXT idx_search (name, location_name, country, father_name, mother_name, chip_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NULL,
  name VARCHAR(255) NULL,
  image VARCHAR(512) NULL,
  provider ENUM('credentials', 'google') NOT NULL DEFAULT 'credentials',
  role ENUM('user', 'moderator', 'admin') NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL,
  UNIQUE KEY uq_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contributions (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  elephant_id VARCHAR(32) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('info', 'photo') NOT NULL,
  payload JSON NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  reviewer_id VARCHAR(36) NULL,
  review_note TEXT NULL,
  created_at DATETIME NOT NULL,
  reviewed_at DATETIME NULL,
  INDEX idx_elephant_id (elephant_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS community_photos (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  elephant_id VARCHAR(32) NOT NULL,
  contribution_id VARCHAR(36) NULL,
  url VARCHAR(512) NOT NULL,
  credit VARCHAR(255) NULL,
  caption TEXT NULL,
  uploaded_by VARCHAR(36) NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_elephant_id (elephant_id),
  INDEX idx_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS elephant_overrides (
  elephant_id VARCHAR(32) NOT NULL PRIMARY KEY,
  fields JSON NOT NULL,
  updated_by VARCHAR(36) NULL,
  updated_at DATETIME NOT NULL,
  INDEX idx_updated_by (updated_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS elephant_enrichments (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  elephant_id VARCHAR(32) NULL,
  source VARCHAR(64) NOT NULL,
  source_slug VARCHAR(128) NOT NULL,
  source_url VARCHAR(512) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  local_name VARCHAR(255) NULL,
  facility VARCHAR(128) NULL,
  location_id VARCHAR(32) NULL,
  sex ENUM('male', 'female', 'unknown') NULL,
  birth_date VARCHAR(64) NULL,
  teaser TEXT NULL,
  story TEXT NULL,
  rescue_date VARCHAR(64) NULL,
  rescue_location VARCHAR(255) NULL,
  herd_friends VARCHAR(255) NULL,
  photos JSON NULL,
  synced_at DATETIME NOT NULL,
  UNIQUE KEY uq_source_slug (source, source_slug),
  INDEX idx_elephant_id (elephant_id),
  INDEX idx_location_id (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
