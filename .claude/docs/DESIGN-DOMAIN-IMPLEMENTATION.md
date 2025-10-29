# /design:domain Command - Complete Implementation Guide

## Overview

The `/design:domain` command is an interactive questionnaire that helps users design Claude Code domains by capturing key architectural decisions before implementation. This guide covers the complete implementation with examples, architecture, and usage patterns.

## Architecture

### Files Created

```
.claude/
├── commands/
│   ├── design-domain.md                 (Main command documentation)
│   ├── DESIGN-DOMAIN-IMPLEMENTATION.md  (This file)
│   └── scaffold/
│       └── design.js                    (Interactive questionnaire logic)
└── designs/
    └── pm-example.json                  (Example design spec output)
```

### Core Components

1. **design-domain.md** - Command specification and user documentation
2. **design.js** - Node.js implementation of the interactive questionnaire
3. **pm-example.json** - Example output showing the design spec format

## How It Works

### Execution Flow

```
User: /design:domain pm "Project Management"
         ↓
1. Validation
   - Check domain name format (alphanumeric + hyphens)
   - Verify design doesn't already exist
         ↓
2. Interactive Questions (Sequential)
   Q1: Core operations (what commands?)
   Q2: Auto-discovery (enable skills?)
   Q3: External systems (need MCP?)
   Q4: Automation (need hooks?)
   Q5: Sharing scope (personal/team/community?)
         ↓
3. Processing
   - Generate trigger phrases for skills
   - Create recommendations based on choices
   - Build design spec JSON
         ↓
4. Output
   - Save to .claude/designs/{domain}.json
   - Display summary and next steps
```

### Question Breakdown

#### Question 1: Core Operations
Asks: "What core operations does your domain need?"

Examples provided:
- Getting the next task to work on
- Reviewing progress/status
- Getting context for current task
- Listing all tasks
- Creating new items
- Updating status

User input: Comma-separated list (e.g., "next, review, context")

Processing:
- Parse input and validate non-empty
- Convert to kebab-case operation names
- Generate manual_invocation paths like `/pm:next`
- Mark all with `triggers_auto_discovery: true` by default

#### Question 2: Auto-Discovery (Skills)
Asks: "Should Claude auto-suggest these commands?"

Examples:
- Manual: User types `/pm:next`
- Auto: User says "what should I work on?" → Claude suggests `/pm:next`

User input: yes/no

Processing:
- If yes: Generate trigger phrases from operation names
- Suggest contextually relevant triggers based on operation names
- Allow custom triggers to be added
- Limit to 8-10 suggestions

Generated triggers include:
- Operation name variations ("next task", "next", "show next")
- Common contextual phrases ("what should i work on", "status")
- Domain-specific suggestions based on operation types

#### Question 3: External Systems (MCP Integration)
Asks: "Does your domain need to connect to external systems?"

Examples:
- Database (local, Notion, Airtable)
- API (Jira, GitHub, Slack)
- Cloud service (AWS, Azure, Google Cloud)

User input: yes/no/maybe + list of systems

Processing:
- If yes/maybe: Ask for system names
- Convert names to kebab-case
- Default type to "api" (could be database, service, etc.)
- Store as array of system objects

#### Question 4: Automation (Hooks & Events)
Asks: "Should some operations run automatically?"

Examples:
- Pre-commit: Validate task status before committing
- Scheduled: Daily standup digest
- Triggered: On task completion, update metrics

User input: yes/no + list of hooks

Processing:
- If yes: Ask for hook event names
- Convert to kebab-case event names
- Generate action names following pattern: `{domain}_{hook}`
- Store as array of hook objects

#### Question 5: Sharing Scope
Asks: "Who will use this domain?"

Options:
- personal (local only)
- team (shared repository)
- community (public registry)

User input: One of the three options

Processing:
- If team: Ask for team member emails
- Store scope and optional team members array
- Use scope in recommendations

### Design Spec Output Format

The generated `.claude/designs/{domain}.json` follows this structure:

```json
{
  "name": "domain-name",
  "description": "User-provided description",
  "version": "1.0.0",
  "created_at": "2025-10-29T14:30:00Z",
  "design": {
    "operations": [
      {
        "name": "operation-name",
        "description": "operation description",
        "triggers_auto_discovery": true,
        "manual_invocation": "/domain:operation"
      }
    ],
    "auto_discovery": {
      "enabled": true/false,
      "type": "skill|none",
      "suggested_triggers": ["phrase1", "phrase2", ...]
    },
    "external_integration": {
      "needed": true/false,
      "type": "mcp|none",
      "systems": [
        {
          "name": "system-name",
          "type": "api|database|service"
        }
      ]
    },
    "automation": {
      "enabled": true/false,
      "hooks": [
        {
          "event": "pre-commit|post-commit|scheduled",
          "action": "action-name"
        }
      ]
    },
    "sharing": {
      "scope": "personal|team|community",
      "team_members": ["email1", "email2"]  // Optional, only if team
    },
    "recommendations": {
      "start_with": [
        "recommendation 1",
        "recommendation 2",
        ...
      ],
      "next_steps": [
        "Run: /scaffold:domain {domain}",
        "Customize generated files",
        ...
      ]
    }
  }
}
```

## Implementation Details

### Node.js Script (design.js)

The implementation uses Node.js built-ins:

- **fs** - File system operations (read design configs, write output)
- **path** - Path handling (resolve design file paths)
- **readline** - Interactive prompts (question/answer flow)

### Key Functions

#### `question(prompt) -> Promise<string>`
Prompts user interactively using readline and returns trimmed response.

#### `validateDomainName(name) -> boolean`
Validates domain name:
- Pattern: `/^[a-z0-9-]+$/` (lowercase, numbers, hyphens only)
- Length: 2-50 characters

#### `parseList(input) -> string[]`
Parses comma-separated user input:
- Splits on commas
- Trims whitespace
- Filters empty entries

#### `generateTriggerPhrases(operations) -> string[]`
Auto-generates contextually relevant trigger phrases:

1. Iterates through operations
2. Creates phrase variations from operation names
3. Adds domain-specific suggestions:
   - If any op contains "next"/"task": adds "what should i work on", "next task", "show my tasks"
   - If any op contains "status"/"review"/"progress": adds "status", "progress", "show progress"
   - If any op contains "context": adds "context", "what is the context"
4. Deduplicates and limits to 8 suggestions

#### `generateRecommendations(domain, operations, flags) -> object`
Creates recommendations based on design choices:

```javascript
{
  "start_with": [
    "Create commands for: {op1}, {op2}, {op3}",
    // + conditional items based on flags
    "Create README.md for team documentation"
  ],
  "next_steps": [
    "Run: /scaffold:domain {domain}",
    "Customize generated command files",
    "Test commands locally: /{domain}:{first-op}",
    "Add quality gates and tests when ready",
    "Review with team if {scope} !== 'personal'"
  ]
}
```

#### `runDesignQuestionnaire() -> Promise<void>`
Main async function that:
1. Validates domain name
2. Runs 5-question sequence
3. Builds design spec object
4. Creates designs directory if needed
5. Writes JSON file
6. Displays completion summary

### Error Handling

| Error | Cause | Response |
|-------|-------|----------|
| Invalid domain name | Doesn't match pattern or length | Exit with message, ask for retry |
| Design exists | File already at `.claude/designs/{domain}.json` | Exit with message, suggest rename |
| Empty operations | User provides no operations | Exit with error message |
| Invalid sharing scope | Input not personal/team/community | Re-prompt with example options |

### User Experience Details

**Visual Formatting:**
- Uses UTF-8 characters for visual hierarchy (═, ─, •, ✅, ❌, 📄, 💡, etc.)
- Clear question numbering (Question 1/5, etc.)
- Examples prefixed with "•" bullets
- Section separators with dashes

**Input Validation:**
- Case-insensitive yes/no checking (`/^(yes|y)$/i`)
- Comma-separated list parsing
- Trimmed whitespace throughout
- Re-prompts on invalid sharing scope choice

**Confirmation Flow:**
- Shows generated triggers after auto-discovery question
- Shows design summary before saving
- Lists all created items (operations, hooks, systems)
- Provides file path and next steps

## Example Usage

### Session 1: Simple PM Domain

```
$ node .claude/commands/scaffold/design.js pm

============================================================
🎯 Claude Code Domain Designer - Interactive Questionnaire
============================================================

✅ Designing "pm" domain
📝 Let's work through what your domain should include.

────────────────────────────────────────────────────────────
Question 1/5: CORE OPERATIONS
────────────────────────────────────────────────────────────
What core operations does your domain need?

Examples:
  • Getting the next task to work on
  • Reviewing progress/status
  • Getting context for current task
  • Listing all tasks
  • Creating new items
  • Updating status

List operations (comma-separated, e.g., "next, review, context"): next, review, context, list

────────────────────────────────────────────────────────────
Question 2/5: AUTO-DISCOVERY (Skills)
────────────────────────────────────────────────────────────
Should Claude auto-suggest these commands?

Examples:
  Manual:  User types /pm:next
  Auto:    User says "what should I work on?" → Claude suggests /pm:next

Enable auto-discovery? (yes/no): yes

Generating suggested trigger phrases...
Suggestions: what should i work on, next task, show my tasks, status, progress, show progress, context, what is the context
Add custom trigger phrases? (comma-separated, optional): pm status, pm review

────────────────────────────────────────────────────────────
Question 3/5: EXTERNAL SYSTEMS (MCP Integration)
────────────────────────────────────────────────────────────
Does your domain need to connect to external systems?

Examples:
  • Database (local, Notion, Airtable)
  • API (Jira, GitHub, Slack)
  • Cloud service (AWS, Azure, Google Cloud)

Need external integration? (yes/no/maybe): yes
List external systems (comma-separated, optional): Notion

────────────────────────────────────────────────────────────
Question 4/5: AUTOMATION (Hooks & Events)
────────────────────────────────────────────────────────────
Should some operations run automatically?

Examples:
  • Pre-commit:  Validate task status before committing
  • Scheduled:   Daily standup digest
  • Triggered:   On task completion, update metrics

Need automation? (yes/no): yes

Common hook events: pre-commit, post-commit, scheduled, on-complete
List hooks (comma-separated, optional, e.g., "pre-commit"): pre-commit

────────────────────────────────────────────────────────────
Question 5/5: SHARING SCOPE
────────────────────────────────────────────────────────────
Who will use this domain?

Options:
  • personal  - Just me (local only)
  • team      - My team (shared repository)
  • community - Public registry

Sharing scope (personal/team/community): team
Team member emails (comma-separated, optional): alice@acme.com, bob@acme.com

============================================================
✅ Design Complete!
============================================================

📄 Design saved to: .claude/designs/pm.json

Your design includes:
  • 4 operation(s): next, review, context, list
  • Auto-discovery skill with 10 trigger phrases
  • 1 external system(s): notion
  • 1 automation hook(s): pre-commit
  • team sharing configuration

📋 Recommended Next Steps:
  1. Create commands for: next, review, context
  2. Add skill with trigger phrases for auto-discovery
  3. Create MCP stub(s) for external system connection
  4. Add hook script(s) for automated tasks
  5. Create README.md for team documentation

💡 View your design:
   cat .claude/designs/pm.json
```

### Session 2: Simple Personal Domain

```
$ node .claude/commands/scaffold/design.js test "Testing utilities"

✅ Designing "test" domain
📝 Let's work through what your domain should include.

Question 1/5: CORE OPERATIONS
List operations (comma-separated, e.g., "next, review, context"): run, debug, report

Question 2/5: AUTO-DISCOVERY (Skills)
Enable auto-discovery? (yes/no): no

Question 3/5: EXTERNAL SYSTEMS (MCP Integration)
Need external integration? (yes/no/maybe): no

Question 4/5: AUTOMATION (Hooks & Events)
Need automation? (yes/no): no

Question 5/5: SHARING SCOPE
Sharing scope (personal/team/community): personal

✅ Design Complete!

📄 Design saved to: .claude/designs/test.json

Your design includes:
  • 3 operation(s): run, debug, report
  • personal sharing configuration

Next steps:
  1. Run: /scaffold:domain test
  2. Customize generated command files
  3. Test commands locally: /test:run
  4. Add quality gates and tests when ready
  5. Review with team if personal
```

## Generated Output Example

See `.claude/designs/pm-example.json` for a complete example of the output format.

Key aspects:
- All questions answered completely
- Trigger phrases auto-generated and extended
- Multiple operations and recommendations
- Team sharing with members list
- Ready to pass to `/scaffold:domain` command

## Integration Points

### With /scaffold:domain
The generated design spec is the input to the scaffold command:
```bash
/scaffold:domain pm  # Reads .claude/designs/pm.json
```

The scaffold command:
1. Reads the design spec
2. Creates directory structure
3. Generates template files for each operation
4. Creates skill file with trigger phrases
5. Generates MCP stub configurations
6. Creates hook scripts
7. Outputs plugin manifest and README

### With /registry:scan
After scaffolding, the registry scan can discover components:
```bash
/registry:scan pm  # Finds all pm domain components
```

The registry will:
1. Discover all command files
2. Parse skill definitions
3. Index MCP configurations
4. List automation hooks
5. Show relationships and dependencies

## Testing the Implementation

### Manual Testing

1. **Test basic flow:**
   ```bash
   node .claude/commands/scaffold/design.js pm "Project Management"
   ```

2. **Test with command-line args:**
   ```bash
   node .claude/commands/scaffold/design.js devops
   ```

3. **Test validation:**
   - Invalid domain name (uppercase, special chars)
   - Duplicate domain name
   - Empty operations list

4. **Verify output:**
   ```bash
   cat .claude/designs/pm.json | jq .
   ```

### Integration Testing

1. **Design → Scaffold workflow:**
   ```bash
   node .claude/commands/scaffold/design.js pm "PM"
   # Then would run /scaffold:domain pm
   ```

2. **Multiple domains:**
   ```bash
   node .claude/commands/scaffold/design.js pm "PM"
   node .claude/commands/scaffold/design.js test "Testing"
   ls .claude/designs/
   ```

3. **Verify JSON schema:**
   - Design spec validates against schema
   - All required fields present
   - No unexpected properties

## JSON Schema for Design Specs

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["name", "description", "version", "created_at", "design"],
  "properties": {
    "name": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "minLength": 2,
      "maxLength": 50,
      "description": "Domain name identifier"
    },
    "description": {
      "type": "string",
      "minLength": 1,
      "description": "Human-readable description"
    },
    "version": {
      "type": "string",
      "pattern": "^[0-9]+\\.[0-9]+\\.[0-9]+$",
      "description": "Semantic version"
    },
    "created_at": {
      "type": "string",
      "format": "date-time",
      "description": "ISO 8601 timestamp"
    },
    "design": {
      "type": "object",
      "required": [
        "operations",
        "auto_discovery",
        "external_integration",
        "automation",
        "sharing",
        "recommendations"
      ],
      "properties": {
        "operations": {
          "type": "array",
          "minItems": 1,
          "items": {
            "type": "object",
            "required": ["name", "description"],
            "properties": {
              "name": {"type": "string"},
              "description": {"type": "string"},
              "triggers_auto_discovery": {"type": "boolean"},
              "manual_invocation": {"type": "string", "pattern": "^/[a-z0-9-]+:[a-z0-9-]+$"}
            }
          }
        },
        "auto_discovery": {
          "type": "object",
          "required": ["enabled", "type"],
          "properties": {
            "enabled": {"type": "boolean"},
            "type": {"type": "string", "enum": ["skill", "none"]},
            "suggested_triggers": {"type": "array", "items": {"type": "string"}}
          }
        },
        "external_integration": {
          "type": "object",
          "required": ["needed", "type"],
          "properties": {
            "needed": {"type": "boolean"},
            "type": {"type": "string", "enum": ["mcp", "none"]},
            "systems": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": {"type": "string"},
                  "type": {"type": "string"}
                }
              }
            }
          }
        },
        "automation": {
          "type": "object",
          "required": ["enabled"],
          "properties": {
            "enabled": {"type": "boolean"},
            "hooks": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "event": {"type": "string"},
                  "action": {"type": "string"}
                }
              }
            }
          }
        },
        "sharing": {
          "type": "object",
          "required": ["scope"],
          "properties": {
            "scope": {"type": "string", "enum": ["personal", "team", "community"]},
            "team_members": {"type": "array", "items": {"type": "string"}}
          }
        },
        "recommendations": {
          "type": "object",
          "required": ["start_with", "next_steps"],
          "properties": {
            "start_with": {"type": "array", "items": {"type": "string"}},
            "next_steps": {"type": "array", "items": {"type": "string"}}
          }
        }
      }
    }
  }
}
```

## Next Steps & Future Work

### Immediate
- ✅ Implement 5-question questionnaire
- ✅ Generate design specs
- ✅ Create documentation and examples
- Next: Implement `/scaffold:domain` to generate files from specs
- Next: Implement `/registry:scan` to discover and index components

### Enhancements
- Interactive previews of recommendations
- Design spec editing/modification
- Validation of design specs against JSON schema
- Migration helpers for existing commands
- Template library for common domain patterns

## References

- **Specification:** `.claude/SPEC-minimum-composable-core.md`
- **Command Docs:** `.claude/commands/design-domain.md`
- **Example Output:** `.claude/designs/pm-example.json`
- **Implementation:** `.claude/commands/scaffold/design.js`
