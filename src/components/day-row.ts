// src/components/day-row.ts

import type { DayTiming } from '../types/timings';
import { todayDDMMYYYY } from '../utils/date';
import { h } from '../utils/dom';

export function createDayRow(day: DayTiming): HTMLElement {
  const isToday = day.dateGregorian === todayDDMMYYYY();
  const isRamadan = day.isRamadan;
  const hasLailatulQadr = day.holidays.some(h => h.toLowerCase().includes('lailat'));
  const hasEid = day.holidays.some(h => h.toLowerCase().includes('eid'));

  let className = 'day-row';
  if (isToday) className += ' today';
  if (!isRamadan) className += ' non-ramadan';

  const row = h('div', { className });

  // Header: date + hijri
  const header = h('div', { className: 'day-row-header' });
  header.appendChild(h('span', { className: 'day-row-date' },
    `${day.dateReadable} · ${day.weekday}`
  ));
  header.appendChild(h('span', { className: 'day-row-hijri' }, day.hijriDisplay));
  row.appendChild(header);

  // Times
  const times = h('div', { className: 'day-row-times' });
  times.innerHTML = `
    <span>Sehri: <strong>${day.prayers.SehriEnds}</strong></span>
    <span>Iftar: <strong>${day.prayers.Iftar}</strong></span>
    <span>Fajr: <strong>${day.prayers.Fajr}</strong></span>
  `;
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
