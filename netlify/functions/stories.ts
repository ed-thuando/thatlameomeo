import { Handler } from '@netlify/functions'
import { getDbClient, closeDbClient } from './utils/db'
import {
  extractTokenFromHeader,
  verifyToken,
} from './utils/auth'
import { createErrorResponse, createSuccessResponse, handleCors } from './utils/errors'
import { calculateDailyScore } from './utils/scores'

interface CreateStoryRequest {
  content: string
  visibility: 'public' | 'private'
}

interface Story {
  id: number
  user_id: number
  content: string
  visibility: string
  created_at: string
  updated_at: string
}

/**
 * POST /stories - Create a new story
 */
async function handleCreateStory(
  event: { body: string | null; headers: Record<string, string | null> }
): Promise<Response> {
  // Parse request body
  if (!event.body) {
    return createErrorResponse(400, 'Request body is required', 'BadRequest')
  }

  const { content, visibility }: CreateStoryRequest = JSON.parse(event.body)

  // Validate input
  if (!content || !content.trim()) {
    return createErrorResponse(
      400,
      'Content is required and cannot be empty',
      'BadRequest'
    )
  }

  if (content.length > 5000) {
    return createErrorResponse(
      400,
      'Content must be 5000 characters or less',
      'BadRequest'
    )
  }

  if (visibility !== 'public' && visibility !== 'private') {
    return createErrorResponse(
      400,
      'Visibility must be "public" or "private"',
      'BadRequest'
    )
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

  // Insert story into database
  const db = getDbClient()

  try {
    const result = await db.execute({
      sql: `
        INSERT INTO stories (user_id, content, visibility)
        VALUES (?, ?, ?)
        RETURNING id, user_id, content, visibility, created_at, updated_at
      `,
      args: [userId, content.trim(), visibility],
    })

    if (result.rows.length === 0) {
      closeDbClient()
      return createErrorResponse(
        500,
        'Failed to create story',
        'InternalServerError'
      )
    }

    const story = result.rows[0] as Story

    // Calculate daily MeoMeo score
    const dailyScore = await calculateDailyScore(userId)

    closeDbClient()

    return createSuccessResponse(
      {
        ...story,
        meomeo_score: dailyScore,
        daily_meomeo_score: dailyScore,
        updated_user_id: userId,
      },
      201
    )
  } catch (error) {
    closeDbClient()
    console.error('Error creating story:', error)
    return createErrorResponse(
      500,
      'Internal server error',
      'InternalServerError'
    )
  }
}

/**
 * GET /stories - Get public stories with pagination
 */
async function handleGetPublicStories(
  event: {
    queryStringParameters: Record<string, string | null> | null
    headers: Record<string, string | null>
  }
): Promise<Response> {
  // Authenticate user
  const authHeader = event.headers.authorization || event.headers.Authorization
  const token = extractTokenFromHeader(authHeader)

  if (!token) {
    return createErrorResponse(401, 'Authentication required', 'Unauthorized')
  }

  try {
    verifyToken(token)
  } catch (error) {
    return createErrorResponse(401, 'Invalid or expired token', 'Unauthorized')
  }

  // Parse query parameters
  const limit = Math.min(
    parseInt(event.queryStringParameters?.limit || '20', 10),
    100
  )
  const offset = parseInt(event.queryStringParameters?.offset || '0', 10)

  const db = getDbClient()

  try {
    // Get public stories (exclude archived)
    // Try to select avatar_bg_color, but handle case where column might not exist yet
    let storiesResult
    try {
      storiesResult = await db.execute({
        sql: `
          SELECT s.id, s.user_id, s.content, s.visibility, s.created_at, s.updated_at,
                 u.username, u.display_name, u.avatar_url, u.avatar_bg_color,
                 (SELECT COUNT(*) FROM likes WHERE story_id = s.id) as like_count,
                 (SELECT COUNT(*) FROM comments WHERE story_id = s.id) as comment_count
          FROM stories s
          INNER JOIN users u ON s.user_id = u.id
          WHERE s.visibility = 'public' AND (s.archived = 0 OR s.archived IS NULL)
          ORDER BY s.created_at DESC
          LIMIT ? OFFSET ?
        `,
        args: [limit, offset],
      })
    } catch (error: any) {
      // If column doesn't exist, select without it
      if (error?.message?.includes('no such column: avatar_bg_color')) {
        storiesResult = await db.execute({
          sql: `
            SELECT s.id, s.user_id, s.content, s.visibility, s.created_at, s.updated_at,
                   u.username, u.display_name, u.avatar_url,
                   (SELECT COUNT(*) FROM likes WHERE story_id = s.id) as like_count,
                   (SELECT COUNT(*) FROM comments WHERE story_id = s.id) as comment_count
            FROM stories s
            INNER JOIN users u ON s.user_id = u.id
            WHERE s.visibility = 'public' AND (s.archived = 0 OR s.archived IS NULL)
            ORDER BY s.created_at DESC
            LIMIT ? OFFSET ?
          `,
          args: [limit, offset],
        })
      } else {
        throw error
      }
    }

    // Get total count (exclude archived)
    const countResult = await db.execute({
      sql: `
        SELECT COUNT(*) as total
        FROM stories
        WHERE visibility = 'public' AND (archived = 0 OR archived IS NULL)
      `,
      args: [],
    })

    const total = (countResult.rows[0]?.total as number) || 0

    closeDbClient()

    return createSuccessResponse({
      stories: storiesResult.rows,
      total,
      limit,
      offset,
    })
  } catch (error) {
    closeDbClient()
    console.error('Error fetching public stories:', error)
    return createErrorResponse(
      500,
      'Internal server error',
      'InternalServerError'
    )
  }
}

/**
 * GET /stories/:id - Get a specific story by ID
 */
async function handleGetStoryById(
  event: {
    path: string
    headers: Record<string, string | null>
  }
): Promise<Response> {
  // Extract story ID from path
  const pathParts = event.path.split('/')
  const storyId = pathParts[pathParts.length - 1]

  if (!storyId || isNaN(Number(storyId))) {
    return createErrorResponse(400, 'Invalid story ID', 'BadRequest')
  }

  // Authenticate user (optional for public stories)
  const authHeader = event.headers.authorization || event.headers.Authorization
  const token = extractTokenFromHeader(authHeader)

  let userId: number | null = null
  if (token) {
    try {
      const payload = verifyToken(token)
      userId = payload.userId
    } catch (error) {
      // Continue without auth for public viewing
    }
  }

  const db = getDbClient()

  try {
    // Get story with user info
    // Try to select avatar_bg_color, but handle case where column might not exist yet
    let storyResult
    try {
      storyResult = await db.execute({
        sql: `
          SELECT s.id, s.user_id, s.content, s.visibility, s.created_at, s.updated_at,
                 u.username, u.display_name, u.avatar_url, u.avatar_bg_color,
                 (SELECT COUNT(*) FROM likes WHERE story_id = s.id) as like_count,
                 (SELECT COUNT(*) FROM comments WHERE story_id = s.id) as comment_count
          FROM stories s
          INNER JOIN users u ON s.user_id = u.id
          WHERE s.id = ?
        `,
        args: [storyId],
      })
    } catch (error: any) {
      // If column doesn't exist, select without it
      if (error?.message?.includes('no such column: avatar_bg_color')) {
        storyResult = await db.execute({
          sql: `
            SELECT s.id, s.user_id, s.content, s.visibility, s.created_at, s.updated_at,
                   u.username, u.display_name, u.avatar_url,
                   (SELECT COUNT(*) FROM likes WHERE story_id = s.id) as like_count,
                   (SELECT COUNT(*) FROM comments WHERE story_id = s.id) as comment_count
            FROM stories s
            INNER JOIN users u ON s.user_id = u.id
            WHERE s.id = ?
          `,
          args: [storyId],
        })
      } else {
        throw error
      }
    }

    if (storyResult.rows.length === 0) {
      closeDbClient()
      return createErrorResponse(404, 'Story not found', 'NotFound')
    }

    const story = storyResult.rows[0] as Story & {
      username: string
      display_name: string | null
      like_count: number
      comment_count: number
    }

    // Check visibility - private stories only visible to owner
    if (story.visibility === 'private' && userId !== story.user_id) {
      closeDbClient()
      return createErrorResponse(403, 'Access denied', 'Forbidden')
    }

    closeDbClient()

    return createSuccessResponse({
      ...story,
      display_name: story.display_name || story.username,
    })
  } catch (error) {
    closeDbClient()
    console.error('Error fetching story:', error)
    return createErrorResponse(
      500,
      'Internal server error',
      'InternalServerError'
    )
  }
}

/**
 * GET /stories/me - Get current user's stories
 */
async function handleGetUserStories(
  event: {
    headers: Record<string, string | null>
  }
): Promise<Response> {
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
    // Get user's stories (both public and private) with user info
    // Try to select avatar_bg_color, but handle case where column might not exist yet
    let storiesResult
    try {
      storiesResult = await db.execute({
        sql: `
          SELECT s.id, s.user_id, s.content, s.visibility, s.created_at, s.updated_at,
                 s.archived,
                 u.username, u.display_name, u.avatar_url, u.avatar_bg_color,
                 (SELECT COUNT(*) FROM likes WHERE story_id = s.id) as like_count,
                 (SELECT COUNT(*) FROM comments WHERE story_id = s.id) as comment_count
          FROM stories s
          INNER JOIN users u ON s.user_id = u.id
          WHERE s.user_id = ?
          ORDER BY s.created_at DESC
        `,
        args: [userId],
      })
    } catch (error: any) {
      // If column doesn't exist, select without it
      if (error?.message?.includes('no such column: avatar_bg_color')) {
        storiesResult = await db.execute({
          sql: `
            SELECT s.id, s.user_id, s.content, s.visibility, s.created_at, s.updated_at,
                   s.archived,
                   u.username, u.display_name, u.avatar_url,
                   (SELECT COUNT(*) FROM likes WHERE story_id = s.id) as like_count,
                   (SELECT COUNT(*) FROM comments WHERE story_id = s.id) as comment_count
            FROM stories s
            INNER JOIN users u ON s.user_id = u.id
            WHERE s.user_id = ?
            ORDER BY s.created_at DESC
          `,
          args: [userId],
        })
      } else {
        throw error
      }
    }

    closeDbClient()

    return createSuccessResponse({
      stories: storiesResult.rows,
    })
  } catch (error) {
    closeDbClient()
    console.error('Error fetching user stories:', error)
    return createErrorResponse(
      500,
      'Internal server error',
      'InternalServerError'
    )
  }
}

/**
 * PUT /stories/:id - Update a story (visibility)
 */
async function handleUpdateStory(
  event: {
    path: string
    body: string | null
    headers: Record<string, string | null>
  }
): Promise<Response> {
  // Extract story ID from path
  const pathParts = event.path.split('/')
  const storyId = pathParts[pathParts.length - 1]

  if (!storyId || isNaN(Number(storyId))) {
    return createErrorResponse(400, 'Invalid story ID', 'BadRequest')
  }

  if (!event.body) {
    return createErrorResponse(400, 'Request body is required', 'BadRequest')
  }

  const { visibility }: { visibility?: string } = JSON.parse(event.body)

  if (!visibility || (visibility !== 'public' && visibility !== 'private')) {
    return createErrorResponse(
      400,
      'Visibility must be "public" or "private"',
      'BadRequest'
    )
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
    // Verify story belongs to user
    const storyResult = await db.execute({
      sql: 'SELECT user_id FROM stories WHERE id = ?',
      args: [storyId],
    })

    if (storyResult.rows.length === 0) {
      closeDbClient()
      return createErrorResponse(404, 'Story not found', 'NotFound')
    }

    if (storyResult.rows[0].user_id !== userId) {
      closeDbClient()
      return createErrorResponse(403, 'Access denied', 'Forbidden')
    }

    // Update visibility
    await db.execute({
      sql: 'UPDATE stories SET visibility = ?, updated_at = datetime("now") WHERE id = ?',
      args: [visibility, storyId],
    })

    closeDbClient()

    return createSuccessResponse({ message: 'Story updated successfully' })
  } catch (error) {
    closeDbClient()
    console.error('Error updating story:', error)
    return createErrorResponse(
      500,
      'Internal server error',
      'InternalServerError'
    )
  }
}

/**
 * PUT /stories/:id/archive - Archive a story
 */
async function handleArchiveStory(
  event: {
    path: string
    headers: Record<string, string | null>
  }
): Promise<Response> {
  // Extract story ID from path
  const pathParts = event.path.split('/')
  const storyId = pathParts[pathParts.length - 2] // /stories/:id/archive

  if (!storyId || isNaN(Number(storyId))) {
    return createErrorResponse(400, 'Invalid story ID', 'BadRequest')
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
    // Verify story belongs to user
    const storyResult = await db.execute({
      sql: 'SELECT user_id FROM stories WHERE id = ?',
      args: [storyId],
    })

    if (storyResult.rows.length === 0) {
      closeDbClient()
      return createErrorResponse(404, 'Story not found', 'NotFound')
    }

    if (storyResult.rows[0].user_id !== userId) {
      closeDbClient()
      return createErrorResponse(403, 'Access denied', 'Forbidden')
    }

    // Archive story
    await db.execute({
      sql: 'UPDATE stories SET archived = 1, updated_at = datetime("now") WHERE id = ?',
      args: [storyId],
    })

    closeDbClient()

    return createSuccessResponse({ message: 'Story archived successfully' })
  } catch (error) {
    closeDbClient()
    console.error('Error archiving story:', error)
    return createErrorResponse(
      500,
      'Internal server error',
      'InternalServerError'
    )
  }
}

/**
 * DELETE /stories/:id - Delete a story
 */
async function handleDeleteStory(
  event: {
    path: string
    headers: Record<string, string | null>
  }
): Promise<Response> {
  // Extract story ID from path
  const pathParts = event.path.split('/')
  const storyId = pathParts[pathParts.length - 1]

  if (!storyId || isNaN(Number(storyId))) {
    return createErrorResponse(400, 'Invalid story ID', 'BadRequest')
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
    // Verify story belongs to user
    const storyResult = await db.execute({
      sql: 'SELECT user_id FROM stories WHERE id = ?',
      args: [storyId],
    })

    if (storyResult.rows.length === 0) {
      closeDbClient()
      return createErrorResponse(404, 'Story not found', 'NotFound')
    }

    if (storyResult.rows[0].user_id !== userId) {
      closeDbClient()
      return createErrorResponse(403, 'Access denied', 'Forbidden')
    }

    // Delete story (CASCADE will handle related likes/comments)
    await db.execute({
      sql: 'DELETE FROM stories WHERE id = ?',
      args: [storyId],
    })

    closeDbClient()

    return createSuccessResponse({ message: 'Story deleted successfully' })
  } catch (error) {
    closeDbClient()
    console.error('Error deleting story:', error)
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

  const path = event.path.replace('/.netlify/functions/stories', '') || '/'

  // Route to appropriate handler
  if (event.httpMethod === 'POST' && path === '/') {
    return handleCreateStory(event)
  }

  if (event.httpMethod === 'GET' && path === '/') {
    return handleGetPublicStories(event)
  }

  if (event.httpMethod === 'GET' && path === '/me') {
    return handleGetUserStories(event)
  }

  if (event.httpMethod === 'GET' && path.match(/^\/\d+$/)) {
    return handleGetStoryById(event)
  }

  if (event.httpMethod === 'PUT' && path.match(/^\/\d+$/) && !path.includes('archive')) {
    return handleUpdateStory(event)
  }

  if (event.httpMethod === 'PUT' && path.match(/^\/\d+\/archive$/)) {
    return handleArchiveStory(event)
  }

  if (event.httpMethod === 'DELETE' && path.match(/^\/\d+$/)) {
    return handleDeleteStory(event)
  }

  return createErrorResponse(404, 'Not found', 'NotFound')
}
