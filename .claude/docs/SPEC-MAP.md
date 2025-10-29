# Specification Map - What Each Spec Does

**Created:** 2025-10-29
**Purpose:** Clear map of all specification documents

---

## Master System Specs (The Big Picture)

### 1. **SPEC-composable-system.md**

**Location:** `.claude/docs/SPEC-composable-system.md`
**Lines:** 512
**Purpose:** The master architecture for the entire 8-layer system
**What it defines:**

- All 8 layers (Foundation → Sustainability)
- The Minimum Composable Core (MCC) - 3 commands
- The full vision and roadmap
- Composability principles
- Standard interfaces

**When to use:** When you want to understand the entire system vision

**Status in implementation:** Phase 1 (MCC) being implemented, rest is future

---

### 2. **SPEC-minimum-composable-core.md**

**Location:** `.claude/docs/SPEC-minimum-composable-core.md`
**Lines:** ~1,100
**Purpose:** Complete specification for Phase 1 - the 3 core commands
**What it defines:**

- `/design:domain` - Interactive design wizard
- `/scaffold:domain` - Code generator
- `/registry:scan` - Component discovery
- Data formats, success criteria

**When to use:** When implementing or validating Phase 1 (MCC)

**Status in implementation:** Partial - `/scaffold:domain` and `/registry:scan` exist, `/design:domain` missing

---

### 3. **SPEC-lifecycle-layer.md**

**Location:** `.claude/docs/SPEC-lifecycle-layer.md`
**Lines:** 2,571
**Purpose:** Complete specification for Phase 2 - Layer 2 (Lifecycle)
**What it defines:**

- 7 commands for testing and evolution
- `/test:command`, `/test:integration`
- `/evolve:add-skill`, `/evolve:to-plugin`, `/evolve:split`, `/evolve:remove-skill`, `/evolve:rollback`
- Process flows and integration patterns

**When to use:** When implementing or validating Phase 2 (Lifecycle Layer)

**Status in implementation:** Partial - libraries exist, command files mostly missing

---

### 4. **SPEC-lifecycle-layer-quickref.md**

**Location:** `.claude/docs/SPEC-lifecycle-layer-quickref.md`
**Lines:** 308
**Purpose:** Quick reference for the lifecycle layer
**What it defines:** Summary tables, workflows, common patterns

**When to use:** Quick lookup while implementing Phase 2

---

### 5. **SPEC-lifecycle-layer-evolve.md**

**Location:** `.claude/docs/SPEC-lifecycle-layer-evolve.md`
**Lines:** 1,456
**Purpose:** Deep dive on just the `/evolve` command family
**What it defines:** Detailed specs for the 5 evolve commands

**When to use:** When implementing evolve commands specifically

---

## Interface & Developer Specs

### 6. **SPEC-interfaces.md**

**Location:** `.claude/docs/SPEC-interfaces.md`
**Purpose:** Standard interfaces all components must implement
**What it defines:**

- Component metadata interface
- Lifecycle operations interface
- Event interface
- Configuration interface

**When to use:** When building any new component to ensure it follows standards

---

### 7. **SPEC-developer-guide.md**

**Location:** `.claude/docs/SPEC-developer-guide.md`
**Purpose:** How developers should build on this system
**What it defines:** Best practices, patterns, how to extend

**When to use:** When teaching others or extending the system

---

## Implementation Guides (Not Specs, but Related)

### 8. **DESIGN-DOMAIN-\*.md files**

These are implementation guides for specific deliverables, not architectural specs.

### 9. **TEST-\*.md files**

These document the testing system, not the overall architecture.

### 10. **EVOLVE-\*.md files**

These are user guides for the evolve commands, not specs.

---

## The Design Spec (Different Category)

### **lifecycle-design-spec.json** (root level)

**Purpose:** Example design specification created by `/design:domain`
**Format:** JSON data file
**Not an architectural spec** - this is a data artifact

---

## How They Relate

```
SPEC-composable-system.md (Master Vision)
    ├─ Defines 8 layers
    ├─ Defines Phase 1-5 roadmap
    │
    ├─ PHASE 1 (MCC) detailed in:
    │   └─ SPEC-minimum-composable-core.md
    │       ├─ /design:domain
    │       ├─ /scaffold:domain
    │       └─ /registry:scan
    │
    ├─ PHASE 2 (Lifecycle) detailed in:
    │   ├─ SPEC-lifecycle-layer.md (full spec)
    │   ├─ SPEC-lifecycle-layer-quickref.md (summary)
    │   └─ SPEC-lifecycle-layer-evolve.md (evolve deep-dive)
    │
    └─ PHASE 3-5 (Future layers)
        └─ Not yet specified
```

---

## Quick Decision Tree

**"What spec do I need?"**

- Want to understand the overall system? → `SPEC-composable-system.md`
- Implementing Phase 1 (MCC)? → `SPEC-minimum-composable-core.md`
- Implementing Phase 2 (Lifecycle)? → `SPEC-lifecycle-layer.md`
- Implementing evolve commands specifically? → `SPEC-lifecycle-layer-evolve.md`
- Need a quick reference? → `SPEC-lifecycle-layer-quickref.md`
- Building a component? → `SPEC-interfaces.md`
- Teaching others? → `SPEC-developer-guide.md`

---

## What's NOT a Spec

These are implementation docs, not architectural specs:

- `PHASE-2-COMPLETION-REPORT.md` - Progress report
- `SELF-EXTENSION-*.md` - Test documentation
- `EVOLVE-GUIDE.md` - User guide
- `TEST-GUIDE.md` - Testing guide
- `MCC-*.md` - Implementation guides
- `*-DELIVERABLES.md` - Delivery tracking

---

## Summary

**3 Primary Architectural Specs:**

1. `SPEC-composable-system.md` - The full 8-layer vision
2. `SPEC-minimum-composable-core.md` - Phase 1 details
3. `SPEC-lifecycle-layer.md` - Phase 2 details

**Everything else is either:**

- Deep-dives on specific parts
- Quick references
- Implementation guides
- User documentation
- Progress tracking

**Focus on these 3 to understand the architecture.**
