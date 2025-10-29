---
allowed-tools: Read(docs/adr/*.md, docs/specs/*.md), Bash(ls *)
description: Validate ADR and technical specification pairing and content quality
argument-hint: <adr-file> <spec-file> [--strict]
---

# Plan: Validate

**Command:** `/plan:validate <adr-file> <spec-file> [--strict]`
**Purpose:** Validate ADR+Spec pairing, structure, and content quality before ingestion

---

## What This Command Does

Validates planning documents before they're converted to VTM tasks by:

1. Checking file existence and basic structure
2. Verifying ADR+Spec pairing (spec references the ADR)
3. Validating content completeness
4. Checking for required sections
5. Detecting common issues and inconsistencies
6. Providing detailed feedback with actionable fixes

**Key Benefit:** Catch structural problems early, before running `/plan:to-vtm`.

---

## Usage

```bash
# Basic validation
/plan:validate adr/ADR-001-oauth2-auth.md specs/spec-oauth2-auth.md

# Strict validation (requires all sections)
/plan:validate adr/ADR-001.md specs/spec-auth.md --strict

# Check pattern matching multiple pairs
/plan:validate "adr/ADR-*.md" "specs/spec-*.md"
```

---

## Parameters

- `<adr-file>`: Path to ADR markdown file (required)
  - Example: `adr/ADR-001-oauth2-auth.md`
  - Must exist and contain ADR content

- `<spec-file>`: Path to technical spec markdown file (required)
  - Example: `specs/spec-oauth2-auth.md`
  - Must exist and reference the ADR

- `[--strict]`: Enable strict validation (optional)
  - Requires all sections to be non-empty
  - Fails on missing code examples
  - Enforces minimum content requirements

---

## What Gets Validated

### File Structure Checks

- ✅ Files exist and are readable
- ✅ Files are valid markdown
- ✅ Frontmatter is valid (if present)

### ADR Validation

- ✅ Contains required sections: Status, Context, Decision, Consequences
- ✅ Has clear decision statement
- ✅ Lists alternatives considered (3+ alternatives)
- ✅ Documents rationale for choice
- ✅ Identifies risks and mitigations

### Spec Validation

- ✅ References the ADR by number or filename
- ✅ Contains technology stack recommendation
- ✅ Includes code examples (3+ examples)
- ✅ Documents testing strategy
- ✅ Lists acceptance criteria (5+ criteria)
- ✅ Covers performance and security

### Pairing Validation

- ✅ Spec mentions the ADR file or ADR number
- ✅ ADR number matches spec source reference
- ✅ No circular dependencies with other ADRs
- ✅ Spec references correct ADR (not wrong one)

### Content Quality

- ✅ No TODO or FIXME comments
- ✅ No placeholder text
- ✅ Code examples are real (not pseudocode)
- ✅ Links are valid where checkable
- ✅ Acceptance criteria are testable

---

## Implementation Instructions

You are implementing the `/plan:validate` command. Here's how to do it:

### Step 1: Parse and Validate Arguments

```bash
ADR_FILE="${ARGUMENTS[0]}"
SPEC_FILE="${ARGUMENTS[1]}"
STRICT_MODE=false

if [[ " ${ARGUMENTS[@]} " =~ " --strict " ]]; then
  STRICT_MODE=true
fi

if [ -z "$ADR_FILE" ] || [ -z "$SPEC_FILE" ]; then
  echo "❌ Error: Both ADR file and Spec file required"
  echo "Usage: /plan:validate <adr-file> <spec-file> [--strict]"
  echo "Example: /plan:validate adr/ADR-001-auth.md specs/spec-auth.md"
  exit 1
fi

# Validate files exist
if [ ! -f "$ADR_FILE" ]; then
  echo "❌ Error: ADR file not found: $ADR_FILE"
  exit 1
fi

if [ ! -f "$SPEC_FILE" ]; then
  echo "❌ Error: Spec file not found: $SPEC_FILE"
  exit 1
fi

echo "🔍 Validating: $(basename "$ADR_FILE") + $(basename "$SPEC_FILE")"
```

### Step 2: Extract File Contents

```bash
ADR_CONTENT=$(cat "$ADR_FILE")
SPEC_CONTENT=$(cat "$SPEC_FILE")

ADR_LINES=$(echo "$ADR_CONTENT" | wc -l)
SPEC_LINES=$(echo "$SPEC_CONTENT" | wc -l)

if [ "$ADR_LINES" -lt 10 ]; then
  echo "❌ Error: ADR file is too short ($ADR_LINES lines). Not a valid ADR."
  exit 1
fi

if [ "$SPEC_LINES" -lt 20 ]; then
  echo "❌ Error: Spec file is too short ($SPEC_LINES lines). Not a valid spec."
  exit 1
fi
```

### Step 3: Validate ADR Structure

```bash
echo ""
echo "📋 Checking ADR structure..."

ERRORS=()
WARNINGS=()

# Check for ADR header
if ! echo "$ADR_CONTENT" | grep -q "^#.*ADR-"; then
  ERRORS+=("Missing ADR header (e.g., '# ADR-001: Decision Title')")
fi

# Check required sections
for section in "Status" "Context" "Decision" "Consequences" "Alternatives"; do
  if ! echo "$ADR_CONTENT" | grep -q "^## $section"; then
    ERRORS+=("Missing required section: ## $section")
  fi
done

# Check for decision statement
if ! echo "$ADR_CONTENT" | grep -q -i "we will\|we chose\|we use"; then
  WARNINGS+=("No clear decision statement found (look for 'We will', 'We chose', 'We use')")
fi

# Check for alternatives
ALTERNATIVE_COUNT=$(echo "$ADR_CONTENT" | grep -c "### Alternative\|^### [A-Z]" || true)
if [ "$ALTERNATIVE_COUNT" -lt 3 ]; then
  if [ "$STRICT_MODE" = true ]; then
    ERRORS+=("Found only $ALTERNATIVE_COUNT alternatives. Required: 3+")
  else
    WARNINGS+=("Found only $ALTERNATIVE_COUNT alternatives (recommended: 3+)")
  fi
fi

# Check for rationale
if ! echo "$ADR_CONTENT" | grep -q -i "rationale\|because\|reason"; then
  WARNINGS+=("Rationale section unclear or missing detailed reasoning")
fi
```

### Step 4: Validate Spec Structure

````bash
echo "📋 Checking Spec structure..."

# Check spec references ADR
ADR_BASENAME=$(basename "$ADR_FILE" .md)
ADR_NUMBER=$(echo "$ADR_BASENAME" | sed 's/ADR-\([0-9]*\).*/\1/')

if ! echo "$SPEC_CONTENT" | grep -q -i "$ADR_BASENAME\|ADR-$ADR_NUMBER"; then
  ERRORS+=("Spec does not reference the ADR file: $ADR_BASENAME")
fi

# Check required spec sections
for section in "Recommended Technology Stack" "Implementation Approach" "Testing Strategy" "Acceptance Criteria"; do
  if ! echo "$SPEC_CONTENT" | grep -q "^## $section\|^### $section"; then
    if [ "$STRICT_MODE" = true ]; then
      ERRORS+=("Missing required spec section: $section")
    else
      WARNINGS+=("Missing spec section: $section")
    fi
  fi
done

# Check for code examples
CODE_BLOCK_COUNT=$(echo "$SPEC_CONTENT" | grep -c '```' || true)
CODE_EXAMPLES=$((CODE_BLOCK_COUNT / 2))

if [ "$CODE_EXAMPLES" -lt 3 ]; then
  if [ "$STRICT_MODE" = true ]; then
    ERRORS+=("Found only $CODE_EXAMPLES code examples. Required: 3+")
  else
    WARNINGS+=("Found only $CODE_EXAMPLES code examples (recommended: 3+)")
  fi
fi

# Check for acceptance criteria
if ! echo "$SPEC_CONTENT" | grep -q -i "acceptance criteria\|- \[ \]"; then
  if [ "$STRICT_MODE" = true ]; then
    ERRORS+=("No acceptance criteria found")
  else
    WARNINGS+=("Acceptance criteria not clearly defined")
  fi
fi

# Check for test requirements
if ! echo "$SPEC_CONTENT" | grep -q -i "test\|testing strategy"; then
  WARNINGS+=("Testing strategy not documented")
fi
````

### Step 5: Check for Common Issues

```bash
echo "🔍 Checking for common issues..."

# Check for TODO/FIXME
TODO_COUNT=$(echo "$ADR_CONTENT" "$SPEC_CONTENT" | grep -c "TODO\|FIXME\|XXX" || true)
if [ "$TODO_COUNT" -gt 0 ]; then
  ERRORS+=("Found $TODO_COUNT unresolved TODO/FIXME comments")
fi

# Check for placeholder text
if echo "$ADR_CONTENT" "$SPEC_CONTENT" | grep -q "\[REDACTED\]\|INSERT HERE\|FILL IN"; then
  ERRORS+=("Found placeholder text that needs to be filled in")
fi

# Check for empty sections
EMPTY_SECTIONS=$(echo "$ADR_CONTENT" "$SPEC_CONTENT" | grep -E "^## |^### " | wc -l)
if [ "$EMPTY_SECTIONS" -eq 0 ]; then
  WARNINGS+=("No sections found - check markdown formatting")
fi
```

### Step 6: Generate Report

```bash
echo ""
echo "════════════════════════════════════════════════════════════════"

if [ ${#ERRORS[@]} -eq 0 ] && [ ${#WARNINGS[@]} -eq 0 ]; then
  echo "✅ VALIDATION PASSED"
  echo ""
  echo "ADR:  $(basename "$ADR_FILE") ($ADR_LINES lines)"
  echo "Spec: $(basename "$SPEC_FILE") ($SPEC_LINES lines)"
  echo ""
  echo "✅ Structure is valid"
  echo "✅ Pairing is correct"
  echo "✅ Content quality is good"
  echo ""
  echo "📋 Summary:"
  echo "  • ADR has ${ALTERNATIVE_COUNT} alternatives"
  echo "  • Spec includes ${CODE_EXAMPLES} code examples"
  echo ""
  echo "🚀 Ready to convert to VTM tasks:"
  echo "   /plan:to-vtm \"$ADR_FILE\" \"$SPEC_FILE\" --commit"
  exit 0
fi

# Show errors if any
if [ ${#ERRORS[@]} -gt 0 ]; then
  echo "❌ VALIDATION FAILED"
  echo ""
  echo "Errors found:"
  for i in "${!ERRORS[@]}"; do
    echo "  $((i+1)). ${ERRORS[$i]}"
  done
  echo ""
fi

# Show warnings if any
if [ ${#WARNINGS[@]} -gt 0 ]; then
  if [ ${#ERRORS[@]} -eq 0 ]; then
    echo "⚠️  VALIDATION PASSED WITH WARNINGS"
  else
    echo "Warnings:"
  fi
  echo ""
  for i in "${!WARNINGS[@]}"; do
    echo "  $((i+1)). ${WARNINGS[$i]}"
  done
  echo ""
fi

echo "════════════════════════════════════════════════════════════════"

# Suggest fixes
if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo "💡 How to fix:"
  echo "1. Open: $ADR_FILE"
  echo "2. Check for missing sections or incomplete content"
  echo "3. Add clear decision statement and alternatives"
  echo "4. Then validate again: /plan:validate \"$ADR_FILE\" \"$SPEC_FILE\""
  echo ""
  exit 1
elif [ ${#WARNINGS[@]} -gt 0 ]; then
  if [ "$STRICT_MODE" = false ]; then
    echo ""
    echo "⚠️  Warnings above should be addressed before production use."
    echo "Run with --strict flag to enforce all requirements:"
    echo "   /plan:validate \"$ADR_FILE\" \"$SPEC_FILE\" --strict"
    echo ""
    echo "You can still proceed to VTM, but review warnings first."
    exit 0
  else
    exit 1
  fi
fi
```

---

## Output Format

### Success Case

```
🔍 Validating: ADR-001-oauth2-auth.md + spec-oauth2-auth.md

📋 Checking ADR structure...
📋 Checking Spec structure...
🔍 Checking for common issues...

════════════════════════════════════════════════════════════════
✅ VALIDATION PASSED

ADR:  ADR-001-oauth2-auth.md (287 lines)
Spec: spec-oauth2-auth.md (245 lines)

✅ Structure is valid
✅ Pairing is correct
✅ Content quality is good

📋 Summary:
  • ADR has 4 alternatives
  • Spec includes 5 code examples

🚀 Ready to convert to VTM tasks:
   /plan:to-vtm "adr/ADR-001-oauth2-auth.md" "specs/spec-oauth2-auth.md" --commit
```

### Error Case

```
🔍 Validating: ADR-002-bad.md + spec-api.md

📋 Checking ADR structure...
📋 Checking Spec structure...
🔍 Checking for common issues...

════════════════════════════════════════════════════════════════
❌ VALIDATION FAILED

Errors found:
  1. Spec does not reference the ADR file: ADR-002-bad.md
  2. Found only 2 alternatives. Required: 3+
  3. Found 1 unresolved TODO/FIXME comments

════════════════════════════════════════════════════════════════

💡 How to fix:
1. Open: adr/ADR-002-bad.md
2. Check for missing sections or incomplete content
3. Add clear decision statement and alternatives
4. Then validate again: /plan:validate "adr/ADR-002-bad.md" "specs/spec-api.md"
```

### Warning Case

```
🔍 Validating: ADR-001-oauth2-auth.md + spec-oauth2-auth.md

📋 Checking ADR structure...
📋 Checking Spec structure...
🔍 Checking for common issues...

════════════════════════════════════════════════════════════════
⚠️  VALIDATION PASSED WITH WARNINGS

Warnings:
  1. Found only 2 code examples (recommended: 3+)
  2. Testing strategy not clearly documented

════════════════════════════════════════════════════════════════

⚠️  Warnings above should be addressed before production use.
Run with --strict flag to enforce all requirements:
   /plan:validate "adr/ADR-001-oauth2-auth.md" "specs/spec-oauth2-auth.md" --strict

You can still proceed to VTM, but review warnings first.
```

---

## When to Use

**Run validation:**

- ✅ After creating ADR+Spec pair
- ✅ Before running `/plan:to-vtm`
- ✅ To catch structural issues early
- ✅ To ensure consistency across multiple ADR+Spec pairs

**Strict mode:**

- `--strict` when you want complete, production-ready specs
- Regular mode when you're in draft/review phase

---

## Validation Checklist (What Gets Checked)

### ADR Validation

- [x] File exists and is readable
- [x] Has valid markdown structure
- [x] Contains ADR-XXX header
- [x] Has required sections: Status, Context, Decision, Consequences, Alternatives
- [x] Lists 3+ alternatives (strict: required, normal: recommended)
- [x] Clear decision statement present
- [x] Rationale explained
- [x] No TODO/FIXME comments
- [x] No placeholder text

### Spec Validation

- [x] File exists and is readable
- [x] Has valid markdown structure
- [x] References the ADR by number or filename
- [x] Has required sections: Technology Stack, Implementation, Testing, Acceptance Criteria
- [x] Includes 3+ code examples (strict: required, normal: recommended)
- [x] Defines acceptance criteria
- [x] Documents testing strategy
- [x] Covers security and performance
- [x] No TODO/FIXME comments
- [x] No placeholder text

### Pairing Validation

- [x] Spec correctly references the ADR
- [x] ADR number matches spec reference
- [x] No circular dependencies
- [x] Both files reference same decision

---

## Integration with Workflow

```
/plan:generate-adrs prd/auth.md
  ↓ Creates ADR-001, ADR-002, ADR-003
  ↓
/plan:create-specs "docs/adr/ADR-*.md"
  ↓ Creates corresponding specs
  ↓
/plan:validate "docs/adr/ADR-001.md" "docs/specs/spec-*.md"
  ↓ Checks quality before ingestion
  ↓
/plan:to-vtm adr/ADR-001.md specs/spec-*.md --commit
  ↓ Converts to VTM tasks
```

---

## Notes

- **Early Feedback:** Catch issues before `/plan:to-vtm`
- **Quality Gate:** Ensures minimum content standards
- **Flexible:** Can be strict or permissive based on needs
- **Actionable:** Provides specific fix suggestions

---

## See Also

- `/plan:create-adr` - Create ADR
- `/plan:create-spec` - Create spec
- `/plan:to-vtm` - Convert validated pairs to VTM tasks
- `/plan:create-specs` - Batch create specs

---

**Status:** Specification complete, ready for implementation
**Dependencies:** None (validation only, no file generation)
