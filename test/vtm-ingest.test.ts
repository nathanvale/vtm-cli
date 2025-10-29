import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import type { VTM, Task } from '../src/lib/types'
import { VTMWriter } from '../src/lib/vtm-writer'
import { VTMReader } from '../src/lib/vtm-reader'
import {
  TaskValidator,
  loadTasksFromFile,
  generateTaskPreview,
  promptConfirmation,
} from '../src/lib/task-validator-ingest'

// Mock readline module - use hoisted to make mockCreateInterface available
const { mockCreateInterface } = vi.hoisted(() => ({
  mockCreateInterface: vi.fn(),
}))

// NOTE: Commenting out readline mock due to test isolation issues
// vi.mock('readline', () => ({
//   createInterface: mockCreateInterface,
// }))

describe('vtm ingest command', () => {
  const testDir = path.join(process.cwd(), '.test-ingest')
  const testVtmPath = path.join(testDir, 'vtm.json')
  const testTasksPath = path.join(testDir, 'tasks.json')

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
        description: 'Testing VTM Ingest',
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

  /**
   * Helper to create valid task JSON
   */
  function createValidTasks(): Task[] {
    return [
      {
        id: 'TASK-040',
        adr_source: 'ADR-002',
        spec_source: 'spec-auth.md',
        title: 'Create user profile model',
        description: 'Implement user profile data model',
        acceptance_criteria: ['Model created', 'Tests pass'],
        dependencies: [],
        blocks: [],
        test_strategy: 'TDD',
        test_strategy_rationale: 'High risk data model',
        estimated_hours: 4,
        risk: 'high',
        files: { create: ['src/models/profile.ts'], modify: [], delete: [] },
        status: 'pending',
        started_at: null,
        completed_at: null,
        commits: [],
        validation: { tests_pass: false, ac_verified: [] },
      },
      {
        id: 'TASK-041',
        adr_source: 'ADR-002',
        spec_source: 'spec-auth.md',
        title: 'Add profile API endpoints',
        description: 'Create REST API endpoints for profile',
        acceptance_criteria: ['Endpoints created', 'Tests pass'],
        dependencies: ['TASK-040'],
        blocks: [],
        test_strategy: 'Integration',
        test_strategy_rationale: 'API integration testing',
        estimated_hours: 6,
        risk: 'medium',
        files: { create: ['src/api/profile.ts'], modify: [], delete: [] },
        status: 'pending',
        started_at: null,
        completed_at: null,
        commits: [],
        validation: { tests_pass: false, ac_verified: [] },
      },
      {
        id: 'TASK-042',
        adr_source: 'ADR-002',
        spec_source: 'spec-auth.md',
        title: 'Add profile UI components',
        description: 'Create UI components for profile management',
        acceptance_criteria: ['Components created', 'Tests pass'],
        dependencies: ['TASK-041'],
        blocks: [],
        test_strategy: 'Unit',
        test_strategy_rationale: 'Component unit tests',
        estimated_hours: 8,
        risk: 'low',
        files: { create: ['src/ui/ProfileView.tsx'], modify: [], delete: [] },
        status: 'pending',
        started_at: null,
        completed_at: null,
        commits: [],
        validation: { tests_pass: false, ac_verified: [] },
      },
    ]
  }

  describe('TaskValidator', () => {
    it('should validate valid tasks', () => {
      const validator = new TaskValidator()
      const tasks = createValidTasks()

      const result = validator.validate(tasks)

      expect(result.valid).toBe(true)
      expect(result.errors).toEqual([])
    })

    it('should reject tasks with missing required fields', () => {
      const validator = new TaskValidator()
      const invalidTasks = [
        {
          id: 'TASK-040',
          // Missing title
          description: 'Test',
          dependencies: [],
        },
      ] as Task[]

      const result = validator.validate(invalidTasks)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should reject tasks with invalid status', () => {
      const validator = new TaskValidator()
      const tasks = createValidTasks()
      tasks[0]!.status = 'invalid-status' as any

      const result = validator.validate(tasks)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toMatch(/status/)
    })

    it('should reject tasks with circular dependencies', () => {
      const validator = new TaskValidator()
      const tasks = createValidTasks()
      tasks[0]!.dependencies = ['TASK-042'] // Circular: 040 -> 042 -> 041 -> 040

      const result = validator.validate(tasks)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toMatch(/Circular dependency/)
    })

    it('should reject tasks with non-existent dependencies', () => {
      const validator = new TaskValidator()
      const tasks = createValidTasks()
      tasks[0]!.dependencies = ['TASK-999'] // Non-existent

      const result = validator.validate(tasks)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toMatch(/TASK-999/)
    })

    it('should reject tasks with invalid test_strategy', () => {
      const validator = new TaskValidator()
      const tasks = createValidTasks()
      tasks[0]!.test_strategy = 'InvalidStrategy' as any

      const result = validator.validate(tasks)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toMatch(/Invalid test_strategy/)
    })

    it('should reject tasks with invalid risk level', () => {
      const validator = new TaskValidator()
      const tasks = createValidTasks()
      tasks[0]!.risk = 'critical' as any

      const result = validator.validate(tasks)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toMatch(/Invalid risk/)
    })

    describe('index-based dependencies', () => {
      it('should accept valid numeric dependencies within bounds', () => {
        const validator = new TaskValidator()
        const tasks: Task[] = [
          {
            id: 'TASK-001',
            adr_source: 'ADR-001',
            spec_source: 'spec.md',
            title: 'Task 1',
            description: 'First task',
            acceptance_criteria: [],
            dependencies: [],
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'Test',
            estimated_hours: 4,
            risk: 'low',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
          },
          {
            id: 'TASK-002',
            adr_source: 'ADR-001',
            spec_source: 'spec.md',
            title: 'Task 2',
            description: 'Second task',
            acceptance_criteria: [],
            dependencies: [0], // References first task by index
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'Test',
            estimated_hours: 4,
            risk: 'low',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
          },
          {
            id: 'TASK-003',
            adr_source: 'ADR-001',
            spec_source: 'spec.md',
            title: 'Task 3',
            description: 'Third task',
            acceptance_criteria: [],
            dependencies: [0, 1], // References first and second tasks
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'Test',
            estimated_hours: 4,
            risk: 'low',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
          },
        ]

        const result = validator.validate(tasks)

        expect(result.valid).toBe(true)
        expect(result.errors).toEqual([])
      })

      it('should reject negative index', () => {
        const validator = new TaskValidator()
        const tasks: Task[] = [
          {
            id: 'TASK-001',
            adr_source: 'ADR-001',
            spec_source: 'spec.md',
            title: 'Task 1',
            description: 'First task',
            acceptance_criteria: [],
            dependencies: [],
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'Test',
            estimated_hours: 4,
            risk: 'low',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
          },
          {
            id: 'TASK-002',
            adr_source: 'ADR-001',
            spec_source: 'spec.md',
            title: 'Task 2',
            description: 'Second task',
            acceptance_criteria: [],
            dependencies: [-1], // Invalid: negative index
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'Test',
            estimated_hours: 4,
            risk: 'low',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
          },
        ]

        const result = validator.validate(tasks)

        expect(result.valid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
        expect(result.errors[0]).toMatch(/dependency index -1 out of bounds/i)
      })

      it('should reject index >= array length', () => {
        const validator = new TaskValidator()
        const tasks: Task[] = [
          {
            id: 'TASK-001',
            adr_source: 'ADR-001',
            spec_source: 'spec.md',
            title: 'Task 1',
            description: 'First task',
            acceptance_criteria: [],
            dependencies: [],
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'Test',
            estimated_hours: 4,
            risk: 'low',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
          },
          {
            id: 'TASK-002',
            adr_source: 'ADR-001',
            spec_source: 'spec.md',
            title: 'Task 2',
            description: 'Second task',
            acceptance_criteria: [],
            dependencies: [5], // Invalid: out of bounds (only 2 tasks)
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'Test',
            estimated_hours: 4,
            risk: 'low',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
          },
        ]

        const result = validator.validate(tasks)

        expect(result.valid).toBe(false)
        expect(result.errors.length).toBeGreaterThan(0)
        expect(result.errors[0]).toMatch(/dependency index 5 out of bounds/i)
      })

      it('should accept mixed dependencies (numbers and strings)', () => {
        const validator = new TaskValidator()
        const tasks: Task[] = [
          {
            id: 'TASK-001',
            adr_source: 'ADR-001',
            spec_source: 'spec.md',
            title: 'Task 1',
            description: 'First task',
            acceptance_criteria: [],
            dependencies: [],
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'Test',
            estimated_hours: 4,
            risk: 'low',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
          },
          {
            id: 'TASK-002',
            adr_source: 'ADR-001',
            spec_source: 'spec.md',
            title: 'Task 2',
            description: 'Second task',
            acceptance_criteria: [],
            dependencies: [],
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'Test',
            estimated_hours: 4,
            risk: 'low',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
          },
          {
            id: 'TASK-003',
            adr_source: 'ADR-001',
            spec_source: 'spec.md',
            title: 'Task 3',
            description: 'Third task with mixed deps',
            acceptance_criteria: [],
            dependencies: [0, 'TASK-002'], // Mix of index and task ID
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'Test',
            estimated_hours: 4,
            risk: 'low',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
          },
        ]

        const result = validator.validate(tasks)

        expect(result.valid).toBe(true)
        expect(result.errors).toEqual([])
      })

      it('should accept empty dependencies', () => {
        const validator = new TaskValidator()
        const tasks: Task[] = [
          {
            id: 'TASK-001',
            adr_source: 'ADR-001',
            spec_source: 'spec.md',
            title: 'Task 1',
            description: 'First task',
            acceptance_criteria: [],
            dependencies: [],
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'Test',
            estimated_hours: 4,
            risk: 'low',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
          },
        ]

        const result = validator.validate(tasks)

        expect(result.valid).toBe(true)
        expect(result.errors).toEqual([])
      })

      it('should validate multiple tasks with cross-references', () => {
        const validator = new TaskValidator()
        const tasks: Task[] = [
          {
            id: 'TASK-001',
            adr_source: 'ADR-001',
            spec_source: 'spec.md',
            title: 'Task 1',
            description: 'First task',
            acceptance_criteria: [],
            dependencies: [],
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'Test',
            estimated_hours: 4,
            risk: 'low',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
          },
          {
            id: 'TASK-002',
            adr_source: 'ADR-001',
            spec_source: 'spec.md',
            title: 'Task 2',
            description: 'Second task',
            acceptance_criteria: [],
            dependencies: [0],
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'Test',
            estimated_hours: 4,
            risk: 'low',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
          },
          {
            id: 'TASK-003',
            adr_source: 'ADR-001',
            spec_source: 'spec.md',
            title: 'Task 3',
            description: 'Third task',
            acceptance_criteria: [],
            dependencies: [1],
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'Test',
            estimated_hours: 4,
            risk: 'low',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
          },
          {
            id: 'TASK-004',
            adr_source: 'ADR-001',
            spec_source: 'spec.md',
            title: 'Task 4',
            description: 'Fourth task',
            acceptance_criteria: [],
            dependencies: [0, 2], // Depends on tasks 1 and 3
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'Test',
            estimated_hours: 4,
            risk: 'low',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
          },
        ]

        const result = validator.validate(tasks)

        expect(result.valid).toBe(true)
        expect(result.errors).toEqual([])
      })
    })
  })

  describe('load tasks from file', () => {
    it('should load valid tasks from JSON file', () => {
      const tasks = createValidTasks()
      fs.writeFileSync(testTasksPath, JSON.stringify(tasks, null, 2))

      const result = loadTasksFromFile(testTasksPath)

      expect(result.tasks).toHaveLength(3)
      expect(result.tasks[0]?.id).toBe('TASK-040')
    })

    it('should throw error for non-existent file', () => {
      expect(() => {
        loadTasksFromFile('/non/existent/file.json')
      }).toThrow('Tasks file not found')
    })

    it('should throw error for invalid JSON', () => {
      fs.writeFileSync(testTasksPath, 'invalid json {')

      expect(() => {
        loadTasksFromFile(testTasksPath)
      }).toThrow('Invalid JSON')
    })

    it('should throw error for non-array JSON', () => {
      fs.writeFileSync(testTasksPath, JSON.stringify({ not: 'array' }))

      expect(() => {
        loadTasksFromFile(testTasksPath)
      }).toThrow('must be an array')
    })
  })

  describe('preview generation', () => {
    it('should generate preview for tasks', async () => {
      const vtm = createTestVtm([
        { id: 'TASK-038', status: 'pending' },
        { id: 'TASK-039', status: 'in-progress' },
      ])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const tasks = createValidTasks()
      const preview = await generateTaskPreview(tasks, testVtmPath)

      // Should show new tasks
      expect(preview).toContain('TASK-040')
      expect(preview).toContain('Create user profile model')
      // Should show task count
      expect(preview).toContain('Generated 3 tasks')
    })

    it('should show dependency status in preview', async () => {
      const vtm = createTestVtm([
        { id: 'TASK-038', status: 'completed' },
        { id: 'TASK-039', status: 'in-progress' },
      ])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      // Create tasks that depend on the existing ones
      const tasks = [
        {
          id: 'TASK-040',
          adr_source: 'ADR-002',
          spec_source: 'spec-auth.md',
          title: 'Use existing tasks',
          description: 'Depends on completed and in-progress tasks',
          acceptance_criteria: [],
          dependencies: ['TASK-038', 'TASK-039'],
          blocks: [],
          test_strategy: 'TDD' as const,
          test_strategy_rationale: 'Test deps',
          estimated_hours: 4,
          risk: 'low' as const,
          files: { create: [], modify: [], delete: [] },
          status: 'pending' as const,
          started_at: null,
          completed_at: null,
          commits: [],
          validation: { tests_pass: false, ac_verified: [] },
        },
      ]
      const preview = await generateTaskPreview(tasks, testVtmPath)

      expect(preview).toContain('TASK-038')
      expect(preview).toContain('✓')
      expect(preview).toContain('TASK-039')
      expect(preview).toContain('⏳')
    })

    it('should show new task dependencies', async () => {
      const vtm = createTestVtm([
        { id: 'TASK-038', status: 'completed' },
        { id: 'TASK-039', status: 'completed' },
      ])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const tasks = createValidTasks()
      const preview = await generateTaskPreview(tasks, testVtmPath)

      // TASK-041 depends on TASK-040 (new)
      expect(preview).toContain('TASK-040')
      expect(preview).toContain('(new)')
    })

    it('should show ready condition for each task', async () => {
      const vtm = createTestVtm([{ id: 'TASK-038', status: 'pending' }])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      // Create task that depends on existing TASK-038
      const tasks = [
        {
          id: 'TASK-040',
          adr_source: 'ADR-002',
          spec_source: 'spec-auth.md',
          title: 'Task after existing',
          description: 'Depends on existing task',
          acceptance_criteria: [],
          dependencies: ['TASK-038'],
          blocks: [],
          test_strategy: 'TDD' as const,
          test_strategy_rationale: 'Test',
          estimated_hours: 4,
          risk: 'low' as const,
          files: { create: [], modify: [], delete: [] },
          status: 'pending' as const,
          started_at: null,
          completed_at: null,
          commits: [],
          validation: { tests_pass: false, ac_verified: [] },
        },
      ]
      const preview = await generateTaskPreview(tasks, testVtmPath)

      expect(preview).toContain('Ready when')
      expect(preview).toContain('TASK-038 completes')
    })
  })

  describe('VTMWriter.appendTasks', () => {
    it('should append tasks to existing VTM', async () => {
      const vtm = createTestVtm([
        { id: 'TASK-001', status: 'completed' },
        { id: 'TASK-002', status: 'pending' },
      ])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const writer = new VTMWriter(testVtmPath)
      const newTasks = createValidTasks()

      await writer.appendTasks(newTasks)

      const reader = new VTMReader(testVtmPath)
      const updated = await reader.load()

      expect(updated.tasks).toHaveLength(5)
      expect(updated.tasks[2]?.id).toBe('TASK-040')
      expect(updated.tasks[3]?.id).toBe('TASK-041')
      expect(updated.tasks[4]?.id).toBe('TASK-042')
    })

    it('should update stats after appending', async () => {
      const vtm = createTestVtm([
        { id: 'TASK-001', status: 'completed' },
        { id: 'TASK-002', status: 'pending' },
      ])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const writer = new VTMWriter(testVtmPath)
      const newTasks = createValidTasks()

      await writer.appendTasks(newTasks)

      const reader = new VTMReader(testVtmPath)
      const updated = await reader.load()

      expect(updated.stats.total_tasks).toBe(5)
      expect(updated.stats.completed).toBe(1)
      expect(updated.stats.pending).toBe(4)
    })

    it('should maintain task order after append', async () => {
      const vtm = createTestVtm([{ id: 'TASK-001', status: 'completed' }])
      fs.writeFileSync(testVtmPath, JSON.stringify(vtm, null, 2))

      const writer = new VTMWriter(testVtmPath)
      const newTasks = createValidTasks()

      await writer.appendTasks(newTasks)

      const reader = new VTMReader(testVtmPath)
      const updated = await reader.load()

      const ids = updated.tasks.map((t) => t.id)
      expect(ids).toEqual(['TASK-001', 'TASK-040', 'TASK-041', 'TASK-042'])
    })
  })

})
