---
allowed-tools: Bash(vtm *)
description: Generate detailed execution instructions for a task
argument-hint: <task-id>
---

# VTM: Instructions

Generate detailed, prescriptive instructions for task execution including test strategies, acceptance criteria, pre-flight and post-flight checklists.

## Usage

```bash
/vtm:instructions <task-id>
```

## Parameters

- `task-id` (required): Task ID (e.g., TASK-042)

## Examples

```bash
/vtm:instructions TASK-042        # View detailed instructions for implementation
/vtm:instructions TASK-015        # Review test strategy and acceptance criteria
```

## Implementation

```bash
#!/bin/bash

# Parse arguments
TASK_ID="${ARGUMENTS[0]}"

if [[ -z "$TASK_ID" ]]; then
    echo "❌ Error: Task ID is required"
    echo ""
    echo "Usage: /vtm:instructions TASK-XXX"
    echo ""
    echo "Examples:"
    echo "  /vtm:instructions TASK-042"
    echo "  /vtm:instructions TASK-015"
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
    echo "❌ Error: No vtm.json found"
    exit 1
fi

# AC1: Get task status and validate it exists
TASK_STATUS=$(vtm task "$TASK_ID" 2>/dev/null | grep "^Status:" | awk '{print $2}')

if [[ -z "$TASK_STATUS" ]]; then
    echo "❌ Error: Task $TASK_ID not found"
    echo ""
    echo "Check available tasks: /vtm:list"
    exit 1
fi

# AC2: Get test strategy from task details
TEST_STRATEGY=$(vtm task "$TASK_ID" 2>/dev/null | grep "^Test Strategy:" | cut -d':' -f2- | xargs)

if [[ -z "$TEST_STRATEGY" ]]; then
    TEST_STRATEGY="Unknown"
fi

# AC4: Build and display instructions using Node.js
# Since we need to invoke InstructionBuilder from Node, we'll use a temporary Node script
SCRIPT_FILE="/tmp/vtm-instructions-$TASK_ID-$RANDOM.js"

cat > "$SCRIPT_FILE" << 'EOF'
const { InstructionBuilder } = require('vtm-cli/lib');
const path = require('path');

async function generateInstructions() {
  try {
    // AC3: Initialize InstructionBuilder
    const builder = new InstructionBuilder({
      vtmPath: path.join(process.cwd(), 'vtm.json'),
      templatePath: path.join(process.cwd(), '.claude/vtm/instruction-templates')
    });

    // AC1: Generate instructions for task
    const taskId = process.argv[2];
    const instructions = await builder.buildInstructions(taskId);

    // AC2: Display instructions in markdown format
    console.log(instructions);

  } catch (error) {
    // Error handling for task not found or template missing
    if (error.message.includes('not found')) {
      console.error(`❌ Error: Task ${process.argv[2]} not found or template unavailable`);
      process.exit(1);
    }

    if (error.message.includes('Template not found')) {
      console.error(`⚠️  Warning: Instruction templates not found in .claude/vtm/instruction-templates`);
      console.error('');
      console.error('This command requires instruction templates:');
      console.error('  - tdd.md (for TDD tasks)');
      console.error('  - unit.md (for Unit test tasks)');
      console.error('  - integration.md (for Integration tasks)');
      console.error('  - direct.md (for Direct tasks)');
      console.error('');
      console.error('Create these templates in .claude/vtm/instruction-templates/');
      process.exit(1);
    }

    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

generateInstructions();
EOF

# Execute the Node script
node "$SCRIPT_FILE" "$TASK_ID"
SCRIPT_EXIT_CODE=$?

# Clean up temporary script
rm -f "$SCRIPT_FILE"

# Exit with the same code as the Node script
if [[ $SCRIPT_EXIT_CODE -ne 0 ]]; then
    exit $SCRIPT_EXIT_CODE
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# AC5: Provide smart hints and next steps
echo "💡 Next steps:"
echo ""
echo "1. Review the instructions above carefully"
echo "2. Follow the test strategy: $TEST_STRATEGY"
echo "3. Before starting:"
echo "   • Check dependencies are completed: /vtm:task $TASK_ID"
echo "   • Ensure all acceptance criteria are understood"
echo "4. Start implementing:"
echo "   • /vtm:execute $TASK_ID (launch agent with git integration)"
echo "   • Agent follows pre-flight checklist from instructions"
echo "   • Agent uses TDD workflow if test_strategy is TDD"
echo "5. Upon completion:"
echo "   • Verify post-flight checklist"
echo "   • Run tests and linting"
echo "   • /vtm:done (mark complete)"
echo ""
echo "Additional commands:"
echo "   • Full task details: /vtm:task $TASK_ID"
echo "   • Get context: /vtm:context $TASK_ID"
echo "   • View all tasks: /vtm:list"
echo "   • Check progress: /vtm:stats"
echo ""
```

## What This Command Does

The `/vtm:instructions` command provides comprehensive task execution guidance by:

1. **Loading task details**: Validates task exists and retrieves test strategy
2. **Generating prescriptive instructions**: Uses InstructionBuilder to load strategy-specific templates
3. **Displaying in markdown**: Shows formatted instructions in the main Claude Code window
4. **Test Strategy Focus**: Prominently displays test strategy (TDD/Unit/Integration/Direct)
5. **Providing workflow guidance**: Smart hints suggesting next steps and best practices

## Instruction Content

Instructions include (via templates):

- **Task Objective**: Clear description of what needs to be built
- **Acceptance Criteria**: Formatted as interactive checklists
- **Test Strategy**: Specific workflow for TDD/Unit/Integration/Direct approaches
- **Coding Standards**: JSDoc requirements, TypeScript guidelines, linting rules
- **Pre-flight Checklist**: Steps to verify before starting implementation
- **Post-flight Checklist**: Steps to verify before marking complete
- **File Operations**: Create, modify, and delete file guidance
- **Dependencies**: Resolved dependencies with completion status
- **Blocked Tasks**: Tasks waiting for this one to complete
- **Source Documents**: Links to ADR and specification files

## Test Strategies

Instructions are customized for each test strategy:

- **TDD**: Wallaby MCP mandatory, 100% JSDoc, Red-Green-Refactor workflow
- **Unit**: Tests after implementation, 90% JSDoc, standard unit test workflow
- **Integration**: End-to-end testing, 80% JSDoc, cross-component verification
- **Direct**: Manual verification, 50% JSDoc, setup/configuration workflows

## Token Efficiency

Instruction documents:

- TDD template: ~5000 tokens (most comprehensive)
- Unit template: ~4000 tokens
- Integration template: ~4500 tokens
- Direct template: ~3000 tokens (least comprehensive)

These are prescriptive (not descriptive) and designed to guide implementation methodology.

## Prerequisites

This command requires instruction templates in `.claude/vtm/instruction-templates/`:

- `tdd.md` - Template for TDD tasks
- `unit.md` - Template for Unit test tasks
- `integration.md` - Template for Integration test tasks
- `direct.md` - Template for Direct/manual tasks

Templates use JavaScript template literal syntax for variable interpolation:

```markdown
# Implementing ${task.title}

**Task ID:** ${task.id}

## Acceptance Criteria

${acceptanceCriteriaList}

## Dependencies

${dependenciesList}

## Test Strategy

Your task uses the **${task.test_strategy}** test strategy...
```

Available template variables:

- `${task.id}` - Task ID (e.g., "TASK-042")
- `${task.title}` - Task title
- `${task.description}` - Task description
- `${task.test_strategy}` - Test strategy (TDD/Unit/Integration/Direct)
- `${task.estimated_hours}` - Estimated hours to complete
- `${task.risk}` - Risk level (low/medium/high)
- `${acceptanceCriteriaList}` - Formatted acceptance criteria checklist
- `${fileOperationsList}` - Files to create/modify/delete
- `${dependenciesList}` - Dependencies with completion status
- `${blockedTasksList}` - Tasks blocked by this one
- `${sourceDocuments}` - ADR and Spec file references

## Error Handling

The command handles errors gracefully:

- **Task not found**: Suggests checking available tasks with `/vtm:list`
- **Templates missing**: Suggests creating required templates in `.claude/vtm/instruction-templates/`
- **vtm CLI not available**: Suggests running `npm link`
- **vtm.json missing**: Indicates no project manifest found

## Workflow Integration

### With Streamlined Workflow

```bash
/vtm:instructions TASK-042    # Review detailed instructions
# Review test strategy and acceptance criteria
/vtm:execute TASK-042         # Launch agent with git integration
# Agent implements following instructions
/vtm:done                     # Complete and find next
```

### With Traditional Workflow

```bash
/vtm:instructions TASK-042    # Review detailed instructions
vtm context TASK-042           # Get minimal context
vtm start TASK-042             # Mark as in-progress
# Implement following instructions
vtm complete TASK-042          # Mark as complete
```

## When to Use

Use `/vtm:instructions` when:

- Starting a new task and want detailed guidance
- Implementing high-risk or complex tasks (review test strategy)
- Need to understand pre/post-flight checklists
- Want to ensure you're following the correct workflow
- Reviewing acceptance criteria before starting work
- Setting up a new feature with multiple dependent tasks

## Difference from Other Commands

| Command             | Purpose                                        | Token Usage | Use When                              |
| ------------------- | ---------------------------------------------- | ----------- | ------------------------------------- |
| `/vtm:instructions` | **Prescriptive guidance** for HOW to build     | ~4000-5000  | Before starting, reviewing strategy   |
| `/vtm:context`      | **Descriptive context** about WHAT to build    | ~500-2000   | Read-only review, during planning     |
| `/vtm:task`         | **Task metadata** (status, dependencies, etc.) | ~200-500    | Checking status, viewing details      |
| `/vtm:execute`      | **Full execution** with git + agent            | N/A         | Ready to start task with automation   |

## See Also

- `/vtm:execute` - Launch agent with git integration
- `/vtm:context` - Get minimal implementation context (read-only)
- `/vtm:task` - View complete task metadata
- `/vtm:done` - Complete task with git workflow
- `/vtm:next` - Find ready tasks to work on
- `/vtm:list` - View all tasks
