import { Handler } from '@netlify/functions'
import { getDbClient, closeDbClient } from './utils/db'
import {
  extractTokenFromHeader,
  verifyToken,
} from './utils/auth'
import { createErrorResponse, createSuccessResponse, handleCors } from './utils/errors'
import crypto from 'crypto'

interface CreateShareRequest {
  story_id: number
}

/**
 * POST /shares - Generate a shareable link token for a story
 */
async function handleCreateShare(
  event: { body: string | null; headers: Record<string, string | null> }
): Promise<Response> {
  if (!event.body) {
    return createErrorResponse(400, 'Request body is required', 'BadRequest')
  }

  const { story_id }: CreateShareRequest = JSON.parse(event.body)

  if (!story_id) {
    return createErrorResponse(400, 'story_id is required', 'BadRequest')
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
    // Check if story exists
    const storyResult = await db.execute({
      sql: 'SELECT id FROM stories WHERE id = ?',
      args: [story_id],
    })

    if (storyResult.rows.length === 0) {
      closeDbClient()
      return createErrorResponse(404, 'Story not found', 'NotFound')
    }

    // Generate secure token
    const shareToken = crypto.randomBytes(32).toString('hex')

    // Calculate expiration (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Insert share record
    await db.execute({
      sql: 'INSERT INTO shares (story_id, token, expires_at) VALUES (?, ?, ?)',
      args: [story_id, shareToken, expiresAt.toISOString()],
    })

    closeDbClient()

    return createSuccessResponse({
      token: shareToken,
      expires_at: expiresAt.toISOString(),
    })
  } catch (error) {
    closeDbClient()
    console.error('Error creating share:', error)
    return createErrorResponse(
      500,
      'Internal server error',
      'InternalServerError'
    )
  }
}

/**
 * GET /shares/:token - Resolve share token to story ID
 */
async function handleResolveShare(
  event: {
    path: string
    headers: Record<string, string | null>
  }
): Promise<Response> {
  // Extract token from path (e.g., /.netlify/functions/shares/abc123)
  const pathParts = event.path.split('/')
  const token = pathParts[pathParts.length - 1]

  if (!token) {
    return createErrorResponse(400, 'Share token is required', 'BadRequest')
  }

  const db = getDbClient()

  try {
    // Find share record
    const shareResult = await db.execute({
      sql: `
        SELECT s.story_id, s.expires_at, st.visibility
        FROM shares s
        INNER JOIN stories st ON s.story_id = st.id
        WHERE s.token = ?
      `,
      args: [token],
    })

    if (shareResult.rows.length === 0) {
      closeDbClient()
      return createErrorResponse(404, 'Share link not found or expired', 'NotFound')
    }

    const share = shareResult.rows[0] as {
      story_id: number
      expires_at: string | null
      visibility: string
    }

    // Check expiration
    if (share.expires_at) {
      const expiresAt = new Date(share.expires_at)
      if (expiresAt < new Date()) {
        closeDbClient()
        return createErrorResponse(410, 'Share link has expired', 'Gone')
      }
    }

    closeDbClient()

    return createSuccessResponse({
      story_id: share.story_id,
      visibility: share.visibility,
    })
  } catch (error) {
    closeDbClient()
    console.error('Error resolving share:', error)
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
    return handleCreateShare(event)
  }

  if (event.httpMethod === 'GET') {
    return handleResolveShare(event)
  }

  return createErrorResponse(404, 'Not found', 'NotFound')
}
