// src/lib/vtm-config.ts

import * as fs from 'fs'
import * as path from 'path'

export type VTMConfig = {
  git?: {
    enabled?: boolean
    branch_naming?: {
      pattern?: string
      default_type?: string
    }
    auto_commit?: boolean
    commit_message_template?: string
  }
}

const DEFAULT_CONFIG: VTMConfig = {
  git: {
    enabled: true,
    branch_naming: {
      pattern: '{type}/{id}',
      default_type: 'feature',
    },
    auto_commit: false,
    commit_message_template: '{type}({id}): {title}',
  },
}

export class VTMConfigReader {
  private configPath: string
  private config: VTMConfig | null = null

  constructor(configPath: string = '.vtmrc') {
    this.configPath = path.resolve(process.cwd(), configPath)
  }

  /**
   * Load configuration from .vtmrc file
   * Falls back to defaults if file doesn't exist
   */
  load(): VTMConfig {
    if (this.config) {
      return this.config
    }

    if (!fs.existsSync(this.configPath)) {
      this.config = DEFAULT_CONFIG
      return this.config
    }

    try {
      const content = fs.readFileSync(this.configPath, 'utf-8')
      const userConfig = JSON.parse(content) as Partial<VTMConfig>

      // Merge with defaults
      this.config = this.mergeConfig(DEFAULT_CONFIG, userConfig)
      return this.config
    } catch (error) {
      console.warn(
        `Warning: Failed to parse .vtmrc, using defaults. Error: ${(error as Error).message}`,
      )
      this.config = DEFAULT_CONFIG
      return this.config
    }
  }

  /**
   * Get git configuration
   */
  getGitConfig() {
    const config = this.load()
    return config.git || DEFAULT_CONFIG.git!
  }

  /**
   * Generate branch name based on task type and ID
   * Uses pattern from config (default: {type}/{id})
   */
  getBranchName(taskId: string, taskType?: string): string {
    const gitConfig = this.getGitConfig()
    const type = taskType || gitConfig.branch_naming?.default_type || 'feature'
    const pattern = gitConfig.branch_naming?.pattern || '{type}/{id}'

    return pattern.replace('{type}', type).replace('{id}', taskId)
  }

  /**
   * Generate commit message based on template
   * Uses template from config (default: {type}({id}): {title})
   */
  getCommitMessage(taskId: string, title: string, taskType?: string): string {
    const gitConfig = this.getGitConfig()
    const type = taskType || gitConfig.branch_naming?.default_type || 'feature'
    const template = gitConfig.commit_message_template || '{type}({id}): {title}'

    return template.replace('{type}', type).replace('{id}', taskId).replace('{title}', title)
  }

  /**
   * Check if git integration is enabled
   */
  isGitEnabled(): boolean {
    const gitConfig = this.getGitConfig()
    return gitConfig.enabled !== false
  }

  /**
   * Check if auto-commit is enabled
   */
  isAutoCommitEnabled(): boolean {
    const gitConfig = this.getGitConfig()
    return gitConfig.auto_commit === true
  }

  /**
   * Deep merge two config objects
   */
  private mergeConfig(defaults: VTMConfig, user: Partial<VTMConfig>): VTMConfig {
    return {
      git: {
        ...defaults.git,
        ...user.git,
        branch_naming: {
          ...defaults.git?.branch_naming,
          ...user.git?.branch_naming,
        },
      },
    }
  }
}
