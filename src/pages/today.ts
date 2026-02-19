// src/pages/today.ts

import type { DayTiming, NextPrayer } from '../types/timings';
import type { AppSettings } from '../types/settings';
import { appStore } from '../app';
import { getNextPrayer, getSehriIftarCountdown } from '../services/prayer-engine';
import { createSehriIftarHero } from '../components/sehri-iftar-hero';
import {
  createCountdownHero, updateCountdownHero,
  type HeroMode,
} from '../components/countdown-timer';
import { createPrayerList } from '../components/prayer-card';
import { createTransparencyFooter } from '../components/transparency-footer';
import { createLoadingSkeleton } from '../components/loading-skeleton';
import { h, render } from '../utils/dom';
import { todayDDMMYYYY, todayReadable } from '../utils/date';
import { APP_NAME } from '../utils/constants';

let countdownInterval: number | null = null;
let heroMode: HeroMode = 'iftar';

/**
 * Get previous day's Isha time from month data for accurate progress bars
 */
function getPrevDayIsha(day: DayTiming): string | undefined {
  const state = appStore.getState();
  const [dd, mm, yyyy] = day.dateGregorian.split('-').map(Number);
  const prevDate = new Date(yyyy, mm - 1, dd - 1);
  const prevKey = `${String(prevDate.getDate()).padStart(2, '0')}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${prevDate.getFullYear()}`;

  for (const source of [state.currentMonthData, state.otherMonthData]) {
    if (!source) continue;
    const found = source.days.find(d => d.dateGregorian === prevKey);
    if (found) return found.prayers.Isha;
  }
  return undefined;
}

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

  // Sehri / Iftar hero cards
  fragment.appendChild(createSehriIftarHero(day.prayers));

  // Single countdown hero with toggle
  const siCountdown = getSehriIftarCountdown(day, getPrevDayIsha(day));
  const nextPrayer = getNextPrayer(day, getPrevDayIsha(day));

  // If not Ramadan, default to next-prayer mode
  if (!siCountdown) heroMode = 'next-prayer';

  const heroSection = createCountdownHero(siCountdown, nextPrayer, heroMode);

  // Attach toggle handlers
  const toggleBtns = heroSection.querySelectorAll('.toggle-pill');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      heroMode = btn.textContent === 'Iftar' ? 'iftar' : 'next-prayer';
      // Re-render hero
      const newHero = createCountdownHero(
        getSehriIftarCountdown(day, getPrevDayIsha(day)),
        getNextPrayer(day, getPrevDayIsha(day)),
        heroMode
      );
      // Attach handlers to new hero
      newHero.querySelectorAll('.toggle-pill').forEach(b => {
        b.addEventListener('click', () => {
          heroMode = b.textContent === 'Iftar' ? 'iftar' : 'next-prayer';
          renderTodayPage(container);
        });
      });
      heroSection.replaceWith(newHero);
    });
  });

  fragment.appendChild(heroSection);

  // Prayer list
  fragment.appendChild(createPrayerList(day, nextPrayer));

  // Ramadan day counter
  if (day.isRamadan && day.ramadanDay) {
    const counter = h('div', { className: 'ramadan-counter' });
    counter.innerHTML = `Day <strong>${day.ramadanDay}</strong> of Ramaḍān`;
    fragment.appendChild(counter);
  } else if (day.isRamadan) {
    const counter = h('div', { className: 'ramadan-counter' });
    counter.innerHTML = `Day <strong>${day.hijriDay}</strong> of Ramaḍān`;
    fragment.appendChild(counter);
  }

  // Transparency footer
  fragment.appendChild(createTransparencyFooter(settings));

  render(container, fragment as unknown as Node);

  // Start countdown interval (1s)
  const heroEl = container.querySelector('.countdown-hero') as HTMLElement;
  countdownInterval = window.setInterval(() => {
    const updatedSI = getSehriIftarCountdown(day, getPrevDayIsha(day));
    const updated = getNextPrayer(day, getPrevDayIsha(day));

    if (heroEl) {
      updateCountdownHero(heroEl, updatedSI, updated, heroMode);
    }

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
