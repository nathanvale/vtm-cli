/**
 * VTM History - Transaction tracking and rollback support
 *
 * Provides history tracking for VTM task ingestion with transaction-based
 * rollback capability.
 */

import * as fs from 'fs/promises'
import type { VTM } from './types'

/**
 * History entry representing a transaction in VTM
 */
export type HistoryEntry = {
  id: string // "2025-10-30-001"
  action: 'ingest' | 'update' | 'delete'
  timestamp: Date
  source: string
  description?: string
  tasks_added?: string[]
  tasks_removed?: string[]
  tasks_updated?: string[]
  files?: Record<string, string>
  metadata?: Record<string, unknown>
}

/**
 * Options for rollback operations
 */
export type RollbackOptions = {
  transactionId: string
  force?: boolean
  dryRun?: boolean
}

/**
 * Details about what a rollback will affect
 */
export type RollbackDetails = {
  transactionId: string
  tasks: Array<{ id: string; title: string }>
  dependencies: Array<{ taskId: string; dependsOn: string }>
}

/**
 * Statistics about history entries
 */
export type HistoryStats = {
  totalEntries: number
  oldestEntry: Date
  newestEntry: Date
  actionBreakdown: Record<string, number>
}

/**
 * Enhanced VTM type with history support
 */
type VTMWithHistory = {
  history?: Array<Omit<HistoryEntry, 'timestamp'> & { timestamp: string }>
} & VTM

/**
 * VTMHistory class for transaction tracking and rollback
 */
export class VTMHistory {
  private vtmPath: string
  private transactionCounter: Map<string, number> = new Map()

  constructor(vtmPath: string) {
    this.vtmPath = vtmPath
  }

  /**
   * Generate a transaction ID in format: YYYY-MM-DD-NNN
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
   * Load VTM file from disk
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
   * Save VTM file to disk
   */
  private async saveVtm(vtm: VTMWithHistory): Promise<void> {
    await fs.writeFile(this.vtmPath, JSON.stringify(vtm, null, 2))
  }

  /**
   * Recalculate VTM stats based on current tasks
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
   * Record an ingest transaction
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
   * Record an update transaction
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
   * Get history entries
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
   * Get a specific history entry by transaction ID
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
   * Get statistics about history
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
   * Search history entries by source
   */
  async search(query: string): Promise<HistoryEntry[]> {
    const allEntries = await this.getHistory()
    return allEntries.filter((entry) => entry.source.includes(query))
  }

  /**
   * Get rollback details for a transaction
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
   * Rollback a transaction
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
