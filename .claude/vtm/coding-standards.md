# VTM CLI Coding Standards

This document defines the coding standards for VTM CLI tasks. All code must adhere to these standards for acceptance.

---

## Documentation Standards

### JSDoc/TypeDoc Requirements

**All exported functions, classes, interfaces, and types MUST have comprehensive JSDoc comments.**

#### Required JSDoc Tags

| Tag           | Required For                     | Description                                        |
| ------------- | -------------------------------- | -------------------------------------------------- |
| `@param`      | All function parameters          | Parameter name, type, and description              |
| `@returns`    | All functions with return values | Return type and description                        |
| `@throws`     | All functions that throw errors  | Error type and conditions                          |
| `@example`    | Public APIs, complex functions   | Usage examples with expected output                |
| `@remarks`    | When additional context needed   | Implementation details, caveats, performance notes |
| `@internal`   | Private/internal functions       | Marks as internal (excluded from public docs)      |
| `@deprecated` | Deprecated APIs                  | Reason and alternative                             |
| `@see`        | Related functions/docs           | Links to related documentation                     |

#### JSDoc Examples

**Simple Function:**

```typescript
/**
 * Adds two numbers together.
 *
 * @param a - The first number
 * @param b - The second number
 * @returns The sum of a and b
 */
function add(a: number, b: number): number {
  return a + b
}
```

**Complex Function with Error Handling:**

````typescript
/**
 * Reads a task from the VTM manifest by ID.
 *
 * Loads the VTM file from disk, parses JSON, and finds the task
 * matching the provided ID. Uses caching to avoid redundant reads.
 *
 * @param taskId - The task ID in format TASK-XXX (e.g., "TASK-001")
 * @param vtmPath - Optional path to vtm.json file (defaults to cwd)
 * @returns The task object with all properties
 * @throws {Error} If task ID is not found in VTM
 * @throws {SyntaxError} If vtm.json is invalid JSON
 * @throws {Error} If vtm.json file does not exist
 *
 * @example
 * ```typescript
 * const task = readTask('TASK-001');
 * console.log(task.title); // "Implement authentication"
 * ```
 *
 * @remarks
 * This function uses a cache to avoid re-reading the VTM file on
 * subsequent calls. Call with `force: true` to bypass cache.
 *
 * @see {@link VTMReader.getTaskWithContext} for task with dependencies
 */
export function readTask(taskId: string, vtmPath?: string): Task {
  // Implementation...
}
````

**Class with JSDoc:**

````typescript
/**
 * Builds task context for Claude Code execution.
 *
 * Generates minimal or compact context from VTM tasks, optimized
 * for token efficiency. Context includes task details, dependencies,
 * acceptance criteria, and source document references.
 *
 * @remarks
 * The ContextBuilder uses two strategies:
 * - Minimal context (~2000 tokens): Full markdown format with all details
 * - Compact context (~500 tokens): Single-line format with essentials
 *
 * @example
 * ```typescript
 * const builder = new ContextBuilder();
 * const context = builder.buildMinimalContext('TASK-001');
 * // context contains markdown-formatted task details
 * ```
 */
export class ContextBuilder {
  /**
   * Generates minimal context for a task (~2000 tokens).
   *
   * Includes full task details, acceptance criteria, dependencies,
   * file operations, and source document references in markdown format.
   *
   * @param taskId - The task ID in format TASK-XXX
   * @param vtmPath - Optional path to vtm.json file
   * @returns Markdown-formatted task context string
   * @throws {Error} If task is not found
   *
   * @see {@link buildCompactContext} for ultra-minimal format
   */
  buildMinimalContext(taskId: string, vtmPath?: string): string {
    // Implementation...
  }

  /**
   * Generates compact context for a task (~500 tokens).
   *
   * Ultra-minimal single-line format with only essential information:
   * task ID, title, test strategy, acceptance criteria, and files.
   *
   * @param taskId - The task ID in format TASK-XXX
   * @param vtmPath - Optional path to vtm.json file
   * @returns Single-line JSON-friendly compact context
   * @throws {Error} If task is not found
   *
   * @remarks
   * Use this format when token budget is constrained or for bulk
   * operations where full context is not needed.
   *
   * @see {@link buildMinimalContext} for full markdown format
   */
  buildCompactContext(taskId: string, vtmPath?: string): string {
    // Implementation...
  }
}
````

**Interface/Type with JSDoc:**

````typescript
/**
 * Represents a VTM task with all properties and metadata.
 *
 * Tasks are the core unit of work in VTM, tracking implementation
 * progress from planning through completion. Each task has unique
 * ID, dependencies, acceptance criteria, and test strategy.
 */
export interface Task {
  /**
   * Unique task identifier in format TASK-XXX (e.g., "TASK-001").
   */
  id: string

  /**
   * Brief task title summarizing the work (max 80 characters).
   */
  title: string

  /**
   * Detailed description of what needs to be implemented.
   *
   * @remarks
   * Should be detailed enough for implementation without referring
   * to source documents, but can reference ADRs for context.
   */
  description: string

  /**
   * Array of acceptance criteria that must be met for completion.
   *
   * Each criterion should be specific, measurable, and testable.
   *
   * @example
   * ```typescript
   * acceptance_criteria: [
   *   "User can log in with email and password",
   *   "Invalid credentials show error message",
   *   "Session persists after browser refresh"
   * ]
   * ```
   */
  acceptance_criteria: string[]

  /**
   * Current task status.
   *
   * @remarks
   * - pending: Not started, waiting to begin
   * - in-progress: Currently being worked on
   * - completed: Finished and validated
   * - blocked: Cannot proceed due to dependencies
   */
  status: "pending" | "in-progress" | "completed" | "blocked"

  /**
   * Test strategy defining how this task should be tested.
   *
   * @remarks
   * - TDD: Test-Driven Development (write tests first, highest quality)
   * - Unit: Unit tests after implementation (medium quality)
   * - Integration: Cross-component testing (system behavior)
   * - Direct: Manual verification (setup/config tasks)
   */
  test_strategy: "TDD" | "Unit" | "Integration" | "Direct"

  // ... other properties with JSDoc
}
````

---

## TypeScript Standards

### Type Safety

- ✅ Use TypeScript strict mode
- ✅ No `any` types (use `unknown` with type guards instead)
- ✅ Explicit return types on all exported functions
- ✅ Use `const` assertions for literal types
- ✅ Prefer type inference for simple local variables
- ✅ Use discriminated unions for variant types

**Good:**

```typescript
// Explicit return type on exported function
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// Type inference for local variable
const sum = calculateTotal(items) // Type inferred as number

// Discriminated union
type Result<T> = { success: true; data: T } | { success: false; error: string }
```

**Bad:**

```typescript
// Missing return type
export function calculateTotal(items: Item[]) {
  // ❌
  return items.reduce((sum, item) => sum + item.price, 0)
}

// Using 'any'
function process(data: any) {
  // ❌ Use 'unknown' instead
  return data.value
}
```

### Null Safety

- ✅ Use optional chaining (`?.`) for nullable properties
- ✅ Use nullish coalescing (`??`) for default values
- ✅ Avoid `!` (non-null assertion) unless absolutely necessary
- ✅ Check for null/undefined explicitly when needed

**Good:**

```typescript
const name = user?.profile?.name ?? "Anonymous"
```

**Bad:**

```typescript
const name = user!.profile!.name || "Anonymous" // ❌ Risky
```

---

## Testing Standards

### Test Structure

- ✅ Descriptive test names: `it('should return empty array when no tasks match')`
- ✅ Arrange-Act-Assert pattern
- ✅ One assertion per test (or closely related assertions)
- ✅ Test edge cases: empty inputs, boundaries, null/undefined
- ✅ Test error conditions (all throws clauses)

### Test Coverage

| Test Strategy | Coverage Target | Requirements                     |
| ------------- | --------------- | -------------------------------- |
| TDD           | ≥80%            | All branches, edge cases, errors |
| Unit          | ≥70%            | Main paths, common edge cases    |
| Integration   | ≥60%            | System behavior, critical paths  |
| Direct        | N/A             | Manual verification              |

### Test Naming

```typescript
describe("VTMReader", () => {
  describe("getTaskWithContext", () => {
    it("should return task with resolved dependencies", () => {
      // Test implementation
    })

    it("should throw error when task ID is not found", () => {
      // Test implementation
    })

    it("should return empty dependencies array when task has no dependencies", () => {
      // Test implementation
    })
  })
})
```

---

## Code Quality Standards

### Linting

- ✅ ESLint must pass: `pnpm lint`
- ✅ Auto-fix where possible: `pnpm lint:fix`
- ✅ No ESLint disable comments without justification
- ✅ Fix all warnings, not just errors

### Formatting

- ✅ Prettier formatted: `pnpm format`
- ✅ Consistent indentation (2 spaces)
- ✅ Trailing commas in multi-line objects/arrays
- ✅ Single quotes for strings (unless template literal needed)
- ✅ Semicolons required

### Code Style

- ✅ Descriptive variable names (avoid single letters except loop indices)
- ✅ Use `const` by default, `let` only when reassignment needed
- ✅ No `var` declarations
- ✅ Avoid deeply nested conditionals (max 3 levels)
- ✅ Extract complex logic into named functions
- ✅ Keep functions small (< 50 lines ideally)
- ✅ Use early returns to reduce nesting

**Good:**

```typescript
function getUserName(user: User | null): string {
  if (!user) {
    return "Anonymous"
  }

  if (!user.profile) {
    return user.email
  }

  return user.profile.name ?? user.email
}
```

**Bad:**

```typescript
function getUserName(user: User | null): string {
  if (user) {
    if (user.profile) {
      if (user.profile.name) {
        return user.profile.name
      } else {
        return user.email
      }
    } else {
      return user.email
    }
  } else {
    return "Anonymous"
  }
}
```

### No Debug Code

- ✅ No `console.log` statements (use proper logging library)
- ✅ No commented-out code (use git history instead)
- ✅ No `debugger` statements
- ✅ No `TODO` comments without tickets
- ✅ Remove unused imports

---

## Git Standards

### Commit Messages

Follow Conventional Commits format:

```
<type>(<scope>): <description> [TASK-XXX]

<optional body>

<optional footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring (no behavior change)
- `test`: Add or update tests
- `docs`: Documentation changes
- `chore`: Build, tooling, dependencies
- `perf`: Performance improvements
- `style`: Code style/formatting (no logic change)

**Examples:**

```
feat(vtm): add instruction builder for TDD tasks [TASK-042]
fix(reader): handle missing dependencies correctly [TASK-043]
refactor(context): extract template interpolation logic [TASK-042]
test(instruction): add comprehensive JSDoc validation tests [TASK-042]
docs(readme): update TDD workflow with Wallaby MCP [TASK-042]
```

### Branch Naming

- `feature/TASK-XXX-short-description`
- `fix/TASK-XXX-short-description`
- `refactor/TASK-XXX-short-description`

---

## File Organization

### Module Structure

```
src/
├── index.ts                 # CLI entry point
├── lib/                     # Core library code
│   ├── vtm-reader.ts       # Read operations
│   ├── vtm-writer.ts       # Write operations
│   ├── context-builder.ts  # Context generation
│   ├── instruction-builder.ts # Instruction generation
│   ├── types.ts            # Type definitions
│   ├── data/               # Static data files
│   │   └── *.json
│   └── __tests__/          # Tests co-located with code
│       ├── vtm-reader.test.ts
│       └── *.test.ts
└── utils/                   # Shared utilities
    └── *.ts
```

### Import Order

1. Node.js built-ins
2. External dependencies
3. Internal modules (absolute imports)
4. Relative imports
5. Types (type-only imports last)

**Example:**

```typescript
// Node.js built-ins
import fs from "fs"
import path from "path"

// External dependencies
import chalk from "chalk"
import { Command } from "commander"

// Internal modules
import { VTMReader } from "./lib/vtm-reader"
import { ContextBuilder } from "./lib/context-builder"

// Types
import type { Task, VTM } from "./lib/types"
```

---

## Performance Standards

### Token Efficiency

- ✅ Minimize context size for AI operations
- ✅ Use compact formats when possible
- ✅ Filter to relevant data only (no full VTM loads)
- ✅ Cache frequently accessed data

### Build Performance

- ✅ TypeScript compilation completes in < 5 seconds
- ✅ Tests complete in < 30 seconds
- ✅ Linting completes in < 10 seconds

---

## Security Standards

### Input Validation

- ✅ Validate all user inputs
- ✅ Sanitize file paths (prevent directory traversal)
- ✅ Validate task IDs match expected format
- ✅ Check file existence before operations

### Secrets Management

- ✅ No hardcoded secrets, API keys, or tokens
- ✅ No secrets in commit history
- ✅ Use environment variables for sensitive data
- ✅ Add sensitive files to .gitignore

---

## Validation Commands

Run these commands before marking a task complete:

```bash
# Type checking
pnpm build

# Linting
pnpm lint

# Auto-fix linting issues
pnpm lint:fix

# Formatting
pnpm format

# Tests
pnpm test

# Test coverage
pnpm test -- --coverage

# Generate TypeDoc (verify JSDoc)
pnpm run docs

# Full validation
pnpm validate
```

---

## TypeDoc Generation

VTM CLI uses TypeDoc to generate API documentation from JSDoc comments.

### Setup TypeDoc

Add to `package.json`:

```json
{
  "devDependencies": {
    "typedoc": "^0.25.0"
  },
  "scripts": {
    "docs": "typedoc --out docs src/lib"
  }
}
```

### TypeDoc Configuration

Create `typedoc.json`:

```json
{
  "entryPointStrategy": "expand",
  "entryPoints": ["src/lib"],
  "exclude": ["**/*.test.ts", "**/__tests__/**"],
  "excludeInternal": false,
  "excludePrivate": false,
  "includeVersion": true,
  "kindSortOrder": ["Class", "Interface", "Type alias", "Function", "Variable"],
  "out": "docs",
  "sort": ["source-order"]
}
```

### Generate and Review Docs

```bash
# Generate TypeDoc documentation
pnpm run docs

# Open in browser
open docs/index.html

# Check for missing documentation
# TypeDoc will warn about undocumented exports
```

---

## Standards by Test Strategy

| Standard       | TDD      | Unit     | Integration | Direct   |
| -------------- | -------- | -------- | ----------- | -------- |
| JSDoc Coverage | 100%     | 90%      | 80%         | 50%      |
| Test Coverage  | ≥80%     | ≥70%     | ≥60%        | N/A      |
| Type Safety    | Strict   | Strict   | Strict      | Strict   |
| Linting        | Required | Required | Required    | Required |
| Wallaby MCP    | Required | Optional | Optional    | N/A      |
| Examples       | Required | Optional | Optional    | N/A      |

---

**Remember:** These standards ensure code quality, maintainability, and excellent developer experience. All TDD tasks must meet the highest standards.
