# Research: Google OAuth Login with Onboarding

**Date**: 2025-01-27  
**Feature**: 001-google-login

## Technology Decisions

### 1. Google OAuth 2.0 Implementation Approach

**Decision**: Implement custom Google OAuth 2.0 flow (not Firebase Auth) using Google Identity Services library on frontend and google-auth-library on backend.

**Rationale**:
- Full control over authentication flow and token management
- Direct integration with existing JWT system
- No vendor lock-in to Firebase ecosystem
- Smaller bundle size (only OAuth libraries, not full Firebase SDK)
- Works seamlessly with existing Netlify Functions architecture
- Cost-effective (no per-user fees, only Google OAuth API usage which is free)
- Matches existing architecture pattern (custom implementation)

**Alternatives Considered**:
- Firebase Auth: Adds vendor lock-in, larger bundle size, requires Firebase SDK integration
- Passport.js with Google Strategy: Overkill for single provider, adds unnecessary abstraction layer
- Manual OAuth flow: Too complex, error-prone, Google Identity Services handles edge cases

**Implementation Notes**:
- Frontend: Use `@react-oauth/google` or Google Identity Services (gsi) library
- Backend: Use `google-auth-library` npm package for token verification
- OAuth flow: Authorization code flow with PKCE for security
- Token storage: Access tokens in localStorage, refresh tokens in database
- Token verification: Verify Google ID tokens on backend before issuing app JWT tokens

### 2. Frontend OAuth Library

**Decision**: Use `@react-oauth/google` React library for Google OAuth integration.

**Rationale**:
- React-specific wrapper around Google Identity Services
- Handles OAuth flow, token management, and error states
- Provides React hooks and components for easy integration
- Maintained by Google, actively updated
- Smaller bundle than full Firebase SDK
- Works with existing React 18+ setup

**Alternatives Considered**:
- Direct Google Identity Services (gsi): More manual work, no React integration
- Firebase Auth SDK: Larger bundle, vendor lock-in
- Custom OAuth implementation: Too complex, error-prone

**Implementation Notes**:
- Install: `npm install @react-oauth/google`
- Configure with Google OAuth client ID
- Use `GoogleOAuthProvider` to wrap app
- Use `useGoogleLogin` hook for login button
- Handle OAuth callback and extract ID token
- Send ID token to backend for verification

### 3. Backend Token Verification

**Decision**: Use `google-auth-library` npm package for verifying Google ID tokens on backend.

**Rationale**:
- Official Google library for Node.js
- Handles token verification, expiration, and signature validation
- Supports multiple Google OAuth client IDs
- Proper error handling for invalid/expired tokens
- Works with Netlify Functions (Node.js environment)
- Secure token verification without manual crypto operations

**Alternatives Considered**:
- Manual JWT verification: Error-prone, security risks, complex signature validation
- Third-party JWT libraries: Less reliable than official Google library
- Firebase Admin SDK: Overkill, adds unnecessary dependencies

**Implementation Notes**:
- Install: `npm install google-auth-library`
- Create OAuth2Client instance with client ID
- Verify ID token: `await client.verifyIdToken({ idToken, audience: CLIENT_ID })`
- Extract user info: email, name, picture from verified token payload
- Handle verification errors: expired tokens, invalid signatures, wrong audience

### 4. Refresh Token Storage and Security

**Decision**: Store refresh tokens in database (users table) with hashing/encryption, expire after 30 days.

**Rationale**:
- Database storage allows token revocation and management
- Hashing prevents token theft if database is compromised
- 30-day expiration balances security and user experience
- Can invalidate tokens on logout or security events
- Enables token rotation if needed in future
- Works with existing Turso database infrastructure

**Alternatives Considered**:
- Store in localStorage: Not secure, can't revoke, lost on clear cache
- Store in httpOnly cookies: More secure but complex for serverless, CORS issues
- JWT-based refresh tokens: No revocation capability, stateless but less secure

**Implementation Notes**:
- Add `refresh_token` column to users table (hashed/encrypted)
- Add `refresh_token_expires_at` column for expiration tracking
- Hash refresh tokens using bcrypt (same as password hashing)
- Generate secure random tokens using crypto.randomBytes
- Validate expiration before accepting refresh token
- Invalidate refresh token on logout or security events

### 5. Access Token Lifetime and Refresh Strategy

**Decision**: Short-lived access tokens (1 hour) with automatic refresh before expiration.

**Rationale**:
- 1-hour expiration minimizes security risk if token is compromised
- Automatic refresh prevents user interruption
- Refresh before expiration (e.g., at 50 minutes) ensures seamless experience
- Short lifetime reduces attack window
- Matches industry best practices for OAuth access tokens

**Alternatives Considered**:
- 24-hour access tokens: Too long, higher security risk
- Refresh on-demand only: User interruption when token expires
- No expiration: Security risk, no way to revoke access

**Implementation Notes**:
- Issue access tokens with 1-hour expiration (existing JWT system)
- Store expiration time in token payload (JWT `exp` claim)
- Frontend checks token expiration before API requests
- Automatically call refresh endpoint when token < 10 minutes remaining
- Refresh endpoint validates refresh token and issues new access token
- Handle refresh failures gracefully (redirect to login)

### 6. Onboarding Session Persistence

**Decision**: Store onboarding session in database with 24-hour expiration, keyed by Google ID token.

**Rationale**:
- Database storage persists across browser sessions
- 24-hour expiration balances security and user convenience
- Allows users to resume onboarding if browser closes
- Can track onboarding progress and validate session
- Works with serverless architecture (no server-side sessions)

**Alternatives Considered**:
- localStorage only: Lost if user clears cache, not secure
- Server-side sessions: Doesn't work with serverless, requires session storage
- No persistence: Poor UX, users must restart onboarding

**Implementation Notes**:
- Create `onboarding_sessions` table or add columns to users table
- Store Google ID token hash, pending username, pending color
- Set expiration timestamp (24 hours from creation)
- Validate session on resume (check expiration, verify Google token)
- Clean up expired sessions periodically

### 7. Username Validation Timing

**Decision**: Validate username availability on blur (field exit) with debouncing.

**Rationale**:
- On blur provides immediate feedback without excessive API calls
- Debouncing prevents race conditions and reduces server load
- Better UX than validation only on submit (catches errors early)
- Balances responsiveness with performance
- Reduces unnecessary API calls compared to keystroke validation

**Alternatives Considered**:
- Validate on every keystroke: Too many API calls, performance issues
- Validate only on submit: Poor UX, user must wait for error
- Real-time validation with debouncing: More complex, similar UX to blur

**Implementation Notes**:
- Frontend: Validate on `onBlur` event
- Add debouncing (300-500ms) to prevent rapid blur/focus
- Call `/users/check-username` endpoint
- Show error message if username taken
- Clear error when user starts typing again
- Final validation on submit as safety check

### 8. Account Linking Strategy

**Decision**: Automatically link Google account to existing account when email matches.

**Rationale**:
- Seamless user experience - no confusion about duplicate accounts
- Prevents account fragmentation
- Users can access existing data with Google login
- Matches user expectation (same email = same account)
- Reduces support burden

**Alternatives Considered**:
- Prevent linking, show error: Confusing UX, users lose access to existing account
- Require password confirmation: Extra friction, defeats purpose of OAuth
- Create separate account: Account fragmentation, data loss

**Implementation Notes**:
- Check if Google email matches existing user email
- If match found, link Google ID to existing account
- Update `google_id` and `google_email` columns
- Issue tokens and log in user automatically
- Preserve existing username and profile data

### 9. Token Refresh Endpoint Design

**Decision**: Create dedicated `/refresh` endpoint that accepts refresh token and returns new access token.

**Rationale**:
- Clear separation of concerns (refresh vs authentication)
- Standard OAuth 2.0 pattern
- Easy to secure and rate limit
- Can add additional validation (device fingerprinting, IP checks)
- Works with existing Netlify Functions architecture

**Alternatives Considered**:
- Refresh via login endpoint: Confusing, mixes concerns
- Automatic refresh in middleware: Less control, harder to debug
- Client-side token extension: Security risk, not recommended

**Implementation Notes**:
- Endpoint: `POST /.netlify/functions/refresh`
- Accept refresh token in request body
- Validate refresh token (check hash, expiration, user association)
- Issue new access token (1 hour expiration)
- Return new access token in response
- Handle errors: invalid token, expired token, user not found

### 10. Error Handling and User Feedback

**Decision**: Provide clear, user-friendly error messages for all OAuth and onboarding errors.

**Rationale**:
- Better user experience - users understand what went wrong
- Reduces support burden
- Helps users recover from errors
- Matches existing error handling patterns in app

**Alternatives Considered**:
- Generic error messages: Poor UX, users confused
- Technical error messages: Too complex for end users
- Silent failures: Worst UX, users don't know what happened

**Implementation Notes**:
- Google OAuth errors: "Unable to sign in with Google. Please try again."
- Missing email error: "Your Google account must have an email address to use this app."
- Username taken: "This username is already taken. Please choose another."
- Token refresh errors: "Your session has expired. Please sign in again."
- Network errors: "Connection error. Please check your internet and try again."

## Integration Points

### Existing Systems
- **JWT Authentication**: Extend existing JWT system to support refresh tokens
- **User Database**: Add OAuth columns to existing users table
- **API Client**: Update to handle automatic token refresh
- **Login Page**: Add Google login button alongside existing username/password
- **Profile System**: Reuse existing avatar color picker for onboarding

### New Components
- **Google OAuth Provider**: Wrap app with GoogleOAuthProvider
- **Onboarding Screen**: New component for username and color selection
- **Token Refresh Logic**: Automatic refresh in API client
- **Google Auth Function**: New Netlify Function for OAuth verification
- **Refresh Function**: New Netlify Function for token refresh

## Security Considerations

1. **Refresh Token Security**: Hash tokens in database, use secure random generation
2. **Token Expiration**: Enforce expiration on both access and refresh tokens
3. **Token Revocation**: Invalidate refresh tokens on logout
4. **HTTPS Only**: All OAuth flows must use HTTPS
5. **CSRF Protection**: Use state parameter in OAuth flow
6. **Token Storage**: Access tokens in memory when possible, localStorage as fallback
7. **Error Messages**: Don't leak sensitive information in error messages

## Performance Considerations

1. **Token Verification**: Cache Google public keys to reduce verification time
2. **Username Validation**: Debounce validation requests to reduce server load
3. **Token Refresh**: Refresh proactively before expiration to avoid blocking requests
4. **Database Queries**: Index google_id and google_email columns for fast lookups
5. **Onboarding Session**: Clean up expired sessions periodically
