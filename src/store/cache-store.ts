// src/store/cache-store.ts

import type { MonthTimings } from '../types/timings';
import { DB_NAME, DB_VERSION, CACHE_TTL_MS } from '../utils/constants';

let db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (db) return Promise.resolve(db);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = request.result;
      const oldVersion = event.oldVersion;

      if (!database.objectStoreNames.contains('monthTimings')) {
        database.createObjectStore('monthTimings', { keyPath: 'cacheKey' });
      } else if (oldVersion > 0) {
        request.transaction?.objectStore('monthTimings').clear();
      }
      if (!database.objectStoreNames.contains('duaFavorites')) {
        database.createObjectStore('duaFavorites', { keyPath: 'duaId' });
      }
      if (!database.objectStoreNames.contains('quranProgress')) {
        database.createObjectStore('quranProgress', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Get cached month timings by cache key
 */
export async function getCachedMonth(cacheKey: string): Promise<MonthTimings | null> {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('monthTimings', 'readonly');
      const store = tx.objectStore('monthTimings');
      const req = store.get(cacheKey);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/**
 * Store month timings in cache
 */
export async function setCachedMonth(data: MonthTimings): Promise<void> {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('monthTimings', 'readwrite');
      const store = tx.objectStore('monthTimings');
      store.put(data);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Silently fail — in-memory fallback
  }
}

/**
 * Check if cache is fresh (< 24h old)
 */
export function isCacheFresh(data: MonthTimings): boolean {
  const fetchedAt = new Date(data.fetchedAt).getTime();
  return Date.now() - fetchedAt < CACHE_TTL_MS;
}

/**
 * Initialize the database (call on app start)
 */
export async function initDB(): Promise<void> {
  try {
    await openDB();
  } catch {
    console.warn('IndexedDB unavailable — using in-memory only');
  }
}
