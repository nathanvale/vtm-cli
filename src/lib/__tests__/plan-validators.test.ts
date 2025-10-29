import { describe, it, expect } from 'vitest'
import {
  validateAdrFile,
  validatePrdFile,
  validateSpecFile,
  validateAdrSpecPair,
  validateRelatedAdrs,
} from '../plan-validators'

// Test Suite 1: ADR Validation
describe('validateAdrFile', () => {
  it('passes valid ADR with all required sections', () => {
    const content = `
# ADR-001: Decision Title

## Status
Draft

## Context
Some context about the decision.

## Decision
We will use approach X.

## Consequences
Positive and negative consequences.

## Alternatives Considered
### Alternative 1
Description of alternative 1

### Alternative 2
Description of alternative 2

### Alternative 3
Description of alternative 3
    `

    // This will fail until we implement validateAdrFile
    const result = validateAdrFile('adr/ADR-001.md', content)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('fails ADR missing Status section', () => {
    const content = `
# ADR-001: Decision Title

## Context
Some context

## Decision
We will use X

## Consequences
Some consequences
    `

    const result = validateAdrFile('adr/ADR-001.md', content)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing required section: ## Status')
  })

  it('fails ADR missing Decision section', () => {
    const content = `
# ADR-001: Decision Title

## Status
Draft

## Context
Some context

## Consequences
Some consequences
    `

    const result = validateAdrFile('adr/ADR-001.md', content)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing required section: ## Decision')
  })

  it('warns if only 2 alternatives listed', () => {
    const content = `
# ADR-001: Decision Title

## Status
Draft

## Context
Context

## Decision
Decision

## Consequences
Consequences

## Alternatives Considered
### Alternative 1
Description

### Alternative 2
Description
    `

    const result = validateAdrFile('adr/ADR-001.md', content)

    expect(result.valid).toBe(true)
    expect(result.warnings).toContain('Found only 2 alternatives (recommended: 3+)')
  })

  it('fails if no ADR-XXX header found', () => {
    const content = `
# Some Random Title

## Status
Draft

## Context
Context

## Decision
Decision

## Consequences
Consequences
    `

    const result = validateAdrFile('adr/ADR-001.md', content)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Missing ADR header (e.g., "# ADR-001: Decision Title")')
  })
})

// Test Suite 2: PRD Validation
describe('validatePrdFile', () => {
  it('passes valid PRD with spec_type: prd', () => {
    const content = `
---
spec_type: prd
---

# Feature Name — PRD

## 1) Problem & Outcomes
Problem statement

## 2) Users & Jobs
User info

## 3) Scope (MVP → v1)
Scope details
    `

    const result = validatePrdFile('docs/prd/feature.md', content)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('warns if missing spec_type: prd header', () => {
    const content = `
# Feature Name — PRD

## 1) Problem & Outcomes
Problem statement here

## 2) Users & Jobs
User info here

## 3) Scope (MVP → v1)
Scope details
    `

    const result = validatePrdFile('docs/prd/feature.md', content)

    expect(result.valid).toBe(true)
    expect(result.warnings).toContain("Missing 'spec_type: prd' in frontmatter")
  })

  it('fails if file is too short (< 10 lines)', () => {
    const content = `
# Feature

Small content
    `

    const result = validatePrdFile('docs/prd/feature.md', content)

    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('PRD file appears too short')
  })
})

// Test Suite 3: Spec Validation
describe('validateSpecFile', () => {
  it('passes valid spec referencing ADR', () => {
    const content = `
# Technical Specification

**Source ADR:** ADR-001-auth.md

## Overview
Implementation details

## Decision
Based on ADR-001
    `

    const result = validateSpecFile('docs/specs/spec-auth.md', content)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('fails if spec does not reference ADR', () => {
    const content = `
# Technical Specification

## Overview
Implementation details without ADR reference
    `

    const result = validateSpecFile('docs/specs/spec-auth.md', content)

    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Spec does not reference an ADR file')
  })

  it('warns if missing Decision section', () => {
    const content = `
# Technical Specification

**Source ADR:** ADR-001-auth.md

## Overview
Implementation details
    `

    const result = validateSpecFile('docs/specs/spec-auth.md', content)

    expect(result.valid).toBe(true)
    expect(result.warnings).toContain('Missing recommended section: ## Decision')
  })
})

// Test Suite 4: ADR+Spec Pairing
describe('validateAdrSpecPair', () => {
  it('passes when spec references ADR correctly', () => {
    const adrPath = 'docs/adr/ADR-001-auth.md'
    const specPath = 'docs/specs/spec-auth.md'

    const adrContent = `
# ADR-001: Auth Decision

## Status
Approved

## Decision
Use OAuth2
    `

    const specContent = `
# Auth Spec

**Source ADR:** ADR-001-auth.md

## Implementation
Details
    `

    const result = validateAdrSpecPair(adrPath, specPath, adrContent, specContent)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('fails when spec references different ADR', () => {
    const adrPath = 'docs/adr/ADR-001-auth.md'
    const specPath = 'docs/specs/spec-auth.md'

    const adrContent = `# ADR-001: Auth Decision`
    const specContent = `**Source ADR:** ADR-002-storage.md`

    const result = validateAdrSpecPair(adrPath, specPath, adrContent, specContent)

    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('does not reference')
  })

  it('fails when files in wrong order', () => {
    const adrPath = 'docs/specs/spec-auth.md' // spec as first arg
    const specPath = 'docs/adr/ADR-001-auth.md' // adr as second arg

    const adrContent = `# Some content`
    const specContent = `# Some content`

    const result = validateAdrSpecPair(adrPath, specPath, adrContent, specContent)

    expect(result.valid).toBe(false)
    expect(result.errors[0]).toContain('First argument must be an ADR file')
  })
})

// Test Suite 5: Related ADRs Validation
describe('validateRelatedAdrs', () => {
  it('passes when all related ADRs exist', () => {
    const adrIds = ['ADR-001', 'ADR-002']
    const existingAdrs = ['ADR-001-auth.md', 'ADR-002-storage.md', 'ADR-003-api.md']

    const result = validateRelatedAdrs(adrIds, existingAdrs)

    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('warns when related ADR does not exist', () => {
    const adrIds = ['ADR-001', 'ADR-999']
    const existingAdrs = ['ADR-001-auth.md', 'ADR-002-storage.md']

    const result = validateRelatedAdrs(adrIds, existingAdrs)

    expect(result.valid).toBe(true)
    expect(result.warnings).toContain('Related ADR not found: ADR-999')
  })

  it('handles empty related ADRs list', () => {
    const adrIds: string[] = []
    const existingAdrs = ['ADR-001-auth.md']

    const result = validateRelatedAdrs(adrIds, existingAdrs)

    expect(result.valid).toBe(true)
    expect(result.warnings).toHaveLength(0)
  })
})
