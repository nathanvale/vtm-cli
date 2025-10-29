/**
 * Tests for vtm history and rollback CLI commands
 *
 * TDD Implementation following Red-Green-Refactor cycle
 * Testing CLI commands that expose VTMHistory library functionality
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import type { VTM, Task } from '../lib/types'

const execAsync = promisify(exec)

/**
 * Helper function to create a test VTM file with history
 */
async function createTestVtmWithHistory(options?: {
  tasks?: Task[]
  history?: Array<{
    id: string
    action: 'ingest' | 'update' | 'delete'
    timestamp: string
    source: string
    tasks_added?: string[]
    files?: Record<string, string>
  }>
}): Promise<string> {
  const tempFile = path.join(os.tmpdir(), `test-vtm-${Date.now()}-${Math.random()}.json`)

  const defaultTask: Task = {
    id: 'TASK-042',
    title: 'Implement OAuth2 authorization flow',
    status: 'pending',
    adr_source: 'ADR-001-oauth2-auth.md',
    spec_source: 'spec-oauth2-auth.md',
    description: 'Implement OAuth2 flow',
    acceptance_criteria: ['AC1', 'AC2'],
    dependencies: [],
    blocks: [],
    test_strategy: 'TDD',
    test_strategy_rationale: 'High risk auth flow',
    estimated_hours: 8,
    risk: 'high',
    files: { create: [], modify: [], delete: [] },
    started_at: null,
    completed_at: null,
    commits: [],
    validation: { tests_pass: false, ac_verified: [] },
  }

  const vtm: VTM & { history?: unknown[] } = {
    version: '1.0',
    project: {
      name: 'Test Project',
      description: 'Test project for history CLI',
    },
    stats: {
      total_tasks: options?.tasks?.length || 1,
      completed: 0,
      in_progress: 0,
      pending: options?.tasks?.length || 1,
      blocked: 0,
    },
    tasks: options?.tasks || [defaultTask],
    history: options?.history || [],
  }

  await fs.writeFile(tempFile, JSON.stringify(vtm, null, 2))
  return tempFile
}

/**
 * Helper to execute CLI command in temp directory
 */
async function execCliCommand(command: string, cwd: string): Promise<{ stdout: string; stderr: string }> {
  // Use absolute path to the built CLI
  const cliPath = path.resolve(__dirname, '../../dist/index.js')
  const fullCommand = command.replace('node dist/index.js', `node ${cliPath}`)
  const { stdout, stderr } = await execAsync(fullCommand, { cwd })
  return { stdout, stderr }
}

describe('vtm history [limit] - List transaction history', () => {
  let tempDir: string
  let vtmPath: string

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `vtm-test-${Date.now()}`)
    await fs.mkdir(tempDir, { recursive: true })
  })

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (e) {
      // Ignore cleanup errors
    }
  })

  it('shows last 10 transactions by default', async () => {
    // RED: Write failing test first
    const history = Array.from({ length: 15 }, (_, i) => ({
      id: `2025-10-30-${String(i + 1).padStart(3, '0')}`,
      action: 'ingest' as const,
      timestamp: new Date(Date.now() - (15 - i) * 60000).toISOString(),
      source: '/plan:to-vtm',
      tasks_added: [`TASK-${String(i + 100).padStart(3, '0')}`],
    }))

    vtmPath = await createTestVtmWithHistory({ history })
    await fs.copyFile(vtmPath, path.join(tempDir, 'vtm.json'))

    const { stdout } = await execCliCommand('node dist/index.js history', tempDir)

    expect(stdout).toContain('VTM Transaction History')
    // Should show only 10 most recent (15-5 through 15)
    expect(stdout).toContain('2025-10-30-015')
    expect(stdout).toContain('2025-10-30-006')
    expect(stdout).not.toContain('2025-10-30-005')
    expect(stdout).toContain('Total transactions:')
  })

  it('respects custom limit parameter', async () => {
    // RED: Write failing test first
    const history = Array.from({ length: 10 }, (_, i) => ({
      id: `2025-10-30-${String(i + 1).padStart(3, '0')}`,
      action: 'ingest' as const,
      timestamp: new Date(Date.now() - (10 - i) * 60000).toISOString(),
      source: '/plan:to-vtm',
      tasks_added: [`TASK-${String(i + 100).padStart(3, '0')}`],
    }))

    vtmPath = await createTestVtmWithHistory({ history })
    await fs.copyFile(vtmPath, path.join(tempDir, 'vtm.json'))

    const { stdout } = await execCliCommand('node dist/index.js history 3', tempDir)

    expect(stdout).toContain('VTM Transaction History')
    // Should show only 3 most recent
    expect(stdout).toContain('2025-10-30-010')
    expect(stdout).toContain('2025-10-30-009')
    expect(stdout).toContain('2025-10-30-008')
    expect(stdout).not.toContain('2025-10-30-007')
  })

  it('shows transaction summary with source and files', async () => {
    // RED: Write failing test first
    const history = [
      {
        id: '2025-10-30-001',
        action: 'ingest' as const,
        timestamp: new Date().toISOString(),
        source: '/plan:to-vtm',
        tasks_added: ['TASK-042', 'TASK-043'],
        files: {
          adr: 'docs/adr/ADR-001-oauth2-auth.md',
          spec: 'docs/specs/spec-oauth2-auth.md',
        },
      },
    ]

    vtmPath = await createTestVtmWithHistory({ history })
    await fs.copyFile(vtmPath, path.join(tempDir, 'vtm.json'))

    const { stdout } = await execCliCommand('node dist/index.js history', tempDir)

    expect(stdout).toContain('2025-10-30-001')
    expect(stdout).toContain('ingest 2 tasks')
    expect(stdout).toContain('Source: /plan:to-vtm')
    expect(stdout).toContain('ADR-001-oauth2-auth.md')
    expect(stdout).toContain('Tasks: TASK-042, TASK-043')
  })

  it('shows empty message when no history exists', async () => {
    // RED: Write failing test first
    vtmPath = await createTestVtmWithHistory({ history: [] })
    await fs.copyFile(vtmPath, path.join(tempDir, 'vtm.json'))

    const { stdout } = await execCliCommand('node dist/index.js history', tempDir)

    expect(stdout).toContain('No transaction history found')
  })

  it('shows total statistics at bottom', async () => {
    // RED: Write failing test first
    const history = [
      {
        id: '2025-10-30-001',
        action: 'ingest' as const,
        timestamp: new Date().toISOString(),
        source: '/plan:to-vtm',
        tasks_added: ['TASK-042', 'TASK-043'],
      },
      {
        id: '2025-10-30-002',
        action: 'ingest' as const,
        timestamp: new Date().toISOString(),
        source: '/plan:generate-adrs',
        tasks_added: ['TASK-044', 'TASK-045', 'TASK-046'],
      },
    ]

    vtmPath = await createTestVtmWithHistory({ history })
    await fs.copyFile(vtmPath, path.join(tempDir, 'vtm.json'))

    const { stdout } = await execCliCommand('node dist/index.js history', tempDir)

    expect(stdout).toContain('Total transactions: 2')
    expect(stdout).toContain('Total tasks ingested: 5')
  })
})

describe('vtm history <transaction-id> - Show transaction details', () => {
  let tempDir: string
  let vtmPath: string

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `vtm-test-${Date.now()}`)
    await fs.mkdir(tempDir, { recursive: true })
  })

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (e) {
      // Ignore cleanup errors
    }
  })

  it('shows detailed transaction information', async () => {
    // RED: Write failing test first
    const history = [
      {
        id: '2025-10-30-003',
        action: 'ingest' as const,
        timestamp: '2025-10-30T09:30:00Z',
        source: '/plan:to-vtm',
        tasks_added: ['TASK-042', 'TASK-043', 'TASK-044'],
        files: {
          adr: 'docs/adr/ADR-001-oauth2-auth.md',
          spec: 'docs/specs/spec-oauth2-auth.md',
        },
      },
    ]

    const tasks: Task[] = [
      {
        id: 'TASK-042',
        title: 'Implement OAuth2 authorization flow',
        status: 'pending',
        adr_source: 'ADR-001',
        spec_source: 'spec-001',
        description: 'OAuth2 flow',
        acceptance_criteria: [],
        dependencies: [],
        blocks: [],
        test_strategy: 'TDD',
        test_strategy_rationale: 'test',
        estimated_hours: 8,
        risk: 'high',
        files: { create: [], modify: [], delete: [] },
        started_at: null,
        completed_at: null,
        commits: [],
        validation: { tests_pass: false, ac_verified: [] },
      },
      {
        id: 'TASK-043',
        title: 'Add token refresh mechanism',
        status: 'pending',
        adr_source: 'ADR-001',
        spec_source: 'spec-001',
        description: 'Token refresh',
        acceptance_criteria: [],
        dependencies: [],
        blocks: [],
        test_strategy: 'TDD',
        test_strategy_rationale: 'test',
        estimated_hours: 4,
        risk: 'medium',
        files: { create: [], modify: [], delete: [] },
        started_at: null,
        completed_at: null,
        commits: [],
        validation: { tests_pass: false, ac_verified: [] },
      },
      {
        id: 'TASK-044',
        title: 'Secure token storage',
        status: 'pending',
        adr_source: 'ADR-001',
        spec_source: 'spec-001',
        description: 'Token storage',
        acceptance_criteria: [],
        dependencies: [],
        blocks: [],
        test_strategy: 'TDD',
        test_strategy_rationale: 'test',
        estimated_hours: 6,
        risk: 'high',
        files: { create: [], modify: [], delete: [] },
        started_at: null,
        completed_at: null,
        commits: [],
        validation: { tests_pass: false, ac_verified: [] },
      },
    ]

    vtmPath = await createTestVtmWithHistory({ tasks, history })
    await fs.copyFile(vtmPath, path.join(tempDir, 'vtm.json'))

    const { stdout } = await execCliCommand('node dist/index.js history-detail 2025-10-30-003', tempDir)

    expect(stdout).toContain('Transaction Details')
    expect(stdout).toContain('Transaction ID: 2025-10-30-003')
    expect(stdout).toContain('Action: ingest')
    expect(stdout).toContain('Source: /plan:to-vtm')
    expect(stdout).toContain('ADR-001-oauth2-auth.md')
    expect(stdout).toContain('spec-oauth2-auth.md')
    expect(stdout).toContain('TASK-042: Implement OAuth2 authorization flow')
    expect(stdout).toContain('TASK-043: Add token refresh mechanism')
    expect(stdout).toContain('TASK-044: Secure token storage')
    expect(stdout).toContain('vtm rollback 2025-10-30-003 --dry-run')
  })

  it('shows error for invalid transaction ID', async () => {
    // RED: Write failing test first
    vtmPath = await createTestVtmWithHistory({ history: [] })
    await fs.copyFile(vtmPath, path.join(tempDir, 'vtm.json'))

    try {
      await execCliCommand('node dist/index.js history-detail 2025-10-30-999', tempDir)
      expect.fail('Should have thrown error')
    } catch (error: unknown) {
      const err = error as { stderr: string }
      expect(err.stderr).toContain('Transaction not found')
    }
  })

  it('displays task status correctly', async () => {
    // RED: Write failing test first
    const history = [
      {
        id: '2025-10-30-001',
        action: 'ingest' as const,
        timestamp: '2025-10-30T09:00:00Z',
        source: '/plan:to-vtm',
        tasks_added: ['TASK-042', 'TASK-043'],
      },
    ]

    const tasks: Task[] = [
      {
        id: 'TASK-042',
        title: 'Task in progress',
        status: 'in-progress',
        adr_source: 'ADR-001',
        spec_source: 'spec-001',
        description: 'test',
        acceptance_criteria: [],
        dependencies: [],
        blocks: [],
        test_strategy: 'TDD',
        test_strategy_rationale: 'test',
        estimated_hours: 8,
        risk: 'high',
        files: { create: [], modify: [], delete: [] },
        started_at: null,
        completed_at: null,
        commits: [],
        validation: { tests_pass: false, ac_verified: [] },
      },
      {
        id: 'TASK-043',
        title: 'Task completed',
        status: 'completed',
        adr_source: 'ADR-001',
        spec_source: 'spec-001',
        description: 'test',
        acceptance_criteria: [],
        dependencies: [],
        blocks: [],
        test_strategy: 'TDD',
        test_strategy_rationale: 'test',
        estimated_hours: 4,
        risk: 'medium',
        files: { create: [], modify: [], delete: [] },
        started_at: null,
        completed_at: null,
        commits: [],
        validation: { tests_pass: false, ac_verified: [] },
      },
    ]

    vtmPath = await createTestVtmWithHistory({ tasks, history })
    await fs.copyFile(vtmPath, path.join(tempDir, 'vtm.json'))

    const { stdout } = await execCliCommand('node dist/index.js history-detail 2025-10-30-001', tempDir)

    expect(stdout).toContain('[in-progress]')
    expect(stdout).toContain('[completed]')
  })
})

describe('vtm rollback <transaction-id> - Rollback transaction', () => {
  let tempDir: string
  let vtmPath: string

  beforeEach(async () => {
    tempDir = path.join(os.tmpdir(), `vtm-test-${Date.now()}`)
    await fs.mkdir(tempDir, { recursive: true })
  })

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true })
    } catch (e) {
      // Ignore cleanup errors
    }
  })

  it('shows dry-run preview without modifying VTM', async () => {
    // RED: Write failing test first
    const history = [
      {
        id: '2025-10-30-003',
        action: 'ingest' as const,
        timestamp: '2025-10-30T09:30:00Z',
        source: '/plan:to-vtm',
        tasks_added: ['TASK-042', 'TASK-043'],
      },
    ]

    const tasks: Task[] = [
      {
        id: 'TASK-042',
        title: 'Test task',
        status: 'pending',
        adr_source: 'ADR-001',
        spec_source: 'spec-001',
        description: 'test',
        acceptance_criteria: [],
        dependencies: [],
        blocks: [],
        test_strategy: 'TDD',
        test_strategy_rationale: 'test',
        estimated_hours: 8,
        risk: 'high',
        files: { create: [], modify: [], delete: [] },
        started_at: null,
        completed_at: null,
        commits: [],
        validation: { tests_pass: false, ac_verified: [] },
      },
      {
        id: 'TASK-043',
        title: 'Another task',
        status: 'pending',
        adr_source: 'ADR-001',
        spec_source: 'spec-001',
        description: 'test',
        acceptance_criteria: [],
        dependencies: [],
        blocks: [],
        test_strategy: 'TDD',
        test_strategy_rationale: 'test',
        estimated_hours: 4,
        risk: 'medium',
        files: { create: [], modify: [], delete: [] },
        started_at: null,
        completed_at: null,
        commits: [],
        validation: { tests_pass: false, ac_verified: [] },
      },
    ]

    vtmPath = await createTestVtmWithHistory({ tasks, history })
    await fs.copyFile(vtmPath, path.join(tempDir, 'vtm.json'))

    const { stdout } = await execCliCommand('node dist/index.js rollback 2025-10-30-003 --dry-run', tempDir)

    expect(stdout).toContain('Rollback Preview')
    expect(stdout).toContain('2025-10-30-003')
    expect(stdout).toContain('TASK-042')
    expect(stdout).toContain('TASK-043')
    expect(stdout).toContain('This is a dry run')
    expect(stdout).toContain('Run without --dry-run to execute')

    // Verify VTM was not modified
    const vtmContent = await fs.readFile(path.join(tempDir, 'vtm.json'), 'utf-8')
    const vtm = JSON.parse(vtmContent)
    expect(vtm.tasks).toHaveLength(2)
  })

  it('checks for blocking dependencies', async () => {
    // RED: Write failing test first
    const history = [
      {
        id: '2025-10-30-002',
        action: 'ingest' as const,
        timestamp: '2025-10-30T09:15:00Z',
        source: '/plan:to-vtm',
        tasks_added: ['TASK-042'],
      },
    ]

    const tasks: Task[] = [
      {
        id: 'TASK-042',
        title: 'Base task',
        status: 'pending',
        adr_source: 'ADR-001',
        spec_source: 'spec-001',
        description: 'test',
        acceptance_criteria: [],
        dependencies: [],
        blocks: [],
        test_strategy: 'TDD',
        test_strategy_rationale: 'test',
        estimated_hours: 8,
        risk: 'high',
        files: { create: [], modify: [], delete: [] },
        started_at: null,
        completed_at: null,
        commits: [],
        validation: { tests_pass: false, ac_verified: [] },
      },
      {
        id: 'TASK-045',
        title: 'Dependent task',
        status: 'pending',
        adr_source: 'ADR-001',
        spec_source: 'spec-001',
        description: 'test',
        acceptance_criteria: [],
        dependencies: ['TASK-042'],
        blocks: [],
        test_strategy: 'TDD',
        test_strategy_rationale: 'test',
        estimated_hours: 4,
        risk: 'medium',
        files: { create: [], modify: [], delete: [] },
        started_at: null,
        completed_at: null,
        commits: [],
        validation: { tests_pass: false, ac_verified: [] },
      },
    ]

    vtmPath = await createTestVtmWithHistory({ tasks, history })
    await fs.copyFile(vtmPath, path.join(tempDir, 'vtm.json'))

    const { stdout } = await execCliCommand('node dist/index.js rollback 2025-10-30-002 --dry-run', tempDir)

    expect(stdout).toContain('TASK-045 depends on TASK-042')
  })

  it('warns about in-progress tasks', async () => {
    // RED: Write failing test first
    const history = [
      {
        id: '2025-10-30-003',
        action: 'ingest' as const,
        timestamp: '2025-10-30T09:30:00Z',
        source: '/plan:to-vtm',
        tasks_added: ['TASK-043'],
      },
    ]

    const tasks: Task[] = [
      {
        id: 'TASK-043',
        title: 'In progress task',
        status: 'in-progress',
        adr_source: 'ADR-001',
        spec_source: 'spec-001',
        description: 'test',
        acceptance_criteria: [],
        dependencies: [],
        blocks: [],
        test_strategy: 'TDD',
        test_strategy_rationale: 'test',
        estimated_hours: 8,
        risk: 'high',
        files: { create: [], modify: [], delete: [] },
        started_at: new Date().toISOString(),
        completed_at: null,
        commits: [],
        validation: { tests_pass: false, ac_verified: [] },
      },
    ]

    vtmPath = await createTestVtmWithHistory({ tasks, history })
    await fs.copyFile(vtmPath, path.join(tempDir, 'vtm.json'))

    const { stdout } = await execCliCommand('node dist/index.js rollback 2025-10-30-003 --dry-run', tempDir)

    expect(stdout).toContain('TASK-043 is in-progress')
  })

  it('executes rollback with --force flag', async () => {
    // RED: Write failing test first
    const history = [
      {
        id: '2025-10-30-001',
        action: 'ingest' as const,
        timestamp: '2025-10-30T09:00:00Z',
        source: '/plan:to-vtm',
        tasks_added: ['TASK-042'],
      },
    ]

    const tasks: Task[] = [
      {
        id: 'TASK-042',
        title: 'Task to remove',
        status: 'pending',
        adr_source: 'ADR-001',
        spec_source: 'spec-001',
        description: 'test',
        acceptance_criteria: [],
        dependencies: [],
        blocks: [],
        test_strategy: 'TDD',
        test_strategy_rationale: 'test',
        estimated_hours: 8,
        risk: 'high',
        files: { create: [], modify: [], delete: [] },
        started_at: null,
        completed_at: null,
        commits: [],
        validation: { tests_pass: false, ac_verified: [] },
      },
      {
        id: 'TASK-050',
        title: 'Task to keep',
        status: 'pending',
        adr_source: 'ADR-001',
        spec_source: 'spec-001',
        description: 'test',
        acceptance_criteria: [],
        dependencies: [],
        blocks: [],
        test_strategy: 'TDD',
        test_strategy_rationale: 'test',
        estimated_hours: 4,
        risk: 'medium',
        files: { create: [], modify: [], delete: [] },
        started_at: null,
        completed_at: null,
        commits: [],
        validation: { tests_pass: false, ac_verified: [] },
      },
    ]

    vtmPath = await createTestVtmWithHistory({ tasks, history })
    await fs.copyFile(vtmPath, path.join(tempDir, 'vtm.json'))

    const { stdout } = await execCliCommand('node dist/index.js rollback 2025-10-30-001 --force', tempDir)

    expect(stdout).toContain('Rollback completed successfully')
    expect(stdout).toContain('Removed 1 task(s)')

    // Verify VTM was modified
    const vtmContent = await fs.readFile(path.join(tempDir, 'vtm.json'), 'utf-8')
    const vtm = JSON.parse(vtmContent)
    expect(vtm.tasks).toHaveLength(1)
    expect(vtm.tasks[0].id).toBe('TASK-050')
  })

  it('updates stats after rollback', async () => {
    // RED: Write failing test first
    const history = [
      {
        id: '2025-10-30-001',
        action: 'ingest' as const,
        timestamp: '2025-10-30T09:00:00Z',
        source: '/plan:to-vtm',
        tasks_added: ['TASK-042'],
      },
    ]

    const tasks: Task[] = [
      {
        id: 'TASK-042',
        title: 'Task to remove',
        status: 'pending',
        adr_source: 'ADR-001',
        spec_source: 'spec-001',
        description: 'test',
        acceptance_criteria: [],
        dependencies: [],
        blocks: [],
        test_strategy: 'TDD',
        test_strategy_rationale: 'test',
        estimated_hours: 8,
        risk: 'high',
        files: { create: [], modify: [], delete: [] },
        started_at: null,
        completed_at: null,
        commits: [],
        validation: { tests_pass: false, ac_verified: [] },
      },
    ]

    vtmPath = await createTestVtmWithHistory({ tasks, history })
    await fs.copyFile(vtmPath, path.join(tempDir, 'vtm.json'))

    await execCliCommand('node dist/index.js rollback 2025-10-30-001 --force', tempDir)

    // Verify stats were updated
    const vtmContent = await fs.readFile(path.join(tempDir, 'vtm.json'), 'utf-8')
    const vtm = JSON.parse(vtmContent)
    expect(vtm.stats.total_tasks).toBe(0)
    expect(vtm.stats.pending).toBe(0)
  })
})
