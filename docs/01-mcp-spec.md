# Ramadan Taqwim — MCP Spec & Acceptance Criteria

## Product Summary
Ramadan Taqwim: a mobile-first PWA for Bangladeshi Muslims showing Ramadan prayer times, Sehri/Iftar countdowns, a 30-day Quran plan, and curated duas. Data from AlAdhan API. Offline-capable via IndexedDB caching.

---

## Page Specs & Acceptance Criteria

### 1. Today (#/)
| # | Criterion | Done |
|---|-----------|------|
| T1 | Single hero countdown shows the next Ramadan event (Sehri Ends / Iftar) with remaining time, progress bar, and start/end time labels | ☐ |
| T2 | Small toggle pill inside hero lets user switch between "Iftar" and "Next Prayer" views | ☐ |
| T3 | Progress bar shows labeled start time (left) and end time (right) | ☐ |
| T4 | Two-column prayer list: name left, time right-aligned with tabular numerals | ☐ |
| T5 | Past prayers muted (opacity 0.5), current prayer highlighted with gold "Now" label | ☐ |
| T6 | Upcoming prayers normal weight | ☐ |
| T7 | Sehri Ends / Iftar hero cards still visible above countdown | ☐ |
| T8 | Ramadan day counter visible during Ramadan | ☐ |
| T9 | Trust footer: City · Method · School · Offsets status | ☐ |
| T10 | Countdown updates every 1 second without re-rendering full page | ☐ |
| T11 | SehriEnds always equals Fajr time (no Imsak) | ☐ |

### 2. Calendar (#/calendar)
| # | Criterion | Done |
|---|-----------|------|
| C1 | List view on mobile — each row: Date · Weekday, Hijri, Sehri Ends, Iftar | ☐ |
| C2 | Iftar is the primary (large/bold) value; Sehri Ends is secondary | ☐ |
| C3 | Strong "Today" highlight with gold left border and "TODAY" badge | ☐ |
| C4 | "Jump to today" button appears when today's row is not visible | ☐ |
| C5 | Month nav buttons have ≥ 44px hit areas | ☐ |
| C6 | "This month" action resets to current month | ☐ |
| C7 | Non-Ramadan days shown at 60% opacity | ☐ |
| C8 | Special day badges: Lailat-ul-Qadr, Eid | ☐ |

### 3. Duas (#/duas)
| # | Criterion | Done |
|---|-----------|------|
| D1 | Horizontally scrollable category tabs with fade-edge masks | ☐ |
| D2 | Search input filters duas by title, transliteration, or translation | ☐ |
| D3 | Each dua card: Arabic (≥1.5rem, Amiri, RTL, padded bg), transliteration, translation, source | ☐ |
| D4 | Copy Arabic button copies Arabic text to clipboard with toast | ☐ |
| D5 | Copy Translation button copies English translation with toast | ☐ |
| D6 | Favorite toggle persists in IndexedDB | ☐ |
| D7 | Transliteration not gold italic — use normal weight muted color | ☐ |

### 4. Quran Plan (#/quran)
| # | Criterion | Done |
|---|-----------|------|
| Q1 | Progress bar with "X/30 days complete" text | ☐ |
| Q2 | "Go to today" action scrolls/highlights today's card | ☐ |
| Q3 | Today's card has visual highlight (gold left border) | ☐ |
| Q4 | Entire card tappable to toggle completed | ☐ |
| Q5 | Undo toast appears for 4s after toggling with "Undo" button | ☐ |
| Q6 | Filter tabs: All / Pending / Completed | ☐ |
| Q7 | Reset button with confirmation dialog | ☐ |

### 5. Settings (#/settings)
| # | Criterion | Done |
|---|-----------|------|
| S1 | City picker: 64 Bangladesh districts, searchable dropdown | ☐ |
| S2 | Method picker: recommended methods starred | ☐ |
| S3 | Asr school toggle: Hanafi / Shafi | ☐ |
| S4 | Theme: Dark / Light / System | ☐ |
| S5 | Time format: 12h / 24h toggle | ☐ |
| S6 | Save triggers exactly one API fetch if settings changed | ☐ |
| S7 | "Data provided by AlAdhan.com" transparency text in footer | ☐ |

### 6. Global
| # | Criterion | Done |
|---|-----------|------|
| G1 | Bottom nav: 5 tabs with icons, 44px tap targets | ☐ |
| G2 | Offline banner when navigator.onLine is false | ☐ |
| G3 | IndexedDB cache with 24h TTL, stale-while-revalidate | ☐ |
| G4 | PWA: manifest.json, service worker, installable | ☐ |
| G5 | Build output ≤ 50 KB minified JS | ☐ |
| G6 | Ramadan override: 19-02-2026 as Day 1 for Bangladesh | ☐ |
