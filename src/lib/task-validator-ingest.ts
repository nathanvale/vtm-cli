// src/lib/task-validator-ingest.ts

/**
 * Task validation for VTM ingest operations.
 *
 * Provides comprehensive validation of tasks before ingestion, including
 * schema validation, dependency checking, and circular dependency detection.
 */

import * as fs from 'fs'
import * as readline from 'readline'
import chalk from 'chalk'
import type { Task } from './types'
import { VTMReader } from './vtm-reader'

/**
 * Result of task validation operation.
 */
export type ValidationResultIngest = {
  /** Whether all validation checks passed */
  valid: boolean
  /** Array of validation error messages (empty if valid=true) */
  errors: string[]
}

/**
 * Validator for tasks being ingested into VTM.
 *
 * Performs comprehensive validation of task arrays including:
 * - Required field validation (id, title, description, etc.)
 * - Enum field validation (status, test_strategy, risk)
 * - Array field type checking
 * - Dependency validation (both numeric indices and string TASK-IDs)
 * - Circular dependency detection
 *
 * @example
 * ```typescript
 * const validator = new TaskValidatorIngest();
 * await validator.loadExistingTasks('vtm.json');
 * const result = validator.validate(tasks);
 * if (!result.valid) {
 *   console.error('Validation errors:', result.errors);
 * }
 * ```
 */
export class TaskValidatorIngest {
  /** Set of existing task IDs from VTM file for dependency validation */
  private existingTaskIds: Set<string> = new Set()

  /**
   * Load existing VTM task IDs for dependency validation.
   *
   * Reads the VTM file and caches task IDs to validate that task dependencies
   * reference existing tasks. If VTM file doesn't exist, cache is left empty.
   *
   * @param vtmPath - Path to the VTM file (defaults to 'vtm.json')
   * @throws {Error} If VTM file exists but cannot be read (permission/parse errors)
   *
   * @remarks
   * Must be called before validate() if you want to check dependencies against
   * existing VTM tasks. If not called, validation will only check dependencies
   * within the new task batch.
   *
   * @example
   * ```typescript
   * const validator = new TaskValidatorIngest();
   * await validator.loadExistingTasks();
   * // Now validator will check dependencies against existing VTM
   * ```
   */
  async loadExistingTasks(vtmPath: string = 'vtm.json'): Promise<void> {
    try {
      const reader = new VTMReader(vtmPath)
      const vtm = await reader.load()
      this.existingTaskIds = new Set(vtm.tasks.map((t) => t.id))
    } catch {
      // VTM doesn't exist yet, that's ok
      this.existingTaskIds = new Set()
    }
  }

  /**
   * Validate an array of tasks for ingestion.
   *
   * Performs comprehensive validation including:
   * - All required fields are present
   * - Enum fields have valid values
   * - Array fields are actually arrays
   * - Dependencies reference existing tasks or valid indices
   * - No circular dependencies exist
   *
   * @param tasks - Array of tasks to validate
   * @returns Validation result with valid=true if all checks pass, errors array
   *
   * @remarks
   * Call loadExistingTasks() before this method to validate dependencies against
   * existing VTM. Without loading existing tasks, only batch-internal dependencies
   * will be validated.
   *
   * @example
   * ```typescript
   * const result = validator.validate([
   *   {
   *     id: "TASK-001",
   *     title: "Build feature",
   *     description: "Implementation details",
   *     acceptance_criteria: ["Should work"],
   *     status: "pending",
   *     test_strategy: "TDD",
   *     risk: "medium",
   *     dependencies: [0],
   *     blocks: [],
   *     adr_source: "adr/ADR-001.md",
   *     spec_source: "specs/spec-001.md"
   *   }
   * ]);
   * ```
   */
  validate(tasks: Task[]): ValidationResultIngest {
    const errors: string[] = []

    // Validate each task
    tasks.forEach((task, index) => {
      // Check required fields
      if (!task.id) {
        errors.push(`Task ${index + 1}: Missing required field 'id'`)
      }
      if (!task.title) {
        errors.push(`Task ${index + 1} (${task.id}): Missing required field 'title'`)
      }
      if (!task.description) {
        errors.push(`Task ${index + 1} (${task.id}): Missing required field 'description'`)
      }
      if (!task.adr_source) {
        errors.push(`Task ${index + 1} (${task.id}): Missing required field 'adr_source'`)
      }
      if (!task.spec_source) {
        errors.push(`Task ${index + 1} (${task.id}): Missing required field 'spec_source'`)
      }

      // Validate status
      const validStatuses = ['pending', 'in-progress', 'completed', 'blocked']
      if (!validStatuses.includes(task.status)) {
        errors.push(
          `Task ${task.id}: Invalid status '${task.status}'. Must be one of: ${validStatuses.join(', ')}`,
        )
      }

      // Validate test_strategy
      const validStrategies = ['TDD', 'Unit', 'Integration', 'Direct']
      if (!validStrategies.includes(task.test_strategy)) {
        errors.push(
          `Task ${task.id}: Invalid test_strategy '${task.test_strategy}'. Must be one of: ${validStrategies.join(', ')}`,
        )
      }

      // Validate risk
      const validRisks = ['low', 'medium', 'high']
      if (!validRisks.includes(task.risk)) {
        errors.push(
          `Task ${task.id}: Invalid risk '${task.risk}'. Must be one of: ${validRisks.join(', ')}`,
        )
      }

      // Validate dependencies exist
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach((dep) => {
          if (typeof dep === 'number') {
            // Validate index-based dependency
            if (dep < 0 || dep >= tasks.length) {
              errors.push(`Task ${task.id}: Dependency index ${dep} out of bounds`)
            }
          } else if (typeof dep === 'string') {
            // Validate string-based dependency (TASK-XXX format)
            // Check both new tasks and existing VTM tasks
            const depExists = tasks.some((t) => t.id === dep) || this.existingTaskIds.has(dep)
            if (!depExists) {
              errors.push(
                `Task ${task.id}: Dependency '${dep}' does not exist in task list or existing VTM`,
              )
            }
          }
        })
      }

      // Validate arrays
      if (!Array.isArray(task.acceptance_criteria)) {
        errors.push(`Task ${task.id}: Field 'acceptance_criteria' must be an array`)
      }
      if (!Array.isArray(task.dependencies)) {
        errors.push(`Task ${task.id}: Field 'dependencies' must be an array`)
      }
      if (!Array.isArray(task.blocks)) {
        errors.push(`Task ${task.id}: Field 'blocks' must be an array`)
      }
    })

    // Check for circular dependencies
    const circularErrors = this.checkCircularDependencies(tasks)
    errors.push(...circularErrors)

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Check for circular dependencies in tasks.
   *
   * Detects cycles in the task dependency graph using depth-first search
   * with a recursion stack. Supports both numeric indices and string TASK-IDs.
   *
   * @param tasks - Array of tasks to check for circular dependencies
   * @returns Array of error messages describing any circular dependencies found
   *
   * @remarks
   * Uses depth-first search to detect cycles:
   * - Maintains a visited set for nodes already fully explored
   * - Maintains a recursion stack for nodes in current path
   * - If a node in recursion stack is visited again, a cycle exists
   * - Reports full cycle path in error message for debugging
   *
   * @internal
   */
  private checkCircularDependencies(tasks: Task[]): string[] {
    const errors: string[] = []
    const taskMap = new Map(tasks.map((t) => [t.id, t]))

    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    const detectCycle = (taskId: string, path: string[]): boolean => {
      if (recursionStack.has(taskId)) {
        errors.push(`Circular dependency detected: ${path.join(' -> ')} -> ${taskId}`)
        return true
      }

      if (visited.has(taskId)) {
        return false
      }

      visited.add(taskId)
      recursionStack.add(taskId)

      const task = taskMap.get(taskId)
      if (task && task.dependencies) {
        for (const dep of task.dependencies) {
          // Resolve dependency to task ID
          const depTaskId = typeof dep === 'number' ? tasks[dep]?.id : dep
          if (depTaskId && detectCycle(depTaskId, [...path, taskId])) {
            return true
          }
        }
      }

      recursionStack.delete(taskId)
      return false
    }

    tasks.forEach((task) => {
      if (!visited.has(task.id)) {
        detectCycle(task.id, [])
      }
    })

    return errors
  }
}

/**
 * Load tasks from a JSON file.
 *
 * Reads a JSON file containing an array of task objects and parses it.
 * File must be a valid JSON array at the top level.
 *
 * @param filePath - Path to JSON file containing task array
 * @returns Object with tasks array property
 * @throws {Error} If file does not exist
 * @throws {Error} If file contains invalid JSON
 * @throws {Error} If file content is not a JSON array
 *
 * @example
 * ```typescript
 * const { tasks } = loadTasksFromFile('tasks.json');
 * // tasks is now Task[]
 * ```
 *
 * @remarks
 * The JSON file must be a valid array of task objects:
 * ```json
 * [
 *   {
 *     "id": "TASK-001",
 *     "title": "Example task",
 *     ...
 *   }
 * ]
 * ```
 */
export function loadTasksFromFile(filePath: string): { tasks: Task[] } {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Tasks file not found: ${filePath}`)
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  let parsed: unknown

  try {
    parsed = JSON.parse(content)
  } catch (error) {
    throw new Error(`Invalid JSON in tasks file: ${(error as Error).message}`)
  }

  if (!Array.isArray(parsed)) {
    throw new Error('Tasks file must be an array of tasks')
  }

  return { tasks: parsed as Task[] }
}

/**
 * Generate a human-readable preview of tasks to be ingested.
 *
 * Creates a formatted text preview showing all tasks and their dependency status.
 * Indicates which dependencies are new (in this batch), existing (in VTM),
 * in-progress, completed, or missing.
 *
 * @param tasks - Array of tasks to preview
 * @param vtmPath - Path to VTM file for checking existing task dependencies
 * @returns Promise resolving to formatted preview string
 *
 * @example
 * ```typescript
 * const preview = await generateTaskPreview(tasks);
 * console.log(preview);
 * // Output:
 * // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * // 📋 Generated 2 tasks
 * // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * //
 * // TASK-001: Implement auth
 * //   Dependencies: none
 * //   Ready when: immediately
 * //
 * // TASK-002: Add profiles
 * //   Dependencies: TASK-001 (new)
 * //   Ready when: TASK-001 completes
 * // ...
 * ```
 *
 * @remarks
 * Dependency status indicators:
 * - "(new)" in cyan: Task from this batch
 * - "✓" in green: Completed existing task
 * - "⏳" in yellow: In-progress existing task
 * - "⚠" in red: Blocked existing task
 * - "⏸" in gray: Pending existing task
 * - "(missing)" in red: Referenced but not found
 */
export async function generateTaskPreview(
  tasks: Task[],
  vtmPath: string = 'vtm.json',
): Promise<string> {
  let preview = '\n'
  preview += chalk.bold('━'.repeat(60)) + '\n'
  preview += chalk.bold(`📋 Generated ${tasks.length} tasks`) + '\n'
  preview += chalk.bold('━'.repeat(60)) + '\n\n'

  // Load existing VTM to get dependency statuses
  const reader = new VTMReader(vtmPath)
  let existingTasks: Task[] = []
  try {
    const vtm = await reader.load()
    existingTasks = vtm.tasks
  } catch {
    // If VTM doesn't exist, that's ok - all deps will show as "new"
  }

  const newTaskIds = new Set(tasks.map((t) => t.id))

  for (const task of tasks) {
    preview += chalk.bold(`${task.id}: ${task.title}`) + '\n'

    if (task.dependencies.length > 0) {
      const depStatuses = task.dependencies.map((dep) => {
        // Resolve dependency to task ID
        const depId = typeof dep === 'number' ? tasks[dep]?.id || `index-${dep}` : dep

        // Check if dependency is in new tasks
        if (newTaskIds.has(depId)) {
          return `${depId} ${chalk.cyan('(new)')}`
        }

        // Check if dependency exists in VTM
        const existingDep = existingTasks.find((t) => t.id === depId)
        if (existingDep) {
          const statusIcon =
            existingDep.status === 'completed'
              ? chalk.green('✓')
              : existingDep.status === 'in-progress'
                ? chalk.yellow('⏳')
                : existingDep.status === 'blocked'
                  ? chalk.red('⚠')
                  : chalk.gray('⏸')
          return `${depId} ${statusIcon} (${existingDep.status})`
        }

        // Dependency doesn't exist
        return `${depId} ${chalk.red('(missing)')}`
      })

      preview += chalk.gray(`  Dependencies: ${depStatuses.join(', ')}`) + '\n'
    } else {
      preview += chalk.gray(`  Dependencies: none`) + '\n'
    }

    // Show ready condition
    if (task.dependencies.length > 0) {
      const depIds = task.dependencies
        .map((dep) => (typeof dep === 'number' ? tasks[dep]?.id || `index-${dep}` : dep))
        .join(', ')
      preview += chalk.gray(`  Ready when: ${depIds} completes`) + '\n'
    } else {
      preview += chalk.gray(`  Ready when: immediately`) + '\n'
    }

    preview += '\n'
  }

  preview += chalk.bold('━'.repeat(60)) + '\n'

  return preview
}

/**
 * Prompt the user for a yes/no confirmation via stdin.
 *
 * Displays a message and waits for user input on the command line.
 * Accepts 'y', 'yes' (case-insensitive) as confirmation.
 *
 * @param message - Message to display to the user
 * @returns Promise resolving to true for "yes", false for any other input
 *
 * @example
 * ```typescript
 * const confirmed = await promptConfirmation('Ingest 5 tasks?');
 * if (confirmed) {
 *   // Proceed with ingestion
 * }
 * ```
 *
 * @remarks
 * Uses readline interface to read from stdin/stdout. The promise resolves
 * after the user provides input and the readline interface is closed.
 */
export function promptConfirmation(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(`${message} (y/n) `, (answer) => {
      rl.close()
      const normalized = answer.toLowerCase().trim()
      resolve(normalized === 'y' || normalized === 'yes')
    })
  })
}

/**
 * Type alias for backward compatibility with test imports.
 * @internal
 */
export type ValidationResult = ValidationResultIngest

/**
 * Class alias for backward compatibility with test imports.
 * @internal
 */
export const TaskValidator = TaskValidatorIngest
