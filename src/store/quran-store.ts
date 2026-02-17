// src/store/quran-store.ts

import type { QuranProgress } from '../types/quran';
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

export async function getQuranProgress(): Promise<QuranProgress> {
  try {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx = database.transaction('quranProgress', 'readonly');
      const store = tx.objectStore('quranProgress');
      const req = store.get('progress');
      req.onsuccess = () => resolve(req.result || { id: 'progress', completedDays: [], lastUpdated: '' });
      req.onerror = () => reject(req.error);
    });
  } catch {
    return { completedDays: [], lastUpdated: '' };
  }
}

export async function toggleDay(day: number): Promise<QuranProgress> {
  const progress = await getQuranProgress();
  const idx = progress.completedDays.indexOf(day);
  if (idx >= 0) {
    progress.completedDays.splice(idx, 1);
  } else {
    progress.completedDays.push(day);
    progress.completedDays.sort((a, b) => a - b);
  }
  progress.lastUpdated = new Date().toISOString();

  try {
    const database = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction('quranProgress', 'readwrite');
      const store = tx.objectStore('quranProgress');
      store.put({ id: 'progress', ...progress });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // silently fail
  }

  return progress;
}

export async function resetProgress(): Promise<void> {
  try {
    const database = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction('quranProgress', 'readwrite');
      const store = tx.objectStore('quranProgress');
      store.put({ id: 'progress', completedDays: [], lastUpdated: new Date().toISOString() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch { /* silently fail */ }
}
