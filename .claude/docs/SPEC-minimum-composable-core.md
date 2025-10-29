# Minimum Composable Core (MCC) - Implementation Specification

**Version:** 1.0-draft
**Status:** Implementation Ready

---

## Overview

The Minimum Composable Core consists of **3 slash commands** that enable the entire composable system:

1. **`/design:domain`** - Interactive thinking partner
2. **`/scaffold:domain`** - Template generator
3. **`/registry:scan`** - Component discovery

These three commands are sufficient to:
- Design new workflows
- Generate working structures
- Understand existing system
- Enable all future layers through self-extension

---

## Command 1: `/design:domain`

### Purpose
Interactive AI-powered thinking partner that helps users design what a domain should contain before building it.

### Command Signature
```bash
/design:domain {domain-name} [optional-description]
```

### Parameters
- `domain-name` (required): Name for the domain (e.g., "pm", "devops", "testing")
- `optional-description` (optional): High-level description of domain purpose

### Input Examples
```bash
/design:domain pm
/design:domain pm "Project Management Workflows"
/design:domain devops "Infrastructure and Deployment"
```

### Process Flow

**Step 1: Initialization**
```
User: /design:domain pm "Project Management"

System:
✅ Designing "pm" domain
📝 Let's work through what your PM domain should include.

```

**Step 2: Interactive Questioning**
Ask these questions in sequence, with explanations:

```
Question 1: OPERATIONS
─────────────────
What core operations does your PM domain need?

Examples:
  • Getting the next task to work on
  • Reviewing progress/status
  • Getting context for current task
  • Listing all tasks
  • Creating new tasks
  • Updating task status

Your domain operations:
→ [Awaiting user input]

```

```
Question 2: DISCOVERY
──────────────────
Should users manually invoke these operations, or should Claude
auto-suggest them based on conversation?

For example:
  Manual:     /pm:next (user always says this)
  Auto:       User says "what should I work on?" → Claude suggests /pm:next

Recommendation:
  • Commands: Use both (manual + auto)
  • Skills: Auto-discovery through trigger phrases

Enable auto-discovery (Skills)? (yes/no)
→ [Awaiting user input]

```

```
Question 3: EXTERNAL SYSTEMS
──────────────────────────────
Does your PM domain need to connect to external systems?

Examples:
  • Database (project management app, Jira, Notion)
  • API (retrieve/update data)
  • Cloud service (store/sync)

Need external integration (MCP)? (yes/no/maybe)
→ [Awaiting user input]

```

```
Question 4: AUTOMATION
──────────────────────
Should some operations run automatically?

Examples:
  • Pre-commit: Validate task status before committing
  • Scheduled: Daily standup digest
  • Triggered: On task completion, update metrics

Need automation (Hooks)? (yes/no)
→ [Awaiting user input]

```

```
Question 5: SHARING
──────────────────
Who will use this domain?

Options:
  • Just me (personal, local only)
  • My team (shared repository)
  • Community (public registry)

Sharing scope: (personal/team/community)
→ [Awaiting user input]

```

### Output: Design Specification

Save to: `.claude/designs/{domain}.json`

```json
{
  "name": "pm",
  "description": "Project Management Workflows",
  "version": "1.0.0",
  "created_at": "2025-10-29T14:32:00Z",

  "design": {
    "operations": [
      {
        "name": "next",
        "description": "Get next PM task to work on",
        "triggers_auto_discovery": true,
        "manual_invocation": "/pm:next"
      },
      {
        "name": "review",
        "description": "Review PM progress and status",
        "triggers_auto_discovery": true,
        "manual_invocation": "/pm:review"
      },
      {
        "name": "context",
        "description": "Get context for current PM task",
        "triggers_auto_discovery": true,
        "manual_invocation": "/pm:context"
      }
    ],

    "auto_discovery": {
      "enabled": true,
      "type": "skill",
      "suggested_triggers": [
        "what should I work on",
        "next task",
        "next pm",
        "show my tasks",
        "pm status",
        "pm review"
      ]
    },

    "external_integration": {
      "needed": true,
      "type": "mcp",
      "systems": [
        {
          "name": "project_db",
          "type": "database",
          "description": "Project management database"
        }
      ]
    },

    "automation": {
      "enabled": true,
      "hooks": [
        {
          "event": "pre-commit",
          "action": "validate_task_linked"
        }
      ]
    },

    "sharing": {
      "scope": "team",
      "team_members": ["user1", "user2"],
      "published": false
    },

    "recommendations": {
      "start_with": [
        "Create commands for: next, review, context",
        "Add skill with trigger phrases for auto-discovery",
        "Create MCP stub for database connection",
        "Add pre-commit hook for validation"
      ],
      "next_steps": [
        "Run: /scaffold:domain pm",
        "Customize generated commands",
        "Test commands work locally",
        "Add quality gates when ready"
      ]
    }
  }
}
```

### User Interaction Example

```
You: /design:domain pm

Claude Design Partner:
  ✨ Let me help you design your PM domain.

  📝 Question 1/5: Core Operations
  ─────────────────────────────────
  What operations should your PM domain include?

  I'm thinking:
  • /pm:next - Get next task
  • /pm:review - Check progress
  • /pm:context - Get task context

  Does this match your needs? Anything to add/remove?

You: Looks good, also need /pm:list

Claude:
  Great! Adding /pm:list to the design.

  📝 Question 2/5: Auto-Discovery
  ─────────────────────────────────
  Should Claude suggest these commands automatically?

  Example: When you say "what should I work on?",
  Claude could suggest running /pm:next

  Enable auto-discovery? (yes/no)

You: Yes

Claude:
  Perfect! This requires a Skill with trigger phrases.

  📝 Question 3/5: External Systems
  ─────────────────────────────────
  Do you need to connect to external systems?

  For example:
  • Notion (fetch tasks)
  • Jira (update status)
  • Database (store metadata)

  External integration needed? (yes/no/maybe)

You: Yes, need Notion integration

Claude:
  Got it. I'll add an MCP stub for Notion.

  📝 Question 4/5: Automation
  ─────────────────────────────
  Any operations that should run automatically?

  Examples:
  • Pre-commit: Check task is linked
  • Scheduled: Daily standup

  Automation needed? (yes/no)

You: Just pre-commit validation

Claude:
  Perfect! I'll add a pre-commit hook.

  📝 Question 5/5: Sharing
  ────────────────────────
  Who needs this domain?

  • Just me
  • My team
  • Public community

  Sharing scope?

You: My team

Claude:
  ✅ Design Complete!

  I've created your PM domain design at:
  📄 .claude/designs/pm.json

  Your design includes:
  • 4 commands: next, review, context, list
  • Auto-discovery skill with trigger phrases
  • MCP stub for Notion
  • Pre-commit validation hook
  • Team sharing configuration

  Next step:
  Run: /scaffold:domain pm

  This will generate all the files based on this design.
```

---

## Command 2: `/scaffold:domain`

### Purpose
Auto-generate complete `.claude/` structure from a design spec.

### Command Signature
```bash
/scaffold:domain {domain-name}
```

### Parameters
- `domain-name` (required): Name of domain to scaffold (must have .claude/designs/{domain}.json)

### Input Example
```bash
/scaffold:domain pm
```

### Process Flow

**Step 1: Read Design**
```
/scaffold:domain pm

✅ Reading design spec: .claude/designs/pm.json
📋 Design contains:
  • 4 operations: next, review, context, list
  • 1 skill: pm-expert
  • 1 MCP: notion
  • 1 hook: pre-commit
```

**Step 2: Generate Files**
Create the following structure:

```
.claude/
├── commands/pm/
│   ├── next.md          (command template)
│   ├── review.md        (command template)
│   ├── context.md       (command template)
│   └── list.md          (command template)
│
├── skills/pm-expert/
│   └── SKILL.md         (skill with trigger phrases)
│
├── mcp-servers/pm-notion/
│   └── mcp.json         (MCP configuration stub)
│
├── hooks/pre-commit/
│   └── pm-validate.sh   (hook script stub)
│
└── plugins/pm-automation/
    ├── plugin.yaml      (plugin manifest)
    ├── SKILL.md         (reference to skill)
    ├── commands/        (symlink to ../commands/pm/)
    ├── README.md        (team documentation)
    └── .env.example     (example config)
```

**Step 3: Generate Content**

### Generated Files

#### **1. Command File: `commands/pm/next.md`**
```markdown
---
name: pm:next
description: Get next PM task to work on
namespace: pm
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

## Example

\`\`\`
/pm:next
/pm:next pending
/pm:next in-progress 10
\`\`\`

## Implementation

\`\`\`bash
#!/bin/bash

FILTER="${ARGUMENTS[0]:-all}"
LIMIT="${ARGUMENTS[1]:-5}"

# TODO: Implement fetching next task
# This is a stub. Customize with:
# - Your task source (Notion, database, etc.)
# - Filtering logic
# - Sorting logic

echo "Getting next $LIMIT PM tasks (filter: $FILTER)"
echo ""
echo "💡 Customize this command:"
echo "1. Connect to your PM system (Notion, Jira, etc.)"
echo "2. Implement filtering logic"
echo "3. Add status indicators"
echo "4. Link to /pm:context for details"
\`\`\`

## Next Steps

1. Replace the bash stub with your implementation
2. Connect to your PM system via MCP (/pm:notion or similar)
3. Test: \`/pm:next\`
4. Once working, run: \`/evolve:add-skill pm:next\` to add auto-discovery
```

#### **2. Skill File: `skills/pm-expert/SKILL.md`**
```markdown
---
name: pm-expert
description: |
  Project Management domain expert.

  Knows about:
  - Getting next task to work on
  - Reviewing PM progress
  - Getting task context
  - Listing all tasks

  Use when:
  - User asks "what should I work on"
  - Needs task context before starting work
  - Reviewing progress/status
  - Managing PM workflow

trigger_phrases:
  - "next task"
  - "what should I work on"
  - "pm status"
  - "pm progress"
  - "show my tasks"
  - "task context"
  - "next pm"
  - "review tasks"
---

# PM Expert Skill

## What This Skill Does

Helps you manage your PM workflow with smart command suggestions.

## Available Commands

- `/pm:next` - Get next task to work on
- `/pm:review` - Check your PM progress
- `/pm:context` - Get context for current task
- `/pm:list` - List all tasks

## When Claude Uses This

When you mention things like:
- "What should I work on?" → Suggests `/pm:next`
- "Show me my tasks" → Suggests `/pm:list`
- "What's the status?" → Suggests `/pm:review`
- "I need context" → Suggests `/pm:context`

## Best Practices

1. **Before starting work**: Run `/pm:next` to get your task
2. **Understand scope**: Run `/pm:context` to see dependencies
3. **Track progress**: Run `/pm:review` regularly
4. **Maintain list**: Keep task list updated in your PM system

## Customization

Edit trigger phrases above to match your vocabulary.
Keep the skill description updated as you evolve the domain.
```

#### **3. MCP Configuration: `mcp-servers/pm-notion/mcp.json`**
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
    "api_key": "${NOTION_API_KEY}",
    "database_id": "${NOTION_DATABASE_ID}",
    "endpoint": "https://api.notion.com/v1"
  },

  "operations": {
    "read": {
      "queries": [
        "list_tasks",
        "get_task_details",
        "filter_by_status"
      ]
    },
    "write": {
      "mutations": [
        "update_task_status",
        "create_task",
        "delete_task"
      ]
    }
  },

  "setup": {
    "required_env_vars": [
      "NOTION_API_KEY",
      "NOTION_DATABASE_ID"
    ],
    "instructions": "Get credentials from: https://developers.notion.com/"
  }
}
```

#### **4. Hook Script: `hooks/pre-commit/pm-validate.sh`**
```bash
#!/bin/bash
# Pre-commit hook: Validate PM task linkage
# Ensures every commit is linked to a PM task

COMMIT_MSG=$(cat "$1")

# Check if commit message references a task
# Example: "TASK-001: Fix PM bug"

if ! echo "$COMMIT_MSG" | grep -qE "TASK-[0-9]+"; then
    echo "❌ Commit must reference a PM task"
    echo ""
    echo "Format your commit message:"
    echo "  TASK-123: Your commit message here"
    echo ""
    echo "If you don't have a task:"
    echo "  Run: /pm:next"
    echo "  Then link the task ID"
    exit 1
fi

echo "✅ PM task validation passed"
exit 0
```

#### **5. Plugin Manifest: `plugins/pm-automation/plugin.yaml`**
```yaml
name: pm-automation
version: 1.0.0
description: Complete PM domain with task management and auto-discovery

components:
  commands:
    - path: ../../commands/pm/
      namespace: pm
      commands:
        - next
        - review
        - context
        - list

  skills:
    - name: pm-expert
      path: ../../skills/pm-expert/SKILL.md
      trigger_phrases:
        - "next task"
        - "what should I work on"
        - "pm status"

  mcp_servers:
    - name: pm-notion
      type: notion
      path: ../../mcp-servers/pm-notion/
      required_config: [NOTION_API_KEY, NOTION_DATABASE_ID]

  hooks:
    - event: pre-commit
      script: ../../hooks/pre-commit/pm-validate.sh

metadata:
  author: user
  created_at: "2025-10-29"
  team_sharing: true
  team_members: ["user1", "user2"]

  tags:
    - project-management
    - pm
    - task-management
    - workflow

  quality:
    test_status: untested
    security_review: pending
    documentation_complete: false

  dependencies: []

  marketplace:
    published: false
    registry: internal
```

#### **6. Plugin README: `plugins/pm-automation/README.md`**
```markdown
# PM Automation Plugin

Complete Project Management domain for Claude Code.

## Quick Start

```bash
# Already installed? Use the commands
/pm:next                # Get next task
/pm:review              # Check progress
/pm:context             # Get task context
/pm:list                # List all tasks
```

## Setup

1. **Configure Notion Integration:**
   ```bash
   export NOTION_API_KEY="your-key"
   export NOTION_DATABASE_ID="your-db-id"
   ```

2. **Test the commands:**
   ```bash
   /pm:next
   ```

3. **Enable auto-discovery:**
   Just mention "what should I work on?" and Claude suggests `/pm:next`

## Features

✅ Auto-discovery of PM commands
✅ Notion integration for task source
✅ Pre-commit validation (links commits to tasks)
✅ Task context generation
✅ Progress tracking

## Customization

Edit the command files in `commands/pm/` to:
- Change how "next" task is selected
- Add filters and sorting
- Customize output format
- Add new operations

## Integration

Works seamlessly with other Claude Code domains:
- Test domain: `@before /pm:context`
- Deploy domain: `@requires /pm:status == "ready"`

## Support

Having issues? Check:
1. Notion API credentials are set
2. Database ID is correct
3. Run `/test:command pm:next` to debug
4. Check logs: `/debug:logs pm`
```

**Step 4: Summary Output**

```
✅ Successfully scaffolded pm domain!

📁 Created files:
  ✓ .claude/commands/pm/ (4 commands)
  ✓ .claude/skills/pm-expert/SKILL.md
  ✓ .claude/mcp-servers/pm-notion/mcp.json
  ✓ .claude/hooks/pre-commit/pm-validate.sh
  ✓ .claude/plugins/pm-automation/

📊 Summary:
  • 4 slash commands ready to customize
  • 1 skill with auto-discovery (7 trigger phrases)
  • 1 MCP stub for Notion
  • 1 pre-commit hook
  • 1 plugin ready for team sharing

🚀 Next steps:
  1. Customize commands (edit .claude/commands/pm/*.md)
  2. Set up Notion credentials
  3. Test: /pm:next
  4. When working: /registry:scan to verify
  5. When ready: /evolve:to-plugin pm to package

💡 Tip: Use /design:domain again to design your next domain!
```

---

## Command 3: `/registry:scan`

### Purpose
Discover and index all components in the system. Makes the system observable and prevents conflicts.

### Command Signature
```bash
/registry:scan [filter]
```

### Parameters
- `filter` (optional): Filter results (e.g., "commands", "skills", "unlinked")

### Input Examples
```bash
/registry:scan                    # Scan everything
/registry:scan commands           # Just commands
/registry:scan skills             # Just skills
/registry:scan pm                 # Just pm domain
/registry:scan unlinked           # Components not in plugins
```

### Process Flow

**Step 1: Discover Components**
Recursively scan `.claude/` and identify:
- Slash commands (*.md files in commands/)
- Skills (SKILL.md files)
- MCP servers (mcp.json files)
- Hooks (shell scripts in hooks/)
- Agents (*.yaml files in agents/)
- Plugins (plugin.yaml files)

**Step 2: Extract Metadata**
For each component, parse:
- Name, version, description
- Dependencies (what it needs)
- Dependents (what needs it)
- Tags and categories
- Trigger phrases (for skills)

**Step 3: Generate Registry**

Save to: `.claude/registry.json`

```json
{
  "timestamp": "2025-10-29T14:45:00Z",
  "total_components": 4,
  "by_type": {
    "commands": 4,
    "skills": 1,
    "mcp_servers": 1,
    "hooks": 1,
    "agents": 0,
    "plugins": 1
  },

  "components": [
    {
      "id": "pm:next",
      "type": "command",
      "namespace": "pm",
      "name": "PM Next Task",
      "description": "Get next PM task to work on",
      "version": "1.0.0",
      "location": ".claude/commands/pm/next.md",
      "tags": ["pm", "task", "workflow"],
      "dependencies": [],
      "used_by": ["pm-expert"],
      "quality": {
        "tested": false,
        "documented": true,
        "security_reviewed": false
      }
    },
    {
      "id": "pm-expert",
      "type": "skill",
      "name": "PM Expert",
      "description": "Project Management domain expert",
      "version": "1.0.0",
      "location": ".claude/skills/pm-expert/SKILL.md",
      "trigger_phrases": [
        "next task",
        "what should I work on",
        "pm status"
      ],
      "dependencies": ["pm:next", "pm:review", "pm:context", "pm:list"],
      "used_by": [],
      "quality": {
        "triggers_tested": false,
        "documented": true
      }
    }
  ],

  "relationships": {
    "pm:next": {
      "depends_on": ["pm-notion (mcp)"],
      "used_by": ["pm-expert (skill)"]
    }
  },

  "health": {
    "missing_implementations": 0,
    "unused_components": 0,
    "circular_dependencies": 0,
    "quality_issues": [
      "pm:next - needs testing",
      "pm:notion - needs credentials"
    ]
  }
}
```

### User Interaction Example

```
You: /registry:scan

Claude Registry Scanner:
  🔍 Scanning .claude/ structure...

  ✅ Found 4 components

  📋 Component Inventory
  ──────────────────────

  Commands (4):
    • /pm:next      - Get next PM task [ready]
    • /pm:review    - Check progress [ready]
    • /pm:context   - Get task context [ready]
    • /pm:list      - List tasks [ready]

  Skills (1):
    • pm-expert     - PM domain expert [ready]
      Triggers: "next task", "what should I work on", "pm status"

  MCP Servers (1):
    • pm-notion     - Notion integration [needs_config]
      ⚠️  Missing: NOTION_API_KEY, NOTION_DATABASE_ID

  Hooks (1):
    • pre-commit    - PM task validation [active]

  Plugins (1):
    • pm-automation - Complete PM domain [v1.0.0]

  📊 Relationships
  ────────────────

  pm:next
    └─ Depends on: pm-notion
    └─ Used by: pm-expert

  pm:review
    └─ Depends on: pm-notion
    └─ Used by: pm-expert

  pm-expert (Skill)
    └─ Enables: /pm:next, /pm:review, /pm:context, /pm:list
    └─ Auto-triggers on: "what should I work on"

  ⚠️  Quality Issues
  ──────────────

  • pm:next - Not tested yet (run: /test:command pm:next)
  • pm:notion - Needs credentials (export NOTION_API_KEY, etc.)

  💡 Ready to:
    • Test commands: /test:command pm:next
    • Add more domains: /design:domain {name}
    • Publish as plugin: /evolve:to-plugin pm
```

---

## Data Formats

### Design Spec Format (.claude/designs/{domain}.json)

```json
{
  "name": "string",
  "description": "string",
  "version": "semver",
  "created_at": "ISO8601",

  "design": {
    "operations": [
      {
        "name": "string",
        "description": "string",
        "triggers_auto_discovery": "boolean",
        "manual_invocation": "string (/namespace:operation)"
      }
    ],

    "auto_discovery": {
      "enabled": "boolean",
      "type": "skill|none",
      "suggested_triggers": ["string"]
    },

    "external_integration": {
      "needed": "boolean",
      "type": "mcp|none",
      "systems": [{"name": "string", "type": "string"}]
    },

    "automation": {
      "enabled": "boolean",
      "hooks": [{"event": "string", "action": "string"}]
    },

    "sharing": {
      "scope": "personal|team|community",
      "team_members": ["string"]
    },

    "recommendations": {
      "start_with": ["string"],
      "next_steps": ["string"]
    }
  }
}
```

### Registry Format (.claude/registry.json)

See Step 3 output above.

---

## Error Handling

### `/design:domain` Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Domain already exists" | Design for that domain exists | Use different name or delete existing design |
| "Invalid domain name" | Name has invalid characters | Use alphanumeric + hyphens only |
| "Design incomplete" | User skipped questions | Answer all questions or start over |

### `/scaffold:domain` Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "No design found" | Missing .claude/designs/{domain}.json | Run /design:domain first |
| "Files already exist" | Structure partially exists | Delete existing files or use new domain |
| "MCP config invalid" | Malformed mcp.json template | Validate JSON syntax |

### `/registry:scan` Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "No components found" | .claude/ is empty | Scaffold a domain first |
| "Invalid metadata" | Component metadata broken | Check files in .claude/ |

---

## Integration with Future Layers

These 3 MCC commands enable all others:

- **Layer 2 (Lifecycle)**: `/test:command`, `/evolve` use registry to find components
- **Layer 3 (Intelligence)**: `/decide:architecture` asks questions like design:domain
- **Layer 4 (Quality)**: `/quality:check` validates components found by scan
- **Layer 6 (Observability)**: Registry is the foundation for all monitoring
- **Layer 7 (Automation)**: Workflows use registry to compose commands
- **Layer 8 (Sustainability)**: Migrations export components found by scan

---

## Success Criteria

✅ **`/design:domain` Works When:**
- Asks all 5 questions clearly
- Saves valid design spec to `.claude/designs/{domain}.json`
- Next step guidance is accurate

✅ **`/scaffold:domain` Works When:**
- Generates all expected files
- Templates are editable and runnable
- Generated commands have proper $ARGUMENTS handling
- Skills have clear trigger phrases

✅ **`/registry:scan` Works When:**
- Discovers all components
- Generates accurate registry.json
- Shows dependencies correctly
- Identifies quality issues
- Suggests next steps

---

## Testing Strategy

### Unit Tests
- Design spec validates against schema
- Scaffold generates expected file structure
- Registry correctly parses all file types

### Integration Tests
- Can design → scaffold → scan workflow
- Scanned registry matches actual files
- Generated commands are functional

### User Tests
- New user can follow design wizard without confusion
- Generated code is customizable
- Next-step suggestions are helpful

---

## Deployment

### Phase 1: Create Commands
- Create `.claude/commands/scaffold-domain.md` (master command)
- Contains all 3 operations as subcommands
- Or: Create 3 separate files

### Phase 2: Test
- Test each command independently
- Test workflow: design → scaffold → scan
- Test error cases

### Phase 3: Document
- Create this spec
- Add usage examples
- Add troubleshooting guide

### Phase 4: Use It
- Design your own domains
- Scaffold systems you need
- Use /registry:scan to understand what exists
- Build next layers using MCC

---

## Implementation Notes

The MCC is intentionally minimal:
- Only 3 commands needed
- No external dependencies (bash + Node.js)
- Can be built in <4 hours
- Self-extending (can scaffold more of itself)

Key decisions:
- Interactive Q&A over configuration files (better UX)
- JSON for design specs (machine readable, human editable)
- Standard templates (copy-paste customization)
- Registry as source of truth (observable system)

This specification is sufficient to begin implementation.
