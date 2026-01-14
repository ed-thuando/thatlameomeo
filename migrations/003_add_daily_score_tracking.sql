-- Create daily_score_history table to track score changes over time
CREATE TABLE IF NOT EXISTS daily_score_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_score_history_user_id ON daily_score_history(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_score_history_date ON daily_score_history(date);
CREATE INDEX IF NOT EXISTS idx_daily_score_history_user_date ON daily_score_history(user_id, date);
