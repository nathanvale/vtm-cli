# Technical Specification: User Profile API

## Overview

This specification describes the implementation of the User Profile API as decided in **ADR-TEST-profile-api.md**.

## Architecture

The profile system consists of three layers:

1. **Storage Layer**: File system operations (`~/.vtm/profile.json`)
2. **API Layer**: TypeScript interface (`src/lib/profile.ts`)
3. **CLI Layer**: User commands (`vtm profile`)

## Implementation Tasks

### Task 1: Create Profile Data Model

**Description**: Define TypeScript types and interfaces for user profile data structure.

**Acceptance Criteria**:

- UserProfile interface defined with all required fields
- Type exports available from `src/lib/types.ts`
- JSDoc comments documenting each field
- Default profile constant defined

**Files**:

- Modify: `src/lib/types.ts`

**Test Strategy**: Direct (type checking only)

**Code Example**:

```typescript
// Line 50-70 in types.ts
export interface UserProfile {
  username: string
  preferences: UserProfilePreferences
  recentProjects: string[]
  statistics: UserStatistics
}

export const DEFAULT_PROFILE: UserProfile = {
  username: "user",
  preferences: {
    defaultTestStrategy: "TDD",
    autoGenerateSummary: false,
  },
  recentProjects: [],
  statistics: {
    tasksCompleted: 0,
    averageTaskHours: 0,
  },
}
```

### Task 2: Implement Profile Storage Manager

**Description**: Create ProfileStorage class to handle reading and writing profile.json with atomic operations.

**Acceptance Criteria**:

- Can create profile directory if missing
- Can initialize default profile
- Atomic writes using temp file + rename
- Validates profile schema on read
- Returns default profile if file missing/corrupted

**Files**:

- Create: `src/lib/profile-storage.ts`
- Create: `test/profile-storage.test.ts`

**Dependencies**: Task 1 must be completed (needs UserProfile type)

**Test Strategy**: TDD (high-risk file operations)

**Test Requirements**:

- Test: Initialize profile directory
- Test: Write and read profile atomically
- Test: Handle corrupted profile gracefully
- Test: Validate profile schema
- Test: Return default on first access

**Code Example**:

```typescript
// Lines 20-45 in profile-storage.ts
export class ProfileStorage {
  private profilePath: string

  constructor() {
    const homeDir = os.homedir()
    this.profilePath = path.join(homeDir, ".vtm", "profile.json")
  }

  async read(): Promise<UserProfile> {
    try {
      const content = await readFile(this.profilePath, "utf-8")
      const profile = JSON.parse(content)
      this.validate(profile)
      return profile
    } catch (error) {
      return DEFAULT_PROFILE
    }
  }

  async write(profile: UserProfile): Promise<void> {
    await mkdir(path.dirname(this.profilePath), { recursive: true })
    const temp = `${this.profilePath}.tmp`
    await writeFile(temp, JSON.stringify(profile, null, 2))
    await rename(temp, this.profilePath)
  }
}
```

### Task 3: Create Profile API Facade

**Description**: Implement ProfileManager class providing high-level API for profile operations (get, update, reset).

**Acceptance Criteria**:

- Provides getProfile(), updateProfile(), resetProfile() methods
- Caches profile in memory after first load
- Type-safe updates (Partial<UserProfile>)
- Singleton pattern for consistent state

**Files**:

- Create: `src/lib/profile.ts`
- Create: `test/profile.test.ts`

**Dependencies**: Task 2 must be completed (needs ProfileStorage)

**Test Strategy**: Unit (medium-risk business logic)

**Test Requirements**:

- Test: Get profile returns cached value
- Test: Update profile merges partial updates
- Test: Reset profile restores defaults
- Test: Singleton returns same instance

**Code Example**:

```typescript
// Lines 15-40 in profile.ts
export class ProfileManager {
  private static instance: ProfileManager
  private storage: ProfileStorage
  private cache: UserProfile | null = null

  private constructor() {
    this.storage = new ProfileStorage()
  }

  static getInstance(): ProfileManager {
    if (!ProfileManager.instance) {
      ProfileManager.instance = new ProfileManager()
    }
    return ProfileManager.instance
  }

  async getProfile(): Promise<UserProfile> {
    if (!this.cache) {
      this.cache = await this.storage.read()
    }
    return this.cache
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    const current = await this.getProfile()
    this.cache = { ...current, ...updates }
    await this.storage.write(this.cache)
  }
}
```

### Task 4: Add CLI Commands

**Description**: Add `vtm profile` commands to view, edit, and reset user profile via CLI.

**Acceptance Criteria**:

- `vtm profile view` displays current profile
- `vtm profile set <key> <value>` updates preference
- `vtm profile reset` restores defaults
- Colored output using chalk
- Error handling for invalid keys/values

**Files**:

- Modify: `src/index.ts`

**Dependencies**: Task 3 must be completed (needs ProfileManager API)

**Test Strategy**: Integration (CLI integration testing)

**Test Requirements**:

- Test: `vtm profile view` outputs formatted profile
- Test: `vtm profile set` updates preference
- Test: `vtm profile reset` confirms before reset
- Test: Invalid keys show error message

**Code Example**:

```typescript
// Lines 300-330 in src/index.ts
program
  .command("profile")
  .description("Manage user profile and preferences")
  .action(() => {
    program.help()
  })

program
  .command("profile view")
  .description("View current profile")
  .action(async () => {
    const manager = ProfileManager.getInstance()
    const profile = await manager.getProfile()
    console.log(chalk.bold("\\n👤 User Profile\\n"))
    console.log(JSON.stringify(profile, null, 2))
  })

program
  .command("profile set <key> <value>")
  .description("Update profile preference")
  .action(async (key, value) => {
    const manager = ProfileManager.getInstance()
    // Parse key as nested path: preferences.defaultTestStrategy
    await manager.updateProfile({ [key]: value })
    console.log(chalk.green(`✅ Updated ${key} = ${value}`))
  })
```

## Non-Functional Requirements

### Performance

- Profile read operations: < 10ms
- Profile write operations: < 50ms
- Memory footprint: < 100KB

### Error Handling

- Graceful degradation if profile corrupted
- Clear error messages for CLI users
- Log errors to stderr (not stdout)

### Security

- Profile stored in user home directory (proper permissions)
- No sensitive data in profile
- Validate all inputs from CLI

## Testing Strategy Summary

| Task   | Strategy    | Rationale                                           |
| ------ | ----------- | --------------------------------------------------- |
| Task 1 | Direct      | Type definitions only                               |
| Task 2 | TDD         | High-risk file operations, needs red-green-refactor |
| Task 3 | Unit        | Business logic with clear inputs/outputs            |
| Task 4 | Integration | CLI integration, end-to-end validation              |

## Risks

- **High Risk**: File system operations (Task 2) - Atomic writes critical
- **Medium Risk**: API design (Task 3) - Must handle edge cases
- **Low Risk**: Type definitions (Task 1) - Straightforward TypeScript
- **Low Risk**: CLI commands (Task 4) - Standard Commander.js patterns

## Acceptance Criteria (Overall)

- [ ] User can view profile with `vtm profile view`
- [ ] User can update preferences with `vtm profile set`
- [ ] Profile persists across CLI sessions
- [ ] Corrupted profile automatically resets to defaults
- [ ] All tests pass (unit + integration)
- [ ] Code coverage > 80% for profile modules

## Dependencies

```
Task 1 (Types)
   ↓
Task 2 (Storage) ← depends on Task 1
   ↓
Task 3 (API) ← depends on Task 2
   ↓
Task 4 (CLI) ← depends on Task 3
```

## Estimated Timeline

- Task 1: 1 hour (type definitions)
- Task 2: 4 hours (TDD implementation + tests)
- Task 3: 3 hours (API + unit tests)
- Task 4: 2 hours (CLI integration + tests)

**Total**: 10 hours
