// src/components/day-row.ts

import type { DayTiming } from '../types/timings';
import { todayDDMMYYYY } from '../utils/date';
import { formatTime } from '../utils/time';
import { appStore } from '../app';
import { h } from '../utils/dom';

const LAYLAT_LABEL = 'Laylat al-Qadr';
const EID_LABEL = 'Eid al-Fitr';

export function createDayRow(day: DayTiming): HTMLElement {
  const isToday = day.dateGregorian === todayDDMMYYYY();
  const isRamadan = day.isRamadan;
  const hasLaylatAlQadr = day.holidays.includes(LAYLAT_LABEL);
  const hasEidAlFitr = day.holidays.includes(EID_LABEL);
  const tf = appStore.getState().settings.timeFormat;

  let className = 'day-row';
  if (isToday) className += ' today';
  if (!isRamadan) className += ' non-ramadan';
  if (hasEidAlFitr) className += ' eid-day';

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
  sehriEl.innerHTML = `Sehri ends <strong>${formatTime(day.prayers.SehriEnds, tf)}</strong>`;
  times.appendChild(iftarEl);
  times.appendChild(sehriEl);
  row.appendChild(times);

  // Ramadan day number
  if (day.isRamadan && day.ramadanDay) {
    row.appendChild(h('span', { className: 'day-row-ramadan-day' }, `Day ${day.ramadanDay} of Ramaḍān`));
  }

  // Badges
  if (isToday) {
    row.appendChild(h('span', { className: 'day-badge today-badge' }, 'TODAY'));
  }
  if (hasLaylatAlQadr) {
    row.appendChild(h('span', { className: 'day-badge holiday-badge' }, '⭐ Laylat al-Qadr'));
  }
  if (hasEidAlFitr) {
    row.appendChild(h('span', { className: 'day-badge eid-badge' }, '🎉 Eid al-Fitr'));
  }

  return row;
}
