import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { VTMSummarizer } from '../src/lib/vtm-summary'
import type { VTM, Task } from '../src/lib/types'

describe('VTMSummarizer', () => {
  const testDir = path.join(process.cwd(), '.test-vtm')
  const testVtmPath = path.join(testDir, 'vtm.json')

  beforeEach(() => {
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true })
    }
  })

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true })
    }
  })

  /**
   * Helper to create a test VTM file
   */
  function createTestVtm(tasks: Partial<Task>[]): VTM {
    const vtm: VTM = {
      version: '2.0.0',
      project: {
        name: 'Test Project',
        description: 'Testing VTMSummarizer',
      },
      stats: {
        total_tasks: tasks.length,
        completed: tasks.filter((t) => t.status === 'completed').length,
        in_progress: tasks.filter((t) => t.status === 'in-progress').length,
        pending: tasks.filter((t) => t.status === 'pending').length,
        blocked: tasks.filter((t) => t.status === 'blocked').length,
      },
      tasks: tasks.map((t, i) => ({
        id: t.id || `TASK-${String(i + 1).padStart(3, '0')}`,
        adr_source: t.adr_source || 'ADR-001',
        spec_source: t.spec_source || 'spec-example.md',
        title: t.title || `Task ${i + 1}`,
        description: t.description || `Description for task ${i + 1}`,
        acceptance_criteria: t.acceptance_criteria || [],
        dependencies: t.dependencies || [],
        blocks: t.blocks || [],
        test_strategy: t.test_strategy || 'TDD',
        test_strategy_rationale: t.test_strategy_rationale || 'Risk assessment',
        estimated_hours: t.estimated_hours || 4,
        risk: t.risk || 'medium',
        files: t.files || { create: [], modify: [], delete: [] },
        status: t.status || 'pending',
        started_at: t.started_at || null,
        completed_at: t.completed_at || null,
        commits: t.commits || [],
        validation: t.validation || { tests_pass: false, ac_verified: [] },
      })) as Task[],
    }
    return vtm
  }

  describe('generateSummary()', () => {
    it('should return empty summary for empty VTM', async () => {
      const vtm = createTestVtm([])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const summarizer = new VTMSummarizer(testVtmPath)
      const summary = await summarizer.generateSummary()

      expect(summary.incomplete_tasks).toEqual([])
      expect(summary.completed_capabilities).toEqual([])
    })

    it('should filter out completed tasks from summary', async () => {
      const vtm = createTestVtm([
        { id: 'TASK-001', title: 'Completed task', status: 'completed' },
        { id: 'TASK-002', title: 'Pending task', status: 'pending' },
      ])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const summarizer = new VTMSummarizer(testVtmPath)
      const summary = await summarizer.generateSummary()

      expect(summary.incomplete_tasks).toHaveLength(1)
      expect(summary.incomplete_tasks[0]?.id).toBe('TASK-002')
      expect(summary.completed_capabilities).toContain('Completed task')
    })

    it('should include pending tasks in incomplete_tasks', async () => {
      const vtm = createTestVtm([{ id: 'TASK-001', title: 'Pending Task', status: 'pending' }])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const summarizer = new VTMSummarizer(testVtmPath)
      const summary = await summarizer.generateSummary()

      expect(summary.incomplete_tasks).toHaveLength(1)
      expect(summary.incomplete_tasks[0]?.id).toBe('TASK-001')
      expect(summary.incomplete_tasks[0]?.title).toBe('Pending Task')
    })

    it('should include in-progress tasks in incomplete_tasks', async () => {
      const vtm = createTestVtm([{ id: 'TASK-001', title: 'In Progress Task', status: 'in-progress' }])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const summarizer = new VTMSummarizer(testVtmPath)
      const summary = await summarizer.generateSummary()

      expect(summary.incomplete_tasks).toHaveLength(1)
      expect(summary.incomplete_tasks[0]?.status).toBe('in-progress')
    })

    it('should include blocked tasks in incomplete_tasks', async () => {
      const vtm = createTestVtm([{ id: 'TASK-001', title: 'Blocked Task', status: 'blocked' }])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const summarizer = new VTMSummarizer(testVtmPath)
      const summary = await summarizer.generateSummary()

      expect(summary.incomplete_tasks).toHaveLength(1)
      expect(summary.incomplete_tasks[0]?.status).toBe('blocked')
    })

    it('should include all task details in incomplete_tasks', async () => {
      const vtm = createTestVtm([
        {
          id: 'TASK-042',
          title: 'Implement JWT tokens',
          description: 'Create JWT token system',
          status: 'pending',
          estimated_hours: 6,
          risk: 'high',
          test_strategy: 'TDD',
        },
      ])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const summarizer = new VTMSummarizer(testVtmPath)
      const summary = await summarizer.generateSummary()

      const task = summary.incomplete_tasks[0]
      expect(task).toMatchObject({
        id: 'TASK-042',
        title: 'Implement JWT tokens',
        description: 'Create JWT token system',
        status: 'pending',
        estimated_hours: 6,
        risk: 'high',
        test_strategy: 'TDD',
      })
    })

    it('should correctly classify completed tasks as capabilities', async () => {
      const vtm = createTestVtm([
        { id: 'TASK-001', title: 'Database layer', status: 'completed' },
        { id: 'TASK-002', title: 'API endpoints', status: 'completed' },
        { id: 'TASK-003', title: 'Authentication', status: 'pending' },
      ])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const summarizer = new VTMSummarizer(testVtmPath)
      const summary = await summarizer.generateSummary()

      expect(summary.completed_capabilities).toContain('Database layer')
      expect(summary.completed_capabilities).toContain('API endpoints')
      expect(summary.completed_capabilities).not.toContain('Authentication')
    })

    it('should handle mixed statuses correctly', async () => {
      const vtm = createTestVtm([
        { id: 'TASK-001', title: 'Completed 1', status: 'completed' },
        { id: 'TASK-002', title: 'Pending 1', status: 'pending' },
        { id: 'TASK-003', title: 'In Progress 1', status: 'in-progress' },
        { id: 'TASK-004', title: 'Blocked 1', status: 'blocked' },
        { id: 'TASK-005', title: 'Completed 2', status: 'completed' },
      ])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const summarizer = new VTMSummarizer(testVtmPath)
      const summary = await summarizer.generateSummary()

      // 3 incomplete tasks
      expect(summary.incomplete_tasks).toHaveLength(3)
      expect(summary.incomplete_tasks.map((t) => t.id)).toEqual(['TASK-002', 'TASK-003', 'TASK-004'])

      // 2 completed capabilities
      expect(summary.completed_capabilities).toHaveLength(2)
      expect(summary.completed_capabilities).toContain('Completed 1')
      expect(summary.completed_capabilities).toContain('Completed 2')
    })
  })

  describe('toJSON()', () => {
    it('should return valid JSON string', async () => {
      const vtm = createTestVtm([{ id: 'TASK-001', title: 'Test Task', status: 'pending' }])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const summarizer = new VTMSummarizer(testVtmPath)
      const summary = await summarizer.generateSummary()
      const json = summarizer.toJSON(summary)

      expect(() => JSON.parse(json)).not.toThrow()
      const parsed = JSON.parse(json)
      expect(parsed).toHaveProperty('incomplete_tasks')
      expect(parsed).toHaveProperty('completed_capabilities')
    })

    it('should include proper formatting in JSON', async () => {
      const vtm = createTestVtm([{ id: 'TASK-001', title: 'Test Task', status: 'pending' }])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const summarizer = new VTMSummarizer(testVtmPath)
      const summary = await summarizer.generateSummary()
      const json = summarizer.toJSON(summary)

      // Check for nice formatting (2-space indent)
      expect(json).toContain('\n  ')
      const parsed = JSON.parse(json)
      expect(parsed.incomplete_tasks[0]?.id).toBe('TASK-001')
    })
  })

  describe('error handling', () => {
    it('should throw error if VTM file does not exist', async () => {
      const nonExistentPath = path.join(testDir, 'does-not-exist.json')
      const summarizer = new VTMSummarizer(nonExistentPath)

      await expect(summarizer.generateSummary()).rejects.toThrow()
    })

    it('should throw error if VTM file is invalid JSON', async () => {
      fs.writeFileSync(testVtmPath, 'invalid json {')

      const summarizer = new VTMSummarizer(testVtmPath)

      await expect(summarizer.generateSummary()).rejects.toThrow()
    })
  })

  describe('VTMSummary type', () => {
    it('should return summary with correct type structure', async () => {
      const vtm = createTestVtm([
        {
          id: 'TASK-001',
          title: 'Test',
          status: 'pending',
          estimated_hours: 4,
          risk: 'medium',
        },
      ])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const summarizer = new VTMSummarizer(testVtmPath)
      const summary = await summarizer.generateSummary()

      // Verify incomplete_tasks type
      expect(Array.isArray(summary.incomplete_tasks)).toBe(true)
      const incompTask = summary.incomplete_tasks[0]
      expect(incompTask).toHaveProperty('id')
      expect(incompTask).toHaveProperty('title')
      expect(incompTask).toHaveProperty('status')
      expect(incompTask).toHaveProperty('estimated_hours')

      // Verify completed_capabilities type
      expect(Array.isArray(summary.completed_capabilities)).toBe(true)
    })
  })
})
