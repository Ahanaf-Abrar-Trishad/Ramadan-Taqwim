// src/types/api.ts

export interface AlAdhanCalendarResponse {
  code: number;
  status: string;
  data: AlAdhanDayRaw[];
}

export interface AlAdhanDayRaw {
  timings: Record<string, string>;
  date: {
    readable: string;
    timestamp: string;
    gregorian: {
      date: string;
      format: string;
      day: string;
      weekday: { en: string };
      month: { number: number; en: string };
      year: string;
      designation: { abbreviated: string };
    };
    hijri: {
      date: string;
      format: string;
      day: string;
      weekday: { en: string; ar: string };
      month: { number: number; en: string; ar: string };
      year: string;
      designation: { abbreviated: string };
      holidays: string[];
      adjustedHolidays: string[];
    };
  };
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: {
      id: number;
      name: string;
      params: Record<string, number | string>;
    };
    school: string;
    offset: Record<string, number>;
  };
}

export interface AlAdhanMethodsResponse {
  code: number;
  status: string;
  data: Record<string, {
    id: number;
    name: string;
    params: Record<string, number | string>;
    location?: { latitude: number; longitude: number };
  }>;
}

export interface MethodEntry {
  id: number;
  name: string;
}

export interface CalendarParams {
  city: string;
  year: number;
  month: number;
  methodId: number;
  school: 0 | 1;
}
