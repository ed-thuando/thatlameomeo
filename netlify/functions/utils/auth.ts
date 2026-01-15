import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  return secret
}

export interface JWTPayload {
  userId: number
  username: string
}

/**
 * Sign a JWT token with user information
 * @param userId - User ID to include in token
 * @param username - Username to include in token
 * @param expiresIn - Token expiration time (default: '1h' for access tokens)
 * @returns JWT token string
 */
export function signToken(
  userId: number,
  username: string,
  expiresIn: string = '1h'
): string {
  const payload: JWTPayload = {
    userId,
    username,
  }

  return jwt.sign(payload, getJwtSecret(), {
    expiresIn,
  })
}

/**
 * Generate a secure random refresh token
 * @returns Plain text refresh token (must be hashed before storage)
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Hash a refresh token using bcrypt
 * @param token - Plain text refresh token
 * @returns Hashed token string
 */
export async function hashRefreshToken(token: string): Promise<string> {
  const saltRounds = 10
  return await bcrypt.hash(token, saltRounds)
}

/**
 * Verify a refresh token against its hash
 * @param hashedToken - Hashed token from database
 * @param plainToken - Plain text token from client
 * @returns True if tokens match, false otherwise
 */
export async function verifyRefreshToken(
  hashedToken: string,
  plainToken: string
): Promise<boolean> {
  return await bcrypt.compare(plainToken, hashedToken)
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string to verify
 * @returns Decoded token payload
 * @throws Error if token is invalid or expired
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JWTPayload
    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    }
    throw error
  }
}

/**
 * Extract user ID from JWT token
 * @param token - JWT token string
 * @returns User ID
 * @throws Error if token is invalid or expired
 */
export function extractUserId(token: string): number {
  const payload = verifyToken(token)
  return payload.userId
}

/**
 * Extract JWT token from Authorization header
 * @param authHeader - Authorization header value (e.g., "Bearer <token>")
 * @returns JWT token string or null if not found
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  return authHeader.substring(7) // Remove "Bearer " prefix
}
