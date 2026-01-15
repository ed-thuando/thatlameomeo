import { Handler } from '@netlify/functions'
import { getDbClient, closeDbClient } from './utils/db'
import { signToken } from './utils/auth'
import { createErrorResponse, createSuccessResponse, handleCors } from './utils/errors'
import bcrypt from 'bcryptjs'

interface LoginRequest {
  username: string
  password: string
}

interface LoginResponse {
  token: string
  user: {
    id: number
    username: string
    meomeo_score: number
    theme_preference: string
  }
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

    const { username, password }: LoginRequest = JSON.parse(event.body)

    // Validate input
    if (!username || !password) {
      return createErrorResponse(
        400,
        'Username and password are required',
        'BadRequest'
      )
    }

    // Get database client
    const db = getDbClient()

    // Find user by username
    const userResult = await db.execute({
      sql: 'SELECT id, username, password_hash, meomeo_score, theme_preference FROM users WHERE username = ?',
      args: [username],
    })

    if (userResult.rows.length === 0) {
      closeDbClient()
      return createErrorResponse(
        401,
        'Invalid credentials',
        'Unauthorized'
      )
    }

    const user = userResult.rows[0]
    const userId = user.id as number
    const storedUsername = user.username as string
    const passwordHash = user.password_hash as string
    const meomeoScore = (user.meomeo_score as number) || 0
    const themePreference = (user.theme_preference as string) || 'default'

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, passwordHash)

    if (!isPasswordValid) {
      closeDbClient()
      return createErrorResponse(
        401,
        'Invalid credentials',
        'Unauthorized'
      )
    }

    // Generate JWT token (1 hour expiration for consistency with OAuth tokens)
    const token = signToken(userId, storedUsername, '1h')

    // Close database connection
    closeDbClient()

    // Return success response
    const response: LoginResponse = {
      token,
      user: {
        id: userId,
        username: storedUsername,
        meomeo_score: meomeoScore,
        theme_preference: themePreference,
      },
    }

    return createSuccessResponse(response, 200)
  } catch (error) {
    closeDbClient()

    if (error instanceof Error) {
      console.error('Login error:', error.message)
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
