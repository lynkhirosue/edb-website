import { safeGetLocalStorage, safeSetLocalStorage } from '../utils/dom-helpers';

interface AnalyticsSnapshot {
  totals: Record<string, number>;
}

const STORAGE_KEY = 'edb.analytics.v1';

function readSnapshot(): AnalyticsSnapshot {
  try {
    const raw = safeGetLocalStorage(STORAGE_KEY, '{}');
    const parsed = JSON.parse(raw) as AnalyticsSnapshot;

    if (!parsed || typeof parsed !== 'object' || typeof parsed.totals !== 'object') {
      return { totals: {} };
    }

    return parsed;
  } catch (error) {
    console.error('Erreur analytics (lecture):', error);
    return { totals: {} };
  }
}

function writeSnapshot(snapshot: AnalyticsSnapshot): void {
  safeSetLocalStorage(STORAGE_KEY, JSON.stringify(snapshot));
}

function increment(metric: string): number {
  const snapshot = readSnapshot();
  const current = snapshot.totals[metric] ?? 0;
  snapshot.totals[metric] = current + 1;
  writeSnapshot(snapshot);
  return snapshot.totals[metric];
}

function normalizeMetric(name: string, label?: string): string {
  return label ? `${name}:${label}` : name;
}

export function trackEvent(name: string, label?: string): number {
  const metric = normalizeMetric(name, label);
  const value = increment(metric);

  document.dispatchEvent(
    new CustomEvent('edb:analytics-event', {
      detail: {
        name,
        label,
        value
      }
    })
  );

  return value;
}

export function getAnalyticsSnapshot(): AnalyticsSnapshot {
  return readSnapshot();
}

function initAnalytics(): void {
  trackEvent('page_view', window.location.pathname);

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const source = target?.closest<HTMLElement>('[data-analytics]');

    if (!source) {
      return;
    }

    const name = source.dataset.analytics;
    if (!name) {
      return;
    }

    trackEvent(name, source.dataset.analyticsLabel);
  });

  (window as typeof window & {
    edbAnalytics?: {
      trackEvent: typeof trackEvent;
      snapshot: typeof getAnalyticsSnapshot;
    };
  }).edbAnalytics = {
    trackEvent,
    snapshot: getAnalyticsSnapshot
  };
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAnalytics);
} else {
  initAnalytics();
}
