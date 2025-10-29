import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import { TaskValidator } from '../src/lib/task-validator'
import type {
  ValidationResult,
  SchemaValidationError,
  DependencyValidationError,
  CircularDependencyError,
} from '../src/lib/task-validator'

describe('TaskValidator', () => {
  const testVtmPath = path.join(__dirname, 'test-vtm.json')
  let validator: TaskValidator

  beforeEach(() => {
    // Create a test VTM file with some existing tasks
    const testVtm = {
      project: 'Test Project',
      description: 'Test Description',
      stats: {
        total_tasks: 3,
        completed: 1,
        in_progress: 0,
        pending: 2,
        blocked: 0,
      },
      tasks: [
        {
          id: 'TASK-001',
          title: 'Existing Task 1',
          description: 'First task',
          status: 'completed',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
        {
          id: 'TASK-002',
          title: 'Existing Task 2',
          description: 'Second task',
          status: 'pending',
          dependencies: ['TASK-001'],
          test_strategy: 'TDD',
          risk_level: 'Medium',
        },
        {
          id: 'TASK-003',
          title: 'Existing Task 3',
          description: 'Third task',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Integration',
          risk_level: 'High',
        },
      ],
    }
    fs.writeFileSync(testVtmPath, JSON.stringify(testVtm, null, 2))
    validator = new TaskValidator(testVtmPath)
  })

  afterEach(() => {
    // Clean up test file
    if (fs.existsSync(testVtmPath)) {
      fs.unlinkSync(testVtmPath)
    }
  })

  describe('Schema Validation', () => {
    it('should validate a valid task', async () => {
      const tasks = [
        {
          title: 'Valid Task',
          description: 'A valid task description',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.tasksWithIds).toBeDefined()
      expect(result.tasksWithIds![0].id).toBe('TASK-004')
    })

    it('should fail when title is missing', async () => {
      const tasks = [
        {
          description: 'Missing title',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      const error = result.errors[0] as SchemaValidationError
      expect(error.type).toBe('schema')
      expect(error.field).toBe('title')
      expect(error.taskIndex).toBe(0)
    })

    it('should fail when description is missing', async () => {
      const tasks = [
        {
          title: 'Task Title',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(false)
      const error = result.errors[0] as SchemaValidationError
      expect(error.type).toBe('schema')
      expect(error.field).toBe('description')
    })

    it('should fail when status is missing', async () => {
      const tasks = [
        {
          title: 'Task Title',
          description: 'Task description',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(false)
      const error = result.errors[0] as SchemaValidationError
      expect(error.type).toBe('schema')
      expect(error.field).toBe('status')
    })

    it('should fail with invalid status enum value', async () => {
      const tasks = [
        {
          title: 'Task Title',
          description: 'Task description',
          status: 'invalid-status',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(false)
      const error = result.errors[0] as SchemaValidationError
      expect(error.type).toBe('schema')
      expect(error.field).toBe('status')
      expect(error.message).toContain('pending')
      expect(error.message).toContain('in-progress')
    })

    it('should fail with invalid test_strategy', async () => {
      const tasks = [
        {
          title: 'Task Title',
          description: 'Task description',
          status: 'pending',
          dependencies: [],
          test_strategy: 'InvalidStrategy',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(false)
      const error = result.errors[0] as SchemaValidationError
      expect(error.type).toBe('schema')
      expect(error.field).toBe('test_strategy')
      expect(error.message).toContain('TDD')
      expect(error.message).toContain('Unit')
    })

    it('should fail with invalid risk_level', async () => {
      const tasks = [
        {
          title: 'Task Title',
          description: 'Task description',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Critical',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(false)
      const error = result.errors[0] as SchemaValidationError
      expect(error.type).toBe('schema')
      expect(error.field).toBe('risk_level')
      expect(error.message).toContain('Low')
      expect(error.message).toContain('Medium')
      expect(error.message).toContain('High')
    })

    it('should collect multiple schema errors for a single task', async () => {
      const tasks = [
        {
          description: 'Missing multiple fields',
          status: 'invalid-status',
          dependencies: [],
          test_strategy: 'InvalidStrategy',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
      const schemaErrors = result.errors.filter((e) => e.type === 'schema') as SchemaValidationError[]
      const fields = schemaErrors.map((e) => e.field)
      expect(fields).toContain('title')
      expect(fields).toContain('status')
      expect(fields).toContain('test_strategy')
    })
  })

  describe('Dependency Validation', () => {
    it('should validate task with valid existing dependency', async () => {
      const tasks = [
        {
          title: 'New Task',
          description: 'Depends on existing task',
          status: 'pending',
          dependencies: ['TASK-002'],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate task with valid new dependency within batch', async () => {
      const tasks = [
        {
          title: 'First New Task',
          description: 'No dependencies',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
        {
          title: 'Second New Task',
          description: 'Depends on first new task',
          status: 'pending',
          dependencies: ['TASK-004'],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.tasksWithIds![0].id).toBe('TASK-004')
      expect(result.tasksWithIds![1].id).toBe('TASK-005')
    })

    it('should fail with non-existent dependency', async () => {
      const tasks = [
        {
          title: 'New Task',
          description: 'Depends on non-existent task',
          status: 'pending',
          dependencies: ['TASK-999'],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(false)
      const error = result.errors[0] as DependencyValidationError
      expect(error.type).toBe('dependency')
      expect(error.dependencyId).toBe('TASK-999')
      expect(error.message).toContain('does not exist')
    })

    it('should validate empty dependencies array', async () => {
      const tasks = [
        {
          title: 'Independent Task',
          description: 'No dependencies',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should validate task without dependencies field', async () => {
      const tasks = [
        {
          title: 'Independent Task',
          description: 'No dependencies field',
          status: 'pending',
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.tasksWithIds![0].dependencies).toEqual([])
    })

    it('should fail when depending on completed task', async () => {
      const tasks = [
        {
          title: 'New Task',
          description: 'Depends on completed task',
          status: 'pending',
          dependencies: ['TASK-001'],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(false)
      const error = result.errors[0] as DependencyValidationError
      expect(error.type).toBe('dependency')
      expect(error.dependencyId).toBe('TASK-001')
      expect(error.message).toContain('completed')
    })

    it('should handle multiple dependencies', async () => {
      const tasks = [
        {
          title: 'New Task',
          description: 'Multiple dependencies',
          status: 'pending',
          dependencies: ['TASK-002', 'TASK-003'],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('Circular Dependency Detection', () => {
    it('should pass with no circular dependencies: A → B → C', async () => {
      const tasks = [
        {
          title: 'Task A',
          description: 'First task',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
        {
          title: 'Task B',
          description: 'Second task',
          status: 'pending',
          dependencies: ['TASK-004'],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
        {
          title: 'Task C',
          description: 'Third task',
          status: 'pending',
          dependencies: ['TASK-005'],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should fail with direct cycle: A → B → A', async () => {
      const tasks = [
        {
          title: 'Task A',
          description: 'First task',
          status: 'pending',
          dependencies: ['TASK-005'],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
        {
          title: 'Task B',
          description: 'Second task',
          status: 'pending',
          dependencies: ['TASK-004'],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(false)
      const error = result.errors[0] as CircularDependencyError
      expect(error.type).toBe('circular')
      expect(error.cycle).toContain('TASK-004')
      expect(error.cycle).toContain('TASK-005')
      expect(error.message).toContain('Circular dependency detected')
    })

    it('should fail with indirect cycle: A → B → C → A', async () => {
      const tasks = [
        {
          title: 'Task A',
          description: 'First task',
          status: 'pending',
          dependencies: ['TASK-006'],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
        {
          title: 'Task B',
          description: 'Second task',
          status: 'pending',
          dependencies: ['TASK-004'],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
        {
          title: 'Task C',
          description: 'Third task',
          status: 'pending',
          dependencies: ['TASK-005'],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(false)
      const error = result.errors[0] as CircularDependencyError
      expect(error.type).toBe('circular')
      expect(error.cycle.length).toBeGreaterThan(2)
    })

    it('should fail with self-dependency: A → A', async () => {
      const tasks = [
        {
          title: 'Task A',
          description: 'Self-dependent task',
          status: 'pending',
          dependencies: ['TASK-004'],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(false)
      const error = result.errors[0] as CircularDependencyError
      expect(error.type).toBe('circular')
      expect(error.cycle).toContain('TASK-004')
    })

    it('should detect cycle in complex graph', async () => {
      const tasks = [
        {
          title: 'Task A',
          description: 'First task',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
        {
          title: 'Task B',
          description: 'Second task',
          status: 'pending',
          dependencies: ['TASK-004', 'TASK-007'], // B depends on A and D
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
        {
          title: 'Task C',
          description: 'Third task',
          status: 'pending',
          dependencies: ['TASK-005'], // C depends on B
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
        {
          title: 'Task D',
          description: 'Fourth task - creates cycle',
          status: 'pending',
          dependencies: ['TASK-006'], // D depends on C - creates cycle B->D->C->B
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(false)
      const error = result.errors.find((e) => e.type === 'circular') as CircularDependencyError
      expect(error).toBeDefined()
      expect(error.cycle).toBeDefined()
    })

    it('should handle cycle involving existing tasks', async () => {
      const tasks = [
        {
          title: 'New Task',
          description: 'Creates cycle with existing',
          status: 'pending',
          dependencies: ['TASK-002'],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      // Modify test VTM to create potential cycle scenario
      const vtmData = JSON.parse(fs.readFileSync(testVtmPath, 'utf-8'))
      vtmData.tasks[1].dependencies = ['TASK-004']
      fs.writeFileSync(testVtmPath, JSON.stringify(vtmData, null, 2))
      validator = new TaskValidator(testVtmPath)

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(false)
      const error = result.errors[0] as CircularDependencyError
      expect(error.type).toBe('circular')
    })
  })

  describe('ID Assignment', () => {
    it('should assign next available ID', async () => {
      const tasks = [
        {
          title: 'New Task',
          description: 'Should get TASK-004',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(true)
      expect(result.tasksWithIds![0].id).toBe('TASK-004')
      expect(result.nextAvailableId).toBe(5)
    })

    it('should zero-pad IDs correctly', async () => {
      // Create VTM with high task ID
      const vtmData = JSON.parse(fs.readFileSync(testVtmPath, 'utf-8'))
      vtmData.tasks.push({
        id: 'TASK-042',
        title: 'High ID Task',
        description: 'Task with ID 42',
        status: 'pending',
        dependencies: [],
        test_strategy: 'Unit',
        risk_level: 'Low',
      })
      fs.writeFileSync(testVtmPath, JSON.stringify(vtmData, null, 2))
      validator = new TaskValidator(testVtmPath)

      const tasks = [
        {
          title: 'New Task',
          description: 'Should get TASK-043',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(true)
      expect(result.tasksWithIds![0].id).toBe('TASK-043')
    })

    it('should handle existing high ID numbers', async () => {
      const vtmData = JSON.parse(fs.readFileSync(testVtmPath, 'utf-8'))
      vtmData.tasks.push({
        id: 'TASK-100',
        title: 'High ID Task',
        description: 'Task with ID 100',
        status: 'pending',
        dependencies: [],
        test_strategy: 'Unit',
        risk_level: 'Low',
      })
      fs.writeFileSync(testVtmPath, JSON.stringify(vtmData, null, 2))
      validator = new TaskValidator(testVtmPath)

      const tasks = [
        {
          title: 'New Task',
          description: 'Should get TASK-101',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(true)
      expect(result.tasksWithIds![0].id).toBe('TASK-101')
    })

    it('should not duplicate existing task IDs', async () => {
      const tasks = [
        {
          title: 'First New Task',
          description: 'Task 1',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
        {
          title: 'Second New Task',
          description: 'Task 2',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(true)
      expect(result.tasksWithIds![0].id).toBe('TASK-004')
      expect(result.tasksWithIds![1].id).toBe('TASK-005')
      expect(result.tasksWithIds![0].id).not.toBe(result.tasksWithIds![1].id)
    })

    it('should assign sequential IDs to multiple tasks', async () => {
      const tasks = [
        {
          title: 'Task 1',
          description: 'First',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
        {
          title: 'Task 2',
          description: 'Second',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
        {
          title: 'Task 3',
          description: 'Third',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(true)
      expect(result.tasksWithIds![0].id).toBe('TASK-004')
      expect(result.tasksWithIds![1].id).toBe('TASK-005')
      expect(result.tasksWithIds![2].id).toBe('TASK-006')
      expect(result.nextAvailableId).toBe(7)
    })
  })

  describe('Error Handling', () => {
    it('should throw on missing VTM file', async () => {
      const badValidator = new TaskValidator('/nonexistent/vtm.json')
      const tasks = [
        {
          title: 'Test',
          description: 'Test',
          status: 'pending',
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]
      await expect(badValidator.validateTasks(tasks)).rejects.toThrow()
    })

    it('should throw on invalid JSON input', async () => {
      await expect(validator.validateTasks('not json' as any)).rejects.toThrow()
    })

    it('should throw on empty task list', async () => {
      await expect(validator.validateTasks([])).rejects.toThrow('empty')
    })

    it('should throw on null input', async () => {
      await expect(validator.validateTasks(null as any)).rejects.toThrow()
    })

    it('should throw on undefined input', async () => {
      await expect(validator.validateTasks(undefined as any)).rejects.toThrow()
    })

    it('should provide clear error messages for schema validation', async () => {
      const tasks = [
        {
          title: 'Task',
          description: 'Desc',
          status: 'invalid',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      const error = result.errors[0] as SchemaValidationError
      expect(error.message).toContain('status')
      expect(error.message.length).toBeGreaterThan(10)
    })

    it('should provide clear error messages for dependency validation', async () => {
      const tasks = [
        {
          title: 'Task',
          description: 'Desc',
          status: 'pending',
          dependencies: ['TASK-999'],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      const error = result.errors[0] as DependencyValidationError
      expect(error.message).toContain('TASK-999')
      expect(error.message).toContain('does not exist')
    })

    it('should provide clear error messages for circular dependencies', async () => {
      const tasks = [
        {
          title: 'Task A',
          description: 'First',
          status: 'pending',
          dependencies: ['TASK-005'],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
        {
          title: 'Task B',
          description: 'Second',
          status: 'pending',
          dependencies: ['TASK-004'],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      const error = result.errors[0] as CircularDependencyError
      expect(error.message).toContain('Circular dependency')
      expect(error.message).toContain('TASK-004')
      expect(error.message).toContain('TASK-005')
    })
  })

  describe('Integration Tests', () => {
    it('should validate complex valid batch', async () => {
      const tasks = [
        {
          title: 'Task A',
          description: 'Independent task',
          status: 'pending',
          dependencies: [],
          test_strategy: 'TDD',
          risk_level: 'High',
        },
        {
          title: 'Task B',
          description: 'Depends on A',
          status: 'pending',
          dependencies: ['TASK-004'],
          test_strategy: 'Unit',
          risk_level: 'Medium',
        },
        {
          title: 'Task C',
          description: 'Depends on existing',
          status: 'pending',
          dependencies: ['TASK-002'],
          test_strategy: 'Integration',
          risk_level: 'Low',
        },
        {
          title: 'Task D',
          description: 'Multiple deps',
          status: 'pending',
          dependencies: ['TASK-004', 'TASK-005', 'TASK-002'],
          test_strategy: 'Direct',
          risk_level: 'Medium',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
      expect(result.tasksWithIds).toHaveLength(4)
      expect(result.nextAvailableId).toBe(8)
    })

    it('should collect multiple errors across tasks', async () => {
      const tasks = [
        {
          // Missing title and invalid status
          description: 'First task',
          status: 'invalid',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
        {
          title: 'Task B',
          description: 'Second task',
          status: 'pending',
          dependencies: [],
          test_strategy: 'InvalidStrategy',
          risk_level: 'Low',
        },
        {
          title: 'Task C',
          description: 'Third task',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'InvalidRisk',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(3)

      const schemaErrors = result.errors.filter((e) => e.type === 'schema')
      expect(schemaErrors.length).toBeGreaterThan(0)
      // Schema errors cause early return, so no dependency/circular errors
      expect(schemaErrors.some((e) => e.field === 'title')).toBe(true)
      expect(schemaErrors.some((e) => e.field === 'status')).toBe(true)
      expect(schemaErrors.some((e) => e.field === 'test_strategy')).toBe(true)
      expect(schemaErrors.some((e) => e.field === 'risk_level')).toBe(true)
    })

    it('should work with VTM containing only completed tasks', async () => {
      // Create VTM with only completed tasks
      const vtmData = {
        project: 'Test Project',
        description: 'Test Description',
        stats: { total_tasks: 2, completed: 2, in_progress: 0, pending: 0, blocked: 0 },
        tasks: [
          {
            id: 'TASK-001',
            title: 'Completed 1',
            description: 'Done',
            status: 'completed',
            dependencies: [],
            test_strategy: 'Unit',
            risk_level: 'Low',
          },
          {
            id: 'TASK-002',
            title: 'Completed 2',
            description: 'Done',
            status: 'completed',
            dependencies: [],
            test_strategy: 'Unit',
            risk_level: 'Low',
          },
        ],
      }
      fs.writeFileSync(testVtmPath, JSON.stringify(vtmData, null, 2))
      validator = new TaskValidator(testVtmPath)

      const tasks = [
        {
          title: 'New Task',
          description: 'First incomplete task',
          status: 'pending',
          dependencies: [],
          test_strategy: 'Unit',
          risk_level: 'Low',
        },
      ]

      const result = await validator.validateTasks(tasks)
      expect(result.valid).toBe(true)
      expect(result.tasksWithIds![0].id).toBe('TASK-003')
    })
  })

  describe('validateSchema method', () => {
    it('should return empty array for valid task', () => {
      const task = {
        title: 'Valid Task',
        description: 'Valid description',
        status: 'pending',
        dependencies: [],
        test_strategy: 'Unit',
        risk_level: 'Low',
      }

      const errors = validator.validateSchema(task)
      expect(errors).toHaveLength(0)
    })

    it('should return errors for invalid task', () => {
      const task = {
        description: 'Missing title',
        status: 'invalid',
        dependencies: [],
        test_strategy: 'Unit',
        risk_level: 'Low',
      }

      const errors = validator.validateSchema(task)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.field === 'title')).toBe(true)
      expect(errors.some((e) => e.field === 'status')).toBe(true)
    })
  })
})
