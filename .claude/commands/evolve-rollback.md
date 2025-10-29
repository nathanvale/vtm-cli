# Evolve: Rollback - Undo Evolution

**Command:** `/evolve:rollback {component} [target-version]`
**Version:** 1.0.0
**Purpose:** Revert a component to a previous version, undoing one or more evolution operations. All evolutions are tracked and reversible.

---

## What This Command Does

Shows evolution history for a component and allows you to roll back to any previous state. Restores files from archive and updates metadata.

---

## Usage

```bash
# Show history and choose version interactively
/evolve:rollback pm:next

# Rollback to specific version
/evolve:rollback pm:next v1.0.0

# Rollback specific evolution type
/evolve:rollback pm:next add-skill

# Dry run (preview only)
/evolve:rollback pm:next --dry-run
```

---

## Arguments

```javascript
const component = ARGUMENTS[0] // Component name (e.g., "pm:next" or "pm")
const targetVersion = ARGUMENTS[1] // Optional: specific version or evolution type
const dryRun = ARGUMENTS.includes("--dry-run")
```

---

## Implementation

Execute the rollback using the EvolveManager:

```javascript
const { EvolveManager } = require("./.claude/lib/evolve")
const evolve = new EvolveManager()

try {
  evolve.rollback(component, targetVersion, { dryRun })
} catch (error) {
  console.error("❌ Rollback failed:", error.message)
  process.exit(1)
}
```

---

## Example Output

```
⏮️  Rolling back pm:next

📜 Evolution History:

  4. 2025-10-29 15:42  to-plugin v1.2.0     [CURRENT]
     └─ Packaged domain as plugin

  3. 2025-10-29 14:32  add-skill
     └─ Added auto-discovery skill

  2. 2025-10-29 13:20  patch v1.0.2
     └─ Updated command description

  1. 2025-10-29 12:00  initial v1.0.0
     └─ Initial command creation

Which version to restore? (1-4 or 'cancel')
→ 3

⚠️  This will rollback to: 2025-10-29 14:32 (add-skill)

Changes:
  • Remove: Plugin packaging
  • Keep: Auto-discovery skill
  • Restore: Pre-plugin state

Proceed? (yes/no)
→ yes

⏮️  Rolling back...

✅ Rollback complete!

📂 Restored from: .claude/.archive/pm-next-2025-10-29T14:32/
📝 Updated: .claude/commands/pm/next.md
🗑️  Removed: .claude/plugins/pm-automation/

Current state: add-skill (2025-10-29 14:32)

Undo this rollback:
  /evolve:rollback pm:next 4
```

---

## What Gets Restored

### Files

- Command file restored from archive
- Skill files restored (if applicable)
- MCP configs restored (if applicable)
- Hook scripts restored (if applicable)

### Metadata

- Component version reset
- Dependencies updated
- Registry updated
- History preserved (rollback added as new entry)

### Removed

- Files created after target version
- Metadata added after target version
- Plugin packages (if rolling back to-plugin)

---

## Evolution History Format

Each evolution is tracked with:

```json
{
  "appliedBy": "claude",
  "canRollback": true,
  "changes": [
    {
      "action": "created",
      "description": "Created skill for auto-discovery",
      "file": ".claude/skills/pm-next-discovery/"
    }
  ],
  "component": "pm:next",
  "evolutionType": "add-skill",
  "rollbackCommand": "/evolve:remove-skill pm:next",
  "timestamp": "2025-10-29T14:32:00Z"
}
```

---

## Rollback Types

### 1. Specific Version

```bash
/evolve:rollback pm:next v1.0.0
# Restores to exact version
```

### 2. Evolution Type

```bash
/evolve:rollback pm:next add-skill
# Undoes most recent add-skill evolution
```

### 3. Interactive

```bash
/evolve:rollback pm:next
# Shows history, user picks version
```

### 4. Latest (Undo Last)

```bash
/evolve:rollback pm:next latest
# Undoes most recent evolution
```

---

## Safety Features

**Preview First:**

- Shows what will change
- Confirms before proceeding
- Can dry-run

**Preserves History:**

- Rollback itself recorded
- Can rollback a rollback
- Full audit trail

**Validates:**

- Target version exists
- Archive files present
- No conflicts

---

## Validation

The command will validate:

- ✅ Component exists
- ✅ Component has evolution history
- ✅ Target version exists in history
- ✅ Archive files are available
- ✅ No blocking dependencies

---

## Error Handling

**No history found:**

```
❌ No evolution history for pm:next
Component was never evolved.

Available evolutions:
  • /evolve:add-skill pm:next
  • /evolve:to-plugin pm
```

**Invalid version:**

```
❌ Version "v2.0.0" not found in history

Available versions:
  • v1.0.0 (2025-10-29 12:00)
  • v1.0.1 (2025-10-29 13:20)
  • v1.0.2 (2025-10-29 14:32)

Use one of these versions or evolution types:
  • add-skill
  • to-plugin
```

**Archive missing:**

```
❌ Archive not found for version v1.0.0
Archive may have been deleted.

Cannot rollback without archive.
Try:
  • Rollback to different version
  • Restore archive from backup
```

**Dependency conflict:**

```
⚠️  Warning: Other components depend on current version

Components affected:
  • pm:review → depends on pm:next v1.0.2
  • pm:stats → depends on pm:next v1.0.2

Rolling back may break these components.

Proceed anyway? (yes/no)
```

---

## Common Rollback Scenarios

### Undo Skill Addition

```bash
# Added skill, didn't like it
/evolve:rollback pm:next add-skill
# Equivalent to: /evolve:remove-skill pm:next
```

### Undo Plugin Packaging

```bash
# Packaged too early
/evolve:rollback pm to-plugin
# Removes plugin directory
```

### Restore Previous Version

```bash
# Something broke, go back
/evolve:rollback pm:next v1.0.0
# Restores working version
```

### Undo Multiple Evolutions

```bash
# Rollback to early state
/evolve:rollback pm:next 1
# Undoes all subsequent evolutions
```

---

## Related Commands

- **View History:** Check `.claude/history/{component}.evolution.json`
- **Archive Location:** `.claude/.archive/`
- **Test After Rollback:** `/test:command {component}`
- **Registry Update:** `/registry:scan` - Refresh after rollback

---

## Notes

- Always safe: Archives preserved
- Fully reversible: Can rollback a rollback
- History preserved: Full audit trail
- Confirmation required: User must approve
- Dry-run available: Preview changes first

---

## Rollback Best Practices

1. **Always test after rollback:**

   ```bash
   /evolve:rollback pm:next v1.0.0
   /test:command pm:next
   ```

2. **Check dependencies:**
   - See what depends on component
   - Test integrations after rollback

3. **Document why:**
   - Note reason for rollback
   - Track issues in git commit

4. **Update team:**
   - Notify if rolling back shared component
   - Re-package plugin if needed

---

**Status:** Ready for Use
**Library:** Backed by EvolveManager.rollback() in `.claude/lib/evolve.ts`
