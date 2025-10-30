# Design Domain Implementation Summary

## Overview

The `/design:domain` interactive design wizard command has been implemented in the primary `.claude/commands/design-domain.md` file. This command guides users through a structured 5-question process to create complete domain specifications that `/scaffold:domain` can use to generate all necessary files.

## Location

- **Primary Command File:** `.claude/commands/design-domain.md`
- **Output Designs:** `.claude/designs/{domain-name}.json`
- **Related Command:** `/scaffold:domain {domain}` (generates files from designs)

## Implementation Details

### Command Frontmatter
```yaml
---
allowed-tools: Write, Read, Bash(mkdir:*, test:*, cat:*)
description: Interactive design wizard for creating domain specifications
argument-hint: { domain-name } [optional-description]
---
```

### 5-Question Design Process

**Question 1: Core Operations**
- User specifies comma-separated operations (e.g., "next, list, create")
- System parses into operation objects with:
  - name: lowercase slug
  - description: auto-generated from operation name
  - manual_invocation: `/{domain}:{operation}`
  - triggers_auto_discovery: true

**Question 2: Auto-Discovery**
- Enable/disable skill-based auto-discovery (yes/no)
- System generates contextual trigger phrases:
  - "next" → "what should I work on", "show next", etc.
  - "list" → "show all", "what do we have", etc.
  - "review" → "show status", "how are we doing", etc.
- Returns auto_discovery configuration object

**Question 3: External Integrations**
- Specify which external systems to integrate (APIs, DBs, cloud services)
- User provides comma-separated system names
- System converts to lowercase slugs
- Returns external_integration configuration with systems array

**Question 4: Automation Hooks**
- Enable/disable git hook automation (yes/no)
- User specifies hook events: pre-commit, post-checkout, pre-push, pre-to-vtm
- System generates hook objects with event and action names
- Returns automation configuration with hooks array

**Question 5: Sharing Scope**
- Define scope: personal, team, or community
- If team, collect comma-separated email addresses
- Returns sharing configuration with scope and team_members

### Design Specification Output

Generated JSON structure (saved to `.claude/designs/{domain}.json`):

```json
{
  "created_at": "2025-10-30T12:34:56.789Z",
  "name": "domain-name",
  "description": "Domain description",
  "version": "1.0.0",
  "design": {
    "operations": [
      {
        "name": "operation-name",
        "description": "Operation description",
        "manual_invocation": "/domain:operation",
        "triggers_auto_discovery": true
      }
    ],
    "auto_discovery": {
      "enabled": true,
      "type": "skill",
      "suggested_triggers": ["trigger phrase 1", "trigger phrase 2"]
    },
    "external_integration": {
      "needed": true,
      "type": "mcp",
      "systems": [
        {"name": "system-name", "type": "api"}
      ]
    },
    "automation": {
      "enabled": true,
      "hooks": [
        {"event": "pre-commit", "action": "hook_pre_commit"}
      ]
    },
    "sharing": {
      "scope": "personal|team|community",
      "team_members": [],
      "published": false
    },
    "recommendations": {
      "next_steps": [...],
      "start_with": [...]
    }
  }
}
```

## Key Features

### Input Validation
- Domain name: lowercase, 2-20 chars, letters/numbers/hyphens only
- Existing design detection: checks for `.claude/designs/{domain}.json`
- Response parsing: flexible yes/no/maybe handling
- Confirmation loops: asks user to confirm before proceeding

### Smart Defaults
- Auto-discovery: enabled by default
- Sharing scope: personal by default
- External integration: disabled by default
- Automation hooks: disabled by default

### Contextual Help
- Example operations for each domain type
- Trigger phrase examples for common operations
- Clear progress indicators ("QUESTION X of 5")
- Error messages with actionable suggestions

### Processing Rules

**Operations Parsing:**
- Split by comma, trim whitespace
- Convert to lowercase slugs (a-z, 0-9, hyphens only)
- Remove special characters
- Generate descriptions from operation names

**Trigger Phrase Generation:**
- Contextual phrases based on operation type
- 2-4 phrases per operation
- Sorted alphabetically for consistency
- Examples: "next" gets "what should I work on", "show next", "what's next"

**External Systems:**
- Parse comma-separated names
- Convert to lowercase slugs
- Default type: "api"
- Support for: databases, APIs, cloud services, file systems

**Automation Hooks:**
- Parse comma-separated events
- Validate against: pre-commit, post-checkout, pre-push, pre-to-vtm
- Generate action names: `hook_{event_with_underscores}`

**Sharing Scope:**
- Accept: "personal", "team", "community"
- Default: "personal"
- Team scope: optional email collection for team members

## User Experience Flow

```
✨ Let's design the "Domain Name" domain together!

📝 Description provided by user

I'll ask you 5 questions...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 QUESTION 1 of 5: Core Operations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What operations should your domain provide?
[Context and examples provided]

Your operations (comma-separated): [USER INPUT]

✅ Got N operations:
  • /domain:operation1
  • /domain:operation2

Looks good? (yes/no): [USER CONFIRMATION]

[Repeat for questions 2-5]

✅ Design complete!

📄 Design specification saved to:
   .claude/designs/domain-name.json

📦 Your Domain Name domain includes:
   • 3 operations: operation1, operation2, operation3
   • Auto-discovery skill with trigger phrases
   • MCP integration stub(s)
   • personal sharing scope

🎯 Next steps:

   1. Review the design:
      cat .claude/designs/domain-name.json

   2. Generate files:
      /scaffold:domain domain-name

   3. Customize and test
```

## Integration with Claude Code

The command is designed to work as a Claude Code slash command:

1. User invokes: `/design:domain pm "Project Management"`
2. Claude Code expands the markdown command
3. AI acts as interactive design wizard
4. Guides user through 5 questions
5. Generates design JSON file
6. Displays completion summary
7. User can proceed with `/scaffold:domain pm`

## Next Steps After Design

Users can immediately:
1. Review the design: `cat .claude/designs/{domain}.json`
2. Generate files: `/scaffold:domain {domain}`
3. Customize generated command, skill, and hook files
4. Test with `/registry:scan {domain}`
5. Share with team if scope is "team"

## Related Files

- `.claude/commands/design-domain.md` - Primary implementation (506 lines)
- `.claude/commands/scaffold-domain.md` - Generates files from designs
- `.claude/designs/` - Directory containing all domain designs
- `.claude/designs/plan.json` - Example design file
- `.claude/designs/vtm.json` - Example design file

## Design Examples

Two example designs are included in `.claude/designs/`:

1. **plan.json** - Research, documentation, and planning domain
   - 6 operations: thinking-partner, create-adr, create-spec, to-vtm, list-adrs, list-specs
   - Auto-discovery enabled
   - External integrations: Firecrawl, Tavily, Context7, filesystem
   - Automation hooks: pre-commit, pre-to-vtm
   - Personal sharing scope

2. **vtm.json** - Task management domain
   - Operations for task workflow
   - Auto-discovery enabled
   - External integration: filesystem
   - Automation hooks enabled
   - Personal sharing scope

## Success Criteria

✅ Interactive 5-question design process implemented
✅ All input validation rules implemented
✅ Operation parsing and processing implemented
✅ Trigger phrase generation implemented
✅ Design specification JSON generation implemented
✅ File save and directory creation implemented
✅ Completion summary and next steps displayed
✅ Error handling with clear messages
✅ Integration with `/scaffold:domain` workflow
✅ Comprehensive documentation in command file

## Status

**READY FOR USE** - The `/design:domain` command is fully implemented and ready to guide users through the interactive domain design process.
