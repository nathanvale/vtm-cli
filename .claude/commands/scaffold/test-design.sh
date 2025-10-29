#!/bin/bash

# Test the design.js script with automated responses

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DESIGN_SCRIPT="$SCRIPT_DIR/design.js"

# Clean up previous test designs
rm -f .claude/designs/test-domain.json

# Test inputs (one answer per line)
# Q1: Operations (next, review)
# Q2: Auto-discovery (yes)
# Q3: Triggers (leave blank to use defaults)
# Q4: External systems (no)
# Q5: Automation (no)
# Q6: Sharing scope (personal)
read -r -d '' TEST_INPUT << 'EOF' || true
next, review
yes

no

no
personal
EOF

echo "Running design.js test..."
echo "$TEST_INPUT" | node "$DESIGN_SCRIPT" test-domain "Test Domain" 2>&1 || true

# Check if design was created
if [[ -f .claude/designs/test-domain.json ]]; then
    echo ""
    echo "✅ Test passed: Design file created"
    echo ""
    echo "Design contents:"
    cat .claude/designs/test-domain.json | head -30
    echo ""
    echo "Full design saved to: .claude/designs/test-domain.json"
else
    echo "❌ Test failed: Design file not created"
    exit 1
fi
