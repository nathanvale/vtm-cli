# {DOMAIN} Automation Plugin

**Version:** 1.0.0
**Status:** Beta (under active development)
**Namespace:** `/{domain}`

Complete {DOMAIN} domain plugin for Claude Code with commands, auto-discovery skills, and {SYSTEM} integration.

## Quick Start

Already installed? Start using immediately:

```bash
/{domain}:next              # Get the next item to work on
/{domain}:context {id}      # Get details on specific item
/{domain}:list              # See all items
/{domain}:update {id} ...   # Update item status
```

## What This Plugin Does

This plugin automates your {DOMAIN} workflow by:

1. **Providing Slash Commands** - Direct access to {DOMAIN} operations
2. **Auto-Discovery** - Claude suggests relevant commands automatically
3. **External Integration** - Connects to {SYSTEM_NAME} for data sync
4. **Pre-Commit Validation** - Ensures commits link to {DOMAIN} items
5. **Smart Notifications** - Alerts you about important changes

## Installation

### Already Installed?

Great! Skip to **Setup** section below.

### Fresh Installation

```bash
# Copy plugin to your Claude Code config
cp -r .claude/plugins/{domain}-automation ~/.claude/plugins/

# Verify installation
/registry:scan {domain}
```

## Setup

### Step 1: Environment Variables

Get credentials from {SYSTEM_NAME}:

```bash
# Create .env file (don't commit this!)
export {DOMAIN_SERVICE_API_KEY}="your-api-key-here"
export {DOMAIN_SERVICE_DB_ID}="your-database-id"
```

**Getting API Keys:**

1. Go to: https://developers.{service}.com/tokens
2. Create new API key with scopes: `read`, `write`
3. Copy the key to your `.env` file
4. Get database ID from {SYSTEM_NAME} dashboard

### Step 2: Test Connection

```bash
# Verify credentials work
/{domain}:test-connection

# Should output:
# ✓ Connected to {system} successfully
# ✓ API key valid
# ✓ Database accessible
```

### Step 3: Verify in Registry

```bash
# Scan to ensure plugin is registered
/registry:scan {domain}

# Should show:
# Commands (5):
#   • /{domain}:next
#   • /{domain}:context
#   • /{domain}:list
#   • /{domain}:update
#   • /{domain}:create
```

## Features

### Slash Commands

All commands are available immediately:

| Command             | Purpose            | When to Use                       |
| ------------------- | ------------------ | --------------------------------- |
| `/{domain}:next`    | Get next item      | Starting new work                 |
| `/{domain}:context` | Get item details   | Need full context before starting |
| `/{domain}:list`    | List all items     | Overview of what needs doing      |
| `/{domain}:update`  | Update item status | Mark as in-progress, done, etc.   |
| `/{domain}:create`  | Create new item    | Add task to queue                 |

### Auto-Discovery Skill

Claude automatically suggests commands based on what you say:

```
You: "What should I work on next?"
Claude: "Let me check that. /{domain}:next"
         ↳ Suggests the next command automatically

You: "Show me all my tasks"
Claude: "Got it. /{domain}:list"
         ↳ Suggests listing items

You: "I need context on this"
Claude: "Sure. /{domain}:context {item-id}"
         ↳ Suggests getting context
```

**Trigger Phrases**

The skill activates on these phrases:

- "what should I work on"
- "next {domain}"
- "show my tasks"
- "{domain} status"
- "list {domain}"
- "{domain} progress"
- "task context"
- "next item"

### {SYSTEM_NAME} Integration

Seamlessly sync with {SYSTEM_NAME}:

- **Read:** Fetch items, filter, search
- **Write:** Create, update, delete items
- **Real-time:** Changes are immediately available

### Pre-Commit Validation

Ensures every commit references a {DOMAIN} item:

```bash
git commit -m "TASK-123: Fix bug in module"
↳ Commits successfully (references TASK-123)

git commit -m "Some random fix"
↳ Commit rejected (doesn't reference task)
↳ Error: "Commit must reference a task"
```

Fix by referencing a task:

```bash
# Get next task
/{domain}:next
# → Returns: TASK-456

# Use in commit message
git commit -m "TASK-456: Your commit message"
# → Commits successfully
```

## Usage Examples

### Example 1: Start Work on Next Item

```bash
# Get your next task
You: "What should I work on?"
Claude: /{domain}:next

# Claude runs the command and shows:
# Next Item: TASK-123
# Title: Implement feature X
# Status: pending
# Due: 2025-11-01

# Get full context
You: "Show me the context"
Claude: /{domain}:context TASK-123

# Claude shows full requirements, dependencies, etc.

# Mark as in-progress
/{domain}:update TASK-123 status:in-progress

# Now work on it, then:
git commit -m "TASK-123: Implement feature X"
```

### Example 2: Check Status and Progress

```bash
# See what you're working on
/{domain}:list status:in-progress

# Review overall progress
/{domain}:list

# Check specific item details
/{domain}:context TASK-123
```

### Example 3: Create and Link New Task

```bash
# Create new task
/{domain}:create title:"New feature" description:"..."

# Returns: TASK-789

# Link in your work
git commit -m "TASK-789: Your implementation"
```

## Customization

### Change Trigger Phrases

Edit `.claude/skills/{domain}-expert/SKILL.md`:

```yaml
trigger_phrases:
  - "what should I work on" # Your custom phrases
  - "next item"
  - "show my queue"
```

Then ask Claude in your natural language:

```
You: "Show my queue"
Claude: /{domain}:list
```

### Modify Command Behavior

Edit `.claude/commands/{domain}/*.md`:

```bash
# For example, to change what "next" means:
# Edit: .claude/commands/{domain}/next.md
# Change the filter/sorting logic
```

### Adjust Validation Rules

Edit `.claude/hooks/pre-commit/{domain}-validate.sh`:

```bash
# Change the task ID pattern:
# From: {DOMAIN}-[0-9]+
# To: {DOMAIN}-[A-Z]+-[0-9]+

# Make validation stricter/looser
# Add domain-specific rules
```

### Connect Different Data Source

Edit `.claude/mcp-servers/{domain}-{system}/mcp.json`:

```json
{
  "configuration": {
    "api_key": "${DIFFERENT_SERVICE_API_KEY}"
  },
  "connection": {
    "endpoint": "https://api.different.com/v1",
    "service": "different-service"
  }
}
```

## Team Sharing

### Share with Team

1. Update `plugin.yaml`:

   ```yaml
   metadata:
     sharing:
       scope: "team"
       team_members:
         - "teammate1@company.com"
         - "teammate2@company.com"
   ```

2. Share the plugin:

   ```bash
   /share:plugin {domain}-automation
   ```

3. Team members install:
   ```bash
   /registry:scan              # See available plugins
   /install:plugin {domain}-automation
   ```

### Keep Team Synchronized

**When you update:**

```bash
# After making changes
git add .claude/plugins/{domain}-automation/
git commit -m "Update {domain} plugin: improve triggers"
git push

# Notify team
/notify:team "Updated {domain} plugin"
```

**When team updates:**

```bash
# Pull updates
git pull

# Reload
/reload:plugins

# Verify
/registry:scan {domain}
```

## Integration with Other Domains

Works seamlessly with other Claude Code domains:

```bash
# Before starting work on a test task
@use-before /test:setup

# Run command then update status
/{domain}:next
  ↳ Then: /test:create

# After deployment
@use-after /deploy:notify {domain}
```

## Troubleshooting

### Commands Not Suggesting Automatically

**Problem:** Claude doesn't suggest commands when you ask questions

**Solutions:**

1. Check trigger phrases match your vocabulary
2. Make sure commands are actually installed:
   ```bash
   /registry:scan {domain}
   ```
3. Try exact phrases first: "what should I work on"
4. Reload plugins: `/reload:plugins`

### "Not Configured" Errors

**Problem:** Getting errors about missing configuration

**Solutions:**

```bash
# Check environment variables
echo $DOMAIN_SERVICE_API_KEY    # Should show your key

# If empty, set it:
export DOMAIN_SERVICE_API_KEY="your-key"

# Test connection
/{domain}:test-connection
```

### Pre-Commit Validation Failing

**Problem:** Can't commit because validation rejects it

**Solutions:**

```bash
# Option 1: Reference a task in commit message
git commit -m "TASK-123: Your message"

# Option 2: Create a task first
/{domain}:create title:"Your work"  # Returns TASK-456
git commit -m "TASK-456: Your message"

# Option 3: Skip validation (not recommended)
git commit --no-verify -m "Your message"
```

### MCP Connection Failing

**Problem:** Getting connection errors to {SYSTEM_NAME}

**Solutions:**

```bash
# Check credentials
/{domain}:test-connection

# Verify API key is valid:
# 1. Go to {service} dashboard
# 2. Check key hasn't expired
# 3. Verify correct permissions
# 4. Try regenerating the key

# Test with explicit key:
export {DOMAIN_SERVICE_API_KEY}="new-key"
/{domain}:test-connection
```

## Quality Assurance

### Before Using in Production

Run these checks:

```bash
# 1. Verify installation
/registry:scan {domain}

# 2. Test connection
/{domain}:test-connection

# 3. Test each command manually
/{domain}:next
/{domain}:list
/{domain}:context {sample-id}
/{domain}:update {sample-id} status:pending

# 4. Test pre-commit hook
git commit -m "TASK-123: Test commit"   # Should succeed

git commit -m "No task ref"             # Should fail
git commit -m "TASK-123: Fix now"       # Should succeed again
```

### Testing Checklist

- [ ] Commands respond quickly
- [ ] Data from {system} is current
- [ ] Pre-commit hook catches bad messages
- [ ] Skill suggests commands naturally
- [ ] No sensitive data in logs
- [ ] All team members can use it

## Advanced Usage

### Batch Operations

```bash
# Work on multiple items
/{domain}:list status:pending limit:10

# Update multiple items
for task in TASK-123 TASK-124 TASK-125; do
  /{domain}:update $task status:in-progress
done
```

### Scripting and Automation

Create scripts that use these commands:

```bash
#!/bin/bash
# daily-standup.sh

echo "Daily Standup Report"
/{domain}:list status:in-progress
/{domain}:list status:blocked
```

### Combining with Other Skills

```bash
# Get task context, then run tests
/{domain}:next
@then /test:run

# Update status, then deploy
/{domain}:update TASK-123 status:ready
@then /deploy:start
```

## Support

### Getting Help

1. **Quick questions:** Check Customization section above
2. **Setup issues:** See Troubleshooting section
3. **Bug reports:** Include error message and commands run
4. **Feature requests:** Describe workflow and desired outcome

### Documentation

- **Setup:** Read "Setup" section above
- **Usage:** See "Usage Examples" section
- **Customization:** See "Customization" section
- **Troubleshooting:** See "Troubleshooting" section

### Contact

- **Author:** {AUTHOR_EMAIL}
- **Team:** {TEAM_CONTACT}
- **Issues:** {GITHUB_ISSUES_URL}

## Contributing

Want to improve this plugin?

1. Create a branch: `git checkout -b feature/{description}`
2. Make changes (see Customization section)
3. Test thoroughly
4. Submit PR or share with team

## Version History

### v1.0.0 (2025-10-29)

- Initial plugin release
- 5 slash commands for {DOMAIN}
- Auto-discovery skill with smart triggers
- {SYSTEM} integration via MCP
- Pre-commit validation hook
- Team sharing support

## Roadmap

### Planned Features

- [ ] Advanced filtering and search
- [ ] Webhook support for {SYSTEM}
- [ ] Analytics and reporting
- [ ] Team collaboration features
- [ ] Custom field mappings
- [ ] Batch operations

### Under Discussion

- Mobile app integration
- Slack bot integration
- Daily digest emails
- Advanced scheduling

## License

{LICENSE_TYPE} - See LICENSE file

## Next Steps

1. **Quick Start:** Follow the Setup section above
2. **Explore Commands:** Try each slash command
3. **Customize:** Adjust trigger phrases to match your vocabulary
4. **Share:** Add team members and share the plugin
5. **Extend:** Add more commands for your specific needs

---

**Happy automating!** 🚀

Need help? See the Troubleshooting section or contact the author.
