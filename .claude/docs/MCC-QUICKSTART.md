# MCC Quick Start Guide

Get started with the Minimum Composable Core in 5 minutes.

## What is MCC?

The MCC is three powerful slash commands that work together:

1. **Design** - Ask questions about what you want to build
2. **Scaffold** - Generate the files automatically
3. **Scan** - See what you've built and check health

## Your First Domain (5 minutes)

### Step 1: Design (2 minutes)

```bash
/design:domain pm "Project Management"
```

This starts an interactive wizard. Answer 5 questions:

1. **Operations** - What should PM do?
   - Answer: `next, review, context, list`

2. **Auto-discovery** - Should Claude suggest commands?
   - Answer: `yes`

3. **External systems** - Need integrations?
   - Answer: `no` (for now)

4. **Automation** - Any hooks?
   - Answer: `no` (for now)

5. **Sharing** - Who uses this?
   - Answer: `personal`

**Output:** `.claude/designs/pm.json` ✅

### Step 2: Scaffold (2 minutes)

```bash
/scaffold:domain pm
```

This generates all the files from your design.

**Output:** Complete plugin structure:

```
.claude/
├── commands/pm/          # 4 command templates
├── skills/pm-expert/     # Skill with auto-discovery
└── plugins/pm-automation/ # Ready for sharing
```

### Step 3: Scan (1 minute)

```bash
/registry:scan pm
```

This shows everything you've created and checks health.

**Output:**

```
✅ Component Inventory
   • 4 commands: /pm:next, /pm:review, /pm:context, /pm:list
   • 1 skill: pm-expert
   • 1 plugin: pm-automation

⚠️ Quality Issues
   • 4 components need testing
   • 1 skill triggers need verification
```

## Next Steps

### Customize Your Commands

Edit the command templates:

```bash
# Edit a command
cat .claude/commands/pm/next.md

# Replace "TODO: Implement your logic here" with real code
nano .claude/commands/pm/next.md
```

### Test a Command

```bash
/pm:next

# Your command runs!
# (Will show template message until customized)
```

### Add Auto-Discovery

The skill was created with trigger phrases. Try:

```
User: "What should I work on?"
Claude: "I can help! Let me suggest /pm:next"
```

### Enable Auto-Discovery for More Commands

The skill already knows about all 4 operations. Customize trigger phrases:

```bash
nano .claude/skills/pm-expert/SKILL.md

# Edit trigger_phrases section with your vocabulary
```

### Create Another Domain

Design a testing domain:

```bash
/design:domain testing "Automated Testing Framework"
```

Then scaffold it:

```bash
/scaffold:domain testing
```

View both domains:

```bash
/registry:scan
```

## Common Tasks

### View Your Design

```bash
cat .claude/designs/pm.json
```

### Update a Design

Edit the JSON directly:

```bash
nano .claude/designs/pm.json
```

Then re-scaffold:

```bash
/scaffold:domain pm
```

### Find All Components

```bash
/registry:scan
```

### Find Components for One Domain

```bash
/registry:scan pm
```

### Find Just Commands

```bash
/registry:scan commands
```

### Check Component Health

```bash
/registry:scan

# Look for quality issues section
```

## Understanding the Workflow

```
Think about what you need
          ↓
    /design:domain
    (Ask 5 questions)
          ↓
    .claude/designs/pm.json
    (Design specification)
          ↓
    /scaffold:domain
    (Generate templates)
          ↓
    .claude/commands/pm/*.md
    .claude/skills/pm-expert/SKILL.md
    .claude/plugins/pm-automation/
    (Editable files ready to customize)
          ↓
    Customize the templates
    (Add your implementation)
          ↓
    Test your commands
    (/pm:next, etc.)
          ↓
    /registry:scan
    (Verify health)
          ↓
    Ready to use!
```

## Command Arguments

All generated commands use `$ARGUMENTS` to get parameters:

```bash
# In your command implementation
FILTER="${ARGUMENTS[0]:-all}"
LIMIT="${ARGUMENTS[1]:-5}"

echo "Filtering: $FILTER, Limit: $LIMIT"
```

When users run:

```bash
/pm:next pending 10
```

Your command receives:

```bash
ARGUMENTS[0]="pending"
ARGUMENTS[1]="10"
```

## File Locations

```
.claude/
├── designs/                  # Your design specifications
│   └── pm.json
├── commands/pm/              # Your slash commands
│   ├── next.md
│   ├── review.md
│   └── ...
├── skills/pm-expert/         # Auto-discovery skills
│   └── SKILL.md
├── plugins/pm-automation/    # Ready-to-share plugin
│   ├── plugin.yaml
│   ├── README.md
│   └── .env.example
├── registry.json             # Component index
└── lib/
    ├── mcc-utils.sh         # Shared utilities
    ├── mcc-config.sh        # Configuration
    └── MCC-INTEGRATION.md   # Detailed docs
```

## Tips & Tricks

### Use Templates

When creating commands, use the generated templates as starting points. They already handle `$ARGUMENTS` parsing.

### Link Commands Together

Have one command suggest the next:

```bash
# In /pm:next implementation
echo "Next, run: /pm:context to see details"
```

### Group Related Operations

If commands are similar, create them in the same domain:

- Testing domain: test, mock, assert, verify
- Deploy domain: build, package, deploy, rollback

### Version Your Designs

Keep old designs for reference:

```bash
# Backup a design
cp .claude/designs/pm.json .claude/designs/pm.json.v1.0.0

# Make changes
nano .claude/designs/pm.json

# Re-scaffold with changes
/scaffold:domain pm
```

### Share Domains

Once a domain is working, commit it:

```bash
git add .claude/designs/pm.json
git add .claude/commands/pm/
git add .claude/skills/pm-expert/
git add .claude/plugins/pm-automation/

git commit -m "Add PM domain automation"
```

Team members get the domain immediately!

## Troubleshooting

### Command doesn't exist

Check file location:

```bash
ls -la .claude/commands/design-domain.md
```

### Design shows "Invalid domain name"

Domain names must:

- Start with a letter
- Use only lowercase letters, numbers, hyphens
- No spaces or special characters

**Valid:** `pm`, `task-manager`, `testing`
**Invalid:** `PM`, `task manager`, `task_manager`

### Scaffold creates empty directory

Check the design file exists:

```bash
cat .claude/designs/pm.json
```

### Registry shows "No components found"

Make sure you've run scaffold:

```bash
/scaffold:domain pm

# Then scan
/registry:scan
```

## Next: Advanced Topics

Once you're comfortable with basics:

1. **External Integrations (MCP)** - Connect to Notion, Jira, etc.
2. **Automation (Hooks)** - Run actions on events (pre-commit, etc.)
3. **Team Sharing** - Share domains with your team
4. **Quality Gates** - Add tests and security reviews

See: `.claude/lib/MCC-INTEGRATION.md` for advanced usage.

## Getting Help

### View the Spec

Complete specification (everything you can do):

```bash
cat .claude/SPEC-minimum-composable-core.md
```

### View Integration Guide

Deep dive into how everything works:

```bash
cat .claude/lib/MCC-INTEGRATION.md
```

### Check Your Design

Always know what you designed:

```bash
cat .claude/designs/{domain}.json | jq .
```

## Summary

You now have:

✅ Three powerful commands for designing domains
✅ Automatic file generation from designs  
✅ Component discovery and health checking
✅ Templates ready to customize
✅ Team sharing capabilities

Build amazing things! 🚀
