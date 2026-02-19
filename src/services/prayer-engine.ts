// src/services/prayer-engine.ts

import type { DayTiming, NextPrayer, PrayerName } from '../types/timings';
import { PRAYER_NAMES } from '../types/timings';
import { parseTimeToMinutes, formatRemaining } from '../utils/time';

/**
 * Determine the next prayer based on current time.
 * @param prevDayIsha - Previous day's Isha time, used as the start of the Fajr progress window.
 *                      Falls back to a sensible default if not provided.
 */
export function getNextPrayer(day: DayTiming, prevDayIsha?: string): NextPrayer | null {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nowMs = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000;

  for (const name of PRAYER_NAMES) {
    const time = day.prayers[name];
    const prayerMinutes = parseTimeToMinutes(time);

    if (prayerMinutes > nowMinutes) {
      const prayerMs = prayerMinutes * 60000;
      const remainingMs = prayerMs - nowMs;

      // Calculate progress between previous prayer and this one.
      // For Fajr (first prayer), use previous day's Isha as the window start.
      const prevIdx = PRAYER_NAMES.indexOf(name) - 1;
      let prevTime: string;
      let prevMinutes: number;
      if (prevIdx >= 0) {
        prevTime = day.prayers[PRAYER_NAMES[prevIdx]];
        prevMinutes = parseTimeToMinutes(prevTime);
      } else {
        // Fajr — use previous day's Isha (wraps past midnight)
        prevTime = prevDayIsha ?? day.prayers.Isha; // fallback to today's Isha as approximation
        prevMinutes = parseTimeToMinutes(prevTime);
        // Isha was yesterday, so elapsed wraps: midnight-to-now + (1440 - ishaMinutes)
        const elapsedSincePrev = nowMinutes + (1440 - prevMinutes);
        const totalSpan = prayerMinutes + (1440 - prevMinutes);
        const progress = totalSpan > 0 ? Math.min(1, Math.max(0, elapsedSincePrev / totalSpan)) : 0;
        return {
          name,
          time,
          prevTime,
          remainingMs,
          remainingDisplay: formatRemaining(remainingMs),
          progress,
        };
      }

      const totalSpan = prayerMinutes - prevMinutes;
      const elapsed = nowMinutes - prevMinutes;
      const progress = totalSpan > 0 ? Math.min(1, Math.max(0, elapsed / totalSpan)) : 0;

      return {
        name,
        time,
        prevTime,
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

/**
 * During Ramadan, determine countdown context:
 * - Before Sehri ends (Fajr) → "Sehri Ends In"
 * - After Sehri, before Iftar (Maghrib) → "Iftar In"
 * - After Iftar → null (day is done)
 */
export interface SehriIftarCountdown {
  label: string;        // "Sehri Ends In" | "Iftar In"
  targetTime: string;   // HH:mm
  startTime: string;    // HH:mm — start of progress bar
  remainingMs: number;
  remainingDisplay: string;
  progress: number;     // 0-1
  type: 'sehri' | 'iftar';
}

export function getSehriIftarCountdown(day: DayTiming, prevDayIsha?: string): SehriIftarCountdown | null {
  if (!day.isRamadan) return null;

  const now = new Date();
  const nowMs = now.getHours() * 3600000 + now.getMinutes() * 60000 + now.getSeconds() * 1000;

  const sehriTime = day.prayers.SehriEnds;
  const iftarTime = day.prayers.Iftar;
  const sehriMs = parseTimeToMinutes(sehriTime) * 60000;
  const iftarMs = parseTimeToMinutes(iftarTime) * 60000;

  // Before Sehri ends
  if (nowMs < sehriMs) {
    const remainingMs = sehriMs - nowMs;
    // Use previous day's Isha as the start of the sehri window
    const ishaTime = prevDayIsha ?? day.prayers.Isha; // fallback approximation
    const ishaMinutes = parseTimeToMinutes(ishaTime);
    const sehriMinutes = parseTimeToMinutes(sehriTime);
    const nowMinutes = Math.floor(nowMs / 60000);
    // Isha was yesterday, so total span and elapsed wrap past midnight
    const totalSpan = sehriMinutes + (1440 - ishaMinutes);
    const elapsedSincePrev = nowMinutes + (1440 - ishaMinutes);
    const progress = totalSpan > 0 ? Math.min(1, Math.max(0, elapsedSincePrev / totalSpan)) : 0;
    return {
      label: 'Sehri Ends In',
      targetTime: sehriTime,
      startTime: ishaTime,
      remainingMs,
      remainingDisplay: formatRemaining(remainingMs),
      progress,
      type: 'sehri',
    };
  }

  // Before Iftar
  if (nowMs < iftarMs) {
    const remainingMs = iftarMs - nowMs;
    const span = iftarMs - sehriMs;
    const elapsed = nowMs - sehriMs;
    const progress = span > 0 ? Math.min(1, Math.max(0, elapsed / span)) : 0;
    return {
      label: 'Iftar In',
      targetTime: iftarTime,
      startTime: sehriTime,
      remainingMs,
      remainingDisplay: formatRemaining(remainingMs),
      progress,
      type: 'iftar',
    };
  }

  return null;
}
