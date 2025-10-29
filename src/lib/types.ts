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
