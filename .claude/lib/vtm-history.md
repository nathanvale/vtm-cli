# VTM History & Rollback Library

**Purpose:** Track task ingestion history and enable rollback of task batches.

**Location:** `src/lib/vtm-history.ts`

---

## Overview

The VTM History library adds transaction support to VTM task ingestion, enabling users to:

- Track which tasks were added by which command
- Rollback entire task batches if they were ingested incorrectly
- Maintain audit trail of planning workflow
- Recover from accidental ingestion

### Key Benefits

- **Safety net:** Undo `/plan:to-vtm --commit` if tasks are wrong
- **Audit trail:** See when/what tasks were added
- **Confidence:** Experiment with batch imports without fear
- **Team collaboration:** Track who added what tasks

---

## Architecture

```
VTM File Structure (Enhanced)
────────────────────────────────
vtm.json
├─ stats { ... }
├─ tasks [
│   ├─ {task data}
│   ├─ {task data}
│   └─ {task data with "_source_transaction": "2025-10-30-001"}
├─ history [           ← NEW
│   ├─ {
│   │   "id": "2025-10-30-001",
│   │   "action": "ingest",
│   │   "timestamp": "2025-10-30T06:15:00Z",
│   │   "source": "/plan:to-vtm",
│   │   "tasks_added": ["TASK-042", "TASK-043", "TASK-044"],
│   │   "files": {
│   │     "adr": "adr/ADR-001-oauth2-auth.md",
│   │     "spec": "specs/spec-oauth2-auth.md"
│   │   }
│   │ }
│   └─ {...}
│ ]
```

---

## Implementation

### Module Interface

```typescript
// src/lib/vtm-history.ts

interface HistoryEntry {
  id: string // Timestamp-based: "2025-10-30-001"
  action: "ingest" | "update" | "delete"
  timestamp: Date
  source: "/plan:to-vtm" | "/plan:ingest" | "manual"
  description?: string
  tasks_added?: string[] // Task IDs added
  tasks_removed?: string[] // Task IDs removed
  tasks_updated?: string[] // Task IDs modified
  files?: {
    adr?: string
    spec?: string
    other?: string[]
  }
  metadata?: Record<string, any>
}

interface RollbackOptions {
  transactionId: string
  force?: boolean // Skip confirmation
  dryRun?: boolean // Preview before rollback
}

interface HistoryStats {
  totalEntries: number
  oldestEntry: Date
  newestEntry: Date
  actionBreakdown: Record<string, number>
}

export class VTMHistory {
  // Initialize with VTM file
  constructor(vtmPath: string)

  // Record operations
  async recordIngest(
    taskIds: string[],
    source: string,
    files?: Record<string, string>,
  ): Promise<string> // Returns transaction ID

  async recordUpdate(taskIds: string[], description: string): Promise<void>

  // Query history
  async getHistory(limit?: number): Promise<HistoryEntry[]>
  async getEntry(transactionId: string): Promise<HistoryEntry | null>
  async getStats(): Promise<HistoryStats>
  async search(query: string): Promise<HistoryEntry[]>

  // Rollback support
  async getRollbackDetails(
    transactionId: string,
  ): Promise<RollbackOptions & { tasks: Array<{ id: string; title: string }> }>

  async rollback(options: RollbackOptions): Promise<void>

  // Maintenance
  async archive(before: Date): Promise<void>
  async cleanup(maxEntries?: number): Promise<void>
}
```

---

## Integration with Plan Commands

### `/plan:to-vtm` Integration

```typescript
// After successful ingest
const ingestResult = await vtmIngest.commit(tasks)

// Record in history
const transactionId = await vtmHistory.recordIngest(
  ingestResult.taskIds,
  "/plan:to-vtm",
  {
    adr: adrFilePath,
    spec: specFilePath,
  },
)

console.log(`✅ Tasks committed with transaction: ${transactionId}`)
console.log(`   Rollback if needed: /plan:rollback ${transactionId}`)
```

### Rollback Command

```bash
/plan:rollback <transaction-id> [--dry-run] [--force]
```

**Usage:**

```bash
# View recent transactions
/plan:history

# Output:
# 2025-10-30-003: ingest 3 tasks (ADR-001 + spec-oauth2-auth.md)
# 2025-10-30-002: ingest 2 tasks (ADR-002 + spec-token-storage.md)
# 2025-10-30-001: ingest 4 tasks (PRD workflow)

# Preview rollback
/plan:rollback 2025-10-30-003 --dry-run

# Output:
# 🔄 Rollback preview: 2025-10-30-003
#
# Will remove tasks:
#   - TASK-042: Implement OAuth2 authentication
#   - TASK-043: Configure token storage
#   - TASK-044: Test OAuth2 flow
#
# Dependencies:
#   - TASK-045 depends on TASK-043 (would be blocked)
#
# Proceed? /plan:rollback 2025-10-30-003 --force

# Execute rollback
/plan:rollback 2025-10-30-003 --force
```

---

## File Format

### History Structure

```json
{
  "stats": { ... },
  "tasks": [ ... ],
  "history": [
    {
      "id": "2025-10-30-001",
      "action": "ingest",
      "timestamp": "2025-10-30T06:00:00Z",
      "source": "/plan:to-vtm",
      "tasks_added": ["TASK-042", "TASK-043"],
      "files": {
        "adr": "adr/ADR-001-oauth2-auth.md",
        "spec": "specs/spec-oauth2-auth.md"
      }
    },
    {
      "id": "2025-10-30-002",
      "action": "ingest",
      "timestamp": "2025-10-30T06:15:00Z",
      "source": "/plan:to-vtm",
      "tasks_added": ["TASK-044", "TASK-045", "TASK-046"],
      "files": {
        "adr": "adr/ADR-002-token-storage.md",
        "spec": "specs/spec-token-storage.md"
      }
    }
  ]
}
```

### Transaction ID Format

```
YYYY-MM-DD-NNN
2025-10-30-001  ← Transaction 1 on Oct 30, 2025
2025-10-30-002  ← Transaction 2 on Oct 30, 2025
2025-10-31-001  ← Transaction 1 on Oct 31, 2025
```

---

## Rollback Logic

### Safety Checks

Before rolling back, verify:

1. **Transaction exists**

   ```typescript
   const entry = await history.getEntry(transactionId)
   if (!entry) throw new Error(`Transaction not found: ${transactionId}`)
   ```

2. **No blocking dependencies**

   ```typescript
   // Check if any non-rolled-back tasks depend on removed tasks
   const dependents = tasks.filter((t) =>
     entry.tasks_added?.includes(t.dependencies?.[0]),
   )

   if (dependents.length > 0 && !options.force) {
     throw new Error(
       `${dependents.length} task(s) depend on removed tasks. ` +
         `Use --force to rollback anyway.`,
     )
   }
   ```

3. **No completed tasks in batch**

   ```typescript
   // Warn if rolling back completed tasks
   const completed = await vtm
     .getTasks()
     .filter(
       (t) => entry.tasks_added?.includes(t.id) && t.status === "completed",
     )

   if (completed.length > 0) {
     console.warn(
       `⚠️  ${completed.length} completed task(s) in this batch. ` +
         `Rollback will mark them as deleted, not undone.`,
     )
   }
   ```

4. **Dry run available**
   ```bash
   /plan:rollback 2025-10-30-001 --dry-run
   # Shows what WOULD be removed without removing it
   ```

### Rollback Mechanics

```typescript
async rollback(options: RollbackOptions): Promise<void> {
  const entry = await this.getEntry(options.transactionId)

  if (!entry || !entry.tasks_added) {
    throw new Error(`No tasks to rollback in transaction: ${options.transactionId}`)
  }

  // Load current VTM
  const vtm = await loadVTM()

  // Remove tasks
  entry.tasks_added.forEach(taskId => {
    vtm.tasks = vtm.tasks.filter(t => t.id !== taskId)
  })

  // Recalculate stats
  vtm.stats = calculateStats(vtm.tasks)

  // Add rollback entry to history
  await this.recordUpdate(
    entry.tasks_added,
    `Rolled back transaction ${options.transactionId}`
  )

  // Write back
  if (!options.dryRun) {
    await saveVTM(vtm)
  }
}
```

---

## History Commands

### View History

```bash
# Show recent transactions (default: 10)
vtm history

# Output:
# Transaction History
# ─────────────────────────────────────────────────────────────
#
# 2025-10-30-003 │ ingest     │ 3 tasks  │ ADR-001 + spec-oauth2-auth.md
# 2025-10-30-002 │ ingest     │ 4 tasks  │ ADR-002 + spec-token-storage.md
# 2025-10-30-001 │ingest     │ 5 tasks  │ PRD workflow
#
# See details: vtm history 2025-10-30-003
# Rollback: vtm rollback 2025-10-30-003 --dry-run
```

### Show Entry Details

```bash
vtm history 2025-10-30-003

# Output:
# Transaction: 2025-10-30-003
# ─────────────────────────────────────────────────────────────
#
# Source:    /plan:to-vtm
# Timestamp: 2025-10-30T06:30:00Z
# Action:    ingest
#
# Tasks Added:
#   - TASK-042: Implement OAuth2 authentication
#   - TASK-043: Configure token storage with Redis
#   - TASK-044: Test OAuth2 flow with mocks
#
# From Files:
#   - ADR: adr/ADR-001-oauth2-auth.md
#   - Spec: specs/spec-oauth2-auth.md
#
# Rollback: vtm rollback 2025-10-30-003 --dry-run
```

### Rollback with Confirmation

```bash
vtm rollback 2025-10-30-003

# Output:
# 🔄 Rolling back transaction: 2025-10-30-003
#
# Will remove 3 tasks:
#   - TASK-042: Implement OAuth2 authentication
#   - TASK-043: Configure token storage with Redis
#   - TASK-044: Test OAuth2 flow
#
# Dependencies:
#   ℹ️  No other tasks depend on these
#
# Completed tasks:
#   ℹ️  None of these are marked as completed
#
# Continue with rollback? [y/N]
```

---

## Use Cases

### Case 1: Accidental Ingestion

```bash
# Oops, ingested wrong ADR
/plan:to-vtm adr/ADR-999-wrong.md specs/spec-wrong.md --commit
# Tasks TASK-050, TASK-051, TASK-052 added with id 2025-10-30-005

# Realize it's wrong
vtm history 2025-10-30-005
# Shows what was added

# Rollback
vtm rollback 2025-10-30-005 --dry-run
# Preview what will be removed

vtm rollback 2025-10-30-005 --force
# Remove those tasks

# Now ingest correct version
/plan:to-vtm adr/ADR-001-correct.md specs/spec-correct.md --commit
```

### Case 2: Batch Experiment

```bash
# Try a new workflow
/plan:create-specs "docs/adr/ADR-{001..010}.md" --with-tasks
# Commits 30+ tasks from transaction 2025-10-30-006

# Review results
vtm list
# Tasks don't look right

# Undo the whole batch
vtm rollback 2025-10-30-006 --force

# Refine specs and try again
# Edit docs/specs/...
/plan:create-specs "docs/adr/ADR-{001..010}.md" --with-tasks
# New transaction 2025-10-30-007
```

### Case 3: Audit Trail

```bash
# Team lead wants to know planning history
vtm history -n 20
# Shows all ingestion sources

# See what came from which ADR
grep -A5 "ADR-001" <(vtm history --json)
# Shows all tasks from ADR-001 ingestion
```

---

## Configuration

### Retention Policy

```json
{
  "history": {
    "archiveOldEntries": true,
    "archivePath": ".claude/history-archive",
    "enabled": true,
    "maxEntries": 1000,
    "retentionDays": 90
  }
}
```

### Commands

```bash
# View retention settings
vtm config get history

# Change retention
vtm config set history.retentionDays 180

# Archive old entries
vtm history archive --before=2025-08-01

# Cleanup
vtm history cleanup --max=500
```

---

## Testing Strategy

### Unit Tests

```typescript
describe("VTMHistory", () => {
  it("records ingest transactions", async () => {
    const history = new VTMHistory("test-vtm.json")

    const txId = await history.recordIngest(
      ["TASK-001", "TASK-002"],
      "/plan:to-vtm",
      { adr: "adr/test.md" },
    )

    const entry = await history.getEntry(txId)
    expect(entry.tasks_added).toEqual(["TASK-001", "TASK-002"])
    expect(entry.source).toBe("/plan:to-vtm")
  })

  it("generates transaction IDs correctly", async () => {
    const history = new VTMHistory("test-vtm.json")

    const id1 = await history.recordIngest(["TASK-001"], "/test")
    const id2 = await history.recordIngest(["TASK-002"], "/test")

    expect(id1).toMatch(/^\d{4}-\d{2}-\d{2}-\d{3}$/)
    expect(id2).toMatch(/^\d{4}-\d{2}-\d{2}-\d{3}$/)
    expect(id2).toBeGreaterThan(id1)
  })

  it("prevents rollback of dependent tasks", async () => {
    const history = new VTMHistory("test-vtm.json")
    const vtm = createTestVTM({
      tasks: [
        { id: "TASK-001" },
        { id: "TASK-002", dependencies: ["TASK-001"] },
      ],
    })

    const txId = await history.recordIngest(["TASK-001"], "/test")

    const error = await history.rollback({ transactionId: txId })
    expect(error).toContain("depends on")
  })

  it("performs dry-run rollback", async () => {
    const history = new VTMHistory("test-vtm.json")
    const txId = await history.recordIngest(["TASK-001"], "/test")

    const originalLength = vtm.tasks.length

    await history.rollback({ transactionId: txId, dryRun: true })

    // No actual changes
    expect(vtm.tasks.length).toBe(originalLength)
  })
})
```

### Integration Tests

```typescript
describe("Rollback workflow", () => {
  it("rolls back tasks added by /plan:to-vtm", async () => {
    // Run /plan:to-vtm
    const result = await runCommand(
      "/plan:to-vtm adr/test.md specs/test.md --commit",
    )
    const txId = extractTransactionId(result)

    // Verify tasks added
    const vtmBefore = loadVTM()
    expect(vtmBefore.tasks).toHaveLength(3)

    // Rollback
    await runCommand(`vtm rollback ${txId} --force`)

    // Verify tasks removed
    const vtmAfter = loadVTM()
    expect(vtmAfter.tasks).toHaveLength(0)
  })

  it("shows transaction history", async () => {
    await runCommand("/plan:to-vtm adr/1.md specs/1.md --commit")
    await runCommand("/plan:to-vtm adr/2.md specs/2.md --commit")

    const history = await runCommand("vtm history")

    expect(history).toContain("2025-10-30-001")
    expect(history).toContain("2025-10-30-002")
  })
})
```

---

## Performance Impact

- **History recording:** <10ms per transaction
- **Rollback operation:** ~100ms (VTM recalculation)
- **Storage overhead:** ~50 bytes per transaction
- **10,000 transactions:** ~500KB storage

No significant performance impact on normal VTM operations.

---

## Security Considerations

- History is stored locally in vtm.json
- No external API calls
- User can delete history anytime
- Add `.claude/` to `.gitignore` if keeping private
- No sensitive data in transaction records

---

## Future Enhancements

1. **Selective Rollback** - Rollback only some tasks from a transaction
2. **Branching** - "What if" scenarios without affecting main vtm.json
3. **Merging** - Combine multiple transactions
4. **Diffing** - Show exact changes before/after rollback
5. **Collaboration** - Push/pull history with team

---

## Implementation Tasks

```
□ Create src/lib/vtm-history.ts
  ├─ VTMHistory class
  ├─ Transaction ID generation
  ├─ History persistence
  └─ Rollback logic

□ Integrate with VTMWriter
  ├─ Record ingest operations
  ├─ Record updates
  └─ Calculate stats

□ Create CLI commands
  ├─ vtm history [transaction-id]
  ├─ vtm rollback <transaction-id>
  ├─ vtm history archive
  └─ vtm history cleanup

□ Testing
  ├─ Unit tests
  ├─ Integration tests
  └─ Edge cases

□ Documentation
  ├─ Rollback workflow
  ├─ History queries
  └─ Configuration options
```

---

## Effort Estimate

- **Implementation:** 2 hours
- **Testing:** 1.5 hours
- **CLI integration:** 1 hour
- **Documentation:** 30 minutes
- **Total:** ~5 hours

---

**Status:** Specification complete, ready for implementation
**Priority:** Medium (nice-to-have safety feature)
**Complexity:** Medium (requires careful VTM state management)
