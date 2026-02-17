// src/utils/time.ts

/**
 * Parse "HH:mm" string to total minutes since midnight
 */
export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Parse "HH:mm" string to a Date object for today
 */
export function parseTimeToDate(time: string, date?: Date): Date {
  const base = date ? new Date(date) : new Date();
  const [h, m] = time.split(':').map(Number);
  base.setHours(h, m, 0, 0);
  return base;
}

/**
 * Format milliseconds remaining to "Xh Ym Zs"
 */
export function formatRemaining(ms: number): string {
  if (ms <= 0) return '0m 0s';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Format "HH:mm" (24h) to "h:mm AM/PM"
 */
export function formatTime12h(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Format time string based on user preference
 */
export function formatTime(time: string, format: '12h' | '24h'): string {
  if (format === '12h') return formatTime12h(time);
  return time;
}

/**
 * Get current time as "HH:mm"
 */
export function nowHHmm(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Check if time A is before time B ("HH:mm" strings)
 */
export function isBefore(a: string, b: string): boolean {
  return parseTimeToMinutes(a) < parseTimeToMinutes(b);
}
