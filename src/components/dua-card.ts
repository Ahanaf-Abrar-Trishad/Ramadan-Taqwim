// src/components/dua-card.ts

import type { Dua } from '../types/dua';
import { h } from '../utils/dom';

function showCopyToast(message: string): void {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = h('div', { className: 'toast' });
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast!.classList.remove('show'), 2000);
}

export function createDuaCard(
  dua: Dua,
  isFavorite: boolean,
  onToggleFavorite: (duaId: string) => void
): HTMLElement {
  const card = h('div', { className: 'dua-card' });

  // Header
  const header = h('div', { className: 'dua-card-header' });
  header.appendChild(h('span', { className: 'dua-card-title' }, dua.titleEn));
  card.appendChild(header);

  // Arabic text (larger, padded, better readability)
  card.appendChild(h('div', {
    className: 'dua-arabic',
    lang: 'ar',
    dir: 'rtl',
  }, dua.arabicText));

  // Transliteration (not gold italic — normal weight, muted)
  card.appendChild(h('div', { className: 'dua-transliteration' }, dua.transliteration));

  // Translation
  card.appendChild(h('div', { className: 'dua-translation' }, dua.translationEn));

  // Source
  card.appendChild(h('div', { className: 'dua-source' }, `📖 ${dua.source}`));

  // Actions row: Copy Arabic, Copy Translation, Favorite
  const actions = h('div', { className: 'dua-actions' });

  const copyArabicBtn = h('button', { className: 'dua-action-btn', 'aria-label': 'Copy Arabic' }, '📋 Arabic');
  copyArabicBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(dua.arabicText);
      showCopyToast('Arabic text copied');
    } catch {
      showCopyToast('Copy failed');
    }
  });

  const copyTransBtn = h('button', { className: 'dua-action-btn', 'aria-label': 'Copy Translation' }, '📋 English');
  copyTransBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(dua.translationEn);
      showCopyToast('Translation copied');
    } catch {
      showCopyToast('Copy failed');
    }
  });

  const favBtn = h('button', {
    className: `dua-fav-btn${isFavorite ? ' active' : ''}`,
    'aria-label': isFavorite ? 'Remove from favorites' : 'Add to favorites',
  }, isFavorite ? '♥' : '♡');
  favBtn.addEventListener('click', () => onToggleFavorite(dua.id));

  actions.appendChild(copyArabicBtn);
  actions.appendChild(copyTransBtn);
  actions.appendChild(favBtn);
  card.appendChild(actions);

  return card;
}
