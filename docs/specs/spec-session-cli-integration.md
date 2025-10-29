---
title: "Session Management CLI Integration Technical Specification"
status: approved
owner: VTM CLI Team
version: 1.0.0
related_adrs: [ADR-048-session-cli-integration.md]
---

# Session Management CLI Integration Technical Specification

## Executive Summary

This specification defines the implementation of session management CLI commands for VTM. It integrates the existing `VTMSession` TypeScript class directly into the `vtm` CLI by adding three subcommands: `vtm session get`, `vtm session set`, and `vtm session clear`. The implementation eliminates the bash/Node.js bridge helper script (`.claude/commands/helpers/session.mjs`), completes the missing integration in `/vtm:work`, and provides manual session control for developers. No data model changes are required.

---

## Scope

### In Scope

- Three new CLI subcommands under `vtm session`: `get`, `set`, `clear`
- Integration with existing `VTMSession` class (no new implementation)
- Migration of all slash commands from `session.mjs` helper to `vtm session` CLI
- Removal of `.claude/commands/helpers/session.mjs` helper script
- Fix missing session tracking in `/vtm:work` command
- CLI help text and documentation updates
- Unit and integration tests for CLI commands

### Out of Scope

- Changes to `VTMSession` class implementation (fully implemented and tested)
- Session history or multi-task session tracking (future enhancement)
- Session validation or task existence checking (keep simple)
- Configuration options for session file location (use defaults)
- Web or REST API for session management (CLI only)

### Dependencies

- **ADRs**:
  - [ADR-048: Session Management CLI Integration](../adr/ADR-048-session-cli-integration.md)
- **Related Specs**:
  - None
- **Existing Code**:
  - `src/lib/vtm-session.ts` - VTMSession class (no changes)
  - `src/lib/__tests__/vtm-session.test.ts` - 17 passing tests (no changes)
  - `.claude/commands/helpers/session.mjs` - To be removed

---

## Success Criteria

- [x] `vtm session get` returns current task ID with exit code 0 (or exit 1 if not set)
- [x] `vtm session set TASK-003` saves task ID to `.vtm-session` file
- [x] `vtm session clear` removes `.vtm-session` file
- [x] All slash commands (`/vtm:work`, `/vtm:done`, `/vtm:start`, `/vtm:context`) use `vtm session` CLI
- [x] `/vtm:work TASK-003` successfully sets session state
- [x] `/vtm:done` completes current task from session without requiring task ID
- [x] `.claude/commands/helpers/session.mjs` removed from codebase
- [x] Help text (`vtm session --help`) documents all three subcommands
- [x] No breaking changes to user-facing slash command behavior
- [x] 100% backward compatibility with existing workflows

---

## System Architecture

### Component Diagram

```
┌─────────────────────────────────────────┐
│         CLI Layer (src/index.ts)        │
│                                         │
│  vtm session get    → VTMSession.get()  │
│  vtm session set    → VTMSession.set()  │
│  vtm session clear  → VTMSession.clear()│
└────────────┬────────────────────────────┘
             │
             v
┌─────────────────────────────────────────┐
│    VTMSession (src/lib/vtm-session.ts)  │
│                                         │
│  - getCurrentTask()                     │
│  - setCurrentTask(id)                   │
│  - clearCurrentTask()                   │
│  - Persists to .vtm-session file        │
└─────────────────────────────────────────┘
             │
             v
┌─────────────────────────────────────────┐
│      .vtm-session (JSON file)           │
│                                         │
│  { "currentTask": "TASK-003" }          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│   Slash Commands (.claude/commands/)    │
│                                         │
│  /vtm:work    → vtm session set         │
│  /vtm:done    → vtm session get/clear   │
│  /vtm:start   → vtm session get         │
│  /vtm:context → vtm session get         │
└─────────────────────────────────────────┘
```

### Key Components

#### Component 1: VTMSession CLI Commands

- **Purpose**: Expose VTMSession functionality through vtm CLI
- **Responsibilities**:
  - Parse subcommands: get/set/clear
  - Call VTMSession methods
  - Handle output and exit codes
  - Provide helpful error messages
- **Technology**: Commander.js subcommands
- **Location**: `src/index.ts`

#### Component 2: VTMSession Class (Existing)

- **Purpose**: Manage current task state persistence
- **Responsibilities**:
  - Load/save `.vtm-session` JSON file
  - Provide get/set/clear operations
  - Handle file corruption gracefully
- **Technology**: TypeScript class with fs operations
- **Location**: `src/lib/vtm-session.ts` (no changes)

#### Component 3: Slash Command Integration

- **Purpose**: Update slash commands to use vtm CLI
- **Responsibilities**:
  - Replace `node session.mjs` calls with `vtm session` calls
  - Add session tracking to `/vtm:work`
  - Maintain existing UX and error handling
- **Technology**: Bash scripts in markdown files
- **Location**: `.claude/commands/vtm/*.md`

### Data Flow

```
User Workflow: /vtm:work TASK-003
1. User runs: /vtm:work TASK-003
2. Bash script: vtm start TASK-003
3. On success: vtm session set TASK-003
4. VTMSession writes: .vtm-session {"currentTask": "TASK-003"}
5. Display task context

User Workflow: /vtm:done
1. User runs: /vtm:done
2. Bash script: TASK_ID=$(vtm session get)
3. VTMSession reads: .vtm-session {"currentTask": "TASK-003"}
4. Returns: TASK-003
5. Bash script: vtm complete TASK-003
6. Bash script: vtm session clear
7. VTMSession removes: .vtm-session file
```

### Integration Points

- **CLI to Library**: `vtm session` commands call VTMSession methods directly
- **Slash Commands to CLI**: Bash scripts call `vtm session` via subprocess
- **Session File**: `.vtm-session` in project root (created/managed by VTMSession)

---

## Technical Implementation

### Technology Stack

- **Language/Runtime**: TypeScript 5.x with Node.js 20
- **Key Libraries**:
  - "commander": "^12.0.0" (CLI subcommand parsing)
  - "chalk": "^4.1.2" (colored output for success/error messages)
- **Development Tools**: Existing test suite (no new dependencies)

### File Structure

```
src/
  lib/
    vtm-session.ts              # Existing (no changes)
    __tests__/
      vtm-session.test.ts       # Existing 17 tests (no changes)
  index.ts                      # Add session subcommands (new code)

.claude/
  commands/
    helpers/
      session.mjs               # DELETE THIS FILE
    vtm/
      work.md                   # UPDATE: Add vtm session set
      done.md                   # UPDATE: Replace helper calls
      start.md                  # UPDATE: Replace helper calls
      context.md                # UPDATE: Replace helper calls

docs/
  adr/
    ADR-048-session-cli-integration.md   # Created
  specs/
    spec-session-cli-integration.md      # This file
```

### Core Interfaces

```typescript
// src/lib/vtm-session.ts (EXISTING - no changes)

export class VTMSession {
  private sessionFilePath: string
  private currentTask: string | null = null

  constructor(basePath: string = process.cwd()) {
    this.sessionFilePath = path.join(basePath, ".vtm-session")
    this.loadSession()
  }

  setCurrentTask(taskId: string): void
  getCurrentTask(): string | null
  clearCurrentTask(): void

  private loadSession(): void
  private saveSession(): void
  private removeSessionFile(): void
}
```

### Implementation Details

#### Feature 1: vtm session get

**Purpose**: Get current task ID from session

```typescript
// src/index.ts

// Add import
import { VTMSession } from "./lib"

// Create session subcommand group
const sessionCommand = program
  .command("session")
  .description("Manage current task session")

// vtm session get
sessionCommand
  .command("get")
  .description("Get current task ID")
  .action(async () => {
    try {
      const session = new VTMSession()
      const currentTask = session.getCurrentTask()

      if (currentTask) {
        // Output task ID to stdout (for bash capture)
        console.log(currentTask)
        process.exit(0)
      } else {
        // No current task - exit with code 1 (bash conditional)
        process.exit(1)
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })
```

**Acceptance Criteria**:

- Outputs task ID to stdout if session exists
- Exit code 0 if task ID found
- Exit code 1 if no session (empty)
- Exit code 1 on any error
- Stdout output is clean (just task ID, no formatting)

**Usage**:

```bash
$ vtm session get
TASK-003

$ echo $?
0

$ TASK_ID=$(vtm session get)
$ echo $TASK_ID
TASK-003
```

---

#### Feature 2: vtm session set

**Purpose**: Set current task ID in session

```typescript
// src/index.ts

sessionCommand
  .command("set <task-id>")
  .description("Set current task ID")
  .action(async (taskId: string) => {
    try {
      const session = new VTMSession()
      session.setCurrentTask(taskId)
      console.log(chalk.green(`✅ Current task set: ${taskId}`))
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })
```

**Acceptance Criteria**:

- Accepts task ID as required positional argument
- Creates `.vtm-session` file with JSON: `{"currentTask": "TASK-XXX"}`
- Shows success message with green checkmark
- Exit code 0 on success
- Exit code 1 on any error (e.g., no task ID provided)

**Usage**:

```bash
$ vtm session set TASK-003
✅ Current task set: TASK-003

$ cat .vtm-session
{
  "currentTask": "TASK-003"
}
```

---

#### Feature 3: vtm session clear

**Purpose**: Clear current task from session

```typescript
// src/index.ts

sessionCommand
  .command("clear")
  .description("Clear current task")
  .action(async () => {
    try {
      const session = new VTMSession()
      session.clearCurrentTask()
      console.log(chalk.green("✅ Session cleared"))
    } catch (error) {
      console.error(chalk.red(`Error: ${(error as Error).message}`))
      process.exit(1)
    }
  })
```

**Acceptance Criteria**:

- Removes `.vtm-session` file if it exists
- Shows success message even if no session exists (idempotent)
- Exit code 0 on success
- Exit code 1 only on filesystem errors

**Usage**:

```bash
$ vtm session clear
✅ Session cleared

$ ls .vtm-session
ls: .vtm-session: No such file or directory
```

---

#### Feature 4: Update /vtm:work to Set Session

**Purpose**: Complete the streamlined workflow by setting session in `/vtm:work`

**File**: `.claude/commands/vtm/work.md`

**Change Location**: After line 83 (after successful `vtm start`)

```bash
# OLD (lines 67-83):
echo "▶️  Marking task as in-progress..."
vtm start "$TASK_ID"

if [[ $? -ne 0 ]]; then
    echo ""
    echo "❌ Failed to start task"
    # ... error handling ...
    exit 1
fi

# NEW (add after successful start):
echo "▶️  Marking task as in-progress..."
vtm start "$TASK_ID"

if [[ $? -ne 0 ]]; then
    echo ""
    echo "❌ Failed to start task"
    # ... error handling ...
    exit 1
fi

# Set current task in session
vtm session set "$TASK_ID" > /dev/null 2>&1
```

**Acceptance Criteria**:

- Session is set only if `vtm start` succeeds
- Session output is silenced (redirected to /dev/null)
- Does not affect existing error handling
- User sees no difference in output (invisible change)

---

#### Feature 5: Update /vtm:done to Use CLI

**Purpose**: Replace `session.mjs` helper with `vtm session` CLI

**File**: `.claude/commands/vtm/done.md`

**Change 1**: Lines 60-63 (get current task)

```bash
# OLD:
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SESSION_HELPER="$SCRIPT_DIR/../helpers/session.mjs"
TASK_ID=$(node "$SESSION_HELPER" get 2>/dev/null)

# NEW:
TASK_ID=$(vtm session get 2>/dev/null)
```

**Change 2**: Line 99 (clear session)

```bash
# OLD:
node "$SESSION_HELPER" clear 2>/dev/null

# NEW:
vtm session clear > /dev/null 2>&1
```

**Acceptance Criteria**:

- `/vtm:done` works identically to before
- Gets task ID from session via `vtm session get`
- Clears session after successful completion via `vtm session clear`
- No output from session commands (redirected)

---

#### Feature 6: Update /vtm:start to Use CLI

**Purpose**: Replace manual `.vtm-session` file parsing with CLI

**File**: `.claude/commands/vtm/start.md`

**Change Location**: Lines 89-90 and 100-101

```bash
# OLD (line 90):
CURRENT_TASK=$(cat .vtm-session 2>/dev/null | grep -o '"currentTask":"[^"]*"' | cut -d'"' -f4)

# NEW:
CURRENT_TASK=$(vtm session get 2>/dev/null)
```

**Acceptance Criteria**:

- Smart hint "You're already working on this task" still works
- Uses `vtm session get` instead of manual file parsing
- More robust (handles malformed JSON gracefully via VTMSession)

---

#### Feature 7: Update /vtm:context to Use CLI

**Purpose**: Replace manual `.vtm-session` file parsing with CLI

**File**: `.claude/commands/vtm/context.md`

**Change Location**: Lines 74-77

```bash
# OLD (lines 74-77):
IS_CURRENT_TASK=false
if [[ -f ".vtm-session" ]]; then
    CURRENT_TASK=$(cat .vtm-session 2>/dev/null | grep -o '"currentTask":"[^"]*"' | cut -d'"' -f4)
    if [[ "$CURRENT_TASK" == "$TASK_ID" ]]; then
        IS_CURRENT_TASK=true
    fi
fi

# NEW:
IS_CURRENT_TASK=false
CURRENT_TASK=$(vtm session get 2>/dev/null)
if [[ "$CURRENT_TASK" == "$TASK_ID" ]]; then
    IS_CURRENT_TASK=true
fi
```

**Acceptance Criteria**:

- "📌 This is your current task" indicator still appears
- Uses `vtm session get` instead of manual file parsing
- Simplified logic (4 lines instead of 7)

---

### Error Handling

| Scenario               | Command                   | Behavior                                               |
| ---------------------- | ------------------------- | ------------------------------------------------------ |
| No session file exists | `vtm session get`         | Exit code 1, no output                                 |
| Session file corrupted | `vtm session get`         | Exit code 1, no output (VTMSession handles gracefully) |
| No task ID provided    | `vtm session set`         | Commander shows usage, exit code 1                     |
| Invalid task ID format | `vtm session set INVALID` | **Accepts any string** (no validation - keeps simple)  |
| Filesystem permissions | `vtm session set/clear`   | Error message, exit code 1                             |

**Design Decision**: No task ID validation (e.g., checking if task exists in VTM). Rationale:

- Keeps commands simple and fast (no I/O for vtm.json)
- User might set session before VTM file exists (edge case)
- Session is advisory, not authoritative
- Validation can be added later without breaking changes

---

### Configuration

No configuration required. Session file location is hardcoded:

- Path: `<project-root>/.vtm-session`
- Format: JSON `{"currentTask": "TASK-XXX"}`
- Behavior: Project-specific (different session per directory)

Future enhancement: Allow custom path via `VTM_SESSION_PATH` env var (out of scope).

---

## Test Strategy

### Test Pyramid

```
     /\
    /E2E\        [6 tests - Full workflow integration]
   /------\
  /  INT   \     [9 tests - CLI command behavior]
 /----------\
/ UNIT       \   [17 tests - VTMSession class (existing)]
--------------
```

### Test Scenarios

#### Unit Tests (Existing)

**Coverage**: 17 tests in `src/lib/__tests__/vtm-session.test.ts`

**No changes needed** - VTMSession class is fully tested.

#### Integration Tests (New)

**Coverage Target**: All CLI commands and edge cases

| Scenario                | Test Case                                  | Expected Outcome                           |
| ----------------------- | ------------------------------------------ | ------------------------------------------ |
| Get empty session       | `vtm session get` (no file)                | Exit code 1, no output                     |
| Get existing session    | `vtm session get` (with file)              | Outputs "TASK-003", exit code 0            |
| Set session             | `vtm session set TASK-003`                 | Creates file, success message, exit code 0 |
| Set overwrites existing | `vtm session set TASK-004` (after set 003) | Updates file, exit code 0                  |
| Clear session           | `vtm session clear`                        | Removes file, success message, exit code 0 |
| Clear empty session     | `vtm session clear` (no file)              | Success message (idempotent), exit code 0  |
| Set without task ID     | `vtm session set`                          | Commander error, exit code 1               |
| Get with corrupted JSON | Manually corrupt .vtm-session              | Exit code 1, no output                     |
| Help text               | `vtm session --help`                       | Shows subcommands with descriptions        |

#### End-to-End Tests (New)

**Coverage Target**: Full workflows with slash commands

| Scenario                        | Test Case                                                   | Dependencies  | Expected Outcome                             |
| ------------------------------- | ----------------------------------------------------------- | ------------- | -------------------------------------------- |
| Work → Done workflow            | `/vtm:work TASK-003` → `/vtm:done`                          | Mock vtm.json | Session set, task completed, session cleared |
| Work → Work (different task)    | `/vtm:work TASK-003` → `/vtm:work TASK-004`                 | Mock vtm.json | Session updated to TASK-004                  |
| Start with current task hint    | `/vtm:work TASK-003` → `/vtm:start TASK-003`                | Mock vtm.json | Shows "already current task" warning         |
| Context shows current indicator | `/vtm:work TASK-003` → `/vtm:context TASK-003`              | Mock vtm.json | Shows "📌 This is your current task"         |
| Done without session            | `/vtm:done` (no session)                                    | Mock vtm.json | Error: "No current task in session"          |
| Manual session control          | `vtm session set` → `vtm session get` → `vtm session clear` | None          | Manual CLI works independently               |

---

## Task Breakdown

### Task 1: Add VTMSession CLI Commands

**Description**: Implement three CLI subcommands (`vtm session get|set|clear`) in `src/index.ts` using existing VTMSession class.

**Acceptance Criteria**:

- `vtm session` subcommand group exists
- `get` command outputs task ID with exit code 0 (or exit 1 if empty)
- `set <task-id>` command saves to `.vtm-session` file
- `clear` command removes `.vtm-session` file
- Help text (`vtm session --help`) documents all three commands
- Exit codes follow Unix conventions (0=success, 1=error)
- Integration tests cover all commands and edge cases

**Dependencies**: None (uses existing VTMSession class)

**Test Strategy**: TDD

**Estimated Hours**: 2

**Files**:

- Modify: `src/index.ts` (add session subcommands after line 407)
- Modify: `src/lib/index.ts` (export VTMSession)
- Create: `src/__tests__/cli-session.test.ts` (integration tests for CLI)

---

### Task 2: Update /vtm:work to Set Session

**Description**: Add `vtm session set` call to `/vtm:work` command after successful task start. This completes the streamlined workflow.

**Acceptance Criteria**:

- `/vtm:work TASK-003` sets current task in session after `vtm start` succeeds
- Session output is silenced (redirected to /dev/null)
- Failure to set session does not fail the command (graceful degradation)
- User experience unchanged (invisible improvement)
- Integration test verifies session is set

**Dependencies**: Task 1

**Test Strategy**: Integration

**Estimated Hours**: 0.5

**Files**:

- Modify: `.claude/commands/vtm/work.md` (add session set after line 83)

---

### Task 3: Update /vtm:done to Use vtm session CLI

**Description**: Replace `node session.mjs` calls in `/vtm:done` with `vtm session get` and `vtm session clear`.

**Acceptance Criteria**:

- `/vtm:done` gets current task via `vtm session get` instead of helper
- `/vtm:done` clears session via `vtm session clear` instead of helper
- Workflow behavior unchanged (backward compatible)
- No references to `session.mjs` remain in file

**Dependencies**: Task 1

**Test Strategy**: Integration

**Estimated Hours**: 0.5

**Files**:

- Modify: `.claude/commands/vtm/done.md` (replace helper calls)

---

### Task 4: Update /vtm:start to Use vtm session CLI

**Description**: Replace manual `.vtm-session` file parsing in `/vtm:start` with `vtm session get` for smart hints.

**Acceptance Criteria**:

- Smart hint "already working on this task" uses `vtm session get`
- No manual JSON parsing with grep/cut
- More robust to malformed session files
- Behavior unchanged (backward compatible)

**Dependencies**: Task 1

**Test Strategy**: Integration

**Estimated Hours**: 0.25

**Files**:

- Modify: `.claude/commands/vtm/start.md` (replace file parsing with CLI)

---

### Task 5: Update /vtm:context to Use vtm session CLI

**Description**: Replace manual `.vtm-session` file parsing in `/vtm:context` with `vtm session get` for current task indicator.

**Acceptance Criteria**:

- "📌 This is your current task" indicator uses `vtm session get`
- No manual JSON parsing
- Simplified logic (fewer lines)
- Behavior unchanged (backward compatible)

**Dependencies**: Task 1

**Test Strategy**: Integration

**Estimated Hours**: 0.25

**Files**:

- Modify: `.claude/commands/vtm/context.md` (replace file parsing with CLI)

---

### Task 6: Remove session.mjs Helper Script

**Description**: Delete `.claude/commands/helpers/session.mjs` helper script and verify no remaining references.

**Acceptance Criteria**:

- File `.claude/commands/helpers/session.mjs` deleted
- No grep matches for "session.mjs" in `.claude/commands/`
- No grep matches for "SESSION_HELPER" in `.claude/commands/`
- Build succeeds after deletion

**Dependencies**: Tasks 2, 3, 4, 5

**Test Strategy**: Direct

**Estimated Hours**: 0.25

**Files**:

- Delete: `.claude/commands/helpers/session.mjs`

---

### Task 7: Update Documentation

**Description**: Update CLAUDE.md documentation to reflect new CLI commands and remove references to pending integration.

**Acceptance Criteria**:

- CLAUDE.md section on Session State Tracking updated (lines 229-249)
- Documents `vtm session get|set|clear` commands
- Removes note about "integration pending"
- States "Session state is fully integrated"
- CLI help text accurate for all commands

**Dependencies**: Task 6

**Test Strategy**: Direct

**Estimated Hours**: 0.5

**Files**:

- Modify: `CLAUDE.md` (update Session State Tracking section)

---

### Task 8: End-to-End Testing

**Description**: Manually test full workflows to verify all changes work together correctly.

**Acceptance Criteria**:

- `/vtm:work TASK-003` → `/vtm:done` workflow works (session set and cleared)
- Smart hints in `/vtm:start` and `/vtm:context` work correctly
- Manual CLI usage: `vtm session set/get/clear` works independently
- No regressions in existing slash command behavior

**Dependencies**: Task 7

**Test Strategy**: Direct

**Estimated Hours**: 1

**Test Script**:

```bash
# Test 1: Full workflow
/vtm:work TASK-003
vtm session get              # Should output: TASK-003
/vtm:done
vtm session get              # Should exit with code 1

# Test 2: Smart hints
/vtm:work TASK-003
/vtm:start TASK-003          # Should warn: already current task
/vtm:context TASK-003        # Should show: 📌 This is your current task

# Test 3: Manual CLI
vtm session set TASK-999
vtm session get              # Should output: TASK-999
vtm session clear
vtm session get              # Should exit with code 1

# Test 4: Error cases
/vtm:done                    # Should error: no current task in session
vtm session set              # Should error: task ID required
```

---

## Risks & Mitigations

| Risk                                       | Impact | Probability | Mitigation                                                           |
| ------------------------------------------ | ------ | ----------- | -------------------------------------------------------------------- |
| Breaking change to slash commands          | High   | Low         | All changes are backward compatible; slash commands work identically |
| Session file corruption causes errors      | Medium | Low         | VTMSession already handles corruption gracefully (loads clean state) |
| Users rely on session.mjs directly         | Low    | Very Low    | Helper is internal implementation; no public documentation           |
| CLI binary not available in slash commands | High   | Very Low    | Test with `command -v vtm` in each slash command                     |
| Session not set due to silent failure      | Medium | Low         | Log failures for debugging (even if silenced to user)                |

---

## Performance Considerations

- **Command Latency**: `vtm session` commands are fast (<10ms) - just file I/O
- **Slash Command Impact**: Adding `vtm session set` to `/vtm:work` adds ~5ms (negligible)
- **Memory Usage**: No additional memory overhead (VTMSession is lightweight)
- **File I/O**: Session file is small (<100 bytes JSON) - no performance concern

**Bottlenecks**:

- None expected; session operations are trivial compared to vtm.json loading

**Optimization Strategy**:

- Not required; session file operations are already optimal

---

## Security & Compliance

- **Input Validation**: Task ID is not validated (accepts any string) - low risk
- **File Permissions**: `.vtm-session` inherits project directory permissions
- **Data Handling**: Session file is plain JSON, no sensitive data
- **Secrets Management**: N/A (no secrets involved)

**Security Notes**:

- Session file is project-specific (not global) - isolated to repository
- No network access or external dependencies
- No code execution from session data

---

## Monitoring & Observability

- **Logs**: CLI output shows success/error messages (chalk colored)
- **Metrics**: Could track `vtm session` usage via telemetry (future enhancement)
- **Debugging**: Session file is human-readable JSON (easy to inspect)
- **Alerts**: N/A (no production deployment)

**Debug Tips**:

```bash
# View current session
cat .vtm-session

# Test session operations
vtm session set TASK-DEBUG
vtm session get
vtm session clear
```

---

## Open Questions

All questions resolved during ADR-048 review.

---

## Appendix

### Related Documentation

- **ADRs**:
  - [ADR-048: Session Management CLI Integration](../adr/ADR-048-session-cli-integration.md)
- **Related Specs**:
  - None
- **Code**:
  - `src/lib/vtm-session.ts` - VTMSession class implementation
  - `src/lib/__tests__/vtm-session.test.ts` - Existing test suite (17 tests)

### Glossary

- **Session**: Current task state tracked in `.vtm-session` file
- **Current Task**: The task a developer is actively working on (advisory state)
- **Streamlined Workflow**: `/vtm:work` → implement → `/vtm:done` (no task IDs needed)
- **Session File**: `.vtm-session` JSON file in project root
- **Exit Code**: Unix convention - 0 for success, non-zero for failure

### Examples

**Example 1: Manual Session Control**

```bash
$ vtm session set TASK-042
✅ Current task set: TASK-042

$ vtm session get
TASK-042

$ vtm session clear
✅ Session cleared
```

**Example 2: Streamlined Workflow**

```bash
$ /vtm:work TASK-042
🚀 Starting work on: TASK-042
▶️  Marking task as in-progress...
✅ Task marked as in-progress

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Task Context (minimal mode):
[... context output ...]

# ... implement task ...

$ /vtm:done
✅ Completing current task: TASK-042
✅ Task TASK-042 marked as completed
🎯 Next Available Tasks:
[... next tasks ...]
```

**Example 3: Session File Format**

```json
{
  "currentTask": "TASK-042"
}
```

---

## Version History

| Version | Date       | Author       | Changes                                          |
| ------- | ---------- | ------------ | ------------------------------------------------ |
| 1.0.0   | 2025-10-30 | VTM CLI Team | Initial specification approved alongside ADR-048 |
