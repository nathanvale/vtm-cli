import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { ResearchCache } from '../research-cache'

describe('ResearchCache - Cache Key Generation', () => {
  it('generates consistent keys for same query', () => {
    const cache = new ResearchCache()
    const key1 = cache['generateCacheKey']('OAuth2 alternatives')
    const key2 = cache['generateCacheKey']('OAuth2 alternatives')
    expect(key1).toBe(key2)
  })

  it('generates different keys for different queries', () => {
    const cache = new ResearchCache()
    const key1 = cache['generateCacheKey']('OAuth2 alternatives')
    const key2 = cache['generateCacheKey']('JWT alternatives')
    expect(key1).not.toBe(key2)
  })

  it('normalizes query (lowercase, no extra spaces)', () => {
    const cache = new ResearchCache()
    const key1 = cache['generateCacheKey']('OAuth2  Alternatives')
    const key2 = cache['generateCacheKey']('oauth2 alternatives')
    expect(key1).toBe(key2)
  })

  it('includes hash in key', () => {
    const cache = new ResearchCache()
    const key = cache['generateCacheKey']('test query')
    expect(key).toMatch(/^[a-z0-9-]+-[a-f0-9]{6}\.json$/)
  })

  it('truncates long queries', () => {
    const cache = new ResearchCache()
    const longQuery = 'a'.repeat(100)
    const key = cache['generateCacheKey'](longQuery)
    expect(key.length).toBeLessThan(70)
  })
})

describe('ResearchCache - Basic Operations', () => {
  let cache: ResearchCache
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'research-cache-test-'))
    cache = new ResearchCache(tempDir, 30)
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it('stores and retrieves cache entries', async () => {
    await cache.set('test query', 'test result')
    const result = await cache.get('test query')
    expect(result).toBe('test result')
  })

  it('returns null for cache miss', async () => {
    const result = await cache.get('nonexistent query')
    expect(result).toBeNull()
  })

  it('checks if entry exists', async () => {
    await cache.set('test query', 'result')
    expect(await cache.has('test query')).toBe(true)
    expect(await cache.has('other query')).toBe(false)
  })

  it('overwrites existing cache entry', async () => {
    await cache.set('query', 'result1')
    await cache.set('query', 'result2')
    const result = await cache.get('query')
    expect(result).toBe('result2')
  })

  it('clears all cache entries', async () => {
    await cache.set('query1', 'result1')
    await cache.set('query2', 'result2')
    await cache.clear()
    expect(await cache.has('query1')).toBe(false)
    expect(await cache.has('query2')).toBe(false)
  })
})

describe('ResearchCache - TTL and Expiration', () => {
  let cache: ResearchCache
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'research-cache-test-'))
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it('respects TTL when checking expiration', async () => {
    cache = new ResearchCache(tempDir, 0)
    await cache.set('query', 'result')

    await new Promise((resolve) => setTimeout(resolve, 10))

    const entry = await cache['readEntry'](cache['generateCacheKey']('query'))
    expect(cache['isExpired'](entry)).toBe(true)
  })

  it('does not expire entries within TTL', async () => {
    cache = new ResearchCache(tempDir, 60)
    await cache.set('query', 'result')

    const entry = await cache['readEntry'](cache['generateCacheKey']('query'))
    expect(cache['isExpired'](entry)).toBe(false)
  })

  it('clearExpired removes only expired entries', async () => {
    cache = new ResearchCache(tempDir, 0)
    await cache.set('expired', 'old result')

    cache = new ResearchCache(tempDir, 60)
    await cache.set('fresh', 'new result')

    await cache.clearExpired()

    expect(await cache.has('fresh')).toBe(true)
    expect(await cache.has('expired')).toBe(false)
  })

  it('get returns null for expired entries', async () => {
    cache = new ResearchCache(tempDir, 0)
    await cache.set('query', 'result')

    await new Promise((resolve) => setTimeout(resolve, 10))

    const result = await cache.get('query')
    expect(result).toBeNull()
  })
})

describe('ResearchCache - Tagging and Search', () => {
  let cache: ResearchCache
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'research-cache-test-'))
    cache = new ResearchCache(tempDir, 30)
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it('stores tags with cache entry', async () => {
    await cache.set('oauth2 query', 'result', ['oauth2', 'auth'])
    const results = await cache.search(['oauth2'])
    expect(results).toHaveLength(1)
    expect(results[0].tags).toContain('oauth2')
    expect(results[0].tags).toContain('auth')
  })

  it('searches by single tag', async () => {
    await cache.set('query1', 'result1', ['tag1', 'tag2'])
    await cache.set('query2', 'result2', ['tag2', 'tag3'])
    await cache.set('query3', 'result3', ['tag3'])

    const results = await cache.search(['tag2'])
    expect(results).toHaveLength(2)
  })

  it('searches by multiple tags (AND logic)', async () => {
    await cache.set('query1', 'result1', ['oauth2', 'auth', 'alternatives'])
    await cache.set('query2', 'result2', ['oauth2', 'implementation'])
    await cache.set('query3', 'result3', ['jwt', 'auth'])

    const results = await cache.search(['oauth2', 'auth'])
    expect(results).toHaveLength(1)
    expect(results[0].query).toBe('query1')
  })

  it('returns empty array when no tags match', async () => {
    await cache.set('query', 'result', ['tag1'])
    const results = await cache.search(['nonexistent'])
    expect(results).toHaveLength(0)
  })

  it('allows entries without tags', async () => {
    await cache.set('query', 'result')
    const result = await cache.get('query')
    expect(result).toBe('result')
  })
})

describe('ResearchCache - Statistics', () => {
  let cache: ResearchCache
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'research-cache-test-'))
    cache = new ResearchCache(tempDir, 30)
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it('tracks cache hits', async () => {
    await cache.set('query', 'result')
    await cache.get('query')

    const stats = await cache.getStats()
    expect(stats.hits).toBe(1)
    expect(stats.misses).toBe(0)
  })

  it('tracks cache misses', async () => {
    await cache.get('nonexistent')

    const stats = await cache.getStats()
    expect(stats.hits).toBe(0)
    expect(stats.misses).toBe(1)
  })

  it('calculates hit rate', async () => {
    await cache.set('query', 'result')
    await cache.get('query')
    await cache.get('nonexistent')
    await cache.get('query')

    const stats = await cache.getStats()
    expect(stats.hits).toBe(2)
    expect(stats.misses).toBe(1)
    expect(stats.hitRate).toBeCloseTo(66.67, 1)
  })

  it('counts total entries', async () => {
    await cache.set('query1', 'result1')
    await cache.set('query2', 'result2')
    await cache.set('query3', 'result3')

    const stats = await cache.getStats()
    expect(stats.entriesCount).toBe(3)
  })

  it('calculates total size', async () => {
    await cache.set('query', 'result')

    const stats = await cache.getStats()
    expect(stats.totalSize).toBeGreaterThan(0)
  })
})

describe('ResearchCache - File System', () => {
  let cache: ResearchCache
  let tempDir: string

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'research-cache-test-'))
    cache = new ResearchCache(tempDir, 30)
  })

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true })
  })

  it('creates cache directory if not exists', async () => {
    const newDir = path.join(tempDir, 'new-cache')
    const newCache = new ResearchCache(newDir, 30)
    await newCache.set('query', 'result')

    const exists = await fs
      .access(newDir)
      .then(() => true)
      .catch(() => false)
    expect(exists).toBe(true)
  })

  it('stores entries as JSON files', async () => {
    await cache.set('query', 'result')
    const key = cache['generateCacheKey']('query')
    const filePath = cache['getCachePath'](key)

    const exists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false)
    expect(exists).toBe(true)

    const content = await fs.readFile(filePath, 'utf-8')
    const parsed = JSON.parse(content)
    expect(parsed.result).toBe('result')
  })

  it('handles corrupted cache files gracefully', async () => {
    const key = cache['generateCacheKey']('query')
    const filePath = cache['getCachePath'](key)

    await fs.mkdir(path.dirname(filePath), { recursive: true })
    await fs.writeFile(filePath, 'invalid json{')

    const result = await cache.get('query')
    expect(result).toBeNull()
  })
})
