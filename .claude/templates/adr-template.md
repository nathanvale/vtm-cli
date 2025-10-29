---
title: "ADR-[NUMBER]: [Decision Title]"
status: draft # draft|review|approved|deprecated|superseded
owner: [Owner Name or Team]
version: 0.1.0
date: YYYY-MM-DD
supersedes: [] # List of ADR numbers this replaces, e.g., [ADR-001]
superseded_by: null # ADR number that replaces this one
related_adrs: [] # Related ADRs for context
related_specs: [] # Specs implementing this decision
---

# ADR-[NUMBER]: [Decision Title]

<!--
NAMING CONVENTION: ADR-[number]-[kebab-case-title].md
LOCATION: docs/adr/
NUMBERING: Sequential, padded to 3 digits (001, 002, etc.)

USAGE:
1. Copy this template to docs/adr/ADR-[number]-[title].md
2. Update frontmatter with decision metadata
3. Fill in all sections, removing guidance comments
4. Link from relevant specs
5. Update ADR index if exists

CROSS-REFERENCES:
- Link to specs that implement this decision
- Reference related ADRs for context
-->

## Status

**Current Status**: [DRAFT | REVIEW | APPROVED | DEPRECATED | SUPERSEDED]

**Decision Date**: [YYYY-MM-DD when status became APPROVED]

**Supersedes**:
- [Link to previous ADR if applicable, e.g., ADR-001-old-decision.md]

**Superseded By**:
- [Link to newer ADR if deprecated/superseded]

**Related Decisions**:
- [Links to related ADRs that provide context]

---

## Context

<!--
Describe the problem/opportunity that requires a decision.
Include:
- Current situation and constraints
- Business/technical drivers
- Stakeholders affected
- Timeline pressures
- Relevant background
-->

[PLACEHOLDER: What problem are we solving? What forces are at play?]

### Forces

<!-- List competing concerns that influence this decision -->

- **[Force 1]**: [Description, e.g., "Need for rapid development"]
- **[Force 2]**: [Description, e.g., "Long-term maintainability"]
- **[Force 3]**: [Description, e.g., "Team expertise constraints"]

---

## Decision

<!--
State the decision clearly and concisely.
Use active voice: "We will..." or "We have decided to..."
-->

[PLACEHOLDER: We will [ACTION] because [REASON].]

### Rationale

<!--
Explain WHY this decision was made.
- What alternatives were considered?
- Why were they rejected?
- What makes this the best choice given the forces?
-->

[PLACEHOLDER: Detailed explanation of why this approach was chosen]

---

## Alternatives Considered

### Alternative 1: [Name]

**Description**: [PLACEHOLDER: Brief description]

**Pros**:
- [PLACEHOLDER: Advantage 1]
- [PLACEHOLDER: Advantage 2]

**Cons**:
- [PLACEHOLDER: Disadvantage 1]
- [PLACEHOLDER: Disadvantage 2]

**Rejected Because**: [PLACEHOLDER: Why this wasn't chosen]

---

### Alternative 2: [Name]

**Description**: [PLACEHOLDER: Brief description]

**Pros**:
- [PLACEHOLDER: Advantage 1]

**Cons**:
- [PLACEHOLDER: Disadvantage 1]

**Rejected Because**: [PLACEHOLDER: Why this wasn't chosen]

---

## Consequences

<!-- What becomes easier/harder as a result of this decision? -->

### Positive Consequences

- [PLACEHOLDER: Benefit 1, e.g., "Faster development cycles"]
- [PLACEHOLDER: Benefit 2, e.g., "Reduced complexity"]

### Negative Consequences

- [PLACEHOLDER: Trade-off 1, e.g., "Increased memory usage"]
- [PLACEHOLDER: Trade-off 2, e.g., "Learning curve for new pattern"]

### Neutral Consequences

- [PLACEHOLDER: Impact 1, e.g., "Requires updating documentation"]
- [PLACEHOLDER: Impact 2, e.g., "Team needs training"]

---

## Implementation Guidance

<!--
How should teams implement this decision?
Link to specs, guides, or code examples.
-->

[PLACEHOLDER: Step-by-step guidance or links to implementation specs]

**Related Documentation**:
- [Link to technical spec implementing this decision]
- [Link to guide for developers]
- [Link to code examples if applicable]

---

## Validation Criteria

<!-- How do we know this decision is working? -->

- [ ] [PLACEHOLDER: Success metric 1, e.g., "Build time reduced by 20%"]
- [ ] [PLACEHOLDER: Success metric 2, e.g., "Zero production incidents related to X"]
- [ ] [PLACEHOLDER: Success metric 3, e.g., "Developer satisfaction survey > 80%"]

---

## Review Schedule

**Next Review Date**: [YYYY-MM-DD, typically 3-6 months after approval]

**Review Triggers**:
- [PLACEHOLDER: Condition that would trigger early review, e.g., "Major framework version change"]
- [PLACEHOLDER: Condition 2, e.g., "Team size doubles"]

---

## Notes

<!--
Additional context, historical notes, or links to discussions.
Include:
- Meeting notes or RFC links
- Slack/email threads
- External references
-->

[PLACEHOLDER: Any additional context or historical notes]

**Decision Log**:
- [YYYY-MM-DD]: ADR created (status: DRAFT)
- [YYYY-MM-DD]: Moved to REVIEW
- [YYYY-MM-DD]: APPROVED by [stakeholders]
