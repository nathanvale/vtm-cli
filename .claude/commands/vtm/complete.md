---
allowed-tools: Bash(vtm *)
description: Mark a task as completed
argument-hint: <task-id>
---

# VTM: Complete

Mark a task as completed when all acceptance criteria are met.

## Usage

```bash
/vtm:complete <task-id>
```

## Parameters

- `task-id` (required): Task ID to complete (e.g., TASK-003)

## Examples

```bash
/vtm:complete TASK-003
```

## Implementation

```bash
#!/bin/bash

# Parse arguments
TASK_ID="${ARGUMENTS[0]}"

if [[ -z "$TASK_ID" ]]; then
    echo "❌ Error: Task ID is required"
    echo ""
    echo "Usage: /vtm:complete TASK-XXX"
    echo ""
    echo "Example: /vtm:complete TASK-003"
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

echo "✅ Completing Task: $TASK_ID"
echo ""

# Call vtm complete command
vtm complete "$TASK_ID"

if [[ $? -eq 0 ]]; then
    echo ""
    echo "🎉 Task marked as completed!"
    echo ""
    echo "Stats updated automatically:"
    vtm stats
    echo ""
    echo "💡 Next steps:"
    echo "   • Find next task: /vtm:next"
    echo "   • View progress: /vtm:stats"
    echo "   • Commit changes with git"
else
    echo ""
    echo "❌ Failed to complete task"
    echo ""
    echo "Verify:"
    echo "   • Task exists: /vtm:task $TASK_ID"
    echo "   • All acceptance criteria met"
    echo "   • Tests passing (based on test_strategy)"
fi
```

## Before Completing

Ensure you've met the acceptance criteria:

**For TDD tasks:**
- ✓ Tests written first (Red phase)
- ✓ Implementation passes tests (Green phase)
- ✓ Code refactored (Refactor phase)

**For Unit/Integration tasks:**
- ✓ Implementation complete
- ✓ Tests written and passing
- ✓ Code reviewed

**For Direct tasks:**
- ✓ Setup/config complete
- ✓ Manually verified

## Automatic Updates

Completing a task:
- Changes status from `in-progress` → `completed`
- Recalculates all VTM stats automatically
- Unblocks dependent tasks (they become "ready")
- Updates completion percentage

## Workflow

1. Start task: `/vtm:start TASK-XXX`
2. Get context: `/vtm:context TASK-XXX`
3. Implement with TDD
4. **Complete task: `/vtm:complete TASK-XXX`**
5. Find next: `/vtm:next`

## See Also

- `/vtm:start` - Mark task as in-progress
- `/vtm:stats` - View updated progress
- `/vtm:next` - Find newly unblocked tasks
