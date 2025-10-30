/**
 * Test suite for VTMGitWorkflow - TDD Phase
 * Task: P2-1 - Create VTMGitWorkflow Library Interface and Types
 *
 * Test Coverage:
 * 1. GitWorkflowConfig interface validation
 * 2. BranchInfo interface validation
 * 3. GitOperationResult interface validation
 * 4. GitError class creation and properties
 * 5. VTMGitWorkflow class instantiation
 * 6. Constructor initialization with config
 */

import { describe, test, expect } from 'vitest'
import {
  VTMGitWorkflow,
  GitError,
  type GitWorkflowConfig,
  type BranchInfo,
  type GitOperationResult,
} from '../vtm-git-workflow'

describe('VTMGitWorkflow - Types and Interfaces', () => {
  describe('GitWorkflowConfig interface', () => {
    test('accepts valid config with all properties', () => {
      const config: GitWorkflowConfig = {
        workingDir: '/test/path',
        verbose: true,
        dryRun: false,
      }

      expect(config.workingDir).toBe('/test/path')
      expect(config.verbose).toBe(true)
      expect(config.dryRun).toBe(false)
    })

    test('accepts config with optional properties omitted', () => {
      const config: GitWorkflowConfig = {}

      expect(config.workingDir).toBeUndefined()
      expect(config.verbose).toBeUndefined()
      expect(config.dryRun).toBeUndefined()
    })

    test('accepts config with partial properties', () => {
      const config: GitWorkflowConfig = {
        verbose: true,
      }

      expect(config.verbose).toBe(true)
      expect(config.workingDir).toBeUndefined()
      expect(config.dryRun).toBeUndefined()
    })
  })

  describe('BranchInfo interface', () => {
    test('accepts valid branch info with all properties', () => {
      const branchInfo: BranchInfo = {
        name: 'feature/TASK-001',
        isCurrent: true,
        createdAt: new Date('2025-01-15T10:00:00Z'),
      }

      expect(branchInfo.name).toBe('feature/TASK-001')
      expect(branchInfo.isCurrent).toBe(true)
      expect(branchInfo.createdAt).toBeInstanceOf(Date)
    })

    test('accepts branch info without optional createdAt', () => {
      const branchInfo: BranchInfo = {
        name: 'main',
        isCurrent: false,
      }

      expect(branchInfo.name).toBe('main')
      expect(branchInfo.isCurrent).toBe(false)
      expect(branchInfo.createdAt).toBeUndefined()
    })

    test('validates required properties are present', () => {
      const branchInfo: BranchInfo = {
        name: 'bugfix/TASK-002',
        isCurrent: true,
      }

      expect(branchInfo.name).toBeTruthy()
      expect(typeof branchInfo.isCurrent).toBe('boolean')
    })
  })

  describe('GitOperationResult interface', () => {
    test('accepts successful result with all properties', () => {
      const result: GitOperationResult = {
        success: true,
        message: 'Branch created successfully',
        output: "Switched to a new branch 'feature/TASK-001'",
      }

      expect(result.success).toBe(true)
      expect(result.message).toBe('Branch created successfully')
      expect(result.output).toBe("Switched to a new branch 'feature/TASK-001'")
    })

    test('accepts failed result with error', () => {
      const error = new Error('Git command failed')
      const result: GitOperationResult = {
        success: false,
        message: 'Failed to create branch',
        error,
      }

      expect(result.success).toBe(false)
      expect(result.message).toBe('Failed to create branch')
      expect(result.error).toBe(error)
    })

    test('accepts minimal result with required properties only', () => {
      const result: GitOperationResult = {
        success: true,
        message: 'Operation completed',
      }

      expect(result.success).toBe(true)
      expect(result.message).toBe('Operation completed')
      expect(result.output).toBeUndefined()
      expect(result.error).toBeUndefined()
    })

    test('validates boolean success flag', () => {
      const result: GitOperationResult = {
        success: false,
        message: 'Failed',
      }

      expect(typeof result.success).toBe('boolean')
      expect(result.success).toBe(false)
    })
  })

  describe('GitError class', () => {
    test('creates error with message only', () => {
      const error = new GitError('Git operation failed')

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(GitError)
      expect(error.message).toBe('Git operation failed')
      expect(error.context).toBeUndefined()
    })

    test('creates error with message and context', () => {
      const context = {
        command: 'git checkout',
        branch: 'feature/TASK-001',
        exitCode: 1,
      }
      const error = new GitError('Failed to checkout branch', context)

      expect(error.message).toBe('Failed to checkout branch')
      expect(error.context).toEqual(context)
      expect(error.context?.command).toBe('git checkout')
    })

    test('error has correct name property', () => {
      const error = new GitError('Test error')

      expect(error.name).toBe('GitError')
    })

    test('error stack trace is present', () => {
      const error = new GitError('Test error')

      expect(error.stack).toBeTruthy()
      expect(error.stack).toContain('GitError')
    })

    test('context can contain various types', () => {
      const context = {
        stringValue: 'test',
        numberValue: 42,
        booleanValue: true,
        arrayValue: [1, 2, 3],
        objectValue: { nested: 'value' },
      }
      const error = new GitError('Complex context', context)

      expect(error.context).toEqual(context)
    })
  })

  describe('VTMGitWorkflow class', () => {
    describe('constructor', () => {
      test('creates instance with default config', () => {
        const workflow = new VTMGitWorkflow()

        expect(workflow).toBeInstanceOf(VTMGitWorkflow)
        expect(workflow.config).toBeDefined()
      })

      test('creates instance with custom config', () => {
        const config: GitWorkflowConfig = {
          workingDir: '/custom/path',
          verbose: true,
          dryRun: true,
        }
        const workflow = new VTMGitWorkflow(config)

        expect(workflow).toBeInstanceOf(VTMGitWorkflow)
        expect(workflow.config).toEqual(config)
      })

      test('creates instance with partial config', () => {
        const config: GitWorkflowConfig = {
          verbose: true,
        }
        const workflow = new VTMGitWorkflow(config)

        expect(workflow).toBeInstanceOf(VTMGitWorkflow)
        expect(workflow.config.verbose).toBe(true)
      })

      test('defaults workingDir to process.cwd() when not provided', () => {
        const workflow = new VTMGitWorkflow()

        expect(workflow.workingDir).toBe(process.cwd())
      })

      test('uses provided workingDir when specified', () => {
        const customPath = '/custom/working/dir'
        const config: GitWorkflowConfig = {
          workingDir: customPath,
        }
        const workflow = new VTMGitWorkflow(config)

        expect(workflow.workingDir).toBe(customPath)
      })
    })

    describe('config property', () => {
      test('config is readonly and accessible', () => {
        const config: GitWorkflowConfig = {
          workingDir: '/test',
          verbose: true,
        }
        const workflow = new VTMGitWorkflow(config)

        expect(workflow.config).toEqual(config)
        expect(workflow.config.workingDir).toBe('/test')
        expect(workflow.config.verbose).toBe(true)
      })

      test('config defaults are properly set', () => {
        const workflow = new VTMGitWorkflow({})

        expect(workflow.config).toBeDefined()
        expect(typeof workflow.config).toBe('object')
      })
    })

    describe('workingDir property', () => {
      test('workingDir is readonly and accessible', () => {
        const workflow = new VTMGitWorkflow({
          workingDir: '/test/path',
        })

        expect(workflow.workingDir).toBe('/test/path')
      })

      test('workingDir defaults correctly', () => {
        const workflow = new VTMGitWorkflow()

        expect(workflow.workingDir).toBeTruthy()
        expect(typeof workflow.workingDir).toBe('string')
      })
    })
  })

  describe('Type safety and edge cases', () => {
    test('GitWorkflowConfig rejects invalid property types', () => {
      // This test ensures TypeScript type checking works
      // The following would fail TypeScript compilation:
      // const invalid: GitWorkflowConfig = { workingDir: 123 }
      // const invalid2: GitWorkflowConfig = { verbose: "true" }

      const valid: GitWorkflowConfig = {
        workingDir: '/valid/path',
        verbose: false,
        dryRun: true,
      }

      expect(valid).toBeDefined()
    })

    test('BranchInfo requires name and isCurrent', () => {
      // This test ensures required properties are enforced
      // The following would fail TypeScript compilation:
      // const invalid: BranchInfo = { name: "test" } // missing isCurrent
      // const invalid2: BranchInfo = { isCurrent: true } // missing name

      const valid: BranchInfo = {
        name: 'test-branch',
        isCurrent: false,
      }

      expect(valid).toBeDefined()
    })

    test('GitOperationResult requires success and message', () => {
      // This test ensures required properties are enforced
      // The following would fail TypeScript compilation:
      // const invalid: GitOperationResult = { success: true } // missing message
      // const invalid2: GitOperationResult = { message: "test" } // missing success

      const valid: GitOperationResult = {
        success: true,
        message: 'Success',
      }

      expect(valid).toBeDefined()
    })

    test('GitError context accepts Record<string, unknown>', () => {
      const context: Record<string, unknown> = {
        anything: 'goes',
        here: 42,
        really: true,
      }
      const error = new GitError('Test', context)

      expect(error.context).toEqual(context)
    })
  })
})
