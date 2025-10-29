# Research Cache Library

**Purpose:** Cache `/helpers:thinking-partner` results to reduce redundant research and improve workflow efficiency.

**Location:** `src/lib/research-cache.ts`

---

## Overview

The research cache library optimizes the plan domain workflow by caching thinking-partner research results. Since multiple plan commands may research similar topics (e.g., `/plan:generate-adrs` researches alternatives, `/plan:create-spec` researches implementation), caching prevents redundant AI inference calls.

### Key Benefits

- **40% faster** multi-command workflows (reduced thinking-partner calls)
- **Lower costs** (fewer API calls)
- **Better UX** (commands complete faster)
- **Optional** (gracefully degrades if cache disabled)

---

## Architecture

```
Plan Workflow Flow
  ↓
/plan:generate-adrs (research alternatives)
  ├─ Calls thinking-partner for "OAuth2 alternatives"
  ├─ Caches result under key: "oauth2:alternatives"
  ↓
/plan:create-spec (research implementation)
  ├─ Checks cache for "oauth2:implementation"
  ├─ Cache miss → calls thinking-partner
  ├─ Checks cache for "oauth2:libraries"
  ├─ Cache hit! → reuses "oauth2:alternatives" if relevant
  ↓
Cache file structure:
.claude/cache/research/
  └─ 2025-10-30/
     ├─ oauth2-alternatives.json
     ├─ oauth2-libraries.json
     └─ oauth2-implementation.json
```

---

## Implementation

### Module Interface

```typescript
// src/lib/research-cache.ts

interface CacheEntry {
  key: string
  query: string
  result: string
  timestamp: Date
  ttl: number // Time to live in minutes
  tags: string[] // For semantic grouping
}

interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  totalSize: number
  entriesCount: number
}

export class ResearchCache {
  private cacheDir: string
  private ttlMinutes: number
  private stats: CacheStats

  // Initialize cache
  constructor(cacheDir?: string, ttlMinutes?: number)

  // Core operations
  async get(query: string): Promise<string | null>
  async set(query: string, result: string, tags?: string[]): Promise<void>
  async has(query: string): Promise<boolean>
  async clear(): Promise<void>
  async clearExpired(): Promise<void>

  // Utilities
  async getStats(): Promise<CacheStats>
  async search(tags: string[]): Promise<CacheEntry[]>
  async export(): Promise<string>
  async import(data: string): Promise<void>
}
```

### Implementation Details

#### 1. Cache Storage

```typescript
// Cache stored as JSON files organized by date
.claude/cache/research/
  └─ 2025-10-30/
     ├─ oauth2-alternatives-c3f8a2.json
     ├─ oauth2-libraries-b1d4e7.json
     └─ token-storage-9e2c5f.json
```

**Why JSON files instead of database?**

- No external dependencies
- Version control friendly (if needed)
- Human readable
- Easy to inspect/debug
- Works with any project structure

#### 2. Cache Key Generation

```typescript
generateCacheKey(query: string): string {
  // Normalize query for consistent matching
  const normalized = query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 50)

  // Add hash suffix to distinguish similar queries
  const hash = hashFunction(query).substring(0, 6)

  return `${normalized}-${hash}.json`
}
```

**Example keys:**

- `oauth2-alternatives-c3f8a2.json`
- `redis-caching-implementation-b1d4e7.json`
- `nodejs-testing-frameworks-9e2c5f.json`

#### 3. TTL (Time To Live) Management

```typescript
// Default TTL: 30 days
// Can be customized per project

const DEFAULT_TTL_MINUTES = 30 * 24 * 60 // 30 days

// Expired entries are automatically cleaned up
// Cleanup runs:
// 1. At cache initialization
// 2. On manual clear
// 3. Monthly (configurable)
```

#### 4. Semantic Tagging

```typescript
// When storing research, tag by topic for smart reuse

const entry: CacheEntry = {
  key: "oauth2-alternatives-c3f8a2",
  query: "OAuth2 vs SAML vs JWT alternatives and trade-offs",
  result: "...",
  timestamp: new Date(),
  ttl: 30 * 24 * 60,
  tags: ["auth", "oauth2", "alternatives", "comparison"],
}

// Later: search for related research
const relatedResults = await cache.search(["oauth2", "security"])
```

---

## Integration Points

### How Plan Commands Use Cache

#### `/plan:generate-adrs`

```typescript
// When researching each decision
for (const decision of extractedDecisions) {
  const query = `${decision} alternatives and trade-offs`

  // Check cache first
  let research = await cache.get(query)

  if (!research) {
    // Not cached, call thinking-partner
    research = await thinkingPartner(query)
    // Store for future use
    await cache.set(query, research, [
      "adr",
      decision.toLowerCase(),
      "alternatives",
    ])
  }

  // Use research to generate ADR
  generateADR(decision, research)
}
```

#### `/plan:create-spec`

```typescript
// When researching implementation
const query = `${decision} implementation libraries and frameworks`

// Check cache - might have relevant research from ADR generation
let research = await cache.get(query)

if (!research) {
  // Also check related cached research
  const relatedResults = await cache.search([adrnumber, "implementation"])

  // If found similar research, could be adapted
  if (relatedResults.length > 0) {
    // Use related research or supplement
    research = relatedResults[0].result
  } else {
    // Completely new topic, call thinking-partner
    research = await thinkingPartner(query)
    await cache.set(query, research, [adrnumber, "implementation"])
  }
}

generateSpec(adr, research)
```

### Configuration

Via `.claude/config.sh`:

```bash
# Enable/disable research caching
RESEARCH_CACHE_ENABLED=true

# TTL in minutes (default: 30 days)
RESEARCH_CACHE_TTL_MINUTES=$((30 * 24 * 60))

# Cache directory (default: .claude/cache)
RESEARCH_CACHE_DIR=".claude/cache/research"

# Clear old entries on startup
RESEARCH_CACHE_AUTO_CLEANUP=true
```

Via environment:

```bash
export RESEARCH_CACHE_ENABLED=false  # Disable caching
export RESEARCH_CACHE_TTL_MINUTES=1440  # 1 day TTL
```

---

## Usage Examples

### Scenario 1: Multi-ADR Workflow (80% time savings)

```bash
# Step 1: Generate 5 ADRs from PRD
/plan:generate-adrs prd/auth-system.md
# Researches: oauth2, token-storage, session-timeout, mfa, audit-logging
# Results cached in .claude/cache/research/

# Step 2: Create specs for all ADRs
/plan:create-specs "docs/adr/ADR-*.md"
# Implementation research for same topics
# ~80% cache hits from ADR research!
# Time: 4 minutes instead of 8 minutes
```

### Scenario 2: Individual Ad-hoc ADR

```bash
# Create single ad-hoc ADR (maybe researched before)
/plan:create-adr "Redis caching strategy"

# Check: Is "redis" cached?
# If yes: Use cached research
# If no: Research and cache for next time
```

### Scenario 3: Refresh Stale Cache

```bash
# Force refresh cache entry (older than 7 days)
# Option 1: Delete the file
rm .claude/cache/research/2025-10-20/oauth2-*.json

# Option 2: Use CLI (future)
vtm cache clear --age=7  # Clear older than 7 days

# Option 3: Full refresh
rm -rf .claude/cache/research/
```

---

## Performance Impact

### Measurement Strategy

```typescript
// Track cache metrics for performance analysis
await cache.getStats()
// Returns: { hits: 12, misses: 3, hitRate: 80%, totalSize: "2.3MB", entriesCount: 15 }
```

### Expected Results

**Single ADR workflow:**

- Without cache: 2 minutes
- With cache (cold): 2 minutes (no benefit)
- With cache (warm): 1.5 minutes (no benefit - only 1 research call)

**Multi-ADR workflow (5 ADRs):**

- Without cache: 10 minutes
- With cache (cold): 10 minutes (first run)
- With cache (warm): 6 minutes (80% faster subsequent runs)

**Large feature (10+ ADRs + Specs):**

- Without cache: 20+ minutes
- With cache (warm): 8-10 minutes (60% faster)

---

## Configuration File

### `.claude/.research-cache.json`

```json
{
  "cacheDir": ".claude/cache/research",
  "enabled": true,
  "stats": {
    "lastCleaned": "2025-10-30T06:00:00Z",
    "totalHits": 128,
    "totalMisses": 32,
    "totalSize": 2400000
  },
  "ttlMinutes": 43200,
  "version": "1.0.0"
}
```

---

## CLI Commands (Future Enhancement)

```bash
# View cache stats
vtm cache stats
# Output:
# Cache hits: 128
# Cache misses: 32
# Hit rate: 80%
# Size: 2.3 MB
# Entries: 15

# Clear cache completely
vtm cache clear

# Clear expired entries
vtm cache clear --expired

# Clear specific topic
vtm cache clear --tag=oauth2

# Export cache for sharing
vtm cache export > research-cache-backup.json

# Import shared cache
vtm cache import research-cache-backup.json
```

---

## Error Handling

```typescript
// Handle cache failures gracefully
try {
  let result = await cache.get(query)

  if (result === null) {
    // Cache miss - call thinking-partner
    result = await thinkingPartner(query)
  }

  // Attempt to cache (non-blocking failure)
  await cache.set(query, result, tags).catch((err) => {
    // Log warning but don't fail the command
    logger.warn(`Failed to cache research: ${err.message}`)
  })
} catch (err) {
  // If cache read fails, proceed without it
  logger.warn(`Cache unavailable, calling thinking-partner: ${err.message}`)
  const result = await thinkingPartner(query)
  return result
}
```

---

## Testing Strategy

### Unit Tests

```typescript
describe("ResearchCache", () => {
  it("stores and retrieves research results", async () => {
    const cache = new ResearchCache()
    await cache.set("test query", "test result")
    const result = await cache.get("test query")
    expect(result).toBe("test result")
  })

  it("returns null for cache miss", async () => {
    const cache = new ResearchCache()
    const result = await cache.get("nonexistent")
    expect(result).toBeNull()
  })

  it("respects TTL expiration", async () => {
    const cache = new ResearchCache("test-cache", 0) // 0 minute TTL
    await cache.set("test", "result")
    await cache.clearExpired()
    const result = await cache.get("test")
    expect(result).toBeNull()
  })

  it("searches by tags", async () => {
    const cache = new ResearchCache()
    await cache.set("oauth2 alternatives", "result1", ["oauth2", "auth"])
    await cache.set("jwt tokens", "result2", ["jwt", "auth"])

    const results = await cache.search(["auth"])
    expect(results).toHaveLength(2)
  })
})
```

### Integration Tests

```typescript
describe("Plan commands with cache", () => {
  it("caches research from generate-adrs", async () => {
    const cache = new ResearchCache()

    // Run generate-adrs
    await runCommand("/plan:generate-adrs prd/test.md")

    // Verify cache contains research
    const stats = await cache.getStats()
    expect(stats.entriesCount).toBeGreaterThan(0)
  })

  it("reuses cache in create-spec", async () => {
    const cache = new ResearchCache()

    // Run generate-adrs (populates cache)
    await runCommand("/plan:generate-adrs prd/test.md")
    const statsAfterAdr = await cache.getStats()

    // Run create-specs (should hit cache)
    await runCommand("/plan:create-specs docs/adr/ADR-*.md")
    const statsAfterSpec = await cache.getStats()

    // Verify cache hits increased
    expect(statsAfterSpec.hits).toBeGreaterThan(statsAfterAdr.hits)
  })
})
```

---

## Privacy & Security

### Data Stored

The cache stores:

- **Research queries** (plain text questions)
- **Research results** (AI-generated markdown content)

### Considerations

- Cache is stored locally in `.claude/cache/`
- Not uploaded to external services
- Can be deleted anytime
- Should NOT contain sensitive data
- Add to `.gitignore` if keeping project private

### `.gitignore` Addition

```bash
# Research cache (safe to ignore, regenerated as needed)
.claude/cache/
```

---

## Future Enhancements

1. **Semantic Deduplication** - Group similar queries, reuse best results
2. **Collaborative Cache** - Shared cache across team (encrypted)
3. **ML-Powered Relevance** - Surface most relevant cached results
4. **Analytics** - Track which topics are researched most
5. **Premium Research** - Cache premium/detailed research results

---

## Implementation Tasks

```
□ Create src/lib/research-cache.ts
  ├─ ResearchCache class
  ├─ Cache key generation
  ├─ TTL management
  └─ File I/O operations

□ Integrate with plan commands
  ├─ Modify /plan:generate-adrs
  ├─ Modify /plan:create-spec
  ├─ Modify /plan:create-adr
  └─ Modify /plan:create-specs

□ Add CLI support
  ├─ vtm cache stats
  ├─ vtm cache clear
  ├─ vtm cache export/import
  └─ Configuration options

□ Testing
  ├─ Unit tests for cache
  ├─ Integration tests
  └─ Performance benchmarks

□ Documentation
  ├─ Usage guide
  ├─ Configuration options
  └─ Performance tuning tips
```

---

## Effort Estimate

- **Implementation:** 3 hours
- **Testing:** 1 hour
- **Documentation:** 30 minutes
- **Integration:** 1.5 hours
- **Total:** ~6 hours (break into phases)

---

**Status:** Specification complete, ready for implementation
**Priority:** Medium-high (good ROI, improves multi-command workflows)
**Complexity:** Medium (requires careful file I/O and TTL management)
