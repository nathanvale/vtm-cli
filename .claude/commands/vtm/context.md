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

echo "📋 Task Context: $TASK_ID"
echo ""

# Call vtm context command
if [[ "$MODE" == "compact" ]]; then
    vtm context "$TASK_ID" --compact
else
    vtm context "$TASK_ID"
fi

echo ""
echo "💡 Next steps:"
echo "   • Copy context above"
echo "   • Use with PROMPT 2 (prompts/2-execute-task.md)"
echo "   • Implement with TDD based on test_strategy"
echo "   • Mark complete: /vtm:complete $TASK_ID"
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

1. Get ready tasks: `/vtm:next`
2. **Get context: `/vtm:context TASK-XXX`**
3. Copy context to PROMPT 2
4. Implement with TDD
5. Complete: `/vtm:complete TASK-XXX`

## See Also

- `/vtm:next` - Find tasks to work on
- `/vtm:task` - View full task details
- `/vtm:start` - Mark task as in-progress
