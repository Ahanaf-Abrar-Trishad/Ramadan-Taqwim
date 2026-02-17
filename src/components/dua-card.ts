// src/components/dua-card.ts

import type { Dua } from '../types/dua';
import { h } from '../utils/dom';

export function createDuaCard(
  dua: Dua,
  isFavorite: boolean,
  onToggleFavorite: (duaId: string) => void
): HTMLElement {
  const card = h('div', { className: 'dua-card' });

  // Header
  const header = h('div', { className: 'dua-card-header' });
  header.appendChild(h('span', { className: 'dua-card-title' }, dua.titleEn));

  const favBtn = h('button', {
    className: 'dua-fav-btn',
    'aria-label': isFavorite ? 'Remove from favorites' : 'Add to favorites',
  }, isFavorite ? '♥' : '♡');

  favBtn.addEventListener('click', () => {
    onToggleFavorite(dua.id);
  });

  header.appendChild(favBtn);
  card.appendChild(header);

  // Arabic text
  card.appendChild(h('div', {
    className: 'dua-arabic',
    lang: 'ar',
    dir: 'rtl',
  }, dua.arabicText));

  // Transliteration
  card.appendChild(h('div', { className: 'dua-transliteration' }, dua.transliteration));

  // Translation
  card.appendChild(h('div', { className: 'dua-translation' }, dua.translationEn));

  // Source
  card.appendChild(h('div', { className: 'dua-source' }, `📖 ${dua.source}`));

  return card;
}
