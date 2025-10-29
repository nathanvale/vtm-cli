# Lifecycle Layer (Layer 2) - Quick Reference Card

## 7 Core Commands at a Glance

### Testing Commands (Validate)

#### `/test:command {name}`
```bash
/test:command pm:next                    # Test command works
/test:command pm:next --verbose          # With details
/test:command pm:next --coverage         # Code coverage
```
**Tests:** Syntax | Execution | Dependencies | Error Handling
**Output:** Test report + coverage metrics
**Pass Requirement:** 4/4 tests + 80% coverage

#### `/test:integration {a} {b}`
```bash
/test:integration pm:next pm-expert      # Test interaction
/test:integration testing:unit testing:integration --stress
/test:integration devops:deploy devops:notify --verbose
```
**Scenarios:** Basic | Data | Error | Performance | Concurrent
**Output:** Integration report + performance metrics
**Pass Requirement:** 5/5 scenarios pass

---

### Evolution Commands (Improve)

#### `/evolve:add-skill {command}`
```bash
/evolve:add-skill pm:next                # Generate skill
/evolve:add-skill testing:unit --triggers "run tests,test it"
/evolve:add-skill pm:next --description "PM expert"
```
**Before:** Manual `/pm:next` only
**After:** Claude suggests `/pm:next` when relevant
**Reversible:** Yes (`/evolve:remove-skill`)

#### `/evolve:split {component}`
```bash
/evolve:split pm:next                    # Suggest splits
/evolve:split pm:next --parts "fetch,filter,sort"
```
**Result:** Break monolithic → focused commands
**Pattern:** Command becomes orchestrator
**Reversible:** Yes

#### `/evolve:remove-skill {command}`
```bash
/evolve:remove-skill pm:next             # Remove auto-discovery
```
**Before:** Skilled command (auto-suggests)
**After:** Manual command (no auto-suggest)
**Reversible:** Yes (`/evolve:add-skill`)

#### `/evolve:to-plugin {domain}`
```bash
/evolve:to-plugin pm                     # Package domain
/evolve:to-plugin pm --version 2.0.0     # Set version
/evolve:to-plugin pm --publish           # Publish to registry
```
**Output:** pm-automation-X.Y.Z.zip
**Contents:** Commands, Skills, MCP, Hooks, Docs
**Quality Gates:** All tested, documented, dependencies met

#### `/evolve:rollback {component} {version}`
```bash
/evolve:rollback pm:next v1.0.0          # Revert to version
/evolve:rollback pm:next before-split    # Undo split
/evolve:rollback pm:next previous        # Last version
```
**Safety:** Impact analysis, backup creation
**Result:** Full undo of evolution operations
**Reversible:** Yes (redo operation)

---

## Evolution Path (Lifecycle)

```
1. DESIGN           (Layer 1)
   /design:domain testing

2. SCAFFOLD         (Layer 1)
   /scaffold:domain testing

3. TEST COMMAND     (Layer 2)
   /test:command testing:unit ✓

4. ADD SKILL        (Layer 2)
   /evolve:add-skill testing:unit

5. TEST INTEGRATION (Layer 2)
   /test:integration testing:unit testing-expert ✓

6. PACKAGE PLUGIN   (Layer 2)
   /evolve:to-plugin testing ✓

7. DISTRIBUTE       (Layer 2 + Layer 5)
   Share testing-automation-1.0.0.zip
```

Each step is:
- **Tested** before moving on
- **Reversible** (can undo)
- **Observable** (registry tracks)
- **Independent** (works alone)

---

## Quality Checkpoints

| Stage | Status | Check | Command |
|-------|--------|-------|---------|
| Command | Untested | 4 tests pass? | `/test:command` |
| Skilled | Untested | 5 scenarios pass? | `/test:integration` |
| Packaged | Untested | All components tested? | `/evolve:to-plugin` |
| Ready | ✅ | Can distribute? | Registry scan |

---

## Data Files Created

### Test Results
**Location:** `.claude/test-results/{command-id}.json`
```json
{
  "status": "passed",
  "tests": [ ... ],
  "coverage": { "percentage": 89 },
  "recommendations": [ ... ]
}
```

### Skill Files
**Location:** `.claude/skills/{domain}-{command}/SKILL.md`
```markdown
---
trigger_phrases:
  - "what should I work on"
  - "next task"
---
```

### Plugin Manifest
**Location:** `.claude/plugins/{domain}-automation/plugin.yaml`
```yaml
name: pm-automation
version: 1.0.0
components:
  commands: [...]
  skills: [...]
  mcp_servers: [...]
  hooks: [...]
```

### Evolution History
**In Registry:** `.claude/registry.json`
```json
{
  "id": "pm:next",
  "evolution_history": [
    { "version": "1.0.0", "type": "scaffold" },
    { "version": "1.1.0", "type": "evolve:add-skill" },
    { "version": "2.0.0", "type": "evolve:split" }
  ]
}
```

---

## Common Workflows

### Test a Command
```bash
/test:command pm:next              # Run tests
→ Pass? Continue
→ Fail? Fix command, run again
```

### Create Skilled Command
```bash
/test:command pm:next              # Verify works
/evolve:add-skill pm:next          # Add auto-discovery
/test:integration pm:next pm-expert # Verify works together
```

### Package for Team
```bash
/registry:scan pm                  # What exists?
/test:command pm:*                 # All tested?
/evolve:to-plugin pm               # Package
→ Send .zip file to team
```

### Fix and Revert
```bash
/evolve:split pm:next              # Made it complex
→ Doesn't work as expected
/evolve:rollback pm:next v1.0.0   # Go back to simple
```

### Undo Skill
```bash
/evolve:add-skill pm:next          # Added skill
→ Causing false triggers
/evolve:remove-skill pm:next       # Remove it
```

---

## Success Criteria

✅ **Test Passes When:**
- 4 test types succeed (syntax, execution, deps, errors)
- Coverage >= 80%
- Report generated

✅ **Integration Passes When:**
- 5 scenarios succeed (basic, data, error, perf, concurrent)
- Performance within limits
- Report generated

✅ **Command Ready When:**
- Tested AND dependencies satisfied
- Can be added skill: `/evolve:add-skill`
- Can be packaged: `/evolve:to-plugin`

✅ **Domain Ready When:**
- All commands tested
- All integrations verified
- Documentation complete
- Can be packaged: `/evolve:to-plugin`

---

## Error Quick Fixes

| Problem | Solution |
|---------|----------|
| "Command must be tested first" | Run `/test:command pm:next` |
| "Dependency not configured" | Set env vars, configure MCP |
| "Integration failed" | Run with `--verbose` to see why |
| "Skill already exists" | Use `/evolve:remove-skill` first |
| "Rollback has conflicts" | Delete dependents first |
| "Version not found" | Check `/registry:scan` for available versions |

---

## Integration with Layer 1

| Layer 1 | Layer 2 | Purpose |
|---------|---------|---------|
| `/design:domain` | Test results → quality gate | Design needs testability |
| `/scaffold:domain` | Test results stored → tracked | Scaffolded components need testing |
| `/registry:scan` | Updates with test status | Registry reflects quality |

---

## Quick Command Summary

| Command | What | Result |
|---------|------|--------|
| `/test:command` | Test 1 component | Pass/fail + coverage |
| `/test:integration` | Test 2+ components together | Pass/fail + scenarios |
| `/evolve:add-skill` | Enable auto-discovery | Triggers added |
| `/evolve:to-plugin` | Package domain | .zip created |
| `/evolve:split` | Break into parts | Smaller focused commands |
| `/evolve:remove-skill` | Disable auto-discovery | Back to manual |
| `/evolve:rollback` | Undo evolution | Previous state restored |

---

## Reading the Full Spec

For detailed information, see: `SPEC-lifecycle-layer.md`

- **Section 2-8:** Full command specifications
- **Section 9:** Integration patterns
- **Section 10:** Data formats
- **Section 11:** Quality criteria
- **Section 12:** Self-extension example
- **Section 13:** Implementation roadmap
- **Section 14:** Error handling
- **Section 15:** Glossary

---

## Implementation Status

**Ready for Phase 2:**
- All 7 commands fully specified
- Integration patterns defined
- Quality criteria clear
- Self-extension demonstrated
- Implementation roadmap provided

**Next:** Review spec → Implement Phase 2a (testing) → Test Layer 1 integration

---

**Quick Links:**
- Full Specification: `.claude/SPEC-lifecycle-layer.md`
- Layer 1 (MCC): `.claude/SPEC-minimum-composable-core.md`
- Full Architecture: `.claude/SPEC-composable-system.md`
- Developer Guide: `.claude/SPEC-developer-guide.md`
