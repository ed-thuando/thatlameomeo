/**
 * JWT token storage and retrieval utilities
 * Uses localStorage for token persistence
 */

const TOKEN_KEY = 'auth_token'

/**
 * Store JWT token in localStorage
 */
export function storeToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Get JWT token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Remove JWT token from localStorage
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Check if a token exists in localStorage
 */
export function hasToken(): boolean {
  return getToken() !== null
}

/**
 * Decode JWT token payload (without verification)
 * Note: This only decodes the payload, it does not verify the signature
 * For production, always verify tokens on the server
 */
export function decodeToken(token: string): { userId?: number; username?: string; exp?: number } | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) {
      return null
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  } catch (error) {
    return null
  }
}

/**
 * Check if token is expired (based on exp claim)
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token)
  if (!payload || !payload.exp) {
    return true
  }
  const expirationTime = payload.exp * 1000 // Convert to milliseconds
  return Date.now() >= expirationTime
}
