# VTM Instruction Templates

This directory contains instruction templates for VTM task execution. These
templates provide detailed, prescriptive guidance on **HOW** to implement tasks,
complementing the task **context** (what needs to be built).

---

## Directory Structure

```
.claude/vtm/
├── README.md                           # This file
├── coding-standards.md                 # Comprehensive coding standards
├── instruction-templates/              # Strategy-specific templates
│   ├── tdd.md                         # TDD tasks (highest standards)
│   ├── unit.md                        # Unit test tasks
│   ├── integration.md                 # Integration test tasks
│   └── direct.md                      # Setup/config tasks
└── workflow-rules.md                   # Git workflow, commit format (future)
```

---

## What Are Instruction Templates?

### Context vs Instructions

**Context (ContextBuilder):**

- **WHAT** to build
- Descriptive information about the task
- Task details, acceptance criteria, dependencies
- ~2000 tokens (minimal) or ~500 tokens (compact)

**Instructions (InstructionBuilder):**

- **HOW** to build it
- Prescriptive guidance for implementation
- Coding standards, TDD workflow, validation requirements
- ~5000 tokens (comprehensive, for autonomous agent execution)

### Key Difference

| Aspect  | Context                    | Instructions                                                                    |
| ------- | -------------------------- | ------------------------------------------------------------------------------- |
| Purpose | Inform about task          | Guide implementation                                                            |
| Tone    | Descriptive                | Prescriptive                                                                    |
| Content | Task info                  | Standards, workflow, validation                                                 |
| Usage   | Human review               | Agent execution                                                                 |
| Example | "Implement authentication" | "Write JSDoc for all functions, follow TDD red-green-refactor with Wallaby MCP" |

---

## Template Overview

### 1. TDD Template (`tdd.md`)

**For tasks requiring Test-Driven Development.**

**Standards:**

- ✅ **Wallaby MCP MANDATORY** for Red-Green-Refactor cycle
- ✅ 100% JSDoc coverage (all functions, classes, types)
- ✅ ≥80% test coverage minimum
- ✅ Tests written BEFORE implementation
- ✅ Comprehensive validation (lint, test, build, TypeDoc)

**Wallaby MCP Tools:**

- `wallaby_failingTests` - Verify RED phase
- `wallaby_allTests` - Verify GREEN phase
- `wallaby_coveredLinesForFile` - Check coverage
- Full reference table included in template

**Use when:**

- High-risk implementation
- Core functionality
- Complex algorithms
- Public APIs

**Example tasks:**

- Implementing critical business logic
- Building new core features
- Refactoring high-risk code

---

### 2. Unit Template (`unit.md`)

**For tasks requiring unit tests after implementation.**

**Standards:**

- ✅ 90% JSDoc coverage (all exported functions)
- ✅ ≥70% test coverage minimum
- ✅ Tests written AFTER implementation
- ✅ Wallaby MCP optional (recommended)

**Use when:**

- Medium-risk implementation
- Standard feature development
- Function-level testing sufficient

**Example tasks:**

- Adding utility functions
- Implementing data transformations
- Creating helper modules

---

### 3. Integration Template (`integration.md`)

**For tasks requiring cross-component testing.**

**Standards:**

- ✅ 80% JSDoc coverage (public APIs and integration points)
- ✅ ≥60% test coverage minimum
- ✅ End-to-end workflow testing
- ✅ Real implementations (minimal mocking)

**Use when:**

- Multi-component features
- System behavior testing
- External integrations

**Example tasks:**

- Plan-to-VTM conversion workflow
- CLI command integration
- File system operations

---

### 4. Direct Template (`direct.md`)

**For setup, configuration, and documentation tasks.**

**Standards:**

- ✅ 50% JSDoc coverage (any code created)
- ✅ No test coverage requirement
- ✅ Manual verification
- ✅ Comprehensive documentation

**Use when:**

- Setup and configuration
- Documentation tasks
- Dependency management
- File organization

**Example tasks:**

- Setting up TypeDoc
- Writing README documentation
- Configuring build tools
- Organizing directory structure

---

## How Instructions Are Used

### Current Workflow (Context Only)

```
User: /vtm:work TASK-003
  ↓
ContextBuilder generates context (~2000 tokens)
  ↓
Main window displays context
  ↓
User implements in main window
```

### New Workflow (Instructions + Agent)

```
User: /vtm:execute TASK-003
  ↓
InstructionBuilder generates instructions (~5000 tokens)
  ↓
Task agent launched with instructions
  ↓
Agent implements autonomously
  ↓
Main window shows summary (~200 tokens)
```

### Review Workflow (Instructions Only)

```
User: /vtm:instructions TASK-003
  ↓
InstructionBuilder generates instructions
  ↓
Main window displays instructions for review
  ↓
User can modify or proceed to /vtm:execute
```

---

## Template Variables

All templates support variable interpolation using JavaScript template literals
syntax (`${variable}`):

| Variable                    | Description                   | Example                                                  |
| --------------------------- | ----------------------------- | -------------------------------------------------------- |
| `${task.id}`                | Task ID                       | TASK-042                                                 |
| `${task.title}`             | Task title                    | Implement instruction builder                            |
| `${task.description}`       | Task description              | Build InstructionBuilder class...                        |
| `${acceptanceCriteriaList}` | Formatted AC list             | - [ ] AC1<br>- [ ] AC2                                   |
| `${fileOperationsList}`     | Files to create/modify/delete | **Create:**<br>- src/lib/foo.ts                          |
| `${dependenciesList}`       | Completed dependencies        | - TASK-001: Database setup                               |
| `${sourceDocuments}`        | ADR/Spec references           | ADR: docs/adr/ADR-042.md<br>Spec: docs/specs/spec-042.md |

---

## Customization

### Project-Specific Templates

Copy templates and customize for your project:

```bash
cp .claude/vtm/instruction-templates/tdd.md .claude/vtm/instruction-templates/tdd-custom.md
```

Edit `tdd-custom.md` to add project-specific requirements:

- Custom linting rules
- Additional validation steps
- Project-specific coding patterns
- Team conventions

### Template Selection

InstructionBuilder selects templates based on `task.test_strategy`:

| test_strategy | Template Used    |
| ------------- | ---------------- |
| `TDD`         | `tdd.md`         |
| `Unit`        | `unit.md`        |
| `Integration` | `integration.md` |
| `Direct`      | `direct.md`      |

Override with custom templates:

```typescript
const builder = new InstructionBuilder({
  templatePath: ".claude/vtm/instruction-templates/tdd-custom.md",
})
```

---

## Coding Standards Reference

See `coding-standards.md` for comprehensive standards covering:

### Documentation

- JSDoc/TypeDoc requirements
- Required tags (@param, @returns, @throws, @example)
- Documentation examples

### TypeScript

- Type safety requirements
- No `any` types policy
- Strict mode requirements

### Testing

- Coverage targets by strategy
- Test structure best practices
- Mocking guidelines

### Code Quality

- ESLint and Prettier requirements
- Code style guidelines
- Performance standards

### Git

- Commit message format (Conventional Commits)
- Branch naming conventions
- Commit message examples

### Validation Commands

- Type checking: `pnpm build`
- Linting: `pnpm lint`
- Testing: `pnpm test`
- Coverage: `pnpm test -- --coverage`
- TypeDoc: `pnpm run docs`

---

## Standards by Test Strategy

| Standard            | TDD      | Unit     | Integration | Direct |
| ------------------- | -------- | -------- | ----------- | ------ |
| JSDoc Coverage      | 100%     | 90%      | 80%         | 50%    |
| Test Coverage       | ≥80%     | ≥70%     | ≥60%        | N/A    |
| Wallaby MCP         | Required | Optional | Optional    | N/A    |
| Examples            | Required | Optional | Optional    | N/A    |
| Manual Verification | No       | No       | Yes         | Yes    |

---

## Usage Examples

### Example 1: Review TDD Instructions

```bash
# Generate and review instructions
/vtm:instructions TASK-042

# Output shows:
# - Red-Green-Refactor workflow with Wallaby MCP
# - JSDoc requirements (100% coverage)
# - Test coverage requirements (≥80%)
# - Pre-flight and post-flight checklists
# - Validation commands
```

### Example 2: Execute with Agent

```bash
# Launch agent with TDD instructions
/vtm:execute TASK-042

# Agent receives:
# - Full TDD instructions (~5000 tokens)
# - Task context (description, ACs, dependencies)
# - Coding standards
# - Validation requirements

# Main window shows:
# - Agent progress summary
# - Final results (~200 tokens)
```

### Example 3: Unit Task with Manual Implementation

```bash
# Review unit instructions
/vtm:instructions TASK-043

# User implements manually using instructions as guide
# Instructions show:
# - Implement first, test after
# - 70% coverage target
# - JSDoc for exported functions
# - Optional Wallaby MCP usage
```

---

## Adding New Templates

### Step 1: Create Template File

```bash
# Create new template
touch .claude/vtm/instruction-templates/performance.md
```

### Step 2: Add Template Content

Use existing templates as reference. Include:

- Objective and acceptance criteria
- Test/verification strategy
- Coding standards
- Pre-flight checklist
- Implementation workflow
- Post-flight validation
- Success criteria

### Step 3: Register in InstructionBuilder

Update `InstructionBuilder` to recognize new strategy:

```typescript
const TEMPLATE_MAP = {
  TDD: "tdd.md",
  Unit: "unit.md",
  Integration: "integration.md",
  Direct: "direct.md",
  Performance: "performance.md", // New template
}
```

### Step 4: Update Task Type

Add new strategy to Task type:

```typescript
type TestStrategy = "TDD" | "Unit" | "Integration" | "Direct" | "Performance"
```

---

## Best Practices

### 1. Keep Templates Updated

- Review templates quarterly
- Update based on team feedback
- Incorporate lessons learned
- Keep examples current

### 2. Customize Per Project

- Don't modify templates in vtm-cli repo
- Copy to your project and customize
- Document customizations
- Share learnings with team

### 3. Use Appropriate Strategy

- TDD for high-risk, complex features
- Unit for standard development
- Integration for cross-component features
- Direct for setup and documentation

### 4. Review Before Executing

- Always review instructions first (`/vtm:instructions`)
- Verify requirements match task needs
- Modify if necessary
- Then proceed to `/vtm:execute`

### 5. Validate Thoroughly

- Run all validation commands
- Check coverage meets targets
- Verify TypeDoc generates correctly
- Ensure all ACs are met

---

## Troubleshooting

### Template Not Found

```
Error: Template not found: tdd.md
```

**Solution:**

- Ensure `.claude/vtm/instruction-templates/` exists
- Verify template file exists with correct name
- Check file permissions

### Variable Not Interpolated

```
Output shows: ${task.id} instead of TASK-042
```

**Solution:**

- Ensure InstructionBuilder is using template literal interpolation
- Verify variable name matches (case-sensitive)
- Check variable is defined in interpolation context

### Coverage Target Not Met

```
Error: Coverage 65%, target 80% (TDD)
```

**Solution:**

- Add more test cases
- Test edge cases and error conditions
- Use Wallaby MCP `coveredLinesForFile` to identify untested lines
- Consider if TDD is right strategy (or switch to Unit)

---

## Related Commands

| Command                     | Description                         |
| --------------------------- | ----------------------------------- |
| `/vtm:instructions TASK-ID` | Generate and display instructions   |
| `/vtm:execute TASK-ID`      | Launch agent with instructions      |
| `/vtm:work TASK-ID`         | Display context (existing workflow) |
| `/vtm:context TASK-ID`      | Display context only                |
| `vtm validate-task TASK-ID` | Validate task completion            |

---

## Version History

**v1.0.0 (2025-10-30):**

- Initial template system
- Four templates: TDD, Unit, Integration, Direct
- Coding standards document
- Wallaby MCP integration for TDD
- JSDoc/TypeDoc requirements

---

**For questions or feedback:** https://github.com/anthropics/claude-code/issues
