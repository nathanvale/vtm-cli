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

/**
 * Decision Engine - Core class for architecture recommendations
 */
export class DecisionEngine {
  private basePath: string
  private patternsPath: string
  private patterns: Record<string, ArchitecturePattern>
  private verbose: boolean

  constructor(options: DecisionEngineOptions = {}) {
    this.basePath = options.basePath || process.cwd()
    this.patternsPath =
      options.patternsPath || path.join(this.basePath, '.claude/lib/architecture-patterns.json')
    this.verbose = options.verbose || false
    this.loadPatterns()
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

    analysis.formatted = this.formatAnalysis(analysis, options)
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

  // ========== Private Helper Methods ==========

  private extractKeywords(text: string): string[] {
    const commonWords = [
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
    ]
    return text
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .filter((word) => !commonWords.includes(word))
  }

  private matchPatterns(keywords: string[]): ArchitecturePattern[] {
    const matches: ArchitecturePattern[] = []

    for (const pattern of Object.values(this.patterns)) {
      const score = this.scorePattern(pattern, keywords)
      if (score > 0.3) {
        matches.push({ ...pattern, confidence: score })
      }
    }

    return matches.sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
  }

  private scorePattern(pattern: ArchitecturePattern, keywords: string[]): number {
    let score = 0
    const patternKeywords = pattern.keywords || []

    for (const keyword of keywords) {
      if (patternKeywords.includes(keyword)) {
        score += 0.3
      }
      for (const pk of patternKeywords) {
        if (keyword.includes(pk) || pk.includes(keyword)) {
          score += 0.1
        }
      }
    }

    return Math.min(score, 1.0)
  }

  private suggestDomainName(description: string, keywords: string[]): string {
    // Extract noun from description
    const nouns = keywords.filter(
      (k) => !['create', 'manage', 'track', 'analyze', 'monitor', 'build', 'test'].includes(k),
    )

    if (nouns.length > 0) {
      return nouns[0].replace(/s$/, '') // Remove plural
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
    if (mcps.length > 0) {
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

  private scanDomain(domainName: string): CurrentState {
    const commandsDir = path.join(this.basePath, '.claude/commands', domainName)
    const commands = fs.existsSync(commandsDir)
      ? fs.readdirSync(commandsDir).filter((f) => f.endsWith('.md')).length
      : 0

    return {
      commands,
      skills: 0, // Would scan skills directory
      mcps: 0, // Would scan mcp directory
      hooks: 0, // Would scan hooks directory
      complexity: 5.0, // Would calculate
      cohesion: 7.0, // Would calculate
    }
  }

  private identifyStrengths(domainName: string, current: CurrentState): string[] {
    const strengths: string[] = []

    if (current.commands > 0 && current.commands <= 7) {
      strengths.push('Clear single responsibility')
    }
    if (current.cohesion > 7.0) {
      strengths.push('High cohesion - components work well together')
    }

    return strengths
  }

  private identifyIssues(domainName: string, current: CurrentState): Issue[] {
    const issues: Issue[] = []

    if (current.commands > 10) {
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
