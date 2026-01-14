/**
 * Generate a shareable URL for a post using a share token
 */
export function generateShareUrl(token: string): string {
  const baseUrl = window.location.origin
  return `${baseUrl}/share/${token}`
}

/**
 * Extract share token from URL
 */
export function extractTokenFromUrl(url: string): string | null {
  const match = url.match(/\/share\/([^/]+)/)
  return match ? match[1] : null
}
