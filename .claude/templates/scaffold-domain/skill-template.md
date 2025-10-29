---
name: {domain}-expert
description: |
  {DOMAIN} domain expert with specialized knowledge.

  Provides smart command suggestions and auto-discovery
  for {DOMAIN} workflows based on natural language.

  Knows how to:
  - {ACTION_1_DESCRIPTION}
  - {ACTION_2_DESCRIPTION}
  - {ACTION_3_DESCRIPTION}

  Triggered automatically when user mentions:
  - {TRIGGER_PHRASE_1}
  - {TRIGGER_PHRASE_2}
  - {TRIGGER_PHRASE_3}

version: 1.0.0
category: {domain}
# CUSTOMIZE: Add trigger phrases that match user vocabulary
trigger_phrases:
  - "{trigger_phrase_1}"
  - "{trigger_phrase_2}"
  - "{trigger_phrase_3}"
  - "next {domain}"
  - "show me {domain}"
  - "{domain} status"
  - "{domain} progress"

# CUSTOMIZE: Link to related commands
related_commands:
  - /{domain}:{action1}
  - /{domain}:{action2}
  - /{domain}:{action3}

# CUSTOMIZE: Link to related resources
related_skills:
  - other-skill-name

dependencies:
  - /{domain}:{action1}
  - /{domain}:{action2}
  - /{domain}:{action3}
---

# {DOMAIN} Expert Skill

## What This Skill Does

Helps you work efficiently with {DOMAIN} by providing smart command suggestions based on what you ask.

**Auto-triggers** when you naturally mention things related to {DOMAIN}.

## Available Commands

This skill knows about these slash commands:

- `/{domain}:{action1}` - {ACTION_1_DESCRIPTION}
- `/{domain}:{action2}` - {ACTION_2_DESCRIPTION}
- `/{domain}:{action3}` - {ACTION_3_DESCRIPTION}
- `/{domain}:context` - Get detailed context about current item
- `/{domain}:list` - See all items at a glance

## When Claude Uses This Skill

### Automatic Trigger Examples

When you naturally say things like:

```
You: "What should I work on?"
Claude: "Let me check. /pm:next"
         ↳ Suggests the PM next command

You: "I need context on this"
Claude: "Got it. /pm:context {item-id}"
         ↳ Suggests getting context

You: "Show me my tasks"
Claude: "/pm:list"
         ↳ Suggests listing all items

You: "{domain} status?"
Claude: "Let me check that. /{domain}:review"
         ↳ Suggests reviewing status
```

### Manual Invocation

You can also explicitly use these commands:

```bash
/{domain}:next                          # Get the next item
/{domain}:context {item-id}             # Get details on specific item
/{domain}:list                          # See all items
/{domain}:update {item-id} {change}     # Make updates
/{domain}:status                        # Check overall status
```

## Best Practices

### Before Starting Work

1. **Know what you're working on**

   ```
   You: "What should I work on next?"
   Claude suggests: /{domain}:next
   ```

2. **Get full context**

   ```
   You: "I need the context"
   Claude suggests: /{domain}:context {item-id}
   ```

3. **Understand dependencies**
   ```
   You: "What are the blockers?"
   Claude suggests: /{domain}:list
   ```

### During Work

- Keep status updated: `/{domain}:update {item-id} status:in-progress`
- Reference the item: Include the ID in commit messages, docs, etc.
- Link related work: Use depends-on/blocks-on relationships

### After Completing Work

1. **Mark as done**

   ```
   /{domain}:update {item-id} status:completed
   ```

2. **Review impact**

   ```
   /{domain}:status
   ```

3. **Plan next work**
   ```
   /{domain}:next
   ```

## How to Customize This Skill

### Step 1: Update Trigger Phrases

Edit the `trigger_phrases` in the frontmatter to match YOUR vocabulary:

```yaml
trigger_phrases:
  - "what should I work on" # Common question
  - "show me tasks" # How you ask for lists
  - "{domain} status" # Your status question
  - "get next {domain}" # Your next-item phrasing
  - "review {domain}" # Your review command
```

**Examples for different domains:**

For "pm" (project management):

```yaml
trigger_phrases:
  - "next task"
  - "what should I work on"
  - "pm status"
  - "pm progress"
  - "show my tasks"
  - "task context"
  - "next pm"
  - "review tasks"
```

For "devops" (infrastructure):

```yaml
trigger_phrases:
  - "infrastructure status"
  - "deployment status"
  - "what needs deploying"
  - "next deployment"
  - "devops review"
  - "check infrastructure"
```

For "testing" (QA):

```yaml
trigger_phrases:
  - "test status"
  - "what should I test"
  - "testing progress"
  - "show test queue"
  - "next test"
```

### Step 2: Update Command Links

Make sure the `related_commands` point to YOUR actual commands:

```yaml
related_commands:
  - /{domain}:next # First thing user asks for
  - /{domain}:context # Details on current item
  - /{domain}:list # See everything
  - /{domain}:update # Make changes
```

### Step 3: Update Description

Keep the skill description current with what it actually does:

```yaml
description: |
  {DOMAIN} domain expert for [your specific use case].

  Helps with:
  - Finding next work item
  - Getting detailed context
  - Checking status and progress
  - Managing workflow
```

### Step 4: Test Auto-Discovery

After customizing, test that Claude suggests commands naturally:

```
You: Ask a question that matches your trigger phrases
Claude: Should suggest the appropriate command

Example:
You: "What should I work on?"
Claude: "Let me check. /pm:next"
```

If Claude doesn't suggest commands:

- Add more diverse trigger phrases
- Try different phrasings when asking questions
- Check that commands actually exist
- Verify skill is enabled in registry

## Integration with Other Domains

This skill can work alongside other skills:

```
/pm:next              ← PM skill suggests this
/test:next            ← Test skill suggests this
/deploy:status        ← Deploy skill suggests this
```

Skills complement each other - they don't conflict.

## Quality Checklist

Before considering this skill complete:

- [ ] All trigger phrases added
- [ ] Tested auto-discovery with multiple phrasings
- [ ] All related commands linked
- [ ] Description matches actual capabilities
- [ ] At least 5 trigger phrases defined
- [ ] Commands are actually implemented
- [ ] Tested with real workflow

## Troubleshooting

### Commands not suggesting automatically?

1. Check if trigger phrases match your vocabulary
2. Make sure the referenced commands actually exist
3. Verify commands are in the right namespace
4. Test with exact phrases first: "what should I work on?"

### Suggesting wrong commands?

1. Make sure trigger phrases are specific to this domain
2. Check for conflicts with other skills
3. Remove generic phrases like "what" or "show"
4. Add more specific phrase variations

### Commands not working when suggested?

1. Run the command manually to debug
2. Check command implementation for errors
3. Verify required environment variables are set
4. See `.claude/commands/{domain}/` for implementation details

## Related Skills

This skill works alongside:

- `other-skill-name` - For cross-domain workflows
- `devops-expert` - For infrastructure management
- `quality-expert` - For testing coordination

See related commands documentation for integration examples.

## Version History

- **1.0.0** - Initial skill created by scaffold
  - {ACTION_1_DESCRIPTION}
  - {ACTION_2_DESCRIPTION}
  - {ACTION_3_DESCRIPTION}

## Next Steps

1. **Customize trigger phrases** in the frontmatter above
2. **Test auto-discovery** by asking questions naturally
3. **Update commands** in `.claude/commands/{domain}/`
4. **Run /registry:scan** to verify skill is registered
5. **Share with team** if using team sharing
