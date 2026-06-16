/**
 * Tiny TTL + LRU in-memory cache. Swappable for Redis behind the same get/set/clear API.
 * Used by the cache middleware for read-heavy reference data (teams, players, fixtures).
 */
interface Entry<V> {
  value: V;
  expires: number;
}

export class TTLCache<V = unknown> {
  private store = new Map<string, Entry<V>>();

  constructor(
    private ttlMs: number,
    private max = 500,
  ) {}

  get(key: string): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expires < this.now()) {
      this.store.delete(key);
      return undefined;
    }
    // LRU touch: re-insert to mark as most-recently-used.
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key: string, value: V): void {
    if (this.store.size >= this.max) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    this.store.set(key, { value, expires: this.now() + this.ttlMs });
  }

  /** Drop all keys matching a prefix (e.g. bust 'teams:' after an admin edit). */
  clear(prefix?: string): void {
    if (!prefix) return this.store.clear();
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  private now(): number {
    return Date.now();
  }
}

// Shared instance for reference data (60s TTL).
export const referenceCache = new TTLCache(60_000, 1000);
