# Ramadan Taqwim — Test Plan

## Priority Levels
- **P0**: Must pass before any deploy
- **P1**: Should pass for release
- **P2**: Nice to have

---

## P0 — Critical

| ID | Test Case | Page | Steps |
|----|-----------|------|-------|
| P0-1 | Ramadan override: Day 1 = 19-02-2026 | Today | Load app on Feb 19 2026 → verify hijriDay=1, isRamadan=true |
| P0-2 | Sehri/Iftar times correct | Today | Compare SehriEnds/Iftar to AlAdhan raw Imsak/Maghrib for Dhaka |
| P0-3 | Countdown updates every second | Today | Watch countdown for 5s → values decrease monotonically |
| P0-4 | Settings save triggers fetch | Settings | Change city, save → verify new data loads, only 1 API call |
| P0-5 | Offline: cached data renders | Today | Disconnect network → reload → prayer times still visible |
| P0-6 | Cache key change invalidates | Settings | Change method → save → verify fresh data fetched |
| P0-7 | SehriEnds = Imsak (or Fajr fallback) | Today | If API returns Imsak, SehriEnds = Imsak. If no Imsak, = Fajr |

## P1 — Important

| ID | Test Case | Page | Steps |
|----|-----------|------|-------|
| P1-1 | Hero toggle switches view | Today | Tap "Next Prayer" → countdown shows next prayer. Tap "Iftar" → shows iftar |
| P1-2 | Prayer list "Now" highlight | Today | Current prayer row shows "Now" label with gold style |
| P1-3 | Past prayers muted | Today | Prayers before current time have opacity 0.5 |
| P1-4 | Calendar Jump to today | Calendar | Navigate to another month → tap "Today" → scrolls back to current month, today highlighted |
| P1-5 | Calendar This month | Calendar | Navigate away → tap "This month" → returns to current month |
| P1-6 | Calendar Iftar primary | Calendar | Each day row shows Iftar time larger/bolder than Sehri |
| P1-7 | Dua search filters | Duas | Type "iftar" in search → only matching duas shown |
| P1-8 | Copy Arabic to clipboard | Duas | Tap "Copy Arabic" → clipboard contains Arabic text → toast shown |
| P1-9 | Copy Translation | Duas | Tap "Copy Translation" → clipboard contains English → toast shown |
| P1-10 | Quran toggle + undo | Quran | Tap day card → marks complete → undo toast → tap undo → reverts |
| P1-11 | Quran filters | Quran | Tap "Pending" → only incomplete days shown. "Completed" → only done. "All" → all 30 |
| P1-12 | Quran Go to today | Quran | Tap "Go to today" → today's card scrolls into view with highlight |
| P1-13 | Time format 12h/24h | Settings | Switch to 12h → all times show AM/PM. Switch to 24h → 24h format |
| P1-14 | Theme: system | Settings | Set System → matches OS preference. Toggle OS dark/light → app follows |
| P1-15 | Favorite dua persists | Duas | Favorite a dua → reload app → favorites tab shows it |

## P2 — Enhancement

| ID | Test Case | Page | Steps |
|----|-----------|------|-------|
| P2-1 | Fade-edge on category tabs | Duas | Scroll tabs → left/right fade masks appear/disappear |
| P2-2 | Progress bar labels | Today | Progress bar shows start and end times at edges |
| P2-3 | Transparency footer complete | Today | Shows "City · Method · School" below prayer list |
| P2-4 | Nav tab icons render | All | Each nav tab shows emoji icon + text label |
| P2-5 | PWA installable | All | Lighthouse audit → PWA criteria met |
| P2-6 | Build size ≤ 50 KB | Build | Run `bun run build` → check dist/app.js size |
| P2-7 | Reduced motion respected | All | Set prefers-reduced-motion → no animations |
| P2-8 | Focus visible ring | All | Tab through UI → gold focus ring on interactive elements |
