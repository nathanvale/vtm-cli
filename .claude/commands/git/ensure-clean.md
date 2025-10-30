---
allowed-tools: Bash(git:*)
description: Verify git working directory is clean (no uncommitted changes)
argument-hint:
---

# Git: Ensure Clean

Verify that the git working directory has no uncommitted changes. Exits with error if there are staged, unstaged, or untracked files.

## Usage

```bash
/git:ensure-clean
```

## Parameters

None

## Examples

```bash
# Check before starting new work
/git:ensure-clean && /git:create-branch my-feature

# Use in scripts
if /git:ensure-clean; then
  echo "Ready to deploy"
else
  echo "Commit your changes first"
fi
```

## Implementation

```bash
#!/bin/bash

# Check for any uncommitted changes (staged, unstaged, or untracked)
if ! git diff-index --quiet HEAD -- 2>/dev/null; then
  echo "❌ Git working directory is not clean"
  echo ""
  echo "You have uncommitted changes:"
  echo ""
  git status --short
  echo ""
  echo "Please commit or stash your changes before proceeding."
  echo ""
  echo "Options:"
  echo "  • Commit changes: git add . && git commit -m 'message'"
  echo "  • Stash changes: git stash"
  echo "  • Discard changes: git restore ."
  exit 1
fi

# Check for untracked files
if [ -n "$(git ls-files --others --exclude-standard)" ]; then
  echo "⚠️  You have untracked files:"
  echo ""
  git ls-files --others --exclude-standard
  echo ""
  echo "Add them to .gitignore or commit them before proceeding."
  exit 1
fi

echo "✅ Git working directory is clean"
exit 0
```

## What This Checks

- **Staged changes**: Files added with `git add`
- **Unstaged changes**: Modified files not yet staged
- **Untracked files**: New files not in git

## Exit Codes

- `0`: Working directory is clean (success)
- `1`: Working directory has uncommitted changes (failure)

## Use Cases

- Pre-deployment checks
- Starting new feature branches
- Validating CI/CD environment
- Ensuring clean state before rebases/merges
- Task workflow automation

## See Also

- `/git:status` - View detailed git status
- `/git:create-branch` - Create a new branch
