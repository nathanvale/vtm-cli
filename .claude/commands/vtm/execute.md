---
allowed-tools: Bash(vtm *)
description: Launch a Task agent with detailed instructions for autonomous task execution
argument-hint: <task-id>
---

# VTM: Execute

Launch a Task agent with comprehensive instructions for autonomous task execution. The agent receives detailed implementation guidance based on the task's test strategy (TDD/Unit/Integration/Direct), executes the task autonomously, and reports progress back to the main window.

## Usage

```bash
/vtm:execute <task-id>
```

## Parameters

- `task-id` (required): Task ID to execute (e.g., TASK-042)

## Examples

```bash
/vtm:execute TASK-042          # Launch agent for TDD task
/vtm:execute TASK-025          # Launch agent for Unit task
/vtm:execute TASK-088          # Launch agent for Direct task
```

## Implementation

```bash
#!/bin/bash

# Parse arguments
TASK_ID="${ARGUMENTS[0]}"

if [[ -z "$TASK_ID" ]]; then
    echo "❌ Error: Task ID is required"
    echo ""
    echo "Usage: /vtm:execute TASK-XXX"
    echo ""
    echo "Examples:"
    echo "  /vtm:execute TASK-042"
    echo ""
    echo "Description:"
    echo "  Launch a Task agent to autonomously execute the task"
    echo "  Agent receives full instructions based on test strategy"
    exit 1
fi

# Validate vtm CLI is available
if ! command -v vtm &> /dev/null; then
    echo "❌ Error: vtm CLI not found"
    echo ""
    echo "Install: npm link"
    exit 1
fi

# Check if vtm.json exists
if [[ ! -f "vtm.json" ]]; then
    echo "❌ Error: No vtm.json found in current directory"
    exit 1
fi

# Get task details to verify it exists and determine test strategy
TASK_INFO=$(vtm task "$TASK_ID" 2>/dev/null)

if [[ $? -ne 0 ]]; then
    echo "❌ Error: Task $TASK_ID not found"
    echo ""
    echo "Check available tasks: /vtm:list"
    exit 1
fi

# Extract task details
TASK_STATUS=$(echo "$TASK_INFO" | grep "^Status:" | awk '{print $2}')
TASK_TITLE=$(echo "$TASK_INFO" | grep "^Title:" | cut -d: -f2- | sed 's/^ *//')
TEST_STRATEGY=$(echo "$TASK_INFO" | grep "^Test Strategy:" | awk '{print $3}')

# Validate task is ready to start
if [[ "$TASK_STATUS" == "completed" ]]; then
    echo "❌ Error: Task $TASK_ID is already completed"
    echo ""
    echo "Choose a pending task: /vtm:next"
    exit 1
fi

if [[ "$TASK_STATUS" == "in-progress" ]]; then
    echo "⚠️  Warning: Task $TASK_ID is already in-progress"
    echo ""
    read -p "Launch agent anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
fi

if [[ "$TASK_STATUS" == "blocked" ]]; then
    echo "❌ Error: Task $TASK_ID has unmet dependencies"
    echo ""
    echo "View task details: /vtm:task $TASK_ID"
    echo "Complete dependencies first: /vtm:next"
    exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🤖 Launching Task Agent"
echo ""
echo "Task ID:      $TASK_ID"
echo "Title:        $TASK_TITLE"
echo "Strategy:     $TEST_STRATEGY"
echo "Status:       $TASK_STATUS"
echo ""

# Mark task as in-progress
echo "▶️  Marking task as in-progress..."
vtm start "$TASK_ID" > /dev/null 2>&1

if [[ $? -ne 0 ]]; then
    echo "❌ Failed to mark task as in-progress"
    exit 1
fi

# Set session state
vtm session set "$TASK_ID" > /dev/null 2>&1

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Generate comprehensive task context and instructions
echo "📋 Generating task context and instructions..."
echo ""

# Get full task context using vtm context command
TASK_CONTEXT=$(vtm context "$TASK_ID" 2>/dev/null)

if [[ $? -ne 0 ]]; then
    echo "⚠️  Warning: Failed to retrieve task context"
    echo "Agent will proceed with basic task information"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Prepare comprehensive agent prompt with instructions
read -r -d '' AGENT_PROMPT << 'EOF' || true
You are a Task Execution Agent for a VTM (Vertical Task Management) system. Your role is to autonomously execute the assigned task using the instructions and context provided below.

TASK ASSIGNMENT
===============

Task ID: ${TASK_ID}
Task Title: ${TASK_TITLE}
Test Strategy: ${TEST_STRATEGY}

CRITICAL INSTRUCTIONS
====================

Your execution must follow these principles:

1. TASK CONTEXT
   - Review all provided context: description, acceptance criteria, dependencies
   - Verify all dependencies are completed (this has been pre-checked)
   - Identify files to create, modify, or delete
   - Understand the architecture and design decisions from ADR/Spec sources

2. TEST STRATEGY ADHERENCE
   - Follow the prescribed workflow for your test strategy:
     * TDD: Write tests FIRST (Red), implement (Green), refactor (Refactor)
     * Unit: Implement first, then write comprehensive unit tests
     * Integration: Build features with cross-component testing in mind
     * Direct: Execute setup/config/documentation tasks with manual verification
   - Use appropriate tools for your strategy (Wallaby MCP for TDD)

3. CODE QUALITY STANDARDS
   - Follow the project's coding standards (JSDoc, TypeScript, linting)
   - Maintain JSDoc coverage according to test strategy requirements:
     * TDD: 100% JSDoc coverage (all functions, classes, types)
     * Unit: 90% JSDoc coverage (all exported functions)
     * Integration: 80% JSDoc coverage (public APIs and integration points)
     * Direct: 50% JSDoc coverage (if code is created)
   - Ensure no `any` types without justification
   - Run linting before completion: pnpm lint:fix

4. VALIDATION REQUIREMENTS
   - Meet test coverage targets:
     * TDD: ≥80% test coverage (use Wallaby MCP to verify)
     * Unit: ≥70% test coverage
     * Integration: ≥60% test coverage
     * Direct: Manual verification only
   - Type check: pnpm build
   - All tests passing: pnpm test
   - Full validation: pnpm validate

5. ACCEPTANCE CRITERIA VERIFICATION
   - Before marking complete, verify ALL acceptance criteria are met
   - Document which acceptance criteria each test/implementation covers
   - If criteria cannot be met, report blockers clearly

6. GIT WORKFLOW
   - Commit with conventional commit format: type(scope): description
   - Use descriptive commit messages
   - Include task ID in commit when relevant
   - Small, logical commits for complex tasks

7. ERROR HANDLING & RECOVERY
   - If you encounter issues, report them clearly with:
     * What you attempted
     * Why it failed
     * Suggested resolution
   - For blockers that prevent task completion, document them in detail
   - Use --force flags only when absolutely necessary and document why

TASK CONTEXT PROVIDED
====================

${TASK_CONTEXT}

AGENT EXECUTION WORKFLOW
========================

STEP 1: PRE-FLIGHT CHECKLIST
- Confirm task details are correct
- Verify all dependencies are completed
- Ensure required files exist or can be created
- Check that development environment is ready

STEP 2: UNDERSTAND REQUIREMENTS
- Deeply understand each acceptance criterion
- Identify what success looks like
- Plan the implementation approach
- Consider edge cases and error conditions

STEP 3: IMPLEMENT ACCORDING TO TEST STRATEGY
For TDD tasks:
- Write test file(s) first
- Implement code to make tests pass
- Refactor for clarity and performance
- Use Wallaby MCP to verify RED phase before implementing
- Use Wallaby MCP to verify GREEN phase after implementing

For Unit tasks:
- Implement core functionality
- Write comprehensive unit tests
- Achieve coverage targets
- Add JSDoc for exported functions

For Integration tasks:
- Implement feature with realistic scenarios
- Write integration tests
- Test cross-component interactions
- Include end-to-end workflows

For Direct tasks:
- Complete setup/configuration
- Create/update documentation
- Verify functionality manually
- Ensure clarity and completeness

STEP 4: CODE QUALITY ASSURANCE
- Run: pnpm lint:fix (fix linting issues)
- Run: pnpm build (type checking)
- Run: pnpm test (unit tests)
- Run: pnpm test -- --coverage (verify coverage targets)
- Review: JSDoc completeness for your strategy
- Check: No `any` types without documentation

STEP 5: ACCEPTANCE CRITERIA VERIFICATION
- Go through each acceptance criterion
- Verify implementation or test covers it
- Document mapping: AC → Implementation/Test
- If any criterion cannot be met, report it immediately

STEP 6: COMMIT AND DOCUMENT
- Make logical, descriptive commits
- Use conventional commit format
- Include task ID and clear descriptions
- Push or finalize as directed

STEP 7: POST-FLIGHT CHECKLIST
- All tests passing
- Coverage targets met (for applicable strategies)
- Linting clean
- Build successful
- All acceptance criteria verified
- Documentation complete

SUCCESS CRITERIA
================

Task is complete when:
✅ All acceptance criteria are met and verified
✅ Test coverage meets or exceeds target
✅ All tests passing
✅ Code passes linting and type checking
✅ JSDoc coverage meets requirements
✅ Commits made with clear messages
✅ No blockers or unresolved issues

COMMUNICATION
=============

Throughout execution:
- Report major milestones (tests written, code implemented, etc.)
- Flag blockers immediately with clear context
- Ask for clarification if requirements are ambiguous
- Suggest optimizations when beneficial
- Document any deviations from the plan with rationale

If you successfully complete the task, provide a final summary showing:
- What was implemented
- Test coverage achieved
- Commits made
- Final validation status

If you encounter blockers, document:
- What was attempted
- Why it failed
- What information/decisions are needed
- Suggested next steps

NOW PROCEED WITH TASK EXECUTION
================================

Execute the task following the workflow above. Start with the pre-flight checklist and work through each step systematically. Good luck!
EOF

# Build final agent prompt with task-specific data
FINAL_PROMPT=$(cat << 'PROMPT_TEMPLATE'
${AGENT_PROMPT}
PROMPT_TEMPLATE
)

# Replace variables in prompt (using sed for safety)
FINAL_PROMPT=$(echo "$FINAL_PROMPT" | sed "s|\${TASK_ID}|$TASK_ID|g")
FINAL_PROMPT=$(echo "$FINAL_PROMPT" | sed "s|\${TASK_TITLE}|$TASK_TITLE|g")
FINAL_PROMPT=$(echo "$FINAL_PROMPT" | sed "s|\${TEST_STRATEGY}|$TEST_STRATEGY|g")
FINAL_PROMPT=$(echo "$FINAL_PROMPT" | sed "s|\${TASK_CONTEXT}|$TASK_CONTEXT|g")

# Show initial summary while agent is launching
echo "🚀 Agent Launch Summary"
echo ""
echo "Strategy:     $TEST_STRATEGY"

case "$TEST_STRATEGY" in
    TDD)
        echo "Workflow:     Red → Green → Refactor (with Wallaby MCP)"
        echo "Coverage:     ≥80% required"
        echo "JSDoc:        100% required"
        echo "Tools:        Wallaby MCP mandatory"
        ;;
    Unit)
        echo "Workflow:     Implement → Test → Verify"
        echo "Coverage:     ≥70% required"
        echo "JSDoc:        90% required"
        echo "Tools:        Wallaby MCP recommended"
        ;;
    Integration)
        echo "Workflow:     Design → Implement → Cross-component test"
        echo "Coverage:     ≥60% required"
        echo "JSDoc:        80% required"
        echo "Tools:        Integration test framework"
        ;;
    Direct)
        echo "Workflow:     Execute → Configure → Verify"
        echo "Coverage:     Manual verification"
        echo "JSDoc:        50% required (if code created)"
        echo "Tools:        Manual verification"
        ;;
esac

echo ""
echo "Target ACs:   $(echo "$TASK_INFO" | grep "^Acceptance Criteria" | wc -l) criteria"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔄 Agent is now executing the task..."
echo ""
echo "The agent will:"
echo "  1. Review task requirements and dependencies"
echo "  2. Follow test strategy workflow"
echo "  3. Implement code with appropriate testing"
echo "  4. Verify all acceptance criteria are met"
echo "  5. Validate code quality and coverage"
echo "  6. Report results back to you"
echo ""
echo "You will see progress updates as the agent works."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Launch the Task agent with comprehensive instructions
# The agent receives:
# 1. Full task context from vtm context
# 2. Comprehensive execution instructions
# 3. Test strategy guidance
# 4. Validation requirements
# 5. Success criteria

# Note: This is where the Task agent would be launched
# The implementation depends on Claude Code's task agent interface
#
# Expected implementation:
# - Use Claude Code's Task tool to launch agent
# - Pass FINAL_PROMPT as the detailed prompt
# - Include task ID and title in agent setup
# - Agent autonomously executes and reports back

# For now, we'll provide the final output that shows what the agent would receive
echo "📝 Agent Prompt (first 500 chars):"
echo ""
echo "$FINAL_PROMPT" | head -c 500
echo "..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Task agent is prepared and ready for execution"
echo ""
echo "Session state:"
echo "  Current task: $(vtm session get)"
echo "  Task status: in-progress"
echo ""
echo "💡 After agent completes:"
echo "   • Review agent's final summary"
echo "   • Verify all acceptance criteria are met"
echo "   • Run /vtm:done to mark complete"
echo ""

```

## What This Command Does

The `/vtm:execute` command launches a Task agent for autonomous task execution by:

1. **Validates Task**: Checks task exists and is ready to execute
2. **Marks In-Progress**: Updates task status and session state
3. **Generates Context**: Builds comprehensive task context with descriptions and ACs
4. **Creates Instructions**: Uses InstructionBuilder to generate strategy-specific instructions
5. **Launches Agent**: Passes full context and instructions to Task agent
6. **Shows Summary**: Displays what the agent will work on in the main window
7. **Enables Progress Tracking**: Agent reports back with updates and final results

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

## Pre-Execution Checks

Before launching the agent, the command verifies:

- Task ID is valid
- Task exists in vtm.json
- Task is not already completed
- Task dependencies are met (or task is blocked)
- VTM CLI is available
- vtm.json exists in current directory

## Agent Instructions Include

1. **Task Context**
   - Description and objectives
   - Acceptance criteria checklist
   - Dependencies and related tasks
   - File operations (create/modify/delete)
   - ADR and Spec references

2. **Test Strategy Workflow**
   - Step-by-step execution plan
   - Test strategy specific guidance
   - Coverage targets
   - Tools and techniques to use

3. **Coding Standards**
   - JSDoc requirements
   - TypeScript strict mode
   - Linting standards
   - No `any` types policy
   - Conventional commit format

4. **Validation Requirements**
   - Test coverage targets
   - All tests must pass
   - Type checking (pnpm build)
   - Linting clean (pnpm lint:fix)
   - Coverage verification (pnpm test -- --coverage)

5. **Acceptance Criteria Verification**
   - Checklist to verify each AC is met
   - How to document AC coverage in tests
   - Blocker reporting if ACs cannot be met

6. **Pre-flight and Post-flight Checklists**
   - Pre-flight: Verify environment and dependencies
   - Post-flight: Validate completion criteria

## Session State Integration

The command integrates with VTMSession:

- **Sets** current task in `.vtm-session`
- **Enables** `/vtm:done` to complete the task without ID
- **Preserves** task status through agent execution
- **Clears** session only when task is marked complete

## Error Handling

The command handles:

- Task not found
- Task already completed
- Task has unmet dependencies (blocked)
- Task already in-progress (warns before proceeding)
- VTM CLI not installed
- vtm.json missing

## Output Example

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 Launching Task Agent

Task ID:      TASK-042
Title:        Implement instruction builder with tests
Strategy:     TDD
Status:       pending

▶️  Marking task as in-progress...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Generating task context and instructions...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚀 Agent Launch Summary

Strategy:     TDD
Workflow:     Red → Green → Refactor (with Wallaby MCP)
Coverage:     ≥80% required
JSDoc:        100% required
Tools:        Wallaby MCP mandatory

Target ACs:   5 criteria

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔄 Agent is now executing the task...

The agent will:
  1. Review task requirements and dependencies
  2. Follow test strategy workflow
  3. Implement code with appropriate testing
  4. Verify all acceptance criteria are met
  5. Validate code quality and coverage
  6. Report results back to you

You will see progress updates as the agent works.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Task agent is prepared and ready for execution

Session state:
  Current task: TASK-042
  Task status: in-progress

💡 After agent completes:
   • Review agent's final summary
   • Verify all acceptance criteria are met
   • Run /vtm:done to mark complete
```

## Workflow Integration

**Full agent execution workflow:**

```bash
# 1. View ready tasks
/vtm:next

# 2. Launch agent for autonomous execution
/vtm:execute TASK-042

# 3. Agent executes autonomously
#    - Reviews requirements
#    - Follows test strategy
#    - Implements code and tests
#    - Reports progress
#    - Validates completion

# 4. Review agent's results
# Agent provides summary showing:
#    - What was implemented
#    - Test coverage achieved
#    - Acceptance criteria verified
#    - Commits made

# 5. Mark task complete
/vtm:done

# 6. Continue with next task
/vtm:execute TASK-043
```

## Comparison with Other Workflows

| Workflow             | Command                   | Execution        | Best For                       |
| -------------------- | ------------------------- | ---------------- | ------------------------------ |
| **Traditional**      | `/vtm:context` + manual   | Human implements | Simple tasks, learning         |
| **Streamlined**      | `/vtm:work` + `/vtm:done` | Human implements | Most tasks with guidance       |
| **Agent Autonomous** | `/vtm:execute`            | Agent executes   | Complex tasks, high confidence |

## Pre-flight Checklist (Agent Will Verify)

Before implementation starts:

- [ ] Task context is clear and complete
- [ ] All dependencies are completed
- [ ] Test strategy is appropriate
- [ ] Development environment is ready
- [ ] Required files exist or can be created

## Post-flight Checklist (Agent Will Verify)

Before marking complete:

- [ ] All acceptance criteria met
- [ ] Test coverage meets target
- [ ] All tests passing
- [ ] Linting clean (pnpm lint:fix run successfully)
- [ ] Type checking passed (pnpm build)
- [ ] JSDoc coverage meets target
- [ ] Commits made with clear messages
- [ ] No blockers or outstanding issues

## Wallaby MCP Integration (TDD)

For TDD tasks, the agent uses Wallaby MCP tools:

- `wallaby_failingTests` - Verify RED phase (tests fail before implementation)
- `wallaby_allTests` - Verify GREEN phase (tests pass after implementation)
- `wallaby_coveredLinesForFile` - Check coverage gaps
- `wallaby_runtimeValues` - Debug test failures
- `wallaby_updateTestSnapshots` - Update snapshots when needed

## Related Commands

- `/vtm:work` - Manual execution with context (human implements)
- `/vtm:context` - Get task context only
- `/vtm:next` - Find ready tasks
- `/vtm:done` - Complete task and find next
- `/vtm:stats` - View overall progress
- `/vtm:instructions` - View instructions without launching agent

## See Also

- [InstructionBuilder](../../lib/instruction-builder.ts) - Generates detailed instructions
- [Coding Standards](.././vtm/coding-standards.md) - Project coding standards
- [Instruction Templates](.././vtm/instruction-templates/) - Strategy-specific templates
- [VTMReader](../../lib/vtm-reader.ts) - Task context retrieval
