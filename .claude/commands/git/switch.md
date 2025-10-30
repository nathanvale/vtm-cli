---
allowed-tools: Bash(git:*)
description: Switch branches
argument-hint: <branch-name> [--create]
---

# Git: Switch

Switch to a different branch

## Usage

```bash
/git:switch main
/git:switch feature-name
/git:switch feature-name --create
```

## Parameters

- `branch-name` (required): Name of the branch to switch to
- `--create` (optional): Create the branch if it doesn't exist

## Examples

```bash
/git:switch main
/git:switch feature/new-feature
/git:switch develop --create
```

## Implementation

This is a template. Customize with your specific logic:

```bash
#!/bin/bash

BRANCH="${ARGUMENTS[0]}"
CREATE_FLAG="${ARGUMENTS[1]:-}"

if [ -z "$BRANCH" ]; then
  echo "Branch name required"
  exit 1
fi

if [ "$CREATE_FLAG" = "--create" ]; then
  git switch -c "$BRANCH"
else
  git switch "$BRANCH"
fi
```

## Common Branches

- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

## Tips

- Use `--create` to create and switch in one command
- Check status before switching: `/git:status`
- Stash changes if needed before switching
