// src/pages/duas.ts

import type { Dua, DuaCategory } from '../types/dua';
import { getFavorites, toggleFavorite } from '../store/favorites-store';
import { createDuaCard } from '../components/dua-card';
import { h, render } from '../utils/dom';
import duasData from '../data/duas.json';

type TabFilter = DuaCategory | 'favorites';

const TABS: { id: TabFilter; label: string }[] = [
  { id: 'sehri', label: 'Sehri' },
  { id: 'iftar', label: 'Iftar' },
  { id: 'general', label: 'General' },
  { id: 'laylatul-qadr', label: 'Laylat al-Qadr' },
  { id: 'favorites', label: '♥ Favorites' },
];

let activeTab: TabFilter = 'iftar';
let searchQuery = '';

export async function renderDuasPage(container: HTMLElement): Promise<void> {
  const favorites = await getFavorites();
  const fragment = document.createDocumentFragment();

  // Title
  fragment.appendChild(h('h1', { className: 'page-title' }, 'Duas'));

  // Search input
  const searchWrap = h('div', { className: 'dua-search-wrap' });
  const searchInput = h('input', {
    className: 'dua-search',
    type: 'text',
    placeholder: '🔍 Search duas...',
    value: searchQuery,
  }) as HTMLInputElement;
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value;
    renderDuasPage(container);
  });
  searchWrap.appendChild(searchInput);
  fragment.appendChild(searchWrap);

  // Category tabs with fade-edge wrapper
  const tabsWrap = h('div', { className: 'category-tabs-wrap' });
  const tabs = h('div', { className: 'category-tabs', role: 'tablist' });
  for (const tab of TABS) {
    const btn = h('button', {
      className: `category-tab${tab.id === activeTab ? ' active' : ''}`,
      role: 'tab',
      'aria-selected': tab.id === activeTab ? 'true' : 'false',
    }, tab.label);

    btn.addEventListener('click', () => {
      activeTab = tab.id;
      renderDuasPage(container);
    });
    tabs.appendChild(btn);
  }
  tabsWrap.appendChild(tabs);
  fragment.appendChild(tabsWrap);

  // Filter duas
  const duas = duasData as Dua[];
  let filtered: Dua[];
  if (activeTab === 'favorites') {
    filtered = duas.filter(d => favorites.has(d.id));
  } else {
    filtered = duas.filter(d => d.category === activeTab);
  }

  // Apply search filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(d =>
      d.titleEn.toLowerCase().includes(q) ||
      d.transliteration.toLowerCase().includes(q) ||
      d.translationEn.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    const empty = h('div', { className: 'error-state' });
    empty.appendChild(h('div', { className: 'error-icon' }, activeTab === 'favorites' ? '♡' : '🤲'));
    empty.appendChild(h('div', { className: 'error-message' },
      searchQuery ? 'No duas match your search.' :
      activeTab === 'favorites'
        ? 'No favorites yet. Tap the heart on any dua to save it.'
        : 'No duas in this category.'
    ));
    fragment.appendChild(empty);
  } else {
    for (const dua of filtered) {
      fragment.appendChild(createDuaCard(dua, favorites.has(dua.id), async (duaId) => {
        await toggleFavorite(duaId);
        renderDuasPage(container);
      }));
    }
  }

  render(container, fragment as unknown as Node);

  // Restore focus to search if it was active
  if (searchQuery) {
    const input = container.querySelector('.dua-search') as HTMLInputElement;
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }
}
