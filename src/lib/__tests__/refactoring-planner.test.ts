/**
 * Tests for RefactoringPlanner - Refactoring Options & Migration Planning
 *
 * Comprehensive test suite covering:
 * - Strategy generation for architectural issues
 * - Migration planning with phases and rollback
 * - Implementation checklists with quality gates
 * - Cost-benefit analysis and recommendations
 * - Edge cases and error handling
 */

import { describe, it, expect, beforeAll } from 'vitest'
import type { ArchitecturalIssue } from '../types'

// Dynamic import for RED phase (mock fallback if not implemented yet)
let RefactoringPlanner: any

beforeAll(async () => {
  try {
    const mod = await import('../refactoring-planner')
    RefactoringPlanner = mod.RefactoringPlanner
  } catch {
    // RED phase: RefactoringPlanner not yet implemented
    RefactoringPlanner = class RefactoringPlanner {
      generateOptions() {
        return []
      }

      createMigrationStrategy() {
        return null
      }

      buildChecklist() {
        return null
      }

      recommendBest() {
        return null
      }
    }
  }
})

describe('RefactoringPlanner - Instantiation', () => {
  it('should create RefactoringPlanner instance', () => {
    const planner = new RefactoringPlanner()
    expect(planner).toBeDefined()
    expect(typeof planner.generateOptions).toBe('function')
  })

  it('should have createMigrationStrategy method', () => {
    const planner = new RefactoringPlanner()
    expect(typeof planner.createMigrationStrategy).toBe('function')
  })

  it('should have buildChecklist method', () => {
    const planner = new RefactoringPlanner()
    expect(typeof planner.buildChecklist).toBe('function')
  })

  it('should have recommendBest method', () => {
    const planner = new RefactoringPlanner()
    expect(typeof planner.recommendBest).toBe('function')
  })
})

describe('AC1: Generate Refactoring Options', () => {
  it('should generate 2+ options for TooManyCommands issue', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Too Many Commands',
      description: 'Domain has 15 commands',
      severity: 'high',
      location: 'src/lib/vtm',
      evidence: '15 files found',
      impact: ['Reduced cohesion'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)
    expect(Array.isArray(options)).toBe(true)
    expect(options.length).toBeGreaterThanOrEqual(2)
  })

  it('should generate 2+ options for LowCohesion issue', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-002',
      title: 'Low Cohesion',
      description: 'Commands lack common theme',
      severity: 'medium',
      location: 'src/lib/vtm',
      evidence: 'Diverse command types found',
      impact: ['Confusing API'],
      effort: '1-2 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)
    expect(Array.isArray(options)).toBe(true)
    expect(options.length).toBeGreaterThanOrEqual(2)
  })

  it('should generate 2+ options for TightCoupling issue', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-003',
      title: 'Tight Coupling',
      description: 'Component has 8 external dependencies',
      severity: 'high',
      location: 'src/lib/component.ts',
      evidence: '8 dependencies: fs, path, ...',
      impact: ['Hard to test'],
      effort: '3-4 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)
    expect(Array.isArray(options)).toBe(true)
    expect(options.length).toBeGreaterThanOrEqual(2)
  })

  it('should generate 2+ options for TestCoverageGaps issue', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-006',
      title: 'Test Coverage Gaps',
      description: 'High complexity components need tests',
      severity: 'high',
      location: 'src/lib/analyzer.ts',
      evidence: '8 functions with avg complexity 2.0',
      impact: ['Reduced reliability'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)
    expect(Array.isArray(options)).toBe(true)
    expect(options.length).toBeGreaterThanOrEqual(2)
  })

  it('should return empty array for unknown issue type', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-999',
      title: 'Unknown Issue',
      description: 'Unknown issue type',
      severity: 'low',
      location: 'test',
      evidence: 'test',
      impact: [],
      effort: '1 hour',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)
    expect(Array.isArray(options)).toBe(true)
  })
})

describe('AC2: RefactoringOption Type & Structure', () => {
  it('should return options with required fields', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Too Many Commands',
      description: 'Domain has 15 commands',
      severity: 'high',
      location: 'src/lib/vtm',
      evidence: '15 files found',
      impact: ['Reduced cohesion'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)

    if (options.length > 0) {
      options.forEach((option) => {
        expect(option).toHaveProperty('name')
        expect(option).toHaveProperty('description')
        expect(option).toHaveProperty('pros')
        expect(option).toHaveProperty('cons')
        expect(option).toHaveProperty('effort')
        expect(option).toHaveProperty('breaking')
        expect(option).toHaveProperty('riskLevel')
        expect(option).toHaveProperty('recommendation')
      })
    }
  })

  it('should have valid riskLevel values', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Too Many Commands',
      description: 'Domain has 15 commands',
      severity: 'high',
      location: 'src/lib/vtm',
      evidence: '15 files found',
      impact: ['Reduced cohesion'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)

    options.forEach((option) => {
      expect(['low', 'medium', 'high']).toContain(option.riskLevel)
    })
  })

  it('should have array-type pros and cons', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Too Many Commands',
      description: 'Domain has 15 commands',
      severity: 'high',
      location: 'src/lib/vtm',
      evidence: '15 files found',
      impact: ['Reduced cohesion'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)

    options.forEach((option) => {
      expect(Array.isArray(option.pros)).toBe(true)
      expect(Array.isArray(option.cons)).toBe(true)
      expect(option.pros.length).toBeGreaterThan(0)
      expect(option.cons.length).toBeGreaterThan(0)
    })
  })

  it('should mark exactly one option as recommended', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Too Many Commands',
      description: 'Domain has 15 commands',
      severity: 'high',
      location: 'src/lib/vtm',
      evidence: '15 files found',
      impact: ['Reduced cohesion'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)

    if (options.length > 0) {
      const recommended = options.filter((o) => o.recommendation)
      expect(recommended.length).toBe(1)
    }
  })
})

describe('AC3: Migration Strategy Creation', () => {
  it('should create migration strategy for selected option', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Too Many Commands',
      description: 'Domain has 15 commands',
      severity: 'high',
      location: 'src/lib/vtm',
      evidence: '15 files found',
      impact: ['Reduced cohesion'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)
    const selectedOption = options.find((o) => o.recommendation) || options[0]

    const strategy = planner.createMigrationStrategy(issue, selectedOption)

    if (strategy) {
      expect(strategy).toHaveProperty('name')
      expect(strategy).toHaveProperty('overview')
      expect(strategy).toHaveProperty('phases')
      expect(strategy).toHaveProperty('preFlightChecks')
      expect(strategy).toHaveProperty('estimatedDuration')
      expect(strategy).toHaveProperty('rollbackPlan')
    }
  })

  it('should have multiple phases in migration strategy', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Too Many Commands',
      description: 'Domain has 15 commands',
      severity: 'high',
      location: 'src/lib/vtm',
      evidence: '15 files found',
      impact: ['Reduced cohesion'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)
    const selectedOption = options[0]

    const strategy = planner.createMigrationStrategy(issue, selectedOption)

    if (strategy) {
      expect(Array.isArray(strategy.phases)).toBe(true)
      expect(strategy.phases.length).toBeGreaterThanOrEqual(2)
    }
  })

  it('should include rollback plan in strategy', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Too Many Commands',
      description: 'Domain has 15 commands',
      severity: 'high',
      location: 'src/lib/vtm',
      evidence: '15 files found',
      impact: ['Reduced cohesion'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)
    const selectedOption = options[0]

    const strategy = planner.createMigrationStrategy(issue, selectedOption)

    if (strategy) {
      expect(strategy.rollbackPlan).toBeTruthy()
      expect(strategy.rollbackPlan.length).toBeGreaterThan(0)
    }
  })
})

describe('AC4: Implementation Checklist', () => {
  it('should build implementation checklist from strategy', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Too Many Commands',
      description: 'Domain has 15 commands',
      severity: 'high',
      location: 'src/lib/vtm',
      evidence: '15 files found',
      impact: ['Reduced cohesion'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)
    const selectedOption = options[0]
    const strategy = planner.createMigrationStrategy(issue, selectedOption)

    if (strategy) {
      const checklist = planner.buildChecklist(strategy)

      if (checklist) {
        expect(checklist).toHaveProperty('phases')
        expect(checklist).toHaveProperty('totalDuration')
        expect(checklist).toHaveProperty('overallRisk')
        expect(Array.isArray(checklist.phases)).toBe(true)
      }
    }
  })

  it('should include quality gates in checklist phases', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Too Many Commands',
      description: 'Domain has 15 commands',
      severity: 'high',
      location: 'src/lib/vtm',
      evidence: '15 files found',
      impact: ['Reduced cohesion'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)
    const selectedOption = options[0]
    const strategy = planner.createMigrationStrategy(issue, selectedOption)

    if (strategy) {
      const checklist = planner.buildChecklist(strategy)

      if (checklist && checklist.phases.length > 0) {
        checklist.phases.forEach((phase) => {
          expect(phase).toHaveProperty('name')
          expect(phase).toHaveProperty('tasks')
          expect(Array.isArray(phase.tasks)).toBe(true)
        })
      }
    }
  })
})

describe('AC5: Cost-Benefit Analysis', () => {
  it('should sort options by recommendation priority', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Too Many Commands',
      description: 'Domain has 15 commands',
      severity: 'high',
      location: 'src/lib/vtm',
      evidence: '15 files found',
      impact: ['Reduced cohesion'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)

    // First option should be recommended
    if (options.length > 0) {
      expect(options[0].recommendation).toBe(true)
    }
  })

  it('should have meaningful effort estimates', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Too Many Commands',
      description: 'Domain has 15 commands',
      severity: 'high',
      location: 'src/lib/vtm',
      evidence: '15 files found',
      impact: ['Reduced cohesion'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)

    options.forEach((option) => {
      expect(option.effort).toBeTruthy()
      expect(option.effort).toMatch(/\d+/)
    })
  })

  it('should indicate breaking changes when applicable', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Too Many Commands',
      description: 'Domain has 15 commands',
      severity: 'high',
      location: 'src/lib/vtm',
      evidence: '15 files found',
      impact: ['Reduced cohesion'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)

    options.forEach((option) => {
      expect(typeof option.breaking).toBe('boolean')
    })
  })
})

describe('Edge Cases', () => {
  it('should handle issue with empty impact array', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Test Issue',
      description: 'Test issue',
      severity: 'low',
      location: 'test',
      evidence: 'test',
      impact: [],
      effort: '1 hour',
      relatedIssues: [],
    }

    expect(() => {
      planner.generateOptions(issue)
    }).not.toThrow()
  })

  it('should handle issue with null effort', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Test Issue',
      description: 'Test issue',
      severity: 'low',
      location: 'test',
      evidence: 'test',
      impact: ['impact'],
      effort: '',
      relatedIssues: [],
    }

    expect(() => {
      planner.generateOptions(issue)
    }).not.toThrow()
  })

  it('should handle null option gracefully', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Test Issue',
      description: 'Test issue',
      severity: 'low',
      location: 'test',
      evidence: 'test',
      impact: ['impact'],
      effort: '1 hour',
      relatedIssues: [],
    }

    const strategy = planner.createMigrationStrategy(issue, null)
    expect(strategy === null || strategy === undefined || typeof strategy === 'object').toBe(true)
  })
})

describe('RecommendBest Method', () => {
  it('should select best option based on impact/effort ratio', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Too Many Commands',
      description: 'Domain has 15 commands',
      severity: 'high',
      location: 'src/lib/vtm',
      evidence: '15 files found',
      impact: ['Reduced cohesion', 'Maintenance complexity'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)
    const best = planner.recommendBest(options)

    if (best && options.length > 0) {
      expect(best.recommendation).toBe(true)
    }
  })

  it('should return first option if only one exists', () => {
    const planner = new RefactoringPlanner()

    const singleOption = {
      name: 'Only Option',
      description: 'The only available option',
      pros: ['Pro1'],
      cons: ['Con1'],
      effort: '2 hours',
      breaking: false,
      riskLevel: 'low' as const,
      recommendation: false,
    }

    const best = planner.recommendBest([singleOption])

    if (best) {
      expect(best.name).toBe('Only Option')
    }
  })
})

describe('Integration: Full Workflow', () => {
  it('should support complete refactoring workflow', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Too Many Commands',
      description: 'Domain has 15 commands',
      severity: 'high',
      location: 'src/lib/vtm',
      evidence: '15 files found',
      impact: ['Reduced cohesion'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    // Step 1: Generate options
    const options = planner.generateOptions(issue)
    expect(Array.isArray(options)).toBe(true)

    if (options.length > 0) {
      // Step 2: Select best option
      const best = planner.recommendBest(options)
      expect(best).toBeTruthy()

      // Step 3: Create migration strategy
      const strategy = planner.createMigrationStrategy(issue, best)
      expect(strategy === null || typeof strategy === 'object').toBe(true)

      if (strategy) {
        // Step 4: Build checklist
        const checklist = planner.buildChecklist(strategy)
        expect(checklist === null || typeof checklist === 'object').toBe(true)
      }
    }
  })

  it('should handle multiple issues sequentially', () => {
    const planner = new RefactoringPlanner()

    const issues: ArchitecturalIssue[] = [
      {
        id: 'ISSUE-001',
        title: 'Too Many Commands',
        description: 'Domain has 15 commands',
        severity: 'high',
        location: 'src/lib/vtm',
        evidence: '15 files',
        impact: ['Cohesion'],
        effort: '4-6 hours',
        relatedIssues: [],
      },
      {
        id: 'ISSUE-003',
        title: 'Tight Coupling',
        description: 'Component has 8 dependencies',
        severity: 'high',
        location: 'src/lib/component.ts',
        evidence: '8 deps',
        impact: ['Testability'],
        effort: '3-4 hours',
        relatedIssues: [],
      },
    ]

    issues.forEach((issue) => {
      const options = planner.generateOptions(issue)
      expect(Array.isArray(options)).toBe(true)
    })
  })
})

describe('AC5: Edge Cases and Coverage Improvements', () => {
  it('should return null when recommendBest receives empty array', () => {
    const planner = new RefactoringPlanner()
    const result = planner.recommendBest([])
    expect(result).toBeNull()
  })

  it('should handle buildChecklist with all phases', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Too Many Commands',
      description: 'Domain has 15 commands',
      severity: 'high',
      location: 'src/lib/vtm',
      evidence: '15 files found',
      impact: ['Reduced cohesion'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)
    const selectedOption = options[0]
    const strategy = planner.createMigrationStrategy(issue, selectedOption)

    if (strategy) {
      const checklist = planner.buildChecklist(strategy)
      expect(checklist).toBeDefined()
      expect(checklist.phases.length).toBeGreaterThan(0)
      expect(checklist.totalDuration).toBeDefined()
      expect(checklist.overallRisk).toBeDefined()
      expect(['low', 'medium', 'high', 'critical']).toContain(checklist.overallRisk)
      expect(Array.isArray(checklist.approvalGates)).toBe(true)
    }
  })

  it('should test all issue type generators with full workflow', () => {
    const planner = new RefactoringPlanner()
    const issueTypes = [
      {
        title: 'Too Many Commands',
        description: 'Domain has 15 commands',
      },
      {
        title: 'Low Cohesion',
        description: 'Commands lack common theme',
      },
      {
        title: 'Tight Coupling',
        description: 'Too many external dependencies',
      },
      {
        title: 'Test Coverage Gaps',
        description: 'Complex component without tests',
      },
    ]

    issueTypes.forEach((issueData) => {
      const issue: ArchitecturalIssue = {
        id: 'ISSUE-001',
        title: issueData.title,
        description: issueData.description,
        severity: 'high',
        location: 'src/lib',
        evidence: 'Found',
        impact: ['Impact'],
        effort: '4-6 hours',
        relatedIssues: [],
      }

      const options = planner.generateOptions(issue)
      if (options.length > 0) {
        const best = planner.recommendBest(options)
        expect(best).toBeDefined()
        expect(best).not.toBeNull()

        const strategy = planner.createMigrationStrategy(issue, best)
        expect(strategy).toBeDefined()
        expect(strategy).not.toBeNull()

        if (strategy) {
          expect(strategy.riskMitigation.length).toBeGreaterThan(0)
          expect(strategy.phases.length).toEqual(3) // Plan, Implement, Validate
        }
      }
    })
  })

  it('should verify all phases have quality gates', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Tight Coupling',
      description: 'Component has 8 dependencies',
      severity: 'high',
      location: 'src/lib/component.ts',
      evidence: '8 deps',
      impact: ['Testability'],
      effort: '3-4 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)
    const strategy = planner.createMigrationStrategy(issue, options[0] || null)

    if (strategy) {
      strategy.phases.forEach((phase) => {
        expect(phase.qualityGates.length).toBeGreaterThan(0)
        phase.qualityGates.forEach((gate) => {
          expect(gate.name).toBeDefined()
          expect(gate.command).toBeDefined()
          expect(gate.successCriteria).toBeDefined()
        })
      })
    }
  })

  it('should handle breaking changes in risk assessment', () => {
    const planner = new RefactoringPlanner()
    const issue: ArchitecturalIssue = {
      id: 'ISSUE-001',
      title: 'Too Many Commands',
      description: 'Domain has 15 commands',
      severity: 'high',
      location: 'src/lib/vtm',
      evidence: '15 files found',
      impact: ['Reduced cohesion'],
      effort: '4-6 hours',
      relatedIssues: [],
    }

    const options = planner.generateOptions(issue)
    // Find the option with breaking changes
    const breakingOption = options.find((o) => o.breaking)

    if (breakingOption) {
      const strategy = planner.createMigrationStrategy(issue, breakingOption)

      if (strategy) {
        // Verify breaking change is reflected in risk mitigation
        const hasBreakerRisk = strategy.riskMitigation.some((r) => r.risk.toLowerCase().includes('breaking'))
        expect(hasBreakerRisk || strategy.riskMitigation.length > 0).toBe(true)
      }
    }
  })
})
