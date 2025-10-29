import { createHash } from 'crypto'
import * as fs from 'fs/promises'
import * as path from 'path'

export type CacheEntry = {
  key: string
  query: string
  result: string
  timestamp: Date
  ttl: number
  tags: string[]
}

export type CacheStats = {
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

  constructor(cacheDir?: string, ttlMinutes?: number) {
    this.cacheDir = cacheDir || '.claude/cache/research'
    this.ttlMinutes = ttlMinutes ?? 30 * 24 * 60 // 30 days default
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalSize: 0,
      entriesCount: 0,
    }
  }

  async get(query: string): Promise<string | null> {
    const key = this.generateCacheKey(query)

    try {
      const entry = await this.readEntry(key)

      // Check if expired
      if (this.isExpired(entry)) {
        this.stats.misses++
        return null
      }

      this.stats.hits++
      return entry.result
    } catch {
      this.stats.misses++
      return null
    }
  }

  async set(query: string, result: string, tags: string[] = []): Promise<void> {
    // Ensure cache directory exists
    await fs.mkdir(this.cacheDir, { recursive: true })

    const key = this.generateCacheKey(query)
    const entry: CacheEntry = {
      key,
      query,
      result,
      timestamp: new Date(),
      ttl: this.ttlMinutes,
      tags,
    }

    const filePath = this.getCachePath(key)
    await fs.writeFile(filePath, JSON.stringify(entry, null, 2))
  }

  async has(query: string): Promise<boolean> {
    const key = this.generateCacheKey(query)
    const filePath = this.getCachePath(key)

    try {
      await fs.access(filePath)
      const entry = await this.readEntry(key)
      return !this.isExpired(entry)
    } catch {
      return false
    }
  }

  async clear(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir)
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.unlink(path.join(this.cacheDir, file))
        }
      }
    } catch {
      // Directory doesn't exist or is empty
    }
  }

  async clearExpired(): Promise<void> {
    const entries = await this.getAllEntries()

    for (const entry of entries) {
      if (this.isExpired(entry)) {
        const filePath = this.getCachePath(entry.key)
        try {
          await fs.unlink(filePath)
        } catch {
          // File already deleted
        }
      }
    }
  }

  async getStats(): Promise<CacheStats> {
    const entries = await this.getAllEntries()
    let totalSize = 0

    for (const entry of entries) {
      const filePath = this.getCachePath(entry.key)
      try {
        const stats = await fs.stat(filePath)
        totalSize += stats.size
      } catch {
        // File not accessible
      }
    }

    const totalRequests = this.stats.hits + this.stats.misses
    const hitRate = totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Number(hitRate.toFixed(2)),
      totalSize,
      entriesCount: entries.length,
    }
  }

  async search(tags: string[]): Promise<CacheEntry[]> {
    const allEntries = await this.getAllEntries()

    return allEntries.filter((entry) => {
      // Check if entry has ALL requested tags (AND logic)
      return tags.every((tag) => entry.tags?.includes(tag))
    })
  }

  private generateCacheKey(query: string): string {
    // Normalize: lowercase, trim, replace spaces with hyphens
    const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ')

    // Generate 6-char hash for uniqueness (hash the normalized query for consistency)
    const hash = createHash('md5').update(normalized).digest('hex').substring(0, 6)

    // Create filename-friendly version
    const filename = normalized.replace(/\s+/g, '-').substring(0, 50)

    return `${filename}-${hash}.json`
  }

  private getCachePath(key: string): string {
    return path.join(this.cacheDir, key)
  }

  private isExpired(entry: CacheEntry): boolean {
    const now = new Date()
    const entryTime = new Date(entry.timestamp)
    const diffMinutes = (now.getTime() - entryTime.getTime()) / (1000 * 60)
    return diffMinutes > entry.ttl
  }

  private async readEntry(key: string): Promise<CacheEntry> {
    const filePath = this.getCachePath(key)
    try {
      const content = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(content) as CacheEntry
    } catch {
      throw new Error('Cache entry not found')
    }
  }

  private async getAllEntries(): Promise<CacheEntry[]> {
    try {
      const files = await fs.readdir(this.cacheDir)
      const entries: CacheEntry[] = []

      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const entry = await this.readEntry(file)
            entries.push(entry)
          } catch {
            // Skip corrupted files
          }
        }
      }

      return entries
    } catch {
      return []
    }
  }
}
