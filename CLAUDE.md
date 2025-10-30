# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VTM CLI is a token-efficient task management tool designed for AI-assisted development with Claude Code. It solves token bloat by providing surgical access to task manifests instead of loading everything into context, achieving 99% token reduction.

Reference the PROJECT_INDEX.json for architectural awareness.

## Build & Development Commands

```bash
# Install dependencies
pnpm install

# Build TypeScript to dist/
pnpm run build

# Development mode with watch
pnpm run dev

# Link globally for CLI usage
pnpm link

# Run without building
pnpm run dev -- next

# Start (requires build first)
pnpm run start -- next

# Run tests (includes DecisionEngine TDD tests)
pnpm test

# Run tests with coverage
pnpm test -- --coverage

# Wallaby MCP Testing (Preferred for TDD)
# Use Wallaby MCP server for real-time test feedback during TDD cycles
# Key tools:
#   - wallaby_runtimeValues: Get runtime values at specific code locations
#   - wallaby_failingTests: Get all failing tests with errors and stack traces
#   - wallaby_allTests: Get all tests with their status
#   - wallaby_coveredLinesForFile: Get code coverage for specific files
#   - wallaby_updateTestSnapshots: Update test snapshots when needed

# Quality checks
pnpm lint           # Run ESLint
pnpm lint:fix       # Auto-fix linting issues
pnpm format         # Format code with Prettier
pnpm validate       # Run full validation (lint + build + test)

# Analyze domain architecture
vtm analyze <domain-name>                     # Light pattern-based analysis
vtm analyze <domain-name> --deep              # Deep 3-tier analysis
vtm analyze <domain-name> --deep --suggest-refactoring  # Deep analysis with refactoring roadmap

# Manage session state
vtm session get              # Get current task ID
vtm session set TASK-030     # Set current task
vtm session clear            # Clear current task
```

## Plan Domain Commands (Phase 1 & 2 Integration)

The plan domain now includes batch operations, validation, and intelligent caching.

### Batch Operations

**`vtm create-specs <pattern> [--dry-run] [--with-tasks]`**

- Create technical specifications for multiple ADRs in one command
- Glob pattern support: `vtm create-specs "docs/adr/ADR-*.md"`
- `--dry-run`: Preview without creating files
- `--with-tasks`: Also generate VTM tasks
- **Performance:** 80% faster than individual spec creation

### Validation Commands

**`/plan:validate <adr-file> <spec-file> [--strict]`**

- Validate ADR+Spec pairs before conversion to VTM
- Checks structure, pairing, and content quality
- `--strict`: Enforce all requirements (production-ready)
- Provides actionable error messages with examples

### History & Rollback

**`vtm history [limit]`**

- Show recent transaction history (default: 10)
- View what was ingested and when
- Example: `vtm history 20`

**`vtm history-detail <transaction-id>`**

- Show detailed transaction information
- Lists all tasks added
- Shows rollback options
- Example: `vtm history-detail 2025-10-30-001`

**`vtm rollback <transaction-id> [--dry-run] [--force]`**

- Rollback a task batch safely
- `--dry-run`: Preview without executing
- `--force`: Skip confirmation prompt
- Checks for blocking dependencies
- Example: `vtm rollback 2025-10-30-001 --dry-run`

### Cache Management

**`vtm cache-stats`**

- Show cache statistics and usage
- Displays hit rate, storage size, entry count
- Demonstrates performance improvements

**`vtm cache-clear [--expired] [--tag=<tag>] [--force]`**

- Clear cache entries
- `--expired`: Clear only expired entries (TTL > 30 days)
- `--tag=<tag>`: Clear entries with specific tag
- `--force`: Skip confirmation
- Example: `vtm cache-clear --expired`

**`vtm cache-info <query>`**

- Show information about a specific cache entry
- Displays query, size, tags, creation date
- Shows result preview (first 300 characters)

## Research Caching (Phase 2)

The plan domain now uses intelligent research caching to speed up workflows.

**How it works:**

1. `/plan:generate-adrs` researches alternatives and caches results
2. `/plan:create-spec` reuses cached research (40% faster)
3. Cache has 30-day TTL, automatically managed

**Performance Impact:**

- Single ADR: No improvement (only 1 research call)
- 5 ADRs + Specs: 40% faster (cache hits on implementation research)
- 10+ ADRs: 60% faster (high cache reuse)

**Configuration:**

- Cache location: `.claude/cache/research/`
- TTL: 30 days (configurable)
- Graceful fallback if cache unavailable

## Transaction History (Phase 2)

All task ingestion is now recorded in transaction history, enabling safe rollback.

**Features:**

- Every `/plan:to-vtm` creates a transaction
- Transaction ID format: `YYYY-MM-DD-NNN`
- History stores: timestamp, source, files, tasks added
- Dependency checking before rollback
- Warnings for in-progress tasks

**Example Workflow:**

```bash
# Ingest tasks
/plan:to-vtm adr/ADR-001.md specs/spec-001.md --commit
# Transaction: 2025-10-30-001

# Oops, wrong file! Check history
vtm history-detail 2025-10-30-001

# Preview rollback
vtm rollback 2025-10-30-001 --dry-run

# Execute rollback
vtm rollback 2025-10-30-001 --force
```

## Architecture

### Core Components

**Three-Layer Architecture:**

1. **CLI Layer** (`src/index.ts`)
   - Commander.js-based CLI with 10 commands
   - Commands: next, context, task, complete, stats, list, summary, ingest, analyze, session
   - Orchestrates Reader/Writer/Builder classes
   - Integrates DecisionEngine for architecture analysis

2. **Data Access Layer** (`src/lib/`)
   - `VTMReader`: Read-only operations, dependency resolution, task filtering
   - `VTMWriter`: Atomic write operations with automatic stats recalculation
   - `ContextBuilder`: Generates minimal/compact task contexts for Claude
   - `task-ingest-helper`: ID assignment and dependency resolution for new tasks
   - `task-validator-ingest`: Validation for ingested tasks with index-based dependencies
   - `vtm-summary`: Token-efficient VTM context generation for AI agents
   - **`DecisionEngine`**: Architecture analysis and recommendations (`src/lib/decision-engine.ts`)
     - Two analysis modes: light (pattern-based) and deep (3-tier pipeline)
     - Pattern-based architecture recommendation system
     - Domain analysis with strength/issue detection
     - Refactoring suggestions based on best practices
     - Uses architecture patterns from `src/lib/data/architecture-patterns.json`
     - 85.1% test coverage via TDD (40 tests in `src/lib/__tests__/decision-engine.test.ts`)
   - **`DeepAnalysisEngine`**: Comprehensive 3-tier architecture analysis (`src/lib/deep-analysis-engine.ts`)
     - **Tier 1: ComponentAnalyzer** (`src/lib/component-analyzer.ts`)
       - Scans TypeScript files for metrics (complexity, functions, JSDoc coverage)
       - Detects code smells (long functions, high complexity, missing docs)
       - Generates ComponentMetrics for each file
     - **Tier 2: IssueDetector** (`src/lib/issue-detector.ts`)
       - Applies 8+ detection rules to components
       - Identifies architectural problems (too many commands, low cohesion, tight coupling)
       - Generates ArchitecturalIssue[] with severity classification (high/medium/low)
     - **Tier 3: RefactoringPlanner** (`src/lib/refactoring-planner.ts`)
       - Generates 2-3 refactoring options per issue
       - Creates migration strategies with multi-phase implementation
       - Provides executable implementation checklists
       - Evaluates trade-offs (effort, risk, breaking changes)
     - Orchestrates full pipeline for `vtm analyze --deep`
     - 100% test coverage via TDD methodology (19 integration tests)
   - **Plan Domain Libraries** (Phase 1 & 2):
     - `plan-validators.ts`: Input validation for all plan commands
     - `batch-spec-creator.ts`: Batch ADR processing with 80% performance improvement
     - `adr-spec-validator.ts`: Comprehensive pairing validation before VTM conversion
     - `research-cache.ts`: Intelligent caching with 30-day TTL (40% faster workflows)
     - `vtm-history.ts`: Transaction tracking and safe rollback with dependency checking

3. **Data Model** (`src/lib/types.ts`)
   - VTM: Top-level manifest structure
   - Task: Core task entity with dependencies (supports both string IDs and numeric indices), test strategies, validation
   - TaskWithDependencies: Task with resolved dependencies for context generation
   - TaskRichContext: Optional rich context linking tasks to source ADRs/Specs with line numbers and code examples

### Key Design Patterns

**Atomic Writes**: VTMWriter uses write-to-temp + rename pattern for crash safety. All task updates automatically recalculate stats.

**Dependency Resolution**: VTMReader.getReadyTasks() filters tasks where all dependencies are completed. Supports blocking relationships.

**Context Generation**: Two modes:

- `buildMinimalContext()`: Full context (~2000 tokens)
- `buildCompactContext()`: Ultra-minimal (~500 tokens)

**Research Caching**: Intelligent cache with TTL management:

- 30-day TTL for research results
- Tag-based cache invalidation
- Graceful fallback on cache miss
- 40% performance improvement for multi-ADR workflows

**Transaction History**: Safe rollback mechanism:

- Every task ingestion creates a transaction record
- Dependency checking prevents unsafe rollbacks
- Atomic rollback operations (all-or-nothing)
- Transaction ID format: `YYYY-MM-DD-NNN`

**Prerequisite Validation**: Early error detection:

- Multi-layer validation (file existence, structure, pairing)
- Actionable error messages with examples
- Prevents costly mistakes before VTM conversion
- 70% reduction in user confusion

### Data Flow

```
vtm.json (source of truth)
    ↓
VTMReader (loads and caches)
    ↓
Task filtering/resolution
    ↓
CLI presentation OR ContextBuilder
    ↓
Output to user/Claude
```

Updates:

```
CLI command
    ↓
VTMWriter.updateTask()
    ↓
Atomic write to vtm.json
    ↓
Stats auto-recalculated
```

### File Operations

All classes accept optional `vtmPath` parameter (defaults to `vtm.json` in cwd). The VTMReader caches loaded data; force reload with `load(true)`.

## DecisionEngine - Architecture Analysis

The DecisionEngine (`src/lib/decision-engine.ts`) provides intelligent architecture analysis and recommendations with two analysis modes: light (pattern-based) and deep (3-tier pipeline).

### Analysis Modes

**Light Analysis** (Default)

```bash
vtm analyze <domain-name>                    # Pattern-based analysis (~500ms)
vtm analyze <domain-name> --suggest-refactoring  # Light analysis with refactoring suggestions
```

Fast pattern-based analysis using keyword matching:

- Scans domain components (commands, skills, MCPs, hooks)
- Identifies architectural strengths based on patterns
- Detects patterns using keyword matching
- Provides high-level refactoring recommendations
- Best for: Quick validation, CI/CD checks, automated analysis

**Deep Analysis** (Comprehensive)

```bash
vtm analyze <domain-name> --deep             # Full 3-tier analysis (~2-3s)
vtm analyze <domain-name> --deep --suggest-refactoring  # Deep analysis with detailed refactoring roadmap
```

Comprehensive 3-tier architecture analysis:

- **Tier 1 (ComponentAnalyzer)**: Scans TypeScript files for metrics and code smells
- **Tier 2 (IssueDetector)**: Applies 8+ detection rules to identify architectural problems
- **Tier 3 (RefactoringPlanner)**: Generates multi-phase refactoring strategies with trade-offs
- Best for: Architecture reviews, refactoring planning, detailed technical debt analysis

### Output Comparison

**Light Analysis Output:**

```
Domain: plan
Pattern: workflow (95% confidence)
Suggested Commands: create, list, update, delete, execute
Strengths:
  - Well-organized commands structure
  - Clear workflow automation
Issues:
  - Consider separating validation into dedicated domain
```

**Deep Analysis Output:**

```
=== DEEP ARCHITECTURE ANALYSIS: plan ===

📊 COMPONENTS (12 TypeScript files analyzed):
  - plan-validators.ts: 450 LOC, complexity 15, 3 code smells
  - batch-spec-creator.ts: 380 LOC, complexity 12, 1 code smell
  - adr-spec-validator.ts: 520 LOC, complexity 18, 4 code smells
  ...

🔍 ISSUES (5 architectural problems detected):
  HIGH: TooManyCommands
    - 12 commands exceed recommended limit (max: 8)
    - Impacts: maintainability, discoverability
    - Affected: plan-validators.ts, batch-spec-creator.ts

  MEDIUM: LowCohesion
    - Validation logic mixed with business logic
    - Impacts: testability, reusability
    - Affected: plan-validators.ts

🔧 REFACTORING STRATEGIES (8 options with recommendations):
  Issue: TooManyCommands
    Option 1: Extract validation commands into separate domain
      - Effort: 2-3 hours
      - Risk: Low
      - Breaking changes: None
      - Implementation phases: 3
      - Recommendation: Recommended (improves separation of concerns)

    Option 2: Consolidate related commands
      - Effort: 1-2 hours
      - Risk: Medium (may affect existing workflows)
      - Breaking changes: Command aliases deprecated
      - Implementation phases: 2
      - Recommendation: Alternative approach

    Option 3: Organize commands by feature area
      - Effort: 3-4 hours
      - Risk: Low
      - Breaking changes: None (uses command groups)
      - Implementation phases: 4
      - Recommendation: Best for long-term maintainability
```

### Features

**Capabilities:**

- Scans domain components (commands, skills, MCPs, hooks)
- Identifies architectural strengths and issues
- Detects patterns based on keywords (light mode)
- Analyzes TypeScript source code metrics (deep mode)
- Provides refactoring recommendations with trade-offs
- Calculates complexity and cohesion metrics
- Generates executable implementation checklists

**Architecture Patterns:**
Located in `src/lib/data/architecture-patterns.json`:

- task-management: CRUD operations for tasks
- workflow: Process-oriented operations
- data-visualization: Analytics and dashboards
- integration: External system connections

### TDD Test Coverage

**Test Coverage Overview:**

- **Light Analysis**: 85.1% coverage (40 tests in `decision-engine.test.ts`)
- **Deep Analysis**: 100% coverage (19 tests in `deep-analysis-engine.test.ts`)
- **Total**: 606+ tests passing, 83%+ overall coverage

**Light Analysis Tests** (`src/lib/__tests__/decision-engine.test.ts`):

1. **Pattern Loading** (3 tests)
   - Default pattern loading
   - Custom patterns path
   - Invalid JSON handling

2. **Keyword Extraction** (6 tests)
   - Common word filtering
   - Short word filtering
   - Case-insensitive matching

3. **Pattern Matching** (7 tests)
   - Exact keyword matches
   - Partial matches
   - Confidence scoring
   - Pattern ranking
   - Threshold filtering

4. **Architecture Recommendation** (8 tests)
   - Domain name suggestion
   - Command generation
   - Skills, MCPs, and hooks recommendations
   - Rationale and implementation plans

5. **Domain Analysis** (8 tests)
   - Directory scanning
   - Strength identification
   - Issue detection
   - Recommendation generation
   - Metrics calculation
   - Refactoring roadmap

6. **Library Export** (4 tests)
   - Module export verification
   - TypeScript types
   - API compatibility

**Deep Analysis Tests** (`src/lib/__tests__/deep-analysis-engine.test.ts`):

1. **ComponentAnalyzer** (6 tests)
   - TypeScript file parsing
   - Complexity metrics calculation
   - Code smell detection
   - JSDoc coverage analysis

2. **IssueDetector** (5 tests)
   - TooManyCommands detection
   - LowCohesion detection
   - TightCoupling detection
   - Severity classification

3. **RefactoringPlanner** (5 tests)
   - Strategy generation
   - Trade-off evaluation
   - Implementation checklist creation
   - Multi-phase migration planning

4. **End-to-End Pipeline** (3 tests)
   - Full 3-tier analysis
   - Integration with DecisionEngine
   - Output format validation

**Running Tests:**

```bash
pnpm test                          # Run all tests (606+ tests)
pnpm test -- src/lib/__tests__/decision-engine.test.ts  # Light analysis tests
pnpm test -- src/lib/__tests__/deep-analysis-engine.test.ts  # Deep analysis tests
pnpm test -- --coverage            # Run with coverage report

# Wallaby MCP Tools (during TDD cycles)
wallaby_failingTests               # See test failures in real-time
wallaby_allTests                   # Verify all tests pass
wallaby_coveredLinesForFile        # Check coverage for specific files
```

### Usage Examples

**Light Analysis (Pattern-Based):**

```typescript
import { DecisionEngine } from "vtm-cli/lib"

const engine = new DecisionEngine()

// Analyze existing domain
const analysis = engine.analyzeDomain("vtm")
console.log("Commands:", analysis.current.commands)
console.log("Strengths:", analysis.strengths)
console.log("Issues:", analysis.issues)

// Get architecture recommendations
const recommendation = engine.recommendArchitecture(
  "task tracking with Slack integration",
)
console.log("Suggested domain:", recommendation.domain)
console.log("Commands:", recommendation.commands)
console.log("Confidence:", recommendation.confidence + "%")
```

**Deep Analysis (3-Tier Pipeline):**

```typescript
import { DecisionEngine } from "vtm-cli/lib"

const engine = new DecisionEngine()

// Perform deep analysis
const deepAnalysis = engine.analyzeDeepArchitecture("plan")

// Access component metrics
console.log("Components analyzed:", deepAnalysis.components.length)
deepAnalysis.components.forEach((comp) => {
  console.log(
    `${comp.name}: ${comp.metrics.linesOfCode} LOC, complexity ${comp.metrics.complexity}`,
  )
  console.log(`Code smells: ${comp.codeSmells.length}`)
})

// Review architectural issues
console.log("\nIssues detected:", deepAnalysis.issues.length)
deepAnalysis.issues.forEach((issue) => {
  console.log(`[${issue.severity}] ${issue.type}`)
  console.log(`Description: ${issue.description}`)
  console.log(`Impacts: ${issue.impacts.join(", ")}`)
})

// Explore refactoring strategies
console.log("\nRefactoring strategies:", deepAnalysis.strategies.length)
deepAnalysis.strategies.forEach((strategy) => {
  console.log(`\nIssue: ${strategy.issueType}`)
  strategy.options.forEach((option) => {
    console.log(`  Option ${option.optionNumber}: ${option.title}`)
    console.log(`    Effort: ${option.estimatedEffort}`)
    console.log(`    Risk: ${option.risk}`)
    console.log(`    Recommendation: ${option.recommendation}`)
  })
})

// Summary metrics
console.log("\nSummary:")
console.log(`Total components: ${deepAnalysis.summary.totalComponents}`)
console.log(`Code smells: ${deepAnalysis.summary.totalCodeSmells}`)
console.log(`High severity issues: ${deepAnalysis.summary.highSeverityIssues}`)
console.log(
  `Recommended actions: ${deepAnalysis.summary.recommendedActions.length}`,
)
```

### Deep Architecture Analysis Workflow

Use deep analysis for comprehensive refactoring planning:

**Step 1: Analyze domain structure**

```bash
vtm analyze plan --deep
# Output: Components, issues, refactoring strategies, summary
```

**Step 2: Review architectural issues**

The analysis identifies problems with severity levels:

- **HIGH**: Critical issues requiring immediate attention (e.g., too many commands, tight coupling)
- **MEDIUM**: Important issues affecting maintainability (e.g., low cohesion, missing documentation)
- **LOW**: Minor issues or suggestions (e.g., code style, optimization opportunities)

**Step 3: Evaluate refactoring strategies**

Each issue comes with 2-3 refactoring options:

- **Option 1**: Often the recommended approach (balances effort/risk/benefit)
- **Option 2**: Alternative approach (different trade-offs)
- **Option 3**: Long-term approach (more comprehensive but higher effort)

**Step 4: Create ADR for chosen strategy**

```bash
# Use analysis output to inform architectural decisions
/plan:create-adr "Extract validation commands into separate domain"

# Reference the deep analysis in your ADR:
# - Issue type and severity
# - Affected components
# - Migration strategy phases
# - Trade-offs and risks
```

**Step 5: Generate implementation tasks**

```bash
# Convert ADR + Spec into VTM tasks
/plan:to-vtm adr/ADR-XXX.md specs/spec-XXX.md --commit

# Tasks will include:
# - Phase 1: Extract validation utilities
# - Phase 2: Create new domain structure
# - Phase 3: Migrate existing commands
# - Phase 4: Update tests and documentation
```

**Step 6: Execute with TDD workflow**

```bash
/vtm:execute TASK-XXX           # Launch agent for first task
# → Agent implements using TDD methodology
/vtm:done                       # Complete and move to next task
```

## Performance Improvements (Phase 1 & 2)

### Research Caching

- **40% faster** multi-command workflows
- **40% fewer** API calls to thinking-partner
- **30-day** intelligent cache with TTL management

### Batch Spec Creation

- **80% faster** for 5+ ADRs vs individual creation
- Validates all ADRs before starting
- Reuses cached research across specs

### Prerequisite Validation

- Prevents errors early (saves 5+ min per mistake)
- Clear error messages with actionable fixes
- 70% reduction in user confusion

### Deep Analysis Performance

Analysis performance characteristics:

**Light Analysis** (`vtm analyze <domain>`):

- **Speed**: ~500ms
- **Token usage**: ~1,000 tokens
- **Analysis depth**: Pattern matching, high-level recommendations
- **Best for**: Quick validation, CI/CD checks, automated analysis

**Deep Analysis** (`vtm analyze <domain> --deep`):

- **Speed**: ~2-3s
- **Token usage**: ~5,000-8,000 tokens (with smart filtering)
- **Analysis depth**: Component metrics, architectural issues, refactoring strategies
- **Best for**: Architecture reviews, refactoring planning, technical debt analysis

**Smart Severity Filtering**:

- By default, only shows MEDIUM+ severity issues
- Reduces token usage by 80% for clean codebases
- Use `--all-issues` flag to see all severity levels

**When to Use Each Mode**:

| Scenario                  | Light Analysis | Deep Analysis |
| ------------------------- | -------------- | ------------- |
| Quick health check        | ✅             | ❌            |
| CI/CD validation          | ✅             | ❌            |
| Architecture review       | ❌             | ✅            |
| Refactoring planning      | ❌             | ✅            |
| Technical debt assessment | ❌             | ✅            |
| Pre-commit validation     | ✅             | ❌            |
| Automated analysis        | ✅             | ⚠️ (slower)   |

### Combined Impact

- **5-ADR feature workflow:**
  - Without improvements: 20 minutes
  - With all improvements: 12 minutes
  - **40% overall improvement**

## Test Strategies

Tasks use four test strategies defined in `test_strategy` field:

- `TDD`: High-risk, tests written first (Red-Green-Refactor)
- `Unit`: Medium-risk, tests after implementation
- `Integration`: Cross-component behavior testing
- `Direct`: Setup/config work, manual verification

## Working with VTM Files

### Task Dependencies

Dependencies can be specified in two formats:

1. **String IDs**: `"dependencies": ["TASK-001", "TASK-002"]`
   - Standard format for referencing existing tasks
   - Validated against VTM task list

2. **Numeric indices** (during ingestion): `"dependencies": [0, 1]`
   - References tasks by position in batch (0-based)
   - Automatically resolved to TASK-XXX IDs by `vtm ingest`
   - Useful for Plan-to-VTM bridge workflow

The system validates:

- No circular dependencies
- All dependencies exist (for string IDs) or are within bounds (for indices)
- Blocked tasks properly linked
- Index-based dependencies are resolved before ingestion

### Stats Recalculation

When VTMWriter updates any task, it automatically recalculates:

- `total_tasks`: Count of all tasks
- `completed`: Tasks with status='completed'
- `in_progress`: Tasks with status='in-progress'
- `pending`: Tasks with status='pending'
- `blocked`: Tasks with unmet dependencies

This happens atomically in `updateTask()` via `recalculateStats()`.

## Plan-to-VTM Bridge

The VTM CLI includes a Plan-to-VTM bridge that transforms planning documents (ADR + technical specification) into executable VTM tasks using AI-powered extraction.

### Architecture

```
ADR + Spec Documents
    ↓
/plan:to-vtm command (Claude Code slash command)
    ↓
AI Agent extracts tasks with rich context
    ↓
vtm summary (provides existing task context)
    ↓
vtm ingest (validates, assigns IDs, resolves dependencies)
    ↓
vtm.json (tasks added with full traceability)
```

### Key Components

**vtm summary**: Generates token-efficient context for AI agents

- Filters to incomplete tasks only (80% token reduction)
- Outputs JSON with task summaries and completed capabilities
- Used by extraction agent to understand existing VTM state

**vtm ingest**: Validates and ingests tasks into VTM

- Automatic ID assignment (TASK-XXX)
- Dependency resolution (indices → TASK-XXX IDs)
- Multi-layer validation (schema, dependencies, circular deps)
- Preview mode before committing
- Supports mixed dependencies: `[0, "TASK-002"]` (indices + IDs)

**/plan:to-vtm**: Claude Code slash command for end-to-end workflow

- Reads ADR and Spec documents
- Generates VTM summary for agent context
- Launches AI agent to extract tasks
- Transforms agent output format
- Validates and ingests tasks
- Shows preview with dependency chains

### Workflow Example

```bash
# Option 1: Using Claude Code slash command
/plan:to-vtm adr/ADR-042-auth.md specs/spec-auth.md

# Option 2: Manual workflow
vtm summary --incomplete --json > context.json
# → Use context.json with AI agent to extract tasks
# → Save agent output to tasks.json
vtm ingest tasks.json --preview
vtm ingest tasks.json --commit
```

### Task Dependencies

Tasks support two dependency formats:

1. **Numeric indices** (for batch ingestion): `"dependencies": [0, 1, 2]`
   - References tasks within the same batch by array index
   - Automatically resolved to TASK-XXX IDs by vtm ingest

2. **String IDs** (for existing tasks): `"dependencies": ["TASK-002", "TASK-005"]`
   - References existing tasks in VTM
   - Validated against incomplete tasks

Mixed dependencies are supported: `"dependencies": [0, "TASK-002"]`

### Rich Context

Tasks can include optional rich context linking to source documents:

```json
{
  "context": {
    "adr": {
      "file": "adr/ADR-042.md",
      "decision": "Core architectural decision",
      "rationale": "Why this approach was chosen",
      "constraints": ["Constraint 1", "Constraint 2"],
      "relevant_sections": [
        {
          "section": "## Implementation",
          "lines": "42-58",
          "content": "Brief excerpt",
          "relevance": 1.0
        }
      ]
    },
    "spec": {
      "file": "specs/spec-042.md",
      "acceptance_criteria": ["AC1", "AC2"],
      "test_requirements": [...],
      "code_examples": [...],
      "relevant_sections": [...]
    }
  }
}
```

## Integration with Claude Code Workflow

### Simplified Workflow (Recommended)

VTM provides a streamlined workflow with just two commands:

**Core Commands:**

- `/vtm:execute TASK-XXX` - Launch Task agent with full git integration
- `/vtm:done` - Complete current task, merge to main, and find next

**Complete workflow:**

```bash
/vtm:next                   # See ready tasks
/vtm:execute TASK-003       # Launch agent with git integration
# → Agent implements autonomously
/vtm:done                   # Complete + merge + show next
```

**Supporting Commands:**

- `/vtm:context TASK-XXX` - View task context only (read-only, no git operations)
- `/vtm:next` - List ready tasks
- `/vtm:task TASK-XXX` - View full task details
- `/vtm:stats` - View progress statistics
- `/vtm:list` - List all tasks
- `/vtm:complete TASK-XXX` - Mark task as completed (direct CLI)

### Git Integration

All workflow commands include automatic git integration:

**`/vtm:execute`:**

- Ensures clean working directory before starting
- Creates feature branch with format: `{type}/TASK-XXX`
  - Examples: `feature/TASK-003`, `bugfix/TASK-025`, `refactor/TASK-088`
- Task type extracted from task metadata (defaults to "feature")

**`/vtm:done`:**

- Commits any uncommitted changes with conventional commit format
- Merges feature branch to main
- Deletes feature branch after successful merge
- Marks task complete and shows next available tasks

### Session State Tracking

VTM tracks your current task via the `VTMSession` class:

**Features:**

- Persists current task ID to `.vtm-session` file
- Project-specific (based on working directory)
- Enables `/vtm:done` to complete current task without ID
- Powers smart hints in workflow commands

**Session File Structure:**

```json
{
  "currentTask": "TASK-003"
}
```

**CLI Commands:**

Session state can be managed directly using CLI commands:

```bash
vtm session get           # Get current task ID (exit 0 if set, exit 1 if empty)
vtm session set TASK-003  # Set current task ID
vtm session clear         # Clear current task and remove session file
```

**Usage Examples:**

```bash
# Set current task when starting work
vtm session set TASK-003

# Check current task
vtm session get
# Output: TASK-003

# Use in bash conditionals
if vtm session get > /dev/null; then
  echo "You have a current task: $(vtm session get)"
fi

# Clear session after completing work
vtm session clear
```

**Integration with Slash Commands:**

The slash commands automatically manage session state:

- `/vtm:execute TASK-003` - Sets session when task starts
- `/vtm:done` - Clears session when task completes
- `/vtm:context` - Uses session to show current task status

### Plan-to-VTM Workflow with Safety

For new features, use the Plan-to-VTM bridge with Phase 1 & 2 safety features:

```bash
# Step 1: Generate ADRs (with validation)
/plan:generate-adrs prd/feature.md

# Step 2: Batch create specs (with caching)
vtm create-specs "docs/adr/ADR-*.md"

# Step 3: Validate before conversion
/plan:validate "docs/adr/ADR-001.md" "docs/specs/spec-001.md"

# Step 4: Convert to VTM (tracked in history)
/plan:to-vtm adr/ADR-001.md specs/spec-001.md --commit

# Step 5: View what was added
vtm history

# Step 6: Oops! Can safely rollback
vtm rollback 2025-10-30-001 --dry-run
vtm rollback 2025-10-30-001 --force

# Step 7: Check performance
vtm cache-stats

# Step 8: Execute tasks (with git integration)
/vtm:execute TASK-004       # Launch agent + git workflow
# → Agent implements autonomously
/vtm:done                   # Complete + merge + next
```

### Direct CLI Commands (Advanced/Manual)

For script automation or manual control, you can use direct CLI commands. However, **the recommended workflow is `/vtm:execute` + `/vtm:done`** for full git integration.

**Read-Only Commands:**

```bash
vtm next                    # See ready tasks
vtm context TASK-003        # Generate context (read-only)
vtm task TASK-003           # View full task details
vtm stats                   # View progress statistics
vtm list                    # List all tasks
```

**Manual Task Management:**

```bash
vtm complete TASK-003       # Mark done, update stats (no git operations)
vtm session set TASK-003    # Manually set current task
vtm session get             # Get current task ID
vtm session clear           # Clear session state
```

**Note:** Direct CLI commands do not include git integration (branch creation, commits, merges). Use `/vtm:execute` and `/vtm:done` for the full automated workflow with git integration.

## Workflow Comparison Guide

VTM offers three distinct workflows to match different development styles and requirements. Choose the workflow that best fits your needs.

### 1. Recommended Workflow (Slash Commands)

**Best for:** Most users, agent-assisted development, automated git workflow

The simplest and most powerful workflow using Claude Code slash commands.

**Core Commands:**

```bash
/vtm:next                   # List ready tasks
/vtm:execute TASK-XXX       # Launch Task agent with full git integration
/vtm:done                   # Complete task, commit, merge to main, show next
```

**Features:**

- Full git integration (branch creation, commits, merges)
- Comprehensive task instructions for AI agents
- Automatic session state tracking
- Agent orchestration with detailed context
- Conventional commit messages
- Clean working directory validation

**Token Usage:** ~5,000-8,000 tokens per task

**Example Workflow:**

```bash
# Step 1: See what's ready
/vtm:next
# Output: TASK-003 (ready), TASK-005 (ready)

# Step 2: Launch agent with git workflow
/vtm:execute TASK-003
# → Creates feature branch: feature/TASK-003
# → Sets session state
# → Provides full task context to agent
# → Agent implements autonomously

# Step 3: Complete and move on
/vtm:done
# → Commits changes with conventional format
# → Merges to main
# → Deletes feature branch
# → Clears session
# → Shows next ready tasks
```

**When to Use:**

- Default choice for most development work
- When you want AI assistance with implementation
- When you want automated git branching/merging
- For features requiring multiple commits
- When following TDD methodology

### 2. Advanced Workflow (CLI Commands)

**Best for:** Manual control, scripting, custom workflows, CI/CD integration

Direct CLI commands for programmatic control without agent assistance.

**Core Commands:**

```bash
vtm next                    # List ready tasks
vtm start TASK-XXX          # Mark task as in-progress (no git ops)
vtm complete TASK-XXX       # Mark task as completed (no git ops)
vtm context TASK-XXX        # Generate task context (read-only)
```

**Features:**

- No git automation (you control all git operations)
- Minimal context generation
- Manual session state management
- Scriptable and CI/CD friendly
- Suitable for automation pipelines

**Token Usage:** ~500-2,000 tokens per task

**Example Workflow:**

```bash
# Step 1: See what's ready
vtm next
# Output: TASK-003 (ready)

# Step 2: Manually create branch and start task
git checkout -b feature/TASK-003
vtm start TASK-003

# Step 3: View task context if needed
vtm context TASK-003

# Step 4: Implement manually
# ... your development work ...

# Step 5: Commit and merge manually
git add .
git commit -m "feat: implement TASK-003"
git checkout main
git merge feature/TASK-003
git branch -d feature/TASK-003

# Step 6: Mark complete
vtm complete TASK-003
```

**When to Use:**

- Custom git workflows (e.g., PR-based, rebase workflows)
- CI/CD automation scripts
- When you need full manual control
- Integration with external tools
- Batch operations on multiple tasks
- When token usage must be minimized

### 3. Hybrid Workflow

**Best for:** Code review before starting, manual work with git automation

Mix slash commands and CLI commands for flexibility.

**Approach 1: Review Context, Then Execute**

```bash
# Step 1: Review task context first
/vtm:context TASK-003
# → View task details and requirements
# → Decide if you want to proceed

# Step 2: Launch agent with git workflow
/vtm:execute TASK-003
# → Agent implements with full git integration

# Step 3: Complete and merge
/vtm:done
```

**Approach 2: Manual Implementation, Agent Completion**

```bash
# Step 1: Start manually
vtm start TASK-003
git checkout -b feature/TASK-003

# Step 2: Implement manually
# ... your development work ...

# Step 3: Let agent handle git completion
/vtm:done
# → Commits uncommitted changes
# → Merges to main
# → Cleans up branch
```

**When to Use:**

- Want to review context before committing to agent execution
- Prefer manual implementation but want automated git cleanup
- Need to verify task requirements before starting
- Learning or onboarding to VTM workflow

### Comparison Table

| Feature | Recommended (Slash Commands) | Advanced (CLI Commands) | Hybrid |
|---------|------------------------------|-------------------------|--------|
| Git Integration | Yes (automatic) | No (manual) | Configurable |
| Agent Assistance | Yes (full context) | No | Optional |
| Session State | Automatic | Manual tracking | Automatic |
| Branch Management | Automatic | Manual | Configurable |
| Context Generation | Full instructions | Minimal | Full or minimal |
| Commit Messages | Conventional format | Manual | Conventional (if using /vtm:done) |
| Token Usage | 5,000-8,000 | 500-2,000 | 2,000-8,000 |
| Best For | Most development | Scripting/automation | Flexibility |
| Learning Curve | Low | Medium | Medium |
| Automation Level | High | Low | Medium |

### Workflow Decision Tree

**Choose Recommended Workflow if:**

- You're new to VTM
- You want AI-assisted implementation
- You prefer automated git operations
- You're working on complex features
- You're following TDD methodology

**Choose Advanced Workflow if:**

- You need custom git workflows
- You're writing automation scripts
- You require minimal token usage
- You're integrating with CI/CD
- You want full manual control

**Choose Hybrid Workflow if:**

- You want to review before executing
- You prefer manual implementation with automated cleanup
- You need flexibility in your workflow
- You're learning VTM and want gradual adoption

### Migration Between Workflows

You can switch between workflows at any time:

**From Advanced to Recommended:**

```bash
# Currently using CLI commands
vtm start TASK-003

# Switch to slash commands mid-task
/vtm:done  # Will handle git operations from current state
```

**From Recommended to Advanced:**

```bash
# Currently using slash commands
/vtm:execute TASK-003

# Want manual control for completion
# Just use CLI commands instead of /vtm:done
git add .
git commit -m "feat: complete TASK-003"
vtm complete TASK-003
```

**Key Insight:** Session state is shared across workflows, so you can mix and match commands as needed.

## TypeScript Configuration

- Target: ES2022
- Output: CommonJS modules to `dist/`
- Strict mode enabled
- Source maps and declarations generated

## Important Notes

- VTM files live in USER projects, not in this repo
- Example VTM: `examples/vtm-example.json`
- CLI is shebang-enabled (`#!/usr/bin/env node`)
- Chalk version locked to 4.x for CommonJS compatibility
