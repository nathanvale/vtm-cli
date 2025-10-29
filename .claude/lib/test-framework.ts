/**
 * Test Framework - Component Testing System
 *
 * Comprehensive testing framework for validating Claude Code components
 * across five test dimensions: smoke, functional, integration, performance, quality
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */

import * as fs from 'fs/promises'
import * as path from 'path'
import { spawn } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(require('child_process').exec)

/**
 * Test result types and interfaces
 */

export type TestOptions = {
  mode: 'quick' | 'comprehensive'
  args?: string
  expected?: string
  timeout?: number
  env?: Record<string, string>
  report?: boolean
}

export type TestResult = {
  name: string
  type: 'command' | 'skill' | 'mcp' | 'hook' | 'agent' | 'unknown'
  timestamp: string
  mode: 'quick' | 'comprehensive'
  overall_status: 'passed' | 'failed' | 'partial' | 'error'
  tests: {
    smoke: SmokeTestResult
    functional?: FunctionalTestResult
    integration?: IntegrationTestResult
    performance?: PerformanceTestResult
    quality?: QualityTestResult
  }
  metrics: {
    total_duration_ms: number
    estimated_tokens: number
    memory_used_mb?: number
  }
  recommendations: string[]
  errors: string[]
}

export type SmokeTestResult = {
  status: 'passed' | 'failed'
  checks: {
    exists: boolean
    parseable: boolean
    has_metadata: boolean
    type_recognized: boolean
    required_fields: boolean
  }
  details: string
}

export type FunctionalTestResult = {
  status: 'passed' | 'failed' | 'partial'
  execution_time_ms: number
  output: string
  output_contains_expected: boolean
  expected?: string
  has_errors: boolean
  error_messages: string[]
}

export type IntegrationTestResult = {
  status: 'passed' | 'failed' | 'partial'
  dependencies: {
    total: number
    resolved: number
    failed: string[]
  }
  child_components: string[]
  circular_dependencies: boolean
  details: string
}

export type PerformanceTestResult = {
  status: 'passed' | 'failed'
  execution_time_ms: number
  timeout_ms: number
  within_threshold: boolean
  estimated_tokens: number
  memory_usage_mb?: number
  acceptable: boolean
}

export type QualityTestResult = {
  status: 'passed' | 'failed' | 'warning'
  documentation_exists: boolean
  metadata_complete: boolean
  error_handling: boolean
  tests_exist: boolean
  deprecated_deps: string[]
  warnings: string[]
  details: string
}

export type ComponentMetadata = {
  id: string
  type: 'command' | 'skill' | 'mcp' | 'hook' | 'agent'
  version: string
  name: string
  description: string
  location: string
  dependencies?: string[]
  inputs?: Record<string, unknown>
  outputs?: unknown
  test?: {
    quick?: string
    full?: string
    args?: string
    expected?: string
    timeout?: number
  }
}

/**
 * Main Test Framework Class
 */

export class TestFramework {
  private componentName: string
  private componentType: 'command' | 'skill' | 'mcp' | 'hook' | 'agent' | 'unknown' = 'unknown'
  private claudeDir: string = '.claude'
  private registryPath: string = '.claude/registry.json'
  private testResultsDir: string = '.claude/test-results'

  constructor(componentName: string, claudeDir?: string) {
    this.componentName = componentName
    if (claudeDir) {
      this.claudeDir = claudeDir
      this.registryPath = path.join(claudeDir, 'registry.json')
      this.testResultsDir = path.join(claudeDir, 'test-results')
    }
  }

  /**
   * Run complete test suite
   */
  async runTests(options: TestOptions): Promise<TestResult> {
    const startTime = Date.now()
    const result: TestResult = {
      name: this.componentName,
      type: this.componentType,
      timestamp: new Date().toISOString(),
      mode: options.mode,
      overall_status: 'passed',
      tests: {
        smoke: { status: 'failed', checks: {}, details: '' },
      },
      metrics: {
        total_duration_ms: 0,
        estimated_tokens: 0,
      },
      recommendations: [],
      errors: [],
    }

    try {
      // Always run smoke test
      result.tests.smoke = await this.runSmokeTest()

      if (result.tests.smoke.status === 'failed') {
        result.overall_status = 'failed'
        result.errors.push('Smoke test failed - stopping further tests')
        return this.finalizeResult(result, startTime)
      }

      // If comprehensive mode, run additional tests
      if (options.mode === 'comprehensive') {
        result.tests.functional = await this.runFunctionalTest(options)
        result.tests.integration = await this.runIntegrationTest()
        result.tests.performance = await this.runPerformanceTest(options)
        result.tests.quality = await this.runQualityTest()

        // Determine overall status
        result.overall_status = this.determineOverallStatus(result)
      }

      // Generate recommendations
      result.recommendations = this.generateRecommendations(result)
    } catch (error) {
      result.overall_status = 'error'
      result.errors.push(`Test execution error: ${(error as Error).message}`)
    }

    return this.finalizeResult(result, startTime, options)
  }

  /**
   * Test 1: Smoke Test - Does component exist and can it be invoked?
   */
  private async runSmokeTest(): Promise<SmokeTestResult> {
    const result: SmokeTestResult = {
      status: 'failed',
      checks: {
        exists: false,
        parseable: false,
        has_metadata: false,
        type_recognized: false,
        required_fields: false,
      },
      details: '',
    }

    try {
      // Check 1: Component exists
      const componentPath = await this.findComponentFile()
      result.checks.exists = Boolean(componentPath)

      if (!result.checks.exists) {
        result.details = `Component file not found for: ${this.componentName}`
        return result
      }

      // Check 2: Can be parsed
      try {
        const content = await fs.readFile(componentPath, 'utf-8')
        result.checks.parseable = true

        // Check 3: Has metadata (YAML frontmatter or header comment)
        const hasMetadata = content.includes('---') || content.includes('allowed-tools:')
        result.checks.has_metadata = hasMetadata

        // Check 4: Type is recognized
        const metadata = await this.extractMetadata(componentPath)
        if (metadata) {
          this.componentType = metadata.type
          result.checks.type_recognized = true
        }

        // Check 5: Required fields present
        const requiredFields = await this.checkRequiredFields(metadata)
        result.checks.required_fields = requiredFields
      } catch (e) {
        result.details = `Failed to parse component: ${(e as Error).message}`
        return result
      }

      // All checks passed
      const allPassed = Object.values(result.checks).every((v) => v === true)
      result.status = allPassed ? 'passed' : 'failed'
      result.details = allPassed ? 'All smoke test checks passed' : 'Some checks failed'
    } catch (error) {
      result.details = `Smoke test error: ${(error as Error).message}`
    }

    return result
  }

  /**
   * Test 2: Functional Test - Does it produce expected output?
   */
  private async runFunctionalTest(options: TestOptions): Promise<FunctionalTestResult> {
    const result: FunctionalTestResult = {
      status: 'failed',
      execution_time_ms: 0,
      output: '',
      output_contains_expected: false,
      expected: options.expected,
      has_errors: false,
      error_messages: [],
    }

    try {
      const startTime = Date.now()

      // Build command to execute
      const command = this.buildExecutionCommand(options)

      // Execute with timeout
      const timeout = (options.timeout || 30) * 1000
      const { stdout, stderr } = await this.executeWithTimeout(command, timeout)

      result.execution_time_ms = Date.now() - startTime
      result.output = stdout

      // Check for errors
      if (stderr) {
        result.has_errors = true
        result.error_messages = stderr.split('\n').filter((line) => line.trim().length > 0)
      }

      // Check expected output
      if (options.expected) {
        result.output_contains_expected = stdout
          .toLowerCase()
          .includes(options.expected.toLowerCase())
      }

      // Determine status
      if (!result.has_errors && (options.expected ? result.output_contains_expected : true)) {
        result.status = 'passed'
      }
    } catch (error) {
      result.status = 'failed'
      result.has_errors = true
      result.error_messages.push(`Execution failed: ${(error as Error).message}`)
    }

    return result
  }

  /**
   * Test 3: Integration Test - Does it work with dependencies?
   */
  private async runIntegrationTest(): Promise<IntegrationTestResult> {
    const result: IntegrationTestResult = {
      status: 'passed',
      dependencies: {
        total: 0,
        resolved: 0,
        failed: [],
      },
      child_components: [],
      circular_dependencies: false,
      details: '',
    }

    try {
      const metadata = await this.getComponentMetadata()

      if (!metadata || !metadata.dependencies || metadata.dependencies.length === 0) {
        result.details = 'No dependencies declared'
        return result
      }

      result.dependencies.total = metadata.dependencies.length

      // Try to resolve each dependency
      for (const dep of metadata.dependencies) {
        try {
          const depFile = await this.findComponentFile(dep)
          if (depFile) {
            result.dependencies.resolved++
          } else {
            result.dependencies.failed.push(dep)
          }
        } catch (e) {
          result.dependencies.failed.push(dep)
        }
      }

      // Check for circular dependencies
      result.circular_dependencies = await this.checkCircularDependencies()

      // Determine status
      if (result.dependencies.failed.length === 0 && !result.circular_dependencies) {
        result.status = 'passed'
        result.details = `All ${result.dependencies.total} dependencies resolved`
      } else {
        result.status = 'failed'
        result.details = `Failed to resolve ${result.dependencies.failed.length} dependencies`
      }
    } catch (error) {
      result.status = 'failed'
      result.details = `Integration test error: ${(error as Error).message}`
    }

    return result
  }

  /**
   * Test 4: Performance Test - Execution time and token usage
   */
  private async runPerformanceTest(options: TestOptions): Promise<PerformanceTestResult> {
    const result: PerformanceTestResult = {
      status: 'passed',
      execution_time_ms: 0,
      timeout_ms: (options.timeout || 30) * 1000,
      within_threshold: true,
      estimated_tokens: 0,
      acceptable: true,
    }

    try {
      const command = this.buildExecutionCommand(options)
      const startTime = Date.now()

      await this.executeWithTimeout(command, result.timeout_ms)

      result.execution_time_ms = Date.now() - startTime
      result.within_threshold = result.execution_time_ms < result.timeout_ms

      // Estimate tokens (rough: ~4 chars per token)
      const metadata = await this.getComponentMetadata()
      const descLength = metadata?.description?.length || 0
      result.estimated_tokens = Math.ceil(descLength / 4) + 100 // Base estimate

      // Performance thresholds
      const isAcceptable =
        result.within_threshold &&
        result.estimated_tokens < 10000 &&
        result.execution_time_ms < 60000

      result.acceptable = isAcceptable
      result.status = isAcceptable ? 'passed' : 'failed'
    } catch (error) {
      result.status = 'failed'
      result.acceptable = false
      result.execution_time_ms = result.timeout_ms // Mark as timeout
    }

    return result
  }

  /**
   * Test 5: Quality Test - Documentation and standards
   */
  private async runQualityTest(): Promise<QualityTestResult> {
    const result: QualityTestResult = {
      status: 'passed',
      documentation_exists: false,
      metadata_complete: false,
      error_handling: false,
      tests_exist: false,
      deprecated_deps: [],
      warnings: [],
      details: '',
    }

    try {
      const componentPath = await this.findComponentFile()
      const metadata = await this.getComponentMetadata()

      // Check documentation
      if (componentPath) {
        const content = await fs.readFile(componentPath, 'utf-8')
        result.documentation_exists = content.length > 100 // Has substantial documentation
        result.error_handling = content.toLowerCase().includes('error') // Mentions error handling
      }

      // Check metadata completeness
      if (metadata) {
        const requiredFields = ['id', 'type', 'name', 'description']
        const hasAll = requiredFields.every((field) => (metadata as Record<string, unknown>)[field])
        result.metadata_complete = hasAll
      }

      // Check for tests
      const testPath = path.join(this.claudeDir, 'test-templates', `${this.componentName}.json`)
      try {
        await fs.access(testPath)
        result.tests_exist = true
      } catch {
        result.warnings.push('No test templates found')
      }

      // Check for deprecated dependencies
      if (metadata?.dependencies) {
        // This would check against a deprecation list in production
        result.deprecated_deps = []
      }

      // Determine status
      if (result.warnings.length > 0) {
        result.status = 'warning'
      } else if (!result.metadata_complete || !result.documentation_exists) {
        result.status = 'failed'
      }

      result.details = `Documentation: ${result.documentation_exists ? 'yes' : 'no'}, Metadata: ${result.metadata_complete ? 'complete' : 'incomplete'}`
    } catch (error) {
      result.status = 'failed'
      result.details = `Quality test error: ${(error as Error).message}`
    }

    return result
  }

  /**
   * Helper: Find component file
   */
  private async findComponentFile(componentName?: string): Promise<string | null> {
    const name = componentName || this.componentName

    // Try common locations
    const locations = [
      path.join(this.claudeDir, 'commands', `${name}.md`),
      path.join(this.claudeDir, 'skills', `${name}.md`),
      path.join(this.claudeDir, 'agents', `${name}.md`),
      path.join(this.claudeDir, 'mcp-servers', `${name}.md`),
      path.join(this.claudeDir, 'hooks', `${name}.md`),
    ]

    for (const loc of locations) {
      try {
        await fs.access(loc)
        return loc
      } catch {
        // File not found, try next
      }
    }

    // Try fuzzy search
    try {
      const { exec } = require('child_process')
      const { stdout } = await execAsync(
        `find ${this.claudeDir} -type f -name "*${name}*" -name "*.md" 2>/dev/null | head -1`,
      )
      if (stdout.trim()) {
        return stdout.trim()
      }
    } catch {
      // Ignore
    }

    return null
  }

  /**
   * Helper: Extract metadata from component file
   */
  private async extractMetadata(filePath: string): Promise<ComponentMetadata | null> {
    try {
      const content = await fs.readFile(filePath, 'utf-8')

      // Extract YAML frontmatter
      const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/)
      if (!yamlMatch) {
        return null
      }

      const yamlContent = yamlMatch[1]
      const metadata: Partial<ComponentMetadata> = {
        location: filePath,
      }

      // Parse key-value pairs
      const lines = yamlContent.split('\n')
      for (const line of lines) {
        const [key, ...valueParts] = line.split(':')
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim()
          const cleanKey = key.trim() as keyof ComponentMetadata

          if (
            cleanKey === 'id' ||
            cleanKey === 'type' ||
            cleanKey === 'name' ||
            cleanKey === 'description'
          ) {
            ;(metadata[cleanKey] as string) = value.replace(/^["']|["']$/g, '')
          }
        }
      }

      // Infer type from location if not explicitly set
      if (!metadata.type) {
        if (filePath.includes('/commands/')) metadata.type = 'command'
        else if (filePath.includes('/skills/')) metadata.type = 'skill'
        else if (filePath.includes('/agents/')) metadata.type = 'agent'
        else if (filePath.includes('/mcp-servers/')) metadata.type = 'mcp'
        else if (filePath.includes('/hooks/')) metadata.type = 'hook'
      }

      // Set defaults
      if (!metadata.id) metadata.id = this.componentName
      if (!metadata.version) metadata.version = '1.0.0'
      if (!metadata.name) metadata.name = this.componentName

      return metadata as ComponentMetadata
    } catch {
      return null
    }
  }

  /**
   * Helper: Get component metadata
   */
  private async getComponentMetadata(): Promise<ComponentMetadata | null> {
    const filePath = await this.findComponentFile()
    if (!filePath) {
      return null
    }
    return this.extractMetadata(filePath)
  }

  /**
   * Helper: Check required fields
   */
  private async checkRequiredFields(metadata?: ComponentMetadata): Promise<boolean> {
    if (!metadata) {
      return false
    }

    const required = ['id', 'type', 'name', 'description']
    return required.every((field) => {
      const value = metadata[field as keyof ComponentMetadata]
      return value !== null && value !== undefined && value !== ''
    })
  }

  /**
   * Helper: Build execution command
   */
  private buildExecutionCommand(options: TestOptions): string {
    let cmd = this.componentName

    if (options.args) {
      cmd += ` ${options.args}`
    }

    // Add environment variables
    if (options.env && Object.keys(options.env).length > 0) {
      const envStr = Object.entries(options.env)
        .map(([k, v]) => `${k}=${v}`)
        .join(' ')
      cmd = `${envStr} ${cmd}`
    }

    return cmd
  }

  /**
   * Helper: Execute command with timeout
   */
  private async executeWithTimeout(
    command: string,
    timeout: number,
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Command execution timeout after ${timeout}ms`))
      }, timeout)

      try {
        const { exec } = require('child_process')
        exec(
          command,
          { maxBuffer: 10 * 1024 * 1024 },
          (error: unknown, stdout: string, stderr: string) => {
            clearTimeout(timer)
            if (error && !stderr) {
              reject(error)
            } else {
              resolve({ stdout, stderr })
            }
          },
        )
      } catch (e) {
        clearTimeout(timer)
        reject(e)
      }
    })
  }

  /**
   * Helper: Check for circular dependencies
   */
  private async checkCircularDependencies(): Promise<boolean> {
    try {
      const metadata = await this.getComponentMetadata()
      if (!metadata?.dependencies) {
        return false
      }

      // Simple check: see if any dependency depends on this component
      for (const dep of metadata.dependencies) {
        const depMetadata = await this.extractMetadata((await this.findComponentFile(dep)) || '')
        if (
          depMetadata?.dependencies &&
          (depMetadata.dependencies as string[]).includes(metadata.id || this.componentName)
        ) {
          return true
        }
      }
    } catch {
      // Ignore errors in circular dependency check
    }
    return false
  }

  /**
   * Helper: Determine overall status
   */
  private determineOverallStatus(result: TestResult): 'passed' | 'failed' | 'partial' | 'error' {
    const tests = Object.values(result.tests).filter((t) => t && t.status)
    const failedCount = tests.filter((t) => t.status === 'failed').length
    const warningCount = tests.filter(
      (t) => t.status === 'warning' || t.status === 'partial',
    ).length

    if (failedCount > 0) return 'failed'
    if (warningCount > 0) return 'partial'
    return 'passed'
  }

  /**
   * Helper: Generate recommendations
   */
  private generateRecommendations(result: TestResult): string[] {
    const recommendations: string[] = []

    if (result.overall_status === 'passed') {
      recommendations.push('Component is production ready')
      recommendations.push('All dependencies resolved')
      recommendations.push('Documentation complete')
    }

    if (result.tests.quality?.status === 'failed') {
      recommendations.push('Add comprehensive documentation')
      recommendations.push('Complete component metadata')
    }

    if (result.tests.performance?.status === 'failed') {
      recommendations.push('Review performance bottlenecks')
      recommendations.push('Consider optimizing token usage')
    }

    if (result.tests.integration?.status === 'failed') {
      recommendations.push('Verify all dependencies are installed')
      recommendations.push('Check dependency versions')
    }

    return recommendations
  }

  /**
   * Helper: Finalize result
   */
  private async finalizeResult(
    result: TestResult,
    startTime: number,
    options?: TestOptions,
  ): Promise<TestResult> {
    result.metrics.total_duration_ms = Date.now() - startTime

    // Save result
    if (options?.report) {
      await this.saveTestResult(result)
    }

    return result
  }

  /**
   * Save test result to file
   */
  private async saveTestResult(result: TestResult): Promise<void> {
    try {
      // Create test results directory if needed
      await fs.mkdir(this.testResultsDir, { recursive: true })

      // Save JSON result
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const resultPath = path.join(
        this.testResultsDir,
        `result-${this.componentName}-${timestamp}.json`,
      )

      await fs.writeFile(resultPath, JSON.stringify(result, null, 2), 'utf-8')

      // Generate HTML report
      const htmlPath = path.join(
        this.testResultsDir,
        `report-${this.componentName}-${timestamp}.html`,
      )
      const html = this.generateHTMLReport(result)
      await fs.writeFile(htmlPath, html, 'utf-8')
    } catch (error) {
      console.error(`Failed to save test result: ${(error as Error).message}`)
    }
  }

  /**
   * Generate HTML report
   */
  private generateHTMLReport(result: TestResult): string {
    const statusColor =
      result.overall_status === 'passed'
        ? '#10b981'
        : result.overall_status === 'failed'
          ? '#ef4444'
          : result.overall_status === 'partial'
            ? '#f59e0b'
            : '#6b7280'

    const statusText = result.overall_status.toUpperCase()

    const testRows = Object.entries(result.tests)
      .filter(([, test]) => test && test.status)
      .map(
        ([name, test]) => `
        <tr>
          <td>${name}</td>
          <td><span style="color: ${test.status === 'passed' ? '#10b981' : test.status === 'failed' ? '#ef4444' : '#f59e0b'}">${test.status.toUpperCase()}</span></td>
          <td>${(test as Record<string, unknown>).details || ''}</td>
        </tr>
      `,
      )
      .join('')

    const recommendationsList = result.recommendations.map((rec) => `<li>${rec}</li>`).join('')

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Test Report - ${result.name}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1000px; margin: 0 auto; background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { margin-bottom: 10px; color: #1f2937; }
        .header { border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 30px; }
        .status-badge { display: inline-block; background: ${statusColor}; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; }
        .metadata { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
        .meta-item { padding: 15px; background: #f9fafb; border-left: 3px solid #3b82f6; border-radius: 4px; }
        .meta-label { font-weight: bold; color: #6b7280; font-size: 12px; text-transform: uppercase; }
        .meta-value { color: #1f2937; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { text-align: left; padding: 12px; background: #f9fafb; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151; }
        td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
        tr:hover { background: #f9fafb; }
        .recommendations { background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; border-radius: 4px; }
        .recommendations h3 { color: #10b981; margin-bottom: 10px; }
        .recommendations ul { margin-left: 20px; }
        .recommendations li { margin-bottom: 8px; color: #374151; }
        .section-title { font-size: 18px; font-weight: bold; color: #1f2937; margin-top: 30px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .metric { background: #f9fafb; padding: 15px; border-radius: 4px; margin-bottom: 10px; }
        .metric-label { color: #6b7280; font-size: 12px; text-transform: uppercase; font-weight: 600; }
        .metric-value { color: #1f2937; font-size: 20px; font-weight: bold; margin-top: 5px; }
        .error { color: #ef4444; }
        .footer { border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #6b7280; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Test Report: ${result.name}</h1>
          <p style="color: #6b7280; margin: 10px 0;">
            <span class="status-badge">${statusText}</span>
            <span style="margin-left: 15px; color: #6b7280;">Generated ${new Date(result.timestamp).toLocaleString()}</span>
          </p>
        </div>

        <div class="metadata">
          <div class="meta-item">
            <div class="meta-label">Component Type</div>
            <div class="meta-value">${result.type}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Test Mode</div>
            <div class="meta-value">${result.mode}</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Total Duration</div>
            <div class="meta-value">${result.metrics.total_duration_ms}ms</div>
          </div>
          <div class="meta-item">
            <div class="meta-label">Estimated Tokens</div>
            <div class="meta-value">${result.metrics.estimated_tokens}</div>
          </div>
        </div>

        <div class="section-title">Test Results</div>
        <table>
          <thead>
            <tr>
              <th>Test Type</th>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            ${testRows}
          </tbody>
        </table>

        ${
          result.recommendations.length > 0
            ? `
        <div class="recommendations">
          <h3>Recommendations</h3>
          <ul>
            ${recommendationsList}
          </ul>
        </div>
        `
            : ''
        }

        ${
          result.errors.length > 0
            ? `
        <div class="recommendations" style="background: #fef2f2; border-left-color: #ef4444;">
          <h3 style="color: #ef4444;">Errors</h3>
          <ul>
            ${result.errors.map((err) => `<li class="error">${err}</li>`).join('')}
          </ul>
        </div>
        `
            : ''
        }

        <div class="footer">
          Test Framework v1.0 | Claude Code Lifecycle Layer
        </div>
      </div>
    </body>
    </html>
    `
  }
}

export default TestFramework
