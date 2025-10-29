import { VTMReader } from './vtm-reader'
import type { Task } from './types'

export type SchemaValidationError = {
  type: 'schema'
  taskIndex: number
  field: string
  message: string
}

export type DependencyValidationError = {
  type: 'dependency'
  taskId: string
  dependencyId: string
  message: string
}

export type CircularDependencyError = {
  type: 'circular'
  cycle: string[]
  message: string
}

export type ValidationError =
  | SchemaValidationError
  | DependencyValidationError
  | CircularDependencyError

export type TaskWithId = Task & { id: string }

export type ValidationResult =
  | {
      valid: true
      errors: ValidationError[]
      tasksWithIds: TaskWithId[]
      nextAvailableId: number
    }
  | {
      valid: false
      errors: ValidationError[]
      tasksWithIds?: undefined
      nextAvailableId?: undefined
    }

const VALID_STATUSES = ['pending', 'in-progress', 'blocked', 'completed']
const VALID_TEST_STRATEGIES = ['TDD', 'Unit', 'Integration', 'Direct']
const VALID_RISK_LEVELS = ['Low', 'Medium', 'High']

type TaskInput = {
  title?: string
  description?: string
  status?: string
  dependencies?: string[]
  test_strategy?: string
  risk_level?: string
  [key: string]: unknown
}

export class TaskValidator {
  private reader: VTMReader
  private existingTasks: Task[] = []
  private initialized = false

  constructor(private vtmPath: string = 'vtm.json') {
    this.reader = new VTMReader(vtmPath)
  }

  private async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      const vtmData = await this.reader.load()
      this.existingTasks = vtmData.tasks
      this.initialized = true
    } catch (error) {
      throw new Error(
        `Failed to load VTM file at ${this.vtmPath}: ${error instanceof Error ? error.message : String(error)}`,
      )
    }
  }

  /**
   * Validates a batch of tasks for ingestion into VTM
   */
  async validateTasks(tasksData: TaskInput[]): Promise<ValidationResult> {
    // Input validation
    if (!tasksData) {
      throw new Error('Tasks data cannot be null or undefined')
    }

    if (typeof tasksData === 'string') {
      throw new Error('Tasks data must be an array, not a string')
    }

    if (!Array.isArray(tasksData)) {
      throw new Error('Tasks data must be an array')
    }

    if (tasksData.length === 0) {
      throw new Error('Task list cannot be empty')
    }

    // Ensure VTM is loaded
    await this.initialize()

    const errors: ValidationError[] = []

    // Normalize tasks (ensure dependencies field exists)
    const normalizedTasks = tasksData.map((task) => ({
      ...task,
      dependencies: task.dependencies || [],
    }))

    // 1. Schema validation
    normalizedTasks.forEach((task, index) => {
      const schemaErrors = this.validateSchema(task)
      schemaErrors.forEach((error) => {
        errors.push({ ...error, taskIndex: index })
      })
    })

    // If schema validation failed, return early
    if (errors.length > 0) {
      return { valid: false, errors }
    }

    // 2. Assign task IDs
    const nextId = this.getNextTaskId()
    const tasksWithIds = this.assignTaskIds(normalizedTasks, nextId)

    // 3. Dependency validation
    const depErrors = this.validateDependencies(tasksWithIds, this.existingTasks)
    errors.push(...depErrors)

    // 4. Circular dependency detection
    const circularErrors = this.detectCircularDependencies(tasksWithIds)
    errors.push(...circularErrors)

    const valid = errors.length === 0

    if (valid) {
      return {
        valid: true,
        errors: [],
        tasksWithIds,
        nextAvailableId: nextId + tasksWithIds.length,
      }
    } else {
      return {
        valid: false,
        errors,
      }
    }
  }

  /**
   * Validates schema for a single task
   */
  validateSchema(task: TaskInput): Omit<SchemaValidationError, 'taskIndex'>[] {
    const errors: Omit<SchemaValidationError, 'taskIndex'>[] = []

    // Required fields
    if (!task.title || typeof task.title !== 'string') {
      errors.push({
        type: 'schema',
        field: 'title',
        message: 'Task must have a title (string)',
      })
    }

    if (!task.description || typeof task.description !== 'string') {
      errors.push({
        type: 'schema',
        field: 'description',
        message: 'Task must have a description (string)',
      })
    }

    if (!task.status) {
      errors.push({
        type: 'schema',
        field: 'status',
        message: 'Task must have a status',
      })
    } else if (!VALID_STATUSES.includes(task.status)) {
      errors.push({
        type: 'schema',
        field: 'status',
        message: `Invalid status "${task.status}". Must be one of: ${VALID_STATUSES.join(', ')}`,
      })
    }

    // test_strategy validation
    if (task.test_strategy && !VALID_TEST_STRATEGIES.includes(task.test_strategy)) {
      errors.push({
        type: 'schema',
        field: 'test_strategy',
        message: `Invalid test_strategy "${task.test_strategy}". Must be one of: ${VALID_TEST_STRATEGIES.join(', ')}`,
      })
    }

    // risk_level validation
    if (task.risk_level && !VALID_RISK_LEVELS.includes(task.risk_level)) {
      errors.push({
        type: 'schema',
        field: 'risk_level',
        message: `Invalid risk_level "${task.risk_level}". Must be one of: ${VALID_RISK_LEVELS.join(', ')}`,
      })
    }

    return errors
  }

  /**
   * Validates dependencies exist and are valid
   */
  validateDependencies(tasks: TaskWithId[], existingTasks: Task[]): DependencyValidationError[] {
    const errors: DependencyValidationError[] = []

    // Create a map of all available task IDs (new + existing incomplete)
    const newTaskIds = new Set(tasks.map((t) => t.id))
    const incompleteTasks = existingTasks.filter((t) => t.status !== 'completed')
    const existingIncompleteIds = new Set(incompleteTasks.map((t) => t.id))
    const completedIds = new Set(
      existingTasks.filter((t) => t.status === 'completed').map((t) => t.id),
    )

    const allAvailableIds = new Set([...newTaskIds, ...existingIncompleteIds])

    tasks.forEach((task) => {
      if (!task.dependencies || task.dependencies.length === 0) {
        return
      }

      task.dependencies.forEach((depId) => {
        const depIdStr = String(depId)
        // Check if dependency is a completed task
        if (completedIds.has(depIdStr)) {
          errors.push({
            type: 'dependency',
            taskId: task.id,
            dependencyId: depIdStr,
            message: `Dependency ${depIdStr} is already completed. Tasks should only depend on incomplete tasks.`,
          })
          return
        }

        // Check if dependency exists
        if (!allAvailableIds.has(depIdStr)) {
          errors.push({
            type: 'dependency',
            taskId: task.id,
            dependencyId: depIdStr,
            message: `Dependency ${depIdStr} does not exist in the VTM or the current batch`,
          })
        }
      })
    })

    return errors
  }

  /**
   * Detects circular dependencies using DFS
   */
  detectCircularDependencies(tasks: TaskWithId[]): CircularDependencyError[] {
    const errors: CircularDependencyError[] = []

    // Build adjacency list including existing incomplete tasks
    const incompleteTasks = this.existingTasks.filter((t) => t.status !== 'completed')
    const allTasks = [...incompleteTasks, ...tasks]
    const adjacencyList = new Map<string, string[]>()

    allTasks.forEach((task) => {
      adjacencyList.set(task.id, (task.dependencies || []).map(String))
    })

    // Track visited nodes and recursion stack for DFS
    const visited = new Set<string>()
    const recStack = new Set<string>()
    const path: string[] = []

    const dfs = (taskId: string): boolean => {
      visited.add(taskId)
      recStack.add(taskId)
      path.push(taskId)

      const dependencies = adjacencyList.get(taskId) || []

      for (const depId of dependencies) {
        if (!visited.has(depId)) {
          if (dfs(depId)) {
            return true
          }
        } else if (recStack.has(depId)) {
          // Found a cycle
          const cycleStart = path.indexOf(depId)
          const cycle = [...path.slice(cycleStart), depId]
          errors.push({
            type: 'circular',
            cycle,
            message: `Circular dependency detected: ${cycle.join(' -> ')}`,
          })
          return true
        }
      }

      recStack.delete(taskId)
      path.pop()
      return false
    }

    // Run DFS from each unvisited node
    for (const taskId of adjacencyList.keys()) {
      if (!visited.has(taskId)) {
        dfs(taskId)
      }
    }

    return errors
  }

  /**
   * Assigns sequential task IDs to new tasks
   */
  assignTaskIds(tasks: TaskInput[], nextId: number): TaskWithId[] {
    return tasks.map((task, index) => {
      const id = this.formatTaskId(nextId + index)
      return {
        ...(task as Task),
        id,
        dependencies: task.dependencies || [],
      }
    })
  }

  /**
   * Gets the next available task ID
   */
  private getNextTaskId(): number {
    if (this.existingTasks.length === 0) {
      return 1
    }

    const maxId = Math.max(
      ...this.existingTasks.map((task) => {
        const match = task.id.match(/TASK-(\d+)/)
        return match && match[1] ? parseInt(match[1], 10) : 0
      }),
    )

    return maxId + 1
  }

  /**
   * Formats a task number as a zero-padded ID
   */
  private formatTaskId(num: number): string {
    return `TASK-${String(num).padStart(3, '0')}`
  }
}
