#!/usr/bin/env node

// src/index.ts

import { Command } from 'commander'
import chalk from 'chalk'
import * as fs from 'fs'
import { VTMReader, VTMWriter, ContextBuilder, VTMSummarizer } from './lib'

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

program.parse()
