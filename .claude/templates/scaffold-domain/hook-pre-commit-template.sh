#!/bin/bash
# Pre-commit Hook: {DOMAIN} Validation
#
# Event: pre-commit
# Purpose: {HOOK_PURPOSE}
#
# This hook runs before every commit and validates {DOMAIN} requirements.
# To install: cp this file to .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit
#
# CUSTOMIZE: Update validation rules below to match your requirements

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
HOOK_NAME="{domain}-validation"
COMMIT_MSG_FILE="$1"
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Logging functions
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# ============================================================================
# CUSTOMIZATION SECTION: Add your validation rules below
# ============================================================================

# EXAMPLE 1: Validate {domain} task reference in commit message
# Customize pattern to match your task ID format (TASK-001, PM-123, etc.)
validate_task_reference() {
    local commit_msg="$1"
    local pattern="{DOMAIN}-[0-9]+"

    if ! echo "$commit_msg" | grep -qiE "$pattern"; then
        log_error "Commit message must reference a {DOMAIN} task"
        echo ""
        echo "  Required format: {DOMAIN}-123: Your commit message"
        echo "  Examples:"
        echo "    TASK-001: Implement feature"
        echo "    PM-042: Fix bug in module"
        echo "    {DOMAIN}-99: Update documentation"
        echo ""
        echo "If you don't have a task:"
        echo "  1. Run: /{domain}:next"
        echo "  2. Create a task in your {domain} system"
        echo "  3. Reference the task ID in your commit"
        return 1
    fi
}

# EXAMPLE 2: Check that referenced task exists and is accessible
validate_task_exists() {
    local commit_msg="$1"
    local task_id=$(echo "$commit_msg" | grep -oE "{DOMAIN}-[0-9]+" | head -1)

    if [ -z "$task_id" ]; then
        return 0  # Skip if no task ID found
    fi

    # TODO: Check if task exists in your system
    # Examples:
    #   - Query database: sqlite3 tasks.db "SELECT * FROM tasks WHERE id='$task_id'"
    #   - Query API: curl -s "https://api.example.com/tasks/$task_id"
    #   - Check file: grep -r "$task_id" ./tasks/ > /dev/null

    log_warn "TODO: Implement task existence check for $task_id"
}

# EXAMPLE 3: Validate commit message format
validate_commit_format() {
    local commit_msg="$1"

    # Check minimum message length
    if [ ${#commit_msg} -lt 10 ]; then
        log_error "Commit message too short (minimum 10 characters)"
        echo "Current length: ${#commit_msg}"
        return 1
    fi

    # TODO: Add more format validations
    # Examples:
    #   - Check for capital letter at start
    #   - Verify no trailing whitespace
    #   - Ensure proper capitalization
    #   - Check for disallowed characters
}

# EXAMPLE 4: Check for WIP/DEBUG markers (prevent accidental commits)
validate_no_debug_code() {
    # Check for common debug markers in committed files
    local debug_patterns=(
        "console\.log"
        "debugger"
        "TODO:"
        "FIXME:"
        "WIP"
        "XXX"
    )

    local files_with_debug=0

    for pattern in "${debug_patterns[@]}"; do
        if git diff --cached --name-only | xargs grep -l "$pattern" 2>/dev/null; then
            log_warn "Found potential debug code: $pattern"
            files_with_debug=$((files_with_debug + 1))
        fi
    done

    if [ $files_with_debug -gt 0 ]; then
        log_warn "Found $files_with_debug debug patterns in staged files"
        echo "  Remove debug code before committing (recommended)"
        echo "  To continue anyway, use: git commit --no-verify"
        # NOTE: Returning 0 to warn but not fail. Change to "return 1" to enforce.
    fi
}

# EXAMPLE 5: Check for required files in commit
validate_required_changes() {
    # Some commits might require specific files
    # For example, version bumps should update package.json

    local commit_msg="$1"

    if echo "$commit_msg" | grep -qi "version\|release\|bump"; then
        if ! git diff --cached --name-only | grep -q "package.json"; then
            log_warn "Version bump commit should update package.json"
            # NOTE: Returning 0 to warn but not fail. Change to "return 1" to enforce.
        fi
    fi
}

# EXAMPLE 6: Validate against {domain} system rules
validate_domain_rules() {
    # Add {domain}-specific validation
    # Examples for different domains:

    # For PM domain:
    #   - Check task status isn't "blocked"
    #   - Verify task is assigned to current user
    #   - Ensure task has a parent epic

    # For DevOps domain:
    #   - Check deployment credentials are not exposed
    #   - Verify no hardcoded IPs/secrets
    #   - Ensure infrastructure as code is valid

    # For Test domain:
    #   - Check test files are properly named
    #   - Verify test-to-code ratio
    #   - Ensure all tests are passing

    # TODO: Implement your domain-specific rules
    local commit_msg="$1"

    # Example implementation:
    # if ! /{domain}:validate-commit "$commit_msg"; then
    #     log_error "Validation failed against {domain} rules"
    #     return 1
    # fi
}

# ============================================================================
# HOOK EXECUTION
# ============================================================================

main() {
    echo ""
    echo "Running: $HOOK_NAME"
    echo "───────────────────────────────────────────"

    local all_passed=true

    # Run all validations
    echo "Checking commit message format..."
    if ! validate_commit_format "$COMMIT_MSG"; then
        all_passed=false
    fi
    log_info "Commit format validation passed"

    echo ""
    echo "Checking {domain} task reference..."
    if ! validate_task_reference "$COMMIT_MSG"; then
        all_passed=false
    fi
    log_info "{domain} task reference found"

    echo ""
    echo "Checking task exists..."
    if ! validate_task_exists "$COMMIT_MSG"; then
        all_passed=false
    fi
    log_info "Task existence check passed"

    echo ""
    echo "Checking for debug code..."
    validate_no_debug_code

    echo ""
    echo "Checking required changes..."
    validate_required_changes "$COMMIT_MSG"

    echo ""
    echo "Running {domain} validation..."
    if ! validate_domain_rules "$COMMIT_MSG"; then
        all_passed=false
    fi

    echo ""
    echo "───────────────────────────────────────────"

    if [ "$all_passed" = true ]; then
        log_info "All validations passed! Commit proceeding."
        echo ""
        return 0
    else
        log_error "Pre-commit validation failed. Fix issues above and try again."
        echo ""
        echo "To skip this hook: git commit --no-verify"
        echo ""
        return 1
    fi
}

# Run the hook
main

# Exit with appropriate code
exit $?
