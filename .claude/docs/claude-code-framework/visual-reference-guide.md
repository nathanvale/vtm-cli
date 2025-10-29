# Claude Code Extensibility: Visual Reference Guide

## Component Ecosystem Map

```
┌─────────────────────────────────────────────────────────────────┐
│                  CLAUDE CODE ECOSYSTEM                          │
└─────────────────────────────────────────────────────────────────┘

                              USER INTENT
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            ┌───────────────┐ ┌──────────┐ ┌─────────────┐
            │ QUICK ACTION  │ │DISCOVERY │ │EXTERNAL SYS │
            │  (Immediate)  │ │ (Auto)   │ │ (API/Data)  │
            └───────────────┘ └──────────┘ └─────────────┘
                    │              │              │
                    ▼              ▼              ▼
            ┌───────────────┐ ┌──────────┐ ┌─────────────┐
            │    SLASH      │ │  SKILLS  │ │     MCP     │
            │  COMMANDS     │ │          │ │   SERVERS   │
            └───────────────┘ └──────────┘ └─────────────┘
                    │              │              │
                    └──────────────┼──────────────┘
                                   │
                          ┌────────┴────────┐
                          ▼                 ▼
                      ┌────────┐       ┌─────────┐
                      │ HOOKS  │       │SUBAGENTS│
                      │ (Events)│       │(Experts)│
                      └────────┘       └─────────┘
                          │                 │
                          └────────┬────────┘
                                   ▼
                            ┌────────────┐
                            │  PLUGINS   │
                            │ (Distribution)
                            └────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            ┌───────────────┐ ┌──────────┐ ┌─────────────┐
            │    LOCAL      │ │   TEAM   │ │  COMMUNITY  │
            │   (.claude/)  │ │(Repo)    │ │ (Marketplace)
            └───────────────┘ └──────────┘ └─────────────┘
```

---

## Component Selection Decision Tree

```
START: I want to automate something
│
├─ Is it a quick utility I'll invoke manually?
│  ├─ YES
│  │  └─→ SLASH COMMAND (.claude/commands/)
│  │      Usage: /project:mytask arg1 arg2
│  │
│  └─ NO → Continue...
│
├─ Should Claude know *when* to suggest this?
│  ├─ YES
│  │  └─→ Add SKILL (.claude/skills/)
│  │      + trigger_phrases: ["when user says this"]
│  │
│  └─ NO → Skip SKILL → Continue...
│
├─ Do I need to access external systems?
│  ├─ YES
│  │  └─→ Add MCP SERVER (.claude/mcp-servers/)
│  │      + Database, API, Cloud Platform
│  │
│  └─ NO → Continue...
│
├─ Should this auto-run on events?
│  ├─ YES
│  │  └─→ Add HOOKS (.claude/hooks/)
│  │      + pre-commit, post-tool-use, etc.
│  │
│  └─ NO → Continue...
│
├─ Is this complex with multiple specialists needed?
│  ├─ YES
│  │  └─→ Add SUBAGENTS (.claude/agents/)
│  │      + Planner, Coder, Tester, Validator
│  │
│  └─ NO → Skip SUBAGENTS...
│
├─ Will my team / others use this?
│  ├─ YES
│  │  └─→ Package as PLUGIN (.claude/plugins/)
│  │      + plugin.yaml manifest
│  │      + Version it
│  │      + Publish to registry
│  │
│  └─ NO → Keep as local commands
│
END: You have your architecture!
```

---

## Component Capability Matrix

```
                    SLASH     SKILLS    MCP      HOOKS    SUBAGENTS  PLUGINS
                    COMMANDS           SERVERS           
────────────────────────────────────────────────────────────────────────────
User-invoked        ✓ YES     Limited   ✗        ✗        ✓ Can       ✓ YES
                              (via cmd)                    trigger    (bundles)

Auto-triggered      ✗         ✓ YES     ✗        ✓ YES    ✓ YES      ✗
                    (manual)   (smart)            (events) (coordinate)

External access     ✗         ✗         ✓ YES    ✓ YES    ✓ YES      ✓ YES
                                                  (limited) (if has)   (if has)

Takes arguments     ✓ YES     ✗         ✓ YES    ✓ YES    ✓ YES      ✓ YES
                    ($ARGS)    (context) (config)                    (bundled)

Complex logic       ✗         ✓ YES     ✗        ✓ YES    ✓ YES      ✓ YES
                    (simple)   (rich)             (scripts) (agents)  (bundles)

Auto-discovery      ✗         ✓ YES     ✗        ✗        ✗          ✓ YES
                    (manual)   (trigger) (static) (fixed)  (manual)   (Skill)

Shareable           ✗         ✓ YES     ✓ YES    ✓ YES    ✓ YES      ✓ YES
                    (local)    (yes)     (yes)    (yes)    (yes)      (primary)

Token-efficient     ✓ YES     ✓ YES     ✓ YES    ✓ YES    ✗          ✓ YES
                    (small)    (30-50)   (ref)    (ref)    (large)    (bundled)
                               until
                               loaded
```

---

## Directory Structure Visual

```
.claude/
│
├── commands/                          ← Quick slash commands
│   ├── git/
│   │   ├── worktree-create.md        (/project:worktree:create)
│   │   ├── worktree-list.md
│   │   └── worktree-switch.md
│   ├── testing/
│   │   └── run-tests.md
│   └── deployment/
│       └── deploy-staging.md
│
├── skills/                            ← Auto-discovery instructions
│   ├── git-orchestration/
│   │   └── SKILL.md                  (teach Claude when/how)
│   ├── testing-excellence/
│   │   └── SKILL.md
│   └── deployment-safety/
│       └── SKILL.md
│
├── plugins/                           ← Shareable packages
│   ├── git-worktree-manager/
│   │   ├── plugin.yaml               (manifest + versioning)
│   │   ├── SKILL.md                  (skill definition)
│   │   ├── commands/                 (related commands)
│   │   │   ├── create.md
│   │   │   ├── list.md
│   │   │   └── delete.md
│   │   ├── mcp-servers/              (if needed)
│   │   │   └── git-api.json
│   │   ├── hooks/                    (if needed)
│   │   │   └── pre-commit/
│   │   │       └── validate.sh
│   │   ├── agents/                   (if needed)
│   │   │   ├── validator.yaml
│   │   │   └── deployer.yaml
│   │   └── README.md
│   │
│   └── testing-automation/
│       ├── plugin.yaml
│       ├── SKILL.md
│       └── commands/
│
├── mcp-servers/                       ← External system configs
│   ├── dataverse/
│   │   └── mcp.json
│   └── sharepoint/
│       └── mcp.json
│
├── hooks/                             ← Event automation
│   ├── pre-commit/
│   │   ├── sanitize-pii.sh
│   │   └── validate-branch.sh
│   ├── post-tool-use/
│   │   └── update-documentation.sh
│   └── on-test-failure/
│       └── notify-team.sh
│
├── agents/                            ← Specialized agents
│   ├── code-reviewer.yaml
│   ├── test-coordinator.yaml
│   └── deployment-validator.yaml
│
├── CLAUDE.md                          ← Project context
├── claude-code-review.yml             ← Code review config
└── config.json                        ← Global settings
```

---

## Skill Trigger Mechanism

```
STARTUP SEQUENCE:
────────────────

1. Claude Code boots
   └─→ Reads all SKILL.md files in .claude/skills/ and .claude/plugins/*/
       └─→ Extracts trigger_phrases from frontmatter
           └─→ Stores in memory (30-50 tokens per skill)

2. User says something
   └─→ Claude checks: Does this match any trigger_phrases?
       
       Example: User says "I want to create a worktree for feature-auth"
       
       Skill has: trigger_phrases: ["create a worktree", "parallel development"]
       
       ✓ MATCH! → Full SKILL.md loads (rich instructions, examples, context)
       
       ✗ NO MATCH → Skill stays lightweight (not loaded)

3. Claude responds
   └─→ With context from loaded skill
   └─→ Suggests relevant commands
   └─→ Auto-invokes when appropriate

RESULT: Feels like Claude knows your workflows perfectly, but actually 
       it's intelligent trigger-based discovery.
```

---

## Evolution Path: Personal → Team → Community

```
STAGE 1: LOCAL DEVELOPMENT
────────────────────────────
.claude/commands/
  └─ my-task.md

Status: Personal, manual invocation
Usage: /my-task
Sharing: "I can show you my command"

        ↓ (Add discovery) ↓

STAGE 2: SMART LOCAL
─────────────────────
.claude/commands/
  └─ my-task.md
.claude/skills/
  └─ SKILL.md (with trigger phrases)

Status: Personal, auto-discovered by Claude
Usage: Just mention it naturally, Claude suggests
Sharing: "Copy my commands and skills folders"

        ↓ (Package properly) ↓

STAGE 3: TEAM READY
────────────────────
.claude/plugins/my-task-plugin/
  ├─ plugin.yaml
  ├─ SKILL.md
  ├─ commands/
  └─ hooks/

Status: Versioned, documented, installable
Usage: /plugin install my-task-plugin@company-registry
Sharing: Add to team repo, share plugin.yaml

        ↓ (Publish) ↓

STAGE 4: COMMUNITY
───────────────────
GitHub: yourorg/claude-code-plugins
Marketplace: claude-code-plugins-plus

Status: Public, indexed, discoverable
Usage: /plugin install my-task-plugin@community
Sharing: Global audience, contributions welcome

KEY INSIGHT: Each stage is just organization + metadata. The commands 
             themselves don't change much. It's about presentation and 
             distribution.
```

---

## Real-World Example: Git Worktree Manager

```
WHAT USER WANTS:
  "Create isolated git worktrees for parallel development with port management"

ARCHITECTURE DECISION:
  ✓ Slash commands (user-invoked: create, list, switch, delete)
  ✓ Skills (auto-suggest: "parallel development")
  ✓ Hooks (validate: pre-commit checks)
  ✗ MCP (local git only, don't need external)
  ✗ Subagents (not needed, straightforward commands)
  = Package as plugin (team-wide value)

DIRECTORY STRUCTURE:
  .claude/plugins/git-worktree-manager/
  ├── plugin.yaml
  │   name: git-worktree-manager
  │   version: 1.2.0
  │   marketplace: claude-code-plugins-plus
  │
  ├── SKILL.md
  │   trigger_phrases:
  │     - "create a worktree"
  │     - "parallel development"
  │     - "worktree on port"
  │
  ├── commands/
  │   ├── create.md          (/project:worktree:create feature 3001)
  │   ├── list.md            (/project:worktree:list)
  │   ├── switch.md          (/project:worktree:switch feature)
  │   └── delete.md          (/project:worktree:delete feature)
  │
  └── hooks/
      └── pre-commit/
          └── validate-branch.sh    (prevent commits to main)

USAGE PROGRESSION:
  
  Individual: /project:worktree:create feature-auth 3001
  Team: /plugin install git-worktree-manager@company
        (Everyone gets commands + skills + hooks)
  Smart: "I want to work on two features in parallel"
         → Claude: "I can set up parallel worktrees"
         → Suggests /project:worktree:create automatically
```

---

## When to Use Each Component: Quick Reference

| Component | For | Start With | Example |
|-----------|-----|------------|---------|
| **Commands** | Quick utilities | `.md` file | `worktree-create.md` |
| **Skills** | Auto-discovery | Add to command | "trigger_phrases" |
| **MCP** | External systems | `mcp.json` config | Database connection |
| **Hooks** | Auto-enforcement | `pre-commit/` script | Lint on commit |
| **Subagents** | Specialists | `.yaml` definition | Validator + Deployer |
| **Plugins** | Team/sharing | `plugin.yaml` | Packaged workflow |

---

## Trigger Phrase Quality Checklist

```
GOOD TRIGGER PHRASES:
✓ "create a worktree"           (User would actually say this)
✓ "parallel development"         (Real use case language)
✓ "worktree on port"            (Specific to domain)
✓ "switch worktree"             (Clear action)
✓ "new feature branch"          (Related problem)

BAD TRIGGER PHRASES:
✗ "git"                         (Too generic, triggers constantly)
✗ "worktree"                    (Single word, ambiguous)
✗ "execute my command"          (Artificial language)
✗ "run the thing"               (Vague)
✗ No trigger phrases at all     (Not discoverable)

TEST:
1. Write trigger phrases
2. Mentally say them naturally
3. Ask: "Would Claude actually hear this?"
4. If no → Refine phrases
5. If yes → Good to go!
```

---

## Token Efficiency Chart

```
COMPONENT STARTUP COST (until needed):

Slash Command:        ~10 tokens    (basic reference)
Skill (trigger only): ~30-50 tokens (full loads on match)
MCP (reference):      ~20 tokens    (config reference)
Hook (reference):     ~15 tokens    (event reference)
Subagent (stub):      ~50 tokens    (agent definition)
Plugin (manifest):    ~25 tokens    (plugin.yaml)

TOTAL STARTUP: ~150 tokens for full system

RESULT: Claude loads fast, rich context only when needed
```

---

## Community Patterns at a Glance

| Developer | Pattern | Repo |
|-----------|---------|------|
| **Jeremy Longshore** | 234+ production plugins | `github.com/jeremylongshore/claude-code-plugins-plus` |
| **Kenny Liao** | Trigger phrase optimization | YouTube: "The Only Claude Skills Guide" |
| **Leon van Zyl** | Plugin distribution workflow | YouTube: "Plugins Changed My Workflow" |

LESSON: If you're building similar workflows, use these patterns. They're proven.

---

## Sanity Check: Is Your Architecture Sound?

Ask yourself:

1. **Is it organized?** 
   - [ ] Commands grouped by domain (git/, testing/, deploy/)
   - [ ] Skills at root with trigger phrases
   - [ ] Each component has clear responsibility

2. **Is it shareable?**
   - [ ] Works across team members (no hardcoded paths)
   - [ ] Documented with examples
   - [ ] Versioned (if plugin)

3. **Is it scalable?**
   - [ ] Started simple, can grow
   - [ ] Can evolve from commands → skills → plugin
   - [ ] Easy to add new commands in same namespace

4. **Is it discoverable?**
   - [ ] Skill trigger phrases match user language
   - [ ] Description explains when to use
   - [ ] Commands are obvious from names

If all ✓, you're good. If any ✗, refine before sharing.
