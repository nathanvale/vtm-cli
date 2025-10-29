# Evolve: Split - Analyze Domain Splitting Opportunities

**Command:** `/evolve:split {component} [depth]`
**Version:** 1.0.0
**Purpose:** Analyze a domain or component and suggest how to split it into smaller, more focused pieces to reduce complexity and improve maintainability.

---

## What This Command Does

Scans a domain's components, calculates complexity metrics, and provides recommendations for splitting a monolithic domain into smaller, cohesive sub-domains with clear boundaries.

---

## Usage

```bash
# Basic analysis
/evolve:split pm

# Deep analysis (scan 3 levels)
/evolve:split pm 3

# Analysis only (no execution)
/evolve:split pm --analyze-only
```

---

## Arguments

```javascript
const component = ARGUMENTS[0] // Domain or component name
const depth = parseInt(ARGUMENTS[1]) || 2 // Analysis depth (1-5)
const analyzeOnly = ARGUMENTS.includes("--analyze-only")
```

---

## Implementation

Execute the split analysis using the EvolveManager:

```javascript
const { EvolveManager } = require("./.claude/lib/evolve")
const evolve = new EvolveManager()

try {
  evolve.analyzeSplit(component, depth, { dryRun: analyzeOnly })
} catch (error) {
  console.error("❌ Analysis failed:", error.message)
  process.exit(1)
}
```

---

## Example Output

```
🔍 Analyzing split opportunities for "pm" domain

📊 Current Metrics:
  Complexity: 6.5/10 (medium-high)
  Cohesion: 4.2/10 (low)
  Components: 12 total
    • 8 commands
    • 2 skills
    • 1 MCP
    • 1 hook

🎯 Split Recommendations:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Suggestion 1: Core + Extensions Pattern
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Split into 3 domains:

1. pm-core (Complexity: 2.1/10)
   • Commands: next, status, complete
   • Standalone: ✅ No dependencies
   • Purpose: Essential task operations

2. pm-tracking (Complexity: 3.8/10)
   • Commands: review, stats, history, metrics
   • Depends on: pm-core
   • Purpose: Analytics and reporting

3. pm-integrations (Complexity: 2.9/10)
   • Commands: sync
   • MCP: notion-connector
   • Depends on: pm-core
   • Purpose: External system connections

📈 Benefits:
  • 35% complexity reduction (6.5 → 2.9 avg)
  • 45% better reusability (core standalone)
  • 60% easier testing (smaller units)
  • Clear boundaries and responsibilities

⚠️ Risks:
  • Migration effort: ~3 hours
  • Need to update command references
  • Team coordination required

📋 Migration Plan:

Phase 1: Create pm-core (30 min)
  1. /design:domain pm-core
  2. Move next, status, complete commands
  3. Test in isolation

Phase 2: Create pm-tracking (45 min)
  4. /design:domain pm-tracking
  5. Move review, stats, history, metrics
  6. Update dependencies to pm-core
  7. Test integration

Phase 3: Create pm-integrations (30 min)
  8. /design:domain pm-integrations
  9. Move sync command and MCP
  10. Update dependencies
  11. Test end-to-end

Phase 4: Verify and cleanup (45 min)
  12. /registry:scan (verify all indexed)
  13. Test workflows across domains
  14. Archive old pm domain
  15. Update documentation

Total time: ~2.5 hours
Rollback time: <15 minutes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Would you like to proceed with this split? (yes/no)
```

---

## What Gets Analyzed

### Complexity Metrics

- Number of components
- Dependency depth
- Cross-references
- Configuration complexity
- External integrations

### Cohesion Metrics

- Command grouping
- Shared dependencies
- Common purposes
- Related operations
- Data flow patterns

### Split Opportunities

- Natural boundaries
- Standalone capabilities
- Dependency clusters
- Integration points
- Team ownership areas

---

## Split Patterns

### 1. Core + Extensions

```
monolith → core + tracking + integrations
```

### 2. Feature-Based

```
monolith → feature-a + feature-b + feature-c
```

### 3. Layer-Based

```
monolith → data + logic + presentation
```

### 4. Team-Based

```
monolith → team-a-domain + team-b-domain
```

---

## When to Split

**Good reasons:**

- ✅ Domain has 10+ commands
- ✅ Multiple concerns mixed (data + integrations + UI)
- ✅ High complexity score (>7/10)
- ✅ Multiple teams working in same domain
- ✅ Want to reuse parts independently

**Bad reasons:**

- ❌ "Just because"
- ❌ Premature optimization
- ❌ Domain has <5 commands
- ❌ Everything is tightly coupled
- ❌ No clear boundaries

---

## Validation

The command will validate:

- ✅ Component exists
- ✅ Has sufficient components to analyze
- ✅ Depth is reasonable (1-5)
- ✅ Can detect natural boundaries

---

## Error Handling

**Component not found:**

```
❌ Component not found: pm
Create components first: /scaffold:domain pm
```

**Too small to split:**

```
⚠️  Domain "pm" is too small to split
  • Only 3 commands
  • Complexity: 1.8/10
  • Recommendation: Keep as single domain

Consider splitting when:
  • 10+ commands
  • Complexity >5/10
  • Multiple concerns present
```

**No clear boundaries:**

```
⚠️  No clear split boundaries found
  • All commands tightly coupled
  • Shared state across all components
  • Recommendation: Refactor first, then split

Refactoring steps:
  1. Reduce cross-dependencies
  2. Extract shared utilities
  3. Define clear interfaces
  4. Re-run analysis
```

---

## Migration Safety

**Automated Backups:**

- Original domain archived
- Can rollback in <15 minutes
- History preserved

**Verification Steps:**

- Test each sub-domain independently
- Test integrations between sub-domains
- Verify registry updated correctly
- Confirm all features work

**Rollback Plan:**

```bash
# If split doesn't work out:
/evolve:rollback pm split

# Restores to pre-split state
```

---

## Related Commands

- **Test Quality:** `/test:command {command}` - Check before splitting
- **Package:** `/evolve:to-plugin {domain}` - Package after splitting
- **Scan:** `/registry:scan` - See all domains after split
- **Rollback:** `/evolve:rollback {component} split` - Undo split

---

## Real-World Example

### Before Split: pm (6.5/10 complexity)

```
pm/
├── next.md
├── review.md
├── status.md
├── complete.md
├── stats.md
├── history.md
├── metrics.md
├── sync.md
└── notion-mcp/
```

### After Split: 3 focused domains

**pm-core (2.1/10)**

```
pm-core/
├── next.md
├── status.md
└── complete.md
```

**pm-tracking (3.8/10)**

```
pm-tracking/
├── review.md
├── stats.md
├── history.md
└── metrics.md
```

**pm-integrations (2.9/10)**

```
pm-integrations/
├── sync.md
└── notion-mcp/
```

**Result:** Easier to maintain, test, and reuse.

---

## Notes

- Analysis only: No changes made without confirmation
- Reversible: Can undo split operations
- History tracked: Evolution recorded
- Quality focus: Aims to improve maintainability
- Team aware: Considers team ownership

---

**Status:** Ready for Use
**Library:** Backed by EvolveManager.analyzeSplit() in `.claude/lib/evolve.ts`
