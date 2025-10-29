# TaskContext Types Documentation

## Overview

The VTM CLI now supports rich context extraction from ADR (Architecture Decision Records) and Specification documents. These types enable full traceability from tasks back to their source documents with line numbers.

## Type Hierarchy

```
Task (updated)
  ├─ context?: TaskRichContext (optional)
      ├─ adr: ADRContext
      ├─ spec: SpecContext
      └─ source_mapping: SourceMapping
```

## Core Types

### TaskRichContext

Container for all rich context information extracted from source documents.

```typescript
type TaskRichContext = {
  adr: ADRContext
  spec: SpecContext
  source_mapping: SourceMapping
}
```

### ADRContext

Context extracted from Architecture Decision Record documents.

```typescript
type ADRContext = {
  file: string // Path to ADR file (e.g., "adr/ADR-042-jwt.md")
  decision: string // The architectural decision
  rationale: string // Why this decision was made
  constraints: string[] // Technical constraints
  relevant_sections: SectionReference[] // Relevant ADR sections with line numbers
}
```

**Example:**

```typescript
const adrContext: ADRContext = {
  file: "adr/ADR-042-jwt.md",
  decision: "Use JWT tokens for stateless authentication",
  rationale: "Enables horizontal scaling and microservices compatibility",
  constraints: [
    "15 minute token expiry",
    "RS256 signing algorithm",
    "Include user claims",
  ],
  relevant_sections: [
    {
      section: "## Decision",
      lines: "10-25",
      content: "We will implement JWT tokens using RS256...",
      relevance: 1.0,
    },
  ],
}
```

### SpecContext

Context extracted from specification documents.

```typescript
type SpecContext = {
  file: string // Path to spec file (e.g., "specs/spec-auth.md")
  acceptance_criteria: string[] // Acceptance criteria
  test_requirements: TestRequirement[] // Test requirements
  code_examples: CodeExample[] // Code examples with line numbers
  constraints: string[] // Technical constraints
  relevant_sections: SectionReference[] // Relevant spec sections
}
```

**Example:**

```typescript
const specContext: SpecContext = {
  file: "specs/spec-auth.md",
  acceptance_criteria: [
    "Tokens include user ID, role, and expiry",
    "Tokens are signed with RS256 algorithm",
  ],
  test_requirements: [
    {
      type: "unit",
      description: "Test token generation with valid user data",
      acceptance_criterion: "Tokens include user ID, role, and expiry",
      lines: "65",
    },
  ],
  code_examples: [
    {
      language: "typescript",
      code: 'const token = jwt.sign(payload, privateKey, { algorithm: "RS256" });',
      description: "Example JWT token generation",
      file: "specs/spec-auth.md",
      lines: "85-87",
    },
  ],
  constraints: ["Use RS256 algorithm", "Token expiry 15 minutes"],
  relevant_sections: [],
}
```

### SourceMapping

Maps task elements back to their source document locations.

```typescript
type SourceMapping = {
  acceptance_criteria: LineReference[] // Line refs for each AC
  tests: LineReference[] // Line refs for test requirements
  examples: LineReference[] // Line refs for code examples
}
```

**Example:**

```typescript
const sourceMapping: SourceMapping = {
  acceptance_criteria: [
    {
      file: "specs/spec-auth.md",
      lines: "18",
      text: "AC1: Tokens include user ID, role, and expiry",
    },
  ],
  tests: [
    {
      file: "specs/spec-auth.md",
      lines: "65",
      text: "Unit test: Verify token contains user ID, role, expiry",
    },
  ],
  examples: [
    {
      file: "specs/spec-auth.md",
      lines: "85-87",
      text: "Example: jwt.sign(payload, privateKey, ...)",
    },
  ],
}
```

## Supporting Types

### SectionReference

References a section in a source document with relevance scoring.

```typescript
type SectionReference = {
  section: string // Section heading (e.g., "## JWT Token Generation")
  lines: string // Line range (e.g., "42-58")
  content: string // Actual text content
  relevance: number // Relevance score 0.0-1.0
}
```

### LineReference

References specific lines in a source document.

```typescript
type LineReference = {
  file: string // Source file path
  lines: string // Line number or range (e.g., "18" or "35-40")
  text: string // Actual text at location
}
```

### TestRequirement

Test requirement extracted from specification.

```typescript
type TestRequirement = {
  type: "unit" | "integration" | "e2e" | "acceptance"
  description: string // What should be tested
  acceptance_criterion: string // Which AC this validates
  lines: string // Line number in spec
}
```

### CodeExample

Code example from specification with source traceability.

```typescript
type CodeExample = {
  language: string // Programming language (e.g., "typescript", "javascript")
  code: string // Actual code content
  description: string // What this example demonstrates
  file: string // Source file location
  lines: string // Line range (e.g., "35-40")
}
```

## Task Type Updates

The `Task` type now includes an optional `context` field:

```typescript
type Task = {
  // ... existing fields ...
  context?: TaskRichContext // Optional rich context
}
```

This maintains backward compatibility - tasks without rich context work exactly as before.

## Backward Compatibility

### TaskContext → TaskWithDependencies

The original `TaskContext` type (used for dependency resolution) has been renamed to `TaskWithDependencies`:

```typescript
// Old name (deprecated but still works)
type TaskContext = TaskWithDependencies

// New name (preferred)
type TaskWithDependencies = {
  task: Task
  dependencies: Task[]
  blockedTasks: Task[]
}
```

Existing code using `TaskContext` will continue to work without changes.

## Usage Examples

### Creating a Task with Rich Context

```typescript
import type { Task, ADRContext, SpecContext, SourceMapping } from "./lib/types"

const task: Task = {
  id: "TASK-042",
  title: "Implement JWT tokens",
  // ... standard fields ...
  context: {
    adr: {
      file: "adr/ADR-042-jwt.md",
      decision: "Use JWT tokens for stateless authentication",
      rationale: "Scalability and microservices compatibility",
      constraints: ["15 min expiry", "RS256 algorithm"],
      relevant_sections: [
        {
          section: "## Decision",
          lines: "10-25",
          content: "We will implement JWT tokens...",
          relevance: 1.0,
        },
      ],
    },
    spec: {
      file: "specs/spec-auth.md",
      acceptance_criteria: ["AC1", "AC2"],
      test_requirements: [
        {
          type: "unit",
          description: "Test token generation",
          acceptance_criterion: "AC1",
          lines: "65",
        },
      ],
      code_examples: [],
      constraints: [],
      relevant_sections: [],
    },
    source_mapping: {
      acceptance_criteria: [
        { file: "specs/spec-auth.md", lines: "18", text: "AC1: ..." },
      ],
      tests: [],
      examples: [],
    },
  },
}
```

### Creating a Task without Context (Backward Compatible)

```typescript
const simpleTask: Task = {
  id: "TASK-001",
  title: "Simple task",
  // ... standard fields ...
  // No context field - works perfectly
}
```

### Accessing Rich Context

```typescript
function displayTaskContext(task: Task): void {
  if (task.context) {
    console.info(`ADR: ${task.context.adr.file}`)
    console.info(`Decision: ${task.context.adr.decision}`)
    console.info(`Spec: ${task.context.spec.file}`)

    // Display test requirements
    task.context.spec.test_requirements.forEach((req) => {
      console.info(`Test [${req.type}]: ${req.description} (line ${req.lines})`)
    })

    // Display code examples
    task.context.spec.code_examples.forEach((ex) => {
      console.info(`Example (${ex.language}): ${ex.description}`)
      console.info(`  Location: ${ex.file}:${ex.lines}`)
    })
  } else {
    console.info("No rich context available")
  }
}
```

## Integration with VTM Commands

### `/vtm:context` Command

The rich context types are designed to be used by the `/vtm:context` command to display comprehensive task information:

```bash
vtm context TASK-042
```

Output includes:

- Task details
- ADR decision and rationale
- Spec acceptance criteria with line numbers
- Test requirements with source references
- Code examples with syntax highlighting
- Full traceability back to source documents

### Task Generation from ADR+Spec

When generating tasks from ADR and Spec pairs, the extraction agent will:

1. Parse ADR and Spec markdown files
2. Extract decisions, rationale, and constraints
3. Identify relevant sections with line numbers
4. Map acceptance criteria to source locations
5. Extract test requirements and code examples
6. Build complete `TaskRichContext` for each task
7. Store in vtm.json with full traceability

## Benefits

1. **Traceability**: Every task element can be traced back to its source document and line number
2. **Context**: Developers get full context without reading entire ADR/Spec files
3. **Token Efficiency**: Rich context stored in vtm.json reduces token usage
4. **Validation**: Test requirements linked to acceptance criteria for verification
5. **Examples**: Code examples readily available during implementation
6. **Backward Compatible**: Existing tasks and code continue to work unchanged

## File Locations

- Type definitions: `/Users/nathanvale/code/vtm-cli/src/lib/types.ts`
- Example usage: `/Users/nathanvale/code/vtm-cli/src/lib/types.test.ts`
- This documentation: `/Users/nathanvale/code/vtm-cli/docs/task-context-types.md`
