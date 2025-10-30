/**
 * InstructionBuilder generates detailed, prescriptive instructions for task execution.
 *
 * Unlike ContextBuilder (which provides descriptive information about WHAT to build),
 * InstructionBuilder provides prescriptive guidance on HOW to build it, including:
 * - Coding standards (JSDoc, TypeScript, linting)
 * - Test-Driven Development workflows (Red-Green-Refactor with Wallaby MCP)
 * - Pre-flight and post-flight checklists
 * - Validation requirements
 * - Step-by-step implementation workflows
 *
 * Instructions are loaded from markdown templates in `.claude/vtm/instruction-templates/`
 * and customized per task using variable interpolation.
 *
 * @example Basic Usage
 * ```typescript
 * const builder = new InstructionBuilder();
 * const instructions = await builder.buildInstructions('TASK-042');
 * console.log(instructions); // Full markdown instructions for TDD task
 * ```
 *
 * @example Custom Template Path
 * ```typescript
 * const builder = new InstructionBuilder({
 *   templatePath: '.claude/vtm/instruction-templates',
 *   vtmPath: './custom-vtm.json'
 * });
 * ```
 *
 * @example With VTMReader Instance
 * ```typescript
 * const reader = new VTMReader('./vtm.json');
 * const builder = new InstructionBuilder({ reader });
 * const instructions = await builder.buildInstructions('TASK-042');
 * ```
 *
 * @remarks
 * Template Selection:
 * - TDD tasks → `tdd.md` (Wallaby MCP mandatory, 100% JSDoc, ≥80% coverage)
 * - Unit tasks → `unit.md` (Tests after implementation, 90% JSDoc, ≥70% coverage)
 * - Integration tasks → `integration.md` (End-to-end testing, 80% JSDoc, ≥60% coverage)
 * - Direct tasks → `direct.md` (Manual verification, 50% JSDoc, no coverage requirement)
 *
 * @remarks
 * Instructions vs Context:
 * - Context: Descriptive, ~2000 tokens, "This task implements authentication"
 * - Instructions: Prescriptive, ~5000 tokens, "Write JSDoc for all functions, follow TDD"
 */

import { readFile } from 'fs/promises'
import { resolve, join } from 'path'
import { VTMReader } from './vtm-reader'
import type { Task, TaskWithDependencies } from './types'

/**
 * Configuration options for InstructionBuilder.
 */
export type InstructionBuilderOptions = {
  /**
   * Path to instruction templates directory.
   *
   * @default '.claude/vtm/instruction-templates'
   *
   * @remarks
   * Templates should be markdown files named by test strategy:
   * - tdd.md
   * - unit.md
   * - integration.md
   * - direct.md
   */
  templatePath?: string

  /**
   * Path to vtm.json file.
   *
   * @default 'vtm.json' (in current working directory)
   */
  vtmPath?: string

  /**
   * Optional VTMReader instance to use for loading tasks.
   *
   * If not provided, a new VTMReader will be created using vtmPath.
   *
   * @remarks
   * Providing a VTMReader allows sharing a single reader instance
   * across multiple builders, reducing file I/O.
   */
  reader?: VTMReader
}

/**
 * Maps test strategy to instruction template filename.
 *
 * @internal
 */
const TEMPLATE_MAP: Record<Task['test_strategy'], string> = {
  TDD: 'tdd.md',
  Unit: 'unit.md',
  Integration: 'integration.md',
  Direct: 'direct.md',
}

/**
 * Builds detailed, prescriptive instructions for VTM task execution.
 *
 * Loads markdown templates from `.claude/vtm/instruction-templates/`
 * and interpolates task-specific data using JavaScript template literals.
 *
 * @remarks
 * The InstructionBuilder supports two primary use cases:
 * 1. Manual review: Generate instructions for user to review before implementing
 * 2. Agent execution: Generate instructions for autonomous agent execution
 *
 * @example Instruction Generation Flow
 * ```
 * Task (vtm.json)
 *   ↓
 * InstructionBuilder.buildInstructions(taskId)
 *   ↓
 * Load template based on test_strategy
 *   ↓
 * Interpolate task data (${task.id}, ${task.title}, etc.)
 *   ↓
 * Return formatted markdown instructions (~5000 tokens)
 * ```
 */
export class InstructionBuilder {
  private reader: VTMReader
  private templatePath: string

  /**
   * Creates a new InstructionBuilder.
   *
   * @param options - Configuration options
   *
   * @example Default Configuration
   * ```typescript
   * const builder = new InstructionBuilder();
   * // Uses: .claude/vtm/instruction-templates/ and ./vtm.json
   * ```
   *
   * @example Custom Paths
   * ```typescript
   * const builder = new InstructionBuilder({
   *   templatePath: '.claude/custom-templates',
   *   vtmPath: './project/vtm.json'
   * });
   * ```
   *
   * @example Shared Reader
   * ```typescript
   * const reader = new VTMReader('./vtm.json');
   * const contextBuilder = new ContextBuilder({ reader });
   * const instructionBuilder = new InstructionBuilder({ reader });
   * // Both builders share the same reader instance
   * ```
   */
  constructor(options: InstructionBuilderOptions = {}) {
    this.reader = options.reader || new VTMReader(options.vtmPath)
    this.templatePath = resolve(
      process.cwd(),
      options.templatePath || '.claude/vtm/instruction-templates',
    )
  }

  /**
   * Generates detailed instructions for a task.
   *
   * Loads the appropriate template based on the task's test_strategy,
   * interpolates task-specific data, and returns formatted markdown
   * instructions ready for review or agent execution.
   *
   * @param taskId - The task ID in format TASK-XXX (e.g., "TASK-042")
   * @returns Markdown-formatted instruction document
   * @throws {Error} If task is not found
   * @throws {Error} If template file cannot be read
   *
   * @example Generate Instructions
   * ```typescript
   * const builder = new InstructionBuilder();
   * const instructions = await builder.buildInstructions('TASK-042');
   *
   * // instructions contains:
   * // - Task objective and acceptance criteria
   * // - Test strategy-specific workflow (TDD/Unit/Integration/Direct)
   * // - Coding standards (JSDoc, TypeScript, linting)
   * // - Pre-flight and post-flight checklists
   * // - Validation requirements
   * // - Step-by-step implementation workflow
   * ```
   *
   * @example Error Handling
   * ```typescript
   * try {
   *   const instructions = await builder.buildInstructions('TASK-999');
   * } catch (error) {
   *   console.error('Failed to build instructions:', error.message);
   *   // Error: Task TASK-999 not found
   * }
   * ```
   *
   * @remarks
   * Token Usage:
   * - TDD template: ~5000 tokens (most comprehensive)
   * - Unit template: ~4000 tokens
   * - Integration template: ~4500 tokens
   * - Direct template: ~3000 tokens (least comprehensive)
   *
   * @remarks
   * Performance:
   * - First call: Loads template from disk (~10ms)
   * - Subsequent calls: Could be cached but currently re-reads (future optimization)
   *
   * @see {@link buildInstructionsWithContext} for version that accepts TaskWithDependencies
   */
  async buildInstructions(taskId: string): Promise<string> {
    const taskWithContext = await this.reader.getTaskWithContext(taskId)
    return this.buildInstructionsWithContext(taskWithContext)
  }

  /**
   * Generates instructions from a TaskWithDependencies object.
   *
   * This method is useful when you already have a TaskWithDependencies
   * object (from VTMReader.getTaskWithContext) and want to avoid
   * redundant file I/O.
   *
   * @param taskWithContext - Task with resolved dependencies and blocked tasks
   * @returns Markdown-formatted instruction document
   * @throws {Error} If template file cannot be read
   *
   * @example Use Existing Task Context
   * ```typescript
   * const reader = new VTMReader();
   * const taskContext = await reader.getTaskWithContext('TASK-042');
   *
   * const builder = new InstructionBuilder({ reader });
   * const instructions = await builder.buildInstructionsWithContext(taskContext);
   * ```
   *
   * @example Batch Instruction Generation
   * ```typescript
   * const reader = new VTMReader();
   * const builder = new InstructionBuilder({ reader });
   *
   * const taskIds = ['TASK-001', 'TASK-002', 'TASK-003'];
   * const instructionPromises = taskIds.map(async (id) => {
   *   const context = await reader.getTaskWithContext(id);
   *   return builder.buildInstructionsWithContext(context);
   * });
   *
   * const allInstructions = await Promise.all(instructionPromises);
   * ```
   *
   * @remarks
   * This method is the core instruction generation logic. The public
   * buildInstructions() method is a convenience wrapper that loads
   * the task context first.
   */
  async buildInstructionsWithContext(taskWithContext: TaskWithDependencies): Promise<string> {
    const { task, dependencies, blockedTasks } = taskWithContext

    // Load template based on test strategy
    const template = await this.loadTemplate(task.test_strategy)

    // Prepare interpolation context
    const context = this.prepareInterpolationContext(task, dependencies, blockedTasks)

    // Interpolate template with context
    return this.interpolateTemplate(template, context)
  }

  /**
   * Loads the instruction template for a given test strategy.
   *
   * @param strategy - The test strategy (TDD, Unit, Integration, Direct)
   * @returns Template content as string
   * @throws {Error} If template file does not exist or cannot be read
   *
   * @internal
   *
   * @remarks
   * Template files are located at:
   * - `.claude/vtm/instruction-templates/tdd.md`
   * - `.claude/vtm/instruction-templates/unit.md`
   * - `.claude/vtm/instruction-templates/integration.md`
   * - `.claude/vtm/instruction-templates/direct.md`
   */
  private async loadTemplate(strategy: Task['test_strategy']): Promise<string> {
    const filename = TEMPLATE_MAP[strategy]
    const templateFilePath = join(this.templatePath, filename)

    try {
      return await readFile(templateFilePath, 'utf-8')
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(
          `Template not found: ${templateFilePath}. ` +
            `Ensure instruction templates exist in ${this.templatePath}`,
        )
      }
      throw new Error(`Failed to load template ${filename}: ${(error as Error).message}`)
    }
  }

  /**
   * Prepares the interpolation context for template variables.
   *
   * Formats task data into template variables that can be interpolated
   * into the instruction markdown. Arrays are formatted as markdown lists.
   *
   * @param task - The task to generate instructions for
   * @param dependencies - Resolved dependency tasks
   * @param blockedTasks - Tasks blocked by this task
   * @returns Object with formatted template variables
   *
   * @internal
   *
   * @remarks
   * Template Variables:
   * - `${task.id}` - Task ID (e.g., "TASK-042")
   * - `${task.title}` - Task title
   * - `${task.description}` - Task description
   * - `${acceptanceCriteriaList}` - Formatted acceptance criteria as markdown checklist
   * - `${fileOperationsList}` - Formatted file operations (create/modify/delete)
   * - `${dependenciesList}` - Formatted dependency list with status
   * - `${sourceDocuments}` - Formatted ADR and Spec references
   *
   * @example Interpolation Context Output
   * ```typescript
   * {
   *   task: { id: 'TASK-042', title: 'Implement auth', ... },
   *   acceptanceCriteriaList: '- [ ] User can log in\n- [ ] Session persists',
   *   fileOperationsList: '**Create:**\n- src/lib/auth.ts\n\n**Modify:**\n- src/index.ts',
   *   dependenciesList: '- ✅ TASK-001: Database setup (completed)',
   *   sourceDocuments: '**ADR:** docs/adr/ADR-042.md\n**Spec:** docs/specs/spec-042.md'
   * }
   * ```
   */
  private prepareInterpolationContext(
    task: Task,
    dependencies: Task[],
    blockedTasks: Task[],
  ): Record<string, unknown> {
    return {
      task,
      acceptanceCriteriaList: this.formatAcceptanceCriteria(task.acceptance_criteria),
      fileOperationsList: this.formatFileOperations(task.files),
      dependenciesList: this.formatDependencies(dependencies),
      blockedTasksList: this.formatBlockedTasks(blockedTasks),
      sourceDocuments: this.formatSourceDocuments(task.adr_source, task.spec_source),
    }
  }

  /**
   * Interpolates template with context using JavaScript template literals.
   *
   * Evaluates the template string as a template literal, replacing all
   * ${variable} occurrences with values from the context object.
   *
   * @param template - Template string with ${variable} placeholders
   * @param context - Object with values for interpolation
   * @returns Interpolated template string
   *
   * @internal
   *
   * @remarks
   * Uses JavaScript's Function constructor to safely evaluate the template
   * as a template literal. This avoids the need for external template
   * libraries (like Handlebars) while supporting the familiar ${variable} syntax.
   *
   * @remarks
   * Security Note:
   * Template content is loaded from local files (not user input), so
   * eval-based interpolation is safe in this context.
   *
   * @example Template Interpolation
   * ```typescript
   * const template = 'Task: ${task.id} - ${task.title}';
   * const context = { task: { id: 'TASK-042', title: 'Implement auth' } };
   * const result = interpolateTemplate(template, context);
   * // Result: "Task: TASK-042 - Implement auth"
   * ```
   */
  private interpolateTemplate(template: string, context: Record<string, unknown>): string {
    // Create function that returns template literal

    const interpolate = new Function(...Object.keys(context), `return \`${template}\`;`)

    // Call function with context values
    return interpolate(...Object.values(context))
  }

  /**
   * Formats acceptance criteria as markdown checklist.
   *
   * @param criteria - Array of acceptance criteria strings
   * @returns Markdown-formatted checklist
   *
   * @internal
   *
   * @example
   * ```typescript
   * formatAcceptanceCriteria([
   *   'User can log in with email and password',
   *   'Invalid credentials show error message'
   * ]);
   * // Returns:
   * // - [ ] User can log in with email and password
   * // - [ ] Invalid credentials show error message
   * ```
   */
  private formatAcceptanceCriteria(criteria: string[]): string {
    if (!criteria || criteria.length === 0) {
      return '_No acceptance criteria defined_'
    }
    return criteria.map((ac) => `- [ ] ${ac}`).join('\n')
  }

  /**
   * Formats file operations (create/modify/delete) as markdown sections.
   *
   * @param files - File operations object with create, modify, delete arrays
   * @returns Markdown-formatted file operations
   *
   * @internal
   *
   * @example
   * ```typescript
   * formatFileOperations({
   *   create: ['src/lib/auth.ts', 'src/lib/__tests__/auth.test.ts'],
   *   modify: ['src/index.ts'],
   *   delete: []
   * });
   * // Returns:
   * // **Create:**
   * // - src/lib/auth.ts
   * // - src/lib/__tests__/auth.test.ts
   * //
   * // **Modify:**
   * // - src/index.ts
   * ```
   */
  private formatFileOperations(files: Task['files']): string {
    const sections: string[] = []

    if (files.create && files.create.length > 0) {
      sections.push(`**Create:**\n${files.create.map((f) => `- ${f}`).join('\n')}`)
    }

    if (files.modify && files.modify.length > 0) {
      sections.push(`**Modify:**\n${files.modify.map((f) => `- ${f}`).join('\n')}`)
    }

    if (files.delete && files.delete.length > 0) {
      sections.push(`**Delete:**\n${files.delete.map((f) => `- ${f}`).join('\n')}`)
    }

    return sections.length > 0 ? sections.join('\n\n') : '_No file operations specified_'
  }

  /**
   * Formats dependency tasks as markdown list with completion status.
   *
   * @param dependencies - Array of resolved dependency tasks
   * @returns Markdown-formatted dependency list
   *
   * @internal
   *
   * @example
   * ```typescript
   * formatDependencies([
   *   { id: 'TASK-001', title: 'Database setup', status: 'completed' },
   *   { id: 'TASK-002', title: 'API routes', status: 'completed' }
   * ]);
   * // Returns:
   * // - ✅ TASK-001: Database setup (completed)
   * // - ✅ TASK-002: API routes (completed)
   * ```
   */
  private formatDependencies(dependencies: Task[]): string {
    if (!dependencies || dependencies.length === 0) {
      return '_No dependencies_'
    }

    return dependencies
      .map((dep) => {
        const icon = dep.status === 'completed' ? '✅' : '⏳'
        return `- ${icon} ${dep.id}: ${dep.title} (${dep.status})`
      })
      .join('\n')
  }

  /**
   * Formats blocked tasks as markdown list.
   *
   * Shows tasks that are waiting for the current task to complete.
   *
   * @param blockedTasks - Array of tasks blocked by the current task
   * @returns Markdown-formatted blocked tasks list
   *
   * @internal
   *
   * @example
   * ```typescript
   * formatBlockedTasks([
   *   { id: 'TASK-005', title: 'User profile page' },
   *   { id: 'TASK-006', title: 'Settings page' }
   * ]);
   * // Returns:
   * // - TASK-005: User profile page
   * // - TASK-006: Settings page
   * ```
   */
  private formatBlockedTasks(blockedTasks: Task[]): string {
    if (!blockedTasks || blockedTasks.length === 0) {
      return '_No tasks are blocked by this task_'
    }

    return blockedTasks.map((task) => `- ${task.id}: ${task.title}`).join('\n')
  }

  /**
   * Formats source document references (ADR and Spec) as markdown.
   *
   * @param adrSource - Path to ADR file
   * @param specSource - Path to Spec file
   * @returns Markdown-formatted source document references
   *
   * @internal
   *
   * @example
   * ```typescript
   * formatSourceDocuments('docs/adr/ADR-042.md', 'docs/specs/spec-042.md');
   * // Returns:
   * // **ADR (Architecture Decision Record):**
   * // - docs/adr/ADR-042.md
   * //
   * // **Spec (Technical Specification):**
   * // - docs/specs/spec-042.md
   * ```
   */
  private formatSourceDocuments(adrSource: string, specSource: string): string {
    const sections: string[] = []

    if (adrSource) {
      sections.push(`**ADR (Architecture Decision Record):**\n- ${adrSource}`)
    }

    if (specSource) {
      sections.push(`**Spec (Technical Specification):**\n- ${specSource}`)
    }

    return sections.length > 0 ? sections.join('\n\n') : '_No source documents specified_'
  }
}
