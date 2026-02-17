// src/api/client.ts

import { FETCH_TIMEOUT_MS } from '../utils/constants';

/**
 * Fetch with timeout and single retry on timeout/network error
 */
export async function fetchWithRetry(url: string): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return await res.json();
    } catch (err: any) {
      lastError = err;
      // Only retry on timeout/network errors, not on HTTP 4xx/5xx
      if (err.name !== 'AbortError' && !err.message?.includes('fetch')) {
        throw err;
      }
      // Wait briefly before retry
      if (attempt === 0) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }

  throw lastError || new Error('Fetch failed');
}
