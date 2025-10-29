---
allowed-tools: Bash(vtm *)
description: Get next ready task to work on
argument-hint: [limit]
---

# VTM: Next

Get the next ready task(s) to work on from your Virtual Task Manager.

## Usage

```bash
/vtm:next [limit]
```

## Parameters

- `limit` (optional): Maximum number of tasks to show (default: 5)

## Examples

```bash
/vtm:next           # Show next 5 ready tasks
/vtm:next 3         # Show next 3 ready tasks
/vtm:next 10        # Show next 10 ready tasks
```

## Implementation

```bash
#!/bin/bash

# Parse arguments
LIMIT="${ARGUMENTS[0]:-5}"

# Validate vtm CLI is available
if ! command -v vtm &> /dev/null; then
    echo "❌ Error: vtm CLI not found"
    echo ""
    echo "Install vtm CLI:"
    echo "  npm install -g @your-org/vtm-cli"
    echo ""
    echo "Or run from this repository:"
    echo "  npm link"
    exit 1
fi

# Check if vtm.json exists
if [[ ! -f "vtm.json" ]]; then
    echo "❌ Error: No vtm.json found in current directory"
    echo ""
    echo "Generate a VTM file first using PROMPT 1"
    echo "See: prompts/1-generate-vtm.md"
    exit 1
fi

# AC2: Check if there's a current task
CURRENT_TASK=""
if [[ -f ".vtm-session" ]]; then
    CURRENT_TASK=$(cat .vtm-session 2>/dev/null | grep -o '"currentTask":"[^"]*"' | cut -d'"' -f4)
fi

# Show current task if exists
if [[ -n "$CURRENT_TASK" ]]; then
    echo "📌 Currently working on: $CURRENT_TASK"
    echo ""
fi

echo "🎯 Next Ready Tasks"
echo ""

# Call vtm next command
vtm next

echo ""
echo "💡 Workflow options:"
echo ""
echo "Quick start (recommended):"
echo "   • /vtm:work TASK-XXX     - Start task and view context in one step"
echo ""
echo "Step-by-step workflow:"
echo "   • /vtm:context TASK-XXX  - View task context first"
echo "   • /vtm:start TASK-XXX    - Mark task as in-progress"
echo ""
echo "Other commands:"
echo "   • /vtm:task TASK-XXX     - View full task details"
echo "   • /vtm:stats             - Check overall progress"
```

## Integration

This command wraps the `vtm next` CLI command to show tasks where all dependencies are completed.

**Workflow:**

1. Run `/vtm:next` to see available tasks
2. Choose a task to work on
3. Run `/vtm:context TASK-XXX` to get full context
4. Start implementation with PROMPT 2
5. Mark complete with `/vtm:complete TASK-XXX`

## See Also

- `/vtm:context` - Get context for a specific task
- `/vtm:start` - Mark task as in-progress
- `/vtm:list` - View all tasks
