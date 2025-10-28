#!/usr/bin/env node

// src/index.ts

import { Command } from 'commander';
import chalk from 'chalk';
import { VTMReader, VTMWriter, ContextBuilder } from './lib';

const program = new Command();

program
  .name('vtm')
  .description('Virtual Task Manager CLI - Token-efficient task management for Claude Code')
  .version('2.0.0');

// vtm next - Show next available tasks
program
  .command('next')
  .description('Show next available tasks')
  .option('-n, --number <count>', 'Number of tasks to show', '5')
  .action(async (options) => {
    try {
      const reader = new VTMReader();
      const tasks = await reader.getReadyTasks();
      
      console.log(chalk.blue(\`\n📋 Ready Tasks (\${tasks.length}):\n\`));
      
      if (tasks.length === 0) {
        console.log(chalk.yellow('No tasks ready. Check blocked or in-progress tasks.'));
        return;
      }

      tasks.slice(0, parseInt(options.number)).forEach(task => {
        console.log(chalk.bold(\`\${task.id}\`) + chalk.gray(\` [\${task.estimated_hours}h]\`) + \` │ \${task.title}\`);
        console.log(chalk.gray(\`  Risk: \${task.risk} │ Test: \${task.test_strategy}\`));
        console.log(chalk.gray(\`  Deps: ✅ \${task.dependencies.join(', ') || 'none'}\`));
        console.log(chalk.gray(\`  From: \${task.adr_source}\`));
        console.log();
      });

      console.log(chalk.cyan(\`Use: vtm context <id> to get full context for Claude\`));
    } catch (error) {
      console.error(chalk.red(\`Error: \${(error as Error).message}\`));
      process.exit(1);
    }
  });

// vtm context <id> - Generate minimal context
program
  .command('context <id>')
  .description('Generate minimal context for Claude')
  .option('--compact', 'Ultra-compact format for tight token budgets')
  .action(async (id, options) => {
    try {
      const builder = new ContextBuilder();
      const context = options.compact 
        ? await builder.buildCompactContext(id)
        : await builder.buildMinimalContext(id);
      
      console.log(context);
      console.log(chalk.green(\`\n✅ Context ready for Claude Code\`));
      console.log(chalk.cyan(\`Estimated tokens: ~\${Math.ceil(context.length / 4)}\`));
    } catch (error) {
      console.error(chalk.red(\`Error: \${(error as Error).message}\`));
      process.exit(1);
    }
  });

// vtm task <id> - Get single task JSON
program
  .command('task <id>')
  .description('Get single task details')
  .option('--json', 'Output as JSON')
  .action(async (id, options) => {
    try {
      const reader = new VTMReader();
      const task = await reader.getTask(id);
      
      if (!task) {
        console.error(chalk.red(\`Task \${id} not found\`));
        process.exit(1);
      }

      if (options.json) {
        console.log(JSON.stringify(task, null, 2));
      } else {
        console.log(chalk.bold(\`\n\${task.id}: \${task.title}\`));
        console.log(chalk.gray(\`Status: \${task.status}\`));
        console.log(chalk.gray(\`Risk: \${task.risk} | Test: \${task.test_strategy}\`));
        console.log(\`\nDescription: \${task.description}\`);
        console.log(\`\nAcceptance Criteria:\`);
        task.acceptance_criteria.forEach((ac, i) => {
          console.log(\`  \${i + 1}. \${ac}\`);
        });
      }
    } catch (error) {
      console.error(chalk.red(\`Error: \${(error as Error).message}\`));
      process.exit(1);
    }
  });

// vtm start <id> - Mark task as in-progress
program
  .command('start <id>')
  .description('Mark task as in-progress')
  .action(async (id) => {
    try {
      const writer = new VTMWriter();
      await writer.updateTask(id, {
        status: 'in-progress',
        started_at: new Date().toISOString()
      });
      console.log(chalk.green(\`✅ Task \${id} marked as in-progress\`));
      console.log(chalk.cyan(\`📅 Started at: \${new Date().toISOString()}\`));
      console.log(\`\nNext steps:\`);
      console.log(\`1. vtm context \${id}\`);
      console.log(\`2. Copy to Claude Code\`);
      console.log(\`3. Run TDD cycle\`);
      console.log(\`4. vtm complete \${id}\`);
    } catch (error) {
      console.error(chalk.red(\`Error: \${(error as Error).message}\`));
      process.exit(1);
    }
  });

// vtm complete <id> - Mark task as completed
program
  .command('complete <id>')
  .description('Mark task as completed')
  .option('--commits <commits>', 'Comma-separated commit SHAs')
  .option('--files-created <files>', 'Comma-separated file paths')
  .option('--tests-pass', 'All tests passing')
  .action(async (id, options) => {
    try {
      const writer = new VTMWriter();
      const reader = new VTMReader();
      
      await writer.updateTask(id, {
        status: 'completed',
        completed_at: new Date().toISOString(),
        commits: options.commits?.split(',') || [],
        files: {
          created: options.filesCreated?.split(',') || []
        },
        validation: {
          tests_pass: options.testsPass || false
        }
      });

      console.log(chalk.green(\`✅ Task \${id} marked as completed\`));
      console.log(chalk.cyan(\`📅 Completed at: \${new Date().toISOString()}\`));

      const vtm = await reader.load(true);
      console.log(\`\n📊 Updated Stats:\`);
      console.log(\`   Completed: \${vtm.stats.completed}/\${vtm.stats.total_tasks}\`);
      console.log(\`   Progress: \${((vtm.stats.completed / vtm.stats.total_tasks) * 100).toFixed(1)}%\`);

      const ready = await reader.getReadyTasks();
      if (ready.length > 0) {
        console.log(chalk.green(\`\n🚀 New tasks available:\`));
        ready.slice(0, 3).forEach(t => {
          console.log(\`   \${t.id}: \${t.title}\`);
        });
      }
    } catch (error) {
      console.error(chalk.red(\`Error: \${(error as Error).message}\`));
      process.exit(1);
    }
  });

// vtm stats - Show project statistics
program
  .command('stats')
  .description('Show project statistics')
  .action(async () => {
    try {
      const reader = new VTMReader();
      const vtm = await reader.load();
      const statsByADR = await reader.getStatsByADR();
      const ready = await reader.getReadyTasks();
      const blocked = await reader.getBlockedTasks();
      const inProgress = await reader.getInProgressTasks();

      console.log(chalk.bold(\`\n📊 Project Statistics\`));
      console.log('━'.repeat(40));
      console.log(\`Total Tasks:      \${vtm.stats.total_tasks}\`);
      console.log(chalk.green(\`Completed:        \${vtm.stats.completed} (\${((vtm.stats.completed / vtm.stats.total_tasks) * 100).toFixed(1)}%)\`));
      console.log(chalk.yellow(\`In Progress:      \${vtm.stats.in_progress}\`));
      console.log(chalk.gray(\`Pending:          \${vtm.stats.pending}\`));
      if (vtm.stats.blocked > 0) {
        console.log(chalk.red(\`Blocked:          \${vtm.stats.blocked}\`));
      }

      console.log(chalk.bold(\`\n📈 Progress by ADR:\`));
      Object.entries(statsByADR).forEach(([adr, stats]) => {
        const pct = (stats.completed / stats.total) * 100;
        const bar = '█'.repeat(Math.floor(pct / 10)) + '░'.repeat(10 - Math.floor(pct / 10));
        console.log(\`\${adr.padEnd(30)} \${bar} \${pct.toFixed(0)}% (\${stats.completed}/\${stats.total})\`);
      });

      console.log(chalk.bold(\`\n🎯 Current Status:\`));
      console.log(chalk.green(\`Ready to Start:   \${ready.length}\`));
      if (inProgress.length > 0) {
        console.log(chalk.yellow(\`In Progress:      \${inProgress.length}\`));
        inProgress.forEach(t => {
          console.log(chalk.gray(\`  - \${t.id}: \${t.title}\`));
        });
      }
      if (blocked.length > 0) {
        console.log(chalk.red(\`⚠️  Blocked Tasks:   \${blocked.length}\`));
      }
    } catch (error) {
      console.error(chalk.red(\`Error: \${(error as Error).message}\`));
      process.exit(1);
    }
  });

// vtm list - List all tasks with filters
program
  .command('list')
  .description('List tasks with optional filters')
  .option('-s, --status <status>', 'Filter by status (pending|in-progress|completed|blocked)')
  .option('-a, --adr <adr>', 'Filter by ADR source')
  .action(async (options) => {
    try {
      const reader = new VTMReader();
      const vtm = await reader.load();
      let tasks = vtm.tasks;

      if (options.status) {
        tasks = tasks.filter(t => t.status === options.status);
      }

      if (options.adr) {
        tasks = tasks.filter(t => t.adr_source.includes(options.adr));
      }

      console.log(chalk.blue(\`\n📋 Tasks (\${tasks.length}):\n\`));
      tasks.forEach(task => {
        const statusColor = 
          task.status === 'completed' ? chalk.green :
          task.status === 'in-progress' ? chalk.yellow :
          task.status === 'blocked' ? chalk.red :
          chalk.gray;

        console.log(statusColor(\`\${task.id}\`) + \` │ \${task.title}\`);
        console.log(chalk.gray(\`  Status: \${task.status} | Risk: \${task.risk} | \${task.estimated_hours}h\`));
        console.log();
      });
    } catch (error) {
      console.error(chalk.red(\`Error: \${(error as Error).message}\`));
      process.exit(1);
    }
  });

program.parse();
