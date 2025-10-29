# Architecture: Plan Domain Workflow with Task Agents

**Version:** 2.0 (Composable Architecture)
**Date:** 2025-10-30
**Status:** Design Phase

---

## Overview

This architecture defines how the plan domain orchestrates the planning lifecycle using **composable task agents** and the existing `/helpers:thinking-partner` research tool.

**Core Principle:** Everything is a composable unit. Commands use task agents internally. Task agents use the thinking partner for research. No tight coupling.

---

## The Planning Lifecycle

```
Feature Idea
  ↓
/plan:create-prd "feature description"
  └─ Uses: Task agent for research
  └─ Uses: /helpers:thinking-partner internally
  └─ Output: prd/feature.md
  ↓
/plan:generate-adrs prd/feature.md
  └─ Uses: Task agent for decision extraction
  └─ Uses: /helpers:thinking-partner internally
  └─ Output: adr/ADR-001.md, adr/ADR-002.md, ...
  ↓
/plan:create-spec adr/ADR-001.md
  └─ Uses: Task agent for implementation research
  └─ Uses: /helpers:thinking-partner internally
  └─ Output: specs/spec-adr-001.md
  ↓
/plan:to-vtm adr/*.md specs/*.md
  └─ Uses: Existing VTM CLI functionality
  └─ Output: VTM tasks
```

---

## Key Architectural Principles

### 1. Composability

**Every component is reusable:**

- `/helpers:thinking-partner` is generic research tool (already exists)
- Plan commands create task agents that USE thinking partner
- Task agents are launched via Task tool (Claude Code infrastructure)
- No intermediate JSON files exposed to users

### 2. Task Agents (Not Specialized Commands)

**Commands launch task agents internally:**

```
User runs: /plan:create-prd auth-system "multi-tenant auth"
  ↓
Command launches task agent with prompt:
  "You are a PRD creation agent. Research multi-tenant auth
   using /helpers:thinking-partner, then generate a structured PRD."
  ↓
Task agent internally calls:
  /helpers:thinking-partner "multi-tenant auth requirements" --deep
  ↓
Task agent processes research
  ↓
Task agent generates PRD markdown
  ↓
Command saves prd/auth-system.md
  ↓
User gets PRD file (no intermediate JSON)
```

**Key insight:** Task agents are the composition layer, not specialized thinking partners.

### 3. No Tight Coupling

**Generic thinking partner (already exists):**

```bash
/helpers:thinking-partner {topic} [--deep] [--sources=web|docs|code]
```

This is reusable by:

- `/plan:create-prd` (research requirements)
- `/plan:generate-adrs` (research decision patterns)
- `/plan:create-spec` (research implementation approaches)
- `/arch:analyze` (research architecture patterns)
- `/docs:create-guide` (research documentation best practices)
- ANY command that needs research

---

## Plan Domain Commands

### Command 1: `/plan:create-prd {name} [description]`

**Purpose:** Create a Product Requirements Document with research-backed content

**Usage:**

```bash
/plan:create-prd auth-system "multi-tenant authentication for SaaS"
/plan:create-prd payment-gateway
```

**How It Works:**

1. Command launches task agent with prompt
2. Task agent researches topic via `/helpers:thinking-partner`
3. Task agent structures research into PRD format
4. Task agent generates PRD markdown
5. Command saves to `prd/{name}.md`

**Task Agent Prompt:**

```
You are a PRD creation agent. Your job:

1. Research the topic using /helpers:thinking-partner:
   - Problem space and requirements
   - Common architectural approaches
   - Success criteria and metrics
   - Risks and constraints

2. Structure research into PRD format:
   - Overview (problem statement, vision, metrics)
   - Technical Decisions (architecture choices, trade-offs)
   - Requirements (functional, non-functional, edge cases)
   - Acceptance Criteria

3. Generate well-structured PRD markdown

Topic: {description}
Target file: prd/{name}.md
```

**Output:** `prd/{name}.md` with:

- Researched content (not blank template)
- Structured sections
- Clear technical decisions
- Testable requirements

---

### Command 2: `/plan:generate-adrs {prd-file}`

**Purpose:** Generate granular ADRs from PRD decisions

**Usage:**

```bash
/plan:generate-adrs prd/auth-system.md
```

**How It Works:**

1. Command reads PRD file
2. Command launches task agent with PRD content
3. Task agent analyzes PRD to extract distinct decisions
4. Task agent researches each decision via `/helpers:thinking-partner`
5. Task agent generates separate ADR for each decision
6. Command saves to `adr/ADR-XXX-{name}.md` (auto-numbered)

**Task Agent Prompt:**

```
You are an ADR generation agent. Your job:

1. Read and analyze this PRD:
   {prd_content}

2. Extract all distinct architectural decisions:
   - Look for: "Decision:", "We chose", "We will use"
   - Identify: Dependencies between decisions
   - Avoid: Grouping unrelated decisions

3. For each decision:
   - Research alternatives via /helpers:thinking-partner
   - Generate focused ADR with:
     - Context (why this decision matters)
     - Decision (what was decided)
     - Rationale (why this choice)
     - Consequences (what changes)
     - Alternatives Considered (what was rejected and why)

4. Generate separate ADR files (one per decision)
5. Link ADRs that have dependencies

Source PRD: {prd-file}
Output: adr/ADR-XXX-{slug}.md (one file per decision)
```

**Output:** Multiple ADR files:

- `adr/ADR-001-auth-protocol.md`
- `adr/ADR-002-token-storage.md`
- `adr/ADR-003-session-timeout.md`

Each ADR:

- Focuses on ONE decision
- References source PRD
- Links to dependent ADRs
- Researched alternatives

---

### Command 3: `/plan:create-spec {adr-file} [name]`

**Purpose:** Create technical specification for implementing an ADR

**Usage:**

```bash
/plan:create-spec adr/ADR-001-auth-protocol.md
/plan:create-spec adr/ADR-001-auth-protocol.md oauth2-impl
```

**How It Works:**

1. Command reads ADR file
2. Command launches task agent with ADR content
3. Task agent researches implementation approaches via `/helpers:thinking-partner`
4. Task agent compares libraries/frameworks
5. Task agent generates detailed implementation spec
6. Command saves to `specs/spec-{name}.md`

**Task Agent Prompt:**

```
You are a technical specification agent. Your job:

1. Read this ADR to understand the decision:
   {adr_content}

2. Research HOW to implement this using /helpers:thinking-partner:
   - Available libraries and frameworks
   - Code patterns and examples
   - Best practices and pitfalls
   - Performance characteristics
   - Testing approaches

3. Compare implementation options:
   - Integration effort
   - Maintenance burden
   - Test coverage
   - Performance
   - Security
   - Team expertise

4. Generate detailed spec with:
   - Technology stack recommendation
   - File structure
   - Code examples
   - Configuration
   - Integration points
   - Testing strategy
   - Acceptance criteria

Source ADR: {adr-file}
Output: specs/spec-{name}.md
```

**Output:** `specs/spec-{name}.md` with:

- Recommended technology stack
- Implementation approach
- Code examples
- Testing strategy
- Links back to source ADR

---

## Task Agent Architecture

### What is a Task Agent?

A task agent is launched via Claude Code's `Task` tool with a specialized prompt. The agent:

1. Receives a specific job (create PRD, extract decisions, research implementation)
2. Uses `/helpers:thinking-partner` for research
3. Processes research with domain-specific logic
4. Generates output (markdown files)
5. Returns result to calling command

### Task Agent vs Thinking Partner

**Thinking Partner:**

- Generic research tool
- Takes topic, returns findings
- Reusable across ANY domain
- Already exists

**Task Agent:**

- Domain-specific orchestrator
- Uses thinking partner internally
- Applies domain logic (PRD structure, ADR format, spec layout)
- Created per-command

### Example Task Agent Usage

```javascript
// Inside /plan:create-prd command implementation
const taskAgent = await Task({
  description: "Create PRD for auth-system",
  prompt: `
    You are a PRD creation agent.

    1. Research "multi-tenant authentication" using:
       /helpers:thinking-partner "multi-tenant auth requirements" --deep

    2. Structure findings into PRD format:
       - Overview (problem, vision, metrics)
       - Technical Decisions
       - Requirements
       - Acceptance Criteria

    3. Generate prd/auth-system.md
  `,
  subagent_type: "general-purpose",
})

// Task agent runs, uses thinking partner, generates PRD
// Command receives completed PRD
```

---

## Composability in Action

### Example 1: Simple Feature

```bash
# User creates PRD
/plan:create-prd payments "integrate Stripe"
  └─ Task agent researches Stripe integration
  └─ Task agent generates prd/payments.md

# User generates ADRs from PRD
/plan:generate-adrs prd/payments.md
  └─ Task agent extracts 2 decisions:
      - DECISION-001: Payment provider (Stripe)
      - DECISION-002: Webhook handling
  └─ Task agent generates:
      - adr/ADR-001-payment-provider.md
      - adr/ADR-002-webhook-handling.md

# User creates specs for each ADR
/plan:create-spec adr/ADR-001-payment-provider.md
  └─ Task agent researches Stripe SDK
  └─ Task agent generates specs/spec-payment-provider.md

/plan:create-spec adr/ADR-002-webhook-handling.md
  └─ Task agent researches webhook patterns
  └─ Task agent generates specs/spec-webhook-handling.md

# User converts to VTM tasks
/plan:to-vtm adr/*.md specs/*.md
  └─ Creates VTM tasks with full context
```

### Example 2: Reusing Thinking Partner

The thinking partner is called internally by multiple task agents in the same workflow:

```
/plan:create-prd:
  ↓ Task agent calls: /helpers:thinking-partner "auth requirements"

/plan:generate-adrs:
  ↓ Task agent calls: /helpers:thinking-partner "OAuth2 alternatives"
  ↓ Task agent calls: /helpers:thinking-partner "token storage options"

/plan:create-spec:
  ↓ Task agent calls: /helpers:thinking-partner "Passport.js implementation"
```

**Same tool, different contexts, different prompts.** This is true composability.

---

## Benefits of This Architecture

### 1. True Composability

- Thinking partner is generic, reusable
- Task agents use it with different prompts
- Commands orchestrate agents
- No tight coupling

### 2. User Experience

- User runs simple commands: `/plan:create-prd`
- No intermediate JSON files
- Research happens automatically
- Output is final document, not scaffold

### 3. Flexibility

- Can use thinking partner directly if needed
- Can use commands for full automation
- Can customize task agent prompts
- Can add new commands without modifying thinking partner

### 4. Maintainability

- Thinking partner is stable (doesn't change)
- Task agents are command-specific (isolated)
- Clear separation of concerns
- Easy to test each layer

---

## Implementation Roadmap

### Phase 1: Command Infrastructure (8 hours) ✅ COMPLETED

- [x] Define command signatures
- [x] Create task agent prompt templates
- [x] Test task agent → thinking partner flow
- [x] Validate output quality

**Status:** Command specifications completed for all three commands:

- `.claude/commands/plan/create-prd.md` - PRD creation with research
- `.claude/commands/plan/generate-adrs.md` - Decision extraction and ADR generation
- `.claude/commands/plan/create-spec.md` - Implementation specification with code examples

### Phase 2: PRD Creation (4 hours)

- [ ] Implement `/plan:create-prd` command in JavaScript
- [ ] Test PRD generation with real examples
- [ ] Validate research quality
- [ ] Validate PRD output format

### Phase 3: ADR Generation (6 hours)

- [ ] Implement `/plan:generate-adrs` command in JavaScript
- [ ] Test decision extraction logic
- [ ] Test multi-ADR generation
- [ ] Test dependency linking

### Phase 4: Spec Creation (5 hours)

- [ ] Implement `/plan:create-spec` command in JavaScript
- [ ] Test implementation research
- [ ] Test technology comparison
- [ ] Test code example generation

### Phase 5: Integration & Polish (3 hours)

- [ ] End-to-end testing (PRD → ADRs → Specs)
- [ ] Error handling and edge cases
- [ ] User documentation
- [ ] Example workflows

**Total: 26 hours**
**Completed: Phase 1 (8 hours)**
**Remaining: 18 hours**

---

## Success Criteria

**For Architecture:**

- [ ] Thinking partner remains unchanged (generic tool)
- [ ] Commands use task agents internally
- [ ] No intermediate JSON exposed to users
- [ ] Task agents are composable and testable

**For User Experience:**

- [ ] One command creates complete PRD (not blank template)
- [ ] Multiple focused ADRs generated (not monolithic)
- [ ] Specs include implementation guidance
- [ ] Full traceability: PRD → ADR → Spec

**For Quality:**

- [ ] Research is comprehensive (web + docs + code)
- [ ] Documents are well-structured
- [ ] Decisions are clearly explained
- [ ] Implementation approaches are practical

---

## Next Steps

1. ~~Review this architecture design~~ ✅ COMPLETED
2. ~~Validate task agent approach~~ ✅ COMPLETED
3. ~~Create command specifications for:~~ ✅ COMPLETED
   - ~~`/plan:create-prd`~~ ✅ COMPLETED
   - ~~`/plan:generate-adrs`~~ ✅ COMPLETED
   - ~~`/plan:create-spec`~~ ✅ COMPLETED
4. Prototype one command end-to-end (implement `/plan:create-prd`)
5. Test composability with thinking partner
6. Iterate based on results

---

**Status:** Command specifications complete, ready for implementation prototyping

**Completed Artifacts:**

- Architecture document: `docs/ARCHITECTURE-PLAN-WORKFLOW.md`
- Command spec: `.claude/commands/plan/create-prd.md`
- Command spec: `.claude/commands/plan/generate-adrs.md`
- Command spec: `.claude/commands/plan/create-spec.md`

**Next Phase:** Implement JavaScript command files that use Claude Code's Task tool to launch task agents
