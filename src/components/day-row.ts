// src/components/day-row.ts

import type { DayTiming } from '../types/timings';
import { todayDDMMYYYY } from '../utils/date';
import { formatTime } from '../utils/time';
import { appStore } from '../app';
import { h } from '../utils/dom';

export function createDayRow(day: DayTiming): HTMLElement {
  const isToday = day.dateGregorian === todayDDMMYYYY();
  const isRamadan = day.isRamadan;
  const hasLailatulQadr = day.holidays.some(h => h.toLowerCase().includes('lailat'));
  const hasEid = day.holidays.some(h => h.toLowerCase().includes('eid'));
  const tf = appStore.getState().settings.timeFormat;

  let className = 'day-row';
  if (isToday) className += ' today';
  if (!isRamadan) className += ' non-ramadan';

  const row = h('div', { className, id: isToday ? 'today-row' : undefined });

  // Header: date + hijri
  const header = h('div', { className: 'day-row-header' });
  header.appendChild(h('span', { className: 'day-row-date' },
    `${day.dateReadable} · ${day.weekday}`
  ));
  header.appendChild(h('span', { className: 'day-row-hijri' }, day.hijriDisplay));
  row.appendChild(header);

  // Times — Iftar primary, Sehri secondary
  const times = h('div', { className: 'day-row-times' });
  const iftarEl = h('span', { className: 'day-row-iftar' });
  iftarEl.innerHTML = `Iftar <strong>${formatTime(day.prayers.Iftar, tf)}</strong>`;
  const sehriEl = h('span', { className: 'day-row-sehri' });
  sehriEl.innerHTML = `Sehri <strong>${formatTime(day.prayers.SehriEnds, tf)}</strong>`;
  times.appendChild(iftarEl);
  times.appendChild(sehriEl);
  row.appendChild(times);

  // Badges
  if (isToday) {
    row.appendChild(h('span', { className: 'day-badge today-badge' }, 'TODAY'));
  }
  if (hasLailatulQadr) {
    row.appendChild(h('span', { className: 'day-badge holiday-badge' }, '⭐ Lailat-ul-Qadr'));
  }
  if (hasEid) {
    row.appendChild(h('span', { className: 'day-badge eid-badge' }, '🎉 Eid ul-Fitr'));
  }

  return row;
}
