// src/app.ts — App State Store + Shell

import type { AppSettings } from './types/settings';
import type { MonthTimings, DayTiming, NextPrayer } from './types/timings';
import type { MethodEntry } from './types/api';

export interface AppState {
  settings: AppSettings;
  currentMonthData: MonthTimings | null;
  otherMonthData: MonthTimings | null;
  todayData: DayTiming | null;
  nextPrayer: NextPrayer | null;
  isOnline: boolean;
  isLoading: boolean;
  error: string | null;
  methods: MethodEntry[] | null;
}

type Listener = (state: AppState) => void;

class Store {
  private state: AppState;
  private listeners = new Set<Listener>();

  constructor(initial: AppState) {
    this.state = initial;
  }

  getState(): AppState {
    return this.state;
  }

  setState(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach(fn => fn(this.state));
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

export let appStore: Store;

export function createStore(initial: AppState): Store {
  appStore = new Store(initial);
  return appStore;
}
