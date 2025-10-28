# PROMPT 1: Generate VTM from ADR Documents

You are generating a Virtual Task Manager (VTM) from Architecture Decision Records.

## INPUT:
- ADR documents in /adr/
- Technical specs in /specs/

## YOUR JOB:
1. Read all ADR and spec documents
2. For each ADR:
   - Identify the technical requirements
   - Break down into granular tasks (2-4 hours each)
   - Create acceptance criteria (testable, specific)
   - Determine test strategy (TDD/Unit/Integration/Direct)
   - Identify file operations (create/modify/delete)
   - Map dependencies between tasks

3. Generate vtm.json with:
   - All tasks in flat list
   - Clear dependencies (no circular deps)
   - Each task linked to source ADR/spec
   - Sequential task IDs (TASK-001, TASK-002, etc.)

## TASK DECOMPOSITION RULES:
- **Granularity**: 2-4 hours per task maximum
- **Dependencies**: Task can only depend on tasks with lower IDs
- **Test Strategy**:
  - \`TDD\` = High risk/complexity, write tests first
  - \`Unit\` = Medium risk, tests after code
  - \`Integration\` = Cross-component behavior
  - \`Direct\` = Setup/config work, verify manually

- **Acceptance Criteria**: 
  - 2-5 ACs per task
  - Each AC must be verifiable (testable or demonstrable)
  - Use format: "AC1: [Specific, measurable outcome]"

## OUTPUT:
Generate vtm.json following the schema.

## EXAMPLE TASK:
\`\`\`json
{
  "id": "TASK-005",
  "adr_source": "adr-002-data-model.md",
  "spec_source": "spec-data-model.md",
  "title": "Implement User entity with validation",
  "description": "Create User model with fields: id, email, name. Add Zod validation for email format and required fields.",
  "acceptance_criteria": [
    "AC1: User type defined with all required fields",
    "AC2: Zod schema validates email format",
    "AC3: Required field validation throws errors",
    "AC4: Valid user creation succeeds"
  ],
  "dependencies": ["TASK-004"],
  "blocks": ["TASK-006"],
  "test_strategy": "TDD",
  "test_strategy_rationale": "Core data model requires comprehensive unit tests",
  "estimated_hours": 3,
  "risk": "medium",
  "files": {
    "create": ["src/models/user.ts", "src/models/user.test.ts"],
    "modify": [],
    "delete": []
  },
  "status": "pending",
  "started_at": null,
  "completed_at": null,
  "commits": [],
  "validation": {
    "tests_pass": false,
    "ac_verified": []
  }
}
\`\`\`

## FULL SCHEMA:
\`\`\`json
{
  "version": "2.0.0",
  "project": {
    "name": "Project Name",
    "description": "Brief description"
  },
  "stats": {
    "total_tasks": 0,
    "completed": 0,
    "in_progress": 0,
    "pending": 0,
    "blocked": 0
  },
  "tasks": [
    // Array of tasks as shown above
  ]
}
\`\`\`

Generate the complete vtm.json now.
