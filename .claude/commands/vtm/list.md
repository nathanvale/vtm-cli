---
allowed-tools: Bash(vtm *)
description: List all tasks with their status
argument-hint: [filter]
---

# VTM: List

List all tasks in the Virtual Task Manager with their current status.

## Usage

```bash
/vtm:list [filter]
```

## Parameters

- `filter` (optional): Filter by status - "pending", "in-progress", "completed", "blocked", or "all" (default: all)

## Examples

```bash
/vtm:list                    # Show all tasks
/vtm:list pending            # Show only pending tasks
/vtm:list in-progress        # Show tasks being worked on
/vtm:list completed          # Show completed tasks
/vtm:list blocked            # Show blocked tasks
```

## Implementation

```bash
#!/bin/bash

# Parse arguments
FILTER="${ARGUMENTS[0]:-all}"

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

echo "📋 Task List"
if [[ "$FILTER" != "all" ]]; then
    echo "Filter: $FILTER"
fi
echo ""

# Call vtm list command
if [[ "$FILTER" == "all" ]]; then
    vtm list
else
    # Filter tasks by status
    vtm list | grep -i "$FILTER" || echo "No tasks found with status: $FILTER"
fi

echo ""
echo "💡 Actions:"
echo "   • View task: /vtm:task TASK-XXX"
echo "   • Get context: /vtm:context TASK-XXX"
echo "   • Execute task: /vtm:execute TASK-XXX"
echo "   • View stats: /vtm:stats"
```

## Task List Format

Shows for each task:

- **ID**: Task identifier (TASK-001, TASK-002, etc.)
- **Status**: pending, in-progress, completed, blocked
- **Title**: Task description
- **Dependencies**: Required tasks (if any)
- **Test Strategy**: TDD, Unit, Integration, or Direct

## Filtering

Filter tasks to focus on specific work:

- `pending` - Tasks ready to start (dependencies met)
- `in-progress` - Currently active tasks
- `completed` - Finished tasks
- `blocked` - Tasks waiting on dependencies
- `all` - Show everything (default)

## Workflow

Use list to:

1. Get overview of all work
2. Find tasks by status
3. Identify what's blocking progress
4. Plan next steps

## See Also

- `/vtm:next` - Get next ready task (more focused)
- `/vtm:stats` - High-level progress summary
- `/vtm:task` - Detailed view of specific task
