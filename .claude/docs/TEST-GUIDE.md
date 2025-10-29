# Test Guide - Writing Tests for Claude Code Components

Complete guide for creating and maintaining tests for your Claude Code components using the Test Framework.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test Types Overview](#test-types-overview)
3. [Creating Test Cases](#creating-test-cases)
4. [Testing Different Component Types](#testing-different-component-types)
5. [Advanced Testing](#advanced-testing)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### 5-Minute Test Setup

**Step 1: Run Quick Test**

```bash
/test:command pm:next --mode quick
```

**Step 2: Run Full Test**

```bash
/test:command pm:next --mode comprehensive --report
```

**Step 3: View Report**

```
Open .claude/test-results/report-*.html in your browser
```

That's it! Your component is tested.

---

## Test Types Overview

The framework validates components through five test dimensions:

### 1. Smoke Test (Always Runs)

**What it tests:** Does the component exist and can it be invoked?

**Checks:**

- Component file exists
- Can be parsed (valid syntax)
- Has metadata
- Component type is recognized
- Required fields are present

**Typical pass rate:** 100% (if component exists)

**When it fails:** Component file missing or malformed

**Example:**

```bash
/test:command my-command --mode quick

Output:
✅ SMOKE TEST (passed)
  Component exists: yes
  Type recognized: command
```

### 2. Functional Test

**What it tests:** Does it produce expected output?

**Checks:**

- Component executes without errors
- Output matches expected value
- Response contains no error messages
- All output fields are populated

**When to use:** Validate component behavior

**Example:**

```bash
/test:command pm:next --mode comprehensive --expected "Ready Tasks"

Output:
✅ FUNCTIONAL TEST (passed)
  Output contains: "Ready Tasks" ✓
  Response time: 245ms
```

### 3. Integration Test

**What it tests:** Does it work with dependencies?

**Checks:**

- All dependencies are resolvable
- Dependencies execute successfully
- Data flows correctly
- No circular dependencies

**When to use:** Complex components with dependencies

**Example:**

```bash
Component: pm:next
Dependencies: [vtm-reader, vtm-data]
Status: ✅ All 2 dependencies resolved
```

### 4. Performance Test

**What it tests:** Is it fast enough?

**Checks:**

- Execution time under timeout
- Token usage acceptable
- Memory usage reasonable
- Suitable for production

**Thresholds:** Configurable per component

**Example:**

```bash
Execution time: 245ms (target: 1000ms) ✓
Estimated tokens: 450 (target: 1000) ✓
```

### 5. Quality Test

**What it tests:** Is it production-ready?

**Checks:**

- Documentation exists
- Metadata is complete
- Error handling implemented
- No deprecated dependencies

**Example:**

```bash
✅ QUALITY TEST (passed)
  Documentation: complete ✓
  Metadata: complete ✓
  Error handling: yes ✓
```

---

## Creating Test Cases

### Basic Test Case Structure

All test cases follow this structure in `test-templates.json`:

```json
{
  "component_id": "my-command",
  "test_cases": [
    {
      "args": ["arg1", "arg2"],
      "command": "my-command",
      "description": "What this test validates",
      "expected": "Expected output string",
      "id": "unique-test-id",
      "mode": "quick|comprehensive",
      "name": "Human-readable test name",
      "notes": "Additional context",
      "should_pass": true,
      "timeout": 30,
      "type": "smoke|functional|integration|performance|quality"
    }
  ]
}
```

### Minimal Test Case

Simplest possible test case:

```json
{
  "command": "my-command",
  "id": "basic-smoke",
  "mode": "quick",
  "name": "Basic Smoke Test",
  "type": "smoke"
}
```

### Complete Test Case

Full-featured test case:

```json
{
  "args": ["TASK-001", "--compact"],
  "command": "pm:context",
  "description": "Test context generation with all available options",
  "env_vars": ["DEBUG=false"],
  "expected": "dependencies",
  "id": "pm-context-full",
  "mode": "comprehensive",
  "name": "Context with All Options",
  "notes": "Compact mode should reduce token usage significantly",
  "performance": {
    "expected_tokens": 500,
    "max_execution_time_ms": 5000
  },
  "requires": ["TASK-001 in vtm.json"],
  "should_pass": true,
  "side_effects": {
    "modifies_state": false,
    "network_call": false,
    "reads_file": true
  },
  "timeout": 15,
  "type": "functional"
}
```

---

## Testing Different Component Types

### A. Testing Slash Commands

**Example: Test `/pm:next`**

```json
{
  "component_id": "pm:next",
  "component_type": "command",
  "test_cases": [
    {
      "command": "pm:next",
      "expected": "Ready Tasks",
      "id": "pm-next-default",
      "mode": "comprehensive",
      "name": "Default Behavior",
      "timeout": 10,
      "type": "functional"
    },
    {
      "args": ["--number", "20"],
      "command": "pm:next",
      "expected": "Tasks",
      "id": "pm-next-custom-count",
      "mode": "comprehensive",
      "name": "Custom Count",
      "timeout": 10,
      "type": "functional"
    },
    {
      "command": "pm:next",
      "expected_output_pattern": "No tasks|Tasks|Ready",
      "id": "pm-next-no-tasks",
      "mode": "comprehensive",
      "name": "Handle Empty List",
      "type": "functional"
    }
  ]
}
```

**Testing checklist for commands:**

- [ ] Command exists and can be invoked
- [ ] Works with no arguments
- [ ] Works with various argument combinations
- [ ] Produces expected output format
- [ ] Handles missing dependencies gracefully
- [ ] Returns appropriate error messages
- [ ] Performance is acceptable

### B. Testing Skills (Auto-Discovery)

**Example: Test `pm-expert` skill**

```json
{
  "component_id": "pm-expert",
  "component_type": "skill",
  "description": "PM expert skill for auto-discovery",
  "test_cases": [
    {
      "id": "pm-expert-smoke",
      "mode": "quick",
      "name": "Skill Exists",
      "trigger_phrases": ["what should I work on", "next task"],
      "type": "smoke"
    },
    {
      "expected": "TASK",
      "id": "pm-expert-trigger",
      "mode": "comprehensive",
      "name": "Trigger Detection",
      "should_activate": true,
      "trigger_input": "What should I work on?",
      "type": "functional"
    },
    {
      "expected_output": ["task id", "description", "estimated hours"],
      "id": "pm-expert-context",
      "mode": "comprehensive",
      "name": "Provides Context",
      "trigger_input": "Tell me what to do next",
      "type": "functional"
    }
  ]
}
```

**Testing checklist for skills:**

- [ ] Skill metadata is complete
- [ ] Trigger phrases are effective
- [ ] Skill activates appropriately
- [ ] Provides useful context to Claude
- [ ] Doesn't interfere with other skills
- [ ] Response is well-formatted

### C. Testing MCP Servers

**Example: Test Notion MCP**

```json
{
  "component_id": "notion-mcp",
  "component_type": "mcp",
  "description": "Notion database integration",
  "test_cases": [
    {
      "env_vars": ["NOTION_API_KEY"],
      "expected": "ok",
      "id": "notion-connection",
      "mode": "comprehensive",
      "name": "Connection Test",
      "operation": "health_check",
      "requires_auth": true,
      "timeout": 15,
      "type": "functional"
    },
    {
      "expected_type": "array",
      "id": "notion-list-databases",
      "min_items": 1,
      "mode": "comprehensive",
      "name": "List Databases",
      "operation": "list_databases",
      "timeout": 20,
      "type": "functional"
    },
    {
      "expected_type": "array",
      "id": "notion-query",
      "mode": "comprehensive",
      "name": "Query Database",
      "operation": "query",
      "params": {
        "database_id": "test-db-id",
        "filter": {}
      },
      "type": "functional"
    }
  ]
}
```

**Testing checklist for MCP servers:**

- [ ] Server can be reached/connected
- [ ] Authentication works
- [ ] All operations are available
- [ ] Returns correct data types
- [ ] Handles errors gracefully
- [ ] Response times are acceptable
- [ ] Thread-safe for concurrent calls

### D. Testing Hooks

**Example: Test deployment hook**

```json
{
  "component_id": "deploy-hook",
  "component_type": "hook",
  "description": "Auto-deploy on git push",
  "test_cases": [
    {
      "id": "deploy-hook-smoke",
      "mode": "quick",
      "name": "Hook Exists",
      "type": "smoke"
    },
    {
      "can_modify_system": true,
      "env_vars": ["DEPLOY_TOKEN"],
      "event": "on:git-push",
      "event_data": {
        "branch": "main",
        "commits": 1
      },
      "expected": "deployment started",
      "id": "deploy-hook-trigger",
      "mode": "comprehensive",
      "name": "Triggers on Event",
      "timeout": 60,
      "type": "functional"
    },
    {
      "event": "on:git-push",
      "expected": "rollback initiated",
      "id": "deploy-hook-rollback",
      "mode": "comprehensive",
      "name": "Handles Failures",
      "simulate_failure": true,
      "timeout": 60,
      "type": "functional"
    }
  ]
}
```

**Testing checklist for hooks:**

- [ ] Hook triggers on correct event
- [ ] Receives event data correctly
- [ ] Executes action successfully
- [ ] Handles failures gracefully
- [ ] Can be disabled/enabled
- [ ] Has audit logging
- [ ] Can be tested without side effects (dry-run)

### E. Testing Agents

**Example: Test code analyzer agent**

```json
{
  "component_id": "code-analyzer",
  "component_type": "agent",
  "description": "AI-powered code analysis agent",
  "test_cases": [
    {
      "id": "analyzer-smoke",
      "mode": "quick",
      "name": "Agent Loads",
      "type": "smoke"
    },
    {
      "expected": ["quality", "issues", "suggestions"],
      "id": "analyzer-analyze",
      "input": {
        "code": "function test() { return true; }",
        "language": "javascript"
      },
      "mode": "comprehensive",
      "name": "Analyzes Code",
      "task": "analyze",
      "timeout": 30,
      "type": "functional"
    },
    {
      "id": "analyzer-performance",
      "input_size": "large_file",
      "max_execution_time_ms": 30000,
      "mode": "comprehensive",
      "name": "Handles Large Files",
      "task": "analyze",
      "type": "performance"
    }
  ]
}
```

**Testing checklist for agents:**

- [ ] Agent initializes correctly
- [ ] Can process various input types
- [ ] Produces structured output
- [ ] Handles edge cases
- [ ] Performance is acceptable
- [ ] Memory usage is reasonable
- [ ] Provides useful context

---

## Advanced Testing

### Performance Benchmarking

Test and track component performance over time:

```json
{
  "allow_regression_ms": 200,
  "args": ["TASK-001"],
  "baseline": {
    "execution_time_ms": 1800,
    "memory_usage_mb": 25,
    "token_estimate": 450
  },
  "command": "pm:context",
  "id": "pm-context-benchmark",
  "mode": "comprehensive",
  "name": "Performance Benchmark",
  "performance": {
    "max_execution_time_ms": 10000,
    "max_token_estimate": 5000,
    "memory_limit_mb": 100,
    "target_execution_time_ms": 2000
  },
  "track_history": true,
  "type": "performance"
}
```

Run benchmark:

```bash
/test:command pm:context --args "TASK-001" --mode comprehensive --report
```

### Testing with Environment Variables

Test components that depend on environment configuration:

```json
{
  "command": "deploy",
  "env_vars": {
    "DEBUG": "true",
    "DEPLOY_TOKEN": "test-token-xyz",
    "ENVIRONMENT": "staging",
    "SLACK_WEBHOOK": "https://hooks.slack.com/..."
  },
  "expected": "deployment complete",
  "id": "deploy-with-env",
  "mode": "comprehensive",
  "name": "Deploy with Custom Env",
  "type": "functional"
}
```

Run with environment:

```bash
/test:command deploy --env "ENVIRONMENT=staging" --env "DEBUG=true" --mode comprehensive
```

### Integration Testing

Test multiple components working together:

```json
{
  "dependencies": ["pm:next", "pm:context", "pm:start", "pm:complete"],
  "description": "Test complete task workflow: next → context → start → complete",
  "id": "pm-workflow-integration",
  "mode": "comprehensive",
  "name": "Complete PM Workflow",
  "steps": [
    {
      "capture_output": true,
      "command": "pm:next",
      "expected": "Ready Tasks",
      "step": 1
    },
    {
      "args": ["${CAPTURED_TASK_ID}"],
      "command": "pm:context",
      "expected": "dependencies",
      "step": 2
    },
    {
      "args": ["${CAPTURED_TASK_ID}"],
      "command": "pm:start",
      "expected": "in-progress",
      "step": 3
    },
    {
      "args": ["${CAPTURED_TASK_ID}"],
      "command": "pm:complete",
      "expected": "completed",
      "step": 4
    }
  ],
  "timeout": 60,
  "type": "integration"
}
```

### Error Scenario Testing

Test how components handle failures:

```json
{
  "args": ["TASK-001"],
  "cleanup": {
    "restore_files": ["vtm.json"]
  },
  "command": "pm:context",
  "expected_error_contains": "not found",
  "id": "pm-context-missing-file",
  "mode": "comprehensive",
  "name": "Handle Missing VTM File",
  "precondition": {
    "remove_files": ["vtm.json"]
  },
  "should_fail": true,
  "type": "functional"
}
```

### Snapshot Testing

Test complex output against saved snapshots:

```json
{
  "allow_snapshot_update": true,
  "command": "pm:stats",
  "id": "pm-stats-snapshot",
  "mode": "comprehensive",
  "name": "Stats Output Snapshot",
  "snapshot_file": ".claude/test-snapshots/pm-stats.json",
  "type": "functional",
  "use_snapshot": true
}
```

---

## Best Practices

### 1. Test Naming

Use clear, descriptive test names:

```json
{
  "description": "Test pm:next with no arguments", // ✅ Detailed
  "id": "pm-next-default", // ✅ Clear
  "name": "Default Behavior" // ✅ Descriptive
}
```

NOT:

```json
{
  "id": "test1", // ❌ Too vague
  "name": "Test" // ❌ Not descriptive
}
```

### 2. Independent Tests

Each test should be independent:

```json
{
  "cleanup": {
    "teardown": ["remove test data"]
  },
  "id": "test-a",
  "precondition": {
    "setup": ["create test data"]
  }
}
```

### 3. Single Assertion

Test one thing per test case:

```json
{
  "expected": "Ready Tasks",
  // ✅ Tests one thing: output format
  "id": "pm-next-returns-list"
}
```

NOT:

```json
{
  "expected": ["Ready Tasks", "Status", "Risk", "Duration"],
  // ❌ Tests too many things
  "id": "pm-next-full-test"
}
```

### 4. Meaningful Timeouts

Set realistic timeouts:

```json
{
  "id": "pm-context-quick",
  "timeout": 10      // ✅ 10s for simple command
},
{
  "id": "notion-query-complex",
  "timeout": 60      // ✅ 60s for network call
}
```

### 5. Clear Expected Values

Use specific, testable expectations:

```json
{
  "expected": "Ready Tasks", // ✅ Specific, exact match
  "id": "test-a"
}
```

NOT:

```json
{
  "expected": "task", // ❌ Too generic, many false positives
  "id": "test-a"
}
```

### 6. Document Why

Explain the purpose of complex tests:

```json
{
  "description": "Verify compact mode reduces token usage",
  "id": "pm-context-compact",
  "name": "Compact Mode",
  "notes": "Compact mode should use 70% fewer tokens than full context",
  "performance": {
    "compact_context_tokens": 1000,
    "expected_reduction_percent": 70,
    "full_context_tokens": 5000
  }
}
```

### 7. Test Both Success and Failure

Test happy path AND edge cases:

```json
[
  {
    "args": ["TASK-001"],
    "id": "pm-context-valid-task",
    "name": "Valid Task",
    "should_pass": true
  },
  {
    "args": ["INVALID-999"],
    "expected_error": "not found",
    "id": "pm-context-invalid-task",
    "name": "Invalid Task",
    "should_fail": true
  }
]
```

---

## Troubleshooting

### Test Fails: "Component not found"

**Cause:** Component file doesn't exist at expected location

**Solution:**

```bash
# Find component
find .claude -name "*component-name*" -type f

# Verify it's in correct directory
ls -la .claude/commands/component-name.md

# Check component metadata
head -10 .claude/commands/component-name.md
```

### Test Fails: "Expected output not found"

**Cause:** Component output differs from expectation

**Solution:**

```bash
# Run without expected filter to see actual output
/test:command pm:next --mode comprehensive

# Verify expected string
# Update test case if output is correct:
{
  "expected": "actual output string"
}
```

### Test Fails: "Timeout"

**Cause:** Component takes longer than timeout

**Solution:**

```bash
# Increase timeout
/test:command pm:context --timeout 60 --mode comprehensive

# Or update test case
{
  "timeout": 60,  // Increased from 30
  "performance": {
    "max_execution_time_ms": 60000
  }
}

# Check for performance issues
/test:command pm:context --args "TASK-001" --mode comprehensive --report
# Review metrics in HTML report
```

### Test Fails: "Dependency resolution failed"

**Cause:** Component depends on missing resource

**Solution:**

```bash
# Verify dependency exists
/test:command dependency-name --mode quick

# Check metadata
grep "dependencies:" .claude/commands/component.md

# Update dependency reference if needed
# Re-run test
/test:command my-component --mode comprehensive
```

### Test Fails: "Environment variable not found"

**Cause:** Test expects env var that's not set

**Solution:**

```bash
# Set environment variable
/test:command deploy --env "API_KEY=xyz" --mode comprehensive

# Or update test case
{
  "env_vars": ["API_KEY"],
  "default_env_values": {
    "API_KEY": "test-key"
  }
}
```

---

## Running Test Suites

Pre-built test suites are available for common scenarios:

### Quick Smoke Tests

```bash
# Test all PM domain commands quickly
/test:command pm:next --mode quick
/test:command pm:context --mode quick
/test:command pm:start --mode quick
/test:command pm:complete --mode quick
```

### Full PM Domain Tests

```bash
# Run comprehensive suite
/test:suite pm-domain-comprehensive --mode comprehensive --report
```

### Integration Tests

```bash
# Test cross-component workflows
/test:suite integration-tests --mode comprehensive --report
```

### Performance Benchmarks

```bash
# Measure and track performance
/test:suite performance-benchmarks --mode comprehensive --report --baseline
```

---

## Creating a Test Configuration

Add test metadata to your component file:

```markdown
---
test:
  quick: "/test:command my-command --mode quick"
  full: "/test:command my-command --mode comprehensive --expected 'output'"
  timeout: 30
---

# My Command

Description...
```

---

## Next Steps

1. **Run Your First Test**

   ```bash
   /test:command pm:next --mode comprehensive
   ```

2. **Create Test Cases**
   - Add entries to `.claude/lib/test-templates.json`
   - Use examples from this guide

3. **Generate Reports**

   ```bash
   /test:command my-component --mode comprehensive --report
   ```

4. **Share Results**
   - Send HTML report to team
   - Commit test cases to version control

---

## Related Documentation

- `/test:command` - Command specification
- `.claude/lib/test-framework.ts` - Testing engine
- `.claude/lib/test-templates.json` - Test case library
- `.claude/test-results/` - Test reports and results

## Support

For questions or issues:

1. Check troubleshooting section above
2. Review test examples in test-templates.json
3. Check component documentation
4. Ask Claude Code for help
