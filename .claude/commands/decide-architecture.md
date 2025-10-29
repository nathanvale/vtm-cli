# Decide: Architecture - AI-Powered Structure Recommendations

**Command:** `/decide:architecture {description} [options]`
**Version:** 2.0.0 (Optimized)
**Purpose:** Analyze requirements and recommend optimal component architecture using pattern matching and best practices.

---

## What This Command Does

Acts as an architecture thinking partner that:

- Analyzes your description and recommends component structure
- Identifies architectural patterns that match your needs
- Suggests command names, integrations, and hooks
- Analyzes existing domains for improvement opportunities
- Provides refactoring recommendations based on best practices

**Note:** This is a lightweight version using rules and patterns, not ML/AI.

---

## Usage

### Analyze Existing Domain

```bash
# Analyze domain structure
/decide:architecture --analyze vtm

# Get refactoring suggestions
/decide:architecture --analyze vtm --suggest-refactoring
```

### Recommend Architecture from Description (Coming Soon)

```bash
# Basic recommendation
/decide:architecture "task tracking for remote teams"

# With specific requirements
/decide:architecture "task tracking with Slack integration and daily standups"
```

---

## Quick Reference

### Supported Flags

| Flag                    | Description                     | Example                     |
| ----------------------- | ------------------------------- | --------------------------- |
| `--analyze <domain>`    | Analyze existing domain         | `--analyze vtm`             |
| `--suggest-refactoring` | Include refactoring suggestions | Use with `--analyze`        |
| `--pattern <name>`      | Request specific pattern        | `--pattern task-management` |

### Architecture Patterns

The command recognizes these patterns:

- **task-management**: CRUD operations for tasks
- **team-collaboration**: Team coordination tools
- **workflow**: Multi-step process management
- **crud**: Basic create/read/update/delete
- **analytics**: Metrics and reporting
- **notification**: Alerting and messaging

_Full list in `.claude/lib/data/architecture-patterns.json`_

---

## Implementation

Execute via the VTM CLI:

```bash
#!/bin/bash

# Optimized argument parsing
DESCRIPTION=""
DOMAIN=""
IS_ANALYZE=false
IS_REFACTOR=false
SUGGEST_REFACTORING=false
PATTERN=""

# Parse all arguments efficiently in one pass
for ((i=0; i<${#ARGUMENTS[@]}; i++)); do
  arg="${ARGUMENTS[$i]}"
  case "$arg" in
    --analyze)
      IS_ANALYZE=true
      DOMAIN="${ARGUMENTS[$((i+1))]}"
      ((i++))
      ;;
    --refactor)
      IS_REFACTOR=true
      DOMAIN="${ARGUMENTS[$((i+1))]}"
      ((i++))
      ;;
    --suggest-refactoring)
      SUGGEST_REFACTORING=true
      ;;
    --pattern)
      PATTERN="${ARGUMENTS[$((i+1))]}"
      ((i++))
      ;;
    -*)
      # Unknown flag - skip
      ;;
    *)
      # First non-flag argument is description
      [[ -z "$DESCRIPTION" ]] && DESCRIPTION="$arg"
      ;;
  esac
done

# Find vtm CLI (check local build first, then global)
VTM_CMD=""
if [[ -x "./dist/index.js" ]]; then
  VTM_CMD="node ./dist/index.js"
elif command -v vtm &> /dev/null; then
  VTM_CMD="vtm"
else
  echo "❌ Error: vtm CLI not found"
  echo ""
  echo "Please ensure vtm-cli is installed:"
  echo "  • Local build: pnpm install && pnpm run build"
  echo "  • Global install: pnpm link"
  exit 1
fi

# Execute based on mode
if [[ "$IS_ANALYZE" == true ]] || [[ "$IS_REFACTOR" == true ]]; then
  # Domain analysis mode
  [[ -z "$DOMAIN" ]] && {
    echo "❌ Error: Domain name required"
    echo "Usage: /decide:architecture --analyze <domain>"
    exit 1
  }

  # Build command
  if [[ "$SUGGEST_REFACTORING" == true ]]; then
    $VTM_CMD analyze "$DOMAIN" --suggest-refactoring
  else
    $VTM_CMD analyze "$DOMAIN"
  fi
else
  # Recommendation from description mode
  [[ -z "$DESCRIPTION" ]] && {
    echo "❌ Error: Description required"
    echo "Usage: /decide:architecture \"<description>\""
    exit 1
  }

  # Not yet fully implemented
  echo "🤖 Architecture Recommendation"
  echo ""
  echo "Note: Recommendation from description coming soon."
  echo "Current support: /decide:architecture --analyze <domain>"
fi
```

---

## Related Commands

- **Design Domain:** `/design:domain {name}` - Use recommendations to design
- **Scaffold:** `/scaffold:domain {name}` - Generate from design
- **Test:** `/test:command {name}` - Validate recommendations
- **Registry:** `/registry:scan` - See current architecture

---

## Technical Details

**Library:** Backed by DecisionEngine in `src/lib/decision-engine.ts`
**Patterns:** Defined in `src/lib/data/architecture-patterns.json`
**Test Coverage:** 85.1% (40 tests in `src/lib/__tests__/decision-engine.test.ts`)

---

**Status:** Production Ready (v2.0.0)
**Last Updated:** 2025-10-30
