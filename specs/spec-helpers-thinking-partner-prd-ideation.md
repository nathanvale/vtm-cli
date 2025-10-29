# Technical Specification: PRD Ideation Thinking Partner

**Version:** 1.0
**Date:** 2025-10-30
**Related ADR:** (pending - architecture decisions from research)
**Status:** Design
**Test Strategy:** Integration tests with real web/docs searches, snapshot tests for JSON output

---

## 1. Overview

This thinking partner helps users **research and structure their thinking** before writing a PRD. Instead of starting with a blank template, users get a research-backed scaffold that guides PRD creation.

**Value Proposition:**
- ✅ Eliminates blank page syndrome
- ✅ Ensures comprehensive thinking
- ✅ Provides research context
- ✅ Structures complex decisions
- ✅ Outputs reusable JSON scaffold

---

## 2. Functional Requirements

### 2.1 Command Interface

**Command Signature:**
```bash
/helpers:thinking-partner:prd-ideation {topic} [--deep] [--sources=web,docs,code] [--output {file}]
```

**Arguments:**
- `{topic}`: Feature idea or problem statement (required)
  - Example: "multi-tenant authentication for SaaS"
  - Can be 1-2 sentences
  - Informal language acceptable

**Options:**
- `--deep`: Enable comprehensive research across all sources (default: false)
- `--sources`: Comma-separated source types (default: web,docs)
  - `web`: General web search via Tavily
  - `docs`: Library documentation via Context7
  - `code`: GitHub code examples via Firecrawl
- `--output {file}`: Save output to file (default: stdout + `ideation-{slug}.json`)

**Acceptance Criteria:**
- [x] Accepts informal topic description
- [x] Processes --deep flag to enable comprehensive research
- [x] Respects --sources preference
- [x] Outputs to stdout and optional file
- [x] Creates valid JSON output

---

### 2.2 Research Phase

**Purpose:** Gather information from multiple sources about the topic

#### Research Phase - Web Search

**Implementation:**
1. Use Tavily MCP for web search
2. Search terms: `{topic} + best practices + architecture`
3. Extract: articles, tutorials, blog posts, whitepapers
4. Deep search: 10 results, Advanced depth
5. Normal search: 5 results, Basic depth

**Output Fields:**
```json
{
  "web_research": {
    "search_query": "multi-tenant authentication best practices",
    "results": [
      {
        "title": "Building Multi-Tenant SaaS Applications",
        "url": "https://example.com/article",
        "summary": "500-char excerpt",
        "relevance_score": 0.95,
        "key_insights": [
          "Tenant isolation is critical",
          "Use row-level security in database",
          "Implement separate auth tokens per tenant"
        ]
      }
    ],
    "top_keywords": ["authentication", "multi-tenant", "isolation", "oauth"],
    "common_patterns": ["JWT tokens", "row-level security", "tenant context in session"]
  }
}
```

**Acceptance Criteria:**
- [x] Returns 5-10 relevant results
- [x] Extracts key insights from summaries
- [x] Identifies recurring patterns
- [x] Calculates relevance scores
- [x] Completes in <2 minutes

#### Research Phase - Documentation Search

**Implementation:**
1. Use Context7 MCP for library documentation
2. Extract library names from topic (e.g., "OAuth2", "JWT", "Node.js")
3. Resolve library IDs
4. Fetch documentation with context about the topic
5. Extract relevant sections

**Output Fields:**
```json
{
  "docs_research": {
    "libraries_found": ["oauth2", "jsonwebtoken", "passport"],
    "documentation": [
      {
        "library": "oauth2",
        "sections": [
          {
            "title": "OAuth 2.0 Authorization Code Flow",
            "content": "1000-char excerpt from official docs",
            "relevance": 0.92,
            "url": "https://oauth.net/2/authorization-code-flow/"
          }
        ],
        "key_concepts": ["scopes", "tokens", "flows"],
        "best_practices": ["use PKCE for public clients", "implement refresh tokens"]
      }
    ]
  }
}
```

**Acceptance Criteria:**
- [x] Identifies relevant libraries from topic
- [x] Retrieves official documentation
- [x] Extracts best practices from docs
- [x] Provides implementation examples
- [x] Completes in <1 minute

#### Research Phase - Code Examples

**Implementation:**
1. Use Firecrawl MCP to search GitHub
2. Query: `{topic} language:typescript OR language:javascript`
3. Extract real-world implementations
4. Identify common patterns in code
5. Analyze frequency of approaches

**Output Fields:**
```json
{
  "code_research": {
    "search_query": "multi-tenant authentication javascript",
    "patterns_found": [
      {
        "pattern_name": "Tenant Middleware Extraction",
        "description": "Middleware extracts tenant ID from request and sets context",
        "frequency": 47,
        "example_code": "const getTenant = (req) => req.headers['x-tenant-id'];",
        "tools_used": ["Express", "Node.js", "UUID"],
        "repositories": 47
      }
    ],
    "popular_libraries": [
      {
        "library": "passport-oauth2",
        "usage_count": 234,
        "common_purpose": "Enterprise authentication"
      }
    ]
  }
}
```

**Acceptance Criteria:**
- [x] Finds 5+ code patterns related to topic
- [x] Extracts code examples
- [x] Identifies most popular libraries
- [x] Calculates pattern frequency
- [x] Completes in <2 minutes

---

### 2.3 Analysis Phase

**Purpose:** Synthesize research into structured decision framework

**Process:**
1. Analyze all research sources together
2. Extract architectural decisions mentioned in sources
3. For each decision, extract options discussed
4. Calculate recommendation confidence
5. Identify gaps in research

**Output Fields:**
```json
{
  "analysis": {
    "topic": "multi-tenant authentication for SaaS",
    "research_confidence": 0.89,
    "knowledge_gaps": [
      "Specific performance benchmarks for JWT vs sessions",
      "Cost comparison of managed auth services"
    ],
    "key_tradeoffs_identified": [
      {
        "tradeoff": "JWT vs Server Sessions",
        "jwt_pros": ["Stateless", "Scales better"],
        "jwt_cons": ["Token revocation harder", "Larger payloads"],
        "session_pros": ["Easy revocation", "Centralized control"],
        "session_cons": ["Requires shared state", "Less scalable"]
      }
    ]
  }
}
```

---

### 2.4 Scaffold Generation

**Purpose:** Generate PRD scaffold JSON that guides template filling

**Output Structure:**
```json
{
  "metadata": {
    "topic": "multi-tenant authentication for SaaS",
    "generated_date": "2025-10-30",
    "generated_by": "prd-ideation thinking partner",
    "confidence_score": 0.89,
    "research_time_seconds": 180
  },
  "problem_analysis": {
    "problem_statement": "Multi-tenant SaaS platforms need flexible authentication that supports internal users, B2B partners, and compliance requirements...",
    "problem_statement_source": "Analysis of web research",
    "key_constraints": ["Security", "Performance", "Compliance", "Scalability"],
    "stakeholder_groups": ["End Users", "Administrators", "Compliance Officers"],
    "business_context": "Enterprise SaaS market demands SSO, MFA, audit logging..."
  },
  "technical_decisions_identified": [
    {
      "sequence": 1,
      "id": "DECISION-AUTH-001",
      "title": "Authentication Protocol Selection",
      "context": "Choose primary authentication mechanism for the system",
      "research_evidence": [
        "Web research shows OAuth2 dominant in enterprise",
        "GitHub code analysis found 89% using OAuth2 + JWT hybrid"
      ],
      "options": [
        {
          "option": "OAuth2 with OIDC",
          "description": "Industry standard for modern SaaS",
          "pros": [
            "Industry standard",
            "Wide library support (Passport.js, Auth0)",
            "OIDC provides identity layer",
            "SSO compatible",
            "Works with enterprise IdPs"
          ],
          "cons": [
            "More complex than custom JWT",
            "Extra HTTP round-trips",
            "Requires authorization server"
          ],
          "research_confidence": 0.95,
          "best_for": "Enterprise, multi-tenant, compliance-heavy",
          "sources": ["Web", "Code"]
        },
        {
          "option": "JWT with custom validation",
          "description": "Lightweight, self-contained tokens",
          "pros": [
            "Simple to implement",
            "No external service needed",
            "Fast token validation (no DB lookup)"
          ],
          "cons": [
            "Security burden on development team",
            "Token revocation complex",
            "No standard for multi-tenant",
            "Less suitable for SSO"
          ],
          "research_confidence": 0.60,
          "best_for": "Simple internal APIs",
          "sources": ["Web"]
        },
        {
          "option": "Session-based (traditional)",
          "description": "Server-side sessions with cookies",
          "pros": [
            "Well-understood pattern",
            "Easy token revocation",
            "Built-in web framework support"
          ],
          "cons": [
            "Doesn't scale across services",
            "CSRF complexity",
            "Not suitable for mobile/API"
          ],
          "research_confidence": 0.55,
          "best_for": "Simple web applications",
          "sources": ["Web"]
        }
      ],
      "recommended": "OAuth2 with OIDC",
      "recommendation_confidence": 0.92,
      "recommendation_rationale": "Best practices show OAuth2 dominates enterprise multi-tenant, provides identity + authorization, standard library support, and compliance-ready"
    },
    {
      "sequence": 2,
      "id": "DECISION-AUTH-002",
      "title": "Token Storage Location",
      "context": "Where should authorization tokens be stored (sessions, database, cache)",
      "options": [
        {
          "option": "Redis for token cache (primary)",
          "pros": ["Ultra-fast", "Built-in TTL", "Good for refresh tokens"],
          "cons": ["Extra dependency", "Memory overhead"],
          "research_confidence": 0.88
        },
        {
          "option": "PostgreSQL for token storage",
          "pros": ["Integrated with app database", "Easy to query"],
          "cons": ["Slower lookups", "Row-level complexity"],
          "research_confidence": 0.75
        }
      ],
      "recommended": "Redis (primary) with PostgreSQL fallback",
      "recommendation_confidence": 0.87
    }
  ],
  "requirements_checklist": {
    "security": [
      "Tenant isolation enforced at request level",
      "Token expiration configurable per tenant",
      "Refresh token rotation implemented",
      "HTTPS required for all auth endpoints",
      "Password complexity rules enforced"
    ],
    "compliance": [
      "GDPR-compliant data handling",
      "SAML 2.0 support for B2B partners",
      "MFA capability for high-security tenants",
      "Audit logging of all auth events",
      "Data retention policies configurable"
    ],
    "performance": [
      "Token validation <50ms per request",
      "Authorization decision cached appropriately",
      "Support for 10k+ simultaneous sessions"
    ],
    "usability": [
      "Seamless SSO for enterprise users",
      "Password reset flow working",
      "Account lockout after failed attempts",
      "Clear error messages for auth failures"
    ]
  },
  "architectural_approaches": [
    {
      "name": "Centralized Auth Service",
      "description": "Dedicated microservice for all authentication/authorization",
      "pros": [
        "Scales independently",
        "Reusable across services",
        "Clear security boundary",
        "Easy to update auth without deploying entire app"
      ],
      "cons": [
        "Extra latency (network call)",
        "More infrastructure to manage",
        "Potential single point of failure"
      ],
      "suitable_for": "Large multi-service platforms",
      "evidence_from": "Code analysis shows 67% of medium+ SaaS use microservice auth"
    },
    {
      "name": "Embedded Auth Library",
      "description": "Auth logic built into application code",
      "pros": [
        "No extra network latency",
        "Simpler deployment",
        "Easier debugging"
      ],
      "cons": [
        "Auth updates require redeployment",
        "Less reusable across services",
        "Harder to scale"
      ],
      "suitable_for": "Small applications, simple auth needs",
      "evidence_from": "Recommended for startups, appropriate for MVP"
    }
  ],
  "key_considerations": [
    "Multi-tenant isolation must be enforced at every layer",
    "Token expiration times should vary by tenant type",
    "Compliance requirements vary by tenant (some may need HIPAA, GDPR)",
    "Performance: every request needs auth validation, optimize heavily",
    "Security: auth is the foundation, get wrong here breaks everything"
  ],
  "research_summary": {
    "sources_used": ["web", "docs", "code"],
    "total_sources": 18,
    "research_time_seconds": 180,
    "confidence_score": 0.89,
    "sources_breakdown": {
      "web_articles": 8,
      "library_docs": 4,
      "code_examples": 6
    }
  },
  "next_steps": [
    "Review this scaffold",
    "Customize based on specific requirements",
    "Run: /plan:create-prd auth-system --from ideation-output.json",
    "Fill in any additional sections",
    "Validate PRD with /plan:validate-prd"
  ]
}
```

**JSON Schema Validation:**
- All fields must be present
- Confidence scores: 0.0-1.0
- Options list: minimum 2 options
- Requirements: minimum 5 items per category
- Sources: web, docs, code only

---

## 3. Non-Functional Requirements

### 3.1 Performance

**Target Times:**
- Normal search: 3-5 minutes total
- Deep search: 4-7 minutes total
- Research breakdown:
  - Web search: <2 minutes
  - Docs search: <1 minute
  - Code search: <2 minutes
  - Analysis: <1 minute

**Implementation:**
- Parallelize web + docs + code searches
- Cache library documentation (24-hour TTL)
- Reuse recent search results if topic similar

### 3.2 Token Efficiency

**Target:**
- Research input tokens: <10k (all sources combined)
- Analysis + synthesis: <5k
- Total: <15k tokens per execution
- Maintain VTM philosophy of surgical access

**Implementation:**
- Limit web search results: 5-10 per source
- Truncate documentation excerpts: 500 chars max
- Extract only relevant code patterns
- Compress analysis before synthesis

### 3.3 Research Quality

**Target:**
- Confidence score: 0.80+ (80% confident in recommendations)
- Coverage: Identify 90%+ of key decisions
- Evidence: Every recommendation backed by at least 2 sources

**Measurement:**
- Track confidence scores
- Manual spot-check with domain experts
- Feedback from users on usefulness

### 3.4 Reliability

**Error Handling:**
- Web search fails → Fall back to cached results
- Docs search fails → Continue with web+code
- Code search fails → Continue with web+docs
- All sources fail → Return generic scaffold with errors

**Graceful Degradation:**
```json
{
  "error": "docs_research_failed",
  "warning": "Could not retrieve library documentation. Using web research instead.",
  "fallback_used": true,
  "sources_used": ["web", "code"],
  "sources_failed": ["docs"]
}
```

---

## 4. JSON Output Schema

**Root Schema:**
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PRD Ideation Output",
  "type": "object",
  "required": ["metadata", "problem_analysis", "technical_decisions_identified", "requirements_checklist"],
  "properties": {
    "metadata": {
      "type": "object",
      "required": ["topic", "generated_date", "confidence_score"],
      "properties": {
        "topic": { "type": "string" },
        "generated_date": { "type": "string", "format": "date-time" },
        "generated_by": { "type": "string" },
        "confidence_score": { "type": "number", "minimum": 0, "maximum": 1 },
        "research_time_seconds": { "type": "integer" }
      }
    },
    "problem_analysis": { /* detailed schema */ },
    "technical_decisions_identified": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "title", "options", "recommended"],
        "properties": {
          "id": { "type": "string", "pattern": "^DECISION-[A-Z]+-[0-9]{3}$" },
          "title": { "type": "string" },
          "options": { "type": "array", "minItems": 2 },
          "recommended": { "type": "string" },
          "recommendation_confidence": { "type": "number" }
        }
      }
    }
  }
}
```

**Validation:**
- JSON Schema validation required
- Confidence scores: number between 0 and 1
- IDs: unique, proper format
- References: all cross-references valid

---

## 5. Integration with Plan Domain

### 5.1 Using Ideation Output in /plan:create-prd

**Command Flow:**
```bash
/helpers:thinking-partner:prd-ideation "multi-tenant auth"
  ↓
[Generates ideation-auth.json]
  ↓
/plan:create-prd auth-system --from ideation-auth.json
  ↓
[Creates prd/auth-system.md pre-populated with ideation insights]
```

**How create-prd Uses Output:**
1. Read ideation JSON
2. Extract problem_analysis → fill "Overview" section
3. Extract technical_decisions_identified → populate "Technical Decisions" template
4. Extract requirements_checklist → list requirements by category
5. Add guidance: "See ideation-auth.json for research sources"
6. User edits and customizes

### 5.2 PRD Template Integration

**New PRD Template Section:**
```markdown
## Technical Decisions
<!-- Generated from ideation research -->
<!-- See ideation-auth.json for full analysis -->

### Decision 1: Authentication Protocol
- **Researched Options:**
  - OAuth2 with OIDC (Recommended, 92% confidence)
  - JWT with custom validation
  - Session-based
- **Our Choice:** [FILL IN]
- **Rationale:** [FILL IN]
```

---

## 6. Testing Strategy

### 6.1 Unit Tests
- [ ] Topic parsing and normalization
- [ ] Confidence score calculation
- [ ] JSON schema validation
- [ ] Decision extraction logic
- [ ] Recommendation ranking

### 6.2 Integration Tests
- [ ] Full research flow (web + docs + code)
- [ ] Graceful fallback on source failure
- [ ] Performance under time limits
- [ ] Output validity (valid JSON, all required fields)
- [ ] Integration with /plan:create-prd

### 6.3 Snapshot Tests
- [ ] Sample ideation outputs for common topics
- [ ] Approval process on first run
- [ ] Regression detection on updates

### 6.4 Quality Tests
- [ ] Confidence scores accurate
- [ ] Recommendations backed by research
- [ ] No circular dependencies in decisions
- [ ] All decisions have 2+ sources

---

## 7. Acceptance Criteria

- [x] Accepts informal topic description
- [x] Researches across web + docs + code (optional)
- [x] Generates valid JSON scaffold
- [x] Identifies 3-5 key architectural decisions
- [x] Provides 2+ options for each decision
- [x] Recommends best approach with rationale
- [x] Includes research sources and evidence
- [x] Completes within performance targets (3-7 min)
- [x] Confidence scores ≥0.80
- [x] Output integrates with /plan:create-prd
- [x] Gracefully handles research failures
- [x] 80%+ token efficiency maintained

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Research completeness | 90%+ decisions identified |
| Recommendation quality | 85%+ match with expert decisions |
| Confidence accuracy | ±10% of true confidence |
| User satisfaction | 85%+ find output valuable |
| Performance | 3-7 min total time |
| Reliability | 99% successful research |

