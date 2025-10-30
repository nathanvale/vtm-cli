/**
 * Tests for InstructionBuilder class.
 *
 * Tests the instruction generation system that loads markdown templates
 * and interpolates task-specific data for TDD, Unit, Integration, and Direct tasks.
 *
 * Test Coverage:
 * - Template loading by test strategy
 * - Template interpolation with task data
 * - Error handling (missing templates, invalid tasks)
 * - Formatting functions (acceptance criteria, file operations, dependencies)
 * - Edge cases (empty arrays, null values, missing fields)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { InstructionBuilder } from '../instruction-builder'
import { VTMReader } from '../vtm-reader'
import type { Task, VTM } from '../types'

describe('InstructionBuilder', () => {
  let testDir: string
  let vtmPath: string
  let templatePath: string

  /**
   * Set up test environment before each test.
   * Creates temporary directory with VTM file and instruction templates.
   */
  beforeEach(() => {
    // Create temporary test directory
    testDir = mkdtempSync(join(tmpdir(), 'instruction-builder-test-'))
    vtmPath = join(testDir, 'vtm.json')
    templatePath = join(testDir, 'templates')

    // Create template directory
    mkdirSync(templatePath, { recursive: true })
  })

  /**
   * Clean up test environment after each test.
   */
  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  describe('constructor', () => {
    it('should create InstructionBuilder with default paths', () => {
      const builder = new InstructionBuilder()
      expect(builder).toBeInstanceOf(InstructionBuilder)
    })

    it('should create InstructionBuilder with custom template path', () => {
      const builder = new InstructionBuilder({
        templatePath: './custom-templates',
      })
      expect(builder).toBeInstanceOf(InstructionBuilder)
    })

    it('should create InstructionBuilder with custom VTM path', () => {
      const builder = new InstructionBuilder({
        vtmPath: './custom-vtm.json',
      })
      expect(builder).toBeInstanceOf(InstructionBuilder)
    })

    it('should create InstructionBuilder with existing VTMReader', () => {
      const reader = new VTMReader(vtmPath)
      const builder = new InstructionBuilder({ reader })
      expect(builder).toBeInstanceOf(InstructionBuilder)
    })
  })

  describe('buildInstructions', () => {
    beforeEach(() => {
      // Create mock VTM file
      const mockVTM: VTM = {
        version: '1.0.0',
        project: {
          name: 'Test Project',
          description: 'Test project for instruction builder',
        },
        stats: {
          total_tasks: 2,
          completed: 1,
          in_progress: 0,
          pending: 1,
          blocked: 0,
        },
        tasks: [
          {
            id: 'TASK-001',
            title: 'Database setup',
            description: 'Set up PostgreSQL database',
            acceptance_criteria: ['Database is running', 'Tables are created'],
            dependencies: [],
            blocks: ['TASK-002'],
            test_strategy: 'Direct',
            test_strategy_rationale: 'Setup task, manual verification',
            estimated_hours: 2,
            risk: 'low',
            files: {
              create: ['docker-compose.yml'],
              modify: [],
              delete: [],
            },
            status: 'completed',
            started_at: '2024-01-01T10:00:00Z',
            completed_at: '2024-01-01T12:00:00Z',
            commits: ['abc123'],
            validation: {
              tests_pass: true,
              ac_verified: ['Database is running', 'Tables are created'],
            },
            adr_source: 'docs/adr/ADR-001.md',
            spec_source: 'docs/specs/spec-001.md',
          },
          {
            id: 'TASK-002',
            title: 'Implement authentication',
            description: 'Implement JWT-based authentication',
            acceptance_criteria: [
              'User can log in with email and password',
              'JWT token is generated on successful login',
              'Protected routes require valid JWT',
            ],
            dependencies: ['TASK-001'],
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'Core security feature requires comprehensive testing',
            estimated_hours: 8,
            risk: 'high',
            files: {
              create: ['src/lib/auth.ts', 'src/lib/__tests__/auth.test.ts'],
              modify: ['src/index.ts'],
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
            adr_source: 'docs/adr/ADR-002.md',
            spec_source: 'docs/specs/spec-002.md',
          },
        ],
      }

      writeFileSync(vtmPath, JSON.stringify(mockVTM, null, 2))

      // Create mock TDD template
      const tddTemplate = `# Task Instructions: \${task.id} - \${task.title}

## Objective
\${task.description}

## Acceptance Criteria
\${acceptanceCriteriaList}

## Test Strategy: TDD

This is a TDD task with Wallaby MCP.

## File Operations
\${fileOperationsList}

## Dependencies
\${dependenciesList}

## Source Documents
\${sourceDocuments}`

      writeFileSync(join(templatePath, 'tdd.md'), tddTemplate)

      // Create mock Direct template
      const directTemplate = `# Task Instructions: \${task.id} - \${task.title}

## Objective
\${task.description}

## Acceptance Criteria
\${acceptanceCriteriaList}

## Test Strategy: Direct

Manual verification required.

## File Operations
\${fileOperationsList}`

      writeFileSync(join(templatePath, 'direct.md'), directTemplate)
    })

    it('should generate instructions for TDD task', async () => {
      const builder = new InstructionBuilder({
        vtmPath,
        templatePath,
      })

      const instructions = await builder.buildInstructions('TASK-002')

      // Verify instruction content
      expect(instructions).toContain('TASK-002')
      expect(instructions).toContain('Implement authentication')
      expect(instructions).toContain('Implement JWT-based authentication')
      expect(instructions).toContain('Test Strategy: TDD')
      expect(instructions).toContain('Wallaby MCP')
    })

    it('should generate instructions for Direct task', async () => {
      const builder = new InstructionBuilder({
        vtmPath,
        templatePath,
      })

      const instructions = await builder.buildInstructions('TASK-001')

      expect(instructions).toContain('TASK-001')
      expect(instructions).toContain('Database setup')
      expect(instructions).toContain('Test Strategy: Direct')
      expect(instructions).toContain('Manual verification')
    })

    it('should throw error if task not found', async () => {
      const builder = new InstructionBuilder({
        vtmPath,
        templatePath,
      })

      await expect(builder.buildInstructions('TASK-999')).rejects.toThrow('Task TASK-999 not found')
    })

    it('should throw error if template not found', async () => {
      // Create VTM with Unit task but no unit.md template
      const mockVTM: VTM = {
        version: '1.0.0',
        project: { name: 'Test', description: 'Test' },
        stats: {
          total_tasks: 1,
          completed: 0,
          in_progress: 0,
          pending: 1,
          blocked: 0,
        },
        tasks: [
          {
            id: 'TASK-003',
            title: 'Test task',
            description: 'Test',
            acceptance_criteria: ['AC1'],
            dependencies: [],
            blocks: [],
            test_strategy: 'Unit',
            test_strategy_rationale: 'Unit testing',
            estimated_hours: 4,
            risk: 'medium',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
            adr_source: '',
            spec_source: '',
          },
        ],
      }

      writeFileSync(vtmPath, JSON.stringify(mockVTM, null, 2))

      const builder = new InstructionBuilder({
        vtmPath,
        templatePath,
      })

      await expect(builder.buildInstructions('TASK-003')).rejects.toThrow(/Template not found/)
    })
  })

  describe('template interpolation', () => {
    beforeEach(() => {
      // Create VTM with various task configurations
      const mockVTM: VTM = {
        version: '1.0.0',
        project: { name: 'Test', description: 'Test' },
        stats: {
          total_tasks: 3,
          completed: 1,
          in_progress: 0,
          pending: 2,
          blocked: 0,
        },
        tasks: [
          {
            id: 'TASK-001',
            title: 'Completed task',
            description: 'A completed dependency',
            acceptance_criteria: ['AC1'],
            dependencies: [],
            blocks: ['TASK-002'],
            test_strategy: 'TDD',
            test_strategy_rationale: 'TDD',
            estimated_hours: 4,
            risk: 'medium',
            files: { create: [], modify: [], delete: [] },
            status: 'completed',
            started_at: '2024-01-01',
            completed_at: '2024-01-02',
            commits: [],
            validation: { tests_pass: true, ac_verified: [] },
            adr_source: '',
            spec_source: '',
          },
          {
            id: 'TASK-002',
            title: 'Task with dependencies',
            description: 'Task that depends on TASK-001',
            acceptance_criteria: ['First acceptance criterion', 'Second acceptance criterion'],
            dependencies: ['TASK-001'],
            blocks: ['TASK-003'],
            test_strategy: 'TDD',
            test_strategy_rationale: 'TDD',
            estimated_hours: 6,
            risk: 'high',
            files: {
              create: ['src/foo.ts', 'src/bar.ts'],
              modify: ['src/index.ts'],
              delete: ['src/old.ts'],
            },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
            adr_source: 'docs/adr/ADR-002.md',
            spec_source: 'docs/specs/spec-002.md',
          },
          {
            id: 'TASK-003',
            title: 'Blocked task',
            description: 'Task blocked by TASK-002',
            acceptance_criteria: [],
            dependencies: ['TASK-002'],
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'TDD',
            estimated_hours: 4,
            risk: 'low',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
            adr_source: '',
            spec_source: '',
          },
        ],
      }

      writeFileSync(vtmPath, JSON.stringify(mockVTM, null, 2))

      // Create template with all variables
      const template = `Task: \${task.id}
Title: \${task.title}
Description: \${task.description}

Acceptance Criteria:
\${acceptanceCriteriaList}

Files:
\${fileOperationsList}

Dependencies:
\${dependenciesList}

Blocked Tasks:
\${blockedTasksList}

Source Documents:
\${sourceDocuments}`

      writeFileSync(join(templatePath, 'tdd.md'), template)
    })

    it('should interpolate task.id correctly', async () => {
      const builder = new InstructionBuilder({ vtmPath, templatePath })
      const instructions = await builder.buildInstructions('TASK-002')

      expect(instructions).toContain('Task: TASK-002')
    })

    it('should interpolate task.title correctly', async () => {
      const builder = new InstructionBuilder({ vtmPath, templatePath })
      const instructions = await builder.buildInstructions('TASK-002')

      expect(instructions).toContain('Title: Task with dependencies')
    })

    it('should format acceptance criteria as checklist', async () => {
      const builder = new InstructionBuilder({ vtmPath, templatePath })
      const instructions = await builder.buildInstructions('TASK-002')

      expect(instructions).toContain('- [ ] First acceptance criterion')
      expect(instructions).toContain('- [ ] Second acceptance criterion')
    })

    it('should format file operations with create/modify/delete', async () => {
      const builder = new InstructionBuilder({ vtmPath, templatePath })
      const instructions = await builder.buildInstructions('TASK-002')

      expect(instructions).toContain('**Create:**')
      expect(instructions).toContain('- src/foo.ts')
      expect(instructions).toContain('- src/bar.ts')
      expect(instructions).toContain('**Modify:**')
      expect(instructions).toContain('- src/index.ts')
      expect(instructions).toContain('**Delete:**')
      expect(instructions).toContain('- src/old.ts')
    })

    it('should format dependencies with completion status', async () => {
      const builder = new InstructionBuilder({ vtmPath, templatePath })
      const instructions = await builder.buildInstructions('TASK-002')

      expect(instructions).toContain('✅ TASK-001: Completed task (completed)')
    })

    it('should format blocked tasks', async () => {
      const builder = new InstructionBuilder({ vtmPath, templatePath })
      const instructions = await builder.buildInstructions('TASK-002')

      expect(instructions).toContain('TASK-003: Blocked task')
    })

    it('should format source documents', async () => {
      const builder = new InstructionBuilder({ vtmPath, templatePath })
      const instructions = await builder.buildInstructions('TASK-002')

      expect(instructions).toContain('**ADR (Architecture Decision Record):**')
      expect(instructions).toContain('- docs/adr/ADR-002.md')
      expect(instructions).toContain('**Spec (Technical Specification):**')
      expect(instructions).toContain('- docs/specs/spec-002.md')
    })
  })

  describe('edge cases', () => {
    beforeEach(() => {
      // Create VTM with edge case tasks
      const mockVTM: VTM = {
        version: '1.0.0',
        project: { name: 'Test', description: 'Test' },
        stats: {
          total_tasks: 1,
          completed: 0,
          in_progress: 0,
          pending: 1,
          blocked: 0,
        },
        tasks: [
          {
            id: 'TASK-001',
            title: 'Edge case task',
            description: 'Task with empty/null fields',
            acceptance_criteria: [],
            dependencies: [],
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'TDD',
            estimated_hours: 2,
            risk: 'low',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
            adr_source: '',
            spec_source: '',
          },
        ],
      }

      writeFileSync(vtmPath, JSON.stringify(mockVTM, null, 2))

      const template = `AC: \${acceptanceCriteriaList}
Files: \${fileOperationsList}
Deps: \${dependenciesList}
Blocked: \${blockedTasksList}
Docs: \${sourceDocuments}`

      writeFileSync(join(templatePath, 'tdd.md'), template)
    })

    it('should handle empty acceptance criteria', async () => {
      const builder = new InstructionBuilder({ vtmPath, templatePath })
      const instructions = await builder.buildInstructions('TASK-001')

      expect(instructions).toContain('_No acceptance criteria defined_')
    })

    it('should handle empty file operations', async () => {
      const builder = new InstructionBuilder({ vtmPath, templatePath })
      const instructions = await builder.buildInstructions('TASK-001')

      expect(instructions).toContain('_No file operations specified_')
    })

    it('should handle empty dependencies', async () => {
      const builder = new InstructionBuilder({ vtmPath, templatePath })
      const instructions = await builder.buildInstructions('TASK-001')

      expect(instructions).toContain('_No dependencies_')
    })

    it('should handle empty blocked tasks', async () => {
      const builder = new InstructionBuilder({ vtmPath, templatePath })
      const instructions = await builder.buildInstructions('TASK-001')

      expect(instructions).toContain('_No tasks are blocked by this task_')
    })

    it('should handle empty source documents', async () => {
      const builder = new InstructionBuilder({ vtmPath, templatePath })
      const instructions = await builder.buildInstructions('TASK-001')

      expect(instructions).toContain('_No source documents specified_')
    })
  })

  describe('buildInstructionsWithContext', () => {
    it('should generate instructions from TaskWithDependencies', async () => {
      const mockVTM: VTM = {
        version: '1.0.0',
        project: { name: 'Test', description: 'Test' },
        stats: {
          total_tasks: 1,
          completed: 0,
          in_progress: 0,
          pending: 1,
          blocked: 0,
        },
        tasks: [
          {
            id: 'TASK-001',
            title: 'Test task',
            description: 'Test description',
            acceptance_criteria: ['AC1'],
            dependencies: [],
            blocks: [],
            test_strategy: 'TDD',
            test_strategy_rationale: 'TDD',
            estimated_hours: 4,
            risk: 'medium',
            files: { create: [], modify: [], delete: [] },
            status: 'pending',
            started_at: null,
            completed_at: null,
            commits: [],
            validation: { tests_pass: false, ac_verified: [] },
            adr_source: '',
            spec_source: '',
          },
        ],
      }

      writeFileSync(vtmPath, JSON.stringify(mockVTM, null, 2))

      const template = `Task: \${task.id}`
      writeFileSync(join(templatePath, 'tdd.md'), template)

      const reader = new VTMReader(vtmPath)
      const taskContext = await reader.getTaskWithContext('TASK-001')

      const builder = new InstructionBuilder({ reader, templatePath })
      const instructions = await builder.buildInstructionsWithContext(taskContext)

      expect(instructions).toContain('Task: TASK-001')
    })
  })
})
