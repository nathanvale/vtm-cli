# Task Instructions: ${task.id} - ${task.title}

## Objective

${task.description}

## Acceptance Criteria

${acceptanceCriteriaList}

---

## Test Strategy: Integration Testing

Integration tests verify that multiple components work together correctly. Focus on system behavior and critical user journeys rather than individual function coverage.

### Integration Test Workflow

#### 1. Implement Components

- Build the feature end-to-end
- Integrate multiple modules/services
- Follow coding standards for all components
- Ensure components communicate correctly

#### 2. Write Integration Tests

- Test complete user workflows
- Test data flow between components
- Test external integrations (file system, APIs, databases)
- Use real implementations where possible (minimal mocking)
- Test critical paths and error scenarios

#### 3. Verify System Behavior

- Run tests: `pnpm test`
- Check coverage: `pnpm test -- --coverage` (target ≥60%)
- Verify end-to-end functionality works
- Test in realistic scenarios

#### 4. Document Integration Points

- Document component interactions
- Document external dependencies
- Document configuration requirements
- Add examples of typical usage

---

## Coding Standards

### Documentation (JSDoc/TypeDoc)

**REQUIRED for Integration tasks:**

- ✅ Write JSDoc for **public APIs** and integration points
- ✅ Document component interactions
- ✅ Include `@param`, `@returns`, `@throws` for public functions
- ✅ Add `@example` showing typical integration usage
- ✅ Document configuration options and requirements

**Focus areas:**

- Entry points and public APIs
- Integration interfaces
- Configuration options
- Error handling patterns

**Example:**

````typescript
/**
 * Initializes the VTM CLI with Plan domain integration.
 *
 * Sets up command handlers for ADR generation, spec creation,
 * and VTM task ingestion. Requires .claude/ directory structure.
 *
 * @param options - Configuration options
 * @param options.vtmPath - Path to vtm.json file
 * @param options.claudePath - Path to .claude/ directory
 * @returns Configured CLI program
 * @throws {Error} If .claude/ directory does not exist
 *
 * @example
 * ```typescript
 * const program = initializeCLI({
 *   vtmPath: './vtm.json',
 *   claudePath: './.claude'
 * });
 *
 * await program.parseAsync(process.argv);
 * ```
 */
export function initializeCLI(options: CLIOptions): Command {
  // Implementation...
}
````

### Type Safety

- ✅ TypeScript strict mode enabled
- ✅ No `any` types (use `unknown` with type guards)
- ✅ Explicit types on integration boundaries
- ✅ Type interfaces between components

### Test Coverage

**Target: Minimum 60% coverage**

- ✅ Test complete user workflows
- ✅ Test critical paths (authentication, data persistence, etc.)
- ✅ Test error handling and recovery
- ✅ Test integration with external systems
- ✅ Use real implementations where possible (avoid excessive mocking)

**What to test:**

- End-to-end user scenarios
- Data flow between components
- File system operations
- API calls and responses
- Error propagation

**What NOT to test:**

- Individual function logic (covered by unit tests)
- Internal implementation details
- Third-party library internals

### Code Quality

- ✅ ESLint passes: `pnpm lint`
- ✅ Prettier formatted: `pnpm format`
- ✅ Build succeeds: `pnpm build`
- ✅ No console.log statements (use proper logging)
- ✅ Clean up test fixtures and temporary files

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
- [ ] Reviewed component architecture
- [ ] Identified integration points
- [ ] Reviewed source documents (ADR/Spec)

---

## Implementation Workflow (Integration)

### Step 1: Implement Components

1. Build all components needed for the feature
2. Ensure components communicate correctly
3. Add JSDoc to public APIs and integration points
4. Test components individually (unit tests if needed)
5. Commit implementation: `feat: implement ${task.title} [${task.id}]`

### Step 2: Write Integration Tests

1. Create integration test file (`.integration.test.ts` or `.test.ts`)
2. Set up test fixtures and test data
3. Write end-to-end workflow tests
4. Test critical paths and error scenarios
5. Commit tests: `test: add integration tests for ${task.title} [${task.id}]`

### Step 3: Verify System Behavior

1. Run all tests: `pnpm test`
2. Check coverage: `pnpm test -- --coverage`
3. Manually test the feature end-to-end
4. Verify all acceptance criteria are met
5. Document any setup/configuration requirements

### Step 4: Refactor and Document

1. Refactor for clarity and maintainability
2. Ensure JSDoc is complete for public APIs
3. Document integration patterns and examples
4. Run `pnpm lint:fix` and `pnpm format`
5. Commit refactoring: `refactor: improve ${task.title} [${task.id}]`

### Step 5: Final Validation

1. Run all validation commands (see Post-Flight Checklist)
2. Test feature manually end-to-end
3. Review changes: `git diff`
4. Ensure all acceptance criteria are met
5. Create final commit if needed

---

## Post-Flight Validation

**REQUIRED checks before marking task complete:**

- [ ] All tests pass: `pnpm test`
- [ ] Test coverage ≥ 60%: `pnpm test -- --coverage`
- [ ] ESLint clean: `pnpm lint`
- [ ] Build succeeds: `pnpm build`
- [ ] JSDoc complete for public APIs
- [ ] Feature works end-to-end manually
- [ ] Commit messages follow format: `type(scope): description [${task.id}]`
- [ ] All acceptance criteria verified
- [ ] No debug code or test fixtures left in code
- [ ] Temporary files cleaned up

---

## Success Criteria

Task ${task.id} is **COMPLETE** when:

1. ✅ All acceptance criteria are met and verified
2. ✅ Integration tests pass with minimum 60% coverage
3. ✅ Public APIs have JSDoc documentation
4. ✅ Feature works end-to-end manually
5. ✅ ESLint, Prettier, and build are clean
6. ✅ Commits follow format with [${task.id}] tag
7. ✅ No failing tests, no debug code, no orphaned test fixtures

---

## Integration Testing Patterns

### Pattern 1: File System Integration

```typescript
import { mkdtempSync, rmSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"

describe("VTM file operations", () => {
  let testDir: string

  beforeEach(() => {
    // Create temporary test directory
    testDir = mkdtempSync(join(tmpdir(), "vtm-test-"))
  })

  afterEach(() => {
    // Clean up
    rmSync(testDir, { recursive: true, force: true })
  })

  it("should create and read VTM file", () => {
    const vtmPath = join(testDir, "vtm.json")

    // Write VTM file
    const writer = new VTMWriter(vtmPath)
    writer.appendTasks([mockTask])

    // Read VTM file
    const reader = new VTMReader(vtmPath)
    const tasks = reader.load().tasks

    expect(tasks).toHaveLength(1)
    expect(tasks[0].id).toBe("TASK-001")
  })
})
```

### Pattern 2: CLI Integration

```typescript
import { spawn } from "child_process"

describe("VTM CLI", () => {
  it("should execute next command and show ready tasks", async () => {
    const result = await execCLI(["next"])

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toContain("Ready Tasks")
  })

  function execCLI(args: string[]): Promise<CLIResult> {
    return new Promise((resolve) => {
      const child = spawn("node", ["dist/index.js", ...args])
      let stdout = ""
      let stderr = ""

      child.stdout?.on("data", (data) => {
        stdout += data
      })
      child.stderr?.on("data", (data) => {
        stderr += data
      })

      child.on("close", (exitCode) => {
        resolve({ exitCode: exitCode ?? 1, stdout, stderr })
      })
    })
  }
})
```

### Pattern 3: Multi-Component Integration

```typescript
describe("Plan-to-VTM workflow", () => {
  it("should convert ADR+Spec to VTM tasks", async () => {
    // Step 1: Create ADR and Spec files
    const adrPath = join(testDir, "ADR-001.md")
    const specPath = join(testDir, "spec-001.md")
    await fs.promises.writeFile(adrPath, mockADR)
    await fs.promises.writeFile(specPath, mockSpec)

    // Step 2: Validate pairing
    const validator = new ADRSpecValidator()
    const validation = await validator.validate(adrPath, specPath)
    expect(validation.isValid).toBe(true)

    // Step 3: Convert to VTM tasks
    const converter = new PlanToVTMConverter()
    const tasks = await converter.convert(adrPath, specPath)

    // Step 4: Ingest tasks
    const helper = new TaskIngestHelper()
    await helper.ingestTasks(tasks, vtmPath, { commit: true })

    // Step 5: Verify in VTM
    const reader = new VTMReader(vtmPath)
    const vtm = reader.load()
    expect(vtm.tasks).toHaveLength(3)
  })
})
```

### Pattern 4: Error Handling Integration

```typescript
describe("Error handling across components", () => {
  it("should propagate errors correctly from reader to CLI", async () => {
    const invalidVTMPath = join(testDir, "invalid.json")
    await fs.promises.writeFile(invalidVTMPath, "invalid json")

    const result = await execCLI(["next", "--vtm", invalidVTMPath])

    expect(result.exitCode).toBe(1)
    expect(result.stderr).toContain("Invalid JSON")
  })
})
```

---

## Integration Test Tips

### Use Real Dependencies

- Prefer real file system over mocks
- Use temporary directories for test isolation
- Clean up after tests (use afterEach)
- Test actual CLI commands (not just functions)

### Test User Journeys

- Simulate real user workflows
- Test happy path and error scenarios
- Test with realistic data
- Verify user-visible behavior

### Keep Tests Fast

- Use temporary directories (not fixtures)
- Minimize I/O operations
- Run only necessary setup
- Target < 5 seconds for integration test suite

### Document Setup Requirements

- Document environment variables needed
- Document file structure requirements
- Document external dependencies (if any)
- Provide clear test data examples

---

**Remember:** Integration tests verify that components work together correctly. Focus on critical user journeys and system behavior.
