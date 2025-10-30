/**
 * RefactoringPlanner - Refactoring Options & Migration Planning
 *
 * Generates multiple refactoring strategies for detected architectural issues,
 * creates migration plans with phased implementation, and builds executable
 * implementation checklists. Provides intelligent decision-making for architectural
 * improvements with trade-off analysis, phased rollout plans, and risk assessment.
 *
 * @module refactoring-planner
 *
 * @example
 * ```typescript
 * const planner = new RefactoringPlanner()
 * const issue = { title: 'Too Many Commands', ... }
 * const options = planner.generateOptions(issue)     // Get alternatives
 * const best = planner.recommendBest(options)        // Pick best option
 * const strategy = planner.createMigrationStrategy(issue, best)  // Plan migration
 * const checklist = planner.buildChecklist(strategy)  // Create executable plan
 * ```
 */

import type {
  ArchitecturalIssue,
  RefactoringOption,
  MigrationStrategy,
  ImplementationChecklist,
} from './types'

/**
 * RefactoringPlanner - Main class for planning refactoring approaches
 *
 * Provides comprehensive refactoring planning by:
 * - Generating 2-3+ alternative approaches per detected architectural issue
 * - Evaluating trade-offs (implementation effort, risk level, breaking changes)
 * - Creating phased migration strategies with pre-flight checks and quality gates
 * - Building executable implementation checklists with approval workflows
 * - Calculating overall risk assessment based on mitigation factors
 *
 * Supports 4+ issue types with specialized strategy generators:
 * - **TooManyCommands**: Domain splitting strategies (Extract, Consolidate, Organize)
 * - **LowCohesion**: Consolidation and refocusing strategies (Redefine, Merge)
 * - **TightCoupling**: Abstraction and facade strategies (Extract Utilities, Facade)
 * - **TestCoverageGaps**: Testing and refactoring strategies (Add Tests, Refactor)
 *
 * @remarks
 * - Each issue type has 2-3 unique refactoring options with pros/cons
 * - Migration strategies include multi-phase implementation plans (Plan, Implement, Validate)
 * - Pre-flight checks ensure safe execution (tests passing, clean working directory)
 * - Quality gates validate each phase (tests, build, metrics improvement)
 * - Risk mitigation strategies address breaking changes and performance regressions
 * - Checklists are designed for manual execution by development teams
 * - Effort estimates help prioritize which issues to address first
 * - Overall risk assessment combines likelihood and impact of all risks
 */
export class RefactoringPlanner {
  /**
   * Generate refactoring options for an architectural issue
   *
   * Returns 2-3 alternative approaches for addressing the issue, each with
   * pros/cons, effort estimate, risk assessment, breaking change indicators,
   * and recommendation priority. Options are customized per issue type using
   * specialized strategy generators.
   *
   * @param issue - The architectural issue to solve (must have a recognized title)
   * @returns Array of RefactoringOption objects, usually 2-3 alternatives per issue type.
   *          Options include name, description, pros/cons, effort, risk level, and
   *          recommendation flag. Returns empty array if issue type not recognized.
   *
   * @example
   * ```typescript
   * const planner = new RefactoringPlanner()
   * const issue = { title: 'Too Many Commands', ... }
   * const options = planner.generateOptions(issue)
   * // Returns: [
   * //   { name: 'Extract Sub-Domain', recommendation: true, effort: '4-6 hours', ... },
   * //   { name: 'Consolidate Commands', recommendation: false, effort: '1-2 hours', ... },
   * //   { name: 'Organize by Concern', recommendation: false, effort: '2-3 hours', ... }
   * // ]
   * ```
   *
   * @remarks
   * - Issue types: 'Too Many Commands', 'Low Cohesion', 'Tight Coupling', 'Test Coverage Gaps'
   * - Exactly one option will have recommendation: true (the best choice)
   * - Effort estimates are relative and should be discussed with team
   * - Risk levels: low, medium, high (factored into priority)
   * - Breaking changes indicated via breaking flag (impacts user migration)
   */
  public generateOptions(issue: ArchitecturalIssue): RefactoringOption[] {
    switch (issue.title) {
      case 'Too Many Commands':
        return this.generateTooManyCommandsOptions(issue)
      case 'Low Cohesion':
        return this.generateLowCohesionOptions(issue)
      case 'Tight Coupling':
        return this.generateTightCouplingOptions(issue)
      case 'Test Coverage Gaps':
        return this.generateTestCoverageOptions(issue)
      default:
        return []
    }
  }

  /**
   * Create a migration strategy for a selected refactoring option
   *
   * Builds a detailed, phased migration plan for implementing a selected refactoring option.
   * The strategy includes pre-flight checks, three implementation phases (Plan, Implement, Validate),
   * quality gates for each phase, post-flight validation, risk mitigation strategies, and
   * comprehensive rollback procedures.
   *
   * @param issue - The architectural issue being addressed
   * @param option - The selected refactoring option (null returns null strategy)
   * @returns MigrationStrategy with complete implementation plan, or null if option is null.
   *          Strategy includes phases, checkpoints, risk assessment, and rollback plan.
   *
   * @example
   * ```typescript
   * const planner = new RefactoringPlanner()
   * const issue = { title: 'Too Many Commands', ... }
   * const options = planner.generateOptions(issue)
   * const selectedOption = options[0]
   * const strategy = planner.createMigrationStrategy(issue, selectedOption)
   * // Returns: {
   * //   name: 'Migrate: Extract Sub-Domain',
   * //   phases: [
   * //     { name: 'Plan', tasks: [...], qualityGates: [...] },
   * //     { name: 'Implement', tasks: [...], qualityGates: [...] },
   * //     { name: 'Validate', tasks: [...], qualityGates: [...] }
   * //   ],
   * //   preFlightChecks: [...],
   * //   postFlightValidation: [...],
   * //   riskMitigation: [...],
   * //   rollbackPlan: 'Use git revert...'
   * // }
   * ```
   *
   * @remarks
   * - Phase 1 (Plan): Analyze current state, document dependencies, create baseline metrics
   * - Phase 2 (Implement): Execute refactoring, migrate code, update imports, run tests
   * - Phase 3 (Validate): Verify improvements, compare metrics, document results
   * - Each phase has quality gates (specific commands to run before proceeding)
   * - Pre-flight checks include: all tests passing, clean working directory
   * - Post-flight validation includes: tests still passing, build succeeds
   * - Risk mitigation covers: breaking changes, performance regression
   * - Estimated duration combines all phase durations
   * - Returns null if option is null (no strategy for null option)
   */
  public createMigrationStrategy(
    issue: ArchitecturalIssue,
    option: RefactoringOption | null,
  ): MigrationStrategy | null {
    if (!option) {
      return null
    }

    return {
      name: `Migrate: ${option.name}`,
      overview: `Migration plan for: ${issue.title}`,
      phases: [
        {
          name: 'Plan',
          description: 'Analyze and plan the refactoring',
          tasks: [
            {
              id: 'PLAN-001',
              title: 'Analyze current state',
              description: 'Document the current architecture',
              steps: [
                'Review current component structure',
                'Document dependencies',
                'Create baseline metrics',
              ],
              duration: '1-2 hours',
              rollbackProcedure: 'No changes made in this phase',
            },
          ],
          duration: '1-2 hours',
          qualityGates: [
            {
              name: 'Analysis complete',
              command: 'echo "Analysis documented"',
              successCriteria: 'Current state documented',
            },
          ],
        },
        {
          name: 'Implement',
          description: 'Execute the refactoring',
          tasks: [
            {
              id: 'IMPL-001',
              title: 'Execute refactoring',
              description: 'Implement the refactoring plan',
              steps: ['Create new structure', 'Migrate code', 'Update imports', 'Run tests'],
              duration: option.effort,
              rollbackProcedure: 'Revert changes from git',
            },
          ],
          duration: option.effort,
          qualityGates: [
            {
              name: 'Tests passing',
              command: 'pnpm test',
              successCriteria: 'All tests pass',
            },
          ],
        },
        {
          name: 'Validate',
          description: 'Verify the refactoring worked',
          tasks: [
            {
              id: 'VAL-001',
              title: 'Validate improvements',
              description: 'Verify the refactoring addressed the issue',
              steps: ['Compare metrics', 'Verify issue resolved', 'Document results'],
              duration: '1 hour',
              rollbackProcedure: 'Revert changes if validation fails',
            },
          ],
          duration: '1 hour',
          qualityGates: [
            {
              name: 'Metrics improved',
              command: 'echo "Metrics verified"',
              successCriteria: 'Issue metrics improved',
            },
          ],
        },
      ],
      preFlightChecks: [
        {
          id: 'PRE-001',
          task: 'All tests passing',
          checkCommand: 'pnpm test',
          successCriteria: 'No test failures',
          optional: false,
        },
        {
          id: 'PRE-002',
          task: 'Working directory clean',
          checkCommand: 'git status',
          successCriteria: 'No uncommitted changes',
          optional: false,
        },
      ],
      postFlightValidation: [
        {
          id: 'POST-001',
          task: 'All tests still passing',
          checkCommand: 'pnpm test',
          successCriteria: 'No test failures',
          optional: false,
        },
        {
          id: 'POST-002',
          task: 'Build succeeds',
          checkCommand: 'pnpm build',
          successCriteria: 'Build completes with no errors',
          optional: false,
        },
      ],
      riskMitigation: [
        {
          risk: 'Breaking changes introduced',
          likelihood: option.breaking ? 'high' : 'low',
          impact: 'Users unable to upgrade',
          mitigation: 'Provide migration guide',
        },
        {
          risk: 'Performance regression',
          likelihood: 'low',
          impact: 'Slower application',
          mitigation: 'Run performance tests before/after',
        },
      ],
      estimatedDuration: option.effort,
      rollbackPlan: 'Use git revert to rollback all changes',
    }
  }

  /**
   * Build an executable implementation checklist from strategy
   *
   * Converts a detailed migration strategy into an executable implementation checklist
   * that can be used by development teams. Organizes tasks by phase, includes quality
   * gates for each phase, calculates total duration, assesses overall risk, and defines
   * approval gates for team sign-off at critical points.
   *
   * @param strategy - The migration strategy to convert into executable form
   * @returns ImplementationChecklist with phase-organized tasks, approval gates, and risk assessment.
   *          Checklist is ready for team execution with clear success criteria.
   *
   * @example
   * ```typescript
   * const planner = new RefactoringPlanner()
   * const strategy = planner.createMigrationStrategy(issue, option)
   * const checklist = planner.buildChecklist(strategy)
   * // Returns: {
   * //   phases: [
   * //     { name: 'Plan', duration: '1-2 hours', tasks: [...] },
   * //     { name: 'Implement', duration: '4-6 hours', tasks: [...] },
   * //     { name: 'Validate', duration: '1 hour', tasks: [...] }
   * //   ],
   * //   totalDuration: '4-6 hours',
   * //   overallRisk: 'medium',
   * //   approvalGates: ['Plan phase approval', 'Implement phase approval', 'Validate phase approval']
   * // }
   * ```
   *
   * @remarks
   * - Each phase includes executable tasks with success criteria
   * - Approval gates are required between phases (team sign-off points)
   * - Overall risk calculated from strategy's risk mitigation likelihood/impact
   * - Tasks are directly executable from the checklist
   * - Duration is aggregated from all phases
   * - Empty strategy returns empty checklist
   */
  public buildChecklist(strategy: MigrationStrategy): ImplementationChecklist {
    return {
      phases: strategy.phases.map((phase) => ({
        name: phase.name,
        duration: phase.duration,
        tasks: phase.tasks.map((task) => ({
          id: task.id,
          task: task.title,
          checkCommand: `echo "${task.title}"`,
          successCriteria: task.description,
          optional: false,
        })),
      })),
      totalDuration: strategy.estimatedDuration,
      overallRisk: this.calculateOverallRisk(strategy),
      approvalGates: strategy.phases.map((p) => `${p.name} phase approval`),
    }
  }

  /**
   * Select the best option from a list of alternatives
   *
   * Intelligently selects the best refactoring option from a list of alternatives.
   * Prioritizes options marked with recommendation: true. Falls back to first option
   * if no recommended option exists. Returns null only if list is empty.
   *
   * @param options - Array of refactoring options (typically 2-3 from generateOptions)
   * @returns The best option with recommendation flag set, first option if no recommendation,
   *          or null if options array is empty.
   *
   * @example
   * ```typescript
   * const options = planner.generateOptions(issue)
   * const bestOption = planner.recommendBest(options)
   * // Returns option with recommendation: true if available, otherwise first option
   * ```
   *
   * @remarks
   * - Exactly one option should have recommendation: true (best choice)
   * - If multiple options are marked as recommended, returns first match
   * - Useful for automated selection in CI/CD pipelines
   * - For manual selection, show all options and let team choose
   * - Returns null only when options array is empty (invalid input)
   */
  public recommendBest(options: RefactoringOption[]): RefactoringOption | null {
    if (options.length === 0) {
      return null
    }

    const recommended = options.find((o) => o.recommendation)
    if (recommended) {
      return recommended
    }
    return options[0] ? options[0] : null
  }

  /**
   * Generate options for TooManyCommands issue
   *
   * Provides 3 specialized refactoring strategies for domains with too many commands (>10):
   * 1. Extract Sub-Domain (recommended): Split into 2-3 focused sub-domains
   * 2. Consolidate Commands: Merge related commands into meta-commands
   * 3. Organize by Concern: Reorganize into subdirectories/modules
   *
   * @param _issue - The architectural issue (not used by generator)
   * @returns Array of 3 RefactoringOption objects, with first option as recommended
   *
   * @internal
   */
  private generateTooManyCommandsOptions(_issue: ArchitecturalIssue): RefactoringOption[] {
    return [
      {
        name: 'Extract Sub-Domain',
        description: 'Split into 2-3 focused sub-domains',
        pros: [
          'Clear separation of concerns',
          'Improved discoverability',
          'Enables independent scaling',
        ],
        cons: ['Requires dependency management', 'More domains to maintain'],
        effort: '4-6 hours',
        breaking: true,
        riskLevel: 'medium',
        recommendation: true,
      },
      {
        name: 'Consolidate Commands',
        description: 'Merge related commands into meta-commands',
        pros: ['Quick implementation', 'Keeps single domain', 'Minimal changes'],
        cons: ['Larger command objects', 'Reduced discoverability'],
        effort: '1-2 hours',
        breaking: false,
        riskLevel: 'low',
        recommendation: false,
      },
      {
        name: 'Organize by Concern',
        description: 'Reorganize into subdirectories/modules',
        pros: ['Balanced organization', 'Single domain preserved', 'Logical grouping'],
        cons: ['Still one domain conceptually'],
        effort: '2-3 hours',
        breaking: false,
        riskLevel: 'low',
        recommendation: false,
      },
    ]
  }

  /**
   * Generate options for LowCohesion issue
   *
   * Provides 2 specialized refactoring strategies for domains with low cohesion
   * (unrelated commands in same domain):
   * 1. Redefine Focus (recommended): Clarify domain purpose and rename if needed
   * 2. Merge into Related Domain: Move commands to more cohesive domain
   *
   * @param _issue - The architectural issue (not used by generator)
   * @returns Array of 2 RefactoringOption objects, with first option as recommended
   *
   * @internal
   */
  private generateLowCohesionOptions(_issue: ArchitecturalIssue): RefactoringOption[] {
    return [
      {
        name: 'Redefine Focus',
        description: 'Clarify domain purpose and rename if needed',
        pros: ['Improves clarity', 'Attracts related commands'],
        cons: ['Minimal change if commands truly unrelated'],
        effort: '1 hour',
        breaking: false,
        riskLevel: 'low',
        recommendation: true,
      },
      {
        name: 'Merge into Related Domain',
        description: 'Move commands to more cohesive domain',
        pros: ['Consolidates functionality', 'Improves cohesion'],
        cons: ['Larger domain', 'Dependency updates'],
        effort: '2-3 hours',
        breaking: false,
        riskLevel: 'low',
        recommendation: false,
      },
    ]
  }

  /**
   * Generate options for TightCoupling issue
   *
   * Provides 2 specialized refactoring strategies for domains with tight coupling
   * (>6 external module dependencies):
   * 1. Extract Shared Utilities (recommended): Create utility layer to abstract dependencies
   * 2. Add Facade Pattern: Create facade to simplify dependencies
   *
   * @param _issue - The architectural issue (not used by generator)
   * @returns Array of 2 RefactoringOption objects, with first option as recommended
   *
   * @internal
   */
  private generateTightCouplingOptions(_issue: ArchitecturalIssue): RefactoringOption[] {
    return [
      {
        name: 'Extract Shared Utilities',
        description: 'Create utility layer to abstract dependencies',
        pros: ['Improves testability', 'Reduces coupling', 'Reusable abstractions'],
        cons: ['Requires refactoring', 'New layer to maintain'],
        effort: '3-4 hours',
        breaking: false,
        riskLevel: 'medium',
        recommendation: true,
      },
      {
        name: 'Add Facade Pattern',
        description: 'Create facade to simplify dependencies',
        pros: ['Easy implementation', 'Improves interface'],
        cons: ['Just hides complexity', "Doesn't reduce coupling"],
        effort: '2-3 hours',
        breaking: false,
        riskLevel: 'low',
        recommendation: false,
      },
    ]
  }

  /**
   * Generate options for TestCoverageGaps issue
   *
   * Provides 2 specialized refactoring strategies for components with test coverage gaps
   * (complex components without adequate tests):
   * 1. Add Unit Tests (recommended): Write unit tests for untested code paths
   * 2. Refactor for Testability: Restructure code to be more testable
   *
   * @param _issue - The architectural issue (not used by generator)
   * @returns Array of 2 RefactoringOption objects, with first option as recommended
   *
   * @internal
   */
  private generateTestCoverageOptions(_issue: ArchitecturalIssue): RefactoringOption[] {
    return [
      {
        name: 'Add Unit Tests',
        description: 'Write unit tests for untested code paths',
        pros: ['Improves reliability', 'Documents behavior', 'Enables refactoring'],
        cons: ['Time consuming', 'Requires test expertise'],
        effort: '4-6 hours',
        breaking: false,
        riskLevel: 'low',
        recommendation: true,
      },
      {
        name: 'Refactor for Testability',
        description: 'Restructure code to be more testable',
        pros: ['Improves design', 'Better unit tests', 'Easier to test'],
        cons: ['Requires refactoring', 'Longer implementation'],
        effort: '3-4 hours',
        breaking: false,
        riskLevel: 'medium',
        recommendation: false,
      },
    ]
  }

  /**
   * Calculate overall risk of a migration strategy
   *
   * Analyzes all risk mitigation factors in the strategy and returns a comprehensive
   * risk assessment. Risk levels are calculated based on likelihood and impact of
   * identified risks. Critical risks take highest priority.
   *
   * @param strategy - The migration strategy containing risk mitigation data
   * @returns Overall risk assessment: 'critical' if critical risks exist,
   *          'high' if 2+ high-likelihood risks, 'medium' if 1 high-likelihood risk,
   *          'low' if no high-likelihood risks
   *
   * @internal
   */
  private calculateOverallRisk(
    strategy: MigrationStrategy,
  ): 'low' | 'medium' | 'high' | 'critical' {
    const highRisks = strategy.riskMitigation.filter((r) => r.likelihood === 'high')
    const criticalRisks = highRisks.filter((r) => r.impact.toLowerCase().includes('critical'))

    if (criticalRisks.length > 0) return 'critical'
    if (highRisks.length > 1) return 'high'
    if (highRisks.length > 0) return 'medium'
    return 'low'
  }
}
