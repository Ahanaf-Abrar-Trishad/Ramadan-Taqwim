// src/components/prayer-card.ts

import type { DayTiming, PrayerName, NextPrayer } from '../types/timings';
import { PRAYER_NAMES } from '../types/timings';
import { isPrayerPast, isNextPrayer } from '../services/prayer-engine';
import { formatTime } from '../utils/time';
import { appStore } from '../app';
import { h } from '../utils/dom';

export function createPrayerList(day: DayTiming, nextPrayer: NextPrayer | null): HTMLElement {
  const list = h('div', { className: 'prayer-list' });
  const tf = appStore.getState().settings.timeFormat;

  for (const name of PRAYER_NAMES) {
    const time = day.prayers[name];
    const past = isPrayerPast(time);
    const isNow = isNextPrayer(name, nextPrayer);

    const card = h('div', {
      className: `prayer-card${past && !isNow ? ' past' : ''}${isNow ? ' now' : ''}`,
    });

    // Left: status icon + name + optional "Now" badge
    const left = h('div', { className: 'prayer-left' });
    if (past && !isNow) {
      left.appendChild(h('span', { className: 'prayer-done-icon' }, '✓'));
    }
    left.appendChild(h('span', { className: 'prayer-name' }, name));
    if (isNow) {
      left.appendChild(h('span', { className: 'prayer-now-badge' }, 'Now'));
    }

    // Right: time
    const timeEl = h('span', { className: 'prayer-time' }, formatTime(time, tf));

    card.appendChild(left);
    card.appendChild(timeEl);
    list.appendChild(card);
  }

  return list;
}
