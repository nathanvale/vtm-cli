/**
 * VTM Reader Module
 *
 * Provides read-only access to VTM manifest files with intelligent caching,
 * task filtering, and dependency resolution. The VTMReader class is the primary
 * interface for querying VTM data and supports zero-copy context generation.
 *
 * @module vtm-reader
 */

import { readFile, stat } from 'fs/promises'
import type { VTM, Task, TaskContext } from './types'
import { resolve } from 'path'

/**
 * Reads and queries VTM manifest files with automatic caching and dependency resolution.
 *
 * The VTMReader class provides read-only access to VTM tasks, managing file I/O,
 * parsing, and caching internally. It uses modification timestamps to detect when
 * the VTM file has changed, avoiding redundant disk reads. All filtering and
 * resolution operations are performed in-memory after a single load.
 *
 * @remarks
 * - File caching is automatic and cache-invalidation uses modification timestamps
 * - Use `load(true)` to force a reload if the file may have changed externally
 * - Dependency filtering assumes all task IDs are valid (run validation separately)
 * - All methods are async to support file I/O operations
 * - The cache is instance-specific; create new instances for separate file contexts
 *
 * @example
 * ```typescript
 * const reader = new VTMReader('./vtm.json');
 * const allTasks = await reader.load();
 * const readyTasks = await reader.getReadyTasks();
 * const taskWithDeps = await reader.getTaskWithContext('TASK-001');
 * ```
 */
export class VTMReader {
  /**
   * Cached VTM data loaded from file.
   * @internal
   */
  private vtm: VTM | null = null

  /**
   * Timestamp of last file modification (milliseconds since epoch).
   * Used for cache invalidation.
   * @internal
   */
  private lastModified: number = 0

  /**
   * Absolute path to the VTM file.
   * @internal
   */
  private vtmPath: string

  /**
   * Creates a new VTMReader instance.
   *
   * @param vtmPath - Path to the VTM file (defaults to 'vtm.json' in current working directory)
   *
   * @example
   * ```typescript
   * const reader = new VTMReader('./vtm.json');
   * const reader2 = new VTMReader(); // Uses default 'vtm.json' in cwd
   * ```
   */
  constructor(vtmPath: string = 'vtm.json') {
    this.vtmPath = resolve(process.cwd(), vtmPath)
  }

  /**
   * Loads the VTM manifest from disk with automatic caching.
   *
   * Reads the VTM file from disk, parses JSON, and caches the result. Subsequent
   * calls return cached data unless the file has been modified (detected via mtime)
   * or `force` is true. This minimizes disk I/O for repeated access patterns.
   *
   * @param force - If true, bypass cache and reload from disk (default: false)
   * @returns The complete VTM manifest object
   * @throws {Error} If the VTM file does not exist at the configured path
   * @throws {SyntaxError} If the VTM file contains invalid JSON
   *
   * @remarks
   * - Cache validation uses file modification time (mtime) comparison
   * - Force reload with `load(true)` if external processes may have changed the file
   * - The returned object is parsed but not deeply cloned; modifications will affect the cache
   * - File not found errors suggest running 'vtm init' to create the manifest
   *
   * @example
   * ```typescript
   * const reader = new VTMReader();
   * const vtm = await reader.load();
   * console.log(vtm.stats.total_tasks); // 42
   *
   * // Later, force a reload from disk
   * const fresh = await reader.load(true);
   * ```
   *
   * @see {@link getTask} for querying individual tasks
   * @see {@link getReadyTasks} for filtering tasks by readiness
   */
  async load(force = false): Promise<VTM> {
    try {
      const stats = await stat(this.vtmPath)

      if (!force && this.vtm && stats.mtimeMs === this.lastModified) {
        return this.vtm
      }

      const content = await readFile(this.vtmPath, 'utf-8')
      this.vtm = JSON.parse(content) as VTM
      this.lastModified = stats.mtimeMs
      return this.vtm as VTM
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`VTM file not found at ${this.vtmPath}. Run 'vtm init' to create one.`)
      }
      throw error
    }
  }

  /**
   * Retrieves a task by its ID.
   *
   * Searches the loaded VTM manifest for a task matching the provided ID.
   * Returns the first matching task or null if not found. Uses linear search,
   * which is efficient for typical VTM sizes (< 1000 tasks).
   *
   * @param id - The task ID in format TASK-XXX (e.g., "TASK-001")
   * @returns The task object if found, or null if not found
   *
   * @remarks
   * - Returns null instead of throwing for missing tasks (nullable pattern)
   * - Task IDs are case-sensitive and must match exactly
   * - Triggers automatic cache validation/reload via internal `load()` call
   * - Linear search performance: O(n) where n = number of tasks
   *
   * @example
   * ```typescript
   * const task = await reader.getTask('TASK-001');
   * if (task) {
   *   console.log(task.title);
   * }
   * ```
   *
   * @see {@link getTaskWithContext} for task with resolved dependencies
   */
  async getTask(id: string): Promise<Task | null> {
    const vtm = await this.load()
    return vtm.tasks.find((t) => t.id === id) || null
  }

  /**
   * Retrieves all tasks ready for work (pending with satisfied dependencies).
   *
   * Filters tasks to those with status 'pending' whose dependencies have all been
   * completed. These are the "next up" tasks that can begin immediately. Useful
   * for workflow planning and task prioritization.
   *
   * @returns Array of ready tasks (may be empty if no tasks are available)
   *
   * @remarks
   * - "Ready" means: status === 'pending' AND all dependencies are completed
   * - Returns empty array if all pending tasks have unsatisfied dependencies
   * - Task ordering follows source file order
   * - Dependencies are validated using exact ID string matching
   * - Does not modify any state; safe to call repeatedly
   *
   * @example
   * ```typescript
   * const ready = await reader.getReadyTasks();
   * if (ready.length > 0) {
   *   console.log(`Start with: ${ready[0].id} - ${ready[0].title}`);
   * } else {
   *   console.log('All pending tasks have unmet dependencies');
   * }
   * ```
   *
   * @see {@link getBlockedTasks} for tasks blocked by unsatisfied dependencies
   * @see {@link getInProgressTasks} for currently active tasks
   */
  async getReadyTasks(): Promise<Task[]> {
    const vtm = await this.load()
    const completed = new Set(vtm.tasks.filter((t) => t.status === 'completed').map((t) => t.id))

    return vtm.tasks.filter((task) => {
      if (task.status !== 'pending') return false
      return task.dependencies.every((dep) => completed.has(String(dep)))
    })
  }

  /**
   * Retrieves a task with its resolved dependencies and blocking relationships.
   *
   * Loads a task and fully resolves its dependency graph, including both upstream
   * dependencies (tasks this task depends on) and downstream blocked tasks (tasks
   * depending on this one). Returns a comprehensive context object suitable for
   * task presentation and workflow analysis.
   *
   * @param id - The task ID in format TASK-XXX (e.g., "TASK-001")
   * @returns TaskContext with task, resolved dependencies, and blocked tasks
   * @throws {Error} If the task ID is not found in the manifest
   *
   * @remarks
   * - Throws on not found (vs. getTask which returns null)
   * - Dependencies are resolved to full Task objects via ID lookup
   * - Blocked tasks are those with status 'pending' that directly depend on this task
   * - Returns empty arrays if task has no dependencies or blocking relationships
   * - Useful for understanding task position in the dependency graph
   *
   * @example
   * ```typescript
   * const context = await reader.getTaskWithContext('TASK-001');
   * console.log(`Task: ${context.task.title}`);
   * console.log(`Depends on: ${context.dependencies.map(d => d.id).join(', ')}`);
   * console.log(`Blocks: ${context.blockedTasks.map(b => b.id).join(', ')}`);
   * ```
   *
   * @see {@link getTask} for simple task lookup without context
   * @see {@link TaskContext} for context object structure
   */
  async getTaskWithContext(id: string): Promise<TaskContext> {
    const vtm = await this.load()
    const task = await this.getTask(id)
    if (!task) throw new Error(`Task ${id} not found`)

    const deps = task.dependencies
      .map((depId) => vtm.tasks.find((t) => t.id === depId))
      .filter((t): t is Task => t !== undefined)

    const blockedTasks = vtm.tasks.filter(
      (t) => t.dependencies.includes(id) && t.status === 'pending',
    )

    return { task, dependencies: deps, blockedTasks }
  }

  /**
   * Retrieves aggregated statistics grouped by ADR source document.
   *
   * Calculates task count and completion rate for each unique ADR source in the
   * manifest. Useful for understanding feature implementation progress and which
   * architectural decisions have complete implementations.
   *
   * @returns Object mapping ADR file names to {total, completed} counts
   *
   * @remarks
   * - Groups tasks by exact adr_source field value
   * - Counts tasks with status === 'completed' for completion statistics
   * - Returns empty object if no tasks have adr_source values
   * - Useful for progress dashboards and feature-level reporting
   * - Run time: O(n) where n = number of tasks
   *
   * @example
   * ```typescript
   * const stats = await reader.getStatsByADR();
   * for (const [adr, counts] of Object.entries(stats)) {
   *   const percent = Math.round((counts.completed / counts.total) * 100);
   *   console.log(`${adr}: ${counts.completed}/${counts.total} (${percent}%)`);
   * }
   * // Output:
   * // ADR-001-auth.md: 3/5 (60%)
   * // ADR-002-cache.md: 2/2 (100%)
   * ```
   *
   * @see {@link Task.adr_source} for ADR source field definition
   */
  async getStatsByADR(): Promise<Record<string, { total: number; completed: number }>> {
    const vtm = await this.load()
    const stats: Record<string, { total: number; completed: number }> = {}

    vtm.tasks.forEach((task) => {
      if (!stats[task.adr_source]) {
        stats[task.adr_source] = { total: 0, completed: 0 }
      }
      const adrStats = stats[task.adr_source]!
      adrStats.total++
      if (task.status === 'completed') {
        adrStats.completed++
      }
    })

    return stats
  }

  /**
   * Retrieves all tasks with blocked status.
   *
   * Returns all tasks currently in 'blocked' status, indicating they cannot
   * proceed due to unsatisfied dependencies or external blockers. Useful for
   * identifying bottlenecks and dependency issues.
   *
   * @returns Array of blocked tasks (may be empty)
   *
   * @remarks
   * - Returns tasks where status === 'blocked' (regardless of dependencies)
   * - Does not perform dependency validation; checks status field only
   * - Tasks may be blocked due to external reasons, not just unmet dependencies
   * - Use with getReadyTasks to understand workflow state
   * - Does not modify any state; safe to call repeatedly
   *
   * @example
   * ```typescript
   * const blocked = await reader.getBlockedTasks();
   * if (blocked.length > 0) {
   *   console.log(`${blocked.length} tasks are blocked`);
   *   blocked.forEach(t => console.log(`- ${t.id}: ${t.title}`));
   * }
   * ```
   *
   * @see {@link getReadyTasks} for unblocked pending tasks
   * @see {@link getInProgressTasks} for active tasks
   */
  async getBlockedTasks(): Promise<Task[]> {
    const vtm = await this.load()
    return vtm.tasks.filter((t) => t.status === 'blocked')
  }

  /**
   * Retrieves all tasks currently in progress.
   *
   * Returns all tasks with status 'in-progress', representing work currently
   * being performed. Useful for workflow status reporting and parallel work
   * tracking.
   *
   * @returns Array of in-progress tasks (may be empty)
   *
   * @remarks
   * - Returns tasks where status === 'in-progress'
   * - Does not validate completion percentage or actual progress
   * - Multiple tasks can be in-progress simultaneously
   * - Use with getReadyTasks and getBlockedTasks for complete workflow view
   * - Does not modify any state; safe to call repeatedly
   *
   * @example
   * ```typescript
   * const inProgress = await reader.getInProgressTasks();
   * console.log(`${inProgress.length} tasks in progress:`);
   * inProgress.forEach(t => {
   *   console.log(`- [${t.test_strategy}] ${t.id}: ${t.title}`);
   * });
   * ```
   *
   * @see {@link getReadyTasks} for next available tasks
   * @see {@link getBlockedTasks} for blocked tasks
   * @see {@link getTask} for individual task lookup
   */
  async getInProgressTasks(): Promise<Task[]> {
    const vtm = await this.load()
    return vtm.tasks.filter((t) => t.status === 'in-progress')
  }
}
