// src/lib/__tests__/vtm-git-cli.test.ts

import { execSync } from 'child_process'
import path from 'path'
import fs from 'fs'
import os from 'os'

describe('VTMGitCLI Integration Tests', () => {
  let testDir: string
  let cliPath: string

  beforeEach(() => {
    // Create a temporary directory for each test
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vtm-git-cli-test-'))

    // Initialize a git repository
    execSync('git init', { cwd: testDir })
    execSync('git config user.email "test@example.com"', { cwd: testDir })
    execSync('git config user.name "Test User"', { cwd: testDir })

    // Create initial commit on main branch
    fs.writeFileSync(path.join(testDir, 'README.md'), '# Test Project')
    execSync('git add .', { cwd: testDir })
    execSync('git commit -m "Initial commit"', { cwd: testDir })

    // Ensure we're on main branch
    try {
      execSync('git checkout -b main', { cwd: testDir })
    } catch {
      // Branch might already exist
    }

    // Path to the CLI script (will be in dist after build)
    cliPath = path.join(process.cwd(), 'dist', 'lib', 'vtm-git-cli.js')
  })

  afterEach(() => {
    // Clean up the test directory
    fs.rmSync(testDir, { recursive: true, force: true })
  })

  describe('ensure-clean command', () => {
    it('should create a feature branch when working directory is clean', () => {
      const result = execSync(`node "${cliPath}" ensure-clean TASK-042 feature`, {
        cwd: testDir,
        encoding: 'utf-8',
      })

      expect(result.trim()).toBe('feature/TASK-042')

      // Verify branch was created
      const branches = execSync('git branch', { cwd: testDir, encoding: 'utf-8' })
      expect(branches).toContain('feature/TASK-042')
    })

    it('should exit with error when working directory is dirty', () => {
      // Make working directory dirty
      fs.writeFileSync(path.join(testDir, 'test.txt'), 'dirty file')

      expect(() => {
        execSync(`node "${cliPath}" ensure-clean TASK-042 feature`, {
          cwd: testDir,
          encoding: 'utf-8',
        })
      }).toThrow()
    })

    it('should show usage when arguments are missing', () => {
      expect(() => {
        execSync(`node "${cliPath}" ensure-clean`, {
          cwd: testDir,
          encoding: 'utf-8',
        })
      }).toThrow(/Usage/)
    })

    it('should create branches with different task types', () => {
      const taskTypes = ['feature', 'bugfix', 'refactor', 'chore', 'docs', 'test']

      taskTypes.forEach((type, index) => {
        const taskId = `TASK-${String(index + 1).padStart(3, '0')}`
        const result = execSync(`node "${cliPath}" ensure-clean ${taskId} ${type}`, {
          cwd: testDir,
          encoding: 'utf-8',
        })

        expect(result.trim()).toBe(`${type}/${taskId}`)
      })
    })
  })

  describe('commit-merge command', () => {
    beforeEach(() => {
      // Create and checkout a feature branch
      execSync('git checkout -b feature/TASK-042', { cwd: testDir })
    })

    it('should commit changes and merge to main', () => {
      // Make some changes
      fs.writeFileSync(path.join(testDir, 'feature.txt'), 'new feature')

      const result = execSync(`node "${cliPath}" commit-merge TASK-042 "Add new feature" feature`, {
        cwd: testDir,
        encoding: 'utf-8',
      })

      expect(result).toContain('Successfully merged')

      // Verify we're on main branch
      const currentBranch = execSync('git branch --show-current', {
        cwd: testDir,
        encoding: 'utf-8',
      }).trim()
      expect(currentBranch).toBe('main')

      // Verify commit exists
      const log = execSync('git log --oneline', { cwd: testDir, encoding: 'utf-8' })
      expect(log).toContain('TASK-042')
      expect(log).toContain('Add new feature')
    })

    it('should merge even when there are no uncommitted changes', () => {
      // Make and commit changes
      fs.writeFileSync(path.join(testDir, 'feature.txt'), 'new feature')
      execSync('git add .', { cwd: testDir })
      execSync('git commit -m "Manual commit"', { cwd: testDir })

      const result = execSync(`node "${cliPath}" commit-merge TASK-042 "Add new feature" feature`, {
        cwd: testDir,
        encoding: 'utf-8',
      })

      expect(result).toContain('Successfully merged')
    })

    it('should use default task type when not specified', () => {
      // Make some changes
      fs.writeFileSync(path.join(testDir, 'feature.txt'), 'new feature')

      const result = execSync(`node "${cliPath}" commit-merge TASK-042 "Add new feature"`, {
        cwd: testDir,
        encoding: 'utf-8',
      })

      expect(result).toContain('Successfully merged')

      // Verify commit has default type
      const log = execSync('git log --oneline', { cwd: testDir, encoding: 'utf-8' })
      expect(log).toContain('feat(TASK-042)')
    })

    it('should show usage when arguments are missing', () => {
      expect(() => {
        execSync(`node "${cliPath}" commit-merge`, {
          cwd: testDir,
          encoding: 'utf-8',
        })
      }).toThrow(/Usage/)
    })
  })

  describe('cleanup command', () => {
    beforeEach(() => {
      // Create a feature branch and switch back to main
      execSync('git checkout -b feature/TASK-042', { cwd: testDir })
      execSync('git checkout main', { cwd: testDir })
    })

    it('should delete a merged branch', () => {
      const result = execSync(`node "${cliPath}" cleanup feature/TASK-042`, {
        cwd: testDir,
        encoding: 'utf-8',
      })

      expect(result).toContain('deleted successfully')

      // Verify branch was deleted
      const branches = execSync('git branch', { cwd: testDir, encoding: 'utf-8' })
      expect(branches).not.toContain('feature/TASK-042')
    })

    it('should force delete an unmerged branch with --force flag', () => {
      // Make a commit on the feature branch
      execSync('git checkout feature/TASK-042', { cwd: testDir })
      fs.writeFileSync(path.join(testDir, 'feature.txt'), 'unmerged changes')
      execSync('git add .', { cwd: testDir })
      execSync('git commit -m "Unmerged commit"', { cwd: testDir })
      execSync('git checkout main', { cwd: testDir })

      const result = execSync(`node "${cliPath}" cleanup feature/TASK-042 --force`, {
        cwd: testDir,
        encoding: 'utf-8',
      })

      expect(result).toContain('deleted successfully')

      // Verify branch was deleted
      const branches = execSync('git branch', { cwd: testDir, encoding: 'utf-8' })
      expect(branches).not.toContain('feature/TASK-042')
    })

    it('should show usage when branch name is missing', () => {
      expect(() => {
        execSync(`node "${cliPath}" cleanup`, {
          cwd: testDir,
          encoding: 'utf-8',
        })
      }).toThrow(/Usage/)
    })

    it('should fail to delete unmerged branch without --force', () => {
      // Make a commit on the feature branch
      execSync('git checkout feature/TASK-042', { cwd: testDir })
      fs.writeFileSync(path.join(testDir, 'feature.txt'), 'unmerged changes')
      execSync('git add .', { cwd: testDir })
      execSync('git commit -m "Unmerged commit"', { cwd: testDir })
      execSync('git checkout main', { cwd: testDir })

      expect(() => {
        execSync(`node "${cliPath}" cleanup feature/TASK-042`, {
          cwd: testDir,
          encoding: 'utf-8',
        })
      }).toThrow()
    })
  })

  describe('error handling', () => {
    it('should show error message for unknown command', () => {
      expect(() => {
        execSync(`node "${cliPath}" unknown-command`, {
          cwd: testDir,
          encoding: 'utf-8',
        })
      }).toThrow(/Unknown command/)
    })

    it('should show usage when no command is provided', () => {
      expect(() => {
        execSync(`node "${cliPath}"`, {
          cwd: testDir,
          encoding: 'utf-8',
        })
      }).toThrow(/Usage/)
    })

    it('should provide suggestions on GitError', () => {
      // Make working directory dirty
      fs.writeFileSync(path.join(testDir, 'test.txt'), 'dirty file')

      try {
        execSync(`node "${cliPath}" ensure-clean TASK-042 feature`, {
          cwd: testDir,
          encoding: 'utf-8',
          stdio: 'pipe',
        })
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'stderr' in error) {
          const stderr = (error as { stderr: Buffer }).stderr.toString()
          expect(stderr).toContain('Suggestions')
          expect(stderr).toContain('git add')
        }
      }
    })
  })

  describe('exit codes', () => {
    it('should exit with 0 on success', () => {
      const result = execSync(`node "${cliPath}" ensure-clean TASK-042 feature`, {
        cwd: testDir,
        encoding: 'utf-8',
      })

      expect(result).toBeTruthy() // Command succeeded
    })

    it('should exit with 1 on error', () => {
      // Make working directory dirty
      fs.writeFileSync(path.join(testDir, 'test.txt'), 'dirty file')

      let exitCode = 0
      try {
        execSync(`node "${cliPath}" ensure-clean TASK-042 feature`, {
          cwd: testDir,
          encoding: 'utf-8',
        })
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'status' in error) {
          exitCode = (error as { status: number }).status
        }
      }

      expect(exitCode).toBe(1)
    })
  })

  describe('stdout/stderr separation', () => {
    it('should output success message to stdout', () => {
      const result = execSync(`node "${cliPath}" ensure-clean TASK-042 feature`, {
        cwd: testDir,
        encoding: 'utf-8',
      })

      expect(result.trim()).toBe('feature/TASK-042')
    })

    it('should output error message to stderr', () => {
      // Make working directory dirty
      fs.writeFileSync(path.join(testDir, 'test.txt'), 'dirty file')

      try {
        execSync(`node "${cliPath}" ensure-clean TASK-042 feature`, {
          cwd: testDir,
          encoding: 'utf-8',
          stdio: 'pipe',
        })
      } catch (error: unknown) {
        if (error && typeof error === 'object' && 'stderr' in error) {
          const stderr = (error as { stderr: Buffer }).stderr.toString()
          expect(stderr).toContain('Error')
        }
      }
    })
  })
})
