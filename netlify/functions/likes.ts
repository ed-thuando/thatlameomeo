import { Handler } from '@netlify/functions'
import { getDbClient, closeDbClient } from './utils/db'
import {
  extractTokenFromHeader,
  verifyToken,
} from './utils/auth'
import { createErrorResponse, createSuccessResponse, handleCors } from './utils/errors'
import { calculateDailyScore } from './utils/scores'

interface LikeRequest {
  story_id: number
}

/**
 * POST /likes - Like a story
 */
async function handleLikeStory(
  event: { body: string | null; headers: Record<string, string | null> }
): Promise<Response> {
  if (!event.body) {
    return createErrorResponse(400, 'Request body is required', 'BadRequest')
  }

  const { story_id }: LikeRequest = JSON.parse(event.body)

  if (!story_id) {
    return createErrorResponse(400, 'story_id is required', 'BadRequest')
  }

  // Authenticate user
  const authHeader = event.headers.authorization || event.headers.Authorization
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return createErrorResponse(401, 'Authentication required', 'Unauthorized')
  }

  let userId: number
  try {
    const payload = verifyToken(token)
    userId = payload.userId
  } catch (error) {
    return createErrorResponse(401, 'Invalid or expired token', 'Unauthorized')
  }

  const db = getDbClient()

  try {
    // Check if story exists and get author
    const storyResult = await db.execute({
      sql: 'SELECT user_id FROM stories WHERE id = ?',
      args: [story_id],
    })

    if (storyResult.rows.length === 0) {
      closeDbClient()
      return createErrorResponse(404, 'Story not found', 'NotFound')
    }

    const storyAuthorId = storyResult.rows[0].user_id as number

    // Check if already liked
    const existingLike = await db.execute({
      sql: 'SELECT id FROM likes WHERE user_id = ? AND story_id = ?',
      args: [userId, story_id],
    })

    if (existingLike.rows.length > 0) {
      closeDbClient()
      return createErrorResponse(400, 'Story already liked', 'BadRequest')
    }

    // Insert like
    await db.execute({
      sql: 'INSERT INTO likes (user_id, story_id) VALUES (?, ?)',
      args: [userId, story_id],
    })

    // Get updated like count
    const likeCountResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM likes WHERE story_id = ?',
      args: [story_id],
    })
    const likeCount = (likeCountResult.rows[0]?.count as number) || 0

    // Calculate daily score for story author
    const dailyScore = await calculateDailyScore(storyAuthorId)

    closeDbClient()

    return createSuccessResponse({
      isLiked: true,
      likeCount,
      daily_meomeo_score: dailyScore,
      updated_user_id: storyAuthorId,
    })
  } catch (error) {
    closeDbClient()
    console.error('Error liking story:', error)
    return createErrorResponse(
      500,
      'Internal server error',
      'InternalServerError'
    )
  }
}

/**
 * DELETE /likes - Unlike a story
 */
async function handleUnlikeStory(
  event: {
    queryStringParameters: Record<string, string | null> | null
    headers: Record<string, string | null>
  }
): Promise<Response> {
  const storyId = event.queryStringParameters?.story_id

  if (!storyId) {
    return createErrorResponse(400, 'story_id query parameter is required', 'BadRequest')
  }

  // Authenticate user
  const authHeader = event.headers.authorization || event.headers.Authorization
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return createErrorResponse(401, 'Authentication required', 'Unauthorized')
  }

  let userId: number
  try {
    const payload = verifyToken(token)
    userId = payload.userId
  } catch (error) {
    return createErrorResponse(401, 'Invalid or expired token', 'Unauthorized')
  }

  const db = getDbClient()

  try {
    // Get story author before deleting like
    const storyResult = await db.execute({
      sql: 'SELECT user_id FROM stories WHERE id = ?',
      args: [storyId],
    })

    if (storyResult.rows.length === 0) {
      closeDbClient()
      return createErrorResponse(404, 'Story not found', 'NotFound')
    }

    const storyAuthorId = storyResult.rows[0].user_id as number

    // Delete like
    await db.execute({
      sql: 'DELETE FROM likes WHERE user_id = ? AND story_id = ?',
      args: [userId, storyId],
    })

    // Get updated like count
    const likeCountResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM likes WHERE story_id = ?',
      args: [storyId],
    })
    const likeCount = (likeCountResult.rows[0]?.count as number) || 0

    // Calculate daily score for story author
    const dailyScore = await calculateDailyScore(storyAuthorId)

    closeDbClient()

    return createSuccessResponse({
      isLiked: false,
      likeCount,
      daily_meomeo_score: dailyScore,
      updated_user_id: storyAuthorId,
    })
  } catch (error) {
    closeDbClient()
    console.error('Error unliking story:', error)
    return createErrorResponse(
      500,
      'Internal server error',
      'InternalServerError'
    )
  }
}

/**
 * GET /likes - Check like status and get like count
 */
async function handleGetLikeStatus(
  event: {
    queryStringParameters: Record<string, string | null> | null
    headers: Record<string, string | null>
  }
): Promise<Response> {
  const storyId = event.queryStringParameters?.story_id

  if (!storyId) {
    return createErrorResponse(400, 'story_id query parameter is required', 'BadRequest')
  }

  // Authenticate user
  const authHeader = event.headers.authorization || event.headers.Authorization
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return createErrorResponse(401, 'Authentication required', 'Unauthorized')
  }

  let userId: number
  try {
    const payload = verifyToken(token)
    userId = payload.userId
  } catch (error) {
    return createErrorResponse(401, 'Invalid or expired token', 'Unauthorized')
  }

  const db = getDbClient()

  try {
    // Check if user has liked this story
    const likeResult = await db.execute({
      sql: 'SELECT id FROM likes WHERE user_id = ? AND story_id = ?',
      args: [userId, storyId],
    })

    const isLiked = likeResult.rows.length > 0

    // Get total like count
    const likeCountResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM likes WHERE story_id = ?',
      args: [storyId],
    })
    const likeCount = (likeCountResult.rows[0]?.count as number) || 0

    closeDbClient()

    return createSuccessResponse({
      isLiked,
      likeCount,
    })
  } catch (error) {
    closeDbClient()
    console.error('Error checking like status:', error)
    return createErrorResponse(
      500,
      'Internal server error',
      'InternalServerError'
    )
  }
}

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCors()
  }

  // Route to appropriate handler
  if (event.httpMethod === 'POST') {
    return handleLikeStory(event)
  }

  if (event.httpMethod === 'DELETE') {
    return handleUnlikeStory(event)
  }

  if (event.httpMethod === 'GET') {
    return handleGetLikeStatus(event)
  }

  return createErrorResponse(404, 'Not found', 'NotFound')
}
