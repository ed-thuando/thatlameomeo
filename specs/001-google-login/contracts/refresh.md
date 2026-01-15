# Token Refresh API Contract

**Endpoint**: `POST /.netlify/functions/refresh`  
**Function**: `netlify/functions/refresh.ts`  
**Authentication**: Not required (refresh token is the authentication)

## Request

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "refresh_token": "string (refresh token from initial authentication)"
}
```

### Validation
- `refresh_token`: Required, non-empty string

## Response

### Success (200 OK)
New access token issued successfully.

```json
{
  "access_token": "string (JWT, 1 hour expiration)",
  "expires_in": 3600,
  "user": {
    "id": "number",
    "username": "string"
  }
}
```

### Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Refresh token is required",
  "error": "BadRequest"
}
```

### Error (401 Unauthorized - Invalid Token)
```json
{
  "statusCode": 401,
  "message": "Invalid refresh token",
  "error": "Unauthorized"
}
```

### Error (401 Unauthorized - Expired Token)
```json
{
  "statusCode": 401,
  "message": "Refresh token has expired",
  "error": "Unauthorized"
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

- Accept refresh token in request body
- Hash the provided refresh token (bcrypt)
- Look up user by hashed refresh token in database
- Verify refresh token expiration (`refresh_token_expires_at > now()`)
- If valid: Generate new access token (1 hour expiration)
- If invalid: Return 401 error
- Return new access token and expiration time
- Optionally: Implement token rotation (invalidate old refresh token, issue new one)
- Log refresh events for security auditing

## Security Considerations

- Never expose refresh token in error messages
- Hash refresh token before database lookup
- Check expiration before accepting token
- Rate limit refresh requests to prevent abuse
- Consider token rotation for enhanced security
- Invalidate refresh token on suspicious activity

## Token Rotation (Optional)

If implementing token rotation:

1. Invalidate old refresh token
2. Generate new refresh token
3. Return both new access token and new refresh token
4. Client must update stored refresh token

Response with rotation:
```json
{
  "access_token": "string (JWT, 1 hour expiration)",
  "refresh_token": "string (new refresh token, 30 day expiration)",
  "expires_in": 3600,
  "user": {
    "id": "number",
    "username": "string"
  }
}
```
