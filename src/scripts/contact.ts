import { safeAddEventListener, safeQuerySelector } from '../utils/dom-helpers';
import { decodeContactValue } from '../utils/contact-obfuscation';

function initContact(): void {
  const alertForm = safeQuerySelector<HTMLFormElement>('#alert-form');
  const submitButton = alertForm?.querySelector<HTMLButtonElement>('.alert-submit');
  const endpoint = decodeContactValue(alertForm?.dataset.endpointToken ?? '');

  if (alertForm && endpoint) {
    try {
      const endpointUrl = new URL(endpoint);
      if (endpointUrl.protocol === 'https:') {
        alertForm.action = endpointUrl.toString();
        submitButton?.removeAttribute('disabled');
      }
    } catch {
      // Le formulaire reste désactivé si sa configuration est invalide.
    }
  }

  safeAddEventListener(alertForm, 'submit', (event) => {
    if (submitButton?.disabled) {
      event.preventDefault();
      return;
    }

    const provider = alertForm?.dataset.provider ?? 'formsubmit';
    (window as Window & {
      edbAnalytics?: { trackEvent: (name: string, label?: string) => void };
    }).edbAnalytics?.trackEvent('alert_signup', provider);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContact);
} else {
  initContact();
}
