# /design:domain Command - User Guide

Welcome! This guide walks you through using the `/design:domain` command to design new Claude Code domains.

## What is a Domain?

A **domain** is a collection of related slash commands that work together to accomplish a specific task. Examples:

- **pm** domain: Project management commands (`/pm:next`, `/pm:review`, `/pm:context`, `/pm:list`)
- **test** domain: Testing commands (`/test:run`, `/test:debug`, `/test:report`)
- **devops** domain: DevOps commands (`/devops:deploy`, `/devops:status`, `/devops:logs`)

Before building a domain, use `/design:domain` to plan it out.

## Quick Start

### Basic Command

```bash
/design:domain pm
```

### With Description

```bash
/design:domain pm "Project Management Workflows"
```

### What Happens

1. System validates your domain name
2. You answer 5 questions interactively
3. System generates a design spec saved to `.claude/designs/pm.json`
4. You get recommendations for next steps
5. You run `/scaffold:domain pm` to generate the actual files

## The 5 Questions

### Question 1: Core Operations

**What it asks:** What operations should your domain provide?

**What it means:** These become your slash commands. For example, if you say "next, review, context", you'll get:
- `/pm:next`
- `/pm:review`
- `/pm:context`

**Examples to consider:**
- "Getting the next task to work on" → operation: `next`
- "Checking status or progress" → operation: `review` or `status`
- "Getting detailed information" → operation: `context` or `details`
- "Listing all items" → operation: `list` or `show`
- "Creating new items" → operation: `create` or `new`
- "Updating items" → operation: `update` or `edit`

**How to answer:**
```
List operations (comma-separated): next, review, context, list
```

### Question 2: Auto-Discovery

**What it asks:** Should Claude auto-suggest these commands?

**What it means:** With auto-discovery enabled, Claude learns trigger phrases. When you mention them, Claude suggests running the command.

**Example without auto-discovery:**
```
You: /pm:next
Claude: Shows next PM task
```

**Example with auto-discovery:**
```
You: What should I work on?
Claude: Based on your question, I suggest: /pm:next
```

**How to answer:**
```
Enable auto-discovery? (yes/no): yes
```

If you choose "yes":
- System suggests trigger phrases
- You can add custom ones

**Suggested phrases include:**
- "what should i work on"
- "next task"
- "show my tasks"
- "status"
- "progress"

### Question 3: External Systems

**What it asks:** Does your domain need to connect to external services?

**What it means:** Many domains need to fetch/update data from external sources. This is handled via MCP (Model Context Protocol).

**Examples of external systems:**
- **Databases:** Notion, Airtable, MongoDB, local database
- **APIs:** GitHub, Jira, Slack, Linear, Asana
- **Cloud services:** AWS, Firebase, Supabase, Azure

**How to answer:**
```
Need external integration? (yes/no/maybe): yes
List external systems (comma-separated): Notion
```

Or answer "no" if you don't need external integration.

The "maybe" option means you're not sure yet, but MCP can be added later.

### Question 4: Automation

**What it asks:** Should some operations run automatically?

**What it means:** Add hooks that trigger automatically on certain events.

**Common automation examples:**
- **Pre-commit:** Validate task is linked before allowing commits
- **Post-commit:** Update task status automatically
- **Scheduled:** Daily standup digest at 9 AM
- **On-complete:** When task finishes, update metrics

**How to answer:**
```
Need automation? (yes/no): yes
List hooks (comma-separated): pre-commit
```

If you don't need automation, just answer "no".

### Question 5: Sharing Scope

**What it asks:** Who will use this domain?

**Options:**

| Option | Meaning | Use Case |
|--------|---------|----------|
| **personal** | Just you, local only | Side projects, personal tools |
| **team** | Your team, shared repo | Team workflows, shared domains |
| **community** | Public registry | Open-source tools, shared with everyone |

**How to answer:**
```
Sharing scope (personal/team/community): personal
```

If you choose "team", you'll be asked for team member emails.

## Example Session: Designing PM Domain

Here's a complete example of designing a PM domain:

```bash
$ /design:domain pm "Project Management"

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

List operations (comma-separated, e.g., "next, review, context"):
→ next, review, context, list

────────────────────────────────────────────────────────────
Question 2/5: AUTO-DISCOVERY (Skills)
────────────────────────────────────────────────────────────
Should Claude auto-suggest these commands?

Examples:
  Manual:  User types /pm:next
  Auto:    User says "what should I work on?" → Claude suggests /pm:next

Enable auto-discovery? (yes/no):
→ yes

Generating suggested trigger phrases...
Suggestions: what should i work on, next task, show my tasks, status, progress, show progress, context, what is the context
Add custom trigger phrases? (comma-separated, optional):
→ pm status, pm review

────────────────────────────────────────────────────────────
Question 3/5: EXTERNAL SYSTEMS (MCP Integration)
────────────────────────────────────────────────────────────
Does your domain need to connect to external systems?

Examples:
  • Database (local, Notion, Airtable)
  • API (Jira, GitHub, Slack)
  • Cloud service (AWS, Azure, Google Cloud)

Need external integration? (yes/no/maybe):
→ yes
List external systems (comma-separated, optional):
→ Notion

────────────────────────────────────────────────────────────
Question 4/5: AUTOMATION (Hooks & Events)
────────────────────────────────────────────────────────────
Should some operations run automatically?

Examples:
  • Pre-commit:  Validate task status before committing
  • Scheduled:   Daily standup digest
  • Triggered:   On task completion, update metrics

Need automation? (yes/no):
→ yes

Common hook events: pre-commit, post-commit, scheduled, on-complete
List hooks (comma-separated, optional, e.g., "pre-commit"):
→ pre-commit

────────────────────────────────────────────────────────────
Question 5/5: SHARING SCOPE
────────────────────────────────────────────────────────────
Who will use this domain?

Options:
  • personal  - Just me (local only)
  • team      - My team (shared repository)
  • community - Public registry

Sharing scope (personal/team/community):
→ team
Team member emails (comma-separated, optional):
→ alice@company.com, bob@company.com

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

## Understanding Your Design Output

After completing the questionnaire, you'll have a file at `.claude/designs/{domain}.json`.

### Example Design File

```json
{
  "name": "pm",
  "description": "Project Management Workflows",
  "version": "1.0.0",
  "created_at": "2025-10-29T14:30:00Z",
  "design": {
    "operations": [
      {
        "name": "next",
        "description": "Get next task",
        "triggers_auto_discovery": true,
        "manual_invocation": "/pm:next"
      },
      {
        "name": "review",
        "description": "Review progress",
        "triggers_auto_discovery": true,
        "manual_invocation": "/pm:review"
      }
    ],
    "auto_discovery": {
      "enabled": true,
      "type": "skill",
      "suggested_triggers": [
        "what should i work on",
        "next task",
        "pm status",
        "pm review"
      ]
    },
    "external_integration": {
      "needed": true,
      "type": "mcp",
      "systems": [
        {
          "name": "notion",
          "type": "api"
        }
      ]
    },
    "automation": {
      "enabled": true,
      "hooks": [
        {
          "event": "pre-commit",
          "action": "pm_pre_commit"
        }
      ]
    },
    "sharing": {
      "scope": "team",
      "team_members": [
        "alice@company.com",
        "bob@company.com"
      ]
    },
    "recommendations": {
      "start_with": [
        "Create commands for: next, review, context",
        "Add skill with trigger phrases for auto-discovery",
        "Create MCP stub(s) for external system connection",
        "Add hook script(s) for automated tasks",
        "Create README.md for team documentation"
      ],
      "next_steps": [
        "Run: /scaffold:domain pm",
        "Customize generated command files",
        "Test commands locally: /pm:next",
        "Add quality gates and tests when ready",
        "Review with team if team"
      ]
    }
  }
}
```

### What Each Section Means

**operations:** The commands that will be created. Each operation becomes a slash command.

**auto_discovery:** If enabled, Claude learns trigger phrases and auto-suggests commands.

**external_integration:** Lists external systems that need MCP integration (databases, APIs, etc.).

**automation:** Hooks that run automatically on events (pre-commit, scheduled, etc.).

**sharing:** Who has access (personal = local only, team = shared, community = public).

**recommendations:** Suggested next steps based on your choices.

## Next Steps After Design

### 1. Review Your Design

```bash
cat .claude/designs/pm.json
```

Make sure it looks right. If you want to change anything, you'll need to re-run the design command.

### 2. Scaffold Your Domain

Generate all the files and templates:

```bash
/scaffold:domain pm
```

This creates:
- Command templates in `.claude/commands/pm/`
- Skill definition in `.claude/skills/pm-expert/SKILL.md`
- MCP config stub (if needed)
- Hook scripts (if needed)
- Plugin manifest

### 3. Customize the Generated Files

Edit the generated command files to add your actual implementation:

```bash
nano .claude/commands/pm/next.md
nano .claude/commands/pm/review.md
```

### 4. Test Your Commands

Once you've customized the command files:

```bash
/pm:next        # Should work with your implementation
/pm:review      # Test other commands
```

### 5. Scan to Verify

After everything is working, verify all components are properly indexed:

```bash
/registry:scan pm
```

## Troubleshooting

### "Invalid domain name"

**Problem:** Domain name contains invalid characters

**Solution:** Domain names must be lowercase alphanumeric with hyphens only:
- ✅ Valid: `pm`, `task-manager`, `devops`, `test-utils`
- ❌ Invalid: `PM`, `task manager`, `task_manager`, `task@pm`

### "Domain already exists"

**Problem:** You've already created a design for this domain

**Solution:** Either use a different domain name or delete the existing design:
```bash
rm .claude/designs/pm.json
```

Then run `/design:domain pm` again.

### "At least one operation is required"

**Problem:** You didn't provide any operations in Q1

**Solution:** Go back and enter at least one operation (e.g., "next", "review", "list")

### "Please enter: personal, team, or community"

**Problem:** Q5 answer wasn't recognized

**Solution:** Type exactly one of: `personal`, `team`, or `community`

## Common Domain Patterns

### Pattern 1: Simple Task/Item Management

```
Operations:   next, context, list, update
Auto-discover: yes
External:     yes (task database)
Automation:   yes (pre-commit validation)
Sharing:      team
```

### Pattern 2: DevOps/Infrastructure

```
Operations:   deploy, status, logs, rollback, health-check
Auto-discover: yes
External:     yes (cloud provider API)
Automation:   yes (pre-deploy validation, post-deploy health check)
Sharing:      team
```

### Pattern 3: Local Development Tools

```
Operations:   setup, test, build, clean
Auto-discover: no
External:     no
Automation:   no
Sharing:      personal
```

### Pattern 4: Documentation Management

```
Operations:   list, search, generate, update
Auto-discover: yes
External:     maybe (wiki/docs system)
Automation:   no
Sharing:      community
```

## Tips for Better Designs

1. **Keep operations focused**: Each operation should do one thing well
2. **Use clear names**: Operations like "next" and "review" are clearer than "a" or "do-thing"
3. **Plan external systems**: Think about where your data comes from
4. **Enable auto-discovery**: Skills make commands discoverable and easier to use
5. **Add automation selectively**: Only add hooks you'll actually use

## FAQ

**Q: Can I change my design after creating it?**
A: You'll need to delete the design file and run `/design:domain` again. Future versions may support editing.

**Q: Should I enable auto-discovery?**
A: Generally yes. It makes your commands more discoverable and easier to use.

**Q: What's the difference between personal and team sharing?**
A: Personal = local only, you won't share it. Team = stored in shared repo, your teammates can use it. Community = published to public registry.

**Q: Do I need external integration?**
A: Only if your domain needs to fetch/update data from external systems. If operations are standalone, answer "no".

**Q: Can I add more operations later?**
A: Yes, but it's better to plan them upfront. You can always edit the design file and re-scaffold.

## See Also

- **After Design:** `/scaffold:domain` - Generate files from your design
- **After Scaffolding:** `/registry:scan` - Verify your domain is properly set up
- **Specification:** `.claude/SPEC-minimum-composable-core.md` - Full technical details
- **Implementation Guide:** `.claude/commands/DESIGN-DOMAIN-IMPLEMENTATION.md` - For developers

## Support

Having issues? Check:

1. Your domain name format (lowercase, alphanumeric + hyphens only)
2. The existing design spec: `cat .claude/designs/{domain}.json`
3. The specification: `.claude/SPEC-minimum-composable-core.md`

---

**Happy designing! Your domain is the blueprint for everything that comes next. 🎯**
