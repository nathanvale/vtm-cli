/**
 * Tests for VTMHistory - Transaction tracking and rollback support
 *
 * TDD Implementation following Red-Green-Refactor cycle
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { VTMHistory } from '../vtm-history'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import type { VTM } from '../types'

/**
 * Helper function to create a test VTM file
 */
async function createTestVtm(data?: Partial<VTM>): Promise<string> {
  const tempFile = path.join(os.tmpdir(), `test-vtm-${Date.now()}-${Math.random()}.json`)

  const defaultVtm: VTM = {
    version: '1.0',
    project: {
      name: 'Test Project',
      description: 'Test project for VTM History',
    },
    stats: {
      total_tasks: 0,
      completed: 0,
      in_progress: 0,
      pending: 0,
      blocked: 0,
    },
    tasks: [],
    ...data,
  }

  await fs.writeFile(tempFile, JSON.stringify(defaultVtm, null, 2))
  return tempFile
}

describe('VTMHistory - Transaction ID Generation', () => {
  it('generates transaction ID with date format', () => {
    // RED: Write test first - this should fail
    const history = new VTMHistory('test-vtm.json')
    const txId = history['generateTransactionId']()
    expect(txId).toMatch(/^\d{4}-\d{2}-\d{2}-\d{3}$/)
  })

  it('generates sequential IDs for same day', async () => {
    // RED: Test should fail first
    const tempFile = await createTestVtm()
    const history = new VTMHistory(tempFile)

    const id1 = await history.recordIngest(['TASK-001'], '/test')
    const id2 = await history.recordIngest(['TASK-002'], '/test')

    expect(id1).toMatch(/^\d{4}-\d{2}-\d{2}-001$/)
    expect(id2).toMatch(/^\d{4}-\d{2}-\d{2}-002$/)

    await fs.unlink(tempFile)
  })

  it('pads transaction number with zeros', () => {
    // RED: Test should fail first
    const history = new VTMHistory('test-vtm.json')
    const txId = history['generateTransactionId']()
    const parts = txId.split('-')
    expect(parts[3]).toHaveLength(3) // 001, 002, etc.
  })
})

describe('VTMHistory - Recording Operations', () => {
  let tempFile: string
  let history: VTMHistory

  beforeEach(async () => {
    tempFile = await createTestVtm()
    history = new VTMHistory(tempFile)
  })

  afterEach(async () => {
    try {
      await fs.unlink(tempFile)
    } catch (e) {
      // Ignore if file doesn't exist
    }
  })

  it('records ingest transaction with task IDs', async () => {
    // RED: Write test first
    const txId = await history.recordIngest(['TASK-001', 'TASK-002'], '/plan:to-vtm')

    const entry = await history.getEntry(txId)
    expect(entry).not.toBeNull()
    expect(entry!.action).toBe('ingest')
    expect(entry!.tasks_added).toEqual(['TASK-001', 'TASK-002'])
    expect(entry!.source).toBe('/plan:to-vtm')
  })

  it('records ingest with file metadata', async () => {
    // RED: Test should fail first
    const txId = await history.recordIngest(['TASK-001'], '/plan:to-vtm', {
      adr: 'adr/ADR-001-auth.md',
      spec: 'specs/spec-auth.md',
    })

    const entry = await history.getEntry(txId)
    expect(entry!.files).toEqual({
      adr: 'adr/ADR-001-auth.md',
      spec: 'specs/spec-auth.md',
    })
  })

  it('records update operation', async () => {
    // RED: Test should fail first
    await history.recordUpdate(['TASK-001'], 'Updated task status')

    const entries = await history.getHistory(1)
    expect(entries[0].action).toBe('update')
    expect(entries[0].description).toBe('Updated task status')
    expect(entries[0].tasks_updated).toEqual(['TASK-001'])
  })

  it('appends to existing history array', async () => {
    // RED: Test should fail first
    await history.recordIngest(['TASK-001'], '/test1')
    await history.recordIngest(['TASK-002'], '/test2')

    const entries = await history.getHistory()
    expect(entries).toHaveLength(2)
  })

  it('includes timestamp in entry', async () => {
    // RED: Test should fail first
    const before = new Date()
    const txId = await history.recordIngest(['TASK-001'], '/test')
    const after = new Date()

    const entry = await history.getEntry(txId)
    const timestamp = new Date(entry!.timestamp)
    expect(timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(timestamp.getTime()).toBeLessThanOrEqual(after.getTime())
  })
})

describe('VTMHistory - Querying History', () => {
  let tempFile: string
  let history: VTMHistory

  beforeEach(async () => {
    tempFile = await createTestVtm()
    history = new VTMHistory(tempFile)
  })

  afterEach(async () => {
    try {
      await fs.unlink(tempFile)
    } catch (e) {
      // Ignore if file doesn't exist
    }
  })

  it('gets all history entries', async () => {
    // RED: Write test first
    await history.recordIngest(['TASK-001'], '/test1')
    await history.recordIngest(['TASK-002'], '/test2')
    await history.recordIngest(['TASK-003'], '/test3')

    const entries = await history.getHistory()
    expect(entries).toHaveLength(3)
  })

  it('limits history entries', async () => {
    // RED: Test should fail first
    await history.recordIngest(['TASK-001'], '/test1')
    await history.recordIngest(['TASK-002'], '/test2')
    await history.recordIngest(['TASK-003'], '/test3')

    const entries = await history.getHistory(2)
    expect(entries).toHaveLength(2)
  })

  it('returns entries in reverse chronological order', async () => {
    // RED: Test should fail first
    const id1 = await history.recordIngest(['TASK-001'], '/test1')
    const id2 = await history.recordIngest(['TASK-002'], '/test2')

    const entries = await history.getHistory()
    expect(entries[0].id).toBe(id2) // Most recent first
    expect(entries[1].id).toBe(id1)
  })

  it('gets entry by transaction ID', async () => {
    // RED: Test should fail first
    const txId = await history.recordIngest(['TASK-001'], '/test')

    const entry = await history.getEntry(txId)
    expect(entry).not.toBeNull()
    expect(entry!.id).toBe(txId)
  })

  it('returns null for non-existent transaction', async () => {
    // RED: Test should fail first
    const entry = await history.getEntry('2025-01-01-999')
    expect(entry).toBeNull()
  })

  it('searches history by source', async () => {
    // RED: Test should fail first
    await history.recordIngest(['TASK-001'], '/plan:to-vtm')
    await history.recordIngest(['TASK-002'], '/plan:ingest')
    await history.recordIngest(['TASK-003'], '/plan:to-vtm')

    const results = await history.search('/plan:to-vtm')
    expect(results).toHaveLength(2)
  })
})

describe('VTMHistory - Statistics', () => {
  let tempFile: string
  let history: VTMHistory

  beforeEach(async () => {
    tempFile = await createTestVtm()
    history = new VTMHistory(tempFile)
  })

  afterEach(async () => {
    try {
      await fs.unlink(tempFile)
    } catch (e) {
      // Ignore if file doesn't exist
    }
  })

  it('calculates total entries', async () => {
    // RED: Write test first
    await history.recordIngest(['TASK-001'], '/test1')
    await history.recordIngest(['TASK-002'], '/test2')

    const stats = await history.getStats()
    expect(stats.totalEntries).toBe(2)
  })

  it('tracks oldest and newest entries', async () => {
    // RED: Test should fail first
    await history.recordIngest(['TASK-001'], '/test1')
    await new Promise((resolve) => setTimeout(resolve, 10))
    await history.recordIngest(['TASK-002'], '/test2')

    const stats = await history.getStats()
    expect(stats.oldestEntry).toBeDefined()
    expect(stats.newestEntry).toBeDefined()
    expect(stats.newestEntry.getTime()).toBeGreaterThan(stats.oldestEntry.getTime())
  })

  it('breaks down actions by type', async () => {
    // RED: Test should fail first
    await history.recordIngest(['TASK-001'], '/test1')
    await history.recordIngest(['TASK-002'], '/test2')
    await history.recordUpdate(['TASK-001'], 'update')

    const stats = await history.getStats()
    expect(stats.actionBreakdown.ingest).toBe(2)
    expect(stats.actionBreakdown.update).toBe(1)
  })
})

describe('VTMHistory - Rollback Support', () => {
  let tempFile: string
  let history: VTMHistory

  beforeEach(async () => {
    tempFile = await createTestVtm({
      tasks: [
        {
          id: 'TASK-001',
          title: 'Task 1',
          status: 'pending',
          adr_source: 'test',
          spec_source: 'test',
          description: 'Test task 1',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'Unit',
          test_strategy_rationale: 'Test',
          estimated_hours: 1,
          risk: 'low',
          files: { create: [], modify: [], delete: [] },
          started_at: null,
          completed_at: null,
          commits: [],
          validation: { tests_pass: false, ac_verified: [] },
        },
        {
          id: 'TASK-002',
          title: 'Task 2',
          status: 'pending',
          adr_source: 'test',
          spec_source: 'test',
          description: 'Test task 2',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'Unit',
          test_strategy_rationale: 'Test',
          estimated_hours: 1,
          risk: 'low',
          files: { create: [], modify: [], delete: [] },
          started_at: null,
          completed_at: null,
          commits: [],
          validation: { tests_pass: false, ac_verified: [] },
        },
        {
          id: 'TASK-003',
          title: 'Task 3',
          status: 'pending',
          adr_source: 'test',
          spec_source: 'test',
          description: 'Test task 3',
          acceptance_criteria: [],
          dependencies: ['TASK-002'],
          blocks: [],
          test_strategy: 'Unit',
          test_strategy_rationale: 'Test',
          estimated_hours: 1,
          risk: 'low',
          files: { create: [], modify: [], delete: [] },
          started_at: null,
          completed_at: null,
          commits: [],
          validation: { tests_pass: false, ac_verified: [] },
        },
      ],
    })
    history = new VTMHistory(tempFile)
  })

  afterEach(async () => {
    try {
      await fs.unlink(tempFile)
    } catch (e) {
      // Ignore if file doesn't exist
    }
  })

  it('gets rollback details for transaction', async () => {
    // RED: Write test first
    const txId = await history.recordIngest(['TASK-001', 'TASK-002'], '/test')

    const details = await history.getRollbackDetails(txId)
    expect(details.transactionId).toBe(txId)
    expect(details.tasks).toHaveLength(2)
    expect(details.tasks[0].id).toBe('TASK-001')
  })

  it('rolls back transaction by removing tasks', async () => {
    // RED: Test should fail first
    const txId = await history.recordIngest(['TASK-001'], '/test')

    await history.rollback({ transactionId: txId, force: true })

    const vtm = await history['loadVtm']()
    expect(vtm.tasks).not.toContainEqual(expect.objectContaining({ id: 'TASK-001' }))
  })

  it('detects blocking dependencies', async () => {
    // RED: Test should fail first
    const txId = await history.recordIngest(['TASK-002'], '/test')

    // TASK-003 depends on TASK-002
    await expect(history.rollback({ transactionId: txId, force: false })).rejects.toThrow('depend on removed tasks')
  })

  it('forces rollback despite dependencies', async () => {
    // RED: Test should fail first
    const txId = await history.recordIngest(['TASK-002'], '/test')

    // Should succeed with force flag
    await history.rollback({ transactionId: txId, force: true })

    const vtm = await history['loadVtm']()
    expect(vtm.tasks).not.toContainEqual(expect.objectContaining({ id: 'TASK-002' }))
  })

  it('dry run does not modify VTM', async () => {
    // RED: Test should fail first
    const txId = await history.recordIngest(['TASK-001'], '/test')

    await history.rollback({ transactionId: txId, dryRun: true })

    const vtm = await history['loadVtm']()
    expect(vtm.tasks).toContainEqual(expect.objectContaining({ id: 'TASK-001' }))
  })

  it('records rollback in history', async () => {
    // RED: Test should fail first
    const txId = await history.recordIngest(['TASK-001'], '/test')
    await history.rollback({ transactionId: txId, force: true })

    const entries = await history.getHistory()
    const rollbackEntry = entries.find((e) => e.description?.includes('Rolled back'))
    expect(rollbackEntry).toBeDefined()
  })

  it('recalculates stats after rollback', async () => {
    // RED: Test should fail first
    const txId = await history.recordIngest(['TASK-001'], '/test')

    await history.rollback({ transactionId: txId, force: true })

    const vtm = await history['loadVtm']()
    expect(vtm.stats.total_tasks).toBe(2) // TASK-002 and TASK-003 remain
  })
})

describe('VTMHistory - Error Handling', () => {
  it('throws error for invalid VTM file', async () => {
    // RED: Write test first
    const history = new VTMHistory('nonexistent.json')

    await expect(history.recordIngest(['TASK-001'], '/test')).rejects.toThrow()
  })

  it('throws error for non-existent transaction rollback', async () => {
    // RED: Test should fail first
    const tempFile = await createTestVtm()
    const history = new VTMHistory(tempFile)

    await expect(history.rollback({ transactionId: '2025-01-01-999', force: true })).rejects.toThrow(
      'Transaction not found',
    )

    await fs.unlink(tempFile)
  })

  it('handles corrupted history array gracefully', async () => {
    // RED: Test should fail first
    // Create VTM with malformed history
    const tempFile = path.join(os.tmpdir(), `test-vtm-${Date.now()}.json`)
    const corruptedVtm = {
      version: '1.0',
      project: { name: 'Test', description: 'Test' },
      stats: {
        total_tasks: 0,
        completed: 0,
        in_progress: 0,
        pending: 0,
        blocked: 0,
      },
      tasks: [],
      history: 'invalid', // Should be array
    }
    await fs.writeFile(tempFile, JSON.stringify(corruptedVtm, null, 2))

    const history = new VTMHistory(tempFile)

    // Should initialize empty history
    const entries = await history.getHistory()
    expect(entries).toEqual([])

    await fs.unlink(tempFile)
  })
})
