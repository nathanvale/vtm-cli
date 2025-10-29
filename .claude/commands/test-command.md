---
allowed-tools: Write, Read, Bash(mkdir:*, test:*, cat:*, grep:*, find:*)
description: Validate individual Claude Code components with comprehensive testing framework
argument-hint: {name} [options]
---

# Test Command - Component Validation System

Comprehensive testing system that validates individual Claude Code components through multiple test types.

## About This Command

Tests individual components across five test dimensions:

1. **Smoke Test** - Does component exist and can it be invoked?
2. **Functional Test** - Does it produce expected output?
3. **Integration Test** - Does it work with dependencies?
4. **Performance Test** - Execution time and token usage acceptable?
5. **Quality Test** - Documentation and metadata complete?

Creates detailed test reports with results, metrics, and recommendations.

## Usage

```bash
# Quick smoke test
/test:command pm:next --mode quick

# Full functional test
/test:command pm:next --mode comprehensive --expected "Ready Tasks"

# Test with arguments
/test:command pm:start --args "TASK-001" --mode comprehensive

# Performance test
/test:command pm:context --mode comprehensive --timeout 30

# Generate detailed report
/test:command pm:next --mode comprehensive --report

# Test skill auto-discovery
/test:command pm-expert --mode quick

# Test MCP connection
/test:command notion-mcp --mode comprehensive

# Test with environment variables
/test:command deploy-hook --env "ENV=prod" --env "SLACK_TOKEN=xxx" --mode comprehensive
```

## Command Syntax

```bash
/test:command {name} [options]
```

### Parameters

**Name** (required)

- Component to test (slash command, skill, MCP server, hook, agent)
- Format: `domain:command` or `plugin-name` or `component-id`
- Examples: `pm:next`, `pm-expert`, `notion-mcp`, `deploy-hook`

### Options

**--args "arg1 arg2"**

- Arguments to pass to the command
- Required for commands with parameters
- Example: `--args "TASK-001 --verbose"`

**--mode {quick|comprehensive}**

- Test depth level
- `quick`: Smoke test only (~5 seconds)
- `comprehensive`: All test types (30-60 seconds)
- Default: `quick`

**--expected "value"**

- Expected output for validation
- Test passes if output contains this string
- Case-insensitive matching
- Example: `--expected "Ready Tasks"`

**--timeout {seconds}**

- Maximum execution time (1-300 seconds)
- Default: 30
- Useful for long-running operations

**--env KEY=value**

- Environment variables (repeatable)
- Sets variables for component execution
- Example: `--env "API_KEY=xxx" --env "REGION=us-west"`

**--report**

- Generate HTML test report
- Saves to `.claude/test-results/report-{timestamp}.html`
- Includes all metrics and recommendations

## Quick Examples

### Test Slash Command

```bash
# Test /pm:next command
/test:command pm:next --mode quick

Output:
✅ SMOKE TEST (passed)
  Component exists: /pm:next
  Can be invoked: yes
  Type: slash-command

🔄 FUNCTIONAL TEST (skipped - use --mode comprehensive)
```

### Test with Full Validation

```bash
# Test with expected output
/test:command pm:next --mode comprehensive --expected "Ready Tasks"

Output:
✅ SMOKE TEST (passed)
✅ FUNCTIONAL TEST (passed)
  Output contains: "Ready Tasks" ✓
  Response time: 245ms

✅ INTEGRATION TEST (passed)
  Dependencies resolved: 2/2
  Child commands: pm:start, pm:complete

✅ PERFORMANCE TEST (passed)
  Execution time: 245ms (target: 5000ms) ✓
  Token usage: ~450 (estimate)

✅ QUALITY TEST (passed)
  Documentation: complete ✓
  Metadata: complete ✓
  Error handling: yes ✓

📊 Test Summary
━━━━━━━━━━━━━━━━
Tests passed: 5/5
Total time: 1.2s
Recommendation: Ready for production
```

### Test with Arguments

```bash
# Test command that requires arguments
/test:command pm:context --args "TASK-001" --mode comprehensive --expected "dependencies"

Output:
✅ SMOKE TEST (passed)
✅ FUNCTIONAL TEST (passed)
  Input: TASK-001
  Output contains: "dependencies" ✓

✅ INTEGRATION TEST (passed)
  Resolved dependency: TASK-001 found

[... additional tests ...]
```

### Test Skill Component

```bash
# Test skill (auto-discovery trigger phrase)
/test:command pm-expert --mode quick

Output:
✅ SMOKE TEST (passed)
  Component exists: pm-expert
  Type: skill
  Trigger phrases: "what should I work on?", "current status"

🔄 FUNCTIONAL TEST (skipped - use --mode comprehensive)
```

### Test MCP Server

```bash
# Test MCP connection
/test:command notion-mcp --mode comprehensive

Output:
✅ SMOKE TEST (passed)
  Component exists: notion-mcp
  Type: mcp-server

✅ FUNCTIONAL TEST (passed)
  Connection: established
  Available operations: 8

✅ INTEGRATION TEST (passed)
  Authentication: valid
  API version: 1.0

✅ PERFORMANCE TEST (passed)
  Response time: 120ms

✅ QUALITY TEST (passed)
  Documentation: complete
  Error handling: yes

📊 Summary
━━━━━━━━━━━━━━━━
All tests passed. Ready to use.
```

### Generate Report

```bash
# Test with report generation
/test:command pm:next --mode comprehensive --report

Output:
✅ Testing complete
📄 Report generated: .claude/test-results/report-2025-10-29-143022.html
🌐 Open in browser to view detailed results
```

## Test Framework Details

### Test 1: Smoke Test (Always Run)

**Purpose:** Verify component exists and can be invoked

**Checks:**

- Component file exists at expected location
- Component can be parsed (syntax valid)
- Component metadata is present and valid
- Component type is recognized (command/skill/mcp/hook/agent)
- Required fields are populated

**Pass Criteria:** All checks pass
**Typical Time:** 100-500ms

### Test 2: Functional Test (comprehensive mode)

**Purpose:** Verify component produces expected output

**Checks:**

- Component executes without errors
- Output matches expected value (if provided)
- Response contains no error messages
- Return type matches specification
- All output fields are populated

**Pass Criteria:** Execution successful + expected output present
**Typical Time:** 1-5 seconds

### Test 3: Integration Test (comprehensive mode)

**Purpose:** Verify component works with dependencies

**Checks:**

- All dependencies are resolvable
- Dependencies execute successfully
- Data flows correctly between components
- Child components still function
- No circular dependencies

**Pass Criteria:** All dependencies resolved and functional
**Typical Time:** 2-10 seconds

### Test 4: Performance Test (comprehensive mode)

**Purpose:** Verify performance is within acceptable limits

**Checks:**

- Execution time under timeout
- Estimated token usage reasonable
- Memory usage acceptable
- No memory leaks
- Suitable for production

**Pass Criteria:** All metrics within thresholds
**Typical Time:** Varies by component

### Test 5: Quality Test (comprehensive mode)

**Purpose:** Verify documentation and metadata standards

**Checks:**

- Component has documentation
- Metadata is complete
- Error messages are helpful
- Tests exist for component
- No deprecated dependencies

**Pass Criteria:** All standards met
**Typical Time:** 500ms-2s

## Test Results

### Success Output Format

```
✅ COMPONENT TEST RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Component: {name}
Type: {type}
Status: ✅ PASSED

📋 Test Results
────────────────────────────────
[1] Smoke Test:        ✅ PASSED
[2] Functional Test:   ✅ PASSED
[3] Integration Test:  ✅ PASSED
[4] Performance Test:  ✅ PASSED
[5] Quality Test:      ✅ PASSED

📊 Metrics
────────────────────────────────
Tests Passed:          5/5
Total Duration:        2.3s
Estimated Tokens:      ~520

🎯 Recommendations
────────────────────────────────
✓ Component is production ready
✓ All dependencies resolved
✓ Performance acceptable
✓ Documentation complete

🚀 Next Steps
────────────────────────────────
Component can be:
  • Used in workflows
  • Shared with team
  • Published to marketplace
```

### Failure Output Format

```
❌ COMPONENT TEST RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Component: {name}
Type: {type}
Status: ❌ FAILED

📋 Test Results
────────────────────────────────
[1] Smoke Test:        ✅ PASSED
[2] Functional Test:   ❌ FAILED
[3] Integration Test:  ⊘ SKIPPED (blocked by [2])
[4] Performance Test:  ⊘ SKIPPED (blocked by [2])
[5] Quality Test:      ⚠️  WARNING

❌ Failures
────────────────────────────────
[Functional Test]
  Error: Output does not contain expected string
  Expected: "Ready Tasks"
  Got: "Error: Task file not found"
  Severity: High

[Quality Test]
  Warning: Documentation missing
  File: .claude/commands/pm-next.md
  Status: Missing
  Severity: Medium

🔧 How to Fix
────────────────────────────────
1. Check if vtm.json exists in your working directory
   $ ls -la vtm.json

2. Verify VTM file is valid JSON
   $ jq . vtm.json

3. Add documentation to pm-next
   $ cat > .claude/commands/pm-next.md

4. Run test again
   $ /test:command pm:next --mode comprehensive

📞 Getting Help
────────────────────────────────
• See documentation: .claude/commands/pm-next.md
• Check examples: .claude/test-results/examples/
• Ask Claude Code for help
```

## Test Case Library

Pre-built test templates for common components:

```bash
# Test PM domain commands
/test:command pm:next --mode comprehensive
/test:command pm:start --args "TASK-001" --mode comprehensive
/test:command pm:context --args "TASK-001" --mode comprehensive
/test:command pm:complete --args "TASK-001" --mode comprehensive

# Test PM domain skill
/test:command pm-expert --mode comprehensive

# Test system integration
/test:command pm:next --mode comprehensive
/test:command pm:context --args "TASK-001" --mode comprehensive --expected "dependencies"

# Performance benchmarks
/test:command pm:next --mode comprehensive --timeout 5
/test:command pm:context --args "TASK-001" --mode comprehensive --timeout 10
```

## Registry Integration

The test command integrates with the component registry:

- Discovers components via `/registry:scan`
- Resolves dependencies automatically
- Validates against component metadata
- Updates registry with test results
- Suggests improvements based on metrics

## Extending Tests

### For Command Authors

Add test metadata to your command:

```markdown
---
test:
  quick: "--mode quick"
  full: "--mode comprehensive --expected 'output'"
  args: "TASK-001"
  expected: "Task Details"
  timeout: 30
---
```

### For Component Developers

Create test cases in `.claude/test-templates/{component-id}.json`:

```json
{
  "component_id": "pm:next",
  "test_cases": [
    {
      "expected": "Ready Tasks",
      "mode": "quick",
      "name": "basic_smoke_test"
    },
    {
      "args": "--number 10",
      "expected": "Tasks",
      "mode": "comprehensive",
      "name": "with_filters"
    }
  ]
}
```

## Common Issues & Solutions

### Test Fails: "Component not found"

```bash
# Verify component exists
/registry:scan

# Check component path
find .claude -name "*component-name*"

# Verify metadata
cat .claude/commands/component-name.md | head -10
```

### Test Fails: "Expected output not found"

```bash
# Run without expected filter to see actual output
/test:command pm:next --mode comprehensive

# Compare with expectation
# Update expected value if output is correct
/test:command pm:next --mode comprehensive --expected "new-expected-string"
```

### Test Fails: "Dependency resolution failed"

```bash
# Check dependency exists
/test:command {dependency-name} --mode quick

# Verify dependency format in metadata
grep "dependencies:" .claude/commands/component.md

# Fix dependency reference
# Re-run test
```

### Performance Test Fails

```bash
# Run with longer timeout
/test:command pm:next --timeout 60 --mode comprehensive

# Check for bottlenecks
/test:command pm:next --mode comprehensive --report
# Review detailed metrics in HTML report
```

## Integration with Workflow

Typical testing workflow:

```bash
# 1. Create new command
/scaffold:domain pm

# 2. Test it works
/test:command pm:next --mode quick

# 3. Fix any issues
# (Edit command file)

# 4. Run full test suite
/test:command pm:next --mode comprehensive

# 5. Generate report for review
/test:command pm:next --mode comprehensive --report

# 6. Share component
/marketplace:install pm:next
```

## Related Commands

- `/registry:scan` - Discover all components
- `/design:domain` - Design before building
- `/scaffold:domain` - Generate structure
- `/quality:check` - Comprehensive validation
- `/marketplace:install` - Share components

## Implementation Details

Test execution framework:

- `.claude/lib/test-framework.ts` - Core testing engine
- `.claude/lib/test-templates.json` - Test case library
- `.claude/test-results/` - Test result storage
- `.claude/lib/registry.json` - Component registry

Test types:

- Smoke: Fast validation (100-500ms)
- Functional: Output verification (1-5s)
- Integration: Dependency testing (2-10s)
- Performance: Metrics collection (varies)
- Quality: Standards checking (500ms-2s)

Report formats:

- Console: Inline results
- HTML: Detailed report with metrics
- JSON: Machine-readable results
- Markdown: Shareable summary

---

## IMPLEMENTATION

Execute the test framework to validate the component:

```javascript
const { TestFramework } = require("./.claude/lib/test-framework")

// Parse arguments
const componentName = ARGUMENTS[0]
if (!componentName) {
  console.error("❌ Component name required")
  console.error("Usage: /test:command {name} [options]")
  process.exit(1)
}

// Parse options
const options = {
  mode: "quick", // Default mode
  args: "",
  expected: "",
  timeout: 30,
  envVars: [],
  generateReport: false,
}

// Parse command line options
for (let i = 1; i < ARGUMENTS.length; i++) {
  const arg = ARGUMENTS[i]

  if (arg === "--mode" && ARGUMENTS[i + 1]) {
    options.mode = ARGUMENTS[i + 1]
    i++
  } else if (arg === "--args" && ARGUMENTS[i + 1]) {
    options.args = ARGUMENTS[i + 1]
    i++
  } else if (arg === "--expected" && ARGUMENTS[i + 1]) {
    options.expected = ARGUMENTS[i + 1]
    i++
  } else if (arg === "--timeout" && ARGUMENTS[i + 1]) {
    options.timeout = parseInt(ARGUMENTS[i + 1])
    i++
  } else if (arg === "--env" && ARGUMENTS[i + 1]) {
    options.envVars.push(ARGUMENTS[i + 1])
    i++
  } else if (arg === "--report") {
    options.generateReport = true
  }
}

// Initialize test framework
const testFramework = new TestFramework({
  basePath: process.cwd(),
  verbose: options.mode === "comprehensive",
})

// Run tests
try {
  const results = testFramework.runComponentTest(componentName, {
    mode: options.mode,
    args: options.args,
    expectedOutput: options.expected,
    timeout: options.timeout,
    env: options.envVars.reduce((acc, envVar) => {
      const [key, value] = envVar.split("=")
      acc[key] = value
      return acc
    }, {}),
    generateReport: options.generateReport,
  })

  // Display results
  if (results.passed) {
    console.log("\n✅ All tests passed")
  } else {
    console.error("\n❌ Some tests failed")
    process.exit(1)
  }

  // Show report location if generated
  if (options.generateReport && results.reportPath) {
    console.log(`\n📄 Report generated: ${results.reportPath}`)
  }
} catch (error) {
  console.error("❌ Test execution failed:", error.message)
  process.exit(1)
}
```
