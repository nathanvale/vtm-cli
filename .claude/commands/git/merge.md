---
allowed-tools: Bash(git:*)
description: Merge one branch into another
argument-hint: <source-branch> [target-branch]
---

# Git: Merge

Merge a source branch into a target branch. If no target is specified, merges into the current branch.

## Usage

```bash
/git:merge <source-branch> [target-branch]
```

## Parameters

- `source-branch` (required): Branch to merge from
- `target-branch` (optional): Branch to merge into (default: current branch)

## Examples

```bash
# Merge feature into current branch
/git:merge feature/user-auth

# Merge feature into main
/git:merge feature/user-auth main

# Merge develop into release
/git:merge develop release/v2.0
```

## Implementation

```bash
#!/bin/bash

SOURCE_BRANCH="${ARGUMENTS[0]}"
TARGET_BRANCH="${ARGUMENTS[1]:-}"

if [ -z "$SOURCE_BRANCH" ]; then
  echo "❌ Error: Source branch is required"
  echo ""
  echo "Usage: /git:merge <source-branch> [target-branch]"
  echo ""
  echo "Examples:"
  echo "  /git:merge feature/login"
  echo "  /git:merge feature/login main"
  exit 1
fi

# Verify source branch exists
if ! git rev-parse --verify "$SOURCE_BRANCH" >/dev/null 2>&1; then
  echo "❌ Error: Source branch '$SOURCE_BRANCH' does not exist"
  exit 1
fi

# If target branch specified, switch to it first
if [ -n "$TARGET_BRANCH" ]; then
  echo "📍 Switching to target branch: $TARGET_BRANCH"

  if ! git rev-parse --verify "$TARGET_BRANCH" >/dev/null 2>&1; then
    echo "❌ Error: Target branch '$TARGET_BRANCH' does not exist"
    exit 1
  fi

  git switch "$TARGET_BRANCH"

  if [ $? -ne 0 ]; then
    echo "❌ Failed to switch to branch: $TARGET_BRANCH"
    exit 1
  fi
else
  TARGET_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null)
  echo "📍 Merging into current branch: $TARGET_BRANCH"
fi

echo ""
echo "🔀 Merging: $SOURCE_BRANCH → $TARGET_BRANCH"
echo ""

# Perform the merge
git merge "$SOURCE_BRANCH" --no-edit

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ Merge failed (conflicts detected)"
  echo ""
  echo "To resolve:"
  echo "  1. Fix conflicts in affected files"
  echo "  2. git add <resolved-files>"
  echo "  3. git commit"
  echo ""
  echo "To abort:"
  echo "  git merge --abort"
  exit 1
fi

echo ""
echo "✅ Successfully merged $SOURCE_BRANCH into $TARGET_BRANCH"
exit 0
```

## What This Does

1. Validates source branch exists
2. Switches to target branch (if specified)
3. Performs merge with `--no-edit` (uses default merge message)
4. Reports success or conflict errors

## Conflict Handling

If merge conflicts occur:
- Command exits with error
- Provides instructions for manual resolution
- Files remain in conflicted state for user to resolve

## Exit Codes

- `0`: Merge successful
- `1`: Merge failed (conflicts or invalid branches)

## Use Cases

- Feature branch integration
- Release preparation
- Hotfix merging
- Development workflow automation

## See Also

- `/git:switch` - Switch branches
- `/git:delete-branch` - Delete merged branches
- `/git:status` - Check merge status
