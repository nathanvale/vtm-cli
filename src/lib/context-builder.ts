// src/lib/context-builder.ts

import { VTMReader } from './vtm-reader'

/**
 * Builds task context for Claude Code execution.
 *
 * Generates minimal or compact context from VTM tasks, optimized for token
 * efficiency. Context includes task details, dependencies, acceptance criteria,
 * and source document references in markdown or compact formats.
 *
 * @remarks
 * The ContextBuilder uses two distinct strategies for context generation:
 * - **Minimal context** (~2000 tokens): Full markdown format with comprehensive
 *   task details, dependencies, files, and source document references
 * - **Compact context** (~500 tokens): Ultra-minimal single-line format with
 *   only essential information for budget-constrained scenarios
 *
 * The builder internally uses VTMReader to load and resolve task dependencies,
 * handling blocked tasks automatically.
 *
 * @example
 * ```typescript
 * const builder = new ContextBuilder();
 * const minimalContext = await builder.buildMinimalContext('TASK-001');
 * console.log(minimalContext); // Markdown-formatted task details
 *
 * const compactContext = await builder.buildCompactContext('TASK-001');
 * console.log(compactContext); // Single-line compact format
 * ```
 *
 * @see {@link VTMReader} for task loading and dependency resolution
 */
export class ContextBuilder {
  private reader: VTMReader

  /**
   * Creates a new ContextBuilder instance.
   *
   * Initializes the internal VTMReader for task loading and context generation.
   *
   * @param vtmPath - Optional path to the vtm.json file. If not provided,
   *   defaults to looking for vtm.json in the current working directory.
   *
   * @example
   * ```typescript
   * // Use default vtm.json in current directory
   * const builder = new ContextBuilder();
   *
   * // Use custom vtm.json path
   * const builder = new ContextBuilder('/path/to/custom-vtm.json');
   * ```
   */
  constructor(vtmPath?: string) {
    this.reader = new VTMReader(vtmPath)
  }

  /**
   * Generates minimal context for a task (~2000 tokens).
   *
   * Produces comprehensive task context in markdown format, including full task
   * details, acceptance criteria, all dependencies with their created files,
   * files to create/modify/delete, source document references, test strategy
   * rationale, and any tasks blocked by this task.
   *
   * Use this format when you need complete task information for implementation.
   *
   * @param taskId - The task ID in format TASK-XXX (e.g., "TASK-001")
   * @returns Promise resolving to markdown-formatted task context string with
   *   comprehensive task information suitable for Claude Code implementation
   * @throws {Error} If the task ID is not found in the VTM manifest
   * @throws {SyntaxError} If the vtm.json file contains invalid JSON
   * @throws {Error} If the vtm.json file does not exist
   *
   * @example
   * ```typescript
   * const builder = new ContextBuilder();
   * const context = await builder.buildMinimalContext('TASK-001');
   * console.log(context);
   * // Output:
   * // # Task Context: TASK-001
   * // ## Task Details
   * // **Title**: Implement user authentication
   * // **Status**: pending
   * // **Test Strategy**: TDD
   * // **Risk**: high
   * // **Estimated**: 8h
   * // ...
   * ```
   *
   * @remarks
   * The minimal context includes:
   * - Task metadata (ID, title, status, test strategy, risk, estimated hours)
   * - Full task description
   * - All acceptance criteria (numbered AC1, AC2, etc.)
   * - All completed dependencies with their created files
   * - Files to create, modify, or delete
   * - Source document references (ADR and Spec)
   * - Test strategy rationale
   * - Tasks blocked by this task (if any)
   *
   * This format is optimal when you have token budget available and need complete
   * context. For token-constrained scenarios, use buildCompactContext() instead.
   *
   * @see {@link buildCompactContext} for ultra-minimal format (~500 tokens)
   * @see {@link VTMReader.getTaskWithContext} for the underlying data loading
   */
  async buildMinimalContext(taskId: string): Promise<string> {
    const { task, dependencies, blockedTasks } = await this.reader.getTaskWithContext(taskId)

    let context = `# Task Context: ${task.id}\n\n`

    context += `## Task Details\n`
    context += `**Title**: ${task.title}\n`
    context += `**Status**: ${task.status}\n`
    context += `**Test Strategy**: ${task.test_strategy}\n`
    context += `**Risk**: ${task.risk}\n`
    context += `**Estimated**: ${task.estimated_hours}h\n\n`

    context += `**Description**:\n${task.description}\n\n`

    context += `## Acceptance Criteria\n`
    task.acceptance_criteria.forEach((ac, i) => {
      context += `- AC${i + 1}: ${ac}\n`
    })

    if (dependencies.length > 0) {
      context += `\n## Dependencies (${dependencies.length} completed)\n`
      dependencies.forEach((dep) => {
        context += `✅ ${dep.id}: ${dep.title}\n`
        if (dep.files?.create?.length) {
          context += `   Files created: ${dep.files.create.join(', ')}\n`
        }
      })
    }

    context += `\n## Files to Create\n`
    if (task.files.create.length === 0) {
      context += `- (none)\n`
    } else {
      task.files.create.forEach((f) => (context += `- ${f}\n`))
    }

    if (task.files.modify.length > 0) {
      context += `\n## Files to Modify\n`
      task.files.modify.forEach((f) => (context += `- ${f}\n`))
    }

    if (task.files.delete.length > 0) {
      context += `\n## Files to Delete\n`
      task.files.delete.forEach((f) => (context += `- ${f}\n`))
    }

    context += `\n## Source Documents\n`
    context += `- ADR: ${task.adr_source}\n`
    context += `- Spec: ${task.spec_source}\n`

    context += `\n## Test Strategy Rationale\n`
    context += `${task.test_strategy_rationale}\n`

    if (blockedTasks.length > 0) {
      context += `\n## Tasks Blocked by This\n`
      blockedTasks.forEach((t) => {
        context += `- ${t.id}: ${t.title}\n`
      })
    }

    return context
  }

  /**
   * Generates compact context for a task (~500 tokens).
   *
   * Produces ultra-minimal single-line context with only essential task
   * information: task ID, title, test strategy, acceptance criteria, and
   * files to create. Perfect for token-constrained scenarios or bulk operations.
   *
   * Use this format when you have limited token budget or need quick task
   * reference without comprehensive details.
   *
   * @param taskId - The task ID in format TASK-XXX (e.g., "TASK-001")
   * @returns Promise resolving to compact single-line context string with
   *   essential task information suitable for constrained token budgets
   * @throws {Error} If the task ID is not found in the VTM manifest
   * @throws {SyntaxError} If the vtm.json file contains invalid JSON
   * @throws {Error} If the vtm.json file does not exist
   *
   * @example
   * ```typescript
   * const builder = new ContextBuilder();
   * const context = await builder.buildCompactContext('TASK-001');
   * console.log(context);
   * // Output:
   * // Task TASK-001: Implement user authentication
   * // Test: TDD
   * // ACs: User can log in with email | Invalid credentials show error | Session persists
   * // Files: src/auth/login.ts, src/auth/session.ts
   * ```
   *
   * @remarks
   * The compact context includes only:
   * - Task ID and title
   * - Test strategy
   * - All acceptance criteria (pipe-separated on single line)
   * - Files to create (comma-separated)
   *
   * This format is optimal when token budget is severely constrained (e.g., in
   * bulk operations or when combining multiple task contexts). For comprehensive
   * task information, use buildMinimalContext() instead.
   *
   * The compact format trades detail for efficiency, so it's best used when the
   * full task context is already known or when implementing simple tasks that
   * don't require detailed dependency information.
   *
   * @see {@link buildMinimalContext} for comprehensive format (~2000 tokens)
   * @see {@link VTMReader.getTaskWithContext} for the underlying data loading
   */
  async buildCompactContext(taskId: string): Promise<string> {
    const { task } = await this.reader.getTaskWithContext(taskId)

    return `Task ${task.id}: ${task.title}
Test: ${task.test_strategy}
ACs: ${task.acceptance_criteria.join(' | ')}
Files: ${task.files.create.join(', ')}`
  }
}
