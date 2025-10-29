# ADR-001: Plan Domain PRD Workflow Architecture

**Status:** Proposed
**Date:** 2025-10-30
**Author:** Architecture Analysis
**Source PRD:** `prd/prd-plan-workflow.md`

## Context

The VTM CLI currently supports transforming ADR+Spec document pairs into executable VTM tasks via the `/plan:to-vtm` command. However, users must manually create both ADRs and Specs from scratch, creating friction in the planning workflow.

The plan domain was designed as a "document transformation bridge," but this leaves a gap upstream: there's no guided process for documenting initial requirements and architectural decisions before they're refined into ADRs and Specs.

Teams need a complete planning lifecycle:
```
Requirements (PRD) → Architecture Decisions (ADR) → Specifications (Spec) → Tasks (VTM)
```

Currently, the first step (PRD) is missing, forcing users to jump directly to the hardest step (ADR writing).

### Key Constraints

1. **Token Efficiency**: VTM CLI achieves 99% token reduction through surgical context access. Any new feature must maintain this principle.

2. **Backward Compatibility**: The existing `/plan:to-vtm` ADR-first workflow is already in use and cannot break.

3. **Composability**: Commands should be independent and combinable, not monolithic workflows.

4. **User Control**: Generated content should preview before saving, allowing users to review/edit/reject.

## Decision

**Extend the plan domain to manage the complete planning lifecycle** by adding four new commands:

1. `/plan:create-prd {name}` — Generate structured PRD from template
2. `/plan:to-adr {prd-file}` — Transform PRD → ADR via AI with surgical section extraction
3. `/plan:to-spec {prd-file}` — Transform PRD → Spec via AI with surgical section extraction
4. `/plan:to-pair {prd-file}` — Orchestrate both transformations with incremental generation

**Redefine plan domain responsibility** from "document transformation bridge" to "planning lifecycle manager":
- Create planning artifacts (PRD templates)
- Transform between abstraction levels (PRD→ADR/Spec)
- Execute plans (PRD→ADR/Spec→VTM)

**Implement hybrid approach:**
- Templates guide PRD structure (reduces friction)
- AI agents transform with intelligence (handles real-world complexity)
- Surgical section extraction maintains token efficiency (80%+ reduction)
- Traceability links ensure auditability (line number references)

## Rationale

### Why Extend Plan Domain vs Create New Domain

**Alternative: Separate "docs" domain**
- ❌ Breaks conceptual cohesion (planning scattered across domains)
- ❌ Creates unnecessary fragmentation
- ❌ Violates composability (can't do PRD→ADR→VTM in one workflow)
- ❌ Over-engineering for templates

**Chosen: Extend plan domain**
- ✅ Conceptually cohesive (all planning activities together)
- ✅ Workflow continuity (PRD→ADR→Spec→VTM natural progression)
- ✅ Precedent (plan domain already handles orchestration with /plan:to-vtm)
- ✅ Simple and discoverable

### Why Hybrid (Templates + AI) vs Alternatives

**Alternative A: Template-Only (Mechanical Extraction)**
- ❌ Rigid structure requirement
- ❌ No intelligence for handling variability
- ❌ Users must match template exactly
- Result: Lower adoption, frustration with constraints

**Alternative B: AI-Only (Full PRD Context)**
- ❌ Violates VTM token efficiency philosophy
- ❌ Full PRDs are 5000+ tokens each
- ❌ Doesn't scale with large planning documents
- ❌ Expensive token costs
- Result: Contradicts core VTM value proposition

**Chosen: Hybrid (Templates Guide, AI Transforms)**
- ✅ Templates reduce blank page syndrome
- ✅ AI handles real-world complexity and variability
- ✅ Surgical extraction: 5000 tokens → 800 tokens (80% reduction)
- ✅ Maintains VTM token efficiency philosophy
- ✅ Consistent with existing /plan:to-vtm pattern
- Result: Best of both worlds — guided structure + intelligent transformation

### Why Token-Efficient Extraction

Standard approach: Feed full PRD to AI → 5000+ tokens consumed per transformation

Surgical extraction approach:
1. Parse PRD markdown structure
2. Extract only decision-relevant sections (keywords: "Decision", "Technical", "Architecture")
3. Hard limit at 1500 tokens
4. Result: 800-900 tokens (84% reduction)

**Rationale:**
- PRDs contain marketing copy, user personas, timelines, etc.
- AI only needs: technical decisions, trade-offs, alternatives
- Extraction filters to relevant content automatically
- Maintains VTM philosophy: "load only what you need"

**Benefit:** Full planning workflow (PRD→ADR→Spec→VTM) uses 30% fewer tokens than today's manual ADR writing approach.

### Why Flexible Workflows vs Monolithic Command

**Alternative: Single `/plan:generate-all` command**
- ❌ Less user control (can't generate just ADR)
- ❌ Harder to test (tight coupling)
- ❌ Doesn't support hybrid workflow (PRD + manual Spec)
- Result: Reduced flexibility

**Chosen: Composable Commands**
- ✅ `/plan:to-adr` works standalone
- ✅ `/plan:to-spec` works standalone
- ✅ `/plan:to-pair` orchestrates both
- ✅ Users can choose workflow:
  - PRD-first: `/plan:create-prd` → `/plan:to-pair`
  - ADR-first: write manually → `/plan:to-vtm` (existing)
  - Hybrid: `/plan:create-prd` → `/plan:to-adr` (edit) → manual Spec
- Result: Maximum flexibility, better testability

### Why Traceability Matters

Generated ADRs/Specs must link back to source PRD with line numbers:

```yaml
source_prd: prd/auth-system.md
source_sections:
  - section: "## Technical Decisions"
    lines: "42-58"
```

**Benefits:**
1. **Verification**: Did we capture all PRD requirements?
2. **Update propagation**: PRD changes → know which ADRs to review
3. **Audit trail**: "Why was this decided?" → Trace to PRD section
4. **Consistency check**: Spec requirements match PRD requirements

**Implementation:** Consistent with VTM's TaskRichContext pattern for task↔source linking.

## Alternatives Considered

### 1. Do Nothing (Status Quo)
- Users continue writing ADRs/Specs manually
- **Rejected:** Doesn't solve the friction problem; forces users to start with the hardest step

### 2. Generate From Code/Comments
- Scrape source code for decision comments
- **Rejected:** Decisions should be made BEFORE code; code is too late

### 3. External Tools (Confluence, Google Docs)
- Use external PRD tool, manually sync to VTM
- **Rejected:** Increases fragmentation; violates composability principle

### 4. Monolithic Single Command
- `/plan:generate-all prd.md` does everything
- **Rejected:** Less control, harder to test, doesn't support hybrid workflows

### 5. Machine Learning-Based Extraction
- Train ML model on ADR/Spec pairs to auto-generate
- **Rejected:** Overkill complexity; hybrid approach sufficient; ML models expensive to train/maintain

## Consequences

### Positive

1. **Reduced Friction**: Users can go PRD → ADR → Spec → VTM in guided workflow
2. **Better Quality**: AI-generated docs have consistent structure, don't miss sections
3. **Token Efficient**: Surgical extraction maintains VTM's 99% reduction promise
4. **Backward Compatible**: Zero breaking changes to existing ADR-first workflow
5. **Flexible**: Three independent workflows supported
6. **Auditable**: Traceability links maintain decision context
7. **Improved UX**: Skills provide workflow hints; plan-expert guides users

### Negative/Trade-offs

1. **Broader Responsibility**: Plan domain becomes larger (planning lifecycle manager)
2. **AI Dependency**: Transformation quality depends on AI agent quality
3. **Prompt Engineering**: Must maintain high-quality AI prompts over time
4. **Testing Complexity**: Non-deterministic AI outputs require snapshot testing
5. **User Education**: More commands to learn (mitigated by skill hints)

### Risks & Mitigations

**Risk: Poor AI generation quality**
- Mitigation: Deploy with `--preview` flag required; users must approve before saving
- Mitigation: Iterate on prompts based on real-world feedback
- Mitigation: Users can always edit or write manually if quality poor

**Risk: Token costs exceed budget**
- Mitigation: Surgical extraction keeps per-transformation cost low (~800 tokens)
- Mitigation: Content-hash caching prevents duplicate transformations
- Mitigation: Monitor and alert on token usage patterns

**Risk: User confusion (too many commands)**
- Mitigation: Enhance plan-expert skill with workflow-aware suggestions
- Mitigation: Clear documentation with workflow diagrams
- Mitigation: Progressive disclosure (advanced features revealed later)

**Risk: Existing ADR-first workflow breaks**
- Mitigation: All new commands additive; `/plan:to-vtm` unchanged
- Mitigation: No workflow state machine (users choose their path)
- Mitigation: Comprehensive testing of backward compatibility

## Implementation

### Phases

**Phase 1 (MVP): Templates Only** — 8 hours
- Create PRD template with sections
- Implement `/plan:create-prd` command
- Users can create structured PRDs
- Existing manual ADR/Spec workflow

**Phase 2 (Core): AI Transformations** — 12 hours
- Implement section extraction logic
- Implement `/plan:to-adr` with AI agent
- Implement `/plan:to-spec` with AI agent
- Implement `/plan:to-pair` orchestration
- Preview mode for all transformations

**Phase 3 (Polish): Quality & Performance** — 6 hours
- Content-hash intelligent caching
- `/plan:validate-prd` command
- Skills integration with hints
- Testing and prompt refinement

### Testing

- **Unit tests**: Extraction logic, naming, frontmatter generation
- **Integration tests**: Full pipeline PRD→ADR→Spec→VTM
- **Snapshot tests**: AI outputs (approval-based on first run)
- **Target coverage**: 80%+

### Documentation

- Update CLAUDE.md with PRD workflow section
- Add PRD template guide
- Document three workflows (PRD-first, ADR-first, hybrid)
- Add example PRDs
- Create workflow diagrams

## Related Decisions

- **ADR-002** (pending): PRD Template Structure and Section Mapping
- **ADR-003** (pending): Token-Efficient Section Extraction Algorithm
- **ADR-004** (pending): AI Agent Prompt Design for Transformations

## References

- VTM CLI CLAUDE.md: Plan-to-VTM Bridge section
- TaskRichContext pattern in CLAUDE.md (for traceability design)
- Project requirements: Token efficiency (99% reduction), composability, backward compatibility
