# Task Instructions: ${task.id} - ${task.title}

## Objective

${task.description}

## Acceptance Criteria

${acceptanceCriteriaList}

---

## Test Strategy: Direct / Manual Verification

Direct tasks involve setup, configuration, documentation, or other work that doesn't require automated testing. Verification is done manually by checking that the acceptance criteria are met.

### Direct Task Workflow

#### 1. Implement or Configure

- Complete the setup or configuration work
- Follow project conventions and standards
- Document any manual steps required
- Ensure work is reproducible

#### 2. Manual Verification

- Verify each acceptance criterion manually
- Test the setup works as expected
- Document verification steps performed
- Take screenshots or create examples if helpful

#### 3. Document the Work

- Update relevant documentation (README, setup guides, etc.)
- Document configuration options
- Provide examples of usage
- Note any prerequisites or dependencies

---

## Coding Standards

### Documentation (JSDoc/TypeDoc)

**REQUIRED for Direct tasks involving code:**

- ✅ Add JSDoc for any new functions or modules created
- ✅ Document configuration options and requirements
- ✅ Include `@example` for setup or configuration code
- ✅ Update README or other docs as needed

**For non-code tasks:**

- ✅ Create or update markdown documentation
- ✅ Include step-by-step instructions
- ✅ Provide examples and screenshots
- ✅ Link to related documentation

**Example (Code Configuration):**

````typescript
/**
 * Configuration options for VTM CLI.
 *
 * @example
 * ```typescript
 * const config: VTMConfig = {
 *   vtmPath: './vtm.json',
 *   claudePath: './.claude',
 *   autoCommit: true
 * };
 * ```
 */
export interface VTMConfig {
  /**
   * Path to vtm.json file (default: './vtm.json').
   */
  vtmPath: string

  /**
   * Path to .claude/ directory (default: './.claude').
   */
  claudePath: string

  /**
   * Auto-commit changes after task completion.
   */
  autoCommit: boolean
}
````

**Example (Documentation):**

```markdown
# Setting Up VTM CLI

## Prerequisites

- Node.js 18+ installed
- pnpm installed globally

## Installation Steps

1. Clone the repository
2. Run `pnpm install`
3. Run `pnpm build`
4. Run `pnpm link` for global access

## Verification

Run `vtm --help` to verify installation.
```

### Type Safety (if code is involved)

- ✅ TypeScript strict mode enabled
- ✅ Type any configuration objects
- ✅ Validate configuration at runtime

### Code Quality (if code is involved)

- ✅ ESLint passes: `pnpm lint`
- ✅ Prettier formatted: `pnpm format`
- ✅ Build succeeds: `pnpm build`

---

## File Operations

${fileOperationsList}

## Dependencies (Completed)

${dependenciesList}

## Source Documents

${sourceDocuments}

---

## Pre-Flight Checklist

Before starting:

- [ ] Understood acceptance criteria clearly
- [ ] Reviewed source documents (ADR/Spec)
- [ ] Identified any prerequisites or dependencies
- [ ] Have necessary access/permissions (if applicable)

---

## Implementation Workflow (Direct)

### Step 1: Complete the Work

1. Perform setup, configuration, or documentation work
2. Follow project conventions and best practices
3. Document steps as you go
4. Keep changes organized and reviewable

### Step 2: Verify Manually

1. Check each acceptance criterion is met
2. Test the setup or configuration works
3. Verify with realistic usage scenarios
4. Document any issues or edge cases discovered

### Step 3: Document Thoroughly

1. Update README or relevant documentation
2. Add examples and usage instructions
3. Document prerequisites and dependencies
4. Note any platform-specific considerations

### Step 4: Commit Changes

1. Review all changes: `git diff`
2. Ensure commit message is descriptive
3. Commit: `chore: ${task.title} [${task.id}]` or appropriate type
4. Include [${task.id}] tag in commit message

### Step 5: Final Review

1. Re-verify all acceptance criteria
2. Ensure documentation is clear and complete
3. Check that work is reproducible by others
4. Mark task as complete

---

## Post-Flight Validation

**REQUIRED checks before marking task complete:**

- [ ] All acceptance criteria verified manually
- [ ] Documentation updated (README, guides, etc.)
- [ ] If code: ESLint passes and build succeeds
- [ ] Commit messages follow format: `type(scope): description [${task.id}]`
- [ ] Work is reproducible (documented steps work)
- [ ] No temporary or debug files left
- [ ] Changes are reviewable and well-organized

---

## Success Criteria

Task ${task.id} is **COMPLETE** when:

1. ✅ All acceptance criteria are met and verified manually
2. ✅ Documentation is complete and clear
3. ✅ Work is reproducible by following the docs
4. ✅ If code: ESLint and build are clean
5. ✅ Commits follow format with [${task.id}] tag
6. ✅ Changes are reviewable and organized

---

## Common Direct Task Types

### Setup and Configuration

**Examples:**

- Setting up development environment
- Configuring build tools (webpack, vite, etc.)
- Setting up CI/CD pipelines
- Configuring linters and formatters

**Verification:**

- Run build/lint commands to verify setup
- Test in clean environment if possible
- Document all configuration options
- Provide examples of typical usage

### Documentation Tasks

**Examples:**

- Writing README documentation
- Creating API documentation
- Writing user guides or tutorials
- Documenting architecture decisions (ADRs)

**Verification:**

- Review for clarity and completeness
- Check links work correctly
- Verify code examples are accurate
- Have someone else review if possible

### Dependency Management

**Examples:**

- Updating dependencies
- Adding new dependencies
- Removing unused dependencies
- Fixing security vulnerabilities

**Verification:**

- Run `pnpm audit` to check for issues
- Run `pnpm test` to ensure tests still pass
- Run `pnpm build` to ensure build succeeds
- Document any breaking changes

### File Structure / Organization

**Examples:**

- Organizing project directories
- Moving files to new locations
- Creating directory structure
- Setting up project templates

**Verification:**

- Ensure all imports still work
- Run tests and build to verify
- Update documentation to reflect new structure
- Document the organization rationale

---

## Documentation Guidelines

### README Updates

When updating README.md:

- Keep language clear and concise
- Use examples to illustrate usage
- Structure with clear headings
- Include table of contents for long docs
- Provide links to detailed guides

**Structure:**

```markdown
# Project Name

Brief description of what the project does.

## Features

- Feature 1
- Feature 2

## Installation

Step-by-step installation instructions

## Usage

Basic usage examples

## Configuration

Configuration options and examples

## Contributing

Guidelines for contributors

## License

License information
```

### Configuration Documentation

When documenting configuration:

- List all available options
- Provide default values
- Show examples of common configurations
- Document environment variables
- Note any platform-specific options

**Example:**

````markdown
## Configuration

VTM CLI can be configured via `.vtmrc.json`:

| Option       | Type    | Default        | Description                    |
| ------------ | ------- | -------------- | ------------------------------ |
| `vtmPath`    | string  | `'./vtm.json'` | Path to VTM file               |
| `claudePath` | string  | `'./.claude'`  | Path to Claude directory       |
| `autoCommit` | boolean | `false`        | Auto-commit on task completion |

**Example `.vtmrc.json`:**

```json
{
  "autoCommit": true,
  "claudePath": "./.claude",
  "vtmPath": "./project/vtm.json"
}
```
````

````

### API Documentation
When documenting APIs:
- Document all public functions and classes
- Provide parameter descriptions and types
- Show example usage
- Document error conditions
- Link to related functions

---

## Manual Verification Checklist Template

Create a checklist for manual verification:

```markdown
## Manual Verification for ${task.id}

### Acceptance Criteria
- [ ] AC1: [Description of first acceptance criterion]
  - Verification steps:
    1. [Step 1]
    2. [Step 2]
  - Result: [Pass/Fail]

- [ ] AC2: [Description of second acceptance criterion]
  - Verification steps:
    1. [Step 1]
    2. [Step 2]
  - Result: [Pass/Fail]

### Additional Checks
- [ ] Documentation is clear and complete
- [ ] Examples work as documented
- [ ] No broken links or references
- [ ] Changes are reproducible

### Notes
[Any observations, issues, or edge cases discovered]
````

---

## Commit Message Examples for Direct Tasks

**Setup:**

```
chore(setup): configure TypeDoc for API documentation [${task.id}]
```

**Documentation:**

```
docs(readme): add comprehensive installation guide [${task.id}]
```

**Configuration:**

```
chore(config): setup ESLint and Prettier [${task.id}]
```

**Dependencies:**

```
chore(deps): update dependencies and fix audit issues [${task.id}]
```

**Organization:**

```
refactor(structure): reorganize lib directory [${task.id}]
```

---

**Remember:** Direct tasks focus on setup, configuration, and documentation. Manual verification and clear documentation are key to success.
