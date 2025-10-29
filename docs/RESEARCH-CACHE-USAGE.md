# Research Cache - Usage Guide

## Overview

The `ResearchCache` class provides a file-based caching system for AI research results from the `/helpers:thinking-partner` command. It's designed to reduce redundant API calls and improve workflow efficiency in the plan domain.

## Installation

The ResearchCache is part of the VTM CLI library:

```typescript
import { ResearchCache } from "vtm-cli/lib"
```

## Basic Usage

### 1. Initialize Cache

```typescript
import { ResearchCache } from "vtm-cli/lib"

// Use default settings (.claude/cache/research, 30-day TTL)
const cache = new ResearchCache()

// Custom cache directory and TTL
const cache = new ResearchCache(".cache/research", 7 * 24 * 60) // 7 days
```

### 2. Store and Retrieve

```typescript
// Store research result
await cache.set(
  "OAuth2 alternatives and trade-offs",
  "OAuth2 is the industry standard for authorization...",
  ["oauth2", "auth", "alternatives"],
)

// Retrieve cached result
const result = await cache.get("OAuth2 alternatives and trade-offs")
if (result) {
  console.log("Cache hit!", result)
} else {
  console.log("Cache miss - need to research")
}

// Check if entry exists
const exists = await cache.has("OAuth2 alternatives")
console.log("Cached:", exists)
```

### 3. Search by Tags

```typescript
// Store multiple related entries
await cache.set("OAuth2 vs JWT", "...", ["oauth2", "jwt", "auth"])
await cache.set("OAuth2 libraries", "...", ["oauth2", "implementation"])
await cache.set("SAML alternatives", "...", ["saml", "auth"])

// Search for all auth-related research
const authResults = await cache.search(["auth"])
console.log(`Found ${authResults.length} auth-related entries`)

// Search with multiple tags (AND logic)
const oauth2ImplResults = await cache.search(["oauth2", "implementation"])
console.log(`Found ${oauth2ImplResults.length} OAuth2 implementation entries`)
```

### 4. Cache Statistics

```typescript
// Get cache statistics
const stats = await cache.getStats()
console.log(`
  Hits: ${stats.hits}
  Misses: ${stats.misses}
  Hit Rate: ${stats.hitRate}%
  Total Size: ${stats.totalSize} bytes
  Entries: ${stats.entriesCount}
`)
```

### 5. Cleanup

```typescript
// Clear all entries
await cache.clear()

// Clear only expired entries
await cache.clearExpired()
```

## Integration with Plan Commands

### Example: `/plan:generate-adrs` Integration

```typescript
import { ResearchCache } from "vtm-cli/lib"

async function generateADR(decision: string) {
  const cache = new ResearchCache()
  const query = `${decision} alternatives and trade-offs`

  // Check cache first
  let research = await cache.get(query)

  if (!research) {
    // Cache miss - call thinking-partner
    console.log("Researching alternatives...")
    research = await callThinkingPartner(query)

    // Store for future use
    await cache.set(query, research, [
      "adr",
      decision.toLowerCase(),
      "alternatives",
    ])
  } else {
    console.log("Using cached research")
  }

  // Generate ADR using research
  return generateADRDocument(decision, research)
}
```

### Example: `/plan:create-spec` Integration

```typescript
async function createSpec(adrFile: string) {
  const cache = new ResearchCache()
  const adr = await readADR(adrFile)
  const query = `${adr.decision} implementation libraries and best practices`

  // Check cache
  let research = await cache.get(query)

  if (!research) {
    // Also check for related cached research
    const relatedResults = await cache.search([adr.number, "implementation"])

    if (relatedResults.length > 0) {
      // Found related research, use it
      research = relatedResults[0].result
      console.log("Using related cached research")
    } else {
      // No related cache, research now
      console.log("Researching implementation...")
      research = await callThinkingPartner(query)
      await cache.set(query, research, [adr.number, "implementation"])
    }
  } else {
    console.log("Using cached research")
  }

  return generateSpecDocument(adr, research)
}
```

## Advanced Usage

### Graceful Degradation

Handle cache failures gracefully:

```typescript
async function researchWithCache(query: string, tags: string[]) {
  const cache = new ResearchCache()

  try {
    // Try to get from cache
    let result = await cache.get(query)

    if (!result) {
      // Cache miss - call thinking-partner
      result = await callThinkingPartner(query)

      // Try to cache (don't fail if caching fails)
      try {
        await cache.set(query, result, tags)
      } catch (err) {
        console.warn(`Failed to cache result: ${err.message}`)
      }
    }

    return result
  } catch (err) {
    // Cache completely unavailable, proceed without it
    console.warn(`Cache unavailable: ${err.message}`)
    return await callThinkingPartner(query)
  }
}
```

### Custom TTL per Entry

You can create different cache instances for different TTL requirements:

```typescript
// Short-lived cache for volatile data (1 day)
const shortCache = new ResearchCache(".cache/short", 24 * 60)

// Long-lived cache for stable data (90 days)
const longCache = new ResearchCache(".cache/long", 90 * 24 * 60)

// Store API documentation (changes frequently)
await shortCache.set("Express API docs", "...", ["express", "docs"])

// Store architectural patterns (rarely change)
await longCache.set("Microservices patterns", "...", [
  "architecture",
  "patterns",
])
```

## Cache Key Normalization

The cache automatically normalizes queries for consistent matching:

```typescript
// All these queries map to the same cache entry
await cache.set("OAuth2 alternatives", "result", ["oauth2"])
await cache.get("OAuth2  Alternatives") // Extra spaces
await cache.get("oauth2 alternatives") // Different case
await cache.get("OAUTH2 ALTERNATIVES") // All caps

// All return the same cached result
```

## Performance Tips

1. **Use Tags Strategically**: Tag entries by topic for efficient searching
2. **Set Appropriate TTL**: Balance freshness vs. cache hit rate
3. **Periodic Cleanup**: Call `clearExpired()` regularly to free space
4. **Monitor Stats**: Use `getStats()` to track performance

## File Structure

Cache entries are stored as JSON files:

```
.claude/cache/research/
├── oauth2-alternatives-a88cb2.json
├── redis-caching-implementation-b1d4e7.json
└── nodejs-testing-frameworks-9e2c5f.json
```

Each file contains:

```json
{
  "key": "oauth2-alternatives-a88cb2.json",
  "query": "oauth2 alternatives",
  "result": "OAuth2 is the industry standard...",
  "tags": ["oauth2", "auth", "alternatives"],
  "timestamp": "2025-10-30T09:15:00.000Z",
  "ttl": 43200
}
```

## API Reference

### Constructor

```typescript
constructor(cacheDir?: string, ttlMinutes?: number)
```

- `cacheDir`: Cache directory path (default: `.claude/cache/research`)
- `ttlMinutes`: Time to live in minutes (default: 43200 = 30 days)

### Methods

#### `get(query: string): Promise<string | null>`

Retrieve cached result for a query. Returns `null` if not found or expired.

#### `set(query: string, result: string, tags?: string[]): Promise<void>`

Store a research result with optional tags.

#### `has(query: string): Promise<boolean>`

Check if a non-expired entry exists for the query.

#### `clear(): Promise<void>`

Clear all cache entries.

#### `clearExpired(): Promise<void>`

Remove only expired entries.

#### `getStats(): Promise<CacheStats>`

Get cache statistics (hits, misses, hit rate, size, count).

#### `search(tags: string[]): Promise<CacheEntry[]>`

Search for entries matching ALL provided tags (AND logic).

## Testing

The ResearchCache includes comprehensive tests:

```bash
# Run all cache tests
pnpm test -- src/lib/__tests__/research-cache.test.ts

# Check coverage
pnpm test -- --coverage src/lib/research-cache.ts
```

**Current Coverage:** 98.68% (exceeds 90% target)

## See Also

- [Research Cache Specification](.claude/lib/research-cache.md)
- [Plan Domain Commands](.claude/commands/plan/)
- [Thinking Partner Helper](.claude/helpers/thinking-partner.md)
