# Google OAuth Authentication API Contract

**Endpoint**: `POST /.netlify/functions/google-auth`  
**Function**: `netlify/functions/google-auth.ts`  
**Authentication**: Not required (this is the authentication endpoint)

## Request

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "id_token": "string (Google ID token from OAuth flow)"
}
```

### Validation
- `id_token`: Required, non-empty string, must be valid Google ID token

## Response

### Success - New User (200 OK)
User authenticated with Google for the first time. Requires onboarding.

```json
{
  "requires_onboarding": true,
  "onboarding_session": {
    "session_id": "string",
    "expires_at": "string (ISO 8601)"
  },
  "google_user": {
    "email": "string",
    "name": "string",
    "picture": "string"
  }
}
```

### Success - Existing User (200 OK)
User has completed onboarding or has existing account. Returns access and refresh tokens.

```json
{
  "requires_onboarding": false,
  "access_token": "string (JWT, 1 hour expiration)",
  "refresh_token": "string (30 day expiration)",
  "user": {
    "id": "number",
    "username": "string",
    "meomeo_score": "number",
    "theme_preference": "string"
  }
}
```

### Success - Account Linked (200 OK)
Google account email matches existing account. Account linked and user logged in.

```json
{
  "requires_onboarding": false,
  "account_linked": true,
  "access_token": "string (JWT, 1 hour expiration)",
  "refresh_token": "string (30 day expiration)",
  "user": {
    "id": "number",
    "username": "string",
    "meomeo_score": "number",
    "theme_preference": "string"
  }
}
```

### Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "ID token is required",
  "error": "BadRequest"
}
```

### Error (401 Unauthorized - Invalid Token)
```json
{
  "statusCode": 401,
  "message": "Invalid or expired Google ID token",
  "error": "Unauthorized"
}
```

### Error (400 Bad Request - No Email)
```json
{
  "statusCode": 400,
  "message": "Google account must have an email address",
  "error": "BadRequest"
}
```

### Error (500 Internal Server Error)
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "InternalServerError"
}
```

## Implementation Notes

- Verify Google ID token using `google-auth-library`
- Extract user information: email, name, picture, sub (Google user ID)
- Check if user exists by `google_id` or `google_email`
- If new user: Create onboarding session, return `requires_onboarding: true`
- If existing user: Issue access and refresh tokens, return user info
- If email matches existing account: Link Google account, issue tokens
- Validate email is present (required for account creation)
- Store Google ID and email in database
- Generate secure refresh token (crypto.randomBytes)
- Hash refresh token before storing in database (bcrypt)
- Set refresh token expiration to 30 days from now

## Security Considerations

- Verify ID token signature and expiration
- Check token audience matches OAuth client ID
- Validate token issuer is Google
- Never expose refresh token in error messages
- Log authentication events for security auditing
- Rate limit authentication attempts to prevent abuse
