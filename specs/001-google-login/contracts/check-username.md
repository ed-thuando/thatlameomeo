# Username Availability Check API Contract

**Endpoint**: `GET /.netlify/functions/users/check-username?username={username}`  
**Function**: `netlify/functions/users.ts` (new handler)  
**Authentication**: Not required (public endpoint for validation)

## Request

### Headers
```
Content-Type: application/json
```

### Query Parameters
- `username`: Required, string, 1-50 characters

### Validation
- `username`: Required, non-empty string, 1-50 characters

## Response

### Success - Username Available (200 OK)
```json
{
  "available": true,
  "username": "string"
}
```

### Success - Username Taken (200 OK)
```json
{
  "available": false,
  "username": "string",
  "message": "Username is already taken"
}
```

### Error (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Username is required",
  "error": "BadRequest"
}
```

### Error (400 Bad Request - Invalid Format)
```json
{
  "statusCode": 400,
  "message": "Username must be 1-50 characters and contain only letters, numbers, and underscores",
  "error": "BadRequest"
}
```

## Implementation Notes

- Extract username from query parameter
- Validate username format (alphanumeric + underscores, 1-50 chars)
- Query database for username (case-insensitive)
- Return availability status
- This endpoint is called on blur during onboarding
- Debounce requests on frontend to reduce server load
- No authentication required (public validation endpoint)

## Security Considerations

- Rate limit to prevent abuse
- Validate input format before database query
- Use parameterized queries to prevent SQL injection
- Don't expose sensitive user information in responses
- Consider CAPTCHA for high-frequency requests

## Performance Considerations

- Use indexed username column for fast lookups
- Cache results briefly to reduce database load
- Return quickly (< 500ms per spec requirement)
