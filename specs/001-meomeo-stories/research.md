# Research: Thatlameomeo Story Sharing App

**Date**: 2025-01-27  
**Feature**: 001-meomeo-stories

## Technology Decisions

### 1. Frontend: React + Vite

**Decision**: Use React 18+ with Vite as the build tool and development server.

**Rationale**:
- Vite provides instant server start and lightning-fast HMR for development
- Optimized production builds with Rollup
- Simple configuration for Netlify deployment
- Standard React setup aligns with constitution requirements
- TypeScript support for type safety

**Alternatives Considered**:
- Next.js: Overkill for this simple app, adds unnecessary complexity
- Create React App: Deprecated, slower build times
- Plain Vite: Provides the best balance of simplicity and performance

**Implementation Notes**:
- Use `vite build` for production builds
- Configure `base` path if needed for Netlify subdirectory deployment
- Standard npm scripts: `build` and `preview`

### 2. Backend: Netlify Functions with TypeScript

**Decision**: Use Netlify Functions written in TypeScript for all API endpoints.

**Rationale**:
- Serverless functions align with Netlify deployment strategy
- TypeScript provides type safety for API contracts
- Functions automatically scale and handle traffic spikes
- No server management required
- Integrated with Netlify's build and deployment pipeline

**Alternatives Considered**:
- Express.js server: Requires separate hosting, adds complexity
- Other serverless platforms: Netlify Functions integrate seamlessly with frontend
- Server-side rendering: Not needed for this app's requirements

**Implementation Notes**:
- Install `@netlify/functions` for TypeScript types
- Functions in `netlify/functions/` directory
- Handler signature: `Handler = async (event: HandlerEvent, context: HandlerContext) => Response`
- Use environment variables for secrets (JWT secret, DB credentials)
- Functions accessible at `/.netlify/functions/{function-name}`

### 3. Database: Turso (libSQL)

**Decision**: Use Turso cloud SQLite database with @libsql/client for database operations.

**Rationale**:
- SQLite-compatible, simple database as requested
- Cloud-hosted, no database server management
- Works well with serverless functions (HTTP/WebSocket connections)
- Free tier available for initial development
- Parameterized queries prevent SQL injection
- Supports both remote and local development

**Alternatives Considered**:
- PostgreSQL (Supabase): More complex, overkill for MVP
- MongoDB: NoSQL not needed for structured data
- Local SQLite file: Doesn't work with serverless functions (stateless)

**Implementation Notes**:
- Use `createClient` from `@libsql/client`
- Connection via `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` environment variables
- Use parameterized queries: `client.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [userId] })`
- Handle `LibsqlError` for error management
- Close connections properly: `client.close()`
- For local dev, can use embedded replica with sync

### 4. Authentication: JWT with jsonwebtoken

**Decision**: Use JWT tokens for authentication with `jsonwebtoken` package.

**Rationale**:
- Stateless authentication works well with serverless functions
- No session storage required
- Standard approach for API authentication
- Token can include user ID and other claims
- Easy to verify on each function call

**Alternatives Considered**:
- Session-based auth: Requires session storage, not ideal for serverless
- OAuth providers: Overkill for admin-provided credentials
- API keys: Less secure, no expiration handling

**Implementation Notes**:
- Sign tokens with `jwt.sign(payload, secret, { expiresIn: '24h' })`
- Verify tokens with `jwt.verify(token, secret)`
- Store JWT secret in environment variable
- Include `userId` in token payload
- Handle `TokenExpiredError` and redirect to login
- Token stored in localStorage or httpOnly cookie (localStorage simpler for MVP)

### 5. Deployment: Netlify

**Decision**: Deploy frontend and functions to Netlify.

**Rationale**:
- Single platform for frontend and backend functions
- Automatic deployments from Git
- Preview deployments for feature branches
- Built-in environment variable management
- Free tier sufficient for MVP
- Simple CLI workflow: `ntl init` and `ntl deploy`

**Alternatives Considered**:
- Vercel: Similar but Netlify chosen for consistency
- AWS/GCP: Too complex for MVP, requires more setup
- Self-hosted: Unnecessary infrastructure overhead

**Implementation Notes**:
- Use Netlify CLI: `npm install -g netlify-cli`
- Initialize: `ntl init`
- Deploy preview: `ntl deploy`
- Deploy production: `ntl deploy --prod`
- Configure build command: `vite build`
- Publish directory: `dist`
- Functions automatically detected in `netlify/functions/`

### 6. Theme System: CSS Variables + React Context

**Decision**: Implement theme system using CSS variables and React Context for state management.

**Rationale**:
- CSS variables allow instant theme switching without page reload
- React Context provides global theme state
- Simple implementation, no external dependencies
- Persist theme preference in localStorage
- Cat-themed styles defined as CSS variable sets

**Alternatives Considered**:
- CSS-in-JS libraries: Adds dependency, overkill for 3-4 themes
- Tailwind theme variants: More complex configuration
- Separate CSS files: Harder to switch dynamically

**Implementation Notes**:
- Define theme colors/styles as CSS variable sets
- React Context for current theme state
- Theme selector component updates context
- localStorage persistence for theme preference
- Apply theme class to root element

## Integration Patterns

### Frontend to Backend Communication

**Pattern**: RESTful API calls from React to Netlify Functions.

**Implementation**:
- API service layer in `src/services/api.ts`
- Functions accessible at `/.netlify/functions/{name}`
- Use `fetch` API for HTTP requests
- Include JWT token in Authorization header
- Handle errors and loading states in components

### Database Connection Management

**Pattern**: Create database client per function invocation (serverless-friendly).

**Implementation**:
- Utility function `netlify/functions/utils/db.ts` creates client
- Client created at function start, closed at end
- Connection pooling handled by Turso
- Environment variables for connection config

### Authentication Flow

**Pattern**: JWT token stored in localStorage, included in API requests.

**Implementation**:
- Login function returns JWT token
- Store token in localStorage on successful login
- Include in `Authorization: Bearer {token}` header
- Verify token in each protected function
- Redirect to login if token invalid/expired

## Performance Considerations

- **Function Cold Starts**: First request may be slower, subsequent requests fast
- **Database Connections**: Turso handles connection pooling automatically
- **Frontend Bundle**: Vite optimizes bundle size automatically
- **API Response Times**: Target < 500ms for database queries
- **Concurrent Requests**: Turso supports 20+ concurrent requests by default

## Security Considerations

- **JWT Secret**: Must be strong, stored in environment variables
- **SQL Injection**: Use parameterized queries exclusively
- **CORS**: Configure Netlify Functions CORS headers appropriately
- **Environment Variables**: Never commit secrets to Git
- **Token Expiration**: Set reasonable expiration (24h default)

## Development Workflow

1. **Local Development**:
   - Frontend: `npm run dev` (Vite dev server)
   - Functions: `netlify dev` (runs functions locally)
   - Database: Use Turso remote or local SQLite for testing

2. **Testing**:
   - Unit tests: Vitest for React components
   - API tests: Node.js test framework for functions
   - Integration tests: Test full user flows

3. **Deployment**:
   - Push to Git triggers Netlify build
   - Preview deployments for feature branches
   - Production deployment from main branch

## Unresolved Questions

None - all technical decisions made based on requirements and constitution.
