# Template Customization Examples

This document demonstrates real-world examples of template customization for the plan domain. Each example shows a concrete use case and how to implement it.

## Quick Start

### What You'll Find

1. **Example templates** in `.claude/templates/local/`
2. **Use cases** that match real team needs
3. **Implementation steps** to apply customizations
4. **Integration patterns** for workflow automation

---

## Example 1: Enterprise Company with Compliance Requirements

### Use Case

Your company operates in a regulated industry (healthcare, finance, etc.) and needs PRDs to track security and compliance requirements before implementation.

**Challenge**: Standard PRD template doesn't include compliance information, so compliance reviews happen after the PRD is written, causing rework.

**Solution**: Customize PRD template to include compliance sections upfront.

### Implementation

**Step 1: Create custom template**

```bash
mkdir -p .claude/templates/local
cp .claude/templates/template-prd.md .claude/templates/local/template-prd.md
```

**Step 2: Edit custom template**

```bash
# Open .claude/templates/local/template-prd.md in your editor
# Add new section after "Non-Functional" section
```

**Step 3: Add compliance section**

```markdown
## 6) Security & Compliance

### Data Classification

- **Data Sensitivity Level**: [Public | Internal | Confidential | Restricted]
- **Examples of data handled**: [List data types]

### Compliance Requirements

- [ ] **GDPR** - EU data protection
- [ ] **CCPA** - California privacy
- [ ] **HIPAA** - Healthcare data
- [ ] **SOC 2** - Security certification

### Security Review & Approval

- **Security Review Status**: [Pending | Approved | Issues found]
- **Approved By**: [Security team name]
- **Date**: [YYYY-MM-DD]

### Risk Assessment

- **Data Breach Risk**: [Low | Medium | High]
- **Regulatory Risk**: [Low | Medium | High]
```

**Step 4: Use automatically**

```bash
# Now all PRDs include compliance tracking
/plan:create-prd auth-system "Multi-tenant auth system"
# Generated PRD has compliance sections ✅
```

**Step 5: Commit to git**

```bash
git add .claude/templates/local/template-prd.md
git commit -m "docs: Add compliance tracking to PRD template"
git push
```

### Team Alignment

Create a document explaining the customization:

```markdown
# PRD Template Customization

## What Changed

Added "Security & Compliance" section to PRD template.

## Why

- Compliance requirements should be considered upfront
- Prevents rework after security review
- Clear visibility into regulatory obligations

## How to Use

1. Run `/plan:create-prd feature-name "description"`
2. Fill in the Security & Compliance section
3. Share with security team for review
4. Only after approval, proceed to implementation

## When to Use

All feature PRDs must include compliance assessment.
```

### Result

All PRDs now include:

- Data classification upfront
- Applicable compliance standards identified
- Security review sign-off visible
- Regulatory risks documented

---

## Example 2: Organization with Approval Workflow

### Use Case

Your team requires architectural decisions to go through a formal approval process before implementation begins. Currently, approvals are tracked in email/Slack, causing confusion about status.

**Challenge**: Need to formalize approval process and track who approved what, when.

**Solution**: Customize ADR template to include approval workflow section.

### Implementation

**Step 1: Create custom ADR template**

```bash
cp .claude/templates/template-adr.md .claude/templates/local/template-adr.md
```

**Step 2: Add approval workflow section**

Insert after "Status" section:

```markdown
## Approval Status

### Proposal

- **Proposed By**: [Author Name]
- **Proposed Date**: [YYYY-MM-DD]
- **Discussion**: [Link to RFC or Slack thread]

### Approval Checklist

- [ ] **Architecture Review**
  - Reviewer: [Name]
  - Date: [YYYY-MM-DD]

- [ ] **Security Review**
  - Reviewer: [Name]
  - Date: [YYYY-MM-DD]

- [ ] **Team Consensus**
  - Confirmed By: [Team lead]
  - Date: [YYYY-MM-DD]

- [ ] **Executive Sign-off** [If major decision]
  - Approved By: [Executive]
  - Date: [YYYY-MM-DD]

**Final Approval**: [Approver name] on [YYYY-MM-DD]
```

**Step 3: Usage pattern**

```bash
# 1. Create ADR
/plan:generate-adrs prd/auth.md
# Generates ADR with approval section

# 2. Propose for review
# → Share in team Slack/email
# → Update "Proposed By" and "Proposed Date"

# 3. Collect reviews
# → Check off each approval item as completed
# → Add reviewer name and date for each

# 4. Finalize
# → When all items checked, update status to APPROVED
# → Add "Final Approval" date

# 5. Implement
# → Now implementation can begin with confidence
```

**Step 4: Commit**

```bash
git add .claude/templates/local/template-adr.md
git commit -m "docs: Add approval workflow to ADR template"
```

### Team Process Document

```markdown
# ADR Approval Workflow

## Process Steps

1. **Propose** (Author)
   - Create ADR using `/plan:generate-adrs`
   - Fill in Approval Status section with proposal details
   - Share with team

2. **Architecture Review** (Arch lead)
   - Review decision and rationale
   - Check ADR section for clarity and reasoning
   - Add name, date, comments to checklist

3. **Security Review** (Security team)
   - Assess security implications
   - Verify no compliance risks
   - Check off when complete

4. **Team Consensus** (Tech lead)
   - Verify team agrees with approach
   - Address any objections
   - Confirm consensus

5. **Sign-off** (If needed)
   - Executive sign-off for major decisions
   - Compliance approval for regulated features

6. **Approval** (Author)
   - All checkmarks complete ✅
   - Change status to APPROVED
   - Add final approval date
   - Ready to implement

## Success Metric

All production ADRs have visible approval trail.
No guessing about who approved what.
```

### Result

- Clear approval chain of custody
- Prevents decisions bypassing review
- Audit trail visible in documentation
- Easy to see which decisions have consensus

---

## Example 3: Production SaaS with Service Level Agreements

### Use Case

Your company operates a production service with uptime guarantees to customers. Technical specs need to document performance targets, availability requirements, and support SLAs.

**Challenge**: Performance requirements scattered across design docs, runbooks, and support contracts. Hard to enforce during implementation.

**Solution**: Customize spec template to include SLA section with specific metrics.

### Implementation

**Step 1: Create custom spec template**

```bash
cp .claude/templates/template-spec.md .claude/templates/local/template-spec.md
```

**Step 2: Add SLA section**

Insert before "Test Strategy" section:

```markdown
## Service Level Agreements (SLA)

### Availability

- **Target Uptime**: 99.95% (21.6 minutes downtime allowed per month)
- **Planned Maintenance**: Sunday 2-4am UTC
- **Critical Issues Response Time**: <15 minutes

### Performance

- **P50 Latency**: <100ms
- **P99 Latency**: <500ms
- **Throughput**: 10,000 requests/second

### Data Durability

- **Backup Frequency**: Hourly
- **Recovery Time Objective**: <4 hours
- **Recovery Point Objective**: <1 hour

### Support

- **Production Support**: 24/7/365
- **Critical Issues**: <15 minutes response
- **High Priority**: <1 hour response
```

**Step 3: Usage pattern**

```bash
# 1. Create spec with SLA requirements
/plan:create-spec adr/ADR-001.md "Payment service"
# Spec includes SLA template

# 2. Define targets
# → Set uptime percentage based on service criticality
# → Define latency targets from performance testing
# → Specify support hours and response times

# 3. Implementation tasks
# → Team implements to meet SLA targets
# → Monitoring configured to track SLAs
# → Alerts configured if SLA at risk

# 4. Live monitoring
# → Track actual performance against targets
# → Incident response follows SLA timelines
# → Regular reporting on SLA compliance
```

**Step 4: Commit**

```bash
git add .claude/templates/local/template-spec.md
git commit -m "docs: Add SLA requirements to spec template"
```

### Operations Integration

Create runbook template:

```markdown
# SLA Runbook

## Monitoring Targets

- Uptime: 99.95%
- Latency P99: <500ms
- Error rate: <0.1%

## Alert Thresholds

- Uptime drops below 99.9% → Page on-call
- Latency P99 > 1s → Escalate to eng
- Error rate > 0.5% → Critical incident

## Response Procedures

- Critical: <15 min response, <2 hour resolution
- High: <1 hour response, <8 hour resolution

## Post-Incident

- Publish post-mortem within 24 hours
- Update runbook with learnings
- Track SLA breach remediation
```

### Result

- Clear performance expectations documented
- Implementation teams know exact targets
- Monitoring configured to match SLAs
- Customer commitments backed by documentation
- Easy to track compliance with contracts

---

## Testing Your Customizations

### Verify Template Works

```bash
# 1. Check file exists
ls -la .claude/templates/local/template-prd.md
# Should show file

# 2. Verify content
head -20 .claude/templates/local/template-prd.md
# Should show valid YAML frontmatter

# 3. Test command
/plan:create-prd test-feature "Test description"
# Generated file should include custom sections

# 4. Verify custom content
grep "Security & Compliance" test-feature.md
# Should find custom section
```

### Validate Markdown

```bash
# Install markdown linter (if not present)
npm install -g markdownlint-cli

# Check custom template
markdownlint .claude/templates/local/template-*.md

# Should show no errors or warnings
```

### Test Workflow

```bash
# 1. Create using custom template
/plan:create-adr auth-decisions "Authentication decisions"

# 2. Check file was created with custom sections
cat auth-decisions.md | grep "Approval Status"
# Should find the custom section

# 3. Verify custom sections match template
# → Compare sections with template
# → All sections present and formatted correctly

# 4. Clean up test files
rm auth-decisions.md test-feature.md
```

---

## Sharing Customizations with Team

### Step 1: Commit to Git

```bash
# Make sure customizations are complete
git add .claude/templates/local/

# Commit with clear message
git commit -m "docs: Add custom templates for compliance tracking

- Custom PRD template: Added security/compliance section
- Custom ADR template: Added approval workflow section
- Custom spec template: Added SLA requirements section

See .claude/docs/TEMPLATE-EXAMPLES.md for details."

# Push to team repo
git push
```

### Step 2: Document Customizations

Create `.claude/docs/CUSTOM-TEMPLATES.md` in your project:

```markdown
# Custom Templates Guide

This project uses customized planning templates.

## What's Custom

### PRD Template

- **Custom Section**: Security & Compliance
- **Purpose**: Track regulatory requirements upfront
- **When Required**: All feature PRDs
- **Owner**: [Team/person]

### ADR Template

- **Custom Section**: Approval Status & Checklist
- **Purpose**: Formal approval workflow
- **When Required**: All architectural decisions
- **Owner**: [Team/person]

### Spec Template

- **Custom Section**: Service Level Agreements
- **Purpose**: Define performance and availability targets
- **When Required**: All production service specs
- **Owner**: [Team/person]

## How to Use

1. Clone repo (customizations included)
2. Run `/plan:create-prd feature "description"`
3. Custom sections automatically available
4. Fill in custom sections alongside standard sections

## Questions?

Contact [Team] for questions about customizations.
See `.claude/docs/TEMPLATE-CUSTOMIZATION.md` for general guide.
```

### Step 3: Update Team Wiki

Add to your team's documentation:

````markdown
## Planning Templates

Our project uses customized planning templates for:

- Compliance tracking (PRDs)
- Approval workflows (ADRs)
- SLA requirements (Specs)

See `.claude/docs/CUSTOM-TEMPLATES.md` for details.

### Quick Start

```bash
# Generate new feature PRD with compliance sections
/plan:create-prd feature-name "description"
```
````

````

---

## Common Customization Patterns

### Pattern 1: Add Regulatory Section

**Goal**: Track specific compliance standards

```markdown
## Compliance Checklist

### GDPR
- [ ] Privacy policy updated
- [ ] Consent mechanism implemented
- [ ] Data subject rights supported

### SOC 2
- [ ] Security controls documented
- [ ] Audit logging enabled
- [ ] Access controls defined
````

**Used in**: PRD template (compliance example)

### Pattern 2: Add Approval Tracking

**Goal**: Formalize decision-making with sign-offs

```markdown
## Approvals

- **Proposed By**: [Name] on [Date]
- **Architecture Review**: [Name] on [Date]
- **Security Review**: [Name] on [Date]
- **Final Approval**: [Name] on [Date]
```

**Used in**: ADR template (approval example)

### Pattern 3: Add Performance Targets

**Goal**: Define measurable quality standards

```markdown
## Performance Requirements

- **Latency P95**: <200ms
- **Throughput**: 5,000 req/s
- **Availability**: 99.9%
- **Data Durability**: 99.999%
```

**Used in**: Spec template (SLA example)

### Pattern 4: Add Process Steps

**Goal**: Document workflow sequence

```markdown
## Implementation Process

1. **Design Review**
   - Reviewed by: [Name]
   - Date: [Date]

2. **Code Review**
   - Approved by: [Name]
   - Date: [Date]

3. **QA Sign-off**
   - Tested by: [Name]
   - Date: [Date]

4. **Production Deploy**
   - Deployed by: [Name]
   - Date: [Date]
```

---

## Troubleshooting Custom Templates

### Issue: Custom template not being used

**Symptoms**:

- Running `/plan:create-prd` but default sections appear, not custom

**Diagnosis**:

```bash
# Check file exists
ls -la .claude/templates/local/template-prd.md

# Check content
head -10 .claude/templates/local/template-prd.md
```

**Solution**:

1. Verify file path is exactly `.claude/templates/local/template-prd.md`
2. Check filename matches command (prd → template-prd.md)
3. Verify no typos in filename
4. Clear any command cache: `rm -rf .claude/cache/`

### Issue: Generated file has wrong content

**Symptoms**:

- Custom template file exists but generated file doesn't use it
- Mixed content from default and custom

**Diagnosis**:

```bash
# Compare templates
diff .claude/templates/template-prd.md .claude/templates/local/template-prd.md

# Check generated file
head -20 generated-prd.md
```

**Solution**:

1. Verify custom template is complete (not truncated)
2. Check YAML frontmatter is valid:
   ```bash
   head -20 .claude/templates/local/template-prd.md | tail -12
   # Should show valid YAML between --- markers
   ```
3. Ensure no syntax errors in markdown

### Issue: Custom sections appear but partially formatted

**Symptoms**:

- Custom sections present but markdown formatting is broken
- Some sections show raw placeholders

**Diagnosis**:

```bash
# Check for encoding issues
file .claude/templates/local/template-prd.md
# Should be "ASCII text" or "UTF-8 Unicode text"

# Check for incomplete edits
grep "PLACEHOLDER" .claude/templates/local/template-prd.md | wc -l
# Count remaining placeholders
```

**Solution**:

1. Edit template to remove remaining `[PLACEHOLDER: ...]` markers
2. Ensure all content is filled in properly
3. Save as UTF-8 text file
4. Test generation again

---

## Best Practices for Custom Templates

### 1. Start from Defaults

Always copy default templates, don't create from scratch:

```bash
cp .claude/templates/template-adr.md .claude/templates/local/template-adr.md
```

This preserves the tested structure and prevents breaking changes.

### 2. Document Customizations

Add metadata at top of custom template:

```markdown
---
title: Custom PRD Template
source: .claude/templates/template-prd.md
customizations:
  - Added "Security & Compliance" section
  - Added "Approval Checklist"
version: 1.0
last_updated: YYYY-MM-DD
owner: [Team name]
---
```

### 3. Add Custom Sections After Standards

Place new sections after existing ones to preserve structure:

```markdown
## 1) Problem & Outcomes

[Standard section]

## 2) Users & Jobs

[Standard section]

## 6) Custom Compliance

← Custom section added here
```

### 4. Version Control Customizations

Commit custom templates to git with clear messages:

```bash
git commit -m "docs: Add compliance tracking to PRD template

- New section: Security & Compliance
- Includes: Data classification, compliance standards, approval tracking
- Rationale: Compliance requirements should be considered upfront
- See .claude/docs/TEMPLATE-EXAMPLES.md for details"
```

### 5. Share Documentation

Document why you customized templates:

```markdown
# Why We Customized Templates

## PRD → Compliance Tracking

**Problem**: Compliance reviews happened after PRD written
**Solution**: Compliance section completed upfront
**Result**: Faster review cycles, fewer surprises

## ADR → Approval Workflow

**Problem**: Approval tracking scattered across email/Slack
**Solution**: Formal approval checklist in template
**Result**: Clear decision trail, auditable approval process

## Spec → SLA Requirements

**Problem**: Performance targets not documented in specs
**Solution**: SLA section defines all metrics and targets
**Result**: Implementation teams know exact requirements
```

---

## Next Steps

1. **Choose your customizations**: Which patterns match your team's needs?
2. **Create custom templates**: Copy and edit default templates
3. **Test thoroughly**: Verify generated files include custom sections
4. **Document for team**: Explain why customizations were made
5. **Commit and push**: Share with team via git
6. **Gather feedback**: Refine templates based on team input

---

## See Also

- `.claude/docs/TEMPLATE-CUSTOMIZATION.md` - Complete customization guide
- `.claude/templates/` - Default templates directory
- `.claude/templates/local/` - Custom templates (examples included)
- `CLAUDE.md` - Project overview and commands
