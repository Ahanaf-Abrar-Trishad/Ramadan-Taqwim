// src/types/settings.ts

export interface AppSettings {
  city: string;
  cityDisplay: string;
  methodId: number;
  methodName: string;
  school: 0 | 1;
  theme: 'dark' | 'light' | 'system';
  timeFormat: '12h' | '24h';
  lastSaved: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  city: 'dhaka',
  cityDisplay: 'Dhaka',
  methodId: 1,
  methodName: 'University of Islamic Sciences, Karachi',
  school: 1,
  theme: 'dark',
  timeFormat: '12h',
  lastSaved: '',
};
