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
vtm analyze <domain-name>
vtm analyze <domain-name> --suggest-refactoring

# Manage session state
vtm session get              # Get current task ID
vtm session set TASK-030     # Set current task
vtm session clear            # Clear current task
```

## Architecture

### Core Components

**Three-Layer Architecture:**

1. **CLI Layer** (`src/index.ts`)
   - Commander.js-based CLI with 10 commands
   - Commands: next, context, task, start, complete, stats, list, summary, ingest, **analyze**
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
     - Pattern-based architecture recommendation system
     - Domain analysis with strength/issue detection
     - Refactoring suggestions based on best practices
     - Uses architecture patterns from `src/lib/data/architecture-patterns.json`
     - 85.1% test coverage via TDD (40 tests in `src/lib/__tests__/decision-engine.test.ts`)

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

The DecisionEngine (`src/lib/decision-engine.ts`) provides intelligent architecture analysis and recommendations using pattern matching and best practices.

### Features

**Domain Analysis:**

```bash
vtm analyze vtm                    # Analyze domain structure
vtm analyze plan --suggest-refactoring  # Get refactoring suggestions
```

**Capabilities:**

- Scans domain components (commands, skills, MCPs, hooks)
- Identifies architectural strengths and issues
- Detects patterns based on keywords
- Provides refactoring recommendations
- Calculates complexity and cohesion metrics

**Architecture Patterns:**
Located in `src/lib/data/architecture-patterns.json`:

- task-management: CRUD operations for tasks
- workflow: Process-oriented operations
- data-visualization: Analytics and dashboards
- integration: External system connections

### TDD Test Coverage

**Test File:** `src/lib/__tests__/decision-engine.test.ts`

**Coverage:** 85.1% (40 tests covering all major functionality)

**Test Suites:**

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

**Running Tests:**

```bash
pnpm test                          # Run all tests
pnpm test -- src/lib/__tests__/decision-engine.test.ts  # Run DecisionEngine tests only
pnpm test -- --coverage            # Run with coverage report
```

### Usage Examples

**Analyze Existing Domain:**

```typescript
import { DecisionEngine } from "vtm-cli/lib"

const engine = new DecisionEngine()
const analysis = engine.analyzeDomain("vtm")

console.log("Commands:", analysis.current.commands)
console.log("Strengths:", analysis.strengths)
console.log("Issues:", analysis.issues)
```

**Get Architecture Recommendations:**

```typescript
const recommendation = engine.recommendArchitecture(
  "task tracking with Slack integration",
)

console.log("Suggested domain:", recommendation.domain)
console.log("Commands:", recommendation.commands)
console.log("Confidence:", recommendation.confidence + "%")
```

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

### Streamlined Workflow (Recommended)

VTM provides Claude Code slash commands for efficient task execution:

**Core Commands:**

- `/vtm:next` - List ready tasks with workflow hints
- `/vtm:work TASK-XXX` - Start task and view context in one step
- `/vtm:done` - Complete current task and find next

**Streamlined flow:**

```bash
/vtm:next                   # See ready tasks
/vtm:work TASK-003         # Start task + view context
# → Implement with TDD
/vtm:done                  # Complete task + show next
```

**Additional Commands:**

- `/vtm:context TASK-XXX` - View task context only
- `/vtm:start TASK-XXX` - Mark task as in-progress
- `/vtm:complete TASK-XXX` - Mark task as completed
- `/vtm:task TASK-XXX` - View full task details
- `/vtm:stats` - View progress statistics

### Smart Hints

All workflow commands include intelligent hints:

**`/vtm:start`:**

- Detects if context hasn't been viewed yet
- Suggests using `/vtm:work` instead
- Warns if starting a task you're already working on
- `--force` flag to bypass hints

**`/vtm:complete`:**

- Detects if task was never started (status: pending)
- Warns if completing different task than current
- Suggests proper workflow steps
- `--force` flag to bypass prompts

**`/vtm:context`:**

- Shows task status (pending/in-progress/completed)
- Indicates if task is your current task
- Suggests `/vtm:work` for pending tasks

**`/vtm:next`:**

- Shows current task if one exists
- Recommends `/vtm:work` as quick start option
- Shows both streamlined and step-by-step workflows

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

- `/vtm:work TASK-003` - Sets session when task starts
- `/vtm:done` - Clears session when task completes
- `/vtm:start`, `/vtm:context` - Use session for smart hints

### Traditional Workflow (Step-by-Step)

For users who prefer explicit control:

```bash
vtm next                    # See ready tasks
vtm context TASK-003        # Generate context for Claude
# → Copy to Claude Code with PROMPT 2
vtm start TASK-003          # Mark as in-progress
# → Implement with TDD
vtm complete TASK-003       # Mark done, update stats
```

### Plan-to-VTM Workflow

For new features, use the Plan-to-VTM bridge:

```bash
# 1. Write planning documents
#    - ADR: Architectural decision record
#    - Spec: Technical specification with tasks

# 2. Generate VTM tasks
/plan:to-vtm adr/ADR-042-auth.md specs/spec-auth.md

# 3. Work on tasks (streamlined)
/vtm:work TASK-004          # Start + context
# → Implement with TDD
/vtm:done                   # Complete + next

# OR traditional step-by-step
vtm next
vtm context TASK-004
vtm start TASK-004
# → Implement
vtm complete TASK-004
```

### Workflow Migration Guide

**From Traditional → Streamlined:**

| Old Workflow                                   | New Workflow                | Benefit                      |
| ---------------------------------------------- | --------------------------- | ---------------------------- |
| `vtm context TASK-003`<br>`vtm start TASK-003` | `/vtm:work TASK-003`        | 2 commands → 1               |
| `vtm complete TASK-003`<br>`vtm next`          | `/vtm:done`                 | 2 commands → 1, no ID needed |
| Manual workflow tracking                       | Automatic via session state | Less mental overhead         |

**Migration Steps:**

1. Try `/vtm:next` to see new workflow hints
2. Use `/vtm:work` for your next task
3. Complete with `/vtm:done` instead of explicit complete
4. Fall back to traditional commands anytime with `--force` flags

**Compatibility:**

- All traditional commands still work unchanged
- Smart hints can be bypassed with `--force` flags
- Mix and match workflows as preferred

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
