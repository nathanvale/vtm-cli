---
allowed-tools: Write, Read, Bash(mkdir:*, test:*, cat:*, find:*, chmod:*)
description: Auto-generate complete .claude/ structure from a design specification
argument-hint: { domain-name }
---

# Scaffold Domain - Code Generator

Auto-generates complete `.claude/` directory structure and files based on a design specification.

## About This Command

Takes your design from `/design:domain` and generates:

- Slash commands (editable templates)
- Skills (with auto-discovery triggers)
- MCP stubs (for external integrations)
- Hook scripts (for automation)
- Plugin manifests (for team sharing)

## Usage

```bash
/scaffold:domain pm
/scaffold:domain devops
/scaffold:domain testing
```

## Process

1. ✅ Reads `.claude/designs/{domain}.json`
2. ✅ Validates the design spec
3. ✅ Generates command files (with $ARGUMENTS handling)
4. ✅ Creates skill files (with trigger phrases)
5. ✅ Generates MCP stubs (with configuration)
6. ✅ Creates hook scripts (with examples)
7. ✅ Builds plugin manifest
8. ✅ Reports what was created

## Implementation

```bash
#!/bin/bash
set -e

# Load utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UTILS_FILE="$SCRIPT_DIR/../lib/mcc-utils.sh"

if [[ ! -f "$UTILS_FILE" ]]; then
    echo "❌ Error: Utilities not found at $UTILS_FILE"
    exit 1
fi

# shellcheck source=/dev/null
source "$UTILS_FILE"

# ============================================================================
# PARSE ARGUMENTS
# ============================================================================

DOMAIN_NAME="${ARGUMENTS[0]:-}"

if [[ -z "$DOMAIN_NAME" ]]; then
    section "Scaffold Domain"
    echo ""
    error "Domain name is required"
    echo ""
    echo "Usage: /scaffold:domain {domain-name}"
    echo ""
    echo "First, design a domain:"
    code_block "/design:domain pm"
    echo ""
    echo "Then scaffold it:"
    code_block "/scaffold:domain pm"
    exit 1
fi

# ============================================================================
# LOAD DESIGN SPECIFICATION
# ============================================================================

section "Scaffold Domain: $DOMAIN_NAME"
echo ""

DESIGN_FILE=".claude/designs/$DOMAIN_NAME.json"

if ! file_exists "$DESIGN_FILE"; then
    error "No design found for '$DOMAIN_NAME'"
    echo ""
    echo "First, create a design:"
    code_block "/design:domain $DOMAIN_NAME"
    exit 1
fi

if ! validate_design_spec "$DESIGN_FILE"; then
    error "Invalid design specification: $DESIGN_FILE"
    exit 1
fi

success "Loading design: $DESIGN_FILE"

# ============================================================================
# EXTRACT DESIGN DATA
# ============================================================================

DESCRIPTION=$(json_get "$DESIGN_FILE" ".description")
VERSION=$(json_get "$DESIGN_FILE" ".version")
CREATED_AT=$(json_get "$DESIGN_FILE" ".created_at")

# Extract operations
OPERATIONS_COUNT=$(jq '.design.operations | length' "$DESIGN_FILE" 2>/dev/null || echo 0)

# Extract flags
AUTO_DISCOVERY_ENABLED=$(jq '.design.auto_discovery.enabled' "$DESIGN_FILE" 2>/dev/null || echo false)
EXTERNAL_NEEDED=$(jq '.design.external_integration.needed' "$DESIGN_FILE" 2>/dev/null || echo false)
EXTERNAL_SYSTEM=$(jq -r '.design.external_integration.systems[0].name' "$DESIGN_FILE" 2>/dev/null || echo "")
AUTOMATION_ENABLED=$(jq '.design.automation.enabled' "$DESIGN_FILE" 2>/dev/null || echo false)
SHARING_SCOPE=$(jq -r '.design.sharing.scope' "$DESIGN_FILE" 2>/dev/null || echo "personal")

info "Scaffolding $OPERATIONS_COUNT operations from design"

# ============================================================================
# CREATE DIRECTORY STRUCTURE
# ============================================================================

section "Creating Directory Structure"
echo ""

COMMANDS_DIR=".claude/commands/$DOMAIN_NAME"
ensure_directory "$COMMANDS_DIR" || exit_error "Failed to create commands directory"
success "Created: $COMMANDS_DIR/"

if [[ "$AUTO_DISCOVERY_ENABLED" == "true" ]]; then
    SKILLS_DIR=".claude/skills/$DOMAIN_NAME-expert"
    ensure_directory "$SKILLS_DIR" || exit_error "Failed to create skills directory"
    success "Created: $SKILLS_DIR/"
fi

if [[ "$EXTERNAL_NEEDED" == "true" && -n "$EXTERNAL_SYSTEM" ]]; then
    MCP_DIR=".claude/mcp-servers/$DOMAIN_NAME-$EXTERNAL_SYSTEM"
    ensure_directory "$MCP_DIR" || exit_error "Failed to create MCP directory"
    success "Created: $MCP_DIR/"
fi

if [[ "$AUTOMATION_ENABLED" == "true" ]]; then
    HOOKS_DIR=".claude/hooks/$DOMAIN_NAME"
    ensure_directory "$HOOKS_DIR" || exit_error "Failed to create hooks directory"
    success "Created: $HOOKS_DIR/"
fi

PLUGINS_DIR=".claude/plugins/$DOMAIN_NAME-automation"
ensure_directory "$PLUGINS_DIR" || exit_error "Failed to create plugins directory"
success "Created: $PLUGINS_DIR/"

# ============================================================================
# GENERATE COMMAND FILES
# ============================================================================

section "Generating Command Templates"
echo ""

# Get operation names
OPERATION_NAMES=$(jq -r '.design.operations[].name' "$DESIGN_FILE" 2>/dev/null)

OPERATION_COUNT=0
while IFS= read -r OP_NAME; do
    if [[ -z "$OP_NAME" ]]; then
        continue
    fi

    OPERATION_COUNT=$((OPERATION_COUNT + 1))

    COMMAND_FILE="$COMMANDS_DIR/$OP_NAME.md"

    COMMAND_TEMPLATE=$(cat <<'EOFCMD'
---
allowed-tools: Bash(cat:*, echo:*)
description: {DESCRIPTION}
argument-hint: [filter] [limit]
---

# {DOMAIN_DISPLAY}: {OPERATION_DISPLAY}

{DESCRIPTION}

## Usage

\`\`\`bash
/{DOMAIN}:{OPERATION} [filter] [limit]
\`\`\`

## Parameters

- `filter` (optional): Filter or search term
- `limit` (optional): Maximum results (default: 5)

## Examples

\`\`\`bash
/{DOMAIN}:{OPERATION}
/{DOMAIN}:{OPERATION} active
/{DOMAIN}:{OPERATION} active 10
\`\`\`

## Implementation

This is a template. Customize with your specific logic:

\`\`\`bash
#!/bin/bash

# Parse arguments - use $ARGUMENTS array provided by Claude Code
FILTER="\${ARGUMENTS[0]:-all}"
LIMIT="\${ARGUMENTS[1]:-5}"

echo "🔍 Getting {OPERATION} from {DOMAIN} (filter: \$FILTER, limit: \$LIMIT)"
echo ""

# TODO: Add your implementation here
# Examples:
#   • Query your database (Notion, Airtable, etc.)
#   • Call an API endpoint
#   • Read local files
#   • Process data and format output

echo "💡 Customize this command:"
echo "   1. Connect to your data source"
echo "   2. Implement filtering logic"
echo "   3. Add status indicators"
echo "   4. Format output for readability"
echo ""
echo "Link to other commands:"
echo "   • Before: /{DOMAIN}:context before using this"
echo "   • After: Suggest /{DOMAIN}:review after"
\`\`\`

## Next Steps

1. **Implement the command**
   - Replace the echo statements with actual logic
   - Connect to your data source
   - Test locally

2. **Link to other operations**
   - Cross-reference other /{DOMAIN}: commands
   - Add suggestions for user workflow

3. **Test and verify**
   - Run: /{DOMAIN}:{OPERATION}
   - Check output format

4. **When satisfied**
   - Run: /registry:scan
   - Check command appears in registry

## Tips

- Use \`$ARGUMENTS\` to access parameters
- Parse arguments early (see examples above)
- Add color/formatting for better UX
- Include helpful error messages
- Document any external dependencies
EOFCMD
)

    # Replace placeholders
    OP_DISPLAY=$(echo "$OP_NAME" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
    DOMAIN_DISPLAY=$(echo "$DOMAIN_NAME" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
    OP_DESC="$OP_NAME operation for $DOMAIN_NAME"

    COMMAND_TEMPLATE="${COMMAND_TEMPLATE//\{OPERATION\}/$OP_NAME}"
    COMMAND_TEMPLATE="${COMMAND_TEMPLATE//\{DOMAIN\}/$DOMAIN_NAME}"
    COMMAND_TEMPLATE="${COMMAND_TEMPLATE//\{OPERATION_DISPLAY\}/$OP_DISPLAY}"
    COMMAND_TEMPLATE="${COMMAND_TEMPLATE//\{DOMAIN_DISPLAY\}/$DOMAIN_DISPLAY}"
    COMMAND_TEMPLATE="${COMMAND_TEMPLATE//\{DESCRIPTION\}/$OP_DESC}"

    echo "$COMMAND_TEMPLATE" > "$COMMAND_FILE"
    success "Created: $COMMAND_FILE"

done <<< "$OPERATION_NAMES"

info "$OPERATION_COUNT command files generated"

# ============================================================================
# GENERATE SKILL FILE
# ============================================================================

if [[ "$AUTO_DISCOVERY_ENABLED" == "true" ]]; then
    section "Generating Skill Template"
    echo ""

    SKILL_FILE="$SKILLS_DIR/SKILL.md"

    # Get trigger phrases
    TRIGGER_PHRASES=$(jq -r '.design.auto_discovery.suggested_triggers[]' "$DESIGN_FILE" 2>/dev/null | sed 's/^/      - "/' | sed 's/$/"/')

    SKILL_TEMPLATE=$(cat <<'EOFSKILL'
---
name: {DOMAIN}-expert
description: |
  {DOMAIN_DISPLAY} domain expert.

  Knows about:
  - {OPERATIONS_LIST}

  Use when:
  - User asks about {DOMAIN} operations
  - Context needed before starting work
  - Reviewing {DOMAIN} status
  - Managing {DOMAIN} workflow

trigger_phrases:
{TRIGGER_PHRASES}
---

# {DOMAIN_DISPLAY} Expert Skill

## What This Skill Does

Helps you manage your {DOMAIN} workflow with smart command suggestions.

## Available Commands

{COMMAND_LIST}

## When Claude Uses This

When you mention things like:
{TRIGGER_EXAMPLES}

## Best Practices

1. **Before starting**: Run the relevant command to get context
2. **Understand scope**: Check dependencies and impacts
3. **Track progress**: Review status regularly
4. **Keep updated**: Maintain data in your system

## Customization

Edit the trigger phrases in the frontmatter above to match your vocabulary.
Keep the skill description updated as you evolve the domain.

## Integration

Works seamlessly with other Claude Code domains:
- Can be invoked manually: /{DOMAIN}:operation
- Auto-triggered by Claude based on conversation
- Works with other skills and commands
EOFSKILL
)

    # Build operations list and command list
    OPS_LIST=""
    CMD_LIST=""
    TRIGGER_EXAMP=""

    OPERATION_NUM=0
    while IFS= read -r OP_NAME; do
        if [[ -z "$OP_NAME" ]]; then
            continue
        fi

        OPERATION_NUM=$((OPERATION_NUM + 1))
        OP_DISPLAY=$(echo "$OP_NAME" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')

        if [[ -z "$OPS_LIST" ]]; then
            OPS_LIST="- $OP_DISPLAY"
        else
            OPS_LIST="$OPS_LIST, $OP_DISPLAY"
        fi

        CMD_LIST="$CMD_LIST\n- \`/$DOMAIN_NAME:$OP_NAME\` - $OP_DISPLAY"

        if [[ $OPERATION_NUM -le 3 ]]; then
            TRIGGER_EXAMP="$TRIGGER_EXAMP\n- \"I need $OP_NAME\" → Suggests \`/$DOMAIN_NAME:$OP_NAME\`"
        fi
    done <<< "$OPERATION_NAMES"

    SKILL_TEMPLATE="${SKILL_TEMPLATE//\{DOMAIN\}/$DOMAIN_NAME}"
    SKILL_TEMPLATE="${SKILL_TEMPLATE//\{DOMAIN_DISPLAY\}/$DOMAIN_DISPLAY}"
    SKILL_TEMPLATE="${SKILL_TEMPLATE//\{OPERATIONS_LIST\}/$OPS_LIST}"
    SKILL_TEMPLATE="${SKILL_TEMPLATE//\{COMMAND_LIST\}/$CMD_LIST}"
    SKILL_TEMPLATE="${SKILL_TEMPLATE//\{TRIGGER_PHRASES\}/$TRIGGER_PHRASES}"
    SKILL_TEMPLATE="${SKILL_TEMPLATE//\{TRIGGER_EXAMPLES\}/$TRIGGER_EXAMP}"

    echo -e "$SKILL_TEMPLATE" > "$SKILL_FILE"
    success "Created: $SKILL_FILE"
fi

# ============================================================================
# GENERATE MCP STUB
# ============================================================================

if [[ "$EXTERNAL_NEEDED" == "true" && -n "$EXTERNAL_SYSTEM" ]]; then
    section "Generating MCP Configuration Stub"
    echo ""

    MCP_FILE="$MCP_DIR/mcp.json"

    MCP_TEMPLATE=$(cat <<'EOFMCP'
{
  "name": "{DOMAIN}-{SYSTEM}",
  "type": "mcp",
  "description": "{SYSTEM} integration for {DOMAIN} domain",
  "version": "1.0.0",

  "connection": {
    "type": "api",
    "service": "{SYSTEM}",
    "auth_type": "bearer_token"
  },

  "configuration": {
    "api_key": "\${API_KEY}",
    "endpoint": "https://api.{SYSTEM}.com/v1"
  },

  "operations": {
    "read": {
      "queries": [
        "list_items",
        "get_item_details",
        "filter_by_status"
      ]
    },
    "write": {
      "mutations": [
        "update_item_status",
        "create_item",
        "delete_item"
      ]
    }
  },

  "setup": {
    "required_env_vars": [
      "API_KEY"
    ],
    "instructions": "Configure your {SYSTEM} credentials in environment variables"
  }
}
EOFMCP
)

    MCP_TEMPLATE="${MCP_TEMPLATE//\{DOMAIN\}/$DOMAIN_NAME}"
    MCP_TEMPLATE="${MCP_TEMPLATE//\{SYSTEM\}/$EXTERNAL_SYSTEM}"

    echo "$MCP_TEMPLATE" | jq . > "$MCP_FILE" 2>/dev/null || {
        echo "$MCP_TEMPLATE" > "$MCP_FILE"
    }

    success "Created: $MCP_FILE"
    info "Configure environment variables and test connection"
fi

# ============================================================================
# GENERATE HOOK SCRIPTS
# ============================================================================

if [[ "$AUTOMATION_ENABLED" == "true" ]]; then
    section "Generating Hook Scripts"
    echo ""

    HOOKS=$(jq -r '.design.automation.hooks[].event' "$DESIGN_FILE" 2>/dev/null)

    while IFS= read -r HOOK_EVENT; do
        if [[ -z "$HOOK_EVENT" ]]; then
            continue
        fi

        HOOK_FILE="$HOOKS_DIR/${DOMAIN_NAME}-${HOOK_EVENT}.sh"

        HOOK_TEMPLATE=$(cat <<'EOFHOOK'
#!/bin/bash
# {DOMAIN} - {HOOK_EVENT} hook
# Executes {ACTION} on {HOOK_EVENT}

set -e

{HOOK_BODY}

exit 0
EOFHOOK
)

        # Customize based on hook type
        case "$HOOK_EVENT" in
            pre-commit)
                HOOK_BODY="# Validate {DOMAIN} before commit
COMMIT_MSG=\$(cat \"\$1\")

# Check if commit message references domain
if ! echo \"\$COMMIT_MSG\" | grep -qE \"\\[{DOMAIN_UPPER}\\]\"; then
    echo \"⚠️  Consider linking this commit to {DOMAIN}\"
    echo \"Format: [{DOMAIN_UPPER}] Your commit message\"
fi

exit 0"
                ;;
            post-checkout)
                HOOK_BODY="# Update {DOMAIN} data on branch switch
echo \"ℹ️  {DOMAIN} checkout hook running...\"
# TODO: Add logic to refresh {DOMAIN} data when switching branches"
                ;;
            *)
                HOOK_BODY="# {DOMAIN} {HOOK_EVENT} hook
# TODO: Implement your {HOOK_EVENT} logic here"
                ;;
        esac

        DOMAIN_UPPER=$(echo "$DOMAIN_NAME" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
        HOOK_ACTION="validate_$DOMAIN_NAME"

        HOOK_TEMPLATE="${HOOK_TEMPLATE//\{DOMAIN\}/$DOMAIN_NAME}"
        HOOK_TEMPLATE="${HOOK_TEMPLATE//\{DOMAIN_UPPER\}/$DOMAIN_UPPER}"
        HOOK_TEMPLATE="${HOOK_TEMPLATE//\{HOOK_EVENT\}/$HOOK_EVENT}"
        HOOK_TEMPLATE="${HOOK_TEMPLATE//\{ACTION\}/$HOOK_ACTION}"
        HOOK_TEMPLATE="${HOOK_TEMPLATE//\{HOOK_BODY\}/$HOOK_BODY}"

        echo "$HOOK_TEMPLATE" > "$HOOK_FILE"
        chmod +x "$HOOK_FILE"
        success "Created: $HOOK_FILE"
    done <<< "$HOOKS"
fi

# ============================================================================
# GENERATE PLUGIN MANIFEST
# ============================================================================

section "Generating Plugin Manifest"
echo ""

PLUGIN_FILE="$PLUGINS_DIR/plugin.yaml"

PLUGIN_TEMPLATE=$(cat <<'EOFPLUGIN'
name: {DOMAIN}-automation
version: 1.0.0
description: {DESCRIPTION}

components:
  commands:
    - path: ../../commands/{DOMAIN}/
      namespace: {DOMAIN}
      count: {OP_COUNT}

  skills:
    {SKILLS_SECTION}

  mcp_servers:
    {MCP_SECTION}

  hooks:
    {HOOKS_SECTION}

metadata:
  author: user
  created_at: "{CREATED_AT}"
  domain_name: {DOMAIN}
  sharing_scope: {SHARING_SCOPE}
  team_members: []

  tags:
    - {DOMAIN}
    - automation
    - workflow

  quality:
    test_status: untested
    documentation_complete: false

  dependencies: []

marketplace:
  published: false
  registry: internal
EOFPLUGIN
)

# Build sections based on features
SKILLS_SECTION="- name: {DOMAIN}-expert
    path: ../../skills/{DOMAIN}-expert/SKILL.md
    enabled: true"

MCP_SECTION="[]"
if [[ "$EXTERNAL_NEEDED" == "true" && -n "$EXTERNAL_SYSTEM" ]]; then
    MCP_SECTION="- name: {DOMAIN}-$EXTERNAL_SYSTEM
    path: ../../mcp-servers/{DOMAIN}-$EXTERNAL_SYSTEM/
    enabled: false
    requires_config: true"
fi

HOOKS_SECTION="[]"
if [[ "$AUTOMATION_ENABLED" == "true" ]]; then
    HOOKS_SECTION="- enabled: true
    path: ../../hooks/{DOMAIN}/"
fi

[[ "$AUTO_DISCOVERY_ENABLED" != "true" ]] && SKILLS_SECTION="[]"

PLUGIN_TEMPLATE="${PLUGIN_TEMPLATE//\{DOMAIN\}/$DOMAIN_NAME}"
PLUGIN_TEMPLATE="${PLUGIN_TEMPLATE//\{DESCRIPTION\}/$DESCRIPTION}"
PLUGIN_TEMPLATE="${PLUGIN_TEMPLATE//\{OP_COUNT\}/$OPERATION_COUNT}"
PLUGIN_TEMPLATE="${PLUGIN_TEMPLATE//\{CREATED_AT\}/$CREATED_AT}"
PLUGIN_TEMPLATE="${PLUGIN_TEMPLATE//\{SHARING_SCOPE\}/$SHARING_SCOPE}"
PLUGIN_TEMPLATE="${PLUGIN_TEMPLATE//\{SKILLS_SECTION\}/$SKILLS_SECTION}"
PLUGIN_TEMPLATE="${PLUGIN_TEMPLATE//\{MCP_SECTION\}/$MCP_SECTION}"
PLUGIN_TEMPLATE="${PLUGIN_TEMPLATE//\{HOOKS_SECTION\}/$HOOKS_SECTION}"

echo "$PLUGIN_TEMPLATE" > "$PLUGIN_FILE"
success "Created: $PLUGIN_FILE"

# ============================================================================
# GENERATE PLUGIN README
# ============================================================================

README_FILE="$PLUGINS_DIR/README.md"

README_TEMPLATE=$(cat <<'EOFREADME'
# {DOMAIN_DISPLAY} Automation Plugin

{DESCRIPTION}

**Version:** 1.0.0 | **Scope:** {SHARING_SCOPE}

## Quick Start

Commands are now available:

{COMMAND_USAGE}

## Setup

1. **Review the commands**
```

Open: .claude/commands/{DOMAIN}/
Each command has a template you can customize

````

2. **Implement the commands**
- Replace TODO sections with actual logic
- Connect to your data sources
- Test each command

3. **Enable features (optional)**
{SETUP_STEPS}

4. **Verify everything works**
```bash
/registry:scan {DOMAIN}
````

## What's Included

{FEATURES}

## Customization

Edit these files to customize:

- **Commands:** `.claude/commands/{DOMAIN}/*.md`
  - Change how data is fetched
  - Customize output format
  - Add filters and options

- **Skill:** `.claude/skills/{DOMAIN}-expert/SKILL.md`
  - Edit trigger phrases to match your vocabulary
  - Update description as you evolve

{OPTIONAL_CUSTOMIZATION}

## Next Steps

1. **Test the commands**

   ```bash
   /{DOMAIN}:next
   ```

2. **Enable auto-discovery** (if not already)
   - Skill is configured with trigger phrases
   - Try saying "what should I work on?"

3. **Add more commands** (if needed)
   - Design: `/design:domain {DOMAIN}`
   - Scaffold additions: `/scaffold:domain {DOMAIN}`

4. **Share with team** (if scope is "team")
   - Commit to shared repository
   - Team members can use immediately

## Support

- Issues with commands? Check `.claude/commands/{DOMAIN}/`
- Need external data? Configure MCP in `.claude/mcp-servers/`
- Hook problems? Check `.claude/hooks/{DOMAIN}/`

## See Also

- Registry: `/registry:scan`
- Design: `.claude/designs/{DOMAIN}.json`
  EOFREADME
  )

# Build command usage

CMD_USAGE=""
while IFS= read -r OP_NAME; do
if [[-z "$OP_NAME"]]; then
continue
fi
OP_DISPLAY=$(echo "$OP_NAME" | sed 's/-/ /g' | sed 's/\b\(.\)/\u\1/g')
CMD_USAGE="$CMD_USAGE\n\`/$DOMAIN_NAME:$OP_NAME\` - $OP_DISPLAY"
done <<< "$OPERATION_NAMES"

# Build setup steps

SETUP_STEPS=""
[["$EXTERNAL_NEEDED" == "true" && -n "$EXTERNAL_SYSTEM"]] && \
 SETUP_STEPS="$SETUP_STEPS\n   - MCP: Configure .claude/mcp-servers/$DOMAIN_NAME-$EXTERNAL_SYSTEM/"
[[ "$AUTOMATION_ENABLED" == "true" ]] && \
 SETUP_STEPS="$SETUP_STEPS\n   - Hooks: Review .claude/hooks/$DOMAIN_NAME/"

# Build features

FEATURES="- \`/$DOMAIN_NAME:\` commands ($OPERATION_COUNT total)"
[["$AUTO_DISCOVERY_ENABLED" == "true"]] && FEATURES="$FEATURES\n- Auto-discovery skill with trigger phrases"
[[ "$EXTERNAL_NEEDED" == "true" && -n "$EXTERNAL_SYSTEM" ]] && FEATURES="$FEATURES\n- $EXTERNAL_SYSTEM integration stub (MCP)"
[[ "$AUTOMATION_ENABLED" == "true" ]] && FEATURES="$FEATURES\n- Hook scripts for automation"

# Build optional customization

OPT_CUSTOM=""
[["$EXTERNAL_NEEDED" == "true" && -n "$EXTERNAL_SYSTEM"]] && \
 OPT_CUSTOM="$OPT_CUSTOM\n- **MCP:** \`.claude/mcp-servers/$DOMAIN_NAME-$EXTERNAL_SYSTEM/mcp.json\`\n  - Add your API credentials\n  - Configure endpoints"
[[ "$AUTOMATION_ENABLED" == "true" ]] && \
 OPT_CUSTOM="$OPT_CUSTOM\n- **Hooks:** \`.claude/hooks/$DOMAIN_NAME/\*.sh\`\n - Implement hook logic\n - Test hook execution"

README_TEMPLATE="${README_TEMPLATE//\{DOMAIN\}/$DOMAIN_NAME}"
README_TEMPLATE="${README_TEMPLATE//\{DOMAIN_DISPLAY\}/$DOMAIN_DISPLAY}"
README_TEMPLATE="${README_TEMPLATE//\{DESCRIPTION\}/$DESCRIPTION}"
README_TEMPLATE="${README_TEMPLATE//\{SHARING_SCOPE\}/$SHARING_SCOPE}"
README_TEMPLATE="${README_TEMPLATE//\{COMMAND_USAGE\}/$CMD_USAGE}"
README_TEMPLATE="${README_TEMPLATE//\{SETUP_STEPS\}/$SETUP_STEPS}"
README_TEMPLATE="${README_TEMPLATE//\{FEATURES\}/$FEATURES}"
README_TEMPLATE="${README_TEMPLATE//\{OPTIONAL_CUSTOMIZATION\}/$OPT_CUSTOM}"

echo -e "$README_TEMPLATE" > "$README_FILE"
success "Created: $README_FILE"

# ============================================================================

# SUMMARY

# ============================================================================

section "Scaffold Complete ✅"
echo ""
echo "Successfully generated $DOMAIN_NAME domain!"
echo ""

subsection "Files Created"
echo ""
success "$OPERATION_COUNT command files in $COMMANDS_DIR/"
[[ "$AUTO_DISCOVERY_ENABLED" == "true" ]] && success "Skill in $SKILLS_DIR/"
[[ "$EXTERNAL_NEEDED" == "true" && -n "$EXTERNAL_SYSTEM" ]] && success "MCP stub in $MCP_DIR/"
[[ "$AUTOMATION_ENABLED" == "true" ]] && success "Hook scripts in $HOOKS_DIR/"
success "Plugin manifest in $PLUGINS_DIR/"

echo ""
subsection "Summary"
echo ""
item "$OPERATION_COUNT slash commands"
[[ "$AUTO_DISCOVERY_ENABLED" == "true" ]] && item "1 skill for auto-discovery"
[["$EXTERNAL_NEEDED" == "true" && -n "$EXTERNAL_SYSTEM"]] && item "MCP stub for $EXTERNAL_SYSTEM"
[[ "$AUTOMATION_ENABLED" == "true" ]] && item "Automation hooks"
item "Plugin ready for team sharing"

# ============================================================================

# NEXT STEPS

# ============================================================================

echo ""
section "Next Steps"
echo ""

echo "1. **Customize the commands**"
code_block "cd .claude/commands/$DOMAIN_NAME && ls"
echo ""

echo "2. **Test a command**"
code_block "/$DOMAIN_NAME:${OPERATION_NAMES%% \*}"
echo ""

echo "3. **Verify with registry**"
code_block "/registry:scan $DOMAIN_NAME"
echo ""

if [["$EXTERNAL_NEEDED" == "true" && -n "$EXTERNAL_SYSTEM"]]; then
echo "4. **Set up external integration**"
echo " Configure .claude/mcp-servers/$DOMAIN_NAME-$EXTERNAL_SYSTEM/"
echo ""
echo "5. **Then test again**"
code_block "/registry:scan $DOMAIN_NAME"
echo ""
fi

echo "💡 All files are editable templates - customize to your needs!"
echo ""
info "Ready to build with your new domain!"

```

## Output Summary

Creates complete plugin directory with:

```

.claude/
├── commands/{domain}/
│ ├── operation1.md
│ ├── operation2.md
│ └── ...
├── skills/{domain}-expert/
│ └── SKILL.md (if auto-discovery enabled)
├── mcp-servers/{domain}-{system}/
│ └── mcp.json (if external integration needed)
├── hooks/{domain}/
│ └── event-name.sh (if automation enabled)
└── plugins/{domain}-automation/
├── plugin.yaml
└── README.md

````

## Requirements

- Design file must exist: `.claude/designs/{domain}.json`
- Valid design specification
- jq or Python for JSON processing
- Bash for file operations

## Next Command

After scaffolding, verify everything:

```bash
/registry:scan {domain}
````
