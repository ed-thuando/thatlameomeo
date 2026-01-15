import { Handler } from '@netlify/functions'
import { getDbClient, closeDbClient } from './utils/db'
import {
  signToken,
  generateRefreshToken,
  hashRefreshToken,
} from './utils/auth'
import { createErrorResponse, createSuccessResponse, handleCors } from './utils/errors'

interface OnboardingRequest {
  session_id: string
  username: string
  avatar_bg_color: string
}

interface OnboardingResponse {
  access_token: string
  refresh_token: string
  user: {
    id: number
    username: string
    avatar_bg_color: string
    meomeo_score: number
    theme_preference: string
  }
}

// Predefined color palette
const VALID_COLORS = [
  '#1a1a1a', // Dark gray - default
  '#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33',
  '#33FFF5', '#FF8C33', '#8C33FF', '#FF3366', '#33FF8C',
  '#338CFF', '#FFD700', '#FF6347', '#00CED1', '#9370DB',
  '#FF1493', '#00FF7F', '#FF4500', '#4169E1',
]

/**
 * Validate username format
 */
function validateUsername(username: string): boolean {
  // 1-50 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{1,50}$/
  return usernameRegex.test(username)
}

/**
 * Validate avatar background color
 */
function validateColor(color: string): boolean {
  // Must be from predefined palette (case-insensitive)
  const normalizedColor = color.toUpperCase()
  return VALID_COLORS.some(validColor => validColor.toUpperCase() === normalizedColor)
}

export const handler: Handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCors()
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method not allowed', 'MethodNotAllowed')
  }

  try {
    // Parse request body
    if (!event.body) {
      return createErrorResponse(400, 'Request body is required', 'BadRequest')
    }

    const { session_id, username, avatar_bg_color }: OnboardingRequest = JSON.parse(event.body)

    // Validate input
    if (!session_id || !username || !avatar_bg_color) {
      return createErrorResponse(
        400,
        'Username and avatar background color are required',
        'BadRequest'
      )
    }

    // Validate username format
    if (!validateUsername(username)) {
      return createErrorResponse(
        400,
        'Username must be 1-50 characters and contain only letters, numbers, and underscores',
        'BadRequest'
      )
    }

    // Validate color
    if (!validateColor(avatar_bg_color)) {
      return createErrorResponse(
        400,
        'Invalid color format. Must be a hex color (e.g., #FF5733)',
        'BadRequest'
      )
    }

    // Get database client
    const db = getDbClient()

    // Parse session_id as user ID
    const userId = parseInt(session_id, 10)
    if (isNaN(userId)) {
      closeDbClient()
      return createErrorResponse(401, 'Invalid or expired onboarding session', 'Unauthorized')
    }

    // Check if user exists and has valid onboarding session
    const userResult = await db.execute({
      sql: `SELECT id, google_id, onboarding_expires_at, username
            FROM users
            WHERE id = ? AND google_id IS NOT NULL`,
      args: [userId],
    })

    if (userResult.rows.length === 0) {
      closeDbClient()
      return createErrorResponse(401, 'Invalid or expired onboarding session', 'Unauthorized')
    }

    const user = userResult.rows[0]
    const expiresAt = user.onboarding_expires_at as string

    // Check if onboarding session is expired
    if (expiresAt) {
      const expirationDate = new Date(expiresAt)
      if (expirationDate <= new Date()) {
        closeDbClient()
        return createErrorResponse(401, 'Invalid or expired onboarding session', 'Unauthorized')
      }
    }

    // Check if username is already taken (case-insensitive)
    const usernameCheckResult = await db.execute({
      sql: 'SELECT id FROM users WHERE LOWER(username) = LOWER(?) AND id != ?',
      args: [username, userId],
    })

    if (usernameCheckResult.rows.length > 0) {
      closeDbClient()
      return createErrorResponse(
        409,
        'Username is already taken. Please choose another.',
        'Conflict'
      )
    }

    // Generate refresh token
    const refreshToken = generateRefreshToken()
    const hashedRefreshToken = await hashRefreshToken(refreshToken)

    // Calculate expiration (30 days from now)
    const tokenExpiresAt = new Date()
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 30)
    const tokenExpiresAtISO = tokenExpiresAt.toISOString()

    // Update user with username, color, and tokens
    // Clear onboarding session data
    await db.execute({
      sql: `UPDATE users
            SET username = ?,
                avatar_bg_color = ?,
                refresh_token = ?,
                refresh_token_expires_at = ?,
                onboarding_username = NULL,
                onboarding_color = NULL,
                onboarding_expires_at = NULL,
                updated_at = datetime("now")
            WHERE id = ?`,
      args: [username, avatar_bg_color, hashedRefreshToken, tokenExpiresAtISO, userId],
    })

    // Generate access token (1 hour expiration)
    const accessToken = signToken(userId, username, '1h')

    // Get updated user info
    const updatedUserResult = await db.execute({
      sql: 'SELECT id, username, avatar_bg_color, meomeo_score, theme_preference FROM users WHERE id = ?',
      args: [userId],
    })

    closeDbClient()

    const updatedUser = updatedUserResult.rows[0]

    const response: OnboardingResponse = {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: updatedUser.id as number,
        username: updatedUser.username as string,
        avatar_bg_color: (updatedUser.avatar_bg_color as string) || '#1a1a1a',
        meomeo_score: (updatedUser.meomeo_score as number) || 0,
        theme_preference: (updatedUser.theme_preference as string) || 'default',
      },
    }

    return createSuccessResponse(response, 200)
  } catch (error) {
    closeDbClient()

    if (error instanceof Error) {
      console.error('Onboarding error:', error.message)
      
      // Check for unique constraint violation (username conflict)
      if (error.message.includes('UNIQUE constraint') || error.message.includes('unique constraint')) {
        return createErrorResponse(
          409,
          'Username is already taken. Please choose another.',
          'Conflict'
        )
      }
      
      return createErrorResponse(
        500,
        'Internal server error',
        'InternalServerError'
      )
    }

    return createErrorResponse(
      500,
      'An unexpected error occurred',
      'InternalServerError'
    )
  }
}
