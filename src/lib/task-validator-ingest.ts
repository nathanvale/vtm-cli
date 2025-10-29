// src/lib/task-validator-ingest.ts
// Simplified validator for vtm ingest command

import * as fs from 'fs'
import * as readline from 'readline'
import chalk from 'chalk'
import type { Task } from './types'
import { VTMReader } from './vtm-reader'

export type ValidationResultIngest = {
  valid: boolean
  errors: string[]
}

export class TaskValidatorIngest {
  private existingTaskIds: Set<string> = new Set()

  /**
   * Load existing VTM task IDs for dependency validation
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
   * Validate an array of tasks
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
   * Check for circular dependencies in tasks
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
 * Load tasks from JSON file
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
 * Generate preview of tasks to be ingested
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
 * Prompt user for confirmation
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

// Export aliases for backward compatibility with test imports
export type ValidationResult = ValidationResultIngest
export const TaskValidator = TaskValidatorIngest
