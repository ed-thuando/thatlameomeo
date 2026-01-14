import { getDbClient } from './db'

/**
 * Calculate daily MeoMeo score for a user
 * Daily score = posts created today + likes received today + comments received today
 */
export async function calculateDailyScore(userId: number): Promise<number> {
  const db = getDbClient()
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format

  // Count posts created today
  const postsResult = await db.execute({
    sql: `
      SELECT COUNT(*) as count
      FROM stories
      WHERE user_id = ? AND DATE(created_at) = ?
    `,
    args: [userId, today],
  })
  const postsCount = (postsResult.rows[0]?.count as number) || 0

  // Count likes received today (on user's stories)
  const likesResult = await db.execute({
    sql: `
      SELECT COUNT(*) as count
      FROM likes l
      INNER JOIN stories s ON l.story_id = s.id
      WHERE s.user_id = ? AND DATE(l.created_at) = ?
    `,
    args: [userId, today],
  })
  const likesCount = (likesResult.rows[0]?.count as number) || 0

  // Count comments received today (on user's stories)
  const commentsResult = await db.execute({
    sql: `
      SELECT COUNT(*) as count
      FROM comments c
      INNER JOIN stories s ON c.story_id = s.id
      WHERE s.user_id = ? AND DATE(c.created_at) = ?
    `,
    args: [userId, today],
  })
  const commentsCount = (commentsResult.rows[0]?.count as number) || 0

  const totalScore = postsCount + likesCount + commentsCount

  // Record score change with timestamp
  await recordDailyScore(userId, totalScore, today)

  return totalScore
}

/**
 * Record daily score with timestamp for historical tracking
 */
async function recordDailyScore(userId: number, score: number, date: string): Promise<void> {
  const db = getDbClient()
  
  try {
    // Insert or update the daily score record
    await db.execute({
      sql: `
        INSERT INTO daily_score_history (user_id, score, date, created_at)
        VALUES (?, ?, ?, datetime('now'))
        ON CONFLICT(user_id, date) DO UPDATE SET
          score = ?,
          created_at = datetime('now')
      `,
      args: [userId, score, date, score],
    })
  } catch (error) {
    // Silently fail if table doesn't exist yet (migration not run)
    // This allows the system to work before migration is applied
    console.error('Error recording daily score:', error)
  }
}
