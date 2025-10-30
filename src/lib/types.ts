// src/lib/types.ts

export type VTM = {
  version: string
  project: {
    name: string
    description: string
  }
  stats: VTMStats
  tasks: Task[]
}

export type VTMStats = {
  total_tasks: number
  completed: number
  in_progress: number
  pending: number
  blocked: number
}

export type Task = {
  id: string
  adr_source: string
  spec_source: string
  title: string
  description: string
  acceptance_criteria: string[]
  dependencies: Array<string | number>
  blocks: string[]
  test_strategy: 'TDD' | 'Unit' | 'Integration' | 'Direct'
  test_strategy_rationale: string
  estimated_hours: number
  risk: 'low' | 'medium' | 'high'
  files: {
    create: string[]
    modify: string[]
    delete: string[]
  }
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  started_at: string | null
  completed_at: string | null
  commits: string[]
  validation: {
    tests_pass: boolean
    ac_verified: string[]
  }
  /**
   * Optional type for categorizing tasks, used for branch naming and organization.
   * Defaults to 'feature' if not specified.
   */
  type?: 'feature' | 'bugfix' | 'refactor' | 'chore' | 'docs' | 'test'
  /**
   * Rich context from ADR and Spec sources for traceability.
   * Optional field that can be populated during task extraction.
   */
  context?: TaskRichContext
}

/**
 * Task with resolved dependency and blocking relationships.
 * Used for displaying task context with related tasks.
 */
export type TaskWithDependencies = {
  task: Task
  dependencies: Task[]
  blockedTasks: Task[]
}

/**
 * Rich context extracted from ADR and Spec documents.
 * Provides full traceability back to source documents with line numbers.
 */
export type TaskRichContext = {
  adr: ADRContext
  spec: SpecContext
  source_mapping: SourceMapping
}

/**
 * Context extracted from Architecture Decision Record (ADR).
 * Captures the decision, rationale, and relevant sections.
 */
export type ADRContext = {
  /** Path to ADR file (e.g., "adr/ADR-042-jwt.md") */
  file: string
  /** The architectural decision being documented */
  decision: string
  /** Why this decision was made */
  rationale: string
  /** Technical constraints that must be followed */
  constraints: string[]
  /** Relevant sections from the ADR with line numbers */
  relevant_sections: SectionReference[]
}

/**
 * Context extracted from specification document.
 * Captures acceptance criteria, test requirements, and code examples.
 */
export type SpecContext = {
  /** Path to spec file (e.g., "specs/spec-auth.md") */
  file: string
  /** Acceptance criteria that must be met */
  acceptance_criteria: string[]
  /** Test requirements derived from the spec */
  test_requirements: TestRequirement[]
  /** Code examples provided in the spec */
  code_examples: CodeExample[]
  /** Technical constraints from the spec */
  constraints: string[]
  /** Relevant sections from the spec with line numbers */
  relevant_sections: SectionReference[]
}

/**
 * Maps task elements back to their source locations in documents.
 * Enables traceability from task to original document sections.
 */
export type SourceMapping = {
  /** Line references for each acceptance criterion */
  acceptance_criteria: LineReference[]
  /** Line references for test requirements */
  tests: LineReference[]
  /** Line references for code examples */
  examples: LineReference[]
}

/**
 * Reference to a section in a source document.
 * Includes content and relevance scoring.
 */
export type SectionReference = {
  /** Section heading (e.g., "## JWT Token Generation") */
  section: string
  /** Line range in source file (e.g., "42-58") */
  lines: string
  /** Actual text content from the section */
  content: string
  /** Relevance score from 0.0 (not relevant) to 1.0 (highly relevant) */
  relevance: number
}

/**
 * Reference to specific lines in a source document.
 * Used for mapping task elements to their source locations.
 */
export type LineReference = {
  /** Source file path (e.g., "spec-auth.md") */
  file: string
  /** Line number or range (e.g., "18" or "35-40") */
  lines: string
  /** Actual text at this location */
  text: string
}

/**
 * Test requirement extracted from specification.
 * Links test type to acceptance criteria and source location.
 */
export type TestRequirement = {
  /** Type of test required */
  type: 'unit' | 'integration' | 'e2e' | 'acceptance'
  /** Description of what should be tested */
  description: string
  /** Which acceptance criterion this test validates */
  acceptance_criterion: string
  /** Line number or range in spec where this requirement is defined */
  lines: string
}

/**
 * Code example from specification document.
 * Provides reference implementation with source traceability.
 */
export type CodeExample = {
  /** Programming language (e.g., "typescript", "javascript", "bash") */
  language: string
  /** The actual code content */
  code: string
  /** Description of what this example demonstrates */
  description: string
  /** Source file where example is located */
  file: string
  /** Line range in source file (e.g., "35-40") */
  lines: string
}

/**
 * @deprecated Use TaskWithDependencies instead
 * Legacy type name kept for backward compatibility
 */
export type TaskContext = TaskWithDependencies

export type TaskUpdate = {
  status?: Task['status']
  started_at?: string
  completed_at?: string
  commits?: string[]
  files?: {
    created?: string[]
    modified?: string[]
  }
  validation?: {
    tests_pass?: boolean
    ac_verified?: string[]
  }
}

/**
 * Architectural issue detected in a domain or component.
 * Represents a problem with the code structure, dependencies, or quality.
 */
export type ArchitecturalIssue = {
  /** Unique identifier for the issue (e.g., "ISSUE-001") */
  id: string
  /** Short title of the issue */
  title: string
  /** Detailed description of the problem */
  description: string
  /** Severity level of the issue */
  severity: 'critical' | 'high' | 'medium' | 'low'
  /** Location where the issue was detected (file path or component name) */
  location: string
  /** Evidence of the issue (specific metrics or observations) */
  evidence: string
  /** Array of impacts if the issue is not fixed */
  impact: string[]
  /** Estimated effort to fix the issue (e.g., "2 hours") */
  effort: string
  /** IDs of related issues that compound this one */
  relatedIssues: string[]
}

/**
 * Detection rule type for custom issue detection.
 * Allows registering custom detection rules with IssueDetector.
 */
export type DetectionRule = {
  /** Name of the detection rule */
  readonly name: string
  /** Description of what this rule detects */
  readonly description: string
  /** Method to detect issues of this type */
  detect: (domainPath: string) => ArchitecturalIssue[]
}

/**
 * Options for issue detection.
 * Allows filtering and customizing detection behavior.
 */
export type DetectionOptions = {
  /** Array of rule names to skip during detection */
  skipRules?: string[]
  /** Minimum severity level to include in results */
  minSeverity?: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * A refactoring option/strategy for addressing an architectural issue.
 * Includes effort, risk, and trade-off analysis.
 */
export type RefactoringOption = {
  /** Name of the refactoring approach */
  name: string
  /** Detailed description of the approach */
  description: string
  /** Advantages of this approach */
  pros: string[]
  /** Disadvantages/risks of this approach */
  cons: string[]
  /** Estimated effort to implement (e.g., "2-3 hours") */
  effort: string
  /** Whether this change is breaking/requires migration */
  breaking: boolean
  /** Risk level of implementing this option */
  riskLevel: 'low' | 'medium' | 'high'
  /** Whether this is the recommended option */
  recommendation: boolean
}

/**
 * A migration phase with specific tasks and quality gates.
 */
export type MigrationPhase = {
  /** Phase name (e.g., "Planning", "Implementation") */
  name: string
  /** Description of what happens in this phase */
  description: string
  /** Individual migration tasks in this phase */
  tasks: MigrationTask[]
  /** Estimated duration for this phase */
  duration: string
  /** Quality gates that must pass before proceeding */
  qualityGates: QualityGate[]
}

/**
 * A single migration task with rollback procedure.
 */
export type MigrationTask = {
  /** Unique task identifier */
  id: string
  /** Short title of the task */
  title: string
  /** Detailed description of what to do */
  description: string
  /** Step-by-step implementation steps */
  steps: string[]
  /** Estimated time to complete */
  duration: string
  /** How to roll back if this task fails */
  rollbackProcedure: string
}

/**
 * A quality gate to verify before proceeding to next phase.
 */
export type QualityGate = {
  /** Gate name (e.g., "All tests passing") */
  name: string
  /** Command to run (e.g., "pnpm test") */
  command: string
  /** What success looks like */
  successCriteria: string
}

/**
 * Complete migration strategy with all phases and validation.
 */
export type MigrationStrategy = {
  /** Strategy name */
  name: string
  /** Overview of the entire migration */
  overview: string
  /** Ordered list of migration phases */
  phases: MigrationPhase[]
  /** Pre-migration checks to perform */
  preFlightChecks: ChecklistItem[]
  /** Post-migration validation steps */
  postFlightValidation: ChecklistItem[]
  /** Risk mitigation strategies */
  riskMitigation: RiskMitigation[]
  /** Total estimated time to complete */
  estimatedDuration: string
  /** How to rollback the entire migration if needed */
  rollbackPlan: string
}

/**
 * Item in a migration checklist.
 */
export type ChecklistItem = {
  /** Item identifier */
  id: string
  /** What needs to be done */
  task: string
  /** Optional command to verify completion */
  checkCommand?: string
  /** How to know if this is complete */
  successCriteria: string
  /** Whether this item is optional */
  optional: boolean
}

/**
 * Risk mitigation strategy.
 */
export type RiskMitigation = {
  /** Description of the risk */
  risk: string
  /** How likely is this risk to occur */
  likelihood: 'low' | 'medium' | 'high'
  /** What happens if this risk occurs */
  impact: string
  /** How to prevent or handle this risk */
  mitigation: string
}

/**
 * Implementation checklist derived from a migration strategy.
 */
export type ImplementationChecklist = {
  /** Phases with their checklists */
  phases: ChecklistPhase[]
  /** Total estimated duration */
  totalDuration: string
  /** Overall risk level of the migration */
  overallRisk: 'low' | 'medium' | 'high' | 'critical'
  /** Gates that require approval before proceeding */
  approvalGates: string[]
}

/**
 * A phase of the implementation checklist.
 */
export type ChecklistPhase = {
  /** Phase name */
  name: string
  /** Estimated duration for this phase */
  duration: string
  /** Checklist items for this phase */
  tasks: ChecklistItem[]
}

/**
 * Custom error class for git-related operations.
 * Provides context-specific error messages for git failures.
 */
export class GitError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly suggestions: string[] = [],
  ) {
    super(message)
    this.name = 'GitError'
    Object.setPrototypeOf(this, GitError.prototype)
  }
}

/**
 * Result of a git operation (commit, merge, branch creation, etc).
 * Provides success/failure status and detailed information.
 */
export type GitOperationResult = {
  /** Whether the operation succeeded */
  success: boolean
  /** Human-readable message describing the result */
  message: string
  /** Git branch name involved in the operation */
  branch?: string
  /** Git commit SHA if a commit was created */
  commit?: string
  /** Additional operation details (e.g., files changed, merge conflicts) */
  details?: Record<string, unknown>
}

/**
 * Configuration options for VTMGitWorkflow operations.
 * Allows customization of git behavior.
 */
export type GitWorkflowOptions = {
  /** Whether to run git commands in verbose mode (default: false) */
  verbose?: boolean
  /** Custom git directory path (default: current working directory) */
  gitDir?: string
  /** Whether to automatically push changes to remote (default: false) */
  autoPush?: boolean
}
