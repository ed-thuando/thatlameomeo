import { createClient, Client } from '@libsql/client/web'

let client: Client | null = null

/**
 * Get or create a Turso database client
 * Creates a new client per function invocation (serverless-friendly)
 */
export function getDbClient(): Client {
  if (client) {
    return client
  }

  const databaseUrl = process.env.TURSO_DATABASE_URL
  const authToken = process.env.TURSO_AUTH_TOKEN

  if (!databaseUrl || !authToken) {
    throw new Error(
      'Missing required environment variables: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN'
    )
  }

  // Use HTTP mode for remote connections (works without native bindings)
  // This is compatible with Turso cloud databases
  // Force HTTP mode to avoid native binding issues (which cause 502s on Netlify)
  const url = databaseUrl.replace('libsql://', 'https://')

  client = createClient({
    url: url,
    authToken: authToken,
    // Force HTTP mode for remote connections to avoid native binding issues
    syncUrl: undefined, // No local sync needed for cloud-only setup
  })

  return client
}

/**
 * Close the database client connection
 * Should be called at the end of function execution
 */
export function closeDbClient(): void {
  if (client) {
    client.close()
    client = null
  }
}
