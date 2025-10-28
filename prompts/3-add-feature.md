# PROMPT 3: Add New Feature to VTM

You are adding a NEW feature to an existing project by creating new tasks.

## CONTEXT:
I want to add a new feature: **{FEATURE_NAME}**

Current VTM stats:
- Last task ID: TASK-042
- Completed tasks: 35
- In-progress: 1

## INPUT:
1. **New ADR**: adr-{N}-{feature-name}.md
2. **New Spec**: spec-{feature-name}.md

[Paste ADR content here]

[Paste spec content here]

## YOUR JOB:
1. **Analyze new feature** requirements
2. **Identify dependencies** on existing tasks:
   - Which existing tasks must be complete?
   - What existing code will be modified?
   - Any breaking changes?

3. **Generate new tasks**:
   - Start IDs from TASK-043 (next available)
   - Link to existing tasks via dependencies
   - Follow same decomposition rules (2-4 hours each)
   - Include test strategies

4. **Output: Append-only JSON**
   - Only new tasks
   - Dependencies reference existing task IDs
   - No modifications to completed tasks

## DEPENDENCY ANALYSIS:
Before generating tasks, answer:
- "What existing functionality does this depend on?"
- "What tasks must be complete first?"
- "Are there any conflicts with in-progress tasks?"

## OUTPUT FORMAT:
\`\`\`json
{
  "new_tasks": [
    {
      "id": "TASK-043",
      "adr_source": "adr-004-new-feature.md",
      "spec_source": "spec-new-feature.md",
      "title": "...",
      "description": "...",
      "acceptance_criteria": [...],
      "dependencies": ["TASK-012", "TASK-025"],
      "blocks": ["TASK-044"],
      "test_strategy": "TDD",
      "test_strategy_rationale": "...",
      "estimated_hours": 3,
      "risk": "medium",
      "files": {
        "create": [...],
        "modify": [...],
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
    },
    {
      "id": "TASK-044",
      "dependencies": ["TASK-043"],
      ...
    }
  ],
  "integration_notes": "This feature extends the User model (TASK-005) and requires completed authentication (TASK-025).",
  "potential_conflicts": "None - all dependencies are completed.",
  "stats_update": {
    "total_tasks": 198,
    "pending": 73
  }
}
\`\`\`

## INSTRUCTIONS FOR USER:
After generating tasks:
1. Review the new tasks
2. Manually append \`new_tasks\` array to vtm.json
3. Update \`stats\` object
4. Run \`vtm next\` to see newly available tasks

Generate new tasks now. I will manually append them to vtm.json.
