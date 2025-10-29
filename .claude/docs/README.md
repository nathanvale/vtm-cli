# VTM CLI - Virtual Task Manager

> Token-efficient task management for Claude Code projects

## 🎯 What is VTM?

VTM (Virtual Task Manager) is a CLI tool designed to manage development tasks
efficiently when working with Claude Code. It solves the problem of token bloat
by providing surgical access to your task manifest instead of loading everything
into context.

### Key Benefits

- **99% token reduction** - Load only what you need
- **TDD-first workflow** - Test strategies built into every task
- **Dependency tracking** - Never start tasks out of order
- **Progress visibility** - Always know what's next
- **Claude-optimized** - Designed for AI-assisted development

## 📦 Installation

### Quick Start

\`\`\`bash

# Clone or extract this package

cd vtm-cli

# Install dependencies

npm install

# Build TypeScript

npm run build

# Link globally (optional)

npm link

# Verify installation

vtm --version \`\`\`

### Development Mode

\`\`\`bash

# Run without building

npm run dev -- next

# Watch mode

npm run dev \`\`\`

## 🚀 Usage

### Initialize Your Project

1. **Create your VTM structure**: \`\`\`bash mkdir my-project cd my-project
   mkdir -p adr specs \`\`\`

2. **Copy example files**: \`\`\`bash cp ../vtm-cli/examples/vtm-example.json
   ./vtm.json \`\`\`

3. **Start using VTM**: \`\`\`bash vtm next \`\`\`

### Core Commands

#### \`vtm next\` - See What's Ready

Shows tasks with all dependencies met: \`\`\`bash vtm next

📋 Ready Tasks (3):

TASK-003 [3h] │ Implement VTMWriter with atomic writes Risk: high │ Test: TDD
Deps: ✅ TASK-001 From: adr-001-task-manager.md

TASK-004 [2h] │ Implement ContextBuilder Risk: low │ Test: Unit Deps: ✅
TASK-002 From: adr-001-task-manager.md \`\`\`

**Token cost**: ~500 tokens (vs 50,000+ for full manifest)

#### \`vtm context <id>\` - Get Context for Claude

Generates minimal context package: \`\`\`bash vtm context TASK-003

# Task Context: TASK-003

## Task Details

**Title**: Implement VTMWriter with atomic writes **Status**: pending **Test
Strategy**: TDD **Risk**: high **Estimated**: 3h

## Acceptance Criteria

- AC1: updateTask() modifies single task without corruption
- AC2: Atomic write prevents partial writes on crash
- AC3: Stats automatically recalculated on update
- AC4: Invalid updates rejected with clear errors

## Dependencies (1 completed)

✅ TASK-001: Set up project structure Files created: package.json,
tsconfig.json, src/index.ts

## Files to Create

- src/lib/vtm-writer.ts
- src/lib/vtm-writer.test.ts

... \`\`\`

**Token cost**: ~2,000 tokens

**Options**:

- \`--compact\` - Ultra-minimal format (~500 tokens)
- \`--clipboard\` - Copy directly to clipboard

#### \`vtm start <id>\` - Begin Task

Mark task as in-progress: \`\`\`bash vtm start TASK-003

✅ Task TASK-003 marked as in-progress 📅 Started at: 2025-10-29T...

Next steps:

1. vtm context TASK-003
2. Copy to Claude Code
3. Run TDD cycle
4. vtm complete TASK-003 \`\`\`

#### \`vtm complete <id>\` - Finish Task

Mark task completed with metadata: \`\`\`bash vtm complete TASK-003 \\ --commits
"a1b2c3d,e4f5g6h" \\ --files-created
"src/lib/vtm-writer.ts,src/lib/vtm-writer.test.ts" \\ --tests-pass

✅ Task TASK-003 marked as completed 📅 Completed at: 2025-10-29T...

📊 Updated Stats: Completed: 3/5 Progress: 60.0%

🚀 New tasks available: TASK-005: Implement CLI commands \`\`\`

#### \`vtm stats\` - Project Overview

See progress across all ADRs: \`\`\`bash vtm stats

📊 Project Statistics ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ Total Tasks: 5
Completed: 2 (40.0%) In Progress: 0 Pending: 3

📈 Progress by ADR: adr-001-task-manager.md ████░░░░░░░░ 40% (2/5)

🎯 Current Status: Ready to Start: 2 \`\`\`

#### \`vtm list\` - Filter Tasks

List tasks with filters: \`\`\`bash

# All pending tasks

vtm list --status pending

# All tasks from specific ADR

vtm list --adr adr-001

# Get task details as JSON

vtm task TASK-003 --json \`\`\`

## 🔄 Typical Workflow

### 1. Plan Phase (One-time)

\`\`\`bash

# Write your ADRs and specs

vim adr/adr-001-feature.md vim specs/spec-feature.md

# Generate VTM from ADRs (using Claude)

# [Copy PROMPT 1 from documentation]

# Paste ADR content to Claude → generates vtm.json

\`\`\`

### 2. Execute Phase (Iterative)

\`\`\`bash

# See what's ready

vtm next

# Pick a task

vtm start TASK-003

# Get context for Claude

vtm context TASK-003 > task-context.md

# Work with Claude Code using TDD

# [Copy PROMPT 2 from documentation]

# Paste task context → Claude implements with tests

# Mark complete

vtm complete TASK-003 --commits "abc123" --tests-pass

# Repeat

vtm next \`\`\`

### 3. Evolve Phase (As Needed)

\`\`\`bash

# Add new feature

vim adr/adr-002-new-feature.md vim specs/spec-new-feature.md

# Generate new tasks (using Claude)

# [Copy PROMPT 3 from documentation]

# Claude generates new tasks → append to vtm.json

# Continue execution phase

vtm next \`\`\`

## 📁 Project Structure

\`\`\` my-project/ ├── adr/ # Architecture Decision Records │ ├──
adr-001-feature-a.md │ └── adr-002-feature-b.md ├── specs/ # Technical
Specifications │ ├── spec-feature-a.md │ └── spec-feature-b.md ├── vtm.json #
Task manifest (generated) └── src/ # Your actual code └── ... \`\`\`

## 🎨 VTM JSON Schema

### Minimal Example

\`\`\`json { "version": "2.0.0", "project": { "name": "My Project",
"description": "Project description" }, "stats": { "total_tasks": 5,
"completed": 2, "in_progress": 0, "pending": 3, "blocked": 0 }, "tasks": [ {
"id": "TASK-001", "adr_source": "adr-001.md", "spec_source": "spec-001.md",
"title": "Task title", "description": "Detailed description",
"acceptance_criteria": [ "AC1: Specific, testable criterion", "AC2: Another
criterion" ], "dependencies": [], "blocks": ["TASK-002"], "test_strategy":
"TDD", "test_strategy_rationale": "Why this strategy", "estimated_hours": 3,
"risk": "medium", "files": { "create": ["src/file.ts"], "modify": [], "delete":
[] }, "status": "pending", "started_at": null, "completed_at": null, "commits":
[], "validation": { "tests_pass": false, "ac_verified": [] } } ] } \`\`\`

## 🔧 Advanced Usage

### Custom VTM Location

\`\`\`bash

# Use different VTM file

export VTM_PATH="./custom-vtm.json" vtm next \`\`\`

### Scripting

\`\`\`bash

# Get JSON output for scripts

vtm task TASK-001 --json | jq '.acceptance_criteria'

# Check if tasks are ready

if [ \$(vtm next --number 1 | wc -l) -gt 0 ]; then echo "Tasks available!" fi
\`\`\`

### Integration with Git

\`\`\`bash

# Commit after each task

vtm complete TASK-003 --commits \$(git rev-parse HEAD) --tests-pass git add .
git commit -m "feat(TASK-003): implement atomic writes" \`\`\`

## 📊 Token Efficiency Comparison

| Action           | Without VTM   | With VTM     | Savings   |
| ---------------- | ------------- | ------------ | --------- |
| View next tasks  | 50,000 tokens | 500 tokens   | **99%**   |
| Get task context | 50,000 tokens | 2,000 tokens | **96%**   |
| Update task      | 50,000 tokens | 100 tokens   | **99.8%** |
| View stats       | 50,000 tokens | 300 tokens   | **99.4%** |

For a project with 200 tasks, VTM saves **~95,000 tokens per interaction**.

## 🐛 Troubleshooting

### "VTM file not found"

\`\`\`bash

# Make sure you're in the project directory

cd my-project

# Check if vtm.json exists

ls -la vtm.json

# Copy example if needed

cp /path/to/vtm-cli/examples/vtm-example.json ./vtm.json \`\`\`

### "Task not found"

\`\`\`bash

# List all tasks to find correct ID

vtm list

# Check specific ADR tasks

vtm list --adr adr-001 \`\`\`

### Command not found: vtm

\`\`\`bash

# Make sure it's linked

cd vtm-cli npm run build npm link

# Or use npx

npx vtm next

# Or use npm script

npm run start -- next \`\`\`

## 📚 Documentation

- **ADR Template**: See \`examples/adr/\`
- **Spec Template**: See \`examples/specs/\`
- **Full VTM Example**: See \`examples/vtm-example.json\`

## 🤝 Contributing

This is a reference implementation. Feel free to:

- Add new commands (\`src/index.ts\`)
- Extend data model (\`src/lib/types.ts\`)
- Improve context generation (\`src/lib/context-builder.ts\`)
- Add tests

## 📝 License

MIT

## 🎯 Next Steps

1. **Try the example**: \`cd examples && vtm next\`
2. **Create your first ADR**: Use the template in \`examples/adr/\`
3. **Generate tasks**: Use Claude with PROMPT 1
4. **Start building**: \`vtm next && vtm context <id>\`

Happy coding with Claude! 🚀
