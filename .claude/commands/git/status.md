---
allowed-tools: Bash(git:*)
description: Get the current git status
argument-hint: [format]
---

# Git: Status

Get the current git status

## Usage

```bash
/git:status
/git:status short
/git:status porcelain
```

## Parameters

- `format` (optional): Output format (default: standard)
  - `short` - Abbreviated format
  - `porcelain` - Machine-readable format

## Examples

```bash
/git:status
/git:status short
/git:status porcelain
```

## Implementation

This is a template. Customize with your specific logic:

```bash
#!/bin/bash

FORMAT="${ARGUMENTS[0]:-}"

if [ "$FORMAT" = "short" ]; then
  git status -s
elif [ "$FORMAT" = "porcelain" ]; then
  git status --porcelain
else
  git status
fi
```

## What This Shows

- Currently checked out branch
- Untracked files
- Staged changes
- Unstaged changes
- Commit status

## Tips

- Use `short` format for quick overview
- Use `porcelain` for scripting
- Run before committing to verify changes
