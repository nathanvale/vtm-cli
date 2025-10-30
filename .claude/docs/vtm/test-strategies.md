# VTM Test Strategies

## Overview

VTM supports four test strategies, each with specific workflows, coverage targets, and JSDoc requirements. The test strategy is defined in the task's `test_strategy` field.

## Strategy Selection Guide

| Strategy     | Use Case                                   | Coverage | JSDoc | Tools          |
| ------------ | ------------------------------------------ | -------- | ----- | -------------- |
| TDD          | High-risk, complex logic, critical code    | ≥80%     | 100%  | Wallaby MCP    |
| Unit         | Medium-risk, standard features             | ≥70%     | 90%   | Jest/Vitest    |
| Integration  | Cross-component behavior, workflows        | ≥60%     | 80%   | Test framework |
| Direct       | Setup, config, docs, manual verification   | N/A      | 50%   | Manual         |

## TDD Strategy

### Red-Green-Refactor Cycle

**RED Phase**: Write tests first (they should fail)

```bash
# 1. Write test file
touch src/lib/__tests__/feature.test.ts

# 2. Write failing tests
# Use Wallaby MCP to verify RED phase
wallaby_failingTests

# Expected: Tests fail with meaningful error messages
```

**GREEN Phase**: Implement code to make tests pass

```bash
# 3. Implement feature
touch src/lib/feature.ts

# 4. Run tests and verify GREEN phase
pnpm test
wallaby_allTests

# Expected: All tests pass
```

**REFACTOR Phase**: Improve code quality

```bash
# 5. Refactor implementation
# - Extract functions
# - Improve naming
# - Remove duplication

# 6. Verify tests still pass
pnpm test

# 7. Check coverage
pnpm test -- --coverage
wallaby_coveredLinesForFile src/lib/feature.ts
```

### Wallaby MCP Integration

Wallaby MCP provides real-time test feedback during TDD:

**Verify RED Phase:**

```typescript
// Use wallaby_failingTests to confirm tests fail before implementation
wallaby_failingTests()

// Expected output:
// {
//   "failingTests": [
//     {
//       "testId": "test-1",
//       "testName": "Feature should do X",
//       "error": "ReferenceError: Feature is not defined",
//       "stackTrace": "..."
//     }
//   ]
// }
```

**Verify GREEN Phase:**

```typescript
// Use wallaby_allTests to confirm tests pass after implementation
wallaby_allTests()

// Expected output:
// {
//   "allTests": [
//     {
//       "testId": "test-1",
//       "testName": "Feature should do X",
//       "status": "passing"
//     }
//   ]
// }
```

**Check Coverage:**

```typescript
// Use wallaby_coveredLinesForFile to verify coverage
wallaby_coveredLinesForFile("src/lib/feature.ts")

// Expected output:
// {
//   "file": "src/lib/feature.ts",
//   "coveredLines": [1, 2, 5, 6, 7, 10, 15],
//   "coveragePercentage": 85.2
// }
```

**Debug Test Failures:**

```typescript
// Use wallaby_runtimeValues to inspect runtime values
wallaby_runtimeValues(
  "src/lib/feature.ts",
  42, // line number
  "const result = computeValue(input)", // line content
  "result" // expression to evaluate
)

// Expected output:
// {
//   "expression": "result",
//   "values": [42, 43, 44] // values from different test runs
// }
```

**Update Snapshots:**

```typescript
// Use wallaby_updateTestSnapshots when snapshots need updating
wallaby_updateTestSnapshots("test-1")

// Or update all snapshots for a file
wallaby_updateFileSnapshots("src/lib/__tests__/feature.test.ts")
```

### Coverage Requirements

- **Minimum**: 80% code coverage
- **Goal**: 90%+ code coverage
- **Tools**: `pnpm test -- --coverage`, Wallaby MCP

### JSDoc Requirements

- **Minimum**: 100% JSDoc coverage
- **Required**: All functions, classes, types, interfaces
- **Format**: TSDoc compliant

Example:

```typescript
/**
 * Computes the final value based on input parameters.
 *
 * @param input - The input value to process
 * @param options - Configuration options
 * @returns The computed result
 * @throws {ValidationError} If input is invalid
 *
 * @example
 * ```typescript
 * const result = computeValue(42, { mode: 'fast' });
 * console.log(result); // 84
 * ```
 */
export function computeValue(
  input: number,
  options: ComputeOptions
): number {
  // implementation
}
```

## Unit Strategy

### Workflow

1. **Implement**: Build core functionality first
2. **Test**: Write comprehensive unit tests
3. **Verify**: Achieve coverage targets
4. **Document**: Add JSDoc for exported functions

### Coverage Requirements

- **Minimum**: 70% code coverage
- **Goal**: 80%+ code coverage
- **Tools**: `pnpm test -- --coverage`

### JSDoc Requirements

- **Minimum**: 90% JSDoc coverage
- **Required**: All exported functions, public APIs
- **Optional**: Internal helper functions

Example:

```typescript
/**
 * Validates user input according to schema.
 *
 * @param input - The input to validate
 * @param schema - The validation schema
 * @returns True if valid, false otherwise
 */
export function validateInput(input: unknown, schema: Schema): boolean {
  // implementation
}

// Internal helper - JSDoc optional but recommended
function normalizeInput(input: unknown): unknown {
  // implementation
}
```

## Integration Strategy

### Workflow

1. **Design**: Plan cross-component interactions
2. **Implement**: Build features with realistic scenarios
3. **Test**: Write integration tests
4. **Verify**: Test end-to-end workflows

### Coverage Requirements

- **Minimum**: 60% code coverage
- **Goal**: 70%+ code coverage
- **Focus**: Integration points, not internal implementation

### JSDoc Requirements

- **Minimum**: 80% JSDoc coverage
- **Required**: Public APIs, integration points
- **Optional**: Internal implementation details

Example:

```typescript
/**
 * Creates a new user and sends welcome email.
 * Integrates UserService, EmailService, and NotificationService.
 *
 * @param userData - User registration data
 * @returns The created user with welcome email status
 * @throws {ValidationError} If user data is invalid
 * @throws {EmailError} If welcome email fails to send
 */
export async function registerUser(userData: UserData): Promise<User> {
  // integration implementation
}
```

### Integration Test Example

```typescript
describe("User Registration Flow", () => {
  it("should create user and send welcome email", async () => {
    // Setup
    const userData = { email: "test@example.com", name: "Test User" }

    // Execute
    const user = await registerUser(userData)

    // Verify
    expect(user.id).toBeDefined()
    expect(user.email).toBe(userData.email)
    expect(user.welcomeEmailSent).toBe(true)
  })
})
```

## Direct Strategy

### Workflow

1. **Execute**: Complete setup or configuration
2. **Document**: Create or update documentation
3. **Verify**: Manual verification of functionality

### Coverage Requirements

- **Minimum**: N/A (manual verification)
- **Optional**: Unit tests if code is created

### JSDoc Requirements

- **Minimum**: 50% JSDoc coverage (if code created)
- **Required**: Public functions only
- **Focus**: API clarity for future developers

### Use Cases

- Configuration files
- Documentation updates
- Build scripts
- CI/CD setup
- Infrastructure as code
- Deployment procedures

Example:

```typescript
/**
 * Configures the VTM CLI for the project.
 * Run this script during project setup.
 */
export function configureVTM() {
  // configuration logic
}
```

## Pre-flight Checklist (All Strategies)

Before implementation starts:

- [ ] Task context is clear and complete
- [ ] All dependencies are completed
- [ ] Test strategy is appropriate for the task
- [ ] Development environment is ready
- [ ] Required files exist or can be created

## Post-flight Checklist (All Strategies)

Before marking complete:

- [ ] All acceptance criteria met
- [ ] Test coverage meets target (if applicable)
- [ ] All tests passing (if applicable)
- [ ] Linting clean (`pnpm lint:fix`)
- [ ] Type checking passed (`pnpm build`)
- [ ] JSDoc coverage meets target
- [ ] Commits made with clear messages
- [ ] No blockers or outstanding issues

## Validation Commands

### Type Checking

```bash
pnpm build
# Expected: No TypeScript errors
```

### Linting

```bash
pnpm lint        # Check for issues
pnpm lint:fix    # Auto-fix issues
# Expected: No linting errors
```

### Testing

```bash
pnpm test                      # Run all tests
pnpm test -- --coverage        # Run with coverage
pnpm test -- feature.test.ts   # Run specific test
# Expected: All tests pass
```

### Coverage Verification

```bash
pnpm test -- --coverage

# Expected output:
# ----------------------------|---------|----------|---------|---------|
# File                        | % Stmts | % Branch | % Funcs | % Lines |
# ----------------------------|---------|----------|---------|---------|
# All files                   |   85.12 |    80.45 |   87.23 |   85.67 |
#  src/lib/feature.ts         |   90.12 |    85.00 |   92.00 |   91.23 |
# ----------------------------|---------|----------|---------|---------|
```

### Full Validation

```bash
pnpm validate
# Runs: lint + build + test
# Expected: All checks pass
```

## Wallaby MCP Tools Reference

### Test Execution

| Tool                            | Purpose                          | When to Use            |
| ------------------------------- | -------------------------------- | ---------------------- |
| `wallaby_failingTests`          | Get all failing tests            | RED phase verification |
| `wallaby_allTests`              | Get all tests with status        | GREEN phase check      |
| `wallaby_failingTestsForFile`   | Get failing tests for a file     | File-specific issues   |
| `wallaby_allTestsForFile`       | Get all tests for a file         | File coverage check    |
| `wallaby_failingTestsForFileLine` | Get failing tests for a line   | Line-specific issues   |
| `wallaby_allTestsForFileLine`   | Get all tests for a line         | Line coverage check    |
| `wallaby_testById`              | Get test details by ID           | Specific test analysis |

### Code Coverage

| Tool                             | Purpose                       | When to Use            |
| -------------------------------- | ----------------------------- | ---------------------- |
| `wallaby_coveredLinesForFile`    | Get covered lines for a file  | File coverage analysis |
| `wallaby_coveredLinesForTest`    | Get lines covered by a test   | Test scope analysis    |

### Runtime Analysis

| Tool                          | Purpose                      | When to Use           |
| ----------------------------- | ---------------------------- | --------------------- |
| `wallaby_runtimeValues`       | Get runtime values at a line | Debug test failures   |
| `wallaby_runtimeValuesByTest` | Get values for specific test | Test-specific debug   |

### Snapshot Management

| Tool                               | Purpose                          | When to Use              |
| ---------------------------------- | -------------------------------- | ------------------------ |
| `wallaby_updateTestSnapshots`      | Update snapshots for a test      | Snapshot changes         |
| `wallaby_updateFileSnapshots`      | Update snapshots for a file      | File snapshot updates    |
| `wallaby_updateProjectSnapshots`   | Update all project snapshots     | Major snapshot overhaul  |

## See Also

- [Execute Workflow](./execute-workflow.md) - Task execution details
- [Coding Standards](./coding-standards.md) - Project coding standards
- [Done Workflow](./done-workflow.md) - Task completion workflow
