---
allowed-tools: Bash(git:*)
description: Push changes
argument-hint: [remote] [branch]
---

# Git: Push

Push changes to remote repository

## Usage

```bash
/git:push
/git:push origin
/git:push origin main
```

## Parameters

- `remote` (optional): Remote name (default: origin)
- `branch` (optional): Branch name (default: current branch)

## Examples

```bash
/git:push
/git:push origin
/git:push origin feature/auth
/git:push upstream develop
```

## Implementation

This is a template. Customize with your specific logic:

```bash
#!/bin/bash

REMOTE="${ARGUMENTS[0]:-origin}"
BRANCH="${ARGUMENTS[1]:-}"

if [ -n "$BRANCH" ]; then
  git push "$REMOTE" "$BRANCH"
else
  git push "$REMOTE"
fi
```

## What Push Does

1. Sends local commits to remote
2. Updates remote branch
3. Makes changes available to others

## Force Push (Use with Caution!)

```bash
git push --force-with-lease origin branch-name
```

- Only force push to personal branches
- Never force push to shared branches
- Use `--force-with-lease` instead of `--force`

## Common Workflow

1. Make changes
2. `/git:commit "your message"`
3. `/git:push origin branch-name`
4. Create Pull Request on GitHub

## Tips

- Pull before pushing (get latest changes)
- Use branch names with push to be explicit
- Set upstream: `git push -u origin branch-name`
- Check status before pushing: `/git:status`
