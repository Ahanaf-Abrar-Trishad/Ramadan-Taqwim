// src/types/dua.ts

export interface Dua {
  id: string;
  titleEn: string;
  arabicText: string;
  transliteration: string;
  translationEn: string;
  category: DuaCategory;
  source: string;
}

export type DuaCategory =
  | 'sehri'
  | 'iftar'
  | 'general'
  | 'laylatul-qadr';
