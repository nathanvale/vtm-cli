# DecisionEngine Enhancement Roadmap

## Quick Start

Three TDD-based tasks to enhance DecisionEngine architecture analysis:

### 1️⃣ TASK-AE1: Deep Component Analysis

**File:** `.claude/vtm/task-instr-deep-analysis.md`

Scan actual TypeScript files to extract code metrics, detect code smells, and analyze component dependencies.

```bash
# Start task
/vtm:work TASK-AE1

# Or read instructions
cat .claude/vtm/task-instr-deep-analysis.md
```

**Deliverables:**

- `ComponentAnalyzer` class with file parsing and metric extraction
- `CodeSmell` detection (long functions, high complexity, missing docs, etc.)
- 80%+ test coverage via Wallaby MCP
- **Time:** 2-3 hours

---

### 2️⃣ TASK-AE2: Issue Detection Rules

**File:** `.claude/vtm/task-instr-issue-detection.md`

Apply 8+ architectural pattern rules to detect domain problems with severity and effort estimates.

```bash
# Start task (after AE1 complete)
/vtm:work TASK-AE2

# Or read instructions
cat .claude/vtm/task-instr-issue-detection.md
```

**Deliverables:**

- `IssueDetector` class with 8+ detection rules
- Rule registry pattern for extensibility
- Issue relationship analysis (compound effects)
- Severity calculation based on impact
- 80%+ test coverage via Wallaby MCP
- **Time:** 3-4 hours

**Detection Rules:**

1. TooManyCommands (> 10)
2. LowCohesion (< 5.0)
3. TightCoupling (external deps)
4. UnbalancedDistribution (size variance)
5. MissingDocumentation (JSDoc < 70%)
6. TestCoverageGaps (< 60%)
7. DuplicateFunctionality
8. OutdatedDependencies

---

### 3️⃣ TASK-AE3: Refactoring & Migration

**File:** `.claude/vtm/task-instr-refactoring-options.md`

Generate multiple solution approaches for each issue with trade-offs, phased migration plans, and rollback procedures.

```bash
# Start task (after AE2 complete)
/vtm:work TASK-AE3

# Or read instructions
cat .claude/vtm/task-instr-refactoring-options.md
```

**Deliverables:**

- `RefactoringPlanner` with strategy generation
- 2-3+ solution options per issue type
- Cost-benefit analysis and recommendations
- Phased migration strategies with rollback
- Implementation checklists with quality gates
- Risk mitigation plans
- 80%+ test coverage via Wallaby MCP
- **Time:** 3-4 hours

**Strategy Examples:**

- TooManyCommands → Extract domain / Consolidate / Organize by concern
- LowCohesion → Redefine focus / Merge domains
- TightCoupling → Extract utilities / Add facade

---

## Architecture Overview

```
Current:
  Input → Pattern matching → Generic output

Enhanced:
  Input → ComponentAnalyzer → IssueDetector → RefactoringPlanner → Detailed plan
           (metrics)          (problems)      (solutions)
```

## Execution Guide

### Option A: Sequential (Recommended)

```
Day 1: TASK-AE1 (2-3h)
       ↓
Day 1-2: TASK-AE2 (3-4h)
       ↓
Day 2-3: TASK-AE3 (3-4h)
Total: ~2.5-3 days (8-11 hours)
```

### Option B: Parallel (2 developers)

```
Developer 1: TASK-AE1
Developer 2: TASK-AE1 review + start TASK-AE2 once complete
Both:        TASK-AE3 after TASK-AE2 complete
Total: ~1.5-2 days (with good coordination)
```

---

## TDD Workflow for Each Task

Each task follows the same TDD pattern with Wallaby MCP:

### 🔴 RED Phase (Write failing test)

```bash
# Create test file
touch src/lib/__tests__/[component].test.ts

# Write tests for expected behavior
# Run Wallaby to verify tests fail:
# Use: mcp__wallaby__wallaby_failingTests
# Verify new tests appear in failure list
```

### 🟢 GREEN Phase (Implement code)

```bash
# Create implementation file
touch src/lib/[component].ts

# Write minimum code to pass tests
# Run Wallaby to verify tests pass:
# Use: mcp__wallaby__wallaby_allTests
# Check coverage: mcp__wallaby__wallaby_coveredLinesForFile
```

### 🔵 REFACTOR Phase (Improve quality)

```bash
# Refactor for clarity and maintainability
# Add comprehensive JSDoc
# Run validation:
pnpm lint:fix
pnpm format
pnpm build
pnpm test

# Verify coverage maintained (≥80%)
```

---

## Key Wallaby MCP Tools

Used throughout the three tasks:

| Tool                          | Phase          | Purpose                |
| ----------------------------- | -------------- | ---------------------- |
| `wallaby_failingTests`        | RED            | Verify test failures   |
| `wallaby_allTests`            | GREEN/REFACTOR | Confirm all tests pass |
| `wallaby_coveredLinesForFile` | GREEN/REFACTOR | Track coverage         |
| `wallaby_runtimeValues`       | RED (debug)    | Inspect runtime values |
| `wallaby_updateTestSnapshots` | REFACTOR       | Update snapshots       |

---

## Integration Points

After each task, the DecisionEngine is enhanced:

```typescript
// TASK-AE1 complete: ComponentAnalyzer available
const metrics = componentAnalyzer.analyzeComponent(filePath)

// TASK-AE2 complete: IssueDetector available
const issues = issueDetector.detect(domainPath)

// TASK-AE3 complete: RefactoringPlanner available
const options = planner.generateOptions(issue)
const strategy = planner.createMigrationStrategy(selectedOption)
```

## Final Result

After completing all 3 tasks:

```bash
vtm analyze vtm --suggest-refactoring
```

Output includes:

- Current component metrics (lines, complexity, smells)
- Specific issues identified (with severity/effort)
- Multiple solution approaches (pros/cons/risk)
- Phased migration plan (steps with rollback)
- Implementation checklist (quality gates)
- Risk assessment and mitigation

---

## File Structure

```
.claude/vtm/
├── task-instr-deep-analysis.md        # TASK-AE1 instructions
├── task-instr-issue-detection.md      # TASK-AE2 instructions
├── task-instr-refactoring-options.md  # TASK-AE3 instructions
└── README-ENHANCEMENTS.md             # This file

src/lib/
├── component-analyzer.ts               # New (AE1)
├── issue-detector.ts                   # New (AE2)
├── detection-rules.ts                  # New (AE2)
├── refactoring-planner.ts              # New (AE3)
├── strategy-generators.ts              # New (AE3)
├── decision-engine.ts                  # Modified (use new classes)
├── types.ts                            # Modified (add new types)
├── index.ts                            # Modified (export new classes)
├── __tests__/
│   ├── component-analyzer.test.ts      # New (AE1)
│   ├── issue-detector.test.ts          # New (AE2)
│   └── refactoring-planner.test.ts     # New (AE3)
```

---

## Documentation References

- **Enhancement Plan:** `ENHANCEMENT_PLAN.md` (comprehensive overview)
- **TDD Template:** `.claude/vtm/instruction-templates/tdd.md` (mandatory format)
- **Coding Standards:** `.claude/vtm/coding-standards.md` (required standards)
- **Type Definitions:** `src/lib/types.ts` (existing types to extend)
- **Current Engine:** `src/lib/decision-engine.ts` (what to enhance)

---

## Quality Checklist

✅ Each task requires:

- [ ] 80%+ test coverage (verified via Wallaby MCP)
- [ ] All tests passing (wallaby_allTests)
- [ ] Comprehensive JSDoc on all public functions
- [ ] ESLint clean: `pnpm lint`
- [ ] Prettier formatted: `pnpm format`
- [ ] Build succeeds: `pnpm build`
- [ ] TypeDoc generates: `pnpm run docs`
- [ ] No `any` types (TypeScript strict mode)
- [ ] Commits tagged: `[TASK-AE1]`, `[TASK-AE2]`, `[TASK-AE3]`

---

## Common Patterns

### Test Writing Pattern

```typescript
describe("ComponentAnalyzer", () => {
  it("should extract complexity metric from function", () => {
    const metrics = analyzeComponent("path/to/file.ts")
    expect(metrics.complexity).toBeGreaterThan(0)
  })
})
```

### Documentation Pattern

````typescript
/**
 * Detects code smells in TypeScript component.
 *
 * Analyzes the component for patterns indicating code quality issues.
 *
 * @param metrics - Component metrics from analysis
 * @returns Array of detected code smells
 *
 * @example
 * ```typescript
 * const smells = detector.findSmells(metrics);
 * smells.forEach(s => console.log(s.type));
 * ```
 */
export function findCodeSmells(metrics: ComponentMetrics): CodeSmell[] {
  // Implementation
}
````

### Type Definition Pattern

```typescript
type CodeSmell = {
  type: "long-function" | "high-complexity" | "missing-jsdoc"
  location: string
  severity: "low" | "medium" | "high"
  suggestion: string
}
```

---

## Troubleshooting

### Tests not running?

```bash
pnpm install
pnpm build
pnpm test
```

### Wallaby MCP not available?

Ensure the Wallaby MCP server is connected via your Claude Code environment.

### Type errors?

Check that new types are exported from `src/lib/index.ts`

### Coverage below 80%?

- Run `wallaby_coveredLinesForFile` to identify gaps
- Add edge case tests
- Test error conditions

---

## Success Indicator

When all 3 tasks complete, you'll see this transformation:

**Before:**

```
$ vtm analyze vtm --suggest-refactoring
🔧 Refactoring Plan: vtm
Current state analyzed.
Recommendation: No change
```

**After:**

```
$ vtm analyze vtm --suggest-refactoring
🔍 Architecture Analysis: vtm domain

Current Structure:
  Commands: 11
  Skills: 2
  Complexity: 5/10

✅ Strengths:
  • Clear single responsibility
  • High cohesion - components work well together

[Detailed issues, recommended refactorings, migration strategies...]
```

---

## Next Steps

1. Read `ENHANCEMENT_PLAN.md` for comprehensive overview
2. Start with `task-instr-deep-analysis.md` (TASK-AE1)
3. Follow TDD pattern from `.claude/vtm/instruction-templates/tdd.md`
4. Use Wallaby MCP tools throughout development
5. After each task completes, integrate with DecisionEngine

---

**Created:** 2025-10-30
**Version:** 1.0
**Status:** Ready for implementation
