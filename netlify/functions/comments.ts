import { Handler } from '@netlify/functions'
import { getDbClient, closeDbClient } from './utils/db'
import {
  extractTokenFromHeader,
  verifyToken,
} from './utils/auth'
import { createErrorResponse, createSuccessResponse, handleCors } from './utils/errors'
import { calculateDailyScore } from './utils/scores'

interface CreateCommentRequest {
  story_id: number
  content: string
}

interface Comment {
  id: number
  user_id: number
  story_id: number
  content: string
  created_at: string
  updated_at: string
}

/**
 * POST /comments - Create a comment
 */
async function handleCreateComment(
  event: { body: string | null; headers: Record<string, string | null> }
): Promise<Response> {
  if (!event.body) {
    return createErrorResponse(400, 'Request body is required', 'BadRequest')
  }

  const { story_id, content }: CreateCommentRequest = JSON.parse(event.body)

  if (!story_id) {
    return createErrorResponse(400, 'story_id is required', 'BadRequest')
  }

  if (!content || !content.trim()) {
    return createErrorResponse(400, 'Content is required and cannot be empty', 'BadRequest')
  }

  if (content.length > 2000) {
    return createErrorResponse(400, 'Content must be 2000 characters or less', 'BadRequest')
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

    // Insert comment
    const result = await db.execute({
      sql: `
        INSERT INTO comments (user_id, story_id, content)
        VALUES (?, ?, ?)
        RETURNING id, user_id, story_id, content, created_at, updated_at
      `,
      args: [userId, story_id, content.trim()],
    })

    if (result.rows.length === 0) {
      closeDbClient()
      return createErrorResponse(
        500,
        'Failed to create comment',
        'InternalServerError'
      )
    }

    const comment = result.rows[0] as Comment

    // Get updated comment count
    const commentCountResult = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM comments WHERE story_id = ?',
      args: [story_id],
    })
    const commentCount = (commentCountResult.rows[0]?.count as number) || 0

    // Calculate daily score for story author
    const dailyScore = await calculateDailyScore(storyAuthorId)

    closeDbClient()

    return createSuccessResponse(
      {
        ...comment,
        commentCount,
        daily_meomeo_score: dailyScore,
        updated_user_id: storyAuthorId,
      },
      201
    )
  } catch (error) {
    closeDbClient()
    console.error('Error creating comment:', error)
    return createErrorResponse(
      500,
      'Internal server error',
      'InternalServerError'
    )
  }
}

/**
 * GET /comments - Get comments for a story
 */
async function handleGetComments(
  event: {
    queryStringParameters: Record<string, string | null> | null
    headers: Record<string, string | null>
  }
): Promise<Response> {
  const storyId = event.queryStringParameters?.story_id

  if (!storyId) {
    return createErrorResponse(400, 'story_id query parameter is required', 'BadRequest')
  }

  // Authenticate user (optional for public stories)
  const authHeader = event.headers.authorization || event.headers.Authorization
  const token = extractTokenFromHeader(authHeader)

  // If token provided, verify it
  if (token) {
    try {
      verifyToken(token)
    } catch (error) {
      // Continue without auth for public viewing
    }
  }

  const db = getDbClient()

  try {
    // Get comments with user info
    const commentsResult = await db.execute({
      sql: `
        SELECT c.id, c.user_id, c.story_id, c.content, c.created_at, c.updated_at,
               u.username
        FROM comments c
        INNER JOIN users u ON c.user_id = u.id
        WHERE c.story_id = ?
        ORDER BY c.created_at ASC
      `,
      args: [storyId],
    })

    // Get total count
    const countResult = await db.execute({
      sql: 'SELECT COUNT(*) as total FROM comments WHERE story_id = ?',
      args: [storyId],
    })
    const total = (countResult.rows[0]?.total as number) || 0

    closeDbClient()

    return createSuccessResponse({
      comments: commentsResult.rows,
      total,
    })
  } catch (error) {
    closeDbClient()
    console.error('Error fetching comments:', error)
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
    return handleCreateComment(event)
  }

  if (event.httpMethod === 'GET') {
    return handleGetComments(event)
  }

  return createErrorResponse(404, 'Not found', 'NotFound')
}
