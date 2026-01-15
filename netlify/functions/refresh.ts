import { Handler } from '@netlify/functions'
import { getDbClient, closeDbClient } from './utils/db'
import { signToken, verifyRefreshToken } from './utils/auth'
import { createErrorResponse, createSuccessResponse, handleCors } from './utils/errors'

interface RefreshRequest {
  refresh_token: string
}

interface RefreshResponse {
  access_token: string
  expires_in: number
  user: {
    id: number
    username: string
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

    const { refresh_token }: RefreshRequest = JSON.parse(event.body)

    // Validate input
    if (!refresh_token || typeof refresh_token !== 'string') {
      return createErrorResponse(400, 'Refresh token is required', 'BadRequest')
    }

    // Get database client
    const db = getDbClient()

    // Find user by refresh token
    // We need to check all users and verify the token hash
    // This is not efficient, but necessary since we hash tokens
    // In production, consider storing a token identifier separately
    const usersResult = await db.execute({
      sql: 'SELECT id, username, refresh_token, refresh_token_expires_at FROM users WHERE refresh_token IS NOT NULL',
      args: [],
    })

    let validUser: { id: number; username: string } | null = null

    // Check each user's refresh token
    for (const user of usersResult.rows) {
      const hashedToken = user.refresh_token as string
      const expiresAt = user.refresh_token_expires_at as string

      // Check expiration first (avoid unnecessary hash comparison)
      if (expiresAt) {
        const expirationDate = new Date(expiresAt)
        if (expirationDate <= new Date()) {
          continue // Token expired
        }
      }

      // Verify token hash
      try {
        const isValid = await verifyRefreshToken(hashedToken, refresh_token)
        if (isValid) {
          validUser = {
            id: user.id as number,
            username: user.username as string,
          }
          break
        }
      } catch (error) {
        // Continue checking other users
        continue
      }
    }

    if (!validUser) {
      closeDbClient()
      return createErrorResponse(401, 'Invalid refresh token', 'Unauthorized')
    }

    // Check if token is expired (double-check)
    const userResult = await db.execute({
      sql: 'SELECT refresh_token_expires_at FROM users WHERE id = ?',
      args: [validUser.id],
    })

    if (userResult.rows.length > 0) {
      const expiresAt = userResult.rows[0].refresh_token_expires_at as string
      if (expiresAt) {
        const expirationDate = new Date(expiresAt)
        if (expirationDate <= new Date()) {
          closeDbClient()
          return createErrorResponse(401, 'Refresh token has expired', 'Unauthorized')
        }
      }
    }

    // Generate new access token (1 hour expiration)
    const accessToken = signToken(validUser.id, validUser.username, '1h')

    closeDbClient()

    const response: RefreshResponse = {
      access_token: accessToken,
      expires_in: 3600, // 1 hour in seconds
      user: {
        id: validUser.id,
        username: validUser.username,
      },
    }

    return createSuccessResponse(response, 200)
  } catch (error) {
    closeDbClient()

    if (error instanceof Error) {
      console.error('Refresh token error:', error.message)
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
