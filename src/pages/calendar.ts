// src/pages/calendar.ts

import { appStore } from '../app';
import { createDayRow } from '../components/day-row';
import { createCalendarGrid } from '../components/calendar-grid';
import { showDayDetailsSheet } from '../components/day-details-sheet';
import { createLoadingSkeleton } from '../components/loading-skeleton';
import { loadMonthData } from '../services/cache-manager';
import { h, render } from '../utils/dom';
import { currentYear, currentMonth, monthName } from '../utils/date';

let displayYear = currentYear();
let displayMonth = currentMonth();
type CalendarView = 'list' | 'grid';
const CALENDAR_VIEW_KEY = 'ramadan-bd-calendar-view';

function parseCalendarView(value: string | null): CalendarView {
  return value === 'list' || value === 'grid' ? value : 'grid';
}

function loadCalendarView(): CalendarView {
  try {
    return parseCalendarView(localStorage.getItem(CALENDAR_VIEW_KEY));
  } catch {
    return 'grid';
  }
}

function saveCalendarView(view: CalendarView): void {
  try {
    localStorage.setItem(CALENDAR_VIEW_KEY, view);
  } catch {
    // Ignore persistence failures (private mode, quota, etc.)
  }
}

let calendarView: CalendarView = loadCalendarView();

export function renderCalendarPage(container: HTMLElement): void {
  const state = appStore.getState();
  const fragment = document.createDocumentFragment();

  // Page title row with view toggle
  const titleRow = h('div', { className: 'calendar-title-row' });
  titleRow.appendChild(h('h1', { className: 'page-title' }, 'Calendar'));

  const viewToggle = h('div', { className: 'view-toggle' });
  const listBtn = h('button', {
    className: `toggle-pill${calendarView === 'list' ? ' active' : ''}`,
    'aria-label': 'List view',
  }, '☰ List');
  const gridBtn = h('button', {
    className: `toggle-pill${calendarView === 'grid' ? ' active' : ''}`,
    'aria-label': 'Grid view',
  }, '▦ Grid');

  listBtn.addEventListener('click', () => {
    calendarView = 'list';
    saveCalendarView(calendarView);
    renderCalendarPage(container);
  });
  gridBtn.addEventListener('click', () => {
    calendarView = 'grid';
    saveCalendarView(calendarView);
    renderCalendarPage(container);
  });

  viewToggle.appendChild(listBtn);
  viewToggle.appendChild(gridBtn);
  titleRow.appendChild(viewToggle);
  fragment.appendChild(titleRow);

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

  // Render day rows or grid based on view mode
  if (calendarView === 'grid') {
    fragment.appendChild(createCalendarGrid(monthData.days, (day) => {
      showDayDetailsSheet(day);
    }));
  } else {
    for (const day of monthData.days) {
      fragment.appendChild(createDayRow(day));
    }
  }

  render(container, fragment as unknown as Node);

  // Auto-scroll to today if visible (list view only)
  if (isCurrentMonth && calendarView === 'list') {
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
