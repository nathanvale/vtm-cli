# DecisionEngine Enhancement Plan

## Overview

This plan outlines comprehensive enhancements to the DecisionEngine to provide deeper architectural analysis and actionable refactoring recommendations. The work is broken into 3 TDD tasks that build upon each other.

**Goal:** Transform DecisionEngine from basic pattern matching to a sophisticated architecture analysis tool.

---

## Current State vs. Enhanced State

### Current Implementation

```
Input: Domain name or description
    ↓
Pattern matching (lightweight)
    ↓
Output: Generic recommendations (minimal detail)
    ↓
Result: "No change recommended" for most domains
```

**Problems:**

- No actual code analysis
- Surface-level issue detection
- No specific refactoring strategies
- No migration planning

### Enhanced Implementation

```
Input: Domain name or description
    ↓
ComponentAnalyzer (TASK-AE1)
    ├─ Scan actual TypeScript files
    ├─ Extract complexity metrics
    └─ Detect code smells
    ↓
IssueDetector (TASK-AE2)
    ├─ Apply 8+ detection rules
    ├─ Identify architectural problems
    └─ Analyze issue relationships
    ↓
RefactoringPlanner (TASK-AE3)
    ├─ Generate multiple solution approaches
    ├─ Create migration strategies
    └─ Build implementation checklists
    ↓
Output: Comprehensive refactoring plan with options, effort, and risk analysis
    ↓
Result: Actionable recommendations for improving architecture
```

**Benefits:**

- Deep code analysis with real metrics
- Specific, targeted issue detection
- Multiple solution approaches with trade-offs
- Step-by-step migration strategies
- Risk assessment and mitigation plans

---

## Task Breakdown

### TASK-AE1: Deep Component Analysis

**Purpose:** Analyze actual TypeScript files to extract code metrics

**Creates:**

- `src/lib/component-analyzer.ts` - Main analyzer
- `src/lib/__tests__/component-analyzer.test.ts` - Tests

**Metrics Extracted:**

- Lines of code, cyclomatic complexity, function argument counts
- JSDoc coverage percentage
- Internal dependencies and exports
- Code smell detection (long functions, high complexity, missing docs, etc.)

**Deliverables:**

- `ComponentMetrics` type with detailed analysis
- `CodeSmell` detection for 5+ patterns
- `scanComponentDir()` for directory traversal
- 80%+ test coverage via Wallaby MCP

**Effort:** ~2-3 hours
**Complexity:** Medium

**Wallaby MCP Usage:**

- `wallaby_failingTests` - Verify test failures before implementation
- `wallaby_allTests` - Confirm all tests pass
- `wallaby_coveredLinesForFile` - Track coverage during development
- `wallaby_runtimeValues` - Debug metric calculations if needed

---

### TASK-AE2: Issue Detection Rules

**Purpose:** Detect architectural problems in domains

**Creates:**

- `src/lib/issue-detector.ts` - Main detector
- `src/lib/detection-rules.ts` - Rule implementations
- `src/lib/__tests__/issue-detector.test.ts` - Tests

**Detection Rules (8+):**

1. **TooManyCommands** (> 10) → Suggests domain split
2. **LowCohesion** (< 5.0) → Commands don't share theme
3. **TightCoupling** → Too many external dependencies
4. **UnbalancedDistribution** → Size variance among commands
5. **MissingDocumentation** → JSDoc coverage < 70%
6. **TestCoverageGaps** → Coverage < 60%
7. **DuplicateFunctionality** → Similar commands
8. **OutdatedDependencies** → Stale packages

**Deliverables:**

- `IssueDetector` class with rule registry
- `ArchitecturalIssue` type with severity/effort
- Relationship analysis (compound issues)
- Severity calculation based on impacts

**Effort:** ~3-4 hours
**Complexity:** High

**Wallaby MCP Usage:**

- `wallaby_failingTests` - Verify each rule fails initially
- `wallaby_allTests` - Confirm all rules pass
- `wallaby_coveredLinesForFile` - Ensure 80%+ coverage
- `wallaby_failingTestsForFile` - Debug specific rules

---

### TASK-AE3: Refactoring Options & Migration

**Purpose:** Generate solution approaches and migration plans

**Creates:**

- `src/lib/refactoring-planner.ts` - Main planner
- `src/lib/strategy-generators.ts` - Strategy implementations
- `src/lib/__tests__/refactoring-planner.test.ts` - Tests

**Strategy Generators (4+):**

1. **TooManyCommands:**
   - Option A: Extract sub-domain (recommended, 4-6h, medium risk)
   - Option B: Consolidate (quick win, 1-2h, low risk)
   - Option C: Organize by concern (balanced, 2-3h, low risk)

2. **LowCohesion:**
   - Option A: Redefine focus (recommended, 1h, low risk)
   - Option B: Merge with related domain (2-3h, low risk)

3. **TightCoupling:**
   - Option A: Extract shared utilities (recommended, 3-4h, medium risk)
   - Option B: Add facade pattern (2-3h, low risk)

4. **TestCoverageGaps:**
   - Option A: Add unit tests (recommended, 4-6h, low risk)
   - Option B: Refactor for testability (3-4h, medium risk)

**Deliverables:**

- `RefactoringPlanner` class with strategy generation
- `RefactoringOption` type with pros/cons/effort
- `MigrationStrategy` with phased plans
- `ImplementationChecklist` with quality gates
- Risk mitigation strategies

**Effort:** ~3-4 hours
**Complexity:** High

**Wallaby MCP Usage:**

- `wallaby_failingTests` - Verify strategy generation fails initially
- `wallaby_allTests` - Confirm all strategies pass
- `wallaby_coveredLinesForFile` - Track coverage for each strategy type
- `wallaby_runtimeValues` - Debug cost/benefit calculations

---

## Integration Architecture

```
DecisionEngine
│
├─ Existing Methods
│  ├─ recommendArchitecture()     [Pattern-based, unchanged]
│  ├─ extractKeywords()
│  └─ matchPatterns()
│
└─ Enhanced Methods
   ├─ analyzeDomain()
   │  ├─ Uses: ComponentAnalyzer (new)
   │  ├─ Uses: IssueDetector (new)
   │  └─ Returns: DomainAnalysis with deep insights
   │
   └─ suggestRefactoring()
      ├─ Uses: ComponentAnalyzer (new)
      ├─ Uses: IssueDetector (new)
      ├─ Uses: RefactoringPlanner (new)
      └─ Returns: RefactoringPlan with multiple options
```

### Data Flow

```
Domain Analysis Flow:
  Domain Name
     ↓
  [ComponentAnalyzer] scans files
     ↓
  ComponentMetrics[] (complexity, smells, coverage)
     ↓
  [IssueDetector] applies rules
     ↓
  ArchitecturalIssue[] (with severity, effort)
     ↓
  DomainAnalysis object returned to user

Refactoring Planning Flow:
  ArchitecturalIssue
     ↓
  [RefactoringPlanner] generates options
     ↓
  RefactoringOption[] (pros/cons/effort)
     ↓
  Recommended option selected
     ↓
  [StrategyGenerators] create migration plan
     ↓
  MigrationStrategy (phased steps with rollback)
     ↓
  RefactoringPlan object returned to user
```

---

## Type System Enhancement

### New Types (TASK-AE1)

```typescript
type ComponentMetrics = {
  name: string
  filePath: string
  lines: number
  complexity: number
  jsdocCoverage: number
  functions: FunctionMetric[]
  dependencies: string[]
  codeSmells: CodeSmell[]
}

type CodeSmell = {
  type: string
  location: string
  severity: "low" | "medium" | "high"
  suggestion: string
}
```

### New Types (TASK-AE2)

```typescript
type ArchitecturalIssue = {
  id: string
  title: string
  description: string
  severity: "critical" | "high" | "medium" | "low"
  location: string
  evidence: string
  impact: string[]
  effort: string
  relatedIssues: string[]
}
```

### New Types (TASK-AE3)

```typescript
type RefactoringOption = {
  name: string
  description: string
  pros: string[]
  cons: string[]
  effort: string
  breaking: boolean
  riskLevel: "low" | "medium" | "high"
  recommendation: boolean
}

type MigrationStrategy = {
  name: string
  phases: MigrationPhase[]
  preFlightChecks: ChecklistItem[]
  rollbackPlan: string
  estimatedDuration: string
}
```

---

## Test Coverage Targets

Each task aims for **80%+ code coverage** via Wallaby MCP:

| Task      | Component          | Target Coverage | Test Count |
| --------- | ------------------ | --------------- | ---------- |
| AE1       | ComponentAnalyzer  | 80%+            | 25+        |
| AE2       | IssueDetector      | 80%+            | 30+        |
| AE3       | RefactoringPlanner | 80%+            | 25+        |
| **Total** | **New code**       | **80%+**        | **80+**    |

### Wallaby MCP Tools Used

Each task uses the full TDD cycle:

```
🔴 RED Phase:
  ├─ wallaby_failingTests       → Verify test failures
  └─ wallaby_failingTestsForFile → Debug specific failures

🟢 GREEN Phase:
  ├─ wallaby_allTests            → Confirm all pass
  └─ wallaby_coveredLinesForFile → Track coverage

🔵 REFACTOR Phase:
  ├─ wallaby_allTests            → Ensure tests stay green
  ├─ wallaby_coveredLinesForFile → Verify coverage maintained
  └─ wallaby_updateTestSnapshots → Update if needed
```

---

## Implementation Order

**Recommended sequence (dependencies):**

1. **TASK-AE1 First** - ComponentAnalyzer is foundation
   - Provides metrics that IssueDetector needs
   - Can be tested independently

2. **TASK-AE2 Second** - IssueDetector uses metrics
   - Depends on ComponentMetrics type
   - Uses analysis results from AE1

3. **TASK-AE3 Third** - RefactoringPlanner uses issues
   - Depends on ArchitecturalIssue type
   - Generates solutions for detected issues

**Parallel work possible:** If multiple developers, AE1 and AE2 can start simultaneously.

---

## Quality Standards (TDD)

All tasks follow the comprehensive TDD template:

✅ **Red-Green-Refactor with Wallaby MCP**

- Write failing tests first
- Verify failures with Wallaby MCP
- Implement minimum code to pass
- Refactor while keeping tests green

✅ **Documentation Standards (JSDoc)**

- All functions documented
- `@param`, `@returns`, `@throws` required
- `@example` for public APIs
- `@remarks` for complex logic
- Generate TypeDoc: `pnpm run docs`

✅ **Code Quality**

- ESLint: `pnpm lint`
- Prettier: `pnpm format`
- Build: `pnpm build`
- No `any` types, strict mode enforced

✅ **Test Coverage**

- Minimum 80% coverage per task
- Continuous verification via Wallaby MCP
- Test all edge cases and error conditions

---

## Success Metrics

After completing all 3 tasks:

### Code Quality

- ✅ 80%+ test coverage across new code
- ✅ All tests pass via Wallaby MCP
- ✅ ESLint and Prettier clean
- ✅ TypeScript strict mode passed
- ✅ Full JSDoc coverage on public APIs

### Functionality

- ✅ ComponentAnalyzer extracts real metrics from files
- ✅ IssueDetector identifies 8+ issue patterns
- ✅ RefactoringPlanner generates 2-3+ options per issue
- ✅ Migration strategies include rollback procedures
- ✅ All recommendations have effort/risk estimates

### Integration

- ✅ DecisionEngine.analyzeDomain() now returns deep analysis
- ✅ DecisionEngine.suggestRefactoring() returns comprehensive plans
- ✅ `vtm analyze <domain> --suggest-refactoring` provides detailed output
- ✅ All types properly integrated and exported

### Documentation

- ✅ Comprehensive JSDoc on all classes/methods
- ✅ TypeDoc generates without errors
- ✅ Examples provided for complex functionality
- ✅ Architecture documented in code comments

---

## Time Estimates

| Task      | Effort    | Complexity | Days      |
| --------- | --------- | ---------- | --------- |
| AE1       | 2-3h      | Medium     | 0.5       |
| AE2       | 3-4h      | High       | 1         |
| AE3       | 3-4h      | High       | 1         |
| **Total** | **8-11h** | **High**   | **2.5-3** |

**With 2 developers (parallel AE1+AE2):** 1.5-2 days

---

## Getting Started

### For TASK-AE1

```bash
# Read the task instructions
cat .claude/vtm/task-instr-deep-analysis.md

# Or use via VTM:
/vtm:work TASK-AE1

# Pre-flight checks
pnpm test           # Ensure existing tests pass
pnpm build          # Ensure build succeeds
```

### For TASK-AE2

```bash
# After TASK-AE1 is complete
cat .claude/vtm/task-instr-issue-detection.md

# Or use via VTM:
/vtm:work TASK-AE2
```

### For TASK-AE3

```bash
# After TASK-AE2 is complete
cat .claude/vtm/task-instr-refactoring-options.md

# Or use via VTM:
/vtm:work TASK-AE3
```

---

## Files Modified Summary

### New Files Created

- `src/lib/component-analyzer.ts` (AE1)
- `src/lib/issue-detector.ts` (AE2)
- `src/lib/detection-rules.ts` (AE2)
- `src/lib/refactoring-planner.ts` (AE3)
- `src/lib/strategy-generators.ts` (AE3)
- `src/lib/__tests__/component-analyzer.test.ts` (AE1)
- `src/lib/__tests__/issue-detector.test.ts` (AE2)
- `src/lib/__tests__/refactoring-planner.test.ts` (AE3)

### Files Modified

- `src/lib/decision-engine.ts` - Integrate new analyzers
- `src/lib/types.ts` - Add new type definitions
- `src/lib/index.ts` - Export new classes

---

## Post-Completion

After all 3 tasks are complete:

```bash
# Run full validation
pnpm validate

# Verify coverage
pnpm test -- --coverage

# Generate documentation
pnpm run docs

# Try the enhanced tool
vtm analyze vtm --suggest-refactoring
# Output will now include detailed metrics, specific issues, and refactoring strategies
```

---

## References

- Task Templates: `.claude/vtm/instruction-templates/tdd.md`
- Coding Standards: `.claude/vtm/coding-standards.md`
- Project Structure: `PROJECT_INDEX.json`
- DecisionEngine: `src/lib/decision-engine.ts` (current implementation)

---

**Created:** 2025-10-30
**Status:** Ready for implementation
**Contact:** See CLAUDE.md for development guidance
