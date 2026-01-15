# Quick Setup Guide

## Step 1: Install Dependencies

```bash
# Frontend dependencies
cd frontend
npm install

# Backend function dependencies
cd ../netlify/functions
npm install

# Script dependencies (for user creation)
cd ../../scripts
npm install
```

## Step 2: Set Up Turso Database

1. **Install Turso CLI:**
   ```bash
   # macOS
   brew install tursodatabase/tap/turso
   
   # Or see: https://docs.turso.tech/cli/installation
   ```

2. **Login to Turso:**
   ```bash
   turso auth login
   ```

3. **Create a database:**
   ```bash
   turso db create thatlameomeo
   ```

4. **Get your database credentials:**
   ```bash
   turso db show thatlameomeo
   ```
   Note the URL and auth token.

## Step 3: Set Up Google OAuth (Required for Google Login)

### 3.1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter project name (e.g., "Thatlameomeo") and click "Create"

### 3.2: Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API" or "Google Identity Services"
3. Click on it and click **Enable**

### 3.3: Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you have a Google Workspace account)
3. Fill in required fields:
   - **App name**: Thatlameomeo (or your app name)
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue**
5. On **Scopes** page, click **Save and Continue** (no scopes needed for basic login)
6. On **Test users** page (if in testing), add test emails, then **Save and Continue**
7. Review and **Back to Dashboard**

### 3.4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Choose **Application type**: **Web application**
4. Enter **Name**: "Thatlameomeo Web Client"
5. **Authorized JavaScript origins**:
   - For local dev: `http://localhost:5173` (or your Vite dev port)
   - For production: `https://yourdomain.com`
6. **Authorized redirect URIs**:
   - For local dev: `http://localhost:5173` (or your Vite dev port)
   - For production: `https://yourdomain.com`
   - Note: Google OAuth doesn't require a specific redirect URI for the popup flow
7. Click **Create**
8. **Copy the Client ID** (you'll need this)

### 3.5: Configure Environment Variables

Create `.env.local` in the project root:

```bash
# From project root
cat > .env.local << EOF
TURSO_DATABASE_URL=libsql://your-database-name-org.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
JWT_SECRET=$(openssl rand -base64 32)
NETLIFY_DEV=true

# Google OAuth (Frontend - Vite uses VITE_ prefix)
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com

# Google OAuth (Backend - Netlify Functions)
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
EOF
```

Replace:
- `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` with values from Step 2
- `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` with your Google Client ID from Step 3.4

**Note**: For Netlify deployment, also add these environment variables in the Netlify dashboard:
- Go to **Site Settings** → **Environment Variables**
- Add `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` with the same value

## Step 4: Run Database Migrations

```bash
# Run initial schema
turso db shell thatlameomeo < migrations/001_initial_schema.sql

# Run additional migrations
turso db shell thatlameomeo < migrations/002_add_likes_comments.sql
turso db shell thatlameomeo < migrations/003_add_daily_score_tracking.sql
turso db shell thatlameomeo < migrations/004_add_avatar_bg_color.sql
turso db shell thatlameomeo < migrations/005_add_google_oauth.sql
```

## Step 5: Create User Accounts

```bash
# From project root
node scripts/create-user.js admin admin123
node scripts/create-user.js alice alice123
node scripts/create-user.js bob bob123
```

## Step 6: Start Development Servers

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
Open http://localhost:3000

**Terminal 2 - Backend:**
```bash
# From project root
netlify dev
```

## Step 7: Login and Test

1. Go to http://localhost:3000
2. Login with one of the accounts you created (e.g., `admin` / `admin123`)
3. Start sharing stories!

## Troubleshooting

### Scripts don't work
Make sure you installed dependencies in the scripts directory:
```bash
cd scripts
npm install
```

### Database connection errors
- Verify `.env.local` has correct `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
- Test connection: `turso db shell thatlameomeo`

### Port conflicts
- Frontend: Change port in `frontend/vite.config.ts`
- Backend: Use `netlify dev --port 8889`
