# Lifecycle Layer (Layer 2) - Engineering Workflow Operations

**Version:** 1.0-draft
**Status:** Ready for Phase 2 Implementation
**Dependencies:** Minimum Composable Core (Layer 1)

---

## Executive Summary

The **Lifecycle Layer (Layer 2)** transforms the Composable Claude Code System from static components into a living, evolving engineering platform. It provides 7 core commands that enable:

- **Testing**: Validate components work correctly in isolation and interaction
- **Evolution**: Improve components safely with reversible operations
- **Quality**: Ensure components meet minimum standards
- **Gradual Composition**: Grow from simple commands to complex plugins

This layer uses the registry built by `/registry:scan` (Layer 1) to discover components and manage their lifecycle transitions.

**Key Philosophy:** _Components naturally evolve from simple command → skilled command → plugin → multi-domain system without breaking changes._

---

## Layer 2 Overview

### Purpose

Engineering workflow operations that:

1. Validate that individual components and their interactions work
2. Systematically improve components through safe, reversible evolution
3. Measure quality and track progress
4. Enable organic system growth from simple to complex

### Positioning

```
Layer 1 (Foundation)           Layer 2 (Lifecycle)      Layer 3+ (Advanced)
═════════════════════════════  ═════════════════════════  ═════════════════
/design:domain          ───→   /test:*                    /decide:architecture
/scaffold:domain        ───→   /evolve:*                  /learn:*
/registry:scan          ───→   (uses registry)            /quality:*
                                                          /monitor:*
```

### Architecture Pattern

**Lifecycle State Machine:**

```
Command (untested)
    ↓
/test:command PASS
    ↓
Command (tested, ready for skill)
    ↓
/evolve:add-skill {command}
    ↓
Skilled Command (auto-discovery enabled)
    ↓
/test:integration {skill} {other}
    ↓
Skilled Command (verified interactions)
    ↓
/evolve:to-plugin {domain}
    ↓
Plugin (packaged, shareable)
```

Each state transition is:

- **Validated**: Tests must pass before transition
- **Reversible**: Can undo with `/evolve:rollback`
- **Observable**: Registry updates reflect state
- **Non-Breaking**: Old state still works alongside new

---

## Core Command 1: `/test:command`

### Purpose

Validate that a single command component works correctly in isolation before using it as a foundation for other operations.

### Command Signature

```bash
/test:command {command-name} [--verbose] [--coverage] [--quick]
```

### Parameters

| Parameter      | Type   | Required | Description                                         |
| -------------- | ------ | -------- | --------------------------------------------------- |
| `command-name` | string | Yes      | Full command name (e.g., `pm:next`, `testing:unit`) |
| `--verbose`    | flag   | No       | Show detailed execution logs                        |
| `--coverage`   | flag   | No       | Measure code coverage of tests                      |
| `--quick`      | flag   | No       | Run fast validation only (skip deep tests)          |

### Input Examples

```bash
/test:command pm:next
/test:command pm:next --verbose
/test:command testing:unit --coverage
/test:command devops:deploy --quick
```

### Process Flow

**Step 1: Locate Command**

```
User: /test:command pm:next

System:
✅ Finding command: pm:next
🔍 Searching .claude/commands/pm/next.md

✅ Found at: .claude/commands/pm/next.md
```

**Step 2: Extract Metadata**

Parse the command file to identify:

- Command signature and parameters
- Expected inputs/outputs
- Example usage
- Dependencies (external systems, other commands)
- Known limitations

```json
{
  "dependencies": ["pm-notion (mcp)"],
  "examples": ["/pm:next", "/pm:next pending", "/pm:next in-progress 10"],
  "name": "pm:next",
  "parameters": {
    "filter": "optional: status filter (pending|in-progress|blocked)",
    "limit": "optional: max results (default: 5)"
  },
  "path": ".claude/commands/pm/next.md",
  "signature": "pm:next [filter] [limit]"
}
```

**Step 3: Execute Test Suite**

### Built-In Tests

Every command must pass 4 test categories:

#### **Test 1: Syntax Validation**

- Command signature matches parameter expectations
- Parameters are properly documented
- Examples are valid syntax
- No syntax errors in shell/implementation

```
Test: Syntax Validation (pm:next)
─────────────────────────────────
✓ Signature valid: pm:next [filter] [limit]
✓ Parameters documented: 2 required/optional
✓ Examples are valid bash
✓ No shell syntax errors
✓ PASS - All syntax checks passed
```

#### **Test 2: Execution Test**

Execute the command with example inputs and verify:

- Command executes without errors
- Output format matches documented spec
- Error handling works (invalid args produce error, not crash)
- Timeout handling works (command doesn't hang)

```
Test: Execution (pm:next)
──────────────────────────
Input:  /pm:next
Status: Running...
Output:
  TASK-001: Design PM domain
  TASK-002: Scaffold PM commands
  TASK-003: Test PM integration

✓ Execution succeeded
✓ Output matches spec (JSON/text)
✓ Exit code: 0 (success)
✓ Execution time: 245ms (within limits)
✓ PASS - Command executed successfully
```

#### **Test 3: Integration Dependencies**

Verify command can find and access its dependencies:

- External systems (MCP) are configured and accessible
- Required environment variables are set
- Dependent commands exist and are callable
- Network/API calls (if any) succeed

```
Test: Dependencies (pm:next)
────────────────────────────
✓ Checking dependency: pm-notion (mcp)
  ✓ MCP server configured
  ✓ NOTION_API_KEY is set
  ✓ NOTION_DATABASE_ID is set
  ✓ Connection test successful

✓ All dependencies satisfied
✓ PASS - Integration test passed
```

#### **Test 4: Error Handling**

Test error scenarios:

- Invalid parameters produce helpful errors
- Missing dependencies show useful error message
- Timeout behavior is graceful
- Network failures are handled

```
Test: Error Handling (pm:next)
──────────────────────────────
✓ Invalid filter "foo"
  ✓ Returns error: "Invalid filter. Must be pending|in-progress|blocked"
  ✓ Exit code: 1 (error)
  ✓ Helpful message provided

✓ Missing NOTION_API_KEY
  ✓ Error message: "NOTION_API_KEY not set. Configure at ..."
  ✓ Suggests fix

✓ Command timeout (>30s)
  ✓ Gracefully terminates
  ✓ Returns timeout error

✓ PASS - Error handling validated
```

**Step 4: Generate Test Report**

### Test Report Output

**Console Output:**

```
────────────────────────────────────────────────────
Test Report: pm:next
────────────────────────────────────────────────────

Status: ✅ PASSED (4/4 tests)

Details:
  ✓ Syntax Validation (250ms)
    - Signature valid
    - Parameters documented
    - Examples valid
    - No syntax errors

  ✓ Execution Test (245ms)
    - Executed successfully
    - Output matches spec
    - Exit code: 0
    - Time: 245ms (OK)

  ✓ Integration Dependencies (1200ms)
    - pm-notion MCP: Connected
    - NOTION_API_KEY: Set
    - NOTION_DATABASE_ID: Set
    - DB connection: OK

  ✓ Error Handling (180ms)
    - Invalid params handled
    - Missing deps show help
    - Timeout works
    - Network errors caught

Coverage: 89% (15/17 code paths tested)

Recommendations:
  • Consider adding retry logic for flaky API calls
  • Document the 5-second timeout for users
  • Add example for "blocked" filter

Next Steps:
  Ready to share: /evolve:add-skill pm:next
  Ready to publish: /evolve:to-plugin pm
```

**Saved Test Result:**

Save to: `.claude/test-results/{command-id}.json`

```json
{
  "command_id": "pm:next",
  "test_date": "2025-10-29T14:50:00Z",
  "status": "passed",
  "total_tests": 4,
  "passed": 4,
  "failed": 0,
  "skipped": 0,

  "tests": [
    {
      "name": "Syntax Validation",
      "status": "passed",
      "duration_ms": 250,
      "details": {...}
    },
    {
      "name": "Execution Test",
      "status": "passed",
      "duration_ms": 245,
      "output": "TASK-001: ...",
      "details": {...}
    },
    {
      "name": "Integration Dependencies",
      "status": "passed",
      "duration_ms": 1200,
      "dependencies_satisfied": ["pm-notion"],
      "details": {...}
    },
    {
      "name": "Error Handling",
      "status": "passed",
      "duration_ms": 180,
      "errors_tested": 4,
      "details": {...}
    }
  ],

  "coverage": {
    "total_paths": 17,
    "tested_paths": 15,
    "percentage": 89
  },

  "recommendations": [
    "Consider adding retry logic for flaky API calls",
    "Document the 5-second timeout",
    "Add example for blocked filter"
  ]
}
```

### Integration with MCC

This command uses:

- **Registry**: Finds command in component registry
- **Metadata**: Reads command's documented interface
- **Structure**: Expects `.claude/commands/{namespace}/{command}.md`

### User Interaction Example

```
You: /test:command pm:next --verbose

Claude Test Runner:
  🧪 Testing command: pm:next

  📍 Step 1: Locate Command
  ─────────────────────────
  ✓ Found: .claude/commands/pm/next.md

  📍 Step 2: Extract Metadata
  ────────────────────────────
  ✓ Signature: pm:next [filter] [limit]
  ✓ Parameters: 2
  ✓ Examples: 3
  ✓ Dependencies: 1 (pm-notion)

  📍 Step 3: Run Tests
  ────────────────────
  🧪 Test 1: Syntax Validation
     ✓ Signature valid
     ✓ Parameters documented
     ✓ Examples valid
     ✓ No syntax errors
     ✓ PASS (250ms)

  🧪 Test 2: Execution
     Running: /pm:next
     Output: (4 tasks returned)
     ✓ Executed without error
     ✓ Output format correct
     ✓ Exit code: 0
     ✓ Time: 245ms
     ✓ PASS (245ms)

  🧪 Test 3: Integration Dependencies
     ✓ pm-notion configured
     ✓ NOTION_API_KEY set
     ✓ NOTION_DATABASE_ID set
     ✓ Database connection successful
     ✓ PASS (1200ms)

  🧪 Test 4: Error Handling
     Testing: Invalid filter "invalid"
     ✓ Returns error
     ✓ Error message helpful
     Testing: Missing NOTION_API_KEY
     ✓ Graceful error
     ✓ Suggests fix
     ✓ PASS (180ms)

  📊 Test Summary
  ────────────────
  Status: ✅ PASSED
  Tests:  4/4 passed
  Time:   1,875ms
  Coverage: 89%

  ✅ Command is ready for:
    • Skill addition: /evolve:add-skill pm:next
    • Team sharing: /evolve:to-plugin pm
    • Stress testing: Add to /test:integration

  💡 Recommendations:
    • Add retry logic for API calls
    • Document 5-second timeout
    • Add "blocked" filter example
```

---

## Core Command 2: `/test:integration`

### Purpose

Test that two or more components interact correctly. Ensures skills, commands, and MCP servers work together without conflicts or race conditions.

### Command Signature

```bash
/test:integration {component-a} {component-b} [--scenario {name}] [--stress] [--verbose]
```

### Parameters

| Parameter     | Type   | Required | Description                                 |
| ------------- | ------ | -------- | ------------------------------------------- |
| `component-a` | string | Yes      | First component (command, skill, MCP)       |
| `component-b` | string | Yes      | Second component to test interaction        |
| `--scenario`  | string | No       | Named interaction scenario (default: basic) |
| `--stress`    | flag   | No       | Run stress test (high volume interaction)   |
| `--verbose`   | flag   | No       | Show detailed interaction logs              |

### Input Examples

```bash
/test:integration pm:next pm-expert
/test:integration pm:next pm-notion --scenario basic
/test:integration testing:unit testing:integration --stress
/test:integration devops:deploy devops:notify --verbose
```

### Process Flow

**Step 1: Locate Components**

```
User: /test:integration pm:next pm-expert

System:
✅ Locating pm:next
  Found: .claude/commands/pm/next.md

✅ Locating pm-expert
  Found: .claude/skills/pm-expert/SKILL.md
```

**Step 2: Extract Component Definitions**

Identify:

- Component types (command, skill, MCP)
- How they interact (skill triggers command)
- Data flow (outputs of A → inputs of B)
- Dependencies and constraints

```json
{
  "component_a": {
    "id": "pm:next",
    "outputs": ["tasks array"],
    "performance": { "avg_time_ms": 245 },
    "type": "command"
  },
  "component_b": {
    "id": "pm-expert",
    "invokes": ["pm:next", "pm:review"],
    "trigger_phrases": ["what should I work on"],
    "type": "skill",
    "type": "skill"
  },
  "interaction": {
    "data_flow": "skill invokes command, passes output to user",
    "direction": "skill → command",
    "type": "trigger"
  }
}
```

**Step 3: Define Test Scenarios**

### Built-In Integration Scenarios

#### **Scenario 1: Basic Interaction**

Does B successfully use A?

- B can discover/invoke A
- Data flows correctly
- Outputs compatible

```
Scenario: Basic Interaction (pm-expert triggers pm:next)
─────────────────────────────────────────────────────────
Step 1: User says "what should I work on?"
Step 2: Claude detects trigger phrase
Step 3: Skill pm-expert activates
Step 4: Skill invokes command pm:next
Step 5: Command returns tasks
Step 6: Skill formats and presents to user

✓ Skill discovered trigger
✓ Command invoked successfully
✓ Data flowed correctly
✓ Output formatted properly
✓ PASS - Basic interaction works
```

#### **Scenario 2: Data Compatibility**

Do outputs of A match inputs of B?

- Type checking (both expect JSON, strings, etc.)
- Required fields present
- Format validation
- Error scenarios handled

```
Scenario: Data Compatibility (output format)
──────────────────────────────────────────────
pm:next output format:
  [
    {
      "id": "TASK-001",
      "title": "Design",
      "status": "pending",
      "estimate": "4h"
    }
  ]

pm-expert expects:
  - Array of task objects
  - Required fields: id, title, status
  - Optional: estimate, assignee

✓ Output has required fields
✓ Types match
✓ Format compatible
✓ PASS - Data compatibility verified
```

#### **Scenario 3: Error Propagation**

If A fails, does B handle it gracefully?

- Error caught, not silent failure
- User sees helpful error message
- No cascading failures
- Recovery is possible

```
Scenario: Error Propagation
────────────────────────────
Step 1: pm:next fails (DB unreachable)
  Exit code: 1
  Message: "Cannot connect to database"

Step 2: pm-expert receives error
  ✓ Detects non-zero exit code
  ✓ Reads error message
  ✓ Transforms to user message:
    "I couldn't get your tasks.
     Error: Cannot connect to database.
     Try: Check your database connection."

✓ Error propagated with context
✓ User gets helpful message
✓ PASS - Error handling works
```

#### **Scenario 4: Performance Under Load**

Do A and B maintain acceptable performance when heavily used?

- Response time stays within limits
- No memory leaks
- No resource exhaustion
- Graceful degradation if overloaded

```
Scenario: Performance Under Load
─────────────────────────────────
Running 1,000 invocations of pm:next over pm-expert

✓ Iteration 1: 245ms (normal)
✓ Iteration 500: 251ms (stable)
✓ Iteration 1,000: 248ms (stable)

Average: 248ms
Max: 312ms
Min: 203ms
Variance: 14ms (acceptable, <20% variance)

✓ Memory stable (no growth trend)
✓ CPU usage normal
✓ PASS - Performance under load acceptable
```

#### **Scenario 5: Concurrent Usage**

Do A and B work correctly when invoked simultaneously?

- No race conditions
- No resource conflicts
- Order independence (doesn't matter which runs first)
- Proper locking if needed

```
Scenario: Concurrent Usage
──────────────────────────
Test: pm-expert invokes pm:next while another user also calls pm:next

Thread 1: User A says "what should I work on?"
         → pm-expert invokes pm:next

Thread 2: User B calls /pm:next directly
         → Both run simultaneously

✓ Both requests completed successfully
✓ Both got correct results
✓ No data corruption
✓ Response times within limits
✓ PASS - Concurrent usage works
```

**Step 4: Execute Integration Tests**

```
Executing Integration Tests: pm:next ↔ pm-expert
────────────────────────────────────────────────

🧪 Scenario 1: Basic Interaction
   Step 1: Trigger phrase detected
   Step 2: Skill activated
   Step 3: Command invoked
   Step 4: Output returned
   ✓ PASS (425ms)

🧪 Scenario 2: Data Compatibility
   ✓ pm:next output matches pm-expert input
   ✓ Required fields present
   ✓ Types compatible
   ✓ PASS (150ms)

🧪 Scenario 3: Error Propagation
   ✓ Errors caught and transformed
   ✓ User sees helpful message
   ✓ No silent failures
   ✓ PASS (200ms)

🧪 Scenario 4: Performance Under Load
   1,000 iterations
   ✓ Average: 248ms (target: <300ms)
   ✓ Max: 312ms (OK)
   ✓ Memory stable
   ✓ PASS (248,000ms)

🧪 Scenario 5: Concurrent Usage
   10 simultaneous requests
   ✓ All completed successfully
   ✓ No race conditions
   ✓ Response times acceptable
   ✓ PASS (450ms)
```

**Step 5: Generate Integration Report**

### Integration Test Report

Save to: `.claude/test-results/integration-{a}-{b}.json`

```json
{
  "components": {
    "a": {
      "id": "pm:next",
      "type": "command",
      "version": "1.0.0"
    },
    "b": {
      "id": "pm-expert",
      "type": "skill",
      "version": "1.0.0"
    }
  },

  "overall": {
    "ready_for_production": true,
    "scenarios_passed": 5,
    "scenarios_total": 5,
    "total_duration_ms": 249225
  },

  "recommendations": [
    "Consider caching task results (would reduce avg from 248ms to ~100ms)",
    "Add request ID tracking for debugging concurrent calls"
  ],
  "scenarios": [
    {
      "details": "Skill successfully invokes command",
      "duration_ms": 425,
      "name": "Basic Interaction",
      "status": "passed"
    },
    {
      "details": "Output format matches expected input",
      "duration_ms": 150,
      "name": "Data Compatibility",
      "status": "passed"
    },
    {
      "details": "Errors handled gracefully",
      "duration_ms": 200,
      "name": "Error Propagation",
      "status": "passed"
    },
    {
      "duration_ms": 248000,
      "metrics": {
        "avg_ms": 248,
        "iterations": 1000,
        "max_ms": 312,
        "min_ms": 203
      },
      "name": "Performance Under Load",
      "status": "passed"
    },
    {
      "duration_ms": 450,
      "metrics": {
        "all_successful": true,
        "concurrent_requests": 10,
        "no_race_conditions": true
      },
      "name": "Concurrent Usage",
      "status": "passed"
    }
  ],

  "status": "passed",

  "test_date": "2025-10-29T15:00:00Z",
  "test_id": "integration-pm:next-pm-expert"
}
```

### User Interaction Example

```
You: /test:integration pm:next pm-expert --stress

Claude Integration Tester:
  🔗 Testing interaction: pm:next ↔ pm-expert

  📍 Step 1: Locate Components
  ──────────────────────────────
  ✓ Found command: pm:next
  ✓ Found skill: pm-expert

  📍 Step 2: Extract Definitions
  ───────────────────────────────
  Component A (pm:next):
    Type: Command
    Outputs: Array of tasks
    Performance: ~245ms

  Component B (pm-expert):
    Type: Skill
    Invokes: pm:next, pm:review
    Triggers: "what should I work on", "next task"

  Interaction: Skill triggers → Command executes → Result presented

  📍 Step 3: Run Integration Scenarios
  ────────────────────────────────────

  🔗 Scenario 1: Basic Interaction
     Can pm-expert successfully invoke pm:next?

     Step 1: User says "what should I work on?"
     Step 2: Trigger detected
     Step 3: Skill activates
     Step 4: Command invoked
     Output: (4 tasks)
     ✓ PASS (425ms)

  🔗 Scenario 2: Data Compatibility
     Does pm:next output match pm-expert input?

     pm:next outputs: [ { id, title, status, estimate } ]
     pm-expert expects: [ { id, title, status, ...? } ]
     ✓ Required fields match
     ✓ Types compatible
     ✓ PASS (150ms)

  🔗 Scenario 3: Error Propagation
     If pm:next fails, does pm-expert handle it?

     Simulating: DB connection error
     ✓ Error caught
     ✓ User message: "Cannot get tasks. Check DB connection."
     ✓ PASS (200ms)

  🔗 Scenario 4: Performance Under Load (Stress Test)
     1,000 iterations of pm:next → pm-expert

     Progress: [██████████████████░░] 50%
     Progress: [████████████████████] 100%

     Results:
       Average: 248ms
       Max: 312ms
       Min: 203ms
       Variance: 14ms (Excellent!)

     Memory: Stable (no leaks)
     CPU: Normal
     ✓ PASS (248,000ms)

  🔗 Scenario 5: Concurrent Usage
     10 simultaneous invocations

     Request 1: pm-expert → pm:next (248ms)
     Request 2: /pm:next direct (245ms)
     Request 3: pm-expert → pm:next (250ms)
     ... (7 more)

     ✓ All 10 completed successfully
     ✓ No race conditions detected
     ✓ Results consistent
     ✓ PASS (450ms)

  📊 Integration Test Summary
  ──────────────────────────────
  Status: ✅ PASSED (5/5 scenarios)
  Time: 248.2 seconds (stress test)

  ✅ Components work well together
  ✅ Ready for production use
  ✅ Ready to package as plugin

  Next Steps:
    • Publish as domain: /evolve:to-plugin pm
    • Add stress test to CI/CD
    • Consider performance optimization
```

---

## Core Command 3: `/evolve:add-skill`

### Purpose

Enhance a command with automatic discovery via trigger phrases. Transforms a manually-invoked command into a command that Claude suggests automatically based on context.

### Command Signature

```bash
/evolve:add-skill {command-id} [--triggers phrase1,phrase2] [--description text]
```

### Parameters

| Parameter       | Type   | Required | Description                          |
| --------------- | ------ | -------- | ------------------------------------ |
| `command-id`    | string | Yes      | Command to enhance (e.g., `pm:next`) |
| `--triggers`    | string | No       | Comma-separated trigger phrases      |
| `--description` | string | No       | Custom skill description             |

### Input Examples

```bash
/evolve:add-skill pm:next
/evolve:add-skill testing:unit --triggers "run tests,test this,unit test"
/evolve:add-skill devops:deploy --description "Deployment expert"
```

### Process Flow

**Step 1: Verify Command Is Tested**

```
User: /evolve:add-skill pm:next

System:
✅ Checking: Is pm:next tested?
🔍 Searching test results...

Found: .claude/test-results/pm:next.json
Status: PASSED (4/4 tests)
Date: 2025-10-29T14:50:00Z

✅ Command is tested and ready for skill
```

**Step 2: Extract Command Metadata**

From the command file, extract:

- Command name and description
- Parameters (what inputs it takes)
- Use cases (when it should be suggested)
- Example triggers

```json
{
  "command_id": "pm:next",
  "description": "Get the next PM task to work on",
  "documentation": "Get next PM task with optional filtering...",
  "parameters": {
    "filter": "optional: status filter",
    "limit": "optional: max results"
  },
  "use_cases": [
    "User asking what to work on",
    "Beginning a work session",
    "After completing a task"
  ]
}
```

**Step 3: Generate or Validate Trigger Phrases**

If user provides `--triggers`, validate them. Otherwise, suggest defaults.

### Trigger Phrase Generation

**AI-Suggested Triggers (if not provided):**

Based on the command purpose:

```
Command: pm:next
Description: "Get next PM task to work on"

Suggested triggers:
  • "what should I work on" ← User asking for direction
  • "next task" ← Direct request
  • "what's next" ← Casual variant
  • "show next pm task" ← Explicit command reference
  • "next pm" ← Namespace reference
  • "my next task" ← Personal reference
  • "get next task" ← Imperative form
```

**User-Provided Triggers:**

User can override with more specific triggers:

```bash
/evolve:add-skill testing:unit \
  --triggers "run tests,test this,unit test coverage,test suite"
```

**Step 4: Create Skill File**

Generate `.claude/skills/{namespace}-{command}/SKILL.md`

```markdown
---
name: pm-next-skill
description: |
  Intelligently suggest getting the next PM task.

  Knows when to suggest:
  - User asking "what should I work on"
  - Starting a work session
  - After completing a task
  - When reviewing PM status

trigger_phrases:
  - "what should I work on"
  - "next task"
  - "what's next"
  - "show next pm task"
  - "next pm"
  - "my next task"
  - "get next task"
---

# PM Next Task Skill

## What This Skill Does

Automatically suggests getting your next PM task when you need direction.

## When Claude Uses This

When you mention things like:

- "What should I work on?" → Suggests `/pm:next`
- "What's next?" → Suggests `/pm:next`
- "Next task" → Suggests `/pm:next`
- Finishing a task → Suggests `/pm:next`

## How It Works

1. You ask for direction or task guidance
2. Claude recognizes the trigger
3. Claude automatically runs `/pm:next`
4. You get your next task without asking for it explicitly

## Best Practices

- Let the skill suggest the command (easier workflow)
- But you can always run `/pm:next` manually if needed
- Customize trigger phrases in this file if needed
- Report issues: `/debug:logs pm-next-skill`

## Customization

Edit `trigger_phrases` above to match your vocabulary.

Example: If you prefer "show me my next task", add that phrase.
```

**Step 5: Update Registry**

The skill is now part of the system. Update the registry entry for the command:

```json
{
  "can_revert": true,
  "evolution_path": ["command (v1.0.0) → skilled (v1.1.0)"],
  "id": "pm:next",
  "skill_available": {
    "auto_discovery_enabled": true,
    "name": "pm-next-skill",
    "path": ".claude/skills/pm-next-skill/SKILL.md",
    "trigger_phrases": 7
  },
  "status": "skilled",
  "type": "command"
}
```

**Step 6: Verify Integration**

Run integration test between command and skill:

```
Verifying: pm:next ↔ pm-next-skill
──────────────────────────────────
✓ Skill file created
✓ Trigger phrases valid
✓ Command is discoverable
✓ Integration test: PASSED
✓ Command still callable directly
```

### Output Summary

```
────────────────────────────────────────────────────
Evolution Complete: pm:next → Skilled Command
────────────────────────────────────────────────────

✅ Successfully added skill to pm:next

Before:
  • Manual invocation only: /pm:next
  • User must remember to ask for it

After:
  • Auto-discovery enabled
  • Claude suggests when relevant
  • User can still invoke manually
  • 7 trigger phrases active

Skill Details:
  Name: pm-next-skill
  Path: .claude/skills/pm-next-skill/SKILL.md
  Triggers: 7 phrases
  Status: Active

New Behavior:
  User: "What should I work on?"
  Claude: "Let me get your next task..."
         → Automatically runs /pm:next
         → Shows you the result

Registry Updated:
  pm:next now has status: "skilled"
  Evolution path recorded
  Revert is possible: /evolve:rollback pm:next command

Next Steps:
  1. Test the skill works: /test:integration pm:next pm-next-skill
  2. Package for sharing: /evolve:to-plugin pm
  3. Or keep evolving: /evolve:add-skill testing:unit
```

### User Interaction Example

```
You: /evolve:add-skill pm:next --triggers "what's next,next task,show next"

Claude Evolution System:
  📈 Evolving command to skilled component

  ✓ Step 1: Verify tested
    Found: pm:next test results
    Status: PASSED (4/4 tests)
    Date: 2025-10-29
    ✅ Ready for skill

  ✓ Step 2: Extract metadata
    Command: pm:next
    Purpose: Get next PM task
    Parameters: filter (optional), limit (optional)
    Use cases: Direction, starting session, after task

  ✓ Step 3: Validate triggers
    You provided: ["what's next", "next task", "show next"]
    ✓ All valid English phrases
    ✓ No conflicts with other skills
    ✓ Good coverage of use cases

  ✓ Step 4: Create skill file
    Creating: .claude/skills/pm-next-skill/SKILL.md
    Triggers: 3 phrases (user-provided)
    Status: Ready

  ✓ Step 5: Update registry
    pm:next evolution: command → skilled
    Status: skilled
    Can revert: Yes

  ✓ Step 6: Verify integration
    Testing: pm:next ↔ pm-next-skill
    Scenarios:
      • Basic interaction: PASS
      • Error propagation: PASS
      • Concurrency: PASS
    ✅ All tests passed

  📊 Evolution Summary
  ───────────────────

  ✅ EVOLVED: pm:next → Skilled Command

  What changed:
    • Skill created with 3 trigger phrases
    • Auto-discovery enabled
    • Command still works manually
    • Registry updated with evolution

  How it works now:
    User: "What should I work on?"
    Claude: "I'll get your next task..."
            /pm:next
    (automatic suggestion!)

  Can revert:
    /evolve:rollback pm:next command

  Next:
    • Test skill: /test:integration pm:next pm-next-skill
    • Package: /evolve:to-plugin pm
    • Evolve others: /evolve:add-skill testing:unit
```

---

## Core Command 4: `/evolve:to-plugin`

### Purpose

Package a domain's components (commands, skills, MCP, hooks) into a distributable, versioned plugin suitable for sharing with teams or publishing.

### Command Signature

```bash
/evolve:to-plugin {domain} [--version semver] [--publish]
```

### Parameters

| Parameter   | Type   | Required | Description                               |
| ----------- | ------ | -------- | ----------------------------------------- |
| `domain`    | string | Yes      | Domain to package (e.g., `pm`, `testing`) |
| `--version` | string | No       | Set version (default: auto-increment)     |
| `--publish` | flag   | No       | Publish to registry (requires auth)       |

### Input Examples

```bash
/evolve:to-plugin pm
/evolve:to-plugin pm --version 2.0.0
/evolve:to-plugin testing --publish
```

### Process Flow

**Step 1: Verify Domain Is Ready**

```
User: /evolve:to-plugin pm

System:
✅ Checking: Is pm domain ready for packaging?

Verifying components in pm domain:
  ✓ pm:next [tested, skilled]
  ✓ pm:review [tested, skilled]
  ✓ pm:context [tested]
  ✓ pm:list [tested]
  ✓ pm-expert [skill, 7 triggers]
  ✓ pm-notion [mcp, configured]
  ✓ pm-validate [hook, active]

Quality Check:
  ✓ All commands tested: 4/4
  ✓ All dependencies satisfied
  ✓ No circular dependencies
  ✓ Documentation: Complete
  ✓ Skill integration: Verified

✅ Domain is ready for plugin
```

**Step 2: Gather Plugin Metadata**

Collect information about the plugin:

```json
{
  "components": {
    "commands": ["pm:next", "pm:review", "pm:context", "pm:list"],
    "count": 8,
    "hooks": ["pm-validate"],
    "mcp_servers": ["pm-notion"],
    "skills": ["pm-expert"]
  },

  "description": "Complete project management domain with task tracking, auto-discovery, and Notion integration",

  "domain": "pm",
  "metadata": {
    "author": "user",
    "created_at": "2025-10-29T15:15:00Z",
    "quality": {
      "documentation": "complete",
      "security_reviewed": false,
      "test_coverage": "100%"
    },
    "tags": ["project-management", "pm", "task-tracking", "workflow"],
    "team_members": ["user1", "user2"],
    "team_sharing": true
  },
  "name": "PM Automation Plugin",
  "version": "1.0.0"
}
```

**Step 3: Verify Quality Gates**

Check that all components meet minimum quality standards:

```
Quality Gate Verification
─────────────────────────

Required Gate: All commands tested
  ✓ pm:next: PASSED
  ✓ pm:review: PASSED
  ✓ pm:context: PASSED
  ✓ pm:list: PASSED

Required Gate: No unresolved dependencies
  ✓ pm:notion MCP: Configured
  ✓ All env vars documented
  ✓ Setup instructions included

Required Gate: Documentation complete
  ✓ README.md: Present
  ✓ SETUP.md: Present
  ✓ Commands documented
  ✓ Skills documented

Optional Gate: Security review
  ⚠️  Not reviewed (recommend for sensitive operations)

✅ All required gates passed
```

**Step 4: Create Plugin Manifest**

Enhance the existing `plugin.yaml` with distribution metadata:

```yaml
name: pm-automation
version: 1.0.0
description: Complete PM domain with task management and auto-discovery

# Metadata for distribution
metadata:
  author: user
  created_at: "2025-10-29T15:15:00Z"
  updated_at: "2025-10-29T15:20:00Z"
  tags:
    - project-management
    - pm
    - task-tracking
    - workflow
    - auto-discovery

  team_sharing:
    enabled: true
    members: ["user1", "user2"]

  quality:
    test_coverage: "100%"
    documented: true
    security_reviewed: false
    status: "production-ready"

# Components
components:
  commands:
    - id: pm:next
      path: ../../commands/pm/next.md
      tested: true
      version: "1.0.0"

    - id: pm:review
      path: ../../commands/pm/review.md
      tested: true
      version: "1.0.0"

    - id: pm:context
      path: ../../commands/pm/context.md
      tested: true
      version: "1.0.0"

    - id: pm:list
      path: ../../commands/pm/list.md
      tested: true
      version: "1.0.0"

  skills:
    - id: pm-expert
      path: ../../skills/pm-expert/SKILL.md
      trigger_phrases: 7
      version: "1.0.0"

  mcp_servers:
    - id: pm-notion
      path: ../../mcp-servers/pm-notion/
      type: notion
      required_config: [NOTION_API_KEY, NOTION_DATABASE_ID]
      version: "1.0.0"

  hooks:
    - event: pre-commit
      id: pm-validate
      path: ../../hooks/pre-commit/pm-validate.sh
      version: "1.0.0"

# Dependencies
dependencies:
  - name: pm-notion
    type: mcp
    required: true
    config_vars: [NOTION_API_KEY, NOTION_DATABASE_ID]

# Distribution
distribution:
  registry: internal
  published: false
  publishable: true

  installation:
    method: "copy-or-link"
    target_dir: ".claude/"
    setup_steps:
      - "Set NOTION_API_KEY environment variable"
      - "Set NOTION_DATABASE_ID environment variable"
      - "Run: /test:integration pm:next pm-expert"

# License and sharing
license: MIT
sharing_policy: team

# Support
support:
  documentation: ".claude/plugins/pm-automation/README.md"
  issues: "GitHub Issues (optional)"
  contact: "user@example.com"
```

**Step 5: Package Plugin**

Create distribution-ready structure:

```
.claude/plugins/pm-automation/
├── plugin.yaml                 (manifest)
├── README.md                   (user-facing)
├── SETUP.md                    (installation guide)
├── CHANGELOG.md                (version history)
├── LICENSE                     (MIT/Apache)
├── commands/
│   ├── next.md
│   ├── review.md
│   ├── context.md
│   └── list.md
├── skills/
│   └── pm-expert/
│       └── SKILL.md
├── mcp-servers/
│   └── pm-notion/
│       ├── mcp.json
│       └── setup.md
├── hooks/
│   └── pre-commit/
│       └── pm-validate.sh
├── .env.example               (config template)
├── test-results/              (integration tests)
└── dist/                       (distribution package)
    └── pm-automation-1.0.0.zip
```

**Step 6: Generate Distribution Package**

```
Plugin Package: pm-automation-1.0.0.zip
────────────────────────────────────────

Contents:
  plugin.yaml
  README.md
  SETUP.md
  CHANGELOG.md
  LICENSE
  commands/
    next.md
    review.md
    context.md
    list.md
  skills/
    pm-expert/SKILL.md
  mcp-servers/
    pm-notion/mcp.json
    pm-notion/setup.md
  hooks/
    pre-commit/pm-validate.sh
  .env.example
  test-results/
    pm:next.json
    pm:review.json
    integration-pm:next-pm-expert.json

Size: 245 KB
Checksum: sha256:a1b2c3d4e5f6...
```

**Step 7: Update Registry**

```json
{
  "components_count": 8,
  "distribution": {
    "installable": true,
    "package_path": ".claude/plugins/pm-automation/dist/pm-automation-1.0.0.zip",
    "packaged": true,
    "publish_status": "ready (not published)",
    "publishable": true
  },
  "evolution_path": [
    "scaffold pm → test commands → add skill → package plugin (v1.0.0)"
  ],
  "id": "pm-automation",
  "quality": {
    "documented": true,
    "test_coverage": "100%",
    "tested": true
  },
  "status": "packaged",
  "type": "plugin",
  "version": "1.0.0"
}
```

### Output Summary

```
────────────────────────────────────────────────────
Plugin Packaged: pm-automation (v1.0.0)
────────────────────────────────────────────────────

✅ Successfully packaged pm domain as plugin

📦 Plugin Details:
  Name: pm-automation
  Version: 1.0.0
  Components: 8 (4 commands, 1 skill, 1 MCP, 1 hook)
  Size: 245 KB

Components Included:
  Commands:
    ✓ /pm:next
    ✓ /pm:review
    ✓ /pm:context
    ✓ /pm:list

  Skills:
    ✓ pm-expert (7 triggers)

  MCP Servers:
    ✓ pm-notion (Notion integration)

  Hooks:
    ✓ pre-commit validation

Quality Assurance:
  ✓ All components tested
  ✓ All dependencies satisfied
  ✓ 100% documentation
  ✓ Production-ready

Package Location:
  .claude/plugins/pm-automation/dist/pm-automation-1.0.0.zip

Next Steps:
  1. Share with team: Send pm-automation-1.0.0.zip
  2. Installation guide: See .claude/plugins/pm-automation/SETUP.md
  3. Publish to registry: /evolve:to-plugin pm --publish
  4. Version control: Commit plugin.yaml and plugin files
  5. Create new domain: /design:domain testing

Installation for Team:
  # Team member receives pm-automation-1.0.0.zip
  unzip pm-automation-1.0.0.zip -d .claude/
  export NOTION_API_KEY="..."
  export NOTION_DATABASE_ID="..."
  /test:integration pm:next pm-expert  # Verify
  /registry:scan pm                     # Confirm
```

### User Interaction Example

```
You: /evolve:to-plugin pm --version 2.0.0

Claude Plugin Packager:
  📦 Packaging pm domain as plugin (v2.0.0)

  ✓ Step 1: Verify domain ready
    Commands tested: 4/4 ✓
    Skills integrated: 1/1 ✓
    MCP configured: 1/1 ✓
    Hooks active: 1/1 ✓
    Dependencies: All satisfied ✓

  ✓ Step 2: Gather metadata
    Author: user
    Created: 2025-10-29
    Tags: pm, task-tracking, workflow
    Quality: 100% tested, documented

  ✓ Step 3: Verify quality gates
    Gate 1: All commands tested
      pm:next ✓
      pm:review ✓
      pm:context ✓
      pm:list ✓
    Gate 2: No unresolved dependencies
      pm-notion: ✓
    Gate 3: Documentation complete
      README: ✓
      SETUP: ✓
      Commands: ✓

  ✓ Step 4: Create manifest
    Generating: plugin.yaml (v2.0.0)
    Distribution metadata: Added
    Components listed: 8

  ✓ Step 5: Package plugin
    Creating structure...
    Copying files...
    Generating .zip...
    Size: 256 KB

  ✓ Step 6: Generate package
    pm-automation-2.0.0.zip created
    Checksum: sha256:a1b2c3d4...

  ✓ Step 7: Update registry
    Registry entry updated
    Evolution path recorded

  📊 Plugin Complete
  ──────────────────

  ✅ pm-automation (v2.0.0) READY

  📦 Distribution Package:
    File: .claude/plugins/pm-automation/dist/pm-automation-2.0.0.zip
    Size: 256 KB

  📋 Contents:
    • 4 commands (all tested)
    • 1 skill (auto-discovery)
    • 1 MCP server (Notion)
    • 1 pre-commit hook
    • Full documentation
    • Test results
    • Setup guide

  🎯 Ready to:
    ✓ Share with team (send .zip file)
    ✓ Publish to registry (/evolve:to-plugin pm --publish)
    ✓ Use as template for similar domains
    ✓ Evolve further (add more commands)

  Installation Instructions for Team:
    1. unzip pm-automation-2.0.0.zip -d .claude/
    2. export NOTION_API_KEY="xxx"
    3. export NOTION_DATABASE_ID="yyy"
    4. /test:integration pm:next pm-expert
    5. /registry:scan pm
```

---

## Core Command 5: `/evolve:split`

### Purpose

Break a monolithic component into smaller, composable pieces. Reverse of composition - useful when a command becomes complex and should be split into focused commands.

### Command Signature

```bash
/evolve:split {component-id} [--parts part1,part2,part3]
```

### Parameters

| Parameter      | Type   | Required | Description                              |
| -------------- | ------ | -------- | ---------------------------------------- |
| `component-id` | string | Yes      | Component to split                       |
| `--parts`      | string | No       | Parts to extract (default: auto-suggest) |

### Input Examples

```bash
/evolve:split pm:next
/evolve:split testing:unit --parts "run,report,coverage"
/evolve:split devops:deploy --parts "validate,prepare,execute,verify"
```

### Process Flow

**Step 1: Analyze Component**

```
User: /evolve:split pm:next

System:
✅ Analyzing pm:next command

Current complexity:
  • Lines of code: 247
  • Functions: 5
  • Parameters: 3
  • Conditions: 12
  • Cyclomatic complexity: 4.2 (moderate)
```

**Step 2: Suggest Split Points**

AI analyzes the component and suggests logical divisions:

```
Suggested Split: pm:next
────────────────────────

Current (monolithic):
  pm:next
    ├─ Parse arguments
    ├─ Filter tasks (pending/in-progress/blocked)
    ├─ Sort by priority/due-date
    ├─ Fetch from Notion
    ├─ Format output
    └─ Handle errors

Could split into:
  Option A: By responsibility
    • pm:filter-tasks (filter by status)
    • pm:sort-tasks (sort by priority)
    • pm:next (orchestrator - use both)

  Option B: By data flow
    • pm:fetch-tasks (get from Notion)
    • pm:next (select and format)

  Option C: Maximum modularity
    • pm:tasks (fetch all tasks)
    • pm:filter-tasks (apply filters)
    • pm:sort-tasks (sort results)
    • pm:next (orchestrator)

Benefits of splitting:
  • Each command does one thing
  • Reusable (filter-tasks works standalone)
  • Easier to test
  • Easier to evolve independently
```

**Step 3: Extract Parts**

```
Creating new commands from pm:next
──────────────────────────────────

Step 1: Extract pm:fetch-tasks
  From: pm:next (lines 40-80)
  Purpose: Get all tasks from Notion
  New file: .claude/commands/pm/fetch-tasks.md

  Before:
    function pm:next() {
      const tasks = fetchFromNotion();  ← Extract this
      const filtered = filter(tasks);
      const sorted = sort(filtered);
      return sorted;
    }

  After (pm:fetch-tasks):
    function pm:fetch-tasks() {
      return fetchFromNotion();
    }

  After (pm:next):
    function pm:next() {
      const tasks = pm:fetch-tasks();
      const filtered = filter(tasks);
      const sorted = sort(filtered);
      return sorted;
    }

Step 2: Extract pm:filter-tasks
  From: pm:next (lines 81-120)
  Purpose: Filter tasks by status
  New file: .claude/commands/pm/filter-tasks.md

Step 3: Extract pm:sort-tasks
  From: pm:next (lines 121-160)
  Purpose: Sort tasks by priority/due date
  New file: .claude/commands/pm/sort-tasks.md

Step 4: Refactor pm:next
  Now orchestrates the three extracted commands
  Becomes simpler and more focused
```

**Step 4: Create New Component Files**

```markdown
# .claude/commands/pm/fetch-tasks.md

---

name: pm:fetch-tasks
description: Fetch all tasks from Notion database
version: 1.0.0
requires: pm-notion (mcp)

---

## Fetch PM Tasks

Get all project management tasks from Notion.

Usage: /pm:fetch-tasks [format]

Parameters:
format (optional): json, csv, text (default: json)

Returns: Array of task objects

## Implementation

Connects to Notion database and returns all tasks.
```

**Step 5: Refactor Original Component**

```markdown
# .claude/commands/pm/next.md (refactored)

---

name: pm:next
description: Get the next PM task to work on
version: 2.0.0 (refactored)
requires: pm:fetch-tasks, pm:filter-tasks, pm:sort-tasks

---

## Get Next PM Task

Orchestrates:

1. pm:fetch-tasks - Get all tasks
2. pm:filter-tasks - Filter by status
3. pm:sort-tasks - Sort by priority
4. Return first task

Usage: /pm:next [filter] [limit]

Now much simpler - delegates to focused commands.
```

**Step 6: Migrate Tests and Skills**

```
Migrating tests...
  ✓ Move pm:next tests
  ✓ Create pm:fetch-tasks tests
  ✓ Create pm:filter-tasks tests
  ✓ Create pm:sort-tasks tests

Migrating skills...
  ✓ Keep pm-expert (still triggers pm:next)
  ✓ pm:next now calls pm:fetch-tasks internally
  ✓ New skill pm-sorter-expert (triggers pm:sort-tasks)
```

**Step 7: Update Registry and Integration**

```json
{
  "can_revert": true,
  "id": "pm:next",
  "now_calls": ["pm:fetch-tasks", "pm:filter-tasks", "pm:sort-tasks"],
  "split_history": [
    {
      "date": "2025-10-29",
      "extracted": ["pm:fetch-tasks", "pm:filter-tasks", "pm:sort-tasks"],
      "version": "1.0.0 → 2.0.0"
    }
  ],
  "status": "refactored",
  "type": "orchestrator",
  "version": "2.0.0"
}
```

### Output Example

```
Split Complete: pm:next → (orchestrator + 3 focused commands)
──────────────────────────────────────────────────────────────

✅ Successfully split pm:next

New Structure:
  pm:fetch-tasks   - Gets tasks from Notion
  pm:filter-tasks  - Filters by status
  pm:sort-tasks    - Sorts by priority
  pm:next          - Orchestrates the three above

Benefits:
  ✓ Each command now has single responsibility
  ✓ pm:fetch-tasks can be reused by other commands
  ✓ pm:filter-tasks works standalone
  ✓ Tests simpler (test each part)
  ✓ Changes isolated (modify sorter without touching others)

Files Created:
  ✓ .claude/commands/pm/fetch-tasks.md (new)
  ✓ .claude/commands/pm/filter-tasks.md (new)
  ✓ .claude/commands/pm/sort-tasks.md (new)
  ✓ .claude/commands/pm/next.md (refactored - now orchestrator)

Tests Migrated:
  ✓ pm:fetch-tasks tests created
  ✓ pm:filter-tasks tests created
  ✓ pm:sort-tasks tests created
  ✓ pm:next orchestration tests updated

Can Revert:
  /evolve:rollback pm:next v1.0.0
  (combines the three commands back into one monolithic)

Next:
  1. Test new commands: /test:command pm:fetch-tasks
  2. Test interactions: /test:integration pm:next pm:fetch-tasks
  3. Create new skills for pm:filter-tasks and pm:sort-tasks
  4. Re-package plugin: /evolve:to-plugin pm --version 2.1.0
```

---

## Core Command 6: `/evolve:remove-skill`

### Purpose

Reverse of `/evolve:add-skill`. Remove auto-discovery from a skilled command, reverting it to manual-only invocation.

### Command Signature

```bash
/evolve:remove-skill {command-id}
```

### Parameters

| Parameter    | Type   | Required | Description                  |
| ------------ | ------ | -------- | ---------------------------- |
| `command-id` | string | Yes      | Command with skill to remove |

### Input Examples

```bash
/evolve:remove-skill pm:next
/evolve:remove-skill testing:unit
```

### Process Flow

**Step 1: Verify Skill Exists**

```
User: /evolve:remove-skill pm:next

System:
✅ Checking: Does pm:next have a skill?
🔍 Searching registry...

Found: pm-next-skill
Path: .claude/skills/pm-next-skill/SKILL.md
Triggers: 7 phrases
Status: Active

✅ Skill found and can be removed
```

**Step 2: Disable Skill**

Archive the skill file (don't delete, preserve history):

```
Disabling skill...
  ✓ Archive: .claude/skills/pm-next-skill/
    → .claude/skills/.archived/pm-next-skill/ (v1.0.0)
  ✓ Remove skill reference from registry
  ✓ Skill no longer triggers auto-discovery
```

**Step 3: Verify Command Still Works**

```
Testing pm:next without skill...
  /pm:next (manual invocation)
  ✓ Executes successfully
  ✓ Output unchanged
  ✓ Command fully functional
```

**Step 4: Update Registry**

```json
{
  "can_restore": true,
  "evolution_path": ["command → skilled → command (v1.0.0) [reverted]"],
  "id": "pm:next",
  "skill_available": {
    "auto_discovery_enabled": false,
    "name": "pm-next-skill",
    "path": ".claude/skills/.archived/pm-next-skill/",
    "status": "archived"
  },
  "status": "command",
  "type": "command"
}
```

### Output Example

```
Skill Removed: pm:next
──────────────────────

✅ Successfully removed skill from pm:next

Before:
  • Auto-discovery: ON
  • Trigger phrases: 7
  • Claude suggests: When user says "what should I work on?"

After:
  • Auto-discovery: OFF
  • Manual invocation: /pm:next works
  • Claude doesn't suggest: User must ask explicitly

Skill Details:
  Name: pm-next-skill
  Status: Archived (preserved at .claude/skills/.archived/)
  Can restore: Yes (/evolve:add-skill pm:next)

Use Case:
  • Skill was causing false suggestions
  • Or: No longer needed in this context
  • Or: Cleaning up unused skills

Next:
  1. Keep pm:next as command-only
  2. Restore skill later: /evolve:add-skill pm:next
  3. Delete archived skill: /evolve:remove-skill pm:next --delete
```

---

## Core Command 7: `/evolve:rollback`

### Purpose

Undo an evolution operation. Revert a component to a previous version, including reversing splits, skill additions, or plugin releases.

### Command Signature

```bash
/evolve:rollback {component-id} {version} [--confirm]
```

### Parameters

| Parameter      | Type   | Required | Description                                                 |
| -------------- | ------ | -------- | ----------------------------------------------------------- |
| `component-id` | string | Yes      | Component to rollback (e.g., `pm:next`)                     |
| `version`      | string | Yes      | Target version (e.g., `v1.0.0`, `before-split`, `previous`) |
| `--confirm`    | flag   | No       | Skip confirmation (default: ask)                            |

### Input Examples

```bash
/evolve:rollback pm:next v1.0.0
/evolve:rollback pm:next before-split
/evolve:rollback testing:unit previous --confirm
/evolve:rollback pm-automation v1.0.0
```

### Process Flow

**Step 1: Load Version History**

```
User: /evolve:rollback pm:next v1.0.0

System:
✅ Loading version history for pm:next

Version Timeline:
  v2.1.0 (current - 2025-10-29 15:30) - Skilled version
    └─ Triggers: 7 phrases
    └─ Command: pm:next (refactored)

  v2.0.0 (2025-10-29 15:15) - After split
    └─ Extracted: fetch-tasks, filter-tasks, sort-tasks

  v1.1.0 (2025-10-29 14:55) - After add-skill
    └─ Added pm-next-skill

  v1.0.0 (2025-10-29 14:40) - Original
    └─ Monolithic command
    └─ Tested ✓

✅ v1.0.0 available for rollback
```

**Step 2: Show Impact Analysis**

```
Impact of rolling back to v1.0.0:
──────────────────────────────────

Changes to revert:
  ✓ Remove skill: pm-next-skill (archived)
  ✓ Remove split components:
    - pm:fetch-tasks (created in v2.0.0)
    - pm:filter-tasks (created in v2.0.0)
    - pm:sort-tasks (created in v2.0.0)
  ✓ Restore original: pm:next.md (v1.0.0)

Affected components:
  Commands:
    ✓ pm:next (downgrade v2.1.0 → v1.0.0)
    ✗ pm:fetch-tasks (will be deleted)
    ✗ pm:filter-tasks (will be deleted)
    ✗ pm:sort-tasks (will be deleted)

  Skills:
    ✗ pm-next-skill (will be unlinked/archived)
    ✗ pm-sorter-expert (will be deleted if v1.0.0 didn't have it)

  Plugins:
    ✓ pm-automation will use pm:next v1.0.0
    ⚠️  Plugin version needs update

Tests affected:
  ✓ pm:next tests will revert to v1.0.0 version
  ✗ pm:fetch-tasks tests will be removed
  ✗ pm:filter-tasks tests will be removed
  ✗ pm:sort-tasks tests will be removed

⚠️  Confirmations needed:
  • Delete pm:fetch-tasks command? (no recovery)
  • Delete pm:filter-tasks command? (no recovery)
  • Delete pm:sort-tasks command? (no recovery)

Continue with rollback? (yes/no)
```

**Step 3: User Confirmation**

```
You: yes

System:
✅ Confirmed. Proceeding with rollback...

Creating backup:
  ✓ Backup pm:next v2.1.0 → .claude/backups/pm:next-v2.1.0-backup.md
  ✓ Backup pm:fetch-tasks v1.0.0 → .claude/backups/pm:fetch-tasks-v1.0.0-backup.md
  ✓ Backup pm:filter-tasks v1.0.0 → .claude/backups/pm:filter-tasks-v1.0.0-backup.md
  ✓ Backup pm:sort-tasks v1.0.0 → .claude/backups/pm:sort-tasks-v1.0.0-backup.md
  ✓ Backup pm-next-skill → .claude/backups/pm-next-skill-v1.0.0-backup.md
```

**Step 4: Perform Rollback**

```
Performing rollback...
──────────────────────

✓ Step 1: Restore pm:next
  Restoring: .claude/commands/pm/next.md
  Version: v1.0.0 (original monolithic)
  Tests: Restoring pm:next.json tests

✓ Step 2: Delete split components
  Deleting: .claude/commands/pm/fetch-tasks.md
  Deleting: .claude/commands/pm/filter-tasks.md
  Deleting: .claude/commands/pm/sort-tasks.md
  (saved in .claude/backups/ if needed)

✓ Step 3: Remove/archive skills
  Removing: pm-next-skill reference
  Removing: pm-sorter-expert skill
  (archived in .claude/skills/.archived/)

✓ Step 4: Update registry
  pm:next status: command → skilled → command (v1.0.0)
  Dependencies updated
  Evolution history recorded

✓ Step 5: Verify integrity
  ✓ pm:next executes correctly
  ✓ Tests pass with v1.0.0 code
  ✓ Registry updated
  ✓ No orphaned dependencies

✅ Rollback Complete
```

**Step 5: Show New State**

```
Rollback Complete: pm:next → v1.0.0
────────────────────────────────────

✅ Successfully rolled back to v1.0.0

Current State:
  pm:next: v1.0.0 (monolithic, no skill)

Components Removed:
  ✗ pm:fetch-tasks (archived in backups/)
  ✗ pm:filter-tasks (archived in backups/)
  ✗ pm:sort-tasks (archived in backups/)
  ✗ pm-sorter-expert (archived in backups/)

Skills Removed:
  ✗ pm-next-skill (archived in backups/)

Behavior Changed:
  Before: Claude auto-suggests /pm:next
  After:  User must invoke /pm:next manually

Backups Preserved:
  .claude/backups/pm:next-v2.1.0-backup.md
  .claude/backups/pm:fetch-tasks-v1.0.0-backup.md
  (and others)

Can Redo:
  /evolve:split pm:next (will re-extract components)
  /evolve:add-skill pm:next (will re-add auto-discovery)

Next:
  1. Test pm:next: /test:command pm:next
  2. Re-integrate into plugin (optional)
  3. Or continue with different evolution path
```

---

## Integration Patterns

### How Layer 2 Uses Layer 1

```
Layer 1: Foundation
├─ /design:domain → Creates design spec
├─ /scaffold:domain → Generates components
└─ /registry:scan → Discovers what exists

Layer 2: Lifecycle (uses Layer 1)
├─ /test:command → Uses registry to find components
├─ /test:integration → Uses registry to find interactions
├─ /evolve:add-skill → Uses registry to verify tested status
├─ /evolve:to-plugin → Uses registry to gather metadata
├─ /evolve:split → Uses registry to analyze component
├─ /evolve:remove-skill → Uses registry to find skill
└─ /evolve:rollback → Uses registry history to undo
```

### Evolution Path

```
Component Lifecycle:
────────────────────

1. DESIGN (Layer 1)
   /design:domain testing
   → Creates design spec

2. SCAFFOLD (Layer 1)
   /scaffold:domain testing
   → Generates .claude/commands/testing/unit.md

3. TEST COMMAND (Layer 2)
   /test:command testing:unit
   → Validates command works
   → Generates test results

4. ADD SKILL (Layer 2)
   /evolve:add-skill testing:unit
   → Wraps command with auto-discovery
   → Creates skill with triggers

5. TEST INTEGRATION (Layer 2)
   /test:integration testing:unit testing-expert
   → Verifies skill + command work together

6. PACKAGE PLUGIN (Layer 2)
   /evolve:to-plugin testing
   → Bundles all testing domain components
   → Creates distributable .zip

Each transition is:
  ✓ Tested (verify before moving on)
  ✓ Reversible (can rollback)
  ✓ Observable (registry tracks progress)
  ✓ Independent (each step works alone)
```

---

## Data Formats

### Test Result Format

Save to: `.claude/test-results/{command-id}.json`

```json
{
  "command_id": "pm:next",
  "coverage": {
    "paths_tested": 15,
    "paths_total": 17,
    "percentage": 89
  },

  "duration_ms": 1875,

  "recommendations": [
    "Add retry logic for API",
    "Document timeout",
    "Add example"
  ],
  "status": "passed",
  "summary": {
    "failed": 0,
    "passed": 4,
    "skipped": 0,
    "total_tests": 4
  },

  "test_date": "2025-10-29T14:50:00Z",
  "tests": [
    {
      "duration_ms": 250,
      "name": "Syntax Validation",
      "status": "passed"
    },
    {
      "duration_ms": 245,
      "name": "Execution",
      "output": "...",
      "status": "passed"
    },
    {
      "duration_ms": 1200,
      "name": "Integration Dependencies",
      "status": "passed"
    },
    {
      "duration_ms": 180,
      "name": "Error Handling",
      "status": "passed"
    }
  ]
}
```

### Evolution History Format

Saved in registry entry for each component:

```json
{
  "evolution_history": [
    {
      "changes": "Initial command created",
      "date": "2025-10-29T14:40:00Z",
      "status": "command",
      "type": "scaffold",
      "version": "1.0.0"
    },
    {
      "changes": "Added auto-discovery skill",
      "date": "2025-10-29T14:55:00Z",
      "reverse_command": "/evolve:remove-skill pm:next",
      "reversible": true,
      "status": "skilled",
      "type": "evolve:add-skill",
      "version": "1.1.0"
    },
    {
      "changes": "Split into fetch/filter/sort + orchestrator",
      "date": "2025-10-29T15:15:00Z",
      "extracted": ["pm:fetch-tasks", "pm:filter-tasks", "pm:sort-tasks"],
      "reverse_command": "/evolve:rollback pm:next v1.1.0",
      "reversible": true,
      "status": "orchestrator",
      "type": "evolve:split",
      "version": "2.0.0"
    },
    {
      "changes": "Packaged with domain into plugin",
      "date": "2025-10-29T15:30:00Z",
      "plugin": "pm-automation",
      "reversible": true,
      "status": "packaged",
      "type": "evolve:to-plugin",
      "version": "2.1.0"
    }
  ],
  "id": "pm:next"
}
```

---

## Quality Criteria

### Command Tested

✅ A command is "tested" when:

- Syntax validation passes
- Execution succeeds with examples
- All dependencies are satisfied
- Error handling works
- Test report generated
- Coverage >= 80%

### Integration Verified

✅ Integration is "verified" when:

- Basic interaction works
- Data flows correctly
- Error propagation handled
- Performance acceptable
- Concurrent usage safe
- Integration report generated

### Component Ready

✅ Component is "ready" when:

- Tested OR Integration verified
- No unresolved dependencies
- Documentation complete
- Can be packaged as plugin
- Can be shared with team

---

## Self-Extension Example

**How Layer 2 Can Build Itself**

```bash
# Use Layer 1 to design a "Testing" domain
/design:domain testing "Test automation and validation"

# Answer the questions:
# - Operations: test-command, test-integration, test-coverage
# - Auto-discovery: Yes (testing-expert skill)
# - External: No
# - Automation: Yes (pre-push hook)
# - Sharing: Team

# Scaffold the domain
/scaffold:domain testing

# This creates:
# .claude/commands/testing/test-command.md
# .claude/commands/testing/test-integration.md
# .claude/commands/testing/test-coverage.md
# .claude/skills/testing-expert/
# .claude/hooks/pre-push/testing-validate.sh
# .claude/plugins/testing-automation/

# Now test the testing commands
/test:command testing:test-command
/test:command testing:test-integration
/test:command testing:test-coverage

# Add skills
/evolve:add-skill testing:test-command
/evolve:add-skill testing:test-integration

# Package
/evolve:to-plugin testing

# Verify with registry
/registry:scan
```

The system builds its own testing capability using Layer 1 primitives!

---

## Error Handling

| Scenario               | Error                                 | Fix                             |
| ---------------------- | ------------------------------------- | ------------------------------- |
| Command not tested     | "pm:next must be tested before skill" | Run `/test:command pm:next`     |
| Missing dependency     | "Dependency pm-notion not configured" | Set env vars, configure MCP     |
| Integration failed     | "Scenario basic-interaction failed"   | Debug with `--verbose` flag     |
| Skill not found        | "No skill found for pm:next"          | Run `/evolve:add-skill pm:next` |
| Version not found      | "Version v1.0.0 not in history"       | Check `/registry:scan pm:next`  |
| Rollback has orphans   | "pm:fetch-tasks still referenced"     | Delete dependents first         |
| Split creates conflict | "pm:filter-tasks already exists"      | Use different name              |

---

## Implementation Roadmap

### Phase 2a (Weeks 3-4): Core Testing

- Build `/test:command` with 4 test scenarios
- Build `/test:integration` with 5 integration scenarios
- Test against Layer 1 commands

### Phase 2b (Weeks 5-6): Safe Evolution

- Build `/evolve:add-skill` with skill creation
- Build `/evolve:to-plugin` with packaging
- Build `/evolve:remove-skill` and `/evolve:rollback`

### Phase 2c (Weeks 7-8): Self-Extension

- Use MCC to scaffold "Lifecycle" domain
- Implement testing/testing domain
- Verify all 7 commands work
- Create integration between all Layer 2 commands

### Phase 2d (Week 9): Documentation

- Generate examples for each command
- Create troubleshooting guide
- Record video walkthroughs

---

## Success Criteria

✅ **Phase 2 Complete When:**

- All 7 commands implemented and working
- Each command tested against Layer 1 components
- Commands compose (output of one → input of another)
- Evolution paths are safe and reversible
- Registry accurately tracks component state
- System can scaffold its own testing domain
- Can package and share a complete domain as plugin
- No breaking changes to Layer 1
- User can go from idea → tested → skilled → packaged in <20 minutes

---

## Glossary

**Test Result:** Structured record of test outcomes for a component

**Integration Test:** Validation that two components work together correctly

**Skill Addition:** Wrapping a command with auto-discovery triggers

**Plugin:** Packaged, distributable collection of components

**Split:** Breaking monolithic component into focused parts

**Rollback:** Reverting component to previous version/state

**Evolution:** Safe transformation of component (test → skill → plugin)

**Lifecycle:** Complete journey of a component from design to distribution

---

## Summary

The **Lifecycle Layer (Layer 2)** completes the composable system by adding:

1. **Testing**: Validate components work (individually and together)
2. **Evolution**: Safely improve components with reversible operations
3. **Distribution**: Package domains as plugins for sharing
4. **Self-Extension**: System can build more of itself

**Key Outcome:** Users can take a rough idea → design → scaffold → test → evolve → package → share in a single coherent workflow, with every step observable and reversible.

This layer is the foundation for all higher layers (Intelligence, Quality, Collaboration, Observability, Automation, Sustainability) which will add guidance, validation, and advanced capabilities.

---

**Next:** After Phase 2 implementation, move to Layer 3: Intelligence (AI-powered guidance and learning)
