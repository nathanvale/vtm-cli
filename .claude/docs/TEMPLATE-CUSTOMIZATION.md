# Template Customization Guide

**Purpose:** Allow project teams to customize planning templates (PRD, ADR, Spec) for their specific needs.

---

## Overview

Teams can now customize the templates used by plan commands by:

1. Creating local template overrides in `.claude/templates/local/`
2. Adding custom sections or removing unnecessary ones
3. Tailoring to team-specific requirements (compliance, process, format)
4. Maintaining standard structure while extending functionality

### Benefits

- **Team flexibility:** Each team/project can have its own template style
- **Compliance:** Add regulatory or audit requirements as custom sections
- **Process alignment:** Templates match your workflow and culture
- **Consistency:** Once customized, used consistently across all commands

---

## Template Hierarchy

Templates are loaded in priority order:

```
1. Local override    (.claude/templates/local/template-*.md)
   ↓ Found? Use it
   ↓ Not found?
2. Default template  (.claude/templates/template-*.md)
   ↓ Use default
```

### Directory Structure

```
.claude/
├─ templates/
│  ├─ template-prd.md         (default PRD)
│  ├─ template-adr.md         (default ADR)
│  ├─ template-spec.md        (default Spec)
│  └─ local/                  (NEW - local overrides)
│     ├─ template-prd.md      (custom PRD)
│     ├─ template-adr.md      (custom ADR)
│     └─ template-spec.md     (custom Spec)
```

---

## Creating Custom Templates

### Step 1: Create Local Directory

```bash
mkdir -p .claude/templates/local
```

### Step 2: Copy and Customize

```bash
# Copy the template you want to customize
cp .claude/templates/template-prd.md .claude/templates/local/template-prd.md

# Edit it
# Add/remove sections, change formatting, etc.
```

### Step 3: Commands Automatically Use It

```bash
# This now uses your custom template automatically
/plan:create-prd auth-system "multi-tenant auth"
```

---

## Examples

### Example 1: Custom PRD with Compliance Section

**Problem:** Your company needs PRDs to include security/compliance requirements.

**Solution:** Create custom template:

```bash
cp .claude/templates/template-prd.md .claude/templates/local/template-prd.md
```

**Edit** `.claude/templates/local/template-prd.md`:

```markdown
---
title: {Title} PRD
status: draft
owner: {Owner}
version: 0.1.0
date: {Date}
spec_type: prd
---

# {Title} — PRD

## 1) Problem & Outcomes

[Standard section...]

## 2) Users & Jobs

[Standard section...]

## 3) Scope (MVP → v1)

[Standard section...]

## 4) User Flows

[Standard section...]

## 5) Non-Functional

[Standard section...]

## 6) Decisions (Locked)

[Standard section...]

## 7) Security & Compliance ← CUSTOM

- Data Classification: [Public/Internal/Confidential/Restricted]
- Encryption Requirements: [At rest/In transit/Both]
- Compliance Standards: [GDPR/CCPA/HIPAA/SOC2]
- Security Review Needed: [Yes/No]
- Approval Required: [Yes/No]
- Threat Model: [Link to threat model doc]

## 8) Open Questions

[Standard section...]
```

Now all PRDs generated will include the Security & Compliance section:

```bash
/plan:create-prd auth-system "multi-tenant auth"
# Generated PRD now has the custom sections
```

### Example 2: Custom ADR with Approval Workflow

**Problem:** Your team requires ADRs to go through an approval process.

**Solution:** Customize ADR template:

```bash
cp .claude/templates/template-adr.md .claude/templates/local/template-adr.md
```

**Edit** `.claude/templates/local/template-adr.md`:

Add approval workflow section:

```markdown
## Approval Status ← CUSTOM

- **Proposed By:** [Author Name]
- **Proposed Date:** [Date]
- **Approved By:** [Approver Name or "Pending"]
- **Approval Date:** [Date or "Pending"]
- **Review Comments:** [Link to PR/discussion]

### Approval Checklist ← CUSTOM

- [ ] Architecture review completed
- [ ] Security review completed
- [ ] Performance impact assessed
- [ ] Team consensus reached
- [ ] Executive sign-off (if major decision)
```

### Example 3: Custom Spec with SLA Requirements

**Problem:** Your company needs implementation specs to define SLAs.

**Solution:** Customize Spec template:

```bash
cp .claude/templates/template-spec.md .claude/templates/local/template-spec.md
```

**Edit** `.claude/templates/local/template-spec.md`:

Add SLA section:

```markdown
## Service Level Agreements (SLA) ← CUSTOM

### Availability

- **Target Uptime:** 99.95%
- **Planned Downtime:** Sunday 2-4am UTC
- **Incident Response Time:** <15 minutes

### Performance

- **P50 Latency:** <100ms
- **P99 Latency:** <500ms
- **Throughput:** 10,000 req/s

### Support

- **Production Support:** 24/7
- **Non-Production Support:** Business hours
- **Escalation Process:** [Link to runbook]
```

---

## Using Custom Templates with CLI

### Explicit Template Selection (Future)

```bash
# Specify custom template explicitly
/plan:create-prd auth --template=.claude/templates/local/template-prd.md

# Or with default lookup (searches local/ first)
/plan:create-prd auth
# Automatically uses: .claude/templates/local/template-prd.md
```

### Configuration (Current)

Commands automatically detect and use local templates:

```bash
/plan:create-prd auth "auth system"
# Checks: .claude/templates/local/template-prd.md
# Uses it if exists, otherwise falls back to default
```

---

## Best Practices

### 1. Start with Defaults

Always start by copying the default template:

```bash
cp .claude/templates/template-adr.md .claude/templates/local/template-adr.md
# Don't write from scratch - builds on tested structure
```

### 2. Maintain Structure

Keep the core sections from default:

- Don't remove essential sections (Status, Decision, etc.)
- Add custom sections AFTER standard ones
- Use same heading levels (## for sections, ### for subsections)

### 3. Document Customizations

Add a comment at the top of custom template:

```markdown
---
title: Custom ADR Template
source: .claude/templates/template-adr.md
customizations:
  - Added "Approval Status" section for governance
  - Added "SLA Requirements" section
version: 1.0
---

# ADR Template (Custom)

> This is a customized template for our project.
> See `.claude/docs/TEMPLATE-CUSTOMIZATION.md` for details.
```

### 4. Version Control

Commit custom templates to git:

```bash
# .gitignore - keep it:
.claude/templates/local/

# These are project-specific, safe to commit
git add .claude/templates/local/
git commit -m "docs: Add custom ADR template with approval workflow"
```

### 5. Team Alignment

Share customization decisions with team:

```markdown
# Template Customizations

## ADR Template

- **Why customized:** Need approval workflow for major decisions
- **Added sections:** Approval Status, Approval Checklist
- **When to use:** All architectural decisions
- **Review:** See `.claude/templates/local/template-adr.md`

## PRD Template

- **Why customized:** Need security/compliance tracking
- **Added sections:** Security & Compliance
- **When to use:** All feature PRDs
- **Review:** See `.claude/templates/local/template-prd.md`

## Spec Template

- **Why customized:** SLA requirements for production features
- **Added sections:** Service Level Agreements
- **When to use:** All production specs
- **Review:** See `.claude/templates/local/template-spec.md`
```

---

## Common Customizations

### Add Custom Sections

```markdown
## Company-Specific Section

### Your Content

Content here
```

### Remove Sections (Not Recommended)

Don't delete - just leave empty:

```markdown
## Alternatives Considered

(None - single clear option)
```

### Modify Formatting

```markdown
# Before:

## Status

# After:

## Status & Approval

**Current:** Proposed
**Approved By:** (pending)
```

### Add Examples

```markdown
## Rationale

We chose this approach because:

1. [Reason 1]
2. [Reason 2]

### Example from Similar Decision

See ADR-003 for similar approach in [domain]
```

---

## Troubleshooting

### "Custom template not being used"

1. Verify file path:

   ```bash
   ls -la .claude/templates/local/template-*.md
   # Should show custom templates
   ```

2. Check template filename matches command:
   - `/plan:create-prd` → needs `template-prd.md`
   - `/plan:create-adr` → needs `template-adr.md`
   - `/plan:create-spec` → needs `template-spec.md`

3. Verify markdown syntax:
   ```bash
   file .claude/templates/local/template-prd.md
   # Should be "ASCII text"
   ```

### "Template has syntax errors"

Edit and test the template YAML frontmatter:

```bash
# Check frontmatter is valid
head -5 .claude/templates/local/template-prd.md

# Should show valid YAML:
# ---
# title: Custom PRD Template
# ...
# ---
```

### "Mixed content from default and custom"

This shouldn't happen - one or the other is used. If seeing both:

- Check both files exist
- Clear any caches: `rm -rf .claude/cache/`
- Verify custom template is complete

---

## Reverting Customizations

### Use Default Again

Simply delete the custom template:

```bash
rm .claude/templates/local/template-prd.md

# Next command uses default from .claude/templates/
/plan:create-prd my-prd "description"
```

### Keep Backup

Before customizing, backup defaults:

```bash
cp .claude/templates/template-adr.md .claude/templates/template-adr.backup.md

# Then customize
cp .claude/templates/template-adr.md .claude/templates/local/template-adr.md
# Edit...

# If needed, restore:
cp .claude/templates/template-adr.backup.md .claude/templates/local/template-adr.md
```

---

## Advanced: Template Inheritance

For multiple custom variations:

```
.claude/templates/
├─ local/
│  ├─ template-adr.md              (base custom)
│  ├─ template-adr-security.md     (for security decisions)
│  └─ template-adr-vendor.md       (for vendor decisions)
```

Future enhancement: Select template based on decision type:

```bash
/plan:create-adr "OAuth2 decision" --template=security
# Uses template-adr-security.md
```

Currently, use naming to document:

```markdown
---
title: ADR Template - Security Decisions
purpose: For security-related architectural decisions
---
```

---

## Implementation Details

### Template Loading Logic

```typescript
// Pseudocode for template loading

function loadTemplate(templateName: string): string {
  const localPath = `.claude/templates/local/${templateName}`
  const defaultPath = `.claude/templates/${templateName}`

  if (fileExists(localPath)) {
    return readFile(localPath) // Use custom
  }

  if (fileExists(defaultPath)) {
    return readFile(defaultPath) // Use default
  }

  throw new Error(`Template not found: ${templateName}`)
}
```

### In Plan Commands

```typescript
// In /plan:create-prd, /plan:create-adr, /plan:create-spec:

const template = loadTemplate("template-prd.md")
// Automatically checks local/ first, falls back to default
```

---

## Integration with Workflow

```bash
# Setup (one time)
mkdir -p .claude/templates/local
cp .claude/templates/template-adr.md .claude/templates/local/
# Edit custom template
git add .claude/templates/local/

# Usage (automatic)
/plan:generate-adrs prd/auth.md
# Uses custom ADR template automatically

/plan:create-spec adr/ADR-001.md
# Uses custom spec template automatically
```

---

## Team Template Library (Future)

Potential enhancement: Share templates across team

```bash
# Download community template
/plan:template pull adr/security

# Push custom template to team
/plan:template push local/template-adr.md as team-adr-v1

# List available templates
/plan:template list
```

---

## Validation

Custom templates should pass basic checks:

```bash
# Verify custom template structure (future CLI)
vtm template validate .claude/templates/local/template-adr.md

# Output:
# ✅ Template is valid
# ✅ Required sections present
# ✅ Markdown syntax OK
# ⚠️  Custom sections: Approval Status, SLA Requirements
```

---

## Notes

- **No code changes needed** - Just create custom template files
- **Automatic discovery** - Commands find and use them
- **Backward compatible** - Not using custom templates still works
- **Team-friendly** - Can be committed to git
- **Safe** - Defaults always available as fallback

---

## See Also

- `/plan:create-prd` - Uses custom PRD template
- `/plan:generate-adrs` - Uses custom ADR template
- `/plan:create-spec` - Uses custom Spec template
- `.claude/templates/` - Default templates
- `CLAUDE.md` - Project instructions

---

**Status:** Feature ready for use
**Requirement:** Minimal implementation (template loading with fallback)
**Priority:** Nice-to-have enhancement
