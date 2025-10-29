# Quick Start Guide

Get up and running with VTM in 5 minutes.

## Step 1: Install (1 min)

\`\`\`bash
cd vtm-cli
npm install
npm run build
npm link
\`\`\`

## Step 2: Try the Example (1 min)

\`\`\`bash

# Copy example to test directory

mkdir ~/vtm-test
cp examples/vtm-example.json ~/vtm-test/vtm.json
cd ~/vtm-test

# See what's ready

vtm next

# Get context for a task

vtm context TASK-003
\`\`\`

## Step 3: Start Your Project (3 min)

\`\`\`bash

# Create project structure

mkdir my-project
cd my-project
mkdir -p adr specs

# Write your first ADR

cat > adr/adr-001-example.md << 'EOF'

# ADR-001: Example Feature

## Decision

Build a simple hello world CLI tool.

## Implementation

- Command: \`hello <name>\`
- Output: "Hello, {name}!"
- Test: Unit tests with Jest
  EOF

# Write corresponding spec

cat > specs/spec-example.md << 'EOF'

# Spec: Hello World CLI

## Requirements

1. CLI accepts name argument
2. Outputs greeting message
3. Handles missing name gracefully
   EOF

# Generate VTM using Claude

# Copy prompts/1-generate-vtm.md

# Paste your ADR + spec to Claude

# Claude generates vtm.json → save it here

# Start working

vtm next
vtm start TASK-001
vtm context TASK-001
\`\`\`

## Typical Workflow

\`\`\`bash

# 1. See what's ready

vtm next

# 2. Start a task

vtm start TASK-003

# 3. Get context for Claude

vtm context TASK-003 > context.md

# 4. Work with Claude Code

# - Copy context to Claude

# - Use prompts/2-execute-task.md

# - Claude implements with TDD

# 5. Mark complete

vtm complete TASK-003 \\
--commits "abc123" \\
--files-created "src/writer.ts" \\
--tests-pass

# 6. Check progress

vtm stats

# 7. Repeat

vtm next
\`\`\`

## Commands Cheat Sheet

\`\`\`bash
vtm next # Show ready tasks
vtm context <id> # Get task context
vtm start <id> # Begin task
vtm complete <id> # Finish task
vtm stats # Project overview
vtm list # All tasks
vtm task <id> # Single task details
\`\`\`

## Token Savings

Before VTM:

- Load full manifest: **50,000 tokens**
- Every command: **50,000 tokens**

With VTM:

- See next tasks: **500 tokens** (99% savings)
- Get task context: **2,000 tokens** (96% savings)
- Update status: **100 tokens** (99.8% savings)

## Next Steps

1. Read full [README.md](./README.md)
2. Review [example ADR](./examples/adr/adr-001-task-manager.md)
3. Try the [prompts](./prompts/)
4. Build something! 🚀
