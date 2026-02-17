// src/components/sehri-iftar-hero.ts

import type { NormalizedPrayers } from '../types/timings';
import { h } from '../utils/dom';

export function createSehriIftarHero(prayers: NormalizedPrayers): HTMLElement {
  const container = h('div', { className: 'hero-container' });

  // Sehri card
  const sehri = h('div', { className: 'hero-card' });
  sehri.appendChild(h('div', { className: 'hero-label' }, 'Sehri Ends'));
  sehri.appendChild(h('div', { className: 'hero-time' }, prayers.SehriEnds));
  sehri.appendChild(h('div', { className: 'hero-sublabel' }, `(${prayers.SehriEndsLabel})`));

  // Iftar card
  const iftar = h('div', { className: 'hero-card' });
  iftar.appendChild(h('div', { className: 'hero-label' }, 'Iftar'));
  iftar.appendChild(h('div', { className: 'hero-time' }, prayers.Iftar));
  iftar.appendChild(h('div', { className: 'hero-sublabel' }, '(Maghrib)'));

  container.appendChild(sehri);
  container.appendChild(iftar);
  return container;
}
