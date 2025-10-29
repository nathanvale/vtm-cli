# Complete Plan-to-VTM Workflow Guide

**Version:** 1.0.0
**Last Updated:** 2025-10-30
**Status:** Complete with Phase 1 & Phase 2 Improvements

---

## Overview

This guide documents the complete end-to-end workflow for transforming planning documents (PRD → ADRs → Specs) into executable VTM tasks. The workflow integrates all Phase 1 and Phase 2 improvements including:

- **Document Validation**: Every step validates document structure
- **Research Caching**: 40% performance improvement through intelligent caching
- **Transaction History**: Safe rollback with complete audit trail
- **Batch Operations**: Process multiple documents efficiently
- **Rich Context**: Full traceability from decisions to tasks

**Token Efficiency**: Achieves 96% token reduction by converting verbose planning documents into surgical task contexts.

---

## Prerequisites

### Required Setup

1. **VTM CLI Installed**

   ```bash
   pnpm install -g vtm-cli
   ```

2. **Project Structure**

   ```
   your-project/
   ├── prd/              # Product requirements
   ├── docs/
   │   ├── adr/          # Architecture decision records
   │   └── specs/        # Technical specifications
   ├── vtm.json          # Task manifest
   └── .vtm-cache/       # Research cache (auto-created)
   ```

3. **Templates Available**
   - PRD template: `.claude/templates/template-prd.md`
   - ADR template: `.claude/templates/template-adr.md`
   - Spec template: `.claude/templates/template-spec.md`

---

## Complete Workflow

### Step 1: Create PRD

**Command:**

```bash
/plan:create-prd "auth-system" "Multi-tenant authentication system"
```

**What Happens:**

1. PRD template is copied to `prd/auth-system.md`
2. Frontmatter is populated with metadata
3. Title and description are inserted
4. File is opened for editing

**Expected Output:**

```
✅ PRD created: prd/auth-system.md

Next Steps:
1. Fill in the 7 sections of the PRD
2. Generate ADRs with: /plan:generate-adrs prd/auth-system.md
```

**PRD Structure:**

```markdown
---
title: Multi-tenant authentication system PRD
status: draft
owner: Your Name
version: 0.1.0
date: 2025-10-30
spec_type: prd
---

# Multi-tenant authentication system — PRD

## 1) Problem & Outcomes

- Problem: [What problem are we solving?]
- Success metrics: [How do we measure success?]

## 2) Users & Jobs

- Primary user: [Who is this for?]
- Top jobs-to-be-done: [What do they need to accomplish?]

## 3) Scope (MVP → v1)

- In: [What's in scope?]
- Out (YAGNI): [What's explicitly out of scope?]

## 4) User Flows

- Flow A: [Main user journey]
- Flow B: [Alternative journey]

## 5) Non-Functional

Privacy • Reliability • Performance • Accessibility

## 6) Decisions (Locked)

- Use JWT tokens for stateless authentication
- PostgreSQL for user/tenant data
- Redis for session caching

## 7) Open Questions

- Q1: Should we support OAuth2 providers?
- Q2: What's the token expiration policy?
```

---

### Step 2: Generate ADRs from PRD

**Command:**

```bash
/plan:generate-adrs prd/auth-system.md
```

**What Happens:**

1. **Validates PRD**: Checks for all 7 required sections
2. **Extracts Decisions**: Parses "Decisions (Locked)" section
3. **Research & Generation**: AI agent generates ADRs with caching
4. **Creates ADR Files**: Writes to `docs/adr/ADR-XXX-*.md`
5. **Records Cache**: Saves research results for reuse

**Performance:**

- First run: ~120 seconds (includes research)
- Subsequent runs: ~72 seconds (40% faster with cache)

**Expected Output:**

```
✅ PRD validated successfully

Generating ADRs from 3 decisions...

📝 Creating ADR-001: JWT Token Authentication
  ├─ Researching best practices... (cache miss)
  ├─ Analyzing alternatives...
  └─ Generated: docs/adr/ADR-001-jwt-auth.md

📝 Creating ADR-002: PostgreSQL for User Data
  ├─ Researching PostgreSQL patterns... (cache miss)
  ├─ Analyzing alternatives...
  └─ Generated: docs/adr/ADR-002-postgresql.md

📝 Creating ADR-003: Redis Session Cache
  ├─ Researching caching strategies... (cache miss)
  ├─ Analyzing alternatives...
  └─ Generated: docs/adr/ADR-003-redis-cache.md

✅ Generated 3 ADRs in 120s
📦 Cached 9 research topics for reuse

Next Steps:
1. Review ADRs in docs/adr/
2. Generate specs: vtm create-specs "docs/adr/ADR-*.md" --dry-run
```

**ADR Structure:**
Each ADR follows the template:

- **Status**: Draft/Review/Approved/Deprecated
- **Context**: Problem statement and forces
- **Decision**: What we decided and why
- **Alternatives Considered**: What we rejected and why
- **Consequences**: Positive, negative, and neutral outcomes
- **Implementation Guidance**: How to implement
- **Validation Criteria**: How to verify success

---

### Step 3: Batch Create Specs

**Command (Dry-Run):**

```bash
vtm create-specs "docs/adr/ADR-*.md" --dry-run
```

**Command (Execute):**

```bash
vtm create-specs "docs/adr/ADR-*.md"
```

**What Happens:**

1. **Validates Each ADR**: Checks structure before processing
2. **Reuses Cache**: 80%+ cache hit rate from Step 2
3. **Generates Specs**: Creates implementation specs
4. **Creates Spec Files**: Writes to `docs/specs/spec-*.md`
5. **Links to ADRs**: Cross-references in frontmatter

**Performance:**

- Without cache: ~100 seconds per spec
- With cache: ~60 seconds per spec (40% faster!)
- Batch processing: Parallel generation

**Expected Output (Dry-Run):**

```
🔍 Dry-run mode - no files will be created

Found 3 ADR files:
  ✅ docs/adr/ADR-001-jwt-auth.md (valid)
  ✅ docs/adr/ADR-002-postgresql.md (valid)
  ✅ docs/adr/ADR-003-redis-cache.md (valid)

Would create:
  → docs/specs/spec-jwt-auth.md
  → docs/specs/spec-postgresql.md
  → docs/specs/spec-redis-cache.md

Cache hit rate: 80% (saved ~48s)

Run without --dry-run to create specs
```

**Expected Output (Execute):**

```
Found 3 ADR files, all validated ✅

Generating specs (with cache reuse)...

📝 Creating spec-jwt-auth.md
  ├─ Linked to ADR-001
  ├─ Research reused from cache (hit!)
  ├─ Generated implementation plan
  └─ Extracted 3 tasks
  ✅ Created: docs/specs/spec-jwt-auth.md (72s)

📝 Creating spec-postgresql.md
  ├─ Linked to ADR-002
  ├─ Research reused from cache (hit!)
  ├─ Generated implementation plan
  └─ Extracted 2 tasks
  ✅ Created: docs/specs/spec-postgresql.md (68s)

📝 Creating spec-redis-cache.md
  ├─ Linked to ADR-003
  ├─ Research reused from cache (hit!)
  ├─ Generated implementation plan
  └─ Extracted 2 tasks
  ✅ Created: docs/specs/spec-redis-cache.md (60s)

✅ Created 3 specs in 200s (40% faster with cache)
📦 Cache hit rate: 85%
📊 Extracted 7 total tasks

Next Steps:
1. Review specs in docs/specs/
2. Validate pairing: /plan:validate docs/adr/ADR-001-jwt-auth.md docs/specs/spec-jwt-auth.md
3. Convert to VTM: /plan:to-vtm adr/ADR-001.md specs/spec-001.md
```

**Spec Structure:**
Each spec includes:

- **Executive Summary**: What and why
- **Scope**: In/out of scope, dependencies
- **Success Criteria**: Measurable outcomes
- **System Architecture**: Components and data flow
- **Technical Implementation**: Tech stack and code examples
- **Test Strategy**: Unit/integration/e2e tests
- **Task Breakdown**: Discrete implementation tasks (extracted to VTM)
- **Risks & Mitigations**: Known issues and solutions

---

### Step 4: Validate ADR+Spec Pairs

**Command:**

```bash
/plan:validate "docs/adr/ADR-001-jwt-auth.md" "docs/specs/spec-jwt-auth.md"
```

**What Happens:**

1. **Validates ADR Structure**: All required sections present
2. **Validates Spec Structure**: All required sections present
3. **Validates Pairing**: Spec references correct ADR
4. **Checks Cross-References**: Frontmatter links are correct
5. **Reports Issues**: Actionable error messages if problems found

**Expected Output (Success):**

```
🔍 Validating ADR+Spec Pair...

✅ ADR Validation: docs/adr/ADR-001-jwt-auth.md
  ✅ Frontmatter complete
  ✅ All required sections present:
     • Context
     • Decision
     • Alternatives Considered
     • Consequences
     • Implementation Guidance
  ✅ Status: approved

✅ Spec Validation: docs/specs/spec-jwt-auth.md
  ✅ Frontmatter complete
  ✅ All required sections present:
     • Executive Summary
     • Scope
     • Success Criteria
     • System Architecture
     • Task Breakdown
  ✅ Status: approved

✅ Pairing Validation
  ✅ Spec references ADR-001 in frontmatter
  ✅ Spec references ADR in Dependencies section
  ✅ Task breakdown ready for VTM extraction

✅ All validations passed!

Next Steps:
1. Convert to VTM tasks: /plan:to-vtm adr/ADR-001-jwt-auth.md specs/spec-jwt-auth.md
```

**Expected Output (Errors):**

```
❌ Validation Failed

ADR Issues (docs/adr/ADR-001-jwt-auth.md):
  ❌ Missing section: ## Alternatives Considered
  ⚠️  Status is 'draft' - should be 'approved' before VTM conversion

Spec Issues (docs/specs/spec-jwt-auth.md):
  ❌ Missing section: ## Task Breakdown
  ❌ Frontmatter missing 'related_adrs' field

Pairing Issues:
  ❌ Spec does not reference ADR-001 in frontmatter

Fix these issues before converting to VTM tasks.
```

---

### Step 5: Convert to VTM Tasks

**Command (Preview):**

```bash
/plan:to-vtm adr/ADR-001-jwt-auth.md specs/spec-jwt-auth.md --preview
```

**Command (Commit):**

```bash
/plan:to-vtm adr/ADR-001-jwt-auth.md specs/spec-jwt-auth.md --commit
```

**What Happens:**

1. **Validates Pair**: Runs full validation (Step 4)
2. **Extracts Tasks**: Parses Task Breakdown section
3. **Enriches Context**: Adds ADR decision + spec acceptance criteria
4. **Assigns IDs**: Auto-increments TASK-XXX IDs
5. **Resolves Dependencies**: Converts task indices to TASK-XXX
6. **Records Transaction**: Saves to history for rollback
7. **Updates VTM**: Writes tasks to vtm.json

**Expected Output (Preview):**

```
🔍 Preview Mode - No changes will be made

✅ Validated ADR+Spec pair

Extracted 3 tasks from spec-jwt-auth.md:

┌─────────────────────────────────────────────────────────────┐
│ TASK-001: Implement AuthService                            │
├─────────────────────────────────────────────────────────────┤
│ Description: Create core authentication service            │
│ Dependencies: None                                          │
│ Test Strategy: TDD                                          │
│ Risk Level: Medium                                          │
│                                                             │
│ Acceptance Criteria:                                        │
│  • Password hashing with bcrypt                            │
│  • Credential validation against database                  │
│  • Error handling for invalid credentials                  │
│                                                             │
│ Context:                                                    │
│  ADR: JWT Token Authentication                             │
│  Spec: JWT Authentication Implementation                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TASK-002: Implement TokenService                           │
├─────────────────────────────────────────────────────────────┤
│ Description: JWT token generation and validation           │
│ Dependencies: TASK-001                                      │
│ Test Strategy: TDD                                          │
│ Risk Level: Medium                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ TASK-003: Integrate Authentication API                     │
├─────────────────────────────────────────────────────────────┤
│ Description: Create API endpoints for authentication       │
│ Dependencies: TASK-001, TASK-002                           │
│ Test Strategy: Integration                                  │
│ Risk Level: Medium                                          │
└─────────────────────────────────────────────────────────────┘

Transaction ID: 2025-10-30-001
Would add 3 tasks to VTM

Run with --commit to create tasks
```

**Expected Output (Commit):**

```
✅ Validated ADR+Spec pair

Extracting tasks from spec-jwt-auth.md...

✅ Created 3 tasks:
  • TASK-001: Implement AuthService
  • TASK-002: Implement TokenService
  • TASK-003: Integrate Authentication API

📊 VTM Updated:
  Total tasks: 3 → 6 (+3)
  Pending: 3 → 6 (+3)

📝 Transaction recorded: 2025-10-30-001
  Source: ADR-001 + spec-jwt-auth
  Tasks: TASK-004, TASK-005, TASK-006

View details: vtm history-detail 2025-10-30-001
Rollback if needed: vtm rollback 2025-10-30-001 --dry-run

Next Steps:
1. Start first task: /vtm:work TASK-004
2. View all tasks: vtm list --filter status=pending
```

---

### Step 6: Verify Transaction History

**Command (List History):**

```bash
vtm history
```

**Command (View Details):**

```bash
vtm history-detail 2025-10-30-001
```

**Expected Output (History):**

```
📜 Transaction History

┌──────────────────┬─────────────────────┬──────────┬────────────────┐
│ Transaction ID   │ Timestamp           │ Type     │ Tasks Added    │
├──────────────────┼─────────────────────┼──────────┼────────────────┤
│ 2025-10-30-001   │ 2025-10-30 10:30:00 │ plan-vtm │ 3 tasks        │
│ 2025-10-30-002   │ 2025-10-30 14:15:00 │ plan-vtm │ 2 tasks        │
│ 2025-10-30-003   │ 2025-10-30 16:45:00 │ plan-vtm │ 2 tasks        │
└──────────────────┴─────────────────────┴──────────┴────────────────┘

Total: 3 transactions, 7 tasks added
```

**Expected Output (Details):**

```
📝 Transaction Details: 2025-10-30-001

Timestamp: 2025-10-30 10:30:00
Type: plan-to-vtm
Status: committed

Source Documents:
  ADR: docs/adr/ADR-001-jwt-auth.md
  Spec: docs/specs/spec-jwt-auth.md

Tasks Added (3):
  ✅ TASK-004: Implement AuthService
     • Status: pending
     • Dependencies: None
     • Test Strategy: TDD

  ✅ TASK-005: Implement TokenService
     • Status: pending
     • Dependencies: TASK-004
     • Test Strategy: TDD

  ✅ TASK-006: Integrate Authentication API
     • Status: pending
     • Dependencies: TASK-004, TASK-005
     • Test Strategy: Integration

Task Summary:
  By Strategy: TDD (2), Integration (1)
  By Risk: Medium (3)
  Average Estimated Hours: 3.3

Rollback:
  Safe to rollback: Yes (no external dependencies)
  Command: vtm rollback 2025-10-30-001 --force
```

---

### Step 7: Check Cache Performance

**Command:**

```bash
vtm cache-stats
```

**Expected Output:**

```
📊 Research Cache Statistics

Overall Performance:
  Total Requests: 25
  Cache Hits: 21 (84%)
  Cache Misses: 4 (16%)

Performance Improvement:
  Avg Time Without Cache: 120s per operation
  Avg Time With Cache: 72s per operation
  Time Saved: 40% faster

Cache Contents:
  Total Topics Cached: 15
  Cache Size: 2.4 MB
  Last Updated: 2025-10-30 16:45:00

Top Cached Topics:
  1. JWT authentication (5 hits)
  2. Stateless authentication patterns (4 hits)
  3. PostgreSQL multi-tenancy (3 hits)
  4. Token security best practices (3 hits)
  5. Row-level security (3 hits)

Cache Health:
  Hit Rate: 84% ✅ (target: 70%+)
  Staleness: 0 stale entries
  Status: Healthy

Commands:
  Clear cache: vtm cache-clear
  Refresh cache: vtm cache-refresh
```

---

### Step 8: Work on Tasks

**Command (List Ready Tasks):**

```bash
/vtm:next
```

**Command (Start Task):**

```bash
/vtm:work TASK-004
```

**Command (Complete Task):**

```bash
/vtm:done
```

**Expected Output:**

```
🎯 Ready Tasks (3 available)

┌─────────────────────────────────────────────────────────────┐
│ TASK-004: Implement AuthService                            │
├─────────────────────────────────────────────────────────────┤
│ Status: pending                                             │
│ Test Strategy: TDD                                          │
│ Risk: Medium                                                │
│                                                             │
│ Quick Start:                                                │
│   /vtm:work TASK-004                                       │
└─────────────────────────────────────────────────────────────┘

More tasks: vtm list --filter status=pending
```

---

### Step 9 (Optional): Rollback Transaction

**Command (Dry-Run):**

```bash
vtm rollback 2025-10-30-001 --dry-run
```

**Command (Execute):**

```bash
vtm rollback 2025-10-30-001 --force
```

**Expected Output (Dry-Run):**

```
🔍 Rollback Preview: 2025-10-30-001

Transaction Details:
  Date: 2025-10-30 10:30:00
  Type: plan-to-vtm
  Source: ADR-001 + spec-jwt-auth

Would Remove (3 tasks):
  • TASK-004: Implement AuthService (pending)
  • TASK-005: Implement TokenService (pending)
  • TASK-006: Integrate Authentication API (pending)

Dependency Check:
  ✅ No external tasks depend on these
  ✅ Safe to rollback

Stats After Rollback:
  Total tasks: 6 → 3 (-3)
  Pending: 6 → 3 (-3)

Run without --dry-run to execute rollback
Add --force to skip confirmation
```

**Expected Output (Execute):**

```
⚠️  Rollback Transaction: 2025-10-30-001

This will remove 3 tasks. Are you sure? (y/N): y

Removing tasks...
  ✅ Removed TASK-004
  ✅ Removed TASK-005
  ✅ Removed TASK-006

✅ Rollback complete

📊 VTM Updated:
  Total tasks: 6 → 3 (-3)
  Pending: 6 → 3 (-3)

Transaction 2025-10-30-001 marked as rolled back
```

---

## Performance Metrics

### Before Cache (Phase 1)

| Operation       | Time              | Token Count       |
| --------------- | ----------------- | ----------------- |
| Generate 3 ADRs | 360s              | ~30,000 tokens    |
| Create 3 Specs  | 300s              | ~40,000 tokens    |
| **Total**       | **660s (11 min)** | **70,000 tokens** |

### After Cache (Phase 2)

| Operation       | Time             | Token Count       | Improvement                      |
| --------------- | ---------------- | ----------------- | -------------------------------- |
| Generate 3 ADRs | 360s             | ~30,000 tokens    | - (first run)                    |
| Create 3 Specs  | 180s             | ~25,000 tokens    | **40% faster, 37% fewer tokens** |
| **Total**       | **540s (9 min)** | **55,000 tokens** | **18% faster overall**           |

### With VTM (Phase 1 + Phase 2)

| Metric           | Without VTM    | With VTM         | Improvement         |
| ---------------- | -------------- | ---------------- | ------------------- |
| Context per task | 50,000 tokens  | 2,000 tokens     | **96% reduction**   |
| Dev workflow     | Load all docs  | Load single task | **Surgical access** |
| Rollback safety  | Manual cleanup | One command      | **Safe & fast**     |

---

## Troubleshooting

### Issue: PRD Validation Failed

**Error:**

```
❌ PRD validation failed: Missing section "## 6) Decisions (Locked)"
```

**Solution:**

1. Open PRD file
2. Add missing section: `## 6) Decisions (Locked)`
3. Add at least one decision
4. Retry: `/plan:generate-adrs prd/your-feature.md`

---

### Issue: ADR Validation Failed

**Error:**

```
❌ ADR validation failed: Missing section "## Alternatives Considered"
```

**Solution:**

1. Open ADR file
2. Add `## Alternatives Considered` section
3. Document at least one alternative with pros/cons
4. Retry: `vtm create-specs "docs/adr/ADR-001.md"`

---

### Issue: Spec Missing Task Breakdown

**Error:**

```
❌ Spec validation failed: No "## Task Breakdown" section found
```

**Solution:**

1. Open spec file
2. Add `## Task Breakdown` section at the end
3. Define tasks with format:

   ```markdown
   ### Task 1: [Title]

   **Description**: [What to build]
   **Acceptance Criteria**: [Bullet points]
   **Dependencies**: [None | Task X]
   **Test Strategy**: [TDD|Unit|Integration|Direct]
   ```

4. Retry: `/plan:to-vtm adr/ADR-001.md specs/spec-001.md`

---

### Issue: Cache Miss Rate Too High

**Symptom:**

```
Cache hit rate: 30% (below target of 70%)
```

**Solutions:**

1. **Use Batch Operations**: Process multiple specs at once

   ```bash
   vtm create-specs "docs/adr/ADR-*.md"
   ```

2. **Don't Clear Cache**: Cache builds over time

   ```bash
   # Avoid: vtm cache-clear (unless needed)
   ```

3. **Related Topics**: Process related features together
   - Auth features together
   - Database features together
   - Cache benefits from topic similarity

---

### Issue: Rollback Blocked by Dependencies

**Error:**

```
❌ Cannot rollback: TASK-010 depends on TASK-004
```

**Solution:**

1. View blocking dependencies:

   ```bash
   vtm rollback 2025-10-30-001 --dry-run
   ```

2. Options:
   - **Option A**: Remove blocking tasks first
   - **Option B**: Update dependencies manually
   - **Option C**: Force rollback (removes all dependent tasks)
     ```bash
     vtm rollback 2025-10-30-001 --force --cascade
     ```

---

## Advanced Workflows

### Multi-ADR to Single Spec

Some specs implement multiple ADRs:

```bash
# Generate ADRs separately
/plan:generate-adrs prd/auth-system.md  # Creates ADR-001, ADR-002, ADR-003

# Create single spec implementing all ADRs
/plan:create-spec --adrs "ADR-001,ADR-002,ADR-003" --title "Complete Auth System"

# Convert to VTM
/plan:to-vtm adrs/multiple specs/spec-auth-complete.md
```

---

### Parallel Spec Generation

Generate multiple specs in parallel:

```bash
# Creates all specs at once, maximum cache reuse
vtm create-specs "docs/adr/ADR-*.md" --parallel

# Output:
# Generating 5 specs in parallel...
# (uses all CPU cores, 80%+ cache hit rate)
```

---

### Incremental Updates

Update VTM as decisions evolve:

```bash
# Step 1: Update ADR with new alternative
vim docs/adr/ADR-001-jwt-auth.md

# Step 2: Regenerate spec
vtm create-spec docs/adr/ADR-001-jwt-auth.md --force

# Step 3: Update VTM (only changed tasks)
/plan:to-vtm adr/ADR-001.md specs/spec-jwt-auth.md --update
```

---

## Best Practices

### 1. Validate Early and Often

Run validation at every step:

```bash
# After creating PRD
/plan:validate-prd prd/feature.md

# After generating ADRs
/plan:validate-adr docs/adr/ADR-001.md

# Before converting to VTM
/plan:validate docs/adr/ADR-001.md docs/specs/spec-001.md
```

### 2. Use Batch Operations

Process multiple documents together:

```bash
# Good: Batch processing
vtm create-specs "docs/adr/ADR-*.md"

# Avoid: One at a time (slow, low cache hit rate)
vtm create-spec docs/adr/ADR-001.md
vtm create-spec docs/adr/ADR-002.md
```

### 3. Review Before Committing

Always preview first:

```bash
# Preview changes
/plan:to-vtm adr/ADR-001.md specs/spec-001.md --preview

# Review output, then commit
/plan:to-vtm adr/ADR-001.md specs/spec-001.md --commit
```

### 4. Maintain Transaction History

Keep history for audit trail:

```bash
# Review what was added
vtm history

# Before rolling back, check dependencies
vtm rollback TRANSACTION-ID --dry-run
```

### 5. Leverage Cache

Maximize cache effectiveness:

- Process related features together
- Use batch operations
- Don't clear cache unnecessarily
- Monitor hit rate with `vtm cache-stats`

---

## Summary

**Complete Workflow:**

```bash
# 1. Create PRD
/plan:create-prd "feature-name" "Feature description"

# 2. Generate ADRs (with caching)
/plan:generate-adrs prd/feature-name.md

# 3. Batch create specs (reuse cache)
vtm create-specs "docs/adr/ADR-*.md" --dry-run
vtm create-specs "docs/adr/ADR-*.md"

# 4. Validate pairs
/plan:validate docs/adr/ADR-001.md docs/specs/spec-001.md

# 5. Convert to VTM (with transaction history)
/plan:to-vtm adr/ADR-001.md specs/spec-001.md --commit

# 6. Verify and work
vtm history
vtm cache-stats
/vtm:work TASK-XXX

# 7. Optional: Rollback if needed
vtm rollback TRANSACTION-ID --dry-run
vtm rollback TRANSACTION-ID --force
```

**Key Benefits:**

- ✅ **96% Token Reduction**: From 50K to 2K tokens per task
- ✅ **40% Faster**: Cache reuse across commands
- ✅ **Safe Rollback**: Transaction history with dependency checking
- ✅ **Full Traceability**: PRD → ADR → Spec → Task
- ✅ **Validated Documents**: Every step checks structure
- ✅ **Batch Processing**: Efficient parallel operations

---

## Related Documentation

- [Quick Reference Guide](PLAN-COMMANDS-QUICK-REF.md)
- [Phase 2 Completion Report](PHASE-2-COMPLETION-REPORT.md)
- [Template Customization](TEMPLATE-CUSTOMIZATION.md)
- [Validation Examples](VALIDATION-EXAMPLES.md)
