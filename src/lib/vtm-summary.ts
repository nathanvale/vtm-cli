import * as fs from 'fs'
import type { VTM } from './types'

/**
 * Summary of incomplete tasks with completed capabilities.
 *
 * Represents a token-efficient snapshot of VTM state for passing to AI agents.
 * Includes only incomplete tasks (pending, in-progress, blocked) and a list of
 * completed work capabilities (just task titles). This structure enables agents
 * to understand what work remains and what has been accomplished, without
 * loading the full VTM manifest.
 *
 * @remarks
 * This type is designed for token efficiency:
 * - Only incomplete tasks are included (completed tasks filtered out)
 * - Task details are essential fields only (no extra metadata)
 * - Completed work is summarized as capability titles
 * - Typical size: 70% smaller than full VTM manifest
 *
 * @example
 * ```typescript
 * const summary: VTMSummary = {
 *   incomplete_tasks: [
 *     {
 *       id: 'TASK-001',
 *       title: 'Setup authentication',
 *       description: 'Implement OAuth2 flow...',
 *       status: 'pending',
 *       estimated_hours: 8,
 *       risk: 'high',
 *       test_strategy: 'TDD',
 *       dependencies: ['TASK-003']
 *     }
 *   ],
 *   completed_capabilities: [
 *     'Set up project structure',
 *     'Configure build system',
 *     'Add TypeScript'
 *   ]
 * }
 * ```
 *
 * @see {@link VTMSummarizer} for generating summaries
 * @see {@link IncompleteTask} for task structure
 */
export type VTMSummary = {
  /**
   * Array of incomplete tasks (pending, in-progress, blocked).
   * Excludes completed tasks to save token space.
   */
  incomplete_tasks: IncompleteTask[]

  /**
   * List of completed task titles representing accomplished capabilities.
   * Provides context for what work has been done without full task details.
   */
  completed_capabilities: string[]
}

/**
 * Simplified task structure for incomplete tasks in VTM summary.
 *
 * Represents an incomplete task with all essential information needed for
 * agent decision-making and context. Designed for token efficiency in AI
 * workflows. Dependencies field is optional and only included when the
 * task has blocking dependencies.
 *
 * @remarks
 * Field purposes:
 * - `id`: Unique identifier for task references
 * - `title`: One-line summary of work
 * - `description`: Detailed implementation requirements
 * - `status`: Current progress state (never completed)
 * - `estimated_hours`: Effort sizing for scheduling
 * - `risk`: Complexity/difficulty indicator
 * - `test_strategy`: How to validate completion
 * - `dependencies`: Optional blocking tasks (only if present)
 *
 * @example
 * ```typescript
 * const task: IncompleteTask = {
 *   id: 'TASK-042',
 *   title: 'Implement user profile page',
 *   description: 'Create profile UI component with user data fetching...',
 *   status: 'in-progress',
 *   estimated_hours: 5,
 *   risk: 'medium',
 *   test_strategy: 'TDD',
 *   dependencies: ['TASK-041']
 * }
 * ```
 *
 * @see {@link VTMSummary} for containing summary structure
 * @see {@link VTMSummarizer.generateSummary} to create summaries
 */
export type IncompleteTask = {
  /**
   * Unique task identifier in format TASK-XXX (e.g., "TASK-042").
   */
  id: string

  /**
   * Brief task title summarizing the work (max 80 characters).
   */
  title: string

  /**
   * Detailed description of what needs to be implemented.
   * Should be implementation-focused without referring to source documents.
   */
  description: string

  /**
   * Current task status (never 'completed').
   * - `pending`: Not started
   * - `in-progress`: Currently being worked on
   * - `blocked`: Waiting for dependencies
   */
  status: 'pending' | 'in-progress' | 'blocked'

  /**
   * Estimated effort in hours.
   * Used for work scheduling and planning.
   */
  estimated_hours: number

  /**
   * Risk/complexity level.
   * - `low`: Straightforward, low technical risk
   * - `medium`: Some complexity or uncertainty
   * - `high`: Complex or uncertain requirements
   */
  risk: 'low' | 'medium' | 'high'

  /**
   * Test strategy for validating completion.
   * - `TDD`: Test-Driven Development (write tests first)
   * - `Unit`: Unit tests after implementation
   * - `Integration`: Cross-component behavior testing
   * - `Direct`: Manual verification (setup/config)
   */
  test_strategy: 'TDD' | 'Unit' | 'Integration' | 'Direct'

  /**
   * Optional array of task IDs this task depends on.
   * Only included if task has dependencies.
   * Tasks in this list must be completed before work can begin.
   */
  dependencies?: string[]
}

/**
 * Generates token-efficient summaries of VTM state for AI agents.
 *
 * VTMSummarizer creates lightweight snapshots of VTM manifest content,
 * optimized for passing to AI agents during planning and decision-making.
 * By filtering to incomplete tasks only and summarizing completed work
 * as capabilities, the output is typically 70% smaller than the full VTM.
 *
 * This is essential for token-efficient workflows where you need agent
 * context without the overhead of loading entire task manifests.
 *
 * @remarks
 * Key characteristics:
 * - Only incomplete tasks are included (pending, in-progress, blocked)
 * - Completed tasks are summarized as capability titles only
 * - Dependencies are converted to string IDs for JSON serialization
 * - Typical token reduction: 70% compared to full VTM
 * - Useful for multi-step agent workflows (planning, extraction, etc.)
 *
 * Typical workflow:
 * 1. Create summarizer with path to vtm.json
 * 2. Call `generateSummary()` for typed summary object
 * 3. Pass to AI agent via `generateSummaryJSON()` for JSON string
 * 4. Agent uses summary for context-aware decision making
 *
 * @example
 * ```typescript
 * // Create summarizer and generate summary
 * const summarizer = new VTMSummarizer('vtm.json');
 * const summary = await summarizer.generateSummary();
 *
 * console.log('Incomplete tasks:', summary.incomplete_tasks.length);
 * console.log('Completed:', summary.completed_capabilities.length);
 *
 * // Get JSON for agent context
 * const json = summarizer.toJSON(summary);
 * // → Pass json to AI agent for decision-making
 * ```
 *
 * @see {@link VTMSummary} for summary type structure
 * @see {@link IncompleteTask} for incomplete task type
 */
export class VTMSummarizer {
  private vtmPath: string

  /**
   * Creates a new VTMSummarizer instance for a specific vtm.json file.
   *
   * Constructs a summarizer that will read and process the VTM manifest
   * at the specified path. The path should point to a valid vtm.json file.
   * For monorepos or custom layouts, you can specify a different path than
   * the default 'vtm.json' in the current directory.
   *
   * @param vtmPath - Path to the vtm.json file to summarize.
   *   Defaults to 'vtm.json' (in current working directory).
   *   Can be absolute or relative path.
   *
   * @remarks
   * - Path is stored but not validated until `generateSummary()` is called
   * - No file I/O occurs during construction
   * - File must be valid JSON with VTM structure
   * - Relative paths are resolved from process.cwd()
   *
   * @example
   * ```typescript
   * // Default path (vtm.json in current directory)
   * const summarizer1 = new VTMSummarizer();
   *
   * // Custom absolute path
   * const summarizer2 = new VTMSummarizer('/path/to/project/vtm.json');
   *
   * // Custom relative path
   * const summarizer3 = new VTMSummarizer('../other-project/vtm.json');
   * ```
   *
   * @see {@link generateSummary} to create the actual summary
   */
  constructor(vtmPath: string = 'vtm.json') {
    this.vtmPath = vtmPath
  }

  /**
   * Generates a token-efficient summary of incomplete tasks and completed capabilities.
   *
   * Reads the VTM manifest from disk, filters to incomplete tasks only,
   * and extracts completed work as capability titles. Returns a typed
   * summary object optimized for token efficiency (typically 70% smaller
   * than the full VTM manifest).
   *
   * Tasks are considered incomplete if their status is 'pending',
   * 'in-progress', or 'blocked'. Tasks with status 'completed' are
   * summarized as completed capabilities (titles only).
   *
   * @returns Promise resolving to a VTMSummary object containing incomplete
   *   tasks and completed capabilities.
   *
   * @throws {Error} If the VTM file cannot be read (file not found, permission
   *   denied, etc.).
   * @throws {SyntaxError} If the VTM file contains invalid JSON.
   *
   * @remarks
   * - File I/O is synchronous within the async function
   * - JSON parsing errors are not caught (will propagate)
   * - Dependencies are converted to string arrays for JSON serialization
   * - Empty dependencies arrays are omitted from IncompleteTask objects
   * - Task order is preserved from the VTM manifest
   *
   * @example
   * ```typescript
   * const summarizer = new VTMSummarizer('vtm.json');
   *
   * try {
   *   const summary = await summarizer.generateSummary();
   *   console.log('Remaining work:', summary.incomplete_tasks.length);
   *   console.log('Completed:', summary.completed_capabilities.length);
   * } catch (error) {
   *   console.error('Failed to generate summary:', error);
   * }
   * ```
   *
   * @see {@link VTMSummary} for the summary type structure
   * @see {@link generateSummaryJSON} for JSON string output
   * @see {@link toJSON} to format a summary as JSON
   */
  async generateSummary(): Promise<VTMSummary> {
    const content = fs.readFileSync(this.vtmPath, 'utf-8')
    const vtm: VTM = JSON.parse(content)

    // Filter to incomplete tasks (pending, in-progress, blocked)
    const incompleteTasks = vtm.tasks.filter(
      (task) =>
        task.status === 'pending' || task.status === 'in-progress' || task.status === 'blocked',
    )

    // Summarize completed tasks as capabilities (just titles)
    const completedCapabilities = vtm.tasks
      .filter((task) => task.status === 'completed')
      .map((task) => task.title)

    // Build incomplete_tasks summary
    const incompleteTasksSummary: IncompleteTask[] = incompleteTasks.map((task) => {
      const base = {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status as 'pending' | 'in-progress' | 'blocked',
        estimated_hours: task.estimated_hours,
        risk: task.risk,
        test_strategy: task.test_strategy,
      }
      // Only include dependencies if they exist
      return task.dependencies.length > 0
        ? { ...base, dependencies: task.dependencies.map(String) }
        : base
    })

    return {
      incomplete_tasks: incompleteTasksSummary,
      completed_capabilities: completedCapabilities,
    }
  }

  /**
   * Converts a VTM summary to a formatted JSON string.
   *
   * Serializes a VTMSummary object to JSON with 2-space indentation
   * for human readability. Useful for passing summary data to AI agents
   * or logging for debugging. Output is valid JSON suitable for parsing
   * or writing to files.
   *
   * @param summary - The VTMSummary object to convert to JSON.
   *
   * @returns A formatted JSON string with 2-space indentation.
   *   String is valid JSON that can be parsed back to VTMSummary.
   *
   * @remarks
   * - Uses 2-space indentation for readability
   * - Serialization is synchronous
   * - No validation of summary structure (assumes well-formed input)
   * - Suitable for writing to files or logging
   * - All data types serialize to valid JSON
   *
   * @example
   * ```typescript
   * const summarizer = new VTMSummarizer('vtm.json');
   * const summary = await summarizer.generateSummary();
   *
   * const json = summarizer.toJSON(summary);
   * console.log(json);
   * // Output:
   * // {
   * //   "incomplete_tasks": [...],
   * //   "completed_capabilities": [...]
   * // }
   *
   * // Write to file
   * fs.writeFileSync('summary.json', json);
   *
   * // Parse back
   * const parsed = JSON.parse(json) as VTMSummary;
   * ```
   *
   * @see {@link generateSummary} to create summary object
   * @see {@link generateSummaryJSON} for combined generation and conversion
   */
  toJSON(summary: VTMSummary): string {
    return JSON.stringify(summary, null, 2)
  }

  /**
   * Generates a summary and returns it as a formatted JSON string.
   *
   * Convenience method combining {@link generateSummary} and {@link toJSON}.
   * Reads the VTM manifest, filters to incomplete tasks, and returns the
   * result as a formatted JSON string in one operation. Useful for workflows
   * where you need JSON output for agents or external systems.
   *
   * @returns Promise resolving to a formatted JSON string containing the
   *   VTM summary with incomplete tasks and completed capabilities.
   *
   * @throws {Error} If the VTM file cannot be read (file not found, permission
   *   denied, etc.).
   * @throws {SyntaxError} If the VTM file contains invalid JSON.
   *
   * @remarks
   * - Combines file reading, filtering, and JSON serialization
   * - More convenient than calling `generateSummary()` then `toJSON()`
   * - Output is identical to `toJSON(await generateSummary())`
   * - Returns formatted JSON with 2-space indentation
   *
   * @example
   * ```typescript
   * const summarizer = new VTMSummarizer('vtm.json');
   *
   * try {
   *   const json = await summarizer.generateSummaryJSON();
   *
   *   // Use with AI agent
   *   const agentContext = {
   *     vtm_state: json,
   *     timestamp: new Date().toISOString()
   *   };
   *
   *   // Or write to file
   *   fs.writeFileSync('vtm-summary.json', json);
   * } catch (error) {
   *   console.error('Failed to generate summary:', error);
   * }
   * ```
   *
   * @see {@link generateSummary} for typed summary object
   * @see {@link toJSON} to format an existing summary as JSON
   */
  async generateSummaryJSON(): Promise<string> {
    const summary = await this.generateSummary()
    return this.toJSON(summary)
  }
}
