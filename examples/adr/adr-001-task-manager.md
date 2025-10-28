# ADR-001: Task Manager Architecture

## Status
Accepted

## Context
We need a simple task management system for tracking development work. The system should support:
- Creating and tracking tasks
- Managing dependencies between tasks
- Test-driven development workflow
- Progress tracking

## Decision
We will build a CLI-based task manager with:

1. **Storage**: JSON file (vtm.json) for simplicity
2. **Tech Stack**: TypeScript + Node.js
3. **Interface**: Command-line interface (CLI)
4. **Test Framework**: Jest/Vitest for TDD

## Consequences

### Positive
- Simple to understand and maintain
- No database setup required
- Version control friendly (JSON in git)
- Fast startup time
- Perfect for solo/small teams

### Negative
- Not suitable for large teams (no concurrent editing)
- No real-time collaboration
- Limited query capabilities compared to database

## Implementation Requirements

### Core Features
1. Task CRUD operations (create, read, update, delete)
2. Dependency tracking
3. Status management (pending, in-progress, completed, blocked)
4. Progress statistics
5. Test strategy per task

### Technical Requirements
1. TypeScript for type safety
2. Atomic file writes to prevent corruption
3. Caching for performance
4. CLI with subcommands
5. Token-efficient context generation

### Quality Requirements
1. Unit tests for core logic
2. Integration tests for file operations
3. Error handling for missing files
4. Validation for task updates
