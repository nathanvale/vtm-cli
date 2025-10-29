# Planning Templates

This directory contains templates used by the plan domain commands to generate
planning documents (PRDs, ADRs, specifications).

---

## Quick Start

### Using Templates

Templates are used automatically by plan commands:

```bash
# Create a new PRD
/plan:create-prd auth-system "Multi-tenant authentication"

# Create a new ADR
/plan:generate-adrs prd/auth-system.md

# Create a new specification
/plan:create-spec adr/ADR-001.md "Implementation spec"
```

### Customizing Templates

Copy and edit any template to customize:

```bash
# Copy default to customize
cp .claude/templates/template-prd.md .claude/templates/local/template-prd.md

# Edit custom template
# Commands automatically use custom version

# Commit to git
git add .claude/templates/local/
git commit -m "docs: Add custom templates"
```

---

## Directory Structure

```
.claude/templates/
├── README.md                    (this file)
├── template-prd.md              (default: Product Requirements Document)
├── template-adr.md              (default: Architecture Decision Record)
├── template-spec.md             (default: Technical Specification)
├── template-command.md          (default: Slash Command)
└── local/                       (CUSTOM OVERRIDES - project-specific)
    ├── template-prd.md          (custom PRD - optional)
    ├── template-adr.md          (custom ADR - optional)
    └── template-spec.md         (custom Spec - optional)
```

---

## Default Templates

### `template-prd.md`

**Used by**: `/plan:create-prd`

**Purpose**: Product Requirements Document template

**Sections**:

- Problem & Outcomes
- Users & Jobs
- Scope (MVP → v1)
- User Flows
- Non-Functional Requirements
- Decisions (Locked)
- Open Questions

**When to use**: Creating feature specifications, PRDs, product briefs

**Example**:

```bash
/plan:create-prd auth-system "Multi-tenant authentication system"
# Generates auth-system.md with PRD template
```

### `template-adr.md`

**Used by**: `/plan:generate-adrs`, `/plan:create-adr`

**Purpose**: Architecture Decision Record template

**Sections**:

- Status
- Context
- Forces (competing concerns)
- Decision
- Rationale
- Alternatives Considered
- Consequences (positive, negative, neutral)
- Implementation Guidance
- Validation Criteria
- Review Schedule
- Notes & Decision Log

**When to use**: Documenting major architectural decisions, technology choices

**Example**:

```bash
/plan:generate-adrs prd/auth-system.md
# Generates ADRs with this template
```

### `template-spec.md`

**Used by**: `/plan:create-spec`

**Purpose**: Technical Specification template

**Sections**:

- Executive Summary
- Scope (In/Out)
- Success Criteria
- System Architecture
- Technical Implementation
- Test Strategy
- Task Breakdown
- Risks & Mitigations
- Performance Considerations
- Security & Compliance
- Monitoring & Observability
- Open Questions
- Appendix (References, Glossary, Version History)

**When to use**: Detailed implementation planning, technical design

**Example**:

```bash
/plan:create-spec adr/ADR-001.md "Authentication service"
# Generates spec with this template
```

### `template-command.md`

**Used by**: Creating new slash commands

**Purpose**: Slash command definition template

**Sections**:

- Command metadata
- Description
- Parameters
- Execution steps
- Output format

**When to use**: Defining new Claude Code slash commands

---

## Custom Templates (Local Overrides)

### What Are Custom Templates?

Custom templates let you override defaults for your project or team:

- **Location**: `.claude/templates/local/` directory
- **When to use**: Your team has specific requirements not in defaults
- **How**: Commands check `local/` first, fall back to defaults
- **Zero configuration**: Just create files, no setup needed

### Creating Custom Templates

#### Step 1: Create Local Directory

```bash
mkdir -p .claude/templates/local
```

#### Step 2: Copy and Customize

```bash
# Copy the template you want to customize
cp .claude/templates/template-prd.md .claude/templates/local/template-prd.md

# Edit your custom template
# Add/remove sections, add custom content, etc.
```

#### Step 3: Commands Use It Automatically

```bash
# This now uses your custom template
/plan:create-prd my-feature "description"
# → Uses .claude/templates/local/template-prd.md
```

### Example Custom Templates

Three example custom templates are provided:

#### 1. `template-adr-with-approvals.md`

Adds approval workflow tracking to ADRs:

```markdown
## Approval Status

- Proposed By: [Name]
- Architecture Review: [Checkbox and reviewer]
- Security Review: [Checkbox and reviewer]
- Team Consensus: [Checkbox]
- Executive Sign-off: [Checkbox - if needed]
```

**Use when**: Your team requires formal approval for major decisions

**Files**:

- `.claude/templates/local/template-adr-with-approvals.md` (example)
- Copy to `.claude/templates/local/template-adr.md` to use

#### 2. `template-prd-with-compliance.md`

Adds security and compliance tracking to PRDs:

```markdown
## Security & Compliance

- Data Classification: [Public/Internal/Confidential/Restricted]
- Encryption Requirements: [At rest/In transit/Both]
- Compliance Standards: [GDPR/CCPA/HIPAA/SOC2]
- Security Review Status: [Pending/Approved/Issues]
- Approval Status: [Sign-offs from legal/compliance]
```

**Use when**: Your company operates in regulated industry

**Files**:

- `.claude/templates/local/template-prd-with-compliance.md` (example)
- Copy to `.claude/templates/local/template-prd.md` to use

#### 3. `template-spec-with-slas.md`

Adds service level agreements to technical specifications:

```markdown
## Service Level Agreements (SLA)

### Availability

- Target Uptime: 99.95%
- Planned Maintenance: Sunday 2-4am UTC
- Incident Response: <15 minutes

### Performance

- P50 Latency: <100ms
- P99 Latency: <500ms
- Throughput: 10,000 req/s

### Support

- Production Support: 24/7
- Response Times: [Critical/High/Medium/Low]
- Escalation Process: [Defined]
```

**Use when**: Your service has uptime/performance commitments

**Files**:

- `.claude/templates/local/template-spec-with-slas.md` (example)
- Copy to `.claude/templates/local/template-spec.md` to use

---

## Template Hierarchy

Commands load templates in priority order:

```
Command runs
    ↓
Check: .claude/templates/local/template-NAME.md
    ↓
Found? ──YES→ Use custom template ✅
    ↓NO
Check: .claude/templates/template-NAME.md
    ↓
Found? ──YES→ Use default template ✅
    ↓NO
Error: Template not found ❌
```

**Key Points**:

- Local (custom) always takes priority
- Defaults used as fallback
- No configuration needed
- Safe: defaults always available

---

## Using Custom Templates with Team

### Share Custom Templates

Custom templates are safe to commit to git:

```bash
# Add custom templates
git add .claude/templates/local/

# Commit with explanation
git commit -m "docs: Add custom templates for compliance tracking

- Custom PRD template: Added security/compliance section
- Custom ADR template: Added approval workflow
- Custom spec template: Added SLA requirements

See .claude/docs/TEMPLATE-EXAMPLES.md for details."

# Push to team repo
git push
```

### Team Members Get Them Automatically

```bash
# Team member clones repo
git clone <repo>

# Custom templates are included
ls .claude/templates/local/
# Shows custom templates ✅

# Commands use custom templates automatically
/plan:create-prd feature "description"
# Uses custom template ✅
```

---

## Customization Examples

### Example 1: Add Approval Workflow

**Goal**: Track architectural decision approvals

**Steps**:

```bash
cp .claude/templates/template-adr.md .claude/templates/local/template-adr.md
# Edit to add Approval Status section
git add .claude/templates/local/template-adr.md
git commit -m "docs: Add approval workflow to ADR template"
```

**Result**: All new ADRs include approval checklist

### Example 2: Add Compliance Tracking

**Goal**: Track security and compliance requirements upfront

**Steps**:

```bash
cp .claude/templates/template-prd.md .claude/templates/local/template-prd.md
# Edit to add Security & Compliance section
git add .claude/templates/local/template-prd.md
git commit -m "docs: Add compliance tracking to PRD template"
```

**Result**: All new PRDs include compliance sections

### Example 3: Add SLA Requirements

**Goal**: Define performance and availability targets in specs

**Steps**:

```bash
cp .claude/templates/template-spec.md .claude/templates/local/template-spec.md
# Edit to add Service Level Agreements section
git add .claude/templates/local/template-spec.md
git commit -m "docs: Add SLA requirements to spec template"
```

**Result**: All new specs include SLA sections

---

## Best Practices

### 1. Start from Defaults

Always copy default templates, don't create from scratch:

```bash
✅ DO:
cp .claude/templates/template-adr.md .claude/templates/local/template-adr.md

❌ DON'T:
# Create custom from scratch - might miss important sections
```

### 2. Document Customizations

Add metadata at top of custom template:

```markdown
---
title: Custom ADR Template
source: .claude/templates/template-adr.md
customizations:
  - Added "Approval Status" section for governance
  - Added "SLA Requirements" section
version: 1.0
owner: Architecture team
---
```

### 3. Maintain Standard Sections

Keep core sections from defaults:

- Don't remove essential sections
- Add custom sections AFTER standard ones
- Use same heading levels (## for sections)

### 4. Test Before Committing

```bash
# Test custom template works
/plan:create-adr "test" "test description"

# Verify custom sections
grep "Approval Status" test-adr.md

# Clean up
rm test-adr.md

# Then commit
git add .claude/templates/local/
git commit -m "docs: Add custom templates"
```

### 5. Commit to Version Control

Custom templates are project-specific and safe to commit:

```bash
git add .claude/templates/local/
git commit -m "docs: Add custom templates with team requirements"
```

---

## Troubleshooting

### "Custom template not being used"

**Check**:

1. File exists: `ls .claude/templates/local/template-prd.md`
2. Filename matches: `template-prd.md` for PRD, `template-adr.md` for ADR
3. Content is valid: `head -5 .claude/templates/local/template-prd.md` shows
   YAML

**Solution**:

- Verify file path is exactly `.claude/templates/local/template-NAME.md`
- Check for typos in filename
- Ensure YAML frontmatter is valid

### "Template file exists but not used"

**Check**:

1. Template is complete: `wc -l .claude/templates/local/template-prd.md` (should
   be 100+)
2. Not truncated: `tail .claude/templates/local/template-prd.md`
3. Proper encoding: `file .claude/templates/local/template-prd.md` (should be
   ASCII/UTF-8)

**Solution**:

- Copy fresh default:
  `cp .claude/templates/template-prd.md .claude/templates/local/template-prd.md`
- Edit with text editor (not Word)
- Save as UTF-8 text file

---

## Reverting Customizations

To stop using a custom template and go back to defaults:

```bash
# Delete custom template
rm .claude/templates/local/template-prd.md

# Next command uses default
/plan:create-prd my-prd "description"
# → Uses .claude/templates/template-prd.md now
```

Or keep a backup before customizing:

```bash
# Backup default before customizing
cp .claude/templates/template-adr.md .claude/templates/template-adr.backup.md

# Customize
cp .claude/templates/template-adr.md .claude/templates/local/template-adr.md
# Edit...

# If needed, restore
cp .claude/templates/template-adr.backup.md .claude/templates/local/template-adr.md
```

---

## Documentation

- **Complete Guide**: `.claude/docs/TEMPLATE-CUSTOMIZATION.md`
- **Implementation Examples**: `.claude/docs/TEMPLATE-EXAMPLES.md`
- **Integration Details**: `.claude/docs/TEMPLATE-INTEGRATION.md`
- **Project Overview**: `CLAUDE.md`

---

## Key Points

- **Default templates** - In `.claude/templates/`
- **Custom templates** - In `.claude/templates/local/`
- **Custom overrides defaults** - No configuration needed
- **Safe to commit** - Project-specific templates in git
- **No code changes** - Just create template files
- **Automatic discovery** - Commands find and use them
- **Team-friendly** - Shared via git clone/pull

---

## See Also

- `/plan:create-prd` - Create Product Requirements Documents
- `/plan:create-adr` - Create Architecture Decision Records
- `/plan:create-spec` - Create Technical Specifications
- `/plan:generate-adrs` - Generate multiple ADRs from PRD
- `.claude/docs/` - Documentation directory
- `CLAUDE.md` - Project instructions

---

**Status**: Feature ready for use **Requirement**: Minimal implementation
(template loading with fallback) **Priority**: Enhanced productivity through
customization
