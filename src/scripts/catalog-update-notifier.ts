type CatalogRuntimeMeta = {
  url: string;
  generatedAt: string | null;
  pollIntervalMs?: number;
};

type PublicCatalogPing = {
  generatedAt?: string;
};

const META_SCRIPT_ID = 'catalog-runtime-meta';
const BANNER_ID = 'catalog-update-banner';
const DEFAULT_POLL_INTERVAL_MS = 120000;

function readMeta(): CatalogRuntimeMeta | null {
  const el = document.getElementById(META_SCRIPT_ID) as HTMLScriptElement | null;
  if (!el?.textContent) {
    return null;
  }

  try {
    const parsed = JSON.parse(el.textContent) as CatalogRuntimeMeta;
    if (!parsed.url || typeof parsed.url !== 'string') {
      return null;
    }
    return parsed;
  } catch (error) {
    console.warn('Meta catalogue invalide:', error);
    return null;
  }
}

function renderUpdateBanner(onReload: () => void): void {
  if (document.getElementById(BANNER_ID)) {
    return;
  }

  const banner = document.createElement('div');
  banner.id = BANNER_ID;
  banner.setAttribute('role', 'status');
  banner.innerHTML = `
    <span>Une nouvelle version des bières est disponible.</span>
    <button type="button">Rafraichir</button>
  `;

  Object.assign(banner.style, {
    position: 'fixed',
    right: '16px',
    bottom: '16px',
    zIndex: '9999',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(17, 24, 39, 0.95)',
    color: '#f8fafc',
    fontSize: '13px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.35)'
  } as CSSStyleDeclaration);

  const button = banner.querySelector('button');
  if (button) {
    Object.assign(button.style, {
      border: 'none',
      borderRadius: '10px',
      padding: '6px 10px',
      cursor: 'pointer',
      background: '#f59e0b',
      color: '#111827',
      fontWeight: '600'
    } as CSSStyleDeclaration);
    button.addEventListener('click', onReload);
  }

  document.body.appendChild(banner);
}

async function fetchGeneratedAt(url: string): Promise<string | null> {
  try {
    const requestUrl = new URL(url);
    requestUrl.searchParams.set('_rt', String(Date.now()));

    const response = await fetch(requestUrl.toString(), {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache'
      }
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as PublicCatalogPing;
    return typeof json.generatedAt === 'string' ? json.generatedAt : null;
  } catch {
    return null;
  }
}

function initCatalogUpdateNotifier(): void {
  const meta = readMeta();
  if (!meta) {
    return;
  }

  let currentGeneratedAt = meta.generatedAt;
  const pollIntervalMs = Math.max(meta.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS, 30000);

  const checkForUpdate = async () => {
    const latest = await fetchGeneratedAt(meta.url);
    if (!latest) {
      return;
    }

    if (!currentGeneratedAt) {
      currentGeneratedAt = latest;
      return;
    }

    if (latest !== currentGeneratedAt) {
      renderUpdateBanner(() => window.location.reload());
    }
  };

  const timer = window.setInterval(checkForUpdate, pollIntervalMs);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      void checkForUpdate();
    }
  });

  window.addEventListener('beforeunload', () => {
    window.clearInterval(timer);
  });
}

initCatalogUpdateNotifier();
