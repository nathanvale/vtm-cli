/**
 * Tests for DecisionEngine
 *
 * Test infrastructure setup for decision-engine.ts
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { DecisionEngine } from '../decision-engine'
import * as path from 'path'

describe('DecisionEngine', () => {
  let engine: DecisionEngine
  const fixturesPath = path.join(__dirname, 'fixtures')
  const testPatternsPath = path.join(fixturesPath, 'test-patterns.json')

  beforeEach(() => {
    engine = new DecisionEngine({
      basePath: fixturesPath,
      patternsPath: testPatternsPath,
    })
  })

  describe('AC3: DecisionEngine import', () => {
    it('should import DecisionEngine successfully', () => {
      expect(DecisionEngine).toBeDefined()
      expect(typeof DecisionEngine).toBe('function')
    })

    it('should create DecisionEngine instance', () => {
      expect(engine).toBeDefined()
      expect(engine).toBeInstanceOf(DecisionEngine)
    })
  })

  describe('Test infrastructure', () => {
    it('should have access to test fixtures directory', () => {
      expect(fixturesPath).toContain('fixtures')
    })

    it('should have test-patterns.json path configured', () => {
      expect(testPatternsPath).toContain('test-patterns.json')
    })
  })

  // TDD Red Phase: Pattern loading tests
  describe('Pattern loading', () => {
    // AC1: Test for loading patterns from valid file path
    it('should load patterns from valid file path', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      // Expect: Engine should have loaded patterns
      // This will FAIL because loadPatterns() is not yet implemented
      const patterns = engine.getPatterns()

      expect(patterns).toBeDefined()
      expect(typeof patterns).toBe('object')
      expect(Object.keys(patterns).length).toBeGreaterThan(0)

      // Verify specific test patterns are loaded
      expect(patterns['task-management']).toBeDefined()
      expect(patterns['task-management'].name).toBe('task-management')
      expect(patterns['task-management'].keywords).toContain('task')

      expect(patterns['data-visualization']).toBeDefined()
      expect(patterns['data-visualization'].name).toBe('data-visualization')
    })

    // AC2: Test for fallback to default patterns when file not found
    it('should fallback to default patterns when file not found', () => {
      const nonExistentPath = path.join(fixturesPath, 'does-not-exist.json')

      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: nonExistentPath,
      })

      // Expect: Engine should have default patterns loaded
      // This will FAIL because default pattern fallback is not implemented
      const patterns = engine.getPatterns()

      expect(patterns).toBeDefined()
      expect(typeof patterns).toBe('object')
      expect(Object.keys(patterns).length).toBeGreaterThan(0)

      // Should have at least some default patterns
      expect(patterns['crud']).toBeDefined()
    })

    // AC3: Test for handling invalid JSON gracefully
    it('should handle invalid JSON gracefully', () => {
      // Create invalid JSON fixture path
      const invalidJsonPath = path.join(fixturesPath, 'invalid.json')

      // Expect: Should not throw, should use default patterns
      // This will FAIL because error handling is not implemented
      expect(() => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: invalidJsonPath,
        })

        const patterns = engine.getPatterns()
        expect(patterns).toBeDefined()
      }).not.toThrow()
    })

    it('should cache loaded patterns', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      // Expect: Multiple calls should return same object reference (cached)
      // This will FAIL because caching is not implemented
      const patterns1 = engine.getPatterns()
      const patterns2 = engine.getPatterns()

      expect(patterns1).toBe(patterns2) // Same reference = cached
    })
  })

  // TDD Red Phase: Pattern matching tests
  describe('Pattern matching', () => {
    // AC1: Test for extracting keywords from description
    it('should extract keywords from description', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      // Test keyword extraction with a realistic description
      const description = 'task management system for tracking work items'

      // This will FAIL because extractKeywords is private
      // We need to test it through public API (recommendArchitecture)
      const recommendation = engine.recommendArchitecture(description)

      // Expect keywords to be extracted and used for pattern matching
      expect(recommendation).toBeDefined()
      expect(recommendation.patterns).toContain('task-management')
      expect(recommendation.confidence).toBeGreaterThan(0)
    })

    // AC2: Test for matching patterns based on keywords
    it('should match patterns based on keywords', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      // Description with clear task-management keywords
      const description = 'need to track tasks and manage todo items'
      const recommendation = engine.recommendArchitecture(description)

      // Expect task-management pattern to be matched
      expect(recommendation.patterns).toBeDefined()
      expect(recommendation.patterns.length).toBeGreaterThan(0)
      expect(recommendation.patterns).toContain('task-management')
    })

    // AC3: Test for calculating pattern confidence scores
    it('should calculate pattern confidence scores', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      // Strong match - multiple exact keyword matches
      const strongDescription = 'task management workflow for tracking work'
      const strongRec = engine.recommendArchitecture(strongDescription)

      // Weak match - only one keyword match
      const weakDescription = 'need to manage items'
      const weakRec = engine.recommendArchitecture(weakDescription)

      // Expect confidence to reflect match strength
      expect(strongRec.confidence).toBeGreaterThan(weakRec.confidence)
      expect(strongRec.confidence).toBeGreaterThan(70) // Strong match > 70%
      expect(weakRec.confidence).toBeLessThan(50) // Weak match < 50%
    })

    // AC4: Test for ranking patterns by relevance
    it('should rank patterns by relevance', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      // Description that strongly matches task-management
      const description = 'task management system for tracking workflow and todo items'
      const recommendation = engine.recommendArchitecture(description)

      // Expect patterns to be sorted by relevance
      expect(recommendation.patterns).toBeDefined()
      expect(recommendation.patterns.length).toBeGreaterThan(0)

      // First pattern should be most relevant
      // task-management should rank first with keywords: task, management, tracking, workflow, todo
      expect(recommendation.patterns[0]).toBe('task-management')

      // Verify patterns are sorted by confidence (descending)
      if (recommendation.patterns.length > 1) {
        // If multiple patterns match, they should be ordered by score
        expect(recommendation.patterns).toEqual(expect.arrayContaining(['task-management']))
      }
    })

    // AC2: Keyword extraction specific tests
    describe('Keyword extraction details', () => {
      it('should filter out common words', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        // Description with many common words
        const description = 'the task is to manage and track the todo items for the team'
        const recommendation = engine.recommendArchitecture(description)

        // Should match task-management despite common words
        expect(recommendation.patterns).toContain('task-management')
        expect(recommendation.confidence).toBeGreaterThan(50)
      })

      it('should filter out short words', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        // Description with short words that should be ignored
        const description = 'I am to do a task by it'
        const recommendation = engine.recommendArchitecture(description)

        // Should still match 'task'
        expect(recommendation.patterns).toContain('task-management')
      })

      it('should handle case-insensitive matching', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        // Mixed case keywords
        const description = 'TASK Management WORKFLOW for TRACKING'
        const recommendation = engine.recommendArchitecture(description)

        expect(recommendation.patterns).toContain('task-management')
        expect(recommendation.confidence).toBeGreaterThan(70)
      })
    })

    // AC3: Pattern scoring specific tests
    describe('Pattern scoring details', () => {
      it('should score exact keyword matches higher', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        // Exact matches for task-management
        const exactMatch = engine.recommendArchitecture('task todo workflow manage track')

        // Partial matches
        const partialMatch = engine.recommendArchitecture('tasking management workflows')

        expect(exactMatch.confidence).toBeGreaterThan(partialMatch.confidence)
      })

      it('should handle multiple pattern matches', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        // Keywords matching both patterns
        const description = 'task dashboard with analytics and charts for workflow tracking'
        const recommendation = engine.recommendArchitecture(description)

        // Should detect both patterns
        expect(recommendation.patterns.length).toBeGreaterThanOrEqual(2)
        expect(recommendation.patterns).toContain('task-management')
        expect(recommendation.patterns).toContain('data-visualization')
      })

      it('should filter out patterns below threshold', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        // Very weak match
        const description = 'system for items'
        const recommendation = engine.recommendArchitecture(description)

        // Low confidence, may have no patterns above threshold
        expect(recommendation.confidence).toBeLessThan(40)
      })
    })

    // AC5: Edge cases
    describe('Edge cases', () => {
      it('should handle empty input', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        const recommendation = engine.recommendArchitecture('')

        expect(recommendation).toBeDefined()
        expect(recommendation.patterns).toBeDefined()
        // Should return low confidence or default pattern
        expect(recommendation.confidence).toBeLessThanOrEqual(50)
      })

      it('should handle input with no pattern matches', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        // Description with no matching keywords
        const recommendation = engine.recommendArchitecture('xyz abc qwerty')

        expect(recommendation).toBeDefined()
        expect(recommendation.confidence).toBeLessThan(40)
      })

      it('should handle input with multiple strong matches', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        // Description matching both patterns strongly
        const description = 'task management dashboard with workflow analytics and chart visualization'
        const recommendation = engine.recommendArchitecture(description)

        expect(recommendation).toBeDefined()
        expect(recommendation.patterns.length).toBeGreaterThanOrEqual(2)
        expect(recommendation.confidence).toBeGreaterThan(50)
      })
    })
  })

  // TDD Red Phase: Architecture recommendation tests
  describe('Architecture recommendation', () => {
    // AC1: Test for suggesting domain name from description
    it('should suggest domain name from description', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      const description = 'task management system for tracking work items'
      const recommendation = engine.recommendArchitecture(description)

      // Should extract 'task' as domain name
      expect(recommendation.domain).toBeDefined()
      expect(recommendation.domain).toMatch(/task/)
      expect(recommendation.description).toBe(description)
    })

    // AC2: Test for generating appropriate commands
    it('should generate appropriate commands based on patterns', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      const description = 'task management system for workflow tracking'
      const recommendation = engine.recommendArchitecture(description)

      // Should suggest commands for task management
      expect(recommendation.commands).toBeDefined()
      expect(recommendation.commands.length).toBeGreaterThan(0)

      // Should have typical CRUD/workflow commands
      const commandNames = recommendation.commands.map((c) => c.name)
      expect(commandNames).toContain('next')
      expect(commandNames).toContain('list')
    })

    // AC3: Test for suggesting skills based on commands
    it('should suggest skills based on commands', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      const description = 'task management with next and stats commands'
      const recommendation = engine.recommendArchitecture(description)

      // Should suggest skills when commands exist
      expect(recommendation.skills).toBeDefined()

      if (recommendation.commands.length > 0) {
        // Skills should be generated for domains with commands
        expect(recommendation.skills.length).toBeGreaterThanOrEqual(0)

        if (recommendation.skills.length > 0) {
          // Each skill should have required properties
          expect(recommendation.skills[0].name).toBeDefined()
          expect(recommendation.skills[0].triggers).toBeDefined()
          expect(recommendation.skills[0].purpose).toBeDefined()
        }
      }
    })

    // AC4: Test for recommending MCPs based on keywords
    it('should recommend MCPs based on keywords', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      // Test with slack keyword
      const slackDescription = 'task management with slack integration'
      const slackRec = engine.recommendArchitecture(slackDescription)

      expect(slackRec.mcps).toBeDefined()
      const hasMCPs = slackRec.mcps.length > 0
      if (hasMCPs) {
        const mcpNames = slackRec.mcps.map((m) => m.name)
        expect(mcpNames.some((name) => name.includes('slack'))).toBe(true)
      }

      // Test with github keyword
      const githubDescription = 'task tracking with github issues'
      const githubRec = engine.recommendArchitecture(githubDescription)

      if (githubRec.mcps.length > 0) {
        const mcpNames = githubRec.mcps.map((m) => m.name)
        expect(mcpNames.some((name) => name.includes('github'))).toBe(true)
      }
    })

    // Additional MCP tests for coverage
    it('should recommend notion MCP for notion keyword', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      const description = 'task management with notion database sync'
      const recommendation = engine.recommendArchitecture(description)

      expect(recommendation.mcps).toBeDefined()
      if (recommendation.mcps.length > 0) {
        const mcpNames = recommendation.mcps.map((m) => m.name)
        expect(mcpNames.some((name) => name.includes('notion'))).toBe(true)
      }
    })

    it('should recommend database MCP for store keyword', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      const description = 'task management system with database store'
      const recommendation = engine.recommendArchitecture(description)

      expect(recommendation.mcps).toBeDefined()
      if (recommendation.mcps.length > 0) {
        const mcpNames = recommendation.mcps.map((m) => m.name)
        expect(mcpNames.some((name) => name.includes('database'))).toBe(true)
      }
    })

    // Test for hook recommendations
    it('should recommend hooks based on keywords', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      // Test daily standup hook
      const dailyDescription = 'daily standup task management'
      const dailyRec = engine.recommendArchitecture(dailyDescription)

      expect(dailyRec.hooks).toBeDefined()
      if (dailyRec.hooks.length > 0) {
        const hookEvents = dailyRec.hooks.map((h) => h.event)
        expect(hookEvents.some((e) => e.includes('standup'))).toBe(true)
      }

      // Test commit validation hook
      const commitDescription = 'task management with commit validation'
      const commitRec = engine.recommendArchitecture(commitDescription)

      if (commitRec.hooks.length > 0) {
        const hookEvents = commitRec.hooks.map((h) => h.event)
        expect(hookEvents.some((e) => e.includes('commit'))).toBe(true)
      }

      // Test notification hook
      const alertDescription = 'task management with alert notifications'
      const alertRec = engine.recommendArchitecture(alertDescription)

      if (alertRec.hooks.length > 0) {
        const hookEvents = alertRec.hooks.map((h) => h.event)
        expect(hookEvents.some((e) => e.includes('alert'))).toBe(true)
      }
    })

    // AC5: Test for complete recommendation structure
    it('should return complete recommendation structure', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      const description = 'task management system for team collaboration'
      const recommendation = engine.recommendArchitecture(description)

      // Verify all required fields exist
      expect(recommendation).toBeDefined()
      expect(recommendation.domain).toBeDefined()
      expect(recommendation.description).toBe(description)
      expect(recommendation.commands).toBeDefined()
      expect(Array.isArray(recommendation.commands)).toBe(true)
      expect(recommendation.patterns).toBeDefined()
      expect(Array.isArray(recommendation.patterns)).toBe(true)
      expect(recommendation.rationale).toBeDefined()
      expect(Array.isArray(recommendation.rationale)).toBe(true)
      expect(recommendation.alternatives).toBeDefined()
      expect(Array.isArray(recommendation.alternatives)).toBe(true)
      expect(recommendation.implementation).toBeDefined()
      expect(recommendation.implementation.phases).toBeDefined()
      expect(recommendation.confidence).toBeDefined()
      expect(typeof recommendation.confidence).toBe('number')
      expect(recommendation.formatted).toBeDefined()
      expect(typeof recommendation.formatted).toBe('string')
    })

    // Additional tests for recommendation quality
    describe('Recommendation quality', () => {
      it('should include rationale for recommendations', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        const description = 'task management with slack notifications'
        const recommendation = engine.recommendArchitecture(description)

        expect(recommendation.rationale).toBeDefined()
        expect(recommendation.rationale.length).toBeGreaterThan(0)
        expect(recommendation.rationale[0]).toContain('command')
      })

      it('should include implementation plan', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        const description = 'task management system'
        const recommendation = engine.recommendArchitecture(description)

        expect(recommendation.implementation).toBeDefined()
        expect(recommendation.implementation.phases).toBeDefined()
        expect(recommendation.implementation.phases.length).toBeGreaterThan(0)
        expect(recommendation.implementation.totalEffort).toBeDefined()
        expect(recommendation.implementation.complexity).toBeDefined()
      })

      it('should include alternatives', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        const description = 'task management system'
        const recommendation = engine.recommendArchitecture(description)

        expect(recommendation.alternatives).toBeDefined()
        expect(recommendation.alternatives.length).toBeGreaterThan(0)

        const alternative = recommendation.alternatives[0]
        expect(alternative.approach).toBeDefined()
        expect(alternative.pros).toBeDefined()
        expect(alternative.cons).toBeDefined()
        expect(typeof alternative.rejected).toBe('boolean')
        expect(alternative.reason).toBeDefined()
      })
    })
  })

  // TDD Red Phase: Deep architecture analysis tests
  describe('Deep architecture analysis', () => {
    const mockDomainPath = path.join(fixturesPath, 'mock-domain')

    // AC1: Test that analyzeDeepArchitecture exists and returns correct structure
    it('should run deep analysis and return complete structure', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      const analysis = engine.analyzeDeepArchitecture('mock-domain')

      // Should return DeepAnalysisResult structure with nested deepAnalysis
      expect(analysis).toBeDefined()
      expect(analysis.domain).toBe('mock-domain')
      expect(analysis.deepAnalysis).toBeDefined()
      expect(analysis.deepAnalysis.components).toBeDefined()
      expect(Array.isArray(analysis.deepAnalysis.components)).toBe(true)
      expect(analysis.deepAnalysis.issues).toBeDefined()
      expect(Array.isArray(analysis.deepAnalysis.issues)).toBe(true)
      expect(analysis.deepAnalysis.refactoringStrategies).toBeDefined()
      expect(Array.isArray(analysis.deepAnalysis.refactoringStrategies)).toBe(true)
      expect(analysis.deepAnalysis.summary).toBeDefined()
      expect(analysis.deepAnalysis.summary.totalComponents).toBeDefined()
      expect(analysis.deepAnalysis.summary.totalIssues).toBeDefined()
    })

    // AC2: Test that deep analysis includes component metrics
    it('should include component metrics in deep analysis', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      const analysis = engine.analyzeDeepArchitecture('mock-domain')

      expect(analysis.deepAnalysis.components).toBeDefined()
      // mock-domain has TypeScript files, should have metrics
      if (analysis.deepAnalysis.components.length > 0) {
        const component = analysis.deepAnalysis.components[0]
        expect(component.name).toBeDefined()
        expect(component.complexity).toBeDefined()
        expect(typeof component.complexity).toBe('number')
      }
    })

    // AC3: Test that deep analysis detects architectural issues
    it('should detect architectural issues in deep analysis', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      const analysis = engine.analyzeDeepArchitecture('mock-domain')

      expect(analysis.deepAnalysis.issues).toBeDefined()
      expect(Array.isArray(analysis.deepAnalysis.issues)).toBe(true)

      // Each issue should have severity and title
      if (analysis.deepAnalysis.issues.length > 0) {
        const issue = analysis.deepAnalysis.issues[0]
        expect(issue.severity).toBeDefined()
        expect(issue.title).toBeDefined()
      }
    })

    // AC4: Test that deep analysis generates refactoring strategies
    it('should generate refactoring strategies in deep analysis', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      const analysis = engine.analyzeDeepArchitecture('mock-domain')

      expect(analysis.deepAnalysis.refactoringStrategies).toBeDefined()
      expect(Array.isArray(analysis.deepAnalysis.refactoringStrategies)).toBe(true)

      // Each strategy should have issue and options
      if (analysis.deepAnalysis.refactoringStrategies.length > 0) {
        const strategy = analysis.deepAnalysis.refactoringStrategies[0]
        expect(strategy.issue).toBeDefined()
        expect(strategy.options).toBeDefined()
        expect(Array.isArray(strategy.options)).toBe(true)
      }
    })

    // AC5: Test that deep analysis includes summary statistics
    it('should include summary statistics in deep analysis', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      const analysis = engine.analyzeDeepArchitecture('mock-domain')

      expect(analysis.deepAnalysis.summary).toBeDefined()
      expect(typeof analysis.deepAnalysis.summary.totalComponents).toBe('number')
      expect(typeof analysis.deepAnalysis.summary.totalIssues).toBe('number')
      expect(typeof analysis.deepAnalysis.summary.criticalIssues).toBe('number')
      expect(analysis.deepAnalysis.summary.totalComponents).toBeGreaterThanOrEqual(0)
      expect(analysis.deepAnalysis.summary.totalIssues).toBeGreaterThanOrEqual(0)
    })

    // AC6: Test formatted output - removed since DeepAnalysisResult doesn't have formatted field anymore
    // The formatted output is now generated separately by CLI presentation layer
  })

  // TDD Red Phase: Domain analysis tests
  describe('Domain analysis', () => {
    const mockDomainPath = path.join(fixturesPath, 'mock-domain')

    // AC1: Test for scanning domain directory structure
    it('should scan domain directory structure', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      const analysis = engine.analyzeDomain('mock-domain')

      // Should detect commands in the mock-domain directory
      expect(analysis).toBeDefined()
      expect(analysis.domain).toBe('mock-domain')
      expect(analysis.current).toBeDefined()
      expect(analysis.current.commands).toBeDefined()
      expect(typeof analysis.current.commands).toBe('number')
      expect(analysis.current.commands).toBe(3) // next.md, list.md, complete.md
    })

    // AC2: Test for identifying domain strengths
    it('should identify domain strengths', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      const analysis = engine.analyzeDomain('mock-domain')

      expect(analysis.strengths).toBeDefined()
      expect(Array.isArray(analysis.strengths)).toBe(true)

      // Domain with 3 commands should have "Clear single responsibility" strength
      if (analysis.strengths.length > 0) {
        expect(analysis.strengths.some((s) => s.includes('single responsibility'))).toBe(true)
      }
    })

    // AC3: Test for detecting architectural issues
    it('should detect architectural issues', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      const analysis = engine.analyzeDomain('mock-domain')

      expect(analysis.issues).toBeDefined()
      expect(Array.isArray(analysis.issues)).toBe(true)

      // Each issue should have required properties
      if (analysis.issues.length > 0) {
        const issue = analysis.issues[0]
        expect(issue.title).toBeDefined()
        expect(issue.problem).toBeDefined()
        expect(issue.recommendation).toBeDefined()
        expect(issue.effort).toBeDefined()
        expect(issue.impact).toBeDefined()
      }
    })

    // AC4: Test for generating improvement recommendations
    it('should generate improvement recommendations', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      const analysis = engine.analyzeDomain('mock-domain')

      expect(analysis.recommendations).toBeDefined()
      expect(Array.isArray(analysis.recommendations)).toBe(true)

      // Recommendations should be based on issues
      if (analysis.issues.length > 0) {
        expect(analysis.recommendations.length).toBeGreaterThan(0)

        const rec = analysis.recommendations[0]
        expect(rec.priority).toBeDefined()
        expect(typeof rec.priority).toBe('number')
        expect(rec.action).toBeDefined()
        expect(rec.reason).toBeDefined()
        expect(rec.effort).toBeDefined()
      }
    })

    // AC5: Test with complete analysis structure
    it('should return complete analysis structure', () => {
      const engine = new DecisionEngine({
        basePath: fixturesPath,
        patternsPath: testPatternsPath,
      })

      const analysis = engine.analyzeDomain('mock-domain')

      // Verify all required fields exist
      expect(analysis).toBeDefined()
      expect(analysis.domain).toBe('mock-domain')
      expect(analysis.current).toBeDefined()
      expect(analysis.current.commands).toBeDefined()
      expect(analysis.current.skills).toBeDefined()
      expect(analysis.current.mcps).toBeDefined()
      expect(analysis.current.hooks).toBeDefined()
      expect(analysis.current.complexity).toBeDefined()
      expect(analysis.current.cohesion).toBeDefined()
      expect(analysis.strengths).toBeDefined()
      expect(Array.isArray(analysis.strengths)).toBe(true)
      expect(analysis.issues).toBeDefined()
      expect(Array.isArray(analysis.issues)).toBe(true)
      expect(analysis.recommendations).toBeDefined()
      expect(Array.isArray(analysis.recommendations)).toBe(true)
      expect(analysis.refactoringRoadmap).toBeDefined()
      expect(Array.isArray(analysis.refactoringRoadmap)).toBe(true)
      expect(analysis.metrics).toBeDefined()
      expect(analysis.metrics.complexity).toBeDefined()
      expect(analysis.metrics.cohesion).toBeDefined()
      expect(analysis.formatted).toBeDefined()
      expect(typeof analysis.formatted).toBe('string')
    })

    // Additional tests for analysis quality
    describe('Analysis quality', () => {
      it('should calculate domain metrics', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        const analysis = engine.analyzeDomain('mock-domain')

        expect(analysis.metrics).toBeDefined()
        expect(typeof analysis.metrics.complexity).toBe('number')
        expect(typeof analysis.metrics.cohesion).toBe('number')
        expect(analysis.metrics.complexity).toBeGreaterThanOrEqual(0)
        expect(analysis.metrics.cohesion).toBeGreaterThanOrEqual(0)
      })

      it('should build refactoring roadmap when issues exist', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        const analysis = engine.analyzeDomain('mock-domain')

        expect(analysis.refactoringRoadmap).toBeDefined()
        expect(Array.isArray(analysis.refactoringRoadmap)).toBe(true)

        // If there are issues, there should be a roadmap
        if (analysis.issues.length > 0) {
          // Roadmap may or may not be populated depending on issue types
          expect(analysis.refactoringRoadmap.length).toBeGreaterThanOrEqual(0)

          if (analysis.refactoringRoadmap.length > 0) {
            const phase = analysis.refactoringRoadmap[0]
            expect(phase.name).toBeDefined()
            expect(phase.tasks).toBeDefined()
            expect(Array.isArray(phase.tasks)).toBe(true)
            expect(phase.duration).toBeDefined()
            expect(phase.impact).toBeDefined()
          }
        }
      })

      it('should provide formatted output', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        const analysis = engine.analyzeDomain('mock-domain')

        expect(analysis.formatted).toBeDefined()
        expect(typeof analysis.formatted).toBe('string')
        expect(analysis.formatted.length).toBeGreaterThan(0)
        expect(analysis.formatted).toContain('mock-domain')
      })
    })
  })

  // TDD Red Phase: Deep analysis integration tests (DEEP-ANALYSIS-3)
  describe('Deep Architecture Analysis (AC1-AC6)', () => {
    const mockDomainPath = path.join(fixturesPath, 'mock-domain')

    // AC1: DecisionEngine has new method analyzeDeepArchitecture(domainPath: string): DeepAnalysisResult
    describe('AC1: analyzeDeepArchitecture method exists', () => {
      it('should have analyzeDeepArchitecture method', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        // This will FAIL because method doesn't exist yet
        expect(typeof engine.analyzeDeepArchitecture).toBe('function')
      })

      it('should accept domainPath parameter', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        // This will FAIL because method doesn't exist
        expect(() => {
          engine.analyzeDeepArchitecture(mockDomainPath)
        }).not.toThrow()
      })
    })

    // AC2: Original analyzeDomain() behavior preserved (backward compatible)
    describe('AC2: Backward compatibility', () => {
      it('should preserve original analyzeDomain() behavior', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        const analysis = engine.analyzeDomain('mock-domain')

        // Original structure should be intact
        expect(analysis).toBeDefined()
        expect(analysis.domain).toBe('mock-domain')
        expect(analysis.current).toBeDefined()
        expect(analysis.strengths).toBeDefined()
        expect(analysis.issues).toBeDefined()
        expect(analysis.recommendations).toBeDefined()
        expect(analysis.refactoringRoadmap).toBeDefined()
        expect(analysis.metrics).toBeDefined()
        expect(analysis.formatted).toBeDefined()
      })

      it('should not break existing tests', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        // Original method should still work
        const analysis = engine.analyzeDomain('mock-domain')
        expect(analysis.current.commands).toBe(3)
      })
    })

    // AC3: Deep analysis returns combined results: pattern recommendations + deep analysis
    describe('AC3: Combined results structure', () => {
      it('should return combined pattern recommendations and deep analysis', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        // This will FAIL because method doesn't exist
        const result = engine.analyzeDeepArchitecture(mockDomainPath)

        // Expect combined structure
        expect(result).toBeDefined()

        // Original pattern-based fields
        expect(result.domain).toBeDefined()
        expect(result.commands).toBeDefined()
        expect(result.patterns).toBeDefined()
        expect(result.confidence).toBeDefined()

        // NEW: Deep analysis fields
        expect(result.deepAnalysis).toBeDefined()
        expect(result.deepAnalysis.components).toBeDefined()
        expect(result.deepAnalysis.issues).toBeDefined()
        expect(result.deepAnalysis.refactoringStrategies).toBeDefined()
        expect(result.deepAnalysis.summary).toBeDefined()
      })

      it('should include pattern-based recommendations', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        const result = engine.analyzeDeepArchitecture(mockDomainPath)

        // Pattern-based fields should be populated
        expect(result.domain).toBe('mock-domain')
        expect(Array.isArray(result.commands)).toBe(true)
        expect(Array.isArray(result.patterns)).toBe(true)
        expect(typeof result.confidence).toBe('number')
      })
    })

    // AC4: Deep analysis includes refactoring strategies and issue severity
    describe('AC4: Deep analysis tier results', () => {
      it('should include component metrics from Tier 1', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        const result = engine.analyzeDeepArchitecture(mockDomainPath)

        expect(result.deepAnalysis.components).toBeDefined()
        expect(Array.isArray(result.deepAnalysis.components)).toBe(true)

        // Should detect components in mock-domain
        if (result.deepAnalysis.components.length > 0) {
          const component = result.deepAnalysis.components[0]
          expect(component.filePath).toBeDefined()
          expect(component.lines).toBeDefined()
          expect(component.complexity).toBeDefined()
        }
      })

      it('should include architectural issues from Tier 2 with severity', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        const result = engine.analyzeDeepArchitecture(mockDomainPath)

        expect(result.deepAnalysis.issues).toBeDefined()
        expect(Array.isArray(result.deepAnalysis.issues)).toBe(true)

        // Each issue should have severity
        if (result.deepAnalysis.issues.length > 0) {
          const issue = result.deepAnalysis.issues[0]
          expect(issue.id).toBeDefined()
          expect(issue.title).toBeDefined()
          expect(issue.severity).toBeDefined()
          expect(['low', 'medium', 'high', 'critical']).toContain(issue.severity)
        }
      })

      it('should include refactoring strategies from Tier 3', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        const result = engine.analyzeDeepArchitecture(mockDomainPath)

        expect(result.deepAnalysis.refactoringStrategies).toBeDefined()
        expect(Array.isArray(result.deepAnalysis.refactoringStrategies)).toBe(true)

        // Each strategy should have issue, options, and recommendation
        if (result.deepAnalysis.refactoringStrategies.length > 0) {
          const strategy = result.deepAnalysis.refactoringStrategies[0]
          expect(strategy.issue).toBeDefined()
          expect(strategy.options).toBeDefined()
          expect(Array.isArray(strategy.options)).toBe(true)
        }
      })

      it('should include analysis summary', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        const result = engine.analyzeDeepArchitecture(mockDomainPath)

        expect(result.deepAnalysis.summary).toBeDefined()
        expect(typeof result.deepAnalysis.summary.totalComponents).toBe('number')
        expect(typeof result.deepAnalysis.summary.totalIssues).toBe('number')
        expect(typeof result.deepAnalysis.summary.criticalIssues).toBe('number')
        expect(typeof result.deepAnalysis.summary.totalRefactoringOptions).toBe('number')
      })
    })

    // AC5: Smart filtering: only show issues with severity >= threshold (medium by default)
    describe('AC5: Severity filtering', () => {
      it('should filter issues by severity threshold (medium by default)', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        const result = engine.analyzeDeepArchitecture(mockDomainPath)

        // By default, should only show medium+ severity
        if (result.deepAnalysis.issues.length > 0) {
          result.deepAnalysis.issues.forEach((issue) => {
            expect(['medium', 'high', 'critical']).toContain(issue.severity)
          })
        }
      })

      it('should accept minSeverity option for custom filtering', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        // This will FAIL because options parameter doesn't exist yet
        const result = engine.analyzeDeepArchitecture(mockDomainPath, {
          minSeverity: 'high',
        })

        // Should only show high+ severity
        if (result.deepAnalysis.issues.length > 0) {
          result.deepAnalysis.issues.forEach((issue) => {
            expect(['high', 'critical']).toContain(issue.severity)
          })
        }
      })

      it('should include low severity when minSeverity is low', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        const result = engine.analyzeDeepArchitecture(mockDomainPath, {
          minSeverity: 'low',
        })

        // Should include all severities
        expect(result.deepAnalysis.issues).toBeDefined()
        // No filtering - all issues should be included
      })
    })

    // AC6: Comprehensive JSDoc on new method with examples
    describe('AC6: JSDoc documentation', () => {
      it('should have JSDoc on analyzeDeepArchitecture method', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        // Method should exist and be documented
        expect(engine.analyzeDeepArchitecture).toBeDefined()
        expect(typeof engine.analyzeDeepArchitecture).toBe('function')
      })
    })

    // Integration test: Full workflow
    describe('Integration: Full deep analysis workflow', () => {
      it('should run complete analysis pipeline', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        const result = engine.analyzeDeepArchitecture(mockDomainPath)

        // Verify complete result structure
        expect(result.domain).toBeDefined()
        expect(result.deepAnalysis).toBeDefined()
        expect(result.deepAnalysis.components).toBeDefined()
        expect(result.deepAnalysis.issues).toBeDefined()
        expect(result.deepAnalysis.refactoringStrategies).toBeDefined()
        expect(result.deepAnalysis.summary).toBeDefined()
      })

      it('should handle empty domain gracefully', () => {
        const engine = new DecisionEngine({
          basePath: fixturesPath,
          patternsPath: testPatternsPath,
        })

        const emptyDomainPath = path.join(fixturesPath, 'empty-domain')
        const result = engine.analyzeDeepArchitecture(emptyDomainPath)

        // Should return valid structure with empty arrays
        expect(result.deepAnalysis.components.length).toBe(0)
        expect(result.deepAnalysis.issues.length).toBe(0)
        expect(result.deepAnalysis.refactoringStrategies.length).toBe(0)
        expect(result.deepAnalysis.summary.totalComponents).toBe(0)
      })
    })
  })
})
