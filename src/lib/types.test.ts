// src/lib/types.test.ts
// Test file to verify TaskContext types compile correctly

import { describe, it, expect } from 'vitest'
import type {
  Task,
  TaskRichContext,
  ADRContext,
  SpecContext,
  SourceMapping,
  SectionReference,
  LineReference,
  TestRequirement,
  CodeExample,
  TaskWithDependencies,
} from './types'

// Example task with rich context
const exampleTask: Task = {
  id: 'TASK-042',
  adr_source: 'adr/ADR-042-jwt.md',
  spec_source: 'specs/spec-auth.md',
  title: 'Implement JWT token generation',
  description: 'Add JWT token generation for stateless authentication',
  acceptance_criteria: [
    'Tokens include user ID, role, and expiry',
    'Tokens are signed with RS256 algorithm',
    'Token expiry is set to 15 minutes',
  ],
  dependencies: [],
  blocks: ['TASK-043'],
  test_strategy: 'TDD',
  test_strategy_rationale: 'High-risk security feature requiring comprehensive test coverage',
  estimated_hours: 8,
  risk: 'high',
  files: {
    create: ['src/lib/jwt.ts', 'src/lib/jwt.test.ts'],
    modify: ['src/lib/auth.ts'],
    delete: [],
  },
  status: 'pending',
  started_at: null,
  completed_at: null,
  commits: [],
  validation: {
    tests_pass: false,
    ac_verified: [],
  },
  context: {
    adr: {
      file: 'adr/ADR-042-jwt.md',
      decision: 'Use JWT tokens for stateless authentication',
      rationale: 'Enables horizontal scaling and microservices compatibility',
      constraints: ['15 minute token expiry', 'RS256 signing algorithm', 'Include user claims'],
      relevant_sections: [
        {
          section: '## Decision',
          lines: '10-25',
          content: 'We will implement JWT tokens using RS256...',
          relevance: 1.0,
        },
        {
          section: '## Security Considerations',
          lines: '42-58',
          content: 'Token expiry must be limited to 15 minutes...',
          relevance: 0.9,
        },
      ],
    },
    spec: {
      file: 'specs/spec-auth.md',
      acceptance_criteria: [
        'Tokens include user ID, role, and expiry',
        'Tokens are signed with RS256 algorithm',
        'Token expiry is set to 15 minutes',
      ],
      test_requirements: [
        {
          type: 'unit',
          description: 'Test token generation with valid user data',
          acceptance_criterion: 'Tokens include user ID, role, and expiry',
          lines: '65',
        },
        {
          type: 'unit',
          description: 'Test token signature validation',
          acceptance_criterion: 'Tokens are signed with RS256 algorithm',
          lines: '68',
        },
        {
          type: 'integration',
          description: 'Test token expiry enforcement',
          acceptance_criterion: 'Token expiry is set to 15 minutes',
          lines: '72',
        },
      ],
      code_examples: [
        {
          language: 'typescript',
          code: 'const token = jwt.sign(payload, privateKey, { algorithm: "RS256", expiresIn: "15m" });',
          description: 'Example JWT token generation',
          file: 'specs/spec-auth.md',
          lines: '85-87',
        },
      ],
      constraints: ['Use RS256 algorithm', 'Token expiry 15 minutes', 'Include user claims in payload'],
      relevant_sections: [
        {
          section: '## JWT Token Format',
          lines: '35-50',
          content: 'JWT tokens must contain the following claims...',
          relevance: 1.0,
        },
      ],
    },
    source_mapping: {
      acceptance_criteria: [
        {
          file: 'specs/spec-auth.md',
          lines: '18',
          text: 'AC1: Tokens include user ID, role, and expiry',
        },
        {
          file: 'specs/spec-auth.md',
          lines: '19',
          text: 'AC2: Tokens are signed with RS256 algorithm',
        },
        {
          file: 'specs/spec-auth.md',
          lines: '20',
          text: 'AC3: Token expiry is set to 15 minutes',
        },
      ],
      tests: [
        {
          file: 'specs/spec-auth.md',
          lines: '65',
          text: 'Unit test: Verify token contains user ID, role, expiry',
        },
      ],
      examples: [
        {
          file: 'specs/spec-auth.md',
          lines: '85-87',
          text: 'Example: jwt.sign(payload, privateKey, ...)',
        },
      ],
    },
  },
}

// Example task without context (backward compatible)
const basicTask: Task = {
  id: 'TASK-001',
  adr_source: 'adr/ADR-001-basic.md',
  spec_source: 'specs/spec-basic.md',
  title: 'Basic task without context',
  description: 'A task without rich context',
  acceptance_criteria: ['Must work'],
  dependencies: [],
  blocks: [],
  test_strategy: 'Direct',
  test_strategy_rationale: 'Simple configuration task',
  estimated_hours: 1,
  risk: 'low',
  files: {
    create: [],
    modify: ['config.json'],
    delete: [],
  },
  status: 'pending',
  started_at: null,
  completed_at: null,
  commits: [],
  validation: {
    tests_pass: false,
    ac_verified: [],
  },
  // context is optional
}

// Example TaskWithDependencies (formerly TaskContext)
const taskWithDeps: TaskWithDependencies = {
  task: basicTask,
  dependencies: [],
  blockedTasks: [exampleTask],
}

// Type assertions to ensure compilation
const _adrContext: ADRContext = exampleTask.context!.adr
const _specContext: SpecContext = exampleTask.context!.spec
const _sourceMapping: SourceMapping = exampleTask.context!.source_mapping
const _sectionRef: SectionReference = _adrContext.relevant_sections[0]
const _lineRef: LineReference = _sourceMapping.acceptance_criteria[0]
const _testReq: TestRequirement = _specContext.test_requirements[0]
const _codeExample: CodeExample = _specContext.code_examples[0]
const _richContext: TaskRichContext = exampleTask.context!

// Verify test requirement type union
const testTypes: TestRequirement['type'][] = ['unit', 'integration', 'e2e', 'acceptance']
testTypes.forEach((type) => {
  const req: TestRequirement = {
    type,
    description: 'Test description',
    acceptance_criterion: 'Some criterion',
    lines: '10',
  }
  // Type verification - no output needed
  void req.type
})

export { exampleTask, basicTask, taskWithDeps }

// Type verification tests
describe('TaskRichContext types', () => {
  it('should compile with example task with full context', () => {
    expect(exampleTask.id).toBe('TASK-042')
    expect(exampleTask.context).toBeDefined()
    expect(exampleTask.context?.adr).toBeDefined()
  })

  it('should compile with basic task without context', () => {
    expect(basicTask.id).toBe('TASK-001')
    expect(basicTask.context).toBeUndefined()
  })

  it('should compile with TaskWithDependencies type', () => {
    expect(taskWithDeps.task.id).toBe('TASK-001')
    expect(taskWithDeps.blockedTasks).toHaveLength(1)
  })
})
