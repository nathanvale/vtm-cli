# Template Customization - Quick Reference Guide

## TL;DR - Quick Start

### Want Custom Templates? (5 minutes)

```bash
# 1. Copy example template
cp .claude/templates/local/template-prd-with-compliance.md \
   .claude/templates/local/template-prd.md

# 2. Test it works
/plan:create-prd test-feature "test"
grep "Security & Compliance" test-feature.md
rm test-feature.md

# 3. Commit to git
git add .claude/templates/local/
git commit -m "docs: Add custom PRD template with compliance"
git push

# 4. Done! Team gets custom templates automatically
```

---

## Template Directory Structure

```
.claude/templates/
├── template-prd.md          ← Default PRD
├── template-adr.md          ← Default ADR
├── template-spec.md         ← Default Spec
└── local/                   ← Custom overrides (YOUR CUSTOMIZATIONS HERE)
    ├── template-adr-with-approvals.md     (example)
    ├── template-prd-with-compliance.md    (example)
    └── template-spec-with-slas.md         (example)
```

---

## Command to Template Mapping

| Command               | Template         | Location (Priority) |
| --------------------- | ---------------- | ------------------- |
| `/plan:create-prd`    | template-prd.md  | local/ → default    |
| `/plan:create-adr`    | template-adr.md  | local/ → default    |
| `/plan:create-spec`   | template-spec.md | local/ → default    |
| `/plan:generate-adrs` | template-adr.md  | local/ → default    |

**Legend**: `local/ → default` means "local first, fall back to default"

---

## Example Templates Provided

### 1. ADR with Approvals

**File**: `.claude/templates/local/template-adr-with-approvals.md`

**What it adds**:

- Approval Status section
- Approval Checklist (architecture, security, team, executive)
- Sign-off tracking

**Use when**: Team requires formal approval for decisions

**Activate**:

```bash
cp .claude/templates/local/template-adr-with-approvals.md \
   .claude/templates/local/template-adr.md
```

### 2. PRD with Compliance

**File**: `.claude/templates/local/template-prd-with-compliance.md`

**What it adds**:

- Data Classification (Public/Internal/Confidential/Restricted)
- Compliance Standards (GDPR, CCPA, HIPAA, SOC 2)
- Security Review & Approval tracking
- Risk Assessment

**Use when**: Company operates in regulated industry

**Activate**:

```bash
cp .claude/templates/local/template-prd-with-compliance.md \
   .claude/templates/local/template-prd.md
```

### 3. Spec with SLAs

**File**: `.claude/templates/local/template-spec-with-slas.md`

**What it adds**:

- Service Level Agreements
- Availability targets (uptime %)
- Performance metrics (latency, throughput)
- Support SLAs (response times)
- Data durability and backup targets

**Use when**: Service has uptime/performance commitments

**Activate**:

```bash
cp .claude/templates/local/template-spec-with-slas.md \
   .claude/templates/local/template-spec.md
```

---

## How It Works

### 1. Default Behavior

```bash
/plan:create-prd my-feature "desc"
# → Uses .claude/templates/template-prd.md (default)
# → Result: Standard PRD with no custom sections
```

### 2. With Custom Template

```bash
# After copying custom template to local/
/plan:create-prd my-feature "desc"
# → Uses .claude/templates/local/template-prd.md (custom)
# → Result: PRD with custom sections added
```

### 3. Delete Custom, Use Default Again

```bash
rm .claude/templates/local/template-prd.md
/plan:create-prd my-feature "desc"
# → Falls back to .claude/templates/template-prd.md (default)
```

---

## Common Tasks

### Add Approval Workflow to ADRs

```bash
# 1. Copy example
cp .claude/templates/local/template-adr-with-approvals.md \
   .claude/templates/local/template-adr.md

# 2. Test
/plan:generate-adrs some-prd.md
# Check generated ADR for "Approval Status" section

# 3. Commit
git add .claude/templates/local/template-adr.md
git commit -m "docs: Add approval workflow to ADR template"
git push

# 4. Team gets it automatically on next pull
```

### Add Compliance Tracking to PRDs

```bash
# 1. Copy example
cp .claude/templates/local/template-prd-with-compliance.md \
   .claude/templates/local/template-prd.md

# 2. Test
/plan:create-prd payment "payment processing"
# Check generated PRD for "Security & Compliance" section

# 3. Commit
git add .claude/templates/local/template-prd.md
git commit -m "docs: Add compliance tracking to PRD template"

# 4. Team gets it
```

### Add SLA Requirements to Specs

```bash
# 1. Copy example
cp .claude/templates/local/template-spec-with-slas.md \
   .claude/templates/local/template-spec.md

# 2. Test
/plan:create-spec adr/ADR-001.md "auth-service"
# Check generated spec for "Service Level Agreements" section

# 3. Commit
git add .claude/templates/local/template-spec.md
git commit -m "docs: Add SLA requirements to spec template"

# 4. Team gets it
```

### Revert to Defaults

```bash
# Delete all custom templates
rm .claude/templates/local/template-*.md

# Commands now use defaults
/plan:create-prd feature "desc"
# Uses default template again
```

---

## Troubleshooting

### Custom template not being used?

**Check 1: File exists**

```bash
ls .claude/templates/local/template-prd.md
# Should show file
```

**Check 2: Filename correct**

```bash
# Must be exactly:
# .claude/templates/local/template-prd.md    (for PRD)
# .claude/templates/local/template-adr.md    (for ADR)
# .claude/templates/local/template-spec.md   (for Spec)
```

**Check 3: Content is complete**

```bash
# Should be 100+ lines
wc -l .claude/templates/local/template-prd.md
```

**Check 4: YAML is valid**

```bash
# First 5 lines should show valid YAML
head -5 .claude/templates/local/template-prd.md
# Should start with: ---
```

### Template has syntax errors?

**Solution**: Copy fresh from example

```bash
cp .claude/templates/local/template-prd-with-compliance.md \
   .claude/templates/local/template-prd.md
```

---

## Best Practices

✅ **DO**:

- Start with provided examples
- Copy defaults, then edit
- Document why you customized
- Commit to git
- Test before sharing

❌ **DON'T**:

- Create templates from scratch
- Delete important sections
- Add placeholders without filling them in
- Use non-text editors (MS Word, etc.)
- Share without documentation

---

## Documentation Reference

| Document                      | Purpose                                  | Length |
| ----------------------------- | ---------------------------------------- | ------ |
| `TEMPLATE-CUSTOMIZATION.md`   | **Complete guide** - all features        | 13 KB  |
| `TEMPLATE-EXAMPLES.md`        | **Real-world examples** - use cases      | 18 KB  |
| `TEMPLATE-INTEGRATION.md`     | **Technical details** - how it works     | 15 KB  |
| `TEMPLATE-QUICK-REFERENCE.md` | **This document** - quick answers        | 2 KB   |
| `.claude/templates/README.md` | **Directory guide** - templates overview | 13 KB  |

**Pick your document**:

- **Just want to customize?** → This file (TEMPLATE-QUICK-REFERENCE.md)
- **Want real examples?** → TEMPLATE-EXAMPLES.md
- **Need technical details?** → TEMPLATE-INTEGRATION.md
- **Complete reference?** → TEMPLATE-CUSTOMIZATION.md
- **Directory overview?** → `.claude/templates/README.md`

---

## Testing Your Setup

### Test Script

```bash
# Run automated tests
./.claude/scripts/test-template-hierarchy.sh

# Output shows:
# ✅ Defaults exist
# ✅ Custom templates in place
# ✅ Hierarchy works
# ✅ Documentation complete
```

### Manual Test

```bash
# Create test file
/plan:create-prd test-feature "test"

# Check for custom section
grep "Security & Compliance" test-feature.md
# If found: ✅ Custom template working
# If not found: Using default template

# Cleanup
rm test-feature.md
```

---

## One-Minute Examples

### Example 1: Add Compliance to PRDs (60 seconds)

```bash
# Copy example
cp .claude/templates/local/template-prd-with-compliance.md \
   .claude/templates/local/template-prd.md

# Test it
/plan:create-prd test "test"; grep "Security & Compliance" test.md; rm test.md

# Commit
git add .claude/templates/local/template-prd.md
git commit -m "docs: Add compliance to PRD"

# Done! All PRDs now include compliance sections
```

### Example 2: Add Approvals to ADRs (60 seconds)

```bash
cp .claude/templates/local/template-adr-with-approvals.md \
   .claude/templates/local/template-adr.md

/plan:create-adr "test" "test"; grep "Approval Status" test-adr.md; rm test-adr.md

git add .claude/templates/local/template-adr.md
git commit -m "docs: Add approval workflow to ADR"

# Done! All ADRs now include approval tracking
```

### Example 3: Add SLAs to Specs (60 seconds)

```bash
cp .claude/templates/local/template-spec-with-slas.md \
   .claude/templates/local/template-spec.md

/plan:create-spec adr/test.md "test"; grep "Service Level" test-spec.md; rm test-spec.md

git add .claude/templates/local/template-spec.md
git commit -m "docs: Add SLA requirements to spec"

# Done! All specs now include SLA sections
```

---

## Key Principles

1. **Priority**: Custom templates override defaults (local/ first)
2. **Safety**: Defaults always available as fallback
3. **Simplicity**: No configuration or code changes needed
4. **Team-friendly**: Can be shared via git
5. **Automatic**: Commands find templates automatically
6. **Extensible**: Easy to add more customizations

---

## Quick Links

- **Main Guide**: `.claude/docs/TEMPLATE-CUSTOMIZATION.md`
- **Examples**: `.claude/docs/TEMPLATE-EXAMPLES.md`
- **Technical**: `.claude/docs/TEMPLATE-INTEGRATION.md`
- **Directory**: `.claude/templates/README.md`
- **Test Script**: `./.claude/scripts/test-template-hierarchy.sh`

---

## Support

**Having issues?**

1. Check `.claude/docs/TEMPLATE-INTEGRATION.md` → "Debugging Template Issues"
2. Run: `./.claude/scripts/test-template-hierarchy.sh`
3. Read: `.claude/docs/TEMPLATE-CUSTOMIZATION.md` → "Troubleshooting"

---

## Summary

- **3 example templates** provided (approvals, compliance, SLAs)
- **4 documentation files** (guides, examples, integration, quick ref)
- **Test script** to verify setup
- **Zero configuration** needed
- **Git-friendly** workflow

**Ready to customize?** Copy an example template and commit to git!

---

_Last Updated: 2025-10-30_
_Status: Ready for Production_
