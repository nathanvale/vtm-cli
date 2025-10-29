---
allowed-tools: Bash(cat:*, echo:*)
description: {DESCRIPTION}
argument-hint: [options]
---

# {DOMAIN_DISPLAY}: {OPERATION_DISPLAY}

{DESCRIPTION}

## About

This command provides {OPERATION_DISPLAY} functionality for the {DOMAIN_DISPLAY} domain.

## Usage

```bash
/{DOMAIN}:{OPERATION} [arg1] [arg2]
```

## Arguments

Use the `$ARGUMENTS` array to access parameters:

```bash
FIRST_ARG="${ARGUMENTS[0]:-default}"
SECOND_ARG="${ARGUMENTS[1]:-}"
```

## Examples

```bash
/{DOMAIN}:{OPERATION}
/{DOMAIN}:{OPERATION} filter
/{DOMAIN}:{OPERATION} filter limit
```

## Implementation

This is a template. Replace the implementation with your logic:

```bash
#!/bin/bash
set -e

# Parse arguments
ARG1="${ARGUMENTS[0]:-}"
ARG2="${ARGUMENTS[1]:-}"

echo "Executing {OPERATION} with args: $ARG1, $ARG2"

# TODO: Implement your logic here
# Examples:
#   • Query a database
#   • Call an API
#   • Read local files
#   • Process data

echo "✅ {OPERATION} completed"
```

## Next Steps

1. **Customize the implementation**
   - Replace TODO sections with actual logic
   - Add error handling
   - Format output for readability

2. **Test locally**
   ```bash
   /{DOMAIN}:{OPERATION}
   ```

3. **Link to other commands**
   - Reference related /{DOMAIN}: commands
   - Suggest next steps

4. **Verify in registry**
   ```bash
   /registry:scan {DOMAIN}
   ```

## Tips

- Use `echo` for output
- Format with colors/emojis for better UX
- Handle errors gracefully
- Document dependencies
- Keep output concise

## Related Commands

- View design: `.claude/designs/{DOMAIN}.json`
- See registry: `/registry:scan {DOMAIN}`
- Modify commands: `.claude/commands/{DOMAIN}/`
