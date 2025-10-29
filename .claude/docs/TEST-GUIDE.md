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
      "id": "unique-test-id",
      "name": "Human-readable test name",
      "mode": "quick|comprehensive",
      "type": "smoke|functional|integration|performance|quality",
      "description": "What this test validates",
      "command": "my-command",
      "args": ["arg1", "arg2"],
      "expected": "Expected output string",
      "timeout": 30,
      "should_pass": true,
      "notes": "Additional context"
    }
  ]
}
```

### Minimal Test Case

Simplest possible test case:

```json
{
  "id": "basic-smoke",
  "name": "Basic Smoke Test",
  "mode": "quick",
  "type": "smoke",
  "command": "my-command"
}
```

### Complete Test Case

Full-featured test case:

```json
{
  "id": "pm-context-full",
  "name": "Context with All Options",
  "mode": "comprehensive",
  "type": "functional",
  "description": "Test context generation with all available options",
  "command": "pm:context",
  "args": ["TASK-001", "--compact"],
  "expected": "dependencies",
  "timeout": 15,
  "should_pass": true,
  "side_effects": {
    "reads_file": true,
    "modifies_state": false,
    "network_call": false
  },
  "requires": ["TASK-001 in vtm.json"],
  "notes": "Compact mode should reduce token usage significantly",
  "performance": {
    "max_execution_time_ms": 5000,
    "expected_tokens": 500
  },
  "env_vars": ["DEBUG=false"]
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
      "id": "pm-next-default",
      "name": "Default Behavior",
      "mode": "comprehensive",
      "type": "functional",
      "command": "pm:next",
      "expected": "Ready Tasks",
      "timeout": 10
    },
    {
      "id": "pm-next-custom-count",
      "name": "Custom Count",
      "mode": "comprehensive",
      "type": "functional",
      "command": "pm:next",
      "args": ["--number", "20"],
      "expected": "Tasks",
      "timeout": 10
    },
    {
      "id": "pm-next-no-tasks",
      "name": "Handle Empty List",
      "mode": "comprehensive",
      "type": "functional",
      "command": "pm:next",
      "expected_output_pattern": "No tasks|Tasks|Ready"
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
      "name": "Skill Exists",
      "mode": "quick",
      "type": "smoke",
      "trigger_phrases": ["what should I work on", "next task"]
    },
    {
      "id": "pm-expert-trigger",
      "name": "Trigger Detection",
      "mode": "comprehensive",
      "type": "functional",
      "trigger_input": "What should I work on?",
      "expected": "TASK",
      "should_activate": true
    },
    {
      "id": "pm-expert-context",
      "name": "Provides Context",
      "mode": "comprehensive",
      "type": "functional",
      "trigger_input": "Tell me what to do next",
      "expected_output": ["task id", "description", "estimated hours"]
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
      "id": "notion-connection",
      "name": "Connection Test",
      "mode": "comprehensive",
      "type": "functional",
      "operation": "health_check",
      "expected": "ok",
      "requires_auth": true,
      "env_vars": ["NOTION_API_KEY"],
      "timeout": 15
    },
    {
      "id": "notion-list-databases",
      "name": "List Databases",
      "mode": "comprehensive",
      "type": "functional",
      "operation": "list_databases",
      "expected_type": "array",
      "min_items": 1,
      "timeout": 20
    },
    {
      "id": "notion-query",
      "name": "Query Database",
      "mode": "comprehensive",
      "type": "functional",
      "operation": "query",
      "params": {
        "database_id": "test-db-id",
        "filter": {}
      },
      "expected_type": "array"
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
      "name": "Hook Exists",
      "mode": "quick",
      "type": "smoke"
    },
    {
      "id": "deploy-hook-trigger",
      "name": "Triggers on Event",
      "mode": "comprehensive",
      "type": "functional",
      "event": "on:git-push",
      "event_data": {
        "branch": "main",
        "commits": 1
      },
      "expected": "deployment started",
      "timeout": 60,
      "can_modify_system": true,
      "env_vars": ["DEPLOY_TOKEN"]
    },
    {
      "id": "deploy-hook-rollback",
      "name": "Handles Failures",
      "mode": "comprehensive",
      "type": "functional",
      "event": "on:git-push",
      "simulate_failure": true,
      "expected": "rollback initiated",
      "timeout": 60
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
      "name": "Agent Loads",
      "mode": "quick",
      "type": "smoke"
    },
    {
      "id": "analyzer-analyze",
      "name": "Analyzes Code",
      "mode": "comprehensive",
      "type": "functional",
      "task": "analyze",
      "input": {
        "code": "function test() { return true; }",
        "language": "javascript"
      },
      "expected": ["quality", "issues", "suggestions"],
      "timeout": 30
    },
    {
      "id": "analyzer-performance",
      "name": "Handles Large Files",
      "mode": "comprehensive",
      "type": "performance",
      "task": "analyze",
      "input_size": "large_file",
      "max_execution_time_ms": 30000
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
  "id": "pm-context-benchmark",
  "name": "Performance Benchmark",
  "mode": "comprehensive",
  "type": "performance",
  "command": "pm:context",
  "args": ["TASK-001"],
  "performance": {
    "max_execution_time_ms": 10000,
    "target_execution_time_ms": 2000,
    "max_token_estimate": 5000,
    "memory_limit_mb": 100
  },
  "baseline": {
    "execution_time_ms": 1800,
    "token_estimate": 450,
    "memory_usage_mb": 25
  },
  "allow_regression_ms": 200,
  "track_history": true
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
  "id": "deploy-with-env",
  "name": "Deploy with Custom Env",
  "mode": "comprehensive",
  "type": "functional",
  "command": "deploy",
  "env_vars": {
    "ENVIRONMENT": "staging",
    "DEPLOY_TOKEN": "test-token-xyz",
    "SLACK_WEBHOOK": "https://hooks.slack.com/...",
    "DEBUG": "true"
  },
  "expected": "deployment complete"
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
  "id": "pm-workflow-integration",
  "name": "Complete PM Workflow",
  "mode": "comprehensive",
  "type": "integration",
  "description": "Test complete task workflow: next → context → start → complete",
  "steps": [
    {
      "step": 1,
      "command": "pm:next",
      "expected": "Ready Tasks",
      "capture_output": true
    },
    {
      "step": 2,
      "command": "pm:context",
      "args": ["${CAPTURED_TASK_ID}"],
      "expected": "dependencies"
    },
    {
      "step": 3,
      "command": "pm:start",
      "args": ["${CAPTURED_TASK_ID}"],
      "expected": "in-progress"
    },
    {
      "step": 4,
      "command": "pm:complete",
      "args": ["${CAPTURED_TASK_ID}"],
      "expected": "completed"
    }
  ],
  "dependencies": ["pm:next", "pm:context", "pm:start", "pm:complete"],
  "timeout": 60
}
```

### Error Scenario Testing

Test how components handle failures:

```json
{
  "id": "pm-context-missing-file",
  "name": "Handle Missing VTM File",
  "mode": "comprehensive",
  "type": "functional",
  "command": "pm:context",
  "args": ["TASK-001"],
  "precondition": {
    "remove_files": ["vtm.json"]
  },
  "should_fail": true,
  "expected_error_contains": "not found",
  "cleanup": {
    "restore_files": ["vtm.json"]
  }
}
```

### Snapshot Testing

Test complex output against saved snapshots:

```json
{
  "id": "pm-stats-snapshot",
  "name": "Stats Output Snapshot",
  "mode": "comprehensive",
  "type": "functional",
  "command": "pm:stats",
  "use_snapshot": true,
  "snapshot_file": ".claude/test-snapshots/pm-stats.json",
  "allow_snapshot_update": true
}
```

---

## Best Practices

### 1. Test Naming

Use clear, descriptive test names:

```json
{
  "id": "pm-next-default",           // ✅ Clear
  "name": "Default Behavior",        // ✅ Descriptive
  "description": "Test pm:next with no arguments"  // ✅ Detailed
}
```

NOT:
```json
{
  "id": "test1",          // ❌ Too vague
  "name": "Test"          // ❌ Not descriptive
}
```

### 2. Independent Tests

Each test should be independent:

```json
{
  "id": "test-a",
  "precondition": {
    "setup": ["create test data"]
  },
  "cleanup": {
    "teardown": ["remove test data"]
  }
}
```

### 3. Single Assertion

Test one thing per test case:

```json
{
  "id": "pm-next-returns-list",
  "expected": "Ready Tasks"
  // ✅ Tests one thing: output format
}
```

NOT:
```json
{
  "id": "pm-next-full-test",
  "expected": ["Ready Tasks", "Status", "Risk", "Duration"]
  // ❌ Tests too many things
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
  "id": "test-a",
  "expected": "Ready Tasks"     // ✅ Specific, exact match
}
```

NOT:
```json
{
  "id": "test-a",
  "expected": "task"            // ❌ Too generic, many false positives
}
```

### 6. Document Why

Explain the purpose of complex tests:

```json
{
  "id": "pm-context-compact",
  "name": "Compact Mode",
  "description": "Verify compact mode reduces token usage",
  "notes": "Compact mode should use 70% fewer tokens than full context",
  "performance": {
    "full_context_tokens": 5000,
    "compact_context_tokens": 1000,
    "expected_reduction_percent": 70
  }
}
```

### 7. Test Both Success and Failure

Test happy path AND edge cases:

```json
[
  {
    "id": "pm-context-valid-task",
    "name": "Valid Task",
    "args": ["TASK-001"],
    "should_pass": true
  },
  {
    "id": "pm-context-invalid-task",
    "name": "Invalid Task",
    "args": ["INVALID-999"],
    "should_fail": true,
    "expected_error": "not found"
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
