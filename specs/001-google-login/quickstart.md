# Quickstart Guide: Google OAuth Login with Onboarding

**Date**: 2025-01-27  
**Feature**: 001-google-login

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Google Cloud Console account
- OAuth 2.0 Client ID from Google Cloud Console
- Existing thatlameomeo app setup (from 001-meomeo-stories)

## Initial Setup

### 1. Set Up Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing project
3. Enable Google+ API (or Google Identity Services)
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen:
   - User Type: External (for public users)
   - App name: Thatlameomeo
   - Scopes: `openid`, `email`, `profile`
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:5173` (dev), `https://your-site.netlify.app` (prod)
   - Authorized redirect URIs: `http://localhost:5173` (dev), `https://your-site.netlify.app` (prod)
7. Copy Client ID and Client Secret

### 2. Install Dependencies

```bash
# Frontend dependencies
cd frontend
npm install @react-oauth/google

# Backend function dependencies
cd ../netlify/functions
npm install google-auth-library
```

### 3. Run Database Migration

```bash
# Run migration to add Google OAuth columns
turso db shell <your-db-name> < migrations/005_add_google_oauth.sql
```

Migration file creates:
- `google_id` column (unique, nullable)
- `google_email` column (nullable)
- `refresh_token` column (nullable, hashed)
- `refresh_token_expires_at` column (nullable)
- `onboarding_username`, `onboarding_color`, `onboarding_expires_at` columns (temporary)

### 4. Configure Environment Variables

Update `.env.local` in project root:

```bash
# Existing variables
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
JWT_SECRET=your-strong-random-secret-key
NETLIFY_DEV=true

# New Google OAuth variables
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

For Netlify deployment:
1. Go to Site Settings → Environment Variables
2. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
3. Update authorized redirect URIs in Google Console to match Netlify URL

## Development Workflow

### Start Development Server

```bash
# Terminal 1: Frontend dev server
cd frontend
npm run dev
# Frontend available at http://localhost:5173

# Terminal 2: Netlify Functions (local)
netlify dev
# Functions available at http://localhost:8888/.netlify/functions/
```

### Updated Project Structure

```
thatlameomeo/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx          # Updated with Google button
│   │   │   │   └── OnboardingScreen.tsx   # New: username + color selection
│   │   │   └── users/
│   │   │       └── AvatarEditor.tsx       # Reused for color picker
│   │   ├── services/
│   │   │   ├── auth.ts                    # Updated with OAuth and refresh
│   │   │   └── api.ts                     # Updated with auto-refresh
│   │   └── hooks/
│   │       └── useAuth.ts                 # Updated for refresh tokens
│   └── package.json
├── netlify/
│   └── functions/
│       ├── google-auth.ts                 # New: Google OAuth verification
│       ├── refresh.ts                     # New: Token refresh endpoint
│       ├── onboarding.ts                  # New: Complete onboarding
│       ├── login.ts                       # Existing: Manual login
│       └── utils/
│           ├── auth.ts                    # Updated: Refresh token functions
│           └── google.ts                  # New: Google token verification
└── migrations/
    └── 005_add_google_oauth.sql           # New: OAuth columns
```

## Testing the Feature

### 1. Google OAuth Login

1. Navigate to login page
2. Click "Sign in with Google" button
3. Select Google account in popup
4. Grant permissions (email, profile)
5. Should redirect back to app with Google ID token

### 2. New User Onboarding

1. Complete Google OAuth login (first time)
2. Should see onboarding screen
3. Enter desired username
4. Username validation on blur (check availability)
5. Select avatar background color from palette
6. Submit form
7. Should create account, issue tokens, redirect to home

### 3. Existing User Login

1. Complete Google OAuth login (returning user)
2. Should skip onboarding
3. Should receive access and refresh tokens
4. Should redirect to home page

### 4. Account Linking

1. Create manual account (username/password)
2. Logout
3. Login with Google using same email
4. Should link Google account to existing account
5. Should log in automatically

### 5. Token Refresh

1. Login with Google
2. Wait for access token to expire (or manually expire)
3. Make API request
4. Should automatically refresh token
5. Request should succeed without user interruption

### 6. Username Validation

1. Start onboarding
2. Enter username
3. Leave field (blur event)
4. Should check availability
5. If taken, show error message
6. If available, show success or no message

## Implementation Checklist

### Frontend

- [ ] Install `@react-oauth/google` package
- [ ] Wrap app with `GoogleOAuthProvider`
- [ ] Add Google login button to `LoginForm`
- [ ] Create `OnboardingScreen` component
- [ ] Implement username input with blur validation
- [ ] Integrate color picker (reuse `AvatarEditor`)
- [ ] Update `auth.ts` service with OAuth functions
- [ ] Update `api.ts` with automatic token refresh
- [ ] Update `useAuth` hook for refresh token handling
- [ ] Handle OAuth callback and extract ID token
- [ ] Send ID token to backend for verification

### Backend

- [ ] Install `google-auth-library` package
- [ ] Create `google-auth.ts` function
- [ ] Create `refresh.ts` function
- [ ] Create `onboarding.ts` function
- [ ] Update `users.ts` with username check endpoint
- [ ] Create `utils/google.ts` for token verification
- [ ] Update `utils/auth.ts` with refresh token functions
- [ ] Run database migration
- [ ] Add environment variables
- [ ] Test token verification
- [ ] Test refresh token flow
- [ ] Test onboarding completion

### Database

- [ ] Run migration `005_add_google_oauth.sql`
- [ ] Verify new columns created
- [ ] Verify indexes created
- [ ] Test username uniqueness constraint
- [ ] Test Google ID uniqueness

## Common Issues

### Google OAuth Popup Blocked

- Ensure authorized JavaScript origins include your domain
- Check browser popup blocker settings
- Verify HTTPS in production (required by Google)

### Invalid Client ID Error

- Verify `GOOGLE_CLIENT_ID` environment variable is set
- Check Client ID matches Google Console
- Ensure authorized redirect URIs are configured correctly

### Token Verification Fails

- Verify `GOOGLE_CLIENT_SECRET` is set correctly
- Check token hasn't expired (ID tokens expire quickly)
- Ensure Google+ API is enabled in Cloud Console

### Username Already Taken

- Check database for existing username
- Verify case-insensitive comparison
- Test concurrent username selection

### Refresh Token Not Working

- Verify refresh token is stored in database
- Check token expiration (`refresh_token_expires_at`)
- Ensure token is hashed correctly
- Verify refresh endpoint is called correctly

### Onboarding Session Expired

- Check `onboarding_expires_at` timestamp
- Verify session cleanup logic
- Test session persistence across browser restarts

## Deployment to Netlify

### Update Environment Variables

1. Go to Site Settings → Environment Variables
2. Add `GOOGLE_CLIENT_ID`
3. Add `GOOGLE_CLIENT_SECRET`
4. Update Google Console redirect URIs to match Netlify URL

### Update Google Console

1. Go to OAuth 2.0 Client ID settings
2. Add production URL to authorized JavaScript origins:
   - `https://your-site.netlify.app`
3. Add production URL to authorized redirect URIs:
   - `https://your-site.netlify.app`

### Deploy

```bash
# Deploy to preview
netlify deploy

# Test preview deployment
# Verify Google OAuth works with preview URL

# Deploy to production
netlify deploy --prod
```

## Security Checklist

- [ ] Refresh tokens are hashed before storage
- [ ] Access tokens expire after 1 hour
- [ ] Refresh tokens expire after 30 days
- [ ] Tokens invalidated on logout
- [ ] Google ID tokens verified on backend
- [ ] HTTPS required in production
- [ ] Environment variables not committed to git
- [ ] Rate limiting on authentication endpoints
- [ ] Error messages don't leak sensitive info

## Next Steps

1. Implement Google OAuth frontend integration
2. Create backend verification functions
3. Implement onboarding flow
4. Add token refresh logic
5. Test complete user journey
6. Add error handling and edge cases
7. Write integration tests
8. Deploy to preview environment
9. Test in production environment

## Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [@react-oauth/google GitHub](https://github.com/MomenSherif/react-oauth)
- [google-auth-library Documentation](https://github.com/googleapis/google-auth-library-nodejs)
- [OAuth 2.0 Best Practices](https://oauth.net/2/)
- [JWT Refresh Token Pattern](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)
