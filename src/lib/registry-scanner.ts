import * as fs from 'fs'
import * as path from 'path'

/**
 * Registry Scanner - Discovers and indexes all components in .claude/ directory
 *
 * Scans for:
 * - Commands (*.md in commands/)
 * - Skills (SKILL.md files)
 * - MCP Servers (mcp.json files)
 * - Hooks (*.sh in hooks/)
 * - Agents (*.yaml in agents/)
 * - Plugins (plugin.yaml files)
 *
 * Generates registry.json with complete component index and analyzes relationships.
 */

type ComponentMetadata = {
  id: string
  type: 'command' | 'skill' | 'mcp_server' | 'hook' | 'agent' | 'plugin'
  name: string
  description: string
  version: string
  location: string
  namespace?: string | undefined
  tags: string[]
  trigger_phrases?: string[]
  dependencies: string[]
  used_by: string[]
  quality: {
    documented: boolean
    tested: boolean
    security_reviewed: boolean
    implementation_complete: boolean
    issues: string[]
  }
}

type ComponentRelationship = {
  depends_on: string[]
  used_by: string[]
}

type RegistryHealth = {
  missing_implementations: number
  unused_components: number
  circular_dependencies: number
  quality_issues: string[]
  summary: string
}

type Registry = {
  timestamp: string
  scan_version: string
  total_components: number
  by_type: {
    commands: number
    skills: number
    mcp_servers: number
    hooks: number
    agents: number
    plugins: number
  }
  components: ComponentMetadata[]
  relationships: Record<string, ComponentRelationship>
  health: RegistryHealth
}

type FrontmatterData = {
  name?: string
  description?: string
  version?: string
  namespace?: string
  tags?: string[]
  trigger_phrases?: string[]
  dependencies?: string[]
  tools?: string[]
  components?: Record<string, unknown>
}

export class RegistryScanner {
  private claudeDir: string
  private components: Map<string, ComponentMetadata> = new Map()
  private relationships: Map<string, ComponentRelationship> = new Map()
  private qualityIssues: string[] = []

  constructor(claudeDir: string = '.claude') {
    this.claudeDir = claudeDir
  }

  /**
   * Main scan method - discovers and indexes all components
   */
  async scan(): Promise<Registry> {
    this.components.clear()
    this.relationships.clear()
    this.qualityIssues = []

    // Discover components
    await this.scanCommands()
    await this.scanSkills()
    await this.scanMCPServers()
    await this.scanHooks()
    await this.scanAgents()
    await this.scanPlugins()

    // Analyze relationships
    this.analyzeRelationships()

    // Check for quality issues
    this.identifyQualityIssues()

    // Generate registry
    return this.generateRegistry()
  }

  /**
   * Scan for commands (*.md files in commands/)
   */
  private async scanCommands(): Promise<void> {
    const commandsDir = path.join(this.claudeDir, 'commands')
    if (!fs.existsSync(commandsDir)) return

    const files = this.findFilesRecursive(commandsDir, /\.md$/)

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8')
      const metadata = this.parseFrontmatter(content)

      const commandName = (metadata.name as string) || this.extractCommandName(file)
      const relativePath = path.relative(this.claudeDir, file)
      const namespace = this.extractNamespace(file, 'commands')
      const id =
        metadata.namespace || namespace
          ? `${(metadata.namespace as string) || namespace}:${this.extractBaseName(file)}`
          : commandName

      const namespaceValue = (metadata.namespace as string) || namespace
      const component: ComponentMetadata = {
        id,
        type: 'command',
        name: commandName,
        description: (metadata.description as string) || 'Command',
        version: (metadata.version as string) || '0.0.0',
        location: relativePath,
        namespace: namespaceValue,
        tags: (metadata.tags as string[]) || [],
        dependencies: (metadata.dependencies as string[]) || [],
        used_by: [],
        quality: {
          documented: content.length > 50,
          tested: false,
          security_reviewed: false,
          implementation_complete: !this.hasStubContent(content),
          issues: [],
        },
      }

      this.components.set(id, component)
    }
  }

  /**
   * Scan for skills (SKILL.md files)
   */
  private async scanSkills(): Promise<void> {
    const skillsDir = path.join(this.claudeDir, 'skills')
    if (!fs.existsSync(skillsDir)) return

    const files = this.findFilesRecursive(skillsDir, /SKILL\.md$/)

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8')
      const metadata = this.parseFrontmatter(content)

      const relativePath = path.relative(this.claudeDir, file)
      const skillName = (metadata.name as string) || this.extractBaseName(path.dirname(file))

      const component: ComponentMetadata = {
        id: skillName,
        type: 'skill',
        name: skillName,
        description: (metadata.description as string) || 'Skill',
        version: (metadata.version as string) || '0.0.0',
        location: relativePath,
        tags: (metadata.tags as string[]) || [],
        trigger_phrases: (metadata.trigger_phrases as string[]) || [],
        dependencies: (metadata.dependencies as string[]) || [],
        used_by: [],
        quality: {
          documented: content.length > 50,
          tested: false,
          security_reviewed: false,
          implementation_complete: true,
          issues: [],
        },
      }

      this.components.set(skillName, component)
    }
  }

  /**
   * Scan for MCP servers (mcp.json files)
   */
  private async scanMCPServers(): Promise<void> {
    const mcpDir = path.join(this.claudeDir, 'mcp-servers')
    if (!fs.existsSync(mcpDir)) return

    const files = this.findFilesRecursive(mcpDir, /mcp\.json$/)

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf-8')
        const config = JSON.parse(content) as Record<string, unknown>

        const relativePath = path.relative(this.claudeDir, file)
        const id = (config.name as string) || this.extractBaseName(path.dirname(file))

        const requiredConfig = (config.setup as Record<string, unknown>)?.required_env_vars
        const issues: string[] = []
        if (Array.isArray(requiredConfig) && requiredConfig.length > 0) {
          const missingConfig = requiredConfig.filter(
            (envVar: unknown) => typeof envVar === 'string' && !process.env[envVar],
          )
          if (missingConfig.length > 0) {
            issues.push(`Missing configuration: ${missingConfig.join(', ')}`)
          }
        }

        const component: ComponentMetadata = {
          id,
          type: 'mcp_server',
          name: (config.name as string) || id,
          description: (config.description as string) || 'MCP Server',
          version: (config.version as string) || '0.0.0',
          location: relativePath,
          tags: (config.tags as string[]) || [],
          dependencies: [],
          used_by: [],
          quality: {
            documented: Boolean(config.description),
            tested: false,
            security_reviewed: false,
            implementation_complete: Boolean(config.connection),
            issues,
          },
        }

        this.components.set(id, component)
      } catch {
        // Invalid JSON, skip
      }
    }
  }

  /**
   * Scan for hooks (*.sh files in hooks/)
   */
  private async scanHooks(): Promise<void> {
    const hooksDir = path.join(this.claudeDir, 'hooks')
    if (!fs.existsSync(hooksDir)) return

    const files = this.findFilesRecursive(hooksDir, /\.sh$/)

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8')
      const relativePath = path.relative(this.claudeDir, file)

      // Extract event type from path or comments
      const eventType = this.extractHookEvent(file, content)
      const description = this.extractHookDescription(content)

      const id = `hook:${eventType}:${path.basename(file, '.sh')}`

      const component: ComponentMetadata = {
        id,
        type: 'hook',
        name: path.basename(file, '.sh'),
        description: description || `${eventType} hook`,
        version: '0.0.0',
        location: relativePath,
        tags: [eventType],
        dependencies: [],
        used_by: [],
        quality: {
          documented: Boolean(description),
          tested: false,
          security_reviewed: false,
          implementation_complete: content.length > 20,
          issues: [],
        },
      }

      this.components.set(id, component)
    }
  }

  /**
   * Scan for agents (*.yaml or *.yml files in agents/)
   */
  private async scanAgents(): Promise<void> {
    const agentsDir = path.join(this.claudeDir, 'agents')
    if (!fs.existsSync(agentsDir)) return

    const files = this.findFilesRecursive(agentsDir, /\.(yaml|yml)$/)

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8')
      const metadata = this.parseFrontmatter(content)

      const relativePath = path.relative(this.claudeDir, file)
      const agentName = (metadata.name as string) || this.extractBaseName(file)

      const component: ComponentMetadata = {
        id: agentName,
        type: 'agent',
        name: agentName,
        description: (metadata.description as string) || 'Agent',
        version: (metadata.version as string) || '0.0.0',
        location: relativePath,
        tags: (metadata.tags as string[]) || [],
        dependencies: (metadata.tools as string[]) || [],
        used_by: [],
        quality: {
          documented: Boolean(metadata.description),
          tested: false,
          security_reviewed: false,
          implementation_complete: content.length > 50,
          issues: [],
        },
      }

      this.components.set(agentName, component)
    }
  }

  /**
   * Scan for plugins (plugin.yaml files)
   */
  private async scanPlugins(): Promise<void> {
    const pluginsDir = path.join(this.claudeDir, 'plugins')
    if (!fs.existsSync(pluginsDir)) return

    const files = this.findFilesRecursive(pluginsDir, /plugin\.yaml$/)

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8')
      const metadata = this.parseFrontmatter(content)

      const relativePath = path.relative(this.claudeDir, file)
      const pluginName = (metadata.name as string) || this.extractBaseName(path.dirname(file))

      // Extract component references
      const dependencies: string[] = []
      const componentRefs = metadata.components as Record<string, unknown>

      if (componentRefs?.commands) {
        const commands = componentRefs.commands
        if (Array.isArray(commands)) {
          commands.forEach((cmd: unknown) => {
            if (typeof cmd === 'string') {
              dependencies.push(cmd)
            } else if (typeof cmd === 'object' && cmd !== null && 'commands' in cmd) {
              const cmdObj = cmd as Record<string, unknown>
              const cmdList = cmdObj.commands as string[]
              if (Array.isArray(cmdList)) {
                dependencies.push(...cmdList)
              }
            }
          })
        }
      }

      if (componentRefs?.skills) {
        const skills = componentRefs.skills
        if (Array.isArray(skills)) {
          skills.forEach((skill: unknown) => {
            if (typeof skill === 'string') {
              dependencies.push(skill)
            } else if (typeof skill === 'object' && skill !== null && 'name' in skill) {
              const skillObj = skill as Record<string, unknown>
              const skillName = skillObj.name
              if (typeof skillName === 'string') {
                dependencies.push(skillName)
              }
            }
          })
        }
      }

      const component: ComponentMetadata = {
        id: pluginName,
        type: 'plugin',
        name: pluginName,
        description: (metadata.description as string) || 'Plugin',
        version: (metadata.version as string) || '0.0.0',
        location: relativePath,
        tags: (metadata.tags as string[]) || [],
        dependencies,
        used_by: [],
        quality: {
          documented: Boolean(metadata.description),
          tested: false,
          security_reviewed: false,
          implementation_complete: Boolean(metadata.components),
          issues: [],
        },
      }

      this.components.set(pluginName, component)
    }
  }

  /**
   * Analyze relationships between components
   */
  private analyzeRelationships(): void {
    this.components.forEach((component, id) => {
      // Initialize relationship for this component
      if (!this.relationships.has(id)) {
        this.relationships.set(id, {
          depends_on: [],
          used_by: [],
        })
      }

      // Set dependencies
      if (component.dependencies.length > 0) {
        const rel = this.relationships.get(id)
        if (rel) {
          rel.depends_on = component.dependencies
        }
      }

      // Update used_by for dependent components
      component.dependencies.forEach((dep) => {
        if (!this.relationships.has(dep)) {
          this.relationships.set(dep, {
            depends_on: [],
            used_by: [],
          })
        }
        const depRel = this.relationships.get(dep)
        if (depRel && !depRel.used_by.includes(id)) {
          depRel.used_by.push(id)
        }
      })
    })
  }

  /**
   * Identify quality issues
   */
  private identifyQualityIssues(): void {
    const issues: string[] = []

    this.components.forEach((component) => {
      if (!component.quality.documented) {
        issues.push(`${component.id} - Missing documentation`)
      }

      if (!component.quality.implementation_complete) {
        issues.push(`${component.id} - Incomplete implementation (has stubs/TODOs)`)
      }

      if (component.type === 'mcp_server' && component.quality.issues.length > 0) {
        issues.push(`${component.id} - ${component.quality.issues.join(', ')}`)
      }

      // Check for missing dependencies
      component.dependencies.forEach((dep) => {
        if (!this.components.has(dep)) {
          issues.push(`${component.id} - Missing dependency: ${dep}`)
        }
      })
    })

    // Check for circular dependencies
    const circularDeps = this.findCircularDependencies()
    if (circularDeps.length > 0) {
      issues.push(`Circular dependencies detected: ${circularDeps.join(', ')}`)
    }

    this.qualityIssues = issues
  }

  /**
   * Find circular dependencies
   */
  private findCircularDependencies(): string[] {
    const visited = new Set<string>()
    const circular: string[] = []

    const visit = (id: string, pathSet: Set<string>): boolean => {
      if (pathSet.has(id)) {
        circular.push(id)
        return true
      }

      if (visited.has(id)) {
        return false
      }

      pathSet.add(id)
      const component = this.components.get(id)

      if (component) {
        for (const dep of component.dependencies) {
          if (visit(dep, pathSet)) {
            return true
          }
        }
      }

      pathSet.delete(id)
      visited.add(id)
      return false
    }

    this.components.forEach((_, id) => {
      visit(id, new Set())
    })

    return circular
  }

  /**
   * Generate final registry
   */
  private generateRegistry(): Registry {
    const components = Array.from(this.components.values())
    const relationshipObj: Record<string, ComponentRelationship> = {}

    this.relationships.forEach((rel, id) => {
      relationshipObj[id] = rel
    })

    const byType = {
      commands: components.filter((c) => c.type === 'command').length,
      skills: components.filter((c) => c.type === 'skill').length,
      mcp_servers: components.filter((c) => c.type === 'mcp_server').length,
      hooks: components.filter((c) => c.type === 'hook').length,
      agents: components.filter((c) => c.type === 'agent').length,
      plugins: components.filter((c) => c.type === 'plugin').length,
    }

    const health: RegistryHealth = {
      missing_implementations: components.filter((c) => !c.quality.implementation_complete).length,
      unused_components: components.filter((c) => c.used_by.length === 0).length,
      circular_dependencies: this.findCircularDependencies().length,
      quality_issues: this.qualityIssues,
      summary: this.generateHealthSummary(components),
    }

    return {
      timestamp: new Date().toISOString(),
      scan_version: '1.0',
      total_components: components.length,
      by_type: byType,
      components,
      relationships: relationshipObj,
      health,
    }
  }

  /**
   * Generate health summary
   */
  private generateHealthSummary(components: ComponentMetadata[]): string {
    if (components.length === 0) {
      return 'No components found'
    }

    const allReady = components.every((c) => c.quality.implementation_complete)
    const allDocumented = components.every((c) => c.quality.documented)

    if (allReady && allDocumented && this.qualityIssues.length === 0) {
      return 'excellent'
    } else if (allReady) {
      return 'good'
    } else if (this.qualityIssues.length === 0) {
      return 'acceptable'
    } else {
      return 'needs_work'
    }
  }

  /**
   * Helper: Find files recursively matching pattern
   */
  private findFilesRecursive(dir: string, pattern: RegExp): string[] {
    const files: string[] = []

    const walk = (current: string) => {
      if (!fs.existsSync(current)) return

      const entries = fs.readdirSync(current)
      for (const entry of entries) {
        const fullPath = path.join(current, entry)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
          walk(fullPath)
        } else if (pattern.test(entry)) {
          files.push(fullPath)
        }
      }
    }

    walk(dir)
    return files
  }

  /**
   * Helper: Parse YAML/JSON frontmatter
   */
  private parseFrontmatter(content: string): FrontmatterData {
    const match = content.match(/^---\n([\s\S]*?)\n---/)
    if (!match || !match[1]) return {}

    const frontmatterText = match[1]
    const result: FrontmatterData = {}

    // Simple YAML/frontmatter parsing
    const lines = frontmatterText.split('\n')
    for (const line of lines) {
      const colonIndex = line.indexOf(':')
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim()
        let value: unknown = line.slice(colonIndex + 1).trim()

        // Handle quoted strings
        if (typeof value === 'string') {
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1)
          } else if (value.startsWith('[') && value.endsWith(']')) {
            // Handle arrays
            value = value
              .slice(1, -1)
              .split(',')
              .map((v) => v.trim())
          } else if (value === 'true') {
            value = true
          } else if (value === 'false') {
            value = false
          }
        }

        if (key === 'name' || key === 'description' || key === 'version' || key === 'namespace') {
          result[
            key as keyof Pick<FrontmatterData, 'name' | 'description' | 'version' | 'namespace'>
          ] = value as string
        } else if (
          key === 'tags' ||
          key === 'trigger_phrases' ||
          key === 'dependencies' ||
          key === 'tools'
        ) {
          result[
            key as keyof Pick<
              FrontmatterData,
              'tags' | 'trigger_phrases' | 'dependencies' | 'tools'
            >
          ] = value as string[]
        } else if (key === 'components') {
          result.components = value as Record<string, unknown>
        }
      }
    }

    return result
  }

  /**
   * Helper: Extract command name from file path
   */
  private extractCommandName(file: string): string {
    const match = file.match(/commands[/\\]([^/\\]+)[/\\](.+)\.md$/)
    if (match) {
      return `${match[1]}:${match[2]}`
    }
    return path.basename(file, '.md')
  }

  /**
   * Helper: Extract namespace from path
   */
  private extractNamespace(file: string, type: string): string | undefined {
    const escapedType = type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const match = file.match(new RegExp(`${escapedType}[/\\\\]([^/\\\\]+)[/\\\\]`))
    return match ? match[1] : undefined
  }

  /**
   * Helper: Extract base name without extension
   */
  private extractBaseName(file: string): string {
    const base = path.basename(file)
    return base.replace(/\.(md|yaml|yml|json|sh)$/, '').replace(/SKILL$/, '')
  }

  /**
   * Helper: Check if content has stub indicators
   */
  private hasStubContent(content: string): boolean {
    const stubPatterns = [
      /TODO/i,
      /FIXME/i,
      /stub/i,
      /placeholder/i,
      /not implemented/i,
      /coming soon/i,
    ]
    return stubPatterns.some((pattern) => pattern.test(content))
  }

  /**
   * Helper: Extract hook event type
   */
  private extractHookEvent(file: string, content: string): string {
    const pathMatch = file.match(/hooks[/\\]([^/\\]+)[/\\]/)
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1]
    }

    const commentMatch = content.match(/# Event: (.+)/)
    if (commentMatch && commentMatch[1]) {
      return commentMatch[1].trim()
    }

    return 'custom'
  }

  /**
   * Helper: Extract hook description from comments
   */
  private extractHookDescription(content: string): string | undefined {
    const match = content.match(/# Description: (.+)/)
    if (match && match[1]) {
      return match[1].trim()
    }
    return undefined
  }
}

/**
 * Convenience function to scan and save registry
 */
export async function scanAndSaveRegistry(
  claudeDir: string = '.claude',
  outputPath: string = '.claude/registry.json',
): Promise<void> {
  const scanner = new RegistryScanner(claudeDir)
  const registry = await scanner.scan()

  fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2))
}
