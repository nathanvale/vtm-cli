# /design:domain - Quick Reference

## TL;DR

Design a domain in 5 questions → Get a design spec → Run `/scaffold:domain` to generate files.

## Command Syntax

```bash
/design:domain {domain-name} [description]
```

## The 5 Questions

| #   | Question          | Input                   | Example                       |
| --- | ----------------- | ----------------------- | ----------------------------- |
| 1   | Core operations?  | Comma-separated         | `next, review, context, list` |
| 2   | Auto-discovery?   | yes/no                  | `yes`                         |
| 3   | External systems? | yes/no/maybe            | `yes`                         |
| 4   | Automation hooks? | yes/no                  | `no`                          |
| 5   | Sharing scope?    | personal/team/community | `personal`                    |

## Output

```
.claude/designs/{domain}.json
```

## Quick Examples

### PM Domain (Personal)

```bash
/design:domain pm

Q1: next, review, context
Q2: yes
Q3: no
Q4: no
Q5: personal
```

### DevOps Domain (Team)

```bash
/design:domain devops "Infrastructure"

Q1: deploy, status, logs, rollback
Q2: yes
Q3: yes
Q4: yes
Q5: team
```

### Testing Domain (Solo)

```bash
/design:domain test

Q1: run, debug, report
Q2: no
Q3: no
Q4: no
Q5: personal
```

## Validation Rules

✅ **Domain Name:**

- Lowercase only
- Alphanumeric + hyphens
- 2-50 characters
- Examples: `pm`, `task-manager`, `devops`, `test-utils`

✅ **Operations:**

- At least 1 required
- Comma-separated
- Becomes: `/{domain}:{operation}`

✅ **Sharing Scope:**

- `personal` = local only
- `team` = shared with team (provide emails)
- `community` = public registry

## Next Step

```bash
/scaffold:domain {domain}
```

This generates all the command files and templates.

## Common Patterns

### Task Management

```
Operations: next, context, list, update, complete
Auto-discovery: yes
External: yes (task database)
Automation: yes (pre-commit)
Sharing: team
```

### DevOps/Infrastructure

```
Operations: deploy, status, logs, rollback
Auto-discovery: yes
External: yes (cloud API)
Automation: yes (pre-deploy validation)
Sharing: team
```

### Local Development

```
Operations: setup, test, build, clean
Auto-discovery: no
External: no
Automation: no
Sharing: personal
```

## Troubleshooting

| Issue                 | Solution                                    |
| --------------------- | ------------------------------------------- |
| "Invalid domain name" | Use lowercase, alphanumeric + hyphens only  |
| "Domain exists"       | Delete: `rm .claude/designs/{domain}.json`  |
| "No operations"       | Enter at least one operation (e.g., "next") |
| "Invalid scope"       | Use: personal, team, or community           |

## Key Files

- **Main Docs:** `.claude/commands/design-domain.md`
- **User Guide:** `.claude/commands/README-DESIGN-DOMAIN.md`
- **Dev Guide:** `.claude/commands/DESIGN-DOMAIN-IMPLEMENTATION.md`
- **Implementation:** `.claude/commands/scaffold/design.js`
- **Example:** `.claude/designs/pm-example.json`

## What Gets Generated

```
.claude/designs/{domain}.json
├── name: "domain-name"
├── description: "Your description"
├── operations: [...]
├── auto_discovery: {...}
├── external_integration: {...}
├── automation: {...}
├── sharing: {...}
└── recommendations: {...}
```

## Flow Chart

```
User Input
    ↓
Validate Domain Name
    ↓
Question 1: Operations
    ↓
Question 2: Auto-Discovery
    ↓
Question 3: External Systems
    ↓
Question 4: Automation
    ↓
Question 5: Sharing
    ↓
Generate Recommendations
    ↓
Create .claude/designs/{domain}.json
    ↓
Display Summary
    ↓
Next: /scaffold:domain {domain}
```

## Tips

✨ **Best Practices:**

1. Keep operations focused and specific
2. Enable auto-discovery for better UX
3. Plan external systems upfront
4. Add automation only when needed
5. Use team sharing if building with others

🚀 **Get Started:**

```bash
/design:domain my-domain
```

📖 **Learn More:**

```bash
cat .claude/commands/README-DESIGN-DOMAIN.md
```

---

**Happy designing! 🎯**
