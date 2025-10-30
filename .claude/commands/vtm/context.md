---
allowed-tools: Bash(vtm *)
description: Generate minimal context for a specific task
argument-hint: <task-id> [mode]
---

# VTM: Context

Generate minimal, token-efficient context for a specific task.

## Usage

```bash
/vtm:context <task-id> [mode]
```

## Parameters

- `task-id` (required): Task ID (e.g., TASK-003)
- `mode` (optional): Context mode - "minimal" or "compact" (default: minimal)

## Examples

```bash
/vtm:context TASK-003              # Full minimal context (~2000 tokens)
/vtm:context TASK-003 compact      # Ultra-compact context (~500 tokens)
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
    echo "Usage: /vtm:context TASK-XXX [mode]"
    echo ""
    echo "Examples:"
    echo "  /vtm:context TASK-003"
    echo "  /vtm:context TASK-003 compact"
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

# AC2: Get task status
TASK_STATUS=$(vtm task "$TASK_ID" 2>/dev/null | grep "^Status:" | awk '{print $2}')

if [[ -z "$TASK_STATUS" ]]; then
    echo "❌ Error: Task $TASK_ID not found"
    echo ""
    echo "Check available tasks: /vtm:list"
    exit 1
fi

# AC3: Check if this is the current task
IS_CURRENT_TASK=false
CURRENT_TASK=$(vtm session get 2>/dev/null)
if [[ "$CURRENT_TASK" == "$TASK_ID" ]]; then
    IS_CURRENT_TASK=true
fi

echo "📋 Task Context: $TASK_ID"

# AC2: Show task status
if [[ "$TASK_STATUS" == "completed" ]]; then
    echo "Status: ✅ completed"
elif [[ "$TASK_STATUS" == "in-progress" ]]; then
    echo "Status: ▶️  in-progress"
    # AC3: Show if this is current task
    if [[ "$IS_CURRENT_TASK" == true ]]; then
        echo "📌 This is your current task"
    fi
elif [[ "$TASK_STATUS" == "pending" ]]; then
    echo "Status: ⏸️  pending"
fi

echo ""

# Call vtm context command
if [[ "$MODE" == "compact" ]]; then
    vtm context "$TASK_ID" --compact
else
    vtm context "$TASK_ID"
fi

echo ""
echo "💡 Next steps:"

# Smart hint for /vtm:execute
if [[ "$TASK_STATUS" == "pending" ]]; then
    echo "   • Execute task: /vtm:execute $TASK_ID (agent + git integration)"
fi

echo "   • This is read-only (no git operations)"
echo "   • To start task with git workflow: /vtm:execute $TASK_ID"
echo "   • To mark complete: /vtm:done"
```

## Token Efficiency

VTM achieves 99% token reduction by:

- Only including the target task
- Resolving dependencies (no need to load entire VTM)
- Minimal formatting
- Compact mode for ultra-low token usage

**Context Modes:**

- `minimal`: ~2000 tokens (full context with dependencies)
- `compact`: ~500 tokens (ultra-minimal for simple tasks)

## Workflow Integration

**Read-Only Mode:** This command only displays context without any git operations.

**For execution workflow:**
1. Get ready tasks: `/vtm:next`
2. Execute with agent: `/vtm:execute TASK-XXX` (includes context + git + agent)
3. Complete: `/vtm:done`

**When to use `/vtm:context`:**
- Review task details before executing
- Understand requirements without starting work
- Check task status and dependencies

## See Also

- `/vtm:execute` - Launch agent with git integration
- `/vtm:next` - Find tasks to work on
- `/vtm:task` - View full task details
- `/vtm:done` - Complete current task
