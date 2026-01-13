<!--
Sync Impact Report:
Version change: 0.0.0 → 1.0.0 (Initial constitution creation)
Modified principles: N/A (new file)
Added sections: Core Principles (5), Technology Stack, Development Workflow, Governance
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section compatible
  ✅ spec-template.md - No constitution-specific references found
  ✅ tasks-template.md - No constitution-specific references found
  ✅ agent-file-template.md - No constitution-specific references found
Follow-up TODOs: None
-->

# thatlameomeo Constitution

## Core Principles

### I. React Component Architecture
All UI functionality MUST be implemented as reusable React components. Components MUST be self-contained with clear props interfaces. State management MUST use React hooks (useState, useEffect, useContext) or appropriate state management libraries. Components MUST be organized by feature/domain in the `src/components/` directory structure. Complex components MUST be broken down into smaller, composable pieces.

### II. Netlify Functions API Design
All backend API endpoints MUST be implemented as Netlify Functions in the `netlify/functions/` directory. Functions MUST follow RESTful conventions where applicable. Each function MUST handle errors gracefully and return consistent JSON responses. Functions MUST validate input data before processing. Database operations MUST be performed through Turso client with proper connection handling and error management.

### III. Database Schema & Turso Integration
All database schemas MUST be version-controlled and documented. Turso SQLite database MUST be used for all persistent data storage. Database migrations MUST be tracked and reversible. All database queries MUST use parameterized statements to prevent SQL injection. Connection strings and credentials MUST be stored in environment variables, never committed to version control.

### IV. Public/Private Data Visibility
User stories/notes MUST support public and private visibility settings. Private stories MUST only be accessible by the story owner. Public stories MUST be visible to all authenticated users. The visibility setting MUST be enforced at both the API and UI levels. User point scores (male-male points) MUST be publicly visible regardless of story visibility settings.

### V. Component Testing & Quality
Critical user flows MUST have integration tests. React components MUST be testable in isolation. Netlify Functions MUST have unit tests for business logic. All tests MUST run in CI/CD pipeline before deployment. Code MUST pass linting (ESLint) and formatting (Prettier) checks before merge.

## Technology Stack

**Frontend**: React 18+ with Vite as build tool. TypeScript for type safety. Tailwind CSS for styling (or CSS Modules if preferred).

**Backend**: Netlify Functions (Node.js/TypeScript) for serverless API endpoints.

**Database**: Turso (cloud SQLite) for data persistence. Use @libsql/client for database operations.

**Deployment**: Netlify for hosting static site and serverless functions. Environment variables configured in Netlify dashboard.

**Development Tools**: ESLint for linting, Prettier for code formatting, Vitest for testing React components, Node.js test framework for API testing.

## Development Workflow

**Branch Strategy**: Feature branches from main. Each feature MUST have a corresponding spec in `specs/[###-feature-name]/spec.md` before implementation begins.

**Code Review**: All changes MUST be reviewed before merge. Constitution compliance MUST be verified during review. Tests MUST pass and coverage MUST not decrease.

**Deployment**: Main branch auto-deploys to Netlify production. Preview deployments for feature branches. Database migrations MUST be tested in preview before production deployment.

**Environment Management**: Local development uses `.env.local` (git-ignored). Netlify environment variables configured in dashboard. Never commit secrets or API keys.

## Governance

This constitution supersedes all other development practices. Amendments require:
1. Documentation of the proposed change and rationale
2. Update to this file with version bump (semantic versioning: MAJOR.MINOR.PATCH)
3. Update to dependent templates if principles affect them
4. Team review and approval

All PRs and code reviews MUST verify compliance with constitution principles. Complexity beyond these principles MUST be justified with clear rationale. Use `.specify/templates/` for feature planning and implementation guidance.

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
