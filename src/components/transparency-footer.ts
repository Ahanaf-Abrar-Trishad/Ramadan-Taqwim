// src/components/transparency-footer.ts

import type { AppSettings } from '../types/settings';
import { h } from '../utils/dom';

export function createTransparencyFooter(settings: AppSettings): HTMLElement {
  const schoolName = settings.school === 1 ? 'Hanafi' : 'Shafi';
  const text = `${settings.cityDisplay} · ${settings.methodName.split(',')[0]} · ${schoolName}`;

  return h('div', { className: 'transparency-footer' }, text);
}
