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
  ramadanDay: number | null;
  holidays: string[];
  prayers: NormalizedPrayers;
}

export interface NormalizedPrayers {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  SehriEnds: string;       // Always = Fajr
  Iftar: string;
}

export type PrayerName = 'Fajr' | 'Sunrise' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export const PRAYER_NAMES: PrayerName[] = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export interface NextPrayer {
  name: PrayerName;
  time: string;
  prevTime: string;       // start time for progress bar label
  remainingMs: number;
  remainingDisplay: string;
  progress: number; // 0-1
}
