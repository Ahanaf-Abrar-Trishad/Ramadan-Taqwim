// src/store/settings-store.ts

import type { AppSettings } from '../types/settings';
import { DEFAULT_SETTINGS } from '../types/settings';
import { SETTINGS_KEY } from '../utils/constants';

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  settings.lastSaved = new Date().toISOString();
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function buildCacheKey(
  city: string, methodId: number, school: 0 | 1, year: number, month: number
): string {
  return `aladhan:${city}:${methodId}:${school}:${year}:${month}`;
}
