#!/usr/bin/env node

// src/index.ts

import { Command } from 'commander'
import chalk from 'chalk'
import * as fs from 'fs'
import * as path from 'path'
import {
  VTMReader,
  VTMWriter,
  ContextBuilder,
  VTMSummarizer,
  DecisionEngine,
  VTMSession,
  VTMHistory,
  TaskQualityValidator,
  ComponentAnalyzer,
  IssueDetector,
  RefactoringPlanner,
} from './lib'
import { findMatchingAdrs, generateSpecName, checkExistingSpecs } from './lib/batch-spec-creator'
import { ResearchCache } from './lib/research-cache'
import * as readline from 'readline'

// Helper functions for cache commands
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

function formatAge(timestamp: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(timestamp).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  return 'Just now'
}

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

const program = new Command()

program
  .name('vtm')
  .description('Virtual Task Manager CLI - Token-efficient task management for Claude Code')
  .version('2.0.0')

// vtm summary - Generate token-efficient VTM summary
program
  .command('summary')
  .description('Generate token-efficient summary of VTM state')
  .option('--incomplete', 'Show only incomplete tasks (default: true)', true)
  .option('--json', 'Output as JSON (default: true)', true)
  .option('--output <file>', 'Write to file instead of stdout')
  .action(async (options) => {
    try {
      const summarizer = new VTMSummarizer()
      const summary = await summarizer.generateSummary()
      const json = summarizer.toJSON(summary)

      if (options.output) {
        fs.writeFileSync(options.output, json)
        console.info(chalk.green(`✅ Summary written to ${options.output}`))
        console.info(
          chalk.cyan(
            `  Tasks: ${summary.incomplete_tasks.length} incomplete, ${summary.completed_capabilities.length} completed`,
          ),
        )
      } else {
        console.info(json)
        console.info(
          chalk.cyan(
            `\n✅ Summary generated: ${summary.incomplete_tasks.length} incomplete tasks, ${summary.completed_capabilities.length} completed capabilities`,
          ),
        )
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })

// vtm next - Show next available tasks
program
  .command('next')
  .description('Show next available tasks')
  .option('-n, --number <count>', 'Number of tasks to show', '5')
  .action(async (options) => {
    try {
      const reader = new VTMReader()
      const tasks = await reader.getReadyTasks()

      console.info(chalk.blue(`\n📋 Ready Tasks (${tasks.length}):\n`))

      if (tasks.length === 0) {
        console.info(chalk.yellow('No tasks ready. Check blocked or in-progress tasks.'))
        return
      }

      tasks.slice(0, parseInt(options.number)).forEach((task) => {
        console.info(
          chalk.bold(`${task.id}`) + chalk.gray(` [${task.estimated_hours}h]`) + ` │ ${task.title}`,
        )
        console.info(chalk.gray(`  Risk: ${task.risk} │ Test: ${task.test_strategy}`))
        console.info(chalk.gray(`  Deps: ✅ ${task.dependencies.join(', ') || 'none'}`))
        console.info(chalk.gray(`  From: ${task.adr_source}`))
        console.info()
      })

      console.info(chalk.cyan(`Use: vtm context <id> to get full context for Claude`))
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })

// vtm context <id> - Generate minimal context
program
  .command('context <id>')
  .description('Generate minimal context for Claude')
  .option('--compact', 'Ultra-compact format for tight token budgets')
  .action(async (id, options) => {
    try {
      const builder = new ContextBuilder()
      const context = options.compact
        ? await builder.buildCompactContext(id)
        : await builder.buildMinimalContext(id)

      console.info(context)
      console.info(chalk.green(`\n✅ Context ready for Claude Code`))
      console.info(chalk.cyan(`Estimated tokens: ~${Math.ceil(context.length / 4)}`))
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })

// vtm task <id> - Get single task JSON
program
  .command('task <id>')
  .description('Get single task details')
  .option('--json', 'Output as JSON')
  .action(async (id, options) => {
    try {
      const reader = new VTMReader()
      const task = await reader.getTask(id)

      if (!task) {
        console.error(chalk.red(`Task ${id} not found`))
        process.exit(1)
      }

      if (options.json) {
        console.info(JSON.stringify(task, null, 2))
      } else {
        console.info(chalk.bold(`\n${task.id}: ${task.title}`))
        console.info(chalk.gray(`Status: ${task.status}`))
        console.info(chalk.gray(`Risk: ${task.risk} | Test: ${task.test_strategy}`))
        console.info(`\nDescription: ${task.description}`)
        console.info(`\nAcceptance Criteria:`)
        task.acceptance_criteria.forEach((ac, i) => {
          console.info(`  ${i + 1}. ${ac}`)
        })
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })

// vtm start <id> - Mark task as in-progress
program
  .command('start <id>')
  .description('Mark task as in-progress')
  .action(async (id) => {
    try {
      const writer = new VTMWriter()
      await writer.updateTask(id, {
        status: 'in-progress',
        started_at: new Date().toISOString(),
      })
      console.info(chalk.green(`✅ Task ${id} marked as in-progress`))
      console.info(chalk.cyan(`📅 Started at: ${new Date().toISOString()}`))
      console.info(`\nNext steps:`)
      console.info(`1. vtm context ${id}`)
      console.info(`2. Copy to Claude Code`)
      console.info(`3. Run TDD cycle`)
      console.info(`4. vtm complete ${id}`)
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })

// vtm complete <id> - Mark task as completed
program
  .command('complete <id>')
  .description('Mark task as completed')
  .option('--commits <commits>', 'Comma-separated commit SHAs')
  .option('--files-created <files>', 'Comma-separated file paths')
  .option('--tests-pass', 'All tests passing')
  .action(async (id, options) => {
    try {
      const writer = new VTMWriter()
      const reader = new VTMReader()

      await writer.updateTask(id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        commits: options.commits?.split(',') || [],
        files: {
          created: options.filesCreated?.split(',') || [],
        },
        validation: {
          tests_pass: options.testsPass || false,
        },
      })

      console.info(chalk.green(`✅ Task ${id} marked as completed`))
      console.info(chalk.cyan(`📅 Completed at: ${new Date().toISOString()}`))

      const vtm = await reader.load(true)
      console.info(`\n📊 Updated Stats:`)
      console.info(`   Completed: ${vtm.stats.completed}/${vtm.stats.total_tasks}`)
      console.info(
        `   Progress: ${((vtm.stats.completed / vtm.stats.total_tasks) * 100).toFixed(1)}%`,
      )

      const ready = await reader.getReadyTasks()
      if (ready.length > 0) {
        console.info(chalk.green(`\n🚀 New tasks available:`))
        ready.slice(0, 3).forEach((t) => {
          console.info(`   ${t.id}: ${t.title}`)
        })
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })

// vtm stats - Show project statistics
program
  .command('stats')
  .description('Show project statistics')
  .action(async () => {
    try {
      const reader = new VTMReader()
      const vtm = await reader.load()
      const statsByADR = await reader.getStatsByADR()
      const ready = await reader.getReadyTasks()
      const blocked = await reader.getBlockedTasks()
      const inProgress = await reader.getInProgressTasks()

      console.info(chalk.bold(`\n📊 Project Statistics`))
      console.info('━'.repeat(40))
      console.info(`Total Tasks:      ${vtm.stats.total_tasks}`)
      console.info(
        chalk.green(
          `Completed:        ${vtm.stats.completed} (${((vtm.stats.completed / vtm.stats.total_tasks) * 100).toFixed(1)}%)`,
        ),
      )
      console.info(chalk.yellow(`In Progress:      ${vtm.stats.in_progress}`))
      console.info(chalk.gray(`Pending:          ${vtm.stats.pending}`))
      if (vtm.stats.blocked > 0) {
        console.info(chalk.red(`Blocked:          ${vtm.stats.blocked}`))
      }

      console.info(chalk.bold(`\n📈 Progress by ADR:`))
      Object.entries(statsByADR).forEach(([adr, stats]) => {
        const pct = (stats.completed / stats.total) * 100
        const bar = '█'.repeat(Math.floor(pct / 10)) + '░'.repeat(10 - Math.floor(pct / 10))
        console.info(
          `${adr.padEnd(30)} ${bar} ${pct.toFixed(0)}% (${stats.completed}/${stats.total})`,
        )
      })

      console.info(chalk.bold(`\n🎯 Current Status:`))
      console.info(chalk.green(`Ready to Start:   ${ready.length}`))
      if (inProgress.length > 0) {
        console.info(chalk.yellow(`In Progress:      ${inProgress.length}`))
        inProgress.forEach((t) => {
          console.info(chalk.gray(`  - ${t.id}: ${t.title}`))
        })
      }
      if (blocked.length > 0) {
        console.info(chalk.red(`⚠️  Blocked Tasks:   ${blocked.length}`))
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })

// vtm list - List all tasks with filters
program
  .command('list')
  .description('List tasks with optional filters')
  .option('-s, --status <status>', 'Filter by status (pending|in-progress|completed|blocked)')
  .option('-a, --adr <adr>', 'Filter by ADR source')
  .action(async (options) => {
    try {
      const reader = new VTMReader()
      const vtm = await reader.load()
      let tasks = vtm.tasks

      if (options.status) {
        tasks = tasks.filter((t) => t.status === options.status)
      }

      if (options.adr) {
        tasks = tasks.filter((t) => t.adr_source.includes(options.adr))
      }

      console.info(chalk.blue(`\n📋 Tasks (${tasks.length}):\n`))
      tasks.forEach((task) => {
        const statusColor =
          task.status === 'completed'
            ? chalk.green
            : task.status === 'in-progress'
              ? chalk.yellow
              : task.status === 'blocked'
                ? chalk.red
                : chalk.gray

        console.info(statusColor(`${task.id}`) + ` │ ${task.title}`)
        console.info(
          chalk.gray(`  Status: ${task.status} | Risk: ${task.risk} | ${task.estimated_hours}h`),
        )
        console.info()
      })
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })

// vtm ingest - Ingest validated task JSON into VTM
program
  .command('ingest <tasks-json-file>')
  .description('Ingest validated tasks from JSON file into VTM')
  .option('--preview', 'Show preview without adding (default behavior with confirmation)')
  .option('--commit', 'Skip preview confirmation and directly add tasks')
  .option('--dry-run', 'Validate only, do not add tasks')
  .action(async (tasksJsonFile: string, options) => {
    try {
      const { TaskValidatorIngest, loadTasksFromFile, generateTaskPreview, promptConfirmation } =
        await import('./lib/task-validator-ingest')

      // 1. Load tasks from JSON file
      let loadedTasks
      try {
        loadedTasks = loadTasksFromFile(tasksJsonFile)
      } catch (error) {
        console.error(chalk.red(`Error: ${(error as Error).message}`))
        process.exit(1)
      }

      const tasks = loadedTasks.tasks

      // 2. Process tasks with ID assignment and dependency resolution
      const { ingestTasks } = await import('./lib/task-ingest-helper')
      const processedTasks = await ingestTasks(tasks, 'vtm.json', {
        assignIds: true,
        resolveDependencies: true,
        defaultStatus: 'pending',
      })

      // 3. Validate processed tasks
      const validator = new TaskValidatorIngest()
      await validator.loadExistingTasks('vtm.json')
      const validationResult = validator.validate(processedTasks)

      if (!validationResult.valid) {
        console.error(chalk.red(`\n❌ Validation failed:\n`))
        validationResult.errors.forEach((error) => {
          console.error(chalk.red(`  - ${error}`))
        })
        process.exit(1)
      }

      // 4. Generate preview
      const preview = await generateTaskPreview(processedTasks)
      console.info(preview)

      // 5. Dry-run: exit after preview
      if (options.dryRun) {
        console.info(chalk.cyan('✅ Validation passed (dry-run mode, no changes made)'))
        return
      }

      // 6. User confirmation (unless --commit flag)
      let confirmed = false
      if (options.commit) {
        confirmed = true
      } else {
        confirmed = await promptConfirmation(
          chalk.bold(`Add these ${processedTasks.length} tasks to VTM?`),
        )
      }

      if (!confirmed) {
        console.info(chalk.yellow('Cancelled. No changes made.'))
        return
      }

      // 7. Add processed tasks to VTM using VTMWriter
      const writer = new VTMWriter()
      await writer.appendTasks(processedTasks)

      // 8. Show success message with stats
      const reader = new VTMReader()
      const vtm = await reader.load(true)
      const ready = await reader.getReadyTasks()

      console.info(chalk.green(`\n✅ Added ${tasks.length} tasks to vtm.json`))
      console.info(`\n📊 Updated Stats:`)
      console.info(`   Total: ${vtm.stats.total_tasks} tasks`)
      console.info(
        chalk.green(
          `   Completed: ${vtm.stats.completed} (${((vtm.stats.completed / vtm.stats.total_tasks) * 100).toFixed(0)}%)`,
        ),
      )
      console.info(chalk.cyan(`   Ready: ${ready.length} tasks`))
      if (vtm.stats.blocked > 0) {
        console.info(chalk.red(`   Blocked: ${vtm.stats.blocked} tasks`))
      }

      console.info(chalk.cyan(`\nRun: vtm next`))
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })

// vtm analyze - Analyze domain architecture (enhanced with deep analysis)
program
  .command('analyze <domain>')
  .description('Analyze domain architecture with deep metrics, issues, and refactoring strategies')
  .option('--metrics', 'Show component metrics (ComponentAnalyzer analysis)')
  .option('--issues', 'Show detected architectural issues (IssueDetector analysis)')
  .option('--refactor', 'Show refactoring strategies (RefactoringPlanner recommendations)')
  .option('--deep', 'Run complete deep analysis pipeline (all three analyzers)')
  .option('--suggest-refactoring', 'Show refactoring suggestions from DecisionEngine')
  .action(
    async (
      domain: string,
      options: {
        metrics?: boolean
        issues?: boolean
        refactor?: boolean
        deep?: boolean
        suggestRefactoring?: boolean
      },
    ) => {
      try {
        // If --deep flag is set, use the integrated deep analysis pipeline
        if (options.deep) {
          const engine = new DecisionEngine()
          const deepAnalysis = engine.analyzeDeepArchitecture(domain, {
            minSeverity: 'medium', // Default to medium+ severity
          })
          console.info(deepAnalysis.formatted)
          return
        }

        const domainPath = path.join(process.cwd(), domain)

        // If --deep or no specific options, run complete pipeline
        const runComplete =
          !options.metrics && !options.issues && !options.refactor && !options.suggestRefactoring

        if (options.metrics || runComplete) {
          console.info(chalk.cyan('\n📊 COMPONENT METRICS ANALYSIS'))
          console.info(chalk.gray('━'.repeat(60)))
          try {
            const analyzer = new ComponentAnalyzer()
            const components = analyzer.scanComponentDir(domainPath)

            if (components.length === 0) {
              console.info(chalk.yellow('⚠️  No TypeScript files found in domain'))
            } else {
              console.info(chalk.green(`✅ Found ${components.length} component(s)\n`))

              components.forEach((metrics) => {
                console.info(chalk.bold(`  📄 ${metrics.name}`))
                console.info(`     Complexity: ${metrics.complexity.toFixed(1)}`)
                console.info(`     JSDoc Coverage: ${metrics.jsdocCoverage}%`)
                console.info(`     Functions: ${metrics.functions.length}`)
                console.info(`     Dependencies: ${metrics.dependencies.length}`)
                if (metrics.codeSmells.length > 0) {
                  console.info(`     Code Smells: ${metrics.codeSmells.length}`)
                }
              })
            }
          } catch (error) {
            console.error(
              chalk.yellow(`⚠️  Could not analyze metrics: ${(error as Error).message}`),
            )
          }
        }

        if (options.issues || runComplete) {
          console.info(chalk.cyan('\n🔍 ARCHITECTURAL ISSUES DETECTION'))
          console.info(chalk.gray('━'.repeat(60)))
          try {
            const detector = new IssueDetector()
            const issues = detector.detect(domainPath)

            if (issues.length === 0) {
              console.info(chalk.green('✅ No architectural issues detected'))
            } else {
              console.info(chalk.yellow(`⚠️  Found ${issues.length} issue(s)\n`))

              issues.forEach((issue) => {
                const severityColor =
                  {
                    critical: chalk.red,
                    high: chalk.red,
                    medium: chalk.yellow,
                    low: chalk.blue,
                  }[issue.severity] || chalk.gray

                console.info(severityColor(`  [${issue.severity.toUpperCase()}] ${issue.title}`))
                console.info(`           ${issue.description}`)
                console.info(`           Evidence: ${issue.evidence}`)
                if (issue.impact.length > 0) {
                  console.info(`           Impact: ${issue.impact.join(', ')}`)
                }
              })
            }
          } catch (error) {
            console.error(chalk.yellow(`⚠️  Could not detect issues: ${(error as Error).message}`))
          }
        }

        if (options.refactor || runComplete) {
          console.info(chalk.cyan('\n🔧 REFACTORING STRATEGIES'))
          console.info(chalk.gray('━'.repeat(60)))
          try {
            const detector = new IssueDetector()
            const issues = detector.detect(domainPath)
            const planner = new RefactoringPlanner()

            let foundStrategies = false
            issues.forEach((issue) => {
              const options_list = planner.generateOptions(issue)
              if (options_list.length > 0) {
                foundStrategies = true
                const bestOption = planner.recommendBest(options_list)

                console.info(chalk.bold(`\n  📋 For: ${issue.title}`))
                options_list.forEach((option, idx) => {
                  const isRecommended = option.recommendation ? ' ⭐ RECOMMENDED' : ''
                  console.info(`     ${idx + 1}. ${option.name}${isRecommended}`)
                  console.info(`        Effort: ${option.effort} | Risk: ${option.riskLevel}`)
                  console.info(`        ${option.description}`)
                })

                if (bestOption) {
                  const strategy = planner.createMigrationStrategy(issue, bestOption)
                  if (strategy) {
                    console.info(`     Migration Duration: ${strategy.estimatedDuration}`)
                    console.info(`     Phases: ${strategy.phases.map((p) => p.name).join(' → ')}`)
                  }
                }
              }
            })

            if (!foundStrategies) {
              console.info(chalk.green('✅ No refactoring needed'))
            }
          } catch (error) {
            console.error(
              chalk.yellow(`⚠️  Could not generate strategies: ${(error as Error).message}`),
            )
          }
        }

        if (options.suggestRefactoring && !runComplete) {
          console.info(chalk.cyan('\n💡 ARCHITECTURE RECOMMENDATIONS'))
          console.info(chalk.gray('━'.repeat(60)))
          try {
            const engine = new DecisionEngine()
            const refactoring = engine.suggestRefactoring(domain)
            console.info(refactoring.formatted)
          } catch (error) {
            console.error(
              chalk.yellow(`⚠️  Could not generate suggestions: ${(error as Error).message}`),
            )
          }
        }

        if (
          !options.metrics &&
          !options.issues &&
          !options.refactor &&
          !options.suggestRefactoring &&
          !options.deep
        ) {
          // Default behavior: domain architecture analysis
          const engine = new DecisionEngine()
          const analysis = engine.analyzeDomain(domain)
          console.info(analysis.formatted)
        }
      } catch (error) {
        const errorMessage = (error as Error).message
        console.error(chalk.red(`❌ Error analyzing domain '${domain}': ${errorMessage}`))
        console.error(chalk.yellow('\nTip: Use --help for available options'))
        process.exit(1)
      }
    },
  )

// vtm session - Manage current task session
const sessionCommand = program.command('session').description('Manage current task session')

sessionCommand
  .command('get')
  .description('Get current task ID')
  .action(async () => {
    try {
      const session = new VTMSession()
      const currentTask = session.getCurrentTask()
      if (currentTask) {
        console.info(currentTask)
        process.exit(0)
      } else {
        process.exit(1)
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })

sessionCommand
  .command('set <task-id>')
  .description('Set current task ID')
  .action(async (taskId: string) => {
    try {
      const session = new VTMSession()
      session.setCurrentTask(taskId)
      console.info(chalk.green(`✅ Current task set to: ${taskId}`))
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })

sessionCommand
  .command('clear')
  .description('Clear current task and remove session file')
  .action(async () => {
    try {
      const session = new VTMSession()
      session.clearCurrentTask()
      console.info(chalk.green('✅ Session cleared'))
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })

// vtm history - Show transaction history
program
  .command('history [limit]')
  .description('Show VTM transaction history')
  .action(async (limit?: string) => {
    try {
      const vtmPath = path.resolve(process.cwd(), 'vtm.json')
      const history = new VTMHistory(vtmPath)

      const limitNum = limit ? parseInt(limit, 10) : 10
      const entries = await history.getHistory(limitNum)

      if (entries.length === 0) {
        console.info('No transaction history found.')
        return
      }

      console.info('\n📋 VTM Transaction History')
      console.info('═'.repeat(64))
      console.info('')

      for (const entry of entries) {
        console.info(`${entry.id}: ${entry.action} ${entry.tasks_added?.length || 0} tasks`)
        console.info(`  Source: ${entry.source}`)
        if (entry.files?.adr) {
          const adrName = path.basename(entry.files.adr)
          const specName = entry.files.spec ? path.basename(entry.files.spec) : ''
          console.info(`  Files: ${adrName}${specName ? ' + ' + specName : ''}`)
        }
        if (entry.tasks_added && entry.tasks_added.length > 0) {
          console.info(`  Tasks: ${entry.tasks_added.join(', ')}`)
        }
        console.info(`  Time: ${entry.timestamp.toLocaleString()}`)
        console.info('')
      }

      const stats = await history.getStats()
      console.info(`Total transactions: ${stats.totalEntries}`)

      // Calculate total tasks ingested
      const allEntries = await history.getHistory()
      const totalTasksIngested = allEntries.reduce(
        (sum, e) => sum + (e.tasks_added?.length || 0),
        0,
      )
      console.info(`Total tasks ingested: ${totalTasksIngested}`)
      console.info('')
    } catch (error) {
      console.error(chalk.red(`❌ Error reading history: ${(error as Error).message}`))
      process.exit(1)
    }
  })

// vtm history-detail <transaction-id> - Show transaction details
program
  .command('history-detail <transaction-id>')
  .description('Show detailed transaction information')
  .action(async (transactionId: string) => {
    try {
      const vtmPath = path.resolve(process.cwd(), 'vtm.json')
      const history = new VTMHistory(vtmPath)
      const reader = new VTMReader(vtmPath)

      const entry = await history.getEntry(transactionId)
      if (!entry) {
        console.error(chalk.red(`❌ Transaction not found: ${transactionId}`))
        process.exit(1)
      }

      console.info('\n📋 Transaction Details')
      console.info('═'.repeat(64))
      console.info('')
      console.info(`Transaction ID: ${entry.id}`)
      console.info(`Action: ${entry.action}`)
      console.info(`Source: ${entry.source}`)
      console.info(`Timestamp: ${entry.timestamp.toISOString()}`)
      console.info('')

      if (entry.files) {
        console.info('Files:')
        if (entry.files.adr) {
          console.info(`  ADR: ${entry.files.adr}`)
        }
        if (entry.files.spec) {
          console.info(`  Spec: ${entry.files.spec}`)
        }
        console.info('')
      }

      if (entry.tasks_added && entry.tasks_added.length > 0) {
        console.info('Tasks Added:')
        const vtm = await reader.load()
        for (const taskId of entry.tasks_added) {
          const task = vtm.tasks.find((t) => t.id === taskId)
          if (task) {
            console.info(`  • ${task.id}: ${task.title} [${task.status}]`)
          } else {
            console.info(`  • ${taskId}: (task removed)`)
          }
        }
        console.info('')
      }

      console.info('Rollback Status: Available')
      console.info(chalk.gray(`Run: vtm rollback ${transactionId} --dry-run`))
      console.info('')
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })

// vtm rollback - Rollback a transaction
program
  .command('rollback <transaction-id>')
  .description('Rollback a VTM transaction')
  .option('--dry-run', 'Preview rollback without executing')
  .option('--force', 'Skip confirmation prompt')
  .action(async (transactionId: string, options: { dryRun?: boolean; force?: boolean }) => {
    try {
      const vtmPath = path.resolve(process.cwd(), 'vtm.json')
      const history = new VTMHistory(vtmPath)
      const reader = new VTMReader(vtmPath)

      const entry = await history.getEntry(transactionId)
      if (!entry || !entry.tasks_added) {
        console.error(chalk.red(`❌ Transaction not found: ${transactionId}`))
        process.exit(1)
      }

      const details = await history.getRollbackDetails(transactionId)
      const vtm = await reader.load()

      // Show preview
      console.info('\n🔍 Rollback Preview')
      console.info('═'.repeat(64))
      console.info('')
      console.info(`Transaction: ${transactionId}`)
      console.info(`Source: ${entry.source}`)
      console.info(`Date: ${entry.timestamp.toLocaleString()}`)
      console.info('')

      console.info('Tasks to be removed:')
      for (const task of details.tasks) {
        const taskData = vtm.tasks.find((t) => t.id === task.id)
        const status = taskData?.status || 'unknown'
        console.info(`  ✓ ${task.id}: ${task.title} [${status}]`)
      }
      console.info('')

      // Check for issues
      const issues: string[] = []

      // Check for in-progress tasks
      for (const task of details.tasks) {
        const taskData = vtm.tasks.find((t) => t.id === task.id)
        if (taskData?.status === 'in-progress') {
          issues.push(`${task.id} is in-progress (started work)`)
        }
      }

      // Check for dependencies
      if (details.dependencies.length > 0) {
        for (const dep of details.dependencies) {
          issues.push(`${dep.taskId} depends on ${dep.dependsOn} (blocking dependency)`)
        }
      }

      if (issues.length > 0) {
        console.info(chalk.yellow('⚠️  Issues detected:'))
        issues.forEach((issue, i) => {
          console.info(chalk.yellow(`  ${i + 1}. ${issue}`))
        })
        console.info('')
      } else {
        console.info('Dependency Check:')
        console.info('  ✅ No blocking dependencies found')
        console.info('  ✅ Safe to rollback')
        console.info('')
      }

      if (options.dryRun) {
        console.info(chalk.cyan('This is a dry run. No changes will be made.'))
        console.info(chalk.cyan('Run without --dry-run to execute rollback.'))
        console.info('')
        return
      }

      // Confirmation prompt (unless --force)
      if (!options.force && issues.length > 0) {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        })

        const answer = await new Promise<string>((resolve) => {
          rl.question('Continue with rollback? (y/N): ', resolve)
        })

        rl.close()

        if (answer.toLowerCase() !== 'y') {
          console.info(chalk.yellow('Rollback cancelled.'))
          process.exit(0)
        }
      }

      // Execute rollback
      await history.rollback({
        transactionId,
        force: true, // Force because we've already checked dependencies
        dryRun: false,
      })

      console.info(chalk.green('\n✅ Rollback completed successfully'))
      console.info(chalk.green(`Removed ${details.tasks.length} task(s)`))
      console.info('')

      // Show updated stats
      const updatedVtm = await reader.load(true)
      console.info('📊 Updated Stats:')
      console.info(`   Total: ${updatedVtm.stats.total_tasks} tasks`)
      console.info(`   Pending: ${updatedVtm.stats.pending}`)
      console.info(`   In Progress: ${updatedVtm.stats.in_progress}`)
      console.info(`   Completed: ${updatedVtm.stats.completed}`)
      console.info('')
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })

// vtm cache-stats - Show cache statistics
program
  .command('cache-stats')
  .description('Show research cache statistics')
  .action(async () => {
    try {
      const cacheDir = process.env.CACHE_DIR || '.claude/cache/research'
      const cache = new ResearchCache(cacheDir)
      const stats = await cache.getStats()

      console.info('\n📊 Research Cache Statistics')
      console.info('═'.repeat(64))
      console.info()

      console.info('Cache Location:', cacheDir)
      const ttlMinutes = 30 * 24 * 60 // 30 days
      console.info('TTL:', `${ttlMinutes} minutes (${Math.floor(ttlMinutes / 60 / 24)} days)`)
      console.info()

      console.info('Performance:')
      console.info('  Cache hits:    ', stats.hits)
      console.info('  Cache misses:  ', stats.misses)
      console.info('  Hit rate:      ', `${stats.hitRate.toFixed(1)}%`)
      console.info()

      console.info('Storage:')
      console.info('  Total entries: ', stats.entriesCount)
      console.info('  Total size:    ', formatBytes(stats.totalSize))
      console.info()

      if (stats.entriesCount === 0) {
        console.info('Cache is empty. Research results will be cached on first use.')
      } else {
        console.info("💡 Tip: Use 'vtm cache clear' to remove old entries")
      }
      console.info()
    } catch (error) {
      console.error(chalk.red(`❌ Error reading cache: ${(error as Error).message}`))
      process.exit(1)
    }
  })

// vtm cache-clear - Clear cache entries
program
  .command('cache-clear')
  .description('Clear research cache')
  .option('--expired', 'Clear only expired entries')
  .option('--tag <tag>', 'Clear entries with specific tag')
  .option('--force', 'Skip confirmation prompt')
  .action(async (options: { expired?: boolean; tag?: string; force?: boolean }) => {
    try {
      const cacheDir = process.env.CACHE_DIR || '.claude/cache/research'
      const cache = new ResearchCache(cacheDir)
      const stats = await cache.getStats()

      // Handle empty cache
      if (stats.entriesCount === 0) {
        console.info('\nCache is empty. Nothing to clear.\n')
        return
      }

      // Clear expired entries
      if (options.expired) {
        console.info('\n🧹 Clearing Expired Cache')
        console.info('═'.repeat(64))
        console.info()
        console.info(`Checking for expired entries (TTL: 30 days)...`)
        console.info()

        await cache.clearExpired()

        const newStats = await cache.getStats()
        const cleared = stats.entriesCount - newStats.entriesCount
        const freedBytes = stats.totalSize - newStats.totalSize

        if (cleared === 0) {
          console.info('No expired entries found.')
        } else {
          console.info(`✅ Cleared ${cleared} entries (${formatBytes(freedBytes)} freed)`)
          console.info()
          console.info(
            `Remaining: ${newStats.entriesCount} entries (${formatBytes(newStats.totalSize)})`,
          )
        }
        console.info()
        return
      }

      // Clear by tag
      if (options.tag) {
        console.info('\n🏷️  Clearing Cache by Tag')
        console.info('═'.repeat(64))
        console.info()
        console.info(`Tag: ${options.tag}`)

        const entries = await cache.search([options.tag])
        console.info(`Found ${entries.length} matching entries`)
        console.info()

        if (entries.length === 0) {
          console.info('No entries found with this tag.')
          console.info()
          return
        }

        // Confirm unless --force
        if (!options.force) {
          const answer = await promptUser('Continue? (y/N): ')
          if (answer.toLowerCase() !== 'y') {
            console.info('Operation cancelled.')
            return
          }
        }

        // Clear entries by tag (manually delete each one)
        for (const entry of entries) {
          const filePath = path.join(cacheDir, entry.key)
          try {
            await fs.promises.unlink(filePath)
          } catch {
            // File already deleted
          }
        }

        const newStats = await cache.getStats()
        const freedBytes = stats.totalSize - newStats.totalSize

        console.info()
        console.info(`✅ Cleared ${entries.length} entries (${formatBytes(freedBytes)} freed)`)
        console.info()
        console.info(
          `Remaining: ${newStats.entriesCount} entries (${formatBytes(newStats.totalSize)})`,
        )
        console.info()
        return
      }

      // Clear all entries
      console.info('\n⚠️  Clearing All Cache')
      console.info('═'.repeat(64))
      console.info()
      console.info('This will remove all cached research results.')
      console.info()
      console.info('Current cache:')
      console.info(`  ${stats.entriesCount} entries (${formatBytes(stats.totalSize)})`)
      console.info()

      // Confirm unless --force
      if (!options.force) {
        const answer = await promptUser('Continue? (y/N): ')
        if (answer.toLowerCase() !== 'y') {
          console.info('Operation cancelled.')
          return
        }
      }

      await cache.clear()

      console.info()
      console.info(
        `✅ Cleared ${stats.entriesCount} entries (${formatBytes(stats.totalSize)} freed)`,
      )
      console.info()
    } catch (error) {
      console.error(chalk.red(`❌ Error clearing cache: ${(error as Error).message}`))
      process.exit(1)
    }
  })

// vtm cache-info - Show cache entry details
program
  .command('cache-info <query>')
  .description('Show information about a cache entry')
  .action(async (query: string) => {
    try {
      const cacheDir = process.env.CACHE_DIR || '.claude/cache/research'
      const cache = new ResearchCache(cacheDir)

      // Try to get the entry
      const result = await cache.get(query)

      if (!result) {
        console.error(chalk.red(`\n❌ Cache entry not found for query: ${query}\n`))
        process.exit(1)
      }

      // Get the entry details
      const key = cache['generateCacheKey'](query)
      const filePath = path.join(cacheDir, key)
      const fileStats = await fs.promises.stat(filePath)
      const content = await fs.promises.readFile(filePath, 'utf-8')
      const entry = JSON.parse(content)

      console.info('\n📄 Cache Entry Details')
      console.info('═'.repeat(64))
      console.info()

      console.info('Query:', entry.query)
      console.info('Key:', entry.key)
      console.info('Created:', formatAge(entry.timestamp))
      console.info('Size:', formatBytes(fileStats.size))
      console.info('Tags:', entry.tags.join(', '))
      console.info()

      console.info('Result Preview:')
      console.info('─'.repeat(64))
      const preview =
        entry.result.length > 300 ? entry.result.substring(0, 300) + '...' : entry.result
      console.info(preview)
      console.info('─'.repeat(64))
      console.info()
    } catch (error) {
      console.error(chalk.red(`❌ Error reading cache entry: ${(error as Error).message}`))
      process.exit(1)
    }
  })

// vtm create-specs - Batch create specs from ADRs
program
  .command('create-specs <pattern>')
  .description('Create technical specifications for multiple ADRs in batch')
  .option('--dry-run', 'Preview what would be created without creating files')
  .option('--with-tasks', 'Also generate VTM tasks from ADR+Spec pairs')
  .action(async (pattern: string, options: { dryRun?: boolean; withTasks?: boolean }) => {
    try {
      // Validate pattern
      if (!pattern || pattern.trim() === '') {
        console.error(chalk.red('❌ Error: ADR pattern is required'))
        console.info('')
        console.info('Usage: vtm create-specs <pattern> [--dry-run] [--with-tasks]')
        console.info('')
        console.info('Examples:')
        console.info('  vtm create-specs "docs/adr/ADR-*.md"')
        console.info('  vtm create-specs "docs/adr/ADR-001-*.md" --dry-run')
        console.info('  vtm create-specs "docs/adr/ADR-*.md" --with-tasks')
        process.exit(1)
      }

      // Find matching ADRs
      console.info(chalk.blue('\n📋 Batch Spec Creation'))
      console.info(chalk.gray('═'.repeat(50)))
      console.info('')

      const adrFiles = findMatchingAdrs(pattern)

      if (adrFiles.length === 0) {
        console.error(chalk.red(`❌ Error: No ADR files match pattern: ${pattern}`))
        console.info('')
        console.info(chalk.yellow('Available ADRs:'))

        // Try to list available ADRs
        const adrDir = path.dirname(pattern)
        if (fs.existsSync(adrDir)) {
          const files = fs
            .readdirSync(adrDir)
            .filter((f) => f.startsWith('ADR-') && f.endsWith('.md'))
          if (files.length > 0) {
            files.forEach((f) => console.info(chalk.gray(`  ${f}`)))
          } else {
            console.info(chalk.gray('  (no ADR files found)'))
          }
        }
        process.exit(1)
      }

      console.info(chalk.green(`✅ Found ${adrFiles.length} ADR file(s) matching: ${pattern}`))
      console.info('')

      adrFiles.forEach((file) => {
        console.info(chalk.gray(`  ✓ ${path.basename(file)}`))
      })

      // Check for existing specs
      const report = checkExistingSpecs(adrFiles)

      console.info('')
      console.info(chalk.blue('🔍 Checking for existing specs...'))
      console.info('')

      if (report.existing.length > 0) {
        console.info(chalk.yellow(`⚠️  ${report.existing.length} spec(s) already exist:`))
        report.existing.forEach((adrFile) => {
          const specName = generateSpecName(adrFile)
          console.info(chalk.gray(`   - spec-${specName}.md`))
        })
        console.info('')
        console.info(chalk.gray('⏭️  These will be skipped. Delete them first to regenerate.'))
        console.info('')
      }

      if (report.new.length === 0) {
        console.info(chalk.yellow('⚠️  All specs already exist. Nothing to create.'))
        console.info('')
        console.info(chalk.gray('Run these commands to regenerate:'))
        report.existing.forEach((adrFile) => {
          const specName = generateSpecName(adrFile)
          console.info(chalk.gray(`   rm test-data/specs/spec-${specName}.md`))
        })
        process.exit(0)
      }

      console.info(chalk.green(`📝 Will create ${report.new.length} new spec(s)`))
      console.info('')

      // Dry run mode
      if (options.dryRun) {
        console.info(chalk.blue('📋 Specs that would be created (dry-run):'))
        console.info('')

        report.new.forEach((adrFile) => {
          const specName = generateSpecName(adrFile)
          const specPath = path.join('test-data', 'specs', `spec-${specName}.md`)
          console.info(chalk.gray(`  ✓ ${specPath}`))
        })

        console.info('')
        console.info(chalk.green('✅ Dry run complete. No files created.'))
        console.info(chalk.gray('   Run without --dry-run to actually create specs.'))
        console.info('')

        if (options.withTasks) {
          console.info(chalk.blue('📋 VTM task batches that would be created:'))
          console.info('')
          report.new.forEach((adrFile) => {
            const specName = generateSpecName(adrFile)
            const specFile = `test-data/specs/spec-${specName}.md`
            console.info(
              chalk.gray(`  ✓ Tasks from: ${path.basename(adrFile)} + ${path.basename(specFile)}`),
            )
          })
          console.info('')
        }

        process.exit(0)
      }

      // Non-dry-run mode would create files here
      // For now, just show a message
      console.info(chalk.yellow('⚠️  Spec creation not implemented yet'))
      console.info(
        chalk.gray('   This command currently only supports --dry-run mode for preview purposes.'),
      )
      console.info('')
      console.info(chalk.blue('📋 Next steps:'))
      console.info(chalk.gray('   1. Implement spec generation logic in batch-spec-creator.ts'))
      console.info(chalk.gray('   2. Integrate with /helpers:thinking-partner for research'))
      console.info(chalk.gray('   3. Support --with-tasks flag for VTM task generation'))
      console.info('')

      if (options.withTasks) {
        console.info(chalk.yellow('⚠️  --with-tasks flag not implemented yet'))
        console.info('')
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })

// vtm validate-task - Validate task completion against quality standards
program
  .command('validate-task <task-id>')
  .description('Validate task completion against quality standards')
  .option(
    '--skip <checks>',
    'Skip specific checks (comma-separated: jsdoc,coverage,eslint,typescript,acceptance-criteria)',
  )
  .option('--fix', 'Auto-fix linting issues')
  .action(async (taskId: string, options: { skip?: string; fix?: boolean }) => {
    try {
      const reader = new VTMReader()
      const task = await reader.getTask(taskId)

      if (!task) {
        console.error(chalk.red(`\n❌ Task ${taskId} not found\n`))
        process.exit(1)
      }

      console.info(chalk.blue(`\n📋 Validating Task: ${task.id}\n`))
      console.info(chalk.bold(`Title: ${task.title}`))
      console.info(chalk.gray(`Status: ${task.status}`))
      console.info(chalk.gray(`Test Strategy: ${task.test_strategy}`))
      console.info(chalk.gray(`Risk: ${task.risk}`))
      console.info('')

      // Parse skip checks
      const skipChecks = options.skip ? options.skip.split(',').map((s) => s.trim()) : []

      // Run validation
      const validator = new TaskQualityValidator()
      const report = await validator.validateTask(task, {
        skip: skipChecks,
        fix: options.fix || false,
      })

      // Display results
      console.info(chalk.blue('═'.repeat(60)))
      console.info(chalk.bold('Quality Validation Results'))
      console.info(chalk.blue('═'.repeat(60)))
      console.info('')

      // Display each check
      for (const check of report.checks) {
        const statusIcon =
          check.status === 'pass'
            ? chalk.green('✅')
            : check.status === 'fail'
              ? chalk.red('❌')
              : check.status === 'warning'
                ? chalk.yellow('⚠️ ')
                : chalk.gray('⊘ ')

        console.info(`${statusIcon}  ${check.name}`)
        console.info(`   ${check.message}`)

        if (check.details && check.details.length > 0) {
          check.details.forEach((detail) => {
            console.info(chalk.gray(`   • ${detail}`))
          })
        }
        console.info('')
      }

      // Display summary
      console.info(chalk.blue('─'.repeat(60)))
      console.info(chalk.bold('Summary'))
      console.info(chalk.blue('─'.repeat(60)))
      console.info(`Passed:  ${chalk.green(`${report.summary.passed}/${report.checks.length}`)}`)
      console.info(
        `Failed:  ${report.summary.failed > 0 ? chalk.red(String(report.summary.failed)) : chalk.green('0')}`,
      )
      if (report.summary.warnings > 0) {
        console.info(`Warnings: ${chalk.yellow(String(report.summary.warnings))}`)
      }
      if (report.summary.skipped > 0) {
        console.info(`Skipped:  ${chalk.gray(String(report.summary.skipped))}`)
      }
      console.info('')

      // Display overall status
      if (report.overallStatus === 'pass') {
        console.info(chalk.green(chalk.bold('✅ VALIDATION PASSED')))
      } else {
        console.info(chalk.red(chalk.bold('❌ VALIDATION FAILED')))
      }
      console.info('')

      // Display suggestions if there are failures
      if (report.suggestions.length > 0) {
        console.info(chalk.blue('─'.repeat(60)))
        console.info(chalk.bold('Suggested Fixes'))
        console.info(chalk.blue('─'.repeat(60)))
        report.suggestions.forEach((suggestion, i) => {
          console.info(`${i + 1}. ${suggestion}`)
        })
        console.info('')
      }

      // Display next steps
      console.info(chalk.blue('─'.repeat(60)))
      console.info(chalk.bold('Next Steps'))
      console.info(chalk.blue('─'.repeat(60)))

      if (report.overallStatus === 'pass') {
        console.info('✅ Task ready for completion!')
        console.info(`   Run: vtm complete ${taskId}`)
      } else {
        if (options.fix) {
          console.info('1. Linting issues have been auto-fixed')
        } else if (report.checks.some((c) => c.name === 'ESLint' && c.status === 'fail')) {
          console.info('1. Run: pnpm lint:fix')
        }

        if (report.checks.some((c) => c.name === 'JSDoc Coverage' && c.status === 'fail')) {
          console.info('2. Add JSDoc comments to public functions')
        }

        if (report.checks.some((c) => c.name === 'Test Coverage' && c.status === 'fail')) {
          console.info('3. Increase test coverage: pnpm test -- --coverage')
        }

        if (report.checks.some((c) => c.name === 'TypeScript Build' && c.status === 'fail')) {
          console.info('4. Fix TypeScript errors: pnpm build')
        }

        if (report.checks.some((c) => c.name === 'Acceptance Criteria' && c.status === 'fail')) {
          console.info('5. Mark acceptance criteria as verified in vtm.json')
        }

        console.info('\nRun validation again with: vtm validate-task ' + taskId)
      }
      console.info('')

      // Exit with appropriate code
      process.exit(report.overallStatus === 'pass' ? 0 : 1)
    } catch (error) {
      console.error(chalk.red(`\n❌ Error: ${(error as Error).message}\n`))
      process.exit(1)
    }
  })

program.parse()
