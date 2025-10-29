// src/lib/batch-spec-creator.ts

import * as fs from 'fs'
import * as path from 'path'

export type BatchSpecOptions = {
  dryRun: boolean
  withTasks: boolean
}

export type BatchResult = {
  success: boolean
  specsCreated: string[]
  skipped: string[]
  preview?: string[]
  tasksGenerated?: number
  errors: string[]
}

export type ExistingSpecReport = {
  existing: string[]
  new: string[]
}

/**
 * Find ADR files matching a glob pattern
 * @param pattern - Glob pattern or file path (e.g., "docs/adr/ADR-*.md")
 * @returns Array of matching file paths
 */
export function findMatchingAdrs(pattern: string): string[] {
  if (!pattern) {
    return []
  }

  // Check if pattern is a single file
  if (fs.existsSync(pattern) && fs.statSync(pattern).isFile()) {
    return [pattern]
  }

  // Simple glob implementation for wildcard patterns
  const dirPath = path.dirname(pattern)
  const filePattern = path.basename(pattern)

  if (!fs.existsSync(dirPath)) {
    return []
  }

  // Read directory and filter files
  const files = fs.readdirSync(dirPath)
  const regex = new RegExp('^' + filePattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$')

  const matches = files
    .filter((file: string) => regex.test(file))
    .map((file: string) => path.join(dirPath, file))
    .filter((file: string) => fs.existsSync(file) && fs.statSync(file).isFile())
    .sort() // Sort for consistent ordering

  return matches
}

/**
 * Generate spec name from ADR filename
 * Removes "ADR-XXX-" prefix from filename
 * @param adrFile - Path to ADR file
 * @returns Spec name in kebab-case (e.g., "oauth2-auth")
 */
export function generateSpecName(adrFile: string): string {
  const basename = path.basename(adrFile, '.md')

  // Remove ADR-XXX- prefix (handles 1-3 digit ADR numbers)
  const match = basename.match(/^ADR-\d{1,3}-(.+)$/)

  if (match && match[1]) {
    return match[1]
  }

  // Fallback: return basename without extension
  return basename
}

/**
 * Check which specs already exist for the given ADR files
 * @param adrFiles - Array of ADR file paths
 * @returns Report of existing and new spec files
 */
export function checkExistingSpecs(adrFiles: string[]): ExistingSpecReport {
  const existing: string[] = []
  const newSpecs: string[] = []

  for (const adrFile of adrFiles) {
    const specName = generateSpecName(adrFile)
    const specPath = path.join('test-data', 'specs', `spec-${specName}.md`)

    if (fs.existsSync(specPath)) {
      existing.push(adrFile)
    } else {
      newSpecs.push(adrFile)
    }
  }

  return {
    existing,
    new: newSpecs,
  }
}

/**
 * Create specifications for multiple ADRs in batch
 * @param adrPattern - Glob pattern for ADR files
 * @param options - Batch processing options
 * @returns Batch processing result
 */
export async function createSpecsForAdrs(
  adrPattern: string,
  options: BatchSpecOptions,
): Promise<BatchResult> {
  // Validate pattern
  if (!adrPattern || adrPattern.trim() === '') {
    throw new Error('ADR pattern is required')
  }

  // Find matching ADR files
  const adrFiles = findMatchingAdrs(adrPattern)

  if (adrFiles.length === 0) {
    throw new Error(`No ADR files match pattern: ${adrPattern}`)
  }

  // Check for existing specs
  const report = checkExistingSpecs(adrFiles)

  // Dry run: preview only
  if (options.dryRun) {
    const preview = report.new.map((file) => generateSpecName(file))

    return {
      success: true,
      specsCreated: [],
      skipped: report.existing,
      preview,
      errors: [],
    }
  }

  // TODO: Implement actual spec creation
  // For now, return empty result for non-dry-run mode
  return {
    success: true,
    specsCreated: [],
    skipped: report.existing,
    errors: [],
  }
}
