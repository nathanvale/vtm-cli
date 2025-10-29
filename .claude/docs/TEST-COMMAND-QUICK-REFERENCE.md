# Test Command - Quick Reference

Comprehensive component testing system for Claude Code. Test any component in seconds.

## Installation

No installation needed! Files are already in place:

```
.claude/
├── commands/test-command.md            ← Command specification
├── lib/test-framework.ts               ← Testing engine
├── lib/test-templates.json             ← Pre-built test cases
├── TEST-GUIDE.md                       ← Complete testing guide
└── IMPLEMENTATION-SUMMARY-test-command.md  ← Implementation details
```

## Quick Start (30 seconds)

```bash
# 1. Test a command
/test:command pm:next --mode quick

# 2. Run comprehensive test
/test:command pm:next --mode comprehensive

# 3. Generate report
/test:command pm:next --mode comprehensive --report

# Done! Check .claude/test-results/ for HTML report
```

## Common Commands

### Test Slash Commands
```bash
/test:command pm:next --mode comprehensive
/test:command pm:context --args "TASK-001" --mode comprehensive
/test:command pm:start --args "TASK-001" --mode comprehensive
/test:command pm:complete --args "TASK-001" --mode comprehensive
```

### Test Skills
```bash
/test:command pm-expert --mode comprehensive
```

### Test MCP Servers
```bash
/test:command notion-mcp --mode comprehensive
```

### Test Hooks
```bash
/test:command deploy-hook --env "TOKEN=xyz" --mode comprehensive
```

## Test Modes

### Quick Mode (500ms)
- Smoke test only
- Verifies component exists
- Can be invoked

```bash
/test:command pm:next --mode quick
```

### Comprehensive Mode (10-30s)
- All 5 test types
- Validates functionality
- Checks performance
- Generates detailed report

```bash
/test:command pm:next --mode comprehensive
```

## Options Cheat Sheet

```bash
# Basic
/test:command {name}

# With arguments
/test:command {name} --args "arg1 arg2"

# With expected output
/test:command {name} --expected "output string"

# With timeout
/test:command {name} --timeout 60

# With environment variables
/test:command {name} --env "KEY=value" --env "KEY2=value2"

# Generate report
/test:command {name} --report

# Full example
/test:command pm:context --args "TASK-001" --mode comprehensive --expected "dependencies" --timeout 30 --report
```

## Test Types

| Type | Checks | Time | Always Run |
|------|--------|------|-----------|
| **Smoke** | Exists, valid, parseable | 100-500ms | ✅ Yes |
| **Functional** | Output correct | 1-5s | If comprehensive |
| **Integration** | Dependencies work | 2-10s | If comprehensive |
| **Performance** | Fast enough | varies | If comprehensive |
| **Quality** | Production ready | 500ms-2s | If comprehensive |

## Pre-built Test Cases

PM Domain:
- `pm:next` - 4 test cases
- `pm:context` - 5 test cases
- `pm:start` - 3 test cases
- `pm:complete` - 2 test cases
- `pm-expert` - 2 test cases

Integration:
- `notion-mcp` - 3 test cases
- `deploy-hook` - 2 test cases

## Test Results

### Success
```
✅ Component Test Results
━━━━━━━━━━━━━━━━━━━━━━━━━
Status: PASSED
Tests: 5/5
Duration: 2.3s
Tokens: 450
```

### Failure
```
❌ Component Test Results
━━━━━━━━━━━━━━━━━━━━━━━━━
Status: FAILED
Error: Expected "output" not found
Fix: Check component documentation
```

## Output Files

After running test with `--report`:

```
.claude/test-results/
├── result-{name}-{timestamp}.json    ← JSON results
└── report-{name}-{timestamp}.html    ← HTML report
```

## Troubleshooting

### "Component not found"
```bash
# Find the component
find .claude -name "*component-name*"

# Verify metadata
head -10 .claude/commands/component-name.md
```

### "Expected output not found"
```bash
# Run without filter to see actual output
/test:command pm:next --mode comprehensive

# Check what you actually got, then update test
```

### "Timeout"
```bash
# Increase timeout
/test:command pm:context --timeout 60

# Or check for performance bottlenecks
/test:command pm:context --mode comprehensive --report
```

### "Dependency not found"
```bash
# Test the dependency first
/test:command dependency-name --mode quick

# Then test your component
/test:command my-command --mode comprehensive
```

## Creating Custom Tests

### Add to test-templates.json

```json
{
  "my-command": {
    "component_type": "command",
    "test_cases": [
      {
        "id": "my-test-1",
        "name": "Basic Test",
        "mode": "comprehensive",
        "command": "my-command",
        "expected": "expected output"
      }
    ]
  }
}
```

### Add test metadata to command

```markdown
---
test:
  quick: "/test:command my-command --mode quick"
  full: "/test:command my-command --mode comprehensive"
  timeout: 30
---
```

## Performance Targets

| Component | Max Time | Max Tokens |
|-----------|----------|-----------|
| pm:next | 5s | 1,000 |
| pm:context | 10s | 5,000 |
| pm:start | 5s | 500 |
| pm:complete | 5s | 500 |

## Integration with Workflow

```
Create command
    ↓
Test it: /test:command my-command --mode quick
    ↓
Full test: /test:command my-command --mode comprehensive
    ↓
Generate report: --report
    ↓
Share results
    ↓
Improve based on feedback
```

## Related Commands

- `/design:domain` - Design before building
- `/scaffold:domain` - Generate structure
- `/registry:scan` - Find all components
- `/quality:check` - Comprehensive validation
- `/test:integration` - Test component interactions

## Documentation Files

| File | Purpose |
|------|---------|
| `test-command.md` | Full command specification |
| `test-framework.ts` | Testing engine (TypeScript) |
| `test-templates.json` | Pre-built test library |
| `TEST-GUIDE.md` | Complete testing guide |
| `IMPLEMENTATION-SUMMARY-test-command.md` | Architecture & details |

## Statistics

- **Total Lines:** 3,548
- **Code (TypeScript):** 893 lines
- **Documentation:** 2,655 lines
- **Test Cases:** 25+ pre-built
- **Test Types:** 5
- **Component Templates:** 7

## Example Workflows

### Smoke Test All Components
```bash
for cmd in pm:next pm:context pm:start pm:complete; do
  /test:command $cmd --mode quick
done
```

### Full Test Suite with Reports
```bash
/test:command pm:next --mode comprehensive --report
/test:command pm:context --args "TASK-001" --mode comprehensive --report
/test:command pm-expert --mode comprehensive --report
```

### Performance Benchmark
```bash
/test:command pm:context --args "TASK-001" --timeout 30 --mode comprehensive --report
```

### Test with Environment
```bash
/test:command deploy --env "ENV=staging" --env "TOKEN=abc" --mode comprehensive --report
```

## Key Features

✅ **5 Test Types** - Smoke, Functional, Integration, Performance, Quality
✅ **Easy to Use** - One command per component
✅ **Pre-built Cases** - 25+ ready to use
✅ **Extensible** - Easy to add custom tests
✅ **Detailed Reports** - HTML, JSON, Console output
✅ **Error Handling** - Helpful messages
✅ **Performance Tracking** - Metrics and benchmarks
✅ **Production Ready** - Timeouts, error recovery, cleanup

## Quick Help

```bash
# See command help
/test:command --help

# Learn more
cat .claude/commands/test-command.md

# See examples
cat .claude/lib/test-templates.json

# Full guide
cat .claude/TEST-GUIDE.md

# Implementation details
cat .claude/IMPLEMENTATION-SUMMARY-test-command.md
```

## Next Steps

1. **Try it** - Run `/test:command pm:next --mode quick`
2. **Create tests** - Add entries to test-templates.json
3. **Generate reports** - Use `--report` flag
4. **Share results** - Send HTML reports to team
5. **Improve** - Use recommendations to fix issues

---

**Start testing in seconds. Validate components in minutes. Ship with confidence.**
