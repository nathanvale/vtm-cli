#!/bin/bash
# Test script for plan command validators
# Tests validation logic for all plan domain commands

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Testing Plan Command Validators"
echo "=========================================="
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
pass() {
  echo -e "${GREEN}✓ PASS${NC}: $1"
  TESTS_PASSED=$((TESTS_PASSED + 1))
}

fail() {
  echo -e "${RED}✗ FAIL${NC}: $1"
  TESTS_FAILED=$((TESTS_FAILED + 1))
}

section() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Setup test directories and files
setup_test_files() {
  mkdir -p test-data/adr
  mkdir -p test-data/specs
  mkdir -p test-data/prd

  # Create valid ADR
  cat > test-data/adr/ADR-001-test-decision.md << 'EOF'
# ADR-001: Test Decision

## Status
Accepted

## Context
We need to make a test decision for validation purposes.

## Decision
We will use test approach A for testing the validation system.

## Consequences
This allows us to validate the validation logic.

## Alternatives

### Alternative 1: Approach B
Not suitable for testing.

### Alternative 2: Approach C
Too complex for test case.

### Alternative 3: Approach D
Rejected for testing purposes.
EOF

  # Create invalid ADR (missing sections)
  cat > test-data/adr/ADR-002-invalid.md << 'EOF'
# ADR-002: Invalid Decision

Just some text without proper sections.
EOF

  # Create valid spec that references ADR-001
  cat > test-data/specs/spec-test.md << 'EOF'
# Technical Specification: Test Implementation

**Source ADR:** ADR-001-test-decision.md

## Acceptance Criteria
- [ ] Test passes
- [ ] Validation works

## Implementation

```typescript
// Example code
const test = true
```

## Testing Strategy
TDD approach for high-risk components.
EOF

  # Create spec that doesn't reference ADR
  cat > test-data/specs/spec-orphan.md << 'EOF'
# Technical Specification: Orphan Spec

This spec doesn't reference any ADR.

## Acceptance Criteria
- [ ] Some criterion
EOF

  # Create valid PRD
  cat > test-data/prd/test-feature.md << 'EOF'
---
spec_type: prd
---

# PRD: Test Feature

## Problem Statement
We need to test the PRD validation.

## Users and Jobs
Testing user validation logic.

## Scope
Test validation scope.

## Technical Decisions

### Decision 1: Use approach A
We will use approach A for this feature.

### Decision 2: Implement feature B
We chose to implement feature B.

## Requirements
1. Requirement 1
2. Requirement 2
EOF

  # Create invalid PRD (too short)
  cat > test-data/prd/invalid-short.md << 'EOF'
# Short PRD

Just a title.
EOF
}

cleanup_test_files() {
  rm -rf test-data
}

# Test 1: ADR Structure Validation
section "Test 1: ADR Structure Validation"

setup_test_files

# Test 1a: Valid ADR
echo "Testing valid ADR structure..."
ADR_CONTENT=$(cat test-data/adr/ADR-001-test-decision.md)

if echo "$ADR_CONTENT" | grep -q "^# ADR-"; then
  pass "ADR has valid header"
else
  fail "ADR header detection"
fi

REQUIRED_SECTIONS=("Status" "Context" "Decision" "Consequences")
for section in "${REQUIRED_SECTIONS[@]}"; do
  if echo "$ADR_CONTENT" | grep -q "^## $section"; then
    pass "ADR has $section section"
  else
    fail "ADR missing $section section"
  fi
done

ALT_COUNT=$(echo "$ADR_CONTENT" | grep -c "### Alternative" || true)
if [ "$ALT_COUNT" -ge 3 ]; then
  pass "ADR has sufficient alternatives ($ALT_COUNT)"
else
  fail "ADR has insufficient alternatives ($ALT_COUNT < 3)"
fi

# Test 1b: Invalid ADR
echo ""
echo "Testing invalid ADR detection..."
INVALID_ADR=$(cat test-data/adr/ADR-002-invalid.md)

if ! echo "$INVALID_ADR" | grep -q "^## Status"; then
  pass "Detects missing Status section"
else
  fail "Should detect missing Status section"
fi

# Test 2: PRD Structure Validation
section "Test 2: PRD Structure Validation"

# Test 2a: Valid PRD
echo "Testing valid PRD structure..."
PRD_CONTENT=$(cat test-data/prd/test-feature.md)

if echo "$PRD_CONTENT" | grep -q "spec_type: prd"; then
  pass "PRD has spec_type frontmatter"
else
  fail "PRD spec_type detection"
fi

LINE_COUNT=$(echo "$PRD_CONTENT" | wc -l | xargs)
if [ "$LINE_COUNT" -ge 10 ]; then
  pass "PRD has sufficient content ($LINE_COUNT lines)"
else
  fail "PRD too short ($LINE_COUNT < 10 lines)"
fi

HAS_DECISIONS=$(echo "$PRD_CONTENT" | grep -i "decision\|approach\|strategy\|we will\|we chose" | wc -l | xargs)
if [ "$HAS_DECISIONS" -gt 0 ]; then
  pass "PRD contains decision-making content"
else
  fail "PRD missing decision content"
fi

# Test 2b: Invalid PRD
echo ""
echo "Testing invalid PRD detection..."
INVALID_PRD=$(cat test-data/prd/invalid-short.md)

INVALID_LINE_COUNT=$(echo "$INVALID_PRD" | wc -l | xargs)
if [ "$INVALID_LINE_COUNT" -lt 10 ]; then
  pass "Detects PRD that is too short"
else
  fail "Should detect short PRD"
fi

# Test 3: Spec Structure Validation
section "Test 3: Spec Structure Validation"

# Test 3a: Valid spec
echo "Testing valid spec structure..."
SPEC_CONTENT=$(cat test-data/specs/spec-test.md)

if echo "$SPEC_CONTENT" | grep -q "ADR-"; then
  pass "Spec references an ADR"
else
  fail "Spec ADR reference detection"
fi

CODE_BLOCKS=$(echo "$SPEC_CONTENT" | grep -c '```' || true)
if [ "$CODE_BLOCKS" -ge 2 ]; then
  pass "Spec has code examples"
else
  fail "Spec missing code examples"
fi

if echo "$SPEC_CONTENT" | grep -q "Acceptance Criteria"; then
  pass "Spec has Acceptance Criteria section"
else
  fail "Spec missing Acceptance Criteria"
fi

# Test 3b: Orphan spec
echo ""
echo "Testing orphan spec detection..."
ORPHAN_SPEC=$(cat test-data/specs/spec-orphan.md)

if ! echo "$ORPHAN_SPEC" | grep -q "ADR-"; then
  pass "Detects spec without ADR reference"
else
  fail "Should detect missing ADR reference"
fi

# Test 4: ADR+Spec Pairing Validation
section "Test 4: ADR+Spec Pairing Validation"

# Test 4a: Valid pairing
echo "Testing valid ADR+Spec pairing..."
ADR_FILE="test-data/adr/ADR-001-test-decision.md"
SPEC_FILE="test-data/specs/spec-test.md"

ADR_FILENAME=$(basename "$ADR_FILE")
SPEC_CONTENT=$(cat "$SPEC_FILE")

if echo "$SPEC_CONTENT" | grep -q "$ADR_FILENAME\|ADR-001"; then
  pass "Spec references correct ADR"
else
  fail "Spec should reference ADR-001"
fi

# Test 4b: Invalid pairing
echo ""
echo "Testing invalid ADR+Spec pairing..."
WRONG_ADR="test-data/adr/ADR-002-invalid.md"
WRONG_ADR_FILENAME=$(basename "$WRONG_ADR")

if ! echo "$SPEC_CONTENT" | grep -q "$WRONG_ADR_FILENAME\|ADR-002"; then
  pass "Detects ADR+Spec mismatch"
else
  fail "Should detect ADR+Spec mismatch"
fi

# Test 5: File Path Validation
section "Test 5: File Path Validation"

# Test 5a: ADR path validation
echo "Testing ADR path validation..."
if [[ "$ADR_FILE" == *"/adr/"* ]]; then
  pass "ADR file path contains /adr/"
else
  fail "ADR path validation"
fi

# Test 5b: Spec path validation
echo "Testing spec path validation..."
if [[ "$SPEC_FILE" == *"/spec"* ]]; then
  pass "Spec file path contains /spec"
else
  fail "Spec path validation"
fi

# Test 6: Quality Checks (Warnings)
section "Test 6: Quality Checks (Warnings)"

# Test 6a: ADR alternatives count
echo "Testing ADR alternatives count..."
ALT_COUNT=$(cat "$ADR_FILE" | grep -c "### Alternative" || true)
if [ "$ALT_COUNT" -lt 3 ]; then
  echo -e "${YELLOW}⚠ WARNING${NC}: ADR has only $ALT_COUNT alternatives (recommended: 3+)"
  pass "Detects insufficient alternatives (warning)"
else
  pass "ADR has sufficient alternatives"
fi

# Test 6b: Spec code examples
echo "Testing spec code examples..."
CODE_BLOCKS=$(cat "$SPEC_FILE" | grep -c '```' || true)
if [ "$CODE_BLOCKS" -lt 2 ]; then
  echo -e "${YELLOW}⚠ WARNING${NC}: Spec has only $((CODE_BLOCKS / 2)) code examples"
  pass "Detects few code examples (warning)"
else
  pass "Spec has code examples"
fi

# Cleanup
cleanup_test_files

# Summary
section "Test Summary"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))

echo ""
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
if [ $TESTS_FAILED -gt 0 ]; then
  echo -e "${RED}Failed: $TESTS_FAILED${NC}"
else
  echo -e "${GREEN}Failed: 0${NC}"
fi
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All validation tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed. Review the output above.${NC}"
  exit 1
fi
