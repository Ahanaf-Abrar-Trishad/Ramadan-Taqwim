// src/components/day-details-sheet.ts

import type { DayTiming, PrayerName } from '../types/timings';
import { PRAYER_NAMES } from '../types/timings';
import { formatTime } from '../utils/time';
import { appStore } from '../app';
import { h } from '../utils/dom';

/**
 * Create a bottom sheet overlay showing full day details
 */
export function showDayDetailsSheet(day: DayTiming): void {
  // Remove any existing sheet
  closeDayDetailsSheet();

  const tf = appStore.getState().settings.timeFormat;

  // Backdrop
  const backdrop = h('div', { className: 'sheet-backdrop' });
  backdrop.addEventListener('click', closeDayDetailsSheet);

  // Sheet
  const sheet = h('div', { className: 'day-details-sheet' });

  // Handle
  sheet.appendChild(h('div', { className: 'sheet-handle' }));

  // Header
  const header = h('div', { className: 'sheet-header' });
  header.appendChild(h('div', { className: 'sheet-title' }, day.dateReadable));
  header.appendChild(h('div', { className: 'sheet-subtitle' }, `${day.weekday} · ${day.hijriDisplay}`));
  if (day.isRamadan && day.ramadanDay) {
    header.appendChild(h('div', { className: 'sheet-ramadan-day' }, `Day ${day.ramadanDay} of Ramaḍān`));
  }
  sheet.appendChild(header);

  // Sehri / Iftar highlight
  if (day.isRamadan) {
    const hero = h('div', { className: 'sheet-hero' });
    const sehriCard = h('div', { className: 'sheet-hero-card' });
    sehriCard.appendChild(h('div', { className: 'sheet-hero-label' }, 'Sehri ends'));
    sehriCard.appendChild(h('div', { className: 'sheet-hero-time' }, formatTime(day.prayers.SehriEnds, tf)));
    hero.appendChild(sehriCard);

    const iftarCard = h('div', { className: 'sheet-hero-card iftar' });
    iftarCard.appendChild(h('div', { className: 'sheet-hero-label' }, 'Iftar'));
    iftarCard.appendChild(h('div', { className: 'sheet-hero-time' }, formatTime(day.prayers.Iftar, tf)));
    hero.appendChild(iftarCard);
    sheet.appendChild(hero);
  }

  // All prayer times
  const prayerList = h('div', { className: 'sheet-prayer-list' });
  for (const name of PRAYER_NAMES) {
    const time = day.prayers[name];
    const row = h('div', { className: 'sheet-prayer-row' });
    row.appendChild(h('span', { className: 'sheet-prayer-name' }, name));
    row.appendChild(h('span', { className: 'sheet-prayer-time' }, formatTime(time, tf)));
    prayerList.appendChild(row);
  }
  sheet.appendChild(prayerList);

  // Holidays
  if (day.holidays.length > 0) {
    const holidays = h('div', { className: 'sheet-holidays' });
    for (const hol of day.holidays) {
      holidays.appendChild(h('span', { className: 'sheet-holiday-badge' }, hol));
    }
    sheet.appendChild(holidays);
  }

  // Close button
  const closeBtn = h('button', { className: 'sheet-close-btn' }, 'Close');
  closeBtn.addEventListener('click', closeDayDetailsSheet);
  sheet.appendChild(closeBtn);

  document.body.appendChild(backdrop);
  document.body.appendChild(sheet);

  // Trigger animation
  requestAnimationFrame(() => {
    backdrop.classList.add('show');
    sheet.classList.add('show');
  });
}

export function closeDayDetailsSheet(): void {
  const backdrop = document.querySelector('.sheet-backdrop');
  const sheet = document.querySelector('.day-details-sheet');
  if (backdrop) {
    backdrop.classList.remove('show');
    setTimeout(() => backdrop.remove(), 300);
  }
  if (sheet) {
    sheet.classList.remove('show');
    setTimeout(() => sheet.remove(), 300);
  }
}
