# Template Integration Guide

This guide explains how templates integrate with plan domain commands and how to debug template loading.

---

## Overview

### Template Hierarchy

```
Command Request
    ↓
Load Template:
    1. Check .claude/templates/local/template-NAME.md
    2. If found: Use custom template ✅
    3. If not found: Use .claude/templates/template-NAME.md
    ↓
Generate Document
```

### Key Principle

**No code changes needed.** Just create custom template files in the right location.

---

## Command Integration

### `/plan:create-prd`

**Command**: Creates a new Product Requirements Document

**Template Loading**:

1. Looks for: `.claude/templates/local/template-prd.md`
2. Falls back to: `.claude/templates/template-prd.md`
3. Uses first one found

**Usage**:

```bash
/plan:create-prd auth-system "Multi-tenant authentication"
# → Generates auth-system.md using custom or default PRD template
```

**Template File**: `template-prd.md`

**What Gets Generated**:

- YAML frontmatter (title, status, owner, etc.)
- Standard sections (Problem, Users, Scope, Flows, etc.)
- Custom sections (if using custom template)
- Ready to edit and fill in

---

### `/plan:create-adr`

**Command**: Creates a new Architecture Decision Record

**Template Loading**:

1. Looks for: `.claude/templates/local/template-adr.md`
2. Falls back to: `.claude/templates/template-adr.md`
3. Uses first one found

**Usage**:

```bash
/plan:create-adr "OAuth2 authentication" "Should we use OAuth2?"
# → Generates ADR using custom or default template
```

**Template File**: `template-adr.md`

**What Gets Generated**:

- YAML frontmatter (status, owner, related ADRs, etc.)
- Standard sections (Context, Decision, Alternatives, etc.)
- Custom sections (if using custom template)
- Ready for team review

---

### `/plan:create-spec`

**Command**: Creates a new Technical Specification

**Template Loading**:

1. Looks for: `.claude/templates/local/template-spec.md`
2. Falls back to: `.claude/templates/template-spec.md`
3. Uses first one found

**Usage**:

```bash
/plan:create-spec adr/ADR-001.md "Authentication service"
# → Generates spec using custom or default template
```

**Template File**: `template-spec.md`

**What Gets Generated**:

- YAML frontmatter (status, owner, related ADRs, etc.)
- Standard sections (Architecture, Implementation, Tests, etc.)
- Custom sections (if using custom template)
- Task breakdown for VTM ingestion

---

### `/plan:generate-adrs`

**Command**: Generates multiple ADRs from a PRD document

**Template Loading**:

1. Uses `.claude/templates/local/template-adr.md` if it exists
2. Falls back to `.claude/templates/template-adr.md`
3. Applies same template to all generated ADRs

**Usage**:

```bash
/plan:generate-adrs prd/auth.md
# → Generates multiple ADRs, each using the same template
```

**Impact**: All generated ADRs will have custom sections if you've customized the ADR template.

---

## Directory Structure Reference

### Correct Layout

```
.claude/
├── commands/
│   ├── plan/
│   │   ├── create-adr.md
│   │   ├── create-prd.md
│   │   ├── create-spec.md
│   │   └── generate-adrs.md
├── docs/
│   ├── TEMPLATE-CUSTOMIZATION.md
│   ├── TEMPLATE-EXAMPLES.md
│   ├── TEMPLATE-INTEGRATION.md
│   └── CUSTOM-TEMPLATES.md
├── templates/
│   ├── template-adr.md              ← Default ADR
│   ├── template-prd.md              ← Default PRD
│   ├── template-spec.md             ← Default Spec
│   ├── template-command.md          ← Default command
│   └── local/                       ← LOCAL OVERRIDES
│       ├── template-adr.md          ← Custom ADR (if exists)
│       ├── template-prd.md          ← Custom PRD (if exists)
│       └── template-spec.md         ← Custom Spec (if exists)
└── lib/
    └── mcc-config.sh
```

### What Each File Does

| File                     | Purpose               | When Used                  |
| ------------------------ | --------------------- | -------------------------- |
| `template-prd.md`        | Default PRD template  | When no custom PRD exists  |
| `template-adr.md`        | Default ADR template  | When no custom ADR exists  |
| `template-spec.md`       | Default Spec template | When no custom Spec exists |
| `local/template-prd.md`  | Custom PRD override   | When custom PRD exists     |
| `local/template-adr.md`  | Custom ADR override   | When custom ADR exists     |
| `local/template-spec.md` | Custom Spec override  | When custom Spec exists    |

---

## Implementation Details

### Template Loading Logic

```typescript
// Pseudocode showing how templates are loaded

function loadTemplate(templateName: string): string {
  // Example: templateName = "template-prd.md"

  // Step 1: Check local override
  const localPath = `.claude/templates/local/${templateName}`
  if (fileExists(localPath)) {
    return readFile(localPath) // Use custom ✅
  }

  // Step 2: Check default
  const defaultPath = `.claude/templates/${templateName}`
  if (fileExists(defaultPath)) {
    return readFile(defaultPath) // Use default ✅
  }

  // Step 3: Error if not found
  throw new Error(`Template not found: ${templateName}`)
}
```

### Why This Matters

- **Custom templates take precedence** - If both exist, custom is used
- **Fallback is automatic** - No configuration needed
- **Safe** - Defaults always available as fallback
- **Team-friendly** - Custom templates can be committed to git

---

## Debugging Template Issues

### Issue 1: Custom Template Not Being Used

**Symptom**: Running `/plan:create-prd` uses default template, not custom

**Check 1: File exists**

```bash
ls -la .claude/templates/local/template-prd.md
# Should output file details, not "No such file"
```

**Check 2: Filename is exact**

```bash
# For PRD command, must be:
.claude/templates/local/template-prd.md

# For ADR command, must be:
.claude/templates/local/template-adr.md

# For Spec command, must be:
.claude/templates/local/template-spec.md
```

**Check 3: Content is valid**

```bash
# Check YAML frontmatter
head -10 .claude/templates/local/template-prd.md
# Should show valid YAML between --- markers
```

**Solution Steps**:

1. Verify file exists: `ls .claude/templates/local/template-prd.md`
2. Verify spelling matches command (prd, adr, or spec)
3. Verify YAML is valid (between --- lines)
4. Clear any cache: `rm -rf .claude/cache/`
5. Try command again

### Issue 2: File Exists But Not Used

**Symptom**: Custom template file exists, but command uses default content

**Check 1: Template is complete**

```bash
# Count lines - should be several hundred
wc -l .claude/templates/local/template-prd.md

# Check for truncation
tail -20 .claude/templates/local/template-prd.md
# Should show end of file content, not incomplete
```

**Check 2: Encoding is correct**

```bash
# Should be ASCII or UTF-8
file .claude/templates/local/template-prd.md

# Output should show: "ASCII text" or "UTF-8 Unicode text"
```

**Check 3: No hidden characters**

```bash
# Check for byte order marks or hidden characters
od -c .claude/templates/local/template-prd.md | head
# Should show normal characters
```

**Solution Steps**:

1. Copy fresh template: `cp .claude/templates/template-prd.md .claude/templates/local/template-prd.md`
2. Edit in text editor (not word processor)
3. Save as UTF-8 text
4. Test again

### Issue 3: Mixed Content from Both Templates

**Symptom**: Generated file has some custom sections and some default sections mixed

**Check 1: Template is standalone**

```bash
# Custom template should be complete
# Should not reference default template

grep -i "include" .claude/templates/local/template-prd.md
# Should not show file includes or references
```

**Check 2: Fallback behavior**

```bash
# Only one should be used, not both
# If seeing both, might be template chaining issue
```

**Solution**:

- Custom template must be complete and self-contained
- Copy entire default template and modify
- Don't try to "extend" or "include" default template

### Issue 4: Placeholder Text in Generated File

**Symptom**: Generated file shows `[PLACEHOLDER: ...]` markers

**Check**: This is actually normal

```bash
# Placeholders are intentional - for you to fill in
# They show what content to add
```

**Solution**:

1. Open generated file
2. Replace each `[PLACEHOLDER: ...]` with actual content
3. Save file

---

## Testing Template Integration

### Test 1: Verify File Location

```bash
# Check directory structure
tree .claude/templates/

# Should show:
# .claude/templates/
# ├── template-adr.md
# ├── template-prd.md
# ├── template-spec.md
# └── local/
#     ├── template-adr-with-approvals.md
#     ├── template-prd-with-compliance.md
#     └── template-spec-with-slas.md
```

### Test 2: Verify Custom Template Content

```bash
# Check custom PRD template
head -20 .claude/templates/local/template-prd.md | grep customizations

# Should show metadata about customizations
```

### Test 3: Test Command Integration

```bash
# Create test PRD using custom template
/plan:create-prd test-prd "Test description"

# Check output includes custom sections
grep "Security & Compliance" test-prd.md

# If found, custom template is working ✅
# Clean up test file
rm test-prd.md
```

### Test 4: Verify Template Hierarchy

```bash
# Test priority: custom takes precedence

# Scenario 1: Only default exists
rm .claude/templates/local/template-prd.md
/plan:create-prd test1 "Test"
grep -c "Security & Compliance" test1.md
# Should be 0 (using default)

# Scenario 2: Custom added
cp .claude/templates/local/template-prd-with-compliance.md .claude/templates/local/template-prd.md
/plan:create-prd test2 "Test"
grep -c "Security & Compliance" test2.md
# Should be 1+ (using custom)

# Clean up
rm test1.md test2.md
```

---

## Workflow Integration

### Single Command Workflow

```bash
# 1. Create using custom template
/plan:create-prd auth-system "Multi-tenant auth"

# 2. Template automatically includes custom sections
# → Security & Compliance (if custom PRD in use)
# → Approval Status (if custom ADR in use)
# → SLA Requirements (if custom Spec in use)

# 3. Fill in sections
# → Edit generated document
# → Complete custom sections alongside standard ones
```

### Multi-Document Workflow

```bash
# 1. Create PRD with compliance tracking
/plan:create-prd payment "Payment processing"
# → Includes Security & Compliance section

# 2. Generate ADRs from PRD
/plan:generate-adrs prd/payment.md
# → Each ADR includes Approval Status section

# 3. Create implementation specs
/plan:create-spec adr/ADR-001.md
# → Includes SLA Requirements section

# 4. Result: Complete document set with custom sections
```

---

## Configuration

### No Configuration Needed

Unlike some systems, template customization requires **zero configuration**:

- No config files to edit
- No environment variables to set
- No command-line flags
- Just create files in the right location

### Optional: Document Customizations

Create `.claude/docs/CUSTOM-TEMPLATES.md`:

```markdown
# Our Custom Templates

This project uses customized planning templates:

## PRD Template

- **Location**: `.claude/templates/local/template-prd.md`
- **Custom Sections**: Security & Compliance
- **When Used**: All feature PRDs
- **Owner**: Product team

## ADR Template

- **Location**: `.claude/templates/local/template-adr.md`
- **Custom Sections**: Approval Status, Approval Checklist
- **When Used**: All architectural decisions
- **Owner**: Architecture team

## Spec Template

- **Location**: `.claude/templates/local/template-spec.md`
- **Custom Sections**: Service Level Agreements
- **When Used**: All production service specs
- **Owner**: Engineering team

See `.claude/docs/TEMPLATE-EXAMPLES.md` for implementation examples.
```

---

## Common Patterns

### Pattern 1: Team-Wide Customizations

**Setup**:

1. One person creates custom templates
2. Commits to git
3. All team members get them on clone/pull

```bash
# Team member clones repo
git clone <repo>

# Custom templates automatically in place
ls .claude/templates/local/
# Shows custom templates ✅

# Commands use custom templates automatically
/plan:create-prd feature "description"
# Uses custom template ✅
```

### Pattern 2: Project-Specific Customizations

**Setup**:

1. Different projects need different customizations
2. Custom templates in each project's repo
3. Developers get correct templates for their project

```bash
# Project A (compliance-heavy)
git clone <project-a>
# Has custom PRD with compliance tracking

# Project B (fast-moving startup)
git clone <project-b>
# Has simpler, faster template

# Each project's commands work as intended
```

### Pattern 3: Evolution of Customizations

**Timeline**:

```
Month 1: Using default templates
↓
Month 2: Team discovers need for approval tracking
  → Create custom ADR template
  → Commit to git
  → All new ADRs use custom template
↓
Month 3: Add compliance requirement
  → Create custom PRD template
  → Existing PRDs still use default
  → New PRDs use custom template
↓
Month 4: Performance tracking needed
  → Create custom Spec template
  → All three templates now customized
```

---

## Best Practices

### 1. Always Start from Default

```bash
# Good
cp .claude/templates/template-adr.md .claude/templates/local/template-adr.md

# Bad
# Creating custom template from scratch
```

### 2. Document Why

```markdown
---
title: Custom ADR Template
source: .claude/templates/template-adr.md
customizations:
  - Added "Approval Status" section
  - Added "Approval Checklist"
version: 1.0
why: "Team requires formal approval process for architectural decisions"
owner: "Architecture team"
---
```

### 3. Test Before Committing

```bash
# Test custom template works
/plan:create-adr "test decision" "test description"

# Verify custom sections present
grep "Approval Status" test-adr.md

# Clean up
rm test-adr.md

# Only then commit
git add .claude/templates/local/
git commit -m "docs: Add custom templates"
```

### 4. Version Control

```bash
# Commit custom templates
git add .claude/templates/local/template-*.md

# Commit documentation
git add .claude/docs/CUSTOM-TEMPLATES.md

# Document why
git commit -m "docs: Add custom templates

- Approval workflow for ADRs
- Compliance tracking for PRDs
- SLA requirements for specs

See TEMPLATE-EXAMPLES.md for details"
```

### 5. Communicate Changes

```bash
# Announce to team
# Tell them what changed and why
# Point to documentation
```

---

## See Also

- `.claude/docs/TEMPLATE-CUSTOMIZATION.md` - Complete customization guide
- `.claude/docs/TEMPLATE-EXAMPLES.md` - Real-world examples
- `.claude/templates/local/` - Example custom templates
- `CLAUDE.md` - Project overview and commands

---

## Questions?

For issues with template integration:

1. Check directory structure (correct location?)
2. Verify file permissions (readable?)
3. Confirm YAML frontmatter (valid?)
4. Review file encoding (UTF-8?)
5. Test with simple example
6. Check `.claude/docs/TEMPLATE-CUSTOMIZATION.md` troubleshooting section
