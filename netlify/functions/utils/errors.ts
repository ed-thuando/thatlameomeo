import { HandlerResponse } from '@netlify/functions'

export interface ApiError {
  error: string
  message: string
  statusCode: number
}

/**
 * Create an error response for API endpoints
 */
export function createErrorResponse(
  statusCode: number,
  message: string,
  error?: string
): HandlerResponse {
  const errorResponse: ApiError = {
    error: error || 'API Error',
    message,
    statusCode,
  }

  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
    body: JSON.stringify(errorResponse),
  }
}

/**
 * Create a success response for API endpoints
 */
export function createSuccessResponse<T>(
  data: T,
  statusCode: number = 200
): HandlerResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
    body: JSON.stringify(data),
  }
}

/**
 * Handle CORS preflight requests
 */
export function handleCors(): HandlerResponse {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    },
    body: '',
  }
}
