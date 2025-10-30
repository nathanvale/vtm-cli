# Git Automation Plugin

Git domain

**Version:** 1.0.0 | **Scope:** personal

## Quick Start

Commands are now available:

- `/git:status` - Get the current git status
- `/git:switch` - Switch branches
- `/git:create-branch` - Create a new branch
- `/git:commit` - Make a commit with special instructions
- `/git:pull` - Pull changes
- `/git:push` - Push changes
- `/git:log` - View history/what's been done

## Setup

1. **Review the commands**

   Open: `.claude/commands/git/`

   Each command has a template you can customize

2. **Implement the commands**

   - Replace TODO sections with actual logic
   - Connect to your git workflow
   - Test each command

3. **Enable features (optional)**

   - MCP: Configure `.claude/mcp-servers/git-gh/` for GitHub CLI
   - MCP: Configure `.claude/mcp-servers/git-filesystem/` for file operations

4. **Verify everything works**

   ```bash
   /registry:scan git
   ```

## What's Included

- 7 slash commands for git operations
- Auto-discovery skill with trigger phrases
- MCP stub for gh CLI integration
- MCP stub for filesystem integration
- Plugin ready for team sharing

## Customization

Edit these files to customize:

- **Commands:** `.claude/commands/git/*.md`
  - Change how operations are performed
  - Customize output format
  - Add additional options

- **Skill:** `.claude/skills/git-expert/SKILL.md`
  - Edit trigger phrases to match your vocabulary
  - Update description as you evolve

- **MCP:** `.claude/mcp-servers/git-{system}/mcp.json`
  - Add your GitHub credentials
  - Configure filesystem paths

## Next Steps

1. **Test the commands**

   ```bash
   /git:status
   ```

2. **Enable auto-discovery**

   - Skill is configured with trigger phrases
   - Try saying "what's the git status?"

3. **Set up integrations** (optional)

   - Configure `.claude/mcp-servers/git-gh/` for GitHub CLI support
   - Configure `.claude/mcp-servers/git-filesystem/` for file operations

4. **Enhance the commands**

   - Implement actual git logic in command files
   - Add error handling and validation
   - Improve output formatting

## Common Workflows

**Check status and commit:**

```
/git:status          # See what changed
/git:commit "..."    # Commit with message
/git:push origin     # Push to remote
```

**Create and switch to feature branch:**

```
/git:create-branch feature/new-feature
/git:switch feature/new-feature
```

**Update from main:**

```
/git:switch main
/git:pull origin main
/git:switch feature/my-feature
# Merge main into feature if needed
```

**Review history:**

```
/git:log --oneline 20
/git:log --graph --oneline
```

## Support

- Issues with commands? Check `.claude/commands/git/`
- Need GitHub integration? Configure `.claude/mcp-servers/git-gh/`
- Need filesystem access? Configure `.claude/mcp-servers/git-filesystem/`

## See Also

- Registry: `/registry:scan`
- Design: `.claude/designs/git.json`
