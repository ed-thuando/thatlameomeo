import { OAuth2Client } from 'google-auth-library'

/**
 * Google OAuth client instance
 * Reused across function invocations for efficiency
 */
let oauthClient: OAuth2Client | null = null

/**
 * Get or create Google OAuth2 client
 * @returns OAuth2Client instance
 */
function getOAuthClient(): OAuth2Client {
  if (oauthClient) {
    return oauthClient
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID environment variable is required')
  }

  oauthClient = new OAuth2Client(clientId)
  return oauthClient
}

/**
 * Google user information extracted from ID token
 */
export interface GoogleUserInfo {
  email: string
  name: string
  picture: string
  sub: string // Google user ID
}

/**
 * Verify a Google ID token and extract user information
 * @param idToken - Google ID token from OAuth flow
 * @returns Verified user information
 * @throws Error if token is invalid, expired, or missing required claims
 */
export async function verifyGoogleIdToken(idToken: string): Promise<GoogleUserInfo> {
  const client = getOAuthClient()
  const clientId = process.env.GOOGLE_CLIENT_ID

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID environment variable is required')
  }

  try {
    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    })

    const payload = ticket.getPayload()
    if (!payload) {
      throw new Error('Invalid token payload')
    }

    // Extract required information
    const email = payload.email
    if (!email) {
      throw new Error('Google account must have an email address')
    }

    return {
      email,
      name: payload.name || '',
      picture: payload.picture || '',
      sub: payload.sub,
    }
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw with more context
      if (error.message.includes('Token used too early')) {
        throw new Error('Invalid or expired Google ID token')
      }
      if (error.message.includes('audience')) {
        throw new Error('Invalid Google OAuth client ID')
      }
      throw new Error(`Google token verification failed: ${error.message}`)
    }
    throw new Error('Google token verification failed')
  }
}

/**
 * Extract user information from Google ID token payload
 * This is a convenience function that wraps verifyGoogleIdToken
 * @param idToken - Google ID token from OAuth flow
 * @returns User information (email, name, picture, sub)
 */
export async function extractGoogleUserInfo(
  idToken: string
): Promise<GoogleUserInfo> {
  return await verifyGoogleIdToken(idToken)
}
