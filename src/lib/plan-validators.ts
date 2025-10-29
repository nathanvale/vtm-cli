/**
 * Validation utilities for plan domain commands (ADR, PRD, Spec)
 */

export type PlanValidationResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate ADR file structure
 */
export function validateAdrFile(filePath: string, content: string): PlanValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check for ADR header
  if (!content.includes('ADR-')) {
    errors.push('Missing ADR header (e.g., "# ADR-001: Decision Title")')
  }

  // Check required sections
  const requiredSections = ['Status', 'Context', 'Decision', 'Consequences', 'Alternatives']
  for (const section of requiredSections) {
    if (!content.includes(`## ${section}`)) {
      errors.push(`Missing required section: ## ${section}`)
    }
  }

  // Count alternatives
  const altCount = (content.match(/### Alternative/g) || []).length
  if (altCount < 3) {
    warnings.push(`Found only ${altCount} alternatives (recommended: 3+)`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate PRD file structure
 */
export function validatePrdFile(filePath: string, content: string): PlanValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check if file is too short
  const lineCount = content.split('\n').length
  if (lineCount < 10) {
    errors.push(`PRD file appears too short (${lineCount} lines, recommended: 10+)`)
  }

  // Check for spec_type: prd in frontmatter
  if (!content.includes('spec_type: prd')) {
    warnings.push("Missing 'spec_type: prd' in frontmatter")
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate Spec file structure
 */
export function validateSpecFile(filePath: string, content: string): PlanValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check if spec references an ADR
  if (!content.includes('ADR-')) {
    errors.push('Spec does not reference an ADR file')
  }

  // Warn if missing Decision section
  if (!content.includes('## Decision')) {
    warnings.push('Missing recommended section: ## Decision')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate ADR+Spec pairing
 */
export function validateAdrSpecPair(
  adrPath: string,
  specPath: string,
  adrContent: string,
  specContent: string,
): PlanValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check if first argument is an ADR file
  if (!adrPath.includes('adr/') && !adrPath.includes('/adr/')) {
    errors.push('First argument must be an ADR file (path should contain /adr/)')
  }

  // Check if second argument is a spec file
  if (!specPath.includes('spec') && !specPath.includes('/specs/')) {
    errors.push('Second argument must be a spec file (path should contain /spec/)')
  }

  // Extract ADR filename from path
  const adrFilename = adrPath.split('/').pop() || ''
  const adrId = adrFilename.match(/ADR-\d+/)?.[0]

  // Check if spec references this ADR
  if (adrId && !specContent.includes(adrFilename) && !specContent.includes(adrId)) {
    errors.push(`Spec does not reference ADR file: ${adrFilename}`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate related ADRs exist
 */
export function validateRelatedAdrs(
  adrIds: string[],
  existingAdrs: string[],
): PlanValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  for (const adrId of adrIds) {
    const found = existingAdrs.some((filename) => filename.includes(adrId))
    if (!found) {
      warnings.push(`Related ADR not found: ${adrId}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}
