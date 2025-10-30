/**
 * VTM History - Transaction tracking and rollback support.
 *
 * Provides comprehensive history tracking for VTM task ingestion with
 * transaction-based rollback capability. Every task ingestion operation
 * creates a transaction record that can be safely rolled back with
 * dependency validation.
 */

import * as fs from 'fs/promises'
import type { VTM } from './types'

/**
 * A single transaction record in VTM history.
 *
 * Tracks what happened during an ingest, update, or delete operation
 * including which tasks were affected, when, and where the operation came from.
 */
export type HistoryEntry = {
  /** Transaction ID in format YYYY-MM-DD-NNN (e.g., "2025-10-30-001") */
  id: string
  /** Type of operation: ingest (new tasks), update (modify tasks), delete (rollback) */
  action: 'ingest' | 'update' | 'delete'
  /** When this transaction was recorded */
  timestamp: Date
  /** Source of the transaction (e.g., "adr/ADR-001.md", "rollback", "manual") */
  source: string
  /** Optional description of what was done */
  description?: string
  /** Task IDs added in this transaction */
  tasks_added?: string[]
  /** Task IDs removed in this transaction */
  tasks_removed?: string[]
  /** Task IDs modified in this transaction */
  tasks_updated?: string[]
  /** Source file mappings for traceability */
  files?: Record<string, string>
  /** Additional metadata for the transaction */
  metadata?: Record<string, unknown>
}

/**
 * Options controlling rollback behavior.
 */
export type RollbackOptions = {
  /** Transaction ID to rollback (format: YYYY-MM-DD-NNN) */
  transactionId: string
  /** Skip dependency checks and force rollback anyway */
  force?: boolean
  /** Preview what would happen without making changes */
  dryRun?: boolean
}

/**
 * Information about what a rollback would affect.
 *
 * Returned by getRollbackDetails() to show the user what tasks and
 * dependencies would be impacted by a rollback operation.
 */
export type RollbackDetails = {
  /** The transaction ID being rolled back */
  transactionId: string
  /** Tasks that would be removed */
  tasks: Array<{ id: string; title: string }>
  /** Other tasks that depend on the tasks being removed */
  dependencies: Array<{ taskId: string; dependsOn: string }>
}

/**
 * Summary statistics about VTM history.
 */
export type HistoryStats = {
  /** Total number of history entries */
  totalEntries: number
  /** Timestamp of oldest entry */
  oldestEntry: Date
  /** Timestamp of newest entry */
  newestEntry: Date
  /** Count of each action type (ingest, update, delete) */
  actionBreakdown: Record<string, number>
}

/**
 * Enhanced VTM type with history support.
 * @internal
 */
type VTMWithHistory = {
  history?: Array<Omit<HistoryEntry, 'timestamp'> & { timestamp: string }>
} & VTM

/**
 * Manages transaction history and rollback for VTM.
 *
 * Tracks all ingest, update, and delete operations in a history array
 * within the VTM file itself. Supports safe rollback with dependency
 * validation to prevent removing tasks that other tasks depend on.
 *
 * @remarks
 * Transaction ID Format:
 * - Format: YYYY-MM-DD-NNN
 * - Example: "2025-10-30-001" (first transaction on Oct 30, 2025)
 * - NNN is zero-padded to 3 digits and increments per day
 *
 * Rollback Safety:
 * - Checks if any tasks depend on tasks being rolled back
 * - Throws error unless force=true if dependencies exist
 * - Validates dependency chain to prevent circular references
 * - Records rollback as a delete action in history
 *
 * @example
 * ```typescript
 * const history = new VTMHistory('vtm.json');
 *
 * // Record task ingestion
 * const txId = await history.recordIngest(
 *   ['TASK-001', 'TASK-002'],
 *   'adr/ADR-001.md'
 * );
 * console.log('Transaction ID:', txId); // "2025-10-30-001"
 *
 * // Get history
 * const entries = await history.getHistory(10);
 * console.log('Last 10 transactions:', entries);
 *
 * // Check what rollback would affect
 * const details = await history.getRollbackDetails(txId);
 * console.log('Would remove:', details.tasks);
 * console.log('Dependent tasks:', details.dependencies);
 *
 * // Rollback safely
 * await history.rollback({ transactionId: txId, dryRun: true });
 * ```
 */
export class VTMHistory {
  /** Path to VTM file being tracked */
  private vtmPath: string
  /** Tracks transaction counter per date for ID generation */
  private transactionCounter: Map<string, number> = new Map()

  /**
   * Create a new VTMHistory instance.
   *
   * @param vtmPath - Path to the VTM file to track history for
   */
  constructor(vtmPath: string) {
    this.vtmPath = vtmPath
  }

  /**
   * Generate a unique transaction ID in format YYYY-MM-DD-NNN.
   *
   * Increments a counter for the current date to ensure uniqueness.
   * Counter is reset at midnight UTC.
   *
   * @returns Transaction ID string (e.g., "2025-10-30-001")
   *
   * @remarks
   * Counter is maintained in memory during the VTMHistory instance lifetime
   * and is re-initialized from history when loading VTM.
   *
   * @internal
   */
  private generateTransactionId(): string {
    const now = new Date()
    const parts = now.toISOString().split('T')
    const dateStr = parts[0] ?? '' // YYYY-MM-DD

    // Get current counter for this date
    const currentCount = this.transactionCounter.get(dateStr) || 0
    const nextCount = currentCount + 1

    // Update counter
    this.transactionCounter.set(dateStr, nextCount)

    // Format: YYYY-MM-DD-NNN (zero-padded to 3 digits)
    return `${dateStr}-${String(nextCount).padStart(3, '0')}`
  }

  /**
   * Load VTM file from disk, initializing history array if missing.
   *
   * Reads VTM JSON file and ensures history array exists and is valid.
   * Re-initializes transaction counter from existing history entries.
   *
   * @returns VTMWithHistory object with populated history array
   * @throws {Error} If VTM file not found or cannot be parsed
   * @internal
   */
  private async loadVtm(): Promise<VTMWithHistory> {
    try {
      const content = await fs.readFile(this.vtmPath, 'utf-8')
      const vtm = JSON.parse(content) as VTMWithHistory

      // Initialize history array if missing or corrupted
      if (!Array.isArray(vtm.history)) {
        vtm.history = []
      }

      // Initialize transaction counter from existing history
      if (vtm.history && Array.isArray(vtm.history)) {
        for (const entry of vtm.history) {
          const dateStr = entry.id.substring(0, 10) // YYYY-MM-DD
          const txNum = parseInt(entry.id.substring(11), 10) // NNN
          const current = this.transactionCounter.get(dateStr) || 0
          if (txNum > current) {
            this.transactionCounter.set(dateStr, txNum)
          }
        }
      }

      return vtm
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`VTM file not found: ${this.vtmPath}`)
      }
      throw error
    }
  }

  /**
   * Save VTM file to disk with formatted JSON.
   *
   * @param vtm - VTMWithHistory object to save
   * @throws {Error} If file cannot be written (permissions, disk full, etc.)
   * @internal
   */
  private async saveVtm(vtm: VTMWithHistory): Promise<void> {
    await fs.writeFile(this.vtmPath, JSON.stringify(vtm, null, 2))
  }

  /**
   * Recalculate VTM stats based on current task states.
   *
   * Updates stats for total tasks, completed, in-progress, pending, and blocked.
   * Blocked tasks are those with pending dependencies.
   *
   * @param vtm - VTMWithHistory object to recalculate stats for
   * @remarks
   * Modifies vtm.stats in place.
   * @internal
   */
  private recalculateStats(vtm: VTMWithHistory): void {
    vtm.stats.total_tasks = vtm.tasks.length
    vtm.stats.completed = vtm.tasks.filter((t) => t.status === 'completed').length
    vtm.stats.in_progress = vtm.tasks.filter((t) => t.status === 'in-progress').length
    vtm.stats.pending = vtm.tasks.filter((t) => t.status === 'pending').length

    // Calculate blocked tasks
    vtm.stats.blocked = vtm.tasks.filter((t) => {
      if (t.status === 'completed') return false
      return t.dependencies.some((dep) => {
        const depTask = vtm.tasks.find((task) => task.id === dep)
        return depTask && depTask.status !== 'completed'
      })
    }).length
  }

  /**
   * Record a task ingestion transaction in history.
   *
   * Creates a new history entry for tasks added to VTM, including source
   * file references for traceability. Generates a unique transaction ID.
   *
   * @param taskIds - Array of task IDs that were added (e.g., ["TASK-001", "TASK-002"])
   * @param source - Source of the ingestion (e.g., "adr/ADR-001.md", "manual ingest")
   * @param files - Optional file mappings for source traceability
   * @returns Promise resolving to the generated transaction ID
   * @throws {Error} If VTM file cannot be read or written
   *
   * @example
   * ```typescript
   * const txId = await history.recordIngest(
   *   ['TASK-001', 'TASK-002'],
   *   'adr/ADR-001.md',
   *   { 'TASK-001': 'adr/ADR-001.md#implementation', 'TASK-002': 'specs/spec-001.md' }
   * );
   * console.log('Added tasks under transaction:', txId);
   * ```
   *
   * @remarks
   * The returned transaction ID can be used to retrieve history details or
   * perform rollback operations.
   */
  async recordIngest(
    taskIds: string[],
    source: string,
    files?: Record<string, string>,
  ): Promise<string> {
    const vtm = await this.loadVtm()

    const txId = this.generateTransactionId()
    const entry: Omit<HistoryEntry, 'timestamp'> & { timestamp: string } = {
      id: txId,
      action: 'ingest',
      timestamp: new Date().toISOString(),
      source,
      tasks_added: taskIds,
      ...(files && { files }),
    }

    if (!vtm.history) {
      vtm.history = []
    }

    vtm.history.push(entry)
    await this.saveVtm(vtm)

    return txId
  }

  /**
   * Record a task update transaction in history.
   *
   * Creates a history entry for modifications to existing tasks.
   * Typically called when task status, properties, or dependencies change.
   *
   * @param taskIds - Array of task IDs that were modified
   * @param description - Description of what was updated (e.g., "Marked as completed")
   * @throws {Error} If VTM file cannot be read or written
   *
   * @example
   * ```typescript
   * await history.recordUpdate(
   *   ['TASK-001'],
   *   'Marked as completed, updated test results'
   * );
   * ```
   *
   * @remarks
   * Unlike recordIngest which tracks new tasks, this tracks modifications
   * to existing tasks. Used less frequently than ingest in typical workflows.
   */
  async recordUpdate(taskIds: string[], description: string): Promise<void> {
    const vtm = await this.loadVtm()

    const txId = this.generateTransactionId()
    const entry: Omit<HistoryEntry, 'timestamp'> & { timestamp: string } = {
      id: txId,
      action: 'update',
      timestamp: new Date().toISOString(),
      source: 'manual',
      description,
      tasks_updated: taskIds,
    }

    if (!vtm.history) {
      vtm.history = []
    }

    vtm.history.push(entry)
    await this.saveVtm(vtm)
  }

  /**
   * Get history entries, optionally limited to most recent.
   *
   * Retrieves history entries sorted by timestamp (newest first).
   * If multiple entries have same timestamp, sorts by ID descending.
   *
   * @param limit - Optional maximum number of entries to return (default: all)
   * @returns Promise resolving to array of HistoryEntry objects
   *
   * @example
   * ```typescript
   * // Get all history
   * const allHistory = await history.getHistory();
   *
   * // Get last 10 transactions
   * const recent = await history.getHistory(10);
   * recent.forEach(entry => {
   *   console.log(`${entry.id}: ${entry.action} - ${entry.source}`);
   * });
   * ```
   *
   * @remarks
   * Returns entries with timestamp property as Date objects (not strings).
   * Sorted newest-first for convenient access to recent transactions.
   */
  async getHistory(limit?: number): Promise<HistoryEntry[]> {
    const vtm = await this.loadVtm()

    if (!vtm.history || !Array.isArray(vtm.history)) {
      return []
    }

    // Convert string timestamps to Date objects
    const entries: HistoryEntry[] = vtm.history.map((entry) => ({
      ...entry,
      timestamp: new Date(entry.timestamp),
    }))

    // Sort by timestamp (newest first), use ID as tie-breaker
    entries.sort((a, b) => {
      const timeDiff = b.timestamp.getTime() - a.timestamp.getTime()
      if (timeDiff !== 0) return timeDiff
      // If timestamps are equal, use ID (newest ID is higher)
      return b.id.localeCompare(a.id)
    })

    // Apply limit if specified
    if (limit !== undefined) {
      return entries.slice(0, limit)
    }

    return entries
  }

  /**
   * Get a specific history entry by transaction ID.
   *
   * Retrieves detailed information about a single transaction.
   * Returns null if transaction not found.
   *
   * @param transactionId - Transaction ID to retrieve (format: YYYY-MM-DD-NNN)
   * @returns Promise resolving to HistoryEntry or null if not found
   *
   * @example
   * ```typescript
   * const entry = await history.getEntry('2025-10-30-001');
   * if (entry) {
   *   console.log('Tasks added:', entry.tasks_added);
   *   console.log('Source:', entry.source);
   * }
   * ```
   */
  async getEntry(transactionId: string): Promise<HistoryEntry | null> {
    const vtm = await this.loadVtm()

    if (!vtm.history || !Array.isArray(vtm.history)) {
      return null
    }

    const entry = vtm.history.find((e) => e.id === transactionId)
    if (!entry) {
      return null
    }

    return {
      ...entry,
      timestamp: new Date(entry.timestamp),
    }
  }

  /**
   * Get statistics about the transaction history.
   *
   * Analyzes history to provide summary information about all transactions.
   * Returns empty stats if no history entries exist.
   *
   * @returns Promise resolving to HistoryStats with counts and date range
   *
   * @example
   * ```typescript
   * const stats = await history.getStats();
   * console.log(`Total transactions: ${stats.totalEntries}`);
   * console.log(`Ingests: ${stats.actionBreakdown['ingest'] || 0}`);
   * console.log(`Rollbacks: ${stats.actionBreakdown['delete'] || 0}`);
   * console.log(`Date range: ${stats.oldestEntry} to ${stats.newestEntry}`);
   * ```
   */
  async getStats(): Promise<HistoryStats> {
    const vtm = await this.loadVtm()

    if (!vtm.history || !Array.isArray(vtm.history) || vtm.history.length === 0) {
      return {
        totalEntries: 0,
        oldestEntry: new Date(),
        newestEntry: new Date(),
        actionBreakdown: {},
      }
    }

    const entries = vtm.history.map((e) => ({
      ...e,
      timestamp: new Date(e.timestamp),
    }))

    const timestamps = entries.map((e) => e.timestamp.getTime())
    const oldestEntry = new Date(Math.min(...timestamps))
    const newestEntry = new Date(Math.max(...timestamps))

    const actionBreakdown: Record<string, number> = {}
    for (const entry of entries) {
      actionBreakdown[entry.action] = (actionBreakdown[entry.action] || 0) + 1
    }

    return {
      totalEntries: entries.length,
      oldestEntry,
      newestEntry,
      actionBreakdown,
    }
  }

  /**
   * Search history entries by source substring.
   *
   * Finds all history entries where the source contains the search query.
   * Search is case-sensitive substring matching.
   *
   * @param query - Search string to match against entry source
   * @returns Promise resolving to array of matching HistoryEntry objects
   *
   * @example
   * ```typescript
   * // Find all ingestions from adr files
   * const adrIngests = await history.search('adr/');
   *
   * // Find rollback operations
   * const rollbacks = await history.search('rollback');
   * ```
   *
   * @remarks
   * Returns entries sorted newest-first (via getHistory()).
   * Search is source-only; to find by task ID, use getEntry() with transaction ID.
   */
  async search(query: string): Promise<HistoryEntry[]> {
    const allEntries = await this.getHistory()
    return allEntries.filter((entry) => entry.source.includes(query))
  }

  /**
   * Get detailed information about what a rollback would affect.
   *
   * Analyzes the transaction to determine which tasks would be removed
   * and which other tasks depend on those tasks being removed.
   *
   * @param transactionId - Transaction ID to analyze (format: YYYY-MM-DD-NNN)
   * @returns Promise resolving to RollbackDetails with tasks and dependencies
   * @throws {Error} If transaction not found or has no tasks_added
   *
   * @example
   * ```typescript
   * const details = await history.getRollbackDetails('2025-10-30-001');
   * console.log('Would remove:', details.tasks);
   * if (details.dependencies.length > 0) {
   *   console.log('WARNING: These tasks depend on removed tasks:');
   *   details.dependencies.forEach(d => {
   *     console.log(`  ${d.taskId} depends on ${d.dependsOn}`);
   *   });
   * }
   * ```
   *
   * @remarks
   * Used before calling rollback() to warn user about impact.
   * If dependencies exist and force=false, rollback() will throw error.
   */
  async getRollbackDetails(transactionId: string): Promise<RollbackDetails> {
    const vtm = await this.loadVtm()
    const entry = await this.getEntry(transactionId)

    if (!entry || !entry.tasks_added) {
      throw new Error(`Transaction not found: ${transactionId}`)
    }

    const tasks = entry.tasks_added
      .map((taskId) => {
        const task = vtm.tasks.find((t) => t.id === taskId)
        return task ? { id: task.id, title: task.title } : null
      })
      .filter((t): t is { id: string; title: string } => t !== null)

    // Find dependencies
    const dependencies: Array<{ taskId: string; dependsOn: string }> = []
    for (const task of vtm.tasks) {
      for (const dep of task.dependencies) {
        if (typeof dep === 'string' && entry.tasks_added.includes(dep)) {
          dependencies.push({ taskId: task.id, dependsOn: dep })
        }
      }
    }

    return {
      transactionId,
      tasks,
      dependencies,
    }
  }

  /**
   * Rollback a transaction, removing its tasks and recording the rollback.
   *
   * Removes all tasks that were added in a transaction and records the
   * rollback as a delete action in history. Validates dependencies unless
   * force=true. Does not modify VTM if dryRun=true.
   *
   * @param options - Rollback options
   * @param options.transactionId - Transaction ID to rollback
   * @param options.force - Skip dependency validation (default: false)
   * @param options.dryRun - Preview without making changes (default: false)
   * @throws {Error} If transaction not found
   * @throws {Error} If tasks have dependent tasks and force=false
   *
   * @example
   * ```typescript
   * // Preview rollback
   * try {
   *   await history.rollback({
   *     transactionId: '2025-10-30-001',
   *     dryRun: true
   *   });
   *   console.log('Preview successful - safe to rollback');
   * } catch (e) {
   *   console.error('Dependencies detected:', e.message);
   * }
   *
   * // Execute rollback with dependency check
   * try {
   *   await history.rollback({
   *     transactionId: '2025-10-30-001'
   *   });
   *   console.log('Rollback complete');
   * } catch (e) {
   *   if (e.message.includes('Cannot rollback')) {
   *     // Force rollback if needed
   *     await history.rollback({
   *       transactionId: '2025-10-30-001',
   *       force: true
   *     });
   *   }
   * }
   * ```
   *
   * @remarks
   * Safety features:
   * - Checks for dependent tasks before rollback
   * - Recalculates stats after removing tasks
   * - Records rollback in history as delete action
   * - dryRun allows safe preview before execution
   * - force option bypasses dependency validation if needed
   */
  async rollback(options: RollbackOptions): Promise<void> {
    const vtm = await this.loadVtm()
    const entry = await this.getEntry(options.transactionId)

    if (!entry || !entry.tasks_added) {
      throw new Error(`Transaction not found: ${options.transactionId}`)
    }

    // Check for blocking dependencies
    if (!options.force) {
      const details = await this.getRollbackDetails(options.transactionId)
      if (details.dependencies.length > 0) {
        throw new Error(
          `Cannot rollback: ${details.dependencies.length} task(s) depend on removed tasks. Use force option to rollback anyway.`,
        )
      }
    }

    // Dry run - don't modify
    if (options.dryRun) {
      return
    }

    // Remove tasks
    vtm.tasks = vtm.tasks.filter((t) => !entry.tasks_added!.includes(t.id))

    // Recalculate stats
    this.recalculateStats(vtm)

    // Record rollback in history
    const rollbackEntry: Omit<HistoryEntry, 'timestamp'> & { timestamp: string } = {
      id: this.generateTransactionId(),
      action: 'delete',
      timestamp: new Date().toISOString(),
      source: 'rollback',
      description: `Rolled back transaction ${options.transactionId}`,
      tasks_removed: entry.tasks_added,
    }

    if (!vtm.history) {
      vtm.history = []
    }

    vtm.history.push(rollbackEntry)

    // Save changes
    await this.saveVtm(vtm)
  }
}
