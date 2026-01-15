# Tasks: Google OAuth Login with Onboarding

**Input**: Design documents from `/specs/001-google-login/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not explicitly requested in spec, so test tasks are not included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2])
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/`, `netlify/functions/`
- All paths are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and Google OAuth configuration

- [ ] T001 Install @react-oauth/google package in frontend/package.json
- [ ] T002 Install google-auth-library package in netlify/functions/package.json
- [ ] T003 [P] Configure Google OAuth Client ID in environment variables (.env.local and Netlify dashboard)
- [ ] T004 [P] Set up Google Cloud Console OAuth 2.0 credentials and configure authorized redirect URIs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create database migration file migrations/005_add_google_oauth.sql with Google OAuth columns
- [ ] T006 Run database migration to add google_id, google_email, refresh_token, refresh_token_expires_at columns to users table
- [ ] T007 Run database migration to add onboarding_username, onboarding_color, onboarding_expires_at temporary columns to users table
- [ ] T008 Create database indexes idx_users_google_id and idx_users_google_email in migration file
- [ ] T009 Update netlify/functions/utils/auth.ts to add refresh token generation function generateRefreshToken()
- [ ] T010 Update netlify/functions/utils/auth.ts to add refresh token hashing function hashRefreshToken(token: string)
- [ ] T011 Update netlify/functions/utils/auth.ts to add refresh token verification function verifyRefreshToken(hashedToken: string, plainToken: string)
- [ ] T012 Update netlify/functions/utils/auth.ts to modify signToken() to accept optional expiresIn parameter (default '1h' for access tokens)
- [ ] T013 Create netlify/functions/utils/google.ts with Google token verification utilities
- [ ] T014 [P] Implement verifyGoogleIdToken() function in netlify/functions/utils/google.ts using google-auth-library
- [ ] T015 [P] Implement extractGoogleUserInfo() function in netlify/functions/utils/google.ts to extract email, name, picture, sub from token

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Google OAuth Authentication (Priority: P1) 🎯 MVP

**Goal**: Users can authenticate using Google OAuth instead of manual account creation. System verifies Google tokens, links accounts by email, and issues access/refresh tokens. Automatic token refresh prevents user interruption.

**Independent Test**: Can be fully tested by initiating Google OAuth flow, completing authentication, and verifying that the system recognizes the user's Google identity. Test delivers a working OAuth authentication system that enables seamless account access.

### Implementation for User Story 1

- [ ] T016 [US1] Create netlify/functions/google-auth.ts function handler for Google OAuth verification
- [ ] T017 [US1] Implement POST handler in netlify/functions/google-auth.ts to accept id_token from frontend
- [ ] T018 [US1] Implement Google ID token verification in netlify/functions/google-auth.ts using verifyGoogleIdToken() utility
- [ ] T019 [US1] Implement email validation check in netlify/functions/google-auth.ts (return error if no email)
- [ ] T020 [US1] Implement user lookup by google_id in netlify/functions/google-auth.ts
- [ ] T021 [US1] Implement user lookup by google_email for account linking in netlify/functions/google-auth.ts
- [ ] T022 [US1] Implement account linking logic in netlify/functions/google-auth.ts when email matches existing account
- [ ] T023 [US1] Implement new user detection in netlify/functions/google-auth.ts (create onboarding session)
- [ ] T024 [US1] Implement refresh token generation and storage for existing users in netlify/functions/google-auth.ts
- [ ] T025 [US1] Implement access token generation (1 hour expiration) in netlify/functions/google-auth.ts
- [ ] T026 [US1] Implement response formatting for requires_onboarding: true case in netlify/functions/google-auth.ts
- [ ] T027 [US1] Implement response formatting for existing user login case in netlify/functions/google-auth.ts
- [ ] T028 [US1] Implement error handling for invalid tokens, missing email, and server errors in netlify/functions/google-auth.ts
- [ ] T029 [US1] Create netlify/functions/refresh.ts function handler for token refresh
- [ ] T030 [US1] Implement POST handler in netlify/functions/refresh.ts to accept refresh_token
- [ ] T031 [US1] Implement refresh token validation (hash check and expiration) in netlify/functions/refresh.ts
- [ ] T032 [US1] Implement new access token generation in netlify/functions/refresh.ts
- [ ] T033 [US1] Implement error handling for invalid/expired refresh tokens in netlify/functions/refresh.ts
- [ ] T034 [US1] Update frontend/src/services/auth.ts to add googleAuth(idToken: string) function
- [ ] T035 [US1] Update frontend/src/services/auth.ts to add refreshAccessToken(refreshToken: string) function
- [ ] T036 [US1] Update frontend/src/services/auth.ts to add storeRefreshToken(token: string) function
- [ ] T037 [US1] Update frontend/src/services/auth.ts to add getRefreshToken() function
- [ ] T038 [US1] Update frontend/src/services/api.ts to add automatic token refresh logic before API requests
- [ ] T039 [US1] Implement token expiration check (check if token expires in < 10 minutes) in frontend/src/services/api.ts
- [ ] T040 [US1] Implement automatic refresh call when token near expiration in frontend/src/services/api.ts
- [ ] T041 [US1] Implement error handling for refresh failures (redirect to login) in frontend/src/services/api.ts
- [ ] T042 [US1] Update frontend/src/App.tsx to wrap app with GoogleOAuthProvider component
- [ ] T043 [US1] Configure GoogleOAuthProvider with GOOGLE_CLIENT_ID from environment in frontend/src/App.tsx
- [ ] T044 [US1] Update frontend/src/components/auth/LoginForm.tsx to add Google login button
- [ ] T045 [US1] Implement useGoogleLogin hook integration in frontend/src/components/auth/LoginForm.tsx
- [ ] T046 [US1] Implement Google OAuth callback handling in frontend/src/components/auth/LoginForm.tsx
- [ ] T047 [US1] Implement ID token extraction from Google response in frontend/src/components/auth/LoginForm.tsx
- [ ] T048 [US1] Implement call to googleAuth service with ID token in frontend/src/components/auth/LoginForm.tsx
- [ ] T049 [US1] Implement handling of requires_onboarding response in frontend/src/components/auth/LoginForm.tsx
- [ ] T050 [US1] Implement handling of existing user login response (store tokens, redirect) in frontend/src/components/auth/LoginForm.tsx
- [ ] T051 [US1] Implement error handling for OAuth failures in frontend/src/components/auth/LoginForm.tsx
- [ ] T052 [US1] Update frontend/src/hooks/useAuth.ts to handle refresh tokens in validateToken()
- [ ] T053 [US1] Update frontend/src/hooks/useAuth.ts to add refresh token storage on login
- [ ] T054 [US1] Update frontend/src/hooks/useAuth.ts logout() to clear refresh token from storage
- [ ] T055 [US1] Update netlify/functions/users.ts handleUpdateProfile to invalidate refresh token on logout (if logout endpoint exists)
- [ ] T056 [US1] Update netlify/functions/login.ts to maintain backward compatibility with existing username/password login

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Users can authenticate with Google, receive tokens, and have tokens automatically refreshed.

---

## Phase 4: User Story 2 - Onboarding: Username and Background Color Selection (Priority: P2)

**Goal**: New users who authenticate with Google complete onboarding by selecting a unique username and avatar background color. System validates username availability on blur, handles concurrent selection attempts, and creates account with tokens upon completion.

**Independent Test**: Can be fully tested by completing Google authentication, accessing the onboarding screen, selecting a unique username and background color, and verifying that the account is created successfully. Test delivers a working onboarding flow that enables new users to set up their profiles.

### Implementation for User Story 2

- [ ] T057 [US2] Create netlify/functions/onboarding.ts function handler for onboarding completion
- [ ] T058 [US2] Implement POST handler in netlify/functions/onboarding.ts to accept session_id, username, avatar_bg_color
- [ ] T059 [US2] Implement onboarding session validation (check expiration) in netlify/functions/onboarding.ts
- [ ] T060 [US2] Implement username format validation (1-50 chars, alphanumeric + underscores) in netlify/functions/onboarding.ts
- [ ] T061 [US2] Implement username availability check (query database) in netlify/functions/onboarding.ts
- [ ] T062 [US2] Implement avatar color validation (must be from predefined palette) in netlify/functions/onboarding.ts
- [ ] T063 [US2] Implement user account creation with username and color in netlify/functions/onboarding.ts
- [ ] T064 [US2] Implement refresh token generation and storage for new user in netlify/functions/onboarding.ts
- [ ] T065 [US2] Implement access token generation (1 hour expiration) in netlify/functions/onboarding.ts
- [ ] T066 [US2] Implement onboarding session cleanup (clear temporary columns) in netlify/functions/onboarding.ts
- [ ] T067 [US2] Implement error handling for username conflicts (409 Conflict) in netlify/functions/onboarding.ts
- [ ] T068 [US2] Implement error handling for invalid session, expired session, validation errors in netlify/functions/onboarding.ts
- [ ] T069 [US2] Add GET /users/check-username endpoint handler in netlify/functions/users.ts
- [ ] T070 [US2] Implement username availability check query in netlify/functions/users.ts check-username handler
- [ ] T071 [US2] Implement username format validation in netlify/functions/users.ts check-username handler
- [ ] T072 [US2] Implement response formatting (available: true/false) in netlify/functions/users.ts check-username handler
- [ ] T073 [US2] Create frontend/src/components/auth/OnboardingScreen.tsx component
- [ ] T074 [US2] Implement username input field with onBlur handler in frontend/src/components/auth/OnboardingScreen.tsx
- [ ] T075 [US2] Implement username validation API call on blur in frontend/src/components/auth/OnboardingScreen.tsx
- [ ] T076 [US2] Implement debouncing for username validation (300-500ms) in frontend/src/components/auth/OnboardingScreen.tsx
- [ ] T077 [US2] Implement error message display for taken username in frontend/src/components/auth/OnboardingScreen.tsx
- [ ] T078 [US2] Implement color picker integration (reuse AvatarEditor color palette) in frontend/src/components/auth/OnboardingScreen.tsx
- [ ] T079 [US2] Implement form submission handler in frontend/src/components/auth/OnboardingScreen.tsx
- [ ] T080 [US2] Implement call to onboarding completion API in frontend/src/components/auth/OnboardingScreen.tsx
- [ ] T081 [US2] Implement token storage and user state update on successful onboarding in frontend/src/components/auth/OnboardingScreen.tsx
- [ ] T082 [US2] Implement redirect to home page after onboarding completion in frontend/src/components/auth/OnboardingScreen.tsx
- [ ] T083 [US2] Implement error handling for username conflicts and validation errors in frontend/src/components/auth/OnboardingScreen.tsx
- [ ] T084 [US2] Implement loading states during validation and submission in frontend/src/components/auth/OnboardingScreen.tsx
- [ ] T085 [US2] Update frontend/src/services/auth.ts to add completeOnboarding(sessionId, username, color) function
- [ ] T086 [US2] Update frontend/src/services/auth.ts to add checkUsernameAvailability(username) function
- [ ] T087 [US2] Update frontend/src/pages/LoginPage.tsx to handle navigation to onboarding screen when requires_onboarding is true
- [ ] T088 [US2] Create route for /onboarding in frontend/src/App.tsx
- [ ] T089 [US2] Implement onboarding session persistence check on /onboarding route load
- [ ] T090 [US2] Implement onboarding session resume logic (load saved username/color if session valid) in frontend/src/components/auth/OnboardingScreen.tsx
- [ ] T091 [US2] Implement onboarding session expiration handling (redirect to login) in frontend/src/components/auth/OnboardingScreen.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Users can authenticate with Google, complete onboarding, and access the app.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, error handling, and validation

- [ ] T092 [P] Add comprehensive error handling for network failures during Google OAuth redirect
- [ ] T093 [P] Add error handling for Google account suspended/disabled scenarios
- [ ] T094 [P] Add error handling for invalid/malformed Google authentication tokens
- [ ] T095 [P] Add error handling for username validation system errors
- [ ] T096 [P] Add rate limiting to google-auth endpoint to prevent abuse
- [ ] T097 [P] Add rate limiting to refresh endpoint to prevent abuse
- [ ] T098 [P] Add rate limiting to check-username endpoint to prevent abuse
- [ ] T099 [P] Add logging for authentication events (Google login, account linking, token refresh) in backend functions
- [ ] T100 [P] Add security audit logging for suspicious authentication attempts
- [ ] T101 [P] Update frontend/src/utils/jwt.ts to handle 1-hour access token expiration (update isTokenExpired check)
- [ ] T102 [P] Add cleanup job for expired onboarding sessions (or implement in onboarding completion)
- [ ] T103 [P] Add cleanup job for expired refresh tokens (optional, or handle on refresh attempt)
- [ ] T104 [P] Update documentation in README.md with Google OAuth setup instructions
- [ ] T105 [P] Update SETUP.md with Google OAuth configuration steps
- [ ] T106 [P] Verify all API contracts match implementation (run quickstart.md validation)
- [ ] T107 [P] Test complete user journey: Google login → Onboarding → Token refresh → Logout
- [ ] T108 [P] Test account linking scenario: Manual account → Google login with same email
- [ ] T109 [P] Test concurrent username selection scenario
- [ ] T110 [P] Test onboarding session persistence (close browser, return within 24h)
- [ ] T111 [P] Test onboarding session expiration (return after 24h)
- [ ] T112 [P] Test refresh token expiration and re-authentication flow
- [ ] T113 [P] Code review: Verify all tasks follow constitution principles (SOLID, clean code, TypeScript types)
- [ ] T114 [P] Code review: Verify error handling is explicit and meaningful
- [ ] T115 [P] Code review: Verify all public APIs have JSDoc/TSDoc comments

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1) can start after Foundational
  - User Story 2 (P2) depends on User Story 1 completion (needs OAuth flow working)
- **Polish (Phase 5)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 completion - Needs OAuth authentication working to test onboarding flow

### Within Each User Story

- Backend functions before frontend integration
- Utility functions before functions that use them
- Core implementation before error handling
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 (Setup)**:
- T003 and T004 can run in parallel (different configuration tasks)

**Phase 2 (Foundational)**:
- T014 and T015 can run in parallel (different utility functions)
- All database migration tasks (T005-T008) should run sequentially

**Phase 3 (User Story 1)**:
- Backend tasks T016-T033 can be worked on in parallel groups (different functions)
- Frontend tasks T034-T041 can be worked on in parallel (different service functions)
- Frontend tasks T042-T051 can be worked on in parallel (different component updates)

**Phase 4 (User Story 2)**:
- Backend tasks T057-T072 can be worked on in parallel groups
- Frontend tasks T073-T091 can be worked on in parallel groups

**Phase 5 (Polish)**:
- All tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Backend functions can be developed in parallel:
Task: "Create netlify/functions/google-auth.ts function handler"
Task: "Create netlify/functions/refresh.ts function handler"

# Frontend service functions can be developed in parallel:
Task: "Update frontend/src/services/auth.ts to add googleAuth() function"
Task: "Update frontend/src/services/auth.ts to add refreshAccessToken() function"
Task: "Update frontend/src/services/api.ts to add automatic token refresh logic"

# Utility functions can be developed in parallel:
Task: "Implement verifyGoogleIdToken() function in netlify/functions/utils/google.ts"
Task: "Implement extractGoogleUserInfo() function in netlify/functions/utils/google.ts"
```

---

## Parallel Example: User Story 2

```bash
# Backend functions can be developed in parallel:
Task: "Create netlify/functions/onboarding.ts function handler"
Task: "Add GET /users/check-username endpoint handler in netlify/functions/users.ts"

# Frontend components can be developed in parallel:
Task: "Create frontend/src/components/auth/OnboardingScreen.tsx component"
Task: "Update frontend/src/services/auth.ts to add completeOnboarding() function"
Task: "Update frontend/src/services/auth.ts to add checkUsernameAvailability() function"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (install dependencies, configure OAuth)
2. Complete Phase 2: Foundational (database migration, utility functions) - **CRITICAL - blocks all stories**
3. Complete Phase 3: User Story 1 (Google OAuth authentication with token refresh)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Test Google login flow
   - Test existing user login
   - Test account linking
   - Test token refresh
   - Test error handling
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
   - Users can login with Google
   - Existing users can link accounts
   - Tokens refresh automatically
3. Add User Story 2 → Test independently → Deploy/Demo
   - New users complete onboarding
   - Username validation works
   - Account creation succeeds
4. Add Polish tasks → Final validation → Production deployment
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. **Team completes Setup + Foundational together**
   - Developer A: Database migration
   - Developer B: Google utils
   - Developer C: Auth utils updates

2. **Once Foundational is done - User Story 1**:
   - Developer A: Backend google-auth.ts function
   - Developer B: Backend refresh.ts function
   - Developer C: Frontend OAuth integration
   - Developer D: Frontend token refresh logic

3. **User Story 2 (after US1 complete)**:
   - Developer A: Backend onboarding.ts function
   - Developer B: Backend check-username endpoint
   - Developer C: Frontend OnboardingScreen component
   - Developer D: Frontend validation and integration

4. **Polish phase (parallel)**:
   - All developers: Error handling, testing, documentation

---

## Notes

- [P] tasks = different files, no dependencies
- [US1] label maps task to User Story 1 (Google OAuth Authentication)
- [US2] label maps task to User Story 2 (Onboarding)
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- User Story 2 depends on User Story 1 (needs OAuth working to test onboarding)
- All backend functions must handle CORS (use existing handleCors utility)
- All functions must use existing error response utilities (createErrorResponse, createSuccessResponse)
- Refresh tokens must be hashed with bcrypt before database storage
- Access tokens use 1-hour expiration (update existing JWT signToken calls)
- Refresh tokens use 30-day expiration (store expires_at in database)
