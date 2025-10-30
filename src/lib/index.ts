// src/lib/index.ts

export * from './types'
export * from './vtm-reader'
export * from './vtm-writer'
export * from './context-builder'
export * from './vtm-summary'
export * from './task-validator'
export * from './task-quality-validator'
export * from './task-ingest-helper'
export * from './decision-engine'
export * from './component-analyzer'
export * from './issue-detector'
export * from './refactoring-planner'
export * from './deep-analysis-engine'
export * from './vtm-session'
export * from './vtm-config'
export * from './batch-spec-creator'
export * from './plan-validators'
export * from './research-cache'
export * from './vtm-history'
export * from './vtm-git-workflow'
export * from './vtm-git-cli'

// Note: adr-spec-validator is not exported here to avoid naming conflicts
// with plan-validators. Import directly from './adr-spec-validator' when needed.
