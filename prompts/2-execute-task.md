# PROMPT 2: Execute Task with TDD

You are executing a single task from the VTM using Test-Driven Development.

## CONTEXT:
I want to complete task: **{TASK_ID}**

[Paste the full task context from \`vtm context TASK-XXX\` here]

## YOUR APPROACH:

### Phase 1: Understand & Plan (2 min)
1. Read the task description and all acceptance criteria
2. Review dependencies (confirm completed)
3. Check files to create/modify
4. Identify test strategy

### Phase 2: TDD Implementation (if test_strategy = "TDD" or "Unit")

**For EACH Acceptance Criterion:**

1. **Write Test First** ✅
   \`\`\`typescript
   // Test for AC1: User type defined with all required fields
   describe('User Model', () => {
     it('should have id, email, and name fields', () => {
       const user: User = {
         id: '1',
         email: 'test@example.com',
         name: 'Test User'
       };
       expect(user).toBeDefined();
     });
   });
   \`\`\`

2. **Run Test** → See it fail ❌
3. **Write Minimal Code** to pass
4. **Run Test** → See it pass ✅
5. **Refactor** if needed
6. **Move to next AC**

### Phase 3: Integration Tests (if test_strategy = "Integration")
- Write tests that verify multiple components work together
- Test real data flows

### Phase 4: Direct Verification (if test_strategy = "Direct")
- Manual verification steps
- Build/compile checks
- Visual inspection

### Phase 5: Update VTM
After completion, provide:
\`\`\`json
{
  "task_id": "{TASK_ID}",
  "status": "completed",
  "completed_at": "2025-10-29T...",
  "commits": ["abc1234 feat(TASK-005): implement user model with validation [AC1-AC4]"],
  "files": {
    "created": ["src/models/user.ts", "src/models/user.test.ts"],
    "modified": []
  },
  "validation": {
    "tests_pass": true,
    "ac_verified": ["AC1", "AC2", "AC3", "AC4"]
  }
}
\`\`\`

## IMPORTANT RULES:
- ✅ **ALWAYS write tests for TDD/Unit strategies**
- ✅ **Run tests after each AC** (use Wallaby MCP if available)
- ✅ **Commit after each AC or logical group**
- ✅ **Update task status in vtm.json when done**
- ❌ **NEVER skip tests** for TDD/Unit strategies
- ❌ **NEVER implement multiple ACs without testing**

## OUTPUT FORMAT:
1. Show your TDD cycle for each AC
2. Final implementation
3. Test results
4. VTM update JSON (for running \`vtm complete\`)

Execute task **{TASK_ID}** now using TDD.
