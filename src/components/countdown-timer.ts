// src/components/countdown-timer.ts

import type { NextPrayer } from '../types/timings';
import { h } from '../utils/dom';

export function createCountdownSection(nextPrayer: NextPrayer | null): HTMLElement {
  const section = h('section', { className: 'countdown-section', 'aria-live': 'polite' });

  if (!nextPrayer) {
    section.appendChild(h('div', { className: 'countdown-label' }, 'All prayers completed for today'));
    return section;
  }

  const label = h('div', { className: 'countdown-label' });
  label.innerHTML = `NEXT: <span class="countdown-next-name">${nextPrayer.name}</span>`;

  const bar = h('div', { className: 'countdown-bar' });
  const fill = h('div', { className: 'countdown-bar-fill' });
  fill.style.width = `${Math.round(nextPrayer.progress * 100)}%`;
  bar.appendChild(fill);

  const remaining = h('div', { className: 'countdown-remaining' }, nextPrayer.remainingDisplay);

  section.appendChild(label);
  section.appendChild(bar);
  section.appendChild(remaining);

  return section;
}

/**
 * Update an existing countdown section in-place
 */
export function updateCountdown(section: HTMLElement, nextPrayer: NextPrayer | null): void {
  if (!nextPrayer) {
    section.innerHTML = '<div class="countdown-label">All prayers completed for today</div>';
    return;
  }

  const nameEl = section.querySelector('.countdown-next-name');
  if (nameEl) nameEl.textContent = nextPrayer.name;

  const fill = section.querySelector('.countdown-bar-fill') as HTMLElement;
  if (fill) fill.style.width = `${Math.round(nextPrayer.progress * 100)}%`;

  const remaining = section.querySelector('.countdown-remaining');
  if (remaining) remaining.textContent = nextPrayer.remainingDisplay;
}
