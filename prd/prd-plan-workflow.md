# PRD: Plan Domain PRD Workflow

## Metadata
- **Author:** Architecture Analysis
- **Date:** 2025-10-30
- **Status:** Approved
- **Target Release:** VTM CLI v1.0
- **Epic:** Planning Lifecycle Management

## Overview

### Problem Statement
Currently, the plan domain only transforms existing ADR+Spec pairs into VTM tasks. Users must manually write ADRs and Specs from scratch, which is time-consuming and error-prone. There's no guided workflow to document requirements before diving into architectural decisions.

### Product Vision
Extend the plan domain to support the complete planning lifecycle: from high-level product requirements (PRD) through architectural decisions (ADR) and technical specifications (Spec) to executable tasks (VTM).

### Success Metrics
- 80% token reduction in PRD → ADR transformation via surgical section extraction
- 70% time savings vs manual ADR/Spec writing
- 90% user satisfaction with AI-generated ADR quality
- 50% adoption rate for PRD-first workflow within 3 months

## Technical Decisions

### Architecture Pattern
**Decision:** Extend plan domain as "planning lifecycle manager" rather than creating separate docs domain

**Rationale:**
- Conceptually cohesive: all planning activities in one place
- Workflow continuity: PRD → ADR → Spec → VTM flows naturally
- Precedent: /plan:to-vtm already handles orchestration
- Avoid over-engineering: don't create new domain for templates

**Alternatives Considered:**
- Create separate "docs" domain for document creation
  - Rejected: Too fragmented, breaks workflow continuity
- Monolithic single command /plan:generate-all
  - Rejected: Reduces user control, difficult to test

**Trade-offs:**
- Plan domain gains more responsibility (broader scope)
- Better UX (fewer commands to remember, natural flow)

### AI-Powered Transformation
**Decision:** Use hybrid approach with templates + AI agents for PRD → ADR/Spec

**Rationale:**
- Templates guide PRD structure (reduces blank page syndrome)
- AI transformation handles variability (works with real-world PRDs)
- Maintains consistency with existing /plan:to-vtm implementation
- Preserves token efficiency (surgical section extraction)

**Alternatives Considered:**
- Template-only (mechanical extraction)
  - Rejected: Too rigid, no intelligence
- AI-only (full PRD context)
  - Rejected: Violates VTM token efficiency philosophy
- Manual only
  - Rejected: Status quo, doesn't solve the problem

**Trade-offs:**
- Complexity: hybrid is more complex than pure templates
- Token cost: AI transformations use tokens (mitigated by extraction)

### Token Efficiency Strategy
**Decision:** Extract only decision-relevant sections before passing to AI

**Rationale:**
- Full PRDs often 5000+ tokens
- Extraction reduces to 800-900 tokens (80%+ reduction)
- Maintains VTM core philosophy: surgical access, not bloat
- Fast and deterministic extraction

**Implementation:**
- Parse markdown sections
- Filter by keywords: "Decision", "Technical", "Architecture", "Technology"
- Hard limit: 1500 tokens per extraction
- Pass extracted sections to AI agent

**Trade-offs:**
- Risk: Might miss context if PRD is poorly structured
- Mitigation: Validation command checks section completeness

### Traceability & Linking
**Decision:** Generated ADRs and Specs link back to source PRD with line numbers

**Rationale:**
- Enable verification (did we capture all requirements?)
- Support updates (PRD changes → know which docs to review)
- Audit trail (why was this decision made? → trace to PRD)
- Consistent with TaskRichContext pattern in VTM

**Implementation:**
- Frontmatter includes source_prd path
- Track line number ranges for extracted sections
- Generate relevant_sections metadata

**Trade-offs:**
- Adds small overhead to generation
- Enables powerful traceability benefits

### Workflow Flexibility
**Decision:** Support three independent workflows (PRD-first, ADR-first, hybrid)

**Rationale:**
- Different teams have different preferences
- Backward compatible (doesn't replace existing ADR-first)
- Composable commands (not monolithic workflow)
- Aligns with VTM philosophy of surgical access

**Implementation:**
- Commands are independent and composable
- No workflow state machine
- Each command works standalone
- Users choose their path

**Trade-offs:**
- More command combinations to support
- Clearer mental model for users
- Better flexibility

## Requirements

### Functional Requirements

1. **PRD Template Generation**
   - Generate structured PRD markdown from template
   - Include guidance comments for each section
   - Create prd/ directory if needed
   - Handle naming conflicts gracefully
   - Support custom template paths (future)

2. **PRD → ADR Transformation**
   - Extract decision-relevant sections from PRD
   - Generate ADR using AI agent
   - Maintain traceability (source PRD + line numbers)
   - Follow ADR template structure
   - Validate generated ADR quality
   - Support preview mode before saving

3. **PRD → Spec Transformation**
   - Extract requirement-relevant sections from PRD
   - Generate Spec using AI agent
   - Expand acceptance criteria
   - Map test strategies
   - Maintain traceability links
   - Support preview mode before saving

4. **Pair Generation**
   - Generate ADR and Spec from single PRD
   - Incremental generation (ADR first, then Spec)
   - Show preview for user approval
   - Validate both before saving

5. **PRD Validation**
   - Check required sections present
   - Verify sufficient detail for transformation
   - Detect ambiguous language
   - Warn on missing components
   - Suggest improvements

6. **Naming Convention Enforcement**
   - PRD: prd/{feature-slug}.md
   - ADR: adr/ADR-XXX-{feature-slug}.md
   - Spec: specs/spec-{feature-slug}.md
   - Auto-numbered ADR IDs
   - Consistent naming across documents

### Non-Functional Requirements

1. **Token Efficiency**
   - 80%+ reduction: Full PRD vs extracted sections
   - Hard limit: 1500 tokens per section extraction
   - Monitor and log token usage per transformation

2. **Performance**
   - /plan:create-prd: <1 second (instant)
   - /plan:to-adr: 10-15 seconds (AI latency)
   - /plan:to-spec: 12-18 seconds (AI latency)
   - /plan:to-pair: 25-35 seconds (both transformations)
   - Optional caching to reduce repeated transformations

3. **Backward Compatibility**
   - Zero breaking changes to existing /plan:to-vtm
   - All new commands additive
   - Support three independent workflows
   - Existing ADR-first workflow unchanged

4. **User Experience**
   - Clear documentation and examples
   - Workflow hints and suggestions via skills
   - Preview mode for AI-generated content
   - Error messages guide users to resolution

5. **Code Quality**
   - Unit tests for extraction logic
   - Integration tests for full pipeline
   - Snapshot tests for AI transformations
   - 80%+ test coverage
   - TypeScript strict mode

### Edge Cases

1. **Incomplete PRD**
   - Missing decision section → validation warning
   - Missing requirements → suggest manual Spec writing
   - Both missing → cannot generate, clear error

2. **Ambiguous PRD Content**
   - Multiple conflicting decisions → ask user which to prioritize
   - Vague requirements → AI generates with confidence score
   - Unclear trade-offs → generate alternatives

3. **Multiple Decisions in One PRD**
   - One PRD → multiple distinct ADRs
   - Ask user: merge into single ADR or separate ADRs?
   - Link all ADRs back to source PRD

4. **PRD Updates After Generation**
   - User edits PRD, wants to regenerate ADR
   - Content hash-based caching detects change
   - Offer: regenerate, show diff, or discard cache

5. **Large PRDs**
   - Extraction limits tokens at 1500
   - Warn if content truncated
   - Suggest splitting into multiple PRDs

### Dependencies

- **VTM CLI Core**: Requires VTMReader, VTMWriter, ContextBuilder
- **Claude Code**: Uses Task tool to launch AI agents
- **Markdown Parser**: Parse PRD structure (existing CommonMark support)
- **File System**: Read/write to prd/, adr/, specs/ directories

## Implementation Guidance

### Recommended Approach

**Phase 1 (MVP): Templates Only**
- Create PRD template with guidance
- Implement /plan:create-prd command
- Users create structured PRDs
- Manual ADR/Spec writing (existing workflow)
- Time: 8 hours

**Phase 2 (Core): AI Transformations**
- Implement section extraction logic
- Implement /plan:to-adr with AI agent
- Implement /plan:to-spec with AI agent
- Implement /plan:to-pair orchestration
- Preview mode for all transformations
- Time: 12 hours

**Phase 3 (Polish): Quality & Performance**
- Intelligent content-hash caching
- /plan:validate-prd command
- Skills integration with workflow hints
- Testing and prompt refinement
- Time: 6 hours

**Total: 26 hours across 3 phases**

### Testing Strategy

**Unit Tests:**
- Section extraction logic (keywords, tokenization)
- Naming convention enforcement
- Frontmatter generation
- Error handling

**Integration Tests:**
- Full PRD → ADR pipeline
- Full PRD → Spec pipeline
- Full PRD → ADR+Spec → VTM pipeline
- Error scenarios (incomplete PRD, missing sections)

**Snapshot Tests:**
- AI transformation outputs
- Approval-based testing (manual review on first run)
- Regression detection on subsequent runs

**Manual Testing:**
- Generate sample PRD
- Transform to ADR and Spec
- Review generated quality
- Iterate on AI prompts

### Rollout Plan

1. **Internal alpha** (Phase 1-2 complete)
   - VTM CLI maintainers test workflows
   - Collect feedback on template and quality
   - Refine AI prompts based on results

2. **Beta release** (Phase 3 complete)
   - Release with --preview flag required
   - Users must explicitly approve before saving
   - Collect real-world usage feedback

3. **General availability**
   - Remove --preview requirement (auto-save default)
   - Git safety net (changes trackable in git)
   - Full documentation and examples

### Risk Mitigation

1. **Poor generation quality**
   - Start with --preview mode (don't auto-save)
   - Iterate on AI prompts based on feedback
   - Fallback: users always can edit or write manually

2. **Token cost bloat**
   - Section extraction keeps costs low
   - Monitor token usage per transformation
   - Set budget alerts

3. **User confusion (too many commands)**
   - Strong skill integration (plan-expert guides users)
   - Clear documentation with workflow diagrams
   - Progressive disclosure (show advanced features later)

4. **Breaking existing workflows**
   - All changes additive (no deletions)
   - /plan:to-vtm unchanged
   - Zero impact on ADR-first workflow

## Acceptance Criteria

- [x] ADR created documenting architectural decisions
- [x] Spec created documenting requirements and implementation
- [x] Both documents maintain traceability to this PRD
- [x] Token efficiency targets documented (80%+ reduction)
- [x] Three supported workflows clearly defined
- [x] Backward compatibility verified (existing /plan:to-vtm unchanged)
- [ ] Phase 1 (templates) implemented and tested
- [ ] Phase 2 (AI transformations) implemented and tested
- [ ] Phase 3 (polish) completed with caching and validation
- [ ] 80%+ test coverage achieved
- [ ] User documentation updated in CLAUDE.md
- [ ] Skill hints integrated for workflow guidance
