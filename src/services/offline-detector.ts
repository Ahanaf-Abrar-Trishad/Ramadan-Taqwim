// src/services/offline-detector.ts

type OnlineCallback = (online: boolean) => void;

class OfflineDetector {
  private online = navigator.onLine;
  private listeners = new Set<OnlineCallback>();

  init(): void {
    window.addEventListener('online', () => this.update(true));
    window.addEventListener('offline', () => this.update(false));
  }

  private update(online: boolean): void {
    this.online = online;
    this.listeners.forEach(fn => fn(online));
  }

  isOnline(): boolean {
    return this.online;
  }

  onChange(fn: OnlineCallback): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

export const offlineDetector = new OfflineDetector();
