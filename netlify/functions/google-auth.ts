import { Handler } from '@netlify/functions'
import { getDbClient, closeDbClient } from './utils/db'
import {
  signToken,
  generateRefreshToken,
  hashRefreshToken,
} from './utils/auth'
import { verifyGoogleIdToken } from './utils/google'
import { createErrorResponse, createSuccessResponse, handleCors } from './utils/errors'

interface GoogleAuthRequest {
  id_token: string
}

interface GoogleAuthResponse {
  requires_onboarding: boolean
  onboarding_session?: {
    session_id: string
    expires_at: string
  }
  google_user?: {
    email: string
    name: string
    picture: string
  }
  access_token?: string
  refresh_token?: string
  account_linked?: boolean
  user?: {
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

    const { id_token }: GoogleAuthRequest = JSON.parse(event.body)

    // Validate input
    if (!id_token || typeof id_token !== 'string') {
      return createErrorResponse(400, 'ID token is required', 'BadRequest')
    }

    // Verify Google ID token
    let googleUserInfo
    try {
      googleUserInfo = await verifyGoogleIdToken(id_token)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('email')) {
          return createErrorResponse(
            400,
            'Google account must have an email address',
            'BadRequest'
          )
        }
        return createErrorResponse(
          401,
          'Invalid or expired Google ID token',
          'Unauthorized'
        )
      }
      return createErrorResponse(
        401,
        'Invalid or expired Google ID token',
        'Unauthorized'
      )
    }

    // Get database client
    const db = getDbClient()

    // Check if user exists by google_id
    const userByGoogleIdResult = await db.execute({
      sql: 'SELECT id, username, meomeo_score, theme_preference FROM users WHERE google_id = ?',
      args: [googleUserInfo.sub],
    })

    // If user exists with this Google ID, log them in
    if (userByGoogleIdResult.rows.length > 0) {
      const user = userByGoogleIdResult.rows[0]
      const userId = user.id as number
      const username = user.username as string
      const meomeoScore = (user.meomeo_score as number) || 0
      const themePreference = (user.theme_preference as string) || 'default'

      // Generate refresh token
      const refreshToken = generateRefreshToken()
      const hashedRefreshToken = await hashRefreshToken(refreshToken)

      // Calculate expiration (30 days from now)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)
      const expiresAtISO = expiresAt.toISOString()

      // Update refresh token in database
      await db.execute({
        sql: 'UPDATE users SET refresh_token = ?, refresh_token_expires_at = ?, updated_at = datetime("now") WHERE id = ?',
        args: [hashedRefreshToken, expiresAtISO, userId],
      })

      // Generate access token (1 hour expiration)
      const accessToken = signToken(userId, username, '1h')

      closeDbClient()

      const response: GoogleAuthResponse = {
        requires_onboarding: false,
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: userId,
          username,
          meomeo_score: meomeoScore,
          theme_preference: themePreference,
        },
      }

      return createSuccessResponse(response, 200)
    }

    // Check if user exists by email (account linking)
    const userByEmailResult = await db.execute({
      sql: 'SELECT id, username, meomeo_score, theme_preference FROM users WHERE google_email = ? AND google_id IS NULL',
      args: [googleUserInfo.email],
    })

    if (userByEmailResult.rows.length > 0) {
      // Link Google account to existing user
      const user = userByEmailResult.rows[0]
      const userId = user.id as number
      const username = user.username as string
      const meomeoScore = (user.meomeo_score as number) || 0
      const themePreference = (user.theme_preference as string) || 'default'

      // Update user with Google OAuth info
      await db.execute({
        sql: 'UPDATE users SET google_id = ?, google_email = ?, updated_at = datetime("now") WHERE id = ?',
        args: [googleUserInfo.sub, googleUserInfo.email, userId],
      })

      // Generate refresh token
      const refreshToken = generateRefreshToken()
      const hashedRefreshToken = await hashRefreshToken(refreshToken)

      // Calculate expiration (30 days from now)
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)
      const expiresAtISO = expiresAt.toISOString()

      // Update refresh token in database
      await db.execute({
        sql: 'UPDATE users SET refresh_token = ?, refresh_token_expires_at = ?, updated_at = datetime("now") WHERE id = ?',
        args: [hashedRefreshToken, expiresAtISO, userId],
      })

      // Generate access token (1 hour expiration)
      const accessToken = signToken(userId, username, '1h')

      closeDbClient()

      const response: GoogleAuthResponse = {
        requires_onboarding: false,
        account_linked: true,
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: userId,
          username,
          meomeo_score: meomeoScore,
          theme_preference: themePreference,
        },
      }

      return createSuccessResponse(response, 200)
    }

    // New user - create onboarding session
    // Calculate expiration (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 1)
    const expiresAtISO = expiresAt.toISOString()

    // Create user record with onboarding session
    // Use temporary values for username and password_hash to satisfy NOT NULL constraints
    // These will be updated when the user completes onboarding
    const tempUsername = `temp_${googleUserInfo.sub}` // Temporary username based on Google ID
    const tempPasswordHash = '' // Empty password hash since user will use Google OAuth

    const insertResult = await db.execute({
      sql: `INSERT INTO users (google_id, google_email, username, password_hash, onboarding_expires_at, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, datetime("now"), datetime("now"))`,
      args: [googleUserInfo.sub, googleUserInfo.email, tempUsername, tempPasswordHash, expiresAtISO],
    })

    const userId = Number(insertResult.lastInsertRowid)

    // Generate session ID (use user ID as session identifier)
    const sessionId = userId.toString()

    closeDbClient()

    const response: GoogleAuthResponse = {
      requires_onboarding: true,
      onboarding_session: {
        session_id: sessionId,
        expires_at: expiresAtISO,
      },
      google_user: {
        email: googleUserInfo.email,
        name: googleUserInfo.name,
        picture: googleUserInfo.picture,
      },
    }

    return createSuccessResponse(response, 200)
  } catch (error) {
    closeDbClient()

    if (error instanceof Error) {
      console.error('Google auth error:', error.message)
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
