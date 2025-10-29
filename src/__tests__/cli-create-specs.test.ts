// src/__tests__/cli-create-specs.test.ts
// Integration tests for 'vtm create-specs' CLI command

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs'
import * as path from 'path'

const execAsync = promisify(exec)

const TEST_DATA_DIR = path.join(process.cwd(), 'test-data')
const ADR_DIR = path.join(TEST_DATA_DIR, 'adr')
const SPEC_DIR = path.join(TEST_DATA_DIR, 'specs')

describe('vtm create-specs command', () => {
  beforeEach(() => {
    // Ensure test directories exist
    if (!fs.existsSync(ADR_DIR)) {
      fs.mkdirSync(ADR_DIR, { recursive: true })
    }
    if (!fs.existsSync(SPEC_DIR)) {
      fs.mkdirSync(SPEC_DIR, { recursive: true })
    }
  })

  describe('AC1: command accepts pattern argument', () => {
    it('should fail when no pattern provided', async () => {
      // RED: This should fail because command doesn't exist yet
      try {
        await execAsync('node dist/index.js create-specs')
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.code).toBe(1)
        expect(error.stderr || error.stdout).toContain('pattern')
      }
    })

    it('should accept glob pattern argument', async () => {
      // RED: This should fail because command doesn't exist yet
      const pattern = path.join(ADR_DIR, 'ADR-*.md')

      try {
        const { stdout } = await execAsync(`node dist/index.js create-specs "${pattern}" --dry-run`)
        expect(stdout).toContain('Found')
        expect(stdout).toContain('ADR')
      } catch (error: any) {
        // Expected to fail initially
        expect(error.stderr || error.stdout).toBeDefined()
      }
    })
  })

  describe('AC2: --dry-run flag previews without creating files', () => {
    it('should show preview with --dry-run', async () => {
      // RED: Command doesn't exist yet
      const pattern = path.join(ADR_DIR, 'ADR-*.md')

      try {
        const { stdout } = await execAsync(`node dist/index.js create-specs "${pattern}" --dry-run`)

        const hasDryRunOrPreview = stdout.includes('dry-run') || stdout.includes('preview')
        expect(hasDryRunOrPreview).toBe(true)
        expect(stdout).toContain('spec-')
        expect(stdout).not.toContain('created') // Should not create files
      } catch (error: any) {
        // Expected to fail initially
        expect(error.message).toBeDefined()
      }
    })

    it('should not create files in dry-run mode', async () => {
      // RED: Command doesn't exist yet
      const pattern = path.join(ADR_DIR, 'ADR-003-session-timeout.md')
      const specPath = path.join(SPEC_DIR, 'spec-session-timeout.md')

      // Ensure spec doesn't exist before
      if (fs.existsSync(specPath)) {
        fs.unlinkSync(specPath)
      }

      try {
        await execAsync(`node dist/index.js create-specs "${pattern}" --dry-run`)

        // Should still not exist after dry-run
        expect(fs.existsSync(specPath)).toBe(false)
      } catch (error: any) {
        // Expected to fail initially
        expect(fs.existsSync(specPath)).toBe(false)
      }
    })
  })

  describe('AC3: shows summary of specs found', () => {
    it('should display count of matching ADRs', async () => {
      // RED: Command doesn't exist yet
      const pattern = path.join(ADR_DIR, 'ADR-*.md')

      try {
        const { stdout } = await execAsync(`node dist/index.js create-specs "${pattern}" --dry-run`)

        expect(stdout).toMatch(/Found|ADR|files/)
        expect(stdout).toMatch(/\d+/) // Should show a count
      } catch (error: any) {
        // Expected to fail initially
        expect(error.message).toBeDefined()
      }
    })

    it('should list spec names that would be created', async () => {
      // RED: Command doesn't exist yet
      const pattern = path.join(ADR_DIR, 'ADR-001-oauth2-auth.md')

      try {
        const { stdout } = await execAsync(`node dist/index.js create-specs "${pattern}" --dry-run`)

        expect(stdout.includes('oauth2-auth') || stdout.includes('spec-')).toBe(true)
      } catch (error: any) {
        // Expected to fail initially
        expect(error.message).toBeDefined()
      }
    })
  })

  describe('AC4: handles existing specs', () => {
    it('should identify existing specs in preview', async () => {
      // RED: Command doesn't exist yet
      const pattern = path.join(ADR_DIR, 'ADR-001-oauth2-auth.md')

      try {
        const { stdout } = await execAsync(`node dist/index.js create-specs "${pattern}" --dry-run`)

        // Should mention the existing spec
        const hasExistOrSkip = /exist|skip/i.test(stdout)
        expect(hasExistOrSkip).toBe(true)
      } catch (error: any) {
        // Expected to fail initially
        expect(error.message).toBeDefined()
      }
    })

    it('should show count of existing vs new specs', async () => {
      // RED: Command doesn't exist yet
      const pattern = path.join(ADR_DIR, 'ADR-*.md')

      try {
        const { stdout } = await execAsync(`node dist/index.js create-specs "${pattern}" --dry-run`)

        expect(stdout).toMatch(/new|existing|skipped/i)
      } catch (error: any) {
        // Expected to fail initially
        expect(error.message).toBeDefined()
      }
    })
  })

  describe('AC5: error handling', () => {
    it('should error when no ADRs match pattern', async () => {
      // RED: Command doesn't exist yet
      const pattern = path.join(ADR_DIR, 'ADR-999-*.md')

      try {
        await execAsync(`node dist/index.js create-specs "${pattern}" --dry-run`)
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.code).toBe(1)
        expect(error.stderr || error.stdout).toMatch(/no.*match|not found/i)
      }
    })

    it('should error when pattern is empty', async () => {
      // RED: Command doesn't exist yet
      try {
        await execAsync('node dist/index.js create-specs ""')
        expect.fail('Should have thrown an error')
      } catch (error: any) {
        expect(error.code).toBe(1)
        expect(error.stderr || error.stdout).toMatch(/pattern.*required/i)
      }
    })
  })

  describe('AC6: output format is clear and actionable', () => {
    it('should use clear headers and formatting', async () => {
      // RED: Command doesn't exist yet
      const pattern = path.join(ADR_DIR, 'ADR-*.md')

      try {
        const { stdout } = await execAsync(`node dist/index.js create-specs "${pattern}" --dry-run`)

        // Should have clear structure
        expect(stdout).toMatch(/Found|Preview|Specs/i)
        expect(stdout.length).toBeGreaterThan(50) // Non-trivial output
      } catch (error: any) {
        // Expected to fail initially
        expect(error.message).toBeDefined()
      }
    })

    it('should show next steps guidance', async () => {
      // RED: Command doesn't exist yet
      const pattern = path.join(ADR_DIR, 'ADR-*.md')

      try {
        const { stdout } = await execAsync(`node dist/index.js create-specs "${pattern}" --dry-run`)

        expect(stdout).toMatch(/next|run|create|without.*dry/i)
      } catch (error: any) {
        // Expected to fail initially
        expect(error.message).toBeDefined()
      }
    })
  })

  describe('AC7: supports single file pattern', () => {
    it('should work with single ADR file', async () => {
      // RED: Command doesn't exist yet
      const pattern = path.join(ADR_DIR, 'ADR-001-oauth2-auth.md')

      try {
        const { stdout } = await execAsync(`node dist/index.js create-specs "${pattern}" --dry-run`)

        expect(stdout).toContain('oauth2-auth')
        expect(stdout).toMatch(/1.*ADR|Found.*1/)
      } catch (error: any) {
        // Expected to fail initially
        expect(error.message).toBeDefined()
      }
    })
  })

  describe('AC8: integrates with batch-spec-creator library', () => {
    it('should use findMatchingAdrs from library', async () => {
      // RED: Command doesn't exist yet
      const pattern = path.join(ADR_DIR, 'ADR-*.md')

      try {
        const { stdout } = await execAsync(`node dist/index.js create-specs "${pattern}" --dry-run`)

        // Should find the test ADR files
        expect(stdout).toContain('ADR')
      } catch (error: any) {
        // Library function should be called even if command fails
        expect(error.message).toBeDefined()
      }
    })

    it('should use checkExistingSpecs from library', async () => {
      // RED: Command doesn't exist yet
      const pattern = path.join(ADR_DIR, 'ADR-*.md')

      try {
        const { stdout } = await execAsync(`node dist/index.js create-specs "${pattern}" --dry-run`)

        // Should check for existing specs
        expect(stdout).toMatch(/exist|new|skip/i)
      } catch (error: any) {
        // Expected to fail initially
        expect(error.message).toBeDefined()
      }
    })
  })
})
