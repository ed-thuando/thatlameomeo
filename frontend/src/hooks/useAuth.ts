import { useState, useEffect } from 'react'
import { getToken, decodeToken, isTokenExpired, removeToken } from '../utils/jwt'

export interface AuthUser {
  id: number
  username: string
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

/**
 * Authentication hook for managing user authentication state
 */
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  })

  useEffect(() => {
    // Validate token on app load
    validateToken()
  }, [])

  /**
   * Validate token and set user state
   */
  const validateToken = () => {
    const token = getToken()
    if (!token) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      return
    }

    // Check if token is expired
    if (isTokenExpired(token)) {
      removeToken()
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      return
    }

    // Decode token to get user info
    const payload = decodeToken(token)
    if (payload && payload.userId && payload.username) {
      setAuthState({
        user: {
          id: payload.userId,
          username: payload.username,
        },
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      // Invalid token format
      removeToken()
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  }

  /**
   * Set authenticated user after successful login
   */
  const setUser = (user: AuthUser) => {
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
    })
  }

  /**
   * Logout user
   */
  const logout = () => {
    removeToken()
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    })
  }

  return {
    ...authState,
    setUser,
    logout,
    validateToken,
  }
}
