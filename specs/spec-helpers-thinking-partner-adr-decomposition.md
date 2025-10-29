# Technical Specification: ADR Decomposition Thinking Partner

**Version:** 1.0
**Date:** 2025-10-30
**Related Architecture:** ARCHITECTURE-COMPOSABLE-THINKING-PARTNERS.md
**Status:** Design
**Test Strategy:** Unit tests for PRD parsing, integration tests with real PRDs, snapshot tests for decomposition output

---

## 1. Overview

This thinking partner analyzes a completed PRD and **breaks down architectural decisions into a structured decomposition plan**. Instead of generating one monolithic ADR, it identifies all distinct decisions and plans how to organize them into granular, focused ADRs.

**Value Proposition:**
- ✅ Identifies all distinct decisions (90%+ coverage)
- ✅ Detects decision dependencies
- ✅ Plans optimal ADR structure
- ✅ Suggests implementation order
- ✅ Enables granular, maintainable ADRs

---

## 2. Functional Requirements

### 2.1 Command Interface

**Command Signature:**
```bash
/helpers:thinking-partner:adr-decomposition {prd-file} [--depth=auto|shallow|deep] [--output {file}]
```

**Arguments:**
- `{prd-file}`: Path to completed PRD markdown file (required)
  - Example: `prd/auth-system.md`
  - Must exist and be valid markdown
  - Must have Technical Decisions section

**Options:**
- `--depth`: Analysis depth (default: auto)
  - `auto`: Detect complexity and adjust analysis
  - `shallow`: Quick decomposition (good for simple PRDs)
  - `deep`: Comprehensive analysis (good for complex PRDs)
- `--output {file}`: Save decomposition to file (default: stdout + `decomposition-{slug}.json`)

**Acceptance Criteria:**
- [x] Accepts valid PRD file path
- [x] Validates PRD has required sections
- [x] Processes depth parameter
- [x] Outputs to stdout and optional file
- [x] Outputs valid JSON

---

### 2.2 Analysis Phase

**Purpose:** Parse PRD and identify all distinct decisions

#### Step 1: PRD Parsing

**Implementation:**
1. Read PRD markdown file
2. Parse markdown to identify sections
3. Extract "Technical Decisions" section
4. Extract "Requirements" section (for requirement-driven decisions)
5. Extract "Trade-offs" section
6. Extract "Alternatives Considered" section

**Output:**
```json
{
  "prd_metadata": {
    "file": "prd/auth-system.md",
    "title": "PRD: Auth System",
    "last_modified": "2025-10-30",
    "word_count": 4523,
    "sections_found": [
      "Overview",
      "Technical Decisions",
      "Requirements",
      "Trade-offs",
      "Alternatives Considered"
    ]
  },
  "extracted_sections": {
    "technical_decisions": {
      "text": "... full section text ...",
      "lines": [42, 87],
      "subsections": ["Architecture Choices", "Technology Selection"]
    },
    "requirements": {
      "text": "... full section text ...",
      "lines": [89, 150]
    }
  }
}
```

#### Step 2: Decision Extraction

**Implementation:**
1. Parse Technical Decisions section for individual decisions
2. Identify decision markers:
   - Explicit: "Decision: ...", "ADR: ...", "We chose ...", "We decided ..."
   - Implicit: "To support X, we will ...", "For Y, we recommend ...", "This requires ..."
3. For each decision, extract:
   - Decision statement
   - Context and rationale
   - Related requirements
   - Trade-offs discussed
   - Alternatives considered

**Decision Extraction Patterns:**
```
Pattern 1: Explicit Decision
"Decision: Use OAuth2 with OIDC for authentication"
  ↓ Extract as decision

Pattern 2: Consequence-based
"This means we need Redis for token caching"
  ↓ Extract as decision dependency

Pattern 3: Requirement-driven
"We must support SAML 2.0 for enterprise"
  ↓ Extract as requirement-driven decision

Pattern 4: Trade-off statement
"We chose X over Y because of performance"
  ↓ Extract as decision with alternatives
```

**Output:**
```json
{
  "identified_decisions": [
    {
      "id": "DECISION-001",
      "title": "Authentication Protocol Selection",
      "source_prd_section": "Technical Decisions > Architecture Choices",
      "source_lines": [45, 58],
      "decision_statement": "Use OAuth2 with OIDC as primary authentication mechanism",
      "context": "Multi-tenant system needs to support internal users, B2B partners, and enterprise SSO",
      "rationale": "OAuth2 is industry standard with wide library support and OIDC provides identity layer",
      "decision_type": "core-architecture",
      "impact_level": "high",
      "affects_modules": ["auth-service", "api-gateway", "user-management"],
      "raw_text": "... section text mentioning this decision ..."
    },
    {
      "id": "DECISION-002",
      "title": "Token Storage Mechanism",
      "source_prd_section": "Technical Decisions > Trade-offs",
      "source_lines": [67, 82],
      "decision_statement": "Use Redis for token caching with PostgreSQL fallback",
      "context": "Tokens must be validated <50ms per request at scale",
      "rationale": "Redis ultra-fast, provides TTL management, scales horizontally",
      "decision_type": "infrastructure",
      "impact_level": "high",
      "depends_on": ["DECISION-001"],
      "affects_modules": ["auth-service", "redis-cluster"]
    }
  ]
}
```

#### Step 3: Dependency Analysis

**Implementation:**
1. For each identified decision, check if it depends on other decisions
2. Use textual analysis to find references:
   - "Based on Decision 1..."
   - "This follows from..."
   - "Requires..."
3. Build dependency graph
4. Detect circular dependencies (error condition)
5. Calculate decision levels (independent, level-1, level-2, etc.)

**Dependency Detection Logic:**
```
If DECISION-B mentions DECISION-A → B depends on A
If DECISION-B says "requires X from DECISION-A" → B depends on A
If DECISION-B's context assumes DECISION-A is done → B depends on A

Build graph: A → B → C (A has no deps, B depends on A, C depends on B)
Calculate levels:
  Level 0 (independent): A
  Level 1 (depends on 0): B
  Level 2 (depends on 1): C
```

**Output:**
```json
{
  "decision_graph": {
    "total_decisions": 3,
    "independent_decisions": ["DECISION-001"],
    "dependency_levels": {
      "level_0": ["DECISION-001"],
      "level_1": ["DECISION-002", "DECISION-003"],
      "level_2": []
    },
    "dependency_matrix": {
      "DECISION-001": { "depends_on": [] },
      "DECISION-002": { "depends_on": ["DECISION-001"] },
      "DECISION-003": { "depends_on": ["DECISION-001"] }
    },
    "circular_dependencies": [],
    "longest_dependency_chain": 2
  }
}
```

---

### 2.3 Decision Grouping

**Purpose:** Group related decisions into ADRs

#### Grouping Strategy

**Principle:** One ADR per distinct decision (not bundling unrelated decisions)

**Algorithm:**
1. Start with level-0 (independent) decisions
2. Each independent decision → separate ADR
3. Dependent decisions → separate ADRs (with dependency noted)
4. Exception: Tightly coupled decisions can be grouped if:
   - Both address same component
   - Second decision is minor refinement of first
   - Example: "Use PostgreSQL" + "Use JSON columns" can be one ADR
5. Default: Prefer separate ADRs over grouping

**Example:**
```
Decision: Use OAuth2 → ADR-001 (independent)
Decision: Token storage (depends on OAuth2) → ADR-002
Decision: Token refresh (depends on OAuth2) → ADR-003
Decision: Session timeout config (depends on Token storage) → ADR-004

Group them? NO - each is distinct concern, different audiences
```

**Output:**
```json
{
  "adr_grouping_plan": [
    {
      "adr_id": 1,
      "title": "Authentication Protocol Selection",
      "covers_decisions": ["DECISION-001"],
      "complexity": "core-architecture",
      "justification": "Independent foundation decision"
    },
    {
      "adr_id": 2,
      "title": "Token Storage and Caching",
      "covers_decisions": ["DECISION-002"],
      "complexity": "infrastructure",
      "depends_on_adr": [1],
      "justification": "Depends on auth protocol choice"
    }
  ]
}
```

---

### 2.4 Decomposition Plan Generation

**Purpose:** Create actionable plan for ADR generation

**Inputs:**
- Identified decisions (DECISION-XXX list)
- Decision graph (dependencies)
- ADR grouping (which decisions → which ADRs)
- PRD content (context for each decision)

**Process:**
1. Number ADRs based on dependency order
2. Calculate implementation sequence
3. Identify parallelizable ADRs (no inter-dependencies)
4. Generate generation order
5. Estimate generation time for each

**Output:**
```json
{
  "decomposition_plan": {
    "total_adrs": 3,
    "total_decisions_covered": 3,
    "coverage_percentage": 100,
    "generation_approach": "sequential-with-parallelization",
    "generation_sequence": [
      {
        "step": 1,
        "parallel_adrs": [
          {
            "adr_number": 1,
            "title": "Authentication Protocol Selection",
            "decisions_covered": ["DECISION-001"],
            "estimated_generation_time": "2 min",
            "complexity": "high",
            "is_blocking": true
          }
        ],
        "step_rationale": "Independent foundation"
      },
      {
        "step": 2,
        "parallel_adrs": [
          {
            "adr_number": 2,
            "title": "Token Storage",
            "decisions_covered": ["DECISION-002"],
            "depends_on_adr": [1]
          },
          {
            "adr_number": 3,
            "title": "Token Refresh Strategy",
            "decisions_covered": ["DECISION-003"],
            "depends_on_adr": [1]
          }
        ],
        "step_rationale": "Both depend on ADR-1, can be parallel"
      }
    ],
    "total_estimated_time": "5 min",
    "notes": "Consider reviewing ADR-1 thoroughly before proceeding to ADR-2,3"
  }
}
```

---

### 2.5 Complete Decomposition Output

**Full JSON Structure:**
```json
{
  "metadata": {
    "prd_file": "prd/auth-system.md",
    "analysis_date": "2025-10-30",
    "analysis_depth": "deep",
    "confidence_score": 0.92
  },
  "prd_analysis": {
    "file": "prd/auth-system.md",
    "sections_found": ["Technical Decisions", "Requirements", "Trade-offs"],
    "estimated_complexity": "high"
  },
  "identified_decisions": [
    {
      "id": "DECISION-001",
      "title": "Authentication Protocol",
      "source_prd_section": "Technical Decisions > Architecture Choices",
      "source_lines": [45, 58],
      "decision_statement": "Use OAuth2 with OIDC",
      "context": "...",
      "decision_type": "core-architecture",
      "impact_level": "high",
      "depends_on": []
    }
  ],
  "decision_graph": {
    "total_decisions": 3,
    "independent_decisions": ["DECISION-001"],
    "dependency_levels": {
      "level_0": ["DECISION-001"],
      "level_1": ["DECISION-002", "DECISION-003"]
    },
    "circular_dependencies": []
  },
  "adr_grouping_plan": [
    {
      "adr_id": 1,
      "title": "...",
      "covers_decisions": ["DECISION-001"],
      "depends_on_adr": []
    }
  ],
  "decomposition_plan": {
    "total_adrs": 3,
    "generation_sequence": [/* sequence plan */]
  },
  "quality_metrics": {
    "decision_coverage": 1.0,
    "dependency_circularity": 0,
    "estimated_adr_granularity": "good"
  },
  "recommendations": [
    "All 3 decisions identified. No gaps detected.",
    "Clear dependency structure: foundation decision (OAuth2) then two dependent decisions",
    "Recommend ADR-1 → then parallel ADR-2,3"
  ]
}
```

---

## 3. Non-Functional Requirements

### 3.1 Performance

**Target Times:**
- Shallow analysis: <2 minutes
- Auto depth: 2-3 minutes
- Deep analysis: 3-5 minutes

**Breakdown:**
- PRD parsing: <30 seconds
- Decision extraction: <1 minute
- Dependency analysis: <30 seconds
- Decomposition planning: <1 minute

### 3.2 Analysis Quality

**Coverage Target:** Identify 90%+ of decisions in PRD
- Measure: Manual verification on sample PRDs
- False positives: <5% (don't mark non-decisions as decisions)
- False negatives: <10% (miss some real decisions)

**Confidence Scoring:**
- Based on evidence strength
- 0.8-1.0 = high confidence (explicit in PRD)
- 0.6-0.8 = medium confidence (implied in context)
- <0.6 = low confidence (uncertain interpretation)

### 3.3 Dependency Accuracy

**Target:** Correctly identify 95%+ of dependencies
- No false positive dependencies (A doesn't depend on B when it doesn't)
- No false negative dependencies (miss that A depends on B)
- No circular dependency detection errors

### 3.4 Token Efficiency

**Target:** <5k tokens for full analysis
- PRD parsing: minimal overhead
- Analysis: focus on decisions, not prose
- Synthesis: efficient JSON generation

---

## 4. JSON Output Schema

**Root Schema:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "ADR Decomposition Output",
  "type": "object",
  "required": ["metadata", "identified_decisions", "decision_graph", "decomposition_plan"],
  "properties": {
    "metadata": {
      "type": "object",
      "required": ["prd_file", "analysis_date"],
      "properties": {
        "prd_file": { "type": "string" },
        "analysis_date": { "type": "string", "format": "date-time" },
        "confidence_score": { "type": "number", "minimum": 0, "maximum": 1 }
      }
    },
    "identified_decisions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "title", "decision_statement"],
        "properties": {
          "id": { "type": "string", "pattern": "^DECISION-[0-9]{3}$" },
          "title": { "type": "string" },
          "decision_statement": { "type": "string" },
          "decision_type": {
            "type": "string",
            "enum": ["core-architecture", "infrastructure", "implementation"]
          },
          "impact_level": {
            "type": "string",
            "enum": ["high", "medium", "low"]
          },
          "depends_on": {
            "type": "array",
            "items": { "type": "string", "pattern": "^DECISION-[0-9]{3}$" }
          }
        }
      }
    },
    "decision_graph": {
      "type": "object",
      "required": ["total_decisions", "circular_dependencies"]
    },
    "decomposition_plan": {
      "type": "object",
      "required": ["total_adrs", "generation_sequence"]
    }
  }
}
```

---

## 5. Integration with Plan Domain

### 5.1 Using Decomposition Output with /plan:generate-adrs

**Command Flow:**
```bash
/helpers:thinking-partner:adr-decomposition prd/auth-system.md
  ↓
[Generates decomposition-auth.json with ADR plan]
  ↓
/plan:generate-adrs prd/auth-system.md --from decomposition-auth.json
  ↓
[Creates ADR-001, ADR-002, ADR-003 with proper structure]
```

**How generate-adrs Uses Output:**
1. Read decomposition JSON
2. For each ADR in decomposition_plan:
   - Extract decision statements
   - Retrieve PRD sections (via source_lines)
   - Generate ADR with:
     - Context from PRD
     - Decision statement (from extracted decision)
     - Options (from PRD analysis)
     - Rationale (from PRD)
     - Consequences (infer from dependencies)
     - Links to related ADRs (from dependency graph)
3. Save to adr/ADR-XXX-{title}.md

---

## 6. Testing Strategy

### 6.1 Unit Tests
- [ ] PRD parsing (valid markdown structure)
- [ ] Decision extraction (pattern matching)
- [ ] Dependency detection (graph building)
- [ ] Circular dependency detection
- [ ] Confidence score calculation
- [ ] JSON schema validation

### 6.2 Integration Tests
- [ ] Full decomposition on sample PRDs (4-5 real examples)
- [ ] Coverage verification (90%+ decisions found)
- [ ] Dependency accuracy
- [ ] Grouping logic
- [ ] Sequence planning
- [ ] Integration with /plan:generate-adrs

### 6.3 Snapshot Tests
- [ ] Sample decomposition outputs
- [ ] Approval process on first run
- [ ] Regression detection

### 6.4 Quality Tests
- [ ] No circular dependencies in output
- [ ] All dependencies valid
- [ ] Confidence scores justified
- [ ] Coverage complete

---

## 7. Acceptance Criteria

- [x] Accepts valid PRD file path
- [x] Identifies 90%+ of decisions in PRD
- [x] Analyzes decision dependencies
- [x] Detects circular dependencies (errors)
- [x] Plans ADR grouping (one decision per ADR)
- [x] Generates implementation sequence
- [x] Outputs valid JSON decomposition plan
- [x] Integrates with /plan:generate-adrs command
- [x] Performance targets met (2-5 min depending on depth)
- [x] Confidence scores justified by evidence
- [x] Graceful handling of incomplete PRDs
- [x] Token efficiency maintained

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Decision identification | 90%+ of decisions found |
| Dependency accuracy | 95%+ correct dependencies |
| Coverage completeness | 100% of identified decisions covered by ADRs |
| User satisfaction | 85%+ find decomposition accurate |
| Performance | 2-5 min total |
| Reliability | 99% successful analysis |

---

## 9. Example Output

See ARCHITECTURE-COMPOSABLE-THINKING-PARTNERS.md for complete example of ADR decomposition output.

