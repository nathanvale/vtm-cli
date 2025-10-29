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

if [[ -z "$TASK_ID" ]]; then
    echo "❌ Error: Task ID is required"
    echo ""
    echo "Usage: /vtm:start TASK-XXX"
    echo ""
    echo "Example: /vtm:start TASK-003"
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
