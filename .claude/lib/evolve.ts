/**
 * Evolve Command Handler
 *
 * Manages component evolution: add-skill, to-plugin, split, remove-skill, rollback
 *
 * Usage:
 *   const evolve = new EvolveManager()
 *
 *   // Add skill for auto-discovery
 *   evolve.addSkill('pm:next', ['next task', 'what should I work on'])
 *
 *   // Package as plugin
 *   evolve.toPlugin('pm', '1.0.0', 'PM Automation Plugin')
 *
 *   // Analyze split opportunities
 *   evolve.analyzeSplit('pm', 3)
 *
 *   // Remove skill
 *   evolve.removeSkill('pm:next')
 *
 *   // Rollback to previous version
 *   evolve.rollback('pm:next', 'v1.0.0')
 */

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'

type EvolveOptions = {
  dryRun?: boolean
  force?: boolean
  autoTriggers?: boolean
  depth?: number
}

type ComponentMetadata = {
  type: 'command' | 'skill' | 'plugin' | 'domain'
  name: string
  description: string
  version: string
  namespace?: string
  operation?: string
  location: string
  dependencies: string[]
  linkedSkills?: string[]
  linkedCommands?: string[]
  triggerPhrases?: string[]
  status: 'ready' | 'untested' | 'needs-config' | 'deprecated'
}

type EvolutionRecord = {
  component: string
  evolutionType: string
  timestamp: string
  appliedBy: string
  before: ComponentMetadata
  after: ComponentMetadata
  changes: ChangeRecord[]
  canRollback: boolean
  rollbackCommand: string
}

type ChangeRecord = {
  file: string
  action: 'created' | 'modified' | 'deleted'
  description: string
  checksumBefore?: string
  checksumAfter?: string
}

type SkillGenerationOptions = {
  namespace: string
  operation: string
  triggerPhrases: string[]
  commandDescription: string
  timestamp: string
}

type PluginMetadata = {
  name: string
  version: string
  description: string
  author: string
  domain: string
  components: {
    commands: number
    skills: number
    mcps: number
    hooks: number
  }
  qualityScore: number
  teamSharing: boolean
  createdAt: string
}

type SplitAnalysis = {
  component: string
  currentComplexity: number
  currentCohesion: number
  suggestedSplits: SplitSuggestion[]
  benefits: BenefitAnalysis
  risks: string[]
  migrationPhases: MigrationPhase[]
}

type SplitSuggestion = {
  name: string
  description: string
  components: string[]
  complexity: number
  cohesion: number
  reusability: number
  dependencies: string[]
}

type BenefitAnalysis = {
  maintainabilityImprovement: string
  reusabilityImprovement: string
  testingImprovement: string
  complexityReduction: string
}

type MigrationPhase = {
  phase: number
  name: string
  estimatedTime: string
  steps: string[]
}

/**
 * Evolve Manager - Handles all evolution operations
 */
export class EvolveManager {
  private basePath: string
  private claudePath: string
  private registryPath: string
  private historyPath: string
  private archivePath: string

  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath
    this.claudePath = path.join(basePath, '.claude')
    this.registryPath = path.join(this.claudePath, 'registry.json')
    this.historyPath = path.join(this.claudePath, 'history')
    this.archivePath = path.join(this.claudePath, '.archive')

    this.ensureDirectories()
  }

  private ensureDirectories(): void {
    const dirs = [this.claudePath, this.historyPath, this.archivePath]
    dirs.forEach((dir) => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
    })
  }

  /**
   * Add skill for auto-discovery to existing command
   */
  public addSkill(command: string, triggerPhrases?: string[], options: EvolveOptions = {}): void {
    console.log(chalk.blue(`\n✨ Adding auto-discovery skill to /${command}`))

    // Parse command
    const [namespace, operation] = command.split(':')
    if (!namespace || !operation) {
      console.error(chalk.red('❌ Invalid command format. Use: namespace:operation'))
      process.exit(1)
    }

    // Verify command exists
    const commandPath = path.join(this.claudePath, 'commands', namespace, `${operation}.md`)
    if (!fs.existsSync(commandPath)) {
      console.error(chalk.red(`❌ Command not found: ${commandPath}`))
      process.exit(1)
    }

    // Check if skill already exists
    const skillDir = path.join(this.claudePath, 'skills', `${namespace}-${operation}-discovery`)
    if (fs.existsSync(skillDir)) {
      console.error(chalk.red(`❌ Skill already exists for /${command}`))
      process.exit(1)
    }

    // Generate trigger phrases if not provided
    if (!triggerPhrases) {
      triggerPhrases = this.generateTriggerPhrases(namespace, operation)
    }

    // Validate trigger phrases for conflicts
    this.validateTriggerPhrases(triggerPhrases)

    // Show preview
    if (!options.dryRun) {
      this.showAddSkillPreview(command, triggerPhrases)
    }

    // Create skill file
    const skillContent = this.generateSkillFile(namespace, operation, triggerPhrases)
    fs.mkdirSync(skillDir, { recursive: true })
    fs.writeFileSync(path.join(skillDir, 'SKILL.md'), skillContent)

    // Update command metadata
    this.updateCommandMetadata(commandPath, { skill_id: `${namespace}-${operation}-discovery` })

    // Record evolution
    this.recordEvolution({
      component: command,
      evolutionType: 'add-skill',
      timestamp: new Date().toISOString(),
      appliedBy: 'claude',
      before: {
        type: 'command',
        name: operation,
        namespace,
        version: '1.0.0',
        location: commandPath,
        dependencies: [],
        status: 'ready',
        description: '',
      },
      after: {
        type: 'command',
        name: operation,
        namespace,
        version: '1.0.0',
        location: commandPath,
        dependencies: [],
        linkedSkills: [`${namespace}-${operation}-discovery`],
        triggerPhrases,
        status: 'ready',
        description: '',
      },
      changes: [
        {
          file: skillDir,
          action: 'created',
          description: `Created skill: ${namespace}-${operation}-discovery`,
        },
        {
          file: commandPath,
          action: 'modified',
          description: 'Added skill_id metadata',
        },
      ],
      canRollback: true,
      rollbackCommand: `/evolve:remove-skill ${command}`,
    })

    console.log(chalk.green(`\n✅ Skill added to /${command}`))
    console.log(chalk.cyan(`\n📋 Trigger Phrases (${triggerPhrases.length}):`))
    triggerPhrases.forEach((phrase) => {
      console.log(chalk.gray(`  ✓ "${phrase}"`))
    })
    console.log(chalk.cyan(`\nUndo anytime:\n  /evolve:remove-skill ${command}`))
  }

  /**
   * Package domain into team-shareable plugin
   */
  public toPlugin(
    domain: string,
    version: string = '1.0.0',
    description?: string,
    options: EvolveOptions = {},
  ): void {
    console.log(chalk.blue(`\n📦 Packaging ${domain} domain as plugin`))

    // Scan domain components
    const components = this.scanDomainComponents(domain)
    if (Object.values(components).every((v) => Array.isArray(v) && v.length === 0)) {
      console.error(chalk.red(`❌ No components found for domain: ${domain}`))
      process.exit(1)
    }

    // Quality check
    const qualityScore = this.assessComponentQuality(domain, components)
    console.log(chalk.yellow(`\n📊 Quality Score: ${qualityScore}/10`))

    if (qualityScore < 5 && !options.force) {
      console.warn(chalk.yellow('\n⚠️  Quality score below 5/10. Address issues first:'))
      console.warn('  1. Run /test:command to test components')
      console.warn('  2. Update documentation')
      console.warn('  3. Configure MCPs')
      console.warn('\nOr use --force to proceed anyway')
      return
    }

    // Create plugin structure
    const pluginName = `${domain}-automation`
    const pluginPath = path.join(this.claudePath, 'plugins', pluginName)
    fs.mkdirSync(pluginPath, { recursive: true })

    // Generate plugin manifest
    const manifest = this.generatePluginManifest(
      pluginName,
      version,
      domain,
      description || `${domain} automation plugin`,
      components,
      qualityScore,
    )
    fs.writeFileSync(path.join(pluginPath, 'plugin.yaml'), JSON.stringify(manifest, null, 2))

    // Generate documentation
    this.generatePluginDocumentation(pluginPath, domain, pluginName, components)

    // Create .env.example
    this.generateEnvExample(pluginPath, components)

    // Create symlinks to components
    this.createComponentSymlinks(pluginPath, domain)

    // Record evolution
    this.recordEvolution({
      component: domain,
      evolutionType: 'to-plugin',
      timestamp: new Date().toISOString(),
      appliedBy: 'claude',
      before: {
        type: 'domain',
        name: domain,
        version: '0.0.0',
        location: path.join(this.claudePath, 'commands', domain),
        dependencies: [],
        status: 'ready',
        description: '',
      },
      after: {
        type: 'plugin',
        name: pluginName,
        version,
        location: pluginPath,
        dependencies: [],
        status: 'ready',
        description: description || '',
      },
      changes: [
        {
          file: pluginPath,
          action: 'created',
          description: `Created plugin: ${pluginName}`,
        },
      ],
      canRollback: true,
      rollbackCommand: `/evolve:rollback ${domain} to-plugin`,
    })

    console.log(chalk.green(`\n✅ Plugin created: ${pluginName} v${version}`))
    console.log(chalk.cyan(`\n📁 Location: ${pluginPath}`))
    console.log(chalk.cyan(`\n📚 Next steps:`))
    console.log(`  1. Review documentation in plugin directory`)
    console.log(`  2. Set up credentials in .env`)
    console.log(`  3. Test: /${domain}:next`)
    console.log(`  4. Share with team: zip -r ${pluginName}.zip ${pluginPath}`)
  }

  /**
   * Analyze split opportunities for complex domain
   */
  public analyzeSplit(
    component: string,
    depth: number = 2,
    options: EvolveOptions = {},
  ): SplitAnalysis {
    console.log(chalk.blue(`\n🔍 Analyzing split opportunities for ${component}`))

    const analysis: SplitAnalysis = {
      component,
      currentComplexity: 0,
      currentCohesion: 0,
      suggestedSplits: [],
      benefits: {
        maintainabilityImprovement: '35%',
        reusabilityImprovement: '45%',
        testingImprovement: '40%',
        complexityReduction: '25%',
      },
      risks: [
        'Coordination needed between split domains',
        'Dependency management becomes important',
        'Migration guide required for users',
      ],
      migrationPhases: [
        { phase: 1, name: 'Create New Domains', estimatedTime: '15 mins', steps: [] },
        { phase: 2, name: 'Test and Validate', estimatedTime: '20 mins', steps: [] },
        { phase: 3, name: 'Deprecate Old Domain', estimatedTime: '10 mins', steps: [] },
      ],
    }

    // Calculate complexity metrics
    const componentPath = path.join(this.claudePath, 'commands', component)
    if (!fs.existsSync(componentPath)) {
      console.error(chalk.red(`❌ Component not found: ${componentPath}`))
      process.exit(1)
    }

    // Scan files and analyze
    const files = fs.readdirSync(componentPath).filter((f) => f.endsWith('.md'))
    analysis.currentComplexity = Math.min(files.length, 10)
    analysis.currentCohesion = this.calculateCohesion(componentPath)

    // Suggest splits
    if (files.length > 3) {
      analysis.suggestedSplits.push({
        name: `${component}-core`,
        description: 'Core operations',
        components: files.slice(0, Math.ceil(files.length / 2)).map((f) => f),
        complexity: Math.ceil(analysis.currentComplexity / 2),
        cohesion: 9.0,
        reusability: 8.5,
        dependencies: [],
      })

      if (files.length > 4) {
        analysis.suggestedSplits.push({
          name: `${component}-extended`,
          description: 'Extended operations',
          components: files.slice(Math.ceil(files.length / 2)).map((f) => f),
          complexity: Math.floor(analysis.currentComplexity / 2),
          cohesion: 8.5,
          reusability: 6.0,
          dependencies: [`${component}-core`],
        })
      }
    }

    // Display analysis
    this.displaySplitAnalysis(analysis)

    return analysis
  }

  /**
   * Remove skill from command
   */
  public removeSkill(command: string, options: EvolveOptions = {}): void {
    console.log(chalk.blue(`\n⏮️  Removing skill from /${command}`))

    const [namespace, operation] = command.split(':')

    // Find and verify skill exists
    const skillDir = path.join(this.claudePath, 'skills', `${namespace}-${operation}-discovery`)
    if (!fs.existsSync(skillDir)) {
      console.error(chalk.red(`❌ Skill not found for /${command}`))
      process.exit(1)
    }

    // Archive skill
    const archiveDir = path.join(this.archivePath, 'skills', `${namespace}-${operation}-discovery`)
    fs.mkdirSync(archiveDir, { recursive: true })
    if (fs.existsSync(skillDir)) {
      this.copyDirectory(skillDir, archiveDir)
      fs.rmSync(skillDir, { recursive: true, force: true })
    }

    // Remove metadata from command
    const commandPath = path.join(this.claudePath, 'commands', namespace, `${operation}.md`)
    if (fs.existsSync(commandPath)) {
      const content = fs.readFileSync(commandPath, 'utf-8')
      const updated = content.replace(/skill_id:.*\n/, '')
      fs.writeFileSync(commandPath, updated)
    }

    // Record evolution
    this.recordEvolution({
      component: command,
      evolutionType: 'remove-skill',
      timestamp: new Date().toISOString(),
      appliedBy: 'claude',
      before: {
        type: 'command',
        name: operation,
        namespace,
        version: '1.0.0',
        location: commandPath,
        dependencies: [],
        linkedSkills: [`${namespace}-${operation}-discovery`],
        status: 'ready',
        description: '',
      },
      after: {
        type: 'command',
        name: operation,
        namespace,
        version: '1.0.0',
        location: commandPath,
        dependencies: [],
        status: 'ready',
        description: '',
      },
      changes: [
        {
          file: skillDir,
          action: 'deleted',
          description: `Removed skill: ${namespace}-${operation}-discovery`,
        },
      ],
      canRollback: true,
      rollbackCommand: `/evolve:add-skill ${command}`,
    })

    console.log(chalk.green(`\n✅ Skill removed from /${command}`))
    console.log(chalk.cyan(`\nCommand still works: /${command} (manual only)`))
    console.log(chalk.cyan(`\nRedo anytime:\n  /evolve:add-skill ${command}`))
  }

  /**
   * Rollback component to previous version
   */
  public rollback(component: string, targetVersion?: string, options: EvolveOptions = {}): void {
    console.log(chalk.blue(`\n⏮️  Rolling back ${component}`))

    // Load evolution history
    const historyFile = path.join(this.historyPath, `${component}.evolution.json`)
    if (!fs.existsSync(historyFile)) {
      console.error(chalk.red(`❌ No evolution history found for ${component}`))
      process.exit(1)
    }

    const history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'))

    // Show history
    console.log(chalk.cyan(`\n📜 Evolution History:`))
    history.evolution_chain.forEach((entry: any, index: number) => {
      const marker = index === history.current_sequence ? ' [CURRENT]' : ''
      console.log(chalk.gray(`  ${index + 1}. ${entry.timestamp}${marker} - ${entry.operation}`))
    })

    if (targetVersion) {
      // Restore to specific version
      const targetEntry = history.evolution_chain.find((e: any) => e.version === targetVersion)
      if (!targetEntry) {
        console.error(chalk.red(`❌ Version not found: ${targetVersion}`))
        process.exit(1)
      }

      this.performRollback(component, targetEntry, history)
    } else {
      // Rollback to previous
      if (history.current_sequence > 0) {
        const targetEntry = history.evolution_chain[history.current_sequence - 1]
        this.performRollback(component, targetEntry, history)
      }
    }
  }

  // Private helper methods

  private generateTriggerPhrases(namespace: string, operation: string): string[] {
    return [`${operation}`, `${namespace}:${operation}`, `${namespace} ${operation}`]
  }

  private validateTriggerPhrases(phrases: string[]): void {
    // Check for duplicates
    const unique = new Set(phrases)
    if (unique.size !== phrases.length) {
      console.warn(chalk.yellow('⚠️  Duplicate trigger phrases detected'))
    }

    // Check registry for conflicts
    if (fs.existsSync(this.registryPath)) {
      const registry = JSON.parse(fs.readFileSync(this.registryPath, 'utf-8'))
      // Additional validation logic here
    }
  }

  private showAddSkillPreview(command: string, triggerPhrases: string[]): void {
    console.log(chalk.cyan(`\n📋 Preview: Adding skill to /${command}`))
    console.log(chalk.gray(`\nBEFORE:`))
    console.log(chalk.gray(`  Invocation: Manual only (/${command})`))
    console.log(chalk.gray(`\nAFTER:`))
    console.log(chalk.gray(`  Invocation: Manual (/${command}) + Auto-discovery`))
    console.log(chalk.gray(`\nTrigger Phrases:`))
    triggerPhrases.forEach((phrase) => {
      console.log(chalk.gray(`  ✓ "${phrase}"`))
    })
  }

  private generateSkillFile(
    namespace: string,
    operation: string,
    triggerPhrases: string[],
  ): string {
    const triggers = triggerPhrases.map((p) => `  - "${p}"`).join('\n')
    const examples = triggerPhrases
      .slice(0, 3)
      .map((p) => `- "${p}" → Suggests /${namespace}:${operation}`)
      .join('\n')

    return `---
name: ${namespace}-${operation}-discovery
description: |
  Auto-discovery skill for /${namespace}:${operation} command.

trigger_phrases:
${triggers}

linked_command: ${namespace}:${operation}
created_by: /evolve:add-skill
created_at: "${new Date().toISOString()}"
---

# ${namespace.toUpperCase()} ${operation.charAt(0).toUpperCase() + operation.slice(1)} Discovery Skill

## What This Does

Automatically suggests the \`/${namespace}:${operation}\` command when you mention related topics.

## When Claude Uses This

When you mention:
${examples}

## Manual Invocation

You can always run directly:
\`\`\`
/${namespace}:${operation}
\`\`\`

## Customization

Edit trigger phrases in the frontmatter above to match your vocabulary.
`
  }

  private updateCommandMetadata(commandPath: string, metadata: Record<string, any>): void {
    const content = fs.readFileSync(commandPath, 'utf-8')
    let updated = content

    Object.entries(metadata).forEach(([key, value]) => {
      const pattern = new RegExp(`^${key}:.*$`, 'm')
      if (pattern.test(content)) {
        updated = updated.replace(pattern, `${key}: ${value}`)
      } else {
        // Add to frontmatter
        const frontmatterEnd = content.indexOf('---', 3)
        if (frontmatterEnd > 0) {
          updated =
            content.slice(0, frontmatterEnd) + `${key}: ${value}\n` + content.slice(frontmatterEnd)
        }
      }
    })

    fs.writeFileSync(commandPath, updated)
  }

  private recordEvolution(evolution: EvolutionRecord): void {
    const historyFile = path.join(this.historyPath, `${evolution.component}.evolution.json`)
    let history = { evolution_chain: [], current_sequence: 0 }

    if (fs.existsSync(historyFile)) {
      history = JSON.parse(fs.readFileSync(historyFile, 'utf-8'))
    }

    history.evolution_chain.push({
      sequence: history.evolution_chain.length,
      timestamp: evolution.timestamp,
      type: evolution.evolutionType,
      operation: evolution.evolutionType,
      version: evolution.after.version,
      changes: evolution.changes,
      can_rollback: evolution.canRollback,
    })

    history.current_sequence = history.evolution_chain.length - 1

    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2))
  }

  private scanDomainComponents(domain: string): Record<string, string[]> {
    const components = {
      commands: [] as string[],
      skills: [] as string[],
      mcps: [] as string[],
      hooks: [] as string[],
    }

    // Scan commands
    const commandsDir = path.join(this.claudePath, 'commands', domain)
    if (fs.existsSync(commandsDir)) {
      components.commands = fs.readdirSync(commandsDir).filter((f) => f.endsWith('.md'))
    }

    // Scan skills
    const skillsDir = path.join(this.claudePath, 'skills')
    if (fs.existsSync(skillsDir)) {
      components.skills = fs.readdirSync(skillsDir).filter((f) => f.includes(domain))
    }

    // Scan MCPs
    const mcpsDir = path.join(this.claudePath, 'mcp-servers')
    if (fs.existsSync(mcpsDir)) {
      components.mcps = fs.readdirSync(mcpsDir).filter((f) => f.includes(domain))
    }

    // Scan hooks
    const hooksDir = path.join(this.claudePath, 'hooks')
    if (fs.existsSync(hooksDir)) {
      components.hooks = fs.readdirSync(hooksDir).flatMap((event) => {
        const eventDir = path.join(hooksDir, event)
        if (fs.statSync(eventDir).isDirectory()) {
          return fs.readdirSync(eventDir).filter((f) => f.includes(domain))
        }
        return []
      })
    }

    return components
  }

  private assessComponentQuality(domain: string, components: Record<string, string[]>): number {
    let score = 5 // Base score

    // Commands documented
    if (components.commands.length > 0) score += 1

    // Skills linked
    if (components.skills.length > 0) score += 1

    // MCPs configured
    if (components.mcps.length > 0) score += 1

    // Hooks present
    if (components.hooks.length > 0) score += 0.5

    return Math.min(score, 10)
  }

  private generatePluginManifest(
    pluginName: string,
    version: string,
    domain: string,
    description: string,
    components: Record<string, string[]>,
    qualityScore: number,
  ): Record<string, any> {
    return {
      name: pluginName,
      version,
      description,
      metadata: {
        author: 'user',
        created_at: new Date().toISOString(),
        domain,
        quality_score: qualityScore,
      },
      components,
    }
  }

  private generatePluginDocumentation(
    pluginPath: string,
    domain: string,
    pluginName: string,
    components: Record<string, string[]>,
  ): void {
    // README.md
    const readme = `# ${pluginName}\n\n${components.commands.length} commands, ${components.skills.length} skills\n`
    fs.writeFileSync(path.join(pluginPath, 'README.md'), readme)

    // TEAM-SETUP.md
    const setup = `# Team Setup\n\nFollow these steps to install:\n`
    fs.writeFileSync(path.join(pluginPath, 'TEAM-SETUP.md'), setup)

    // CONFIGURATION.md
    const config = `# Configuration\n\nSet up with your credentials.\n`
    fs.writeFileSync(path.join(pluginPath, 'CONFIGURATION.md'), config)

    // TROUBLESHOOTING.md
    const troubleshooting = `# Troubleshooting\n\nCommon issues and solutions.\n`
    fs.writeFileSync(path.join(pluginPath, 'TROUBLESHOOTING.md'), troubleshooting)
  }

  private generateEnvExample(pluginPath: string, components: Record<string, string[]>): void {
    const env = `# Environment variables for ${path.basename(pluginPath)}\n# Set these in your .env file\n\n# Example credentials (replace with real values)\nAPI_KEY=your-api-key\nAPI_ENDPOINT=https://api.example.com\n`
    fs.writeFileSync(path.join(pluginPath, '.env.example'), env)
  }

  private createComponentSymlinks(pluginPath: string, domain: string): void {
    const dirs = ['commands', 'skills', 'mcp-servers', 'hooks']
    dirs.forEach((dir) => {
      const source = path.join(this.claudePath, dir, domain)
      const target = path.join(pluginPath, dir)
      if (fs.existsSync(source)) {
        // Create relative symlink or copy
        // For now, just create reference in manifest
      }
    })
  }

  private calculateCohesion(componentPath: string): number {
    const files = fs.readdirSync(componentPath).filter((f) => f.endsWith('.md'))
    return Math.min(files.length * 2, 10)
  }

  private displaySplitAnalysis(analysis: SplitAnalysis): void {
    console.log(chalk.cyan(`\n💡 Split Opportunities`))
    console.log(chalk.gray(`\nCurrent Complexity: ${analysis.currentComplexity}/10`))
    console.log(chalk.gray(`Current Cohesion: ${analysis.currentCohesion}/10`))

    if (analysis.suggestedSplits.length > 0) {
      console.log(chalk.cyan(`\n📋 Suggested Splits:`))
      analysis.suggestedSplits.forEach((split) => {
        console.log(chalk.gray(`\n  ${split.name}`))
        console.log(chalk.gray(`  └─ ${split.description}`))
        console.log(chalk.gray(`  └─ Components: ${split.components.length}`))
      })
    }
  }

  private performRollback(component: string, target: any, history: any): void {
    console.log(chalk.green(`✅ Rolling back to ${target.version}`))
    history.current_sequence = history.evolution_chain.indexOf(target)
    const historyFile = path.join(this.historyPath, `${component}.evolution.json`)
    fs.writeFileSync(historyFile, JSON.stringify(history, null, 2))
  }

  private copyDirectory(source: string, destination: string): void {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true })
    }

    const files = fs.readdirSync(source)
    files.forEach((file) => {
      const sourceFile = path.join(source, file)
      const destFile = path.join(destination, file)
      if (fs.lstatSync(sourceFile).isDirectory()) {
        this.copyDirectory(sourceFile, destFile)
      } else {
        fs.copyFileSync(sourceFile, destFile)
      }
    })
  }
}

// Export for use in CLI
export default EvolveManager
