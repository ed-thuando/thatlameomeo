---
description: Ultimate coding standards and AI assistant rules for thatlameomeo project
globs: 
alwaysApply: true
---

# Ultimate Cursor Rules for thatlameomeo

This file defines comprehensive coding standards, best practices, and AI assistant guidelines for the thatlameomeo project. These rules ensure consistent code quality, maintainability, and adherence to SOLID principles and clean code practices.

## Rule Application Strategy

### Always Apply Rules (alwaysApply: true)
These rules are **ALWAYS** applied to every AI interaction:
- **Core Architecture Principles**: React component structure, Netlify Functions design, database patterns
- **Code Quality Standards**: SOLID principles, clean code practices, naming conventions
- **Type Safety**: TypeScript usage, type definitions, avoiding `any`
- **Error Handling**: Explicit error handling patterns, never silent failures
- **Security**: Input validation, SQL injection prevention, credential management
- **Constitution Compliance**: All principles from `.specify/memory/constitution.md`

### Smart Apply Rules (Context-Dependent)
These rules are applied **intelligently** based on file type, location, or task:
- **File-Specific Patterns**: Component patterns for React files, handler patterns for Netlify Functions
- **Testing Strategies**: Unit test patterns for utilities, integration tests for user flows
- **Performance Optimization**: Applied only to performance-critical paths
- **Documentation**: JSDoc/TSDoc for public APIs, inline comments for complex logic

## Core Principles Reference

**IMPORTANT**: All code MUST comply with the project constitution at `.specify/memory/constitution.md`. The constitution defines:
- React Component Architecture (Principle I)
- Netlify Functions API Design (Principle II)
- Database Schema & Turso Integration (Principle III)
- Public/Private Data Visibility (Principle IV)
- Component Testing & Quality (Principle V)
- Theme & Styling Consistency (Principle VI)
- Multi-Platform Backend Design (Principle VII)
- Coding Quality & Style Standards (Principle VIII)

## SOLID Principles (Always Apply)

### Single Responsibility Principle (SRP)
- Each function, class, or component MUST have one reason to change
- Functions MUST do one thing and do it well
- Components MUST be focused on a single UI concern
- Netlify Functions MUST handle one specific API endpoint responsibility

**Example - Good:**
```typescript
// Single responsibility: validate user input
function validateStoryContent(content: string): ValidationResult {
  if (!content.trim()) {
    return { valid: false, error: 'Content cannot be empty' }
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return { valid: false, error: `Content exceeds ${MAX_CONTENT_LENGTH} characters` }
  }
  return { valid: true }
}
```

**Example - Bad:**
```typescript
// Multiple responsibilities: validation, API call, state management
function handleStorySubmit(content: string) {
  if (!content.trim()) return
  if (content.length > 5000) return
  apiPost('/stories', { content })
  setStories([...stories, newStory])
  updateScore()
}
```

### Open/Closed Principle
- Code MUST be open for extension but closed for modification
- Use composition and dependency injection
- Prefer interfaces and abstract types over concrete implementations

### Liskov Substitution Principle
- Derived classes/components MUST be substitutable for their base types
- Interface contracts MUST be honored

### Interface Segregation Principle
- Interfaces MUST be specific and focused
- Avoid bloated interfaces with unused methods
- Prefer smaller, composable interfaces

### Dependency Inversion Principle
- High-level modules MUST NOT depend on low-level modules
- Both MUST depend on abstractions
- Dependencies MUST be injected, not hardcoded

**Example - Good:**
```typescript
// Dependency injection
function StoryService(apiClient: ApiClient, validator: ContentValidator) {
  return {
    createStory: async (content: string) => {
      const validation = validator.validate(content)
      if (!validation.valid) throw new Error(validation.error)
      return apiClient.post('/stories', { content })
    }
  }
}
```

## Clean Code Standards (Always Apply)

### Naming Conventions
- **Variables**: Use descriptive nouns in camelCase (`userScore`, `storyContent`, `isLoading`)
- **Functions**: Use descriptive verbs in camelCase (`validateInput`, `fetchStories`, `calculateScore`)
- **Components**: Use PascalCase with descriptive names (`StoryCreateBox`, `UserProfile`, `ThemeToggle`)
- **Constants**: Use UPPER_SNAKE_CASE (`MAX_CONTENT_LENGTH`, `API_BASE_URL`, `DEFAULT_THEME`)
- **Types/Interfaces**: Use PascalCase with descriptive names (`StoryCreateRequest`, `ApiResponse`, `UserProfile`)
- **Boolean variables**: Prefix with `is`, `has`, `should`, `can` (`isLoading`, `hasError`, `shouldValidate`)

**Bad Examples:**
```typescript
const d = new Date() // ❌ Too short
const data = fetchData() // ❌ Too generic
const flag = true // ❌ Meaningless
function doStuff() // ❌ Vague verb
```

**Good Examples:**
```typescript
const createdAt = new Date() // ✅ Descriptive
const userStories = fetchUserStories() // ✅ Specific
const isAuthenticated = true // ✅ Clear boolean
function validateStoryContent() // ✅ Specific action
```

### Function Design
- Functions MUST be small and focused (ideally < 20 lines)
- Functions MUST have clear input/output contracts with TypeScript types
- Functions MUST avoid side effects when possible (prefer pure functions)
- Complex logic MUST be broken into smaller, testable functions
- Functions MUST return early to reduce nesting

**Example - Good:**
```typescript
/**
 * Validates story content and returns validation result
 * @param content - The story content to validate
 * @returns Validation result with validity status and optional error message
 */
function validateStoryContent(content: string): ValidationResult {
  if (!content || typeof content !== 'string') {
    return { valid: false, error: 'Content must be a non-empty string' }
  }
  
  const trimmed = content.trim()
  if (trimmed.length === 0) {
    return { valid: false, error: 'Content cannot be empty' }
  }
  
  if (trimmed.length > MAX_CONTENT_LENGTH) {
    return { valid: false, error: `Content exceeds ${MAX_CONTENT_LENGTH} characters` }
  }
  
  return { valid: true }
}
```

### Code Organization
- Related functionality MUST be grouped together
- Imports MUST be organized: external libraries → internal modules → types
- Dead code, unused imports, and commented-out code MUST be removed
- Code MUST be organized logically within files

**Import Organization:**
```typescript
// 1. External libraries
import { useState, useEffect } from 'react'
import { Handler } from '@netlify/functions'

// 2. Internal modules (services, utils)
import { apiPost } from '../../services/api'
import { validateInput } from '../../utils/validation'

// 3. Types and interfaces
import type { Story, User } from '../../types'

// 4. Constants
import { MAX_CONTENT_LENGTH } from '../../constants'
```

### Magic Numbers and Strings
- Magic numbers MUST be extracted to named constants
- Magic strings MUST be extracted to constants or enums
- Configuration values MUST be stored in config files or environment variables

**Example:**
```typescript
// ❌ Bad: Magic numbers
if (content.length > 5000) { ... }
setTimeout(() => {}, 3000)

// ✅ Good: Named constants
const MAX_CONTENT_LENGTH = 5000
const DEBOUNCE_DELAY_MS = 3000

if (content.length > MAX_CONTENT_LENGTH) { ... }
setTimeout(() => {}, DEBOUNCE_DELAY_MS)
```

## TypeScript Standards (Always Apply)

### Type Safety
- TypeScript types MUST be used consistently throughout the codebase
- The `any` type MUST be avoided unless absolutely necessary (and must be documented)
- Type definitions MUST be explicit, not inferred when unclear
- Interfaces MUST be used for object shapes, types for unions/intersections

**Example - Good:**
```typescript
interface StoryCreateRequest {
  content: string
  visibility: 'public' | 'private'
}

interface ApiResponse<T> {
  data: T
  error?: string
  status: number
}

function createStory(request: StoryCreateRequest): Promise<ApiResponse<Story>> {
  // Implementation
}
```

**Example - Bad:**
```typescript
// ❌ Using any
function processData(data: any) { ... }

// ❌ Missing types
function createStory(request) { ... }

// ❌ Inferred types that should be explicit
const response = await fetch('/api/stories') // What type is response?
```

### Type Definitions
- All function parameters MUST have explicit types
- Return types MUST be explicit for public functions
- Complex types MUST be extracted to interfaces or type aliases
- Generic types MUST be used appropriately for reusable code

## Error Handling (Always Apply)

### Explicit Error Handling
- Errors MUST be handled explicitly—never swallowed silently
- Error messages MUST be meaningful and actionable
- Error handling MUST be consistent across the codebase
- Async operations MUST have proper error handling

**Example - Good:**
```typescript
async function createStory(content: string): Promise<Story> {
  try {
    const validation = validateStoryContent(content)
    if (!validation.valid) {
      throw new ValidationError(validation.error)
    }
    
    const response = await apiPost<Story>('/stories', { content })
    return response.data
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error // Re-throw validation errors
    }
    if (error instanceof ApiException) {
      throw new StoryCreationError(`Failed to create story: ${error.message}`, error)
    }
    throw new UnexpectedError('An unexpected error occurred', error)
  }
}
```

**Example - Bad:**
```typescript
// ❌ Silent error swallowing
async function createStory(content: string) {
  try {
    await apiPost('/stories', { content })
  } catch (error) {
    // Silent failure - user has no idea what went wrong
  }
}

// ❌ Generic error handling
catch (error) {
  console.log('Error') // Not helpful
}
```

## React Component Standards (Smart Apply - React Files)

### Component Structure
- Components MUST be functional components using hooks
- Components MUST be self-contained with clear props interfaces
- Complex components MUST be broken into smaller, composable pieces
- Components MUST be organized by feature/domain in `src/components/`

**Component Template:**
```typescript
import { useState, useEffect } from 'react'
import type { ComponentProps } from 'react'

interface ComponentNameProps {
  // Props with clear types
  requiredProp: string
  optionalProp?: number
  onAction?: (value: string) => void
}

/**
 * Component description
 * @param props - Component props
 */
export function ComponentName({ 
  requiredProp, 
  optionalProp, 
  onAction 
}: ComponentNameProps) {
  // 1. Hooks (useState, useEffect, custom hooks)
  const [state, setState] = useState<StateType>(initialValue)
  
  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies])
  
  // 3. Event handlers
  const handleAction = (value: string) => {
    // Handler logic
    onAction?.(value)
  }
  
  // 4. Render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### State Management
- State MUST use React hooks (useState, useEffect, useContext)
- Complex state logic MUST be extracted to custom hooks
- Global state MUST use appropriate state management libraries when needed
- State updates MUST be immutable

### Props and Interfaces
- All component props MUST have TypeScript interfaces
- Props MUST be destructured in the function signature
- Optional props MUST be marked with `?`
- Default props MUST use default parameters

## Netlify Functions Standards (Smart Apply - Function Files)

### Function Structure
- Functions MUST be in `netlify/functions/` directory
- Functions MUST follow RESTful conventions
- Functions MUST handle CORS properly
- Functions MUST validate input data
- Functions MUST return consistent JSON responses

**Function Template:**
```typescript
import { Handler } from '@netlify/functions'
import { getDbClient, closeDbClient } from './utils/db'
import { createErrorResponse, createSuccessResponse, handleCors } from './utils/errors'

interface RequestBody {
  // Request body type
}

interface ResponseData {
  // Response data type
}

export const handler: Handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return handleCors()
  }

  // Validate HTTP method
  if (event.httpMethod !== 'POST') {
    return createErrorResponse(405, 'Method not allowed', 'MethodNotAllowed')
  }

  try {
    // 1. Parse and validate input
    const body: RequestBody = JSON.parse(event.body || '{}')
    // Validation logic
    
    // 2. Database operations
    const db = getDbClient()
    // Database queries
    
    // 3. Return success response
    return createSuccessResponse<ResponseData>({
      // Response data
    })
  } catch (error) {
    // Error handling
    return createErrorResponse(500, 'Internal server error', 'InternalError')
  } finally {
    // Cleanup (e.g., close database connection)
    await closeDbClient()
  }
}
```

### Error Responses
- Error responses MUST use consistent format
- Error responses MUST include appropriate HTTP status codes
- Error messages MUST be meaningful but not expose sensitive information

## Database Standards (Smart Apply - Database Operations)

### Query Safety
- All database queries MUST use parameterized statements
- SQL injection prevention MUST be enforced
- Database connections MUST be properly managed
- Transactions MUST be used for multi-step operations

**Example:**
```typescript
// ✅ Good: Parameterized query
const result = await db.execute({
  sql: 'SELECT * FROM stories WHERE user_id = ? AND visibility = ?',
  args: [userId, visibility]
})

// ❌ Bad: String concatenation (SQL injection risk)
const result = await db.execute(
  `SELECT * FROM stories WHERE user_id = ${userId}`
)
```

## Testing Standards (Smart Apply - Test Files)

### Minimal Testing Approach
- **ONLY write tests for critical user flows** - Avoid excessive test coverage
- Tests MUST be written ONLY when explicitly requested or for critical business logic
- DO NOT generate tests automatically unless the user asks for them
- Focus on integration tests for critical paths, skip unit tests for simple utilities
- Avoid writing tests for trivial functions, getters, setters, or simple data transformations

### Test Organization
- Critical user flows MUST have integration tests (only when necessary)
- React components MUST be testable in isolation (but tests only written when needed)
- Netlify Functions MUST have unit tests ONLY for complex business logic
- Tests MUST be organized in `tests/` directory

### Test Quality
- Tests MUST be clear and concise
- Tests MUST test behavior, not implementation
- Tests MUST be independent and isolated
- Test names MUST describe what is being tested
- Keep tests minimal - one test per critical scenario, not exhaustive coverage

## Documentation Standards (Smart Apply - Critical APIs Only)

### Minimal Documentation Approach
- **ONLY document critical public APIs** - Avoid verbose documentation
- Documentation MUST be written ONLY for:
  - Spec documents (`.specify/specs/**/*.md`) - Full documentation required
  - Critical public APIs that are used across multiple modules
  - Complex business logic that requires explanation
- DO NOT generate verbose JSDoc/TSDoc comments for simple functions
- DO NOT add documentation unless explicitly requested or for critical APIs
- Code MUST be self-documenting through clear naming—prefer good names over comments

### JSDoc/TSDoc Comments (Only When Critical)
- Critical public APIs MUST have concise documentation
- Documentation MUST be brief—explain purpose and key parameters only
- Complex logic MUST have minimal inline comments explaining "why" (not "what")
- Avoid verbose examples and lengthy descriptions
- Skip documentation for self-explanatory code

**Minimal Documentation Template (Only for Critical APIs):**
```typescript
/**
 * Creates a new story with content and visibility
 * @param content - Story content (max 5000 chars)
 * @param visibility - 'public' or 'private'
 */
async function createStory(
  content: string, 
  visibility: 'public' | 'private'
): Promise<Story> {
  // Implementation
}
```

**DO NOT document simple functions:**
```typescript
// ❌ Bad: Unnecessary documentation
/**
 * Gets the user ID from the user object
 * @param user - The user object
 * @returns The user ID
 */
function getUserId(user: User): number {
  return user.id
}

// ✅ Good: Self-documenting code, no docs needed
function getUserId(user: User): number {
  return user.id
}
```

## Verbosity and Code Generation (Always Apply)

### Avoid Verbose Code and Documentation
- **DO NOT generate verbose code** - Keep code concise and focused
- **DO NOT write excessive comments** - Code should be self-documenting
- **DO NOT create unnecessary abstractions** - Prefer simple, direct code
- **DO NOT generate verbose error messages** - Keep errors clear but brief
- **DO NOT write lengthy explanations in code** - Use clear naming instead

### When to Be Verbose (Exceptions)
- **Spec documents** (`.specify/specs/**/*.md`) - Full documentation and details required
- **Critical architecture decisions** - Document rationale in spec files only
- **Complex algorithms** - Minimal inline comments explaining "why" only

### Code Generation Guidelines
- Generate minimal, focused code that solves the problem
- Avoid over-engineering and premature abstractions
- Prefer simple solutions over complex patterns
- Write code that is self-explanatory through naming
- Only add comments when code cannot be made self-explanatory

## Performance Standards (Smart Apply - Performance-Critical Code)

### Optimization Guidelines
- Performance-critical code paths MUST be optimized
- Premature optimization MUST be avoided
- Code MUST be profiled before optimization
- Optimizations MUST be documented with rationale

### React Performance
- Components MUST use React.memo when appropriate
- Expensive computations MUST use useMemo
- Callbacks MUST use useCallback when passed as props
- Large lists MUST use virtualization when needed

## Code Formatting (Always Apply)

### Prettier and ESLint
- Code MUST be formatted consistently using Prettier
- Code MUST follow ESLint rules without exceptions
- Formatting MUST be enforced in CI/CD pipeline
- No manual formatting overrides unless absolutely necessary

## Security Standards (Always Apply)

### Input Validation
- All user input MUST be validated
- Input validation MUST happen at API boundaries
- Validation errors MUST be returned with clear messages

### Credential Management
- Secrets and API keys MUST be in environment variables
- Credentials MUST NEVER be committed to version control
- Environment variables MUST be documented

### SQL Injection Prevention
- All database queries MUST use parameterized statements
- User input MUST NEVER be concatenated into SQL queries

## Immutability (Always Apply)

### Immutable Patterns
- Immutability MUST be preferred where possible
- Objects and arrays MUST NOT be mutated directly
- State updates MUST use immutable patterns

**Example:**
```typescript
// ✅ Good: Immutable update
setStories([...stories, newStory])
setUser({ ...user, score: user.score + 1 })

// ❌ Bad: Direct mutation
stories.push(newStory)
user.score += 1
```

## Async Operations (Always Apply)

### Async/Await Patterns
- Async operations MUST be handled properly
- Error handling MUST be included for async operations
- Loading states MUST be managed
- Race conditions MUST be prevented

**Example:**
```typescript
// ✅ Good: Proper async handling
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState<string | null>(null)

async function fetchStories() {
  setIsLoading(true)
  setError(null)
  try {
    const stories = await apiGet<Story[]>('/stories')
    setStories(stories)
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to fetch stories')
  } finally {
    setIsLoading(false)
  }
}
```

## Complexity Management (Always Apply)

### Code Complexity
- Cyclomatic complexity MUST be kept low
- Deeply nested conditionals MUST be refactored
- Complex logic MUST be broken into smaller functions
- Early returns MUST be used to reduce nesting

**Example:**
```typescript
// ✅ Good: Early returns, low complexity
function canCreateStory(user: User, content: string): boolean {
  if (!user) return false
  if (!user.isAuthenticated) return false
  if (!content || content.trim().length === 0) return false
  if (user.dailyStoryCount >= MAX_DAILY_STORIES) return false
  return true
}

// ❌ Bad: Deep nesting, high complexity
function canCreateStory(user: User, content: string): boolean {
  if (user) {
    if (user.isAuthenticated) {
      if (content && content.trim().length > 0) {
        if (user.dailyStoryCount < MAX_DAILY_STORIES) {
          return true
        }
      }
    }
  }
  return false
}
```

## When to Apply Rules

### Always Apply (Every AI Interaction)
- Core architecture principles
- Code quality standards (SOLID, clean code)
- Type safety requirements
- Error handling patterns
- Security standards
- Constitution compliance

### Smart Apply (Context-Dependent)
- **React files** (`*.tsx`, `*.jsx`): Apply React component standards
- **Netlify Functions** (`netlify/functions/*.ts`): Apply function standards
- **Test files** (`*.test.ts`, `*.spec.ts`): Apply testing standards
- **Database operations**: Apply database standards
- **Public APIs**: Apply documentation standards
- **Performance-critical paths**: Apply performance standards

### Rule Priority
1. **Constitution compliance** - Highest priority, always enforced
2. **Security standards** - Always enforced, no exceptions
3. **Type safety** - Always enforced for TypeScript files
4. **Code quality** - Always enforced, context-aware application
5. **Performance** - Applied when relevant, not premature

## AI Assistant Guidelines

When generating or modifying code, the AI MUST:
1. ✅ Always check constitution compliance
2. ✅ Apply SOLID principles automatically
3. ✅ Use TypeScript types consistently
4. ✅ Handle errors explicitly
5. ✅ Follow naming conventions
6. ✅ Extract magic numbers/strings
7. ✅ Write self-documenting code (avoid verbose comments)
8. ✅ Apply context-appropriate patterns (React, Functions, etc.)
9. ✅ Remove dead code and unused imports
10. ✅ Format code with Prettier
11. ✅ **Avoid verbose documentation** - Only document critical APIs
12. ✅ **Avoid generating tests** - Only write tests when explicitly requested
13. ✅ **Keep code concise** - Prefer simple solutions over verbose explanations
14. ✅ **Minimize comments** - Code should be self-explanatory through naming

When reviewing code, the AI MUST:
1. ✅ Verify constitution compliance
2. ✅ Check for SOLID principle violations
3. ✅ Identify code smells and refactoring opportunities
4. ✅ Suggest improvements for maintainability
5. ✅ Verify error handling is explicit
6. ✅ Check type safety
7. ✅ Verify security best practices
8. ✅ **Flag unnecessary documentation** - Suggest removal of verbose comments
9. ✅ **Identify over-testing** - Suggest removing non-critical tests
10. ✅ **Check for verbosity** - Suggest simplifying verbose code

## Quick Reference Checklist

Before submitting code, verify:
- [ ] Constitution compliance checked
- [ ] TypeScript types are explicit (no `any` without justification)
- [ ] Functions are small and focused (single responsibility)
- [ ] Error handling is explicit and meaningful
- [ ] Magic numbers/strings extracted to constants
- [ ] Code is self-documenting with clear names
- [ ] Dead code and unused imports removed
- [ ] Code formatted with Prettier
- [ ] ESLint rules followed
- [ ] **No unnecessary documentation** - Only critical APIs documented
- [ ] **No excessive tests** - Only critical paths tested
- [ ] **Code is concise** - No verbose explanations or comments
- [ ] Security best practices followed
- [ ] Immutability preferred where possible
- [ ] Async operations properly handled

---

**Last Updated**: 2026-01-15  
**Version**: 1.1.0  
**Related**: `.specify/memory/constitution.md`

## Summary: Key Principles

1. **Minimal Testing**: Only write tests for critical user flows, avoid excessive coverage
2. **Minimal Documentation**: Only document critical APIs and spec files, avoid verbose comments
3. **Concise Code**: Keep code simple and self-documenting, avoid verbosity
4. **Self-Explanatory**: Use clear naming instead of comments
5. **Spec Documents**: Full documentation required only in `.specify/specs/**/*.md` files
