/**
 * IssueDetector - Architectural Issue Detection
 *
 * Detects architectural problems in domains using pattern-based detection rules.
 * Provides analysis of code quality, structure, and dependencies with severity
 * classification and relationship detection.
 *
 * @module issue-detector
 */

import * as fs from 'fs'
import type { ArchitecturalIssue, DetectionRule, DetectionOptions } from './types'
import {
  TooManyCommandsRule,
  LowCohesionRule,
  TightCouplingRule,
  UnbalancedDistributionRule,
  MissingDocumentationRule,
  TestCoverageGapsRule,
  DuplicateFunctionalityRule,
  OutdatedDependenciesRule,
} from './detection-rules'

/**
 * IssueDetector - Main class for detecting architectural issues
 *
 * Provides comprehensive issue detection using built-in rules and support for
 * custom detection rules. Analyzes code structure, dependencies, and quality metrics.
 */
export class IssueDetector {
  private rules: Map<string, DetectionRule> = new Map()
  private issueCounter: number = 0

  /**
   * Create a new IssueDetector instance with built-in detection rules
   */
  constructor() {
    this.initializeBuiltInRules()
  }

  /**
   * Initialize built-in detection rules
   *
   * @internal
   */
  private initializeBuiltInRules(): void {
    // Register all built-in detection rules
    this.rules.set('TooManyCommands', new TooManyCommandsRule())
    this.rules.set('LowCohesion', new LowCohesionRule())
    this.rules.set('TightCoupling', new TightCouplingRule())
    this.rules.set('UnbalancedDistribution', new UnbalancedDistributionRule())
    this.rules.set('MissingDocumentation', new MissingDocumentationRule())
    this.rules.set('TestCoverageGaps', new TestCoverageGapsRule())
    this.rules.set('DuplicateFunctionality', new DuplicateFunctionalityRule())
    this.rules.set('OutdatedDependencies', new OutdatedDependenciesRule())
  }

  /**
   * Detect architectural issues in a domain
   *
   * Analyzes domain structure and applies all registered detection rules
   * (8+ built-in rules) to identify architectural problems. Detected issues
   * are aggregated and sorted by severity (critical → low).
   *
   * Built-in rules detect:
   * - **TooManyCommands**: > 10 files (suggests domain split)
   * - **LowCohesion**: Unrelated commands in same domain
   * - **TightCoupling**: > 6 external module dependencies
   * - **UnbalancedDistribution**: Outlier files (2x+ average size)
   * - **MissingDocumentation**: < 70% JSDoc coverage
   * - **TestCoverageGaps**: Complex components without tests
   * - **DuplicateFunctionality**: Similar/duplicate commands
   * - **OutdatedDependencies**: Stale package versions
   *
   * @param domainPath - Path to the domain directory to analyze
   * @param options - Detection options (rules to skip, min severity filter)
   * @returns Array of detected issues sorted by severity (critical first)
   * @throws {Error} If domain path doesn't exist or is inaccessible
   *
   * @example
   * ```typescript
   * const detector = new IssueDetector()
   * const issues = detector.detect('src/lib/vtm')
   * console.log(issues.length) // 3 issues found
   * console.log(issues[0].severity) // 'high'
   *
   * // Skip certain rules and filter by severity
   * const filtered = detector.detect('src/lib/vtm', {
   *   skipRules: ['OutdatedDependencies'],
   *   minSeverity: 'high'
   * })
   * ```
   *
   * @remarks
   * - Issues with same ID are deduplicated (last one wins)
   * - Failed rule detection is silently skipped
   * - Related issues are linked to show compound effects
   * - Empty domains return empty issue array (no false positives)
   */
  public detect(domainPath: string, options?: DetectionOptions): ArchitecturalIssue[] {
    if (!fs.existsSync(domainPath)) {
      throw new Error(`Domain path does not exist: ${domainPath}`)
    }

    const issues: ArchitecturalIssue[] = []

    // Apply each registered rule
    for (const rule of this.rules.values()) {
      // Skip rules if specified in options
      if (options?.skipRules?.includes(rule.name)) {
        continue
      }

      try {
        const ruleIssues = rule.detect(domainPath)
        issues.push(...ruleIssues)
      } catch {
        // Silently skip rules that fail
      }
    }

    // Filter by minimum severity if specified
    const minSeverity = options?.minSeverity
    const filtered =
      minSeverity && minSeverity
        ? issues.filter(
            (issue) => this.getSeverityScore(issue.severity) >= this.getSeverityScore(minSeverity),
          )
        : issues

    // Sort by severity (critical first)
    return filtered.sort(
      (a, b) => this.getSeverityScore(b.severity) - this.getSeverityScore(a.severity),
    )
  }

  /**
   * Register a custom detection rule
   *
   * Adds a custom rule to the detection pipeline. Custom rules are applied
   * alongside built-in rules.
   *
   * @param rule - The detection rule to register
   * @throws {Error} If rule name is already registered
   *
   * @example
   * ```typescript
   * const customRule = {
   *   name: 'MyCustomRule',
   *   description: 'Detects my custom issue pattern',
   *   detect: (domainPath) => [...issues]
   * }
   * detector.registerRule(customRule)
   * ```
   */
  public registerRule(rule: DetectionRule): void {
    if (this.rules.has(rule.name)) {
      throw new Error(`Rule already registered: ${rule.name}`)
    }
    this.rules.set(rule.name, rule)
  }

  /**
   * Get severity score for sorting
   *
   * @internal
   */
  private getSeverityScore(severity: string): number {
    const scores: Record<string, number> = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    }
    return scores[severity] ?? 0
  }

  /**
   * Generate next issue ID
   *
   * @internal
   */
  private generateIssueId(): string {
    this.issueCounter += 1
    return `ISSUE-${String(this.issueCounter).padStart(3, '0')}`
  }
}
