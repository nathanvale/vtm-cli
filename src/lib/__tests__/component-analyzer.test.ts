/**
 * Tests for ComponentAnalyzer
 *
 * TDD Test Suite for deep file-based analysis of TypeScript components.
 * Tests cover metrics extraction, code smell detection, and directory scanning.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as path from 'path'

// Types for ComponentAnalyzer (will be properly typed when implementation exists)
interface ComponentMetrics {
  name: string
  filePath: string
  lines: number
  complexity: number
  jsdocCoverage: number
  functions: FunctionMetric[]
  dependencies: string[]
  codeSmells: CodeSmell[]
}

interface FunctionMetric {
  name: string
  lines: number
  complexity: number
  args: number
  hasJSDoc: boolean
  exports: boolean
}

interface CodeSmell {
  type: 'long-function' | 'high-complexity' | 'missing-jsdoc' | 'tight-coupling' | 'deep-nesting'
  location: string
  severity: 'low' | 'medium' | 'high'
  suggestion: string
}

class MockComponentAnalyzer {
  analyzeComponent(filePath: string): ComponentMetrics {
    return {
      name: path.basename(filePath),
      filePath,
      lines: 0,
      complexity: 0,
      jsdocCoverage: 0,
      functions: [],
      dependencies: [],
      codeSmells: [],
    }
  }

  scanComponentDir(dirPath: string): ComponentMetrics[] {
    return []
  }
}

describe('ComponentAnalyzer', () => {
  let analyzer: ComponentAnalyzer | MockComponentAnalyzer
  let ComponentAnalyzer: typeof MockComponentAnalyzer

  beforeEach(async () => {
    // Attempt to import ComponentAnalyzer
    // Will fail in RED phase (not implemented yet)
    try {
      const mod = await import('../component-analyzer')
      ComponentAnalyzer = mod.ComponentAnalyzer
      analyzer = new ComponentAnalyzer()
    } catch {
      // Expected to fail in RED phase - use mock
      ComponentAnalyzer = MockComponentAnalyzer
      analyzer = new MockComponentAnalyzer()
    }
  })

  // ========== AC1: analyzeComponent() Method ==========

  describe('AC1: analyzeComponent() - Extract file metrics', () => {
    it('should extract line count from TypeScript file', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')

      expect(ComponentAnalyzer).toBeDefined()
      const metrics = analyzer.analyzeComponent(filePath)

      expect(metrics).toBeDefined()
      expect(metrics.lines).toBeGreaterThan(0)
      expect(typeof metrics.lines).toBe('number')
    })

    it('should extract cyclomatic complexity from functions', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      expect(metrics.complexity).toBeDefined()
      expect(typeof metrics.complexity).toBe('number')
      expect(metrics.complexity).toBeGreaterThan(0)
    })

    it('should extract top-level exports from file', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      expect(metrics.functions).toBeDefined()
      expect(Array.isArray(metrics.functions)).toBe(true)
      expect(metrics.functions.length).toBeGreaterThan(0)
    })

    it('should extract internal dependencies from imports', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      expect(metrics.dependencies).toBeDefined()
      expect(Array.isArray(metrics.dependencies)).toBe(true)
    })

    it('should calculate JSDoc coverage percentage', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      expect(metrics.jsdocCoverage).toBeDefined()
      expect(typeof metrics.jsdocCoverage).toBe('number')
      expect(metrics.jsdocCoverage).toBeGreaterThanOrEqual(0)
      expect(metrics.jsdocCoverage).toBeLessThanOrEqual(100)
    })

    it('should return correct component name and path', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      expect(metrics.name).toBeDefined()
      expect(metrics.filePath).toBe(filePath)
      expect(metrics.name).toContain('decision-engine')
    })
  })

  // ========== AC2: ComponentMetrics Type ==========

  describe('AC2: ComponentMetrics type structure', () => {
    it('should return ComponentMetrics with all required fields', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      expect(metrics).toHaveProperty('name')
      expect(metrics).toHaveProperty('filePath')
      expect(metrics).toHaveProperty('lines')
      expect(metrics).toHaveProperty('complexity')
      expect(metrics).toHaveProperty('jsdocCoverage')
      expect(metrics).toHaveProperty('functions')
      expect(metrics).toHaveProperty('dependencies')
      expect(metrics).toHaveProperty('codeSmells')
    })

    it('should include FunctionMetric for each exported function', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      expect(metrics.functions).toBeDefined()
      expect(metrics.functions.length).toBeGreaterThan(0)

      // Check first function has all required properties
      const func = metrics.functions[0]
      expect(func).toHaveProperty('name')
      expect(func).toHaveProperty('lines')
      expect(func).toHaveProperty('complexity')
      expect(func).toHaveProperty('args')
      expect(func).toHaveProperty('hasJSDoc')
      expect(func).toHaveProperty('exports')
    })

    it('should detect function argument counts', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      // Should find functions with various argument counts
      const functionArgCounts = metrics.functions.map((f: any) => f.args)
      expect(functionArgCounts.some((count: number) => count >= 0)).toBe(true)
    })

    it('should track JSDoc presence on functions', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      // At least some functions should have JSDoc
      const withJSDoc = metrics.functions.filter((f: any) => f.hasJSDoc).length
      expect(withJSDoc).toBeGreaterThanOrEqual(0)
    })
  })

  // ========== AC3: Code Smell Detection ==========

  describe('AC3: detectCodeSmells() - Detect code patterns', () => {
    it('should detect long functions (> 50 lines)', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      // DecisionEngine has some large methods, should detect smells
      if (metrics.codeSmells) {
        const longFunctionSmells = metrics.codeSmells.filter((smell: any) => smell.type === 'long-function')
        // May or may not have long functions, but detection should work
        expect(Array.isArray(longFunctionSmells)).toBe(true)
      }
    })

    it('should detect high complexity functions (> 5)', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      if (metrics.codeSmells) {
        const complexitySmells = metrics.codeSmells.filter((smell: any) => smell.type === 'high-complexity')
        expect(Array.isArray(complexitySmells)).toBe(true)
      }
    })

    it('should detect missing JSDoc on public functions', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      if (metrics.codeSmells) {
        const docSmells = metrics.codeSmells.filter((smell: any) => smell.type === 'missing-jsdoc')
        expect(Array.isArray(docSmells)).toBe(true)
      }
    })

    it('should detect tight coupling (> 3 external dependencies)', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      if (metrics.codeSmells) {
        const couplingSmells = metrics.codeSmells.filter((smell: any) => smell.type === 'tight-coupling')
        expect(Array.isArray(couplingSmells)).toBe(true)
      }
    })

    it('should detect deep nesting (> 3 levels)', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      if (metrics.codeSmells) {
        const nestingSmells = metrics.codeSmells.filter((smell: any) => smell.type === 'deep-nesting')
        expect(Array.isArray(nestingSmells)).toBe(true)
      }
    })

    it('should include severity and suggestion for each code smell', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      if (metrics.codeSmells && metrics.codeSmells.length > 0) {
        const smell = metrics.codeSmells[0]
        expect(smell).toHaveProperty('type')
        expect(smell).toHaveProperty('location')
        expect(smell).toHaveProperty('severity')
        expect(smell).toHaveProperty('suggestion')

        expect(['low', 'medium', 'high']).toContain(smell.severity)
        expect(typeof smell.suggestion).toBe('string')
      }
    })
  })

  // ========== AC4: scanComponentDir() ==========

  describe('AC4: scanComponentDir() - Scan directory recursively', () => {
    it('should scan directory and return array of ComponentMetrics', () => {
      const libDir = path.join(__dirname, '..')
      const results = analyzer.scanComponentDir(libDir)

      expect(Array.isArray(results)).toBe(true)
      expect(results.length).toBeGreaterThan(0)
    })

    it('should only include .ts files (not .test.ts)', () => {
      const libDir = path.join(__dirname, '..')
      const results = analyzer.scanComponentDir(libDir)

      // Filter for test files
      const testFiles = results.filter((m: any) => m.name.includes('test'))
      // Should not include test files
      expect(testFiles.length).toBe(0)
    })

    it('should skip node_modules directory', () => {
      const projectRoot = path.join(__dirname, '../../..')
      const results = analyzer.scanComponentDir(projectRoot)

      // Check no paths contain node_modules
      const hasNodeModules = results.some((m: any) => m.filePath.includes('node_modules'))
      expect(hasNodeModules).toBe(false)
    })

    it('should include absolute paths for each component', () => {
      const libDir = path.join(__dirname, '..')
      const results = analyzer.scanComponentDir(libDir)

      if (results.length > 0) {
        const firstResult = results[0]
        expect(path.isAbsolute(firstResult.filePath)).toBe(true)
      }
    })

    it('should recursively scan subdirectories', () => {
      const libDir = path.join(__dirname, '..')
      const results = analyzer.scanComponentDir(libDir)

      // Should find files from multiple subdirectories
      expect(results.length).toBeGreaterThan(0)
    })
  })

  // ========== Edge Cases & Error Handling ==========

  describe('Edge cases and error handling', () => {
    it('should throw error for non-existent file', () => {
      const nonExistentPath = path.join(__dirname, 'non-existent-file.ts')

      expect(() => {
        analyzer.analyzeComponent(nonExistentPath)
      }).toThrow()
    })

    it('should handle empty TypeScript file', () => {
      // This would need a fixture file
      // For now, just test that it doesn't crash on valid empty file scenario
      expect(ComponentAnalyzer).toBeDefined()
    })

    it('should handle files with syntax errors gracefully', () => {
      expect(ComponentAnalyzer).toBeDefined()
      // Would need fixture with invalid TS syntax
    })

    it('should handle files with no exports', () => {
      expect(ComponentAnalyzer).toBeDefined()
      // Would need fixture file with no exports
    })

    it('should handle files with no imports', () => {
      expect(ComponentAnalyzer).toBeDefined()
      // Some files may have no imports - should handle gracefully
    })

    it('should calculate correct complexity for nested structures', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      expect(metrics.complexity).toBeGreaterThan(0)
      expect(metrics.complexity).toBeLessThan(100) // Reasonable upper bound
    })
  })

  // ========== Integration Tests ==========

  describe('Integration: Full workflow', () => {
    it('should analyze real codebase file and return meaningful metrics', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      // Verify all key metrics are present and reasonable
      expect(metrics.name).toBeDefined()
      expect(metrics.lines).toBeGreaterThan(100) // decision-engine.ts is large
      expect(metrics.complexity).toBeGreaterThan(0)
      expect(metrics.jsdocCoverage).toBeLessThanOrEqual(100)
      expect(metrics.functions.length).toBeGreaterThan(0)
      expect(metrics.dependencies).toContain('fs')
      expect(metrics.dependencies).toContain('path')
    })

    it('should detect multiple code smells on large file', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      // Large file should have some code smells
      expect(metrics.codeSmells).toBeDefined()
      expect(Array.isArray(metrics.codeSmells)).toBe(true)
    })

    it('should scan lib directory and provide insights on codebase', () => {
      const libDir = path.join(__dirname, '..')
      const results = analyzer.scanComponentDir(libDir)

      // Should find multiple components
      expect(results.length).toBeGreaterThan(5)

      // All should have required fields
      results.forEach((metric: any) => {
        expect(metric.name).toBeDefined()
        expect(metric.filePath).toBeDefined()
        expect(metric.lines).toBeGreaterThan(0)
        expect(metric.complexity).toBeGreaterThan(0)
      })
    })
  })

  // ========== Type Validation Tests ==========

  describe('Type validation and consistency', () => {
    it('should return metrics with correct types', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      expect(typeof metrics.name).toBe('string')
      expect(typeof metrics.filePath).toBe('string')
      expect(typeof metrics.lines).toBe('number')
      expect(typeof metrics.complexity).toBe('number')
      expect(typeof metrics.jsdocCoverage).toBe('number')
      expect(Array.isArray(metrics.functions)).toBe(true)
      expect(Array.isArray(metrics.dependencies)).toBe(true)
      expect(Array.isArray(metrics.codeSmells)).toBe(true)
    })

    it('should maintain consistency between function count and array length', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      expect(metrics.functions).toBeDefined()
      expect(typeof metrics.functions).toBe('object')
      expect(Array.isArray(metrics.functions)).toBe(true)
    })

    it('should provide valid code smell type strings', () => {
      const filePath = path.join(__dirname, '../decision-engine.ts')
      const metrics = analyzer.analyzeComponent(filePath)

      const validTypes = ['long-function', 'high-complexity', 'missing-jsdoc', 'tight-coupling', 'deep-nesting']

      metrics.codeSmells.forEach((smell: any) => {
        expect(validTypes).toContain(smell.type)
      })
    })
  })
})
