---
name: {domain}:{action}
description: {ACTION_DESCRIPTION}
namespace: {domain}
version: 1.0.0
# CUSTOMIZE: Add tools used by this command
allowed-tools: Bash, Read
# CUSTOMIZE: Add argument hint
argument-hint: [optional-filter] [optional-limit]
---

# {DOMAIN}: {ACTION}

{ACTION_DESCRIPTION}

## Usage

```
/{domain}:{action} [filter] [limit]
```

## Parameters

- `filter` (optional): Filter criteria for results
  - Customize based on your domain needs
  - Examples: status, priority, type, tag
- `limit` (optional): Maximum results to return (default: 5)

## Examples

```bash
/{domain}:{action}
/{domain}:{action} filter-value
/{domain}:{action} filter-value 10
```

## Implementation

This is a template stub. Customize with:

```bash
#!/bin/bash

# CUSTOMIZE: Parse arguments
FILTER="${ARGUMENTS[0]:-all}"
LIMIT="${ARGUMENTS[1]:-5}"

# TODO: Implement main logic here
# Examples:
#   - Query data source (database, API, file)
#   - Apply filtering
#   - Sort results
#   - Format output
#   - Handle errors

echo "Executing {domain}:{action}"
echo "Filter: $FILTER"
echo "Limit: $LIMIT"
echo ""

# CUSTOMIZE: Replace with real implementation
echo "💡 Customize this command:"
echo "1. Connect to your data source"
echo "2. Implement filtering logic"
echo "3. Implement sorting/pagination"
echo "4. Format output for clarity"
echo "5. Add error handling"
echo ""
echo "See related commands:"
echo "  /{domain}:context - Get detailed information"
echo "  /{domain}:list    - See all items"
```

## Error Handling

Add error handling for:

```bash
# Check if filter is valid
if [ -z "$FILTER" ]; then
    echo "❌ Filter required"
    exit 1
fi

# Check if limit is numeric
if ! [[ "$LIMIT" =~ ^[0-9]+$ ]]; then
    echo "❌ Limit must be a number"
    exit 1
fi

# Validate against data source
if ! command_exists "get-{domain}-data"; then
    echo "❌ {domain} data source not configured"
    echo "Setup: export {DOMAIN}_API_KEY=..."
    exit 1
fi
```

## Integration

This command works with other {domain} commands:

```
Before running this:
  /{domain}:list                    # See all items first

After running this:
  /{domain}:context {item-id}       # Get details on selected item
  /{domain}:update {item-id} ...    # Make changes
```

## Testing

```bash
# Test with defaults
/{domain}:{action}

# Test with filter
/{domain}:{action} active

# Test with filter and limit
/{domain}:{action} active 10

# Test error cases
/{domain}:{action} invalid-filter
/{domain}:{action} abc  # non-numeric limit
```

## Related Skill Triggers

If you add this command to auto-discovery:

- "what should I work on"
- "show me {domain} items"
- "get next {domain}"
- "list {domain}"

See: `.claude/skills/{domain}-expert/SKILL.md`

## Next Steps

1. **Replace implementation stub**
   - Connect to actual data source
   - Implement filtering/sorting
   - Add status indicators

2. **Add to skill for auto-discovery**
   - Update trigger phrases
   - Run: `/registry:scan` to verify

3. **Test the command**
   - Test with sample data
   - Verify error handling
   - Check output format

4. **Link to other commands**
   - Update related commands
   - Ensure consistency
   - Document dependencies

## Customization Examples

### Example 1: Database Query

```bash
FILTER="${ARGUMENTS[0]:-all}"
LIMIT="${ARGUMENTS[1]:-5}"

# Query database
sqlite3 "$DATA_DB" \
  "SELECT * FROM {domain}_items WHERE status='$FILTER' LIMIT $LIMIT;"
```

### Example 2: REST API

```bash
FILTER="${ARGUMENTS[0]:-all}"
LIMIT="${ARGUMENTS[1]:-5}"

# Query REST API
curl -s \
  -H "Authorization: Bearer $API_KEY" \
  "https://api.example.com/{domain}?filter=$FILTER&limit=$LIMIT"
```

### Example 3: File-based Storage

```bash
FILTER="${ARGUMENTS[0]:-all}"
LIMIT="${ARGUMENTS[1]:-5}"

# Query from JSON file
cat "./{domain}-data.json" | \
  jq ".items[] | select(.status == \"$FILTER\") | .[0:$LIMIT]"
```

## Notes

- Keep commands focused on single operations
- Always validate inputs before processing
- Provide clear success/failure feedback
- Link related commands in output
- Document customization points clearly
- Test with edge cases (empty data, invalid input, etc.)
