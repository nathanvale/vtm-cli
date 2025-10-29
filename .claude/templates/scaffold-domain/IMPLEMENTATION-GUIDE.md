# Scaffold Domain Implementation Guide

**For:** Claude Code CLI developers building the `/scaffold:domain` command
**Purpose:** Technical guide for implementing the scaffold generator
**Reference:** SPEC-minimum-composable-core.md (Command 2)

## Overview

This guide explains how to implement `/scaffold:domain` to generate complete domain structures from design specifications.

## Architecture

```
/scaffold:domain {domain}
        ↓
Read .claude/designs/{domain}.json
        ↓
Parse operations, skills, MCP, hooks
        ↓
Create directory structure
        ↓
Copy and customize templates
        ↓
Generate all 6 file types
        ↓
Show summary and next steps
```

## Implementation Steps

### Step 1: Validate Input

```javascript
// Validate domain name exists
if (!fs.existsSync(`.claude/designs/${domain}.json`)) {
  throw new Error(`No design found: .claude/designs/${domain}.json`)
}

// Validate design spec format
const design = JSON.parse(fs.readFileSync(`.claude/designs/${domain}.json`))
validateDesignSpec(design)
```

### Step 2: Create Directory Structure

```javascript
const dirs = [
  `.claude/commands/${domain}`,
  `.claude/skills/${domain}-expert`,
  `.claude/plugins/${domain}-automation`,
]

if (design.design.external_integration?.needed) {
  for (const system of design.design.external_integration.systems) {
    dirs.push(`.claude/mcp-servers/${domain}-${system.name}`)
  }
}

if (design.design.automation?.enabled) {
  dirs.push(`.claude/hooks/pre-commit`)
  dirs.push(`.claude/hooks/post-tool-use`)
}

dirs.forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true })
})
```

### Step 3: Generate Command Files

```javascript
function generateCommands(domain, design) {
  const template = fs.readFileSync(
    ".claude/templates/scaffold-domain/command-template.md",
    "utf-8",
  )

  design.design.operations.forEach((operation) => {
    const content = template
      .replace(/{domain}/g, domain)
      .replace(/{DOMAIN}/g, domain.toUpperCase())
      .replace(/{action}/g, operation.name)
      .replace(/{ACTION}/g, operation.name.toUpperCase())
      .replace(/{ACTION_DESCRIPTION}/g, operation.description)
      .replace(/{TRIGGER_PHRASE_1}/g, getTriggerPhrase(operation, 1))
      .replace(/{TRIGGER_PHRASE_2}/g, getTriggerPhrase(operation, 2))

    const filename = `.claude/commands/${domain}/${operation.name}.md`
    fs.writeFileSync(filename, content)
  })
}
```

### Step 4: Generate Skill File

```javascript
function generateSkill(domain, design) {
  const template = fs.readFileSync(
    ".claude/templates/scaffold-domain/skill-template.md",
    "utf-8",
  )

  const operations = design.design.operations
  const triggers = design.design.auto_discovery?.suggested_triggers || []

  let content = template
    .replace(/{domain}/g, domain)
    .replace(/{DOMAIN}/g, domain.toUpperCase())
    .replace(/{action1}/g, operations[0]?.name || "next")
    .replace(/{ACTION_1_DESCRIPTION}/g, operations[0]?.description || "")
    .replace(/{trigger_phrase_1}/g, triggers[0] || "next " + domain)

  // Replace all trigger phrases
  triggers.forEach((trigger, idx) => {
    content = content.replace(
      new RegExp(`\\{trigger_phrase_${idx + 1}\\}`, "g"),
      trigger,
    )
  })

  const skillPath = `.claude/skills/${domain}-expert/SKILL.md`
  fs.writeFileSync(skillPath, content)
}
```

### Step 5: Generate MCP Server Config

```javascript
function generateMCPServers(domain, design) {
  const template = JSON.parse(
    fs.readFileSync(
      ".claude/templates/scaffold-domain/mcp-template.json",
      "utf-8",
    ),
  )

  if (!design.design.external_integration?.needed) {
    return
  }

  design.design.external_integration.systems.forEach((system) => {
    const config = JSON.parse(JSON.stringify(template))

    config.name = `${domain}-${system.name}`
    config.description = `${system.description || system.type} integration for ${domain}`

    // Set environment variable names
    const prefix = domain.toUpperCase() + "_" + system.name.toUpperCase()
    config.configuration.required_env_vars = [
      `${prefix}_API_KEY`,
      `${prefix}_DB_ID`,
    ]

    const path = `.claude/mcp-servers/${domain}-${system.name}/mcp.json`
    fs.writeFileSync(path, JSON.stringify(config, null, 2))
  })
}
```

### Step 6: Generate Hook Scripts

```javascript
function generateHooks(domain, design) {
  if (!design.design.automation?.enabled) {
    return
  }

  // Pre-commit hook
  const preCommitTemplate = fs.readFileSync(
    ".claude/templates/scaffold-domain/hook-pre-commit-template.sh",
    "utf-8",
  )

  const preCommit = preCommitTemplate
    .replace(/{domain}/g, domain)
    .replace(/{DOMAIN}/g, domain.toUpperCase())
    .replace(/{HOOK_PURPOSE}/g, "Validate task reference in commits")

  const preCommitPath = `.claude/hooks/pre-commit/${domain}-validate.sh`
  fs.writeFileSync(preCommitPath, preCommit)
  fs.chmodSync(preCommitPath, 0o755)

  // Post-tool-use hook (if automation enabled)
  const postToolTemplate = fs.readFileSync(
    ".claude/templates/scaffold-domain/hook-post-tool-use-template.sh",
    "utf-8",
  )

  const postTool = postToolTemplate
    .replace(/{domain}/g, domain)
    .replace(/{DOMAIN}/g, domain.toUpperCase())
    .replace(/{HOOK_PURPOSE}/g, "Trigger automatic domain actions")

  const postToolPath = `.claude/hooks/post-tool-use/${domain}-handler.sh`
  fs.writeFileSync(postToolPath, postTool)
  fs.chmodSync(postToolPath, 0o755)
}
```

### Step 7: Generate Plugin Manifest

```javascript
function generatePluginManifest(domain, design) {
  const template = fs.readFileSync(
    ".claude/templates/scaffold-domain/plugin-template.yaml",
    "utf-8",
  )

  let content = template
    .replace(/{domain}/g, domain)
    .replace(/{DOMAIN}/g, domain.toUpperCase())
    .replace(/{AUTHOR}/g, process.env.USER || "user")
    .replace(/{CREATION_TIMESTAMP}/g, new Date().toISOString())

  // Add command list dynamically
  let commandsList = ""
  design.design.operations.forEach((op) => {
    commandsList += `        - name: "${op.name}"\n`
    commandsList += `          file: "${op.name}.md"\n`
    commandsList += `          description: "${op.description}"\n`
  })

  content = content.replace(
    /# CUSTOMIZE: Add more commands as needed[\s\S]*?# \|/,
    commandsList + "        # ",
  )

  const pluginPath = `.claude/plugins/${domain}-automation/plugin.yaml`
  fs.writeFileSync(pluginPath, content)
}
```

### Step 8: Generate Plugin README

```javascript
function generatePluginREADME(domain, design) {
  const template = fs.readFileSync(
    ".claude/templates/scaffold-domain/plugin-readme-template.md",
    "utf-8",
  )

  const content = template
    .replace(/{DOMAIN}/g, domain.toUpperCase())
    .replace(/{domain}/g, domain)
    .replace(/{SYSTEM_NAME}/g, getSystemName(design))
    .replace(/{system}/g, getSystemShortName(design))
    .replace(/{AUTHOR}/g, process.env.USER || "user")
    .replace(/{AUTHOR_EMAIL}/g, process.env.USER_EMAIL || "email@example.com")

  const readmePath = `.claude/plugins/${domain}-automation/README.md`
  fs.writeFileSync(readmePath, content)
}
```

### Step 9: Show Summary

```javascript
function showSummary(domain, design) {
  console.log(`\n✅ Successfully scaffolded ${domain} domain!\n`)
  console.log(`📁 Created files:`)

  const operationCount = design.design.operations?.length || 0
  console.log(`  ✓ .claude/commands/${domain}/ (${operationCount} commands)`)

  if (design.design.auto_discovery?.enabled) {
    console.log(`  ✓ .claude/skills/${domain}-expert/SKILL.md`)
  }

  if (design.design.external_integration?.needed) {
    const systemCount = design.design.external_integration.systems?.length || 0
    console.log(`  ✓ .claude/mcp-servers/ (${systemCount} MCP servers)`)
  }

  if (design.design.automation?.enabled) {
    console.log(`  ✓ .claude/hooks/pre-commit/${domain}-validate.sh`)
    console.log(`  ✓ .claude/hooks/post-tool-use/${domain}-handler.sh`)
  }

  console.log(`  ✓ .claude/plugins/${domain}-automation/`)

  console.log(`\n📊 Summary:`)
  console.log(`  • ${operationCount} slash commands ready to customize`)

  if (design.design.auto_discovery?.enabled) {
    const triggerCount =
      design.design.auto_discovery.suggested_triggers?.length || 0
    console.log(
      `  • 1 skill with auto-discovery (${triggerCount} trigger phrases)`,
    )
  }

  if (design.design.external_integration?.needed) {
    const systemCount = design.design.external_integration.systems?.length || 0
    console.log(`  • ${systemCount} MCP stub(s) for external systems`)
  }

  if (design.design.automation?.enabled) {
    console.log(`  • 2 hooks (pre-commit validation, post-tool-use automation)`)
  }

  console.log(`  • 1 plugin ready for team sharing`)

  console.log(`\n🚀 Next steps:`)
  console.log(`  1. Customize commands (edit .claude/commands/${domain}/*.md)`)
  console.log(`  2. Set up environment variables`)
  console.log(`  3. Test commands: /${domain}:next`)
  console.log(`  4. Run: /registry:scan to verify`)
  console.log(`  5. Share with team when ready`)
  console.log()
}
```

## Error Handling

### Validation Errors

```javascript
function validateDesignSpec(design) {
  if (!design.name) {
    throw new Error("Design spec missing required field: name")
  }

  if (!design.design?.operations || design.design.operations.length === 0) {
    throw new Error("Design must have at least one operation")
  }

  // Validate operations
  design.design.operations.forEach((op, idx) => {
    if (!op.name || !op.description) {
      throw new Error(`Operation ${idx}: missing name or description`)
    }

    // Validate operation names are kebab-case
    if (!/^[a-z]+(-[a-z]+)*$/.test(op.name)) {
      throw new Error(`Operation name '${op.name}' must be kebab-case`)
    }
  })
}
```

### File System Errors

```javascript
function ensureDirectoryExists(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true })
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw new Error(`Failed to create directory ${dir}: ${error.message}`)
    }
  }
}

function writeFileSafely(path, content) {
  try {
    // Write to temp file first
    const tempPath = path + ".tmp"
    fs.writeFileSync(tempPath, content)

    // Rename (atomic operation on most systems)
    fs.renameSync(tempPath, path)
  } catch (error) {
    throw new Error(`Failed to write file ${path}: ${error.message}`)
  }
}
```

## Template Substitution Strategy

### Build Substitution Map

```javascript
function buildSubstitutionMap(domain, design, author) {
  return {
    "{domain}": domain,
    "{DOMAIN}": domain.toUpperCase(),
    "{domain-name}": domain.replace(/-/g, " "),
    "{DOMAIN_NAME}": domain.toUpperCase().replace(/-/g, " "),
    "{author}": author || process.env.USER || "user",
    "{AUTHOR}": (author || process.env.USER || "user").toUpperCase(),
    "{creation_timestamp}": new Date().toISOString(),
    "{CREATION_TIMESTAMP}": new Date().toISOString().split("T")[0],
  }
}

function applySubstitutions(content, substitutionMap) {
  let result = content
  Object.entries(substitutionMap).forEach(([placeholder, value]) => {
    result = result.replace(new RegExp(placeholder, "g"), value)
  })
  return result
}
```

## Testing the Implementation

### Test Case 1: Simple Domain

```bash
# Design a simple domain
/design:domain pm "Project Management"
  → Answer: 3 operations (next, review, context)
  → Answer: Yes to auto-discovery
  → Answer: Yes to external integration (Notion)
  → Answer: Yes to automation (pre-commit)
  → Answer: Team sharing

# Scaffold it
/scaffold:domain pm

# Verify
/registry:scan pm
# Should show: 3 commands, 1 skill, 1 MCP, 1 hook, 1 plugin
```

### Test Case 2: Complex Domain

```bash
# Design with more operations
/design:domain devops "Infrastructure and Deployment"
  → Answer: 5 operations
  → Answer: Yes to auto-discovery
  → Answer: Yes to multiple systems (AWS, GitHub)
  → Answer: Yes to multiple hooks
  → Answer: Community sharing

# Scaffold it
/scaffold:domain devops

# Verify all files generated correctly
```

### Test Case 3: Minimal Domain

```bash
# Design with minimal requirements
/design:domain test "Test Management"
  → Answer: 2 operations only
  → Answer: No to auto-discovery
  → Answer: No to external integration
  → Answer: No to automation
  → Answer: Personal only

# Scaffold it
/scaffold:domain test

# Verify: Only commands and plugin generated
```

## Integration Points

### With `/design:domain`

```javascript
// Read the design spec
const designPath = `.claude/designs/${domain}.json`
const design = JSON.parse(fs.readFileSync(designPath, "utf-8"))

// Use design to determine what to generate
if (design.design.auto_discovery?.enabled) {
  generateSkill(domain, design)
}

if (design.design.external_integration?.needed) {
  generateMCPServers(domain, design)
}
```

### With `/registry:scan`

```javascript
// After scaffolding, scan registry to verify
// Registry should discover:
// - All commands in .claude/commands/{domain}/
// - Skill in .claude/skills/{domain}-expert/
// - MCP servers in .claude/mcp-servers/
// - Hooks in .claude/hooks/
// - Plugin in .claude/plugins/{domain}-automation/
```

## Performance Considerations

### For Large Domains

```javascript
// Process operations in parallel if many
const operations = design.design.operations

if (operations.length > 10) {
  // Use Promise.all for parallel generation
  Promise.all(operations.map((op) => generateCommand(domain, op)))
} else {
  // Serial for small count
  operations.forEach((op) => generateCommand(domain, op))
}
```

### Caching

```javascript
// Cache template file reads
const templateCache = new Map()

function getTemplate(templateName) {
  if (!templateCache.has(templateName)) {
    const path = `.claude/templates/scaffold-domain/${templateName}`
    const content = fs.readFileSync(path, "utf-8")
    templateCache.set(templateName, content)
  }
  return templateCache.get(templateName)
}
```

## Success Criteria

The implementation is complete when:

- [ ] Command validates input design spec
- [ ] Creates all required directories
- [ ] Generates command files with placeholders replaced
- [ ] Generates skill file with trigger phrases
- [ ] Generates MCP config for external systems
- [ ] Generates hook scripts with proper permissions
- [ ] Generates plugin manifest with all components linked
- [ ] Generates plugin README with customization guidance
- [ ] Shows clear summary and next steps
- [ ] All generated files are valid (syntax checked)
- [ ] Errors are caught and reported clearly
- [ ] Works with simple and complex domains
- [ ] Registry can scan all generated components

## File Checklist

After implementation, verify these files exist:

- [ ] `.claude/templates/scaffold-domain/command-template.md`
- [ ] `.claude/templates/scaffold-domain/skill-template.md`
- [ ] `.claude/templates/scaffold-domain/mcp-template.json`
- [ ] `.claude/templates/scaffold-domain/hook-pre-commit-template.sh`
- [ ] `.claude/templates/scaffold-domain/hook-post-tool-use-template.sh`
- [ ] `.claude/templates/scaffold-domain/plugin-template.yaml`
- [ ] `.claude/templates/scaffold-domain/plugin-readme-template.md`
- [ ] `.claude/templates/scaffold-domain/INDEX.md` (this file)
- [ ] `.claude/templates/scaffold-domain/IMPLEMENTATION-GUIDE.md` (this guide)

---

## Next Steps

1. Build command parsing for `/scaffold:domain`
2. Implement validation logic
3. Implement file generation from templates
4. Add error handling and user feedback
5. Test with sample domains
6. Integrate with registry scanner
7. Add to official command registry
