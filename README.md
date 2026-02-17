# ☪ Ramadan Taqwim

**Accurate prayer times, Sehri/Iftar countdowns, duas, and a 30-day Quran reading plan for all 64 districts of Bangladesh.**

A mobile-first Progressive Web App built with vanilla TypeScript and Bun — no framework, no runtime dependencies, under 50 KB.

![Version](https://img.shields.io/badge/version-1.1.0-D4A853)
![Build](https://img.shields.io/badge/build-43.8_KB-00BA7C)
![License](https://img.shields.io/badge/license-MIT-1D9BF0)

---

## Features

### 🕌 Today
- **Sehri & Iftar hero cards** with live countdown timer (updates every second)
- **Toggle pill** to switch between Iftar countdown and Next Prayer countdown
- **Labeled progress bar** showing start → end times
- **Two-column prayer list** — past prayers muted, current prayer highlighted with a gold "Now" badge
- Ramadan day counter

### 📅 Calendar
- Month-by-month list view for all prayer times
- **Iftar as primary** (bold, gold), Sehri as secondary
- Today row auto-highlighted with gold border and "TODAY" badge
- "Jump to today" and "This month" action buttons
- Special badges for Lailat-ul-Qadr and Eid

### 🤲 Duas
- 10 curated duas across Sehri, Iftar, General, and Laylatul Qadr categories
- **Search** by title, transliteration, or translation
- **Copy Arabic** or **Copy Translation** to clipboard with confirmation toast
- Favorite toggle (persisted in IndexedDB)
- Horizontally scrollable tabs with fade-edge masks

### 📖 Quran Plan
- 30-day reading plan covering the entire Quran (Juz-based)
- **Filter pills**: All / Pending / Completed
- **"Go to today"** button scrolls to the current Ramadan day
- Tap any card to toggle completion with a **4-second undo toast**
- Progress bar with completion count

### ⚙ Settings
- **City picker** — all 64 Bangladesh districts
- **Calculation method** — recommended methods starred (Karachi, MWL, ISNA, Egyptian)
- **Asr school** — Hanafi / Shafi'i
- **Theme** — Dark / Light / System (follows OS preference)
- **Time format** — 12-hour (4:52 AM) / 24-hour (04:52)
- Data transparency footer

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript (vanilla, no framework) |
| Runtime | [Bun](https://bun.sh) |
| Bundler | Bun.build (minified) |
| API | [AlAdhan Prayer Times API](https://aladhan.com/prayer-times-api) |
| Storage | IndexedDB (prayer data, favorites, Quran progress) + localStorage (settings) |
| Routing | Hash-based SPA (`#/`, `#/calendar`, `#/duas`, `#/quran`, `#/settings`) |
| Styling | Vanilla CSS with custom properties, dark/light themes |
| Fonts | Inter (UI) + Amiri (Arabic) via Google Fonts |

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.0+

### Install & Run

```bash
# Clone
git clone https://github.com/Ahanaf-Abrar-Trishad/Ramadan-Taqwim.git
cd Ramadan-Taqwim

# Install dependencies
bun install

# Build (outputs to dist/)
bun run build

# Preview locally
bun run preview
```

The app will be served at `http://localhost:3000`.

### Development

```bash
# Build + serve
bun run dev
```

---

## Project Structure

```
ramadan-bd/
├── src/
│   ├── api/            # AlAdhan API client & normalizer
│   ├── components/     # UI components (countdown, prayer cards, etc.)
│   ├── data/           # Static JSON (cities, duas, quran plan)
│   ├── pages/          # Page renderers (today, calendar, duas, quran, settings)
│   ├── services/       # Prayer engine, cache manager, offline detector
│   ├── store/          # IndexedDB & localStorage stores
│   ├── styles/         # CSS (global tokens, components, pages)
│   ├── types/          # TypeScript interfaces
│   ├── utils/          # Helpers (time, date, DOM, constants)
│   ├── app.ts          # Pub/sub state store
│   ├── main.ts         # App entry point
│   └── router.ts       # Hash-based SPA router
├── public/             # Static assets (manifest, favicon)
├── docs/               # Spec documents
│   ├── 01-mcp-spec.md
│   ├── 02-ui-ux-spec.md
│   ├── 03-engineering-blueprint.md
│   ├── 04-test-plan.md
│   └── 05-build-checklist.md
├── dist/               # Build output
├── build.ts            # Bun build script
├── index.html          # HTML shell
├── tsconfig.json
└── package.json
```

---

## Ramadan 2026 Override

The app includes a hardcoded override for Bangladesh: **Ramadan 1447 starts on 19 February 2026** (1 Ramadan), matching local moon-sighting expectations. This ensures Sehri/Iftar countdowns and day numbering are accurate regardless of API hijri calendar variations.

---

## Offline Support

- Prayer data is cached in IndexedDB with a **24-hour TTL**
- Stale-while-revalidate strategy: cached data is shown immediately while fresh data is fetched in the background
- An offline banner appears when the device loses connectivity
- PWA manifest enables home screen installation

---

## API Attribution

Prayer time data is provided by [AlAdhan.com](https://aladhan.com). The app fetches monthly calendar data using the `/v1/calendarByCity` endpoint and calculation methods via `/v1/methods`.

---

## License

MIT
