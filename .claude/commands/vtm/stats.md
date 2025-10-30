---
allowed-tools: Bash(vtm *)
description: Show VTM statistics and progress
argument-hint:
---

# VTM: Stats

Show Virtual Task Manager statistics and overall progress.

## Usage

```bash
/vtm:stats
```

## Parameters

No parameters required.

## Examples

```bash
/vtm:stats
```

## Implementation

```bash
#!/bin/bash

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
    echo ""
    echo "Generate a VTM file first using PROMPT 1"
    exit 1
fi

echo "📊 VTM Statistics"
echo ""

# Call vtm stats command
vtm stats

echo ""
echo "💡 Quick actions:"
echo "   • Next tasks: /vtm:next"
echo "   • All tasks: /vtm:list"
echo "   • Execute task: /vtm:execute TASK-XXX"
```

## Statistics Shown

The stats command displays:

- **Total Tasks**: Total number of tasks in VTM
- **Completed**: Tasks with status='completed'
- **In Progress**: Tasks currently being worked on
- **Pending**: Tasks not yet started (dependencies met)
- **Blocked**: Tasks waiting on dependencies
- **Progress**: Completion percentage

## Auto-Recalculation

Stats are automatically recalculated when you:

- Execute a task (`/vtm:execute`)
- Complete a task (`/vtm:done` or `/vtm:complete`)
- Update any task status via CLI (`vtm start`, `vtm complete`)

The VTMWriter class handles this via `recalculateStats()` - you never need to manually update stats.

## Tracking Progress

Use stats to:

- Monitor overall project progress
- Identify bottlenecks (high blocked count)
- Plan work (check pending/in-progress ratio)
- Celebrate milestones (completion percentage)

## See Also

- `/vtm:list` - Detailed task breakdown
- `/vtm:next` - Find ready tasks to work on
