---
allowed-tools: Bash(git:*)
description: Create a new branch
argument-hint: <branch-name> [from-branch]
---

# Git: Create Branch

Create a new branch

## Usage

```bash
/git:create-branch feature-name
/git:create-branch feature-name develop
```

## Parameters

- `branch-name` (required): Name for the new branch
- `from-branch` (optional): Base branch (default: current branch)

## Examples

```bash
/git:create-branch feature/auth
/git:create-branch feature/dashboard develop
/git:create-branch bugfix/login-issue main
```

## Implementation

This is a template. Customize with your specific logic:

```bash
#!/bin/bash

BRANCH="${ARGUMENTS[0]}"
FROM_BRANCH="${ARGUMENTS[1]:-}"

if [ -z "$BRANCH" ]; then
  echo "Branch name required"
  exit 1
fi

if [ -n "$FROM_BRANCH" ]; then
  git checkout "$FROM_BRANCH"
fi

git checkout -b "$BRANCH"
```

## Branch Naming Conventions

- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Production hotfixes
- `refactor/description` - Refactoring work
- `docs/description` - Documentation updates

## Tips

- Use descriptive branch names
- Keep branch names lowercase with hyphens
- Reference issue numbers when relevant: `feature/issue-123-auth`
- Clean up branches after merging
