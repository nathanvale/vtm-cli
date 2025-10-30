# Task Instructions: ${task.id} - ${task.title}

## Objective

${task.description}

## Acceptance Criteria

${acceptanceCriteriaList}

---

## Test Strategy: Test-Driven Development (TDD)

**MANDATORY:** All TDD tasks MUST use Wallaby MCP for real-time test feedback and coverage analysis.

### Red-Green-Refactor Cycle with Wallaby MCP

#### 🔴 RED Phase: Write Failing Test

1. **Write the test first** - Define expected behavior before implementation
2. **Run Wallaby MCP tools to verify test failure:**
   ```typescript
   // Use: mcp__wallaby__wallaby_failingTests
   // Purpose: Get all failing tests with errors and stack traces
   // Verify: Your new test appears in the failing tests list
   // Expected: Test fails with clear error message
   ```
3. **Inspect test execution details:**
   ```typescript
   // Use: mcp__wallaby__wallaby_failingTestsForFile
   // Parameters: { file: "path/to/test-file.test.ts" }
   // Purpose: Get failing tests for specific test file
   // Verify: Test failure is for the right reason (not implemented yet)
   ```
4. **Debug test if needed:**
   ```typescript
   // Use: mcp__wallaby__wallaby_runtimeValues
   // Parameters: { file, line, lineContent, expression }
   // Purpose: Inspect runtime values at specific locations
   // Use Case: Understand why test is failing unexpectedly
   ```

#### 🟢 GREEN Phase: Make Test Pass

1. **Write minimum code** - Implement just enough to make the test pass
2. **Verify all tests pass with Wallaby MCP:**
   ```typescript
   // Use: mcp__wallaby__wallaby_allTests
   // Purpose: Get all tests with their status
   // Verify: All tests show status='passed'
   // Confirm: No failing or skipped tests
   ```
3. **Check test coverage:**
   ```typescript
   // Use: mcp__wallaby__wallaby_coveredLinesForFile
   // Parameters: { file: "path/to/implementation.ts" }
   // Purpose: Get line numbers covered by tests and coverage percentage
   // Target: Minimum 80% coverage for TDD tasks
   ```
4. **Verify specific test coverage:**
   ```typescript
   // Use: mcp__wallaby__wallaby_coveredLinesForTest
   // Parameters: { testId: "test-id-from-previous-call" }
   // Purpose: See exactly which lines are covered by specific test
   // Use Case: Ensure test is actually testing the implementation
   ```

#### 🔵 REFACTOR Phase: Improve Code Quality

1. **Refactor implementation** - Improve code structure while keeping tests green
2. **Monitor tests during refactoring:**
   ```typescript
   // Use: mcp__wallaby__wallaby_allTests (continuously)
   // Purpose: Ensure tests stay green during refactoring
   // Verify: No tests break during code improvements
   ```
3. **Update snapshots if needed:**
   ```typescript
   // Use: mcp__wallaby__wallaby_updateTestSnapshots
   // Parameters: { testId: "test-id" } or wallaby_updateFileSnapshots
   // Purpose: Update test snapshots after intentional changes
   // Warning: Only update if changes are intentional
   ```
4. **Final coverage verification:**
   ```typescript
   // Use: mcp__wallaby__wallaby_coveredLinesForFile
   // Purpose: Confirm coverage is maintained or improved after refactoring
   // Target: Coverage should not decrease
   ```

### Wallaby MCP Tools Reference

| Tool                                 | Use Case                                       | TDD Phase             |
| ------------------------------------ | ---------------------------------------------- | --------------------- |
| `wallaby_failingTests`               | Get all failing tests with errors/stack traces | 🔴 RED                |
| `wallaby_failingTestsForFile`        | Get failing tests for specific file            | 🔴 RED                |
| `wallaby_failingTestsForFileAndLine` | Get failing tests for specific line            | 🔴 RED                |
| `wallaby_allTests`                   | Verify all tests pass                          | 🟢 GREEN, 🔵 REFACTOR |
| `wallaby_allTestsForFile`            | Get all tests for specific file                | 🟢 GREEN              |
| `wallaby_testById`                   | Get detailed test data by ID                   | Any phase             |
| `wallaby_coveredLinesForFile`        | Check code coverage percentage                 | 🟢 GREEN, 🔵 REFACTOR |
| `wallaby_coveredLinesForTest`        | See lines covered by specific test             | 🟢 GREEN              |
| `wallaby_runtimeValues`              | Debug runtime values at locations              | 🔴 RED (debugging)    |
| `wallaby_runtimeValuesByTest`        | Get runtime values for specific test           | 🔴 RED (debugging)    |
| `wallaby_updateTestSnapshots`        | Update test snapshots                          | 🔵 REFACTOR           |
| `wallaby_updateFileSnapshots`        | Update all snapshots in file                   | 🔵 REFACTOR           |
| `wallaby_updateProjectSnapshots`     | Update all project snapshots                   | 🔵 REFACTOR           |

---

## Coding Standards

### Documentation (JSDoc/TypeDoc)

**MANDATORY for all TDD tasks:**

- ✅ Write comprehensive JSDoc for **ALL** functions, classes, interfaces, and types
- ✅ Include `@param` for all parameters with type and description
- ✅ Include `@returns` with type and description
- ✅ Include `@throws` for all error conditions
- ✅ Include `@example` for public APIs and complex functions
- ✅ Include `@internal` for private/internal functions
- ✅ Include `@remarks` for additional context or caveats
- ✅ Verify JSDoc with: `pnpm run docs` (generates TypeDoc)

**Example:**

````typescript
/**
 * Calculates the Fibonacci number at the specified position.
 *
 * Uses dynamic programming approach for O(n) time complexity.
 *
 * @param n - The position in the Fibonacci sequence (0-indexed)
 * @returns The Fibonacci number at position n
 * @throws {RangeError} If n is negative
 *
 * @example
 * ```typescript
 * const result = fibonacci(10);
 * console.log(result); // 55
 * ```
 *
 * @remarks
 * This implementation uses memoization for performance.
 * For very large n (> 1000), consider using BigInt.
 */
export function fibonacci(n: number): number {
  if (n < 0) {
    throw new RangeError("Position cannot be negative")
  }
  // Implementation...
}
````

### Type Safety

- ✅ TypeScript strict mode enabled
- ✅ No `any` types (use `unknown` with type guards if necessary)
- ✅ Explicit return types on all exported functions
- ✅ Use `const` assertions for literal types where appropriate
- ✅ Prefer type inference for simple cases, explicit types for complex ones

### Test Coverage

**MANDATORY for TDD tasks:**

- ✅ Minimum **80% code coverage**
- ✅ Test all edge cases (empty inputs, boundaries, null/undefined)
- ✅ Test all error conditions (throws clauses)
- ✅ Verify coverage with: `pnpm test -- --coverage`
- ✅ Use Wallaby MCP `coveredLinesForFile` to verify real-time coverage

### Code Quality

- ✅ ESLint passes: `pnpm lint`
- ✅ Auto-fix where possible: `pnpm lint:fix`
- ✅ Prettier formatted: `pnpm format`
- ✅ Build succeeds: `pnpm build`
- ✅ No console.log statements (use proper logging)
- ✅ No commented-out code (remove or use version control)

### TDD-Specific Requirements

- ✅ Tests written BEFORE implementation (Red phase first)
- ✅ Tests use descriptive names: `it('should calculate fibonacci for n=10')`
- ✅ One assertion per test (or closely related assertions)
- ✅ Use Wallaby MCP tools for every TDD cycle
- ✅ Verify tests fail for the right reason before implementing
- ✅ Keep tests fast (< 100ms per test ideally)

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
- [ ] Wallaby MCP server connected and running
- [ ] Understood acceptance criteria completely
- [ ] Reviewed source documents (ADR/Spec)
- [ ] Identified test cases from acceptance criteria

---

## Implementation Workflow (TDD)

### Step 1: Write Failing Test (RED)

1. Create test file if needed (`.test.ts` suffix)
2. Write test describing expected behavior
3. Run `wallaby_failingTests` - verify test fails
4. Check failure message is correct (not syntax error)
5. Commit failing test: `test: add failing test for ${task.title} [${task.id}]`

### Step 2: Implement Code (GREEN)

1. Write minimum code to pass the test
2. Run `wallaby_allTests` - verify test passes
3. Run `wallaby_coveredLinesForFile` - check coverage
4. If coverage < 80%, add more tests (back to RED)
5. Commit passing implementation: `feat: implement ${task.title} [${task.id}]`

### Step 3: Refactor (BLUE)

1. Improve code structure, naming, documentation
2. Add comprehensive JSDoc to all functions
3. Run `wallaby_allTests` - ensure tests still pass
4. Run `pnpm lint:fix` - auto-fix linting issues
5. Run `pnpm format` - format with Prettier
6. Run `wallaby_coveredLinesForFile` - confirm coverage maintained
7. Commit refactoring: `refactor: improve ${task.title} [${task.id}]`

### Step 4: Documentation

1. Add JSDoc to all public functions (if not done in refactor)
2. Add JSDoc to all private/internal functions
3. Add examples to complex functions
4. Generate TypeDoc: `pnpm run docs`
5. Review generated docs for clarity
6. Commit docs: `docs: add comprehensive JSDoc for ${task.title} [${task.id}]`

### Step 5: Final Validation

1. Run all validation commands (see Post-Flight Checklist)
2. Review changes: `git diff`
3. Ensure all acceptance criteria are met
4. Run Wallaby MCP final checks
5. Create final commit if needed

---

## Post-Flight Validation

**MANDATORY checks before marking task complete:**

- [ ] All tests pass: `pnpm test`
- [ ] Test coverage ≥ 80%: `pnpm test -- --coverage`
- [ ] Wallaby MCP confirms: `wallaby_allTests` shows all passing
- [ ] Coverage verified: `wallaby_coveredLinesForFile` shows ≥80%
- [ ] ESLint clean: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] JSDoc complete: All functions have comprehensive documentation
- [ ] TypeDoc generates: `pnpm run docs` (no errors)
- [ ] Commit messages follow format: `type(scope): description [${task.id}]`
- [ ] All acceptance criteria verified and checked off
- [ ] No debug code (console.log, commented code)
- [ ] Git status clean (all changes committed)

---

## Success Criteria

Task ${task.id} is **COMPLETE** when:

1. ✅ All acceptance criteria are met and verified
2. ✅ All tests pass with minimum 80% coverage
3. ✅ All code has comprehensive JSDoc (verified with TypeDoc)
4. ✅ ESLint, Prettier, and build are clean
5. ✅ Wallaby MCP confirms all tests passing and coverage met
6. ✅ Commits follow format with [${task.id}] tag
7. ✅ No failing tests, no skipped tests, no debug code
8. ✅ Code follows TDD Red-Green-Refactor cycle with Wallaby MCP

---

## Common Wallaby MCP Patterns

### Pattern 1: Basic TDD Cycle

```typescript
// RED: Write failing test
test("should do something", () => {
  /* ... */
})

// Verify failure
await wallaby_failingTests() // Should show new test

// GREEN: Implement
function doSomething() {
  /* ... */
}

// Verify pass
await wallaby_allTests() // Should show all passing

// Check coverage
await wallaby_coveredLinesForFile({ file: "src/lib/module.ts" })
```

### Pattern 2: Debugging Failing Test

```typescript
// Test fails unexpectedly
await wallaby_failingTestsForFile({ file: "src/lib/__tests__/module.test.ts" })

// Inspect runtime values at specific line
await wallaby_runtimeValues({
  file: "src/lib/module.ts",
  line: 42,
  lineContent: "const result = calculate(input);",
  expression: "input",
})
```

### Pattern 3: Coverage Verification

```typescript
// Check overall coverage
const coverage = await wallaby_coveredLinesForFile({
  file: "src/lib/module.ts",
})
// coverage.coveragePercentage should be >= 80

// Check which lines are covered
coverage.coveredLines.forEach((line) => {
  console.log(`Line ${line} is covered`)
})
```

### Pattern 4: Snapshot Updates After Refactoring

```typescript
// After intentional changes to output format
await wallaby_updateFileSnapshots({
  file: "src/lib/__tests__/module.test.ts",
})

// Or update specific test
await wallaby_updateTestSnapshots({
  testId: "test-id-from-wallaby",
})
```

---

**Remember:** TDD with Wallaby MCP is MANDATORY for this task. Use the tools at every phase to ensure quality and coverage.
