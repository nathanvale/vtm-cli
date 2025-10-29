# Scaffold Domain Template Library

**Version:** 1.0.0
**Purpose:** Complete template library for the `/scaffold:domain` command
**Location:** `.claude/templates/scaffold-domain/`

This directory contains all templates used by the `/scaffold:domain` command to generate domain structure, commands, skills, integrations, and documentation.

## Overview

The scaffold command generates a complete domain structure from a design specification by copying and customizing these templates. Each template includes:

- Proper placeholder syntax (`{PLACEHOLDER}`)
- Customization guidance comments
- Example implementations
- Error handling patterns
- Cross-references to related files

## Templates

### 1. Command Template: `command-template.md`

**Purpose:** Template for individual slash commands in a domain

**Generated To:** `.claude/commands/{domain}/{action}.md`

**Key Features:**

- Frontmatter with name, description, namespace, version
- Usage examples with parameter documentation
- Implementation stub with customization points
- Error handling examples
- Integration with other commands
- Testing guidance
- Multiple customization examples (database, API, file-based)

**Customization Placeholders:**

- `{domain}` - Domain namespace (e.g., "pm", "devops")
- `{action}` - Command action (e.g., "next", "review")
- `{ACTION_DESCRIPTION}` - What the command does
- `{DOMAIN}` - Uppercase domain name
- `{ACTION_1_DESCRIPTION}` - Description of first action

**When It's Generated:**

- Once for each operation defined in the design spec
- For actions like: next, context, list, update, create

**Example Generated File:**

```markdown
---
name: pm:next
description: Get next PM task to work on
namespace: pm
---

# PM: Next Task

...
```

---

### 2. Skill Template: `skill-template.md`

**Purpose:** Template for auto-discovery skills that suggest commands automatically

**Generated To:** `.claude/skills/{domain}-expert/SKILL.md`

**Key Features:**

- Frontmatter with name, description, trigger phrases
- Clear documentation of what skill does
- Command references with descriptions
- Best practices for domain-specific workflows
- Comprehensive customization guidance
- Domain-specific examples (PM, DevOps, Testing)
- Quality checklist
- Troubleshooting guide

**Customization Placeholders:**

- `{domain}` - Domain namespace
- `{DOMAIN}` - Uppercase domain name
- `{action1}`, `{action2}`, `{action3}` - Command actions
- `{ACTION_1_DESCRIPTION}` - Description of each action
- `{trigger_phrase_1}`, `{trigger_phrase_2}` - Default triggers
- `{TRIGGER_PHRASE_1}` - Capitalized trigger phrases

**When It's Generated:**

- Once per domain if auto-discovery is enabled
- Includes all commands from the design spec

**Example Generated File:**

```markdown
---
name: pm-expert
description: Project Management domain expert...
trigger_phrases:
  - "next task"
  - "what should I work on"
---

# PM Expert Skill

...
```

---

### 3. MCP Server Template: `mcp-template.json`

**Purpose:** Template for external service integrations via Model Context Protocol

**Generated To:** `.claude/mcp-servers/{domain}-{system}/mcp.json`

**Key Features:**

- Connection configuration (type, service, auth)
- Environment variable definitions
- Read operations (queries)
- Write operations (mutations)
- Data models with field documentation
- Authentication methods (bearer, API key, OAuth)
- Setup instructions with credential sourcing
- Error handling for each error type
- Security considerations and best practices
- Rate limits and limitations
- Customization guidance
- Test examples
- Integration mapping to commands
- Troubleshooting guide

**Customization Placeholders:**

- `{domain}` - Domain namespace
- `{system}` - External system name (e.g., "notion")
- `{SYSTEM_NAME}` - Full system name
- `{connection_type}` - API type (rest, graphql, etc.)
- `{AUTH_TYPE}` - Authentication method
- `{SERVICE_ENDPOINT}` - API endpoint
- `{DOMAIN_SERVICE_API_KEY}` - Environment variable for API key
- `{DOMAIN_SERVICE_DB_ID}` - Environment variable for DB ID
- `{CREATION_TIMESTAMP}` - ISO timestamp
- `{AUTHOR}` - Who created it

**When It's Generated:**

- Once per external system in the design spec
- If external_integration.needed = true

**Example Generated File:**

```json
{
  "name": "pm-notion",
  "type": "mcp",
  "description": "Notion database integration for PM tasks",
  "connection": {
    "type": "api",
    "service": "notion",
    "auth_type": "bearer_token"
  },
  ...
}
```

---

### 4. Hook Template: Pre-Commit: `hook-pre-commit-template.sh`

**Purpose:** Template for pre-commit git hooks that validate commits

**Generated To:** `.claude/hooks/pre-commit/{domain}-handler.sh`

**Key Features:**

- Proper bash setup with error handling
- Color-coded logging (info, warn, error, action)
- 6 example validation functions
- Task reference validation
- Commit format validation
- Debug code detection
- Required file checking
- Domain-specific rule validation
- Main execution loop
- Clear success/failure messaging
- Error instructions for users

**Customization Placeholders:**

- `{domain}` - Domain namespace
- `{DOMAIN}` - Uppercase domain name
- `{HOOK_PURPOSE}` - What the hook validates

**When It's Generated:**

- Once per domain if automation.enabled = true and hook type = pre-commit

**Example Generated File:**

```bash
#!/bin/bash
# Pre-commit Hook: pm Validation

# Validates that every commit references a PM task
# Format required: TASK-123: Commit message
```

---

### 5. Hook Template: Post-Tool-Use: `hook-post-tool-use-template.sh`

**Purpose:** Template for post-tool-use hooks that trigger automatic actions

**Generated To:** `.claude/hooks/post-tool-use/{domain}-handler.sh`

**Key Features:**

- Color-coded logging and output formatting
- 6 auto-action functions (status update, commit linking, item creation, metrics, notifications, documentation)
- Smart trigger detection
- Tool-specific action routing
- Graceful degradation on tool failure
- Auto-update status based on tool results
- Automatic commit linking
- Related item creation workflows
- Metrics and statistics tracking
- Team notification system
- Documentation auto-generation
- Main execution loop

**Customization Placeholders:**

- `{domain}` - Domain namespace
- `{DOMAIN}` - Uppercase domain name
- `{HOOK_PURPOSE}` - What auto-actions the hook performs

**When It's Generated:**

- Once per domain if automation.enabled = true and hook type = post-tool-use

**Example Generated File:**

```bash
#!/bin/bash
# Post-Tool-Use Hook: pm Auto-Actions

# Auto-updates PM task status based on tool results
# Automatically links commits to tasks
# Creates follow-up tasks for bugs/features
```

---

### 6. Plugin Manifest Template: `plugin-template.yaml`

**Purpose:** Template for plugin manifest that packages all domain components

**Generated To:** `.claude/plugins/{domain}-automation/plugin.yaml`

**Key Features:**

- Name, version, description
- Comprehensive metadata (author, created, sharing, tags)
- Component references (commands, skills, MCP, hooks)
- Quality metadata (status, testing, security, documentation)
- Dependencies (external systems, plugins, tools)
- Version history
- Feature flags for gradual rollout
- Integration points
- Roadmap tracking
- Marketplace configuration
- Performance limits
- Error handling configuration
- Customization guidance
- Testing recommendations
- Support and communication info
- License information
- Next steps for users

**Customization Placeholders:**

- `{domain}` - Domain namespace
- `{DOMAIN}` - Uppercase domain name
- `{SYSTEM}` - External system name
- `{system}` - Lowercase system name
- `{AUTHOR}` - Plugin author
- `{AUTHOR_EMAIL}` - Author email
- `{CREATION_TIMESTAMP}` - ISO timestamp
- `{service}` - Service name (for URLs)
- `{TEAM_NAME}` - Team name for sharing

**When It's Generated:**

- Once per domain, serves as metadata package

**Example Generated File:**

```yaml
name: pm-automation
version: 1.0.0
description: Complete PM domain plugin...
metadata:
  author: "User Name"
  sharing:
    scope: "personal"
```

---

### 7. Plugin README Template: `plugin-readme-template.md`

**Purpose:** User-facing documentation for the generated plugin

**Generated To:** `.claude/plugins/{domain}-automation/README.md`

**Key Features:**

- Quick start section with command examples
- What the plugin does
- Installation instructions
- Step-by-step setup guide
- Feature overview (commands, skill, integration, validation)
- Command reference table
- Auto-discovery examples
- Detailed usage examples (3 scenarios)
- Customization guide (4 modification types)
- Team sharing instructions
- Integration with other domains
- Comprehensive troubleshooting section
- Quality assurance checklist
- Advanced usage patterns
- Support contact information
- Contributing guidelines
- Version history
- Roadmap
- License information
- Next steps

**Customization Placeholders:**

- `{DOMAIN}` - Uppercase domain name
- `{domain}` - Lowercase domain name
- `{SYSTEM_NAME}` - Full service name
- `{system}` - Lowercase service name
- `{service}` - Service domain (for URLs)
- `{DOMAIN_SERVICE_API_KEY}` - Environment variable name
- `{DOMAIN_SERVICE_DB_ID}` - Environment variable name
- `{AUTHOR}` - Author name
- `{AUTHOR_EMAIL}` - Author email
- `{TEAM_CONTACT}` - Team contact info
- `{LICENSE_TYPE}` - License type

**When It's Generated:**

- Once per domain, serves as user documentation

**Example Generated File:**

```markdown
# PM Automation Plugin

Version: 1.0.0
Namespace: /pm

Complete project management domain plugin...
```

---

## Placeholder Reference

### Substitution Rules

When `/scaffold:domain` generates files, it replaces placeholders:

```
Placeholder              Replacement
─────────────────────────────────────────────
{domain}                 Lowercase domain name (pm, devops)
{DOMAIN}                 Uppercase domain name (PM, DEVOPS)
{action}                 Lowercase action name (next, review)
{ACTION}                 Uppercase action name (NEXT, REVIEW)
{ACTION_DESCRIPTION}     What the action does
{system}                 Lowercase system name (notion, github)
{SYSTEM}                 Uppercase system name (NOTION, GITHUB)
{SYSTEM_NAME}            Full system name (Notion, GitHub)
{service}                Service domain (notion.com, github.com)
{AUTHOR}                 User's name
{AUTHOR_EMAIL}           User's email
{TEAM_NAME}              Team name for sharing
{CREATION_TIMESTAMP}     ISO 8601 timestamp
{connection_type}        API type (api, graphql, websocket)
{AUTH_TYPE}              Authentication type (bearer, api_key, oauth)
{SERVICE_ENDPOINT}       API endpoint URL
{DOMAIN_SERVICE_*}       Environment variable names
{trigger_phrase_*}       Trigger phrases for skill
```

---

## Template Customization Points

### All Templates

Every template has these customization points:

1. **Frontmatter:** Metadata that identifies the component
2. **Descriptions:** What the component does and when to use it
3. **Examples:** Working implementations to guide users
4. **Error Handling:** How to handle failures gracefully
5. **Next Steps:** Guidance for what to do after generating

### Command Template Specifics

- **Parameters:** Add domain-specific filter/sort options
- **Implementation:** Choose data source (database, API, file)
- **Error Handling:** Validate inputs and handle failures
- **Integration:** Link to other commands in the domain

### Skill Template Specifics

- **Trigger Phrases:** Customize to match user vocabulary
- **Command Links:** Ensure all commands are referenced
- **Best Practices:** Update for domain-specific workflow
- **Domain Examples:** Customize for your specific use case

### MCP Template Specifics

- **Connection Type:** Choose REST, GraphQL, or WebSocket
- **Operations:** Define read queries and write mutations
- **Data Models:** Add custom fields for your use case
- **Authentication:** Use bearer, API key, or OAuth
- **Setup Instructions:** Write clear credential sourcing

### Hook Template Specifics

- **Validation Rules:** Define what to check in pre-commit
- **Auto-Actions:** Define workflows for post-tool-use
- **Error Messages:** Customize success/failure feedback
- **Strictness:** Choose between warning and blocking

### Plugin Templates Specifics

- **Component Links:** Update paths to all generated files
- **Team Sharing:** Configure who can access the plugin
- **Customization Guidance:** Document how to modify
- **Roadmap:** Track planned features

---

## File Naming Convention

The scaffold command follows these naming conventions:

```
Commands:         .claude/commands/{domain}/{action}.md
Skills:           .claude/skills/{domain}-expert/SKILL.md
MCP Servers:      .claude/mcp-servers/{domain}-{system}/mcp.json
Hooks (pre-commit):  .claude/hooks/pre-commit/{domain}-validate.sh
Hooks (post-tool): .claude/hooks/post-tool-use/{domain}-handler.sh
Plugins:          .claude/plugins/{domain}-automation/plugin.yaml
Plugin README:    .claude/plugins/{domain}-automation/README.md
```

---

## Template Validation Checklist

Before using a generated file, verify:

### For Commands

- [ ] Frontmatter has name, description, namespace
- [ ] Usage examples show with and without parameters
- [ ] Error handling handles invalid input
- [ ] Links to related commands exist
- [ ] Testing section covers main scenarios

### For Skills

- [ ] Trigger phrases are specific to domain
- [ ] All referenced commands actually exist
- [ ] Related commands section is complete
- [ ] Best practices match domain workflow
- [ ] Description accurately reflects capabilities

### For MCP

- [ ] Connection type matches service
- [ ] Auth configuration is correct
- [ ] Required env vars are clearly documented
- [ ] Operations match service API
- [ ] Error handling covers common failures
- [ ] Setup instructions are clear

### For Hooks

- [ ] Bash syntax is valid (no errors)
- [ ] Validation logic is sound
- [ ] Error messages are helpful
- [ ] Doesn't break valid use cases
- [ ] Can be bypassed if needed (--no-verify)

### For Plugins

- [ ] All component paths are correct
- [ ] Command references are valid
- [ ] Skill trigger phrases are relevant
- [ ] Version number is set
- [ ] Status is documented

### For READMEs

- [ ] Setup instructions are complete
- [ ] Examples are tested
- [ ] Troubleshooting covers common issues
- [ ] Contact information is provided
- [ ] Quick start works as documented

---

## Common Customization Scenarios

### Scenario 1: Changing Data Source

**From:** File-based storage
**To:** REST API

1. Edit command template: Change implementation section
2. Edit MCP template: Update operations and endpoints
3. Update README: Change setup instructions
4. Test: Verify commands work with new API

### Scenario 2: Adding New Command

1. Copy command-template.md with new action name
2. Update skill template: Add trigger phrases for new command
3. Update plugin.yaml: Add command to component list
4. Update README: Add new command to feature table

### Scenario 3: Changing Validation Rules

1. Edit hook template: Modify validation functions
2. Update README: Document new requirements
3. Test: Try commits that should pass/fail
4. Share: Update team documentation

### Scenario 4: Adding MCP to Existing Domain

1. Copy mcp-template.json with system name
2. Update commands: Link commands to new MCP
3. Update plugin.yaml: Add MCP to components
4. Update README: Document setup for new system

---

## Template Generation Process

When `/scaffold:domain {domain}` is executed:

1. **Load Design Spec** → `.claude/designs/{domain}.json`
2. **Parse Operations** → Extract each operation name
3. **For Each Operation:**
   - Copy `command-template.md` → `commands/{domain}/{action}.md`
   - Replace placeholders with operation data
4. **If Auto-Discovery Enabled:**
   - Copy `skill-template.md` → `skills/{domain}-expert/SKILL.md`
   - Add all operation names and trigger phrases
5. **For Each External System:**
   - Copy `mcp-template.json` → `mcp-servers/{domain}-{system}/mcp.json`
   - Configure for specific system
6. **For Each Hook:**
   - Copy `hook-*-template.sh` → `hooks/{event}/{domain}-handler.sh`
   - Customize for domain
7. **Create Plugin Package:**
   - Copy `plugin-template.yaml` → `plugins/{domain}-automation/plugin.yaml`
   - Link all generated components
   - Copy `plugin-readme-template.md` → `plugins/{domain}-automation/README.md`

---

## Best Practices

### For Template Authors (Creating Templates)

1. **Use Clear Placeholders:** `{PLACEHOLDER}` format with comments
2. **Provide Examples:** Show multiple implementation patterns
3. **Document All Options:** Explain every customizable part
4. **Include Error Handling:** Show how to handle failures
5. **Add Comments:** Explain WHY not just WHAT
6. **Link Related Files:** Reference other generated components
7. **Include Checklists:** Quality verification steps

### For Template Users (Customizing Generated Files)

1. **Keep It Simple:** Don't over-engineer initially
2. **Test After Changes:** Verify modifications work
3. **Document Changes:** Note why you modified something
4. **Share Improvements:** Update team if helpful
5. **Version Your Changes:** Track customization history
6. **Validate Syntax:** Check for errors in bash, JSON, YAML

---

## Version History

### v1.0.0 (2025-10-29)

Initial template library with 6 template types:

- Command template for slash commands
- Skill template for auto-discovery
- MCP template for external integrations
- Pre-commit hook template for validation
- Post-tool-use hook template for automation
- Plugin manifest and README templates

All templates are feature-complete with:

- Comprehensive placeholder system
- Customization guidance comments
- Example implementations
- Error handling patterns
- Cross-references to related files
- Validation checklists

---

## Next Steps for Using These Templates

1. **Understand Each Template:** Read the template file and this documentation
2. **Design Your Domain:** Run `/design:domain {name}`
3. **Scaffold:** Run `/scaffold:domain {name}` to generate files
4. **Customize:** Edit generated files with domain-specific logic
5. **Test:** Run each command, skill, and hook
6. **Verify:** Run `/registry:scan {domain}`
7. **Share:** Share with team if applicable

---

## Support

For issues or improvements to templates:

1. Check if customization covers your need (see above)
2. Review troubleshooting section of specific template
3. Check generated README.md for domain-specific help
4. Refer to spec: `.claude/SPEC-minimum-composable-core.md`

---

**Template Library Ready for Use**

All 6 template types are complete, validated, and ready for the `/scaffold:domain` command.
