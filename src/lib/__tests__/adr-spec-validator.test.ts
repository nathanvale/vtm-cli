// src/lib/__tests__/adr-spec-validator.test.ts

import {
  validateAdrStructure,
  validateSpecStructure,
  validatePairing,
  validateContentQuality,
  validateAdrSpecPair,
  countCodeExamples,
  countAlternatives,
  extractAcceptanceCriteria,
  detectPlaceholders,
  detectTodos,
} from '../adr-spec-validator'
import { readFile } from 'fs/promises'
import { resolve } from 'path'

// Test data paths
const TEST_DATA_DIR = resolve(__dirname, '../../../test-data')
const ADR_DIR = resolve(TEST_DATA_DIR, 'adr')
const SPEC_DIR = resolve(TEST_DATA_DIR, 'specs')

describe('validateAdrStructure', () => {
  it('passes valid ADR with all sections', () => {
    const content = `
# ADR-001: OAuth2 Authentication

## Status
Draft

## Context
We need authentication

## Decision
Use OAuth2

## Consequences
- Pro: Industry standard
- Con: Complex

## Alternatives Considered
### Alternative 1: JWT
### Alternative 2: SAML
### Alternative 3: Basic Auth
    `
    const result = validateAdrStructure(content, false)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('fails when Status section missing', () => {
    const content = `# ADR-001: Title\n## Context\n## Decision`
    const result = validateAdrStructure(content, false)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing required section: ## Status')
  })

  it('fails when Context section missing', () => {
    const content = `# ADR-001: Title\n## Status\n## Decision`
    const result = validateAdrStructure(content, false)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing required section: ## Context')
  })

  it('fails when Decision section missing', () => {
    const content = `# ADR-001: Title\n## Status\n## Context`
    const result = validateAdrStructure(content, false)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing required section: ## Decision')
  })

  it('fails when Consequences section missing', () => {
    const content = `# ADR-001: Title\n## Status\n## Context\n## Decision`
    const result = validateAdrStructure(content, false)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing required section: ## Consequences')
  })

  it('warns when only 2 alternatives in normal mode', () => {
    const content = `
# ADR-001: Title
## Status
Draft
## Context
Context
## Decision
Decision
## Consequences
- Pro: Good
## Alternatives Considered
### Alternative 1
### Alternative 2
    `
    const result = validateAdrStructure(content, false)
    expect(result.valid).toBe(true)
    expect(result.warnings).toContain('Found only 2 alternatives (recommended: 3+)')
  })

  it('fails with only 2 alternatives in strict mode', () => {
    const content = `
# ADR-001: Title
## Status
Draft
## Context
Context
## Decision
Decision
## Consequences
- Pro: Good
## Alternatives Considered
### Alternative 1
### Alternative 2
    `
    const result = validateAdrStructure(content, true)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Found only 2 alternatives. Required: 3+')
  })

  it('fails when no ADR header found', () => {
    const content = '# Regular Document'
    const result = validateAdrStructure(content, false)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing ADR header')
  })
})

describe('validateSpecStructure', () => {
  it('passes valid spec with required sections', () => {
    const content = `
# Technical Specification: OAuth2 Auth

## Recommended Technology Stack
Passport.js

## Implementation Approach
...

## Testing Strategy
TDD approach

## Acceptance Criteria
- [ ] AC1
- [ ] AC2
- [ ] AC3
- [ ] AC4
- [ ] AC5

\`\`\`typescript
// Code example 1
\`\`\`

\`\`\`typescript
// Code example 2
\`\`\`

\`\`\`typescript
// Code example 3
\`\`\`
    `
    const result = validateSpecStructure(content, false)
    expect(result.valid).toBe(true)
  })

  it('warns when missing Technology Stack in normal mode', () => {
    const content = `
# Spec
## Implementation Approach
## Testing Strategy
## Acceptance Criteria
- [ ] AC1
    `
    const result = validateSpecStructure(content, false)
    expect(result.valid).toBe(true)
    expect(result.warnings).toContain('Missing spec section: Recommended Technology Stack')
  })

  it('fails when missing Technology Stack in strict mode', () => {
    const content = `
# Spec
## Implementation Approach
## Testing Strategy
## Acceptance Criteria
- [ ] AC1
    `
    const result = validateSpecStructure(content, true)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing required spec section: Recommended Technology Stack')
  })

  it('warns when less than 3 code examples in normal mode', () => {
    const content = `
# Spec
\`\`\`typescript
// Only 2 examples
\`\`\`
\`\`\`typescript
\`\`\`
    `
    const result = validateSpecStructure(content, false)
    expect(result.warnings).toContain('Found only 2 code examples (recommended: 3+)')
  })

  it('fails when less than 3 code examples in strict mode', () => {
    const content = `
# Spec
\`\`\`typescript
// Only 2 examples
\`\`\`
\`\`\`typescript
\`\`\`
    `
    const result = validateSpecStructure(content, true)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Found only 2 code examples. Required: 3+')
  })

  it('warns when less than 5 acceptance criteria', () => {
    const content = `
# Spec
## Acceptance Criteria
- [ ] AC1
- [ ] AC2
- [ ] AC3
    `
    const result = validateSpecStructure(content, false)
    expect(result.warnings).toContain('Found only 3 acceptance criteria (recommended: 5+)')
  })
})

describe('validatePairing', () => {
  it('passes when spec references ADR correctly', () => {
    const adrPath = 'adr/ADR-001-oauth2-auth.md'
    const adrContent = '# ADR-001: OAuth2 Auth'
    const specContent = `
# Spec
Source ADR: adr/ADR-001-oauth2-auth.md
References: ADR-001
    `
    const result = validatePairing(adrPath, adrContent, specContent)
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('fails when spec does not reference ADR', () => {
    const adrPath = 'adr/ADR-001-oauth2-auth.md'
    const adrContent = '# ADR-001'
    const specContent = '# Spec with no ADR reference'
    const result = validatePairing(adrPath, adrContent, specContent)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Spec does not reference the ADR file')
  })

  it('fails when spec references different ADR', () => {
    const adrPath = 'adr/ADR-001-oauth2-auth.md'
    const adrContent = '# ADR-001'
    const specContent = 'References: ADR-002'
    const result = validatePairing(adrPath, adrContent, specContent)
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Spec references different ADR (ADR-002)')
  })
})

describe('validateContentQuality', () => {
  it('detects TODO comments', () => {
    const content = '# Doc\nTODO: Fix this\nFIXME: Update that'
    const result = validateContentQuality(content)
    expect(result.errors).toContain('Found 2 unresolved TODO/FIXME comments')
  })

  it('detects placeholder text', () => {
    const content = 'INSERT HERE\n[FILL IN]\n[REDACTED]'
    const result = validateContentQuality(content)
    expect(result.errors).toContain('Found placeholder text that needs to be filled in')
  })

  it('passes clean content', () => {
    const content = '# Clean Document\nNo issues here'
    const result = validateContentQuality(content)
    expect(result.errors).toHaveLength(0)
  })
})

describe('utility functions', () => {
  describe('countCodeExamples', () => {
    it('counts code blocks correctly', () => {
      const content = '```ts\ncode\n```\n```js\nmore\n```\n```py\nmore\n```'
      const count = countCodeExamples(content)
      expect(count).toBe(3)
    })

    it('returns 0 for no code blocks', () => {
      const content = '# Document with no code'
      const count = countCodeExamples(content)
      expect(count).toBe(0)
    })
  })

  describe('countAlternatives', () => {
    it('counts alternative sections', () => {
      const content = '### Alternative 1\n### Alternative 2\n### Alternative 3'
      const count = countAlternatives(content)
      expect(count).toBe(3)
    })

    it('returns 0 for no alternatives', () => {
      const content = '# Document'
      const count = countAlternatives(content)
      expect(count).toBe(0)
    })
  })

  describe('extractAcceptanceCriteria', () => {
    it('extracts checkbox criteria', () => {
      const content = '- [ ] AC1\n- [ ] AC2\n- [x] AC3'
      const criteria = extractAcceptanceCriteria(content)
      expect(criteria).toHaveLength(3)
      expect(criteria).toEqual(['AC1', 'AC2', 'AC3'])
    })

    it('returns empty array when no criteria found', () => {
      const content = '# Document'
      const criteria = extractAcceptanceCriteria(content)
      expect(criteria).toHaveLength(0)
    })
  })

  describe('detectPlaceholders', () => {
    it('detects common placeholder patterns', () => {
      const content = 'INSERT HERE\n[FILL IN]\n[REDACTED]'
      const placeholders = detectPlaceholders(content)
      expect(placeholders.length).toBeGreaterThan(0)
    })

    it('returns empty array for clean content', () => {
      const content = '# Clean content'
      const placeholders = detectPlaceholders(content)
      expect(placeholders).toHaveLength(0)
    })
  })

  describe('detectTodos', () => {
    it('detects TODO and FIXME comments', () => {
      const content = 'TODO: Fix\nFIXME: Update'
      const todos = detectTodos(content)
      expect(todos).toHaveLength(2)
    })

    it('returns empty array for content without TODOs', () => {
      const content = '# Clean content'
      const todos = detectTodos(content)
      expect(todos).toHaveLength(0)
    })
  })
})

describe('validateAdrSpecPair (integration)', () => {
  it('validates complete ADR+Spec pair successfully', async () => {
    const result = await validateAdrSpecPair(resolve(ADR_DIR, 'ADR-001-valid.md'), resolve(SPEC_DIR, 'spec-valid.md'), {
      strict: false,
    })
    expect(result.valid).toBe(true)
    expect(result.summary).toContain('VALIDATION PASSED')
  })

  it('fails with multiple errors', async () => {
    const result = await validateAdrSpecPair(
      resolve(ADR_DIR, 'ADR-002-invalid.md'),
      resolve(SPEC_DIR, 'spec-invalid.md'),
      { strict: false },
    )
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  it('strict mode enforces all requirements', async () => {
    const result = await validateAdrSpecPair(
      resolve(ADR_DIR, 'ADR-003-warnings.md'),
      resolve(SPEC_DIR, 'spec-warnings.md'),
      { strict: true },
    )
    expect(result.valid).toBe(false)
  })
})
