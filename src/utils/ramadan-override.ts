import type { DayTiming } from '../types/timings';
import { RAMADAN_HIJRI_MONTH } from './constants';

interface RamadanStartOverride {
  startGregorian: string; // DD-MM-YYYY
  hijriYear: number;
  dayCount: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const LAYLAT_LABEL = 'Laylat al-Qadr';
const EID_LABEL = 'Eid al-Fitr';

// Bangladesh local moon-sighting override.
// 2026 Ramadan Day 1 is treated as 19-02-2026.
const RAMADAN_START_OVERRIDES: Record<number, RamadanStartOverride> = {
  2026: {
    startGregorian: '19-02-2026',
    hijriYear: 1447,
    dayCount: 30,
  },
};

function toDayNumber(ddmmyyyy: string): number {
  const [dd, mm, yyyy] = ddmmyyyy.split('-').map(Number);
  return Math.floor(Date.UTC(yyyy, mm - 1, dd) / MS_PER_DAY);
}

function overrideFor(dateGregorian: string): RamadanStartOverride | null {
  const [, , yyyy] = dateGregorian.split('-').map(Number);
  return RAMADAN_START_OVERRIDES[yyyy] || null;
}

function isLaylatHoliday(label: string): boolean {
  const normalized = label.toLowerCase();
  return (
    normalized.includes('lailat')
    || normalized.includes('laylat')
    || normalized.includes('qadr')
  );
}

function isEidHoliday(label: string): boolean {
  const normalized = label.toLowerCase();
  return normalized.includes('eid') || normalized.includes('fitr');
}

function isSpecialHoliday(label: string): boolean {
  return isLaylatHoliday(label) || isEidHoliday(label);
}

function dedupeHolidays(holidays: string[]): string[] {
  const unique: string[] = [];
  const seen = new Set<string>();

  for (const holiday of holidays) {
    const key = holiday.trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(holiday.trim());
    }
  }

  return unique;
}

function normalizeSpecialHolidays(
  holidays: string[],
  diff: number,
  override: RamadanStartOverride,
): string[] {
  const others = holidays.filter(h => !isSpecialHoliday(h));
  const special: string[] = [];

  // Derived from Ramadan Day 1:
  // Day 27 => diff=26, Eid day => diff=dayCount.
  if (diff === 26) special.push(LAYLAT_LABEL);
  if (diff === override.dayCount) special.push(EID_LABEL);

  return dedupeHolidays([...special, ...others]);
}

function applySingleDayOverride(day: DayTiming): DayTiming {
  const override = overrideFor(day.dateGregorian);
  if (!override) return day;

  const dayNumber = toDayNumber(day.dateGregorian);
  const startNumber = toDayNumber(override.startGregorian);
  const diff = dayNumber - startNumber;
  const holidays = normalizeSpecialHolidays(day.holidays, diff, override);

  if (diff >= 0 && diff < override.dayCount) {
    const ramadanDay = diff + 1;
    return {
      ...day,
      hijriMonth: RAMADAN_HIJRI_MONTH,
      hijriDay: ramadanDay,
      hijriYear: override.hijriYear,
      hijriDisplay: `${ramadanDay} Ramaḍān ${override.hijriYear}`,
      isRamadan: true,
      ramadanDay,
      holidays,
    };
  }

  // Keep continuity right after Ramadan when the source is a day ahead.
  if (diff === override.dayCount && day.hijriMonth === 10 && day.hijriDay > 1) {
    const shawwalDay = day.hijriDay - 1;
    return {
      ...day,
      hijriDay: shawwalDay,
      hijriYear: override.hijriYear,
      hijriDisplay: `${shawwalDay} Shawwāl ${override.hijriYear}`,
      isRamadan: false,
      ramadanDay: null,
      holidays,
    };
  }

  // If API marks the day before the local start as Ramadan day 1,
  // force it back to Sha'ban so calendar labels remain consistent.
  if (diff === -1 && day.hijriMonth === RAMADAN_HIJRI_MONTH && day.hijriDay === 1) {
    return {
      ...day,
      hijriMonth: 8,
      hijriDay: 30,
      hijriYear: override.hijriYear,
      hijriDisplay: `30 Shaʿbān ${override.hijriYear}`,
      isRamadan: false,
      ramadanDay: null,
      holidays,
    };
  }

  return {
    ...day,
    holidays,
  };
}

export function applyRamadanOverrides(days: DayTiming[]): DayTiming[] {
  return days.map(applySingleDayOverride);
}
