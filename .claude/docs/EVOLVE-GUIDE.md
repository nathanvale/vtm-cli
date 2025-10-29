# Component Evolution Guide

**Version:** 1.0-draft
**Status:** User Guide and Examples

---

## Quick Start

The evolve commands help your components grow from simple to complex:

```
1. Create a simple command
2. Add skill for auto-discovery
3. Package into plugin for team
4. Split into focused pieces
5. Undo anything anytime
```

Let's walk through real examples.

---

## Example 1: PM Domain - From Command to Plugin

This walkthrough shows evolving a simple command into a team-shareable plugin.

### Step 1: You've Created a Command

You have a command at `.claude/commands/pm/next.md`:

```markdown
# PM: Next Task

Get the next PM task from your queue.

## Usage
/pm:next [filter] [limit]

## Parameters
- filter: Optional status filter (pending, in-progress, blocked)
- limit: Max results (default 5)

## Example
/pm:next pending 10
```

At this point:
- ✅ Command works
- ❌ Claude doesn't auto-suggest it
- ❌ Not ready to share with team

### Step 2: Add Auto-Discovery

You realize users often say "what should I work on?" but don't know about `/pm:next`.

**Run:**
```bash
/evolve:add-skill pm:next
```

**Interactive:**
```
/evolve:add-skill pm:next

Claude: Found /pm:next command. Adding skill...

Suggest trigger phrases? (yes/no)
→ yes

Generated triggers:
  □ "next task"
  □ "what should I work on"
  □ "next pm task"
  □ "show me next"

Add more? (comma-separated):
→ [empty - accept suggestions]

Preview:
  Before: Only /pm:next (manual)
  After: /pm:next (manual) + auto-discovery

Apply? (yes/no)
→ yes

✅ Skill added!

Now when user says "what should I work on?",
Claude suggests /pm:next automatically.
```

**What Changed:**
- Created: `.claude/skills/pm-next-discovery/SKILL.md`
- Modified: `.claude/commands/pm/next.md` (added skill_id)
- Created: `.claude/history/pm-next.evolution.json`

**New Behavior:**
```
User: "I'm ready to start work. What should I do?"
Claude: "I can help with that! Let me check what's next for you."
        [suggests /pm:next]

User: "Yes, show me"
Claude: [runs /pm:next]
        "Your next task is TASK-001: Fix login bug..."
```

### Step 3: Package Into Plugin

Now you want to share this with your team. First, you've collected several commands:
- `/pm:next` (with skill)
- `/pm:review` (review progress)
- `/pm:context` (get task context)
- `/pm:list` (list tasks)

Plus MCP and hooks.

**Run:**
```bash
/evolve:to-plugin pm --version 1.0.0
```

**Interactive:**
```
/evolve:to-plugin pm

Scanning pm domain...
  ✅ 4 commands
  ✅ 1 skill
  ✅ 1 MCP (pm-notion)
  ✅ 1 hook

Quality check:
  ✅ All documented
  ⚠️  2 commands untested
  Quality: 7/10

Create plugin? (yes/no)
→ yes

Creating plugin package...

1. Plugin manifest: .claude/plugins/pm-automation/plugin.yaml ✅
2. User guide: .claude/plugins/pm-automation/README.md ✅
3. Team setup: .claude/plugins/pm-automation/TEAM-SETUP.md ✅
4. Credentials: .claude/plugins/pm-automation/.env.example ✅

✅ Plugin created!

Next: Share with team
  1. zip -r pm-automation.zip .claude/plugins/pm-automation/
  2. Send to team
  3. Team runs: /install:plugin pm-automation
  4. Team uses: /pm:next, /pm:review, etc.
```

**What Changed:**
- Created: `.claude/plugins/pm-automation/` directory with:
  - `plugin.yaml` (complete manifest)
  - `README.md` (user guide)
  - `TEAM-SETUP.md` (installation instructions)
  - `CONFIGURATION.md` (config reference)
  - `TROUBLESHOOTING.md` (help guide)
  - `.env.example` (credentials template)
- Updated: `.claude/history/pm.evolution.json`

**Sharing:**
```
1. Create zip:
   zip -r pm-automation-v1.0.0.zip \
     .claude/plugins/pm-automation/

2. Send to team with note:
   "Here's our PM automation plugin. To install:

   1. Unzip to .claude/plugins/
   2. Copy .env.example to .env
   3. Set NOTION_API_KEY and NOTION_DATABASE_ID
   4. Try: /pm:next"

3. Team installs and uses
4. Registry shows available plugin
```

### Step 4: Undo If Needed

Made a mistake or want to go back?

**Remove skill:**
```bash
/evolve:remove-skill pm:next

Removes auto-discovery, keeps command.
Command still works, just manual invocation.
```

**Unpackage plugin:**
```bash
/evolve:rollback pm to-plugin

Returns pm domain to pre-plugin state.
All plugin documentation and manifests removed.
Domain still functional.
```

**Full history:**
```bash
/evolve:rollback pm:next

Shows all evolutions:
  3. add-skill (current)
  2. patch v1.0.2
  1. initial v1.0.0

Choose which to rollback to.
```

---

## Example 2: Splitting a Complex Domain

Your domain is doing too much and you want to split it.

### Analyze Before Splitting

```bash
/evolve:split pm --depth 3

Analysis shows:
  • pm-core: 4 commands (task management)
  • pm-tracking: 2 commands (progress tracking)
  • pm-integrations: MCP + hooks

Benefits:
  ✅ Each domain reusable independently
  ✅ Easier to test
  ✅ Cleaner dependencies
```

### Execute Split

```bash
/evolve:split pm

1. Creates new domains:
   - pm-core
   - pm-tracking (depends on pm-core)
   - pm-integrations (depends on pm-core)

2. Moves commands appropriately

3. Marks old 'pm' as deprecated

4. Generates migration guide

5. Creates compatibility shims:
   /pm:next → /pm-core:next
   /pm:review → /pm-tracking:review

Old domain keeps working for one version,
then users migrate to new split domains.
```

### Using Split Domains

**User gets new structure:**
```bash
# Old way (still works, deprecated):
/pm:next
/pm:review

# New way (recommended):
/pm-core:next
/pm-tracking:review

# Auto-imported:
"What's next?" → /pm-core:next (auto-discovered)
"How are we doing?" → /pm-tracking:review (auto-discovered)
```

---

## Example 3: Complex Evolution Scenario

You're building a monitoring domain over time:

### Week 1: Start Simple

Create basic commands:
```bash
/design:domain monitoring "Infrastructure monitoring"
/scaffold:domain monitoring

You now have:
  • monitoring commands
  • monitoring skill
  • basic structure
```

Commands created:
- `/monitor:status` - Check infrastructure status
- `/monitor:alerts` - View active alerts
- `/monitor:metrics` - Show key metrics

### Week 2: Add Auto-Discovery

Users often ask "how's the system?" but don't know about `/monitor:status`.

```bash
/evolve:add-skill monitor:status

Now "is the system up?" auto-suggests /monitor:status
```

### Week 3: Add External Integration

You add Datadog integration:

```bash
# Manually create MCP in .claude/mcp-servers/monitor-datadog/

# Update registry:
/registry:scan

# Test integration works
/test:command monitor:status
```

### Week 4: Package for Team

Time to share with team:

```bash
/evolve:to-plugin monitoring --version 1.0.0

Plugin created and ready to share.
Team can now install and use.
```

### Week 5: Realize It's Too Complex

You want to split monitoring into smaller domains:

```bash
/evolve:split monitoring --analyze-only

Sees opportunity to split:
  • monitoring-core (basic status/metrics)
  • monitoring-alerts (alert management)
  • monitoring-datadog (datadog integration)

Proceed with split:
/evolve:split monitoring

Three focused domains created.
Old monitoring domain deprecated.
Migration guide generated.
```

### Week 6: Need to Revert Something

Something broke in the split. Quick rollback:

```bash
/evolve:rollback monitoring split

Back to pre-split state.
All three new domains archived.
Users back to using single monitoring domain.
```

Then fix issues and try again.

---

## Example 4: Team Collaboration

### Scenario: Team Evolves Domain Together

**Monday: Alice Creates Commands**
```bash
Alice creates .claude/commands/deploy/
  • start.md - Start deployment
  • status.md - Check deployment status
  • rollback.md - Rollback deployment

/registry:scan shows new commands
Team sees them in registry
```

**Tuesday: Bob Adds Skill to One Command**
```bash
Bob: "Let's make /deploy:start auto-discovered"

/evolve:add-skill deploy:start

Bob:
  Trigger phrases: "deploy", "start deployment", "deploy now"

/registry:scan
  Both see skill added to deploy:start
```

**Wednesday: Carol Improves Documentation**
```bash
Carol sees commands need better docs

Updates .claude/commands/deploy/*.md
/registry:scan shows quality improved
```

**Thursday: Team Packages as Plugin**
```bash
/evolve:to-plugin deploy --version 1.0.0

Plugin ready with:
  • 3 commands
  • 1 skill (deploy:start auto-discovery)
  • README with setup
  • Team docs

Team shares zip with other teams
```

**Friday: First Team Using It**
```bash
New team installs plugin:
  /install:plugin deploy-automation

They now have:
  /deploy:start (with auto-discovery)
  /deploy:status
  /deploy:rollback

Plus full documentation
```

---

## Example 5: Quality-Driven Evolution

### Scenario: Ensure Quality Before Evolution

You want to evolve a domain but first improve quality:

```bash
/evolve:add-skill pm:next

Quality check (before evolution):
  ⚠️  pm:next not tested
  ⚠️  pm:next lacks examples
  ⚠️  No error handling documented

Should I:
  a) Proceed anyway (quality: 5/10)
  b) Fix issues first
  c) Create task to fix later
```

**Option: Fix First**

```bash
You fix the issues:
  1. Add tests: /test:command pm:next
  2. Add examples: Edit pm:next.md
  3. Document errors: Add troubleshooting section

Then retry evolution:
  /evolve:add-skill pm:next

Quality check:
  ✅ pm:next is tested
  ✅ Examples provided
  ✅ Errors documented
  Quality: 9/10

Apply skill addition? → yes

✅ Added with high quality!
```

---

## Workflow Templates

### Template 1: Quick MVP to Team

```bash
# Day 1: MVP
/design:domain awesome-feature
/scaffold:domain awesome-feature
# → Create basic commands

# Day 2: Make discoverable
/evolve:add-skill awesome-feature:main
# → Add auto-discovery to main command

# Day 3: Team ready
/evolve:to-plugin awesome-feature --version 0.1.0
# → Package for team

# Result: Team can install and use
# in 3 days, fully reversible
```

### Template 2: Evolution Before Release

```bash
# Have: Working but simple domain
/registry:scan awesome-feature
# → Shows current state

# Improve: Add auto-discovery to key commands
/evolve:add-skill awesome-feature:query
/evolve:add-skill awesome-feature:edit
# → Now users get suggestions

# Check: Are we ready?
/registry:scan awesome-feature
# → Shows all components linked properly

# Test: Everything still works
/test:command awesome-feature:*
# → All tests pass

# Release: Package as plugin
/evolve:to-plugin awesome-feature --version 1.0.0
# → Ready for team/public
```

### Template 3: Refactoring Large System

```bash
# Current: One big domain with lots of commands
/evolve:split big-domain --analyze-only
# → See split opportunities

# Plan: Understand the split
# Review suggested splits
# Discuss with team

# Execute: Run the split
/evolve:split big-domain
# → Creates smaller, focused domains

# Migrate: Team upgrades
# Old domain still works for one version
# Migration guide provided
# Team moves to new smaller domains

# Monitor: Check quality
/registry:scan
# → Shows dependency tree
# → Identifies any issues

# Complete: Remove old domain (optional)
# After migration period
# Archive old domain
```

---

## Troubleshooting

### Problem: Skill Has Conflicting Triggers

**Symptom:**
```
/evolve:add-skill pm:next

⚠️  Trigger phrase conflict detected

"what should I work on" already used by:
  • pm-expert skill
  • test-expert skill

Commands conflict: pm:next vs test:next
```

**Solution:**
```
Option 1: Use unique triggers
  /evolve:add-skill pm:next

  Suggested unique triggers:
  • "next pm task" (includes domain)
  • "show my pm tasks"

  Accept? → yes

Option 2: Edit manually
  Edit .claude/skills/pm-next-discovery/SKILL.md
  Change trigger_phrases to unique values

Option 3: Resolve conflict
  /evolve:remove-skill test:next
  Then re-add both with unique triggers
```

### Problem: Rollback Says "Rollback Not Available"

**Symptom:**
```
/evolve:rollback pm:next

⚠️  Can't rollback to that version
    Version 1.0.0 files deleted

Available versions:
  • 1.0.2 (current)
  • 1.0.1
```

**Solution:**
```
Option 1: Rollback to most recent
  /evolve:rollback pm:next 1.0.1

Option 2: Restore from archive
  Files archived in: .archive/commands/pm/next/
  Check for older versions

Option 3: Manual restore
  Git history available:
  git log -- .claude/commands/pm/next.md
  git checkout <hash> -- .claude/commands/pm/next.md
```

### Problem: Circular Dependencies After Split

**Symptom:**
```
/evolve:split pm

⚠️  Split creates circular dependencies

  pm-core depends on pm-integrations
  pm-integrations depends on pm-core

Cannot proceed.
```

**Solution:**
```
Move shared code to avoid cycle:

Option 1: Create shared domain
  /design:domain pm-shared "Shared PM models"

  pm-core depends on pm-shared
  pm-integrations depends on pm-shared

  No cycle!

Option 2: Adjust split boundaries
  /evolve:split pm --analyze-only

  Adjust suggested split
  Rerun split
```

### Problem: Can't Package Domain as Plugin

**Symptom:**
```
/evolve:to-plugin pm

❌ Cannot create plugin

Issues:
  • 2 commands untested
  • 1 MCP unconfigured
  • Missing documentation

Quality score: 4/10 (minimum 5 required)
```

**Solution:**
```
Address quality issues:

1. Test commands
   /test:command pm:next
   /test:command pm:review

2. Configure MCP
   Edit .claude/mcp-servers/pm-notion/mcp.json
   Verify all required fields

3. Document domain
   Update .claude/commands/pm/*/md files
   Add examples
   Add troubleshooting

4. Verify quality
   /registry:scan pm

5. Try plugin again
   /evolve:to-plugin pm --version 1.0.0

Quality check: 8/10
Plugin created successfully!
```

---

## Best Practices

### 1. Evolve Deliberately

**Good:**
```bash
# Test first
/test:command pm:next
# Result: ✅ Pass

# Add skill
/evolve:add-skill pm:next

# Verify skill works
# User says "what should I work on?"
# Claude suggests /pm:next
# ✅ Works!
```

**Avoid:**
```bash
# Just add skill without testing
/evolve:add-skill pm:next

# Later discover command has bugs
# Skill suggests broken command
# ❌ Users frustrated
```

### 2. Version as You Evolve

```bash
# When adding skill, version change:
# Before: v1.0.0 (no skill)
# After:  v1.0.1 (with skill)

# When packaging as plugin:
# v1.0.1 → v1.0.0 (stable release for team)

# When splitting:
# pm v1.0.0 → pm-core v1.0.0, pm-tracking v1.0.0
# pm v1.0.1 (deprecated)
```

### 3. Communicate Evolution Steps

**Tell your team:**
```
Subject: PM Domain Update - Now with Auto-Discovery

We've evolved the PM domain:

OLD (still works):
  /pm:next

NEW (recommended):
  /pm:next (same, but auto-suggested)
  + When you say "what should I work on?"
  + Claude suggests /pm:next
  + No action needed - just works!

Migration:
  None needed. Command works same as before.
  Just enjoy the auto-discovery feature.

Feedback?
  Let us know how it feels.
```

### 4. Keep Old Invocation Working

When evolving, always maintain backwards compatibility:

```
BAD:
  /pm:next → Removed after split
  /pm-core:next → New command

  Users get: "Unknown command: /pm:next"

GOOD:
  /pm:next → Maps to /pm-core:next
  /pm-core:next → New actual command

  Users get: Works as before!
  Teams migrating gets: "Use /pm-core:next" advice
```

### 5. Archive Before Deleting

Never permanently delete without backup:

```bash
# Before removing domain:
/evolve:rollback pm
# Creates archive: .archive/domains/pm/
# Original preserved

# Then delete if absolutely sure:
rm -rf .claude/commands/pm/
# But could have recovered from archive
```

---

## FAQ

### Q: Can I rollback an evolution?
**A:** Yes! Every evolution is reversible.
```bash
/evolve:rollback {component}
# Shows history and lets you pick version
```

### Q: What if my team uses old invocation after split?
**A:** That's fine! Create shims that forward to new commands:
```bash
/pm:next → /pm-core:next (automatically)
# Old invocation keeps working
```

### Q: Do I need to evolve every component?
**A:** No! Simple commands can stay simple. Evolve when needed:
- Add skill when users need auto-discovery
- Package as plugin when sharing with team
- Split when domain gets too complex

### Q: Can evolutions fail safely?
**A:** Yes. Before any evolution:
- Preview shown
- Confirmation required
- Backups created
- Rollback path always available

### Q: What about merge conflicts in team?
**A:** Evolution happens atomically:
- One person runs `/evolve:to-plugin`
- Commits changes
- Team pulls updates
- `/registry:scan` shows new plugin

### Q: How do I know if split is safe?
**A:** Let the tool analyze first:
```bash
/evolve:split my-domain --analyze-only
# Shows impact without changes
# You decide if to proceed
```

### Q: Can I undo a split?
**A:** Yes, fully reversible:
```bash
/evolve:rollback my-domain split
# Back to pre-split state
```

---

## Next Steps

1. **Design your domain** (if not done)
   ```bash
   /design:domain my-feature
   ```

2. **Scaffold it**
   ```bash
   /scaffold:domain my-feature
   ```

3. **Create commands** (implement your operations)

4. **Test thoroughly**
   ```bash
   /test:command my-feature:*
   ```

5. **Evolve as needed**
   ```bash
   /evolve:add-skill my-feature:main
   /evolve:to-plugin my-feature
   /evolve:split my-feature
   ```

6. **Let team use it**
   Share and gather feedback!

---

## Support

For issues or questions:
- Check `.claude/SPEC-lifecycle-layer-evolve.md` for full spec
- Run `/registry:scan` to understand current state
- See troubleshooting section above
- Use `/evolve:rollback` if anything breaks

Happy evolving!
