import { apiPost, apiGet, ApiException } from './api'

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: number
    username: string
  }
}

export interface GoogleAuthResponse {
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

export interface RefreshResponse {
  access_token: string
  expires_in: number
  user: {
    id: number
    username: string
  }
}

export interface AuthError {
  message: string
  statusCode: number
}

/**
 * Login with username and password
 */
export async function login(
  credentials: LoginCredentials
): Promise<LoginResponse> {
  try {
    const response = await apiPost<LoginResponse>('/login', credentials)
    return response
  } catch (error) {
    if (error instanceof ApiException) {
      throw {
        message: error.message,
        statusCode: error.statusCode,
      } as AuthError
    }
    throw {
      message: 'An unexpected error occurred',
      statusCode: 500,
    } as AuthError
  }
}

/**
 * Store JWT token in localStorage
 */
export function storeToken(token: string): void {
  localStorage.setItem('auth_token', token)
}

/**
 * Get JWT token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem('auth_token')
}

/**
 * Remove JWT token from localStorage (logout)
 */
export function removeToken(): void {
  localStorage.removeItem('auth_token')
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  return getToken() !== null
}

/**
 * Authenticate with Google OAuth
 * @param idToken - Google ID token from OAuth flow
 * @returns Authentication response with tokens or onboarding info
 */
export async function googleAuth(
  idToken: string
): Promise<GoogleAuthResponse> {
  try {
    const response = await apiPost<GoogleAuthResponse>('/google-auth', {
      id_token: idToken,
    })
    return response
  } catch (error) {
    if (error instanceof ApiException) {
      throw {
        message: error.message,
        statusCode: error.statusCode,
      } as AuthError
    }
    throw {
      message: 'An unexpected error occurred',
      statusCode: 500,
    } as AuthError
  }
}

/**
 * Refresh access token using refresh token
 * @param refreshToken - Refresh token from initial authentication
 * @returns New access token and user info
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<RefreshResponse> {
  try {
    const response = await apiPost<RefreshResponse>('/refresh', {
      refresh_token: refreshToken,
    })
    return response
  } catch (error) {
    if (error instanceof ApiException) {
      throw {
        message: error.message,
        statusCode: error.statusCode,
      } as AuthError
    }
    throw {
      message: 'An unexpected error occurred',
      statusCode: 500,
    } as AuthError
  }
}

/**
 * Store refresh token in localStorage
 * @param token - Refresh token to store
 */
export function storeRefreshToken(token: string): void {
  localStorage.setItem('refresh_token', token)
}

/**
 * Get refresh token from localStorage
 * @returns Refresh token or null if not found
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token')
}

/**
 * Remove refresh token from localStorage (logout)
 */
export function removeRefreshToken(): void {
  localStorage.removeItem('refresh_token')
}

/**
 * Complete onboarding with username and color
 * @param sessionId - Onboarding session ID
 * @param username - Selected username
 * @param color - Selected avatar background color
 * @returns Authentication response with tokens and user info
 */
export async function completeOnboarding(
  sessionId: string,
  username: string,
  color: string
): Promise<{
  access_token: string
  refresh_token: string
  user: {
    id: number
    username: string
    avatar_bg_color: string
    meomeo_score: number
    theme_preference: string
  }
}> {
  try {
    const response = await apiPost<{
      access_token: string
      refresh_token: string
      user: {
        id: number
        username: string
        avatar_bg_color: string
        meomeo_score: number
        theme_preference: string
      }
    }>('/onboarding', {
      session_id: sessionId,
      username,
      avatar_bg_color: color,
    })
    return response
  } catch (error) {
    if (error instanceof ApiException) {
      throw {
        message: error.message,
        statusCode: error.statusCode,
      } as AuthError
    }
    throw {
      message: 'An unexpected error occurred',
      statusCode: 500,
    } as AuthError
  }
}

/**
 * Check if username is available
 * @param username - Username to check
 * @returns Availability status
 */
export async function checkUsernameAvailability(
  username: string
): Promise<{ available: boolean; username: string; message?: string }> {
  try {
    const response = await apiGet<{
      available: boolean
      username: string
      message?: string
    }>(`/users/check-username?username=${encodeURIComponent(username)}`)
    return response
  } catch (error) {
    if (error instanceof ApiException) {
      throw {
        message: error.message,
        statusCode: error.statusCode,
      } as AuthError
    }
    throw {
      message: 'An unexpected error occurred',
      statusCode: 500,
    } as AuthError
  }
}
