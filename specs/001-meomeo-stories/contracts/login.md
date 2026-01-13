# Login API Contract

**Endpoint**: `POST /.netlify/functions/login`  
**Function**: `netlify/functions/login.ts`

## Request

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "username": "string",
  "password": "string"
}
```

### Validation
- `username`: Required, non-empty string
- `password`: Required, non-empty string

## Response

### Success (200 OK)
```json
{
  "token": "string (JWT)",
  "user": {
    "id": "number",
    "username": "string",
    "meomeo_score": "number",
    "theme_preference": "string"
  }
}
```

### Error (401 Unauthorized)
```json
{
  "error": "Invalid credentials"
}
```

### Error (400 Bad Request)
```json
{
  "error": "Username and password are required"
}
```

## Implementation Notes

- Verify username and password against database
- Use bcrypt or similar to compare password hash
- Generate JWT token with user ID in payload
- Token expiration: 24 hours
- Return user info (excluding password_hash) with token
