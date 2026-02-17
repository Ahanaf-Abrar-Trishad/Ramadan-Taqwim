// src/types/quran.ts

export interface QuranDayPlan {
  day: number;
  juz: number;
  surahStart: string;
  ayahStart: number;
  surahEnd: string;
  ayahEnd: number;
  pages: string;
}

export interface QuranProgress {
  completedDays: number[];
  lastUpdated: string;
}
