// src/services/cache-manager.ts

import type { MonthTimings } from '../types/timings';
import type { AppSettings } from '../types/settings';
import { getCachedMonth, setCachedMonth, isCacheFresh } from '../store/cache-store';
import { buildCacheKey } from '../store/settings-store';
import { getMonthlyCalendar } from '../api/aladhan';
import { currentYear, currentMonth } from '../utils/date';

export interface CacheResult {
  data: MonthTimings | null;
  source: 'fresh-cache' | 'stale-cache' | 'network' | 'error';
  error?: string;
}

/**
 * Load month data with cache-first strategy
 */
export async function loadMonthData(
  settings: AppSettings,
  year?: number,
  month?: number
): Promise<CacheResult> {
  const y = year ?? currentYear();
  const m = month ?? currentMonth();
  const key = buildCacheKey(settings.city, settings.methodId, settings.school, y, m);

  // Check cache
  const cached = await getCachedMonth(key);
  if (cached) {
    if (isCacheFresh(cached)) {
      return { data: cached, source: 'fresh-cache' };
    }
    // Stale cache — return it but trigger background refresh
    backgroundRefresh(settings, y, m);
    return { data: cached, source: 'stale-cache' };
  }

  // No cache — must fetch
  return fetchAndStore(settings, y, m);
}

/**
 * Fetch from API and store in cache
 */
export async function fetchAndStore(
  settings: AppSettings,
  year: number,
  month: number
): Promise<CacheResult> {
  try {
    const data = await getMonthlyCalendar({
      city: settings.cityDisplay,
      year,
      month,
      methodId: settings.methodId,
      school: settings.school,
    });
    await setCachedMonth(data);
    return { data, source: 'network' };
  } catch (err: any) {
    return { data: null, source: 'error', error: err.message };
  }
}

/**
 * Background refresh — fire and forget
 */
function backgroundRefresh(settings: AppSettings, year: number, month: number): void {
  fetchAndStore(settings, year, month).catch(() => {
    // Silently fail — stale cache is still valid
  });
}

/**
 * Load both months needed for Ramadan coverage (Feb + Mar)
 */
export async function loadRamadanMonths(settings: AppSettings): Promise<{
  current: CacheResult;
  other: CacheResult | null;
}> {
  const y = currentYear();
  const m = currentMonth();
  const current = await loadMonthData(settings, y, m);

  // If Feb, also load Mar (Ramadan might span both)
  // If Mar, also load Feb
  let other: CacheResult | null = null;
  if (m === 2) {
    other = await loadMonthData(settings, y, 3);
  } else if (m === 3) {
    other = await loadMonthData(settings, y, 2);
  }

  return { current, other };
}
