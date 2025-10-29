// src/commands/__tests__/plan-validate.test.ts

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validateCommand } from '../plan-validate'
import { validateAdrSpecPair } from '../../lib/adr-spec-validator'
import * as fs from 'fs'

vi.mock('fs')
vi.mock('../../lib/adr-spec-validator')

const mockFs = fs as {
  existsSync: ReturnType<typeof vi.fn>
  statSync: ReturnType<typeof vi.fn>
  readFileSync: ReturnType<typeof vi.fn>
}

const mockValidateAdrSpecPair = validateAdrSpecPair as ReturnType<typeof vi.fn>

describe('plan:validate command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default mock: files exist
    mockFs.existsSync = vi.fn().mockReturnValue(true)
    mockFs.statSync = vi.fn().mockReturnValue({ size: 1000 })
    mockFs.readFileSync = vi.fn((filePath) => {
      if (typeof filePath === 'string' && filePath.includes('ADR')) {
        return 'line\n'.repeat(287)
      }
      return 'line\n'.repeat(245)
    })
  })

  describe('argument parsing', () => {
    it('parses ADR and Spec paths from arguments', async () => {
      const mockReport = {
        valid: true,
        errors: [],
        warnings: [],
        summary: 'VALIDATION PASSED',
        adrValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        specValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 5,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-001.md', 'specs/spec-001.md'])
      } catch (error) {
        // Expected process.exit call
      }

      expect(validateAdrSpecPair).toHaveBeenCalledWith('adr/ADR-001.md', 'specs/spec-001.md', {
        strict: false,
      })

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('parses --strict flag', async () => {
      const mockReport = {
        valid: true,
        errors: [],
        warnings: [],
        summary: 'VALIDATION PASSED',
        adrValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        specValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 5,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-001.md', 'specs/spec-001.md', '--strict'])
      } catch (error) {
        // Expected
      }

      expect(validateAdrSpecPair).toHaveBeenCalledWith('adr/ADR-001.md', 'specs/spec-001.md', {
        strict: true,
      })

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('shows error if ADR path missing', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      try {
        await validateCommand([])
      } catch (error) {
        // Expected
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Both ADR file and Spec file required'))
      expect(exitSpy).toHaveBeenCalledWith(1)

      exitSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })

    it('shows error if Spec path missing', async () => {
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-001.md'])
      } catch (error) {
        // Expected
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Both ADR file and Spec file required'))
      expect(exitSpy).toHaveBeenCalledWith(1)

      exitSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('file validation', () => {
    it('checks ADR file exists', async () => {
      mockFs.existsSync = vi.fn().mockReturnValue(false)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-001.md', 'specs/spec-001.md'])
      } catch (error) {
        // Expected
      }

      expect(mockFs.existsSync).toHaveBeenCalledWith('adr/ADR-001.md')
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('ADR file not found'))

      exitSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })

    it('checks Spec file exists', async () => {
      mockFs.existsSync = vi.fn((filePath) => {
        return filePath !== 'specs/spec-001.md'
      })

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-001.md', 'specs/spec-001.md'])
      } catch (error) {
        // Expected
      }

      expect(mockFs.existsSync).toHaveBeenCalledWith('specs/spec-001.md')
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Spec file not found'))

      exitSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })

    it('shows helpful error if ADR not found', async () => {
      mockFs.existsSync = vi.fn().mockReturnValue(false)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      try {
        await validateCommand(['adr/missing.md', 'specs/spec-001.md'])
      } catch (error) {
        // Expected
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('adr/missing.md'))

      exitSpy.mockRestore()
      consoleErrorSpy.mockRestore()
    })
  })

  describe('validation execution', () => {
    it('calls validateAdrSpecPair with correct args', async () => {
      const mockReport = {
        valid: true,
        errors: [],
        warnings: [],
        summary: 'VALIDATION PASSED',
        adrValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        specValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 5,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-042.md', 'specs/spec-042.md'])
      } catch (error) {
        // Expected
      }

      expect(validateAdrSpecPair).toHaveBeenCalledWith('adr/ADR-042.md', 'specs/spec-042.md', {
        strict: false,
      })

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('passes strict flag to validator', async () => {
      const mockReport = {
        valid: true,
        errors: [],
        warnings: [],
        summary: 'VALIDATION PASSED',
        adrValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        specValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 5,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-042.md', 'specs/spec-042.md', '--strict'])
      } catch (error) {
        // Expected
      }

      expect(validateAdrSpecPair).toHaveBeenCalledWith('adr/ADR-042.md', 'specs/spec-042.md', {
        strict: true,
      })

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })
  })

  describe('success case', () => {
    it('displays success message when valid', async () => {
      const mockReport = {
        valid: true,
        errors: [],
        warnings: [],
        summary: 'VALIDATION PASSED',
        adrValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        specValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 5,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-001.md', 'specs/spec-001.md'])
      } catch (error) {
        // Expected
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('✅ VALIDATION PASSED'))

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('shows summary statistics', async () => {
      const mockReport = {
        valid: true,
        errors: [],
        warnings: [],
        summary: 'VALIDATION PASSED',
        adrValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        specValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 5,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-001.md', 'specs/spec-001.md'])
      } catch (error) {
        // Expected
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('4 alternatives'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('5 code examples'))

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('suggests next step (/plan:to-vtm)', async () => {
      const mockReport = {
        valid: true,
        errors: [],
        warnings: [],
        summary: 'VALIDATION PASSED',
        adrValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        specValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 5,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-001.md', 'specs/spec-001.md'])
      } catch (error) {
        // Expected
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('/plan:to-vtm'))

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('exits with code 0', async () => {
      const mockReport = {
        valid: true,
        errors: [],
        warnings: [],
        summary: 'VALIDATION PASSED',
        adrValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        specValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 5,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-001.md', 'specs/spec-001.md'])
      } catch (error) {
        // Expected
      }

      expect(exitSpy).toHaveBeenCalledWith(0)

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })
  })

  describe('error case', () => {
    it('displays errors clearly', async () => {
      const mockReport = {
        valid: false,
        errors: ['Missing required section: ## Status', 'Spec does not reference the ADR file'],
        warnings: [],
        summary: 'VALIDATION FAILED (2 errors, 0 warnings)',
        adrValidation: {
          valid: false,
          errors: ['Missing required section: ## Status'],
          warnings: [],
          sectionsFound: [],
          sectionsRequired: [],
        },
        specValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        pairingValidation: {
          valid: false,
          errors: ['Spec does not reference the ADR file'],
          specReferencesAdr: false,
          adrNumber: '001',
        },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 5,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-002.md', 'specs/spec-002.md'])
      } catch (error) {
        // Expected
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('❌ VALIDATION FAILED'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Missing required section: ## Status'))

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('shows how to fix suggestions', async () => {
      const mockReport = {
        valid: false,
        errors: ['Missing required section: ## Status'],
        warnings: [],
        summary: 'VALIDATION FAILED (1 errors, 0 warnings)',
        adrValidation: {
          valid: false,
          errors: ['Missing required section: ## Status'],
          warnings: [],
          sectionsFound: [],
          sectionsRequired: [],
        },
        specValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 5,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-002.md', 'specs/spec-002.md'])
      } catch (error) {
        // Expected
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('💡 How to fix'))

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('exits with code 1', async () => {
      const mockReport = {
        valid: false,
        errors: ['Missing required section: ## Status'],
        warnings: [],
        summary: 'VALIDATION FAILED (1 errors, 0 warnings)',
        adrValidation: {
          valid: false,
          errors: ['Missing required section: ## Status'],
          warnings: [],
          sectionsFound: [],
          sectionsRequired: [],
        },
        specValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 5,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-002.md', 'specs/spec-002.md'])
      } catch (error) {
        // Expected
      }

      expect(exitSpy).toHaveBeenCalledWith(1)

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })
  })

  describe('warning case', () => {
    it('shows warnings in normal mode', async () => {
      const mockReport = {
        valid: true,
        errors: [],
        warnings: ['Found only 2 code examples (recommended: 3+)'],
        summary: 'VALIDATION PASSED WITH WARNINGS (1 warnings)',
        adrValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        specValidation: {
          valid: true,
          errors: [],
          warnings: ['Found only 2 code examples (recommended: 3+)'],
          sectionsFound: [],
          sectionsRequired: [],
        },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 2,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-003.md', 'specs/spec-003.md'])
      } catch (error) {
        // Expected
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('⚠️'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Found only 2 code examples'))

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('treats warnings as errors in strict mode', async () => {
      const mockReport = {
        valid: false,
        errors: ['Found only 2 code examples. Required: 3+'],
        warnings: [],
        summary: 'VALIDATION FAILED (1 errors, 0 warnings)',
        adrValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        specValidation: {
          valid: false,
          errors: ['Found only 2 code examples. Required: 3+'],
          warnings: [],
          sectionsFound: [],
          sectionsRequired: [],
        },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 2,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-003.md', 'specs/spec-003.md', '--strict'])
      } catch (error) {
        // Expected
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('❌ VALIDATION FAILED'))
      expect(exitSpy).toHaveBeenCalledWith(1)

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('suggests using --strict flag', async () => {
      const mockReport = {
        valid: true,
        errors: [],
        warnings: ['Found only 2 code examples (recommended: 3+)'],
        summary: 'VALIDATION PASSED WITH WARNINGS (1 warnings)',
        adrValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        specValidation: {
          valid: true,
          errors: [],
          warnings: ['Found only 2 code examples (recommended: 3+)'],
          sectionsFound: [],
          sectionsRequired: [],
        },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 2,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-003.md', 'specs/spec-003.md'])
      } catch (error) {
        // Expected
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('--strict'))

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('exits with code 0 in normal mode', async () => {
      const mockReport = {
        valid: true,
        errors: [],
        warnings: ['Found only 2 code examples (recommended: 3+)'],
        summary: 'VALIDATION PASSED WITH WARNINGS (1 warnings)',
        adrValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        specValidation: {
          valid: true,
          errors: [],
          warnings: ['Found only 2 code examples (recommended: 3+)'],
          sectionsFound: [],
          sectionsRequired: [],
        },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 2,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-003.md', 'specs/spec-003.md'])
      } catch (error) {
        // Expected
      }

      expect(exitSpy).toHaveBeenCalledWith(0)

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('exits with code 1 in strict mode', async () => {
      const mockReport = {
        valid: false,
        errors: ['Found only 2 code examples. Required: 3+'],
        warnings: [],
        summary: 'VALIDATION FAILED (1 errors, 0 warnings)',
        adrValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        specValidation: {
          valid: false,
          errors: ['Found only 2 code examples. Required: 3+'],
          warnings: [],
          sectionsFound: [],
          sectionsRequired: [],
        },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 2,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-003.md', 'specs/spec-003.md', '--strict'])
      } catch (error) {
        // Expected
      }

      expect(exitSpy).toHaveBeenCalledWith(1)

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })
  })

  describe('output formatting', () => {
    it('uses box characters for visual separation', async () => {
      const mockReport = {
        valid: true,
        errors: [],
        warnings: [],
        summary: 'VALIDATION PASSED',
        adrValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        specValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 5,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-001.md', 'specs/spec-001.md'])
      } catch (error) {
        // Expected
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('═'))

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('shows file sizes in summary', async () => {
      const mockReport = {
        valid: true,
        errors: [],
        warnings: [],
        summary: 'VALIDATION PASSED',
        adrValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        specValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 5,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      mockFs.readFileSync = vi.fn((filePath) => {
        if (typeof filePath === 'string' && filePath.includes('ADR')) {
          return 'line\n'.repeat(287)
        }
        return 'line\n'.repeat(245)
      })

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-001-oauth2-auth.md', 'specs/spec-oauth2-auth.md'])
      } catch (error) {
        // Expected
      }

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('288 lines'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('246 lines'))

      exitSpy.mockRestore()
      consoleLogSpy.mockRestore()
    })

    it('displays validation progress steps', async () => {
      const mockReport = {
        valid: true,
        errors: [],
        warnings: [],
        summary: 'VALIDATION PASSED',
        adrValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        specValidation: { valid: true, errors: [], warnings: [], sectionsFound: [], sectionsRequired: [] },
        pairingValidation: { valid: true, errors: [], specReferencesAdr: true, adrNumber: '001' },
        qualityValidation: {
          errors: [],
          warnings: [],
          todoCount: 0,
          placeholderCount: 0,
          codeExampleCount: 5,
          alternativeCount: 4,
          acceptanceCriteriaCount: 6,
        },
      }
      vi.mocked(validateAdrSpecPair).mockResolvedValue(mockReport)

      const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
        throw new Error(`Process.exit called with ${code}`)
      })
      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

      try {
        await validateCommand(['adr/ADR-001.md', 'specs/spec-001.md'])
      } catch (error) {
        // Expected
      }

      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('📋 Checking ADR structure'))
      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('📋 Checking Spec structure'))
      expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('🔍 Checking for common issues'))

      exitSpy.mockRestore()
      consoleInfoSpy.mockRestore()
    })
  })
})
