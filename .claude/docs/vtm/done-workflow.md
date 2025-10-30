# VTM Done Workflow

## Overview

The `/vtm:done` command streamlines task completion by handling git workflow, session management, and showing next available tasks.

## Workflow Stages

### 1. Task Identification

The command supports two modes:

**Mode 1: Complete Current Task (Session-based)**

After starting a task with `/vtm:execute`:

```bash
/vtm:execute TASK-003   # Sets TASK-003 as current
# ... implement ...
/vtm:done               # Completes TASK-003 from session
```

**Mode 2: Complete Specific Task (Explicit)**

Bypass session and complete any task directly:

```bash
/vtm:done TASK-007      # Completes TASK-007 explicitly
```

### 2. Git Workflow

**Commit Uncommitted Changes:**

If there are uncommitted changes on a task branch:

1. Detects uncommitted files
2. Gets task title and type from VTM
3. Creates conventional commit message: `{type}({task-id}): {title}`
4. Stages all changes with `git add -A`
5. Commits with generated message

**Branch Merge:**

1. Merges feature branch to main using `/git:merge`
2. Handles merge conflicts with clear error messages
3. Provides manual resolution steps if needed

**Branch Cleanup:**

1. Deletes feature branch using `/git:delete-branch`
2. Warns if deletion fails (manual cleanup needed)

### 3. Task Completion

1. Marks task as `completed` using `vtm complete`
2. Updates VTM stats automatically
3. Records completion timestamp

### 4. Session Management

1. Clears current task from `.vtm-session`
2. Preserves session if completion fails
3. Ensures clean state for next task

### 5. Next Task Discovery

1. Shows 3 ready tasks using `vtm next -n 3`
2. Displays progress statistics using `vtm stats`
3. Provides next steps guidance

## Git Integration Details

### Conventional Commit Format

Commits use this format:

```
{type}({task-id}): {title}
```

Examples:

```
feature(TASK-042): Implement instruction builder with tests
bugfix(TASK-025): Fix dependency resolution bug
refactor(TASK-088): Extract validation logic to separate module
```

### Branch Pattern Detection

Only processes git workflow for task branches:

- `feature/*`
- `bugfix/*`
- `refactor/*`
- `chore/*`
- `docs/*`
- `test/*`

If on `main` or other branches, skips git workflow.

### Merge Strategy

Uses `/git:merge` command:

```bash
/git:merge feature/TASK-003 main
```

Automatically:

- Switches to target branch (main)
- Merges source branch
- Handles fast-forward and 3-way merges
- Detects conflicts and provides clear error messages

### Conflict Resolution

If merge fails:

```
❌ Failed to merge branch

Please resolve conflicts manually.
After resolving:
  1. Complete merge: git add . && git commit
  2. Try /vtm:done again
```

Manual steps:

1. Resolve conflicts in affected files
2. Stage changes: `git add .`
3. Complete merge: `git commit`
4. Retry: `/vtm:done`

## Session State Management

### Session File

Location: `./.vtm-session` (project-specific)

Format:

```json
{
  "currentTask": "TASK-003"
}
```

### Session Operations

**Read**: Get current task if no ID provided

```bash
TASK_ID=$(vtm session get)
```

**Clear**: Remove session after completion

```bash
vtm session clear
```

**Preserve**: Keep session if completion fails

## Error Handling

### No Current Task and No ID

```
❌ Error: No current task in session

Either:
  1. Start a task first: /vtm:execute TASK-XXX
  2. Provide a task ID: /vtm:done TASK-XXX

Available ready tasks:
[Shows 3 ready tasks]
```

**Solution**: Start a task or provide explicit ID

### Invalid Task ID

```
❌ Failed to complete task

Common issues:
   • Task ID might be invalid (check /vtm:list)
   • Task may already be completed
   • Task might not exist
```

**Solution**: Verify task ID using `/vtm:list`

### Commit Failure

```
❌ Failed to commit changes

Please commit manually before completing the task.
```

**Solution**: Review git status and commit manually

### Merge Failure

```
❌ Failed to merge branch

Please resolve conflicts manually.
```

**Solution**: Follow conflict resolution steps above

## Complete Workflow Example

```bash
# 1. Start work
/vtm:execute TASK-003      # Mark in-progress + create branch + show context

# 2. Implement
# ... write code, tests, etc ...

# 3. Complete and continue
/vtm:done                  # Commit + merge + complete + show next tasks

# Output:
# ✅ Completing current task: TASK-003
#
# 📝 Checking for uncommitted changes...
# ⚠️  You have uncommitted changes.
#
# Creating commit with message:
#   feature(TASK-003): Implement feature X
#
# ✅ Changes committed
#
# 🔀 Merging branch to main...
# ✅ Branch merged successfully
#
# 🗑️  Cleaning up branch: feature/TASK-003
# ✅ Branch deleted
#
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# 🎯 Next Available Tasks:
#
# TASK-004: Implement feature X [pending] [2h]
# TASK-007: Add validation for Y [pending] [1h]
# TASK-009: Update documentation [pending] [30m]
#
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#
# 📊 Progress Update:
#
# Total: 25 tasks
# ✅ Completed: 12 (48%)
# 🚧 In Progress: 0 (0%)
# ⏳ Pending: 10 (40%)
# 🚫 Blocked: 3 (12%)
#
# 💡 Next steps:
#    • Start next task: /vtm:execute TASK-XXX
#    • View all tasks: /vtm:list
#    • Check stats: /vtm:stats

# 4. Start next task
/vtm:execute TASK-004
```

## Simplified Workflow

For maximum efficiency, use the core two-command workflow:

```bash
/vtm:execute TASK-XXX   # Launch agent with full git integration
# ... agent implements autonomously ...
/vtm:done               # Complete + merge + show next
```

This handles:

- Git branch creation
- Implementation
- Testing and validation
- Git commit and merge
- Task completion
- Next task discovery

## Troubleshooting

### Session Not Set

If you see "No current task in session":

1. Verify you started a task: `/vtm:execute TASK-XXX`
2. OR provide explicit ID: `/vtm:done TASK-XXX`

### Branch Not Deleted

If branch deletion fails:

```
⚠️  Warning: Could not delete branch (you may need to do this manually)
```

Manual cleanup:

```bash
git branch -d feature/TASK-XXX
```

### Already Completed

If task is already completed, VTM CLI will report it. Use `/vtm:list` to find available tasks.

## See Also

- [Execute Workflow](./execute-workflow.md) - Task execution details
- [Test Strategies](./test-strategies.md) - Testing approach
- [Coding Standards](./coding-standards.md) - Project standards
