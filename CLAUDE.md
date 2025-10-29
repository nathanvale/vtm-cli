# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VTM CLI is a token-efficient task management tool designed for AI-assisted development with Claude Code. It solves token bloat by providing surgical access to task manifests instead of loading everything into context, achieving 99% token reduction.

Reference the PROJECT_INDEX.json for architectural awareness.

## Build & Development Commands

```bash
# Install dependencies
npm install

# Build TypeScript to dist/
npm run build

# Development mode with watch
npm run dev

# Link globally for CLI usage
npm link

# Run without building
npm run dev -- next

# Start (requires build first)
npm run start -- next
```

## Architecture

### Core Components

**Three-Layer Architecture:**

1. **CLI Layer** (`src/index.ts`)
   - Commander.js-based CLI with 9 commands
   - Commands: next, context, task, start, complete, stats, list, summary, ingest
   - Orchestrates Reader/Writer/Builder classes

2. **Data Access Layer** (`src/lib/`)
   - `VTMReader`: Read-only operations, dependency resolution, task filtering
   - `VTMWriter`: Atomic write operations with automatic stats recalculation
   - `ContextBuilder`: Generates minimal/compact task contexts for Claude
   - `task-ingest-helper`: ID assignment and dependency resolution for new tasks
   - `task-validator-ingest`: Validation for ingested tasks with index-based dependencies
   - `vtm-summary`: Token-efficient VTM context generation for AI agents

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

### Traditional Workflow

The VTM CLI works with three prompts (in `/prompts/`):

1. **PROMPT 1** (Generate VTM): Convert ADRs/specs → vtm.json
2. **PROMPT 2** (Execute Task): TDD implementation of single task with context
3. **PROMPT 3** (Add Feature): Append new tasks to existing VTM

Typical flow:

```bash
vtm next                    # See ready tasks
vtm context TASK-003        # Generate context for Claude
# → Copy to Claude Code with PROMPT 2
# → Implement with TDD
vtm complete TASK-003       # Mark done, update stats
```

### Plan-to-VTM Workflow (Recommended)

For new features, use the Plan-to-VTM bridge:

```bash
# 1. Write planning documents
#    - ADR: Architectural decision record
#    - Spec: Technical specification with tasks

# 2. Generate VTM tasks
/plan:to-vtm adr/ADR-042-auth.md specs/spec-auth.md

# 3. Work on tasks
vtm next                    # See ready tasks
vtm context TASK-004        # Get task context
# → Implement with TDD
vtm complete TASK-004       # Mark done
```

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
