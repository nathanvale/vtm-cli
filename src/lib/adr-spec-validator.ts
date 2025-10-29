// src/lib/adr-spec-validator.ts

export type ValidateOptions = {
  strict: boolean
}

export type ValidationReport = {
  valid: boolean
  errors: string[]
  warnings: string[]
  summary: string
  adrValidation: SectionValidation
  specValidation: SectionValidation
  pairingValidation: PairingValidation
  qualityValidation: QualityValidation
}

export type SectionValidation = {
  valid: boolean
  errors: string[]
  warnings: string[]
  sectionsFound: string[]
  sectionsRequired: string[]
}

export type PairingValidation = {
  valid: boolean
  errors: string[]
  specReferencesAdr: boolean
  adrNumber: string | null
}

export type QualityValidation = {
  errors: string[]
  warnings: string[]
  todoCount: number
  placeholderCount: number
  codeExampleCount: number
  alternativeCount: number
  acceptanceCriteriaCount: number
}

// Utility functions
export function countCodeExamples(content: string): number {
  const codeBlockMatches = content.match(/```/g)
  return codeBlockMatches ? codeBlockMatches.length / 2 : 0
}

export function countAlternatives(content: string): number {
  const altMatches = content.match(/^###\s+Alternative\s+\d+/gm)
  return altMatches ? altMatches.length : 0
}

export function extractAcceptanceCriteria(content: string): string[] {
  const criteria: string[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    // Match both checked and unchecked boxes
    const match = line.match(/^\s*-\s+\[([ x])\]\s+(.+)/)
    if (match && match[2]) {
      criteria.push(match[2].trim())
    }
  }

  return criteria
}

export function detectPlaceholders(content: string): string[] {
  const placeholders: string[] = []
  const patterns = [
    /INSERT HERE/gi,
    /\[FILL IN\]/gi,
    /\[REDACTED\]/gi,
    /\[TODO\]/gi,
    /\[TBD\]/gi,
    /\[PLACEHOLDER\]/gi,
  ]

  for (const pattern of patterns) {
    const matches = content.match(pattern)
    if (matches) {
      placeholders.push(...matches)
    }
  }

  return placeholders
}

export function detectTodos(content: string): string[] {
  const todos: string[] = []
  const lines = content.split('\n')

  for (const line of lines) {
    if (/TODO:|FIXME:|XXX:/i.test(line)) {
      todos.push(line.trim())
    }
  }

  return todos
}

// Core validation functions
export function validateAdrStructure(content: string, strict: boolean): SectionValidation {
  const errors: string[] = []
  const warnings: string[] = []
  const sectionsRequired = ['Status', 'Context', 'Decision', 'Consequences']
  const sectionsFound: string[] = []

  // Check for ADR header
  if (!content.match(/^#\s+ADR-/m)) {
    errors.push('Missing ADR header')
  }

  // Check for required sections
  for (const section of sectionsRequired) {
    if (content.match(new RegExp(`^##\\s+${section}`, 'm'))) {
      sectionsFound.push(section)
    } else {
      errors.push(`Missing required section: ## ${section}`)
    }
  }

  // Check for alternatives
  const alternativeCount = countAlternatives(content)
  if (alternativeCount < 3) {
    if (strict) {
      errors.push(`Found only ${alternativeCount} alternatives. Required: 3+`)
    } else {
      warnings.push(`Found only ${alternativeCount} alternatives (recommended: 3+)`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sectionsFound,
    sectionsRequired,
  }
}

export function validateSpecStructure(content: string, strict: boolean): SectionValidation {
  const errors: string[] = []
  const warnings: string[] = []
  const sectionsRequired = [
    'Recommended Technology Stack',
    'Implementation Approach',
    'Testing Strategy',
    'Acceptance Criteria',
  ]
  const sectionsFound: string[] = []

  // Check for required sections
  for (const section of sectionsRequired) {
    const hasSection =
      content.match(new RegExp(`^##\\s+${section}`, 'm')) ||
      content.match(new RegExp(`^###\\s+${section}`, 'm'))

    if (hasSection) {
      sectionsFound.push(section)
    } else {
      if (strict) {
        errors.push(`Missing required spec section: ${section}`)
      } else {
        warnings.push(`Missing spec section: ${section}`)
      }
    }
  }

  // Check for code examples
  const codeExampleCount = countCodeExamples(content)
  if (codeExampleCount < 3) {
    if (strict) {
      errors.push(`Found only ${codeExampleCount} code examples. Required: 3+`)
    } else {
      warnings.push(`Found only ${codeExampleCount} code examples (recommended: 3+)`)
    }
  }

  // Check for acceptance criteria count
  const acceptanceCriteria = extractAcceptanceCriteria(content)
  if (acceptanceCriteria.length < 5) {
    warnings.push(`Found only ${acceptanceCriteria.length} acceptance criteria (recommended: 5+)`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    sectionsFound,
    sectionsRequired,
  }
}

export function validatePairing(
  adrPath: string,
  adrContent: string,
  specContent: string,
): PairingValidation {
  const errors: string[] = []

  // Extract ADR number from ADR content
  const adrHeaderMatch = adrContent.match(/^#\s+ADR-(\d+)/m)
  const adrNumber = adrHeaderMatch?.[1] ?? null

  // Extract ADR filename from path
  const adrFilename = adrPath.split('/').pop() || ''
  const adrBasename = adrFilename.replace('.md', '')

  // Check if spec references the ADR
  const specReferencesAdr =
    specContent.includes(adrFilename) ||
    specContent.includes(adrBasename) ||
    (adrNumber !== null && specContent.includes(`ADR-${adrNumber}`))

  if (!specReferencesAdr) {
    errors.push('Spec does not reference the ADR file')
  }

  // Check if spec references a different ADR
  if (adrNumber) {
    const differentAdrMatch = specContent.match(/ADR-(\d+)/g)
    if (differentAdrMatch) {
      for (const match of differentAdrMatch) {
        const refNumber = match.match(/ADR-(\d+)/)
        if (refNumber && refNumber[1] !== adrNumber) {
          errors.push(`Spec references different ADR (${match})`)
          break
        }
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    specReferencesAdr,
    adrNumber,
  }
}

export function validateContentQuality(content: string): QualityValidation {
  const errors: string[] = []
  const warnings: string[] = []

  // Detect TODOs and FIXMEs
  const todos = detectTodos(content)
  const todoCount = todos.length
  if (todoCount > 0) {
    errors.push(`Found ${todoCount} unresolved TODO/FIXME comments`)
  }

  // Detect placeholder text
  const placeholders = detectPlaceholders(content)
  const placeholderCount = placeholders.length
  if (placeholderCount > 0) {
    errors.push('Found placeholder text that needs to be filled in')
  }

  // Count code examples and alternatives
  const codeExampleCount = countCodeExamples(content)
  const alternativeCount = countAlternatives(content)
  const acceptanceCriteriaCount = extractAcceptanceCriteria(content).length

  return {
    errors,
    warnings,
    todoCount,
    placeholderCount,
    codeExampleCount,
    alternativeCount,
    acceptanceCriteriaCount,
  }
}

export async function validateAdrSpecPair(
  adrPath: string,
  specPath: string,
  options: ValidateOptions,
): Promise<ValidationReport> {
  const { readFile } = await import('fs/promises')

  // Read files
  const adrContent = await readFile(adrPath, 'utf-8')
  const specContent = await readFile(specPath, 'utf-8')

  // Validate ADR structure
  const adrValidation = validateAdrStructure(adrContent, options.strict)

  // Validate Spec structure
  const specValidation = validateSpecStructure(specContent, options.strict)

  // Validate pairing
  const pairingValidation = validatePairing(adrPath, adrContent, specContent)

  // Validate content quality
  const qualityValidation = validateContentQuality(adrContent + '\n' + specContent)

  // Aggregate results
  const allErrors = [
    ...adrValidation.errors,
    ...specValidation.errors,
    ...pairingValidation.errors,
    ...qualityValidation.errors,
  ]

  const allWarnings = [
    ...adrValidation.warnings,
    ...specValidation.warnings,
    ...qualityValidation.warnings,
  ]

  const valid = allErrors.length === 0

  // Generate summary
  const summary = generateSummary(valid, allErrors, allWarnings)

  return {
    valid,
    errors: allErrors,
    warnings: allWarnings,
    summary,
    adrValidation,
    specValidation,
    pairingValidation,
    qualityValidation,
  }
}

function generateSummary(valid: boolean, errors: string[], warnings: string[]): string {
  if (valid && warnings.length === 0) {
    return 'VALIDATION PASSED'
  } else if (valid && warnings.length > 0) {
    return `VALIDATION PASSED WITH WARNINGS (${warnings.length} warnings)`
  } else {
    return `VALIDATION FAILED (${errors.length} errors, ${warnings.length} warnings)`
  }
}
