// scripts/utils/cache.ts

import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { createLogger, Logger } from './logger';

const logger = createLogger({ context: 'cache' });

export interface CacheEntry {
  hash: string;
  timestamp: number;
  data: any;
  ttl?: number;
}

export interface CacheOptions {
  cacheDir?: string;
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size in bytes
}

export class FileCache {
  private cacheDir: string;
  private ttl: number;
  private maxSize: number;
  private memoryCache: Map<string, CacheEntry>;
  private logger: Logger;

  constructor(options: CacheOptions = {}) {
    this.cacheDir = options.cacheDir || path.join(process.cwd(), '.cache');
    this.ttl = options.ttl || 24 * 60 * 60 * 1000; // 24 hours default
    this.maxSize = options.maxSize || 100 * 1024 * 1024; // 100MB default
    this.memoryCache = new Map();
    this.logger = createLogger({ context: 'FileCache' });
  }

  /**
   * Initialize cache directory
   */
  public async init(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
      this.logger.debug('Cache directory initialized', { cacheDir: this.cacheDir });
    } catch (error: any) {
      this.logger.warn('Failed to create cache directory', { error: error.message });
    }
  }

  /**
   * Generate hash for file content
   */
  public generateHash(content: string | Buffer): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Generate cache key from file path and content hash
   */
  private getCacheKey(filePath: string, contentHash: string): string {
    const normalized = path.normalize(filePath).replace(/\\/g, '/');
    return `${createHash('sha256').update(normalized).digest('hex')}-${contentHash}`;
  }

  /**
   * Get cached entry
   */
  public async get(filePath: string, contentHash: string): Promise<any | null> {
    const cacheKey = this.getCacheKey(filePath, contentHash);

    // Check memory cache first
    const memEntry = this.memoryCache.get(cacheKey);
    if (memEntry) {
      if (this.isValid(memEntry)) {
        this.logger.debug('Memory cache hit', { filePath, cacheKey });
        return memEntry.data;
      } else {
        this.memoryCache.delete(cacheKey);
      }
    }

    // Check disk cache
    try {
      const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);
      const cacheData = await fs.readFile(cachePath, 'utf8');
      const entry: CacheEntry = JSON.parse(cacheData);

      if (this.isValid(entry)) {
        // Restore to memory cache
        this.memoryCache.set(cacheKey, entry);
        this.logger.debug('Disk cache hit', { filePath, cacheKey });
        return entry.data;
      } else {
        // Expired, delete it
        await fs.unlink(cachePath).catch(() => {});
        this.logger.debug('Cache entry expired', { filePath, cacheKey });
      }
    } catch (error) {
      // Cache miss
      this.logger.debug('Cache miss', { filePath, cacheKey });
    }

    return null;
  }

  /**
   * Set cache entry
   */
  public async set(filePath: string, contentHash: string, data: any, ttl?: number): Promise<void> {
    const cacheKey = this.getCacheKey(filePath, contentHash);
    const entry: CacheEntry = {
      hash: contentHash,
      timestamp: Date.now(),
      data,
      ttl: ttl || this.ttl
    };

    // Store in memory cache
    this.memoryCache.set(cacheKey, entry);

    // Store in disk cache
    try {
      const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);
      await fs.writeFile(cachePath, JSON.stringify(entry), 'utf8');
      this.logger.debug('Cache entry stored', { filePath, cacheKey });
    } catch (error: any) {
      this.logger.warn('Failed to write cache entry', { error: error.message, filePath });
    }
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid(entry: CacheEntry): boolean {
    const age = Date.now() - entry.timestamp;
    const ttl = entry.ttl || this.ttl;
    return age < ttl;
  }

  /**
   * Clear all cache entries
   */
  public async clear(): Promise<void> {
    this.memoryCache.clear();
    
    try {
      const files = await fs.readdir(this.cacheDir);
      await Promise.all(
        files.map(file => fs.unlink(path.join(this.cacheDir, file)).catch(() => {}))
      );
      this.logger.info('Cache cleared');
    } catch (error: any) {
      this.logger.warn('Failed to clear cache', { error: error.message });
    }
  }

  /**
   * Get cache statistics
   */
  public async getStats(): Promise<{ entries: number; size: number; memoryEntries: number }> {
    let entries = 0;
    let size = 0;

    try {
      const files = await fs.readdir(this.cacheDir);
      entries = files.length;
      
      const sizes = await Promise.all(
        files.map(async file => {
          try {
            const stat = await fs.stat(path.join(this.cacheDir, file));
            return stat.size;
          } catch {
            return 0;
          }
        })
      );
      
      size = sizes.reduce((sum, s) => sum + s, 0);
    } catch (error) {
      // Directory doesn't exist or can't be read
    }

    return {
      entries,
      size,
      memoryEntries: this.memoryCache.size
    };
  }

  /**
   * Prune old cache entries
   */
  public async prune(): Promise<number> {
    let pruned = 0;

    // Prune memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (!this.isValid(entry)) {
        this.memoryCache.delete(key);
        pruned++;
      }
    }

    // Prune disk cache
    try {
      const files = await fs.readdir(this.cacheDir);
      
      for (const file of files) {
        try {
          const cachePath = path.join(this.cacheDir, file);
          const content = await fs.readFile(cachePath, 'utf8');
          const entry: CacheEntry = JSON.parse(content);
          
          if (!this.isValid(entry)) {
            await fs.unlink(cachePath);
            pruned++;
          }
        } catch {
          // Invalid cache file, delete it
          await fs.unlink(path.join(this.cacheDir, file)).catch(() => {});
          pruned++;
        }
      }
    } catch (error: any) {
      this.logger.warn('Failed to prune cache', { error: error.message });
    }

    if (pruned > 0) {
      this.logger.info(`Pruned ${pruned} expired cache entries`);
    }

    return pruned;
  }
}

/**
 * Configuration cache for cleanup engine
 */
export class ConfigCache {
  private cache: Map<string, { config: any; hash: string; timestamp: number }>;
  private ttl: number;
  private logger: Logger;

  constructor(ttl: number = 60 * 60 * 1000) { // 1 hour default
    this.cache = new Map();
    this.ttl = ttl;
    this.logger = createLogger({ context: 'ConfigCache' });
  }

  /**
   * Get cached configuration
   */
  public get(configPath: string, currentHash: string): any | null {
    const entry = this.cache.get(configPath);
    
    if (!entry) {
      this.logger.debug('Config cache miss', { configPath });
      return null;
    }

    // Check if hash matches
    if (entry.hash !== currentHash) {
      this.cache.delete(configPath);
      this.logger.debug('Config cache invalidated (hash mismatch)', { configPath });
      return null;
    }

    // Check if expired
    const age = Date.now() - entry.timestamp;
    if (age > this.ttl) {
      this.cache.delete(configPath);
      this.logger.debug('Config cache expired', { configPath });
      return null;
    }

    this.logger.debug('Config cache hit', { configPath });
    return entry.config;
  }

  /**
   * Set cached configuration
   */
  public set(configPath: string, config: any, hash: string): void {
    this.cache.set(configPath, {
      config,
      hash,
      timestamp: Date.now()
    });
    this.logger.debug('Config cached', { configPath });
  }

  /**
   * Clear cache
   */
  public clear(): void {
    this.cache.clear();
    this.logger.info('Config cache cleared');
  }

  /**
   * Get cache size
   */
  public size(): number {
    return this.cache.size;
  }
}

