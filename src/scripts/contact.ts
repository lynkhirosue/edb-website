import { safeAddEventListener, safeQuerySelector } from '../utils/dom-helpers';

function initContact(): void {
  const emailLink = safeQuerySelector<HTMLAnchorElement>('.js-contact-email');
  const alertForm = safeQuerySelector<HTMLFormElement>('#alert-form');

  safeAddEventListener(emailLink, 'click', () => {
    (window as Window & {
      edbAnalytics?: { trackEvent: (name: string, label?: string) => void };
    }).edbAnalytics?.trackEvent('contact_click', 'email');
  });

  safeAddEventListener(alertForm, 'submit', () => {
    (window as Window & {
      edbAnalytics?: { trackEvent: (name: string, label?: string) => void };
    }).edbAnalytics?.trackEvent('alert_signup', 'formsubmit');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContact);
} else {
  initContact();
}
