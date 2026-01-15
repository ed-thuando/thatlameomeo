# Data Model: Google OAuth Login with Onboarding

**Date**: 2025-01-27  
**Feature**: 001-google-login

## Database Schema Changes

### Users Table Updates

The existing `users` table is extended with Google OAuth and refresh token columns.

**Table**: `users` (updated)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user identifier |
| `username` | TEXT | NOT NULL UNIQUE | Login username (required for all users) |
| `password_hash` | TEXT | NULL | Hashed password (NULL for OAuth-only users) |
| `meomeo_score` | INTEGER | NOT NULL DEFAULT 0 | Total number of stories created |
| `theme_preference` | TEXT | DEFAULT 'default' | Selected theme name |
| `google_id` | TEXT | NULL UNIQUE | Google OAuth user ID (sub claim from ID token) |
| `google_email` | TEXT | NULL | Google account email address |
| `refresh_token` | TEXT | NULL | Hashed refresh token for OAuth users |
| `refresh_token_expires_at` | TEXT | NULL | Refresh token expiration timestamp |
| `created_at` | TEXT | NOT NULL DEFAULT (datetime('now')) | Account creation timestamp |
| `updated_at` | TEXT | NOT NULL DEFAULT (datetime('now')) | Last update timestamp |

**New Indexes**:
- `idx_users_google_id` on `google_id` (for OAuth user lookups)
- `idx_users_google_email` on `google_email` (for email-based account linking)

**Updated Relationships**:
- One-to-many with `stories` (unchanged)
- One-to-one with Google OAuth identity (via `google_id`)

**Validation Rules**:
- Username must be unique (existing)
- Username cannot be empty (existing)
- `google_id` must be unique if not NULL
- `google_email` must be valid email format if not NULL
- `refresh_token` must be hashed using bcrypt (same as password_hash)
- `refresh_token_expires_at` must be future timestamp if refresh_token is not NULL
- Either `password_hash` OR `google_id` must be present (user must have at least one auth method)
- `google_id` and `google_email` should both be set or both be NULL (consistency)

### Onboarding Sessions Table (Optional)

**Decision**: Store onboarding sessions in users table with temporary columns, or create separate table.

**Option 1: Users Table Columns (Recommended)**
- Add temporary columns: `onboarding_username`, `onboarding_color`, `onboarding_expires_at`
- Simpler, no new table
- Clean up after onboarding completion

**Option 2: Separate Table**
- Create `onboarding_sessions` table
- More normalized, but adds complexity
- Better for tracking multiple incomplete sessions

**Chosen**: Option 1 - Use users table with temporary columns for simplicity.

**Temporary Columns** (added during onboarding, removed after completion):

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `onboarding_username` | TEXT | NULL | Pending username selection |
| `onboarding_color` | TEXT | NULL | Pending background color selection |
| `onboarding_expires_at` | TEXT | NULL | Onboarding session expiration |

**Note**: These columns are temporary and should be NULL after onboarding is complete.

## Entity Relationships

```
users (1) ──────< (many) stories
  │
  └── (1:1) Google OAuth Identity (google_id, google_email)
```

- One user can have one Google OAuth identity
- One user can create many stories (unchanged)
- Users can authenticate via password OR Google OAuth (or both after linking)

## Data Access Patterns

### User Queries (New)

1. **Find User by Google ID**: 
   ```sql
   SELECT * FROM users WHERE google_id = ?
   ```

2. **Find User by Google Email**:
   ```sql
   SELECT * FROM users WHERE google_email = ?
   ```

3. **Link Google Account to Existing User**:
   ```sql
   UPDATE users 
   SET google_id = ?, google_email = ?, updated_at = datetime('now')
   WHERE id = ?
   ```

4. **Create OAuth User**:
   ```sql
   INSERT INTO users (username, google_id, google_email, avatar_bg_color, refresh_token, refresh_token_expires_at)
   VALUES (?, ?, ?, ?, ?, ?)
   ```

5. **Store Refresh Token**:
   ```sql
   UPDATE users 
   SET refresh_token = ?, refresh_token_expires_at = ?, updated_at = datetime('now')
   WHERE id = ?
   ```

6. **Validate Refresh Token**:
   ```sql
   SELECT id, username, refresh_token, refresh_token_expires_at 
   FROM users 
   WHERE id = ? AND refresh_token_expires_at > datetime('now')
   ```

7. **Invalidate Refresh Token (Logout)**:
   ```sql
   UPDATE users 
   SET refresh_token = NULL, refresh_token_expires_at = NULL, updated_at = datetime('now')
   WHERE id = ?
   ```

8. **Check Username Availability**:
   ```sql
   SELECT COUNT(*) FROM users WHERE username = ?
   ```

9. **Resume Onboarding Session**:
   ```sql
   SELECT id, onboarding_username, onboarding_color, onboarding_expires_at
   FROM users
   WHERE google_id = ? AND onboarding_expires_at > datetime('now')
   ```

10. **Complete Onboarding**:
    ```sql
    UPDATE users
    SET username = ?, avatar_bg_color = ?,
        onboarding_username = NULL, onboarding_color = NULL, onboarding_expires_at = NULL,
        updated_at = datetime('now')
    WHERE id = ?
    ```

### Existing Queries (Updated)

1. **Login Lookup** (now supports both methods):
   ```sql
   -- Username/password login
   SELECT * FROM users WHERE username = ? AND password_hash IS NOT NULL
   
   -- Google OAuth login (by google_id)
   SELECT * FROM users WHERE google_id = ?
   ```

## Migration Strategy

**Migration File**: `005_add_google_oauth.sql`

```sql
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

-- Make password_hash nullable (OAuth users don't have passwords)
-- Note: SQLite doesn't support ALTER COLUMN, so this is handled at application level
-- Existing NOT NULL constraint remains, but we allow NULL values in practice
```

**Migration Notes**:
- SQLite doesn't support `ALTER COLUMN` to change NULL constraints
- `password_hash` NULL handling is enforced at application level
- Unique constraint on `google_id` enforced via unique index (SQLite 3.8.0+)
- Onboarding columns are temporary and can be cleaned up after migration period

## Data Integrity

### Constraints

1. **Username Uniqueness**: Enforced by UNIQUE constraint (existing)
2. **Google ID Uniqueness**: Enforced by unique index (new)
3. **Refresh Token Expiration**: Validated at application level (check `refresh_token_expires_at > now()`)
4. **Onboarding Expiration**: Validated at application level (check `onboarding_expires_at > now()`)
5. **Email Format**: Validated at application level (regex or email validation library)
6. **Auth Method Requirement**: Enforced at application level (either `password_hash` OR `google_id` must be present)

### Data Validation Rules

1. **Google ID**: Must be non-empty string if not NULL, must be unique
2. **Google Email**: Must be valid email format if not NULL
3. **Refresh Token**: Must be hashed using bcrypt before storage
4. **Refresh Token Expiration**: Must be future timestamp (30 days from creation)
5. **Onboarding Expiration**: Must be future timestamp (24 hours from creation)
6. **Username**: Must be unique, non-empty (existing rules)
7. **Background Color**: Must be valid hex color from predefined palette (existing rules)

## State Transitions

### User Account States

1. **New OAuth User (Onboarding)**:
   - `google_id` and `google_email` set
   - `username` is NULL or temporary
   - `onboarding_username`, `onboarding_color`, `onboarding_expires_at` set
   - `refresh_token` and `refresh_token_expires_at` set

2. **Completed Onboarding**:
   - `username` set (unique)
   - `avatar_bg_color` set
   - `onboarding_*` columns cleared (set to NULL)
   - `refresh_token` and `refresh_token_expires_at` remain

3. **Linked Account** (existing user adds Google):
   - Existing `username` and `password_hash` remain
   - `google_id` and `google_email` added
   - `refresh_token` and `refresh_token_expires_at` set

4. **OAuth-Only User**:
   - `google_id` and `google_email` set
   - `username` set (from onboarding)
   - `password_hash` is NULL
   - `refresh_token` and `refresh_token_expires_at` set

5. **Logged Out**:
   - `refresh_token` and `refresh_token_expires_at` cleared (set to NULL)
   - Other user data remains unchanged

## Performance Considerations

1. **Indexes**: 
   - `idx_users_google_id` for fast OAuth user lookups
   - `idx_users_google_email` for email-based account linking
   - Existing `idx_users_username` for username lookups

2. **Query Optimization**:
   - Use indexed columns (`google_id`, `google_email`, `username`) in WHERE clauses
   - Limit result sets with appropriate WHERE conditions
   - Use parameterized queries to prevent SQL injection

3. **Token Validation**:
   - Check expiration before database query (application level)
   - Cache Google public keys for token verification
   - Batch token refresh operations when possible

4. **Onboarding Cleanup**:
   - Periodically clean up expired onboarding sessions
   - Remove `onboarding_*` columns after successful onboarding
   - Archive or delete old refresh tokens after expiration

## Security Considerations

1. **Refresh Token Storage**: 
   - Hash tokens using bcrypt (same algorithm as passwords)
   - Never store plaintext refresh tokens
   - Use secure random token generation (crypto.randomBytes)

2. **Token Expiration**:
   - Enforce expiration at both database and application level
   - Check expiration before accepting refresh tokens
   - Invalidate tokens on logout or security events

3. **Data Privacy**:
   - Google email stored for account linking only
   - Don't expose Google ID in API responses
   - Protect refresh tokens from exposure in logs or errors

4. **Account Linking**:
   - Verify email ownership before linking accounts
   - Require explicit user consent for account linking
   - Log account linking events for security auditing
