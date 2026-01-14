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
 * Make an API request to a Netlify Function
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
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
