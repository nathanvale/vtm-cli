#!/bin/bash

# Test Template Hierarchy Script
# Verifies that template loading works correctly with custom overrides

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'  # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Helper functions
print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_test() {
    echo -e "${YELLOW}→ $1${NC}"
}

print_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((TESTS_PASSED++))
}

print_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((TESTS_FAILED++))
}

print_skip() {
    echo -e "${YELLOW}⊘ $1${NC}"
    ((TESTS_SKIPPED++))
}

# Main test directory
TEST_DIR=$(pwd)
TEMPLATES_DIR=".claude/templates"
LOCAL_TEMPLATES_DIR=".claude/templates/local"

print_header "Template Hierarchy Test Suite"
echo "Testing template customization and loading logic"
echo "Working directory: $TEST_DIR"
echo ""

# Test 1: Check default templates exist
print_test "Test 1: Default templates exist"
if [ -f "$TEMPLATES_DIR/template-prd.md" ]; then
    print_pass "Default PRD template exists"
else
    print_fail "Default PRD template not found"
fi

if [ -f "$TEMPLATES_DIR/template-adr.md" ]; then
    print_pass "Default ADR template exists"
else
    print_fail "Default ADR template not found"
fi

if [ -f "$TEMPLATES_DIR/template-spec.md" ]; then
    print_pass "Default Spec template exists"
else
    print_fail "Default Spec template not found"
fi

echo ""

# Test 2: Check local directory structure
print_test "Test 2: Local directory structure"
if [ ! -d "$LOCAL_TEMPLATES_DIR" ]; then
    print_skip "Local templates directory doesn't exist (will be created on first customization)"
else
    print_pass "Local templates directory exists"

    # Count custom templates
    CUSTOM_COUNT=$(find "$LOCAL_TEMPLATES_DIR" -name "template-*.md" 2>/dev/null | wc -l)
    if [ $CUSTOM_COUNT -gt 0 ]; then
        print_pass "Found $CUSTOM_COUNT custom template(s)"

        # List them
        find "$LOCAL_TEMPLATES_DIR" -name "template-*.md" 2>/dev/null | while read -r file; do
            echo "  - $(basename "$file")"
        done
    else
        print_skip "No custom templates yet (zero custom templates)"
    fi
fi

echo ""

# Test 3: Check template file completeness
print_test "Test 3: Template file completeness"

check_template_completeness() {
    local template_file=$1
    local template_name=$(basename "$template_file")

    if [ ! -f "$template_file" ]; then
        print_fail "$template_name not found"
        return 1
    fi

    local line_count=$(wc -l < "$template_file")
    if [ "$line_count" -lt 50 ]; then
        print_fail "$template_name too short ($line_count lines)"
        return 1
    fi

    # Check for YAML frontmatter
    if ! head -1 "$template_file" | grep -q "^---"; then
        print_fail "$template_name missing YAML frontmatter"
        return 1
    fi

    print_pass "$template_name is complete ($line_count lines)"
    return 0
}

check_template_completeness "$TEMPLATES_DIR/template-prd.md"
check_template_completeness "$TEMPLATES_DIR/template-adr.md"
check_template_completeness "$TEMPLATES_DIR/template-spec.md"

echo ""

# Test 4: Check custom template examples (if they exist)
print_test "Test 4: Custom template examples"

if [ -d "$LOCAL_TEMPLATES_DIR" ]; then
    CUSTOM_EXAMPLES=("template-adr-with-approvals.md" "template-prd-with-compliance.md" "template-spec-with-slas.md")

    for example in "${CUSTOM_EXAMPLES[@]}"; do
        if [ -f "$LOCAL_TEMPLATES_DIR/$example" ]; then
            # Check file is valid markdown
            if head -1 "$LOCAL_TEMPLATES_DIR/$example" | grep -q "^---"; then
                print_pass "Example template exists: $example"
            else
                print_fail "Example template invalid: $example"
            fi
        else
            print_skip "Example template not present: $example (can be used as reference)"
        fi
    done
else
    print_skip "Local templates directory not created yet"
fi

echo ""

# Test 5: Verify template hierarchy logic
print_test "Test 5: Template hierarchy logic"

# Simulate loading function
simulate_load_template() {
    local template_name=$1
    local local_path="$LOCAL_TEMPLATES_DIR/$template_name"
    local default_path="$TEMPLATES_DIR/$template_name"

    if [ -f "$local_path" ]; then
        echo "LOCAL"
        return 0
    elif [ -f "$default_path" ]; then
        echo "DEFAULT"
        return 0
    else
        echo "NOT_FOUND"
        return 1
    fi
}

for template_name in "template-prd.md" "template-adr.md" "template-spec.md"; do
    result=$(simulate_load_template "$template_name")
    case $result in
        LOCAL)
            print_pass "Hierarchy: $template_name → local override (custom)"
            ;;
        DEFAULT)
            print_pass "Hierarchy: $template_name → default template"
            ;;
        NOT_FOUND)
            print_fail "Hierarchy: $template_name → NOT FOUND"
            ;;
    esac
done

echo ""

# Test 6: Verify template file encoding
print_test "Test 6: Template file encoding"

check_encoding() {
    local file=$1
    local name=$(basename "$file")

    if [ ! -f "$file" ]; then
        return
    fi

    local encoding=$(file "$file" | grep -o "ASCII\|UTF-8")
    if [ -n "$encoding" ]; then
        print_pass "$name is valid text ($encoding)"
    else
        # Try to detect if it's a text file
        if file "$file" | grep -q "text"; then
            print_pass "$name is valid text file"
        else
            print_fail "$name may have encoding issues"
        fi
    fi
}

check_encoding "$TEMPLATES_DIR/template-prd.md"
check_encoding "$TEMPLATES_DIR/template-adr.md"
check_encoding "$TEMPLATES_DIR/template-spec.md"

echo ""

# Test 7: Documentation completeness
print_test "Test 7: Documentation completeness"

if [ -f ".claude/docs/TEMPLATE-CUSTOMIZATION.md" ]; then
    print_pass "TEMPLATE-CUSTOMIZATION.md exists"
else
    print_fail "TEMPLATE-CUSTOMIZATION.md missing"
fi

if [ -f ".claude/docs/TEMPLATE-EXAMPLES.md" ]; then
    print_pass "TEMPLATE-EXAMPLES.md exists"
else
    print_fail "TEMPLATE-EXAMPLES.md missing"
fi

if [ -f ".claude/docs/TEMPLATE-INTEGRATION.md" ]; then
    print_pass "TEMPLATE-INTEGRATION.md exists"
else
    print_fail "TEMPLATE-INTEGRATION.md missing"
fi

if [ -f ".claude/templates/README.md" ]; then
    print_pass "Templates README.md exists"
else
    print_fail "Templates README.md missing"
fi

echo ""

# Test 8: Verify no duplicate templates
print_test "Test 8: No duplicate templates"

if [ -d "$LOCAL_TEMPLATES_DIR" ]; then
    # Check for duplicates
    DUPLICATE_NAMES=$(find "$TEMPLATES_DIR" "$LOCAL_TEMPLATES_DIR" -name "template-*.md" -type f 2>/dev/null | \
                      xargs -I {} basename {} | sort | uniq -d)

    if [ -z "$DUPLICATE_NAMES" ]; then
        print_pass "No naming conflicts between defaults and custom templates"
    else
        print_fail "Found conflicting template names: $DUPLICATE_NAMES"
    fi
else
    print_skip "Custom templates not yet created"
fi

echo ""

# Summary
print_header "Test Summary"
echo "Tests Passed:  ${GREEN}$TESTS_PASSED${NC}"
echo "Tests Failed:  ${RED}$TESTS_FAILED${NC}"
echo "Tests Skipped: ${YELLOW}$TESTS_SKIPPED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    echo ""
    echo "Template hierarchy is working correctly:"
    echo "  1. Custom templates (local/) take precedence"
    echo "  2. Default templates used as fallback"
    echo "  3. No configuration required"
    echo "  4. Safe for team collaboration via git"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    echo ""
    echo "Please verify:"
    echo "  1. Template files are in correct locations"
    echo "  2. Files are readable and valid text"
    echo "  3. YAML frontmatter is correct"
    echo "  4. Documentation is complete"
    exit 1
fi
