# Evolution Lifecycle Layer - Command Specification

**Version:** 1.0-draft
**Status:** Implementation Ready
**Layer:** Layer 2 - Lifecycle Management

---

## Overview

The Evolve Command Family enables **safe, non-destructive evolution** of components from simple to complex without breaking changes. Components can evolve through multiple stages:

```
Manual Command
    ↓
+ Add Skill (auto-discovery)
    ↓
+ Package as Plugin (team sharing)
    ↓
+ Split into Smaller Components
    ↓
+ Automate with Hooks
    ↓
+ Integrate with External Systems (MCP)
```

Each stage is **fully reversible** and **non-destructive**. You can undo any evolution and return to a previous state.

---

## Core Design Principles

### 1. Non-Breaking Evolution

- Each evolution adds capability, never removes
- Old invocation methods always work
- Backwards compatible by default
- Clear deprecation path when changing

### 2. Reversibility

- Every evolution can be undone
- `rollback` command restores previous state
- Evolution history tracked in metadata
- No data loss

### 3. Observability

- Registry updated automatically
- Quality gates checked before evolution
- Migration guides generated
- Dependencies validated

### 4. Safety

- Preview before applying
- Confirmation for major changes
- Automatic testing after evolution
- Error recovery guidance

---

## Commands Overview

| Command                | Purpose                       | Safety                  | Reversible |
| ---------------------- | ----------------------------- | ----------------------- | ---------- |
| `/evolve:add-skill`    | Add auto-discovery to command | Wraps existing          | Yes        |
| `/evolve:to-plugin`    | Package domain into plugin    | Creates new manifest    | Yes        |
| `/evolve:split`        | Break monolithic into focused | Suggests changes        | Yes        |
| `/evolve:remove-skill` | Remove auto-discovery         | Reverses skill addition | Yes        |
| `/evolve:rollback`     | Return to previous version    | Full revert             | Yes        |

---

## Command 1: `/evolve:add-skill`

### Purpose

Transform a command into auto-discoverable by wrapping it with a skill that has trigger phrases.

### Command Signature

```bash
/evolve:add-skill {command} [--auto-triggers] [--dry-run]
```

### Parameters

- `command` (required): Existing command to add skill to (e.g., `pm:next`, `deploy:status`)
- `--auto-triggers`: Auto-generate trigger phrases from command description
- `--dry-run`: Preview changes without applying

### Process Flow

**Step 1: Validate Command**

```
/evolve:add-skill pm:next

✅ Found command: /pm:next
   Location: .claude/commands/pm/next.md
   Status: ready
   Uses: pm-notion (mcp)
```

**Step 2: Analyze Command**

- Read command documentation
- Extract description, parameters, examples
- Identify domain and operation name
- Check for existing skill

```
📋 Command Analysis
   Description: Get next PM task to work on
   Parameters: [filter, limit]
   Examples: 3 found
   Domain: pm
   Existing Skill: None
```

**Step 3: Generate Trigger Phrases**

Option A: Auto-generate (with `--auto-triggers`)

```
🧠 Generated Trigger Phrases:
   • "next task" (from command name)
   • "what should I work on" (from description)
   • "next pm task" (domain-specific)
   • "pm:next" (exact command)
   • "show me next" (variation)

   Total: 5 triggers
```

Option B: Interactive (default)

```
💡 Suggest trigger phrases for this skill

   I found these clues in your command:
   • Description mentions: "next task", "queue"
   • Domain: pm
   • Operation: next

   I suggest:
   □ "next task"
   □ "what should I work on"
   □ "next pm task"
   □ "pm:next"

   Add your own? (comma-separated):
   → [awaiting input]
```

**Step 4: Show Preview**

```
📋 Preview: Adding skill to /pm:next

BEFORE:
  Location: .claude/commands/pm/next.md
  Invocation: Only manual (/pm:next)

AFTER:
  Location: .claude/commands/pm/next.md (unchanged)
  + Location: .claude/skills/pm-next-discovery/SKILL.md (new)
  Invocation: Manual (/pm:next) + Auto-discovery

Trigger Phrases (5):
  ✓ "next task" → /pm:next
  ✓ "what should I work on" → /pm:next
  ✓ "next pm task" → /pm:next
  ✓ "pm:next" → /pm:next
  ✓ "show me next" → /pm:next

This is ADDITIVE: /pm:next still works exactly as before.
When you say any trigger phrase, Claude will suggest it.

Apply? (yes/no)
→ [awaiting confirmation]
```

**Step 5: Execute Evolution**

```
✅ Evolving command: /pm:next

1️⃣  Creating skill file
    .claude/skills/pm-next-discovery/SKILL.md ✅

2️⃣  Updating command metadata
    .claude/commands/pm/next.md (added skill_id) ✅

3️⃣  Scanning registry
    Found 1 skill, 4 commands in pm domain ✅

4️⃣  Recording evolution
    .claude/history/pm-next.evolution.json ✅

✅ Success! /pm:next now has auto-discovery
```

**Step 6: Show Impact**

```
📊 Evolution Complete

Command: /pm:next
Status: Evolved ↗️
Skill: pm-next-discovery
Trigger Phrases: 5

What Changed:
  Before: Manual invocation only
  After:  Manual + Auto-discovery

Example New Behavior:
  You: "What should I work on?"
  Claude: "I can help with that. Let me check your next task:"
          [suggests /pm:next]

Undo this evolution anytime:
  /evolve:remove-skill pm:next

Learn about other evolutions:
  /evolve:to-plugin pm    # Package into plugin
  /evolve:split pm        # Break into smaller commands
```

### Configuration File Format

**Skill file created: `.claude/skills/{namespace}-{operation}-discovery/SKILL.md`**

```markdown
---
name: pm-next-discovery
description: |
  Auto-discovery skill for /pm:next command.

  Suggests /pm:next when user mentions:
  - Getting next task
  - What to work on
  - Task queue
  - Starting new work

trigger_phrases:
  - "next task"
  - "what should I work on"
  - "next pm task"
  - "show me next"
  - "pm:next"

linked_command: pm:next
created_by: /evolve:add-skill
created_at: "2025-10-29T14:32:00Z"
---

# PM Next Discovery Skill

## What This Does

Automatically suggests the `/pm:next` command when you're asking about what to work on next.

## When Claude Uses This

When you mention:

- "What should I work on?" → Suggests `/pm:next`
- "Next task" → Suggests `/pm:next`
- "Show me next" → Suggests `/pm:next`

## The Underlying Command

This skill wraps the `/pm:next` command, which:

- Shows your next PM task from your task queue
- Helps you start your next work item

## Best Practices

1. **Use naturally**: Just mention needing a new task
2. **Be specific**: More context = better suggestions
3. **Accept suggestions**: When offered, run the command
4. **Provide feedback**: Tell Claude if suggestion was helpful

## Manual Invocation

You can always run the command directly:
\`\`\`
/pm:next
\`\`\`

## Customization

To change trigger phrases, edit this file and update the `trigger_phrases` section.
```

### Evolution History Format

**File: `.claude/history/pm-next.evolution.json`**

```json
{
  "after": {
    "has_skill": true,
    "invocation_methods": ["manual", "auto-discovery"],
    "location": ".claude/commands/pm/next.md",
    "skill_name": "pm-next-discovery",
    "trigger_phrases": [
      "next task",
      "what should I work on",
      "next pm task",
      "show me next",
      "pm:next"
    ],
    "type": "command",
    "version": "1.0.0"
  },

  "applied_by": "claude",

  "before": {
    "has_skill": false,
    "invocation_methods": ["manual"],
    "location": ".claude/commands/pm/next.md",
    "type": "command",
    "version": "1.0.0"
  },

  "can_rollback": true,
  "changes": [
    {
      "action": "created",
      "checksum": "sha256:abc123...",
      "file": ".claude/skills/pm-next-discovery/SKILL.md",
      "size": 1245
    },
    {
      "action": "modified",
      "changes": ["added skill_id metadata"],
      "checksum_after": "sha256:new123...",
      "checksum_before": "sha256:old123...",
      "file": ".claude/commands/pm/next.md"
    }
  ],

  "command": "pm:next",
  "evolution_type": "add-skill",
  "metadata": {
    "dependents": [],
    "domain": "pm",
    "operation": "next"
  },
  "rollback_command": "/evolve:rollback pm:next",

  "timestamp": "2025-10-29T14:32:00Z"
}
```

### Error Cases

| Error                     | Cause                             | Fix                                              |
| ------------------------- | --------------------------------- | ------------------------------------------------ |
| "Command not found"       | Path doesn't exist                | Verify command exists: `/registry:scan commands` |
| "Skill already exists"    | Skill already there               | Use `/evolve:remove-skill` first                 |
| "Invalid trigger phrases" | Duplicates across domain          | Remove conflicting phrases                       |
| "Domain mismatch"         | Command/skill namespaces conflict | Ensure consistent naming                         |

---

## Command 2: `/evolve:to-plugin`

### Purpose

Package a domain (commands + skills + MCPs + hooks) into a complete, team-shareable plugin.

### Command Signature

```bash
/evolve:to-plugin {domain} [--version VERSION] [--description TEXT] [--dry-run]
```

### Parameters

- `domain` (required): Domain name to package (e.g., `pm`, `deploy`, `test`)
- `--version`: Semantic version (defaults to 1.0.0)
- `--description`: Plugin description (optional)
- `--dry-run`: Preview without applying

### Process Flow

**Step 1: Validate Domain**

```
/evolve:to-plugin pm --version 1.0.0

✅ Found domain: pm
   Components:
   • 4 commands (next, review, context, list)
   • 1 skill (pm-expert)
   • 1 MCP (pm-notion)
   • 1 hook (pre-commit)

   Ready to package: YES
```

**Step 2: Quality Gate Check**

```
🔍 Quality Gates
   ──────────────
   ✅ All commands documented
   ⚠️  2 commands untested
   ✅ All MCPs configured
   ⚠️  1 dependency missing (NOTION_API_KEY)
   ✅ No circular dependencies
   ✅ Registry up to date

   Quality Score: 7/10
```

**Step 3: Generate Plugin Manifest**

```
📋 Plugin Manifest (plugin.yaml)
   ──────────────────────────────

name: pm-automation
version: 1.0.0
description: Complete PM domain with task management
author: user
created_at: 2025-10-29

Components:
  • 4 slash commands
  • 1 auto-discovery skill
  • 1 MCP server
  • 1 git hook

Team Sharing: Enabled
Security Review: Pending
Documentation: Complete

Ready to package? (yes/no)
→ [awaiting confirmation]
```

**Step 4: Create Plugin Structure**

```
✅ Creating plugin structure

1️⃣  Creating .claude/plugins/pm-automation/
    Directory structure ✅

2️⃣  Creating plugin.yaml
    Complete manifest ✅

3️⃣  Creating README.md
    Setup and usage instructions ✅

4️⃣  Symlinking components
    Commands → .claude/commands/pm ✅
    Skills → .claude/skills/pm-* ✅
    MCPs → .claude/mcp-servers/pm-* ✅
    Hooks → .claude/hooks/*/pm-* ✅

5️⃣  Generating team docs
    TEAM-SETUP.md ✅
    CONFIGURATION.md ✅
    TROUBLESHOOTING.md ✅

6️⃣  Creating .env.example
    Required credentials template ✅
```

**Step 5: Show Plugin Contents**

```
📦 Plugin: pm-automation v1.0.0

Location: .claude/plugins/pm-automation/

Contents:
  plugin.yaml                  (manifest)
  README.md                    (user guide)
  TEAM-SETUP.md               (setup instructions)
  CONFIGURATION.md            (config reference)
  TROUBLESHOOTING.md          (help guide)
  .env.example                (credentials template)

Symlinked Components:
  commands/ → ../commands/pm/
  skills/ → ../skills/pm-*/
  mcp-servers/ → ../mcp-servers/pm-*/
  hooks/ → ../hooks/*/pm-*

Sharing Details:
  • Can be zipped and shared with team
  • Team members can install: /install:plugin pm-automation
  • Version tracked in plugin.yaml
  • Team members see in registry
```

**Step 6: Generate Documentation**

```
✅ Plugin successfully created!

📦 Plugin Package: pm-automation v1.0.0
   Location: .claude/plugins/pm-automation/

📚 Generated Documentation:
   ✓ README.md         - Quick start guide
   ✓ TEAM-SETUP.md    - Team installation steps
   ✓ CONFIGURATION.md - All config options
   ✓ TROUBLESHOOTING.md - Common issues + fixes

📋 Plugin Manifest: plugin.yaml
   • 4 commands
   • 1 skill
   • 1 MCP
   • 1 hook
   • Version: 1.0.0
   • Author: {user}
   • Team sharing: enabled

Next Steps:
  1. Share with team: zip .claude/plugins/pm-automation/
  2. Team installs: /install:plugin pm-automation
  3. Team uses: /pm:next, /pm:review, etc.

Undo this evolution:
  /evolve:rollback pm (to-plugin)
```

### Plugin Manifest Format

**File: `.claude/plugins/{plugin-name}/plugin.yaml`**

```yaml
# Plugin Manifest
name: pm-automation
version: 1.0.0
description: Complete Project Management domain with task management and auto-discovery

metadata:
  author: user
  created_at: "2025-10-29T14:32:00Z"
  last_modified: "2025-10-29T14:32:00Z"
  maintainer: user
  license: MIT

  tags:
    - project-management
    - pm
    - task-management
    - workflow
    - auto-discovery

  keywords:
    - tasks
    - project
    - planning
    - workflow

components:
  # Slash Commands
  commands:
    - namespace: pm
      commands:
        - name: next
          path: ./commands/pm/next.md
          description: Get next PM task to work on
          parameters: [filter, limit]
        - name: review
          path: ./commands/pm/review.md
          description: Review PM progress and status
        - name: context
          path: ./commands/pm/context.md
          description: Get context for current PM task
        - name: list
          path: ./commands/pm/list.md
          description: List all PM tasks

  # Auto-Discovery Skills
  skills:
    - name: pm-expert
      path: ./skills/pm-expert/SKILL.md
      description: Project Management domain expert
      trigger_phrases:
        - "next task"
        - "what should I work on"
        - "pm status"
        - "show my tasks"
      linked_commands:
        - pm:next
        - pm:review
        - pm:context
        - pm:list

  # External System Integrations (MCP)
  mcp_servers:
    - name: pm-notion
      type: notion
      path: ./mcp-servers/pm-notion/
      description: Notion database integration for PM tasks
      required_config:
        - NOTION_API_KEY
        - NOTION_DATABASE_ID
      operations:
        read: [list_tasks, get_task_details, filter_by_status]
        write: [update_task_status, create_task, delete_task]

  # Automation Hooks
  hooks:
    - event: pre-commit
      script: ./hooks/pre-commit/pm-validate.sh
      description: Validate PM task linkage in commits
      required_env: [PM_TASK_PREFIX]
      triggers_when: "Commit about to be created"

# Quality Assurance
quality:
  test_status: untested
  security_review: pending
  documentation_complete: true
  performance_tested: false

  quality_score: 7/10

  issues:
    - "2 commands untested"
    - "Notion integration requires credentials"
    - "No performance benchmarks"

  recommended_next_steps:
    - "Run tests: /test:command pm:*"
    - "Security review: /security:review pm-automation"
    - "Benchmark performance: /perf:measure pm:*"

# Team Sharing
team_sharing:
  enabled: true
  team_members:
    - user1
    - user2
  sharing_scope: team
  installable: true

  installation_instructions:
    - "Unzip plugin to .claude/plugins/"
    - "Update .env with credentials"
    - "Run /registry:scan to verify"
    - "Test: /pm:next"

  distribution:
    format: zip
    includes_env: false # .env.example only
    size_estimate: "~25kb"

# Dependencies
dependencies:
  - name: notion-api
    type: external
    required: true
    version: ">=1.0"
  - name: bash
    type: system
    required: true
    version: ">=5.0"

# Marketplace (optional)
marketplace:
  published: false
  registry: internal
  discoverable: false
  download_url: ""

  visibility: private

  when_ready_to_publish:
    - "Set marketplace.published = true"
    - "Provide download_url"
    - "Get security review"
    - "Update documentation"

# Evolution History
evolution:
  - type: created
    timestamp: "2025-10-29T14:32:00Z"
    operation: to-plugin
    source: pm domain
```

---

## Command 3: `/evolve:split`

### Purpose

Analyze a monolithic domain/component and suggest how to split it into smaller, focused pieces for better reusability.

### Command Signature

```bash
/evolve:split {component} [--analyze-only] [--depth LEVEL]
```

### Parameters

- `component` (required): Component to analyze (e.g., `pm`, `pm:next`, `pm-expert`)
- `--analyze-only`: Show analysis without suggestions
- `--depth`: Analysis depth (1=high-level, 5=detailed)

### Process Flow

**Step 1: Analyze Component**

```
/evolve:split pm --depth 3

🔍 Analyzing: pm domain
   Type: domain
   Components: 4 commands, 1 skill, 1 mcp, 1 hook
   Size: ~5000 bytes
   Complexity: medium
```

**Step 2: Find Opportunities to Split**

```
💡 Split Opportunities

ANALYSIS:
  The 'pm' domain combines too many responsibilities:

  1. Task Management (next, list, context)
     Size: ~2000 bytes
     Complexity: Low
     Reusability: High

  2. Progress Tracking (review, stats)
     Size: ~1200 bytes
     Complexity: Medium
     Reusability: Medium

  3. External Integration (pm-notion)
     Size: ~800 bytes
     Complexity: High
     Reusability: High

  4. Automation (pre-commit hook)
     Size: ~600 bytes
     Complexity: Medium
     Reusability: Low

DEPENDENCIES:
  Task Management   ← used by Review
  Task Management   ← used by Context
  External Integration ← used by Task Management
  Automation        ← references Task Management
```

**Step 3: Suggest Split Strategy**

```
📋 Recommended Split

PROPOSAL: Split into 3 focused domains:

1. Domain: pm-core
   └─ Focus: Core task management
   ├─ Commands: next, list, context
   ├─ Size: ~2000 bytes
   ├─ Reusability: High
   └─ Purpose: Universal task operations

2. Domain: pm-tracking  (depends on pm-core)
   └─ Focus: Progress and review
   ├─ Commands: review, stats
   ├─ Size: ~1200 bytes
   ├─ Reusability: Medium
   └─ Purpose: Status and progress monitoring

3. Domain: pm-integrations (depends on pm-core)
   └─ Focus: External system connections
   ├─ MCPs: pm-notion
   ├─ Hooks: pre-commit validation
   ├─ Size: ~1400 bytes
   ├─ Reusability: High
   └─ Purpose: Connector to external systems

Benefits of Split:
  ✅ Smaller, focused domains
  ✅ Each can evolve independently
  ✅ pm-core can be reused elsewhere
  ✅ Easier to test and maintain
  ✅ Clear dependency tree

Costs:
  ⚠️  pm-core and pm-tracking must align
  ⚠️  Need to coordinate updates
  ⚠️  Migration guide needed
```

**Step 4: Show Migration Path**

```
🚀 Migration Strategy

PHASE 1: Create New Domains
  1. Design pm-core domain
     /design:domain pm-core "Core PM operations"

  2. Scaffold pm-core
     /scaffold:domain pm-core

  3. Copy commands to pm-core
     cp .claude/commands/pm/{next,list,context}.md \
        .claude/commands/pm-core/

PHASE 2: Create Dependent Domains
  1. Design pm-tracking (depends on pm-core)
  2. Scaffold pm-tracking
  3. Copy review commands
  4. Add dependencies in manifests

PHASE 3: Test and Validate
  1. Test each domain independently
  2. Test interactions between domains
  3. Verify registry shows dependencies
  4. Update documentation

PHASE 4: Deprecate Old Domain
  1. Mark pm as deprecated
  2. Create migration guide
  3. Re-export from new domains:
     /pm:next → /pm-core:next
  4. Set sunset date

PHASE 5: Remove Old Domain
  1. After sunset date
  2. Archive old domain
  3. Remove from registry
  4. Keep for rollback capability

Estimated Timeline:
  Phase 1: 15 mins
  Phase 2: 15 mins
  Phase 3: 20 mins
  Phase 4: 10 mins
  Phase 5: Scheduled

Rollback Strategy:
  Can undo split at any time:
  /evolve:rollback pm (split)

  This recreates original pm domain
  and archives the split versions.
```

**Step 5: Show Implementation Details**

```
📝 Implementation Details

NEW FILE STRUCTURE:

.claude/
├── commands/
│   ├── pm-core/
│   │   ├── next.md       (moved from pm/)
│   │   ├── list.md       (moved from pm/)
│   │   └── context.md    (moved from pm/)
│   │
│   ├── pm-tracking/
│   │   ├── review.md     (moved from pm/)
│   │   └── stats.md      (new)
│   │
│   └── pm/ (deprecated)
│       └── DEPRECATED.md (migration guide)
│
├── skills/
│   ├── pm-core-expert/
│   │   └── SKILL.md      (new)
│   │
│   ├── pm-tracking-expert/
│   │   └── SKILL.md      (new)
│   │
│   └── pm-expert/        (archive)
│
├── mcp-servers/
│   └── pm-notion/        (stays with pm-core)
│
└── plugins/
    ├── pm-core-automation/
    │   └── plugin.yaml   (new)
    │
    ├── pm-tracking-automation/
    │   └── plugin.yaml   (new)
    │
    └── pm-automation/    (deprecated/archive)

DEPENDENCY MANIFESTS:

pm-tracking/plugin.yaml:
  dependencies:
    - name: pm-core
      version: ">=1.0.0"
      required_for: "task data, queries"

pm-integrations/plugin.yaml:
  dependencies:
    - name: pm-core
      version: ">=1.0.0"
      required_for: "task model, operations"

MIGRATION GUIDE:

Users upgrading from pm (monolithic) to split domains:

Old: /pm:next, /pm:review
New: /pm-core:next, /pm-tracking:review

Compatibility layer (optional):
  Create /pm:* shims that delegate to new domains
  Keep for one version, then deprecate
```

**Step 6: Request Confirmation**

```
📋 Proceed with Split?

This will:
  ✅ Create 3 new domains (pm-core, pm-tracking, pm-integrations)
  ✅ Move commands to appropriate domains
  ✅ Mark old pm domain as deprecated
  ✅ Generate migration guide
  ✅ Create compatibility shims

  ⚠️  Old domain stays for rollback

Proceed? (yes/no)
  yes     → Execute split (15 mins)
  no      → Cancel (no changes)
  preview → Show detailed file changes
```

### Split Analysis Format

**File: `.claude/analysis/splits/{component}.analysis.json`**

```json
{
  "analysis_timestamp": "2025-10-29T14:32:00Z",

  "benefit_analysis": {
    "complexity_reduction": "25%",
    "maintainability_improvement": "35%",
    "reusability_improvement": "45%",
    "testing_improvement": "40%"
  },
  "component": "pm",
  "current_structure": {
    "cohesion_score": 5.2,
    "complexity_score": 6.5,
    "reusability_score": 7.1,
    "total_files": 9,
    "total_size": 5124
  },

  "suggested_splits": [
    {
      "cohesion": 9.0,
      "complexity": 2,
      "components": [
        "commands/pm/next.md",
        "commands/pm/list.md",
        "commands/pm/context.md"
      ],
      "description": "Core task management operations",
      "name": "pm-core",
      "reusability": 8.5,
      "size": 2000,
      "standalone_viable": true
    },
    {
      "cohesion": 8.5,
      "complexity": 4,
      "components": ["commands/pm/review.md", "commands/pm/stats.md"],
      "dependencies": ["pm-core"],
      "description": "Progress tracking and reporting",
      "name": "pm-tracking",
      "reusability": 6.0,
      "size": 1200,
      "standalone_viable": false
    }
  ],

  "type": "domain"
}
```

---

## Command 4: `/evolve:remove-skill`

### Purpose

Remove auto-discovery skill from a command, returning it to manual-only invocation.

### Command Signature

```bash
/evolve:remove-skill {command} [--dry-run]
```

### Parameters

- `command` (required): Command to remove skill from (e.g., `pm:next`)
- `--dry-run`: Preview without applying

### Process Flow

**Step 1: Find and Validate Skill**

```
/evolve:remove-skill pm:next

🔍 Searching for skills linked to /pm:next

✅ Found skill: pm-next-discovery
   Location: .claude/skills/pm-next-discovery/SKILL.md
   Trigger phrases: 5
   Created: 2025-10-29T14:32:00Z
   Status: active
```

**Step 2: Show Impact**

```
📋 Impact Analysis

BEFORE:
  Invocation: /pm:next (manual) + auto-discovery
  Skill: pm-next-discovery (active)
  Trigger phrases: 5
  Auto-suggested: YES

AFTER:
  Invocation: /pm:next (manual only)
  Skill: pm-next-discovery (removed)
  Auto-suggested: NO

What Changes:
  - User says "what should I work on?" → Claude no longer suggests /pm:next
  - User still can say "/pm:next" directly
  - Command still works exactly the same

Reversible:
  YES - Use /evolve:add-skill pm:next anytime
```

**Step 3: Confirm and Execute**

```
🔄 Removing skill from /pm:next

1️⃣  Removing metadata from command
    .claude/commands/pm/next.md ✅

2️⃣  Archiving skill file
    .claude/skills/pm-next-discovery/ → archive/ ✅

3️⃣  Updating registry
    Scanning... ✅

4️⃣  Recording rollback info
    .claude/history/pm-next.evolution.json ✅

✅ Skill removed successfully
```

**Step 4: Show Result**

```
✅ Skill removed from /pm:next

Change Summary:
  Skill: pm-next-discovery → Archived
  Command: /pm:next → Manual only
  Auto-discovery: Disabled

User Impact:
  Before: Say "what should I work on?" → Claude suggests /pm:next
  After:  Say "what should I work on?" → Claude doesn't suggest it

Still Works:
  /pm:next command still functions perfectly
  User can still invoke it manually

Redo This Evolution:
  /evolve:add-skill pm:next
```

---

## Command 5: `/evolve:rollback`

### Purpose

Revert any component to a previous version, undoing one or more evolutions.

### Command Signature

```bash
/evolve:rollback {component} [{version|evolution-type}] [--force] [--dry-run]
```

### Parameters

- `component` (required): Component to rollback (e.g., `pm:next`, `pm`, `pm-automation`)
- `version` (optional): Target version or evolution (e.g., `v1.0.0`, `to-plugin`, `add-skill`)
- `--force`: Skip safety checks
- `--dry-run`: Preview without applying

### Process Flow

**Step 1: Show Evolution History**

```
/evolve:rollback pm:next

📜 Evolution History: /pm:next

1. 2025-10-29 14:32  [CURRENT]  add-skill
   Added skill: pm-next-discovery
   Triggers: 5 phrases

2. 2025-10-29 14:20  patch
   Fixed parameter validation
   Version: 1.0.1 → 1.0.2

3. 2025-10-29 13:45  minor
   Added limit parameter
   Version: 1.0.0 → 1.0.1

Which version? (1-3, current, all)
→ [awaiting input]
```

**Step 2: Show Target State**

```
Target Version: add-skill (2025-10-29 14:32)

Changes to Undo:
  ✓ Remove skill: pm-next-discovery
  ✓ Remove from registry
  ✓ Update command metadata
  ✓ Archive evolution history

Return to State:
  - /pm:next works exactly as before
  - Manual invocation only (no auto-discovery)
  - All functionality preserved

Files Affected:
  .claude/commands/pm/next.md     (modified)
  .claude/skills/pm-next-discovery/ (deleted)
  .claude/history/pm-next.evolution.json (appended)
  .claude/registry.json           (updated)

Safety Check:
  ✅ No other skills depend on this
  ✅ No commands depend on this
  ✅ Safe to rollback

Proceed? (yes/no)
→ [awaiting confirmation]
```

**Step 3: Execute Rollback**

```
⏮️  Rolling back /pm:next

1️⃣  Restoring from backup
    Checkpoint: 2025-10-29 14:20 ✅

2️⃣  Removing skill
    .claude/skills/pm-next-discovery/ → deleted ✅

3️⃣  Restoring command
    .claude/commands/pm/next.md → v1.0.0 ✅

4️⃣  Updating registry
    Removed skill reference ✅

5️⃣  Recording rollback
    History: +1 rollback entry ✅

✅ Rollback complete
```

**Step 4: Verify State**

```
✅ Successfully rolled back /pm:next

Restored to: 2025-10-29 14:20 (before add-skill)

Current State:
  Command: /pm:next v1.0.0
  Skill: None
  Auto-discovery: Disabled
  Invocation: Manual only

Files Restored:
  .claude/commands/pm/next.md ✅

Rollback History:
  You can still redo if needed:
  /evolve:redo pm:next

Need to undo further?
  /evolve:rollback pm:next [version]
```

### Rollback History Format

**File: `.claude/history/{component}.evolution.json`**

```json
{
  "component": "pm:next",
  "current_sequence": 3,
  "current_state": {
    "has_skill": false,
    "invocation_methods": ["manual"],
    "type": "command"
  },
  "current_version": "1.0.1-restored",
  "evolution_chain": [
    {
      "changes": [
        {
          "action": "created",
          "checksum": "sha256:abc123",
          "file": ".claude/commands/pm/next.md",
          "size": 1200
        }
      ],
      "operation": "Created command",
      "rollback_available": false,
      "sequence": 0,
      "timestamp": "2025-10-29 13:45",
      "type": "initial",
      "version": "1.0.0"
    },
    {
      "changes": [
        {
          "action": "modified",
          "checksum_after": "sha256:def456",
          "checksum_before": "sha256:abc123",
          "diff": "Added @param limit",
          "file": ".claude/commands/pm/next.md"
        }
      ],
      "operation": "Added limit parameter",
      "rollback_available": true,
      "rollback_requires": [],
      "sequence": 1,
      "timestamp": "2025-10-29 13:50",
      "type": "minor",
      "version": "1.0.1"
    },
    {
      "changes": [
        {
          "action": "modified",
          "checksum_after": "sha256:ghi789",
          "checksum_before": "sha256:def456",
          "diff": "Added skill_id metadata",
          "file": ".claude/commands/pm/next.md"
        },
        {
          "action": "created",
          "checksum": "sha256:jkl012",
          "file": ".claude/skills/pm-next-discovery/SKILL.md",
          "size": 1245
        }
      ],
      "operation": "Added auto-discovery skill",
      "rollback_available": true,
      "rollback_requires": [],
      "sequence": 2,
      "timestamp": "2025-10-29 14:32",
      "type": "evolve:add-skill",
      "version": "1.0.2"
    },
    {
      "can_redo": true,
      "changes": [
        {
          "action": "modified",
          "checksum_after": "sha256:def456",
          "checksum_before": "sha256:ghi789",
          "file": ".claude/commands/pm/next.md",
          "restored_from": "2025-10-29 14:32"
        },
        {
          "action": "deleted",
          "archived_to": ".archive/skills/pm-next-discovery-2025-10-29-14-32/",
          "file": ".claude/skills/pm-next-discovery/SKILL.md"
        }
      ],
      "operation": "Rolled back add-skill evolution",
      "original_sequence": 2,
      "rollback_available": true,
      "rollback_requires": [],
      "sequence": 3,
      "timestamp": "2025-10-29 14:45",
      "type": "rollback:evolve:add-skill",
      "version": "1.0.1-restored"
    }
  ]
}
```

---

## Integration Points

### With Registry

- All evolutions automatically update `.claude/registry.json`
- Registry shows evolution history for each component
- Dependencies tracked and validated

### With Quality Gates

- Preview shows quality impact
- Certain evolutions blocked if quality too low
- Suggestions for improving quality before evolution

### With Testing

- After evolution, can auto-run tests
- `/test:command {command}` available after evolution
- Quality gates enforced before major evolutions

### With Documentation

- Evolution generates migration guides automatically
- Deprecation notices added to old versions
- Team communication templates provided

---

## Error Handling

### Common Errors

| Error                    | Cause                           | Fix                               |
| ------------------------ | ------------------------------- | --------------------------------- |
| "Command not found"      | Path doesn't exist              | Verify with `/registry:scan`      |
| "Skill already exists"   | Skill already attached          | Remove skill first                |
| "Skill conflict"         | Trigger phrases conflict        | Edit trigger phrases              |
| "Dependency exists"      | Other components depend on this | Update dependents first           |
| "Rollback not available" | Old version deleted             | Use most recent available version |
| "Safety check failed"    | Dependencies would break        | Resolve dependencies first        |
| "Quality too low"        | Component untested/undocumented | Address quality issues first      |

---

## Safety Guarantees

### Backup Strategy

- All evolutions create checkpoints before applying
- Original files archived in `.archive/` before modification
- Full evolution history tracked in `.claude/history/`
- Can restore from any historical state

### Validation Before Evolution

- Syntax checking (JSON, YAML, Markdown)
- Dependency resolution
- Naming conflict detection
- Cross-references verified
- Quality gates evaluated

### Confirmation

- Preview shown before any changes
- User confirmation required
- Rollback instructions shown
- Estimated impact displayed

### Recovery

- Every evolution reversible via `/evolve:rollback`
- Full change history in `.claude/history/`
- Automatic backups in `.archive/`
- Detailed error messages with recovery steps

---

## Usage Examples

See `EVOLVE-GUIDE.md` for detailed examples.

---

## Success Criteria

Evolution commands work when:

1. ✅ **Add Skill**
   - Skill created with trigger phrases
   - Command metadata updated
   - Registry shows skill linked to command
   - Auto-discovery works as expected

2. ✅ **To Plugin**
   - Plugin directory structure created
   - All manifests valid
   - Team documentation generated
   - Registry shows complete plugin

3. ✅ **Split**
   - Analysis accurate and useful
   - Split strategy clear
   - Migration path documented
   - Dependencies properly managed

4. ✅ **Remove Skill**
   - Skill removed cleanly
   - Command still functional
   - Registry updated
   - Rollback available

5. ✅ **Rollback**
   - Component restored to target state
   - Files restored from backup
   - Dependencies checked
   - History recorded

---

## Evolution Best Practices

1. **Start Simple**
   - Create command first
   - Test thoroughly
   - Then add skill
   - Then package as plugin

2. **Communicate Changes**
   - Use evolution guides for team
   - Document migration steps
   - Provide deprecation notice
   - Support old invocation temporarily

3. **Test After Evolution**
   - Run command tests after evolution
   - Verify skill triggers
   - Check registry consistency
   - Validate dependencies

4. **Monitor Quality**
   - Track quality scores over time
   - Address quality issues before evolution
   - Keep documentation up to date
   - Plan for maintenance

5. **Version Consistently**
   - Use semantic versioning
   - Increment version on each evolution
   - Document breaking changes
   - Provide migration guides

---

## Next Steps

See `.claude/EVOLVE-GUIDE.md` for user guide with examples.
