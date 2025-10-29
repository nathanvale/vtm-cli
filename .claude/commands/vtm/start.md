---
allowed-tools: Bash(vtm *)
description: Mark a task as in-progress
argument-hint: <task-id>
---

# VTM: Start

Mark a task as in-progress to track active work.

## Usage

```bash
/vtm:start <task-id>
```

## Parameters

- `task-id` (required): Task ID to start (e.g., TASK-003)

## Examples

```bash
/vtm:start TASK-003
```

## Implementation

```bash
#!/bin/bash

# Parse arguments
TASK_ID="${ARGUMENTS[0]}"
FORCE_FLAG=""

# Check for --force flag
if [[ "${ARGUMENTS[1]}" == "--force" ]] || [[ "${ARGUMENTS[0]}" == "--force" ]]; then
    FORCE_FLAG="--force"
    # If --force is first arg, task ID is second
    if [[ "${ARGUMENTS[0]}" == "--force" ]]; then
        TASK_ID="${ARGUMENTS[1]}"
    fi
fi

if [[ -z "$TASK_ID" ]]; then
    echo "❌ Error: Task ID is required"
    echo ""
    echo "Usage: /vtm:start TASK-XXX [--force]"
    echo ""
    echo "Example: /vtm:start TASK-003"
    echo "         /vtm:start TASK-003 --force"
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
    echo "❌ Error: No vtm.json found"
    exit 1
fi

# Smart hints (unless --force flag is set)
if [[ -z "$FORCE_FLAG" ]]; then
    # Check if .vtm-session exists (indicates user has viewed context)
    if [[ ! -f ".vtm-session" ]]; then
        echo "💡 Smart Hint: You haven't viewed task context yet"
        echo ""
        echo "Consider using /vtm:work instead:"
        echo "   /vtm:work $TASK_ID"
        echo ""
        echo "This will show context AND start the task in one step."
        echo ""
        echo "To bypass this hint: /vtm:start $TASK_ID --force"
        echo ""
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Cancelled. Use /vtm:work $TASK_ID for context + start."
            exit 0
        fi
    else
        # Check if this task is already the current task
        CURRENT_TASK=$(vtm session get 2>/dev/null)
        if [[ "$CURRENT_TASK" == "$TASK_ID" ]]; then
            echo "⚠️  Warning: $TASK_ID is already your current task"
            echo ""
            echo "You may have already started this task."
            echo ""
            echo "To bypass this hint: /vtm:start $TASK_ID --force"
            echo ""
            read -p "Start again anyway? (y/N): " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "Cancelled. Current task: $CURRENT_TASK"
                exit 0
            fi
        fi
    fi
fi

echo "▶️  Starting Task: $TASK_ID"
echo ""

# Call vtm start command
vtm start "$TASK_ID"

if [[ $? -eq 0 ]]; then
    echo ""
    echo "✅ Task marked as in-progress"
    echo ""
    echo "💡 Next steps:"
    echo "   • Get context: /vtm:context $TASK_ID"
    echo "   • View stats: /vtm:stats"
    echo "   • When done: /vtm:complete $TASK_ID"
else
    echo ""
    echo "❌ Failed to start task"
    echo ""
    echo "Common issues:"
    echo "   • Task may have unmet dependencies (check /vtm:task $TASK_ID)"
    echo "   • Task ID might be invalid (check /vtm:list)"
fi
```

## Status Tracking

Starting a task:

- Changes status from `pending` → `in-progress`
- Updates stats automatically
- Validates dependencies are met

**Note**: You can only start tasks where all dependencies are completed (status shows as "ready" in `/vtm:next`).

## Workflow

1. Find ready task: `/vtm:next`
2. **Start task: `/vtm:start TASK-XXX`**
3. Get context: `/vtm:context TASK-XXX`
4. Implement with TDD
5. Complete: `/vtm:complete TASK-XXX`

## See Also

- `/vtm:next` - Find ready tasks
- `/vtm:complete` - Mark task as done
- `/vtm:stats` - View progress
