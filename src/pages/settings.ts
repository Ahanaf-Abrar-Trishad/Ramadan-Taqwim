// src/pages/settings.ts

import type { AppSettings } from '../types/settings';
import type { MethodEntry } from '../types/api';
import { appStore } from '../app';
import { loadSettings, saveSettings, buildCacheKey } from '../store/settings-store';
import { loadMonthData, fetchAndStore } from '../services/cache-manager';
import { getMethods } from '../api/aladhan';
import { offlineDetector } from '../services/offline-detector';
import { router } from '../router';
import { h, render } from '../utils/dom';
import { currentYear, currentMonth } from '../utils/date';
import citiesData from '../data/cities.json';

const RECOMMENDED_METHOD_IDS = [1, 3, 5, 2];

export async function renderSettingsPage(container: HTMLElement): Promise<void> {
  const state = appStore.getState();
  const settings = { ...state.settings };

  // Fetch methods if not loaded
  let methods = state.methods;
  if (!methods) {
    try {
      methods = await getMethods();
      appStore.setState({ methods });
    } catch {
      methods = [
        { id: 1, name: 'University of Islamic Sciences, Karachi' },
        { id: 3, name: 'Muslim World League' },
        { id: 5, name: 'Egyptian General Authority of Survey' },
        { id: 2, name: 'Islamic Society of North America (ISNA)' },
      ];
    }
  }

  const fragment = document.createDocumentFragment();

  // Title
  fragment.appendChild(h('h1', { className: 'page-title' }, 'Settings'));

  const form = h('div', { className: 'settings-form' });

  // City picker
  const cityGroup = h('div', { className: 'form-group' });
  cityGroup.appendChild(h('label', { className: 'form-label' }, 'City'));
  const citySelect = h('select', { className: 'form-select', 'aria-label': 'Select city' }) as HTMLSelectElement;
  for (const city of citiesData) {
    const opt = h('option', { value: city.name }) as HTMLOptionElement;
    opt.textContent = city.name;
    if (city.normalized === settings.city) opt.selected = true;
    citySelect.appendChild(opt);
  }
  citySelect.addEventListener('change', () => {
    const selected = citiesData.find(c => c.name === citySelect.value);
    if (selected) {
      settings.city = selected.normalized;
      settings.cityDisplay = selected.name;
    }
  });
  cityGroup.appendChild(citySelect);
  form.appendChild(cityGroup);

  // Method picker
  const methodGroup = h('div', { className: 'form-group' });
  methodGroup.appendChild(h('label', { className: 'form-label' }, 'Calculation Method'));
  const methodSelect = h('select', { className: 'form-select', 'aria-label': 'Select calculation method' }) as HTMLSelectElement;

  // Show recommended first
  const recommended = methods.filter(m => RECOMMENDED_METHOD_IDS.includes(m.id));
  const others = methods.filter(m => !RECOMMENDED_METHOD_IDS.includes(m.id));

  for (const m of recommended) {
    const opt = h('option', { value: String(m.id) }) as HTMLOptionElement;
    opt.textContent = m.id === 1 ? `★ ${m.name} (Recommended)` : m.name;
    if (m.id === settings.methodId) opt.selected = true;
    methodSelect.appendChild(opt);
  }

  if (others.length > 0) {
    const optGroup = h('optgroup', { label: 'Other methods' }) as HTMLOptGroupElement;
    for (const m of others) {
      const opt = h('option', { value: String(m.id) }) as HTMLOptionElement;
      opt.textContent = m.name;
      if (m.id === settings.methodId) opt.selected = true;
      optGroup.appendChild(opt);
    }
    methodSelect.appendChild(optGroup);
  }

  methodSelect.addEventListener('change', () => {
    const id = parseInt(methodSelect.value);
    const method = methods!.find(m => m.id === id);
    if (method) {
      settings.methodId = id;
      settings.methodName = method.name;
    }
  });
  methodGroup.appendChild(methodSelect);
  methodGroup.appendChild(h('div', { className: 'form-hint' }, '★ Recommended for Bangladesh'));
  form.appendChild(methodGroup);

  // School picker
  const schoolGroup = h('div', { className: 'form-group' });
  schoolGroup.appendChild(h('label', { className: 'form-label' }, 'Asr Calculation'));
  const schoolRadios = h('div', { className: 'radio-group' });

  const hanafiLabel = h('label', { className: 'radio-option' });
  const hanafiInput = h('input', { type: 'radio', name: 'school', value: '1' }) as HTMLInputElement;
  if (settings.school === 1) hanafiInput.checked = true;
  hanafiInput.addEventListener('change', () => { settings.school = 1; });
  hanafiLabel.appendChild(hanafiInput);
  hanafiLabel.appendChild(document.createTextNode(' Hanafi (recommended)'));
  schoolRadios.appendChild(hanafiLabel);

  const shafiLabel = h('label', { className: 'radio-option' });
  const shafiInput = h('input', { type: 'radio', name: 'school', value: '0' }) as HTMLInputElement;
  if (settings.school === 0) shafiInput.checked = true;
  shafiInput.addEventListener('change', () => { settings.school = 0; });
  shafiLabel.appendChild(shafiInput);
  shafiLabel.appendChild(document.createTextNode(' Shafi'));
  schoolRadios.appendChild(shafiLabel);

  schoolGroup.appendChild(schoolRadios);
  form.appendChild(schoolGroup);

  // Theme picker
  const themeGroup = h('div', { className: 'form-group' });
  themeGroup.appendChild(h('label', { className: 'form-label' }, 'Theme'));
  const themeRadios = h('div', { className: 'radio-group' });

  const darkLabel = h('label', { className: 'radio-option' });
  const darkInput = h('input', { type: 'radio', name: 'theme', value: 'dark' }) as HTMLInputElement;
  if (settings.theme === 'dark') darkInput.checked = true;
  darkInput.addEventListener('change', () => { settings.theme = 'dark'; });
  darkLabel.appendChild(darkInput);
  darkLabel.appendChild(document.createTextNode(' Dark'));
  themeRadios.appendChild(darkLabel);

  const lightLabel = h('label', { className: 'radio-option' });
  const lightInput = h('input', { type: 'radio', name: 'theme', value: 'light' }) as HTMLInputElement;
  if (settings.theme === 'light') lightInput.checked = true;
  lightInput.addEventListener('change', () => { settings.theme = 'light'; });
  lightLabel.appendChild(lightInput);
  lightLabel.appendChild(document.createTextNode(' Light'));
  themeRadios.appendChild(lightLabel);

  themeGroup.appendChild(themeRadios);
  form.appendChild(themeGroup);

  // Save button
  const saveBtn = h('button', { className: 'btn-save' }, '💾 Save Settings') as HTMLButtonElement;
  if (!offlineDetector.isOnline()) {
    saveBtn.disabled = true;
    saveBtn.title = 'Connect to update';
  }

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    // Save to localStorage
    saveSettings(settings);
    document.documentElement.setAttribute('data-theme', settings.theme);

    // Check if cache key changed
    const y = currentYear();
    const m = currentMonth();
    const oldKey = buildCacheKey(
      state.settings.city, state.settings.methodId, state.settings.school, y, m
    );
    const newKey = buildCacheKey(
      settings.city, settings.methodId, settings.school, y, m
    );

    if (oldKey !== newKey) {
      // Fetch new data
      const result = await fetchAndStore(settings, y, m);
      if (result.data) {
        appStore.setState({
          settings,
          currentMonthData: result.data,
          todayData: result.data.days.find(d => {
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            return d.dateGregorian === `${dd}-${mm}-${today.getFullYear()}`;
          }) || null,
        });
      } else {
        appStore.setState({ settings, error: result.error || null });
      }
    } else {
      appStore.setState({ settings });
    }

    // Show toast
    showToast('Settings saved');
    router.navigate('today');
  });

  form.appendChild(saveBtn);
  fragment.appendChild(form);

  // Footer
  const footer = h('div', { className: 'settings-footer' });
  footer.innerHTML = `
    App version 1.0.0<br>
    Data from <a href="https://aladhan.com" target="_blank" rel="noopener">AlAdhan.com</a>
  `;
  fragment.appendChild(footer);

  render(container, fragment as unknown as Node);
}

function showToast(message: string): void {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = h('div', { className: 'toast' });
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast!.classList.remove('show'), 2000);
}
