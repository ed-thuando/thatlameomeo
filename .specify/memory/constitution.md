<!--
Sync Impact Report:
Version change: 1.2.0 → 1.3.0 (Minor: Added coding quality and style standards)
Modified principles: N/A
Added sections:
  - VIII. Coding Quality & Style Standards (new principle)
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section compatible (no changes needed)
  ✅ spec-template.md - No constitution-specific references found (no changes needed)
  ✅ tasks-template.md - No constitution-specific references found (no changes needed)
  ✅ agent-file-template.md - No constitution-specific references found (no changes needed)
Follow-up TODOs: None
-->

# thatlameomeo Constitution

## Core Principles

### I. React Component Architecture
All UI functionality MUST be implemented as reusable React components. Components MUST be self-contained with clear props interfaces. State management MUST use React hooks (useState, useEffect, useContext) or appropriate state management libraries. Components MUST be organized by feature/domain in the `src/components/` directory structure. Complex components MUST be broken down into smaller, composable pieces.

### II. Netlify Functions API Design
All backend API endpoints MUST be implemented as Netlify Functions in the `netlify/functions/` directory. Functions MUST follow RESTful conventions where applicable. Each function MUST handle errors gracefully and return consistent JSON responses. Functions MUST validate input data before processing. Database operations MUST be performed through Turso client with proper connection handling and error management. API endpoints MUST be designed to support all app variants (web, mobile) with platform-agnostic responses. Functions MUST NOT contain platform-specific logic or assumptions about the client implementation.

### III. Database Schema & Turso Integration
All database schemas MUST be version-controlled and documented. Turso SQLite database MUST be used for all persistent data storage. Database migrations MUST be tracked and reversible. All database queries MUST use parameterized statements to prevent SQL injection. Connection strings and credentials MUST be stored in environment variables, never committed to version control.

### IV. Public/Private Data Visibility
User stories/notes MUST support public and private visibility settings. Private stories MUST only be accessible by the story owner. Public stories MUST be visible to all authenticated users. The visibility setting MUST be enforced at both the API and UI levels. User point scores (male-male points) MUST be publicly visible regardless of story visibility settings.

### V. Component Testing & Quality
Critical user flows MUST have integration tests. React components MUST be testable in isolation. Netlify Functions MUST have unit tests for business logic. All tests MUST run in CI/CD pipeline before deployment. Code MUST pass linting (ESLint) and formatting (Prettier) checks before merge.

### VI. Theme & Styling Consistency
All theme colors, spacing, and styling values MUST be defined as CSS variables in the root stylesheet (`src/index.css`). Components MUST reference CSS variables (e.g., `var(--text-color)`) rather than hardcoded color values. When theme colors are changed, updates MUST be made at the CSS variable level only, never by manually updating individual component styles. All icons MUST use consistent SVG format with uniform stroke width and color variables. Border widths, border colors, background colors, and text colors MUST all reference CSS variables for maintainability.

### VII. Multi-Platform Backend Design
Backend API endpoints MUST be designed to serve all app variants (web React app, Flutter mobile app, and future platforms) without modification. API responses MUST use standard JSON format with consistent structure across all endpoints. Authentication mechanisms (JWT tokens) MUST work identically for all client platforms. Business logic MUST remain in backend functions, never duplicated in client-specific code. When adding new features, API contracts MUST be validated to ensure compatibility with existing web and planned mobile implementations. Platform-specific optimizations MUST be handled at the client level, not in backend functions.

### VIII. Coding Quality & Style Standards
All code MUST adhere to SOLID principles, clean code practices, and maintainability standards. Functions and methods MUST have a single responsibility and do one thing well. Functions MUST be small, focused, and avoid side effects where possible. Code MUST be self-documenting through clear naming conventions—use descriptive names for variables, functions, and classes that express intent. Magic numbers and strings MUST be extracted to named constants or configuration. Complex logic MUST be broken down into smaller, testable functions. Code duplication MUST be eliminated through abstraction, composition, or shared utilities. Error handling MUST be explicit and meaningful—never swallow errors silently. TypeScript types MUST be used consistently—avoid `any` type unless absolutely necessary and document the rationale. Comments MUST explain "why" not "what"—code should be self-explanatory. Functions MUST have clear input/output contracts with proper type definitions. Classes and components MUST follow the Single Responsibility Principle—each class/component should have one reason to change. Dependencies MUST be injected rather than hardcoded to enable testability and flexibility. Abstractions MUST be at the right level—not too abstract (over-engineering) nor too concrete (tight coupling). Code MUST be organized logically with related functionality grouped together. Dead code, unused imports, and commented-out code MUST be removed before merge. Performance-critical code paths MUST be optimized, but premature optimization MUST be avoided. All public APIs (functions, components, classes) MUST have clear documentation comments (JSDoc/TSDoc) explaining purpose, parameters, return values, and usage examples. Code complexity MUST be managed—cyclomatic complexity should be kept low, and deeply nested conditionals MUST be refactored. Immutability MUST be preferred where possible—avoid mutating objects/arrays directly, use immutable patterns. Async operations MUST be handled properly with error handling and loading states. Code MUST be formatted consistently using Prettier and follow ESLint rules without exceptions.

## Technology Stack

**Frontend (Web)**: React 18+ with Vite as build tool. TypeScript for type safety. Tailwind CSS for styling (or CSS Modules if preferred).

**Frontend (Mobile)**: Flutter (Dart) for cross-platform mobile app development. Mobile app will share the same backend API as the web application.

**Backend**: Netlify Functions (Node.js/TypeScript) for serverless API endpoints. Backend MUST be platform-agnostic and support all client variants (web, mobile).

**Database**: Turso (cloud SQLite) for data persistence. Use @libsql/client for database operations.

**Deployment**: Netlify for hosting static site and serverless functions. Environment variables configured in Netlify dashboard. Mobile app deployment via standard Flutter build processes (iOS App Store, Google Play Store).

**Development Tools**: ESLint for linting, Prettier for code formatting, Vitest for testing React components, Node.js test framework for API testing, Flutter testing framework for mobile components.

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

**Version**: 1.3.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2026-01-15
