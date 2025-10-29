#!/bin/bash
# ============================================================================
# MCC Configuration Module
# ============================================================================
# Configuration management for Minimum Composable Core
# Handles paths, environment, and settings
# ============================================================================

# ============================================================================
# PATHS
# ============================================================================

# Base directories
CLAUDE_DIR=".claude"
DESIGNS_DIR="$CLAUDE_DIR/designs"
COMMANDS_DIR="$CLAUDE_DIR/commands"
SKILLS_DIR="$CLAUDE_DIR/skills"
MCP_DIR="$CLAUDE_DIR/mcp-servers"
HOOKS_DIR="$CLAUDE_DIR/hooks"
AGENTS_DIR="$CLAUDE_DIR/agents"
PLUGINS_DIR="$CLAUDE_DIR/plugins"
REGISTRY_FILE="$CLAUDE_DIR/registry.json"
LIB_DIR="$CLAUDE_DIR/lib"
TEMPLATES_DIR="$CLAUDE_DIR/templates"

# ============================================================================
# CONVENTIONS
# ============================================================================

# Domain naming
DOMAIN_PATTERN="^[a-z][a-z0-9-]*$"
DOMAIN_MIN_LENGTH=2
DOMAIN_MAX_LENGTH=32

# Component naming
COMMAND_PATTERN="^[a-z][a-z0-9-]*$"
SKILL_PATTERN="^[a-z][a-z0-9-]*-expert$"
MCP_PATTERN="^[a-z][a-z0-9-]*$"
HOOK_PATTERN="^[a-z][a-z0-9-]*\.sh$"
PLUGIN_PATTERN="^[a-z][a-z0-9-]*-automation$"

# Namespace format: /{namespace}:{operation}
COMMAND_ID_PATTERN="^[a-z][a-z0-9-]*:[a-z][a-z0-9-]*$"

# ============================================================================
# VERSION
# ============================================================================

MCC_VERSION="1.0.0"
MCC_SPEC_VERSION="1.0-draft"

# ============================================================================
# FEATURE FLAGS
# ============================================================================

# Enable/disable features
FEATURE_AUTO_DISCOVERY="${FEATURE_AUTO_DISCOVERY:-true}"
FEATURE_EXTERNAL_INTEGRATION="${FEATURE_EXTERNAL_INTEGRATION:-true}"
FEATURE_AUTOMATION="${FEATURE_AUTOMATION:-true}"
FEATURE_TEAM_SHARING="${FEATURE_TEAM_SHARING:-true}"
FEATURE_PLUGIN_PUBLISHING="${FEATURE_PLUGIN_PUBLISHING:-false}"

# ============================================================================
# DEFAULTS
# ============================================================================

# Default values for design questions
DEFAULT_OPERATIONS="next,review,context,list"
DEFAULT_AUTO_DISCOVERY="true"
DEFAULT_EXTERNAL_INTEGRATION="false"
DEFAULT_AUTOMATION="false"
DEFAULT_SHARING_SCOPE="personal"

# Default hook types
SUPPORTED_HOOKS=(
    "pre-commit"
    "post-checkout"
    "pre-push"
)

# Default external systems
SUPPORTED_SYSTEMS=(
    "notion"
    "airtable"
    "jira"
    "github"
    "slack"
    "firebase"
    "supabase"
    "mongodb"
)

# ============================================================================
# VALIDATION RULES
# ============================================================================

# JSON schema validation enabled
VALIDATE_JSON="${VALIDATE_JSON:-true}"

# Design spec required fields
DESIGN_REQUIRED_FIELDS=(
    "name"
    "description"
    "version"
    "created_at"
    "design"
)

# Design.design required fields
DESIGN_DESIGN_REQUIRED_FIELDS=(
    "operations"
    "auto_discovery"
    "external_integration"
    "automation"
    "sharing"
    "recommendations"
)

# ============================================================================
# QUALITY GATES
# ============================================================================

# Require tests for publishing
QUALITY_REQUIRE_TESTS="${QUALITY_REQUIRE_TESTS:-true}"

# Require documentation
QUALITY_REQUIRE_DOCS="${QUALITY_REQUIRE_DOCS:-true}"

# Require security review for plugins
QUALITY_REQUIRE_SECURITY_REVIEW="${QUALITY_REQUIRE_SECURITY_REVIEW:-false}"

# ============================================================================
# OUTPUT FORMATTING
# ============================================================================

# Emoji indicators
EMOJI_SUCCESS="✅"
EMOJI_ERROR="❌"
EMOJI_WARN="⚠️ "
EMOJI_INFO="ℹ️ "
EMOJI_STAR="⭐"
EMOJI_GEAR="⚙️ "
EMOJI_BOX="📦"
EMOJI_CHART="📊"
EMOJI_DOCUMENT="📄"
EMOJI_FOLDER="📁"
EMOJI_CHECKMARK="✓"
EMOJI_CROSS="✗"

# Color codes
COLOR_GREEN='\033[0;32m'
COLOR_RED='\033[0;31m'
COLOR_YELLOW='\033[1;33m'
COLOR_BLUE='\033[0;34m'
COLOR_CYAN='\033[0;36m'
COLOR_RESET='\033[0m'

# Verbosity level (0=silent, 1=errors, 2=warnings, 3=info, 4=debug)
VERBOSITY="${VERBOSITY:-3}"

# ============================================================================
# LOGGING
# ============================================================================

# Log file location
LOG_DIR="${LOG_DIR:-.claude/logs}"
LOG_FILE="${LOG_DIR}/mcc.log"
LOG_LEVEL="${LOG_LEVEL:-info}"

# ============================================================================
# PERFORMANCE
# ============================================================================

# Cache control
ENABLE_CACHE="${ENABLE_CACHE:-true}"
CACHE_TTL="${CACHE_TTL:-3600}"  # 1 hour in seconds
CACHE_DIR=".claude/.cache"

# File operation timeouts
FILE_OPERATION_TIMEOUT="${FILE_OPERATION_TIMEOUT:-30}"

# JSON processing tool preference (jq or python)
JSON_TOOL="${JSON_TOOL:-auto}"  # auto, jq, python

# ============================================================================
# TEMPLATES
# ============================================================================

# Template locations and defaults
TEMPLATE_COMMAND_PATH="$TEMPLATES_DIR/command.template.md"
TEMPLATE_SKILL_PATH="$TEMPLATES_DIR/skill.template.md"
TEMPLATE_MCP_PATH="$TEMPLATES_DIR/mcp.template.json"
TEMPLATE_HOOK_PATH="$TEMPLATES_DIR/hook.template.sh"
TEMPLATE_PLUGIN_PATH="$TEMPLATES_DIR/plugin.template.yaml"
TEMPLATE_README_PATH="$TEMPLATES_DIR/plugin-readme.template.md"

# ============================================================================
# INTEGRATION SETTINGS
# ============================================================================

# Registry update strategy
REGISTRY_AUTO_UPDATE="${REGISTRY_AUTO_UPDATE:-true}"
REGISTRY_BACKUP="${REGISTRY_BACKUP:-true}"

# Backup retention (days)
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"

# Git integration (auto-commit changes)
GIT_AUTO_COMMIT="${GIT_AUTO_COMMIT:-false}"
GIT_COMMIT_PREFIX="[MCC]"

# ============================================================================
# ERROR HANDLING
# ============================================================================

# Exit on error
set -o errtrace
set -o pipefail

# Error recovery mode (try/catch-like behavior)
ERROR_RECOVERY="${ERROR_RECOVERY:-true}"

# Create error report on crash
CREATE_ERROR_REPORT="${CREATE_ERROR_REPORT:-true}"

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

# Get configured value
get_config() {
    local key="$1"
    local default="${2:-}"
    
    # Check environment variable first
    local env_var="MCC_$(echo "$key" | tr '[:lower:]' '[:upper:]')"
    if [[ -n "${!env_var}" ]]; then
        echo "${!env_var}"
        return 0
    fi
    
    # Fall back to script variable
    if [[ -n "${!key}" ]]; then
        echo "${!key}"
        return 0
    fi
    
    # Use default
    echo "$default"
}

# Check if feature is enabled
feature_enabled() {
    local feature="$1"
    local var="FEATURE_$(echo "$feature" | tr '[:lower:]' '[:upper:]')"
    
    local value="${!var:-false}"
    [[ "$value" == "true" ]]
}

# Get template path
get_template() {
    local template_type="$1"
    local var="TEMPLATE_$(echo "$template_type" | tr '[:lower:]' '[:upper:]')_PATH"
    
    echo "${!var:-}"
}

# Validate domain name
is_valid_domain_name() {
    local domain="$1"
    
    [[ ${#domain} -ge $DOMAIN_MIN_LENGTH ]] && \
    [[ ${#domain} -le $DOMAIN_MAX_LENGTH ]] && \
    [[ "$domain" =~ $DOMAIN_PATTERN ]]
}

# Validate command ID format
is_valid_command_id() {
    local cmd_id="$1"
    [[ "$cmd_id" =~ $COMMAND_ID_PATTERN ]]
}

# Check if external system is supported
is_supported_system() {
    local system="$1"
    printf '%s\n' "${SUPPORTED_SYSTEMS[@]}" | grep -q "^$system$"
}

# Check if hook type is supported
is_supported_hook() {
    local hook="$1"
    printf '%s\n' "${SUPPORTED_HOOKS[@]}" | grep -q "^$hook$"
}

# ============================================================================
# INITIALIZATION
# ============================================================================

# Initialize configuration
init_config() {
    # Ensure log directory exists
    if [[ -n "$LOG_DIR" && "$LOG_DIR" != "false" ]]; then
        mkdir -p "$LOG_DIR" 2>/dev/null || true
    fi
    
    # Ensure cache directory exists
    if [[ "$ENABLE_CACHE" == "true" ]]; then
        mkdir -p "$CACHE_DIR" 2>/dev/null || true
    fi
    
    # Determine JSON tool to use
    if [[ "$JSON_TOOL" == "auto" ]]; then
        if command -v jq &> /dev/null; then
            JSON_TOOL="jq"
        elif command -v python3 &> /dev/null; then
            JSON_TOOL="python"
        else
            JSON_TOOL="none"
        fi
    fi
}

# ============================================================================
# EXPORT CONFIGURATION
# ============================================================================

export CLAUDE_DIR DESIGNS_DIR COMMANDS_DIR SKILLS_DIR
export MCP_DIR HOOKS_DIR AGENTS_DIR PLUGINS_DIR REGISTRY_FILE
export LIB_DIR TEMPLATES_DIR

export MCC_VERSION MCC_SPEC_VERSION
export DOMAIN_PATTERN COMMAND_ID_PATTERN
export JSON_TOOL VERBOSITY LOG_LEVEL

# Initialize on load
init_config

true
