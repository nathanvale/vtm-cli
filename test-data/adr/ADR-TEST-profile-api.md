# ADR-TEST: User Profile API

## Status

Accepted

## Context

The VTM CLI needs a way to store and retrieve user profile information including preferences, recent projects, and usage statistics. Currently, there is no persistent storage for user data.

## Decision

We will implement a simple JSON-based profile storage system with a TypeScript API layer.

### Components

1. **Profile Storage**: JSON file at `~/.vtm/profile.json`
2. **Profile API**: TypeScript module `src/lib/profile.ts`
3. **CLI Integration**: Add `vtm profile` command to view/edit

### Data Model

```typescript
interface UserProfile {
  username: string
  preferences: {
    defaultTestStrategy: 'TDD' | 'Unit' | 'Integration' | 'Direct'
    autoGenerateSummary: boolean
  }
  recentProjects: string[]
  statistics: {
    tasksCompleted: number
    averageTaskHours: number
  }
}
```

## Rationale

- **JSON Storage**: Simple, human-readable, no database dependency
- **TypeScript API**: Type-safe operations on profile data
- **CLI Commands**: Consistent with existing VTM interface

## Constraints

- Profile must be stored in user home directory
- API must handle missing/corrupted profiles gracefully
- All profile operations must be synchronous (no async overhead)
- Profile size should not exceed 10KB

## Implementation Requirements

1. Create profile directory if it doesn't exist
2. Initialize default profile on first access
3. Validate profile schema before reading
4. Atomic writes (write-to-temp + rename pattern)
5. Error handling for file system errors

## Consequences

### Positive

- Simple implementation, no external dependencies
- Easy for users to inspect and manually edit
- Type-safe API prevents data corruption

### Negative

- Not suitable for large datasets
- No concurrent access protection
- Manual migration if schema changes

## References

- VTM Storage Pattern: `src/lib/vtm-writer.ts` (atomic writes)
- User Config Location: XDG Base Directory spec
