import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import type { VTM, Task } from '../src/lib/types'
import { ingestTasks, type IngestOptions } from '../src/lib/task-ingest-helper'

describe('task-ingest-helper', () => {
  const testDir = path.join(process.cwd(), '.test-ingest-helper')
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
        description: 'Testing Task Ingest Helper',
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

  describe('Test Suite 1: ID Assignment', () => {
    it('should assign sequential IDs starting from TASK-001 when VTM does not exist', async () => {
      const tasks: Partial<Task>[] = [
        {
          title: 'First task',
          description: 'Description 1',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
        },
        {
          title: 'Second task',
          description: 'Description 2',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'Unit',
          test_strategy_rationale: 'Medium risk',
          estimated_hours: 3,
          risk: 'medium',
          files: { create: [], modify: [], delete: [] },
        },
      ]

      const result = await ingestTasks(tasks, testVtmPath)

      expect(result).toHaveLength(2)
      expect(result[0]?.id).toBe('TASK-001')
      expect(result[1]?.id).toBe('TASK-002')
    })

    it('should assign IDs starting after highest existing ID', async () => {
      // Create VTM with existing tasks
      const vtm = createTestVtm([
        { id: 'TASK-001', title: 'Existing task 1' },
        { id: 'TASK-002', title: 'Existing task 2' },
        { id: 'TASK-003', title: 'Existing task 3' },
      ])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const tasks: Partial<Task>[] = [
        {
          title: 'New task 1',
          description: 'Description',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
        },
        {
          title: 'New task 2',
          description: 'Description',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'Unit',
          test_strategy_rationale: 'Medium risk',
          estimated_hours: 3,
          risk: 'medium',
          files: { create: [], modify: [], delete: [] },
        },
      ]

      const result = await ingestTasks(tasks, testVtmPath)

      expect(result).toHaveLength(2)
      expect(result[0]?.id).toBe('TASK-004')
      expect(result[1]?.id).toBe('TASK-005')
    })

    it('should handle gaps in existing IDs (uses max ID)', async () => {
      // Create VTM with gaps: TASK-001, TASK-005, TASK-010
      const vtm = createTestVtm([
        { id: 'TASK-001', title: 'Task 1' },
        { id: 'TASK-005', title: 'Task 5' },
        { id: 'TASK-010', title: 'Task 10' },
      ])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const tasks: Partial<Task>[] = [
        {
          title: 'New task',
          description: 'Description',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
        },
      ]

      const result = await ingestTasks(tasks, testVtmPath)

      expect(result).toHaveLength(1)
      expect(result[0]?.id).toBe('TASK-011') // Should start after max (010)
    })

    it('should pad IDs with leading zeros (TASK-001, TASK-099, TASK-100)', async () => {
      // Create VTM with 98 tasks
      const vtm = createTestVtm([{ id: 'TASK-098', title: 'Task 98' }])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const tasks: Partial<Task>[] = [
        {
          title: 'Task 99',
          description: 'Description',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
        },
        {
          title: 'Task 100',
          description: 'Description',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
        },
      ]

      const result = await ingestTasks(tasks, testVtmPath)

      expect(result).toHaveLength(2)
      expect(result[0]?.id).toBe('TASK-099')
      expect(result[1]?.id).toBe('TASK-100')
    })

    it('should skip ID assignment when assignIds=false', async () => {
      const tasks: Partial<Task>[] = [
        {
          id: 'CUSTOM-001',
          title: 'Custom ID task',
          description: 'Description',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
        },
      ]

      const options: IngestOptions = {
        assignIds: false,
      }

      const result = await ingestTasks(tasks, testVtmPath, options)

      expect(result).toHaveLength(1)
      expect(result[0]?.id).toBe('CUSTOM-001') // Should keep original ID
    })
  })

  describe('Test Suite 2: Dependency Resolution', () => {
    it('should resolve numeric dependencies to TASK-XXX IDs', async () => {
      const tasks: Partial<Task>[] = [
        {
          title: 'Task 1',
          description: 'First task',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
        },
        {
          title: 'Task 2',
          description: 'Depends on Task 1',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [0], // Numeric reference to first task
          blocks: [],
          test_strategy: 'Unit',
          test_strategy_rationale: 'Medium risk',
          estimated_hours: 3,
          risk: 'medium',
          files: { create: [], modify: [], delete: [] },
        },
        {
          title: 'Task 3',
          description: 'Depends on Task 1 and 2',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [0, 1], // Numeric references
          blocks: [],
          test_strategy: 'Integration',
          test_strategy_rationale: 'Integration needed',
          estimated_hours: 5,
          risk: 'low',
          files: { create: [], modify: [], delete: [] },
        },
      ]

      const result = await ingestTasks(tasks, testVtmPath)

      expect(result).toHaveLength(3)
      expect(result[1]?.dependencies).toEqual(['TASK-001'])
      expect(result[2]?.dependencies).toEqual(['TASK-001', 'TASK-002'])
    })

    it('should keep string dependencies unchanged', async () => {
      const tasks: Partial<Task>[] = [
        {
          title: 'New task',
          description: 'Depends on existing task',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: ['TASK-099'], // String reference to existing task
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
        },
      ]

      const result = await ingestTasks(tasks, testVtmPath)

      expect(result).toHaveLength(1)
      expect(result[0]?.dependencies).toEqual(['TASK-099']) // Unchanged
    })

    it('should handle mixed dependencies (numbers + strings)', async () => {
      const tasks: Partial<Task>[] = [
        {
          title: 'Task 1',
          description: 'First task',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
        },
        {
          title: 'Task 2',
          description: 'Depends on Task 1 and existing TASK-050',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [0, 'TASK-050'], // Mixed: index and string
          blocks: [],
          test_strategy: 'Unit',
          test_strategy_rationale: 'Medium risk',
          estimated_hours: 3,
          risk: 'medium',
          files: { create: [], modify: [], delete: [] },
        },
      ]

      const result = await ingestTasks(tasks, testVtmPath)

      expect(result).toHaveLength(2)
      expect(result[1]?.dependencies).toEqual(['TASK-001', 'TASK-050'])
    })

    it('should handle empty dependencies array', async () => {
      const tasks: Partial<Task>[] = [
        {
          title: 'Independent task',
          description: 'No dependencies',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
        },
      ]

      const result = await ingestTasks(tasks, testVtmPath)

      expect(result).toHaveLength(1)
      expect(result[0]?.dependencies).toEqual([])
    })

    it('should skip resolution when resolveDependencies=false', async () => {
      const tasks: Partial<Task>[] = [
        {
          title: 'Task 1',
          description: 'First task',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
        },
        {
          title: 'Task 2',
          description: 'Has numeric dependency',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [0], // Should NOT be resolved
          blocks: [],
          test_strategy: 'Unit',
          test_strategy_rationale: 'Medium risk',
          estimated_hours: 3,
          risk: 'medium',
          files: { create: [], modify: [], delete: [] },
        },
      ]

      const options: IngestOptions = {
        resolveDependencies: false,
      }

      const result = await ingestTasks(tasks, testVtmPath, options)

      expect(result).toHaveLength(2)
      expect(result[1]?.dependencies).toEqual([0]) // Still numeric
    })

    it('should throw error for out-of-bounds index', async () => {
      const tasks: Partial<Task>[] = [
        {
          title: 'Task 1',
          description: 'First task',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
        },
        {
          title: 'Task 2',
          description: 'Bad dependency',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [5], // Out of bounds (only 2 tasks)
          blocks: [],
          test_strategy: 'Unit',
          test_strategy_rationale: 'Medium risk',
          estimated_hours: 3,
          risk: 'medium',
          files: { create: [], modify: [], delete: [] },
        },
      ]

      await expect(ingestTasks(tasks, testVtmPath)).rejects.toThrow('Dependency index 5 is out of bounds')
    })
  })

  describe('Test Suite 3: Status Defaulting', () => {
    it('should set status=pending by default', async () => {
      const tasks: Partial<Task>[] = [
        {
          title: 'Task without status',
          description: 'Description',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
          // No status provided
        },
      ]

      const result = await ingestTasks(tasks, testVtmPath)

      expect(result).toHaveLength(1)
      expect(result[0]?.status).toBe('pending')
    })

    it('should respect existing status if provided', async () => {
      const tasks: Partial<Task>[] = [
        {
          title: 'Task with status',
          description: 'Description',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
          status: 'in-progress',
        },
      ]

      const result = await ingestTasks(tasks, testVtmPath)

      expect(result).toHaveLength(1)
      expect(result[0]?.status).toBe('in-progress')
    })

    it('should use custom defaultStatus from options', async () => {
      const tasks: Partial<Task>[] = [
        {
          title: 'Task without status',
          description: 'Description',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
          // No status provided
        },
      ]

      const options: IngestOptions = {
        defaultStatus: 'blocked',
      }

      const result = await ingestTasks(tasks, testVtmPath, options)

      expect(result).toHaveLength(1)
      expect(result[0]?.status).toBe('blocked')
    })

    it('should initialize started_at, completed_at, commits, validation', async () => {
      const tasks: Partial<Task>[] = [
        {
          title: 'Minimal task',
          description: 'Description',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
          // No started_at, completed_at, commits, validation
        },
      ]

      const result = await ingestTasks(tasks, testVtmPath)

      expect(result).toHaveLength(1)
      expect(result[0]?.started_at).toBeNull()
      expect(result[0]?.completed_at).toBeNull()
      expect(result[0]?.commits).toEqual([])
      expect(result[0]?.validation).toEqual({ tests_pass: false, ac_verified: [] })
    })
  })

  describe('Test Suite 4: Edge Cases', () => {
    it('should handle empty task array', async () => {
      const tasks: Partial<Task>[] = []

      const result = await ingestTasks(tasks, testVtmPath)

      expect(result).toHaveLength(0)
      expect(result).toEqual([])
    })

    it('should handle VTM with no tasks (start from TASK-001)', async () => {
      // Create VTM with no tasks
      const vtm = createTestVtm([])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const tasks: Partial<Task>[] = [
        {
          title: 'First task in empty VTM',
          description: 'Description',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
        },
      ]

      const result = await ingestTasks(tasks, testVtmPath)

      expect(result).toHaveLength(1)
      expect(result[0]?.id).toBe('TASK-001')
    })

    it('should handle missing vtm.json file gracefully', async () => {
      // Don't create VTM file - it doesn't exist
      const nonExistentPath = path.join(testDir, 'non-existent-vtm.json')

      const tasks: Partial<Task>[] = [
        {
          title: 'Task when VTM does not exist',
          description: 'Description',
          adr_source: 'ADR-001',
          spec_source: 'spec-example.md',
          acceptance_criteria: [],
          dependencies: [],
          blocks: [],
          test_strategy: 'TDD',
          test_strategy_rationale: 'High risk',
          estimated_hours: 4,
          risk: 'high',
          files: { create: [], modify: [], delete: [] },
        },
      ]

      const result = await ingestTasks(tasks, nonExistentPath)

      expect(result).toHaveLength(1)
      expect(result[0]?.id).toBe('TASK-001') // Should start from 001
    })
  })
})
