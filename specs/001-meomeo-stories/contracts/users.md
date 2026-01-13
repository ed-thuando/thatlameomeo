# Users API Contract

## Get All Users with Scores

**Endpoint**: `GET /.netlify/functions/users?sort={field}&order={asc|desc}`  
**Function**: `netlify/functions/users.ts`  
**Authentication**: Required (JWT token)

### Request

#### Headers
```
Authorization: Bearer {JWT_TOKEN}
```

#### Query Parameters
- `sort`: Optional, default "meomeo_score" (field to sort by: "meomeo_score" or "username")
- `order`: Optional, default "desc" (sort order: "asc" or "desc")

### Response

#### Success (200 OK)
```json
{
  "users": [
    {
      "id": "number",
      "username": "string",
      "meomeo_score": "number"
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

## Get User by ID

**Endpoint**: `GET /.netlify/functions/users/:id`  
**Function**: `netlify/functions/users.ts`  
**Authentication**: Required (JWT token)

### Request

#### Headers
```
Authorization: Bearer {JWT_TOKEN}
```

#### Path Parameters
- `id`: User ID (number)

### Response

#### Success (200 OK)
```json
{
  "id": "number",
  "username": "string",
  "meomeo_score": "number",
  "theme_preference": "string"
}
```

#### Error (404 Not Found)
```json
{
  "error": "User not found"
}
```

#### Error (401 Unauthorized)
```json
{
  "error": "Authentication required"
}
```

## Update Theme Preference

**Endpoint**: `PUT /.netlify/functions/users/me/theme`  
**Function**: `netlify/functions/users.ts`  
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
  "theme": "string"
}
```

#### Validation
- `theme`: Required, must be one of: "default", "orange-cat", "gray-cat", "calico-cat"

### Response

#### Success (200 OK)
```json
{
  "id": "number",
  "username": "string",
  "theme_preference": "string"
}
```

#### Error (400 Bad Request)
```json
{
  "error": "Invalid theme. Must be one of: default, orange-cat, gray-cat, calico-cat"
}
```

#### Error (401 Unauthorized)
```json
{
  "error": "Authentication required"
}
```

## Implementation Notes

- Get all users: Return all users with their MeoMeo scores, sorted by score DESC by default
- Get user by ID: Return user info (excluding password_hash)
- Update theme: Only allow updating own theme (user_id from JWT token)
- Validate JWT token on all endpoints
- Extract user_id from JWT token payload for "me" endpoints
