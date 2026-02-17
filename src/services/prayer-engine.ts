// src/services/prayer-engine.ts

import type { DayTiming, NextPrayer, PrayerName } from '../types/timings';
import { PRAYER_NAMES } from '../types/timings';
import { parseTimeToMinutes, formatRemaining } from '../utils/time';

/**
 * Determine the next prayer based on current time
 */
export function getNextPrayer(day: DayTiming): NextPrayer | null {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowMs = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000;

  for (const name of PRAYER_NAMES) {
    const time = day.prayers[name];
    const prayerMinutes = parseTimeToMinutes(time);

    if (prayerMinutes > nowMinutes) {
      const prayerMs = prayerMinutes * 60000;
      const remainingMs = prayerMs - nowMs;

      // Calculate progress between previous prayer and this one
      const prevIdx = PRAYER_NAMES.indexOf(name) - 1;
      const prevMinutes = prevIdx >= 0
        ? parseTimeToMinutes(day.prayers[PRAYER_NAMES[prevIdx]])
        : 0; // midnight
      const totalSpan = prayerMinutes - prevMinutes;
      const elapsed = nowMinutes - prevMinutes;
      const progress = totalSpan > 0 ? Math.min(1, Math.max(0, elapsed / totalSpan)) : 0;

      return {
        name,
        time,
        remainingMs,
        remainingDisplay: formatRemaining(remainingMs),
        progress,
      };
    }
  }

  // All prayers passed — next is Fajr tomorrow
  return null;
}

/**
 * Check if a prayer time has passed
 */
export function isPrayerPast(prayerTime: string): boolean {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  return parseTimeToMinutes(prayerTime) <= nowMinutes;
}

/**
 * Check if this is the next prayer
 */
export function isNextPrayer(prayerName: PrayerName, nextPrayer: NextPrayer | null): boolean {
  return nextPrayer?.name === prayerName;
}
