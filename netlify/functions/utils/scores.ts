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

  return postsCount + likesCount + commentsCount
}
