export interface CacheItem<T = any> {
  key: string;
  value: T;
  expiresAt: number;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
  size?: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTtl: number;
  enableLocalStorage: boolean;
  enableMemoryCache: boolean;
  evictionPolicy: 'lru' | 'lfu' | 'ttl';
  compressionEnabled: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
  memoryUsage: number;
}

/**
 * Multi-level caching service with memory and localStorage support
 */
export class CacheService {
  private memoryCache: Map<string, CacheItem> = new Map();
  private config: CacheConfig;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0,
    memoryUsage: 0,
  };

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      maxSize: 1000,
      defaultTtl: 300000, // 5 minutes
      enableLocalStorage: true,
      enableMemoryCache: true,
      evictionPolicy: 'lru',
      compressionEnabled: false,
      ...config,
    };

    this.startCleanupTimer();
  }

  /**
   * Get value from cache
   */
  async get<T = any>(key: string): Promise<T | null> {
    // Try memory cache first
    if (this.config.enableMemoryCache) {
      const memoryItem = this.getFromMemory<T>(key);
      if (memoryItem !== null) {
        this.stats.hits++;
        this.updateStats();
        return memoryItem;
      }
    }

    // Try localStorage
    if (this.config.enableLocalStorage) {
      const storageItem = await this.getFromStorage<T>(key);
      if (storageItem !== null) {
        // Promote to memory cache
        if (this.config.enableMemoryCache) {
          this.setInMemory(key, storageItem, this.config.defaultTtl);
        }
        this.stats.hits++;
        this.updateStats();
        return storageItem;
      }
    }

    this.stats.misses++;
    this.updateStats();
    return null;
  }

  /**
   * Set value in cache
   */
  async set<T = any>(key: string, value: T, ttl?: number): Promise<void> {
    const expirationTime = ttl || this.config.defaultTtl;

    // Set in memory cache
    if (this.config.enableMemoryCache) {
      this.setInMemory(key, value, expirationTime);
    }

    // Set in localStorage
    if (this.config.enableLocalStorage) {
      await this.setInStorage(key, value, expirationTime);
    }

    this.updateStats();
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    let deleted = false;

    // Delete from memory
    if (this.config.enableMemoryCache && this.memoryCache.has(key)) {
      this.memoryCache.delete(key);
      deleted = true;
    }

    // Delete from localStorage
    if (this.config.enableLocalStorage) {
      try {
        localStorage.removeItem(this.getStorageKey(key));
        deleted = true;
      } catch (error) {
        console.warn('Failed to delete from localStorage:', error);
      }
    }

    this.updateStats();
    return deleted;
  }

  /**
   * Check if key exists in cache
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    // Clear memory cache
    if (this.config.enableMemoryCache) {
      this.memoryCache.clear();
    }

    // Clear localStorage cache
    if (this.config.enableLocalStorage) {
      try {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key => key.startsWith('cache_'));
        cacheKeys.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    }

    this.resetStats();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get all cache keys
   */
  async getKeys(): Promise<string[]> {
    const keys = new Set<string>();

    // Memory cache keys
    if (this.config.enableMemoryCache) {
      this.memoryCache.forEach((_, key) => keys.add(key));
    }

    // localStorage keys
    if (this.config.enableLocalStorage) {
      try {
        const storageKeys = Object.keys(localStorage);
        const cacheKeys = storageKeys
          .filter(key => key.startsWith('cache_'))
          .map(key => key.replace('cache_', ''));
        cacheKeys.forEach(key => keys.add(key));
      } catch (error) {
        console.warn('Failed to get localStorage keys:', error);
      }
    }

    return Array.from(keys);
  }

  /**
   * Get or set with fallback function
   */
  async getOrSet<T>(
    key: string,
    fallback: () => Promise<T> | T,
    ttl?: number
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await fallback();
    await this.set(key, value, ttl);
    return value;
  }

  /**
   * Set multiple values at once
   */
  async setMany(items: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    const promises = items.map(item => this.set(item.key, item.value, item.ttl));
    await Promise.all(promises);
  }

  /**
   * Get multiple values at once
   */
  async getMany<T = any>(keys: string[]): Promise<Array<{ key: string; value: T | null }>> {
    const promises = keys.map(async key => ({
      key,
      value: await this.get<T>(key),
    }));
    return Promise.all(promises);
  }

  /**
   * Update cache configuration
   */
  updateConfig(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get value from memory cache
   */
  private getFromMemory<T>(key: string): T | null {
    const item = this.memoryCache.get(key);
    if (!item) {
      return null;
    }

    // Check expiration
    if (Date.now() > item.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = Date.now();

    return item.value;
  }

  /**
   * Set value in memory cache
   */
  private setInMemory<T>(key: string, value: T, ttl: number): void {
    // Check if we need to evict items
    if (this.memoryCache.size >= this.config.maxSize) {
      this.evictItems();
    }

    const now = Date.now();
    const item: CacheItem<T> = {
      key,
      value,
      expiresAt: now + ttl,
      createdAt: now,
      accessCount: 1,
      lastAccessed: now,
      size: this.estimateSize(value),
    };

    this.memoryCache.set(key, item);
  }

  /**
   * Get value from localStorage
   */
  private async getFromStorage<T>(key: string): Promise<T | null> {
    try {
      const storageKey = this.getStorageKey(key);
      const stored = localStorage.getItem(storageKey);
      
      if (!stored) {
        return null;
      }

      const item: CacheItem<T> = JSON.parse(stored);
      
      // Check expiration
      if (Date.now() > item.expiresAt) {
        localStorage.removeItem(storageKey);
        return null;
      }

      return item.value;
    } catch (error) {
      console.warn('Failed to get from localStorage:', error);
      return null;
    }
  }

  /**
   * Set value in localStorage
   */
  private async setInStorage<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      const now = Date.now();
      const item: CacheItem<T> = {
        key,
        value,
        expiresAt: now + ttl,
        createdAt: now,
        accessCount: 1,
        lastAccessed: now,
      };

      const storageKey = this.getStorageKey(key);
      localStorage.setItem(storageKey, JSON.stringify(item));
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        // Storage quota exceeded
        console.warn('localStorage quota exceeded, clearing old items');
        this.clearOldStorageItems();
        // Try again
        try {
          const now = Date.now();
          const retryItem: CacheItem<T> = {
            key,
            value,
            expiresAt: now + ttl,
            createdAt: now,
            accessCount: 1,
            lastAccessed: now,
          };
          const storageKey = this.getStorageKey(key);
          localStorage.setItem(storageKey, JSON.stringify(retryItem));
        } catch (retryError) {
          console.warn('Failed to set in localStorage after clearing:', retryError);
        }
      } else {
        console.warn('Failed to set in localStorage:', error);
      }
    }
  }

  /**
   * Get storage key with prefix
   */
  private getStorageKey(key: string): string {
    return `cache_${key}`;
  }

  /**
   * Evict items based on eviction policy
   */
  private evictItems(): void {
    const itemsToEvict = Math.floor(this.config.maxSize * 0.1); // Evict 10%
    
    const items = Array.from(this.memoryCache.entries()).map(([key, item]) => ({
      key,
      item,
    }));

    let sortedItems: typeof items;

    switch (this.config.evictionPolicy) {
      case 'lru':
        sortedItems = items.sort((a, b) => a.item.lastAccessed - b.item.lastAccessed);
        break;
      case 'lfu':
        sortedItems = items.sort((a, b) => a.item.accessCount - b.item.accessCount);
        break;
      case 'ttl':
        sortedItems = items.sort((a, b) => a.item.expiresAt - b.item.expiresAt);
        break;
      default:
        sortedItems = items;
    }

    // Remove the least recently used/frequently used items
    for (let i = 0; i < itemsToEvict && i < sortedItems.length; i++) {
      this.memoryCache.delete(sortedItems[i].key);
    }
  }

  /**
   * Clear old items from localStorage
   */
  private clearOldStorageItems(): void {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      // Remove oldest items (simple heuristic)
      const itemsToRemove = Math.floor(cacheKeys.length * 0.3);
      for (let i = 0; i < itemsToRemove; i++) {
        localStorage.removeItem(cacheKeys[i]);
      }
    } catch (error) {
      console.warn('Failed to clear old localStorage items:', error);
    }
  }

  /**
   * Estimate size of value in bytes
   */
  private estimateSize(value: any): number {
    try {
      return JSON.stringify(value).length * 2; // Rough estimate (UTF-16)
    } catch {
      return 0;
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.stats.size = this.memoryCache.size;
    this.stats.hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
    
    // Calculate memory usage
    let memoryUsage = 0;
    this.memoryCache.forEach(item => {
      memoryUsage += item.size || 0;
    });
    this.stats.memoryUsage = memoryUsage;
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0,
      memoryUsage: 0,
    };
  }

  /**
   * Start cleanup timer for expired items
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredItems();
    }, 60000); // Run every minute
  }

  /**
   * Clean up expired items from memory cache
   */
  private cleanupExpiredItems(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.memoryCache.forEach((item, key) => {
      if (now > item.expiresAt) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.memoryCache.delete(key);
    });

    if (expiredKeys.length > 0) {
      this.updateStats();
    }
  }
} 