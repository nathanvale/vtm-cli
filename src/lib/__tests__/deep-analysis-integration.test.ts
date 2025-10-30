/**
 * Integration Tests for Deep Architectural Analysis Pipeline
 *
 * Tests the complete workflow: ComponentAnalyzer → IssueDetector → RefactoringPlanner
 *
 * Verifies that:
 * 1. ComponentAnalyzer extracts metrics from domain
 * 2. IssueDetector identifies issues based on metrics
 * 3. RefactoringPlanner generates strategies for issues
 * 4. Complete pipeline produces actionable recommendations
 */

import { describe, it, expect, beforeAll } from 'vitest'
import path from 'path'
import type { ArchitecturalIssue, RefactoringOption, MigrationStrategy } from '../types'

let ComponentAnalyzer: any
let IssueDetector: any
let RefactoringPlanner: any

beforeAll(async () => {
  try {
    const ca = await import('../component-analyzer')
    ComponentAnalyzer = ca.ComponentAnalyzer

    const id = await import('../issue-detector')
    IssueDetector = id.IssueDetector

    const rp = await import('../refactoring-planner')
    RefactoringPlanner = rp.RefactoringPlanner
  } catch (error) {
    throw new Error(`Failed to load analysis modules: ${error}`)
  }
})

describe('Deep Analysis Integration: Full Pipeline', () => {
  it('should execute complete analysis pipeline on real domain', () => {
    const libDirPath = path.join(__dirname, '..')
    const vtmReaderPath = path.join(libDirPath, 'vtm-reader.ts')

    // Step 1: ComponentAnalyzer - Extract metrics for specific file
    const analyzer = new ComponentAnalyzer()
    const metrics = analyzer.analyzeComponent(vtmReaderPath)

    expect(metrics).toBeDefined()
    expect(metrics.name).toBeDefined()
    expect(metrics.filePath).toBeDefined()
    expect(metrics.functions).toBeDefined()
    expect(metrics.complexity).toBeDefined()
    expect(metrics.dependencies).toBeDefined()
    expect(metrics.jsdocCoverage).toBeDefined()
  })

  it('should detect issues based on component metrics', () => {
    const libDirPath = path.join(__dirname, '..')

    // Detect issues from domain
    const detector = new IssueDetector()
    const issues = detector.detect(libDirPath)

    // Verify issues structure
    expect(Array.isArray(issues)).toBe(true)

    issues.forEach((issue: ArchitecturalIssue) => {
      expect(issue.id).toBeDefined()
      expect(issue.title).toBeDefined()
      expect(issue.severity).toBeDefined()
      expect(['critical', 'high', 'medium', 'low']).toContain(issue.severity)
      expect(issue.evidence).toBeDefined()
      expect(Array.isArray(issue.impact)).toBe(true)
    })
  })

  it('should generate refactoring strategies for detected issues', () => {
    const libDirPath = path.join(__dirname, '..')

    // Step 1: Detect issues
    const detector = new IssueDetector()
    const issues = detector.detect(libDirPath)

    // Step 2: Generate strategies
    const planner = new RefactoringPlanner()

    issues.forEach((issue: ArchitecturalIssue) => {
      const options = planner.generateOptions(issue)

      // Verify options exist for detected issues
      if (
        issue.title === 'Too Many Commands' ||
        issue.title === 'Low Cohesion' ||
        issue.title === 'Tight Coupling' ||
        issue.title === 'Test Coverage Gaps'
      ) {
        expect(options.length).toBeGreaterThan(0)

        // Verify strategy can be created for recommended option
        const bestOption = planner.recommendBest(options)
        if (bestOption) {
          const strategy = planner.createMigrationStrategy(issue, bestOption)
          expect(strategy).toBeDefined()
        }
      }
    })
  })

  it('should create executable checklists from migration strategies', () => {
    const libDirPath = path.join(__dirname, '..')

    const detector = new IssueDetector()
    const issues = detector.detect(libDirPath)

    const planner = new RefactoringPlanner()

    // Find first resolvable issue
    let checklist = null
    for (const issue of issues) {
      const options = planner.generateOptions(issue)
      if (options.length > 0) {
        const bestOption = planner.recommendBest(options)
        const strategy = planner.createMigrationStrategy(issue, bestOption)

        if (strategy) {
          checklist = planner.buildChecklist(strategy)
          break
        }
      }
    }

    if (checklist) {
      expect(checklist).toBeDefined()
      expect(Array.isArray(checklist.phases)).toBe(true)
      expect(checklist.phases.length).toEqual(3) // Plan, Implement, Validate
      expect(['low', 'medium', 'high', 'critical']).toContain(checklist.overallRisk)
      expect(Array.isArray(checklist.approvalGates)).toBe(true)
    }
  })

  it('should handle complete workflow for each issue type', () => {
    const libDirPath = path.join(__dirname, '..')

    const detector = new IssueDetector()
    const allIssues = detector.detect(libDirPath)

    const planner = new RefactoringPlanner()

    const issueTypes = new Set<string>()

    allIssues.forEach((issue: ArchitecturalIssue) => {
      issueTypes.add(issue.title)

      const options = planner.generateOptions(issue)

      if (options.length > 0) {
        // Verify each option has required properties
        options.forEach((option: RefactoringOption) => {
          expect(option.name).toBeDefined()
          expect(option.description).toBeDefined()
          expect(Array.isArray(option.pros)).toBe(true)
          expect(Array.isArray(option.cons)).toBe(true)
          expect(option.effort).toBeDefined()
          expect(typeof option.breaking).toBe('boolean')
          expect(['low', 'medium', 'high']).toContain(option.riskLevel)
        })

        // Test best recommendation
        const bestOption = planner.recommendBest(options)
        expect(bestOption).toBeDefined()

        // Test strategy creation
        const strategy = planner.createMigrationStrategy(issue, bestOption)
        if (strategy) {
          expect(strategy.name).toBeDefined()
          expect(strategy.overview).toBeDefined()
          expect(Array.isArray(strategy.phases)).toBe(true)
          expect(strategy.phases.length).toEqual(3)

          // Verify phase structure
          strategy.phases.forEach((phase) => {
            expect(phase.name).toBeDefined()
            expect(phase.description).toBeDefined()
            expect(Array.isArray(phase.tasks)).toBe(true)
            expect(Array.isArray(phase.qualityGates)).toBe(true)
          })

          // Test checklist building
          const checklist = planner.buildChecklist(strategy)
          expect(checklist).toBeDefined()
          expect(checklist.totalDuration).toBeDefined()
        }
      }
    })
  })

  it('should analyze multiple components in domain', () => {
    const libDirPath = path.join(__dirname, '..')

    const analyzer = new ComponentAnalyzer()
    const domainMetrics = analyzer.scanComponentDir(libDirPath)

    expect(Array.isArray(domainMetrics)).toBe(true)
    expect(domainMetrics.length).toBeGreaterThan(0)

    // Each component should have metrics
    domainMetrics.forEach((metrics) => {
      expect(metrics.filePath).toBeDefined()
      expect(metrics.name).toBeDefined()
      expect(typeof metrics.complexity).toBe('number')
      expect(typeof metrics.jsdocCoverage).toBe('number')
      expect(Array.isArray(metrics.functions)).toBe(true)
      expect(Array.isArray(metrics.codeSmells)).toBe(true)
    })
  })

  it('should provide actionable recommendations for architectural issues', () => {
    const libDirPath = path.join(__dirname, '..')

    const detector = new IssueDetector()
    const issues = detector.detect(libDirPath)

    const planner = new RefactoringPlanner()

    const recommendations: {
      issue: ArchitecturalIssue
      bestOption: RefactoringOption
      strategy: MigrationStrategy
    }[] = []

    issues.forEach((issue: ArchitecturalIssue) => {
      const options = planner.generateOptions(issue)
      if (options.length > 0) {
        const bestOption = planner.recommendBest(options)
        if (bestOption) {
          const strategy = planner.createMigrationStrategy(issue, bestOption)
          if (strategy) {
            recommendations.push({
              issue,
              bestOption,
              strategy,
            })
          }
        }
      }
    })

    // Each recommendation should be actionable
    recommendations.forEach((rec) => {
      // Issue: Clear severity and impact
      expect(['critical', 'high', 'medium', 'low']).toContain(rec.issue.severity)
      expect(rec.issue.impact.length).toBeGreaterThan(0)

      // Option: Recommended with effort and risk
      expect(rec.bestOption.recommendation).toBe(true)
      expect(rec.bestOption.effort).toMatch(/\d+-\d+\s+(hours|days)/)
      expect(['low', 'medium', 'high']).toContain(rec.bestOption.riskLevel)

      // Strategy: Multi-phase with quality gates
      expect(rec.strategy.phases.length).toEqual(3)
      rec.strategy.phases.forEach((phase) => {
        expect(phase.qualityGates.length).toBeGreaterThan(0)
      })

      // Rollback plan exists
      expect(rec.strategy.rollbackPlan).toBeDefined()
      expect(rec.strategy.rollbackPlan.length).toBeGreaterThan(0)
    })
  })

  it('should rank issues by severity for prioritization', () => {
    const libDirPath = path.join(__dirname, '..')

    const detector = new IssueDetector()
    const issues = detector.detect(libDirPath)

    // Issues should be sorted by severity
    if (issues.length > 1) {
      const severityOrder: Record<string, number> = {
        critical: 4,
        high: 3,
        medium: 2,
        low: 1,
      }

      for (let i = 1; i < issues.length; i++) {
        const prevScore = severityOrder[issues[i - 1].severity] || 0
        const currScore = severityOrder[issues[i].severity] || 0
        expect(prevScore).toBeGreaterThanOrEqual(currScore)
      }
    }
  })

  it('should handle null options gracefully in workflow', () => {
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Unknown Issue Type',
      description: 'Test issue',
      severity: 'medium',
      location: 'src/lib',
      evidence: 'test evidence',
      impact: ['test impact'],
      effort: '1-2 hours',
      relatedIssues: [],
    }

    const planner = new RefactoringPlanner()

    // Unknown issue should return empty options
    const options = planner.generateOptions(issue)
    expect(options.length).toBe(0)

    // recommendBest on empty should return null
    const bestOption = planner.recommendBest(options)
    expect(bestOption).toBeNull()

    // createMigrationStrategy with null option should return null
    const strategy = planner.createMigrationStrategy(issue, bestOption)
    expect(strategy).toBeNull()
  })

  it('should provide complete traceability from metrics to strategies', () => {
    const libDirPath = path.join(__dirname, '..')
    const vtmReaderPath = path.join(libDirPath, 'vtm-reader.ts')

    // Step 1: Analyze - get metrics for a specific file
    const analyzer = new ComponentAnalyzer()
    const fileMetrics = analyzer.analyzeComponent(vtmReaderPath)

    // Step 2: Detect - identify issues in domain
    const detector = new IssueDetector()
    const issues = detector.detect(libDirPath)

    // Step 3: Plan - generate strategies for issues
    const planner = new RefactoringPlanner()

    const tracedItems = issues
      .map((issue) => {
        const options = planner.generateOptions(issue)
        const bestOption = planner.recommendBest(options)
        const strategy = planner.createMigrationStrategy(issue, bestOption)

        return {
          complexity: fileMetrics.complexity,
          issue: issue.title,
          option: bestOption?.name,
          strategy: strategy?.name,
        }
      })
      .filter((item) => item.option !== undefined && item.strategy !== undefined)

    // Each traced item should have complete chain
    tracedItems.forEach((item) => {
      expect(item.complexity).toBeDefined()
      expect(item.issue).toBeDefined()
      expect(item.option).toBeDefined()
      expect(item.strategy).toBeDefined()
    })
  })
})
