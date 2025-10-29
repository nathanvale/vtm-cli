// src/lib/vtm-reader.ts

import { readFile, stat } from 'fs/promises'
import type { VTM, Task, TaskContext } from './types'
import { resolve } from 'path'

export class VTMReader {
  private vtm: VTM | null = null
  private lastModified: number = 0
  private vtmPath: string

  constructor(vtmPath: string = 'vtm.json') {
    this.vtmPath = resolve(process.cwd(), vtmPath)
  }

  async load(force = false): Promise<VTM> {
    try {
      const stats = await stat(this.vtmPath)

      if (!force && this.vtm && stats.mtimeMs === this.lastModified) {
        return this.vtm
      }

      const content = await readFile(this.vtmPath, 'utf-8')
      this.vtm = JSON.parse(content) as VTM
      this.lastModified = stats.mtimeMs
      return this.vtm as VTM
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(`VTM file not found at ${this.vtmPath}. Run 'vtm init' to create one.`)
      }
      throw error
    }
  }

  async getTask(id: string): Promise<Task | null> {
    const vtm = await this.load()
    return vtm.tasks.find((t) => t.id === id) || null
  }

  async getReadyTasks(): Promise<Task[]> {
    const vtm = await this.load()
    const completed = new Set(vtm.tasks.filter((t) => t.status === 'completed').map((t) => t.id))

    return vtm.tasks.filter((task) => {
      if (task.status !== 'pending') return false
      return task.dependencies.every((dep) => completed.has(String(dep)))
    })
  }

  async getTaskWithContext(id: string): Promise<TaskContext> {
    const vtm = await this.load()
    const task = await this.getTask(id)
    if (!task) throw new Error(`Task ${id} not found`)

    const deps = task.dependencies
      .map((depId) => vtm.tasks.find((t) => t.id === depId))
      .filter((t): t is Task => t !== undefined)

    const blockedTasks = vtm.tasks.filter(
      (t) => t.dependencies.includes(id) && t.status === 'pending',
    )

    return { task, dependencies: deps, blockedTasks }
  }

  async getStatsByADR(): Promise<Record<string, { total: number; completed: number }>> {
    const vtm = await this.load()
    const stats: Record<string, { total: number; completed: number }> = {}

    vtm.tasks.forEach((task) => {
      if (!stats[task.adr_source]) {
        stats[task.adr_source] = { total: 0, completed: 0 }
      }
      const adrStats = stats[task.adr_source]!
      adrStats.total++
      if (task.status === 'completed') {
        adrStats.completed++
      }
    })

    return stats
  }

  async getBlockedTasks(): Promise<Task[]> {
    const vtm = await this.load()
    return vtm.tasks.filter((t) => t.status === 'blocked')
  }

  async getInProgressTasks(): Promise<Task[]> {
    const vtm = await this.load()
    return vtm.tasks.filter((t) => t.status === 'in-progress')
  }
}
