# Implementation Plan: Google OAuth Login with Onboarding

**Branch**: `001-google-login` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-google-login/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement Google OAuth 2.0 authentication to replace manual account creation. Users authenticate with Google, then complete onboarding by selecting a unique username and avatar background color. System issues short-lived access tokens (1 hour) and long-lived refresh tokens (30 days) stored securely in the database. Automatic token refresh prevents user interruption. Integration with existing JWT infrastructure maintains compatibility with current authentication flow.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+ (for Netlify Functions), React 18+  
**Primary Dependencies**: React, Vite, @libsql/client (Turso), jsonwebtoken, google-auth-library (for token verification), @react-oauth/google (frontend OAuth), Netlify Functions  
**Storage**: Turso (cloud SQLite) - existing database with new columns: `google_id`, `google_email`, `refresh_token`, `refresh_token_expires_at`  
**Testing**: Vitest (React components), Node.js test framework (API functions)  
**Target Platform**: Web browser (modern browsers), deployed on Netlify  
**Project Type**: Web application (frontend + backend)  
**Performance Goals**: Google OAuth redirect < 5s, token verification < 500ms, username validation < 500ms, token refresh < 200ms, onboarding completion < 2 minutes  
**Constraints**: Google OAuth API rate limits, Netlify Functions timeout limits, Turso connection limits, refresh token security requirements, token expiration handling  
**Scale/Scope**: All new users authenticate via Google OAuth, existing manual accounts continue using username/password, refresh token management for 30-day sessions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. React Component Architecture ✅
- **Compliance**: New onboarding components will follow React component patterns
- **Implementation**: `OnboardingScreen` component with username input and color picker
- **State Management**: React hooks (useState, useEffect) for form state and validation

### II. Netlify Functions API Design ✅
- **Compliance**: New OAuth endpoints as Netlify Functions
- **Implementation**: `google-auth.ts` function for Google token verification, `refresh.ts` function for token refresh
- **Platform-agnostic**: API responses work for web and future mobile clients

### III. Database Schema & Turso Integration ✅
- **Compliance**: Database migration for new columns (google_id, google_email, refresh_token, refresh_token_expires_at)
- **Implementation**: Migration file `005_add_google_oauth.sql` with parameterized queries
- **Security**: Refresh tokens stored with proper encryption/hashing

### IV. Public/Private Data Visibility ✅
- **Compliance**: No changes to existing visibility logic
- **Implementation**: OAuth authentication works with existing story visibility system

### V. Component Testing & Quality ✅
- **Compliance**: OAuth flow and onboarding will have integration tests
- **Implementation**: Tests for Google OAuth callback, token refresh, username validation

### VI. Theme & Styling Consistency ✅
- **Compliance**: Onboarding screen uses existing CSS variables
- **Implementation**: Reuses existing color palette and theme variables

### VII. Multi-Platform Backend Design ✅
- **Compliance**: OAuth API endpoints work for web and future mobile clients
- **Implementation**: Standard JSON responses, JWT tokens work identically across platforms

### VIII. Coding Quality & Style Standards ✅
- **Compliance**: All code follows SOLID principles and clean code practices
- **Implementation**: Single responsibility functions, proper error handling, TypeScript types, JSDoc comments

**Gate Status**: ✅ PASS - All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/001-google-login/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx          # Updated with Google login button
│   │   │   └── OnboardingScreen.tsx  # New: username + color selection
│   │   └── users/
│   │       └── (existing AvatarEditor reused for color picker)
│   ├── pages/
│   │   └── LoginPage.tsx             # Updated for Google OAuth
│   ├── services/
│   │   ├── auth.ts                   # Updated with Google OAuth and refresh logic
│   │   └── api.ts                    # Updated with automatic token refresh
│   └── hooks/
│       └── useAuth.ts                # Updated for refresh token handling

netlify/
└── functions/
    ├── google-auth.ts                # New: Google OAuth verification and account creation
    ├── refresh.ts                    # New: Token refresh endpoint
    ├── onboarding.ts                 # New: Complete onboarding (username + color)
    ├── login.ts                      # Existing: Keep for manual accounts
    └── utils/
        ├── auth.ts                   # Updated: Add refresh token functions
        └── google.ts                 # New: Google token verification utilities

migrations/
└── 005_add_google_oauth.sql         # New: Add Google OAuth columns
```

**Structure Decision**: Web application structure (Option 2) - frontend React app with Netlify Functions backend. New OAuth functions added to existing functions directory. Onboarding component added to auth components. Database migration adds OAuth-related columns to users table.

## Complexity Tracking

> **No violations - all changes comply with constitution principles**
