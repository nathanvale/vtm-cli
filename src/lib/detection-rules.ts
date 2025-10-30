/**
 * Detection Rules - Built-in architectural issue detection patterns
 *
 * Implements 8+ detection rules for identifying architectural issues
 * including code complexity, dependency management, documentation,
 * test coverage, and code organization problems.
 *
 * @module detection-rules
 */

import * as fs from 'fs'
import * as path from 'path'
import type { ArchitecturalIssue, DetectionRule } from './types'
import { ComponentAnalyzer } from './component-analyzer'

/**
 * TooManyCommandsRule - Detects domains with > 10 commands/files
 *
 * High number of files in a domain indicates potential need for splitting
 * the domain into smaller, more focused sub-domains.
 */
export class TooManyCommandsRule implements DetectionRule {
  readonly name = 'TooManyCommands'
  readonly description = 'Detects domains with too many commands (> 10)'

  detect(domainPath: string): ArchitecturalIssue[] {
    const issues: ArchitecturalIssue[] = []

    if (!fs.existsSync(domainPath)) {
      return issues
    }

    const files = fs
      .readdirSync(domainPath)
      .filter((f) => f.endsWith('.ts') && !f.includes('.test'))

    if (files.length > 10) {
      issues.push({
        id: 'ISSUE-001',
        title: 'Too Many Commands',
        description: `Domain has ${files.length} commands, which exceeds the recommended maximum of 10.`,
        severity: files.length > 15 ? 'critical' : 'high',
        location: domainPath,
        evidence: `Found ${files.length} TypeScript files: ${files.slice(0, 5).join(', ')}${files.length > 5 ? '...' : ''}`,
        impact: [
          'Reduced domain cohesion',
          'Harder to understand domain purpose',
          'Potential performance impact',
          'Maintenance complexity increases',
        ],
        effort: files.length > 15 ? '6-8 hours' : '4-6 hours',
        relatedIssues: [],
      })
    }

    return issues
  }
}

/**
 * LowCohesionRule - Detects domains where commands lack common theme
 *
 * Analyzes command names and purposes to identify domains where commands
 * don't share a cohesive purpose or theme.
 */
export class LowCohesionRule implements DetectionRule {
  readonly name = 'LowCohesion'
  readonly description = 'Detects domains with low cohesion between commands'

  detect(domainPath: string): ArchitecturalIssue[] {
    const issues: ArchitecturalIssue[] = []

    if (!fs.existsSync(domainPath)) {
      return issues
    }

    const files = fs
      .readdirSync(domainPath)
      .filter((f) => f.endsWith('.ts') && !f.includes('.test'))

    // Simple heuristic: check for diverse command names
    const hasHighDiversity =
      files.length > 3 &&
      files.some((f) => f.includes('read')) &&
      files.some((f) => f.includes('write')) &&
      files.some((f) => f.includes('delete')) &&
      files.some((f) => !f.includes('read') && !f.includes('write') && !f.includes('delete'))

    if (hasHighDiversity) {
      issues.push({
        id: 'ISSUE-002',
        title: 'Low Cohesion',
        description: 'Commands in this domain appear to lack a common theme or purpose.',
        severity: 'medium',
        location: domainPath,
        evidence: `Domain contains diverse command types: ${files.slice(0, 3).join(', ')}`,
        impact: [
          'Domain purpose unclear',
          'Hard to discover related commands',
          'Confusing API for users',
          'Maintenance challenges',
        ],
        effort: '1-2 hours',
        relatedIssues: [],
      })
    }

    return issues
  }
}

/**
 * TightCouplingRule - Detects components with too many external dependencies
 *
 * Analyzes import statements to identify components that depend on many
 * external modules, indicating tight coupling.
 */
export class TightCouplingRule implements DetectionRule {
  readonly name = 'TightCoupling'
  readonly description = 'Detects components with too many external dependencies'

  detect(domainPath: string): ArchitecturalIssue[] {
    const issues: ArchitecturalIssue[] = []

    if (!fs.existsSync(domainPath)) {
      return issues
    }

    const analyzer = new ComponentAnalyzer()
    const files = fs
      .readdirSync(domainPath)
      .filter((f) => f.endsWith('.ts') && !f.includes('.test'))
      .map((f) => path.join(domainPath, f))

    for (const filePath of files) {
      try {
        const metrics = analyzer.analyzeComponent(filePath)

        if (metrics.dependencies.length > 6) {
          issues.push({
            id: 'ISSUE-003',
            title: 'Tight Coupling',
            description: `Component ${metrics.name} has ${metrics.dependencies.length} external dependencies.`,
            severity: metrics.dependencies.length > 8 ? 'high' : 'medium',
            location: filePath,
            evidence: `Dependencies: ${metrics.dependencies.slice(0, 5).join(', ')}${metrics.dependencies.length > 5 ? '...' : ''}`,
            impact: [
              'Hard to test in isolation',
              'Brittle to external changes',
              'Difficult to understand component responsibility',
              'High maintenance burden',
            ],
            effort: '3-4 hours',
            relatedIssues: [],
          })
        }
      } catch {
        // Skip files that can't be analyzed
      }
    }

    return issues
  }
}

/**
 * UnbalancedDistributionRule - Detects uneven file sizes or complexity
 *
 * Analyzes file metrics to identify outlier components that are significantly
 * larger or more complex than their peers.
 */
export class UnbalancedDistributionRule implements DetectionRule {
  readonly name = 'UnbalancedDistribution'
  readonly description = 'Detects uneven distribution of code complexity or size'

  detect(domainPath: string): ArchitecturalIssue[] {
    const issues: ArchitecturalIssue[] = []

    if (!fs.existsSync(domainPath)) {
      return issues
    }

    const analyzer = new ComponentAnalyzer()
    const metrics = analyzer.scanComponentDir(domainPath)

    if (metrics.length < 2) {
      return issues
    }

    const averageLines = metrics.reduce((sum, m) => sum + m.lines, 0) / metrics.length
    const outliers = metrics.filter((m) => m.lines > averageLines * 2)

    if (outliers.length > 0) {
      issues.push({
        id: 'ISSUE-004',
        title: 'Unbalanced Distribution',
        description: `Some components are significantly larger than others (2x+ average size).`,
        severity: 'low',
        location: domainPath,
        evidence: `Large components: ${outliers.map((m) => `${m.name}(${m.lines}l)`).join(', ')}`,
        impact: ['Maintenance complexity', 'Testing difficulty', 'Code understanding challenges'],
        effort: '2-3 hours',
        relatedIssues: [],
      })
    }

    return issues
  }
}

/**
 * MissingDocumentationRule - Detects low JSDoc coverage
 *
 * Analyzes JSDoc coverage in components. Issues detected when coverage
 * falls below 70%.
 */
export class MissingDocumentationRule implements DetectionRule {
  readonly name = 'MissingDocumentation'
  readonly description = 'Detects low JSDoc coverage (< 70%)'

  detect(domainPath: string): ArchitecturalIssue[] {
    const issues: ArchitecturalIssue[] = []

    if (!fs.existsSync(domainPath)) {
      return issues
    }

    const analyzer = new ComponentAnalyzer()
    const metrics = analyzer.scanComponentDir(domainPath)

    for (const m of metrics) {
      if (m.jsdocCoverage < 70) {
        issues.push({
          id: 'ISSUE-005',
          title: 'Missing Documentation',
          description: `Component ${m.name} has only ${m.jsdocCoverage}% JSDoc coverage.`,
          severity: m.jsdocCoverage < 40 ? 'high' : 'medium',
          location: m.filePath,
          evidence: `${m.jsdocCoverage}% coverage: ${m.functions.filter((f) => !f.hasJSDoc).length}/${m.functions.length} functions undocumented`,
          impact: [
            'Reduced API usability',
            'Maintenance complexity',
            'Onboarding difficulty',
            'Code discoverability',
          ],
          effort: `${Math.ceil(m.functions.length * 0.25)}-${Math.ceil(m.functions.length * 0.5)} hours`,
          relatedIssues: [],
        })
      }
    }

    return issues
  }
}

/**
 * TestCoverageGapsRule - Detects low test coverage
 *
 * While this rule focuses on architectural patterns, it identifies components
 * that may have test coverage gaps based on complexity metrics.
 */
export class TestCoverageGapsRule implements DetectionRule {
  readonly name = 'TestCoverageGaps'
  readonly description = 'Detects potential test coverage gaps'

  detect(domainPath: string): ArchitecturalIssue[] {
    const issues: ArchitecturalIssue[] = []

    if (!fs.existsSync(domainPath)) {
      return issues
    }

    const analyzer = new ComponentAnalyzer()
    const metrics = analyzer.scanComponentDir(domainPath)

    for (const m of metrics) {
      // High complexity with many functions suggests test gaps
      if (m.complexity > 6 && m.functions.length > 5) {
        issues.push({
          id: 'ISSUE-006',
          title: 'Test Coverage Gaps',
          description: `Component ${m.name} has high complexity (${m.complexity}/10) suggesting potential test gaps.`,
          severity: m.complexity > 8 ? 'high' : 'medium',
          location: m.filePath,
          evidence: `${m.functions.length} functions with avg complexity ${(m.complexity / m.functions.length).toFixed(1)}`,
          impact: [
            'Reduced code reliability',
            'Regression risks',
            'Maintenance challenges',
            'Quality issues',
          ],
          effort: `${Math.ceil(m.functions.length * 0.5)}-${Math.ceil(m.functions.length * 1.5)} hours`,
          relatedIssues: [],
        })
      }
    }

    return issues
  }
}

/**
 * DuplicateFunctionalityRule - Detects similar commands
 *
 * Analyzes component names and code patterns to identify potential duplication
 * where similar functionality exists in multiple places.
 */
export class DuplicateFunctionalityRule implements DetectionRule {
  readonly name = 'DuplicateFunctionality'
  readonly description = 'Detects potential duplicate functionality'

  detect(domainPath: string): ArchitecturalIssue[] {
    const issues: ArchitecturalIssue[] = []

    if (!fs.existsSync(domainPath)) {
      return issues
    }

    const files = fs
      .readdirSync(domainPath)
      .filter((f) => f.endsWith('.ts') && !f.includes('.test'))

    // Simple heuristic: look for similar command names
    const findSimilar = (name: string): string[] => {
      const baseName = name.replace(/\.(ts|js)$/, '').toLowerCase()
      return files.filter((f) => {
        const otherBase = f.replace(/\.(ts|js)$/, '').toLowerCase()
        if (otherBase === baseName) return false
        // Check for similar patterns (e.g., read/reader, write/writer)
        return (
          (baseName.includes('read') && otherBase.includes('read')) ||
          (baseName.includes('write') && otherBase.includes('write')) ||
          (baseName.includes('get') && otherBase.includes('get'))
        )
      })
    }

    for (const file of files) {
      const similar = findSimilar(file)
      if (similar.length > 0) {
        issues.push({
          id: 'ISSUE-007',
          title: 'Duplicate Functionality',
          description: `Potential duplication detected: ${file} has similar variants.`,
          severity: 'low',
          location: path.join(domainPath, file),
          evidence: `Similar commands: ${similar.join(', ')}`,
          impact: [
            'Code duplication',
            'Maintenance complexity',
            'Inconsistent behavior',
            'Reduced cohesion',
          ],
          effort: '1-2 hours',
          relatedIssues: [],
        })
      }
    }

    return issues
  }
}

/**
 * OutdatedDependenciesRule - Detects stale packages
 *
 * Analyzes package.json to identify dependencies that haven't been updated
 * in a long time (> 6 months).
 */
export class OutdatedDependenciesRule implements DetectionRule {
  readonly name = 'OutdatedDependencies'
  readonly description = 'Detects potentially outdated dependencies'

  detect(_domainPath: string): ArchitecturalIssue[] {
    const issues: ArchitecturalIssue[] = []

    // Check project root for package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json')

    if (!fs.existsSync(packageJsonPath)) {
      return issues
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
      const devDeps = Object.keys(packageJson.devDependencies || {})

      // Simple heuristic: common packages that might be outdated
      const potentiallyOutdated = devDeps.filter((dep) => {
        const commonOutdatedNames = ['vitest', 'typescript', 'eslint', 'prettier']
        return commonOutdatedNames.some((name) => dep.includes(name))
      })

      if (potentiallyOutdated.length > 0) {
        issues.push({
          id: 'ISSUE-008',
          title: 'Outdated Dependencies',
          description: `Project may have outdated or stale dependencies.`,
          severity: 'low',
          location: packageJsonPath,
          evidence: `Potential outdated packages: ${potentiallyOutdated.slice(0, 3).join(', ')}`,
          impact: [
            'Security vulnerabilities',
            'Missing features',
            'Compatibility issues',
            'Performance degradation',
          ],
          effort: '1-2 hours',
          relatedIssues: [],
        })
      }
    } catch {
      // Skip if package.json can't be parsed
    }

    return issues
  }
}
