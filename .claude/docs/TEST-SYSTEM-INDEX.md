# Test System Documentation Index

Complete reference guide to the `/test:command` component testing system.

## Overview

A comprehensive testing framework for validating Claude Code components across five test dimensions:
- **Smoke Tests** - Component exists and loads
- **Functional Tests** - Produces expected output
- **Integration Tests** - Works with dependencies
- **Performance Tests** - Meets speed/token requirements
- **Quality Tests** - Production standards met

**Start here:** [Quick Reference](./TEST-COMMAND-QUICK-REFERENCE.md)

---

## Documentation Hierarchy

### 1. Quick Reference (5 min read)
**File:** `.claude/TEST-COMMAND-QUICK-REFERENCE.md`

Best for: Getting started quickly, finding common commands

**Contains:**
- 30-second quick start
- Common command examples
- Test type overview
- Troubleshooting checklists
- Pre-built test cases list

**When to read:** First time setup, quick lookups

---

### 2. Command Specification (15 min read)
**File:** `.claude/commands/test-command.md`

Best for: Understanding the `/test:command` interface

**Contains:**
- Full command syntax
- Parameter documentation
- Usage examples
- Test result formats
- Registry integration
- Common issues and solutions
- Integration with workflow

**When to read:** Learning the command, creating custom tests

**Key Sections:**
- Usage examples with real commands
- Success and failure output formats
- Test case library
- How to extend tests
- Integration with other commands

---

### 3. Complete Testing Guide (30 min read)
**File:** `.claude/TEST-GUIDE.md`

Best for: Writing and maintaining comprehensive tests

**Contains:**
- Test types overview (detailed)
- Test case structure and templates
- Testing different component types:
  - Slash commands
  - Skills (auto-discovery)
  - MCP servers
  - Hooks
  - Agents
- Advanced testing patterns
- Best practices
- Troubleshooting guide

**When to read:** Creating custom tests, advanced scenarios

**Key Sections:**
- 5 test case structure examples (minimal to complete)
- Testing checklists for each component type
- Advanced patterns (benchmarking, env vars, integration)
- 7 best practices with examples
- Detailed troubleshooting

---

### 4. Implementation Summary (20 min read)
**File:** `.claude/IMPLEMENTATION-SUMMARY-test-command.md`

Best for: Understanding architecture and design

**Contains:**
- Architecture overview
- All 4 deliverables explained
- Test lifecycle flow
- Deep dive into each test type
- Performance characteristics
- Quality assurance details
- Extensibility points

**When to read:** Architecture review, team documentation

**Key Sections:**
- Complete architecture with diagrams
- Test framework classes and methods
- Pre-built test templates breakdown
- Performance metrics table
- Integration points with other layers

---

### 5. Framework Implementation (Developer reference)
**File:** `.claude/lib/test-framework.ts`

Best for: Understanding the code, extending framework

**Contains:**
- TypeScript implementation
- Test result interfaces
- 5 test methods (smoke, functional, integration, performance, quality)
- Helper methods for execution
- HTML report generation
- Error handling patterns

**When to read:** Contributing to framework, debugging tests

**Key Classes:**
- `TestFramework` - Main testing orchestrator
- Test result interfaces for all 5 types
- Component metadata interface

---

### 6. Test Case Library (Reference)
**File:** `.claude/lib/test-templates.json`

Best for: Finding pre-built test cases, template examples

**Contains:**
- 7 component test templates
- 25+ pre-built test cases
- 5 test suite configurations
- 4 test profiles (default, CI, dev, pre-release)
- Expected outputs reference
- Performance thresholds
- Error scenarios

**When to read:** Creating similar tests, finding examples

**Included Templates:**
- PM domain (next, context, start, complete)
- PM expert skill
- Notion MCP
- Deploy hook
- Many more examples

---

## Quick Navigation by Task

### I want to...

#### ...test my component right now
1. Read: [Quick Reference](./TEST-COMMAND-QUICK-REFERENCE.md#quick-start-30-seconds)
2. Run: `/test:command my-component --mode comprehensive`
3. View: `.claude/test-results/report-*.html`

#### ...learn how to test components
1. Read: [Test Guide](./TEST-GUIDE.md) - "Quick Start" section
2. Follow: Step-by-step examples
3. Try: Run a test on existing component

#### ...create custom tests for my component
1. Read: [Test Guide](./TEST-GUIDE.md) - "Creating Test Cases" section
2. Reference: [Test Templates](./lib/test-templates.json) for examples
3. Add: Test cases to templates.json
4. Verify: Run `/test:command my-component --mode comprehensive`

#### ...test different component types
1. Read: [Test Guide](./TEST-GUIDE.md) - "Testing Different Component Types"
2. Choose: Your component type (command, skill, MCP, hook, agent)
3. Follow: Type-specific examples and checklist
4. Create: Custom tests

#### ...understand the architecture
1. Read: [Implementation Summary](./IMPLEMENTATION-SUMMARY-test-command.md)
2. Review: Architecture section with diagrams
3. Study: Test framework details
4. Explore: Integration points

#### ...extend or modify the framework
1. Read: [Implementation Summary](./IMPLEMENTATION-SUMMARY-test-command.md) - "Extensibility"
2. Study: [test-framework.ts](./lib/test-framework.ts) code
3. Implement: Custom test type or method
4. Test: Your implementation

#### ...troubleshoot a failing test
1. Check: [Quick Reference](./TEST-COMMAND-QUICK-REFERENCE.md#troubleshooting) "Troubleshooting" section
2. Reference: [Test Guide](./TEST-GUIDE.md#troubleshooting) detailed troubleshooting
3. Run: Test with verbose output
4. Fix: Based on error message and suggestions

#### ...set up testing for my team
1. Read: [Command Spec](./commands/test-command.md) - "Integration with Workflow"
2. Review: [Test Templates](./lib/test-templates.json) - "Test Configurations"
3. Create: Team-specific test profiles
4. Share: Pre-built test suites

#### ...integrate tests into CI/CD
1. Read: [Implementation Summary](./IMPLEMENTATION-SUMMARY-test-command.md) - "Integration Points"
2. Review: Test Templates - "ci_pipeline" configuration
3. Use: Mode: `comprehensive`, `fail_on_warning: true`
4. Generate: Reports for artifacts

---

## File Organization

```
.claude/
├── commands/
│   └── test-command.md                    [Command Specification]
│       ↓ Main command interface
│       • Syntax and parameters
│       • Usage examples
│       • Output formats
│       • Integration guide
│
├── lib/
│   ├── test-framework.ts                  [Framework Implementation]
│   │   ↓ Testing engine (TypeScript)
│   │   • 5 test type implementations
│   │   • HTML report generation
│   │   • Error handling
│   │
│   └── test-templates.json                [Test Case Library]
│       ↓ Pre-built test cases
│       • 25+ test cases
│       • Test configurations
│       • Performance thresholds
│
├── test-results/                          [Test Output]
│   ├── result-*.json                      • JSON results
│   └── report-*.html                      • HTML reports
│
├── TEST-COMMAND-QUICK-REFERENCE.md        [Quick Reference]
│   ↓ 30-second startup
│   • Common commands
│   • Quick examples
│   • Troubleshooting
│
├── TEST-GUIDE.md                          [Complete Guide]
│   ↓ Comprehensive testing guide
│   • Test type overview
│   • All component types
│   • Advanced patterns
│   • Best practices
│
├── IMPLEMENTATION-SUMMARY-test-command.md [Architecture Details]
│   ↓ Design and structure
│   • Complete architecture
│   • Test lifecycle
│   • Integration points
│
└── TEST-SYSTEM-INDEX.md                   [This File]
    ↓ Navigation guide
    • Documentation hierarchy
    • Quick navigation by task
    • Cross-references
```

---

## Key Concepts

### Test Modes

**Quick Mode (500ms)**
- Smoke test only
- Verifies component exists
- Can be invoked

**Comprehensive Mode (10-30s)**
- All 5 test types
- Validates functionality
- Checks performance
- Generates detailed report

### Test Types

1. **Smoke Test** - Does it exist? (100-500ms)
2. **Functional Test** - Does it work? (1-5s)
3. **Integration Test** - Does it work with others? (2-10s)
4. **Performance Test** - Is it fast enough? (varies)
5. **Quality Test** - Is it production-ready? (500ms-2s)

### Component Types

- **Command** - Slash commands (`/pm:next`)
- **Skill** - Auto-discovery triggers
- **MCP** - External system integration
- **Hook** - Event-driven automation
- **Agent** - AI-powered workers

---

## Cross-References

### By Component Type

**Testing Slash Commands**
- Quick Start: [Quick Reference](./TEST-COMMAND-QUICK-REFERENCE.md#test-slash-commands)
- Detailed Guide: [Test Guide](./TEST-GUIDE.md#a-testing-slash-commands)
- Examples: [test-templates.json](./lib/test-templates.json#pmcomponents)

**Testing Skills**
- Quick Start: [Quick Reference](./TEST-COMMAND-QUICK-REFERENCE.md#test-skills)
- Detailed Guide: [Test Guide](./TEST-GUIDE.md#b-testing-skills-auto-discovery)
- Examples: [test-templates.json](./lib/test-templates.json#pm-expert)

**Testing MCP Servers**
- Quick Start: [Quick Reference](./TEST-COMMAND-QUICK-REFERENCE.md#test-mcp-servers)
- Detailed Guide: [Test Guide](./TEST-GUIDE.md#c-testing-mcp-servers)
- Examples: [test-templates.json](./lib/test-templates.json#notion-mcp)

**Testing Hooks**
- Quick Start: [Quick Reference](./TEST-COMMAND-QUICK-REFERENCE.md#test-hooks)
- Detailed Guide: [Test Guide](./TEST-GUIDE.md#d-testing-hooks)
- Examples: [test-templates.json](./lib/test-templates.json#deploy-hook)

**Testing Agents**
- Detailed Guide: [Test Guide](./TEST-GUIDE.md#e-testing-agents)

### By Difficulty Level

**Beginner**
1. [Quick Reference](./TEST-COMMAND-QUICK-REFERENCE.md) - 5 min
2. [Test Guide - Quick Start](./TEST-GUIDE.md#quick-start) - 10 min
3. Try: `/test:command pm:next --mode quick`

**Intermediate**
1. [Command Specification](./commands/test-command.md) - 20 min
2. [Test Guide - Full](./TEST-GUIDE.md) - 30 min
3. Create custom test cases

**Advanced**
1. [Implementation Summary](./IMPLEMENTATION-SUMMARY-test-command.md) - 20 min
2. [test-framework.ts](./lib/test-framework.ts) - code review
3. Extend framework for custom needs

---

## Statistics

| File | Lines | Size | Purpose |
|------|-------|------|---------|
| test-command.md | 559 | 14KB | Command spec |
| test-framework.ts | 893 | 28KB | Framework |
| test-templates.json | 526 | 15KB | Test cases |
| TEST-GUIDE.md | 942 | 19KB | Guide |
| IMPLEMENTATION-SUMMARY-test-command.md | 628 | 15KB | Details |
| TEST-COMMAND-QUICK-REFERENCE.md | 290 | 7KB | Quick ref |
| **TOTAL** | **3,838** | **98KB** | Complete system |

---

## Recommended Reading Order

### For Users (Want to test components)
1. [Quick Reference](./TEST-COMMAND-QUICK-REFERENCE.md) - 5 min
2. [Test Guide - Quick Start](./TEST-GUIDE.md#quick-start) - 10 min
3. [Command Specification](./commands/test-command.md) - 20 min

### For Developers (Want to create tests)
1. [Quick Reference](./TEST-COMMAND-QUICK-REFERENCE.md) - 5 min
2. [Test Guide](./TEST-GUIDE.md) - 30 min (all sections)
3. [test-templates.json](./lib/test-templates.json) - reference as needed

### For Architects (Want to understand design)
1. [Implementation Summary](./IMPLEMENTATION-SUMMARY-test-command.md) - 20 min
2. [Command Specification](./commands/test-command.md) - 20 min
3. [test-framework.ts](./lib/test-framework.ts) - code review

### For Contributors (Want to extend framework)
1. [Implementation Summary](./IMPLEMENTATION-SUMMARY-test-command.md) - Extensibility - 10 min
2. [test-framework.ts](./lib/test-framework.ts) - 30 min code review
3. Design and implement custom test type

---

## Quick Links Summary

| Task | Link |
|------|------|
| Get started in 30 seconds | [Quick Reference](./TEST-COMMAND-QUICK-REFERENCE.md#quick-start-30-seconds) |
| Learn test commands | [Quick Reference](./TEST-COMMAND-QUICK-REFERENCE.md#common-commands) |
| Create custom tests | [Test Guide](./TEST-GUIDE.md#creating-test-cases) |
| Test my component type | [Test Guide](./TEST-GUIDE.md#testing-different-component-types) |
| Troubleshoot failure | [Quick Reference](./TEST-COMMAND-QUICK-REFERENCE.md#troubleshooting) or [Test Guide](./TEST-GUIDE.md#troubleshooting) |
| Understand architecture | [Implementation Summary](./IMPLEMENTATION-SUMMARY-test-command.md) |
| See code | [test-framework.ts](./lib/test-framework.ts) |
| Find test examples | [test-templates.json](./lib/test-templates.json) |

---

## Support Resources

**Can't find what you're looking for?**

1. Check the appropriate file from the [Quick Navigation](#quick-navigation-by-task) section
2. Search within files: `grep -r "your-term" .claude/`
3. Review [test-templates.json](./lib/test-templates.json) for examples
4. Ask Claude Code for help on specific components

**Common Questions:**

- **How do I test X?** → [Test Guide - Testing Different Component Types](./TEST-GUIDE.md#testing-different-component-types)
- **Why did my test fail?** → [Troubleshooting](./TEST-GUIDE.md#troubleshooting)
- **How do I create custom tests?** → [Creating Test Cases](./TEST-GUIDE.md#creating-test-cases)
- **What are the test types?** → [Test Types Overview](./TEST-GUIDE.md#test-types-overview)
- **How do I run tests?** → [Quick Reference - Common Commands](./TEST-COMMAND-QUICK-REFERENCE.md#common-commands)

---

## Last Updated

- **Test System Version:** 1.0
- **Documentation Date:** October 29, 2025
- **Status:** Production Ready

For updates or issues, refer to the implementation summary or component specification.

---

**Everything you need to test Claude Code components in one place.**
