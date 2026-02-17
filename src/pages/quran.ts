// src/pages/quran.ts

import type { QuranDayPlan } from '../types/quran';
import { getQuranProgress, toggleDay, resetProgress } from '../store/quran-store';
import { createQuranDayCard } from '../components/quran-day-card';
import { h, render } from '../utils/dom';
import planData from '../data/quran-plan.json';

export async function renderQuranPage(container: HTMLElement): Promise<void> {
  const progress = await getQuranProgress();
  const completedDays = new Set(progress.completedDays);
  const plan = planData as QuranDayPlan[];

  const fragment = document.createDocumentFragment();

  // Title
  fragment.appendChild(h('h1', { className: 'page-title' }, 'Quran Plan'));

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

  // Day cards
  for (const day of plan) {
    fragment.appendChild(createQuranDayCard(day, completedDays.has(day.day), async (dayNum) => {
      await toggleDay(dayNum);
      renderQuranPage(container);
    }));
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
