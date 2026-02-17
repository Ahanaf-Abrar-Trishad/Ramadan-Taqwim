// src/components/offline-banner.ts

import { h } from '../utils/dom';
import { offlineDetector } from '../services/offline-detector';

export function createOfflineBanner(): HTMLElement {
  const banner = h('div', { className: 'offline-banner', role: 'alert' },
    'You are offline — showing cached data'
  );

  function update(online: boolean) {
    banner.classList.toggle('show', !online);
  }

  update(offlineDetector.isOnline());
  offlineDetector.onChange(update);

  return banner;
}
