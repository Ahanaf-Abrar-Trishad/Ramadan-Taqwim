// src/utils/date.ts

/**
 * Get today's date as DD-MM-YYYY to match AlAdhan format
 */
export function todayDDMMYYYY(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/**
 * Get current Gregorian year
 */
export function currentYear(): number {
  return new Date().getFullYear();
}

/**
 * Get current Gregorian month (1-12)
 */
export function currentMonth(): number {
  return new Date().getMonth() + 1;
}

/**
 * Format a readable Gregorian date from DD-MM-YYYY
 */
export function formatGregorianReadable(ddmmyyyy: string): string {
  const [dd, mm, yyyy] = ddmmyyyy.split('-');
  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${parseInt(dd)} ${months[parseInt(mm)]} ${yyyy}`;
}

/**
 * Get the day of week for DD-MM-YYYY
 */
export function getDayOfWeek(ddmmyyyy: string): string {
  const [dd, mm, yyyy] = ddmmyyyy.split('-').map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Get month name from number (1-12)
 */
export function monthName(month: number): string {
  const names = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return names[month] || '';
}

/**
 * Format today's date as readable string
 */
export function todayReadable(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
