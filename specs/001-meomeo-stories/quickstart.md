# Quickstart Guide: Thatlameomeo Story Sharing App

**Date**: 2025-01-27  
**Feature**: 001-meomeo-stories

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Turso account (free tier sufficient)
- Netlify account (free tier sufficient)
- Git repository initialized

## Initial Setup

### 1. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend function dependencies
cd ../netlify/functions
npm install
```

### 2. Set Up Turso Database

1. Create a Turso account at https://turso.tech
2. Create a new database
3. Get your database URL and auth token
4. Run the initial migration:

```bash
# Using Turso CLI or SQL client
turso db shell <your-db-name> < migrations/001_initial_schema.sql
```

### 3. Configure Environment Variables

Create `.env.local` in project root:

```bash
# Turso Database
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token

# JWT Secret (generate a strong random string)
JWT_SECRET=your-strong-random-secret-key

# Netlify (for local dev)
NETLIFY_DEV=true
```

For Netlify deployment, add these in Netlify dashboard:
- Go to Site Settings → Environment Variables
- Add all variables from `.env.local`

### 4. Create Initial Admin User

```bash
# Using Turso CLI or SQL client
# Hash password using bcrypt (use online tool or Node.js script)
# Insert user:
INSERT INTO users (username, password_hash, meomeo_score, theme_preference)
VALUES ('admin', '<hashed-password>', 0, 'default');
```

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

### Project Structure

```
thatlameomeo/
├── frontend/              # React + Vite app
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   └── hooks/         # Custom React hooks
│   └── package.json
├── netlify/
│   └── functions/         # Serverless API functions
│       ├── login.ts
│       ├── stories.ts
│       ├── users.ts
│       └── utils/
│           ├── db.ts      # Database connection
│           └── auth.ts    # JWT utilities
├── migrations/            # Database migrations
└── .env.local             # Environment variables (git-ignored)
```

## Testing the Application

### 1. Login

- Navigate to login page
- Enter admin credentials (username/password you created)
- Should receive JWT token and redirect to home

### 2. Create Story

- On home page, use story creation box
- Enter story content
- Select public or private visibility
- Submit - MeoMeo score should increment

### 3. View Public Stories

- Home page should display public stories feed
- Stories ordered by creation date (newest first)
- Each story shows author username and timestamp

### 4. View User Scores

- User list section shows all users with MeoMeo scores
- Sorted by score (highest first) by default
- Can sort by username or score

### 5. Change Theme

- Access theme selector (location TBD in UI)
- Select different cat-themed style
- UI should update immediately
- Theme preference persists across sessions

## Deployment to Netlify

### Initial Deployment

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy to preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

### Build Configuration

Create `netlify.toml` in project root:

```toml
[build]
  command = "cd frontend && npm run build"
  publish = "frontend/dist"
  functions = "netlify/functions"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Environment Variables on Netlify

1. Go to Site Settings → Environment Variables
2. Add all variables from `.env.local`
3. Ensure `JWT_SECRET` is strong and unique
4. Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`

## Common Issues

### Functions Not Found

- Ensure functions are in `netlify/functions/` directory
- Check `netlify.toml` functions path is correct
- Verify function exports default handler

### Database Connection Errors

- Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set
- Check Turso database is active
- Ensure network allows outbound connections

### JWT Token Errors

- Verify `JWT_SECRET` is set in environment
- Check token expiration (default 24h)
- Ensure token is included in Authorization header

### CORS Issues

- Netlify Functions handle CORS automatically
- If issues occur, add CORS headers in function responses

## Next Steps

1. Implement user stories in priority order (P1 → P4)
2. Add error handling and loading states
3. Implement theme system with CSS variables
4. Add integration tests for critical flows
5. Set up CI/CD pipeline for automated testing

## Resources

- [Vite Documentation](https://vitejs.dev)
- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Turso Documentation](https://docs.turso.tech)
- [React Documentation](https://react.dev)
