import { apiPost, ApiException } from './api'

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
