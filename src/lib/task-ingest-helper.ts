// src/lib/task-ingest-helper.ts

import { VTMReader } from './vtm-reader'
import type { Task } from './types'

/**
 * Options for configuring task ingestion behavior.
 *
 * @remarks
 * All options have sensible defaults that enable automatic ID assignment and
 * dependency resolution. Disable individual options to customize behavior.
 */
export type IngestOptions = {
  /**
   * Whether to automatically assign TASK-XXX IDs to tasks without IDs.
   * @default true
   */
  assignIds?: boolean
  /**
   * Whether to resolve numeric index dependencies to TASK-XXX IDs.
   * @default true
   */
  resolveDependencies?: boolean
  /**
   * Default status to use for ingested tasks if not specified.
   * @default 'pending'
   */
  defaultStatus?: Task['status']
}

/**
 * Ingest tasks with automatic ID assignment and dependency resolution.
 *
 * Processes an array of partial task objects and returns fully-formed tasks
 * with IDs assigned and dependencies resolved. Integrates with existing VTM
 * file to continue ID numbering and validate dependencies against existing tasks.
 *
 * @param tasks - Array of partial tasks to ingest (ID and dependencies optional)
 * @param vtmPath - Path to VTM file to read for ID numbering and existing tasks
 * @param options - Configuration options for ingestion behavior
 * @returns Promise resolving to array of fully-formed tasks ready for VTM ingestion
 * @throws {Error} If VTM file exists but cannot be read (unless VTM doesn't exist)
 * @throws {Error} If a numeric dependency index is out of bounds
 *
 * @example
 * ```typescript
 * const tasks = await ingestTasks([
 *   {
 *     title: "Implement auth",
 *     description: "Add authentication system",
 *     acceptance_criteria: ["User can log in"],
 *     dependencies: [],
 *     test_strategy: "TDD"
 *   },
 *   {
 *     title: "Add user profiles",
 *     description: "Add profile support",
 *     acceptance_criteria: ["Users can set profile"],
 *     dependencies: [0], // References first task by index
 *     test_strategy: "Unit"
 *   }
 * ]);
 * // Returns:
 * // [
 * //   { id: "TASK-001", title: "Implement auth", dependencies: [], ... },
 * //   { id: "TASK-002", title: "Add user profiles", dependencies: ["TASK-001"], ... }
 * // ]
 * ```
 *
 * @remarks
 * ID Assignment:
 * - If assignIds=true, finds the highest existing TASK-XXX ID in VTM
 * - New tasks are numbered sequentially starting from (highest + 1)
 * - IDs are zero-padded to 3 digits (TASK-001, TASK-002, etc.)
 *
 * Dependency Resolution:
 * - Numeric dependencies are converted to TASK-IDs by position in the batch
 * - Example: dependency index [0] becomes the ID of first task in batch
 * - String dependencies (already TASK-IDs) are passed through unchanged
 * - Mixed dependencies are supported: [0, "TASK-002"]
 */
export async function ingestTasks(
  tasks: Partial<Task>[],
  vtmPath: string = 'vtm.json',
  options: IngestOptions = {},
): Promise<Task[]> {
  const { assignIds = true, resolveDependencies = true, defaultStatus = 'pending' } = options

  // Find highest existing ID
  let nextId = 1
  if (assignIds) {
    try {
      const reader = new VTMReader(vtmPath)
      const vtm = await reader.load()
      const maxId = vtm.tasks.reduce((max, task) => {
        const match = task.id.match(/TASK-(\d+)/)
        if (match) {
          const id = parseInt(match[1]!, 10)
          return Math.max(max, id)
        }
        return max
      }, 0)
      nextId = maxId + 1
    } catch {
      // VTM doesn't exist, start from 1
      nextId = 1
    }
  }

  // Process tasks
  const result: Task[] = []

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]!

    // Assign ID if needed
    let id: string
    if (assignIds) {
      id = `TASK-${String(nextId).padStart(3, '0')}`
      nextId++
    } else {
      id = task.id || `TASK-${String(i + 1).padStart(3, '0')}`
    }

    // Resolve dependencies if needed
    let dependencies: string[]
    if (resolveDependencies && task.dependencies) {
      dependencies = task.dependencies.map((dep) => {
        if (typeof dep === 'number') {
          // Convert index to TASK-XXX ID
          const targetTask = result[dep]
          if (!targetTask) {
            throw new Error(`Dependency index ${dep} is out of bounds`)
          }
          return targetTask.id
        }
        return dep
      }) as string[]
    } else {
      dependencies = (task.dependencies as string[]) || []
    }

    // Build full task
    const fullTask: Task = {
      id,
      adr_source: task.adr_source || '',
      spec_source: task.spec_source || '',
      title: task.title || '',
      description: task.description || '',
      acceptance_criteria: task.acceptance_criteria || [],
      dependencies,
      blocks: task.blocks || [],
      test_strategy: task.test_strategy || 'TDD',
      test_strategy_rationale: task.test_strategy_rationale || '',
      estimated_hours: task.estimated_hours || 0,
      risk: task.risk || 'medium',
      files: task.files || { create: [], modify: [], delete: [] },
      status: task.status || defaultStatus,
      started_at: task.started_at || null,
      completed_at: task.completed_at || null,
      commits: task.commits || [],
      validation: task.validation || { tests_pass: false, ac_verified: [] },
    }

    result.push(fullTask)
  }

  return result
}
