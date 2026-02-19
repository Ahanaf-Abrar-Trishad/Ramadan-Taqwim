// src/components/calendar-grid.ts

import type { DayTiming } from '../types/timings';
import { todayDDMMYYYY } from '../utils/date';
import { h } from '../utils/dom';

/**
 * Create a 7-column calendar grid for a month of days
 */
export function createCalendarGrid(
  days: DayTiming[],
  onDayClick: (day: DayTiming) => void,
): HTMLElement {
  const grid = h('div', { className: 'calendar-grid' });

  // Weekday headers
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (const wd of weekdays) {
    grid.appendChild(h('div', { className: 'cal-grid-header' }, wd));
  }

  if (days.length === 0) return grid;

  // Determine the starting day of week for the first date
  const first = days[0];
  const [dd, mm, yyyy] = first.dateGregorian.split('-').map(Number);
  const firstDow = new Date(yyyy, mm - 1, dd).getDay(); // 0=Sun

  // Empty spacers for offset
  for (let i = 0; i < firstDow; i++) {
    grid.appendChild(h('div', { className: 'cal-grid-spacer' }));
  }

  const todayKey = todayDDMMYYYY();

  for (const day of days) {
    const dayNum = parseInt(day.dateGregorian.split('-')[0], 10);
    const isToday = day.dateGregorian === todayKey;
    const isRamadan = day.isRamadan;
    const hasHoliday = day.holidays.length > 0;

    let className = 'cal-grid-cell';
    if (isToday) className += ' today';
    if (!isRamadan) className += ' non-ramadan';
    if (hasHoliday) className += ' holiday';

    const cell = h('button', { className, 'aria-label': day.dateReadable });

    cell.appendChild(h('span', { className: 'cal-grid-day' }, String(dayNum)));

    if (day.isRamadan && day.ramadanDay) {
      cell.appendChild(h('span', { className: 'cal-grid-ramadan' }, `R${day.ramadanDay}`));
    }

    cell.addEventListener('click', () => onDayClick(day));
    grid.appendChild(cell);
  }

  return grid;
}
