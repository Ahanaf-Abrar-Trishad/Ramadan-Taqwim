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
  { id: 'laylatul-qadr', label: 'Laylatul Qadr' },
  { id: 'favorites', label: '♥ Favorites' },
];

let activeTab: TabFilter = 'iftar';

export async function renderDuasPage(container: HTMLElement): Promise<void> {
  const favorites = await getFavorites();
  const fragment = document.createDocumentFragment();

  // Title
  fragment.appendChild(h('h1', { className: 'page-title' }, 'Duas'));

  // Category tabs
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
  fragment.appendChild(tabs);

  // Filter duas
  const duas = duasData as Dua[];
  let filtered: Dua[];
  if (activeTab === 'favorites') {
    filtered = duas.filter(d => favorites.has(d.id));
  } else {
    filtered = duas.filter(d => d.category === activeTab);
  }

  if (filtered.length === 0) {
    const empty = h('div', { className: 'error-state' });
    empty.appendChild(h('div', { className: 'error-icon' }, activeTab === 'favorites' ? '♡' : '🤲'));
    empty.appendChild(h('div', { className: 'error-message' },
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
}
