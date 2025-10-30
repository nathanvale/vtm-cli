# Task Instructions: TASK-AE3 - Implement Refactoring Options & Migration

## Objective

Enhance DecisionEngine with refactoring option generation and migration strategy planning. For each detected issue, provide multiple solution approaches with detailed trade-off analysis, effort estimates, and step-by-step migration plans.

## Acceptance Criteria

1. ✅ Implement `RefactoringPlanner` class:
   - Map issues to refactoring strategies
   - Generate 2-3 alternative approaches per issue
   - Evaluate each approach for pros/cons, effort, and breaking changes
   - Recommend best approach based on impact/effort ratio

2. ✅ Create strategy generators for common issues:
   - **TooManyCommands**: Extract sub-domain, consolidate domain, split by concern
   - **LowCohesion**: Redefine domain focus, merge with related domain, rename
   - **TightCoupling**: Extract shared utilities, decouple dependencies, add facade
   - **TestCoverageGaps**: Add unit tests, increase integration test coverage, refactor for testability

3. ✅ Implement `MigrationStrategy` type with:
   - Phased migration plan (analyze → plan → implement → verify)
   - Pre-migration checklist (backup, test setup, dependencies)
   - Migration steps with rollback procedures at each step
   - Post-migration verification (coverage, performance, docs)
   - Risk assessment and mitigation strategies

4. ✅ Create `ImplementationChecklist` for selected strategy:
   - Pre-flight checks (tests passing, clean working dir)
   - Phase-by-phase tasks with time estimates
   - Quality gates (lint, build, tests, coverage)
   - Rollback procedures for each phase
   - Post-flight validation

5. ✅ Achieve 80%+ test coverage with Wallaby MCP
   - Test strategy generation for each issue type
   - Test migration plan creation
   - Test checklist generation
   - Test edge cases (single issue, multiple issues)

---

## Test Strategy: Test-Driven Development (TDD)

**MANDATORY:** Use Wallaby MCP for real-time test feedback and coverage analysis.

### Red-Green-Refactor Cycle with Wallaby MCP

#### 🔴 RED Phase: Write Failing Test

1. Create `src/lib/__tests__/refactoring-planner.test.ts`
2. Write tests for:
   - `generateOptions()` returns 2+ approaches per issue
   - `recommendBest()` selects lowest effort/highest impact
   - `createMigrationStrategy()` generates phased plan
   - `buildChecklist()` produces executable tasks
3. Run `wallaby_failingTests` to verify all fail
4. Check failure messages (unimplemented methods)

#### 🟢 GREEN Phase: Make Test Pass

1. Implement RefactoringPlanner with stub strategies
2. Run `wallaby_allTests` to verify tests pass
3. Check `wallaby_coveredLinesForFile` for coverage
4. Add tests for edge cases until 80%+ coverage

#### 🔵 REFACTOR Phase: Improve Code Quality

1. Implement full strategy generation for each issue type
2. Add proper cost/benefit calculations
3. Add comprehensive JSDoc to all methods
4. Run `wallaby_allTests` to ensure tests stay green
5. Run `pnpm lint:fix && pnpm format`
6. Verify coverage maintained

---

## Coding Standards

### Documentation (JSDoc/TypeDoc)

````typescript
/**
 * Generates multiple refactoring approaches for an architectural issue.
 *
 * Returns 2-3 alternative solutions for the given issue, each evaluated for
 * pros, cons, effort estimate, and breaking change risk. Approaches are
 * ordered by recommended priority (best first).
 *
 * @param issue - The architectural issue to solve
 * @returns Array of RefactoringOption sorted by recommendation priority
 *
 * @example
 * ```typescript
 * const planner = new RefactoringPlanner();
 * const issue = createIssue('TooManyCommands', { commands: 15 });
 * const options = planner.generateOptions(issue);
 * // Returns: [recommended, alternative1, alternative2]
 * ```
 *
 * @remarks
 * Options consider current codebase context, team capacity, and risk tolerance.
 * See RefactoringOption type for detailed fields.
 */
generateOptions(issue: ArchitecturalIssue): RefactoringOption[]
````

### Type Safety

- ✅ Define all refactoring types with proper interfaces
- ✅ Effort estimates as typed strings (e.g., '2-3 hours')
- ✅ No `any` types
- ✅ Explicit return types on all public methods
- ✅ Use discriminated unions for strategy-specific data

### Test Coverage

- ✅ Minimum **80% code coverage**
- ✅ Test strategy generation for 4+ issue types
- ✅ Test migration plan creation
- ✅ Test cost-benefit analysis
- ✅ Use Wallaby MCP continuously

---

## File Operations

**Create:**

- `src/lib/refactoring-planner.ts` - Main RefactoringPlanner class
- `src/lib/strategy-generators.ts` - Strategy generators for each issue type
- `src/lib/__tests__/refactoring-planner.test.ts` - Tests

**Modify:**

- `src/lib/decision-engine.ts` - Use RefactoringPlanner in `suggestRefactoring()`
- `src/lib/types.ts` - Add refactoring-related types

**Types to add:**

```typescript
type RefactoringOption = {
  name: string
  description: string
  pros: string[]
  cons: string[]
  effort: string // e.g., "2-3 hours"
  breaking: boolean
  riskLevel: "low" | "medium" | "high"
  impactScore: number // 1-10, higher is better
  effortScore: number // 1-10, lower is better (1 = easy)
  recommendation: boolean // selected best option
}

type MigrationStrategy = {
  name: string
  overview: string
  phases: MigrationPhase[]
  preFlightChecks: ChecklistItem[]
  postFlightValidation: ChecklistItem[]
  riskMitigation: RiskMitigation[]
  estimatedDuration: string
  rollbackPlan: string
}

type MigrationPhase = {
  name: string
  description: string
  tasks: MigrationTask[]
  duration: string
  qualityGates: QualityGate[]
}

type MigrationTask = {
  id: string
  title: string
  description: string
  steps: string[]
  duration: string
  rollbackProcedure: string
}

type QualityGate = {
  name: string
  command: string // e.g., "pnpm test"
  successCriteria: string
}

type RiskMitigation = {
  risk: string
  likelihood: "low" | "medium" | "high"
  impact: string
  mitigation: string
}

type ImplementationChecklist = {
  phases: ChecklistPhase[]
  totalDuration: string
  overallRisk: string
  approvalGates: string[]
}

type ChecklistPhase = {
  name: string
  duration: string
  tasks: ChecklistItem[]
}

type ChecklistItem = {
  id: string
  task: string
  checkCommand?: string
  successCriteria: string
  optional: boolean
}
```

---

## Strategy Generation Guidelines

### For TooManyCommands Issue

**Option 1: Extract Sub-Domain (Recommended)**

- Split into 2-3 focused domains (e.g., vtm-core, vtm-admin)
- Pro: Clear separation, independent scaling
- Con: More domains to manage
- Effort: 4-6 hours
- Risk: Medium (requires dependency management)

**Option 2: Consolidate (Quick Win)**

- Merge closely related commands into meta-commands
- Pro: Fast implementation, keeps single domain
- Con: Less discoverability, larger commands
- Effort: 1-2 hours
- Risk: Low

**Option 3: Organize by Concern**

- Keep single domain, organize via subdirectories/modules
- Pro: Balanced complexity and organization
- Con: Still one domain to understand
- Effort: 2-3 hours
- Risk: Low

### For LowCohesion Issue

**Option 1: Redefine Focus (Recommended)**

- Clarify single responsibility, rename domain
- Pro: Improves clarity, attracts right commands
- Con: Minimal change if commands are truly unrelated
- Effort: 1 hour
- Risk: Low

**Option 2: Merge into Related Domain**

- Move commands to more cohesive domain
- Pro: Consolidates related functionality
- Con: Larger domain
- Effort: 2-3 hours
- Risk: Low

---

## Implementation Workflow (TDD)

### Step 1: Write Failing Tests

```bash
# Create test file
touch src/lib/__tests__/refactoring-planner.test.ts

# Write tests for:
# - generateOptions() for TooManyCommands issue
# - generateOptions() for LowCohesion issue
# - generateOptions() for TightCoupling issue
# - createMigrationStrategy() for each option
# - buildChecklist() produces executable tasks
# - recommendBest() selects best option
```

### Step 2: Implement Core

```bash
# Create refactoring-planner.ts with stub methods
# Create strategy-generators.ts with individual generators
pnpm test -- src/lib/__tests__/refactoring-planner.test.ts

# Verify tests pass with minimal implementation
```

### Step 3: Implement Strategies

```bash
# Implement full strategy generation for 4+ issue types
# Add cost-benefit analysis and recommendation logic
# Add comprehensive error handling
pnpm test -- src/lib/__tests__/refactoring-planner.test.ts
```

### Step 4: Refactor & Enhance

```bash
# Improve code organization and reusability
# Add comprehensive JSDoc to all classes and methods
# Run validation
pnpm lint:fix && pnpm format
pnpm build
```

---

## Pre-Flight Checklist

- [ ] Dependencies installed: `pnpm install`
- [ ] All existing tests passing: `pnpm test`
- [ ] Build succeeds: `pnpm build`
- [ ] Wallaby MCP connected
- [ ] Reviewed DecisionEngine integration points
- [ ] Reviewed existing VTM domain structure (for examples)

---

## Success Criteria

Task TASK-AE3 is **COMPLETE** when:

1. ✅ All 5 acceptance criteria met
2. ✅ All tests pass with 80%+ coverage
3. ✅ Strategy generators for 4+ issue types implemented
4. ✅ Migration planning working (multi-phase with rollback)
5. ✅ RefactoringPlanner integrated into DecisionEngine.suggestRefactoring()
6. ✅ All code has comprehensive JSDoc
7. ✅ Cost-benefit analysis and recommendation logic working
8. ✅ ESLint, Prettier, and build clean
9. ✅ Commits tagged with [TASK-AE3]

---

## Integration Point: DecisionEngine Update

After completing this task, DecisionEngine.suggestRefactoring() will:

```typescript
public suggestRefactoring(component: string): RefactoringPlan {
  const currentState = this.analyzeComponent(component) // Uses ComponentAnalyzer
  const issues = this.detectComponentIssues(component, currentState) // Uses IssueDetector
  const options = this.generateRefactoringOptions(component, issues) // Uses RefactoringPlanner
  const recommendation = this.selectBestOption(options)
  const migration = this.buildMigrationStrategy(component, recommendation)
  const implementation = this.buildImplementationChecklist(component, recommendation)
  // ... return complete refactoring plan
}
```

---

## Expected Implementation Duration

**Effort:** ~3-4 hours

- Test writing: 60 minutes
- Strategy generator implementation: 90 minutes
- Migration strategy planning: 60 minutes
- Refactoring & docs: 45 minutes
- Validation: 30 minutes

---

## Note on Integration

Tasks TASK-AE1, TASK-AE2, and TASK-AE3 form a coherent enhancement:

1. **TASK-AE1** provides deep component metrics
2. **TASK-AE2** detects issues from those metrics
3. **TASK-AE3** generates solutions for detected issues

Work them in order: AE1 → AE2 → AE3 for smooth integration.
