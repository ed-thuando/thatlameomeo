# Data Model: Thatlameomeo Story Sharing App

**Date**: 2025-01-27  
**Feature**: 001-meomeo-stories

## Database Schema

### Users Table

Represents authenticated users of the application. Users are created by administrators with credentials.

**Table**: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique user identifier |
| `username` | TEXT | NOT NULL UNIQUE | Login username (provided by admin) |
| `password_hash` | TEXT | NOT NULL | Hashed password (bcrypt or similar) |
| `meomeo_score` | INTEGER | NOT NULL DEFAULT 0 | Total number of stories created |
| `theme_preference` | TEXT | DEFAULT 'default' | Selected theme name |
| `created_at` | TEXT | NOT NULL DEFAULT (datetime('now')) | Account creation timestamp |
| `updated_at` | TEXT | NOT NULL DEFAULT (datetime('now')) | Last update timestamp |

**Indexes**:
- `idx_users_username` on `username` (for login lookups)
- `idx_users_meomeo_score` on `meomeo_score` (for ranking queries)

**Relationships**:
- One-to-many with `stories` (one user has many stories)

**Validation Rules**:
- Username must be unique
- Username cannot be empty
- MeoMeo score cannot be negative
- Theme preference must be one of: 'default', 'orange-cat', 'gray-cat', 'calico-cat' (or similar)

### Stories Table

Represents user-created stories/notes about their day, thoughts, or emotions.

**Table**: `stories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique story identifier |
| `user_id` | INTEGER | NOT NULL REFERENCES users(id) ON DELETE CASCADE | Story author |
| `content` | TEXT | NOT NULL | Story text content |
| `visibility` | TEXT | NOT NULL DEFAULT 'public' | 'public' or 'private' |
| `created_at` | TEXT | NOT NULL DEFAULT (datetime('now')) | Story creation timestamp |
| `updated_at` | TEXT | NOT NULL DEFAULT (datetime('now')) | Last update timestamp |

**Indexes**:
- `idx_stories_user_id` on `user_id` (for user's stories queries)
- `idx_stories_visibility_created` on `visibility, created_at DESC` (for public feed queries)
- `idx_stories_created_at` on `created_at DESC` (for chronological ordering)

**Relationships**:
- Many-to-one with `users` (many stories belong to one user)

**Validation Rules**:
- Content cannot be empty (enforced at API level)
- Content should have maximum length (e.g., 5000 characters) - enforced at API level
- Visibility must be either 'public' or 'private'
- User ID must reference existing user

**State Transitions**:
- Story created: `visibility` set to 'public' or 'private' at creation
- Story updated: Only content can be updated (visibility change not in MVP scope)
- Story deleted: Cascade delete handled by foreign key (if implemented)

## Entity Relationships

```
users (1) ──────< (many) stories
```

- One user can create many stories
- Each story belongs to exactly one user
- When a user is deleted, all their stories are deleted (CASCADE)

## Data Access Patterns

### User Queries

1. **Login Lookup**: `SELECT * FROM users WHERE username = ?`
2. **Get User by ID**: `SELECT id, username, meomeo_score, theme_preference FROM users WHERE id = ?`
3. **Get All Users with Scores**: `SELECT id, username, meomeo_score FROM users ORDER BY meomeo_score DESC`
4. **Update MeoMeo Score**: `UPDATE users SET meomeo_score = meomeo_score + 1 WHERE id = ?`
5. **Update Theme Preference**: `UPDATE users SET theme_preference = ?, updated_at = datetime('now') WHERE id = ?`

### Story Queries

1. **Create Story**: `INSERT INTO stories (user_id, content, visibility) VALUES (?, ?, ?)`
2. **Get Public Stories**: `SELECT s.*, u.username FROM stories s JOIN users u ON s.user_id = u.id WHERE s.visibility = 'public' ORDER BY s.created_at DESC LIMIT ?`
3. **Get User's Stories**: `SELECT * FROM stories WHERE user_id = ? ORDER BY created_at DESC`
4. **Get User's Public Stories**: `SELECT * FROM stories WHERE user_id = ? AND visibility = 'public' ORDER BY created_at DESC`
5. **Get Story by ID**: `SELECT s.*, u.username FROM stories s JOIN users u ON s.user_id = u.id WHERE s.id = ?`
6. **Count User Stories**: `SELECT COUNT(*) FROM stories WHERE user_id = ?`

## Migration Strategy

**Initial Migration** (`001_initial_schema.sql`):

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    meomeo_score INTEGER NOT NULL DEFAULT 0,
    theme_preference TEXT DEFAULT 'default',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_meomeo_score ON users(meomeo_score);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'public' CHECK(visibility IN ('public', 'private')),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_stories_user_id ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_visibility_created ON stories(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_created_at ON stories(created_at DESC);
```

## Data Integrity

- Foreign key constraints ensure story user_id references valid user
- CASCADE delete ensures orphaned stories don't exist
- CHECK constraint on visibility ensures only valid values
- UNIQUE constraint on username prevents duplicate accounts
- Default values ensure required fields always have values

## Performance Considerations

- Indexes on frequently queried columns (username, user_id, visibility + created_at)
- Composite index on (visibility, created_at) for efficient public feed queries
- LIMIT clauses for pagination in feed queries
- No full-text search needed for MVP (can add later if needed)
