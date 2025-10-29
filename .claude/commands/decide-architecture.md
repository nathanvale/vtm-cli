# Decide: Architecture - AI-Powered Structure Recommendations

**Command:** `/decide:architecture {description} [options]`
**Version:** 1.0.0 (Lightweight)
**Purpose:** Analyze requirements and recommend optimal component architecture using pattern matching and best practices.

---

## What This Command Does

Acts as an architecture thinking partner that:

- Analyzes your description and recommends component structure
- Identifies architectural patterns that match your needs
- Suggests command names, integrations, and hooks
- Analyzes existing domains for improvement opportunities
- Provides refactoring recommendations based on best practices

**Note:** This is a lightweight version using rules and patterns, not ML/AI.

---

## Usage

### Recommend Architecture from Description

```bash
# Basic recommendation
/decide:architecture "task tracking for remote teams"

# With specific requirements
/decide:architecture "task tracking with Slack integration and daily standups"

# Request specific pattern
/decide:architecture "analytics dashboard" --pattern data-visualization
```

### Analyze Existing Domain

```bash
# Analyze domain structure
/decide:architecture --analyze vtm

# Get refactoring suggestions
/decide:architecture --analyze vtm --suggest-refactoring

# Compare to best practices
/decide:architecture --analyze vtm --compare-patterns
```

### Refactor Specific Component

```bash
# Get refactoring ideas for a command
/decide:architecture --refactor vtm:context

# Suggest merging opportunities
/decide:architecture --refactor vtm --suggest-merge

# Check for splitting opportunities
/decide:architecture --refactor vtm --suggest-split
```

---

## Arguments

```javascript
// Parse arguments
const description = ARGUMENTS[0] || ""
const isAnalyze = ARGUMENTS.includes("--analyze")
const isRefactor = ARGUMENTS.includes("--refactor")
const suggestMerge = ARGUMENTS.includes("--suggest-merge")
const suggestSplit = ARGUMENTS.includes("--suggest-split")
const suggestRefactoring = ARGUMENTS.includes("--suggest-refactoring")
const comparePatterns = ARGUMENTS.includes("--compare-patterns")
const pattern = ARGUMENTS.includes("--pattern")
  ? ARGUMENTS[ARGUMENTS.indexOf("--pattern") + 1]
  : null
```

---

## Example Output 1: New Domain Recommendation

```bash
/decide:architecture "task tracking for remote teams with Slack"
```

Output:

```
🤖 Architecture Decision: "task tracking for remote teams with Slack"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keywords detected:
  • task tracking → Core: CRUD operations
  • remote teams → Integration: async communication
  • Slack → MCP: external system integration

Matched patterns:
  ✅ Task Management (confidence: 95%)
  ✅ Team Collaboration (confidence: 85%)
  ✅ Notification System (confidence: 80%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏗️  RECOMMENDED STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Domain: remote-tasks

Commands (5):
  /remote-tasks:next        Get next task to work on
  /remote-tasks:assign      Assign task to team member
  /remote-tasks:update      Update task status
  /remote-tasks:blockers    Report blockers to team
  /remote-tasks:standup     Generate standup summary

Skills (1):
  remote-tasks-expert       Auto-suggest based on time/activity
    Triggers:
    • "what should I work on"
    • "any blockers"
    • "standup time"
    • "team status"

MCP Integration (1):
  slack-connector
    • Send task updates to channels
    • Notify on blocker reports
    • Daily standup summaries

Hooks (2):
  morning-standup (9am)     Prepare standup data
  blocker-alert             Alert team lead on blockers

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 DESIGN RATIONALE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Why this structure?
  ✅ 5 commands cover core remote workflow
  ✅ Slack integration essential for async teams
  ✅ Time-based hooks match remote schedules
  ✅ Skills reduce friction (auto-suggest)
  ✅ Focused on team coordination (vs individual)

Alternatives considered:
  ❌ Merge with existing pm domain
     → Different concerns (team vs personal)
  ❌ Single "remote" command
     → Too monolithic, hard to test
  ✅ Separate domain with clear boundaries

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 IMPLEMENTATION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1: Core (2 hours)
  1. /design:domain remote-tasks
  2. Add these operations: next, assign, update
  3. Configure Slack MCP
  4. /scaffold:domain remote-tasks

Phase 2: Team Features (1 hour)
  5. Add blockers, standup commands
  6. Configure morning-standup hook
  7. Test with team member

Phase 3: Polish (30 min)
  8. Add auto-discovery skill
  9. /test:command each command
  10. /evolve:to-plugin remote-tasks

Total effort: ~3.5 hours
Complexity: Medium

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Ready to build?
  /design:domain remote-tasks

Want to customize first?
  Review this recommendation, then design manually

Need more detail?
  /decide:architecture "..." --pattern task-management
```

---

## Example Output 2: Analyze Existing Domain

```bash
/decide:architecture --analyze vtm --suggest-refactoring
```

Output:

```
🔍 Architecture Analysis: vtm domain

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 CURRENT STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Commands (7):
  ✅ vtm:next        [87 lines] Get next task
  ✅ vtm:context     [124 lines] Get task context
  ✅ vtm:task        [156 lines] View task details
  ✅ vtm:start       [98 lines] Start task
  ✅ vtm:complete    [112 lines] Complete task
  ✅ vtm:stats       [203 lines] View statistics
  ✅ vtm:list        [178 lines] List all tasks

Skills (1):
  ✅ vtm-expert (8 trigger phrases)

Hooks (4):
  ✅ pre-commit      Validate task linked
  ✅ post-checkout   Update local cache
  ✅ post-merge      Sync task status
  ✅ pre-push        Check incomplete tasks

Complexity: 6.2/10 (Medium)
Cohesion: 7.8/10 (Good)
Test Coverage: 45%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ STRENGTHS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Clear single responsibility (task management)
2. Good command naming (action verbs)
3. Comprehensive git workflow coverage
4. Well-integrated skill for auto-discovery

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  IMPROVEMENT OPPORTUNITIES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ISSUE 1: Redundant Commands
  Problem:
    • vtm:context and vtm:task overlap 70%
    • vtm:context always called after vtm:next
    • Users expect context automatically

  Recommendation:
    Option A: Merge context into task command
    Option B: Make vtm:next show brief context by default
    Option C: Add --with-context flag to vtm:next

  Preferred: Option B (smart defaults)
  Effort: 1 hour
  Impact: -1 command, better UX

ISSUE 2: Stats & List Separation
  Problem:
    • vtm:stats and vtm:list serve different audiences
    • Stats = overview (PM/lead)
    • List = details (developer)
    • Different concerns mixed in one domain

  Recommendation:
    Split into two domains:
    • vtm-core: next, start, complete, task
    • vtm-analytics: stats, list

  Effort: 2 hours
  Impact: Better modularity, optional analytics

ISSUE 3: Hook Duplication
  Problem:
    • pre-commit and pre-push both validate
    • Similar validation logic duplicated

  Recommendation:
    Create shared validation library
    Both hooks use same validation function

  Effort: 30 minutes
  Impact: DRY, easier to maintain

ISSUE 4: Missing Undo
  Problem:
    • vtm:complete is irreversible
    • No way to undo status changes
    • Risky for accidental completions

  Recommendation:
    Add vtm:undo command
    Keep history of last 5 state changes

  Effort: 1 hour
  Impact: Safety net, better UX

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 REFACTORING ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Quick Wins (2 hours total):
  □ Add vtm:undo command (1 hour)
  □ Merge context into vtm:next (1 hour)
  → Result: +1 safety, -1 command, better UX

Optional Improvements (2.5 hours):
  □ Refactor hook validation (30 min)
  □ Split analytics to separate domain (2 hours)
  → Result: Cleaner architecture, better separation

Total effort: 4.5 hours
Risk: Low (all changes reversible)
Test strategy: /test:command after each change

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 RECOMMENDED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Priority 1 (Do first):
  1. Add vtm:undo command
     Why: Safety is critical, low effort

  2. Merge context into vtm:next
     Why: Better UX, reduces cognitive load

Priority 2 (Consider):
  3. Refactor hook validation
     Why: Code quality, maintainability

  4. Split analytics domain
     Why: Better boundaries, optional feature

Start refactoring?
  Pick an issue and I'll guide you through it.

Want detailed analysis of specific command?
  /decide:architecture --refactor vtm:context
```

---

## Example Output 3: Refactor Specific Command

```bash
/decide:architecture --refactor vtm:context
```

Output:

```
🔧 Refactoring Analysis: vtm:context

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 CURRENT STATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Command: vtm:context TASK-ID
Purpose: Get full context for a specific task
Lines: 124
Complexity: 4.2/10 (Low-Medium)

Usage Pattern (last 30 days):
  • Called: 89 times
  • Always after: vtm:next (100%)
  • Average delay: 12 seconds
  • User says: "show context", "get context TASK-ID"

Dependencies:
  Depends on: vtm:task (reads same data)
  Used by: None (end command)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  ISSUES DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ISSUE 1: Redundancy with vtm:task
  vtm:context and vtm:task show 70% same data
  Difference: context includes dependencies

ISSUE 2: Always called after vtm:next
  Users expect context automatically
  Manual invocation adds friction

ISSUE 3: Duplicate parameter passing
  vtm:next knows task ID
  User must re-type task ID for context

ISSUE 4: Cognitive load
  Two commands to remember for one goal
  "Show me task info" requires two invocations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 REFACTORING OPTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPTION A: Merge into vtm:next
  vtm:next              Show brief + context
  vtm:next --brief      Show brief only

  ✅ Pro: Single command, natural flow
  ✅ Pro: No re-typing task ID
  ❌ Con: vtm:next does two things
  ❌ Con: Slower by default

  Effort: 1 hour
  Breaking: No (backward compatible)

OPTION B: Merge into vtm:task
  vtm:task TASK-ID      Show full details + context

  ✅ Pro: Logical home (task details)
  ✅ Pro: Removes redundancy
  ❌ Con: vtm:context users need to learn new command

  Effort: 1 hour
  Breaking: Yes (deprecate vtm:context)

OPTION C: Smart auto-context
  vtm:next              Brief + "Use /vtm:context for full"
  vtm:context           Auto-uses last task from vtm:next

  ✅ Pro: No re-typing task ID
  ✅ Pro: Keeps commands separate
  ❌ Con: Magic behavior (implicit state)

  Effort: 45 minutes
  Breaking: No

OPTION D: Flag-based
  vtm:next --full       Shows context inline
  vtm:context TASK-ID   (unchanged)

  ✅ Pro: Explicit control
  ✅ Pro: Backward compatible
  ❌ Con: Yet another flag to remember

  Effort: 30 minutes
  Breaking: No

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 RECOMMENDATION: Option A (Merge into vtm:next)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Why Option A?
  • Most natural user flow
  • Eliminates redundant invocation
  • Default shows what users need most
  • --brief flag for speed when needed

Migration Strategy:
  1. Update vtm:next to show context by default
  2. Add --brief flag for old behavior
  3. Keep vtm:context for 2 weeks (show deprecation)
  4. Remove vtm:context after 2 weeks

Code Changes:
  • src/lib/context-builder.ts - Extract reusable function
  • commands/vtm/next.md - Add context section
  • commands/vtm/context.md - Add deprecation notice

Testing:
  • /test:command vtm:next (verify context shows)
  • /test:command vtm:next --brief (verify brief works)
  • /test:integration vtm:next vtm:start (verify flow)

Rollback Plan:
  git revert [commit] to restore vtm:context

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 IMPLEMENTATION CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1: Prepare (15 min)
  □ Extract context building to shared function
  □ Write tests for new behavior

Phase 2: Update (30 min)
  □ Modify vtm:next to include context
  □ Add --brief flag
  □ Test thoroughly

Phase 3: Deprecate (10 min)
  □ Add deprecation notice to vtm:context
  □ Update documentation

Phase 4: Cleanup (5 min)
  □ Remove vtm:context after 2 weeks
  □ Update registry

Total: 1 hour
Risk: Low (reversible, backward compatible)

Ready to implement?
  Start with Phase 1 checklist above
```

---

## Pattern Library

The command uses these built-in patterns:

### Task Management Pattern

- Commands: create, list, view, update, delete
- Integration: Task database or file
- Hooks: Validation, auto-update

### Team Collaboration Pattern

- Commands: assign, share, notify
- Integration: Communication platform (Slack, Teams)
- Hooks: Notification triggers

### Analytics Pattern

- Commands: stats, report, dashboard
- Integration: Data store
- Hooks: Data collection

### CRUD Pattern

- Commands: create, read, update, delete
- Standard operations for entities

### Workflow Pattern

- Commands: start, pause, resume, complete
- State machine for processes

### Notification Pattern

- Integration: Communication channels
- Hooks: Event-based alerts

---

## Decision Framework

The command analyzes based on:

### Keywords Detection

- Actions: create, manage, track, analyze, monitor
- Domains: task, project, team, data, code
- Integration: slack, github, notion, database
- Timing: daily, scheduled, real-time, async

### Heuristics

- 3-5 commands: Simple domain
- 6-10 commands: Medium complexity
- 10+ commands: Consider splitting
- External integration → MCP needed
- Time-based → Hooks needed
- Team coordination → Collaboration features

### Best Practices

- Single responsibility per domain
- Clear command naming (verb-noun)
- Minimal dependencies
- Testable boundaries
- Reversible operations

---

## Implementation

Execute via the VTM CLI:

```bash
#!/bin/bash

# Parse arguments
DESCRIPTION="${ARGUMENTS[0]}"
IS_ANALYZE=false
DOMAIN_NAME=""
SUGGEST_REFACTORING=false

# Check for --analyze flag
if [[ " ${ARGUMENTS[@]} " =~ " --analyze " ]]; then
  IS_ANALYZE=true
  # Get domain name (argument after --analyze)
  for i in "${!ARGUMENTS[@]}"; do
    if [[ "${ARGUMENTS[$i]}" == "--analyze" ]]; then
      DOMAIN_NAME="${ARGUMENTS[$i+1]}"
      break
    fi
  done
fi

# Check for --suggest-refactoring flag
if [[ " ${ARGUMENTS[@]} " =~ " --suggest-refactoring " ]]; then
  SUGGEST_REFACTORING=true
fi

# Check if vtm CLI is available
if ! command -v vtm &> /dev/null; then
    echo "❌ Error: vtm CLI not found"
    echo ""
    echo "Please ensure vtm-cli is installed and built:"
    echo "  cd /path/to/vtm-cli"
    echo "  npm install"
    echo "  npm run build"
    echo "  npm link"
    exit 1
fi

# Execute the appropriate command
if [[ "$IS_ANALYZE" == true ]]; then
  if [[ -z "$DOMAIN_NAME" ]]; then
    echo "❌ Error: Domain name required for --analyze"
    echo ""
    echo "Usage: /decide:architecture --analyze {domain-name}"
    echo "Example: /decide:architecture --analyze vtm"
    exit 1
  fi

  # Analyze existing domain
  if [[ "$SUGGEST_REFACTORING" == true ]]; then
    vtm analyze "$DOMAIN_NAME" --suggest-refactoring
  else
    vtm analyze "$DOMAIN_NAME"
  fi
else
  # Recommendation from description
  if [[ -z "$DESCRIPTION" ]]; then
    echo "❌ Error: Description required"
    echo ""
    echo "Usage: /decide:architecture {description}"
    echo "Example: /decide:architecture \"task tracking for teams\""
    exit 1
  fi

  echo "🤖 Architecture Recommendation"
  echo ""
  echo "Note: Full recommendation from description is not yet implemented."
  echo "Currently supports domain analysis via: /decide:architecture --analyze {domain}"
  echo ""
  echo "To analyze an existing domain:"
  echo "  /decide:architecture --analyze vtm"
  echo "  /decide:architecture --analyze vtm --suggest-refactoring"
fi
```

---

## Related Commands

- **Design Domain:** `/design:domain {name}` - Use recommendations to design
- **Scaffold:** `/scaffold:domain {name}` - Generate from design
- **Test:** `/test:command {name}` - Validate recommendations
- **Evolve:** `/evolve:split {component}` - Apply split recommendations
- **Registry:** `/registry:scan` - See current architecture

---

## Limitations (Lightweight Version)

**What it does:**
✅ Pattern matching based on keywords
✅ Rule-based heuristics
✅ Best practice recommendations
✅ Structural analysis of existing code

**What it doesn't do:**
❌ Learn from usage patterns over time
❌ ML-powered predictions
❌ Complex trade-off analysis
❌ Performance modeling

**Future:** Full Layer 3 Intelligence will add learning and AI capabilities.

---

## Notes

- Lightweight: No ML, just patterns and rules
- Fast: Instant recommendations
- Deterministic: Same input → same output
- Extensible: Add patterns to architecture-patterns.json
- Safe: Only suggests, never auto-applies changes

---

**Status:** Lightweight Version (Pattern-Based)
**Library:** Backed by DecisionEngine in `.claude/lib/decision-engine.ts`
**Patterns:** Defined in `.claude/lib/architecture-patterns.json`
