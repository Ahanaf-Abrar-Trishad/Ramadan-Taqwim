// src/pages/quran.ts

import type { QuranDayPlan } from '../types/quran';
import { getQuranProgress, toggleDay, resetProgress } from '../store/quran-store';
import { createQuranDayCard } from '../components/quran-day-card';
import { appStore } from '../app';
import { h, render } from '../utils/dom';
import planData from '../data/quran-plan.json';

type QuranFilter = 'all' | 'pending' | 'completed';

let activeFilter: QuranFilter = 'all';
let undoTimeout: number | null = null;

function getTodayRamadanDay(): number | null {
  const state = appStore.getState();
  if (state.todayData?.isRamadan && state.todayData.ramadanDay) {
    return state.todayData.ramadanDay;
  }
  if (state.todayData?.isRamadan) {
    return state.todayData.hijriDay;
  }
  return null;
}

function showUndoToast(message: string, onUndo: () => void): void {
  // Clear any existing undo toast
  if (undoTimeout) clearTimeout(undoTimeout);
  const existing = document.querySelector('.undo-toast');
  if (existing) existing.remove();

  const toast = h('div', { className: 'undo-toast show' });
  toast.appendChild(h('span', null, message));
  const undoBtn = h('button', { className: 'undo-btn' }, 'Undo');
  undoBtn.addEventListener('click', () => {
    onUndo();
    toast.remove();
    if (undoTimeout) clearTimeout(undoTimeout);
  });
  toast.appendChild(undoBtn);
  document.body.appendChild(toast);

  undoTimeout = window.setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

export async function renderQuranPage(container: HTMLElement): Promise<void> {
  const progress = await getQuranProgress();
  const completedDays = new Set(progress.completedDays);
  const plan = planData as QuranDayPlan[];
  const todayDay = getTodayRamadanDay();

  const fragment = document.createDocumentFragment();

  // Title row with Go to today
  const titleRow = h('div', { className: 'quran-title-row' });
  titleRow.appendChild(h('h1', { className: 'page-title' }, 'Quran Plan'));
  if (todayDay) {
    const goBtn = h('button', { className: 'calendar-action-btn' }, '📍 Go to today');
    goBtn.addEventListener('click', () => {
      const todayCard = container.querySelector('#quran-today');
      if (todayCard) todayCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    titleRow.appendChild(goBtn);
  }
  fragment.appendChild(titleRow);

  // Progress bar
  const progressSection = h('div', { className: 'quran-progress' });
  const progressText = h('div', { className: 'quran-progress-text' },
    `${completedDays.size}/30 days complete`
  );
  const progressBar = h('div', { className: 'quran-progress-bar' });
  const progressFill = h('div', { className: 'quran-progress-fill' });
  progressFill.style.width = `${(completedDays.size / 30) * 100}%`;
  progressBar.appendChild(progressFill);
  progressSection.appendChild(progressText);
  progressSection.appendChild(progressBar);
  fragment.appendChild(progressSection);

  // Filter tabs
  const filters = h('div', { className: 'quran-filters' });
  const filterOptions: { id: QuranFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
  ];
  for (const f of filterOptions) {
    const btn = h('button', {
      className: `filter-pill${f.id === activeFilter ? ' active' : ''}`,
    }, f.label);
    btn.addEventListener('click', () => {
      activeFilter = f.id;
      renderQuranPage(container);
    });
    filters.appendChild(btn);
  }
  fragment.appendChild(filters);

  // Filter plan
  let filteredPlan = plan;
  if (activeFilter === 'pending') {
    filteredPlan = plan.filter(d => !completedDays.has(d.day));
  } else if (activeFilter === 'completed') {
    filteredPlan = plan.filter(d => completedDays.has(d.day));
  }

  // Day cards
  for (const day of filteredPlan) {
    const isToday = day.day === todayDay;
    fragment.appendChild(createQuranDayCard(day, completedDays.has(day.day), isToday, async (dayNum) => {
      const wasComplete = completedDays.has(dayNum);
      await toggleDay(dayNum);

      // Show undo toast
      showUndoToast(
        wasComplete ? `Day ${dayNum} marked pending` : `Day ${dayNum} completed`,
        async () => {
          await toggleDay(dayNum);
          renderQuranPage(container);
        }
      );

      renderQuranPage(container);
    }));
  }

  if (filteredPlan.length === 0) {
    const empty = h('div', { className: 'error-state' });
    empty.appendChild(h('div', { className: 'error-icon' }, activeFilter === 'completed' ? '📖' : '✅'));
    empty.appendChild(h('div', { className: 'error-message' },
      activeFilter === 'completed' ? 'No completed days yet.' : 'All days completed!'
    ));
    fragment.appendChild(empty);
  }

  // Reset button
  const resetBtn = h('button', { className: 'btn-reset' }, 'Reset Progress');
  resetBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to reset all Quran reading progress?')) {
      await resetProgress();
      renderQuranPage(container);
    }
  });
  fragment.appendChild(resetBtn);

  render(container, fragment as unknown as Node);
}
