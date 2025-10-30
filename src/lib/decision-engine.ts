/**
 * Decision Engine - Architecture Recommendation System (Lightweight)
 *
 * Pattern-based architecture decision system using heuristics and rules.
 * No ML/AI - just smart pattern matching and best practices.
 *
 * Usage:
 *   const engine = new DecisionEngine()
 *   const recommendation = engine.recommendArchitecture("task tracking for teams")
 *   const analysis = engine.analyzeDomain("vtm")
 *   const refactoring = engine.suggestRefactoring("vtm:context")
 */

import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'
import { DeepAnalysisEngine } from './deep-analysis-engine'
import type { ComponentMetrics as RealComponentMetrics } from './component-analyzer'
import type { ArchitecturalIssue as RealArchitecturalIssue, DetectionOptions } from './types'

type DecisionEngineOptions = {
  basePath?: string
  patternsPath?: string
  verbose?: boolean
}

type ArchitectureRecommendation = {
  domain: string
  description: string
  commands: CommandRecommendation[]
  skills?: SkillRecommendation[]
  mcps?: MCPRecommendation[]
  hooks?: HookRecommendation[]
  patterns: string[]
  rationale: string[]
  alternatives: Alternative[]
  implementation: ImplementationPlan
  confidence: number
  formatted: string
}

type CommandRecommendation = {
  name: string
  description: string
  args?: string[]
  complexity: 'low' | 'medium' | 'high'
}

type SkillRecommendation = {
  name: string
  triggers: string[]
  purpose: string
}

type MCPRecommendation = {
  name: string
  system: string
  purpose: string
}

type HookRecommendation = {
  event: string
  purpose: string
  frequency?: string
}

type Alternative = {
  approach: string
  pros: string[]
  cons: string[]
  rejected: boolean
  reason: string
}

type ImplementationPlan = {
  phases: Phase[]
  totalEffort: string
  complexity: string
}

type Phase = {
  name: string
  steps: string[]
  duration: string
}

type DomainAnalysis = {
  domain: string
  current: CurrentState
  strengths: string[]
  issues: Issue[]
  recommendations: Recommendation[]
  refactoringRoadmap: RefactoringPhase[]
  metrics: Metrics
  formatted: string
}

type CurrentState = {
  commands: number
  skills: number
  mcps: number
  hooks: number
  complexity: number
  cohesion: number
}

type Issue = {
  title: string
  problem: string
  recommendation: string
  options?: string[]
  preferredOption?: string
  effort: string
  impact: string
}

type Recommendation = {
  priority: number
  action: string
  reason: string
  effort: string
}

type RefactoringPhase = {
  name: string
  tasks: string[]
  duration: string
  impact: string
}

type Metrics = {
  complexity: number
  cohesion: number
  testCoverage?: number
  linesOfCode?: number
}

/**
 * Deep analysis result combining pattern recommendations with deep architecture analysis
 * AC3: Combined results with pattern recommendations + deep analysis
 */
type DeepAnalysisResult = {
  // Pattern-based recommendations
  domain: string
  commands: CommandRecommendation[]
  patterns: string[]
  confidence: number
  // Deep analysis tier results (nested structure per AC3)
  deepAnalysis: {
    components: RealComponentMetrics[]
    issues: RealArchitecturalIssue[]
    refactoringStrategies: RefactoringStrategy[]
    summary: AnalysisSummary
  }
}

type RefactoringStrategy = {
  issue: RealArchitecturalIssue
  options: RefactoringOption[]
  recommendedOption: RefactoringOption | null
}

type AnalysisSummary = {
  totalComponents: number
  totalIssues: number
  criticalIssues: number
  totalRefactoringOptions: number
}

type ComponentState = {
  name: string
  lines: number
  complexity: number
  dependencies: string[]
}

type RefactoringPlan = {
  component: string
  currentState: ComponentState
  issues: Issue[]
  options: RefactoringOption[]
  recommendation: RefactoringOption
  migration: MigrationStrategy
  implementation: ImplementationChecklist
  formatted: string
}

type RefactoringOption = {
  name: string
  description: string
  pros: string[]
  cons: string[]
  effort: string
  breaking: boolean
  riskLevel?: 'low' | 'medium' | 'high'
  recommendation?: boolean
}

type MigrationStrategy = {
  steps: string[]
  rollback: string
}

type ImplementationChecklist = {
  phases: ChecklistPhase[]
  total: string
  risk: string
}

type ChecklistPhase = {
  name: string
  duration: string
  tasks: string[]
}

type ArchitecturePattern = {
  name: string
  keywords: string[]
  commands: string[]
  confidence?: number
}

// ========== Constants ==========

/** Common words to filter out during keyword extraction */
const COMMON_WORDS = [
  'the',
  'a',
  'an',
  'and',
  'or',
  'but',
  'for',
  'with',
  'to',
  'in',
  'on',
  'at',
] as const

/** Action verbs to filter when extracting domain nouns */
const ACTION_VERBS = ['create', 'manage', 'track', 'analyze', 'monitor', 'build', 'test'] as const

/** Minimum word length for keyword extraction */
const MIN_KEYWORD_LENGTH = 2

/** Pattern matching scoring thresholds and weights */
const PATTERN_SCORE = {
  EXACT_MATCH: 0.3, // Score for exact keyword match
  PARTIAL_MATCH: 0.1, // Score for partial/substring match
  MIN_THRESHOLD: 0.3, // Minimum score to consider pattern
  MAX_SCORE: 1.0, // Maximum possible score
} as const

/** Domain analysis thresholds */
const DOMAIN_LIMITS = {
  MAX_COMMANDS_SINGLE_CONCERN: 7, // Max commands before suggesting split
  HIGH_COMMAND_THRESHOLD: 10, // Commands count indicating multiple concerns
  HIGH_COHESION_THRESHOLD: 7.0, // Cohesion score indicating good design
} as const

/**
 * Decision Engine - Core class for architecture recommendations
 */
export class DecisionEngine {
  private basePath: string
  private patternsPath: string
  private patterns: Record<string, ArchitecturePattern> = {}
  private verbose: boolean

  constructor(options: DecisionEngineOptions = {}) {
    this.basePath = options.basePath || process.cwd()
    this.patternsPath =
      options.patternsPath || path.join(__dirname, 'data', 'architecture-patterns.json')
    this.verbose = options.verbose || false
    this.loadPatterns()
  }

  /**
   * Get loaded architecture patterns
   * @returns Record of pattern name to ArchitecturePattern
   */
  public getPatterns(): Record<string, ArchitecturePattern> {
    return this.patterns
  }

  /**
   * Load architecture patterns from JSON
   */
  private loadPatterns(): void {
    try {
      if (fs.existsSync(this.patternsPath)) {
        const content = fs.readFileSync(this.patternsPath, 'utf-8')
        this.patterns = JSON.parse(content)
      } else {
        // Default patterns if file doesn't exist
        this.patterns = this.getDefaultPatterns()
      }
    } catch {
      console.warn(chalk.yellow('Warning: Could not load patterns, using defaults'))
      this.patterns = this.getDefaultPatterns()
    }
  }

  /**
   * Recommend architecture based on description
   */
  public recommendArchitecture(
    description: string,
    _options: Record<string, unknown> = {},
  ): ArchitectureRecommendation {
    const keywords = this.extractKeywords(description.toLowerCase())
    const matchedPatterns = this.matchPatterns(keywords)
    const domain = this.suggestDomainName(description, keywords)
    const commands = this.suggestCommands(keywords, matchedPatterns)
    const skills = this.suggestSkills(keywords, commands)
    const mcps = this.suggestMCPs(keywords)
    const hooks = this.suggestHooks(keywords)
    const rationale = this.buildRationale(commands, skills, mcps, hooks, keywords)
    const alternatives = this.generateAlternatives(domain, commands)
    const implementation = this.buildImplementationPlan(commands, skills, mcps, hooks)
    const confidence = this.calculateConfidence(matchedPatterns, keywords)

    const recommendation: ArchitectureRecommendation = {
      domain,
      description,
      commands,
      skills,
      mcps,
      hooks,
      patterns: matchedPatterns.map((p) => p.name),
      rationale,
      alternatives,
      implementation,
      confidence,
      formatted: '', // Will be filled below
    }

    recommendation.formatted = this.formatRecommendation(recommendation)
    return recommendation
  }

  /**
   * Analyze existing domain
   */
  public analyzeDomain(domainName: string, _options: Record<string, unknown> = {}): DomainAnalysis {
    // Scan domain components
    const current = this.scanDomain(domainName)
    const strengths = this.identifyStrengths(domainName, current)
    const issues = this.identifyIssues(domainName, current)
    const recommendations = this.generateRecommendations(issues)
    const refactoringRoadmap = this.buildRefactoringRoadmap(issues)
    const metrics = this.calculateMetrics(domainName, current)

    const analysis: DomainAnalysis = {
      domain: domainName,
      current,
      strengths,
      issues,
      recommendations,
      refactoringRoadmap,
      metrics,
      formatted: '',
    }

    analysis.formatted = this.formatAnalysis(analysis, _options)
    return analysis
  }

  /**
   * Suggest refactoring for specific component
   */
  public suggestRefactoring(
    component: string,
    _options: Record<string, unknown> = {},
  ): RefactoringPlan {
    const currentState = this.analyzeComponent(component)
    const issues = this.detectComponentIssues(component, currentState)
    const refactoringOptions = this.generateRefactoringOptions(component, issues)
    const recommendation = this.selectBestOption(refactoringOptions)
    const migration = this.buildMigrationStrategy(component, recommendation)
    const implementation = this.buildImplementationChecklist(component, recommendation)

    const plan: RefactoringPlan = {
      component,
      currentState,
      issues,
      options: refactoringOptions,
      recommendation,
      migration,
      implementation,
      formatted: '',
    }

    plan.formatted = this.formatRefactoringPlan(plan)
    return plan
  }

  /**
   * Run deep architectural analysis using 3-tier pipeline
   *
   * Executes comprehensive analysis using DeepAnalysisEngine:
   * 1. ComponentAnalyzer: File-level metrics (LOC, complexity, code smells)
   * 2. IssueDetector: Architectural issue detection with severity classification
   * 3. RefactoringPlanner: Refactoring strategies (2-3 options per issue)
   *
   * @param domainName - Name of domain to analyze
   * @param options - Optional detection options (skipRules, minSeverity)
   * @returns DeepAnalysisResult with components, issues, strategies, and formatted output
   *
   * @example
   * ```typescript
   * const engine = new DecisionEngine()
   * const analysis = engine.analyzeDeepArchitecture('vtm')
   * console.log(analysis.formatted)
   * ```
   */
  /**
   * Analyze domain with deep architecture analysis
   *
   * Combines pattern-based recommendations with comprehensive 3-tier deep analysis
   * (ComponentAnalyzer → IssueDetector → RefactoringPlanner).
   *
   * @param domainPath - Absolute or relative path to domain directory
   * @param options - Optional detection options (minSeverity defaults to 'medium')
   * @returns DeepAnalysisResult combining pattern recommendations + deep analysis
   *
   * @example
   * ```typescript
   * // Light analysis (pattern-based only)
   * const engine = new DecisionEngine()
   * const lightAnalysis = engine.analyzeDomain('vtm')
   *
   * // Deep analysis (pattern + 3-tier analysis)
   * const deepAnalysis = engine.analyzeDeepArchitecture('vtm')
   * console.log('Components:', deepAnalysis.deepAnalysis.components.length)
   * console.log('Issues:', deepAnalysis.deepAnalysis.issues.length)
   *
   * // With custom severity threshold
   * const highOnly = engine.analyzeDeepArchitecture('vtm', {
   *   minSeverity: 'high'
   * })
   * ```
   */
  public analyzeDeepArchitecture(
    domainPath: string,
    options: DetectionOptions = {},
  ): DeepAnalysisResult {
    const deepEngine = new DeepAnalysisEngine()

    // Resolve domain path (handle both absolute and relative paths)
    const resolvedPath = path.isAbsolute(domainPath)
      ? domainPath
      : path.join(this.basePath, '.claude/commands', domainPath)

    // Extract domain name from path
    const domainName = path.basename(domainPath)

    // Step 1: Generate pattern-based recommendations
    const keywords = this.extractKeywords(domainName)
    const matchedPatterns = this.matchPatterns(keywords)
    const commands = this.suggestCommands(keywords, matchedPatterns)
    const confidence = this.calculateConfidence(matchedPatterns, keywords)

    // Step 2: Run full 3-tier deep analysis with severity filtering (default: medium+)
    const detectionOptions: DetectionOptions = {
      ...options,
      minSeverity: options.minSeverity || 'medium', // AC5: Default to medium
    }
    const analysisResult = deepEngine.runFullAnalysis(resolvedPath, detectionOptions)

    // Step 3: Build combined result structure (AC3)
    const result: DeepAnalysisResult = {
      // Pattern-based recommendations
      domain: domainName,
      commands,
      patterns: matchedPatterns.map((p) => p.name),
      confidence,
      // Deep analysis tier results (AC4)
      deepAnalysis: {
        components: analysisResult.components,
        issues: analysisResult.issues,
        refactoringStrategies: analysisResult.refactoringStrategies,
        summary: analysisResult.summary,
      },
    }

    return result
  }

  // ========== Private Helper Methods ==========

  /**
   * Extract meaningful keywords from text by filtering common words and short words
   * @param text - Input text to extract keywords from
   * @returns Array of filtered keywords
   */
  private extractKeywords(text: string): string[] {
    return text
      .split(/\s+/)
      .filter((word) => word.length > MIN_KEYWORD_LENGTH)
      .filter((word) => !COMMON_WORDS.includes(word as (typeof COMMON_WORDS)[number]))
  }

  /**
   * Match architectural patterns against extracted keywords
   * @param keywords - Keywords extracted from description
   * @returns Sorted array of matching patterns with confidence scores
   */
  private matchPatterns(keywords: string[]): ArchitecturePattern[] {
    const matches: ArchitecturePattern[] = []

    for (const pattern of Object.values(this.patterns)) {
      const score = this.scorePattern(pattern, keywords)
      if (score > PATTERN_SCORE.MIN_THRESHOLD) {
        matches.push({ ...pattern, confidence: score })
      }
    }

    return matches.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
  }

  /**
   * Calculate confidence score for a pattern match
   * Uses exact match (0.3) and partial match (0.1) scoring
   * @param pattern - Architecture pattern to score
   * @param keywords - Keywords to match against
   * @returns Confidence score between 0 and 1
   */
  private scorePattern(pattern: ArchitecturePattern, keywords: string[]): number {
    let score = 0
    const patternKeywords = pattern.keywords || []

    for (const keyword of keywords) {
      // Exact keyword match
      if (patternKeywords.includes(keyword)) {
        score += PATTERN_SCORE.EXACT_MATCH
      }
      // Partial/substring match
      for (const pk of patternKeywords) {
        if (keyword.includes(pk) || pk.includes(keyword)) {
          score += PATTERN_SCORE.PARTIAL_MATCH
        }
      }
    }

    return Math.min(score, PATTERN_SCORE.MAX_SCORE)
  }

  /**
   * Suggest domain name from description by extracting non-verb nouns
   * @param description - Original description (unused, kept for API compatibility)
   * @param keywords - Extracted keywords
   * @returns Suggested domain name in singular form
   */
  private suggestDomainName(description: string, keywords: string[]): string {
    // Extract nouns by filtering out common action verbs
    const nouns = keywords.filter((k) => !ACTION_VERBS.includes(k as (typeof ACTION_VERBS)[number]))

    if (nouns.length > 0 && nouns[0]) {
      return nouns[0].replace(/s$/, '') // Remove plural 's'
    }

    return 'custom-domain'
  }

  private suggestCommands(
    keywords: string[],
    patterns: ArchitecturePattern[],
  ): CommandRecommendation[] {
    const commands: CommandRecommendation[] = []

    // Base CRUD if pattern suggests it
    if (patterns.some((p) => p.name === 'crud' || p.name === 'task-management')) {
      commands.push(
        { name: 'next', description: 'Get next item to work on', complexity: 'low' },
        { name: 'list', description: 'List all items', complexity: 'low' },
        { name: 'create', description: 'Create new item', args: ['name'], complexity: 'medium' },
      )
    }

    // Add workflow commands if needed
    if (keywords.includes('workflow') || keywords.includes('process')) {
      commands.push(
        { name: 'start', description: 'Start workflow', args: ['id'], complexity: 'medium' },
        { name: 'complete', description: 'Complete workflow', args: ['id'], complexity: 'medium' },
      )
    }

    // Add analytics if mentioned
    if (
      keywords.includes('analytics') ||
      keywords.includes('stats') ||
      keywords.includes('metrics')
    ) {
      commands.push(
        { name: 'stats', description: 'View statistics', complexity: 'medium' },
        { name: 'report', description: 'Generate report', complexity: 'high' },
      )
    }

    return commands.slice(0, 6) // Limit to 6 commands
  }

  private suggestSkills(
    keywords: string[],
    commands: CommandRecommendation[],
  ): SkillRecommendation[] {
    if (commands.length === 0) return []

    const triggers: string[] = []

    // Generate triggers based on commands
    if (commands.some((c) => c.name === 'next')) {
      triggers.push('what should I work on', 'next task', 'show next')
    }
    if (commands.some((c) => c.name === 'stats')) {
      triggers.push('show stats', 'how are we doing', 'progress report')
    }

    return [
      {
        name: `${this.suggestDomainName('', keywords)}-expert`,
        triggers,
        purpose: 'Auto-suggest relevant commands based on context',
      },
    ]
  }

  private suggestMCPs(keywords: string[]): MCPRecommendation[] {
    const mcps: MCPRecommendation[] = []

    // Check for integration keywords
    if (keywords.includes('slack')) {
      mcps.push({
        name: 'slack-connector',
        system: 'Slack',
        purpose: 'Send notifications to channels',
      })
    }
    if (keywords.includes('notion')) {
      mcps.push({
        name: 'notion-connector',
        system: 'Notion',
        purpose: 'Sync with Notion database',
      })
    }
    if (keywords.includes('github')) {
      mcps.push({
        name: 'github-connector',
        system: 'GitHub',
        purpose: 'Integrate with GitHub issues/PRs',
      })
    }
    if (keywords.includes('database') || keywords.includes('store')) {
      mcps.push({
        name: 'database-connector',
        system: 'Database',
        purpose: 'Store and retrieve data',
      })
    }

    return mcps
  }

  private suggestHooks(keywords: string[]): HookRecommendation[] {
    const hooks: HookRecommendation[] = []

    // Check for timing keywords
    if (keywords.includes('daily') || keywords.includes('standup')) {
      hooks.push({
        event: 'morning-standup',
        purpose: 'Prepare daily standup data',
        frequency: '9am daily',
      })
    }
    if (keywords.includes('commit') || keywords.includes('validate')) {
      hooks.push({ event: 'pre-commit', purpose: 'Validate before commit' })
    }
    if (keywords.includes('alert') || keywords.includes('notify')) {
      hooks.push({ event: 'on-alert', purpose: 'Send notifications on events' })
    }

    return hooks
  }

  private buildRationale(
    commands: CommandRecommendation[],
    skills: SkillRecommendation[],
    mcps: MCPRecommendation[],
    hooks: HookRecommendation[],
    _keywords: string[],
  ): string[] {
    const rationale: string[] = []

    rationale.push(`${commands.length} commands cover core workflow`)
    if (mcps.length > 0 && mcps[0]) {
      rationale.push(`${mcps[0].system} integration essential for requirements`)
    }
    if (hooks.length > 0) {
      rationale.push(`Hooks automate repetitive tasks`)
    }
    if (skills.length > 0) {
      rationale.push(`Skills reduce friction with auto-suggestions`)
    }

    return rationale
  }

  private generateAlternatives(_domain: string, _commands: CommandRecommendation[]): Alternative[] {
    return [
      {
        approach: 'Single monolithic command',
        pros: ['Simple to build', 'One command to learn'],
        cons: ['Hard to test', 'Does too much', 'Not composable'],
        rejected: true,
        reason: 'Violates single responsibility',
      },
      {
        approach: 'Separate focused domain',
        pros: ['Clear boundaries', 'Testable', 'Composable'],
        cons: ['More commands to build'],
        rejected: false,
        reason: 'Best practices, maintainable',
      },
    ]
  }

  private buildImplementationPlan(
    commands: CommandRecommendation[],
    skills: SkillRecommendation[],
    mcps: MCPRecommendation[],
    hooks: HookRecommendation[],
  ): ImplementationPlan {
    const phases: Phase[] = [
      {
        name: 'Core Setup',
        steps: [
          `/design:domain ${this.suggestDomainName('', [])}`,
          `Add ${commands.length} operations`,
          `/scaffold:domain ${this.suggestDomainName('', [])}`,
        ],
        duration: '2 hours',
      },
    ]

    if (mcps.length > 0 || hooks.length > 0) {
      phases.push({
        name: 'Integrations',
        steps: [...mcps, ...hooks].map((i) => `Configure ${'name' in i ? i.name : i.event}`),
        duration: '1 hour',
      })
    }

    if (skills.length > 0) {
      phases.push({
        name: 'Polish',
        steps: ['Add auto-discovery skill', 'Test all commands', 'Package as plugin'],
        duration: '30 minutes',
      })
    }

    const totalHours = phases.reduce((sum, p) => {
      const hours = parseFloat(p.duration)
      return sum + (isNaN(hours) ? 0.5 : hours)
    }, 0)

    return {
      phases,
      totalEffort: `~${totalHours} hours`,
      complexity: commands.length > 5 ? 'Medium' : 'Low',
    }
  }

  private calculateConfidence(patterns: ArchitecturePattern[], _keywords: string[]): number {
    if (patterns.length === 0) return 0.3
    const avgConfidence =
      patterns.reduce((sum, p) => sum + (p.confidence || 0), 0) / patterns.length
    return Math.round(avgConfidence * 100)
  }

  /**
   * Scan domain for components (commands, skills, MCPs, hooks)
   * @param domainName - Name of domain to scan (unused for global resources)
   * @returns Current state with component counts
   */
  private scanDomain(domainName: string): CurrentState {
    // Scan commands in the domain directory
    const commandsDir = path.join(this.basePath, '.claude/commands', domainName)
    const commands = fs.existsSync(commandsDir)
      ? fs.readdirSync(commandsDir).filter((f) => f.endsWith('.md')).length
      : 0

    // Scan skills (global, not domain-specific)
    const skillsDir = path.join(this.basePath, '.claude/skills')
    const skills = fs.existsSync(skillsDir)
      ? fs.readdirSync(skillsDir).filter((f) => {
          const skillPath = path.join(skillsDir, f)
          return fs.statSync(skillPath).isDirectory()
        }).length
      : 0

    // Scan MCPs (global, not domain-specific)
    const mcpsDir = path.join(this.basePath, '.claude/mcp')
    const mcps = fs.existsSync(mcpsDir)
      ? fs.readdirSync(mcpsDir).filter((f) => {
          const mcpPath = path.join(mcpsDir, f)
          return fs.statSync(mcpPath).isDirectory()
        }).length
      : 0

    // Scan hooks (global, not domain-specific)
    const hooksDir = path.join(this.basePath, '.claude/hooks')
    const hooks = fs.existsSync(hooksDir)
      ? fs.readdirSync(hooksDir).filter((f) => f.endsWith('.sh') || f.endsWith('.js')).length
      : 0

    return {
      commands,
      skills,
      mcps,
      hooks,
      complexity: 5.0, // Would calculate based on metrics
      cohesion: 7.0, // Would calculate based on relationships
    }
  }

  /**
   * Identify architectural strengths in a domain
   * @param domainName - Name of domain being analyzed (unused, kept for API compatibility)
   * @param current - Current state metrics
   * @returns Array of identified strengths
   */
  private identifyStrengths(domainName: string, current: CurrentState): string[] {
    const strengths: string[] = []

    // Good command count indicates clear single responsibility
    if (current.commands > 0 && current.commands <= DOMAIN_LIMITS.MAX_COMMANDS_SINGLE_CONCERN) {
      strengths.push('Clear single responsibility')
    }
    // High cohesion indicates good design
    if (current.cohesion > DOMAIN_LIMITS.HIGH_COHESION_THRESHOLD) {
      strengths.push('High cohesion - components work well together')
    }

    return strengths
  }

  /**
   * Identify architectural issues in a domain
   * @param domainName - Name of domain being analyzed (unused, kept for API compatibility)
   * @param current - Current state metrics
   * @returns Array of identified issues with recommendations
   */
  private identifyIssues(domainName: string, current: CurrentState): Issue[] {
    const issues: Issue[] = []

    // High command count suggests multiple concerns
    if (current.commands > DOMAIN_LIMITS.HIGH_COMMAND_THRESHOLD) {
      issues.push({
        title: 'High Command Count',
        problem: `${current.commands} commands may indicate multiple concerns`,
        recommendation: 'Consider splitting domain',
        effort: '2 hours',
        impact: 'Better modularity',
      })
    }

    return issues
  }

  private generateRecommendations(issues: Issue[]): Recommendation[] {
    return issues.map((issue, i) => ({
      priority: i + 1,
      action: issue.recommendation,
      reason: issue.problem,
      effort: issue.effort,
    }))
  }

  private buildRefactoringRoadmap(issues: Issue[]): RefactoringPhase[] {
    if (issues.length === 0) return []

    return [
      {
        name: 'Quick Wins',
        tasks: issues
          .filter((i) => i.effort.includes('hour') || i.effort.includes('30 min'))
          .map((i) => i.recommendation),
        duration: '2 hours',
        impact: 'Immediate improvements',
      },
    ]
  }

  private calculateMetrics(domainName: string, current: CurrentState): Metrics {
    return {
      complexity: current.complexity,
      cohesion: current.cohesion,
      testCoverage: 0,
    }
  }

  private analyzeComponent(component: string): ComponentState {
    return {
      name: component,
      lines: 100,
      complexity: 4.0,
      dependencies: [],
    }
  }

  private detectComponentIssues(_component: string, _state: ComponentState): Issue[] {
    return []
  }

  private generateRefactoringOptions(_component: string, _issues: Issue[]): RefactoringOption[] {
    return []
  }

  private selectBestOption(options: RefactoringOption[]): RefactoringOption {
    return (
      options[0] || {
        name: 'No change',
        description: 'Keep as is',
        pros: [],
        cons: [],
        effort: '0',
        breaking: false,
      }
    )
  }

  private buildMigrationStrategy(
    _component: string,
    _option: RefactoringOption,
  ): MigrationStrategy {
    return {
      steps: ['Create backup', 'Apply changes', 'Test'],
      rollback: 'git revert',
    }
  }

  private buildImplementationChecklist(
    component: string,
    option: RefactoringOption,
  ): ImplementationChecklist {
    return {
      phases: [
        {
          name: 'Implementation',
          duration: option.effort,
          tasks: ['Apply refactoring', 'Test changes'],
        },
      ],
      total: option.effort,
      risk: option.breaking ? 'Medium' : 'Low',
    }
  }

  private formatRecommendation(rec: ArchitectureRecommendation): string {
    let output = chalk.blue(`\n🤖 Architecture Decision: "${rec.description}"\n\n`)
    output += chalk.bold('━'.repeat(60)) + '\n'
    output += chalk.bold('📊 RECOMMENDED STRUCTURE\n')
    output += chalk.bold('━'.repeat(60)) + '\n\n'

    output += chalk.cyan(`Domain: ${rec.domain}\n\n`)

    output += chalk.bold(`Commands (${rec.commands.length}):\n`)
    rec.commands.forEach((cmd) => {
      output += `  /${rec.domain}:${cmd.name.padEnd(20)} ${cmd.description}\n`
    })

    if (rec.skills && rec.skills.length > 0) {
      output += `\n${chalk.bold('Skills (1):')}\n`
      rec.skills.forEach((skill) => {
        output += `  ${skill.name.padEnd(20)} ${skill.purpose}\n`
      })
    }

    output += chalk.bold('\n━'.repeat(60)) + '\n'
    output += chalk.bold('💡 NEXT STEPS\n')
    output += chalk.bold('━'.repeat(60)) + '\n\n'
    output += `Ready to build?\n  ${chalk.cyan(`/design:domain ${rec.domain}`)}\n`

    return output
  }

  private formatAnalysis(analysis: DomainAnalysis, _options: Record<string, unknown>): string {
    let output = chalk.blue(`\n🔍 Architecture Analysis: ${analysis.domain} domain\n\n`)

    output += chalk.bold('Current Structure:\n')
    output += `  Commands: ${analysis.current.commands}\n`
    output += `  Skills: ${analysis.current.skills}\n`
    output += `  Complexity: ${analysis.current.complexity}/10\n\n`

    if (analysis.strengths.length > 0) {
      output += chalk.green('✅ Strengths:\n')
      analysis.strengths.forEach((s) => (output += `  • ${s}\n`))
    }

    return output
  }

  private formatRefactoringPlan(plan: RefactoringPlan): string {
    return (
      chalk.blue(`\n🔧 Refactoring Plan: ${plan.component}\n\n`) +
      `Current state analyzed.\n` +
      `Recommendation: ${plan.recommendation.name}\n`
    )
  }

  /**
   * Format deep analysis result for CLI output
   * @param analysis - Deep analysis result to format
   * @returns Formatted string with clear sections for components, issues, and strategies
   */
  private formatDeepAnalysis(analysis: DeepAnalysisResult): string {
    let output = chalk.blue(`\n🔬 Deep Architecture Analysis: ${analysis.domain}\n\n`)
    output += chalk.bold('━'.repeat(60)) + '\n'

    // Section 1: Component Metrics
    output += chalk.cyan('📊 COMPONENT METRICS\n')
    output += chalk.bold('━'.repeat(60)) + '\n\n'

    if (analysis.deepAnalysis.components.length === 0) {
      output += chalk.yellow('⚠️  No TypeScript files found in domain\n\n')
    } else {
      output += chalk.green(
        `✅ Analyzed ${analysis.deepAnalysis.components.length} component(s)\n\n`,
      )
      analysis.deepAnalysis.components.forEach((component: RealComponentMetrics) => {
        output += chalk.bold(`  📄 ${component.name}\n`)
        output += `     Complexity: ${component.complexity.toFixed(1)}\n`
        output += `     JSDoc Coverage: ${component.jsdocCoverage}%\n`
        output += `     Functions: ${component.functions.length}\n`
        output += `     Dependencies: ${component.dependencies.length}\n`
        if (component.codeSmells.length > 0) {
          output += `     Code Smells: ${component.codeSmells.length}\n`
        }
        output += '\n'
      })
    }

    // Section 2: Architectural Issues
    output += chalk.cyan('🔍 ARCHITECTURAL ISSUES\n')
    output += chalk.bold('━'.repeat(60)) + '\n\n'

    if (analysis.deepAnalysis.issues.length === 0) {
      output += chalk.green('✅ No architectural issues detected\n\n')
    } else {
      output += chalk.yellow(`⚠️  Found ${analysis.deepAnalysis.issues.length} issue(s)\n\n`)

      analysis.deepAnalysis.issues.forEach((issue: RealArchitecturalIssue) => {
        const severityColor: Record<string, typeof chalk.red> = {
          critical: chalk.red,
          high: chalk.red,
          medium: chalk.yellow,
          low: chalk.blue,
        }
        const color = severityColor[issue.severity] || chalk.gray

        output += color(`  [${issue.severity.toUpperCase()}] ${issue.title}\n`)
        output += `           ${issue.description}\n`
        output += `           Evidence: ${issue.evidence}\n`
        if (issue.impact.length > 0) {
          output += `           Impact: ${issue.impact.join(', ')}\n`
        }
        output += '\n'
      })
    }

    // Section 3: Refactoring Strategies
    output += chalk.cyan('🔧 REFACTORING STRATEGIES\n')
    output += chalk.bold('━'.repeat(60)) + '\n\n'

    if (analysis.refactoringStrategies.length === 0) {
      output += chalk.green('✅ No refactoring needed\n\n')
    } else {
      analysis.refactoringStrategies.forEach((strategy) => {
        if (strategy.options.length > 0) {
          output += chalk.bold(`\n  📋 For: ${strategy.issue.title}\n`)
          strategy.options.forEach((option, idx) => {
            const isRecommended =
              strategy.recommendedOption && option.name === strategy.recommendedOption.name
                ? ' ⭐ RECOMMENDED'
                : ''
            output += `     ${idx + 1}. ${option.name}${isRecommended}\n`
            output += `        Effort: ${option.effort} | Risk: ${option.riskLevel}\n`
            output += `        ${option.description}\n`
          })
          output += '\n'
        }
      })
    }

    // Section 4: Summary
    output += chalk.cyan('📈 SUMMARY\n')
    output += chalk.bold('━'.repeat(60)) + '\n\n'
    output += `  Total Components:       ${analysis.summary.totalComponents}\n`
    output += `  Total Issues:           ${analysis.summary.totalIssues}\n`
    output += `  Critical Issues:        ${analysis.summary.criticalIssues}\n`
    output += `  Refactoring Options:    ${analysis.summary.totalRefactoringOptions}\n`
    output += '\n'

    return output
  }

  private getDefaultPatterns(): Record<string, ArchitecturePattern> {
    return {
      'task-management': {
        name: 'task-management',
        keywords: ['task', 'todo', 'work', 'manage', 'track'],
        commands: ['next', 'list', 'create', 'complete'],
      },
      crud: {
        name: 'crud',
        keywords: ['create', 'read', 'update', 'delete', 'manage'],
        commands: ['create', 'read', 'update', 'delete', 'list'],
      },
    }
  }
}
