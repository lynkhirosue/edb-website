import { safeAddEventListener, safeQuerySelector, safeSetLocalStorage } from '../utils/dom-helpers';

const STORAGE_KEY = 'edb-age-confirmed';
const CONFIRMED_VALUE = 'yes';

function initAgeGate(): void {
  const gate = safeQuerySelector<HTMLElement>('#age-gate');
  const dialog = safeQuerySelector<HTMLElement>('.age-gate-dialog');
  const confirmButton = safeQuerySelector<HTMLButtonElement>('#age-gate-confirm');

  if (!gate || !dialog || !confirmButton) {
    return;
  }

  try {
    if (localStorage.getItem(STORAGE_KEY) === CONFIRMED_VALUE) {
      return;
    }
  } catch {
    // Si localStorage est indisponible, on affiche quand même l'avertissement.
  }

  let previousFocus = document.activeElement as HTMLElement | null;

  function closeGate(): void {
    gate.hidden = true;
    gate.classList.remove('is-open');
    document.body.style.overflow = '';
    previousFocus?.focus();
  }

  function trapFocus(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }

    const focusable = dialog.querySelectorAll<HTMLElement>('button, a[href]');
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (!first || !last) {
      return;
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  gate.hidden = false;
  gate.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  confirmButton.focus();

  safeAddEventListener(confirmButton, 'click', () => {
    safeSetLocalStorage(STORAGE_KEY, CONFIRMED_VALUE);
    closeGate();
  });

  document.addEventListener('keydown', (event) => {
    if (gate.hidden) {
      return;
    }

    trapFocus(event);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAgeGate);
} else {
  initAgeGate();
}
