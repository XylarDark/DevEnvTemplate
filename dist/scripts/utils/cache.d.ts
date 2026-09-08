export interface CacheEntry {
    hash: string;
    timestamp: number;
    data: any;
    ttl?: number;
}
export interface CacheOptions {
    cacheDir?: string;
    ttl?: number;
    maxSize?: number;
}
export declare class FileCache {
    private cacheDir;
    private ttl;
    private maxSize;
    private memoryCache;
    private logger;
    constructor(options?: CacheOptions);
    /**
     * Initialize cache directory
     */
    init(): Promise<void>;
    /**
     * Generate hash for file content
     */
    generateHash(content: string | Buffer): string;
    /**
     * Generate cache key from file path and content hash
     */
    private getCacheKey;
    /**
     * Get cached entry
     */
    get(filePath: string, contentHash: string): Promise<any | null>;
    /**
     * Set cache entry
     */
    set(filePath: string, contentHash: string, data: any, ttl?: number): Promise<void>;
    /**
     * Check if cache entry is still valid
     */
    private isValid;
    /**
     * Clear all cache entries
     */
    clear(): Promise<void>;
    /**
     * Get cache statistics
     */
    getStats(): Promise<{
        entries: number;
        size: number;
        memoryEntries: number;
    }>;
    /**
     * Prune old cache entries
     */
    prune(): Promise<number>;
}
/**
 * Configuration cache for cleanup engine
 */
export declare class ConfigCache {
    private cache;
    private ttl;
    private logger;
    constructor(ttl?: number);
    /**
     * Get cached configuration
     */
    get(configPath: string, currentHash: string): any | null;
    /**
     * Set cached configuration
     */
    set(configPath: string, config: any, hash: string): void;
    /**
     * Clear cache
     */
    clear(): void;
    /**
     * Get cache size
     */
    size(): number;
}
//# sourceMappingURL=cache.d.ts.map