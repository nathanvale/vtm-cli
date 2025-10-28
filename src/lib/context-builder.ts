// src/lib/context-builder.ts

import { VTMReader } from './vtm-reader';

export class ContextBuilder {
  private reader: VTMReader;

  constructor(vtmPath?: string) {
    this.reader = new VTMReader(vtmPath);
  }

  async buildMinimalContext(taskId: string): Promise<string> {
    const { task, dependencies, blockedTasks } = await this.reader.getTaskWithContext(taskId);

    let context = \`# Task Context: \${task.id}\n\n\`;
    
    context += \`## Task Details\n\`;
    context += \`**Title**: \${task.title}\n\`;
    context += \`**Status**: \${task.status}\n\`;
    context += \`**Test Strategy**: \${task.test_strategy}\n\`;
    context += \`**Risk**: \${task.risk}\n\`;
    context += \`**Estimated**: \${task.estimated_hours}h\n\n\`;
    
    context += \`**Description**:\n\${task.description}\n\n\`;
    
    context += \`## Acceptance Criteria\n\`;
    task.acceptance_criteria.forEach((ac, i) => {
      context += \`- AC\${i + 1}: \${ac}\n\`;
    });
    
    if (dependencies.length > 0) {
      context += \`\n## Dependencies (\${dependencies.length} completed)\n\`;
      dependencies.forEach(dep => {
        context += \`✅ \${dep.id}: \${dep.title}\n\`;
        if (dep.files?.create?.length) {
          context += \`   Files created: \${dep.files.create.join(', ')}\n\`;
        }
      });
    }

    context += \`\n## Files to Create\n\`;
    if (task.files.create.length === 0) {
      context += \`- (none)\n\`;
    } else {
      task.files.create.forEach(f => context += \`- \${f}\n\`);
    }

    if (task.files.modify.length > 0) {
      context += \`\n## Files to Modify\n\`;
      task.files.modify.forEach(f => context += \`- \${f}\n\`);
    }

    if (task.files.delete.length > 0) {
      context += \`\n## Files to Delete\n\`;
      task.files.delete.forEach(f => context += \`- \${f}\n\`);
    }

    context += \`\n## Source Documents\n\`;
    context += \`- ADR: \${task.adr_source}\n\`;
    context += \`- Spec: \${task.spec_source}\n\`;

    context += \`\n## Test Strategy Rationale\n\`;
    context += \`\${task.test_strategy_rationale}\n\`;

    if (blockedTasks.length > 0) {
      context += \`\n## Tasks Blocked by This\n\`;
      blockedTasks.forEach(t => {
        context += \`- \${t.id}: \${t.title}\n\`;
      });
    }

    return context;
  }

  async buildCompactContext(taskId: string): Promise<string> {
    const { task } = await this.reader.getTaskWithContext(taskId);

    return \`Task \${task.id}: \${task.title}
Test: \${task.test_strategy}
ACs: \${task.acceptance_criteria.join(' | ')}
Files: \${task.files.create.join(', ')}\`;
  }
}
