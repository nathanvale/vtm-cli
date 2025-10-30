# Task Instructions: ${task.id} - ${task.title}

## Objective

${task.description}

## Acceptance Criteria

${acceptanceCriteriaList}

---

## Test Strategy: Unit Testing

Unit tests are written **after** implementation to verify individual functions and modules in isolation.

### Unit Test Workflow

#### 1. Implement First

- Write the implementation code
- Follow coding standards (JSDoc, type safety)
- Keep functions small and testable
- Avoid complex dependencies

#### 2. Write Unit Tests

- Test individual functions in isolation
- Mock external dependencies
- Test happy paths and edge cases
- Test error conditions

#### 3. Verify Coverage

- Run tests: `pnpm test`
- Check coverage: `pnpm test -- --coverage`
- Target: Minimum 70% coverage for Unit tasks

#### 4. Refactor if Needed

- Improve test coverage for critical paths
- Refactor code for better testability
- Ensure tests remain fast (< 100ms per test)

### Wallaby MCP (Optional)

While not mandatory for Unit tasks, Wallaby MCP can provide valuable real-time feedback:

**Useful Wallaby MCP Tools for Unit Testing:**

```typescript
// Check test status
mcp__wallaby__wallaby_allTestsForFile({ file: "path/to/test.test.ts" })

// Verify coverage
mcp__wallaby__wallaby_coveredLinesForFile({ file: "path/to/implementation.ts" })

// Debug test failures
mcp__wallaby__wallaby_failingTestsForFile({ file: "path/to/test.test.ts" })

// Inspect runtime values
mcp__wallaby__wallaby_runtimeValues({ file, line, lineContent, expression })
```

---

## Coding Standards

### Documentation (JSDoc/TypeDoc)

**REQUIRED for Unit tasks:**

- ✅ Write JSDoc for **all exported** functions, classes, and types
- ✅ Include `@param` for all parameters
- ✅ Include `@returns` for return values
- ✅ Include `@throws` for error conditions
- ✅ Include `@example` for complex or public APIs (optional for simple functions)
- ✅ Generate TypeDoc: `pnpm run docs`

**Acceptable for internal functions:**

- Simple one-line JSDoc is OK for internal/private functions
- Full JSDoc required for exported APIs

**Example:**

```typescript
/**
 * Formats a task ID for display.
 *
 * @param taskId - Task ID in format TASK-XXX
 * @returns Formatted task ID with color coding
 */
export function formatTaskId(taskId: string): string {
  // Implementation...
}

/**
 * Helper to extract task number from ID.
 * @internal
 */
function extractTaskNumber(taskId: string): number {
  // Implementation...
}
```

### Type Safety

- ✅ TypeScript strict mode enabled
- ✅ No `any` types (use `unknown` with type guards)
- ✅ Explicit return types on exported functions
- ✅ Type inference OK for simple local variables

### Test Coverage

**Target: Minimum 70% coverage**

- ✅ Test all exported functions
- ✅ Test happy paths and common edge cases
- ✅ Test error conditions
- ✅ Mock external dependencies (file system, network, etc.)
- ✅ Verify with: `pnpm test -- --coverage`

### Code Quality

- ✅ ESLint passes: `pnpm lint`
- ✅ Prettier formatted: `pnpm format`
- ✅ Build succeeds: `pnpm build`
- ✅ No console.log statements
- ✅ No commented-out code

---

## File Operations

${fileOperationsList}

## Dependencies (Completed)

${dependenciesList}

## Source Documents

${sourceDocuments}

---

## Pre-Flight Checklist

Before starting implementation:

- [ ] Dependencies installed: `pnpm install`
- [ ] All existing tests passing: `pnpm test`
- [ ] Build succeeds: `pnpm build`
- [ ] Understood acceptance criteria
- [ ] Reviewed source documents (ADR/Spec)

---

## Implementation Workflow (Unit)

### Step 1: Implement Code

1. Create implementation file
2. Write functions following coding standards
3. Add comprehensive JSDoc to exported functions
4. Keep functions small and focused
5. Commit implementation: `feat: implement ${task.title} [${task.id}]`

### Step 2: Write Tests

1. Create test file (`.test.ts` suffix)
2. Test all exported functions
3. Test happy paths first, then edge cases
4. Mock external dependencies
5. Commit tests: `test: add unit tests for ${task.title} [${task.id}]`

### Step 3: Verify Coverage

1. Run tests: `pnpm test`
2. Check coverage: `pnpm test -- --coverage`
3. If coverage < 70%, add more tests
4. Optional: Use Wallaby MCP for real-time feedback
5. Commit coverage improvements if needed

### Step 4: Refactor and Document

1. Refactor for clarity and maintainability
2. Ensure JSDoc is complete and accurate
3. Run `pnpm lint:fix` and `pnpm format`
4. Generate TypeDoc: `pnpm run docs`
5. Commit refactoring: `refactor: improve ${task.title} [${task.id}]`

### Step 5: Final Validation

1. Run all validation commands (see Post-Flight Checklist)
2. Review changes: `git diff`
3. Ensure all acceptance criteria are met
4. Create final commit if needed

---

## Post-Flight Validation

**REQUIRED checks before marking task complete:**

- [ ] All tests pass: `pnpm test`
- [ ] Test coverage ≥ 70%: `pnpm test -- --coverage`
- [ ] ESLint clean: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] JSDoc complete for exported functions
- [ ] TypeDoc generates: `pnpm run docs` (no errors)
- [ ] Commit messages follow format: `type(scope): description [${task.id}]`
- [ ] All acceptance criteria verified
- [ ] No debug code (console.log, commented code)

---

## Success Criteria

Task ${task.id} is **COMPLETE** when:

1. ✅ All acceptance criteria are met and verified
2. ✅ All tests pass with minimum 70% coverage
3. ✅ All exported functions have JSDoc
4. ✅ ESLint, Prettier, and build are clean
5. ✅ Commits follow format with [${task.id}] tag
6. ✅ No failing tests, no debug code

---

## Unit Testing Best Practices

### Test Structure

```typescript
describe("ModuleName", () => {
  describe("functionName", () => {
    it("should handle the happy path correctly", () => {
      // Arrange
      const input = "test"

      // Act
      const result = functionName(input)

      // Assert
      expect(result).toBe("expected")
    })

    it("should handle empty input", () => {
      const result = functionName("")
      expect(result).toBe("default")
    })

    it("should throw error for invalid input", () => {
      expect(() => functionName(null as any)).toThrow()
    })
  })
})
```

### Mocking Dependencies

```typescript
import { vi } from "vitest"
import { readFileSync } from "fs"

vi.mock("fs", () => ({
  readFileSync: vi.fn(),
}))

describe("fileReader", () => {
  it("should read file content", () => {
    // Mock file system
    vi.mocked(readFileSync).mockReturnValue("mock content")

    const result = readFileFunction("file.txt")

    expect(result).toBe("mock content")
    expect(readFileSync).toHaveBeenCalledWith("file.txt", "utf-8")
  })
})
```

### Testing Async Code

```typescript
describe("asyncFunction", () => {
  it("should resolve with data", async () => {
    const result = await asyncFunction()
    expect(result).toEqual({ status: "success" })
  })

  it("should reject on error", async () => {
    await expect(asyncFunction("invalid")).rejects.toThrow("Error message")
  })
})
```

---

**Remember:** Unit tests verify individual functions in isolation. Focus on testing behavior, not implementation details.
