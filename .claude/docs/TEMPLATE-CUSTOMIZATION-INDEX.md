# Template Customization - Complete Index

Welcome! This index helps you navigate all template customization documentation and resources.

---

## Start Here

### First Time? (5 Minutes)

1. **Read This**: `TEMPLATE-QUICK-REFERENCE.md` (this directory)
   - Quick start guide
   - 60-second examples
   - What it does

2. **See Examples**: `TEMPLATE-EXAMPLES.md` (this directory)
   - 3 real-world scenarios
   - Step-by-step setup
   - Choose your use case

3. **Activate Template**:
   ```bash
   cp .claude/templates/local/template-prd-with-compliance.md \
      .claude/templates/local/template-prd.md
   git add .claude/templates/local/
   git commit -m "docs: Add custom templates"
   ```

Done! Your team now has custom templates.

---

## Documentation Map

### Level 1: Quick Start

**File**: `TEMPLATE-QUICK-REFERENCE.md` (12 KB)

Best for: "Just tell me what to do"

- Quick start (5 minutes)
- Copy-paste commands
- Common tasks
- One-minute examples
- Troubleshooting quick answers

### Level 2: Real Examples

**File**: `TEMPLATE-EXAMPLES.md` (20 KB)

Best for: "Show me real examples"

- 3 complete real-world scenarios:
  - Enterprise with compliance requirements
  - Organization with approval workflow
  - Production SaaS with SLAs
- Step-by-step implementation
- Testing procedures
- Common patterns
- Troubleshooting

### Level 3: Integration Details

**File**: `TEMPLATE-INTEGRATION.md` (16 KB)

Best for: "How does it actually work?"

- Template hierarchy explained
- Command integration details
- Implementation pseudocode
- Debugging guide (4 issues with solutions)
- Testing procedures (4 scenarios)
- Workflow patterns

### Level 4: Complete Reference

**File**: `TEMPLATE-CUSTOMIZATION.md` (16 KB)

Best for: "I need to know everything"

- Complete feature documentation
- Best practices (5 practices)
- Advanced features
- Troubleshooting (6+ solutions)
- Design principles
- Future enhancements

### Level 5: Directory Guide

**File**: `.claude/templates/README.md` (16 KB)

Best for: "What's in this directory?"

- Default templates explained
- Directory structure
- Quick customization steps
- Example templates overview
- Team sharing workflow

### Level 6: Completion Summary

**File**: `TEMPLATE-COMPLETION-SUMMARY.md` (16 KB)

Best for: "What was actually delivered?"

- All deliverables documented
- Verification checklist
- File inventory
- Real-world scenarios
- Support resources

---

## By Use Case

### "I need compliance tracking"

1. **Read**: `TEMPLATE-QUICK-REFERENCE.md` → "Add Compliance to PRDs"
2. **Understand**: `TEMPLATE-EXAMPLES.md` → "Example 1: Enterprise Company"
3. **Implement**:
   ```bash
   cp .claude/templates/local/template-prd-with-compliance.md \
      .claude/templates/local/template-prd.md
   /plan:create-prd test "test"
   git add .claude/templates/local/
   git commit -m "docs: Add compliance tracking to PRD template"
   ```

**Reference Docs**:

- `TEMPLATE-CUSTOMIZATION.md` → "Example 1: Custom PRD with Compliance Section"
- `.claude/templates/README.md` → "Example 2: Add Compliance Tracking to PRDs"

### "I need approval workflows"

1. **Read**: `TEMPLATE-QUICK-REFERENCE.md` → "Add Approvals to ADRs"
2. **Understand**: `TEMPLATE-EXAMPLES.md` → "Example 2: Organization with Approval Workflow"
3. **Implement**:
   ```bash
   cp .claude/templates/local/template-adr-with-approvals.md \
      .claude/templates/local/template-adr.md
   /plan:generate-adrs some-prd.md
   git add .claude/templates/local/
   git commit -m "docs: Add approval workflow to ADR template"
   ```

**Reference Docs**:

- `TEMPLATE-CUSTOMIZATION.md` → "Example 2: Custom ADR with Approval Workflow"
- `.claude/templates/README.md` → "Example 1: Add Approval Workflow to ADRs"

### "I need SLA requirements"

1. **Read**: `TEMPLATE-QUICK-REFERENCE.md` → "Add SLAs to Specs"
2. **Understand**: `TEMPLATE-EXAMPLES.md` → "Example 3: Production SaaS with SLAs"
3. **Implement**:
   ```bash
   cp .claude/templates/local/template-spec-with-slas.md \
      .claude/templates/local/template-spec.md
   /plan:create-spec adr/ADR-001.md "service"
   git add .claude/templates/local/
   git commit -m "docs: Add SLA requirements to spec template"
   ```

**Reference Docs**:

- `TEMPLATE-CUSTOMIZATION.md` → "Example 3: Custom Spec with SLA Requirements"
- `.claude/templates/README.md` → "Example 3: Add SLA Requirements to Specs"

---

## By Question

### "How do I customize a template?"

→ `TEMPLATE-QUICK-REFERENCE.md` → "TL;DR - Quick Start"

```bash
cp .claude/templates/template-*.md .claude/templates/local/
# Edit the file
git add .claude/templates/local/
git commit -m "docs: Add custom template"
```

### "What's the difference between local/ and default templates?"

→ `TEMPLATE-INTEGRATION.md` → "Overview" & "Template Hierarchy"

Local templates (`.claude/templates/local/`) override defaults and take priority. Commands check local first, then fall back to defaults.

### "How does my team get the custom templates?"

→ `TEMPLATE-EXAMPLES.md` → "Sharing Customizations with Team"

Commit to git and push. Team gets them automatically on clone/pull.

### "What if something breaks?"

→ `TEMPLATE-INTEGRATION.md` → "Debugging Template Issues"

Run test script: `./.claude/scripts/test-template-hierarchy.sh`

Check the 4 issue solutions, or read full troubleshooting in `TEMPLATE-CUSTOMIZATION.md`.

### "Can I use multiple custom templates?"

→ `TEMPLATE-CUSTOMIZATION.md` → "Advanced: Template Inheritance"

Currently, one template per type. Future enhancement will allow selecting by type.

### "Can I revert to defaults?"

→ `TEMPLATE-QUICK-REFERENCE.md` → "Revert to Defaults"

```bash
rm .claude/templates/local/template-prd.md
# Next command uses default
```

---

## File Reference

### Documentation Files

| File                             | Size  | Purpose          | Best For                       |
| -------------------------------- | ----- | ---------------- | ------------------------------ |
| `TEMPLATE-QUICK-REFERENCE.md`    | 12 KB | Quick answers    | Getting started, quick tasks   |
| `TEMPLATE-EXAMPLES.md`           | 20 KB | Real scenarios   | Understanding use cases        |
| `TEMPLATE-INTEGRATION.md`        | 16 KB | How it works     | Technical details, debugging   |
| `TEMPLATE-CUSTOMIZATION.md`      | 16 KB | Complete guide   | Full reference, all features   |
| `TEMPLATE-COMPLETION-SUMMARY.md` | 16 KB | What's delivered | Project overview, verification |
| `.claude/templates/README.md`    | 16 KB | Directory guide  | Template overview, quick start |

### Template Files

| File                              | Size  | Purpose      | Use Case            |
| --------------------------------- | ----- | ------------ | ------------------- |
| `template-adr-with-approvals.md`  | 8 KB  | Example ADR  | Approval workflows  |
| `template-prd-with-compliance.md` | 8 KB  | Example PRD  | Compliance tracking |
| `template-spec-with-slas.md`      | 16 KB | Example Spec | SLA requirements    |

### Test & Scripts

| File                         | Size | Purpose           |
| ---------------------------- | ---- | ----------------- |
| `test-template-hierarchy.sh` | 8 KB | Automated testing |

---

## Quick Commands

### Test Everything Works

```bash
./.claude/scripts/test-template-hierarchy.sh
```

### Activate Compliance Template

```bash
cp .claude/templates/local/template-prd-with-compliance.md \
   .claude/templates/local/template-prd.md
```

### Activate Approval Template

```bash
cp .claude/templates/local/template-adr-with-approvals.md \
   .claude/templates/local/template-adr.md
```

### Activate SLA Template

```bash
cp .claude/templates/local/template-spec-with-slas.md \
   .claude/templates/local/template-spec.md
```

### Test a Custom Template

```bash
/plan:create-prd test "test description"
grep "Security & Compliance" test.md  # Check for custom section
rm test.md
```

### Commit Custom Templates

```bash
git add .claude/templates/local/
git commit -m "docs: Add custom templates"
git push
```

### Revert to Defaults

```bash
rm .claude/templates/local/template-*.md
```

---

## Navigation Tips

### I'm in a hurry

→ `TEMPLATE-QUICK-REFERENCE.md` (2 minutes)

### I want to understand the approach

→ `TEMPLATE-EXAMPLES.md` (10 minutes)

### I need to debug something

→ `TEMPLATE-INTEGRATION.md` (section: "Debugging Template Issues")

### I want complete documentation

→ `TEMPLATE-CUSTOMIZATION.md` (reference)

### I'm looking for specific info

→ Use Ctrl+F (search) in any document

---

## Common Paths

### Path 1: Compliance Company (20 minutes)

1. Read: `TEMPLATE-QUICK-REFERENCE.md`
2. Read: `TEMPLATE-EXAMPLES.md` → "Example 1"
3. Copy: `template-prd-with-compliance.md` to `template-prd.md`
4. Test: `/plan:create-prd test "test"`
5. Commit: `git add .claude/templates/local/`

### Path 2: Enterprise with Approvals (20 minutes)

1. Read: `TEMPLATE-QUICK-REFERENCE.md`
2. Read: `TEMPLATE-EXAMPLES.md` → "Example 2"
3. Copy: `template-adr-with-approvals.md` to `template-adr.md`
4. Test: `/plan:generate-adrs some-prd.md`
5. Commit: `git add .claude/templates/local/`

### Path 3: SaaS with SLAs (20 minutes)

1. Read: `TEMPLATE-QUICK-REFERENCE.md`
2. Read: `TEMPLATE-EXAMPLES.md` → "Example 3"
3. Copy: `template-spec-with-slas.md` to `template-spec.md`
4. Test: `/plan:create-spec adr/ADR-001.md "service"`
5. Commit: `git add .claude/templates/local/`

### Path 4: Understanding How It Works (30 minutes)

1. Read: `TEMPLATE-CUSTOMIZATION.md` → "Overview"
2. Read: `TEMPLATE-INTEGRATION.md` → "Overview"
3. Review: `.claude/templates/README.md`
4. Run: `./.claude/scripts/test-template-hierarchy.sh`

### Path 5: Team Adoption (45 minutes)

1. Read: `TEMPLATE-EXAMPLES.md` → Full document
2. Choose: Which customization fits your team
3. Copy: Example to `template-*.md`
4. Test: Verify it works
5. Commit: Push to team repo
6. Document: Create team guide in CUSTOM-TEMPLATES.md
7. Share: Point team to documentation

---

## File Locations

### Documentation

- `.claude/docs/TEMPLATE-CUSTOMIZATION.md` (main guide, verified)
- `.claude/docs/TEMPLATE-EXAMPLES.md` (real examples)
- `.claude/docs/TEMPLATE-INTEGRATION.md` (integration details)
- `.claude/docs/TEMPLATE-QUICK-REFERENCE.md` (quick answers)
- `.claude/docs/TEMPLATE-COMPLETION-SUMMARY.md` (what's delivered)
- `.claude/docs/TEMPLATE-CUSTOMIZATION-INDEX.md` (this file)

### Templates

- `.claude/templates/template-prd.md` (default)
- `.claude/templates/template-adr.md` (default)
- `.claude/templates/template-spec.md` (default)
- `.claude/templates/README.md` (directory guide)
- `.claude/templates/local/template-adr-with-approvals.md` (example)
- `.claude/templates/local/template-prd-with-compliance.md` (example)
- `.claude/templates/local/template-spec-with-slas.md` (example)

### Scripts

- `.claude/scripts/test-template-hierarchy.sh` (automated test)

---

## Key Concepts

### Template Hierarchy

Custom templates (local/) take priority over defaults. If custom doesn't exist, defaults are used.

### No Configuration Needed

Just create files - commands automatically find and use them.

### Team-Friendly

Custom templates can be committed to git and shared with team.

### Zero Code Changes

Documentation and examples only - no code modifications needed.

### Extensible

Easy to add more customizations as needs evolve.

---

## Support Levels

### Level 1: Quick Fix (5 minutes)

→ Check `TEMPLATE-QUICK-REFERENCE.md`

### Level 2: Understanding (15 minutes)

→ Read relevant section in `TEMPLATE-EXAMPLES.md`

### Level 3: Technical Details (30 minutes)

→ Review `TEMPLATE-INTEGRATION.md`

### Level 4: Deep Dive (1 hour)

→ Read `TEMPLATE-CUSTOMIZATION.md` fully

### Level 5: Debug/Test

→ Run `./.claude/scripts/test-template-hierarchy.sh`

---

## Next Steps

1. **Choose a path** (above) based on your needs
2. **Read the appropriate docs** for your path
3. **Try an example** using provided templates
4. **Test your setup** with test script
5. **Commit to git** to share with team
6. **Gather feedback** and iterate

---

## Questions?

1. **Quick answer?** → `TEMPLATE-QUICK-REFERENCE.md`
2. **Want examples?** → `TEMPLATE-EXAMPLES.md`
3. **Technical details?** → `TEMPLATE-INTEGRATION.md`
4. **Everything?** → `TEMPLATE-CUSTOMIZATION.md`
5. **Something broken?** → `TEMPLATE-INTEGRATION.md` → "Debugging"
6. **What was delivered?** → `TEMPLATE-COMPLETION-SUMMARY.md`

---

**Last Updated**: 2025-10-30
**Status**: Complete & Production-Ready
**Questions?** See documentation above
