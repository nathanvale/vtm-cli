---
allowed-tools: Bash(vtm *), Read(*.md, *.json), Write(*.json), AskUserQuestion
description: Transform ADR+Spec pairs into VTM tasks with intelligent dependency analysis
argument-hint: <adr-file> <spec-file> [--commit] [--preview-only]
---

# Plan: to-vtm

Transform planning documents (ADR + technical specification) into executable VTM tasks with rich context and intelligent dependency analysis.

## Usage

```bash
/plan:to-vtm <adr-file> <spec-file> [--commit] [--preview-only]
```

## Parameters

- `<adr-file>`: Path to ADR markdown file
- `<spec-file>`: Path to technical specification markdown file
- `--commit`: Skip preview and auto-commit (optional)
- `--preview-only`: Show preview without ingesting (optional)

## Examples

```bash
# Interactive mode (default)
/plan:to-vtm adr/ADR-002-api-design.md specs/spec-api.md

# Auto-commit mode
/plan:to-vtm adr/ADR-002.md specs/spec-api.md --commit

# Preview only
/plan:to-vtm adr/ADR-002.md specs/spec-api.md --preview-only
```

## Prerequisites

- VTM CLI installed and linked (`npm link` in vtm-cli directory)
- Existing vtm.json in project root
- ADR and Spec files must exist
- Spec should reference ADR

## Implementation Instructions

You are an orchestration agent transforming planning documents into VTM tasks. Follow these steps precisely:

### Step 1: Parse and Validate Arguments

1. Extract arguments from user input:
   - ARG1: adr-file path
   - ARG2: spec-file path
   - FLAGS: Parse `--commit` and `--preview-only` from arguments

2. Validate files exist:
   - Use Read tool to verify both files exist
   - If either file missing, show clear error and exit

3. Check ADR+Spec pairing (optional warning):
   - Extract ADR filename (basename)
   - Read spec file and check if it mentions the ADR filename
   - If not found, show warning but allow user to continue

Example validation:
```typescript
const adrFile = args[0]
const specFile = args[1]
const hasCommitFlag = args.includes('--commit')
const hasPreviewOnlyFlag = args.includes('--preview-only')

// Try to read files
try {
  const adrContent = await Read(adrFile)
  const specContent = await Read(specFile)
} catch (error) {
  console.log(`❌ Error: File not found`)
  console.log(`  ADR: ${adrFile}`)
  console.log(`  Spec: ${specFile}`)
  return
}
```

### Step 2: Read Source Files with Line Numbers

Read both files completely to pass to the extraction agent:

```typescript
const adrContent = await Read(adrFile)
const specContent = await Read(specFile)
```

### Step 3: Generate VTM Summary

Call `vtm summary` to get incomplete tasks context:

```bash
vtm summary --incomplete --json --output /tmp/vtm-summary.json
```

Then read the summary:
```typescript
const vtmSummaryJson = await Read('/tmp/vtm-summary.json')
const vtmSummary = JSON.parse(vtmSummaryJson)
```

### Step 4: Launch Task Extraction Agent

Now launch a specialized agent to extract tasks. Use the Task tool to launch an agent with this prompt:

---

**AGENT PROMPT FOR TASK EXTRACTION:**

You are a task extraction agent specialized in analyzing ADRs and technical specifications to generate VTM tasks.

## Input Documents

### ADR File: `{adr_file}`

```
{adr_content}
```

### Spec File: `{spec_file}`

```
{spec_content}
```

## Current VTM State

You have access to the current VTM state showing:
- **Incomplete tasks**: {vtm_summary.incomplete_tasks.length} tasks (pending, in-progress, blocked)
- **Completed capabilities**: {vtm_summary.completed_capabilities.length} completed tasks

### Incomplete Tasks (Can Be Dependencies)

These are tasks that are NOT yet completed. New tasks MAY depend on these:

```json
{JSON.stringify(vtm_summary.incomplete_tasks, null, 2)}
```

### Completed Capabilities (Reference Only)

These tasks are ALREADY DONE. New tasks CANNOT depend on these:

```json
{vtm_summary.completed_capabilities.map(c => c.title).join('\n- ')}
```

## Task Extraction Instructions

Follow these steps to extract tasks:

### 1. Read the ADR

Extract from the ADR:
- **Decision**: What was decided?
- **Rationale**: Why this decision?
- **Constraints**: What limitations or requirements?
- **Implementation Requirements**: What needs to be built?

### 2. Read the Spec

Extract from the Spec:
- **Individual tasks**: Break down implementation into discrete tasks
- **Acceptance Criteria**: What makes each task "done"?
- **Test Requirements**: What tests are needed?
- **Code Examples**: Sample code showing implementation
- **File Operations**: What files to create/modify/delete?

### 3. Analyze Dependencies

**CRITICAL DEPENDENCY RULES:**

1. **For dependencies WITHIN this batch of new tasks:**
   - Use 0-based array indices to reference tasks in this batch
   - Example: Task at index 0 is referenced as `0`, task at index 1 as `1`, etc.
   - The spec will say things like "Task 2 depends on Task 1" - translate this to `"dependencies": [0]` (0-based index)

2. **For dependencies on EXISTING VTM tasks:**
   - Use the actual TASK-XXX ID from the incomplete_tasks list above
   - Example: `"dependencies": ["TASK-002"]` if depending on an existing incomplete task
   - ONLY reference incomplete tasks (pending, in-progress, or blocked)
   - NEVER depend on completed tasks (they're already done!)

3. **Dependencies must follow semantic relationships**, e.g.:
   - Type definitions → Storage layer → API layer → CLI commands
   - Database schema → API implementation
   - Core logic → Integration tests

4. **Dependency Examples:**
   - Task depends on another task in THIS batch: `"dependencies": [0, 2]` (indices 0 and 2)
   - Task depends on existing VTM task: `"dependencies": ["TASK-002"]`
   - Task depends on both: `"dependencies": [0, "TASK-002"]`
   - No dependencies: `"dependencies": []`

### 4. Determine Test Strategy

Choose based on risk and component type:
- **TDD**: High-risk core logic, security features, complex algorithms
- **Unit**: Medium-risk pure functions, utilities, helpers
- **Integration**: Cross-component, API endpoints, database operations
- **Direct**: Setup, configuration, documentation, low-risk changes

### 5. Extract Rich Context

For each task, capture:
- **ADR context**: Link to specific sections, lines, decisions, constraints
- **Spec context**: Link to acceptance criteria, test requirements, code examples
- **Line references**: Precise line numbers for traceability

## Output Format

Output a JSON object with this exact schema:

```json
{
  "adr_source": "relative/path/to/adr-file.md",
  "spec_source": "relative/path/to/spec-file.md",
  "tasks": [
    {
      "title": "Clear, actionable task title",
      "description": "Detailed description (2-3 sentences explaining what and why)",
      "acceptance_criteria": [
        "Testable criterion 1",
        "Testable criterion 2",
        "Testable criterion 3"
      ],
      "dependencies": [0, "TASK-002"],
      "blocks": [],
      "test_strategy": "TDD",
      "test_strategy_rationale": "Explanation of why this test strategy was chosen",
      "risk": "high",
      "estimated_hours": 8,
      "files": {
        "create": ["path/to/new/file.ts", "path/to/test.ts"],
        "modify": ["path/to/existing.ts"],
        "delete": []
      },
      "context": {
        "adr": {
          "file": "adr-file.md",
          "decision": "Core decision from ADR",
          "rationale": "Why this decision matters for this task",
          "constraints": ["Constraint 1", "Constraint 2"],
          "relevant_sections": [
            {
              "section": "## Implementation Requirements",
              "lines": "42-58",
              "content": "Brief excerpt or summary",
              "relevance": 1.0
            }
          ]
        },
        "spec": {
          "file": "spec-file.md",
          "acceptance_criteria": ["Full AC text from spec"],
          "test_requirements": [
            {
              "type": "unit",
              "description": "Test description from spec",
              "acceptance_criterion": "Which AC this test validates",
              "lines": "65"
            }
          ],
          "code_examples": [
            {
              "language": "typescript",
              "code": "const example = 'from spec'",
              "description": "What this example shows",
              "file": "spec-file.md",
              "lines": "120-125"
            }
          ],
          "constraints": ["Constraint from spec"],
          "relevant_sections": [
            {
              "section": "## CLI Commands",
              "lines": "71-90",
              "content": "Brief excerpt or summary",
              "relevance": 0.9
            }
          ]
        },
        "source_mapping": {
          "acceptance_criteria": [
            {
              "file": "spec-file.md",
              "lines": "18",
              "text": "AC1: Full acceptance criterion text"
            }
          ],
          "tests": [
            {
              "file": "spec-file.md",
              "lines": "65",
              "text": "Test requirement text"
            }
          ],
          "examples": [
            {
              "file": "spec-file.md",
              "lines": "85-87",
              "text": "Code example description"
            }
          ]
        }
      }
    }
  ]
}
```

## Quality Checklist

Before outputting, verify:
- [ ] All tasks have clear, actionable titles
- [ ] Descriptions explain WHAT and WHY (not just restating title)
- [ ] Acceptance criteria are specific and testable
- [ ] Dependencies within batch use 0-based indices (0, 1, 2, etc.)
- [ ] Dependencies on existing tasks use TASK-XXX IDs from incomplete_tasks list
- [ ] No dependencies on completed tasks
- [ ] Test strategy matches risk level
- [ ] Line references are accurate (use actual line numbers from documents)
- [ ] Code examples extracted where relevant
- [ ] No circular dependencies between new tasks
- [ ] Tasks are ordered by dependency (foundation → implementation → testing)
- [ ] adr_source and spec_source fields are at the root level

## Output Only JSON

Output ONLY the JSON object above. Do not include any explanatory text, markdown formatting, or code fences. Just the raw JSON.

---

**END OF AGENT PROMPT**

### Step 5: Save Agent Output

After the agent completes, save its output to a temporary file:

```typescript
// Agent output is in 'taskExtractionResult' variable
await Write('/tmp/agent-output.json', taskExtractionResult)
```

### Step 6: Transform Agent Output to VTM Ingest Format

The agent returns a JSON object with this structure:
```json
{
  "adr_source": "relative/path/to/adr.md",
  "spec_source": "relative/path/to/spec.md",
  "tasks": [...]
}
```

Transform to VTM ingest format by distributing `adr_source` and `spec_source` to each task:

```bash
# Use node to transform the JSON
node -e '
const fs = require("fs");
const data = JSON.parse(fs.readFileSync("/tmp/agent-output.json", "utf-8"));

// Transform: move adr_source and spec_source into each task
const tasks = data.tasks.map(task => ({
  ...task,
  adr_source: data.adr_source,
  spec_source: data.spec_source
}));

// Write transformed tasks array
fs.writeFileSync("/tmp/tasks-extracted.json", JSON.stringify(tasks, null, 2));
console.log("✅ Transformed " + tasks.length + " tasks for VTM ingestion");
'
```

This transformation:
- Extracts tasks array from wrapper object
- Adds `adr_source` to each task
- Adds `spec_source` to each task
- Outputs array format expected by `vtm ingest`

### Step 7: Validate Transformed Output

Run validation using vtm ingest:

```bash
vtm ingest /tmp/tasks-extracted.json --dry-run
```

Check the exit code. If validation fails, show errors and exit.

### Step 8: Generate Preview

Unless `--preview-only` flag, generate and show preview:

```bash
vtm ingest /tmp/tasks-extracted.json --preview
```

This will show:
- Task summaries
- Dependency chains
- Dependency status (completed ✓, pending ⏸, new ◎)
- Ready conditions

### Step 9: User Confirmation

Unless `--commit` flag is set, prompt for confirmation:

```typescript
if (!hasCommitFlag && !hasPreviewOnlyFlag) {
  const taskCount = JSON.parse(await Read('/tmp/tasks-extracted.json')).tasks.length

  const answer = await AskUserQuestion({
    questions: [{
      question: `Commit ${taskCount} tasks to VTM?`,
      header: "Confirm Ingest",
      multiSelect: false,
      options: [
        {
          label: "Yes, commit tasks",
          description: "Add tasks to vtm.json with dependency tracking"
        },
        {
          label: "No, cancel",
          description: "Discard extracted tasks"
        }
      ]
    }]
  })

  if (!answer.answers || !answer.answers["Confirm Ingest"]?.includes("Yes")) {
    console.log("❌ Cancelled. Tasks not added to VTM.")
    return
  }
}
```

If `--preview-only`, exit here.

### Step 10: Ingest Tasks

Commit tasks to VTM:

```bash
vtm ingest /tmp/tasks-extracted.json --commit
```

### Step 11: Show Results

Display success message and next available tasks:

```bash
echo ""
echo "✅ Successfully added tasks to VTM"
echo ""
echo "🎯 Next available tasks:"
echo ""
vtm next -n 3
```

## Error Handling

Handle these error cases:

1. **Missing files**: Clear error message with file paths
2. **VTM not initialized**: Suggest running vtm init
3. **Validation errors**: Show all validation errors from vtm ingest
4. **Circular dependencies**: Show cycle path
5. **Agent errors**: Show agent output for debugging

## Output

The command will:
1. ✅ Validate ADR+Spec pairing
2. 🤖 Extract tasks with rich context using agent
3. 🧠 Analyze dependencies intelligently (semantic understanding)
4. 📋 Show preview with dependency chains
5. ❓ Prompt for confirmation (unless --commit)
6. 💾 Add validated tasks to VTM
7. 🎯 Show newly available tasks

## Notes

- **Token Efficiency**: VTM summary filters to incomplete tasks only (70% token reduction)
- **Safety First**: Multi-layer validation prevents bad data
- **Traceability**: Rich context links tasks back to source documents
- **Composability**: Works with any VTM CLI version
- **Extensible**: Add more validation rules without changing VTM CLI

## Testing the Command

To test the transformation step manually:

```bash
# 1. Create sample agent output
cat > /tmp/agent-output.json << 'EOF'
{
  "adr_source": "test-data/adr/ADR-TEST-profile-api.md",
  "spec_source": "test-data/specs/spec-profile-api.md",
  "tasks": [
    {
      "title": "Example Task",
      "description": "Test task for transformation verification",
      "acceptance_criteria": ["AC1: Task completes successfully"],
      "dependencies": [],
      "test_strategy": "Direct",
      "risk": "low",
      "estimated_hours": 1,
      "files": {
        "create": [],
        "modify": [],
        "delete": []
      }
    }
  ]
}
EOF

# 2. Run transformation
node -e '
const fs = require("fs");
const data = JSON.parse(fs.readFileSync("/tmp/agent-output.json", "utf-8"));
const tasks = data.tasks.map(task => ({
  ...task,
  adr_source: data.adr_source,
  spec_source: data.spec_source
}));
fs.writeFileSync("/tmp/tasks-extracted.json", JSON.stringify(tasks, null, 2));
console.log("✅ Transformed " + tasks.length + " tasks for VTM ingestion");
'

# 3. Verify output
cat /tmp/tasks-extracted.json
# Should show array with adr_source and spec_source in each task

# 4. Validate with VTM (requires vtm.json in current directory)
vtm ingest /tmp/tasks-extracted.json --dry-run
```

## See Also

- `vtm summary --incomplete --json` - Get VTM context
- `vtm ingest <file>` - Validate and ingest tasks
- `vtm next` - Show ready tasks
- `/plan:validate` - Validate ADR+Spec pairs (future)
