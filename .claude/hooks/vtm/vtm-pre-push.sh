#!/bin/bash
# VTM - pre-push hook
# Ensures task states are consistent before pushing

set -e

# Check if vtm.json exists
if [[ ! -f "vtm.json" ]]; then
    # No vtm.json in repo
    exit 0
fi

echo "🚀 VTM Pre-push Validation..."

# Check if vtm CLI is available
if ! command -v vtm &> /dev/null; then
    echo "⚠️  Warning: vtm CLI not found, skipping validation"
    exit 0
fi

# Validate vtm.json is valid JSON
if ! jq empty vtm.json 2>/dev/null; then
    echo "❌ Error: vtm.json is not valid JSON"
    exit 1
fi

# Check for tasks marked completed but with failing tests
echo "  ✓ Checking completed tasks..."

COMPLETED_TASKS=$(jq -r '.tasks[] | select(.status=="completed") | .id' vtm.json)
COMPLETED_COUNT=$(echo "$COMPLETED_TASKS" | grep -c "TASK" || echo "0")

if [[ "$COMPLETED_COUNT" -gt 0 ]]; then
    echo "    Found $COMPLETED_COUNT completed tasks"
fi

# Warn about in-progress tasks being pushed
IN_PROGRESS_COUNT=$(jq '[.tasks[] | select(.status=="in-progress")] | length' vtm.json)

if [[ "$IN_PROGRESS_COUNT" -gt 0 ]]; then
    echo ""
    echo "⚠️  Warning: $IN_PROGRESS_COUNT task(s) still in-progress"
    echo ""
    echo "Tasks being pushed with in-progress status:"
    jq -r '.tasks[] | select(.status=="in-progress") | "  • \(.id): \(.title)"' vtm.json
    echo ""
    read -p "Continue push? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Push cancelled"
        exit 1
    fi
fi

# Validate no completed tasks have unmet dependencies
echo "  ✓ Checking dependency consistency..."

for TASK_ID in $(jq -r '.tasks[] | select(.status=="completed") | .id' vtm.json); do
    DEPS=$(jq -r ".tasks[] | select(.id==\"$TASK_ID\") | .dependencies[]?" vtm.json)
    for DEP in $DEPS; do
        DEP_STATUS=$(jq -r ".tasks[] | select(.id==\"$DEP\") | .status" vtm.json)
        if [[ "$DEP_STATUS" != "completed" ]]; then
            echo "❌ Error: Task $TASK_ID is completed but depends on incomplete task $DEP"
            echo "   This should not be possible - vtm.json may be corrupted"
            exit 1
        fi
    done
done

echo "  ✓ Dependencies consistent"

# Show summary
echo ""
echo "📊 Push Summary:"
vtm stats

echo ""
echo "✅ VTM validation passed"

exit 0
