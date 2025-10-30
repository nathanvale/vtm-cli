import { describe, it, expect, beforeEach, vi } from 'vitest'
import { execFileSync } from 'child_process'
import { VTMGitWorkflow } from '../vtm-git-workflow'
import { GitError } from '../types'

// Mock execFileSync
vi.mock('child_process', () => ({
  execFileSync: vi.fn(),
}))

const mockedExecFileSync = execFileSync as ReturnType<typeof vi.fn>

describe('VTMGitWorkflow', () => {
  let workflow: VTMGitWorkflow

  beforeEach(() => {
    workflow = new VTMGitWorkflow()
    vi.clearAllMocks()
  })

  describe('constructor', () => {
    it('should initialize with default config', () => {
      expect(workflow.config).toBeDefined()
      expect(workflow.workingDir).toBe(process.cwd())
    })

    it('should accept custom config', () => {
      const customWorkflow = new VTMGitWorkflow({
        workingDir: '/custom/path',
        verbose: true,
        dryRun: true,
      })

      expect(customWorkflow.workingDir).toBe('/custom/path')
      expect(customWorkflow.config.verbose).toBe(true)
      expect(customWorkflow.config.dryRun).toBe(true)
    })
  })

  describe('ensureCleanAndCreateBranch', () => {
    it('should create branch with correct format', async () => {
      // Mock: in git repo
      mockedExecFileSync.mockReturnValueOnce(Buffer.from('')) // rev-parse
      // Mock: clean working directory
      mockedExecFileSync.mockReturnValueOnce('') // status --porcelain
      // Mock: checkout success
      mockedExecFileSync.mockReturnValueOnce(Buffer.from(''))

      const branchName = await workflow.ensureCleanAndCreateBranch('TASK-042', 'feature')

      expect(branchName).toBe('feature/TASK-042')
      expect(mockedExecFileSync).toHaveBeenCalledWith(
        'git',
        ['checkout', '-b', 'feature/TASK-042'],
        expect.objectContaining({ encoding: 'utf-8', stdio: 'pipe' }),
      )
    })

    it('should create branch for different task types', async () => {
      mockedExecFileSync
        .mockReturnValueOnce(Buffer.from('')) // rev-parse
        .mockReturnValueOnce('') // status --porcelain
        .mockReturnValueOnce(Buffer.from('')) // checkout

      const branchName = await workflow.ensureCleanAndCreateBranch('TASK-025', 'bugfix')

      expect(branchName).toBe('bugfix/TASK-025')
    })

    it('should throw GitError if not in git repository', async () => {
      // Mock: not in git repo
      mockedExecFileSync.mockImplementationOnce(() => {
        throw new Error('Not a git repository')
      })

      await expect(workflow.ensureCleanAndCreateBranch('TASK-042', 'feature')).rejects.toThrow(GitError)

      await expect(workflow.ensureCleanAndCreateBranch('TASK-042', 'feature')).rejects.toThrow('Not a git repository')
    })

    it('should throw GitError if working directory is dirty', async () => {
      // Mock: in git repo
      mockedExecFileSync.mockReturnValueOnce(Buffer.from('')) // rev-parse
      // Mock: dirty working directory
      mockedExecFileSync.mockReturnValueOnce('M modified-file.txt') // status --porcelain

      await expect(workflow.ensureCleanAndCreateBranch('TASK-042', 'feature')).rejects.toThrow(
        'Working directory is not clean',
      )
    })

    it('should throw GitError if branch creation fails', async () => {
      // Mock: in git repo
      mockedExecFileSync.mockReturnValueOnce(Buffer.from('')) // rev-parse
      // Mock: clean working directory
      mockedExecFileSync.mockReturnValueOnce('') // status --porcelain
      // Mock: branch creation fails
      mockedExecFileSync.mockImplementationOnce(() => {
        throw new Error('Branch already exists')
      })

      await expect(workflow.ensureCleanAndCreateBranch('TASK-042', 'feature')).rejects.toThrow(GitError)
    })
  })

  describe('commitAndMerge', () => {
    it('should commit changes and merge to main', async () => {
      // Mock: has uncommitted changes
      mockedExecFileSync.mockReturnValueOnce('M modified.txt') // status --porcelain
      // Mock: git add success
      mockedExecFileSync.mockReturnValueOnce(Buffer.from(''))
      // Mock: git commit success
      mockedExecFileSync.mockReturnValueOnce(Buffer.from(''))
      // Mock: get current branch
      mockedExecFileSync.mockReturnValueOnce('feature/TASK-042')
      // Mock: checkout main
      mockedExecFileSync.mockReturnValueOnce(Buffer.from(''))
      // Mock: merge
      mockedExecFileSync.mockReturnValueOnce(Buffer.from(''))

      const result = await workflow.commitAndMerge('TASK-042', 'Add authentication', 'feature')

      expect(result.success).toBe(true)
      expect(result.message).toContain('merged')
      expect(mockedExecFileSync).toHaveBeenCalledWith(
        'git',
        ['commit', '-m', 'feature(TASK-042): Add authentication'],
        expect.objectContaining({ encoding: 'utf-8' }),
      )
    })

    it('should skip commit if no changes', async () => {
      // Mock: no uncommitted changes
      mockedExecFileSync.mockReturnValueOnce('') // status --porcelain (clean)
      // Mock: get current branch
      mockedExecFileSync.mockReturnValueOnce('feature/TASK-042')
      // Mock: checkout main
      mockedExecFileSync.mockReturnValueOnce(Buffer.from(''))
      // Mock: merge
      mockedExecFileSync.mockReturnValueOnce(Buffer.from(''))

      const result = await workflow.commitAndMerge('TASK-042', 'Add auth', 'feature')

      expect(result.success).toBe(true)
      // Should not have called 'git add' or 'git commit'
      expect(mockedExecFileSync).not.toHaveBeenCalledWith('git', ['add', expect.anything()], expect.anything())
    })

    it("should use default type 'feat' if not provided", async () => {
      // Mock: has changes
      mockedExecFileSync.mockReturnValueOnce('M file.txt')
      // Mock: add
      mockedExecFileSync.mockReturnValueOnce(Buffer.from(''))
      // Mock: commit
      mockedExecFileSync.mockReturnValueOnce(Buffer.from(''))
      // Mock: get branch
      mockedExecFileSync.mockReturnValueOnce('feature/TASK-042')
      // Mock: checkout
      mockedExecFileSync.mockReturnValueOnce(Buffer.from(''))
      // Mock: merge
      mockedExecFileSync.mockReturnValueOnce(Buffer.from(''))

      await workflow.commitAndMerge('TASK-042', 'Add feature')

      expect(mockedExecFileSync).toHaveBeenCalledWith(
        'git',
        ['commit', '-m', 'feat(TASK-042): Add feature'],
        expect.objectContaining({ encoding: 'utf-8' }),
      )
    })

    // Note: commitAndMerge only accepts 3 parameters and always merges to 'main'
    // Custom target branch is not supported in current implementation

    it('should throw GitError if commit fails', async () => {
      // Mock: has changes
      mockedExecFileSync.mockReturnValueOnce('M file.txt')
      // Mock: add success
      mockedExecFileSync.mockReturnValueOnce(Buffer.from(''))
      // Mock: commit fails
      mockedExecFileSync.mockImplementationOnce(() => {
        throw new Error('Commit failed')
      })

      await expect(workflow.commitAndMerge('TASK-042', 'Add feature', 'feature')).rejects.toThrow(GitError)
    })

    it('should throw GitError if merge fails', async () => {
      // Mock: no changes
      mockedExecFileSync.mockReturnValueOnce('')
      // Mock: get branch
      mockedExecFileSync.mockReturnValueOnce('feature/TASK-042')
      // Mock: checkout main success
      mockedExecFileSync.mockReturnValueOnce(Buffer.from(''))
      // Mock: merge fails
      mockedExecFileSync.mockImplementationOnce(() => {
        throw new Error('Merge conflict')
      })

      await expect(workflow.commitAndMerge('TASK-042', 'Add feature', 'feature')).rejects.toThrow(GitError)
    })
  })

  describe('cleanupBranch', () => {
    it('should delete branch successfully', async () => {
      mockedExecFileSync.mockReturnValueOnce(Buffer.from(''))

      await workflow.cleanupBranch('feature/TASK-042')

      expect(mockedExecFileSync).toHaveBeenCalledWith(
        'git',
        ['branch', '-d', 'feature/TASK-042'],
        expect.objectContaining({ encoding: 'utf-8', stdio: 'pipe' }),
      )
    })

    it('should force delete when force=true', async () => {
      mockedExecFileSync.mockReturnValueOnce(Buffer.from(''))

      await workflow.cleanupBranch('feature/TASK-042', true)

      expect(mockedExecFileSync).toHaveBeenCalledWith(
        'git',
        ['branch', '-D', 'feature/TASK-042'],
        expect.objectContaining({ encoding: 'utf-8' }),
      )
    })

    it('should throw GitError if deletion fails', async () => {
      mockedExecFileSync.mockImplementationOnce(() => {
        throw new Error('Cannot delete branch')
      })

      await expect(workflow.cleanupBranch('feature/TASK-042')).rejects.toThrow(GitError)

      await expect(workflow.cleanupBranch('feature/TASK-042')).rejects.toThrow('Failed to delete branch')
    })
  })

  describe('validateBranchName', () => {
    it('should validate correct branch name formats', () => {
      expect(workflow.validateBranchName('feature/TASK-042')).toBe(true)
      expect(workflow.validateBranchName('bugfix/TASK-025')).toBe(true)
      expect(workflow.validateBranchName('refactor/TASK-100')).toBe(true)
      expect(workflow.validateBranchName('chore/TASK-001')).toBe(true)
    })

    it('should reject invalid branch name formats', () => {
      expect(workflow.validateBranchName('TASK-042')).toBe(false)
      expect(workflow.validateBranchName('feature-TASK-042')).toBe(false)
      expect(workflow.validateBranchName('feature/task-042')).toBe(false)
      expect(workflow.validateBranchName('invalid/TASK-042')).toBe(false)
    })
  })

  describe('validateTaskId', () => {
    it('should validate correct task ID formats', () => {
      expect(workflow.validateTaskId('TASK-001')).toBe(true)
      expect(workflow.validateTaskId('TASK-042')).toBe(true)
      expect(workflow.validateTaskId('TASK-999')).toBe(true)
      expect(workflow.validateTaskId('TASK-1')).toBe(true)
    })

    it('should reject invalid task ID formats', () => {
      expect(workflow.validateTaskId('TASK')).toBe(false)
      expect(workflow.validateTaskId('task-042')).toBe(false)
      expect(workflow.validateTaskId('TASK042')).toBe(false)
      expect(workflow.validateTaskId('042')).toBe(false)
    })
  })

  describe('validateTaskType', () => {
    it('should validate allowed task types', () => {
      expect(workflow.validateTaskType('feature')).toBe(true)
      expect(workflow.validateTaskType('bugfix')).toBe(true)
      expect(workflow.validateTaskType('refactor')).toBe(true)
      expect(workflow.validateTaskType('chore')).toBe(true)
      expect(workflow.validateTaskType('docs')).toBe(true)
      expect(workflow.validateTaskType('test')).toBe(true)
    })

    it('should reject invalid task types', () => {
      expect(workflow.validateTaskType('Feature')).toBe(false)
      expect(workflow.validateTaskType('feat')).toBe(false)
      expect(workflow.validateTaskType('bug')).toBe(false)
      expect(workflow.validateTaskType('invalid')).toBe(false)
    })
  })
})
