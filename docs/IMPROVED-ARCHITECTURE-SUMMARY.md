# Improved Architecture: Composable Thinking Partners - Summary

**Status:** Architecture Design Complete ✅
**Date:** 2025-10-30

---

## What We Improved

The original PRD workflow had **three critical limitations**:

### Problem 1: Blank Page Syndrome
Users stared at empty PRD templates, leading to incomplete or rushed documentation.

**Solution:** PRD Ideation Thinking Partner researches the problem space and provides a structured scaffold before users write.

### Problem 2: Monolithic ADR Generation
One PRD → one large ADR, making decisions hard to reference, update, and maintain.

**Solution:** ADR Decomposition Thinking Partner breaks PRD into distinct decisions and plans granular ADRs (one per decision).

### Problem 3: No Composability
Commands were linear (forced order), outputs weren't reusable, thinking was hidden.

**Solution:** Thinking partners are first-class, output structured JSON, can be composed in different ways.

---

## New Architecture: Three Thinking Partners

### 1. PRD Ideation Thinking Partner
**Command:** `/helpers:thinking-partner:prd-ideation "your feature idea"`

**What it does:**
- Researches problem space (web + docs + code)
- Identifies 3-5 key architectural decisions
- Provides options for each decision
- Recommends best approach with rationale
- **Outputs:** Structured JSON scaffold

**Value:**
- ✅ Eliminates blank page syndrome
- ✅ Ensures comprehensive thinking
- ✅ Provides research context
- ✅ Guides PRD creation with pre-populated sections

**Integration:**
```bash
/helpers:thinking-partner:prd-ideation "multi-tenant auth"
  ↓ outputs: ideation-auth.json
  ↓
/plan:create-prd auth-system --from ideation-auth.json
  ↓ creates: prd/auth-system.md (pre-populated with research)
```

---

### 2. ADR Decomposition Thinking Partner
**Command:** `/helpers:thinking-partner:adr-decomposition prd/auth-system.md`

**What it does:**
- Parses completed PRD
- Identifies all distinct architectural decisions
- Analyzes decision dependencies
- Plans ADR structure (one decision per ADR)
- Suggests implementation order
- **Outputs:** Decomposition plan as JSON

**Value:**
- ✅ Identifies all decisions (90%+ coverage)
- ✅ Enables granular ADRs (not monolithic)
- ✅ Detects decision dependencies
- ✅ Plans optimal generation order
- ✅ Supports parallel ADR generation

**Integration:**
```bash
/helpers:thinking-partner:adr-decomposition prd/auth-system.md
  ↓ outputs: decomposition-auth.json
  ↓
/plan:generate-adrs prd/auth-system.md --from decomposition-auth.json
  ↓ creates: ADR-001, ADR-002, ADR-003 (focused, granular)
```

---

### 3. Tech Spec (Separate Path)
**Approach:** Independent workflow, not dependent on ADRs

**Why separate?**
- ADRs answer "what's the architecture?"
- Specs answer "how do we implement?"
- Different audiences (architects vs developers)
- Can create in parallel with ADRs

**Workflow:**
```
PRD completed
  ↓ (can fork here)
  ├→ ADR generation path
  └→ Spec creation path (independent)
```

---

## New Workflow

### Comparison: Before vs After

**BEFORE (Original):**
```
User idea
  ↓
/plan:create-prd (blank template, blank page syndrome)
  ↓
User fills manually
  ↓
/plan:to-adr (generates 1 monolithic ADR)
  ↓
Manual editing and decision breaking
  ↓
/plan:create-spec
  ↓
/plan:to-vtm
```

**AFTER (Improved):**
```
User idea
  ↓
/helpers:thinking-partner:prd-ideation "feature description"
  ↓ [research-backed scaffold]
  ↓
/plan:create-prd auth-system --from ideation.json
  ↓ [user reviews and refines]
  ↓
/helpers:thinking-partner:adr-decomposition prd/auth-system.md
  ↓ [decision breakdown plan]
  ↓
/plan:generate-adrs --from decomposition.json
  ↓ [multiple focused ADRs, auto-ordered]
  ↓
/plan:create-spec (separate path)
  ↓
/plan:to-vtm
```

---

## Key Design Principles

### 1. Explicit Thinking
**What:** Thinking results saved as JSON artifacts
- Not hidden in AI prompts
- Can be reviewed and discussed
- Version-controlled in git
- Reusable across projects

### 2. Composability
**What:** Each thinking partner works independently
- Can call separately: just ideation, or just decomposition
- Outputs feed into next stage but aren't required
- Can skip stages if needed
- Users have full control

### 3. Structured Data
**What:** JSON outputs, not prose
- Machine-readable
- Can be parsed and validated
- Enables automation
- Supports tooling

### 4. Separation of Concerns
**What:** Each thinking partner has one job
- PRD ideation ≠ ADR decomposition ≠ Spec creation
- Can improve independently
- Different audiences
- Clear boundaries

### 5. Human in the Loop
**What:** AI assists, humans decide
- Thinking partners suggest, don't dictate
- Users review all outputs
- Users can override or customize
- Optional automation (can ignore suggestions)

---

## Implementation Roadmap

### Phase 1: Infrastructure
- [ ] Thinking partner framework
- [ ] JSON schema validation
- [ ] Caching for expensive research

### Phase 2: PRD Ideation Partner
- [ ] Web/docs/code research integration
- [ ] Decision extraction logic
- [ ] Scaffold generation
- [ ] Integration with /plan:create-prd

### Phase 3: ADR Decomposition Partner
- [ ] PRD parsing and analysis
- [ ] Decision extraction from PRD
- [ ] Dependency detection
- [ ] Decomposition planning
- [ ] Integration with /plan:generate-adrs

### Phase 4: Full Integration
- [ ] End-to-end testing
- [ ] Performance optimization
- [ ] Error handling
- [ ] Documentation

### Phase 5: Polish
- [ ] Spec thinking partner (optional)
- [ ] Advanced features
- [ ] User feedback incorporation

---

## Documents Created

### Architecture
- **ARCHITECTURE-COMPOSABLE-THINKING-PARTNERS.md** (main design document)
  - Overview of new architecture
  - Comparison with original
  - Design principles
  - Implementation roadmap

### Specifications
- **spec-helpers-thinking-partner-prd-ideation.md**
  - PRD Ideation command spec
  - Research phase details
  - JSON output schema
  - Integration guide

- **spec-helpers-thinking-partner-adr-decomposition.md**
  - ADR Decomposition command spec
  - Analysis phase details
  - Decision grouping logic
  - Decomposition plan generation

### Original (Updated with Architecture Insights)
- **prd/prd-plan-workflow.md** (original PRD, still valid)
- **adr/ADR-001-plan-domain-prd-workflow.md** (original ADR, still valid)
- **specs/spec-plan-workflow.md** (original Spec, still valid)

---

## Next Steps

### Option A: Review & Refine
1. Read ARCHITECTURE-COMPOSABLE-THINKING-PARTNERS.md
2. Review thinking partner specs
3. Provide feedback on design
4. Iterate on architecture

### Option B: Create Implementation Plan
1. Create VTM tasks from specs
2. Estimate effort and timeline
3. Assign implementation phases
4. Start with Phase 1 (infrastructure)

### Option C: Prototype Thinking Partner
1. Build PRD Ideation as POC
2. Test with sample feature idea
3. Validate output quality
4. Iterate on prompts and schema

---

## Success Criteria

**For Architecture:**
- [x] Solves blank page problem
- [x] Enables granular ADRs
- [x] Composable and reusable
- [x] Human-controlled (not automated)
- [x] Backward compatible with original design

**For PRD Ideation Partner:**
- [ ] Identifies 90%+ of key decisions
- [ ] Provides 2+ options per decision
- [ ] Confidence scores 0.8+
- [ ] Completes in <7 minutes
- [ ] Output integrates with /plan:create-prd

**For ADR Decomposition Partner:**
- [ ] Identifies 90%+ of distinct decisions
- [ ] Detects dependencies correctly
- [ ] Plans optimal ADR structure
- [ ] Completes in <5 minutes
- [ ] Output enables /plan:generate-adrs

**For Overall System:**
- [ ] Zero breaking changes to original design
- [ ] Improved user experience (less blank page)
- [ ] More maintainable ADRs (granular vs monolithic)
- [ ] Reusable thinking artifacts
- [ ] Community adoption

---

## Questions for Review

**Architecture:**
1. Does this solve the identified problems?
2. Are the design principles sound?
3. Is the composability model right?
4. Any missing thinking partners?

**PRD Ideation:**
1. Should research use all three sources (web + docs + code) or optional?
2. Is confidence scoring approach realistic?
3. How to handle topics with no clear best practice?

**ADR Decomposition:**
1. Is "one decision per ADR" the right strategy?
2. How to handle decisions that are tightly coupled?
3. Should decomposition suggest ADR ordering or just identify?

**Implementation:**
1. Start with ideation or decomposition partner first?
2. Should thinking partners be separate domain or helpers?
3. How to handle user feedback on generated decisions?

---

## Related Documents

**To Read First:**
- ARCHITECTURE-COMPOSABLE-THINKING-PARTNERS.md

**Then Read Specs:**
- spec-helpers-thinking-partner-prd-ideation.md
- spec-helpers-thinking-partner-adr-decomposition.md

**Original Documents (Still Valid):**
- prd/prd-plan-workflow.md
- adr/ADR-001-plan-domain-prd-workflow.md
- specs/spec-plan-workflow.md

---

**Status:** Architecture design complete, ready for review and implementation planning

