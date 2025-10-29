// src/lib/__tests__/batch-spec-creator.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs'
import * as path from 'path'
import {
  findMatchingAdrs,
  generateSpecName,
  checkExistingSpecs,
  createSpecsForAdrs,
  type BatchSpecOptions,
  type BatchResult,
  type ExistingSpecReport,
} from '../batch-spec-creator'

const TEST_DATA_DIR = path.join(process.cwd(), 'test-data')
const ADR_DIR = path.join(TEST_DATA_DIR, 'adr')
const SPEC_DIR = path.join(TEST_DATA_DIR, 'specs')

describe('batch-spec-creator', () => {
  describe('findMatchingAdrs', () => {
    it('finds all ADRs with wildcard pattern', () => {
      // RED: This test should fail because the function doesn't exist yet
      const pattern = path.join(ADR_DIR, 'ADR-*.md')
      const matches = findMatchingAdrs(pattern)

      expect(matches).toBeDefined()
      expect(matches.length).toBeGreaterThan(0)
      expect(matches).toContain(path.join(ADR_DIR, 'ADR-001-oauth2-auth.md'))
      expect(matches).toContain(path.join(ADR_DIR, 'ADR-002-token-storage.md'))
      expect(matches).toContain(path.join(ADR_DIR, 'ADR-003-session-timeout.md'))
    })

    it('returns empty array for no matches', () => {
      // RED: Test should fail first
      const pattern = path.join(ADR_DIR, 'ADR-999-*.md')
      const matches = findMatchingAdrs(pattern)

      expect(matches).toBeDefined()
      expect(matches).toHaveLength(0)
    })

    it('handles single file path', () => {
      // RED: Test should fail first
      const pattern = path.join(ADR_DIR, 'ADR-001-oauth2-auth.md')
      const matches = findMatchingAdrs(pattern)

      expect(matches).toBeDefined()
      expect(matches).toHaveLength(1)
      expect(matches[0]).toBe(path.join(ADR_DIR, 'ADR-001-oauth2-auth.md'))
    })

    it('validates that matched files exist', () => {
      // RED: Test should fail first
      const pattern = path.join(ADR_DIR, 'ADR-*.md')
      const matches = findMatchingAdrs(pattern)

      matches.forEach((file) => {
        expect(fs.existsSync(file)).toBe(true)
      })
    })
  })

  describe('generateSpecName', () => {
    it('extracts spec name from ADR filename', () => {
      // RED: Write test first
      const adrFile = 'adr/ADR-001-oauth2-auth.md'
      const name = generateSpecName(adrFile)

      expect(name).toBe('oauth2-auth')
    })

    it('removes ADR number prefix', () => {
      // RED: Test should fail first
      const adrFile = 'adr/ADR-042-token-storage.md'
      const name = generateSpecName(adrFile)

      expect(name).toBe('token-storage')
    })

    it('handles ADR with complex name', () => {
      // RED: Test should fail first
      const adrFile = 'adr/ADR-001-multi-word-decision-name.md'
      const name = generateSpecName(adrFile)

      expect(name).toBe('multi-word-decision-name')
    })

    it('handles absolute paths', () => {
      // RED: Test should fail first
      const adrFile = '/Users/test/project/adr/ADR-015-api-versioning.md'
      const name = generateSpecName(adrFile)

      expect(name).toBe('api-versioning')
    })

    it('handles three-digit ADR numbers', () => {
      // RED: Test should fail first
      const adrFile = 'adr/ADR-123-session-management.md'
      const name = generateSpecName(adrFile)

      expect(name).toBe('session-management')
    })
  })

  describe('checkExistingSpecs', () => {
    it('identifies existing specs', () => {
      // RED: Write test first
      const adrFiles = [path.join(ADR_DIR, 'ADR-001-oauth2-auth.md'), path.join(ADR_DIR, 'ADR-002-token-storage.md')]

      const report = checkExistingSpecs(adrFiles)

      expect(report).toBeDefined()
      expect(report.existing).toBeDefined()
      expect(report.new).toBeDefined()
      expect(report.existing.length).toBeGreaterThan(0)
      expect(report.new.length).toBeGreaterThan(0)
    })

    it('returns all new when no specs exist', () => {
      // RED: Test should fail first
      const adrFiles = [path.join(ADR_DIR, 'ADR-003-session-timeout.md')]

      const report = checkExistingSpecs(adrFiles)

      expect(report.new).toHaveLength(1)
      expect(report.existing).toHaveLength(0)
    })

    it('returns all existing when all specs exist', () => {
      // RED: Test should fail first
      const adrFiles = [path.join(ADR_DIR, 'ADR-001-oauth2-auth.md')]

      const report = checkExistingSpecs(adrFiles)

      expect(report.existing).toHaveLength(1)
      expect(report.new).toHaveLength(0)
    })

    it('handles empty array', () => {
      // RED: Test should fail first
      const adrFiles: string[] = []

      const report = checkExistingSpecs(adrFiles)

      expect(report.existing).toHaveLength(0)
      expect(report.new).toHaveLength(0)
    })
  })

  describe('createSpecsForAdrs - dry run', () => {
    it('dry-run does not create files', async () => {
      // RED: Test should fail first
      const pattern = path.join(ADR_DIR, 'ADR-*.md')
      const options: BatchSpecOptions = {
        dryRun: true,
        withTasks: false,
      }

      const result = await createSpecsForAdrs(pattern, options)

      expect(result).toBeDefined()
      expect(result.success).toBe(true)
      expect(result.specsCreated).toHaveLength(0)
      expect(result.preview).toBeDefined()
      expect(result.preview!.length).toBeGreaterThan(0)
    })

    it('dry-run shows skipped specs', async () => {
      // RED: Test should fail first
      const pattern = path.join(ADR_DIR, 'ADR-001-oauth2-auth.md')
      const options: BatchSpecOptions = {
        dryRun: true,
        withTasks: false,
      }

      const result = await createSpecsForAdrs(pattern, options)

      expect(result.skipped.length).toBeGreaterThan(0)
    })
  })

  describe('createSpecsForAdrs - validation', () => {
    it('throws error for no matching files', async () => {
      // RED: Test should fail first
      const pattern = path.join(ADR_DIR, 'ADR-999-*.md')
      const options: BatchSpecOptions = {
        dryRun: false,
        withTasks: false,
      }

      await expect(createSpecsForAdrs(pattern, options)).rejects.toThrow(/No ADR files match pattern/)
    })

    it('throws error for invalid pattern', async () => {
      // RED: Test should fail first
      const pattern = ''
      const options: BatchSpecOptions = {
        dryRun: false,
        withTasks: false,
      }

      await expect(createSpecsForAdrs(pattern, options)).rejects.toThrow()
    })
  })
})
