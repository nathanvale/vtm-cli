---
allowed-tools: Bash(git:*)
description: Make a commit with special instructions
argument-hint: [message]
---

# Git: Commit

Make a commit with special instructions

## Usage

```bash
/git:commit
/git:commit "Add authentication feature"
/git:commit
```

## Parameters

- `message` (optional): Commit message
  - If not provided, opens interactive commit message builder

## Examples

```bash
/git:commit "feat: Add user authentication"
/git:commit "fix: Resolve login timeout issue"
/git:commit "docs: Update README with setup instructions"
```

## Commit Message Format

Use conventional commits format:

```
type(scope): subject

body

footer
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Code style (no logic change)
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `test:` - Tests
- `ci:` - CI/CD changes

## Implementation

This is a template. Customize with your specific logic:

```bash
#!/bin/bash

MESSAGE="${ARGUMENTS[@]}"

if [ -z "$MESSAGE" ]; then
  # Interactive mode - ask for details
  echo "Commit type (feat/fix/docs/refactor/etc):"
  read TYPE

  echo "Scope (optional):"
  read SCOPE

  echo "Subject:"
  read SUBJECT

  echo "Body (optional, press Ctrl+D when done):"
  read -d '' BODY

  if [ -z "$SCOPE" ]; then
    MESSAGE="$TYPE: $SUBJECT"
  else
    MESSAGE="$TYPE($SCOPE): $SUBJECT"
  fi

  if [ -n "$BODY" ]; then
    MESSAGE="$MESSAGE

$BODY"
  fi
fi

git commit -m "$MESSAGE"
```

## Tips

- Write clear, descriptive commit messages
- Keep messages under 50 characters for subject line
- Reference issues: `Fixes #123`
- Use present tense: "add" not "added"
- Check status before committing: `/git:status`
