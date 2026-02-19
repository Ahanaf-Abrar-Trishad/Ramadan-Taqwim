// src/components/countdown-timer.ts

import type { NextPrayer } from '../types/timings';
import type { SehriIftarCountdown } from '../services/prayer-engine';
import { h } from '../utils/dom';
import { formatTime } from '../utils/time';
import { appStore } from '../app';

export type HeroMode = 'iftar' | 'next-prayer';

/**
 * Single unified countdown hero with toggle
 */
export function createCountdownHero(
  siCountdown: SehriIftarCountdown | null,
  nextPrayer: NextPrayer | null,
  mode: HeroMode,
): HTMLElement {
  const section = h('section', { className: 'countdown-hero', 'aria-live': 'polite' });
  const tf = appStore.getState().settings.timeFormat;

  // Determine what to show based on mode
  const showIftar = mode === 'iftar' && siCountdown;
  const showNext = mode === 'next-prayer' && nextPrayer;

  if (showIftar && siCountdown) {
    section.classList.add(siCountdown.type);
    const icon = siCountdown.type === 'sehri' ? '🌙' : '🌅';
    const label = h('div', { className: 'hero-cd-label' });
    label.innerHTML = `${icon} <span class="hero-cd-type">${siCountdown.label}</span>`;
    section.appendChild(label);

    section.appendChild(h('div', { className: 'hero-cd-time' }, siCountdown.remainingDisplay));
    section.appendChild(h('div', { className: 'hero-cd-starts-at' }, `Ends at ${formatTime(siCountdown.targetTime, tf)}`));
    const barWrap = h('div', { className: 'hero-cd-bar-wrap' });
    const bar = h('div', { className: 'hero-cd-bar' });
    const fill = h('div', { className: `hero-cd-bar-fill ${siCountdown.type}` });
    fill.style.width = `${Math.round(siCountdown.progress * 100)}%`;
    bar.appendChild(fill);
    barWrap.appendChild(bar);

    const barLabels = h('div', { className: 'hero-cd-bar-labels' });
    barLabels.appendChild(h('span', null, formatTime(siCountdown.startTime, tf)));
    barLabels.appendChild(h('span', null, formatTime(siCountdown.targetTime, tf)));
    barWrap.appendChild(barLabels);
    section.appendChild(barWrap);
  } else if (showNext && nextPrayer) {
    section.classList.add('next-prayer');
    const label = h('div', { className: 'hero-cd-label' });
    label.innerHTML = `🕌 <span class="hero-cd-type">Next: ${nextPrayer.name}</span>`;
    section.appendChild(label);

    section.appendChild(h('div', { className: 'hero-cd-time' }, nextPrayer.remainingDisplay));
    section.appendChild(h('div', { className: 'hero-cd-starts-at' }, `Starts at ${formatTime(nextPrayer.time, tf)}`));

    const barWrap = h('div', { className: 'hero-cd-bar-wrap' });
    const bar = h('div', { className: 'hero-cd-bar' });
    const fill = h('div', { className: 'hero-cd-bar-fill gold' });
    fill.style.width = `${Math.round(nextPrayer.progress * 100)}%`;
    bar.appendChild(fill);
    barWrap.appendChild(bar);

    const barLabels = h('div', { className: 'hero-cd-bar-labels' });
    barLabels.appendChild(h('span', null, formatTime(nextPrayer.prevTime, tf)));
    barLabels.appendChild(h('span', null, formatTime(nextPrayer.time, tf)));
    barWrap.appendChild(barLabels);
    section.appendChild(barWrap);
  } else if (siCountdown) {
    // Fallback: show whatever siCountdown we have
    section.classList.add(siCountdown.type);
    const icon = siCountdown.type === 'sehri' ? '🌙' : '🌅';
    section.appendChild(h('div', { className: 'hero-cd-label' }, `${icon} ${siCountdown.label}`));
    section.appendChild(h('div', { className: 'hero-cd-time' }, siCountdown.remainingDisplay));
  } else if (nextPrayer) {
    section.classList.add('next-prayer');
    section.appendChild(h('div', { className: 'hero-cd-label' }, `🕌 Next: ${nextPrayer.name}`));
    section.appendChild(h('div', { className: 'hero-cd-time' }, nextPrayer.remainingDisplay));
  } else {
    section.appendChild(h('div', { className: 'hero-cd-label' }, 'All prayers completed for today'));
  }

  // Toggle pill (only during Ramadan when both views available)
  if (siCountdown && nextPrayer) {
    const toggle = h('div', { className: 'hero-cd-toggle' });
    const iftarBtn = h('button', {
      className: `toggle-pill${mode === 'iftar' ? ' active' : ''}`,
    }, 'Iftar');
    const nextBtn = h('button', {
      className: `toggle-pill${mode === 'next-prayer' ? ' active' : ''}`,
    }, 'Next Prayer');
    toggle.appendChild(iftarBtn);
    toggle.appendChild(nextBtn);
    section.appendChild(toggle);
  }

  return section;
}

/**
 * Update countdown hero in-place
 */
export function updateCountdownHero(
  section: HTMLElement,
  siCountdown: SehriIftarCountdown | null,
  nextPrayer: NextPrayer | null,
  mode: HeroMode,
): void {
  const tf = appStore.getState().settings.timeFormat;

  if (mode === 'iftar' && siCountdown) {
    section.className = `countdown-hero ${siCountdown.type}`;

    const typeEl = section.querySelector('.hero-cd-type');
    if (typeEl) typeEl.textContent = siCountdown.label;

    const timeEl = section.querySelector('.hero-cd-time');
    if (timeEl) timeEl.textContent = siCountdown.remainingDisplay;

    const startsAt = section.querySelector('.hero-cd-starts-at');
    if (startsAt) startsAt.textContent = `Ends at ${formatTime(siCountdown.targetTime, tf)}`;

    const fill = section.querySelector('.hero-cd-bar-fill') as HTMLElement;
    if (fill) {
      fill.style.width = `${Math.round(siCountdown.progress * 100)}%`;
      fill.className = `hero-cd-bar-fill ${siCountdown.type}`;
    }

    const labels = section.querySelectorAll('.hero-cd-bar-labels span');
    if (labels.length === 2) {
      labels[0].textContent = formatTime(siCountdown.startTime, tf);
      labels[1].textContent = formatTime(siCountdown.targetTime, tf);
    }
  } else if (mode === 'next-prayer' && nextPrayer) {
    section.className = 'countdown-hero next-prayer';

    const typeEl = section.querySelector('.hero-cd-type');
    if (typeEl) typeEl.textContent = `Next: ${nextPrayer.name}`;

    const timeEl = section.querySelector('.hero-cd-time');
    if (timeEl) timeEl.textContent = nextPrayer.remainingDisplay;

    const startsAt = section.querySelector('.hero-cd-starts-at');
    if (startsAt) startsAt.textContent = `Starts at ${formatTime(nextPrayer.time, tf)}`;

    const fill = section.querySelector('.hero-cd-bar-fill') as HTMLElement;
    if (fill) {
      fill.style.width = `${Math.round(nextPrayer.progress * 100)}%`;
      fill.className = 'hero-cd-bar-fill gold';
    }

    const labels = section.querySelectorAll('.hero-cd-bar-labels span');
    if (labels.length === 2) {
      labels[0].textContent = formatTime(nextPrayer.prevTime, tf);
      labels[1].textContent = formatTime(nextPrayer.time, tf);
    }
  } else if (!siCountdown && !nextPrayer) {
    const timeEl = section.querySelector('.hero-cd-time');
    if (timeEl) timeEl.textContent = '';
    const labelEl = section.querySelector('.hero-cd-label');
    if (labelEl) labelEl.textContent = 'All prayers completed for today';
  }
}
