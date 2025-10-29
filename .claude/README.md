# Claude Code MCC - Commands Infrastructure

Master command infrastructure for the Minimum Composable Core (MCC).

## Overview

Three powerful slash commands that enable a self-extending system:

1. **`design-domain.md`** - Interactive design wizard
2. **`scaffold-domain.md`** - Template code generator
3. **`registry-scan.md`** - Component discovery & health

These commands work together to let you:

- Design new domains through interactive Q&A
- Generate complete working structures automatically
- Understand what exists and how it all connects
- Extend the system for new needs

## Quick Start

### Design a domain

```bash
/design:domain pm "Project Management"
```

Answers 5 questions to capture your vision:

- What operations do you need?
- Should Claude auto-suggest commands?
- Need external integrations?
- Any automation (hooks)?
- Who uses this?

**Output:** `.claude/designs/pm.json`

### Generate the structure

```bash
/scaffold:domain pm
```

Creates complete working structure:

- 4 slash commands (templates ready to customize)
- 1 Skill (for auto-discovery)
- 1 MCP stub (if external integration needed)
- Hook scripts (if automation needed)
- Plugin manifest (for team sharing)

**Output:** Editable `.claude/` directory structure

### Verify everything

```bash
/registry:scan
```

Shows what you've created:

- All components discovered
- Dependencies mapped
- Quality issues identified
- Next steps suggested

**Output:** `.claude/registry.json` + terminal report

## File Guide

### Design Domain Command

**File:** `design-domain.md`

**Purpose:** Interactive design wizard

**Usage:**

```bash
/design:domain {domain-name} [description]
```

**What it does:**

1. Validates domain name
2. Asks 5 interactive questions
3. Generates design JSON spec
4. Saves to `.claude/designs/{domain}.json`
5. Suggests next step

**Key features:**

- User-friendly Q&A format
- Sensible defaults
- Clear next-step guidance
- Error messages with fixes

### Scaffold Domain Command

**File:** `scaffold-domain.md`

**Purpose:** Auto-generates files from design

**Usage:**

```bash
/scaffold:domain {domain-name}
```

**What it does:**

1. Reads design specification
2. Validates design is complete
3. Creates directory structure
4. Generates command templates
5. Creates skill file (if auto-discovery)
6. Generates MCP stub (if integration needed)
7. Creates hook scripts (if automation)
8. Builds plugin manifest

**Key features:**

- Templates ready to customize
- Proper `$ARGUMENTS` handling
- Editable and extensible
- Clear documentation in files

### Registry Scan Command

**File:** `registry-scan.md`

**Purpose:** Discover and index components

**Usage:**

```bash
/registry:scan [filter]
```

**What it does:**

1. Recursively scans `.claude/`
2. Extracts metadata from components
3. Builds dependency graph
4. Detects quality issues
5. Generates `.claude/registry.json`
6. Reports findings

**Key features:**

- Finds all component types
- Quality assessment
- Dependency relationships
- Clear reporting

## Utility Modules

### mcc-utils.sh

Shared utility functions used by all commands.

**Location:** `.claude/lib/mcc-utils.sh`

**What it provides:**

- Validation functions (domain names, JSON, specs)
- File operations (safe writes, directory creation)
- JSON operations (get/set fields)
- User feedback (sections, status, prompts)
- Discovery functions (find commands, skills, etc.)
- Error handling patterns
- Path management

**Sourced by all commands:**

```bash
source "$(dirname "$0")/../lib/mcc-utils.sh"
```

**Key functions:**

```bash
validate_domain_name "$domain"
validate_json "$file"
ensure_directory "$dir"
section "Title"
success "Message"
error "Message"
find_commands
find_skills
```

### mcc-config.sh

Centralized configuration and constants.

**Location:** `.claude/lib/mcc-config.sh`

**What it provides:**

- Path definitions
- Naming conventions and patterns
- Supported values (systems, hooks)
- Feature flags
- Default values
- Validation rules
- Output formatting

**Used for:**

- Consistent paths across all commands
- Validation patterns
- Supported integrations
- Quality gates
- Customization options

**Key exports:**

```bash
CLAUDE_DIR, DESIGNS_DIR, COMMANDS_DIR
MCC_VERSION, MCC_SPEC_VERSION
DOMAIN_PATTERN, COMMAND_ID_PATTERN
SUPPORTED_SYSTEMS, SUPPORTED_HOOKS
JSON_TOOL, VERBOSITY
```

## Template Files

Located in `.claude/templates/`

### command.template.md

Template for generated command files.

**Used by:** scaffold-domain **Replaced with:** Actual operation names and
descriptions **Contains:**

- Proper frontmatter
- $ARGUMENTS parsing example
- Documentation
- Implementation placeholder
- Next steps

## Data Files

### Design Specifications

**Location:** `.claude/designs/{domain}.json`

**Created by:** `design-domain.md`

**Read by:** `scaffold-domain.md`

**Format:**

```json
{
  "name": "string",
  "description": "string",
  "version": "semver",
  "created_at": "ISO8601",
  "design": {
    "operations": [...],
    "auto_discovery": {...},
    "external_integration": {...},
    "automation": {...},
    "sharing": {...},
    "recommendations": {...}
  }
}
```

**Used for:**

- Source of truth for domain design
- Input to scaffold command
- Reference for implementation

### Registry

**Location:** `.claude/registry.json`

**Created by:** `registry-scan.md`

**Format:**

```json
{
  "timestamp": "ISO8601",
  "total_components": 42,
  "by_type": {...},
  "components": [...],
  "relationships": {...},
  "health": {...}
}
```

**Used for:**

- Component discovery
- Dependency mapping
- Quality assessment
- System understanding

## Architecture

### Command Execution Flow

All three commands follow similar patterns:

```
1. Parse Arguments
   ↓
2. Load Utilities (mcc-utils.sh)
   ↓
3. Validate Inputs
   ↓
4. Load Configuration (mcc-config.sh)
   ↓
5. Process
   ↓
6. Generate Output
   ↓
7. Report Results & Next Steps
```

### Error Handling

Consistent error patterns across all commands:

```bash
# Required arguments
if [[ -z "$DOMAIN_NAME" ]]; then
    error "Domain name required"
    echo "Usage: /design:domain {name}"
    exit 1
fi

# Validation
if ! validate_domain_name "$DOMAIN_NAME"; then
    error "Invalid domain name: $DOMAIN_NAME"
    exit 1
fi

# File operations
ensure_directory "$dir" || exit_error "Failed to create directory"

# Graceful degradation
if command -v jq &> /dev/null; then
    use_jq
else
    use_python_fallback
fi
```

### Argument Handling

All generated commands use `$ARGUMENTS` array:

```bash
# From Claude Code
/{DOMAIN}:{OPERATION} arg1 arg2

# Received as
ARGUMENTS[0]="arg1"
ARGUMENTS[1]="arg2"

# Parsed in command
FIRST="${ARGUMENTS[0]:-default}"
SECOND="${ARGUMENTS[1]:-}"
```

## Directory Structure

```
.claude/
├── commands/
│   ├── README.md (this file)
│   ├── design-domain.md
│   ├── scaffold-domain.md
│   ├── registry-scan.md
│   └── {domain}/
│       ├── operation1.md (generated)
│       ├── operation2.md (generated)
│       └── ...
├── designs/
│   ├── example-pm.json
│   └── {domain}.json (generated)
├── lib/
│   ├── mcc-utils.sh
│   ├── mcc-config.sh
│   ├── MCC-INTEGRATION.md
│   └── README.md
├── templates/
│   └── command.template.md
├── skills/
│   └── {domain}-expert/ (generated)
├── mcp-servers/
│   └── {domain}-{system}/ (generated)
├── hooks/
│   └── {domain}/ (generated)
├── plugins/
│   └── {domain}-automation/ (generated)
├── MCC-QUICKSTART.md
├── registry.json (generated)
└── ...
```

## Usage Examples

### Basic Workflow

```bash
# 1. Design
/design:domain pm "Project Management"
# Answer 5 questions interactively

# 2. Scaffold
/scaffold:domain pm
# Files are generated

# 3. Verify
/registry:scan pm
# Check health and dependencies
```

### Advanced Workflows

```bash
# Update a design
nano .claude/designs/pm.json
/scaffold:domain pm  # Re-scaffold with changes

# Check system health
/registry:scan

# Filter by domain
/registry:scan pm

# Filter by type
/registry:scan commands
/registry:scan skills

# Look for issues
/registry:scan | grep "Quality"
```

## Common Issues & Fixes

### Command Not Found

**Problem:** `/design:domain` command not found

**Solution:**

```bash
# Check files exist
ls -la .claude/commands/design-domain.md
ls -la .claude/commands/scaffold-domain.md
ls -la .claude/commands/registry-scan.md
```

### Utilities Not Loading

**Problem:** "Utilities not found" error

**Solution:**

```bash
# Check utils file
ls -la .claude/lib/mcc-utils.sh

# Check permissions
chmod +x .claude/lib/mcc-utils.sh
```

### Invalid Domain Name

**Problem:** "Invalid domain name" error

**Rules:**

- Start with lowercase letter
- Lowercase letters, numbers, hyphens only
- No spaces or special characters

**Valid:** pm, task-manager, testing **Invalid:** PM, task manager, task_manager

### Design Validation Fails

**Problem:** "Invalid design spec" error

**Solution:**

```bash
# Check required fields
cat .claude/designs/pm.json | jq '.name, .description, .version, .created_at'

# Validate JSON
python3 -m json.tool .claude/designs/pm.json
```

### Scaffold Not Creating Files

**Problem:** Scaffold command runs but no files created

**Solution:**

```bash
# Check design exists
ls -la .claude/designs/pm.json

# Check design is valid
/registry:scan  # Should show error if invalid
```

## Integration Points

### Design → Scaffold

- Design creates `.claude/designs/{domain}.json`
- Scaffold reads and validates this file
- Scaffold uses design to determine what to generate

### Scaffold → Registry

- Scaffold creates physical files in `.claude/`
- Registry scans these files
- Registry discovers operations, skills, MCPs, etc.

### All Commands ← Utilities

- All commands source `mcc-utils.sh`
- Common functions ensure consistency
- Error handling patterns match across commands

## Extending MCC

### Add a New Command Type

1. Create template in `.claude/templates/`
2. Update `scaffold-domain.md` to generate it
3. Update `registry-scan.md` to discover it
4. Update `mcc-config.sh` with validation rules

### Add a New Design Question

1. Edit `design-domain.md` in the Q&A section
2. Collect response with `read -r`
3. Add field to design JSON output
4. Update scaffold to use new field

### Add Custom Validation

Create function in `mcc-utils.sh`:

```bash
validate_custom_thing() {
    local value="$1"
    [[ "$value" =~ ^pattern$ ]]
}
```

## Documentation

### Quick Start

See: `.claude/MCC-QUICKSTART.md`

### Detailed Integration Guide

See: `.claude/lib/MCC-INTEGRATION.md`

### Full Specification

See: `.claude/SPEC-minimum-composable-core.md`

## Testing

### Test Design Command

```bash
/design:domain test-domain "Test"
ls -la .claude/designs/test-domain.json
```

### Test Scaffold Command

```bash
/scaffold:domain test-domain
ls -la .claude/commands/test-domain/
```

### Test Registry Scan

```bash
/registry:scan test-domain
cat .claude/registry.json
```

## Performance

### Large Domains

Scaffolding domains with 20+ operations:

```bash
# Run with feedback
/scaffold:domain large-domain 2>&1 | tee scaffold.log
```

### Registry Size

Keep registry lean by cleaning old backups:

```bash
# Remove backups older than 30 days
find .claude -name "*.backup.*" -mtime +30 -delete
```

## See Also

- Quick Start: `.claude/MCC-QUICKSTART.md`
- Integration: `.claude/lib/MCC-INTEGRATION.md`
- Specification: `.claude/SPEC-minimum-composable-core.md`
- Configuration: `.claude/lib/mcc-config.sh`
- Utilities: `.claude/lib/mcc-utils.sh`
