// src/router.ts

export type Route = 'today' | 'calendar' | 'duas' | 'quran' | 'settings';

type RouteCallback = (route: Route) => void;

const ROUTE_MAP: Record<string, Route> = {
  '': 'today',
  'today': 'today',
  'calendar': 'calendar',
  'duas': 'duas',
  'quran': 'quran',
  'settings': 'settings',
};

class Router {
  private listeners = new Set<RouteCallback>();
  private current: Route = 'today';

  init(): void {
    window.addEventListener('hashchange', () => this.handleHash());
    this.handleHash();
  }

  private handleHash(): void {
    const hash = window.location.hash.replace('#/', '').replace('#', '');
    const route = ROUTE_MAP[hash] || 'today';
    if (route !== this.current) {
      this.current = route;
      this.listeners.forEach(fn => fn(route));
    }
  }

  navigate(route: Route): void {
    window.location.hash = `#/${route === 'today' ? '' : route}`;
  }

  getCurrentRoute(): Route {
    return this.current;
  }

  onRouteChange(callback: RouteCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

export const router = new Router();
