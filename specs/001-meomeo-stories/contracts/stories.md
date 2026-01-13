# Stories API Contract

## Create Story

**Endpoint**: `POST /.netlify/functions/stories`  
**Function**: `netlify/functions/stories.ts`  
**Authentication**: Required (JWT token)

### Request

#### Headers
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

#### Body
```json
{
  "content": "string",
  "visibility": "public" | "private"
}
```

#### Validation
- `content`: Required, non-empty string, max 5000 characters
- `visibility`: Required, must be "public" or "private"

### Response

#### Success (201 Created)
```json
{
  "id": "number",
  "user_id": "number",
  "content": "string",
  "visibility": "string",
  "created_at": "string (ISO 8601)",
  "meomeo_score": "number (updated score)"
}
```

#### Error (400 Bad Request)
```json
{
  "error": "Content is required and cannot be empty"
}
```

#### Error (401 Unauthorized)
```json
{
  "error": "Authentication required"
}
```

## Get Public Stories

**Endpoint**: `GET /.netlify/functions/stories?limit={number}&offset={number}`  
**Function**: `netlify/functions/stories.ts`  
**Authentication**: Required (JWT token)

### Request

#### Headers
```
Authorization: Bearer {JWT_TOKEN}
```

#### Query Parameters
- `limit`: Optional, default 20, max 100 (number of stories to return)
- `offset`: Optional, default 0 (pagination offset)

### Response

#### Success (200 OK)
```json
{
  "stories": [
    {
      "id": "number",
      "user_id": "number",
      "username": "string",
      "content": "string",
      "visibility": "public",
      "created_at": "string (ISO 8601)"
    }
  ],
  "total": "number",
  "limit": "number",
  "offset": "number"
}
```

#### Error (401 Unauthorized)
```json
{
  "error": "Authentication required"
}
```

## Get User's Own Stories

**Endpoint**: `GET /.netlify/functions/stories/me`  
**Function**: `netlify/functions/stories.ts`  
**Authentication**: Required (JWT token)

### Request

#### Headers
```
Authorization: Bearer {JWT_TOKEN}
```

### Response

#### Success (200 OK)
```json
{
  "stories": [
    {
      "id": "number",
      "user_id": "number",
      "content": "string",
      "visibility": "public" | "private",
      "created_at": "string (ISO 8601)"
    }
  ]
}
```

#### Error (401 Unauthorized)
```json
{
  "error": "Authentication required"
}
```

## Implementation Notes

- Create story: Insert into database, increment user's meomeo_score atomically
- Get public stories: Only return stories where visibility = 'public', ordered by created_at DESC
- Get user's stories: Return all stories for authenticated user (both public and private)
- Use transactions for story creation + score increment to ensure consistency
- Validate JWT token on all endpoints
- Extract user_id from JWT token payload
