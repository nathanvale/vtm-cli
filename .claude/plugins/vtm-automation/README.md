# VTM Automation Plugin

Virtual Task Manager - Token-efficient task management for AI-assisted
development

**Version:** 1.0.0 | **Scope:** personal

## Quick Start

Commands are now available:

- `/vtm:next` - Get next ready task to work on
- `/vtm:context` - Generate minimal context for a specific task
- `/vtm:task` - View details of a specific task
- `/vtm:start` - Mark a task as in-progress
- `/vtm:complete` - Mark a task as completed
- `/vtm:stats` - Show VTM statistics and progress
- `/vtm:list` - List all tasks with their status

## Setup

1. **Verify vtm CLI is installed**

   ```bash
   vtm --version
   ```

   If not installed:

   ```bash
   npm link                    # From vtm-cli repo
   # or
   npm install -g vtm-cli      # When published
   ```

2. **Verify commands work**

   ```bash
   /vtm:next
   ```

3. **Enable git hooks (optional)**

   ```bash
   # Install hooks in your project's .git/hooks/
   cp .claude/hooks/vtm/vtm-pre-commit.sh .git/hooks/pre-commit
   cp .claude/hooks/vtm/vtm-post-checkout.sh .git/hooks/post-checkout
   cp .claude/hooks/vtm/vtm-pre-push.sh .git/hooks/pre-push
   cp .claude/hooks/vtm/vtm-post-merge.sh .git/hooks/post-merge
   chmod +x .git/hooks/*
   ```

4. **Verify with registry**
   ```bash
   /registry-scan vtm
   ```

## What's Included

- `/vtm:` commands (7 total)
- Auto-discovery skill with trigger phrases
- Hook scripts for automation:
  - `pre-commit`: Validates task dependencies and data integrity
  - `post-checkout`: Refreshes cache after branch switches
  - `pre-push`: Ensures task states are consistent
  - `post-merge`: Resolves vtm.json conflicts automatically

## The VTM Workflow

The Virtual Task Manager uses a token-efficient workflow:

### 1. Generate VTM from Specs

Use **PROMPT 1** (`prompts/1-generate-vtm.md`) to convert ADRs and specs into
`vtm.json`:

```
Input: ADR documents, specification files
Output: vtm.json with decomposed tasks, dependencies, acceptance criteria
```

### 2. Execute Tasks with TDD

Use **PROMPT 2** (`prompts/2-execute-task.md`) for implementation:

```bash
/vtm:next                    # Find ready task
/vtm:context TASK-003        # Get token-efficient context
# → Copy context to Claude with PROMPT 2
# → Implement with TDD based on test_strategy
/vtm:complete TASK-003       # Mark done, auto-updates stats
```

### 3. Add Features

Use **PROMPT 3** (`prompts/3-add-feature.md`) to append new tasks:

```
Input: New feature requirements
Output: Additional tasks added to existing vtm.json
```

## Token Efficiency

VTM achieves **99% token reduction** compared to loading full specs:

- **Traditional approach**: Load entire spec/ADR documents (~50,000+ tokens)
- **VTM approach**: Surgical task access (~500-2000 tokens)

**How it works:**

1. Decompose specs into discrete tasks once (PROMPT 1)
2. Access individual tasks surgically (PROMPT 2)
3. Dependencies are pre-resolved
4. Two context modes:
   - `minimal`: Full context with dependencies (~2000 tokens)
   - `compact`: Ultra-minimal for simple tasks (~500 tokens)

## Customization

### Commands

Edit `.claude/commands/vtm/*.md` to customize:

- Output formatting
- Error messages
- Additional validation
- Integration with other tools

### Skill

Edit `.claude/skills/vtm-expert/SKILL.md` to customize:

- Trigger phrases (match your vocabulary)
- Workflow descriptions
- Best practices for your team

### Hooks

Edit `.claude/hooks/vtm/*.sh` to customize:

- Validation rules
- Conflict resolution strategies
- Integration with CI/CD
- Team-specific checks

## Test Strategies

VTM supports four test strategies in the `test_strategy` field:

- **TDD**: High-risk work, tests written first (Red-Green-Refactor)
- **Unit**: Medium-risk, tests after implementation
- **Integration**: Cross-component behavior testing
- **Direct**: Setup/config work, manual verification

The test strategy guides implementation approach in PROMPT 2.

## Dependencies

Tasks can only depend on lower-numbered tasks (TASK-001 can be depended on by
TASK-002+).

**Validation:**

- Circular dependencies are prevented
- All dependencies must exist
- Blocked tasks properly linked
- Pre-commit hook validates integrity

## Stats Auto-Recalculation

Stats are automatically recalculated when you:

- Start a task (`/vtm:start`)
- Complete a task (`/vtm:complete`)
- Update any task status

The VTMWriter class handles this via `recalculateStats()`.

## Auto-Discovery

The vtm-expert skill automatically triggers when you say:

- "what should I work on?"
- "next task"
- "show my tasks"
- "task status"
- "get context for task"
- "start task TASK-XXX"
- "complete task TASK-XXX"
- "mark task done"
- And more...

Claude will suggest the appropriate `/vtm:` command for approval.

## Next Steps

1. **Test the commands**

   ```bash
   /vtm:next
   ```

2. **Try auto-discovery**
   - Say: "what should I work on?"
   - Claude suggests: `/vtm:next`

3. **Full workflow test**
   - Generate VTM: Use PROMPT 1 with a spec
   - Execute task: Use PROMPT 2 with `/vtm:context`
   - Track progress: Use `/vtm:stats`

4. **Enable hooks** (optional but recommended)
   - Copy hooks to `.git/hooks/`
   - Ensure validation runs on commits/merges

## Architecture

**Three-Layer Architecture:**

1. **CLI Layer** (`src/index.ts`)
   - Commander.js-based CLI
   - Orchestrates Reader/Writer/Builder

2. **Data Access Layer** (`src/lib/`)
   - `VTMReader`: Read-only operations, dependency resolution
   - `VTMWriter`: Atomic writes with auto stats recalculation
   - `ContextBuilder`: Token-efficient context generation

3. **Data Model** (`src/lib/types.ts`)
   - VTM: Top-level manifest
   - Task: Core entity with dependencies, criteria, validation
   - TaskContext: Task with resolved dependencies

## Support

- **Issues with commands?** Check `.claude/commands/vtm/`
- **Hook problems?** Check `.claude/hooks/vtm/`
- **Need help?** See `CLAUDE.md` in repository root

## See Also

- Registry: `/registry-scan`
- Design: `.claude/designs/vtm.json`
- Prompts: `prompts/1-generate-vtm.md`, `prompts/2-execute-task.md`,
  `prompts/3-add-feature.md`
- Project docs: `CLAUDE.md`, `README.md`, `QUICKSTART.md`
