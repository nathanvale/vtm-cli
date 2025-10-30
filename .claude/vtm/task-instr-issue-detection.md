# Task Instructions: TASK-AE2 - Implement Issue Detection Rules

## Objective

Enhance DecisionEngine with intelligent issue detection rules that analyze domain structure and identify architectural problems. Generate actionable recommendations with clear severity levels and effort estimates.

## Acceptance Criteria

1. ✅ Implement `IssueDetector` class with pattern-based rule system:
   - Rule interface with `name`, `description`, `detect()` method
   - Registry of 8+ built-in rules covering common issues
   - Ability to add custom rules dynamically

2. ✅ Implement detection rules for:
   - **Too many commands** (> 10): Suggests domain split
   - **Missing cohesion** (< 5.0 score): Commands don't share theme
   - **Tight coupling**: Commands depend on too many external modules
   - **Unbalanced distribution**: Some commands much larger than others
   - **Incomplete documentation**: Missing JSDoc or file headers
   - **Test coverage gaps**: Components with < 60% coverage
   - **Duplicate functionality**: Similar commands with overlapping purpose
   - **Outdated dependencies**: Stale package versions in domain

3. ✅ Create `ArchitecturalIssue` type with:
   - `id`, `title`, `description`, `severity` (critical/high/medium/low)
   - `location` (which file/command), `evidence` (what was detected)
   - `impact` (what breaks if not fixed), `effort` (estimated hours)
   - `relatedIssues` array (issues that compound this one)

4. ✅ Implement `analyzeIssueRelationships()` to detect:
   - Issues that compound each other (e.g., tight coupling + too many commands)
   - Issues with shared root causes (e.g., multiple coverage gaps from same source)
   - Dependency chains (fixing issue A unblocks issue B)

5. ✅ Achieve 80%+ test coverage with Wallaby MCP
   - Test each detection rule independently
   - Test relationship detection between issues
   - Test severity calculation
   - Test edge cases (empty domains, all green)

---

## Test Strategy: Test-Driven Development (TDD)

**MANDATORY:** Use Wallaby MCP for real-time test feedback and coverage analysis.

### Red-Green-Refactor Cycle with Wallaby MCP

#### 🔴 RED Phase: Write Failing Test

1. Create `src/lib/__tests__/issue-detector.test.ts`
2. Write tests for:
   - Each detection rule (8+ test cases)
   - Issue relationship analysis
   - Severity calculation based on impacts
   - Edge cases (no issues found)
3. Run `wallaby_failingTests` to verify all fail
4. Verify failures show unimplemented IssueDetector

#### 🟢 GREEN Phase: Make Test Pass

1. Implement IssueDetector with minimal rule implementations
2. Run `wallaby_allTests` to verify tests pass
3. Check coverage with `wallaby_coveredLinesForFile`
4. Add tests until coverage reaches 80%+

#### 🔵 REFACTOR Phase: Improve Code Quality

1. Refactor rules into individual rule classes
2. Add proper error handling and validation
3. Add comprehensive JSDoc to all classes and methods
4. Run `wallaby_allTests` to ensure tests stay green
5. Format and lint: `pnpm lint:fix && pnpm format`
6. Verify coverage with `wallaby_coveredLinesForFile`

---

## Coding Standards

### Documentation (JSDoc/TypeDoc)

````typescript
/**
 * Detects architectural issues in a domain based on configured rules.
 *
 * Analyzes the domain structure and applies each detection rule to identify
 * problems with the architecture. Issues are analyzed for relationships
 * (compounds/dependencies) to provide holistic recommendations.
 *
 * @param domainPath - Path to the domain directory
 * @param options - Detection options (rules to skip, severity filter)
 * @returns Array of detected issues with relationships
 * @throws {Error} If domain doesn't exist
 *
 * @example
 * ```typescript
 * const detector = new IssueDetector();
 * const issues = detector.detect('path/to/vtm-domain');
 * console.log(issues.length); // 3 issues found
 * ```
 *
 * @remarks
 * Issues are sorted by severity (critical → low).
 * Related issues are linked to show compound effects.
 */
export class IssueDetector {
  detect(domainPath: string, options?: DetectionOptions): ArchitecturalIssue[]
}
````

### Type Safety

- ✅ Define all issue-related types with proper interfaces
- ✅ Use strict severity enum ('critical' | 'high' | 'medium' | 'low')
- ✅ No `any` types
- ✅ Explicit return types on all methods

### Test Coverage

- ✅ Minimum **80% code coverage**
- ✅ Test each detection rule with 2+ test cases per rule
- ✅ Test edge cases: no issues, all issues, overlapping issues
- ✅ Use Wallaby MCP to verify coverage

---

## File Operations

**Create:**

- `src/lib/issue-detector.ts` - Main IssueDetector class
- `src/lib/detection-rules.ts` - Built-in rule implementations
- `src/lib/__tests__/issue-detector.test.ts` - Tests

**Modify:**

- `src/lib/decision-engine.ts` - Use IssueDetector in `identifyIssues()`
- `src/lib/types.ts` - Add `ArchitecturalIssue`, `DetectionRule` types

**Types to add:**

```typescript
type ArchitecturalIssue = {
  id: string // e.g., "ISSUE-001"
  title: string
  description: string
  severity: "critical" | "high" | "medium" | "low"
  location: string // file or domain path
  evidence: string // what was detected
  impact: string[] // what breaks/degrades
  effort: string // e.g., "2 hours"
  relatedIssues: string[] // IDs of related issues
}

interface DetectionRule {
  readonly name: string
  readonly description: string
  detect(domainPath: string): ArchitecturalIssue[]
}

type DetectionOptions = {
  skipRules?: string[]
  minSeverity?: "low" | "medium" | "high" | "critical"
}
```

---

## Built-In Rules to Implement

1. **TooManyCommands**: > 10 commands → domain split suggested
2. **LowCohesion**: Commands don't share common theme
3. **TightCoupling**: Commands depend on external modules excessively
4. **UnbalancedDistribution**: Some commands much larger than others
5. **MissingDocumentation**: JSDoc coverage < 70%
6. **TestCoverageGaps**: Coverage < 60% on any component
7. **DuplicateFunctionality**: Similar command purposes detected
8. **OutdatedDependencies**: Package versions older than 6 months

---

## Implementation Workflow (TDD)

### Step 1: Write Failing Tests

```bash
# Create test file
touch src/lib/__tests__/issue-detector.test.ts

# Write test cases for:
# - IssueDetector instantiation
# - Each detection rule (8+ rules × 2-3 test cases each)
# - Relationship analysis
# - Edge cases (no issues, all passing)
```

### Step 2: Implement Rules

```bash
# Create detection-rules.ts with individual rule classes
# Create issue-detector.ts with rule registry and orchestration
# Implement minimal code to pass tests
pnpm test -- src/lib/__tests__/issue-detector.test.ts
```

### Step 3: Refactor & Enhance

```bash
# Add relationship analysis
# Add severity calculation based on impacts
# Add comprehensive error handling
# Add JSDoc to all classes and methods
pnpm lint:fix && pnpm format
pnpm build
```

---

## Pre-Flight Checklist

- [ ] Dependencies installed: `pnpm install`
- [ ] All existing tests passing: `pnpm test`
- [ ] Build succeeds: `pnpm build`
- [ ] Wallaby MCP connected
- [ ] Reviewed existing domain structure (vtm, plan)
- [ ] Understood DecisionEngine integration points

---

## Success Criteria

Task TASK-AE2 is **COMPLETE** when:

1. ✅ All 5 acceptance criteria met
2. ✅ All tests pass with 80%+ coverage
3. ✅ All 8+ detection rules implemented and tested
4. ✅ Relationship analysis working (compound issues detected)
5. ✅ IssueDetector integrated into DecisionEngine.analyzeDomain()
6. ✅ All code has comprehensive JSDoc
7. ✅ ESLint, Prettier, and build clean
8. ✅ Commits tagged with [TASK-AE2]

---

## Expected Implementation Duration

**Effort:** ~3-4 hours

- Test writing: 60 minutes
- Rule implementation: 90 minutes
- Relationship analysis: 45 minutes
- Refactoring & docs: 45 minutes
- Validation: 30 minutes
