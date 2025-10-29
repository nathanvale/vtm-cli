import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { ResearchCache } from '../lib/research-cache'

const execAsync = promisify(exec)

describe('vtm cache commands', () => {
  let testCacheDir: string
  let cache: ResearchCache

  beforeEach(async () => {
    testCacheDir = await fs.mkdtemp(path.join(os.tmpdir(), 'cli-cache-test-'))
    cache = new ResearchCache(testCacheDir, 30 * 24 * 60) // 30 days
  })

  afterEach(async () => {
    await fs.rm(testCacheDir, { recursive: true, force: true })
  })

  describe('vtm cache-stats', () => {
    it('shows cache statistics with empty cache', async () => {
      // RED: Write failing test
      const { stdout } = await execAsync(`CACHE_DIR=${testCacheDir} node dist/index.js cache-stats`)

      expect(stdout).toContain('📊 Research Cache Statistics')
      expect(stdout).toContain('Cache Location:')
      expect(stdout).toContain('TTL:')
      expect(stdout).toContain('Cache is empty')
    })

    it('shows performance metrics after hits and misses', async () => {
      // RED: Create cache entries and track hits/misses
      await cache.set('oauth2 alternatives', 'OAuth2 is recommended', ['oauth2', 'alternatives'])
      await cache.get('oauth2 alternatives') // hit
      await cache.get('nonexistent query') // miss

      const { stdout } = await execAsync(`CACHE_DIR=${testCacheDir} node dist/index.js cache-stats`)

      expect(stdout).toContain('Performance:')
      expect(stdout).toContain('Cache hits:')
      expect(stdout).toContain('Cache misses:')
      expect(stdout).toContain('Hit rate:')
    })

    it('shows storage information with entries', async () => {
      // RED: Create cache entries
      await cache.set('query1', 'result1', ['tag1'])
      await cache.set('query2', 'result2', ['tag2'])
      await cache.set('query3', 'result3', ['tag3'])

      const { stdout } = await execAsync(`CACHE_DIR=${testCacheDir} node dist/index.js cache-stats`)

      expect(stdout).toContain('Storage:')
      expect(stdout).toContain('Total entries:')
      expect(stdout).toContain('Total size:')
    })

    it('shows tip when cache has entries', async () => {
      // RED: Create cache entry
      await cache.set('query', 'result')

      const { stdout } = await execAsync(`CACHE_DIR=${testCacheDir} node dist/index.js cache-stats`)

      expect(stdout).toContain("💡 Tip: Use 'vtm cache clear' to remove old entries")
    })
  })

  describe('vtm cache-clear', () => {
    it('clears all entries with --force flag', async () => {
      // RED: Create cache entries and clear them
      await cache.set('query1', 'result1')
      await cache.set('query2', 'result2')

      const { stdout } = await execAsync(`CACHE_DIR=${testCacheDir} node dist/index.js cache-clear --force`)

      expect(stdout).toContain('Clearing All Cache')
      expect(stdout).toContain('✅ Cleared')
      expect(stdout).toContain('entries')

      // Verify cache is empty
      const stats = await cache.getStats()
      expect(stats.entriesCount).toBe(0)
    })

    it('clears only expired entries with --expired flag', async () => {
      // RED: Create expired and fresh entries
      const expiredCache = new ResearchCache(testCacheDir, 0) // 0 minutes TTL
      await expiredCache.set('expired-query', 'old result', ['old'])

      await new Promise((resolve) => setTimeout(resolve, 10))

      const freshCache = new ResearchCache(testCacheDir, 60 * 24 * 30) // 30 days
      await freshCache.set('fresh-query', 'new result', ['new'])

      const { stdout } = await execAsync(`CACHE_DIR=${testCacheDir} node dist/index.js cache-clear --expired`)

      expect(stdout).toContain('🧹 Clearing Expired Cache')
      expect(stdout).toContain('expired')
      expect(stdout).toContain('✅ Cleared')

      // Verify only fresh entry remains
      expect(await cache.has('fresh-query')).toBe(true)
      expect(await cache.has('expired-query')).toBe(false)
    })

    it('clears entries by tag with --tag flag', async () => {
      // RED: Create entries with different tags
      await cache.set('oauth2-query1', 'result1', ['oauth2', 'auth'])
      await cache.set('oauth2-query2', 'result2', ['oauth2', 'implementation'])
      await cache.set('jwt-query', 'result3', ['jwt', 'auth'])

      const { stdout } = await execAsync(
        `CACHE_DIR=${testCacheDir} node dist/index.js cache-clear --tag=oauth2 --force`,
      )

      expect(stdout).toContain('🏷️  Clearing Cache by Tag')
      expect(stdout).toContain('Tag: oauth2')
      expect(stdout).toContain('✅ Cleared')
      expect(stdout).toContain('entries')

      // Verify oauth2 entries removed, jwt entry remains
      const entries = await cache.search(['jwt'])
      expect(entries.length).toBe(1)
    })

    it('shows count of cleared entries', async () => {
      // RED: Clear and verify count is shown
      await cache.set('query1', 'result1')
      await cache.set('query2', 'result2')
      await cache.set('query3', 'result3')

      const { stdout } = await execAsync(`CACHE_DIR=${testCacheDir} node dist/index.js cache-clear --force`)

      expect(stdout).toMatch(/Cleared \d+ entries/)
    })

    it('handles empty cache gracefully', async () => {
      // RED: Clear empty cache
      const { stdout } = await execAsync(`CACHE_DIR=${testCacheDir} node dist/index.js cache-clear --force`)

      expect(stdout).toContain('Cache is empty')
    })
  })

  describe('vtm cache-info', () => {
    it('shows cache entry details', async () => {
      // RED: Create entry and show info
      await cache.set('oauth2 alternatives', 'OAuth2 is recommended because...', ['oauth2', 'alternatives'])

      const { stdout } = await execAsync(
        `CACHE_DIR=${testCacheDir} node dist/index.js cache-info "oauth2 alternatives"`,
      )

      expect(stdout).toContain('📄 Cache Entry Details')
      expect(stdout).toContain('Query: oauth2 alternatives')
      expect(stdout).toContain('Key:')
      expect(stdout).toContain('Created:')
      expect(stdout).toContain('Size:')
    })

    it('shows result preview', async () => {
      // RED: Show result preview
      const longResult = 'OAuth2 is recommended because...\n\n' + 'X'.repeat(500)
      await cache.set('oauth2 alternatives', longResult, ['oauth2'])

      const { stdout } = await execAsync(
        `CACHE_DIR=${testCacheDir} node dist/index.js cache-info "oauth2 alternatives"`,
      )

      expect(stdout).toContain('Result Preview:')
      expect(stdout).toContain('OAuth2 is recommended')
    })

    it('shows tags and metadata', async () => {
      // RED: Show tags
      await cache.set('oauth2 alternatives', 'result', ['oauth2', 'alternatives', 'comparison'])

      const { stdout } = await execAsync(
        `CACHE_DIR=${testCacheDir} node dist/index.js cache-info "oauth2 alternatives"`,
      )

      expect(stdout).toContain('Tags:')
      expect(stdout).toContain('oauth2')
      expect(stdout).toContain('alternatives')
      expect(stdout).toContain('comparison')
    })

    it('handles missing entry', async () => {
      // RED: Show error for missing entry
      try {
        await execAsync(`CACHE_DIR=${testCacheDir} node dist/index.js cache-info "nonexistent query"`)
      } catch (error: any) {
        expect(error.stderr || error.stdout).toContain('not found')
      }
    })
  })
})
