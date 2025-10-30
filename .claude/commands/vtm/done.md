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

# Git integration (if in a git repository)
if git rev-parse --git-dir > /dev/null 2>&1; then
    # Get current branch
    CURRENT_BRANCH=$(git branch --show-current 2>/dev/null)

    # Only process git workflow if on a task branch
    if [[ "$CURRENT_BRANCH" =~ ^(feature|bugfix|refactor|chore|docs|test)/ ]]; then
        echo "📝 Processing git workflow..."
        echo ""

        # Get task details for commit message
        TASK_JSON=$(vtm task "$TASK_ID" --json 2>/dev/null)
        TASK_TITLE=$(echo "$TASK_JSON" | jq -r '.title // "Complete task"')
        TASK_TYPE=$(echo "$TASK_JSON" | jq -r '.type // "feature"')

        # Use VTMGitWorkflow library for commit and merge
        MERGE_RESULT=$(node dist/lib/vtm-git-cli.js commit-merge "$TASK_ID" "$TASK_TITLE" "$TASK_TYPE" 2>&1)

        if [[ $? -ne 0 ]]; then
            echo ""
            echo "❌ Git workflow failed:"
            echo "$MERGE_RESULT"
            echo ""
            echo "Please resolve issues manually and try again."
            exit 1
        fi

        echo "✅ $MERGE_RESULT"
        echo ""

        # Cleanup branch
        echo "🗑️  Cleaning up branch: $CURRENT_BRANCH"
        CLEANUP_RESULT=$(node dist/lib/vtm-git-cli.js cleanup "$CURRENT_BRANCH" 2>&1)

        if [[ $? -ne 0 ]]; then
            echo ""
            echo "⚠️  Warning: Could not delete branch automatically"
            echo "   You may need to delete it manually: git branch -d $CURRENT_BRANCH"
            echo ""
        else
            echo "✅ $CLEANUP_RESULT"
            echo ""
        fi
    fi
fi

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

## Documentation

For detailed information, see:

- **[Done Workflow Guide](../../docs/vtm/done-workflow.md)** - Complete workflow details, git merge process, session management
- **[Execute Workflow Guide](../../docs/vtm/execute-workflow.md)** - Task execution and session state
- **[Test Strategies](../../docs/vtm/test-strategies.md)** - Testing requirements and validation

## What This Command Does

The `/vtm:done` command streamlines task completion with integrated git workflow:

1. **Git workflow** (if on a feature branch):
   - Commits any uncommitted changes with conventional commit format
   - Merges the feature branch to main
   - Deletes the feature branch after successful merge
2. **Completing the task**: Marks task as `completed` and updates stats
3. **Clearing session**: Removes current task from session state
4. **Showing next tasks**: Displays 3 ready tasks to work on next
5. **Progress update**: Shows overall completion statistics

## Quick Reference

### Two Usage Modes

**Mode 1: Complete Current Task (Session-based)**

```bash
/vtm:execute TASK-003   # Sets TASK-003 as current
# ... implement ...
/vtm:done               # Completes TASK-003 from session
```

**Mode 2: Complete Specific Task (Explicit)**

```bash
/vtm:done TASK-007      # Completes TASK-007 explicitly
```

### Simplified Workflow

```bash
/vtm:execute TASK-003   # Launch agent + create branch
# ... agent implements autonomously ...
/vtm:done               # Commit + merge + complete + show next
```

## Git Integration

The command automatically handles:

- Commits uncommitted changes with conventional commit format
- Merges feature branch to main
- Deletes feature branch after successful merge
- Provides clear error messages for conflicts

See [Done Workflow Guide](../../docs/vtm/done-workflow.md) for detailed git workflow.

## Related Commands

- `/vtm:execute` - Start task with git integration
- `/vtm:next` - Find ready tasks
- `/vtm:complete` - Complete task (direct CLI, no git operations)
- `/vtm:stats` - View progress
