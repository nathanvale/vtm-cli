# Technical Specification: Task Manager CLI

## Overview
This document specifies the technical implementation details for the Virtual Task Manager CLI based on ADR-001.

## Architecture

### Components
1. **VTMReader**: Efficient reading and caching of task data
2. **VTMWriter**: Safe, atomic writes to prevent data corruption
3. **ContextBuilder**: Generate minimal context for Claude Code
4. **CLI Commands**: User-facing command interface

### Data Model

#### VTM (Virtual Task Manifest)
\`\`\`typescript
interface VTM {
  version: string;
  project: {
    name: string;
    description: string;
  };
  stats: {
    total_tasks: number;
    completed: number;
    in_progress: number;
    pending: number;
    blocked: number;
  };
  tasks: Task[];
}
\`\`\`

#### Task
\`\`\`typescript
interface Task {
  id: string;                    // e.g., "TASK-001"
  adr_source: string;            // Source ADR file
  spec_source: string;           // Source spec file
  title: string;
  description: string;
  acceptance_criteria: string[]; // Testable success criteria
  dependencies: string[];        // Task IDs this depends on
  blocks: string[];              // Task IDs blocked by this
  test_strategy: 'TDD' | 'Unit' | 'Integration' | 'Direct';
  test_strategy_rationale: string;
  estimated_hours: number;
  risk: 'low' | 'medium' | 'high';
  files: {
    create: string[];
    modify: string[];
    delete: string[];
  };
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  started_at: string | null;
  completed_at: string | null;
  commits: string[];
  validation: {
    tests_pass: boolean;
    ac_verified: string[];
  };
}
\`\`\`

## CLI Commands

### \`vtm next\`
**Purpose**: Show next available tasks (dependencies met)
**Token Cost**: ~500 tokens
**Output**: List of 1-5 ready tasks with metadata

### \`vtm context <id>\`
**Purpose**: Generate minimal context for Claude
**Token Cost**: ~2,000 tokens
**Output**: Markdown context with task details, dependencies, files

### \`vtm start <id>\`
**Purpose**: Mark task as in-progress
**Token Cost**: ~100 tokens
**Side Effects**: Updates vtm.json with status and timestamp

### \`vtm complete <id>\`
**Purpose**: Mark task as completed
**Token Cost**: ~200 tokens
**Side Effects**: Updates status, shows new available tasks

### \`vtm stats\`
**Purpose**: Show project statistics
**Token Cost**: ~300 tokens
**Output**: Progress overview, ADR breakdown, ready tasks

### \`vtm list\`
**Purpose**: List all tasks with filters
**Options**: \`--status\`, \`--adr\`
**Token Cost**: Variable (100-1000 tokens)

## Implementation Details

### Caching Strategy
- VTMReader caches loaded VTM in memory
- Tracks file modification time (mtime)
- Reloads only if file changed
- Force reload option for write operations

### Atomic Writes
- Write to temporary file (\`.tmp\`)
- Validate JSON structure
- Rename to target file (atomic operation)
- Prevents corruption on crash/interrupt

### Dependency Resolution
- Build completed task set
- Filter tasks where all dependencies completed
- Return in order of task ID

### Context Generation
- Load task + dependencies
- Extract relevant file information
- Format as markdown
- Estimate token count (chars / 4)

## Test Strategy

### Unit Tests
- VTMReader: load, getTask, getReadyTasks
- VTMWriter: updateTask, atomicWrite
- ContextBuilder: buildMinimalContext

### Integration Tests
- Full command execution
- File system operations
- Error scenarios

### Test Data
- Example vtm.json with 5-10 tasks
- Various dependency configurations
- Edge cases (circular deps, missing files)

## Error Handling

### Missing VTM File
- Clear error message
- Suggest initialization command
- Exit code 1

### Invalid Task ID
- "Task not found" error
- List available tasks
- Exit code 1

### Corrupted JSON
- Parse error with line number
- Backup suggestion
- Exit code 1

### Concurrent Writes
- Last write wins (acceptable for solo use)
- Future: File locking for team use

## Performance Requirements

### Startup Time
- < 100ms for cached operations
- < 500ms for cold start

### Memory Usage
- < 50MB for 1000 tasks
- O(n) space complexity

### Token Efficiency
- 99% reduction vs loading full VTM
- Context always < 3000 tokens
