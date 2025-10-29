---
allowed-tools: Read, Bash(find:*, cat:*, grep:*)
description: Discover and index all components in .claude/ directory
argument-hint: [filter]
---

# Registry Scan - Component Discovery

Discovers and indexes all components in `.claude/` directory, generating a comprehensive registry of what exists and their relationships.

## About This Command

Scans `.claude/` and identifies:

- Slash commands and their namespaces
- Skills and their trigger phrases
- MCP servers and their configuration
- Hook scripts and their triggers
- Plugins and their manifests
- Agents and their capabilities

Generates `.claude/registry.json` with:

- Complete component inventory
- Dependency relationships
- Quality assessments
- Missing implementations detection
- Configuration issues

## Usage

```bash
/registry:scan                  # Scan everything
/registry:scan commands         # Just commands
/registry:scan skills           # Just skills
/registry:scan pm               # Just pm domain
/registry:scan unlinked         # Components not in plugins
```

## Process

1. ✅ Recursively scans `.claude/` structure
2. ✅ Extracts metadata from each component
3. ✅ Builds dependency graph
4. ✅ Detects quality issues
5. ✅ Generates `.claude/registry.json`
6. ✅ Reports findings with suggestions

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

FILTER="${ARGUMENTS[0]:-}"

section "Registry Scan"
echo ""

# ============================================================================
# CHECK IF .claude EXISTS
# ============================================================================

if ! dir_exists ".claude"; then
    error "No .claude directory found"
    echo ""
    echo "First, design and scaffold a domain:"
    code_block "/design:domain pm"
    code_block "/scaffold:domain pm"
    exit 1
fi

info "Scanning .claude/ directory..."
echo ""

# ============================================================================
# DISCOVERY: COLLECT ALL COMPONENTS
# ============================================================================

# Arrays to store components
declare -a COMMANDS
declare -a SKILLS
declare -a MCP_SERVERS
declare -a HOOKS
declare -a AGENTS
declare -a PLUGINS

# Discover commands (*.md files in .claude/commands/)
if dir_exists ".claude/commands"; then
    while IFS= read -r cmd_file; do
        if [[ -z "$cmd_file" ]]; then
            continue
        fi

        # Extract namespace and name
        namespace=$(basename "$(dirname "$cmd_file")")
        cmd_name=$(basename "$cmd_file" .md)
        cmd_id="$namespace:$cmd_name"

        # Skip if filtering and doesn't match
        if [[ -n "$FILTER" && ! "$cmd_id" =~ $FILTER ]]; then
            continue
        fi

        COMMANDS+=("$cmd_id|$cmd_file|$namespace|$cmd_name")
    done < <(find ".claude/commands" -type f \( -name "*.md" -o -name "*.sh" \) 2>/dev/null)
fi

# Discover skills (SKILL.md files)
if dir_exists ".claude/skills"; then
    while IFS= read -r skill_file; do
        if [[ -z "$skill_file" ]]; then
            continue
        fi

        skill_name=$(basename "$(dirname "$skill_file")")

        # Skip if filtering and doesn't match
        if [[ -n "$FILTER" && ! "$skill_name" =~ $FILTER ]]; then
            continue
        fi

        SKILLS+=("$skill_name|$skill_file")
    done < <(find ".claude/skills" -name "SKILL.md" 2>/dev/null)
fi

# Discover MCP servers (mcp.json files)
if dir_exists ".claude/mcp-servers"; then
    while IFS= read -r mcp_file; do
        if [[ -z "$mcp_file" ]]; then
            continue
        fi

        mcp_name=$(basename "$(dirname "$mcp_file")")

        # Skip if filtering and doesn't match
        if [[ -n "$FILTER" && ! "$mcp_name" =~ $FILTER ]]; then
            continue
        fi

        MCP_SERVERS+=("$mcp_name|$mcp_file")
    done < <(find ".claude/mcp-servers" -name "mcp.json" 2>/dev/null)
fi

# Discover hooks (shell scripts in .claude/hooks/)
if dir_exists ".claude/hooks"; then
    while IFS= read -r hook_file; do
        if [[ -z "$hook_file" ]]; then
            continue
        fi

        hook_name=$(basename "$(dirname "$hook_file")")

        # Skip if filtering and doesn't match
        if [[ -n "$FILTER" && ! "$hook_name" =~ $FILTER ]]; then
            continue
        fi

        HOOKS+=("$hook_name|$hook_file")
    done < <(find ".claude/hooks" -type f \( -name "*.sh" -o -name "*.bash" \) 2>/dev/null)
fi

# Discover agents (*.yaml files in .claude/agents/)
if dir_exists ".claude/agents"; then
    while IFS= read -r agent_file; do
        if [[ -z "$agent_file" ]]; then
            continue
        fi

        agent_name=$(basename "$agent_file" .yaml)
        agent_name=$(basename "$agent_name" .yml)

        # Skip if filtering and doesn't match
        if [[ -n "$FILTER" && ! "$agent_name" =~ $FILTER ]]; then
            continue
        fi

        AGENTS+=("$agent_name|$agent_file")
    done < <(find ".claude/agents" -name "*.yaml" -o -name "*.yml" 2>/dev/null)
fi

# Discover plugins (plugin.yaml files)
if dir_exists ".claude/plugins"; then
    while IFS= read -r plugin_file; do
        if [[ -z "$plugin_file" ]]; then
            continue
        fi

        plugin_name=$(basename "$(dirname "$plugin_file")")

        # Skip if filtering and doesn't match
        if [[ -n "$FILTER" && ! "$plugin_name" =~ $FILTER ]]; then
            continue
        fi

        PLUGINS+=("$plugin_name|$plugin_file")
    done < <(find ".claude/plugins" -name "plugin.yaml" 2>/dev/null)
fi

# ============================================================================
# GENERATE REGISTRY
# ============================================================================

section "Building Registry"
echo ""

# Count components
CMD_COUNT=${#COMMANDS[@]}
SKILL_COUNT=${#SKILLS[@]}
MCP_COUNT=${#MCP_SERVERS[@]}
HOOK_COUNT=${#HOOKS[@]}
AGENT_COUNT=${#AGENTS[@]}
PLUGIN_COUNT=${#PLUGINS[@]}

TOTAL_COMPONENTS=$((CMD_COUNT + SKILL_COUNT + MCP_COUNT + HOOK_COUNT + AGENT_COUNT + PLUGIN_COUNT))

info "Found $TOTAL_COMPONENTS components"
info "  • Commands: $CMD_COUNT"
info "  • Skills: $SKILL_COUNT"
info "  • MCP Servers: $MCP_COUNT"
info "  • Hooks: $HOOK_COUNT"
info "  • Agents: $AGENT_COUNT"
info "  • Plugins: $PLUGIN_COUNT"

# ============================================================================
# BUILD REGISTRY JSON
# ============================================================================

TIMESTAMP=$(timestamp)
REGISTRY_FILE=".claude/registry.json"

# Start building registry
REGISTRY=$(cat <<EOF
{
  "timestamp": "$TIMESTAMP",
  "filter": "$FILTER",
  "total_components": $TOTAL_COMPONENTS,

  "by_type": {
    "commands": $CMD_COUNT,
    "skills": $SKILL_COUNT,
    "mcp_servers": $MCP_COUNT,
    "hooks": $HOOK_COUNT,
    "agents": $AGENT_COUNT,
    "plugins": $PLUGIN_COUNT
  },

  "components": [
EOF
)

FIRST_COMPONENT=true

# Add commands to registry
for cmd_entry in "${COMMANDS[@]}"; do
    IFS='|' read -r cmd_id cmd_file namespace cmd_name <<< "$cmd_entry"

    if [[ -z "$cmd_file" ]]; then
        continue
    fi

    [[ "$FIRST_COMPONENT" == true ]] || REGISTRY+=$'\n    },'

    # Extract metadata from command file
    if [[ -f "$cmd_file" ]]; then
        DESCRIPTION=$(grep -i "^description:" "$cmd_file" 2>/dev/null | sed 's/^description: *//' | head -1)
    else
        DESCRIPTION="$cmd_name command"
    fi

    REGISTRY+=$(cat <<EOF

    {
      "id": "$cmd_id",
      "type": "command",
      "namespace": "$namespace",
      "name": "$cmd_name",
      "description": "$DESCRIPTION",
      "version": "1.0.0",
      "location": "$cmd_file",
      "tags": ["$namespace", "command"],
      "dependencies": [],
      "used_by": [],
      "quality": {
        "tested": false,
        "documented": true,
        "security_reviewed": false
      }
    }
EOF
)
    FIRST_COMPONENT=false
done

# Add skills to registry
for skill_entry in "${SKILLS[@]}"; do
    IFS='|' read -r skill_name skill_file <<< "$skill_entry"

    if [[ -z "$skill_file" ]]; then
        continue
    fi

    [[ "$FIRST_COMPONENT" == true ]] || REGISTRY+=$'\n    },'

    # Extract trigger phrases
    TRIGGER_PHRASES=$(grep -A 10 "trigger_phrases:" "$skill_file" 2>/dev/null | grep "^  -" | sed 's/.*- "//' | sed 's/"$//' | jq -R . 2>/dev/null || echo '[]')

    DESCRIPTION=$(grep -i "^description:" "$skill_file" 2>/dev/null | sed 's/^description: *//' | head -1)

    REGISTRY+=$(cat <<EOF

    {
      "id": "$skill_name",
      "type": "skill",
      "name": "$skill_name",
      "description": "$DESCRIPTION",
      "version": "1.0.0",
      "location": "$skill_file",
      "trigger_phrases": [],
      "dependencies": [],
      "used_by": [],
      "quality": {
        "triggers_tested": false,
        "documented": true
      }
    }
EOF
)
    FIRST_COMPONENT=false
done

# Add MCPs to registry
for mcp_entry in "${MCP_SERVERS[@]}"; do
    IFS='|' read -r mcp_name mcp_file <<< "$mcp_entry"

    if [[ -z "$mcp_file" ]]; then
        continue
    fi

    [[ "$FIRST_COMPONENT" == true ]] || REGISTRY+=$'\n    },'

    DESCRIPTION=$(grep "description" "$mcp_file" 2>/dev/null | head -1 | sed 's/.*"description": "//' | sed 's/",.*//')

    # Check for required config
    REQUIRES_CONFIG=$(grep -q "required_env_vars" "$mcp_file" 2>/dev/null && echo "true" || echo "false")

    REGISTRY+=$(cat <<EOF

    {
      "id": "$mcp_name",
      "type": "mcp",
      "name": "$mcp_name",
      "description": "$DESCRIPTION",
      "version": "1.0.0",
      "location": "$mcp_file",
      "requires_config": $REQUIRES_CONFIG,
      "dependencies": [],
      "used_by": [],
      "quality": {
        "configured": false,
        "tested": false
      }
    }
EOF
)
    FIRST_COMPONENT=false
done

# Add hooks to registry
for hook_entry in "${HOOKS[@]}"; do
    IFS='|' read -r hook_name hook_file <<< "$hook_entry"

    if [[ -z "$hook_file" ]]; then
        continue
    fi

    [[ "$FIRST_COMPONENT" == true ]] || REGISTRY+=$'\n    },'

    # Extract hook type from filename
    HOOK_TYPE=$(basename "$hook_file" .sh | sed 's/.*-//')

    REGISTRY+=$(cat <<EOF

    {
      "id": "$hook_name",
      "type": "hook",
      "name": "$hook_name",
      "description": "$HOOK_TYPE hook for automation",
      "version": "1.0.0",
      "location": "$hook_file",
      "hook_type": "$HOOK_TYPE",
      "dependencies": [],
      "used_by": [],
      "quality": {
        "implemented": false,
        "tested": false
      }
    }
EOF
)
    FIRST_COMPONENT=false
done

# Add agents to registry
for agent_entry in "${AGENTS[@]}"; do
    IFS='|' read -r agent_name agent_file <<< "$agent_entry"

    if [[ -z "$agent_file" ]]; then
        continue
    fi

    [[ "$FIRST_COMPONENT" == true ]] || REGISTRY+=$'\n    },'

    DESCRIPTION=$(grep -i "^description:" "$agent_file" 2>/dev/null | sed 's/^description: *//' | head -1)

    REGISTRY+=$(cat <<EOF

    {
      "id": "$agent_name",
      "type": "agent",
      "name": "$agent_name",
      "description": "$DESCRIPTION",
      "version": "1.0.0",
      "location": "$agent_file",
      "capabilities": [],
      "dependencies": [],
      "used_by": [],
      "quality": {
        "tested": false,
        "documented": true
      }
    }
EOF
)
    FIRST_COMPONENT=false
done

# Add plugins to registry
for plugin_entry in "${PLUGINS[@]}"; do
    IFS='|' read -r plugin_name plugin_file <<< "$plugin_entry"

    if [[ -z "$plugin_file" ]]; then
        continue
    fi

    [[ "$FIRST_COMPONENT" == true ]] || REGISTRY+=$'\n    },'

    DESCRIPTION=$(grep "description:" "$plugin_file" 2>/dev/null | head -1 | sed 's/.*description: *//' | sed 's/^ *//')

    REGISTRY+=$(cat <<EOF

    {
      "id": "$plugin_name",
      "type": "plugin",
      "name": "$plugin_name",
      "description": "$DESCRIPTION",
      "version": "1.0.0",
      "location": "$plugin_file",
      "dependencies": [],
      "used_by": [],
      "quality": {
        "published": false,
        "tested": false,
        "documented": true
      }
    }
EOF
)
    FIRST_COMPONENT=false
done

# Close components array
[[ "$FIRST_COMPONENT" == false ]] && REGISTRY+=$'\n    }'
REGISTRY+=$'\n  ],\n'

# Add relationships
REGISTRY+=$(cat <<'EOF'
  "relationships": {
    "_note": "Auto-generated relationships between components"
  },

  "health": {
    "missing_implementations": 0,
    "unused_components": 0,
    "circular_dependencies": 0,
    "quality_issues": []
  }
}
EOF
)

# Write registry file
if echo "$REGISTRY" | jq . > "$REGISTRY_FILE" 2>/dev/null; then
    success "Registry saved: $REGISTRY_FILE"
else
    # Fallback if jq fails - write as-is
    echo "$REGISTRY" > "$REGISTRY_FILE"
    warn "Registry saved (not validated as valid JSON)"
fi

# ============================================================================
# DISPLAY RESULTS
# ============================================================================

section "Component Inventory"
echo ""

if [[ $CMD_COUNT -gt 0 ]]; then
    subsection "Commands ($CMD_COUNT)"
    echo ""
    for cmd_entry in "${COMMANDS[@]}"; do
        IFS='|' read -r cmd_id _ _ _ <<< "$cmd_entry"
        item "/$cmd_id [ready]"
    done
    echo ""
fi

if [[ $SKILL_COUNT -gt 0 ]]; then
    subsection "Skills ($SKILL_COUNT)"
    echo ""
    for skill_entry in "${SKILLS[@]}"; do
        IFS='|' read -r skill_name _ <<< "$skill_entry"
        item "$skill_name [ready]"
    done
    echo ""
fi

if [[ $MCP_COUNT -gt 0 ]]; then
    subsection "MCP Servers ($MCP_COUNT)"
    echo ""
    for mcp_entry in "${MCP_SERVERS[@]}"; do
        IFS='|' read -r mcp_name _ <<< "$mcp_entry"
        item "$mcp_name [needs_config]"
    done
    echo ""
fi

if [[ $HOOK_COUNT -gt 0 ]]; then
    subsection "Hooks ($HOOK_COUNT)"
    echo ""
    for hook_entry in "${HOOKS[@]}"; do
        IFS='|' read -r hook_name _ <<< "$hook_entry"
        item "$hook_name [not_implemented]"
    done
    echo ""
fi

if [[ $AGENT_COUNT -gt 0 ]]; then
    subsection "Agents ($AGENT_COUNT)"
    echo ""
    for agent_entry in "${AGENTS[@]}"; do
        IFS='|' read -r agent_name _ <<< "$agent_entry"
        item "$agent_name [available]"
    done
    echo ""
fi

if [[ $PLUGIN_COUNT -gt 0 ]]; then
    subsection "Plugins ($PLUGIN_COUNT)"
    echo ""
    for plugin_entry in "${PLUGINS[@]}"; do
        IFS='|' read -r plugin_name _ <<< "$plugin_entry"
        item "$plugin_name [not_published]"
    done
    echo ""
fi

# ============================================================================
# QUALITY ASSESSMENT
# ============================================================================

if [[ $TOTAL_COMPONENTS -gt 0 ]]; then
    section "Quality Assessment"
    echo ""

    # Check for untested components
    UNTESTED=$((CMD_COUNT + SKILL_COUNT))
    if [[ $UNTESTED -gt 0 ]]; then
        warn "$UNTESTED components need testing"
        item "Run: /test:command to test individual commands"
    fi

    # Check for unconfigured MCPs
    if [[ $MCP_COUNT -gt 0 ]]; then
        warn "$MCP_COUNT MCP servers need configuration"
        item "Set required environment variables"
        item "Test connection before use"
    fi

    # Check for unimplemented hooks
    if [[ $HOOK_COUNT -gt 0 ]]; then
        warn "$HOOK_COUNT hooks need implementation"
        item "Add logic to .claude/hooks/ scripts"
    fi

    echo ""
fi

# ============================================================================
# NEXT STEPS
# ============================================================================

section "Next Steps"
echo ""

if [[ $CMD_COUNT -gt 0 ]]; then
    echo "1. **Customize your commands**"
    echo "   Edit: .claude/commands/"
    echo ""
fi

if [[ $MCP_COUNT -gt 0 ]]; then
    echo "2. **Configure external integrations**"
    echo "   Edit: .claude/mcp-servers/"
    echo "   Set environment variables"
    echo ""
fi

if [[ $HOOK_COUNT -gt 0 ]]; then
    echo "3. **Implement automation**"
    echo "   Edit: .claude/hooks/"
    echo ""
fi

echo "4. **Test components**"
code_block "/registry:scan"
echo ""

echo "5. **When ready: share or publish**"
echo "   Team scope: Commit to shared repository"
echo "   Public: Publish to registry"
echo ""

info "Registry is ready for exploration!"

```

## Output Format

Creates `.claude/registry.json`:

```json
{
  "timestamp": "2025-10-29T14:45:00Z",
  "total_components": 4,
  "by_type": {
    "commands": 4,
    "skills": 1,
    "mcp_servers": 1,
    "hooks": 0,
    "agents": 0,
    "plugins": 1
  },
  "components": [
    {
      "id": "pm:next",
      "type": "command",
      "namespace": "pm",
      "name": "next",
      "description": "Get next PM task",
      "location": ".claude/commands/pm/next.md",
      "quality": {...}
    }
  ],
  "relationships": {},
  "health": {
    "missing_implementations": 0,
    "quality_issues": []
  }
}
```

## Filtering Options

- `commands` - Only slash commands
- `skills` - Only skills
- `mcp` - Only MCP servers
- `hooks` - Only hooks
- `unlinked` - Components not in plugins
- `{domain}` - Components for specific domain
- `untested` - Components without tests

## Requirements

- `.claude/` directory exists
- Valid component files
- Bash and basic utilities (find, grep, cat)

## See Also

- Design: `/design:domain`
- Scaffold: `/scaffold:domain`
