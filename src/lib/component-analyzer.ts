/**
 * ComponentAnalyzer - Deep file-based analysis of TypeScript components
 *
 * Scans TypeScript files to extract code metrics, detect code smells,
 * and analyze component dependencies with comprehensive analysis.
 *
 * @module component-analyzer
 */

import * as fs from 'fs'
import * as path from 'path'

/**
 * Represents metrics for a single function in a component
 */
export type FunctionMetric = {
  /** Function name */
  name: string
  /** Lines of code in function */
  lines: number
  /** Cyclomatic complexity estimate */
  complexity: number
  /** Number of function arguments */
  args: number
  /** Whether function has JSDoc comment */
  hasJSDoc: boolean
  /** Whether function is exported */
  exports: boolean
}

/**
 * Represents a detected code smell pattern
 */
export type CodeSmell = {
  /** Type of code smell detected */
  type: 'long-function' | 'high-complexity' | 'missing-jsdoc' | 'tight-coupling' | 'deep-nesting'
  /** Location of code smell (line number or function name) */
  location: string
  /** Severity level of the issue */
  severity: 'low' | 'medium' | 'high'
  /** Suggestion for fixing the issue */
  suggestion: string
}

/**
 * Comprehensive metrics for a TypeScript component
 */
export type ComponentMetrics = {
  /** Component name (filename without extension) */
  name: string
  /** Absolute path to component file */
  filePath: string
  /** Total lines of code in file */
  lines: number
  /** Overall cyclomatic complexity */
  complexity: number
  /** JSDoc coverage percentage (0-100) */
  jsdocCoverage: number
  /** Metrics for each function */
  functions: FunctionMetric[]
  /** Import paths from this component */
  dependencies: string[]
  /** Detected code smell patterns */
  codeSmells: CodeSmell[]
}

/**
 * ComponentAnalyzer - Main class for analyzing TypeScript components
 *
 * Provides methods to analyze individual files or scan entire directories
 * for code metrics, code smells, and architectural insights.
 */
export class ComponentAnalyzer {
  /**
   * Analyze a single TypeScript component file
   *
   * Extracts comprehensive metrics including complexity, dependencies,
   * and code smell patterns.
   *
   * @param filePath - Absolute path to TypeScript file
   * @returns ComponentMetrics with detailed analysis
   * @throws {Error} If file doesn't exist or is unreadable
   *
   * @example
   * ```typescript
   * const analyzer = new ComponentAnalyzer()
   * const metrics = analyzer.analyzeComponent('src/lib/reader.ts')
   * console.log(metrics.complexity) // 8.5
   * console.log(metrics.functions.length) // 5
   * ```
   */
  public analyzeComponent(filePath: string): ComponentMetrics {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`)
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    const name = path.basename(filePath, path.extname(filePath))

    // Extract all metrics
    const lines = content.split('\n').length
    const functions = this.extractFunctions(content)
    const dependencies = this.extractDependencies(content)
    const complexity = this.calculateComplexity(content)
    const jsdocCoverage = this.calculateJSDocCoverage(content, functions)
    const codeSmells = this.detectCodeSmells(
      {
        name,
        filePath,
        lines,
        complexity,
        jsdocCoverage,
        functions,
        dependencies,
        codeSmells: [], // Will be populated by detectCodeSmells
      },
      content,
    )

    return {
      name,
      filePath,
      lines,
      complexity,
      jsdocCoverage,
      functions,
      dependencies,
      codeSmells,
    }
  }

  /**
   * Scan a directory recursively and analyze all TypeScript components
   *
   * Finds all .ts files (excluding .test.ts) and node_modules,
   * then analyzes each one.
   *
   * @param dirPath - Path to directory to scan
   * @returns Array of ComponentMetrics for all components found
   *
   * @example
   * ```typescript
   * const analyzer = new ComponentAnalyzer()
   * const metrics = analyzer.scanComponentDir('src/lib')
   * console.log(metrics.length) // 12 components found
   * ```
   */
  public scanComponentDir(dirPath: string): ComponentMetrics[] {
    const results: ComponentMetrics[] = []
    this.scanDirRecursive(dirPath, results)
    return results
  }

  /**
   * Extract function definitions from TypeScript content
   *
   * @internal
   */
  private extractFunctions(content: string): FunctionMetric[] {
    const functions: FunctionMetric[] = []

    // Match function declarations: function name(...), export function name(...), const name = (...)
    const functionRegex =
      /^(?:export\s+)?(?:async\s+)?(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\(|(?:public|private|protected)?\s+(\w+)\s*\()/gm
    const jsdocRegex = /\/\*\*[\s\S]*?\*\//

    let match
    const seenFunctions = new Set<string>()

    // Find all function declarations
    while ((match = functionRegex.exec(content)) !== null) {
      const name = match[1] || match[2] || match[3]
      if (!name || seenFunctions.has(name)) continue
      seenFunctions.add(name)

      // Extract arguments
      const argsMatch = content.substring(match.index).match(/\((.*?)\)/u)
      const args = argsMatch && argsMatch[1] ? argsMatch[1].split(',').length : 0

      // Check for JSDoc before function
      const beforeContent = content.substring(Math.max(0, match.index - 200), match.index)
      const hasJSDoc = jsdocRegex.test(beforeContent)

      // Calculate function length by finding the closing brace
      const startIndex = match.index
      let braceCount = 0
      let endIndex = startIndex
      let foundOpen = false

      for (let i = startIndex; i < content.length; i++) {
        if (content[i] === '{') {
          braceCount++
          foundOpen = true
        } else if (content[i] === '}') {
          braceCount--
          if (foundOpen && braceCount === 0) {
            endIndex = i
            break
          }
        }
      }

      const functionContent = content.substring(startIndex, endIndex)
      const functionLines = functionContent.split('\n').length
      const complexity = this.calculateFunctionComplexity(functionContent)

      // Check if exported
      const isExported = /export/.test(
        content.substring(Math.max(0, match.index - 20), match.index),
      )

      functions.push({
        name,
        lines: functionLines,
        complexity,
        args,
        hasJSDoc,
        exports: isExported,
      })
    }

    return functions
  }

  /**
   * Extract import/dependency paths from content
   *
   * @internal
   */
  private extractDependencies(content: string): string[] {
    const dependencies = new Set<string>()
    const importRegex = /import\s+(?:[\w\s,{}*]*\s+)?from\s+['"]([^'"]+)['"]/gm

    let match
    while ((match = importRegex.exec(content)) !== null) {
      const importPath = match[1]
      if (importPath) {
        // Only include external dependencies (not relative imports)
        if (!importPath.startsWith('.')) {
          // Extract base module name (e.g., 'fs' from 'fs' or 'chalk' from 'chalk/colors')
          const baseModule = importPath.split('/')[0]
          if (baseModule) {
            dependencies.add(baseModule)
          }
        }
      }
    }

    return Array.from(dependencies)
  }

  /**
   * Calculate cyclomatic complexity for entire file
   *
   * @internal
   */
  private calculateComplexity(content: string): number {
    let complexity = 1 // Base complexity

    // Count control flow keywords
    const patterns = [
      /if\s*\(/g,
      /else\s/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /\?[^:]+:/g,
    ]

    patterns.forEach((pattern) => {
      const matches = content.match(pattern)
      if (matches) complexity += matches.length
    })

    // Normalize to 0-10 scale
    return Math.min(Math.round(complexity / 2), 10)
  }

  /**
   * Calculate cyclomatic complexity for a single function
   *
   * @internal
   */
  private calculateFunctionComplexity(functionContent: string): number {
    let complexity = 1

    const patterns = [
      /if\s*\(/g,
      /else\s/g,
      /for\s*\(/g,
      /while\s*\(/g,
      /switch\s*\(/g,
      /\?[^:]+:/g,
      /catch\s*\(/g,
    ]

    patterns.forEach((pattern) => {
      const matches = functionContent.match(pattern)
      if (matches) complexity += matches.length
    })

    return complexity
  }

  /**
   * Calculate JSDoc coverage percentage
   *
   * @internal
   */
  private calculateJSDocCoverage(content: string, functions: FunctionMetric[]): number {
    if (functions.length === 0) return 0

    const withDocs = functions.filter((f) => f.hasJSDoc).length
    return Math.round((withDocs / functions.length) * 100)
  }

  /**
   * Detect code smell patterns
   *
   * @internal
   */
  private detectCodeSmells(metrics: ComponentMetrics, content: string): CodeSmell[] {
    const smells: CodeSmell[] = []

    // Detect long functions (> 50 lines)
    metrics.functions.forEach((func) => {
      if (func.lines > 50) {
        smells.push({
          type: 'long-function',
          location: func.name,
          severity: func.lines > 100 ? 'high' : 'medium',
          suggestion: `Break down "${func.name}" into smaller, focused functions`,
        })
      }

      // Detect high complexity (> 5)
      if (func.complexity > 5) {
        smells.push({
          type: 'high-complexity',
          location: func.name,
          severity: func.complexity > 10 ? 'high' : 'medium',
          suggestion: `Reduce complexity of "${func.name}" by extracting conditional logic`,
        })
      }

      // Detect missing JSDoc on public/exported functions
      if (func.exports && !func.hasJSDoc) {
        smells.push({
          type: 'missing-jsdoc',
          location: func.name,
          severity: 'medium',
          suggestion: `Add JSDoc comment to exported function "${func.name}"`,
        })
      }
    })

    // Detect tight coupling (> 3 external dependencies)
    if (metrics.dependencies.length > 3) {
      smells.push({
        type: 'tight-coupling',
        location: metrics.name,
        severity: metrics.dependencies.length > 6 ? 'high' : 'medium',
        suggestion: `Component has ${metrics.dependencies.length} external dependencies. Consider abstracting some dependencies`,
      })
    }

    // Detect deep nesting (> 3 levels)
    const deepNestingMatch = content.match(
      /[{[(][\s\S]{0,50}[{[(][\s\S]{0,50}[{[(][\s\S]{0,50}[{[(]/g,
    )
    if (deepNestingMatch && deepNestingMatch.length > 2) {
      smells.push({
        type: 'deep-nesting',
        location: metrics.name,
        severity: 'medium',
        suggestion: 'Reduce nesting depth by extracting nested blocks into separate functions',
      })
    }

    return smells
  }

  /**
   * Recursively scan directory for TypeScript components
   *
   * @internal
   */
  private scanDirRecursive(dirPath: string, results: ComponentMetrics[]): void {
    if (!fs.existsSync(dirPath)) return

    const entries = fs.readdirSync(dirPath, { withFileTypes: true })

    entries.forEach((entry) => {
      const fullPath = path.join(dirPath, entry.name)

      // Skip node_modules and test files
      if (entry.name === 'node_modules' || entry.name.includes('.test.ts')) {
        return
      }

      if (entry.isDirectory()) {
        this.scanDirRecursive(fullPath, results)
      } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
        try {
          const metrics = this.analyzeComponent(fullPath)
          results.push(metrics)
        } catch {
          // Silently skip files that can't be analyzed
        }
      }
    })
  }
}
