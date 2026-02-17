// src/components/prayer-card.ts

import type { DayTiming, PrayerName, NextPrayer } from '../types/timings';
import { PRAYER_NAMES } from '../types/timings';
import { isPrayerPast, isNextPrayer } from '../services/prayer-engine';
import { h } from '../utils/dom';

export function createPrayerList(day: DayTiming, nextPrayer: NextPrayer | null): HTMLElement {
  const list = h('div', { className: 'prayer-list' });

  for (const name of PRAYER_NAMES) {
    const time = day.prayers[name];
    const past = isPrayerPast(time);
    const next = isNextPrayer(name, nextPrayer);

    const card = h('div', {
      className: `prayer-card${past ? ' past' : ''}${next ? ' next' : ''}`,
    });

    const nameEl = h('span', { className: 'prayer-name' }, name);

    const right = h('span', null);
    const timeEl = h('span', { className: 'prayer-time' }, time);
    right.appendChild(timeEl);

    if (past && !next) {
      const check = h('span', { className: 'prayer-indicator', 'aria-label': 'Passed' }, ' ✓');
      right.appendChild(check);
    } else if (next) {
      const arrow = h('span', { className: 'prayer-indicator', 'aria-label': 'Next prayer' }, ' ←');
      right.appendChild(arrow);
    }

    card.appendChild(nameEl);
    card.appendChild(right);
    list.appendChild(card);
  }

  return list;
}
