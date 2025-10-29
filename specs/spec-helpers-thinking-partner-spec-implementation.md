# Technical Specification: Spec Implementation Thinking Partner

**Version:** 1.0
**Date:** 2025-10-30
**Related Architecture:** ARCHITECTURE-COMPOSABLE-THINKING-PARTNERS.md
**Status:** Design
**Test Strategy:** Integration tests with real ADRs, code example snapshot tests

---

## 1. Overview

This thinking partner researches **HOW to technically implement architectural decisions** made in ADRs. Unlike previous thinking partners that help with PRD creation or ADR decomposition, this partner bridges the gap between architectural decisions and implementation details.

**Key Insight:** Specs are NOT independent from ADRs. Specs implement ADRs.

```
ADR-001: "Use OAuth2 with OIDC"  (WHAT & WHY)
  ↓
Spec Implementation Thinking Partner
  ↓ [Research: libraries, patterns, code examples]
  ↓
Spec: "Implement OAuth2 with Passport.js + Auth0" (HOW)
```

**Value Proposition:**
- ✅ Researches implementation options
- ✅ Compares technical approaches
- ✅ Provides code patterns and examples
- ✅ Generates implementation-focused specifications
- ✅ Creates strong ADR ↔ Spec traceability

---

## 2. Functional Requirements

### 2.1 Command Interface

**Command Signature:**
```bash
/helpers:thinking-partner:spec-implementation {adr-file} [--depth=auto|shallow|deep] [--output {file}]
```

**Arguments:**
- `{adr-file}`: Path to ADR markdown file (required)
  - Example: `adr/ADR-001-oauth2-selection.md`
  - Must exist and be valid ADR structure
  - Must have decision statement

**Options:**
- `--depth`: Analysis depth (default: auto)
  - `auto`: Adjust based on decision complexity
  - `shallow`: Quick research (3-5 min, 2-3 options)
  - `deep`: Comprehensive research (5-10 min, 5+ options)
- `--output {file}`: Save implementation plan to file (default: stdout + `spec-impl-{slug}.json`)

**Acceptance Criteria:**
- [x] Accepts valid ADR file path
- [x] Extracts decision statement from ADR
- [x] Validates ADR structure
- [x] Processes depth parameter
- [x] Outputs valid JSON

---

### 2.2 ADR Analysis Phase

**Purpose:** Extract decision details that guide implementation research

**Process:**
1. Parse ADR markdown
2. Extract decision statement
3. Extract rationale and context
4. Extract consequences
5. Identify constraints (from ADR)
6. Identify dependencies (from ADR)

**Output:**
```json
{
  "adr_metadata": {
    "file": "adr/ADR-001-oauth2-selection.md",
    "adr_id": "ADR-001",
    "title": "Authentication Protocol Selection",
    "decision_statement": "Use OAuth2 with OIDC as primary authentication mechanism",
    "status": "proposed"
  },
  "decision_context": {
    "rationale": "OAuth2 is industry standard with wide library support...",
    "context": "Multi-tenant system needs SSO support...",
    "constraints": [
      "Must support multiple tenant environments",
      "Token validation <50ms per request",
      "SAML 2.0 support needed for enterprise"
    ],
    "dependencies": [
      "ADR-002: Token Storage mechanism",
      "ADR-003: Session refresh strategy"
    ]
  }
}
```

---

### 2.3 Implementation Research Phase

**Purpose:** Research concrete ways to implement the architectural decision

#### Research Phase - Library & Framework Search

**Implementation:**
1. Use Tavily MCP for framework search
2. Query: `{decision} implementation {technology_stack}`
3. Extract: frameworks, libraries, managed services
4. Compare: maturity, adoption, community

**Example Queries:**
- Decision: "Use OAuth2"
- Queries:
  - "OAuth2 implementation Node.js libraries"
  - "Passport.js OAuth2 implementation patterns"
  - "OAuth2 managed services comparison"

**Output:**
```json
{
  "implementation_options": [
    {
      "option_id": "OPTION-001",
      "name": "Passport.js with passport-oauth2",
      "category": "open-source-library",
      "description": "Lightweight, modular authentication library",
      "adoption": "high",
      "community_size": "large",
      "maintenance_status": "active"
    },
    {
      "option_id": "OPTION-002",
      "name": "Auth0 (managed service)",
      "category": "managed-service",
      "description": "Enterprise identity platform",
      "adoption": "high",
      "cost_model": "usage-based",
      "maintenance_status": "fully-managed"
    }
  ]
}
```

#### Research Phase - Code Examples & Patterns

**Implementation:**
1. Use Firecrawl to search GitHub
2. Query: `{decision} implementation language:typescript OR javascript`
3. Extract: real-world implementations, code patterns
4. Analyze: common patterns, best practices

**Output:**
```json
{
  "code_patterns": [
    {
      "pattern_name": "Passport.js OAuth2 Middleware",
      "description": "Passport.js strategy for OAuth2 flow",
      "usage_frequency": 342,
      "code_example": "router.get('/auth/oauth2', passport.authenticate('oauth2'));",
      "frameworks_used": ["Express", "Fastify", "Koa"],
      "test_approaches": [
        "Mock OAuth2 provider",
        "Use test credentials",
        "Use callback simulation"
      ]
    }
  ]
}
```

#### Research Phase - Documentation & Best Practices

**Implementation:**
1. Use Context7 for library documentation
2. Extract: recommended patterns, security practices
3. Pull: performance characteristics, configuration options

**Output:**
```json
{
  "official_guidance": [
    {
      "library": "passport-oauth2",
      "section": "Security Considerations",
      "key_points": [
        "Always use HTTPS for OAuth2 flows",
        "Validate state parameter to prevent CSRF",
        "Use PKCE for public clients"
      ]
    }
  ]
}
```

---

### 2.4 Option Evaluation & Comparison

**Purpose:** Compare implementation options based on key criteria

**Evaluation Criteria:**
1. **Integration Effort** - How hard is it to integrate?
2. **Maintenance Burden** - How much ongoing work needed?
3. **Test Coverage** - How easy to test thoroughly?
4. **Performance Impact** - Latency, throughput, resource usage
5. **Security Posture** - Vulnerabilities, attack surface
6. **Scalability** - Works at 10k users? 1M users?
7. **Team Expertise** - Does team know this?
8. **Cost** - License, hosting, support

**Output:**
```json
{
  "option_comparison": [
    {
      "option": "Passport.js with passport-oauth2",
      "integration_effort": {
        "score": 7,
        "description": "Moderate - 2-3 days for basic setup"
      },
      "maintenance_burden": {
        "score": 6,
        "description": "Regular - Keep dependencies updated"
      },
      "test_coverage": {
        "score": 8,
        "description": "Good - Can mock OAuth2 provider"
      },
      "performance": {
        "score": 9,
        "latency_ms": 12,
        "description": "Excellent - Minimal overhead"
      },
      "security_posture": {
        "score": 8,
        "known_issues": 0,
        "description": "Good - Active security fixes"
      },
      "scalability": {
        "score": 9,
        "tested_at": "100k users",
        "description": "Excellent - Stateless design"
      },
      "team_expertise": {
        "score": 7,
        "description": "Team has Express.js experience"
      },
      "cost": {
        "score": 10,
        "cost": "free",
        "description": "Open source, no licensing"
      },
      "overall_score": 8.1,
      "pros": [...],
      "cons": [...]
    }
  ]
}
```

---

### 2.5 Recommended Implementation Plan

**Purpose:** Create actionable implementation strategy

**Output:**
```json
{
  "recommended_approach": {
    "option": "Passport.js with passport-oauth2",
    "recommendation_confidence": 0.89,
    "rationale": "Best balance of ease-of-implementation, test coverage, and team expertise",

    "implementation_outline": {
      "overview": "Use Passport.js middleware for OAuth2 authentication flow",

      "architecture": {
        "components": [
          {
            "component": "OAuth2 Strategy",
            "responsibility": "Handle OAuth2 flow (authorization code)"
          },
          {
            "component": "Serialization",
            "responsibility": "Convert user to/from session"
          },
          {
            "component": "Session Middleware",
            "responsibility": "Manage session tokens"
          }
        ]
      },

      "technology_stack": {
        "runtime": "Node.js 18+",
        "framework": "Express.js 4.x",
        "auth_library": "passport 0.7+",
        "strategy": "passport-oauth2 1.7+",
        "session_store": "Redis 7.x"
      },

      "key_files": [
        "src/auth/passport-config.ts",
        "src/auth/oauth2-strategy.ts",
        "src/middleware/auth.ts",
        "src/routes/auth.ts"
      ],

      "dependencies": [
        "passport",
        "passport-oauth2",
        "express-session",
        "redis"
      ],

      "configuration_options": [
        {
          "option": "clientID",
          "description": "OAuth2 provider client ID",
          "environment_var": "OAUTH2_CLIENT_ID"
        }
      ]
    },

    "acceptance_criteria": [
      "Users can authenticate via OAuth2 provider",
      "Tokens expire after 1 hour",
      "Refresh tokens work correctly",
      "Session revocation works immediately",
      "User info accessible in request context"
    ],

    "testing_strategy": {
      "unit_tests": [
        "Passport strategy initialization",
        "Serialization logic",
        "Token expiration handling"
      ],
      "integration_tests": [
        "Full OAuth2 flow",
        "Token refresh",
        "Session creation/destruction"
      ],
      "end_to_end_tests": [
        "User login flow",
        "Logout flow",
        "Permission enforcement"
      ]
    }
  }
}
```

---

### 2.6 Implementation Details & Code Examples

**Output includes:**
```json
{
  "implementation_details": {
    "file_structure": "src/auth/",

    "key_code_examples": [
      {
        "file": "src/auth/passport-config.ts",
        "purpose": "Configure Passport.js with OAuth2 strategy",
        "code": "passport.use('oauth2', new OAuth2Strategy({...}))"
      }
    ],

    "configuration_templates": [
      {
        "file": ".env.example",
        "template": "OAUTH2_CLIENT_ID=...\nOAUTH2_CLIENT_SECRET=..."
      }
    ],

    "integration_points": [
      {
        "system": "Token Storage (ADR-002)",
        "integration": "Store and validate tokens in Redis"
      }
    ],

    "performance_characteristics": {
      "token_validation_latency_ms": 12,
      "oauth2_round_trip_ms": 200,
      "typical_request_overhead_ms": 15
    },

    "scalability_notes": [
      "Stateless OAuth2 flow scales horizontally",
      "Redis required for token caching (separate cluster)",
      "Tested up to 100k concurrent users"
    ]
  }
}
```

---

## 3. Non-Functional Requirements

### 3.1 Performance

**Target Times:**
- Shallow analysis: 3-5 minutes
- Auto depth: 5-7 minutes
- Deep analysis: 7-10 minutes

**Breakdown:**
- ADR parsing: <30 seconds
- Library research: 2-3 minutes
- Code pattern research: 2-3 minutes
- Doc research: 1-2 minutes
- Analysis & synthesis: 1-2 minutes

### 3.2 Research Quality

**Coverage Target:**
- Identify 3-5 implementation approaches
- For each approach:
  - Pros/cons
  - Code examples
  - Integration points
  - Performance characteristics
  - Testing strategies

**Confidence Scoring:**
- 0.8-1.0 = High confidence (multiple sources, established pattern)
- 0.6-0.8 = Medium confidence (some sources, viable approach)
- <0.6 = Low confidence (limited evidence, experimental)

### 3.3 Traceability

**Requirement:** Strong link between ADR and generated Spec

**Implementation:**
- ADR reference in Spec frontmatter
- Decision → Implementation mapping
- Link to specific constraints from ADR
- Reference to code examples for each component

---

## 4. Complete Output Schema

**Root Structure:**
```json
{
  "metadata": {
    "adr_file": "adr/ADR-001.md",
    "adr_id": "ADR-001",
    "analysis_date": "2025-10-30",
    "analysis_depth": "deep",
    "research_confidence": 0.89
  },
  "adr_analysis": {
    "decision_statement": "Use OAuth2 with OIDC",
    "context": "...",
    "constraints": ["..."],
    "dependencies": ["ADR-002", "ADR-003"]
  },
  "implementation_options": [
    {
      "option_id": "OPTION-001",
      "name": "Passport.js with passport-oauth2",
      "category": "open-source-library",
      "description": "...",
      "pros": [...],
      "cons": [...],
      "integration_effort": 7,
      "maintenance_burden": 6,
      "overall_score": 8.1
    }
  ],
  "recommended_approach": {
    "option": "Passport.js with passport-oauth2",
    "rationale": "...",
    "implementation_outline": {...},
    "technology_stack": {...},
    "key_files": [...],
    "dependencies": [...],
    "acceptance_criteria": [...],
    "testing_strategy": {...}
  },
  "implementation_details": {
    "file_structure": "...",
    "code_examples": [...],
    "configuration_templates": [...],
    "integration_points": [...],
    "performance_characteristics": {...}
  },
  "quality_metrics": {
    "option_coverage": 5,
    "research_confidence": 0.89,
    "code_examples_found": 23,
    "patterns_identified": 4
  }
}
```

---

## 5. Integration with Plan Domain

### 5.1 Using Implementation Output with /plan:create-spec

**Command Flow:**
```bash
/plan:review-adr adr/ADR-001.md
  ↓ [User understands the decision]
  ↓
/helpers:thinking-partner:spec-implementation adr/ADR-001.md
  ↓ [Generates implementation plan (spec-impl-oauth2.json)]
  ↓
/plan:create-spec oauth2-implementation --from spec-impl-oauth2.json
  ↓ [Creates detailed implementation spec]
  ↓
Spec frontmatter includes: "Related ADR: ADR-001"
```

**How create-spec Uses Output:**
1. Read implementation JSON
2. Extract recommended approach
3. Generate Spec with:
   - Overview (what we're building)
   - Implementation approach (recommended option)
   - Architecture (components from outline)
   - Technology stack (dependencies, tools)
   - Code structure (files and organization)
   - Configuration (setup guide)
   - Integration points (links to other ADRs/specs)
   - Acceptance criteria (from implementation plan)
   - Testing strategy (unit, integration, e2e)
4. Add frontmatter:
   ```yaml
   related_adr: adr/ADR-001-oauth2-selection.md
   based_on_implementation_research: spec-impl-oauth2.json
   ```

---

## 6. Key Differences from Other Thinking Partners

| Aspect | PRD Ideation | ADR Decomposition | Spec Implementation |
|--------|--------------|-------------------|---------------------|
| **Input** | Feature idea | Completed PRD | Completed ADR |
| **Research** | Problem space | Decision extraction | Technical implementation |
| **Output** | PRD scaffold | Decomposition plan | Implementation spec |
| **Question Answered** | "What problem?" | "What decision?" | "How to implement?" |
| **Traceability** | PRD → ADR | PRD → ADR | ADR → Spec |
| **Audience** | Product/architects | Architects | Developers |
| **Dependencies** | None | PRD | ADR |

---

## 7. Testing Strategy

### 7.1 Unit Tests
- [ ] ADR parsing (structure validation)
- [ ] Decision extraction
- [ ] Constraint identification
- [ ] JSON schema validation
- [ ] Option scoring

### 7.2 Integration Tests
- [ ] Full research on sample ADRs (5 real examples)
- [ ] Implementation option coverage (3+ options per ADR)
- [ ] Integration with /plan:create-spec
- [ ] Traceability validation (ADR ↔ Spec links)

### 7.3 Snapshot Tests
- [ ] Sample implementation plans
- [ ] Code example extraction
- [ ] Approval-based testing

### 7.4 Quality Tests
- [ ] Research confidence scores justified
- [ ] Options have balanced pros/cons
- [ ] Technology stack recommendations realistic
- [ ] Code examples executable

---

## 8. Acceptance Criteria

- [x] Accepts valid ADR file path
- [x] Extracts decision statement and context from ADR
- [x] Researches 3-5 implementation approaches
- [x] Compares approaches objectively (pros/cons)
- [x] Recommends best approach with rationale
- [x] Provides code examples for recommended approach
- [x] Generates detailed implementation outline
- [x] Outputs valid JSON implementation plan
- [x] Integrates with /plan:create-spec command
- [x] Performance targets met (5-10 min depending on depth)
- [x] Research confidence 0.80+ for recommendations
- [x] Strong ADR ↔ Spec traceability

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Implementation options identified | 3-5 per ADR |
| Research coverage | 90%+ of approaches found |
| Code examples provided | 2+ for recommended approach |
| User satisfaction | 85%+ find plan actionable |
| Performance | 5-10 min total |
| Reliability | 99% successful research |

---

## 10. Example Output

For ADR-001 (Use OAuth2 with OIDC):

**Identified Options:**
1. Passport.js (open-source, score: 8.1)
2. Auth0 (managed service, score: 7.8)
3. AWS Cognito (managed service, score: 7.5)
4. Keycloak (self-hosted, score: 7.2)
5. Custom OAuth2 (from scratch, score: 4.5)

**Recommended:** Passport.js with passport-oauth2
- Rationale: Best balance of implementation ease, team expertise, and scalability
- Confidence: 0.89

**Implementation Outline:**
- Framework: Express.js
- Strategy: Passport OAuth2
- Session Store: Redis
- Key Files: 4 files
- Dependencies: 4 npm packages

**Tech Stack:**
- Node.js 18+
- passport 0.7+
- passport-oauth2 1.7+
- redis 7.x
- express-session

**Acceptance Criteria:**
- Users can authenticate via OAuth2
- Tokens expire correctly
- Refresh tokens work
- Session revocation immediate
- Request context has user info

