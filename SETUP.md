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

## Step 3: Configure Environment Variables

Create `.env.local` in the project root:

```bash
# From project root
cat > .env.local << EOF
TURSO_DATABASE_URL=libsql://your-database-name-org.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
JWT_SECRET=$(openssl rand -base64 32)
NETLIFY_DEV=true
EOF
```

Replace the `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` with values from Step 2.

## Step 4: Run Database Migrations

```bash
# Run initial schema
turso db shell thatlameomeo < migrations/001_initial_schema.sql

# Run additional migrations
turso db shell thatlameomeo < migrations/002_add_likes_comments.sql
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
