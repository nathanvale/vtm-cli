# Claude Code Extensibility: Practical Implementation Guide

Companion to the Claude Code Extensibility Expert Prompt

## How to Use This System

### For Individual Developers

1. Start with local `.claude/commands/` for personal workflows
2. Move to `.claude/skills/` when you want auto-discovery
3. Package as plugin when team requests it

### For Teams

1. Establish command conventions in `.claude/commands/`
2. Create shared skills in `.claude/skills/`
3. Bundle as plugin in `.claude/plugins/` for distribution
4. Publish to `claude-code-plugins-plus` or internal registry

### For Open Source

1. Build plugin in separate repo
2. Use plugin.yaml for versioning
3. Publish marketplace entry
4. Maintain documentation & community feedback

---

## Template 1: Simple Slash Command → Skill Evolution

### Phase 1: Just a Command

**File:** `.claude/commands/mytask.md`

```markdown
# My Task

Quick description of what this does.

Usage: \`/project:mytask arg1 arg2\`

\`\`\`bash
#!/bin/bash
echo "Argument 1: $ARGUMENTS[0]"
echo "Argument 2: $ARGUMENTS[1]"
\`\`\`
```

**Status:** Users must remember to use it. Local only.

---

### Phase 2: Add Skill for Auto-Discovery

**Add File:** `.claude/skills/my-task-skill/SKILL.md`

```markdown
---
name: my-task-workflow
description: |
  Handles my task automation with smart decisions.
  Use when user mentions:
  - Needing to run my task
  - Working on specific domain
  - Automating this process

trigger_phrases:
  - "run my task"
  - "automate my task"
  - "my task for"
---

# My Task Automation Skill

This skill teaches Claude when and how to run your task automatically.

## When Claude Uses This

- User asks to automate something related
- Recognizes opportunity to save time

## How It Works

Available command: \`/project:mytask {arg1} {arg2}\`

## Best Practices

- Always validate inputs first
- Confirm destructive operations
- Log results for audit trail
```

**Status:** Claude auto-detects when to use. Still local.

---

### Phase 3: Convert to Shareable Plugin

**Create Directory:** `.claude/plugins/mytask-plugin/`

**File:** `.claude/plugins/mytask-plugin/plugin.yaml`

```yaml
name: mytask-automation
version: 1.0.0
description: Automated task handling with smart triggering

components:
  commands:
    - path: commands/
  skills:
    - path: SKILL.md

metadata:
  author: Your Name
  repository: github.com/yourname/mytask-plugin
  marketplace: claude-code-plugins-plus
  tags: [automation, productivity]
```

**Status:** Versionable. Shareable. Team-installable with `/plugin install`.

---

## Template 2: Complex Workflow (Git Worktree Manager)

### Step 1: Identify Components Needed

```
User Goal: Manage parallel development with git worktrees + ports

Components Required:
✓ Slash Commands (user-invoked actions)
✓ Skills (Claude knows when to suggest)
✓ Hooks (auto-validation)
✗ MCP (not needed - local git only)
✗ Subagents (not needed - single focused task)

Result: Plugin with commands + skills + hooks
```

### Step 2: Create Directory Structure

```
.claude/plugins/git-worktree-manager/
├── plugin.yaml
├── SKILL.md
├── commands/
│   ├── create.md
│   ├── list.md
│   ├── switch.md
│   └── delete.md
├── hooks/
│   ├── pre-commit/
│   │   └── validate-branch.sh
│   └── post-create/
│       └── setup-env.sh
└── README.md
```

### Step 3: Define the Skill (Auto-Discovery)

**File:** `.claude/plugins/git-worktree-manager/SKILL.md`

```markdown
---
name: git-worktree-orchestration
description: |
  Expert in managing git worktrees for parallel development.

  Understands:
  - Creating isolated worktrees per feature branch
  - Port allocation for multiple dev servers
  - Switching between active worktree contexts
  - Cleaning up completed worktrees
  - Tracking metadata (branch → port mapping)

  Use when:
  - Developer needs to work on multiple features simultaneously
  - Creating new feature branch with isolated environment
  - Managing parallel development coordination
  - Assigning ports to avoid conflicts
  - Switching development contexts

trigger_phrases:
  - "create a worktree"
  - "new worktree for"
  - "worktree on port"
  - "parallel development"
  - "switch worktree"
  - "list worktrees"
  - "multiple branches at once"
---

# Git Worktree Manager Skill

## Purpose

Enables productive parallel development by managing isolated worktrees with
coordinated port allocation and context switching.

## When Claude Should Use This

- User asks to work on multiple branches simultaneously
- Creating new feature branch development environment
- Need to manage multiple dev servers on different ports
- Switching between active development contexts

## Available Commands

- \`/project:worktree:create {branch} {port}\` - Create new worktree
- \`/project:worktree:list\` - View all active worktrees with ports
- \`/project:worktree:switch {branch}\` - Change to worktree
- \`/project:worktree:delete {branch}\` - Clean up finished worktree

## Smart Behaviors

1. **Port Validation:** Check port isn't already allocated
2. **Branch Validation:** Verify branch exists before creating
3. **Metadata Tracking:** Maintain worktrees.json with branch→port mapping
4. **Collision Detection:** Warn if switching to worktree with running server
5. **Cleanup Reminders:** Ask about old completed worktrees

## Example Conversation

User: "I want to work on feature-auth and feature-api at the same time"
Claude: "I can set up parallel worktrees for you. Let me create isolated
environments on different ports."
→ /project:worktree:create feature-auth 3001
→ /project:worktree:create feature-api 3002

User: "Switch to feature-auth"
Claude: "Switching to feature-auth worktree (port 3001)"
→ /project:worktree:switch feature-auth

## Best Practices

- Always confirm port numbers before creating
- Keep worktree.json in git for team coordination
- Clean up worktrees when features complete
- Use consistent port numbering: main=3000, features=3001-3010
```

### Step 4: Create Commands (Each with Arguments)

**File:** `.claude/plugins/git-worktree-manager/commands/create.md`

```markdown
---
name: create
description: Create new git worktree in trees/ directory
---

# Create Git Worktree

Create isolated worktree for parallel development.

Usage: \`/project:worktree:create <branch> <port>\`

Example: \`/project:worktree:create feature-auth 3001\`

\`\`\`bash
#!/bin/bash
set -e

BRANCH="$ARGUMENTS[0]"
PORT="$ARGUMENTS[1]"
TREES_DIR="./trees"
WORKTREE_PATH="$TREES_DIR/$BRANCH"

# Validate

if [ -z "$BRANCH" ] || [ -z "$PORT" ]; then
echo "Error: Missing branch or port"
echo "Usage: /project:worktree:create <branch> <port>"
exit 1
fi

# Check port not in use

if grep -q ":$PORT" "$TREES_DIR/.worktrees" 2>/dev/null; then
echo "Error: Port $PORT already allocated"
exit 1
fi

# Create trees directory

mkdir -p "$TREES_DIR"

# Create worktree

git worktree add "$WORKTREE_PATH" "$BRANCH" || {
echo "Creating branch first..."
git checkout -b "$BRANCH"
  git worktree add "$WORKTREE_PATH" "$BRANCH"
}

# Save metadata

echo "$BRANCH:$PORT:$(date +%s)" >> "$TREES_DIR/.worktrees"
echo "PORT=$PORT" > "$WORKTREE_PATH/.env.worktree"

echo "✅ Worktree created!"
echo "📂 Location: $WORKTREE_PATH"
echo "🔌 Port: $PORT"
echo "🚀 Next: cd $WORKTREE_PATH && claude code ."
\`\`\`
```

**File:** `.claude/plugins/git-worktree-manager/commands/list.md`

```markdown
---
name: list
description: List all active worktrees and their ports
---

# List Worktrees

View all active development worktrees with allocated ports.

Usage: \`/project:worktree:list\`

\`\`\`bash
#!/bin/bash
TREES_DIR="./trees"

echo "🌳 Active Worktrees:"
echo ""

if [ ! -f "$TREES_DIR/.worktrees" ]; then
echo " No worktrees yet"
exit 0
fi

while IFS=: read -r branch port timestamp; do
if [ -d "$TREES_DIR/$branch" ]; then # Calculate age
age=$(($(date +%s) - timestamp))
age_hours=$((age / 3600))

    echo "  • $branch"
    echo "    Port: $port | Age: ${age_hours}h"
    echo "    Path: $TREES_DIR/$branch"
    echo ""

fi
done < "$TREES_DIR/.worktrees"
\`\`\`
```

### Step 5: Add Hooks (Automation)

**File:** `.claude/plugins/git-worktree-manager/hooks/pre-commit/validate-branch.sh`

```bash
#!/bin/bash
# Auto-run before commits in any worktree
# Validates we're on a feature branch, not main

BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" = "main" ] || [ "$BRANCH" = "master" ]; then
  echo "❌ Error: Cannot commit directly to $BRANCH"
  echo "Create a worktree instead: /project:worktree:create feature-name PORT"
  exit 1
fi

echo "✅ Branch validation passed: $BRANCH"
exit 0
```

### Step 6: Plugin Manifest

**File:** `.claude/plugins/git-worktree-manager/plugin.yaml`

```yaml
name: git-worktree-manager
version: 1.2.0
description: Complete git worktree orchestration for parallel development

components:
  commands:
    - path: commands/
      namespace: worktree

  skills:
    - path: SKILL.md

  hooks:
    - event: pre-commit
      script: hooks/pre-commit/validate-branch.sh

metadata:
  author: Your Team
  repository: github.com/yourorg/claude-code-plugins
  marketplace: claude-code-plugins-plus

  tags:
    - git
    - parallelization
    - development
    - worktrees

  dependencies:
    - git 2.34+

  tested_with:
    - Node.js 18+
    - Python 3.10+
    - macOS 12+
    - Ubuntu 20.04+
```

---

## Template 3: Team Standardization Plugin

### Create Plugin for Shared Team Standards

**Goal:** Every developer gets same code review process, test standards, commit conventions

**File:** `.claude/plugins/team-standards/SKILL.md`

```markdown
---
name: team-development-standards
description: |
  Encodes your team's development philosophy and standards.
  Teaches Claude your expectations for:
  - Code review criteria
  - Testing requirements
  - Commit message conventions
  - Performance benchmarks
  - Documentation standards

trigger_phrases:
  - "code review"
  - "test this"
  - "commit message"
  - "ready for PR"
  - "am I following standards"
---

# Team Development Standards

[Full team standards encoded here...]
```

**Distribution:**

```bash
# Team publishes plugin
git checkout -b plugin/team-standards
# Add to .claude/plugins/team-standards/
git add .claude/plugins/team-standards/
git commit -m "feat: add team standards plugin"
git push

# Update team's Claude Code setup
echo "team-standards:" >> .claude/plugins/manifest.yml

# Every team member runs:
/plugin install team-standards@company-registry
```

**Result:** All team members instantly get:

- Same slash commands (code-review, test-all, commit-check)
- Same skills (auto-detects when standards apply)
- Same hooks (lint runs pre-commit)
- Same subagents (PR reviewer, test coordinator)

---

## Template 4: Decision Tree for Your Workflow

Use this to figure out what components you need:

```
START: "I want to automate something"
│
├─ Is it just a quick utility?
│  └─ YES → Use SLASH COMMAND in .claude/commands/
│  └─ NO → Continue...
│
├─ Should Claude decide *when* to run this?
│  └─ YES → Add SKILL with trigger_phrases
│  └─ NO → Continue as command only
│
├─ Does it need external system access?
│  └─ YES → Need MCP SERVER
│  └─ NO → Continue...
│
├─ Is this complex with multiple steps?
│  └─ YES → Consider SUBAGENTS
│  └─ NO → Continue...
│
├─ Should it auto-run on events?
│  └─ YES → Add HOOKS
│  └─ NO → Continue...
│
├─ Will team/others use this?
│  └─ YES → Package as PLUGIN
│  └─ NO → Keep as local commands/skills
│
END: You have your architecture!
```

---

## Real-World Reference: What People Are Building

**From Jeremy Longshore's 234+ plugins:**

- Excel Analyst Pro (with auto-invoked Skills)
- DevOps Automation Pack (MCP + Hooks + Subagents)
- Domain Memory Agent (semantic search with TF-IDF)
- Testing Framework (pre-flight validations)

**From Community (Kenny, Leon, etc.):**

- YouTube Research Agents
- Code Review Automation
- Database Query Skills (SQL, Dataverse)
- CI/CD Pipeline Integration
- Documentation Generators

---

## Key Takeaways

1. **Start Simple:** Command → Skill → Plugin progression
2. **Structure Matters:** .claude/ directory organization enables scaling
3. **Trigger Phrases:** Teach Claude when to use your workflow
4. **Distribute:** Plugins make workflows shareable and team-scalable
5. **Community Learn:** Study Jeremy Longshore's plugins for patterns
6. **Iterate:** Start local, get feedback, publish when solid

---

## Resources to Reference When Using This Prompt

- **Kenny Liao:** Skills guide + cheatsheet (share.note.sx/8k50udm8)
- **Leon van Zyl:** Plugin creation walkthrough (YouTube Oct 16, 2025)
- **Jeremy Longshore:** 234 production plugins (github.com/jeremylongshore/)
- **Official Docs:** docs.claude.com/en/docs/claude-code/
- **Anthropic Skills Repo:** github.com/anthropics/skills
