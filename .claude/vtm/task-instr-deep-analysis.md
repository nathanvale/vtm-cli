# Task Instructions: TASK-AE1 - Implement Deep Component Analysis

## Objective

Enhance DecisionEngine with deep file-based analysis to detect code complexity hotspots, dependencies, and code smell patterns. This enables accurate identification of refactoring opportunities beyond simple metrics.

## Acceptance Criteria

1. ✅ Implement `analyzeComponent()` method to scan actual TypeScript files and extract metrics:
   - Line count, cyclomatic complexity, argument count per function
   - Top-level exports and their types
   - Internal dependencies (imports from other modules)
   - Document/JSDoc coverage percentage

2. ✅ Create `ComponentMetrics` type with comprehensive data:
   - `name`, `filePath`, `lines`, `complexity`, `jsdocCoverage`
   - `functions` array with each function's metrics
   - `dependencies` array with import paths
   - `codeSmells` array with detected patterns

3. ✅ Implement pattern detection for code smells:
   - Long functions (> 50 lines)
   - High complexity functions (cyclomatic complexity > 5)
   - Missing JSDoc on public functions
   - Tight coupling (> 3 external dependencies)
   - Deep nesting (> 3 levels)

4. ✅ Add `scanComponentDir()` helper to analyze all `.ts` files in a directory
   - Recursively scan TypeScript files
   - Skip test files and node_modules
   - Return array of ComponentMetrics

5. ✅ Achieve 80%+ test coverage with Wallaby MCP
   - Test complex file parsing
   - Test code smell detection
   - Test edge cases (empty files, syntax errors)

---

## Test Strategy: Test-Driven Development (TDD)

**MANDATORY:** Use Wallaby MCP for real-time test feedback and coverage analysis.

### Red-Green-Refactor Cycle with Wallaby MCP

#### 🔴 RED Phase: Write Failing Test

1. Create `src/lib/__tests__/component-analyzer.test.ts`
2. Write tests for:
   - `analyzeComponent(filepath)` returns metrics
   - `detectCodeSmells(metrics)` identifies patterns
   - `scanComponentDir(dirpath)` finds all components
3. Run `wallaby_failingTests` to verify all tests fail
4. Verify failures are for unimplemented code (not syntax errors)

#### 🟢 GREEN Phase: Make Test Pass

1. Implement stub methods that make tests pass minimally
2. Run `wallaby_allTests` to verify all pass
3. Check `wallaby_coveredLinesForFile` for coverage
4. If coverage < 80%, add more tests (iterate RED phase)

#### 🔵 REFACTOR Phase: Improve Code Quality

1. Refactor implementation with proper error handling
2. Add comprehensive JSDoc to all functions
3. Run `wallaby_allTests` to ensure tests stay green
4. Run `pnpm lint:fix && pnpm format`
5. Verify coverage maintained with `wallaby_coveredLinesForFile`

---

## Coding Standards

### Documentation (JSDoc/TypeDoc)

**MANDATORY for all methods:**

````typescript
/**
 * Analyze a TypeScript component file and extract code metrics.
 *
 * Scans the specified file to calculate complexity, dependencies,
 * and identify potential code smells.
 *
 * @param filePath - Absolute path to TypeScript file
 * @returns ComponentMetrics with detailed analysis
 * @throws {Error} If file doesn't exist or parsing fails
 *
 * @example
 * ```typescript
 * const metrics = analyzeComponent('src/lib/reader.ts');
 * console.log(metrics.complexity); // 8.5
 * ```
 */
````

### Type Safety

- ✅ Define `ComponentMetrics`, `FunctionMetric`, `CodeSmell` types
- ✅ No `any` types - use proper TypeScript interfaces
- ✅ Explicit return types on all functions
- ✅ Proper error handling with typed exceptions

### Test Coverage

- ✅ Minimum **80% code coverage**
- ✅ Test all code smell detection patterns
- ✅ Test edge cases: empty files, parse errors, missing JSDoc
- ✅ Use Wallaby MCP to verify coverage continuously

### Code Quality

- ✅ ESLint passes: `pnpm lint`
- ✅ Build succeeds: `pnpm build`
- ✅ Format with Prettier: `pnpm format`

---

## File Operations

**Create:**

- `src/lib/component-analyzer.ts` - Main implementation

**Modify:**

- `src/lib/decision-engine.ts` - Use new ComponentAnalyzer in DecisionEngine
- `src/lib/__tests__/component-analyzer.test.ts` - New test file

**Types to add:**

```typescript
type ComponentMetrics = {
  name: string
  filePath: string
  lines: number
  complexity: number
  jsdocCoverage: number // percentage 0-100
  functions: FunctionMetric[]
  dependencies: string[]
  codeSmells: CodeSmell[]
}

type FunctionMetric = {
  name: string
  lines: number
  complexity: number
  args: number
  hasJSDoc: boolean
  exports: boolean
}

type CodeSmell = {
  type:
    | "long-function"
    | "high-complexity"
    | "missing-jsdoc"
    | "tight-coupling"
    | "deep-nesting"
  location: string // line number or function name
  severity: "low" | "medium" | "high"
  suggestion: string
}
```

---

## Implementation Workflow (TDD)

### Step 1: Write Failing Tests

```bash
# Create test file
touch src/lib/__tests__/component-analyzer.test.ts

# Write tests for:
# - analyzeComponent(filepath) basic functionality
# - Code smell detection for each pattern
# - scanComponentDir() directory traversal
# - Error handling for missing files
```

### Step 2: Implement Code

```bash
# Create component-analyzer.ts with stub implementations
# Run tests to verify they pass (with minimal implementation)
pnpm test -- src/lib/__tests__/component-analyzer.test.ts

# Check coverage
# Use wallaby_coveredLinesForFile for detailed coverage
```

### Step 3: Refactor & Enhance

```bash
# Add proper error handling
# Add comprehensive JSDoc
# Run validation
pnpm lint:fix
pnpm format
pnpm build
```

---

## Pre-Flight Checklist

- [ ] Dependencies installed: `pnpm install`
- [ ] All existing tests passing: `pnpm test`
- [ ] Build succeeds: `pnpm build`
- [ ] Wallaby MCP server connected
- [ ] Understood TypeScript AST basics for parsing
- [ ] Reviewed existing test patterns in codebase

---

## Success Criteria

Task TASK-AE1 is **COMPLETE** when:

1. ✅ All 5 acceptance criteria met and verified
2. ✅ All tests pass with 80%+ coverage
3. ✅ All code has comprehensive JSDoc
4. ✅ ESLint, Prettier, and build are clean
5. ✅ Wallaby MCP confirms all tests passing
6. ✅ Commits follow format with [TASK-AE1] tag
7. ✅ DecisionEngine.analyzeComponent() now returns actual metrics, not stub data

---

## Expected Implementation Duration

**Effort:** ~2-3 hours

- Test writing: 45 minutes
- Implementation: 60 minutes
- Refactoring & docs: 45 minutes
- Validation: 30 minutes
