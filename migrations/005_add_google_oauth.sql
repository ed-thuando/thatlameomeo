-- Migration: Add Google OAuth columns to users table
-- Date: 2025-01-27
-- Feature: 001-google-login

-- Add Google OAuth columns to users table
ALTER TABLE users ADD COLUMN google_id TEXT NULL;
ALTER TABLE users ADD COLUMN google_email TEXT NULL;
ALTER TABLE users ADD COLUMN refresh_token TEXT NULL;
ALTER TABLE users ADD COLUMN refresh_token_expires_at TEXT NULL;

-- Add temporary onboarding columns
ALTER TABLE users ADD COLUMN onboarding_username TEXT NULL;
ALTER TABLE users ADD COLUMN onboarding_color TEXT NULL;
ALTER TABLE users ADD COLUMN onboarding_expires_at TEXT NULL;

-- Create indexes for OAuth lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_google_email ON users(google_email);

-- Add unique constraint on google_id (if not NULL)
-- Note: SQLite doesn't support partial unique indexes directly
-- We'll enforce uniqueness at application level for NULL values
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id_unique ON users(google_id) WHERE google_id IS NOT NULL;

-- Note: SQLite doesn't support ALTER COLUMN to change NULL constraints
-- password_hash NULL handling is enforced at application level
-- Existing NOT NULL constraint remains, but we allow NULL values in practice
