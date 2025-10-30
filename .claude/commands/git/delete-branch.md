---
allowed-tools: Bash(git:*)
description: Delete a local git branch
argument-hint: <branch-name> [--force]
---

# Git: Delete Branch

Delete a local git branch. Prevents deletion of unmerged branches unless `--force` is used.

## Usage

```bash
/git:delete-branch <branch-name>
/git:delete-branch <branch-name> --force
```

## Parameters

- `branch-name` (required): Name of the branch to delete
- `--force` (optional): Force deletion even if unmerged

## Examples

```bash
# Delete merged branch
/git:delete-branch feature/user-auth

# Force delete unmerged branch
/git:delete-branch experiment/spike --force
```

## Implementation

```bash
#!/bin/bash

BRANCH_NAME="${ARGUMENTS[0]}"
FORCE_FLAG="${ARGUMENTS[1]:-}"

if [ -z "$BRANCH_NAME" ]; then
  echo "❌ Error: Branch name is required"
  echo ""
  echo "Usage: /git:delete-branch <branch-name> [--force]"
  echo ""
  echo "Examples:"
  echo "  /git:delete-branch feature/login"
  echo "  /git:delete-branch experiment/test --force"
  exit 1
fi

# Check if branch exists
if ! git rev-parse --verify "$BRANCH_NAME" >/dev/null 2>&1; then
  echo "❌ Error: Branch '$BRANCH_NAME' does not exist"
  exit 1
fi

# Check if trying to delete current branch
CURRENT_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null)
if [ "$CURRENT_BRANCH" = "$BRANCH_NAME" ]; then
  echo "❌ Error: Cannot delete the currently checked out branch"
  echo ""
  echo "Switch to another branch first:"
  echo "  /git:switch main"
  exit 1
fi

# Delete the branch
if [ "$FORCE_FLAG" = "--force" ]; then
  echo "⚠️  Force deleting branch: $BRANCH_NAME"
  git branch -D "$BRANCH_NAME"
else
  echo "🗑️  Deleting branch: $BRANCH_NAME"
  git branch -d "$BRANCH_NAME"

  if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Failed to delete branch (may contain unmerged changes)"
    echo ""
    echo "Options:"
    echo "  • Merge the branch first, then delete"
    echo "  • Force delete: /git:delete-branch $BRANCH_NAME --force"
    exit 1
  fi
fi

echo "✅ Branch '$BRANCH_NAME' deleted successfully"
exit 0
```

## Safety Features

- Prevents deletion of current branch
- Prevents deletion of unmerged branches (without `--force`)
- Validates branch exists before attempting deletion

## Exit Codes

- `0`: Branch deleted successfully
- `1`: Deletion failed (validation error or unmerged changes)

## Use Cases

- Cleanup after feature completion
- Remove experimental branches
- Maintain clean local repository
- Post-merge cleanup

## Notes

- Only deletes **local** branches
- Does not affect remote branches
- Protected branches (current branch) cannot be deleted

## See Also

- `/git:merge` - Merge branches before deletion
- `/git:switch` - Switch away from branch to be deleted
- `/git:push` - Delete remote branches
