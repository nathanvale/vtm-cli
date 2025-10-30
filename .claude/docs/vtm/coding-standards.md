# VTM Coding Standards

## Overview

This document defines the coding standards for the VTM CLI project. All code must adhere to these standards to ensure consistency, maintainability, and quality.

## TypeScript Standards

### Strict Mode

All TypeScript code must use strict mode:

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true
  }
}
```

### No `any` Types

Avoid `any` types unless absolutely necessary:

**Bad:**

```typescript
function processData(data: any) {
  return data.value
}
```

**Good:**

```typescript
function processData(data: unknown): string {
  if (typeof data === "object" && data !== null && "value" in data) {
    return String(data.value)
  }
  throw new Error("Invalid data format")
}
```

**Acceptable** (with documentation):

```typescript
/**
 * Processes raw API response.
 * Uses `any` because response structure is dynamic and validated at runtime.
 */
function processAPIResponse(response: any): ProcessedData {
  // Runtime validation here
  return validateAndTransform(response)
}
```

### Type Definitions

All functions, classes, and modules must have explicit type definitions:

```typescript
// Function types
function calculateTotal(items: Item[]): number {
  // implementation
}

// Interface definitions
interface Task {
  id: string
  title: string
  status: TaskStatus
}

// Type aliases
type TaskStatus = "pending" | "in-progress" | "completed" | "blocked"

// Generic types
function findById<T extends { id: string }>(
  items: T[],
  id: string
): T | undefined {
  return items.find((item) => item.id === id)
}
```

## JSDoc Requirements

JSDoc requirements vary by test strategy. See [Test Strategies](./test-strategies.md) for detailed requirements.

### Minimum Coverage by Strategy

| Strategy     | JSDoc Coverage | What Must Be Documented          |
| ------------ | -------------- | -------------------------------- |
| TDD          | 100%           | Everything                       |
| Unit         | 90%            | All exported functions           |
| Integration  | 80%            | Public APIs, integration points  |
| Direct       | 50%            | Public functions (if code exists)|

### JSDoc Format

Use TSDoc-compliant format:

```typescript
/**
 * Brief description of what the function does.
 * Can span multiple lines if needed.
 *
 * @param paramName - Description of the parameter
 * @param optionalParam - Description of optional parameter
 * @returns Description of return value
 * @throws {ErrorType} Description of when this error is thrown
 *
 * @example
 * ```typescript
 * const result = functionName(arg1, arg2);
 * console.log(result); // Expected output
 * ```
 *
 * @see {@link RelatedFunction} for related functionality
 */
export function functionName(
  paramName: string,
  optionalParam?: number
): ReturnType {
  // implementation
}
```

### Required JSDoc Elements

**For Functions:**

- Brief description
- `@param` for each parameter
- `@returns` for return value
- `@throws` for any errors thrown
- `@example` for complex functions (TDD strategy)

**For Classes:**

```typescript
/**
 * Brief description of the class purpose.
 *
 * @example
 * ```typescript
 * const instance = new ClassName(config);
 * instance.doSomething();
 * ```
 */
export class ClassName {
  /**
   * Creates a new instance.
   *
   * @param config - Configuration options
   */
  constructor(private config: Config) {}

  /**
   * Performs the main operation.
   *
   * @returns The operation result
   */
  doSomething(): Result {
    // implementation
  }
}
```

**For Types and Interfaces:**

```typescript
/**
 * Represents a VTM task with all metadata.
 */
export interface Task {
  /**
   * Unique task identifier (format: TASK-XXX)
   */
  id: string

  /**
   * Human-readable task title
   */
  title: string

  /**
   * Current task status
   */
  status: TaskStatus
}
```

## Linting Standards

### ESLint Configuration

The project uses ESLint with strict rules:

```bash
# Check for linting issues
pnpm lint

# Auto-fix issues
pnpm lint:fix
```

### Common Rules

- No unused variables
- No console.log (use proper logging)
- No var (use const/let)
- Prefer const over let
- No implicit returns
- Consistent spacing and formatting

### Prettier Integration

Code formatting is handled by Prettier:

```bash
# Format all files
pnpm format
```

Configuration in `.prettierrc`:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

## Commit Message Format

### Conventional Commits

All commits must follow the Conventional Commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type       | Purpose                                    | Example                                 |
| ---------- | ------------------------------------------ | --------------------------------------- |
| `feat`     | New feature                                | `feat(cli): add analyze command`        |
| `fix`      | Bug fix                                    | `fix(reader): handle missing vtm.json`  |
| `refactor` | Code refactoring (no behavior change)      | `refactor(writer): extract validation`  |
| `test`     | Adding or updating tests                   | `test(engine): add deep analysis tests` |
| `docs`     | Documentation changes                      | `docs(readme): update install steps`    |
| `chore`    | Build, CI, dependencies, etc.              | `chore(deps): update typescript to 5.3` |
| `style`    | Code style changes (formatting)            | `style: fix linting issues`             |
| `perf`     | Performance improvements                   | `perf(cache): optimize lookup speed`    |

### Scope

The scope indicates what part of the codebase is affected:

- `cli` - CLI commands
- `lib` - Library code
- `reader` - VTMReader
- `writer` - VTMWriter
- `engine` - DecisionEngine
- `plan` - Plan domain
- `vtm` - VTM domain
- `git` - Git integration
- `test` - Test infrastructure

### Examples

**Good commits:**

```
feat(engine): add deep architecture analysis with 3-tier pipeline

Implements ComponentAnalyzer, IssueDetector, and RefactoringPlanner
for comprehensive domain analysis. Includes 19 TDD tests with 100%
coverage.

Closes #42
```

```
fix(reader): resolve circular dependency detection bug

The dependency resolver failed to detect circular dependencies when
tasks referenced themselves indirectly. Updated algorithm to use
visited set for proper cycle detection.
```

```
refactor(plan): extract validation logic to separate module

Moves ADR and Spec validation from plan-validators.ts to dedicated
adr-spec-validator.ts module for better separation of concerns.
```

**Bad commits:**

```
Update files  ❌ (too vague)
```

```
feat: stuff  ❌ (no scope, unclear description)
```

```
Fixed bug  ❌ (wrong format, no scope, unclear what was fixed)
```

## Test Coverage Standards

### Coverage Targets by Strategy

| Strategy     | Minimum | Goal  | Focus                   |
| ------------ | ------- | ----- | ----------------------- |
| TDD          | 80%     | 90%+  | All code paths          |
| Unit         | 70%     | 80%+  | Public APIs             |
| Integration  | 60%     | 70%+  | Integration points      |
| Direct       | N/A     | N/A   | Manual verification     |

### Coverage Metrics

Track four coverage dimensions:

- **Statements**: Individual statements executed
- **Branches**: Conditional branches taken
- **Functions**: Functions called
- **Lines**: Lines of code executed

### Verification

```bash
# Run tests with coverage
pnpm test -- --coverage

# View coverage report
open coverage/lcov-report/index.html
```

## Code Organization

### File Structure

```
src/
  lib/                      # Library code
    __tests__/              # Tests co-located
      feature.test.ts
    feature.ts              # Implementation
    types.ts                # Type definitions
    index.ts                # Public API
  index.ts                  # CLI entry point
```

### Module Exports

Use barrel exports for clean imports:

```typescript
// src/lib/index.ts
export { VTMReader } from "./vtm-reader"
export { VTMWriter } from "./vtm-writer"
export { DecisionEngine } from "./decision-engine"
export type { Task, VTM, TaskStatus } from "./types"
```

### Naming Conventions

- **Files**: kebab-case (`vtm-reader.ts`)
- **Classes**: PascalCase (`VTMReader`)
- **Functions**: camelCase (`getReadyTasks`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_TASKS`)
- **Interfaces**: PascalCase (`Task`)
- **Types**: PascalCase (`TaskStatus`)

## Error Handling

### Typed Errors

Use custom error classes:

```typescript
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string
  ) {
    super(message)
    this.name = "ValidationError"
  }
}

// Usage
if (!isValid(input)) {
  throw new ValidationError("Invalid input format", "input")
}
```

### Error Messages

Provide actionable error messages:

**Bad:**

```typescript
throw new Error("Invalid")
```

**Good:**

```typescript
throw new ValidationError(
  `Task ID must match format TASK-XXX, got: ${taskId}`,
  "taskId"
)
```

## Validation Commands

### Pre-commit Checks

Before committing:

```bash
# 1. Format code
pnpm format

# 2. Fix linting issues
pnpm lint:fix

# 3. Build (type check)
pnpm build

# 4. Run tests
pnpm test

# 5. Check coverage
pnpm test -- --coverage
```

### Full Validation

Run complete validation suite:

```bash
pnpm validate
# Runs: lint + build + test
```

## See Also

- [Test Strategies](./test-strategies.md) - Testing approach and coverage requirements
- [Execute Workflow](./execute-workflow.md) - Task execution details
- [Done Workflow](./done-workflow.md) - Task completion workflow
