import { describe, expect, it } from 'bun:test';
import { getNextPrayer, getSehriIftarCountdown } from '../../src/services/prayer-engine';
import type { DayTiming } from '../../src/types/timings';

const FIXTURE_DAY: DayTiming = {
  dateGregorian: '19-02-2026',
  dateReadable: '19 Feb 2026',
  timestamp: 1771459200,
  weekday: 'Thursday',
  hijriDisplay: '1 Ramaḍān 1447',
  hijriMonth: 9,
  hijriDay: 1,
  hijriYear: 1447,
  isRamadan: true,
  ramadanDay: 1,
  holidays: [],
  prayers: {
    Fajr: '05:00',
    Sunrise: '06:20',
    Dhuhr: '12:00',
    Asr: '15:30',
    Maghrib: '18:00',
    Isha: '19:30',
    SehriEnds: '05:00',
    Iftar: '18:00',
  },
};

function at(hour: number, minute: number, second = 0): Date {
  return new Date(2026, 1, 19, hour, minute, second, 0);
}

describe('getSehriIftarCountdown', () => {
  it('returns Sehri Ends In before sehri ends', () => {
    const result = getSehriIftarCountdown(FIXTURE_DAY, '19:20', at(4, 30));
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.label).toBe('Sehri Ends In');
    expect(result.type).toBe('sehri');
    expect(result.targetTime).toBe('05:00');
    expect(result.startTime).toBe('19:20');
    expect(result.remainingMs).toBe(30 * 60 * 1000);
    expect(result.remainingDisplay).toBe('30m 0s');
    expect(result.progress).toBeGreaterThan(0);
    expect(result.progress).toBeLessThan(1);
    expect(result.progress).toBeCloseTo(550 / 580, 6);
  });

  it('returns Iftar In between sehri and iftar', () => {
    const result = getSehriIftarCountdown(FIXTURE_DAY, '19:20', at(10, 0));
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.label).toBe('Iftar In');
    expect(result.type).toBe('iftar');
    expect(result.targetTime).toBe('18:00');
    expect(result.startTime).toBe('05:00');
    expect(result.remainingMs).toBe(8 * 60 * 60 * 1000);
    expect(result.remainingDisplay).toBe('8h 0m 0s');
    expect(result.progress).toBeGreaterThan(0);
    expect(result.progress).toBeLessThan(1);
    expect(result.progress).toBeCloseTo(5 / 13, 6);
  });

  it('returns null after iftar', () => {
    const result = getSehriIftarCountdown(FIXTURE_DAY, '19:20', at(20, 0));
    expect(result).toBeNull();
  });
});

describe('getNextPrayer around day-end', () => {
  it('returns Fajr just after midnight using previous-day Isha', () => {
    const result = getNextPrayer(FIXTURE_DAY, '19:25', at(0, 10));
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.name).toBe('Fajr');
    expect(result.time).toBe('05:00');
    expect(result.prevTime).toBe('19:25');
    expect(result.remainingMs).toBe(4 * 60 * 60 * 1000 + 50 * 60 * 1000);
    expect(result.remainingDisplay).toBe('4h 50m 0s');
    expect(result.progress).toBeGreaterThan(0);
    expect(result.progress).toBeLessThan(1);
    expect(result.progress).toBeCloseTo(285 / 575, 6);
  });

  it('returns null late night after Isha', () => {
    const result = getNextPrayer(FIXTURE_DAY, '19:25', at(23, 45));
    expect(result).toBeNull();
  });
});
