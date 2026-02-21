# Ramadan Taqwim — UI/UX Spec

## Design System Tokens

### Colors (Dark — default)
| Token | Value | Usage |
|-------|-------|-------|
| --bg-primary | #0F1419 | Page background |
| --bg-secondary | #1A2332 | Cards, surfaces |
| --bg-tertiary | #243447 | Inputs, borders, bar tracks |
| --text-primary | #E7E9EA | Headings, body |
| --text-secondary | #8B98A5 | Labels |
| --text-muted | #536471 | Past prayers, hints |
| --accent-gold | #D4A853 | CTAs, active states, Iftar |
| --accent-green | #00BA7C | Completed, success |
| --accent-blue | #1D9BF0 | Links |
| --accent-red | #F4212E | Reset, destructive |
| --accent-purple | #a99bea | Sehri countdown |
| --border | #2F3336 | Dividers |
| --surface-highlight | rgba(212,168,83,0.12) | Selected row bg |

### Colors (Light)
| Token | Value |
|-------|-------|
| --bg-primary | #FFFFFF |
| --bg-secondary | #F7F9FA |
| --bg-tertiary | #EFF3F4 |
| --text-primary | #0F1419 |
| --accent-gold | #B8860B |

### Typography
| Token | Value |
|-------|-------|
| --font-family | Inter, system stack |
| --font-arabic | Amiri, Traditional Arabic, serif |
| Font sizes | xs 0.75 / sm 0.875 / base 1 / lg 1.25 / xl 1.5 / 2xl 2 / 3xl 2.5 rem |

### Spacing
4 / 8 / 12 / 16 / 24 / 32 / 48 px

### Layout
| Property | Value |
|----------|-------|
| Max width | 480px |
| Nav height | 64px |
| Min tap target | 44px |
| Border radius | 8 / 12 / 16 / 9999 px |

---

## Component Library

### 1. `<BottomNav>` — nav-bar.ts
5 tabs: Today (🕌), Calendar (📅), Duas (🤲), Quran (📖), Settings (⚙). Fixed bottom. Active = gold. Each tab ≥ 44px.

### 2. `<SehriIftarHero>` — sehri-iftar-hero.ts
Two-card grid. Left = Sehri Ends (time + "Fajr" sublabel). Right = Iftar (time). Gold border, decorative circle overlay.

### 3. `<CountdownHero>` — countdown-timer.ts (rewritten)
Single card. Shows primary event countdown (Sehri Ends / Iftar during Ramadan, or Next Prayer). Toggle pill: "Iftar | Next Prayer". Progress bar with start/end time labels beneath. Large tabular-nums display.

### 4. `<PrayerList>` — prayer-card.ts (rewritten)
6 rows (Fajr → Isha). Two-column: name left, time right (tabular-nums, right-aligned). States:
- Past: opacity 0.5, check mark
- Now: gold highlight row, "Now" label badge
- Upcoming: normal

### 5. `<DayRow>` — day-row.ts
Calendar row. Header: Date · Weekday | Hijri. Times: Iftar (primary, bold gold) | Sehri Ends (secondary). Badges: TODAY, Laylat al-Qadr, Eid.

### 6. `<DuaCard>` — dua-card.ts (enhanced)
Arabic block (Amiri, ≥1.5rem, RTL, padded bg). Transliteration (normal weight, muted color — NOT gold italic). Translation. Source. Actions row: Copy Arabic, Copy Translation, Favorite heart.

### 7. `<QuranDayCard>` — quran-day-card.ts (enhanced)
Full card tappable. Day · Juz | Surah range | Pages. Completed = green left border + reduced opacity. Today = gold left border highlight.

### 8. `<CategoryTabs>` — inline in duas.ts
Horizontal scroll, fade-edge masks (CSS gradient overlays). Pill style. Active = gold bg.

### 9. `<QuranFilters>` — inline in quran.ts
Three filter pills: All / Pending / Completed. Active = gold border.

### 10. `<SearchInput>` — inline in duas.ts
Full-width input, magnifying glass icon, bg-secondary background, rounded corners.

### 11. `<Toast>` — global
Fixed top-center. Fade in/out. Optional "Undo" action button for Quran toggles.

### 12. `<TransparencyFooter>` — transparency-footer.ts
City · Method · School. Below prayer list on Today page.

---

## Screen Layouts

### Today
```
┌─────────────────────┐
│  ☪ Ramadan Taqwim   │
│  14 Ramadan 1447     │
│  10 March 2026       │
├──────────┬──────────┤
│ Sehri    │  Iftar   │
│ 04:52    │  18:02   │
├──────────┴──────────┤
│  ▼ IFTAR IN         │
│  5h 32m 14s         │
│  ━━━━━━━━░░░░░░     │
│  04:52        18:02 │
│  [Iftar] [Next Prayer]
├─────────────────────┤
│ Fajr          04:55 │ ← muted ✓
│ Sunrise       06:12 │ ← muted ✓
│ Dhuhr    Now  12:10 │ ← highlighted
│ Asr           15:45 │
│ Maghrib       18:02 │
│ Isha          19:15 │
├─────────────────────┤
│ Day 14 of Ramadan   │
├─────────────────────┤
│ Dhaka · Karachi · H │
└─────────────────────┘
```

### Calendar
```
┌─────────────────────┐
│ Calendar            │
│ ◀ March 2026 ▶ [Today]
├─────────────────────┤
│ 1 Mar · Sun  1 Ram  │
│ Iftar 18:02  S 04:52│
├─────────────────────┤
│ 2 Mar · Mon ★TODAY  │
│ Iftar 18:03  S 04:51│
├─────────────────────┤
```

### Duas
```
┌─────────────────────┐
│ Duas                │
│ [🔍 Search duas...] │
│ ‹ Sehri Iftar Gen ▸ │
├─────────────────────┤
│ Dua Title           │
│ ┌─────────────────┐ │
│ │ Arabic RTL text │ │
│ └─────────────────┘ │
│ transliteration     │
│ English translation │
│ 📖 Source           │
│ [Copy AR][Copy EN]♥│
└─────────────────────┘
```
