// src/pages/today.ts

import type { DayTiming, NextPrayer } from '../types/timings';
import type { AppSettings } from '../types/settings';
import { appStore } from '../app';
import { getNextPrayer } from '../services/prayer-engine';
import { createSehriIftarHero } from '../components/sehri-iftar-hero';
import { createCountdownSection, updateCountdown } from '../components/countdown-timer';
import { createPrayerList } from '../components/prayer-card';
import { createTransparencyFooter } from '../components/transparency-footer';
import { createLoadingSkeleton } from '../components/loading-skeleton';
import { h, render } from '../utils/dom';
import { todayDDMMYYYY, todayReadable } from '../utils/date';
import { APP_NAME } from '../utils/constants';

let countdownInterval: number | null = null;

export function renderTodayPage(container: HTMLElement): void {
  const state = appStore.getState();

  // Clear previous interval
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  // Loading state
  if (state.isLoading && !state.todayData) {
    render(container, createLoadingSkeleton());
    return;
  }

  // Error state without data
  if (state.error && !state.todayData) {
    const errorEl = h('div', { className: 'error-state' });
    errorEl.appendChild(h('div', { className: 'error-icon' }, '⚠'));
    errorEl.appendChild(h('div', { className: 'error-message' }, state.error));
    const retryBtn = h('button', { className: 'btn-retry' }, 'Try Again');
    retryBtn.addEventListener('click', () => {
      window.location.reload();
    });
    errorEl.appendChild(retryBtn);
    render(container, errorEl);
    return;
  }

  const day = state.todayData;
  if (!day) {
    render(container, createLoadingSkeleton());
    return;
  }

  const settings = state.settings;
  const fragment = document.createDocumentFragment();

  // Header
  const header = h('header', { className: 'page-header' });
  header.appendChild(h('div', { className: 'app-name' }, `☪ ${APP_NAME}`));
  header.appendChild(h('div', { className: 'hijri-date' }, day.hijriDisplay));
  header.appendChild(h('div', { className: 'greg-date' }, todayReadable()));
  fragment.appendChild(header);

  // Sehri / Iftar hero
  fragment.appendChild(createSehriIftarHero(day.prayers));

  // Countdown
  const nextPrayer = getNextPrayer(day);
  const countdownSection = createCountdownSection(nextPrayer);
  fragment.appendChild(countdownSection);

  // Prayer list
  fragment.appendChild(createPrayerList(day, nextPrayer));

  // Ramadan day counter
  if (day.isRamadan) {
    const counter = h('div', { className: 'ramadan-counter' });
    counter.innerHTML = `Day <strong>${day.hijriDay}</strong> of Ramaḍān`;
    fragment.appendChild(counter);
  }

  // Transparency footer
  fragment.appendChild(createTransparencyFooter(settings));

  render(container, fragment as unknown as Node);

  // Start countdown interval (1s)
  countdownInterval = window.setInterval(() => {
    const updated = getNextPrayer(day);
    updateCountdown(countdownSection, updated);

    // If next prayer changed, re-render the prayer list
    if (updated?.name !== nextPrayer?.name) {
      const listContainer = container.querySelector('.prayer-list');
      if (listContainer) {
        const newList = createPrayerList(day, updated);
        listContainer.replaceWith(newList);
      }
    }
  }, 1000);
}

export function destroyTodayPage(): void {
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

/**
 * Find today's data in the month timings
 */
export function findTodayData(): DayTiming | null {
  const state = appStore.getState();
  const todayKey = todayDDMMYYYY();

  if (state.currentMonthData) {
    const found = state.currentMonthData.days.find(d => d.dateGregorian === todayKey);
    if (found) return found;
  }

  if (state.otherMonthData) {
    const found = state.otherMonthData.days.find(d => d.dateGregorian === todayKey);
    if (found) return found;
  }

  return null;
}
