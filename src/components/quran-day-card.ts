// src/components/quran-day-card.ts

import type { QuranDayPlan } from '../types/quran';
import { h } from '../utils/dom';

export function createQuranDayCard(
  plan: QuranDayPlan,
  isComplete: boolean,
  isToday: boolean,
  onToggle: (day: number) => void
): HTMLElement {
  let className = 'quran-day-card';
  if (isComplete) className += ' completed';
  if (isToday) className += ' today';

  const card = h('div', {
    className,
    id: isToday ? 'quran-today' : undefined,
  });

  const info = h('div', { className: 'quran-day-info' });
  info.appendChild(h('div', { className: 'quran-day-num' }, `Day ${plan.day} · Juz ${plan.juz}`));
  info.appendChild(h('div', { className: 'quran-day-surah' },
    `${plan.surahStart} ${plan.ayahStart} – ${plan.surahEnd} ${plan.ayahEnd}`
  ));
  info.appendChild(h('div', { className: 'quran-day-pages' }, `Pages ${plan.pages}`));

  const checkbox = h('div', { className: 'quran-checkbox' }, isComplete ? '☑' : '☐');

  card.appendChild(info);
  card.appendChild(checkbox);

  // Entire card tappable
  card.addEventListener('click', () => onToggle(plan.day));

  return card;
}
