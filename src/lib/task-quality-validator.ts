/**
 * Task Quality Validator Module
 *
 * Validates task completion against quality standards including:
 * - JSDoc coverage on implementation files
 * - Test coverage meeting strategy requirements
 * - ESLint and TypeScript compilation
 * - Acceptance criteria verification
 *
 * @module task-quality-validator
 */

import * as fs from 'fs/promises'
import * as path from 'path'
import { execSync } from 'child_process'
import type { Task } from './types'

/**
 * Coverage threshold requirements by test strategy.
 */
export const COVERAGE_THRESHOLDS: Record<string, number> = {
  TDD: 80,
  Unit: 70,
  Integration: 60,
  Direct: 0,
}

/**
 * JSDoc coverage requirements by test strategy.
 */
export const JSDOC_THRESHOLDS: Record<string, number> = {
  TDD: 100,
  Unit: 90,
  Integration: 80,
  Direct: 50,
}

/**
 * Validation check result.
 */
export type ValidationCheckResult = {
  name: string
  status: 'pass' | 'fail' | 'warning' | 'skipped'
  message: string
  details?: string[]
}

/**
 * Complete validation report.
 */
export type ValidationReport = {
  taskId: string
  taskTitle: string
  testStrategy: string
  checks: ValidationCheckResult[]
  summary: {
    passed: number
    failed: number
    warnings: number
    skipped: number
  }
  overallStatus: 'pass' | 'fail'
  suggestions: string[]
}

/**
 * Validates a task against quality standards.
 */
export class TaskQualityValidator {
  /**
   * Creates a new TaskQualityValidator instance.
   *
   * @param projectRoot - Root directory of the project (defaults to cwd)
   */
  constructor(private projectRoot: string = process.cwd()) {}

  /**
   * Validates a task against all quality standards.
   *
   * @param task - The task to validate
   * @param options - Validation options
   * @returns A complete validation report
   */
  async validateTask(
    task: Task,
    options: {
      skip?: string[]
      fix?: boolean
    } = {},
  ): Promise<ValidationReport> {
    const checks: ValidationCheckResult[] = []
    const suggestions: string[] = []
    const skipChecks = options.skip || []

    // JSDoc Coverage Check
    if (!skipChecks.includes('jsdoc')) {
      const jsdocCheck = await this.checkJSDocCoverage(task)
      checks.push(jsdocCheck)
      if (jsdocCheck.status === 'fail') {
        suggestions.push('Add comprehensive JSDoc comments to all public functions')
      }
    }

    // Test Coverage Check
    if (!skipChecks.includes('coverage')) {
      const coverageCheck = await this.checkTestCoverage(task)
      checks.push(coverageCheck)
      if (coverageCheck.status === 'fail') {
        suggestions.push(
          `Increase test coverage to meet ${task.test_strategy} strategy requirements`,
        )
      }
    }

    // ESLint Check
    if (!skipChecks.includes('eslint')) {
      const lintCheck = await this.checkESLint(task, options.fix || false)
      checks.push(lintCheck)
      if (lintCheck.status === 'fail') {
        suggestions.push('Run pnpm lint:fix to auto-fix linting issues')
      }
    }

    // TypeScript Build Check
    if (!skipChecks.includes('typescript')) {
      const typeCheck = await this.checkTypeScript()
      checks.push(typeCheck)
      if (typeCheck.status === 'fail') {
        suggestions.push('Fix TypeScript compilation errors (pnpm build)')
      }
    }

    // Acceptance Criteria Check
    if (!skipChecks.includes('acceptance-criteria')) {
      const acCheck = await this.checkAcceptanceCriteria(task)
      checks.push(acCheck)
      if (acCheck.status === 'fail') {
        suggestions.push('Verify all acceptance criteria are met and marked as verified')
      }
    }

    // Calculate summary
    const summary = {
      passed: checks.filter((c) => c.status === 'pass').length,
      failed: checks.filter((c) => c.status === 'fail').length,
      warnings: checks.filter((c) => c.status === 'warning').length,
      skipped: checks.filter((c) => c.status === 'skipped').length,
    }

    const overallStatus = summary.failed === 0 ? 'pass' : 'fail'

    return {
      taskId: task.id,
      taskTitle: task.title,
      testStrategy: task.test_strategy,
      checks,
      summary,
      overallStatus,
      suggestions,
    }
  }

  /**
   * Checks JSDoc coverage on task implementation files.
   */
  private async checkJSDocCoverage(task: Task): Promise<ValidationCheckResult> {
    try {
      const createdFiles = task.files.create || []
      const modifiedFiles = task.files.modify || []
      const allFiles = [...createdFiles, ...modifiedFiles]

      if (allFiles.length === 0) {
        return {
          name: 'JSDoc Coverage',
          status: 'skipped',
          message: 'No implementation files to check',
        }
      }

      // Count JSDoc comments
      let totalFunctions = 0
      let documentedFunctions = 0

      for (const file of allFiles) {
        if (!file.endsWith('.ts') && !file.endsWith('.js')) {
          continue
        }

        try {
          const filePath = path.join(this.projectRoot, file)
          const content = await fs.readFile(filePath, 'utf-8')

          // Simple heuristic: count function declarations
          const functionMatches =
            content.match(
              /(?:export\s+)?(?:async\s+)?function\s+\w+|^\s*(?:public|private)?\s*\w+\s*\(.*?\)\s*{/gm,
            ) || []
          totalFunctions += functionMatches.length

          // Count JSDoc comments
          const jsdocMatches = content.match(/\/\*\*[\s\S]*?\*\//g) || []
          documentedFunctions += jsdocMatches.length
        } catch {
          // Skip files that don't exist yet
        }
      }

      if (totalFunctions === 0) {
        return {
          name: 'JSDoc Coverage',
          status: 'pass',
          message: 'No functions found to document',
        }
      }

      const coverage = (documentedFunctions / totalFunctions) * 100
      const threshold = JSDOC_THRESHOLDS[task.test_strategy] || 50

      if (coverage >= threshold) {
        return {
          name: 'JSDoc Coverage',
          status: 'pass',
          message: `JSDoc coverage: ${coverage.toFixed(1)}% (required: ${threshold}%)`,
          details: [`Functions documented: ${documentedFunctions}/${totalFunctions}`],
        }
      } else {
        return {
          name: 'JSDoc Coverage',
          status: 'fail',
          message: `JSDoc coverage: ${coverage.toFixed(1)}% (required: ${threshold}%)`,
          details: [
            `Functions documented: ${documentedFunctions}/${totalFunctions}`,
            `Missing ${totalFunctions - documentedFunctions} JSDoc comments`,
          ],
        }
      }
    } catch (error) {
      return {
        name: 'JSDoc Coverage',
        status: 'warning',
        message: `Could not check JSDoc coverage: ${(error as Error).message}`,
      }
    }
  }

  /**
   * Checks test coverage meets strategy requirements.
   */
  private async checkTestCoverage(task: Task): Promise<ValidationCheckResult> {
    try {
      const threshold = COVERAGE_THRESHOLDS[task.test_strategy] || 0

      // For Direct strategy, no test coverage required
      if (task.test_strategy === 'Direct' || threshold === 0) {
        return {
          name: 'Test Coverage',
          status: 'pass',
          message: `Test coverage not required for ${task.test_strategy} strategy`,
        }
      }

      // Run coverage command
      try {
        const output = execSync('pnpm test -- --coverage 2>&1', {
          cwd: this.projectRoot,
          encoding: 'utf-8',
          maxBuffer: 10 * 1024 * 1024,
        })

        // Simple coverage parsing - look for percentage patterns
        const coverageMatch = output.match(
          /All files\s*\|\s*[\d.]+\s*\|\s*[\d.]+\s*\|\s*[\d.]+\s*\|\s*([\d.]+)/m,
        )

        if (coverageMatch && coverageMatch[1]) {
          const coverage = parseFloat(coverageMatch[1])

          if (coverage >= threshold) {
            return {
              name: 'Test Coverage',
              status: 'pass',
              message: `Test coverage: ${coverage.toFixed(1)}% (required: ${threshold}%)`,
            }
          } else {
            return {
              name: 'Test Coverage',
              status: 'fail',
              message: `Test coverage: ${coverage.toFixed(1)}% (required: ${threshold}%)`,
              details: [
                `Need ${(threshold - coverage).toFixed(1)} percentage points more coverage`,
              ],
            }
          }
        }

        // If we can't parse coverage, warn
        return {
          name: 'Test Coverage',
          status: 'warning',
          message: 'Could not parse test coverage from output',
          details: ['Run: pnpm test -- --coverage to check coverage manually'],
        }
      } catch {
        return {
          name: 'Test Coverage',
          status: 'warning',
          message: 'Could not run test coverage check',
          details: ['Run: pnpm test -- --coverage to check coverage manually'],
        }
      }
    } catch (error) {
      return {
        name: 'Test Coverage',
        status: 'warning',
        message: `Could not check test coverage: ${(error as Error).message}`,
      }
    }
  }

  /**
   * Checks ESLint on modified files.
   */
  private async checkESLint(task: Task, fix: boolean): Promise<ValidationCheckResult> {
    try {
      const createdFiles = task.files.create || []
      const modifiedFiles = task.files.modify || []
      const allFiles = [...createdFiles, ...modifiedFiles]

      if (allFiles.length === 0) {
        return {
          name: 'ESLint',
          status: 'skipped',
          message: 'No files to lint',
        }
      }

      // Filter to TypeScript files
      const tsFiles = allFiles.filter((f) => f.endsWith('.ts') || f.endsWith('.js')).join(' ')

      if (!tsFiles) {
        return {
          name: 'ESLint',
          status: 'pass',
          message: 'No TypeScript files to lint',
        }
      }

      try {
        const cmd = fix ? `pnpm lint:fix -- ${tsFiles}` : `pnpm lint -- ${tsFiles}`
        const output = execSync(cmd, {
          cwd: this.projectRoot,
          encoding: 'utf-8',
        })

        if (output.includes('error') || output.includes('Error')) {
          return {
            name: 'ESLint',
            status: 'fail',
            message: 'ESLint found errors',
            details: output.split('\n').slice(0, 5),
          }
        }

        if (output.includes('warning') || output.includes('Warning')) {
          return {
            name: 'ESLint',
            status: 'warning',
            message: 'ESLint found warnings',
            details: output.split('\n').slice(0, 5),
          }
        }

        return {
          name: 'ESLint',
          status: 'pass',
          message: 'ESLint passed',
        }
      } catch (error) {
        const errorMsg = (error as Error).message
        if (errorMsg.includes('error') || errorMsg.includes('Error')) {
          return {
            name: 'ESLint',
            status: 'fail',
            message: 'ESLint check failed',
            details: [errorMsg.split('\n')[0] || errorMsg],
          }
        }

        return {
          name: 'ESLint',
          status: 'warning',
          message: 'Could not run ESLint check',
          details: [errorMsg],
        }
      }
    } catch (error) {
      return {
        name: 'ESLint',
        status: 'warning',
        message: `Could not check ESLint: ${(error as Error).message}`,
      }
    }
  }

  /**
   * Checks TypeScript compilation.
   */
  private async checkTypeScript(): Promise<ValidationCheckResult> {
    try {
      const output = execSync('pnpm build 2>&1', {
        cwd: this.projectRoot,
        encoding: 'utf-8',
      })

      if (output.includes('error TS') || output.includes('Error:')) {
        return {
          name: 'TypeScript Build',
          status: 'fail',
          message: 'TypeScript compilation failed',
          details: output
            .split('\n')
            .filter((l) => l.includes('error'))
            .slice(0, 5),
        }
      }

      return {
        name: 'TypeScript Build',
        status: 'pass',
        message: 'TypeScript build successful',
      }
    } catch (error) {
      const errorMsg = (error as Error).message
      if (errorMsg.includes('error')) {
        return {
          name: 'TypeScript Build',
          status: 'fail',
          message: 'TypeScript build failed',
          details: errorMsg.split('\n').slice(0, 5),
        }
      }

      return {
        name: 'TypeScript Build',
        status: 'warning',
        message: 'Could not check TypeScript build',
        details: [errorMsg],
      }
    }
  }

  /**
   * Checks acceptance criteria completion.
   */
  private async checkAcceptanceCriteria(task: Task): Promise<ValidationCheckResult> {
    try {
      if (!task.acceptance_criteria || task.acceptance_criteria.length === 0) {
        return {
          name: 'Acceptance Criteria',
          status: 'warning',
          message: 'No acceptance criteria defined',
        }
      }

      const verified = task.validation?.ac_verified || []
      const total = task.acceptance_criteria.length

      if (verified.length === total) {
        return {
          name: 'Acceptance Criteria',
          status: 'pass',
          message: `All acceptance criteria verified (${verified.length}/${total})`,
        }
      }

      return {
        name: 'Acceptance Criteria',
        status: 'fail',
        message: `Acceptance criteria not fully verified (${verified.length}/${total})`,
        details: [
          `Verified: ${verified.length}`,
          `Remaining: ${total - verified.length}`,
          ...task.acceptance_criteria.slice(0, 3).map((ac, i) => `  ${i + 1}. ${ac}`),
        ],
      }
    } catch (error) {
      return {
        name: 'Acceptance Criteria',
        status: 'warning',
        message: `Could not check acceptance criteria: ${(error as Error).message}`,
      }
    }
  }
}
