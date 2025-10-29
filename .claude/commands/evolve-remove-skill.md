# Evolve: Remove Skill - Disable Auto-Discovery

**Command:** `/evolve:remove-skill {command}`
**Version:** 1.0.0
**Purpose:** Remove auto-discovery skill from a command, returning it to manual-only invocation. The command still works exactly the same, but Claude won't auto-suggest it.

---

## What This Command Does

Removes the skill file and skill metadata from a command, effectively disabling auto-discovery while keeping the command fully functional for manual use.

---

## Usage

```bash
# Remove skill from command
/evolve:remove-skill pm:next

# Dry run (preview only)
/evolve:remove-skill pm:next --dry-run
```

---

## Arguments

```javascript
const command = ARGUMENTS[0] // Format: namespace:operation
const dryRun = ARGUMENTS.includes("--dry-run")
```

---

## Implementation

Execute the skill removal using the EvolveManager:

```javascript
const { EvolveManager } = require("./.claude/lib/evolve")
const evolve = new EvolveManager()

try {
  evolve.removeSkill(command, { dryRun })
} catch (error) {
  console.error("❌ Removal failed:", error.message)
  process.exit(1)
}
```

---

## Example Output

```
⏮️  Removing skill from /pm:next

📋 Current skill: pm-next-discovery
   Trigger phrases: 6
   Location: .claude/skills/pm-next-discovery/

✅ Skill removed from /pm:next

🗄️  Archived to: .claude/.archive/pm-next-discovery-2025-10-29/
📝 Updated: .claude/commands/pm/next.md (removed skill_id)

Command still works!
  • Manual: /pm:next ✅ (unchanged)
  • Auto: "what should I work on?" ❌ (no longer triggers)

Restore anytime:
  /evolve:add-skill pm:next
```

---

## What Gets Changed

### 1. Skill Directory

- Moved from `.claude/skills/{namespace}-{operation}-discovery/`
- Archived to `.claude/.archive/{namespace}-{operation}-discovery-{timestamp}/`

### 2. Command Metadata

- `skill_id` field removed from command frontmatter
- Command file otherwise unchanged

### 3. Evolution Record

- Removal recorded in `.claude/history/{command}.evolution.json`
- Includes rollback instructions

---

## Why Remove a Skill?

**Good reasons:**

- ✅ Trigger phrases conflict with other skills
- ✅ Command used rarely, clutters auto-suggest
- ✅ Testing manual-only workflow
- ✅ Temporarily disable during refactor
- ✅ Command being deprecated

**Not necessary if:**

- ❌ Just want different trigger phrases → Update skill file instead
- ❌ Command has bugs → Fix the command, not the skill
- ❌ Skill works fine → No need to remove

---

## Validation

The command will validate:

- ✅ Command exists
- ✅ Command has a skill attached
- ✅ Skill directory can be archived
- ✅ Command format is valid (namespace:operation)

---

## Error Handling

**No skill attached:**

```
❌ No skill attached to /pm:next
Command is already manual-only.

Add skill if needed:
  /evolve:add-skill pm:next
```

**Command not found:**

```
❌ Command not found: .claude/commands/pm/next.md
Cannot remove skill from non-existent command.
```

**Invalid format:**

```
❌ Invalid command format. Use: namespace:operation
Example: /evolve:remove-skill pm:next
```

---

## Before & After

**Before (Auto-Discovery Enabled):**

```
User: "What should I work on?"
Claude: "Let me check... [auto-runs /pm:next]"
User: "/pm:next"
Claude: [executes command]
```

**After (Manual Only):**

```
User: "What should I work on?"
Claude: "I don't have access to your task list."
User: "/pm:next"
Claude: [executes command] ✅ Still works!
```

---

## Restoring the Skill

Three ways to restore:

### 1. Re-add with same triggers

```bash
/evolve:add-skill pm:next
# Auto-generates triggers (might differ from original)
```

### 2. Re-add with original triggers

```bash
# Check archived triggers
cat .claude/.archive/pm-next-discovery-*/SKILL.md

# Re-add with those triggers
/evolve:add-skill pm:next "original, trigger, phrases"
```

### 3. Rollback the removal

```bash
/evolve:rollback pm:next
# Restores exact previous state
```

---

## Safety Features

**Non-Destructive:**

- Skill archived, not deleted
- Command unchanged (except metadata)
- Can restore anytime

**Reversible:**

- Use `/evolve:add-skill` to re-enable
- Use `/evolve:rollback` to restore exact state

**History Tracked:**

- Evolution recorded
- Rollback command provided
- Archive timestamped

---

## Related Commands

- **Add Skill Back:** `/evolve:add-skill {command}` - Re-enable auto-discovery
- **Rollback:** `/evolve:rollback {command}` - Undo this removal
- **Test Command:** `/test:command {command}` - Verify still works
- **View History:** Check `.claude/history/{command}.evolution.json`

---

## Notes

- Non-breaking: Command still works manually
- Reversible: Can restore skill anytime
- Archived: Skill preserved in .archive/
- History tracked: Evolution recorded
- Clean: Removes metadata references

---

**Status:** Ready for Use
**Library:** Backed by EvolveManager.removeSkill() in `.claude/lib/evolve.ts`
