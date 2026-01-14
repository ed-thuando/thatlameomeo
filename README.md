# Thatlameomeo - Story Sharing App

A social story-sharing web application where users can share daily thoughts and emotions, interact with posts, and track their daily MeoMeo scores.

## Tech Stack

- **Frontend**: React 18+ with Vite, TypeScript
- **Backend**: Netlify Functions (Node.js/TypeScript)
- **Database**: Turso (cloud SQLite)
- **Authentication**: JWT tokens
- **Deployment**: Netlify

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Turso account (free tier sufficient) - [Sign up here](https://turso.tech)
- Netlify CLI (for local development) - `npm install -g netlify-cli`

## Local Development Setup

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
2. Install Turso CLI: `brew install tursodatabase/tap/turso` (macOS) or see [Turso docs](https://docs.turso.tech/cli/installation)
3. Login: `turso auth login`
4. Create a database: `turso db create thatlameomeo`
5. Get your database URL and auth token:
   ```bash
   turso db show thatlameomeo
   # Note the URL and auth token
   ```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# Copy the example file
cp .env.example .env.local
```

Then edit `.env.local` with your values:

```env
# Turso Database
TURSO_DATABASE_URL=libsql://your-database-name-org.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here

# JWT Secret (generate a strong random string)
# You can generate one with: openssl rand -base64 32
JWT_SECRET=your-strong-random-secret-key-here

# Netlify (for local dev)
NETLIFY_DEV=true
```

### 4. Run Database Migrations

```bash
# Run initial schema migration
turso db shell thatlameomeo < migrations/001_initial_schema.sql

# Run additional migrations (likes, comments, etc.)
turso db shell thatlameomeo < migrations/002_add_likes_comments.sql
```

### 5. Create User Accounts

Since the app uses admin-provided accounts (no sign-up), you need to create users manually:

```bash
# Using the helper script
node scripts/create-user.js <username> <password>

# Example:
node scripts/create-user.js admin mypassword123
node scripts/create-user.js alice secretpass
node scripts/create-user.js bob password123
```

Or manually using Turso CLI:

```bash
# First, hash your password using the helper script
node scripts/hash-password.js mypassword123

# Then insert the user (replace <hashed-password> with the output)
turso db shell thatlameomeo
INSERT INTO users (username, password_hash, meomeo_score, theme_preference)
VALUES ('admin', '<hashed-password>', 0, 'default');
```

### 6. Start Development Servers

You'll need two terminal windows:

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will be available at http://localhost:3000

**Terminal 2 - Netlify Functions (Backend):**
```bash
# From project root
netlify dev
```
Functions will be available at http://localhost:8888/.netlify/functions/

The frontend is configured to proxy API requests to the Netlify Functions automatically.

## Running the Application

1. Open http://localhost:3000 in your browser
2. Login with one of the accounts you created
3. Start sharing stories!

## Creating User Accounts

### Method 1: Using the Helper Script (Recommended)

```bash
node scripts/create-user.js <username> <password>

# Examples:
node scripts/create-user.js admin admin123
node scripts/create-user.js alice alice123
node scripts/create-user.js bob bob123
```

### Method 2: Manual Creation

1. Hash a password:
   ```bash
   node scripts/hash-password.js yourpassword
   ```

2. Insert user into database:
   ```bash
   turso db shell thatlameomeo
   ```
   Then in the SQL shell:
   ```sql
   INSERT INTO users (username, password_hash, meomeo_score, theme_preference, display_name)
   VALUES ('username', '<hashed-password-from-step-1>', 0, 'default', 'Display Name');
   ```

## Project Structure

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
│       ├── likes.ts
│       ├── comments.ts
│       ├── shares.ts
│       └── utils/
├── migrations/            # Database migrations
├── scripts/               # Helper scripts
├── .env.local            # Environment variables (git-ignored)
└── netlify.toml          # Netlify configuration
```

## Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Backend Functions
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TURSO_DATABASE_URL` | Turso database connection URL | Yes |
| `TURSO_AUTH_TOKEN` | Turso database authentication token | Yes |
| `JWT_SECRET` | Secret key for JWT token signing | Yes |
| `NETLIFY_DEV` | Enable Netlify dev mode | Optional |

## Troubleshooting

### Functions Not Found
- Ensure functions are in `netlify/functions/` directory
- Check `netlify.toml` functions path is correct
- Verify function exports default handler
- Make sure `netlify dev` is running

### Database Connection Errors
- Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set in `.env.local`
- Check Turso database is active
- Ensure network allows outbound connections
- Try running: `turso db show thatlameomeo` to verify connection

### JWT Token Errors
- Verify `JWT_SECRET` is set in environment
- Check token expiration (default 24h)
- Ensure token is included in Authorization header

### CORS Issues
- Netlify Functions handle CORS automatically
- If issues occur, check `netlify/functions/utils/errors.ts` for CORS configuration

### Port Already in Use
- Frontend default port: 3000 (change in `frontend/vite.config.ts`)
- Netlify dev default port: 8888 (change with `netlify dev --port <port>`)

## Deployment to Netlify

1. Install Netlify CLI: `npm install -g netlify-cli`
2. Login: `netlify login`
3. Initialize site: `netlify init`
4. Add environment variables in Netlify dashboard:
   - Go to Site Settings → Environment Variables
   - Add all variables from `.env.local`
5. Deploy: `netlify deploy --prod`

## Features

- ✅ User authentication with JWT
- ✅ Create and share stories (public/private)
- ✅ Like and comment on posts
- ✅ Share posts with shareable links
- ✅ Profile management (avatar, display name)
- ✅ Archive and delete posts
- ✅ Daily MeoMeo score tracking
- ✅ Theme selection (4 cat-themed styles)
- ✅ User feed with interactions

## License

MIT
