// src/api/aladhan.ts

import type { AlAdhanCalendarResponse, AlAdhanMethodsResponse, CalendarParams, MethodEntry } from '../types/api';
import type { MonthTimings } from '../types/timings';
import { API_BASE, COUNTRY } from '../utils/constants';
import { fetchWithRetry } from './client';
import { normalizeMonth } from './normalizer';
import { buildCacheKey } from '../store/settings-store';

/**
 * Fetch available calculation methods (cached in memory)
 */
let cachedMethods: MethodEntry[] | null = null;

export async function getMethods(): Promise<MethodEntry[]> {
  if (cachedMethods) return cachedMethods;

  const raw: AlAdhanMethodsResponse = await fetchWithRetry(`${API_BASE}/methods`);
  cachedMethods = Object.values(raw.data)
    .filter((m: any) => m.id !== 99) // Exclude CUSTOM
    .map((m: any) => ({ id: m.id, name: m.name }))
    .sort((a, b) => a.id - b.id);

  return cachedMethods;
}

/**
 * Fetch monthly prayer calendar
 */
export async function getMonthlyCalendar(params: CalendarParams): Promise<MonthTimings> {
  const { city, year, month, methodId, school } = params;
  const url = new URL(`${API_BASE}/calendarByCity/${year}/${month}`);
  url.searchParams.set('city', city);
  url.searchParams.set('country', COUNTRY);
  url.searchParams.set('method', String(methodId));
  url.searchParams.set('school', String(school));

  const raw: AlAdhanCalendarResponse = await fetchWithRetry(url.toString());
  const key = buildCacheKey(city.toLowerCase(), methodId, school, year, month);
  return normalizeMonth(raw.data, key);
}
