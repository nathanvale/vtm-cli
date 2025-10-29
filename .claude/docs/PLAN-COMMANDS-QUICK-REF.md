# Plan Commands Quick Reference

**Version:** 1.0.0
**Last Updated:** 2025-10-30

---

## Overview

Quick reference for all plan domain and VTM commands. Use this guide for rapid command lookup and common scenarios.

---

## Plan Domain Commands

### PRD Commands

#### `/plan:create-prd`

**Purpose:** Create a new PRD from template

**Syntax:**

```bash
/plan:create-prd "<name>" "<description>"
```

**Examples:**

```bash
/plan:create-prd "auth-system" "Multi-tenant authentication system"
/plan:create-prd "dashboard" "Analytics dashboard with real-time data"
```

**Output:** `prd/<name>.md`

**Next Step:** Fill in 7 PRD sections, then generate ADRs

---

### ADR Commands

#### `/plan:create-adr`

**Purpose:** Create a single ADR from template

**Syntax:**

```bash
/plan:create-adr "<decision-title>"
```

**Examples:**

```bash
/plan:create-adr "JWT Token Authentication"
/plan:create-adr "PostgreSQL for User Data"
```

**Output:** `docs/adr/ADR-XXX-<title>.md`

**Next Step:** Fill in ADR sections, then create spec

---

#### `/plan:generate-adrs`

**Purpose:** Generate multiple ADRs from PRD decisions

**Syntax:**

```bash
/plan:generate-adrs <prd-file>
```

**Examples:**

```bash
/plan:generate-adrs prd/auth-system.md
/plan:generate-adrs prd/dashboard.md
```

**Output:** Multiple `docs/adr/ADR-XXX-*.md` files

**Performance:** First run ~120s, caches research for 40% speedup

**Next Step:** Review ADRs, then batch create specs

---

#### `/plan:validate-adr`

**Purpose:** Validate ADR structure

**Syntax:**

```bash
/plan:validate-adr <adr-file>
```

**Examples:**

```bash
/plan:validate-adr docs/adr/ADR-001-jwt-auth.md
```

**Checks:**

- Frontmatter completeness
- Required sections present
- Status is valid
- Cross-references

---

### Spec Commands

#### `/plan:create-spec`

**Purpose:** Create a single spec from ADR

**Syntax:**

```bash
/plan:create-spec <adr-file>
/plan:create-spec <adr-file> --title "Custom Title"
```

**Examples:**

```bash
/plan:create-spec docs/adr/ADR-001-jwt-auth.md
/plan:create-spec docs/adr/ADR-001.md --title "JWT Implementation v2"
```

**Output:** `docs/specs/spec-<name>.md`

**Performance:** Reuses cache from ADR generation (40% faster)

**Next Step:** Fill in spec, validate pairing, convert to VTM

---

#### `/plan:create-specs`

**Purpose:** Batch create specs from multiple ADRs

**Syntax:**

```bash
vtm create-specs "<glob-pattern>" [--dry-run]
```

**Examples:**

```bash
# Dry-run first (recommended)
vtm create-specs "docs/adr/ADR-*.md" --dry-run

# Execute
vtm create-specs "docs/adr/ADR-*.md"

# Specific range
vtm create-specs "docs/adr/ADR-{001..003}-*.md"
```

**Output:** Multiple `docs/specs/spec-*.md` files

**Performance:** High cache hit rate (80%+), parallel processing

**Next Step:** Validate pairs, convert to VTM

---

#### `/plan:validate-spec`

**Purpose:** Validate spec structure

**Syntax:**

```bash
/plan:validate-spec <spec-file>
```

**Examples:**

```bash
/plan:validate-spec docs/specs/spec-jwt-auth.md
```

**Checks:**

- Frontmatter completeness
- Required sections present
- Task breakdown exists
- ADR references

---

### Validation Commands

#### `/plan:validate`

**Purpose:** Validate ADR+Spec pairing

**Syntax:**

```bash
/plan:validate "<adr-file>" "<spec-file>"
```

**Examples:**

```bash
/plan:validate "docs/adr/ADR-001-jwt-auth.md" "docs/specs/spec-jwt-auth.md"
```

**Checks:**

- ADR structure
- Spec structure
- Cross-references
- Task breakdown readiness

**Next Step:** If valid, convert to VTM

---

#### `/plan:validate-prd`

**Purpose:** Validate PRD structure

**Syntax:**

```bash
/plan:validate-prd <prd-file>
```

**Examples:**

```bash
/plan:validate-prd prd/auth-system.md
```

**Checks:**

- All 7 sections present
- Frontmatter complete
- Decisions section has content

---

### Conversion Commands

#### `/plan:to-vtm`

**Purpose:** Convert ADR+Spec to VTM tasks

**Syntax:**

```bash
/plan:to-vtm <adr-file> <spec-file> [--preview | --commit]
```

**Examples:**

```bash
# Preview first (recommended)
/plan:to-vtm adr/ADR-001-jwt-auth.md specs/spec-jwt-auth.md --preview

# Commit after review
/plan:to-vtm adr/ADR-001-jwt-auth.md specs/spec-jwt-auth.md --commit

# Update existing tasks
/plan:to-vtm adr/ADR-001.md specs/spec-001.md --update
```

**Output:**

- Tasks added to `vtm.json`
- Transaction recorded in history

**Next Step:** Work on tasks with `/vtm:work`

---

## VTM Task Commands

### Workflow Commands

#### `/vtm:next`

**Purpose:** List ready tasks with quick start hints

**Syntax:**

```bash
/vtm:next [--limit N]
```

**Examples:**

```bash
/vtm:next
/vtm:next --limit 5
```

**Output:** Ready tasks with dependencies met

---

#### `/vtm:work`

**Purpose:** Start task and view context in one step

**Syntax:**

```bash
/vtm:work <task-id> [--mode minimal|compact]
```

**Examples:**

```bash
/vtm:work TASK-001
/vtm:work TASK-001 --mode compact
```

**Actions:**

1. Marks task as in-progress
2. Sets as current task in session
3. Displays context (minimal or compact)

**Next Step:** Implement with TDD, then `/vtm:done`

---

#### `/vtm:done`

**Purpose:** Complete current task and show next steps

**Syntax:**

```bash
/vtm:done [task-id]
```

**Examples:**

```bash
# Complete current task
/vtm:done

# Complete specific task
/vtm:done TASK-001
```

**Actions:**

1. Marks task as completed
2. Clears current task from session
3. Shows next ready tasks

---

#### `/vtm:context`

**Purpose:** View task context without starting

**Syntax:**

```bash
/vtm:context <task-id> [--mode minimal|compact]
```

**Examples:**

```bash
/vtm:context TASK-001
/vtm:context TASK-001 --mode compact
```

**Output:** Task details with ADR/Spec context

---

#### `/vtm:start`

**Purpose:** Mark task as in-progress

**Syntax:**

```bash
/vtm:start <task-id> [--force]
```

**Examples:**

```bash
/vtm:start TASK-001
/vtm:start TASK-001 --force  # Skip hints
```

**Note:** Use `/vtm:work` instead for start + context

---

#### `/vtm:complete`

**Purpose:** Mark task as completed

**Syntax:**

```bash
/vtm:complete <task-id> [--force]
```

**Examples:**

```bash
/vtm:complete TASK-001
/vtm:complete TASK-001 --force  # Skip validation
```

**Note:** Use `/vtm:done` for complete + next steps

---

### Query Commands

#### `vtm list`

**Purpose:** List tasks with filters

**Syntax:**

```bash
vtm list [--filter key=value] [--sort field]
```

**Examples:**

```bash
# All tasks
vtm list

# Filter by status
vtm list --filter status=pending
vtm list --filter status=in-progress

# Filter by test strategy
vtm list --filter test_strategy=TDD

# Filter by risk level
vtm list --filter risk_level=High

# Sort by field
vtm list --sort priority
```

---

#### `vtm task`

**Purpose:** View full task details

**Syntax:**

```bash
vtm task <task-id>
```

**Examples:**

```bash
vtm task TASK-001
```

**Output:** Complete task details including context

---

#### `vtm stats`

**Purpose:** View VTM statistics

**Syntax:**

```bash
vtm stats
```

**Output:**

- Total tasks
- By status (pending/in-progress/completed/blocked)
- By test strategy
- By risk level

---

### History Commands

#### `vtm history`

**Purpose:** List transaction history

**Syntax:**

```bash
vtm history [--limit N]
```

**Examples:**

```bash
vtm history
vtm history --limit 10
```

**Output:** List of transactions with IDs, dates, task counts

---

#### `vtm history-detail`

**Purpose:** View transaction details

**Syntax:**

```bash
vtm history-detail <transaction-id>
```

**Examples:**

```bash
vtm history-detail 2025-10-30-001
```

**Output:**

- Source ADR/Spec
- Tasks added
- Task summaries
- Rollback safety check

---

### Rollback Commands

#### `vtm rollback`

**Purpose:** Rollback a transaction

**Syntax:**

```bash
vtm rollback <transaction-id> [--dry-run | --force] [--cascade]
```

**Examples:**

```bash
# Preview (recommended)
vtm rollback 2025-10-30-001 --dry-run

# Execute with confirmation
vtm rollback 2025-10-30-001

# Skip confirmation
vtm rollback 2025-10-30-001 --force

# Remove dependent tasks too
vtm rollback 2025-10-30-001 --force --cascade
```

**Safety:** Checks for blocking dependencies before removal

---

### Cache Commands

#### `vtm cache-stats`

**Purpose:** View cache performance statistics

**Syntax:**

```bash
vtm cache-stats
```

**Output:**

- Total requests
- Cache hits/misses
- Hit rate percentage
- Cached topics
- Performance improvement

---

#### `vtm cache-clear`

**Purpose:** Clear research cache

**Syntax:**

```bash
vtm cache-clear [--confirm]
```

**Examples:**

```bash
vtm cache-clear --confirm
```

**Warning:** Removes all cached research, reduces performance

---

#### `vtm cache-refresh`

**Purpose:** Refresh stale cache entries

**Syntax:**

```bash
vtm cache-refresh [--age-days N]
```

**Examples:**

```bash
# Refresh entries older than 30 days
vtm cache-refresh --age-days 30
```

---

### Session Commands

#### `vtm session get`

**Purpose:** Get current task ID

**Syntax:**

```bash
vtm session get
```

**Output:** Current task ID or empty

**Exit Code:** 0 if set, 1 if empty

---

#### `vtm session set`

**Purpose:** Set current task ID

**Syntax:**

```bash
vtm session set <task-id>
```

**Examples:**

```bash
vtm session set TASK-001
```

---

#### `vtm session clear`

**Purpose:** Clear current task

**Syntax:**

```bash
vtm session clear
```

---

## Common Scenarios

### Scenario 1: Complete New Feature

**Goal:** Go from idea to executable tasks

```bash
# 1. Create PRD
/plan:create-prd "auth-system" "Multi-tenant authentication"

# 2. Edit PRD, then generate ADRs
/plan:generate-adrs prd/auth-system.md

# 3. Review ADRs, then batch create specs
vtm create-specs "docs/adr/ADR-*.md" --dry-run
vtm create-specs "docs/adr/ADR-*.md"

# 4. Validate first pair
/plan:validate "docs/adr/ADR-001-jwt-auth.md" "docs/specs/spec-jwt-auth.md"

# 5. Convert to VTM
/plan:to-vtm adr/ADR-001-jwt-auth.md specs/spec-jwt-auth.md --preview
/plan:to-vtm adr/ADR-001-jwt-auth.md specs/spec-jwt-auth.md --commit

# 6. Start working
/vtm:work TASK-001
```

---

### Scenario 2: Incremental Feature Addition

**Goal:** Add tasks to existing VTM

```bash
# 1. Create new ADR
/plan:create-adr "Redis Caching Strategy"

# 2. Edit ADR, then create spec
/plan:create-spec docs/adr/ADR-003-redis-cache.md

# 3. Validate pairing
/plan:validate "docs/adr/ADR-003-redis-cache.md" "docs/specs/spec-redis-cache.md"

# 4. Convert to VTM
/plan:to-vtm adr/ADR-003.md specs/spec-003.md --commit

# 5. Check new tasks
vtm list --filter status=pending
```

---

### Scenario 3: Review and Rollback

**Goal:** Preview changes, rollback if needed

```bash
# 1. Check what was added
vtm history

# 2. Review specific transaction
vtm history-detail 2025-10-30-001

# 3. Preview rollback
vtm rollback 2025-10-30-001 --dry-run

# 4. Execute rollback
vtm rollback 2025-10-30-001 --force
```

---

### Scenario 4: Update Existing Tasks

**Goal:** Refresh tasks after spec changes

```bash
# 1. Update spec
vim docs/specs/spec-jwt-auth.md

# 2. Update VTM tasks
/plan:to-vtm adr/ADR-001.md specs/spec-001.md --update

# 3. Review changes
vtm task TASK-001
```

---

### Scenario 5: Batch Processing

**Goal:** Process multiple features efficiently

```bash
# 1. Generate all ADRs from PRD
/plan:generate-adrs prd/complete-system.md

# 2. Batch create all specs (high cache hit rate)
vtm create-specs "docs/adr/ADR-*.md"

# 3. Validate each pair
/plan:validate "docs/adr/ADR-001.md" "docs/specs/spec-001.md"
/plan:validate "docs/adr/ADR-002.md" "docs/specs/spec-002.md"

# 4. Convert all to VTM
/plan:to-vtm adr/ADR-001.md specs/spec-001.md --commit
/plan:to-vtm adr/ADR-002.md specs/spec-002.md --commit

# 5. Check cache performance
vtm cache-stats
```

---

### Scenario 6: Fix Validation Errors

**Goal:** Resolve document issues

```bash
# 1. Validate and see errors
/plan:validate "docs/adr/ADR-001.md" "docs/specs/spec-001.md"

# 2. Fix ADR issues
vim docs/adr/ADR-001.md
# Add missing sections

# 3. Fix spec issues
vim docs/specs/spec-001.md
# Add task breakdown section

# 4. Re-validate
/plan:validate "docs/adr/ADR-001.md" "docs/specs/spec-001.md"

# 5. Convert when valid
/plan:to-vtm adr/ADR-001.md specs/spec-001.md --commit
```

---

## Workflow Patterns

### Pattern 1: Streamlined (Recommended)

**For:** Fast iteration, single features

```bash
/plan:create-prd "feature" "description"
# Edit PRD
/plan:generate-adrs prd/feature.md
# Review ADRs
vtm create-specs "docs/adr/ADR-*.md"
# Review specs
/plan:to-vtm adr/ADR-001.md specs/spec-001.md --commit
/vtm:work TASK-001
```

**Pros:** Fast, simple, good for small features

---

### Pattern 2: Validated (Production)

**For:** Critical features, team workflows

```bash
/plan:create-prd "feature" "description"
# Edit PRD
/plan:validate-prd prd/feature.md
/plan:generate-adrs prd/feature.md
# Review ADRs
/plan:validate-adr docs/adr/ADR-001.md
vtm create-specs "docs/adr/ADR-*.md" --dry-run
vtm create-specs "docs/adr/ADR-*.md"
# Review specs
/plan:validate "docs/adr/ADR-001.md" "docs/specs/spec-001.md"
/plan:to-vtm adr/ADR-001.md specs/spec-001.md --preview
/plan:to-vtm adr/ADR-001.md specs/spec-001.md --commit
vtm history-detail TRANSACTION-ID
/vtm:work TASK-001
```

**Pros:** Safe, validated, auditable

---

### Pattern 3: Batch (Large Projects)

**For:** Multiple features, system-wide changes

```bash
/plan:create-prd "system" "complete system"
# Edit PRD with many decisions
/plan:generate-adrs prd/system.md
# Review all ADRs
vtm create-specs "docs/adr/ADR-*.md"
# Review all specs
# Convert all pairs
for i in {1..10}; do
  /plan:to-vtm adr/ADR-00${i}.md specs/spec-00${i}.md --commit
done
vtm cache-stats
vtm list --filter status=pending
```

**Pros:** Efficient, high cache reuse, comprehensive

---

## Flags Reference

### Common Flags

| Flag        | Commands                        | Purpose                        |
| ----------- | ------------------------------- | ------------------------------ |
| `--dry-run` | `create-specs`, `rollback`      | Preview without executing      |
| `--preview` | `to-vtm`                        | Show tasks without committing  |
| `--commit`  | `to-vtm`                        | Commit tasks to VTM            |
| `--force`   | `start`, `complete`, `rollback` | Skip confirmations             |
| `--cascade` | `rollback`                      | Remove dependent tasks         |
| `--update`  | `to-vtm`                        | Update existing tasks          |
| `--mode`    | `work`, `context`               | Context mode (minimal/compact) |
| `--limit`   | `next`, `history`               | Limit results                  |
| `--filter`  | `list`                          | Filter by field=value          |
| `--sort`    | `list`                          | Sort by field                  |

---

## Performance Tips

### 1. Use Batch Operations

**Slow:**

```bash
vtm create-spec docs/adr/ADR-001.md
vtm create-spec docs/adr/ADR-002.md
vtm create-spec docs/adr/ADR-003.md
```

**Fast:**

```bash
vtm create-specs "docs/adr/ADR-*.md"
```

**Benefit:** 40% faster with high cache reuse

---

### 2. Preview Before Commit

**Always:**

```bash
/plan:to-vtm adr/ADR-001.md specs/spec-001.md --preview
# Review output
/plan:to-vtm adr/ADR-001.md specs/spec-001.md --commit
```

**Benefit:** Catch errors before committing

---

### 3. Monitor Cache

**Regularly:**

```bash
vtm cache-stats
```

**Target:** 70%+ hit rate

**If Low:** Use batch operations, process related features together

---

### 4. Leverage Transaction History

**After Conversions:**

```bash
vtm history
vtm history-detail TRANSACTION-ID
```

**Benefit:** Audit trail, safe rollback

---

## Troubleshooting Quick Fixes

### Issue: Command Not Found

```bash
# Solution: Rebuild and link
pnpm run build
pnpm link
```

---

### Issue: Validation Failed

```bash
# Solution: Check template sections
/plan:validate-adr docs/adr/ADR-001.md
# Fix missing sections, retry
```

---

### Issue: Low Cache Hit Rate

```bash
# Solution: Use batch operations
vtm create-specs "docs/adr/ADR-*.md"
# Don't clear cache unnecessarily
```

---

### Issue: Rollback Blocked

```bash
# Solution: Check dependencies first
vtm rollback TRANSACTION-ID --dry-run
# Use --cascade if safe
vtm rollback TRANSACTION-ID --force --cascade
```

---

## Related Documentation

- [Complete Workflow Guide](PLAN-WORKFLOW-COMPLETE.md) - Detailed step-by-step guide
- [Phase 2 Completion Report](PHASE-2-COMPLETION-REPORT.md) - Feature overview
- [Validation Examples](VALIDATION-EXAMPLES.md) - Validation patterns
- [Template Customization](TEMPLATE-CUSTOMIZATION.md) - Customize templates
