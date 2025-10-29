#!/bin/bash
# Post-Tool-Use Hook: {DOMAIN} Auto-Actions
#
# Event: post-tool-use
# Purpose: {HOOK_PURPOSE}
#
# This hook runs after a Claude Code tool is executed and can trigger
# automatic {domain} actions based on tool results.
#
# CUSTOMIZE: Update auto-actions below to match your workflow

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Hook configuration
HOOK_NAME="{domain}-auto-actions"
TOOL_NAME="${1:-unknown}"
TOOL_OUTPUT="${2:-}"
EXIT_CODE="${3:-0}"

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

log_action() {
    echo -e "${BLUE}→${NC} $1"
}

# ============================================================================
# CUSTOMIZATION SECTION: Define auto-actions for your domain
# ============================================================================

# EXAMPLE 1: Auto-update {domain} status based on tool results
auto_update_status() {
    local tool_name="$1"
    local tool_output="$2"
    local exit_code="$3"

    # TODO: Parse tool output and extract relevant information
    # Examples:
    #   - If tool was "file-write" → task changed → update status to "in-progress"
    #   - If tool was "test-run" → tests passed → update status to "ready-review"
    #   - If tool was "deploy" → deployment succeeded → update status to "deployed"

    case "$tool_name" in
        "file-write")
            log_action "File was modified, updating {domain} task status..."
            # /{domain}:update {task-id} status:in-progress
            ;;
        "bash")
            if [ "$exit_code" -eq 0 ]; then
                log_action "Bash command succeeded, checking if {domain} milestone reached..."
                # Check if a {domain} milestone was completed
            fi
            ;;
        "test-run")
            if [ "$exit_code" -eq 0 ]; then
                log_action "Tests passed, marking {domain} task as validated..."
                # /{domain}:update {task-id} test_status:passing
            fi
            ;;
        *)
            # Generic handling for unknown tools
            ;;
    esac
}

# EXAMPLE 2: Auto-link commits to {domain} tasks
auto_link_commit() {
    local tool_output="$1"

    # Check if output mentions a commit
    if echo "$tool_output" | grep -q "commit\|pushed\|branch"; then
        log_action "Commit mentioned, checking for linked {domain} task..."

        # TODO: Extract commit hash and message
        # Example: Extract from git log output
        local commit_hash=$(git log -1 --pretty=format:"%H" 2>/dev/null || echo "")
        local commit_msg=$(git log -1 --pretty=format:"%B" 2>/dev/null || echo "")

        if [ -z "$commit_hash" ]; then
            return 0
        fi

        # Check if commit message references a {domain} task
        if echo "$commit_msg" | grep -qE "{DOMAIN}-[0-9]+"; then
            log_info "Commit already linked to {domain} task"
            return 0
        fi

        log_warn "Commit not linked to {domain} task"
        log_warn "Next commit should reference a task: {DOMAIN}-xxx: message"
    fi
}

# EXAMPLE 3: Auto-create related {domain} items
auto_create_related_items() {
    local tool_output="$1"

    # Automatically create related items in {domain} system
    # Examples:
    #   - If a bug was fixed → create verification task
    #   - If a feature was completed → create documentation task
    #   - If tests were added → create review task

    if echo "$tool_output" | grep -qi "bug\|fix"; then
        log_action "Bug fix detected, check if verification task needed..."
        # TODO: Create follow-up task
        # /{domain}:create title:"Verify fix for {item}" description:"..." depends_on:{current-task}
    fi

    if echo "$tool_output" | grep -qi "feature\|implement"; then
        log_action "Feature implementation detected, check if documentation task needed..."
        # TODO: Create documentation task
        # /{domain}:create title:"Document {feature}" type:documentation
    fi
}

# EXAMPLE 4: Auto-update metrics and statistics
auto_update_metrics() {
    local tool_name="$1"
    local exit_code="$2"

    # Track metrics about {domain} tool usage
    # Examples:
    #   - Count successful vs failed operations
    #   - Track tool usage patterns
    #   - Calculate task completion time
    #   - Monitor error rates

    local metrics_file=".{domain}-metrics.json"

    if [ ! -f "$metrics_file" ]; then
        echo '{"operations": [], "stats": {}}' > "$metrics_file"
    fi

    # TODO: Update metrics
    # Track: operation_name, success/failure, timestamp, duration
}

# EXAMPLE 5: Auto-notify team of important changes
auto_notify_team() {
    local tool_name="$1"
    local tool_output="$2"
    local exit_code="$3"

    # Send notifications for significant {domain} events
    # Examples:
    #   - Deployment completed
    #   - Test suite failed
    #   - Critical bug fixed
    #   - Milestone reached

    if [ "$exit_code" -ne 0 ]; then
        log_warn "Tool failed, consider notifying team..."
        # TODO: Send notification
        # Examples:
        #   - Slack webhook
        #   - Email alert
        #   - Team dashboard update
    fi

    if echo "$tool_output" | grep -qi "critical\|urgent\|failed"; then
        log_action "Critical event detected, sending team notification..."
        # TODO: Send to team notification system
    fi
}

# EXAMPLE 6: Auto-create comments or documentation
auto_document_changes() {
    local tool_name="$1"
    local tool_output="$2"

    # Automatically document tool results
    # Examples:
    #   - Add inline code comments for changes
    #   - Create decision log entry
    #   - Update architecture documentation
    #   - Create decision record (ADR)

    if echo "$tool_output" | grep -qi "architecture\|design\|pattern"; then
        log_action "Architecture change detected, check if ADR needed..."
        # TODO: Create architecture decision record
        # File: docs/adr/adr-NNN-{description}.md
    fi

    if echo "$tool_output" | grep -qi "refactor\|restructure"; then
        log_action "Code refactoring detected, documenting changes..."
        # TODO: Add to refactoring log
    fi
}

# ============================================================================
# SMART TRIGGER DETECTION
# ============================================================================

# Detect {domain} keywords in tool output
detect_domain_triggers() {
    local tool_output="$1"
    local keywords=(
        "{domain}"
        "task"
        "milestone"
        "deployment"
        "version"
        "release"
    )

    for keyword in "${keywords[@]}"; do
        if echo "$tool_output" | grep -qi "$keyword"; then
            return 0
        fi
    done

    return 1
}

# ============================================================================
# HOOK EXECUTION
# ============================================================================

main() {
    echo ""
    echo "Running: $HOOK_NAME"
    echo "───────────────────────────────────────────"
    echo "Tool: $TOOL_NAME"
    echo "Exit code: $EXIT_CODE"
    echo ""

    # Skip if tool failed and we're not handling errors
    if [ "$EXIT_CODE" -ne 0 ]; then
        log_warn "Tool exited with code $EXIT_CODE"
    fi

    # Check if this tool output is relevant to {domain}
    if ! detect_domain_triggers "$TOOL_OUTPUT"; then
        log_info "No {domain} triggers detected, skipping auto-actions"
        echo ""
        return 0
    fi

    log_action "Detected {domain}-relevant tool output, running auto-actions..."
    echo ""

    # Execute auto-actions
    log_action "Checking status updates..."
    auto_update_status "$TOOL_NAME" "$TOOL_OUTPUT" "$EXIT_CODE"
    echo ""

    log_action "Checking commit links..."
    auto_link_commit "$TOOL_OUTPUT"
    echo ""

    log_action "Checking related items..."
    auto_create_related_items "$TOOL_OUTPUT"
    echo ""

    log_action "Updating metrics..."
    auto_update_metrics "$TOOL_NAME" "$EXIT_CODE"
    echo ""

    log_action "Checking team notifications..."
    auto_notify_team "$TOOL_NAME" "$TOOL_OUTPUT" "$EXIT_CODE"
    echo ""

    log_action "Documenting changes..."
    auto_document_changes "$TOOL_NAME" "$TOOL_OUTPUT"
    echo ""

    echo "───────────────────────────────────────────"
    log_info "Auto-actions completed"
    echo ""

    return 0
}

# Run the hook
main

# Always exit successfully (this hook is informational, not blocking)
exit 0
