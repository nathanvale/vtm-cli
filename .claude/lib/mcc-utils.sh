#!/bin/bash
# ============================================================================
# MCC Utility Functions - Shared infrastructure for Minimum Composable Core
# ============================================================================
# Provides common functions for design:domain, scaffold:domain, registry:scan
# Source this file in all MCC commands: source "$(dirname "$0")/../lib/mcc-utils.sh"
# ============================================================================

set -o pipefail

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Status indicators
CHECK="✅"
ERROR="❌"
WARN="⚠️ "
INFO="ℹ️ "
ARROW="→"
BULLET="•"

# ============================================================================
# VALIDATION FUNCTIONS
# ============================================================================

# Validate domain name (alphanumeric + hyphens, starts with letter)
validate_domain_name() {
    local domain="$1"
    
    # Must not be empty
    if [[ -z "$domain" ]]; then
        return 1
    fi
    
    # Must start with lowercase letter
    if ! [[ "$domain" =~ ^[a-z] ]]; then
        return 1
    fi
    
    # Must contain only lowercase letters, numbers, hyphens
    if ! [[ "$domain" =~ ^[a-z0-9-]+$ ]]; then
        return 1
    fi
    
    # Must not end with hyphen
    if [[ "$domain" =~ -$ ]]; then
        return 1
    fi
    
    return 0
}

# Validate JSON syntax
validate_json() {
    local file="$1"
    
    if ! command -v jq &> /dev/null; then
        # jq not available, use Python fallback
        if command -v python3 &> /dev/null; then
            python3 -m json.tool "$file" > /dev/null 2>&1
            return $?
        fi
        # Last resort - minimal check
        grep -q '{' "$file" && grep -q '}' "$file"
        return $?
    fi
    
    jq empty "$file" 2>/dev/null
    return $?
}

# Validate design spec against schema
validate_design_spec() {
    local spec_file="$1"
    
    if ! validate_json "$spec_file"; then
        return 1
    fi
    
    # Check required fields
    local required_fields=("name" "description" "version" "created_at" "design")
    
    for field in "${required_fields[@]}"; do
        if ! jq -e ".$field" "$spec_file" > /dev/null 2>&1; then
            echo "Missing required field: $field" >&2
            return 1
        fi
    done
    
    return 0
}

# ============================================================================
# FILE OPERATIONS
# ============================================================================

# Ensure directory exists (create if needed)
ensure_directory() {
    local dir="$1"
    
    if [[ ! -d "$dir" ]]; then
        if ! mkdir -p "$dir"; then
            echo "${ERROR} Failed to create directory: $dir" >&2
            return 1
        fi
    fi
    return 0
}

# Check if file exists
file_exists() {
    local file="$1"
    [[ -f "$file" ]]
}

# Check if directory exists
dir_exists() {
    local dir="$1"
    [[ -d "$dir" ]]
}

# Safe file write (backup existing)
safe_write() {
    local file="$1"
    local content="$2"
    
    # Backup existing file
    if file_exists "$file"; then
        local backup="${file}.backup.$(date +%s)"
        if ! cp "$file" "$backup"; then
            echo "${ERROR} Failed to backup existing file: $file" >&2
            return 1
        fi
    fi
    
    # Ensure directory exists
    local dir
    dir=$(dirname "$file")
    if ! ensure_directory "$dir"; then
        return 1
    fi
    
    # Write new content
    if ! echo "$content" > "$file"; then
        echo "${ERROR} Failed to write file: $file" >&2
        return 1
    fi
    
    return 0
}

# Get file count in directory
count_files() {
    local dir="$1"
    local pattern="${2:-.}"
    
    if ! dir_exists "$dir"; then
        echo 0
        return 0
    fi
    
    find "$dir" -type f -name "*$pattern*" 2>/dev/null | wc -l
}

# List files in directory (one per line)
list_files() {
    local dir="$1"
    local pattern="${2:--type f}"
    
    if ! dir_exists "$dir"; then
        return 1
    fi
    
    find "$dir" $pattern -print0 2>/dev/null | xargs -0 -I {} basename {}
}

# ============================================================================
# JSON OPERATIONS
# ============================================================================

# Extract field from JSON file
json_get() {
    local file="$1"
    local path="$2"
    
    if ! file_exists "$file"; then
        return 1
    fi
    
    if command -v jq &> /dev/null; then
        jq -r "$path" "$file" 2>/dev/null
    else
        # Minimal fallback for when jq isn't available
        grep "\"$path\"" "$file" | head -1 | sed 's/.*: "\([^"]*\)".*/\1/'
    fi
}

# Update field in JSON file
json_set() {
    local file="$1"
    local path="$2"
    local value="$3"
    
    if ! command -v jq &> /dev/null; then
        echo "${ERROR} jq is required for JSON updates" >&2
        return 1
    fi
    
    # Safely update JSON
    local temp_file="${file}.tmp"
    if jq "$path = $value" "$file" > "$temp_file"; then
        mv "$temp_file" "$file"
        return 0
    else
        rm -f "$temp_file"
        return 1
    fi
}

# Pretty print JSON
json_pretty() {
    local file="$1"
    
    if command -v jq &> /dev/null; then
        jq . "$file"
    else
        python3 -m json.tool "$file" 2>/dev/null || cat "$file"
    fi
}

# ============================================================================
# USER FEEDBACK
# ============================================================================

# Print status message
status() {
    local indicator="$1"
    local message="$2"
    echo -e "${indicator} ${message}"
}

# Print success
success() {
    status "$CHECK" "$1"
}

# Print error
error() {
    status "$ERROR" "$1" >&2
}

# Print warning
warn() {
    status "$WARN" "$1" >&2
}

# Print info
info() {
    status "$INFO" "$1"
}

# Print section header
section() {
    echo ""
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}$(printf '=%.0s' {1..${#1}})${NC}"
}

# Print subsection
subsection() {
    echo ""
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}$(printf '─%.0s' {1..${#1}})${NC}"
}

# Print list item
item() {
    echo "  $BULLET $1"
}

# Print code block
code_block() {
    echo "  \`\`\`"
    echo "  $1"
    echo "  \`\`\`"
}

# Prompt user for input
prompt() {
    local message="$1"
    local default="${2:-}"
    
    if [[ -n "$default" ]]; then
        echo -n "$message [$default]: "
    else
        echo -n "$message: "
    fi
    
    read -r input
    
    if [[ -z "$input" && -n "$default" ]]; then
        echo "$default"
    else
        echo "$input"
    fi
}

# ============================================================================
# PATH OPERATIONS
# ============================================================================

# Get absolute path
abs_path() {
    local path="$1"
    cd "$(dirname "$path")" || return 1
    pwd -P
}

# Get relative path from one location to another
rel_path() {
    local from="$1"
    local to="$2"
    
    python3 -c "import os.path; print(os.path.relpath('$to', '$from'))" 2>/dev/null || {
        # Fallback to relative calculation
        echo "../../$to"
    }
}

# Ensure path is within .claude/
validate_claude_path() {
    local path="$1"
    
    if [[ ! "$path" =~ ^\.claude/ ]]; then
        return 1
    fi
    return 0
}

# ============================================================================
# METADATA OPERATIONS
# ============================================================================

# Generate timestamp
timestamp() {
    date -u +"%Y-%m-%dT%H:%M:%SZ"
}

# Get current version from git (fallback to 1.0.0)
get_version() {
    if command -v git &> /dev/null && git rev-parse --git-dir > /dev/null 2>&1; then
        git describe --tags --always 2>/dev/null || echo "1.0.0"
    else
        echo "1.0.0"
    fi
}

# Get user name for metadata
get_author() {
    if command -v git &> /dev/null; then
        git config --global user.name 2>/dev/null || echo "Unknown"
    else
        whoami 2>/dev/null || echo "Unknown"
    fi
}

# ============================================================================
# ERROR HANDLING
# ============================================================================

# Check command exists
command_exists() {
    command -v "$1" &> /dev/null
}

# Require command
require_command() {
    local cmd="$1"
    local message="${2:-$cmd is required but not installed}"
    
    if ! command_exists "$cmd"; then
        error "$message"
        return 1
    fi
    return 0
}

# Exit with error
exit_error() {
    local message="$1"
    local code="${2:-1}"
    
    error "$message"
    exit "$code"
}

# ============================================================================
# DISCOVERY OPERATIONS
# ============================================================================

# Find all commands in .claude/commands/
find_commands() {
    local pattern="${1:--}"
    
    if ! dir_exists ".claude/commands"; then
        return 0
    fi
    
    find ".claude/commands" -type f -name "*.md" -o -name "*.sh" | grep "$pattern"
}

# Find all skills in .claude/skills/
find_skills() {
    local pattern="${1:-.}"
    
    if ! dir_exists ".claude/skills"; then
        return 0
    fi
    
    find ".claude/skills" -type f -name "SKILL.md" | grep "$pattern"
}

# Find all MCPs in .claude/mcp-servers/
find_mcps() {
    local pattern="${1:-.}"
    
    if ! dir_exists ".claude/mcp-servers"; then
        return 0
    fi
    
    find ".claude/mcp-servers" -type f -name "mcp.json" | grep "$pattern"
}

# Find all hooks
find_hooks() {
    local pattern="${1:-.}"
    
    if ! dir_exists ".claude/hooks"; then
        return 0
    fi
    
    find ".claude/hooks" -type f \( -name "*.sh" -o -name "*.bash" \) | grep "$pattern"
}

# Find all plugins
find_plugins() {
    local pattern="${1:-.}"
    
    if ! dir_exists ".claude/plugins"; then
        return 0
    fi
    
    find ".claude/plugins" -type f -name "plugin.yaml" | grep "$pattern"
}

# Count components by type
count_components() {
    local type="$1"
    
    case "$type" in
        commands) find_commands | wc -l ;;
        skills) find_skills | wc -l ;;
        mcp*) find_mcps | wc -l ;;
        hooks) find_hooks | wc -l ;;
        plugins) find_plugins | wc -l ;;
        *) echo 0 ;;
    esac
}

# ============================================================================
# TEMPLATE OPERATIONS
# ============================================================================

# Load template
load_template() {
    local template_name="$1"
    local template_file=".claude/templates/$template_name"
    
    if ! file_exists "$template_file"; then
        error "Template not found: $template_name"
        return 1
    fi
    
    cat "$template_file"
}

# Render template with variable substitution
render_template() {
    local template_file="$1"
    shift
    
    local content
    content=$(cat "$template_file") || return 1
    
    # Simple variable substitution: VAR_NAME -> ${var_name}
    while [[ $# -gt 0 ]]; do
        local key="$1"
        local value="$2"
        content="${content//\{$key\}/$value}"
        content="${content//\{\{$key\}\}/$value}"
        shift 2
    done
    
    echo "$content"
}

# ============================================================================
# REGISTRY OPERATIONS
# ============================================================================

# Check if component exists in registry
component_in_registry() {
    local component_id="$1"
    local registry_file=".claude/registry.json"
    
    if ! file_exists "$registry_file"; then
        return 1
    fi
    
    if command -v jq &> /dev/null; then
        jq -e ".components[] | select(.id == \"$component_id\")" "$registry_file" > /dev/null 2>&1
        return $?
    fi
    
    grep -q "\"id\": \"$component_id\"" "$registry_file"
}

# Get component metadata from registry
get_component_metadata() {
    local component_id="$1"
    local field="${2:-.}"
    local registry_file=".claude/registry.json"
    
    if ! file_exists "$registry_file"; then
        return 1
    fi
    
    if command -v jq &> /dev/null; then
        jq -r ".components[] | select(.id == \"$component_id\") | $field" "$registry_file" 2>/dev/null
    fi
}

# ============================================================================
# CLEANUP FUNCTIONS
# ============================================================================

# Remove temporary files
cleanup_temp() {
    local pattern="$1"
    find . -name "*$pattern*" -type f -path "./.claude/*" -delete 2>/dev/null || true
}

# Remove backups older than N days
cleanup_backups() {
    local days="${1:-30}"
    find ".claude" -name "*.backup.*" -type f -mtime "+$days" -delete 2>/dev/null || true
}

# ============================================================================
# Export functions for use in other scripts
# ============================================================================

export -f validate_domain_name
export -f validate_json
export -f ensure_directory
export -f file_exists
export -f dir_exists
export -f safe_write
export -f status
export -f success
export -f error
export -f warn
export -f info
export -f section
export -f subsection
export -f item
export -f prompt
export -f timestamp
export -f find_commands
export -f find_skills
export -f find_mcps
export -f exit_error

# ============================================================================
# Initialization
# ============================================================================

# Ensure .claude/ exists
ensure_directory ".claude" || {
    echo "${ERROR} Failed to initialize .claude directory" >&2
    exit 1
}

true
