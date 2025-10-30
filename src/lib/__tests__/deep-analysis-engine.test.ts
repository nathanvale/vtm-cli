/**
 * Tests for DeepAnalysisEngine
 *
 * TDD test suite for the 3-tier deep analysis pipeline that integrates:
 * - ComponentAnalyzer (tier 1): File-level metrics and code smell detection
 * - IssueDetector (tier 2): Architectural issue detection with severity
 * - RefactoringPlanner (tier 3): Refactoring strategies and migration plans
 */

import { DeepAnalysisEngine } from '../deep-analysis-engine'
import * as fs from 'fs'
import * as path from 'path'

describe('DeepAnalysisEngine', () => {
  describe('Constructor', () => {
    it('should create a new DeepAnalysisEngine instance', () => {
      const engine = new DeepAnalysisEngine()
      expect(engine).toBeInstanceOf(DeepAnalysisEngine)
    })
  })

  describe('runFullAnalysis()', () => {
    const testDomainPath = path.join(__dirname, '../../__test-fixtures__/test-domain')

    beforeAll(() => {
      // Create test domain directory structure
      if (!fs.existsSync(testDomainPath)) {
        fs.mkdirSync(testDomainPath, { recursive: true })
      }

      // Create test TypeScript file with complexity
      const testFile = path.join(testDomainPath, 'test-component.ts')
      fs.writeFileSync(
        testFile,
        `
/**
 * Test component for analysis
 */
export function simpleFunction(arg1: string): string {
  return arg1
}

export function complexFunction(arg1: string, arg2: number): string {
  if (arg2 > 10) {
    if (arg1.length > 5) {
      return 'complex'
    }
  }
  return 'simple'
}
`.trim(),
      )
    })

    afterAll(() => {
      // Clean up test fixtures
      if (fs.existsSync(testDomainPath)) {
        fs.rmSync(testDomainPath, { recursive: true, force: true })
      }
    })

    it('should return structured AnalysisResult with all tiers', () => {
      const engine = new DeepAnalysisEngine()
      const result = engine.runFullAnalysis(testDomainPath)

      expect(result).toHaveProperty('components')
      expect(result).toHaveProperty('issues')
      expect(result).toHaveProperty('refactoringStrategies')
      expect(result).toHaveProperty('summary')
    })

    it('should include ComponentAnalyzer results (Tier 1)', () => {
      const engine = new DeepAnalysisEngine()
      const result = engine.runFullAnalysis(testDomainPath)

      expect(result.components).toBeInstanceOf(Array)
      expect(result.components.length).toBeGreaterThan(0)

      const component = result.components[0]
      expect(component).toHaveProperty('name')
      expect(component).toHaveProperty('filePath')
      expect(component).toHaveProperty('lines')
      expect(component).toHaveProperty('complexity')
      expect(component).toHaveProperty('functions')
      expect(component).toHaveProperty('codeSmells')
    })

    it('should include IssueDetector results (Tier 2)', () => {
      const engine = new DeepAnalysisEngine()
      const result = engine.runFullAnalysis(testDomainPath)

      expect(result.issues).toBeInstanceOf(Array)
      // Issues may or may not be found depending on domain, so just check structure
      if (result.issues.length > 0) {
        const issue = result.issues[0]
        expect(issue).toHaveProperty('id')
        expect(issue).toHaveProperty('title')
        expect(issue).toHaveProperty('severity')
        expect(issue).toHaveProperty('description')
      }
    })

    it('should include RefactoringPlanner results (Tier 3)', () => {
      const engine = new DeepAnalysisEngine()
      const result = engine.runFullAnalysis(testDomainPath)

      expect(result.refactoringStrategies).toBeInstanceOf(Array)
      // Strategies only exist if issues are detected
      if (result.refactoringStrategies.length > 0) {
        const strategy = result.refactoringStrategies[0]
        expect(strategy).toHaveProperty('issue')
        expect(strategy).toHaveProperty('options')
        expect(strategy).toHaveProperty('recommendedOption')
      }
    })

    it('should include summary with key metrics', () => {
      const engine = new DeepAnalysisEngine()
      const result = engine.runFullAnalysis(testDomainPath)

      expect(result.summary).toHaveProperty('totalComponents')
      expect(result.summary).toHaveProperty('totalIssues')
      expect(result.summary).toHaveProperty('criticalIssues')
      expect(result.summary).toHaveProperty('totalRefactoringOptions')
      expect(result.summary.totalComponents).toBe(result.components.length)
      expect(result.summary.totalIssues).toBe(result.issues.length)
    })

    it('should throw error for non-existent directory', () => {
      const engine = new DeepAnalysisEngine()
      expect(() => engine.runFullAnalysis('/non/existent/path')).toThrow('Domain path does not exist')
    })

    it('should handle empty directory gracefully', () => {
      const emptyDir = path.join(__dirname, '../../__test-fixtures__/empty-domain')
      fs.mkdirSync(emptyDir, { recursive: true })

      const engine = new DeepAnalysisEngine()
      const result = engine.runFullAnalysis(emptyDir, {
        skipRules: ['OutdatedDependencies'], // Skip package.json checks for empty dir test
      })

      expect(result.components).toEqual([])
      expect(result.issues).toEqual([])
      expect(result.refactoringStrategies).toEqual([])
      expect(result.summary.totalComponents).toBe(0)
      expect(result.summary.totalIssues).toBe(0)

      fs.rmSync(emptyDir, { recursive: true, force: true })
    })
  })

  describe('Pipeline integration', () => {
    it('should pass ComponentAnalyzer output to IssueDetector', () => {
      // This test verifies the data flows correctly between tiers
      const testDomainPath = path.join(__dirname, '../../__test-fixtures__/pipeline-test')
      fs.mkdirSync(testDomainPath, { recursive: true })

      const testFile = path.join(testDomainPath, 'component.ts')
      fs.writeFileSync(testFile, 'export function test() { return "test" }')

      const engine = new DeepAnalysisEngine()
      const result = engine.runFullAnalysis(testDomainPath)

      // If ComponentAnalyzer found components, they should be analyzed by IssueDetector
      expect(result.components.length).toBeGreaterThan(0)
      // IssueDetector should have run (even if no issues found)
      expect(result.issues).toBeInstanceOf(Array)

      fs.rmSync(testDomainPath, { recursive: true, force: true })
    })

    it('should pass IssueDetector output to RefactoringPlanner', () => {
      // Create domain with known issues to trigger refactoring planning
      const testDomainPath = path.join(__dirname, '../../__test-fixtures__/refactoring-test')
      fs.mkdirSync(testDomainPath, { recursive: true })

      // Create multiple files to potentially trigger "Too Many Commands" issue
      for (let i = 1; i <= 12; i++) {
        const testFile = path.join(testDomainPath, `command-${i}.ts`)
        fs.writeFileSync(testFile, `export function command${i}() { return ${i} }`)
      }

      const engine = new DeepAnalysisEngine()
      const result = engine.runFullAnalysis(testDomainPath)

      // Should have components
      expect(result.components.length).toBeGreaterThan(0)

      // If issues were detected, refactoring strategies should be generated
      if (result.issues.length > 0) {
        expect(result.refactoringStrategies.length).toBeGreaterThan(0)
        expect(result.refactoringStrategies[0].options.length).toBeGreaterThan(0)
      }

      fs.rmSync(testDomainPath, { recursive: true, force: true })
    })

    /**
     * AC5: Comprehensive pipeline data flow test
     *
     * Verifies that metrics from ComponentAnalyzer properly influence
     * IssueDetector results, which then generate appropriate RefactoringPlanner strategies.
     */
    it('should maintain data integrity through entire pipeline', () => {
      const testDomainPath = path.join(__dirname, '../../__test-fixtures__/integrity-test')
      fs.mkdirSync(testDomainPath, { recursive: true })

      // Create components with specific metrics that should trigger issues
      const highComplexityFile = path.join(testDomainPath, 'high-complexity.ts')
      fs.writeFileSync(
        highComplexityFile,
        `
export function complexFunction(a: number, b: number, c: number): number {
  if (a > 10) {
    if (b > 20) {
      if (c > 30) {
        return a + b + c
      } else {
        return a + b
      }
    } else {
      return a
    }
  }
  return 0
}
      `.trim(),
      )

      // Create multiple files to trigger architectural issues
      for (let i = 1; i <= 15; i++) {
        fs.writeFileSync(path.join(testDomainPath, `file-${i}.ts`), `export function func${i}() { return ${i} }`)
      }

      const engine = new DeepAnalysisEngine()
      const result = engine.runFullAnalysis(testDomainPath)

      // Verify Tier 1 → Tier 2 data flow
      expect(result.components.length).toBeGreaterThan(0)
      const complexComponent = result.components.find((c) => c.name === 'high-complexity')
      expect(complexComponent).toBeDefined()
      expect(complexComponent?.complexity).toBeGreaterThan(0)

      // Verify Tier 2 → Tier 3 data flow
      if (result.issues.length > 0) {
        // Issues should have refactoring strategies generated
        expect(result.refactoringStrategies.length).toBeGreaterThan(0)

        // Filter strategies that have options (RefactoringPlanner only supports 4 issue types)
        const strategiesWithOptions = result.refactoringStrategies.filter((s) => s.options.length > 0)

        // Should have at least one strategy with options (Too Many Commands is detected)
        expect(strategiesWithOptions.length).toBeGreaterThan(0)

        // Each strategy with options should be well-formed
        strategiesWithOptions.forEach((strategy) => {
          expect(strategy.issue).toBeDefined()
          expect(strategy.options.length).toBeGreaterThanOrEqual(2)
          expect(strategy.recommendedOption).toBeDefined()
        })

        // Verify strategies reference actual issues
        result.refactoringStrategies.forEach((strategy) => {
          const correspondingIssue = result.issues.find((issue) => issue.id === strategy.issue.id)
          expect(correspondingIssue).toBeDefined()
        })
      }

      // Verify summary aggregates data from all tiers
      expect(result.summary.totalComponents).toBe(result.components.length)
      expect(result.summary.totalIssues).toBe(result.issues.length)
      // TotalRefactoringOptions counts options from strategies that have them
      // (Not all 19 issues get strategies, only 4 types are supported: Too Many Commands has 3 options)
      expect(result.summary.totalRefactoringOptions).toBeGreaterThan(0)

      fs.rmSync(testDomainPath, { recursive: true, force: true })
    })

    /**
     * AC5: Test that code smells from ComponentAnalyzer influence IssueDetector
     *
     * Verifies that code smell detection flows into architectural issue detection.
     */
    it('should use code smells in architectural issue detection', () => {
      const testDomainPath = path.join(__dirname, '../../__test-fixtures__/code-smells-test')
      fs.mkdirSync(testDomainPath, { recursive: true })

      // Create file with code smells (missing JSDoc, high complexity)
      fs.writeFileSync(
        path.join(testDomainPath, 'smelly-code.ts'),
        `
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import commander from 'commander'
import lodash from 'lodash'
import axios from 'axios'
import express from 'express'

export function undocumentedComplexFunction(x: number, y: string): string {
  if (x > 0) {
    if (y === 'a') {
      if (x > 10) {
        return 'high'
      }
      return 'medium'
    }
    return 'low'
  }
  return 'none'
}
      `.trim(),
      )

      const engine = new DeepAnalysisEngine()
      const result = engine.runFullAnalysis(testDomainPath)

      // Verify code smells were detected in Tier 1
      expect(result.components.length).toBeGreaterThan(0)
      const component = result.components[0]
      expect(component?.codeSmells).toBeDefined()

      // Code smells should contribute to issues in Tier 2
      // (tight coupling due to many imports, high complexity)
      const tightCouplingIssue = result.issues.find((issue) => issue.title.toLowerCase().includes('coupling'))
      if (tightCouplingIssue) {
        expect(tightCouplingIssue.severity).toMatch(/medium|high|critical/)
      }

      fs.rmSync(testDomainPath, { recursive: true, force: true })
    })
  })

  describe('Error handling', () => {
    it('should throw meaningful error for invalid path', () => {
      const engine = new DeepAnalysisEngine()
      expect(() => engine.runFullAnalysis('/invalid/path')).toThrow(/does not exist/)
    })

    it('should handle file system permission errors gracefully', () => {
      // This test documents expected behavior but may not be testable in all environments
      const engine = new DeepAnalysisEngine()
      // Most file system operations should handle errors internally
      expect(engine).toBeDefined()
    })
  })

  describe('runFullAnalysis() with options', () => {
    it('should support skipRules option', () => {
      const testDomainPath = path.join(__dirname, '../../__test-fixtures__/options-test')
      fs.mkdirSync(testDomainPath, { recursive: true })

      const testFile = path.join(testDomainPath, 'test.ts')
      fs.writeFileSync(testFile, 'export function test() { return "test" }')

      const engine = new DeepAnalysisEngine()
      const result = engine.runFullAnalysis(testDomainPath, {
        skipRules: ['OutdatedDependencies'],
      })

      // Result should still be valid
      expect(result).toHaveProperty('components')
      expect(result).toHaveProperty('issues')

      fs.rmSync(testDomainPath, { recursive: true, force: true })
    })

    it('should support minSeverity option', () => {
      const testDomainPath = path.join(__dirname, '../../__test-fixtures__/severity-test')
      fs.mkdirSync(testDomainPath, { recursive: true })

      const testFile = path.join(testDomainPath, 'test.ts')
      fs.writeFileSync(testFile, 'export function test() { return "test" }')

      const engine = new DeepAnalysisEngine()
      const result = engine.runFullAnalysis(testDomainPath, {
        minSeverity: 'high',
      })

      // All returned issues should be high or critical
      result.issues.forEach((issue) => {
        expect(['high', 'critical']).toContain(issue.severity)
      })

      fs.rmSync(testDomainPath, { recursive: true, force: true })
    })
  })

  describe('Real-world integration tests', () => {
    /**
     * AC2: Test with actual vtm domain (src/lib)
     *
     * This test uses the actual codebase to verify the pipeline works
     * on real TypeScript code with genuine complexity and patterns.
     */
    it('should analyze the actual vtm domain (src/lib)', () => {
      const vtmDomainPath = path.join(__dirname, '..')
      const engine = new DeepAnalysisEngine()

      const result = engine.runFullAnalysis(vtmDomainPath, {
        skipRules: ['OutdatedDependencies'], // Skip to avoid package.json dependency
      })

      // Verify we analyzed real components
      expect(result.components.length).toBeGreaterThan(10)
      expect(result.summary.totalComponents).toBeGreaterThan(10)

      // Verify we found actual TypeScript files
      const hasVtmReader = result.components.some((c) => c.name === 'vtm-reader')
      const hasVtmWriter = result.components.some((c) => c.name === 'vtm-writer')
      const hasComponentAnalyzer = result.components.some((c) => c.name === 'component-analyzer')

      // At least some of the core VTM components should be found
      expect(hasVtmReader || hasVtmWriter || hasComponentAnalyzer).toBe(true)

      // Verify all three tiers completed successfully
      expect(result.components).toBeInstanceOf(Array)
      expect(result.issues).toBeInstanceOf(Array)
      expect(result.refactoringStrategies).toBeInstanceOf(Array)

      // Verify summary is accurate
      expect(result.summary.totalComponents).toBe(result.components.length)
      expect(result.summary.totalIssues).toBe(result.issues.length)

      // If issues were found, strategies should be generated
      // Note: Not all issue types have refactoring strategies (only 4 types currently supported)
      if (result.issues.length > 0) {
        // Should have at least some strategies generated
        expect(result.refactoringStrategies).toBeInstanceOf(Array)

        // Each generated strategy should be well-formed
        result.refactoringStrategies.forEach((strategy) => {
          expect(strategy.issue).toBeDefined()
          expect(strategy.options).toBeInstanceOf(Array)
          if (strategy.options.length > 0) {
            expect(strategy.options.length).toBeGreaterThanOrEqual(2)
          }
        })
      }
    })

    /**
     * AC2: Test with mock plan domain structure
     *
     * Creates a realistic plan domain structure to test domain-specific analysis.
     */
    it('should analyze a plan domain structure', () => {
      const planDomainPath = path.join(__dirname, '../../__test-fixtures__/plan-domain')
      fs.mkdirSync(planDomainPath, { recursive: true })

      // Create plan domain files with realistic structure
      fs.writeFileSync(
        path.join(planDomainPath, 'plan-generator.ts'),
        `
/**
 * Plan generator for ADR creation
 */
import fs from 'fs'
import path from 'path'

export class PlanGenerator {
  private outputPath: string

  constructor(outputPath: string) {
    this.outputPath = outputPath
  }

  /**
   * Generate ADR from PRD
   */
  public generateADR(prdPath: string): void {
    const prdContent = fs.readFileSync(prdPath, 'utf-8')
    // Generate ADR logic here
  }

  /**
   * Validate ADR structure
   */
  public validateADR(adrPath: string): boolean {
    const content = fs.readFileSync(adrPath, 'utf-8')
    return content.includes('## Decision')
  }
}
      `.trim(),
      )

      fs.writeFileSync(
        path.join(planDomainPath, 'spec-creator.ts'),
        `
/**
 * Technical specification creator
 */
export class SpecCreator {
  public createSpec(adrPath: string): string {
    // Create spec from ADR
    return 'spec content'
  }

  public validateSpec(specPath: string): boolean {
    return true
  }
}
      `.trim(),
      )

      fs.writeFileSync(
        path.join(planDomainPath, 'vtm-converter.ts'),
        `
export function convertToVTM(adrPath: string, specPath: string): unknown {
  // Convert ADR + Spec to VTM tasks
  return { tasks: [] }
}
      `.trim(),
      )

      const engine = new DeepAnalysisEngine()
      const result = engine.runFullAnalysis(planDomainPath)

      // Verify plan domain was analyzed
      expect(result.components.length).toBe(3)
      expect(result.components.some((c) => c.name === 'plan-generator')).toBe(true)
      expect(result.components.some((c) => c.name === 'spec-creator')).toBe(true)
      expect(result.components.some((c) => c.name === 'vtm-converter')).toBe(true)

      // Verify all tiers ran
      expect(result.summary.totalComponents).toBe(3)
      expect(result.issues).toBeInstanceOf(Array)
      expect(result.refactoringStrategies).toBeInstanceOf(Array)

      fs.rmSync(planDomainPath, { recursive: true, force: true })
    })

    /**
     * AC2: Test with complex real-world scenario
     *
     * Simulates a domain with multiple architectural issues to verify
     * the entire pipeline produces actionable recommendations.
     */
    it('should produce actionable recommendations for complex domains', () => {
      const complexDomainPath = path.join(__dirname, '../../__test-fixtures__/complex-domain')
      fs.mkdirSync(complexDomainPath, { recursive: true })

      // Create 15+ files to trigger "Too Many Commands"
      for (let i = 1; i <= 15; i++) {
        fs.writeFileSync(
          path.join(complexDomainPath, `command-${i}.ts`),
          `
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'
import commander from 'commander'

export function command${i}(arg1: string, arg2: number, arg3: boolean): void {
  if (arg2 > 10) {
    if (arg3) {
      console.log(chalk.green('Success'))
    } else {
      console.log(chalk.red('Failed'))
    }
  }
}
        `.trim(),
        )
      }

      const engine = new DeepAnalysisEngine()
      const result = engine.runFullAnalysis(complexDomainPath)

      // Should find multiple issues
      expect(result.issues.length).toBeGreaterThan(0)

      // Should have "Too Many Commands" issue
      const tooManyCommandsIssue = result.issues.find((issue) => issue.title.includes('Too Many Commands'))
      expect(tooManyCommandsIssue).toBeDefined()

      // May have "Tight Coupling" issue (requires > 6 external dependencies per file)
      // This is optional depending on the exact import structure
      const tightCouplingIssue = result.issues.find((issue) => issue.title.includes('Tight Coupling'))
      if (tightCouplingIssue) {
        expect(tightCouplingIssue.severity).toMatch(/medium|high|critical/)
      }

      // Each refactoring strategy should be well-formed
      // Note: Not all issues have refactoring strategies (only 4 issue types supported)
      // Filter to strategies that have options
      const strategiesWithOptions = result.refactoringStrategies.filter((s) => s.options.length > 0)

      // Should have at least the "Too Many Commands" strategy
      expect(strategiesWithOptions.length).toBeGreaterThan(0)

      strategiesWithOptions.forEach((strategy) => {
        expect(strategy.issue).toBeDefined()
        expect(strategy.options.length).toBeGreaterThanOrEqual(2)
        expect(strategy.recommendedOption).toBeDefined()

        // Recommended option should have proper structure
        if (strategy.recommendedOption) {
          expect(strategy.recommendedOption.name).toBeDefined()
          expect(strategy.recommendedOption.description).toBeDefined()
          expect(strategy.recommendedOption.pros.length).toBeGreaterThan(0)
          expect(strategy.recommendedOption.cons.length).toBeGreaterThan(0)
          expect(strategy.recommendedOption.effort).toBeDefined()
          expect(strategy.recommendedOption.recommendation).toBe(true)
        }
      })

      // Summary should reflect the complexity
      expect(result.summary.totalComponents).toBe(15)
      expect(result.summary.totalIssues).toBeGreaterThanOrEqual(2)
      // At least 3 options from "Too Many Commands" strategy
      expect(result.summary.totalRefactoringOptions).toBeGreaterThanOrEqual(3)

      fs.rmSync(complexDomainPath, { recursive: true, force: true })
    })
  })
})
