// src/main.ts — Application Entry Point

import type { AppState } from './app';
import { createStore, appStore } from './app';
import { router, type Route } from './router';
import { loadSettings } from './store/settings-store';
import { initDB } from './store/cache-store';
import { loadRamadanMonths } from './services/cache-manager';
import { getMethods } from './api/aladhan';
import { offlineDetector } from './services/offline-detector';
import { createNavBar } from './components/nav-bar';
import { createOfflineBanner } from './components/offline-banner';
import { renderTodayPage, destroyTodayPage, findTodayData } from './pages/today';
import { renderCalendarPage } from './pages/calendar';
import { renderSettingsPage } from './pages/settings';
import { renderDuasPage } from './pages/duas';
import { renderQuranPage } from './pages/quran';
import { $ } from './utils/dom';

async function main() {
  // 1. Load settings (sync)
  const settings = loadSettings();

  // Apply theme
  document.documentElement.setAttribute('data-theme', settings.theme);

  // 2. Initialize store
  const initialState: AppState = {
    settings,
    currentMonthData: null,
    otherMonthData: null,
    todayData: null,
    nextPrayer: null,
    isOnline: navigator.onLine,
    isLoading: true,
    error: null,
    methods: null,
  };

  createStore(initialState);

  // 3. Initialize subsystems
  offlineDetector.init();
  offlineDetector.onChange(online => {
    appStore.setState({ isOnline: online });
  });

  await initDB();

  // 4. Setup DOM
  const appEl = document.getElementById('app')!;
  const mainEl = document.createElement('main');
  mainEl.setAttribute('role', 'main');
  appEl.appendChild(createOfflineBanner());
  appEl.appendChild(mainEl);
  appEl.appendChild(createNavBar());

  // 5. Router setup
  router.onRouteChange((route) => {
    renderPage(route, mainEl);
  });

  // 6. Load data
  try {
    const { current, other } = await loadRamadanMonths(settings);

    appStore.setState({
      currentMonthData: current.data,
      otherMonthData: other?.data || null,
      isLoading: false,
      error: current.source === 'error' ? current.error || 'Failed to load data' : null,
    });

    // Find today
    const todayData = findTodayData();
    appStore.setState({ todayData });
  } catch (err: any) {
    appStore.setState({
      isLoading: false,
      error: err.message || 'Failed to load prayer times',
    });
  }

  // 7. Fetch methods in background
  getMethods()
    .then(methods => appStore.setState({ methods }))
    .catch(() => { /* silently fail */ });

  // 8. Initialize router (triggers first render)
  router.init();

  // If no hash, render today
  if (!window.location.hash || window.location.hash === '#/' || window.location.hash === '#') {
    renderPage('today', mainEl);
  }

  // 9. Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

function renderPage(route: Route, mainEl: HTMLElement): void {
  // Cleanup previous page
  destroyTodayPage();

  switch (route) {
    case 'today':
      renderTodayPage(mainEl);
      break;
    case 'calendar':
      renderCalendarPage(mainEl);
      break;
    case 'settings':
      renderSettingsPage(mainEl);
      break;
    case 'duas':
      renderDuasPage(mainEl);
      break;
    case 'quran':
      renderQuranPage(mainEl);
      break;
  }
}

// Boot
main().catch(console.error);
