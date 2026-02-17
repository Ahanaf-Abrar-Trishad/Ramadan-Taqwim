# Ramadan Taqwim — Build Order Checklist

## Pre-flight
- [x] Bun runtime installed
- [x] Project initialized with package.json and tsconfig.json
- [x] AlAdhan API tested (methods + calendarByCity endpoints)
- [x] Ramadan override logic for Bangladesh (19-02-2026)
- [x] Data files: cities.json (64 districts), duas.json (10 duas), quran-plan.json (30 days)

## Phase 1 — Foundation (Done)
- [x] Type definitions: settings, timings, dua, quran, api
- [x] Utility functions: time, date, dom, constants
- [x] Store layer: settings-store, cache-store, favorites-store, quran-store
- [x] API layer: client (fetchWithRetry), normalizer, aladhan
- [x] Services: prayer-engine, cache-manager, offline-detector
- [x] App state: Store class with pub/sub
- [x] Hash router with 5 routes

## Phase 2 — UI Rework (Current)
- [ ] **2.1** Add `timeFormat: '12h' | '24h'` and `theme: 'system'` to AppSettings
- [ ] **2.2** Add `formatTime(time, format)` to time.ts
- [ ] **2.3** Update `getNextPrayer()` to return `prevTime` for progress bar labels
- [ ] **2.4** Update `getSehriIftarCountdown()` to return `startTime`
- [ ] **2.5** Rewrite countdown-timer.ts: single hero, toggle pill, labeled progress bar
- [ ] **2.6** Rewrite prayer-card.ts: two-column, "Now" label, tabular numerals
- [ ] **2.7** Update today.ts: single countdown hero, toggle state, labeled bars
- [ ] **2.8** Update day-row.ts: Iftar primary, Sehri secondary layout
- [ ] **2.9** Update calendar.ts: Jump to today, This month, scroll behavior
- [ ] **2.10** Update dua-card.ts: Copy Arabic, Copy Translation actions, readability
- [ ] **2.11** Update duas.ts: search input, fade-edge tabs
- [ ] **2.12** Update quran-day-card.ts: today highlight, full-card tap
- [ ] **2.13** Update quran.ts: filters, Go to today, undo toast
- [ ] **2.14** Update settings.ts: time format, system theme, transparency text
- [ ] **2.15** Update CSS: all new components and layout changes

## Phase 3 — Polish
- [ ] **3.1** Build and verify output size ≤ 50 KB
- [ ] **3.2** Test dark/light/system themes
- [ ] **3.3** Test 12h/24h time format throughout
- [ ] **3.4** PWA: verify manifest + service worker
- [ ] **3.5** Test offline behavior with cached data
- [ ] **3.6** Run through all P0 test cases

## Phase 4 — Ship
- [ ] Git commit with version bump
- [ ] Deploy to hosting
- [ ] Verify production build
