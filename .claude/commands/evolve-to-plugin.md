# Evolve: To Plugin - Package for Team Sharing

**Command:** `/evolve:to-plugin {domain} [version] [description]`
**Version:** 1.0.0
**Purpose:** Package an entire domain (commands + skills + MCPs + hooks) into a complete, shareable plugin that team members can install.

---

## What This Command Does

Scans all components in a domain, assesses quality, and generates a complete plugin package with:

- Plugin manifest (plugin.yaml)
- README with setup instructions
- Team configuration guide
- All domain components packaged together

---

## Usage

```bash
# Basic usage (auto-version 1.0.0)
/evolve:to-plugin pm

# With version
/evolve:to-plugin pm 1.2.0

# With version and description
/evolve:to-plugin pm 1.2.0 "Project Management Plugin"

# Dry run
/evolve:to-plugin pm --dry-run
```

---

## Arguments

```javascript
const domain = ARGUMENTS[0] // Domain name (e.g., "pm")
const version = ARGUMENTS[1] || "1.0.0" // Version (semver)
const descriptionArg =
  ARGUMENTS.slice(2).join(" ") || `${domain} automation plugin`
const dryRun = ARGUMENTS.includes("--dry-run")

// Clean description if it contains --dry-run
const description = descriptionArg.replace("--dry-run", "").trim()
```

---

## Implementation

Execute the packaging using the EvolveManager:

```javascript
const { EvolveManager } = require("./.claude/lib/evolve")
const evolve = new EvolveManager()

try {
  evolve.toPlugin(domain, version, description, { dryRun })
} catch (error) {
  console.error("❌ Packaging failed:", error.message)
  process.exit(1)
}
```

---

## Example Output

```
📦 Packaging pm domain as plugin

🔍 Scanning components...
  ✓ 4 commands found
  ✓ 1 skill found
  ✓ 1 MCP found
  ✓ 2 hooks found

📊 Quality Score: 8/10

✅ Plugin created: pm-automation v1.2.0

📂 Plugin structure:
  .claude/plugins/pm-automation/
  ├── plugin.yaml           [manifest]
  ├── README.md            [user guide]
  ├── TEAM-SETUP.md        [install instructions]
  ├── CONFIGURATION.md     [config reference]
  ├── commands/            [4 commands]
  ├── skills/              [1 skill]
  ├── mcp-servers/         [1 MCP]
  └── hooks/               [2 hooks]

🎁 Ready to share!

To distribute:
  1. cd .claude/plugins
  2. zip -r pm-automation.zip pm-automation/
  3. Share pm-automation.zip with your team

Team installs with:
  1. unzip pm-automation.zip -d .claude/plugins/
  2. Follow TEAM-SETUP.md
```

---

## What Gets Created

### 1. Plugin Directory

`.claude/plugins/{domain}-automation/`

### 2. Plugin Manifest

`plugin.yaml` with:

- Component inventory
- Dependencies
- Configuration requirements
- Version info

### 3. Documentation

- `README.md` - Overview and features
- `TEAM-SETUP.md` - Step-by-step installation
- `CONFIGURATION.md` - Config options
- `TROUBLESHOOTING.md` - Common issues

### 4. Component Copies

All domain components symlinked or copied into plugin structure

### 5. Evolution Record

`.claude/history/{domain}.evolution.json`

---

## Quality Gates

The command checks quality before packaging:

| Score | Status    | Action                |
| ----- | --------- | --------------------- |
| 8-10  | Excellent | Package immediately   |
| 6-7   | Good      | Package with warnings |
| 4-5   | Fair      | Suggest improvements  |
| 0-3   | Poor      | Block packaging       |

**Minimum score to package: 5/10**

---

## Quality Factors

- ✅ Commands documented
- ✅ Skills have trigger phrases
- ✅ MCPs have configuration
- ✅ Hooks are executable
- ✅ README exists
- ✅ No conflicts detected
- ✅ Tests pass (if present)

---

## Validation

The command will validate:

- ✅ Domain exists and has components
- ✅ Quality score meets minimum (5/10)
- ✅ No conflicting plugins exist
- ✅ Valid semver version
- ✅ Plugin directory structure is correct

---

## Error Handling

**No components found:**

```
❌ No components found for domain: pm
Create commands first: /scaffold:domain pm
```

**Quality too low:**

```
❌ Quality score too low: 3/10 (minimum: 5/10)

Improvements needed:
  • Document commands (add descriptions)
  • Add trigger phrases to skills
  • Configure MCP connections
  • Add README.md

Try again after improvements.
```

**Plugin already exists:**

```
⚠️  Plugin pm-automation already exists

Options:
  • Bump version: /evolve:to-plugin pm 1.3.0
  • Remove old: rm -rf .claude/plugins/pm-automation
  • Use different name
```

---

## Team Distribution Workflow

### 1. Package (Creator)

```bash
/evolve:to-plugin pm 1.0.0
cd .claude/plugins
zip -r pm-automation.zip pm-automation/
```

### 2. Share (Creator)

- Email zip to team
- Upload to shared drive
- Commit to team repo

### 3. Install (Team Member)

```bash
# Unzip
unzip pm-automation.zip -d .claude/plugins/

# Setup
cd .claude/plugins/pm-automation
cat TEAM-SETUP.md  # Follow instructions

# Configure (if needed)
cp .env.example .env
nano .env  # Add credentials

# Verify
/registry:scan pm
```

### 4. Use (Team Member)

```bash
/pm:next
/pm:review
# All commands now available!
```

---

## Versioning

Use semantic versioning:

- `1.0.0` - Initial release
- `1.1.0` - New features (commands)
- `1.0.1` - Bug fixes
- `2.0.0` - Breaking changes

---

## Related Commands

- **Add Skill First:** `/evolve:add-skill {command}` - Add auto-discovery
- **Test Quality:** `/test:command {command}` - Check component quality
- **Scan Registry:** `/registry:scan {domain}` - See what's included
- **Rollback:** `/evolve:rollback {domain} to-plugin` - Undo packaging

---

## Notes

- Non-destructive: Original domain files unchanged
- Reversible: Can delete plugin directory
- History tracked: Evolution recorded
- Quality enforced: Minimum score required
- Team ready: Complete documentation included

---

**Status:** Ready for Use
**Library:** Backed by EvolveManager.toPlugin() in `.claude/lib/evolve.ts`
