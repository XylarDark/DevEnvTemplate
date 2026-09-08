"use strict";
// scripts/utils/cache.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigCache = exports.FileCache = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const crypto_1 = require("crypto");
const logger_1 = require("./logger");
class FileCache {
    cacheDir;
    ttl;
    maxSize;
    memoryCache;
    logger;
    constructor(options = {}) {
        this.cacheDir = options.cacheDir || path_1.default.join(process.cwd(), '.cache');
        this.ttl = options.ttl || 24 * 60 * 60 * 1000; // 24 hours default
        this.maxSize = options.maxSize || 100 * 1024 * 1024; // 100MB default
        this.memoryCache = new Map();
        this.logger = (0, logger_1.createLogger)({ context: 'FileCache' });
    }
    /**
     * Initialize cache directory
     */
    async init() {
        try {
            await fs_1.promises.mkdir(this.cacheDir, { recursive: true });
            this.logger.debug('Cache directory initialized', { cacheDir: this.cacheDir });
        }
        catch (error) {
            this.logger.warn('Failed to create cache directory', { error: error.message });
        }
    }
    /**
     * Generate hash for file content
     */
    generateHash(content) {
        return (0, crypto_1.createHash)('sha256').update(content).digest('hex');
    }
    /**
     * Generate cache key from file path and content hash
     */
    getCacheKey(filePath, contentHash) {
        const normalized = path_1.default.normalize(filePath).replace(/\\/g, '/');
        return `${(0, crypto_1.createHash)('sha256').update(normalized).digest('hex')}-${contentHash}`;
    }
    /**
     * Get cached entry
     */
    async get(filePath, contentHash) {
        const cacheKey = this.getCacheKey(filePath, contentHash);
        // Check memory cache first
        const memEntry = this.memoryCache.get(cacheKey);
        if (memEntry) {
            if (this.isValid(memEntry)) {
                this.logger.debug('Memory cache hit', { filePath, cacheKey });
                return memEntry.data;
            }
            else {
                this.memoryCache.delete(cacheKey);
            }
        }
        // Check disk cache
        try {
            const cachePath = path_1.default.join(this.cacheDir, `${cacheKey}.json`);
            const cacheData = await fs_1.promises.readFile(cachePath, 'utf8');
            const entry = JSON.parse(cacheData);
            if (this.isValid(entry)) {
                // Restore to memory cache
                this.memoryCache.set(cacheKey, entry);
                this.logger.debug('Disk cache hit', { filePath, cacheKey });
                return entry.data;
            }
            else {
                // Expired, delete it
                await fs_1.promises.unlink(cachePath).catch(() => { });
                this.logger.debug('Cache entry expired', { filePath, cacheKey });
            }
        }
        catch (error) {
            // Cache miss
            this.logger.debug('Cache miss', { filePath, cacheKey });
        }
        return null;
    }
    /**
     * Set cache entry
     */
    async set(filePath, contentHash, data, ttl) {
        const cacheKey = this.getCacheKey(filePath, contentHash);
        const entry = {
            hash: contentHash,
            timestamp: Date.now(),
            data,
            ttl: ttl || this.ttl,
        };
        // Store in memory cache
        this.memoryCache.set(cacheKey, entry);
        // Store in disk cache
        try {
            const cachePath = path_1.default.join(this.cacheDir, `${cacheKey}.json`);
            await fs_1.promises.writeFile(cachePath, JSON.stringify(entry), 'utf8');
            this.logger.debug('Cache entry stored', { filePath, cacheKey });
        }
        catch (error) {
            this.logger.warn('Failed to write cache entry', { error: error.message, filePath });
        }
    }
    /**
     * Check if cache entry is still valid
     */
    isValid(entry) {
        const age = Date.now() - entry.timestamp;
        const ttl = entry.ttl || this.ttl;
        return age < ttl;
    }
    /**
     * Clear all cache entries
     */
    async clear() {
        this.memoryCache.clear();
        try {
            const files = await fs_1.promises.readdir(this.cacheDir);
            await Promise.all(files.map(file => fs_1.promises.unlink(path_1.default.join(this.cacheDir, file)).catch(() => { })));
            this.logger.info('Cache cleared');
        }
        catch (error) {
            this.logger.warn('Failed to clear cache', { error: error.message });
        }
    }
    /**
     * Get cache statistics
     */
    async getStats() {
        let entries = 0;
        let size = 0;
        try {
            const files = await fs_1.promises.readdir(this.cacheDir);
            entries = files.length;
            const sizes = await Promise.all(files.map(async (file) => {
                try {
                    const stat = await fs_1.promises.stat(path_1.default.join(this.cacheDir, file));
                    return stat.size;
                }
                catch {
                    return 0;
                }
            }));
            size = sizes.reduce((sum, s) => sum + s, 0);
        }
        catch (error) {
            // Directory doesn't exist or can't be read
        }
        return {
            entries,
            size,
            memoryEntries: this.memoryCache.size,
        };
    }
    /**
     * Prune old cache entries
     */
    async prune() {
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
            const files = await fs_1.promises.readdir(this.cacheDir);
            for (const file of files) {
                try {
                    const cachePath = path_1.default.join(this.cacheDir, file);
                    const content = await fs_1.promises.readFile(cachePath, 'utf8');
                    const entry = JSON.parse(content);
                    if (!this.isValid(entry)) {
                        await fs_1.promises.unlink(cachePath);
                        pruned++;
                    }
                }
                catch {
                    // Invalid cache file, delete it
                    await fs_1.promises.unlink(path_1.default.join(this.cacheDir, file)).catch(() => { });
                    pruned++;
                }
            }
        }
        catch (error) {
            this.logger.warn('Failed to prune cache', { error: error.message });
        }
        if (pruned > 0) {
            this.logger.info(`Pruned ${pruned} expired cache entries`);
        }
        return pruned;
    }
}
exports.FileCache = FileCache;
/**
 * Configuration cache for cleanup engine
 */
class ConfigCache {
    cache;
    ttl;
    logger;
    constructor(ttl = 60 * 60 * 1000) {
        // 1 hour default
        this.cache = new Map();
        this.ttl = ttl;
        this.logger = (0, logger_1.createLogger)({ context: 'ConfigCache' });
    }
    /**
     * Get cached configuration
     */
    get(configPath, currentHash) {
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
    set(configPath, config, hash) {
        this.cache.set(configPath, {
            config,
            hash,
            timestamp: Date.now(),
        });
        this.logger.debug('Config cached', { configPath });
    }
    /**
     * Clear cache
     */
    clear() {
        this.cache.clear();
        this.logger.info('Config cache cleared');
    }
    /**
     * Get cache size
     */
    size() {
        return this.cache.size;
    }
}
exports.ConfigCache = ConfigCache;
//# sourceMappingURL=cache.js.map