---
allowed-tools: Write, Read, Bash(mkdir:*, test:*, cat:*)
description: Interactive design wizard for creating domain specifications
argument-hint: { domain-name } [optional-description]
---

# Design Domain - Interactive Design Wizard

**Command:** `/design:domain {domain-name} [optional-description]`

Interactive AI-powered thinking partner that helps you design what a domain should contain before building it.

This command guides you through a 5-question design process to create a complete domain specification. The result is a JSON file that `/scaffold:domain` can use to generate all the necessary files.

## Usage

```bash
/design:domain pm
/design:domain pm "Project Management"
/design:domain devops "Infrastructure and Deployment"
```

## Process

You are now acting as an interactive design thinking partner. Guide the user through these 5 questions:

### ✨ Initialization

Start with:

```
✨ Let's design the "${domainName}" domain together!

📝 ${description}

I'll ask you 5 questions to create a complete design specification.
You can be detailed or brief - I'll help refine your ideas.

Let's begin!
```

---

### 📝 Question 1: OPERATIONS

Ask:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 QUESTION 1 of 5: Core Operations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What operations should your ${domainName} domain provide?

Think about the key actions users will perform. For example:
  • Getting information (next task, current status)
  • Taking action (create, update, delete)
  • Reviewing state (list, stats, history)

Your operations (comma-separated):
```

**Processing:**

- Parse their response into operation names
- For each operation, create:
  - name: lowercase slug (e.g., "next", "review", "list")
  - description: what it does
  - manual_invocation: `/${domainName}:{operation}`
  - triggers_auto_discovery: true (by default)

**Example conversion:**

- Input: "next task, review progress, list all"
- Output operations:
  ```json
  [
    {
      "description": "Get next task",
      "manual_invocation": "/pm:next",
      "name": "next",
      "triggers_auto_discovery": true
    },
    {
      "description": "Review progress",
      "manual_invocation": "/pm:review",
      "name": "review",
      "triggers_auto_discovery": true
    },
    {
      "description": "List all tasks",
      "manual_invocation": "/pm:list",
      "name": "list",
      "triggers_auto_discovery": true
    }
  ]
  ```

---

### 📝 Question 2: AUTO-DISCOVERY

Ask:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 QUESTION 2 of 5: Auto-Discovery
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Should Claude automatically suggest these commands?

With auto-discovery (Skills):
  • User says: "what should I work on?"
  • Claude suggests: "Let me run /${domainName}:next"

Without auto-discovery (Commands only):
  • User must explicitly say: "/${domainName}:next"

Enable auto-discovery? (yes/no) [recommended: yes]
```

**Processing:**
If yes:

```json
"auto_discovery": {
  "enabled": true,
  "type": "skill",
  "suggested_triggers": [
    // Generate contextual triggers based on operations
    // For "next": ["what should I work on", "next task", "show next"]
    // For "review": ["show status", "review progress", "how are we doing"]
    // For "list": ["show all", "list tasks", "what do we have"]
  ]
}
```

If no:

```json
"auto_discovery": {
  "enabled": false
}
```

---

### 📝 Question 3: EXTERNAL SYSTEMS

Ask:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 QUESTION 3 of 5: External Integrations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Does this domain need to connect to external systems?

Examples:
  • Databases (store task data)
  • APIs (Notion, Jira, GitHub)
  • Cloud services (Firebase, Supabase)
  • File systems (read/write project files)

External integration needed? (yes/no/maybe)
If yes, which systems? (comma-separated)
```

**Processing:**
If yes:

```json
"external_integration": {
  "needed": true,
  "type": "mcp",
  "systems": [
    {"name": "notion", "type": "api"},
    {"name": "project_db", "type": "database"}
  ]
}
```

If no:

```json
"external_integration": {
  "needed": false
}
```

---

### 📝 Question 4: AUTOMATION

Ask:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 QUESTION 4 of 5: Automation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Should any operations run automatically?

Examples:
  • Pre-commit: Validate task is linked before commit
  • Post-checkout: Update local task cache
  • Pre-push: Check all tasks are complete
  • Scheduled: Daily standup report

Need automation hooks? (yes/no)
If yes, which events? (pre-commit, post-checkout, pre-push)
```

**Processing:**
If yes:

```json
"automation": {
  "enabled": true,
  "hooks": [
    {"event": "pre-commit", "action": "${domainName}_pre_commit"},
    {"event": "post-checkout", "action": "${domainName}_post_checkout"}
  ]
}
```

If no:

```json
"automation": {
  "enabled": false
}
```

---

### 📝 Question 5: SHARING

Ask:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 QUESTION 5 of 5: Sharing Scope
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Who will use this domain?

Options:
  • personal - Just you (local development)
  • team - Your team (shared repository)
  • community - Public (published to registry)

Sharing scope? (personal/team/community)
If team, who are the team members? (comma-separated emails)
```

**Processing:**

```json
"sharing": {
  "scope": "team",
  "team_members": ["alice@example.com", "bob@example.com"],
  "published": false
}
```

---

## Generate Design Specification

After collecting all answers, generate the complete design spec:

```json
{
  "created_at": "{ISO8601 timestamp}",
  "description": "{description}",
  "design": {
    "auto_discovery": {
      /* from Q2 */
    },
    "automation": {
      /* from Q4 */
    },
    "external_integration": {
      /* from Q3 */
    },
    "operations": [
      /* from Q1 */
    ],
    "recommendations": {
      "next_steps": [
        "Run: /scaffold:domain {domainName}",
        "Customize generated command files",
        "Test commands locally: /{domainName}:{operation}",
        "Add quality gates and tests when ready",
        "Review with team if team scope" /* if team */
      ],
      "start_with": [
        "Create commands for: {operation names}",
        "Add skill with trigger phrases for auto-discovery" /* if enabled */,
        "Create MCP stub(s) for external system connection" /* if enabled */,
        "Add hook script(s) for automated tasks" /* if enabled */,
        "Create README.md for documentation"
      ]
    },
    "sharing": {
      /* from Q5 */
    }
  },
  "name": "{domainName}",
  "version": "1.0.0"
}
```

---

## Save the Design

Use the Write tool to save the design specification:

```javascript
// Ensure designs directory exists
const designsDir = '.claude/designs';
// Create if needed

// Write design spec
const designPath = `${designsDir}/${domainName}.json`;
const designSpec = /* generated JSON above */;

// Write to file with Write tool
```

---

## Final Output

Show the user:

```
✅ Design complete!

📄 Design specification saved to:
   .claude/designs/${domainName}.json

📦 Your ${domainName} domain includes:
   • ${operationCount} operations: ${operationNames}
   ${autoDiscoveryEnabled ? '• Auto-discovery skill with trigger phrases' : ''}
   ${externalIntegrationEnabled ? '• MCP integration stubs' : ''}
   ${automationEnabled ? '• Automation hooks' : ''}
   • ${sharingScope} sharing scope

🎯 Next steps:

   1. Review the design:
      cat .claude/designs/${domainName}.json

   2. Generate files:
      /scaffold:domain ${domainName}

   3. Customize and test

Need to make changes? Run this command again to redesign.
```

---

## Error Handling

**Domain already exists:**

```
⚠️  Design for "${domainName}" already exists at:
   .claude/designs/${domainName}.json

Options:
  • View existing: cat .claude/designs/${domainName}.json
  • Delete and redesign: rm .claude/designs/${domainName}.json
  • Choose different name: /design:domain ${domainName}-v2
```

**Invalid domain name:**

```
❌ Invalid domain name: "${domainName}"

Domain names must:
  • Be lowercase
  • Use letters, numbers, hyphens only
  • Start with a letter
  • Be 2-20 characters

Examples: pm, devops, test-automation, deploy
```

---

## Implementation

You are now an interactive design wizard. Your job is to:

1. **Parse arguments** from ARGUMENTS array
   - ARGUMENTS[0] = domain name
   - ARGUMENTS[1..] = description (or generate default)

2. **Validate** the domain name
   - Must be lowercase, 2-20 characters
   - Only letters, numbers, hyphens
   - Start with a letter
   - Pattern: `/^[a-z][a-z0-9-]{1,19}$/`

3. **Check** if design already exists
   - Path: `.claude/designs/{domain}.json`
   - If exists, show warning with options

4. **Ask 5 questions** sequentially (wait for answers between each)
   - Show progress indicator ("QUESTION X of 5")
   - Display question with context and examples
   - Validate responses before moving on
   - Show what you captured and ask for confirmation

5. **Generate** design specification JSON containing:
   - `created_at`: ISO timestamp
   - `name`: domain name
   - `description`: from arguments
   - `version`: "1.0.0"
   - `design`: object with operations, auto_discovery, external_integration, automation, sharing, recommendations

6. **Save** to `.claude/designs/{domain}.json`
   - Create .claude/designs directory if needed
   - Pretty-print JSON with 2-space indent
   - Atomic write

7. **Show** completion summary with:
   - File location
   - Domain configuration
   - Next steps
   - How to scaffold

## Key Processing Rules

**Q1 - Operations Processing:**
- Split by comma, trim whitespace
- Convert to lowercase slugs (remove special chars)
- Generate descriptions: "{Operation} operation for {domain}"
- Return array of operation objects

**Q2 - Trigger Phrases:**
- Generate contextual phrases for each operation
- Examples: "next" → "what should I work on", "list" → "show all"
- Create 2-4 phrases per operation
- Return sorted array

**Q3 - External Systems:**
- Parse comma-separated system names
- Convert to lowercase slugs
- Set type to "api" by default
- Return array or empty array

**Q4 - Automation Hooks:**
- Parse comma-separated hook events
- Valid events: pre-commit, post-checkout, pre-push, pre-to-vtm
- Generate action names: `hook_{event_with_underscores}`
- Return array or empty array

**Q5 - Sharing Scope:**
- Parse: "personal", "team", or "community"
- Default: "personal"
- If "team", ask for comma-separated emails
- Return scope object with team_members array

## Error Messages

**Invalid domain name:**
```
❌ Invalid domain name: "{input}"

Domain names must:
  • Be lowercase
  • Use letters, numbers, hyphens only
  • Start with a letter
  • Be 2-20 characters

Examples: pm, devops, test-automation, deploy
```

**Design exists:**
```
⚠️  Design for "{domain}" already exists at:
   .claude/designs/{domain}.json

Options:
  • View existing: cat .claude/designs/{domain}.json
  • Delete and redesign: rm .claude/designs/{domain}.json
  • Choose different name: /design:domain {domain}-v2
```

## Related Commands

- **Next:** `/scaffold:domain {domain}` - Generate files from this design
- **View:** `cat .claude/designs/{domain}.json`
- **List:** `/registry:scan` - See all domains after scaffolding

---

**Status:** Ready for Implementation
**Priority:** CRITICAL - This is the interactive entry point for the MCC system
