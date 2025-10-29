# Claude Code Extensibility Framework: Complete System

A comprehensive, intelligent system for modern Claude Code development using
slash commands, skills, MCP, hooks, and plugins.

**What this is:** Professional-grade guidance for building scalable, shareable
Claude Code workflows based on real community patterns from Jeremy Longshore,
Kenny Liao, and Leon van Zyl.

**What this does:** Teaches you how to architect, build, organize, and
distribute Claude Code extensions like successful developers do.

---

## 📚 The Five Documents

### 1. **SYSTEM-OVERVIEW.md** ← Start Here First

**What it is:** High-level introduction to the entire system

**Contains:**

- What we created and why
- Three-part architecture explained
- Key principles baked in
- How to use these documents
- Example: Git Worktree workflow evolution

**Read this when:** You're new to this framework or want to understand the big
picture

**Time:** 5-10 minutes

---

### 2. **claude-code-expert-prompt.md** ← The Core Resource

**What it is:** Sophisticated prompt embedding ecosystem expertise

**Contains:**

- Decision frameworks (when to use which component)
- Complete .claude/ directory architecture
- Real-world pattern examples
- Component decision matrix
- Skill auto-discovery mechanism
- Your superpowers as an expert guide

**Read this when:** You need to ask Claude Code questions or get guidance on
architecture

**Use this when:** You feed it to Claude Code, it becomes your intelligent
expert

**Time:** Skim through, reference as needed

---

### 3. **claude-code-implementation-guide.md** ← The Patterns & Templates

**What it is:** Practical templates showing real implementations

**Contains:**

- Template 1: Command → Skill → Plugin Evolution
- Template 2: Complex Workflow (Git Worktree Manager - full example)
- Template 3: Team Standardization Plugin
- Template 4: Decision Tree for Your Workflow
- Real-world references from Jeremy Longshore's 234+ plugins

**Read this when:** You're actually building something and need template code

**Use this:** Copy, modify, adapt to your needs

**Time:** Reference sections as needed

---

### 4. **using-the-prompt-guide.md** ← The How-To

**What it is:** Instructions for actually using this system

**Contains:**

- 3 setup options (skill, CLAUDE.md, direct context)
- 5 example conversations with the expert
- 5 conversation templates for different scenarios
- Pro tips for maximum effectiveness
- Expected outcomes

**Read this when:** You want to actually engage with Claude Code using this
framework

**Use this:** As a guide for how to interact with the expert prompt

**Time:** Read through once, reference templates when asking questions

---

### 5. **visual-reference-guide.md** ← The Quick Reference

**What it is:** Visual diagrams and matrices for quick lookup

**Contains:**

- Component ecosystem map (diagram)
- Decision tree (visual flowchart)
- Capability matrix (component comparison)
- Directory structure visualization
- Skill trigger mechanism (how auto-discovery works)
- Evolution path: Personal → Team → Community
- Quality checklists
- Community patterns at a glance

**Read this when:** You need quick visual reference or decision support

**Use this:** Look up quickly, use diagrams to explain to others

**Time:** Reference as needed

---

## 🚀 Quick Start Paths

### Path A: I'm Learning the System (First Time)

1. Read: **SYSTEM-OVERVIEW.md** (5 min)
2. Read: **visual-reference-guide.md** (10 min)
3. Skim: **claude-code-expert-prompt.md** (10 min)
4. Reference: Keep **using-the-prompt-guide.md** handy

**Result:** You understand the ecosystem

### Path B: I'm Building Something New

1. Check: **visual-reference-guide.md** decision tree (2 min)
2. Find: **claude-code-implementation-guide.md** matching template
3. Copy: Template code, modify for your needs
4. Ask: Use **using-the-prompt-guide.md** conversation templates with expert
   prompt

**Result:** You implement correctly

### Path C: I Need Expert Guidance

1. Prepare: Your requirements/problem
2. Use: **using-the-prompt-guide.md** conversation template
3. Feed: **claude-code-expert-prompt.md** to Claude Code
4. Ask: Your question
5. Implement: Using guidance + **claude-code-implementation-guide.md** templates

**Result:** You get professional-level architecture advice

### Path D: I'm Teaching Someone

1. Give them: **SYSTEM-OVERVIEW.md**
2. Show them: **visual-reference-guide.md** diagrams
3. Walk through: **claude-code-implementation-guide.md** templates together
4. Point to: **using-the-prompt-guide.md** conversation examples

**Result:** They understand how to use the system

---

## 🎯 By Use Case

### Use Case: "I have a repetitive task to automate"

**Read:** visual-reference-guide.md (decision tree) **Template:**
claude-code-implementation-guide.md (Template 1: Evolution) **Ask:**
using-the-prompt-guide.md (Conversation A template)

### Use Case: "I want to share this with my team"

**Read:** claude-code-implementation-guide.md (Template 3: Team) **Learn:**
visual-reference-guide.md (Evolution path) **Ask:** using-the-prompt-guide.md
(Conversation 2 template)

### Use Case: "This is complex, I don't know where to start"

**Ask:** using-the-prompt-guide.md (Conversation D template) **With:**
claude-code-expert-prompt.md **Then implement:** using
claude-code-implementation-guide.md templates

### Use Case: "I need to understand components"

**Read:** visual-reference-guide.md (ecosystem map + matrix) **Reference:**
claude-code-expert-prompt.md (component descriptions) **See examples:**
claude-code-implementation-guide.md (real implementations)

---

## 🔑 Key Resources Referenced

### From Community

- **Jeremy Longshore:** 234+ production plugins (patterns proven at scale)
  - `github.com/jeremylongshore/claude-code-plugins-plus`
- **Kenny Liao:** Complete Skills guide + trigger optimization
  - YouTube: "The Only Claude Skills Guide You Need" (Oct 24, 2025)
  - Cheatsheet: `share.note.sx/8k50udm8`
- **Leon van Zyl:** Plugin distribution & marketplace workflow
  - YouTube: "Claude Code Plugins Changed My Workflow Forever" (Oct 16, 2025)

### Official

- **Anthropic Docs:** `docs.claude.com/en/docs/claude-code/`
- **Skills Repo:** `github.com/anthropics/skills`

---

## 💡 Core Concepts

### The Component Stack

```
PLUGINS (Distribution)
  ├── SLASH COMMANDS (Quick actions)
  ├── SKILLS (Auto-discovery)
  ├── MCP SERVERS (External systems)
  ├── HOOKS (Event automation)
  └── SUBAGENTS (Specialists)
```

### The Evolution Path

```
Personal Command → Smart Skill → Team Plugin → Community Share
```

### The Organization

```
.claude/
├── commands/      (Quick utilities)
├── skills/        (Auto-discovery)
├── plugins/       (Shareable packages)
├── mcp-servers/   (External integrations)
├── hooks/         (Auto-enforcement)
└── agents/        (Specialized workers)
```

---

## 📖 How to Use This Framework

### Best Practice 1: Reference the Prompt

When asking Claude Code questions, include the expert prompt:

```
<paste claude-code-expert-prompt.md>

I want to [build/share/improve] [workflow]. What's the best approach?
```

### Best Practice 2: Use Templates

Don't start from scratch. Copy templates from implementation-guide.md and
modify.

### Best Practice 3: Follow Patterns

When in doubt, reference what Jeremy Longshore does (234+ plugins are real
implementations).

### Best Practice 4: Check Decision Trees

Before building, use visual-reference-guide.md decision tree to understand
architecture.

### Best Practice 5: Use Conversation Templates

Don't write novel prompts. Use templates from using-the-prompt-guide.md.

---

## ✅ Quality Checklist: Your Implementation

Before sharing/publishing:

- [ ] Directory structure matches .claude/ patterns
- [ ] Slash commands have clear $ARGUMENTS
- [ ] Skills have trigger_phrases matching user language
- [ ] plugin.yaml includes versioning
- [ ] README.md explains usage
- [ ] Tested locally
- [ ] Ready for team/community

---

## 🎓 Learning Outcomes

After working with this system, you'll understand:

✓ When to use each Claude Code component ✓ How to organize .claude/ for
scalability ✓ How to make workflows auto-discoverable (Skills) ✓ How to package
for team distribution (Plugins) ✓ How successful developers build these systems
✓ How to make decisions without asking for guidance

---

## 🔍 File Reference

| File                                | Purpose                   | Size | Read Time         |
| ----------------------------------- | ------------------------- | ---- | ----------------- |
| SYSTEM-OVERVIEW.md                  | Introduction & philosophy | 11K  | 5-10 min          |
| claude-code-expert-prompt.md        | Core expertise            | 13K  | Reference         |
| claude-code-implementation-guide.md | Practical templates       | 13K  | Reference         |
| using-the-prompt-guide.md           | How to use the system     | 12K  | 5 min + reference |
| visual-reference-guide.md           | Diagrams & quick lookup   | 17K  | Reference         |
| README.md (this file)               | Master index              | 8K   | 5 min             |

**Total:** ~68K of comprehensive Claude Code expertise

---

## 🚀 Getting Started Right Now

### Option 1: Quick Learning (15 minutes)

1. Read this file (README.md) - 5 min
2. Read: SYSTEM-OVERVIEW.md - 5 min
3. Skim: visual-reference-guide.md - 5 min

**You now understand the framework**

### Option 2: Build Your First Thing (30 minutes)

1. Decide what to automate
2. Find matching template in claude-code-implementation-guide.md
3. Copy template, modify for your needs
4. Test locally in .claude/commands/
5. Done!

**You now have a working slash command**

### Option 3: Get Expert Guidance (now)

1. Copy claude-code-expert-prompt.md
2. Follow template from using-the-prompt-guide.md
3. Ask Claude Code your question
4. Implement based on guidance

**You now have professional-level architecture advice**

---

## 🤔 FAQ

**Q: Do I need all components for everything?** A: No. Start simple (slash
command) and add as needed. Use decision tree in visual-reference-guide.md.

**Q: Where do I put my files?** A: Follow .claude/ structure in
claude-code-expert-prompt.md. Copy Template 2 from implementation-guide.md.

**Q: How do I know if my architecture is good?** A: Compare against Jeremy
Longshore's plugins or use checklist in visual-reference-guide.md.

**Q: When should I make it a plugin?** A: When your team needs it or you want to
share. See evolution path in visual-reference-guide.md.

**Q: What if I'm stuck?** A: (1) Check visual-reference-guide.md decision tree,
(2) Review matching template in implementation-guide.md, (3) Use conversation
template from using-the-prompt-guide.md with expert prompt.

**Q: Can I really publish and share these?** A: Yes! See Team Standardization
pattern in implementation-guide.md and Leon van Zyl's distribution workflow.

---

## 📝 Notes

- All resources are self-contained (no external URLs required)
- Ready to use offline
- Safe to commit to repo (includes all context needed)
- Can be used to train team members
- Designed for both solo and team usage

---

## 🎯 The Bottom Line

This system answers the question:

**"How do successful Claude Code developers build and share intelligent,
scalable workflows?"**

By studying real patterns (Jeremy Longshore's 234+ plugins), learning best
practices (Kenny Liao's skills guide), understanding distribution (Leon van
Zyl's workflow), and organizing coherently (.claude/ structure), you can build
like the professionals.

Everything here is tested, proven, and ready to use.

**Start with SYSTEM-OVERVIEW.md next.**

---

## 📞 What to Do Now

1. **Pick your path** (learning/building/getting guidance)
2. **Read the relevant sections** (see Quick Start Paths above)
3. **Try something small** (Template 1 in implementation-guide.md)
4. **Build with confidence** (now you understand the system)

**Questions?** Use templates from using-the-prompt-guide.md with expert prompt.

---

**Created:** October 2025 **Sources:** Jeremy Longshore, Kenny Liao, Leon van
Zyl, Anthropic Docs **Purpose:** Making Claude Code extensibility accessible and
systematic **Status:** Ready to use
