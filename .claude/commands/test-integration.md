# Test Integration - Component Interaction Validation

**Command:** `/test:integration {componentA} {componentB} [options]`
**Version:** 1.0.0
**Purpose:** Test how two components interact with each other - validates data flow, error propagation, and integration points.

---

## What This Command Does

Tests the interaction between two components to ensure they work together correctly:

- Data compatibility (output of A → input of B)
- Error propagation (errors from A handled by B)
- State management (shared state between A and B)
- Performance under integration (combined execution time)
- Dependency resolution (A depends on B or vice versa)

---

## Usage

```bash
# Basic integration test
/test:integration pm:next pm:start

# Test with specific scenario
/test:integration pm:context vtm:reader --scenario data-flow

# Test error handling
/test:integration pm:next pm:start --scenario error-handling

# Performance test
/test:integration pm:next pm:context --scenario performance

# Full comprehensive test
/test:integration pm:next pm:start --mode comprehensive
```

---

## Arguments

```javascript
const componentA = ARGUMENTS[0] // First component
const componentB = ARGUMENTS[1] // Second component
const scenario = ARGUMENTS.includes("--scenario")
  ? ARGUMENTS[ARGUMENTS.indexOf("--scenario") + 1]
  : "basic"
const mode = ARGUMENTS.includes("--mode")
  ? ARGUMENTS[ARGUMENTS.indexOf("--mode") + 1]
  : "quick"
```

---

## Test Scenarios

### 1. Data Flow (default)

Tests output of A can be consumed by B:

```bash
/test:integration pm:next pm:start --scenario data-flow
```

**Checks:**

- A produces valid output
- B accepts A's output format
- Data transforms correctly
- No data loss

### 2. Error Handling

Tests error propagation:

```bash
/test:integration pm:next pm:start --scenario error-handling
```

**Checks:**

- Errors from A caught by B
- Error messages preserved
- Graceful degradation
- Recovery possible

### 3. Performance

Tests combined execution:

```bash
/test:integration pm:next pm:context --scenario performance
```

**Checks:**

- Total execution time acceptable
- No performance bottlenecks
- Resource usage reasonable
- Parallel execution possible

### 4. State Management

Tests shared state:

```bash
/test:integration pm:context vtm:reader --scenario state
```

**Checks:**

- Shared state consistent
- No race conditions
- State updates atomic
- Rollback possible

### 5. Concurrent Usage

Tests simultaneous execution:

```bash
/test:integration pm:next pm:review --scenario concurrent
```

**Checks:**

- Can run concurrently
- No resource conflicts
- Output not corrupted
- Performance acceptable

---

## Example Output

```
🔗 Testing integration: pm:next ↔ pm:start

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test 1: Basic Connectivity
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Component A (pm:next) - Ready
  • Exists: yes
  • Can execute: yes
  • Has outputs: yes

✅ Component B (pm:start) - Ready
  • Exists: yes
  • Can execute: yes
  • Accepts inputs: yes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test 2: Data Flow (A → B)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1: Execute pm:next
  Output: {"task_id": "TASK-001", "status": "pending"}

Step 2: Pass to pm:start
  Input: "TASK-001"
  Expected: Task started

✅ Data Flow - PASSED
  • Output format compatible: ✅
  • Data transforms correctly: ✅
  • No data loss: ✅
  • Integration time: 245ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test 3: Error Propagation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Scenario: pm:next fails
  Error: "No tasks available"

pm:start handles error:
  ✅ Error caught: yes
  ✅ Error message preserved: yes
  ✅ Graceful degradation: yes
  ✅ User informed: yes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test 4: Performance
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Individual execution:
  pm:next: 180ms
  pm:start: 120ms
  Total: 300ms

Integrated execution:
  Combined: 245ms ✅
  Efficiency: 18% improvement
  Overhead: 35ms (acceptable)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test 5: Dependencies
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Dependency Graph:
  pm:next → (provides task_id)
  pm:start → (requires task_id) ✅

✅ Dependencies resolved correctly
  • No circular dependencies
  • Proper execution order
  • Dependency chain valid

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Integration Test Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tests Passed: 5/5 ✅
Integration Status: COMPATIBLE
Recommendation: Safe to use together

✅ pm:next and pm:start work well together
✅ Ready for workflow: /pm:next then /pm:start TASK-ID
```

---

## Integration Patterns Tested

### 1. Producer-Consumer

Component A produces data, B consumes it:

```
A (pm:next) → data → B (pm:start)
```

### 2. Transform Chain

A transforms input, B transforms A's output:

```
input → A (parse) → intermediate → B (format) → output
```

### 3. Shared Resource

A and B both access same resource:

```
A ← resource → B
```

### 4. Event-Driven

A triggers event, B responds:

```
A (action) → event → B (handler)
```

### 5. Bidirectional

A and B communicate both ways:

```
A ↔ B
```

---

## What Gets Tested

### Compatibility Checks

- ✅ Output format of A matches input format of B
- ✅ Data types compatible
- ✅ Required fields present
- ✅ Optional fields handled

### Error Handling

- ✅ Errors from A propagated to B
- ✅ Error messages preserved
- ✅ Stack traces useful
- ✅ Recovery possible

### Performance

- ✅ Combined execution time acceptable
- ✅ No performance degradation
- ✅ Resource usage reasonable
- ✅ Bottlenecks identified

### Dependencies

- ✅ Dependency graph correct
- ✅ No circular dependencies
- ✅ Execution order valid
- ✅ Missing dependencies detected

### State Management

- ✅ Shared state consistent
- ✅ No race conditions
- ✅ Atomic updates
- ✅ Isolation when needed

---

## Validation

The command will validate:

- ✅ Both components exist
- ✅ Components can be executed
- ✅ Integration pattern identified
- ✅ Test scenario is valid

---

## Error Handling

**Component not found:**

```
❌ Component not found: pm:next
Create component first: /scaffold:domain pm
```

**Components incompatible:**

```
❌ Integration test FAILED

Components are incompatible:
  pm:next outputs: {"task_id": "string"}
  pm:context expects: {"task": "object"}

Fix:
  • Update pm:next to output full task object
  • Update pm:context to accept task_id
  • Add adapter layer
```

**Circular dependency:**

```
❌ Circular dependency detected

  pm:next → pm:start → pm:next (circular!)

Fix:
  • Remove circular dependency
  • Refactor to break cycle
  • Use event-driven pattern
```

---

## Integration Matrix

Test common integration pairs:

| Component A | Component B | Pattern           | Status |
| ----------- | ----------- | ----------------- | ------ |
| pm:next     | pm:start    | Producer-Consumer | ✅     |
| pm:next     | pm:context  | Producer-Consumer | ✅     |
| pm:start    | pm:complete | Sequential        | ✅     |
| pm:context  | vtm:reader  | Shared Resource   | ✅     |
| pm:next     | pm:review   | Independent       | ⚠️     |

---

## Related Commands

- **Test Individual:** `/test:command {component}` - Test before integration
- **Scan Registry:** `/registry:scan` - See all components
- **View Dependencies:** Check `.claude/registry.json`
- **Test Full Workflow:** Chain multiple integration tests

---

## Implementation

Execute integration testing:

```javascript
const { TestFramework } = require("./.claude/lib/test-framework")

// Parse arguments
const componentA = ARGUMENTS[0]
const componentB = ARGUMENTS[1]

if (!componentA || !componentB) {
  console.error("❌ Two components required")
  console.error("Usage: /test:integration {componentA} {componentB} [options]")
  process.exit(1)
}

// Parse options
const scenario = ARGUMENTS.includes("--scenario")
  ? ARGUMENTS[ARGUMENTS.indexOf("--scenario") + 1]
  : "data-flow"
const mode = ARGUMENTS.includes("--mode")
  ? ARGUMENTS[ARGUMENTS.indexOf("--mode") + 1]
  : "quick"

// Initialize test framework
const testFramework = new TestFramework({
  basePath: process.cwd(),
  verbose: mode === "comprehensive",
})

// Run integration tests
try {
  const results = testFramework.runIntegrationTest(componentA, componentB, {
    scenario,
    mode,
    checkDataFlow: true,
    checkErrorHandling: true,
    checkPerformance: mode === "comprehensive",
    checkDependencies: true,
    checkConcurrent: scenario === "concurrent",
  })

  // Display results
  console.log(`\n🔗 Testing integration: ${componentA} ↔ ${componentB}\n`)

  if (results.passed) {
    console.log("✅ All integration tests passed")
    console.log(`\nComponents are compatible and work well together.`)
  } else {
    console.error("❌ Some integration tests failed")
    console.error("\nSee details above for specific failures.")
    process.exit(1)
  }

  // Show recommendations
  if (results.recommendations && results.recommendations.length > 0) {
    console.log("\n💡 Recommendations:")
    results.recommendations.forEach((rec) => {
      console.log(`  • ${rec}`)
    })
  }
} catch (error) {
  console.error("❌ Integration test failed:", error.message)
  process.exit(1)
}
```

---

## Notes

- Tests actual integration, not just individual components
- Identifies compatibility issues early
- Validates workflows before production
- Provides specific fix recommendations
- Can test N-way integrations (A + B + C)

---

**Status:** Ready for Use
**Library:** Uses TestFramework.runIntegrationTest() in `.claude/lib/test-framework.ts`
