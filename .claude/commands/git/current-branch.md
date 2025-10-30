---
allowed-tools: Bash(git:*)
description: Get the name of the current git branch
argument-hint:
---

# Git: Current Branch

Get the name of the currently checked out git branch.

## Usage

```bash
/git:current-branch
```

## Parameters

None

## Examples

```bash
# Get current branch name
/git:current-branch
# Output: main

# Use in scripts
BRANCH=$(/git:current-branch)
echo "Working on: $BRANCH"

# Conditional logic
if [ "$(/git:current-branch)" = "main" ]; then
  echo "On main branch"
fi
```

## Implementation

```bash
#!/bin/bash

# Get current branch name
BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null)

if [ -z "$BRANCH" ]; then
  # Detached HEAD state or other issue
  echo "❌ Not on a branch (detached HEAD or not a git repository)"
  exit 1
fi

echo "$BRANCH"
exit 0
```

## Exit Codes

- `0`: Successfully retrieved branch name
- `1`: Not on a branch (detached HEAD) or not a git repository

## Use Cases

- Workflow automation scripts
- Conditional branching logic
- Status reporting
- Pre-commit hooks
- CI/CD pipelines

## Notes

- Returns just the branch name (e.g., `main`, not `refs/heads/main`)
- Fails if in detached HEAD state
- Fails if not in a git repository

## See Also

- `/git:status` - View full git status
- `/git:switch` - Switch to a different branch
