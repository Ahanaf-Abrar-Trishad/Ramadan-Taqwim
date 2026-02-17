# Ramadan Taqwim — Engineering Blueprint

## Architecture
- **Runtime**: Bun.js (build + dev server)
- **Language**: TypeScript (vanilla, no framework)
- **Bundler**: Bun.build with minification → dist/
- **Routing**: Hash-based SPA (`#/`, `#/calendar`, `#/duas`, `#/quran`, `#/settings`)
- **State**: Pub/sub Store class (src/app.ts)
- **Storage**: IndexedDB (monthTimings, duaFavorites, quranProgress) + localStorage (settings)
- **API**: AlAdhan Prayer Times REST API

## Type Definitions

### AppSettings (src/types/settings.ts)
```ts
interface AppSettings {
  city: string;
  cityDisplay: string;
  methodId: number;
  methodName: string;
  school: 0 | 1;
  theme: 'dark' | 'light' | 'system';
  timeFormat: '12h' | '24h';
  lastSaved: string;
}
```

### NormalizedPrayers (src/types/timings.ts)
```ts
interface NormalizedPrayers {
  Imsak: string;  // retained for raw
  Fajr: string; Sunrise: string; Dhuhr: string;
  Asr: string; Maghrib: string; Isha: string;
  SehriEnds: string;      // = Imsak or Fajr fallback
  SehriEndsLabel: string;  // "Imsak" | "Fajr"
  Iftar: string;           // = Maghrib
}
```

### DayTiming
```ts
interface DayTiming {
  dateGregorian: string;  // DD-MM-YYYY
  dateReadable: string; weekday: string;
  hijriDisplay: string; hijriDay: number;
  isRamadan: boolean; ramadanDay: number | null;
  holidays: string[];
  prayers: NormalizedPrayers;
}
```

### NextPrayer
```ts
interface NextPrayer {
  name: PrayerName;
  time: string;           // HH:mm
  remainingMs: number;
  remainingDisplay: string;
  progress: number;       // 0-1
  prevTime: string;       // start time for progress bar
}
```

### SehriIftarCountdown
```ts
interface SehriIftarCountdown {
  label: string;
  targetTime: string;
  startTime: string;
  remainingMs: number;
  remainingDisplay: string;
  progress: number;
  type: 'sehri' | 'iftar';
}
```

## Key Functions

### prayer-engine.ts
| Function | Input | Output | Notes |
|----------|-------|--------|-------|
| `getNextPrayer(day)` | DayTiming | NextPrayer \| null | Iterates PRAYER_NAMES, returns first future prayer with prevTime for bar labels |
| `getSehriIftarCountdown(day)` | DayTiming | SehriIftarCountdown \| null | Ramadan only. Before sehri → sehri mode, before iftar → iftar mode, includes startTime |
| `isPrayerPast(time)` | string | boolean | Compares HH:mm to now |
| `isNextPrayer(name, next)` | PrayerName, NextPrayer | boolean | Simple equality check |

### cache-manager.ts
| Function | Notes |
|----------|-------|
| `loadMonthData(settings, year, month)` | Cache-first with 24h TTL. If stale, return cached + background refresh |
| `fetchAndStore(settings, year, month)` | API call → normalize → cache in IndexedDB |
| `loadRamadanMonths(settings)` | Fetches Feb + Mar for full Ramadan coverage |

### normalizer.ts
| Function | Notes |
|----------|-------|
| `normalizeDay(raw)` | Strip timezone suffixes, map Imsak→SehriEnds, Maghrib→Iftar |
| `normalizeMonth(days, year, month)` | Normalize all days + apply ramadan-override.ts |

### time.ts
| Function | Notes |
|----------|-------|
| `formatTime(time, format)` | NEW: returns 12h or 24h based on AppSettings.timeFormat |
| `formatTime12h(time)` | "4:52 AM" |
| `formatRemaining(ms)` | "5h 32m 14s" |

## Caching Rules
1. Cache key: `${city}-${methodId}-${school}-${year}-${month}`
2. TTL: 24 hours (`CACHE_TTL_MS = 86400000`)
3. Strategy: stale-while-revalidate — return cached immediately, refresh in background if stale
4. On settings change: if cache key differs, single fetch for current month
5. Ramadan months (Feb+Mar 2026): pre-fetched on app init

## Data Flow
```
App Init → loadSettings() → loadRamadanMonths()
         → findTodayData() → appStore.setState({todayData})
         → Router matches hash → renders page

Settings Save → compare old/new cache key
             → if different: fetchAndStore() (single call)
             → appStore.setState({settings, currentMonthData})

Timer (1s) → getNextPrayer() / getSehriIftarCountdown()
           → DOM update (no full re-render)
```

## Build
```bash
bun run build   # build.ts: Bun.build + copy static → dist/
bun run preview # serve dist/ on :3000
bun run dev     # watch + serve
```
