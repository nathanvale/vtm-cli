# Example: Generated "PM" Domain

This document shows what actual generated files look like after running:

```bash
/design:domain pm "Project Management"
/scaffold:domain pm
```

## Design Spec Used

```json
{
  "name": "pm",
  "description": "Project Management Workflows",
  "design": {
    "operations": [
      { "name": "next", "description": "Get next PM task" },
      { "name": "context", "description": "Get task context" },
      { "name": "list", "description": "List all tasks" }
    ],
    "auto_discovery": {
      "enabled": true,
      "suggested_triggers": [
        "what should I work on",
        "next task",
        "pm status",
        "show my tasks"
      ]
    },
    "external_integration": {
      "needed": true,
      "systems": [{"name": "notion", "type": "database"}]
    },
    "automation": {
      "enabled": true,
      "hooks": [{"event": "pre-commit", "action": "validate"}]
    },
    "sharing": {"scope": "team", "team_members": ["user1", "user2"]}
  }
}
```

## Generated Files

### 1. Command: `.claude/commands/pm/next.md`

```markdown
---
name: pm:next
description: Get next PM task to work on
namespace: pm
version: 1.0.0
allowed-tools: Bash, Read
argument-hint: [optional-filter] [optional-limit]
---

# PM: Next Task

Get the next task from your PM queue.

## Usage

\`\`\`
/pm:next [filter] [limit]
\`\`\`

## Parameters

- `filter` (optional): Filter by status (pending, in-progress, blocked)
- `limit` (optional): Maximum results (default: 5)

## Examples

\`\`\`bash
/pm:next
/pm:next pending
/pm:next in-progress 10
\`\`\`

## Implementation

This is a template stub. Customize with:

\`\`\`bash
#!/bin/bash

FILTER="${ARGUMENTS[0]:-all}"
LIMIT="${ARGUMENTS[1]:-5}"

# TODO: Implement fetching next task
# Connect to your PM system (Notion, database, etc.)

echo "Getting next $LIMIT PM tasks (filter: $FILTER)"
echo ""
echo "💡 Customize this command:"
echo "1. Connect to your PM system"
echo "2. Implement filtering logic"
echo "3. Add status indicators"
\`\`\`

## Next Steps

1. Replace the bash stub with your implementation
2. Connect to your PM system via MCP (/pm:notion)
3. Test: \`/pm:next\`
```

### 2. Skill: `.claude/skills/pm-expert/SKILL.md`

```markdown
---
name: pm-expert
description: |
  Project Management domain expert.

  Knows about:
  - Getting next task to work on
  - Getting task context
  - Listing all tasks

  Use when:
  - User asks "what should I work on"
  - Needs task context before starting work
  - Reviewing tasks

trigger_phrases:
  - "what should I work on"
  - "next task"
  - "pm status"
  - "show my tasks"

related_commands:
  - /pm:next
  - /pm:context
  - /pm:list
---

# PM Expert Skill

## What This Skill Does

Helps you manage your PM workflow with smart command suggestions.

## Available Commands

- \`/pm:next\` - Get next task to work on
- \`/pm:context\` - Get context for current task
- \`/pm:list\` - List all tasks

## When Claude Uses This

When you mention things like:
- "What should I work on?" → Suggests \`/pm:next\`
- "Show me my tasks" → Suggests \`/pm:list\`
- "I need context" → Suggests \`/pm:context\`

## Best Practices

1. **Before starting work**: Run \`/pm:next\`
2. **Understand scope**: Run \`/pm:context\` to see dependencies
3. **Track progress**: Run \`/pm:review\` regularly
```

### 3. MCP Server: `.claude/mcp-servers/pm-notion/mcp.json`

```json
{
  "name": "pm-notion",
  "type": "mcp",
  "description": "Notion database integration for PM tasks",
  "version": "1.0.0",

  "connection": {
    "type": "api",
    "service": "notion",
    "auth_type": "bearer_token"
  },

  "configuration": {
    "endpoint": "https://api.notion.com/v1",
    "required_env_vars": [
      "PM_NOTION_API_KEY",
      "PM_NOTION_DATABASE_ID"
    ],
    "credentials": {
      "api_key": "${PM_NOTION_API_KEY}",
      "database_id": "${PM_NOTION_DATABASE_ID}"
    }
  },

  "operations": {
    "read": {
      "queries": [
        {
          "name": "list_tasks",
          "description": "List all PM tasks from Notion",
          "parameters": {
            "filter": "optional - status filter",
            "limit": "max results"
          }
        },
        {
          "name": "get_task_details",
          "description": "Get detailed task information",
          "parameters": {
            "task_id": "required - task ID"
          }
        }
      ]
    },
    "write": {
      "mutations": [
        {
          "name": "update_task_status",
          "description": "Update task status",
          "parameters": {
            "task_id": "required",
            "status": "pending|in-progress|completed"
          }
        }
      ]
    }
  },

  "setup": {
    "required_env_vars": [
      {
        "name": "PM_NOTION_API_KEY",
        "where_to_get": "https://developers.notion.com/tokens",
        "example": "secret_abc123..."
      },
      {
        "name": "PM_NOTION_DATABASE_ID",
        "where_to_get": "From Notion dashboard",
        "example": "abc123def456"
      }
    ]
  }
}
```

### 4. Pre-Commit Hook: `.claude/hooks/pre-commit/pm-validate.sh`

```bash
#!/bin/bash
# Pre-commit Hook: pm Validation

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

COMMIT_MSG=$(cat "$1")

# Validate PM task reference
if ! echo "$COMMIT_MSG" | grep -qE "TASK-[0-9]+|PM-[0-9]+"; then
    echo -e "${RED}✗${NC} Commit must reference a PM task"
    echo ""
    echo "Format: TASK-123: Your commit message"
    echo ""
    echo "If you don't have a task:"
    echo "  1. Run: /pm:next"
    echo "  2. Use the task ID in your commit"
    exit 1
fi

echo -e "${GREEN}✓${NC} PM task validation passed"
exit 0
```

### 5. Plugin Manifest: `.claude/plugins/pm-automation/plugin.yaml`

```yaml
name: pm-automation
version: 1.0.0
description: Complete PM domain with task management and auto-discovery

metadata:
  author: "user"
  created_at: "2025-10-29T14:30:00Z"
  namespace: "pm"
  sharing:
    scope: "team"
    team_members:
      - "user1@example.com"
      - "user2@example.com"

components:
  commands:
    - namespace: "pm"
      path: "../../commands/pm/"
      commands:
        - name: "next"
          file: "next.md"
          description: "Get next PM task"
        - name: "context"
          file: "context.md"
          description: "Get task context"
        - name: "list"
          file: "list.md"
          description: "List all tasks"

  skills:
    - name: "pm-expert"
      path: "../../skills/pm-expert/SKILL.md"
      trigger_phrases:
        - "what should I work on"
        - "next task"
        - "pm status"

  mcp_servers:
    - name: "pm-notion"
      path: "../../mcp-servers/pm-notion/mcp.json"
      configuration:
        required: true
        environment_vars:
          - "PM_NOTION_API_KEY"
          - "PM_NOTION_DATABASE_ID"

  hooks:
    - name: "pre-commit"
      event: "pre-commit"
      path: "../../hooks/pre-commit/pm-validate.sh"

quality:
  status: "beta"
  testing:
    unit_tests: false
    integration_tests: false
    user_tested: false
  security:
    reviewed: false
    status: "pending_review"
  documentation:
    complete: true
    readme: true
    api_docs: false
```

### 6. Plugin README: `.claude/plugins/pm-automation/README.md`

```markdown
# PM Automation Plugin

Version: 1.0.0
Namespace: /pm

Complete PM domain plugin with commands, auto-discovery, and Notion integration.

## Quick Start

Already installed? Use immediately:

\`\`\`bash
/pm:next              # Get next task
/pm:context TASK-123  # Get details
/pm:list              # See all tasks
\`\`\`

## Setup

### 1. Get Notion Credentials

1. Go to: https://developers.notion.com/
2. Create integration and get API key
3. Add to database: https://api.notion.com/v1/databases/YOUR-ID

### 2. Set Environment Variables

\`\`\`bash
export PM_NOTION_API_KEY="secret_abc123..."
export PM_NOTION_DATABASE_ID="abc123def456"
\`\`\`

### 3. Test Connection

\`\`\`bash
/pm:test-connection
# Should output: ✓ Connected to Notion
\`\`\`

## Features

✅ Get next task to work on
✅ Auto-discovery skill
✅ Notion integration
✅ Pre-commit validation
✅ Team sharing

## Examples

### Get Your Next Task

\`\`\`bash
You: "What should I work on?"
Claude: /pm:next
# → Shows: TASK-123: Implement feature
\`\`\`

### Ensure Commits Link to Tasks

\`\`\`bash
git commit -m "TASK-123: Your work"  # ✓ Succeeds

git commit -m "Random fix"           # ✗ Fails
# Error: Commit must reference a task ID
\`\`\`

## Customization

### Change Trigger Phrases

Edit \`.claude/skills/pm-expert/SKILL.md\`:

\`\`\`yaml
trigger_phrases:
  - "what should I work on"
  - "next item"
  - "show my queue"
\`\`\`

### Add More Commands

Copy a command file and customize:

\`\`\`bash
cp .claude/commands/pm/next.md .claude/commands/pm/review.md
# Edit review.md with new logic
\`\`\`

## Troubleshooting

### Commands not suggesting?

Make sure trigger phrases match your vocabulary.

### Connection errors?

\`\`\`bash
# Check credentials
echo $PM_NOTION_API_KEY

# Test connection
/pm:test-connection
\`\`\`

## Next Steps

1. Customize trigger phrases
2. Test each command
3. Share with team
4. Add more commands as needed
```

## File Structure After Generation

```
.claude/
├── commands/pm/
│   ├── next.md       (generated from command-template.md)
│   ├── context.md    (generated from command-template.md)
│   └── list.md       (generated from command-template.md)
│
├── skills/pm-expert/
│   └── SKILL.md      (generated from skill-template.md)
│
├── mcp-servers/pm-notion/
│   └── mcp.json      (generated from mcp-template.json)
│
├── hooks/pre-commit/
│   └── pm-validate.sh    (generated from hook-pre-commit-template.sh)
│
└── plugins/pm-automation/
    ├── plugin.yaml       (generated from plugin-template.yaml)
    └── README.md         (generated from plugin-readme-template.md)
```

## Registry After Scaffolding

When running `/registry:scan`, it discovers:

```
Components Found: 5

Commands (3):
  • /pm:next      - Get next PM task [ready]
  • /pm:context   - Get task context [ready]
  • /pm:list      - List all tasks [ready]

Skills (1):
  • pm-expert     - PM domain expert [ready]
    Triggers: "what should I work on", "next task", "pm status", "show my tasks"

MCP Servers (1):
  • pm-notion     - Notion integration [needs_config]
    Missing: PM_NOTION_API_KEY, PM_NOTION_DATABASE_ID

Hooks (1):
  • pre-commit    - PM task validation [active]

Plugins (1):
  • pm-automation - Complete PM domain [v1.0.0]

Relationships:
  pm:next → depends on pm-notion (MCP)
  pm:context → depends on pm-notion (MCP)
  pm:list → depends on pm-notion (MCP)
  pm-expert (Skill) → enables /pm:next, /pm:context, /pm:list
```

## User Workflow After Generation

```
1. User runs: /design:domain pm
   → Answers 5 questions
   → Design saved to .claude/designs/pm.json

2. User runs: /scaffold:domain pm
   → Files generated
   → Summary shown
   → Ready to customize

3. User customizes:
   → Edit commands with real implementation
   → Set environment variables
   → Test each command

4. User tests:
   → /pm:next
   → /pm:context TASK-001
   → /pm:list

5. User verifies:
   → /registry:scan pm
   → Sees all components registered

6. User shares:
   → /share:plugin pm-automation
   → Team members can use

7. Auto-discovery works:
   → User: "What should I work on?"
   → Claude: /pm:next
   → Claude runs command and shows result
```

## Key Observations

1. **Placeholders Replaced:** All {placeholders} are replaced with actual values
2. **Frontmatter Complete:** YAML frontmatter includes all required fields
3. **Customization Comments:** Clear guidance on what to modify
4. **Examples Included:** Multiple implementation patterns shown
5. **Cross-References:** Files link to each other appropriately
6. **Ready to Use:** Can test commands immediately after setup
7. **Team Ready:** plugin.yaml configured for team sharing

This is what a scaffolded domain looks like!
