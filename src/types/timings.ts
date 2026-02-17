// src/types/timings.ts

export interface MonthTimings {
  cacheKey: string;
  fetchedAt: string;
  days: DayTiming[];
}

export interface DayTiming {
  dateGregorian: string;    // DD-MM-YYYY
  dateReadable: string;     // "01 Mar 2026"
  timestamp: number;
  weekday: string;
  hijriDisplay: string;     // "12 Ramaḍān 1447"
  hijriMonth: number;
  hijriDay: number;
  hijriYear: number;
  isRamadan: boolean;
  holidays: string[];
  prayers: NormalizedPrayers;
}

export interface NormalizedPrayers {
  Imsak: string;
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  SehriEnds: string;
  SehriEndsLabel: string;
  Iftar: string;
}

export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export interface NextPrayer {
  name: PrayerName;
  time: string;
  remainingMs: number;
  remainingDisplay: string;
  progress: number; // 0-1
}
