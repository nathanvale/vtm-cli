#!/bin/bash
# VTM - post-checkout hook
# Updates task cache and validates vtm.json after branch switches

set -e

# Arguments passed by git
PREV_HEAD=$1
NEW_HEAD=$2
BRANCH_CHECKOUT=$3

# Check if vtm.json exists
if [[ ! -f "vtm.json" ]]; then
    # No vtm.json in repo
    exit 0
fi

# Only run on branch checkouts, not file checkouts
if [[ "$BRANCH_CHECKOUT" != "1" ]]; then
    exit 0
fi

echo "🔄 VTM Post-checkout: Refreshing cache..."

# Check if vtm CLI is available
if ! command -v vtm &> /dev/null; then
    echo "⚠️  Warning: vtm CLI not found, skipping cache refresh"
    exit 0
fi

# Validate vtm.json is valid JSON
if ! jq empty vtm.json 2>/dev/null; then
    echo "⚠️  Warning: vtm.json is not valid JSON after checkout"
    echo "   You may need to resolve merge conflicts"
    exit 0
fi

# Check if vtm.json changed between branches
VTM_CHANGED=$(git diff --name-only $PREV_HEAD $NEW_HEAD | grep -c "vtm.json" || echo "0")

if [[ "$VTM_CHANGED" == "0" ]]; then
    echo "  ✓ vtm.json unchanged"
    exit 0
fi

echo "  ✓ vtm.json changed, validating..."

# Quick validation
TOTAL=$(jq '.tasks | length' vtm.json 2>/dev/null || echo "0")
if [[ "$TOTAL" == "0" ]]; then
    echo "⚠️  Warning: vtm.json appears empty or invalid"
    exit 0
fi

echo "  ✓ Found $TOTAL tasks"

# Show quick stats after branch switch
echo ""
echo "📊 Task Status:"
vtm stats

echo ""
echo "💡 Next: /vtm:next to see ready tasks"

exit 0
