# MCC Infrastructure - File Index

Complete file manifest for Minimum Composable Core Phase 1 implementation.

## Quick Navigation

### For Users

- Start here: [MCC-QUICKSTART.md](./MCC-QUICKSTART.md) (5-minute guide)
- Commands guide: [commands/README.md](./commands/README.md)
- Full specification: [SPEC-minimum-composable-core.md](./SPEC-minimum-composable-core.md)

### For Developers

- Integration guide: [lib/MCC-INTEGRATION.md](./lib/MCC-INTEGRATION.md)
- Infrastructure summary: [MCC-INFRASTRUCTURE-SUMMARY.md](./MCC-INFRASTRUCTURE-SUMMARY.md)
- Configuration reference: [lib/mcc-config.sh](./lib/mcc-config.sh)
- Utilities reference: [lib/mcc-utils.sh](./lib/mcc-utils.sh)

---

## Master Commands (3 files - ~2,000 lines)

### 1. `/design:domain` Command

**File:** `commands/design-domain.md` (507 lines)

Interactive design wizard that asks 5 questions:

1. What operations should this domain have?
2. Should Claude auto-suggest commands?
3. Need external integrations (MCP)?
4. Any automation hooks?
5. Who will use this (personal/team/public)?

**Creates:** `.claude/designs/{domain}.json`

**How to use:**

```bash
/design:domain pm "Project Management"
/design:domain devops
/design:domain testing "Test Automation"
```

### 2. `/scaffold:domain` Command

**File:** `commands/scaffold-domain.md` (840 lines)

Generates complete working structure from a design:

- Slash command templates (with $ARGUMENTS parsing)
- Skill files (with auto-discovery trigger phrases)
- MCP stubs (for external integrations)
- Hook scripts (for automation)
- Plugin manifests (for team sharing)
- Plugin README files

**Creates:** `.claude/commands/{domain}/`, `.claude/skills/`, `.claude/mcp-servers/`, `.claude/hooks/`, `.claude/plugins/`

**How to use:**

```bash
/scaffold:domain pm
/scaffold:domain devops
/scaffold:domain testing
```

### 3. `/registry:scan` Command

**File:** `commands/registry-scan.md` (706 lines)

Discovers and indexes all components in `.claude/`:

- Finds all commands, skills, MCPs, hooks, agents, plugins
- Extracts metadata and relationships
- Detects quality issues
- Builds dependency graph
- Generates comprehensive registry

**Creates:** `.claude/registry.json`

**How to use:**

```bash
/registry:scan                  # Scan everything
/registry:scan pm               # Just pm domain
/registry:scan commands         # Just commands
/registry:scan unlinked         # Components not in plugins
```

---

## Utility Libraries (2 files - ~940 lines)

### 4. Core Utilities

**File:** `lib/mcc-utils.sh` (599 lines)

Shared functions used by all commands:

**Validation Functions:**

- `validate_domain_name()` - Check valid domain
- `validate_json()` - Validate JSON files
- `validate_design_spec()` - Check design against schema

**File Operations:**

- `ensure_directory()` - Create dirs safely
- `file_exists()` - Check file existence
- `safe_write()` - Write with backup
- `dir_exists()` - Check directory existence
- `count_files()` - Count files in directory

**JSON Operations:**

- `json_get()` - Extract field from JSON
- `json_set()` - Update JSON field
- `json_pretty()` - Pretty print JSON

**User Feedback:**

- `section()` - Print major section
- `subsection()` - Print subsection
- `success()` - Success message (✅)
- `error()` - Error message (❌)
- `warn()` - Warning message (⚠️)
- `info()` - Info message (ℹ️)
- `item()` - Bullet point
- `prompt()` - Get user input
- `code_block()` - Format code example

**Discovery Functions:**

- `find_commands()` - Find all commands
- `find_skills()` - Find all skills
- `find_mcps()` - Find all MCP servers
- `find_hooks()` - Find all hooks
- `count_components()` - Count by type

**Path Operations:**

- `abs_path()` - Get absolute path
- `rel_path()` - Get relative path
- `validate_claude_path()` - Check path in .claude/

**Metadata:**

- `timestamp()` - ISO8601 timestamp
- `get_version()` - Version from git
- `get_author()` - Author name

**Error Handling:**

- `command_exists()` - Check command available
- `require_command()` - Ensure command or exit
- `exit_error()` - Exit with error

---

### 5. Configuration Module

**File:** `lib/mcc-config.sh` (339 lines)

Centralized configuration:

**Path Definitions:**

- `CLAUDE_DIR`, `DESIGNS_DIR`, `COMMANDS_DIR`
- `SKILLS_DIR`, `MCP_DIR`, `HOOKS_DIR`, `AGENTS_DIR`, `PLUGINS_DIR`
- `REGISTRY_FILE`, `LIB_DIR`, `TEMPLATES_DIR`

**Naming Patterns:**

- `DOMAIN_PATTERN` - Domain name validation
- `COMMAND_ID_PATTERN` - Command ID format
- `COMMAND_PATTERN`, `SKILL_PATTERN`, etc.

**Supported Values:**

- `SUPPORTED_SYSTEMS` - notion, airtable, jira, github, slack, firebase, supabase, mongodb
- `SUPPORTED_HOOKS` - pre-commit, post-checkout, pre-push

**Feature Flags:**

- `FEATURE_AUTO_DISCOVERY` - true/false
- `FEATURE_EXTERNAL_INTEGRATION` - true/false
- `FEATURE_AUTOMATION` - true/false
- `FEATURE_TEAM_SHARING` - true/false

**Validation Rules:**

- Required fields for designs
- Required fields for design specs
- Quality gates and thresholds

**Output Formatting:**

- Emoji indicators (✅, ❌, ⚠️, ℹ️, etc.)
- Color codes (green, red, yellow, blue, cyan)
- Verbosity levels (silent, errors, warnings, info, debug)

**Helper Functions:**

- `get_config()` - Read config value
- `feature_enabled()` - Check feature flag
- `is_valid_domain_name()` - Validate domain
- `is_valid_command_id()` - Validate command ID
- `is_supported_system()` - Check external system
- `is_supported_hook()` - Check hook type

---

## Documentation (5 files - ~2,500 lines)

### 6. Quick Start Guide

**File:** `MCC-QUICKSTART.md` (300+ lines)

5-minute getting started guide:

- Your first domain (step-by-step)
- Next steps and customization
- Common tasks
- Understanding the workflow
- Tips & tricks
- Troubleshooting
- Getting help

**Read this first!**

---

### 7. Integration Guide

**File:** `lib/MCC-INTEGRATION.md` (700+ lines)

Detailed reference for developers:

- Architecture overview
- File structure
- Command execution flows
- Utility functions reference
- Configuration details
- Data format schemas
- Error handling patterns
- Cross-platform compatibility
- Common workflows
- Troubleshooting guide
- Performance considerations
- Security considerations
- Extension guidelines

**Read when implementing features.**

---

### 8. Commands Guide

**File:** `commands/README.md` (400+ lines)

Complete guide to all three commands:

- Overview of each command
- Quick start workflow
- Detailed file guide
- Utility modules reference
- Template documentation
- Data formats
- Architecture explanation
- Usage examples
- Common issues and fixes
- Integration points
- Extension guidelines

**Reference while using commands.**

---

### 9. Full Specification

**File:** `SPEC-minimum-composable-core.md` (1,100+ lines)

Complete MCC specification:

- Overview and purpose
- Each command detailed:
  - Purpose
  - Parameters
  - Process flow
  - Output format
  - User examples
- Data formats
  - Design spec schema
  - Registry schema
- Error handling
- Success criteria
- Testing strategy
- Deployment phases
- Implementation notes

**The canonical reference.**

---

### 10. Infrastructure Summary

**File:** `MCC-INFRASTRUCTURE-SUMMARY.md` (400+ lines)

Project completion summary:

- Deliverables checklist
- Technical details
- File manifest
- Code statistics
- Quality metrics
- Integration testing checklist
- Known limitations
- Success criteria
- How to use
- Conclusion

**Verify completeness with this.**

---

## Templates (1+ files)

### 11. Command Template

**File:** `templates/command.template.md`

Template for generated command files:

- Frontmatter structure
- Usage documentation
- $ARGUMENTS parsing
- Implementation placeholder
- Next steps

Used by `/scaffold:domain` to generate command files.

---

## Data Files (Examples)

### 12. Example Design Specification

**File:** `designs/example-pm.json`

Complete example domain design:

```json
{
  "name": "example-pm",
  "description": "Example Project Management domain",
  "version": "1.0.0",
  "created_at": "2025-10-29...",
  "design": {
    "operations": [
      {"name": "next", ...},
      {"name": "review", ...},
      {"name": "context", ...},
      {"name": "list", ...}
    ],
    "auto_discovery": {...},
    "external_integration": {...},
    "automation": {...},
    "sharing": {...},
    "recommendations": {...}
  }
}
```

Shows what a complete design looks like.

---

## Directory Structure

```
.claude/
├── MCC-INDEX.md                     # This file
├── MCC-QUICKSTART.md               # Quick start (5 min)
├── MCC-INFRASTRUCTURE-SUMMARY.md   # Project completion
├── SPEC-minimum-composable-core.md # Full specification
│
├── commands/                         # Master commands
│   ├── README.md                    # Commands guide
│   ├── design-domain.md             # Design wizard (507 lines)
│   ├── scaffold-domain.md           # Scaffold generator (840 lines)
│   ├── registry-scan.md             # Registry scanner (706 lines)
│   └── create-command.md            # (existing)
│
├── lib/                             # Core libraries
│   ├── MCC-INTEGRATION.md           # Integration guide (700+ lines)
│   ├── mcc-utils.sh                 # Shared utilities (599 lines)
│   └── mcc-config.sh                # Configuration (339 lines)
│
├── templates/                        # File templates
│   └── command.template.md          # Command template
│
├── designs/                         # Design specs (created by /design:domain)
│   └── example-pm.json              # Example design
│
├── registry.json                    # Generated by /registry:scan
│
└── ...                              # User-created domain directories
    ├── commands/{domain}/           # User commands
    ├── skills/{domain}-expert/      # User skills
    ├── mcp-servers/                 # External integrations
    ├── hooks/                       # Automation hooks
    └── plugins/                     # Shareable plugins
```

---

## File Statistics

| File                            | Lines      | Purpose               |
| ------------------------------- | ---------- | --------------------- |
| design-domain.md                | 507        | Design wizard command |
| scaffold-domain.md              | 840        | Scaffold generator    |
| registry-scan.md                | 706        | Registry scanner      |
| mcc-utils.sh                    | 599        | Core utilities        |
| mcc-config.sh                   | 339        | Configuration         |
| MCC-QUICKSTART.md               | ~300       | Quick start guide     |
| lib/MCC-INTEGRATION.md          | ~700       | Integration guide     |
| commands/README.md              | ~400       | Commands guide        |
| SPEC-minimum-composable-core.md | ~1100      | Full specification    |
| MCC-INFRASTRUCTURE-SUMMARY.md   | ~400       | Project summary       |
| **Total**                       | **~5,900** | **Production + Docs** |

---

## Getting Started

### For New Users (5 minutes)

1. Read: [MCC-QUICKSTART.md](./MCC-QUICKSTART.md)
2. Run: `/design:domain pm`
3. Run: `/scaffold:domain pm`
4. Run: `/registry:scan`

### For Developers (1 hour)

1. Read: [lib/MCC-INTEGRATION.md](./lib/MCC-INTEGRATION.md)
2. Review: [SPEC-minimum-composable-core.md](./SPEC-minimum-composable-core.md)
3. Study: [lib/mcc-utils.sh](./lib/mcc-utils.sh)
4. Review: [lib/mcc-config.sh](./lib/mcc-config.sh)

### For Integration Testing

1. See: [MCC-INFRASTRUCTURE-SUMMARY.md](./MCC-INFRASTRUCTURE-SUMMARY.md) - "Integration Testing Checklist"
2. Test each command
3. Verify files created
4. Test error cases

---

## Key Concepts

### Domain

A namespace for related operations. Examples: `pm` (project management), `testing`, `deploy`.

Example command structure: `/{domain}:{operation}`

```bash
/pm:next
/pm:review
/pm:context
/pm:list
```

### Design Specification

JSON file defining what a domain should include:

- What operations it provides
- Whether it has auto-discovery
- External integrations needed
- Automation hooks
- Sharing scope
- Next steps

File: `.claude/designs/{domain}.json`

### Scaffold

Process of generating all files from a design specification.

Generates:

- Command templates
- Skill definitions
- MCP stubs
- Hook scripts
- Plugin manifests

### Registry

Index of all components in `.claude/`:

- What exists
- What depends on what
- Quality status
- Next steps

File: `.claude/registry.json`

---

## Common Tasks

### Create a new domain

```bash
/design:domain mydom "My Domain"
/scaffold:domain mydom
```

### See what you have

```bash
/registry:scan
```

### Find components for one domain

```bash
/registry:scan mydom
```

### View a design

```bash
cat .claude/designs/mydom.json
```

### Update a design

```bash
nano .claude/designs/mydom.json
/scaffold:domain mydom  # Re-scaffold
```

---

## Support & Help

### Questions about workflow?

→ Read [MCC-QUICKSTART.md](./MCC-QUICKSTART.md)

### How do I customize?

→ Read [commands/README.md](./commands/README.md)

### How does it work internally?

→ Read [lib/MCC-INTEGRATION.md](./lib/MCC-INTEGRATION.md)

### What can I build with this?

→ Read [SPEC-minimum-composable-core.md](./SPEC-minimum-composable-core.md)

### How do I extend it?

→ See "Extending MCC" in [lib/MCC-INTEGRATION.md](./lib/MCC-INTEGRATION.md)

---

## Summary

The MCC infrastructure provides:

✅ Three powerful slash commands
✅ ~940 lines of tested utility code
✅ ~2,500 lines of comprehensive documentation
✅ Example files demonstrating real usage
✅ Cross-platform compatibility
✅ Extensible architecture
✅ Self-documenting code

**Status:** Ready for Phase 1 integration and user testing.

**Next:** Start with [MCC-QUICKSTART.md](./MCC-QUICKSTART.md)!

---

_Created: 2025-10-29 | Version: 1.0.0 | Status: Complete_
