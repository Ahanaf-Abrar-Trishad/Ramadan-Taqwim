// src/api/normalizer.ts

import type { AlAdhanDayRaw } from '../types/api';
import type { DayTiming, MonthTimings, NormalizedPrayers } from '../types/timings';
import { applyRamadanOverrides } from '../utils/ramadan-override';

/**
 * Strip timezone suffix from AlAdhan time string
 * "05:05 (+06)" → "05:05"
 */
export function stripTimezone(timeStr: string): string {
  return timeStr.replace(/\s*\(.*\)$/, '').trim();
}

/**
 * Normalize a single day from AlAdhan raw response
 */
export function normalizeDay(raw: AlAdhanDayRaw): DayTiming {
  const t = raw.timings;
  const hijri = raw.date.hijri;
  const greg = raw.date.gregorian;

  const fajr = stripTimezone(t.Fajr || '');

  const holidays: string[] = [
    ...(hijri.holidays || []),
    ...(hijri.adjustedHolidays || []),
  ];

  // Sehri ends at Fajr — not Imsak.
  // Imsak (stopping ~10 min before Fajr) has no basis in the Sunnah.
  // "Eat and drink until the white thread of dawn appears to you
  //  distinct from the black thread of night." [al-Baqarah 2:187]
  const prayers: NormalizedPrayers = {
    Fajr: fajr,
    Sunrise: stripTimezone(t.Sunrise || ''),
    Dhuhr: stripTimezone(t.Dhuhr || ''),
    Asr: stripTimezone(t.Asr || ''),
    Maghrib: stripTimezone(t.Maghrib || ''),
    Isha: stripTimezone(t.Isha || ''),
    SehriEnds: fajr,
    SehriEndsLabel: 'Fajr',
    Iftar: stripTimezone(t.Maghrib || ''),
  };

  return {
    dateGregorian: greg.date,
    dateReadable: raw.date.readable,
    timestamp: parseInt(raw.date.timestamp, 10),
    weekday: greg.weekday.en,
    hijriDisplay: `${hijri.day} ${hijri.month.en} ${hijri.year}`,
    hijriMonth: hijri.month.number,
    hijriDay: parseInt(hijri.day, 10),
    hijriYear: parseInt(hijri.year, 10),
    isRamadan: hijri.month.number === 9,
    ramadanDay: hijri.month.number === 9 ? parseInt(hijri.day, 10) : null,
    holidays,
    prayers,
  };
}

/**
 * Normalize full month response
 */
export function normalizeMonth(rawData: AlAdhanDayRaw[], cacheKey: string): MonthTimings {
  const days = applyRamadanOverrides(rawData.map(normalizeDay));
  return {
    cacheKey,
    fetchedAt: new Date().toISOString(),
    days,
  };
}
