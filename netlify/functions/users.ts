import { Handler } from '@netlify/functions'
import { getDbClient, closeDbClient } from './utils/db'
import {
  extractTokenFromHeader,
  verifyToken,
} from './utils/auth'
import { createErrorResponse, createSuccessResponse, handleCors } from './utils/errors'
import { calculateDailyScore } from './utils/scores'

interface UpdateProfileRequest {
  avatar_url?: string
  display_name?: string
}

interface UpdateThemeRequest {
  theme: string
}

/**
 * GET /users - Get all users with daily MeoMeo scores
 */
async function handleGetAllUsers(
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
  const sortBy = event.queryStringParameters?.sort || 'meomeo_score'
  const order = event.queryStringParameters?.order || 'desc'

  if (sortBy !== 'meomeo_score' && sortBy !== 'username') {
    return createErrorResponse(400, 'Invalid sort field', 'BadRequest')
  }

  if (order !== 'asc' && order !== 'desc') {
    return createErrorResponse(400, 'Invalid order', 'BadRequest')
  }

  const db = getDbClient()

  try {
    // Get all users
    const usersResult = await db.execute({
      sql: `
        SELECT id, username, display_name, avatar_url
        FROM users
        ORDER BY ${sortBy === 'meomeo_score' ? 'username' : 'username'} ${order.toUpperCase()}
      `,
      args: [],
    })

    // Calculate daily score for each user
    const usersWithScores = await Promise.all(
      usersResult.rows.map(async (user) => {
        const dailyScore = await calculateDailyScore(user.id as number)
        return {
          id: user.id,
          username: user.username,
          display_name: user.display_name || user.username,
          avatar_url: user.avatar_url,
          daily_meomeo_score: dailyScore,
        }
      })
    )

    // Sort by daily score if requested
    if (sortBy === 'meomeo_score') {
      usersWithScores.sort((a, b) => {
        return order === 'desc'
          ? b.daily_meomeo_score - a.daily_meomeo_score
          : a.daily_meomeo_score - b.daily_meomeo_score
      })
    }

    closeDbClient()

    return createSuccessResponse({
      users: usersWithScores,
    })
  } catch (error) {
    closeDbClient()
    console.error('Error fetching users:', error)
    return createErrorResponse(
      500,
      'Internal server error',
      'InternalServerError'
    )
  }
}

/**
 * GET /users/:id - Get user by ID
 */
async function handleGetUserById(
  event: {
    path: string
    headers: Record<string, string | null>
  }
): Promise<Response> {
  // Extract user ID from path
  const pathParts = event.path.split('/')
  const userId = pathParts[pathParts.length - 1]

  if (!userId || isNaN(Number(userId))) {
    return createErrorResponse(400, 'Invalid user ID', 'BadRequest')
  }

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

  const db = getDbClient()

  try {
    const userResult = await db.execute({
      sql: `
        SELECT id, username, display_name, avatar_url, theme_preference
        FROM users
        WHERE id = ?
      `,
      args: [userId],
    })

    if (userResult.rows.length === 0) {
      closeDbClient()
      return createErrorResponse(404, 'User not found', 'NotFound')
    }

    const user = userResult.rows[0]
    const dailyScore = await calculateDailyScore(Number(userId))

    closeDbClient()

    return createSuccessResponse({
      id: user.id,
      username: user.username,
      display_name: user.display_name || user.username,
      avatar_url: user.avatar_url,
      theme_preference: user.theme_preference,
      daily_meomeo_score: dailyScore,
    })
  } catch (error) {
    closeDbClient()
    console.error('Error fetching user:', error)
    return createErrorResponse(
      500,
      'Internal server error',
      'InternalServerError'
    )
  }
}

/**
 * GET /users/:id/daily-score - Get daily MeoMeo score for a user
 */
async function handleGetDailyScore(
  event: {
    path: string
    headers: Record<string, string | null>
  }
): Promise<Response> {
  // Extract user ID from path
  const pathParts = event.path.split('/')
  const userId = pathParts[pathParts.length - 2] // /users/:id/daily-score

  if (!userId || isNaN(Number(userId))) {
    return createErrorResponse(400, 'Invalid user ID', 'BadRequest')
  }

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

  try {
    const dailyScore = await calculateDailyScore(Number(userId))

    return createSuccessResponse({
      daily_meomeo_score: dailyScore,
    })
  } catch (error) {
    console.error('Error calculating daily score:', error)
    return createErrorResponse(
      500,
      'Internal server error',
      'InternalServerError'
    )
  }
}

/**
 * PUT /users/me - Update current user's profile
 */
async function handleUpdateProfile(
  event: { body: string | null; headers: Record<string, string | null> }
): Promise<Response> {
  if (!event.body) {
    return createErrorResponse(400, 'Request body is required', 'BadRequest')
  }

  const { avatar_url, display_name }: UpdateProfileRequest = JSON.parse(event.body)

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

  // Validate display name if provided
  if (display_name !== undefined) {
    if (!display_name.trim()) {
      return createErrorResponse(400, 'Display name cannot be empty', 'BadRequest')
    }
    if (display_name.length > 50) {
      return createErrorResponse(400, 'Display name must be 50 characters or less', 'BadRequest')
    }
  }

  const db = getDbClient()

  try {
    // Build update query dynamically
    const updates: string[] = []
    const args: unknown[] = []

    if (avatar_url !== undefined) {
      updates.push('avatar_url = ?')
      args.push(avatar_url)
    }

    if (display_name !== undefined) {
      updates.push('display_name = ?')
      args.push(display_name.trim())
    }

    if (updates.length === 0) {
      closeDbClient()
      return createErrorResponse(400, 'No fields to update', 'BadRequest')
    }

    updates.push('updated_at = datetime("now")')
    args.push(userId)

    await db.execute({
      sql: `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      args,
    })

    // Get updated user info
    const userResult = await db.execute({
      sql: 'SELECT id, username, display_name, avatar_url FROM users WHERE id = ?',
      args: [userId],
    })

    closeDbClient()

    return createSuccessResponse({
      id: userResult.rows[0].id,
      username: userResult.rows[0].username,
      display_name: userResult.rows[0].display_name || userResult.rows[0].username,
      avatar_url: userResult.rows[0].avatar_url,
    })
  } catch (error) {
    closeDbClient()
    console.error('Error updating profile:', error)
    return createErrorResponse(
      500,
      'Internal server error',
      'InternalServerError'
    )
  }
}

/**
 * PUT /users/me/theme - Update current user's theme preference
 */
async function handleUpdateTheme(
  event: { body: string | null; headers: Record<string, string | null> }
): Promise<Response> {
  if (!event.body) {
    return createErrorResponse(400, 'Request body is required', 'BadRequest')
  }

  const { theme }: UpdateThemeRequest = JSON.parse(event.body)

  const validThemes = ['default', 'orange-cat', 'gray-cat', 'calico-cat']

  if (!theme || !validThemes.includes(theme)) {
    return createErrorResponse(
      400,
      `Invalid theme. Must be one of: ${validThemes.join(', ')}`,
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
    await db.execute({
      sql: 'UPDATE users SET theme_preference = ?, updated_at = datetime("now") WHERE id = ?',
      args: [theme, userId],
    })

    // Get updated user info
    const userResult = await db.execute({
      sql: 'SELECT id, username, theme_preference FROM users WHERE id = ?',
      args: [userId],
    })

    closeDbClient()

    return createSuccessResponse({
      id: userResult.rows[0].id,
      username: userResult.rows[0].username,
      theme_preference: userResult.rows[0].theme_preference,
    })
  } catch (error) {
    closeDbClient()
    console.error('Error updating theme:', error)
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

  const path = event.path.replace('/.netlify/functions/users', '') || '/'

  // Route to appropriate handler
  if (event.httpMethod === 'GET' && path === '/') {
    return handleGetAllUsers(event)
  }

  if (event.httpMethod === 'GET' && path.match(/^\/\d+$/)) {
    return handleGetUserById(event)
  }

  if (event.httpMethod === 'GET' && path.match(/^\/\d+\/daily-score$/)) {
    return handleGetDailyScore(event)
  }

  if (event.httpMethod === 'PUT' && path === '/me') {
    return handleUpdateProfile(event)
  }

  if (event.httpMethod === 'PUT' && path === '/me/theme') {
    return handleUpdateTheme(event)
  }

  return createErrorResponse(404, 'Not found', 'NotFound')
}
