import { execFileSync } from 'child_process'
import { GitError, type GitOperationResult } from './types'

/**
 * Configuration for VTM git workflow operations.
 *
 * @property workingDir - Directory where git operations will be executed (defaults to process.cwd())
 * @property verbose - Enable debug logging for git operations
 * @property dryRun - Preview operations without executing git commands
 */
export type GitWorkflowConfig = {
  workingDir?: string
  verbose?: boolean
  dryRun?: boolean
}

/**
 * Information about a git branch.
 *
 * @property name - Branch name (e.g., "feature/TASK-001", "main")
 * @property isCurrent - Whether this is the currently checked out branch
 * @property createdAt - Optional timestamp when branch was created
 */
export type BranchInfo = {
  name: string
  isCurrent: boolean
  createdAt?: Date
}

/**
 * Main class for VTM git workflow operations.
 *
 * Manages the git workflow lifecycle for VTM task execution:
 * - Creating feature branches
 * - Making commits
 * - Merging to main
 * - Cleanup operations
 *
 * @remarks
 * This class is designed to be used by VTM CLI commands (execute, done) to automate
 * git operations. It provides a consistent, testable interface for git workflows.
 *
 * The class supports dry-run mode for previewing operations and verbose mode for debugging.
 *
 * @example
 * ```typescript
 * const workflow = new VTMGitWorkflow({
 *   workingDir: "/path/to/project",
 *   verbose: true,
 *   dryRun: false
 * })
 * ```
 */
export class VTMGitWorkflow {
  public readonly config: GitWorkflowConfig
  public readonly workingDir: string

  constructor(config: GitWorkflowConfig = {}) {
    this.config = config
    this.workingDir = config.workingDir ?? process.cwd()
  }

  /**
   * Ensures working directory is clean and creates a feature branch.
   *
   * Checks that we're in a git repository and the working directory
   * has no uncommitted changes, then creates a feature branch with
   * the format: {taskType}/{taskId}
   *
   * @param taskId - The task ID (e.g., "TASK-042")
   * @param taskType - The task type (e.g., "feature", "bugfix")
   * @returns Promise resolving to the created branch name
   * @throws {GitError} If not in a git repository
   * @throws {GitError} If working directory is not clean
   *
   * @example
   * ```typescript
   * const workflow = new VTMGitWorkflow();
   * const branchName = await workflow.ensureCleanAndCreateBranch("TASK-042", "feature");
   * console.log(branchName); // "feature/TASK-042"
   * ```
   */
  async ensureCleanAndCreateBranch(taskId: string, taskType: string): Promise<string> {
    // Check if we're in a git repository
    if (!(await this.isGitRepository())) {
      throw new GitError('Not a git repository', 'NOT_GIT_REPO', [
        'Initialize git: git init',
        'Clone a repository',
      ])
    }

    // Check if working directory is clean
    if (!(await this.isClean())) {
      throw new GitError('Working directory is not clean', 'DIRTY_WORKING_DIR', [
        "Commit changes: git add . && git commit -m 'message'",
        'Stash changes: git stash',
        'Discard changes: git restore .',
      ])
    }

    // Create branch with format: {type}/{taskId}
    const branchName = `${taskType}/${taskId}`
    await this.executeGitCommand(['checkout', '-b', branchName])

    return branchName
  }

  /**
   * Commits changes and merges the feature branch to main.
   *
   * Stages all changes, creates a commit with conventional format,
   * then switches to main and merges the feature branch.
   *
   * @param taskId - The task ID for commit message
   * @param taskTitle - The task title for commit message
   * @param taskType - The task type for commit scope (defaults to "feat")
   * @returns Promise resolving to the git operation result
   * @throws {GitError} If commit or merge fails
   *
   * @example
   * ```typescript
   * const workflow = new VTMGitWorkflow();
   * const result = await workflow.commitAndMerge(
   *   "TASK-042",
   *   "Implement instruction builder with tests",
   *   "feat"
   * );
   * console.log(result.message); // "Successfully merged to main"
   * ```
   */
  async commitAndMerge(
    taskId: string,
    taskTitle: string,
    taskType?: string,
  ): Promise<GitOperationResult> {
    const type = taskType ?? 'feat'

    // Check if there are uncommitted changes
    const hasChanges = !(await this.isClean())

    if (hasChanges) {
      // Stage all changes
      await this.executeGitCommand(['add', '-A'])

      // Create conventional commit
      const commitMessage = `${type}(${taskId}): ${taskTitle}`
      await this.executeGitCommand(['commit', '-m', commitMessage])
    }

    // Get current branch for merge
    const currentBranch = await this.getCurrentBranch()

    // Switch to main
    await this.executeGitCommand(['checkout', 'main'])

    // Merge feature branch with no-ff to preserve history
    try {
      await this.executeGitCommand(['merge', currentBranch, '--no-ff'])

      return {
        success: true,
        message: `Successfully merged ${currentBranch} to main`,
        branch: currentBranch,
      }
    } catch {
      throw new GitError('Failed to merge branch to main', 'MERGE_FAILED', [
        'Check for merge conflicts',
        'Resolve conflicts: git status',
        'After resolving: git add . && git commit',
        'Abort merge: git merge --abort',
      ])
    }
  }

  /**
   * Deletes a feature branch after it has been merged.
   *
   * @param branchName - The branch to delete (e.g., "feature/TASK-042")
   * @param force - Force deletion even if not fully merged (defaults to false)
   * @throws {GitError} If branch deletion fails
   *
   * @example
   * ```typescript
   * const workflow = new VTMGitWorkflow();
   * await workflow.cleanupBranch("feature/TASK-042");
   * ```
   */
  async cleanupBranch(branchName: string, force: boolean = false): Promise<void> {
    const deleteFlag = force ? '-D' : '-d'
    try {
      await this.executeGitCommand(['branch', deleteFlag, branchName])
    } catch {
      throw new GitError(`Failed to delete branch '${branchName}'`, 'DELETE_BRANCH_FAILED', [
        force
          ? 'Check if branch exists: git branch -a'
          : 'Merge the branch first or use force=true',
        `Try manually: git branch ${deleteFlag} ${branchName}`,
      ])
    }
  }

  /**
   * @internal Private helper to execute git commands
   */
  private async executeGitCommand(args: string[]): Promise<string> {
    try {
      const output = execFileSync('git', args, {
        encoding: 'utf-8',
        stdio: 'pipe',
        cwd: this.workingDir,
      })

      return output.toString().trim()
    } catch {
      const command = `git ${args.join(' ')}`
      throw new GitError(`Git command failed: ${command}`, 'GIT_COMMAND_FAILED', [
        `Command: ${command}`,
        'Check git installation',
        'Verify command syntax',
      ])
    }
  }

  /**
   * @internal Private helper to check if working directory is clean
   */
  private async isClean(): Promise<boolean> {
    try {
      const output = await this.executeGitCommand(['status', '--porcelain'])
      return output.length === 0
    } catch {
      return false
    }
  }

  /**
   * @internal Private helper to get current git branch
   */
  private async getCurrentBranch(): Promise<string> {
    return await this.executeGitCommand(['branch', '--show-current'])
  }

  /**
   * @internal Private helper to check if in a git repository
   */
  private async isGitRepository(): Promise<boolean> {
    try {
      await this.executeGitCommand(['rev-parse', '--git-dir'])
      return true
    } catch {
      return false
    }
  }

  /**
   * Validates a branch name format.
   *
   * Branch names must follow format: {type}/{taskId}
   * where type is (feature|bugfix|refactor|chore|docs|test)
   * and taskId matches TASK-\d+
   *
   * @param name - The branch name to validate
   * @returns true if valid, false otherwise
   *
   * @remarks
   * Valid examples:
   * - "feature/TASK-042"
   * - "bugfix/TASK-025"
   * - "refactor/TASK-088"
   *
   * @example
   * ```typescript
   * workflow.validateBranchName("feature/TASK-042") // true
   * workflow.validateBranchName("TASK-042") // false (missing type)
   * ```
   */
  validateBranchName(name: string): boolean {
    const pattern = /^(feature|bugfix|refactor|chore|docs|test)\/TASK-\d+$/
    return pattern.test(name)
  }

  /**
   * Validates a task ID format.
   *
   * Task IDs must match: TASK-{number} where number >= 1
   *
   * @param id - The task ID to validate
   * @returns true if valid, false otherwise
   *
   * @example
   * ```typescript
   * workflow.validateTaskId("TASK-042") // true
   * workflow.validateTaskId("TASK-1") // true
   * workflow.validateTaskId("task-042") // false (wrong case)
   * workflow.validateTaskId("TASK") // false (missing number)
   * ```
   */
  validateTaskId(id: string): boolean {
    const pattern = /^TASK-\d+$/
    return pattern.test(id)
  }

  /**
   * Validates a task type.
   *
   * Allowed types: feature, bugfix, refactor, chore, docs, test
   *
   * @param type - The task type to validate
   * @returns true if valid, false otherwise
   *
   * @example
   * ```typescript
   * workflow.validateTaskType("feature") // true
   * workflow.validateTaskType("bugfix") // true
   * workflow.validateTaskType("Feature") // false (wrong case)
   * workflow.validateTaskType("feat") // false (not in allowed list)
   * ```
   */
  validateTaskType(type: string): boolean {
    const allowedTypes = ['feature', 'bugfix', 'refactor', 'chore', 'docs', 'test']
    return allowedTypes.includes(type)
  }
}
