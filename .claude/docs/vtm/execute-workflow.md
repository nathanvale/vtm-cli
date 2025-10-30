# VTM Execute Workflow

## Overview

The `/vtm:execute` command launches a Task agent for autonomous task execution. It provides comprehensive instructions, context, and validation requirements based on the task's test strategy (TDD/Unit/Integration/Direct).

## Workflow Stages

### 1. Task Validation

Before launching the agent, the command validates:

- Task ID is valid
- Task exists in vtm.json
- Task is not already completed
- Task dependencies are met (or task is blocked)
- VTM CLI is available
- vtm.json exists in current directory

### 2. Git Integration

**On Task Start:**

- Verifies clean working directory (via `/git:ensure-clean`)
- Creates feature branch with format: `{type}/TASK-XXX`
  - Examples: `feature/TASK-042`, `bugfix/TASK-025`, `refactor/TASK-088`
- Task type is extracted from task metadata (defaults to "feature")

**On Task Complete (via `/vtm:done`):**

- Commits any uncommitted changes with conventional commit format
- Merges feature branch to main
- Deletes feature branch
- Marks task complete

### 3. Session State Management

The command integrates with VTMSession:

- **Sets** current task in `.vtm-session`
- **Enables** `/vtm:done` to complete the task without ID
- **Preserves** task status through agent execution
- **Clears** session only when task is marked complete

Session file location: `./.vtm-session` (project-specific)

### 4. Context Generation

Builds comprehensive task context using `vtm context`:

- Task description and objectives
- Acceptance criteria checklist
- Dependencies and related tasks
- File operations (create/modify/delete)
- ADR and Spec references

### 5. Instruction Generation

Uses InstructionBuilder to generate strategy-specific instructions:

- Test strategy workflow (TDD/Unit/Integration/Direct)
- Coverage targets and JSDoc requirements
- Coding standards and validation requirements
- Pre-flight and post-flight checklists
- Success criteria

### 6. Agent Launch

Passes comprehensive prompt to Task agent:

- Full task context
- Detailed execution instructions
- Test strategy guidance
- Validation requirements
- Success criteria

### 7. Progress Tracking

Agent reports back with:

- Major milestones
- Blockers and issues
- Implementation summary
- Test coverage results
- Final validation status

## Agent Capabilities by Test Strategy

### TDD Tasks

- Writes tests FIRST (Red phase)
- Implements code to pass tests (Green phase)
- Refactors for quality (Refactor phase)
- Uses Wallaby MCP for real-time test feedback
- Targets ≥80% test coverage
- Requires 100% JSDoc coverage

### Unit Tasks

- Implements functionality first
- Writes comprehensive unit tests
- Targets ≥70% test coverage
- Requires 90% JSDoc coverage
- Optional Wallaby MCP usage

### Integration Tasks

- Implements features with realistic scenarios
- Writes integration tests for cross-component behavior
- Targets ≥60% test coverage
- Requires 80% JSDoc coverage
- Tests end-to-end workflows

### Direct Tasks

- Executes setup/configuration tasks
- Creates/updates documentation
- Performs manual verification
- Requires 50% JSDoc coverage if code is created
- No automated test requirements

## Agent Instructions Include

### 1. Task Context

- Description and objectives
- Acceptance criteria checklist
- Dependencies and related tasks
- File operations (create/modify/delete)
- ADR and Spec references

### 2. Test Strategy Workflow

- Step-by-step execution plan
- Test strategy specific guidance
- Coverage targets
- Tools and techniques to use

### 3. Coding Standards

See [Coding Standards](./coding-standards.md) for full details.

### 4. Validation Requirements

- Test coverage targets
- All tests must pass
- Type checking (pnpm build)
- Linting clean (pnpm lint:fix)
- Coverage verification (pnpm test -- --coverage)

### 5. Acceptance Criteria Verification

- Checklist to verify each AC is met
- How to document AC coverage in tests
- Blocker reporting if ACs cannot be met

### 6. Pre-flight and Post-flight Checklists

See [Test Strategies](./test-strategies.md) for detailed checklists.

## Wallaby MCP Integration

For TDD tasks, the agent uses Wallaby MCP tools:

- `wallaby_failingTests` - Verify RED phase (tests fail before implementation)
- `wallaby_allTests` - Verify GREEN phase (tests pass after implementation)
- `wallaby_coveredLinesForFile` - Check coverage gaps
- `wallaby_runtimeValues` - Debug test failures
- `wallaby_updateTestSnapshots` - Update snapshots when needed

See [Test Strategies](./test-strategies.md) for complete Wallaby MCP reference.

## Error Handling

The command handles:

- Task not found
- Task already completed
- Task has unmet dependencies (blocked)
- Task already in-progress (warns before proceeding)
- VTM CLI not installed
- vtm.json missing

## Complete Workflow Example

```bash
# 1. View ready tasks
/vtm:next

# 2. Launch agent for autonomous execution
/vtm:execute TASK-042
#    - Ensures clean git state
#    - Creates feature branch (type/TASK-042)
#    - Marks task as in-progress
#    - Agent executes autonomously
#    - Reviews requirements
#    - Follows test strategy
#    - Implements code and tests
#    - Reports progress

# 3. Review agent's results
# Agent provides summary showing:
#    - What was implemented
#    - Test coverage achieved
#    - Acceptance criteria verified
#    - Commits made

# 4. Complete and merge
/vtm:done
#    - Commits any uncommitted changes
#    - Merges feature branch to main
#    - Deletes feature branch
#    - Marks task complete
#    - Shows next available tasks

# 5. Continue with next task
/vtm:execute TASK-043
```

## Troubleshooting

### Task Not Found

```
❌ Error: Task TASK-XXX not found

Check available tasks: /vtm:list
```

**Solution**: Verify task ID using `/vtm:list` or `/vtm:next`

### Task Already Completed

```
❌ Error: Task TASK-XXX is already completed

Choose a pending task: /vtm:next
```

**Solution**: Use `/vtm:next` to find available tasks

### Task Blocked

```
❌ Error: Task TASK-XXX has unmet dependencies

View task details: /vtm:task TASK-XXX
Complete dependencies first: /vtm:next
```

**Solution**: Complete dependencies first, then retry

### Git Working Directory Not Clean

```
❌ Error: Working directory has uncommitted changes

Cannot start work with uncommitted changes.
```

**Solution**: Commit or stash changes before starting task

## See Also

- [Test Strategies](./test-strategies.md) - Detailed test strategy workflows
- [Coding Standards](./coding-standards.md) - Project coding standards
- [Done Workflow](./done-workflow.md) - Task completion workflow
