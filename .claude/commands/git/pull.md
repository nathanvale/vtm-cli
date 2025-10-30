---
allowed-tools: Bash(git:*)
description: Pull changes
argument-hint: [remote] [branch]
---

# Git: Pull

Pull changes from remote repository

## Usage

```bash
/git:pull
/git:pull origin
/git:pull origin main
```

## Parameters

- `remote` (optional): Remote name (default: origin)
- `branch` (optional): Branch name (default: current branch)

## Examples

```bash
/git:pull
/git:pull origin
/git:pull origin main
/git:pull upstream develop
```

## Implementation

This is a template. Customize with your specific logic:

```bash
#!/bin/bash

REMOTE="${ARGUMENTS[0]:-origin}"
BRANCH="${ARGUMENTS[1]:-}"

if [ -n "$BRANCH" ]; then
  git pull "$REMOTE" "$BRANCH"
else
  git pull "$REMOTE"
fi
```

## What Pull Does

1. Fetches changes from remote
2. Merges them into current branch
3. Updates local branch

## Common Remotes

- `origin` - Your fork or main repo
- `upstream` - Original repo (if forked)

## Tips

- Commit or stash changes before pulling
- Use `--rebase` for linear history: `git pull --rebase`
- Check remote branches: `/git:log`
- Resolve conflicts if needed
