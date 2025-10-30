/**
 * Tests for DecisionEngine.analyzeDeepArchitecture() method
 *
 * TDD Red Phase: Tests for deep analysis integration
 * Tests the integration between DecisionEngine and DeepAnalysisEngine
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { DecisionEngine } from '../decision-engine'
import * as path from 'path'

describe('DecisionEngine - Deep Architecture Analysis', () => {
  let engine: DecisionEngine
  const fixturesPath = path.join(__dirname, 'fixtures')
  const testPatternsPath = path.join(fixturesPath, 'test-patterns.json')

  beforeEach(() => {
    engine = new DecisionEngine({
      basePath: fixturesPath,
      patternsPath: testPatternsPath,
    })
  })

  /**
   * AC1: Test that analyzeDeepArchitecture method exists and is callable
   *
   * RED Phase: This test will FAIL because:
   * - analyzeDeepArchitecture() method doesn't exist yet
   * - DecisionEngine doesn't integrate with DeepAnalysisEngine
   */
  describe('AC1: Method existence and basic functionality', () => {
    it('should have analyzeDeepArchitecture method', () => {
      // Expect method to exist
      expect(engine.analyzeDeepArchitecture).toBeDefined()
      expect(typeof engine.analyzeDeepArchitecture).toBe('function')
    })

    it('should return an object with expected structure', () => {
      const result = engine.analyzeDeepArchitecture('mock-domain')

      // Expect result to have all required fields
      expect(result).toBeDefined()
      expect(result.domain).toBe('mock-domain')
      expect(result.commands).toBeDefined()
      expect(Array.isArray(result.commands)).toBe(true)
      expect(result.patterns).toBeDefined()
      expect(Array.isArray(result.patterns)).toBe(true)
      expect(result.deepAnalysis).toBeDefined()
      expect(result.summary).toBeDefined()
    })

    it('should include deepAnalysis with components, issues, and strategies', () => {
      const result = engine.analyzeDeepArchitecture('mock-domain')

      // Expect deepAnalysis to have correct structure
      expect(result.deepAnalysis).toBeDefined()
      expect(result.deepAnalysis.components).toBeDefined()
      expect(Array.isArray(result.deepAnalysis.components)).toBe(true)
      expect(result.deepAnalysis.issues).toBeDefined()
      expect(Array.isArray(result.deepAnalysis.issues)).toBe(true)
      expect(result.deepAnalysis.refactoringStrategies).toBeDefined()
      expect(Array.isArray(result.deepAnalysis.refactoringStrategies)).toBe(true)
      expect(result.deepAnalysis.summary).toBeDefined()
    })
  })

  /**
   * AC2: Test combined output - pattern recommendations + deep analysis
   *
   * RED Phase: This test will FAIL because:
   * - DecisionEngine doesn't combine analyzeDomain() with DeepAnalysisEngine
   * - The combined result structure doesn't exist yet
   */
  describe('AC2: Combined pattern recommendations and deep analysis', () => {
    it('should combine pattern recommendations with deep analysis for vtm domain', () => {
      const result = engine.analyzeDeepArchitecture('mock-domain')

      // Expect both light analysis (patterns) and deep analysis
      expect(result.commands).toBeDefined()
      expect(result.patterns).toBeDefined()
      expect(result.deepAnalysis).toBeDefined()

      // Commands should come from light analysis
      expect(result.commands.length).toBeGreaterThanOrEqual(0)

      // Deep analysis should have its own components
      expect(result.deepAnalysis.components.length).toBeGreaterThanOrEqual(0)
    })

    it('should include summary that aggregates both analyses', () => {
      const result = engine.analyzeDeepArchitecture('mock-domain')

      // Summary should aggregate data from both analyses
      expect(result.summary).toBeDefined()
      expect(result.summary.lightAnalysis).toBeDefined()
      expect(result.summary.deepAnalysis).toBeDefined()

      // Light analysis summary
      expect(result.summary.lightAnalysis.commands).toBeDefined()
      expect(result.summary.lightAnalysis.strengths).toBeDefined()
      expect(result.summary.lightAnalysis.issues).toBeDefined()

      // Deep analysis summary
      expect(result.summary.deepAnalysis.totalComponents).toBeDefined()
      expect(result.summary.deepAnalysis.totalIssues).toBeDefined()
      expect(result.summary.deepAnalysis.criticalIssues).toBeDefined()
    })

    it('should not duplicate data between light and deep analysis', () => {
      const result = engine.analyzeDeepArchitecture('mock-domain')

      // Light analysis has pattern-based commands
      expect(result.commands).toBeDefined()

      // Deep analysis has component metrics (not commands)
      expect(result.deepAnalysis.components).toBeDefined()

      // Verify they are different types of data
      if (result.commands.length > 0 && result.deepAnalysis.components.length > 0) {
        const command = result.commands[0]
        const component = result.deepAnalysis.components[0]

        // Commands have 'name' and 'description'
        expect(command).toHaveProperty('name')
        expect(command).toHaveProperty('description')

        // Components have 'fileName' and 'metrics'
        expect(component).toHaveProperty('fileName')
        expect(component).toHaveProperty('metrics')
      }
    })
  })

  /**
   * AC3: Test severity filtering
   *
   * RED Phase: This test will FAIL because:
   * - Severity filtering option doesn't exist in analyzeDeepArchitecture
   * - DetectionOptions aren't passed through to DeepAnalysisEngine
   */
  describe('AC3: Severity filtering', () => {
    it('should filter issues by default (medium and high only)', () => {
      const result = engine.analyzeDeepArchitecture('mock-domain')

      // By default, should filter out low severity issues
      const lowSeverityIssues = result.deepAnalysis.issues.filter((i) => i.severity === 'low')
      expect(lowSeverityIssues.length).toBe(0)
    })

    it('should include low severity issues when minSeverity is "low"', () => {
      const result = engine.analyzeDeepArchitecture('mock-domain', { minSeverity: 'low' })

      // Should include all severity levels
      const allSeverities = result.deepAnalysis.issues.map((i) => i.severity)
      const uniqueSeverities = [...new Set(allSeverities)]

      // May or may not have low issues, but they should be allowed
      expect(uniqueSeverities.every((s) => ['low', 'medium', 'high', 'critical'].includes(s))).toBe(true)
    })

    it('should only include high and critical issues when minSeverity is "high"', () => {
      const result = engine.analyzeDeepArchitecture('mock-domain', { minSeverity: 'high' })

      // Should only include high and critical
      const allSeverities = result.deepAnalysis.issues.map((i) => i.severity)
      const hasLowOrMedium = allSeverities.some((s) => s === 'low' || s === 'medium')

      expect(hasLowOrMedium).toBe(false)
    })

    it('should apply same filtering to refactoring strategies', () => {
      const result = engine.analyzeDeepArchitecture('mock-domain', { minSeverity: 'high' })

      // Refactoring strategies should only exist for filtered issues
      const strategySeverities = result.deepAnalysis.refactoringStrategies.map((s) => s.issue.severity)
      const hasLowOrMedium = strategySeverities.some((s) => s === 'low' || s === 'medium')

      expect(hasLowOrMedium).toBe(false)
    })
  })

  /**
   * AC4: Test error handling
   *
   * RED Phase: This test will FAIL because:
   * - Error handling not implemented yet
   * - analyzeDeepArchitecture doesn't validate paths
   */
  describe('AC4: Error handling', () => {
    it('should throw error for non-existent domain', () => {
      // Non-existent domain should throw
      expect(() => {
        engine.analyzeDeepArchitecture('non-existent-domain-xyz')
      }).toThrow()
    })

    it('should handle invalid domain path gracefully', () => {
      // Invalid path characters
      expect(() => {
        engine.analyzeDeepArchitecture('../../../etc/passwd')
      }).toThrow()
    })

    it('should return valid result for empty domain', () => {
      // Empty domain should return empty results, not throw
      const result = engine.analyzeDeepArchitecture('empty-domain')

      expect(result).toBeDefined()
      expect(result.domain).toBe('empty-domain')
      expect(result.deepAnalysis.components.length).toBe(0)
      expect(result.deepAnalysis.issues.length).toBe(0)
    })

    it('should provide meaningful error messages', () => {
      try {
        engine.analyzeDeepArchitecture('non-existent-domain-xyz')
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('domain')
      }
    })
  })

  /**
   * AC5: Test integration between DecisionEngine and DeepAnalysisEngine
   *
   * RED Phase: This test will FAIL because:
   * - DecisionEngine doesn't instantiate DeepAnalysisEngine
   * - Integration layer doesn't exist
   */
  describe('AC5: DeepAnalysisEngine integration', () => {
    it('should instantiate DeepAnalysisEngine internally', () => {
      // Call analyzeDeepArchitecture - should not throw
      expect(() => {
        engine.analyzeDeepArchitecture('mock-domain')
      }).not.toThrow()
    })

    it('should pass domain path to DeepAnalysisEngine.runFullAnalysis', () => {
      const result = engine.analyzeDeepArchitecture('mock-domain')

      // Domain should be analyzed by DeepAnalysisEngine
      expect(result.deepAnalysis).toBeDefined()
      expect(result.deepAnalysis.summary).toBeDefined()
      expect(result.deepAnalysis.summary.totalComponents).toBeGreaterThanOrEqual(0)
    })

    it('should pass DetectionOptions through to DeepAnalysisEngine', () => {
      const options = {
        minSeverity: 'high' as const,
        skipRules: ['OutdatedDependencies'],
      }

      const result = engine.analyzeDeepArchitecture('mock-domain', options)

      // Options should affect deep analysis results
      expect(result.deepAnalysis).toBeDefined()

      // Verify no low/medium severity issues (due to minSeverity: 'high')
      const hasLowOrMedium = result.deepAnalysis.issues.some((i) => i.severity === 'low' || i.severity === 'medium')
      expect(hasLowOrMedium).toBe(false)
    })

    it('should combine results from both analyzeDomain and DeepAnalysisEngine', () => {
      const result = engine.analyzeDeepArchitecture('mock-domain')

      // Should have data from analyzeDomain (light analysis)
      expect(result.commands).toBeDefined()
      expect(result.patterns).toBeDefined()

      // Should have data from DeepAnalysisEngine (deep analysis)
      expect(result.deepAnalysis).toBeDefined()
      expect(result.deepAnalysis.components).toBeDefined()
      expect(result.deepAnalysis.issues).toBeDefined()
      expect(result.deepAnalysis.refactoringStrategies).toBeDefined()
    })
  })

  /**
   * AC6: Test data integrity across tiers
   *
   * RED Phase: This test will FAIL because:
   * - Data flow between tiers not implemented
   * - Summary aggregation doesn't exist
   */
  describe('AC6: Data integrity and summary statistics', () => {
    it('should have accurate component counts', () => {
      const result = engine.analyzeDeepArchitecture('mock-domain')

      // Component count in summary should match components array
      expect(result.deepAnalysis.summary.totalComponents).toBe(result.deepAnalysis.components.length)
    })

    it('should have accurate issue counts', () => {
      const result = engine.analyzeDeepArchitecture('mock-domain')

      // Issue count in summary should match issues array
      expect(result.deepAnalysis.summary.totalIssues).toBe(result.deepAnalysis.issues.length)
    })

    it('should have accurate critical issue counts', () => {
      const result = engine.analyzeDeepArchitecture('mock-domain')

      // Critical issue count should match filtered issues
      const criticalCount = result.deepAnalysis.issues.filter((i) => i.severity === 'critical').length
      expect(result.deepAnalysis.summary.criticalIssues).toBe(criticalCount)
    })

    it('should have refactoring strategy for each issue', () => {
      const result = engine.analyzeDeepArchitecture('mock-domain')

      // Each issue should have a corresponding refactoring strategy
      expect(result.deepAnalysis.refactoringStrategies.length).toBe(result.deepAnalysis.issues.length)
    })

    it('should preserve issue references in refactoring strategies', () => {
      const result = engine.analyzeDeepArchitecture('mock-domain')

      // Each strategy should reference a valid issue
      if (result.deepAnalysis.refactoringStrategies.length > 0) {
        const strategy = result.deepAnalysis.refactoringStrategies[0]
        expect(strategy).toBeDefined()
        expect(strategy.issue).toBeDefined()
        expect(strategy.issue.id).toBeDefined()

        // Issue ID should exist in issues array
        const issueExists = result.deepAnalysis.issues.some((i) => i.id === strategy.issue.id)
        expect(issueExists).toBe(true)
      }
    })

    it('should have consistent summary statistics', () => {
      const result = engine.analyzeDeepArchitecture('mock-domain')

      // All summary counts should be non-negative
      expect(result.deepAnalysis.summary.totalComponents).toBeGreaterThanOrEqual(0)
      expect(result.deepAnalysis.summary.totalIssues).toBeGreaterThanOrEqual(0)
      expect(result.deepAnalysis.summary.criticalIssues).toBeGreaterThanOrEqual(0)
      expect(result.deepAnalysis.summary.totalRefactoringOptions).toBeGreaterThanOrEqual(0)

      // Critical issues should not exceed total issues
      expect(result.deepAnalysis.summary.criticalIssues).toBeLessThanOrEqual(result.deepAnalysis.summary.totalIssues)
    })
  })
})
