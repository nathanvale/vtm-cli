# Architecture: Composable Thinking Partners for Planning Lifecycle

**Version:** 2.0 (Improved from initial PRD design)
**Date:** 2025-10-30
**Status:** Design Phase
**Key Innovation:** Structured, composable thinking partners that output actionable JSON

---

## Executive Summary

The original PRD workflow design had a critical limitation: **thinking happens only in the user's head or in AI prompts, not as first-class artifacts**.

This improved architecture makes **thinking explicit and composable** through three independent thinking partners:

1. **PRD Ideation Thinking Partner** - Researches problem space, guides PRD creation
2. **ADR Decomposition Thinking Partner** - Breaks down decisions, plans ADR structure
3. **Tech Spec Creation** - Separate, focused workflow (detailed below)

Each thinking partner:
- Takes input (idea, PRD, requirements)
- Does deep research/analysis
- **Outputs structured JSON** (not just prose)
- Enables next stage to **automate or guide** work

---

## Problem with Original Architecture

### Issue 1: Blank Page Syndrome
```
User: "I need authentication"
  ↓
/plan:create-prd auth
  ↓
[Shows empty template]
User stares at blank page...
  ↓
Rushed/incomplete PRD
```

**Solution:** PRD Ideation thinking partner researches the space BEFORE template, provides structured scaffold.

### Issue 2: Monolithic ADR Generation
```
1 PRD (contains 5 different decisions)
  ↓
/plan:to-adr
  ↓
1 Large ADR (covers all 5 decisions poorly)
  ↓
Hard to review, hard to update, hard to reference
```

**Solution:** ADR Decomposition thinking partner identifies separate decisions, enables granular ADR generation.

### Issue 3: No Composition
```
Commands are linear, not composable:
/plan:create-prd
  ↓ (forced to continue)
/plan:to-adr
  ↓ (forced to continue)
/plan:to-spec
  ↓ (forced to continue)
/plan:to-vtm

Can't call thinking partners independently
Can't combine in different ways
Can't reuse thinking for different purposes
```

**Solution:** Thinking partners are first-class, callable independently, output reusable JSON.

---

## Improved Architecture: Three Thinking Partners

### Stage 1: PRD Ideation Thinking Partner

**Purpose:** Research problem space and guide PRD creation

**When to use:**
- User has vague feature idea
- Want comprehensive thinking before writing
- Need research context
- Want structured scaffold to start from

**Input:**
```bash
/helpers:thinking-partner:prd-ideation "multi-tenant authentication for SaaS platform"
```

**Process:**
1. **Research phase** (4-5 minutes)
   - Web search: best practices for multi-tenant auth
   - Docs search: OAuth2, JWT, SAML specs
   - Code search: GitHub implementations
   - Security considerations
   - Common architectural decisions
   - Trade-offs observed in real systems

2. **Synthesis phase**
   - Extract key decision points
   - Identify requirements categories
   - Suggest approaches
   - Flag security/compliance considerations

3. **Output:** Structured JSON scaffold

**Output Structure:**
```json
{
  "topic": "multi-tenant authentication for SaaS",
  "problem_analysis": {
    "problem_statement": "Multi-tenant systems need to...",
    "constraints": ["Compliance", "Performance", "Security"],
    "stakeholders": ["Users", "Admins", "Compliance"],
    "research_context": "Industry best practices show..."
  },
  "technical_decisions_identified": [
    {
      "id": "DECISION-AUTH-001",
      "title": "Authentication Protocol Selection",
      "context": "Choosing between OAuth2, SAML, custom JWT...",
      "options": [
        {
          "option": "OAuth2 with OIDC",
          "pros": ["Standard", "Wide library support", "Good for SSO"],
          "cons": ["More complex", "Extra network calls"],
          "best_for": "Enterprise/multi-tenant"
        },
        {
          "option": "JWT with custom validation",
          "pros": ["Lightweight", "Full control"],
          "cons": ["Security burden", "Token revocation complex"]
        }
      ],
      "recommended": "OAuth2 with OIDC for multi-tenant compliance"
    }
  ],
  "requirements_checklist": [
    {
      "category": "Security",
      "items": [
        "Tenant isolation enforced",
        "Token expiration configurable",
        "Refresh token rotation",
        "Password complexity rules"
      ]
    },
    {
      "category": "Compliance",
      "items": [
        "GDPR-compliant data handling",
        "SAML 2.0 support (B2B)",
        "MFA capability",
        "Audit logging"
      ]
    }
  ],
  "architectural_approaches": [
    {
      "name": "Centralized Auth Service",
      "description": "Separate microservice handles all auth",
      "pros": ["Scales independently", "Reusable across services"],
      "cons": ["Extra latency", "More infrastructure"],
      "suitable_for": "Large multi-tenant platforms"
    }
  ],
  "research_sources": [
    {
      "title": "OAuth 2.0 for Multi-Tenant Systems",
      "url": "https://example.com",
      "relevance": 0.95
    }
  ],
  "next_steps": [
    "Review recommended approach",
    "Decide on OAuth2 vs SAML vs JWT",
    "Create PRD using this scaffold"
  ]
}
```

**How it guides PRD creation:**
```bash
/plan:create-prd auth-system --from prd-ideation-output.json
```

The command uses JSON to:
- Pre-populate Problem Statement section
- Pre-fill Technical Decisions with researched options
- List Requirements categories
- Include research sources as references
- User reviews/edits each section

**Acceptance Criteria:**
- [ ] Identifies 3-5 key architectural decisions
- [ ] Researches options for each decision
- [ ] Provides 5+ research sources
- [ ] Completes in 3-5 minutes
- [ ] Outputs valid, actionable JSON

---

### Stage 2: ADR Decomposition Thinking Partner

**Purpose:** Break down decisions in completed PRD, plan ADR structure

**When to use:**
- PRD is complete
- Want to identify all distinct decisions
- Need to order decisions (dependencies)
- Want to verify nothing was missed

**Input:**
```bash
/helpers:thinking-partner:adr-decomposition prd/auth-system.md
```

**Process:**
1. **Analysis phase**
   - Read PRD completely
   - Extract all distinct decisions mentioned
   - Identify decision relationships (which depends on which)
   - Group related decisions
   - Verify no circular dependencies

2. **Planning phase**
   - Suggest ADR grouping (one decision per ADR)
   - Order ADRs by dependency (independent first)
   - Verify complete coverage
   - Flag any missing context

3. **Output:** Decomposition plan as JSON

**Output Structure:**
```json
{
  "prd_file": "prd/auth-system.md",
  "identified_decisions": [
    {
      "id": "DECISION-001",
      "title": "Authentication Protocol (OAuth2 vs JWT vs SAML)",
      "source_prd_sections": ["## Technical Decisions > ## Architecture Choices"],
      "source_lines": [42, 58],
      "context": "Multi-tenant system needs to support both internal users and B2B partners",
      "decision_type": "core-architecture",
      "impact": "high"
    },
    {
      "id": "DECISION-002",
      "title": "Session Storage Location (Database vs Redis)",
      "source_prd_sections": ["## Technical Decisions > ## Trade-offs"],
      "source_lines": [67, 82],
      "context": "Session state needs to be shared across multiple auth service instances",
      "decision_type": "infrastructure",
      "impact": "high",
      "depends_on": ["DECISION-001"]
    },
    {
      "id": "DECISION-003",
      "title": "Token Refresh Strategy",
      "source_prd_sections": ["## Requirements > ## Non-Functional"],
      "decision_type": "implementation",
      "impact": "medium",
      "depends_on": ["DECISION-001"]
    }
  ],
  "decision_graph": {
    "independent": ["DECISION-001"],
    "level_1_depends_on_0": ["DECISION-002", "DECISION-003"],
    "circular_dependencies": []
  },
  "suggested_adr_structure": [
    {
      "adr_number": 1,
      "title": "Authentication Protocol Selection",
      "covers_decisions": ["DECISION-001"],
      "status": "proposed",
      "order": 0,
      "blocking_for": ["ADR-002", "ADR-003"]
    },
    {
      "adr_number": 2,
      "title": "Session State Storage",
      "covers_decisions": ["DECISION-002"],
      "status": "proposed",
      "order": 1,
      "depends_on_adr": [1]
    },
    {
      "adr_number": 3,
      "title": "Token Refresh and Rotation",
      "covers_decisions": ["DECISION-003"],
      "status": "proposed",
      "order": 1,
      "depends_on_adr": [1]
    }
  ],
  "coverage_analysis": {
    "total_decisions": 3,
    "covered_by_adr": 3,
    "missing": 0,
    "completeness": "100%"
  },
  "generation_plan": {
    "recommended_order": [
      {
        "sequence": 1,
        "adr_ids": [1],
        "reason": "Independent, foundation for others"
      },
      {
        "sequence": 2,
        "adr_ids": [2, 3],
        "reason": "Parallel: both depend only on ADR-1"
      }
    ],
    "estimated_generation_time": "3-5 minutes for 3 ADRs"
  },
  "quality_metrics": {
    "decision_granularity": "good (3 focused decisions)",
    "dependency_complexity": "low (clear linear dependency)",
    "coverage_confidence": 0.95
  }
}
```

**How it enables ADR generation:**
```bash
/plan:generate-adrs prd/auth-system.md --from decomposition-output.json
```

The command uses JSON to:
- Generate 3 separate ADRs (one per decision)
- Order them correctly (independent first)
- Link each ADR to source PRD sections
- Pre-populate decision context
- Set correct status and relationships

**Acceptance Criteria:**
- [ ] Identifies all distinct decisions (90%+ confidence)
- [ ] Detects decision dependencies
- [ ] Suggests non-circular ADR ordering
- [ ] Provides source PRD line numbers
- [ ] Completes in 2-3 minutes
- [ ] Outputs valid JSON

---

### Stage 3: Tech Spec (Separate Path)

**Purpose:** Create technical specifications independently

**Key Principle:** Tech specs are **not generated from ADRs**. They're **independent specifications** that reference the decisions but add implementation detail.

**Workflow:**
```
PRD completed
  ↓
ADRs created
  ↓
/plan:create-spec auth-system
  ↓
[Separate thinking-partner for specs (optional)]
/helpers:thinking-partner:spec-requirements prd/auth-system.md
  ↓
[Outputs: detailed requirements, acceptance criteria, test cases]
  ↓
/plan:generate-spec auth-system --from spec-output.json
  ↓
Spec completed
```

**Why separate path?**
- ADRs answer "what's the architecture?"
- Specs answer "how do we implement this?"
- Different audiences (architects vs developers)
- Specs don't depend on ADR decisions
- Can be created in parallel with ADRs

---

## Composability in Action

### Example 1: Simple Feature (Linear)
```
User has idea
  ↓
/helpers:thinking-partner:prd-ideation "feature description"
  ↓
/plan:create-prd --from ideation-output.json
  ↓
/helpers:thinking-partner:adr-decomposition prd/feature.md
  ↓
/plan:generate-adrs --from decomposition-output.json
  ↓
/plan:create-spec feature
  ↓
/plan:to-vtm adrs/ specs/
```

### Example 2: Complex Feature (Decomposed)
```
User researches
  ↓
/helpers:thinking-partner:prd-ideation
  ↓
/plan:create-prd complex-feature --from ideation.json
  ↓
User refines PRD with additional research
  ↓
/helpers:thinking-partner:adr-decomposition prd/complex.md
  ↓
[Thinking partner identifies 7 decisions in 2 levels]
  ↓
/plan:generate-adrs --from decomposition.json
  ↓ [Creates ADR-1 through ADR-7 with proper ordering]
  ↓
User reviews, discusses ADRs
  ↓
/plan:create-spec complex-feature
  ↓
[Spec references all ADRs but focuses on implementation]
```

### Example 3: Reuse Thinking Partner Output
```
Thinking partner output saved: ideation-auth.json

Later, start different feature that needs auth:
  ↓
/plan:create-prd new-feature --from ideation-auth.json
  ↓
[Reuses researched auth decisions]
  ↓
[Only need to customize for new context]

Composability enables: research reuse, decision pattern library, best practices sharing
```

---

## Key Design Principles

### 1. **Explicit Thinking**
- Thinking happens in thinking partners
- Results saved as JSON
- Can be reviewed, discussed, refined
- Not hidden inside AI prompts

### 2. **Composability**
- Each thinking partner works independently
- Output of one feeds input of next
- Can use outputs in different ways
- Can call in different order if needed

### 3. **Structured Data**
- Outputs are JSON, not prose
- Machine-readable
- Can be parsed, validated, transformed
- Enables automation

### 4. **Separation of Concerns**
- PRD thinking ≠ ADR thinking ≠ Spec thinking
- Each has distinct purpose
- Each can be improved independently
- Different audiences for outputs

### 5. **Human in the Loop**
- Thinking partner outputs guide, not dictate
- User reviews all outputs
- User can override recommendations
- AI assists, humans decide

---

## Implementation Roadmap

### Phase 1: Thinking Partner Infrastructure
- [ ] Create base thinking-partner framework
- [ ] Implement JSON output schema validation
- [ ] Build caching for expensive research
- [ ] Test thinking-partner API

### Phase 2: PRD Ideation Partner
- [ ] Implement web/docs/code research
- [ ] Build decision extraction logic
- [ ] Design PRD scaffold generation
- [ ] Create templates with hooks for outputs

### Phase 3: ADR Decomposition Partner
- [ ] Implement PRD parsing and analysis
- [ ] Build decision extraction from PRD
- [ ] Design dependency detection
- [ ] ADR ordering algorithms

### Phase 4: Integration
- [ ] Connect thinking partners to plan commands
- [ ] /plan:create-prd --from ideation.json
- [ ] /plan:generate-adrs --from decomposition.json
- [ ] Full workflow testing

### Phase 5: Polish
- [ ] Spec thinking partner (optional)
- [ ] Caching and performance
- [ ] Error handling and recovery
- [ ] Documentation and examples

---

## Technical Decisions to Make

### Decision 1: Thinking Partner Output Format
**Options:**
- JSON only (structured, machine-readable)
- JSON + Markdown (structured + human-readable)
- Interactive JSON (user refines before next step)

**Recommendation:** JSON + Markdown format:
- Save as `ideation-auth.json` (machine use)
- Display as `ideation-auth.md` (human review)
- Both generated from same thinking process

### Decision 2: Thinking Partner Location
**Options:**
- Separate `.claude/helpers/` domain
- Integrated into `.claude/commands/plan/`
- Independent MCP servers

**Recommendation:** Separate helpers domain
- Keep plan domain focused on execution
- Helpers are reusable across domains
- Clear separation of concerns

### Decision 3: Composition Implementation
**Options:**
- CLI flags: `/plan:create-prd --from ideation.json`
- Separate compose commands: `/plan:compose prd`
- State management: `/vtm session set thinking-output`

**Recommendation:** CLI flags + optional state
- Simple for single transformations
- State support for multi-step workflows
- Backward compatible

---

## Success Criteria

**For PRD Ideation Partner:**
- [ ] Reduces blank-page syndrome (users start with structure)
- [ ] Identifies 80%+ of architectural decisions
- [ ] Provides research-backed recommendations
- [ ] Completes in <5 minutes

**For ADR Decomposition Partner:**
- [ ] Identifies all distinct decisions (90%+ coverage)
- [ ] Suggests optimal ADR grouping
- [ ] Detects decision dependencies
- [ ] Generates valid ADR ordering

**For Overall Architecture:**
- [ ] Commands are composable (can use in different order)
- [ ] Outputs are reusable (can use thinking partner output multiple ways)
- [ ] Backward compatible (existing workflows still work)
- [ ] Improved UX (less blank page, more guided)

---

## Next Steps

1. **Review and refine** this architecture
2. **Create detailed thinking-partner specs** for each stage
3. **Design JSON schemas** for each output
4. **Build thinking-partner framework**
5. **Implement PRD ideation partner first** (highest value)
6. **Test end-to-end workflows**
7. **Gather user feedback**
8. **Iterate based on real usage**

---

## Appendix: Comparison with Original Design

| Aspect | Original | Improved |
|--------|----------|----------|
| **PRD Creation** | Template + manual fill | Research-guided scaffold |
| **Blank Page Problem** | No solution | Ideation thinking partner |
| **ADR Generation** | 1 PRD → 1 ADR | Decomposition → multiple granular ADRs |
| **Composability** | Linear (forced order) | Flexible (reusable outputs) |
| **Thinking Visibility** | Hidden in prompts | Explicit as JSON artifacts |
| **Automation Potential** | Limited | High (structured outputs) |
| **Reusability** | Low | High (JSON can be reused) |
| **User Control** | Limited preview | Full review at each stage |

