# Onboarding Completion API Contract

**Endpoint**: `POST /.netlify/functions/onboarding`  
**Function**: `netlify/functions/onboarding.ts`  
**Authentication**: Not required (onboarding session is the authentication)

## Request

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "session_id": "string (from google-auth response)",
  "username": "string",
  "avatar_bg_color": "string (hex color, e.g., #FF5733)"
}
```

### Validation
- `session_id`: Required, non-empty string
- `username`: Required, non-empty string, 1-50 characters, alphanumeric and underscores only
- `avatar_bg_color`: Required, valid hex color from predefined palette

## Response

### Success (200 OK)
Onboarding completed, account created, user logged in.

```json
{
  "access_token": "string (JWT, 1 hour expiration)",
  "refresh_token": "string (30 day expiration)",
  "user": {
    "id": "number",
    "username": "string",
    "avatar_bg_color": "string",
    "meomeo_score": 0,
    "theme_preference": "default"
  }
}
```

### Error (400 Bad Request - Missing Fields)
```json
{
  "statusCode": 400,
  "message": "Username and avatar background color are required",
  "error": "BadRequest"
}
```

### Error (400 Bad Request - Username Taken)
```json
{
  "statusCode": 400,
  "message": "Username is already taken",
  "error": "BadRequest"
}
```

### Error (400 Bad Request - Invalid Color)
```json
{
  "statusCode": 400,
  "message": "Invalid color format. Must be a hex color (e.g., #FF5733)",
  "error": "BadRequest"
}
```

### Error (401 Unauthorized - Invalid Session)
```json
{
  "statusCode": 401,
  "message": "Invalid or expired onboarding session",
  "error": "Unauthorized"
}
```

### Error (409 Conflict - Username Conflict)
When two users try to claim the same username simultaneously, the second one gets this error.

```json
{
  "statusCode": 409,
  "message": "Username is already taken. Please choose another.",
  "error": "Conflict"
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

- Validate onboarding session (check expiration, verify session_id)
- Validate username: non-empty, 1-50 characters, alphanumeric + underscores
- Check username availability (query database)
- Validate avatar background color (must be from predefined palette)
- If username taken: Return 409 Conflict error
- If valid: Create user account with username and color
- Generate access token (1 hour expiration)
- Generate refresh token (30 days expiration)
- Hash refresh token before storing
- Store refresh token in database
- Clear onboarding session data
- Return tokens and user info
- Handle concurrent username selection (database UNIQUE constraint prevents duplicates)

## Username Validation

**Rules**:
- Length: 1-50 characters
- Characters: Alphanumeric (a-z, A-Z, 0-9) and underscores (_)
- Must be unique (enforced by database UNIQUE constraint)
- Case-insensitive comparison (store lowercase, compare lowercase)

**Validation Pattern**: `^[a-zA-Z0-9_]{1,50}$`

## Avatar Background Color Validation

**Predefined Palette** (20 colors):
- `#1a1a1a` (Dark gray - default)
- `#FF5733`, `#33FF57`, `#3357FF`, `#FF33F5`, `#F5FF33`
- `#33FFF5`, `#FF8C33`, `#8C33FF`, `#FF3366`, `#33FF8C`
- `#338CFF`, `#FFD700`, `#FF6347`, `#00CED1`, `#9370DB`
- `#FF1493`, `#00FF7F`, `#FF4500`, `#4169E1`

**Validation**: Must match one of the predefined colors exactly (case-insensitive).

## Security Considerations

- Validate onboarding session expiration
- Verify session_id belongs to authenticated Google user
- Prevent username enumeration (generic error messages)
- Rate limit onboarding completion attempts
- Log onboarding completion events
- Handle concurrent username selection gracefully
