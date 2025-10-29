---
allowed-tools: Bash(vtm *)
description: Complete current or specific task and show next steps
argument-hint: [task-id]
---

# VTM: Done

Complete a task and automatically show the next available tasks. If no task ID is provided, completes the current task from the session. After completion, displays the next 3 ready tasks.

## Usage

```bash
/vtm:done              # Complete current task from session
/vtm:done TASK-003     # Complete specific task
```

## Parameters

- `task-id` (optional): Task ID to complete. If omitted, completes the current task from session.

## Examples

```bash
# Complete current task (from /vtm:work)
/vtm:work TASK-003
# ... implement ...
/vtm:done

# Complete specific task
/vtm:done TASK-007
```

## Implementation

```bash
#!/bin/bash

# Parse arguments
TASK_ID="${ARGUMENTS[0]}"

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

# Determine which task to complete
if [[ -z "$TASK_ID" ]]; then
    # No task ID provided, get from session
    TASK_ID=$(vtm session get 2>/dev/null)

    if [[ -z "$TASK_ID" ]]; then
        echo "❌ Error: No current task in session"
        echo ""
        echo "Either:"
        echo "  1. Start a task first: /vtm:work TASK-XXX"
        echo "  2. Provide a task ID: /vtm:done TASK-XXX"
        echo ""
        echo "Available ready tasks:"
        vtm next -n 3
        exit 1
    fi

    echo "✅ Completing current task: $TASK_ID"
else
    echo "✅ Completing task: $TASK_ID"
fi

echo ""

# Complete the task
vtm complete "$TASK_ID"

if [[ $? -ne 0 ]]; then
    echo ""
    echo "❌ Failed to complete task"
    echo ""
    echo "Common issues:"
    echo "   • Task ID might be invalid (check /vtm:list)"
    echo "   • Task may already be completed"
    echo "   • Task might not exist"
    exit 1
fi

# Clear current task from session
vtm session clear > /dev/null 2>&1

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show next available tasks
echo "🎯 Next Available Tasks:"
echo ""

vtm next -n 3

if [[ $? -ne 0 ]]; then
    echo ""
    echo "⚠️  No more tasks available"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Show progress stats
echo "📊 Progress Update:"
echo ""
vtm stats

echo ""
echo "💡 Next steps:"
echo "   • Start next task: /vtm:work TASK-XXX"
echo "   • View all tasks: /vtm:list"
echo "   • Check stats: /vtm:stats"
```

## What This Command Does

The `/vtm:done` command streamlines task completion by:

1. **Completing the task**: Marks task as `completed` and updates stats
2. **Clearing session**: Removes current task from session state
3. **Showing next tasks**: Displays 3 ready tasks to work on next
4. **Progress update**: Shows overall completion statistics

## Two Usage Modes

### Mode 1: Complete Current Task (Session-based)

After starting a task with `/vtm:work`:

```bash
/vtm:work TASK-003      # Sets TASK-003 as current
# ... implement ...
/vtm:done               # Completes TASK-003 from session
```

### Mode 2: Complete Specific Task (Explicit)

Bypass session and complete any task directly:

```bash
/vtm:done TASK-007      # Completes TASK-007 explicitly
```

## Error Handling

The command handles these scenarios:

1. **No current task and no ID**: Shows error and lists available tasks
2. **Invalid task ID**: Reports completion failure with suggestions
3. **Already completed**: VTM CLI reports the issue
4. **No next tasks**: Reports "No more tasks available"

## Workflow Integration

**Full streamlined workflow:**

```bash
# 1. Start work
/vtm:work TASK-003      # Mark in-progress + show context

# 2. Implement
# ... write code, tests, etc ...

# 3. Complete and continue
/vtm:done               # Complete + show next tasks
/vtm:work TASK-004      # Start next task
```

## Session State

The command integrates with VTMSession:

- **Reads** current task from `.vtm-session` if no ID provided
- **Clears** session after successful completion
- **Preserves** session if completion fails

Session file location: `./.vtm-session` (project-specific)

## Output Example

```
✅ Completing current task: TASK-003

✅ Task TASK-003 marked as completed
📅 Completed at: 2025-10-29T12:30:00.000Z

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Next Available Tasks:

TASK-004: Implement feature X [pending] [2h]
TASK-007: Add validation for Y [pending] [1h]
TASK-009: Update documentation [pending] [30m]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Progress Update:

Total: 25 tasks
✅ Completed: 12 (48%)
🚧 In Progress: 0 (0%)
⏳ Pending: 10 (40%)
🚫 Blocked: 3 (12%)

💡 Next steps:
   • Start next task: /vtm:work TASK-XXX
   • View all tasks: /vtm:list
   • Check stats: /vtm:stats
```

## See Also

- `/vtm:work` - Start task with context
- `/vtm:next` - Find ready tasks
- `/vtm:complete` - Complete task (direct CLI)
- `/vtm:stats` - View progress
