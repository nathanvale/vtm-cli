/**
 * VTM Writer Module
 *
 * Provides atomic write operations to VTM manifest files with automatic
 * statistics recalculation. The VTMWriter class uses write-to-temp-then-rename
 * pattern to ensure crash safety and consistent manifest state.
 *
 * @module vtm-writer
 */

import { writeFile, rename } from 'fs/promises'
import { resolve } from 'path'
import type { Task, TaskUpdate, VTMStats } from './types'
import { VTMReader } from './vtm-reader'

/**
 * Writes and updates VTM manifest files with atomic operations and automatic stats recalculation.
 *
 * The VTMWriter class provides the primary interface for modifying VTM task manifests.
 * It ensures data integrity through atomic writes (using temp-then-rename pattern) and
 * automatically maintains up-to-date manifest statistics after each modification. All
 * writes are crash-safe: failures never leave partial updates in the manifest file.
 *
 * @remarks
 * - Uses write-to-temp + rename for atomic filesystem operations (crash-safe)
 * - All write operations force-reload the manifest to detect external changes
 * - Statistics are automatically recalculated after every modification
 * - Supports both full task replacements and partial updates via TaskUpdate type
 * - Nested objects (files, validation) are deep-merged to preserve existing values
 * - Batch operations (appendTasks) are atomic; either all tasks are added or none
 *
 * @example
 * ```typescript
 * const writer = new VTMWriter('./vtm.json');
 *
 * // Update a single task's status
 * await writer.updateTask('TASK-001', { status: 'completed' });
 *
 * // Add new tasks in batch
 * const newTasks = [...]; // Array of Task objects
 * await writer.appendTasks(newTasks);
 * ```
 *
 * @see {@link VTMReader} for read operations
 */
export class VTMWriter {
  /**
   * Absolute path to the VTM file.
   * @internal
   */
  private vtmPath: string

  /**
   * Reader instance for loading current manifest state.
   * Used to force-reload before each write to detect external changes.
   * @internal
   */
  private reader: VTMReader

  /**
   * Creates a new VTMWriter instance.
   *
   * @param vtmPath - Path to the VTM file (defaults to 'vtm.json' in current working directory)
   *
   * @remarks
   * - Path is resolved to absolute path using current working directory
   * - A VTMReader instance is created internally for loading manifest state
   * - Use the same path as the corresponding VTMReader for consistency
   *
   * @example
   * ```typescript
   * const writer = new VTMWriter('./vtm.json');
   * const writer2 = new VTMWriter(); // Uses default 'vtm.json' in cwd
   * ```
   */
  constructor(vtmPath: string = 'vtm.json') {
    this.vtmPath = resolve(process.cwd(), vtmPath)
    this.reader = new VTMReader(vtmPath)
  }

  /**
   * Updates a single task in the manifest with optional partial updates.
   *
   * Loads the current manifest, finds the task by ID, applies updates (with deep merge
   * for nested objects), recalculates statistics, and atomically writes the updated
   * manifest back to disk. This ensures the manifest is never in an inconsistent state.
   *
   * @param taskId - The task ID to update (format: TASK-XXX)
   * @param updates - Partial task updates (will be merged with existing task data)
   * @returns Promise that resolves when the write is complete
   * @throws {Error} If the task ID is not found in the manifest
   * @throws {Error} If file I/O operations fail (e.g., permission denied)
   *
   * @remarks
   * - Updates are merged with existing task data, not replacing it entirely
   * - Nested objects (files, validation) use deep merge to preserve existing values
   * - Statistics are automatically recalculated after the update
   * - Force-reloads the manifest before writing to detect external changes
   * - The write operation is atomic; either all changes are persisted or none
   * - Multiple calls to updateTask are safe but not transactional (each has its own write)
   *
   * @example
   * ```typescript
   * // Update task status to completed
   * await writer.updateTask('TASK-001', { status: 'completed' });
   *
   * // Update multiple fields
   * await writer.updateTask('TASK-002', {
   *   status: 'in-progress',
   *   test_strategy: 'TDD',
   *   description: 'Updated description'
   * });
   *
   * // Add files to a task (deep merged)
   * await writer.updateTask('TASK-003', {
   *   files: {
   *     created: ['src/new-file.ts', 'src/new-file.test.ts']
   *   }
   * });
   * ```
   *
   * @see {@link VTMStats} for statistics that are auto-calculated
   * @see {@link TaskUpdate} for supported update fields
   * @see {@link appendTasks} for bulk task addition
   */
  async updateTask(taskId: string, updates: TaskUpdate): Promise<void> {
    const vtm = await this.reader.load(true) // Force reload

    const taskIndex = vtm.tasks.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) throw new Error(`Task ${taskId} not found`)

    const existingTask = vtm.tasks[taskIndex]!

    // Create updated task, excluding nested objects which need special handling
    const { files: _filesUpdate, validation: _validationUpdate, ...safeUpdates } = updates
    const updatedTask: Task = {
      ...existingTask,
      ...safeUpdates,
    }

    // Merge nested objects
    if (updates.validation) {
      updatedTask.validation = {
        ...existingTask.validation,
        ...updates.validation,
      }
    }

    if (updates.files?.created) {
      updatedTask.files = {
        ...existingTask.files,
        create: [...existingTask.files.create, ...updates.files.created],
      }
    }

    vtm.tasks[taskIndex] = updatedTask

    // Update stats
    vtm.stats = this.recalculateStats(vtm.tasks)

    // Atomic write
    await this.atomicWrite(this.vtmPath, JSON.stringify(vtm, null, 2))
  }

  /**
   * Appends new tasks to the manifest in a batch operation.
   *
   * Loads the current manifest, appends all new tasks, recalculates statistics,
   * and atomically writes the updated manifest. This is the primary interface for
   * bulk task ingestion (e.g., from ADR specifications).
   *
   * @param newTasks - Array of new Task objects to append to the manifest
   * @returns Promise that resolves when all tasks are written
   * @throws {Error} If file I/O operations fail (e.g., permission denied, disk full)
   *
   * @remarks
   * - Append operation is atomic; either all tasks are added or none
   * - Statistics are automatically recalculated after tasks are added
   * - Force-reloads the manifest before writing to detect external changes
   * - Task IDs should be pre-assigned before calling this method
   * - Dependencies should be validated before appending
   * - Empty array is safe (manifests unchanged but stats verified)
   * - Preserves task order from the input array
   *
   * @example
   * ```typescript
   * const newTasks = [
   *   {
   *     id: 'TASK-010',
   *     title: 'Implement feature',
   *     description: 'Feature implementation',
   *     acceptance_criteria: ['Criterion 1'],
   *     status: 'pending',
   *     test_strategy: 'TDD',
   *     dependencies: [],
   *     adr_source: 'ADR-001.md',
   *     created_at: new Date().toISOString(),
   *     files: { create: [] },
   *     validation: {}
   *   }
   * ];
   *
   * await writer.appendTasks(newTasks);
   * ```
   *
   * @see {@link updateTask} for updating existing tasks
   * @see {@link Task} for task structure requirements
   * @see {@link VTMStats} for auto-calculated statistics
   */
  async appendTasks(newTasks: Task[]): Promise<void> {
    const vtm = await this.reader.load(true)

    // Append new tasks
    vtm.tasks.push(...newTasks)

    // Update stats
    vtm.stats = this.recalculateStats(vtm.tasks)

    await this.atomicWrite(this.vtmPath, JSON.stringify(vtm, null, 2))
  }

  /**
   * Atomically writes content to the VTM file using temp-then-rename pattern.
   *
   * Ensures crash safety by writing to a temporary file first, then renaming it
   * to the target path. If any step fails (including the rename), the original
   * file remains unchanged. This pattern prevents partial writes or corrupted files.
   *
   * @param path - The target file path (should be the VTM manifest path)
   * @param content - The complete file content to write (as JSON string)
   * @returns Promise that resolves when the write and rename are complete
   * @throws {Error} If file I/O operations fail
   *
   * @remarks
   * - Uses atomic filesystem rename operation (POSIX compliant)
   * - Temporary file created with `.tmp` extension
   * - Original file is never truncated or modified until rename succeeds
   * - Crash-safe: failures leave original file intact
   * - Should not be called directly; use updateTask or appendTasks instead
   *
   * @internal
   *
   * @example
   * ```typescript
   * // This is called internally by updateTask and appendTasks
   * // Direct usage is not recommended
   * const jsonContent = JSON.stringify(vtm, null, 2);
   * await this.atomicWrite('/path/to/vtm.json', jsonContent);
   * ```
   */
  private async atomicWrite(path: string, content: string): Promise<void> {
    const temp = `${path}.tmp`
    await writeFile(temp, content, 'utf-8')
    await rename(temp, path)
  }

  /**
   * Recalculates VTM statistics based on current task list.
   *
   * Counts tasks in each status category and returns an updated statistics object.
   * Called automatically after every write operation to ensure manifest statistics
   * remain accurate. Useful for generating progress reports and workflow metrics.
   *
   * @param tasks - The current list of all tasks in the manifest
   * @returns VTMStats object with counts for each status category
   *
   * @remarks
   * - Counts tasks by exact status field value
   * - Four status categories: completed, in_progress, pending, blocked
   * - Run time: O(n) where n = number of tasks
   * - This method is called automatically; manual calls are rarely needed
   * - Statistics should always sum to total_tasks (validation check)
   * - Used by updateTask and appendTasks to maintain consistency
   *
   * @internal
   *
   * @example
   * ```typescript
   * // This is called internally after every write
   * const stats = this.recalculateStats(vtm.tasks);
   * // Returns: { total_tasks: 42, completed: 10, in_progress: 3, pending: 25, blocked: 4 }
   * ```
   *
   * @see {@link VTMStats} for statistics object structure
   */
  private recalculateStats(tasks: Task[]): VTMStats {
    return {
      total_tasks: tasks.length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      in_progress: tasks.filter((t) => t.status === 'in-progress').length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      blocked: tasks.filter((t) => t.status === 'blocked').length,
    }
  }
}
