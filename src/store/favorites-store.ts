// src/store/favorites-store.ts

import { DB_NAME, DB_VERSION } from '../utils/constants';

let db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  if (db) return Promise.resolve(db);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onsuccess = () => { db = request.result; resolve(db); };
    request.onerror = () => reject(request.error);
  });
}

export async function getFavorites(): Promise<Set<string>> {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('duaFavorites', 'readonly');
      const store = tx.objectStore('duaFavorites');
      const req = store.getAll();
      req.onsuccess = () => {
        const ids = (req.result || []).map((r: any) => r.duaId);
        resolve(new Set(ids));
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return new Set();
  }
}

export async function toggleFavorite(duaId: string): Promise<boolean> {
  try {
    const database = await openDB();
    const favorites = await getFavorites();
    const isFav = favorites.has(duaId);

    return new Promise((resolve, reject) => {
      const tx = database.transaction('duaFavorites', 'readwrite');
      const store = tx.objectStore('duaFavorites');
      if (isFav) {
        store.delete(duaId);
      } else {
        store.put({ duaId });
      }
      tx.oncomplete = () => resolve(!isFav);
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return false;
  }
}
