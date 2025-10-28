// src/lib/vtm-writer.ts

import { writeFile, rename } from 'fs/promises';
import { resolve } from 'path';
import { VTM, Task, TaskUpdate, VTMStats } from './types';
import { VTMReader } from './vtm-reader';

export class VTMWriter {
  private vtmPath: string;
  private reader: VTMReader;

  constructor(vtmPath: string = 'vtm.json') {
    this.vtmPath = resolve(process.cwd(), vtmPath);
    this.reader = new VTMReader(vtmPath);
  }

  async updateTask(taskId: string, updates: TaskUpdate): Promise<void> {
    const vtm = await this.reader.load(true); // Force reload

    const taskIndex = vtm.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error(\`Task \${taskId} not found\`);

    // Merge updates
    const updatedTask = {
      ...vtm.tasks[taskIndex],
      ...updates
    };

    // Merge nested objects
    if (updates.validation) {
      updatedTask.validation = {
        ...vtm.tasks[taskIndex].validation,
        ...updates.validation
      };
    }

    if (updates.files?.created) {
      updatedTask.files = {
        ...vtm.tasks[taskIndex].files,
        create: [
          ...vtm.tasks[taskIndex].files.create,
          ...updates.files.created
        ]
      };
    }

    vtm.tasks[taskIndex] = updatedTask;

    // Update stats
    vtm.stats = this.recalculateStats(vtm.tasks);

    // Atomic write
    await this.atomicWrite(this.vtmPath, JSON.stringify(vtm, null, 2));
  }

  async appendTasks(newTasks: Task[]): Promise<void> {
    const vtm = await this.reader.load(true);
    
    // Append new tasks
    vtm.tasks.push(...newTasks);

    // Update stats
    vtm.stats = this.recalculateStats(vtm.tasks);

    await this.atomicWrite(this.vtmPath, JSON.stringify(vtm, null, 2));
  }

  private async atomicWrite(path: string, content: string): Promise<void> {
    const temp = \`\${path}.tmp\`;
    await writeFile(temp, content, 'utf-8');
    await rename(temp, path);
  }

  private recalculateStats(tasks: Task[]): VTMStats {
    return {
      total_tasks: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      in_progress: tasks.filter(t => t.status === 'in-progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      blocked: tasks.filter(t => t.status === 'blocked').length
    };
  }
}
