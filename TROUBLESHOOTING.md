# Troubleshooting Guide

## Common Issues and Solutions

### 1. Logo Import Error

**Error:**
```
Assets in public directory cannot be imported from JavaScript.
```

**Solution:**
✅ Fixed! The logo imports have been updated to use `/sad-cat-logo.svg` instead of importing from the public directory.

### 2. @libsql/client Native Module Error

**Error:**
```
Cannot find module '@libsql/darwin-arm64'
```

**Solution:**

This happens because `@libsql/client` uses platform-specific native bindings. The easiest fix is to use the provided script:

**Option 1: Use the install script (Recommended)**
```bash
# From project root
./scripts/install-native-deps.sh
```

**Option 2: Install platform-specific package manually**
```bash
cd netlify/functions

# For macOS ARM (M1/M2/M3):
npm install @libsql/darwin-arm64@^0.11.0 --save-optional

# For macOS Intel:
npm install @libsql/darwin-x64@^0.11.0 --save-optional

# For Linux:
npm install @libsql/linux-x64@^0.11.0 --save-optional

# For Windows:
npm install @libsql/win32-x64@^0.11.0 --save-optional
```

**Option 3: Reinstall all dependencies**
```bash
cd netlify/functions
rm -rf node_modules package-lock.json
npm install
```

**After installing, restart `netlify dev`:**
```bash
# Stop netlify dev (Ctrl+C), then:
netlify dev
```

### 3. Backend Connection Refused

**Error:**
```
http proxy error: /.netlify/functions/login
AggregateError [ECONNREFUSED]
```

**Solution:**
1. Make sure `netlify dev` is running in a separate terminal
2. Check that it's running on port 8888 (default)
3. Verify the proxy configuration in `frontend/vite.config.ts` points to `http://localhost:8888`

### 4. Database Connection Errors

**Error:**
```
Missing required environment variables: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
```

**Solution:**
1. Make sure `.env.local` exists in the project root
2. Verify it contains:
   ```env
   TURSO_DATABASE_URL=libsql://your-database-name-org.turso.io
   TURSO_AUTH_TOKEN=your-auth-token-here
   JWT_SECRET=your-secret-key
   ```
3. Restart `netlify dev` after changing environment variables

### 5. Login Returns 500 Error

**Possible causes:**
1. Database not connected (check environment variables)
2. User doesn't exist in database
3. @libsql/client native module issue (see issue #2 above)
4. JWT_SECRET not set

**Solution:**
1. Check that you've run database migrations:
   ```bash
   turso db shell thatlameomeo < migrations/001_initial_schema.sql
   turso db shell thatlameomeo < migrations/002_add_likes_comments.sql
   ```

2. Verify user exists:
   ```bash
   turso db shell thatlameomeo
   SELECT * FROM users;
   ```

3. Create a user if needed:
   ```bash
   node scripts/create-user.js admin admin123
   ```

4. Check backend logs in the `netlify dev` terminal for detailed error messages

### 6. Port Already in Use

**Error:**
```
Could not acquire required 'port': '8888'
```
or
```
Port 3000 is already in use
```

**Solution:**

**For Netlify dev port (8888):**
```bash
# Find and kill the process using port 8888
lsof -ti:8888 | xargs kill -9

# Or change the port in netlify.toml:
# [dev]
# port = 8889  # Use a different port
```

**For Frontend port (3000):**
- Change frontend port in `frontend/vite.config.ts`:
  ```ts
  server: {
    port: 3001, // or any available port
  }
  ```

- Or kill the process using the port:
  ```bash
  lsof -ti:3000 | xargs kill -9
  ```

### 7. TypeScript Errors

**Solution:**
```bash
# Frontend
cd frontend
npm run build  # This will show TypeScript errors

# Backend
cd netlify/functions
npx tsc --noEmit  # Check for TypeScript errors
```

## Getting Help

If you're still experiencing issues:

1. Check the terminal output for both frontend and backend
2. Look for error messages in the browser console (F12)
3. Verify all environment variables are set correctly
4. Make sure all dependencies are installed
5. Try restarting both development servers

## Quick Reset

If nothing works, try a complete reset:

```bash
# Clean all node_modules
rm -rf frontend/node_modules netlify/functions/node_modules scripts/node_modules

# Reinstall everything
cd frontend && npm install
cd ../netlify/functions && npm install
cd ../../scripts && npm install

# Restart servers
```
