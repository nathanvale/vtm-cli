---
allowed-tools: Bash(vtm *)
description: View details of a specific task
argument-hint: <task-id>
---

# VTM: Task

View full details of a specific task including dependencies, acceptance criteria, and test strategy.

## Usage

```bash
/vtm:task <task-id>
```

## Parameters

- `task-id` (required): Task ID (e.g., TASK-003)

## Examples

```bash
/vtm:task TASK-001
/vtm:task TASK-015
```

## Implementation

```bash
#!/bin/bash

# Parse arguments
TASK_ID="${ARGUMENTS[0]}"

if [[ -z "$TASK_ID" ]]; then
    echo "❌ Error: Task ID is required"
    echo ""
    echo "Usage: /vtm:task TASK-XXX"
    echo ""
    echo "Example: /vtm:task TASK-003"
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

echo "📄 Task Details: $TASK_ID"
echo ""

# Call vtm task command
vtm task "$TASK_ID"

echo ""
echo "💡 Available actions:"
echo "   • Get context: /vtm:context $TASK_ID"
echo "   • Start work: /vtm:start $TASK_ID"
echo "   • Mark done: /vtm:complete $TASK_ID"
echo "   • View all: /vtm:list"
```

## Task Information

Shows complete task details:

- **ID & Title**: Task identifier and description
- **Status**: pending, in-progress, completed, or blocked
- **Test Strategy**: TDD, Unit, Integration, or Direct
- **Dependencies**: Tasks that must complete first
- **Blocks**: Tasks waiting on this one
- **Acceptance Criteria**: Requirements for completion
- **Related Specs**: Links to ADRs or specification files

## See Also

- `/vtm:next` - Find ready tasks
- `/vtm:context` - Get minimal context for implementation
- `/vtm:list` - View all tasks
