// src/lib/task-ingest-helper.ts

import { VTMReader } from './vtm-reader'
import type { Task } from './types'

export type IngestOptions = {
  assignIds?: boolean // Default true
  resolveDependencies?: boolean // Default true
  defaultStatus?: Task['status'] // Default 'pending'
}

/**
 * Ingest tasks with automatic ID assignment and dependency resolution.
 *
 * @param tasks - Array of partial tasks to ingest
 * @param vtmPath - Path to VTM file (default: 'vtm.json')
 * @param options - Ingest options
 * @returns Array of fully formed tasks with IDs assigned and dependencies resolved
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
