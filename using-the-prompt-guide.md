# How to Use the Claude Code Extensibility Expert Prompt

## Quick Setup

### Option 1: Save as .claude/skills/ Skill
```
.claude/skills/
  claude-code-expert/
    SKILL.md  ← Copy entire claude-code-expert-prompt.md here
```

Then just mention Claude Code workflow and Claude auto-loads the expertise.

### Option 2: Reference in CLAUDE.md
```markdown
# Project Context

## Claude Code Expertise
This project uses advanced Claude Code patterns. Reference the Claude Code 
Extensibility Expert framework for guidance on:
- Slash command vs Skills vs MCP decisions
- .claude/ directory structure
- Plugin architecture
- Real-world community patterns (Kenny Liao, Leon van Zyl, Jeremy Longshore)

[Include the expert prompt as context]
```

### Option 3: Use as Chat Context
Paste the prompt into Claude Code when you ask:
```
<paste entire claude-code-expert-prompt.md>

I want to create a workflow that automates X. What's the best Claude Code 
architecture for this?
```

---

## Example Conversations

### Conversation 1: "Should I use slash commands or skills?"

**You ask:**
```
I have a repetitive task that my team does every day. Should I create a slash 
command or a skill for it?
```

**Claude (with expert prompt) responds:**
```
Great question! Here's how to think about it:

SLASH COMMANDS if:
- Team explicitly invokes it ("run my task")
- It's straightforward utility operation
- Local to your project for now

SKILLS if:
- You want Claude to *suggest* it automatically
- It's part of a larger workflow Claude should recognize
- Teaching Claude the philosophy matters ("when AND how")

For a daily team task, I'd recommend:
1. Start with SLASH COMMAND in `.claude/commands/
2. Add SKILL so Claude auto-detects when relevant
3. If whole team needs it, package as PLUGIN

This pattern (matching what Jeremy Longshore does) scales you from 
individual→team→community usage.

Show me the workflow and I'll help structure the .claude/ directory.
```

---

### Conversation 2: "How do I share this with my team?"

**You ask:**
```
I've built a great git workflow system with slash commands. How do I share 
this with the team?
```

**Claude responds with:**
```
Perfect timing! Here's the evolution path:

CURRENT STATE (Local Commands)
.claude/commands/
  ├── git/
  │   ├── my-workflow-1.md
  │   ├── my-workflow-2.md
  │   └── my-workflow-3.md

TEAM READY (Plugin)
Create: .claude/plugins/your-git-workflow/
  ├── plugin.yaml          ← Versioning + metadata
  ├── SKILL.md            ← Trigger phrases for auto-discovery
  ├── commands/           ← Your existing commands here
  ├── hooks/              ← Auto-enforcement (optional)
  └── README.md

Then team installs with: /plugin install your-git-workflow@company

This follows Leon van Zyl's plugin distribution pattern. I can help you:
1. Create the plugin.yaml manifest
2. Write the SKILL.md with trigger phrases (Kenny Liao's technique)
3. Structure for GitHub publishing
4. Test locally before sharing

Want me to generate the plugin structure?
```

---

### Conversation 3: "How do I know what components I need?"

**You ask:**
```
I'm building a deployment automation workflow. I need slash commands, but 
also external API access, and some validation steps. What else?
```

**Claude responds:**
```
This is exactly when the decision framework helps! Let me walk through:

YOUR DEPLOYMENT WORKFLOW NEEDS:

✓ SLASH COMMANDS
  → User invokes deployment commands: /deploy:staging, /deploy:production

✓ SKILLS  
  → Claude knows *when* to suggest deployment (post-tests, pre-release)
  → Teaches Claude your safety philosophy

✓ MCP SERVERS
  → Your deployment APIs, cloud platform integrations
  → Links to external systems

✓ HOOKS
  → Pre-deployment: run tests, security scans
  → Post-deployment: update docs, notify team

✓ SUBAGENTS  
  → Validator: pre-flight checks
  → Deployer: execute deployment
  → Notifier: post-deployment communications

ARCHITECTURE:
Create plugin: .claude/plugins/deployment-orchestration/
  ├── SKILL.md                    ← When to deploy (triggers)
  ├── commands/                   ← /deploy commands
  │   ├── staging.md
  │   ├── production.md
  │   └── rollback.md
  ├── mcp-servers/                ← API integrations
  │   └── aws-api.json
  ├── hooks/                      ← Auto-checks
  │   ├── pre-deploy/
  │   └── post-deploy/
  └── agents/                     ← Specialized work
      ├── validator.yaml
      ├── deployer.yaml
      └── notifier.yaml

This matches Jeremy Longshore's DevOps automation patterns. Want help 
structuring each component?
```

---

### Conversation 4: "How do I write a good Skill?"

**You ask:**
```
I'm creating a Skill for testing automation. How do I write the trigger 
phrases and description so Claude actually uses it?
```

**Claude responds:**
```
This is Kenny Liao's core teaching! Here's what makes Skills auto-discoverable:

BAD (Won't trigger):
---
name: testing
description: Runs tests
---

GOOD (Will trigger):
---
name: testing-framework-expert
description: |
  Expert in your project's testing strategy and best practices.
  
  Knows:
  - When tests should run (pre-commit, PR, pre-deploy)
  - What test coverage targets are
  - Which test types apply (unit, integration, e2e)
  - Performance benchmarks and thresholds
  
  Use when:
  - Developer asks "are we ready for PR?"
  - Implementing new feature (needs tests)
  - Debugging failing tests
  - Optimizing performance
  
trigger_phrases:
  - "run tests"
  - "test this code"
  - "are we ready for PR"
  - "test coverage"
  - "failing test"
  - "performance benchmark"
---

KEY INSIGHTS:
1. Describe your PHILOSOPHY (not just actions)
2. List what the Skill KNOWS
3. Explain WHEN Claude should use it
4. Give SPECIFIC trigger phrases (not vague)
5. Use phrases Claude will actually hear

Claude loads trigger phrases at startup (30-50 tokens). When user says any 
phrase, full Skill content loads with instructions + examples.

Test it:
1. Create SKILL.md with phrases above
2. Say something matching a trigger phrase
3. Claude should suggest your workflow

Want me to refine your testing Skill description?
```

---

### Conversation 5: "How do I organize a complex plugin?"

**You ask:**
```
I'm building a plugin that does 10+ different things. How do I organize 
.claude/plugins/ so it's not a mess?
```

**Claude responds:**
```
Great question! This is how Jeremy Longshore structures his 234+ plugins.
Here's the philosophy:

PRINCIPLE 1: Co-locate by Domain
Instead of:
  commands/
    create.md
    delete.md
    list.md
    update.md
    ✗ All mixed together

Do this:
  commands/
    resources/
      create.md
      delete.md
      list.md
      update.md
    config/
      set.md
      get.md
      validate.md
    ✓ Grouped by what they operate on

PRINCIPLE 2: Separate Concerns
  .claude/plugins/my-plugin/
    ├── plugin.yaml           ← Configuration
    ├── SKILL.md             ← Teaching Claude (one per plugin)
    ├── commands/            ← User actions
    │   ├── resources/
    │   └── config/
    ├── agents/              ← Subagent specialists
    │   ├── validator.yaml
    │   └── deployer.yaml
    ├── mcp-servers/         ← External integrations
    │   └── api-config.json
    ├── hooks/               ← Auto-automation
    │   ├── pre-commit/
    │   └── post-tool-use/
    └── README.md            ← Usage guide

PRINCIPLE 3: One Skill per Plugin
- Each plugin has ONE SKILL.md (not multiple)
- The Skill teaches Claude how all components work together
- Multiple trigger phrases cover different entry points

EXAMPLE: If your plugin does both testing AND deployment
Skill description mentions BOTH, with trigger phrases for each:
  - "run tests" → suggests test commands
  - "deploy to staging" → suggests deploy commands
  
Both handled by ONE Skill.md that understands the full workflow.

This keeps plugin namespace clean and discoverable.

Show me your 10 things and I'll help you group them by domain!
```

---

## Conversation Templates

Use these as starting points:

### Template A: "I'm building something new"
```
I want to automate [task]. My team is [size]. This needs to:
- [requirement 1]
- [requirement 2]
- [requirement 3]

What Claude Code architecture should I use? Where do I start in .claude/?
```

### Template B: "I want to improve existing workflow"
```
I have this existing [command/script/process]. It works but:
- [problem 1]
- [problem 2]

Could Claude Code make this better? What would the evolution look like?
```

### Template C: "I want to share with team"
```
I built this [workflow/automation]. Now I want:
- [goal 1: distribution, standardization, etc]
- [goal 2]

How do I package this as a plugin? What's the path from here to team usage?
```

### Template D: "I'm exploring patterns"
```
I noticed [behavior/pattern] in my workflow. Is this a good pattern?

How do other teams approach this? (Reference: Jeremy Longshore's plugins,
Kenny Liao's examples, etc.)

Can you show me how to structure this properly?
```

### Template E: "I'm stuck on architecture"
```
I'm trying to build [system] but I'm not sure:
- Should I use [option A] or [option B]?
- Does this need MCP? Subagents? Hooks?
- How do I organize .claude/?

Walk me through the decision tree.
```

---

## What the Expert Prompt Handles Well

✅ **Guidance:** Tells you which tool (commands vs skills vs plugins) fits your problem
✅ **Architecture:** Helps structure .claude/ directory coherently
✅ **Decision Making:** Uses decision framework for complex scenarios
✅ **Real-World Patterns:** References Kenny Liao, Leon van Zyl, Jeremy Longshore
✅ **Examples:** Shows practical templates and implementations
✅ **Team Scaling:** Guides from local→team→community sharing
✅ **Education:** Explains *why* certain patterns work

---

## What You Still Handle

❌ Specific debugging of broken scripts (but the expert can guide debugging strategy)
❌ Details about external systems (but can suggest MCP approaches)
❌ Publishing/distribution infrastructure (but can guide git/marketplace workflow)

For these: Get specific advice, then use expert prompt to architect the solution.

---

## Pro Tips

1. **Load the prompt early:** If you mention Claude Code workflows, include the expert prompt
2. **Reference by name:** "Use Kenny Liao's trigger phrase approach" → expert knows what you mean
3. **Ask for structure first:** Before coding, ask the expert for `.claude/` directory structure
4. **Iterate with the prompt:** Show initial design, get feedback, refine
5. **Test in local commands first:** Develop in `.claude/commands/`, validate before plugin

---

## Expected Outcomes

With this prompt, Claude will help you:

- ✅ Understand when to use each Claude Code component
- ✅ Structure workflows that scale from personal→team→open-source
- ✅ Apply real community patterns (not reinvent)
- ✅ Build for auto-discovery and intelligence (Skills with trigger phrases)
- ✅ Package reusable workflows (Plugins with versioning)
- ✅ Make architectural decisions confidently

**Result:** Instead of wondering "how do successful Claude Code users do this?", 
you're building systems that match how they actually do it.
