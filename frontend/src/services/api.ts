import { refreshAccessToken, getRefreshToken, storeToken, storeRefreshToken, removeToken, removeRefreshToken } from './auth'
import { isTokenExpired, getTokenExpirationTime } from '../utils/jwt'

import { refreshAccessToken, getRefreshToken, storeToken, removeToken, removeRefreshToken } from './auth'
import { isTokenExpired, getTokenExpirationTime } from '../utils/jwt'

const API_BASE_URL =
  import.meta.env.VITE_NETLIFY_FUNCTIONS_URL || '/.netlify/functions'

export interface ApiError {
  error: string
  message: string
  statusCode: number
}

export class ApiException extends Error {
  statusCode: number
  error: string

  constructor(statusCode: number, message: string, error?: string) {
    super(message)
    this.name = 'ApiException'
    this.statusCode = statusCode
    this.error = error || 'API Error'
  }
}

/**
 * Get JWT token from localStorage
 */
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token')
}

/**
 * Check if token expires soon (within 10 minutes)
 */
function isTokenExpiringSoon(token: string | null): boolean {
  if (!token) return true
  
  try {
    const expirationTime = getTokenExpirationTime(token)
    if (!expirationTime) return true
    
    const now = Date.now()
    const tenMinutes = 10 * 60 * 1000 // 10 minutes in milliseconds
    return expirationTime - now < tenMinutes
  } catch {
    return true
  }
}

/**
 * Automatically refresh access token if it's expiring soon
 */
async function ensureValidToken(): Promise<void> {
  const token = getAuthToken()
  const refreshToken = getRefreshToken()
  
  // If no token, nothing to refresh
  if (!token) return
  
  // If token is expired or expiring soon, try to refresh
  if (isTokenExpired(token) || isTokenExpiringSoon(token)) {
    if (!refreshToken) {
      // No refresh token available, clear auth and redirect to login
      removeToken()
      removeRefreshToken()
      // Redirect will be handled by useAuth hook
      return
    }
    
    try {
      const response = await refreshAccessToken(refreshToken)
      storeToken(response.access_token)
      // Refresh token remains the same (unless rotation is implemented)
    } catch (error) {
      // Refresh failed, clear auth and redirect to login
      removeToken()
      removeRefreshToken()
      // Redirect will be handled by useAuth hook
      throw error
    }
  }
}

/**
 * Make an API request to a Netlify Function
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Skip token refresh for auth endpoints to avoid infinite loops
  const isAuthEndpoint = endpoint === '/google-auth' || endpoint === '/refresh' || endpoint === '/login'
  
  if (!isAuthEndpoint) {
    try {
      await ensureValidToken()
    } catch (error) {
      // If refresh fails, the error will be handled by the caller
      // For now, we'll let the request proceed and handle 401 responses
    }
  }
  
  const token = getAuthToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    ;(headers as any)['Authorization'] = `Bearer ${token}`
  }

  const url = `${API_BASE_URL}${endpoint}`
  let response: Response

  try {
    response = await fetch(url, {
      ...options,
      headers,
    })
  } catch (error) {
    // Network error
    if (error instanceof TypeError) {
      throw new ApiException(
        0,
        'Network error: Unable to connect to server',
        'NetworkError'
      )
    }
    throw error
  }
  
  // If we get a 401, try to refresh token once and retry
  if (response.status === 401 && !isAuthEndpoint) {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      try {
        const refreshResponse = await refreshAccessToken(refreshToken)
        storeToken(refreshResponse.access_token)
        
        // Retry the original request with new token
        ;(headers as any)['Authorization'] = `Bearer ${refreshResponse.access_token}`
        response = await fetch(url, {
          ...options,
          headers,
        })
      } catch (refreshError) {
        // Refresh failed, clear auth
        removeToken()
        removeRefreshToken()
        // Let the 401 response be handled below
      }
    }
  }

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    if (!response.ok) {
      throw new ApiException(
        response.status,
        `Request failed with status ${response.status}`,
        'HttpError'
      )
    }
    return (await response.text()) as unknown as T
  }

  const data = await response.json()

  if (!response.ok) {
    // API error response
    const apiError = data as ApiError
    throw new ApiException(
      apiError.statusCode || response.status,
      apiError.message || `Request failed with status ${response.status}`,
      apiError.error
    )
  }

  return data as T
}

/**
 * GET request helper
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'GET',
  })
}

/**
 * POST request helper
 */
export async function apiPost<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * PUT request helper
 */
export async function apiPut<T>(
  endpoint: string,
  body?: unknown
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'DELETE',
  })
}
