interface AnalyticsSnapshot {
  totals: Record<string, number>;
}

const runtimeSnapshot: AnalyticsSnapshot = { totals: {} };

function readSnapshot(): AnalyticsSnapshot {
  return {
    totals: { ...runtimeSnapshot.totals }
  };
}

function increment(metric: string): number {
  const current = runtimeSnapshot.totals[metric] ?? 0;
  runtimeSnapshot.totals[metric] = current + 1;
  return runtimeSnapshot.totals[metric];
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
