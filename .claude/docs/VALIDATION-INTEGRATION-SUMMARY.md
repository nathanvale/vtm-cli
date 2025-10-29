# Phase 1 Integration Task 1: Summary

## Implementation Complete

Successfully integrated validation logic into all four plan domain commands using TDD approach.

---

## Commands Updated

### 1. `/plan:create-adr` - ADR Creation with Related ADR Validation

**Validation Added:**

- ✅ Validates related ADRs exist (if `--related-adrs` flag provided)
- ✅ Checks ADR structure (header, Status, Context, Decision sections)
- ✅ Warns about missing sections in related ADRs
- ✅ Counts validation warnings and reports them

**Example Error Messages:**

```bash
⚠️  Warning: Related ADR not found: ADR-999
   This ADR will be referenced but doesn't exist yet

⚠️  Warning: ADR-002 missing ADR header (e.g., '# ADR-001: Title')

⚠️  Warning: ADR-003 missing sections: Status Context

⚠️  Found 3 warning(s) in related ADRs
   You can still proceed, but review the warnings above
```

**Location:** `.claude/commands/plan/create-adr.md` lines 101-150

---

### 2. `/plan:generate-adrs` - PRD to ADR Generation with PRD Validation

**Validation Added:**

- ✅ Validates PRD has `spec_type: prd` frontmatter
- ✅ Checks minimum content length (10+ lines)
- ✅ Detects decision-making content (decision, approach, strategy keywords)
- ✅ Warns about missing recommended sections (Problem, Users, Scope, Technical, Requirements)
- ✅ Provides clear error messages with examples

**Example Error Messages:**

```bash
❌ Error: PRD file appears too short (5 lines, recommended: 10+)
   PRD files should contain substantial planning content

⚠️  Warning: PRD may not contain explicit architectural decisions
   ADR generation works best when PRD includes decision points
   Example: 'Decision: Use OAuth2 for authentication'

⚠️  Warning: PRD missing recommended sections: Technical, Requirements
   ADRs may have limited context without these sections

✅ PRD validation passed
   File: prd/auth-system.md
   Lines: 45
```

**Location:** `.claude/commands/plan/generate-adrs.md` lines 77-141

---

### 3. `/plan:create-spec` - Spec Creation with ADR Structure Validation

**Validation Added:**

- ✅ Validates ADR has proper header (`# ADR-001: Title`)
- ✅ Checks for all required ADR sections (Status, Context, Decision, Consequences)
- ✅ Counts alternatives and warns if < 3
- ✅ Checks for clear decision statement in Decision section
- ✅ Exits with error if ADR structure is invalid

**Example Error Messages:**

```bash
❌ Error: File does not appear to be an ADR
   Missing ADR header (e.g., '# ADR-001: Title')

💡 Example: /plan:create-spec docs/adr/ADR-001-auth.md

❌ Error: ADR missing required sections: Status, Consequences
   ADRs must have Status, Context, Decision, and Consequences sections

💡 Use /plan:create-adr to create a properly structured ADR

⚠️  Warning: ADR has only 2 alternatives (recommended: 3+)
   Spec will have limited context about alternatives considered

⚠️  Warning: Decision section may not have a clear decision statement
   Example: 'We will use OAuth2 for authentication'

✅ ADR validation passed
   File: docs/adr/ADR-001-auth.md
   Alternatives: 4
```

**Location:** `.claude/commands/plan/create-spec.md` lines 87-143

---

### 4. `/plan:to-vtm` - VTM Task Generation with ADR+Spec Pairing Validation

**Validation Added:**

- ✅ Validates file paths contain correct directories (`/adr/` and `/spec/`)
- ✅ Checks ADR has proper header
- ✅ Validates Spec references the ADR (prevents mismatched pairs)
- ✅ Checks ADR has all required sections
- ✅ Warns about missing code examples in Spec
- ✅ Warns about missing Acceptance Criteria in Spec

**Example Error Messages:**

```bash
❌ Error: File not found
  ADR: docs/adr/missing.md
  Spec: docs/specs/spec-auth.md

💡 Example: /plan:to-vtm docs/adr/ADR-001-auth.md docs/specs/spec-auth.md

❌ Error: First argument must be an ADR file
   Path should contain /adr/ directory

❌ Error: First file does not appear to be an ADR
   Missing ADR header (e.g., '# ADR-001: Title')

💡 Use /plan:create-adr to create a properly structured ADR

❌ Error: Spec does not reference the ADR
   docs/specs/spec-auth.md does not mention ADR-001-profile.md

   This prevents accidental pairing of unrelated ADR+Spec files.
   The spec should reference the ADR it implements.

💡 Fix: Add a reference to the ADR in the spec file:
   Example: "Implements ADR-001-profile.md"

❌ Error: ADR missing required sections: Status, Consequences
   Task extraction requires complete ADR structure

⚠️  Warning: Spec has no code examples
   Task context will be limited without code examples

⚠️  Warning: Spec missing Acceptance Criteria section
   Tasks may not have clear completion criteria

✅ File validation passed
   ADR: docs/adr/ADR-001-auth.md
   Spec: docs/specs/spec-auth.md
   Pairing: Valid (spec references ADR-001)
```

**Location:** `.claude/commands/plan/to-vtm.md` lines 77-178

---

## Test Script Created

**File:** `.claude/scripts/test-plan-validators.sh`

**Test Coverage:**

- ✅ Test 1: ADR Structure Validation (7 tests)
- ✅ Test 2: PRD Structure Validation (4 tests)
- ✅ Test 3: Spec Structure Validation (4 tests)
- ✅ Test 4: ADR+Spec Pairing Validation (2 tests)
- ✅ Test 5: File Path Validation (2 tests)
- ✅ Test 6: Quality Checks/Warnings (2 tests)

**Total: 21 tests, all passing**

**Run tests:**

```bash
./.claude/scripts/test-plan-validators.sh
```

---

## Validation Logic Summary

### ADR Validation

**Required Elements:**

- Header format: `# ADR-001: Decision Title`
- Required sections: Status, Context, Decision, Consequences
- Recommended: 3+ alternatives

**Usage:**

- `/plan:create-adr` validates related ADRs
- `/plan:create-spec` validates input ADR
- `/plan:to-vtm` validates ADR structure and pairing

### PRD Validation

**Required Elements:**

- Frontmatter: `spec_type: prd`
- Minimum length: 10+ lines
- Decision content: keywords like "decision", "approach", "strategy"

**Recommended Sections:**

- Problem, Users, Scope, Technical, Requirements

**Usage:**

- `/plan:generate-adrs` validates input PRD

### Spec Validation

**Required Elements:**

- Must reference an ADR (contains `ADR-XXX` or ADR filename)

**Recommended Elements:**

- Code examples (2+ code blocks)
- Acceptance Criteria section

**Usage:**

- `/plan:to-vtm` validates spec content quality

### ADR+Spec Pairing Validation

**Pairing Rules:**

- First arg must contain `/adr/` directory
- Second arg must contain `/spec/` directory
- Spec must reference the ADR by filename or ID
- Prevents accidental pairing of unrelated documents

**Usage:**

- `/plan:to-vtm` validates pairing before task extraction

---

## Error Message Design Principles

All validation messages follow these patterns:

**Errors (❌):** Block execution, require fix

- Clear description of what's wrong
- Where the problem is (file, section)
- How to fix it with examples
- Related command suggestions

**Warnings (⚠️):** Allow execution, but inform user

- What's missing or suboptimal
- Why it matters
- Recommended improvements
- Can proceed but with limitations

**Success (✅):** Confirm validation passed

- What was validated
- Key metrics (line count, alternatives count, etc.)
- Next steps if applicable

**Examples (💡):** Show correct usage

- Always provide concrete examples
- Use realistic file paths
- Show the exact command syntax

---

## Integration Points with Validator Libraries

These command validations leverage the same logic as the TypeScript validator libraries:

**`src/lib/plan-validators.ts`:**

- `validateAdrFile()` - ADR structure validation
- `validatePrdFile()` - PRD structure validation
- `validateSpecFile()` - Spec structure validation
- `validateAdrSpecPair()` - Pairing validation

**`src/lib/adr-spec-validator.ts`:**

- `validateAdrStructure()` - Comprehensive ADR validation
- `validateSpecStructure()` - Comprehensive spec validation
- `validatePairing()` - ADR+Spec relationship validation
- `validateContentQuality()` - Quality checks (TODOs, placeholders)

The command implementations use bash/JavaScript logic that mirrors the TypeScript APIs, ensuring consistency between CLI validation and library validation.

---

## Files Modified

1. `.claude/commands/plan/create-adr.md`
2. `.claude/commands/plan/generate-adrs.md`
3. `.claude/commands/plan/create-spec.md`
4. `.claude/commands/plan/to-vtm.md`

## Files Created

1. `.claude/scripts/test-plan-validators.sh`
2. `.claude/docs/VALIDATION-INTEGRATION-SUMMARY.md` (this file)

---

## Testing Strategy

### Manual Testing

Each command can be tested manually:

```bash
# Test create-adr with invalid related ADR
/plan:create-adr "test decision" --related-adrs=ADR-999

# Test generate-adrs with invalid PRD
/plan:generate-adrs docs/prd/empty.md

# Test create-spec with invalid ADR
/plan:create-spec docs/adr/invalid.md

# Test to-vtm with mismatched pair
/plan:to-vtm docs/adr/ADR-001.md docs/specs/spec-wrong.md
```

### Automated Testing

Run the test script:

```bash
./.claude/scripts/test-plan-validators.sh
```

All 21 tests pass successfully.

---

## Next Steps

### Phase 1 Remaining Tasks:

- ✅ **Task 1: Wire validators into plan commands** (COMPLETE)
- ⏸ Task 2: Update plan command documentation with validation behavior
- ⏸ Task 3: Add validation examples to command help text
- ⏸ Task 4: Create validation troubleshooting guide

### Phase 2: Integration with VTM CLI

- Add validation CLI commands (`vtm validate adr`, `vtm validate spec`, etc.)
- Wire validators into VTM ingest process
- Add validation to VTM summary output

---

## Success Criteria Met

✅ All 4 command files updated with validation
✅ Clear error messages with examples
✅ Early exit on validation failure
✅ Test script created and passing (21/21 tests)
✅ Documentation updated (this summary)

---

**Status:** Phase 1 Integration Task 1 Complete
**Date:** 2025-10-30
**Test Results:** 21/21 passing
