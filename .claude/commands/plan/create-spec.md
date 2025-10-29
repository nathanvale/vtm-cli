---
allowed-tools: Task, Read(docs/adr/*.md, docs/specs/*.md, .claude/templates/template-spec.md), Write(docs/specs/*.md), Bash(mkdir *)
description: Create technical specification for implementing an ADR using task agents
argument-hint: {adr-file} [name]
---

# Plan: Create Spec

**Command:** `/plan:create-spec {adr-file} [name]`
**Purpose:** Create technical specification for implementing an ADR using task agents

---

## What This Command Does

Generates a detailed implementation specification from an ADR by:

1. Reading the ADR file to understand the architectural decision
2. Launching a task agent to research implementation approaches
3. Task agent uses `/helpers:thinking-partner` to research libraries, frameworks, patterns
4. Task agent compares implementation options (integration effort, performance, security)
5. Generates detailed spec with code examples, testing strategy, acceptance criteria
6. Outputs `specs/spec-{name}.md`

**Key Benefit:** Transforms high-level architectural decisions into practical implementation guides with researched recommendations.

---

## Usage

```bash
# Basic usage (auto-generates name from ADR)
/plan:create-spec adr/ADR-001-oauth2-authentication.md

# Custom spec name
/plan:create-spec adr/ADR-001-oauth2-authentication.md oauth2-impl

# Works with any ADR
/plan:create-spec adr/ADR-002-token-storage.md
/plan:create-spec adr/ADR-003-session-timeout.md session-manager
```

---

## Parameters

- `{adr-file}`: Path to ADR file (required)
  - Example: `adr/ADR-001-oauth2-authentication.md`
  - Must exist and be readable
  - Will be analyzed for implementation requirements

- `[name]`: Spec filename slug (optional)
  - Example: `oauth2-impl`, `token-storage`, `session-manager`
  - Defaults to ADR filename without number prefix
  - Will create: `specs/spec-{name}.md`

---

## Implementation Instructions

You are implementing the `/plan:create-spec` command. Here's how to do it:

### Step 1: Parse Arguments and Validate

```javascript
const fs = require("fs")
const path = require("path")

const adrFile = ARGUMENTS[0]
const customName = ARGUMENTS[1]

if (!adrFile) {
  console.error("❌ Error: ADR file path required")
  console.log("Usage: /plan:create-spec {adr-file} [name]")
  console.log("Example: /plan:create-spec adr/ADR-001-auth.md")
  process.exit(1)
}

const adrPath = path.resolve(adrFile)
if (!fs.existsSync(adrPath)) {
  console.error(`❌ Error: ADR file not found: ${adrFile}`)
  process.exit(1)
}

const adrContent = fs.readFileSync(adrPath, "utf-8")

// Validate ADR structure
console.log("🔍 Validating ADR file...")

// Check for ADR header
if (!adrContent.match(/^# ADR-/m)) {
  console.error("❌ Error: File does not appear to be an ADR")
  console.error("   Missing ADR header (e.g., '# ADR-001: Title')")
  console.error("")
  console.log("💡 Example: /plan:create-spec docs/adr/ADR-001-auth.md")
  process.exit(1)
}

// Check for required ADR sections
const requiredSections = ["Status", "Context", "Decision", "Consequences"]
const missingSections = []

for (const section of requiredSections) {
  if (!adrContent.includes(`## ${section}`)) {
    missingSections.push(section)
  }
}

if (missingSections.length > 0) {
  console.error(
    `❌ Error: ADR missing required sections: ${missingSections.join(", ")}`,
  )
  console.error(
    "   ADRs must have Status, Context, Decision, and Consequences sections",
  )
  console.error("")
  console.log("💡 Use /plan:create-adr to create a properly structured ADR")
  process.exit(1)
}

// Check for alternatives (warning only)
const alternativeCount = (adrContent.match(/### Alternative/g) || []).length
if (alternativeCount < 3) {
  console.warn(
    `⚠️  Warning: ADR has only ${alternativeCount} alternatives (recommended: 3+)`,
  )
  console.warn(
    "   Spec will have limited context about alternatives considered",
  )
  console.warn("")
}

// Check for clear decision statement
const decisionSection = adrContent.split("## Decision")[1]?.split("##")[0]
if (decisionSection) {
  const hasDecisionStatement =
    decisionSection.includes("We will") ||
    decisionSection.includes("We chose") ||
    decisionSection.includes("Use ") ||
    decisionSection.includes("Implement ")

  if (!hasDecisionStatement) {
    console.warn(
      "⚠️  Warning: Decision section may not have a clear decision statement",
    )
    console.warn("   Example: 'We will use OAuth2 for authentication'")
    console.warn("")
  }
}

console.log("✅ ADR validation passed")
console.log(`   File: ${adrFile}`)
console.log(`   Alternatives: ${alternativeCount}`)
console.log("")

// Generate spec name from ADR filename if not provided
let specName = customName
if (!specName) {
  // Extract: ADR-001-oauth2-authentication.md → oauth2-authentication
  const adrFilename = path.basename(adrFile, ".md")
  specName = adrFilename.replace(/^ADR-\d+-/, "")
}
```

### Step 2: Read Spec Template

Read the spec template from `.claude/templates/template-spec.md`:

```bash
# Read the template
Read .claude/templates/template-spec.md
```

This template provides the comprehensive spec structure that the task agent should fill in.

### Step 3: Create Specs Directory

```bash
mkdir -p docs/specs
```

Check if spec already exists:

```bash
if [ -f "docs/specs/spec-${specName}.md" ]; then
  echo "❌ Error: Spec already exists at docs/specs/spec-${specName}.md"
  echo "Use a different name or remove existing file"
  exit 1
fi
```

### Step 3: Launch Task Agent

Use Claude Code's `Task` tool to launch an agent that will:

1. Analyze ADR to understand the decision
2. Research implementation approaches
3. Compare libraries/frameworks
4. Generate detailed implementation spec

```javascript
console.log(`📝 Creating spec from: ${adrFile}`)
console.log("🔍 Launching implementation research agent...\n")
```

**Task Agent Prompt:**

````
You are a technical specification specialist. Your job is to create detailed, practical implementation specifications from architectural decisions.

## Your Task

Create an implementation specification for this ADR.

**ADR File:** ${adrFile}

**ADR Content:**
```
${adrContent}
```

## Process

1. **Analysis Phase**
   Read and understand the ADR:
   - What decision was made?
   - What problem does it solve?
   - What are the key requirements?
   - What constraints exist?
   - What alternatives were considered (useful context)?

2. **Research Phase**
   Check cache before using /helpers:thinking-partner for implementation research:

   **Caching Integration (NEW):**

   Initialize research cache (shared with generate-adrs):
   ```typescript
   import { ResearchCache } from 'vtm-cli/lib'

   const cache = new ResearchCache(
     '.claude/cache/research',  // Same cache directory as generate-adrs
     30 * 24 * 60              // 30 days TTL
   )
   ```

   For EACH research query, follow this caching pattern:
   ```typescript
   // Define research queries for comprehensive coverage
   const queries = [
     `${decision} implementation libraries and frameworks`,
     `${decision} code examples and patterns`,
     `${decision} best practices and pitfalls`,
     `${decision} testing strategies`,
     `${decision} security considerations`
   ]

   const researchResults = {}

   for (const query of queries) {
     // 1. Check cache first
     let research = await cache.get(query)

     if (research) {
       console.log(`✅ Using cached research: ${query.substring(0, 50)}...`)
     } else {
       console.log(`🔍 Researching: ${query.substring(0, 50)}... (not cached)`)

       // 2. Call thinking-partner (30-60 seconds per call)
       research = await thinkingPartner(query, {
         deep: true,
         sources: ['web', 'docs', 'code']
       })

       // 3. Store in cache with semantic tags
       const tags = [
         decision.split(' ')[0].toLowerCase(), // Primary topic (e.g., 'oauth2')
         query.includes('libraries') ? 'libraries' : null,
         query.includes('code') ? 'code-examples' : null,
         query.includes('best') ? 'best-practices' : null,
         query.includes('testing') ? 'testing' : null,
         query.includes('security') ? 'security' : null,
         'implementation',
         'spec-creation'
       ].filter(Boolean)

       await cache.set(query, research, tags)
     }

     researchResults[query] = research
   }

   // 4. Can also search for related cached research from generate-adrs
   const decision Topic = extractDecisionFromADR(adrContent)
   const relatedResearch = await cache.search([decisionTopic, 'alternatives'])

   if (relatedResearch.length > 0) {
     console.log(`ℹ️  Found ${relatedResearch.length} related cached research from generate-adrs`)
     // Reuse ADR alternatives research in spec context
   }
   ```

   **Research areas to cache:**
   - Available libraries and frameworks that implement this approach
   - Code patterns and examples for this technology
   - Best practices and common pitfalls
   - Performance characteristics and benchmarks
   - Security considerations and recommendations
   - Testing approaches (unit, integration, e2e)
   - Integration patterns with existing systems
   - Configuration and setup requirements

   **Performance Impact:**
   - First spec (5 queries): ~5 minutes (all cache misses)
   - Second spec (reuses OAuth2 from ADR): ~3 minutes (2 cache hits from generate-adrs)
   - Third spec (same decision): ~30 seconds (all cache hits)
   - **Cross-command cache reuse: Additional 40% savings**

   **Cache behavior:**
   - Reuses alternatives research from /plan:generate-adrs
   - Caches implementation-specific research
   - Tags enable smart search across commands
   - TTL: 30 days (shared with all plan commands)

3. **Comparison Phase**
   Compare implementation options based on:

   **Integration Effort:**
   - Setup complexity (trivial, moderate, complex)
   - Learning curve for team
   - Dependencies and compatibility
   - Migration path from current state

   **Maintenance Burden:**
   - Community support and activity
   - Documentation quality
   - Breaking change frequency
   - Long-term sustainability

   **Test Coverage:**
   - Built-in testing utilities
   - Mock/stub support
   - Test performance
   - Coverage tooling

   **Performance:**
   - Latency characteristics
   - Throughput capabilities
   - Resource usage (CPU, memory)
   - Scalability limits

   **Security:**
   - Vulnerability history
   - Security features
   - Audit trail
   - Compliance considerations

   **Team Expertise:**
   - Existing knowledge in team
   - Training requirements
   - Hiring availability
   - Community resources

4. **Structure Phase**
   Organize findings into spec format:

   ```markdown
   # Technical Specification: {Decision Name}

   **Status:** Draft | Review | Approved
   **Date:** ${new Date().toISOString().split('T')[0]}
   **Source ADR:** ${adrFile}

   ## Overview

   ### Decision Summary
   [Brief summary of the ADR decision]

   ### Implementation Goal
   [What this spec aims to deliver]

   ### Success Criteria
   [How we know this is implemented correctly]

   ## Recommended Technology Stack

   ### Primary Choice: {Library/Framework Name}

   **Rationale:**
   - [Reason 1 from research]
   - [Reason 2 from research]
   - [Reason 3 from research]

   **Key Features:**
   - [Feature 1]
   - [Feature 2]
   - [Feature 3]

   **Version:** {Recommended version}
   **License:** {License type}
   **Community:** {Activity level, GitHub stars, npm downloads}

   ### Alternative Options

   #### Option 2: {Alternative Library}
   - **Pros:** [From research]
   - **Cons:** [From research]
   - **When to consider:** [Use cases where this might be better]

   #### Option 3: {Another Alternative}
   - [Similar structure]

   ## Implementation Approach

   ### High-Level Architecture

   \`\`\`
   [ASCII diagram or description of component structure]
   \`\`\`

   ### File Structure

   \`\`\`
   src/
   ├── {feature}/
   │   ├── index.ts          # Public API
   │   ├── {component}.ts    # Core implementation
   │   ├── types.ts          # TypeScript types
   │   ├── utils.ts          # Helper functions
   │   └── __tests__/
   │       ├── {component}.test.ts
   │       └── integration.test.ts
   ├── config/
   │   └── {feature}.config.ts
   └── middleware/           # If applicable
       └── {feature}.middleware.ts
   \`\`\`

   ### Core Implementation

   #### Step 1: {Setup/Installation}

   \`\`\`bash
   npm install {library} {dependencies}
   \`\`\`

   #### Step 2: {Configuration}

   \`\`\`typescript
   // config/{feature}.config.ts
   [Code example from research]
   \`\`\`

   #### Step 3: {Main Implementation}

   \`\`\`typescript
   // src/{feature}/index.ts
   [Code example from research]
   \`\`\`

   #### Step 4: {Integration}

   \`\`\`typescript
   // How this integrates with existing code
   [Code example]
   \`\`\`

   ### Code Examples

   #### Example 1: {Common Use Case}

   \`\`\`typescript
   [Real-world code example from research]
   \`\`\`

   #### Example 2: {Edge Case Handling}

   \`\`\`typescript
   [Code example for error handling]
   \`\`\`

   #### Example 3: {Performance Optimization}

   \`\`\`typescript
   [Code example for optimization]
   \`\`\`

   ## Configuration

   ### Environment Variables

   \`\`\`env
   {FEATURE}_ENABLED=true
   {FEATURE}_TIMEOUT=30000
   {FEATURE}_LOG_LEVEL=info
   \`\`\`

   ### Configuration File

   \`\`\`typescript
   // Configuration options and defaults
   [Config schema]
   \`\`\`

   ### Runtime Configuration

   [How to configure at runtime if applicable]

   ## Integration Points

   ### Dependency: {System/Component 1}

   **Integration method:** [API calls, events, database]
   **Data flow:** [Description]
   **Error handling:** [How to handle failures]

   \`\`\`typescript
   [Integration code example]
   \`\`\`

   ### Dependency: {System/Component 2}

   [Similar structure]

   ## Testing Strategy

   ### Test Approach: {TDD | Unit | Integration | Direct}

   [Rationale for chosen test strategy based on ADR context]

   ### Unit Tests

   **Coverage target:** {percentage}%
   **Key test cases:**
   - {Test case 1}
   - {Test case 2}
   - {Test case 3}

   \`\`\`typescript
   // Example unit test
   describe('{Feature}', () => {
     it('should {behavior}', () => {
       [Test code from research]
     })
   })
   \`\`\`

   ### Integration Tests

   **Scenarios:**
   - {Integration scenario 1}
   - {Integration scenario 2}

   \`\`\`typescript
   // Example integration test
   [Test code]
   \`\`\`

   ### End-to-End Tests

   **User flows:**
   - {E2E flow 1}
   - {E2E flow 2}

   ### Performance Tests

   **Benchmarks:**
   - {Metric 1}: {Target value}
   - {Metric 2}: {Target value}

   ### Security Tests

   **Security checks:**
   - {Security test 1}
   - {Security test 2}

   ## Performance Considerations

   ### Expected Metrics

   - **Latency:** {Target latency}
   - **Throughput:** {Target throughput}
   - **Resource usage:** {Memory/CPU limits}

   ### Optimization Strategies

   1. {Optimization 1 from research}
   2. {Optimization 2 from research}
   3. {Optimization 3 from research}

   ### Monitoring

   **Key metrics to track:**
   - {Metric 1}
   - {Metric 2}
   - {Metric 3}

   **Alerting thresholds:**
   - {Alert condition 1}
   - {Alert condition 2}

   ## Security Considerations

   ### Security Requirements

   - {Requirement 1 from ADR}
   - {Requirement 2 from ADR}

   ### Implementation Security

   - {Security measure 1 from research}
   - {Security measure 2 from research}

   ### Common Vulnerabilities

   **Vulnerability:** {Vulnerability type}
   - **Risk:** {Risk level}
   - **Mitigation:** {How to prevent}

   ### Security Testing

   - {Security test approach}

   ## Rollout Plan

   ### Phase 1: {Development}

   **Duration:** {Time estimate}
   **Tasks:**
   - [ ] {Task 1}
   - [ ] {Task 2}
   - [ ] {Task 3}

   ### Phase 2: {Testing}

   **Duration:** {Time estimate}
   **Tasks:**
   - [ ] {Testing task 1}
   - [ ] {Testing task 2}

   ### Phase 3: {Deployment}

   **Strategy:** {Blue-green | Canary | Rolling | Big bang}
   **Rollback plan:** {How to rollback}

   ### Phase 4: {Monitoring}

   **Monitoring period:** {Duration}
   **Success criteria:** {Metrics to watch}

   ## Risk Management

   ### Risk 1: {Risk Description}

   **Likelihood:** {High | Medium | Low}
   **Impact:** {High | Medium | Low}
   **Mitigation:**
   - {Mitigation strategy 1}
   - {Mitigation strategy 2}

   ### Risk 2: {Another Risk}

   [Similar structure]

   ## Acceptance Criteria

   - [ ] {Functional criterion 1}
   - [ ] {Functional criterion 2}
   - [ ] {Performance criterion}
   - [ ] {Security criterion}
   - [ ] {Test coverage criterion}
   - [ ] {Documentation criterion}
   - [ ] {Integration criterion}

   ## Tasks for VTM

   [Optional: Suggest task breakdown for /plan:to-vtm]

   ### Task 1: {Setup and Configuration}
   - Estimated effort: {Hours}
   - Dependencies: None
   - Test strategy: Direct

   ### Task 2: {Core Implementation}
   - Estimated effort: {Hours}
   - Dependencies: Task 1
   - Test strategy: TDD

   ### Task 3: {Integration}
   - Estimated effort: {Hours}
   - Dependencies: Task 2
   - Test strategy: Integration

   ## References

   - [Library documentation]
   - [Research source 1]
   - [Research source 2]
   - [Code example repository]
   - [Best practices guide]

   ## Appendix

   ### Glossary
   [Technical terms used in this spec]

   ### Related ADRs
   - ${adrFile}
   - [Other related ADRs if referenced]

   ### Migration Guide
   [If replacing existing implementation]
   \`\`\`

5. **Output Phase**
   Write the generated spec markdown to: docs/specs/spec-${specName}.md

## Important

- Use /helpers:thinking-partner for comprehensive research (don't make up recommendations)
- Include REAL code examples from research (not pseudocode)
- Be specific about versions, configurations, setup steps
- Link back to source ADR for traceability
- Provide practical, actionable implementation guidance
- Consider the full development lifecycle (code, test, deploy, monitor)

## Expected Output

Generate a complete technical specification at: docs/specs/spec-${specName}.md
````

### Step 4: Handle Task Agent Response

```javascript
// Task agent completes and returns result
console.log("✅ Research complete")
console.log("📝 Generating spec...")

// Verify it was created
if (fs.existsSync(specPath)) {
  console.log(`\n✅ Spec created: docs/specs/spec-${specName}.md`)
  console.log("\n📋 Next Steps:")
  console.log(`1. Review the spec: docs/specs/spec-${specName}.md`)
  console.log("2. Validate code examples and configurations")
  console.log("3. Adjust based on team expertise and constraints")
  console.log("4. Create VTM tasks: /plan:to-vtm " + adrFile + " " + specPath)
} else {
  console.error("❌ Error: Spec generation failed")
  process.exit(1)
}
```

---

## Output Format

Creates `docs/specs/spec-{name}.md` with:

- **Recommended technology stack** (researched, not generic)
- **Implementation approach** (high-level architecture)
- **File structure** (where code should live)
- **Code examples** (real examples from research)
- **Configuration** (env vars, config files)
- **Integration points** (how it connects to existing systems)
- **Testing strategy** (test approach based on ADR)
- **Performance considerations** (benchmarks, optimization)
- **Security considerations** (vulnerabilities, mitigations)
- **Rollout plan** (phased deployment strategy)
- **Risk management** (identified risks with mitigations)
- **Acceptance criteria** (testable completion criteria)
- **Traceability** (links back to source ADR)

---

## Examples

### Example 1: OAuth2 Authentication ADR

**Input ADR** (`adr/ADR-001-oauth2-authentication.md`):

```markdown
# ADR-001: Use OAuth2 for Authentication

## Decision

We will use OAuth2 with PKCE for authentication in our SaaS platform.

## Rationale

- Industry standard for modern applications
- Supports multiple client types (web, mobile, desktop)
- Better security than traditional session-based auth
```

**Command:**

```bash
/plan:create-spec adr/ADR-001-oauth2-authentication.md
```

**Output Spec** (`docs/specs/spec-oauth2-authentication.md`):

```markdown
# Technical Specification: OAuth2 Authentication

## Recommended Technology Stack

### Primary Choice: Passport.js with passport-oauth2 strategy

**Rationale:**

- Mature, battle-tested library (15k+ GitHub stars)
- Excellent TypeScript support
- Extensive middleware ecosystem
- Easy integration with Express/Fastify

**Version:** passport@0.7.0, passport-oauth2@1.8.0

### Code Examples

#### Setup and Configuration

\`\`\`typescript
import passport from 'passport'
import { Strategy as OAuth2Strategy } from 'passport-oauth2'

passport.use('oauth2', new OAuth2Strategy({
authorizationURL: process.env.OAUTH2_AUTH_URL,
tokenURL: process.env.OAUTH2_TOKEN_URL,
clientID: process.env.OAUTH2_CLIENT_ID,
clientSecret: process.env.OAUTH2_CLIENT_SECRET,
callbackURL: process.env.OAUTH2_CALLBACK_URL,
pkce: true, // Enable PKCE
state: true // Enable state parameter
}, async (accessToken, refreshToken, profile, done) => {
// Token validation and user lookup
const user = await findOrCreateUser(profile)
return done(null, user)
}))
\`\`\`

[... rest of detailed spec with testing strategy, performance, security, rollout plan ...]
```

### Example 2: Token Storage ADR

**Command:**

```bash
/plan:create-spec adr/ADR-002-token-storage.md secure-tokens
```

**Output:** `docs/specs/spec-secure-tokens.md` with Redis implementation details

---

## Integration with Workflow

```
/plan:create-prd auth-system "multi-tenant auth"
  ↓
/plan:generate-adrs docs/prd/auth-system.md
  ↓ Generates ADR-001, ADR-002, ADR-003
  ↓
/plan:create-spec docs/adr/ADR-001-oauth2-auth.md
  ↓ Researches Passport.js, Auth0, OAuth2orize
  ↓ Generates docs/specs/spec-oauth2-auth.md with code examples
  ↓
/plan:create-spec docs/adr/ADR-002-token-storage.md
  ↓ Researches Redis, session stores, JWT
  ↓ Generates docs/specs/spec-token-storage.md
  ↓
/plan:to-vtm docs/adr/*.md docs/specs/*.md
  ↓ Creates VTM tasks with full context
```

---

## Error Handling

**Missing ADR file:**

```
❌ Error: ADR file path required
Usage: /plan:create-spec {adr-file} [name]
```

**ADR not found:**

```
❌ Error: ADR file not found: adr/ADR-999.md
```

**Spec already exists:**

```
❌ Error: Spec already exists at docs/specs/spec-oauth2-auth.md
Use a different name or remove existing file
```

**Research incomplete:**

```
⚠️  Warning: Limited research results for some libraries
Generated spec may need additional research
Review sections marked with [RESEARCH NEEDED]
```

---

## Notes

- **Composability:** Uses `/helpers:thinking-partner` internally (not exposed to user)
- **Task Agent:** Orchestrates research → comparison → generation
- **Research Quality:** Multiple research queries for comprehensive coverage
- **Code Examples:** Real examples from research, not pseudocode
- **Practical Focus:** Actionable guidance, not theoretical discussion
- **Traceability:** Links back to source ADR

---

## See Also

- `/plan:create-prd` - Create PRD
- `/plan:generate-adrs` - Generate ADRs from PRD (prerequisite)
- `/helpers:thinking-partner` - Generic research tool (used internally)
- `/plan:to-vtm` - Convert ADRs and specs to VTM tasks

---

**Status:** Specification complete, ready for implementation
**Dependencies:** `/plan:generate-adrs` (should run first), `/helpers:thinking-partner` (existing)
**Composability:** Uses thinking partner internally, generates practical spec directly
