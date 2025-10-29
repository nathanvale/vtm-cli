# MCC Integration Guide

Complete integration documentation for Minimum Composable Core command infrastructure.

## Overview

The MCC consists of three master commands that work together to enable a self-extending system:

1. **`/design:domain`** - Interactive design wizard (asks 5 questions)
2. **`/scaffold:domain`** - Template generator (creates files from design)
3. **`/registry:scan`** - Component discovery (indexes what exists)

## Architecture

```
User Input
    ↓
Command File (design-domain.md, scaffold-domain.md, registry-scan.md)
    ↓
Utilities Library (mcc-utils.sh)
    ↓
Configuration (mcc-config.sh)
    ↓
File System Operations
    ↓
Output & User Feedback
```

## File Structure

```
.claude/
├── commands/
│   ├── design-domain.md         # Design wizard command
│   ├── scaffold-domain.md       # Scaffold generator command
│   └── registry-scan.md         # Registry scanner command
├── lib/
│   ├── mcc-utils.sh            # Shared utilities
│   ├── mcc-config.sh           # Configuration management
│   └── MCC-INTEGRATION.md      # This file
├── templates/
│   └── command.template.md     # Command file template
├── designs/
│   └── {domain}.json           # Design specifications (created by design:domain)
├── registry.json               # Component registry (created by registry:scan)
└── ...                         # Domain directories created by scaffold:domain
```

## Command Execution Flow

### 1. Design Domain Flow

```
/design:domain pm "Project Management"
        ↓
    Parse arguments
        ↓
    Load mcc-utils.sh
        ↓
    Validate domain name
        ↓
    Ask 5 interactive questions:
        Q1: Operations
        Q2: Auto-discovery
        Q3: External systems
        Q4: Automation
        Q5: Sharing scope
        ↓
    Generate JSON design spec
        ↓
    Save to .claude/designs/pm.json
        ↓
    Output summary & next step
        ↓
    Suggest: /scaffold:domain pm
```

**Output:** `.claude/designs/{domain}.json`

### 2. Scaffold Domain Flow

```
/scaffold:domain pm
        ↓
    Parse arguments
        ↓
    Load mcc-utils.sh
        ↓
    Read .claude/designs/pm.json
        ↓
    Validate design spec
        ↓
    Extract design data:
        - Operations list
        - Auto-discovery settings
        - External integration needs
        - Automation requirements
        ↓
    Create directory structure:
        .claude/commands/pm/
        .claude/skills/pm-expert/ (if auto-discovery)
        .claude/mcp-servers/pm-{system}/ (if external)
        .claude/hooks/pm/ (if automation)
        .claude/plugins/pm-automation/
        ↓
    For each operation:
        Generate command file template
        Set up $ARGUMENTS parsing
        Add documentation
        ↓
    Generate skill file (with trigger phrases)
        ↓
    Generate MCP stub (if needed)
        ↓
    Generate hook scripts (if needed)
        ↓
    Generate plugin manifest
        ↓
    Generate plugin README
        ↓
    Output summary
```

**Output:** Complete `.claude/` structure with editable templates

### 3. Registry Scan Flow

```
/registry:scan [filter]
        ↓
    Load mcc-utils.sh
        ↓
    Scan .claude/ recursively:
        • Find all *.md commands
        • Find all SKILL.md files
        • Find all mcp.json files
        • Find all hook scripts
        • Find all *.yaml agents
        • Find all plugin.yaml files
        ↓
    For each component:
        Extract metadata:
        - Name, description, version
        - Dependencies
        - Quality status
        - Tags
        ↓
    Build dependency graph
        ↓
    Detect issues:
        - Missing implementations
        - Unconfigured MCPs
        - Untested components
        ↓
    Generate .claude/registry.json
        ↓
    Output inventory report
        ↓
    Show quality assessment
        ↓
    Suggest next steps
```

**Output:** `.claude/registry.json` + Terminal report

## $ARGUMENTS Handling

### In Command Files

Claude Code provides arguments via the `$ARGUMENTS` array (bash):

```bash
# Access first argument
FIRST="${ARGUMENTS[0]:-default}"

# Access second argument
SECOND="${ARGUMENTS[1]:-}"

# Get number of arguments
COUNT="${#ARGUMENTS[@]}"

# Iterate over arguments
for arg in "${ARGUMENTS[@]}"; do
    echo "$arg"
done
```

### In Generated Command Templates

The scaffold command generates templates with built-in $ARGUMENTS parsing:

```bash
#!/bin/bash

# Parse arguments - provided by Claude Code
FILTER="${ARGUMENTS[0]:-all}"
LIMIT="${ARGUMENTS[1]:-5}"

echo "Using filter: $FILTER, limit: $LIMIT"
```

## Utility Functions (mcc-utils.sh)

All commands source the utilities library for common functions:

### Validation
- `validate_domain_name()` - Check valid domain name
- `validate_json()` - Validate JSON file syntax
- `validate_design_spec()` - Check design spec against schema

### File Operations
- `ensure_directory()` - Create directory if needed
- `file_exists()` - Check if file exists
- `safe_write()` - Write with backup
- `list_files()` - List files in directory

### JSON Operations
- `json_get()` - Extract field from JSON
- `json_set()` - Update field in JSON
- `json_pretty()` - Pretty print JSON

### User Feedback
- `section()` - Print major section
- `subsection()` - Print subsection
- `success()` - Print success message
- `error()` - Print error message
- `warn()` - Print warning message
- `info()` - Print info message
- `item()` - Print bullet point
- `prompt()` - Get user input

### Discovery
- `find_commands()` - Find all commands
- `find_skills()` - Find all skills
- `find_mcps()` - Find all MCP servers
- `find_hooks()` - Find all hooks

### Path Operations
- `abs_path()` - Get absolute path
- `validate_claude_path()` - Check path is in .claude/

### Metadata
- `timestamp()` - ISO8601 timestamp
- `get_version()` - Get version from git
- `get_author()` - Get author name

### Error Handling
- `command_exists()` - Check if command is available
- `require_command()` - Ensure command exists or exit
- `exit_error()` - Exit with error message

## Configuration (mcc-config.sh)

Centralized configuration for all MCC commands:

### Paths
```bash
CLAUDE_DIR=".claude"
DESIGNS_DIR=".claude/designs"
COMMANDS_DIR=".claude/commands"
REGISTRY_FILE=".claude/registry.json"
# ... more paths
```

### Conventions
```bash
DOMAIN_PATTERN="^[a-z][a-z0-9-]*$"
COMMAND_ID_PATTERN="^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$"
```

### Supported Values
```bash
SUPPORTED_HOOKS=(pre-commit post-checkout pre-push)
SUPPORTED_SYSTEMS=(notion airtable jira github slack)
```

### Feature Flags
```bash
FEATURE_AUTO_DISCOVERY=true
FEATURE_EXTERNAL_INTEGRATION=true
FEATURE_AUTOMATION=true
```

### Validation Rules
```bash
DESIGN_REQUIRED_FIELDS=(name description version created_at design)
```

## Design Specification Schema

### Top Level

```json
{
  "name": "string (domain name)",
  "description": "string",
  "version": "semver",
  "created_at": "ISO8601 timestamp",
  "design": { /* see below */ }
}
```

### design.design Object

```json
{
  "operations": [
    {
      "name": "string",
      "description": "string",
      "triggers_auto_discovery": "boolean",
      "manual_invocation": "string (e.g., /pm:next)"
    }
  ],

  "auto_discovery": {
    "enabled": "boolean",
    "type": "skill|none",
    "suggested_triggers": ["string"]
  },

  "external_integration": {
    "needed": "boolean",
    "type": "mcp|none",
    "systems": [
      {
        "name": "string",
        "type": "string"
      }
    ]
  },

  "automation": {
    "enabled": "boolean",
    "hooks": [
      {
        "event": "string (pre-commit, etc)",
        "action": "string"
      }
    ]
  },

  "sharing": {
    "scope": "personal|team|community",
    "team_members": ["string"],
    "published": "boolean"
  },

  "recommendations": {
    "start_with": ["string"],
    "next_steps": ["string"]
  }
}
```

## Registry Specification

### Top Level

```json
{
  "timestamp": "ISO8601",
  "total_components": "number",
  "by_type": {
    "commands": "number",
    "skills": "number",
    "mcp_servers": "number",
    "hooks": "number",
    "agents": "number",
    "plugins": "number"
  },
  "components": [ /* array of components */ ],
  "relationships": { /* dependency map */ },
  "health": {
    "missing_implementations": "number",
    "unused_components": "number",
    "circular_dependencies": "number",
    "quality_issues": ["string"]
  }
}
```

### Component Object

```json
{
  "id": "string (namespace:name or name)",
  "type": "command|skill|mcp|hook|agent|plugin",
  "name": "string",
  "description": "string",
  "version": "semver",
  "location": "string (relative path)",
  "namespace": "string (for commands)",
  "tags": ["string"],
  "dependencies": ["string"],
  "used_by": ["string"],
  "quality": {
    "tested": "boolean",
    "documented": "boolean",
    "security_reviewed": "boolean"
  }
}
```

## Error Handling Patterns

### In Design Command

```bash
# Check required arguments
if [[ -z "$DOMAIN_NAME" ]]; then
    error "Domain name is required"
    exit 1
fi

# Validate input
if ! validate_domain_name "$DOMAIN_NAME"; then
    error "Invalid domain name: $DOMAIN_NAME"
    exit 1
fi

# Check for conflicts
if file_exists "$DESIGN_FILE"; then
    error "Design already exists for $DOMAIN_NAME"
    exit 1
fi
```

### In Scaffold Command

```bash
# Require design to exist
if ! file_exists "$DESIGN_FILE"; then
    error "No design found for $DOMAIN_NAME"
    echo ""
    info "First, run: /design:domain $DOMAIN_NAME"
    exit 1
fi

# Validate design spec
if ! validate_design_spec "$DESIGN_FILE"; then
    error "Invalid design specification"
    exit 1
fi

# Create directories safely
ensure_directory "$COMMANDS_DIR" || exit_error "Failed to create directory"
```

### In Registry Scan

```bash
# Check .claude exists
if ! dir_exists ".claude"; then
    error "No .claude directory found"
    exit 1
fi

# Handle component parsing errors
if ! validate_json "$component_file"; then
    warn "Invalid JSON in $component_file"
    continue
fi
```

## Cross-Platform Compatibility

### Bash Version

Commands use bash 4+ features:

- Arrays (`declare -a`)
- Parameter expansion (`${var:-default}`)
- Command substitution (`$()`)
- String manipulation (`${var//old/new}`)

### Path Handling

All paths use forward slashes (compatible with macOS, Linux, and Windows with bash):

```bash
# Use forward slashes
DESIGN_FILE=".claude/designs/$DOMAIN_NAME.json"

# Not backslashes
# DESIGN_FILE=".claude\designs\$DOMAIN_NAME.json"  # ❌ Wrong
```

### Line Endings

Files use Unix line endings (`\n`), compatible across platforms.

### JSON Processing

Graceful fallback for when `jq` is not available:

```bash
if command -v jq &> /dev/null; then
    jq '.field' file.json
else
    grep '"field"' file.json | sed 's/.*: "\(.*\)".*/\1/'
fi
```

## Testing the Infrastructure

### Test Design Command

```bash
# Create a test domain design
/design:domain test-domain "Test Domain"

# Verify design file was created
ls -la .claude/designs/test-domain.json

# View the design
cat .claude/designs/test-domain.json
```

### Test Scaffold Command

```bash
# Scaffold the test domain
/scaffold:domain test-domain

# Verify structure was created
ls -la .claude/commands/test-domain/
ls -la .claude/skills/test-domain-expert/

# Test a command
/test-domain:next
```

### Test Registry Scan

```bash
# Scan for all components
/registry:scan

# Verify registry file
cat .claude/registry.json

# Filter by domain
/registry:scan test-domain

# Filter by type
/registry:scan commands
```

## Common Workflows

### Design → Scaffold → Scan

```bash
# 1. Design a new domain
/design:domain pm "Project Management"

# Follow the 5 questions

# 2. Scaffold from the design
/scaffold:domain pm

# Customize the generated files

# 3. Scan to verify
/registry:scan pm

# Check that everything appears in registry
```

### Add New Operations to Existing Domain

```bash
# 1. Edit design file
nano .claude/designs/pm.json

# Add more operations to the design

# 2. Re-scaffold (will update files)
/scaffold:domain pm

# 3. Verify changes
/registry:scan pm
```

### Check System Health

```bash
# Full registry with health assessment
/registry:scan

# Check quality issues
/registry:scan | grep "Quality"

# Find untested components
grep -r "tested.*false" .claude/registry.json
```

## Extending MCC

### Adding a New Command Type

1. Create template in `.claude/templates/`
2. Update `scaffold-domain.md` to generate template
3. Update `registry-scan.md` to discover type
4. Update `mcc-config.sh` with patterns and validation

### Adding a New Question to Design Wizard

1. Add question to `design-domain.md` in interactive section
2. Collect user response with `read -r`
3. Validate response
4. Add field to design JSON output

### Adding Custom Validation

Create validation function in `mcc-utils.sh`:

```bash
validate_custom_field() {
    local value="$1"
    # Your validation logic
    [[ "$value" =~ ^pattern$ ]]
}
```

## Troubleshooting

### Commands Not Found

**Problem:** `/design:domain` command not found

**Solution:** Ensure files are in correct location:
```bash
ls -la .claude/commands/design-domain.md
ls -la .claude/commands/scaffold-domain.md
ls -la .claude/commands/registry-scan.md
```

### Utility Load Failed

**Problem:** "Utilities not found" error

**Solution:** Check utilities file exists and is readable:
```bash
ls -la .claude/lib/mcc-utils.sh
cat .claude/lib/mcc-utils.sh | head -20
```

### Invalid JSON Generation

**Problem:** Generated JSON is malformed

**Solution:** Test JSON validity:
```bash
jq . .claude/designs/test.json

# If jq not available, use Python:
python3 -m json.tool .claude/designs/test.json
```

### Design Validation Fails

**Problem:** Design spec validation error

**Solution:** Check required fields:
```bash
cat .claude/designs/pm.json | jq '.name, .description, .version'
```

## Performance Considerations

### Registry Size

With 100+ components, registry.json can be large (~500KB). Keep registry pruned by removing old backups:

```bash
# Cleanup old designs
rm .claude/designs/*.backup.*

# Rebuild registry
/registry:scan
```

### Caching

Enable caching in `mcc-config.sh` for faster operations:

```bash
ENABLE_CACHE=true
CACHE_TTL=3600  # 1 hour
```

### Large Scaffolding

Scaffolding domains with 20+ operations may take time. Run with feedback:

```bash
/scaffold:domain large-domain 2>&1 | tee scaffold.log
```

## Security Considerations

### Design Specifications

Design specs can contain sensitive information. Store in `.gitignore`:

```bash
# .gitignore
.claude/designs/**/*.api-key.json
.claude/designs/**/*.secrets.json
```

### Hook Scripts

Hook scripts run automatically. Audit before enabling:

```bash
# Review hook before running
cat .claude/hooks/pre-commit/*.sh

# Test in dry-run mode first
bash -n .claude/hooks/pre-commit/*.sh
```

### External Integrations

MCP servers may need credentials. Never commit to repo:

```bash
# Set environment variables
export NOTION_API_KEY="your-key"
export NOTION_DATABASE_ID="your-id"

# Don't commit .env files
# .claude/mcp-servers/**/.env  # Add to .gitignore
```

## See Also

- Specification: `SPEC-minimum-composable-core.md`
- Examples: `.claude/designs/` and `.claude/commands/`
- Configuration: `.claude/lib/mcc-config.sh`
- Utilities: `.claude/lib/mcc-utils.sh`
