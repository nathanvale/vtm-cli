#!/bin/bash
# ============================================================================
# MCC Verification Script
# ============================================================================
# Verify that all MCC infrastructure is in place and working correctly
# Usage: bash .claude/lib/verify-mcc.sh
# ============================================================================

set -e

echo "🔍 MCC Infrastructure Verification"
echo "===================================="
echo ""

ERRORS=0
WARNINGS=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check function
check_file() {
    local file="$1"
    local description="$2"
    
    if [[ -f "$file" ]]; then
        echo -e "${GREEN}✅${NC} $description"
        return 0
    else
        echo -e "${RED}❌${NC} $description - NOT FOUND: $file"
        ((ERRORS++))
        return 1
    fi
}

check_dir() {
    local dir="$1"
    local description="$2"
    
    if [[ -d "$dir" ]]; then
        echo -e "${GREEN}✅${NC} $description"
        return 0
    else
        echo -e "${YELLOW}⚠️${NC} $description - NOT FOUND: $dir"
        ((WARNINGS++))
        return 1
    fi
}

check_syntax() {
    local file="$1"
    local description="$2"
    
    if bash -n "$file" 2>/dev/null; then
        echo -e "${GREEN}✅${NC} $description (syntax OK)"
        return 0
    else
        echo -e "${RED}❌${NC} $description (syntax error)"
        ((ERRORS++))
        return 1
    fi
}

# ============================================================================
# VERIFY FILES
# ============================================================================

echo -e "${BLUE}=== Master Commands ===${NC}"
check_file ".claude/commands/design-domain.md" "Design domain command"
check_file ".claude/commands/scaffold-domain.md" "Scaffold domain command"
check_file ".claude/commands/registry-scan.md" "Registry scan command"
echo ""

echo -e "${BLUE}=== Utility Libraries ===${NC}"
check_file ".claude/lib/mcc-utils.sh" "Core utilities"
check_syntax ".claude/lib/mcc-utils.sh" "mcc-utils.sh"
check_file ".claude/lib/mcc-config.sh" "Configuration module"
check_syntax ".claude/lib/mcc-config.sh" "mcc-config.sh"
echo ""

echo -e "${BLUE}=== Documentation ===${NC}"
check_file ".claude/MCC-QUICKSTART.md" "Quick start guide"
check_file ".claude/MCC-INDEX.md" "File index"
check_file ".claude/MCC-INFRASTRUCTURE-SUMMARY.md" "Infrastructure summary"
check_file ".claude/lib/MCC-INTEGRATION.md" "Integration guide"
check_file ".claude/SPEC-minimum-composable-core.md" "Full specification"
check_file ".claude/commands/README.md" "Commands guide"
echo ""

echo -e "${BLUE}=== Templates ===${NC}"
check_file ".claude/templates/template-command.md" "Command template"
echo ""

echo -e "${BLUE}=== Example Data ===${NC}"
check_file ".claude/designs/example-pm.json" "Example design"
echo ""

echo -e "${BLUE}=== Directories ===${NC}"
check_dir ".claude/designs" "Designs directory"
check_dir ".claude/commands" "Commands directory"
check_dir ".claude/lib" "Libraries directory"
check_dir ".claude/templates" "Templates directory"
echo ""

# ============================================================================
# VERIFY CONTENTS
# ============================================================================

echo -e "${BLUE}=== Content Verification ===${NC}"

# Check utilities has key functions
if grep -q "validate_domain_name" ".claude/lib/mcc-utils.sh"; then
    echo -e "${GREEN}✅${NC} mcc-utils.sh has validate_domain_name"
else
    echo -e "${RED}❌${NC} mcc-utils.sh missing validate_domain_name"
    ((ERRORS++))
fi

if grep -q "section()" ".claude/lib/mcc-utils.sh"; then
    echo -e "${GREEN}✅${NC} mcc-utils.sh has section function"
else
    echo -e "${RED}❌${NC} mcc-utils.sh missing section function"
    ((ERRORS++))
fi

# Check config has key variables
if grep -q "CLAUDE_DIR=" ".claude/lib/mcc-config.sh"; then
    echo -e "${GREEN}✅${NC} mcc-config.sh defines CLAUDE_DIR"
else
    echo -e "${RED}❌${NC} mcc-config.sh missing CLAUDE_DIR"
    ((ERRORS++))
fi

if grep -q "SUPPORTED_SYSTEMS=" ".claude/lib/mcc-config.sh"; then
    echo -e "${GREEN}✅${NC} mcc-config.sh defines SUPPORTED_SYSTEMS"
else
    echo -e "${RED}❌${NC} mcc-config.sh missing SUPPORTED_SYSTEMS"
    ((ERRORS++))
fi

# Check commands have required sections
if grep -q "allowed-tools:" ".claude/commands/design-domain.md"; then
    echo -e "${GREEN}✅${NC} design-domain.md has frontmatter"
else
    echo -e "${RED}❌${NC} design-domain.md missing frontmatter"
    ((ERRORS++))
fi

if grep -q "allowed-tools:" ".claude/commands/scaffold-domain.md"; then
    echo -e "${GREEN}✅${NC} scaffold-domain.md has frontmatter"
else
    echo -e "${RED}❌${NC} scaffold-domain.md missing frontmatter"
    ((ERRORS++))
fi

if grep -q "allowed-tools:" ".claude/commands/registry-scan.md"; then
    echo -e "${GREEN}✅${NC} registry-scan.md has frontmatter"
else
    echo -e "${RED}❌${NC} registry-scan.md missing frontmatter"
    ((ERRORS++))
fi

echo ""

# ============================================================================
# VERIFY JSON
# ============================================================================

echo -e "${BLUE}=== JSON Validation ===${NC}"

if command -v python3 &> /dev/null; then
    if python3 -m json.tool ".claude/designs/example-pm.json" > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} example-pm.json is valid JSON"
    else
        echo -e "${RED}❌${NC} example-pm.json has invalid JSON"
        ((ERRORS++))
    fi
else
    echo -e "${YELLOW}⚠️${NC} python3 not available for JSON validation"
    ((WARNINGS++))
fi

echo ""

# ============================================================================
# SUMMARY
# ============================================================================

echo -e "${BLUE}=== Verification Summary ===${NC}"
echo ""

if [[ $ERRORS -eq 0 ]]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "MCC Infrastructure Status: READY FOR USE"
    echo ""
    echo "Next steps:"
    echo "  1. Read: .claude/MCC-QUICKSTART.md"
    echo "  2. Run: /design:domain pm 'Project Management'"
    echo "  3. Run: /scaffold:domain pm"
    echo "  4. Run: /registry:scan"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found${NC}"
    if [[ $WARNINGS -gt 0 ]]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s)${NC}"
    fi
    echo ""
    echo "Please fix the errors above and run again."
    exit 1
fi
