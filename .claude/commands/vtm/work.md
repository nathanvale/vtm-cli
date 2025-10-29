---
allowed-tools: Bash(vtm *)
description: Start a task and display its context in one step
argument-hint: <task-id> [mode]
---

# VTM: Work

Start working on a task by marking it in-progress and displaying its context automatically. This streamlines the workflow by combining `/vtm:start`, `/vtm:context`, and session tracking into a single command.

## Usage

```bash
/vtm:work <task-id> [mode]
```

## Parameters

- `task-id` (required): Task ID to work on (e.g., TASK-003)
- `mode` (optional): Context mode - "minimal" or "compact" (default: minimal)

## Examples

```bash
/vtm:work TASK-003              # Start task with full context (~2000 tokens)
/vtm:work TASK-003 compact      # Start task with ultra-compact context (~500 tokens)
```

## Implementation

```bash
#!/bin/bash

# Parse arguments
TASK_ID="${ARGUMENTS[0]}"
MODE="${ARGUMENTS[1]:-minimal}"

if [[ -z "$TASK_ID" ]]; then
    echo "❌ Error: Task ID is required"
    echo ""
    echo "Usage: /vtm:work TASK-XXX [mode]"
    echo ""
    echo "Examples:"
    echo "  /vtm:work TASK-003"
    echo "  /vtm:work TASK-003 compact"
    echo ""
    echo "Modes:"
    echo "  minimal - Full context with dependencies (~2000 tokens)"
    echo "  compact - Ultra-minimal context (~500 tokens)"
    exit 1
fi

# Validate vtm CLI is available
if ! command -v vtm &> /dev/null; then
    echo "❌ Error: vtm CLI not found"
    echo ""
    echo "Install: npm link"
    exit 1
fi

# Check if vtm.json exists
if [[ ! -f "vtm.json" ]]; then
    echo "❌ Error: No vtm.json found in current directory"
    exit 1
fi

echo "🚀 Starting work on: $TASK_ID"
echo ""

# Step 1: Start the task (mark as in-progress)
echo "▶️  Marking task as in-progress..."
vtm start "$TASK_ID"

if [[ $? -ne 0 ]]; then
    echo ""
    echo "❌ Failed to start task"
    echo ""
    echo "Common issues:"
    echo "   • Task may have unmet dependencies (check /vtm:task $TASK_ID)"
    echo "   • Task ID might be invalid (check /vtm:list)"
    echo "   • Task may already be in-progress or completed"
    exit 1
fi

# Set session state after successful start
vtm session set "$TASK_ID" > /dev/null 2>&1

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 2: Display task context
echo "📋 Task Context ($MODE mode):"
echo ""

if [[ "$MODE" == "compact" ]]; then
    vtm context "$TASK_ID" --compact
else
    vtm context "$TASK_ID"
fi

if [[ $? -ne 0 ]]; then
    echo ""
    echo "⚠️  Warning: Failed to retrieve task context"
    echo "Task is still marked as in-progress."
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 3: Provide next steps guidance
echo "✅ Ready to work on $TASK_ID"
echo ""
echo "💡 Next steps:"
echo "   1. Review the task context above"
echo "   2. Implement according to test_strategy"
echo "   3. Follow TDD workflow (Red-Green-Refactor) if applicable"
echo "   4. When complete: /vtm:done"
echo ""
echo "Additional commands:"
echo "   • View task details: /vtm:task $TASK_ID"
echo "   • Check progress: /vtm:stats"
echo "   • Switch tasks: /vtm:work TASK-XXX"
echo ""
```

## What This Command Does

The `/vtm:work` command streamlines your workflow by:

1. **Marking task as in-progress**: Changes status from `pending` → `in-progress`
2. **Setting session state**: Tracks this as your current task automatically
3. **Displaying task context**: Shows full task details with dependencies
4. **Providing next steps**: Reminds you of completion workflow

## Token Efficiency

Context modes available:

- **minimal** (~2000 tokens): Full context with all dependencies resolved
- **compact** (~500 tokens): Ultra-minimal for simple tasks

## Before Starting

Ensure the task is ready:

- All dependencies completed (shows as "ready" in `/vtm:next`)
- Task status is `pending`
- You understand the acceptance criteria

## Completing Your Work

When you're done implementing the task:

```bash
/vtm:done        # Mark current task as complete and find next task
```

Or explicitly:

```bash
/vtm:complete TASK-003
```

## Workflow Comparison

**Traditional workflow:**

```bash
/vtm:start TASK-003      # Step 1: Mark in-progress
/vtm:context TASK-003    # Step 2: Get context
# Implement...
/vtm:complete TASK-003   # Step 3: Mark complete
```

**Streamlined workflow:**

```bash
/vtm:work TASK-003       # Steps 1+2 combined!
# Implement...
/vtm:done               # Step 3: Complete current task
```

## Session State Integration

The command automatically sets session state when you start a task. This enables:

- `/vtm:done` to complete the current task without specifying ID
- Session persistence across Claude Code restarts
- Better workflow continuity
- Automatic tracking of your current task via `vtm session get`

Session state is only set if `vtm start` succeeds, ensuring consistency between task status and session tracking.

## See Also

- `/vtm:done` - Complete current task and find next
- `/vtm:next` - Find ready tasks
- `/vtm:task` - View full task details
- `/vtm:stats` - View progress
