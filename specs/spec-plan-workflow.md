# Technical Specification: Plan Domain PRD Workflow

**Version:** 1.0
**Date:** 2025-10-30
**Related ADR:** ADR-001-plan-domain-prd-workflow.md
**Source PRD:** `prd/prd-plan-workflow.md`
**Test Strategy:** TDD with snapshot tests for AI transformations

---

## 1. Overview

This specification defines the technical requirements for extending the VTM CLI plan domain with PRD (Product Requirements Document) creation and transformation capabilities.

**Scope:**
- PRD template generation
- PRD → ADR transformation (AI-powered with section extraction)
- PRD → Spec transformation (AI-powered with section extraction)
- Pair generation orchestration
- Optional PRD validation

**Out of Scope:**
- Modifying existing `/plan:to-vtm` command
- Database storage of PRDs
- Web UI for PRD editing
- Collaboration features

---

## 2. Functional Requirements

### 2.1 `/plan:create-prd {name}` Command

**Purpose:** Generate a new PRD markdown file from structured template

**Command Signature:**
```bash
/plan:create-prd {name} [--template {path}] [--output {directory}]
```

**Arguments:**
- `{name}`: Feature/project slug (e.g., "auth-system")
  - Validation: lowercase alphanumeric + hyphens only
  - Error: reject special characters with helpful message

**Options:**
- `--template {path}`: Custom template path (default: `.claude/templates/prd-template.md`)
- `--output {directory}`: Output directory (default: `prd/`)

**Behavior:**
1. Validate name format
2. Check for existing prd/{name}.md (conflict handling)
3. Read template from path
4. Generate markdown file with:
   - Metadata section (name, date, status, version)
   - Placeholder sections for each required part
   - Guidance comments explaining each section
5. Create prd/ directory if missing
6. Write to prd/{name}.md
7. Output message: "Created prd/{name}.md - Fill in sections and run /plan:to-pair when ready"

**Acceptance Criteria:**
- [x] Creates properly formatted markdown file
- [x] Includes all template sections
- [x] Contains helpful guidance comments
- [x] Handles existing files gracefully (prompt to overwrite or use different name)
- [x] Creates prd/ directory automatically
- [x] Completes in <1 second

**Error Handling:**
- Invalid name → "Name must contain only lowercase letters, numbers, and hyphens"
- Template not found → "Template not found at {path}. Using default."
- No write permission → "Cannot create prd/ directory. Check permissions."

---

### 2.2 `/plan:to-adr {prd-file}` Command

**Purpose:** Generate ADR from PRD using AI-powered transformation with surgical section extraction

**Command Signature:**
```bash
/plan:to-adr {prd-file} [--preview] [--adr-number {N}]
```

**Arguments:**
- `{prd-file}`: Path to PRD file (e.g., "prd/auth-system.md")

**Options:**
- `--preview`: Show generated ADR without saving (default: false)
- `--adr-number {N}`: Explicit ADR number (default: auto-detect next number)

**Behavior:**

1. **Load PRD**
   - Read prd-file
   - Parse markdown structure
   - Validate file exists

2. **Extract Decision Sections**
   - Identify sections matching keywords: "Decision", "Technical", "Architecture", "Technology", "Trade", "Alternative"
   - Extract matched sections + surrounding context
   - Token count: hard limit 1500 tokens
   - Output: compressed decision context

3. **AI Transformation**
   - Launch Claude Code Task agent
   - Prompt: "Extract architectural decisions from this PRD and generate an ADR"
   - Provide extraction as context (not full PRD)
   - Include ADR template structure in prompt
   - Agent generates ADR markdown

4. **Generate Frontmatter**
   - Extract ADR number (auto-increment from existing ADRs)
   - Extract decision title from PRD
   - Generate frontmatter block:
     ```yaml
     ---
     id: ADR-XXX
     title: {Decision Title}
     status: proposed
     date: {today}
     source_prd: prd/{name}.md
     source_sections:
       - section: "## Technical Decisions"
         lines: "42-58"
       - section: "## Trade-offs"
         lines: "67-82"
     ---
     ```

5. **Save or Preview**
   - If `--preview`: Display to stdout
   - If not `--preview`: Write to adr/ADR-XXX-{feature-slug}.md
   - Output message: "Generated adr/ADR-XXX-{feature-slug}.md"

**File Naming Convention:**
- Input: prd/auth-system.md
- Output: adr/ADR-001-auth-system.md (XXX = auto-numbered)

**Acceptance Criteria:**
- [x] Extracts decision-relevant sections correctly
- [x] Achieves 80%+ token reduction (full PRD vs extracted)
- [x] Generates valid ADR with proper structure
- [x] Maintains traceability links to source PRD
- [x] Preview mode works without saving
- [x] Auto-numbering finds next available ADR number
- [x] Completes in 10-15 seconds
- [x] Handles incomplete PRDs gracefully

**Error Handling:**
- File not found → "PRD file not found at {path}"
- No decisions in PRD → "No decision sections detected. Add '## Technical Decisions' to PRD"
- Extraction too short → "PRD too brief for transformation. Add more detail to decision sections"
- ADR number conflict → "ADR-XXX already exists. Use --adr-number to override"

---

### 2.3 `/plan:to-spec {prd-file}` Command

**Purpose:** Generate technical specification from PRD requirements

**Command Signature:**
```bash
/plan:to-spec {prd-file} [--preview] [--name {custom-name}]
```

**Arguments:**
- `{prd-file}`: Path to PRD file (e.g., "prd/auth-system.md")

**Options:**
- `--preview`: Show generated Spec without saving (default: false)
- `--name {custom-name}`: Custom spec name (default: derive from PRD)

**Behavior:**

1. **Load PRD**
   - Read prd-file
   - Validate file exists
   - Extract metadata (name, author)

2. **Extract Requirement Sections**
   - Identify sections: "Requirements", "Acceptance", "Testing", "Edge Cases", "Dependencies"
   - Extract matched sections + context
   - Token count: hard limit 1500 tokens
   - Output: compressed requirement context

3. **AI Transformation**
   - Launch Claude Code Task agent
   - Prompt: "Expand PRD requirements into detailed technical specification with acceptance criteria"
   - Provide extracted requirements (not full PRD)
   - Include Spec template structure
   - Agent generates Spec with:
     - Detailed acceptance criteria (numbered)
     - Test cases for each requirement
     - Implementation notes
     - Edge case handling

4. **Generate Frontmatter**
   - Extract feature name from PRD
   - Derive spec filename from PRD name
   - Generate frontmatter:
     ```yaml
     ---
     title: Technical Specification - {Feature Name}
     version: 1.0
     date: {today}
     source_prd: prd/{name}.md
     related_adr: adr/ADR-XXX-{name}.md
     source_sections:
       - section: "## Requirements"
         lines: "85-120"
       - section: "## Acceptance Criteria"
         lines: "122-135"
     ---
     ```

5. **Save or Preview**
   - If `--preview`: Display to stdout
   - If not `--preview`: Write to specs/spec-{feature-slug}.md
   - Output message: "Generated specs/spec-{feature-slug}.md"

**File Naming Convention:**
- Input: prd/auth-system.md
- Output: specs/spec-auth-system.md

**Acceptance Criteria:**
- [x] Extracts requirement-relevant sections correctly
- [x] Achieves 80%+ token reduction
- [x] Generates detailed acceptance criteria
- [x] Maps test cases to requirements
- [x] Maintains traceability links
- [x] Preview mode without saving
- [x] Completes in 12-18 seconds
- [x] Handles incomplete requirements gracefully

**Error Handling:**
- File not found → "PRD file not found at {path}"
- No requirements → "No requirement sections detected. Add '## Requirements' to PRD"
- Extraction too short → "PRD requirements too brief for expansion"

---

### 2.4 `/plan:to-pair {prd-file}` Command

**Purpose:** Generate both ADR and Spec from single PRD with incremental confirmation

**Command Signature:**
```bash
/plan:to-pair {prd-file} [--auto-save]
```

**Arguments:**
- `{prd-file}`: Path to PRD file

**Options:**
- `--auto-save`: Save both without preview (default: preview each)

**Behavior:**

1. **Generate ADR**
   - Call `/plan:to-adr {prd-file} --preview`
   - Display to user with format:
     ```
     Generated ADR-XXX-{name}:

     {ADR content}

     ✅ Save this ADR? [y/n]
     ```

2. **User Confirmation**
   - If yes: Save to adr/ADR-XXX-{name}.md
   - If no: Stop, don't generate Spec
   - If `--auto-save`: Skip confirmation

3. **Generate Spec**
   - Call `/plan:to-spec {prd-file} --preview`
   - Display to user
   - Same confirmation flow

4. **Completion Message**
   ```
   ✅ Generated both:
   - adr/ADR-XXX-{name}.md
   - specs/spec-{name}.md

   Next: /plan:to-vtm adr/ADR-XXX-{name}.md specs/spec-{name}.md
   ```

**Acceptance Criteria:**
- [x] Generates ADR and Spec in sequence
- [x] Allows user to review each before saving
- [x] Supports auto-save mode for convenience
- [x] Shows next workflow step
- [x] Completes in 25-35 seconds total

**Error Handling:**
- ADR generation fails → Show error, offer to retry or skip Spec generation

---

### 2.5 `/plan:validate-prd {prd-file}` Command (Phase 3)

**Purpose:** Validate PRD structure and content quality

**Command Signature:**
```bash
/plan:validate-prd {prd-file} [--strict]
```

**Validation Rules:**

**Required Sections:**
- [ ] Overview (with Problem Statement, Vision, Success Metrics)
- [ ] Technical Decisions (with Architecture Choices, Technology Selection, Trade-offs)
- [ ] Requirements (with Functional and Non-Functional)
- [ ] Acceptance Criteria

**Content Quality:**
- [ ] No section is empty (has >100 words)
- [ ] Technical Decisions section ≥3 decisions listed
- [ ] Requirements section ≥5 requirements
- [ ] No vague language ("maybe", "probably", "we'll see")
- [ ] Alternatives section has ≥1 rejected alternative with rationale

**Output:**
```
📋 PRD Validation Report: prd/auth-system.md

✅ PASSED (8/10 checks)

Warnings:
⚠️  Alternatives section very brief (1 rejected alternative)
    → Recommend adding more alternatives considered

Suggested Improvements:
📝 Add acceptance criteria for: "Session expires after 30 minutes"
📝 Expand Technical Decisions > Trade-offs section (currently 2 paragraphs, target 3-4)

Ready for transformation? Run: /plan:to-pair prd/auth-system.md
```

**Acceptance Criteria:**
- [x] Identifies missing required sections
- [x] Validates content length and detail
- [x] Detects vague language
- [x] Provides actionable suggestions
- [x] Completes in <2 seconds

---

## 3. Non-Functional Requirements

### 3.1 Token Efficiency

**Requirement:** PRD transformation achieves 80%+ token reduction vs full PRD context

**Measurement:**
```
Reduction = (Full PRD tokens - Extracted tokens) / Full PRD tokens

Example:
- Full PRD: 5000 tokens
- Extracted: 800 tokens
- Reduction: (5000 - 800) / 5000 = 84% ✅
```

**Implementation:**
- Hard limit: 1500 tokens per extraction
- Monitor and log: Full PRD tokens vs extracted tokens
- Alert: If reduction drops below 75%

**Testing:**
- Test with 5 sample PRDs of varying size
- Verify 80%+ reduction on all samples
- Document token counts in test results

---

### 3.2 Performance

**Acceptance Criteria:**

| Command | Target | Threshold |
|---------|--------|-----------|
| `/plan:create-prd` | <1 sec | Template reading + file write |
| `/plan:to-adr` | 10-15 sec | AI latency, includes preview |
| `/plan:to-spec` | 12-18 sec | AI latency, includes preview |
| `/plan:to-pair` | 25-35 sec | Both commands + confirmations |
| `/plan:validate-prd` | <2 sec | Markdown parsing + checks |

**Implementation:**
- Log execution time for each command
- Alert if command exceeds threshold
- Implement content-hash caching to skip repeated transformations

---

### 3.3 Backward Compatibility

**Requirement:** Zero breaking changes to existing functionality

**Testing:**
- [ ] Existing `/plan:to-vtm` works unchanged
- [ ] ADR-first workflow (no PRD) still works
- [ ] Existing VTM files load and work
- [ ] All existing tests pass
- [ ] Git history unaffected

**Implementation:**
- All new commands additive (no deletions)
- No modifications to existing CLI code
- Separate file structure (prd/ directory new)

---

### 3.4 User Experience

**Requirements:**

1. **Clear Documentation**
   - PRD template has guidance comments
   - CLAUDE.md updated with workflow section
   - Examples of good PRDs provided
   - Workflow diagrams in README

2. **Helpful Error Messages**
   - All errors suggest corrective action
   - Example: "No decisions found. Add '## Technical Decisions' section with at least 3 decisions"

3. **Progressive Disclosure**
   - Show basic workflow hints first
   - Advanced options available but not required
   - Skills provide contextual suggestions

4. **Preview Mode**
   - All AI transformations default to `--preview`
   - Users review before committing
   - Clear "Save? [y/n]" prompts
   - Display next workflow step on completion

---

### 3.5 Code Quality

**Requirements:**

| Metric | Target |
|--------|--------|
| Test Coverage | 80%+ |
| TypeScript Type Coverage | 100% |
| ESLint Pass | 100% |
| No Unused Code | 100% |

**Implementation:**
- Unit tests for all extraction logic
- Integration tests for each command
- Snapshot tests for AI outputs (approval-based)
- Pre-commit hooks check coverage before push

---

## 4. Implementation Details

### 4.1 Section Extraction Algorithm

**Input:** PRD markdown content

**Process:**
```typescript
function extractDecisionSections(prd: string): {
  sections: Section[]
  totalTokens: number
  extractedTokens: number
} {
  1. Parse markdown to AST
  2. Identify all headings
  3. Filter headings by keywords:
     - Decision, Technical, Architecture, Technology
     - Trade, Alternative, Constraint, Design
  4. For each matched heading:
     - Extract heading + content until next heading
     - Add context: 100 tokens before + 100 tokens after
  5. Concatenate all matched sections
  6. Count tokens
  7. If > 1500 tokens, truncate with warning
  8. Return compressed content
}
```

**Validation:**
- Extracted sections ≥ 200 tokens (error if less)
- Extracted sections ≤ 1500 tokens (warn if truncated)
- Original PRD ≥ 800 tokens (warn if PRD too small)

---

### 4.2 AI Agent Prompts

**For `/plan:to-adr`:**
```
You are an architecture decision record expert. Given the following
extracted technical decision sections from a PRD, generate a complete ADR.

Structure your ADR with these sections:
1. Context - Why this decision matters
2. Decision - Clear statement of what was decided
3. Rationale - Why this is the right choice
4. Consequences - What changes because of this decision
5. Alternatives Considered - What we rejected and why

Extracted PRD Content:
{extracted_content}

Generate the ADR in markdown format. Be concise and specific.
```

**For `/plan:to-spec`:**
```
You are a technical specification expert. Given the following extracted
requirements from a PRD, generate a detailed technical specification.

Structure your spec with these sections:
1. Overview - What we're building
2. Acceptance Criteria - Numbered criteria (1. 2. 3. ...)
3. Test Cases - For each acceptance criterion
4. Edge Cases - Potential problem scenarios
5. Dependencies - External systems needed

Extracted PRD Content:
{extracted_content}

Generate the spec in markdown format. Make acceptance criteria testable.
```

---

### 4.3 File Structure

**New directories:**
```
project/
├── prd/                          # PRDs (user creates/edits)
│   ├── prd-auth-system.md
│   └── prd-payment-gateway.md
├── adr/                          # ADRs (auto-generated or manual)
│   ├── ADR-001-auth-system.md   # Generated from PRD
│   ├── ADR-002-payment-api.md   # Manual
│   └── ADR-003-session-storage.md
├── specs/                        # Technical specifications
│   ├── spec-auth-system.md      # Generated from PRD
│   ├── spec-payment-gateway.md  # Generated from PRD
│   └── spec-deployment.md       # Manual
├── vtm.json                      # VTM task manifest (unchanged)
└── .claude/
    └── templates/
        └── prd-template.md       # PRD template
```

---

### 4.4 Caching Strategy (Phase 3)

**Purpose:** Avoid re-transforming unchanged PRDs

**Implementation:**
```
Cache Entry:
  Key: SHA256(prd-file-content)
  Value: {
    adr_content: string,
    spec_content: string,
    generated_at: timestamp,
    tokens_used: number
  }
  Location: .vtm-cache/plan-transformations/

Usage:
  1. Compute hash of input PRD
  2. Check if hash exists in cache
  3. If hit: use cached content
  4. If miss: generate new, store in cache
  5. If PRD modified: new hash, old cache invalidated
```

---

## 5. Test Plan

### 5.1 Unit Tests

**Section Extraction:**
- Extract decision sections from various PRD formats
- Verify keyword matching (case-insensitive)
- Verify token counting accuracy
- Verify truncation at 1500 tokens

**Frontmatter Generation:**
- Correct ADR numbering
- Correct file paths
- Line number tracking accuracy

**File Operations:**
- Create prd/ directory if missing
- Handle existing files gracefully
- Proper error messages for permission issues

### 5.2 Integration Tests

**Full Pipelines:**
- PRD creation → to-adr → valid ADR file
- PRD creation → to-spec → valid Spec file
- PRD creation → to-pair → both files
- PRD → ADR + Spec → to-vtm → tasks created

**Error Scenarios:**
- Missing PRD file
- Incomplete PRD (no decisions)
- Existing ADR (naming conflict)
- Invalid file permissions

### 5.3 Snapshot Tests

**AI Outputs:**
- Store sample generated ADRs as snapshots
- Store sample generated Specs as snapshots
- Approval process on first run
- Regression detection on subsequent runs
- Manual review if output differs from snapshot

**Test Data:**
- 5 sample PRDs of varying quality
- 2 edge case PRDs (minimal, very long)

---

## 6. Acceptance Criteria

**Feature Complete When:**

- [ ] PRD template created with all required sections
- [ ] `/plan:create-prd` implemented and tested
- [ ] `/plan:to-adr` implemented with AI transformation
- [ ] `/plan:to-spec` implemented with AI transformation
- [ ] `/plan:to-pair` implemented with incremental workflow
- [ ] 80%+ token efficiency achieved
- [ ] 10-15 second performance for to-adr
- [ ] 12-18 second performance for to-spec
- [ ] Preview mode works for all transformations
- [ ] Backward compatibility verified (zero breaking changes)
- [ ] Three workflow options documented (PRD-first, ADR-first, hybrid)
- [ ] CLAUDE.md updated with PRD workflow
- [ ] Example PRDs provided
- [ ] 80%+ test coverage achieved
- [ ] All ESLint/Prettier checks passing
- [ ] TypeScript strict mode enforced
- [ ] Skills integration complete (plan-expert hints)
- [ ] Git history clean and descriptive commits

---

## 7. Success Metrics

| Metric | Target | How Measured |
|--------|--------|--------------|
| Token Reduction | 80%+ | (Full PRD - Extracted) / Full PRD |
| Time Savings | 70% vs manual | Manual ADR time vs /plan:to-adr time |
| User Satisfaction | 90% | Survey after first use |
| Adoption | 50% within 3 months | Count PRDs created |
| Code Quality | 80%+ coverage | Coverage report |
| Performance | Within targets | Command execution timing |

