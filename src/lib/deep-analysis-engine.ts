/**
 * DeepAnalysisEngine - 3-Tier Architecture Analysis Pipeline
 *
 * Integrates ComponentAnalyzer → IssueDetector → RefactoringPlanner into a cohesive
 * deep analysis pipeline that provides comprehensive architectural insights.
 *
 * Pipeline Flow:
 * 1. ComponentAnalyzer: Extracts file-level metrics and code smells
 * 2. IssueDetector: Detects architectural issues with severity classification
 * 3. RefactoringPlanner: Generates refactoring strategies and migration plans
 *
 * @module deep-analysis-engine
 *
 * @example
 * ```typescript
 * import { DeepAnalysisEngine } from 'vtm-cli/lib'
 *
 * const engine = new DeepAnalysisEngine()
 * const analysis = engine.runFullAnalysis('src/lib/vtm')
 *
 * console.log('Components:', analysis.components.length)
 * console.log('Issues:', analysis.issues.length)
 * console.log('Strategies:', analysis.refactoringStrategies.length)
 * console.log('Summary:', analysis.summary)
 * ```
 */

import { ComponentAnalyzer, type ComponentMetrics } from './component-analyzer'
import { IssueDetector } from './issue-detector'
import { RefactoringPlanner } from './refactoring-planner'
import type { ArchitecturalIssue, RefactoringOption, DetectionOptions } from './types'

/**
 * Analysis result containing all three tiers of analysis
 */
export type AnalysisResult = {
  /** Tier 1: Component metrics from file-level analysis */
  components: ComponentMetrics[]
  /** Tier 2: Detected architectural issues with severity */
  issues: ArchitecturalIssue[]
  /** Tier 3: Refactoring strategies for each issue */
  refactoringStrategies: RefactoringStrategy[]
  /** Summary statistics across all tiers */
  summary: AnalysisSummary
}

/**
 * Refactoring strategy for a specific issue
 */
export type RefactoringStrategy = {
  /** The architectural issue being addressed */
  issue: ArchitecturalIssue
  /** Available refactoring options (2-3 alternatives) */
  options: RefactoringOption[]
  /** The recommended option (best choice) */
  recommendedOption: RefactoringOption | null
}

/**
 * Summary statistics for the analysis
 */
export type AnalysisSummary = {
  /** Total number of components analyzed */
  totalComponents: number
  /** Total number of issues detected */
  totalIssues: number
  /** Number of critical severity issues */
  criticalIssues: number
  /** Total number of refactoring options generated */
  totalRefactoringOptions: number
}

/**
 * DeepAnalysisEngine - Main class for 3-tier deep analysis
 *
 * Orchestrates the complete analysis pipeline by integrating:
 * - **ComponentAnalyzer**: File-level metrics (LOC, complexity, code smells)
 * - **IssueDetector**: Architectural issue detection (8+ rules)
 * - **RefactoringPlanner**: Refactoring strategies (2-3 options per issue)
 *
 * The pipeline runs sequentially with data flowing from tier 1 → 2 → 3.
 */
export class DeepAnalysisEngine {
  private componentAnalyzer: ComponentAnalyzer
  private issueDetector: IssueDetector
  private refactoringPlanner: RefactoringPlanner

  /**
   * Create a new DeepAnalysisEngine instance
   *
   * Initializes all three analysis tiers with default configurations.
   */
  constructor() {
    this.componentAnalyzer = new ComponentAnalyzer()
    this.issueDetector = new IssueDetector()
    this.refactoringPlanner = new RefactoringPlanner()
  }

  /**
   * Run full 3-tier analysis on a domain directory
   *
   * Executes the complete analysis pipeline:
   * 1. **Tier 1 (ComponentAnalyzer)**: Scans directory for TypeScript files,
   *    extracts metrics (LOC, complexity, dependencies), detects code smells
   * 2. **Tier 2 (IssueDetector)**: Analyzes domain structure, applies 8+ detection
   *    rules, identifies architectural issues with severity classification
   * 3. **Tier 3 (RefactoringPlanner)**: Generates 2-3 refactoring options per issue,
   *    recommends best option, creates implementation strategies
   *
   * @param domainPath - Path to the domain directory to analyze
   * @param options - Optional detection options (skipRules, minSeverity)
   * @returns AnalysisResult with components, issues, strategies, and summary
   * @throws {Error} If domain path doesn't exist or is inaccessible
   *
   * @example
   * ```typescript
   * const engine = new DeepAnalysisEngine()
   *
   * // Basic analysis
   * const result = engine.runFullAnalysis('src/lib/vtm')
   * console.log(`Found ${result.issues.length} issues`)
   *
   * // With options
   * const filtered = engine.runFullAnalysis('src/lib/plan', {
   *   skipRules: ['OutdatedDependencies'],
   *   minSeverity: 'high'
   * })
   * console.log(`Critical issues: ${filtered.summary.criticalIssues}`)
   * ```
   *
   * @remarks
   * - Analysis runs sequentially but is optimized for performance
   * - Empty domains return empty results (no false positives)
   * - ComponentAnalyzer skips test files and node_modules
   * - IssueDetector applies all registered rules (8+ built-in)
   * - RefactoringPlanner generates strategies only for detected issues
   * - Summary provides aggregate statistics across all tiers
   * - Options allow filtering issues by severity or skipping specific rules
   */
  public runFullAnalysis(domainPath: string, options?: DetectionOptions): AnalysisResult {
    // Tier 1: Component Analysis
    const components = this.componentAnalyzer.scanComponentDir(domainPath)

    // Tier 2: Issue Detection
    const issues = this.issueDetector.detect(domainPath, options)

    // Tier 3: Refactoring Planning
    const refactoringStrategies = this.generateRefactoringStrategies(issues)

    // Build summary
    const summary = this.buildSummary(components, issues, refactoringStrategies)

    return {
      components,
      issues,
      refactoringStrategies,
      summary,
    }
  }

  /**
   * Generate refactoring strategies for all detected issues
   *
   * For each issue, generates 2-3 alternative refactoring options and
   * identifies the recommended best option.
   *
   * @param issues - Array of detected architectural issues
   * @returns Array of RefactoringStrategy objects
   *
   * @internal
   */
  private generateRefactoringStrategies(issues: ArchitecturalIssue[]): RefactoringStrategy[] {
    return issues.map((issue) => {
      const options = this.refactoringPlanner.generateOptions(issue)
      const recommendedOption = this.refactoringPlanner.recommendBest(options)

      return {
        issue,
        options,
        recommendedOption,
      }
    })
  }

  /**
   * Build summary statistics for the analysis
   *
   * Aggregates key metrics across all three tiers.
   *
   * @param components - Component metrics from Tier 1
   * @param issues - Detected issues from Tier 2
   * @param strategies - Refactoring strategies from Tier 3
   * @returns AnalysisSummary with aggregate statistics
   *
   * @internal
   */
  private buildSummary(
    components: ComponentMetrics[],
    issues: ArchitecturalIssue[],
    strategies: RefactoringStrategy[],
  ): AnalysisSummary {
    const criticalIssues = issues.filter((issue) => issue.severity === 'critical').length
    const totalRefactoringOptions = strategies.reduce(
      (sum, strategy) => sum + strategy.options.length,
      0,
    )

    return {
      totalComponents: components.length,
      totalIssues: issues.length,
      criticalIssues,
      totalRefactoringOptions,
    }
  }
}
