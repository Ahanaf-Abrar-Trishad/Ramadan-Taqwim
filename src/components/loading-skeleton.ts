// src/components/loading-skeleton.ts

import { h } from '../utils/dom';

export function createLoadingSkeleton(): HTMLElement {
  const container = h('div', null);

  // Header skeleton
  container.appendChild(h('div', { className: 'skeleton skeleton-line short', style: 'height: 24px;' }));
  container.appendChild(h('div', { className: 'skeleton skeleton-line', style: 'height: 16px; width: 50%; margin-top: 8px;' }));

  // Hero skeleton
  const hero = h('div', { className: 'skeleton-hero' });
  hero.appendChild(h('div', { className: 'skeleton' }));
  hero.appendChild(h('div', { className: 'skeleton' }));
  container.appendChild(hero);

  // Countdown skeleton
  container.appendChild(h('div', { className: 'skeleton skeleton-card', style: 'height: 80px; margin-bottom: 16px;' }));

  // Prayer list skeleton
  for (let i = 0; i < 6; i++) {
    container.appendChild(h('div', { className: 'skeleton skeleton-card' }));
  }

  return container;
}
