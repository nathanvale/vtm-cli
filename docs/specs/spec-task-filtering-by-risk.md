---
title: "Task Filtering by Risk Level Technical Specification"
status: approved
owner: VTM CLI Team
version: 1.0.0
related_adrs: [ADR-047-task-filtering-by-risk.md]
---

# Task Filtering by Risk Level Technical Specification

## Executive Summary

This specification defines the implementation of risk-based task filtering for VTM CLI. It maps existing test strategies (TDD, Unit, Integration, Direct) to risk levels (high, medium, low) and extends the `vtm list` and `vtm next` commands with `--risk` and `--by-risk` flags. The implementation requires no schema changes and provides immediate value for teams managing complex projects.

---

## Scope

### In Scope

- Risk level mapping from test_strategy field
- `--risk <level>` flag for `vtm list` and `vtm next` commands
- `--by-risk` grouping flag for `vtm list` command
- Risk level display in CLI output (badges/labels)
- Composition of risk filters with existing status filters
- Unit and integration tests for filtering logic
- Documentation updates (CLI help text, README examples)

### Out of Scope

- Adding dedicated `risk` field to task schema (see ADR-047 Alternative 1)
- Risk analytics or reporting features (future enhancement)
- Risk-based task prioritization within `vtm next` ordering (future enhancement)
- Custom risk level mappings via configuration (may be added later)

### Dependencies

- **ADRs**:
  - [ADR-047: Task Filtering by Risk Level](../adr/ADR-047-task-filtering-by-risk.md)
- **Related Specs**:
  - None

---

## Success Criteria

- [X] `vtm list --risk high` returns only TDD and Integration tasks
- [X] `vtm next --risk high` suggests next ready high-risk task
- [X] `vtm list --by-risk` groups output into high/medium/low sections
- [X] Risk filters compose: `vtm list --status pending --risk high` works correctly
- [X] Risk badges appear in task output (e.g., `[HIGH RISK]` for TDD tasks)
- [X] Help text (`vtm list --help`) documents risk level mapping
- [X] 100% test coverage for risk filtering logic
- [X] Zero breaking changes to existing VTM files or CLI behavior

---

## System Architecture

### Component Diagram

```
┌─────────────────┐
│   CLI Layer     │  (src/index.ts)
│  (list, next)   │  - Parses --risk and --by-risk flags
│                 │  - Calls VTMReader filtering methods
└────────┬────────┘
         │
         v
┌─────────────────┐
│  VTMReader      │  (src/lib/vtm-reader.ts)
│                 │  - getTasksByRisk(level)
│                 │  - Filters tasks by risk level
└────────┬────────┘
         │
         v
┌─────────────────┐
│  Risk Mapper    │  (src/lib/types.ts)
│                 │  - getRiskLevel(testStrategy)
│                 │  - Maps TDD/Integration → high
│                 │  - Maps Unit → medium
│                 │  - Maps Direct → low
└─────────────────┘
```

### Key Components

#### Component 1: Risk Mapping Function

- **Purpose**: Maps test_strategy enum to risk level string
- **Responsibilities**:
  - Provide canonical mapping: TDD/Integration → high, Unit → medium, Direct → low
  - Single source of truth for risk level logic
  - Type-safe with TypeScript enums
- **Technology**: Pure TypeScript function
- **Location**: `src/lib/types.ts`

#### Component 2: VTMReader Risk Filtering

- **Purpose**: Extend VTMReader with risk-based query methods
- **Responsibilities**:
  - Filter tasks by risk level
  - Compose risk filters with status filters
  - Maintain existing filtering semantics (e.g., blocking logic)
- **Technology**: TypeScript class methods
- **Location**: `src/lib/vtm-reader.ts`

#### Component 3: CLI Command Extensions

- **Purpose**: Add --risk and --by-risk flags to list/next commands
- **Responsibilities**:
  - Parse new CLI flags
  - Call VTMReader risk filtering methods
  - Format output with risk level indicators
  - Update help text
- **Technology**: Commander.js options
- **Location**: `src/index.ts`

### Data Flow

```
1. User runs: vtm list --risk high --status pending
2. CLI parses flags: { risk: 'high', status: 'pending' }
3. VTMReader loads vtm.json (cached)
4. Filter by status: filter(task => task.status === 'pending')
5. Filter by risk: filter(task => getRiskLevel(task.test_strategy) === 'high')
6. Format output with [HIGH RISK] badges
7. Display filtered task list
```

### Integration Points

- **Existing VTMReader filters**: Risk filters compose with `getReadyTasks()`, `getTasksByStatus()`
- **CLI output formatters**: Risk badges integrate with existing task display logic

---

## Technical Implementation

### Technology Stack

- **Language/Runtime**: TypeScript 5.x with Node.js 20
- **Key Libraries**:
  - "commander": "^12.0.0" (CLI flag parsing)
  - "chalk": "^4.1.2" (colored output for risk badges)
- **Development Tools**: Vitest for unit/integration testing

### File Structure

```
src/
  lib/
    types.ts                    # Add getRiskLevel() function
    vtm-reader.ts               # Add getTasksByRisk() method
  index.ts                      # Extend list/next commands with --risk flags
test/
  risk-filtering.test.ts        # New test file for risk filtering
```

### Core Interfaces

```typescript
// src/lib/types.ts

// Existing type (no changes)
export type TestStrategy = 'TDD' | 'Unit' | 'Integration' | 'Direct'

// New type for risk levels
export type RiskLevel = 'high' | 'medium' | 'low'

// New function: Risk mapping
export function getRiskLevel(testStrategy: TestStrategy): RiskLevel {
  switch (testStrategy) {
    case 'TDD':
    case 'Integration':
      return 'high'
    case 'Unit':
      return 'medium'
    case 'Direct':
      return 'low'
  }
}

// Optional: Reverse mapping for documentation/help text
export const RISK_LEVEL_MAPPING: Record<RiskLevel, TestStrategy[]> = {
  high: ['TDD', 'Integration'],
  medium: ['Unit'],
  low: ['Direct'],
}
```

### Implementation Details

#### Feature 1: VTMReader Risk Filtering

```typescript
// src/lib/vtm-reader.ts

export class VTMReader {
  // ... existing methods ...

  /**
   * Get tasks filtered by risk level
   * @param riskLevel - Risk level to filter by ('high' | 'medium' | 'low')
   * @returns Tasks matching the risk level
   */
  getTasksByRisk(riskLevel: RiskLevel): Task[] {
    const vtm = this.load()
    return vtm.tasks.filter(
      (task) => getRiskLevel(task.test_strategy) === riskLevel
    )
  }

  /**
   * Get ready tasks filtered by risk level
   * @param riskLevel - Risk level to filter by
   * @returns Ready tasks (no blocking dependencies) matching risk level
   */
  getReadyTasksByRisk(riskLevel: RiskLevel): Task[] {
    const readyTasks = this.getReadyTasks()
    return readyTasks.filter(
      (task) => getRiskLevel(task.test_strategy) === riskLevel
    )
  }

  /**
   * Group tasks by risk level
   * @returns Object with high/medium/low arrays
   */
  groupTasksByRisk(): Record<RiskLevel, Task[]> {
    const vtm = this.load()
    return {
      high: this.getTasksByRisk('high'),
      medium: this.getTasksByRisk('medium'),
      low: this.getTasksByRisk('low'),
    }
  }
}
```

**Key Considerations**:

- Use existing `getReadyTasks()` logic to maintain blocking semantics
- Risk filtering composes with status filtering via array filter chaining
- Methods return Task arrays for consistency with existing VTMReader API

#### Feature 2: CLI Command Extensions

```typescript
// src/index.ts

// Extend vtm list command
program
  .command('list')
  .description('List tasks')
  .option('-s, --status <status>', 'Filter by status (pending|in_progress|completed|blocked)')
  .option('-r, --risk <level>', 'Filter by risk level (high|medium|low)')
  .option('--by-risk', 'Group tasks by risk level')
  .action((options) => {
    const reader = new VTMReader()
    let tasks = reader.load().tasks

    // Apply status filter if provided
    if (options.status) {
      tasks = tasks.filter((t) => t.status === options.status)
    }

    // Apply risk filter if provided
    if (options.risk) {
      const riskLevel = options.risk as RiskLevel
      tasks = tasks.filter((t) => getRiskLevel(t.test_strategy) === riskLevel)
    }

    // Group by risk if requested
    if (options.byRisk) {
      displayTasksGroupedByRisk(tasks)
    } else {
      displayTasks(tasks)
    }
  })

// Extend vtm next command
program
  .command('next')
  .description('Get next ready task')
  .option('-r, --risk <level>', 'Filter to high/medium/low risk tasks')
  .action((options) => {
    const reader = new VTMReader()
    let readyTasks = reader.getReadyTasks()

    if (options.risk) {
      const riskLevel = options.risk as RiskLevel
      readyTasks = readyTasks.filter(
        (t) => getRiskLevel(t.test_strategy) === riskLevel
      )
    }

    if (readyTasks.length === 0) {
      console.log('No ready tasks matching criteria')
      return
    }

    const nextTask = readyTasks[0]
    displayTask(nextTask)
  })

// Helper: Display with risk badges
function displayTask(task: Task) {
  const riskLevel = getRiskLevel(task.test_strategy)
  const riskBadge = getRiskBadge(riskLevel)

  console.log(`${riskBadge} ${task.id}: ${task.title}`)
  console.log(`Status: ${task.status} | Strategy: ${task.test_strategy}`)
  // ... rest of task display
}

function getRiskBadge(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'high':
      return chalk.red('[HIGH RISK]')
    case 'medium':
      return chalk.yellow('[MEDIUM RISK]')
    case 'low':
      return chalk.green('[LOW RISK]')
  }
}

function displayTasksGroupedByRisk(tasks: Task[]) {
  const grouped = {
    high: tasks.filter((t) => getRiskLevel(t.test_strategy) === 'high'),
    medium: tasks.filter((t) => getRiskLevel(t.test_strategy) === 'medium'),
    low: tasks.filter((t) => getRiskLevel(t.test_strategy) === 'low'),
  }

  console.log(chalk.red.bold('\n=== HIGH RISK TASKS ==='))
  grouped.high.forEach(displayTask)

  console.log(chalk.yellow.bold('\n=== MEDIUM RISK TASKS ==='))
  grouped.medium.forEach(displayTask)

  console.log(chalk.green.bold('\n=== LOW RISK TASKS ==='))
  grouped.low.forEach(displayTask)
}
```

**Key Considerations**:

- Validate risk level input (high/medium/low only)
- Use chalk colors: red=high, yellow=medium, green=low
- Maintain existing help text structure, add risk mapping explanation
- Compose filters via array chaining (status then risk)

### Error Handling

- **Invalid risk level**: "Invalid risk level 'foo'. Must be high, medium, or low."
- **No matching tasks**: "No ready tasks matching criteria (risk: high, status: pending)"
- **Malformed VTM**: Existing error handling in VTMReader.load() covers this

### Configuration

No configuration files or environment variables required. Risk mapping is hardcoded per ADR-047 decision.

---

## Test Strategy

### Test Pyramid

```
     /\
    /E2E\        [4 tests - CLI flag integration]
   /------\
  /  INT   \     [6 tests - VTMReader filtering]
 /----------\
/ UNIT       \   [8 tests - getRiskLevel mapping]
--------------
```

### Test Scenarios

#### Unit Tests

**Coverage Target**: 100% for getRiskLevel function

| Scenario                        | Test Case                              | Expected Outcome      |
| ------------------------------- | -------------------------------------- | --------------------- |
| TDD strategy maps to high       | `getRiskLevel('TDD')`                  | Returns `'high'`      |
| Integration strategy maps to high | `getRiskLevel('Integration')`         | Returns `'high'`      |
| Unit strategy maps to medium    | `getRiskLevel('Unit')`                 | Returns `'medium'`    |
| Direct strategy maps to low     | `getRiskLevel('Direct')`               | Returns `'low'`       |
| Invalid strategy (type guard)   | `getRiskLevel('Invalid' as any)`       | TypeScript error      |

#### Integration Tests

**Coverage Target**: All VTMReader risk methods and CLI combinations

| Scenario                             | Test Case                                          | Dependencies           | Expected Outcome                      |
| ------------------------------------ | -------------------------------------------------- | ---------------------- | ------------------------------------- |
| Filter tasks by high risk            | `reader.getTasksByRisk('high')`                    | VTM with mixed tasks   | Returns TDD + Integration tasks only  |
| Filter ready tasks by risk           | `reader.getReadyTasksByRisk('medium')`             | VTM with dependencies  | Returns ready Unit tasks only         |
| Group tasks by risk                  | `reader.groupTasksByRisk()`                        | VTM with mixed tasks   | Returns object with 3 arrays          |
| CLI: list --risk high                | Run CLI with flag                                  | Mock VTM file          | Displays high-risk tasks with badges  |
| CLI: list --status pending --risk high | Run CLI with combined flags                      | Mock VTM file          | Displays pending high-risk tasks      |
| CLI: list --by-risk                  | Run CLI with grouping flag                         | Mock VTM file          | Displays grouped output by risk       |
| CLI: next --risk high                | Run CLI with risk filter                           | Mock VTM file          | Suggests next ready high-risk task    |
| CLI: invalid risk level              | `list --risk invalid`                              | N/A                    | Shows error message with valid levels |

---

## Task Breakdown

### Task 1: Implement Risk Level Mapping Function

**Description**: Create the core risk mapping function that translates test strategies to risk levels. This is the foundation for all filtering logic.

**Acceptance Criteria**:
- `getRiskLevel()` function exists in `src/lib/types.ts`
- Function maps TDD and Integration to 'high'
- Function maps Unit to 'medium'
- Function maps Direct to 'low'
- Function is type-safe with TypeScript enums
- Unit tests cover all four test strategies
- Export `RiskLevel` type for use in other modules

**Dependencies**: None

**Test Strategy**: TDD

**Estimated Hours**: 2

**Files**:
- Modify: `src/lib/types.ts` (add getRiskLevel function and RiskLevel type)
- Create: `test/risk-mapping.test.ts` (unit tests for mapping logic)

---

### Task 2: Extend VTMReader with Risk Filtering Methods

**Description**: Add three new methods to VTMReader class for risk-based task queries: `getTasksByRisk()`, `getReadyTasksByRisk()`, and `groupTasksByRisk()`.

**Acceptance Criteria**:
- `getTasksByRisk(level)` returns tasks matching specified risk level
- `getReadyTasksByRisk(level)` returns ready tasks matching risk level (respects blocking dependencies)
- `groupTasksByRisk()` returns object with high/medium/low arrays
- Methods compose with existing VTMReader logic (no breaking changes)
- Integration tests cover all three methods with realistic VTM data
- Edge case: empty task list returns empty arrays

**Dependencies**: Task 1

**Test Strategy**: TDD

**Estimated Hours**: 3

**Files**:
- Modify: `src/lib/vtm-reader.ts` (add risk filtering methods)
- Create: `test/vtm-reader-risk.test.ts` (integration tests for filtering)
- Modify: `test/fixtures/vtm-risk-test.json` (test data with mixed risk tasks)

---

### Task 3: Add --risk Flag to vtm list Command

**Description**: Extend the `vtm list` command with `--risk` flag to filter tasks by risk level. Include risk badges in output display.

**Acceptance Criteria**:
- `vtm list --risk high` filters to high-risk tasks only
- `vtm list --risk medium` filters to medium-risk tasks
- `vtm list --risk low` filters to low-risk tasks
- Invalid risk level shows error with valid options
- Risk badges appear in output: [HIGH RISK], [MEDIUM RISK], [LOW RISK]
- Badges use appropriate colors (red/yellow/green via chalk)
- Help text (`vtm list --help`) documents risk flag and mapping
- Risk filter composes with existing `--status` flag

**Dependencies**: Task 2

**Test Strategy**: Integration

**Estimated Hours**: 3

**Files**:
- Modify: `src/index.ts` (add --risk option to list command)
- Modify: `src/index.ts` (add getRiskBadge helper function)
- Modify: `src/index.ts` (update displayTask to show risk badges)
- Create: `test/cli-list-risk.test.ts` (CLI integration tests)

---

### Task 4: Add --by-risk Grouping to vtm list Command

**Description**: Implement `--by-risk` flag for `vtm list` that groups output into three sections (high/medium/low risk) with clear visual separation.

**Acceptance Criteria**:
- `vtm list --by-risk` displays three sections: HIGH RISK, MEDIUM RISK, LOW RISK
- Sections use bold colored headers (red/yellow/green)
- Empty sections show "(none)" instead of omitting section
- Section ordering: high → medium → low (most risky first)
- Grouping composes with `--status` filter (e.g., `--status pending --by-risk`)
- Help text documents --by-risk flag

**Dependencies**: Task 3

**Test Strategy**: Integration

**Estimated Hours**: 2

**Files**:
- Modify: `src/index.ts` (add --by-risk option and displayTasksGroupedByRisk function)
- Modify: `test/cli-list-risk.test.ts` (add grouping tests)

---

### Task 5: Add --risk Flag to vtm next Command

**Description**: Extend the `vtm next` command with `--risk` flag to suggest next ready task matching specified risk level. Useful for focusing on high-risk work first.

**Acceptance Criteria**:
- `vtm next --risk high` suggests next ready high-risk task
- `vtm next --risk medium` suggests next ready medium-risk task
- `vtm next --risk low` suggests next ready low-risk task
- No matching tasks shows: "No ready tasks matching criteria (risk: X)"
- Risk badge appears in suggested task output
- Help text documents --risk flag for next command
- Maintains existing task ordering logic (first ready task in filtered set)

**Dependencies**: Task 2

**Test Strategy**: Integration

**Estimated Hours**: 2

**Files**:
- Modify: `src/index.ts` (add --risk option to next command)
- Create: `test/cli-next-risk.test.ts` (CLI integration tests for next command)

---

### Task 6: Update Documentation and Help Text

**Description**: Update README, CLI help text, and inline code documentation to explain risk filtering features and test strategy → risk level mapping.

**Acceptance Criteria**:
- README.md includes risk filtering examples in Usage section
- CLI help text (`vtm list --help`, `vtm next --help`) documents --risk and --by-risk flags
- Help text includes risk level mapping table (TDD/Integration=high, Unit=medium, Direct=low)
- Code comments explain risk mapping rationale (references ADR-047)
- CHANGELOG.md entry for new feature
- All JSDoc comments added to new functions/methods

**Dependencies**: Task 5

**Test Strategy**: Direct

**Estimated Hours**: 2

**Files**:
- Modify: `README.md` (add risk filtering section with examples)
- Modify: `CHANGELOG.md` (add entry for v1.X.0 with risk filtering feature)
- Modify: `src/lib/types.ts` (add JSDoc to getRiskLevel)
- Modify: `src/lib/vtm-reader.ts` (add JSDoc to risk methods)

---

## Risks & Mitigations

| Risk                                                     | Impact | Probability | Mitigation                                                                 |
| -------------------------------------------------------- | ------ | ----------- | -------------------------------------------------------------------------- |
| Test strategy → risk mapping doesn't fit all use cases  | Medium | Medium      | Document mapping clearly; future config option for custom mappings         |
| Users confused by implicit risk vs explicit test strategy | Low   | Medium      | Comprehensive help text; show both risk and strategy in output             |
| Performance degradation with large task lists            | Low    | Low         | Risk filtering uses simple array filter (O(n)); acceptable for <1000 tasks |
| Breaking changes to existing CLI usage                   | High   | Low         | All flags are optional; existing commands work unchanged                   |

---

## Performance Considerations

- **Filtering Performance**: O(n) array traversal for risk filtering; acceptable for typical VTM sizes (<200 tasks)
- **Memory Usage**: No additional memory overhead; risk level computed on-demand from test_strategy
- **Caching**: VTMReader already caches loaded VTM; no additional caching needed

**Bottlenecks**:

- None expected; risk filtering is lightweight compared to file I/O (loading vtm.json)

**Optimization Strategy**:

- Not required for MVP; monitor if users report performance issues with 500+ task VTMs

---

## Security & Compliance

- **Input Validation**: Risk level validated against enum ('high' | 'medium' | 'low') to prevent injection
- **Data Handling**: No new data persistence; reads existing test_strategy field
- **Secrets Management**: N/A (no secrets involved)

---

## Monitoring & Observability

- **Logs**: No additional logging required (CLI output is already logged)
- **Metrics**: Could track usage of --risk flag via telemetry (future enhancement)
- **Alerts**: N/A (no production deployment)

---

## Open Questions

All questions resolved during ADR-047 review.

---

## Appendix

### Related Documentation

- **ADRs**:
  - [ADR-047: Task Filtering by Risk Level](../adr/ADR-047-task-filtering-by-risk.md)
- **Related Specs**:
  - None

### Glossary

- **Risk Level**: High/medium/low categorization of task complexity/uncertainty
- **Test Strategy**: TDD/Unit/Integration/Direct approach to testing a task
- **Ready Task**: Task with no blocking dependencies (all dependencies completed)
- **Blocking Dependency**: A task dependency that must be completed before work can start

---

## Version History

| Version | Date       | Author       | Changes                                        |
| ------- | ---------- | ------------ | ---------------------------------------------- |
| 1.0.0   | 2025-10-29 | VTM CLI Team | Initial specification approved alongside ADR-047 |
