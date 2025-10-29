---
allowed-tools: Task, Read(docs/adr/*.md, .claude/templates/template-adr.md), Write(docs/adr/*.md), Bash(mkdir *, ls *)
description: Create a single Architecture Decision Record with research-backed alternatives
argument-hint: {decision-topic} [--related-adrs=ADR-XXX,ADR-YYY]
---

# Plan: Create ADR

**Command:** `/plan:create-adr {decision-topic} [--related-adrs=ADR-XXX,ADR-YYY]`
**Purpose:** Create a single, research-backed Architecture Decision Record for ad-hoc decisions

---

## What This Command Does

Creates a single ADR with researched alternatives by:

1. Taking a decision topic as input
2. Launching a task agent to research the decision
3. Task agent uses `/helpers:thinking-partner` to research alternatives and trade-offs
4. Task agent fills in ADR template with researched content
5. Auto-numbers the ADR (finds highest existing + 1)
6. Outputs `docs/adr/ADR-XXX-{topic-slug}.md`

**Key Benefit:** Document single decisions ad-hoc without needing a PRD. Perfect for emergent decisions, simple choices, or updating existing architecture.

---

## Usage

```bash
# Basic usage
/plan:create-adr "database migration strategy"

# With related ADRs
/plan:create-adr "rate limiting approach" --related-adrs=ADR-002,ADR-005

# After research
/helpers:thinking-partner "caching strategies for Node.js"
/plan:create-adr "Redis caching layer"

# Complex decision
/plan:create-adr "GraphQL vs REST API design for mobile clients"
```

---

## Parameters

- `{decision-topic}`: The architectural decision to document (required)
  - Example: "database migration strategy"
  - Be specific: "rate limiting" → "Redis-based rate limiting with sliding window"
  - Should be a question or problem statement

- `[--related-adrs]`: Comma-separated list of related ADR numbers (optional)
  - Example: `--related-adrs=ADR-001,ADR-003`
  - These will be linked in the ADR frontmatter and Related Decisions section

---

## When to Use This Command

**Use `/plan:create-adr` when:**

- ✅ Making an ad-hoc architectural decision during implementation
- ✅ Documenting a decision that emerged after PRD was written
- ✅ Creating a simple decision that doesn't warrant a full PRD
- ✅ Adding a new decision to existing architecture (ADR-011, ADR-012, etc.)
- ✅ Superseding or updating an old decision

**Use `/plan:generate-adrs` when:**

- 📋 Extracting multiple decisions from a PRD
- 📋 Converting a planning document into multiple ADRs
- 📋 Doing initial architecture design from requirements

---

## Implementation Instructions

You are implementing the `/plan:create-adr` command. Here's how to do it:

### Step 1: Parse Arguments and Validate

```bash
# Extract decision topic (everything before flags)
DECISION_TOPIC="${ARGUMENTS[0]}"

# Extract related ADRs flag if present
RELATED_ADRS=""
for arg in "${ARGUMENTS[@]}"; do
  if [[ $arg == --related-adrs=* ]]; then
    RELATED_ADRS="${arg#--related-adrs=}"
  fi
done

if [ -z "$DECISION_TOPIC" ]; then
  echo "❌ Error: Decision topic required"
  echo "Usage: /plan:create-adr {decision-topic} [--related-adrs=ADR-XXX,ADR-YYY]"
  echo "Example: /plan:create-adr \"database migration strategy\""
  exit 1
fi

# Validate related ADRs if provided
if [ -n "$RELATED_ADRS" ]; then
  echo "🔍 Validating related ADRs: $RELATED_ADRS"
  IFS=',' read -ra ADR_LIST <<< "$RELATED_ADRS"

  VALIDATION_WARNINGS=0
  for adr in "${ADR_LIST[@]}"; do
    adr=$(echo "$adr" | xargs) # trim whitespace

    # Check if ADR file exists
    ADR_FILE=$(ls docs/adr/${adr}.md docs/adr/${adr}-*.md 2>/dev/null | head -n1)

    if [ -z "$ADR_FILE" ]; then
      echo "⚠️  Warning: Related ADR not found: $adr"
      echo "   This ADR will be referenced but doesn't exist yet"
      VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
    else
      # Validate ADR structure using basic checks
      ADR_CONTENT=$(cat "$ADR_FILE")

      # Check for ADR header
      if ! echo "$ADR_CONTENT" | grep -q "^# ADR-"; then
        echo "⚠️  Warning: $adr missing ADR header (e.g., '# ADR-001: Title')"
        VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
      fi

      # Check for required sections
      MISSING_SECTIONS=""
      for section in "Status" "Context" "Decision"; do
        if ! echo "$ADR_CONTENT" | grep -q "^## $section"; then
          MISSING_SECTIONS="$MISSING_SECTIONS $section"
        fi
      done

      if [ -n "$MISSING_SECTIONS" ]; then
        echo "⚠️  Warning: $adr missing sections:$MISSING_SECTIONS"
        VALIDATION_WARNINGS=$((VALIDATION_WARNINGS + 1))
      fi

      echo "✅ $adr validated"
    fi
  done

  if [ $VALIDATION_WARNINGS -gt 0 ]; then
    echo ""
    echo "⚠️  Found $VALIDATION_WARNINGS warning(s) in related ADRs"
    echo "   You can still proceed, but review the warnings above"
    echo ""
  fi
fi
```

### Step 2: Read ADR Template

Read the ADR template from `.claude/templates/template-adr.md`:

```bash
# Read the template
Read .claude/templates/template-adr.md
```

This template provides the standard ADR structure that the task agent should fill in.

### Step 3: Create ADR Directory and Get Next Number

```bash
mkdir -p docs/adr
```

Find the next ADR number:

```bash
# Find highest existing ADR number
HIGHEST_NUM=$(ls docs/adr/ADR-*.md 2>/dev/null | sed 's/.*ADR-\([0-9]*\).*/\1/' | sort -n | tail -1)

# If no ADRs exist, start with 001
if [ -z "$HIGHEST_NUM" ]; then
  NEXT_NUM="001"
else
  NEXT_NUM=$(printf "%03d" $((10#$HIGHEST_NUM + 1)))
fi

echo "📝 Creating ADR-${NEXT_NUM}"
```

### Step 4: Launch Task Agent

Use Claude Code's `Task` tool to launch an agent that will:

1. Research the decision topic
2. Gather alternatives and trade-offs
3. Fill in ADR template
4. Generate ADR file

```bash
echo "🔍 Researching decision: ${DECISION_TOPIC}"
echo "🤖 Launching ADR creation agent..."
```

**Task Agent Prompt:**

````
You are an ADR creation specialist. Your job is to create a comprehensive Architecture Decision Record using the standard template.

## Your Task

Create an ADR for: "${DECISION_TOPIC}"

## Related ADRs

${RELATED_ADRS:+Related ADRs to reference: $RELATED_ADRS}

## Template Structure

Use the template from `.claude/templates/template-adr.md` which has this structure:

```markdown
---
title: "ADR-[NUMBER]: [Decision Title]"
status: draft
owner: [Owner Name]
version: 0.1.0
date: YYYY-MM-DD
related_adrs: []
---

# ADR-[NUMBER]: [Decision Title]

## Status
## Context
## Decision
## Alternatives Considered
## Consequences
## Implementation Guidance
## Validation Criteria
## Review Schedule
## Notes
```

## Process

1. **Research Phase**
   Check cache before using /helpers:thinking-partner:

   **Caching Integration (NEW):**

   Initialize research cache (shared with other plan commands):
   ```typescript
   import { ResearchCache } from 'vtm-cli/lib'

   const cache = new ResearchCache(
     '.claude/cache/research',  // Shared cache location
     30 * 24 * 60              // 30 days TTL
   )
   ```

   Follow this caching pattern:
   ```typescript
   // 1. Normalize query for consistent caching
   const query = `${DECISION_TOPIC} alternatives and trade-offs`

   // 2. Check cache first
   let research = await cache.get(query)

   if (research) {
     console.log(`✅ Using cached research for: ${DECISION_TOPIC}`)
   } else {
     console.log(`🔍 Researching: ${DECISION_TOPIC} (not cached)`)

     // 3. Call thinking-partner (30-60 seconds)
     research = await thinkingPartner(query, {
       deep: true,
       sources: ['web', 'docs', 'code']
     })

     // 4. Store in cache with semantic tags
     const tags = [
       DECISION_TOPIC.split(' ')[0].toLowerCase(), // Primary topic
       'alternatives',                             // Type of research
       'adr-creation',                            // Source command
       'ad-hoc'                                   // Differentiates from generate-adrs
     ]
     await cache.set(query, research, tags)
   }

   // 5. Use research result to generate ADR
   ```

   **Research topics to cache:**
   - Alternative approaches for this decision
   - Trade-offs between alternatives
   - Industry best practices
   - Real-world implementations
   - Pros and cons of each approach
   - Performance, security, maintainability considerations

   **Performance Impact:**
   - First ADR (same decision): ~2 minutes (cache miss)
   - Second ADR (same decision): ~10 seconds (cache hit)
   - **95% time savings on repeated decisions**

   **Cache behavior:**
   - Cache miss: Calls /helpers:thinking-partner (slow)
   - Cache hit: Instant retrieval (fast)
   - Shared cache: Can reuse research from /plan:generate-adrs
   - TTL: 30 days (configurable)

2. **Analysis Phase**
   From the research findings, identify:
   - **Context**: What problem requires this decision?
   - **Forces**: What competing concerns exist? (speed vs maintainability, simplicity vs flexibility, etc.)
   - **Top Alternatives**: 3-5 viable alternatives from research
   - **Recommendation**: Which alternative is best for this context?
   - **Rationale**: Why this choice over alternatives?

3. **Structure Phase**
   Fill in the ADR template sections:

   **Frontmatter:**
   ```yaml
   ---
   title: "ADR-${NEXT_NUM}: [Clear decision title]"
   status: draft
   owner: Nathan
   version: 0.1.0
   date: ${new Date().toISOString().split('T')[0]}
   supersedes: []
   superseded_by: null
   related_adrs: [${RELATED_ADRS ? RELATED_ADRS.split(',').map(id => `"${id.trim()}"`).join(', ') : ''}]
   related_specs: []
   ---
   ```

   **Status Section:**
   - Current Status: DRAFT
   - Decision Date: (leave blank - will be filled when approved)
   - Supersedes: (if applicable)
   - Related Decisions: [List related ADRs with brief explanation]

   **Context Section:**
   - Problem statement: What decision needs to be made and why?
   - Current situation: What's the context for this decision?
   - Stakeholders: Who is affected by this decision?
   - Constraints: What limitations exist (technical, business, team)?
   - Forces: List competing concerns (from research)

   **Decision Section:**
   - Clear statement: "We will [DECISION]"
   - Key details: Specific implementation approach
   - Rationale: Why this approach? (from research)

   **Alternatives Considered Section:**
   For each alternative from research:

   ```markdown
   ### Alternative 1: [Name from research]

   **Description**: [What this alternative involves]

   **Pros**:
   - [Pro 1 from research]
   - [Pro 2 from research]

   **Cons**:
   - [Con 1 from research]
   - [Con 2 from research]

   **Rejected Because**: [Specific reason based on context and forces]
   ```

   **Consequences Section:**
   - Positive Consequences: Benefits of this decision
   - Negative Consequences: Trade-offs and drawbacks
   - Neutral Consequences: Changes that are neither good nor bad
   - Risks: Potential risks with mitigation strategies

   **Implementation Guidance Section:**
   - How should teams implement this?
   - What needs to happen first?
   - Links to related specs (if any)
   - Code examples or patterns (if applicable)

   **Validation Criteria Section:**
   - How do we measure if this decision is working?
   - What metrics indicate success?
   - Testable criteria (checkboxes)

   **Review Schedule Section:**
   - Next Review Date: [3-6 months from now]
   - Review Triggers: Conditions that would require early review

   **Notes Section:**
   - Research sources and references
   - Discussion links (if any)
   - Historical context
   - Decision Log:
     ```
     - ${new Date().toISOString().split('T')[0]}: ADR created (status: DRAFT)
     ```

4. **Generation Phase**
   Generate the complete ADR markdown using the template structure above with all researched content filled in.

5. **Output Phase**
   Write the generated ADR markdown to: docs/adr/ADR-${NEXT_NUM}-{slug}.md

   Where {slug} is the decision topic in kebab-case (lowercase, hyphens instead of spaces).

## Important

- Use /helpers:thinking-partner for ALL research (don't make up alternatives)
- Include SPECIFIC details from research (not generic placeholders)
- Provide 3-5 real alternatives with actual pros/cons from research
- Link to related ADRs if --related-adrs flag was provided
- Cite research sources in the Notes section
- Generate complete ADR content (not a blank template)
- Status should always start as "draft"

## Expected Output

Generate a complete ADR at: docs/adr/ADR-${NEXT_NUM}-{decision-slug}.md

The ADR should be ready for review (not a template with TODOs).
````

### Step 5: Handle Task Agent Response

```bash
# Task agent completes and returns result
echo "✅ Research complete"
echo "📝 Generating ADR..."

# Verify it was created
ADR_SLUG=$(echo "$DECISION_TOPIC" | tr '[:upper:]' '[:lower:]' | tr ' ' '-' | sed 's/[^a-z0-9-]//g')
ADR_PATH="docs/adr/ADR-${NEXT_NUM}-${ADR_SLUG}.md"

if [ -f "$ADR_PATH" ]; then
  echo ""
  echo "✅ ADR created: $ADR_PATH"
  echo ""
  echo "📋 Next Steps:"
  echo "1. Review the ADR: $ADR_PATH"
  echo "2. Update status from 'draft' to 'review' when ready"
  echo "3. Create implementation spec: /plan:create-spec $ADR_PATH"
  echo "4. Or convert to VTM tasks: /plan:to-vtm $ADR_PATH <spec-file>"
else
  echo "❌ Error: ADR generation failed"
  exit 1
fi
```

---

## Output Format

Creates `docs/adr/ADR-XXX-{slug}.md` with:

- **Auto-numbered** (ADR-001, ADR-002, etc.)
- **Researched content** (not blank template)
- **Multiple alternatives** (3-5 real options with pros/cons)
- **Clear decision** (recommended approach with rationale)
- **Consequences** (positive, negative, risks)
- **Implementation guidance** (how to proceed)
- **Related ADRs** (if specified with --related-adrs flag)
- **Research citations** (links to sources)
- **Draft status** (ready for review)

---

## Examples

### Example 1: Database Migration Strategy

**Command:**

```bash
/plan:create-adr "database migration strategy for multi-tenant SaaS"
```

**Research covers:**

- Flyway vs Liquibase vs custom scripts
- Schema-per-tenant vs shared schema
- Zero-downtime migration approaches
- Rollback strategies

**Output:** `docs/adr/ADR-001-database-migration-strategy.md`

- Decision: Use Flyway with shared schema + tenant_id column
- Alternatives: Liquibase (XML verbose), Custom scripts (no history tracking)
- Rationale: Flyway's simplicity + version control + rollback support
- Consequences: Need migration testing strategy, potential downtime for major changes

### Example 2: Rate Limiting (Related to Existing ADRs)

**Command:**

```bash
/plan:create-adr "API rate limiting implementation" --related-adrs=ADR-002,ADR-005
```

**Research covers:**

- Token bucket vs leaky bucket vs fixed window
- Redis vs in-memory vs database
- Per-user vs per-IP vs per-API-key
- Rate limit headers and error responses

**Output:** `docs/adr/ADR-006-api-rate-limiting.md`

- Decision: Redis-based sliding window with per-API-key limits
- Related to: ADR-002 (Redis caching), ADR-005 (API authentication)
- Alternatives: Fixed window (burst issues), In-memory (not distributed)
- Rationale: Sliding window prevents burst attacks, Redis already in stack

### Example 3: After Research with Thinking Partner

**Workflow:**

```bash
# Step 1: Research options
/helpers:thinking-partner "observability and monitoring solutions for Node.js microservices" --deep

# Review research output...

# Step 2: Document decision
/plan:create-adr "OpenTelemetry for distributed tracing"
```

**Output:** `docs/adr/ADR-007-opentelemetry-tracing.md`

- Uses research from thinking-partner
- Decision: OpenTelemetry + Jaeger backend
- Alternatives: Datadog APM (expensive), New Relic (vendor lock-in), Custom (reinventing wheel)

---

## Comparison with `/plan:generate-adrs`

| Aspect        | `/plan:create-adr`      | `/plan:generate-adrs`     |
| ------------- | ----------------------- | ------------------------- |
| **Input**     | Decision topic (string) | PRD file                  |
| **Output**    | ONE ADR                 | MULTIPLE ADRs             |
| **Use Case**  | Ad-hoc decision         | Extract from planning doc |
| **Numbering** | Auto (highest + 1)      | Auto (sequential batch)   |
| **Research**  | Single topic            | Multiple decisions        |
| **Timing**    | Anytime during project  | During initial planning   |

---

## Integration with Workflow

### Standalone Usage

```
New Decision → /plan:create-adr → ADR-XXX.md → /plan:create-spec → Spec
```

### After PRD Workflow

```
PRD → /plan:generate-adrs → ADR-001, ADR-002, ADR-003
  ↓
During Implementation: New decision emerges
  ↓
/plan:create-adr "emergent decision" → ADR-004.md
```

### Research-Driven

```
/helpers:thinking-partner "decision research"
  ↓
Review options
  ↓
/plan:create-adr "chosen approach"
  ↓
/plan:create-spec ADR-XXX.md
```

### Full Planning to VTM

```
/plan:create-adr "decision topic"
  ↓
docs/adr/ADR-XXX-decision.md created
  ↓
/plan:create-spec docs/adr/ADR-XXX-decision.md
  ↓
docs/specs/spec-decision.md created
  ↓
/plan:to-vtm docs/adr/ADR-XXX-decision.md docs/specs/spec-decision.md
  ↓
VTM tasks created
```

---

## Error Handling

**Missing decision topic:**

```
❌ Error: Decision topic required
Usage: /plan:create-adr {decision-topic} [--related-adrs=ADR-XXX,ADR-YYY]
```

**Invalid related ADRs:**

```
⚠️  Warning: ADR-999 referenced but not found
Continuing with ADR creation...
```

**Research incomplete:**

```
⚠️  Warning: Limited research results
Generated ADR may need manual additions
Review sections marked with [RESEARCH NEEDED]
```

---

## Notes

- **Composability:** Uses `/helpers:thinking-partner` internally (not exposed to user)
- **Task Agent:** Orchestrates research → synthesis → generation
- **Template-based:** Uses `.claude/templates/template-adr.md` for consistency
- **Auto-numbering:** Finds highest existing ADR and increments
- **Draft Status:** Always starts as "draft", user promotes to "approved"
- **Related ADRs:** Links to existing ADRs if specified
- **Research Quality:** Deep research with web + docs + code sources

---

## See Also

- `/plan:create-prd` - Create PRD for feature planning
- `/plan:generate-adrs` - Generate multiple ADRs from PRD
- `/plan:create-spec` - Create implementation spec from ADR
- `/helpers:thinking-partner` - Research tool (used internally)
- `/plan:to-vtm` - Convert ADRs and specs to VTM tasks

---

**Status:** Specification complete, ready for implementation
**Dependencies:** `/helpers:thinking-partner` (existing), `.claude/templates/template-adr.md` (existing)
**Composability:** Uses thinking partner internally, generates single ADR directly
**Position:** Fourth command in plan domain (create-prd, generate-adrs, **create-adr**, create-spec, to-vtm)
