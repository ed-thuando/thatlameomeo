# Tasks: Thatlameomeo Story Sharing App

**Input**: Design documents from `/specs/001-meomeo-stories/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/`, `netlify/functions/`
- Paths shown below follow the web application structure from plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan (frontend/, netlify/functions/, migrations/)
- [ ] T002 Initialize React + Vite project in frontend/ with TypeScript configuration
- [ ] T003 [P] Initialize Netlify Functions project structure in netlify/functions/
- [ ] T004 [P] Configure ESLint and Prettier for frontend in frontend/
- [ ] T005 [P] Configure TypeScript for Netlify Functions in netlify/functions/
- [ ] T006 [P] Setup Vitest for React component testing in frontend/
- [ ] T007 [P] Setup Node.js test framework for API function testing in netlify/functions/
- [ ] T008 Create netlify.toml configuration file at repository root
- [ ] T009 [P] Create .env.local template file with placeholder environment variables
- [ ] T010 [P] Create sad cat logo SVG asset in frontend/public/sad-cat-logo.svg

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T011 Setup Turso database connection utility in netlify/functions/utils/db.ts
- [ ] T012 Create database migration file migrations/001_initial_schema.sql with users and stories tables
- [ ] T013 [P] Implement JWT authentication utilities in netlify/functions/utils/auth.ts (sign, verify, extract user_id)
- [ ] T014 [P] Create API service layer in frontend/src/services/api.ts for making HTTP requests to Netlify Functions
- [ ] T015 [P] Create authentication service in frontend/src/services/auth.ts for JWT token management
- [ ] T016 [P] Create JWT utility functions in frontend/src/utils/jwt.ts for token storage and retrieval
- [ ] T017 [P] Setup React Router in frontend/src/App.tsx with route structure
- [ ] T018 [P] Create base error handling infrastructure in netlify/functions/utils/ (error response helpers)
- [ ] T019 [P] Create base error handling in frontend/src/services/api.ts (network errors, API errors)
- [ ] T020 Setup environment variable configuration for local development (.env.local)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Login (Priority: P1) 🎯 MVP

**Goal**: Users can authenticate using admin-provided credentials and receive JWT tokens for accessing protected features.

**Independent Test**: Can be fully tested by attempting to log in with valid credentials and verifying that a JWT token is returned and stored. The test delivers a working authentication system that enables all subsequent features.

### Implementation for User Story 1

- [ ] T021 [US1] Create LoginForm component in frontend/src/components/auth/LoginForm.tsx with username and password fields
- [ ] T022 [US1] Create LoginPage component in frontend/src/pages/LoginPage.tsx that uses LoginForm
- [ ] T023 [US1] Implement login Netlify Function in netlify/functions/login.ts with username/password validation
- [ ] T024 [US1] Add password hash verification logic in netlify/functions/login.ts using bcrypt
- [ ] T025 [US1] Implement JWT token generation in netlify/functions/login.ts with user ID in payload
- [ ] T026 [US1] Add login API call in frontend/src/services/auth.ts to POST to /.netlify/functions/login
- [ ] T027 [US1] Implement token storage in localStorage in frontend/src/services/auth.ts after successful login
- [ ] T028 [US1] Create useAuth hook in frontend/src/hooks/useAuth.ts for authentication state management
- [ ] T029 [US1] Add protected route logic in frontend/src/App.tsx to redirect unauthenticated users to login
- [ ] T030 [US1] Add automatic token validation on app load in frontend/src/hooks/useAuth.ts
- [ ] T031 [US1] Implement error handling for invalid credentials in frontend/src/components/auth/LoginForm.tsx
- [ ] T032 [US1] Add redirect to home page after successful login in frontend/src/pages/LoginPage.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Create and Share Story (Priority: P2)

**Goal**: Users can create stories with text content, set visibility (public/private), and stories are saved to the database.

**Independent Test**: Can be fully tested by logging in, creating a story with text content, setting visibility (public/private), and verifying the story is saved and contributes to daily MeoMeo score. The test delivers a working story creation system that enables users to share their experiences.

### Implementation for User Story 2

- [ ] T033 [US2] Create StoryCreateBox component in frontend/src/components/stories/StoryCreateBox.tsx with textarea and visibility toggle
- [ ] T034 [US2] Add story creation form validation in frontend/src/components/stories/StoryCreateBox.tsx (non-empty content, max length)
- [ ] T035 [US2] Implement create story Netlify Function endpoint in netlify/functions/stories.ts (POST handler)
- [ ] T036 [US2] Add JWT token validation in netlify/functions/stories.ts for POST endpoint
- [ ] T037 [US2] Implement story insertion into database in netlify/functions/stories.ts with user_id from JWT
- [ ] T038 [US2] Add story creation API call in frontend/src/services/api.ts to POST to /.netlify/functions/stories
- [ ] T039 [US2] Implement success handling after story creation in frontend/src/components/stories/StoryCreateBox.tsx
- [ ] T040 [US2] Add error handling for story creation failures in frontend/src/components/stories/StoryCreateBox.tsx
- [ ] T041 [US2] Create daily score calculation utility in netlify/functions/utils/scores.ts for calculating today's MeoMeo score
- [ ] T042 [US2] Update story creation to calculate and return daily MeoMeo score in netlify/functions/stories.ts

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - View Public Stories Feed with Interactions (Priority: P3)

**Goal**: Users can view a feed of public stories, like and comment on posts, share posts, and see daily MeoMeo scores. Likes and comments increment the post author's daily MeoMeo score.

**Independent Test**: Can be fully tested by logging in, viewing the feed, liking/commenting on posts, and verifying that daily MeoMeo scores reflect today's activity. The test delivers a working social feed with engagement features.

### Database Updates for User Story 3

- [ ] T043 [US3] Create likes table migration in migrations/002_add_likes_comments.sql
- [ ] T044 [US3] Create comments table migration in migrations/002_add_likes_comments.sql
- [ ] T045 [US3] Add avatar_url and display_name columns to users table in migrations/002_add_likes_comments.sql
- [ ] T046 [US3] Add archived column to stories table in migrations/002_add_likes_comments.sql

### Implementation for User Story 3

- [ ] T047 [US3] Create StoryCard component in frontend/src/components/stories/StoryCard.tsx to display story content, author, timestamp
- [ ] T048 [US3] Create StoryFeed component in frontend/src/components/stories/StoryFeed.tsx to display list of public stories
- [ ] T049 [US3] Implement get public stories Netlify Function endpoint in netlify/functions/stories.ts (GET handler with pagination)
- [ ] T050 [US3] Add JWT token validation in netlify/functions/stories.ts for GET endpoint
- [ ] T051 [US3] Implement public stories query in netlify/functions/stories.ts (filter by visibility='public', order by created_at DESC)
- [ ] T052 [US3] Add get public stories API call in frontend/src/services/api.ts to GET /.netlify/functions/stories
- [ ] T053 [US3] Create LikeButton component in frontend/src/components/stories/LikeButton.tsx with like/unlike functionality
- [ ] T054 [US3] Implement like Netlify Function in netlify/functions/likes.ts (POST to like, DELETE to unlike)
- [ ] T055 [US3] Add like count increment logic in netlify/functions/likes.ts when post is liked
- [ ] T056 [US3] Implement daily MeoMeo score increment for post author when liked in netlify/functions/likes.ts
- [ ] T057 [US3] Add like API calls in frontend/src/services/api.ts to POST/DELETE /.netlify/functions/likes
- [ ] T058 [US3] Create CommentSection component in frontend/src/components/stories/CommentSection.tsx with comment list and add comment form
- [ ] T059 [US3] Implement comment Netlify Function in netlify/functions/comments.ts (POST to create comment)
- [ ] T060 [US3] Add comment count increment logic in netlify/functions/comments.ts when comment is created
- [ ] T061 [US3] Implement daily MeoMeo score increment for post author when commented in netlify/functions/comments.ts
- [ ] T062 [US3] Add comment API calls in frontend/src/services/api.ts to POST /.netlify/functions/comments
- [ ] T063 [US3] Create ShareButton component in frontend/src/components/stories/ShareButton.tsx to generate shareable links
- [ ] T064 [US3] Create share utility in frontend/src/utils/share.ts to generate shareable post URLs
- [ ] T065 [US3] Implement share Netlify Function in netlify/functions/shares.ts to generate and validate share tokens
- [ ] T066 [US3] Create UserList component in frontend/src/components/users/UserList.tsx to display users with daily MeoMeo scores
- [ ] T067 [US3] Implement get all users Netlify Function endpoint in netlify/functions/users.ts (GET handler with sorting)
- [ ] T068 [US3] Add daily MeoMeo score calculation in netlify/functions/users.ts (posts today + likes received today + comments received today)
- [ ] T069 [US3] Add get users API call in frontend/src/services/api.ts to GET /.netlify/functions/users
- [ ] T070 [US3] Create HomePage component in frontend/src/pages/HomePage.tsx with StoryFeed, StoryCreateBox, and UserList sections
- [ ] T071 [US3] Create Header component in frontend/src/components/layout/Header.tsx with sad cat logo and navigation
- [ ] T072 [US3] Add home icon (sad cat logo) navigation in frontend/src/components/layout/Header.tsx to navigate to feed
- [ ] T073 [US3] Create useDailyScore hook in frontend/src/hooks/useDailyScore.ts for fetching and displaying daily scores
- [ ] T074 [US3] Integrate daily MeoMeo score display in frontend/src/components/stories/StoryCard.tsx alongside author info

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Profile Management (Priority: P4)

**Goal**: Users can edit their avatar and display name, view all their posts on profile page, and archive or delete posts.

**Independent Test**: Can be fully tested by logging in, accessing profile, editing avatar and display name, viewing posts, and archiving/deleting posts. The test delivers a working profile management system.

### Implementation for User Story 4

- [ ] T075 [US4] Create ProfilePage component in frontend/src/pages/ProfilePage.tsx to display user profile information
- [ ] T076 [US4] Create AvatarEditor component in frontend/src/components/users/AvatarEditor.tsx for uploading and editing avatar
- [ ] T077 [US4] Create DisplayNameEditor component in frontend/src/components/users/DisplayNameEditor.tsx for editing display name
- [ ] T078 [US4] Implement get user's stories Netlify Function endpoint in netlify/functions/stories.ts (GET /stories/me handler)
- [ ] T079 [US4] Add get user's stories API call in frontend/src/services/api.ts to GET /.netlify/functions/stories/me
- [ ] T080 [US4] Implement update user profile Netlify Function endpoint in netlify/functions/users.ts (PUT /users/me handler)
- [ ] T081 [US4] Add avatar and display_name update logic in netlify/functions/users.ts
- [ ] T082 [US4] Add update profile API call in frontend/src/services/api.ts to PUT /.netlify/functions/users/me
- [ ] T083 [US4] Implement archive story functionality in netlify/functions/stories.ts (PUT /stories/:id/archive handler)
- [ ] T084 [US4] Add archive story API call in frontend/src/services/api.ts to PUT /.netlify/functions/stories/:id/archive
- [ ] T085 [US4] Implement delete story functionality in netlify/functions/stories.ts (DELETE /stories/:id handler)
- [ ] T086 [US4] Add delete story API call in frontend/src/services/api.ts to DELETE /.netlify/functions/stories/:id
- [ ] T087 [US4] Add archive/delete buttons in frontend/src/components/stories/StoryCard.tsx for user's own posts
- [ ] T088 [US4] Add confirmation dialog for delete action in frontend/src/components/stories/StoryCard.tsx
- [ ] T089 [US4] Display daily MeoMeo score on profile page in frontend/src/pages/ProfilePage.tsx
- [ ] T090 [US4] Filter archived posts from public feed in netlify/functions/stories.ts (exclude archived stories)

**Checkpoint**: At this point, User Stories 1, 2, 3, AND 4 should all work independently

---

## Phase 7: User Story 5 - Post Detail Page with Comments (Priority: P5)

**Goal**: Users can view a single post in detail with full comments section, accessible via shareable link or by clicking from feed.

**Independent Test**: Can be fully tested by accessing a shareable post link, viewing the post detail page, and adding comments. The test delivers a working detail view with comments functionality.

### Implementation for User Story 5

- [ ] T091 [US5] Create PostDetailPage component in frontend/src/pages/PostDetailPage.tsx to display single post with comments
- [ ] T092 [US5] Create StoryDetail component in frontend/src/components/stories/StoryDetail.tsx to display full post content
- [ ] T093 [US5] Implement get story by ID Netlify Function endpoint in netlify/functions/stories.ts (GET /stories/:id handler)
- [ ] T094 [US5] Add get story by ID API call in frontend/src/services/api.ts to GET /.netlify/functions/stories/:id
- [ ] T095 [US5] Implement get comments for story Netlify Function endpoint in netlify/functions/comments.ts (GET /comments?story_id=:id handler)
- [ ] T096 [US5] Add get comments API call in frontend/src/services/api.ts to GET /.netlify/functions/comments?story_id=:id
- [ ] T097 [US5] Integrate CommentSection component in frontend/src/pages/PostDetailPage.tsx to display and add comments
- [ ] T098 [US5] Add route for post detail page in frontend/src/App.tsx (/post/:id)
- [ ] T099 [US5] Implement shareable link routing in frontend/src/App.tsx to handle /share/:token routes
- [ ] T100 [US5] Add share token validation in netlify/functions/shares.ts to resolve token to story ID
- [ ] T101 [US5] Add home icon navigation in frontend/src/pages/PostDetailPage.tsx to navigate back to feed
- [ ] T102 [US5] Handle unauthenticated access to public posts in frontend/src/pages/PostDetailPage.tsx (view-only mode)
- [ ] T103 [US5] Disable like/comment actions for unauthenticated users in frontend/src/pages/PostDetailPage.tsx

**Checkpoint**: At this point, User Stories 1, 2, 3, 4, AND 5 should all work independently

---

## Phase 8: User Story 6 - Theme Selection and App Branding (Priority: P6)

**Goal**: Users can select from 3-4 cat-themed visual styles, and the sad cat logo/icon is displayed throughout the app.

**Independent Test**: Can be fully tested by logging in, accessing theme settings, selecting different cat-themed styles, and verifying the UI appearance changes accordingly. The test delivers a working theme system that allows personalization.

### Implementation for User Story 6

- [ ] T104 [US6] Create ThemeSelector component in frontend/src/components/theme/ThemeSelector.tsx with 3-4 cat-themed options
- [ ] T105 [US6] Define CSS variables for each theme in frontend/src/styles/themes.css (default, orange-cat, gray-cat, calico-cat)
- [ ] T106 [US6] Create useTheme hook in frontend/src/hooks/useTheme.ts for theme state management
- [ ] T107 [US6] Implement theme persistence in localStorage in frontend/src/hooks/useTheme.ts
- [ ] T108 [US6] Add theme application logic in frontend/src/hooks/useTheme.ts to update CSS variables dynamically
- [ ] T109 [US6] Implement update theme preference Netlify Function endpoint in netlify/functions/users.ts (PUT /users/me/theme handler)
- [ ] T110 [US6] Add update theme API call in frontend/src/services/api.ts to PUT /.netlify/functions/users/me/theme
- [ ] T111 [US6] Integrate ThemeSelector component in frontend/src/components/layout/Header.tsx or settings area
- [ ] T112 [US6] Add sad cat logo display in frontend/src/components/layout/Header.tsx
- [ ] T113 [US6] Add sad cat logo to LoginPage in frontend/src/pages/LoginPage.tsx
- [ ] T114 [US6] Ensure sad cat logo appears consistently across all pages in the app
- [ ] T115 [US6] Load user's saved theme preference on app initialization in frontend/src/hooks/useTheme.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T116 [P] Add loading states for all API calls in frontend components
- [ ] T117 [P] Add error boundaries in frontend/src/App.tsx for graceful error handling
- [ ] T118 [P] Implement responsive design for mobile devices across all components
- [ ] T119 [P] Add accessibility features (ARIA labels, keyboard navigation) to interactive components
- [ ] T120 [P] Optimize database queries with proper indexing (verify indexes in migrations)
- [ ] T121 [P] Add input sanitization for user-generated content (stories, comments) in netlify functions
- [ ] T122 [P] Implement rate limiting for API endpoints in netlify functions
- [ ] T123 [P] Add comprehensive error logging in netlify/functions/utils/ for debugging
- [ ] T124 [P] Create README.md with setup and deployment instructions
- [ ] T125 [P] Add environment variable documentation in .env.example file
- [ ] T126 [P] Run quickstart.md validation to ensure all setup steps work correctly
- [ ] T127 [P] Code cleanup and refactoring across all components and functions
- [ ] T128 [P] Performance optimization (lazy loading, code splitting) in frontend
- [ ] T129 [P] Security hardening (CORS configuration, input validation, SQL injection prevention)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for authentication
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for authentication, US2 for stories
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Depends on US1 for authentication, US2 for stories
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Depends on US1 for authentication, US2 for stories, US3 for comments
- **User Story 6 (P6)**: Can start after Foundational (Phase 2) - Depends on US1 for authentication, can be implemented independently

### Within Each User Story

- Database migrations before model usage
- Backend functions before frontend API calls
- Components before page integration
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, user stories can start in parallel (if team capacity allows)
- Database migration tasks (T043-T046) can run in parallel
- Component creation tasks marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 3

```bash
# Launch database migrations together:
Task: "Create likes table migration in migrations/002_add_likes_comments.sql"
Task: "Create comments table migration in migrations/002_add_likes_comments.sql"
Task: "Add avatar_url and display_name columns to users table in migrations/002_add_likes_comments.sql"
Task: "Add archived column to stories table in migrations/002_add_likes_comments.sql"

# Launch component creation together:
Task: "Create StoryCard component in frontend/src/components/stories/StoryCard.tsx"
Task: "Create LikeButton component in frontend/src/components/stories/LikeButton.tsx"
Task: "Create CommentSection component in frontend/src/components/stories/CommentSection.tsx"
Task: "Create ShareButton component in frontend/src/components/stories/ShareButton.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Login)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Login) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Create Story) → Test independently → Deploy/Demo
4. Add User Story 3 (Feed with Interactions) → Test independently → Deploy/Demo
5. Add User Story 4 (Profile Management) → Test independently → Deploy/Demo
6. Add User Story 5 (Detail Page) → Test independently → Deploy/Demo
7. Add User Story 6 (Theme Selection) → Test independently → Deploy/Demo
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Login)
   - Developer B: User Story 2 (Create Story) - after US1 complete
   - Developer C: User Story 3 (Feed) - after US1 and US2 complete
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Database migrations (T043-T046) should be combined into a single migration file
- Daily MeoMeo score calculation requires tracking posts, likes, and comments created today
- Shareable links should use secure tokens that can be validated server-side
