#!/usr/bin/env node

/* eslint-disable no-console */
// Console statements are required in this CLI wrapper for stdout/stderr communication

import { VTMGitWorkflow } from './vtm-git-workflow'
import { GitError } from './types'

/**
 * CLI wrapper for VTMGitWorkflow.
 * Provides a command-line interface to git operations for bash scripts.
 *
 * Usage:
 *   node vtm-git-cli.js ensure-clean <taskId> <taskType>
 *   node vtm-git-cli.js commit-merge <taskId> <taskTitle> [taskType]
 *   node vtm-git-cli.js cleanup <branchName> [--force]
 *
 * Exit codes:
 *   0 - Success
 *   1 - Error
 */

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command) {
    console.error('Usage: vtm-git-cli <command> <args...>')
    console.error('Commands:')
    console.error('  ensure-clean <taskId> <taskType>')
    console.error('  commit-merge <taskId> <taskTitle> [taskType]')
    console.error('  cleanup <branchName> [--force]')
    process.exit(1)
  }

  const workflow = new VTMGitWorkflow()

  try {
    switch (command) {
      case 'ensure-clean': {
        const [taskId, taskType] = args.slice(1)
        if (!taskId || !taskType) {
          console.error('Usage: vtm-git-cli ensure-clean <taskId> <taskType>')
          console.error('Example: vtm-git-cli ensure-clean TASK-042 feature')
          process.exit(1)
        }
        const branch = await workflow.ensureCleanAndCreateBranch(taskId, taskType)
        console.log(branch)
        break
      }

      case 'commit-merge': {
        const [taskId, taskTitle, taskType] = args.slice(1)
        if (!taskId || !taskTitle) {
          console.error('Usage: vtm-git-cli commit-merge <taskId> <taskTitle> [taskType]')
          console.error('Example: vtm-git-cli commit-merge TASK-042 "Add authentication" feature')
          process.exit(1)
        }
        const result = await workflow.commitAndMerge(taskId, taskTitle, taskType)
        if (result.success) {
          console.log(result.message)
        } else {
          console.error(result.message)
          process.exit(1)
        }
        break
      }

      case 'cleanup': {
        const branchName = args[1]
        const force = args.includes('--force')
        if (!branchName) {
          console.error('Usage: vtm-git-cli cleanup <branchName> [--force]')
          console.error('Example: vtm-git-cli cleanup feature/TASK-042')
          process.exit(1)
        }
        await workflow.cleanupBranch(branchName, force)
        console.log(`Branch ${branchName} deleted successfully`)
        break
      }

      default:
        console.error(`Unknown command: ${command}`)
        console.error('Available commands: ensure-clean, commit-merge, cleanup')
        process.exit(1)
    }
  } catch (error) {
    if (error instanceof GitError) {
      console.error(`Error: ${error.message}`)
      if (error.suggestions && error.suggestions.length > 0) {
        console.error('\nSuggestions:')
        error.suggestions.forEach((s) => console.error(`  - ${s}`))
      }
    } else if (error instanceof Error) {
      console.error(`Unexpected error: ${error.message}`)
    } else {
      console.error(`Unexpected error: ${error}`)
    }
    process.exit(1)
  }
}

// Only run main() if this file is executed directly (not imported as a module)
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
}

export { main }
