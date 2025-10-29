# Developer Guide: Building Composable Claude Code Systems

**Version:** 1.0
**Audience:** Claude Code developers building commands, skills, and systems

---

## Introduction

This guide shows you how to build Claude Code components that fit into the composable system.

**Key principle:** Every component is a building block. The system works because each piece does ONE thing well and composes cleanly with others.

---

## Quick Start: 5-Minute Command

### 1. Create Design

```bash
/design:domain myfeature "What I'm building"
```

Follow the wizard. It creates `.claude/designs/myfeature.json`

### 2. Scaffold Structure

```bash
/scaffold:domain myfeature
```

This creates:

- `.claude/commands/myfeature/` with stub commands
- `.claude/skills/myfeature-expert/SKILL.md`
- `.claude/plugins/myfeature-automation/plugin.yaml`
- `.claude/mcp-servers/` (if you said yes)
- `.claude/hooks/` (if you said yes)

### 3. Customize Commands

Edit `.claude/commands/myfeature/mycommand.md`:

```markdown
---
name: myfeature:mycommand
version: 1.0.0
description: What this does
inputs:
  arg1:
    type: string
    description: First argument
---

# My Command

Usage: `/myfeature:mycommand arg1`

\`\`\`bash
#!/bin/bash
ARG1="${ARGUMENTS[0]}"
echo "Got argument: $ARG1"
\`\`\`
```

### 4. Test

```bash
/test:command myfeature:mycommand --args "test value"
```

### 5. Done

Your command is live. Add skill trigger phrases, then add more commands.

**That's it. This is how you build in the composable system.**

---

## Deeper: Building Quality Components

### The 5 Principles

Every component should follow these principles:

#### **1. Do One Thing Well**

- Command: Single focused operation
- Skill: Single domain of expertise
- MCP: Single external system
- Hook: Single event handler

✅ Good: `/pm:next` gets next task
❌ Bad: `/pm:management` does everything

#### **2. Make Dependencies Explicit**

- List what you need
- Fail clearly if deps missing
- Document why you need each dep

✅ Good: Depends on `pm-notion-mcp` (get tasks from Notion)
❌ Bad: Hidden dependency on environment variable

#### **3. Accept Configuration**

- Don't hardcode settings
- Use `.claude/config/` or env vars
- Allow override at runtime

✅ Good: `timeout: ${TIMEOUT:-30}`
❌ Bad: `timeout = 10` (hardcoded)

#### **4. Report Clearly**

- Success: Clear what happened
- Failure: Why it failed and what to do
- Metrics: How long, how many tokens

✅ Good: "✅ Found 5 tasks. Execution: 234ms, 42 tokens"
❌ Bad: "OK" or just nothing

#### **5. Be Discoverable**

- Complete metadata
- Clear description (not "do stuff")
- Tags for finding you
- Examples for using you

✅ Good: "Get next pending task from Notion database"
❌ Bad: "task handler"

---

## Common Patterns

### Pattern 1: Simple Command

**What:** Basic operation with inputs and outputs

**File:** `.claude/commands/{domain}/{action}.md`

```markdown
---
name: {domain}:{action}
version: 1.0.0
description: Clear description of what this does

tags: [tag1, tag2]

inputs:
  filter:
    type: string
    description: Filter criteria
    required: false

outputs:
  return_type: array
  description: Results array
---

# {Domain}: {Action}

Clear usage documentation.

## Parameters

- `filter` (optional): How to filter

## Examples

\`\`\`bash
/domain:action
/domain:action --filter pending
\`\`\`

## Implementation

\`\`\`bash
#!/bin/bash

FILTER="${ARGUMENTS[0]:-all}"

# TODO: Replace this stub with real implementation

echo "✅ Operation completed"
echo "Filter applied: $FILTER"
\`\`\`

## What This Does

This command:

1. Takes optional filter argument
2. Performs operation
3. Returns results

## When To Use This

Use this when you need to [specific use case].

## Next Steps

Once working:

- Add tests: /test:command domain:action
- Add skill: /evolve:add-skill domain:action
```

### Pattern 2: Skill (Auto-Discovery)

**What:** Teaching Claude when to suggest a command

**File:** `.claude/skills/{domain}-expert/SKILL.md`

```markdown
---
name: {domain}-expert
version: 1.0.0
description: |
  Expert in {domain}.

  Knows about:
  - {operation 1}
  - {operation 2}
  - {operation 3}

  Use when:
  - User asks about {x}
  - Need to {y}
  - Working on {z}

trigger_phrases:
  - "what {x}"
  - "next {x}"
  - "{domain} {x}"
  - "{x} status"
  - "show my {x}"
---

# {Domain} Expert

Expert in [domain] with knowledge of:

- How to [operation 1]
- How to [operation 2]
- Best practices for [operation 3]

## Commands Available

- `/domain:operation1` - Description
- `/domain:operation2` - Description
- `/domain:operation3` - Description

## When I'm Used

Claude loads this skill when you mention:

- "what should I work on?" → suggests `/domain:next`
- "show my tasks" → suggests `/domain:list`
- Other trigger phrases

## How To Use

1. **Get started**: User mentions trigger phrase
2. **Claude suggests**: Appropriate command
3. **You run it**: Execute the suggestion
4. **Done**: Command provides what you need

## Best Practices

- [Best practice 1]
- [Best practice 2]
- [Best practice 3]

## Customization

To customize:

1. Edit trigger phrases above (make them match your language)
2. Keep description updated as commands evolve
3. Test phrases work naturally
```

### Pattern 3: MCP Server

**What:** Integration with external system

**File:** `.claude/mcp-servers/{name}/mcp.json`

```json
{
  "component": {
    "description": "Connect to {service} for [purpose]",
    "id": "{domain}-{service}",
    "name": "{Service} Integration",
    "type": "mcp",
    "version": "1.0.0"
  },

  "configuration": {
    "auth_header": "Authorization: Bearer ${API_KEY}",
    "endpoint": "https://api.{service}.com/v1"
  },

  "connection": {
    "auth_type": "bearer_token|api_key|oauth",
    "service": "{service_name}",
    "type": "api|database|webhook"
  },

  "operations": {
    "mutations": [
      {
        "description": "Create new item",
        "name": "create_item",
        "parameters": {
          "name": "string (required)"
        }
      },
      {
        "description": "Update item",
        "name": "update_item",
        "parameters": {
          "id": "string (required)",
          "updates": "object (required)"
        }
      }
    ],
    "queries": [
      {
        "description": "Get all items",
        "name": "list_items",
        "parameters": {
          "filter": "string (optional)"
        }
      },
      {
        "description": "Get single item",
        "name": "get_item",
        "parameters": {
          "id": "string (required)"
        }
      }
    ]
  },

  "setup": {
    "instructions": "Get credentials from: https://[service]/docs",
    "required_env_vars": ["API_KEY", "DATABASE_ID"]
  }
}
```

### Pattern 4: Hook (Event Automation)

**What:** Respond to events automatically

**File:** `.claude/hooks/{event}/{name}.sh`

```bash
#!/bin/bash
# Pre-commit hook: Validate before committing

# This script runs automatically before commits
# Exit 0: Allow commit
# Exit 1: Block commit

COMMIT_MSG=$(cat "$1")

# Check: Does commit reference a task?
if ! echo "$COMMIT_MSG" | grep -qE "TASK-[0-9]+"; then
    echo "❌ Error: Commit must reference a task"
    echo ""
    echo "Format: TASK-123: Your commit message"
    echo ""
    exit 1
fi

# Check: Is referenced task actually in progress?
TASK_ID=$(echo "$COMMIT_MSG" | grep -oE "TASK-[0-9]+")
# ... fetch task status ...

if [ "$TASK_STATUS" != "in-progress" ]; then
    echo "❌ Error: Task $TASK_ID is not in progress"
    echo "Status: $TASK_STATUS"
    exit 1
fi

echo "✅ Pre-commit validation passed"
exit 0
```

---

## Building A Domain End-to-End

Let's build a "testing" domain as an example.

### Step 1: Design

```bash
/design:domain testing "Test automation and validation"
```

Answers:

- Operations: `test`, `coverage`, `report`
- Auto-discovery: Yes (add skill)
- External: Maybe (integration with test results)
- Automation: Yes (run tests on commit)
- Sharing: Team

### Step 2: Scaffold

```bash
/scaffold:domain testing
```

Gets:

- Commands: `testing:test`, `testing:coverage`, `testing:report`
- Skill: `testing-expert` with triggers like "run tests", "test coverage"
- Hook: `pre-commit` to run tests automatically
- MCP stub: For test result integration

### Step 3: Implement Commands

**`testing:test`**

```markdown
---
name: testing:test
version: 1.0.0
description: Run tests for project
---

# Testing: Run Tests

\`\`\`bash
#!/bin/bash

TEST_FILTER="${ARGUMENTS[0]:-*}"
npm test -- "$TEST_FILTER"
\`\`\`
```

**`testing:coverage`**

```markdown
---
name: testing:coverage
version: 1.0.0
description: Show test coverage
---

# Testing: Coverage

\`\`\`bash
#!/bin/bash

npm test -- --coverage
\`\`\`
```

**`testing:report`**

```markdown
---
name: testing:report
version: 1.0.0
description: Generate test report
---

# Testing: Report

\`\`\`bash
#!/bin/bash

npm run test:report
\`\`\`
```

### Step 4: Add Skill Triggers

**`skills/testing-expert/SKILL.md`**

```markdown
---
name: testing-expert
description: |
  Testing domain expert.
  Knows how to run tests, check coverage, generate reports.

trigger_phrases:
  - "run tests"
  - "test this"
  - "coverage"
  - "test report"
  - "are tests passing"
---

# Testing Expert

Available commands:

- `/testing:test [filter]` - Run tests
- `/testing:coverage` - Check coverage
- `/testing:report` - Generate report
```

### Step 5: Test

```bash
/test:command testing:test
→ Validates command works

/registry:scan testing
→ Shows what was created

/quality:check testing:*
→ Shows quality metrics
```

### Step 6: Compose

Now you can use `testing` with other domains:

```bash
# Before deploying
/workflow:if-then
  → if /testing:coverage > 80%
  → then /deploy:staging

# Pre-commit
/hook:auto
  → /testing:test
  → /notify:send "Tests passed!"
```

---

## Quality Guidelines

### Documentation

- [ ] Every command has a description (not "do stuff")
- [ ] Usage examples provided
- [ ] Parameters explained
- [ ] Example output shown

### Testing

- [ ] Command has unit tests
- [ ] Integration tests if dependencies
- [ ] Error cases handled
- [ ] Clear error messages

### Performance

- [ ] Execution time <10s for typical use
- [ ] Token usage tracked and reasonable
- [ ] Results cached if expensive
- [ ] Benchmarks documented

### Security

- [ ] Sensitive data in env vars, not hardcoded
- [ ] Input validation (no injection attacks)
- [ ] Proper permission checks
- [ ] Audit trail for sensitive operations

### Maintainability

- [ ] Code is readable
- [ ] Dependencies documented
- [ ] Versioned properly
- [ ] Change history kept

---

## Common Mistakes (And How To Fix Them)

### ❌ Mistake 1: Hidden Dependencies

**Problem:** Command works locally but fails on team machine
**Cause:** Depends on env var not documented

**Fix:**

```markdown
---
dependencies: [pm-notion-mcp]
requires_env: [NOTION_API_KEY]
---
```

### ❌ Mistake 2: No Error Handling

**Problem:** Command fails silently or with cryptic error

**Fix:**

```bash
# Check dependencies
if [ -z "$NOTION_API_KEY" ]; then
    echo "❌ Error: NOTION_API_KEY not set"
    echo "Set with: export NOTION_API_KEY=your-key"
    exit 1
fi

# Handle API errors
RESULT=$(curl -f "$API" 2>/dev/null) || {
    echo "❌ Error: Failed to fetch data"
    echo "Check: API credentials, network connection"
    exit 1
}
```

### ❌ Mistake 3: Monolithic Commands

**Problem:** One command tries to do too much

**Fix:** Break into multiple focused commands

- ❌ `pm:manage` (does everything)
- ✅ `pm:next`, `pm:review`, `pm:context` (each focused)

### ❌ Mistake 4: No Discoverability

**Problem:** Great command but nobody knows about it

**Fix:**

```markdown
---
tags: [pm, workflow, task-management]
trigger_phrases: [relevant user phrases]
category: project-management
---
```

### ❌ Mistake 5: Hardcoded Configuration

**Problem:** Works for you, fails for team

**Fix:**

```bash
# Instead of: TIMEOUT=10
TIMEOUT="${TIMEOUT:-10}"

# Instead of: DB_URL="prod"
DB_URL="${DB_URL:-http://localhost:5432}"
```

---

## Testing Your Components

### Unit Testing

Test individual command:

```bash
/test:command pm:next --args "pending"
→ Shows: output, execution time, token usage
```

### Integration Testing

Test command with dependencies:

```bash
/test:integration pm:next --with pm-notion
→ Tests: command works with MCP integration
```

### Quality Testing

Check component quality:

```bash
/quality:check pm:next
→ Shows: documentation, tests, security, performance
```

---

## Evolution Path

Your component will grow over time:

### Week 1: Command

- Simple slash command
- Manual invocation only
- Local testing

### Week 2: Add Skill

```bash
/evolve:add-skill pm:next
→ Adds skill for auto-discovery
```

### Week 3: Add MCP

```bash
/evolve:add-mcp pm:next --integration notion
→ Connects to external system
```

### Week 4: Package as Plugin

```bash
/evolve:to-plugin pm
→ Creates plugin.yaml
→ Ready to share with team
```

### Week 5: Publish

```bash
/marketplace:publish pm-automation --registry team
→ Available to entire team
```

### Week 6+: Maintain

- Monitor usage
- Fix bugs
- Add features
- Keep docs current

---

## Tools For Builders

### Discovery

- `/registry:scan` - What components exist?
- `/registry:search` - Find specific components
- `/registry:deps` - What depends on what?

### Validation

- `/test:command` - Does it work?
- `/quality:check` - Is it good quality?
- `/validate:interface` - Is it composable?

### Debugging

- `/debug:trace` - Show execution flow
- `/debug:logs` - See what happened
- `/cost:analyze` - Token usage

### Learning

- `/learn:suggest` - How to improve?
- `/learn:analyze` - Usage patterns

### Evolution

- `/evolve:add-skill` - Add auto-discovery
- `/evolve:to-plugin` - Package for team
- `/version:create` - Tag new version

---

## Design Principles To Remember

1. **Composition First** - Will this compose well?
2. **Clarity** - Is it obvious what this does?
3. **Minimalism** - Can I remove anything?
4. **Standards** - Does it follow interface?
5. **Discoverability** - Can people find it?
6. **Reliability** - Does it fail gracefully?
7. **Efficiency** - Is it token-efficient?
8. **Observability** - Can we understand it?

---

## Examples

### Simple Command

See: `.claude/commands/{domain}/` generated by `/scaffold:domain`

### Complete Domain

See: `.claude/plugins/pm-automation/` (PM example)

### Production Quality

Check: `/quality:check` for quality standards

---

## Next Steps

1. **Run:** `/design:domain {yourname}`
2. **Generate:** `/scaffold:domain {yourname}`
3. **Build:** Edit generated files
4. **Test:** `/test:command {yourname}:*`
5. **Compose:** Use with other domains
6. **Share:** `/evolve:to-plugin {yourname}`

---

## Support

Questions? Check:

- Design spec: `.claude/SPEC-composable-system.md`
- Interface spec: `.claude/SPEC-interfaces.md`
- Registry: `/registry:scan`
- Examples: `.claude/plugins/`

---

## Philosophy

Building composable systems means thinking differently:

**Old way:** "How do I build this thing?"
**New way:** "How does this thing compose with everything else?"

Every command should be:

- ✅ Testable independently
- ✅ Understandable quickly
- ✅ Usable with other commands
- ✅ Improvable without breaking dependents

**Build small. Compose large. Think composable.**
