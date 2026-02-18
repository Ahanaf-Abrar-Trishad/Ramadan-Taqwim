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
      const prevTime = prevIdx >= 0 ? day.prayers[PRAYER_NAMES[prevIdx]] : '00:00';
      const prevMinutes = parseTimeToMinutes(prevTime);
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

export function getSehriIftarCountdown(day: DayTiming): SehriIftarCountdown | null {
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
    const midnightToSehri = sehriMs;
    const progress = midnightToSehri > 0 ? Math.min(1, Math.max(0, nowMs / midnightToSehri)) : 0;
    return {
      label: 'Sehri Ends In',
      targetTime: sehriTime,
      startTime: '00:00',
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
