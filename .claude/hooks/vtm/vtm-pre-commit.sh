#!/bin/bash
# VTM - pre-commit hook
# Validates task dependencies and data integrity before commits

set -e

# Check if vtm.json exists
if [[ ! -f "vtm.json" ]]; then
    # No vtm.json in repo, skip validation
    exit 0
fi

echo "🔍 VTM Pre-commit Validation..."

# Check if vtm CLI is available
if ! command -v vtm &> /dev/null; then
    echo "⚠️  Warning: vtm CLI not found, skipping validation"
    exit 0
fi

# Validate vtm.json is valid JSON
if ! jq empty vtm.json 2>/dev/null; then
    echo "❌ Error: vtm.json is not valid JSON"
    echo ""
    echo "Fix the JSON syntax before committing"
    exit 1
fi

# Validate task dependencies
echo "  ✓ Checking task dependencies..."

# Check for circular dependencies
TASK_IDS=$(jq -r '.tasks[].id' vtm.json)
for TASK_ID in $TASK_IDS; do
    DEPS=$(jq -r ".tasks[] | select(.id==\"$TASK_ID\") | .dependencies[]?" vtm.json)
    for DEP in $DEPS; do
        # Extract task number from ID (e.g., TASK-003 -> 3)
        TASK_NUM=$(echo "$TASK_ID" | sed 's/TASK-0*//')
        DEP_NUM=$(echo "$DEP" | sed 's/TASK-0*//')

        # Validate dependency is lower numbered
        if [[ $DEP_NUM -ge $TASK_NUM ]]; then
            echo "❌ Error: Invalid dependency in $TASK_ID"
            echo "   Task $TASK_ID cannot depend on $DEP (must be lower numbered)"
            exit 1
        fi
    done
done

echo "  ✓ Task dependencies valid"

# Validate stats are accurate
echo "  ✓ Checking stats accuracy..."

TOTAL=$(jq '.tasks | length' vtm.json)
COMPLETED=$(jq '[.tasks[] | select(.status=="completed")] | length' vtm.json)
IN_PROGRESS=$(jq '[.tasks[] | select(.status=="in-progress")] | length' vtm.json)
PENDING=$(jq '[.tasks[] | select(.status=="pending")] | length' vtm.json)

STATS_TOTAL=$(jq '.stats.total_tasks' vtm.json)
STATS_COMPLETED=$(jq '.stats.completed' vtm.json)
STATS_IN_PROGRESS=$(jq '.stats.in_progress' vtm.json)
STATS_PENDING=$(jq '.stats.pending' vtm.json)

if [[ $TOTAL -ne $STATS_TOTAL ]] || \
   [[ $COMPLETED -ne $STATS_COMPLETED ]] || \
   [[ $IN_PROGRESS -ne $STATS_IN_PROGRESS ]] || \
   [[ $PENDING -ne $STATS_PENDING ]]; then
    echo "❌ Error: Stats are out of sync"
    echo ""
    echo "Expected: total=$TOTAL, completed=$COMPLETED, in_progress=$IN_PROGRESS, pending=$PENDING"
    echo "Actual:   total=$STATS_TOTAL, completed=$STATS_COMPLETED, in_progress=$STATS_IN_PROGRESS, pending=$STATS_PENDING"
    echo ""
    echo "Run: vtm stats (will auto-fix)"
    exit 1
fi

echo "  ✓ Stats accurate"

# Validate no broken task references
echo "  ✓ Checking task references..."

ALL_TASK_IDS=$(jq -r '.tasks[].id' vtm.json | sort)

# Check all dependencies exist
for TASK_ID in $(jq -r '.tasks[].id' vtm.json); do
    DEPS=$(jq -r ".tasks[] | select(.id==\"$TASK_ID\") | .dependencies[]?" vtm.json)
    for DEP in $DEPS; do
        if ! echo "$ALL_TASK_IDS" | grep -q "^$DEP$"; then
            echo "❌ Error: Task $TASK_ID depends on non-existent task $DEP"
            exit 1
        fi
    done
done

echo "  ✓ All task references valid"

echo ""
echo "✅ VTM validation passed"

exit 0
