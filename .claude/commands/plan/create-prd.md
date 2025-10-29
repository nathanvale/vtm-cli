---
allowed-tools: Task, Read(docs/prd/*.md, .claude/templates/template-prd.md), Write(docs/prd/*.md), Bash(mkdir *)
description: Create a research-backed Product Requirements Document using task agents
argument-hint: {name} [description]
---

# Plan: Create PRD

**Command:** `/plan:create-prd {name} [description]`
**Purpose:** Create a research-backed Product Requirements Document using task agents

---

## What This Command Does

Creates a complete PRD with researched content (not a blank template) by:

1. Launching a task agent to research the topic
2. Task agent uses `/helpers:thinking-partner` for multi-source research
3. Task agent structures research into PRD format
4. Generates `prd/{name}.md` with comprehensive content

**Key Benefit:** You get a researched, structured PRD ready for review, not a blank template to fill out.

---

## Usage

```bash
# With description (recommended)
/plan:create-prd auth-system "multi-tenant authentication for SaaS platform"

# Minimal (will prompt for description)
/plan:create-prd payment-gateway

# Complex feature with context
/plan:create-prd analytics "real-time analytics dashboard with WebSocket updates and React visualization"
```

---

## Parameters

- `{name}`: PRD filename slug (required)
  - Example: `auth-system`, `payment-gateway`, `analytics-dashboard`
  - Will create: `prd/{name}.md`

- `[description]`: Feature description for research (optional but recommended)
  - Natural language description of what to build
  - More detail = better research results
  - If omitted, command will prompt for it

---

## Implementation Instructions

You are implementing the `/plan:create-prd` command. Here's how to do it:

### Step 1: Parse Arguments

```javascript
const name = ARGUMENTS[0]
const description = ARGUMENTS.slice(1).join(" ")

if (!name) {
  console.error("❌ Error: PRD name required")
  console.log("Usage: /plan:create-prd {name} [description]")
  console.log(
    'Example: /plan:create-prd auth-system "multi-tenant authentication"',
  )
  process.exit(1)
}

if (!description) {
  console.log("💡 Tip: Provide a description for better research")
  console.log(
    'Example: /plan:create-prd auth-system "multi-tenant auth for SaaS"',
  )
  // Could prompt for description or use name as fallback
  const fallbackDescription = name.replace(/-/g, " ")
  description = fallbackDescription
}
```

### Step 2: Read PRD Template

Read the PRD template from `.claude/templates/template-prd.md`:

```bash
# Read the template
Read .claude/templates/template-prd.md
```

This template provides the structure that the task agent should fill in with researched content.

### Step 3: Create PRD Directory

```bash
mkdir -p docs/prd
```

Check if PRD already exists:

```bash
if [ -f "docs/prd/${name}.md" ]; then
  echo "❌ Error: PRD already exists at docs/prd/${name}.md"
  echo "Use a different name or remove existing file"
  exit 1
fi
```

### Step 3: Launch Task Agent

Use Claude Code's `Task` tool to launch an agent that will:

1. Research the topic
2. Generate PRD content

```javascript
console.log(`📝 Creating PRD for: ${description}`)
console.log("🔍 Launching research agent...\n")

// This is the core composability - we launch a task agent
// The agent will use /helpers:thinking-partner internally
```

**Task Agent Prompt:**

````
You are a PRD creation specialist. Your job is to create a comprehensive Product Requirements Document using the standard template.

## Your Task

Create a PRD for: "${description}"

## Template Structure

Use the template from `.claude/templates/template-prd.md` which has this structure:

```markdown
---
title: <Feature> PRD
status: draft
owner: Nathan
version: 0.1.0
date: <date>
spec_type: prd
---

# <Feature> — PRD

## 1) Problem & Outcomes
## 2) Users & Jobs
## 3) Scope (MVP → v1)
## 4) User Flows
## 5) Non-Functional
## 6) Decisions (Locked)
## 7) Open Questions
```

## Process

1. **Research Phase**
   Use /helpers:thinking-partner to research:
   - Problem space and user needs
   - Common architectural approaches for similar features
   - Success criteria and metrics
   - Potential risks and constraints
   - Best practices from real implementations

   Research command:
   /helpers:thinking-partner "${description} requirements and best practices" --deep --sources=web,docs,code

2. **Structure Phase**
   Fill in the template sections with research findings:

   **1) Problem & Outcomes**
   - Problem: Clear problem statement from research
   - Success metrics: Measurable outcomes

   **2) Users & Jobs**
   - Primary user: Who will use this
   - Top jobs-to-be-done: What users need to accomplish

   **3) Scope (MVP → v1)**
   - In: What's included in this release
   - Out (YAGNI): What's explicitly excluded

   **4) User Flows**
   - Document key user flows from research

   **5) Non-Functional**
   - Privacy, Reliability, Performance, Accessibility requirements

   **6) Decisions (Locked)**
   - Key architectural/technical decisions that are locked in
   - Technology choices and rationale

   **7) Open Questions**
   - Unresolved questions that need answers

3. **Generation Phase**
   Fill in the PRD template with researched content:

   ```markdown
   ---
   title: ${name.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} PRD
   status: draft
   owner: Nathan
   version: 0.1.0
   date: ${new Date().toISOString().split('T')[0]}
   spec_type: prd
   ---

   # ${name.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())} — PRD

   ## 1) Problem & Outcomes

   - Problem: [Clear problem statement from research]
   - Success metrics: [Measurable outcomes]

   ## 2) Users & Jobs

   - Primary user: [User persona from research]
   - Top jobs-to-be-done:
     - [Job 1]
     - [Job 2]

   ## 3) Scope (MVP → v1)

   - In:
     - [Feature 1 from research]
     - [Feature 2 from research]
   - Out (YAGNI):
     - [Explicitly excluded features]

   ## 4) User Flows

   - Flow A: [User flow from research]
   - Flow B: [Another flow]

   ## 5) Non-Functional

   - Privacy: [Privacy requirements]
   - Reliability: [Reliability requirements]
   - Performance: [Performance metrics]
   - Accessibility: [Accessibility standards]

   ## 6) Decisions (Locked)

   - [Decision 1: Technology choice with rationale]
   - [Decision 2: Architecture approach with rationale]

   ## 7) Open Questions

   - Q1: [Unresolved question]
   - Q2: [Another question]
   ```

4. **Output Phase**
   Write the generated PRD markdown to: docs/prd/${name}.md

## Important

- Use /helpers:thinking-partner for ALL research (don't make up content)
- Structure findings into the PRD format above
- Include specific details from research (not generic placeholders)
- Cite research sources in the PRD
- Generate complete PRD content (not a blank template)
````

### Step 4: Handle Task Agent Response

```javascript
// Task agent completes and returns result
console.log("✅ Research complete")
console.log("📝 Generating PRD...")

// Agent writes file to prd/{name}.md
// Verify it was created

if (fs.existsSync(prdPath)) {
  console.log(`\n✅ PRD created: docs/prd/${name}.md`)
  console.log("\n📋 Next Steps:")
  console.log(`1. Review the PRD: docs/prd/${name}.md`)
  console.log(`2. Refine as needed`)
  console.log(`3. Generate ADRs: /plan:generate-adrs docs/prd/${name}.md`)
} else {
  console.error("❌ Error: PRD generation failed")
  process.exit(1)
}
```

---

## Output Format

Creates `prd/{name}.md` with:

- **Researched content** (not blank placeholders)
- **Structured sections** (Overview, Decisions, Requirements, etc.)
- **Cited sources** (links to research)
- **Actionable** (clear decisions and acceptance criteria)
- **Ready for review** (can be refined but not empty)

---

## Examples

### Example 1: Authentication System

```bash
/plan:create-prd auth-system "multi-tenant authentication with OAuth2 and SAML support"
```

Output: `prd/auth-system.md` with:

- Problem: Multi-tenant SaaS needs flexible authentication
- Vision: Support both OAuth2 (modern) and SAML (enterprise)
- Decisions: OAuth2 vs JWT vs SAML comparison
- Requirements: SSO, MFA, tenant isolation, audit logging
- Risks: Token management complexity, SAML integration complexity

### Example 2: Payment Gateway

```bash
/plan:create-prd payment-gateway "Stripe integration with webhook handling and subscription management"
```

Output: `prd/payment-gateway.md` with:

- Problem: Need to process payments and manage subscriptions
- Vision: Reliable payment processing with comprehensive error handling
- Decisions: Stripe vs other providers, webhook architecture
- Requirements: Payment processing, subscription management, refunds, reporting
- Risks: Webhook replay attacks, payment failure handling

---

## Integration with Workflow

```
User idea: "I need authentication"
  ↓
/plan:create-prd auth-system "multi-tenant auth"
  ↓ Task agent researches (via /helpers:thinking-partner)
  ↓ Task agent generates prd/auth-system.md
  ↓ User reviews and refines
  ↓
/plan:generate-adrs prd/auth-system.md
  ↓ Creates ADR-001, ADR-002, ADR-003
  ↓
/plan:create-spec adr/ADR-001.md
  ↓ Creates spec with implementation details
  ↓
/plan:to-vtm adr/*.md specs/*.md
  ↓ Creates VTM tasks
```

---

## Error Handling

**Missing name:**

```
❌ Error: PRD name required
Usage: /plan:create-prd {name} [description]
```

**PRD already exists:**

```
❌ Error: PRD already exists at prd/auth-system.md
Use a different name or remove existing file
```

**Research fails:**

```
⚠️  Warning: Research incomplete (web search failed)
Generated PRD may need manual research additions
```

---

## Notes

- **Composability:** Uses `/helpers:thinking-partner` internally (not exposed to user)
- **Task Agent:** Orchestrates research → structure → generation
- **No Intermediate Files:** No JSON files, direct markdown output
- **Quality:** Research-backed content, not blank templates
- **Flexibility:** User can refine generated PRD before continuing

---

## See Also

- `/helpers:thinking-partner` - Generic research tool (used internally)
- `/plan:generate-adrs` - Generate ADRs from PRD
- `/plan:create-spec` - Create implementation spec
- `/plan:to-vtm` - Convert to VTM tasks

---

**Status:** Specification complete, ready for implementation
**Dependencies:** `/helpers:thinking-partner` (existing), Task tool (Claude Code)
**Composability:** Uses thinking partner internally, outputs PRD directly
