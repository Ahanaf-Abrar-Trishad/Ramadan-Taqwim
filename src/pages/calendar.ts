// src/pages/calendar.ts

import { appStore } from '../app';
import { createDayRow } from '../components/day-row';
import { createLoadingSkeleton } from '../components/loading-skeleton';
import { loadMonthData } from '../services/cache-manager';
import { h, render } from '../utils/dom';
import { currentYear, currentMonth, monthName } from '../utils/date';

let displayYear = currentYear();
let displayMonth = currentMonth();

export function renderCalendarPage(container: HTMLElement): void {
  const state = appStore.getState();
  const fragment = document.createDocumentFragment();

  // Page title
  fragment.appendChild(h('h1', { className: 'page-title' }, 'Calendar'));

  // Month navigation
  const nav = h('div', { className: 'month-nav' });

  const prevBtn = h('button', { className: 'month-nav-btn', 'aria-label': 'Previous month' }, '◀');
  prevBtn.addEventListener('click', () => changeMonth(-1, container));

  const title = h('span', { className: 'month-nav-title' },
    `${monthName(displayMonth)} ${displayYear}`
  );

  const nextBtn = h('button', { className: 'month-nav-btn', 'aria-label': 'Next month' }, '▶');
  nextBtn.addEventListener('click', () => changeMonth(1, container));

  nav.appendChild(prevBtn);
  nav.appendChild(title);
  nav.appendChild(nextBtn);
  fragment.appendChild(nav);

  // Action bar: Jump to today + This month
  const isCurrentMonth = displayYear === currentYear() && displayMonth === currentMonth();
  if (!isCurrentMonth) {
    const actions = h('div', { className: 'calendar-actions' });
    const todayBtn = h('button', { className: 'calendar-action-btn' }, '📍 Jump to today');
    todayBtn.addEventListener('click', () => {
      displayYear = currentYear();
      displayMonth = currentMonth();
      renderCalendarPage(container);
      requestAnimationFrame(() => {
        const todayRow = container.querySelector('#today-row');
        if (todayRow) todayRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
    const thisMonthBtn = h('button', { className: 'calendar-action-btn' }, '📅 This month');
    thisMonthBtn.addEventListener('click', () => {
      displayYear = currentYear();
      displayMonth = currentMonth();
      renderCalendarPage(container);
    });
    actions.appendChild(todayBtn);
    actions.appendChild(thisMonthBtn);
    fragment.appendChild(actions);
  }

  // Determine which month data to show
  const monthData = getDisplayMonthData();

  if (!monthData) {
    if (state.isLoading) {
      fragment.appendChild(createLoadingSkeleton());
    } else {
      const loading = h('div', { className: 'error-state' });
      loading.appendChild(h('div', { className: 'error-message' }, 'Loading calendar data...'));
      fragment.appendChild(loading);
      fetchDisplayMonth(container);
    }
    render(container, fragment as unknown as Node);
    return;
  }

  // Render day rows
  for (const day of monthData.days) {
    fragment.appendChild(createDayRow(day));
  }

  render(container, fragment as unknown as Node);

  // Auto-scroll to today if visible
  if (isCurrentMonth) {
    requestAnimationFrame(() => {
      const todayRow = container.querySelector('#today-row');
      if (todayRow) todayRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}

function getDisplayMonthData() {
  const state = appStore.getState();

  if (state.currentMonthData) {
    // Check if current month data matches display month
    const firstDay = state.currentMonthData.days[0];
    if (firstDay) {
      const [, mm, yyyy] = firstDay.dateGregorian.split('-').map(Number);
      if (mm === displayMonth && yyyy === displayYear) {
        return state.currentMonthData;
      }
    }
  }

  if (state.otherMonthData) {
    const firstDay = state.otherMonthData.days[0];
    if (firstDay) {
      const [, mm, yyyy] = firstDay.dateGregorian.split('-').map(Number);
      if (mm === displayMonth && yyyy === displayYear) {
        return state.otherMonthData;
      }
    }
  }

  return null;
}

async function fetchDisplayMonth(container: HTMLElement): Promise<void> {
  const settings = appStore.getState().settings;
  appStore.setState({ isLoading: true });

  const result = await loadMonthData(settings, displayYear, displayMonth);
  if (result.data) {
    // Store as "other" month data to not overwrite current
    appStore.setState({ otherMonthData: result.data, isLoading: false });
  } else {
    appStore.setState({ isLoading: false, error: result.error || 'Failed to load calendar' });
  }

  renderCalendarPage(container);
}

function changeMonth(delta: number, container: HTMLElement): void {
  displayMonth += delta;
  if (displayMonth > 12) { displayMonth = 1; displayYear++; }
  if (displayMonth < 1) { displayMonth = 12; displayYear--; }
  renderCalendarPage(container);
}

export function resetCalendarMonth(): void {
  displayYear = currentYear();
  displayMonth = currentMonth();
}
