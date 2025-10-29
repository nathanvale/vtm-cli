# Technical Specification: Plan-to-VTM Bridge System

## Document Information

- **Version**: 1.0.0
- **Status**: Draft
- **Last Updated**: 2025-10-29
- **Author**: VTM Core Team

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [VTM CLI Extensions](#vtm-cli-extensions)
4. [Plan Domain Command](#plan-domain-command)
5. [Data Schemas](#data-schemas)
6. [Validation System](#validation-system)
7. [Test Strategy](#test-strategy)
8. [Acceptance Criteria](#acceptance-criteria)
9. [Implementation Checklist](#implementation-checklist)
10. [Performance Requirements](#performance-requirements)
11. [Error Handling](#error-handling)

---

## Overview

### Purpose

The Plan-to-VTM Bridge transforms planning documents (ADRs and technical specifications) into executable VTM tasks with rich context, intelligent dependency analysis, and token-efficient integration.

### Key Principles

1. **ADR + Spec Pairs are Mandatory**: Every task originates from both an ADR (decision context) and a Spec (implementation details)
2. **Intelligent Dependency Analysis**: LLM-based agent analyzes incomplete tasks to determine dependencies
3. **Token Efficiency**: VTM summary command filters context to only incomplete tasks and completed capabilities
4. **Composability**: Plan domain → VTM domain → Review domain (extensible pipeline)
5. **Safety First**: Multi-layer validation with preview before commitment

### Problem Statement

Current workflow requires manual task extraction from planning documents, leading to:
- Lost context from ADR decisions
- Manual dependency analysis errors
- Token bloat when loading full VTM
- Inconsistent task structure
- Missing traceability to source documents

### Solution

Automated bridge system that:
- Extracts tasks with rich context from ADR+Spec pairs
- Uses LLM agent for intelligent dependency reasoning
- Generates token-efficient VTM summaries
- Validates schema, dependencies, and circular dependency prevention
- Provides human-readable preview with dependency chains
- Safely ingests validated tasks into VTM

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Plan-to-VTM Bridge                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────┐         ┌──────────────────┐            │
│  │ VTM CLI       │         │ Plan Domain      │            │
│  │ Extensions    │◄────────┤ Command          │            │
│  │               │         │ /plan:to-vtm     │            │
│  │ - summary     │         └──────────────────┘            │
│  │ - ingest      │                 │                        │
│  └───────────────┘                 │                        │
│         │                          │                        │
│         │                          ▼                        │
│         │                 ┌──────────────────┐             │
│         │                 │ Agent System     │             │
│         │                 │                  │             │
│         │                 │ - ADR Analysis   │             │
│         │                 │ - Spec Parsing   │             │
│         │                 │ - Dep Reasoning  │             │
│         │                 └──────────────────┘             │
│         │                          │                        │
│         ▼                          ▼                        │
│  ┌───────────────────────────────────────┐                │
│  │ Validation Layer                      │                │
│  │                                       │                │
│  │ - task-validator.ts                  │                │
│  │ - Schema validation                  │                │
│  │ - Dependency validation              │                │
│  │ - Circular dependency detection      │                │
│  │ - Task ID assignment                 │                │
│  └───────────────────────────────────────┘                │
│         │                                                   │
│         ▼                                                   │
│  ┌───────────────────────────────────────┐                │
│  │ VTM Storage (vtm.json)                │                │
│  └───────────────────────────────────────┘                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### 1. Task Extraction Flow

```
ADR + Spec Files
      ↓
/plan:to-vtm command
      ↓
Validate ADR+Spec pairing
      ↓
Read files with line numbers
      ↓
Generate VTM summary (--incomplete --json)
      ↓
Launch Agent with: ADR, Spec, VTM Summary
      ↓
Agent outputs: tasks.json
      ↓
Validate output (schema, deps)
      ↓
Generate preview (dependency chains)
      ↓
User confirmation
      ↓
vtm ingest tasks.json
      ↓
Updated vtm.json
```

#### 2. VTM Summary Flow

```
vtm.json
    ↓
Read all tasks
    ↓
Filter: status != 'completed'
    ↓
For completed tasks: extract capabilities summary
    ↓
Generate JSON output:
  - incomplete_tasks: full details
  - completed_capabilities: summaries only
    ↓
Output to stdout (pipe to agent)
```

#### 3. VTM Ingest Flow

```
tasks.json (agent output)
    ↓
validateTaskSchema()
    ↓
validateDependencies()
    ↓
detectCircularDeps()
    ↓
assignTaskIds()
    ↓
generatePreview()
    ↓
User confirms (unless --commit)
    ↓
Atomic append to vtm.json
    ↓
Recalculate stats
```

### Integration Points

- **VTM CLI**: Core task management (src/index.ts, src/lib/)
- **Plan Domain**: Orchestration command (.claude/commands/plan/)
- **Agent**: LLM-based analysis (embedded prompt in command)
- **Validation**: Schema and dependency checks (src/lib/task-validator.ts)

---

## VTM CLI Extensions

### Command: vtm summary

#### Purpose

Generate token-efficient VTM summary for agent consumption, showing incomplete tasks with full details and completed tasks as capability summaries.

#### Signature

```bash
vtm summary [--incomplete] [--json]
```

#### Options

- `--incomplete`: Filter to only incomplete tasks (pending, in-progress, blocked)
- `--json`: Output as JSON instead of human-readable format
- `--output <file>`: Write to file instead of stdout

#### Output Format (JSON)

```json
{
  "project": {
    "name": "Project Name",
    "description": "Project description"
  },
  "stats": {
    "total_tasks": 25,
    "completed": 15,
    "in_progress": 2,
    "pending": 8,
    "blocked": 0
  },
  "incomplete_tasks": [
    {
      "id": "TASK-016",
      "title": "Implement VTM summary command",
      "description": "...",
      "acceptance_criteria": ["AC1", "AC2"],
      "dependencies": ["TASK-001", "TASK-002"],
      "test_strategy": "TDD",
      "risk": "medium",
      "estimated_hours": 3,
      "files": {
        "create": ["src/commands/summary.ts"],
        "modify": ["src/index.ts"]
      },
      "status": "pending"
    }
  ],
  "completed_capabilities": [
    {
      "id": "TASK-001",
      "title": "Set up project structure",
      "files_created": ["src/", "tsconfig.json", "package.json"],
      "capabilities": ["TypeScript compilation", "Project structure"],
      "completed_at": "2025-10-28T11:30:00Z"
    }
  ]
}
```

#### Implementation Details

**Location**: `src/lib/vtm-summary.ts` (new file)

```typescript
export class VTMSummarizer {
  private reader: VTMReader

  constructor(vtmPath?: string) {
    this.reader = new VTMReader(vtmPath)
  }

  async generateSummary(options: {
    incomplete?: boolean
    json?: boolean
  }): Promise<string> {
    const vtm = await this.reader.load()

    const incompleteTasks = vtm.tasks.filter(
      t => t.status !== 'completed'
    )

    const completedCapabilities = vtm.tasks
      .filter(t => t.status === 'completed')
      .map(t => ({
        id: t.id,
        title: t.title,
        files_created: t.files.create,
        capabilities: this.extractCapabilities(t),
        completed_at: t.completed_at
      }))

    if (options.json) {
      return JSON.stringify({
        project: vtm.project,
        stats: vtm.stats,
        incomplete_tasks: incompleteTasks,
        completed_capabilities: completedCapabilities
      }, null, 2)
    }

    // Human-readable format
    return this.formatHumanReadable(incompleteTasks, completedCapabilities)
  }

  private extractCapabilities(task: Task): string[] {
    // Extract capabilities from title and acceptance criteria
    const capabilities = [task.title]

    // Add unique capabilities from ACs
    task.acceptance_criteria.forEach(ac => {
      const cap = this.parseCapability(ac)
      if (cap && !capabilities.includes(cap)) {
        capabilities.push(cap)
      }
    })

    return capabilities
  }

  private parseCapability(ac: string): string | null {
    // Extract core capability from AC
    // E.g., "VTMReader can load and parse vtm.json" → "Load and parse VTM"
    // Implementation: simple heuristics or regex
    return ac.replace(/^.*\s+(can|should|must)\s+/, '').trim()
  }
}
```

**CLI Integration**: Add to `src/index.ts`

```typescript
program
  .command('summary')
  .description('Generate token-efficient VTM summary')
  .option('--incomplete', 'Show only incomplete tasks')
  .option('--json', 'Output as JSON')
  .option('-o, --output <file>', 'Write to file instead of stdout')
  .action(async (options) => {
    try {
      const summarizer = new VTMSummarizer()
      const summary = await summarizer.generateSummary(options)

      if (options.output) {
        await writeFile(options.output, summary, 'utf-8')
        console.error(chalk.green(`✅ Summary written to ${options.output}`))
      } else {
        console.log(summary)
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })
```

#### Token Efficiency

- **Full VTM**: ~10,000 tokens (all tasks with full context)
- **VTM Summary (incomplete)**: ~2,000 tokens (only incomplete + capability summaries)
- **Reduction**: 80% token savings

---

### Command: vtm ingest

#### Purpose

Safely ingest agent-generated tasks into VTM with validation, preview, and atomic writes.

#### Signature

```bash
vtm ingest <json-file> [--preview] [--commit]
```

#### Arguments

- `<json-file>`: Path to JSON file containing tasks (agent output)

#### Options

- `--preview`: Show preview without making changes (default behavior)
- `--commit`: Skip confirmation and commit immediately
- `--validate-only`: Only validate, don't preview or commit

#### Validation Rules

1. **Schema Validation**:
   - All required fields present
   - Correct data types
   - Valid enum values (status, risk, test_strategy)

2. **Dependency Validation**:
   - All dependency IDs exist (in VTM or in new tasks)
   - New tasks can ONLY depend on incomplete tasks
   - No forward references (TASK-010 cannot depend on TASK-011)

3. **Circular Dependency Detection**:
   - Build dependency graph
   - Detect cycles using DFS
   - Report all cycles found

4. **Task ID Assignment**:
   - Find highest existing task ID
   - Assign sequential IDs to new tasks
   - Preserve order from agent output

#### Implementation Details

**Location**: `src/lib/task-validator.ts` (new file)

```typescript
export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  taskIdMapping: Map<number, string> // index → assigned ID
}

export interface ValidationError {
  type: 'schema' | 'dependency' | 'circular' | 'forward_ref'
  taskIndex: number
  field?: string
  message: string
  details?: any
}

export interface ValidationWarning {
  type: 'missing_field' | 'unusual_value'
  taskIndex: number
  field: string
  message: string
}

export class TaskValidator {
  private vtm: VTM | null = null
  private reader: VTMReader

  constructor(vtmPath?: string) {
    this.reader = new VTMReader(vtmPath)
  }

  async validate(tasks: Partial<Task>[]): Promise<ValidationResult> {
    this.vtm = await this.reader.load()

    const errors: ValidationError[] = []
    const warnings: ValidationWarning[] = []
    const taskIdMapping = new Map<number, string>()

    // 1. Schema validation
    tasks.forEach((task, index) => {
      const schemaErrors = this.validateTaskSchema(task, index)
      errors.push(...schemaErrors)
    })

    if (errors.length > 0) {
      return { valid: false, errors, warnings, taskIdMapping }
    }

    // 2. Assign task IDs
    const nextId = this.getNextTaskId()
    tasks.forEach((task, index) => {
      taskIdMapping.set(index, `TASK-${String(nextId + index).padStart(3, '0')}`)
    })

    // 3. Dependency validation
    tasks.forEach((task, index) => {
      const depErrors = this.validateDependencies(
        task,
        index,
        tasks,
        taskIdMapping
      )
      errors.push(...depErrors)
    })

    // 4. Circular dependency detection
    const circularErrors = this.detectCircularDeps(tasks, taskIdMapping)
    errors.push(...circularErrors)

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      taskIdMapping
    }
  }

  private validateTaskSchema(
    task: Partial<Task>,
    index: number
  ): ValidationError[] {
    const errors: ValidationError[] = []
    const required = [
      'title',
      'description',
      'acceptance_criteria',
      'test_strategy',
      'risk',
      'estimated_hours'
    ]

    required.forEach(field => {
      if (!(field in task)) {
        errors.push({
          type: 'schema',
          taskIndex: index,
          field,
          message: `Missing required field: ${field}`
        })
      }
    })

    // Validate enums
    if (task.test_strategy &&
        !['TDD', 'Unit', 'Integration', 'Direct'].includes(task.test_strategy)) {
      errors.push({
        type: 'schema',
        taskIndex: index,
        field: 'test_strategy',
        message: `Invalid test_strategy: ${task.test_strategy}`
      })
    }

    if (task.risk && !['low', 'medium', 'high'].includes(task.risk)) {
      errors.push({
        type: 'schema',
        taskIndex: index,
        field: 'risk',
        message: `Invalid risk: ${task.risk}`
      })
    }

    // Validate arrays
    if (task.acceptance_criteria && !Array.isArray(task.acceptance_criteria)) {
      errors.push({
        type: 'schema',
        taskIndex: index,
        field: 'acceptance_criteria',
        message: 'acceptance_criteria must be an array'
      })
    }

    return errors
  }

  private validateDependencies(
    task: Partial<Task>,
    index: number,
    allTasks: Partial<Task>[],
    taskIdMapping: Map<number, string>
  ): ValidationError[] {
    const errors: ValidationError[] = []

    if (!task.dependencies || task.dependencies.length === 0) {
      return errors
    }

    const assignedId = taskIdMapping.get(index)!
    const assignedNum = this.parseTaskId(assignedId)

    task.dependencies.forEach(depId => {
      // Check if dependency exists in VTM
      const existsInVtm = this.vtm!.tasks.some(t => t.id === depId)

      // Check if dependency exists in new tasks
      const depIndex = Array.from(taskIdMapping.entries()).find(
        ([_, id]) => id === depId
      )?.[0]

      if (!existsInVtm && depIndex === undefined) {
        errors.push({
          type: 'dependency',
          taskIndex: index,
          field: 'dependencies',
          message: `Dependency ${depId} does not exist`,
          details: { dependency: depId }
        })
        return
      }

      // If dependency is in new tasks, check it's incomplete in VTM
      if (existsInVtm) {
        const vtmTask = this.vtm!.tasks.find(t => t.id === depId)!
        if (vtmTask.status === 'completed') {
          // Warning, not error (completed deps are okay)
          return
        }
      }

      // Check for forward references
      const depNum = this.parseTaskId(depId)
      if (depNum >= assignedNum) {
        errors.push({
          type: 'forward_ref',
          taskIndex: index,
          message: `Task ${assignedId} cannot depend on ${depId} (forward reference)`,
          details: { task: assignedId, dependency: depId }
        })
      }
    })

    return errors
  }

  private detectCircularDeps(
    tasks: Partial<Task>[],
    taskIdMapping: Map<number, string>
  ): ValidationError[] {
    const errors: ValidationError[] = []

    // Build adjacency list
    const graph = new Map<string, string[]>()

    // Add existing VTM tasks
    this.vtm!.tasks.forEach(task => {
      graph.set(task.id, task.dependencies)
    })

    // Add new tasks
    tasks.forEach((task, index) => {
      const id = taskIdMapping.get(index)!
      graph.set(id, task.dependencies || [])
    })

    // DFS for cycle detection
    const visited = new Set<string>()
    const recStack = new Set<string>()

    const hasCycle = (node: string, path: string[]): string[] | null => {
      visited.add(node)
      recStack.add(node)
      path.push(node)

      const neighbors = graph.get(node) || []
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const cycle = hasCycle(neighbor, [...path])
          if (cycle) return cycle
        } else if (recStack.has(neighbor)) {
          // Found cycle
          return [...path, neighbor]
        }
      }

      recStack.delete(node)
      return null
    }

    // Check all new tasks for cycles
    taskIdMapping.forEach((id, index) => {
      if (!visited.has(id)) {
        const cycle = hasCycle(id, [])
        if (cycle) {
          errors.push({
            type: 'circular',
            taskIndex: index,
            message: `Circular dependency detected: ${cycle.join(' → ')}`,
            details: { cycle }
          })
        }
      }
    })

    return errors
  }

  private getNextTaskId(): number {
    if (!this.vtm || this.vtm.tasks.length === 0) return 1

    const lastTask = this.vtm.tasks[this.vtm.tasks.length - 1]
    return this.parseTaskId(lastTask.id) + 1
  }

  private parseTaskId(id: string): number {
    return parseInt(id.replace('TASK-', ''), 10)
  }

  generatePreview(
    tasks: Partial<Task>[],
    taskIdMapping: Map<number, string>
  ): string {
    let preview = chalk.bold('\n📋 Task Ingestion Preview\n')
    preview += '━'.repeat(60) + '\n\n'

    tasks.forEach((task, index) => {
      const id = taskIdMapping.get(index)!

      preview += chalk.bold.blue(id) + chalk.gray(` [${task.estimated_hours}h]`) + '\n'
      preview += `  ${task.title}\n`
      preview += chalk.gray(`  Risk: ${task.risk} | Test: ${task.test_strategy}\n`)

      if (task.dependencies && task.dependencies.length > 0) {
        preview += chalk.gray('  Dependencies:\n')
        task.dependencies.forEach(depId => {
          const depTask = this.vtm!.tasks.find(t => t.id === depId)
          if (depTask) {
            const statusIcon = depTask.status === 'completed' ? '✅' : '⏳'
            preview += chalk.gray(`    ${statusIcon} ${depId}: ${depTask.title}\n`)
          }
        })
      }

      preview += '\n'
    })

    preview += chalk.bold('📊 Summary\n')
    preview += `  New tasks: ${tasks.length}\n`
    preview += `  Total dependencies: ${tasks.reduce((sum, t) => sum + (t.dependencies?.length || 0), 0)}\n`

    return preview
  }

  async assignTaskIds(tasks: Partial<Task>[]): Promise<Task[]> {
    const nextId = this.getNextTaskId()

    return tasks.map((task, index) => ({
      ...task,
      id: `TASK-${String(nextId + index).padStart(3, '0')}`,
      status: 'pending',
      started_at: null,
      completed_at: null,
      commits: [],
      blocks: [],
      validation: {
        tests_pass: false,
        ac_verified: []
      }
    } as Task))
  }
}
```

**CLI Integration**: Add to `src/index.ts`

```typescript
program
  .command('ingest <json-file>')
  .description('Ingest agent-generated tasks into VTM')
  .option('--preview', 'Show preview without making changes (default)')
  .option('--commit', 'Skip confirmation and commit immediately')
  .option('--validate-only', 'Only validate, no preview or commit')
  .action(async (jsonFile, options) => {
    try {
      // Read input file
      const content = await readFile(jsonFile, 'utf-8')
      const input = JSON.parse(content) as { tasks: Partial<Task>[] }

      if (!input.tasks || !Array.isArray(input.tasks)) {
        console.error(chalk.red('Invalid input: expected { tasks: [...] }'))
        process.exit(1)
      }

      // Validate
      const validator = new TaskValidator()
      const result = await validator.validate(input.tasks)

      if (!result.valid) {
        console.error(chalk.red('\n❌ Validation failed:\n'))
        result.errors.forEach(err => {
          console.error(chalk.red(`  [${err.type}] Task ${err.taskIndex + 1}: ${err.message}`))
        })
        process.exit(1)
      }

      if (options.validateOnly) {
        console.log(chalk.green('✅ Validation passed'))
        return
      }

      // Show preview
      const preview = validator.generatePreview(input.tasks, result.taskIdMapping)
      console.log(preview)

      // Confirm unless --commit
      if (!options.commit) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        })

        const answer = await new Promise<string>(resolve => {
          rl.question(chalk.yellow('\nCommit these tasks? (y/N): '), resolve)
        })
        rl.close()

        if (answer.toLowerCase() !== 'y') {
          console.log(chalk.gray('Cancelled'))
          return
        }
      }

      // Assign IDs and ingest
      const tasksWithIds = await validator.assignTaskIds(input.tasks)
      const writer = new VTMWriter()
      await writer.appendTasks(tasksWithIds)

      console.log(chalk.green(`\n✅ Added ${tasksWithIds.length} tasks to VTM`))
      console.log(chalk.cyan('\nRun vtm next to see newly available tasks'))
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })
```

**VTMWriter Extension**: Add `appendTasks` method

```typescript
// src/lib/vtm-writer.ts

async appendTasks(tasks: Task[]): Promise<void> {
  const vtm = await this.reader.load(true)

  // Append new tasks
  vtm.tasks.push(...tasks)

  // Recalculate stats
  this.recalculateStats(vtm)

  // Atomic write
  await this.write(vtm)
}
```

---

## Plan Domain Command

### Command: /plan:to-vtm

#### Purpose

Orchestrates the end-to-end transformation of ADR+Spec pairs into validated VTM tasks.

#### Location

`.claude/commands/plan/to-vtm.md`

#### Signature

```bash
/plan:to-vtm <adr-file> <spec-file> [--commit] [--preview-only]
```

#### Arguments

- `<adr-file>`: Path to ADR markdown file
- `<spec-file>`: Path to technical spec markdown file

#### Options

- `--commit`: Auto-commit validated tasks without preview
- `--preview-only`: Show preview without ingesting
- `--output <file>`: Save agent output JSON to file

#### Workflow

```yaml
steps:
  1_validate_inputs:
    - Check ADR file exists
    - Check Spec file exists
    - Verify Spec references ADR (search for ADR filename in Spec)
    - Exit if validation fails

  2_read_source_files:
    - Read ADR with line numbers (cat -n)
    - Read Spec with line numbers (cat -n)
    - Store in variables for agent

  3_generate_vtm_summary:
    - Run: vtm summary --incomplete --json
    - Capture output to temp file
    - Parse JSON for agent context

  4_launch_agent:
    - Construct agent prompt (embedded)
    - Pass: ADR content, Spec content, VTM summary
    - Agent analyzes and outputs tasks.json
    - Save output to temp file

  5_validate_output:
    - Run: vtm ingest tasks.json --validate-only
    - Check validation result
    - Exit if validation fails

  6_generate_preview:
    - Run: vtm ingest tasks.json --preview
    - Show dependency chains
    - Show task summaries

  7_user_confirmation:
    - Unless --commit flag
    - Prompt: "Commit N tasks? (y/N)"
    - Exit if not confirmed

  8_ingest_tasks:
    - Run: vtm ingest tasks.json --commit
    - Show success message
    - Run: vtm next (show newly available tasks)
```

#### Command Implementation

```markdown
---
allowed-tools: Bash(vtm *, cat), Read(*.md), Write(*.json), AskUserQuestion
description: Transform ADR+Spec pairs into VTM tasks with intelligent dependency analysis
argument-hint: <adr-file> <spec-file> [--commit]
---

# Plan: to-vtm

Transform planning documents (ADR + technical specification) into executable VTM tasks with rich context and intelligent dependency analysis.

## Usage

```bash
/plan:to-vtm <adr-file> <spec-file> [--commit] [--preview-only]
```

## Parameters

- `<adr-file>`: Path to ADR markdown file
- `<spec-file>`: Path to technical specification markdown file
- `--commit`: Skip preview and auto-commit (optional)
- `--preview-only`: Show preview without ingesting (optional)

## Examples

```bash
# Interactive mode (default)
/plan:to-vtm docs/adr-002-api-design.md specs/spec-api.md

# Auto-commit mode
/plan:to-vtm docs/adr-002.md specs/spec-api.md --commit

# Preview only
/plan:to-vtm docs/adr-002.md specs/spec-api.md --preview-only
```

## Prerequisites

- VTM CLI installed and linked
- Existing vtm.json in project root
- ADR and Spec files must exist
- Spec must reference ADR

## Implementation

{AGENT_INSTRUCTIONS}

You are transforming planning documents into VTM tasks. Follow these steps precisely:

### Step 1: Validate Inputs

1. Parse arguments:
   - ARG1: adr-file
   - ARG2: spec-file
   - FLAGS: --commit, --preview-only

2. Check files exist:
   ```bash
   if [[ ! -f "$ADR_FILE" ]]; then
     echo "❌ Error: ADR file not found: $ADR_FILE"
     exit 1
   fi

   if [[ ! -f "$SPEC_FILE" ]]; then
     echo "❌ Error: Spec file not found: $SPEC_FILE"
     exit 1
   fi
   ```

3. Verify Spec references ADR:
   ```bash
   ADR_BASENAME=$(basename "$ADR_FILE")
   if ! grep -q "$ADR_BASENAME" "$SPEC_FILE"; then
     echo "⚠️  Warning: Spec does not reference ADR"
     echo "   Expected reference to: $ADR_BASENAME"
     # Prompt user to continue or abort
   fi
   ```

### Step 2: Read Source Files

Use Read tool to read both files with line numbers visible.

```typescript
// Read ADR
const adrContent = await Read(adrFile)

// Read Spec
const specContent = await Read(specFile)
```

### Step 3: Generate VTM Summary

Run vtm summary to get context of incomplete tasks:

```bash
vtm summary --incomplete --json > /tmp/vtm-summary.json
```

Parse the output:
```typescript
const vtmSummary = JSON.parse(await Read('/tmp/vtm-summary.json'))
```

### Step 4: Launch Agent

Construct the agent prompt with:
- ADR content
- Spec content
- VTM summary (incomplete tasks + completed capabilities)

**Agent Prompt Template:**

```
You are a task extraction agent. Analyze the provided ADR and Spec to extract executable VTM tasks.

## Input Documents

### ADR: {adr_file}

{adr_content}

### Spec: {spec_file}

{spec_content}

## Current VTM State

Incomplete tasks: {vtm_summary.incomplete_tasks.length}
Completed capabilities: {vtm_summary.completed_capabilities.length}

### Incomplete Tasks (dependencies must come from these)

{JSON.stringify(vtm_summary.incomplete_tasks, null, 2)}

### Completed Capabilities (reference only, cannot depend on)

{JSON.stringify(vtm_summary.completed_capabilities, null, 2)}

## Task Extraction Instructions

1. **Read the ADR** to understand:
   - Decision context
   - Rationale
   - Constraints
   - Implementation requirements

2. **Read the Spec** to extract:
   - Individual tasks
   - Acceptance criteria
   - Test requirements
   - Code examples
   - File operations

3. **Analyze Dependencies**:
   - Match tasks to incomplete VTM tasks
   - New tasks can ONLY depend on incomplete tasks (pending, in-progress, blocked)
   - DO NOT depend on completed tasks (they're already done!)
   - Use dependency_reasoning to explain each dependency

4. **Extract Rich Context**:
   - Reference specific ADR sections (with line numbers)
   - Reference specific Spec sections (with line numbers)
   - Include code examples from Spec
   - Include constraints from ADR
   - Include test requirements from Spec

5. **Determine Test Strategy**:
   - TDD: High-risk, core logic, requires red-green-refactor
   - Unit: Medium-risk, pure functions, unit tests after
   - Integration: Cross-component, end-to-end testing
   - Direct: Setup/config, manual verification

## Output Format

Output a JSON object with this exact schema:

{
  "tasks": [
    {
      "title": "string",
      "description": "string (detailed, 2-3 sentences)",
      "acceptance_criteria": ["AC1", "AC2", "AC3"],
      "dependencies": ["TASK-XXX"],
      "dependency_reasoning": {
        "TASK-XXX": "explanation of why this dependency exists"
      },
      "test_strategy": "TDD" | "Unit" | "Integration" | "Direct",
      "test_strategy_rationale": "string (explain choice)",
      "priority": "low" | "medium" | "high",
      "risk": "low" | "medium" | "high",
      "estimated_hours": number,
      "files": {
        "create": ["path/to/file.ts"],
        "modify": ["path/to/file.ts"],
        "delete": []
      },
      "context": {
        "adr": {
          "decision": "string (core decision from ADR)",
          "rationale": "string (why decision matters)",
          "constraints": ["constraint1", "constraint2"],
          "relevant_sections": [
            {
              "section": "Implementation Requirements",
              "line_start": 42,
              "line_end": 58,
              "summary": "Brief summary of section"
            }
          ]
        },
        "spec": {
          "acceptance_criteria": ["full AC text"],
          "test_requirements": ["test requirement text"],
          "code_examples": [
            {
              "language": "typescript",
              "code": "example code from spec",
              "line_start": 120,
              "line_end": 135
            }
          ],
          "constraints": ["constraint from spec"],
          "relevant_sections": [
            {
              "section": "CLI Commands",
              "line_start": 71,
              "line_end": 90
            }
          ]
        }
      }
    }
  ]
}

## Quality Checklist

Before outputting, verify:
- [ ] All tasks have clear, actionable titles
- [ ] Descriptions are detailed (not just restating title)
- [ ] Acceptance criteria are testable
- [ ] Dependencies reference ONLY incomplete tasks
- [ ] dependency_reasoning provided for all dependencies
- [ ] Test strategy matches risk level
- [ ] Line references are accurate
- [ ] Code examples extracted where relevant
- [ ] No circular dependencies
- [ ] No forward references (TASK-010 depends on TASK-011)

Output ONLY the JSON, no additional text.
```

Execute agent and save output:
```bash
# Agent execution happens via Claude Code agent system
# Output saved to /tmp/tasks.json
```

### Step 5: Validate Output

```bash
vtm ingest /tmp/tasks.json --validate-only

if [[ $? -ne 0 ]]; then
  echo "❌ Validation failed. Check errors above."
  exit 1
fi
```

### Step 6: Generate Preview

```bash
vtm ingest /tmp/tasks.json --preview > /tmp/preview.txt
cat /tmp/preview.txt
```

### Step 7: User Confirmation

Unless `--commit` or `--preview-only` flag:

```typescript
const answer = await AskUserQuestion({
  questions: [{
    question: `Commit ${taskCount} tasks to VTM?`,
    header: "Confirm",
    multiSelect: false,
    options: [
      {
        label: "Yes, commit tasks",
        description: "Add tasks to vtm.json"
      },
      {
        label: "No, cancel",
        description: "Discard tasks"
      }
    ]
  }]
})

if (answer !== "Yes, commit tasks") {
  console.log("Cancelled")
  exit(0)
}
```

### Step 8: Ingest Tasks

```bash
vtm ingest /tmp/tasks.json --commit

echo ""
echo "✅ Added $TASK_COUNT tasks to VTM"
echo ""
echo "🎯 Next available tasks:"
vtm next -n 3
```

## Output

The command will:
1. Validate ADR+Spec pairing
2. Extract tasks with rich context
3. Analyze dependencies intelligently
4. Show preview with dependency chains
5. Prompt for confirmation (unless --commit)
6. Add validated tasks to VTM
7. Show newly available tasks

## Error Handling

- **Missing files**: Clear error, suggest file paths
- **Invalid ADR+Spec pair**: Warning, prompt to continue
- **Validation errors**: Show all errors, exit
- **Circular dependencies**: Show cycle path, exit
- **Agent errors**: Show agent output, exit

## See Also

- `vtm summary` - Generate VTM summary for agents
- `vtm ingest` - Ingest validated tasks
- `/plan:validate` - Validate ADR+Spec pairs
```

---

## Data Schemas

### Agent Input Schema

```typescript
interface AgentInput {
  adr: {
    file: string
    content: string // with line numbers
  }
  spec: {
    file: string
    content: string // with line numbers
  }
  vtm_summary: {
    project: {
      name: string
      description: string
    }
    stats: VTMStats
    incomplete_tasks: Task[]
    completed_capabilities: CompletedCapability[]
  }
}

interface CompletedCapability {
  id: string
  title: string
  files_created: string[]
  capabilities: string[]
  completed_at: string
}
```

### Agent Output Schema

```typescript
interface AgentOutput {
  tasks: ExtractedTask[]
}

interface ExtractedTask {
  // Core fields (same as Task)
  title: string
  description: string
  acceptance_criteria: string[]
  dependencies: string[]
  test_strategy: 'TDD' | 'Unit' | 'Integration' | 'Direct'
  test_strategy_rationale: string
  risk: 'low' | 'medium' | 'high'
  estimated_hours: number
  files: {
    create: string[]
    modify: string[]
    delete: string[]
  }

  // Additional fields for validation
  dependency_reasoning: {
    [taskId: string]: string
  }

  // Rich context
  context: TaskExtractedContext
}

interface TaskExtractedContext {
  adr: {
    decision: string
    rationale: string
    constraints: string[]
    relevant_sections: RelevantSection[]
  }
  spec: {
    acceptance_criteria: string[]
    test_requirements: string[]
    code_examples: CodeExample[]
    constraints: string[]
    relevant_sections: RelevantSection[]
  }
}

interface RelevantSection {
  section: string // section header
  line_start: number
  line_end: number
  summary?: string
}

interface CodeExample {
  language: string
  code: string
  line_start: number
  line_end: number
  description?: string
}
```

### VTM Task Schema Extensions

Add to `src/lib/types.ts`:

```typescript
// Extend existing Task type
export type Task = {
  // ... existing fields ...

  // NEW: Rich context from extraction
  context?: {
    adr?: {
      decision: string
      rationale: string
      constraints: string[]
      relevant_sections: RelevantSection[]
    }
    spec?: {
      acceptance_criteria: string[]
      test_requirements: string[]
      code_examples: CodeExample[]
      constraints: string[]
      relevant_sections: RelevantSection[]
    }
  }
}

export interface RelevantSection {
  section: string
  line_start: number
  line_end: number
  summary?: string
}

export interface CodeExample {
  language: string
  code: string
  line_start: number
  line_end: number
  description?: string
}
```

---

## Validation System

### Validation Pipeline

```
Agent Output
    ↓
validateTaskSchema()
    ↓
validateDependencies()
    ↓
detectCircularDeps()
    ↓
assignTaskIds()
    ↓
ValidationResult
```

### Validation Rules

#### 1. Schema Validation

**Required Fields:**
- `title` (string, non-empty)
- `description` (string, non-empty)
- `acceptance_criteria` (array, min 1 item)
- `test_strategy` (enum: TDD|Unit|Integration|Direct)
- `risk` (enum: low|medium|high)
- `estimated_hours` (number, > 0)

**Optional Fields:**
- `dependencies` (array of task IDs)
- `files.create` (array of paths)
- `files.modify` (array of paths)
- `files.delete` (array of paths)
- `context` (object with adr/spec)

**Type Validation:**
- All strings must be non-empty after trim
- Arrays must be arrays (not null/undefined)
- Numbers must be positive
- Enums must match allowed values

#### 2. Dependency Validation

**Rules:**
- All dependency IDs must exist (in VTM or new tasks)
- Dependencies must be incomplete (pending, in-progress, or blocked)
- No forward references (TASK-010 cannot depend on TASK-011)
- Dependencies must use TASK-XXX format

**Algorithm:**
```typescript
function validateDependencies(
  task: ExtractedTask,
  index: number,
  allNewTasks: ExtractedTask[],
  existingVtm: VTM
): ValidationError[] {
  const errors: ValidationError[] = []

  task.dependencies?.forEach(depId => {
    // Check existence
    const existsInVtm = existingVtm.tasks.find(t => t.id === depId)
    const existsInNew = allNewTasks.find((_, i) =>
      taskIdMapping.get(i) === depId
    )

    if (!existsInVtm && !existsInNew) {
      errors.push({
        type: 'dependency',
        message: `Dependency ${depId} does not exist`,
        taskIndex: index,
        field: 'dependencies'
      })
      return
    }

    // Check not completed
    if (existsInVtm && existsInVtm.status === 'completed') {
      errors.push({
        type: 'dependency',
        message: `Cannot depend on completed task ${depId}`,
        taskIndex: index,
        field: 'dependencies'
      })
    }

    // Check no forward reference
    const assignedId = taskIdMapping.get(index)!
    if (parseTaskId(depId) >= parseTaskId(assignedId)) {
      errors.push({
        type: 'forward_ref',
        message: `Cannot depend on ${depId} (forward reference)`,
        taskIndex: index,
        field: 'dependencies'
      })
    }
  })

  return errors
}
```

#### 3. Circular Dependency Detection

**Algorithm:** Depth-First Search (DFS)

```typescript
function detectCircularDeps(
  tasks: ExtractedTask[],
  existingVtm: VTM,
  taskIdMapping: Map<number, string>
): ValidationError[] {
  // Build full dependency graph
  const graph = new Map<string, string[]>()

  // Add existing VTM tasks
  existingVtm.tasks.forEach(task => {
    graph.set(task.id, task.dependencies)
  })

  // Add new tasks
  tasks.forEach((task, index) => {
    const id = taskIdMapping.get(index)!
    graph.set(id, task.dependencies || [])
  })

  // DFS with recursion stack
  const visited = new Set<string>()
  const recStack = new Set<string>()

  function dfs(node: string, path: string[]): string[] | null {
    visited.add(node)
    recStack.add(node)
    path.push(node)

    const neighbors = graph.get(node) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        const cycle = dfs(neighbor, [...path])
        if (cycle) return cycle
      } else if (recStack.has(neighbor)) {
        // Cycle detected
        return [...path, neighbor]
      }
    }

    recStack.delete(node)
    return null
  }

  // Check all new tasks
  const errors: ValidationError[] = []
  tasks.forEach((task, index) => {
    const id = taskIdMapping.get(index)!
    if (!visited.has(id)) {
      const cycle = dfs(id, [])
      if (cycle) {
        errors.push({
          type: 'circular',
          taskIndex: index,
          message: `Circular dependency: ${cycle.join(' → ')}`,
          details: { cycle }
        })
      }
    }
  })

  return errors
}
```

#### 4. Task ID Assignment

**Rules:**
- Find highest existing task ID in VTM
- Assign sequential IDs starting from next number
- Preserve order from agent output
- Format: TASK-XXX (3 digits, zero-padded)

```typescript
function assignTaskIds(
  tasks: ExtractedTask[],
  existingVtm: VTM
): Map<number, string> {
  const mapping = new Map<number, string>()

  // Find highest ID
  let maxId = 0
  existingVtm.tasks.forEach(task => {
    const num = parseTaskId(task.id)
    if (num > maxId) maxId = num
  })

  // Assign sequential IDs
  tasks.forEach((task, index) => {
    const id = `TASK-${String(maxId + index + 1).padStart(3, '0')}`
    mapping.set(index, id)
  })

  return mapping
}

function parseTaskId(id: string): number {
  return parseInt(id.replace('TASK-', ''), 10)
}
```

---

## Test Strategy

### Unit Tests

#### test: src/lib/vtm-summary.test.ts

```typescript
describe('VTMSummarizer', () => {
  describe('generateSummary', () => {
    it('filters incomplete tasks correctly', async () => {
      const summarizer = new VTMSummarizer('test-vtm.json')
      const result = await summarizer.generateSummary({
        incomplete: true,
        json: true
      })
      const parsed = JSON.parse(result)

      expect(parsed.incomplete_tasks).toHaveLength(3)
      expect(parsed.incomplete_tasks.every(t =>
        t.status !== 'completed'
      )).toBe(true)
    })

    it('extracts capabilities from completed tasks', async () => {
      const summarizer = new VTMSummarizer('test-vtm.json')
      const result = await summarizer.generateSummary({ json: true })
      const parsed = JSON.parse(result)

      expect(parsed.completed_capabilities).toHaveLength(2)
      expect(parsed.completed_capabilities[0]).toHaveProperty('capabilities')
      expect(Array.isArray(parsed.completed_capabilities[0].capabilities))
        .toBe(true)
    })

    it('outputs human-readable format without --json', async () => {
      const summarizer = new VTMSummarizer('test-vtm.json')
      const result = await summarizer.generateSummary({
        incomplete: true
      })

      expect(result).toContain('Incomplete Tasks')
      expect(result).toContain('Completed Capabilities')
      expect(result).not.toContain('{') // no JSON
    })
  })
})
```

#### test: src/lib/task-validator.test.ts

```typescript
describe('TaskValidator', () => {
  describe('validateTaskSchema', () => {
    it('rejects tasks with missing required fields', async () => {
      const validator = new TaskValidator('test-vtm.json')
      const result = await validator.validate([
        { title: 'Test' } as any // missing description, etc.
      ])

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0].type).toBe('schema')
    })

    it('rejects invalid enum values', async () => {
      const validator = new TaskValidator('test-vtm.json')
      const result = await validator.validate([{
        title: 'Test',
        description: 'Test task',
        acceptance_criteria: ['AC1'],
        test_strategy: 'INVALID' as any,
        risk: 'low',
        estimated_hours: 2,
        files: { create: [], modify: [], delete: [] }
      }])

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'schema',
          field: 'test_strategy'
        })
      )
    })

    it('accepts valid tasks', async () => {
      const validator = new TaskValidator('test-vtm.json')
      const result = await validator.validate([{
        title: 'Implement feature X',
        description: 'Add feature X to the system',
        acceptance_criteria: ['AC1', 'AC2'],
        test_strategy: 'TDD',
        risk: 'medium',
        estimated_hours: 4,
        files: {
          create: ['src/feature-x.ts'],
          modify: [],
          delete: []
        }
      }])

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('validateDependencies', () => {
    it('rejects non-existent dependencies', async () => {
      const validator = new TaskValidator('test-vtm.json')
      const result = await validator.validate([{
        // ... valid task fields ...
        dependencies: ['TASK-999']
      }])

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'dependency',
          message: expect.stringContaining('TASK-999')
        })
      )
    })

    it('rejects dependencies on completed tasks', async () => {
      // Assuming TASK-001 is completed in test-vtm.json
      const validator = new TaskValidator('test-vtm.json')
      const result = await validator.validate([{
        // ... valid task fields ...
        dependencies: ['TASK-001']
      }])

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'dependency',
          message: expect.stringContaining('completed')
        })
      )
    })

    it('rejects forward references', async () => {
      const validator = new TaskValidator('test-vtm.json')
      const tasks = [
        { /* TASK-010 */ dependencies: ['TASK-011'] },
        { /* TASK-011 */ dependencies: [] }
      ]
      const result = await validator.validate(tasks)

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'forward_ref'
        })
      )
    })

    it('accepts valid dependencies', async () => {
      const validator = new TaskValidator('test-vtm.json')
      const result = await validator.validate([{
        // ... valid task fields ...
        dependencies: ['TASK-003'] // pending task
      }])

      expect(result.valid).toBe(true)
    })
  })

  describe('detectCircularDeps', () => {
    it('detects simple circular dependency', async () => {
      const validator = new TaskValidator('test-vtm.json')
      // Artificially create circular dep in test VTM
      const result = await validator.validate([
        { /* TASK-010 */ dependencies: ['TASK-011'] },
        { /* TASK-011 */ dependencies: ['TASK-010'] }
      ])

      expect(result.valid).toBe(false)
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          type: 'circular',
          details: expect.objectContaining({
            cycle: expect.arrayContaining(['TASK-010', 'TASK-011'])
          })
        })
      )
    })

    it('detects complex circular dependency chain', async () => {
      const validator = new TaskValidator('test-vtm.json')
      const result = await validator.validate([
        { /* TASK-010 */ dependencies: ['TASK-011'] },
        { /* TASK-011 */ dependencies: ['TASK-012'] },
        { /* TASK-012 */ dependencies: ['TASK-010'] }
      ])

      expect(result.valid).toBe(false)
      expect(result.errors[0].details.cycle).toEqual([
        'TASK-010', 'TASK-011', 'TASK-012', 'TASK-010'
      ])
    })

    it('allows non-circular dependencies', async () => {
      const validator = new TaskValidator('test-vtm.json')
      const result = await validator.validate([
        { /* TASK-010 */ dependencies: [] },
        { /* TASK-011 */ dependencies: ['TASK-010'] },
        { /* TASK-012 */ dependencies: ['TASK-010', 'TASK-011'] }
      ])

      expect(result.valid).toBe(true)
    })
  })

  describe('assignTaskIds', () => {
    it('assigns sequential IDs starting from next', async () => {
      const validator = new TaskValidator('test-vtm.json')
      // Assume test VTM has tasks up to TASK-005
      const result = await validator.validate([
        { /* task 1 */ },
        { /* task 2 */ },
        { /* task 3 */ }
      ])

      expect(result.taskIdMapping.get(0)).toBe('TASK-006')
      expect(result.taskIdMapping.get(1)).toBe('TASK-007')
      expect(result.taskIdMapping.get(2)).toBe('TASK-008')
    })

    it('pads IDs with zeros', async () => {
      const validator = new TaskValidator('test-vtm.json')
      const result = await validator.validate([{ /* task */ }])

      expect(result.taskIdMapping.get(0)).toMatch(/^TASK-\d{3}$/)
    })
  })

  describe('generatePreview', () => {
    it('shows task summaries', async () => {
      const validator = new TaskValidator('test-vtm.json')
      const tasks = [{
        title: 'Test task',
        description: 'Test description',
        acceptance_criteria: ['AC1'],
        test_strategy: 'TDD',
        risk: 'medium',
        estimated_hours: 3,
        files: { create: [], modify: [], delete: [] }
      }]
      const result = await validator.validate(tasks)
      const preview = validator.generatePreview(tasks, result.taskIdMapping)

      expect(preview).toContain('TASK-')
      expect(preview).toContain('Test task')
      expect(preview).toContain('3h')
      expect(preview).toContain('TDD')
    })

    it('shows dependencies with status', async () => {
      const validator = new TaskValidator('test-vtm.json')
      const tasks = [{
        // ... valid fields ...
        dependencies: ['TASK-003'] // pending
      }]
      const result = await validator.validate(tasks)
      const preview = validator.generatePreview(tasks, result.taskIdMapping)

      expect(preview).toContain('TASK-003')
      expect(preview).toContain('⏳') // pending icon
    })
  })
})
```

### Integration Tests

#### test: integration/plan-to-vtm.integration.test.ts

```typescript
describe('Plan-to-VTM Integration', () => {
  it('transforms ADR+Spec to VTM tasks end-to-end', async () => {
    // Setup test files
    await writeFile('test-adr.md', TEST_ADR_CONTENT)
    await writeFile('test-spec.md', TEST_SPEC_CONTENT)

    // Run /plan:to-vtm (simulated)
    const agent = new TaskExtractionAgent()
    const vtmSummary = await new VTMSummarizer().generateSummary({
      incomplete: true,
      json: true
    })

    const agentOutput = await agent.extract({
      adr: { file: 'test-adr.md', content: TEST_ADR_CONTENT },
      spec: { file: 'test-spec.md', content: TEST_SPEC_CONTENT },
      vtm_summary: JSON.parse(vtmSummary)
    })

    // Validate
    const validator = new TaskValidator('test-vtm.json')
    const result = await validator.validate(agentOutput.tasks)
    expect(result.valid).toBe(true)

    // Ingest
    const tasksWithIds = await validator.assignTaskIds(agentOutput.tasks)
    const writer = new VTMWriter('test-vtm.json')
    await writer.appendTasks(tasksWithIds)

    // Verify
    const reader = new VTMReader('test-vtm.json')
    const vtm = await reader.load(true)
    expect(vtm.tasks.length).toBeGreaterThan(5)

    // Verify dependencies resolve
    const ready = await reader.getReadyTasks()
    expect(ready.length).toBeGreaterThan(0)
  })

  it('handles complex dependency chains correctly', async () => {
    // Setup: VTM with incomplete tasks
    // Agent output: tasks with dependencies on incomplete
    // Verify: dependency chains resolve correctly
    // Verify: vtm next shows unblocking work first
  })

  it('rejects circular dependencies', async () => {
    // Agent output: tasks with circular deps
    // Verify: validation fails
    // Verify: error message shows cycle
  })
})
```

### Agent Tests

#### test: agent/task-extraction.agent.test.ts

```typescript
describe('Task Extraction Agent', () => {
  it('extracts tasks from sample ADR+Spec', async () => {
    const output = await runAgent({
      adr: SAMPLE_ADR,
      spec: SAMPLE_SPEC,
      vtm_summary: SAMPLE_VTM_SUMMARY
    })

    expect(output.tasks).toHaveLength(5)
    expect(output.tasks[0]).toHaveProperty('title')
    expect(output.tasks[0]).toHaveProperty('context')
  })

  it('includes line references in context', async () => {
    const output = await runAgent({
      adr: SAMPLE_ADR,
      spec: SAMPLE_SPEC,
      vtm_summary: SAMPLE_VTM_SUMMARY
    })

    const task = output.tasks[0]
    expect(task.context.adr.relevant_sections).toHaveLength(1)
    expect(task.context.adr.relevant_sections[0]).toHaveProperty('line_start')
    expect(task.context.adr.relevant_sections[0]).toHaveProperty('line_end')
  })

  it('analyzes dependencies intelligently', async () => {
    const output = await runAgent({
      adr: SAMPLE_ADR,
      spec: SAMPLE_SPEC,
      vtm_summary: {
        incomplete_tasks: [
          { id: 'TASK-003', title: 'Setup', status: 'pending' },
          { id: 'TASK-004', title: 'Core', status: 'pending' }
        ]
      }
    })

    const task = output.tasks.find(t =>
      t.title.includes('Build on core')
    )
    expect(task.dependencies).toContain('TASK-004')
    expect(task.dependency_reasoning['TASK-004']).toBeTruthy()
  })

  it('does not depend on completed tasks', async () => {
    const output = await runAgent({
      adr: SAMPLE_ADR,
      spec: SAMPLE_SPEC,
      vtm_summary: {
        incomplete_tasks: [{ id: 'TASK-005', status: 'pending' }],
        completed_capabilities: [
          { id: 'TASK-001', title: 'Setup', capabilities: ['Setup'] }
        ]
      }
    })

    output.tasks.forEach(task => {
      expect(task.dependencies).not.toContain('TASK-001')
    })
  })
})
```

---

## Acceptance Criteria

### VTM CLI Extensions

- [ ] **vtm summary --incomplete --json** outputs filtered tasks
  - [ ] Only incomplete tasks (pending, in-progress, blocked)
  - [ ] Completed tasks as capability summaries
  - [ ] Valid JSON format
  - [ ] Token reduction: 80%+

- [ ] **vtm ingest** validates schema, deps, IDs
  - [ ] Schema validation catches missing fields
  - [ ] Schema validation catches invalid enum values
  - [ ] Dependency validation catches non-existent deps
  - [ ] Dependency validation catches completed deps
  - [ ] Dependency validation catches forward references

- [ ] **vtm ingest** detects circular dependencies
  - [ ] Simple cycles detected (A → B → A)
  - [ ] Complex cycles detected (A → B → C → A)
  - [ ] Error message shows full cycle path

- [ ] **vtm ingest --preview** shows dependency chains
  - [ ] Task summaries with IDs
  - [ ] Dependencies with status icons
  - [ ] Risk and test strategy visible
  - [ ] Human-readable format

- [ ] **All tests passing** (80%+ coverage)
  - [ ] Unit tests: vtm-summary.test.ts
  - [ ] Unit tests: task-validator.test.ts
  - [ ] Integration tests: plan-to-vtm.integration.test.ts
  - [ ] Agent tests: task-extraction.agent.test.ts

### Plan Domain Command

- [ ] **/plan:to-vtm** validates ADR+Spec pairing
  - [ ] Checks ADR file exists
  - [ ] Checks Spec file exists
  - [ ] Verifies Spec references ADR
  - [ ] Warns if pairing invalid

- [ ] **Agent extracts rich context** with line refs
  - [ ] ADR context: decision, rationale, constraints
  - [ ] Spec context: ACs, tests, code examples
  - [ ] Line references accurate
  - [ ] Code examples extracted

- [ ] **Agent analyzes dependencies** intelligently
  - [ ] Matches tasks to incomplete VTM tasks
  - [ ] Provides dependency reasoning
  - [ ] Does not depend on completed tasks
  - [ ] No circular dependencies

- [ ] **Preview shows dependency reasoning**
  - [ ] Each dependency explained
  - [ ] Dependency chains visualized
  - [ ] Task order logical

- [ ] **User confirmation required** (unless --commit)
  - [ ] Interactive prompt shown
  - [ ] Preview before prompt
  - [ ] Cancellation works
  - [ ] --commit skips confirmation

### Integration

- [ ] **New tasks at correct position**
  - [ ] Tasks blocked until deps complete
  - [ ] Stats recalculated correctly
  - [ ] Task IDs sequential

- [ ] **/vtm:next shows unblocking work first**
  - [ ] Ready tasks have met dependencies
  - [ ] Order respects dependencies
  - [ ] Newly available tasks visible

- [ ] **No code duplication** (src/ single source)
  - [ ] VTM CLI in src/
  - [ ] Plan command in .claude/
  - [ ] No logic duplication

- [ ] **End-to-end workflow smooth**
  - [ ] ADR+Spec → tasks → vtm.json
  - [ ] Errors clear and actionable
  - [ ] Performance acceptable (<10s)

---

## Implementation Checklist

### Phase 1: VTM CLI Extensions (src/)

- [ ] Create `src/lib/vtm-summary.ts`
  - [ ] VTMSummarizer class
  - [ ] generateSummary() method
  - [ ] extractCapabilities() method
  - [ ] JSON and human-readable formats

- [ ] Add `vtm summary` command to `src/index.ts`
  - [ ] --incomplete flag
  - [ ] --json flag
  - [ ] --output flag
  - [ ] Error handling

- [ ] Create `src/lib/task-validator.ts`
  - [ ] TaskValidator class
  - [ ] validate() method
  - [ ] validateTaskSchema() method
  - [ ] validateDependencies() method
  - [ ] detectCircularDeps() method (DFS)
  - [ ] assignTaskIds() method
  - [ ] generatePreview() method

- [ ] Add `vtm ingest` command to `src/index.ts`
  - [ ] JSON file input
  - [ ] --preview flag (default)
  - [ ] --commit flag
  - [ ] --validate-only flag
  - [ ] User confirmation prompt
  - [ ] Error handling

- [ ] Update `src/lib/vtm-writer.ts`
  - [ ] Add appendTasks() method
  - [ ] Atomic write for batch append
  - [ ] Stats recalculation

- [ ] Update `src/lib/types.ts`
  - [ ] Add TaskExtractedContext interface
  - [ ] Add RelevantSection interface
  - [ ] Add CodeExample interface
  - [ ] Extend Task type with context field

### Phase 2: Unit Tests

- [ ] Write `src/lib/vtm-summary.test.ts`
  - [ ] Test incomplete filtering
  - [ ] Test capability extraction
  - [ ] Test JSON output
  - [ ] Test human-readable output

- [ ] Write `src/lib/task-validator.test.ts`
  - [ ] Test schema validation
  - [ ] Test dependency validation
  - [ ] Test circular dependency detection
  - [ ] Test task ID assignment
  - [ ] Test preview generation

- [ ] Achieve 80%+ unit test coverage

### Phase 3: Plan Domain Command (.claude/)

- [ ] Create `.claude/commands/plan/to-vtm.md`
  - [ ] Command metadata (frontmatter)
  - [ ] Usage documentation
  - [ ] Step-by-step implementation
  - [ ] Embedded agent prompt
  - [ ] Error handling

- [ ] Test command manually with sample ADR+Spec

### Phase 4: Integration Tests

- [ ] Write `test/integration/plan-to-vtm.integration.test.ts`
  - [ ] End-to-end flow test
  - [ ] Complex dependency chains test
  - [ ] Circular dependency rejection test

- [ ] Write `test/agent/task-extraction.agent.test.ts`
  - [ ] Sample ADR+Spec extraction
  - [ ] Line reference accuracy
  - [ ] Dependency analysis
  - [ ] No completed task dependencies

- [ ] Test with real ADR+Spec files from examples/

### Phase 5: Documentation

- [ ] Update `README.md`
  - [ ] Add Plan-to-VTM Bridge section
  - [ ] Add workflow diagram
  - [ ] Add usage examples

- [ ] Create `docs/plan-to-vtm-guide.md`
  - [ ] Detailed user guide
  - [ ] Best practices
  - [ ] Troubleshooting

- [ ] Update `CLAUDE.md`
  - [ ] Add new commands
  - [ ] Add new lib files
  - [ ] Update architecture section

---

## Performance Requirements

### VTM Summary

- **Execution Time**: < 500ms for 100 tasks
- **Memory Usage**: < 10MB for 100 tasks
- **Token Reduction**: 80%+ vs full VTM
- **Output Size**: ~2000 tokens for 50 incomplete tasks

### VTM Ingest

- **Validation Time**: < 1s for 20 tasks
- **Execution Time**: < 2s for 20 tasks
- **Circular Dep Detection**: < 500ms for 100 node graph
- **Memory Usage**: < 20MB for 100 tasks

### Plan-to-VTM Command

- **End-to-End Time**: < 10s (excluding agent time)
- **Agent Time**: Variable (30s-120s depending on complexity)
- **File Reading**: < 100ms for typical ADR+Spec
- **Preview Generation**: < 500ms

### Scalability

- **Max Tasks in VTM**: 1000 (recommended)
- **Max Tasks per Ingest**: 50 (recommended)
- **Max Dependency Depth**: 20 levels
- **Max Task ID**: TASK-999 (3 digits)

---

## Error Handling

### VTM Summary Errors

| Error | Cause | Message | Exit Code |
|-------|-------|---------|-----------|
| VTM not found | vtm.json missing | "VTM file not found at {path}" | 1 |
| Invalid VTM | Corrupted JSON | "Invalid VTM: {parse error}" | 1 |
| Write failed | Output file error | "Failed to write to {file}" | 1 |

### VTM Ingest Errors

| Error | Cause | Message | Exit Code |
|-------|-------|---------|-----------|
| File not found | Input JSON missing | "Input file not found: {path}" | 1 |
| Invalid JSON | Malformed JSON | "Invalid JSON: {parse error}" | 1 |
| Schema validation | Missing/invalid fields | "Validation failed: {errors}" | 1 |
| Dependency error | Non-existent deps | "Dependency {id} does not exist" | 1 |
| Circular deps | Cycle detected | "Circular dependency: {cycle}" | 1 |
| Forward reference | Invalid dep order | "Cannot depend on {id} (forward ref)" | 1 |
| Write failed | vtm.json write error | "Failed to write VTM: {error}" | 1 |

### Plan-to-VTM Errors

| Error | Cause | Message | Exit Code |
|-------|-------|---------|-----------|
| ADR not found | Missing file | "ADR file not found: {path}" | 1 |
| Spec not found | Missing file | "Spec file not found: {path}" | 1 |
| Invalid pairing | No ADR reference | "Spec does not reference ADR" | 0 (warning) |
| Agent error | Agent failed | "Agent failed: {error}" | 1 |
| Validation error | Invalid output | "Validation failed: {errors}" | 1 |
| User cancelled | Declined confirmation | "Cancelled" | 0 |

### Error Message Format

All error messages follow this format:

```
❌ Error: {message}

Context:
  File: {file}
  Line: {line}
  Details: {details}

Suggestion:
  {actionable suggestion}
```

Example:

```
❌ Error: Circular dependency detected

Context:
  Cycle: TASK-010 → TASK-011 → TASK-012 → TASK-010
  Task: TASK-010 (Implement feature X)

Suggestion:
  Remove one of these dependencies to break the cycle:
    - TASK-012 → TASK-010
```

---

## Appendix

### Sample Agent Prompt (Full)

See [Plan Domain Command: Agent Prompt Template](#plan-domain-command) above.

### Sample VTM Summary Output

```json
{
  "project": {
    "name": "VTM CLI",
    "description": "Token-efficient task management for Claude Code"
  },
  "stats": {
    "total_tasks": 25,
    "completed": 15,
    "in_progress": 2,
    "pending": 8,
    "blocked": 0
  },
  "incomplete_tasks": [
    {
      "id": "TASK-016",
      "title": "Implement VTM summary command",
      "description": "Create vtm summary command with --incomplete and --json flags...",
      "acceptance_criteria": [
        "vtm summary --incomplete filters to non-completed tasks",
        "vtm summary --json outputs valid JSON",
        "Token reduction of 80%+ achieved"
      ],
      "dependencies": ["TASK-001", "TASK-002"],
      "test_strategy": "TDD",
      "risk": "medium",
      "estimated_hours": 3,
      "files": {
        "create": ["src/lib/vtm-summary.ts", "src/lib/vtm-summary.test.ts"],
        "modify": ["src/index.ts"],
        "delete": []
      },
      "status": "pending"
    }
  ],
  "completed_capabilities": [
    {
      "id": "TASK-001",
      "title": "Set up project structure",
      "files_created": [
        "package.json",
        "tsconfig.json",
        "src/index.ts",
        "src/lib/types.ts"
      ],
      "capabilities": [
        "TypeScript compilation",
        "Project structure",
        "Build system"
      ],
      "completed_at": "2025-10-28T11:30:00Z"
    }
  ]
}
```

### Sample Agent Output

```json
{
  "tasks": [
    {
      "title": "Create VTMSummarizer class",
      "description": "Implement VTMSummarizer class that generates token-efficient summaries by filtering incomplete tasks and extracting capabilities from completed tasks.",
      "acceptance_criteria": [
        "VTMSummarizer.generateSummary() returns JSON with incomplete_tasks and completed_capabilities",
        "Incomplete tasks include all fields",
        "Completed tasks reduced to capabilities summary",
        "Token reduction of 80%+ achieved"
      ],
      "dependencies": ["TASK-002"],
      "dependency_reasoning": {
        "TASK-002": "Requires VTMReader to load and filter tasks from vtm.json"
      },
      "test_strategy": "TDD",
      "test_strategy_rationale": "Core data transformation logic requires comprehensive unit tests to ensure correct filtering and capability extraction",
      "risk": "medium",
      "estimated_hours": 3,
      "files": {
        "create": [
          "src/lib/vtm-summary.ts",
          "src/lib/vtm-summary.test.ts"
        ],
        "modify": [],
        "delete": []
      },
      "context": {
        "adr": {
          "decision": "Use token-efficient summaries to reduce context size for agents",
          "rationale": "Full VTM context (~10,000 tokens) exceeds typical agent budgets. Filtering to incomplete tasks + capability summaries reduces to ~2,000 tokens.",
          "constraints": [
            "Must preserve all information needed for dependency analysis",
            "Must be parseable by agents (JSON format)",
            "Must maintain traceability to original tasks"
          ],
          "relevant_sections": [
            {
              "section": "Token Efficiency Requirements",
              "line_start": 42,
              "line_end": 58,
              "summary": "Specifies 80%+ token reduction requirement and JSON output format"
            }
          ]
        },
        "spec": {
          "acceptance_criteria": [
            "VTMSummarizer.generateSummary() returns JSON with incomplete_tasks and completed_capabilities",
            "Incomplete tasks include all fields",
            "Completed tasks reduced to capabilities summary"
          ],
          "test_requirements": [
            "Unit test filtering logic",
            "Unit test capability extraction",
            "Unit test JSON output format",
            "Integration test with real VTM files"
          ],
          "code_examples": [
            {
              "language": "typescript",
              "code": "const summarizer = new VTMSummarizer()\nconst summary = await summarizer.generateSummary({ incomplete: true, json: true })\nconst parsed = JSON.parse(summary)",
              "line_start": 120,
              "line_end": 123,
              "description": "Usage example from spec"
            }
          ],
          "constraints": [
            "Must use VTMReader for file access",
            "Must handle missing vtm.json gracefully",
            "Must support both JSON and human-readable output"
          ],
          "relevant_sections": [
            {
              "section": "VTM Summary Implementation",
              "line_start": 85,
              "line_end": 145
            }
          ]
        }
      }
    }
  ]
}
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-10-29 | VTM Core Team | Initial specification |

---

**End of Specification**
