# Standard Interfaces - Composability Contract

**Version:** 1.0-draft
**Status:** Reference Implementation

---

## Overview

Composability requires **standard interfaces** - contracts that all components must follow. This ensures:
- Any tool can manage any component
- Components from different authors interoperate
- Testing and validation work uniformly
- Monitoring is consistent across system

This document defines the interface contracts.

---

## Component Metadata Interface

Every component must expose metadata describing what it is.

### Metadata Schema

```json
{
  "component": {
    "id": "string (unique identifier)",
    "type": "command|skill|mcp|hook|agent|plugin",
    "version": "semver",
    "name": "string (human readable)",
    "description": "string (what it does)",

    "created_at": "ISO8601",
    "updated_at": "ISO8601",
    "creator": "string (username)",
    "authors": ["string"],

    "location": "string (path to component)",
    "repository": "string (git repo)",

    "tags": ["string"],
    "category": "string",

    "inputs": {
      "parameters": {
        "{param_name}": {
          "type": "string|number|boolean|array|object",
          "description": "string",
          "required": "boolean",
          "default": "value"
        }
      },
      "dependencies": ["component_id"]
    },

    "outputs": {
      "return_type": "object|string|boolean|void",
      "description": "string",
      "schema": {}
    },

    "dependencies": ["component_id"],
    "dependents": ["component_id"],

    "status": "active|deprecated|experimental|archived",

    "quality": {
      "test_coverage": "number (0-100)",
      "documented": "boolean",
      "security_reviewed": "boolean",
      "performance_benchmarked": "boolean",
      "quality_score": "number (0-100)"
    },

    "sharing": {
      "scope": "personal|team|community",
      "published": "boolean",
      "registry": "internal|public",
      "teams": ["string"]
    }
  }
}
```

### Implementation: Component Frontmatter

For slash commands and skills, expose metadata via frontmatter:

**Command Example: `.claude/commands/pm/next.md`**
```markdown
---
type: command
name: pm:next
version: 1.0.0
description: Get next PM task to work on

tags: [pm, task, workflow]
category: project-management

inputs:
  filter:
    type: string
    description: Filter by status (pending, in-progress, blocked)
    required: false
    default: all
  limit:
    type: number
    description: Maximum results
    required: false
    default: 5

outputs:
  return_type: object
  description: Array of task objects

dependencies: [pm-notion-mcp]

quality:
  test_coverage: 0
  documented: true
  security_reviewed: false
  performance_benchmarked: false
  quality_score: 60
---

# Content here
```

**Skill Example: `.claude/skills/pm-expert/SKILL.md`**
```markdown
---
type: skill
name: pm-expert
version: 1.0.0
description: Project Management domain expert

tags: [pm, auto-discovery]

trigger_phrases:
  - "next task"
  - "what should I work on"
  - "pm status"

depends_on: [pm:next, pm:review, pm:context, pm:list]

quality:
  documented: true
  triggers_tested: false
  quality_score: 75
---

# Content here
```

**MCP Example: `.claude/mcp-servers/pm-notion/mcp.json`**
```json
{
  "component": {
    "id": "pm-notion",
    "type": "mcp",
    "name": "PM Notion Integration",
    "version": "1.0.0",
    "description": "Notion database integration for PM tasks",

    "inputs": {
      "parameters": {
        "api_key": {
          "type": "string",
          "description": "Notion API key",
          "required": true
        },
        "database_id": {
          "type": "string",
          "description": "Notion database ID",
          "required": true
        }
      }
    },

    "outputs": {
      "return_type": "object",
      "description": "Task data from Notion"
    }
  }
}
```

---

## Lifecycle Operations Interface

Every component must support standard lifecycle operations for discoverability and management.

### Required Operations

| Operation | Input | Output | Purpose |
|-----------|-------|--------|---------|
| **create** | Config | Component ID | Initialize new component |
| **read** | Component ID | Metadata + Status | Retrieve component definition |
| **update** | Component ID + Changes | Updated Metadata | Modify component |
| **delete** | Component ID | Success/Failure | Remove component |
| **test** | Component ID + Inputs | Test Results | Validate component works |
| **deploy** | Component ID | Deployment Status | Make active/available |
| **version** | Component ID | Version History | Track changes |
| **help** | Component ID | Documentation | Get usage help |

### Command Interface Example

```bash
# CREATE
/design:domain pm
→ Creates new component (design spec)

# READ
/registry:scan pm:next
→ Returns: metadata for pm:next command

# UPDATE
/update:component pm:next --description "Updated description"
→ Modifies component metadata

# DELETE
/delete:component pm:next
→ Removes component (with confirmation)

# TEST
/test:command pm:next
→ Validates pm:next works with test inputs

# DEPLOY
/deploy:component pm:next
→ Makes component available for use

# VERSION
/version:list pm:next
→ Shows all versions of pm:next

# HELP
/help pm:next
→ Shows how to use pm:next
```

### Implementation: All Components Respond To

Every component should respond to these queries:

```bash
# What are you?
$ /registry:scan pm:next
→ Returns metadata (name, version, description, deps, etc.)

# How do I use you?
$ /help pm:next
→ Returns usage documentation

# Do you work?
$ /test:command pm:next
→ Tests component functionality

# What changed?
$ /version:list pm:next
→ Shows modification history

# Who depends on you?
$ /registry:deps pm:next
→ Shows what uses this component

# What do you depend on?
$ /registry:deps --reverse pm:next
→ Shows what this component needs
```

---

## Event Interface

Components emit events so other layers can react.

### Standard Events

```
component.lifecycle.created      (created new component)
component.lifecycle.deleted      (removed component)
component.lifecycle.updated      (modified component)
component.lifecycle.deployed     (made active)

component.execution.started      (began running)
component.execution.completed    (finished successfully)
component.execution.failed       (error during execution)

component.quality.tested         (test results available)
component.quality.validated      (passed quality gates)
component.quality.warning        (quality issues found)

component.monitoring.accessed    (component was used)
component.monitoring.error       (error occurred)

component.learning.pattern       (pattern detected in usage)
component.learning.anomaly       (unusual behavior)
```

### Event Publishing

Components emit events to event bus:

```bash
# When /pm:next completes successfully
event emit {
  type: "component.execution.completed",
  component: "pm:next",
  duration_ms: 234,
  result: { tasks: [...] },
  timestamp: "2025-10-29T15:30:00Z"
}

# When it fails
event emit {
  type: "component.execution.failed",
  component: "pm:next",
  error: "MCP connection failed",
  timestamp: "2025-10-29T15:30:01Z"
}

# When monitoring detects it's slow
event emit {
  type: "component.quality.warning",
  component: "pm:next",
  warning: "execution time exceeded SLA (234ms > 100ms target)",
  timestamp: "2025-10-29T15:30:02Z"
}
```

### Event Subscriptions

Other components subscribe to events:

```yaml
# In .claude/schedule/
- event: component.execution.completed
  component: pm:next
  trigger: /pm:update-cache
  description: "Refresh cache when pm:next completes"

- event: component.execution.failed
  component: pm:next
  trigger: /notify:send --channel slack
  description: "Alert team if pm:next fails"

- event: component.quality.warning
  component: pm:next
  trigger: /log:warning
  description: "Log quality warnings"
```

---

## Configuration Interface

All components accept configuration in standard format.

### Config Schema

```yaml
components:
  {domain}:
    {component}:
      enabled: boolean                    # Is component active?
      timeout: number (seconds)          # Execution timeout
      retry_policy: exponential|linear   # Retry strategy
      max_retries: number                # How many retries
      cache: boolean                     # Cache results?
      cache_ttl: number (seconds)        # Cache duration
      cost_limit: number (tokens)        # Max tokens allowed
      owners: [string]                   # Who can modify
      teams: [string]                    # Which teams can use
      env_vars: {key: value}             # Environment config
      tags: [string]                     # Runtime tags
      metadata: {key: value}             # Custom metadata
```

### Config File Example

```yaml
# .claude/config/domains/pm.yaml

components:
  pm:
    next:
      enabled: true
      timeout: 10
      retry_policy: exponential
      max_retries: 2
      cache: true
      cache_ttl: 300  # 5 minutes
      cost_limit: 500  # tokens
      owners: [alice, bob]
      teams: [engineering]
      env_vars:
        NOTION_API_KEY: ${NOTION_API_KEY}
        NOTION_DATABASE_ID: "abc123"
      tags: [critical, fast-path]

    review:
      enabled: true
      timeout: 30
      retry_policy: linear
      cost_limit: 1000

    context:
      enabled: true
      timeout: 15
      cache: true
      cache_ttl: 600
```

### Config Resolution

Components resolve config with inheritance:

```
Global Defaults
    ↓
Domain Config (.claude/config/domains/pm.yaml)
    ↓
Component Config (.claude/config/components/pm-next.yaml)
    ↓
Runtime Overrides ($CLI_ARGS)
```

---

## Context Interface

Components declare what context they need.

### Context Declaration

```markdown
---
context:
  required:
    - project_structure    # Need project layout
    - task_definitions     # Need PM task schema
    - recent_changes       # Need git history

  optional:
    - team_members        # Nice to have
    - performance_metrics # Nice to have

  token_budget: 2000      # Max tokens for context
  context_mode: "minimal" # minimal|balanced|comprehensive
---
```

### Context Provision

Intelligence layer provides context:

```bash
# Component declares it needs "task_definitions"
/context:provide pm:next --type task_definitions
→ Returns minimal task schema (50 tokens)

# Component can request richer context
/context:provide pm:next --type task_definitions --mode comprehensive
→ Returns full schema with examples (500 tokens)

# Component can get context on-demand
/context:add pm:next "User is working on feature X"
→ Adds user context to this component's context window
```

---

## Cost Interface

Components expose resource usage for optimization.

### Cost Metrics

```json
{
  "component": "pm:next",
  "execution": {
    "timestamp": "2025-10-29T15:30:00Z",
    "duration_ms": 234,
    "tokens": {
      "input": 150,
      "output": 42,
      "total": 192
    },
    "cost_usd": 0.0024,
    "api_calls": 1
  }
}
```

### Cost Tracking

```bash
# Get cost for single execution
/cost:analyze pm:next
→ Shows: tokens used, time taken, cost in $

# Get cost history
/cost:history pm:next --days 7
→ Shows: 7-day usage patterns, total cost

# Set budget
/cost:budget pm:next --limit 500
→ Component warns if approaching limit

# Optimize
/cost:optimize pm:next
→ Suggests: caching, batching, model changes to reduce cost
```

---

## Quality Interface

Components expose quality metrics.

### Quality Dimensions

```yaml
quality:
  functionality:          # Does it work?
    tests_passing: true
    coverage: 85
    score: 0.95

  performance:            # Is it fast enough?
    p95_latency_ms: 250
    throughput: 1000
    target_latency_ms: 100
    score: 0.75

  security:              # Is it safe?
    scan_status: passed
    vulnerabilities: 0
    score: 1.0

  documentation:         # Is it clear?
    completeness: 0.8
    examples: true
    score: 0.8

  maintainability:       # Is it maintainable?
    cyclomatic_complexity: 3
    code_duplication: 0.02
    score: 0.9

  overall: 0.88         # Weighted average
```

### Quality Gates

```bash
# Check if component meets quality gates
/quality:check pm:next
→ Shows: which gates pass/fail, overall score

# Set requirements
/quality:gate pm:next --minimum 0.80
→ Component fails deployment if score < 0.80

# View history
/quality:history pm:next
→ Shows: quality trend over time
```

---

## Dependency Interface

Components declare dependencies clearly.

### Dependency Declaration

```markdown
---
dependencies:
  required:
    - pm-notion-mcp    # Must have

  optional:
    - cache-layer      # Nice to have

  conflicts_with:      # Cannot coexist with
    - pm-jira-mcp
---
```

### Dependency Resolution

```bash
# Show dependency tree
/registry:deps pm:next
→ Shows: what pm:next depends on

/registry:deps --reverse pm:next
→ Shows: what depends on pm:next

# Check for issues
/registry:validate
→ Shows: missing deps, circular deps, version conflicts
```

---

## Discovery Interface

Components are discoverable through standard mechanisms.

### Discovery Methods

```bash
# List by type
/registry:list --type command
→ Shows: all commands

# Search by tag
/registry:search --tag pm
→ Shows: all components tagged "pm"

# Search by description
/registry:search "manage tasks"
→ Shows: components matching description

# Browse by category
/registry:browse --category project-management
→ Shows: all project management components

# By metadata
/registry:query --quality ">0.8"
→ Shows: high-quality components
```

---

## Composition Interface

Components can be composed together.

### Composition Patterns

```bash
# Sequence: Run in order
/workflow:create standup
  → /pm:next
  → /pm:context
  → /test:coverage

# Parallel: Run simultaneously
/workflow:parallel
  → /quality:check pm:*
  → /cost:analyze pm:*

# Conditional: Run if condition met
/workflow:if-then
  → if /pm:next --status pending
  → then /notify:send "You have pending tasks"

# Loop: Repeat operation
/workflow:for each domain
  → /registry:scan {domain}
  → /quality:check {domain}/*
```

---

## Implementation Checklist

When building a component, ensure:

✅ **Metadata**
- [ ] Has frontmatter/metadata block
- [ ] Includes name, version, description
- [ ] Lists dependencies
- [ ] Includes tags

✅ **Operations**
- [ ] Can be queried: `/registry:scan {component}`
- [ ] Can be tested: `/test:command {component}`
- [ ] Can be versioned: `/version:list {component}`
- [ ] Can be discovered: `/registry:search {keyword}`

✅ **Events**
- [ ] Emits lifecycle events (created, deleted, deployed)
- [ ] Emits execution events (started, completed, failed)
- [ ] Subscribes to relevant events

✅ **Configuration**
- [ ] Accepts standard config format
- [ ] Honors timeout, retry policy, cost limits
- [ ] Respects ownership/team rules

✅ **Quality**
- [ ] Has tests (or test_coverage: 0 documented)
- [ ] Is documented
- [ ] Has quality score calculated

✅ **Dependencies**
- [ ] Declares what it needs
- [ ] Fails gracefully if deps missing
- [ ] Can be updated without breaking dependents

---

## Standards Compliance

Use this checklist to ensure your component is composable:

```bash
# Auto-check component compliance
/validate:interface {component}

# Output
✅ pm:next compliance report
├─ Metadata: ✓ Complete
├─ Operations: ✓ Supported
├─ Events: ✓ Publishing correctly
├─ Config: ✓ Accepts standard format
├─ Quality: ✓ Scored
├─ Dependencies: ✓ Declared
├─ Discovery: ✓ Indexed
└─ Composition: ✓ Can be composed

Overall: 100% compliant
```

---

## Versioning

Components use semantic versioning: MAJOR.MINOR.PATCH

```
1.2.3
│ │ └─ Patch: Bug fixes (backward compatible)
│ └─── Minor: Features (backward compatible)
└───── Major: Breaking changes
```

Interface version: **1.0** (frozen for composability)
Components must maintain interface compatibility across versions.

---

## Migration

When interface needs evolution:

1. New version of interface released as draft
2. Component authors have 2-week notice
3. Old interface continues working
4. Deprecation warnings added
5. After 1 month, old interface deprecated
6. After 3 months, old interface removed

---

## This Specification

This interface contract ensures:
- ✅ All components speak same language
- ✅ Tools can manage anything
- ✅ Composition works reliably
- ✅ System grows without fragmentation

**Follow these interfaces. Composability depends on it.**
