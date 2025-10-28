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
   - Commander.js-based CLI with 7 commands
   - Commands: next, context, task, start, complete, stats, list
   - Orchestrates Reader/Writer/Builder classes

2. **Data Access Layer** (`src/lib/`)
   - `VTMReader`: Read-only operations, dependency resolution, task filtering
   - `VTMWriter`: Atomic write operations with automatic stats recalculation
   - `ContextBuilder`: Generates minimal/compact task contexts for Claude

3. **Data Model** (`src/lib/types.ts`)
   - VTM: Top-level manifest structure
   - Task: Core task entity with dependencies, test strategies, validation
   - TaskContext: Task with resolved dependencies for context generation

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

Tasks can only depend on lower-numbered task IDs (TASK-001 can be depended on by TASK-002+). The system validates:
- No circular dependencies
- All dependencies exist
- Blocked tasks properly linked

### Stats Recalculation

When VTMWriter updates any task, it automatically recalculates:
- `total_tasks`: Count of all tasks
- `completed`: Tasks with status='completed'
- `in_progress`: Tasks with status='in-progress'
- `pending`: Tasks with status='pending'
- `blocked`: Tasks with unmet dependencies

This happens atomically in `updateTask()` via `recalculateStats()`.

## Integration with Claude Code Workflow

The VTM CLI is designed to work with three prompts (in `/prompts/`):

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
