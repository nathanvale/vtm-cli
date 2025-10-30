---
allowed-tools: Bash(git:*)
description: View history/what's been done
argument-hint: [--oneline] [--graph] [limit]
---

# Git: Log

View commit history and what's been done

## Usage

```bash
/git:log
/git:log --oneline
/git:log --graph
/git:log --oneline 10
```

## Parameters

- `--oneline` (optional): Compact format (one line per commit)
- `--graph` (optional): Show branch structure as graph
- `limit` (optional): Number of commits to show (default: 10)

## Examples

```bash
/git:log
/git:log --oneline
/git:log --graph --oneline
/git:log --oneline 20
/git:log --graph --oneline 15
```

## Implementation

This is a template. Customize with your specific logic:

```bash
#!/bin/bash

ONELINE=""
GRAPH=""
LIMIT="10"

for arg in "${ARGUMENTS[@]}"; do
  case "$arg" in
    --oneline) ONELINE="--oneline" ;;
    --graph) GRAPH="--graph --all" ;;
    *) LIMIT="$arg" ;;
  esac
done

git log $GRAPH $ONELINE -n "$LIMIT"
```

## Common Formats

**Standard format:**
```
commit abc123...
Author: Name <email>
Date: ...

    Commit message
```

**Oneline format:**
```
abc123 Commit message
def456 Another commit
```

**Graph format:**
Shows branch merges and relationships visually

## Tips

- Use `--oneline` for quick overview
- Use `--graph` to see branching history
- Combine: `/git:log --graph --oneline 20`
- Search: `git log --grep="keyword"`
- Show specific author: `git log --author="name"`
- Check what changed: `git log -p` for full diff

## What You'll See

- Commit hashes
- Authors
- Dates
- Commit messages
- Branching structure (with --graph)
