# VTM CLI

Virtual Task Manager for AI-assisted development with Claude Code.

## Overview

VTM CLI is a token-efficient task management tool that solves token bloat by providing surgical access to task manifests instead of loading everything into context, achieving **99% token reduction**.

### Key Features

- **Token Efficient**: Minimal context generation for AI workflows
- **Dependency Management**: Automatic dependency resolution and blocking
- **Plan-to-VTM Bridge**: Transform ADR+Spec documents into executable tasks using AI
- **TDD Support**: Built-in test strategy tracking (TDD, Unit, Integration, Direct)
- **Atomic Operations**: Crash-safe file operations with automatic stats recalculation
- **Rich Context**: Optional traceability to source ADRs and specifications

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/vtm-cli.git
cd vtm-cli

# Install dependencies
npm install

# Build the project
npm run build

# Link globally for CLI usage
npm link
```

## Quick Start

### Traditional Workflow

```bash
# Initialize a new VTM project
vtm init

# View available tasks
vtm next

# Get task context for Claude Code
vtm context TASK-001

# Start working on a task
vtm start TASK-001

# Mark task as complete
vtm complete TASK-001

# View project stats
vtm stats
```

### Plan-to-VTM Workflow (Recommended)

Transform planning documents into executable VTM tasks:

```bash
# 1. Write your planning documents
#    - ADR (Architectural Decision Record)
#    - Spec (Technical Specification)

# 2. Generate VTM tasks from documents
/plan:to-vtm adr/ADR-042-auth.md specs/spec-auth.md

# 3. Work on generated tasks
vtm next                    # See ready tasks
vtm context TASK-004        # Get task context
# → Implement with TDD in Claude Code
vtm complete TASK-004       # Mark done
```

## Commands

### Core Commands

| Command | Description |
|---------|-------------|
| `vtm next [-n <count>]` | Show next available tasks |
| `vtm context <task-id>` | Generate minimal context for Claude |
| `vtm task <task-id>` | Show detailed task information |
| `vtm start <task-id>` | Mark task as in-progress |
| `vtm complete <task-id>` | Mark task as completed |
| `vtm stats` | Show project statistics |
| `vtm list [--status <status>]` | List all tasks with optional filtering |

### Plan-to-VTM Bridge Commands

| Command | Description |
|---------|-------------|
| `vtm summary [--incomplete] [--json]` | Generate VTM summary for AI agents |
| `vtm ingest <file> [--preview] [--commit]` | Validate and ingest tasks into VTM |
| `/plan:to-vtm <adr> <spec>` | Transform ADR+Spec into VTM tasks (Claude Code) |

## Plan-to-VTM Bridge

The Plan-to-VTM bridge uses AI to transform planning documents into executable tasks with automatic dependency resolution.

### Architecture

```
ADR + Spec Documents
    ↓
AI Agent (Claude) extracts tasks
    ↓
Automatic ID assignment
    ↓
Dependency resolution (indices → TASK-XXX)
    ↓
Multi-layer validation
    ↓
Tasks added to vtm.json
```

### Features

- **Automatic ID Assignment**: Sequential TASK-XXX IDs starting after highest existing ID
- **Dependency Resolution**: Converts index-based dependencies to task IDs
- **Token Efficiency**: 80% reduction using incomplete tasks filter
- **Rich Context**: Links tasks to source documents with line numbers
- **Preview Mode**: Review before committing
- **Validation**: Multi-layer checks (schema, dependencies, circular deps)

### Usage

#### Option 1: Claude Code Slash Command (Recommended)

```bash
/plan:to-vtm adr/ADR-042-authentication.md specs/spec-auth-implementation.md
```

The command will:
1. Read your ADR and Spec documents
2. Generate VTM summary for agent context
3. Launch AI agent to extract tasks
4. Show preview with dependency chains
5. Ask for confirmation
6. Ingest tasks into vtm.json

#### Option 2: Manual Workflow

```bash
# 1. Generate VTM summary
vtm summary --incomplete --json > context.json

# 2. Use AI agent to extract tasks from ADR+Spec
#    (Use context.json for existing task context)
#    Save output to tasks.json

# 3. Preview extracted tasks
vtm ingest tasks.json --preview

# 4. Commit to VTM
vtm ingest tasks.json --commit
```

### Task Format

Tasks support two dependency formats:

**Index-based** (for batch ingestion):
```json
{
  "title": "Implement Profile Storage",
  "dependencies": [0, 1],
  "test_strategy": "TDD",
  "risk": "high",
  ...
}
```

**ID-based** (for existing tasks):
```json
{
  "title": "Add CLI Commands",
  "dependencies": ["TASK-004", "TASK-005"],
  "test_strategy": "Integration",
  "risk": "low",
  ...
}
```

**Mixed dependencies** are supported:
```json
"dependencies": [0, "TASK-002"]
```

## Test Strategies

VTM supports four test strategies:

| Strategy | When to Use | Example |
|----------|-------------|---------|
| `TDD` | High-risk core logic, security features | Authentication, data validation |
| `Unit` | Medium-risk pure functions | Utilities, helpers, calculations |
| `Integration` | Cross-component behavior | API endpoints, database operations |
| `Direct` | Setup, configuration, docs | tsconfig.json, README updates |

## Project Structure

```
vtm-cli/
├── src/
│   ├── index.ts                    # CLI entry point
│   └── lib/
│       ├── types.ts                # Core data models
│       ├── vtm-reader.ts           # Read operations
│       ├── vtm-writer.ts           # Write operations (atomic)
│       ├── context-builder.ts      # Context generation for AI
│       ├── task-ingest-helper.ts   # ID assignment & dependency resolution
│       ├── task-validator-ingest.ts # Validation for ingested tasks
│       └── vtm-summary.ts          # Token-efficient summaries
├── test/                           # Comprehensive test suite (115+ tests)
├── .claude/
│   ├── commands/
│   │   └── plan/
│   │       └── to-vtm.md          # Plan-to-VTM slash command
│   ├── docs/                       # Architecture & design docs
│   └── settings.json              # Claude Code configuration
├── examples/
│   └── vtm-example.json           # Example VTM file
└── vtm.json                       # Your project's VTM file
```

## VTM File Format

```json
{
  "version": "2.0.0",
  "project": {
    "name": "My Project",
    "description": "Project description"
  },
  "stats": {
    "total_tasks": 10,
    "completed": 3,
    "in_progress": 1,
    "pending": 6,
    "blocked": 0
  },
  "tasks": [
    {
      "id": "TASK-001",
      "adr_source": "adr/ADR-001-architecture.md",
      "spec_source": "specs/spec-core.md",
      "title": "Task title",
      "description": "Detailed description",
      "acceptance_criteria": [
        "Criterion 1",
        "Criterion 2"
      ],
      "dependencies": [],
      "blocks": [],
      "test_strategy": "TDD",
      "test_strategy_rationale": "High-risk feature requiring comprehensive testing",
      "estimated_hours": 8,
      "risk": "high",
      "files": {
        "create": ["src/new-file.ts"],
        "modify": ["src/existing.ts"],
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
  ]
}
```

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Development mode with watch
npm run dev

# Lint
npm run lint

# Link globally
npm link
```

## Testing

The project uses Vitest with comprehensive test coverage:

- **115+ tests** across all modules
- **TDD approach** for critical components
- **Integration tests** for CLI commands
- **Wallaby.js** support for real-time TDD

```bash
# Run all tests
npm test

# Run specific test file
npm test -- test/vtm-ingest.test.ts

# Run with coverage
npm run test:coverage
```

## Integration with Claude Code

VTM CLI is designed to work seamlessly with Claude Code:

### Traditional Prompts

Located in `/prompts/`:
1. **Generate VTM**: Convert ADRs/specs → vtm.json
2. **Execute Task**: TDD implementation of single task
3. **Add Feature**: Append new tasks to existing VTM

### Claude Code Slash Commands

- `/plan:to-vtm <adr> <spec>`: Transform planning documents into tasks
- More commands available in `.claude/commands/`

## Best Practices

### Writing ADRs

- Document architectural decisions
- Include rationale and constraints
- Reference implementation requirements
- Link to relevant specs

### Writing Specifications

- Break down into discrete tasks
- Define clear acceptance criteria
- Specify test requirements
- Include code examples
- Document file operations

### Task Management

- Keep tasks focused (2-8 hours)
- Use appropriate test strategies
- Define clear dependencies
- Document risks and rationale

## Token Efficiency

VTM CLI achieves 99% token reduction through:

- **Surgical Context**: Only load task-specific information
- **Summary Mode**: 80% reduction for AI agents (incomplete tasks only)
- **Compact Context**: Ultra-minimal mode (~500 tokens)
- **Dependency Filtering**: Skip completed/irrelevant tasks

## Examples

See `examples/` directory for:
- `vtm-example.json`: Sample VTM file
- `adr/`: Example ADR documents
- `specs/`: Example specification documents

## Troubleshooting

### Command not found

```bash
# Re-link globally
npm link
```

### VTM file not found

```bash
# Initialize new VTM
vtm init
```

### Validation errors during ingestion

```bash
# Check validation errors
vtm ingest tasks.json --dry-run

# View detailed preview
vtm ingest tasks.json --preview
```

### Circular dependency detected

Check task dependencies - ensure no cycles exist in the dependency graph.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests (TDD approach)
4. Implement feature
5. Run tests and linting
6. Submit pull request

## License

MIT

## Links

- [GitHub Repository](https://github.com/yourusername/vtm-cli)
- [Documentation](.claude/docs/)
- [Issue Tracker](https://github.com/yourusername/vtm-cli/issues)
- [Changelog](CHANGELOG.md)

## Acknowledgments

Built with:
- [TypeScript](https://www.typescriptlang.org/)
- [Commander.js](https://github.com/tj/commander.js/)
- [Vitest](https://vitest.dev/)
- [Chalk](https://github.com/chalk/chalk)
- [Claude Code](https://claude.ai/code)
