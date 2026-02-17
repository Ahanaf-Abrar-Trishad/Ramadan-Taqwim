// src/components/nav-bar.ts

import type { Route } from '../router';
import { router } from '../router';
import { h } from '../utils/dom';

const TABS: { route: Route; icon: string; label: string }[] = [
  { route: 'today', icon: '☪', label: 'Today' },
  { route: 'calendar', icon: '📅', label: 'Calendar' },
  { route: 'duas', icon: '🤲', label: 'Duas' },
  { route: 'quran', icon: '📖', label: 'Quran' },
  { route: 'settings', icon: '⚙', label: 'Settings' },
];

export function createNavBar(): HTMLElement {
  const nav = h('nav', { className: 'nav-bar', role: 'navigation', 'aria-label': 'Main navigation' });

  function render() {
    nav.innerHTML = '';
    const current = router.getCurrentRoute();

    for (const tab of TABS) {
      const btn = h('button', {
        className: `nav-tab${tab.route === current ? ' active' : ''}`,
        'aria-label': tab.label,
        'aria-current': tab.route === current ? 'page' : '',
      });

      const icon = h('span', { className: 'nav-icon', 'aria-hidden': 'true' }, tab.icon);
      const label = h('span', null, tab.label);
      btn.appendChild(icon);
      btn.appendChild(label);

      btn.addEventListener('click', () => router.navigate(tab.route));
      nav.appendChild(btn);
    }
  }

  render();
  router.onRouteChange(() => render());

  return nav;
}
