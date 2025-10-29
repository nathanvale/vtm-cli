#!/bin/bash
# VTM - post-merge hook
# Automatically resolves vtm.json conflicts after merges

set -e

# Check if vtm.json exists
if [[ ! -f "vtm.json" ]]; then
    # No vtm.json in repo
    exit 0
fi

echo "🔀 VTM Post-merge: Checking for conflicts..."

# Check if vtm.json has merge conflicts
if grep -q "<<<<<<< HEAD" vtm.json 2>/dev/null; then
    echo ""
    echo "⚠️  Merge conflicts detected in vtm.json"
    echo ""
    echo "Conflict resolution strategies:"
    echo ""
    echo "1. Manual resolution (recommended):"
    echo "   • Open vtm.json and resolve conflicts"
    echo "   • Ensure JSON is valid: jq . vtm.json"
    echo "   • Re-run stats: vtm stats"
    echo "   • Commit resolved file"
    echo ""
    echo "2. Accept theirs (use incoming changes):"
    echo "   git checkout --theirs vtm.json"
    echo "   git add vtm.json"
    echo ""
    echo "3. Accept ours (keep current changes):"
    echo "   git checkout --ours vtm.json"
    echo "   git add vtm.json"
    echo ""
    exit 1
fi

# Check if vtm CLI is available
if ! command -v vtm &> /dev/null; then
    echo "  ✓ No conflicts, but vtm CLI not available"
    exit 0
fi

# Validate vtm.json is valid JSON
if ! jq empty vtm.json 2>/dev/null; then
    echo "⚠️  Warning: vtm.json is not valid JSON after merge"
    exit 0
fi

echo "  ✓ No conflicts detected"

# Check if stats need recalculation
TOTAL=$(jq '.tasks | length' vtm.json)
COMPLETED=$(jq '[.tasks[] | select(.status=="completed")] | length' vtm.json)
STATS_TOTAL=$(jq '.stats.total_tasks' vtm.json)
STATS_COMPLETED=$(jq '.stats.completed' vtm.json)

if [[ $TOTAL -ne $STATS_TOTAL ]] || [[ $COMPLETED -ne $STATS_COMPLETED ]]; then
    echo "  ⚠️  Stats out of sync, recalculating..."

    # Update stats (vtm CLI does this automatically)
    vtm stats > /dev/null

    echo "  ✓ Stats updated"

    # Auto-stage the updated vtm.json
    git add vtm.json
    echo "  ✓ Updated vtm.json staged"
fi

# Show post-merge status
echo ""
echo "📊 Post-merge Task Status:"
vtm stats

echo ""
echo "💡 Next: /vtm:next to continue work"

exit 0
