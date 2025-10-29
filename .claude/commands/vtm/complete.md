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
    echo "Usage: /vtm:complete TASK-XXX [--force]"
    echo ""
    echo "Example: /vtm:complete TASK-003"
    echo "         /vtm:complete TASK-003 --force"
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
    # Get task status from vtm task command
    TASK_STATUS=$(vtm task "$TASK_ID" 2>/dev/null | grep "^Status:" | awk '{print $2}')

    if [[ -z "$TASK_STATUS" ]]; then
        echo "❌ Error: Task $TASK_ID not found"
        echo ""
        echo "Check available tasks: /vtm:list"
        exit 1
    fi

    # AC1 & AC2: Check if task was never started (status: pending)
    if [[ "$TASK_STATUS" == "pending" ]]; then
        echo "⚠️  Warning: $TASK_ID was never started"
        echo ""
        echo "This task has status 'pending'. You should start it first."
        echo ""
        echo "Options:"
        echo "   • Start then complete: /vtm:start $TASK_ID"
        echo "   • Quick start: /vtm:work $TASK_ID"
        echo "   • Force complete: /vtm:complete $TASK_ID --force"
        echo ""
        read -p "Complete anyway? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "Cancelled. Use /vtm:start $TASK_ID first."
            exit 0
        fi
    fi

    # AC3 & AC4: Check if completing different task than current
    if [[ -f ".vtm-session" ]]; then
        CURRENT_TASK=$(cat .vtm-session 2>/dev/null | grep -o '"currentTask":"[^"]*"' | cut -d'"' -f4)
        if [[ -n "$CURRENT_TASK" ]] && [[ "$CURRENT_TASK" != "$TASK_ID" ]]; then
            echo "⚠️  Warning: Completing different task than current"
            echo ""
            echo "Current task: $CURRENT_TASK"
            echo "Completing: $TASK_ID"
            echo ""
            echo "Did you mean to complete $CURRENT_TASK instead?"
            echo ""
            echo "To bypass this hint: /vtm:complete $TASK_ID --force"
            echo ""
            read -p "Complete $TASK_ID anyway? (y/N): " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "Cancelled. Current task: $CURRENT_TASK"
                exit 0
            fi
        fi
    fi
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
