import * as fs from 'fs'
import type { VTM } from './types'

/**
 * Summary of incomplete tasks with completed capabilities
 * Used for token-efficient context passing to agents
 */
export type VTMSummary = {
  incomplete_tasks: IncompleteTask[]
  completed_capabilities: string[]
}

/**
 * Simplified task structure for incomplete tasks
 * Includes all essential info, optimized for agent context
 */
export type IncompleteTask = {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'blocked'
  estimated_hours: number
  risk: 'low' | 'medium' | 'high'
  test_strategy: 'TDD' | 'Unit' | 'Integration' | 'Direct'
  dependencies?: string[]
}

/**
 * VTMSummarizer - Generate token-efficient summaries of VTM state
 *
 * Usage:
 *   const summarizer = new VTMSummarizer('vtm.json')
 *   const summary = await summarizer.generateSummary()
 *   const json = summarizer.toJSON(summary)
 *
 * Benefits:
 *   - Filters VTM to incomplete tasks only (70% token reduction)
 *   - Summarizes completed work as capabilities
 *   - Provides context for agent dependency analysis
 */
export class VTMSummarizer {
  private vtmPath: string

  constructor(vtmPath: string = 'vtm.json') {
    this.vtmPath = vtmPath
  }

  /**
   * Generate summary of incomplete tasks + completed capabilities
   */
  async generateSummary(): Promise<VTMSummary> {
    const content = fs.readFileSync(this.vtmPath, 'utf-8')
    const vtm: VTM = JSON.parse(content)

    // Filter to incomplete tasks (pending, in-progress, blocked)
    const incompleteTasks = vtm.tasks.filter(
      (task) =>
        task.status === 'pending' || task.status === 'in-progress' || task.status === 'blocked',
    )

    // Summarize completed tasks as capabilities (just titles)
    const completedCapabilities = vtm.tasks
      .filter((task) => task.status === 'completed')
      .map((task) => task.title)

    // Build incomplete_tasks summary
    const incompleteTasksSummary: IncompleteTask[] = incompleteTasks.map((task) => {
      const base = {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status as 'pending' | 'in-progress' | 'blocked',
        estimated_hours: task.estimated_hours,
        risk: task.risk,
        test_strategy: task.test_strategy,
      }
      // Only include dependencies if they exist
      return task.dependencies.length > 0
        ? { ...base, dependencies: task.dependencies.map(String) }
        : base
    })

    return {
      incomplete_tasks: incompleteTasksSummary,
      completed_capabilities: completedCapabilities,
    }
  }

  /**
   * Convert summary to formatted JSON string
   */
  toJSON(summary: VTMSummary): string {
    return JSON.stringify(summary, null, 2)
  }

  /**
   * Generate summary and return as JSON string
   */
  async generateSummaryJSON(): Promise<string> {
    const summary = await this.generateSummary()
    return this.toJSON(summary)
  }
}
