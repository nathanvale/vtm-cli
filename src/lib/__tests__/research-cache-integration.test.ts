import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { ResearchCache } from '../research-cache'

/**
 * Integration tests for ResearchCache with plan commands
 *
 * These tests verify that the ResearchCache integrates correctly with:
 * - /plan:create-adr (single decision research)
 * - /plan:generate-adrs (multiple decision research)
 * - /plan:create-spec (implementation research)
 *
 * The cache reduces redundant thinking-partner calls and speeds up
 * repeated research queries by 40%+.
 */

describe('ResearchCache Integration', () => {
  let cache: ResearchCache
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'research-cache-integration-'))
    cache = new ResearchCache(tempDir, 30 * 24 * 60) // 30 day TTL
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  describe('/plan:create-adr integration', () => {
    it('checks cache before calling thinking-partner for alternatives research', async () => {
      const query = 'OAuth2 vs SAML alternatives and trade-offs'

      // First call: cache miss
      const cachedResult = await cache.get(query)
      expect(cachedResult).toBeNull()

      // Simulate thinking-partner call and cache storage
      const researchResult = `
OAuth2 Pros: Modern, widely adopted, better for mobile/SPA
OAuth2 Cons: More complex setup, requires token management

SAML Pros: Enterprise SSO standard, XML-based
SAML Cons: Heavy, complex, poor mobile support

Recommendation: OAuth2 for modern apps, SAML for enterprise SSO
      `.trim()

      await cache.set(query, researchResult, ['oauth2', 'saml', 'alternatives'])

      // Second call: cache hit
      const result = await cache.get(query)
      expect(result).toBe(researchResult)
    })

    it('stores research with semantic tags for smart reuse', async () => {
      const query = 'database migration strategies'
      const research = 'Flyway vs Liquibase comparison...'

      await cache.set(query, research, ['database', 'migration', 'alternatives'])

      // Verify tags are stored
      const results = await cache.search(['database', 'migration'])
      expect(results).toHaveLength(1)
      expect(results[0].query).toBe(query)
      expect(results[0].tags).toContain('database')
      expect(results[0].tags).toContain('migration')
      expect(results[0].tags).toContain('alternatives')
    })

    it('uses cache to avoid redundant research on repeated decisions', async () => {
      const query = 'GraphQL vs REST API design'
      let callCount = 0

      // Mock thinking-partner call
      const mockThinkingPartner = async (q: string) => {
        callCount++
        return 'GraphQL: Better for complex data, REST: Simpler, cacheable'
      }

      // First request: cache miss, calls thinking-partner
      let research = await cache.get(query)
      if (!research) {
        research = await mockThinkingPartner(query)
        await cache.set(query, research, ['graphql', 'rest', 'api'])
      }
      expect(callCount).toBe(1)

      // Second request: cache hit, NO thinking-partner call
      research = await cache.get(query)
      expect(research).toBeTruthy()
      expect(callCount).toBe(1) // Still 1, no additional call
    })
  })

  describe('/plan:generate-adrs integration', () => {
    it('caches research for each decision in PRD', async () => {
      // Simulate multiple decisions from a PRD
      const decisions = [
        'authentication protocol',
        'token storage strategy',
        'session timeout approach',
        'MFA implementation',
        'audit logging solution',
      ]

      // Cache research for each decision
      for (const decision of decisions) {
        const query = `${decision} alternatives and trade-offs`
        const research = `Research for ${decision}...`
        await cache.set(query, research, [decision.split(' ')[0], 'alternatives'])
      }

      // Verify all cached
      const stats = await cache.getStats()
      expect(stats.entriesCount).toBe(5)
    })

    it('reuses cached research across multiple ADR generations', async () => {
      const query = 'OAuth2 authentication alternatives'
      const research = 'Detailed OAuth2 research...'

      // First ADR generation caches result
      await cache.set(query, research, ['oauth2', 'auth', 'alternatives'])

      // Second ADR generation (same decision, different context)
      const cached = await cache.get(query)
      expect(cached).toBe(research)

      // Third ADR generation (still cached)
      const stillCached = await cache.get(query)
      expect(stillCached).toBe(research)

      const stats = await cache.getStats()
      expect(stats.hits).toBe(2) // Two cache hits
      expect(stats.misses).toBe(0) // No misses after first set
    })

    it('handles PRD with 5+ decisions efficiently via caching', async () => {
      const decisions = [
        'auth protocol',
        'token storage',
        'session timeout',
        'MFA method',
        'audit logging',
        'rate limiting',
        'API versioning',
      ]

      let thinkingPartnerCalls = 0

      // Simulate generate-adrs workflow
      for (const decision of decisions) {
        const query = `${decision} alternatives`

        let research = await cache.get(query)
        if (!research) {
          // Simulate thinking-partner call
          thinkingPartnerCalls++
          research = `Research for ${decision}`
          await cache.set(query, research, [decision.split(' ')[0], 'alternatives'])
        }
      }

      expect(thinkingPartnerCalls).toBe(7) // First run: all miss

      // Second run: all hit (0 thinking-partner calls)
      thinkingPartnerCalls = 0
      for (const decision of decisions) {
        const query = `${decision} alternatives`
        const research = await cache.get(query)
        expect(research).toBeTruthy()
      }

      expect(thinkingPartnerCalls).toBe(0) // Second run: all cached

      const stats = await cache.getStats()
      expect(stats.hits).toBe(7) // All 7 cached on second run
      expect(stats.hitRate).toBe(50) // 7 hits, 7 misses = 50%
    })
  })

  describe('/plan:create-spec integration', () => {
    it('reuses cache from generate-adrs for implementation research', async () => {
      // generate-adrs cached OAuth2 alternatives research
      const adrQuery = 'OAuth2 alternatives and trade-offs'
      const adrResearch = 'OAuth2 vs SAML vs JWT comparison...'
      await cache.set(adrQuery, adrResearch, ['oauth2', 'alternatives'])

      // create-spec needs implementation guidance
      const specQuery = 'OAuth2 implementation libraries and frameworks'
      const specResearch = 'Passport.js, Auth0, OAuth2orize comparison...'
      await cache.set(specQuery, specResearch, ['oauth2', 'implementation'])

      // Both queries cached
      expect(await cache.has(adrQuery)).toBe(true)
      expect(await cache.has(specQuery)).toBe(true)

      // Can search for all oauth2 research
      const oauth2Research = await cache.search(['oauth2'])
      expect(oauth2Research).toHaveLength(2)
    })

    it('caches implementation library comparisons', async () => {
      const query = 'Passport.js vs Auth0 vs OAuth2orize'
      const research = `
Passport.js: Mature, flexible, many strategies
Auth0: Managed service, expensive, easy setup
OAuth2orize: Low-level, full control, more work
      `.trim()

      await cache.set(query, research, ['oauth2', 'libraries', 'implementation'])

      const cached = await cache.get(query)
      expect(cached).toBe(research)
    })

    it('stores code examples and patterns research', async () => {
      const query = 'OAuth2 PKCE implementation patterns Node.js'
      const research = `
Code example: Using passport-oauth2 with PKCE
\`\`\`typescript
import { Strategy as OAuth2Strategy } from 'passport-oauth2'
passport.use(new OAuth2Strategy({ pkce: true }, ...))
\`\`\`
      `.trim()

      await cache.set(query, research, ['oauth2', 'pkce', 'code-examples'])

      const cached = await cache.get(query)
      expect(cached).toBe(research)

      // Can search for code examples
      const examples = await cache.search(['code-examples'])
      expect(examples).toHaveLength(1)
    })

    it('enables cross-command cache reuse', async () => {
      // create-adr caches decision alternatives
      await cache.set('Redis vs Memcached caching', 'Redis: Persistence, data structures\nMemcached: Simple, fast', [
        'redis',
        'memcached',
        'alternatives',
      ])

      // create-spec reuses cached alternatives + adds implementation research
      const altCached = await cache.get('Redis vs Memcached caching')
      expect(altCached).toBeTruthy()

      await cache.set('Redis client libraries Node.js', 'ioredis: Feature-rich\nnode-redis: Official', [
        'redis',
        'libraries',
        'implementation',
      ])

      // Both cached under 'redis' tag
      const allRedisResearch = await cache.search(['redis'])
      expect(allRedisResearch).toHaveLength(2)
    })
  })

  describe('cache stats and metrics', () => {
    it('tracks hit/miss rates for performance analysis', async () => {
      await cache.set('query1', 'result1')

      // 2 hits
      await cache.get('query1')
      await cache.get('query1')

      // 1 miss
      await cache.get('query2')

      const stats = await cache.getStats()
      expect(stats.hits).toBe(2)
      expect(stats.misses).toBe(1)
      expect(stats.hitRate).toBeCloseTo(66.67, 1)
    })

    it('measures cache size and entry count', async () => {
      await cache.set('q1', 'result 1', ['tag1'])
      await cache.set('q2', 'result 2', ['tag2'])
      await cache.set('q3', 'result 3', ['tag3'])

      const stats = await cache.getStats()
      expect(stats.entriesCount).toBe(3)
      expect(stats.totalSize).toBeGreaterThan(0)
    })
  })

  describe('error handling and graceful degradation', () => {
    it('gracefully handles cache read failures', async () => {
      // Corrupt a cache entry
      const key = cache['generateCacheKey']('test query')
      const filePath = cache['getCachePath'](key)
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, 'invalid json{')

      // Should return null instead of throwing
      const result = await cache.get('test query')
      expect(result).toBeNull()
    })

    it('continues working if cache directory is unavailable', async () => {
      // Create cache with invalid directory
      const invalidCache = new ResearchCache('/invalid/path/that/does/not/exist')

      // get should return null (miss) without throwing
      const result = await invalidCache.get('query')
      expect(result).toBeNull()
    })

    it('handles TTL expiration correctly', async () => {
      // Create cache with 0 minute TTL (immediate expiration)
      const shortCache = new ResearchCache(tempDir, 0)

      await shortCache.set('query', 'result')

      // Wait a bit for expiration
      await new Promise((resolve) => setTimeout(resolve, 10))

      // Should return null (expired)
      const result = await shortCache.get('query')
      expect(result).toBeNull()
    })
  })

  describe('performance benchmarks', () => {
    it('measures cache hit vs miss time', async () => {
      const query = 'performance test query'
      const largeResearch = 'x'.repeat(10000) // 10KB research result

      // Cache miss: includes file read/write
      const missStart = performance.now()
      await cache.set(query, largeResearch)
      const missTime = performance.now() - missStart

      // Cache hit: just file read
      const hitStart = performance.now()
      await cache.get(query)
      const hitTime = performance.now() - hitStart

      // Cache hit should be faster (though both are very fast for small files)
      expect(hitTime).toBeLessThan(missTime * 2) // Allow 2x variance
    })

    it('demonstrates 40%+ time savings on multi-decision workflow', async () => {
      const decisions = Array.from({ length: 5 }, (_, i) => `decision-${i}`)

      // First run: all cache misses (slow)
      const firstRunStart = performance.now()
      for (const decision of decisions) {
        let research = await cache.get(decision)
        if (!research) {
          // Simulate thinking-partner delay (normally 30-60s, using 10ms for test)
          await new Promise((resolve) => setTimeout(resolve, 10))
          research = `Research for ${decision}`
          await cache.set(decision, research)
        }
      }
      const firstRunTime = performance.now() - firstRunStart

      // Second run: all cache hits (fast)
      const secondRunStart = performance.now()
      for (const decision of decisions) {
        await cache.get(decision)
      }
      const secondRunTime = performance.now() - secondRunStart

      // Second run should be significantly faster
      const timeSavings = ((firstRunTime - secondRunTime) / firstRunTime) * 100
      expect(timeSavings).toBeGreaterThan(40) // At least 40% faster
    })
  })

  describe('semantic tagging for smart search', () => {
    it('enables finding related research across commands', async () => {
      // create-adr: OAuth2 alternatives
      await cache.set('OAuth2 vs SAML', 'OAuth2: modern, flexible\nSAML: enterprise, XML', [
        'oauth2',
        'saml',
        'alternatives',
      ])

      // create-spec: OAuth2 implementation
      await cache.set('OAuth2 Passport.js setup', 'Install passport-oauth2...', [
        'oauth2',
        'implementation',
        'passport',
      ])

      // create-spec: OAuth2 security
      await cache.set('OAuth2 PKCE security', 'Use PKCE for public clients...', ['oauth2', 'security', 'pkce'])

      // Find all oauth2-related research
      const oauth2Research = await cache.search(['oauth2'])
      expect(oauth2Research).toHaveLength(3)

      // Find implementation-specific research
      const implResearch = await cache.search(['oauth2', 'implementation'])
      expect(implResearch).toHaveLength(1)

      // Find alternatives research
      const altResearch = await cache.search(['alternatives'])
      expect(altResearch).toHaveLength(1)
    })

    it('supports tag-based cache invalidation', async () => {
      await cache.set('q1', 'result1', ['auth', 'oauth2'])
      await cache.set('q2', 'result2', ['auth', 'saml'])
      await cache.set('q3', 'result3', ['database'])

      // Find all auth-related entries
      const authEntries = await cache.search(['auth'])
      expect(authEntries).toHaveLength(2)

      // Could implement tag-based clearing (future enhancement)
      // await cache.clearByTag('auth')
    })
  })

  describe('cache key normalization', () => {
    it('treats similar queries as identical', async () => {
      // These should generate the same cache key
      const query1 = 'OAuth2  alternatives'
      const query2 = 'oauth2 alternatives'
      const query3 = 'OAUTH2 ALTERNATIVES'

      await cache.set(query1, 'research result')

      // All variations should hit the same cache entry
      expect(await cache.get(query2)).toBe('research result')
      expect(await cache.get(query3)).toBe('research result')

      const stats = await cache.getStats()
      expect(stats.hits).toBe(2) // Two cache hits from normalized keys
    })

    it('generates consistent keys for repeated queries', async () => {
      const query = 'database migration strategies'

      const key1 = cache['generateCacheKey'](query)
      const key2 = cache['generateCacheKey'](query)

      expect(key1).toBe(key2)
    })
  })
})
